import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {pathToFileURL} from 'node:url';import {transform} from 'esbuild';
export const rows=new Map();let handler;const originalFetch=globalThis.fetch;
globalThis.Deno={env:{get:name=>name==='SUPABASE_URL'?'https://spy-database.test':name==='SUPABASE_SERVICE_ROLE_KEY'?'server-test-key':undefined},serve:fn=>{handler=fn}};
globalThis.fetch=async(input,options={})=>{
 const url=new URL(input);if(url.origin!=='https://spy-database.test')return originalFetch(input,options);const params=url.searchParams,method=options.method||'GET';
 if(method==='POST'){const row={...JSON.parse(options.body),version:1,created_at:new Date().toISOString(),updated_at:new Date().toISOString()};rows.set(row.code,row);return Response.json([structuredClone(row)])}
 const found=[...rows.values()].filter(row=>[...params].every(([key,v])=>['select','limit'].includes(key)?true:v.startsWith('eq.')?String(row[key])===v.slice(3):v.startsWith('gte.')?row[key]>=v.slice(4):true));
 if(method==='PATCH'){const patch=JSON.parse(options.body);for(const row of found)Object.assign(row,patch)}return Response.json(structuredClone(found));
};
const input=fs.readFileSync('server/spyfall-edge.ts','utf8').replaceAll("'./spyfall-engine.mjs'",JSON.stringify(pathToFileURL(path.resolve('server/spyfall-engine.mjs')).href));
const built=await transform(input,{loader:'ts',format:'esm',target:'es2022'});const file=path.join(os.tmpdir(),'jetabait-spy-edge-'+process.pid+'.mjs');fs.writeFileSync(file,built.code);await import(pathToFileURL(file));fs.unlinkSync(file);
export const serve=req=>handler(req);
export function jwt(user){return 'test.'+Buffer.from(JSON.stringify({role:'authenticated',sub:user})).toString('base64url')+'.verified-by-platform-in-production'}
export async function call(user,body){const res=await serve(new Request('https://game.test/functions/v1/spyfall-game',{method:'POST',headers:{Authorization:'Bearer '+jwt(user)},body:JSON.stringify(body)}));return {status:res.status,body:await res.json()}}
