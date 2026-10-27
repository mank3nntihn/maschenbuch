// ===== Projekt: Wollbedarf, Maße und Farben =====
const norm=s=>String(s).trim().toLowerCase();
function haveM(name){return DB.stash.filter(y=>norm(y.n)===norm(name)).reduce((a,y)=>a+y.b*y.m,0)}
function vWool(){
  const c=calc(),tm=c.by.reduce((a,x)=>a+x.m,0),tb=c.by.reduce((a,x)=>a+x.balls,0);let miss=0;
  const rows=c.by.map(x=>{const h=haveM(x.s.n),mb=Math.ceil(Math.max(0,x.m-h)/Math.max(1,S.mpb));if(x.rows)miss+=mb;
    const hb=Math.floor(h/Math.max(1,S.mpb)*10)/10;
    return `<div class="row"><span class="sw" style="background:${esc(x.s.c)}"></span><span class="g">${esc(x.s.n)}<br><span class="mu">${x.rows} ${t('rows')} · ${t('inStash')(fmt(hb))}</span></span><span class="v">${Math.round(x.m)} m<br><b>${x.balls} ${t('balls')}</b><br>${x.rows?(mb?`<span class="warn">${t('missing')(mb)}</span>`:`<span class="okc">${t('enough')}</span>`):''}</span></div>`}).join('');
  return `<section class="card"><h2>${t('wool')}</h2>${rows}
  ${c.by.length>1?`<div class="row"><span class="g"><b>${t('total')}</b></span><span class="v">${Math.round(tm)} m<br><b>${tb} ${t('balls')}</b></span></div>`:''}
  <p class="mu">${c.gm?(DB.lang==='de'?`Laut Anleitung ca. ${c.z.m} m für Größe ${c.z.size.toUpperCase()}, berechnet mit ${S.mpb} m pro Knäuel.`:`About ${c.z.m} m for size ${c.z.size.toUpperCase()} according to the pattern, calculated at ${S.mpb} m per ball.`):c.wk?(DB.lang==='de'?`Laut Anleitung ca. ${c.z.g} g Chunky-Garn je Farbe (${c.z.yd} yards ≈ ${Math.round(c.z.yd*.9144)} m), berechnet mit ${S.mpb} m pro Knäuel. Im Original: Berroco Vintage Chunky (100 g = 119 m), also ${c.z.g/100} Knäuel je Farbe.`:`The pattern calls for about ${c.z.g} g / ${c.z.yd} yards of chunky yarn per colour, calculated at ${S.mpb} m per ball. Original: Berroco Vintage Chunky (100 g = 119 m), ${c.z.g/100} skeins per colour.`):c.sop?t('woolNoteS')(c.z.g,Math.round(c.totM),S.mpb):t('woolNote')(S.mpb)}</p>
  ${c.sop?`<p class="mu sm">${t('woolAlt')(c.z)}</p>`:''}
  ${c.gm?gmWoolNote(c):''}
  ${miss?`<button class="pri" onclick="missingToShop()">${t('toShop')}</button>`:''}</section>`;
}
function missingToShop(){
  const c=calc();let n=0;
  c.by.forEach(x=>{if(!x.rows)return;const mb=Math.ceil(Math.max(0,x.m-haveM(x.s.n))/Math.max(1,S.mpb));if(!mb)return;
    const e=DB.shop.find(i=>norm(i.n)===norm(x.s.n)&&!i.d);if(e)e.q=Math.max(e.q,mb);else DB.shop.push({n:x.s.n,c:x.s.c,q:mb,d:false});n++});
  save();toast(n?t('added'):t('nothing'));
}

// Maße-Tab: Grundeinstellungen der Vorlage, darunter die passenden Werkzeuge (siehe TOOLS)
function vSize(){return vSizeBase()+(hasTool('raglan')?RAG.html():'')}
function vSizeBase(){
  const sop=S.tpl==='sophie';
  const n=(k,l,min)=>`<div><label>${l}</label><input type="number" inputmode="decimal" min="${min}" value="${S[k]}" oninput="setN('${k}',this.value)"></div>`;
  const needle=`<label>${S.tech==='crochet'&&!sop?t('hookK'):t('needleK')}</label>
  <select onchange="S.needle=parseFloat(this.value);save();render()">${NEEDLES.map(v=>`<option value="${v}" ${v===S.needle?'selected':''}>${fmt(v)} mm</option>`).join('')}</select>
  <p class="mu sm">${sop?t('needleNoteS'):t('needleNote')}</p>`;
  const colors=`<section class="card"><h2>${t('stripes')}</h2><p class="mu">${sop?t('stripesNoteS'):t('stripesNote')}</p><div id="sl">${stripeList()}</div>
  <button class="ghost" onclick="S.stripes.push({n:t('newColor'),c:'#c9b8ef',r:${sop?40:12}});save();render()">${t('addStripe')}</button>
  <button class="ghost" onclick="ask(t('resetAllQ')).then(ok=>{if(ok){UNDO.snapP();const nm=S.name;Object.assign(S,clone(S.tpl==='sophie'?DEFS:S.tpl==='cordoba'?DEFC:DEFST),{name:nm});save();render()}})">${t('resetAll')}</button></section>`;
  if(S.tpl==='cordoba')return vSizeCordoba(needle,colors);
  if(S.tpl==='weekend'){const de=DB.lang==='de',z=WZ[S.size]||WZ.big;
    return `<section class="card"><h2>${t('size')}</h2>
    <div class="seg" style="margin-top:10px"><button class="${S.size==='big'?'on':''}" onclick="setWSize('big')">${de?'Groß (Erwachsene)':'Big (adults)'}</button><button class="${S.size==='little'?'on':''}" onclick="setWSize('little')">${de?'Klein (Kinder)':'Little (kids)'}</button></div>
    <p class="mu">${de?`ca. ${z.wid} cm breit und ${z.len} cm lang (entspannt), ${z.cast} Maschen, ${2*z.half} Reihen. „Es ist ein Schal, er darf so lang werden, wie du willst.“`:`about ${z.wid} cm wide and ${z.len} cm long (relaxed), ${z.cast} stitches, ${2*z.half} rows.`}</p>
    <label>${t('gauge')}</label><p style="margin:0">${de?'16 Maschen x 10 Reihen 2x2-Rippen = 5 x 5 cm (entspannt)':'16 stitches x 10 rows 2x2 rib = 2 x 2 in (relaxed)'}</p>
    ${needle}<label>${t('mpb')}</label><input type="number" inputmode="decimal" min="10" value="${S.mpb}" oninput="setN('mpb',this.value)"></section>
    <section class="card"><h2>${t('stripes')}</h2><p class="mu">${de?'Farbe A beginnt, Farbe B endet jeden Teil. Erst dünne Streifen (2 Reihen), dann dicke Streifen (6 Reihen).':'Colour A starts, colour B ends each half. Skinny stripes (2 rows) first, then chunky stripes (6 rows).'}</p>
    ${S.stripes.slice(0,2).map((x,i)=>`<div class="sr one">${swb('s',i,x.c)}<input type="text" id="sn${i}" value="${esc(x.n)}" oninput="setS(${i},'n',this.value)" aria-label="${t('name')}"><b style="text-align:center">${i?'B':'A'}</b></div>`).join('')}
    <button class="ghost" onclick="ask(t('resetAllQ')).then(ok=>{if(ok){UNDO.snapP();const nm=S.name;Object.assign(S,clone(DEFW),{name:nm,id:S.id});save();render()}})">${t('resetAll')}</button></section>`}
  if(sop)return `<section class="card"><h2>${t('size')}</h2>
  <div class="seg" style="margin-top:10px"><button class="${S.size==='s'?'on':''}" onclick="setSize('s')">${t('small')}</button><button class="${S.size==='l'?'on':''}" onclick="setSize('l')">${t('large')}</button></div>
  <p class="mu">${t('sizeInfo')(SZ[S.size])}</p>
  <label>${t('gauge')}</label><p style="margin:0">${t('gaugeS')}</p>
  ${needle}<label>${t('mpb')}</label><input type="number" inputmode="decimal" min="10" value="${S.mpb}" oninput="setN('mpb',this.value)"></section>${colors}`;
  return `<section class="card"><h2>${t('tech')}</h2>
  <div class="seg" style="margin-top:10px"><button class="${S.tech==='knit'?'on':''}" onclick="setTech('knit')">${t('knit')}</button><button class="${S.tech==='crochet'?'on':''}" onclick="setTech('crochet')">${t('crochet')}</button></div>
  ${needle}
  <div class="two">${n('w',t('width'),5)}${n('l',t('length'),10)}${n('sts',t('sts'),5)}${n('rows',t('rowsP'),5)}</div>
  <label>${t('mpb')}</label><input type="number" inputmode="decimal" min="10" value="${S.mpb}" oninput="setN('mpb',this.value)"></section>${colors}`;
}
function stripeList(){const one=S.stripes.length===1;return S.stripes.map((s,i)=>`<div class="sr ${one?'one':''}">${swb('s',i,s.c)}<input type="text" id="sn${i}" value="${esc(s.n)}" oninput="setS(${i},'n',this.value)" aria-label="${t('name')}">${one?'':`<input type="number" inputmode="numeric" min="1" value="${s.r}" oninput="setS(${i},'r',this.value)" aria-label="${t('rows')}">`}<button onclick="delS(${i})" aria-label="${t('del')}" ${one?'disabled':''}>✕</button></div>`).join('')}

function setN(k,v){S[k]=Math.max(1,parseFloat(v)||1);save()}
function setS(i,k,v){S.stripes[i][k]=k==='r'?Math.max(1,parseInt(v)||1):v;save()}
function delS(i){if(S.stripes.length<2)return;const s=clone(S.stripes[i]),id=S.id;S.stripes.splice(i,1);save();render();
  UNDO.show(DB.lang==='de'?'Farbe entfernt':'Colour removed',()=>{const p=byId(id);if(p)p.stripes.splice(i,0,s)})}
function setTech(x){S.tech=x;save();render()}
function setSize(x){S.size=x;save();render()}
function setWSize(x){const z=WZ[x];Object.assign(S,{size:x,w:z.wid,l:z.len});save();render()}

// ===== Córdoba Top: Größe, Körperlänge, Garn =====
function vSizeCordoba(needle,colors){const de=DB.lang==='de',c=calc(),z=c.z;
  return `<section class="card"><h2>${t('size')}</h2>
  <div class="seg szc" style="margin-top:10px">${CZ.map(k=>`<button class="${S.size===k?'on':''}" onclick="setCSize('${k}')">${k.toUpperCase()}</button>`).join('')}</div>
  <p class="mu">${de?`Für ca. ${z.bust} cm Brustumfang (eng anliegend). ${z.co} Maschen Anschlag, ${c.total} Reihen und Runden insgesamt, ca. ${z.m} m Garn.`:`For a bust of about ${z.bust} cm (close fitting). ${z.co} stitches cast on, ${c.total} rows and rounds in total, about ${z.m} m of yarn.`}</p>
  <label>${de?'Körperlänge ab Achsel (cm)':'Body length from underarm (cm)'}</label><input type="number" inputmode="decimal" min="5" max="80" value="${S.l}" onchange="setN('l',this.value);render()">
  <p class="mu sm">${de?`Laut Anleitung ${z.len} cm für Größe ${z.size.toUpperCase()}. Daraus ergeben sich ${z.B} Runden für den Körper.`:`The pattern says ${z.len} cm for size ${z.size.toUpperCase()}, which makes ${z.B} rounds for the body.`}</p>
  <label>${t('gauge')}</label><p style="margin:0">${de?'21 Maschen x 32 Reihen glatt rechts = 10 x 10 cm':'21 stitches x 32 rows stockinette = 10 x 10 cm'}</p>
  ${needle}<label>${t('mpb')}</label><input type="number" inputmode="decimal" min="10" value="${S.mpb}" oninput="setN('mpb',this.value)"></section>${colors}`}
// Größe wechseln: Körperlänge auf den Wert der Anleitung setzen
function setCSize(k){const i=CZ.indexOf(k);if(i<0)return;Object.assign(S,{size:k,l:CD.len[i]});save();render()}
function gmWoolNote(c){const de=DB.lang==='de',z=c.z;
  return `<p class="mu sm">${de?'Garnvorschläge aus der Anleitung':'Yarn suggestions from the pattern'} (${z.size.toUpperCase()}): ${z.div} g Divina (Lang Yarns, 50 g = 140 m) · ${z.ani} g Anina (Filcolana, 50 g = 210 m) · ${z.org} g Organic Trio (Hjertegarn, 50 g = 230 m)</p>`}

// ===== Raglan-Rechner (Raglan von oben): Anschlag aus Halsausschnitt und Maschenprobe, Verteilung auf Rücken, Vorderteil, Ärmel, Raglanlinien =====
// Übliche RVO-Regel: Anschlag − 4 Raglanlinien, Rest: je 1/3 Vorder- und Rückteil, je 1/6 pro Ärmel. Mit Oberweite: Zunahmerunden bis zur Ärmelteilung.
const RAG={
  // Startwerte aus dem Projekt: Halsausschnitt = Anschlag / Maschenprobe (beim Córdoba Top 128 M ≈ 61 cm)
  get(){if(!S.rg){const g=S.sts||20;S.rg={neck:Math.round(calc().cast/(g/10)),g20:+(200/g).toFixed(1),rl:1,typ:'pulli',chest:''}}return S.rg},
  calc(r){const pc=20/Math.max(.1,+r.g20||10),tot=Math.max(8,Math.round((+r.neck||0)*pc)),rest=tot-4*r.rl,sl=Math.round(rest/6),body=rest-2*sl,back=Math.ceil(body/2),front=body-back;
    const o={pc,tot,sl,back,front,fl:Math.floor(front/2),fr:front-Math.floor(front/2)};
    if(+r.chest>0){const half=Math.round(+r.chest*pc/2);o.rounds=Math.max(0,Math.ceil((half-back)/2));o.half=half;if(S.rows)o.cm=Math.round(o.rounds*2/(S.rows/10))}
    return o},
  html(){const de=DB.lang==='de',r=this.get(),M=ab(de?'M':'st');
    const inp=(k,l,min,step)=>`<div><label>${l}</label><input type="number" inputmode="decimal" min="${min}" step="${step}" value="${esc(r[k])}" oninput="RAG.set('${k}',this.value)"></div>`;
    return `<section class="card rag"><h2>${de?'Raglan-Rechner':'Raglan calculator'}</h2>
    <p class="mu sm">${de?'Für ein Oberteil von oben mit Raglan: berechnet den Anschlag und wie er sich auf Rücken, Vorderteil, Ärmel und Raglanlinien verteilt.':'For a top-down raglan: works out the cast-on and how it splits into back, front, sleeves and raglan lines.'}</p>
    <div class="two">${inp('neck',de?'Halsausschnitt (cm)':'Neckline (cm)',10,1)}${inp('g20',de?'20 Maschen sind … cm':'20 stitches measure … cm',2,.1)}</div>
    <div class="two"><div><label>${de?'Maschen je Raglanlinie':'Stitches per raglan line'}</label><select onchange="RAG.set('rl',this.value)">${[1,2,3,4].map(v=>`<option ${+r.rl===v?'selected':''}>${v}</option>`).join('')}</select></div>
      ${inp('chest',de?'Oberweite des Teils (cm, optional)':'Finished chest (cm, optional)',0,1)}</div>
    <div class="seg" style="margin-top:12px"><button class="${r.typ==='pulli'?'on':''}" onclick="RAG.set('typ','pulli');render()">${de?'Pullover / Top':'Pullover / top'}</button><button class="${r.typ==='jacke'?'on':''}" onclick="RAG.set('typ','jacke');render()">${de?'Jacke (vorne offen)':'Cardigan (open front)'}</button></div>
    <div id="rgout">${this.out()}</div></section>`},
  out(){const de=DB.lang==='de',r=this.get(),o=this.calc(r),M=ab(de?'M':'st'),R=+r.rl,jk=r.typ==='jacke';
    const parts=jk?[[de?'Vorderteil links':'Left front',o.fl],['Raglan',R],[de?'Ärmel':'Sleeve',o.sl],['Raglan',R],[de?'Rücken':'Back',o.back],['Raglan',R],[de?'Ärmel':'Sleeve',o.sl],['Raglan',R],[de?'Vorderteil rechts':'Right front',o.fr]]
      :[[de?'Rücken':'Back',o.back],['Raglan',R],[de?'Ärmel':'Sleeve',o.sl],['Raglan',R],[de?'Vorderteil':'Front',o.front],['Raglan',R],[de?'Ärmel':'Sleeve',o.sl],['Raglan',R]];
    let h=`<div class="rgres"><div class="rgt"><b>${o.tot}</b> ${M} ${de?'anschlagen':'cast on'}</div><ol class="rgl">${parts.map(([n,v])=>`<li class="${n==='Raglan'?'rr':''}"><span>${n}</span><b>${v}</b></li>`).join('')}</ol>
      <p class="mu sm">${de?(jk?'In Reihen hin und her, Beginn am linken Vorderteil.':'In Runden, Beginn am Rücken (hintere Mitte oder linke Raglanlinie).'):(jk?'Worked flat, starting at the left front.':'Worked in the round, starting at the back.')} ${de?`Zunahmen: in jeder Zunahmerunde vor und nach jeder Raglanlinie 1 ${M} zunehmen (+8 ${M}).`:`Increase 1 ${M} before and after every raglan line in each increase round (+8 ${M}).`}</p>`;
    if(o.rounds!=null)h+=`<p class="rgz">${de?`Für ${esc(r.chest)} cm Oberweite braucht ${jk?'der Rücken':'jedes Teil'} ca. ${o.half} ${M}: <b>${o.rounds} Zunahmerunden</b> (meist jede 2. Runde)${o.cm!=null?`, Passe ca. <b>${o.cm} cm</b> tief`:''}. Danach Ärmel stilllegen.`:`For a ${esc(r.chest)} cm chest each half needs about ${o.half} ${M}: <b>${o.rounds} increase rounds</b> (usually every other round)${o.cm!=null?`, yoke about <b>${o.cm} cm</b> deep`:''}. Then put the sleeves on hold.`}</p>`;
    if(S.tpl==='cordoba'){const z=cordobaZ();h+=`<p class="mu sm">${de?`Zum Vergleich die Córdoba-Anleitung (${z.size.toUpperCase()}): ${z.co} ${M}, vorne geteilt ${z.a+1} + ${z.d}, Ärmel ${z.b}, Rücken ${z.c}, Raglan je 1. Die Anleitung bleibt maßgeblich – der Rechner hilft bei eigenen Abwandlungen.`:`For comparison, the Córdoba pattern (${z.size.toUpperCase()}): ${z.co} ${M}, split front ${z.a+1} + ${z.d}, sleeves ${z.b}, back ${z.c}, raglan 1 each. Follow the pattern – the calculator helps with your own variations.`}</p>`}
    return h+'</div>'},
  set(k,v){const r=this.get();r[k]=k==='typ'?v:k==='rl'?+v:v;save();const e=$('rgout');if(e)e.innerHTML=this.out()}
};
