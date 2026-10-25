module.exports={name:'Masche merken per Sprache oder −/+',async run(h,ok){
  // Spracherkennung des Browsers durch eine Attrappe ersetzen: „hört“, was in window.__sag steht
  const p=await h.page('u-anna','anna@x.de',{init:[()=>{window.__sag='siebenundachtzig';window.__starts=0;
    window.SpeechRecognition=window.webkitSpeechRecognition=class{start(){window.__starts++;setTimeout(()=>{if(window.__fehler){this.onerror&&this.onerror({error:window.__fehler})}else{const r=[{transcript:window.__sag}];this.onresult&&this.onresult({results:[r]})}this.onend&&this.onend()},120)}stop(){this.onend&&this.onend()}}},null]});
  await p.evaluate(()=>{pickP(0);S.row=40;delete S.mst;save();tab='count';render()});
  ok(/Masche merken/.test(await p.locator('#cnt .msk').innerText()),'Zähler: Leiste „Masche merken“');
  await p.click('#cnt .msk .mic');
  ok(await h.until(p,()=>S.mst===87),'🎤 + „siebenundachtzig“ → Masche 87');
  const n=await p.evaluate(()=>calc().R[S.row].n);
  ok((await p.locator('#cnt .msk').innerText()).includes(`Masche 87`)&&(await p.locator('#cnt .msk').innerText()).includes(`von ${n}`),`Anzeige „Masche 87 von ${n}“`);
  await p.click('#cnt .msk button[aria-label="Masche weiter"]');await p.click('#cnt .msk button[aria-label="Masche weiter"]');await p.click('#cnt .msk button[aria-label="Masche zurück"]');
  ok(await p.evaluate(()=>S.mst===88),'−/+ justieren (87 → 88)');
  await p.evaluate(()=>{window.__sag='Masche 112'});await p.keyboard.press('m');
  ok(await h.until(p,()=>S.mst===112),'Taste M startet die Spracheingabe („Masche 112“)');
  await p.evaluate(()=>{window.__sag='Kaffee'});await p.keyboard.press('m');
  ok(await h.until(p,()=>[...document.querySelectorAll('.toast')].some(t=>/Keine Zahl/.test(t.textContent)))&&await p.evaluate(()=>S.mst===112),'Ohne Zahl: Hinweis, Masche bleibt');
  await p.evaluate(()=>{window.__fehler='not-allowed'});await p.keyboard.press('m');
  ok(await h.until(p,()=>[...document.querySelectorAll('.toast')].some(t=>/Mikrofon ist nicht erlaubt/.test(t.textContent))),'Mikro verweigert: verständlicher Hinweis');
  await p.evaluate(()=>{window.__fehler=null;go(1)});
  ok(await p.evaluate(()=>!('mst' in S))&&/Masche merken/.test(await p.locator('#cnt .msk').innerText()),'Reihe fertig +1: Masche wird gelöscht');
  await p.evaluate(()=>{window.__sag='dreiundzwanzig';FOC.open()});await p.click('.fz .msk .mic');
  ok(await h.until(p,()=>S.mst===23)&&/Masche 23/.test(await p.locator('.fz .msk').innerText()),'Großer Zähler: Masche per Sprache (23)');
  ok(await p.evaluate(()=>[['zweihundertdreiundvierzig',243],['hundertzwölf',112],['einundzwanzig',21],['eighty seven',87],['dreizehn',13]].every(([t,z])=>MS.num(t)===z)),'Zahlen in Worten werden erkannt (243, 112, 21, 87, 13)');
  await p.evaluate(()=>FOC.close());
  // Browser ohne Spracherkennung (z. B. Firefox): Knopf aus, −/+ geht trotzdem
  const q=await h.page('u-b','b@x.de',{init:[()=>{delete window.webkitSpeechRecognition;delete window.SpeechRecognition},null]});
  await q.evaluate(()=>{pickP(0);tab='count';render()});
  ok(await q.locator('#cnt .msk .mic').isDisabled()&&!(await q.locator('#cnt .msk button[aria-label="Masche weiter"]').isDisabled()),'Ohne Spracherkennung: 🎤 aus, −/+ funktioniert');
}};
