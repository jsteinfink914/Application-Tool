import { defineConfig } from 'vite';

import { svelte } from '@sveltejs/vite-plugin-svelte';




// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  root: 'src',  // Adjust this if your source files are in a different folder
  build: {
    rollupOptions: {
      input: '/public/index.html' // Ensure this points to the correct location
    }
  },
  publicDir: 'public', // This should be the default, but just to be sure
});
