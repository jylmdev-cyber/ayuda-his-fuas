/* Service worker de la guía HIS MINSA & FUA SIS.
 * Estrategia: stale-while-revalidate para todo recurso same-origin.
 * Tras la primera visita, páginas, estilos, imágenes y los JSON de los
 * catálogos quedan disponibles sin conexión. */
const VERSION = 'his-fua-v2';
const SHELL = ['./', './index.html', './manifest.webmanifest', './favicon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((claves) => Promise.all(claves.filter((clave) => clave !== VERSION).map((clave) => caches.delete(clave))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Navegaciones: network-first para servir HTML fresco; la caché solo
  // responde sin conexión. El resto de recursos: stale-while-revalidate.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.open(VERSION).then(async (cache) => {
        try {
          const respuesta = await fetch(event.request);
          if (respuesta && respuesta.ok) cache.put(event.request, respuesta.clone());
          return respuesta;
        } catch {
          const enCache = (await cache.match(event.request, { ignoreSearch: true })) || (await cache.match('./index.html'));
          return enCache || Response.error();
        }
      }),
    );
    return;
  }

  event.respondWith(
    caches.open(VERSION).then(async (cache) => {
      const enCache = await cache.match(event.request, { ignoreSearch: true });
      const refresco = fetch(event.request)
        .then((respuesta) => {
          if (respuesta && respuesta.ok) cache.put(event.request, respuesta.clone());
          return respuesta;
        })
        .catch(() => enCache);
      return enCache || refresco;
    }),
  );
});
