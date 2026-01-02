import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // バンドルサイズ削減のための最適化
    rollupOptions: {
      output: {
        // チャンク分割でロード効率を向上
        manualChunks: {
          // React関連を1つのチャンクに
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // MUIコア（コンポーネント）
          'mui-core': ['@mui/material', '@emotion/react', '@emotion/styled'],
          // MUIアイコンを別チャンクに
          'mui-icons': ['@mui/icons-material'],
          // TanStack Query
          'react-query': ['@tanstack/react-query'],
        },
      },
    },
    // チャンクサイズ警告の閾値を調整（KB単位）
    chunkSizeWarningLimit: 1000,
    // minifyオプション（デフォルトはesbuild）
    minify: 'esbuild',
    // ソースマップを本番環境では無効化（サイズ削減）
    sourcemap: false,
  },
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
