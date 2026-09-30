/**
 * Autenticação:
 * - login por e-mail + senha (hash scrypt, comparação em tempo constante);
 * - sessão em cookie HttpOnly + SameSite=Strict (+ Secure em HTTPS), token guardado como hash no banco;
 * - bloqueio após 5 falhas por IP ou por e-mail em 15 minutos;
 * - requisições de escrita exigem o cabeçalho X-Requested-With: fetch (proteção extra contra CSRF).
 */
import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { SESSION_TTL_MS } from './config.mjs';
import { db, hashPassword, now } from './db.mjs';
import { audit } from './audit.mjs';
import { PERMISSIONS, can } from './permissions.mjs';

const COOKIE = 'hl_session';
const sha256 = (s) => createHash('sha256').update(s).digest('hex');

export function verifyPassword(password, stored) {
  if (typeof password !== 'string' || password.length > 256 || !stored) return false;
  const [scheme, n, salt, hash] = stored.split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'base64');
  const actual = scryptSync(password, Buffer.from(salt, 'base64'), expected.length, { N: Number(n), r: 8, p: 1 });
  return timingSafeEqual(actual, expected);
}
// Hash de referência para gastar o mesmo tempo quando o e-mail não existe
const DUMMY_HASH = hashPassword(randomBytes(12).toString('hex'));

/* ------------------------------------------------------------------ limite de tentativas */
const WINDOW = 15 * 60 * 1000;
const MAX = 5;
const failures = new Map();
const locked = (key) => {
  const f = failures.get(key);
  if (!f) return false;
  if (Date.now() > f.until) {
    failures.delete(key);
    return false;
  }
  return f.count >= MAX;
};
const fail = (key) => {
  const f = failures.get(key);
  if (!f || Date.now() > f.until) failures.set(key, { count: 1, until: Date.now() + WINDOW });
  else f.count += 1;
};

/* ------------------------------------------------------------------ cookies */
const parseCookies = (header = '') =>
  Object.fromEntries(
    header
      .split(';')
      .map((p) => p.trim().split('='))
      .filter(([k, v]) => k && v)
      .map(([k, v]) => [k, decodeURIComponent(v)]),
  );
const isHttps = (req) => req.secure || req.headers['x-forwarded-proto'] === 'https';

function setCookie(req, res, value, maxAgeMs) {
  const parts = [
    `${COOKIE}=${value}`,
    'Path=/api',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${Math.floor(maxAgeMs / 1000)}`,
  ];
  if (isHttps(req)) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

const findSession = db.prepare(
  `SELECT u.id, u.name, u.email, u.status, r.code AS role, s.expires_at
     FROM sessions s JOIN users u ON u.id = s.user_id JOIN roles r ON r.id = u.role_id
    WHERE s.token_hash = ?`,
);

export const publicUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  permissions: PERMISSIONS[u.role] ?? [],
});

/** Middleware: carrega o usuário da sessão (se houver) em req.user. */
export function loadSession(req, _res, next) {
  const token = parseCookies(req.headers.cookie)[COOKIE];
  if (token) {
    const row = findSession.get(sha256(token));
    if (row && row.expires_at > now() && row.status === 'ACTIVE') {
      req.user = row;
      req.sessionToken = token;
    } else if (row) {
      db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(sha256(token));
    }
  }
  next();
}

export function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Sessão expirada. Entre novamente.' });
  if (req.method !== 'GET' && req.headers['x-requested-with'] !== 'fetch') {
    return res.status(403).json({ error: 'Requisição recusada.' });
  }
  next();
}

/** Middleware de autorização por permissão. */
export const requirePermission = (permission) => (req, res, next) =>
  can(req.user?.role, permission) ? next() : res.status(403).json({ error: 'Você não tem permissão para esta ação.' });

/* ------------------------------------------------------------------ handlers /api/auth */
export function login(req, res) {
  if (req.headers['x-requested-with'] !== 'fetch') return res.status(403).json({ error: 'Requisição recusada.' });
  const ip = req.ip || 'unknown';
  const email = String(req.body?.email ?? '')
    .trim()
    .toLowerCase()
    .slice(0, 200);
  const password = req.body?.password;
  if (locked(`ip:${ip}`) || locked(`email:${email}`)) {
    return res.status(429).json({ error: 'Muitas tentativas. Aguarde 15 minutos e tente novamente.' });
  }
  const user = db
    .prepare(
      `SELECT u.*, r.code AS role FROM users u JOIN roles r ON r.id = u.role_id WHERE u.email = ? COLLATE NOCASE`,
    )
    .get(email);
  const ok = verifyPassword(String(password ?? ''), user?.password_hash ?? DUMMY_HASH) && Boolean(user);
  if (!ok || user.status !== 'ACTIVE') {
    fail(`ip:${ip}`);
    fail(`email:${email}`);
    audit(req, 'LOGIN_FAILED', 'user', user?.id ?? null, null, { email });
    return res.status(401).json({ error: 'E-mail ou senha incorretos, ou usuário inativo.' });
  }
  failures.delete(`ip:${ip}`);
  failures.delete(`email:${email}`);
  const token = randomBytes(32).toString('base64url');
  const t = now();
  db.prepare(
    `INSERT INTO sessions (token_hash, user_id, expires_at, created_at, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(
    sha256(token),
    user.id,
    new Date(Date.now() + SESSION_TTL_MS).toISOString(),
    t,
    ip,
    String(req.headers['user-agent'] ?? '').slice(0, 300),
  );
  db.prepare('UPDATE users SET last_login_at = ? WHERE id = ?').run(t, user.id);
  req.user = user;
  audit(req, 'LOGIN', 'user', user.id, null, null);
  setCookie(req, res, token, SESSION_TTL_MS);
  res.json({ user: publicUser(user) });
}

export function logout(req, res) {
  if (req.sessionToken) {
    db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(sha256(req.sessionToken));
    audit(req, 'LOGOUT', 'user', req.user?.id, null, null);
  }
  setCookie(req, res, '', 0);
  res.json({ ok: true });
}

export const me = (req, res) => res.json({ user: req.user ? publicUser(req.user) : null });

export function changeOwnPassword(req, res) {
  const { currentPassword, newPassword } = req.body ?? {};
  const row = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);
  if (!verifyPassword(String(currentPassword ?? ''), row?.password_hash)) {
    return res.status(400).json({ error: 'Senha atual incorreta.' });
  }
  const err = passwordProblem(newPassword);
  if (err) return res.status(400).json({ error: err });
  db.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?').run(
    hashPassword(newPassword),
    now(),
    req.user.id,
  );
  // encerra as outras sessões do usuário
  db.prepare('DELETE FROM sessions WHERE user_id = ? AND token_hash <> ?').run(req.user.id, sha256(req.sessionToken));
  audit(req, 'PASSWORD_CHANGE', 'user', req.user.id, null, null);
  res.json({ ok: true });
}

export function passwordProblem(pwd) {
  if (typeof pwd !== 'string' || pwd.length < 10) return 'A senha deve ter pelo menos 10 caracteres.';
  if (pwd.length > 200) return 'Senha muito longa.';
  return null;
}

export const endSessionsOf = (userId) => db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);

// limpeza periódica de sessões expiradas
setInterval(() => db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(now()), 60 * 60 * 1000).unref();
