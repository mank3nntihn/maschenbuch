module.exports={name:'Tutorial: geführte Tour durch die Website',async run(h,ok){
  const p=await h.page('u-anna','anna@x.de');
  await p.evaluate(()=>{pickP(0);S.row=12;save();tab='stash';render()});
  const vorher=await p.evaluate(()=>JSON.stringify(DB));
  await p.evaluate(()=>menu(1));await p.locator('#side .lnk[data-k=tour]').click();
  ok(await p.evaluate(()=>TOUR.on)&&await p.locator('#tourb').isVisible(),'Tutorial startet über das Menü');
  const schritte=[];let probleme=[];
  for(let k=0;k<40&&await p.evaluate(()=>TOUR.on);k++){
    await p.waitForTimeout(450);
    const s=await p.evaluate(()=>{const b=$('tourb').getBoundingClientRect(),hl=$('tourhl').getBoundingClientRect(),W=innerWidth,H=innerHeight,el=TOUR.el,r=el&&el.getBoundingClientRect();
      return{t:$('tourb').querySelector('h3').textContent,bubbleIn:b.left>=0&&b.right<=W&&b.top>=0&&b.bottom<=H,
        el:!!el,elIn:!el||(r.top>=-2&&r.bottom<=H+2),overlap:!!el&&!(b.bottom<=hl.top+2||b.top>=hl.bottom-2)}});
    schritte.push(s.t);if(!s.bubbleIn)probleme.push(s.t+': Erklärung ragt aus dem Bildschirm');if(!s.elIn)probleme.push(s.t+': Element nicht sichtbar');if(s.overlap)probleme.push(s.t+': Erklärung verdeckt das Element');
    await p.locator('#tnext').click()}
  ok(schritte.length>=15,`Tour hat ${schritte.length} Schritte und endet mit „Fertig“`);
  ok(!probleme.length,'Jeder Schritt: Erklärung im Bild, Element sichtbar und nicht verdeckt'+(probleme.length?' – '+probleme.join(' | '):''));
  ok(schritte.includes('Der Zähler')&&schritte.includes('Anleitung')&&schritte.includes('Garnlager')&&schritte.includes('Einstellungen'),'Tour führt über Zähler, Anleitung, Menü und Extras');
  ok(await p.evaluate(()=>!TOUR.on&&tab==='stash'&&!menuOpen),'Nach dem Ende ist man wieder auf der Seite von vorher');
  ok(await p.evaluate(v=>JSON.stringify(DB)===v,vorher),'Die Tour hat keine Daten verändert (keine Reihe gezählt)');
  // Zurück und Beenden mit Esc
  await p.evaluate(()=>TOUR.start());await p.waitForTimeout(200);await p.locator('#tnext').click();await p.waitForTimeout(200);
  const t2=await p.locator('#tourb h3').innerText();await p.locator('#tourb button',{hasText:'Zurück'}).click();await p.waitForTimeout(200);
  ok(/Willkommen/.test(await p.locator('#tourb h3').innerText())&&t2!=='','„Zurück“ geht einen Schritt zurück');
  await p.keyboard.press('Escape');ok(await p.evaluate(()=>!TOUR.on)&&!(await p.locator('#tour').isVisible()),'Esc beendet die Tour');
  // Während der Tour kann man nichts versehentlich antippen
  await p.evaluate(()=>{TOUR.start()});await p.waitForTimeout(200);for(let k=0;k<6;k++){await p.locator('#tnext').click();await p.waitForTimeout(250)}
  const r0=await p.evaluate(()=>S.row);await p.mouse.click(200,600);await p.mouse.click(300,500);
  ok(await p.evaluate(r0=>S.row===r0&&TOUR.on,r0),'Tippen neben die Erklärung löst nichts aus');
  await p.locator('#tourb button',{hasText:'Beenden'}).click();ok(await p.evaluate(()=>!TOUR.on),'„Beenden“ schließt die Tour');
  // Angemeldet mit Knit-Along: der Schritt mit den Freundinnen erscheint
  const A=await h.page('u-a','a@x.de',{login:true}),L=await h.page('u-l','l@x.de',{login:true});
  await L.fill('#kaln','Lea');await L.click('.kh button');await L.evaluate(()=>{pickP(0);go(1)});
  await A.waitForTimeout(800);await A.evaluate(()=>TOUR.start());const ts=[];
  for(let k=0;k<40&&await A.evaluate(()=>TOUR.on);k++){await A.waitForTimeout(380);ts.push(await A.locator('#tourb h3').innerText());await A.locator('#tnext').click()}
  ok(ts.includes('Deine Freundinnen')&&!ts.includes('Anmelden'),'Angemeldet: Schritt „Deine Freundinnen“ statt „Anmelden“');
}};
