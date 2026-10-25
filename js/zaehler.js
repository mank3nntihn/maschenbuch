// ===== Zähler: Reihen zählen, großer Zähler, Reihen-Merker, Bildschirm anlassen =====
function vCount(){
  return `<div class="split ${DB.live?'on':''}"><div id="cnt">${countCard()}</div>${DB.live?liveCard():''}</div>`;
}
function liveCard(){
  const lv=DB.liveView;
  return `<section class="card live" id="livecard"><div class="lh"><h2>${t('liveT')}</h2><span class="mu" id="lvp"></span></div>
  <div class="seg"><button class="${lv==='flat'?'on':''}" onclick="DB.liveView='flat';save();render()">${t('flat')}</button><button class="${lv==='worn'?'on':''}" onclick="DB.liveView='worn';save();render()">${t('worn')}</button></div>
  <div id="lgl" class="gl"></div>
  <button class="livebtn" id="lvbtn" onclick="LIVE.toggle()">${t('liveWhole')}</button>
  <p class="mu sm" id="lglt"></p></section>`;
}
function countCard(){
  const c=calc(),p=Math.round(S.row/c.total*100),done=S.row>=c.total;
  const cur=c.segs.find(g=>S.row+1<=g.b)||c.segs[c.segs.length-1];
  let ins='';
  if(c.wk&&!done){const r=c.R[S.row];ins=`<div class="ins"><p class="mu">${wkInfo(c,r)}</p><div>${wkText(c,S.row)}</div></div>`}
  if(c.gm&&!done){const r=c.R[S.row];ins=`<div class="ins"><p class="mu">${gmInfo(c,r)}</p><div>${gmText(c,r)}</div></div>`}
  if(c.sop&&!done){const r=c.R[S.row];
    ins=`<div class="ins"><p class="mu">${t('sec')[r.sec]} · ${repLabel(r)} · ${side(r)} · ${onNeedle(r.n)}</p><div>${rowText(r)}</div></div>`}
  return `<section class="card">
    <div class="scarf">${c.segs.map(g=>`<i style="flex:${g.n};background:${esc(g.s.c)}"></i>`).join('')}<b style="width:${100-S.row/c.total*100}%"></b></div>
    <div class="big">${p}<small> ${t('done')}</small></div>
    <p class="mu" id="rowof">${c.gm?gmRowOf(c,done):done?t('allDone')(c.total,c.len):t('rowOf')(S.row+1,c.total,Math.round(S.row/c.total*c.len),c.len)} <button class="jb" onclick="jumpOpen()">${DB.lang==='de'?'Reihe eingeben':'Enter row'}</button></p>
    <form class="jump" id="jump" hidden onsubmit="event.preventDefault();jumpGo()"><input type="number" id="jr" inputmode="numeric" pattern="[0-9]*" placeholder="1 – ${c.total}" aria-label="${DB.lang==='de'?'Reihe':'Row'}"><button type="submit">${DB.lang==='de'?'Los':'Go'}</button><button type="button" onclick="$('jump').hidden=true" aria-label="${t('close')}">✕</button></form>
    ${S.stripes.length>1||done?`<div class="cur"><span class="sw" style="background:${esc(cur.s.c)}"></span><span>${done?t('finished'):t('nowCol')(esc(cur.s.n),cur.b-S.row)}</span></div>`:''}
    ${agoHtml(S)}${TIME.html(S,c)}${done?`<button class="livebtn" onclick="FIN.show(S.id)">🎉 ${DB.lang==='de'?'Fertig-Übersicht':'Finish summary'}</button>`:''}
    ${alertHtml(c)}
    ${ins}
    ${PZ.bar(done)}${PZ.pad()}
    <button class="fbtn" onclick="FOC.open()">⛶ ${DB.lang==='de'?'Großer Zähler (Vollbild)':'Big counter (full screen)'}</button>
    <button class="livebtn" aria-expanded="${DB.live}" onclick="toggleLive()"><span>${DB.live?t('liveHide'):t('liveShow')}</span><span class="ar">▾</span></button>
    <button class="ghost" onclick="resetRow()">${t('reset')}</button>
    <div class="kal" id="kalc">${KAL.html()}</div>
  </section>`;
}

// +1 / −1: merkt sich die Zeit für die Strickzeit (fertig.js) und feiert die letzte Reihe
function go(d){if(d>0&&S.pz)return PZ.hint();const tt=calc().total,o=S.row,prev=S.last,pt=S.pt||0,now=Date.now();S.row=Math.min(Math.max(S.row+d,0),tt);
  if(S.row!==o){S.last=now;delete S.pt;if(S.row>o){TIME.add(S,prev&&prev+pt,now);HIST.add(S,now,prev,pt)}else HIST.trim(S)}save();updCount();if(d>0)HALF.check(o,tt);FIN.check(o,tt)}

// ===== Pause-Timer: Zeit der aktuellen Reihe, anhalten für kurze Pausen =====
// S.pz = seit wann pausiert, S.pt = Pausenzeit seit der letzten Reihe (zählt nicht zur Strickzeit). Während der Pause ist +1 gesperrt.
const PZ={
  el(p){if(!p.last)return null;const n=Date.now();return n-p.last-(p.pt||0)-(p.pz?n-p.pz:0)},
  clock(ms){const s=Math.max(0,Math.floor(ms/1000)),h=Math.floor(s/3600),m=Math.floor(s/60)%60,x=String(s%60).padStart(2,'0');return h?`${h}:${String(m).padStart(2,'0')}:${x}`:`${m}:${x}`},
  time(p){const de=DB.lang==='de';if(p.pz)return this.clock(Date.now()-p.pz);const e=this.el(p);
    return e==null?'–:––':e>PAUSE?(de?'über 30 Min.':'30+ min'):this.clock(e)},
  msg(){return DB.lang==='de'?'Der Timer ist auf Pause – zum Weiterstricken oder -häkeln erst auf ▶ Weiter tippen.':'The timer is paused – tap ▶ Resume to keep knitting or crocheting.'},
  bar(done){if(done)return '';const de=DB.lang==='de',on=!!S.pz;
    return `<div class="rtm${on?' on':''}"><span class="rtt">${on?(de?'⏸ Pause':'⏸ Paused'):(de?'⏱ Diese Reihe':'⏱ This row')}: <b>${this.time(S)}</b></span><button class="pzb" onclick="PZ.toggle()" aria-pressed="${on}">${on?(de?'▶ Weiter':'▶ Resume'):'⏸ Pause'}</button></div>`},
  pad(){const on=!!S.pz;return `<div class="pad"><button onclick="go(-1)" aria-label="${t('back')}">−1</button><button class="plus${on?' off':''}" aria-disabled="${on}"${on?` data-hint="${esc(this.msg())}"`:''} onclick="go(1)">${t('rowDone')}</button></div>`},
  toggle(){const n=Date.now();if(S.pz){S.pt=(S.pt||0)+(n-S.pz);delete S.pz}else S.pz=n;save();this.refresh()},
  refresh(){if(FOC.on){const b=$('fzbot');if(b)b.innerHTML=FOC.bot()}else if(tab==='count'&&$('cnt'))$('cnt').innerHTML=countCard()},
  hint(){document.querySelectorAll('.toast').forEach(e=>e.remove());toast(this.msg(),3500);document.querySelectorAll('.rtm').forEach(e=>{e.classList.remove('nudge');void e.offsetWidth;e.classList.add('nudge')})}
};
setInterval(()=>{const b=document.querySelectorAll('.rtt b');if(b.length&&S)b.forEach(e=>e.textContent=PZ.time(S))},1000);

// ===== Verlauf: wann die letzten Reihen fertig wurden (gegen versehentliches Doppel-Tippen) =====
// p.hist = [{r: fertige Reihe, t: Zeitpunkt, g: Abstand zur Reihe davor}], die letzten 10 werden gespeichert und angezeigt
const HIST={
  add(p,now,prev,pt=0){const h=(p.hist||[]).filter(e=>e.r<p.row),l=h[h.length-1],from=l&&l.r===p.row-1?l.t:prev;
    h.push(from?{r:p.row,t:now,g:Math.max(0,now-from-pt)}:{r:p.row,t:now});p.hist=h.slice(-10)},
  fade(u){u=u||document.querySelector('.fz .feed ul');if(u)u.classList.toggle('end',u.scrollTop+u.clientHeight>=u.scrollHeight-2)},
  trim(p){if(p.hist)p.hist=p.hist.filter(e=>e.r<=p.row)},
  dur(ms){const de=DB.lang==='de',s=Math.max(1,Math.round(ms/1000)),m=Math.floor(s/60);
    if(m<1)return de?`${s} Sek.`:`${s} s`;if(m<60)return de?`${m} Min. ${s%60} Sek.`:`${m} min ${s%60} s`;return durTxt(ms)},
  when(ts){const de=DB.lang==='de',d=new Date(ts),n=new Date(),hm=d.toLocaleTimeString(de?'de-DE':'en-GB',{hour:'2-digit',minute:'2-digit'});
    if(d.toDateString()===n.toDateString())return hm;const y=new Date(n);y.setDate(n.getDate()-1);
    return d.toDateString()===y.toDateString()?(de?'gestern ':'yesterday ')+hm:d.toLocaleDateString(de?'de-DE':'en-GB',{day:'numeric',month:'numeric'})+' '+hm},
  html(p){const h=(p.hist||[]).filter(e=>e.r<=p.row).slice(-10).reverse();if(!h.length)return '';const de=DB.lang==='de',pace=TIME.pace(p),kurz=pace?Math.max(15e3,pace/4):20e3;
    return `<section class="fzx feed k3"><p class="cap">${de?'Zuletzt gezählt':'Recently counted'}${h.length>4?` · ${h.length}`:''}</p><ul onscroll="HIST.fade(this)">${h.map(e=>{const w=e.g!=null&&e.g<kurz,lang=e.g>PAUSE;
      return `<li${w?' class="dbl"':''}><b>${de?'Reihe':'Row'} ${e.r}</b><span>${this.when(e.t)}</span><span>${e.g==null?'':lang?(de?'nach einer Pause':'after a break'):(w?'<i class="wi s" aria-hidden="true">!</i>':'')+this.dur(e.g)+(w?(de?' – doppelt<span class="lg"> getippt</span>?':' – tapped<span class="lg"> twice</span>?'):'')}</span></li>`}).join('')}</ul></section>`}
};
// Nur Zähler-Karte und Live-3D aktualisieren, ohne die 3D-Ansicht neu aufzubauen
function updCount(){KAL.push();if(FOC.on)return FOC.upd();if(tab!=='count'||!$('cnt'))return render();$('pop').hidden=true;$('cnt').innerHTML=countCard();if(LIVE.ctl)LIVE.ctl.setRow(S.row)}
function toggleLive(){DB.live=!DB.live;save();render();if(DB.live&&innerWidth<900)setTimeout(()=>{const e=$('livecard');if(e)e.scrollIntoView({behavior:'smooth',block:'start'})},60)}
function setRow(r){const o=S.row,tt=calc().total;S.row=Math.min(Math.max(r,0),tt);HIST.trim(S);save();render();FIN.check(o,tt)}

async function resetRow(){const de=DB.lang==='de';if(!await ask(t('resetQ')))return;
  const id=S.id,o={row:S.row,last:S.last,fin:S.fin,tm:S.tm,tr:S.tr,start:S.start,hist:S.hist,pz:S.pz,pt:S.pt,half:S.half};
  S.row=0;['fin','tm','tr','start','hist','pz','pt','half'].forEach(k=>delete S[k]);save();updCount();
  UNDO.show(de?'Fortschritt zurückgesetzt':'Progress reset',()=>{const p=byId(id);if(p)Object.assign(p,o)})}

// ===== Bildschirm anlassen =====
let WL=null;
async function syncWake(){const want=DB.wake&&tab==='count'&&document.visibilityState==='visible';
  if(!('wakeLock' in navigator))return;
  try{if(want&&!WL){WL=await navigator.wakeLock.request('screen');WL.addEventListener('release',()=>{WL=null})}
    else if(!want&&WL){await WL.release();WL=null}}catch(e){WL=null}}
function setWake(v){DB.wake=v;save();render()}
document.addEventListener('visibilitychange',syncWake);

// ===== Reihe direkt eingeben =====
function jumpOpen(v){const f=$('jump'),i=$('jr');if(!f)return;f.hidden=false;i.value=v||'';i.focus();if(!v)i.select()}
// Eingabe = die Reihe, die man gerade strickt (wie überall angezeigt); intern zählt S.row die fertigen Reihen
function jumpGo(){const i=$('jr'),v=parseInt(i.value,10);if(isNaN(v))return i.focus();const tt=calc().total,n=Math.min(Math.max(v,1),tt);
  setRow(n-1);toast(DB.lang==='de'?`Jetzt Reihe ${n}`:`Now row ${n}`)}

// ===== Reihen-Merker: Hinweis, wenn eine Reihe anders ist als die gleichen davor =====
function rowKey(c,i){const r=c.R[i];if(!r)return null;const seg=c.segs.find(g=>i+1<=g.b);if(c.gm)return r.key+'|'+(seg?seg.idx:0);if(c.wk)return r.k==='skinny'?'skinny|':r.k+'|'+(seg?seg.idx:0);return (c.sop?r.k:'body')+'|'+(seg?seg.idx:0)}
function rowLabel(c,i){const de=DB.lang==='de',r=c.R[i],seg=c.segs.find(g=>i+1<=g.b);
  const L=de?{skinny:'dünne Streifen (Farbwechsel alle 2 Reihen)',chunky:'dicke Streifen (6 Reihen je Farbe)',plain:'normale Reihe',inc:'Zunahme-Reihe',dec:'Abnahme-Reihe',end1:'Spitze: 1. Reihe mit Abnahme',end2:'Spitze',bo:'Abketten',body:'normale Reihe'}:{skinny:'skinny stripes (switch colour every 2 rows)',chunky:'chunky stripes (6 rows per colour)',plain:'plain row',inc:'increase row',dec:'decrease row',end1:'tip: first row with decrease',end2:'tip',bo:'bind off',body:'plain row'};
  const base=c.gm?GMK[DB.lang][r.key]:L[c.sop||c.wk?(r.k==='bo'?'bo':r.k):'body'],col=S.stripes.length>1&&seg&&r.k!=='skinny'?seg.s.n:'';
  if(col&&i>0&&rowKey(c,i-1).split('|')[0]===rowKey(c,i).split('|')[0]&&rowKey(c,i-1)!==rowKey(c,i))return (de?'Farbwechsel zu ':'colour change to ')+col;
  return base+(col?(de?', Farbe ':', colour ')+col:'')}
function rowAlert(c,row){ // row = Reihe, die als nächstes gestrickt wird (Index)
  if(row>=c.total)return null;const k=rowKey(c,row);const pk=row>0?rowKey(c,row-1):null;let run=0;for(let j=row-1;j>=0&&rowKey(c,j)===pk;j--)run++;
  const changed=row>0&&rowKey(c,row-1)!==k&&run>=2;let next=0;for(let j=row+1;j<c.total;j++){if(rowKey(c,j)!==k){next=j-row;break}}
  return{changed,run,next,nextLbl:next?rowLabel(c,row+next):'',lbl:rowLabel(c,row),prevLbl:row?rowLabel(c,row-1):''}}
function alertHtml(c){const a=rowAlert(c,S.row),de=DB.lang==='de';if(!a)return'';
  if(a.changed)return `<div class="alert" role="status"><i class="wi" aria-hidden="true">!</i><span>${de?`Achtung, Reihe ${S.row+1} ist anders`:`Heads up, row ${S.row+1} is different`}: ${esc(a.lbl)}<small>${de?`Die letzten ${a.run} Reihen waren: ${esc(a.prevLbl)}`:`The last ${a.run} rows were: ${esc(a.prevLbl)}`}</small></span></div>`;
  if(a.next&&a.next<=3)return `<p class="soon">${de?`In ${a.next===1?'1 Reihe':a.next+' Reihen'} kommt: ${esc(a.nextLbl)}`:`In ${a.next} row${a.next>1?'s':''}: ${esc(a.nextLbl)}`}</p>`;
  return ''}

// ===== Großer Zähler (Vollbild) =====
const FOC={on:false,ctl:null,
  open(){this.on=true;tab='count';const d=document.documentElement;if(innerWidth>=900&&d.requestFullscreen)d.requestFullscreen().catch(()=>{});render()},
  close(){this.on=false;if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});render()},
  stop(){if(this.ctl){this.ctl.stop();this.ctl=null}},
  info(){const c=calc(),de=DB.lang==='de',done=S.row>=c.total,r=c.R[Math.min(S.row,c.total-1)];
    const nxt=Math.min(S.row+1,c.total),pc=Math.round(S.row/c.total*100);
    const det=c.gm&&!done?gmInfo(c,r):c.wk&&!done?wkInfo(c,r):c.sop&&!done?`${t('sec')[r.sec]} · ${repLabel(r)} · ${side(r)} · ${onNeedle(r.n)}`:`${rowLabel(c,Math.min(S.row,c.total-1))}`;
    const txt=done?'':c.gm?gmText(c,r):c.sop?rowText(r):c.wk?wkText(c,S.row):'';
    return `${alertHtml(c)}${done?'':`<section class="fzx k1"><p class="cap">${de?'Wo du bist':'Where you are'}</p><p class="info">${det}</p></section>`}
      ${txt?`<section class="fzx k2"><p class="cap">${de?'Anleitung':'Pattern'}</p><p class="txt">${txt}</p></section>`:''}${HIST.html(S)}`},
  head(){const c=calc(),de=DB.lang==='de',done=S.row>=c.total,nxt=Math.min(S.row+1,c.total),pc=Math.round(S.row/c.total*100);
    return `<div class="rn">${done?(de?'Fertig!':'Done!'):(de?'Reihe ':'Row ')+nxt}<small> / ${c.total} · ${pc} %</small></div>`},
  html(){const de=DB.lang==='de',dk=(THEMES[DB.theme]||{}).dark;
    return `<div class="fz"><div class="top"><div id="fzh">${this.head()}</div><div class="tbw"><div class="tb"><button onclick="FOC.dark()" aria-label="${de?'Hell/Dunkel':'Light/Dark'}">${dk?'☀️':'🌙'}</button><button onclick="FOC.close()" aria-label="${t('close')}">✕</button></div><div class="kal kalf" id="kalf">${KAL.html(1)}</div></div></div>
      <div id="fzi">${this.info()}</div>
      <div id="fgl" class="gl"></div>
      <div class="bot" id="fzbot">${this.bot()}</div></div>`},
  bot(){return PZ.bar(S.row>=calc().total)+PZ.pad()},
  start(){HIST.fade();this.ctl=View3D($('fgl'),null,{worn:false,mode:'now',live:true})},
  upd(){const i=$('fzi');if(!i)return render();i.innerHTML=this.info();$('fzh').innerHTML=this.head();HIST.fade();const b=$('fzbot');if(b)b.innerHTML=this.bot();if(this.ctl)this.ctl.setRow(S.row)},
  dark(){if(!THEMES[DB.theme].dark){DB.lightTheme=DB.theme;DB.theme='night'}else DB.theme=DB.lightTheme||'rose';save();render()}
};
document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement&&FOC.on&&innerWidth>=900){FOC.on=false;render()}});

// ===== Wie lang ist das letzte +1 her? =====
function agoTxt(ts){if(!ts)return null;const de=DB.lang==='de',sec=Math.max(0,Math.floor((Date.now()-ts)/1000)),m=Math.floor(sec/60);
  if(sec<5)return de?'gerade eben':'just now';if(m<1)return de?`vor ${sec} Sek.`:`${sec} s ago`;
  if(m<60)return de?`vor ${m} Min. ${sec%60} Sek.`:`${m} min ${sec%60} s ago`;
  const h=Math.floor(m/60);if(h<24)return de?`vor ${h} Std.${m%60&&h<5?' '+(m%60)+' Min.':''}`:`${h} h ago`;
  const d=Math.floor(h/24);if(d===1)return de?'gestern':'yesterday';if(d<14)return de?`vor ${d} Tagen`:`${d} days ago`;
  return new Date(ts).toLocaleDateString(de?'de-DE':'en-GB')}
function agoHtml(p){const a=agoTxt(p.last),de=DB.lang==='de';if(!a)return '';
  return `<p class="ago">⏱ ${de?'Letzte Reihe gezählt':'Last row counted'}: <b class="agot" data-t="${p.last}">${a}</b></p>`}
setInterval(()=>document.querySelectorAll('.agot').forEach(e=>e.textContent=agoTxt(+e.dataset.t)),5000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)document.querySelectorAll('.agot').forEach(e=>e.textContent=agoTxt(+e.dataset.t))});
