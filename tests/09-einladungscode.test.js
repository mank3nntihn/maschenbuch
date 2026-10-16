module.exports={name:'Einladungscode: ohne Code öffnet sich nichts',async run(h,ok){
  const p=await h.page('u-neu','neu@x.de',{ohneCode:true});
  const main=()=>p.locator('main').innerText();
  ok((await main()).includes('Einladungscode'),'Ohne Code erscheint nur der Code-Bildschirm');
  ok(!(await p.locator('nav').isVisible())&&!(await p.locator('#mb').isVisible()),'Menü und Tabs sind ausgeblendet');
  ok(await p.locator('.pc,#sbb,.plus').count()===0,'Keine Projekte, kein Zähler, keine Anmeldung sichtbar');
  await p.evaluate(()=>{tab='count';render()});ok((await main()).includes('Einladungscode'),'Auch direkt aufgerufene Seiten bleiben gesperrt');
  await p.fill('#gcode','falsch');await p.click('#gbtn');
  ok(await h.until(p,()=>/stimmt leider nicht/.test(document.querySelector('main').innerText)),'Falscher Code: Hinweis „stimmt leider nicht“');
  ok(await p.evaluate(()=>!localStorage.getItem('mb.kreis')),'Falscher Code wird nicht gespeichert');
  await p.fill('#gcode','  TestCode ');await p.press('#gcode','Enter');
  ok(await h.until(p,()=>!!document.querySelector('.pc')),'Richtiger Code (egal ob groß/klein): Startseite öffnet sich');
  ok(await p.locator('#sbb').isVisible(),'Danach erscheint die Google-Anmeldung');
  await p.reload();await p.waitForFunction(()=>typeof render==='function');
  ok(await p.locator('.pc').count()>0,'Nach Neuladen muss der Code nicht nochmal eingegeben werden');
  await p.click('#sbb');ok(await h.until(p,()=>SB.user&&SYNC.st==='ok'),'Anmeldung klappt und synchronisiert');
  ok(h.kreis.mitglieder.has('u-neu'),'Mit der Anmeldung ist sie dem Freundeskreis beigetreten');
  // Code wird geändert: Mitglieder bleiben drin
  h.kreis.code='neuercode';await p.reload();await p.waitForFunction(()=>typeof render==='function');
  ok(await h.until(p,()=>SB.user&&SYNC.st==='ok')&&await p.locator('.pc').count()>0,'Nach Code-Wechsel geht es für Mitglieder normal weiter');
  // Jemand mit altem Code, aber noch nicht beigetreten: wird wieder nach dem Code gefragt
  const q=await h.page('u-spaet','spaet@x.de',{login:true,ohneCode:true});
  await q.evaluate(()=>localStorage.setItem('mb.kreis','testcode'));await q.reload();await q.waitForFunction(()=>typeof render==='function');
  ok(await h.until(q,()=>/hat sich geändert/.test(document.querySelector('main').innerText)),'Alter Code ohne Beitritt: Hinweis „Code hat sich geändert“');
  await q.fill('#gcode','NeuerCode');await q.click('#gbtn');
  ok(await h.until(q,()=>SB.user&&SYNC.st==='ok'&&!!document.querySelector('.pc')),'Mit dem neuen Code geht es weiter');
  // Durchprobieren
  const r=await h.page('u-rate','r@x.de',{ohneCode:true});h.kreis.versuche=10;
  await r.fill('#gcode','neuercode');await r.click('#gbtn');
  ok(await h.until(r,()=>/Zu viele Versuche/.test(document.querySelector('main').innerText)),'Nach zu vielen Versuchen: Hinweis zum Warten');
  // Offline beim ersten Mal
  const o=await h.page('u-off','o@x.de',{ohneCode:true});await o.ctx.setOffline(true);await o.fill('#gcode','neuercode');await o.click('#gbtn');
  ok(await h.until(o,()=>/Internetverbindung/.test(document.querySelector('main').innerText)),'Ohne Internet beim ersten Öffnen: verständlicher Hinweis');
  await o.ctx.setOffline(false);
}};
