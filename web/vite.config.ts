import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configure base path for GitHub Pages builds via env var `VITE_BASE`.
// In CI, we set VITE_BASE to `/<repo>/`. Locally it's undefined and defaults to '/'.
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  // Serve root-level user manuals as static assets so the app can fetch markdown files directly.
  publicDir: '../user_manuals',
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
});
