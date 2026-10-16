module.exports={name:'Anmelden und Synchronisieren zwischen zwei Geräten',async run(h,ok){
  const A=await h.page('u-anna','anna@x.de');await A.click('#sbb');
  ok(await h.until(A,()=>SB.user&&SYNC.st==='ok'),'Anmeldung mit Google klappt und Status ist „synchronisiert“');
  await A.evaluate(()=>{pickP(0);setRow(10)});
  ok(await h.until(A,()=>SYNC.st==='ok'&&!SYNC.dirty,null,4000),'Änderung wird gespeichert');
  const B=await h.page('u-anna','anna@x.de',{viewport:{width:1280,height:800},login:true});
  ok(await h.until(B,()=>DB.projects[0].row===10),'Zweites Gerät bekommt den Stand');
  await B.evaluate(()=>{pickP(0);go(1)});
  ok(await h.until(A,()=>S.row===11),'Erstes Gerät sieht die Änderung live');
  // Schreib-Bremse: viele schnelle Klicks dürfen nicht zu einem Fehler führen, am Ende muss alles ankommen
  for(let i=0;i<8;i++){await A.evaluate(()=>go(1));await A.waitForTimeout(120)}
  ok(await h.until(A,()=>SYNC.st==='ok'&&!SYNC.dirty,null,8000),'Schnelles Zählen: Bremse wird abgewartet, kein Fehler');
  ok(await h.until(B,()=>S.row===19,null,6000),'Nach dem schnellen Zählen haben beide Geräte Reihe 19');
}};
