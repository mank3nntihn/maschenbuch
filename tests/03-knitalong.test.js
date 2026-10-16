module.exports={name:'Knit-Along mit grünem Punkt „strickt gerade“',async run(h,ok){
  const A=await h.page('u-anna','anna@x.de',{login:true}),L=await h.page('u-lea','lea@x.de',{login:true});
  for(const [p,n] of [[A,'Anna'],[L,'Lea']]){await p.fill('#kaln',n);await p.click('.kh button')}
  await L.evaluate(()=>{pickP(0);setRow(40);tab='home';render()});
  await A.evaluate(()=>{pickP(0);tab='count';render()});
  ok(await h.until(A,()=>/Lea/.test(document.getElementById('kalc').innerText)),'Anna sieht Leas Balken im Zähler');
  ok(await A.locator('#kalc .dot').count()===0,'Lea ist nicht im Zähler: kein grüner Punkt');
  await L.evaluate(()=>{tab='count';render()});
  ok(await h.until(A,()=>!!document.querySelector('#kalc .dot')),'Lea öffnet den Zähler: Anna sieht den grünen Punkt');
  await L.evaluate(()=>{tab='home';render()});
  ok(await h.until(A,()=>!document.querySelector('#kalc .dot')),'Lea verlässt den Zähler: Punkt verschwindet');
  await L.evaluate(()=>{tab='count';render()});await h.until(A,()=>!!document.querySelector('#kalc .dot'));
  await L.evaluate(()=>{DB.kalShare=false;save();KAL.push(1);render()});
  ok(await h.until(A,()=>!/Lea/.test(document.getElementById('kalc').innerText)),'„Meinen Fortschritt zeigen“ aus: Lea verschwindet samt Punkt');
}};
