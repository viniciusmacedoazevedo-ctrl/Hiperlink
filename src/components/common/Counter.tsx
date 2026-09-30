import { useEffect, useState } from 'react';
import { useInView } from '../../hooks/useInView';
import { prefersReducedMotion } from '../../hooks/useReducedMotion';

interface CounterProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
  /** Formato numérico; use 'en-US' para preservar números como "99.9" exatamente como no material. */
  locale?: string;
}

const format = (n: number, decimals: number, locale: string) =>
  n.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals, useGrouping: false });

/** Número animado ao entrar na viewport. O valor final fica sempre acessível a leitores de tela. */
export function Counter({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  duration = 1600,
  className,
  locale = 'pt-BR',
}: CounterProps) {
  const [ref, inView] = useInView<HTMLSpanElement>({ threshold: 0.6 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (prefersReducedMotion()) {
      setDisplay(value);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 4);
      setDisplay(value * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value, duration]);

  const finalText = `${prefix}${format(value, decimals, locale)}${suffix}`;
  return (
    <span ref={ref} className={className}>
      <span aria-hidden="true">
        {prefix}
        {format(display, decimals, locale)}
        {suffix}
      </span>
      <span className="sr-only">{finalText}</span>
    </span>
  );
}
