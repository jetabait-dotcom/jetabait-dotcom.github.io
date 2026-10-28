const vm = require('node:vm'), fs = require('node:fs'), assert = require('node:assert/strict');
const nodes = new Map(), pending = new Map();
function node() { return { value:'', innerHTML:'', disabled:false, classList:{toggle(){}}, setAttribute(){}, removeAttribute(){}, addEventListener(){}, querySelectorAll(){return []}, scrollIntoView(){} }; }
function $(id) { if(!nodes.has(id))nodes.set(id,node()); return nodes.get(id); }
let scheduled;
const ctx = vm.createContext({ $, console, URLSearchParams, AbortController, Map, Date, setTimeout:f=>(scheduled=f,1), clearTimeout:()=>scheduled=null, esc:s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'), safeURL:s=>s, items:[], results:[], searchId:0, edit(){} });
vm.runInContext(fs.readFileSync('dist/search.js','utf8'),ctx);
const run=s=>vm.runInContext(s,ctx);
assert.equal(run("highlightTitle('ONE PIECE: The Movie', 'one piece')"),'<mark>ONE PIECE</mark>: The Movie');
assert.equal(run("highlightTitle('<img> Naruto', 'Naruto')"),'&lt;img&gt; <mark>Naruto</mark>');
ctx.capture=(q)=>new Promise(resolve=>pending.set(q,resolve));run('lookupTitles=capture;initSearch()');
$('search-kind').value='anime';$('query').value='old';$('query').oninput();assert.ok(scheduled,'typing schedules lookup');
const first=scheduled();assert.equal($('search-button').disabled,true);
$('query').value='Naruto';$('query').oninput();const second=scheduled();
pending.get('Naruto')([{id:'mal-20',title:'Naruto',kind:'anime',provider:'AniList',source:'https://anilist.co/anime/20'}]);
(async()=>{await second;assert.match($('results').innerHTML,/<mark>Naruto<\/mark>/);pending.get('old')([{id:'old',title:'old',kind:'anime'}]);await first;assert.match($('results').innerHTML,/<mark>Naruto<\/mark>/,'late old response cannot replace current results');assert.equal($('search-button').disabled,false);$('query').value='N';$('query').oninput();assert.match($('results').innerHTML,/2 ตัวอักษร/);assert.equal(ctx.results.length,0);console.log('PASS: autocomplete debounce, highlighting, escaped titles, stale response protection, short query reset');})().catch(e=>{console.error(e);process.exitCode=1});
