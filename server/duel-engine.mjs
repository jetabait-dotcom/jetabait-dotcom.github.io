import { CARDS, WONDERS, PROGRESS, LAYOUTS } from './duel-data.mjs';
const dict = list => Object.fromEntries(list.map(x=>[x.id,x]));
export const cards=dict(CARDS), wonders=dict(WONDERS), progress=dict(PROGRESS);
const resources=['wood','stone','clay','glass','papyrus'];
const clone=x=>structuredClone(x);
const must=(condition,message)=>{if(!condition)throw Error(message)};
export function shuffle(list){const a=[...list];for(let i=a.length-1;i>0;i--){const n=new Uint32Array(1);crypto.getRandomValues(n);const j=Math.floor(n[0]/4294967296*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
const count=(p,color)=>p.cards.filter(id=>cards[id].color===color).length;
const has=(p,id)=>p.progress.includes(id);
const cityItems=p=>[...p.cards.map(id=>cards[id]),...p.built.map(id=>wonders[id])];
const production=p=>cityItems(p).reduce((n,c)=>{for(const r of resources)n[r]+=(c.produce?.[r]||0);return n},Object.fromEntries(resources.map(r=>[r,0])));
const enemyProduction=p=>p.cards.map(id=>cards[id]).filter(c=>['brown','grey'].includes(c.color)).reduce((n,c)=>{for(const r of resources)n[r]+=(c.produce?.[r]||0);return n},Object.fromEntries(resources.map(r=>[r,0])));
export function price(s,seat,item,isWonder=false){
 const p=s.players[seat],other=s.players[1-seat];
 const linked=!isWonder&&item.chainFrom&&p.cards.includes(item.chainFrom);
 if(linked)return {total:0,trade:0,linked:true};
 const own=production(p),enemy=enemyProduction(other),discount=new Set(cityItems(p).flatMap(c=>c.discount||[]));
 const deficit=resources.map(r=>Math.max(0,(item.cost?.[r]||0)-own[r]));
 const prices=resources.map(r=>discount.has(r)?1:2+enemy[r]);
 const wilds=cityItems(p).filter(c=>c.wild?.length).map(c=>c.wild);
 if(has(p,isWonder?'architecture':item.color==='blue'?'masonry':'-'))wilds.push(resources,resources);
 const memo=new Map();
 function cheapest(i,d){const key=i+':'+d.join();if(memo.has(key))return memo.get(key);if(i===wilds.length)return d.reduce((n,v,j)=>n+v*prices[j],0);let best=cheapest(i+1,d);for(const r of wilds[i]){const j=resources.indexOf(r);if(j>=0&&d[j]){const next=[...d];next[j]--;best=Math.min(best,cheapest(i+1,next))}}memo.set(key,best);return best}
 const trade=cheapest(0,deficit);return {total:trade+(item.cost?.coins||0),trade,linked:false};
}
function pay(s,i,item,isWonder){const bill=price(s,i,item,isWonder);must(s.players[i].coins>=bill.total,'เหรียญไม่พอสำหรับการก่อสร้าง');s.players[i].coins-=bill.total;if(has(s.players[1-i],'economy'))s.players[1-i].coins+=bill.trade;if(bill.linked&&has(s.players[i],'urbanism'))s.players[i].coins+=4;return bill}
function science(p){const symbols=p.cards.map(id=>cards[id].science).filter(Boolean);if(has(p,'law'))symbols.push('law');return symbols}
function win(s,i,reason){s.phase='finished';s.winner=i;s.reason=reason;s.pending=[];s.scores=s.players.map((_,j)=>score(s,j));}
function checkScience(s,i){if(new Set(science(s.players[i])).size>=6)win(s,i,'science')}
function military(s,i,n){if(!n)return;const sign=i===0?1:-1;s.military=Math.max(-9,Math.min(9,s.military+n*sign));for(const threshold of [3,6]){const key=sign+':'+threshold;if(sign*s.military>=threshold&&!s.looted.includes(key)){s.looted.push(key);s.players[1-i].coins=Math.max(0,s.players[1-i].coins-(threshold===3?2:5));}}if(Math.abs(s.military)===9)win(s,i,'military')}
function guildValue(s,type){const max=fn=>Math.max(...s.players.map(fn));if(type==='wonders')return max(p=>p.built.length)*2;if(type==='coins')return max(p=>Math.floor(p.coins/3));if(type==='brownGrey')return max(p=>count(p,'brown')+count(p,'grey'));return max(p=>count(p,type))}
export function score(s,i){const p=s.players[i];const buildings=p.cards.reduce((n,id)=>n+(cards[id].points||0)+(cards[id].guild?guildValue(s,cards[id].guild):0),0);const blue=p.cards.filter(id=>cards[id].color==='blue').reduce((n,id)=>n+(cards[id].points||0),0);const wonder=p.built.reduce((n,id)=>n+(wonders[id].points||0),0);const tokens=p.progress.reduce((n,id)=>n+(progress[id].points||0),0)+(has(p,'mathematics')?p.progress.length*3:0);const distance=(i===0?1:-1)*s.military;const army=distance>=6?10:distance>=3?5:distance>=1?2:0;return {buildings,wonders:wonder,progress:tokens,coins:Math.floor(p.coins/3),military:army,blue,total:buildings+wonder+tokens+Math.floor(p.coins/3)+army}}
function addProgress(s,i,id){must(!s.players[i].progress.includes(id),'มีเหรียญความก้าวหน้านี้แล้ว');s.players[i].progress.push(id);s.players[i].coins+=progress[id].coins||0;checkScience(s,i)}
function apply(s,i,item,isWonder=false){
 const p=s.players[i];p.coins+=item.coins||0;
 for(const [color,rate] of Object.entries(item.coinsPer||{}))p.coins+=count(p,color)*rate;
 p.coins+=(item.coinsPerWonder||0)*p.built.length;
 if(item.guild&&!['coins','wonders'].includes(item.guild))p.coins+=guildValue(s,item.guild);
 s.players[1-i].coins=Math.max(0,s.players[1-i].coins-(item.opponentLoss||0));
 military(s,i,(item.shields||0)+(!isWonder&&item.color==='red'&&has(p,'strategy')?1:0));
 if(s.phase==='finished')return;
 if(item.science){checkScience(s,i);if(s.phase==='finished')return;if(science(p).filter(x=>x===item.science).length===2&&s.availableProgress.length)s.pending.push({type:'progress',seat:i,options:[...s.availableProgress]})}
 if(item.replay||(isWonder&&has(p,'theology')))s.replay=true;
 if(item.destroy){const options=s.players[1-i].cards.filter(id=>cards[id].color===item.destroy);if(options.length)s.pending.push({type:'destroy',seat:i,options})}
 if(item.mausoleum&&s.discard.length)s.pending.push({type:'mausoleum',seat:i,options:[...s.discard]});
 if(item.library){const options=shuffle(s.boxProgress).slice(0,3);if(options.length)s.pending.push({type:'library',seat:i,options})}
}
function setupAge(s){const layout=LAYOUTS[s.age];must(layout?.length===20,'รูปแบบกระดานต้องมี 20 ใบ');s.board=layout.map((v,i)=>({...v,id:s.decks[s.age][i],taken:false}));}
function finishTurn(s){
 if(s.phase==='finished'||s.pending.length)return;
 for(const slot of s.board)if(!slot.taken&&slot.covers.every(i=>s.board[i].taken))slot.faceUp=true;
 if(s.board.every(x=>x.taken)){
  if(s.age===3){const a=score(s,0),b=score(s,1);win(s,a.total>b.total?0:a.total<b.total?1:a.blue>b.blue?0:a.blue<b.blue?1:null,'civilian');return}
  s.age++;setupAge(s);s.phase='starter';s.chooser=s.military>0?1:s.military<0?0:s.turn;s.replay=false;return;
 }
 if(!s.replay)s.turn=1-s.turn;s.replay=false;
}
export function newGame(){
 const first=shuffle([0,1])[0],tokens=shuffle(PROGRESS.map(t=>t.id)),ws=shuffle(WONDERS.map(w=>w.id)).slice(0,8);
 const decks={};for(let age=1;age<=3;age++){let ids=shuffle(CARDS.filter(c=>c.age===age&&c.color!=='purple').map(c=>c.id)).slice(0,-3);if(age===3)ids.push(...shuffle(CARDS.filter(c=>c.color==='purple').map(c=>c.id)).slice(0,3));decks[age]=shuffle(ids);must(ids.length===20,'จำนวนไพ่ในยุคไม่ถูกต้อง')}
 return {phase:'draft',age:1,turn:first,first,draftIndex:0,draftPool:ws.slice(0,4),draftSecond:ws.slice(4),players:[0,1].map(()=>({coins:7,cards:[],wonders:[],built:[],progress:[]})),availableProgress:tokens.slice(0,5),boxProgress:tokens.slice(5),decks,board:[],military:0,looted:[],discard:[],pending:[],replay:false,log:[],winner:null};
}
export function step(input,i,action,data={}){
 const s=clone(input);must(i===0||i===1,'ยังไม่ได้เข้าร่วมเกม');must(s.phase!=='finished','เกมจบแล้ว');
 if(s.phase==='draft'){
  must(action==='draft'&&s.turn===i,'รออีกฝ่ายเลือก Wonder');must(s.draftPool.includes(data.id),'เลือก Wonder ที่มีอยู่');s.players[i].wonders.push(data.id);s.draftPool=s.draftPool.filter(id=>id!==data.id);s.draftIndex++;
  if(s.draftIndex===4)s.draftPool=s.draftSecond;
  if(s.draftIndex===8){s.phase='playing';s.turn=s.first;setupAge(s)}else s.turn=[0,1,1,0,1,0,0,1][s.draftIndex]===0?s.first:1-s.first;
  return s;
 }
 if(s.phase==='starter'){must(action==='starter'&&s.chooser===i,'รอฝ่ายที่อ่อนแอกว่าเลือกผู้เริ่ม');must(data.seat===0||data.seat===1,'เลือกผู้เริ่ม');s.turn=data.seat;s.phase='playing';return s}
 if(s.pending.length){
  const pending=s.pending[0];must(action==='choose'&&pending.seat===i,'ต้องเลือกผลพิเศษก่อน');must(pending.options.includes(data.id),'ตัวเลือกไม่ถูกต้อง');s.pending.shift();
  if(pending.type==='progress'){s.availableProgress=s.availableProgress.filter(id=>id!==data.id);addProgress(s,i,data.id)}
  if(pending.type==='library'){s.boxProgress=s.boxProgress.filter(id=>id!==data.id);addProgress(s,i,data.id)}
  if(pending.type==='destroy'){s.players[1-i].cards=s.players[1-i].cards.filter(id=>id!==data.id);s.discard.push(data.id)}
  if(pending.type==='mausoleum'){s.discard=s.discard.filter(id=>id!==data.id);s.players[i].cards.push(data.id);apply(s,i,cards[data.id]);}
  finishTurn(s);return s;
 }
 must(s.turn===i,'ยังไม่ถึงตาของคุณ');must(['build','discard','wonder'].includes(action),'คำสั่งไม่ถูกต้อง');const index=data.index;
 must(Number.isInteger(index)&&index>=0&&index<20,'เลือกไพ่ก่อน');const slot=s.board[index];must(!slot.taken&&slot.covers.every(j=>s.board[j].taken),'ไพ่ยังถูกทับอยู่');const card=cards[slot.id],p=s.players[i];
 if(action==='build'){must(!p.cards.includes(slot.id),'มีอาคารนี้แล้ว');pay(s,i,card,false);p.cards.push(slot.id)}
 if(action==='wonder'){must(p.wonders.includes(data.wonder)&&!p.built.includes(data.wonder),'เลือก Wonder ที่ยังไม่สร้าง');must(s.players.reduce((n,p)=>n+p.built.length,0)<7,'สร้าง Wonder ได้รวมเพียง 7 แห่ง');pay(s,i,wonders[data.wonder],true);p.built.push(data.wonder)}
 if(action==='discard'){s.discard.push(slot.id);p.coins+=2+count(p,'yellow')}
 slot.taken=true;s.log.unshift({seat:i,action,name:action==='wonder'?wonders[data.wonder].name:card.name,age:s.age});s.log=s.log.slice(0,12);
 if(action==='build')apply(s,i,card);if(action==='wonder')apply(s,i,wonders[data.wonder],true);finishTurn(s);return s;
}
export function view(s,seat,names){
 const result=clone(s);delete result.decks;delete result.draftSecond;delete result.boxProgress;
 result.players=result.players.map((p,i)=>({...p,name:names[i]||'รอเพื่อน',score:s.phase==='finished'?s.scores[i]:null}));
 result.board=result.board.map((slot,index)=>{if(slot.taken)return {...slot,index,id:null,accessible:false,price:null};const accessible=slot.covers.every(j=>s.board[j].taken);return {...slot,index,id:slot.faceUp?slot.id:null,accessible,price:slot.faceUp?price(s,seat,cards[slot.id]):null}});
 if(result.phase==='draft')result.pending=[];
 result.seat=seat;result.wonderPrices=Object.fromEntries(s.players[seat].wonders.map(id=>[id,price(s,seat,wonders[id],true)]));
 // Return only public choices; unchosen Great Library tokens stay secret until its effect resolves.
 if(result.pending[0]?.seat!==seat)result.pending=result.pending.map(p=>({...p,options:[]}));
 return result;
}
