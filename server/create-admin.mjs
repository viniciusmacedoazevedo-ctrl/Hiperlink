/**
 * Cria (ou redefine a senha de) um administrador pelo terminal — útil em produção.
 *   npm run admin:create -- --email voce@empresa.com --name "Seu nome" [--password "senha"]
 * Sem --password, uma senha forte é gerada e exibida uma única vez.
 */
import { randomBytes, randomUUID } from 'node:crypto';
import { db, hashPassword, now } from './db.mjs';

const args = Object.fromEntries(
  process.argv
    .slice(2)
    .reduce((acc, cur, i, arr) => (cur.startsWith('--') ? [...acc, [cur.slice(2), arr[i + 1]]] : acc), []),
);
const email = String(args.email ?? '')
  .trim()
  .toLowerCase();
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error(
    'Uso: npm run admin:create -- --email voce@empresa.com --name "Seu nome" [--password "senha com 10+ caracteres"]',
  );
  process.exit(1);
}
const password = args.password || randomBytes(12).toString('base64url');
if (password.length < 10) {
  console.error('A senha deve ter pelo menos 10 caracteres.');
  process.exit(1);
}
const t = now();
const existing = db.prepare('SELECT id FROM users WHERE email = ? COLLATE NOCASE').get(email);
if (existing) {
  db.prepare(`UPDATE users SET password_hash = ?, role_id = 1, status = 'ACTIVE', updated_at = ? WHERE id = ?`).run(
    hashPassword(password),
    t,
    existing.id,
  );
  db.prepare('DELETE FROM sessions WHERE user_id = ?').run(existing.id);
  console.log(`Senha redefinida e perfil ADMIN ativo para ${email}.`);
} else {
  db.prepare(
    `INSERT INTO users (id, name, email, password_hash, role_id, status, created_at, updated_at) VALUES (?, ?, ?, ?, 1, 'ACTIVE', ?, ?)`,
  ).run(randomUUID(), args.name || 'Administrador', email, hashPassword(password), t, t);
  console.log(`Administrador criado: ${email}`);
}
if (!args.password) console.log(`Senha gerada (anote agora): ${password}`);
