module.exports={name:'Konto: Abmelden und Konto löschen',async run(h,ok){
  const A=await h.page('u-anna','anna@x.de',{login:true});
  await A.fill('#kaln','Anna');await A.click('.kh button');await A.evaluate(()=>{pickP(0);setRow(7)});
  await h.until(A,()=>SYNC.st==='ok'&&!SYNC.dirty);
  await A.evaluate(()=>{tab='settings';render()});
  const pos=await A.evaluate(()=>[document.getElementById('sbout'),document.getElementById('sbdel')].map(b=>b&&b.getBoundingClientRect().top));
  ok(pos[0]!=null&&pos[1]!=null&&pos[0]<pos[1],'„Abmelden“ steht über „Konto löschen“');
  await A.click('#sbout');ok(await h.until(A,()=>!SB.user&&!!document.getElementById('sbb')),'Abmelden: zurück auf der Startseite mit Anmeldeknopf');
  ok(await A.evaluate(()=>DB.projects[0].row===7),'Nach dem Abmelden bleiben die Projekte auf dem Gerät');
  await A.click('#sbb');await h.until(A,()=>SB.user&&SYNC.st==='ok');
  await A.evaluate(()=>{tab='settings';render()});await A.click('#sbdel');
  ok(await A.locator('#dlg').isVisible(),'Konto löschen fragt nach');await A.click('#dlgn');
  ok(await A.evaluate(()=>!!SB.user)&&!h.gone.has('u-anna'),'Abbrechen löscht nichts');
  await A.click('#sbdel');await A.click('#dlgy');
  ok(await h.until(A,()=>!SB.user&&!!document.getElementById('sbb')),'Nach dem Löschen abgemeldet');
  ok(h.db.user_state.length===0&&h.db.kal.length===0,'Cloud-Daten und Knit-Along-Eintrag sind weg');
  ok(await A.evaluate(()=>DB.projects[0].row===7),'Projekte bleiben auf dem Gerät');
}};
