// Maschenbuch – Offline-Speicher
// Seite: erst Netz (max. 3 s), sonst gespeicherte Version. Garnliste & Bibliothek: sofort aus dem Speicher, im Hintergrund aktualisieren.
// Garnfotos: einmal geladen, offline verfügbar. Supabase-Anfragen werden nie zwischengespeichert.
const V='maschenbuch-v1',CORE=['./','index.html','garne.json','manifest.json','icon-180.png','icon-192.png','icon-512.png',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js'],IMG='maschenbuch-fotos',MAXIMG=1500;
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.all(CORE.map(u=>c.add(new Request(u,{cache:'reload'})).catch(()=>{})))));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V&&x!==IMG).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
const timeout=(p,ms)=>Promise.race([p,new Promise((_,r)=>setTimeout(()=>r('timeout'),ms))]);
async function trim(){const c=await caches.open(IMG),k=await c.keys();for(let i=0;i<k.length-MAXIMG;i++)await c.delete(k[i])}
self.addEventListener('fetch',e=>{const r=e.request,u=new URL(r.url);if(r.method!=='GET')return;
  if(u.hostname.endsWith('supabase.co'))return;
  if(r.mode==='navigate'){e.respondWith(timeout(fetch(r),3000).then(res=>{const k=res.clone();caches.open(V).then(c=>c.put('index.html',k));return res}).catch(()=>caches.match('index.html',{ignoreSearch:true})));return}
  if(u.hostname==='cdn.shopify.com'){e.respondWith(caches.open(IMG).then(async c=>{const hit=await c.match(r);if(hit)return hit;
    try{const res=await fetch(r);if(res.ok||res.type==='opaque'){c.put(r,res.clone());trim()}return res}catch(x){return new Response('',{status:504})}}));return}
  e.respondWith(caches.open(V).then(async c=>{const hit=await c.match(r,{ignoreSearch:u.origin===location.origin});
    const net=fetch(r).then(res=>{if(res.ok)c.put(r,res.clone());return res}).catch(()=>hit);return hit||net}))});
