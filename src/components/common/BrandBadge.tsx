import { Logo } from './Logo';
import { TiltCard } from './TiltCard';

interface BrandBadgeProps {
  brand: 'hiperlink' | 'psg';
  /** Altura do logo (px). */
  height: number;
}

/**
 * Apresentação principal do logo no hero, sem fundo: o logo flutua sobre o
 * ambiente com brilho discreto na cor da marca, trilhas de circuito e leve
 * profundidade que acompanha o cursor. O desenho do logo não é alterado.
 */
export function BrandBadge({ brand, height }: BrandBadgeProps) {
  return (
    <div className={`brand-badge brand-badge--${brand}`}>
      <span className="brand-badge__glow" aria-hidden="true" />
      <svg className="brand-badge__traces" viewBox="0 0 220 120" aria-hidden="true" preserveAspectRatio="none">
        <path d="M0 30 H60 L80 12 H220" />
        <path d="M0 92 H40 L62 108 H150 L170 90 H220" />
        <circle className="brand-badge__node" r="3" cx="80" cy="12" />
        <circle className="brand-badge__node" r="3" cx="170" cy="90" />
        <circle className="brand-badge__pulse" r="2.6">
          <animateMotion dur="3.6s" repeatCount="indefinite" path="M0 30 H60 L80 12 H220" />
        </circle>
        <circle className="brand-badge__pulse" r="2.6">
          <animateMotion dur="4.4s" begin="1.2s" repeatCount="indefinite" path="M0 92 H40 L62 108 H150 L170 90 H220" />
        </circle>
      </svg>
      <TiltCard as="div" className="brand-badge__card" max={8}>
        <Logo brand={brand} height={height} eager className="brand-badge__logo" />
        <span className="brand-badge__corner brand-badge__corner--tl" aria-hidden="true" />
        <span className="brand-badge__corner brand-badge__corner--br" aria-hidden="true" />
      </TiltCard>
    </div>
  );
}
