import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  build: {
    rollupOptions: {
      input: 'public/index.html',  // Relative path to index.html from the root
    },
    outDir: 'dist',  // Output directory for the build files
  },
  publicDir: 'public',  // Ensure Vite knows to serve files from the public folder
});
