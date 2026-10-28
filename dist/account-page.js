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
      $('profile-name').textContent = current.user.user_metadata?.full_name || 'สมาชิก Jetabait';
      $('profile-email').textContent = current.user.email || '';
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
  JetaAccount.subscribe(() => { void render(); });
  void render();
})();
