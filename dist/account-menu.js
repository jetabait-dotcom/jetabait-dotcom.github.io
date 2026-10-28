(() => {
  document.documentElement.classList.add('protected-page');
  const render = async () => {
    await JetaAccount.ready;
    const {user, error} = JetaAccount.state();
    if (!user || error) { location.replace('/account.html'); return; }
    document.documentElement.classList.remove('protected-page', 'account-loading');
    let menu = document.getElementById('user-menu');
    if (!menu) {
      menu = document.createElement('details'); menu.id = 'user-menu'; menu.className = 'user-menu';
      menu.innerHTML = '<summary><img alt="" hidden><span></span></summary><div class="user-menu-items"><a href="/account.html#profile">โปรไฟล์ของฉัน</a><a href="/account.html#settings">ตั้งค่า</a><button type="button">ออกจากระบบ</button><p role="status"></p></div>';
      document.body.append(menu);
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