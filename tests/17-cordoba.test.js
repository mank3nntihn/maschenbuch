module.exports={name:'Córdoba Top: Vorlage mit 7 Größen',async run(h,ok){
  const p=await h.page('u-anna','anna@x.de');
  await p.evaluate(()=>{tab='home';render()});
  ok(await p.locator('select option[value=cordoba]').count()>0,'Vorlage „Córdoba Top“ ist bei „Neues Projekt“ auswählbar');
  await p.evaluate(()=>{const q=clone(tplDef('cordoba'));q.id=rid();DB.projects.push(q);pickP(DB.projects.length-1);tab='count';render()});
  // Maschenzahlen aller Größen: nach der Passe muss die Verteilung aufgehen, der Körper zur Brustweite passen
  const g=await p.evaluate(()=>CZ.map(k=>{setCSize(k);const c=calc(),z=c.z,y=c.R.filter(r=>r.sec==='yoke').pop().n,b=c.R.find(r=>r.k==='bk').n;
    return{k,passe:y===2*z.f+2*z.sl+z.bk+4&&y===z.co+8*z.y,koerper:Math.abs(b/2.1-z.bust)<1.5,m:Math.round(c.by[0].m)===z.m}}));
  ok(g.every(x=>x.passe),'Alle 7 Größen: Maschen nach der Passe stimmen mit der Verteilung überein'+(g.some(x=>!x.passe)?' – falsch: '+g.filter(x=>!x.passe).map(x=>x.k):''));
  ok(g.every(x=>x.koerper),'Alle 7 Größen: Körperumfang passt zum Brustumfang (±1,5 cm)');
  ok(g.every(x=>x.m),'Alle 7 Größen: Garnbedarf wie in der Anleitung');
  await p.evaluate(()=>{setCSize('s');S.row=0;save();tab='count';render()});
  let ins=await p.locator('#cnt .ins').innerText();
  ok(/Halsblende · Reihe 1 von 10/.test(ins)&&/128/.test(ins)&&/alle übrigen/.test(ins),'Zähler Reihe 1: Halsblende, Rückreihe, 128 Maschen');
  await p.evaluate(()=>{S.row=4;save();render()});
  ok(/Reihe 5 ist anders/.test(await p.locator('#cnt .alert').innerText())&&/Bruchkante/.test(await p.locator('#cnt .ins').innerText()),'Reihe 5: Warnung „Bruchkante“');
  await p.evaluate(()=>{S.row=11;save();render()});ins=await p.locator('#cnt .ins').innerText();
  ok(/Passe · Zunahme 1 von 20/.test(ins)&&/136/.test(ins)&&/\+8/.test(ins),'Passe: Zunahme 1 von 20, danach 136 Maschen');
  ok(/Passe/.test(await p.locator('#rowof').innerText()),'„Du strickst Reihe …“ nennt den Abschnitt');
  // Länge ändern ändert die Rundenzahl
  const t0=await p.evaluate(()=>calc().total);await p.evaluate(()=>{S.l=40;save()});const t1=await p.evaluate(()=>calc().total);
  ok(t1-t0===16,`Körperlänge +5 cm ergibt 16 Runden mehr (${t1-t0})`);
  await p.evaluate(()=>{setCSize('m')});ok(await p.evaluate(()=>S.l===36&&S.size==='m'),'Größe wechseln setzt die Körperlänge laut Anleitung');
  await p.evaluate(()=>{tab='size';render()});
  ok(/90 cm Brustumfang/.test(await p.locator('main').innerText())&&!/undefined/.test(await p.locator('main').innerText()),'Maße: Größe M für 90 cm Brustumfang');
  await p.evaluate(()=>{tab='steps';render()});const st=await p.locator('main').innerText();
  ok(['Halsblende','Passe','Ärmel stilllegen','Ausschnitt','Körper','Rechter Ärmel','Linker Ärmel','Ausschnittkante','Kordel','Alma Patterns'].every(x=>st.includes(x)),'Anleitung: alle Abschnitte und Hinweis auf Alma Patterns');
  await p.evaluate(()=>{tab='wool';render()});ok(/700 m/.test(await p.locator('main').innerText())&&/Divina/.test(await p.locator('main').innerText()),'Wolle: 700 m für M, Garnvorschläge');
  await p.evaluate(()=>{V3.mode='now';tab='3d';render()});ok(await p.locator('#gl .topv svg').count()===1&&await p.locator('#app .seg button',{hasText:'Am Model'}).count()===0,'3D-Tab ohne WebGL: Schnitt-Vorschau als Ersatz');
  // Großer Zähler: Kästen und Vorschau wachsen mit
  await p.evaluate(()=>{S.row=80;save();FOC.open()});
  const h0=await p.evaluate(()=>+document.querySelector('#fgl clipPath rect').getAttribute('height'));await p.locator('.fz .plus').click();
  const h1=await p.evaluate(()=>+document.querySelector('#fgl clipPath rect').getAttribute('height'));
  ok(h1>h0&&/Körper · Runde/.test(await p.locator('.fz .k1').innerText()),'Großer Zähler: „Körper · Runde …“, Vorschau füllt sich mit +1');
  await p.evaluate(()=>FOC.close());
  // Englisch
  await p.evaluate(()=>{DB.lang='en';S.row=0;save();tab='count';render()});ok(/Neckline casing · row 1 of 10/.test(await p.locator('#cnt .ins').innerText()),'Englisch: „Neckline casing · row 1 of 10“');
  await p.evaluate(()=>{DB.lang='de';save()});
  // Alte Version der Seite macht beim Speichern einen Streifenschal daraus – das Merkmal pat holt das Top zurück
  ok(await p.evaluate(()=>{const q=fixP({...clone(S),tpl:'stripe'});return q.tpl==='cordoba'&&q.size==='m'}),'Kompatibel: von alter Version gespeichertes Top wird wieder erkannt');
  // Fertig
  await p.evaluate(()=>{S.row=calc().total-1;delete S.fin;save();render();go(1)});ok(await p.locator('#fin').isVisible(),'Letzte Reihe: Fertig-Moment');
  await p.evaluate(()=>FIN.close());
}};
