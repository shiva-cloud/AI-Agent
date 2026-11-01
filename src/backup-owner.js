import { DatabaseSync } from 'node:sqlite';
import { existsSync, lstatSync, mkdirSync, realpathSync } from 'node:fs';
import { join } from 'node:path';

// A transaction held for the owner's lifetime: OS process exit releases the lock.
// This avoids time-based lease expiry while a long backup is still running.
export function acquireBackupOwner(rootPath) {
  mkdirSync(rootPath, { recursive: true });
  const root = realpathSync(rootPath), file = join(root, '.backup-owner.sqlite');
  if (existsSync(file)) {
    const stat = lstatSync(file);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.nlink !== 1) throw new Error('Unsafe backup ownership file');
  }
  const db = new DatabaseSync(file, { timeout: 0 });
  try {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
    if (tables.some(row => row.name !== 'backup_owner_meta')) throw new Error('Incompatible backup ownership database');
    if (tables.length) {
      const versions = db.prepare('SELECT version FROM backup_owner_meta').all();
      if (versions.length !== 1 || versions[0].version !== 1) throw new Error('Incompatible backup ownership database');
    }
    // Initialization itself is serialized; no migration or stale-lock deletion.
    db.exec('BEGIN IMMEDIATE');
    db.exec('CREATE TABLE IF NOT EXISTS backup_owner_meta(version INTEGER PRIMARY KEY); INSERT OR IGNORE INTO backup_owner_meta VALUES(1);');
    let released = false;
    return {
      root,
      release() {
        if (released) return;
        released = true;
        try { db.exec('COMMIT'); } finally { db.close(); }
      }
    };
  } catch (error) { db.close(); throw error; }
}
