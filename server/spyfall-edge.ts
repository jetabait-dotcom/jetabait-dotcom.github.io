import {createRoom,joinRoom,advance,act,view} from './spyfall-engine.mjs';
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization,content-type,apikey','Access-Control-Allow-Methods':'POST,OPTIONS','Cache-Control':'no-store'};
const base=Deno.env.get('SUPABASE_URL')!;
const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')||'{}').default;
const headers={apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json',Prefer:'return=representation'};
async function db(query:string,method='GET',body?:unknown){const r=await fetch(base+'/rest/v1/spyfall_rooms?'+query,{method,headers,body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error('เชื่อมต่อฐานข้อมูลไม่สำเร็จ');return r.json()}
const respond=(body:unknown,status=200)=>Response.json(body,{status,headers:cors});
const hash=async(s:string)=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))].map(x=>x.toString(16).padStart(2,'0')).join('');
const clean=(s:unknown)=>String(s||'').replace(/[\u0000-\u001f]/g,'').trim().slice(0,30);
const publicRoom=(r:any,id:string)=>({code:r.code,version:r.version,...view(r.state,id)});
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response(null,{headers:cors});if(req.method!=='POST')return respond({error:'ใช้ POST'},405);
 try{
  const raw=await req.text();if(raw.length>2000)return respond({error:'ข้อมูลใหญ่เกินไป'},413);
  // verify_jwt=true: the platform verifies the signature before calling this handler.
  let claims:any;try{const jwt=(req.headers.get('Authorization')||'').replace(/^Bearer /i,'');claims=JSON.parse(atob(jwt.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')))}catch{return respond({error:'กรุณาเข้าสู่ระบบ Google'},401)}
  if(claims.role!=='authenticated'||!claims.sub)return respond({error:'กรุณาเข้าสู่ระบบ Google'},401);
  const id=await hash('spyfall:'+claims.sub),{action,code='',data={},version}=JSON.parse(raw);
  if(action==='create'){
   const name=clean(data.name);if(!name)return respond({error:'ใส่ชื่อเล่นก่อน'},400);
   const recent=await db('creator_hash=eq.'+id+'&created_at=gte.'+encodeURIComponent(new Date(Date.now()-60000).toISOString())+'&select=code&limit=3');if(recent.length>=3)return respond({error:'สร้างห้องถี่เกินไป รอสักครู่'},429);
   const code=crypto.randomUUID().replaceAll('-','').slice(0,8).toUpperCase();const [row]=await db('','POST',{code,creator_hash:id,state:createRoom(id,name)});return respond(publicRoom(row,id));
  }
  if(!/^[A-F0-9]{8}$/.test(code))return respond({error:'รหัสห้องต้องมี 8 ตัว'},400);
  const [row]=await db('code=eq.'+code+'&select=*');if(!row)return respond({error:'ไม่พบห้องนี้'},404);if(Date.now()-Date.parse(row.updated_at)>86400000)return respond({error:'ห้องนี้หมดอายุแล้ว สร้างห้องใหม่ได้เลย'},410);
  const member=row.state.players.some((p:any)=>p.id===id);
  if(!member&&action!=='join')return respond({error:'มึงไม่ได้อยู่ในห้องนี้'},403);
  let state=advance(row.state);
  if(action==='join'){
   if(!member){const name=clean(data.name);if(!name)return respond({error:'ใส่ชื่อเล่นก่อน'},400);state=joinRoom(state,id,name)}
  }else if(action==='state'){
   if(state.phase===row.state.phase)return respond(publicRoom(row,id));
  }else{
   if(!Number.isInteger(version)||version!==row.version)return respond({error:'ห้องเปลี่ยนแล้ว กำลังอัปเดต ลองกดอีกครั้ง'},409);
   if(action==='accuse'){
    if(!Number.isInteger(data.target)||!state.players[data.target])return respond({error:'เลือกผู้เล่นก่อน'},400);
    data.target=state.players[data.target].id;
   }
   state=act(state,id,action,data);
  }
  const rows=await db('code=eq.'+code+'&version=eq.'+row.version,'PATCH',{state,version:row.version+1,updated_at:new Date().toISOString()});
  if(!rows.length)return respond({error:'มีคนกดพร้อมกัน กำลังอัปเดต ลองอีกครั้ง'},409);
  if(action==='leave')return respond({left:true});return respond(publicRoom(rows[0],id));
 }catch(e){return respond({error:e instanceof Error?e.message.slice(0,160):'เชื่อมต่อไม่สำเร็จ'},400)}
});
