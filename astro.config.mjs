import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// Despliegue en GitHub Pages: https://jylmdev-cyber.github.io/ayuda-his-fuas/
export default defineConfig({
  site: 'https://jylmdev-cyber.github.io',
  base: '/ayuda-his-fuas',
  output: 'static',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
