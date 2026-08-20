import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': 'http://localhost:8000',
      '/bitacora': 'http://localhost:8000',
      '/roles': 'http://localhost:8000',
    },
  },
})
