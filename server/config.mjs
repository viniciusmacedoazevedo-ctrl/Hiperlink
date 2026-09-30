/**
 * Configuração do servidor (API + área administrativa).
 *
 * Variáveis de ambiente (arquivo .env na raiz, opcional — veja .env.example):
 *   ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD   primeiro administrador (criado só se não houver usuários)
 *   DATA_DIR                                    pasta do banco e das mídias (padrão: ./data)
 *   PORT                                        porta do servidor de produção (padrão: 3000)
 */
import { existsSync } from 'node:fs';
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
export const DB_FILE = resolve(DATA_DIR, 'hiperlink.db');
export const MEDIA_DIR = resolve(DATA_DIR, 'media');
export const SEED_FILE = resolve(ROOT, 'server/seed.json');
/** Arquivos da versão anterior do painel (migrados automaticamente na primeira execução). */
export const LEGACY_CONTENT_FILE = resolve(DATA_DIR, 'content.json');
export const LEGACY_UPLOADS_DIR = resolve(DATA_DIR, 'uploads');

export const BOOTSTRAP_ADMIN = {
  name: process.env.ADMIN_NAME || 'Administrador',
  email: (process.env.ADMIN_EMAIL || 'admin@hiperlink.local').trim().toLowerCase(),
  password: process.env.ADMIN_PASSWORD || '',
};

export const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;
export const MIN_PASSWORD = 10;
