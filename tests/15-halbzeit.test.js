module.exports={name:'Halbzeit-Animation',async run(h,ok){
  const p=await h.page('u-anna','anna@x.de');
  const half=await p.evaluate(()=>{pickP(0);delete S.half;delete S.pz;const tt=calc().total,hf=Math.ceil(tt/2);S.row=hf-2;save();tab='count';render();return hf});
  await p.evaluate(()=>go(1));ok(await p.locator('#half').count()===0,'Eine Reihe vor der Hälfte: noch keine Animation');
  await p.evaluate(()=>go(1));
  ok(await p.locator('#half').count()===1&&/Halbzeit!/.test(await p.locator('#half').innerText()),'Mit +1 auf die Hälfte: „Halbzeit!“ erscheint');
  ok((await p.locator('#half').innerText()).includes(`${half} von`)&&(await p.locator('#half').innerText()).includes('Reihen geschafft'),'Zeigt die geschafften Reihen');
  ok(await p.locator('#half').evaluate(e=>getComputedStyle(e).pointerEvents==='none'),'Animation blockiert keine Tipps');
  ok(await p.evaluate(()=>!!document.querySelector('#half canvas')&&CONF.last&&CONF.last.n>=150),'Halbzeit: Konfetti läuft (mind. 150 Stück)');
  const r=await p.evaluate(()=>S.row);await p.click('#cnt .plus');ok(await p.evaluate(r=>S.row===r+1,r),'Weiterzählen geht sofort');
  ok(await h.until(p,()=>!document.getElementById('half'),null,6000),'Verschwindet nach ein paar Sekunden von selbst');
  await p.evaluate(()=>{go(-1);go(-1);go(1)});ok(await p.locator('#half').count()===0,'Nur einmal pro Projekt (nicht nach −1 und erneutem +1)');
  await p.evaluate(()=>{delete S.half;setRow(calc().total-5)});ok(await p.locator('#half').count()===0,'„Reihe eingeben“ über die Hälfte hinaus löst nichts aus');
  await p.evaluate(()=>{delete S.half;S.row=Math.ceil(calc().total/2)-1;save();FOC.open();go(1)});
  ok(await p.locator('#half').isVisible(),'Auch im großen Zähler sichtbar');
  await p.evaluate(()=>FOC.close());
  // Fertig: extrem viel Konfetti, gleichmäßig flüssig
  await p.evaluate(()=>{const o=document.getElementById('half');if(o)o.remove();S.row=calc().total-1;delete S.fin;save();tab='count';render();go(1)});
  ok(await p.evaluate(()=>CONF.last&&CONF.last.n>=1500),'Fertig: über 1.500 Konfetti-Stück');
  const f0=await p.evaluate(()=>CONF.last.frames);await new Promise(r=>setTimeout(r,1000));const f1=await p.evaluate(()=>CONF.last.frames);
  ok(f1-f0>=24,`Fertig-Konfetti läuft mit mind. 24 Bildern/s (gemessen: ${f1-f0})`);
  await p.evaluate(()=>FIN.close());ok(await p.evaluate(()=>CONF.last.off===1),'Schließen beendet das Konfetti');
}};
