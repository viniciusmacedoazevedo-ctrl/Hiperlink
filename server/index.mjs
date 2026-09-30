/**
 * Servidor de produção: páginas estáticas (dist/) + API + área administrativa.
 *   npm run build && npm start
 */
import express from 'express';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

process.env.NODE_ENV ||= 'production';
const { ROOT } = await import('./config.mjs');
const { printAdminBanner } = await import('./db.mjs');
const { createApp } = await import('./app.mjs');

const DIST = resolve(ROOT, 'dist');
if (!existsSync(DIST)) {
  console.error('Pasta dist/ não encontrada. Rode "npm run build" antes de "npm start".');
  process.exit(1);
}

const app = createApp();

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  if (req.path.startsWith('/admin')) res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  next();
});

// URLs limpas: /psg-dados sem barra final; /admin/* é uma aplicação de página única
app.get('/psg-dados', (_req, res) => res.sendFile(resolve(DIST, 'psg-dados', 'index.html')));
app.get(['/admin', /^\/admin\/(?!assets\/).*/], (_req, res) => res.sendFile(resolve(DIST, 'admin', 'index.html')));

app.use(
  express.static(DIST, {
    setHeaders(res, path) {
      if (path.includes('/assets/')) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      else res.setHeader('Cache-Control', 'no-cache');
    },
  }),
);
app.use((_req, res) => res.status(404).sendFile(resolve(DIST, 'index.html')));

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`Site em http://localhost:${port}  (admin: /admin)`);
  printAdminBanner();
});
