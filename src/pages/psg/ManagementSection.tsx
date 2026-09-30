import { management } from '../../data/psgDados';
import { Icon } from '../../components/common/Icon';
import { Logo } from '../../components/common/Logo';

/** Diagrama radial: todos os componentes da gestão conectados a um único núcleo. */
export function ManagementSection() {
  const n = management.nodes.length;
  return (
    <section id="gestao" className="section psg-management" aria-labelledby="gestao-title">
      <div className="container psg-management__inner">
        <div className="psg-management__copy">
          <p className="eyebrow" data-reveal>
            <span className="eyebrow__line" aria-hidden="true" />
            Gestão completa
          </p>
          <h2 id="gestao-title" className="section-title" data-reveal data-reveal-delay="60">
            Da adequação à <span className="hl">operação contínua</span>
          </h2>
          <p className="section-intro" data-reveal data-reveal-delay="120">
            {management.text}
          </p>

          <div className="single-contract glass" data-reveal data-reveal-delay="180">
            <ul className="single-contract__chips" aria-label="Modelo de contratação">
              {management.single.title.split(' • ').map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <p>{management.single.text}</p>
            <p className="single-contract__note">{management.single.note}</p>
          </div>
        </div>

        <div className="hub-wrap">
          <div className="hub" data-reveal="scale" data-reveal-delay="120">
            <svg className="hub__lines" viewBox="-100 -100 200 200" aria-hidden="true">
              <circle r="90" className="hub__orbit" />
              <circle r="46" className="hub__orbit hub__orbit--inner" />
              {management.nodes.map((node, i) => {
                const a = ((-90 + (i * 360) / n) * Math.PI) / 180;
                return (
                  <line
                    key={node.label}
                    x1={0}
                    y1={0}
                    x2={(Math.cos(a) * 90).toFixed(2)}
                    y2={(Math.sin(a) * 90).toFixed(2)}
                    className="hub__spoke"
                    style={{ animationDelay: `${i * -0.35}s` }}
                  />
                );
              })}
            </svg>
            <div className="hub__core">
              <span className="hub__pulse" aria-hidden="true" />
              <Logo brand="psg" height={64} />
            </div>
            <ul className="hub__nodes" aria-label="Componentes da gestão">
              {management.nodes.map((node, i) => (
                <li
                  key={node.label}
                  className="hub__node"
                  style={{ ['--a' as string]: `${-90 + (i * 360) / n}deg`, ['--i' as string]: i }}
                >
                  <span className="hub__node-inner">
                    <Icon name={node.icon} size={20} />
                    <span>{node.label}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
