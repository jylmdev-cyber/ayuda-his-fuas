/**
 * Genera public/og-image.png (1200x630) para Open Graph / Twitter Cards.
 * Rasteriza un SVG propio con @resvg/resvg-js usando fuentes del sistema
 * solo para el renderizado (el PNG resultante no las redistribuye).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const fuentes = ['C:/Windows/Fonts/arial.ttf', 'C:/Windows/Fonts/arialbd.ttf']
  .map((ruta) => readFileSync(ruta))
  .map((buffer) => buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="glow" cx="72%" cy="8%" r="70%">
      <stop offset="0%" stop-color="#14b8a6" stop-opacity="0.35"/>
      <stop offset="55%" stop-color="#0ea5e9" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#071019" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="barra" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#14b8a6"/>
      <stop offset="1" stop-color="#38bdf8"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="#071019"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <g stroke="#94a3b8" stroke-opacity="0.08">
    ${Array.from({ length: 27 }, (_, i) => `<line x1="${i * 46}" y1="0" x2="${i * 46}" y2="630"/>`).join('')}
    ${Array.from({ length: 15 }, (_, i) => `<line x1="0" y1="${i * 46}" x2="1200" y2="${i * 46}"/>`).join('')}
  </g>
  <rect x="0" y="0" width="1200" height="10" fill="url(#barra)"/>
  <g fill="none" stroke="#2dd4bf" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" transform="translate(84,120)">
    <path d="M20 0v60a60 60 0 0 0 120 0V0"/>
    <path d="M80 120v40a60 60 0 0 0 120 0v-30"/>
    <circle cx="200" cy="110" r="26"/>
  </g>
  <text x="84" y="360" font-family="Arial" font-weight="bold" font-size="76" fill="#ffffff">HIS MINSA &amp; FUA SIS</text>
  <text x="84" y="430" font-family="Arial" font-size="38" fill="#5eead4">Biblioteca de Codificación Sanitaria</text>
  <text x="84" y="486" font-family="Arial" font-size="28" fill="#94a3b8">CIE-10 · CPMS · Hoja HIS · FUA · Guía interactiva de estudio</text>
  <rect x="84" y="530" width="420" height="6" rx="3" fill="url(#barra)"/>
  <text x="84" y="586" font-family="Arial" font-size="24" fill="#64748b">jylmdev-cyber.github.io/astro-his-fuas</text>
</svg>`;

const resvg = new Resvg(svg, {
  font: { fontBuffers: fuentes, loadSystemFonts: false, defaultFontFamily: 'Arial' },
  fitTo: { mode: 'width', value: 1200 },
});
const png = resvg.render().asPng();
writeFileSync(path.join(raiz, 'public', 'og-image.png'), png);
console.log('og-image.png generado:', png.length, 'bytes');
