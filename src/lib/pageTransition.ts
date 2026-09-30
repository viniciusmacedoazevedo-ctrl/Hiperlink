import { prefersReducedMotion } from '../hooks/useReducedMotion';

/**
 * Transição elegante entre as páginas Hiperlink e PSG Dados.
 * As páginas são documentos separados (melhor para SEO); a transição usa uma
 * cortina animada: expande na página de origem e se recolhe na página de destino.
 */
export type TransitionTheme = 'psg' | 'hiperlink';

const KEY = 'page-transition';
const DURATION = 700;

function createOverlay(theme: TransitionTheme) {
  const el = document.createElement('div');
  el.className = `page-transition page-transition--${theme}`;
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = '<span class="page-transition__glow"></span>';
  document.body.appendChild(el);
  return el;
}

export function navigateWithTransition(href: string, theme: TransitionTheme, origin?: { x: number; y: number }) {
  if (prefersReducedMotion()) {
    window.location.assign(href);
    return;
  }
  const overlay = createOverlay(theme);
  const x = origin?.x ?? window.innerWidth / 2;
  const y = origin?.y ?? window.innerHeight / 2;
  overlay.style.setProperty('--ox', `${x}px`);
  overlay.style.setProperty('--oy', `${y}px`);
  // força o layout antes de ativar a animação
  void overlay.offsetWidth;
  overlay.classList.add('is-entering');
  try {
    sessionStorage.setItem(KEY, theme);
  } catch {
    /* armazenamento indisponível: segue sem a animação de chegada */
  }
  window.setTimeout(() => window.location.assign(href), DURATION);
}

/** Executado no carregamento de cada página: recolhe a cortina, se houver. */
export function playArrivalTransition() {
  let theme: string | null = null;
  try {
    theme = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
  } catch {
    theme = null;
  }

  // Ao voltar pelo histórico (bfcache), remove cortinas que ficaram na página.
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) document.querySelectorAll('.page-transition').forEach((el) => el.remove());
  });

  if ((theme !== 'psg' && theme !== 'hiperlink') || prefersReducedMotion()) return;
  const overlay = createOverlay(theme);
  overlay.classList.add('is-covering');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.classList.add('is-leaving');
      window.setTimeout(() => overlay.remove(), DURATION + 100);
    });
  });
}
