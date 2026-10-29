import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {pathToFileURL} from 'node:url';import {transform} from 'esbuild';
const rows=new Map();let handler;const originalFetch=globalThis.fetch;
globalThis.Deno={env:{get:name=>name==='SUPABASE_URL'?'https://duel-database.test':name==='SUPABASE_SERVICE_ROLE_KEY'?'server-test-key':undefined},serve:fn=>{handler=fn}};
globalThis.fetch=async(input,options={})=>{
 const url=new URL(input);if(url.origin!=='https://duel-database.test')return originalFetch(input,options);
 const params=url.searchParams,method=options.method||'GET';
 if(method==='POST'){const row={...JSON.parse(options.body),version:1,updated_at:new Date().toISOString()};rows.set(row.code,row);return Response.json([structuredClone(row)])}
 let found=[...rows.values()].filter(row=>[...params].every(([key,v])=>['select','limit'].includes(key)||v.startsWith('eq.')?['select','limit'].includes(key)||String(row[key])===v.slice(3):v==='is.null'?row[key]==null:v.startsWith('gte.')?row[key]>=v.slice(4):true));
 if(method==='PATCH'){const patch=JSON.parse(options.body);for(const row of found)Object.assign(row,patch)}
 return Response.json(structuredClone(found));
};
const input=fs.readFileSync('server/duel-edge.ts','utf8').replaceAll("'./duel-engine.mjs'",JSON.stringify(pathToFileURL(path.resolve('server/duel-engine.mjs')).href));
const built=await transform(input,{loader:'ts',format:'esm',target:'es2022'});const file=path.join(os.tmpdir(),'jetabait-duel-edge-'+process.pid+'.mjs');fs.writeFileSync(file,built.code);await import(pathToFileURL(file));fs.unlinkSync(file);
export {rows};export const realFetch=originalFetch;export const serve=req=>handler(req);
export function testJwt(user='player-a'){return 'test.'+Buffer.from(JSON.stringify({role:'authenticated',sub:user})).toString('base64url')+'.gateway-verified-in-tests'}
export async function call(token,user,body){const res=await serve(new Request('https://game.test/functions/v1/duel-game',{method:'POST',headers:{'x-duel-token':token,'Authorization':'Bearer '+testJwt(user)},body:JSON.stringify(body)}));return {status:res.status,body:await res.json()}}
