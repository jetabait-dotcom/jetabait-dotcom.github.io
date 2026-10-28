const vm = require('node:vm'), fs = require('node:fs'), assert = require('node:assert/strict');
const source = fs.readFileSync('dist/account.js', 'utf8').replace("import('./vendor/supabase.js')", 'Promise.resolve({ createClient: sdkCreateClient })');
async function account(session, error = null) {
  let event, requested = 0;
  const classes = new Set(['auth-pending']);
  const storage = new Map();
  const root = { classList: { remove: (...names) => names.forEach(name => classes.delete(name)) } };
  const client = { auth: {
    getSession: async () => { requested++; return { data: { session }, error }; },
    getUser: () => { throw Error('startup must not wait for a remote getUser'); },
    onAuthStateChange: handler => { event = handler; }
  }};
  const context = vm.createContext({ window: { JETABAIT_CONFIG: { supabaseUrl:'https://example.supabase.co', supabasePublishableKey:'sb_publishable_test', googleEnabled:true } }, document: { documentElement:root }, URL, setTimeout, sdkCreateClient: () => client,
    sessionStorage: { getItem: key => storage.get(key), setItem:(key,value) => storage.set(key,value), removeItem:key => storage.delete(key) },
    location: { pathname:'/library.html', replace: url => context.redirect = url } });
  vm.runInContext(source, context);
  const api = context.window.JetaAccount;
  await api.ready;
  return { api, context, classes, storage, event, requested };
}
async function page(user, hash = '', error = null) {
  const { api, context, classes } = await account(user ? { user } : null, error);
  const nodes = new Map(); let writes = 0;
  const get = id => {
    if (!nodes.has(id)) nodes.set(id, { value:'', addEventListener(){}, contains:()=>false, set hidden(value){writes++}, set disabled(value){writes++}, set textContent(value){writes++} });
    return nodes.get(id);
  };
  context.JetaAccount = api; context.window.JetaProfile=undefined; context.location.hash = hash;
  context.document.getElementById = get; context.document.querySelector = selector => get(selector.slice(1));
  context.document.body = { classList:{ toggle(){}, contains:()=>true } };
  context.window.addEventListener = () => {};
  vm.runInContext(fs.readFileSync('dist/account-page.js','utf8').replace('void JetaProfile.mount()', 'void window.JetaProfile.mount()'),context);
  await new Promise(resolve=>setImmediate(resolve));
  return { classes, writes, redirect: context.redirect, nodes };
}
(async () => {
  const user = { id:'member', user_metadata:{ full_name:'Member' } };
  const cached = await account({ user });
  assert.equal(cached.api.state().user.id, 'member'); assert.equal(cached.requested, 1);
  let changed;
  cached.api.subscribe(state => { changed = state.user; });
  cached.event('SIGNED_OUT', null);
  assert.equal(changed, undefined, 'notify must run after the auth callback releases its lock');
  await new Promise(resolve=>setTimeout(resolve, 0)); assert.equal(changed, null);
  cached.api.requireLogin(); assert.equal(cached.context.redirect, '/account.html');
  assert.equal(cached.api.destination(), '/library.html'); assert.equal(cached.api.destination(), '/');
  cached.storage.set('jetabait-return','https://untrusted.example'); assert.equal(cached.api.destination(), '/');
  const callback = await page(user);
  assert.equal(callback.redirect, '/'); assert.equal(callback.writes, 0, 'OAuth return must navigate before touching profile/login DOM');
  assert.ok(callback.classes.has('auth-pending'), 'keep transition visible during navigation');
  const login = await page(null); assert.ok(!login.classes.has('auth-pending'));
  const failure = await page(null, '', Error('offline')); assert.ok(!failure.classes.has('auth-pending'), 'show sign-in error instead of a blank screen');
  const profile = await page(user, '#profile'); assert.equal(profile.redirect, undefined); assert.ok(!profile.classes.has('auth-pending'));
  for (const name of ['index','library','account']) assert.match(fs.readFileSync('dist/'+name+'.html','utf8'), /<html lang="th" class="auth-pending">/, 'gate must exist before the first paint');
  assert.doesNotMatch(fs.readFileSync('dist/library.html','utf8'), /xlsx.full.min.js/, 'Excel must not block initial loading');
  console.log('PASS: cached session, deferred auth notifications, safe return routes, callback without profile flash, error recovery, profile view, early paint gate, lazy Excel');
})().catch(error=>{console.error(error);process.exitCode=1});
