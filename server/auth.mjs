/**
 * Autenticação da área administrativa.
 * - Senha comparada em tempo constante (scrypt).
 * - Sessão em cookie HttpOnly + SameSite=Strict (+ Secure em HTTPS), expira em 8 horas.
 * - Limite de 5 tentativas de login falhas por IP a cada 15 minutos.
 * - Requisições de escrita exigem o cabeçalho X-Requested-With (proteção extra contra CSRF).
 */
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { ADMIN_PASSWORD, ADMIN_PASSWORD_HASH, ADMIN_USER, adminEnabled } from './config.mjs';

const COOKIE = 'hl_admin';
const SESSION_TTL = 8 * 60 * 60 * 1000;
const sessions = new Map(); // token -> expiresAt

/** Formato do hash: scrypt$<salt base64>$<hash base64> */
export function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `scrypt$${salt.toString('base64')}$${hash.toString('base64')}`;
}

const expectedUser = scryptSync(ADMIN_USER, 'user-salt', 32);
const plainKey = ADMIN_PASSWORD ? scryptSync(ADMIN_PASSWORD, 'plain-salt', 64) : null;

function checkPassword(password) {
  if (typeof password !== 'string' || password.length > 256) return false;
  if (ADMIN_PASSWORD_HASH) {
    const [scheme, salt, hash] = ADMIN_PASSWORD_HASH.split('$');
    if (scheme !== 'scrypt' || !salt || !hash) return false;
    const expected = Buffer.from(hash, 'base64');
    const actual = scryptSync(password, Buffer.from(salt, 'base64'), expected.length);
    return timingSafeEqual(actual, expected);
  }
  if (!plainKey) return false;
  return timingSafeEqual(scryptSync(password, 'plain-salt', 64), plainKey);
}

function checkUser(username) {
  if (typeof username !== 'string' || username.length > 128) return false;
  return timingSafeEqual(scryptSync(username, 'user-salt', 32), expectedUser);
}

/* ---------------------------------------------------------------- limite de tentativas */
const attempts = new Map(); // ip -> { count, until }
const WINDOW = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function isLocked(ip) {
  const a = attempts.get(ip);
  if (!a) return false;
  if (Date.now() > a.until) {
    attempts.delete(ip);
    return false;
  }
  return a.count >= MAX_ATTEMPTS;
}
function registerFailure(ip) {
  const a = attempts.get(ip);
  if (!a || Date.now() > a.until) attempts.set(ip, { count: 1, until: Date.now() + WINDOW });
  else a.count += 1;
}

/* ---------------------------------------------------------------- cookies */
function parseCookies(header = '') {
  return Object.fromEntries(
    header
      .split(';')
      .map((p) => p.trim().split('='))
      .filter(([k, v]) => k && v)
      .map(([k, v]) => [k, decodeURIComponent(v)]),
  );
}
const isHttps = (req) => req.secure || req.headers['x-forwarded-proto'] === 'https';

function setSessionCookie(req, res, token, maxAgeMs) {
  const parts = [
    `${COOKIE}=${token}`,
    'Path=/api/admin',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${Math.floor(maxAgeMs / 1000)}`,
  ];
  if (isHttps(req)) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

function currentSession(req) {
  const token = parseCookies(req.headers.cookie)[COOKIE];
  if (!token) return null;
  const exp = sessions.get(token);
  if (!exp || exp < Date.now()) {
    sessions.delete(token);
    return null;
  }
  return token;
}

/* ---------------------------------------------------------------- handlers */
export function login(req, res) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  if (!adminEnabled) return res.status(503).json({ error: 'Área administrativa desativada: defina ADMIN_PASSWORD.' });
  if (isLocked(ip)) return res.status(429).json({ error: 'Muitas tentativas. Aguarde 15 minutos e tente novamente.' });
  const { username, password } = req.body ?? {};
  const okUser = checkUser(username);
  const okPass = checkPassword(password);
  if (!okUser || !okPass) {
    registerFailure(ip);
    return res.status(401).json({ error: 'Usuário ou senha incorretos.' });
  }
  attempts.delete(ip);
  const token = randomBytes(32).toString('base64url');
  sessions.set(token, Date.now() + SESSION_TTL);
  setSessionCookie(req, res, token, SESSION_TTL);
  res.json({ ok: true, user: ADMIN_USER });
}

export function logout(req, res) {
  const token = currentSession(req);
  if (token) sessions.delete(token);
  setSessionCookie(req, res, '', 0);
  res.json({ ok: true });
}

export function session(req, res) {
  res.json({
    authenticated: Boolean(currentSession(req)),
    user: currentSession(req) ? ADMIN_USER : null,
    enabled: adminEnabled,
  });
}

/** Middleware: exige sessão válida; em métodos de escrita exige também X-Requested-With. */
export function requireAuth(req, res, next) {
  if (!currentSession(req)) return res.status(401).json({ error: 'Sessão expirada. Entre novamente.' });
  if (req.method !== 'GET' && req.headers['x-requested-with'] !== 'fetch') {
    return res.status(403).json({ error: 'Requisição recusada.' });
  }
  next();
}

// limpeza periódica de sessões expiradas
setInterval(
  () => {
    const now = Date.now();
    for (const [t, exp] of sessions) if (exp < now) sessions.delete(t);
  },
  60 * 60 * 1000,
).unref();
