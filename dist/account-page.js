(() => {
  const $ = id => document.getElementById(id);
  let navigating = false;
  const success = $('save-success');
  let successTimer;
  $('settings-close').onclick = () => { if (window.parent !== window) window.parent.postMessage('jetabait-close-settings', location.origin); else location.replace('/'); };
  async function render() {
    const state = await JetaAccount.ready;
    const current = JetaAccount.state();
    if (navigating) return state;
    // Keep the transition screen until navigation; never paint the profile during OAuth return.
    if (current.user && !['#profile', '#settings'].includes(location.hash)) { navigating = true; location.replace(JetaAccount.destination()); return state; }
    $('google-signin').hidden = Boolean(current.user);
    $('profile-panel').hidden = !current.user;
    $('google-signin').disabled = !current.configured || !current.googleEnabled || Boolean(current.error);
    document.body.classList.toggle('login-only', !current.user);
    if (current.user) {
      document.title = 'บัญชีของฉัน — Jetabait';
      $('account-title').textContent = 'บัญชีของฉัน';
      $('profile-name').textContent = current.user.user_metadata?.display_name || current.user.user_metadata?.full_name || 'สมาชิก Jetabait';
      $('profile-email').textContent = current.user.email || '';
      const meta = current.user.user_metadata || {};
      if (!$('profile-form').contains(document.activeElement)) {
        $('display-name').value = meta.display_name || meta.full_name || '';
      }
      const avatar = meta.avatar_custom || meta.avatar_url;
      if (avatar && /^(https:\/\/|data:image\/webp;base64,)/.test(avatar)) { $('profile-avatar').src = avatar; $('profile-avatar').hidden = false; }
      $('account-message').textContent = '';
    } else {
      $('account-message').textContent = current.error || (!current.configured || !current.googleEnabled
        ? 'เตรียมระบบบัญชีและคลังออนไลน์แล้ว กำลังรอเปิดใช้งาน Google Login'
        : '');
    }
    JetaAccount.reveal();
    return state;
  }
  $('google-signin').onclick = async () => {
    $('google-signin').disabled = true;
    try { await JetaAccount.signIn(); }
    catch (error) { $('account-message').textContent = error.message; $('google-signin').disabled = false; }
  };
  $('google-signout').onclick = async () => {
    $('google-signout').disabled = true;
    try { await JetaAccount.signOut(); location.replace('/account.html'); }
    catch (error) { $('account-message').textContent = error.message; $('google-signout').disabled = false; }
  };
  let avatarCustom;
  $('avatar-file').onchange = async () => {
    const file = $('avatar-file').files[0];
    if (!file) return;
    if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      $('profile-status').textContent = 'เลือกรูป JPG, PNG หรือ WebP ขนาดไม่เกิน 5 MB'; $('avatar-file').value = ''; return;
    }
    try {
      const bitmap = await createImageBitmap(file), canvas = document.createElement('canvas');
      canvas.width = canvas.height = 192;
      const size = Math.min(bitmap.width, bitmap.height);
      canvas.getContext('2d').drawImage(bitmap, (bitmap.width-size)/2, (bitmap.height-size)/2, size, size, 0, 0, 192, 192);
      bitmap.close(); avatarCustom = canvas.toDataURL('image/webp', .75);
      if (avatarCustom.length > 60000) throw Error('รูปมีรายละเอียดมากเกินไป กรุณาเลือกรูปอื่น');
      $('profile-avatar').src = avatarCustom; $('profile-avatar').hidden = false;
      $('profile-status').textContent = 'เลือกรูปแล้ว กดบันทึกเพื่อใช้รูปนี้';
    } catch(e) { avatarCustom = undefined; $('profile-status').textContent = e.message; }
  };
  $('profile-form').onsubmit = async event => {
    event.preventDefault(); $('save-profile').disabled = true;
    try {
      const values = { display_name: $('display-name').value.trim() };
      if (!values.display_name) throw Error('กรุณาใส่ชื่อที่แสดง');
      if (avatarCustom !== undefined) values.avatar_custom = avatarCustom;
      await JetaAccount.updateProfile(values); await JetaAccount.profile();
      avatarCustom = undefined; $('profile-status').textContent = ''; success.hidden = false;
      clearTimeout(successTimer); successTimer = setTimeout(() => { success.hidden = true; }, 1800);
    } catch(e) { $('profile-status').textContent = e.message; }
    finally { $('save-profile').disabled = false; }
  };
  JetaAccount.subscribe(() => { void render(); });
  window.addEventListener('hashchange', () => { void render(); });
  void render();
})();
