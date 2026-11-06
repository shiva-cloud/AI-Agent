// Knowledge-base corrections for 6 November 2026, batch c: batch sixteen of
// the verify backlog - the archive-fallback slice of the country-portal
// placeholder cleanup. The publish pipeline already gives pages that are gone
// or that block the fetch one honest second chance: it re-checks the quote
// against the Internet Archive copy of the same official URL when one exists.
// Of the 141 portals still unpublished, eleven are blocked with HTTP 403, the
// one failure class that triggers that fallback; snapshots for seven of the
// eleven were themselves refused by the archive this run (an environmental
// limit, left alone rather than hammered), and four snapshots answered, of
// which one carried a stable verbatim English sentence: Cyprus. A deep-link
// probe of the thirteen portals whose homepages answer with JavaScript shells
// found one more: Armenia, whose /en path serves a bot-check interstitial to
// automated fetches while the same host serves its English content at /en/en,
// so the citation moves there and the page is registered, the same relocation
// flow batch thirteen used for bot-blocked citations. Belgium's only English
// candidate describes the EU "Your Europe" service rather than the Belgian
// portal, so it was rejected as not supporting the record's subject. Each
// record's summary already states it is a broad national entry point
// identified through research, not a verified licence-specific page, and
// carries no figures, so summaries are unchanged. Idempotent: a correction
// already applied is skipped.
//
//   node scripts/kb-corrections-2026-11-06-c.js            dry run (no writes)
//   node scripts/kb-corrections-2026-11-06-c.js --apply    back up, then apply
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
const AUDIT_ID = 'kb-audit-2026-11-06-c';
const CHECKED_AT = '2026-11-06';
const REVIEWER = 'KB audit 2026-11-06-c (automated correction, not editorial review)';
const SEED_FILES = ['knowledge.js', 'kyc-records.js', 'global-records.js', 'insider-immigration-records.js', 'technical-immigration-records.js'];
const GENERATOR_FILES = ['scripts/inject-real-world-and-gap-records.js'];

export const CORRECTIONS = [
  // Cyprus - gov.cy (placeholder quote replaced with the verbatim
  // citizens-services description carried by the Internet Archive capture of
  // the same cited URL; the live page serves HTTP 403 to automated fetches and
  // the publication check verifies against the archived copy)
  { id: 'country-cyprus-portal', sources: ['https://www.gov.cy/en/'],
    note: 'The old quote was the placeholder line written when the pilot could not capture an excerpt ("No English page excerpt captured; link identified through research"), which the cited page never carries as running text, so the word-for-word check could not pass. The live page serves HTTP 403 to automated fetches; the Internet Archive capture of the same cited URL carries the verbatim services-directory description ("Citizens and day-to-day life Services for Cypriot citizens and foreign nationals, as well as processes concerning transport and vehicles, postal services, etc."), captured from a fresh fetch on 6 November 2026, and the publication check verifies the quote against that archived copy of the same official URL. The citation is unchanged. The summary already states the record is a broad national entry point identified through web research, not a verified licence-specific page, and carries no figures, so it is unchanged. Automated correction, not editorial review.',
    edits: [[{ field: 'quote' }, 'No English page excerpt captured; link identified through research', 'Citizens and day-to-day life Services for Cypriot citizens and foreign nationals, as well as processes concerning transport and vehicles, postal services, etc.']] },

  // Armenia - gov.am (placeholder quote replaced with the verbatim
  // government-meeting sentence from the same host's /en/en page; the /en path
  // serves a Radware bot-check interstitial to automated fetches, so the
  // citation moves to the page that carries the quote)
  { id: 'country-armenia-portal', sources: ['https://gov.am/en/en'],
    note: 'The old quote was the five-word site title ("Government of the Republic of Armenia"), too short for the word-for-word check. The cited /en path serves a Radware bot-check interstitial to automated fetches; the same host serves its English content at the /en/en page, which carries the verbatim sentence ("View the agenda and schedule of meetings of the Government of the Republic of Armenia."), captured from a fresh fetch on 6 November 2026. The citation now points to that page so the record cites the page its quote is checked against, and the page was registered and permitted tier A (the same government host as the previously registered source). The summary already states the record is a broad national entry point identified through web research, not a verified licence-specific page, and carries no figures, so it is unchanged. Automated correction, not editorial review.',
    edits: [[{ field: 'quote' }, 'Government of the Republic of Armenia', 'View the agenda and schedule of meetings of the Government of the Republic of Armenia.'],
      [{ field: 'url' }, 'https://gov.am/en', 'https://gov.am/en/en']] },

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

// Batch sixteen registers one source: the Armenia record's citation moves to
// the /en/en page of the same host that carries its quote. The register step
// inserts the row already permitted (policy manual_permitted with a
// source_policy_reviews row), the same end state batch thirteen's two-phase
// relocations reached. Cyprus keeps its citation; the publication check
// verifies its quote against the archived copy of the same URL.
export const SOURCE_REGISTRATIONS = [
  { id: 'seed-country-armenia-portal-en-en', url: 'https://gov.am/en/en', owner: 'gov.am', tier: 'A',
    reviewer: REVIEWER,
    note: 'Policy review for re-pointing record country-armenia-portal: the cited /en path serves a Radware bot-check interstitial to automated fetches, and the same government host serves its English content at the /en/en page, which was fetched and checked during the automated correction. The citation moves to that page; it is the same government host as the previously registered and permitted source (tier A). Automated correction, not an editorial content review.' },
];

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
