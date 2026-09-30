import { principles } from '../../data/hiperlink';
import { Icon } from '../../components/common/Icon';
import { SectionHeading } from '../../components/common/SectionHeading';
import { TiltCard } from '../../components/common/TiltCard';

export function PrinciplesSection() {
  return (
    <section id="principios" className="section section--light hl-principles" aria-labelledby="principios-title">
      <div className="container">
        <SectionHeading
          id="principios-title"
          align="split"
          eyebrow={principles.eyebrow}
          title={
            <>
              Nossos <span className="hl">Princípios</span>
            </>
          }
          intro={principles.intro}
        />
        <div className="principles-grid">
          {principles.items.map((item, i) => (
            <div key={item.title} data-reveal data-reveal-delay={String((i % 2) * 100)}>
              <TiltCard className="card principle-card" max={4}>
                <span className="card-number" aria-hidden="true">
                  0{i + 1}
                </span>
                <span className="icon-badge">
                  <Icon name={item.icon} size={24} />
                </span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </TiltCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
