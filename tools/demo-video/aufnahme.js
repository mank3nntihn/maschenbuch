// Nimmt das Demo-Video auf (Demo-Daten, keine echten Daten): python3 -m http.server 8765 im Repo starten, dann
// node tools/demo-video/aufnahme.js [Ausgabeordner]   → .webm; als MP4: ffmpeg -i roh.webm -c:v libx264 -crf 20 -pix_fmt yuv420p demo.mp4
const {create}=require('../../tests/harness');const path=require('path');const fs=require('fs');
const OUT=process.argv[2]||path.join(__dirname,'roh');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{fs.mkdirSync(OUT,{recursive:true});const h=await create();const now=Date.now(),T=n=>new Date(now-n).toISOString();
  // Freundinnen im Knit-Along und in der Tauschbörse
  h.db.kal.push({user_id:'u-lea',name:'Lea',proj:'Weekend Scarf',pct:63,row_no:256,total:408,col:'#e8742a',updated_at:T(60e3),_ts:0},
                {user_id:'u-mia',name:'Mia',proj:'Bouclé-Mütze',pct:38,row_no:41,total:108,col:'#b4783f',updated_at:T(3*3600e3),_ts:0});
  h.online.add('u-lea');h.kreis.mitglieder.add('u-demo');
  h.db.tausch.push({id:'t-1',user_id:'u-lea',name:'Lea',garn:'Wheel of Alpaca – Peony Bloom (02)',col:'#b74e61',menge:'1 Knäuel',notiz:'',created_at:T(864e5)},
                   {id:'t-2',user_id:'u-mia',name:'Mia',garn:'Bouclé – Caramel (03)',col:'#b4783f',menge:'2 Knäuel',notiz:'',created_at:T(2*864e5)});
  const demo={lang:'de',theme:'rose',abbr:true,live:false,liveView:'flat',cur:0,kalName:'Anna',kalShare:true,kalShow:true,
    projects:[
      {tpl:'sophie',id:'d1',name:'Sophie Scarf',size:'s',needle:3.5,mpb:115,row:77,stripes:[{n:'Rosa',c:'#f4a6c6',r:40}],last:now-4*60e3,tm:5.2*3600e3,tr:70,start:now-6*864e5},
      {tpl:'weekend',id:'d2',name:'Weekend Scarf',size:'little',tech:'knit',needle:5,mpb:119,w:7.5,l:109,sts:31.5,rows:19.7,row:215,stripes:[{n:'Orange',c:'#e8742a',r:2},{n:'Banana',c:'#f3d36b',r:2}],last:now-864e5,tm:9.5*3600e3,tr:180,start:now-12*864e5},
      {tpl:'stripe',id:'d3',name:'Mütze für Papa',tech:'knit',w:22,l:24,sts:20,rows:36,mpb:125,needle:4.5,row:86,stripes:[{n:'Petrol',c:'#1f5560',r:86}],arch:1,fin:now-9*864e5,tm:4*3600e3,tr:80}],
    stash:[{n:'Rosa',c:'#f4a6c6',b:1,m:115,nd:3.5},{n:'Wheel of Alpaca – Arctic Shades (03)',c:'#83abc6',b:2,m:940,nd:4.5,sku:'HB-22703',u:'https://hobbii.de/products/hp-1005612-wheel-of-alpaca',p:32}],
    shop:[{n:'Bouclé – Oat Milk (02)',c:'#e9e7e5',q:2,d:false,p:9,u:'https://hobbii.de/products/hp-1009268-boucle',sku:'HB-42402'}]};
  const p=await h.page('u-demo','anna@demo',{login:true,viewport:{width:1920,height:1080},video:{dir:OUT,size:{width:1920,height:1080}},url:'tools/demo-video/studio.html',
    init:[d=>{if(!sessionStorage.getItem('demo.init')){sessionStorage.setItem('demo.init','1');localStorage.setItem('maschenbuch.v4',JSON.stringify(d))}},demo]});
  await p.evaluate(()=>card('<div class="big">🧶</div><h2>Maschenbuch</h2><p>Der Strick- und Häkelbegleiter fürs Handy –<br>mit dem kompletten Hobbii-Katalog eingebaut.</p>'));
  const f=()=>p.frames().find(x=>/index\.html/.test(x.url()));
  let app;for(let k=0;k<50&&!(app=f());k++)await sleep(100);
  await app.waitForFunction(()=>window.SB&&SB.user&&SYNC.st==='ok',null,{timeout:15000});const L=(s,o)=>app.locator(s,o);
  const zeig=async(loc,mitte)=>{await loc.evaluate((e,mitte)=>{const r=e.getBoundingClientRect();if(mitte||r.top<70||r.bottom>innerHeight-70)scrollTo({top:scrollY+r.top-innerHeight/2+r.height/2,behavior:'smooth'})},mitte);await sleep(500)};
  const tap=async(loc,ms=900)=>{loc=loc.first();if(!(await loc.evaluate(e=>!!e.closest('#pk,#side,nav,header,.fz'))))await zeig(loc);const b=await loc.boundingBox();await p.evaluate(([x,y])=>tap(x,y),[b.x+b.width/2,b.y+b.height/2]);await sleep(220);await loc.click();await sleep(ms)};
  const N=12;let n=0;const cap=(k,t,s)=>p.evaluate(([k,t,s,n,N])=>cap(k,t,s,n,N),[k,t,s,n++,N]);
  await app.evaluate(()=>{tab='home';render()});await sleep(5500);
  await p.evaluate(()=>card(null));
  // 1 Startseite
  await cap('Startseite','Alle Projekte<br>auf einen Blick','Fortschritt, wann zuletzt gestrickt wurde und fertige Projekte im Archiv. Läuft als App auf dem iPhone – auch offline.');await sleep(5500);
  // 2 Zähler + Reihen-Merker
  await cap('Reihenzähler','Jede Reihe erklärt','Der Zähler zeigt, was in der aktuellen Reihe zu tun ist – und warnt, bevor eine Zunahme oder ein Farbwechsel kommt.');
  await tap(L('.pc'),1300);await tap(L('.pad .plus'),1100);await tap(L('.pad .plus'),900);
  await zeig(L('#cnt .alert'));await sleep(3400);
  // 3 Abkürzungen mit Animation
  await cap('Lern-Ecke','Abkürzungen mit Animation','Ein Tipp auf „Zun“ oder „I‑Cord“ zeigt mit einer kleinen 3D-Animation, wie es geht.');
  await tap(L('#cnt .ins abbr.ab[data-k="Zun"]'),5600);await app.evaluate(()=>popClose());await sleep(500);
  // 4 Großer Zähler
  await cap('Großer Zähler','Vollbild mit 3D-Live-Ansicht','Riesiger +1-Knopf für neben dem Strickzeug – der Schal wächst live mit.');
  await tap(L('.fbtn'),1800);await tap(L('.fz .plus'),2600);await tap(L('.fz .tb button[aria-label=Schließen]'),900);
  // 5 3D
  await cap('3D-Vorschau','Das Teil in 3D –<br>flach oder am Model','So sieht der Schal mit den gewählten Farben am Ende aus.');
  await tap(L('nav button',{hasText:'3D'}),2200);await tap(L('#app .seg button',{hasText:'Am Model'}),3600);
  // 6 Hobbii-Farbwahl
  await cap('Hobbii-Katalog','Über 5.700 Hobbii-Farben eingebaut','Echte Farbtöne aus den Produktfotos, täglich aktualisiert – mit Filtern für Angebote, Lieferbarkeit und passende Nadelstärke.');
  await tap(L('nav button',{hasText:'Maße'}),1200);await tap(L('#app .swb'),1800);
  await tap(L('#pkf .chip',{hasText:'Im Angebot'}),2000);await tap(L('#pkb .gi'),2000);await tap(L('#pkb .fc').nth(1),2600);
  // 7 Wolle
  await cap('Wollbedarf','Berechnet, was fehlt','Abgleich mit dem eigenen Garnlager – fehlendes Garn kommt mit einem Tipp auf die Einkaufsliste.');
  await tap(L('nav button',{hasText:'Wolle'}),2200);await tap(L('#app .pri',{hasText:'Einkaufsliste'}),3800);
  // 8 Einkaufsliste mit Angeboten
  await cap('Angebotsalarm','Reduziert? Sieht man sofort.','Ist ein Garn auf der Einkaufsliste bei Hobbii gerade im Angebot, zeigt das Maschenbuch Rabatt und aktuellen Preis – mit Direktlink in den Shop.');
  await tap(L('#mb'),1600);await tap(L('#side .lnk[data-k=shop]'),5600);
  // 9 Garnlager
  await cap('Garnlager','Was zuhause liegt','Mit 🛒 auf die Einkaufsliste, mit 🤝 in die Tauschbörse.');
  await tap(L('#mb'),1300);await tap(L('#side .lnk[data-k=stash]'),3800);
  // 10 Knit-Along
  await cap('Knit-Along','Gemeinsam stricken','Der Fortschritt der Freundinnen live im Zähler – ein grüner Punkt heißt: strickt gerade.');
  await app.evaluate(()=>{pickP(0);tab='count';render();scrollTo(0,0)});await sleep(900);
  await zeig(L('#kalc'),true);await sleep(5400);
  // 11 Tauschbörse
  await cap('Tauschbörse','Garnreste weitergeben','Reste anbieten und bei den anderen „Hätte ich gern“ tippen – privat im eigenen Freundeskreis.');
  await tap(L('#mb'),1300);await tap(L('#side .lnk[data-k=tausch]'),1800);await tap(L('.tbr .want'),3400);
  // 12 Fertig-Moment
  await cap('Fertig!','Der Fertig-Moment','Konfetti, Strickzeit – und das verbrauchte Garn wird auf Wunsch vom Lager abgezogen.');
  await app.evaluate(()=>{pickP(1);S.row=calc().total-1;save();tab='count';render();scrollTo(0,0)});await sleep(1300);await tap(L('.pad .plus'),5800);
  // Abschluss
  await p.evaluate(()=>card(`<h2 style="font-size:70px">Warum das für Hobbii spannend ist</h2><ul>
    <li>🛒&nbsp; Fehlendes Garn landet direkt auf der Einkaufsliste – mit Link zu hobbii.de</li>
    <li>🏷️&nbsp; Angebote erscheinen genau dann, wenn das Garn gebraucht wird</li>
    <li>🧶&nbsp; Der ganze Katalog mit echten Farben, täglich aktuell</li>
    <li>👭&nbsp; Knit-Along und Tauschbörse halten die Community in der App</li></ul>
    <p class="who">Robin Meijer · Maschenbuch (funktionierender Prototyp)</p>`));
  await sleep(11000);
  const v=p.video();await p.ctx.close();console.log('VIDEO',await v.path());console.log('Fehler',JSON.stringify(h.errors));await h.close()})();
