// Knowledge-base corrections for 6 November 2026, batch f: withheld records rewritten in
// the words of their own official pages. Their quotes were paraphrases that do not appear
// on those pages and their summaries carried figures the pages do not state, so the
// publication gate could never pass them.
//
// Each summary below is sentences taken from the record's own official page; only stray
// spaces before punctuation were removed. Each quote is word for word on that page. Titles
// keep only the name of the authority, because the old titles repeated claims nothing here
// verifies. Candidates were built by script and each was read by Claude, on the repository
// owner's instruction of 6 November 2026 to proofread and correct them, in place of the
// owner's own review. This is not legal review. No person checked these texts. The audit
// rows say so.
//
//   node scripts/kb-corrections-2026-11-06-f.js [--db path]            dry run (no writes)
//   node scripts/kb-corrections-2026-11-06-f.js --apply [--db path]    back up, then apply
//
// Publishing is a separate step: scripts/kb-verify-publish.js re-fetches each page and
// publishes only what passes. Records that fail stay withheld with the corrected text.
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { configureEnglishDatabase } from '../src/migrations.js';
import { applyToSeedFiles } from './kb-corrections-2026-11-06-e.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const AUDIT_ID = 'kb-audit-2026-11-06-f';
const CHECKED_AT = '2026-11-06';
const REVIEWER = 'KB audit 2026-11-06-f (owner-delegated revision read by Claude, automated script, not editorial review)';

export const REVISIONS = JSON.parse(readFileSync(new URL('./kb-corrections-2026-11-06-f.json', import.meta.url), 'utf8'));

export function planRevisions(rows) {
  const byId = new Map(rows.map(row => [row.id, row]));
  const plan = [], problems = [];
  for (const revision of REVISIONS) {
    const old = byId.get(revision.id);
    if (!old) { problems.push(`${revision.id}: not in database`); continue; }
    if (old.title === revision.title && old.quote === revision.quote && old.summary === revision.summary) continue;
    const note = `Rewritten from the record's own official page (${revision.url}); summary sentences and quote are the page's words, title reduced to the authority's name.`;
    plan.push({
      id: revision.id, old, kind: 'correct', note,
      next: {...old, title: revision.title, quote: revision.quote, summary: revision.summary, checkedAt: CHECKED_AT,
        reviewBasis: `Corrected in the ${AUDIT_ID}: ${note} Read by Claude on the repository owner's instruction of 2026-11-06. Not legal or editorial review.`},
      edits: [[{field: 'title'}, old.title, revision.title], [{field: 'quote'}, old.quote, revision.quote], [{field: 'summary'}, old.summary, revision.summary]]
    });
  }
  return {plan, problems};
}

export function run({dbPath = join(root, 'data', 'settlement.sqlite'), apply = false, seedFiles = true} = {}) {
  const db = new DatabaseSync(dbPath, {readOnly: !apply});
  const rows = db.prepare('SELECT body FROM records').all().map(row => JSON.parse(row.body));
  const {plan, problems} = planRevisions(rows);
  const summary = {revisions: REVISIONS.length, toApply: plan.length, problems};
  if (!apply) { db.close(); return {...summary, seed: seedFiles ? applyToSeedFiles(plan, false) : [], applied: false}; }
  if (problems.length) { db.close(); throw new Error(`Refusing to apply: ${problems.join('; ')}`); }
  const backupDir = join(dirname(dbPath), 'backups'); mkdirSync(backupDir, {recursive: true});
  let backup = join(backupDir, `settlement-before-${AUDIT_ID}.sqlite`);
  if (existsSync(backup)) backup = join(backupDir, `settlement-before-${AUDIT_ID}-${Date.now()}.sqlite`);
  db.exec(`VACUUM INTO '${backup.replaceAll("'", "''")}'`);
  configureEnglishDatabase(db);
  const at = new Date().toISOString();
  db.exec('BEGIN');
  try {
    const update = db.prepare('UPDATE records SET body=? WHERE id=?');
    const delFts = db.prepare('DELETE FROM records_fts WHERE id=?');
    const insFts = db.prepare('INSERT INTO records_fts(id, title, summary, quote, topic) VALUES (?,?,?,?,?)');
    const insAudit = db.prepare('INSERT INTO audits(record_id,previous,next,reviewer,note,at,prev_hash,hash) VALUES (?,?,?,?,?,?,?,?)');
    for (const p of plan) {
      const previous = JSON.stringify(p.old), next = JSON.stringify(p.next);
      const prevHash = db.prepare('SELECT hash FROM audits ORDER BY id DESC LIMIT 1').get()?.hash || '0'.repeat(64);
      const hash = createHash('sha256').update(`${prevHash}|${p.id}|${p.kind}|${REVIEWER}|${at}|${previous}|${next}`).digest('hex');
      update.run(next, p.id);
      try { delFts.run(p.id); insFts.run(p.id, p.next.title, p.next.summary, p.next.quote, p.next.topic); } catch { /* the index rebuilds from records */ }
      insAudit.run(p.id, previous, next, REVIEWER, p.note.slice(0, 1000), at, prevHash, hash);
    }
    db.exec('COMMIT');
  } catch (error) { db.exec('ROLLBACK'); db.close(); throw error; }
  db.close();
  return {...summary, seed: seedFiles ? applyToSeedFiles(plan, true) : [], applied: true, backup};
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const args = process.argv.slice(2), dbFlag = args.indexOf('--db');
  const result = run({apply: args.includes('--apply'), ...(dbFlag >= 0 ? {dbPath: args[dbFlag + 1], seedFiles: false} : {})});
  console.log(JSON.stringify(result, null, 2));
  if (result.problems.length) process.exitCode = 1;
}
