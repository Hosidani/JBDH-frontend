import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
    },
  },
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Combine all locale files into main bundle
          if (id.includes('/locales/')) {
            return 'index';
          }
          return undefined;
        }
      }
    }
  }
});
