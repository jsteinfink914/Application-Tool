import { defineConfig } from 'vite';
import svelte from '@sveltejs/vite-plugin-svelte';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  build: {
    outDir: 'build', // The folder where Vercel will expect the production-ready files
  },
});
