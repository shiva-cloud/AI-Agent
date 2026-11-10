import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { createHash } from 'node:crypto';
import { publicEvidence, assessPublicEvidence } from '../src/public-evidence.js';
const db = new DatabaseSync(process.argv[2] || 'release/settlement.sqlite', { readOnly: true });
try {
  db.exec('BEGIN');
  const records = db.prepare('SELECT body FROM records ORDER BY id').all().map(row => JSON.parse(row.body));
  const evidenceDigest = createHash('sha256').update(JSON.stringify(publicEvidence(db, records))).digest('hex');
  const source = JSON.parse(readFileSync('evaluation/english-expanded.json', 'utf8'));
  mkdirSync('artifacts', { recursive: true });
  writeFileSync('artifacts/evaluation-review-template.json', JSON.stringify({
    version: 'release-review-draft', labelStatus: 'Unreviewed questions adapted from development fixtures. Replace with independently authored holdout questions.',
    author: 'Northstar development team', reviewer: '', reviewStatus: 'pending', reviewNote: '', reviewedAt: '',
    asOf: new Date().toISOString(), evidenceDigest,
    cases: source.cases.map(item => ({ id: item.id, question: item.question, input: item.input || {}, intents: [], city: null, status: '', reviewRationale: '', sourceUrls: [] }))
  }, null, 2));
  writeFileSync('artifacts/evidence-review-package.json', JSON.stringify({ evidenceDigest,
    records: assessPublicEvidence(db, records).filter(item => item.reasons.length || (item.record.status === 'approved' && item.record.reviewMethod !== 'editorial_review')).map(item => ({
      record: item.record, withholdingReasons: item.reasons,
      latestAudit: db.prepare('SELECT reviewer,note,at,next FROM audits WHERE record_id=? ORDER BY id DESC LIMIT 1').get(item.record.id) || null,
      archivedExcerpt: item.record.snapshotId ? db.prepare('SELECT content FROM snapshots WHERE id=?').get(item.record.snapshotId)?.content || null : null
    }))
  }, null, 2));
  console.log('Prepared evaluation template and evidence review package in artifacts/.');
} finally { db.close(); }
