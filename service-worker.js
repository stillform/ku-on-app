const CACHE_VERSION = 'kuon-offline-v3';

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/kuon-app-icon.svg',
  './assets/kuon-app-icon-192.png',
  './assets/kuon-app-icon-512.png',
  './assets/kuon-apple-touch-icon.png',
  './content/about/content.json',
  './content/breathe/content.json',
  './content/ground/content.json',
  './content/letgo/content.json',
  './content/now/content.json',
  './content/settle/content.json',
  './content/untangle/content.json',
  './assets/audio/ambient/kuon-natural-shore-loop-web-108s.mp3',
  './assets/audio/narration/box-exhale-01.mp3',
  './assets/audio/narration/box-exhale-02.mp3',
  './assets/audio/narration/box-hold-one-01.mp3',
  './assets/audio/narration/box-hold-one-02.mp3',
  './assets/audio/narration/box-hold-two-01.mp3',
  './assets/audio/narration/box-hold-two-02.mp3',
  './assets/audio/narration/box-inhale-01.mp3',
  './assets/audio/narration/box-inhale-02.mp3',
  './assets/audio/narration/even-exhale-01.mp3',
  './assets/audio/narration/even-exhale-02.mp3',
  './assets/audio/narration/even-inhale-01.mp3',
  './assets/audio/narration/even-inhale-02.mp3',
  './assets/audio/narration/release-exhale-01.mp3',
  './assets/audio/narration/release-exhale-02.mp3',
  './assets/audio/narration/release-hold-one-01.mp3',
  './assets/audio/narration/release-hold-one-02.mp3',
  './assets/audio/narration/release-inhale-01.mp3',
  './assets/audio/narration/release-inhale-02.mp3'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_VERSION).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE_VERSION);
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch (error) {
    return (await cache.match(request)) || cache.match('./index.html');
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_VERSION);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) await cache.put(request, response.clone());
  return response;
}

async function cachedRangeResponse(request) {
  const cache = await caches.open(CACHE_VERSION);
  const fullResponse = await cache.match(request.url);
  if (!fullResponse) return fetch(request);

  const range = request.headers.get('range');
  const match = /^bytes=(\d+)-(\d*)$/.exec(range || '');
  if (!match) return fullResponse;

  const bytes = await fullResponse.arrayBuffer();
  const start = Number(match[1]);
  const end = match[2] ? Math.min(Number(match[2]), bytes.byteLength - 1) : bytes.byteLength - 1;
  if (start >= bytes.byteLength || end < start) {
    return new Response(null, {
      status: 416,
      headers: { 'Content-Range': `bytes */${bytes.byteLength}` }
    });
  }

  return new Response(bytes.slice(start, end + 1), {
    status: 206,
    statusText: 'Partial Content',
    headers: {
      'Accept-Ranges': 'bytes',
      'Content-Length': String(end - start + 1),
      'Content-Range': `bytes ${start}-${end}/${bytes.byteLength}`,
      'Content-Type': fullResponse.headers.get('Content-Type') || 'audio/mpeg'
    }
  });
}

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.headers.has('range') && url.pathname.endsWith('.mp3')) {
    event.respondWith(cachedRangeResponse(request));
    return;
  }

  if (request.mode === 'navigate' || url.pathname.endsWith('/index.html') || url.pathname.includes('/content/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(cacheFirst(request));
});
