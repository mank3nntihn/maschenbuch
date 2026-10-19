// ===== Tutorial: geführte Tour durch das Maschenbuch (Menü → Extras → Tutorial) =====
// Ein Lichtkegel hebt das jeweilige Element hervor, daneben eine kurze Erklärung.
// Die Tour wechselt nur Seiten und öffnet das Menü – sie zählt nichts und ändert keine Daten.
// Schritte, deren Element gerade nicht da ist (z. B. kein Knit-Along), werden übersprungen.
const TOUR={on:false,i:0,list:[],back:null,
  steps(){const de=DB.lang==='de',T=(d,e)=>de?d:e,home=()=>{tab='home'},count=()=>{tab='count';DB.live=false},menu=1;
    return [
      {at:home,t:T('Willkommen im Maschenbuch 🧶','Welcome to Maschenbuch 🧶'),x:T('In ein paar Schritten zeige ich dir alles Wichtige. Du kannst nichts kaputt machen – die Tour zählt nichts und ändert nichts.','A few steps through the most important parts. Nothing gets counted or changed during the tour.')},
      {at:home,sel:'.pc',t:T('Deine Projekte','Your projects'),x:T('Hier liegen alle Projekte mit Fortschrittsbalken und wann zuletzt gestrickt wurde. Antippen öffnet den Zähler.','All your projects with progress and when you last knitted. Tap one to open its counter.')},
      {at:home,sel:'#sbb',t:T('Anmelden','Sign in'),x:T('Mit Google angemeldet sind deine Projekte auf allen Geräten gleich, und du kannst beim Knit-Along mitmachen.','Sign in with Google to sync across devices and join the knit-along.')},
      {at:home,sel:'.kh',t:T('Knit-Along','Knit-along'),x:T('Mit deinem Namen sehen deine Freundinnen deinen Fortschritt – und du ihren.','With a name, friends see your progress and you see theirs.')},
      {at:count,sel:'.big',t:T('Der Zähler','The counter'),x:T('So weit bist du im aktuellen Projekt. Darunter steht, welche Reihe du gerade strickst.','How far you are in the current project, and which row you are knitting now.')},
      {at:count,sel:'.ins',t:T('Was in dieser Reihe zu tun ist','What to do in this row'),x:T('Die Anleitung für genau diese Reihe. Unterstrichene Abkürzungen kannst du antippen, dann kommt eine Erklärung mit Animation.','The instructions for this exact row. Tap an underlined abbreviation for an explanation with animation.')},
      {at:count,sel:'.pad .plus',t:T('Reihe fertig','Row done'),x:T('Nach jeder fertigen Reihe hier tippen. Mit −1 daneben korrigierst du, wenn du dich vertippt hast.','Tap after every finished row. Use −1 next to it if you tapped by mistake.')},
      {at:count,sel:'.alert,.soon',t:T('Reihen-Merker','Row reminder'),x:T('Kommt bald eine besondere Reihe (z. B. Zunahme oder Farbwechsel), warnt dich das Maschenbuch rechtzeitig.','Before a special row (e.g. an increase or colour change) you get a heads-up.')},
      {at:count,sel:'.jb',t:T('Reihe eingeben','Enter row'),x:T('Du bist woanders? Hier die Reihe eintippen, die du gerade strickst.','Somewhere else? Type the row you are knitting right now.')},
      {at:count,sel:'.fbtn',t:T('Großer Zähler','Big counter'),x:T('Vollbild mit riesigem +1-Knopf – praktisch, wenn das Handy beim Stricken neben dir liegt.','Full screen with a huge +1 button, handy when your phone lies next to you.')},
      {at:count,sel:'button.livebtn[aria-expanded]',t:T('3D-Live-Ansicht','Live 3D view'),x:T('Zeigt dein Teil in 3D, wie weit es schon gestrickt ist.','Shows your piece in 3D as far as you have knitted it.')},
      {at:count,sel:'#kalc .kr',t:T('Deine Freundinnen','Your friends'),x:T('Die Balken der anderen. Ein grüner Punkt heißt: strickt gerade.','Your friends’ bars. A green dot means: knitting right now.')},
      {at:count,sel:'nav',t:T('Die Tabs','The tabs'),x:T('Zähler, Anleitung, Wolle, 3D und Maße – alles zum aktuellen Projekt.','Counter, pattern, yarn, 3D and size – all for the current project.')},
      {at:()=>{tab='steps'},sel:['.st li.n','.st li'],t:T('Anleitung','Pattern'),x:T('Die ganze Anleitung Schritt für Schritt – hier der Schritt, an dem du gerade bist. Erledigtes ist abgehakt, und ein Tipp auf einen Schritt setzt den Zähler dorthin.','The whole pattern step by step. Done parts are ticked; tap a step to move the counter there.')},
      {at:()=>{tab='wool'},sel:'#app .card',t:T('Wolle','Yarn'),x:T('Wie viel Garn du brauchst und ob dein Garnlager reicht. Fehlendes kommt mit einem Tipp auf die Einkaufsliste.','How much yarn you need and whether your stash covers it. Missing yarn goes on the shopping list with one tap.')},
      {at:()=>{tab='size'},sel:'#app .swb',t:T('Maße und Farben','Size and colours'),x:T('Größe, Nadel und Farben einstellen. Der Farbknopf öffnet alle Hobbii-Garne – mit Filtern für Angebote und passende Nadelstärke.','Set size, needle and colours. The colour button opens all Hobbii yarns, with filters for sales and needle size.')},
      {at:home,sel:'#mb',t:T('Das Menü','The menu'),x:T('Über die drei Striche erreichst du alles Weitere. Schauen wir rein.','The three lines lead to everything else. Let’s have a look.')},
      {at:home,menu,sel:'#side select',t:T('Projekte wechseln','Switch projects'),x:T('Hier wechselst du das Projekt oder legst mit einer Vorlage ein neues an.','Switch project here or start a new one from a template.')},
      {at:home,menu,sel:'#side .lnk[data-k=stash]',t:T('Garnlager','Yarn stash'),x:T('Was zuhause liegt. 🛒 setzt ein Garn auf die Einkaufsliste, 🤝 gibt es in die Tauschbörse.','What you have at home. 🛒 adds it to the shopping list, 🤝 offers it in the swap.')},
      {at:home,menu,sel:'#side .lnk[data-k=shop]',t:T('Einkaufsliste','Shopping list'),x:T('Mit 🏷️, wenn ein Garn darauf gerade bei Hobbii reduziert ist.','Marked 🏷️ when a yarn on it is on sale at Hobbii.')},
      {at:home,menu,sel:'#side .lnk[data-k=tausch]',t:T('Tauschbörse','Yarn swap'),x:T('Garnreste abgeben und bei den anderen „Hätte ich gern“ tippen.','Give away leftovers and tap “I’d like it” on others’ offers.')},
      {at:home,menu,sel:'#side .lnk[data-k=help]',t:T('Hilfe & Techniken','Help & techniques'),x:T('Alle Techniken mit Animationen zum Nachmachen.','All techniques with animations to follow along.')},
      {at:home,menu,sel:'#side .lnk[data-k=settings]',t:T('Einstellungen','Settings'),x:T('Farbmuster (auch dunkel), Abkürzungen, Bildschirm anlassen, Knit-Along und dein Konto.','Colour schemes (also dark), abbreviations, keep screen on, knit-along and your account.')},
      {at:home,menu,sel:'#side .lnk[data-k=tour]',t:T('Fertig! 🎉','Done! 🎉'),x:T('Das Tutorial findest du jederzeit hier wieder. Viel Spaß beim Stricken!','You can find the tutorial here any time. Happy knitting!')}
    ]},
  start(){if(this.on)return;this.back={tab,cur:DB.cur,live:DB.live};this.list=this.steps();this.on=true;this.i=0;
    let o=$('tour');if(!o){o=document.createElement('div');o.id='tour';o.innerHTML='<div class="tblock"></div><div id="tourhl" class="thl"></div><div id="tourb" class="tbub" role="dialog" aria-modal="true" aria-live="polite"></div>';document.body.appendChild(o)}
    o.hidden=false;document.addEventListener('keydown',this.key,true);addEventListener('resize',this.re);this.show(0,1)},
  key:e=>{if(!TOUR.on)return;if(e.key==='Escape'){e.preventDefault();e.stopPropagation();TOUR.end()}else if(e.key==='ArrowRight'||e.key==='Enter'){e.preventDefault();e.stopPropagation();TOUR.next()}else if(e.key==='ArrowLeft'){e.preventDefault();e.stopPropagation();TOUR.prev()}else e.stopPropagation()},
  re:()=>TOUR.place(),
  // Schritt i anzeigen; dir = Richtung, falls ein Element fehlt und übersprungen wird
  async show(i,dir){const s=this.list[i];if(!s)return this.end();this.i=i;
    popClose&&popClose();s.at();const m=!!s.menu;if(menuOpen!==m)menu(m);render();if(m)renderMenu();
    if(m)await new Promise(r=>setTimeout(r,320)); // Menü fährt herein
    const el=this.find(s);
    if(s.sel&&!el){const j=i+(dir<0?-1:1);if(j>=0&&j<this.list.length)return this.show(j,dir);}
    this.el=el;if(el)el.scrollIntoView({block:el.getBoundingClientRect().height>innerHeight*.5?'start':'center',behavior:'instant'});
    const de=DB.lang==='de',n=this.list.length;
    $('tourb').innerHTML=`<div class="tprog" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round((i+1)/n*100)}"><i style="width:${(i+1)/n*100}%"></i></div><h3>${s.t}</h3><p>${s.x}</p>
      <div class="tbtn">${i===n-1?'<span class="tsp"></span>':`<button type="button" class="ghost" onclick="TOUR.end()">${de?'Beenden':'Skip'}</button>`}
      ${i>0?`<button type="button" onclick="TOUR.prev()">${de?'Zurück':'Back'}</button>`:''}<button type="button" class="pri" id="tnext" onclick="TOUR.next()">${i===n-1?(de?'Fertig':'Finish'):(de?'Weiter':'Next')}</button></div>`;
    requestAnimationFrame(()=>{this.place();const b=$('tnext');if(b)b.focus({preventScroll:true})})},
  // erstes vorhandene Element (sel kann eine Liste von Alternativen sein)
  find(s){if(!s||!s.sel)return null;for(const q of [].concat(s.sel)){const e=document.querySelector(q);if(e&&e.getClientRects().length)return e}return null},
  // Lichtkegel und Sprechblase passend zum Element setzen
  place(){if(!this.on)return;const hl=$('tourhl'),b=$('tourb');if(!hl||!b)return;const W=innerWidth,H=innerHeight,s=this.list[this.i];
    let el=this.el;if(el&&!el.isConnected)el=this.el=this.find(s); // Seite wurde neu gezeichnet
    if(!el||!el.isConnected){hl.style.cssText='left:50%;top:50%;width:0;height:0';b.style.left=Math.max(16,(W-b.offsetWidth)/2)+'px';b.style.top=Math.max(16,(H-b.offsetHeight)/2)+'px';return}
    const r=el.getBoundingClientRect(),p=6,x=Math.max(4,r.left-p),y=Math.max(4,r.top-p),w=Math.min(W-8,r.right+p)-x,h=Math.min(H-8,r.bottom+p,y+Math.max(80,H-b.offsetHeight-40-y))-y;
    hl.style.cssText=`left:${x}px;top:${y}px;width:${w}px;height:${h}px`;
    const bh=b.offsetHeight,bw=b.offsetWidth,gap=12;let top=y+h+gap<=H-bh-12?y+h+gap:y-gap-bh>=12?y-gap-bh:H-bh-16;
    b.style.top=Math.max(12,top)+'px';b.style.left=Math.min(Math.max(16,r.left+r.width/2-bw/2),W-bw-16)+'px'},
  next(){this.i<this.list.length-1?this.show(this.i+1,1):this.end()},
  prev(){if(this.i>0)this.show(this.i-1,-1)},
  end(){if(!this.on)return;this.on=false;const o=$('tour');if(o)o.hidden=true;document.removeEventListener('keydown',this.key,true);removeEventListener('resize',this.re);
    const b=this.back||{};menu(0);tab=b.tab||'home';if(b.live!==undefined)DB.live=b.live;render();scrollTo(0,0)}
};
