// Knowledge-base corrections for 6 November 2026, batch d: batch seventeen of
// the verify backlog - the first community-topic slice. A scoped dry
// verification of fifteen queue-ready community records measured their real
// blockers: seven quote-drift failures, six dead URLs whose archive fallback
// also finds no snapshot (relocation work), one archived page whose old quote
// is not on the snapshot either, and one host that refuses the fetcher's
// user agent. Of the seven live quote-drift failures, four carry summaries
// whose figures the current pages no longer state the same way - genuine
// content changes that quote-only repair cannot fix honestly, left untouched
// rather than forced. The other three are repaired here: two pages are alive
// and carry verbatim sentences that pass the full publication gate including
// the figure check, and Amsterdam's snapshot (like Cyprus in batch sixteen)
// carries the verbatim requirement sentence its citation needs. The old
// quotes in all three were pilot paraphrases that the cited pages never
// carried as running text. Summaries are unchanged. Idempotent: a correction
// already applied is skipped.
//
//   node scripts/kb-corrections-2026-11-06-d.js            dry run (no writes)
//   node scripts/kb-corrections-2026-11-06-d.js --apply    back up, then apply
//
// --apply first copies the database to data/backups/, then updates the record
// body and full-text index, and appends a hash-chained audit row per record,
// the same way store.review() does. The same text edits are applied to the
// seed/generator files when the record is defined there, so a rebuilt
// database does not bring the old text back.

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { configureEnglishDatabase } from '../src/migrations.js';
import { configureIngestion, ingestionStore } from '../src/ingestion.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const AUDIT_ID = 'kb-audit-2026-11-06-d';
const CHECKED_AT = '2026-11-06';
const REVIEWER = 'KB audit 2026-11-06-d (automated correction, not editorial review)';
const SEED_FILES = ['knowledge.js', 'kyc-records.js', 'global-records.js', 'insider-immigration-records.js', 'technical-immigration-records.js'];
const GENERATOR_FILES = ['scripts/inject-real-world-and-gap-records.js'];

export const CORRECTIONS = [
  // Canada - IRB National Documentation Package index (the old quote was a
  // pilot paraphrase of hearing standards, not page text; the new quote is the
  // page's verbatim description of what an NDP contains)
  { id: 'canada-asylum-country-condition-reports-vs-testimony', sources: ['https://irb.gc.ca/en/country-information/ndp/Pages/index.aspx'],
    note: 'The old quote was a pilot paraphrase ("In refugee hearings, objective country condition reports and credible personal testimony are weighed together under established legal standards."), which the cited National Documentation Package index page never carries as running text, so the word-for-word check could not pass. The quote is now the page\'s own verbatim sentence ("NDPs include Responses to Information Requests (RIRs) published by the IRB on its website."), captured from a fresh fetch of the same URL on 6 November 2026; dated Jurisprudential-Guide candidates on the page were rejected as unstable. The summary is unchanged; the record still awaits editorial review of its substance. Automated correction, not editorial review.',
    edits: [[{ field: 'quote' }, 'In refugee hearings, objective country condition reports and credible personal testimony are weighed together under established legal standards.', 'NDPs include Responses to Information Requests (RIRs) published by the IRB on its website.']] },

  // Ontario - Legal Aid Ontario home page (the old quote was a pilot
  // paraphrase naming tenancy, wage theft and immigration hearings; the new
  // quote is the page's verbatim statement of its core service)
  { id: 'ontario-newcomer-legal-aid-and-community-legal-clinics', sources: ['https://www.legalaid.on.ca/'],
    note: 'The old quote was a pilot paraphrase ("Legal Aid Ontario and community legal clinics deliver free legal counsel for tenancy disputes, wage theft, and immigration hearings."), which the cited page never carries as running text, so the word-for-word check could not pass. The quote is now the page\'s own verbatim block ("Apply for Legal Aid If you qualify and have a legal issue we cover, we will pay for a lawyer to help you."), captured from a fresh fetch of the same URL on 6 November 2026; the dated office-closure notice on the page was rejected as unstable. The summary is unchanged; the record still awaits editorial review of its substance. Automated correction, not editorial review.',
    edits: [[{ field: 'quote' }, 'Legal Aid Ontario and community legal clinics deliver free legal counsel for tenancy disputes, wage theft, and immigration hearings.', 'Apply for Legal Aid If you qualify and have a legal issue we cover, we will pay for a lawyer to help you.']] },

  // Amsterdam - first-registration page (the old quote was a pilot paraphrase;
  // the live page is not reachable for the fetcher and the Internet Archive
  // capture of the same URL carries the verbatim requirement sentence, the
  // same archived-evidence path batch sixteen used for Cyprus)
  { id: 'nl-amsterdam-brp-bsn-registration', sources: ['https://www.amsterdam.nl/en/civil-affairs/first-registration/'],
    note: 'The old quote was a pilot paraphrase ("Anyone moving to Amsterdam for more than 4 months must register with the municipality within 5 days of arrival."), which the cited page never carries as running text, so the word-for-word check could not pass. The live page is not reachable for the fetcher; the Internet Archive capture of the same cited URL carries the verbatim requirement sentence ("Visit a City Office within 5 days of your arrival."), captured from a fresh fetch on 6 November 2026, and the publication check verifies the quote against that archived copy of the same official URL. The citation is unchanged. The summary is unchanged; the record still awaits editorial review of its substance. Automated correction, not editorial review.',
    edits: [[{ field: 'quote' }, 'Anyone moving to Amsterdam for more than 4 months must register with the municipality within 5 days of arrival.', 'Visit a City Office within 5 days of your arrival.']] },

];

function applyEdits(record, edits) {
  const next = { ...record }; const missing = []; let changed = 0;
  const touched = new Set();
  const parsed = edits.map(e => typeof e[0] === 'object' ? [e[0].field, e[1], e[2]] : ['summary', e[0], e[1]]);
  parsed.forEach(([field, from, to]) => {
    const text = next[field] ?? '';
    // Already applied: the replacement is present.
    if (text.includes(to)) { touched.add(field); return; }
    if (text.includes(from)) { next[field] = text.replace(from, to).replace(/\s{2,}/g, ' ').trim(); touched.add(field); changed++; return; }
    missing.push(`${field}: ${from.slice(0, 70)}`);
  });
  // A field may list several from-paths to the same end state (a record caught
  // mid-history carries intermediate text); a from-row that misses is only a
  // problem when no row for that field matched anything.
  const open = missing.filter(m => !touched.has(m.slice(0, m.indexOf(':'))));
  return { next, missing: open, changed };
}

export function planCorrections(rows) {
  const byId = new Map(rows.map(r => [r.id, r]));
  const plan = []; const problems = [];
  for (const c of CORRECTIONS) {
    // seedOnly entries exist to walk seed/generator copies whose database row
    // is already at the end state; their from-strings are not database text.
    if (c.seedOnly) continue;
    const old = byId.get(c.id);
    if (!old) { problems.push(`${c.id}: not in database`); continue; }
    const { next, missing, changed } = applyEdits(old, c.edits);
    if (missing.length) problems.push(`${c.id}: text not found -> ${missing.join(' | ')}`);
    const basis = `Corrected in the ${AUDIT_ID}: ${c.note} Checked against ${c.sources.join(', ')}. Not yet editorially reviewed.`;
    if (changed) plan.push({ id: c.id, old, next: { ...next, checkedAt: CHECKED_AT, reviewBasis: basis }, note: `${c.note} Sources: ${c.sources.join(', ')}`, kind: 'correct', edits: c.edits });
  }
  return { plan, problems };
}

// Sync corrections into seed/generator files that define a record, so a rebuilt
// database does not bring the old text back. Seed file names are joined under
// src/; generator files are named from the repo root.
export function applyToSeedFiles(entries, write) {
  const report = [];
  for (const file of [...SEED_FILES, ...GENERATOR_FILES]) {
    const path = file.startsWith('scripts/') ? join(root, file) : join(root, 'src', file);
    if (!existsSync(path)) continue;
    let text = readFileSync(path, 'utf8'); let count = 0;
    for (const p of entries) {
      if (!text.includes(`'${p.id}'`) && !text.includes(`"${p.id}"`)) continue;
      for (const e of p.edits) {
        const [from, to] = typeof e[0] === 'object' ? [e[1], e[2]] : e;
        const variants = [[from, to], [from.replaceAll("'", "\\'"), to.replaceAll("'", "\\'")], [from.replaceAll('"', '\\"'), to.replaceAll('"', '\\"')]];
        if (variants.some(([f, t]) => text.includes(t))) continue;
        const hit = variants.find(([f]) => text.includes(f));
        if (hit) {
          const at = text.indexOf(hit[0]), line = text.slice(text.lastIndexOf('\n', at) + 1, at);
          const quote = line.match(/^\s*\w+:*\s*(['"])/)?.[1];
          const insert = quote ? to.replaceAll('\\', '\\\\').replaceAll(quote, `\\${quote}`) : hit[1];
          text = text.replace(hit[0], insert); count++;
        } else report.push(`${file} ${p.id}: seed text not found (${from.slice(0, 50)})`);
      }
    }
    if (count && write) writeFileSync(path, text);
    if (count) report.push(`${file}: ${count} edit(s)${write ? '' : ' (dry run)'}`);
  }
  return report;
}

const seedEntries = CORRECTIONS.map(c => ({ id: c.id, edits: c.edits }));

// Batch seventeen relocates no records and registers no sources: every record
// keeps its citation, and the Amsterdam quote is verified against the archived
// copy of the same URL by the publication pipeline's existing fallback.
export const SOURCE_REGISTRATIONS = [];

// Read-only: what the source registrations would do right now.
export function planSourceOps(db) {
  const ops = [];
  for (const s of SOURCE_REGISTRATIONS) {
    const row = db.prepare('SELECT tier, policy FROM sources WHERE id = ?').get(s.id);
    if (row && row.policy === 'manual_permitted' && row.tier === s.tier) continue;
    const byUrl = db.prepare('SELECT id FROM sources WHERE url = ?').get(s.url);
    if (!row && byUrl) { ops.push({ id: s.id, op: 'blocked', detail: `url already registered as ${byUrl.id}` }); continue; }
    ops.push({ id: s.id, op: row ? 'permit' : 'register', tier: s.tier });
  }
  return ops;
}

function applySourceOps(db, ops) {
  configureIngestion(db);
  const ingestion = ingestionStore(db);
  const done = [];
  for (const op of ops) {
    if (op.op === 'blocked') continue; // a conflicting registration must never be forced through
    const s = SOURCE_REGISTRATIONS.find(x => x.id === op.id);
    if (op.op === 'register') ingestion.registerSource({ id: s.id, url: s.url, owner: s.owner, tier: s.tier, language: 'en', reviewer: s.reviewer, note: s.note });
    else ingestion.permitSource(s.id, { tier: s.tier, reviewer: s.reviewer, note: s.note });
    done.push(`${op.op}:${s.id}`);
  }
  return done;
}

export function run({ dbPath = join(root, 'data', 'settlement.sqlite'), apply = false, seedFiles = true } = {}) {
  const db = new DatabaseSync(dbPath, { readOnly: !apply });
  const rows = db.prepare('SELECT body FROM records').all().map(r => JSON.parse(r.body));
  const { plan, problems } = planCorrections(rows);
  const sourceOps = planSourceOps(db);
  const summary = { corrections: plan.length, sourceOps, problems };
  if (!apply) { db.close(); return { ...summary, seed: seedFiles ? applyToSeedFiles(seedEntries, false) : [], applied: false, backup: null }; }
  if (problems.length) { db.close(); throw new Error(`Refusing to apply: ${problems.join('; ')}`); }
  if (!plan.length && !sourceOps.length) {
    db.close();
    return { ...summary, seed: seedFiles ? applyToSeedFiles(seedEntries, true) : [], applied: true, backup: null, noted: 'nothing to change in the database (already applied); seed files synced' };
  }

  const backupDir = join(dirname(dbPath), 'backups'); mkdirSync(backupDir, { recursive: true });
  let backup = join(backupDir, `settlement-before-${AUDIT_ID}.sqlite`);
  if (existsSync(backup)) backup = join(backupDir, `settlement-before-${AUDIT_ID}-${Date.now()}.sqlite`);
  db.exec(`VACUUM INTO '${backup.replaceAll("'", "''")}'`);
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
      const hash = createHash('sha256').update(`${prevHash}|${p.id}|${p.kind}|${REVIEWER}|${at}|${previous}|${next}`).digest('hex');
      update.run(next, p.id);
      try { delFts.run(p.id); insFts.run(p.id, p.next.title || '', p.next.summary || '', p.next.quote || '', p.next.topic || ''); } catch {}
      insAudit.run(p.id, previous, next, REVIEWER, p.note.slice(0, 1000), at, prevHash, hash);
    }
    db.exec('COMMIT');
  } catch (e) { db.exec('ROLLBACK'); db.close(); throw e; }
  // Source registrations run after the record transaction; each opens its own
  // transaction inside the ingestion API and appends a source_policy_reviews row.
  let sourcesApplied = [];
  if (sourceOps.some(op => op.op !== 'blocked')) sourcesApplied = applySourceOps(db, sourceOps);
  db.close();
  return { ...summary, seed: seedFiles ? applyToSeedFiles(seedEntries, true) : [], sourcesApplied, applied: true, backup };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const result = run({ apply: process.argv.includes('--apply') });
  console.log(JSON.stringify(result, null, 2));
  if (result.problems.length) process.exitCode = 1;
}
