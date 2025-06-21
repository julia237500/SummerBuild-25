import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  root: './',
  build: {
    outDir: 'dist',
  },
  server: {
    port: 5173,
    host: true,
    strictPort: true,
    open: true,
    proxy: {
      '/api': 'http://localhost:5000',
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});