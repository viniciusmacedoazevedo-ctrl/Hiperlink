import { useState } from 'react';
import { ArrowDown, ArrowUp, Pencil, Plus, RotateCcw, Search, Star, Trash, UserRound } from 'lucide-react';
import { api, type Status, type Testimonial } from '../api';
import { useAuth } from '../auth';
import { Link } from '../router';
import { errorMessage, formatDate, statusLabel, useConfirm, useToast } from '../ui';
import { useApi } from '../useApi';

const TABS = [
  { key: '', label: 'Todos' },
  { key: 'PUBLISHED', label: 'Publicados' },
  { key: 'DRAFT', label: 'Rascunhos' },
  { key: 'ARCHIVED', label: 'Arquivados' },
];

export function TestimonialsList() {
  const { can } = useAuth();
  const toast = useToast();
  const { confirm, dialog } = useConfirm();
  const [tab, setTab] = useState('');
  const [trash, setTrash] = useState(false);
  const [search, setSearch] = useState('');
  const { data, error, reload } = useApi(
    () => api.testimonials({ deleted: trash, status: tab || undefined }),
    [trash, tab],
  );
  const run = async (fn: () => Promise<unknown>, ok: string) => {
    try {
      await fn();
      await reload();
      toast('ok', ok);
    } catch (e) {
      toast('error', errorMessage(e));
    }
  };
  const all = data ?? [];
  const list = all.filter(
    (t) => !search || `${t.companyName} ${t.personName}`.toLowerCase().includes(search.toLowerCase()),
  );
  const canReorder = can('testimonials.order') && !search && !tab && !trash;
  const maxOrder = Math.max(0, ...all.map((t) => t.displayOrder));

  return (
    <>
      <div className="adm-page-head">
        <div>
          <h1>Depoimentos</h1>
          <p>Somente depoimentos publicados aparecem no site. Sem nenhum publicado, a seção fica oculta.</p>
        </div>
        {can('testimonials.create') && (
          <Link to="/depoimentos/novo" className="btn btn--primary btn--sm">
            <Plus size={16} aria-hidden="true" /> Novo depoimento
          </Link>
        )}
      </div>

      <div className="adm-toolbar">
        <div className="adm-tabs" role="tablist" aria-label="Filtrar por status">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={!trash && tab === t.key}
              className={!trash && tab === t.key ? 'is-active' : undefined}
              onClick={() => {
                setTrash(false);
                setTab(t.key);
              }}
            >
              {t.label}
            </button>
          ))}
          {can('testimonials.restore') && (
            <button
              type="button"
              role="tab"
              aria-selected={trash}
              className={trash ? 'is-active' : undefined}
              onClick={() => setTrash(true)}
            >
              <Trash size={14} aria-hidden="true" /> Lixeira
            </button>
          )}
        </div>
        <label className="adm-search">
          <Search size={16} aria-hidden="true" />
          <span className="sr-only">Buscar depoimento</span>
          <input
            className="adm-input"
            placeholder="Buscar por empresa ou pessoa"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>

      {error && <p className="adm-alert">{error}</p>}
      {!data ? (
        <div className="adm-loading" aria-busy="true" aria-label="Carregando" />
      ) : list.length === 0 ? (
        <div className="adm-card adm-empty">
          <p>{trash ? 'A lixeira está vazia.' : 'Nenhum depoimento encontrado.'}</p>
          {!trash && <p className="adm-muted">Cadastre apenas depoimentos reais, autorizados pelos clientes.</p>}
        </div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th scope="col">Empresa</th>
                <th scope="col">Pessoa</th>
                <th scope="col">Cargo</th>
                <th scope="col">{trash ? 'Excluído em' : 'Status'}</th>
                <th scope="col">Destaque</th>
                {!trash && <th scope="col">Ordem</th>}
                <th scope="col">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {list.map((t: Testimonial) => {
                const logo = t.companyLogoUrl || t.clientLogoUrl;
                return (
                  <tr key={t.id}>
                    <td data-label="Empresa">
                      <span className="adm-cell-with-thumb">
                        <span className="adm-row__thumb adm-row__thumb--sm">
                          {logo ? <img src={logo} alt="" /> : <UserRound size={16} />}
                        </span>
                        <span>
                          <strong>{t.companyName}</strong>
                          {t.clientName && <small className="adm-table__sub">Cliente: {t.clientName}</small>}
                        </span>
                      </span>
                    </td>
                    <td data-label="Pessoa">{t.personName}</td>
                    <td data-label="Cargo">{t.personRole || <span className="adm-muted">—</span>}</td>
                    <td data-label={trash ? 'Excluído em' : 'Status'}>
                      {trash ? (
                        formatDate(t.deletedAt)
                      ) : can('testimonials.status') ? (
                        <select
                          className={`adm-input adm-input--inline adm-select--${t.status.toLowerCase()}`}
                          aria-label={`Status do depoimento de ${t.personName}`}
                          value={t.status}
                          onChange={(e) => {
                            const v = e.target.value as Status;
                            run(() => api.testimonialStatus(t.id, v), `Depoimento: ${statusLabel[v]}.`);
                          }}
                        >
                          {(['PUBLISHED', 'DRAFT', 'ARCHIVED'] as Status[]).map((s) => (
                            <option key={s} value={s}>
                              {statusLabel[s]}
                            </option>
                          ))}
                        </select>
                      ) : (
                        statusLabel[t.status]
                      )}
                    </td>
                    <td data-label="Destaque">
                      {!trash && can('testimonials.featured') ? (
                        <button
                          type="button"
                          className={`adm-star-btn ${t.featured ? 'is-on' : ''}`}
                          aria-pressed={t.featured}
                          aria-label={`Destacar depoimento de ${t.personName}`}
                          onClick={() =>
                            run(
                              () => api.testimonialFeatured(t.id, !t.featured),
                              t.featured ? 'Destaque removido.' : 'Depoimento destacado.',
                            )
                          }
                        >
                          <Star size={16} fill={t.featured ? 'currentColor' : 'none'} aria-hidden="true" />{' '}
                          {t.featured ? 'Sim' : 'Não'}
                        </button>
                      ) : t.featured ? (
                        'Sim'
                      ) : (
                        'Não'
                      )}
                    </td>
                    {!trash && (
                      <td data-label="Ordem">
                        <span className="adm-order-cell">
                          <span className="adm-row__order">{t.displayOrder}</span>
                          {canReorder && (
                            <>
                              <button
                                type="button"
                                className="adm-icon-btn adm-icon-btn--sm"
                                aria-label="Subir"
                                disabled={t.displayOrder <= 1}
                                onClick={() =>
                                  run(() => api.testimonialOrder(t.id, t.displayOrder - 1), 'Ordem atualizada.')
                                }
                              >
                                <ArrowUp size={15} aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                className="adm-icon-btn adm-icon-btn--sm"
                                aria-label="Descer"
                                disabled={t.displayOrder >= maxOrder}
                                onClick={() =>
                                  run(() => api.testimonialOrder(t.id, t.displayOrder + 1), 'Ordem atualizada.')
                                }
                              >
                                <ArrowDown size={15} aria-hidden="true" />
                              </button>
                            </>
                          )}
                        </span>
                      </td>
                    )}
                    <td data-label="Ações" className="adm-table__actions">
                      {trash ? (
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          onClick={() => run(() => api.restoreTestimonial(t.id), 'Depoimento restaurado.')}
                        >
                          <RotateCcw size={15} aria-hidden="true" /> Restaurar
                        </button>
                      ) : (
                        <>
                          {can('testimonials.update') && (
                            <Link
                              to={`/depoimentos/${t.id}/editar`}
                              className="adm-icon-btn"
                              aria-label={`Editar depoimento de ${t.personName}`}
                            >
                              <Pencil size={17} aria-hidden="true" />
                            </Link>
                          )}
                          {can('testimonials.delete') && (
                            <button
                              type="button"
                              className="adm-icon-btn adm-icon-btn--danger"
                              aria-label={`Excluir depoimento de ${t.personName}`}
                              onClick={async () => {
                                if (await confirm(`Mover o depoimento de “${t.personName}” para a lixeira?`))
                                  run(() => api.deleteTestimonial(t.id), 'Depoimento movido para a lixeira.');
                              }}
                            >
                              <Trash size={17} aria-hidden="true" />
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {dialog}
    </>
  );
}
