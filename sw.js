// 電波がないときも開けるようにするしくみ。ネットにつながるときは常に最新を取りにいく。
const CACHE = 'tekuteku-temple-v8';
const FILES = ['./', 'index.html', 'style.css', 'app.js', 'messages.js', 'holidays.js', 'poses.js', 'weather.js', 'news.js', 'manifest.webmanifest', 'icons/icon-180.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  // ニュースはアプリ側で覚えておくので、ここでは保存しない
  if (new URL(req.url).pathname.endsWith('news.json')) return;
  e.respondWith(
    fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(req, copy));
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }))
  );
});
