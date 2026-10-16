// Nachbau von supabase-js für die automatischen Tests.
// Alle Daten liegen im Test-Prozess (harness.js) und werden über window.__sb() abgefragt,
// so sehen mehrere Browserfenster dieselbe "Datenbank" wie in echt.
window.supabase={createClient(){
  const uid=window.__uid,email=window.__email,ls=[],chans=[];
  let session=localStorage.getItem('mock.login')?{user:{id:uid,email}}:null;
  const call=(op,a)=>window.__sb(op,{...a,uid});
  function from(t){const st={t,f:{},op:'select',single:false};const o={
    select(){return o},eq(k,v){st.f[k]=v;return o},order(k,opt){st.order=[k,!opt||opt.ascending!==false];return o},maybeSingle(){st.single=true;return o},
    insert(row){st.op='insert';st.row=row;return o},upsert(row){st.op='upsert';st.row=row;return o},delete(){st.op='delete';return o},
    then(res,rej){return call(st.op,{t:st.t,f:st.f,row:st.row,order:st.order}).then(r=>st.single&&!r.error?{data:(r.data||[])[0]||null,error:null}:r).then(res,rej)}};return o}
  window.__onChange=(t,ev,row)=>chans.forEach(c=>c.h.forEach(h=>{if(h.type!=='postgres_changes'||h.f.table!==t)return;
    if(h.f.filter&&row&&!h.f.filter.endsWith(row.user_id))return;h.fn(ev==='DELETE'?{eventType:'DELETE',old:row}:{eventType:ev,new:row})}));
  window.__presence=keys=>chans.forEach(c=>{if(c.name!=='online')return;c.ps={};keys.forEach(k=>c.ps[k]=[{}]);c.h.forEach(h=>{if(h.type==='presence')h.fn()})});
  const auth={
    getUser:async()=>{if(!session)return{data:{user:null},error:null};const r=await call('getUser',{});return r.error?{data:{user:null},error:r.error}:{data:{user:session.user},error:null}},
    onAuthStateChange(fn){ls.push(fn);setTimeout(()=>fn('INITIAL_SESSION',session),0)},
    getSession:async()=>({data:{session}}),
    signInWithOAuth:async()=>{localStorage.setItem('mock.login','1');session={user:{id:uid,email}};setTimeout(()=>ls.forEach(f=>f('SIGNED_IN',session)),200);return{error:null}},
    signOut:async()=>{localStorage.removeItem('mock.login');session=null;ls.forEach(f=>f('SIGNED_OUT',null));return{error:null}}};
  return{auth,from,rpc:name=>call('rpc',{name}),
    channel(name){const c={name,h:[],ps:{},on(type,f,fn){c.h.push({type,f,fn});return c},
      subscribe(cb){chans.push(c);if(cb)setTimeout(()=>cb('SUBSCRIBED'),0);if(name==='online')call('presenceSync',{});return c},
      track(){return call('track',{})},untrack(){return call('untrack',{})},presenceState(){return c.ps}};return c},
    removeChannel(c){const i=chans.indexOf(c);if(i>=0)chans.splice(i,1);if(c&&c.name==='online')call('untrack',{})}}}};
