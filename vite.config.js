import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  build: {
    outDir: 'dist', // Where Vite outputs the final build
  },
  publicDir: 'public', // Keep static assets in public/
  server: {
    open: true, // Auto-open in browser
    historyApiFallback: true, // Allows refresh without 404 errors
  }
});
