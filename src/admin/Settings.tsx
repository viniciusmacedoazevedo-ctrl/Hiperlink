import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Crown, Save } from 'lucide-react';
import { Icon } from '../components/common/Icon';
import { api, type AdminClient } from './api';
import { useAdminData } from './AdminApp';
import { errorMessage, StatusBadge, useToast } from './ui';

/** Configurações da seção de clientes: super destaque, destaques e ordem de exibição. */
export function Settings() {
  const { content, reload } = useAdminData();
  const toast = useToast();
  const [list, setList] = useState<AdminClient[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (content) setList(content.clients.map((c) => ({ ...c })));
  }, [content]);

  if (!content) return null;
  const superId = list.find((c) => c.highlight === 'super')?.id ?? '';
  const dirty =
    JSON.stringify(list.map((c) => [c.id, c.highlight])) !==
    JSON.stringify(content.clients.map((c) => [c.id, c.highlight]));

  const setSuper = (id: string) =>
    setList((l) =>
      l.map((c) =>
        c.id === id ? { ...c, highlight: 'super' } : c.highlight === 'super' ? { ...c, highlight: 'destaque' } : c,
      ),
    );
  const toggleDestaque = (id: string, on: boolean) =>
    setList((l) =>
      l.map((c) => (c.id === id && c.highlight !== 'super' ? { ...c, highlight: on ? 'destaque' : 'normal' } : c)),
    );
  const move = (i: number, d: number) =>
    setList((l) => {
      const n = [...l];
      const [item] = n.splice(i, 1);
      n.splice(i + d, 0, item);
      return n;
    });

  const orderChanged = list.map((c) => c.id).join() !== content.clients.map((c) => c.id).join();

  const save = async () => {
    setSaving(true);
    try {
      await api.saveClientSettings({
        superId: superId || null,
        highlights: Object.fromEntries(
          list.filter((c) => c.highlight !== 'super').map((c) => [c.id, c.highlight as 'normal' | 'destaque']),
        ),
        order: list.map((c) => c.id),
      });
      await reload();
      toast('ok', 'Configurações salvas. O site já reflete as alterações.');
    } catch (e) {
      toast('error', errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="adm-page-head">
        <div>
          <h1>Configurações</h1>
          <p>Defina o super destaque, os destaques e a ordem de exibição dos clientes.</p>
        </div>
        <button
          type="button"
          className="btn btn--primary btn--sm"
          onClick={save}
          disabled={saving || (!dirty && !orderChanged)}
        >
          <Save size={16} aria-hidden="true" /> {saving ? 'Salvando…' : 'Salvar alterações'}
        </button>
      </div>

      <section className="adm-card adm-stack" aria-labelledby="set-super">
        <h2 id="set-super" className="adm-card__title">
          <Crown size={18} aria-hidden="true" /> Super destaque
        </h2>
        <p className="adm-muted">O cliente escolhido ocupa o card grande da seção “Nossos Clientes”.</p>
        <label className="adm-field__label" htmlFor="set-super-select">
          Cliente em super destaque
        </label>
        <select
          id="set-super-select"
          className="adm-input"
          value={superId}
          onChange={(e) =>
            e.target.value
              ? setSuper(e.target.value)
              : setList((l) => l.map((c) => (c.highlight === 'super' ? { ...c, highlight: 'destaque' } : c)))
          }
        >
          <option value="">Nenhum (sem card grande)</option>
          {list.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
              {c.active ? '' : ' (inativo)'}
            </option>
          ))}
        </select>
      </section>

      <section className="adm-card adm-stack adm-mt" aria-labelledby="set-order">
        <h2 id="set-order" className="adm-card__title">
          Destaques e ordem de exibição
        </h2>
        <p className="adm-muted">
          Clientes em destaque aparecem primeiro na grade, com apresentação diferenciada. Use as setas para ordenar.
        </p>
        <ol className="adm-order">
          {list.map((c, i) => (
            <li key={c.id} className={`adm-order__item ${c.highlight === 'super' ? 'is-super' : ''}`}>
              <span className="adm-row__order">{i + 1}</span>
              <span className="adm-row__thumb">
                {c.logo ? <img src={c.logo} alt="" /> : <Icon name={c.icon} size={20} />}
              </span>
              <span className="adm-order__name">
                {c.name}
                {!c.active && <StatusBadge active={false} />}
              </span>
              {c.highlight === 'super' ? (
                <span className="adm-badge adm-badge--super">Super destaque</span>
              ) : (
                <label className="adm-check">
                  <input
                    type="checkbox"
                    checked={c.highlight === 'destaque'}
                    onChange={(e) => toggleDestaque(c.id, e.target.checked)}
                  />
                  Destaque
                </label>
              )}
              <span className="adm-order__arrows">
                <button
                  type="button"
                  className="adm-icon-btn"
                  aria-label={`Subir ${c.name}`}
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                >
                  <ArrowUp size={16} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="adm-icon-btn"
                  aria-label={`Descer ${c.name}`}
                  disabled={i === list.length - 1}
                  onClick={() => move(i, 1)}
                >
                  <ArrowDown size={16} aria-hidden="true" />
                </button>
              </span>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
