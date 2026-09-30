import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { api, type Client, type Status, type Testimonial } from '../api';
import { Link, navigate } from '../router';
import { errorMessage, Field, MediaPicker, statusLabel, Toggle, useToast } from '../ui';

type Form = Pick<
  Testimonial,
  | 'clientId'
  | 'companyName'
  | 'companyLogoUrl'
  | 'personName'
  | 'personRole'
  | 'personPhotoUrl'
  | 'content'
  | 'status'
  | 'featured'
  | 'displayOrder'
>;

const empty: Form = {
  clientId: null,
  companyName: '',
  companyLogoUrl: '',
  personName: '',
  personRole: '',
  personPhotoUrl: '',
  content: '',
  status: 'DRAFT',
  featured: false,
  displayOrder: 0,
};

export function TestimonialForm({ id }: { id: string | null }) {
  const toast = useToast();
  const [form, setForm] = useState<Form | null>(id ? null : empty);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientFilter, setClientFilter] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .clients()
      .then(setClients)
      .catch(() => {});
    if (id)
      api
        .testimonial(id)
        .then((t) => setForm(t))
        .catch((e) => setError(errorMessage(e)));
    else
      api
        .testimonials()
        .then((all) => setForm((f) => f && { ...f, displayOrder: all.length + 1 }))
        .catch(() => {});
  }, [id]);

  const client = useMemo(() => clients.find((c) => c.id === form?.clientId) ?? null, [clients, form?.clientId]);
  const options = clients.filter(
    (c) => !clientFilter || c.name.toLowerCase().includes(clientFilter.toLowerCase()) || c.id === form?.clientId,
  );

  if (error) return <p className="adm-alert">{error}</p>;
  if (!form) return <div className="adm-loading" aria-busy="true" aria-label="Carregando" />;
  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => (f ? { ...f, [key]: value } : f));

  const pickClient = (cid: string) => {
    const next = clients.find((c) => c.id === cid) ?? null;
    setForm((f) => {
      if (!f) return f;
      // preenche a empresa com o nome do cliente se o campo estiver vazio ou com o cliente anterior
      const prevName = clients.find((c) => c.id === f.clientId)?.name;
      const companyName = !f.companyName || f.companyName === prevName ? (next?.name ?? f.companyName) : f.companyName;
      return { ...f, clientId: next?.id ?? null, companyName };
    });
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (id) await api.updateTestimonial(id, form);
      else await api.createTestimonial(form);
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
          <Link to="/depoimentos" className="adm-back">
            <ArrowLeft size={16} aria-hidden="true" /> Depoimentos
          </Link>
          <h1>{id ? 'Editar depoimento' : 'Novo depoimento'}</h1>
        </div>
        <button type="submit" className="btn btn--primary btn--sm" disabled={saving}>
          <Save size={16} aria-hidden="true" /> {saving ? 'Salvando…' : 'Salvar'}
        </button>
      </div>

      <div className="adm-grid-form">
        <div className="adm-stack">
          <section className="adm-card adm-stack" aria-labelledby="sec-client">
            <h2 id="sec-client" className="adm-card__title">
              Cliente e empresa
            </h2>
            <Field
              label="Cliente relacionado"
              htmlFor="t-client"
              hint="Opcional. Um cliente pode ter vários depoimentos."
            >
              <div className="adm-combo">
                <input
                  className="adm-input"
                  placeholder="Filtrar clientes…"
                  aria-label="Filtrar lista de clientes"
                  value={clientFilter}
                  onChange={(e) => setClientFilter(e.target.value)}
                />
                <select
                  id="t-client"
                  className="adm-input"
                  value={form.clientId ?? ''}
                  onChange={(e) => pickClient(e.target.value)}
                >
                  <option value="">— Nenhum cliente relacionado —</option>
                  {options.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                      {c.status !== 'PUBLISHED' ? ` (${statusLabel[c.status].toLowerCase()})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </Field>
            <Field label="Empresa" required htmlFor="t-company">
              <input
                id="t-company"
                className="adm-input"
                value={form.companyName}
                maxLength={120}
                required
                onChange={(e) => set('companyName', e.target.value)}
              />
            </Field>
            <Field label="Logo da empresa">
              <MediaPicker
                label="Logo da empresa"
                value={form.companyLogoUrl}
                onChange={(v) => set('companyLogoUrl', v)}
                fallbackUrl={client?.logoUrl || undefined}
                fallbackNote={client?.logoUrl ? `Usando automaticamente a logo de “${client.name}”.` : undefined}
              />
            </Field>
          </section>

          <section className="adm-card adm-stack" aria-labelledby="sec-person">
            <h2 id="sec-person" className="adm-card__title">
              Depoimento
            </h2>
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
            <Field label="Foto da pessoa (opcional)">
              <MediaPicker
                label="Foto da pessoa"
                round
                value={form.personPhotoUrl}
                onChange={(v) => set('personPhotoUrl', v)}
              />
            </Field>
            <Field label="Depoimento" required htmlFor="t-content" hint="Use o texto real, aprovado pelo cliente.">
              <textarea
                id="t-content"
                className="adm-input"
                rows={6}
                value={form.content}
                maxLength={1500}
                required
                onChange={(e) => set('content', e.target.value)}
              />
            </Field>
          </section>
        </div>

        <section className="adm-card adm-stack" aria-labelledby="sec-pub">
          <h2 id="sec-pub" className="adm-card__title">
            Publicação
          </h2>
          <Field label="Status" htmlFor="t-status" hint="Somente “Publicado” aparece no site.">
            <select
              id="t-status"
              className="adm-input"
              value={form.status}
              onChange={(e) => set('status', e.target.value as Status)}
            >
              {(['PUBLISHED', 'DRAFT', 'ARCHIVED'] as Status[]).map((s) => (
                <option key={s} value={s}>
                  {statusLabel[s]}
                </option>
              ))}
            </select>
          </Field>
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
              value={form.displayOrder}
              onChange={(e) => set('displayOrder', Number(e.target.value))}
            />
          </Field>
        </section>
      </div>
    </form>
  );
}
