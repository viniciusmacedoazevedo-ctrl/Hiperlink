import { useState, type FormEvent } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Icon, iconNames } from '../components/common/Icon';
import type { Highlight } from '../data/siteContent';
import { api, type AdminClient } from './api';
import { useAdminData } from './AdminApp';
import { navigate } from './router';
import { errorMessage, Field, highlightLabel, ImageUpload, TagInput, Toggle, useToast } from './ui';

const empty: Omit<AdminClient, 'id'> = {
  name: '',
  logo: '',
  icon: 'building',
  description: '',
  segment: '',
  caseText: '',
  services: [],
  active: true,
  order: 0,
  highlight: 'normal',
};

const highlightHelp: Record<Highlight, string> = {
  normal: 'Aparece normalmente na grade de clientes.',
  destaque: 'Card da grade com apresentação diferenciada, exibido antes dos clientes normais.',
  super: 'Ocupa o card grande da seção. Apenas um cliente pode ser super destaque — o atual passa a “Destaque”.',
};

export function ClientForm({ id }: { id: string | null }) {
  const { content, reload } = useAdminData();
  const toast = useToast();
  const existing = id ? content?.clients.find((c) => c.id === id) : null;
  const [form, setForm] = useState<Omit<AdminClient, 'id'>>(() =>
    existing ? { ...existing } : { ...empty, order: (content?.clients.length ?? 0) + 1 },
  );
  const [saving, setSaving] = useState(false);

  if (id && !existing) {
    return (
      <p className="adm-card adm-empty">
        Cliente não encontrado. <a href="#/clientes">Voltar à lista</a>
      </p>
    );
  }

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));
  const currentSuper = content?.clients.find((c) => c.highlight === 'super' && c.id !== id);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (id) await api.updateClient(id, form);
      else await api.createClient(form);
      await reload();
      toast('ok', id ? 'Cliente atualizado.' : 'Cliente cadastrado.');
      navigate('/clientes');
    } catch (err) {
      toast('error', errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="adm-form">
      <div className="adm-page-head">
        <div>
          <a href="#/clientes" className="adm-back">
            <ArrowLeft size={16} aria-hidden="true" /> Clientes
          </a>
          <h1>{id ? 'Editar cliente' : 'Novo cliente'}</h1>
        </div>
        <button type="submit" className="btn btn--primary btn--sm" disabled={saving}>
          <Save size={16} aria-hidden="true" /> {saving ? 'Salvando…' : 'Salvar'}
        </button>
      </div>

      <div className="adm-grid-form">
        <section className="adm-card adm-stack" aria-label="Dados do cliente">
          <Field label="Nome da empresa" required htmlFor="c-name">
            <input
              id="c-name"
              className="adm-input"
              value={form.name}
              maxLength={120}
              required
              onChange={(e) => set('name', e.target.value)}
            />
          </Field>
          <Field label="Categoria/segmento" htmlFor="c-seg" hint="Opcional. Ex.: Saúde, Varejo, Educação.">
            <input
              id="c-seg"
              className="adm-input"
              value={form.segment}
              maxLength={80}
              onChange={(e) => set('segment', e.target.value)}
            />
          </Field>
          <Field label="Descrição" htmlFor="c-desc" hint="Resumo curto sobre o cliente.">
            <textarea
              id="c-desc"
              className="adm-input"
              rows={3}
              value={form.description}
              maxLength={600}
              onChange={(e) => set('description', e.target.value)}
            />
          </Field>
          <Field label="Texto do case" htmlFor="c-case" hint="Exibido no card de super destaque.">
            <textarea
              id="c-case"
              className="adm-input"
              rows={4}
              value={form.caseText}
              maxLength={1200}
              onChange={(e) => set('caseText', e.target.value)}
            />
          </Field>
          <Field label="Serviços prestados" htmlFor="c-serv" hint="Aparecem como etiquetas no card de super destaque.">
            <TagInput id="c-serv" value={form.services} onChange={(v) => set('services', v)} />
          </Field>
        </section>

        <div className="adm-stack">
          <section className="adm-card adm-stack" aria-label="Logo">
            <Field label="Logo">
              <ImageUpload label="Logo do cliente" value={form.logo} onChange={(v) => set('logo', v)} />
            </Field>
            <Field label="Ícone (usado quando não há logo)" htmlFor="c-icon">
              <div className="adm-icon-select">
                <span className="adm-icon-select__preview">
                  <Icon name={form.icon} size={22} />
                </span>
                <select
                  id="c-icon"
                  className="adm-input"
                  value={form.icon}
                  onChange={(e) => set('icon', e.target.value)}
                >
                  {iconNames.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </Field>
          </section>

          <section className="adm-card adm-stack" aria-label="Exibição">
            <Toggle
              checked={form.active}
              onChange={(v) => set('active', v)}
              label={form.active ? 'Ativo (visível no site)' : 'Inativo (oculto no site)'}
            />
            <fieldset className="adm-radios">
              <legend className="adm-field__label">Nível de destaque</legend>
              {(['normal', 'destaque', 'super'] as Highlight[]).map((h) => (
                <label key={h} className={`adm-radio ${form.highlight === h ? 'is-checked' : ''}`}>
                  <input
                    type="radio"
                    name="highlight"
                    value={h}
                    checked={form.highlight === h}
                    onChange={() => set('highlight', h)}
                  />
                  <span>
                    <strong>{highlightLabel[h]}</strong>
                    <small>{highlightHelp[h]}</small>
                  </span>
                </label>
              ))}
            </fieldset>
            {form.highlight === 'super' && currentSuper && (
              <p className="adm-alert adm-alert--info">
                “{currentSuper.name}” deixará de ser super destaque e passará a “Destaque”.
              </p>
            )}
            <Field
              label="Ordem de exibição"
              htmlFor="c-order"
              hint="1 aparece primeiro. Também pode ser ajustada em Configurações."
            >
              <input
                id="c-order"
                type="number"
                min={1}
                className="adm-input adm-input--short"
                value={form.order}
                onChange={(e) => set('order', Number(e.target.value))}
              />
            </Field>
          </section>
        </div>
      </div>
    </form>
  );
}
