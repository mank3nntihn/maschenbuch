module.exports={mit3d:true,name:'3D: Tab, Live-Ansicht im Zähler und großer Zähler zeichnen wirklich',async run(h,ok){
  const p=await h.page('u-anna','anna@x.de');
  // Nach jeder Prüfung die 3D-Ansicht wieder schließen: ohne Grafikkarte bremst das Dauerzeichnen sonst alles andere
  const zeichnet=(sel,vorher)=>p.evaluate(([sel,vorher])=>{eval(vorher);const c=document.querySelector(sel+' canvas'),r=!!c&&c.width>0;FOC.on=false;tab='home';DB.live=false;render();return r},[sel,vorher]);
  for(const tpl of ['sophie','weekend','stripe']){
    await p.evaluate(tpl=>{newTpl=tpl;const q=clone(tplDef(tpl));q.id=rid();q.name='T-'+tpl;DB.projects.push(q);pickP(DB.projects.length-1)},tpl);
    ok(await zeichnet('#gl',"V3.view='flat';tab='3d';render()"),`Vorlage ${tpl}: 3D-Ansicht zeichnet`);
  }
  await p.evaluate(()=>pickP(0)); // für die übrigen Ansichten das einfachere erste Projekt (geht schneller)
  ok(await zeichnet('#gl',"V3.view='worn';tab='3d';render()"),'3D am Model zeichnet');
  ok(await zeichnet('#lgl',"V3.view='flat';tab='count';DB.live=true;render()"),'Live-3D im Zähler zeichnet');
  await p.evaluate(()=>FOC.open());const r0=await p.evaluate(()=>S.row);await p.locator('.fz .plus').click();
  ok(await p.evaluate(r0=>S.row===r0+1&&!!FOC.ctl&&document.querySelector('#fgl canvas').width>0,r0),'Großer Zähler: 3D zeichnet und zählt weiter');
  await p.evaluate(()=>FOC.close());
}};
