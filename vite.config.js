/*import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: ['frontendssasrrhh-production.up.railway.app'],
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})*/
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': {
        target: 'https://backendssasrrhh-production-3012.up.railway.app',
        changeOrigin: true,
        secure: true,
      },
      '/bitacora': {
        target: 'https://backendssasrrhh-production-3012.up.railway.app',
        changeOrigin: true,
        secure: true,
      },
      '/roles': {
        target: 'https://backendssasrrhh-production-3012.up.railway.app',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
