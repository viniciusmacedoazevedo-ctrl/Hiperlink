import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from './useReducedMotion';

/**
 * Parallax sutil: escreve --parallax (px) no elemento conforme a rolagem.
 * O CSS decide como usar a variável (ex.: translate3d(0, var(--parallax), 0)).
 */
export function useParallax<T extends HTMLElement>(speed = 0.12) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    let frame = 0;
    let visible = false;

    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2 - window.innerHeight / 2;
      el.style.setProperty('--parallax', `${(-center * speed).toFixed(1)}px`);
    };
    const onScroll = () => {
      if (visible && !frame) frame = requestAnimationFrame(update);
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) onScroll();
    });
    io.observe(el);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [speed]);

  return ref;
}
