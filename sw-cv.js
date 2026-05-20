const CACHE = 'cinevault-v1';
const ASSETS = ['/CineVault/','/CineVault/index.html','/CineVault/manifest-cv.json','/CineVault/icon-cv-192.png','/CineVault/icon-cv-512.png'];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  if(url.origin!==location.origin)return;
  if(e.request.destination==='document'||url.pathname.endsWith('.html')||url.pathname.endsWith('/')){
    e.respondWith(fetch(e.request).then(resp=>{if(resp&&resp.status===200){caches.open(CACHE).then(c=>c.put(e.request,resp.clone()));}return resp;}).catch(()=>caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then(cached=>{if(cached)return cached;return fetch(e.request).then(resp=>{if(resp&&resp.status===200)caches.open(CACHE).then(c=>c.put(e.request,resp.clone()));return resp;});}));
});
