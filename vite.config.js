import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Use repository name for production, root for development
  base: command === 'build' ? '/g360-order-form/' : '/',
  resolve: {
    alias: {
      '@assets': path.resolve(__dirname, './g360-assets'),
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    port: 5174,
    open: true,
    // Manejo de SPA para evitar 404 al recargar
    historyApiFallback: true,
    // Proxy dev: evita CORS del preflight (X-API-Key) contra la Stock API de Render
    proxy: {
      '/api': {
        target: 'https://g360-stock-api.onrender.com',
        changeOrigin: true,
        secure: true,
        timeout: 120000
      }
    },
    fs: {
      allow: [
        '.',
        './g360-assets'
      ]
    }
  },
  preview: {
    port: 4173,
    // Mismo proxy para vite preview (build local)
    proxy: {
      '/api': {
        target: 'https://g360-stock-api.onrender.com',
        changeOrigin: true,
        secure: true,
        timeout: 120000
      }
    }
  }
}))
