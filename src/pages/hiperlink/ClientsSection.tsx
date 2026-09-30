import { Star } from 'lucide-react';
import { clients } from '../../data/hiperlink';
import { Counter } from '../../components/common/Counter';
import { Icon } from '../../components/common/Icon';
import { SectionHeading } from '../../components/common/SectionHeading';

export function ClientsSection() {
  const { featured } = clients;
  return (
    <section id="clientes" className="section section--light hl-clients" aria-labelledby="clientes-title">
      <div className="container">
        <SectionHeading
          id="clientes-title"
          align="split"
          eyebrow={clients.eyebrow}
          title={
            <>
              Nossos <span className="hl">Clientes</span>
            </>
          }
          intro={clients.intro}
        />

        <div className="clients-layout">
          <div className="clients-aside">
            <article className="featured-client" data-reveal="left">
              <div className="featured-client__orb" aria-hidden="true" />
              <p className="featured-client__label">{featured.label}</p>
              <h3>{featured.name}</h3>
              <p>{featured.text}</p>
              <ul className="featured-client__tags" aria-label="Áreas atendidas">
                {featured.tags.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </article>

            <dl className="clients-stats">
              {clients.stats.map((s, i) => (
                <div key={s.label} className="clients-stat" data-reveal data-reveal-delay={String(100 + i * 100)}>
                  <dt>{s.label}</dt>
                  <dd>
                    <Counter value={s.value} prefix={s.prefix} suffix={s.suffix} />
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <ul className="clients-grid" aria-label="Clientes atendidos">
            {clients.items.map((c, i) => (
              <li
                key={c.name}
                className={`client-tile ${c.featured ? 'is-featured' : ''}`}
                data-reveal
                data-reveal-delay={String((i % 3) * 70 + Math.floor(i / 3) * 60)}
              >
                {c.featured && (
                  <Star className="client-tile__star" size={16} fill="currentColor" aria-label="Cliente destaque" />
                )}
                {c.logo ? (
                  <img src={c.logo} alt={`Logo ${c.name}`} className="client-tile__logo" loading="lazy" />
                ) : (
                  <span className="client-tile__icon">
                    <Icon name={c.icon} size={30} />
                  </span>
                )}
                <span className="client-tile__name">{c.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
