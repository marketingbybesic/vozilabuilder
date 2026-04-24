import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on all local addresses (0.0.0.0)
    port: 5173,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    },
    hmr: {
      clientPort: 443, // Forces HMR to work over HTTPS tunnel
      overlay: false
    }
  }
})
