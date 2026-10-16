// ===== Strickzeit und Fertig-Schätzung =====
// Gezählt wird die Zeit zwischen zwei +1. Liegen mehr als 30 Minuten dazwischen, war es eine Pause:
// dann wird für diese Reihe das bisherige Durchschnittstempo angenommen.
const PAUSE=30*60e3;
function durTxt(ms){const de=DB.lang==='de',m=Math.max(1,Math.round(ms/60e3));if(m<60)return de?`${m} Min.`:`${m} min`;
  const h=Math.floor(m/60),r=m%60;return h>=100||!r?(de?`${h} Std.`:`${h} h`):(de?`${h} Std. ${r} Min.`:`${h} h ${r} min`)}
const TIME={
  add(p,prev,now){if(!p.start)p.start=now;const gap=prev?now-prev:Infinity;
    if(gap<=PAUSE){p.tm=(p.tm||0)+gap;p.tr=(p.tr||0)+1}
    else if((p.tr||0)>=5){p.tm+=p.tm/p.tr;p.tr++}},
  pace(p){return(p.tr||0)>=5&&p.tm>0?p.tm/p.tr:0},
  html(p,c){if(!p.tm)return '';const de=DB.lang==='de',pace=this.pace(p),left=c.total-p.row;
    let s=`🧶 ${de?'Strickzeit':'Knitting time'}: <b>${durTxt(p.tm)}</b>`;
    if(pace){const ph=3600e3/pace;s+=` · ${de?'ca.':'about'} ${ph>=10?Math.round(ph):fmt(Math.round(ph*10)/10)} ${de?'Reihen/Std.':'rows/h'}`;
      if(left>0)s+=`<br>${de?'Bei deinem Tempo fertig in ca.':'At your pace, done in about'} <b>${durTxt(left*pace)}</b>`}
    return `<p class="tmx">${s}</p>`}
};

// ===== Fertig-Moment und Archiv =====
const FIN={
  check(o,tt){if(o<tt&&S.row>=tt){S.fin=Date.now();save();this.show(S.id)}else if(S.row<tt&&S.fin&&!S.arch){delete S.fin;save()}},
  calcOf(p){const keep=S;S=p;try{return calc()}finally{S=keep}},
  used(p){return this.calcOf(p).by.filter(x=>x.rows).map(x=>{const y=DB.stash.find(s=>norm(s.n)===norm(x.s.n));
    return{x,y,b:y?Math.max(.5,Math.round(x.m/Math.max(1,y.m)*2)/2):0}}).filter(z=>z.y)},
  days(p){const d=Math.max(1,Math.round((p.fin-p.start)/864e5));return DB.lang==='de'?(d===1?'1 Tag':`${d} Tage`):(d===1?'1 day':`${d} days`)},
  show(id){const p=byId(id);if(!p)return;const de=DB.lang==='de',c=this.calcOf(p),u=p.taken?[]:this.used(p);
    let el=$('fin');if(!el){el=document.createElement('div');el.id='fin';el.className='finx';el.onclick=e=>{if(e.target===el)FIN.close()};document.body.appendChild(el)}
    el.innerHTML=`<canvas id="conf" aria-hidden="true"></canvas><div class="fbox" role="dialog" aria-modal="true" aria-labelledby="fint">
      <div class="fi" aria-hidden="true">🎉</div><h2 id="fint">${de?'Fertig!':'Finished!'}</h2><p class="fn">${esc(p.name)}</p>
      <div class="fs"><div><b>${c.total}</b><span>${de?'Reihen':'rows'}</span></div>${p.tm?`<div><b>${durTxt(p.tm)}</b><span>${de?'Strickzeit':'knitting'}</span></div>`:''}${p.start&&p.fin?`<div><b>${this.days(p)}</b><span>${de?'vom Start':'from start'}</span></div>`:''}</div>
      <div id="finu">${u.length?`<p class="mu sm">${de?'Verbrauchtes Garn laut Berechnung:':'Yarn used (estimate):'}</p>${u.map(z=>`<div class="fy"><span class="sw" style="background:${esc(z.x.s.c)}"></span><span>${esc(z.x.s.n)}</span><b>−${fmt(z.b)} ${t('balls')}</b></div>`).join('')}
        <button class="pri" onclick="FIN.take('${p.id}')">${de?'Vom Garnlager abziehen':'Deduct from stash'}</button>`:p.taken?`<p class="mu sm">✓ ${de?'Garn ist vom Lager abgezogen.':'Yarn deducted from stash.'}</p>`:''}</div>
      ${p.arch?'':`<button class="${u.length?'ghost':'pri'}" onclick="FIN.archive('${p.id}')">📦 ${de?'Zu den fertigen Projekten legen':'Move to finished projects'}</button>`}
      <button class="ghost" onclick="FIN.close()">${p.arch?(de?'Schließen':'Close'):(de?'Später':'Later')}</button></div>`;
    el.hidden=false;this.confetti()},
  close(){const el=$('fin');if(el)el.hidden=true;cancelAnimationFrame(this.raf)},
  take(id){const p=byId(id);if(!p||p.taken)return;const de=DB.lang==='de',old=clone(DB.stash),u=this.used(p);
    u.forEach(z=>{z.y.b=Math.max(0,Math.round((z.y.b-z.b)*2)/2)});p.taken=1;save();
    $('finu').innerHTML=`<p class="mu sm">✓ ${de?'Garn ist vom Lager abgezogen.':'Yarn deducted from stash.'}</p>`;
    UNDO.show(de?'Garn abgezogen':'Yarn deducted',()=>{DB.stash=old;const q=byId(id);if(q)delete q.taken})},
  archive(id){const p=byId(id);if(!p)return;const de=DB.lang==='de';p.arch=1;if(!p.fin)p.fin=Date.now();this.close();
    if(DB.projects[DB.cur]===p){const j=DB.projects.findIndex(q=>!q.arch);if(j>=0){DB.cur=j;S=DB.projects[j]}}
    tab='home';save();render();scrollTo(0,0);
    UNDO.show(de?'Bei den fertigen Projekten':'Moved to finished projects',()=>{const q=byId(id);if(q)delete q.arch})},
  restore(id){const p=byId(id);if(!p)return;delete p.arch;save();render();toast(DB.lang==='de'?'Wieder bei den aktiven Projekten':'Back with active projects')},
  homeCard(){const L=DB.projects.map((p,i)=>({p,i})).filter(o=>o.p.arch);if(!L.length)return '';const de=DB.lang==='de';
    return `<section class="card"><details class="arch"><summary><h2>${de?'Fertige Projekte':'Finished projects'} <span class="mu">(${L.length})</span></h2></summary>
      ${L.sort((a,b)=>(b.p.fin||0)-(a.p.fin||0)).map(({p,i})=>{const c=this.calcOf(p);
        return `<div class="tbr"><span class="sw" style="background:${esc((p.stripes[0]||{}).c||'#f4a6c6')}"></span><button class="g an" onclick="FIN.show('${p.id}')"><b>${esc(p.name)}</b><small class="mu">${p.fin?new Date(p.fin).toLocaleDateString(de?'de-DE':'en-GB'):''} · ${c.total} ${de?'Reihen':'rows'}${p.tm?' · '+durTxt(p.tm):''}</small></button><button class="want" onclick="FIN.restore('${p.id}')">↩ ${de?'Zurückholen':'Restore'}</button></div>`}).join('')}</details></section>`},
  confetti(){const cv=$('conf');if(!cv||matchMedia('(prefers-reduced-motion: reduce)').matches)return;cancelAnimationFrame(this.raf);
    const x=cv.getContext('2d'),W=cv.width=innerWidth,H=cv.height=innerHeight,cols=['#f6a9c9','#8ccbf0','#ffd36e','#9fe0c9','#c9b8ef'],P=Array.from({length:110},()=>({x:Math.random()*W,y:-20-Math.random()*H*.5,vx:(Math.random()-.5)*2,vy:2+Math.random()*3,r:Math.random()*6.3,vr:(Math.random()-.5)*.25,s:5+Math.random()*6,c:cols[Math.random()*5|0]}));
    const t0=performance.now(),step=now=>{const k=(now-t0)/1000;x.clearRect(0,0,W,H);x.globalAlpha=Math.max(0,Math.min(1,3.2-k));
      P.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;x.save();x.translate(p.x,p.y);x.rotate(p.r);x.fillStyle=p.c;x.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);x.restore()});
      if(k<3.2)this.raf=requestAnimationFrame(step);else x.clearRect(0,0,W,H)};this.raf=requestAnimationFrame(step)}
};
