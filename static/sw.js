// static/sw.js

self.addEventListener("install", event => {
  console.log("Service Worker: Installing...");
  event.waitUntil(
    caches.open("quizzer-cache-v1").then(cache => {
      return cache.addAll([
        "/",                    // root
        "/static/css/style.css",    // your main CSS
        "/static/favicon.png"   // your favicon
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  console.log("Service Worker: Activated");
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== "quizzer-cache-v1")
            .map(key => caches.delete(key))
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Serve from cache, or fetch if not cached
      return response || fetch(event.request);
    })
  );
});
