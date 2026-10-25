// ===== Anleitungen: Reihenpläne (Sophie Scarf, Weekend Scarf, Streifenschal), Berechnung und Anleitungstexte =====
// ---------- Reihenplan ----------
const tplDef=k=>k==='sophie'?DEFS:k==='weekend'?DEFW:k==='cordoba'?DEFC:DEFST;
function weekendPlan(z){const R=[];
  for(let i=0;i<z.half;i++)R.push({n:z.cast,sec:'skinny',k:'skinny',st:Math.floor(i/2)+1,sts:z.half/2,rr:i%2+1,len:2});
  for(let i=0;i<z.half;i++)R.push({n:z.cast,sec:'chunky',k:i===z.half-1?'bo':'chunky',st:Math.floor(i/6)+1,sts:z.half/6,rr:i%6+1,len:6});
  return R}
function sophiePlan(z){
  const R=[];let n=6;
  for(let rep=1;rep<=z.R1;rep++)for(let rr=1;rr<=8;rr++){if(rr===8)n++;R.push({n,sec:'inc',rep,reps:z.R1,rr,len:8,k:rr===8?'inc':'plain',ws:rr%2===1})}
  for(let rep=1;rep<=z.R2;rep++)for(let rr=1;rr<=8;rr++){if(rr===8)n--;R.push({n,sec:'dec',rep,reps:z.R2,rr,len:8,k:rr===8?'dec':'plain',ws:rr%2===1})}
  for(let rr=1;rr<=7;rr++)R.push({n,sec:'mid',rep:1,reps:1,rr,len:7,k:'plain',ws:rr%2===1});
  for(let rr=1;rr<=7;rr++){if(rr===1)n=6;R.push({n,sec:'end',rep:1,reps:1,rr,len:7,k:rr===1?'end1':rr===7?'bo':'end2',ws:rr%2===0})}
  return R;
}
function calc(){
  const sop=S.tpl==='sophie',wk=S.tpl==='weekend',gm=S.tpl==='cordoba',z=sop?SZ[S.size]:wk?WZ[S.size]||WZ.big:gm?cordobaZ():null,g=sop?{sts:22,rows:42}:gm?{sts:21,rows:32}:{sts:S.sts,rows:S.rows};
  let R;
  if(sop)R=sophiePlan(z);else if(wk)R=weekendPlan(z);else if(gm)R=cordobaPlan(z);
  else{const cast=Math.max(2,Math.round(S.w*S.sts/20)*2),tot=Math.max(1,Math.round(S.l*S.rows/10));R=Array.from({length:tot},(_,i)=>({n:cast,sec:'body',k:'body',ws:i%2===1}))}
  const total=R.length,segs=[];let pos=0,i=0;
  if(wk){while(pos<total){const w=pos<z.half?2:6,ix=i%2,s=S.stripes[ix]||S.stripes[0];const n=Math.min(w,total-pos);segs.push({s,idx:ix,a:pos+1,b:pos+n,n});pos+=n;i++}}
  else while(pos<total){const s=S.stripes[i%S.stripes.length];const n=Math.min(Math.max(1,s.r),total-pos);segs.push({s,idx:i%S.stripes.length,a:pos+1,b:pos+n,n});pos+=n;i++}
  const by=(wk?S.stripes.slice(0,2):S.stripes).map(s=>({s,rows:0,st:0}));
  segs.forEach(q=>{by[q.idx].rows+=q.n;for(let r=q.a-1;r<q.b;r++)by[q.idx].st+=R[r].n});
  const stTot=by.reduce((a,x)=>a+x.st,0)||1,totM=sop?z.g/25*115:wk?2*z.g/100*119:gm?z.m:0,perSt=(10/g.sts)*(S.tech==='crochet'?5.2:4.2)/100*1.1;
  by.forEach(x=>{x.m=sop||wk||gm?totM*x.st/stTot:x.st*perSt;x.balls=x.rows?Math.ceil(x.m/Math.max(1,S.mpb)):0});
  return{sop,wk,gm,z,g,R,total,cast:gm?z.co:R[0].n,maxN:Math.max(...R.map(r=>r.n)),stTot,segs,by,totM,len:sop?z.len:S.l};
}
function rowText(r){
  if(DB.lang==='en'){const sl=`${ab('sl3 wyif')} (${ab('i-cord')})`;
    return{plain:`${ab('k')} to the last 3 ${ab('st')}, ${sl}.`,inc:`${ab('k2')}, ${ab('inc')}, ${ab('k')} to the last 3 ${ab('st')}, ${sl}.`,dec:`${ab('k3')}, ${ab('dec')}, ${ab('k')} to the last 3 ${ab('st')}, ${sl}.`,end1:`${ab('k2')}, ${ab('dec')}, ${sl} (= 6 ${ab('st')}).`,end2:`${ab('k3')}, ${sl}.`,bo:`${ab('BO')} the first 3 ${ab('st')} knitwise and the last 3 ${ab('st')} purlwise.`}[r.k]}
  const sl=`die letzten 3 ${ab('M')} mit dem Faden vor der Arbeit ${ab('wie zum li abh.')} (${ab('I-Cord')})`;
  return{plain:`${ab('re')} stricken bis 3 ${ab('M')} vor Reihenende, ${sl}.`,
   inc:`${abx('2 re','re','2 Maschen rechts')}, ${ab('Zun')}, ${ab('re')} stricken bis 3 ${ab('M')} vor Reihenende, ${sl}.`,
   dec:`${abx('3 re','re','3 Maschen rechts')}, ${ab('Abn')}, ${ab('re')} stricken bis 3 ${ab('M')} vor Reihenende, ${sl}.`,
   end1:`${abx('2 re','re','2 Maschen rechts')}, ${ab('Abn')}, ${sl} (= 6 ${ab('M')}).`,
   end2:`${abx('3 re','re','3 Maschen rechts')}, ${sl}.`,
   bo:`Die ersten 3 ${ab('M')} rechts ${ab('abk.')}, die letzten 3 ${ab('M')} links ${ab('abk.')}${DB.abbr?'':'.'}`}[r.k];
}
const side=r=>DB.lang==='en'?ab(r.ws?'WS':'RS'):ab(r.ws?'Rück-R':'Hin-R');
const onNeedle=n=>DB.lang==='en'?`then ${n} ${ab('st')} on the needle`:`danach ${n} ${ab('M')} auf der Nadel`;
const repLabel=r=>r.reps>1?t('repOf')(r.rep,r.reps,r.rr,r.len):t('rowXofY')(r.rr,r.len);

function stepTexts(c){
  const knit=S.tech==='knit',nd=fmt(S.needle);
  if(DB.lang==='en')return knit?{s:`${ab('CO')} ${c.cast} ${ab('st')} on ${nd} mm needles.`,g:g=>`Rows ${g.a}–${g.b}: ${ab('k')} all ${ab('st')} (${ab('garter st')}). Change colour at the start of a row.`,e:`${ab('BO')} loosely, weave in all ends.`}
    :{s:`${ab('ch')} ${c.cast+1} with a ${nd} mm hook.`,g:g=>`Rows ${g.a}–${g.b}: ${ab('turning ch')} 1, then 1 ${ab('sc')} in each ${ab('st','stitch')} (${c.cast} ${ab('st')}).`,e:'Fasten off, weave in all ends.'};
  return knit?{s:`${c.cast} ${ab('M')} mit ${nd} mm Nadeln anschlagen.`,g:g=>`${ab('R')} ${g.a}–${g.b}: alle ${ab('M')} ${ab('re')} stricken (${ab('kraus re')}). Farbwechsel am Reihenanfang.`,e:`Locker ${ab('abk.')}, alle Fäden vernähen.`}
    :{s:`${c.cast+1} ${ab('LM')} mit ${nd} mm Häkelnadel als Anfangskette.`,g:g=>`${ab('R')} ${g.a}–${g.b}: 1 ${ab('Wende-LM')}, dann in jede ${ab('M','Masche')} 1 ${ab('fM')} (${c.cast} ${ab('M')}).`,e:'Faden abschneiden, durchziehen, alle Fäden vernähen.'};
}
function stepList(L){
  const nx=L.findIndex(q=>!q.d);
  return `<ol class="st">${L.map((q,i)=>`<li class="${q.d?'d':i===nx?'n':''}" onclick="if(event.target.closest('.ab'))return;setRow(${q.d?q.a:q.b})"><span class="ck">${q.d?'✓':''}</span><div class="tx">${q.t}${i===nx&&q.here?`<span class="now">${t('nowHere')}: ${q.here}</span>`:''}</div></li>`).join('')}</ol>`;
}
function vSteps(){
  const c=calc();
  if(c.gm)return vStepsCordoba(c);
  if(c.sop)return vStepsSophie(c);
  if(c.wk)return vStepsWeekend(c);
  const x=stepTexts(c),L=[];
  L.push({d:S.row>0,t:`<b>${t('start')[S.tech]}</b><br>${x.s}`,a:0,b:0});
  c.segs.forEach(g=>L.push({d:S.row>=g.b,t:`<b>${esc(g.s.n)}</b><br>${x.g(g)}<span class="meta">${t('ofRows')(Math.min(Math.max(S.row-g.a+1,0),g.n),g.n)}</span>`,a:g.a-1,b:g.b}));
  L.push({d:S.row>=c.total,t:`<b>${t('end')}</b><br>${x.e}`,a:c.total,b:c.total});
  return `<section class="card">${stepList(L)}<p class="mu">${t('tapStep')}${DB.abbr?t('tapAb'):''}</p></section>`;
}
function vStepsSophie(c){
  const en=DB.lang==='en',z=c.z,R=c.R,nd=fmt(S.needle),sec={};
  R.forEach((r,i)=>{if(!sec[r.sec])sec[r.sec]={a:i,b:i};sec[r.sec].b=i+1});
  const prog=k=>{const s=sec[k],d=Math.min(Math.max(S.row-s.a,0),s.b-s.a);return `<span class="meta">${t('ofRows')(d,s.b-s.a)}</span>`};
  const here=k=>{const s=sec[k];return S.row>=s.a&&S.row<s.b?repLabel(R[S.row]):''};
  const P=rowText({k:'plain'}),I=rowText({k:'inc'}),D=rowText({k:'dec'});
  const box=(h,txt)=>`<li><b>${h}</b>${txt}</li>`;
  const rw=en?'Row':'Reihe',rws=en?'Rows':'Reihe';
  const L=[
   {d:S.row>0,a:0,b:0,t:`<b>${t('sec').co}</b><br>`+(en?`${ab('CO')} 6 ${ab('st')} on a ${nd} mm circular needle (60 cm).`:`6 ${ab('M')} auf einer ${nd} mm Rundstricknadel (60 cm) anschlagen.`)},
   {d:S.row>=sec.inc.b,a:sec.inc.a,b:sec.inc.b,here:here('inc'),t:`<b>${t('sec').inc}</b><br>`+(en?`Work the following 8 rows ${z.R1} times in total. The increases are always on the same edge of the scarf.`:`Die folgenden 8 Reihen insgesamt ${z.R1}-mal stricken (${ab('Rapp.')}). Die Zunahmen liegen immer an derselben Kante des Schals.`)
     +`<ul class="sub">${box(`${rws} 1–7 (${en?'row 1 is a':'Reihe 1 ist eine'} ${side({ws:true})})`,P)}${box(`${rw} 8 (${side({ws:false})})`,I)}</ul>`
     +(en?`Afterwards there are ${6+z.R1} ${ab('st')} on the needle.`:`Danach liegen ${6+z.R1} ${ab('M')} auf der Nadel.`)+prog('inc')},
   {d:S.row>=sec.dec.b,a:sec.dec.a,b:sec.dec.b,here:here('dec'),t:`<b>${t('sec').dec}</b><br>`+(en?`Work the following 8 rows ${z.R2} times in total, along the same edge.`:`Die folgenden 8 Reihen insgesamt ${z.R2}-mal stricken (${ab('Rapp.')}), an derselben Kante wie die Zunahmen.`)
     +`<ul class="sub">${box(`${rws} 1–7 (${en?'row 1 is a':'Reihe 1 ist eine'} ${side({ws:true})})`,P)}${box(`${rw} 8 (${side({ws:false})})`,D)}</ul>`
     +(en?`Afterwards there are 7 ${ab('st')} on the needle.`:`Danach liegen 7 ${ab('M')} auf der Nadel.`)+prog('dec')},
   {d:S.row>=sec.mid.b,a:sec.mid.a,b:sec.mid.b,here:here('mid'),t:`<b>${t('sec').mid}</b><br>`+(en?'Work rows 1–7 once more as described above:':'Reihe 1–7 noch einmal wie oben beschrieben stricken:')+`<ul class="sub">${box(`${rws} 1–7`,P)}</ul>`+prog('mid')},
   {d:S.row>=sec.end.b,a:sec.end.a,b:sec.end.b,here:here('end'),t:`<b>${t('sec').end}</b><ul class="sub">`
     +box(`${rw} 1 (${side({ws:false})})`,rowText({k:'end1'}))
     +box(en?'Rows 2–6 (alternating WS and RS)':'Reihe 2–6 (abwechselnd Rück- und Hinreihe)',rowText({k:'end2'}))
     +box(`${rw} 7 (${side({ws:false})})`,rowText({k:'bo'}))+`</ul>`+prog('end')},
   {d:S.row>=c.total,a:c.total,b:c.total,t:`<b>${t('sec').fin}</b><br>`+(en?`Weave in all ends neatly and discreetly; they hide best inside the ${ab('i-cord')}.`:`Alle Fäden sauber und unauffällig vernähen. Am besten verschwinden sie im ${ab('I-Cord')}.`)}
  ];
  return `<section class="card">${stepList(L)}<p class="mu">${t('tapStep')}${DB.abbr?t('tapAb'):''}</p></section>
  <section class="card"><h2>${t('tips')}</h2><ul style="padding-left:20px;margin:10px 0 0">`+(en?
   `<li style="margin-bottom:8px">Joining new yarn: cut the old yarn and start the new one when only the last 3 stitches of the row remain. Weave both ends into the i-cord, each in its own direction.</li><li>Limited yarn: weigh it before you start. Work the increases until half of the yarn is used, then work the decreases with the rest. Example with 25 g: increase until 13 g are left.</li>`:
   `<li style="margin-bottom:8px">Neues Garn ansetzen: alten Faden abschneiden und den neuen anlegen, wenn nur noch die letzten 3 Maschen der Reihe übrig sind. Beide Enden jeweils in ihre Richtung im I-Cord vernähen, so wird der Übergang fast unsichtbar.</li><li>Wenig Garn: vorher wiegen. So lange zunehmen, bis die Hälfte des Garns verbraucht ist, dann mit dem Rest die Abnahmen stricken. Beispiel mit 25 g: zunehmen, bis noch 13 g übrig sind.</li>`)+
  `</ul><p class="mu sm">${t('credit')}</p></section>`;
}

// ===== The Weekend Scarf: Texte =====
function wkInfo(c,r){const de=DB.lang==='de';
  const part=r.sec==='skinny'?(de?'Teil 1: dünne Streifen':'Part 1: skinny stripes'):(de?'Teil 2: dicke Streifen':'Part 2: chunky stripes');
  return `${part} · ${de?`Streifen ${r.st} von ${r.sts}, Reihe ${r.rr} von ${r.len}`:`stripe ${r.st} of ${r.sts}, row ${r.rr} of ${r.len}`} · ${c.cast} ${ab(de?'M':'st')}`}
function wkText(c,i){const de=DB.lang==='de',r=c.R[i],seg=c.segs.find(g=>i+1<=g.b),col=seg?esc(seg.s.n):'',ab_=seg?(seg.idx?'B':'A'):'';
  const sw=r.rr===1&&i>0;
  if(r.k==='bo')return de?'Letzte Reihe: im 2x2-Rippenmuster abketten (rechte Maschen rechts, linke Maschen links abketten), dann alle Fäden vernähen.':`Last row: bind off in 2x2 rib, then weave in all ends.`;
  const rib=de?`2 ${ab('M')} ${ab('re')}, 2 ${ab('M')} ${ab('li')} im Wechsel (${ab('2x2-Rippen')})`:`${ab('k2')}, ${ab('p')}2 across (${ab('2x2 rib')})`;
  return (sw?(de?`<b>Farbe wechseln zu ${col} (${ab_})</b>, den anderen Faden an der Seite mitführen. `:`<b>Switch to ${col} (${ab_})</b>, carry the other yarn up the side. `):'')
    +(de?`${rib} in ${col} (${ab_}).`:`${rib} in ${col} (${ab_}).`)}
function vStepsWeekend(c){const de=DB.lang==='de',z=c.z,h=z.half,nd=fmt(S.needle),A=esc(S.stripes[0].n),B=esc((S.stripes[1]||S.stripes[0]).n);
  const prog=(a,b)=>`<span class="meta">${t('ofRows')(Math.min(Math.max(S.row-a,0),b-a),b-a)}</span>`;
  const here=(a,b)=>S.row>=a&&S.row<b?wkInfo(c,c.R[S.row]).split(' · ')[1]:'';
  const L=[
   {d:S.row>0,a:0,b:0,t:`<b>${de?'Anschlag':'Cast on'}</b><br>`+(de?`${z.cast} ${ab('M')} mit Farbe A (${A}) auf ${nd} mm Nadeln im 2x2-Rippenmuster anschlagen (Alternating Cable Cast On).`:`Cast on ${z.cast} stitches in colour A (${A}) on ${nd} mm needles in 2x2 rib (alternating cable cast on).`)},
   {d:S.row>=h,a:0,b:h,here:here(0,h),t:`<b>${de?'Teil 1: dünne Streifen':'Part 1: skinny stripes'}</b><br>`+(de?`2x2-Rippen stricken und <b>alle 2 Reihen</b> die Farbe wechseln: A, B, A, B … Insgesamt ${h} Reihen = ${h/2} Streifen (${h/4} je Farbe). Der letzte Streifen ist B (${B}).`:`Work 2x2 rib, switching colours <b>every 2 rows</b>: A, B, A, B … ${h} rows = ${h/2} stripes (${h/4} per colour). The last stripe is B (${B}).`)+prog(0,h)},
   {d:S.row>=2*h,a:h,b:2*h,here:here(h,2*h),t:`<b>${de?'Teil 2: dicke Streifen':'Part 2: chunky stripes'}</b><br>`+(de?`Mit Farbe A weiter und jetzt <b>alle 6 Reihen</b> wechseln. Insgesamt ${h} Reihen = ${h/6} Streifen (${h/12} je Farbe). Der letzte Streifen ist B (${B}).`:`Continue with A, now switching <b>every 6 rows</b>. ${h} rows = ${h/6} stripes (${h/12} per colour). The last stripe is B (${B}).`)+prog(h,2*h)},
   {d:S.row>=c.total,a:c.total,b:c.total,t:`<b>${de?'Abketten':'Bind off'}</b><br>`+(de?'Im 2x2-Rippenmuster abketten und alle losen Fäden vernähen.':'Bind off in 2x2 rib and weave in all loose ends.')}
  ];
  const V=[['Alternating Cable Cast On','TCfsp-TM9Z4'],[de?'2x2-Rippen':'2x2 rib','Uy2RYoDI1QE'],[de?'Farbe wechseln':'Switching colours','k96lyNiB4ZU'],[de?'Faden mitführen':'Carrying the yarn','fgB9iaMWvX0'],[de?'Im Rippenmuster abketten':'Cast off in rib','TC_qvd0qmnk']];
  return `<section class="card">${stepList(L)}<p class="mu">${t('tapStep')}${DB.abbr?t('tapAb'):''}</p></section>
  <section class="card"><h2>${de?'Videos zu den Techniken':'Technique videos'}</h2><ul style="padding-left:20px;margin:10px 0 0">${V.map(v=>`<li style="margin-bottom:6px"><a href="https://www.youtube.com/watch?v=${v[1]}" target="_blank" rel="noopener">${v[0]} ↗</a></li>`).join('')}</ul>
  <p class="mu sm">${de?'Farbkombinationen aus der Anleitung: Orange + Banana, Ballet Slipper + Chana Dal, Aster + Chocolate, Mochi + Black Cherry.':'Colour combinations from the pattern: Orange + Banana, Ballet Slipper + Chana Dal, Aster + Chocolate, Mochi + Black Cherry.'}</p>
  <p class="mu sm">${de?'Anleitung: The Weekend Scarf von The Long Weekend. Nur für den privaten Gebrauch.':'Pattern: The Weekend Scarf by The Long Weekend. Personal use only.'}</p></section>`}

// ===== Córdoba Top (Alma Patterns): Reihenplan, Texte und Anleitungs-Tab =====
// Jede Zeile im Plan ist eine Reihe oder Runde. key fasst gleichartige Reihen zusammen (für „Achtung, Reihe … ist anders“).
function cordobaZ(){const i=Math.max(0,CZ.indexOf(S.size)),z={i,size:CZ[i]};for(const k in CD)z[k]=CD[k][i];return z}
function cordobaPlan(z){const R=[];let n=z.co;const P=o=>R.push({n,...o});
  ['np','nk','np','nk','nf','nk','np','nk','np','nj'].forEach((k,j)=>P({sec:'neck',k,key:k==='nf'||k==='nj'?k:'neck',ws:j%2===0,rr:j+1,len:10}));
  P({sec:'yoke',k:'ys',key:'ys',ws:true,rr:1,len:1});
  for(let r=1;r<=z.y;r++){n+=8;P({sec:'yoke',k:'yi',key:'yoke',ws:false,rep:r,reps:z.y,rr:1,len:2});P({sec:'yoke',k:'yp',key:'yoke',ws:true,rep:r,reps:z.y,rr:2,len:2})}
  n=2*z.f+z.bk+4+2*z.u;P({sec:'split',k:'sd',key:'sd',ws:false,rr:1,len:2});P({sec:'split',k:'sp',key:'sp',ws:true,rr:2,len:2});
  for(let r=1;r<=z.ni;r++){n+=2;P({sec:'neckinc',k:'xi',key:'neckinc',ws:false,rep:r,reps:z.ni,rr:1,len:2});P({sec:'neckinc',k:'xp',key:'neckinc',ws:true,rep:r,reps:z.ni,rr:2,len:2})}
  n+=4;P({sec:'join',k:'jr',key:'jr',rnd:true,rr:1,len:1});
  // Länge ab Achsel: die Reihen seit dem Teilen zählen schon mit
  const B=Math.max(1,Math.round(Math.max(5,S.l||z.len)*3.2)-(3+2*z.ni));z.B=B;z.body=n;
  for(let r=1;r<=B;r++)P({sec:'body',k:'bk',key:'bk',rnd:true,rr:r,len:B});
  P({sec:'body',k:'bb',key:'bb',rnd:true,rr:1,len:1});
  n=z.sl+z.pu;P({sec:'sleeveR',k:'r1',key:'r1',rnd:true,rr:1,len:4});P({sec:'sleeveR',k:'rk',key:'rk',rnd:true,rr:2,len:4});P({sec:'sleeveR',k:'rk',key:'rk',rnd:true,rr:3,len:4});P({sec:'sleeveR',k:'rb',key:'rb',rnd:true,rr:4,len:4});
  P({sec:'sleeveL',k:'l1',key:'l1',rnd:true,rr:1,len:3});P({sec:'sleeveL',k:'lk',key:'lk',rnd:true,rr:2,len:3});P({sec:'sleeveL',k:'lb',key:'lb',rnd:true,rr:3,len:3});
  n=z.op;P({sec:'open',k:'o1',key:'o1',ws:false,rr:1,len:4});P({sec:'open',k:'op',key:'op',ws:true,rr:2,len:4});P({sec:'open',k:'ok',key:'ok',ws:false,rr:3,len:4});P({sec:'open',k:'ob',key:'ob',ws:true,rr:4,len:4});
  n=2;P({sec:'cord',k:'c1',key:'c1',cord:true,rr:1,len:2});P({sec:'cord',k:'c2',key:'c2',cord:true,rr:2,len:2});
  return R}
const GMS={de:{neck:'Halsblende',yoke:'Passe',split:'Ärmel stilllegen',neckinc:'Ausschnitt',join:'Zur Runde schließen',body:'Körper',sleeveR:'Rechter Ärmel',sleeveL:'Linker Ärmel',open:'Ausschnittkante',cord:'Kordel'},
  en:{neck:'Neckline casing',yoke:'Yoke',split:'Divide for sleeves',neckinc:'Neckline shaping',join:'Join in the round',body:'Body',sleeveR:'Right sleeve',sleeveL:'Left sleeve',open:'Opening edge',cord:'Cord'}};
const GMK={de:{neck:'Halsblende',nf:'Bruchkante (Rückreihe rechts)',nj:'Blende zusammenstricken',ys:'Maschenmarkierer setzen',yoke:'Raglan-Zunahmen',sd:'Ärmel stilllegen',sp:'Rückreihe links',neckinc:'Ausschnitt-Zunahmen',jr:'zur Runde schließen',bk:'Runden glatt rechts',bb:'Abketten',r1:'rechter Ärmel: Maschen aufnehmen',rk:'Runde rechts',rb:'Ärmel abketten',l1:'linker Ärmel: Maschen aufnehmen',lk:'Runde rechts',lb:'Ärmel abketten',o1:'Maschen auffassen',op:'Reihe links',ok:'Reihe rechts',ob:'Abketten',c1:'Kordel stricken',c2:'Kordel einziehen'},
  en:{neck:'neckline casing',nf:'fold line (knit on the wrong side)',nj:'join the casing',ys:'place stitch markers',yoke:'raglan increases',sd:'divide for sleeves',sp:'purl row',neckinc:'neckline increases',jr:'join in the round',bk:'stockinette rounds',bb:'bind off',r1:'right sleeve: pick up',rk:'knit round',rb:'bind off sleeve',l1:'left sleeve: pick up',lk:'knit round',lb:'bind off sleeve',o1:'pick up stitches',op:'purl row',ok:'knit row',ob:'bind off',c1:'knit the cord',c2:'thread the cord'}};
function gmPart(r){const de=DB.lang==='de';
  if(r.cord)return de?`Schritt ${r.rr} von ${r.len}`:`step ${r.rr} of ${r.len}`;
  if(r.reps)return de?`Zunahme ${r.rep} von ${r.reps}, Reihe ${r.rr} von 2`:`increase ${r.rep} of ${r.reps}, row ${r.rr} of 2`;
  if(r.k==='ys')return de?'Markierer setzen':'place markers';
  if(r.k==='bb')return de?'Abketten':'bind off';
  return r.rnd?(de?`Runde ${r.rr} von ${r.len}`:`round ${r.rr} of ${r.len}`):(de?`Reihe ${r.rr} von ${r.len}`:`row ${r.rr} of ${r.len}`)}
function gmInfo(c,r){const de=DB.lang==='de';
  return [GMS[DB.lang][r.sec],gmPart(r),r.cord||r.rnd?'':side(r),r.cord?'':onNeedle(r.n)].filter(Boolean).join(' · ')}
function gmText(c,r){const de=DB.lang==='de',z=c.z,M=ab(de?'M':'st'),MM=ab(de?'MM':'sm');
  const sl=de?`1 ${M} ${ab('re abh.')}`:ab('sl1kw'),K=ab(de?'re':'k'),P_=ab(de?'li':'p'),bo=de?`Alle ${M} ${ab('abk.')} – am schönsten mit der Methode gegen Einrollen (siehe Videos).`:`${ab('BO')} all ${M}, ideally with the no-roll bind-off (see videos).`;
  const T=de?{
   np:`${sl}, alle übrigen ${M} ${P_}.`,nk:`${sl}, ${K} bis zur letzten ${M}, 1 ${P_}.`,
   nf:`<strong>Bruchkante:</strong> ${sl}, ${K} bis zur letzten ${M}, 1 ${P_}. Diese Rückreihe rechts stricken – vorne entsteht eine Linie aus linken Maschen, hier wird die Blende später umgeklappt.`,
   nj:`Blende nach innen umklappen und jede ${M} zusammen mit der passenden Masche der Anschlagkante ${K} stricken. So entsteht der Tunnel für die Kordel.`,
   ys:`${sl}, ${z.a} ${P_}, ${MM}, 1 ${P_}, ${MM}, ${z.b} ${P_}, ${MM}, 1 ${P_}, ${MM}, ${z.c} ${P_}, ${MM}, 1 ${P_}, ${MM}, ${z.b} ${P_}, ${MM}, 1 ${P_}, ${MM}, ${z.d} ${P_}.<br><small>= Vorderteil · Raglan · Ärmel · Raglan · Rücken · Raglan · Ärmel · Raglan · Vorderteil (8 ${MM})</small>`,
   yi:`${sl}, 4× [${K} bis zum ${MM}, ${ab('M1R')}, ${MM} abheben, 1 ${K}, ${MM} abheben, ${ab('M1L')}], ${K} bis zur letzten ${M}, 1 ${P_}. <strong>(+8 ${M})</strong>`,
   yp:`${sl}, alle übrigen ${M} ${P_}.`,
   sd:`${sl}, ${K} bis zum ${MM}, ${MM} entfernen, 1 ${K}, ${MM} entfernen. <strong>${z.sl} Ärmelmaschen</strong> auf einen Hilfsfaden legen, <strong>${z.u} ${M}</strong> für den Unterarm neu anschlagen (Schlingenanschlag). ${MM} entfernen, 1 ${K}, ${MM} entfernen, ${K} bis zum ${MM}, ${MM} entfernen, 1 ${K}, ${MM} entfernen. Wieder <strong>${z.sl} ${M}</strong> stilllegen, <strong>${z.u} ${M}</strong> anschlagen. ${MM} entfernen, 1 ${K}, ${MM} entfernen, ${K} bis zur letzten ${M}, 1 ${P_}.`,
   sp:`${sl}, alle übrigen ${M} ${P_}.`,
   xi:`1 ${K}, ${ab('M1L')}, ${K} bis zur letzten ${M}, ${ab('M1R')}, 1 ${K}. <strong>(+2 ${M})</strong>`,xp:`Alle ${M} ${P_}.`,
   jr:`Alle ${M} ${K}, dann <strong>4 ${M}</strong> neu anschlagen (Schlingenanschlag) und zur Runde schließen: einfach mit der ersten ${M} auf der linken Nadel weiterstricken. Ab jetzt in Runden.`,
   bk:`Alle ${M} ${K} (glatt rechts in Runden).`,bb:bo,
   r1:`Die ${z.sl} stillgelegten ${M} des rechten Ärmels auf die Rundnadel nehmen, Rundenbeginn mit ${MM} markieren, <strong>${z.pu} ${M}</strong> aus den Unterarm-Maschen auffassen, ${K} bis zum ${MM}.`,
   rk:`Alle ${M} ${K}.`,rb:bo,
   l1:`Die ${z.sl} stillgelegten ${M} des linken Ärmels auf die Nadel nehmen, Faden ansetzen, alle ${M} ${K}, ${MM} setzen, <strong>${z.pu} ${M}</strong> aus dem Unterarm auffassen, ${K} bis zum ${MM}.`,
   lk:`Alle ${M} ${K}.`,lb:bo,
   o1:`Entlang der Öffnung ${M} auffassen: an den Seiten 1 ${M} aus jeder Randmasche, unten 1 ${M} zwischen jeder Anschlagmasche – zusammen ca. <strong>${z.op} ${M}</strong>.`,
   op:`Alle ${M} ${P_}.`,ok:`Alle ${M} ${K}.`,ob:bo,
   c1:`2 ${M} anschlagen und immer wieder [1 ${K}, 1 ${M} mit dem Faden vor der Arbeit wie zum Linksstricken abheben, wenden], bis die ${ab('I-Cord')} ca. <strong>${z.cord} cm</strong> lang ist. Alternativ eine Luftmaschenkette häkeln.`,
   c2:`Kordel mit einer Sicherheitsnadel durch den Tunnel der Halsblende ziehen und alle Fäden vernähen. Fertig! 🎉`
  }:{
   np:`${sl}, ${P_} to the end.`,nk:`${sl}, ${K} to the last ${M}, ${ab('p1')}.`,
   nf:`<strong>Fold line:</strong> ${sl}, ${K} to the last ${M}, ${ab('p1')}. This wrong-side row is knitted so a purl line shows on the right side – the casing folds here later.`,
   nj:`Fold the casing to the inside and knit each ${M} together with the matching stitch of the cast-on edge. This forms the tunnel for the cord.`,
   ys:`${sl}, ${P_} ${z.a}, ${ab('pm')}, ${ab('p1')}, ${ab('pm')}, ${P_} ${z.b}, ${ab('pm')}, ${ab('p1')}, ${ab('pm')}, ${P_} ${z.c}, ${ab('pm')}, ${ab('p1')}, ${ab('pm')}, ${P_} ${z.b}, ${ab('pm')}, ${ab('p1')}, ${ab('pm')}, ${P_} ${z.d}.<br><small>= front · raglan · sleeve · raglan · back · raglan · sleeve · raglan · front (8 markers)</small>`,
   yi:`${sl}, 4× [${K} to ${MM}, ${ab('m1r')}, slip ${MM}, ${ab('k1')}, slip ${MM}, ${ab('m1l')}], ${K} to the last ${M}, ${ab('p1')}. <strong>(+8 ${M})</strong>`,
   yp:`${sl}, ${P_} to the end.`,
   sd:`${sl}, ${K} to ${MM}, remove ${MM}, ${ab('k1')}, remove ${MM}. Place <strong>${z.sl} sleeve ${M}</strong> on hold, cast on <strong>${z.u} ${M}</strong> for the underarm (backward loop). Remove ${MM}, ${ab('k1')}, remove ${MM}, ${K} to ${MM}, remove ${MM}, ${ab('k1')}, remove ${MM}. Place <strong>${z.sl} ${M}</strong> on hold, cast on <strong>${z.u} ${M}</strong>. Remove ${MM}, ${ab('k1')}, remove ${MM}, ${K} to the last ${M}, ${ab('p1')}.`,
   sp:`${sl}, ${P_} to the end.`,
   xi:`${ab('k1')}, ${ab('m1l')}, ${K} to the last ${M}, ${ab('m1r')}, ${ab('k1')}. <strong>(+2 ${M})</strong>`,xp:`${P_} all ${M}.`,
   jr:`${K} all ${M}, cast on <strong>4 ${M}</strong> (backward loop) and join in the round by knitting on into the first ${M} of the left needle. From now on work in rounds.`,
   bk:`${K} all ${M} (stockinette in the round).`,bb:bo,
   r1:`Place the ${z.sl} held ${M} of the right sleeve on the needle, mark the start of the round, pick up <strong>${z.pu} ${M}</strong> from the underarm, ${K} to ${MM}.`,
   rk:`${K} all ${M}.`,rb:bo,
   l1:`Place the ${z.sl} held ${M} of the left sleeve on the needle, join yarn, ${K} all ${M}, ${ab('pm')}, pick up <strong>${z.pu} ${M}</strong> from the underarm, ${K} to ${MM}.`,
   lk:`${K} all ${M}.`,lb:bo,
   o1:`Pick up ${M} along the opening: 1 ${M} in each edge stitch on the sides and 1 ${M} between each cast-on stitch at the bottom – about <strong>${z.op} ${M}</strong>.`,
   op:`${P_} all ${M}.`,ok:`${K} all ${M}.`,ob:bo,
   c1:`Cast on 2 ${M} and repeat [${ab('k1')}, slip 1 purlwise with yarn in front, turn] until the ${ab('i-cord')} measures about <strong>${z.cord} cm</strong>. Or crochet a chain instead.`,
   c2:`Thread the cord through the casing with a safety pin and weave in all ends. Done! 🎉`};
  return T[r.k]}
function vStepsCordoba(c){const de=DB.lang==='de',z=c.z,R=c.R,M=ab(de?'M':'st'),sec={};
  R.forEach((r,i)=>{if(!sec[r.sec])sec[r.sec]={a:i,b:i};sec[r.sec].b=i+1});
  const prog=k=>{const s=sec[k],d=Math.min(Math.max(S.row-s.a,0),s.b-s.a);return `<span class="meta">${t('ofRows')(d,s.b-s.a)}</span>`};
  const here=k=>{const s=sec[k];return S.row>=s.a&&S.row<s.b?gmPart(R[S.row]):''};
  const box=(h,txt)=>`<li><b>${h}</b>${txt}</li>`,tx=k=>gmText(c,{k}),it=(k,body)=>({d:S.row>=sec[k].b,a:sec[k].a,b:sec[k].b,here:here(k),t:`<b>${GMS[DB.lang][k]}</b><br>${body}${prog(k)}`});
  const rw=de?'Reihe':'Row',rws=de?'Reihen':'Rows',rd=de?'Runde':'Round',rds=de?'Runden':'Rounds',SZU=z.size.toUpperCase();
  const L=[
   {d:S.row>0,a:0,b:0,t:`<b>${de?'Anschlag':'Cast on'}</b><br>`+(de?`<b>${z.co} ${M}</b> mit 3,5 mm Rundstricknadel (80–100 cm) im Kreuzanschlag anschlagen. Größe ${SZU}.`:`Cast on <b>${z.co} ${M}</b> with a 3.5 mm circular needle (80–100 cm), long-tail cast on. Size ${SZU}.`)},
   it('neck',(de?'In Hin- und Rückreihen. Die erste Masche jeder Reihe wird wie zum Rechtsstricken abgehoben, das gibt einen sauberen Rand.':'Worked back and forth. Slip the first stitch of every row knitwise for a neat edge.')
     +`<ul class="sub">${box(`${rws} 1, 3 (${side({ws:true})})`,tx('np'))}${box(`${rws} 2, 4 (${side({ws:false})})`,tx('nk'))}${box(`${rw} 5 (${side({ws:true})})`,tx('nf'))}${box(`${rws} 6–9`,de?'wie Reihe 1–4, beginnend mit einer Hinreihe':'as rows 1–4, starting with a right-side row')}${box(`${rw} 10 (${side({ws:false})})`,tx('nj'))}</ul>`),
   it('yoke',`<ul class="sub">${box(de?'Markierer-Reihe':'Marker row',tx('ys'))}${box(de?`Dann ${z.y}× diese 2 Reihen`:`Then work these 2 rows ${z.y} times`,`${side({ws:false})}: ${tx('yi')}<br>${side({ws:true})}: ${tx('yp')}`)}</ul>`
     +(de?`Danach: ${z.f} · 1 · ${z.sl} · 1 · ${z.bk} · 1 · ${z.sl} · 1 · ${z.f} ${M} = ${z.co+8*z.y} ${M}.`:`Then: ${z.f} · 1 · ${z.sl} · 1 · ${z.bk} · 1 · ${z.sl} · 1 · ${z.f} ${M} = ${z.co+8*z.y} ${M}.`)),
   it('split',`<ul class="sub">${box(`${rw} 1 (${side({ws:false})})`,tx('sd'))}${box(`${rw} 2 (${side({ws:true})})`,tx('sp'))}</ul>`),
   it('neckinc',(de?`Die folgenden 2 Reihen ${z.ni}× stricken:`:`Work these 2 rows ${z.ni} times:`)+`<ul class="sub">${box(side({ws:false}),tx('xi'))}${box(side({ws:true}),tx('xp'))}</ul>`
     +`<span class="mu sm">${de?'Tipp: Für einen tieferen Ausschnitt vorher ein paar Reihen glatt rechts hin und her stricken.':'Tip: for a deeper opening, work a few rows of stockinette back and forth first.'}</span>`),
   it('join',tx('jr')),
   it('body',(de?`<b>${z.B} ${rds}</b> glatt rechts, bis das Top ab den Unterarm-Maschen ca. <b>${fmt(S.l)} cm</b> misst (einstellbar unter „Maße“). Dann in der letzten ${rd} abketten. ${c.R[sec.body.a].n} ${M} in der ${rd}.`:`<b>${z.B} ${rds}</b> of stockinette until the top measures about <b>${fmt(S.l)} cm</b> from the underarm (adjust under “Size”). Bind off in the last ${rd.toLowerCase()}. ${c.R[sec.body.a].n} ${M} per round.`)),
   it('sleeveR',`<ul class="sub">${box(`${rd} 1`,tx('r1'))}${box(`${rds} 2–3`,tx('rk'))}${box(`${rd} 4`,tx('rb'))}</ul>`),
   it('sleeveL',`<ul class="sub">${box(`${rd} 1`,tx('l1'))}${box(`${rd} 2`,tx('lk'))}${box(`${rd} 3`,tx('lb'))}</ul>`),
   it('open',`<ul class="sub">${box(de?'Auffassen':'Pick up',tx('o1'))}${box(de?'Dann':'Then',de?'1 Reihe links, 1 Reihe rechts, abketten.':'Purl 1 row, knit 1 row, bind off.')}</ul>`),
   it('cord',`<ul class="sub">${box('I-Cord',tx('c1'))}${box(de?'Fertigstellen':'Finishing',tx('c2'))}</ul>`)
  ];
  const V=[[de?'Kreuzanschlag':'Long tail cast on','T5ScPtAPmrI'],[de?'1 M wie zum Rechtsstricken abheben':'Slip one knitwise','Y1SwoXDoXFM'],[de?'Blende umklappen und zusammenstricken':'Folded casing','t5tS_pxnmKY'],['M1R / M1L','eADPJrb9Ym8'],[de?'Schlingenanschlag':'Loop cast on','d8rdkITZ8r8'],[de?'Maschen auffassen':'Picking up stitches','_zIaUlG6zMg'],[de?'Abketten gegen Einrollen':'No-roll bind-off','_hFLbY5tAwE'],['I-Cord','vhr-Ovs5MOc']];
  return `<section class="card">${stepList(L)}<p class="mu">${t('tapStep')}${DB.abbr?t('tapAb'):''}</p></section>
  <section class="card"><h2>${t('tips')}</h2><ul style="padding-left:20px;margin:10px 0 0">`+(de?
   `<li style="margin-bottom:8px">Vorher eine Maschenprobe stricken: 21 Maschen x 32 Reihen glatt rechts = 10 x 10 cm. Die Nadelstärke ist nur ein Vorschlag.</li><li style="margin-bottom:8px">Das Top beim Stricken immer wieder anprobieren – so lässt sich die Passform anpassen, z. B. die Länge des Körpers.</li><li>Regelmäßig die Maschen zählen: Die Zahl hinter „danach … M auf der Nadel“ zeigt im Zähler, wie viele es sein sollten.</li>`:
   `<li style="margin-bottom:8px">Knit a gauge swatch first: 21 stitches x 32 rows stockinette = 10 x 10 cm. The needle size is only a suggestion.</li><li style="margin-bottom:8px">Try the top on as you go to adjust the fit, e.g. the body length.</li><li>Count your stitches regularly: the counter shows how many should be on the needle.</li>`)+
  `</ul></section>
  <section class="card"><h2>${de?'Videos zu den Techniken':'Technique videos'}</h2><ul style="padding-left:20px;margin:10px 0 0">${V.map(v=>`<li style="margin-bottom:6px"><a href="https://www.youtube.com/watch?v=${v[1]}" target="_blank" rel="noopener">${v[0]} ↗</a></li>`).join('')}</ul>
  <p class="mu sm">${de?'Anleitung: Córdoba Top von Alma Patterns. Nur für den privaten Gebrauch.':'Pattern: Córdoba Top by Alma Patterns. Personal use only.'}</p></section>`}
function gmRowOf(c,done){const de=DB.lang==='de';if(done)return de?`Alle ${c.total} Reihen und Runden fertig – das Top ist fertig!`:`All ${c.total} rows and rounds done – the top is finished!`;
  const r=c.R[S.row];return de?`Du strickst Reihe ${S.row+1} von ${c.total} · ${GMS.de[r.sec]}`:`Knitting row ${S.row+1} of ${c.total} · ${GMS.en[r.sec]}`}
