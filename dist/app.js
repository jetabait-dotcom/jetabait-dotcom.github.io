const $=id=>document.getElementById(id), KEY='scene-library-v1';
const statuses={planned:'อยากดู',watching:'กำลังดู',completed:'ดูจบแล้ว',paused:'พักไว้ก่อน'};
let items=[],kindFilter='all',statusFilter='all',draft={},searchId=0,results=[],accountStore=null,syncingLibrary=false;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeURL=s=>{try{const u=new URL(s);return u.protocol==='https:'?u.href:''}catch{return ''}};
function toast(s){$('toast').textContent=s;$('toast').style.display='block';clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').style.display='none',4000)}
try{if(!window.JETABAIT_CONFIG?.googleEnabled){const raw=localStorage.getItem(KEY);if(raw){const parsed=JSON.parse(raw);if(!Array.isArray(parsed)||!parsed.every(valid))throw Error();items=parsed}}}catch{toast('อ่านคลังไม่สำเร็จ ข้อมูลเดิมยังอยู่ในเบราว์เซอร์ กรุณาสำรองก่อนแก้ไข');}
function valid(x){return x&&typeof x.id==='string'&&typeof x.title==='string'&&x.title.trim()&&['anime','movie'].includes(x.kind)&&Object.hasOwn(statuses,x.status)&&(!x.rating&&x.rating!==0||Number.isFinite(x.rating)&&x.rating>=0&&x.rating<=10)&&Number.isInteger(x.progress)&&x.progress>=0&&(!x.episodes||Number.isInteger(x.episodes)&&x.episodes>0)&&(!x.episodes||x.progress<=x.episodes)&&(!x.notes||typeof x.notes==='string')}
function save(next){try{if(accountStore)accountStore.commit(next);else localStorage.setItem(KEY,JSON.stringify(next));items=next;render();if(accountStore)void syncLibrary();return true}catch{toast('บันทึกไม่สำเร็จ พื้นที่อาจเต็มหรือเบราว์เซอร์ปิดการจัดเก็บ');return false}}
function render(){for(const key of ['completed','watching','planned'])$(key).innerHTML=`${items.filter(x=>x.status===key).length} <small>เรื่อง</small>`;$('total').innerHTML=`${items.length} <small>เรื่อง</small>`;let view=items.filter(x=>(kindFilter==='all'||x.kind===kindFilter)&&(statusFilter==='all'||x.status===statusFilter)&&x.title.toLowerCase().includes($('filter').value.trim().toLowerCase()));view.sort($('sort').value==='title'?(a,b)=>a.title.localeCompare(b.title,'th'):$('sort').value==='rating'?(a,b)=>(b.rating??-1)-(a.rating??-1):(a,b)=>(b.added||'').localeCompare(a.added||''));$('count').textContent=view.length;$('cards').innerHTML=view.map(x=>`<button class="card" data-id="${esc(x.id)}" aria-label="แก้ไข ${esc(x.title)}"><div class="poster"><span>${x.kind==='anime'?'✧':'▻'}</span>${safeURL(x.poster)?`<img src="${esc(safeURL(x.poster))}" data-fallbacks="${esc(JSON.stringify(x.posterOptions||[]))}" alt="" loading="lazy" decoding="async" width="300" height="450">`:''}<div class="badge">${statuses[x.status]}${x.status==='watching'&&x.kind==='anime'?` · ${x.progress}/${x.episodes||'?'}`:''}</div></div><h3>${esc(x.title)}</h3><div class="card-meta"><span>${x.kind==='anime'?'อนิเมะ':'ภาพยนตร์'} · ${esc(x.year||'ไม่ระบุปี')}</span><b>${x.rating!=null?'★ '+x.rating:'☆'}</b></div></button>`).join('');$('cards').querySelectorAll('img').forEach(img=>img.onerror=()=>retryImage(img));$('empty').hidden=view.length>0;if(!items.length){$('empty').querySelector('h3').textContent='เปิดฉากคลังเรื่องโปรดของคุณ';$('empty').querySelector('p').innerHTML='เริ่มด้วยหนังสักเรื่อง หรืออนิเมะที่กำลังติด<br>ค้นหาชื่อเรื่อง แล้วเก็บไว้ในพื้นที่ของคุณ';$('empty-add').hidden=false}else{$('empty').querySelector('h3').textContent='ยังไม่มีเรื่องที่ตรงกับตัวกรอง';$('empty').querySelector('p').textContent='ลองเปลี่ยนสถานะ ประเภท หรือคำค้นหา';$('empty-add').hidden=true}}
document.querySelectorAll('[data-kind]').forEach(b=>b.onclick=()=>{kindFilter=b.dataset.kind;document.querySelectorAll('[data-kind]').forEach(x=>x.classList.toggle('active',x===b));render()});document.querySelectorAll('[data-status]').forEach(b=>b.onclick=()=>{statusFilter=b.dataset.status;document.querySelectorAll('[data-status]').forEach(x=>x.classList.toggle('selected',x===b));render()});let filterTimer;$('filter').oninput=()=>{clearTimeout(filterTimer);filterTimer=setTimeout(render,100)};$('sort').onchange=render;
function openSearch(){$('search-dialog').showModal();$('query').focus()};$('add').onclick=openSearch;$('empty-add').onclick=openSearch;document.querySelectorAll('.close').forEach(b=>b.onclick=()=>b.closest('dialog').close());$('cards').onclick=e=>{const b=e.target.closest('[data-id]');if(b)edit(items.find(x=>x.id===b.dataset.id))};
function edit(x={}){draft={...x};$('search-dialog').close();$('edit-heading').textContent=items.some(i=>i.id===x.id)?'เรื่องนี้ในคลังของฉัน':'บันทึกเรื่องนี้';for(const f of ['title','year','notes','rating','episodes'])$(f).value=x[f]??'';$('kind').value=x.kind||'anime';$('status').value=x.status||'planned';$('progress').value=x.progress||0;$('delete').hidden=!items.some(i=>i.id===x.id);$('metadata').innerHTML=x.synopsis||x.source?`<div class="metadata">${x.synopsis?`<p>${esc(x.synopsis)}</p>`:''}${safeURL(x.source)?`<a class="source-link" href="${esc(safeURL(x.source))}" target="_blank" rel="noopener noreferrer">${esc(x.provider || 'แหล่งข้อมูล')} ↗</a>`:''}</div>`:'';$('edit-dialog').showModal()}
$('manual').onclick=()=>edit({kind:$('search-kind').value});
$('edit-form').onsubmit=e=>{e.preventDefault();const progress=Number($('progress').value),episodes=$('episodes').value?Number($('episodes').value):null;if(episodes&&progress>episodes){toast('ตอนที่ดูต้องไม่มากกว่าจำนวนตอนทั้งหมด');return}const x={...draft,id:draft.id||crypto.randomUUID(),title:$('title').value.trim(),kind:$('kind').value,year:$('year').value?Number($('year').value):null,status:$('status').value,rating:$('rating').value!==''?Number($('rating').value):null,progress,episodes,notes:$('notes').value,added:draft.added||new Date().toISOString(),updated:new Date().toISOString()};if(!valid(x)){toast('กรุณาตรวจสอบชื่อเรื่องและข้อมูลอีกครั้ง');return}if(save([...items.filter(i=>i.id!==x.id),x])){$('edit-dialog').close();toast('เก็บเข้าคลังแล้ว ✦')}};
$('delete').onclick=()=>{if(confirm('ลบเรื่องนี้ออกจากคลัง?')){if(save(items.filter(i=>i.id!==draft.id))){$('edit-dialog').close();toast('ลบออกจากคลังแล้ว')}}};
initSearch();
async function repairMissingPosters(){
  const groups=new Map();
  for(const item of items){
    const match=item.id.match(/^wiki-(en|th)-(\d+)$/);
    if(match&&!safeURL(item.poster)){
      if(!groups.has(match[1]))groups.set(match[1],[]);
      groups.get(match[1]).push(match[2]);
    }
  }
  for(const [language,ids] of groups){
    for(let offset=0;offset<ids.length;offset+=40){
      try{
        const params=new URLSearchParams({action:'query',format:'json',origin:'*',pageids:ids.slice(offset,offset+40).join('|'),prop:'pageimages',piprop:'thumbnail',pilicense:'any',pithumbsize:'500'});
        const data=await searchJSON(`https://${language}.wikipedia.org/w/api.php?`+params,{});
        const found=new Map(Object.values(data.query?.pages||{}).filter(page=>safeURL(page.thumbnail?.source)).map(page=>[`wiki-${language}-${page.pageid}`,page.thumbnail.source]));
        const next=items.map(item=>!safeURL(item.poster)&&found.has(item.id)?{...item,poster:found.get(item.id)}:item);
        if(next.some((item,index)=>item!==items[index]))save(next);
      }catch{/* A later visit can retry without changing the existing library. */}
    }
  }
}
repairMissingPosters();
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
let excelLoader;
function loadExcel(){
 if(window.XLSX)return Promise.resolve();
 if(!excelLoader)excelLoader=new Promise((resolve,reject)=>{const script=document.createElement('script'),fail=()=>{clearTimeout(timer);excelLoader=null;script.remove();reject(Error('Excel unavailable'))},timer=setTimeout(fail,12000);script.src='https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js';script.onload=()=>{clearTimeout(timer);if(window.XLSX)resolve();else fail()};script.onerror=fail;document.head.append(script)});
 return excelLoader;
}
$('export').onclick=async()=>{if(!items.length){toast('เพิ่มเรื่องเข้าคลังก่อนส่งออก');return}
$('export').disabled=true;try{await loadExcel()}catch{}finally{$('export').disabled=false}
const rows=items.map(x=>({'ชื่อเรื่อง':x.title,'ประเภท':x.kind==='anime'?'อนิเมะ':'ภาพยนตร์','ปี':x.year||'','สถานะ':statuses[x.status],'คะแนน':x.rating??'','ดูถึงตอน':x.progress,'จำนวนตอน':x.episodes||'','โน้ต':x.notes||'','แนว':x.genre||'','แหล่งข้อมูล':x.source||'','วันที่เพิ่ม':x.added||''}));if(window.XLSX){const sheet=XLSX.utils.json_to_sheet(rows);sheet['!cols']=[{wch:38},{wch:14},{wch:8},{wch:16},{wch:10},{wch:12},{wch:12},{wch:50},{wch:25},{wch:50},{wch:26}];const book=XLSX.utils.book_new();XLSX.utils.book_append_sheet(book,sheet,'คลังของฉัน');XLSX.writeFile(book,'scene-library.xlsx');toast('ส่งออก Excel แล้ว')}else{const cell=v=>'"'+String(v).replace(/^[=+@-]/,"'$&").replace(/"/g,'""')+'"';const csv=[Object.keys(rows[0]),...rows.map(Object.values)].map(row=>row.map(cell).join(',')).join('\r\n');download(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}),'scene-library.csv');toast('โหลด Excel ไม่สำเร็จ ส่งออก CSV ที่เปิดใน Excel ได้แทน')}};
$('backup').onclick=()=>{download(new Blob([JSON.stringify({version:1,items},null,2)],{type:'application/json'}),'scene-backup.json');toast('สำรองข้อมูลแล้ว')};$('restore').onclick=()=>$('import-file').click();$('import-file').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>10e6)throw Error();const data=JSON.parse(await file.text());if(data.version!==1||!Array.isArray(data.items)||!data.items.every(valid))throw Error();const map=new Map(items.map(x=>[x.id,x]));for(const x of data.items)if(!map.has(x.id))map.set(x.id,x);const added=map.size-items.length;if(save([...map.values()]))toast('นำเข้าแล้ว '+added+' เรื่อง · รายการซ้ำเก็บข้อมูลเดิม')}catch{toast('นำเข้าไม่ได้ กรุณาเลือกไฟล์สำรอง Scene ที่ถูกต้อง')}e.target.value=''};render();
