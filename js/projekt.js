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

function vSize(){
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
