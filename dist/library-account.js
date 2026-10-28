async function syncLibrary() {
  if (!accountStore || syncingLibrary) return;
  syncingLibrary = true;
  $('cloud-status').textContent = 'กำลังซิงก์…';
  let succeeded = false;
  try {
    const next = await accountStore.sync();
    if (!Array.isArray(next) || !next.every(valid)) throw Error('ข้อมูลออนไลน์ไม่ถูกต้อง กรุณาตรวจไฟล์สำรอง');
    items = next;
    render();
    $('cloud-status').textContent = 'ซิงก์แล้ว';
    succeeded = true;
  } catch (error) {
    $('cloud-status').textContent = 'รอซิงก์ · กดเพื่อลองใหม่';
    $('cloud-status').title = error.message;
  } finally {
    syncingLibrary = false;
    if (succeeded && Object.keys(accountStore.pending()).length) queueMicrotask(() => { void syncLibrary(); });
  }
}
(async () => {
  const state = await JetaAccount.ready;
  const accountLink = $('library-account');
  if (!state.googleEnabled) {
    accountLink.textContent = '♙ บัญชีของฉัน';
    return;
  }
  if (state.error || !state.user) { location.replace('/account.html'); return; }
  const id = state.user.id;
  accountStore = new JetaCloudLibrary(id, valid);
  try {
    const cached = accountStore.read();
    if (Array.isArray(cached) && cached.every(valid)) items = cached;
  } catch { toast('อ่านคลังที่บันทึกไว้ไม่ได้ กรุณาตรวจไฟล์สำรอง'); }
  render();
  accountLink.textContent = '♙ ' + (state.user.user_metadata?.full_name || 'บัญชีของฉัน');
  $('cloud-status').hidden = false;
  $('library-data-notice').textContent = 'คลังผูกกับบัญชีของคุณ • ซิงก์ออนไลน์';
  $('cloud-status').onclick = () => { void syncLibrary(); };
  const importLocal = $('import-local-library');
  let legacy = [];
  try { legacy = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch {}
  importLocal.hidden = !Array.isArray(legacy) || !legacy.length || !legacy.every(valid);
  importLocal.onclick = async () => {
    importLocal.disabled = true;
    // Pull before importing so an existing online entry always wins a duplicate ID.
    await syncLibrary();
    if ($('cloud-status').textContent !== 'ซิงก์แล้ว') { importLocal.disabled = false; toast('กรุณาซิงก์คลังออนไลน์ให้สำเร็จก่อนนำเข้า'); return; }
    const merged = new Map(items.map(item => [item.id, item]));
    for (const item of legacy) if (!merged.has(item.id)) merged.set(item.id, item);
    const added = merged.size - items.length;
    if (save([...merged.values()])) { toast('นำเข้าคลังเดิม ' + added + ' เรื่องแล้ว'); importLocal.hidden = true; }
    importLocal.disabled = false;
  };
  document.documentElement.classList.remove('account-loading');
  JetaAccount.subscribe(current => {
    if (current.user?.id !== id) { document.documentElement.classList.add('account-loading'); location.replace('/account.html'); }
  });
  await syncLibrary();
  void repairMissingPosters();
  window.addEventListener('online', () => { void syncLibrary(); });
  window.addEventListener('focus', () => { void syncLibrary(); });
})();
