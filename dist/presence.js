import { createClient } from './vendor/supabase.js';
import { PRESENCE_TOPIC, visitorId, presencePayload, onlinePeople } from './presence-core.mjs';

// Also wait for the page's deferred config/Auth scripts when modules load from cache.
if (document.readyState === 'loading') await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve, { once: true }));

const panel = document.getElementById('online-panel');
const list = document.getElementById('online-people');
const count = document.getElementById('online-count');
const status = document.getElementById('online-status');
let storage;
try { storage = localStorage; } catch {}
const browser = visitorId(storage);
let client, channel, trackRetry, connected = false, stopped = false, revision = 0;
let payload = await presencePayload(null, browser);

function connection(text) {
  if (!panel) return;
  panel.dataset.connected = String(connected);
  status.textContent = text;
  if (!connected) { count.textContent = '—'; list.replaceChildren(); }
}
function render() {
  if (!panel || !connected || !channel) return;
  const people = onlinePeople(channel.presenceState());
  count.textContent = String(people.length);
  status.textContent = people.length ? 'กำลังอยู่ในเว็บ' : 'ยังไม่มีคนออนไลน์';
  const rows = people.map(person => {
    const row = document.createElement('li');
    const avatar = document.createElement('span');
    avatar.className = 'online-avatar ' + person.kind;
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = person.kind === 'guest' ? '◇' : Array.from(person.name)[0];
    const info = document.createElement('div');
    const name = document.createElement('strong');
    name.textContent = person.name;
    const label = document.createElement('small');
    label.textContent = (person.kind === 'member' ? 'สมาชิก' : 'ผู้เยี่ยมชม') + (person.identity === payload.identity ? ' · มึง' : '');
    info.append(name, label);
    const dot = document.createElement('span');
    dot.className = 'online-dot';
    dot.setAttribute('aria-hidden', 'true');
    row.append(avatar, info, dot);
    return row;
  });
  list.replaceChildren(...rows);
}
async function publish() {
  const current = channel;
  if (!connected || !current) return;
  try {
    const result = await current.track(payload);
    if (current !== channel) return;
    if (result !== 'ok') retryTrack(current);
    else { clearTimeout(trackRetry); connected = true; render(); }
  } catch { if (current === channel) retryTrack(current); }
}
function retryTrack(current) {
  connected = false;
  connection('กำลังเชื่อมต่อใหม่…');
  clearTimeout(trackRetry);
  trackRetry = setTimeout(() => {
    if (current !== channel || stopped || !navigator.onLine) return;
    connected = true;
    void publish();
  }, 5000);
}
async function refresh() {
  const version = ++revision;
  const next = await presencePayload(window.JetaAccount?.state().user, browser);
  if (version !== revision) return;
  const changed = JSON.stringify(payload) !== JSON.stringify(next);
  payload = next;
  if (changed) await publish();
}
function connect() {
  if (channel || stopped) return;
  const current = client.channel(PRESENCE_TOPIC, { config: { presence: { key: crypto.randomUUID() } } });
  channel = current;
  current.on('presence', { event: 'sync' }, render).subscribe(state => {
    if (current !== channel || stopped) return;
    connected = state === 'SUBSCRIBED';
    if (connected) void publish();
    else connection(state === 'CLOSED' ? 'ออฟไลน์' : 'กำลังเชื่อมต่อใหม่…');
  });
}
function stop() {
  stopped = true;
  clearTimeout(trackRetry);
  connected = false;
  const previous = channel;
  channel = null;
  if (previous) void client.removeChannel(previous);
}

try {
  await window.JetaAccount?.ready;
  await refresh();
  const config = window.JETABAIT_CONFIG;
  if (!config?.supabaseUrl || !config?.supabasePublishableKey) throw Error('Missing presence configuration');
  // A separate, non-persistent public client also works for visitors without an account.
  // No Auth UUIDs, emails, avatars, or access tokens are published in the payload.
  client = createClient(config.supabaseUrl, config.supabasePublishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, storageKey: 'jetabait-public-presence' }
  });
  window.JetaAccount?.subscribe(() => { void refresh().catch(() => {}); });
  window.addEventListener('pagehide', stop);
  window.addEventListener('pageshow', () => { stopped = false; connect(); });
  window.addEventListener('online', () => { if (!stopped) { if (!channel) connect(); else { connected = true; void publish(); } } });
  window.addEventListener('offline', () => { connected = false; connection('ออฟไลน์ · รอเชื่อมต่อใหม่'); });
  connect();
} catch { connected = false; connection('รายชื่อออนไลน์ยังไม่พร้อม ลองรีเฟรชอีกครั้ง'); }
