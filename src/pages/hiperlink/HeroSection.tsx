import { ArrowRight } from 'lucide-react';
import { hero } from '../../data/hiperlink';
import { Icon } from '../../components/common/Icon';
import { BrandBadge } from '../../components/common/BrandBadge';
import { WebGLStage } from '../../components/common/WebGLStage';
import { useParallax } from '../../hooks/useParallax';

const loadScene = () => import('../../components/three/hiperlinkScene');

export function HeroSection() {
  const floatRef = useParallax<HTMLDivElement>(0.08);

  return (
    <section id="topo" className="hl-hero" aria-labelledby="hero-title">
      <div className="grid-bg" aria-hidden="true" />
      <div className="hl-hero__glow hl-hero__glow--a" aria-hidden="true" />
      <div className="hl-hero__glow hl-hero__glow--b" aria-hidden="true" />

      <div className="container hl-hero__inner">
        <div className="hl-hero__copy">
          <div className="hl-hero__logo" data-reveal>
            <BrandBadge brand="hiperlink" height={74} />
          </div>

          <p className="hl-hero__eyebrow" data-reveal data-reveal-delay="80">
            <span className="pulse-dot" aria-hidden="true" />
            {hero.eyebrow}
          </p>

          <h1 id="hero-title" className="hl-hero__title" data-reveal data-reveal-delay="140">
            {hero.titleLines.map((line) => (
              <span key={line} className="hl-hero__line">
                {line}{' '}
              </span>
            ))}
            <span className="hl-hero__highlight">{hero.titleHighlight}</span>
          </h1>

          <p className="hl-hero__subtitle" data-reveal data-reveal-delay="220">
            {hero.subtitle}
          </p>

          <div className="hl-hero__ctas" data-reveal data-reveal-delay="300">
            <a href={hero.primaryCta.href} className="btn btn--primary">
              {hero.primaryCta.label}
              <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a href={hero.secondaryCta.href} className="btn btn--ghost">
              {hero.secondaryCta.label}
            </a>
          </div>

          <ul className="hl-hero__pillars" data-reveal data-reveal-delay="380" aria-label="Áreas de atuação">
            {hero.pillars.map((p) => (
              <li key={p.label}>
                <span className="hl-hero__pillar-icon">
                  <Icon name={p.icon} size={18} />
                </span>
                {p.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="hl-hero__visual" data-reveal="scale" data-reveal-delay="200">
          <WebGLStage
            load={loadScene}
            label="Ilustração 3D de uma torre de servidores conectada a uma rede de dados"
            fallback={<div className="hl-hero__fallback" />}
          />
          <div className="hl-hero__floats" ref={floatRef} aria-hidden="true">
            <div className="float-card glass float-card--a">
              <strong>20+</strong>
              <span>Anos de inovação</span>
            </div>
            <div className="float-card glass float-card--b">
              <span className="float-card__icon">
                <Icon name="headset" size={18} />
              </span>
              <span>Suporte Níveis I, II e III</span>
            </div>
            <div className="float-card glass float-card--c">
              <span className="float-card__icon">
                <Icon name="network" size={18} />
              </span>
              <span>Infraestrutura & Monitoramento</span>
            </div>
          </div>
        </div>
      </div>

      <a href="#sobre" className="scroll-cue" aria-label="Rolar para a seção Sobre a Hiperlink">
        <span className="scroll-cue__mouse" aria-hidden="true" />
      </a>
    </section>
  );
}
