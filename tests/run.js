// Startet die Browser-Tests. Website muss unter BASE erreichbar sein (python3 -m http.server 8765).
//   node tests/run.js                 alle Gruppen
//   node tests/run.js verlauf pause   nur Gruppen, deren Dateiname eines der Wörter enthält
//   ZEIT=1 …                          Zeit pro Prüfung anzeigen      PARALLEL=1 …   Gruppen nacheinander
// Gruppen laufen parallel (je ein eigener Browser); die Ausgabe erscheint trotzdem geordnet pro Gruppe.
// 3D wird nur in Gruppen mit „mit3d:true“ gezeichnet, sonst übersprungen (ohne Grafikkarte sehr langsam).
const {create}=require('./harness');const fs=require('fs');const path=require('path');const os=require('os');
const only=process.argv.slice(2);
const W=Math.max(1,+(process.env.PARALLEL||Math.min(os.cpus().length,4)));
(async()=>{let fail=0,pass=0;const t00=Date.now();
  const files=fs.readdirSync(__dirname).filter(f=>f.endsWith('.test.js')&&(!only.length||only.some(o=>f.includes(o)))).sort();
  if(!files.length){console.log('Keine passende Testgruppe: '+only.join(' '));process.exit(1)}
  async function gruppe(f){const T=require(path.join(__dirname,f));const out=[];const log=s=>out.push(s);let pa=0,fa=0;
    const h=await create({ohne3d:!T.mit3d});const errs=[];let tl=Date.now();
    const ok=(c,msg)=>{if(process.env.ZEIT){log('    +'+((Date.now()-tl)/1000).toFixed(1)+' s');tl=Date.now()}if(c){pa++;log('  ✓ '+msg)}else{fa++;errs.push(msg);log('  ✗ '+msg);if(process.env.GITHUB_ACTIONS)log('::error title=Browser-Test '+f+'::'+String(msg).replace(/\n/g,' '))}};
    log('\n'+T.name+'  ('+f+')');const t0=Date.now();
    try{await Promise.race([T.run(h,ok),new Promise((_,rej)=>setTimeout(()=>rej(new Error('Zeitlimit 90 s überschritten')),90000))])}catch(e){fa++;log('  ✗ Abbruch: '+(e.stack||e));if(process.env.GITHUB_ACTIONS)log('::error title=Browser-Test '+f+'::Abbruch: '+String(e.message||e).split('\n')[0])}
    ok(h.errors.length===0,'keine JavaScript-Fehler'+(h.errors.length?': '+h.errors.join(' | '):''));
    if(errs.length){fs.mkdirSync('test-screens',{recursive:true});for(const c of h.browser.contexts())for(const [i,p] of c.pages().entries())await p.screenshot({path:`test-screens/${f}-${h.browser.contexts().indexOf(c)}-${i}.png`}).catch(()=>{})}
    log('  ('+((Date.now()-t0)/1000).toFixed(1)+' s)');await h.close();return{out,pa,fa}}
  // Arbeiter holen sich die nächste Gruppe; ausgegeben wird in Dateireihenfolge, sobald eine Gruppe fertig ist
  const res=new Array(files.length);let next=0,shown=0;
  const show=()=>{while(shown<files.length&&res[shown]){const r=res[shown++];console.log(r.out.join('\n'));pass+=r.pa;fail+=r.fa}};
  await Promise.all(Array.from({length:Math.min(W,files.length)},async()=>{while(next<files.length){const i=next++;res[i]=await gruppe(files[i]);show()}}));
  console.log(`\n${pass} bestanden, ${fail} fehlgeschlagen  (${((Date.now()-t00)/1000).toFixed(0)} s, ${W} parallel)`);process.exit(fail?1:0)})();
