/* Per-account cache plus a durable outbox. Supabase RLS is the data access boundary. */
(() => {
  class CloudLibrary {
    constructor(userId, validate = () => true) {
      this.userId = userId;
      this.validate = validate;
      this.key = 'jetabait-library-v2:' + userId;
      this.outboxKey = this.key + ':outbox';
      this.running = null;
    }
    read() { return JSON.parse(localStorage.getItem(this.key) || '[]'); }
    pending() { return JSON.parse(localStorage.getItem(this.outboxKey) || '{}'); }
    commit(next) {
      const before = this.read(), pending = this.pending(), oldPending = JSON.stringify(pending);
      const old = new Map(before.map(item => [item.id, item])), now = new Map(next.map(item => [item.id, item]));
      for (const [id, item] of now) if (JSON.stringify(old.get(id)) !== JSON.stringify(item)) {
        pending[id] = { payload: item, revision: crypto.randomUUID() };
      }
      for (const [id] of old) if (!now.has(id)) pending[id] = { payload: null, revision: crypto.randomUUID() };
      localStorage.setItem(this.outboxKey, JSON.stringify(pending));
      try { localStorage.setItem(this.key, JSON.stringify(next)); }
      catch (error) { localStorage.setItem(this.outboxKey, oldPending); throw error; }
    }
    async sync() {
      if (this.running) return this.running;
      this.running = this.performSync().finally(() => { this.running = null; });
      return this.running;
    }
    async performSync() {
      const db = await JetaAccount.database();
      const checkIdentity = () => { if (JetaAccount.state().user?.id !== this.userId) throw Error('บัญชีเปลี่ยนแล้ว'); };
      checkIdentity();
      const snapshot = this.pending(), writes = Object.entries(snapshot);
      // Retain deletions as tombstones so another device cannot resurrect deleted records.
      for (let offset = 0; offset < writes.length; offset += 100) {
        checkIdentity();
        const batch = writes.slice(offset, offset + 100);
        const { error } = await db.from('library_entries').upsert(batch.map(([id, entry]) => ({
          owner_id: this.userId, entry_id: id, payload: entry.payload, deleted: entry.payload === null
        })), { onConflict: 'owner_id,entry_id' });
        if (error) throw Error('ส่งข้อมูลออนไลน์ไม่สำเร็จ ข้อมูลยังอยู่ในเครื่อง');
        checkIdentity();
        const pending = this.pending();
        for (const [id, entry] of batch) if (pending[id]?.revision === entry.revision) delete pending[id];
        localStorage.setItem(this.outboxKey, JSON.stringify(pending));
      }
      const records = [];
      for (let offset = 0; ; offset += 500) {
        checkIdentity();
        const { data, error } = await db.from('library_entries').select('entry_id,payload,deleted')
          .eq('owner_id', this.userId).order('entry_id').range(offset, offset + 499);
        if (error) throw Error('โหลดคลังออนไลน์ไม่ได้ กรุณาลองใหม่');
        records.push(...data);
        if (data.length < 500) break;
      }
      checkIdentity();
      const merged = new Map(records.filter(row => !row.deleted && row.payload).map(row => [row.entry_id, row.payload]));
      // Changes made while requests were running stay queued and take precedence locally.
      for (const [id, entry] of Object.entries(this.pending())) {
        if (entry.payload) merged.set(id, entry.payload); else merged.delete(id);
      }
      const next = [...merged.values()];
      if (!next.every(this.validate)) throw Error('ข้อมูลคลังออนไลน์ไม่ถูกต้อง');
      localStorage.setItem(this.key, JSON.stringify(next));
      return next;
    }
  }
  window.JetaCloudLibrary = CloudLibrary;
})();
