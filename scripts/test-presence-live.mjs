import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createClient} from '@supabase/supabase-js';
import {presencePayload,onlinePeople} from '../dist/presence-core.mjs';
const config={window:{}};vm.runInNewContext(fs.readFileSync('dist/config.js','utf8'),config);
const {supabaseUrl,supabasePublishableKey}=config.window.JETABAIT_CONFIG;
const clients=[0,1].map(()=>createClient(supabaseUrl,supabasePublishableKey,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}}));
const topic='presence-check-'+crypto.randomUUID();
const rooms=clients.map((c,i)=>c.channel(topic,{config:{presence:{key:'probe-'+i}}}));
const waitFor=async(fn)=>{const until=Date.now()+15000;while(!fn()){if(Date.now()>until)throw Error('Presence sync timeout');await new Promise(r=>setTimeout(r,100))}};
try {
  await Promise.all(rooms.map(room=>new Promise((resolve,reject)=>{room.on('presence',{event:'sync'},()=>{}).subscribe(status=>{if(status==='SUBSCRIBED')resolve();else if(['CHANNEL_ERROR','TIMED_OUT'].includes(status))reject(Error(status))})})));
  const guest=await presencePayload(null,'a'.repeat(24));
  const member=await presencePayload({id:'test-only-identity',user_metadata:{display_name:'Presence test'}},'b'.repeat(24));
  assert.equal(await rooms[0].track(guest),'ok');assert.equal(await rooms[1].track(member),'ok');
  await waitFor(()=>onlinePeople(rooms[0].presenceState()).length===2&&onlinePeople(rooms[1].presenceState()).length===2);
  assert.equal(await rooms[1].untrack(),'ok');await waitFor(()=>onlinePeople(rooms[0].presenceState()).length===1);
  console.log('PASS live Supabase: two independent public clients subscribe, sync guest/member payloads and remove departed visitor; isolated test channel only');
} finally {await Promise.all(clients.map(c=>c.removeAllChannels()))}
