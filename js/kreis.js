// ===== Einladungscode: ohne Code öffnet sich das Maschenbuch nicht =====
// Der Code wird in Supabase geprüft (dort liegt er nur als Hash). Einmal richtig eingegeben,
// merkt sich das Gerät ihn, danach geht das Maschenbuch auch offline auf.
// Nach der Google-Anmeldung tritt man damit dem Freundeskreis bei (siehe SB.join in cloud.js);
// nur Mitglieder sehen in der Datenbank Knit-Along, Tauschbörse und ihren gespeicherten Stand.
const GATE={msg:'',
  code(){try{return localStorage.getItem('mb.kreis')||''}catch(e){return ''}},
  ok(){return !!this.code()},
  view(){const de=DB.lang==='de';document.body.classList.add('gate');
    $('ttl').textContent='Maschenbuch';$('ttl').onclick=null;$('sub').textContent='';$('nav').innerHTML='';
    $('app').innerHTML=`<section class="card gatec"><div class="gi" aria-hidden="true">🧶</div><h2>${de?'Willkommen im Maschenbuch':'Welcome to Maschenbuch'}</h2>
      <p class="mu">${de?'Das Maschenbuch ist privat. Bitte gib den Einladungscode ein, den du bekommen hast.':'Maschenbuch is private. Please enter the invitation code you received.'}</p>
      <input type="text" id="gcode" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="${de?'Einladungscode':'Invitation code'}" aria-label="${de?'Einladungscode':'Invitation code'}" onkeydown="if(event.key==='Enter')GATE.check()">
      <button class="pri" id="gbtn" onclick="GATE.check()">${de?'Öffnen':'Open'}</button>
      ${this.msg?`<p class="warn" role="alert">${esc(this.msg)}</p>`:''}</section>`},
  async check(){const de=DB.lang==='de',i=$('gcode'),v=i.value.trim();if(!v)return i.focus();
    const show=m=>{this.msg=m;this.view();$('gcode').value=v};
    if(!SB.c||!navigator.onLine)return show(de?'Zum ersten Öffnen brauchst du eine Internetverbindung.':'You need an internet connection the first time.');
    $('gbtn').disabled=true;
    let r;try{r=await SB.c.rpc('kreis_code_pruefen',{code:v})}catch(e){r={error:e}}
    if(r.error)return show(/zu_viele/.test(r.error.message||'')?(de?'Zu viele Versuche. Bitte in 15 Minuten nochmal probieren.':'Too many attempts. Please try again in 15 minutes.'):(de?'Gerade keine Verbindung. Bitte nochmal versuchen.':'No connection right now. Please try again.'));
    if(!r.data)return show(de?'Der Code stimmt leider nicht.':'That code is not correct.');
    try{localStorage.setItem('mb.kreis',v)}catch(e){}
    this.msg='';document.body.classList.remove('gate');tab='home';render();if(SB.user)SB.start()},
  // Code gilt nicht mehr (z. B. geändert und noch nicht beigetreten): wieder nach dem Code fragen
  reset(msg){try{localStorage.removeItem('mb.kreis')}catch(e){}this.msg=msg||'';render()}
};
