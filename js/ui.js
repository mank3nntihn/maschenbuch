// ===== Oberfläche: Seitenaufbau, Menü, Startseite, Einstellungen, Dialoge, Rückgängig =====
function applyTheme(){const th=THEMES[DB.theme]||THEMES.rose,rs=document.documentElement.style;['bgg','gl','ac','ok','ln','fld'].forEach(k=>rs.setProperty('--'+k,th[k]));['sf','ink','mu','on'].forEach(k=>th[k]?rs.setProperty('--'+k,th[k]):rs.removeProperty('--'+k));document.documentElement.dataset.dark=th.dark?'1':'';document.querySelector('meta[name=theme-color]').content=th.ac;document.documentElement.lang=DB.lang}
const TABS=['count','steps','wool','3d','size'];
function render(){
  applyTheme();$('pop').hidden=true;
  const c=calc();S.row=Math.min(S.row,c.total);
  $('ttl').textContent=tab==='home'?'Maschenbuch':S.name;$('ttl').style.cursor='pointer';$('ttl').onclick=()=>{tab='home';render();scrollTo(0,0)};
  $('mb').setAttribute('aria-label',t('menu'));
  const M=DB.abbr?(DB.lang==='de'?'M':'st'):(DB.lang==='de'?'Maschen':'stitches');
  $('sub').textContent=c.wk?(DB.lang==='de'?`Stricken, 2x2-Rippen, ${S.size==='big'?'Groß':'Klein'} ${c.z.len} cm, ${c.cast} M, ${fmt(S.needle)} mm`:`Knitting, 2x2 rib, ${S.size==='big'?'big':'little'} ${c.z.len} cm, ${c.cast} st, ${fmt(S.needle)} mm`):c.sop?`${t('subS')}, ${S.size==='s'?t('small'):t('large')} ${c.z.len} cm, ${fmt(S.needle)} mm`:`${S.tech==='knit'?t('subK'):t('subC')}, ${S.w} x ${S.l} cm, ${c.cast} ${M}, ${fmt(S.needle)} mm`;
  if(tab==='home')$('sub').textContent=DB.lang==='de'?`${DB.projects.length} ${DB.projects.length===1?'Projekt':'Projekte'}`:`${DB.projects.length} project(s)`;
  V3.stop();LIVE.stop();FOC.stop();document.body.classList.toggle('focus',FOC.on);
  if(FOC.on){$('app').innerHTML=FOC.html();FOC.start();syncWake&&syncWake();return}
  const wide=tab==='count'&&DB.live;$('app').classList.toggle('wide',wide);document.querySelector('header').classList.toggle('wide',wide);
  stopHelp();
  $('app').innerHTML={impressum:vImpressum,tausch:vTausch,help:vHelp,home:vHome,count:vCount,steps:vSteps,wool:vWool,'3d':v3d,size:vSize,stash:vStash,shop:vShop,gloss:vGloss,settings:vSettings}[tab]();
  if(tab==='3d')V3.start();
  if(tab==='help')startHelp();
  syncWake();
  if(tab==='count'&&DB.live)LIVE.start();
  $('nav').innerHTML=TABS.map((k,i)=>`<button ${k===tab?'aria-current="page"':''} onclick="tab='${k}';render();scrollTo(0,0)">${t('tabs')[i]}</button>`).join('');
  if(menuOpen)renderMenu();
  SB.presence();
}
let POPP=null;
function popClose(){$('pop').hidden=true;if(POPP){POPP.stop();POPP=null}}
function showPop(a){const p=$('pop'),k=a.dataset.k,d=GL[DB.lang][k]||'';if(POPP){POPP.stop();POPP=null}
  p.innerHTML=`<b>${esc(a.textContent.replace(/\u2011/g,'-'))}</b><br>${esc(d)}${LEARN[k]?`<div class="lp mini"></div><button class="lk2" data-hk="${esc(k)}" onclick="helpGo(this.dataset.hk)">${DB.lang==='de'?'Ganze Erklärung ansehen':'See full explanation'}</button>`:''}`;p.hidden=false;
  if(LEARN[k])POPP=LearnPlayer(p.querySelector('.lp'),k,{mini:true});
  const rc=a.getBoundingClientRect();const x=Math.min(Math.max(12,rc.left),innerWidth-p.offsetWidth-12);let y=rc.bottom+8;
  if(y+p.offsetHeight>innerHeight-80)y=rc.top-p.offsetHeight-8;p.style.left=x+'px';p.style.top=Math.max(8,y)+'px'}
let popT=0;
document.addEventListener('mouseover',e=>{if(!matchMedia('(hover: hover)').matches)return;const a=e.target.closest('.ab');if(a){clearTimeout(popT);if($('pop').hidden||$('pop').dataset.k!==a.dataset.k){$('pop').dataset.k=a.dataset.k;showPop(a)}}
  else if(!e.target.closest('.pop')&&!$('pop').hidden){clearTimeout(popT);popT=setTimeout(()=>{popClose();$('pop').dataset.k=''},350)}});
document.addEventListener('click',e=>{
  const a=e.target.closest('.ab'),p=$('pop');
  if(a){$('pop').dataset.k=a.dataset.k;showPop(a);return}
  if(!e.target.closest('.pop'))popClose();
});
function helpGo(k){helpOpen=k;tab='help';popClose();render();scrollTo(0,0)}
addEventListener('scroll',()=>{$('pop').hidden=true},{passive:true});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){if(FOC.on&&!($('pk')&&!$('pk').hidden))return FOC.close();menu(0);$('pop').hidden=true}
  if(tab!=='count'||menuOpen||/INPUT|SELECT/.test(e.target.tagName))return;
  if(/^[0-9]$/.test(e.key)&&!e.metaKey&&!e.ctrlKey){e.preventDefault();jumpOpen(e.key);return}
  if(e.key==='ArrowRight'||e.key==='+'||e.key===' '){e.preventDefault();go(1)}
  if(e.key==='ArrowLeft'||e.key==='-'){go(-1)}
});

function vGloss(){const g=GL[DB.lang];return `<section class="card"><h2>${t('gloss')}</h2><p class="mu">${t('glossNote')}</p>${Object.keys(g).map(k=>`<div class="gr"><b>${esc(k)}</b><span>${esc(g[k])}</span></div>`).join('')}</section>`}

function vSettings(){
  return `<section class="card"><h2>${t('palette')}</h2>${Object.entries(THEMES).map(([k,v])=>`<button class="th ${DB.theme===k?'on':''}" onclick="DB.theme='${k}';save();render()"><i style="background:${v.bgg}"></i><span class="sw" style="background:${v.ac}"></span><span class="sw" style="background:${v.ok}"></span><span>${v[DB.lang]}</span></button>`).join('')}</section>
  <section class="card"><h2>${t('gloss')}</h2><button class="tg" role="switch" aria-checked="${DB.abbr}" onclick="DB.abbr=!DB.abbr;save();render()"><span>${t('abbrT')}</span><span class="kn"></span></button><p class="mu sm">${t('abbrNote')}</p></section>
  ${SB.settings()}<section class="card"><h2>Knit-Along</h2>
  <button class="tg" role="switch" aria-checked="${DB.kalShow!==false}" onclick="DB.kalShow=DB.kalShow===false;save();render()"><span>${DB.lang==='de'?'Fortschritt der anderen anzeigen':'Show friends’ progress'}</span><span class="kn"></span></button>
  <button class="tg" role="switch" aria-checked="${DB.kalShare!==false}" onclick="DB.kalShare=DB.kalShare===false;save();KAL.push(1);render()"><span>${DB.lang==='de'?'Meinen Fortschritt zeigen':'Share my progress'}</span><span class="kn"></span></button>
  <p class="mu sm">${DB.lang==='de'?'Aus: Du siehst nur dein eigenes Projekt bzw. die anderen sehen deinen Balken nicht.':'Off: you only see your own project, or others don’t see your bar.'}</p></section>
  <section class="card"><h2>${DB.lang==='de'?'Bildschirm':'Screen'}</h2><button class="tg" role="switch" aria-checked="${!!DB.wake}" onclick="setWake(!DB.wake)"><span>${DB.lang==='de'?'Bildschirm beim Zählen anlassen':'Keep screen on while counting'}</span><span class="kn"></span></button><p class="mu sm">${'wakeLock' in navigator?(DB.lang==='de'?'Gilt, solange der Zähler-Tab offen ist.':'Active while the counter tab is open.'):`<span class="warn">${DB.lang==='de'?'Dieser Browser erlaubt das leider nicht. Auf dem iPhone geht es ab iOS 16.4.':'This browser does not support it (iPhone: iOS 16.4 or later).'}</span>`}</p></section>
  <section class="card"><h2>${t('lang')}</h2><div class="seg" style="margin-top:10px"><button class="${DB.lang==='de'?'on':''}" onclick="setLang('de')">Deutsch</button><button class="${DB.lang==='en'?'on':''}" onclick="setLang('en')">English</button></div></section>`;
}
function setLang(l){DB.lang=l;save();render()}

function menu(o){menuOpen=!!o;$('ov').hidden=!menuOpen;$('side').classList.toggle('open',menuOpen);$('side').setAttribute('aria-hidden',!menuOpen);if(menuOpen)renderMenu()}
function renderMenu(){
  const L=(k,l)=>`<button class="lnk" onclick="tab='${k}';menu(0);render();scrollTo(0,0)">${l}</button>`;
  const open=DB.shop.filter(i=>!i.d).length;
  $('side').innerHTML=`<button class="x" onclick="menu(0)" aria-label="${t('close')}">✕</button>
  <h2>${t('project')}</h2>
  <select onchange="pickP(this.value)" aria-label="${t('project')}">${DB.projects.map((p,i)=>p.arch&&i!==DB.cur?'':`<option value="${i}" ${i===DB.cur?'selected':''}>${esc(p.name)}${p.arch?' ✓':''}</option>`).join('')}</select>
  <label>${t('tpl')}</label><select onchange="newTpl=this.value"><option value="sophie" ${newTpl==='sophie'?'selected':''}>${t('tplS')}</option><option value="weekend" ${newTpl==='weekend'?'selected':''}>Weekend Scarf (${DB.lang==='de'?'Anleitung':'pattern'})</option><option value="stripe" ${newTpl==='stripe'?'selected':''}>${t('tplT')}</option></select>
  <div class="three"><button onclick="newP()">+ ${t('newP')}</button><button onclick="renP()">${t('rename')}</button><button onclick="delP()">${t('del')}</button></div>
  ${L('home','🏠 '+(DB.lang==='de'?'Alle Projekte':'All projects'))}${L('count',t('tabsGo'))}
  <h2 style="margin-top:24px">Extras</h2>
  ${L('stash','🧶 '+t('stash'))}${L('shop','🛒 '+t('shop')+(open?` (${open})`:''))}${L('tausch','🤝 '+(DB.lang==='de'?'Tauschbörse':'Yarn swap')+(TB.badge()?` (${TB.badge()})`:''))}${L('help','🎓 '+(DB.lang==='de'?'Hilfe & Techniken':'Help & techniques'))}${L('gloss','📖 '+t('gloss'))}${L('settings','⚙️ '+t('settings'))}
  ${SYNC.html()}
  <h2 style="margin-top:24px">${DB.lang==='de'?'Datensicherung':'Backup'}</h2>
  <div class="two" style="margin-top:8px"><button onclick="exportDB()">⬇️ Export</button><button onclick="$('impf').click()">⬆️ Import</button></div>
  <input type="file" id="impf" accept=".json,application/json" hidden onchange="importDB(this)">
  <p class="mu sm">${DB.lang==='de'?'Speichert alle Projekte, Garnlager, Einkaufsliste und Einstellungen in eine Datei.':'Saves all projects, stash, shopping list and settings to a file.'}</p>
  <button class="imp" onclick="tab='impressum';menu(0);render();scrollTo(0,0)">Impressum</button>`;
}
function pickP(i){DB.cur=+i;S=DB.projects[DB.cur];save();KAL.push();tab='count';menu(0);render()}
async function newP(){const def=tplDef(newTpl),n=await ask(t('nameQ'),{input:def.name});if(n===null)return;const p=clone(def);p.id=rid();p.name=n.trim()||def.name;DB.projects.push(p);pickP(DB.projects.length-1)}
async function renP(){const n=await ask(t('nameQ'),{input:S.name});if(n&&n.trim()){S.name=n.trim();save();render();renderMenu()}}

// ===== Startseite: alle Projekte =====
function vHome(){const de=DB.lang==='de',keep=S;
  const cards=DB.projects.map((p,i)=>{if(p.arch)return '';S=p;const c=calc();S=keep;const pc=Math.round(p.row/c.total*100),fin=p.row>=c.total,a=agoTxt(p.last);
    return `<button class="pc ${i===DB.cur?'on':''} ${fin?'fin':''}" onclick="pickP(${i})"><h3>${esc(p.name)}<span>${pc} %</span></h3>
      <div class="bar">${c.segs.map(g=>`<i style="flex:${g.n};background:${esc(g.s.c)}"></i>`).join('')}<b style="width:${100-p.row/c.total*100}%"></b></div>
      <p>${de?`Reihe ${p.row} von ${c.total}`:`Row ${p.row} of ${c.total}`}${a?` · ${de?'zuletzt':'last'} <span class="agot" data-t="${p.last}">${a}</span>`:''}</p></button>`}).join('');
  return `${SB.card()}<section class="card"><h2>${de?'Meine Projekte':'My projects'}</h2><p class="mu">${de?'Tippe auf ein Projekt, um weiterzumachen.':'Tap a project to continue.'}</p>${SYNC.html(1)}</section>${cards}${FIN.homeCard()}${KAL.homeCard()}
  <section class="card"><label>${t('tpl')}</label><select onchange="newTpl=this.value"><option value="sophie" ${newTpl==='sophie'?'selected':''}>${t('tplS')}</option><option value="weekend" ${newTpl==='weekend'?'selected':''}>Weekend Scarf (${DB.lang==='de'?'Anleitung':'pattern'})</option><option value="stripe" ${newTpl==='stripe'?'selected':''}>${t('tplT')}</option></select>
  <button class="pri" onclick="newP()">+ ${de?'Neues Projekt':'New project'}</button></section>`}

// ===== Eigene Dialoge (Bestätigen / Name eingeben / Hinweis) =====
function ask(msg,o={}){return new Promise(res=>{let d=$('dlg');if(!d){d=document.createElement('div');d.id='dlg';d.className='dlg';document.body.appendChild(d)}
  const de=DB.lang==='de';
  d.innerHTML=`<form id="dlgf" role="dialog" aria-modal="true"><p></p>${o.input!==undefined?'<input type="text" id="dlgi">':''}<div class="bt">${o.info?'':`<button type="button" id="dlgn">${de?'Abbrechen':'Cancel'}</button>`}<button type="button" id="dlgy" class="pri" style="margin:0;${o.info?'grid-column:1/-1':''}">${o.info?'OK':o.input!==undefined?(de?'Speichern':'Save'):(de?'Ja':'Yes')}</button></div></form>`;
  d.querySelector('p').textContent=msg;const i=$('dlgi');if(i)i.value=o.input;d.hidden=false;
  const done=v=>{d.hidden=true;document.removeEventListener('keydown',esc,true);res(v)},esc=e=>{if(e.key==='Escape'){e.stopPropagation();done(o.input!==undefined?null:false)}};
  document.addEventListener('keydown',esc,true);
  const ok=()=>done(o.input!==undefined?i.value:true);$('dlgy').onclick=ok;$('dlgf').onsubmit=e=>{e.preventDefault();ok()};
  if(i)i.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();ok()}};
  if($('dlgn'))$('dlgn').onclick=()=>done(o.input!==undefined?null:false);
  d.onclick=e=>{if(e.target===d)done(o.input!==undefined?null:false)};
  setTimeout(()=>{if(i){i.focus();i.select()}else $('dlgy').focus()},30)})}

// ===== Rückgängig =====
const UNDO={t:0,
  show(msg,fn){clearTimeout(this.t);document.querySelectorAll('.toast').forEach(e=>e.remove());
    let el=$('undo');if(!el){el=document.createElement('div');el.id='undo';el.className='undo';el.setAttribute('role','status');document.body.appendChild(el)}
    el.innerHTML=`<span></span><button type="button">${DB.lang==='de'?'Rückgängig':'Undo'}</button>`;el.firstChild.textContent=msg;el.hidden=false;
    el.querySelector('button').onclick=()=>{this.hide();fn();S=DB.projects[DB.cur]||DB.projects[0];save();render();toast(DB.lang==='de'?'Wiederhergestellt':'Restored')};
    this.t=setTimeout(()=>this.hide(),7000)},
  hide(){clearTimeout(this.t);const el=$('undo');if(el)el.hidden=true},
  snapP(){const old=clone(S),i=DB.cur,de=DB.lang==='de';
    setTimeout(()=>this.show(de?'Projekt zurückgesetzt':'Project reset',()=>{const j=DB.projects.findIndex(q=>q.id===old.id||q.id===S.id);DB.projects[j>=0?j:i]=clone(old);DB.cur=j>=0?j:i}),0)}
};
async function delP(){const de=DB.lang==='de';if(DB.projects.length<2)return ask(t('lastP'),{info:1});if(!await ask(t('delQ')(S.name)))return;
  const old=clone(S),i=DB.cur;DB.del=[...(DB.del||[]),S.id];DB.projects.splice(DB.cur,1);pickP(Math.max(0,DB.cur-1));
  UNDO.show(de?`„${old.name}“ gelöscht`:`“${old.name}” deleted`,()=>{const p=clone(old);p.id=rid();DB.projects.splice(Math.min(i,DB.projects.length),0,p);DB.cur=DB.projects.indexOf(p)})}

// ===== Impressum =====
function vImpressum(){const de=DB.lang==='de',m='robs0108@web.de';
  return `<section class="card"><h2>Impressum</h2>
  <p>${de?'Das Maschenbuch ist ein rein privates Hobbyprojekt. Es wird nicht gewerblich genutzt, es gibt keine Werbung, keine Verkäufe und keine Bezahlfunktionen.':'Maschenbuch is a purely private hobby project. It is not used commercially: no ads, no sales and no payments.'}</p>
  <p>${de?'Bei Fragen oder Anliegen meldet euch bitte per E-Mail:':'For questions, please get in touch by email:'}<br><a class="mail" href="mailto:${m}">${m}</a></p>
  <p class="mu sm">${de?'Garndaten und Fotos stammen aus dem öffentlichen Katalog von hobbii.de und dienen nur der privaten Planung. Anleitungen gehören ihren Urheberinnen und werden nicht weitergegeben.':'Yarn data and photos come from the public hobbii.de catalogue and are used for private planning only. Patterns belong to their authors and are not shared.'}</p>
  <button class="ghost" onclick="tab='home';render();scrollTo(0,0)">${de?'Zurück':'Back'}</button></section>`}
