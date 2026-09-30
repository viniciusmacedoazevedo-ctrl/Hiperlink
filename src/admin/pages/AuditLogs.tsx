import { useEffect, useState } from 'react';
import { api, type AuditEntry } from '../api';
import { errorMessage, formatDate, highlightLabel, statusLabel } from '../ui';

const ACTIONS: Record<string, string> = {
  CREATE: 'criou',
  UPDATE: 'alterou',
  DELETE: 'excluiu',
  RESTORE: 'restaurou',
  STATUS: 'alterou o status de',
  HIGHLIGHT: 'alterou o destaque de',
  FEATURED: 'alterou o destaque de',
  ORDER: 'alterou a ordem de',
  UPLOAD: 'enviou',
  LOGIN: 'entrou no painel',
  LOGOUT: 'saiu do painel',
  LOGIN_FAILED: 'tentativa de login sem sucesso',
  PASSWORD_CHANGE: 'alterou a própria senha',
  PASSWORD_RESET: 'redefiniu a senha de',
};
const ENTITIES: Record<string, string> = {
  client: 'cliente',
  testimonial: 'depoimento',
  media: 'mídia',
  user: 'usuário',
};
const LABELS: Record<string, string> = {
  name: 'Nome',
  slug: 'Slug',
  logoUrl: 'Logo',
  category: 'Categoria',
  description: 'Descrição',
  caseText: 'Texto do case',
  services: 'Serviços',
  status: 'Status',
  highlightLevel: 'Destaque',
  displayOrder: 'Ordem',
  companyName: 'Empresa',
  personName: 'Pessoa',
  personRole: 'Cargo',
  content: 'Depoimento',
  featured: 'Destaque',
  altText: 'Texto alternativo',
  email: 'E-mail',
  role: 'Perfil',
  icon: 'Ícone',
  clientId: 'Cliente relacionado',
  companyLogoUrl: 'Logo da empresa',
  personPhotoUrl: 'Foto',
};
const IGNORE = new Set(['updatedAt', 'createdAt', 'id', 'clientName', 'clientLogoUrl', 'usage']);

const show = (key: string, v: unknown) => {
  if (v === null || v === undefined || v === '') return '—';
  if (key === 'status' && typeof v === 'string' && v in statusLabel) return statusLabel[v as keyof typeof statusLabel];
  if (key === 'highlightLevel' && typeof v === 'string' && v in highlightLabel)
    return highlightLabel[v as keyof typeof highlightLabel];
  if (typeof v === 'boolean') return v ? 'Sim' : 'Não';
  if (Array.isArray(v)) return v.join(', ') || '—';
  return String(v);
};

function Diff({ e }: { e: AuditEntry }) {
  const keys = [...new Set([...Object.keys(e.oldData ?? {}), ...Object.keys(e.newData ?? {})])].filter(
    (k) => !IGNORE.has(k),
  );
  const changed = keys.filter((k) => JSON.stringify(e.oldData?.[k]) !== JSON.stringify(e.newData?.[k]));
  if (!e.oldData || !e.newData || !changed.length) return null;
  return (
    <ul className="adm-diff">
      {changed.map((k) => (
        <li key={k}>
          <span className="adm-diff__key">{LABELS[k] ?? k}</span>
          <span className="adm-diff__old">{show(k, e.oldData?.[k])}</span>
          <span aria-hidden="true">→</span>
          <span className="adm-diff__new">{show(k, e.newData?.[k])}</span>
        </li>
      ))}
    </ul>
  );
}

export function AuditLogs() {
  const [items, setItems] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [entity, setEntity] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async (offset: number) => {
    setLoading(true);
    try {
      const r = await api.auditLogs({ offset, limit: 50, entityType: entity || undefined });
      setItems((prev) => (offset ? [...prev, ...r.items] : r.items));
      setTotal(r.total);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load(0);
  }, [entity]);

  return (
    <>
      <div className="adm-page-head">
        <div>
          <h1>Logs de auditoria</h1>
          <p>Registro de todas as alterações feitas no painel: quem, quando, de onde e o que mudou.</p>
        </div>
        <label className="adm-inline-field">
          <span>Entidade</span>
          <select className="adm-input adm-input--inline" value={entity} onChange={(e) => setEntity(e.target.value)}>
            <option value="">Todas</option>
            {Object.entries(ENTITIES).map(([k, v]) => (
              <option key={k} value={k}>
                {v[0].toUpperCase() + v.slice(1)}
              </option>
            ))}
          </select>
        </label>
      </div>
      {error && <p className="adm-alert">{error}</p>}
      <ol className="adm-log">
        {items.map((e) => {
          const name = (e.newData?.name ??
            e.oldData?.name ??
            e.newData?.personName ??
            e.oldData?.personName ??
            e.newData?.originalFilename ??
            e.oldData?.originalFilename) as string | undefined;
          return (
            <li key={e.id} className="adm-card adm-log__item">
              <div className="adm-log__head">
                <strong>{e.userName ?? e.userEmail ?? (e.newData?.email as string) ?? 'Sistema'}</strong>{' '}
                {ACTIONS[e.action] ?? e.action}
                {!['LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'PASSWORD_CHANGE'].includes(e.action) && (
                  <>
                    {' '}
                    {ENTITIES[e.entityType] ?? e.entityType}
                    {name ? <em> “{name}”</em> : null}
                  </>
                )}
              </div>
              <Diff e={e} />
              <small className="adm-log__meta">
                {formatDate(e.createdAt)} · IP {e.ipAddress ?? '—'}
              </small>
            </li>
          );
        })}
      </ol>
      {!loading && items.length === 0 && <p className="adm-card adm-empty">Nenhum registro.</p>}
      {items.length < total && (
        <button
          type="button"
          className="btn btn--ghost btn--sm adm-mt"
          disabled={loading}
          onClick={() => load(items.length)}
        >
          {loading ? 'Carregando…' : `Carregar mais (${total - items.length})`}
        </button>
      )}
    </>
  );
}
