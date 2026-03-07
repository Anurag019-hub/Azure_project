import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],

  // If the contents of 'frontend' are at the root of your domain, use '/'
  // If you want the app to be portable regardless of the URL, keep './'
  base: '/',

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    // This is the folder Vite will create. 
    // If you're uploading 'frontend' contents, this 'dist' folder 
    // is what you'll actually point your Azure deployment to.
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: 'assets',
    // Generates source maps for easier debugging in production if needed
    sourcemap: false,
  }
});