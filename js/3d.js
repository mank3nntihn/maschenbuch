// =====================================================================
// 3D: eigener kleiner WebGL2-Renderer (läuft ohne Internet).
// Einheit: 1 = 10 cm. Das Model ist ca. 172 cm groß.
// =====================================================================
const va=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],vs=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],vk=(a,s)=>[a[0]*s,a[1]*s,a[2]*s],vas=(a,b,s)=>[a[0]+b[0]*s,a[1]+b[1]*s,a[2]+b[2]*s],
 vdot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],vcross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],vlen=a=>Math.hypot(a[0],a[1],a[2]),vnorm=a=>{const l=vlen(a)||1;return[a[0]/l,a[1]/l,a[2]/l]};
const M4={
 mul(a,b){const o=new Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+r]*b[c*4+k];o[c*4+r]=s}return o},
 persp(f,a,n,fa){const q=1/Math.tan(f/2),nf=1/(n-fa);return[q/a,0,0,0,0,q,0,0,0,0,(fa+n)*nf,-1,0,0,2*fa*n*nf,0]},
 look(e,c,u){const z=vnorm(vs(e,c)),x=vnorm(vcross(u,z)),y=vcross(z,x);return[x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-vdot(x,e),-vdot(y,e),-vdot(z,e),1]},
 rx(a){const c=Math.cos(a),s=Math.sin(a);return[1,0,0,0,0,c,s,0,0,-s,c,0,0,0,0,1]},
 ry(a){const c=Math.cos(a),s=Math.sin(a);return[c,0,-s,0,0,1,0,0,s,0,c,0,0,0,0,1]},
 rz(a){const c=Math.cos(a),s=Math.sin(a);return[c,s,0,0,-s,c,0,0,0,0,1,0,0,0,0,1]},
 sc(x,y,z){return[x,0,0,0,0,y,0,0,0,0,z,0,0,0,0,1]},
 trs(t,r,s){const m=M4.mul(M4.mul(M4.rx(r[0]),M4.ry(r[1])),M4.rz(r[2]));for(let i=0;i<3;i++){m[i]*=s[0];m[4+i]*=s[1];m[8+i]*=s[2]}m[12]=t[0];m[13]=t[1];m[14]=t[2];return m},
 basis(X,Y,Z,P){return[X[0],X[1],X[2],0,Y[0],Y[1],Y[2],0,Z[0],Z[1],Z[2],0,P[0],P[1],P[2],1]},
 app(m,p){return[m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12],m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13],m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14]]},
 inv(m){const[a00,a01,a02,a03,a10,a11,a12,a13,a20,a21,a22,a23,a30,a31,a32,a33]=m;
  const b00=a00*a11-a01*a10,b01=a00*a12-a02*a10,b02=a00*a13-a03*a10,b03=a01*a12-a02*a11,b04=a01*a13-a03*a11,b05=a02*a13-a03*a12,b06=a20*a31-a21*a30,b07=a20*a32-a22*a30,b08=a20*a33-a23*a30,b09=a21*a32-a22*a31,b10=a21*a33-a23*a31,b11=a22*a33-a23*a32;
  const d=1/(b00*b11-b01*b10+b02*b09+b03*b08-b04*b07+b05*b06);
  return[(a11*b11-a12*b10+a13*b09)*d,(a02*b10-a01*b11-a03*b09)*d,(a31*b05-a32*b04+a33*b03)*d,(a22*b04-a21*b05-a23*b03)*d,(a12*b08-a10*b11-a13*b07)*d,(a00*b11-a02*b08+a03*b07)*d,(a32*b02-a30*b05-a33*b01)*d,(a20*b05-a22*b02+a23*b01)*d,(a10*b10-a11*b08+a13*b06)*d,(a01*b08-a00*b10-a03*b06)*d,(a30*b04-a31*b02+a33*b00)*d,(a21*b02-a20*b04-a23*b00)*d,(a11*b07-a10*b09-a12*b06)*d,(a00*b09-a01*b07+a02*b06)*d,(a31*b01-a30*b03-a32*b00)*d,(a20*b03-a21*b01+a22*b00)*d]}
};
const rng=seed=>()=>{seed|=0;seed=seed+0x6D2B79F5|0;let x=Math.imul(seed^seed>>>15,1|seed);x=x+Math.imul(x^x>>>7,61|x)^x;return((x^x>>>14)>>>0)/4294967296};
const lin=hex=>{const n=parseInt(String(hex).slice(1),16);return[n>>16&255,n>>8&255,n&255].map(v=>Math.pow(v/255,2.2))};

// ---- Geometrie ----
function gSphere(ws,hs,tl=Math.PI){const p=[],n=[],i=[],G=[];
  for(let y=0;y<=hs;y++){const v=y/hs,row=[];for(let x=0;x<=ws;x++){const u=x/ws,px=-Math.cos(u*2*Math.PI)*Math.sin(v*tl),py=Math.cos(v*tl),pz=Math.sin(u*2*Math.PI)*Math.sin(v*tl);row.push(p.length/3);p.push(px,py,pz);n.push(px,py,pz)}G.push(row)}
  for(let y=0;y<hs;y++)for(let x=0;x<ws;x++){const a=G[y][x+1],b=G[y][x],c=G[y+1][x],d=G[y+1][x+1];if(y!==0)i.push(a,b,d);if(y!==hs-1||tl<Math.PI)i.push(b,c,d)}
  return{p,n,i}}
function gCyl(rt,rb,h,seg){const p=[],n=[],i=[],sl=(rb-rt)/h;
  for(let k=0;k<=seg;k++){const a=k/seg*2*Math.PI,s=Math.sin(a),c=Math.cos(a),q=vnorm([s,sl,c]);p.push(rt*s,h/2,rt*c,rb*s,-h/2,rb*c);n.push(...q,...q)}
  for(let k=0;k<seg;k++){const a=k*2;i.push(a,a+1,a+2,a+1,a+3,a+2)}
  for(const[y,r,ny]of[[h/2,rt,1],[-h/2,rb,-1]]){const c0=p.length/3;p.push(0,y,0);n.push(0,ny,0);for(let k=0;k<=seg;k++){const a=k/seg*2*Math.PI;p.push(r*Math.sin(a),y,r*Math.cos(a));n.push(0,ny,0)}for(let k=0;k<seg;k++)i.push(c0,c0+1+k,c0+2+k)}
  return{p,n,i}}
function gLathe(pts,seg){const p=[],n=[],i=[],m=pts.length;
  const nr=pts.map((q,k)=>{const a=pts[Math.max(0,k-1)],b=pts[Math.min(m-1,k+1)],dr=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dr,dy)||1;return[dy/l,-dr/l]});
  for(let s=0;s<=seg;s++){const a=s/seg*2*Math.PI,A=Math.sin(a),C=Math.cos(a);for(let k=0;k<m;k++){const[r,y]=pts[k];p.push(r*A,y,r*C);n.push(nr[k][0]*A,nr[k][1],nr[k][0]*C)}}
  for(let s=0;s<seg;s++)for(let k=0;k<m-1;k++){const a=s*m+k,b=a+m;i.push(a,b,a+1,a+1,b,b+1)}
  return{p,n,i}}
function gDisc(r,seg){const p=[0,0,0],n=[0,1,0],i=[];for(let k=0;k<=seg;k++){const a=k/seg*2*Math.PI;p.push(r*Math.sin(a),0,r*Math.cos(a));n.push(0,1,0)}for(let k=0;k<seg;k++)i.push(0,k+1,k+2);return{p,n,i}}
function gXf(g,M){const I=M4.inv(M),p=[],n=[];
  for(let k=0;k<g.p.length;k+=3){const q=M4.app(M,[g.p[k],g.p[k+1],g.p[k+2]]);p.push(q[0],q[1],q[2]);const a=g.n[k],b=g.n[k+1],c=g.n[k+2];const w=vnorm([I[0]*a+I[1]*b+I[2]*c,I[4]*a+I[5]*b+I[6]*c,I[8]*a+I[9]*b+I[10]*c]);n.push(w[0],w[1],w[2])}
  return{p,n,i:g.i.slice()}}
function gMerge(list){const p=[],n=[],i=[];let o=0;for(const g of list){for(const v of g.p)p.push(v);for(const v of g.n)n.push(v);for(const v of g.i)i.push(v+o);o+=g.p.length/3}return{p,n,i}}
function cylM(a,b){const d=vs(b,a),len=vlen(d),Y=vk(d,1/len),u=Math.abs(Y[2])<.9?[0,0,1]:[1,0,0],X=vnorm(vcross(Y,u)),Z=vcross(X,Y);return M4.basis(X,vk(Y,len),Z,vk(va(a,b),.5))}

// ---- Model: stilisierte Figur, für alle Projekte gleich (T-Shirt, Jeans, Sneaker) ----
function avatarParts(){
  const P=[],sk='#eec4ac',sh='#f4f1ec',je='#6582b3',so='#fafafa',ha='#6e4a36';
  P.push({t:'lathe',pts:[[0,8.9],[1.42,8.95],[1.31,9.8],[1.24,10.5],[1.42,11.5],[1.62,12.5],[1.74,13.4],[1.62,13.9],[1.15,14.22],[.62,14.4],[0,14.42]],zs:.62,col:sh});
  P.push({t:'lathe',pts:[[0,7.45],[1.0,7.5],[1.42,8.05],[1.48,8.7],[1.44,9.1],[0,9.12]],zs:.66,col:je});
  P.push({t:'cyl',a:[0,14.1,0],b:[0,15.5,0],ra:.52,rb:.46,col:sk});
  P.push({t:'ell',c:[0,16.2,.02],s:[.84,1.08,.94],col:sk});
  P.push({t:'ell',c:[0,16.3,-.06],s:[.93,1.14,1.03],r:[-.3,0,0],tl:.56,col:ha});
  P.push({t:'ell',c:[0,16.98,-.7],s:[.42,.42,.42],col:ha});
  for(const s of[-1,1]){
    P.push({t:'ell',c:[s*1.68,13.72,0],s:[.56,.56,.52],col:sh});
    P.push({t:'cyl',a:[s*2.0,13.7,0],b:[s*2.32,12.3,0],ra:.52,rb:.47,col:sh});
    P.push({t:'cyl',a:[s*2.04,13.5,0],b:[s*2.46,10.55,0],ra:.38,rb:.33,col:sk});
    P.push({t:'ell',c:[s*2.46,10.55,0],s:[.33,.33,.33],col:sk});
    P.push({t:'cyl',a:[s*2.46,10.55,0],b:[s*2.64,8.3,.05],ra:.33,rb:.26,col:sk});
    P.push({t:'ell',c:[s*2.69,7.9,.05],s:[.27,.42,.19],col:sk});
    P.push({t:'cyl',a:[s*.7,7.8,0],b:[s*.72,.55,0],ra:.6,rb:.45,col:je});
    P.push({t:'ell',c:[s*.72,.3,.28],s:[.42,.3,.85],col:so});
  }
  P.push({t:'disc',r:4.2,col:'#ffffff',alpha:.45});
  return P;
}
function partGeo(q){
  if(q.t==='lathe')return gXf(gLathe(q.pts,56),M4.sc(1,1,q.zs));
  if(q.t==='ell')return gXf(gSphere(44,32,q.tl?Math.PI*q.tl:Math.PI),M4.trs(q.c,q.r||[0,0,0],q.s));
  if(q.t==='cyl')return gXf(gCyl(q.rb,q.ra,1,32),cylM(q.a,q.b));
  return gXf(gDisc(q.r,64),M4.trs([0,.004,0],[0,0,0],[1,1,1]));
}
// Abstandsfunktionen der Körperteile (konservativ: liefern höchstens den echten Abstand)
function partSDF(P){
  return P.filter(q=>q.t!=='disc').map(q=>{
    if(q.t==='ell'){const I=M4.inv(M4.trs(q.c,q.r||[0,0,0],q.s)),m=Math.min(...q.s);
      return p=>{const x=I[0]*p[0]+I[4]*p[1]+I[8]*p[2]+I[12],y=I[1]*p[0]+I[5]*p[1]+I[9]*p[2]+I[13],z=I[2]*p[0]+I[6]*p[1]+I[10]*p[2]+I[14];return(Math.sqrt(x*x+y*y+z*z)-1)*m}}
    if(q.t==='cyl'){const ax=q.a[0],ay=q.a[1],az=q.a[2],dx=q.b[0]-ax,dy=q.b[1]-ay,dz=q.b[2]-az,len=Math.hypot(dx,dy,dz),Yx=dx/len,Yy=dy/len,Yz=dz/len;
      return p=>{const wx=p[0]-ax,wy=p[1]-ay,wz=p[2]-az,hh=wx*Yx+wy*Yy+wz*Yz,rx=wx-Yx*hh,ry=wy-Yy*hh,rz=wz-Yz*hh,f=Math.min(1,Math.max(0,hh/len));return Math.max(Math.sqrt(rx*rx+ry*ry+rz*rz)-(q.ra+(q.rb-q.ra)*f),-hh,hh-len)}}
    const pts=q.pts,y0=pts[0][1],y1=pts[pts.length-1][1],zs=q.zs;
    return p=>{const y=p[1];if(y<y0-1||y>y1+1)return Math.max(y0-y,y-y1);let r=0;for(let k=0;k<pts.length-1;k++){const a=pts[k],b=pts[k+1];if(y>=a[1]&&y<=b[1]){r=b[1]>a[1]?a[0]+(b[0]-a[0])*(y-a[1])/(b[1]-a[1]):Math.max(a[0],b[0]);break}}
      return Math.max((Math.sqrt(p[0]*p[0]+p[2]*p[2]/(zs*zs))-r)*zs,y0-y,y-y1)}
  })}
const sdf=(fs,p)=>{let d=1e9;for(const f of fs){const v=f(p);if(v<d)d=v}return d};
const sdfGrad=(fs,p)=>{const e=.004;return vnorm([sdf(fs,[p[0]+e,p[1],p[2]])-sdf(fs,[p[0]-e,p[1],p[2]]),sdf(fs,[p[0],p[1]+e,p[2]])-sdf(fs,[p[0],p[1]-e,p[2]]),sdf(fs,[p[0],p[1],p[2]+e])-sdf(fs,[p[0],p[1],p[2]-e])])};

// ---- Schal am Model: Ende 1 hängt vorne, Schlaufe um den Hals (groß: zweimal), Ende 2 hängt vorne ----
const CLEAR=.03,INNER=.013,LAYER=.055;
function frameRows(P,f,C){
  const F=[],N=P.length;
  for(let i=0;i<N;i++){const Tg=vnorm(vs(P[Math.min(N-1,i+3)],P[Math.max(0,i-3)])),N0=vnorm([P[i][0],0,P[i][2]]);
    let W=vnorm(vcross(Tg,N0)),Nn=vnorm(vcross(W,Tg));if(vdot(Nn,N0)<0){Nn=vk(Nn,-1);W=vk(W,-1)}
    F.push({P:P[i],Tg,W,Nn,f:f[i],c:C?C[i]:0})}
  return F}
const WCACHE={};
function wornFrames(c,rowW,fs){
  const ck='w3|'+c.total+'|'+c.R.map(q=>q.n).join(',').length+'|'+c.R.reduce((a,q)=>a+q.n,0)+'|'+c.g.sts+'|'+c.g.rows+'|'+(c.sop?S.size:'');
  const C=edgeShift(c,rowW);
  if(WCACHE[ck])return frameRows(WCACHE[ck].P,WCACHE[ck].f,C);
  try{const j=JSON.parse(localStorage.getItem('maschenbuch.3d')||'{}');if(j[ck])return frameRows(j[ck].P,j[ck].f,C)}catch(e){}
  const res=solveWorn(c,rowW,fs,C);WCACHE[ck]=res;
  try{const j={};j[ck]={P:res.P.map(p=>p.map(v=>+v.toFixed(4))),f:res.f.map(v=>+v.toFixed(4))};localStorage.setItem('maschenbuch.3d',JSON.stringify(j))}catch(e){}
  return frameRows(res.P,res.f,C);
}
function edgeShift(c,rowW){const N=c.total,Wr=c.R.map(q=>rowW(q.n));return Wr.map((w,i)=>{let s=0,n=0;for(let j=Math.max(0,i-8);j<=Math.min(N-1,i+8);j++){s+=Wr[j];n++}return Math.min(0,(w-s/n)/2)})}
function solveWorn(c,rowW,fs,C){
  const N=c.total,ch=1/c.g.rows,L=N*ch,Wm=Math.max(...c.R.map(q=>rowW(q.n)));
  const loops=(c.sop?S.size==='l':L>11.5)?2:1,Y0=14.72,tilt=.1,Wr=c.R.map(q=>rowW(q.n));
  // Ende 1 links vorne, Schlaufe über links, hinten, rechts (groß: zweimal herum), Ende 2 rechts vorne
  const th0=-.55,TH=2*Math.PI*loops-1.1,eT=loops>1?.9:1.8;
  const r=Math.min(.74,Math.max(.62,(L-2*eT-.9)/TH-LAYER*loops/2));
  const lp=u=>{const th=th0-TH*u,rho=r+(LAYER+.02)*TH*u/(2*Math.PI);return[rho*Math.sin(th),Y0-tilt*Math.cos(th),rho*Math.cos(th)]};
  const loop=[];for(let k=0;k<=360;k++)loop.push(lp(k/360));
  const front=(x,y)=>{const pr=[[1.62,12.5],[1.74,13.4],[1.62,13.9],[1.15,14.22],[.62,14.4]];let rr=.52;
    if(y<14.4){for(let k=0;k<pr.length-1;k++)if(y>=pr[k][1]&&y<=pr[k+1][1]){rr=pr[k][0]+(pr[k+1][0]-pr[k][0])*(y-pr[k][1])/(pr[k+1][1]-pr[k][1]);break}if(y<12.5)rr=1.62;return .62*Math.sqrt(Math.max(0,rr*rr-x*x))+.08}
    return Math.sqrt(Math.max(0,.5*.5-x*x))+.08};
  const bez=(a,b,c2,d,n)=>{const o=[];for(let k=1;k<n;k++){const u=k/n,v=1-u;o.push([0,1,2].map(j=>v*v*v*a[j]+3*v*v*u*b[j]+3*v*u*u*c2[j]+u*u*u*d[j]))}return o};
  const LS=loop[0],LE=loop[loop.length-1],TS=vnorm(vs(loop[1],loop[0])),TE=vnorm(vs(LE,loop[loop.length-2]));
  const H1=[LS[0]*.9,LS[1]-.45,0],H2=[LE[0]*.9,LE[1]-.45,0];H1[2]=front(H1[0],H1[1]);H2[2]=Math.max(front(H2[0],H2[1]),H1[2])+.02;
  const B1=bez(H1,va(H1,[0,.22,0]),vas(LS,TS,-.24),LS,20),B2=bez(LE,vas(LE,TE,.24),va(H2,[0,.22,0]),H2,20);
  const plen=a=>{let s=0;for(let k=1;k<a.length;k++)s+=vlen(vs(a[k],a[k-1]));return s};
  const mid=[H1,...B1,...loop,...B2,H2],e=Math.max(.15,(L-plen(mid))/2);
  const hang=(H,dir)=>{const o=[];const n=Math.max(2,Math.ceil(e/.02));for(let k=1;k<=n;k++){const y=H[1]-e*k/n;o.push([H[0],y,Math.max(front(H[0],y),H[2]-.0)+(dir>0?.02:0)])}return o};
  const pts=[...hang(H1,0).reverse(),...mid,...hang(H2,1)];
  // nach Bogenlänge auf Reihen verteilen
  const cum=[0];for(let k=1;k<pts.length;k++)cum.push(cum[k-1]+vlen(vs(pts[k],pts[k-1])));
  const tot=cum[cum.length-1],sL0=cum[pts.indexOf(LS)],sL1=cum[pts.indexOf(LE)];
  let P=[],f=[],j=0;
  const ss=(a,b,x)=>{const q=Math.min(1,Math.max(0,(x-a)/(b-a)));return q*q*(3-2*q)};
  for(let i=0;i<N;i++){const s=(i+.5)/N*tot;while(j<cum.length-2&&cum[j+1]<s)j++;const u=(s-cum[j])/((cum[j+1]-cum[j])||1);P.push(vas(pts[j],vs(pts[j+1],pts[j]),u));
    const fE=Math.min(1,.75/Wr[i]),fL=Math.min(.58,.75/Wr[i]);f.push(fE-(fE-fL)*ss(sL0-.35,sL0+.1,s)*(1-ss(sL1-.1,sL1+.35,s)))}
  // Raffung: biegt sich das Band in seiner eigenen Ebene enger als seine halbe Breite, wird es zusammengeschoben (wie echter Stoff)
  const f0=f.slice();
  const gather=()=>{const F=frameRows(P,f0);for(let i=0;i<N;i++){const a=Math.max(1,i-3),b=Math.min(N-2,i+3);
      const k=vdot(vs(F[b].Tg,F[a].Tg),F[i].W)/Math.max(1e-6,vlen(vs(P[b],P[a])));f[i]=Math.min(f0[i],1.5/Math.max(1e-6,Math.abs(k)*Wr[i]))}
    for(let pass=0;pass<4;pass++){const g=f.slice();for(let i=1;i<N-1;i++)f[i]=Math.min(g[i],(g[i-1]+g[i]+g[i+1])/3)}};
  // Kollisionen auflösen: Körper und Schal-Lagen (spätere Reihen liegen außen).
  // Jede Korrektur wird weich auf die Nachbarreihen verteilt, damit keine Knicke entstehen.
  const cell=.1,SIG=6,RAD=16,ITS=22;
  for(let it=0;it<ITS;it++){
    if(it<ITS-4)gather();
    let F=frameRows(P,f,C);const d=new Array(N).fill(null),dm=new Float64Array(N);
    const want=(i,dir,amt)=>{if(amt>dm[i]){dm[i]=amt;d[i]=dir}};
    // Körper
    for(let i=0;i<N;i++){const fr=F[i],w=Wr[i]*fr.f;if(sdf(fs,fr.P)>w/2+.12)continue;
      const n=Math.max(5,Math.ceil(w/.05)+1);let worst=1e9,wq=null;
      for(let k=0;k<n;k++){const o=(k/(n-1)-.5)*w+fr.c*fr.f,q=[fr.P[0]+fr.W[0]*o-fr.Nn[0]*INNER,fr.P[1]+fr.W[1]*o-fr.Nn[1]*INNER,fr.P[2]+fr.W[2]*o-fr.Nn[2]*INNER],dd=sdf(fs,q);if(dd<worst){worst=dd;wq=q}}
      if(worst<CLEAR)want(i,sdfGrad(fs,wq),CLEAR-worst+.003)}
    // Schal-Lagen
    const H=new Map(),SM=[],hk=(x,y,z)=>(x*73856093^y*19349663^z*83492791)|0,stamp=new Int32Array(N).fill(-1);
    for(let i=0;i<N;i++){const fr=F[i],w=Wr[i]*fr.f,n=Math.max(5,Math.ceil(w/.025)+1),arr=new Float64Array(n*3);
      for(let k=0;k<n;k++){const o=(k/(n-1)-.5)*w+fr.c*fr.f;arr[k*3]=fr.P[0]+fr.W[0]*o;arr[k*3+1]=fr.P[1]+fr.W[1]*o;arr[k*3+2]=fr.P[2]+fr.W[2]*o;
        const kk=hk(Math.floor(arr[k*3]/cell),Math.floor(arr[k*3+1]/cell),Math.floor(arr[k*3+2]/cell));let s=H.get(kk);if(!s)H.set(kk,s=[]);if(s[s.length-1]!==i)s.push(i)}
      SM.push(arr)}
    for(let i=0;i<N;i++){const arr=SM[i],cand=[];
      for(let k=0;k<arr.length;k+=3){const bx=Math.floor(arr[k]/cell),by=Math.floor(arr[k+1]/cell),bz=Math.floor(arr[k+2]/cell);
        for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)for(let dz=-1;dz<=1;dz++){const s=H.get(hk(bx+dx,by+dy,bz+dz));if(s)for(const j of s)if(j<i-12&&stamp[j]!==i){stamp[j]=i;cand.push(j)}}}
      for(const j of cand){const g=F[j],hw=Wr[j]*g.f/2+.025+Math.abs(g.c)*g.f,ht=ch*1.6,Px=g.P[0],Py=g.P[1],Pz=g.P[2],nx=g.Nn[0],ny=g.Nn[1],nz=g.Nn[2],wx=g.W[0],wy=g.W[1],wz=g.W[2],tx=g.Tg[0],ty=g.Tg[1],tz=g.Tg[2];
        for(let k=0;k<arr.length;k+=3){const rx=arr[k]-Px,ry=arr[k+1]-Py,rz=arr[k+2]-Pz,hh=rx*nx+ry*ny+rz*nz;if(hh<=-.15||hh>=LAYER)continue;
          if(Math.abs(rx*wx+ry*wy+rz*wz)<=hw&&Math.abs(rx*tx+ry*ty+rz*tz)<=ht)want(i,g.Nn,LAYER-hh+.003)}}}
    // weich verteilen
    const D=P.map(()=>[0,0,0]),Dm=new Float64Array(N);
    for(let j=0;j<N;j++){if(!d[j])continue;for(let i=Math.max(0,j-RAD);i<=Math.min(N-1,j+RAD);i++){const w=Math.exp(-(((i-j)/SIG)**2)),a=dm[j]*w;if(a>Dm[i]){Dm[i]=a;D[i]=vk(d[j],a)}}}
    for(let i=0;i<N;i++)P[i]=va(P[i],D[i]);
    if(it<ITS-2){const Q=P.map(p=>p.slice());for(let i=1;i<N-1;i++)P[i]=[0,1,2].map(a=>(Q[i-1][a]+2*Q[i][a]+Q[i+1][a])/4)}
  }
  return{P,f};
}
function flatFrames(c,rowW){
  const N=c.total,ch=1/c.g.rows,L=N*ch,Wm=Math.max(...c.R.map(q=>rowW(q.n))),A=Math.min(.38,.025*L),C=[];let x=0,z=0;
  for(let i=0;i<=N;i++){const ph=A*Math.sin(2*Math.PI*i*ch/L);C.push([x,z,ph]);x+=ch*Math.cos(ph);z+=ch*Math.sin(ph)}
  const xs=C.map(q=>q[0]),zs=C.map(q=>q[1]),mx=Math.min(...xs),Mx=Math.max(...xs),mz=Math.min(...zs),Mz=Math.max(...zs),F=[];
  for(let i=0;i<N;i++){const[px,pz,ph]=C[i],sn=Math.sin(ph),cs=Math.cos(ph);
    F.push({P:[px+ch/2*cs-(mx+Mx)/2,Wm*.02,pz+ch/2*sn-(mz+Mz)/2],Tg:[cs,0,sn],W:[sn,0,-cs],Nn:[0,1,0],f:1,c:-Wm/2+rowW(c.R[i].n)/2})}
  F.R0=Math.max(Mx-mx,Mz-mz,Wm)/2+Wm/2;return F}

// ---- Szene: Maschen als Instanzen ----
function buildScene(c,worn){
  const rnd=rng(11),knit=c.sop||S.tech==='knit',cw=1/c.g.sts,ch=1/c.g.rows,N=c.total,cord=c.sop;
  const rowW=n=>cord?(Math.max(0,n-6)+3)*cw:n*cw;
  const parts=worn?avatarParts():[],fs=worn?partSDF(parts):null,F=worn?wornFrames(c,rowW,fs):flatFrames(c,rowW);
  const det=c.stTot<12000?2:c.stTot<30000?1:0,U=gSphere([6,8,12][det],[3,5,7][det]);
  const pt=(px,py,pz,rx,ry,rz,sx,sy,sz)=>gXf(U,M4.trs([px,py,pz],[rx,ry,rz],[sx,sy,sz]));
  const G={};
  if(knit){const v=[];for(const s of[-1,1])for(const q of[-1,1])v.push(pt(s*cw*.22+q*cw*.05,q*cw*.025,q*ch*.05,0,s*.5,q*.32,cw*.12,cw*.2,ch*.68));G.V=gMerge(v);
    const b=[];for(const q of[-1,1])b.push(pt(0,cw*.02,q*ch*.08,0,q*.12,q*.15,cw*.52,cw*.19,ch*.17));G.B=gMerge(b)}
  else{const f=[pt(0,0,-ch*.12,0,0,0,cw*.34,cw*.25,ch*.4)];for(const q of[-1,1])f.push(pt(q*cw*.1,cw*.04,-ch*.1,0,0,q*.25,cw*.09,cw*.22,ch*.38));for(const q of[-1,1])f.push(pt(q*cw*.2,cw*.03,ch*.33,0,q*.3,0,cw*.29,cw*.15,ch*.14));G.V=G.B=gMerge(f)}
  if(cord){const k=[];for(const q of[-1,1])k.push(pt(q*cw*.18,cw*.18,0,0,q*.45,q*.5,cw*.3,cw*.42,ch*.95));G.C=gMerge(k)}
  const rowCol=[];c.segs.forEach(q=>{for(let i=q.a;i<=q.b;i++)rowCol[i-1]=lin(q.s.c)});
  // Alle Maschen, je Art nach Reihe sortiert. So lässt sich der Fortschritt ohne Neuaufbau umschalten.
  const B={},centers=[];
  const put=(key,fr,off,col,row)=>{B[key]=B[key]||{geo:G[key],m:[],c:[],rows:[]};
    const s=.95+rnd()*.1,p=vas(vas(fr.P,fr.W,off*fr.f),fr.Nn,(rnd()-.5)*cw*.04);
    const M=M4.mul(M4.mul(M4.basis(fr.W,fr.Nn,fr.Tg,p),M4.ry((rnd()-.5)*.14)),M4.sc(s*fr.f,s,s));
    for(const v of M)B[key].m.push(v);const br=.88+rnd()*.22;B[key].c.push(col[0]*br,col[1]*br,col[2]*br);B[key].rows.push(row);centers.push({p,row,cord:key==='C'})};
  for(let i=0;i<N;i++){const fr=F[i],n=c.R[i].n,w=rowW(n);
    const m=cord?Math.max(0,n-6):n,st=fr.c-w/2+(cord?1.5*cw:0),kind=knit?(i%2?'B':'V'):'V';
    for(let k=0;k<m;k++)put(kind,fr,st+(k+.5)*cw,rowCol[i],i);
    if(cord){put('C',fr,fr.c-w/2+.75*cw,rowCol[i],i);put('C',fr,fr.c+w/2-.75*cw,rowCol[i],i)}}
  const kinds=Object.values(B).map(b=>{const n=b.rows.length,mR=new Float32Array(n*16),cR=new Float32Array(n*3);
    for(let j=0;j<n;j++){const s=n-1-j;mR.set(b.m.slice(s*16,s*16+16),j*16);cR.set(b.c.slice(s*3,s*3+3),j*3)}
    return{geo:b.geo,m:b.m,c:b.c,mR,cR,rows:b.rows}});
  // Unterlage, damit man nicht durch die Maschen sieht (eine Doppelreihe Punkte pro Reihe)
  const up=[],uc=[],un=[],ui=[];
  for(let i=0;i<N;i++){const fr=F[i],w=rowW(c.R[i].n)*.94,col=vk(rowCol[i],.55);
    for(const s of[-1,1]){const q=vas(vas(fr.P,fr.W,(fr.c+s*w/2)*fr.f),fr.Nn,-cw*.16);up.push(...q);uc.push(...col);un.push(...fr.Nn)}
    if(i>0){const a=(i-1)*2;ui.push(a,a+1,a+2,a+1,a+3,a+2)}}
  const meshes=[];
  const byCol={};parts.forEach(q=>{const k=q.col+'|'+(q.alpha||1);(byCol[k]=byCol[k]||[]).push(partGeo(q))});
  Object.entries(byCol).forEach(([k,list])=>{const[col,a]=k.split('|');meshes.push({geo:gMerge(list),col:lin(col),alpha:+a})});
  return{F,R0:F.R0||0,N,kinds,under:{geo:{p:up,n:un,i:ui},vcol:uc},meshes,centers,fs,rowW,cw,ch};
}

// ---- WebGL2 ----
function GLR(cv){
  const gl=cv.getContext('webgl2',{antialias:true,alpha:true,premultipliedAlpha:true});if(!gl)return null;
  const sh=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s};
  const pr=gl.createProgram();
  gl.attachShader(pr,sh(gl.VERTEX_SHADER,`#version 300 es
layout(location=0) in vec3 aP;layout(location=1) in vec3 aN;layout(location=2) in vec3 aC;
layout(location=3) in vec4 m0;layout(location=4) in vec4 m1;layout(location=5) in vec4 m2;layout(location=6) in vec4 m3;layout(location=7) in vec3 iC;
uniform mat4 uVP,uM;out vec3 vN,vC,vW;
void main(){mat4 M=uM*mat4(m0,m1,m2,m3);vec4 w=M*vec4(aP,1.);vW=w.xyz;vN=transpose(inverse(mat3(M)))*aN;vC=aC*iC;gl_Position=uVP*w;}`));
  gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,`#version 300 es
precision highp float;in vec3 vN,vC,vW;uniform vec3 uE;uniform float uA;out vec4 o;
void main(){vec3 n=normalize(vN);if(dot(n,uE-vW)<0.)n=-n;
vec3 l1=normalize(vec3(2.,6.,4.)),l2=normalize(vec3(-4.,3.,-3.));
vec3 hemi=mix(vec3(.69,.58,.81),vec3(1.),n.y*.5+.5)*.72;
vec3 c=vC*(hemi+vec3(.72)*max(dot(n,l1),0.)+vec3(.28,.25,.26)*max(dot(n,l2),0.));
c=pow(clamp(c,0.,1.),vec3(1./2.2));o=vec4(c*uA,uA);}`));
  gl.linkProgram(pr);if(!gl.getProgramParameter(pr,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(pr));
  const U={vp:gl.getUniformLocation(pr,'uVP'),m:gl.getUniformLocation(pr,'uM'),e:gl.getUniformLocation(pr,'uE'),a:gl.getUniformLocation(pr,'uA')};
  const items=[],bufs=[],vaos=[];
  const buf=(arr,tg=gl.ARRAY_BUFFER)=>{const b=gl.createBuffer();gl.bindBuffer(tg,b);gl.bufferData(tg,arr,gl.STATIC_DRAW);bufs.push(b);return b};
  // Gibt ein Objekt zurück, dessen Anzahl (count = Instanzen, n = Indizes) sich später ändern lässt
  function add(geo,o){const vao=gl.createVertexArray();vaos.push(vao);gl.bindVertexArray(vao);
    buf(new Float32Array(geo.p));gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,0,0);
    buf(new Float32Array(geo.n));gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,0,0);
    if(o.vcol){buf(new Float32Array(o.vcol));gl.enableVertexAttribArray(2);gl.vertexAttribPointer(2,3,gl.FLOAT,false,0,0)}
    let count=0;if(o.m){count=o.m.length/16;buf(o.m instanceof Float32Array?o.m:new Float32Array(o.m));for(let k=0;k<4;k++){gl.enableVertexAttribArray(3+k);gl.vertexAttribPointer(3+k,4,gl.FLOAT,false,64,k*16);gl.vertexAttribDivisor(3+k,1)}
      buf(o.c instanceof Float32Array?o.c:new Float32Array(o.c));gl.enableVertexAttribArray(7);gl.vertexAttribPointer(7,3,gl.FLOAT,false,0,0);gl.vertexAttribDivisor(7,1)}
    buf(new Uint32Array(geo.i),gl.ELEMENT_ARRAY_BUFFER);gl.bindVertexArray(null);
    const it={vao,n:geo.i.length,count,inst:!!o.m,vcol:!!o.vcol,col:o.col||[1,1,1],alpha:o.alpha??1};items.push(it);return it}
  function draw(VP,M,eye){
    gl.viewport(0,0,cv.width,cv.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.useProgram(pr);gl.uniformMatrix4fv(U.vp,false,VP);gl.uniformMatrix4fv(U.m,false,M);gl.uniform3fv(U.e,eye);
    gl.enable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);
    for(const pass of[0,1]){if(pass){gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false)}else{gl.disable(gl.BLEND);gl.depthMask(true)}
      for(const it of items){if((it.alpha<1)!==!!pass||it.n<=0||(it.inst&&it.count<=0))continue;gl.bindVertexArray(it.vao);gl.uniform1f(U.a,it.alpha);
        if(!it.vcol)gl.vertexAttrib3f(2,it.col[0],it.col[1],it.col[2]);
        if(it.inst)gl.drawElementsInstanced(gl.TRIANGLES,it.n,gl.UNSIGNED_INT,0,it.count);
        else{gl.vertexAttrib4f(3,1,0,0,0);gl.vertexAttrib4f(4,0,1,0,0);gl.vertexAttrib4f(5,0,0,1,0);gl.vertexAttrib4f(6,0,0,0,1);gl.vertexAttrib3f(7,1,1,1);gl.drawElements(gl.TRIANGLES,it.n,gl.UNSIGNED_INT,0)}}}
    gl.depthMask(true);gl.bindVertexArray(null)}
  function dispose(){bufs.forEach(b=>gl.deleteBuffer(b));vaos.forEach(v=>gl.deleteVertexArray(v));gl.deleteProgram(pr);const x=gl.getExtension('WEBGL_lose_context');if(x)x.loseContext()}
  return{add,draw,dispose};
}

// ---- 3D-Ansicht als wiederverwendbares Bauteil (3D-Tab und Live-Ansicht im Zähler) ----
function View3D(box,cap,o){
  const cv=document.createElement('canvas');box.appendChild(cv);
  let R=null;try{R=GLR(cv)}catch(e){R=null}
  if(!R){box.innerHTML=`<p class="mu" style="padding:16px">${t('no3d')}</p>`;return null}
  const c=calc(),worn=o.worn,now=o.mode==='now',sc=buildScene(c,worn),N=c.total;
  const parts=sc.kinds.map(k=>({rows:k.rows,solid:R.add(k.geo,{m:k.m,c:k.c,alpha:1}),ghost:R.add(k.geo,{m:k.mR,c:k.cR,alpha:.18})}));
  const under=R.add(sc.under.geo,{vcol:sc.under.vcol,alpha:1});
  sc.meshes.forEach(m=>R.add(m.geo,m));
  const lb=(a,x)=>{let lo=0,hi=a.length;while(lo<hi){const m=(lo+hi)>>1;if(a[m]<x)lo=m+1;else hi=m}return lo};
  const live=!!o.live,Wm=sc.rowW(c.maxN);
  const st={R,raf:0,dirty:1,rx:0,ry:0,tgt:[0,0,0],dist:1,asp:1,row:Math.min(S.row,N),follow:false,mode:live?'follow':'free',goal:null,fdist:worn?2.4:Math.max(1.2,Wm*1.9)},dir=worn?vnorm([0,.2,1]):vnorm([0,.92,.38]);
  const pv=worn?13.5:0,modelFor=(rx,ry)=>{const m=M4.mul(M4.rx(rx),M4.ry(ry));const q=M4.app(m,[0,pv,0]);m[12]=-q[0];m[13]=pv-q[1];m[14]=-q[2];return m},modelM=()=>modelFor(st.rx,st.ry);
  // Übersicht: in der Live-Ansicht liegt der Schal flach immer waagerecht (Reihen von links nach rechts)
  const homeGoal=()=>{if(worn)return{tgt:[0,13.7,0],dist:Math.max(10,7.2/Math.min(1,st.asp)),ry:0,rx:0};
    if(live)return{tgt:[0,0,0],dist:Math.max(sc.R0*3.2/st.asp,Wm*2.2)+.3,ry:0,rx:0};
    return{tgt:[0,0,0],ry:st.asp<1?Math.PI/2:0,rx:0,dist:sc.R0*(st.asp<1?2.7:3.1/Math.min(1.6,st.asp))}};
  const home=()=>{st.follow=false;const g=homeGoal();st.tgt=g.tgt;st.dist=g.dist;st.ry=g.ry;st.rx=g.rx;st.goal=null;st.dirty=1};
  // Mitlaufen: aktuelle Reihe nah im Bild, flach leicht rechts der Mitte (fertiger Teil links sichtbar), am Model zur Kamera gedreht
  const followGoal=()=>{const P=sc.F[Math.min(st.row,N-1)].P;let ry=live&&!worn?0:st.ry;
    if(worn)ry=-Math.atan2(P[0],P[2]);
    let p=M4.app(modelFor(st.rx,ry),P);const d=st.fdist;
    if(!worn)p=[p[0]-.73*d*st.asp*.12,p[1],p[2]];
    return{tgt:p,dist:d,ry,rx:st.rx}};
  const setMode=m=>{st.mode=m;if(o.onMode)o.onMode(m)};
  const maxD=()=>worn?32:sc.R0*4.5/Math.min(1,st.asp);
  const toRow=()=>{st.tgt=M4.app(modelM(),sc.F[Math.min(st.row,N-1)].P);st.dirty=1};
  const ease=(g,snap)=>{if(snap){st.tgt=g.tgt;st.dist=g.dist;st.ry=g.ry;st.rx=g.rx;st.goal=null}else st.goal=g;st.dirty=1};
  function setRow(r){st.row=Math.min(Math.max(r,0),N);const nd=now?st.row:N;
    for(const p of parts){const k=lb(p.rows,nd);p.solid.count=k;p.ghost.count=now?p.rows.length-k:0}
    under.n=Math.max(0,Math.min(nd,N)-1)*6;
    const pc=Math.round(st.row/N*100);
    if(cap)cap.textContent=(o.live?'':worn?t('model'):'')+(now?t('cap3now')(st.row,N,pc):t('cap3all')(c.stTot,N))+(o.live?t('liveHelp'):t('help3d'));
    if(o.prog)o.prog.textContent=`${st.row} / ${N} · ${pc} %`;
    if(live&&st.mode==='follow')ease(followGoal(),!st.started);else if(st.follow)toRow();st.dirty=1}
  st.go=n=>{if(n){st.follow=true;toRow();st.dist=worn?1.6:.7;st.dirty=1}else home()};
  const fit=()=>{const w=box.clientWidth,h=box.clientHeight,dpr=Math.min(devicePixelRatio||1,2);cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);st.asp=w/Math.max(1,h);if(!st.init){st.init=1;home()}if(live&&st.mode==='follow')ease(followGoal(),true);st.dirty=1};
  function toggle(){if(st.mode==='follow'){setMode('overview');ease(homeGoal(),false)}else{setMode('follow');ease(followGoal(),false)}}
  st.ro=new ResizeObserver(fit);st.ro.observe(box);fit();
  const zoom=f=>{st.goal=null;st.dist=Math.max(.1,Math.min(maxD(),st.dist*f));if(live&&st.mode==='follow')st.fdist=st.dist;st.dirty=1};
  const pan=(dx,dy)=>{st.follow=false;st.goal=null;if(live&&st.mode==='follow')setMode('free');const V=M4.look(va(st.tgt,vk(dir,st.dist)),st.tgt,[0,1,0]),k=.72*st.dist/box.clientHeight;st.tgt=vas(vas(st.tgt,[V[0],V[4],V[8]],-dx*k),[V[1],V[5],V[9]],dy*k);st.dirty=1};
  const ptr=new Map();let pd=0;
  cv.onpointerdown=e=>{ptr.set(e.pointerId,[e.clientX,e.clientY]);cv.setPointerCapture(e.pointerId);pd=0;if(ptr.size===2){const[a,b]=[...ptr.values()];pd=Math.hypot(a[0]-b[0],a[1]-b[1])}};
  cv.onpointermove=e=>{const q=ptr.get(e.pointerId);if(!q)return;const dx=e.clientX-q[0],dy=e.clientY-q[1];ptr.set(e.pointerId,[e.clientX,e.clientY]);
    if(ptr.size===2){const[a,b]=[...ptr.values()],d=Math.hypot(a[0]-b[0],a[1]-b[1]);if(pd)zoom(pd/d);pd=d;pan(dx/2,dy/2)}
    else if(e.shiftKey||e.buttons===2)pan(dx,dy);
    else{st.goal=null;st.ry+=dx*.008;st.rx=Math.max(worn?-.25:-.6,Math.min(worn?.25:.6,st.rx+dy*.004));if(live&&st.mode==='follow'&&!worn){const g=followGoal();g.ry=st.ry;st.tgt=M4.app(modelFor(st.rx,st.ry),sc.F[Math.min(st.row,N-1)].P)}else if(st.follow)toRow();st.dirty=1}};
  cv.onpointerup=cv.onpointercancel=e=>{ptr.delete(e.pointerId);pd=0};
  cv.oncontextmenu=e=>e.preventDefault();
  cv.onwheel=e=>{e.preventDefault();zoom(1+e.deltaY*.0015)};
  const loop=()=>{st.raf=requestAnimationFrame(loop);
    const tn=performance.now(),dt=Math.min(.5,Math.max(0,(tn-(st.tp||tn))/1000));st.tp=tn;
    if(st.goal){const g=st.goal,k=1-Math.exp(-dt/.16);let dr=g.ry-st.ry;dr=Math.atan2(Math.sin(dr),Math.cos(dr));
      st.tgt=st.tgt.map((v,i)=>v+(g.tgt[i]-v)*k);st.dist+=(g.dist-st.dist)*k;st.ry+=dr*k;st.rx+=(g.rx-st.rx)*k;
      if(vlen(vs(g.tgt,st.tgt))<1e-3&&Math.abs(g.dist-st.dist)<1e-3&&Math.abs(dr)<1e-3){st.tgt=g.tgt;st.dist=g.dist;st.ry=g.ry;st.rx=g.rx;st.goal=null}st.dirty=1}
    if(!st.dirty)return;st.dirty=0;
    const eye=va(st.tgt,vk(dir,st.dist)),VP=M4.mul(M4.persp((worn?32:40)*Math.PI/180,st.asp,Math.max(.004,st.dist*.01),st.dist*4+40),M4.look(eye,st.tgt,[0,1,0]));
    R.draw(VP,modelM(),eye)};
  setRow(S.row);st.started=true;if(o.onMode)o.onMode(st.mode);loop();
  // Hilfsfunktion für Tests: Bildschirmposition (NDC) eines Punkts
  const ndc=P=>{const eye=va(st.tgt,vk(dir,st.dist)),VP=M4.mul(M4.persp((worn?32:40)*Math.PI/180,st.asp,Math.max(.004,st.dist*.01),st.dist*4+40),M4.look(eye,st.tgt,[0,1,0])),w=M4.app(modelM(),P),x=VP[0]*w[0]+VP[4]*w[1]+VP[8]*w[2]+VP[12],y=VP[1]*w[0]+VP[5]*w[1]+VP[9]*w[2]+VP[13],ww=VP[3]*w[0]+VP[7]*w[1]+VP[11]*w[2]+VP[15];return[x/ww,y/ww]};
  return{st,setRow,toggle,ndc,F:sc.F,go:st.go,stop(){cancelAnimationFrame(st.raf);st.ro.disconnect();R.dispose()}};
}

function v3d(){
  return `<section class="card"><div class="seg"><button class="${V3.view==='flat'?'on':''}" onclick="V3.setView('flat')">${t('flat')}</button><button class="${V3.view==='worn'?'on':''}" onclick="V3.setView('worn')">${t('worn')}</button></div>
  <div class="seg"><button class="${V3.mode==='all'?'on':''}" onclick="V3.set('all')">${t('fin')}</button><button class="${V3.mode==='now'?'on':''}" onclick="V3.set('now')">${t('cur')}</button></div>
  <div id="gl" class="gl"></div>
  <div class="seg" style="margin-top:10px"><button onclick="V3.go(0)">${t('whole')}</button><button onclick="V3.go(1)">${t('toRow')}</button></div>
  <p class="mu" id="glt"></p></section>`;
}
const V3={mode:'all',view:'flat',ctl:null,
  set(m){this.mode=m;render()},
  setView(v){this.view=v;render()},
  go(n){if(this.ctl)this.ctl.go(n)},
  stop(){if(this.ctl){this.ctl.stop();this.ctl=null}},
  start(){this.ctl=View3D($('gl'),$('glt'),{worn:this.view==='worn',mode:this.mode});window.__v3=this.ctl&&this.ctl.st}
};
const LIVE={ctl:null,
  toggle(){if(this.ctl)this.ctl.toggle()},
  stop(){if(this.ctl){this.ctl.stop();this.ctl=null}},
  start(){this.ctl=View3D($('lgl'),$('lglt'),{worn:DB.liveView==='worn',mode:'now',live:true,prog:$('lvp'),onMode:m=>{const b=$('lvbtn');if(b)b.textContent=m==='follow'?t('liveWhole'):t('liveBack')}});window.__lv=this.ctl&&this.ctl.st;window.__lvctl=this.ctl}
};
