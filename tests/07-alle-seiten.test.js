module.exports={name:'Alle Seiten, Vorlagen und Werkzeuge',async run(h,ok){
  const p=await h.page('u-anna','anna@x.de');
  const seiten={count:'Reihe fertig',steps:'Tippe auf einen Schritt',wool:'Wollbedarf',size:'Lauflänge',stash:'Garnlager',shop:'Einkaufsliste',gloss:'Abkürzungen',settings:'Farbmuster',help:'Hilfe & Techniken',tausch:'Tauschbörse',impressum:'Impressum','3d':''};
  for(const tpl of ['sophie','weekend','stripe']){
    await p.evaluate(tpl=>{newTpl=tpl;const def=tplDef(tpl),q=clone(def);q.id=rid();q.name='T-'+tpl;DB.projects.push(q);pickP(DB.projects.length-1)},tpl);
    let fehlt=[];for(const [pg,txt] of Object.entries(seiten)){await p.evaluate(pg=>{tab=pg;render()},pg);if(txt&&!(await p.locator('main').innerText()).includes(txt))fehlt.push(pg)}
    ok(!fehlt.length,`Vorlage ${tpl}: alle ${Object.keys(seiten).length} Seiten zeigen ihren Inhalt`+(fehlt.length?' – fehlt: '+fehlt:''));
    await p.evaluate(()=>{tab='3d';render()});await p.waitForTimeout(300);
    ok(await p.evaluate(()=>{const c=document.querySelector('#gl canvas');return !!c&&c.width>0}),`Vorlage ${tpl}: 3D-Ansicht zeichnet`);
  }
  // Lern-Ecke: Animation läuft
  await p.evaluate(()=>{tab='help';helpOpen='re';render()});await p.waitForTimeout(400);
  ok(await p.locator('.hc.on canvas').count()>0,'Lern-Ecke zeigt eine Animation');
  // Abkürzung antippen zeigt Erklärung
  await p.evaluate(()=>{pickP(0);tab='count';render()});await p.locator('#app abbr.ab').first().click();
  ok(await p.locator('#pop').isVisible(),'Antippen einer Abkürzung zeigt die Erklärung');
  // Großer Zähler
  await p.evaluate(()=>FOC.open());const r0=await p.evaluate(()=>S.row);await p.locator('.fz .plus').click();
  ok(await p.evaluate(r0=>S.row===r0+1&&FOC.on,r0),'Großer Zähler zählt');await p.evaluate(()=>FOC.close());
  // Reihe eingeben
  await p.evaluate(()=>{tab='count';render()});await p.click('.jb');await p.fill('#jr','12');await p.press('#jr','Enter');
  ok(await p.evaluate(()=>S.row===11),'„Reihe eingeben 12“: man strickt danach Reihe 12 (11 fertig)');
  // Farbwahl mit Hobbii-Garnen (garne.json)
  await p.evaluate(()=>{tab='stash';render()});await p.locator('.yr .swb').first().click();
  ok(await h.until(p,()=>document.querySelectorAll('#pkb .gi').length>10,null,8000),'Farbwahl lädt die Hobbii-Garnliste');
  await p.locator('#pkb .gi').first().click();await p.locator('#pkb .fc').first().click();
  ok(await p.evaluate(()=>/–/.test(DB.stash[0].n)),'Hobbii-Farbe wird ins Garnlager übernommen');
  // Rückgängig: Projekt zurücksetzen, Farbe entfernen, Einkaufsliste
  await p.evaluate(()=>{pickP(DB.projects.findIndex(q=>q.name==='T-stripe'));tab='size';render()});
  const n0=await p.evaluate(()=>S.stripes.length);await p.locator('.sr button[aria-label="Löschen"]').first().click();
  ok(await p.evaluate(n0=>S.stripes.length===n0-1,n0),'Farbe entfernt');await p.click('#undo button');
  ok(await p.evaluate(n0=>S.stripes.length===n0,n0),'Rückgängig holt die Farbe zurück');
  await p.evaluate(()=>{S.w=33;save();render()});await p.locator('button',{hasText:'Projekt zurücksetzen'}).click();await p.click('#dlgy');
  ok(await p.evaluate(()=>S.w!==33),'Projekt zurückgesetzt');await p.click('#undo button');ok(await p.evaluate(()=>S.w===33),'Rückgängig holt die Projektwerte zurück');
  await p.evaluate(()=>{DB.shop=[{n:'Gelb',c:'#f3d36b',q:2,d:true}];DB.stash=[];save();tab='shop';render()});
  await p.locator('button',{hasText:'ins Lager übernehmen'}).click();ok(await p.evaluate(()=>DB.stash.length===1&&!DB.shop.length),'Abgehakte ins Lager übernommen');
  await p.click('#undo button');ok(await p.evaluate(()=>DB.stash.length===0&&DB.shop.length===1),'Rückgängig macht das Übernehmen rückgängig');
  // Export und Import
  const [dl]=await Promise.all([p.waitForEvent('download'),p.evaluate(()=>exportDB())]);const f=await dl.path();
  const j=JSON.parse(require('fs').readFileSync(f,'utf8'));ok(j.app==='maschenbuch'&&j.daten.projects.length>=4,'Export erzeugt eine Sicherungsdatei');
  await p.evaluate(()=>{DB.projects.splice(1);save()});await p.evaluate(()=>menu(1));await p.setInputFiles('#impf',f);await p.click('#dlgy');
  ok(await h.until(p,n=>DB.projects.length===n,j.daten.projects.length),'Import stellt die Sicherung wieder her');
  // Farbmuster und Sprache
  await p.evaluate(()=>{tab='settings';render()});await p.locator('.th').nth(4).click();
  ok(await p.evaluate(()=>DB.theme==='night'&&document.documentElement.dataset.dark==='1'),'Dunkles Farbmuster wird aktiv');
  await p.locator('button',{hasText:'English'}).click();ok((await p.locator('#nav').innerText()).includes('Counter'),'Umschalten auf Englisch');
}};
