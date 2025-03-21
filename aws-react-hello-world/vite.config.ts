import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://vab90wx4u0.execute-api.us-west-1.amazonaws.com/prod',
        changeOrigin: true,
        secure: true,
      }
    }
  }
})
