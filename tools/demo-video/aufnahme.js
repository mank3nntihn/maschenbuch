// Demo-Video des Maschenbuchs (nur Demo-Daten, keine echten Daten).
// Aufnahme: echtes Chromium auf einem virtuellen Bildschirm, mit ffmpeg in 30 Bildern/s abgefilmt.
// Weil der Rechner 3D und Aufnahme nicht gleichzeitig in Echtzeit schafft, läuft die Seite K-mal langsamer
// (Zeitlupe) und das Video wird danach K-fach beschleunigt – so bleiben auch Animationen flüssig.
//
// Starten (im Repo-Ordner):  python3 -m http.server 8765 &
//   LANG_VIDEO=en xvfb-run -a -s "-screen 0 2000x1200x24" node tools/demo-video/aufnahme.js ausgabe.mp4
// LANG_VIDEO=de für die deutsche Fassung. Dauer der Aufnahme: ca. K × 2,5 Minuten.
const {create}=require('../../tests/harness');const {spawn,execFileSync}=require('child_process');const path=require('path');const fs=require('fs');
const OUT=path.resolve(process.argv[2]||'maschenbuch-demo.mp4'),RAW=OUT.replace(/\.mp4$/,'')+'-roh.mkv';
const LANG=process.env.LANG_VIDEO==='de'?'de':'en',DRY=!!process.env.PROBE,K=DRY?1:+(process.env.ZEITLUPE||4);
const sleep=ms=>new Promise(r=>setTimeout(r,ms*K));
const TXT={
 en:{intro:'<div class="big">🧶</div><h2>Maschenbuch</h2><p>A knitting & crochet companion for your phone –<br>with the complete Hobbii catalogue built in.</p>',
  s:[['Home','All projects<br>at a glance','Progress, when you last knitted and finished projects in an archive. Installs as an app on the iPhone – and works offline.'],
     ['Row counter','Every row explained','The counter shows what to do in the current row – and warns before an increase or a colour change comes up.'],
     ['Learning corner','Abbreviations, animated','Tap “inc” or “i-cord” and a small 3D animation shows how it’s done.'],
     ['Big counter','Full screen with live 3D','A huge +1 button for next to your knitting – the scarf grows in real time.'],
     ['3D preview','The piece in 3D –<br>flat or on a model','See how the scarf will look with the chosen colours.'],
     ['Hobbii catalogue','5,700+ Hobbii colours built in','True colours taken from the product photos, updated daily – with filters for sales, availability and needle size.'],
     ['Yarn needed','Knows what’s missing','Compares the pattern with your own stash – missing yarn goes on the shopping list with one tap.'],
     ['Sale alert','On sale? You’ll see it.','When a yarn on the shopping list is discounted at Hobbii, Maschenbuch shows the discount and today’s price – with a direct link to the shop.'],
     ['Yarn stash','What’s at home','🛒 puts a yarn on the shopping list, 🤝 offers it in the swap.'],
     ['Knit-along','Knitting together','Friends’ progress live in the counter – a green dot means: knitting right now.'],
     ['Yarn swap','Pass on leftovers','Offer leftover yarn and tap “I’d like it” on others’ offers – privately within your circle of friends.'],
     ['Finished!','The finishing moment','Confetti, total knitting time – and the yarn used can be deducted from the stash.']],
  outro:`<h2 style="font-size:70px">Why this matters for Hobbii</h2><ul>
    <li>🛒&nbsp; Missing yarn goes straight onto the shopping list – linked to hobbii.com</li>
    <li>🏷️&nbsp; Sales show up exactly when the yarn is needed</li>
    <li>🧶&nbsp; The whole catalogue with true colours, updated daily</li>
    <li>👭&nbsp; Knit-alongs and the yarn swap keep the community in the app</li></ul>
    <p class="who">Robin Meijer · Maschenbuch (working prototype)</p>`,
  proj:['Sophie Scarf','Weekend Scarf','Hat for Dad'],pink:'Pink',petrol:'Petrol',beanie:'Bouclé beanie',ball:n=>n===1?'1 ball':n+' balls',tabs:{d3:'3D',size:'Size',wool:'Yarn'},worn:'On model',sale:'On sale',toShop:'shopping list',close:'Close'},
 de:{intro:'<div class="big">🧶</div><h2>Maschenbuch</h2><p>Der Strick- und Häkelbegleiter fürs Handy –<br>mit dem kompletten Hobbii-Katalog eingebaut.</p>',
  s:[['Startseite','Alle Projekte<br>auf einen Blick','Fortschritt, wann zuletzt gestrickt wurde und fertige Projekte im Archiv. Läuft als App auf dem iPhone – auch offline.'],
     ['Reihenzähler','Jede Reihe erklärt','Der Zähler zeigt, was in der aktuellen Reihe zu tun ist – und warnt, bevor eine Zunahme oder ein Farbwechsel kommt.'],
     ['Lern-Ecke','Abkürzungen mit Animation','Ein Tipp auf „Zun“ oder „I‑Cord“ zeigt mit einer kleinen 3D-Animation, wie es geht.'],
     ['Großer Zähler','Vollbild mit 3D-Live-Ansicht','Riesiger +1-Knopf für neben dem Strickzeug – der Schal wächst live mit.'],
     ['3D-Vorschau','Das Teil in 3D –<br>flach oder am Model','So sieht der Schal mit den gewählten Farben am Ende aus.'],
     ['Hobbii-Katalog','Über 5.700 Hobbii-Farben eingebaut','Echte Farbtöne aus den Produktfotos, täglich aktualisiert – mit Filtern für Angebote, Lieferbarkeit und passende Nadelstärke.'],
     ['Wollbedarf','Berechnet, was fehlt','Abgleich mit dem eigenen Garnlager – fehlendes Garn kommt mit einem Tipp auf die Einkaufsliste.'],
     ['Angebotsalarm','Reduziert? Sieht man sofort.','Ist ein Garn auf der Einkaufsliste bei Hobbii gerade im Angebot, zeigt das Maschenbuch Rabatt und aktuellen Preis – mit Direktlink in den Shop.'],
     ['Garnlager','Was zuhause liegt','Mit 🛒 auf die Einkaufsliste, mit 🤝 in die Tauschbörse.'],
     ['Knit-Along','Gemeinsam stricken','Der Fortschritt der Freundinnen live im Zähler – ein grüner Punkt heißt: strickt gerade.'],
     ['Tauschbörse','Garnreste weitergeben','Reste anbieten und bei den anderen „Hätte ich gern“ tippen – privat im eigenen Freundeskreis.'],
     ['Fertig!','Der Fertig-Moment','Konfetti, Strickzeit – und das verbrauchte Garn wird auf Wunsch vom Lager abgezogen.']],
  outro:`<h2 style="font-size:70px">Warum das für Hobbii spannend ist</h2><ul>
    <li>🛒&nbsp; Fehlendes Garn landet direkt auf der Einkaufsliste – mit Link zu hobbii.de</li>
    <li>🏷️&nbsp; Angebote erscheinen genau dann, wenn das Garn gebraucht wird</li>
    <li>🧶&nbsp; Der ganze Katalog mit echten Farben, täglich aktuell</li>
    <li>👭&nbsp; Knit-Along und Tauschbörse halten die Community in der App</li></ul>
    <p class="who">Robin Meijer · Maschenbuch (funktionierender Prototyp)</p>`,
  proj:['Sophie Scarf','Weekend Scarf','Mütze für Papa'],pink:'Rosa',petrol:'Petrol',beanie:'Bouclé-Mütze',ball:n=>n+' Knäuel',tabs:{d3:'3D',size:'Maße',wool:'Wolle'},worn:'Am Model',sale:'Im Angebot',toShop:'Einkaufsliste',close:'Schließen'}}[LANG];

(async()=>{const h=await create({launch:{headless:DRY,args:['--window-position=0,0','--no-first-run','--disable-infobars','--hide-scrollbars','--force-device-scale-factor=1']}});
  const now=Date.now(),T=n=>new Date(now-n).toISOString();
  // Freundinnen im Knit-Along und in der Tauschbörse (nur im Test-Nachbau, nicht in Supabase)
  h.db.kal.push({user_id:'u-lea',name:'Lea',proj:'Weekend Scarf',pct:63,row_no:256,total:408,col:'#e8742a',updated_at:T(60e3),_ts:0},
                {user_id:'u-mia',name:'Mia',proj:TXT.beanie,pct:38,row_no:41,total:108,col:'#b4783f',updated_at:T(3*3600e3),_ts:0});
  h.online.add('u-lea');h.kreis.mitglieder.add('u-demo');
  h.db.tausch.push({id:'t-1',user_id:'u-lea',name:'Lea',garn:'Wheel of Alpaca – Peony Bloom (02)',col:'#b74e61',menge:TXT.ball(1),notiz:'',created_at:T(864e5)},
                   {id:'t-2',user_id:'u-mia',name:'Mia',garn:'Bouclé – Caramel (03)',col:'#b4783f',menge:TXT.ball(2),notiz:'',created_at:T(2*864e5)});
  const demo={lang:LANG,theme:'rose',abbr:true,live:false,liveView:'flat',cur:0,kalName:'Anna',kalShare:true,kalShow:true,
    projects:[
      {tpl:'sophie',id:'d1',name:TXT.proj[0],size:'s',needle:3.5,mpb:115,row:77,stripes:[{n:TXT.pink,c:'#f4a6c6',r:40}],last:now-4*60e3,tm:5.2*3600e3,tr:70,start:now-6*864e5},
      {tpl:'weekend',id:'d2',name:TXT.proj[1],size:'little',tech:'knit',needle:5,mpb:119,w:7.5,l:109,sts:31.5,rows:19.7,row:150,stripes:[{n:'Orange',c:'#e8742a',r:2},{n:'Banana',c:'#f3d36b',r:2}],last:now-864e5,tm:9.5*3600e3,tr:180,start:now-12*864e5},
      {tpl:'stripe',id:'d3',name:TXT.proj[2],tech:'knit',w:22,l:24,sts:20,rows:36,mpb:125,needle:4.5,row:86,stripes:[{n:TXT.petrol,c:'#1f5560',r:86}],arch:1,fin:now-9*864e5,tm:4*3600e3,tr:80}],
    stash:[{n:TXT.pink,c:'#f4a6c6',b:1,m:115,nd:3.5},{n:'Wheel of Alpaca – Arctic Shades (03)',c:'#83abc6',b:2,m:940,nd:4.5,sku:'HB-22703',u:'https://hobbii.de/products/hp-1005612-wheel-of-alpaca',p:32}],
    shop:[{n:'Bouclé – Oat Milk (02)',c:'#e9e7e5',q:2,d:false,p:9,u:'https://hobbii.de/products/hp-1009268-boucle',sku:'HB-42402'}]};
  const p=await h.page('u-demo','anna@demo',{login:true,viewport:{width:1920,height:1080},url:'tools/demo-video/studio.html',
    init:[[require('./zeitlupe.js'),K],[()=>{const mm=window.matchMedia.bind(window);window.matchMedia=q=>/hover:\s*hover/.test(q)?{matches:false,media:q,addEventListener(){},removeEventListener(){},addListener(){},removeListener(){}}:mm(q)},0],/* wie am Handy: kein Mauszeiger-Hover */[d=>{if(!sessionStorage.getItem('demo.init')){sessionStorage.setItem('demo.init','1');localStorage.setItem('maschenbuch.v4',JSON.stringify(d))}},demo]]});
  const cdp=await p.context().newCDPSession(p);await cdp.send('Animation.enable');await cdp.send('Animation.setPlaybackRate',{playbackRate:1/K});
  await p.evaluate(h=>card(h),TXT.intro);
  const f=()=>p.frames().find(x=>/index\.html/.test(x.url()));let app;for(let k=0;k<50&&!(app=f());k++)await new Promise(r=>setTimeout(r,100));
  await app.waitForFunction(()=>window.SB&&SB.user&&SYNC.st==='ok',null,{timeout:30000});
  await app.evaluate(()=>{tab='home';render()});await new Promise(r=>setTimeout(r,1500));
  // Aufnahme starten: nur der Seiteninhalt, ohne Browserrahmen und Mauszeiger
  const off=await p.evaluate(()=>{const b=(outerWidth-innerWidth)/2;return[Math.round(screenX+b),Math.round(screenY+outerHeight-innerHeight-b)]});
  const ff=DRY?null:spawn('ffmpeg',['-y','-v','error','-f','x11grab','-draw_mouse','0','-framerate','30','-video_size','1920x1080','-i',`${process.env.DISPLAY}.0+${off[0]},${off[1]}`,'-c:v','libx264','-preset','ultrafast','-qp','14','-pix_fmt','yuv420p',RAW]);
  const ffEnde=DRY?null:new Promise(r=>ff.on('close',r));
  const L=(s,o)=>app.locator(s,o);
  const zeig=async(loc,mitte)=>{await loc.evaluate(async(e,mitte)=>{const r=e.getBoundingClientRect();if(mitte||r.top<70||r.bottom>innerHeight-70)await __scrollSanft(scrollY+r.top-innerHeight/2+r.height/2)},mitte)};
  const tap=async(loc,ms=900)=>{loc=loc.first();if(!(await loc.evaluate(e=>!!e.closest('#pk,#side,nav,header,.fz'))))await zeig(loc);
    const b=await loc.boundingBox();await p.evaluate(([x,y])=>tap(x,y),[b.x+b.width/2,b.y+b.height/2]);await sleep(220);await loc.click();await p.mouse.move(20,1060);await sleep(ms)};
  const N=TXT.s.length;let n=0;const cap=async()=>{if(n>0)await sleep(1500); /* etwas mehr Lesezeit pro Szene */if(DRY)await p.screenshot({path:`${OUT}-szene${String(n).padStart(2,'0')}.png`});const [k,t,s]=TXT.s[n];return p.evaluate(([k,t,s,n,N])=>cap(k,t,s,n,N),[k,t,s,n++,N])};
  await sleep(5000);await p.evaluate(()=>card(null));
  await cap();await sleep(5500);                                                                                   // Startseite
  await cap();await tap(L('.pc'),1300);await tap(L('.pad .plus'),1100);await tap(L('.pad .plus'),900);await zeig(L('#cnt .alert'));await sleep(3400); // Zähler
  await cap();await tap(L(`#cnt .ins abbr.ab[data-k="${LANG==='de'?'Zun':'inc'}"]`),5600);await app.evaluate(()=>popClose());await sleep(500);   // Lern-Ecke
  await cap();await tap(L('.fbtn'),1800);await tap(L('.fz .plus'),2600);await tap(L(`.fz .tb button[aria-label="${TXT.close}"]`),900);          // Großer Zähler
  await cap();await tap(L('nav button',{hasText:TXT.tabs.d3}),2200);await tap(L('#app .seg button',{hasText:TXT.worn}),3600);                  // 3D
  await cap();await tap(L('nav button',{hasText:TXT.tabs.size}),1200);await tap(L('#app .swb'),1800);                                          // Hobbii-Farbwahl
  await tap(L('#pkf .chip',{hasText:TXT.sale}),2000);await tap(L('#pkb .gi'),2000);await tap(L('#pkb .fc').nth(1),2600);
  await cap();await tap(L('nav button',{hasText:TXT.tabs.wool}),2200);await tap(L('#app .pri',{hasText:TXT.toShop}),3800);                     // Wolle
  await cap();await tap(L('#mb'),1600);await tap(L('#side .lnk[data-k=shop]'),5600);                                                            // Angebote
  await cap();await tap(L('#mb'),1300);await tap(L('#side .lnk[data-k=stash]'),3800);                                                           // Garnlager
  await cap();await app.evaluate(()=>{pickP(0);tab='count';render();scrollTo(0,0)});await sleep(900);await zeig(L('#kalc'),true);await sleep(4800); // Knit-Along
  await cap();await tap(L('#mb'),1300);await tap(L('#side .lnk[data-k=tausch]'),1800);await tap(L('.tbr .want'),3400);                          // Tausch
  await cap();await app.evaluate(()=>{pickP(1);S.row=calc().total-1;save();tab='count';render();scrollTo(0,0)});await sleep(1300);await tap(L('.pad .plus'),5800); // Fertig
  await p.evaluate(h=>card(h),TXT.outro);await sleep(11000);
  if(DRY){await p.screenshot({path:`${OUT}-szene${N}.png`});await sleep(400);await p.screenshot({path:`${OUT}-ende.png`});console.log('Fehler',JSON.stringify(h.errors));await h.close();return}
  ff.stdin.write('q');await ffEnde;console.log('Fehler',JSON.stringify(h.errors));await h.close();
  // Zeitlupe herausrechnen → 30 Bilder/s
  execFileSync('ffmpeg',['-y','-v','error','-i',RAW,'-vf',`setpts=PTS/${K},fps=30`,'-c:v','libx264','-preset','slow','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart','-an',OUT]);
  fs.unlinkSync(RAW);console.log('VIDEO',OUT)})();
