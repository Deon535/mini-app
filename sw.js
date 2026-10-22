// «Кладовщик» на телефоне: хранит куски огромных книг (data/texts/<номер>/ЧЧ.<отпечаток>.js), чтобы второй раз они открывались сразу, и без интернета.
// Имя куска содержит отпечаток его содержимого (делает .claude/split.js): изменился текст — имя новое, старый кусок не подставится.
// Всё остальное (главная, обложки, остальные книги) идёт как обычно, мимо этого файла.
const CACHE = 'book-chunks-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin || !/\/data\/texts\/\d+\/[^/]+\.js$/.test(u.pathname)) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(e.request);
    if (hit) return hit;
    const r = await fetch(e.request);
    if (r.ok) c.put(e.request, r.clone());
    return r;
  }));
});
