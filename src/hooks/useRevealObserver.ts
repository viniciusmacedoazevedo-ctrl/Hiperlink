import { useEffect } from 'react';

/**
 * Observa todos os elementos com [data-reveal] e adiciona a classe "is-visible"
 * quando entram na viewport. Um único IntersectionObserver por página.
 * Elementos inseridos depois (ex.: conteúdo carregado da API) também são observados.
 * O atraso opcional vem de data-reveal-delay (ms).
 */
export function useRevealObserver() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('js-reveal');
    const selector = '[data-reveal]:not(.is-visible)';

    if (!('IntersectionObserver' in window)) {
      const showAll = () =>
        document.querySelectorAll<HTMLElement>(selector).forEach((el) => el.classList.add('is-visible'));
      showAll();
      const mo = new MutationObserver(showAll);
      mo.observe(document.body, { childList: true, subtree: true });
      return () => mo.disconnect();
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
    const observeAll = (scope: ParentNode) => {
      if (scope instanceof HTMLElement && scope.matches(selector)) io.observe(scope);
      scope.querySelectorAll<HTMLElement>(selector).forEach((el) => io.observe(el));
    };
    observeAll(document);

    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) m.addedNodes.forEach((n) => n instanceof HTMLElement && observeAll(n));
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
}
