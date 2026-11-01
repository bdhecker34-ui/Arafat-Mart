import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  // If running in GitHub Actions, process.env.GITHUB_REPOSITORY is "owner/repo"
  // So base is `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/`
  // Otherwise if VITE_BASE_PATH is provided, use it; default to './' for local dev & relative hosting
  // Universal relative base path ensures assets resolve correctly on GitHub Pages (any repo name), custom domains, and local dev
  const base = process.env.VITE_BASE_PATH || './';

  return {
    base,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve('.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
