// ===== Garn-Tauschbörse =====
var TB={rows:[],wish:[],loaded:false,err:false,t:0,
  me(){return((DB.kalName||'').trim()||((SB.user&&SB.user.email)||'').split('@')[0]||'?').slice(0,24)},
  load(){if(!SB.user)return;
    Promise.all([SB.c.from('tausch').select('*').order('created_at',{ascending:false}),SB.c.from('tausch_wunsch').select('*')]).then(([a,b])=>{
      if(a.error||b.error)throw a.error||b.error;this.rows=a.data||[];this.wish=b.data||[];this.loaded=true;this.err=false;
      if(tab==='tausch'||tab==='stash')render();else if(menuOpen)renderMenu()}).catch(()=>{this.err=true;if(tab==='tausch')render()})},
  later(){clearTimeout(this.t);this.t=setTimeout(()=>this.load(),300)},
  mineFor(y){return SB.user&&this.rows.find(r=>r.user_id===SB.user.id&&r.garn===String(y.n).slice(0,80))},
  wishesOn(id){return this.wish.filter(w=>w.tausch_id===id)},
  myWish(id){return SB.user&&this.wish.some(w=>w.tausch_id===id&&w.user_id===SB.user.id)},
  badge(){if(!SB.user)return 0;const mine=new Set(this.rows.filter(r=>r.user_id===SB.user.id).map(r=>r.id));return this.wish.filter(w=>mine.has(w.tausch_id)).length},
  btn(i){const y=DB.stash[i],on=!!this.mineFor(y),de=DB.lang==='de';
    return `<button class="give ${on?'on':''}" onclick="TB.toggle(${i})" aria-pressed="${on}" aria-label="${on?(de?'Wird abgegeben, tippen zum Zurückziehen':'Offered, tap to withdraw'):(de?'Gebe ich ab':'Give away')}" title="${on?(de?'In der Tauschbörse':'In the swap'):(de?'Gebe ich ab':'Give away')}">🤝</button>`},
  async toggle(i){const de=DB.lang==='de',y=DB.stash[i];if(!y)return;
    if(!SB.user)return ask(de?'Für die Tauschbörse melde dich bitte zuerst auf der Startseite an.':'Please sign in on the home page first to use the swap.',{info:1});
    const ex=this.mineFor(y);
    if(ex){if(!await ask(de?`„${y.n}“ aus der Tauschbörse nehmen?`:`Remove “${y.n}” from the swap?`))return;return this.remove(ex.id,true)}
    const m=await ask(de?`„${y.n}“ in die Tauschbörse stellen. Wie viel gibst du ab?`:`Offer “${y.n}” in the swap. How much?`,{input:`${fmt(y.b)} ${de?'Knäuel':'balls'}`});if(m===null)return;
    const {error}=await SB.c.from('tausch').insert({name:this.me(),garn:String(y.n).slice(0,80)||'Garn',col:/^#[0-9a-f]{6}$/i.test(y.c)?y.c:'#f4a6c6',menge:m.trim().slice(0,30)});
    if(error)return ask(/zu_viele/.test(error.message||'')?(de?'Du hast schon 30 Angebote in der Tauschbörse.':'You already have 30 offers.'):(de?'Das hat gerade nicht geklappt. Bist du online?':'That did not work. Are you online?'),{info:1});
    toast(de?'In der Tauschbörse':'Added to the swap');this.load()},
  async remove(id,ok){const de=DB.lang==='de';if(!ok&&!await ask(de?'Angebot zurückziehen?':'Withdraw this offer?'))return;
    const {error}=await SB.c.from('tausch').delete().eq('id',id);if(error)return ask(de?'Das hat gerade nicht geklappt. Bist du online?':'That did not work. Are you online?',{info:1});
    this.rows=this.rows.filter(r=>r.id!==id);render();this.load()},
  async wishToggle(id){const de=DB.lang==='de',on=this.myWish(id);
    const {error}=on?await SB.c.from('tausch_wunsch').delete().eq('tausch_id',id).eq('user_id',SB.user.id):await SB.c.from('tausch_wunsch').insert({tausch_id:id,name:this.me()});
    if(error)return ask(de?'Das hat gerade nicht geklappt. Bist du online?':'That did not work. Are you online?',{info:1});
    if(on)this.wish=this.wish.filter(w=>!(w.tausch_id===id&&w.user_id===SB.user.id));else this.wish.push({tausch_id:id,user_id:SB.user.id,name:this.me()});render();this.load()},
  view(){const de=DB.lang==='de';
    const head=`<section class="card"><h2>${de?'Tauschbörse':'Yarn swap'}</h2><p class="mu">${de?'Garnreste, die du nicht mehr brauchst, gibst du im Garnlager mit 🤝 ab. Bei den Angeboten der anderen tippst du auf „Hätte ich gern“. Wer etwas abgibt, sieht hier, wer es gern hätte.':'Give away leftover yarn with 🤝 in your stash. Tap “I’d like it” on other offers. Whoever offers a yarn sees who would like it.'}</p>`;
    if(!SB.c||!SB.user)return head+`<p class="warn">${de?'Melde dich auf der Startseite an, um mitzumachen.':'Sign in on the home page to join.'}</p></section>`;
    const row=(r,right,sub)=>`<div class="tbr"><span class="sw" style="background:${esc(r.col)}"></span><span class="g"><b>${esc(r.garn)}</b><small class="mu">${sub}</small></span>${right}</div>`;
    const mine=this.rows.filter(r=>r.user_id===SB.user.id),other=this.rows.filter(r=>r.user_id!==SB.user.id);
    const err=this.err?`<p class="warn">${de?'Gerade keine Verbindung, die Liste ist vielleicht nicht aktuell.':'No connection right now, the list may be out of date.'}</p>`:'';
    return head+err+`</section><section class="card"><h2>${de?'Angebote der anderen':'Offers from others'}</h2>${other.length?other.map(r=>{const on=this.myWish(r.id);
        return row(r,`<button class="want ${on?'on':''}" aria-pressed="${on}" onclick="TB.wishToggle('${r.id}')">${on?(de?'✓ Gemerkt':'✓ Noted'):(de?'Hätte ich gern':'I’d like it')}</button>`,`${esc(r.name)}${r.menge?' · '+esc(r.menge):''}${r.notiz?' · '+esc(r.notiz):''}`)}).join('')
      :`<p class="mu">${this.loaded?(de?'Im Moment bietet niemand etwas an.':'Nobody is offering anything right now.'):(de?'Lade …':'Loading …')}</p>`}</section>
      <section class="card"><h2>${de?'Gebe ich ab':'I’m giving away'}</h2>${mine.length?mine.map(r=>{const w=this.wishesOn(r.id);
        return row(r,`<button class="rm" onclick="TB.remove('${r.id}')" aria-label="${de?'Zurückziehen':'Withdraw'}">✕</button>`,`${r.menge?esc(r.menge)+' · ':''}${w.length?`<span class="wl">${de?'Hätten gern':'Wanted by'}: ${w.map(x=>esc(x.name)).join(', ')}</span>`:(de?'Noch keine Anfrage':'No requests yet')}`)}).join('')
      :`<p class="mu">${de?'Du bietest gerade nichts an.':'You are not offering anything.'}</p>`}
      <button class="ghost" onclick="tab='stash';render();scrollTo(0,0)">🧶 ${de?'Zum Garnlager':'Go to stash'}</button></section>`}
};
function vTausch(){return TB.view()}
