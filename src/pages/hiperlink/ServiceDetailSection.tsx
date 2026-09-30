import { useRef, type KeyboardEvent } from 'react';
import { BadgeCheck, Check } from 'lucide-react';
import { serviceDetail, services } from '../../data/hiperlink';
import { Icon } from '../../components/common/Icon';
import { SectionHeading } from '../../components/common/SectionHeading';

interface ServiceDetailSectionProps {
  active: string;
  onChange: (id: string) => void;
}

export function ServiceDetailSection({ active, onChange }: ServiceDetailSectionProps) {
  const tabsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const items = services.items;
  const current = items.find((s) => s.id === active) ?? items[0];

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const keys: Record<string, number> = {
      ArrowDown: index + 1,
      ArrowRight: index + 1,
      ArrowUp: index - 1,
      ArrowLeft: index - 1,
      Home: 0,
      End: items.length - 1,
    };
    if (!(e.key in keys)) return;
    e.preventDefault();
    const next = (keys[e.key] + items.length) % items.length;
    onChange(items[next].id);
    tabsRef.current[next]?.focus();
  };

  return (
    <section id="escopo" className="section hl-detail" aria-labelledby="escopo-title">
      <div className="container">
        <SectionHeading
          id="escopo-title"
          align="split"
          eyebrow={serviceDetail.eyebrow}
          title={
            <>
              Nossos Serviços <span className="hl">em Detalhe</span>
            </>
          }
          intro={serviceDetail.intro}
        />

        <div className="detail-layout">
          <div className="detail-tabs" role="tablist" aria-label="Serviços" aria-orientation="vertical" data-reveal>
            {items.map((s, i) => {
              const selected = s.id === current.id;
              return (
                <button
                  key={s.id}
                  ref={(el) => {
                    tabsRef.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`tab-${s.id}`}
                  aria-selected={selected}
                  aria-controls={`panel-${s.id}`}
                  tabIndex={selected ? 0 : -1}
                  className={`detail-tab ${selected ? 'is-active' : ''}`}
                  onClick={() => onChange(s.id)}
                  onKeyDown={(e) => onKeyDown(e, i)}
                >
                  <span className="detail-tab__icon">
                    <Icon name={s.icon} size={20} />
                  </span>
                  <span className="detail-tab__label">{s.title}</span>
                  <span className="detail-tab__index" aria-hidden="true">
                    0{i + 1}
                  </span>
                </button>
              );
            })}
          </div>

          <div
            className="detail-panel card"
            role="tabpanel"
            id={`panel-${current.id}`}
            aria-labelledby={`tab-${current.id}`}
            tabIndex={0}
            data-reveal
            data-reveal-delay="100"
          >
            <div className="detail-panel__content" key={current.id}>
              <div className="detail-panel__head">
                <span className="icon-badge">
                  <Icon name={current.icon} size={26} />
                </span>
                <div>
                  <h3>{current.title}</h3>
                  <p>{current.summary}</p>
                </div>
              </div>
              <ul className="detail-modules">
                {current.scope.map((item, i) => (
                  <li key={item} style={{ ['--i' as string]: i }}>
                    <span className="detail-modules__num" aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="detail-modules__label">{item}</span>
                    <Check size={18} className="detail-modules__check" aria-hidden="true" />
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <aside className="quality-card" data-reveal data-reveal-delay="200" aria-labelledby="quality-title">
            <BadgeCheck size={34} className="quality-card__icon" aria-hidden="true" />
            <h3 id="quality-title">{serviceDetail.quality.title}</h3>
            <p>{serviceDetail.quality.text}</p>
            <ul className="quality-card__tags" aria-label="Metodologias">
              {serviceDetail.quality.frameworks.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}
