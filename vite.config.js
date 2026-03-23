import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Si estamos en build (producción para GH Pages), usar la subruta. En dev, usar la raíz.
  base: command === 'serve' ? '/' : '/Hoja_Pedido_/',
  resolve: {
    alias: {
      '@assets': path.resolve(__dirname, '../../g360-assets'),
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
        '../../g360-assets'
      ]
    }
  }
}))
