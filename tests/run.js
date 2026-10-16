// Startet alle Tests nacheinander. Aufruf: node tests/run.js   (Website muss unter BASE erreichbar sein)
const {create}=require('./harness');const fs=require('fs');const path=require('path');
const only=process.argv[2];
(async()=>{let fail=0,pass=0;const files=fs.readdirSync(__dirname).filter(f=>f.endsWith('.test.js')&&(!only||f.includes(only))).sort();
  for(const f of files){const T=require(path.join(__dirname,f));const h=await create();const errs=[];
    const ok=(c,msg)=>{if(c){pass++;console.log('  ✓ '+msg)}else{fail++;errs.push(msg);console.log('  ✗ '+msg)}};
    console.log('\n'+T.name+'  ('+f+')');const t0=Date.now();
    try{await T.run(h,ok)}catch(e){fail++;console.log('  ✗ Abbruch: '+(e.stack||e))}
    ok(h.errors.length===0,'keine JavaScript-Fehler'+(h.errors.length?': '+h.errors.join(' | '):''));
    if(errs.length){fs.mkdirSync('test-screens',{recursive:true});for(const c of h.browser.contexts())for(const [i,p] of c.pages().entries())await p.screenshot({path:`test-screens/${f}-${h.browser.contexts().indexOf(c)}-${i}.png`}).catch(()=>{})}
    console.log('  ('+((Date.now()-t0)/1000).toFixed(1)+' s)');await h.close()}
  console.log(`\n${pass} bestanden, ${fail} fehlgeschlagen`);process.exit(fail?1:0)})();
