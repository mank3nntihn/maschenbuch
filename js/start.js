// ===== Start: wird als letzte Datei geladen =====
DB.projects.forEach(p=>{if(!p.id)p.id=rid()});save(true);
if('serviceWorker' in navigator&&isSecureContext)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
SB.init();
render();
// Garnliste im Hintergrund laden, damit Angebote auf der Einkaufsliste gleich im Menü auffallen
if(GATE.ok()&&DB.shop.some(s=>s.u&&!s.d))PK.load().then(()=>{if(menuOpen)renderMenu()}).catch(()=>{});
