import { ArrowRight } from 'lucide-react';
import { hero } from '../../data/psgDados';
import { Icon } from '../../components/common/Icon';
import { BrandBadge } from '../../components/common/BrandBadge';
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
            <BrandBadge brand="psg" height={100} />
          </div>
          <p className="psg-hero__eyebrow" data-reveal data-reveal-delay="80">
            <span className="psg-hero__badge" aria-hidden="true">
              <Icon name="shieldCheck" size={14} />
            </span>
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

          {/* 1º nível: proteção, backup e continuidade */}
          <ul className="psg-pillars" data-reveal data-reveal-delay="260" aria-label="Solução principal">
            {hero.primaryPillars.map((p) => (
              <li key={p.label}>
                <span className="psg-pillars__icon">
                  <Icon name={p.icon} size={18} />
                </span>
                {p.label}
              </li>
            ))}
          </ul>
          {/* 2º nível: segurança, governança e infraestrutura */}
          <p className="psg-pillars-secondary" data-reveal data-reveal-delay="280">
            {hero.secondaryPillars.map((p, i) => (
              <span key={p}>
                {i > 0 && <i aria-hidden="true">+</i>}
                {p}
              </span>
            ))}
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

          {/* 3º nível: contexto de conformidade */}
          <p className="psg-hero__compliance" data-reveal data-reveal-delay="340">
            <Icon name="scale" size={16} />
            {hero.compliance}
          </p>
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
          {hero.strip.map((s) => (
            <li key={s.label}>
              <span className="psg-strip__icon" aria-hidden="true">
                <Icon name={s.icon} size={18} />
              </span>
              {s.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
