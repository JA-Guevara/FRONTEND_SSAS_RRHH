import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: [
      'frontendssasrrhh-production.up.railway.app',
      'frontendssasrrhh-production-1731.up.railway.app',
      '.up.railway.app',
      'localhost',
    ],
  },
  server: {
    allowedHosts: [
      'frontendssasrrhh-production.up.railway.app',
      'frontendssasrrhh-production-1731.up.railway.app',
      '.up.railway.app',
      'localhost',
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
