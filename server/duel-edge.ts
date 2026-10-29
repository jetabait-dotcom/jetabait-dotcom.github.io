import { newGame, step, view } from './duel-engine.mjs';
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization,content-type,apikey,x-duel-token','Access-Control-Allow-Methods':'POST,OPTIONS','Cache-Control':'no-store'};
const base=Deno.env.get('SUPABASE_URL')!;
const key= Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')||'{}').default;
const headers={'apikey':key,'Authorization':'Bearer '+key,'Content-Type':'application/json'};
async function database(query:string,method='GET',body?:unknown){const r=await fetch(base+'/rest/v1/duel_rooms?'+query,{method,headers:{...headers,Prefer:'return=representation'},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error('เชื่อมต่อฐานข้อมูลไม่สำเร็จ');return await r.json()}
const respond=(body:unknown,status=200)=>Response.json(body,{status,headers:cors});
const cleanName=(x:unknown)=>String(x||'').replace(/[\u0000-\u001f]/g,'').trim().slice(0,30);
async function hash(value:string){const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));return [...new Uint8Array(digest)].map(n=>n.toString(16).padStart(2,'0')).join('')}
function publicRoom(row:any,seat:number){return {code:row.code,version:row.version,seat,names:row.names,state:row.state.phase==='waiting'?{phase:'waiting'}:view(row.state,seat,row.names)}}
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response(null,{headers:cors});
 if(req.method!=='POST')return respond({error:'ใช้ POST'},405);
 try{
  if(Number(req.headers.get('content-length')||0)>4000)return respond({error:'ข้อมูลใหญ่เกินไป'},413);
  const token=req.headers.get('x-duel-token')||'';if(!/^[a-f0-9]{64}$/.test(token))return respond({error:'รหัสผู้เล่นไม่ถูกต้อง'},401);
  const raw=await req.text();if(raw.length>4000)return respond({error:'ข้อมูลใหญ่เกินไป'},413);
  // The platform verifies this JWT before this handler. Bind each capability to its Auth user.
  const jwt=(req.headers.get('Authorization')||'').replace(/^Bearer /i,'');
  let claims:any;try{claims=JSON.parse(atob(jwt.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')))}catch{return respond({error:'กรุณาเข้าสู่ระบบ'},401)}
  if(claims.role!=='authenticated'||!claims.sub)return respond({error:'กรุณาเข้าสู่ระบบ Google'},401);
  const {action,code='',data={},version}=JSON.parse(raw);const identity=await hash(token+':'+claims.sub);
  if(action==='create'){
   const name=cleanName(data.name);if(!name)return respond({error:'ใส่ชื่อเล่นก่อน'},400);
   const recent=await database('hash_a=eq.'+identity+'&updated_at=gte.'+encodeURIComponent(new Date(Date.now()-60000).toISOString())+'&select=code&limit=4');
   if(recent.length>=3)return respond({error:'สร้างห้องถี่เกินไป รอสักครู่'},429);
   const id=crypto.randomUUID().replaceAll('-','').slice(0,10).toUpperCase();
   const [row]=await database('', 'POST',{code:id,hash_a:identity,names:[name],state:{phase:'waiting'}});return respond(publicRoom(row,0));
  }
  if(!/^[A-F0-9]{10}$/.test(code))return respond({error:'รหัสห้องต้องมี 10 ตัว'},400);
  const [row]=await database('code=eq.'+code+'&select=*');if(!row)return respond({error:'ไม่พบห้องนี้'},404);
  let seat=row.hash_a===identity?0:row.hash_b===identity?1:-1;
  if(action==='join'&&seat<0){
   if(row.hash_b)return respond({error:'ห้องเต็มแล้ว เกมนี้เล่นได้ 2 คน'},409);
   const name=cleanName(data.name);if(!name)return respond({error:'ใส่ชื่อเล่นก่อน'},400);
   const rows=await database('code=eq.'+code+'&version=eq.'+row.version+'&hash_b=is.null','PATCH',{hash_b:identity,names:[row.names[0],name],state:newGame(),version:row.version+1,updated_at:new Date().toISOString()});
   if(!rows.length)return respond({error:'มีคนเข้าห้องแล้ว ลองอีกครั้ง'},409);return respond(publicRoom(rows[0],1));
  }
  if(seat<0)return respond({error:'คุณไม่ใช่ผู้เล่นของห้องนี้'},403);
  if(['state','join'].includes(action))return respond(publicRoom(row,seat));
  if(!Number.isInteger(version)||version!==row.version)return respond({error:'อีกฝ่ายเดินไปแล้ว กำลังอัปเดตกระดาน'},409);
  if(row.state.phase==='waiting')return respond({error:'รอผู้เล่นอีกคนก่อน'},409);
  let next;
  if(action==='rematch'){
   if(row.state.phase!=='finished')return respond({error:'ต้องจบเกมก่อน'},409);
   next=structuredClone(row.state);next.rematch||=[false,false];next.rematch[seat]=true;if(next.rematch.every(Boolean))next=newGame();
  }else if(action==='resign'){
   if(row.state.phase==='finished')return respond({error:'เกมจบแล้ว'},409);
   next=structuredClone(row.state);next.phase='finished';next.winner=1-seat;next.reason='resign';next.pending=[];
   // score estimates are informational after resignation; the winner is explicit.
   const {score}=await import('./duel-engine.mjs');next.scores=[score(next,0),score(next,1)];
  }else next=step(row.state,seat,action,data);
  const rows=await database('code=eq.'+code+'&version=eq.'+row.version,'PATCH',{state:next,version:row.version+1,updated_at:new Date().toISOString()});
  if(!rows.length)return respond({error:'กระดานเปลี่ยนแล้ว ลองเลือกใหม่'},409);
  return respond(publicRoom(rows[0],seat));
 }catch(error){const message=error instanceof Error?error.message:'เชื่อมต่อไม่สำเร็จ';return respond({error:message.startsWith('เชื่อมต่อฐาน')?message:message.slice(0,160)},400)}
});
