(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const key = 'jetaboard-shortcuts-v1';
  const defaults = [
    { name:'Jetawatch', url:'/library.html', icon:'✳', color:'#3b2933', ink:'#edacc6' },
    { name:'YouTube', url:'https://www.youtube.com/', icon:'▶', color:'#382528', ink:'#ed9ba3' },
    { name:'Google', url:'https://www.google.com/', icon:'G', color:'#26312c', ink:'#b2cdae' },
    { name:'ChatGPT', url:'https://chatgpt.com/', icon:'◎', color:'#293331', ink:'#a6c9bd' },
    { name:'Gmail', url:'https://mail.google.com/', icon:'M', color:'#3b2e27', ink:'#dfb69a' },
    { name:'Google Drive', url:'https://drive.google.com/', icon:'△', color:'#303326', ink:'#c7cea1' },
    { name:'Spotify', url:'https://open.spotify.com/', icon:'≋', color:'#24362b', ink:'#a4d7af' },
    { name:'GitHub', url:'https://github.com/', icon:'⌘', color:'#302b3a', ink:'#c2b4e2' }
  ];
  const time = new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Bangkok',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});
  const date = new Intl.DateTimeFormat('th-TH',{timeZone:'Asia/Bangkok',weekday:'long',day:'numeric',month:'long',year:'numeric'});
  function tick(){const now = new Date(), parts = time.format(now).split(':');$('clock-hours').textContent=parts.slice(0,2).join(':');$('clock-seconds').textContent=parts[2];$('clock-date').textContent=date.format(now);const h=Number(parts[0]);$('board-greeting').textContent=h<5?'ดึกแล้ว พักสักหน่อยไหม':h<12?'สวัสดีตอนเช้า':h<17?'สวัสดีตอนบ่าย':'สวัสดีตอนเย็น';}
  tick();setInterval(tick,1000);
  let shortcuts = defaults.map(item=>({...item}));
  function validURL(value){try{const url=new URL(value,location.origin);return ['https:','http:'].includes(url.protocol)?url:null;}catch{return null;}}
  try {const saved=JSON.parse(localStorage.getItem(key));if(Array.isArray(saved))shortcuts=saved.filter(item=>item&&typeof item.name==='string'&&typeof item.url==='string'&&validURL(item.url)).slice(0,40);}catch{}
  function persist(next){try{localStorage.setItem(key,JSON.stringify(next));shortcuts=next;render();$('board-notice').textContent='';return true;}catch{$('board-notice').textContent='เบราว์เซอร์บันทึกไม่ได้ ลองเปิดสิทธิ์จัดเก็บข้อมูลแล้วเพิ่มอีกครั้ง';return false;}}
  function render(){const grid=$('shortcut-grid');grid.replaceChildren();shortcuts.forEach((item,index)=>{const url=validURL(item.url);if(!url)return;const card=document.createElement('article');card.className='shortcut';const link=document.createElement('a');link.href=url.href;const external=url.origin!==location.origin;if(external){link.target='_blank';link.rel='noopener noreferrer';link.setAttribute('aria-label',item.name+' (เปิดแท็บใหม่)');}const icon=document.createElement('span');icon.className='shortcut-icon';icon.textContent=item.icon||item.name.charAt(0).toUpperCase();if(/^#[\da-f]{6}$/i.test(item.color||''))icon.style.setProperty('--tile',item.color);if(/^#[\da-f]{6}$/i.test(item.ink||''))icon.style.setProperty('--ink',item.ink);const text=document.createElement('span');text.className='shortcut-text';const name=document.createElement('strong');name.textContent=item.name;const host=document.createElement('small');host.textContent=external?url.hostname.replace(/^www\./,''):'คลังหนังและอนิเมะ';text.append(name,host);const arrow=document.createElement('span');arrow.className='shortcut-arrow';arrow.textContent=external?'↗':'→';link.append(icon,text,arrow);const remove=document.createElement('button');remove.type='button';remove.className='shortcut-delete';remove.textContent='×';remove.setAttribute('aria-label','ลบ shortcut '+item.name);remove.onclick=()=>{persist(shortcuts.filter((_,i)=>i!==index));};card.append(link,remove);grid.append(card);});$('shortcut-count').textContent=String(shortcuts.length).padStart(2,'0');}
  render();
  const dialog=$('shortcut-dialog'),form=$('shortcut-form');
  $('add-shortcut').onclick=()=>{if(shortcuts.length>=40){$('board-notice').textContent='เพิ่มได้สูงสุด 40 shortcut';return;}form.reset();$('shortcut-error').textContent='';dialog.showModal();$('shortcut-name').focus();};
  $('cancel-shortcut').onclick=()=>dialog.close();
  form.addEventListener('submit',event=>{event.preventDefault();const name=$('shortcut-name').value.trim();let raw=$('shortcut-url').value.trim();if(!/^[a-z][a-z\d+.-]*:/i.test(raw))raw='https://'+raw;const url=validURL(raw);if(!name||!url){$('shortcut-error').textContent='ใส่ชื่อเว็บและลิงก์ http หรือ https ที่ถูกต้อง';return;}if(persist([...shortcuts,{name:name.slice(0,40),url:url.href}]))dialog.close();});
})();
