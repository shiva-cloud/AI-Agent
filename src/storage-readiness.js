// Probe write permission and lock acquisition without changing any record.
// An immediate lock attempt avoids blocking the event loop behind another writer.
export function checkStorageReadiness(db) {
  const timeout = db.prepare('PRAGMA busy_timeout').get().timeout;
  let began = false;
  try {
    db.exec('PRAGMA busy_timeout=0');
    db.prepare('SELECT 1 FROM records LIMIT 1').get();
    db.exec('BEGIN IMMEDIATE'); began = true;
    // BEGIN alone may succeed on a read-only connection. Preparing a write also
    // checks SQLite write restrictions; WHERE 0 changes no rows or audit data.
    db.exec('UPDATE traces SET id=id WHERE 0');
  } finally {
    try { if (began) db.exec('ROLLBACK'); }
    finally { db.exec(`PRAGMA busy_timeout=${timeout}`); }
  }
}
