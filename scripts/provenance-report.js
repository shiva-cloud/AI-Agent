// Provenance completeness report (read-only).
// Answers two questions the publication gate depends on:
//   1. Does every editorial_review stamp have an audited approve decision?
//   2. Which published records still lack snapshot provenance?
//   node scripts/provenance-report.js [--db path]
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dbPath = process.argv.includes('--db')
  ? process.argv[process.argv.indexOf('--db') + 1]
  : join(root, 'data', 'settlement.sqlite');
const db = new DatabaseSync(dbPath, { readOnly: true });

const recs = db.prepare('SELECT id, body FROM records').all()
  .map(r => { try { return { id: r.id, ...JSON.parse(r.body) }; } catch { return null; } })
  .filter(Boolean);
const audited = new Set(db.prepare("SELECT DISTINCT record_id FROM audits WHERE note IS NOT NULL AND reviewer IS NOT NULL").all().map(r => r.record_id));
const publications = new Set(db.prepare(`SELECT p.record_id FROM publications p
  JOIN snapshots s ON s.id=p.snapshot_id
  JOIN candidate_decisions d ON d.candidate_id=p.candidate_id AND d.decision='approve'`).all().map(r => r.record_id));

const approvedHigh = recs.filter(r => r.status === 'approved' && r.risk === 'high');
const editorial = approvedHigh.filter(r => r.reviewMethod === 'editorial_review');
const sourceVerified = approvedHigh.filter(r => r.reviewMethod === 'source_verified');
const bulk = approvedHigh.filter(r => r.reviewMethod !== 'editorial_review' && r.reviewMethod !== 'source_verified');

const report = {
  db: dbPath,
  generatedAt: new Date().toISOString(),
  totals: {
    records: recs.length,
    approvedHighRisk: approvedHigh.length,
    editorialReview: editorial.length,
    sourceVerified: sourceVerified.length,
    bulkApprovedWithheld: bulk.length
  },
  findings: {
    // An editorial stamp without any audit row cannot be traced to a reviewer.
    editorialStampWithoutAudit: editorial.filter(r => !audited.has(r.id)).map(r => r.id),
    // Reviewed records that still lack an archived snapshot (publication backfill queue).
    editorialReviewWithoutSnapshot: editorial.filter(r => !r.snapshotId).length,
    editorialReviewWithoutSnapshotIds: editorial.filter(r => !r.snapshotId).slice(0, 25).map(r => r.id),
    // A source_verified stamp is only valid with its publication chain.
    sourceVerifiedWithoutPublication: sourceVerified.filter(r => !publications.has(r.id)).map(r => r.id),
    // Bulk-approved records waiting for either review path.
    bulkQueueByTopic: Object.fromEntries([...bulk.reduce((m, r) => m.set(r.topic, (m.get(r.topic) || 0) + 1), new Map())].sort((a, b) => b[1] - a[1]))
  }
};
console.log(JSON.stringify(report, null, 2));
db.close();
