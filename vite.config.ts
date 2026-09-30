import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

/**
 * Serve "/psg-dados" (sem barra final) também em dev/preview,
 * espelhando o comportamento dos hosts estáticos em produção.
 */
function cleanUrls(): Plugin {
  const rewrite = (req: { url?: string }, _res: unknown, next: () => void) => {
    if (req.url) {
      const [path, query] = req.url.split('?');
      if (path === '/psg-dados') req.url = '/psg-dados/' + (query ? `?${query}` : '');
    }
    next();
  };
  return {
    name: 'clean-urls',
    configureServer(server) {
      server.middlewares.use(rewrite);
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewrite);
    },
  };
}

export default defineConfig({
  plugins: [react(), cleanUrls()],
  build: {
    target: 'es2020',
    // O Three.js (~590 kB, ~150 kB gzip) fica num chunk carregado sob demanda, após a primeira pintura.
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      input: {
        hiperlink: resolve(import.meta.dirname, 'index.html'),
        psgDados: resolve(import.meta.dirname, 'psg-dados/index.html'),
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
