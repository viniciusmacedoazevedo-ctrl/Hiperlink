import { included } from '../../data/psgDados';
import { Icon } from '../../components/common/Icon';
import { SectionHeading } from '../../components/common/SectionHeading';
import { TiltCard } from '../../components/common/TiltCard';

export function IncludedSection() {
  return (
    <section id="incluido" className="section section--light psg-included" aria-labelledby="incluido-title">
      <div className="container">
        <SectionHeading
          id="incluido-title"
          align="split"
          eyebrow={included.eyebrow}
          title={
            <>
              O que está <span className="hl">incluído</span>
            </>
          }
          intro={included.intro}
        />
        <ul className="included-grid">
          {included.items.map((item, i) => (
            <li key={item.title} data-reveal data-reveal-delay={String((i % 2) * 90)}>
              <TiltCard className="card included-card" max={3}>
                <span className="icon-badge">
                  <Icon name={item.icon} size={22} />
                </span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
                <span className="included-card__num" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </TiltCard>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
