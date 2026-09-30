import { differentials } from '../../data/hiperlink';
import { Icon } from '../../components/common/Icon';
import { SectionHeading } from '../../components/common/SectionHeading';
import { TiltCard } from '../../components/common/TiltCard';

export function DifferentialsSection() {
  return (
    <section id="diferenciais" className="section hl-differentials" aria-labelledby="diferenciais-title">
      <div className="container">
        <SectionHeading
          id="diferenciais-title"
          align="split"
          eyebrow={differentials.eyebrow}
          title={
            <>
              Diferenciais <span className="hl">Competitivos</span>
            </>
          }
          intro={differentials.intro}
        />
        <ul className="differentials-grid">
          {differentials.items.map((d, i) => (
            <li key={d.title} data-reveal data-reveal-delay={String((i % 3) * 90)}>
              <TiltCard className="card differential-card" max={5}>
                <span className="card-number" aria-hidden="true">
                  0{i + 1}
                </span>
                <span className="differential-card__icon">
                  <Icon name={d.icon} size={22} />
                </span>
                <h3>{d.title}</h3>
                <p>{d.text}</p>
              </TiltCard>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
