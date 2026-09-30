import { Pencil, Plus, Trash } from 'lucide-react';
import { Icon } from '../components/common/Icon';
import { api } from './api';
import { useAdminData } from './AdminApp';
import { errorMessage, HighlightBadge, StatusBadge, useConfirm, useToast } from './ui';

export function ClientsList() {
  const { content, reload } = useAdminData();
  const toast = useToast();
  const { confirm, dialog } = useConfirm();
  if (!content) return null;

  const remove = async (id: string, name: string) => {
    if (!(await confirm(`Excluir o cliente “${name}”? Esta ação não pode ser desfeita.`))) return;
    try {
      await api.deleteClient(id);
      await reload();
      toast('ok', 'Cliente excluído.');
    } catch (e) {
      toast('error', errorMessage(e));
    }
  };

  return (
    <>
      <div className="adm-page-head">
        <div>
          <h1>Clientes</h1>
          <p>Os clientes ativos aparecem na seção “Nossos Clientes”, na ordem definida.</p>
        </div>
        <a href="#/clientes/novo" className="btn btn--primary btn--sm">
          <Plus size={16} aria-hidden="true" /> Novo cliente
        </a>
      </div>

      {content.clients.length === 0 ? (
        <p className="adm-card adm-empty">Nenhum cliente cadastrado.</p>
      ) : (
        <ul className="adm-list">
          {content.clients.map((c) => (
            <li key={c.id} className="adm-card adm-row">
              <span className="adm-row__order" title="Ordem de exibição">
                {c.order}
              </span>
              <span className="adm-row__thumb">
                {c.logo ? <img src={c.logo} alt="" /> : <Icon name={c.icon} size={22} />}
              </span>
              <div className="adm-row__main">
                <strong>{c.name}</strong>
                <span className="adm-row__meta">
                  {[c.segment, c.services.join(', ')].filter(Boolean).join(' · ') || 'Sem segmento/serviços informados'}
                </span>
              </div>
              <div className="adm-row__badges">
                <HighlightBadge value={c.highlight} />
                <StatusBadge active={c.active} />
              </div>
              <div className="adm-row__actions">
                <a href={`#/clientes/${c.id}`} className="adm-icon-btn" aria-label={`Editar ${c.name}`}>
                  <Pencil size={17} aria-hidden="true" />
                </a>
                <button
                  type="button"
                  className="adm-icon-btn adm-icon-btn--danger"
                  aria-label={`Excluir ${c.name}`}
                  onClick={() => remove(c.id, c.name)}
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
