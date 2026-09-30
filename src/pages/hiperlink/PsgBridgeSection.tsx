import { ArrowRight } from 'lucide-react';
import { psgBridge } from '../../data/hiperlink';
import { Icon } from '../../components/common/Icon';
import { Logo } from '../../components/common/Logo';
import { TiltCard } from '../../components/common/TiltCard';
import { TransitionLink } from '../../components/common/TransitionLink';

/** Conexão entre as duas empresas: da identidade Hiperlink (amarelo) para a PSG Dados (azul). */
export function PsgBridgeSection() {
  return (
    <section id="psg-dados" className="psg-bridge" aria-labelledby="psg-bridge-title">
      <div className="psg-bridge__beam" aria-hidden="true">
        <span />
      </div>
      <div className="psg-bridge__grid" aria-hidden="true" />
      <div className="container psg-bridge__inner">
        <div className="psg-bridge__copy">
          <p className="eyebrow psg-bridge__eyebrow" data-reveal>
            <span className="eyebrow__line" aria-hidden="true" />
            {psgBridge.eyebrow}
          </p>
          <h2 id="psg-bridge-title" className="section-title" data-reveal data-reveal-delay="60">
            {psgBridge.title}
          </h2>
          <p className="psg-bridge__subtitle" data-reveal data-reveal-delay="100">
            {psgBridge.subtitle}
          </p>
          <p className="psg-bridge__text" data-reveal data-reveal-delay="140">
            {psgBridge.text}
          </p>
          <ul className="psg-bridge__highlights" data-reveal data-reveal-delay="180">
            {psgBridge.highlights.map((h) => (
              <li key={h.label}>
                <Icon name={h.icon} size={20} />
                {h.label}
              </li>
            ))}
          </ul>
          <div data-reveal data-reveal-delay="220">
            <TransitionLink href={psgBridge.href} theme="psg" className="btn btn--psg">
              {psgBridge.cta}
              <ArrowRight size={18} aria-hidden="true" />
            </TransitionLink>
          </div>
        </div>

        <div className="psg-bridge__visual" data-reveal="scale" data-reveal-delay="120">
          <TransitionLink
            href={psgBridge.href}
            theme="psg"
            className="psg-bridge__logo-link"
            aria-label="Conheça a PSG Dados"
          >
            <TiltCard as="span" className="psg-bridge__logo-card" max={8}>
              <span className="psg-bridge__rings" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <Logo brand="psg" height={150} className="psg-bridge__plate" />
            </TiltCard>
          </TransitionLink>
        </div>
      </div>
    </section>
  );
}
