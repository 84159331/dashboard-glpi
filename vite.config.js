import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/glpi-proxy': {
        target: 'https://suporte.coreplan.com.br',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/glpi-proxy/, '')
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'charts-vendor': ['recharts'],
          'utils-vendor': ['papaparse', 'lucide-react']
        }
      }
    }
  }
})