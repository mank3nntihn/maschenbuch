// ===== Lern-Ecke: 3D-Animationen der Techniken (Canvas, eigene kleine 3D-Projektion) =====
const LV={
  add:(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],sub:(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],mul:(a,k)=>[a[0]*k,a[1]*k,a[2]*k],
  len:a=>Math.hypot(a[0],a[1],a[2]),nrm:a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l]},
  crs:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],lerp:(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t]
};
// Nadel: Spitze + Richtung (von der Spitze zum Ende). Winkel um die Nadel: 0 = oben, 90 = vorne (zum Betrachter), 180 = unten, 270 = hinten
function ndl(tip,dir){const d=LV.nrm(dir);let e1=LV.crs(d,[0,1,0]);if(LV.len(e1)<.1)e1=[0,0,1];e1=LV.nrm(e1);let up=LV.nrm(LV.crs(e1,d));if(up[1]<0)up=LV.mul(up,-1);let fr=LV.nrm(LV.crs(d,up));if(fr[2]<0)fr=LV.mul(fr,-1);return{tip,d,up,fr}}
function rnd(n,s,deg,r=.3){const a=deg*Math.PI/180;return LV.add(LV.add(n.tip,LV.mul(n.d,s)),LV.add(LV.mul(n.up,Math.cos(a)*r),LV.mul(n.fr,Math.sin(a)*r)))}
// Glatte Kurve durch Stützpunkte, gleichmäßig auf n Punkte verteilt (alle Schlüsselbilder haben gleich viele Punkte)
function crv(P,n=40){const Q=[];const k=P.length;for(let i=0;i<k-1;i++){const p0=P[Math.max(0,i-1)],p1=P[i],p2=P[i+1],p3=P[Math.min(k-1,i+2)];
    for(let j=0;j<10;j++){const t=j/10,t2=t*t,t3=t2*t;Q.push([0,1,2].map(c=>.5*((2*p1[c])+(-p0[c]+p2[c])*t+(2*p0[c]-5*p1[c]+4*p2[c]-p3[c])*t2+(-p0[c]+3*p1[c]-3*p2[c]+p3[c])*t3)))}}
  Q.push(P[k-1]);const L=[0];for(let i=1;i<Q.length;i++)L.push(L[i-1]+LV.len(LV.sub(Q[i],Q[i-1])));const T=L[L.length-1]||1,R=[];let j=0;
  for(let i=0;i<n;i++){const s=T*i/(n-1);while(j<Q.length-2&&L[j+1]<s)j++;const u=(s-L[j])/Math.max(1e-9,L[j+1]-L[j]);R.push(LV.lerp(Q[j],Q[j+1],Math.min(1,u)))}return R}
// Masche auf einer Nadel: zwei Beine unten, Schlaufe über die Nadel (rechtes Bein vorne)
function loopOn(n,s,b1,b2,r=.3){return crv([b1,rnd(n,s-.1,135,r*1.5),rnd(n,s-.06,90,r),rnd(n,s,0,r),rnd(n,s+.06,270,r),rnd(n,s+.1,225,r*1.5),b2])}
// Gestrick: Funktion liefert pro Reihe/Spalte {t:'k'|'p', c:Farbe}; dz hebt rechte Maschen hervor
function fabricF(nc,rows,fn,x0,y0,dx=.9,dy=.95,dz=0){const T=[];for(let r=0;r<rows;r++)for(let j=0;j<nc;j++){const x=x0+j*dx,y=y0-r*dy,c=fn(r,j);if(!c)continue;
  if(c.t==='k')T.push({p:crv([[x-.32,y+.42,.05+dz],[x-.12,y,.16+dz],[x,y-.38,.1+dz]],10),c:c.c},{p:crv([[x+.32,y+.42,.05+dz],[x+.12,y,.16+dz],[x,y-.38,.1+dz]],10),c:c.c});
  else T.push({p:crv([[x-.42,y+.05,-.08-dz],[x-.2,y-.2,.08-dz],[x+.2,y-.2,.08-dz],[x+.42,y+.05,-.08-dz]],12),c:c.c})}return T}
const T=(de,en)=>DB.lang==='de'?de:en;

// ---------- Grundbausteine für Nadel-Animationen ----------
function base(front){const L=ndl([.3,0,0],[-1,0,0]),rest=ndl([.55,.32,.2],[1,-.22,.12]),ball=front?[3.4,1.2,2.4]:[3.4,1.2,-2.4],anchor=[1.05,-1.2,front?.35:-.35];
  return{L,rest,ball,anchor,
    A:n=>loopOn(n,.9,[-1,-1.35,.1],[-.2,-1.35,.1]),Bl:n=>loopOn(n,1.8,[-1.9,-1.35,.1],[-1.1,-1.35,.1]),
    statics:[loopOn(L,2.7,[-2.8,-1.35,.1],[-2,-1.35,.1])],
    right:n=>[loopOn(n,.95,[.75,-1.35,.1],[1.35,-1.35,.1]),loopOn(n,1.8,[1.55,-1.35,.1],[2.2,-1.35,.1])],
    yarnRest:crv([anchor,[1.1,-.6,front?.9:-.9],[1.8,.3,front?1.6:-1.6],ball]),
    wrapK:(n,s=.35)=>crv([anchor,[.6,-.7,-1.1],rnd(n,s,200,.33),rnd(n,s+.03,110,.33),rnd(n,s+.05,20,.33),rnd(n,s+.07,290,.33),[.3,-.4,-1.2],[1.8,.3,-1.8],ball]),
    wrapP:(n,s=.35)=>crv([anchor,[.6,-.4,1.1],rnd(n,s,80,.33),rnd(n,s+.03,0,.33),rnd(n,s+.05,270,.33),rnd(n,s+.07,180,.33),rnd(n,s+.09,110,.35),[.3,-.3,1.3],[1.8,.3,1.8],ball]),
    newOn:(n,s,back)=>crv([[-.2,-1.35,.1],[.1,-.7,back?-.3:.3],rnd(n,s,back?270:90,.3),rnd(n,s,0,.3),rnd(n,s,back?90:270,.3),[.6,-.6,back?1:-1],[1.8,.3,back?1.6:-1.6],ball]),
    dropped:(dx=0)=>crv([[-1+dx,-1.35,.1],[-.55+dx,-.9,.25],[.05+dx,-.55,.3],[.35+dx,-.75,.2],[.25+dx,-1.1,.1],[-.2+dx,-1.35,.1]]),
    insK:ndl([-.78,-.12,-.72],[1,-.12,1]),pullK:ndl([-.5,.08,.82],[1,-.18,-.22]),
    insP:ndl([-.82,-.05,.72],[1,.05,-.95]),pullP:ndl([-.45,-.05,-.85],[1,.12,.45]),
    insB:ndl([-.62,.12,-.62],[1,-.3,.55])}}
const shift=(n,dx)=>ndl(LV.add(n.tip,[dx,0,0]),n.d);
// Szene: Schlüsselbilder {R, C:[Kurven], cap}; cc = Farbe je Kurve ('a' Masche, 'b' Faden, 'c' zweite Masche, 'f' Hintergrund)
function scene(b,K,cc,extra={}){return{kind:'st',K,cc,L:b.L,statics:b.statics,right:b.right,fabric:extra.fabric!==false,cam:extra.cam||{yaw:-.3,pitch:.3,d:7.2,tx:-.15,ty:-.45}}}

function knitAnim(){const b=base(false);return scene(b,[
  {R:b.rest,C:[b.A(b.L),b.yarnRest],cap:T('Faden liegt hinter der Arbeit. Die Masche ganz vorn auf der linken Nadel ist dran.','Yarn at the back. The first stitch on the left needle is next.')},
  {R:b.insK,C:[b.A(b.L),b.yarnRest],cap:T('1. Rechte Nadel von vorne nach hinten in die Masche stechen (von links nach rechts).','1. Insert the right needle into the stitch from front to back, left to right.')},
  {R:b.insK,C:[b.A(b.L),b.wrapK(b.insK)],cap:T('2. Faden von hinten gegen den Uhrzeigersinn um die rechte Nadel legen.','2. Wrap the yarn counter-clockwise around the right needle.')},
  {R:b.pullK,C:[b.A(b.L),b.wrapK(b.pullK)],cap:T('3. Die neue Schlinge mit der rechten Nadel nach vorne durch die Masche ziehen.','3. Pull the new loop through the stitch to the front.')},
  {R:b.rest,C:[b.dropped(),b.newOn(b.rest,.35)],cap:T('4. Alte Masche von der linken Nadel gleiten lassen. Die neue Masche sitzt auf der rechten Nadel.','4. Slide the old stitch off. The new stitch is on the right needle.')}],['a','b'])}
function purlAnim(){const b=base(true);return scene(b,[
  {R:b.rest,C:[b.A(b.L),b.yarnRest],cap:T('Faden liegt vor der Arbeit. Die Masche ganz vorn auf der linken Nadel ist dran.','Yarn in front. The first stitch on the left needle is next.')},
  {R:b.insP,C:[b.A(b.L),b.yarnRest],cap:T('1. Rechte Nadel von hinten nach vorne in die Masche stechen (von rechts nach links).','1. Insert the right needle from back to front, right to left.')},
  {R:b.insP,C:[b.A(b.L),b.wrapP(b.insP)],cap:T('2. Faden vorne gegen den Uhrzeigersinn um die rechte Nadel legen.','2. Wrap the yarn counter-clockwise around the right needle, in front.')},
  {R:b.pullP,C:[b.A(b.L),b.wrapP(b.pullP)],cap:T('3. Die neue Schlinge nach hinten durch die Masche schieben.','3. Push the new loop back through the stitch.')},
  {R:b.rest,C:[b.dropped(),b.newOn(b.rest,.35,true)],cap:T('4. Alte Masche gleiten lassen. Vorne liegt jetzt ein Knötchen: die linke Masche.','4. Slide the old stitch off. The bump in front is the purl stitch.')}],['a','b'])}
function slipAnim(){const b=base(true);return scene(b,[
  {R:b.rest,C:[b.A(b.L),b.yarnRest],cap:T('Faden liegt vor der Arbeit.','Yarn is in front.')},
  {R:b.insP,C:[b.A(b.L),b.yarnRest],cap:T('1. Rechte Nadel wie zum Linksstricken einstechen: von rechts nach links.','1. Insert the right needle as if to purl: right to left.')},
  {R:b.rest,C:[loopOn(b.rest,.3,[-.2,-1.35,.1],[.5,-1.35,.1]),b.yarnRest],cap:T('2. Masche ungestrickt auf die rechte Nadel heben. Faden bleibt vorne, die Masche dreht sich nicht.','2. Move the stitch across without knitting it. Yarn stays in front.')}],['a','b'])}
function incAnim(){const b=base(false),two=(n,s1,s2)=>crv([b.anchor,[.6,-.7,-1.1],rnd(n,s1,200,.33),rnd(n,s1+.03,110,.33),rnd(n,s1+.05,20,.33),rnd(n,s1+.07,290,.33),[.2,-.5,-.9],rnd(n,s2,200,.33),rnd(n,s2+.03,110,.33),rnd(n,s2+.05,20,.33),rnd(n,s2+.07,290,.33),[.3,-.4,-1.2],[1.8,.3,-1.8],b.ball]);
  const rest2=crv([b.anchor,[1.1,-.6,-.9],[.9,-.2,-1],[1.3,0,-1.2],[1.8,.3,-1.6],b.ball]);
  return scene(b,[
  {R:b.rest,C:[b.A(b.L),rest2],cap:T('Zunahme: aus einer Masche werden zwei.','Increase: two stitches from one.')},
  {R:b.insK,C:[b.A(b.L),b.wrapK(b.insK)],cap:T('1. Wie bei einer rechten Masche ins vordere Maschenglied stechen und den Faden holen.','1. Knit into the front leg as usual.')},
  {R:b.pullK,C:[b.A(b.L),b.wrapK(b.pullK)],cap:T('2. Schlinge durchziehen, die alte Masche aber auf der linken Nadel lassen.','2. Pull the loop through but leave the old stitch on the left needle.')},
  {R:b.insB,C:[b.A(b.L),two(b.insB,.55,.2)],cap:T('3. Jetzt von hinten ins hintere Maschenglied derselben Masche stechen und den Faden noch einmal holen.','3. Now knit into the back leg of the same stitch.')},
  {R:b.rest,C:[b.dropped(),two(b.rest,.6,.25)],cap:T('4. Alte Masche gleiten lassen. Auf der rechten Nadel liegen zwei neue Maschen.','4. Slide the old stitch off. Two new stitches are on the right needle.')}],['a','b'])}
function decAnim(){const b=base(false),insK2=shift(b.insK,-.9),Bdrop=b.dropped(-.9);
  const Aon=(n,s)=>loopOn(n,s,[-1,-1.35,.1],[-.2,-1.35,.1]);
  const yarnB=n=>crv([b.anchor,[-.2,-.8,-1.1],rnd(n,.35,200,.33),rnd(n,.38,110,.33),rnd(n,.4,20,.33),rnd(n,.42,290,.33),[.2,-.4,-1.3],[1.8,.3,-1.8],b.ball]);
  const newB=n=>crv([[-1.1,-1.35,.1],[-.6,-.7,.3],rnd(n,.25,90,.3),rnd(n,.25,0,.3),rnd(n,.25,270,.3),[.6,-.6,-1],[1.8,.3,-1.6],b.ball]);
  const over=crv([[-1,-1.35,.1],[-.6,-.6,.4],rnd(b.rest,.05,90,.5),rnd(b.rest,-.05,0,.55),rnd(b.rest,.05,270,.5),[-.1,-.7,-.3],[-.2,-1.35,.1]]);
  const under=crv([[-1,-1.35,.1],[-.75,-.8,.3],[-.35,-.55,.35],[-.05,-.62,.2],[-.2,-1,.05],[-.2,-1.35,.1]]);
  return scene(b,[
  {R:b.rest,C:[b.A(b.L),b.Bl(b.L),b.yarnRest],cap:T('Abnahme: aus zwei Maschen wird eine.','Decrease: two stitches become one.')},
  {R:b.insK,C:[b.A(b.L),b.Bl(b.L),b.yarnRest],cap:T('1. Erste Masche wie zum Rechtsstricken einstechen …','1. Insert into the first stitch as if to knit …')},
  {R:b.rest,C:[Aon(b.rest,.75),b.Bl(b.L),b.yarnRest],cap:T('2. … und ungestrickt auf die rechte Nadel heben.','2. … and slip it to the right needle.')},
  {R:insK2,C:[Aon(insK2,1.6),b.Bl(b.L),yarnB(insK2)],cap:T('3. Die nächste Masche rechts stricken.','3. Knit the next stitch.')},
  {R:b.rest,C:[Aon(b.rest,.75),Bdrop,newB(b.rest)],cap:T('4. Jetzt liegen die abgehobene und die neue Masche auf der rechten Nadel.','4. The slipped and the new stitch are on the right needle.')},
  {R:b.rest,C:[over,Bdrop,newB(b.rest)],cap:T('5. Die abgehobene Masche über die neue Masche ziehen …','5. Lift the slipped stitch over the new one …')},
  {R:b.rest,C:[under,Bdrop,newB(b.rest)],cap:T('6. … und fallen lassen. Aus zwei Maschen ist eine geworden.','6. … and off the needle. Two stitches became one.')}],['c','a','b'])}
function boAnim(){const b=base(false),R=b.rest;
  const P1=s=>crv([[.55,-1.35,.1],[.4,-.7,.3],rnd(R,s,90,.3),rnd(R,s,0,.3),rnd(R,s,270,.3),[.85,-.7,-.2],[1,-1.35,.1]]);
  const P2=crv([[-.2,-1.35,.1],[.05,-.7,.3],rnd(R,.3,90,.3),rnd(R,.3,0,.3),rnd(R,.3,270,.3),[.6,-.6,-1],[1.8,.3,-1.6],b.ball]);
  const lift=crv([[.55,-1.35,.1],[.25,-.5,.45],rnd(R,-.05,90,.5),rnd(R,-.12,0,.55),rnd(R,-.05,270,.5),[.6,-.5,-.3],[1,-1.35,.1]]);
  const drop=crv([[.55,-1.35,.1],[.3,-.9,.35],[0,-.55,.35],[-.05,-.75,.15],[.4,-.9,0],[1,-1.35,.1]]);
  return scene(b,[
  {R,C:[P1(.85),P2],cap:T('Abketten: zwei Maschen stricken. Beide liegen auf der rechten Nadel.','Bind off: work two stitches. Both are on the right needle.')},
  {R,C:[lift,P2],cap:T('1. Mit der linken Nadel die erste Masche anheben und über die zweite ziehen.','1. With the left needle, lift the first stitch over the second.')},
  {R,C:[drop,P2],cap:T('2. Fallen lassen. Eine Masche ist abgekettet, eine liegt noch auf der Nadel.','2. Let it drop. One stitch is bound off, one remains.')},
  {R,C:[drop,P2],cap:T('3. Nächste Masche stricken und wiederholen. Im 2x2-Rippenmuster rechte Maschen rechts und linke links stricken.','3. Work the next stitch and repeat. In 2x2 rib, knit the knits and purl the purls.')}],['c','b'])}
function castonAnim(){const b=base(false),L=b.L,ch=s=>loopOn(L,s,[.3-s-.3,-.75,.05],[.3-s+.3,-.75,.05]);
  const between=ndl([-.95,-.25,-.55],[1,.05,1]);
  const yarnRest=crv([[-.1,-.75,.05],[.7,-.6,-.6],[1.8,.3,-1.6],b.ball]);
  const wrapped=crv([[-.1,-.75,.05],[.3,-.6,-.9],rnd(between,.3,200,.3),rnd(between,.33,110,.3),rnd(between,.35,20,.3),rnd(between,.37,290,.3),[.4,-.3,-1.2],[1.8,.3,-1.8],b.ball]);
  const pulled=ndl([-.55,0,.75],[1,-.15,-.15]);
  const loopPull=crv([[-.1,-.75,.05],[.1,-.5,.4],rnd(pulled,.3,90,.3),rnd(pulled,.33,0,.3),rnd(pulled,.35,270,.3),[.4,-.3,-1.2],[1.8,.3,-1.8],b.ball]);
  const onLeft=crv([[-.1,-.75,.05],[.25,-.45,.25],rnd(L,-.05,90,.3),rnd(L,-.05,0,.3),rnd(L,-.05,270,.3),[.6,-.4,-.9],[1.8,.3,-1.8],b.ball]);
  return scene(b,[
  {R:b.rest,C:[ch(.9),ch(1.6),yarnRest],cap:T('Kordelanschlag: neue Maschen entstehen immer zwischen den ersten beiden Maschen auf der linken Nadel.','Cable cast on: new stitches are made between the first two stitches.')},
  {R:between,C:[ch(.9),ch(1.6),yarnRest],cap:T('1. Rechte Masche: von vorne zwischen den ersten beiden Maschen einstechen.','1. Knit stitch: insert from the front between the first two stitches.')},
  {R:between,C:[ch(.9),ch(1.6),wrapped],cap:T('2. Faden um die rechte Nadel legen …','2. Wrap the yarn …')},
  {R:pulled,C:[ch(.9),ch(1.6),loopPull],cap:T('3. … und die Schlinge nach vorne durchziehen.','3. … and pull the loop through to the front.')},
  {R:b.rest,C:[ch(.9),ch(1.6),onLeft],cap:T('4. Schlinge auf die linke Nadel setzen. Die nächste Masche genauso, aber von hinten einstechen (linke Masche). Immer abwechseln.','4. Place it on the left needle. Make the next one from the back (purl). Alternate.')}],['a','a','b'],{fabric:false})}

// ---------- Gestrick-Animationen ----------
function fabAnim(o){const cx=(o.nc-1)*.9/2,cy=-(o.rows-1)*.95/2;return{kind:'fab',...o,cam:o.edge?{yaw:-.6,pitch:.2,d:11,tx:o.nc*.9-.8,ty:cy}:{yaw:-.2,pitch:.2,d:13,tx:cx,ty:cy}}}
const stripeC=r=>Math.floor((7-r)/2)%2?'c':'a';
const LEARN={
  re:{de:'Rechte Masche',en:'Knit stitch',used:'Sophie Scarf, Weekend Scarf',build:knitAnim},
  li:{de:'Linke Masche',en:'Purl stitch',used:'Weekend Scarf',build:purlAnim},
  'wie zum li abh.':{de:'Wie zum Linksstricken abheben (Faden vorne)',en:'Slip purlwise with yarn in front',used:'Sophie Scarf (I-Cord)',build:slipAnim},
  '2x2-Rippen':{de:'2x2-Rippen',en:'2x2 rib',used:'Weekend Scarf',build:()=>fabAnim({nc:8,rows:7,fn:(r,j)=>({t:j%4<2?'k':'p',c:'a'}),dz:.18,cap:[
    T('2x2-Rippen: 2 Maschen rechts, 2 Maschen links, immer im Wechsel.','2x2 rib: knit 2, purl 2, repeated.'),
    T('Rechte Maschen bilden erhabene V-Säulen, linke Maschen liegen als Querbögen vertieft dazwischen.','Knit stitches form raised V columns, purl stitches sit back as bumps.'),
    T('In der Rückreihe strickst du die Maschen so, wie sie erscheinen: V = rechts, Knötchen = links.','On the way back, work the stitches as they appear: V = knit, bump = purl.')]})},
  'kraus re':{de:'Kraus rechts',en:'Garter stitch',used:'Sophie Scarf',build:()=>fabAnim({nc:8,rows:8,fn:(r,j)=>({t:r%2?'p':'k',c:'a'}),dz:.12,cap:[
    T('Kraus rechts: in jeder Reihe nur rechte Maschen stricken, hin und zurück.','Garter stitch: knit every row, back and forth.'),
    T('Weil die Arbeit gewendet wird, liegt jede zweite Reihe vorne als Querbogen. So entstehen Rippen.','Because you turn the work, every other row shows as a bump. That makes the ridges.'),
    T('Eine Rippe = 2 Reihen. Zum Zählen die Rippen zählen und verdoppeln.','One ridge = 2 rows. Count the ridges and double them.')]})},
  Zun:{de:'Zunahme',en:'Increase',used:'Sophie Scarf',build:incAnim},
  Abn:{de:'Abnahme',en:'Decrease',used:'Sophie Scarf',build:decAnim},
  'I-Cord':{de:'I-Cord-Rand',en:'I-cord edge',used:'Sophie Scarf',build:()=>fabAnim({nc:6,rows:7,icord:true,fn:(r,j)=>({t:r%2?'p':'k',c:'a'}),dz:.12,edge:1,cap:[
    T('Am Ende jeder Reihe werden die letzten 3 Maschen mit dem Faden vor der Arbeit abgehoben.','At the end of every row, slip the last 3 stitches with the yarn in front.'),
    T('In der nächsten Reihe werden sie rechts gestrickt. Der Faden läuft hinten vorbei und zieht sie zusammen …','On the next row they are knitted. The yarn runs behind and pulls them together …'),
    T('… so rollt sich der Rand zu einem kleinen runden Schlauch: dem I-Cord.','… so the edge rolls into a small round tube: the i-cord.')]})},
  'abk.':{de:'Abketten',en:'Bind off',used:'Sophie Scarf, Weekend Scarf',build:boAnim},
  'Alternating Cable Cast On':{de:'Kordelanschlag im Rippenmuster',en:'Alternating cable cast on',used:'Weekend Scarf',build:castonAnim},
  Farbwechsel:{de:'Farbe wechseln',en:'Switching colours',used:'Weekend Scarf, Streifenschal',build:()=>fabAnim({nc:8,rows:8,tail:true,fn:(r,j)=>({t:j%4<2?'k':'p',c:stripeC(r)}),dz:.18,cap:[
    T('Farbwechsel immer am Anfang einer Reihe.','Always switch colours at the start of a row.'),
    T('Den neuen Faden einfach mitstricken und etwa 10 cm Ende hängen lassen.','Just start knitting with the new yarn and leave a 10 cm tail.'),
    T('Die Enden am Schluss vernähen. Beim Weekend Scarf wird der alte Faden stattdessen mitgeführt.','Weave in the ends at the end. On the Weekend Scarf you carry the old yarn instead.')]})},
  'Faden mitführen':{de:'Faden mitführen',en:'Carrying the yarn',used:'Weekend Scarf (dünne Streifen)',build:()=>fabAnim({nc:6,rows:8,carry:true,fn:(r,j)=>({t:j%4<2?'k':'p',c:stripeC(r)}),dz:.18,edge:1,cap:[
    T('Bei Streifen alle 2 Reihen wird der Faden nicht abgeschnitten.','With stripes every 2 rows, you don’t cut the yarn.'),
    T('Der gerade nicht benutzte Faden läuft locker am Rand nach oben.','The unused yarn runs loosely up the side.'),
    T('Beim Wechsel den neuen Faden unter dem alten hochnehmen. So bleibt der Rand sauber und es gibt keine Löcher.','When switching, pick the new yarn up from under the old one so the edge stays neat.')]})}
};
Object.assign(LEARN,{k:LEARN.re,p:LEARN.li,'sl3 wyif':LEARN['wie zum li abh.'],'2x2 rib':LEARN['2x2-Rippen'],'garter st':LEARN['kraus re'],inc:LEARN.Zun,dec:LEARN.Abn,'i-cord':LEARN['I-Cord'],BO:LEARN['abk.']});

// ---------- Darstellung ----------
function LearnPlayer(box,key,o={}){
  const def=LEARN[key];if(!def)return null;const sc=def.build();const cv=document.createElement('canvas');cv.className='lcv';box.appendChild(cv);
  const capEl=document.createElement('p');capEl.className='lcap';if(!o.mini)box.appendChild(capEl);
  const ctl=document.createElement('div');ctl.className='lctl';if(!o.mini){ctl.innerHTML=`<button data-a="prev" aria-label="${T('Zurück','Back')}">◀</button><button data-a="play" aria-label="Pause">❚❚</button><button data-a="next" aria-label="${T('Weiter','Next')}">▶</button>`;box.appendChild(ctl)}
  const cx=cv.getContext('2d');const dk=()=>document.documentElement.dataset.dark==='1';
  const SEG=2.6,FSEG=3.6,st={t:0,play:true,raf:0,yawOff:0,drag:null};const steps=sc.kind==='st'?sc.K.length:sc.cap.length,stepLen=sc.kind==='st'?SEG:FSEG;
  const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
  const fit=()=>{const w=box.clientWidth||300,h=o.mini?150:Math.min(320,Math.max(220,w*.62)),p=Math.min(2,devicePixelRatio||1);cv.style.height=h+'px';cv.width=w*p;cv.height=h*p};fit();
  const ro=new ResizeObserver(fit);ro.observe(box);
  function proj(c,P){const cy=Math.cos(c.yaw),sy=Math.sin(c.yaw),cp=Math.cos(c.pitch),sp=Math.sin(c.pitch);let x=P[0]-c.tx,y=P[1]-c.ty,z=P[2];
    let X=cy*x+sy*z,Z=-sy*x+cy*z,Y=cp*y-sp*Z;Z=sp*y+cp*Z;const f=Math.min(cv.width,cv.height*1.5)*.95/(c.d-Z);return[cv.width/2+X*f,cv.height/2-Y*f,Z,f]}
  function draw(){const W=cv.width,H=cv.height;cx.clearRect(0,0,W,H);
    const segs=[],cam={...sc.cam,yaw:sc.cam.yaw+st.yawOff+(o.mini?0:Math.sin(performance.now()/2600)*.06)};
    const tube=(pts,r,col,hl)=>{const P=pts.map(q=>proj(cam,q));for(let i=0;i<P.length-1;i+=9){const ch=P.slice(i,Math.min(P.length,i+10));segs.push({ch,z:ch.reduce((a,q)=>a+q[2],0)/ch.length,w:r*ch[0][3],col,hl})}};
    const COL={f:[dk()?'#6e5566':'#e9c9d8',dk()?'#6e5566':'#e9c9d8'],a:[dk()?'#d97aa6':'#e47fae',dk()?'#f3b4d0':'#fbd3e5'],b:[dk()?'#5aa2d6':'#6fb6e8','#cfe8fb'],c:[dk()?'#c9a34a':'#efc458',dk()?'#ecd394':'#fbebb8']};
    const nd=dk()?'#b9b2c6':'#c9c2b6',ndh='#fff8ec';let cap='';
    const needle=n=>{tube([n.tip,LV.add(n.tip,LV.mul(n.d,5.6))],.15,nd,ndh);tube([LV.sub(n.tip,LV.mul(n.d,.25)),n.tip],.07,nd,ndh)};
    if(sc.kind==='st'){const n=sc.K.length,tt=((st.t%(n*SEG))+n*SEG)%(n*SEG),i=Math.min(n-1,Math.floor(tt/SEG)),u=tt-i*SEG,mv=Math.min(1,u/1.2),e=ease(mv);
      const A=sc.K[i],B=sc.K[(i+1)%n],wrap=(i+1)%n===0,k=wrap?0:e;
      const R=ndl(LV.lerp(A.R.tip,B.R.tip,k),LV.lerp(A.R.d,B.R.d,k));cap=wrap||mv<1?A.cap:B.cap;
      if(sc.fabric){fabricF(7,1,()=>({t:'k',c:'f'}),-2.8,-1.75).forEach(c=>tube(c.p,.1,...COL.f));sc.statics.forEach(c=>tube(c,.1,...COL.f));sc.right(R).forEach(c=>tube(c,.1,...COL.f))}
      needle(sc.L);needle(R);
      A.C.forEach((c,j)=>tube(c.map((p,q)=>LV.lerp(p,B.C[j][q],k)),.12,...COL[sc.cc[j]]))}
    else{const n=sc.cap.length,tt=st.t%(n*FSEG),ph=Math.min(n-1,Math.floor(tt/FSEG));cap=sc.cap[ph];
      const rows=Math.min(sc.rows,1+Math.floor(st.t*2.4)%(sc.rows+9));cam.yaw+=Math.sin(st.t*.5)*.45;
      const nc=sc.nc,first=sc.rows-rows;   // Reihen wachsen von unten nach oben
      fabricF(nc,sc.rows,(r,j)=>r>=first?sc.fn(r,j):null,0,0,.9,.95,sc.dz).forEach(c=>tube(c.p,.13,...COL[c.c]));
      if(sc.icord){for(let r=sc.rows-1;r>=first;r--){const y=-r*.95,xc=nc*.9+.2;for(let q=0;q<3;q++){const a=q*2.1+r*.5,p=[xc+.45*Math.sin(a),y,.45*Math.cos(a)];
        tube(crv([LV.add(p,[-.2,.4,0]),LV.add(p,[0,-.05,.12]),LV.add(p,[.05,-.38,0])],8),.12,...COL.a)}}}
      if(sc.carry){const x=nc*.9-.35,pts=[];for(let r=sc.rows-1;r>=first;r--)pts.push([x+.25,-r*.95-.3,r%2?.2:-.2]);if(pts.length>1)tube(crv(pts,30),.1,...COL.c)}
      if(sc.tail&&first<=3){const y=-3*.95;tube(crv([[-.4,y,.1],[-.9,y-.3,.3],[-1.2,y-1.2,.4]],20),.11,...COL.c)}}
    segs.sort((p,q)=>p.z-q.z);cx.lineCap='round';cx.lineJoin='round';const sh=dk()?'rgba(0,0,0,.55)':'rgba(70,50,90,.35)';
    for(const s of segs){const path=o=>{cx.beginPath();s.ch.forEach((q,i)=>i?cx.lineTo(q[0]-o,q[1]-o):cx.moveTo(q[0]-o,q[1]-o))};
      path(0);cx.strokeStyle=sh;cx.lineWidth=s.w*2+2;cx.stroke();cx.strokeStyle=s.col;cx.lineWidth=s.w*2;cx.stroke();
      path(s.w*.35);cx.strokeStyle=s.hl;cx.lineWidth=Math.max(1,s.w*.55);cx.stroke()}
    if(cap!==st.cap){st.cap=cap;capEl.textContent=cap}}
  let last=performance.now();const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function loop(now){st.raf=requestAnimationFrame(loop);const dt=Math.max(0,Math.min(.1,(now-last)/1000));last=now;if(st.play&&!reduce)st.t+=dt;draw()}
  st.raf=requestAnimationFrame(loop);
  ctl.onclick=e=>{const b=e.target.closest('button');if(!b)return;const a=b.dataset.a;
    if(a==='play'){st.play=!st.play;b.textContent=st.play?'❚❚':'▶︎'}
    else{st.play=false;ctl.querySelector('[data-a=play]').textContent='▶︎';const cur=Math.floor((st.t%(steps*stepLen))/stepLen);st.t=((cur+(a==='next'?1:-1)+steps)%steps)*stepLen+(sc.kind==='st'?1.25:stepLen-.01)}};
  cv.onpointerdown=e=>{st.drag=e.clientX;cv.setPointerCapture(e.pointerId)};cv.onpointermove=e=>{if(st.drag!==null){st.yawOff+=(e.clientX-st.drag)*.01;st.drag=e.clientX}};cv.onpointerup=cv.onpointercancel=()=>{st.drag=null};
  return{st,stop(){cancelAnimationFrame(st.raf);ro.disconnect()}}}

// ---------- Seite "Hilfe & Techniken" ----------
const HELPT=[
  {k:'re',t:['Grundlagen','Basics']},{k:'li',t:['Grundlagen','Basics']},{k:'kraus re',t:['Muster','Patterns']},{k:'2x2-Rippen',t:['Muster','Patterns']},
  {k:'Alternating Cable Cast On',t:['Anfang & Ende','Start & finish']},{k:'abk.',t:['Anfang & Ende','Start & finish']},
  {k:'Zun',t:['Formen','Shaping']},{k:'Abn',t:['Formen','Shaping']},{k:'wie zum li abh.',t:['Ränder','Edges']},{k:'I-Cord',t:['Ränder','Edges']},
  {k:'Farbwechsel',t:['Farben','Colours']},{k:'Faden mitführen',t:['Farben','Colours']}];
let HELPP=[],helpOpen='re';
function vHelp(){const de=DB.lang==='de';
  return `<section class="card"><h2>${de?'Hilfe & Techniken':'Help & techniques'}</h2><p class="mu">${de?'Alle Techniken aus deinen Anleitungen. Tippe auf eine Technik, um die Animation zu sehen. Ziehen dreht die Ansicht.':'All techniques from your patterns. Tap one to watch the animation. Drag to turn the view.'}</p></section>`
   +HELPT.map(h=>{const L=LEARN[h.k],txt=(GL[DB.lang]||{})[h.k]||GL.de[h.k]||'',on=helpOpen===h.k;
     return `<section class="card hc ${on?'on':''}"><button class="hh" data-hk="${esc(h.k)}" onclick="helpOpen=helpOpen===this.dataset.hk?'':this.dataset.hk;render()" aria-expanded="${on}"><span><b>${esc(de?L.de:L.en)}</b><small>${esc(h.t[de?0:1])} · ${esc(L.used)}</small></span><i>${on?'▾':'▸'}</i></button>
     ${on?`<div class="hb">${txt?`<p>${esc(txt)}</p>`:''}<div class="lp" data-k="${esc(h.k)}"></div></div>`:''}</section>`}).join('')}
function startHelp(){stopHelp();document.querySelectorAll('.hc .lp').forEach(b=>HELPP.push(LearnPlayer(b,b.dataset.k)))}
function stopHelp(){HELPP.forEach(p=>p&&p.stop());HELPP=[]}
