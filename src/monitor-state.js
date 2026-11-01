import {DatabaseSync} from 'node:sqlite';
import {createHash} from 'node:crypto';

// Persistent last-delivered state for the queue and runtime monitors (B10).
// Stores only a monitor key and its state string, e.g. ["attention",["queue_wait_exceeded"]];
// keys are hashed so queue paths and server URLs are never written to disk.

export function monitorStateKey(kind, target) {
  if (!['queue', 'runtime'].includes(kind) || typeof target !== 'string' || !target) throw new Error('Invalid monitor state key');
  return `${kind}:${createHash('sha256').update(target).digest('hex').slice(0, 32)}`;
}

export function openMonitorState(path, {clock = Date.now} = {}) {
  if (typeof path !== 'string' || !path.trim()) throw new Error('An explicit monitor state path is required');
  const db = new DatabaseSync(path, {timeout: 100});
  try {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
    if (tables.some(row => row.name !== 'monitor_state')) throw new Error('Use a separate monitor state database');
    db.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS monitor_state(monitor TEXT PRIMARY KEY, state TEXT NOT NULL, updated_at INTEGER NOT NULL)');
  } catch (error) { db.close(); throw error; }
  return {
    close: () => db.close(),
    /** A {load, save} store for monitorTransitions. */
    forMonitor(key) {
      if (!/^(?:queue|runtime):[0-9a-f]{32}$/.test(key)) throw new Error('Invalid monitor state key');
      return {
        load: () => db.prepare('SELECT state FROM monitor_state WHERE monitor=?').get(key)?.state ?? null,
        save: state => {
          if (typeof state !== 'string' || state.length > 1024) throw new Error('Invalid monitor state');
          db.prepare('INSERT INTO monitor_state VALUES(?,?,?) ON CONFLICT(monitor) DO UPDATE SET state=excluded.state, updated_at=excluded.updated_at').run(key, state, clock());
        }
      };
    }
  };
}
