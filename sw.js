
const CACHE = "shakti-cache-v1";
const ASSETS = [
  "/",
  "/survey",
  "/chat",
  "/insights",
  "/static/css/base.css",
  "/static/js/base.js",
  "/static/CG_Heart.gif",
  "/static/food-bg.jpg",
  "/static/manifest.webmanifest"
];
self.addEventListener("install", e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
});
self.addEventListener("activate", e=>{
  e.waitUntil(self.clients.claim());
});
self.addEventListener("fetch", e=>{
  e.respondWith(
    caches.match(e.request).then(r=> r || fetch(e.request).then(res=>{
      const copy = res.clone();
      caches.open(CACHE).then(c=>c.put(e.request, copy));
      return res;
    }).catch(()=>caches.match("/")))
  );
});
