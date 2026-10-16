module.exports={name:'Offline: App startet ohne Internet',async run(h,ok){
  const fs=require('fs'),path=require('path'),root=path.join(__dirname,'..');
  const html=[...fs.readFileSync(path.join(root,'index.html'),'utf8').matchAll(/src="js\/(\w+)\.js"/g)].map(m=>m[1]);
  const sw=JSON.parse(fs.readFileSync(path.join(root,'sw.js'),'utf8').match(/const JS=(\[[^\]]*\])/)[1].replace(/'/g,'"'));
  ok(JSON.stringify(html)===JSON.stringify(sw),'index.html und sw.js kennen dieselben Programmdateien');
  ok(fs.readdirSync(path.join(root,'js')).filter(f=>f.endsWith('.js')).length===html.length,'Jede Datei in js/ wird auch geladen');
  const p=await h.page('u-anna','anna@x.de',{sw:true});
  ok(await h.until(p,()=>navigator.serviceWorker&&navigator.serviceWorker.controller,null,10000)||(await p.reload(),await h.until(p,()=>!!navigator.serviceWorker.controller,null,10000)),'Offline-Speicher (Service Worker) ist aktiv');
  await p.waitForTimeout(1500);
  await p.ctx.setOffline(true);await p.reload();await p.waitForFunction(()=>typeof render==='function');
  ok((await p.locator('main').innerText()).includes('Meine Projekte'),'Ohne Internet: Startseite erscheint');
  await p.evaluate(()=>{pickP(0)});const r=await p.evaluate(()=>S.row);await p.evaluate(()=>go(1));
  ok(await p.evaluate(r=>S.row===r+1,r),'Ohne Internet: Zählen funktioniert');
  await p.evaluate(()=>{tab='help';helpOpen='re';render()});await p.waitForTimeout(300);
  ok(await p.locator('.hc.on canvas').count()>0,'Ohne Internet: Lern-Ecke funktioniert');
  await p.ctx.setOffline(false);
}};
