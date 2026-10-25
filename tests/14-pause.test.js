module.exports={name:'Pause-Timer: Reihe anhalten, „Reihe fertig“ gesperrt',async run(h,ok){
  const p=await h.page('u-anna','anna@x.de');
  // Uhr im Browser steuerbar machen
  await p.evaluate(()=>{window.__t=Date.now();Date.now=()=>window.__t;pickP(0);S.row=20;S.last=0;['tm','tr','hist','pz','pt'].forEach(k=>delete S[k]);save();tab='count';FOC.on=false;render()});
  const vor=s=>p.evaluate(s=>{window.__t+=s*1000;document.querySelectorAll('.rtt b').forEach(e=>e.textContent=PZ.time(S))},s);
  ok((await p.locator('#cnt .rtt').innerText()).includes('–:––'),'Vor der ersten Reihe: Timer zeigt –:––');
  await p.click('#cnt .plus');await vor(95);
  ok(/Diese Reihe: 1:35/.test(await p.locator('#cnt .rtt').innerText()),'Timer zeigt die Zeit der aktuellen Reihe (1:35)');
  await p.click('#cnt .pzb');
  ok(await p.evaluate(()=>!!S.pz)&&(await p.locator('#cnt .pzb').innerText()).includes('Weiter'),'⏸ Pause hält an, Knopf zeigt „▶ Weiter“');
  ok(await p.locator('#cnt .plus.off[aria-disabled="true"]').count()===1,'„Reihe fertig“ ist ausgegraut');
  await vor(120);
  ok(/Pause: 2:00/.test(await p.locator('#cnt .rtt').innerText()),'Während der Pause läuft die Pausenzeit (2:00)');
  const r0=await p.evaluate(()=>S.row);await p.locator('#cnt .plus').evaluate(e=>e.scrollIntoView({block:'center'}));await p.locator('#cnt .plus').click({force:true});
  ok(await p.evaluate(r0=>S.row===r0,r0),'Tippen auf „Reihe fertig“ zählt nicht weiter');
  ok(await h.until(p,()=>[...document.querySelectorAll('.toast')].some(e=>!e.hidden&&/Timer ist auf Pause/.test(e.textContent))),'Hinweis „Timer ist auf Pause …“ erscheint beim Tippen');
  await p.keyboard.press('ArrowRight');ok(await p.evaluate(r0=>S.row===r0,r0),'Auch die Tastatur (→) zählt in der Pause nicht');
  await h.until(p,()=>!document.querySelector('.toast'),null,6000);await p.locator('#cnt .plus').evaluate(e=>e.scrollIntoView({block:'center'}));await p.locator('#cnt .plus').hover({force:true});
  const tip=await p.locator('#cnt .plus').evaluate(e=>getComputedStyle(e,'::after').content);
  ok(/Timer ist auf Pause/.test(tip),'Beim Drüberfahren erscheint der Hinweis am Knopf');
  await p.click('#cnt .pzb');
  ok(await p.evaluate(()=>!S.pz)&&await p.locator('#cnt .plus.off').count()===0,'▶ Weiter: Knopf wieder aktiv');
  ok(/Diese Reihe: 1:35/.test(await p.locator('#cnt .rtt').innerText()),'Timer macht bei 1:35 weiter – die Pause zählt nicht mit');
  await vor(25);await p.click('#cnt .plus');
  ok(await p.evaluate(()=>S.hist[S.hist.length-1].g===120000&&!S.pt),'Verlauf: Reihe dauerte 2:00 ohne die Pause');
  ok(await p.evaluate(()=>Math.abs(S.tm-120000)<1500),'Strickzeit zählt die Pause nicht mit');
  // Großer Zähler
  await p.evaluate(()=>FOC.open());await p.click('.fz .pzb');
  ok(await p.locator('.fz .plus.off').count()===1&&await p.locator('.fz .rtm.on').count()===1,'Großer Zähler: Pause sperrt dort ebenfalls „Reihe fertig“');
  const r1=await p.evaluate(()=>S.row);await p.locator('.fz .plus').click({force:true});ok(await p.evaluate(r1=>S.row===r1,r1),'Großer Zähler: kein +1 in der Pause');
  await p.click('.fz .pzb');await p.click('.fz .plus');ok(await p.evaluate(r1=>S.row===r1+1,r1),'Großer Zähler: nach ▶ Weiter zählt +1 wieder');
  await p.evaluate(()=>{DB.lang='en';FOC.upd()});
  ok((await p.locator('.fz .rtt').innerText()).includes('This row')&&(await p.locator('.fz .pzb').innerText()).includes('Pause'),'Englisch: „This row“');
  await p.evaluate(()=>{DB.lang='de';FOC.close()});
  // Pause wird gespeichert (Neuladen) und mit dem Projekt synchronisiert
  await p.click('#cnt .pzb');await p.reload();await p.evaluate(()=>{tab='count';render()});
  ok(await p.locator('#cnt .plus.off').count()===1,'Pause bleibt nach dem Neuladen bestehen');
  await p.click('#cnt .pzb');
}};
