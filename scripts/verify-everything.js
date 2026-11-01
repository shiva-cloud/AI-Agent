// Pre-flight: proves the core engine, migration and wording layers work
// before a server boot. Everything here runs on knowledge seeds and a
// throwaway legacy-shaped SQLite database built in the OS temp directory.
// The working data/settlement.sqlite is never opened by this script, and the
// temporary database is deleted afterwards. Any failure exits non-zero.
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { strict as assert } from 'node:assert';
import { seeds, topics, topicLabels, cities } from '../src/knowledge.js';
import { assertEnglishText } from '../src/language.js';
import { answer, coverage, coverageDetail } from '../src/engine.js';
import { reviewQueue } from '../src/review-queue.js';
import { lintEvidence } from '../src/evidence-policy.js';
import { configureEnglishDatabase } from '../src/migrations.js';
import { humanizeError, humanizeGap, GAP_LABELS } from '../public/errors.js';

const now = new Date('2026-10-28T23:59:59Z');
const checks = [];
const run = (check, fn) => {
  try { fn(); checks.push({ check, outcome: 'pass' }); }
  catch (e) { checks.push({ check, outcome: 'FAIL', detail: e.message }); }
};

// 1. Topic labels are complete, distinct and plain English.
run('topic labels cover every topic and stay English', () => {
  assert.deepEqual(Object.keys(topicLabels).sort(), [...topics].sort());
  assert.equal(new Set(Object.values(topicLabels)).size, topics.length);
  for (const label of Object.values(topicLabels)) assertEnglishText(label);
});

// 2. Engine smoke on the knowledge seeds: guidance stays cited and honest.
run('engine answers a seed question with cited claims and a verification roll-up', () => {
  const guidance = answer({ question: 'How do I apply for a SIN in Canada?' }, seeds, now);
  assert.equal(guidance.status, 'guidance');
  assert.ok(guidance.claims.length >= 1);
  assert.ok(guidance.claims[0].evidenceId);
  assert.ok(guidance.sources.some(s => s.url.startsWith('https://') && s.quote));
  assert.ok(guidance.verification.claimsTotal >= 1);
  assert.equal(guidance.verification.approvedClaims + guidance.verification.seedClaims, guidance.verification.claimsTotal);
});
run('engine answers outside its scope as unavailable with a stated reason', () => {
  const unavailable = answer({ question: 'A carefree afternoon walk in Toronto' }, seeds, now);
  assert.equal(unavailable.status, 'unavailable');
  assert.equal(unavailable.claims.length, 0);
  assert.ok(unavailable.gaps.length >= 1);
});

// 3. Coverage and the per-city detail sheet.
run('coverage reports four cities, thirteen topics each, English only', () => {
  const map = coverage(seeds, now);
  assert.deepEqual(map.map(c => c.city), Object.keys(cities));
  assert.ok(map.every(c => c.language === 'en' && c.topics.length === topics.length));
});
run('coverageDetail exposes one city sheet with its evidence and nothing foreign', () => {
  const detail = coverageDetail('Toronto', seeds, now);
  assert.equal(detail.city, 'Toronto');
  assert.equal(detail.region, 'ON');
  const sheet = detail.topics.find(t => t.topic === 'transit');
  assert.ok(sheet.evidence.length >= 1);
  assert.ok(sheet.evidence.every(ev => ev.url.startsWith('https://')));
  assert.ok(detail.topics.every(t => ['source_guidance', 'review_or_refresh_needed', 'missing'].includes(t.status)));
  assert.throws(() => coverageDetail('Calgary', seeds, now), /Unknown pilot city/);
});

// 4. Review queue and policy lint shapes on synthetic registries.
run('review queue returns asOf, counts and ranked rows without mutating records', () => {
  const before = JSON.stringify(seeds);
  const queue = reviewQueue(seeds, [], [], now);
  assert.equal(queue.rows.length, seeds.length);
  assert.ok(queue.rows.every(r => Number.isInteger(r.priority) && typeof r.reasonCode === 'string'));
  assert.equal(JSON.stringify(seeds), before);
});
run('policy lint reports zero warnings for a clean synthetic registry', () => {
  const report = lintEvidence([{ id: 'ok', policy: 'manual_permitted' }], [{ id: 'fresh', expiresAt: '2027-01-01', status: 'approved' }], now);
  assert.equal(report.count, 0);
  assert.deepEqual(report.warnings, []);
});

// 5. Browser wording module: still DOM-free and honest in node.
run('error and gap wording stays DOM-free, distinct and pass-through', () => {
  assert.equal(humanizeError({ status: 429, message: 'Please wait before trying again' }).title, 'Too many requests');
  assert.ok(!GAP_LABELS.awaiting_human_review.includes('expired'));
  assert.ok(!GAP_LABELS.stale.includes('review'));
  assert.equal(humanizeGap('totally_new_reason'), 'totally new reason');
});

// 6. Migration dry-run on a throwaway legacy-shaped database. This proves the
// English-only migration converts {en:...} records and installs triggers —
// without ever touching the working database.
const scratch = mkdtempSync(join(tmpdir(), 'northstar-preflight-'));
try {
  const db = new DatabaseSync(join(scratch, 'legacy.sqlite'));
  // The exact pre-migration schema the store used for its first release.
  db.exec(`CREATE TABLE records(id TEXT PRIMARY KEY, body TEXT NOT NULL);
    CREATE TABLE audits(id INTEGER PRIMARY KEY, record_id TEXT, previous TEXT, next TEXT, reviewer TEXT, note TEXT, at TEXT);
    CREATE TABLE traces(id TEXT PRIMARY KEY, body TEXT, at TEXT);
    CREATE TABLE gaps(id INTEGER PRIMARY KEY, trace_id TEXT, topic TEXT, reason TEXT, at TEXT);
    CREATE TABLE feedback(id INTEGER PRIMARY KEY, trace_id TEXT, issue TEXT, at TEXT);`);
  for (const seed of seeds) {
    const { summary, ...legacy } = seed;
    db.prepare('INSERT INTO records VALUES (?,?)').run(seed.id, JSON.stringify({ ...legacy, en: summary }));
  }
  configureEnglishDatabase(db);
  run('migration dry-run lifts legacy en summaries into summary on the copy', () => {
    const migrated = db.prepare('SELECT body FROM records WHERE id=?').get(seeds[0].id);
    const record = JSON.parse(migrated.body);
    assert.equal(record.summary, seeds.find(s => s.id === seeds[0].id).summary);
    assert.equal(record.language, 'en');
    assert.ok(!('en' in record) && !('hi' in record));
    assert.ok(db.prepare('SELECT version FROM schema_migrations WHERE version=1').get());
    assert.equal(db.prepare('PRAGMA quick_check').get().quick_check, 'ok');
  });
  run('migration dry-run installs English-only write guards on the copy', () => {
    const offender = { ...seeds[0], id: 'non-latin', summary: 'अंग्रेज़ी外的 summary' };
    assert.throws(() => db.prepare('INSERT INTO records VALUES (?,?)').run(offender.id, JSON.stringify(offender)), /English-only database policy violation/);
  });
  db.close();
} finally { rmSync(scratch, { recursive: true, force: true }); }

const failed = checks.filter(c => c.outcome !== 'pass');
console.log(JSON.stringify({
  preFlight: 'verify-everything', outcome: failed.length ? 'FAIL' : 'PASS',
  scope: 'Knowledge seeds, a throwaway legacy-shaped temp database and synthetic registries. The working database is never opened here.',
  checks
}, null, 2));
if (failed.length) process.exitCode = 1;
