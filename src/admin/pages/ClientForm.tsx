import { useEffect, useState, type FormEvent } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Icon, iconNames } from '../../components/common/Icon';
import { api, type Client, type HighlightLevel, type Status } from '../api';
import { Link, navigate } from '../router';
import { errorMessage, Field, highlightLabel, MediaPicker, statusLabel, TagInput, useToast } from '../ui';

type Form = Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>;

const empty: Form = {
  name: '',
  slug: '',
  logoUrl: '',
  icon: 'building',
  category: '',
  description: '',
  caseText: '',
  services: [],
  status: 'DRAFT',
  highlightLevel: 'NORMAL',
  displayOrder: 0,
};

const slugify = (t: string) =>
  t
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' e ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

const highlightHelp: Record<HighlightLevel, string> = {
  NORMAL: 'Aparece normalmente na grade de clientes.',
  HIGHLIGHT: 'Card da grade com apresentação diferenciada, exibido antes dos clientes normais.',
  FEATURED: 'Ocupa o card grande da seção. Apenas um cliente por vez — o atual passa a “Destaque”.',
};
const statusHelp: Record<Status, string> = {
  DRAFT: 'Salvo, mas não aparece no site.',
  PUBLISHED: 'Visível no site.',
  ARCHIVED: 'Fora do site, mantido para histórico.',
};

export function ClientForm({ id }: { id: string | null }) {
  const toast = useToast();
  const [form, setForm] = useState<Form | null>(id ? null : empty);
  const [slugTouched, setSlugTouched] = useState(Boolean(id));
  const [featured, setFeatured] = useState<Client | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .clients()
      .then((all) => {
        setFeatured(all.find((c) => c.highlightLevel === 'FEATURED' && c.id !== id) ?? null);
        if (!id) setForm((f) => f && { ...f, displayOrder: all.length + 1 });
      })
      .catch(() => {});
    if (id)
      api
        .client(id)
        .then((c) => setForm(c))
        .catch((e) => setError(errorMessage(e)));
  }, [id]);

  if (error) return <p className="adm-alert">{error}</p>;
  if (!form) return <div className="adm-loading" aria-busy="true" aria-label="Carregando" />;

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => (f ? { ...f, [key]: value } : f));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (id) await api.updateClient(id, form);
      else await api.createClient(form);
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
          <Link to="/clientes" className="adm-back">
            <ArrowLeft size={16} aria-hidden="true" /> Clientes
          </Link>
          <h1>{id ? `Editar cliente` : 'Novo cliente'}</h1>
        </div>
        <button type="submit" className="btn btn--primary btn--sm" disabled={saving}>
          <Save size={16} aria-hidden="true" /> {saving ? 'Salvando…' : 'Salvar'}
        </button>
      </div>

      <div className="adm-grid-form">
        <div className="adm-stack">
          <section className="adm-card adm-stack" aria-labelledby="sec-basic">
            <h2 id="sec-basic" className="adm-card__title">
              Informações básicas
            </h2>
            <Field label="Nome da empresa" required htmlFor="c-name">
              <input
                id="c-name"
                className="adm-input"
                value={form.name}
                maxLength={120}
                required
                onChange={(e) => {
                  set('name', e.target.value);
                  if (!slugTouched) set('slug', slugify(e.target.value));
                }}
              />
            </Field>
            <Field
              label="Slug"
              htmlFor="c-slug"
              hint="Identificador único usado em endereços. Gerado a partir do nome."
            >
              <input
                id="c-slug"
                className="adm-input"
                value={form.slug}
                maxLength={80}
                onChange={(e) => {
                  setSlugTouched(true);
                  set('slug', slugify(e.target.value));
                }}
              />
            </Field>
            <Field label="Categoria" htmlFor="c-cat" hint="Ex.: Varejo, Construção, Saúde.">
              <input
                id="c-cat"
                className="adm-input"
                value={form.category}
                maxLength={80}
                onChange={(e) => set('category', e.target.value)}
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
          </section>

          <section className="adm-card adm-stack" aria-labelledby="sec-pres">
            <h2 id="sec-pres" className="adm-card__title">
              Apresentação
            </h2>
            <Field label="Texto do case" htmlFor="c-case" hint="Exibido no card de super destaque.">
              <textarea
                id="c-case"
                className="adm-input"
                rows={4}
                value={form.caseText}
                maxLength={1500}
                onChange={(e) => set('caseText', e.target.value)}
              />
            </Field>
            <Field
              label="Serviços prestados"
              htmlFor="c-serv"
              hint="Aparecem como etiquetas no card de super destaque."
            >
              <TagInput id="c-serv" value={form.services} onChange={(v) => set('services', v)} />
            </Field>
          </section>
        </div>

        <div className="adm-stack">
          <section className="adm-card adm-stack" aria-labelledby="sec-logo">
            <h2 id="sec-logo" className="adm-card__title">
              Logo
            </h2>
            <MediaPicker label="Logo do cliente" value={form.logoUrl} onChange={(v) => set('logoUrl', v)} />
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

          <section className="adm-card adm-stack" aria-labelledby="sec-pub">
            <h2 id="sec-pub" className="adm-card__title">
              Publicação
            </h2>
            <fieldset className="adm-radios">
              <legend className="adm-field__label">Status</legend>
              {(['PUBLISHED', 'DRAFT', 'ARCHIVED'] as Status[]).map((s) => (
                <label key={s} className={`adm-radio ${form.status === s ? 'is-checked' : ''}`}>
                  <input
                    type="radio"
                    name="status"
                    value={s}
                    checked={form.status === s}
                    onChange={() => set('status', s)}
                  />
                  <span>
                    <strong>{statusLabel[s]}</strong>
                    <small>{statusHelp[s]}</small>
                  </span>
                </label>
              ))}
            </fieldset>
            <fieldset className="adm-radios">
              <legend className="adm-field__label">Nível de destaque</legend>
              {(['NORMAL', 'HIGHLIGHT', 'FEATURED'] as HighlightLevel[]).map((h) => (
                <label key={h} className={`adm-radio ${form.highlightLevel === h ? 'is-checked' : ''}`}>
                  <input
                    type="radio"
                    name="highlight"
                    value={h}
                    checked={form.highlightLevel === h}
                    onChange={() => set('highlightLevel', h)}
                  />
                  <span>
                    <strong>{highlightLabel[h]}</strong>
                    <small>{highlightHelp[h]}</small>
                  </span>
                </label>
              ))}
            </fieldset>
            {form.highlightLevel === 'FEATURED' && featured && (
              <p className="adm-alert adm-alert--info">
                “{featured.name}” deixará de ser super destaque e passará a “Destaque”.
              </p>
            )}
            <Field label="Ordem de exibição" htmlFor="c-order" hint="1 aparece primeiro.">
              <input
                id="c-order"
                type="number"
                min={1}
                className="adm-input adm-input--short"
                value={form.displayOrder}
                onChange={(e) => set('displayOrder', Number(e.target.value))}
              />
            </Field>
          </section>
        </div>
      </div>
    </form>
  );
}
