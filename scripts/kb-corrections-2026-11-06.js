// Knowledge-base corrections for 6 November 2026: batch fourteen of the verify
// backlog — the country-portal placeholder quotes. One hundred and fifty-three
// portal records were still unpublished; each carried either the placeholder
// line "No English page excerpt captured; link identified through research" or
// a two-to-four-word site title as its quote, neither of which the cited page
// ever carries as running text, so the word-for-word check could not pass. This
// batch replaces the nine quotes whose pages, fetched fresh today, carry a
// stable verbatim English sentence or section listing (dated news headlines,
// update notices and truncated teasers were deliberately avoided). Each
// record's summary already states it is a broad national entry point identified
// through research, not a verified licence-specific page, and carries no
// figures, so summaries are unchanged. Idempotent: a correction already applied
// is skipped.
//
//   node scripts/kb-corrections-2026-11-06.js            dry run (no writes)
//   node scripts/kb-corrections-2026-11-06.js --apply    back up, then apply
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
const AUDIT_ID = 'kb-audit-2026-11-06';
const CHECKED_AT = '2026-11-06';
const REVIEWER = 'KB audit 2026-11-06 (automated correction, not editorial review)';
const SEED_FILES = ['knowledge.js', 'kyc-records.js', 'global-records.js', 'insider-immigration-records.js', 'technical-immigration-records.js'];
const GENERATOR_FILES = ['scripts/inject-real-world-and-gap-records.js'];

export const CORRECTIONS = [
  // Austria - oesterreich.gv.at (placeholder quote replaced with the page's
  // verbatim ID-Austria capability sentence)
  { id: 'country-austria-portal', sources: ['https://www.oesterreich.gv.at/en'],
    note: 'The old quote was the placeholder line written when the pilot could not capture an excerpt ("No English page excerpt captured; link identified through research"), which the cited page never carries as running text, so the word-for-word check could not pass. The quote is now the page\'s own verbatim sentence ("It lets you access digital services and conclude contracts electronically."), captured from a fresh fetch of the same URL on 6 November 2026. The summary already states the record is a broad national entry point identified through web research, not a verified licence-specific page, and carries no figures, so it is unchanged. Automated correction, not editorial review.',
    edits: [[{ field: 'quote' }, 'No English page excerpt captured; link identified through research', 'It lets you access digital services and conclude contracts electronically.']] },

  // Barbados - gov.bb (placeholder quote replaced with the page's verbatim
  // marriage-licence service sentence)
  { id: 'country-barbados-portal', sources: ['https://www.gov.bb/'],
    note: 'The old quote was the placeholder line written when the pilot could not capture an excerpt ("No English page excerpt captured; link identified through research"), which the cited page never carries as running text, so the word-for-word check could not pass. The quote is now the page\'s own verbatim sentence ("Obtaining a Marriage Licence Application for a marriage licence must be made by BOTH (male and female) persons at the office of the Ministry of Home Affairs."), captured from a fresh fetch of the same URL on 6 November 2026. The summary already states the record is a broad national entry point identified through web research, not a verified licence-specific page, and carries no figures, so it is unchanged. Automated correction, not editorial review.',
    edits: [[{ field: 'quote' }, 'No English page excerpt captured; link identified through research', 'Obtaining a Marriage Licence Application for a marriage licence must be made by BOTH (male and female) persons at the office of the Ministry of Home Affairs.']] },

  // Iceland - island.is (placeholder quote replaced with the page's verbatim
  // services-section listing)
  { id: 'country-iceland-portal', sources: ['https://island.is/en'],
    note: 'The old quote was the placeholder line written when the pilot could not capture an excerpt ("No English page excerpt captured; link identified through research"), which the cited page never carries as running text, so the word-for-word check could not pass. The quote is now the page\'s own verbatim section listing ("Disability Services & Support Diagnosis, rights, accessibility, and support."), captured from a fresh fetch of the same URL on 6 November 2026. The summary already states the record is a broad national entry point identified through web research, not a verified licence-specific page, and carries no figures, so it is unchanged. Automated correction, not editorial review.',
    edits: [[{ field: 'quote' }, 'No English page excerpt captured; link identified through research', 'Disability Services & Support Diagnosis, rights, accessibility, and support.']] },

  // Latvia - mk.gov.lv (placeholder quote replaced with the page's verbatim
  // institutional-information sentence)
  { id: 'country-latvia-portal', sources: ['https://www.mk.gov.lv/en'],
    note: 'The old quote was the placeholder line written when the pilot could not capture an excerpt ("No English page excerpt captured; link identified through research"), which the cited page never carries as running text, so the word-for-word check could not pass. The quote is now the page\'s own verbatim sentence ("The section provides information on the head of institution, structure, budget, annual public accounts, working groups and councils, subordinate authorities, and history of the establishment of the institution."), captured from a fresh fetch of the same URL on 6 November 2026. The summary already states the record is a broad national entry point identified through web research, not a verified licence-specific page, and carries no figures, so it is unchanged. Automated correction, not editorial review.',
    edits: [[{ field: 'quote' }, 'No English page excerpt captured; link identified through research', 'The section provides information on the head of institution, structure, budget, annual public accounts, working groups and councils, subordinate authorities, and history of the establishment of the institution.']] },

  // Liechtenstein - liechtenstein.li (placeholder quote replaced with the
  // page's verbatim economy description sentence)
  { id: 'country-liechtenstein-portal', sources: ['https://www.liechtenstein.li/en'],
    note: 'The old quote was the placeholder line written when the pilot could not capture an excerpt ("No English page excerpt captured; link identified through research"), which the cited page never carries as running text, so the word-for-word check could not pass. The quote is now the page\'s own verbatim sentence ("Liechtenstein companies provide a large number of attractive jobs in globally and internationally operating industrial and financial services companies, or in SMEs that are active in the region."), captured from a fresh fetch of the same URL on 6 November 2026. The summary already states the record is a broad national entry point identified through web research, not a verified licence-specific page, and carries no figures, so it is unchanged. Automated correction, not editorial review.',
    edits: [[{ field: 'quote' }, 'No English page excerpt captured; link identified through research', 'Liechtenstein companies provide a large number of attractive jobs in globally and internationally operating industrial and financial services companies, or in SMEs that are active in the region.']] },

  // Micronesia - gov.fm (two-word duplicated title replaced with the page's
  // verbatim constitutional-amendments navigation block)
  { id: 'country-micronesia-portal', sources: ['https://gov.fm'],
    note: 'The old quote was the two-word duplicated site title ("FSM Government – FSM Government"), which the cited page never carries as running text, so the word-for-word check could not pass. The quote is now the page\'s own verbatim navigation block ("Constitutional Amendments Learn more about our Constitutional Amendments Frequently Asked Questions How do I find information on voting?"), captured from a fresh fetch of the same URL on 6 November 2026. The summary already states the record is a broad national entry point identified through web research, not a verified licence-specific page, and carries no figures, so it is unchanged. Automated correction, not editorial review.',
    edits: [[{ field: 'quote' }, 'FSM Government – FSM Government', 'Constitutional Amendments Learn more about our Constitutional Amendments Frequently Asked Questions How do I find information on voting?']] },

  // Saint Kitts and Nevis - gov.kn (placeholder quote replaced with the
  // page's verbatim heritage sentence, stable because it is historical)
  { id: 'country-saint-kitts-and-nevis-portal', sources: ['https://www.gov.kn/'],
    note: 'The old quote was the placeholder line written when the pilot could not capture an excerpt ("No English page excerpt captured; link identified through research"), which the cited page never carries as running text, so the word-for-word check could not pass. The quote is now the page\'s own verbatim heritage sentence ("How the island rose to become the world\'s leader in sugarcane cultivation, an inspiration for the industrial revolution in the process."), captured from a fresh fetch of the same URL on 6 November 2026; the ministries listing was rejected because cabinet reshuffles rotate it. The summary already states the record is a broad national entry point identified through web research, not a verified licence-specific page, and carries no figures, so it is unchanged. Automated correction, not editorial review.',
    edits: [[{ field: 'quote' }, 'No English page excerpt captured; link identified through research', 'How the island rose to become the world\'s leader in sugarcane cultivation, an inspiration for the industrial revolution in the process.']] },

  // Antigua and Barbuda - ab.gov.ag (three-word site title replaced with the
  // page's verbatim government-information section listing)
  { id: 'country-antigua-and-barbuda-portal', sources: ['https://ab.gov.ag/'],
    note: 'The old quote was the three-word site title ("Government of Antigua and Barbuda"), which the cited page never carries as running text, so the word-for-word check could not pass. The quote is now the page\'s own verbatim section listing ("GOVERNMENT INFO Ministries Government Ministers Our Parliament Government Forms more..."), captured from a fresh fetch of the same URL on 6 November 2026. The summary already states the record is a broad national entry point identified through web research, not a verified licence-specific page, and carries no figures, so it is unchanged. Automated correction, not editorial review.',
    edits: [[{ field: 'quote' }, 'Government of Antigua and Barbuda', 'GOVERNMENT INFO Ministries Government Ministers Our Parliament Government Forms more...']] },

  // Sri Lanka - gov.lk (five-word title replaced with the page's own verbatim
  // welcome block, stable because the notice has been on the page for years)
  { id: 'country-sri-lanka-portal', sources: ['https://www.gov.lk/index.php'],
    note: 'The old quote was the five-word site title ("Welcome to GOV.LK :: Home Page"), too short for the word-for-word check. The quote is now the page\'s own verbatim welcome block ("Welcome to GOV.LK :: Home Page This Application works best with Microsoft Internet Explorer version 10 or later."), captured from a fresh fetch of the same URL on 6 November 2026; the notice has been carried by the page for years and states the portal\'s own technical character. The summary already states the record is a broad national entry point identified through web research, not a verified licence-specific page, and carries no figures, so it is unchanged. Automated correction, not editorial review.',
    edits: [[{ field: 'quote' }, 'Welcome to GOV.LK :: Home Page', 'Welcome to GOV.LK :: Home Page This Application works best with Microsoft Internet Explorer version 10 or later.']] },

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

// Batch fourteen relocates no records and registers no sources: every portal
// record already cites the page it is checked against, and every portal source
// row is already registered, permitted and tier A (verified read-only before
// the batch). The record-URL trigger therefore does not fire.
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
