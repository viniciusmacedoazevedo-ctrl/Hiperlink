import { ArrowRight } from 'lucide-react';
import { hero } from '../../data/psgDados';
import { Icon } from '../../components/common/Icon';
import { Logo } from '../../components/common/Logo';
import { WebGLStage } from '../../components/common/WebGLStage';
import { useParallax } from '../../hooks/useParallax';

const loadScene = () => import('../../components/three/psgScene');

export function PsgHeroSection() {
  const floatRef = useParallax<HTMLDivElement>(0.08);
  const [before, after] = hero.title.split(hero.titleHighlight);
  return (
    <section id="topo" className="psg-hero" aria-labelledby="psg-hero-title">
      <div className="psg-hero__aurora" aria-hidden="true" />
      <div className="psg-hex" aria-hidden="true" />

      <div className="container psg-hero__inner">
        <div className="psg-hero__copy">
          <div className="psg-hero__logo" data-reveal>
            <Logo brand="psg" height={92} eager />
          </div>
          <p className="psg-hero__eyebrow" data-reveal data-reveal-delay="80">
            <span className="psg-hero__badge">CNJ</span>
            {hero.eyebrow}
          </p>
          <h1 id="psg-hero-title" className="psg-hero__title" data-reveal data-reveal-delay="140">
            {before}
            <span className="grad">{hero.titleHighlight}</span>
            {after}
          </h1>
          <p className="psg-hero__subtitle" data-reveal data-reveal-delay="220">
            {hero.subtitle}
          </p>
          <div className="psg-hero__ctas" data-reveal data-reveal-delay="300">
            <a href={hero.primaryCta.href} className="btn btn--primary">
              {hero.primaryCta.label}
              <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a href={hero.secondaryCta.href} className="btn btn--ghost">
              {hero.secondaryCta.label}
            </a>
          </div>
        </div>

        <div className="psg-hero__visual" data-reveal="scale" data-reveal-delay="200">
          <WebGLStage
            load={loadScene}
            label="Ilustração 3D de um escudo protegendo um banco de dados, com nuvem e cadeado representando backup seguro"
            fallback={<div className="psg-hero__fallback" />}
          />
          <div className="psg-hero__floats" ref={floatRef} aria-hidden="true">
            {hero.offerings.map((o, i) => (
              <div key={o.label} className={`float-chip glass float-chip--${i + 1}`}>
                <span className="float-chip__icon">
                  <Icon name={o.icon} size={18} />
                </span>
                {o.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container">
        <ul className="psg-strip" data-reveal data-reveal-delay="380" aria-label="Diferenciais da contratação">
          {hero.strip.map((s, i) => (
            <li key={s}>
              <span className="psg-strip__num" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              {s}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
