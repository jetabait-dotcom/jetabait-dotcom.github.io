import { LOCATIONS,CATALOG } from './spyfall-data.mjs';
const fail=message=>{throw Error(message)};
const random=n=>{const a=new Uint32Array(1),max=4294967296-4294967296%n;do{crypto.getRandomValues(a)}while(a[0]>=max);return a[0]%n};
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=random(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
export function createRoom(id,name){return {phase:'lobby',players:[{id,name,score:0}],round:0,host:id,previousSpy:null,history:[]}}
export function joinRoom(input,id,name){const s=structuredClone(input);if(s.players.some(p=>p.id===id))return s;if(s.phase!=='lobby')fail('รอบเริ่มแล้ว รอเจ้าของห้องกลับล็อบบี้ก่อน');if(s.players.length>=8)fail('ห้องเต็มแล้ว เล่นได้สูงสุด 8 คน');s.players.push({id,name,score:0});if(!s.host)s.host=id;return s}
function finish(s,winner,reason,bonus=null){s.phase='result';s.result={winner,reason,spy:s.spy,location:s.location,bonus};for(const p of s.players){let points=0;if(winner==='spy'&&p.id===s.spy)points=reason==='survive'?2:4;else if(winner==='agents'&&p.id!==s.spy)points=1+(p.id===bonus?1:0);p.score+=points;p.gain=points}s.previousSpy=s.spy;s.history.push({round:s.round,winner,reason});s.vote=null;s.deadline=null;return s}
export function advance(input,now=Date.now()){const s=structuredClone(input);if(s.phase==='playing'&&now>=s.deadline){s.phase='final';s.deadline=null;s.remaining=0}return s}
export function act(input,id,action,data={},now=Date.now()){
 const s=advance(input,now),me=s.players.find(p=>p.id===id);if(!me)fail('มึงไม่ได้อยู่ในห้องนี้');
 if(action==='leave'){if(s.phase!=='lobby')fail('ออกจากรายชื่อได้เฉพาะล็อบบี้');s.players=s.players.filter(p=>p.id!==id);if(s.host===id)s.host=s.players[0]?.id||null;return s}
 if(action==='lobby'){if(s.host!==id||s.phase!=='result')fail('เฉพาะเจ้าของห้องหลังจบรอบ');s.phase='lobby';return s}
 if(action==='start'){
  if(s.host!==id)fail('เจ้าของห้องเป็นคนเริ่ม');if(!['lobby','result'].includes(s.phase))fail('รอบยังไม่จบ');if(s.players.length<3)fail('ต้องมีอย่างน้อย 3 คน');
  if(s.round>=5){s.round=0;s.history=[];s.players.forEach(p=>p.score=0)}
  s.round++;s.phase='playing';s.spy=shuffle(s.players)[0].id;const unused=LOCATIONS.filter(p=>p.id!==s.location);const loc=unused[random(unused.length)];s.location=loc.id;const roles=shuffle(loc.roles);s.roles=Object.fromEntries(s.players.filter(p=>p.id!==s.spy).map((p,i)=>[p.id,roles[i]]));s.first=s.players.some(p=>p.id===s.previousSpy)?s.previousSpy:shuffle(s.players)[0].id;s.deadline=now+480000;s.remaining=480000;s.accusedBy=[];s.vote=null;s.result=null;s.guess=null;s.players.forEach(p=>p.gain=0);return s;
 }
 if(action==='accuse'){
  if(!['playing','final'].includes(s.phase))fail('ตอนนี้เริ่มโหวตไม่ได้');const final=s.phase==='final';if(final&&s.host!==id)fail('ให้เจ้าของห้องเลือกผู้ต้องสงสัยจากที่ทุกคนตกลงกัน');
  if(!final&&s.accusedBy.includes(id))fail('มึงใช้สิทธิ์กล่าวหารอบนี้แล้ว');if(!s.players.some(p=>p.id===data.target)||data.target===id&&!final)fail('เลือกผู้เล่นคนอื่น');
  s.remaining=final?0:Math.max(0,s.deadline-now);s.vote={target:data.target,proposer:id,final,votes:final?{}:{[id]:true}};if(!final)s.accusedBy.push(id);s.phase='voting';s.deadline=null;return s;
 }
 if(action==='vote'){
  if(s.phase!=='voting')fail('ไม่มีการโหวตอยู่');if(s.vote.target===id)fail('ผู้ถูกกล่าวหาไม่ลงคะแนน');if(id in s.vote.votes)fail('มึงโหวตไปแล้ว');if(typeof data.yes!=='boolean')fail('คะแนนไม่ถูกต้อง');s.vote.votes[id]=data.yes;
  if(!data.yes){if(s.vote.final)return finish(s,'spy','survive');s.phase='playing';s.deadline=now+s.remaining;s.vote=null;return s}
  if(s.players.filter(p=>p.id!==s.vote.target).every(p=>s.vote.votes[p.id]===true)){const v=s.vote;return finish(s,v.target===s.spy?'agents':'spy',v.target===s.spy?'caught':'wrong',v.target===s.spy&&!v.final?v.proposer:null)}return s;
 }
 if(action==='guess'){
  if(s.phase!=='playing'||id!==s.spy)fail('สายลับเดาได้เฉพาะตอนเวลาเดิน');if(!LOCATIONS.some(p=>p.id===data.location))fail('เลือกสถานที่ก่อน');s.guess=data.location;return finish(s,data.location===s.location?'spy':'agents',data.location===s.location?'guess':'miss');
 }
 fail('คำสั่งไม่ถูกต้อง');
}
export function view(s,id,now=Date.now()){
 const p=s.players.find(p=>p.id===id);if(!p)fail('มึงไม่ได้อยู่ในห้องนี้');
 const names=new Map(s.players.map((p,i)=>[p.id,i]));
 const result=s.phase==='result'?{...s.result,spy:names.get(s.spy),location:CATALOG.find(p=>p.id===s.location),guess:CATALOG.find(p=>p.id===s.guess)||null,roles:s.players.map(p=>p.id===s.spy?'สายลับ':s.roles[p.id]),bonus:s.result.bonus?names.get(s.result.bonus):null}:null;
 return {phase:s.phase,round:s.round,host:names.get(s.host),seat:names.get(id),serverNow:now,deadline:s.deadline,remaining:s.remaining,first:names.get(s.first),players:s.players.map(p=>({name:p.name,score:p.score,gain:p.gain||0})),canAccuse:s.phase==='playing'&&!s.accusedBy.includes(id),secret:['playing','voting','final'].includes(s.phase)?(s.spy===id?{spy:true}:{spy:false,location:CATALOG.find(p=>p.id===s.location),role:s.roles[id]}):null,vote:s.vote?{target:names.get(s.vote.target),proposer:names.get(s.vote.proposer),final:s.vote.final,count:Object.keys(s.vote.votes).length,mine:id in s.vote.votes?s.vote.votes[id]:null}:null,result};
}
