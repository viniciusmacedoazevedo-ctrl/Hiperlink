import { useRef, type ElementType, type HTMLAttributes, type PointerEvent, type ReactNode } from 'react';
import { prefersReducedMotion } from '../../hooks/useReducedMotion';

interface TiltCardProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  children: ReactNode;
  /** Inclinação máxima em graus. */
  max?: number;
  /** Repassado quando as="button". */
  type?: 'button' | 'submit';
}

/**
 * Card com profundidade: leve inclinação 3D e luz que segue o ponteiro.
 * Desativado para toque e para prefers-reduced-motion (fica apenas o hover estático do CSS).
 */
export function TiltCard({ as: Tag = 'article', children, className = '', max = 6, ...rest }: TiltCardProps) {
  const ref = useRef<HTMLElement | null>(null);
  const frame = useRef(0);

  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse' || prefersReducedMotion()) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
      el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
      el.style.setProperty('--rx', `${((0.5 - y) * max).toFixed(2)}deg`);
      el.style.setProperty('--ry', `${((x - 0.5) * max).toFixed(2)}deg`);
    });
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(frame.current);
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  };

  return (
    <Tag ref={ref} className={`tilt ${className}`} onPointerMove={onMove} onPointerLeave={onLeave} {...rest}>
      <span className="tilt__glare" aria-hidden="true" />
      {children}
    </Tag>
  );
}
