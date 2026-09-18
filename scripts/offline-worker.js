/* BUILD is injected after Astro and Pagefind finish. No cross-origin caching. */
const PREFIX = 'garagedocs-offline-' + BUILD.scope + '-';
const CACHE = PREFIX + BUILD.version;
const META = new URL(BUILD.scope + '__offline_complete__', self.location.origin).href;
const urls = new Set(BUILD.files.map(file => file.url));
async function broadcast(message) {
  for (const client of await self.clients.matchAll({ includeUncontrolled: true })) {
    if (new URL(client.url).pathname.startsWith(BUILD.scope)) client.postMessage(message);
  }
}
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    try {
      let completed = 0;
      // Bounded batches keep memory use manageable on phones.
      for (let index = 0; index < BUILD.files.length; index += 8) {
        const batch = BUILD.files.slice(index, index + 8);
        const results = await Promise.allSettled(batch.map(async file => {
          const response = await fetch(file.url, { cache: 'reload', credentials: 'same-origin' });
          if (!response.ok || response.redirected) throw new Error('Could not download ' + file.url);
          const bytes = await response.clone().arrayBuffer();
          const digest = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))]
            .map(value => value.toString(16).padStart(2, '0')).join('');
          // Reject mixed releases if a deployment changes during the download.
          if (digest !== file.hash) throw new Error('The site changed during download. Please retry.');
          await cache.put(file.url, response);
        }));
        const failure = results.find(result => result.status === 'rejected');
        if (failure) throw failure.reason;
        completed += batch.length;
        await broadcast({ type: 'OFFLINE_PROGRESS', completed, total: BUILD.count });
      }
      await cache.put(META, new Response(JSON.stringify({ version: BUILD.version })));
      await broadcast({ type: 'OFFLINE_DOWNLOADED' });
      // A first install activates normally. Updates wait for explicit reader approval.
    } catch (error) {
      await caches.delete(CACHE);
      await broadcast({ type: 'OFFLINE_ERROR', message: String(error) });
      throw error;
    }
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    // Keep the previous snapshot for already-open tabs' lazy-loaded assets.
    const keys = (await caches.keys()).filter(key => key.startsWith(PREFIX) && key !== CACHE);
    for (const key of keys.slice(0, -1)) await caches.delete(key);
    await self.clients.claim();
    await broadcast({ type: 'OFFLINE_READY' });
  })());
});
self.addEventListener('message', event => {
  if (event.data?.type === 'APPLY_UPDATE') event.waitUntil(self.skipWaiting());
  if (event.data?.type === 'OFFLINE_STATUS') {
    event.waitUntil((async () => {
      const cache = await caches.open(CACHE);
      const keys = await cache.keys();
      event.source?.postMessage({
        type: 'OFFLINE_STATUS', ready: Boolean(await cache.match(META)) && keys.length >= BUILD.count + 1,
        version: BUILD.version, bytes: BUILD.bytes,
      });
    })());
  }
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || !url.pathname.startsWith(BUILD.scope)) return;
  let path = url.pathname;
  if (!urls.has(path)) {
    const html = path.replace(/\/$/, '') + '/index.html';
    if (urls.has(html)) path = html;
  }
  // Version metadata and worker updates always go to the network.
  if (path === BUILD.scope + 'sw.js' || path === BUILD.scope + 'offline-info.json') return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const response = await cache.match(path);
    if (response) return response;
    if (!urls.has(path) && event.request.mode !== 'navigate') {
      for (const name of (await caches.keys()).filter(name => name.startsWith(PREFIX) && name !== CACHE)) {
        const previous = await (await caches.open(name)).match(path);
        if (previous) return previous;
      }
    }
    try { return await fetch(event.request); }
    catch (error) {
      if (event.request.mode === 'navigate') {
        const missing = await cache.match(BUILD.scope + '404.html');
        if (missing) return new Response(await missing.arrayBuffer(), {
          status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      }
      throw error;
    }
  })());
});
