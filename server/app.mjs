/**
 * API do site e do painel administrativo.
 *
 *   /api/auth/*        login, logout, usuário atual, troca de senha
 *   /api/admin/*       painel (autenticado, com permissões por perfil)
 *   /api/public/*      conteúdo publicado — SOMENTE LEITURA
 *   /media/*           arquivos da biblioteca de mídia (somente os não excluídos)
 */
import express from 'express';
import { randomBytes } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { MAX_UPLOAD_BYTES, MEDIA_DIR } from './config.mjs';
import './db.mjs';
import { audit } from './audit.mjs';
import {
  changeOwnPassword,
  endSessionsOf,
  loadSession,
  login,
  logout,
  me,
  passwordProblem,
  requireAuth,
  requirePermission as perm,
} from './auth.mjs';
import { can } from './permissions.mjs';
import * as repo from './repo.mjs';

/** Confere o tipo real do arquivo pelos primeiros bytes (não confia no nome/cabeçalho). */
function sniffImage(buf) {
  if (buf.length > 8 && buf[0] === 0x89 && buf.toString('ascii', 1, 4) === 'PNG') return ['png', 'image/png'];
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return ['jpg', 'image/jpeg'];
  if (buf.length > 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP')
    return ['webp', 'image/webp'];
  return null;
}

const route = (fn) => (req, res, next) => {
  try {
    const out = fn(req, res, next);
    if (out instanceof Promise) out.catch(next);
  } catch (err) {
    next(err);
  }
};

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 'loopback, linklocal, uniquelocal');

  app.use(['/api', '/media'], (_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'same-origin');
    next();
  });

  /* ---------------------------------------------------------- mídia pública */
  app.get(
    '/media/:file',
    route((req, res) => {
      const file = req.params.file;
      if (!/^[a-zA-Z0-9_-]+\.(png|jpe?g|webp)$/.test(file) || !repo.mediaFileIsPublic(file))
        return res.status(404).end();
      res.setHeader('Content-Security-Policy', "default-src 'none'; img-src 'self'");
      res.sendFile(resolve(MEDIA_DIR, file), { maxAge: '30d', immutable: true });
    }),
  );

  /* ---------------------------------------------------------- API pública (somente leitura) */
  const pub = express.Router();
  pub.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return res.status(405).json({ error: 'Somente leitura.' });
    res.setHeader('Cache-Control', 'no-cache');
    next();
  });
  pub.get('/clients', (_req, res) => res.json(repo.publicClients()));
  pub.get('/testimonials', (_req, res) => res.json(repo.publicTestimonials()));
  app.use('/api/public', pub);

  /* ---------------------------------------------------------- autenticação */
  const auth = express.Router();
  auth.use((_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });
  auth.use(express.json({ limit: '20kb' }), loadSession);
  auth.post('/login', login);
  auth.post('/logout', logout);
  auth.get('/me', me);
  auth.post('/password', requireAuth, changeOwnPassword);
  app.use('/api/auth', auth);

  /* ---------------------------------------------------------- API administrativa */
  const admin = express.Router();
  admin.use((_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });
  admin.use(express.json({ limit: '100kb' }), loadSession, requireAuth);

  admin.get('/dashboard', perm('dashboard.view'), (_req, res) => res.json(repo.dashboard()));
  admin.get('/roles', (_req, res) => res.json(repo.listRoles()));

  // ----- clientes
  const listOpts = (q) => ({ deleted: q.deleted === '1', status: q.status, q: String(q.q ?? '').slice(0, 80) });
  /** A lixeira só é visível para quem pode restaurar. */
  const trashGuard = (permission) => (req, res, next) =>
    req.query.deleted === '1' && !can(req.user.role, permission)
      ? res.status(403).json({ error: 'Você não tem permissão para ver a lixeira.' })
      : next();
  admin.get('/clients', perm('clients.view'), trashGuard('clients.restore'), (req, res) =>
    res.json(repo.listClients(listOpts(req.query))),
  );
  admin.get(
    '/clients/:id',
    perm('clients.view'),
    route((req, res) => res.json(repo.getClient(req.params.id))),
  );
  admin.post(
    '/clients',
    perm('clients.create'),
    route((req, res) => {
      const c = repo.createClient(req.body ?? {});
      audit(req, 'CREATE', 'client', c.id, null, c);
      res.status(201).json(c);
    }),
  );
  const clientChange = (action, fn) =>
    route((req, res) => {
      const { before, after, demoted } = fn(req);
      audit(req, action, 'client', after.id, before, after);
      if (demoted)
        audit(req, 'HIGHLIGHT', 'client', demoted.id, { highlightLevel: 'FEATURED' }, { highlightLevel: 'HIGHLIGHT' });
      res.json(after);
    });
  admin.put(
    '/clients/:id',
    perm('clients.update'),
    clientChange('UPDATE', (req) => repo.updateClient(req.params.id, req.body ?? {})),
  );
  admin.patch(
    '/clients/:id/status',
    perm('clients.status'),
    clientChange('STATUS', (req) => repo.setClientStatus(req.params.id, req.body?.status)),
  );
  admin.patch(
    '/clients/:id/highlight',
    perm('clients.highlight'),
    clientChange('HIGHLIGHT', (req) => repo.setClientHighlight(req.params.id, req.body?.highlightLevel)),
  );
  admin.patch(
    '/clients/:id/order',
    perm('clients.order'),
    clientChange('ORDER', (req) => repo.setClientOrder(req.params.id, req.body?.displayOrder)),
  );
  admin.delete(
    '/clients/:id',
    perm('clients.delete'),
    route((req, res) => {
      const before = repo.deleteClient(req.params.id);
      audit(req, 'DELETE', 'client', before.id, before, null);
      res.status(204).end();
    }),
  );
  admin.post(
    '/clients/:id/restore',
    perm('clients.restore'),
    clientChange('RESTORE', (req) => repo.restoreClient(req.params.id)),
  );

  // ----- depoimentos
  admin.get('/testimonials', perm('testimonials.view'), trashGuard('testimonials.restore'), (req, res) =>
    res.json(repo.listTestimonials(listOpts(req.query))),
  );
  admin.get(
    '/testimonials/:id',
    perm('testimonials.view'),
    route((req, res) => res.json(repo.getTestimonial(req.params.id))),
  );
  admin.post(
    '/testimonials',
    perm('testimonials.create'),
    route((req, res) => {
      const t = repo.createTestimonial(req.body ?? {});
      audit(req, 'CREATE', 'testimonial', t.id, null, t);
      res.status(201).json(t);
    }),
  );
  const tChange = (action, fn) =>
    route((req, res) => {
      const { before, after } = fn(req);
      audit(req, action, 'testimonial', after.id, before, after);
      res.json(after);
    });
  admin.put(
    '/testimonials/:id',
    perm('testimonials.update'),
    tChange('UPDATE', (req) => repo.updateTestimonial(req.params.id, req.body ?? {})),
  );
  admin.patch(
    '/testimonials/:id/status',
    perm('testimonials.status'),
    tChange('STATUS', (req) => repo.setTestimonialStatus(req.params.id, req.body?.status)),
  );
  admin.patch(
    '/testimonials/:id/featured',
    perm('testimonials.featured'),
    tChange('FEATURED', (req) => repo.setTestimonialFeatured(req.params.id, req.body?.featured)),
  );
  admin.patch(
    '/testimonials/:id/order',
    perm('testimonials.order'),
    tChange('ORDER', (req) => repo.setTestimonialOrder(req.params.id, req.body?.displayOrder)),
  );
  admin.delete(
    '/testimonials/:id',
    perm('testimonials.delete'),
    route((req, res) => {
      const before = repo.deleteTestimonial(req.params.id);
      audit(req, 'DELETE', 'testimonial', before.id, before, null);
      res.status(204).end();
    }),
  );
  admin.post(
    '/testimonials/:id/restore',
    perm('testimonials.restore'),
    tChange('RESTORE', (req) => repo.restoreTestimonial(req.params.id)),
  );

  // ----- mídia
  admin.get('/media', perm('media.view'), trashGuard('media.restore'), (req, res) =>
    res.json(repo.listMedia({ deleted: req.query.deleted === '1' })),
  );
  admin.post(
    '/media',
    perm('media.upload'),
    express.raw({ type: ['image/png', 'image/jpeg', 'image/webp'], limit: MAX_UPLOAD_BYTES }),
    route(async (req, res) => {
      const buf = req.body;
      if (!Buffer.isBuffer(buf) || !buf.length)
        return res.status(400).json({ error: 'Envie uma imagem PNG, JPG ou WebP.' });
      const kind = sniffImage(buf);
      if (!kind) return res.status(400).json({ error: 'Formato não suportado. Use PNG, JPG ou WebP.' });
      const filename = `${Date.now().toString(36)}-${randomBytes(6).toString('hex')}.${kind[0]}`;
      await writeFile(resolve(MEDIA_DIR, filename), buf);
      let original = 'imagem';
      try {
        original = decodeURIComponent(String(req.headers['x-filename'] ?? 'imagem')).slice(0, 200);
      } catch {
        /* nome inválido: mantém "imagem" */
      }
      const m = repo.createMedia({
        filename,
        originalFilename: original,
        mimeType: kind[1],
        size: buf.length,
        altText: '',
        userId: req.user.id,
      });
      audit(req, 'UPLOAD', 'media', m.id, null, m);
      res.status(201).json(m);
    }),
  );
  admin.patch(
    '/media/:id',
    perm('media.update'),
    route((req, res) => {
      const { before, after } = repo.updateMedia(req.params.id, req.body ?? {});
      audit(req, 'UPDATE', 'media', after.id, before, after);
      res.json(after);
    }),
  );
  admin.delete(
    '/media/:id',
    perm('media.delete'),
    route((req, res) => {
      const before = repo.deleteMedia(req.params.id);
      audit(req, 'DELETE', 'media', before.id, before, null);
      res.status(204).end();
    }),
  );
  admin.post(
    '/media/:id/restore',
    perm('media.restore'),
    route((req, res) => {
      const { before, after } = repo.restoreMedia(req.params.id);
      audit(req, 'RESTORE', 'media', after.id, before, after);
      res.json(after);
    }),
  );

  // ----- usuários (somente ADMIN)
  admin.get('/users', perm('users.manage'), (_req, res) => res.json(repo.listUsers()));
  admin.post(
    '/users',
    perm('users.manage'),
    route((req, res) => {
      const u = repo.createUser(req.body ?? {}, passwordProblem);
      audit(req, 'CREATE', 'user', u.id, null, u);
      res.status(201).json(u);
    }),
  );
  admin.put(
    '/users/:id',
    perm('users.manage'),
    route((req, res) => {
      const { before, after } = repo.updateUser(req.params.id, req.body ?? {}, req.user.id);
      if (after.status !== 'ACTIVE' || after.role !== before.role) endSessionsOf(after.id);
      audit(req, 'UPDATE', 'user', after.id, before, after);
      res.json(after);
    }),
  );
  admin.patch(
    '/users/:id/password',
    perm('users.manage'),
    route((req, res) => {
      repo.resetUserPassword(req.params.id, req.body?.password, passwordProblem);
      if (req.params.id !== req.user.id) endSessionsOf(req.params.id);
      audit(req, 'PASSWORD_RESET', 'user', req.params.id, null, null);
      res.json({ ok: true });
    }),
  );
  admin.delete(
    '/users/:id',
    perm('users.manage'),
    route((req, res) => {
      const before = repo.deleteUser(req.params.id, req.user.id);
      audit(req, 'DELETE', 'user', before.id, before, null);
      res.status(204).end();
    }),
  );

  // ----- auditoria (somente ADMIN)
  admin.get('/audit-logs', perm('audit.view'), (req, res) =>
    res.json(repo.listAudit({ limit: req.query.limit, offset: req.query.offset, entityType: req.query.entityType })),
  );

  app.use('/api/admin', admin);
  app.use('/api', (_req, res) => res.status(404).json({ error: 'Não encontrado.' }));

  // Erros: nunca expõe detalhes internos
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err instanceof repo.ValidationError) return res.status(400).json({ error: err.message });
    if (err instanceof repo.NotFoundError) return res.status(404).json({ error: err.message });
    if (err?.type === 'entity.too.large') return res.status(413).json({ error: 'Arquivo maior que 2 MB.' });
    if (err?.type === 'entity.parse.failed') return res.status(400).json({ error: 'Requisição inválida.' });
    if (err?.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(409).json({ error: 'Registro duplicado.' });
    if (err?.status === 404 || err?.statusCode === 404) return res.status(404).end();
    console.error('[api]', err);
    res.status(500).json({ error: 'Erro interno.' });
  });

  return app;
}
