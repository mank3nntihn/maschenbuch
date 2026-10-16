// ===== Knit-Along: Fortschritt von Freundinnen (nur Name, Projekt und Balken) =====
// Daten kommen aus der Tabelle "kal" (siehe cloud.js), der grüne Punkt aus SB.online.
const KAL={peers:{},cache:(()=>{try{return JSON.parse(localStorage.getItem('mb.kal')||'{}')}catch(e){return{}}})(),id:null,timer:0,
  take(id,v){if(!v||typeof v!=='object'||!v.name)return;const o={name:String(v.name).slice(0,24),proj:String(v.proj||'').slice(0,40),pct:Math.max(0,Math.min(100,+v.pct||0)),row:+v.row||0,total:+v.total||0,col:/^#[0-9a-f]{6}$/i.test(v.col)?v.col:'#f4a6c6',ts:+v.ts||Date.now()};
    const old=this.peers[id];if(old&&old.ts>o.ts)return;this.peers[id]=o;this.cache[id]=o;clearTimeout(this.ct);this.ct=setTimeout(()=>{try{localStorage.setItem('mb.kal',JSON.stringify(this.cache))}catch(e){}},2000)},
  mine(){const c=calc();return{id:this.id,name:(DB.kalName||'').trim(),proj:S.name,pct:Math.round(S.row/c.total*100),row:S.row,total:c.total,col:(S.stripes[0]||{}).c||'#f4a6c6',ts:Date.now()}},
  push(now){clearTimeout(this.timer);this.timer=setTimeout(()=>this.send(),now?50:1500)},
  async send(){const m=this.mine(),on=DB.kalShare!==false&&!!m.name;try{await SB.kalSend(m,on)}catch(e){}SB.presence()},
  // Höchstens 4 andere: wer gerade strickt zuerst, dann die zuletzt aktiven (nicht älter als 30 Tage)
  list(){const all={...this.cache,...this.peers},now=Date.now();delete all[this.id];
    return Object.entries(all).map(([id,p])=>({...p,id,live:SB.online.has(id)})).filter(p=>p.live||now-p.ts<30*864e5).sort((a,b)=>(b.live-a.live)||(b.ts-a.ts)).slice(0,4)},
  html(small){if(DB.kalShow===false)return '';const L=this.list();if(!L.length)return '';const de=DB.lang==='de',now=Date.now();
    return L.map(p=>`<div class="kr ${!p.live&&now-p.ts>36e5?'idle':''}" title="${esc(p.proj)}"><b>${p.live?`<i class="dot" title="${de?'Strickt gerade':'Knitting now'}" aria-label="${de?'strickt gerade':'knitting now'}"></i>`:''}${esc(p.name)}${small?'':` · <span style="font-weight:400;color:var(--mu)">${esc(p.proj)}</span>`}</b><span>${p.pct} %</span><div class="kb"><i style="width:${p.pct}%;background:${esc(p.col)}"></i></div></div>`).join('')},
  paint(){const a=$('kalc'),b=$('kalf');if(a)a.innerHTML=this.html();if(b)b.innerHTML=this.html(1)},
  homeCard(){const de=DB.lang==='de',n=DB.kalName||'';
    if(SB.c&&!SB.user)return `<section class="card"><h2>Knit-Along</h2><p class="mu">${de?'Melde dich oben an, dann kannst du mit einem Namen beim Knit-Along mitmachen.':'Sign in above to join the knit-along with a name.'}</p></section>`;
    return `<section class="card"><h2>Knit-Along</h2><p class="mu">${de?'Mit deinem Namen sehen deine Freundinnen im Zähler einen kleinen Fortschrittsbalken von deinem aktuellen Projekt, und du ihren.':'With a name, friends see a small progress bar of your current project in their counter, and you see theirs.'}</p>
    <div class="kh"><input type="text" id="kaln" maxlength="24" value="${esc(n)}" placeholder="${de?'Dein Name':'Your name'}" aria-label="${de?'Dein Name':'Your name'}" onkeydown="if(event.key==='Enter')KAL.setName()"><button onclick="KAL.setName()">${de?'Speichern':'Save'}</button></div></section>`},
  setName(){const v=$('kaln').value.trim().slice(0,24);DB.kalName=v;save();this.push(1);toast(DB.lang==='de'?(v?'Name gespeichert':'Name entfernt'):(v?'Name saved':'Name removed'))}
};
