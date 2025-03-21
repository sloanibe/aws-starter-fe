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
        timeout: 60000, // Increase timeout to 60 seconds
        proxyTimeout: 60000, // Increase proxy timeout to 60 seconds
        followRedirects: true, // Follow any redirects
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            // eslint-disable-next-line no-console
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (_proxyReq, req, _res) => {
            // eslint-disable-next-line no-console
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            // eslint-disable-next-line no-console
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      }
    },
    host: true // Allow external access to the dev server
  }
})
