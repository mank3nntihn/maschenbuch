// ===== Garnlager, Einkaufsliste und Hobbii-Garnauswahl =====
function vStash(){
  const ndOpt=v=>NEEDLES.map(x=>`<option value="${x}" ${x===v?'selected':''}>${fmt(x)}</option>`).join('');
  return `<section class="card"><h2>${t('stash')}</h2><p class="mu">${t('stashNote')}</p>
  ${DB.stash.length?DB.stash.map((y,i)=>`<div class="yr">${swb('y',i,y.c)}<input type="text" value="${esc(y.n)}" oninput="setY(${i},'n',this.value)" aria-label="${t('name')}"><button onclick="yToShop(${i})" aria-label="${t('shop')}">🛒</button>${TB.btn(i)}
    <div class="two"><div><label>${t('balls')}</label><input type="number" inputmode="decimal" min="0" step="0.5" value="${y.b}" oninput="setY(${i},'b',this.value)"></div><div><label>${t('m')}</label><input type="number" inputmode="numeric" min="1" value="${y.m}" oninput="setY(${i},'m',this.value)"></div><div><label>${t('nd')}</label><select onchange="setY(${i},'nd',this.value)">${ndOpt(y.nd)}</select></div></div>
    <button class="ghost" style="grid-column:1/-1;margin-top:0" onclick="delY(${i})">${t('del')}</button></div>`).join(''):`<p class="mu">${t('stashEmpty')}</p>`}
  <button class="pri" onclick="DB.stash.push({n:t('newColor'),c:'#c9b8ef',b:1,m:${S.mpb},nd:${S.needle}});save();render()">${t('addYarn')}</button></section>`;
}
function setY(i,k,v){const y=DB.stash[i];y[k]=k==='b'?Math.max(0,parseFloat(v)||0):k==='m'?Math.max(1,parseFloat(v)||1):k==='nd'?parseFloat(v):v;if(k==='m'&&y.u){DB.mpbMem=DB.mpbMem||{};DB.mpbMem[y.u]=y.m}save()}
function yToShop(i){const y=DB.stash[i];const e=DB.shop.find(s=>norm(s.n)===norm(y.n)&&!s.d);if(e)e.q++;else DB.shop.push({n:y.n,c:y.c,q:1,d:false,...(y.p?{p:y.p,u:y.u,sku:y.sku}:{})});save();toast(t('added'))}

function delY(i){const y=DB.stash[i];if(!y)return;DB.stash.splice(i,1);save();render();
  UNDO.show(DB.lang==='de'?`„${y.n}“ gelöscht`:`“${y.n}” deleted`,()=>DB.stash.splice(Math.min(i,DB.stash.length),0,y))}

// Hinweis auf der Einkaufsliste, wenn ein Hobbii-Garn gerade reduziert oder ausverkauft ist (Daten: garne.json, täglich)
const nowP=s=>{const f=PK.match(s);return f?f.preis:s.p};// aktueller Hobbii-Preis, sonst der beim Hinzufügen
function shopHint(s){const f=PK.match(s),de=DB.lang==='de';if(!f||s.d)return '';
  if(!f.verfuegbar)return `<br><small class="warn">${de?'gerade ausverkauft':'sold out'}</small>`;
  return f.vorher?`<br><small class="rab">🏷️ −${PK.rab(f)} % · ${eur(f.preis)}</small>`:''}
function vShop(){
  const any=DB.shop.some(i=>i.d),de=DB.lang==='de';
  if(!PK.data&&DB.shop.some(s=>s.u))PK.load().then(()=>{if(tab==='shop')render()}).catch(()=>{});
  const sale=DB.shop.filter(s=>!s.d&&(PK.match(s)||{}).vorher).length;
  return `<section class="card"><h2>${t('shop')}</h2>${sale?`<p class="rabh">🏷️ ${de?(sale===1?'1 Garn auf deiner Liste ist gerade bei Hobbii reduziert.':`${sale} Garne auf deiner Liste sind gerade bei Hobbii reduziert.`):(sale===1?'1 yarn on your list is on sale at Hobbii.':`${sale} yarns on your list are on sale at Hobbii.`)}</p>`:''}
  ${DB.shop.length?DB.shop.map((s,i)=>`<div class="row"><input type="checkbox" ${s.d?'checked':''} onchange="DB.shop[${i}].d=this.checked;save();render()" aria-label="${esc(s.n)}"><span class="sw" style="background:${esc(s.c)}"></span><span class="g" style="${s.d?'text-decoration:line-through;color:var(--mu)':''}">${esc(s.n)}</span><span class="v">${s.q} ${t('balls')}${s.p?`<br><small class="mu">${eur(nowP(s)*s.q)}</small>`:''}${shopHint(s)}</span>${s.u?`<a class="lk" href="${esc(s.u)}" target="_blank" rel="noopener" aria-label="Hobbii">↗</a>`:''}</div>`).join('')+(DB.shop.some(s=>s.p&&!s.d)?`<p class="mu" style="text-align:right">${DB.lang==='de'?'Summe Hobbii-Garne':'Total Hobbii yarn'}: <b>${eur(DB.shop.filter(s=>s.p&&!s.d).reduce((a,s)=>a+nowP(s)*s.q,0))}</b></p>`:''):`<p class="mu">${t('shopEmpty')}</p>`}
  ${any?`<button class="pri" onclick="boughtToStash()">${t('boughtToStash')}</button><button class="ghost" onclick="clearShop()">${t('clearDone')}</button>`:''}</section>
  <section class="card"><div class="sr" style="grid-template-columns:48px 1fr 72px">${swb('n',0,NEWSHOP.c)}<input type="text" id="nn" placeholder="${t('what')}"><input type="number" id="nq" inputmode="numeric" min="1" value="1" aria-label="${t('qty')}"></div>
  <button class="pri" onclick="addShop()">${t('addItem')}</button></section>`;
}
function addShop(){const n=$('nn').value.trim();if(!n)return $('nn').focus();const q=Math.max(1,parseInt($('nq').value)||1),x=NEWSHOP.g&&norm(NEWSHOP.g.n)===norm(n)?NEWSHOP.g:null;DB.shop.push({n,c:NEWSHOP.c,q,d:false,...(x?{p:x.p,u:x.u,m:x.m,sku:x.sku}:{})});NEWSHOP={c:'#f4a6c6'};save();render()}
function clearShop(){const old=clone(DB.shop);DB.shop=DB.shop.filter(i=>!i.d);save();render();
  UNDO.show(DB.lang==='de'?'Abgehakte gelöscht':'Checked items deleted',()=>{DB.shop=old})}
function boughtToStash(){const a=clone(DB.stash),b=clone(DB.shop);DB.shop.filter(i=>i.d).forEach(i=>{const y=DB.stash.find(s=>norm(s.n)===norm(i.n));if(y)y.b+=i.q;else DB.stash.push({n:i.n,c:i.c,b:i.q,m:i.m||S.mpb,nd:S.needle,...(i.p?{p:i.p,u:i.u,sku:i.sku}:{})})});DB.shop=DB.shop.filter(i=>!i.d);save();render();UNDO.show(t('moved'),()=>{DB.stash=a;DB.shop=b})}

// ===== Hobbii-Garnauswahl (Daten aus garne.json) =====
let NEWSHOP={c:'#f4a6c6'};
const eur=v=>v.toLocaleString(DB.lang==='de'?'de-DE':'en-GB',{style:'currency',currency:'EUR'});
function swb(k,i,c){return `<button class="swb" style="background:${esc(c)}" onclick="PK.open('${k}',${i})" aria-label="${DB.lang==='de'?'Farbe wählen':'Choose colour'}"></button>`}
const PK={
  data:null,loading:null,k:null,i:0,garn:null,q:'',mode:'hobbii',
  f:{sale:false,lief:false,nadel:false}, // Filter: im Angebot, lieferbar, passt zur Nadel des Projekts
  rab(f){return f.vorher?Math.round((1-f.preis/f.vorher)*100):0},
  maxRab(g){return Math.max(0,...g.farben.map(f=>this.rab(f)))},
  nadelPasst(g){const m=String(g.nadel_mm||'').replace(/,/g,'.').match(/(\d+(?:\.\d+)?)(?:\s*[-–]\s*(\d+(?:\.\d+)?))?/);if(!m)return false;
    const a=+m[1],b=+(m[2]||m[1]);return S.needle>=a-.25&&S.needle<=b+.25},
  farbOk(f){return(!this.f.sale||f.vorher)&&(!this.f.lief||f.verfuegbar)},
  garnOk(g){return g.farben.some(f=>this.farbOk(f))&&(!this.f.nadel||this.nadelPasst(g))},
  // Passende Hobbii-Farbe zu einem Eintrag der Einkaufsliste (für Angebote und "ausverkauft")
  match(s){if(!this.data||!s.u)return null;for(const g of this.data){if(s.sku){const f=g.farben.find(f=>f.sku===s.sku);if(f)return f;continue}
    if(g.url!==s.u)continue;const f=g.farben.find(f=>String(s.n).endsWith(' – '+f.name));if(f)return f}return null},
  chip(k,label){return `<button class="chip ${this.f[k]?'on':''}" aria-pressed="${this.f[k]}" onclick="PK.f.${k}=!PK.f.${k};PK.drawBody()">${label}</button>`},
  load(){
    if(this.data)return Promise.resolve(this.data);
    if(!this.loading)this.loading=fetch('garne.json').then(r=>{if(!r.ok)throw new Error(r.status);return r.json()})
      .then(j=>{this.data=j.garne.filter(g=>g.farben.length);this.stand=j.stand;return this.data})
      .catch(e=>{this.loading=null;throw e});
    return this.loading;
  },
  cur(){return this.k==='s'?S.stripes[this.i]:this.k==='y'?DB.stash[this.i]:NEWSHOP},
  open(k,i){this.k=k;this.i=i;this.garn=null;this.q='';this.mode='hobbii';
    let el=$('pk');if(!el){el=document.createElement('div');el.id='pk';el.className='pk';el.onclick=e=>{if(e.target===el)PK.close()};document.body.appendChild(el)}
    el.hidden=false;document.body.style.overflow='hidden';this.draw();
    this.load().then(()=>{if(this.mode==='hobbii')this.drawBody()}).catch(()=>{if(this.mode==='hobbii')$('pkb').innerHTML=`<p class="warn">${DB.lang==='de'?'Die Garnliste konnte gerade nicht geladen werden. Öffne das Maschenbuch einmal mit Internet, danach geht es auch offline.':'The yarn list could not be loaded. Open Maschenbuch once while online, then it also works offline.'}</p>`});
  },
  close(){const el=$('pk');if(el)el.hidden=true;document.body.style.overflow=''},
  draw(){const de=DB.lang==='de',c=this.cur();
    $('pk').innerHTML=`<div role="dialog" aria-modal="true"><div class="ph">${this.garn&&this.mode==='hobbii'?`<button onclick="PK.garn=null;PK.draw()" aria-label="${de?'Zurück':'Back'}">‹</button>`:''}<h2>${this.garn&&this.mode==='hobbii'?esc(this.garn.name):de?'Farbe wählen':'Choose colour'}</h2><button onclick="PK.close()" aria-label="${t('close')}">✕</button></div>
    ${this.garn?'':`<div class="tabs"><button class="${this.mode==='hobbii'?'on':''}" onclick="PK.mode='hobbii';PK.draw()">Hobbii-Garne</button><button class="${this.mode==='own'?'on':''}" onclick="PK.mode='own';PK.draw()">${de?'Eigene Farbe':'Custom colour'}</button></div>`}
    ${this.mode==='hobbii'&&!this.garn?`<input type="search" id="pkq" value="${esc(this.q)}" placeholder="${de?'Garn, Marke oder Farbe suchen …':'Search yarn, brand or colour …'}" oninput="PK.q=this.value;PK.drawBody()">`:''}
    ${this.mode==='hobbii'&&!this.garn?'<div class="chips" id="pkf"></div>':''}
    <div class="bd" id="pkb"></div></div>`;
    if(this.mode==='own'){$('pkb').innerHTML=`<div class="own"><input type="color" id="pkc" value="${esc(c.c)}"><span class="mu">${de?'Freie Farbe ohne Hobbii-Daten':'Free colour without Hobbii data'}</span></div><button class="pri" onclick="PK.apply({c:$('pkc').value})">${de?'Übernehmen':'Apply'}</button>`;return}
    this.drawBody();
  },
  drawBody(){const b=$('pkb');if(!b)return;const de=DB.lang==='de';
    if(!this.data){b.innerHTML=`<p class="mu">${de?'Lade Garne …':'Loading yarns …'}</p>`;return}
    const fl=$('pkf');if(fl)fl.innerHTML=this.chip('sale',`🏷️ ${de?'Im Angebot':'On sale'} (${this.data.filter(g=>g.farben.some(f=>f.vorher)).length})`)+this.chip('lief',de?'Lieferbar':'In stock')+this.chip('nadel',`🪡 ${de?'Passt zu':'Fits'} ${fmt(S.needle)} mm`);
    if(this.garn){const g=this.garn,mm=(DB.mpbMem||{})[g.url],info=[g.marke,!g.lauflaenge_m&&mm?`${mm} m (${de?'selbst eingetragen':'entered by you'})`:'',g.lauflaenge_m&&g.knaeuel_g?`${g.knaeuel_g} g = ${g.lauflaenge_m} m`:g.lauflaenge_m?`${g.lauflaenge_m} m`:'',g.nadel_mm?`${de?'Nadel':'Needle'} ${g.nadel_mm} mm`:'',g.material].filter(Boolean).join(' · ');
      b.innerHTML=`<p class="info">${esc(info)} · <a href="${esc(g.url)}" target="_blank" rel="noopener">hobbii.de ↗</a></p>${g.farben.some(f=>!this.farbOk(f))?`<p class="info">${de?`${g.farben.filter(f=>this.farbOk(f)).length} von ${g.farben.length} Farben (Filter aktiv)`:`${g.farben.filter(f=>this.farbOk(f)).length} of ${g.farben.length} colours (filter on)`} · <a href="#" onclick="event.preventDefault();PK.f.sale=PK.f.lief=false;PK.drawBody()">${de?'alle zeigen':'show all'}</a></p>`:''}<div class="fg">${g.farben.map((f,j)=>!this.farbOk(f)?'':`<button class="fc ${f.verfuegbar?'':'na'}" onclick="PK.pick(${j})" title="${esc(f.name)}">${f.vorher?`<b class="rab">−${this.rab(f)} %</b>`:''}${f.bild?`<img loading="lazy" onerror="this.removeAttribute('src')" src="${esc(img(f.bild,160))}" alt="" style="background:${esc(f.hex||'#eee')}">`:`<i style="background:${esc(f.hex||'#ddd')}"></i>`}${esc(f.name)}<small class="mu">${f.vorher?`<s>${eur(f.vorher)}</s> `:''}${eur(f.preis)}${f.verfuegbar?'':de?' · ausverkauft':' · sold out'}</small></button>`).join('')}</div>`;return}
    const q=norm(this.q);let L=this.data.filter(g=>this.garnOk(g)&&(!q||norm(g.name+' '+g.marke).includes(q)||g.farben.some(f=>norm(f.name).includes(q))));
    if(this.f.sale)L=L.sort((a,b)=>this.maxRab(b)-this.maxRab(a));L=L.slice(0,80);
    b.innerHTML=L.length?L.map(g=>`<button class="gi" onclick="PK.garn=PK.data.find(x=>x.id===${g.id});PK.draw()"><span class="dots">${g.farben.slice(0,5).map(f=>`<i style="background:${esc(f.hex||'#ddd')}"></i>`).join('')}</span><span>${esc(g.name)}${this.maxRab(g)?` <b class="rab">${de?'bis':'up to'} −${this.maxRab(g)} %</b>`:''}<small>${esc(g.marke)} · ${g.farben.length} ${de?'Farben':'colours'} · ${de?'ab':'from'} ${eur(Math.min(...g.farben.map(f=>f.preis)))}</small></span>›</button>`).join('')
      :`<p class="mu">${de?'Nichts gefunden.':'Nothing found.'}${this.f.sale||this.f.lief||this.f.nadel?(de?' Vielleicht einen Filter ausschalten?':' Maybe turn off a filter?'):''}</p>`;
  },
  pick(j){const g=this.garn,f=g.farben[j];
    const nd=g.nadel_mm?parseFloat(g.nadel_mm.replace(',','.')):null;
    const base={n:`${g.name.replace(/\s*\(Limited Edition\)/i,"")} – ${f.name}`,c:f.hex||this.cur().c,p:f.preis,u:g.url,sku:f.sku,m:g.lauflaenge_m||(DB.mpbMem||{})[g.url]||null,nd:nd?NEEDLES.reduce((a,x)=>Math.abs(x-nd)<Math.abs(a-nd)?x:a):null};
    this.apply(base);
    if(f.bild)photoHex(f.bild).then(h=>{if(h&&this.lastTarget===base)this.apply({...base,c:h},true)}).catch(()=>{});
  },
  apply(o,quiet){const k=this.k,i=this.i;this.lastTarget=o;
    if(k==='s'){const s=S.stripes[i];if(!s)return;s.c=o.c;if(o.n)s.n=o.n}
    else if(k==='y'){const y=DB.stash[i];if(!y)return;y.c=o.c;if(o.n){y.n=o.n;y.p=o.p;y.u=o.u;y.sku=o.sku;if(o.m)y.m=o.m;if(o.nd)y.nd=o.nd}}
    else{NEWSHOP={c:o.c,...(o.n?{g:{n:o.n,p:o.p,u:o.u,m:o.m,sku:o.sku}}:{})}}
    save();
    if(!quiet){this.close();render();if(k==='n'&&o.n&&$('nn'))$('nn').value=o.n}
    else{const btn=document.querySelector(`.swb[onclick="PK.open('${k}',${i})"]`);if(btn)btn.style.background=o.c;if(tab==='3d'||(tab==='count'&&DB.live))render()}
  }
};
// Shopify-Bild in kleiner Größe anfordern
function img(u,w){return u+(u.includes('?')?'&':'?')+'width='+w}
// Mittlere Farbe aus dem Garnfoto (Mitte des Bildes, Glanzlichter und Schatten ignoriert)
const HEXC={};
function photoHex(u){if(HEXC[u])return Promise.resolve(HEXC[u]);
  return new Promise(res=>{const im=new Image();im.crossOrigin='anonymous';
    im.onload=()=>{try{const n=40,cv=document.createElement('canvas');cv.width=cv.height=n;const x=cv.getContext('2d',{willReadFrequently:true});x.drawImage(im,0,0,n,n);
      const d=x.getImageData(n*.25,n*.25,n*.5,n*.5).data,px=[];for(let k=0;k<d.length;k+=4){const l=d[k]*.3+d[k+1]*.59+d[k+2]*.11;px.push([l,d[k],d[k+1],d[k+2]])}
      px.sort((a,b)=>a[0]-b[0]);const m=px.slice(Math.floor(px.length*.15),Math.ceil(px.length*.85)),s=[0,0,0];m.forEach(p=>{s[0]+=p[1];s[1]+=p[2];s[2]+=p[3]});
      const h='#'+s.map(v=>Math.round(v/m.length).toString(16).padStart(2,'0')).join('');HEXC[u]=h;res(h)}catch(e){res(null)}};
    im.onerror=()=>res(null);im.src=img(u,64)})}
