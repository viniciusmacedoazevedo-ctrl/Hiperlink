/**
 * Banco de dados (SQLite) do painel administrativo.
 *
 * Tabelas: roles, users, sessions, clients, testimonials, media, audit_logs.
 * - Valores internos sem acentos (ADMIN/EDITOR, DRAFT/PUBLISHED/ARCHIVED, NORMAL/HIGHLIGHT/FEATURED).
 * - Exclusão lógica (deleted_at) em clientes, depoimentos e mídia.
 * - Índice único garante no próprio banco apenas UM cliente "FEATURED" (super destaque) ativo.
 */
import Database from 'better-sqlite3';
import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { randomBytes, randomUUID, scryptSync } from 'node:crypto';
import { basename, resolve } from 'node:path';
import {
  BOOTSTRAP_ADMIN,
  DATA_DIR,
  DB_FILE,
  LEGACY_CONTENT_FILE,
  LEGACY_UPLOADS_DIR,
  MEDIA_DIR,
  SEED_FILE,
  isProduction,
} from './config.mjs';

mkdirSync(DATA_DIR, { recursive: true });
mkdirSync(MEDIA_DIR, { recursive: true });

export const db = new Database(DB_FILE);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('busy_timeout = 3000');

export const now = () => new Date().toISOString();

/* ------------------------------------------------------------------ senhas */
/** Hash scrypt: scrypt$N$salt$hash (base64). Nunca armazenamos senha em texto. */
export function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$16384$${salt.toString('base64')}$${hash.toString('base64')}`;
}

/* ------------------------------------------------------------------ esquema */
const MIGRATIONS = [
  `
  CREATE TABLE roles (
    id   INTEGER PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL
  );
  INSERT INTO roles (id, code, name) VALUES (1, 'ADMIN', 'Administrador'), (2, 'EDITOR', 'Editor');

  CREATE TABLE users (
    id            TEXT PRIMARY KEY,
    name          TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    role_id       INTEGER NOT NULL REFERENCES roles(id),
    status        TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    last_login_at TEXT,
    created_at    TEXT NOT NULL,
    updated_at    TEXT NOT NULL
  );

  CREATE TABLE sessions (
    token_hash TEXT PRIMARY KEY,
    user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT
  );
  CREATE INDEX sessions_user ON sessions(user_id);

  CREATE TABLE media (
    id                TEXT PRIMARY KEY,
    filename          TEXT NOT NULL UNIQUE,
    original_filename TEXT NOT NULL,
    mime_type         TEXT NOT NULL,
    size              INTEGER NOT NULL,
    url               TEXT NOT NULL,
    alt_text          TEXT NOT NULL DEFAULT '',
    uploaded_by       TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at        TEXT NOT NULL,
    deleted_at        TEXT
  );

  CREATE TABLE clients (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    slug            TEXT NOT NULL UNIQUE,
    logo_url        TEXT NOT NULL DEFAULT '',
    icon            TEXT NOT NULL DEFAULT 'building',
    category        TEXT NOT NULL DEFAULT '',
    description     TEXT NOT NULL DEFAULT '',
    case_text       TEXT NOT NULL DEFAULT '',
    services        TEXT NOT NULL DEFAULT '[]',
    status          TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    highlight_level TEXT NOT NULL DEFAULT 'NORMAL' CHECK (highlight_level IN ('NORMAL', 'HIGHLIGHT', 'FEATURED')),
    display_order   INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT NOT NULL,
    updated_at      TEXT NOT NULL,
    deleted_at      TEXT
  );
  CREATE UNIQUE INDEX clients_single_featured ON clients(highlight_level)
    WHERE highlight_level = 'FEATURED' AND deleted_at IS NULL;

  CREATE TABLE testimonials (
    id               TEXT PRIMARY KEY,
    client_id        TEXT REFERENCES clients(id) ON DELETE SET NULL,
    company_name     TEXT NOT NULL,
    company_logo_url TEXT NOT NULL DEFAULT '',
    person_name      TEXT NOT NULL,
    person_role      TEXT NOT NULL DEFAULT '',
    person_photo_url TEXT NOT NULL DEFAULT '',
    content          TEXT NOT NULL,
    status           TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    featured         INTEGER NOT NULL DEFAULT 0,
    display_order    INTEGER NOT NULL DEFAULT 0,
    created_at       TEXT NOT NULL,
    updated_at       TEXT NOT NULL,
    deleted_at       TEXT
  );
  CREATE INDEX testimonials_client ON testimonials(client_id);

  CREATE TABLE audit_logs (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     TEXT REFERENCES users(id) ON DELETE SET NULL,
    action      TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id   TEXT,
    old_data    TEXT,
    new_data    TEXT,
    ip_address  TEXT,
    user_agent  TEXT,
    created_at  TEXT NOT NULL
  );
  CREATE INDEX audit_created ON audit_logs(created_at);
  `,
];

function migrate() {
  const version = db.pragma('user_version', { simple: true });
  for (let v = version; v < MIGRATIONS.length; v++) {
    db.transaction(() => {
      db.exec(MIGRATIONS[v]);
      db.pragma(`user_version = ${v + 1}`);
    })();
  }
}

/* ------------------------------------------------------------------ utilitários */
export function slugify(text) {
  return String(text)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' e ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/* ------------------------------------------------------------------ conteúdo inicial */
function registerLegacyUpload(url, created) {
  // /uploads/arquivo.png (versão anterior) → data/media + tabela media
  const m = /^\/uploads\/([a-zA-Z0-9_-]+\.(png|jpe?g|webp))$/.exec(url || '');
  if (!m) return '';
  const src = resolve(LEGACY_UPLOADS_DIR, m[1]);
  if (!existsSync(src)) return '';
  const dest = resolve(MEDIA_DIR, m[1]);
  if (!existsSync(dest)) copyFileSync(src, dest);
  const exists = db.prepare('SELECT url FROM media WHERE filename = ?').get(m[1]);
  if (!exists) {
    const mime = m[2] === 'png' ? 'image/png' : m[2] === 'webp' ? 'image/webp' : 'image/jpeg';
    db.prepare(
      `INSERT INTO media (id, filename, original_filename, mime_type, size, url, alt_text, uploaded_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, '', NULL, ?)`,
    ).run(randomUUID(), m[1], m[1], mime, readFileSync(dest).length, `/media/${m[1]}`, created);
  }
  return `/media/${m[1]}`;
}

function seedContent() {
  const count = db.prepare('SELECT COUNT(*) n FROM clients').get().n;
  if (count > 0) return;
  const t = now();
  const insertClient = db.prepare(
    `INSERT INTO clients (id, name, slug, logo_url, icon, category, description, case_text, services, status,
       highlight_level, display_order, created_at, updated_at)
     VALUES (@id, @name, @slug, @logo_url, @icon, @category, @description, @case_text, @services, @status,
       @highlight_level, @display_order, @created_at, @updated_at)`,
  );
  const insertTestimonial = db.prepare(
    `INSERT INTO testimonials (id, client_id, company_name, company_logo_url, person_name, person_role,
       person_photo_url, content, status, featured, display_order, created_at, updated_at)
     VALUES (@id, @client_id, @company_name, @company_logo_url, @person_name, @person_role, @person_photo_url,
       @content, @status, @featured, @display_order, @created_at, @updated_at)`,
  );
  const usedSlugs = new Set();
  const uniqueSlug = (base) => {
    let s = base || 'cliente';
    for (let i = 2; usedSlugs.has(s); i++) s = `${base}-${i}`;
    usedSlugs.add(s);
    return s;
  };

  db.transaction(() => {
    // Versão anterior do painel (data/content.json): migra o que o usuário já cadastrou.
    if (existsSync(LEGACY_CONTENT_FILE)) {
      const legacy = JSON.parse(readFileSync(LEGACY_CONTENT_FILE, 'utf8'));
      const hl = { super: 'FEATURED', destaque: 'HIGHLIGHT', normal: 'NORMAL' };
      let hasFeatured = false;
      const idByName = new Map();
      (legacy.clients ?? [])
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .forEach((c, i) => {
          let level = hl[c.highlight] ?? 'NORMAL';
          if (level === 'FEATURED' && hasFeatured) level = 'HIGHLIGHT';
          if (level === 'FEATURED') hasFeatured = true;
          const id = randomUUID();
          idByName.set(
            String(c.name ?? '')
              .trim()
              .toLowerCase(),
            id,
          );
          insertClient.run({
            id,
            name: c.name,
            slug: uniqueSlug(slugify(c.name)),
            logo_url: registerLegacyUpload(c.logo, t),
            icon: c.icon || 'building',
            category: c.segment || '',
            description: c.description || '',
            case_text: c.caseText || '',
            services: JSON.stringify(c.services ?? []),
            status: c.active === false ? 'ARCHIVED' : 'PUBLISHED',
            highlight_level: level,
            display_order: i + 1,
            created_at: t,
            updated_at: t,
          });
        });
      (legacy.testimonials ?? [])
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .forEach((x, i) =>
          insertTestimonial.run({
            id: randomUUID(),
            client_id:
              idByName.get(
                String(x.company ?? '')
                  .trim()
                  .toLowerCase(),
              ) ?? null,
            company_name: x.company || '',
            company_logo_url: registerLegacyUpload(x.companyLogo, t),
            person_name: x.personName || '',
            person_role: x.personRole || '',
            person_photo_url: registerLegacyUpload(x.personPhoto, t),
            content: x.quote || x.content || '',
            status: x.active === false ? 'ARCHIVED' : 'PUBLISHED',
            featured: x.featured ? 1 : 0,
            display_order: i + 1,
            created_at: t,
            updated_at: t,
          }),
        );
      console.log(`[db] Conteúdo migrado de ${basename(LEGACY_CONTENT_FILE)}.`);
      return;
    }

    const seed = JSON.parse(readFileSync(SEED_FILE, 'utf8'));
    seed.clients.forEach((c, i) =>
      insertClient.run({
        id: randomUUID(),
        name: c.name,
        slug: uniqueSlug(c.slug || slugify(c.name)),
        logo_url: '',
        icon: c.icon || 'building',
        category: c.category || '',
        description: c.description || '',
        case_text: c.caseText || '',
        services: JSON.stringify(c.services ?? []),
        status: c.status || 'PUBLISHED',
        highlight_level: c.highlightLevel || 'NORMAL',
        display_order: i + 1,
        created_at: t,
        updated_at: t,
      }),
    );
  })();
}

/**
 * Primeiro administrador: criado apenas quando não há nenhum usuário.
 * Em desenvolvimento, sem ADMIN_PASSWORD, gera uma senha temporária e mostra no terminal.
 */
let bootstrapMessage = '';
function bootstrapAdmin() {
  const count = db.prepare('SELECT COUNT(*) n FROM users').get().n;
  if (count > 0) return;
  let password = BOOTSTRAP_ADMIN.password;
  let generated = false;
  if (!password) {
    if (isProduction) {
      bootstrapMessage =
        '\n  [admin] Nenhum usuário cadastrado. Defina ADMIN_EMAIL e ADMIN_PASSWORD no .env e reinicie,\n  ou rode: npm run admin:create -- --email voce@empresa.com --name "Seu nome"\n';
      return;
    }
    password = randomBytes(9).toString('base64url');
    generated = true;
  }
  const t = now();
  db.prepare(
    `INSERT INTO users (id, name, email, password_hash, role_id, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, 1, 'ACTIVE', ?, ?)`,
  ).run(randomUUID(), BOOTSTRAP_ADMIN.name, BOOTSTRAP_ADMIN.email, hashPassword(password), t, t);
  bootstrapMessage = generated
    ? `\n  Área administrativa: /admin\n  Primeiro acesso — e-mail: ${BOOTSTRAP_ADMIN.email}\n  Senha temporária: ${password}\n  Troque a senha em "Minha conta" após entrar (ou defina ADMIN_PASSWORD no .env antes da primeira execução).\n`
    : `\n  Área administrativa: /admin — administrador criado: ${BOOTSTRAP_ADMIN.email}\n`;
}

migrate();
seedContent();
bootstrapAdmin();

export function printAdminBanner(log = console.log) {
  if (bootstrapMessage) log(bootstrapMessage);
  else log('\n  Área administrativa: /admin\n');
}
