const CACHE_NAME = "soft75-tracker-v24";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css?v=14",
  "./final-polish.css?v=18",
  "./quote-welcome.css?v=23",
  "./script.js?v=6",
  "./pdf-weight.js?v=20",
  "./custom-activity.js?v=13",
  "./quote-welcome.js?v=23",
  "./manifest.webmanifest?v=24",
  "./icon.svg?v=24"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request).then(cached => cached || caches.match("./index.html"))));
});
