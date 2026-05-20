import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// React SPA build for Cloudflare Pages.
// The Hono API worker is built separately into `functions/[[path]].ts`-style
// or a single `_worker.js`. We keep them separated for clarity.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      // During `vite dev`, forward /api/* to local wrangler worker on 8787
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
})
