// Jurisdiction naming normalization, 3 November 2026.
// Five evidence records carried an ISO-2 country code as their jurisdiction
// (US, GB, AU, DE) because the real-time monitor channels store country codes
// and src/realtime-extractor.js passed them straight into the record. The
// knowledge-base convention keeps codes inside the Canada layer (CA/ON/BC and
// city names) and uses full country names everywhere else, so the field is
// rewritten to the country name. Everything else about the record (status,
// review fields, quote and summary content) is untouched. Each update appends
// a hash-chained audit row the same way store.review() and the KB corrections
// script do, refreshes the full-text index, and syncs the generator/seed file
// that defines the record so a rebuilt database does not bring the code back.
//
//   node scripts/jurisdiction-normalize-2026-11-03.js            dry run (no writes)
//   node scripts/jurisdiction-normalize-2026-11-03.js --apply    back up, then apply
import { DatabaseSync } from 'node:sqlite';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { configureEnglishDatabase } from '../src/migrations.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const AUDIT_ID = 'jurisdiction-normalize-2026-11-03';
const REVIEWER = 'Jurisdiction naming normalization 2026-11-03 (automated correction, not editorial review)';
// Codes the real-time registry uses for monitored destination countries.
// CA is deliberately absent: the Canada layer is code-based by convention
// (CA-federal, provinces, cities), so CA stays as it is.
const CODE_JURISDICTIONS = {
  US: 'United States',
  GB: 'United Kingdom',
  AU: 'Australia',
  DE: 'Germany',
  AE: 'United Arab Emirates'
};

export function planJurisdictions(rows) {
  const plan = [];
  for (const old of rows) {
    const name = CODE_JURISDICTIONS[old.jurisdiction];
    if (!name) continue;
    plan.push({
      id: old.id,
      old,
      next: { ...old, jurisdiction: name },
      note: `Jurisdiction "${old.jurisdiction}" normalized to "${name}"; the knowledge-base convention uses full country names outside the Canada code layer (CA/ON/BC). Automated correction of a naming field only, not an editorial review.`,
      from: old.jurisdiction,
      to: name
    });
  }
  return plan;
}

// Sync the jurisdiction line inside generator/seed files that define a planned
// record, so re-running the generator cannot resurrect the code. Only the
// object block that carries the record id is edited.
export function applyToSeedFiles(plan, write) {
  const report = [];
  const files = [
    'scripts/inject-real-world-and-gap-records.js',
    'src/knowledge.js',
    'src/kyc-records.js',
    'src/global-records.js',
    'src/insider-immigration-records.js',
    'src/technical-immigration-records.js'
  ];
  const edited = new Set();
  for (const p of plan) {
    const from = `jurisdiction: '${p.from}'`;
    const to = `jurisdiction: '${p.to}'`;
    for (const file of files) {
      if (edited.has(`${file}:${p.id}`)) continue;
      const path = join(root, file);
      if (!existsSync(path)) continue;
      const text = readFileSync(path, 'utf8');
      const idAt = text.indexOf(`'${p.id}'`);
      if (idAt === -1) continue;
      // The jurisdiction line of this record sits within its own object block;
      // search a bounded window after the id instead of the whole file.
      const blockStart = text.lastIndexOf('{', idAt);
      const blockEnd = text.indexOf('\n  },', idAt);
      const block = text.slice(blockStart, blockEnd === -1 ? text.indexOf(`'${p.id}'`) + 2000 : blockEnd);
      if (!block.includes(from)) { report.push(`${file} ${p.id}: id found but no ${from} line to sync`); continue; }
      if (block.includes(to)) continue; // already synced
      const nextBlock = block.replace(from, to);
      if (write) writeFileSync(path, text.replace(block, nextBlock));
      edited.add(`${file}:${p.id}`);
      report.push(`${file} ${p.id}: jurisdiction ${p.from} -> ${p.to}${write ? '' : ' (dry run)'}`);
    }
  }
  return report;
}

// Backups are about the size of the database, so only the original pre-run
// copy and the newest 2 later copies are kept.
const KEEP_RECENT_BACKUPS = 2;
export function pruneBackups(backupDir) {
  const original = `settlement-before-${AUDIT_ID}.sqlite`;
  const later = readdirSync(backupDir)
    .filter(name => name.startsWith(`settlement-before-${AUDIT_ID}-`) && name.endsWith('.sqlite'))
    .sort((a, b) => Number(b.match(/-(\d+)\.sqlite$/)?.[1] ?? 0) - Number(a.match(/-(\d+)\.sqlite$/)?.[1] ?? 0));
  const removed = later.slice(KEEP_RECENT_BACKUPS);
  for (const name of removed) rmSync(join(backupDir, name), { force: true });
  return { kept: [original, ...later.slice(0, KEEP_RECENT_BACKUPS)], removed };
}

export function run({ dbPath = join(root, 'data', 'settlement.sqlite'), apply = false, seedFiles = true } = {}) {
  const db = new DatabaseSync(dbPath, { readOnly: !apply });
  const rows = db.prepare('SELECT body FROM records').all().map(r => JSON.parse(r.body));
  const plan = planJurisdictions(rows);
  const summary = { planned: plan.length, moves: plan.map(p => ({ id: p.id, from: p.from, to: p.to, summaryLength: (p.next.summary || '').length })) };
  if (!apply) { db.close(); return { ...summary, seedSync: seedFiles ? applyToSeedFiles(plan, false) : [], applied: false, backup: null, problems: [] }; }
  if (!plan.length) { db.close(); return { ...summary, seedSync: [], applied: false, backup: null, problems: [] }; }

  const backupDir = join(dirname(dbPath), 'backups'); mkdirSync(backupDir, { recursive: true });
  let backup = join(backupDir, `settlement-before-${AUDIT_ID}.sqlite`);
  if (existsSync(backup)) backup = join(backupDir, `settlement-before-${AUDIT_ID}-${Date.now()}.sqlite`);
  db.exec(`VACUUM INTO '${backup.replaceAll("'", "''")}'`);
  pruneBackups(backupDir);
  // The records triggers call english_record(); register it as the store does.
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
      const hash = createHash('sha256').update(`${prevHash}|${p.id}|jurisdiction|${REVIEWER}|${at}|${previous}|${next}`).digest('hex');
      update.run(next, p.id);
      try { delFts.run(p.id); insFts.run(p.id, p.next.title || '', p.next.summary || '', p.next.quote || '', p.next.topic || ''); } catch {}
      insAudit.run(p.id, previous, next, REVIEWER, p.note.slice(0, 1000), at, prevHash, hash);
    }
    db.exec('COMMIT');
  } catch (e) { db.exec('ROLLBACK'); db.close(); throw e; }
  db.close();
  const seedSync = seedFiles ? applyToSeedFiles(plan, true) : [];
  return { ...summary, seedSync, applied: true, backup, problems: [] };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const result = run({ apply: process.argv.includes('--apply') });
  console.log(JSON.stringify(result, null, 2));
  if (result.problems.length) process.exitCode = 1;
}
