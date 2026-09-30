import { defineConfig, type Connect, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

/**
 * - Serve "/psg-dados" e "/admin" sem barra final (como nos hosts de produção).
 * - Monta a API (server/app.mjs) dentro do servidor do Vite: um único `npm run dev`
 *   entrega o site, a área administrativa e a API na mesma porta.
 */
function siteServer(): Plugin {
  const rewrite = (req: { url?: string }, _res: unknown, next: () => void) => {
    if (req.url) {
      const [path, query] = req.url.split('?');
      const qs = query ? `?${query}` : '';
      if (path === '/psg-dados') req.url = `/psg-dados/${qs}`;
      // /admin/login, /admin/clientes/123/editar… → aplicação do painel
      else if (path === '/admin' || (path.startsWith('/admin/') && !/\.[a-z0-9]+$/i.test(path)))
        req.url = `/admin/${qs}`;
    }
    next();
  };
  const mountApi = async (middlewares: Connect.Server, log: (msg: string) => void) => {
    const { createApp } = await import('./server/app.mjs');
    const { printAdminBanner } = await import('./server/db.mjs');
    middlewares.use(createApp() as Connect.NextHandleFunction);
    printAdminBanner(log);
  };
  return {
    name: 'site-server',
    async configureServer(server) {
      server.middlewares.use(rewrite);
      await mountApi(server.middlewares, (m) => server.config.logger.info(m));
    },
    async configurePreviewServer(server) {
      server.middlewares.use(rewrite);
      await mountApi(server.middlewares, (m) => server.config.logger.info(m));
    },
  };
}

export default defineConfig({
  plugins: [react(), siteServer()],
  server: {
    // não recarregar a página quando o painel grava dados/uploads
    watch: { ignored: ['**/data/**'] },
  },
  build: {
    target: 'es2020',
    // O Three.js (~590 kB, ~150 kB gzip) fica num chunk carregado sob demanda, após a primeira pintura.
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      input: {
        hiperlink: resolve(import.meta.dirname, 'index.html'),
        psgDados: resolve(import.meta.dirname, 'psg-dados/index.html'),
        admin: resolve(import.meta.dirname, 'admin/index.html'),
      },
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/three')) return 'three';
          if (id.includes('node_modules/react') || id.includes('node_modules/scheduler')) return 'react';
          if (id.includes('node_modules/lucide-react')) return 'icons';
        },
      },
    },
  },
});
