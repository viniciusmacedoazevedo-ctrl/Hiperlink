import { Check } from 'lucide-react';
import { guidelines } from '../../data/hiperlink';
import { Icon } from '../../components/common/Icon';
import { SectionHeading } from '../../components/common/SectionHeading';
import { TiltCard } from '../../components/common/TiltCard';

export function GuidelinesSection() {
  const { mission, vision, values } = guidelines;
  return (
    <section id="diretrizes" className="section hl-guidelines" aria-labelledby="diretrizes-title">
      <div className="grid-bg" aria-hidden="true" />
      <div className="container">
        <SectionHeading
          id="diretrizes-title"
          eyebrow={guidelines.eyebrow}
          title={
            <>
              Missão, Visão <span className="hl">&amp;</span> Valores
            </>
          }
        />
        <div className="mvv-grid">
          {[mission, vision].map((item, i) => (
            <div key={item.title} data-reveal data-reveal-delay={String(i * 100)}>
              <TiltCard className="card mvv-card">
                <span className="card-number" aria-hidden="true">
                  0{i + 1}
                </span>
                <span className="icon-badge icon-badge--round">
                  <Icon name={item.icon} size={24} />
                </span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <span className="mvv-card__tag">{item.tag}</span>
              </TiltCard>
            </div>
          ))}
          <div data-reveal data-reveal-delay="200">
            <TiltCard className="card mvv-card">
              <span className="card-number" aria-hidden="true">
                03
              </span>
              <span className="icon-badge icon-badge--round">
                <Icon name={values.icon} size={24} />
              </span>
              <h3>{values.title}</h3>
              <ul className="mvv-card__values">
                {values.items.map((v) => (
                  <li key={v}>
                    <Check size={16} strokeWidth={2.5} aria-hidden="true" />
                    {v}
                  </li>
                ))}
              </ul>
              <span className="mvv-card__tag">{values.tag}</span>
            </TiltCard>
          </div>
        </div>
      </div>
    </section>
  );
}
