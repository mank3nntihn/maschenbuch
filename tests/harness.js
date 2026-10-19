// Gemeinsame Test-Umgebung: Browser, Mini-Datenbank mit denselben Regeln wie Supabase, Hilfsfunktionen
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const BASE=process.env.BASE||'http://localhost:8765/';
const MOCK=fs.readFileSync(path.join(__dirname,'mocksb.js'),'utf8');
const PK={user_state:['user_id'],kal:['user_id'],tausch:['id'],tausch_wunsch:['tausch_id','user_id']};
async function create(opt={}){
  const browser=await chromium.launch(opt.launch||{});const pages=[];const errors=[];
  const db={user_state:[],kal:[],tausch:[],tausch_wunsch:[]},gone=new Set(),online=new Set();let n=0;
  // Einladungscode wie in der Datenbank: Groß-/Kleinschreibung egal, Mitglieder bleiben Mitglieder
  const kreis={code:'testcode',mitglieder:new Set(),versuche:0};const codeOk=c=>String(c||'').trim().toLowerCase()===kreis.code;
  const strip=r=>{const{_ts,...x}=r;return x};
  const notify=(t,ev,row)=>pages.forEach(p=>p.evaluate(([t,ev,row])=>window.__onChange&&window.__onChange(t,ev,row),[t,ev,strip(row)]).catch(()=>{}));
  const presence=()=>pages.forEach(p=>p.evaluate(k=>window.__presence&&window.__presence(k),[...online]).catch(()=>{}));
  const match=(r,f)=>Object.entries(f||{}).every(([k,v])=>r[k]===v);
  const same=(t,a,b)=>PK[t].every(k=>a[k]===b[k]);
  function handle(op,a){const{t,uid}=a;
    if(op==='getUser')return gone.has(uid)?{error:{status:403,message:'User not found'}}:{error:null};
    if(op==='track'){online.add(uid);presence();return{}}
    if(op==='untrack'){online.delete(uid);presence();return{}}
    if(op==='presenceSync'){setTimeout(presence,0);return{}}
    if(op==='rpc'&&a.name==='kreis_code_pruefen'){if(kreis.versuche>=10)return{data:null,error:{message:'zu_viele_versuche'}};const ok=codeOk(a.args.code);if(!ok)kreis.versuche++;return{data:ok,error:null}}
    if(op==='rpc'&&a.name==='kreis_beitreten'){if(kreis.mitglieder.has(uid))return{data:true,error:null};if(!codeOk(a.args.code))return{data:false,error:null};kreis.mitglieder.add(uid);return{data:true,error:null}}
    if(op==='rpc'){if(a.name!=='delete_my_account')return{error:{message:'unbekannte Funktion'}};gone.add(uid);online.delete(uid);kreis.mitglieder.delete(uid);
      const mine=new Set(db.tausch.filter(r=>r.user_id===uid).map(r=>r.id));
      for(const k of Object.keys(db)){const old=db[k];db[k]=old.filter(r=>r.user_id!==uid&&!(k==='tausch_wunsch'&&mine.has(r.tausch_id)));old.filter(r=>!db[k].includes(r)).forEach(r=>notify(k,'DELETE',r))}
      presence();return{data:null,error:null}}
    if(gone.has(uid)&&op!=='select')return{error:{code:'23503',message:'violates foreign key constraint'}};
    if(op==='select'){let rows=db[t].filter(r=>match(r,a.f));if(t==='user_state')rows=rows.filter(r=>r.user_id===uid);
      if(a.order){const[k,asc]=a.order;rows=[...rows].sort((x,y)=>(x[k]>y[k]?1:-1)*(asc?1:-1))}return{data:rows.map(strip),error:null}}
    if(op==='upsert'){const row={...a.row,user_id:uid};const i=db[t].findIndex(r=>same(t,r,row));
      if(i>=0&&Date.now()-db[t][i]._ts<500)return{error:{code:'P0001',message:'zu_schnell'}};// wie der Trigger write_brake
      const v={...row,updated_at:new Date().toISOString(),_ts:Date.now()};if(i>=0)db[t][i]=v;else db[t].push(v);notify(t,i>=0?'UPDATE':'INSERT',v);return{error:null}}
    if(op==='insert'){const row={...a.row,user_id:uid,created_at:new Date(Date.now()+(n++)).toISOString()};if(t==='tausch')row.id='t'+(++n);
      if(t==='tausch'&&db.tausch.filter(r=>r.user_id===uid).length>=30)return{error:{code:'P0001',message:'zu_viele_angebote'}};
      if(t==='tausch_wunsch'&&!db.tausch.some(r=>r.id===row.tausch_id))return{error:{code:'23503',message:'fk'}};
      if(db[t].some(r=>same(t,r,row)))return{error:{code:'23505',message:'duplicate key'}};
      db[t].push(row);notify(t,'INSERT',row);return{data:null,error:null}}
    if(op==='delete'){const del=db[t].filter(r=>match(r,a.f)&&r.user_id===uid);db[t]=db[t].filter(r=>!del.includes(r));
      if(t==='tausch'){const ids=new Set(del.map(r=>r.id));db.tausch_wunsch=db.tausch_wunsch.filter(w=>!ids.has(w.tausch_id))}
      del.forEach(r=>notify(t,'DELETE',r));return{error:null}}
    return{error:{message:'unbekannt '+op}}}
  async function page(uid,email,o={}){
    const ctx=await browser.newContext({viewport:o.viewport||{width:390,height:844},serviceWorkers:o.sw?'allow':'block',...(o.video?{recordVideo:o.video}:{})});
    await ctx.route('**/supabase.js',r=>r.fulfill({contentType:'text/javascript',body:MOCK}));
    await ctx.route(/hobbii|shopify|googleapis|gstatic/,r=>r.abort());
    const p=await ctx.newPage();p.on('pageerror',e=>errors.push(uid+': '+e.message));
    await p.addInitScript(([u,e,login,code])=>{window.__uid=u;window.__email=e;if(!sessionStorage.getItem('mock.init')){sessionStorage.setItem('mock.init','1');if(login)localStorage.setItem('mock.login','1');if(code)localStorage.setItem('mb.kreis',code)}},[uid,email,!!o.login,o.ohneCode?'':'testcode']);
    await p.exposeFunction('__sb',(op,a)=>handle(op,a));
    if(o.init)for(const [fn,arg] of (Array.isArray(o.init[0])?o.init:[o.init]))await p.addInitScript(fn,arg);
    pages.push(p);p.ctx=ctx;
    await p.goto(BASE+(o.url||'index.html'));if(o.url)return p;await p.waitForFunction(()=>window.SB&&typeof render==='function');if(o.ohneCode)return p;
    if(o.login)await p.waitForFunction(()=>SB.user,null,{timeout:5000});
    return p}
  async function until(p,fn,arg,ms=5000){try{await p.waitForFunction(fn,arg,{timeout:ms,polling:100});return true}catch(e){return false}}
  return{browser,page,until,db,online,gone,kreis,errors,close:()=>browser.close()}}
module.exports={create,BASE};
