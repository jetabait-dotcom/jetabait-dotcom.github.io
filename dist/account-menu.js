(() => {
  const render = async () => {
    await JetaAccount.ready;
    const {user, error} = JetaAccount.state();
    if (!user && JetaAccount.guest()) {
      JetaAccount.reveal();
      if (!document.getElementById('guest-login')) { const link=document.createElement('a'); link.id='guest-login'; link.className='user-menu guest-login'; link.href='/account.html'; link.textContent='เข้าสู่ระบบ'; document.body.append(link); }
      return;
    }
    if (!user || error) { JetaAccount.requireLogin(); return; }
    JetaAccount.reveal();
    let menu = document.getElementById('user-menu');
    if (!menu) {
      menu = document.createElement('details'); menu.id = 'user-menu'; menu.className = 'user-menu';
      menu.innerHTML = '<summary><img alt="" hidden><span></span></summary><div class="user-menu-items"><a href="/account.html#settings">ตั้งค่า</a><button type="button">ออกจากระบบ</button><p role="status"></p></div>';
      document.body.append(menu);
      let settingsReady;
      const prepareSettings = () => settingsReady ||= (async () => {
        const response = await fetch('/account.html');
        if (!response.ok) throw Error('โหลดหน้าตั้งค่าไม่ได้ กรุณาลองใหม่');
        const source = new DOMParser().parseFromString(await response.text(), 'text/html');
        if (!window.JetaProfile) await new Promise((resolve,reject) => {
          const script=document.createElement('script'); script.src='/account-page.js'; script.onload=resolve; script.onerror=()=>{script.remove();reject(Error('โหลดหน้าตั้งค่าไม่ได้'))}; document.head.append(script);
        });
        const modal=document.createElement('dialog');modal.id='settings-modal';modal.className='profile-modal';modal.setAttribute('aria-label','โปรไฟล์และการตั้งค่า');
        modal.append(source.querySelector('.account-panel'),source.querySelector('#save-success'));document.body.append(modal);
        const refresh=JetaProfile.mount(modal,true);
        modal.addEventListener('click',event=>{if(event.target===modal){const b=modal.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)modal.close()}});
        return {modal,refresh};
      })().catch(error=>{settingsReady=null;throw error});
      const idle=window.requestIdleCallback || (fn=>setTimeout(fn,300));idle(()=>{prepareSettings().catch(()=>{})});
      document.querySelectorAll('#user-menu a, .hub-account').forEach(link=>link.onclick=async event=>{
        event.preventDefault();menu.open=false;
        try{const {modal,refresh}=await prepareSettings();await refresh();if(!modal.open)modal.showModal()}
        catch(error){menu.open=true;menu.querySelector('p').textContent=error.message}
      });
      menu.querySelector('button').onclick = async () => {
        try { await JetaAccount.signOut(); location.replace('/account.html'); }
        catch(e) { menu.querySelector('p').textContent = e.message; }
      };
    }
    const meta = user.user_metadata || {};
    menu.querySelector('summary span').textContent = meta.display_name || meta.full_name || 'บัญชีของฉัน';
    const image = menu.querySelector('img'), url = meta.avatar_custom || meta.avatar_url;
    if (url && /^(https:\/\/|data:image\/webp;base64,)/.test(url)) { image.src = url; image.hidden = false; }
  };
  JetaAccount.subscribe(() => { void render(); }); void render();
})();
