/* Cosmocalc iPhone : mémoire hors connexion.
   Les pages se chargent depuis Internet quand il y en a (mise à jour automatique) et depuis la mémoire sinon. */
const V = 'cosmocalc-ios-v1';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'planet-mercure.jpg', 'planet-venus.jpg', 'planet-terre.jpg', 'planet-mars.jpg', 'planet-jupiter.jpg', 'planet-saturne.jpg', 'planet-uranus.jpg', 'planet-neptune.jpg', 'planet-pluton.jpg'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== location.origin) return;
  if (r.mode === 'navigate') {
    const cached = caches.match('index.html');
    const net = fetch(r).then(res => { const copy = res.clone(); caches.open(V).then(c => c.put('index.html', copy)); return res; });
    const slow = new Promise(res => setTimeout(() => res(cached), 3500));
    e.respondWith(Promise.race([net.catch(() => cached), slow]).then(x => x || cached));
    return;
  }
  e.respondWith(caches.match(r).then(h => h || fetch(r).then(res => { const copy = res.clone(); caches.open(V).then(c => c.put(r, copy)); return res; })));
});
