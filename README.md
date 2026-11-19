# HIS MINSA & FUA SIS — Guía interactiva y Biblioteca de Codificación Sanitaria

[![Deploy a GitHub Pages](https://github.com/jylmdev-cyber/ayuda-his-fuas/actions/workflows/deploy.yml/badge.svg)](https://github.com/jylmdev-cyber/ayuda-his-fuas/actions/workflows/deploy.yml)
[![Verificación de fuentes oficiales](https://github.com/jylmdev-cyber/ayuda-his-fuas/actions/workflows/verificar-fuentes.yml/badge.svg)](https://github.com/jylmdev-cyber/ayuda-his-fuas/actions/workflows/verificar-fuentes.yml)
[![Astro](https://img.shields.io/badge/Astro-5.x-BC52E5?logo=astro&logoColor=white)](https://astro.build)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vitest](https://img.shields.io/badge/tests-Vitest_29_passing-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev)
[![GitHub Pages](https://img.shields.io/badge/hosting-GitHub_Pages-2088FF?logo=githubpages&logoColor=white)](https://jylmdev-cyber.github.io/ayuda-his-fuas/)
[![PWA](https://img.shields.io/badge/PWA-offline_first-5A0FC8?logo=pwa&logoColor=white)](https://developer.mozilla.org/docs/Web/Progressive_web_apps)
[![Datos oficiales](https://img.shields.io/badge/datos-CIE--10_y_CPMS_MINSA-0D9488)](https://www.minsa.gob.pe/reunis/index.asp?op=3)

Sitio estático **100 % sin backend** que digitaliza el documento *"MATERIAL DE ESTUDIO – LLENADO DE HIS Y FUA"*
(Oficina General de Tecnologías de la Información – MINSA, 2025) y lo convierte en una herramienta de
consulta, práctica y codificación para personal asistencial, responsables de estadística y estudiantes:
guía interactiva de la Hoja HIS y el FUA, simulador de llenado con control de calidad, asistente de código
prestacional, casos de auditoría, modo estudio y una biblioteca con los catálogos oficiales
**CIE-10 MINSA (15 057 códigos)** y **CPMS (10 815 procedimientos)**.

> **Demo:** https://jylmdev-cyber.github.io/ayuda-his-fuas/ · **Repo:** https://github.com/jylmdev-cyber/ayuda-his-fuas

---

## Capturas

| | |
|:---:|:---:|
| ![Portada](docs/capturas/01-portada.png) | ![Explorador de ítems](docs/capturas/02-explorador-items.png) |
| *Portada: métricas y normas vigentes* | *Explorador de los 22 ítems con búsqueda y filtros* |
| ![Comparativa HIS vs FUA](docs/capturas/03-comparativa.png) | ![Simulador](docs/capturas/04-simulador.png) |
| *Tabla comparativa Hoja HIS vs FUA SIS* | *Simulador de llenado con ejemplo del material* |
| ![Biblioteca CIE-10](docs/capturas/05-catalogos-cie10.png) | ![Casos de auditoría](docs/capturas/06-casos-auditoria.png) |
| *Biblioteca: CIE-10 con vigencia RM 447-2024* | *Auditoría de hojas con errores sembrados* |
| ![Modo estudio](docs/capturas/07-estudio-flashcards.png) | ![Versión móvil](docs/capturas/08-portada-movil.png) |
| *Flashcards y quiz con progreso local* | *Diseño mobile-first* |

---

## Stack tecnológico

| Capa | Tecnología | Detalle |
|---|---|---|
| Framework | **Astro 5** (TypeScript estricto) | Salida estática, 30 rutas, islas cero: solo scripts vanilla agrupados por página |
| Estilos | **Tailwind CSS 4** vía `@tailwindcss/vite` | Tema oscuro por defecto con toggle persistente, tokens propios (`night`, `brand`, `accent`) |
| Datos | `src/data/content.ts` + JSON generados | Todo el contenido tipado; los catálogos viven en `public/data/*.json` |
| Iconos | SVG inline (`Icon.astro`) | Set propio estilo lucide, sin dependencias |
| Tests | **Vitest** (29 tests) + Playwright (capturas) | El CI ejecuta `npm test` antes del build |
| Hosting | **GitHub Pages** + Actions | `deploy.yml` (build+deploy) y `verificar-fuentes.yml` (cron mensual) |
| Offline | **PWA** | `manifest.webmanifest` + `sw.js` (navegaciones network-first, assets stale-while-revalidate) |
| SEO | Sitemap, JSON-LD, OG image | 22 páginas estáticas de capítulos CIE-10 indexables sin JS |

## Módulos del sistema

| Ruta | Módulo | Qué hace |
|---|---|---|
| `/` | Guía interactiva | Los 4 bloques del documento: HIS MINSA, Hoja HIS (22 ítems), FUA (Directiva 002-2024), curso de vida 301-306 y auditoría (Directiva 001-2025); buscador global, explorador con filtros, figuras del PDF con lightbox y tabla comparativa HIS vs FUA |
| `/simulador/` | Simulador de llenado | Formulario de los 22 ítems con ~30 reglas validadas en vivo (turno único, precisión 0.1, sexo en blanco en APP/AAA, formatos DNI/APP/AAA/CIE-10…) y veredicto del control de calidad; acepta códigos precargados desde la biblioteca (`?cie=`, `?cpms=`) y busca en los catálogos oficiales desde el ítem 22 |
| `/asistente/` | Asistente prestacional | Calcula edad exacta a la fecha de atención, sugiere ítem 13 y el código por curso de vida (COD. PRESTA.) con línea de tiempo etaria y checklist de reglas FUA |
| `/casos/` | Casos de auditoría | Hojas con errores sembrados para auditar: puntaje de detectados/omitidos/falsos positivos contra el mismo motor de reglas |
| `/estudio/` | Modo estudio | 71 flashcards por mazos con progreso persistente y quiz de 10 preguntas generadas desde el contenido |
| `/catalogos/` | Biblioteca de codificación | Exploradores CIE-10 y CPMS independientes, búsqueda unificada, filtros por capítulo/estrategia/estado, favoritos, recientes y ficha con fuente normativa |
| `/catalogos/cie10/capitulo-*/` | Capítulos estáticos | 22 páginas SEO sin JavaScript con todos los códigos, anclas por código y JSON-LD |
| `/glosario/` | Glosario | 26 términos con búsqueda y enlace a la sección donde se aplican |

## Arquitectura de datos

```
src/data/content.ts        ← fuente única del contenido del PDF (tipado estricto)
src/data/casos.ts          ← hojas base + errores sembrados de auditoría
src/scripts/reglas-his.ts  ← motor de reglas compartido (simulador + casos)
src/scripts/catalogo-loader.ts ← carga/caché/búsqueda de los JSON oficiales
public/data/cie10.json     ← 15 057 códigos (compacto: tablas de cadenas + bitmask)
public/data/cpms.json      ← 10 815 procedimientos
public/data/catalogos-meta.json ← conteos, fuentes y fecha de generación
```

Pipeline de catálogos oficiales (`npm run import:catalogos`):

1. Descarga de `files.minsa.gob.pe`: Excel CIE-10 (VOLUMEN VIGENTE), PDF de la RM 447-2024
   (Anexo 1 uso / Anexo 2 cese) y ZIP del CPMS (RM 550-2023).
2. Normalización: jerarquía capítulo→grupo→categoría→subcategoría, corrección de errores
   tipográficos de las fuentes (`I→1`, `O→0`), celdas combinadas del CPMS y códigos alfanuméricos.
3. Vigencia: el Anexo 2 marca `cesado`; los códigos del Anexo 1 ausentes del volumen se añaden
   como adición; todo con `fuente` y `fechaVerificacion` por registro.
4. Salida compacta con tablas de cadenas (6,4 MB → 1,4 MB) y caché `localStorage` para uso offline.

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo en `http://localhost:4321/ayuda-his-fuas` |
| `npm run build` | Build estático + sitemap en `dist/` |
| `npm run preview` | Sirve `dist/` con la ruta base real |
| `npm test` | Suite Vitest (reglas, contenido y calidad de catálogos) |
| `npm run import:catalogos` | Reimporta CIE-10/CPMS/RM 447 desde las fuentes oficiales |
| `npm run generar:og` | Regenera `public/og-image.png` (1200×630) |
| `npm run capturas` | Regenera las capturas del README con Playwright |

## Desarrollo local y despliegue

```bash
npm install
npm run dev

# publicar
git remote add origin https://github.com/jylmdev-cyber/ayuda-his-fuas.git
git push -u origin main
# GitHub → Settings → Pages → Source: GitHub Actions
```

`astro.config.mjs` fija `site` y `base` para el subdirectorio de Pages; si cambias el nombre del
repo, ajusta `base`, `public/robots.txt` y el texto de `scripts/generar-og.mjs`.
El workflow `verificar-fuentes.yml` revisa mensualmente las fuentes oficiales y abre un PR
automático si los catálogos cambiaron.

## Descargo

Herramienta **educativa** de consulta y revisión de registros: no reemplaza al aplicativo HIS MINSA
ni a los aplicativos del SIS, no diagnostica pacientes y no garantiza la aceptación de una
prestación. Fuentes: [REUNIS – MINSA](https://www.minsa.gob.pe/reunis/index.asp?op=3),
[RM 447-2024-MINSA](https://www.gob.pe/institucion/minsa/normas-legales/5689118-447-2024-minsa),
[BVS – Manuales del HIS](https://bvs.minsa.gob.pe/manuales-del-sistema-de-informacion-his/).
