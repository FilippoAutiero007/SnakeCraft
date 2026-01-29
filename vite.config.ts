import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      }
    },
    build: {
      // Ottimizzazioni di build
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
        },
      },
      // Code splitting per ridurre chunk size
      rollupOptions: {
        output: {
          manualChunks: {
            'phaser': ['phaser'],
            'react-vendor': ['react', 'react-dom'],
            'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-slider'],
          },
        },
      },
      // Chunk size warnings
      chunkSizeWarningLimit: 600,
      // Sourcemaps solo in development
      sourcemap: mode === 'development',
      // Riduce CSS duplicato
      cssCodeSplit: true,
      // Ottimizza immagini
      assetsInlineLimit: 4096,
    },
  };
});
