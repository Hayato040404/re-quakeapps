import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'liquid-glass': ['liquid-glass-react']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['liquid-glass-react']
  },
  server: {
    port: 5173,
  },
  resolve: {
    alias: {
      'liquid-glass-react': 'liquid-glass-react/dist/index.js'
    }
  }
});
