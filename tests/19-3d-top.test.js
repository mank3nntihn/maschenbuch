module.exports={mit3d:true,name:'3D: Córdoba Top am Model',async run(h,ok){
  const p=await h.page('u-anna','anna@x.de');
  const zeichnet=(sel,vorher)=>p.evaluate(([sel,vorher])=>{eval(vorher);const c=document.querySelector(sel+' canvas'),r=!!c&&c.width>0;FOC.on=false;tab='home';DB.live=false;render();return r},[sel,vorher]);
  // Córdoba Top: echtes 3D-Model am Model
  await p.evaluate(()=>{const q=clone(tplDef('cordoba'));q.id=rid();DB.projects.push(q);pickP(DB.projects.length-1);S.row=60;save()});
  ok(await zeichnet('#gl',"V3.mode='now';tab='3d';render()"),'Córdoba Top: 3D-Ansicht zeichnet');
  const t=await p.evaluate(()=>{const c=calc(),L=topLayout(c),parts=avatarParts(),fs=partSDF(parts.filter(q=>q.t==='lathe'));
    const row0=L.S.filter(s=>s.row===0).map(s=>s.P[1]),body=L.S.filter(s=>c.R[s.row].sec==='body');
    return{n:L.S.length,rows:new Set(L.S.map(s=>s.row)).size,neck:Math.min(...row0)>14.2&&Math.max(...row0)<14.45,
      aussen:body.filter((s,i)=>i%50===0).every(s=>sdf(fs,s.P)>0),erste:row0.length===c.z.co}});
  ok(t.n>25000&&t.erste,`Córdoba Top: ${t.n} Maschen, erste Reihe mit ${'allen'} Anschlagmaschen`);
  ok(t.neck,'Córdoba Top: Halsblende liegt rundum auf Halshöhe');
  ok(t.aussen,'Córdoba Top: Körper-Maschen liegen außen auf dem Model, nicht im T-Shirt');
  await p.evaluate(()=>FOC.open());const c0=await p.evaluate(()=>FOC.ctl.st.row);await p.locator('.fz .plus').click();
  ok(await p.evaluate(c0=>FOC.ctl&&FOC.ctl.st.row===c0+1,c0),'Córdoba Top: großer Zähler mit 3D, +1 lässt das Top wachsen');
  await p.evaluate(()=>FOC.close());
}};
