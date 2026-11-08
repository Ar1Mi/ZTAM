import legacy from '@vitejs/plugin-legacy';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// https://vitejs.dev/config/
// Lokalnie aplikacja działa pod "/", na GitHub Pages pod "/ZTAM/lab_04/"
// (ścieżkę ustawia workflow przez zmienną BASE_PATH).
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react(), legacy()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    // Playwright e2e specs live in e2e/.
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
