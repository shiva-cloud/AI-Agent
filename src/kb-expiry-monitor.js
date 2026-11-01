/**
 * Northstar Knowledge Base Expiry & Scheduled Review Monitor (Rec 114)
 * Monitors KB records for impending statutory expiration and flags records
 * for mandatory editorial review 14 days prior to expiry.
 */

export function auditKbRecordExpiries(db, options = {}) {
  if (!db || typeof db.prepare !== 'function') throw new Error('Database instance with prepare() required');
  const safeOptions = (options && typeof options === 'object') ? options : {};
  const { referenceDate = new Date().toISOString().slice(0, 10), warningDays = 14 } = safeOptions;
  const rows = db.prepare('SELECT id, body FROM records').all();
  const refTime = new Date(referenceDate).getTime();
  const warningMs = warningDays * 24 * 60 * 60 * 1000;

  const expired = [];
  const impendingExpiry = [];
  const compliant = [];

  for (const row of rows) {
    let record;
    try {
      record = JSON.parse(row.body);
    } catch {
      continue;
    }

    if (!record.expiresAt) continue;

    const expireTime = new Date(record.expiresAt).getTime();
    const msRemaining = expireTime - refTime;
    const daysRemaining = Math.round(msRemaining / (24 * 60 * 60 * 1000));

    const item = {
      id: record.id,
      topic: record.topic,
      jurisdiction: record.jurisdiction,
      title: record.title,
      risk: record.risk || 'low',
      status: record.status,
      expiresAt: record.expiresAt,
      daysRemaining
    };

    if (daysRemaining < 0) {
      expired.push({ ...item, urgency: 'EXPIRED' });
    } else if (daysRemaining <= warningDays) {
      impendingExpiry.push({ ...item, urgency: 'EXPIRING_SOON' });
    } else {
      compliant.push(item);
    }
  }

  // Sort by urgency / least days remaining
  expired.sort((a, b) => a.daysRemaining - b.daysRemaining);
  impendingExpiry.sort((a, b) => a.daysRemaining - b.daysRemaining);

  return {
    referenceDate,
    warningThresholdDays: warningDays,
    totalRecordsAudited: rows.length,
    counts: {
      expiredCount: expired.length,
      impendingExpiryCount: impendingExpiry.length,
      compliantCount: compliant.length
    },
    actionRequired: expired.length > 0 || impendingExpiry.length > 0,
    expiredRecords: expired,
    impendingExpiryRecords: impendingExpiry,
    summary: `${expired.length} records expired; ${impendingExpiry.length} records require review within ${warningDays} days; ${compliant.length} records currently compliant.`
  };
}

/**
 * Flags impending expiries in the editorial review queue
 */
export function flagImpendingExpiriesInDb(db, options = {}) {
  if (!db || typeof db.prepare !== 'function') throw new Error('Database instance with prepare() required');
  const safeOptions = (options && typeof options === 'object') ? options : {};
  const audit = auditKbRecordExpiries(db, safeOptions);
  const flaggedIds = [];

  db.exec(`
    CREATE TABLE IF NOT EXISTS expiry_audit_flags (
      record_id TEXT PRIMARY KEY,
      topic TEXT,
      expires_at TEXT,
      days_remaining INTEGER,
      flagged_at TEXT
    );
  `);

  const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO expiry_audit_flags (record_id, topic, expires_at, days_remaining, flagged_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  const now = new Date().toISOString();
  db.exec('BEGIN IMMEDIATE');
  try {
    for (const record of audit.impendingExpiryRecords) {
      insertStmt.run(record.id, record.topic, record.expiresAt, record.daysRemaining, now);
      flaggedIds.push(record.id);
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  return {
    success: true,
    flaggedCount: flaggedIds.length,
    flaggedIds,
    audit
  };
}
