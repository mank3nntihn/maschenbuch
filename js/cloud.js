// ===== Cloud: Anmeldung mit Google, Synchronisierung über Supabase, "strickt gerade" =====
// Datenbank-Tabellen: user_state (eigener Stand), kal (Knit-Along-Balken), tausch/tausch_wunsch (Tauschbörse).
// Der Schlüssel unten ist der öffentliche Anon-Key, die Daten schützt Row Level Security in Supabase.

// Sync-Zustand für die Anzeige ("Synchronisiert", "Gerade keine Verbindung") und für ungespeicherte Änderungen
const SYNC={st:'none',dirty:localStorage.getItem('mb.dirty')==='1',
  touch(){this.dirty=true;try{localStorage.setItem('mb.dirty','1')}catch(e){}if(SB.user)SB.touch()},
  clean(){this.dirty=false;try{localStorage.setItem('mb.dirty','0')}catch(e){}},
  status(st){if(this.st===st)return;this.st=st;document.querySelectorAll('.syn').forEach(e=>e.outerHTML=this.html(e.dataset.s))},
  html(small){const de=DB.lang==='de',T={ok:de?'Synchronisiert auf allen deinen Geräten':'Synced across your devices',busy:de?'Synchronisiere …':'Syncing …',err:de?'Gerade keine Verbindung – Änderungen werden nachgeholt':'Offline – will sync later'};
    return `<p class="syn ${this.st}" data-s="${small?1:''}"><i></i>${T[this.st]||''}</p>`},
  // Stand vom Server übernehmen; tippt man gerade in ein Feld, wird erst danach neu gezeichnet
  adopt(d){const curId=S&&S.id,n={...clone(DEFDB),...d};n.projects=(n.projects||[]).map(fixP);if(!n.projects.length)n.projects=[fixP(clone(DEFS))];
    const ci=n.projects.findIndex(p=>p.id===curId);n.cur=ci>=0?ci:Math.min(n.cur|0,n.projects.length-1);
    const before=JSON.stringify(DB);DB=n;S=DB.projects[DB.cur];save(true);
    if(JSON.stringify(DB)!==before){const a=document.activeElement;if(a&&/INPUT|SELECT|TEXTAREA/.test(a.tagName)&&!$('jr'))this.later=true;else if(!$('pk')||$('pk').hidden)render();else this.later=true}}
};
document.addEventListener('focusout',()=>{if(SYNC.later){SYNC.later=false;setTimeout(()=>{const a=document.activeElement;if(!(a&&/INPUT|SELECT|TEXTAREA/.test(a.tagName)))render()},50)}});

var SB={url:'https://nwrcohvrxxsccyllgfzl.supabase.co',key:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cmNvaHZyeHhzY2N5bGxnZnpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxMzU2NzYsImV4cCI6MjEwNzcxMTY3Nn0.9uL7MnSKKFQ_9sm2FNGbXiuyXTf3V8wRITkBv07llHA',
  c:null,user:null,timer:0,busy:false,last:'',first:true,online:new Set(),tracked:false,
  init(){if(!window.supabase||!supabase.createClient)return;
    this.c=supabase.createClient(this.url,this.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
    this.c.auth.onAuthStateChange((ev,s)=>{const u=s&&s.user||null;if((u&&u.id)===(this.user&&this.user.id))return;this.user=u;this.start()});
    this.c.auth.getSession().then(({data})=>{const u=data.session&&data.session.user||null;if(u&&(!this.user||this.user.id!==u.id)){this.user=u;this.start()}})},
  stop(){clearTimeout(this.jt);if(this.ch){this.c.removeChannel(this.ch);this.ch=null}if(this.pch){this.c.removeChannel(this.pch);this.pch=null}
    this.online=new Set();this.tracked=false;TB.rows=[];TB.wish=[];TB.loaded=false},
  start(){this.stop();
    if(!this.user){SYNC.status('none');KAL.id=null;render();return}
    if(!GATE.ok()){render();return}
    KAL.id=this.user.id;SYNC.st='busy';SYNC.status('busy');this.first=true;
    // Prüfen, ob das Konto auf dem Server noch existiert (z. B. nach dem Löschen in Supabase)
    if(navigator.onLine)this.c.auth.getUser().then(({data,error})=>{if(error&&error.status&&error.status<500||!error&&!data.user)this.gone()}).catch(()=>{});
    this.join()},
  // Mit dem Einladungscode dem Freundeskreis beitreten (Mitglieder bleiben es, auch wenn sich der Code ändert)
  async join(){const me=this.user;let r;try{r=await this.c.rpc('kreis_beitreten',{code:GATE.code()})}catch(e){r={error:e}}
    if(this.user!==me||!me)return;
    if(r.error){SYNC.status('err');clearTimeout(this.jt);this.jt=setTimeout(()=>{if(this.user===me&&!this.ch)this.join()},navigator.onLine?10000:60000);return}
    if(!r.data)return GATE.reset(DB.lang==='de'?'Der Einladungscode hat sich geändert. Bitte gib den neuen Code ein.':'The invitation code has changed. Please enter the new code.');
    this.connect()},
  // Live-Verbindungen öffnen und alles laden (erst nach dem Beitritt, sonst lässt die Datenbank nichts durch)
  connect(){
    this.ch=this.c.channel('mb-'+this.user.id)
      .on('postgres_changes',{event:'*',schema:'public',table:'user_state',filter:'user_id=eq.'+this.user.id},p=>{if(p.new&&p.new.data)this.remote(p.new.data)})
      .on('postgres_changes',{event:'*',schema:'public',table:'kal'},p=>{if(p.eventType==='DELETE'){const id=p.old&&p.old.user_id;if(id){delete KAL.peers[id];delete KAL.cache[id];KAL.paint()}}else this.kalRow(p.new)})
      .on('postgres_changes',{event:'*',schema:'public',table:'tausch'},()=>TB.later())
      .on('postgres_changes',{event:'*',schema:'public',table:'tausch_wunsch'},()=>TB.later())
      .subscribe();
    // "Strickt gerade": wer die App offen im Zähler hat, bekommt einen grünen Punkt
    this.pch=this.c.channel('online',{config:{presence:{key:this.user.id}}});
    this.pch.on('presence',{event:'sync'},()=>{const st=this.pch?this.pch.presenceState():{};this.online=new Set(Object.keys(st));KAL.paint()})
      .subscribe(s=>{if(s==='SUBSCRIBED'){this.tracked=null;this.presence()}});
    this.c.from('user_state').select('data').eq('user_id',this.user.id).maybeSingle().then(({data,error})=>{
      if(error){SYNC.status('err');return}
      if(!data){this.first=false;this.push();return}
      this.remote(data.data)}).catch(()=>SYNC.status('err'));
    this.c.from('kal').select('*').then(({data})=>{(data||[]).forEach(r=>this.kalRow(r))}).catch(()=>{});
    TB.load();KAL.push(1);render()},
  presence(){if(!this.pch||!this.user)return;
    const on=!document.hidden&&(tab==='count'||FOC.on)&&DB.kalShare!==false&&!!(DB.kalName||'').trim();
    if(on===this.tracked)return;this.tracked=on;
    try{const r=on?this.pch.track({at:Date.now()}):this.pch.untrack();if(r&&r.catch)r.catch(()=>{this.tracked=null})}catch(e){this.tracked=null}},
  // Stand vom Server: bei ungespeicherten Änderungen zusammenführen, sonst übernehmen
  remote(r){if(!r||!Array.isArray(r.projects))return;const j=JSON.stringify(r);if(j===this.last){SYNC.status('ok');return}
    if(SYNC.dirty||this.first&&(DB.mod||0)>(r.mod||0)){SYNC.adopt(merge(DB,r));this.first=false;this.last=j;this.push()}
    else{SYNC.adopt(r);this.first=false;this.last=j;SYNC.clean();SYNC.status('ok')}},
  touch(){clearTimeout(this.timer);this.timer=setTimeout(()=>this.push(),800)},
  slow(e){return !!e&&/zu_schnell/.test(e.message||'')},
  async push(){if(!this.user)return;if(this.busy){this.touch();return}const j=JSON.stringify(DB);if(j===this.last){SYNC.clean();SYNC.status('ok');return}
    this.busy=true;SYNC.status('busy');
    try{const {error}=await this.c.from('user_state').upsert({user_id:this.user.id,data:DB});
      if(error&&(error.code==='23503'||error.code==='PGRST301'||error.status===401)){this.busy=false;return this.gone()}
      if(this.slow(error)){clearTimeout(this.timer);this.timer=setTimeout(()=>this.push(),700);return}// Schreib-Bremse: kurz warten, dann nochmal
      if(error)throw error;this.last=j;SYNC.clean();SYNC.status('ok')}
    catch(e){SYNC.status('err');clearTimeout(this.timer);this.timer=setTimeout(()=>this.push(),navigator.onLine?10000:60000)}
    finally{this.busy=false}},
  // Nach einem Funkloch: Stand holen, eigene Änderungen nachschicken
  backOnline(){if(!this.user||!GATE.ok())return;if(!this.ch)return this.join();this.c.from('user_state').select('data').eq('user_id',this.user.id).maybeSingle().then(({data,error})=>{if(error)throw error;if(data&&data.data)this.remote(data.data);if(SYNC.dirty)this.push()}).catch(()=>SYNC.status('err'));KAL.push(1)},
  kalRow(r){if(!r||!r.user_id||r.user_id===(this.user&&this.user.id))return;KAL.take(r.user_id,{name:r.name,proj:r.proj,pct:r.pct,row:r.row_no,total:r.total,col:r.col,ts:Date.parse(r.updated_at)||Date.now()});KAL.paint()},
  async kalSend(m,on){if(!this.user)return;const key=on?JSON.stringify({...m,ts:0}):'off';if(key===this.kalLast)return;this.kalLast=key;
    const {error}=on?await this.c.from('kal').upsert({user_id:this.user.id,name:m.name,proj:m.proj.slice(0,40),pct:m.pct,row_no:m.row,total:m.total,col:/^#[0-9a-f]{6}$/i.test(m.col)?m.col:'#f4a6c6'})
      :await this.c.from('kal').delete().eq('user_id',this.user.id);
    if(error){this.kalLast='';if(this.slow(error))KAL.push()}},
  async login(){const de=DB.lang==='de',b=$('sbb');if(b)b.disabled=true;
    const {error}=await this.c.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin+location.pathname}});
    if(error){if(b)b.disabled=false;ask((de?'Die Anmeldung hat nicht geklappt: ':'Sign-in failed: ')+error.message,{info:1})}},
  out(){clearTimeout(this.timer);this.stop();this.user=null;this.last='';this.kalLast='';KAL.id=null;SYNC.status('none');tab='home';render()},
  async gone(){// Konto gibt es nicht mehr: lokal abmelden, Projekte bleiben auf dem Gerät
    try{await this.c.auth.signOut({scope:'local'})}catch(e){}
    this.out();toast(DB.lang==='de'?'Bitte neu anmelden':'Please sign in again')},
  async logout(){try{await this.c.auth.signOut()}catch(e){try{await this.c.auth.signOut({scope:'local'})}catch(e2){}}this.out()},
  async deleteMe(){const de=DB.lang==='de';
    if(!await ask(de?'Konto wirklich löschen? Deine Daten in der Cloud (Projekte, Knit-Along und Tauschangebote) werden endgültig entfernt. Auf diesem Gerät bleiben deine Projekte erhalten.':'Really delete your account? Your cloud data (projects, knit-along and swap offers) will be removed for good. Your projects stay on this device.'))return;
    if(!navigator.onLine)return ask(de?'Dafür brauchst du eine Internetverbindung.':'You need an internet connection for this.',{info:1});
    const {error}=await this.c.rpc('delete_my_account');
    if(error)return ask((de?'Das Löschen hat nicht geklappt: ':'Deleting failed: ')+error.message,{info:1});
    try{await this.c.auth.signOut({scope:'local'})}catch(e){}
    this.out();toast(de?'Konto gelöscht':'Account deleted')},
  // Karte "Anmelden" auf der Startseite
  card(){const de=DB.lang==='de';if(!this.c||this.user)return '';
    return `<section class="card"><h2>${de?'Anmelden':'Sign in'}</h2><p class="mu">${de?'Mit deinem Google-Konto sind deine Projekte auf allen Geräten gleich und du kannst beim Knit-Along mitmachen. Ohne Anmeldung bleibt alles nur in diesem Browser.':'Sign in with Google to sync your projects across devices and join the knit-along. Without signing in, everything stays in this browser.'}</p>
      <button class="gbtn" id="sbb" onclick="SB.login()"><svg viewBox="0 0 48 48" width="22" height="22" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.2-.1-2.3-.4-3.5z"/></svg><span>${de?'Mit Google anmelden':'Sign in with Google'}</span></button></section>`},
  // Karte "Konto" in den Einstellungen
  settings(){const de=DB.lang==='de';if(!this.c||!this.user)return '';
    return `<section class="card"><h2>${de?'Konto':'Account'}</h2><p class="mu">${de?'Angemeldet als':'Signed in as'} <b>${esc(this.user.email||'')}</b></p>
      <button class="ghost" id="sbout" onclick="SB.logout()">${de?'Abmelden':'Sign out'}</button>
      <button class="ghost del" id="sbdel" onclick="SB.deleteMe()">${de?'Konto löschen':'Delete account'}</button></section>`}
};

addEventListener('online',()=>SB.backOnline());
addEventListener('offline',()=>{if(SB.user)SYNC.status('err')});
document.addEventListener('visibilitychange',()=>{SB.presence();if(!document.hidden&&navigator.onLine&&SB.user&&SYNC.st==='err')SB.backOnline()});
addEventListener('pagehide',()=>{if(SB.pch&&SB.tracked){try{SB.pch.untrack()}catch(e){}}});
