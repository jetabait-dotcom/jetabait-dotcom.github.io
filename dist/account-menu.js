(() => {
  const render = async () => {
    await JetaAccount.ready;
    const {user, error} = JetaAccount.state();
    if (!user || error) { JetaAccount.requireLogin(); return; }
    if (document.body.dataset.page !== 'library') JetaAccount.reveal();
    let menu = document.getElementById('user-menu');
    if (!menu) {
      menu = document.createElement('details'); menu.id = 'user-menu'; menu.className = 'user-menu';
      menu.innerHTML = '<summary><img alt="" hidden><span></span></summary><div class="user-menu-items"><a href="/account.html#profile">โปรไฟล์ของฉัน</a><a href="/account.html#settings">ตั้งค่า</a><button type="button">ออกจากระบบ</button><p role="status"></p></div>';
      document.body.append(menu);
      menu.querySelectorAll('a').forEach(link => link.onclick = event => {
        event.preventDefault(); menu.open = false;
        let modal = document.getElementById('settings-modal');
        if (!modal) {
          modal = document.createElement('dialog'); modal.id = 'settings-modal'; modal.className = 'settings-modal';
          const frame = document.createElement('iframe'); frame.title = 'โปรไฟล์และการตั้งค่า'; modal.append(frame); document.body.append(modal);
          modal.addEventListener('click', event => { if (event.target === modal) { const box=modal.getBoundingClientRect(); if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)modal.close(); } });
          window.addEventListener('message', event => { if(event.origin===location.origin && event.source===frame.contentWindow && event.data==='jetabait-close-settings')modal.close(); });
        }
        modal.querySelector('iframe').src = '/account.html?embed=1' + new URL(link.href).hash;
        modal.showModal();
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
