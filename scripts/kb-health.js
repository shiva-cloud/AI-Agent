// Knowledge-base health check: one command that shows what needs attention,
// without changing anything.
//
//   npm run kb:health            readable report
//   npm run kb:health -- --json  machine-readable report
//
// Blocking problems (exit code 1): records that break the quality rules in
// src/kb-quality.js, glossary entries with filler or missing languages.
// Warnings (exit code 0): facts in src/kb-facts.js past their review date,
// expired or soon-expiring records, seed files out of sync with the database,
// approved records that were never editorially reviewed.
import {publicEvidence} from '../src/public-evidence.js';
import { DatabaseSync } from 'node:sqlite';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkRecords, recordWarnings, FILLER_PATTERNS } from '../src/kb-quality.js';
import { factsDueForReview, KB_FACTS } from '../src/kb-facts.js';
import { SETTLEMENT_GLOSSARY_500 } from '../src/settlement-glossary-500.js';
import { seeds } from '../src/knowledge.js';
import { kycRecords } from '../src/kyc-records.js';
import { globalRecords } from '../src/global-records.js';
import { insiderImmigrationRecords } from '../src/insider-immigration-records.js';
import { technicalImmigrationRecords } from '../src/technical-immigration-records.js';
import { loadProgress, reviewStatus } from './kb-review-queue.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const GLOSSARY_LANGS = ['en', 'hi', 'pa', 'es', 'fr', 'ar'];

export function seedRecords() {
  return [...seeds, ...kycRecords, ...globalRecords, ...insiderImmigrationRecords, ...technicalImmigrationRecords];
}

export function glossaryIssues(terms = SETTLEMENT_GLOSSARY_500) {
  const issues = [];
  for (const t of terms) {
    for (const l of GLOSSARY_LANGS) {
      if (!t[`term_${l}`]?.trim() || !t[`def_${l}`]?.trim()) issues.push({ id: t.id, problem: `missing ${l} translation` });
      else if (FILLER_PATTERNS.some(p => p.test(t[`def_${l}`]))) issues.push({ id: t.id, problem: `filler definition (${l})` });
    }
  }
  return issues;
}

export function healthReport({ dbPath = join(root, 'data', 'settlement.sqlite'), today = new Date().toISOString().slice(0, 10) } = {}) {
  const seed = seedRecords();
  const report = {
    date: today,
    blocking: { seedRecords: checkRecords(seed), glossary: glossaryIssues() },
    warnings: { factsDue: factsDueForReview(today), expired: [], expiringSoon: [], driftFromSeed: [], notEditoriallyReviewed: 0 },
    counts: { seedRecords: seed.length, glossaryTerms: SETTLEMENT_GLOSSARY_500.length, facts: Object.keys(KB_FACTS).length, databaseRecords: null }
  };
  if (existsSync(dbPath)) {
    const db = new DatabaseSync(dbPath, { readOnly: true, timeout: 3000 });
    let rows;
    try {
      db.exec('BEGIN');
      rows = db.prepare('SELECT body FROM records').all().map(r => JSON.parse(r.body));
      const visible=publicEvidence(db,rows);
      report.withheldApprovedRecords=rows.filter((row,i)=>row.status==='approved'&&visible[i].status!=='approved').map(row=>row.id);
      db.exec('COMMIT');
    } finally { db.close(); }
    report.counts.databaseRecords = rows.length;
    report.blocking.databaseRecords = checkRecords(rows.filter(r => r.status !== 'rejected'));
    report.reviewProgress = reviewStatus(rows, loadProgress());
    const byId = new Map(rows.map(r => [r.id, r]));
    for (const r of rows) {
      const w = recordWarnings(r, today);
      if (w.includes('expired')) report.warnings.expired.push(r.id);
      if (w.some(x => x.startsWith('expires in'))) report.warnings.expiringSoon.push(r.id);
      if (w.includes('approved without editorial review')) report.warnings.notEditoriallyReviewed++;
    }
    for (const s of seed) {
      const d = byId.get(s.id);
      if (!d) report.warnings.driftFromSeed.push({ id: s.id, problem: 'in seed file, not in database' });
      else if (d.summary !== s.summary) report.warnings.driftFromSeed.push({ id: s.id, problem: 'summary differs between seed file and database' });
    }
  }
  const blockingCount = Object.values(report.blocking).reduce((n, list) => n + list.length, 0);
  report.ok = blockingCount === 0;
  report.technicalHealth=report.ok?'passed':'failed';
  report.publicationReadiness={ready:report.ok&&report.counts.databaseRecords!==null&&report.warnings.notEditoriallyReviewed===0&&(report.withheldApprovedRecords||[]).length===0&&report.warnings.factsDue.length===0&&report.warnings.expired.length===0,unreviewedRecords:report.warnings.notEditoriallyReviewed};
  return report;
}

function printReport(r) {
  const line = (label, list, show = 8) => {
    console.log(`${label}: ${Array.isArray(list) ? list.length : list}`);
    if (Array.isArray(list)) for (const item of list.slice(0, show)) console.log(`  - ${typeof item === 'string' ? item : `${item.id || item.key}: ${item.problem || `review by ${item.reviewBy} (${item.source})`}`}`);
  };
  console.log(`Knowledge-base health, ${r.date}`);
  console.log(`Publication readiness: ${r.publicationReadiness.ready ? 'READY' : 'NOT READY'} (${r.publicationReadiness.unreviewedRecords} records need editorial review)`);
  console.log(`Records: ${r.counts.seedRecords} in seed files, ${r.counts.databaseRecords ?? 'no'} in the database; glossary terms: ${r.counts.glossaryTerms}; tracked facts: ${r.counts.facts}`);
  console.log('\nBlocking (must be fixed):');
  line('  Seed record problems', r.blocking.seedRecords);
  if (r.blocking.databaseRecords) line('  Database record problems', r.blocking.databaseRecords);
  line('  Glossary problems', r.blocking.glossary);
  console.log('\nWarnings (needs attention):');
  line('  Facts past their review date (update src/kb-facts.js)', r.warnings.factsDue);
  line('  Expired records', r.warnings.expired);
  line('  Records expiring within 14 days', r.warnings.expiringSoon);
  line('  Seed files out of sync with the database', r.warnings.driftFromSeed);
  line('  Approved without editorial review', r.warnings.notEditoriallyReviewed);
  if (r.reviewProgress) {
    const p = r.reviewProgress;
    console.log(`  Scheduled fact-check progress: ${p.checked} of ${p.total} done (${p.verified} verified, ${p.corrected} corrected, ${p['needs-human']} need a person), ${p.remaining} left`);
  }
  console.log(`\n${r.ok ? 'OK: no blocking problems.' : 'FAIL: fix the blocking problems above.'}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  let report;
  try {report=healthReport();}catch(error){console.error(JSON.stringify({ok:false,technicalHealth:'unavailable',publicationReadiness:{ready:false},code:error.errcode===5||error.errcode===6?'storage_busy':'health_check_failed'}));process.exitCode=1;}
  if(report){
  if (process.argv.includes('--json')) console.log(JSON.stringify(report, null, 2));
  else printReport(report);
  process.exitCode = (process.argv.includes('--publication-ready')?report.publicationReadiness.ready:report.ok) ? 0 : 1;
  }
}
