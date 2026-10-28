const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const elements=new Map();function element(){return {value:'',style:{},dataset:{},classList:{toggle(){}},querySelector(){return element()},querySelectorAll(){return []},showModal(){},close(){},focus(){},click(){},addEventListener(){},setAttribute(){},removeAttribute(){}}}const get=id=>{if(!elements.has(id))elements.set(id,element());return elements.get(id)};get('sort').value='recent';let stored=null;const context=vm.createContext({document:{getElementById:get,querySelectorAll:()=>[]},localStorage:{getItem:()=>stored,setItem:(k,v)=>stored=v},crypto:require('node:crypto').webcrypto,URL,Blob,setTimeout,clearTimeout,console,window:{},confirm:()=>true,Map,Date,AbortSignal});vm.runInContext(fs.readFileSync('dist/search.js','utf8'),context);vm.runInContext(fs.readFileSync('dist/app.js','utf8'),context);const run=s=>vm.runInContext(s,context);
run("edit({title:'Frieren',kind:'anime',episodes:28})");get('status').value='watching';get('progress').value='5';get('rating').value='9.5';get('notes').value='ชอบมาก';get('edit-form').onsubmit({preventDefault(){}});assert.equal(JSON.parse(stored)[0].title,'Frieren');assert.equal(JSON.parse(stored)[0].progress,5);assert.equal(get('count').textContent,1);
run('edit(items[0])');get('progress').value='29';get('edit-form').onsubmit({preventDefault(){}});assert.equal(JSON.parse(stored)[0].progress,5,'invalid progress must not save');
get('progress').value='28';get('status').value='completed';get('edit-form').onsubmit({preventDefault(){}});assert.equal(JSON.parse(stored).length,1,'editing must not duplicate');assert.equal(JSON.parse(stored)[0].status,'completed');
get('filter').value='not here';run('render()');assert.equal(get('count').textContent,0);assert.equal(run("safeURL('javascript:alert(1)')"),'');assert.equal(run("valid({id:'bad',title:'x',kind:'anime',status:'planned',progress:-1})"),false);console.log('PASS: add, persistence, edit, progress validation, filters, import validation, URL safety');
const exportCalls = [];
context.XLSX = context.window.XLSX = { utils: { json_to_sheet(rows) { exportCalls.push(rows); return {}; }, book_new() { return {}; }, book_append_sheet() {} }, writeFile(_book, name) { exportCalls.push(name); } };
(async () => {
  await get('export').onclick();
  assert.equal(exportCalls[0][0]['ชื่อเรื่อง'], 'Frieren');
  assert.equal(exportCalls[0][0]['สถานะ'], 'ดูจบแล้ว');
  assert.equal(exportCalls[1], 'scene-library.xlsx');
  assert.equal(get('export').disabled, false);
  console.log('PASS: lazy Excel export preserves library fields and restores the button');
})().catch(error => { console.error(error); process.exitCode = 1; });
