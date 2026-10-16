// ===== Anleitungen: Reihenpläne (Sophie Scarf, Weekend Scarf, Streifenschal), Berechnung und Anleitungstexte =====
// ---------- Reihenplan ----------
const tplDef=k=>k==='sophie'?DEFS:k==='weekend'?DEFW:DEFST;
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
  const sop=S.tpl==='sophie',wk=S.tpl==='weekend',z=sop?SZ[S.size]:wk?WZ[S.size]||WZ.big:null,g=sop?{sts:22,rows:42}:{sts:S.sts,rows:S.rows};
  let R;
  if(sop)R=sophiePlan(z);else if(wk)R=weekendPlan(z);
  else{const cast=Math.max(2,Math.round(S.w*S.sts/20)*2),tot=Math.max(1,Math.round(S.l*S.rows/10));R=Array.from({length:tot},(_,i)=>({n:cast,sec:'body',k:'body',ws:i%2===1}))}
  const total=R.length,segs=[];let pos=0,i=0;
  if(wk){while(pos<total){const w=pos<z.half?2:6,ix=i%2,s=S.stripes[ix]||S.stripes[0];const n=Math.min(w,total-pos);segs.push({s,idx:ix,a:pos+1,b:pos+n,n});pos+=n;i++}}
  else while(pos<total){const s=S.stripes[i%S.stripes.length];const n=Math.min(Math.max(1,s.r),total-pos);segs.push({s,idx:i%S.stripes.length,a:pos+1,b:pos+n,n});pos+=n;i++}
  const by=(wk?S.stripes.slice(0,2):S.stripes).map(s=>({s,rows:0,st:0}));
  segs.forEach(q=>{by[q.idx].rows+=q.n;for(let r=q.a-1;r<q.b;r++)by[q.idx].st+=R[r].n});
  const stTot=by.reduce((a,x)=>a+x.st,0)||1,totM=sop?z.g/25*115:wk?2*z.g/100*119:0,perSt=(10/g.sts)*(S.tech==='crochet'?5.2:4.2)/100*1.1;
  by.forEach(x=>{x.m=sop||wk?totM*x.st/stTot:x.st*perSt;x.balls=x.rows?Math.ceil(x.m/Math.max(1,S.mpb)):0});
  return{sop,wk,z,g,R,total,cast:R[0].n,maxN:Math.max(...R.map(r=>r.n)),stTot,segs,by,totM,len:sop?z.len:S.l};
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
