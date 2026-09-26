import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const apiBaseUrl = process.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: '0.0.0.0',
    port: Number(process.env.VITE_PORT ?? 5173),
    proxy: {
      '/business': {
        target: apiBaseUrl,
        changeOrigin: true
      },
      '/league': {
        target: apiBaseUrl,
        changeOrigin: true
      },
      '/users': {
        target: apiBaseUrl,
        changeOrigin: true
      },
      '/organization': {
        target: apiBaseUrl,
        changeOrigin: true
      }
    }
  }
});
