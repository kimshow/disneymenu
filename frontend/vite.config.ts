import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.error('Proxy error:', err);
          });
          proxy.on('proxyReq', (_proxyReq, req, _res) => {
            // プロキシログ（開発時のみ、VERBOSEモード）
            if (process.env.VITE_VERBOSE) {
              console.log('Proxying:', req.method, req.url, '-> http://localhost:8000' + req.url);
            }
          });
        },
      },
    },
  },
})
