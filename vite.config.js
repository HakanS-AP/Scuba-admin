import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174, // Different port from the public frontend (5173)
    proxy: {
      // Proxy /api requests to the .NET backend during development.
      '/api': {
        target: 'http://localhost:5054',
        changeOrigin: true,
      },
    },
  },
})
