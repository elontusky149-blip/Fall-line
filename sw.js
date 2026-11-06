// Fall Line offline cache. Change VERSION whenever the game files change, so phones fetch the new ones.
const VERSION = "fall-line-v25";
const CORE = ["./", "index.html", "three.min.js", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const font = /fonts\.(googleapis|gstatic)\.com/.test(req.url);
  if (!font && new URL(req.url).origin !== location.origin) return;
  // The game page: try the network first so updates arrive, fall back to the saved copy offline.
  if (req.mode === "navigate") { e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(VERSION).then(x => x.put("index.html", c)); return r; }).catch(() => caches.match("index.html"))); return; }
  // Everything else, fonts included: saved copy first, then the network, saving what comes back.
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok || r.type === "opaque") { const c = r.clone(); caches.open(VERSION).then(x => x.put(req, c)); } return r; })));
});
