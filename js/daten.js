// ===== Daten: Grundwerte, Vorlagen, Speichern, Export/Import, Zusammenführen =====
// Hilfsfunktionen, die überall gebraucht werden
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=id=>document.getElementById(id);
const KEY='maschenbuch.v4';
const NEEDLES=[2,2.5,3,3.5,4,4.5,5,5.5,6,7,8,9,10,12,15];
// Sophie Scarf (PetiteKnit): Maschenprobe 22 M x 42 R kraus re = 10 x 10 cm, Kaschmir 25 g = 115 m
const SZ={s:{R1:22,R2:21,len:80,wid:11,g:20,g2:32},l:{R1:27,R2:26,len:102,wid:13,g:28,g2:44}};
// The Weekend Scarf (The Long Weekend): 2x2 Rippen, Maschenprobe 16 M x 10 R = 2 x 2 Zoll (entspannt), Nadel 5 mm
const WZ={big:{cast:36,half:204,len:203,wid:11.5,yd:270,g:200},little:{cast:24,half:108,len:109,wid:7.5,yd:135,g:100}};
const DEFW={tpl:'weekend',name:'Weekend Scarf',size:'big',tech:'knit',needle:5,mpb:119,w:11.5,l:203,sts:31.5,rows:19.7,row:0,stripes:[{n:'Orange',c:'#e8742a',r:2},{n:'Banana',c:'#f3d36b',r:2}]};
const DEFS={tpl:'sophie',name:'Sophie Scarf',size:'s',needle:3.5,mpb:115,row:0,stripes:[{n:'Rosa',c:'#f4a6c6',r:40}]};
// Córdoba Top (Alma Patterns): von oben nach unten, Raglan, glatt re. Maschenprobe 21 M x 32 R = 10 x 10 cm, Nadel 3,5 mm
// Je Größe xxs, xs, s, m, l, xl, xxl. Prüfung: co + 8·y = 2·f + 2·sl + bk + 4 (4 Raglanmaschen)
const CZ=['xxs','xs','s','m','l','xl','xxl'];
const CD={bust:[78,82,86,90,94,98,102],m:[550,600,650,700,750,800,850],co:[118,120,128,134,134,124,134],
  a:[15,15,16,16,16,14,15],b:[20,21,23,25,25,23,26],c:[42,42,44,46,46,44,46],d:[16,16,17,17,17,15,16],
  y:[17,19,20,20,22,24,25],f:[33,35,37,37,39,39,41],sl:[54,59,63,65,69,71,76],bk:[76,80,84,86,90,92,96],
  u:[4,4,4,6,6,8,8],ni:[3,3,3,4,4,5,5],len:[34,35,35,36,36,37,37],pu:[7,7,7,9,9,11,11],op:[60,60,64,66,70,76,80],cord:[140,140,150,150,150,160,160],
  div:[200,250,250,250,300,300,300],ani:[150,150,200,200,200,200,250],org:[150,150,150,200,200,200,200]};
// pat: Merkmal, das auch alte Versionen der Seite beim Speichern behalten (die kennen tpl 'cordoba' noch nicht)
const DEFC={tpl:'cordoba',pat:'cordoba',name:'Córdoba Top',size:'s',tech:'knit',needle:3.5,mpb:140,l:35,sts:21,rows:32,row:0,stripes:[{n:'Rosa',c:'#f4a6c6',r:999}]};
// Werkzeuge je Vorlage: was unter „Maße“ zusätzlich erscheint. Neue Vorlage → hier eintragen, was zu ihrer Bauweise passt.
// raglan = Raglan-Rechner (nur für Oberteile, die mit Raglan gestrickt werden)
const TOOLS={sophie:[],weekend:[],stripe:[],cordoba:['raglan']};
const hasTool=k=>(TOOLS[S&&S.tpl]||[]).includes(k);
const DEFST={tpl:'stripe',name:'Streifenschal',tech:'knit',w:20,l:150,sts:20,rows:36,mpb:125,needle:4.5,row:0,stripes:[{n:'Rosa',c:'#f4a6c6',r:24},{n:'Babyblau',c:'#a9d6f5',r:12},{n:'Perlweiß',c:'#fff4f8',r:24}]};
const DEFDB={lang:'de',theme:'rose',abbr:true,live:false,liveView:'flat',cur:0,projects:[DEFS],stash:[{n:'Rosa',c:'#f4a6c6',b:1,m:115,nd:3.5}],shop:[]};
const clone=o=>JSON.parse(JSON.stringify(o));
const byId=id=>DB.projects.find(q=>q.id===id);
const rid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const fixP=p=>{if(p.pat==='cordoba'||p.tpl==='cordoba'){const q={...clone(DEFC),...p,tpl:'cordoba',pat:'cordoba'};if(!CZ.includes(q.size))q.size='s';if(!q.id)q.id=rid();return q}
  const q=p.tpl==='sophie'?{...clone(DEFS),...p}:p.tpl==='weekend'?{...clone(DEFW),...p}:{...clone(DEFST),...p,tpl:'stripe'};if(!q.id)q.id=rid();return q};

// Farbmuster (Einstellungen → Farbmuster)
const THEMES={
 rose:{de:'Rosa & Babyblau',en:'Pink & baby blue',bgg:'linear-gradient(160deg,#d6ebfb 0%,#e9e4fa 50%,#fde0ec 100%)',gl:'linear-gradient(180deg,#f7fbff,#fdeaf3)',ac:'#f6a9c9',ok:'#8ccbf0',ln:'#cfe2f3',fld:'#f6fbff'},
 lilac:{de:'Flieder & Mint',en:'Lilac & mint',bgg:'linear-gradient(160deg,#dcf5ec 0%,#ebe5fb 55%,#e2d8fb 100%)',gl:'linear-gradient(180deg,#f4fdf9,#f1ebfe)',ac:'#c8b3f3',ok:'#93dcbf',ln:'#d9e6e2',fld:'#f8fcfb'},
 peach:{de:'Pfirsich & Himmelblau',en:'Peach & sky blue',bgg:'linear-gradient(160deg,#ffe3d3 0%,#fff1e6 50%,#d9eeff 100%)',gl:'linear-gradient(180deg,#fff7f1,#e8f4ff)',ac:'#fbb796',ok:'#98cdf3',ln:'#f1dccf',fld:'#fffaf6'},
 lemon:{de:'Zitrone & Lavendel',en:'Lemon & lavender',bgg:'linear-gradient(160deg,#fff6c9 0%,#f6efff 55%,#e4dcff 100%)',gl:'linear-gradient(180deg,#fffcec,#efe9ff)',ac:'#f5d96b',ok:'#c1aef0',ln:'#e9e1c6',fld:'#fffdf4'},
 night:{de:'Nacht (dunkel)',en:'Night (dark)',dark:1,bgg:'linear-gradient(160deg,#121018 0%,#17131d 55%,#1b1420 100%)',gl:'linear-gradient(180deg,#1a1722,#201823)',ac:'#b8668c',ok:'#4f86a8',ln:'#2e2838',fld:'#1d1925',sf:'rgba(30,26,38,.92)',ink:'#e6dfee',mu:'#a69cb8',on:'#fff4fa'},
 mint:{de:'Minze & Rosé',en:'Mint & rosé',bgg:'linear-gradient(160deg,#d3f4ec 0%,#f0f7f4 50%,#ffdfe6 100%)',gl:'linear-gradient(180deg,#f2fcf9,#fff0f3)',ac:'#f3a3b5',ok:'#86d8c2',ln:'#d0e8e1',fld:'#f6fdfb'}
};

// Gesamter Stand: Projekte, Garnlager, Einkaufsliste, Einstellungen. S = aktuelles Projekt, tab = aktuelle Seite
let DB=load(),S=DB.projects[DB.cur],tab='home',menuOpen=false,newTpl='sophie';
function load(){
  try{const j=localStorage.getItem(KEY);if(j){const d={...clone(DEFDB),...JSON.parse(j)};d.projects=(d.projects||[]).map(fixP);if(!d.projects.length)d.projects=[clone(DEFS)];d.cur=Math.min(d.cur,d.projects.length-1);return d}}catch(e){}
  return clone(DEFDB)}
const SNAP={};const pj=p=>{const{mod,...r}=p;return JSON.stringify(r)};function snap(){DB.projects.forEach(p=>SNAP[p.id]=pj(p))}
// save(): lokal speichern und (außer bei local) geänderte Projekte mit Zeitstempel versehen und synchronisieren
function save(local){if(!local){const n=Date.now();DB.projects.forEach(p=>{const j=pj(p);if(SNAP[p.id]!==j){p.mod=n;SNAP[p.id]=j}});DB.mod=n;SYNC.touch()}else snap();try{localStorage.setItem(KEY,JSON.stringify(DB))}catch(e){}}
const t=k=>TX[DB.lang][k];
const fmt=n=>DB.lang==='de'?String(n).replace('.',','):String(n);
// abx: angezeigter Text, Glossar-Schlüssel, ausgeschriebene Form
const abx=(shown,key,full)=>DB.abbr?`<abbr class="ab" data-k="${esc(key)}">${esc(String(shown).replace(/-/g,'\u2011'))}</abbr>`:esc(String(full??FULL[DB.lang][key]??shown).replace(/-/g,'\u2011'));
const ab=(k,full)=>abx(k,k,full);
function toast(m,ms=1800){const d=document.createElement('div');d.className='toast';d.textContent=m;document.body.appendChild(d);setTimeout(()=>d.remove(),ms)}

// ===== Export / Import =====
function exportDB(){const d=new Date().toISOString().slice(0,10),b=new Blob([JSON.stringify({app:'maschenbuch',v:4,datum:d,daten:DB},null,1)],{type:'application/json'});
  const a=Object.assign(document.createElement('a'),{href:URL.createObjectURL(b),download:`maschenbuch-${d}.json`});document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000)}
function importDB(inp){const f=inp.files[0];inp.value='';if(!f)return;const de=DB.lang==='de';
  f.text().then(async x=>{const j=JSON.parse(x),d=j&&j.app==='maschenbuch'?j.daten:j;
    if(!d||!Array.isArray(d.projects)||!d.projects.length||!Array.isArray(d.stash))throw 0;
    if(!await ask(de?`Sicherung vom ${j.datum||'?'} laden? Der aktuelle Stand wird ersetzt.`:`Load backup from ${j.datum||'?'}? Current data will be replaced.`))return;
    const n={...clone(DEFDB),...d};n.projects=n.projects.map(fixP);n.cur=Math.min(Math.max(0,n.cur|0),n.projects.length-1);
    DB=n;S=DB.projects[DB.cur];save();menu(0);tab='count';render();toast(de?'Sicherung geladen':'Backup loaded')})
  .catch(()=>ask(de?'Diese Datei ist keine gültige Maschenbuch-Sicherung.':'This file is not a valid backup.',{info:1}))}

// Zwei Stände zusammenführen: pro Projekt gewinnt der neuere, gelöschte bleiben gelöscht, Rest vom neueren Gesamtstand
function merge(a,b){const A=a.mod||0,B=b.mod||0,base=clone(A>=B?a:b),del=[...new Set([...(a.del||[]),...(b.del||[])])],m=new Map();
  [...(b.projects||[]),...(a.projects||[])].forEach(p=>{if(!p.id||del.includes(p.id))return;const o=m.get(p.id);if(!o||(p.mod||0)>(o.mod||0))m.set(p.id,p)});
  const order=[...base.projects.map(p=>p.id),...[...m.keys()]].filter((x,i,l)=>m.has(x)&&l.indexOf(x)===i);
  base.projects=order.map(id=>clone(m.get(id)));base.del=del;base.mod=Math.max(A,B);
  const cid=a.projects&&a.projects[a.cur]&&a.projects[a.cur].id,ci=base.projects.findIndex(p=>p.id===cid);base.cur=ci>=0?ci:0;return base}
