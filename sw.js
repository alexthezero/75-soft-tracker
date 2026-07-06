const CACHE_NAME = "soft75-tracker-v15";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css?v=14",
  "./neon.css?v=15",
  "./script.js?v=6",
  "./pdf-weight.js?v=10",
  "./custom-activity.js?v=13",
  "./manifest.webmanifest?v=15",
  "./icon.svg?v=15"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const request = event.request;
  const acceptsHtml = request.headers.get("accept")?.includes("text/html");
  const isVersionedAsset = request.url.includes("?v=15") || request.url.includes("?v=14") || request.url.includes("?v=13") || request.url.includes("?v=12") || request.url.includes("?v=11") || request.url.includes("?v=10") || request.url.includes("?v=9") || request.url.includes("?v=8") || request.url.includes("?v=7") || request.url.includes("?v=6");

  if (acceptsHtml || isVersionedAsset) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then(cached => cached || caches.match("./index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request))
  );
});
