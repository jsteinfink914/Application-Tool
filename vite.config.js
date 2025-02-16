import { defineConfig } from 'vite';

import { svelte } from '@sveltejs/vite-plugin-svelte';




// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  root: '.',  // Assuming the project root contains the public folder
  build: {
    rollupOptions: {
      input: '/public/index.html',  // Explicit path to index.html
    },
  },
  publicDir: 'public',  // Ensure Vite knows to serve files from the public folder
});
