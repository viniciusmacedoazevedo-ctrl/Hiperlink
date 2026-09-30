import { useState, type FormEvent } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { api, type AdminTestimonial } from './api';
import { useAdminData } from './AdminApp';
import { navigate } from './router';
import { errorMessage, Field, ImageUpload, Toggle, useToast } from './ui';

const empty: Omit<AdminTestimonial, 'id'> = {
  company: '',
  personName: '',
  personRole: '',
  companyLogo: '',
  personPhoto: '',
  quote: '',
  active: true,
  order: 0,
  featured: false,
};

export function TestimonialForm({ id }: { id: string | null }) {
  const { content, reload } = useAdminData();
  const toast = useToast();
  const existing = id ? content?.testimonials.find((t) => t.id === id) : null;
  const [form, setForm] = useState<Omit<AdminTestimonial, 'id'>>(() =>
    existing ? { ...existing } : { ...empty, order: (content?.testimonials.length ?? 0) + 1 },
  );
  const [saving, setSaving] = useState(false);

  if (id && !existing) {
    return (
      <p className="adm-card adm-empty">
        Depoimento não encontrado. <a href="#/depoimentos">Voltar à lista</a>
      </p>
    );
  }
  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (id) await api.updateTestimonial(id, form);
      else await api.createTestimonial(form);
      await reload();
      toast('ok', id ? 'Depoimento atualizado.' : 'Depoimento cadastrado.');
      navigate('/depoimentos');
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
          <a href="#/depoimentos" className="adm-back">
            <ArrowLeft size={16} aria-hidden="true" /> Depoimentos
          </a>
          <h1>{id ? 'Editar depoimento' : 'Novo depoimento'}</h1>
        </div>
        <button type="submit" className="btn btn--primary btn--sm" disabled={saving}>
          <Save size={16} aria-hidden="true" /> {saving ? 'Salvando…' : 'Salvar'}
        </button>
      </div>

      <div className="adm-grid-form">
        <section className="adm-card adm-stack" aria-label="Depoimento">
          <Field label="Empresa" required htmlFor="t-company">
            <input
              id="t-company"
              className="adm-input"
              value={form.company}
              maxLength={120}
              required
              onChange={(e) => set('company', e.target.value)}
            />
          </Field>
          <div className="adm-grid-2 adm-grid-2--tight">
            <Field label="Nome da pessoa" required htmlFor="t-name">
              <input
                id="t-name"
                className="adm-input"
                value={form.personName}
                maxLength={120}
                required
                onChange={(e) => set('personName', e.target.value)}
              />
            </Field>
            <Field label="Cargo" htmlFor="t-role">
              <input
                id="t-role"
                className="adm-input"
                value={form.personRole}
                maxLength={120}
                onChange={(e) => set('personRole', e.target.value)}
              />
            </Field>
          </div>
          <Field label="Depoimento" required htmlFor="t-quote" hint="Use o texto real, aprovado pelo cliente.">
            <textarea
              id="t-quote"
              className="adm-input"
              rows={6}
              value={form.quote}
              maxLength={1500}
              required
              onChange={(e) => set('quote', e.target.value)}
            />
          </Field>
        </section>

        <div className="adm-stack">
          <section className="adm-card adm-stack" aria-label="Imagens">
            <Field label="Logo da empresa">
              <ImageUpload label="Logo da empresa" value={form.companyLogo} onChange={(v) => set('companyLogo', v)} />
            </Field>
            <Field label="Foto da pessoa (opcional)">
              <ImageUpload
                label="Foto da pessoa"
                round
                value={form.personPhoto}
                onChange={(v) => set('personPhoto', v)}
              />
            </Field>
          </section>
          <section className="adm-card adm-stack" aria-label="Exibição">
            <Toggle
              checked={form.active}
              onChange={(v) => set('active', v)}
              label={form.active ? 'Ativo (visível no site)' : 'Inativo (oculto no site)'}
            />
            <Toggle
              checked={form.featured}
              onChange={(v) => set('featured', v)}
              label="Destaque (aparece primeiro, com visual escuro)"
            />
            <Field label="Ordem de exibição" htmlFor="t-order">
              <input
                id="t-order"
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
