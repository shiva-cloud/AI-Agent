// Audit Rollback CLI Tool (Rec 104)
// Reverts a specific statutory record to an earlier version based on the immutable audit log.

import { openStore } from '../src/store.js';

export function executeAuditRollback(dbPath, recordId, auditId) {
  const store = openStore(dbPath);
  try {
    const restored = store.rollbackAudit(recordId, auditId);
    return {
      success: true,
      recordId,
      auditId,
      restoredStatus: restored.status,
      restoredTitle: restored.title
    };
  } finally {
    store.db.close();
  }
}

if (process.argv[1] && process.argv[1].endsWith('audit-rollback.js')) {
  const [, , dbPath, recordId, auditId] = process.argv;
  if (!dbPath || !recordId || !auditId) {
    console.error('Usage: node scripts/audit-rollback.js <dbPath> <recordId> <auditId>');
    process.exit(1);
  }
  try {
    const res = executeAuditRollback(dbPath, recordId, parseInt(auditId, 10));
    console.log(JSON.stringify(res, null, 2));
  } catch (err) {
    console.error('Rollback failed:', err.message);
    process.exit(1);
  }
}
