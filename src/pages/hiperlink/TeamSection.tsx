import { CircleCheck } from 'lucide-react';
import { team } from '../../data/hiperlink';
import { Icon } from '../../components/common/Icon';
import { SectionHeading } from '../../components/common/SectionHeading';
import { TiltCard } from '../../components/common/TiltCard';

export function TeamSection() {
  return (
    <section id="equipe" className="section hl-team" aria-labelledby="equipe-title">
      <div className="container">
        <SectionHeading
          id="equipe-title"
          align="split"
          eyebrow={team.eyebrow}
          title={
            <>
              Nossa Equipe <span className="hl">Técnica</span>
            </>
          }
          intro={team.intro}
        />

        <div className="team-layout">
          <div className="levels-visual" data-reveal="scale" aria-hidden="true">
            <div className="levels-visual__scene">
              {[...team.levels].reverse().map((level, i) => (
                <div key={level} className={`level-plate level-plate--${3 - i}`}>
                  <span>{level}</span>
                </div>
              ))}
              <div className="levels-visual__core" />
            </div>
          </div>

          <ul className="team-grid">
            {team.items.map((item, i) => (
              <li key={item.title} data-reveal data-reveal-delay={String((i % 2) * 90)}>
                <TiltCard className="card team-card" max={5}>
                  <span className="icon-badge">
                    <Icon name={item.icon} size={24} />
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                  <span className="team-card__tag">{item.tag}</span>
                </TiltCard>
              </li>
            ))}
          </ul>
        </div>

        <ul className="team-bar" data-reveal>
          {team.highlights.map((h) => (
            <li key={h}>
              <CircleCheck size={22} aria-hidden="true" />
              {h}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
