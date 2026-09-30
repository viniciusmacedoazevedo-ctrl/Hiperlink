import { Crown, MessageSquareQuote, Plus, Star, Users } from 'lucide-react';
import { useAdminData } from './AdminApp';

export function Dashboard() {
  const { content } = useAdminData();
  if (!content) return null;
  const { clients, testimonials } = content;
  const superClient = clients.find((c) => c.highlight === 'super');
  const stats = [
    { label: 'Clientes', value: clients.length, icon: Users },
    { label: 'Clientes ativos', value: clients.filter((c) => c.active).length, icon: Users },
    { label: 'Clientes em destaque', value: clients.filter((c) => c.highlight !== 'normal').length, icon: Star },
    { label: 'Depoimentos', value: testimonials.length, icon: MessageSquareQuote },
    { label: 'Depoimentos ativos', value: testimonials.filter((t) => t.active).length, icon: MessageSquareQuote },
  ];

  return (
    <>
      <div className="adm-page-head">
        <div>
          <h1>Dashboard</h1>
          <p>Visão geral do conteúdo publicado no site da Hiperlink.</p>
        </div>
      </div>

      <ul className="adm-stats">
        {stats.map(({ label, value, icon: Ic }) => (
          <li key={label} className="adm-card adm-stat">
            <Ic size={20} aria-hidden="true" />
            <strong>{value}</strong>
            <span>{label}</span>
          </li>
        ))}
      </ul>

      <div className="adm-grid-2">
        <section className="adm-card" aria-labelledby="dash-super">
          <h2 id="dash-super" className="adm-card__title">
            <Crown size={18} aria-hidden="true" /> Super destaque atual
          </h2>
          {superClient ? (
            <p className="adm-dash-super">
              <strong>{superClient.name}</strong>
              {!superClient.active && <span className="adm-badge adm-badge--off">Inativo — não aparece no site</span>}
            </p>
          ) : (
            <p className="adm-muted">Nenhum cliente definido como super destaque. O card grande não será exibido.</p>
          )}
          <a href="#/configuracoes" className="adm-link">
            Alterar destaques e ordem →
          </a>
        </section>

        <section className="adm-card" aria-labelledby="dash-actions">
          <h2 id="dash-actions" className="adm-card__title">
            Ações rápidas
          </h2>
          <div className="adm-actions">
            <a href="#/clientes/novo" className="btn btn--primary btn--sm">
              <Plus size={16} aria-hidden="true" /> Novo cliente
            </a>
            <a href="#/depoimentos/novo" className="btn btn--ghost btn--sm">
              <Plus size={16} aria-hidden="true" /> Novo depoimento
            </a>
          </div>
          {testimonials.filter((t) => t.active).length === 0 && (
            <p className="adm-muted adm-note">Sem depoimentos ativos, a seção “Depoimentos” fica oculta no site.</p>
          )}
        </section>
      </div>
    </>
  );
}
