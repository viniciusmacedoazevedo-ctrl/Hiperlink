/**
 * Armazenamento do conteúdo administrável (clientes e depoimentos) em JSON.
 * Gravação atômica (arquivo temporário + rename) e fila para evitar escritas concorrentes.
 * Na primeira execução, o conteúdo é criado a partir de server/seed.json.
 */
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { CONTENT_FILE, DATA_DIR, SEED_FILE, UPLOADS_DIR } from './config.mjs';

export const HIGHLIGHTS = ['normal', 'destaque', 'super'];

let cache = null;
let queue = Promise.resolve();

async function load() {
  if (cache) return cache;
  await mkdir(UPLOADS_DIR, { recursive: true });
  try {
    cache = JSON.parse(await readFile(CONTENT_FILE, 'utf8'));
  } catch {
    cache = JSON.parse(await readFile(SEED_FILE, 'utf8'));
    await persist();
  }
  cache.clients ??= [];
  cache.testimonials ??= [];
  return cache;
}

async function persist() {
  await mkdir(DATA_DIR, { recursive: true });
  const tmp = `${CONTENT_FILE}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(cache, null, 2), 'utf8');
  await rename(tmp, CONTENT_FILE);
}

/** Executa uma alteração em série e grava o resultado. */
function mutate(fn) {
  const run = queue.then(async () => {
    const data = await load();
    const result = await fn(data);
    await persist();
    return result;
  });
  queue = run.catch(() => {});
  return run;
}

/* ---------------------------------------------------------------- validação */
export class ValidationError extends Error {}

const str = (v, field, max, { required = false } = {}) => {
  if (v === undefined || v === null) v = '';
  if (typeof v !== 'string') throw new ValidationError(`Campo inválido: ${field}`);
  v = v.trim();
  if (required && !v) throw new ValidationError(`Preencha o campo: ${field}`);
  if (v.length > max) throw new ValidationError(`O campo "${field}" aceita no máximo ${max} caracteres.`);
  return v;
};
/** Imagens só podem vir dos uploads do próprio painel. */
const image = (v, field) => {
  const s = str(v, field, 200);
  if (s && !/^\/uploads\/[a-zA-Z0-9_-]+\.(png|jpe?g|webp)$/.test(s))
    throw new ValidationError(`Imagem inválida: ${field}`);
  return s;
};
const bool = (v) => v === true || v === 'true';
const int = (v, fallback) => (Number.isInteger(Number(v)) ? Number(v) : fallback);

function cleanClient(input, existing = {}) {
  const services = Array.isArray(input.services) ? input.services : (existing.services ?? []);
  const highlight = input.highlight ?? existing.highlight ?? 'normal';
  if (!HIGHLIGHTS.includes(highlight)) throw new ValidationError('Nível de destaque inválido.');
  const icon = str(input.icon ?? existing.icon ?? 'building', 'ícone', 30);
  if (!/^[a-zA-Z]+$/.test(icon)) throw new ValidationError('Ícone inválido.');
  if (services.length > 12) throw new ValidationError('Informe no máximo 12 serviços.');
  return {
    name: str(input.name ?? existing.name, 'Nome da empresa', 120, { required: true }),
    logo: image(input.logo ?? existing.logo, 'Logo'),
    icon,
    description: str(input.description ?? existing.description, 'Descrição', 600),
    segment: str(input.segment ?? existing.segment, 'Categoria/segmento', 80),
    caseText: str(input.caseText ?? existing.caseText, 'Texto do case', 1200),
    services: services.map((s, i) => str(s, `Serviço ${i + 1}`, 60)).filter(Boolean),
    active: input.active === undefined ? (existing.active ?? true) : bool(input.active),
    order: int(input.order, existing.order ?? 999),
    highlight,
  };
}

function cleanTestimonial(input, existing = {}) {
  return {
    company: str(input.company ?? existing.company, 'Empresa', 120, { required: true }),
    personName: str(input.personName ?? existing.personName, 'Nome da pessoa', 120, { required: true }),
    personRole: str(input.personRole ?? existing.personRole, 'Cargo', 120),
    companyLogo: image(input.companyLogo ?? existing.companyLogo, 'Logo da empresa'),
    personPhoto: image(input.personPhoto ?? existing.personPhoto, 'Foto da pessoa'),
    quote: str(input.quote ?? existing.quote, 'Depoimento', 1500, { required: true }),
    active: input.active === undefined ? (existing.active ?? true) : bool(input.active),
    order: int(input.order, existing.order ?? 999),
    featured: input.featured === undefined ? (existing.featured ?? false) : bool(input.featured),
  };
}

const byOrder = (a, b) => a.order - b.order || a.name?.localeCompare?.(b.name ?? '') || 0;

/** Apenas um cliente pode ser "super destaque": os demais passam a "destaque". */
function enforceSingleSuper(clients, superId) {
  for (const c of clients) if (c.id !== superId && c.highlight === 'super') c.highlight = 'destaque';
}

/** Coloca o item na posição pedida (1 = primeiro) e renumera os demais. */
function placeAt(list, item, order) {
  const rest = list.filter((x) => x !== item).sort(byOrder);
  const idx = Math.max(0, Math.min(rest.length, (Number(order) || rest.length + 1) - 1));
  rest.splice(idx, 0, item);
  rest.forEach((x, i) => (x.order = i + 1));
  list.splice(0, list.length, ...rest);
}

/** Renumera a ordem de exibição (1, 2, 3…) mantendo a sequência atual. */
function normalizeOrder(list) {
  list.sort(byOrder).forEach((item, i) => (item.order = i + 1));
}

/* ---------------------------------------------------------------- API do store */
export async function getAll() {
  const data = await load();
  return structuredClone({
    clients: [...data.clients].sort(byOrder),
    testimonials: [...data.testimonials].sort(byOrder),
  });
}

export async function getPublic() {
  const { clients, testimonials } = await getAll();
  return {
    clients: clients
      .filter((c) => c.active)
      .map(({ id, name, logo, icon, description, segment, caseText, services, highlight }) => ({
        id,
        name,
        logo,
        icon,
        description,
        segment,
        caseText,
        services,
        highlight,
      })),
    testimonials: testimonials
      .filter((t) => t.active)
      .map(({ id, company, personName, personRole, companyLogo, personPhoto, quote, featured }) => ({
        id,
        company,
        personName,
        personRole,
        companyLogo,
        personPhoto,
        quote,
        featured,
      })),
  };
}

export const createClient = (input) =>
  mutate((data) => {
    const client = { id: randomUUID(), ...cleanClient(input) };
    data.clients.push(client);
    if (client.highlight === 'super') enforceSingleSuper(data.clients, client.id);
    placeAt(data.clients, client, input.order ?? data.clients.length);
    return client;
  });

export const updateClient = (id, input) =>
  mutate((data) => {
    const idx = data.clients.findIndex((c) => c.id === id);
    if (idx < 0) return null;
    const client = { id, ...cleanClient(input, data.clients[idx]) };
    data.clients[idx] = client;
    if (client.highlight === 'super') enforceSingleSuper(data.clients, id);
    placeAt(data.clients, client, client.order);
    return client;
  });

export const deleteClient = (id) =>
  mutate((data) => {
    const before = data.clients.length;
    data.clients = data.clients.filter((c) => c.id !== id);
    normalizeOrder(data.clients);
    return data.clients.length < before;
  });

export const createTestimonial = (input) =>
  mutate((data) => {
    const t = { id: randomUUID(), ...cleanTestimonial(input) };
    data.testimonials.push(t);
    placeAt(data.testimonials, t, input.order ?? data.testimonials.length);
    return t;
  });

export const updateTestimonial = (id, input) =>
  mutate((data) => {
    const idx = data.testimonials.findIndex((t) => t.id === id);
    if (idx < 0) return null;
    const t = { id, ...cleanTestimonial(input, data.testimonials[idx]) };
    data.testimonials[idx] = t;
    placeAt(data.testimonials, t, t.order);
    return t;
  });

export const deleteTestimonial = (id) =>
  mutate((data) => {
    const before = data.testimonials.length;
    data.testimonials = data.testimonials.filter((t) => t.id !== id);
    normalizeOrder(data.testimonials);
    return data.testimonials.length < before;
  });

/**
 * Configurações de destaque em lote (tela "Configurações"):
 * { superId, highlights: { [id]: 'normal' | 'destaque' }, order: [id, id, …] }
 */
export const saveClientSettings = ({ superId, highlights = {}, order }) =>
  mutate((data) => {
    if (superId && !data.clients.some((c) => c.id === superId)) throw new ValidationError('Cliente não encontrado.');
    for (const c of data.clients) {
      const h = highlights[c.id];
      if (h !== undefined) {
        if (!['normal', 'destaque'].includes(h)) throw new ValidationError('Nível de destaque inválido.');
        c.highlight = h;
      }
      if (superId !== undefined) {
        if (c.id === superId) c.highlight = 'super';
        else if (c.highlight === 'super') c.highlight = 'destaque';
      }
    }
    if (Array.isArray(order)) reorder(data.clients, order);
    return data.clients.sort(byOrder);
  });

export const reorderTestimonials = (order) =>
  mutate((data) => {
    reorder(data.testimonials, order);
    return data.testimonials.sort(byOrder);
  });

function reorder(list, ids) {
  const pos = new Map(ids.map((id, i) => [id, i + 1]));
  for (const item of list) item.order = pos.get(item.id) ?? list.length + item.order;
  normalizeOrder(list);
}
