// Import the root component of your Svelte app
import App from './App.svelte';

// Initialize the Svelte app, and tell it where to render
const app = new App({
  target: document.getElementById('app') // This matches the div in your index.html
});

// Export the app instance (optional but useful for testing)
export default app;
