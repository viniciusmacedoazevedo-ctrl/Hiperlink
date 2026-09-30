import { Crown, Star } from 'lucide-react';
import { clients as texts } from '../../data/hiperlink';
import type { PublicClient } from '../../data/siteContent';
import { usePublicClients } from '../../hooks/useSiteContent';
import { Counter } from '../../components/common/Counter';
import { Icon } from '../../components/common/Icon';
import { SectionHeading } from '../../components/common/SectionHeading';

type Level = 'super' | 'destaque' | 'normal';

/**
 * Seção de clientes montada a partir da API pública, que já entrega a estrutura pronta:
 * - featured   → SUPER DESTAQUE: card grande (um único cliente);
 * - highlights → DESTAQUE: cards da grade com apresentação diferenciada;
 * - normal     → cards da grade.
 */
export function ClientsSection() {
  const data = usePublicClients();
  const superClient = data?.featured ?? null;
  const grid: { client: PublicClient; level: Level }[] | null = data
    ? [
        ...(data.featured ? [{ client: data.featured, level: 'super' as const }] : []),
        ...data.highlights.map((client) => ({ client, level: 'destaque' as const })),
        ...data.normal.map((client) => ({ client, level: 'normal' as const })),
      ]
    : null;

  if (grid && grid.length === 0) return null;

  return (
    <section id="clientes" className="section section--light hl-clients" aria-labelledby="clientes-title">
      <div className="container">
        <SectionHeading
          id="clientes-title"
          align="split"
          eyebrow={texts.eyebrow}
          title={
            <>
              Nossos <span className="hl">Clientes</span>
            </>
          }
          intro={texts.intro}
        />

        <div className={`clients-layout ${superClient ? '' : 'clients-layout--no-super'}`}>
          <div className="clients-aside">
            {superClient && <SuperClientCard client={superClient} />}

            <dl className="clients-stats">
              {texts.stats.map((s, i) => (
                <div key={s.label} className="clients-stat" data-reveal data-reveal-delay={String(100 + i * 100)}>
                  <dt>{s.label}</dt>
                  <dd>
                    <Counter value={s.value} prefix={s.prefix} suffix={s.suffix} />
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <ul className="clients-grid" aria-label="Clientes atendidos" aria-busy={grid === null}>
            {grid === null
              ? Array.from({ length: 9 }, (_, i) => (
                  <li key={i} className="client-tile client-tile--skeleton" aria-hidden="true" />
                ))
              : grid.map(({ client, level }, i) => (
                  <ClientTile key={client.id} client={client} level={level} index={i} />
                ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function SuperClientCard({ client }: { client: PublicClient }) {
  const text = client.caseText || client.description;
  return (
    <article className="featured-client" data-reveal="left">
      <div className="featured-client__orb" aria-hidden="true" />
      <div className="featured-client__top">
        <p className="featured-client__label">{texts.featuredLabel}</p>
        {client.logo && (
          <span className="featured-client__logo">
            <img src={client.logo} alt={`Logo ${client.name}`} loading="lazy" />
          </span>
        )}
      </div>
      <h3>{client.name}</h3>
      {client.category && <p className="featured-client__segment">{client.category}</p>}
      {text && <p>{text}</p>}
      {client.services.length > 0 && (
        <ul className="featured-client__tags" aria-label="Serviços prestados">
          {client.services.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      )}
    </article>
  );
}

function ClientTile({ client: c, level, index: i }: { client: PublicClient; level: Level; index: number }) {
  return (
    <li
      className={`client-tile client-tile--${level}`}
      data-reveal
      data-reveal-delay={String((i % 3) * 70 + Math.min(Math.floor(i / 3), 3) * 60)}
      title={c.description || undefined}
    >
      {level === 'super' && <Crown className="client-tile__star" size={16} aria-label="Cliente em super destaque" />}
      {level === 'destaque' && (
        <Star className="client-tile__star" size={16} fill="currentColor" aria-label="Cliente em destaque" />
      )}
      {c.logo ? (
        <span className="client-tile__logo-wrap">
          <img src={c.logo} alt={`Logo ${c.name}`} className="client-tile__logo" loading="lazy" />
        </span>
      ) : (
        <span className="client-tile__icon">
          <Icon name={c.icon} size={30} />
        </span>
      )}
      <span className="client-tile__name">{c.name}</span>
      {c.category && <span className="client-tile__segment">{c.category}</span>}
    </li>
  );
}
