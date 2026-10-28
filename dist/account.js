/* Supabase owns OAuth, token renewal, and session validation. Sites access remains enabled. */
(() => {
  const config = window.JETABAIT_CONFIG || {};
  const configured = Boolean(config.supabaseUrl && config.supabasePublishableKey);
  const state = { configured, googleEnabled: Boolean(config.googleEnabled), user: null, error: null };
  const listeners = new Set();
  let client;
  const notify = () => { for (const listener of listeners) listener({ ...state }); };
  function publicConfig() {
    const url = new URL(config.supabaseUrl);
    if (url.protocol !== 'https:' || !config.supabasePublishableKey.startsWith('sb_publishable_')) {
      throw Error('การตั้งค่าระบบบัญชียังไม่ถูกต้อง');
    }
    return url.origin;
  }
  const ready = (async () => {
    if (!configured || !state.googleEnabled) return state;
    try {
      const origin = publicConfig();
      const { createClient } = await import('./vendor/supabase.js');
      client = createClient(origin, config.supabasePublishableKey, {
        auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      });
      // Browser session is for presentation only. RLS validates identity on every data request.
      // getSession also waits for the SDK's PKCE callback and refreshes expired tokens.
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      state.user = data.session?.user || null;
      client.auth.onAuthStateChange((_event, session) => {
        state.user = session?.user || null;
        // Subscribers may call Auth/DB methods: run them outside the SDK's auth lock.
        setTimeout(notify, 0);
      });
    } catch { state.error = 'เชื่อมต่อระบบบัญชีไม่ได้ กรุณาลองใหม่อีกครั้ง'; }
    return state;
  })();
  window.JetaAccount = {
    ready,
    state: () => ({ ...state }),
    guest() { try { return sessionStorage.getItem('jetabait-guest') === '1'; } catch { return false; } },
    reveal() { document.documentElement.classList.remove('auth-pending', 'account-loading', 'protected-page'); },
    destination() {
      let path = '/';
      try { path = sessionStorage.getItem('jetabait-return') || '/'; sessionStorage.removeItem('jetabait-return'); } catch {}
      return ['/', '/library', '/library.html'].includes(path) ? path : '/';
    },
    requireLogin() {
      try { sessionStorage.setItem('jetabait-return', ['/library', '/library.html'].includes(location.pathname) ? '/library.html' : '/'); } catch {}
      location.replace('/account.html');
    },
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    async signIn() {
      await ready;
      if (!configured) throw Error('Google Login ยังรอการเชื่อมต่อบริการบัญชี');
      if (!state.googleEnabled) throw Error('ยังไม่ได้เปิดใช้งาน Google Login');
      if (!client || state.error) throw Error(state.error || 'ระบบบัญชียังไม่พร้อม');
      const { data, error } = await client.auth.signInWithOAuth({
        provider: 'google', options: { redirectTo: new URL('/account.html', location.origin).href,
          skipBrowserRedirect: true, queryParams: { prompt: 'select_account' } }
      });
      if (error || !data.url) throw Error('เริ่มเข้าสู่ระบบไม่ได้ กรุณาลองใหม่');
      location.assign(data.url);
    },
    async signOut() {
      await ready;
      if (!client) return;
      const { error } = await client.auth.signOut({ scope: 'local' });
      if (error) throw Error('ออกจากระบบไม่สำเร็จ กรุณาลองใหม่');
      state.user = null;
      notify();
    },
    async database() {
      await ready;
      if (!client || !state.user) throw Error('กรุณาเข้าสู่ระบบก่อน');
      return client;
    },
    async updateProfile(values) {
      const db = await this.database();
      const { data, error } = await db.auth.updateUser({ data: values });
      if (error) throw Error('บันทึกโปรไฟล์ไม่ได้ กรุณาลองใหม่');
      state.user = data.user;
      notify();
      return data.user;
    },
    async profile() {
      const db = await this.database(), user = state.user;
      const { data, error } = await db.from('profiles').upsert({
        id: user.id, display_name: String(user.user_metadata?.display_name || user.user_metadata?.full_name || user.email || '').slice(0, 160)
      }, { onConflict: 'id' }).select('id,display_name').single();
      if (error) throw Error('ยังเชื่อมโปรไฟล์ออนไลน์ไม่ได้');
      return data;
    }
  };
})();
