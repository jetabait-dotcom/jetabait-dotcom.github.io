(() => {
  const $ = id => document.getElementById(id);
  async function render() {
    const state = await JetaAccount.ready;
    const current = JetaAccount.state();
    $('google-signin').hidden = Boolean(current.user);
    $('profile-panel').hidden = !current.user;
    $('google-signin').disabled = !current.configured || !current.googleEnabled || Boolean(current.error);
    if (current.user) {
      $('account-title').textContent = 'บัญชีของฉัน';
      $('account-description').textContent = 'เชื่อมต่อบัญชี Google แล้ว';
      $('profile-name').textContent = current.user.user_metadata?.display_name || current.user.user_metadata?.full_name || 'สมาชิก Jetabait';
      $('profile-email').textContent = current.user.email || '';
      const meta = current.user.user_metadata || {};
      if (!$('profile-form').contains(document.activeElement)) {
        $('display-name').value = meta.display_name || meta.full_name || '';
        $('default-sort').value = meta.default_sort || 'recent';
      }
      const avatar = meta.avatar_custom || meta.avatar_url;
      if (avatar && /^(https:\/\/|data:image\/webp;base64,)/.test(avatar)) { $('profile-avatar').src = avatar; $('profile-avatar').hidden = false; }
      $('account-message').textContent = '';
      try { await JetaAccount.profile(); } catch (error) { $('account-message').textContent = error.message; }
    } else {
      $('account-message').textContent = current.error || (!current.configured || !current.googleEnabled
        ? 'เตรียมระบบบัญชีและคลังออนไลน์แล้ว กำลังรอเปิดใช้งาน Google Login'
        : 'ใช้บัญชี Google ของคุณเพื่อเข้าสู่ระบบหรือสร้างบัญชีใหม่');
    }
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
  $('reset-avatar').onclick = () => { avatarCustom = null; $('profile-avatar').src = JetaAccount.state().user.user_metadata?.avatar_url || ''; $('profile-status').textContent = 'กดบันทึกเพื่อกลับไปใช้รูป Google'; };
  $('profile-form').onsubmit = async event => {
    event.preventDefault(); $('save-profile').disabled = true;
    try {
      const values = { display_name: $('display-name').value.trim(), default_sort: $('default-sort').value };
      if (!values.display_name) throw Error('กรุณาใส่ชื่อที่แสดง');
      if (avatarCustom !== undefined) values.avatar_custom = avatarCustom;
      await JetaAccount.updateProfile(values); await JetaAccount.profile();
      avatarCustom = undefined; $('profile-status').textContent = 'บันทึกเรียบร้อยแล้ว';
    } catch(e) { $('profile-status').textContent = e.message; }
    finally { $('save-profile').disabled = false; }
  };
  JetaAccount.subscribe(() => { void render(); });
  void render();
})();
