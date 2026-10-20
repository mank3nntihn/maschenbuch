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

// ===== Konfetti: ein Canvas, zeitbasiert (gleich schnell bei jeder Bildrate), pro Farbe ein einziger Zeichenbefehl =====
// 'half' = Halbzeit (ca. 180 Stück), 'fin' = Fertig (ca. 1.000 Stück: zwei Kanonen, Explosion, Regen)
const CONF={
  stop(a){if(a){a.off=1;cancelAnimationFrame(a.raf)}},
  run(cv,art){if(!cv||matchMedia('(prefers-reduced-motion: reduce)').matches)return null;
    const dpr=Math.min(devicePixelRatio||1,2),W=innerWidth,H=innerHeight,x=cv.getContext('2d');cv.width=W*dpr;cv.height=H*dpr;cv.style.width=W+'px';cv.style.height=H+'px';
    const ac=getComputedStyle(document.documentElement).getPropertyValue('--ac').trim()||'#f6a9c9',C=[ac,'#8ccbf0','#ffd36e','#9fe0c9','#c9b8ef','#ffb3c7'],P=[],R=Math.random;
    const add=(n,px,py,ang,spr,v0,v1,d0,d1)=>{for(let i=0;i<n;i++){const a=ang+(R()-.5)*spr,v=v0+R()*(v1-v0);
      P.push({x:px+(R()-.5)*20,y:py+(R()-.5)*20,vx:Math.cos(a)*v,vy:Math.sin(a)*v,r:R()*6.3,vr:(R()-.5)*12,f:R()*6.3,vf:4+R()*8,w:7+R()*6,h:4+R()*4,c:R()*C.length|0,d:d0+R()*(d1-d0),ph:R()*6.3})}};
    const up=-Math.PI/2;let T;
    if(art==='half'){const cx=W/2,cy=H/2-20;add(150,cx,cy,up,Math.PI*1.6,350,950,0,.08);add(36,cx,-20,Math.PI/2,1.2,40,160,.25,1);T=3.4}
    else{const k=Math.max(.45,Math.atan(W/H)*.75),v=H*2.2;
      add(350,0,H,up+k,.45,v*.55,v,0,.18);add(350,W,H,up-k,.45,v*.55,v,0,.18);
      add(260,W/2,H*.42,up,Math.PI*2,300,1300,.5,.6);add(450,0,0,0,0,0,0,.15,3.6);
      for(let i=P.length-450;i<P.length;i++){const p=P[i];p.x=R()*W;p.y=-20-R()*80;p.vx=(R()-.5)*80;p.vy=60+R()*140}
      add(220,0,H,up+k*.8,.4,v*.6,v,1.4,1.6);add(220,W,H,up-k*.8,.4,v*.6,v,1.4,1.6);T=6.5}
    const a={n:P.length,frames:0,raf:0};let t0=null,last=null;
    const step=now=>{if(a.off)return;if(t0==null){t0=last=now}const t=(now-t0)/1000,dt=Math.min(.05,(now-last)/1000);last=now;a.frames++;
      const g=900,drag=Math.exp(-2.2*dt);x.setTransform(dpr,0,0,dpr,0,0);x.clearRect(0,0,W,H);x.globalAlpha=Math.max(0,Math.min(1,(T-t)/.8));
      const paths=C.map(()=>new Path2D());let alive=0;
      for(const p of P){if(t<p.d){alive++;continue}if(p.y>H+30)continue;alive++;
        p.vx*=drag;p.vy=p.vy*drag+g*dt;if(p.vy>260)p.vy=260+(p.vy-260)*drag;p.x+=(p.vx+Math.sin(t*3+p.ph)*40)*dt;p.y+=p.vy*dt;p.r+=p.vr*dt;p.f+=p.vf*dt;
        const c=Math.cos(p.r),s=Math.sin(p.r),hw=p.w/2,hh=p.h/2*Math.cos(p.f),q=paths[p.c];
        const ax=c*hw,ay=s*hw,bx=-s*hh,by=c*hh;q.moveTo(p.x-ax-bx,p.y-ay-by);q.lineTo(p.x+ax-bx,p.y+ay-by);q.lineTo(p.x+ax+bx,p.y+ay+by);q.lineTo(p.x-ax+bx,p.y-ay+by);q.closePath()}
      paths.forEach((q,i)=>{x.fillStyle=C[i];x.fill(q)});
      if(t<T&&alive)a.raf=requestAnimationFrame(step);else{x.clearRect(0,0,W,H);a.done=1}};
    a.raf=requestAnimationFrame(step);CONF.last=a;return a}
};

// ===== Halbzeit: kleine Animation, wenn mit +1 die Hälfte erreicht wird (einmal pro Projekt) =====
const HALF={
  check(o,tt){const h=Math.ceil(tt/2);if(tt<4||S.half||o>=h||S.row<h)return;S.half=1;save();this.show(S.row,tt)},
  show(row,tt){const de=DB.lang==='de',old=$('half');if(old)old.remove();const el=document.createElement('div');el.id='half';el.className='half';el.setAttribute('role','status');
    const hz=Array.from({length:12},(_,i)=>`<i style="--x:${Math.round(Math.random()*240-120)}px;--d:${(i*.09).toFixed(2)}s;--s:${(.7+Math.random()*.7).toFixed(2)}">${i%3?'♥':'✿'}</i>`).join('');
    el.innerHTML=`<canvas aria-hidden="true"></canvas><div class="hbox"><div class="hz" aria-hidden="true">${hz}</div><svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="26" class="b"/><circle cx="32" cy="32" r="26" class="f"/></svg><span class="hp">50 %</span>
      <b>${de?'Halbzeit!':'Halfway there!'}</b><span>${de?`${row} von ${tt} Reihen geschafft`:`${row} of ${tt} rows done`}</span></div>`;
    document.body.appendChild(el);const cf=CONF.run(el.querySelector('canvas'),'half');setTimeout(()=>{CONF.stop(cf);el.remove()},3700)}
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
  close(){const el=$('fin');if(el)el.hidden=true;CONF.stop(this.cf)},
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
  confetti(){this.cf=CONF.run($('conf'),'fin')}
};
