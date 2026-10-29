import assert from 'node:assert/strict';import {call,serve,rows} from './duel-test-runtime.mjs';
const a='a'.repeat(64),b='b'.repeat(64),c='c'.repeat(64);
let result=await call(a,'A',{action:'create',data:{name:'Alice'}});assert.equal(result.status,200);const code=result.body.code;
assert.equal((await call(a,'B',{action:'state',code})).status,403,'capability must be bound to its signed-in Auth user');
const joined=await call(b,'B',{action:'join',code,data:{name:'Bob'}});assert.equal(joined.status,200);assert.equal(joined.body.seat,1);
assert.equal((await call(c,'C',{action:'join',code,data:{name:'Third'}})).status,409);
assert.equal((await call(c,'C',{action:'state',code})).status,403);
const invalid=await serve(new Request('https://game.test',{method:'POST',headers:{'x-duel-token':a},body:'{}'}));assert.equal(invalid.status,401);
let state=joined.body;let moves=0;
while(state.state.phase!=='finished'&&moves++<180){const s=state.state;const seat=s.pending[0]?.seat??(s.phase==='starter'?s.chooser:s.turn);let action,data={};
const current=await call(seat?b:a,seat?'B':'A',{action:'state',code});state=current.body;const v=state.state;
if(v.phase==='draft'){action='draft';data.id=v.draftPool[0]}
else if(v.phase==='starter'){action='starter';data.seat=seat}
else if(v.pending.length){action='choose';data.id=v.pending[0].options[0]}
else {const slot=v.board.find(x=>x.accessible&&!x.taken);action=slot.price.total<=v.players[seat].coins&&moves%3?'build':'discard';data.index=slot.index}
const oldVersion=state.version;const next=await call(seat?b:a,seat?'B':'A',{action,code,data,version:oldVersion});assert.equal(next.status,200,JSON.stringify(next));state=next.body;
if(moves===1)assert.equal((await call(seat?b:a,seat?'B':'A',{action,code,data,version:oldVersion})).status,409,'stale double click rejected');
}
assert.equal(state.state.phase,'finished');const winner=state.state.winner;assert.equal((await call(a,'A',{action:'resign',code,version:state.version})).status,409,'finished winner cannot be changed');assert.equal(rows.get(code).state.winner,winner);
let next=await call(a,'A',{action:'rematch',code,version:state.version});assert.equal(next.body.state.phase,'finished');next=await call(b,'B',{action:'rematch',code,version:next.body.version});assert.equal(next.body.state.phase,'draft');
console.log('PASS: actual Edge handler with in-memory DB — create/join, two-player limit, Auth-bound tokens, private reads, stale updates, complete game, immutable result and mutual rematch');
