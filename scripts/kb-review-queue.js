// Review queue for records that were approved without editorial review.
// Scheduled maintenance runs take a batch from here, fact-check it against
// official sources, and mark each record so the next run continues where the
// last one stopped. Progress is kept in data/kb-review-progress.json.
//
//   node scripts/kb-review-queue.js next 20          next records to check (JSON)
//   node scripts/kb-review-queue.js mark <id,...> verified|corrected|needs-human "note"
//   node scripts/kb-review-queue.js status           how many are done and left
//
// "verified" and "corrected" mean an automated fact-check against official
// sources, not editorial approval; the record's status is not changed here.
import { DatabaseSync } from 'node:sqlite';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const RESULTS = ['verified', 'corrected', 'needs-human'];

export function loadProgress(path = join(root, 'data', 'kb-review-progress.json')) {
  if (!existsSync(path)) return { records: {} };
  return JSON.parse(readFileSync(path, 'utf8'));
}

export function saveProgress(progress, path = join(root, 'data', 'kb-review-progress.json')) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(progress, null, 2));
}

function unreviewed(rows) {
  return rows.filter(r => r.status === 'approved' && r.reviewMethod !== 'editorial_review');
}

/** Next records to check: high risk first, then figures, then the oldest check date. */
export function nextBatch(rows, progress, size = 20) {
  const done = progress.records;
  const hasFigure = r => /\d/.test(r.summary || '');
  return unreviewed(rows)
    .filter(r => !done[r.id])
    .sort((a, b) => (a.risk === 'high' ? 0 : 1) - (b.risk === 'high' ? 0 : 1)
      || (hasFigure(a) ? 0 : 1) - (hasFigure(b) ? 0 : 1)
      || String(a.checkedAt).localeCompare(String(b.checkedAt))
      || a.id.localeCompare(b.id))
    .slice(0, size)
    .map(r => ({ id: r.id, jurisdiction: r.jurisdiction, title: r.title, url: r.url, checkedAt: r.checkedAt, summary: r.summary }));
}

export function markRecords(progress, ids, result, note = '', date = new Date().toISOString().slice(0, 10)) {
  if (!RESULTS.includes(result)) throw new Error(`result must be one of ${RESULTS.join(', ')}`);
  for (const id of ids) progress.records[id] = { result, date, note };
  return progress;
}

export function reviewStatus(rows, progress) {
  const pending = unreviewed(rows);
  const counts = { verified: 0, corrected: 0, 'needs-human': 0 };
  for (const r of pending) { const p = progress.records[r.id]; if (p) counts[p.result]++; }
  const checked = counts.verified + counts.corrected + counts['needs-human'];
  return { total: pending.length, checked, remaining: pending.length - checked, ...counts };
}

function readRows(dbPath = join(root, 'data', 'settlement.sqlite')) {
  const db = new DatabaseSync(dbPath, { readOnly: true });
  const rows = db.prepare('SELECT body FROM records').all().map(r => JSON.parse(r.body));
  db.close();
  return rows;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const [cmd, a, b, ...rest] = process.argv.slice(2);
  const progress = loadProgress();
  if (cmd === 'next') console.log(JSON.stringify(nextBatch(readRows(), progress, Number(a) || 20), null, 2));
  else if (cmd === 'mark') { saveProgress(markRecords(progress, String(a).split(',').filter(Boolean), b, rest.join(' '))); console.log(JSON.stringify(reviewStatus(readRows(), progress))); }
  else if (cmd === 'status') console.log(JSON.stringify(reviewStatus(readRows(), progress), null, 2));
  else { console.error('Usage: kb-review-queue.js next [n] | mark <ids> <verified|corrected|needs-human> [note] | status'); process.exitCode = 1; }
}
