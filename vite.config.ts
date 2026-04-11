import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@bookingapp/shared-types': path.resolve(__dirname, './packages/shared-types/src/index.ts'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
