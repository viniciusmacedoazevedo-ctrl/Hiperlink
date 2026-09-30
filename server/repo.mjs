/**
 * Regras de negócio e acesso a dados (clientes, depoimentos, mídia, usuários).
 */
import { randomUUID } from 'node:crypto';
import { db, hashPassword, now, slugify } from './db.mjs';

export class ValidationError extends Error {}
export class NotFoundError extends Error {}

export const STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];
export const HIGHLIGHTS = ['NORMAL', 'HIGHLIGHT', 'FEATURED'];
export const ROLES = ['ADMIN', 'EDITOR'];

/* ------------------------------------------------------------------ validação */
const str = (v, field, max, { required = false } = {}) => {
  if (v === undefined || v === null) v = '';
  if (typeof v !== 'string') throw new ValidationError(`Campo inválido: ${field}`);
  v = v.trim();
  if (required && !v) throw new ValidationError(`Preencha o campo: ${field}`);
  if (v.length > max) throw new ValidationError(`O campo "${field}" aceita no máximo ${max} caracteres.`);
  return v;
};
const oneOf = (v, list, field) => {
  if (!list.includes(v)) throw new ValidationError(`Valor inválido: ${field}`);
  return v;
};
/** Imagens só podem vir da biblioteca de mídia (arquivo existente e não excluído). */
const mediaUrl = (v, field) => {
  const s = str(v, field, 200);
  if (!s) return '';
  const ok = db.prepare('SELECT 1 FROM media WHERE url = ? AND deleted_at IS NULL').get(s);
  if (!ok) throw new ValidationError(`Imagem inválida em "${field}". Selecione uma imagem da biblioteca de mídia.`);
  return s;
};
const pick = (input, key, fallback) => (input[key] === undefined ? fallback : input[key]);

/* ------------------------------------------------------------------ ordem de exibição */
function moveTo(table, id, position) {
  const ids = db
    .prepare(`SELECT id FROM ${table} WHERE deleted_at IS NULL ORDER BY display_order, created_at`)
    .all()
    .map((r) => r.id)
    .filter((x) => x !== id);
  const idx = Math.max(0, Math.min(ids.length, (Number(position) || ids.length + 1) - 1));
  ids.splice(idx, 0, id);
  const upd = db.prepare(`UPDATE ${table} SET display_order = ? WHERE id = ?`);
  ids.forEach((x, i) => upd.run(i + 1, x));
}
const renumber = (table) => {
  const ids = db.prepare(`SELECT id FROM ${table} WHERE deleted_at IS NULL ORDER BY display_order, created_at`).all();
  const upd = db.prepare(`UPDATE ${table} SET display_order = ? WHERE id = ?`);
  ids.forEach((r, i) => upd.run(i + 1, r.id));
};

/* ================================================================== CLIENTES */
export const clientOut = (r) =>
  r && {
    id: r.id,
    name: r.name,
    slug: r.slug,
    logoUrl: r.logo_url,
    icon: r.icon,
    category: r.category,
    description: r.description,
    caseText: r.case_text,
    services: JSON.parse(r.services || '[]'),
    status: r.status,
    highlightLevel: r.highlight_level,
    displayOrder: r.display_order,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    deletedAt: r.deleted_at,
  };

const getClientRow = (id) => db.prepare('SELECT * FROM clients WHERE id = ?').get(id);

export function getClient(id) {
  const r = getClientRow(id);
  if (!r) throw new NotFoundError('Cliente não encontrado.');
  return clientOut(r);
}

export function listClients({ deleted = false, status, q } = {}) {
  let sql = `SELECT * FROM clients WHERE deleted_at IS ${deleted ? 'NOT NULL' : 'NULL'}`;
  const args = [];
  if (status && STATUSES.includes(status)) {
    sql += ' AND status = ?';
    args.push(status);
  }
  if (q) {
    sql += ' AND (name LIKE ? OR category LIKE ?)';
    args.push(`%${q}%`, `%${q}%`);
  }
  sql += deleted ? ' ORDER BY deleted_at DESC' : ' ORDER BY display_order, created_at';
  return db
    .prepare(sql)
    .all(...args)
    .map(clientOut);
}

function cleanClient(input, current = {}) {
  const name = str(pick(input, 'name', current.name), 'Nome da empresa', 120, { required: true });
  let slug = slugify(str(pick(input, 'slug', current.slug), 'Slug', 80) || name);
  if (!slug) throw new ValidationError('Slug inválido.');
  const services = pick(input, 'services', current.services ?? []);
  if (!Array.isArray(services) || services.length > 12) throw new ValidationError('Informe no máximo 12 serviços.');
  const icon = str(pick(input, 'icon', current.icon ?? 'building'), 'Ícone', 30) || 'building';
  if (!/^[a-zA-Z]+$/.test(icon)) throw new ValidationError('Ícone inválido.');
  return {
    name,
    slug,
    logo_url: mediaUrl(pick(input, 'logoUrl', current.logoUrl), 'Logo'),
    icon,
    category: str(pick(input, 'category', current.category), 'Categoria', 80),
    description: str(pick(input, 'description', current.description), 'Descrição', 600),
    case_text: str(pick(input, 'caseText', current.caseText), 'Texto do case', 1500),
    services: JSON.stringify(services.map((s, i) => str(s, `Serviço ${i + 1}`, 60)).filter(Boolean)),
    status: oneOf(pick(input, 'status', current.status ?? 'DRAFT'), STATUSES, 'Status'),
    highlight_level: oneOf(
      pick(input, 'highlightLevel', current.highlightLevel ?? 'NORMAL'),
      HIGHLIGHTS,
      'Nível de destaque',
    ),
  };
}

function assertUniqueSlug(slug, id) {
  const other = db.prepare('SELECT id FROM clients WHERE slug = ? AND id <> ?').get(slug, id ?? '');
  if (other) throw new ValidationError(`O slug "${slug}" já está em uso por outro cliente.`);
}

/** Regra do super destaque: só um cliente FEATURED; o anterior passa a HIGHLIGHT. Retorna o rebaixado. */
function demoteOtherFeatured(id) {
  const prev = db
    .prepare(`SELECT id, name FROM clients WHERE highlight_level = 'FEATURED' AND deleted_at IS NULL AND id <> ?`)
    .get(id);
  if (prev)
    db.prepare(`UPDATE clients SET highlight_level = 'HIGHLIGHT', updated_at = ? WHERE id = ?`).run(now(), prev.id);
  return prev ?? null;
}

export const createClient = (input) =>
  db.transaction(() => {
    const data = cleanClient(input);
    assertUniqueSlug(data.slug);
    const id = randomUUID();
    const t = now();
    if (data.highlight_level === 'FEATURED') demoteOtherFeatured(id);
    db.prepare(
      `INSERT INTO clients (id, name, slug, logo_url, icon, category, description, case_text, services, status,
        highlight_level, display_order, created_at, updated_at)
       VALUES (@id, @name, @slug, @logo_url, @icon, @category, @description, @case_text, @services, @status,
        @highlight_level, 9999, @t, @t)`,
    ).run({ ...data, id, t });
    moveTo('clients', id, input.displayOrder);
    return getClient(id);
  })();

export const updateClient = (id, input) =>
  db.transaction(() => {
    const before = getClient(id);
    if (before.deletedAt) throw new ValidationError('Restaure o cliente antes de editá-lo.');
    const data = cleanClient(input, before);
    assertUniqueSlug(data.slug, id);
    let demoted = null;
    if (data.highlight_level === 'FEATURED') demoted = demoteOtherFeatured(id);
    db.prepare(
      `UPDATE clients SET name=@name, slug=@slug, logo_url=@logo_url, icon=@icon, category=@category,
        description=@description, case_text=@case_text, services=@services, status=@status,
        highlight_level=@highlight_level, updated_at=@t WHERE id=@id`,
    ).run({ ...data, id, t: now() });
    if (input.displayOrder !== undefined) moveTo('clients', id, input.displayOrder);
    return { before, after: getClient(id), demoted };
  })();

export const setClientStatus = (id, status) => updateClient(id, { status: oneOf(status, STATUSES, 'Status') });
export const setClientHighlight = (id, level) =>
  updateClient(id, { highlightLevel: oneOf(level, HIGHLIGHTS, 'Nível de destaque') });
export const setClientOrder = (id, position) =>
  db.transaction(() => {
    const before = getClient(id);
    moveTo('clients', id, position);
    return { before, after: getClient(id) };
  })();

export const deleteClient = (id) =>
  db.transaction(() => {
    const before = getClient(id);
    if (before.deletedAt) throw new ValidationError('O cliente já está na lixeira.');
    db.prepare('UPDATE clients SET deleted_at = ?, updated_at = ? WHERE id = ?').run(now(), now(), id);
    renumber('clients');
    return before;
  })();

export const restoreClient = (id) =>
  db.transaction(() => {
    const before = getClient(id);
    if (!before.deletedAt) throw new ValidationError('O cliente não está na lixeira.');
    let level = before.highlightLevel;
    // se outro cliente já é super destaque, o restaurado volta como destaque
    if (
      level === 'FEATURED' &&
      db.prepare(`SELECT 1 FROM clients WHERE highlight_level='FEATURED' AND deleted_at IS NULL`).get()
    ) {
      level = 'HIGHLIGHT';
    }
    db.prepare(
      'UPDATE clients SET deleted_at = NULL, highlight_level = ?, display_order = 9999, updated_at = ? WHERE id = ?',
    ).run(level, now(), id);
    renumber('clients');
    return { before, after: getClient(id) };
  })();

/* ================================================================== DEPOIMENTOS */
export const testimonialOut = (r) =>
  r && {
    id: r.id,
    clientId: r.client_id,
    clientName: r.client_name ?? null,
    clientLogoUrl: r.client_logo_url ?? '',
    companyName: r.company_name,
    companyLogoUrl: r.company_logo_url,
    personName: r.person_name,
    personRole: r.person_role,
    personPhotoUrl: r.person_photo_url,
    content: r.content,
    status: r.status,
    featured: Boolean(r.featured),
    displayOrder: r.display_order,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    deletedAt: r.deleted_at,
  };

const T_SELECT = `SELECT t.*, c.name AS client_name, c.logo_url AS client_logo_url
  FROM testimonials t LEFT JOIN clients c ON c.id = t.client_id`;

export function getTestimonial(id) {
  const r = db.prepare(`${T_SELECT} WHERE t.id = ?`).get(id);
  if (!r) throw new NotFoundError('Depoimento não encontrado.');
  return testimonialOut(r);
}

export function listTestimonials({ deleted = false, status, q } = {}) {
  let sql = `${T_SELECT} WHERE t.deleted_at IS ${deleted ? 'NOT NULL' : 'NULL'}`;
  const args = [];
  if (status && STATUSES.includes(status)) {
    sql += ' AND t.status = ?';
    args.push(status);
  }
  if (q) {
    sql += ' AND (t.company_name LIKE ? OR t.person_name LIKE ?)';
    args.push(`%${q}%`, `%${q}%`);
  }
  sql += deleted ? ' ORDER BY t.deleted_at DESC' : ' ORDER BY t.display_order, t.created_at';
  return db
    .prepare(sql)
    .all(...args)
    .map(testimonialOut);
}

function cleanTestimonial(input, current = {}) {
  const clientId = pick(input, 'clientId', current.clientId) || null;
  let client = null;
  if (clientId) {
    client = db.prepare('SELECT id, name FROM clients WHERE id = ? AND deleted_at IS NULL').get(clientId);
    if (!client) throw new ValidationError('Cliente relacionado não encontrado.');
  }
  const companyName = str(pick(input, 'companyName', current.companyName), 'Empresa', 120) || client?.name || '';
  if (!companyName) throw new ValidationError('Preencha o campo: Empresa');
  return {
    client_id: client?.id ?? null,
    company_name: companyName,
    company_logo_url: mediaUrl(pick(input, 'companyLogoUrl', current.companyLogoUrl), 'Logo da empresa'),
    person_name: str(pick(input, 'personName', current.personName), 'Nome da pessoa', 120, { required: true }),
    person_role: str(pick(input, 'personRole', current.personRole), 'Cargo', 120),
    person_photo_url: mediaUrl(pick(input, 'personPhotoUrl', current.personPhotoUrl), 'Foto da pessoa'),
    content: str(pick(input, 'content', current.content), 'Depoimento', 1500, { required: true }),
    status: oneOf(pick(input, 'status', current.status ?? 'DRAFT'), STATUSES, 'Status'),
    featured: pick(input, 'featured', current.featured ?? false) ? 1 : 0,
  };
}

export const createTestimonial = (input) =>
  db.transaction(() => {
    const data = cleanTestimonial(input);
    const id = randomUUID();
    const t = now();
    db.prepare(
      `INSERT INTO testimonials (id, client_id, company_name, company_logo_url, person_name, person_role,
        person_photo_url, content, status, featured, display_order, created_at, updated_at)
       VALUES (@id, @client_id, @company_name, @company_logo_url, @person_name, @person_role, @person_photo_url,
        @content, @status, @featured, 9999, @t, @t)`,
    ).run({ ...data, id, t });
    moveTo('testimonials', id, input.displayOrder);
    return getTestimonial(id);
  })();

export const updateTestimonial = (id, input) =>
  db.transaction(() => {
    const before = getTestimonial(id);
    if (before.deletedAt) throw new ValidationError('Restaure o depoimento antes de editá-lo.');
    const data = cleanTestimonial(input, before);
    db.prepare(
      `UPDATE testimonials SET client_id=@client_id, company_name=@company_name, company_logo_url=@company_logo_url,
        person_name=@person_name, person_role=@person_role, person_photo_url=@person_photo_url, content=@content,
        status=@status, featured=@featured, updated_at=@t WHERE id=@id`,
    ).run({ ...data, id, t: now() });
    if (input.displayOrder !== undefined) moveTo('testimonials', id, input.displayOrder);
    return { before, after: getTestimonial(id) };
  })();

export const setTestimonialStatus = (id, status) =>
  updateTestimonial(id, { status: oneOf(status, STATUSES, 'Status') });
export const setTestimonialFeatured = (id, featured) => updateTestimonial(id, { featured: Boolean(featured) });
export const setTestimonialOrder = (id, position) =>
  db.transaction(() => {
    const before = getTestimonial(id);
    moveTo('testimonials', id, position);
    return { before, after: getTestimonial(id) };
  })();

export const deleteTestimonial = (id) =>
  db.transaction(() => {
    const before = getTestimonial(id);
    if (before.deletedAt) throw new ValidationError('O depoimento já está na lixeira.');
    db.prepare('UPDATE testimonials SET deleted_at = ?, updated_at = ? WHERE id = ?').run(now(), now(), id);
    renumber('testimonials');
    return before;
  })();

export const restoreTestimonial = (id) =>
  db.transaction(() => {
    const before = getTestimonial(id);
    if (!before.deletedAt) throw new ValidationError('O depoimento não está na lixeira.');
    db.prepare('UPDATE testimonials SET deleted_at = NULL, display_order = 9999, updated_at = ? WHERE id = ?').run(
      now(),
      id,
    );
    renumber('testimonials');
    return { before, after: getTestimonial(id) };
  })();

/* ================================================================== MÍDIA */
export const mediaOut = (r) =>
  r && {
    id: r.id,
    filename: r.filename,
    originalFilename: r.original_filename,
    mimeType: r.mime_type,
    size: r.size,
    url: r.url,
    altText: r.alt_text,
    uploadedBy: r.uploaded_by,
    uploadedByName: r.uploader_name ?? null,
    createdAt: r.created_at,
    deletedAt: r.deleted_at,
    usage:
      db.prepare('SELECT COUNT(*) n FROM clients WHERE logo_url = ? AND deleted_at IS NULL').get(r.url).n +
      db
        .prepare(
          'SELECT COUNT(*) n FROM testimonials WHERE (company_logo_url = ? OR person_photo_url = ?) AND deleted_at IS NULL',
        )
        .get(r.url, r.url).n,
  };

const M_SELECT = 'SELECT m.*, u.name AS uploader_name FROM media m LEFT JOIN users u ON u.id = m.uploaded_by';

export function getMedia(id) {
  const r = db.prepare(`${M_SELECT} WHERE m.id = ?`).get(id);
  if (!r) throw new NotFoundError('Arquivo não encontrado.');
  return mediaOut(r);
}

export const listMedia = ({ deleted = false } = {}) =>
  db
    .prepare(`${M_SELECT} WHERE m.deleted_at IS ${deleted ? 'NOT NULL' : 'NULL'} ORDER BY m.created_at DESC`)
    .all()
    .map(mediaOut);

export function createMedia({ filename, originalFilename, mimeType, size, altText, userId }) {
  const id = randomUUID();
  db.prepare(
    `INSERT INTO media (id, filename, original_filename, mime_type, size, url, alt_text, uploaded_by, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    filename,
    str(originalFilename, 'Nome do arquivo', 200) || filename,
    mimeType,
    size,
    `/media/${filename}`,
    str(altText, 'Texto alternativo', 200),
    userId,
    now(),
  );
  return getMedia(id);
}

export function updateMedia(id, input) {
  const before = getMedia(id);
  db.prepare('UPDATE media SET alt_text = ? WHERE id = ?').run(str(input.altText, 'Texto alternativo', 200), id);
  return { before, after: getMedia(id) };
}

export function deleteMedia(id) {
  const before = getMedia(id);
  if (before.deletedAt) throw new ValidationError('O arquivo já está na lixeira.');
  if (before.usage > 0)
    throw new ValidationError('Este arquivo está em uso por clientes ou depoimentos. Remova o uso antes de excluir.');
  db.prepare('UPDATE media SET deleted_at = ? WHERE id = ?').run(now(), id);
  return before;
}

export function restoreMedia(id) {
  const before = getMedia(id);
  db.prepare('UPDATE media SET deleted_at = NULL WHERE id = ?').run(id);
  return { before, after: getMedia(id) };
}

export const mediaFileIsPublic = (filename) =>
  Boolean(db.prepare('SELECT 1 FROM media WHERE filename = ? AND deleted_at IS NULL').get(filename));

/* ================================================================== USUÁRIOS */
export const userOut = (r) =>
  r && {
    id: r.id,
    name: r.name,
    email: r.email,
    role: r.role,
    status: r.status,
    lastLoginAt: r.last_login_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
const U_SELECT = 'SELECT u.*, r.code AS role FROM users u JOIN roles r ON r.id = u.role_id';
const roleId = (code) => db.prepare('SELECT id FROM roles WHERE code = ?').get(oneOf(code, ROLES, 'Perfil')).id;

export function getUser(id) {
  const r = db.prepare(`${U_SELECT} WHERE u.id = ?`).get(id);
  if (!r) throw new NotFoundError('Usuário não encontrado.');
  return userOut(r);
}
export const listUsers = () => db.prepare(`${U_SELECT} ORDER BY u.name`).all().map(userOut);
export const listRoles = () => db.prepare('SELECT code, name FROM roles ORDER BY id').all();

const email = (v) => {
  const e = str(v, 'E-mail', 200, { required: true }).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) throw new ValidationError('E-mail inválido.');
  return e;
};
function assertUniqueEmail(e, id) {
  if (db.prepare('SELECT 1 FROM users WHERE email = ? COLLATE NOCASE AND id <> ?').get(e, id ?? '')) {
    throw new ValidationError('Já existe um usuário com este e-mail.');
  }
}
const activeAdmins = () =>
  db
    .prepare(
      `SELECT COUNT(*) n FROM users u JOIN roles r ON r.id = u.role_id WHERE r.code='ADMIN' AND u.status='ACTIVE'`,
    )
    .get().n;

export function createUser(input, passwordProblem) {
  const e = email(input.email);
  assertUniqueEmail(e);
  const err = passwordProblem(input.password);
  if (err) throw new ValidationError(err);
  const id = randomUUID();
  const t = now();
  db.prepare(
    `INSERT INTO users (id, name, email, password_hash, role_id, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    str(input.name, 'Nome', 120, { required: true }),
    e,
    hashPassword(input.password),
    roleId(input.role ?? 'EDITOR'),
    oneOf(input.status ?? 'ACTIVE', ['ACTIVE', 'INACTIVE'], 'Status'),
    t,
    t,
  );
  return getUser(id);
}

export const updateUser = (id, input, actorId) =>
  db.transaction(() => {
    const before = getUser(id);
    const next = {
      name: str(pick(input, 'name', before.name), 'Nome', 120, { required: true }),
      email: email(pick(input, 'email', before.email)),
      role: oneOf(pick(input, 'role', before.role), ROLES, 'Perfil'),
      status: oneOf(pick(input, 'status', before.status), ['ACTIVE', 'INACTIVE'], 'Status'),
    };
    assertUniqueEmail(next.email, id);
    const losesAdmin =
      before.role === 'ADMIN' && before.status === 'ACTIVE' && (next.role !== 'ADMIN' || next.status !== 'ACTIVE');
    if (losesAdmin && activeAdmins() <= 1)
      throw new ValidationError('É preciso manter pelo menos um administrador ativo.');
    if (id === actorId && (next.status !== 'ACTIVE' || next.role !== before.role)) {
      throw new ValidationError('Você não pode alterar o próprio perfil ou desativar a própria conta.');
    }
    db.prepare('UPDATE users SET name=?, email=?, role_id=?, status=?, updated_at=? WHERE id=?').run(
      next.name,
      next.email,
      roleId(next.role),
      next.status,
      now(),
      id,
    );
    return { before, after: getUser(id) };
  })();

export function resetUserPassword(id, password, passwordProblem) {
  getUser(id);
  const err = passwordProblem(password);
  if (err) throw new ValidationError(err);
  db.prepare('UPDATE users SET password_hash=?, updated_at=? WHERE id=?').run(hashPassword(password), now(), id);
}

export const deleteUser = (id, actorId) =>
  db.transaction(() => {
    const before = getUser(id);
    if (id === actorId) throw new ValidationError('Você não pode excluir a própria conta.');
    if (before.role === 'ADMIN' && before.status === 'ACTIVE' && activeAdmins() <= 1) {
      throw new ValidationError('É preciso manter pelo menos um administrador ativo.');
    }
    db.prepare('DELETE FROM users WHERE id = ?').run(id);
    return before;
  })();

/* ================================================================== AUDITORIA */
export function listAudit({ limit = 50, offset = 0, entityType } = {}) {
  const lim = Math.min(Math.max(Number(limit) || 50, 1), 200);
  const off = Math.max(Number(offset) || 0, 0);
  const where = entityType ? 'WHERE a.entity_type = ?' : '';
  const args = entityType ? [entityType] : [];
  const rows = db
    .prepare(
      `SELECT a.*, u.name AS user_name, u.email AS user_email FROM audit_logs a LEFT JOIN users u ON u.id = a.user_id
       ${where} ORDER BY a.id DESC LIMIT ? OFFSET ?`,
    )
    .all(...args, lim, off);
  const total = db.prepare(`SELECT COUNT(*) n FROM audit_logs a ${where}`).get(...args).n;
  return {
    total,
    items: rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      userName: r.user_name,
      userEmail: r.user_email,
      action: r.action,
      entityType: r.entity_type,
      entityId: r.entity_id,
      oldData: r.old_data ? JSON.parse(r.old_data) : null,
      newData: r.new_data ? JSON.parse(r.new_data) : null,
      ipAddress: r.ip_address,
      userAgent: r.user_agent,
      createdAt: r.created_at,
    })),
  };
}

/* ================================================================== DASHBOARD */
export function dashboard() {
  const c = db
    .prepare(
      `SELECT COUNT(*) total,
         SUM(status='PUBLISHED') published, SUM(status='DRAFT') draft, SUM(status='ARCHIVED') archived,
         SUM(highlight_level='HIGHLIGHT') highlights
       FROM clients WHERE deleted_at IS NULL`,
    )
    .get();
  const t = db
    .prepare(
      `SELECT COUNT(*) total,
         SUM(status='PUBLISHED') published, SUM(status='DRAFT') draft, SUM(status='ARCHIVED') archived,
         SUM(featured=1) featured
       FROM testimonials WHERE deleted_at IS NULL`,
    )
    .get();
  const featured = db.prepare(`SELECT * FROM clients WHERE highlight_level='FEATURED' AND deleted_at IS NULL`).get();
  const trash =
    db.prepare('SELECT COUNT(*) n FROM clients WHERE deleted_at IS NOT NULL').get().n +
    db.prepare('SELECT COUNT(*) n FROM testimonials WHERE deleted_at IS NOT NULL').get().n;
  return {
    clients: { ...c, featured: clientOut(featured) ?? null },
    testimonials: t,
    trash,
    media: db.prepare('SELECT COUNT(*) n FROM media WHERE deleted_at IS NULL').get().n,
    latestClients: db
      .prepare('SELECT * FROM clients WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 5')
      .all()
      .map(clientOut),
    latestTestimonials: db
      .prepare(`${T_SELECT} WHERE t.deleted_at IS NULL ORDER BY t.created_at DESC LIMIT 5`)
      .all()
      .map(testimonialOut),
  };
}

/* ================================================================== API PÚBLICA (somente leitura) */
const PUBLIC = "status = 'PUBLISHED' AND deleted_at IS NULL";

export function publicClients() {
  const rows = db.prepare(`SELECT * FROM clients WHERE ${PUBLIC} ORDER BY display_order, created_at`).all();
  const view = (r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    logo: r.logo_url,
    icon: r.icon,
    category: r.category,
    description: r.description,
    caseText: r.case_text,
    services: JSON.parse(r.services || '[]'),
  });
  const featured = rows.find((r) => r.highlight_level === 'FEATURED');
  return {
    featured: featured ? view(featured) : null,
    highlights: rows.filter((r) => r.highlight_level === 'HIGHLIGHT').map(view),
    normal: rows.filter((r) => r.highlight_level === 'NORMAL').map(view),
  };
}

export function publicTestimonials() {
  return db
    .prepare(
      `${T_SELECT} WHERE t.status = 'PUBLISHED' AND t.deleted_at IS NULL ORDER BY t.featured DESC, t.display_order, t.created_at`,
    )
    .all()
    .map((r) => ({
      id: r.id,
      company: r.company_name,
      // depoimento ligado a um cliente usa a logo do cliente quando não tem logo própria
      companyLogo: r.company_logo_url || r.client_logo_url || '',
      personName: r.person_name,
      personRole: r.person_role,
      personPhoto: r.person_photo_url,
      content: r.content,
      featured: Boolean(r.featured),
    }));
}
