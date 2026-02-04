import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      }
    }
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
