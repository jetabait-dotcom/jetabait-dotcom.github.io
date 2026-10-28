const vm = require('node:vm');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const storage = new Map(), rows = new Map();
let activeUser = 'user-a', failWrite = false, holdWrite, startedWrite;
const db = { from() { return {
  async upsert(batch) {
    if (failWrite) return { error: Error('offline') };
    if (holdWrite) { const wait = holdWrite; holdWrite = null; startedWrite(); await wait; }
    for (const row of batch) rows.set(row.owner_id + ':' + row.entry_id, { ...row });
    return { error: null };
  },
  select() { return this; }, eq(_key, id) { this.owner = id; return this; }, order() { return this; },
  async range(start, end) { return { data: [...rows.values()].filter(row => row.owner_id === this.owner).slice(start, end + 1), error: null }; }
}; } };
const sandbox = {
  window: {}, crypto: { randomUUID },
  localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) },
  JetaAccount: { database: async () => db, state: () => ({ user: { id: activeUser } }) }
};
vm.runInNewContext(fs.readFileSync('dist/cloud-library.js', 'utf8'), sandbox);
const Store = sandbox.window.JetaCloudLibrary;
const item = (title = 'One Piece') => ({ id: 'mal-21', title });
(async () => {
  const a = new Store('user-a'), b = new Store('user-b');
  a.commit([item()]);
  assert.equal(a.read().length, 1);
  assert.equal(b.read().length, 0, 'another account must have an independent cache');
  assert.ok(new Store('user-a').pending()['mal-21'], 'outbox must survive re-opening');
  failWrite = true;
  await assert.rejects(a.sync());
  assert.ok(a.pending()['mal-21'], 'failed uploads must stay queued');
  failWrite = false;
  await a.sync();
  assert.equal(Object.keys(a.pending()).length, 0);
  assert.equal(rows.get('user-a:mal-21').payload.title, 'One Piece');
  a.commit([item('Changed once')]);
  let release;
  holdWrite = new Promise(resolve => { release = resolve; });
  const started = new Promise(resolve => { startedWrite = resolve; });
  const syncing = a.sync();
  await started;
  a.commit([item('Changed while uploading')]);
  release();
  await syncing;
  assert.equal(a.read()[0].title, 'Changed while uploading');
  assert.ok(a.pending()['mal-21'], 'a newer edit must not be cleared by an earlier upload');
  await a.sync();
  assert.equal(rows.get('user-a:mal-21').payload.title, 'Changed while uploading');
  a.commit([]);
  await a.sync();
  assert.equal(rows.get('user-a:mal-21').deleted, true);
  assert.equal(a.read().length, 0, 'a tombstone must not resurrect a deleted entry');
  activeUser = 'user-b';
  await assert.rejects(a.sync(), /บัญชีเปลี่ยนแล้ว/);
  rows.set('user-b:bad', { owner_id: 'user-b', entry_id: 'bad', deleted: false, payload: {} });
  const validated = new Store('user-b', value => typeof value.title === 'string');
  await assert.rejects(validated.sync(), /ข้อมูลคลังออนไลน์ไม่ถูกต้อง/);
  assert.equal(validated.read().length, 0);
  console.log('PASS: account isolation, durable outbox, retry, concurrent edits, delete tombstones, identity switch, cloud validation');
})().catch(error => { console.error(error); process.exitCode = 1; });
