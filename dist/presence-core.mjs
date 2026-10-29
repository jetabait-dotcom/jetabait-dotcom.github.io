// Display-only public presence. Never use client-reported names/status for authorization.
export const PRESENCE_TOPIC = 'jetabait-online-v1';
const hex = bytes => [...bytes].map(x => x.toString(16).padStart(2, '0')).join('');
export function visitorId(storage, random = crypto) {
  try {
    const saved = storage?.getItem('jetabait-visitor');
    if (/^[a-f0-9]{24}$/.test(saved || '')) return saved;
  } catch {}
  const id = hex(random.getRandomValues(new Uint8Array(12)));
  try { storage?.setItem('jetabait-visitor', id); } catch {}
  return id;
}
export function displayName(value) {
  return typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 40) : '';
}
export async function presencePayload(user, browser, random = crypto) {
  if (!user?.id) return { identity: 'g-' + browser, browser, kind: 'guest', name: 'ผู้เยี่ยมชม ' + browser.slice(0, 6).toUpperCase() };
  const digest = await random.subtle.digest('SHA-256', new TextEncoder().encode('jetabait-online:' + user.id));
  const meta = user.user_metadata || {};
  return { identity: 'm-' + hex(new Uint8Array(digest)).slice(0, 32), browser, kind: 'member', name: displayName(meta.display_name) || displayName(meta.full_name) || 'สมาชิก' };
}
export function onlinePeople(state) {
  const entries = Object.values(state || {}).flatMap(items => Array.isArray(items) ? items : []).filter(p =>
    p && /^[a-f0-9]{24}$/.test(p.browser || '') &&
    (p.kind === 'guest' && p.identity === 'g-' + p.browser || p.kind === 'member' && /^m-[a-f0-9]{32}$/.test(p.identity || '')));
  const signedBrowsers = new Set(entries.filter(p => p.kind === 'member').map(p => p.browser));
  const people = new Map();
  for (const entry of entries) {
    if (entry.kind === 'guest' && signedBrowsers.has(entry.browser)) continue;
    const name = entry.kind === 'guest' ? 'ผู้เยี่ยมชม ' + entry.browser.slice(0, 6).toUpperCase() : displayName(entry.name) || 'สมาชิก';
    people.set(entry.identity, { identity: entry.identity, kind: entry.kind, name });
  }
  return [...people.values()].sort((a, b) => (a.kind === 'guest') - (b.kind === 'guest') || a.name.localeCompare(b.name, 'th'));
}
