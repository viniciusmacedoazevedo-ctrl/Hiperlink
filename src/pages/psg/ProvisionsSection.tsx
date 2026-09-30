import { ArrowRight, FileText, Info } from 'lucide-react';
import { normativeSource, provisions, responsibilityNotice } from '../../data/psgDados';
import { SectionHeading } from '../../components/common/SectionHeading';
import { TiltCard } from '../../components/common/TiltCard';

export function ProvisionsSection() {
  const [p213, p243] = provisions.items;
  return (
    <section id="provimentos" className="section psg-provisions" aria-labelledby="provimentos-title">
      <div className="container">
        <SectionHeading
          id="provimentos-title"
          eyebrow={provisions.eyebrow}
          title={
            <>
              O contexto dos <span className="hl">Provimentos CNJ</span>
            </>
          }
        />

        <div className="provisions-docs">
          {[p213, p243].map((p, i) => (
            <div key={p.number} className="provisions-docs__item" data-reveal data-reveal-delay={String(i * 140)}>
              <TiltCard className={`doc-card ${p.status ? 'is-current' : ''}`} max={6}>
                <span className="doc-card__sheet" aria-hidden="true" />
                <span className="doc-card__sheet doc-card__sheet--2" aria-hidden="true" />
                <div className="doc-card__body">
                  <div className="doc-card__top">
                    <FileText size={22} aria-hidden="true" />
                    <span>{p.label}</span>
                    {p.status && <span className="doc-card__status">{p.status}</span>}
                  </div>
                  <h3>
                    <span className="sr-only">{p.label} </span>
                    {p.number}
                  </h3>
                  <p>{p.text}</p>
                </div>
              </TiltCard>
            </div>
          ))}
          <div className="provisions-docs__link" aria-hidden="true">
            <span>alterou</span>
            <ArrowRight size={20} />
          </div>
        </div>

        <div className="provisions-focus" data-reveal>
          <p className="provisions-focus__label">Foco dos padrões mínimos de TIC</p>
          <ul>
            {provisions.focus.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>

        <div className="provisions-req" data-reveal>
          <p className="provisions-req__lead">{provisions.requirementsLead}</p>
          <ul className="provisions-req__list">
            {provisions.requirements.map((r, i) => (
              <li key={r} style={{ ['--i' as string]: i }}>
                {r}
              </li>
            ))}
          </ul>
          <p className="provisions-req__closing">{provisions.closing}</p>
        </div>

        <aside className="notice" data-reveal aria-label="Aviso importante">
          <Info size={22} aria-hidden="true" />
          <p>{responsibilityNotice}</p>
        </aside>
        <p className="source-note">{normativeSource}</p>
      </div>
    </section>
  );
}
