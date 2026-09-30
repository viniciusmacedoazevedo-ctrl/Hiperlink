import { AlertTriangle, CheckCircle2, Crown, Image, MessageSquareQuote, Plus, Star, Trash, Users } from 'lucide-react';
import { Icon } from '../../components/common/Icon';
import { api } from '../api';
import { useAuth } from '../auth';
import { Link } from '../router';
import { formatDate, HighlightBadge, StatusBadge } from '../ui';
import { useApi } from '../useApi';

export function Dashboard() {
  const { user, can } = useAuth();
  const { data, error } = useApi(() => api.dashboard(), []);
  if (error) return <p className="adm-alert">{error}</p>;
  if (!data) return <div className="adm-loading" aria-busy="true" aria-label="Carregando" />;
  const { clients: c, testimonials: t } = data;

  const warnings: string[] = [];
  if (!c.featured) warnings.push('Nenhum cliente em super destaque: o card grande da seção de clientes não aparece.');
  else if (c.featured.status !== 'PUBLISHED')
    warnings.push(`O super destaque (${c.featured.name}) não está publicado: o card grande não aparece no site.`);
  if (!t.published) warnings.push('Nenhum depoimento publicado: a seção “Depoimentos” fica oculta no site.');
  if (c.draft) warnings.push(`${c.draft} cliente(s) em rascunho aguardando publicação.`);
  if (t.draft) warnings.push(`${t.draft} depoimento(s) em rascunho aguardando publicação.`);

  return (
    <>
      <div className="adm-page-head">
        <div>
          <h1>Olá, {user.name.split(' ')[0]}</h1>
          <p>Visão geral do conteúdo publicado no site da Hiperlink.</p>
        </div>
        <div className="adm-actions">
          {can('clients.create') && (
            <Link to="/clientes/novo" className="btn btn--primary btn--sm">
              <Plus size={16} aria-hidden="true" /> Novo cliente
            </Link>
          )}
          {can('testimonials.create') && (
            <Link to="/depoimentos/novo" className="btn btn--ghost btn--sm">
              <Plus size={16} aria-hidden="true" /> Novo depoimento
            </Link>
          )}
        </div>
      </div>

      <div className="adm-grid-2 adm-grid-2--top">
        <section className="adm-card" aria-labelledby="ind-clients">
          <h2 id="ind-clients" className="adm-card__title">
            <Users size={18} aria-hidden="true" /> Clientes
          </h2>
          <dl className="adm-kpis">
            <div>
              <dt>Total</dt>
              <dd>{c.total}</dd>
            </div>
            <div>
              <dt>Ativos (publicados)</dt>
              <dd>{c.published ?? 0}</dd>
            </div>
            <div>
              <dt>Destaques</dt>
              <dd>{c.highlights ?? 0}</dd>
            </div>
            <div className="adm-kpis__wide">
              <dt>
                <Crown size={14} aria-hidden="true" /> Super destaque
              </dt>
              <dd className="adm-kpis__text">{c.featured ? c.featured.name : '—'}</dd>
            </div>
          </dl>
        </section>
        <section className="adm-card" aria-labelledby="ind-test">
          <h2 id="ind-test" className="adm-card__title">
            <MessageSquareQuote size={18} aria-hidden="true" /> Depoimentos
          </h2>
          <dl className="adm-kpis">
            <div>
              <dt>Total</dt>
              <dd>{t.total}</dd>
            </div>
            <div>
              <dt>Ativos (publicados)</dt>
              <dd>{t.published ?? 0}</dd>
            </div>
            <div>
              <dt>
                <Star size={14} aria-hidden="true" /> Destaques
              </dt>
              <dd>{t.featured ?? 0}</dd>
            </div>
            <div>
              <dt>
                <Image size={14} aria-hidden="true" /> Arquivos de mídia
              </dt>
              <dd>{data.media}</dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="adm-card adm-mt" aria-labelledby="dash-status">
        <h2 id="dash-status" className="adm-card__title">
          Status geral do conteúdo
        </h2>
        {warnings.length === 0 ? (
          <p className="adm-ok">
            <CheckCircle2 size={18} aria-hidden="true" /> Tudo certo: há super destaque publicado e depoimentos no ar.
          </p>
        ) : (
          <ul className="adm-warnings">
            {warnings.map((w) => (
              <li key={w}>
                <AlertTriangle size={16} aria-hidden="true" /> {w}
              </li>
            ))}
          </ul>
        )}
        {data.trash > 0 && can('clients.restore') && (
          <p className="adm-muted adm-note">
            <Trash size={14} aria-hidden="true" /> {data.trash} item(ns) na lixeira — podem ser restaurados nas listas
            de clientes e depoimentos.
          </p>
        )}
      </section>

      <div className="adm-grid-2">
        <section className="adm-card" aria-labelledby="dash-latest-c">
          <h2 id="dash-latest-c" className="adm-card__title">
            Últimos clientes cadastrados
          </h2>
          {data.latestClients.length === 0 ? (
            <p className="adm-muted">Nenhum cliente.</p>
          ) : (
            <ul className="adm-mini-list">
              {data.latestClients.map((x) => (
                <li key={x.id}>
                  <span className="adm-row__thumb adm-row__thumb--sm">
                    {x.logoUrl ? <img src={x.logoUrl} alt="" /> : <Icon name={x.icon} size={18} />}
                  </span>
                  <span className="adm-mini-list__main">
                    <Link to={`/clientes/${x.id}/editar`}>{x.name}</Link>
                    <small>{formatDate(x.createdAt)}</small>
                  </span>
                  <HighlightBadge value={x.highlightLevel} />
                  <StatusBadge status={x.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="adm-card" aria-labelledby="dash-latest-t">
          <h2 id="dash-latest-t" className="adm-card__title">
            Últimos depoimentos
          </h2>
          {data.latestTestimonials.length === 0 ? (
            <p className="adm-muted">Nenhum depoimento cadastrado ainda.</p>
          ) : (
            <ul className="adm-mini-list">
              {data.latestTestimonials.map((x) => (
                <li key={x.id}>
                  <span className="adm-mini-list__main">
                    <Link to={`/depoimentos/${x.id}/editar`}>
                      {x.personName} — {x.companyName}
                    </Link>
                    <small>{formatDate(x.createdAt)}</small>
                  </span>
                  <StatusBadge status={x.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
