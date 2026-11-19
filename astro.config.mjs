import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// Despliegue en GitHub Pages: https://jylmdev-cyber.github.io/astro-his-fuas/
export default defineConfig({
  site: 'https://jylmdev-cyber.github.io',
  base: '/astro-his-fuas',
  output: 'static',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
