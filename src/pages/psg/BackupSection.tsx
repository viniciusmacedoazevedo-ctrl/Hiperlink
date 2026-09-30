import { backup } from '../../data/psgDados';
import { Icon } from '../../components/common/Icon';
import { useParallax } from '../../hooks/useParallax';

export function BackupSection() {
  const sceneRef = useParallax<HTMLDivElement>(0.05);
  return (
    <section id="backup" className="section psg-backup" aria-labelledby="backup-title">
      <div className="container psg-backup__inner">
        <div className="backup-visual" ref={sceneRef} data-reveal="scale" aria-hidden="true">
          <div className="backup-visual__scene">
            <div className="bk-cloud">
              <div className="bk-cloud__shape">
                <Icon name="cloudUpload" size={46} />
              </div>
              <span className="bk-cloud__label">Armazenamento externo</span>
            </div>

            <div className="bk-flow">
              <span className="bk-tag bk-tag--up">Backup</span>
              <svg className="bk-paths" viewBox="0 0 200 160" preserveAspectRatio="none">
                <path className="bk-path bk-path--up" d="M70 160 C 40 110, 50 50, 85 0" />
                <path className="bk-path bk-path--down" d="M115 0 C 150 50, 160 110, 130 160" />
              </svg>
              <span className="bk-tag bk-tag--down">Restauração</span>
            </div>

            <div className="bk-server">
              {[0, 1, 2].map((i) => (
                <div key={i} className="bk-server__unit">
                  <i />
                  <i />
                  <i />
                </div>
              ))}
            </div>
            <div className="bk-floor" />
          </div>
        </div>

        <div className="psg-backup__copy">
          <p className="eyebrow" data-reveal>
            <span className="eyebrow__line" aria-hidden="true" />
            {backup.product}
          </p>
          <h2 id="backup-title" className="section-title" data-reveal data-reveal-delay="60">
            Backup e <span className="hl">recuperação</span>
          </h2>
          <p className="psg-backup__banner" data-reveal data-reveal-delay="100">
            <Icon name="cloudUpload" size={20} />
            {backup.bannerLine}
          </p>
          <p className="section-intro" data-reveal data-reveal-delay="140">
            {backup.text}
          </p>

          <ol className="backup-flow" data-reveal data-reveal-delay="180">
            {backup.flow.map((f, i) => (
              <li key={f.label} style={{ ['--i' as string]: i }}>
                <span className="backup-flow__icon">
                  <Icon name={f.icon} size={20} />
                </span>
                {f.label}
              </li>
            ))}
          </ol>

          <div className="backup-sizing" data-reveal data-reveal-delay="220">
            <p className="backup-sizing__lead">{backup.sizingLead}</p>
            <ul>
              {backup.sizing.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>

          <ul className="backup-related" data-reveal data-reveal-delay="260">
            {backup.related.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
