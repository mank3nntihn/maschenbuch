module.exports={name:'Raglan-Rechner unter „Maße“ (nur bei Raglan-Vorlagen)',async run(h,ok){
  const p=await h.page('u-anna','anna@x.de');
  for(const tpl of ['sophie','weekend','stripe']){await p.evaluate(tpl=>{const q=clone(tplDef(tpl));q.id=rid();DB.projects.push(q);pickP(DB.projects.length-1);tab='size';render()},tpl);
    ok(await p.locator('.rag').count()===0,`${tpl}: kein Raglan-Rechner (Schal)`)}
  await p.evaluate(()=>{const q=clone(tplDef('cordoba'));q.id=rid();DB.projects.push(q);pickP(DB.projects.length-1);tab='size';render()});
  ok(await p.locator('.rag').count()===1,'Córdoba Top: Raglan-Rechner unter „Maße“');
  ok(await p.evaluate(()=>S.rg.neck===61&&S.rg.g20===9.5),'Startwerte aus dem Projekt: 128 M ≈ 61 cm Ausschnitt, 20 M = 9,5 cm');
  ok(/Córdoba-Anleitung/.test(await p.locator('#rgout').innerText()),'Vergleich mit der Anleitung wird angezeigt');
  // Beispiel: 60 cm, 20 M = 10 cm (2 M/cm), 1 Raglanmasche → 120 M: Rücken 39, Vorderteil 39, Ärmel je 19, Raglan 4×1
  const sel=l=>p.locator('.rag input').nth(l);await sel(0).fill('60');await sel(1).fill('10');
  let t=await p.locator('#rgout').innerText();
  ok(/120\s*M\s*anschlagen/.test(t)&&/Rücken\s*39/.test(t)&&/Vorderteil\s*39/.test(t)&&/Ärmel\s*19/.test(t),'60 cm, 20 M = 10 cm: 120 M = Rücken 39, Vorderteil 39, Ärmel je 19, Raglan 4×1');
  await p.locator('.rag select').selectOption('2');t=await p.locator('#rgout').innerText();
  ok(/Rücken\s*37/.test(t)&&/Vorderteil\s*37/.test(t)&&/Ärmel\s*19/.test(t)&&/Raglan\s*2/.test(t),'2 Raglanmaschen: 120 − 8 = 112 → Rücken 37, Vorderteil 37, Ärmel je 19');
  await p.locator('.rag .seg button',{hasText:'Jacke'}).click();t=await p.locator('#rgout').innerText();
  ok(/Vorderteil links\s*18/.test(t)&&/Vorderteil rechts\s*19/.test(t),'Jacke: Vorderteil geteilt (18 + 19)');
  await p.locator('.rag .seg button',{hasText:'Pullover'}).click();await sel(2).fill('90');t=await p.locator('#rgout').innerText();
  ok(/27 Zunahmerunden/.test(t)&&/Passe ca\. 17 cm/.test(t),'Oberweite 90 cm: je Teil 90 M, 27 Zunahmerunden, Passe ca. 17 cm (32 R/10 cm)');
  ok(await p.evaluate(()=>S.rg.neck==60&&S.rg.chest==90&&S.rg.rl===2),'Eingaben bleiben beim Projekt gespeichert');
  ok(await p.evaluate(()=>Object.keys(TOOLS).sort().join()===['cordoba','sophie','stripe','weekend'].join()),'Jede Vorlage hat einen Eintrag in TOOLS');
}};
