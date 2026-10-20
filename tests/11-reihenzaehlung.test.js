module.exports={name:'Reihenzählung: überall dieselbe Reihe, Warnung passend',async run(h,ok){
  const p=await h.page('u-anna','anna@x.de');
  // Sophie Scarf: Zunahme in jeder 8. Reihe (16, 80, …), zwei Farben mit Wechsel nach 40 Reihen
  await p.evaluate(()=>{pickP(0);S.tpl='sophie';S.size='s';S.stripes=[{n:'Rosa',c:'#f4a6c6',r:40},{n:'Blau',c:'#a9d6f5',r:40}];save()});
  for(const r of [16,80]){
    await p.evaluate(r=>{S.row=r-1;save();tab='count';FOC.on=false;render()},r);
    const zaehler=await p.locator('#rowof').innerText(),warn=await p.locator('#cnt .alert').innerText();
    ok(zaehler.includes(`Reihe ${r} von`)&&warn.includes(`Reihe ${r} ist anders`),`Reihe ${r}: normaler Zähler zeigt „Reihe ${r}“ und warnt zu Reihe ${r}`);
    await p.evaluate(()=>FOC.open());const gross=await p.locator('.fz').innerText();await p.evaluate(()=>FOC.close());
    ok(gross.includes(`Reihe ${r}`)&&gross.includes(`Reihe ${r} ist anders`),`Reihe ${r}: großer Zähler zeigt dieselbe Reihe und dieselbe Warnung`);
    await p.evaluate(()=>{tab='home';render()});
    ok((await p.locator('.pc').first().innerText()).includes(`Reihe ${r} von`),`Reihe ${r}: Startseite zeigt dieselbe Reihe`);
    await p.evaluate(()=>{tab='count';render();go(1)});
    ok(await p.locator('#cnt .alert').count()===0&&(await p.locator('#rowof').innerText()).includes(`Reihe ${r+1} von`),`Nach +1 in Reihe ${r}: weiter zu Reihe ${r+1}, Warnung weg`);
  }
  await p.evaluate(()=>{tab='count';render()});await p.click('.jb');await p.fill('#jr','16');await p.press('#jr','Enter');
  ok(await p.evaluate(()=>S.row===15)&&(await p.locator('#rowof').innerText()).includes('Reihe 16 von')&&await p.locator('#cnt .alert').count()===1,'„Reihe eingeben 16“ landet auf Reihe 16 samt Warnung');
  await p.evaluate(()=>{S.row=calc().total;save();FIN.close&&0;render()});await p.evaluate(()=>FIN.close());
  ok(/Alle \d+ Reihen fertig/.test(await p.locator('#rowof').innerText()),'Am Ende: „Alle … Reihen fertig“');
}};
