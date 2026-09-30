import { Logo } from './Logo';
import { TiltCard } from './TiltCard';

interface BrandBadgeProps {
  brand: 'hiperlink' | 'psg';
  /** Altura do logo (px). */
  height: number;
}

/**
 * Apresentação principal do logo no hero: uma lâmina 3D de superfície clara
 * (necessária para a legibilidade das letras escuras do logo), com borda luminosa,
 * brilho discreto, trilhas de circuito e inclinação que acompanha o cursor.
 * O desenho do logo não é alterado.
 */
export function BrandBadge({ brand, height }: BrandBadgeProps) {
  return (
    <div className={`brand-badge brand-badge--${brand}`}>
      <span className="brand-badge__glow" aria-hidden="true" />
      <svg className="brand-badge__traces" viewBox="0 0 220 120" aria-hidden="true" preserveAspectRatio="none">
        <path d="M0 30 H60 L80 12 H220" />
        <path d="M0 92 H40 L62 108 H150 L170 90 H220" />
        <circle className="brand-badge__node" r="3" cx="80" cy="12" />
        <circle className="brand-badge__node brand-badge__node--2" r="3" cx="170" cy="90" />
        <circle className="brand-badge__pulse" r="2.6">
          <animateMotion dur="3.6s" repeatCount="indefinite" path="M0 30 H60 L80 12 H220" />
        </circle>
        <circle className="brand-badge__pulse" r="2.6">
          <animateMotion dur="4.4s" begin="1.2s" repeatCount="indefinite" path="M0 92 H40 L62 108 H150 L170 90 H220" />
        </circle>
      </svg>
      <TiltCard as="div" className="brand-badge__card" max={9}>
        <span className="brand-badge__frame" aria-hidden="true" />
        <span className="brand-badge__surface">
          <Logo brand={brand} height={height} plate={false} transparent eager />
          <span className="brand-badge__sheen" aria-hidden="true" />
        </span>
        <span className="brand-badge__corner brand-badge__corner--tl" aria-hidden="true" />
        <span className="brand-badge__corner brand-badge__corner--br" aria-hidden="true" />
      </TiltCard>
    </div>
  );
}
