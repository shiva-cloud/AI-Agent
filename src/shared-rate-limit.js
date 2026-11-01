import { DatabaseSync } from 'node:sqlite';
import { createHmac } from 'node:crypto';

// Same-host processes only: SQLite WAL databases must not reside on network shares.
export function openSharedRateLimits(path, { key, clock = Date.now } = {}) {
  if (typeof path !== 'string' || !path.trim() || !Buffer.isBuffer(key) || key.length !== 32 || typeof clock !== 'function') {
    throw new Error('Invalid shared quota configuration');
  }
  const secret = Buffer.from(key);
  const keyId = createHmac('sha256', secret).update('northstar-quota-key-v1').digest('hex');
  const db = new DatabaseSync(path, { timeout: 100 });
  try {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
    if (tables.some(row => !['quota_meta', 'quota_rules', 'quota_clients'].includes(row.name))) throw new Error('Use a separate quota database');
    if (tables.length) {
      const rows = db.prepare('SELECT version,key_id FROM quota_meta').all();
      if (rows.length !== 1 || rows[0].version !== 1 || rows[0].key_id !== keyId) throw new Error('Incompatible quota database');
    } else {
      db.exec(`PRAGMA journal_mode=WAL;
        CREATE TABLE IF NOT EXISTS quota_meta(version INTEGER PRIMARY KEY, key_id TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS quota_rules(family TEXT PRIMARY KEY, quota INTEGER, window_ms INTEGER, capacity INTEGER);
        CREATE TABLE IF NOT EXISTS quota_clients(family TEXT, identity TEXT, expires INTEGER, count INTEGER, PRIMARY KEY(family,identity));
        CREATE INDEX IF NOT EXISTS quota_expiry ON quota_clients(family,expires);`);
      db.prepare('INSERT OR IGNORE INTO quota_meta VALUES(1,?)').run(keyId);
    }
    // Recheck after initialization in case another process initialized concurrently.
    if (db.prepare('SELECT key_id FROM quota_meta WHERE version=1').get().key_id !== keyId) throw new Error('Incompatible quota database');
  } catch (error) { db.close(); secret.fill(0); throw error; }
  return {
    close() { db.close(); secret.fill(0); },
    checkReady() { db.prepare('SELECT version FROM quota_meta').get(); },
    createLimiter(family, { limit, windowMs, maxClients = 10000 }) {
      if (!['v1', 'tools', 'admin', 'static'].includes(family) || !Number.isSafeInteger(limit) || limit < 1 || limit >= Number.MAX_SAFE_INTEGER ||
          !Number.isSafeInteger(windowMs) || windowMs < 1 || windowMs > 86400000 || !Number.isSafeInteger(maxClients) || maxClients < 1 || maxClients > 100000) {
        throw new Error('Invalid shared quota rule');
      }
      db.prepare('INSERT OR IGNORE INTO quota_rules VALUES(?,?,?,?)').run(family, limit, windowMs, maxClients);
      const rule = db.prepare('SELECT * FROM quota_rules WHERE family=?').get(family);
      if (rule.quota !== limit || rule.window_ms !== windowMs || rule.capacity !== maxClients) throw new Error('Conflicting shared quota rule');
      return identity => {
        if (typeof identity !== 'string' || identity.length > 256) throw new Error('Invalid quota identity');
        const now = clock();
        if (!Number.isSafeInteger(now) || now < 0 || !Number.isSafeInteger(now + windowMs)) throw new Error('Invalid quota clock');
        const hash = createHmac('sha256', secret).update(family).update('\0').update(identity).digest('hex');
        db.exec('BEGIN IMMEDIATE');
        try {
          db.prepare('DELETE FROM quota_clients WHERE family=? AND expires<=?').run(family, now);
          const row = db.prepare('SELECT expires,count FROM quota_clients WHERE family=? AND identity=?').get(family, hash);
          let result;
          if (row) {
            const count = Math.min(limit + 1, row.count + 1);
            db.prepare('UPDATE quota_clients SET count=? WHERE family=? AND identity=?').run(count, family, hash);
            result = { allowed: count <= limit, retryAfterSeconds: Math.max(1, Math.ceil((row.expires - now) / 1000)) };
          } else if (db.prepare('SELECT count(*) n FROM quota_clients WHERE family=?').get(family).n >= maxClients) {
            result = { allowed: false, retryAfterSeconds: 1 };
          } else {
            db.prepare('INSERT INTO quota_clients VALUES(?,?,?,1)').run(family, hash, now + windowMs);
            result = { allowed: true, retryAfterSeconds: Math.max(1, Math.ceil(windowMs / 1000)) };
          }
          db.exec('COMMIT');
          return result;
        } catch (error) { db.exec('ROLLBACK'); throw error; }
      };
    }
  };
}
