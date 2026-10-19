// Zeitlupe für die Aufnahme: alles in der Seite läuft K-mal langsamer (Uhren, Timer, Animationsbilder).
// CSS-Animationen werden zusätzlich über das Chrome-Protokoll verlangsamt (siehe aufnahme.js).
// Danach wird das Video mit ffmpeg wieder K-fach beschleunigt → K-mal so viele echte Einzelbilder.
module.exports=K=>{if(window.__zeitlupe)return;window.__zeitlupe=K;
  const pn=performance.now.bind(performance),dn=Date.now,p0=pn(),d0=dn();
  performance.now=()=>p0+(pn()-p0)/K;Date.now=()=>Math.round(d0+(dn()-d0)/K);
  const OD=Date;window.Date=class extends OD{constructor(...a){a.length?super(...a):super(Date.now())}static now(){return Date.now()}};window.Date.now=()=>Math.round(d0+(dn()-d0)/K);
  const st=window.setTimeout,si=window.setInterval;
  window.setTimeout=(f,ms,...a)=>st(f,(ms||0)*K,...a);window.setInterval=(f,ms,...a)=>si(f,(ms||0)*K,...a);
  const raf=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=cb=>raf(t=>cb(p0+(t-p0)/K));
  // weiches Scrollen über die verlangsamte Zeit (das eingebaute "smooth" lässt sich nicht verlangsamen)
  window.__scrollSanft=(ziel,dauer=600)=>new Promise(res=>{const s=scrollY,t0=performance.now();const step=()=>{const k=Math.min(1,(performance.now()-t0)/dauer),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;scrollTo(0,s+(ziel-s)*e);k<1?requestAnimationFrame(step):res()};requestAnimationFrame(step)});
};
