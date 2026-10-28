import { createClient } from './vendor/supabase.js';

const $ = id => document.getElementById(id);
const config = window.JETABAIT_CONFIG;
const db = createClient(config.supabaseUrl, config.supabasePublishableKey, { auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false} });
let token, storage, state = null, roomCode = '', channel, busy = false, refreshing = false, epoch = 0, clockOffset = 0, mode = 'create', noticeTimer, refreshTimer, expiredDeadline = '';
const teamName = team => team === 'red' ? 'ทีมแดง' : team === 'blue' ? 'ทีมฟ้า' : 'ผู้ชม';
const roleName = role => role === 'spymaster' ? 'คนใบ้' : role === 'operative' ? 'คนทาย' : 'ผู้ชม';
const timeFormat = new Intl.DateTimeFormat('th-TH', {timeZone:'Asia/Bangkok',hour:'2-digit',minute:'2-digit'});
function notice(text) { $('notice').textContent = text; clearTimeout(noticeTimer); if(text)noticeTimer=setTimeout(()=>$('notice').textContent='',8000); }
try {
  storage=localStorage;
  const probe='jetacode-storage-check';storage.setItem(probe,'1');storage.removeItem(probe);
} catch { try { storage=sessionStorage; } catch { storage=null; } }
try {
  token = storage.getItem('jetacode-player');
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(token || '')) { token=crypto.randomUUID();storage.setItem('jetacode-player',token); }
  $('nickname').value=storage.getItem('jetacode-name')||'';
} catch { token=crypto.randomUUID();notice('เบราว์เซอร์บันทึกผู้เล่นไม่ได้ อย่าปิดหน้านี้ระหว่างเล่น'); }
function save(key,value){try{value===null?storage.removeItem(key):storage.setItem(key,value);}catch{}}
async function rpc(action,data={},code=roomCode){
  const {data:result,error}=await db.rpc('jeta_game',{p_token:token,p_action:action,p_code:code,p_data:data});
  if(error)throw Error(error.message||'เชื่อมต่อห้องไม่ได้');return result;
}
function setMode(value){mode=value;$('create-tab').setAttribute('aria-selected',String(mode==='create'));$('join-tab').setAttribute('aria-selected',String(mode==='join'));$('code-field').hidden=mode!=='join';$('room-code').required=mode==='join';$('create-options').hidden=mode!=='create';$('entry-submit').textContent=mode==='create'?'สร้างห้องและชวนเพื่อน ↗':'เข้าร่วมห้อง →';}
$('create-tab').onclick=()=>setMode('create');$('join-tab').onclick=()=>setMode('join');
$('language').onchange=()=>{$('custom-field').hidden=$('language').value!=='custom';};
$('room-code').addEventListener('input',()=>{$('room-code').value=$('room-code').value.toUpperCase();});
function connection(text,offline=false){$('connection').textContent=text;$('connection').classList.toggle('offline',offline);}
async function refresh(){
  if(!roomCode||refreshing||busy)return;
  refreshing=true;const current=epoch,code=roomCode;
  try {const next=await rpc('state',{},code);if(current!==epoch)return;accept(next);connection(channel?.state==='joined'?'ออนไลน์ · เชื่อมต่อสด':'ออนไลน์ · ซิงก์สำรอง');}
  catch(error){if(current===epoch){connection('ขาดการเชื่อมต่อ · กำลังลองใหม่',true);}}
  finally{refreshing=false;}
}
function scheduleRefresh(){clearTimeout(refreshTimer);refreshTimer=setTimeout(()=>void refresh(),80);}
function accept(next,force=false){
  if(next.code!==roomCode)return;
  if(state && next.version<state.version)return;
  clockOffset=new Date(next.serverTime).getTime()-Date.now();
  const changed=force||!state||state.version!==next.version;state=next;if(changed)render();countdown();
}
async function enter(next){
  epoch++;roomCode=next.code;state=null;expiredDeadline='';save('jetacode-room',roomCode);
  history.replaceState(null,'',new URL('?room='+roomCode,location.href));
  $('entrance').hidden=true;$('room').hidden=false;
  if(channel)void db.removeChannel(channel);
  const current=epoch;
  channel=db.channel('jeta-game:'+roomCode).on('broadcast',{event:'refresh'},()=>{if(current===epoch)scheduleRefresh();}).subscribe(status=>{if(current!==epoch)return;if(status==='SUBSCRIBED'){connection('ออนไลน์ · เชื่อมต่อสด');scheduleRefresh();}else if(['CHANNEL_ERROR','TIMED_OUT','CLOSED'].includes(status)){connection('ซิงก์สำรอง · กำลังต่อสดใหม่',true);}});
  accept(next,true);
}
$('entry-form').addEventListener('submit',async event=>{
  event.preventDefault();if(busy)return;busy=true;$('entry-submit').disabled=true;
  try {
    const name=$('nickname').value.trim();if(!name)throw Error('ใส่ชื่อเล่นก่อน');save('jetacode-name',name);
    const data={name,language:$('language').value,seconds:Number($('seconds').value)};
    if(data.language==='custom')data.words=$('custom-words').value.split(/[,\n\r]+/).map(w=>w.trim()).filter(Boolean);
    const next=await rpc(mode==='create'?'create':'join',data,mode==='join'?$('room-code').value.trim().toUpperCase():'');await enter(next);
  }catch(error){notice(error.message);}finally{busy=false;$('entry-submit').disabled=false;renderControls();}
});
async function action(kind,data={}){
  if(busy||!state)return;busy=true;const current=epoch;renderControls();
  try {const next=await rpc(kind,{...data,version:state.version});if(current!==epoch)return;accept(next,true);if(kind==='clue')$('clue-word').value='';}
  catch(error){notice(error.message);}
  finally{busy=false;renderControls();scheduleRefresh();}
}
function addText(parent,tag,text,className){const el=document.createElement(tag);el.textContent=text;if(className)el.className=className;parent.append(el);return el;}
function render(){
  $('room-title').textContent=state.code;$('my-name').textContent=state.me.name;
  $('room-summary').textContent=(state.language==='custom'?'ชุดคำของเรา':state.language==='en'?'คำภาษาอังกฤษ':('คำภาษาไทย · '+state.wordCount+' คำ'))+' · '+(state.seconds?state.seconds+' วินาทีต่อช่วงใบ้ / ทาย':'ไม่จำกัดเวลา')+' · คุณคือ '+roleName(state.me.role)+(state.me.team==='spectator'?'':' '+teamName(state.me.team))+(state.me.host?' · เจ้าห้อง':'');
  const lobby=state.phase==='lobby';$('lobby').hidden=!lobby;$('match').hidden=lobby;
  $('player-count').textContent=state.members.length+' คน';
  const ready=['red','blue'].every(team=>['spymaster','operative'].every(role=>state.members.some(m=>m.team===team&&m.role===role)));
  $('lobby-hint').textContent=ready?(state.me.host?'ครบทีมแล้ว เริ่มเกมได้เลย':'ครบทีมแล้ว รอเจ้าห้องกดเริ่ม'): 'ชวนเพื่อนอย่างน้อย 4 คน แล้วเลือกคนใบ้และคนทายให้ครบทั้งสองทีม';
  $('start-game').hidden=!state.me.host;$('start-game').disabled=!ready||busy;
  document.querySelectorAll('[data-role]').forEach(button=>{button.setAttribute('aria-pressed',String(button.dataset.role===state.me.role&&button.dataset.team===state.me.team));const taken=button.dataset.role==='spymaster'&&state.members.some(m=>m.team===button.dataset.team&&m.role==='spymaster'&&m.id!==state.me.id);button.disabled=busy||taken;});
  const roster=$('roster');roster.replaceChildren();
  for(const team of ['red','blue','spectator']){const group=document.createElement('div');group.className='roster-group '+team;const people=state.members.filter(m=>m.team===team);addText(group,'h3',teamName(team)+' · '+people.length);if(!people.length)addText(group,'span','ยังไม่มีผู้เล่น','small muted');for(const member of people){const row=document.createElement('div');row.className='player';addText(row,'strong',member.name+(member.id===state.me.id?' (คุณ)':''));addText(row,'small',roleName(member.role)+(member.host?' · เจ้าห้อง':''));group.append(row);}roster.append(group);}
  const activity=$('activity');activity.replaceChildren();if(!state.logs.length)addText(activity,'li','รอเริ่มภารกิจ');for(const event of [...state.logs].reverse()){const li=addText(activity,'li',event.text);addText(li,'time',timeFormat.format(new Date(event.at)));}
  if(!lobby){
    const finished=state.phase==='finished';$('red-remaining').textContent=state.remaining.red;$('blue-remaining').textContent=state.remaining.blue;
    $('phase-label').textContent=finished?'MISSION COMPLETE':state.phase==='clue'?'รอคำใบ้':'กำลังทาย';$('turn-label').textContent=finished?teamName(state.winner)+' ชนะ':teamName(state.turn);$('turn-label').style.color=(finished?state.winner:state.turn)==='red'?'var(--red)':'var(--blue)';
    $('result').hidden=!finished;$('result-title').textContent=teamName(state.winner)+' ชนะ!';$('result-reason').textContent=state.reason||'';$('reset-game').hidden=!finished||!state.me.host;
    $('my-role').textContent=roleName(state.me.role)+(state.me.team==='spectator'?'':' · '+teamName(state.me.team));$('key-notice').textContent=finished?'เปิดเฉลยทั้งหมด':state.me.role==='spymaster'?'✦ มุมมองคนใบ้ · เห็นสีเฉลย':'⌕ เลือกไพ่เมื่อเป็นตาของทีมคุณ';
    const board=$('word-board');board.replaceChildren();state.board.forEach((card,index)=>{const button=document.createElement('button');button.type='button';button.className='word-card'+(card.color?' key-'+card.color:'')+(card.revealed?' revealed':'');button.textContent=card.word;button.dataset.index=index;const label=card.color?({red:'สายลับแดง',blue:'สายลับฟ้า',neutral:'ผู้บริสุทธิ์',assassin:'✕ ฆาตกร'})[card.color]:'ยังไม่เปิด';addText(button,'small',label);button.setAttribute('aria-label',card.word+' · '+label+(card.revealed?' · เปิดแล้ว':''));button.onclick=async()=>{if(await confirmAction('เปิดคำว่า “'+card.word+'” ?','การเปิดไพ่มีผลกับทั้งทีม และย้อนกลับไม่ได้','เปิดไพ่'))await action('guess',{index});};board.append(button);});
    const clue=state.clue;$('current-clue').replaceChildren();if(clue){addText($('current-clue'),'strong',clue.word+' · '+(clue.number==='unlimited'?'∞':clue.number));addText($('current-clue'),'span','ทายแล้ว '+state.guesses+' / '+(state.limit===25?'ไม่จำกัด':state.limit)+' ครั้ง');}else $('current-clue').textContent=finished?'ขอบคุณที่ร่วมภารกิจ':'รอคนใบ้'+teamName(state.turn)+' ส่งคำใบ้';
  }
  renderControls();
}
function renderControls(){
  if(!state)return;const mine=state.me.team===state.turn,spy=state.me.role==='spymaster',operative=state.me.role==='operative';
  $('clue-form').hidden=!(state.phase==='clue'&&mine&&spy);$('clue-form').querySelector('button').disabled=busy;
  $('end-turn').hidden=!(state.phase==='guess'&&mine&&operative);$('end-turn').disabled=busy||state.guesses<1;
  $('challenge-clue').hidden=!(state.phase==='guess'&&!mine&&spy&&state.guesses===0);$('forfeit').hidden=!(spy&&['clue','guess'].includes(state.phase));
  for(const id of ['reset-game','forfeit','challenge-clue'])$(id).disabled=busy;
  $('start-game').disabled=busy||!['red','blue'].every(team=>['spymaster','operative'].every(role=>state.members.some(m=>m.team===team&&m.role===role)));
  document.querySelectorAll('[data-role]').forEach(button=>{button.disabled=busy||button.dataset.role==='spymaster'&&state.members.some(m=>m.team===button.dataset.team&&m.role==='spymaster'&&m.id!==state.me.id);});
  document.querySelectorAll('.word-card').forEach((button,index)=>{button.disabled=busy||state.phase!=='guess'||!mine||!operative||state.board[index].revealed;});
}
function countdown(){
  if(!state||!state.deadline||state.phase==='finished'){$('countdown').textContent='';return;}
  const left=Math.max(0,Math.ceil((new Date(state.deadline).getTime()-Date.now()-clockOffset)/1000));$('countdown').textContent=left+' วินาที';
  if(!left&&expiredDeadline!==state.deadline){expiredDeadline=state.deadline;scheduleRefresh();}
}
async function confirmAction(title,description,button='ยืนยัน'){
  const dialog=$('confirm-dialog');if(dialog.open)return false;$('confirm-title').textContent=title;$('confirm-description').textContent=description;$('confirm-action').textContent=button;dialog.returnValue='cancel';dialog.showModal();
  return new Promise(resolve=>dialog.addEventListener('close',()=>resolve(dialog.returnValue==='confirm'),{once:true}));
}
document.querySelectorAll('[data-role]').forEach(button=>button.onclick=()=>void action('role',{team:button.dataset.team,role:button.dataset.role}));
$('start-game').onclick=()=>void action('start');$('end-turn').onclick=()=>void action('end');$('reset-game').onclick=()=>void action('reset');
$('clue-form').addEventListener('submit',event=>{event.preventDefault();void action('clue',{word:$('clue-word').value.trim(),number:$('clue-number').value});});
$('challenge-clue').onclick=async()=>{if(await confirmAction('ทักท้วงคำใบ้ผิดกติกา?','ตกลงกับเพื่อนก่อนใช้ อีกทีมจะจบเทิร์น และทีมคุณได้เปิดสายลับฟรี 1 ใบ','ทักท้วง'))await action('challenge');};
$('forfeit').onclick=async()=>{if(await confirmAction('ยอมแพ้แทน'+teamName(state.me.team)+' ?','เกมจะจบทันทีและอีกทีมเป็นผู้ชนะ','ยอมแพ้'))await action('forfeit');};
$('share-room').onclick=async()=>{try{await navigator.clipboard.writeText(new URL('?room='+roomCode,location.href).href);notice('คัดลอกลิงก์แล้ว ส่งให้เพื่อนเข้าห้องเดียวกันได้เลย');}catch{notice('รหัสห้อง: '+roomCode+' — คัดลอก URL จากแถบที่อยู่เพื่อชวนเพื่อน');}};
$('leave-room').onclick=async()=>{
  if(busy)return;if(!await confirmAction('ออกจากห้องนี้?','ถ้าเกมกำลังเล่น ที่นั่งและบทบาทของคุณจะเก็บไว้ กลับมาด้วยลิงก์เดิมและเบราว์เซอร์เดิมได้','ออกจากห้อง'))return;
  try{await rpc('leave');}catch(error){notice('ออกจากหน้าห้องแล้ว สถานะออนไลน์อาจยังคงอยู่');}
  epoch++;if(channel){void db.removeChannel(channel);channel=null;}state=null;roomCode='';save('jetacode-room',null);history.replaceState(null,'',location.pathname);$('room').hidden=true;$('entrance').hidden=false;setMode('create');
};
setInterval(()=>{if(!document.hidden)void refresh();},5000);setInterval(countdown,500);
window.addEventListener('online',()=>{notice('เชื่อมต่อเครือข่ายแล้ว กำลังซิงก์ห้อง');void refresh();});window.addEventListener('offline',()=>connection('ออฟไลน์ · รอเชื่อมต่อใหม่',true));document.addEventListener('visibilitychange',()=>{if(!document.hidden)void refresh();});
let initialCode=new URL(location.href).searchParams.get('room')?.toUpperCase();
if(!initialCode){try{initialCode=storage.getItem('jetacode-room');}catch{}}
if(initialCode&&/^[A-F0-9]{10}$/.test(initialCode)){
  $('room-code').value=initialCode;setMode('join');
  try{const next=await rpc('state',{},initialCode);await enter(next);}catch{notice('ใส่ชื่อเล่นเพื่อเข้าร่วมห้อง '+initialCode);}
}
