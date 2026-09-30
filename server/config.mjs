/**
 * Configuração do servidor (API + área administrativa).
 *
 * Variáveis de ambiente (arquivo .env na raiz, opcional — veja .env.example):
 *   ADMIN_USER           usuário do painel (padrão: "admin")
 *   ADMIN_PASSWORD       senha do painel (texto) — OU —
 *   ADMIN_PASSWORD_HASH  hash scrypt gerado por `npm run admin:hash`
 *   DATA_DIR             pasta dos dados e uploads (padrão: ./data)
 *   PORT                 porta do servidor de produção (padrão: 3000)
 */
import { existsSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { resolve } from 'node:path';

export const ROOT = resolve(import.meta.dirname, '..');

const envFile = resolve(ROOT, '.env');
if (existsSync(envFile)) {
  try {
    process.loadEnvFile(envFile);
  } catch {
    /* .env inválido: segue com as variáveis do sistema */
  }
}

export const isProduction = process.env.NODE_ENV === 'production';
export const DATA_DIR = resolve(ROOT, process.env.DATA_DIR || 'data');
export const UPLOADS_DIR = resolve(DATA_DIR, 'uploads');
export const CONTENT_FILE = resolve(DATA_DIR, 'content.json');
export const SEED_FILE = resolve(ROOT, 'server/seed.json');

export const ADMIN_USER = process.env.ADMIN_USER || 'admin';

/**
 * Sem senha configurada:
 * - em desenvolvimento, gera uma senha temporária e mostra no terminal;
 * - em produção, o login fica desativado (a API pública continua funcionando).
 */
let generated = null;
if (!process.env.ADMIN_PASSWORD && !process.env.ADMIN_PASSWORD_HASH && !isProduction) {
  generated = randomBytes(9).toString('base64url');
}
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || generated;
export const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || null;
export const adminEnabled = Boolean(ADMIN_PASSWORD || ADMIN_PASSWORD_HASH);

export function printAdminBanner(log = console.log) {
  if (generated) {
    log(
      `\n  Área administrativa: /admin\n  Usuário: ${ADMIN_USER}\n  Senha temporária (dev): ${generated}\n  Defina ADMIN_PASSWORD no arquivo .env para uma senha fixa.\n`,
    );
  } else if (!adminEnabled) {
    log('\n  [admin] ADMIN_PASSWORD não definida — login da área administrativa desativado.\n');
  }
}
