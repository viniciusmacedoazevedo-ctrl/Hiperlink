import { useState } from 'react';
import { ArrowDown, ArrowUp, Pencil, Plus, RotateCcw, Search, Trash } from 'lucide-react';
import { Icon } from '../../components/common/Icon';
import { api, type Client, type HighlightLevel, type Status } from '../api';
import { useAuth } from '../auth';
import { Link } from '../router';
import { errorMessage, formatDate, highlightLabel, statusLabel, useConfirm, useToast } from '../ui';
import { useApi } from '../useApi';

const TABS: { key: string; label: string }[] = [
  { key: '', label: 'Todos' },
  { key: 'PUBLISHED', label: 'Publicados' },
  { key: 'DRAFT', label: 'Rascunhos' },
  { key: 'ARCHIVED', label: 'Arquivados' },
];

export function ClientsList() {
  const { can } = useAuth();
  const toast = useToast();
  const { confirm, dialog } = useConfirm();
  const [tab, setTab] = useState('');
  const [trash, setTrash] = useState(false);
  const [search, setSearch] = useState('');
  const { data, error, reload } = useApi(() => api.clients({ deleted: trash, status: tab || undefined }), [trash, tab]);

  const run = async (fn: () => Promise<unknown>, ok: string) => {
    try {
      await fn();
      await reload();
      toast('ok', ok);
    } catch (e) {
      toast('error', errorMessage(e));
    }
  };
  const list = (data ?? []).filter(
    (c) => !search || `${c.name} ${c.category}`.toLowerCase().includes(search.toLowerCase()),
  );
  const all = data ?? [];

  return (
    <>
      <div className="adm-page-head">
        <div>
          <h1>Clientes</h1>
          <p>Apenas clientes publicados aparecem no site, na ordem definida. Só um cliente pode ser super destaque.</p>
        </div>
        {can('clients.create') && (
          <Link to="/clientes/novo" className="btn btn--primary btn--sm">
            <Plus size={16} aria-hidden="true" /> Novo cliente
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
          {can('clients.restore') && (
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
          <span className="sr-only">Buscar cliente</span>
          <input
            className="adm-input"
            placeholder="Buscar por nome ou categoria"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>

      {error && <p className="adm-alert">{error}</p>}
      {!data ? (
        <div className="adm-loading" aria-busy="true" aria-label="Carregando" />
      ) : list.length === 0 ? (
        <p className="adm-card adm-empty">{trash ? 'A lixeira está vazia.' : 'Nenhum cliente encontrado.'}</p>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table adm-table--logo">
            <thead>
              <tr>
                <th scope="col">Logo</th>
                <th scope="col">Cliente</th>
                <th scope="col">Categoria</th>
                <th scope="col">{trash ? 'Excluído em' : 'Destaque'}</th>
                <th scope="col">Status</th>
                {!trash && <th scope="col">Ordem</th>}
                <th scope="col">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <Row
                  key={c.id}
                  c={c}
                  all={all}
                  trash={trash}
                  search={Boolean(search) || tab !== ''}
                  run={run}
                  confirm={confirm}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
      {dialog}
    </>
  );
}

function Row({
  c,
  all,
  trash,
  search,
  run,
  confirm,
}: {
  c: Client;
  all: Client[];
  trash: boolean;
  search: boolean;
  run: (fn: () => Promise<unknown>, ok: string) => Promise<void>;
  confirm: (text: string, o?: { title?: string; action?: string }) => Promise<boolean>;
}) {
  const { can } = useAuth();
  const featuredOther = all.find((x) => x.highlightLevel === 'FEATURED' && x.id !== c.id);
  const maxOrder = Math.max(...all.map((x) => x.displayOrder));
  return (
    <tr>
      <td data-label="Logo">
        <span className="adm-row__thumb">
          {c.logoUrl ? <img src={c.logoUrl} alt="" /> : <Icon name={c.icon} size={20} />}
        </span>
      </td>
      <td data-label="Cliente">
        <strong>{c.name}</strong>
        <small className="adm-table__sub">/{c.slug}</small>
      </td>
      <td data-label="Categoria">{c.category || <span className="adm-muted">—</span>}</td>
      <td data-label={trash ? 'Excluído em' : 'Destaque'}>
        {trash ? (
          formatDate(c.deletedAt)
        ) : can('clients.highlight') ? (
          <select
            className={`adm-input adm-input--inline adm-select--${c.highlightLevel.toLowerCase()}`}
            aria-label={`Destaque de ${c.name}`}
            value={c.highlightLevel}
            onChange={async (e) => {
              const v = e.target.value as HighlightLevel;
              if (v === 'FEATURED' && featuredOther) {
                const ok = await confirm(
                  `“${featuredOther.name}” deixará de ser super destaque e passará a “Destaque”. Continuar?`,
                  { title: 'Trocar super destaque', action: 'Confirmar' },
                );
                if (!ok) return;
              }
              run(() => api.clientHighlight(c.id, v), `Destaque de “${c.name}”: ${highlightLabel[v]}.`);
            }}
          >
            {(['NORMAL', 'HIGHLIGHT', 'FEATURED'] as HighlightLevel[]).map((h) => (
              <option key={h} value={h}>
                {highlightLabel[h]}
              </option>
            ))}
          </select>
        ) : (
          highlightLabel[c.highlightLevel]
        )}
      </td>
      <td data-label="Status">
        {!trash && can('clients.status') ? (
          <select
            className={`adm-input adm-input--inline adm-select--${c.status.toLowerCase()}`}
            aria-label={`Status de ${c.name}`}
            value={c.status}
            onChange={(e) => {
              const v = e.target.value as Status;
              run(() => api.clientStatus(c.id, v), `“${c.name}”: ${statusLabel[v]}.`);
            }}
          >
            {(['PUBLISHED', 'DRAFT', 'ARCHIVED'] as Status[]).map((s) => (
              <option key={s} value={s}>
                {statusLabel[s]}
              </option>
            ))}
          </select>
        ) : (
          statusLabel[c.status]
        )}
      </td>
      {!trash && (
        <td data-label="Ordem">
          <span className="adm-order-cell">
            <span className="adm-row__order">{c.displayOrder}</span>
            {can('clients.order') && !search && (
              <>
                <button
                  type="button"
                  className="adm-icon-btn adm-icon-btn--sm"
                  aria-label={`Subir ${c.name}`}
                  disabled={c.displayOrder <= 1}
                  onClick={() => run(() => api.clientOrder(c.id, c.displayOrder - 1), 'Ordem atualizada.')}
                >
                  <ArrowUp size={15} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="adm-icon-btn adm-icon-btn--sm"
                  aria-label={`Descer ${c.name}`}
                  disabled={c.displayOrder >= maxOrder}
                  onClick={() => run(() => api.clientOrder(c.id, c.displayOrder + 1), 'Ordem atualizada.')}
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
            onClick={() => run(() => api.restoreClient(c.id), `“${c.name}” restaurado.`)}
          >
            <RotateCcw size={15} aria-hidden="true" /> Restaurar
          </button>
        ) : (
          <>
            {can('clients.update') && (
              <Link to={`/clientes/${c.id}/editar`} className="adm-icon-btn" aria-label={`Editar ${c.name}`}>
                <Pencil size={17} aria-hidden="true" />
              </Link>
            )}
            {can('clients.delete') && (
              <button
                type="button"
                className="adm-icon-btn adm-icon-btn--danger"
                aria-label={`Excluir ${c.name}`}
                onClick={async () => {
                  if (await confirm(`Mover “${c.name}” para a lixeira? Ele sai do site e pode ser restaurado depois.`))
                    run(() => api.deleteClient(c.id), `“${c.name}” movido para a lixeira.`);
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
}
