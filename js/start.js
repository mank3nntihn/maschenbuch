// ===== Start: wird als letzte Datei geladen =====
DB.projects.forEach(p=>{if(!p.id)p.id=rid()});save(true);
if('serviceWorker' in navigator&&isSecureContext)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
SB.init();
render();
