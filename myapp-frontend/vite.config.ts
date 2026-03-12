import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
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
