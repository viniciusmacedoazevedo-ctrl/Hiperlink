/**
 * Aplicação Express com a API do site:
 *   GET  /api/public/content          → clientes e depoimentos ATIVOS (usado pelas páginas públicas)
 *   /api/admin/*                      → painel administrativo (autenticado)
 *   GET  /uploads/*                   → imagens enviadas pelo painel
 *
 * Usada tanto pelo servidor de desenvolvimento do Vite (middleware) quanto
 * pelo servidor de produção (server/index.mjs).
 */
import express from 'express';
import { randomBytes } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { UPLOADS_DIR } from './config.mjs';
import { login, logout, requireAuth, session } from './auth.mjs';
import * as store from './store.mjs';

const MAX_UPLOAD = 2 * 1024 * 1024; // 2 MB

/** Confere o tipo real do arquivo pelos primeiros bytes (não confia no nome/cabeçalho). */
function sniffImage(buf) {
  if (buf.length > 8 && buf[0] === 0x89 && buf.toString('ascii', 1, 4) === 'PNG') return 'png';
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg';
  if (buf.length > 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP')
    return 'webp';
  return null;
}

const asyncRoute = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch((err) => {
    if (err instanceof store.ValidationError) return res.status(400).json({ error: err.message });
    next(err);
  });

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 'loopback, linklocal, uniquelocal');

  // Cabeçalhos de segurança da API
  app.use(['/api', '/uploads'], (_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'same-origin');
    next();
  });

  /* ---------------------------------------------------------- uploads (públicos, somente leitura) */
  app.use(
    '/uploads',
    express.static(UPLOADS_DIR, {
      maxAge: '30d',
      immutable: true,
      fallthrough: false,
      setHeaders: (res) => res.setHeader('Content-Security-Policy', "default-src 'none'; img-src 'self'"),
    }),
  );

  /* ---------------------------------------------------------- API pública */
  app.get(
    '/api/public/content',
    asyncRoute(async (_req, res) => {
      res.setHeader('Cache-Control', 'no-cache');
      res.json(await store.getPublic());
    }),
  );

  /* ---------------------------------------------------------- API administrativa */
  const admin = express.Router();
  admin.use((_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });
  admin.use(express.json({ limit: '100kb' }));

  admin.get('/session', session);
  admin.post('/login', login);
  admin.post('/logout', logout);

  admin.use(requireAuth);

  admin.get(
    '/content',
    asyncRoute(async (_req, res) => res.json(await store.getAll())),
  );

  admin.post(
    '/clients',
    asyncRoute(async (req, res) => res.status(201).json(await store.createClient(req.body ?? {}))),
  );
  admin.put(
    '/clients/:id',
    asyncRoute(async (req, res) => {
      const c = await store.updateClient(req.params.id, req.body ?? {});
      return c ? res.json(c) : res.status(404).json({ error: 'Cliente não encontrado.' });
    }),
  );
  admin.delete(
    '/clients/:id',
    asyncRoute(async (req, res) =>
      (await store.deleteClient(req.params.id))
        ? res.status(204).end()
        : res.status(404).json({ error: 'Cliente não encontrado.' }),
    ),
  );
  admin.put(
    '/client-settings',
    asyncRoute(async (req, res) => res.json(await store.saveClientSettings(req.body ?? {}))),
  );

  admin.post(
    '/testimonials',
    asyncRoute(async (req, res) => res.status(201).json(await store.createTestimonial(req.body ?? {}))),
  );
  admin.put(
    '/testimonials/:id',
    asyncRoute(async (req, res) => {
      const t = await store.updateTestimonial(req.params.id, req.body ?? {});
      return t ? res.json(t) : res.status(404).json({ error: 'Depoimento não encontrado.' });
    }),
  );
  admin.delete(
    '/testimonials/:id',
    asyncRoute(async (req, res) =>
      (await store.deleteTestimonial(req.params.id))
        ? res.status(204).end()
        : res.status(404).json({ error: 'Depoimento não encontrado.' }),
    ),
  );
  admin.put(
    '/testimonials-order',
    asyncRoute(async (req, res) => res.json(await store.reorderTestimonials(req.body?.order ?? []))),
  );

  // Upload de imagem: corpo binário (image/png, image/jpeg, image/webp), até 2 MB
  admin.post(
    '/upload',
    express.raw({ type: ['image/png', 'image/jpeg', 'image/webp'], limit: MAX_UPLOAD }),
    asyncRoute(async (req, res) => {
      const buf = req.body;
      if (!Buffer.isBuffer(buf) || !buf.length)
        return res.status(400).json({ error: 'Envie uma imagem PNG, JPG ou WebP.' });
      const ext = sniffImage(buf);
      if (!ext) return res.status(400).json({ error: 'Formato não suportado. Use PNG, JPG ou WebP.' });
      const name = `${Date.now().toString(36)}-${randomBytes(6).toString('hex')}.${ext}`;
      await writeFile(resolve(UPLOADS_DIR, name), buf);
      res.status(201).json({ url: `/uploads/${name}` });
    }),
  );

  app.use('/api/admin', admin);
  app.use('/api', (_req, res) => res.status(404).json({ error: 'Não encontrado.' }));

  // Erros: nunca expõe detalhes internos
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err?.type === 'entity.too.large') return res.status(413).json({ error: 'Arquivo maior que 2 MB.' });
    if (err?.status === 404 || err?.statusCode === 404) return res.status(404).end();
    if (err?.type === 'entity.parse.failed') return res.status(400).json({ error: 'Requisição inválida.' });
    console.error('[api]', err);
    res.status(500).json({ error: 'Erro interno.' });
  });

  return app;
}
