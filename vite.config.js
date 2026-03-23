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
    fs: {
      allow: [
        '.',
        './g360-assets'
      ]
    }
  }
}))
