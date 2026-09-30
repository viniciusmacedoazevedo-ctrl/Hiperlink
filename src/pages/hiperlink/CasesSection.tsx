import { cases } from '../../data/hiperlink';
import { Counter } from '../../components/common/Counter';
import { Icon } from '../../components/common/Icon';
import { SectionHeading } from '../../components/common/SectionHeading';
import { TiltCard } from '../../components/common/TiltCard';

export function CasesSection() {
  return (
    <section id="cases" className="section hl-cases" aria-labelledby="cases-title">
      <div className="grid-bg" aria-hidden="true" />
      <div className="container">
        <SectionHeading
          id="cases-title"
          eyebrow={cases.eyebrow}
          title={
            <>
              Cases de <span className="hl">Sucesso</span>
            </>
          }
          intro={cases.intro}
        />
        <ul className="cases-grid">
          {cases.items.map((c, i) => (
            <li key={c.title} data-reveal data-reveal-delay={String(i * 110)}>
              <TiltCard className="case-card" max={4}>
                <div className="case-card__head">
                  <span className="case-card__icon">
                    <Icon name={c.icon} size={26} />
                  </span>
                  <h3>{c.title}</h3>
                  <p className="case-card__category">{c.category}</p>
                  <span className="case-card__orb" aria-hidden="true" />
                </div>
                <dl className="case-card__body">
                  <div>
                    <dt>Desafio</dt>
                    <dd>{c.challenge}</dd>
                  </div>
                  <div>
                    <dt>Solução</dt>
                    <dd>{c.solution}</dd>
                  </div>
                </dl>
                <div className="case-card__result">
                  <strong>
                    {c.result.number ? (
                      <Counter
                        value={c.result.number.value}
                        decimals={c.result.number.decimals}
                        prefix={c.result.number.prefix}
                        suffix={c.result.number.suffix}
                        locale="en-US"
                      />
                    ) : (
                      c.result.headline
                    )}
                  </strong>
                  <span>{c.result.label}</span>
                </div>
              </TiltCard>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
