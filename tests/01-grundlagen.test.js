module.exports={name:'Grundlagen: Startseite, Zähler, Menü, Impressum',async run(h,ok){
  const p=await h.page('u-anna','anna@x.de');
  ok(await p.locator('#sbb').isVisible(),'Google-Anmeldeknopf sichtbar ohne Anmeldung');
  ok(await p.locator('.pc').count()>0,'Projektkarten auf der Startseite');
  await p.evaluate(()=>{pickP(0)});const r0=await p.evaluate(()=>S.row);
  await p.evaluate(()=>{go(1);go(1);go(1)});ok(await p.evaluate(()=>S.row)===r0+3,'+1 zählt die Reihe hoch');
  await p.reload();await p.waitForFunction(()=>typeof S==='object'&&!!S);ok(await p.evaluate(()=>S.row)===r0+3,'Reihe bleibt nach Neuladen erhalten');
  await p.evaluate(()=>menu(1));const m=await p.locator('#side').innerText();
  ok(m.includes('Tauschbörse'),'Menü enthält die Tauschbörse unter Extras');ok(m.includes('Impressum'),'Menü enthält das Impressum');
  await p.locator('#side .imp').click();ok((await p.locator('main').innerText()).includes('robs0108@web.de'),'Impressum zeigt die Kontaktadresse');
  await p.evaluate(()=>{tab='tausch';render()});ok((await p.locator('main').innerText()).includes('Melde dich auf der Startseite an'),'Tauschbörse ohne Anmeldung zeigt Hinweis');
  await p.evaluate(()=>{tab='stash';render()});const b=p.locator('.yr .give').first();
  if(await b.count()){await b.click();ok(await p.locator('#dlg').isVisible(),'🤝 ohne Anmeldung zeigt einen Hinweis');await p.click('#dlgy')}
  await p.setViewportSize({width:1280,height:800});await p.evaluate(()=>{tab='count';render()});ok(await p.locator('#nav button').count()===5,'Laptop-Ansicht mit allen Tabs');
}};
