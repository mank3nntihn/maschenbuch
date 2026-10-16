module.exports={name:'Strickzeit, Rückgängig und Fertig-Moment',async run(h,ok){
  const p=await h.page('u-anna','anna@x.de');
  await p.evaluate(()=>{pickP(0);S.row=0;S.last=0;delete S.tm;delete S.tr;save();render()});
  // Strickzeit: 6 Reihen mit je 2 Minuten Abstand
  for(let i=0;i<6;i++)await p.evaluate(()=>{if(S.last)S.last=Date.now()-120000;go(1)});
  const st=await p.evaluate(()=>({tm:S.tm,tr:S.tr}));
  ok(st.tr===5&&Math.abs(st.tm-600000)<2000,'Strickzeit zählt die Abstände zwischen den Reihen (5 × 2 Min.)');
  let txt=await p.locator('.tmx').innerText();
  ok(/Strickzeit: 10 Min\./.test(txt),'Zähler zeigt „Strickzeit: 10 Min.“');
  ok(/ca\. 30 Reihen\/Std\./.test(txt),'Tempo wird angezeigt (30 Reihen pro Stunde)');
  ok(/fertig in ca\./.test(txt),'Schätzung „fertig in ca. …“ wird angezeigt');
  await p.evaluate(()=>{S.last=Date.now()-3*3600e3;go(1)});
  ok(await p.evaluate(()=>Math.abs(S.tm-720000)<2000&&S.tr===6),'Nach 3 Stunden Pause zählt nur das Durchschnittstempo, nicht die Pause');
  // Rückgängig: Fortschritt zurücksetzen
  await p.locator('button',{hasText:'Fortschritt zurücksetzen'}).click();await p.click('#dlgy');
  ok(await p.evaluate(()=>S.row===0&&!S.tm),'Zurücksetzen setzt Reihe und Strickzeit auf 0');
  ok(await p.locator('#undo').isVisible(),'Danach erscheint „Rückgängig“');
  await p.click('#undo button');ok(await p.evaluate(()=>S.row===7&&S.tr===6),'Rückgängig holt Reihe und Strickzeit zurück');
  // Rückgängig: Garn und Projekt löschen
  await p.evaluate(()=>{DB.stash=[{n:'Cotton 8 – Mint',c:'#9fe0c9',b:3,m:85,nd:4}];save();tab='stash';render()});
  await p.locator('.yr .ghost').first().click();ok(await p.evaluate(()=>DB.stash.length===0),'Garn gelöscht');
  await p.click('#undo button');ok(await p.evaluate(()=>DB.stash.length===1&&DB.stash[0].b===3),'Rückgängig holt das Garn zurück');
  await p.evaluate(()=>{DB.projects.push({...clone(DB.projects[0]),id:rid(),name:'Testschal'});save();pickP(DB.projects.length-1)});
  const n=await p.evaluate(()=>DB.projects.length);await p.evaluate(()=>{delP()});await p.click('#dlgy');
  ok(await p.evaluate(n=>DB.projects.length===n-1,n),'Projekt gelöscht');
  await p.click('#undo button');ok(await p.evaluate(n=>DB.projects.length===n&&DB.projects.some(q=>q.name==='Testschal'),n),'Rückgängig holt das gelöschte Projekt zurück');
  ok(await h.until(p,()=>!document.getElementById('undo')||document.getElementById('undo').hidden,null,9000),'„Rückgängig“ verschwindet nach ein paar Sekunden');
  // Fertig-Moment
  await p.evaluate(()=>{pickP(0);S.stripes=[{n:'Cotton 8 – Mint',c:'#9fe0c9',r:10}];S.start=Date.now()-3*864e5;setRow(calc().total-1);tab='count';render()});
  await p.evaluate(()=>go(1));
  ok(await p.locator('#fin').isVisible(),'Letzte Reihe: Fertig-Fenster erscheint');
  const f=await p.locator('#fin').innerText();
  ok(/Fertig!/.test(f)&&/Strickzeit/.test(f)&&/3 Tage/.test(f),'Fenster zeigt Reihen, Strickzeit und Dauer');
  ok(/Cotton 8 – Mint/.test(f)&&/−\d/.test(f),'Fenster zeigt verbrauchtes Garn aus dem Lager');
  const b0=await p.evaluate(()=>DB.stash[0].b);await p.locator('#fin .pri').click();
  ok(await p.evaluate(b0=>DB.stash[0].b<b0,b0),'„Vom Garnlager abziehen“ verringert die Knäuel');
  await p.click('#undo button');ok(await p.evaluate(b0=>DB.stash[0].b===b0,b0),'Abziehen lässt sich rückgängig machen');
  await p.evaluate(()=>FIN.show(S.id));await p.locator('#fin button',{hasText:'fertigen Projekten'}).click();
  ok(await p.evaluate(()=>tab==='home'),'Archivieren führt zur Startseite');
  const home=await p.locator('main').innerText();
  ok(/Fertige Projekte \(1\)/.test(home),'Startseite zeigt „Fertige Projekte (1)“');
  ok(await p.evaluate(()=>!S.arch),'Aktuelles Projekt wechselt zu einem aktiven Projekt');
  await p.locator('.arch summary').click();await p.locator('.arch .want').first().click();
  ok(await p.evaluate(()=>!DB.projects.some(q=>q.arch)),'Zurückholen macht das Projekt wieder aktiv');
  await p.evaluate(()=>{pickP(0);go(-1);go(1)});ok(await p.locator('#fin').isVisible(),'Nach −1 und +1 kommt die Feier wieder');
  await p.evaluate(()=>FIN.close());
}};
