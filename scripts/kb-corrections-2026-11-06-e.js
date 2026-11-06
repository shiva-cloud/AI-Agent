// Knowledge-base corrections for 6 November 2026, batch e: batch eighteen of
// the verify backlog - the relocation slice. Three dead-URL community records
// whose new official pages were found through parent-page href inspection
// (websearch is unavailable in this environment): the IRCC settlement-service
// eligibility notice on canada.ca, the Service NSW "apply for a NSW Photo
// Card" transaction page (the old "apply-for-an" path 404s; the live path is
// "apply-for-a"), and the Thames Water moving-home page under its new
// account-and-billing path. Every new page was probed through the full
// publication gate: the quotes below are verbatim on the live pages, but all
// three records also failed the summary-figure check, because each summary
// states figures or claims the current pages no longer (or never) carry - the
// IRCC summary's "for 6 years ... falling to 5 years" bounds versus the
// notice's "up to 6 years ... up to 5 years", the NSW summary's Photo Card
// Act 2005 year, Digital Photo Card and passport/Medicare document list, and
// the Thames Water summary's 15-million-customers, 48-hour, rateable-value,
// Water Industry Act 1991 and WaterHelp-50-percent claims, none of which the
// moving-home page states. The figure check is conservative by design: an
// unbounded "6 years" in a summary is not verifiable against an "up to 6
// years" on a page. These are therefore summary revisions, not quote-only
// repairs, and summary revisions are editorial work: each revision below was
// drafted to state only what its cited page states, shown to the repository
// owner in full, and applied only after the owner's explicit approval on
// 6 November 2026. The audit rows are labelled accordingly - this batch is a
// user-approved editorial summary revision carried out by an automated
// script, not a mechanical quote swap. Summaries change nothing they cannot
// support with the cited page's own text. Idempotent: a correction already
// applied is skipped.
//
//   node scripts/kb-corrections-2026-11-06-e.js            dry run (no writes)
//   node scripts/kb-corrections-2026-11-06-e.js --apply    back up, then apply
//
// --apply first copies the database to data/backups/, then updates the record
// body and full-text index, and appends a hash-chained audit row per record,
// the same way store.review() does. The same text edits are applied to the
// seed/generator files when the record is defined there, so a rebuilt
// database does not bring the old text back. The three new URLs are
// registered as permitted tier-A sources, the same relocation path batch
// fifteen and sixteen used.

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { configureEnglishDatabase } from '../src/migrations.js';
import { configureIngestion, ingestionStore } from '../src/ingestion.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const AUDIT_ID = 'kb-audit-2026-11-06-e';
const CHECKED_AT = '2026-11-06';
const REVIEWER = 'KB audit 2026-11-06-e (user-approved editorial revision, automated script)';
const SEED_FILES = ['knowledge.js', 'kyc-records.js', 'global-records.js', 'insider-immigration-records.js', 'technical-immigration-records.js'];
const GENERATOR_FILES = ['scripts/inject-real-world-and-gap-records.js'];

// The revised IRCC eligibility sentence, shared by the database edit and the
// seed-only edit (the generator still carries an older, vaguer variant of
// this sentence that the database row no longer has).
const IRCC_REVISED = 'From April 1, 2026, economic-class permanent residents and their accompanying family members can use settlement services for up to 6 years after obtaining permanent residence, falling to up to 5 years after obtaining permanent residence from April 1, 2027; family-class immigrants and resettled refugees are not subject to this limit.';

export const CORRECTIONS = [
  // Canada - IRCC settlement-service eligibility notice (the old page 404s;
  // the notice currently linked from canada.ca's settle-in-Canada index
  // carries the eligibility limits verbatim). The summary's bound words are
  // aligned with the notice's own "up to" phrasing; everything else in the
  // summary is unchanged.
  { id: 'canada-ircc-settlement-services-eligibility-and-2026-limits', sources: ['https://www.canada.ca/en/immigration-refugees-citizenship/news/notices/changes-settlement-service-eligibility-economic-immigrants.html'],
    note: 'The old URL 404s. The replacement page is the IRCC notice "Changes to settlement service eligibility for economic immigrants", currently linked from canada.ca\'s settle-in-Canada index, fetched on 6 November 2026. Its verbatim sentence and both bullet lines (up to 6 years after obtaining permanent residence, as of April 1, 2026; up to 5 years, as of April 1, 2027) pass the quote check, but the summary-figure check failed: the summary said "for 6 years ... falling to 5 years" while the page says "up to 6 years ... up to 5 years", and the conservative figure gate will not verify an unbounded amount against a bounded one. The one summary sentence was therefore revised to the notice\'s own bound phrasing; the rest of the summary, including the eligibility categories and LINC/CLIC sentence, is unchanged. This is an editorial summary revision, shown in full to and explicitly approved by the repository owner on 2026-11-06 before being applied by this script.',
    edits: [
      [{ field: 'url' }, 'https://www.canada.ca/en/immigration-refugees-citizenship/services/newcomers/services-eligibility.html', 'https://www.canada.ca/en/immigration-refugees-citizenship/news/notices/changes-settlement-service-eligibility-economic-immigrants.html'],
      [{ field: 'quote' }, 'Federally funded settlement services are administered under IRPA and restricted to eligible categories of permanent residents and protected persons.', 'In support of this Budget 2025 commitment, the length of time they are able to access these services, as permanent residents, will change gradually to: up to 6 years after obtaining permanent residence, as of April 1, 2026 up to 5 years after obtaining permanent residence, as of April 1, 2027'],
      [{ field: 'summary' }, 'From April 1, 2026, economic-class permanent residents and their accompanying family members can use settlement services for 6 years from the date they became permanent residents, falling to 5 years from April 1, 2027; family-class immigrants and resettled refugees are not subject to this limit.', IRCC_REVISED],
    ] },

  // Seed-only: the generator file still defines this record with an older,
  // vaguer eligibility sentence the database row replaced on 1 November; walk
  // it to the same revised sentence so a rebuilt database matches.
  { id: 'canada-ircc-settlement-services-eligibility-and-2026-limits', seedOnly: true, sources: [],
    note: 'Seed-only walk of the generator copy of the same record to the revised eligibility sentence.',
    edits: [[{ field: 'summary' }, 'Effective April 1, 2026, IRCC introduces time-limited settlement eligibility for economic-class permanent residents (access prioritized within early post-landing years), with further transitional rules in 2027.', IRCC_REVISED]] },

  // Australia - Service NSW Photo Card transaction page (the old
  // apply-for-an path 404s; the live path is apply-for-a). The summary is
  // rewritten to state only what the page states.
  { id: 'au-sydney-service-nsw-photo-card', sources: ['https://www.service.nsw.gov.au/transaction/apply-for-a-nsw-photo-card'],
    note: 'The old URL 404s; the live transaction page is apply-for-a-nsw-photo-card, found through the Service NSW index and fetched on 6 November 2026. The full publication gate failed on the summary-figure check: the summary\'s "Photo Card Act 2005" year appears nowhere on the page, and the page also does not state the Digital Photo Card app claim, the "primary proof of age and identity across Australia" wording, or the foreign-passport/Medicare/bank-statement document list. The summary was rewritten to state only what the page states: a voluntary photo identity document for NSW residents 16 or over without a driver licence, usable to prove age, identity or address in most places a driver licence is recognised, applied for in person at a Service NSW Centre, valid for 5 years (or 10 years for eligible customers aged 21 and over), with fees depending on driver-licence status, a reduced fee when applying with a licence, and concessions for pensioners and carers. Every sentence traces to page text and the page\'s own validity sentence is the quote. This is an editorial summary revision, shown in full to and explicitly approved by the repository owner on 2026-11-06 before being applied by this script.',
    edits: [
      [{ field: 'url' }, 'https://www.service.nsw.gov.au/transaction/apply-for-an-nsw-photo-card', 'https://www.service.nsw.gov.au/transaction/apply-for-a-nsw-photo-card'],
      [{ field: 'quote' }, 'The NSW Photo Card is a voluntary photo identity card for NSW residents who do not hold a driver licence.', 'It is valid for 5 years (or 10 years for eligible customers aged 21 and over)'],
      [{ field: 'summary' }, 'Service NSW issues the NSW Photo Card, an official government-backed photo identity document under the Photo Card Act 2005. It provides recognized primary proof of age and identity across Australia for residents who do not hold an Australian driver licence or who choose not to carry a passport for daily transactions. Applicants must visit a Service NSW service centre in person, provide proof of identity (such as a foreign passport with valid Australian visa, proof of residential address in NSW, and Medicare card or bank statement), and pay the 5-year or 10-year card issuance fee. It can also be accessed as a Digital Photo Card within the Service NSW smartphone application.', 'Service NSW issues the NSW Photo Card, a voluntary government-issued photo identity document for NSW residents aged 16 or over who do not have photo identification such as a NSW Driver Licence. It can be used to prove your age, identity or address in most places a driver licence is recognised, though it cannot be used as identification in certain situations, including some online applications. The Photo Card has the same security features as the NSW Driver Licence and shows your name, address, date of birth and photo. Applicants must visit a Service NSW Centre and apply in person with acceptable proof of identity documents. The Photo Card is valid for 5 years (or 10 years for eligible customers aged 21 and over). Fee amounts depend on whether you hold a NSW Drivers Licence and when you apply, with a reduced fee if you apply at the same time as you apply for or renew your driver licence, and there are concessions for pensioners and carers.'],
    ] },

  // United Kingdom - Thames Water moving-home page (the old help/moving-home
  // path 404s; the live page sits under help/account-and-billing). The
  // summary is rewritten to state only what the page states.
  { id: 'uk-london-thames-water-utility-setup', sources: ['https://www.thameswater.co.uk/help/account-and-billing/moving-home'],
    note: 'The old URL 404s; the live page is help/account-and-billing/moving-home, found through the Thames Water help index and fetched on 6 November 2026. The full publication gate failed on the summary-figure check: the page states none of the summary\'s figures or statutory claims - not the 15-million-customers figure, not the 48-hour account deadline, not unmetered rateable-value billing, not the Water Industry Act 1991 disconnection rule, and not the WaterHelp 50 percent discount; the page is only about telling Thames Water about a move. The summary was rewritten to state only what the page states: notice of a move as early as 28 days before the move date through the online account, for customers moving into, within, or out of the area, applying only to those responsible for the water and wastewater bill, with the shared-property rule. The page\'s own "moving into our area" sentence is the quote. This is an editorial summary revision, shown in full to and explicitly approved by the repository owner on 2026-11-06 before being applied by this script.',
    edits: [
      [{ field: 'url' }, 'https://www.thameswater.co.uk/help/moving-home', 'https://www.thameswater.co.uk/help/account-and-billing/moving-home'],
      [{ field: 'quote' }, 'Tell us you are moving in so we can set up your water account and send your bills to the right place.', "If you're moving into our area, tell us about your move by setting up an online account"],
      [{ field: 'summary' }, 'Thames Water is the statutory monopoly supplier of clean water and wastewater services to over 15 million customers across Greater London. Upon moving into a rental property or purchased home, residents must create an account within 48 hours via the online moving portal or telephone, providing the tenancy start date and an opening water meter reading. Properties without a water meter are billed on an unmetered rateable value basis. Water supply cannot be legally disconnected for non-payment of residential bills under the Water Industry Act 1991. Struggling low-income households can apply for the WaterHelp scheme, which offers up to a 50% discount on standard tariff bills.', 'Thames Water asks customers to tell the company about a move as early as 28 days before the move date, and the easiest way is through your online account. New customers moving into the Thames Water area can tell the company about their move by setting up an online account. Customers moving to another property within the area can let Thames Water know through their online account, and customers leaving the area can close their account online. This applies only if you are responsible for paying the water and wastewater bill. If you move out of a shared property where the account is in your name, someone still at the property will need to contact Thames Water to set up an account.'],
    ] },

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
    const basis = `Corrected in the ${AUDIT_ID}: ${c.note} Checked against ${c.sources.join(', ')}. Summary revision shown to and explicitly approved by the repository owner on 2026-11-06.`;
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

// All three records move to new URLs on the same hosts as their old citations;
// each new URL is registered as its own permitted tier-A source, the way
// batches fifteen and sixteen re-pointed relocations.
export const SOURCE_REGISTRATIONS = [
  { id: 'seed-canada-ircc-settlement-services-eligibility-and-2026-limits-notice', url: 'https://www.canada.ca/en/immigration-refugees-citizenship/news/notices/changes-settlement-service-eligibility-economic-immigrants.html', owner: 'canada.ca', tier: 'A',
    reviewer: REVIEWER,
    note: 'Policy review for re-pointing record canada-ircc-settlement-services-eligibility-and-2026-limits: the previously registered services-eligibility page 404s, and canada.ca currently links the settlement-service eligibility notice at this path. The notice was fetched and checked during the automated correction of 6 November 2026 and is the same government host as the previously registered and permitted source (tier A). The summary revision it accompanies was explicitly approved by the repository owner on 2026-11-06. Policy review, not an editorial content review.' },
  { id: 'seed-au-sydney-service-nsw-photo-card', url: 'https://www.service.nsw.gov.au/transaction/apply-for-a-nsw-photo-card', owner: 'service.nsw.gov.au', tier: 'A',
    reviewer: REVIEWER,
    note: 'Policy review for re-pointing record au-sydney-service-nsw-photo-card: the previously registered apply-for-an-nsw-photo-card path 404s, and the same government host serves the transaction at apply-for-a-nsw-photo-card, which was fetched and checked during the automated correction of 6 November 2026. The new path was found already present in the sources table as an unreviewed, unclassified row with an empty reviewer and no policy-review history; this review permits that existing row as tier A rather than registering a duplicate. The summary revision it accompanies was explicitly approved by the repository owner on 2026-11-06. Policy review, not an editorial content review.' },
  { id: 'seed-uk-london-thames-water-utility-setup', url: 'https://www.thameswater.co.uk/help/account-and-billing/moving-home', owner: 'thameswater.co.uk', tier: 'A',
    reviewer: REVIEWER,
    note: 'Policy review for re-pointing record uk-london-thames-water-utility-setup: the previously registered help/moving-home path 404s, and the same host serves the moving-home page under help/account-and-billing, which was fetched and checked during the automated correction of 6 November 2026. The new path was found already present in the sources table as an unreviewed, unclassified row with an empty reviewer and no policy-review history; this review permits that existing row as tier A rather than registering a duplicate. The summary revision it accompanies was explicitly approved by the repository owner on 2026-11-06. Policy review, not an editorial content review.' },
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
