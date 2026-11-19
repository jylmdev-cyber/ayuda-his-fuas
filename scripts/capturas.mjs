/**
 * Genera las capturas del README con Playwright (Chromium headless)
 * sirviendo dist/ con un servidor estático mínimo.
 * Uso: npm run build && node scripts/capturas.mjs
 */
import { createServer } from 'node:http';
import { existsSync, readFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(raiz, 'dist');
const salida = path.join(raiz, 'docs', 'capturas');
mkdirSync(salida, { recursive: true });

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
};

const servidor = createServer((req, res) => {
  let url = decodeURIComponent((req.url ?? '/').split('?')[0]);
  if (url.startsWith('/ayuda-his-fuas')) url = url.slice('/ayuda-his-fuas'.length) || '/';
  let archivo = path.join(dist, url);
  if (url.endsWith('/') || !path.extname(url)) {
    const conIndex = path.join(archivo, 'index.html');
    const conHtml = `${archivo}.html`;
    if (existsSync(conIndex)) archivo = conIndex;
    else if (existsSync(conHtml)) archivo = conHtml;
    else archivo = path.join(dist, 'index.html');
  }
  if (!existsSync(archivo) || !archivo.startsWith(dist)) {
    res.writeHead(404).end('404');
    return;
  }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(archivo)] ?? 'application/octet-stream' });
  res.end(readFileSync(archivo));
});

await new Promise((resolve) => servidor.listen(4399, '127.0.0.1', resolve));
const base = 'http://127.0.0.1:4399/';

const navegador = await chromium.launch();
const contexto = await navegador.newContext({ viewport: { width: 1280, height: 800 } });
const pagina = await contexto.newPage();

const captura = (nombre) => pagina.screenshot({ path: path.join(salida, nombre) });

await pagina.goto(base, { waitUntil: 'networkidle' });
await captura('01-portada.png');

await pagina.locator('#items').scrollIntoViewIfNeeded();
await pagina.waitForTimeout(400);
await captura('02-explorador-items.png');

await pagina.locator('#comparativa').scrollIntoViewIfNeeded();
await pagina.waitForTimeout(400);
await captura('03-comparativa.png');

await pagina.goto(`${base}simulador/`, { waitUntil: 'networkidle' });
await pagina.click('#sim-btn-ejemplo');
await pagina.waitForTimeout(400);
await captura('04-simulador.png');

await pagina.goto(`${base}catalogos/`, { waitUntil: 'networkidle' });
await pagina.waitForSelector('#cie-lista li');
await pagina.fill('#cie-q', 'dengue');
await pagina.waitForTimeout(400);
await captura('05-catalogos-cie10.png');

await pagina.goto(`${base}casos/`, { waitUntil: 'networkidle' });
await pagina.click('[data-caso="0"]');
await pagina.waitForTimeout(400);
await captura('06-casos-auditoria.png');

await pagina.goto(`${base}estudio/`, { waitUntil: 'networkidle' });
await pagina.waitForTimeout(400);
await captura('07-estudio-flashcards.png');

const movil = await navegador.newContext({ viewport: { width: 390, height: 844 } });
const paginaMovil = await movil.newPage();
await paginaMovil.goto(base, { waitUntil: 'networkidle' });
await paginaMovil.screenshot({ path: path.join(salida, '08-portada-movil.png') });

await navegador.close();
servidor.close();
console.log('Capturas generadas en docs/capturas/');
