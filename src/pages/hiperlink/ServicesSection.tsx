import { useCallback, useState } from 'react';
import { ArrowRight, Plus, Star } from 'lucide-react';
import { services, type Service } from '../../data/hiperlink';
import { Icon } from '../../components/common/Icon';
import { Modal } from '../../components/common/Modal';
import { SectionHeading } from '../../components/common/SectionHeading';
import { TiltCard } from '../../components/common/TiltCard';

interface ServicesSectionProps {
  onShowScope: (id: string) => void;
}

export function ServicesSection({ onShowScope }: ServicesSectionProps) {
  const [selected, setSelected] = useState<Service | null>(null);
  const close = useCallback(() => setSelected(null), []);

  return (
    <section id="servicos" className="section hl-services" aria-labelledby="servicos-title">
      <div className="hl-services__glow" aria-hidden="true" />
      <div className="container">
        <SectionHeading
          id="servicos-title"
          align="split"
          eyebrow={services.eyebrow}
          title={
            <>
              Nossos <span className="hl">Serviços</span>
            </>
          }
          intro={services.intro}
        />

        <ul className="services-grid">
          {services.items.map((s, i) => (
            <li key={s.id} data-reveal data-reveal-delay={String((i % 3) * 90)}>
              <TiltCard
                as="button"
                type="button"
                className="card service-card"
                onClick={() => setSelected(s)}
                aria-haspopup="dialog"
              >
                <span className="service-card__top">
                  <span className="icon-badge">
                    <Icon name={s.icon} size={24} />
                  </span>
                  <span className="service-card__more" aria-hidden="true">
                    <Plus size={18} />
                  </span>
                </span>
                <span className="service-card__title">{s.title}</span>
                <span className="service-card__text">{s.summary}</span>
                <span className="service-card__cta">
                  Ver detalhes <ArrowRight size={16} aria-hidden="true" />
                </span>
              </TiltCard>
            </li>
          ))}
          <li data-reveal data-reveal-delay="180">
            <div className="service-excellence">
              <p className="service-excellence__title">
                <Star size={18} fill="currentColor" aria-hidden="true" />
                {services.excellence.title}
              </p>
              <p className="service-excellence__quote">“{services.excellence.quote}”</p>
              <a href="#escopo" className="text-link">
                Ver escopo técnico <ArrowRight size={16} aria-hidden="true" />
              </a>
            </div>
          </li>
        </ul>
      </div>

      <Modal open={selected !== null} onClose={close} labelledBy="service-modal-title">
        {selected && (
          <div className="service-modal">
            <span className="icon-badge">
              <Icon name={selected.icon} size={26} />
            </span>
            <p className="eyebrow">
              <span className="eyebrow__line" aria-hidden="true" />
              Serviço
            </p>
            <h2 id="service-modal-title">{selected.title}</h2>
            <p className="service-modal__summary">{selected.summary}</p>
            <h3 className="service-modal__label">Escopo técnico</h3>
            <ul className="service-modal__scope">
              {selected.scope.map((item, i) => (
                <li key={item}>
                  <span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="service-modal__actions">
              <a href="#contato" className="btn btn--primary" onClick={() => setSelected(null)}>
                Solicitar proposta <ArrowRight size={18} aria-hidden="true" />
              </a>
              <a
                href="#escopo"
                className="btn btn--ghost"
                onClick={() => {
                  onShowScope(selected.id);
                  setSelected(null);
                }}
              >
                Ver todos os serviços em detalhe
              </a>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
