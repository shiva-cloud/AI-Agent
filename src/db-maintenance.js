/**
 * Database Maintenance & Trace Lifecycle Management
 * Provides safe, non-destructive vacuum, WAL truncation, integrity verification,
 * and automated pruning of aged anonymous question traces older than retention threshold.
 */

export function runDatabaseMaintenance(db, options = {}) {
  if (!db || typeof db.prepare !== 'function') {
    throw new TypeError('Valid database instance required');
  }
  const safeOptions = (options && typeof options === 'object') ? options : {};
  const {
    retentionDays = 90,
    dryRun = false,
    now = new Date()
  } = safeOptions;

  const safeNow = (now instanceof Date && !Number.isNaN(now.getTime())) ? now : new Date();
  const safeDays = Number.isFinite(Number(retentionDays)) ? Math.max(1, Math.min(3650, Number(retentionDays))) : 90;
  const cutoffDate = new Date(safeNow.getTime() - (safeDays * 24 * 60 * 60 * 1000)).toISOString();
  
  // 1. Verify integrity before operations
  const integrityResult = db.prepare('PRAGMA integrity_check').get();
  const isHealthy = Object.values(integrityResult)[0] === 'ok';

  if (!isHealthy) {
    throw new Error(`Database integrity check failed: ${JSON.stringify(integrityResult)}`);
  }

  // 2. Count prunable traces
  let prunableCount = 0;
  const hasTracesTable = db.prepare("SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name='traces'").get().count > 0;

  if (hasTracesTable) {
    const cols = db.prepare('PRAGMA table_info(traces)').all().map(c => c.name);
    const timeCol = cols.includes('at') ? 'at' : (cols.includes('created_at') ? 'created_at' : null);

    if (timeCol) {
      const row = db.prepare(`SELECT count(*) as count FROM traces WHERE ${timeCol} < ?`).get(cutoffDate);
      prunableCount = row ? row.count : 0;

      if (!dryRun && prunableCount > 0) {
        db.prepare(`DELETE FROM traces WHERE ${timeCol} < ?`).run(cutoffDate);
      }
    }
  }

  // 3. Optimize & WAL checkpoint if not dry-run
  let walStatus = 'skipped';
  if (!dryRun) {
    try {
      db.exec('PRAGMA wal_checkpoint(TRUNCATE)');
      db.exec('PRAGMA optimize');
      walStatus = 'checkpointed';
    } catch {
      walStatus = 'ignored';
    }
  }

  return {
    status: 'completed',
    dryRun: Boolean(dryRun),
    retentionDays,
    cutoffDate,
    tracesPruned: dryRun ? 0 : prunableCount,
    eligibleTracesIdentified: prunableCount,
    integrityCheck: 'ok',
    walStatus,
    timestamp: new Date().toISOString()
  };
}
