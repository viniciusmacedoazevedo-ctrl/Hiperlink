import { AlertCircle, Check, SlidersHorizontal } from 'lucide-react';
import { investment } from '../../data/psgDados';
import { Icon } from '../../components/common/Icon';
import { SectionHeading } from '../../components/common/SectionHeading';
import { TiltCard } from '../../components/common/TiltCard';

export function InvestmentSection() {
  return (
    <section id="investimento" className="section psg-investment" aria-labelledby="investimento-title">
      <div className="container">
        <SectionHeading
          id="investimento-title"
          align="split"
          eyebrow={investment.eyebrow}
          title={
            <>
              Investimento <span className="hl">mensal</span>
            </>
          }
          intro={investment.intro}
        />

        <p className="price-starting" data-reveal>
          <Icon name="info" size={16} />
          {investment.startingNote}
        </p>
        <div className="price-fixed">
          {investment.fixed.map((item, i) => (
            <div key={item.component} data-reveal data-reveal-delay={String(i * 120)}>
              <TiltCard className={`price-card ${i === 0 ? 'is-featured' : ''}`} max={5}>
                <div className="price-card__head">
                  <span className="icon-badge">
                    <Icon name={item.icon} size={22} />
                  </span>
                  <h3>{item.component}</h3>
                </div>
                <p className="price-card__value">
                  {item.pricePrefix && <span className="price-card__prefix">{item.pricePrefix}</span>}
                  <strong>{item.price}</strong>
                  <span className="price-card__period">{item.period}</span>
                </p>
                <p className="price-card__desc">{item.description}</p>
              </TiltCard>
            </div>
          ))}
        </div>

        <div className="price-variable">
          <p className="price-variable__title" data-reveal>
            <SlidersHorizontal size={18} aria-hidden="true" />
            Componentes variáveis — dimensionados conforme o ambiente
          </p>
          <ul className="price-variable__grid">
            {investment.variable.map((item, i) => (
              <li key={item.component} className="variable-card" data-reveal data-reveal-delay={String(i * 90)}>
                <span className="icon-badge">
                  <Icon name={item.icon} size={20} />
                </span>
                <h3>{item.component}</h3>
                <p className="variable-card__value">{investment.variableLabel}</p>
                <p>{item.description}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="investment-bottom">
          <div className="included-list card" data-reveal>
            <h3>{investment.includedTitle}</h3>
            <ul>
              {investment.includedItems.map((it) => (
                <li key={it}>
                  <Check size={16} strokeWidth={2.5} aria-hidden="true" />
                  {it}
                </li>
              ))}
            </ul>
          </div>
          <aside className="important-box" data-reveal data-reveal-delay="120" aria-labelledby="important-title">
            <AlertCircle size={28} aria-hidden="true" />
            <h3 id="important-title">{investment.important.title}</h3>
            <p>{investment.important.text}</p>
          </aside>
        </div>

        <p className="source-note source-note--wide" data-reveal>
          {investment.observation}
        </p>
      </div>
    </section>
  );
}
