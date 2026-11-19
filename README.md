# HIS MINSA & FUA SIS — Guía interactiva

Sitio estático construido con **Astro 5 + Tailwind CSS 4** que digitaliza el documento
*"MATERIAL DE ESTUDIO - LLENADO DE HIS Y FUA"* (Oficina General de Tecnologías de la Información – MINSA, 2025),
que reúne el procedimiento de registro del HIS MINSA, la Directiva N° 002-2024-SIS/GREP-V.02 (FUA),
los códigos prestacionales por curso de vida 301-306 y la Directiva N° 001-2025-SIS/GREP-V.01 (auditoría SIS).

## Características

- Contenido 100 % separado de la interfaz: todo vive tipado en `src/data/content.ts`.
- Tema oscuro por defecto con conmutador claro/oscuro persistente.
- Buscador global en tiempo real (ítems, campos del FUA, códigos y normas).
- Explorador de los 22 ítems de la Hoja HIS con búsqueda y filtros por sección.
- Pestañas (escenarios de registro), acordeones (ítems y campos del FUA) y lightbox de figuras.
- Mobile-first, accesible (skip-link, ARIA en tabs/dialogos, foco visible) y sin frameworks de cliente.
- Rutas de activos resueltas con la constante `base` (subdirectorio de GitHub Pages).

## Desarrollo local

```bash
npm install
npm run dev        # http://localhost:4321/astro-his-fuas
npm run build      # genera dist/
npm run preview    # sirve dist/ con la ruta base real
```

## Publicar en GitHub Pages

```bash
git init
git add .
git commit -m "Sitio guía HIS MINSA y FUA SIS"
git branch -M main
git remote add origin https://github.com/jylmdev-cyber/astro-his-fuas.git
git push -u origin main
```

Luego, en el repositorio: **Settings → Pages → Source: GitHub Actions**.
El workflow `.github/workflows/deploy.yml` compila y despliega en cada push a `main`.
Si cambias el nombre del repositorio, ajusta `base` en `astro.config.mjs`.

## Biblioteca de Codificación Sanitaria (`/catalogos/`)

Catálogos oficiales importados y servidos como JSON estático con caché en `localStorage`
(consulta sin conexión tras la primera carga):

| Catálogo | Registros | Fuente |
|---|---|---|
| CIE-10 MINSA | 15 064 códigos (15 038 vigentes, 20 con cese de uso, 6 adiciones) | REUNIS – Excel VOLUMEN VIGENTE + RM 447-2024-MINSA (Anexos 1 y 2) |
| CPMS | 10 815 procedimientos | CPMS Anexo 1 – RM 550-2023-MINSA |

Funciones: búsqueda por código/descripción normalizada (sin tildes), filtros por capítulo,
estrategia sanitaria (rangos CIE-10 documentados en el importador), estado del código
(vigente / cese de uso / adición RM 447), grupo y sección CPMS; favoritos y consultas
recientes persistidos; ficha detallada con fuente, referencia normativa y copia del código;
búsqueda unificada CIE-10 + CPMS; pestañas HIS (reglas y fórmulas) y FUA (prestaciones).

### Regenerar los catálogos

```bash
npm run import:catalogos
```

Descarga (o reutiliza desde `.fuentes/`, ignorado por git) los archivos oficiales de
`files.minsa.gob.pe`, normaliza códigos (corrige I→1 y O→0 de las fuentes), aplica el
cese/adición de la RM 447-2024 y escribe `public/data/{cie10,cpms,catalogos-meta}.json`
en formato compacto con tablas de cadenas. Requiere `pdftotext` (poppler) y `unzip` en el sistema.

> Herramienta educativa de consulta y revisión de registros: no reemplaza al aplicativo
> HIS MINSA ni garantiza la aceptación de una prestación por el SIS.

## Glosario y comparativa

- `/glosario/`: 26 términos del sistema de información (HIS, FUA, IPRESS, RENIPRES, UPSS,
  IAFAS, VALOR LAB, N/C/R, P/D/R…) con búsqueda en vivo, agrupación alfabética y enlace
  "Ver en la guía" a la sección donde se aplica cada término.
- Sección `#comparativa` en la portada: tabla Hoja HIS vs FUA SIS en 10 aspectos
  (propósito, norma, estructura, firma, valor legal, control de calidad…) más los cuatro
  puntos de contacto entre ambos instrumentos.

## Tests

```bash
npm test
```

Suite Vitest (`tests/`): reglas de la Hoja HIS por ítem (formatos, precisiones, coherencia
gestante/sexo, CIE-10 con extensiones MINSA), invariantes del contenido (22 ítems, rangos
301-305 continuos, 17 campos FUA, ejemplo del material válido, casos con errores sembrados)
y calidad de los catálogos generados (códigos únicos, estados, formato OMS, conteos del meta).
El workflow de despliegue ejecuta `npm test` antes de compilar.

## SEO y metadatos

- 22 páginas estáticas por capítulo CIE-10 (`/catalogos/cie10/capitulo-*/`) generadas en
  build desde `public/data/cie10.json`: consultables sin JavaScript, con anclas por código
  (`#I10X`), insignias de vigencia y JSON-LD `CollectionPage`.
- `@astrojs/sitemap` (`sitemap-index.xml`), `public/robots.txt`, JSON-LD en portada
  (`WebSite`, `LearningResource`, `Dataset`) y en `/catalogos/` (`WebPage`).
- OG image propia: `npm run generar:og` rasteriza `public/og-image.png` (1200×630) con
  `@resvg/resvg-js`; referenciada en `og:image` y `twitter:image`.

## PWA y actualización de fuentes

- `public/manifest.webmanifest` + `public/sw.js` (stale-while-revalidate same-origin):
  tras la primera visita, páginas, estilos y los JSON de catálogos funcionan sin conexión.
- `.github/workflows/verificar-fuentes.yml`: ejecución mensual (cron) y manual que
  reimporta los catálogos oficiales y abre un PR automático si `public/data` cambió.

## Circuito de práctica completo

- **Catálogo → Simulador**: cada ficha CIE-10/CPMS incluye "Usar en el simulador", que
  precarga el código en el ítem 22 mediante `?cie=` / `?cpms=`. Dentro del simulador, el
  botón "Catálogo" del ítem 22 busca en los JSON oficiales y carga código y descripción.
- **Simulador → Casos**: `/casos/` presenta hojas HIS con errores sembrados para auditar:
  se marcan los casilleros erróneos y el mismo motor de reglas (`src/scripts/reglas-his.ts`)
  compara la auditoría, con puntaje, falsos positivos y la norma de cada hallazgo.
- El motor de reglas es único y compartido: simulador, casos y futuras funciones validan
  con exactamente las mismas reglas del documento técnico.

## Actualizar contenido

Edita únicamente `src/data/content.ts` (métricas, ítems, tablas de códigos, campos del FUA,
curso de vida, auditoría, figuras y navegación). El sitio se regenera completo con `npm run build`.
