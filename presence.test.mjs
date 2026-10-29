import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {visitorId, presencePayload, onlinePeople, displayName} from './dist/presence-core.mjs';
const browser='a'.repeat(24),other='b'.repeat(24);
const guest=await presencePayload(null,browser);
const member=await presencePayload({id:'private-auth-id',email:'private@example.test',user_metadata:{display_name:'<img src=x onerror=alert(1)>'}},browser);
assert.equal(guest.name,'ผู้เยี่ยมชม AAAAAA');
assert.ok(!JSON.stringify(member).includes('private'));
assert.equal(displayName(' \u0000hello\n '),'hello');
assert.equal(displayName('x'.repeat(100)).length,40);
assert.equal(visitorId({getItem:()=>browser}),browser);
assert.match(visitorId({getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}}),/^[a-f0-9]{24}$/);
assert.equal(onlinePeople({one:[member],two:[member],three:[guest]}).length,1,'deduplicate tabs and suppress same-browser guest');
assert.equal(onlinePeople({one:[member],two:[await presencePayload(null,other)]}).length,2);
assert.equal(onlinePeople({bad:[null,{}, {kind:'member',browser,identity:'fake'}]}).length,0);
assert.deepEqual(onlinePeople({}),[],'leave removes all names');

// Exercise the actual browser module against a deterministic channel and DOM.
const nodes=new Map();
const element=()=>({children:[],dataset:{},textContent:'',append(...items){this.children.push(...items)},replaceChildren(...items){this.children=items},setAttribute(){}});
for(const id of ['online-panel','online-people','online-count','online-status'])nodes.set(id,element());
let user=null,authChanged,removed=0,pendingRetry;
const events={},channels=[];
const client={channel(){const c={payload:null,states:{},on(_type,_filter,fn){this.sync=fn;return this},subscribe(fn){this.status=fn;return this},presenceState(){return this.states},async track(p){this.payload=p;if(this.fail)return 'error';this.states={self:[p]};this.sync();return 'ok'}};channels.push(c);return c},async removeChannel(){removed++}};
const sandbox={crypto,TextEncoder,JSON,Uint8Array,navigator:{onLine:true},localStorage:{getItem:()=>browser},
  document:{getElementById:id=>nodes.get(id),createElement:element},
  setTimeout:fn=>{pendingRetry=fn;return 1},clearTimeout(){pendingRetry=null},
  sdk:{createClient:()=>client},core:{visitorId,presencePayload,onlinePeople,PRESENCE_TOPIC:'test'},
  window:{JETABAIT_CONFIG:{supabaseUrl:'https://test.supabase.co',supabasePublishableKey:'sb_publishable_test'},JetaAccount:{ready:Promise.resolve(),state:()=>({user}),subscribe:fn=>authChanged=fn},addEventListener:(type,fn)=>events[type]=fn}};
const source=fs.readFileSync('dist/presence.js','utf8').replace("import { createClient } from './vendor/supabase.js';",'const {createClient}=sdk;').replace("import { PRESENCE_TOPIC, visitorId, presencePayload, onlinePeople } from './presence-core.mjs';",'const {PRESENCE_TOPIC,visitorId,presencePayload,onlinePeople}=core;');
await vm.runInNewContext('(async()=>{'+source+'})()',sandbox);
const flush=()=>new Promise(resolve=>setImmediate(resolve));
channels[0].status('SUBSCRIBED');await flush();
assert.equal(nodes.get('online-count').textContent,'1');
assert.equal(channels[0].payload.kind,'guest');
user={id:'private-auth-id',user_metadata:{display_name:'<script>unsafe</script>'}};
authChanged();await new Promise(r=>setTimeout(r,20));
assert.equal(channels[0].payload.kind,'member');
assert.equal(nodes.get('online-people').children[0].children[1].children[0].textContent,'<script>unsafe</script>','render as text');
events.offline();assert.equal(nodes.get('online-count').textContent,'—');assert.equal(nodes.get('online-people').children.length,0);
events.online();await flush();assert.equal(nodes.get('online-count').textContent,'1');
channels[0].fail=true;events.online();await flush();assert.ok(pendingRetry);channels[0].fail=false;pendingRetry();await flush();assert.equal(nodes.get('online-count').textContent,'1');
events.pagehide();assert.equal(removed,1);channels[0].status('SUBSCRIBED');events.pageshow();assert.equal(channels.length,2);
channels[1].status('SUBSCRIBED');await flush();assert.equal(nodes.get('online-count').textContent,'1');
user=null;authChanged();await flush();assert.equal(channels[1].payload.kind,'guest');
console.log('PASS presence: guests/members, no raw identifiers/email, text safety, deduplication, joins/leaves, login/logout, offline/recovery, failed track retry, pagehide/BFCache return');
