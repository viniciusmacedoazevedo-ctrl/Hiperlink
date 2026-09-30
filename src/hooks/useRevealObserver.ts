import { useEffect } from 'react';

/**
 * Observa todos os elementos com [data-reveal] e adiciona a classe "is-visible"
 * quando entram na viewport. Um único IntersectionObserver por página.
 * O atraso opcional vem de data-reveal-delay (ms).
 */
export function useRevealObserver() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('js-reveal');
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          const delay = el.dataset.revealDelay;
          if (delay) el.style.transitionDelay = `${delay}ms`;
          el.classList.add('is-visible');
          io.unobserve(el);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}
