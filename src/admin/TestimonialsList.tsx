import { ArrowDown, ArrowUp, Pencil, Plus, Star, Trash, UserRound } from 'lucide-react';
import { api } from './api';
import { useAdminData } from './AdminApp';
import { errorMessage, StatusBadge, useConfirm, useToast } from './ui';

export function TestimonialsList() {
  const { content, reload } = useAdminData();
  const toast = useToast();
  const { confirm, dialog } = useConfirm();
  if (!content) return null;
  const list = content.testimonials;

  const remove = async (id: string, company: string) => {
    if (!(await confirm(`Excluir o depoimento de “${company}”? Esta ação não pode ser desfeita.`))) return;
    try {
      await api.deleteTestimonial(id);
      await reload();
      toast('ok', 'Depoimento excluído.');
    } catch (e) {
      toast('error', errorMessage(e));
    }
  };

  const move = async (index: number, delta: number) => {
    const ids = list.map((t) => t.id);
    const [item] = ids.splice(index, 1);
    ids.splice(index + delta, 0, item);
    try {
      await api.reorderTestimonials(ids);
      await reload();
    } catch (e) {
      toast('error', errorMessage(e));
    }
  };

  return (
    <>
      <div className="adm-page-head">
        <div>
          <h1>Depoimentos</h1>
          <p>Somente depoimentos ativos aparecem no site. Sem depoimentos ativos, a seção fica oculta.</p>
        </div>
        <a href="#/depoimentos/novo" className="btn btn--primary btn--sm">
          <Plus size={16} aria-hidden="true" /> Novo depoimento
        </a>
      </div>

      {list.length === 0 ? (
        <div className="adm-card adm-empty">
          <p>Nenhum depoimento cadastrado.</p>
          <p className="adm-muted">Cadastre apenas depoimentos reais, autorizados pelos clientes.</p>
        </div>
      ) : (
        <ul className="adm-list">
          {list.map((t, i) => (
            <li key={t.id} className="adm-card adm-row">
              <span className="adm-row__order">{t.order}</span>
              <span className="adm-row__thumb is-round">
                {t.personPhoto ? (
                  <img src={t.personPhoto} alt="" />
                ) : t.companyLogo ? (
                  <img src={t.companyLogo} alt="" />
                ) : (
                  <UserRound size={20} />
                )}
              </span>
              <div className="adm-row__main">
                <strong>
                  {t.company}
                  {t.featured && <Star size={14} fill="currentColor" className="adm-star" aria-label="Destaque" />}
                </strong>
                <span className="adm-row__meta">
                  {[t.personName, t.personRole].filter(Boolean).join(' · ')} — “{t.quote.slice(0, 90)}
                  {t.quote.length > 90 ? '…' : ''}”
                </span>
              </div>
              <div className="adm-row__badges">
                <StatusBadge active={t.active} />
              </div>
              <div className="adm-row__actions">
                <button
                  type="button"
                  className="adm-icon-btn"
                  aria-label="Mover para cima"
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                >
                  <ArrowUp size={17} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="adm-icon-btn"
                  aria-label="Mover para baixo"
                  disabled={i === list.length - 1}
                  onClick={() => move(i, 1)}
                >
                  <ArrowDown size={17} aria-hidden="true" />
                </button>
                <a
                  href={`#/depoimentos/${t.id}`}
                  className="adm-icon-btn"
                  aria-label={`Editar depoimento de ${t.company}`}
                >
                  <Pencil size={17} aria-hidden="true" />
                </a>
                <button
                  type="button"
                  className="adm-icon-btn adm-icon-btn--danger"
                  aria-label={`Excluir depoimento de ${t.company}`}
                  onClick={() => remove(t.id, t.company)}
                >
                  <Trash size={17} aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {dialog}
    </>
  );
}
