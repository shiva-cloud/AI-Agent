// Knowledge-base corrections for 4 November 2026: first dead-link repair batch
// (phase F-family of the verify backlog). Each correction relocates a record
// whose official page died (HTTP 404 without an archive copy) to the page its
// authority now serves, then restores the quote word for word from the new
// page so the record can pass the automated official-page check
// (scripts/kb-verify-publish.js). Where the replacement page does not support
// the old summary's claims, the summary states only what the new page supports.
// Idempotent: a correction already applied is skipped.
//
//   node scripts/kb-corrections-2026-11-04.js            dry run (no writes)
//   node scripts/kb-corrections-2026-11-04.js --apply    back up, then apply
//
// --apply first copies the database to data/backups/, then updates the record
// body and full-text index, and appends a hash-chained audit row per record,
// the same way store.review() does. The same text edits are applied to the
// seed files under src/ when the record is defined there, so a rebuilt
// database does not bring the old text back. Approval status is not changed.
import { DatabaseSync } from 'node:sqlite';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { configureEnglishDatabase } from '../src/migrations.js';
import { configureIngestion, ingestionStore } from '../src/ingestion.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const AUDIT_ID = 'kb-audit-2026-11-04';
const CHECKED_AT = '2026-11-04';
const REVIEWER = 'KB audit 2026-11-04 (automated correction, not editorial review)';
const SEED_FILES = ['knowledge.js', 'kyc-records.js', 'global-records.js', 'insider-immigration-records.js', 'technical-immigration-records.js'];
const GENERATOR_FILES = ['scripts/inject-real-world-and-gap-records.js'];

// [from, to] pairs apply to the summary unless tagged {field: 'url'|'quote'|...}.
export const CORRECTIONS = [
  // Germany - BMJV Mietrecht overview (domain moved bmj.de -> bmjv.de and tree restructured)
  { id: 'de-mietrecht-kaution-schufa-housing-kyc', sources: ['https://www.bmjv.de/DE/themen/kaufen_reisen_wohnen/mietrecht/mietrecht_node.html'],
    note: 'The old bmj.de page died with the ministry site restructuring (bmj.de became bmjv.de); the Mietrecht overview now lives under DE/themen/kaufen_reisen_wohnen/. The old quote was an English paraphrase; the summary was rewritten to what the relocated page states - the deposit cap (highest security is the threefold of one month basic rent, Section 551 (1) BGB) and the overview further covering permissible rent and notices of termination. The installment right, the ten-percent rent brake limit and the application-document figure count are not stated on the relocated page and were removed.',
    edits: [
      [{ field: 'url' }, 'https://www.bmj.de/DE/themen/bauen_wohnen/mietrecht/mietrecht_node.html', 'https://www.bmjv.de/DE/themen/kaufen_reisen_wohnen/mietrecht/mietrecht_node.html'],
      [{ field: 'quote' }, 'The tenancy deposit cannot exceed three times the monthly basic rent excluding utilities.', 'Die Höhe der Mietsicherheit darf – unabhängig von ihrer Form – höchstens das Dreifache der auf einen Monat entfallenden Grundmiete betragen ( § 551 Absatz 1 BGB ).'],
      ['Under Section 551 of the German Civil Code (Bürgerliches Gesetzbuch - BGB), residential tenancy security deposits (Mietkaution) are strictly capped at a maximum of three times the net cold rent (Nettokaltmiete, excluding heating and utility charges). Tenants have the statutory legal right to pay the Kaution in three equal monthly installments starting on the move-in date. Under the Mietpreisbremse (rent ceiling regulation in tight housing markets), new lease rents cannot exceed 10% above the local comparative rent index (Mietspiegel). When applying for apartments, landlords commonly require a SCHUFA Bonitätsauskunft (credit solvency report), proof of income (last 3 payslips), and a rent debt-free certificate (Mietschuldenfreiheitsbescheinigung). Landlords cannot terminate leases or evict tenants without statutory just cause and a court bailiff order. This record does not adjudicate tenancy disputes.', 'The Federal Ministry of Justice (BMJV) Mietrecht overview states that the height of the Mietsicherheit - whatever its form, a rent deposit account, a guarantee, or the handover of a bank savings book - may not exceed the threefold of the basic rent attributable to one month (Section 551 (1) BGB). The same overview further covers the permissible rent at lease start, the Mietpreisbremse, notices of termination and their prerequisites; what landlords ask for in an individual apartment application, such as a SCHUFA Bonitätsauskunft and proof of income, is beyond the ministry page. This record does not adjudicate tenancy disputes.'] ] },

  // Ireland - RTB rent-cap page (rtb.ie restructured to a flat /renting/ tree)
  { id: 'ie-rtb-rpz-2-percent-rent-cap', sources: ['https://rtb.ie/renting/setting-and-reviewing-private-rents/'],
    note: 'The old rtb.ie/rent-pressure-zones page died in the site restructuring (all tenant-facing pages moved under rtb.ie/renting/); the rent-cap substance lives on the new setting-and-reviewing-private-rents page. The old quote and summary described the RPZ rule with HICP as the inflation index; the relocated page proves a fresh verbatim sentence (annual 2% cap or the rate of inflation, measured by CPI) and the 1 March 2026 national system, so quote and summary now state what the page states.',
    edits: [
      [{ field: 'url' }, 'https://www.rtb.ie/rent-pressure-zones', 'https://rtb.ie/renting/setting-and-reviewing-private-rents/'],
      [{ field: 'quote' }, 'In a Rent Pressure Zone, rent cannot be increased by more than 2 percent per year, and the cap applies to the dwelling, not the tenant.', 'Rent can only be increased once per year by 2% or the rate of inflation, whichever is lower.'],
      ['Crucially, this statutory rent restriction attaches directly to the property rather than the tenancy agreement; for tenancies that began before 1 March 2026 landlords cannot reset rent to market rates between tenancies. Under the national system that started on 1 March 2026, new tenancies follow different reset rules (generally at the start of a new tenancy or after 6 years), so check the RTB. Landlords must provide incoming tenants with an official RTB RPZ Rent Calculation Sheet demonstrating compliance based on the previous rent. This record does not adjudicate RTB dispute hearings.', 'For private tenancies created from 1 March 2026, re-setting to market rent is allowed only in specific cases, for example when a new tenancy begins after the tenant left by choice, breached their obligations, or the property no longer suits their needs; the page lists those cases in full. A printed RTB Rent Calculator output and details of 3 comparable properties from the RTB Rent Register document how the new rent was calculated. This record does not adjudicate RTB dispute hearings.'] ] },

  // Ireland - same record, follow-up after the relocation: the automated
  // summary-figure check still failed because the summary kept the old RPZ
  // framing (Act sections, nationwide-RPZ date, HICP index), none of which the
  // relocated page states.
  { id: 'ie-rtb-rpz-2-percent-rent-cap', sources: ['https://rtb.ie/renting/setting-and-reviewing-private-rents/'],
    note: 'Follow-up to the relocation above: the summary still opened with the old RPZ framing - Residential Tenancies Act sections 19 through 24B, Rent Pressure Zones nationwide since 20 June 2025, and the HICP index - none of which the relocated page states, so the automated summary-figure check failed. The opening now states the national system of rent control from 1 March 2026 (2% or the rate of inflation, measured by the Consumer Price Index) plus the Rent Pressure Zone review deferral the page states, the title follows the page, and an unclear clause about the reset rule is clarified.',
    edits: [
      [{ field: 'title' }, 'Residential Tenancies Board: Rent Pressure Zone (RPZ) 2% statutory rent cap adhering to property (Residential Tenancies Act 2004)', 'Residential Tenancies Board: 2% statutory rent cap for private tenancies from 1 March 2026, Rent Pressure Zone review deferral'],
      ['Under the Irish Residential Tenancies Act 2004 (as amended, Sections 19 through 24B), residential rental properties (in Rent Pressure Zones, which have covered the whole country since 20 June 2025) are subject to a strict statutory rent increase cap of 2% per annum or the Harmonised Index of Consumer Prices (HICP) inflation rate, whichever is lower.', 'Under the national system of rent control that the Residential Tenancies Board applies to all private tenancies from 1 March 2026, rent can only be increased once per year by 2% or the rate of inflation, whichever is lower, with the rate of inflation measured by the Consumer Price Index (CPI). In areas that became a Rent Pressure Zone (RPZ) in the last 2 years, the rent cannot be reviewed until 24 months after the date the rent was last set or reviewed for the tenancy.'],
      ['that rule is in the same page, not only the tenancy agreement.', 'the page lists those cases in full.'] ] }
];

function applyEdits(record, edits) {
  const next = { ...record }; const missing = []; let changed = 0;
  const parsed = edits.map(e => typeof e[0] === 'object' ? [e[0].field, e[1], e[2]] : ['summary', e[0], e[1]]);
  parsed.forEach(([field, from, to]) => {
    const text = next[field] ?? '';
    // Already applied: the replacement is present.
    if (text.includes(to)) return;
    if (text.includes(from)) { next[field] = text.replace(from, to).replace(/\s{2,}/g, ' ').trim(); changed++; return; }
    missing.push(`${field}: ${from.slice(0, 70)}`);
  });
  return { next, missing, changed };
}

export function planCorrections(rows) {
  const byId = new Map(rows.map(r => [r.id, r]));
  const plan = []; const problems = [];
  for (const c of CORRECTIONS) {
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
// database does not bring the old text back. Seed file names are joined under src/.
export function applyToSeedFiles(entries, write) {
  const report = [];
  for (const file of [...SEED_FILES, ...GENERATOR_FILES]) {
    const path = join(root, file.startsWith('scripts/') ? file : 'src', file);
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

// This batch is the first to relocate records to NEW official URLs, and the
// publish queue only fetches sources whose access policy has been reviewed
// (src/publish-queue.js). Scripts must not set that policy with raw SQL -
// test/script-provenance.test.js rejects exactly that - so the registrations
// go through the store's own reviewed registration API (registerSource /
// permitSource), which writes a source_policy_reviews row per change. Tier A
// mirrors what the same authorities already hold: bmj.de was registered as
// tier A, and every other rtb.ie source is tier A.
export const SOURCE_REGISTRATIONS = [
  { id: 'source-de-mietrecht-kaution-schufa-housing-kyc', op: 'register', tier: 'A',
    url: 'https://www.bmjv.de/DE/themen/kaufen_reisen_wohnen/mietrecht/mietrecht_node.html', owner: 'www.bmjv.de',
    reviewer: REVIEWER,
    note: 'Registered for relocating record de-mietrecht-kaution-schufa-housing-kyc: the Federal Ministry of Justice moved bmj.de to bmjv.de and the Mietrecht overview now lives under DE/themen/kaufen_reisen_wohnen/. Same statutory authority as the previously registered bmj.de source (tier A); the page was fetched and checked during the automated correction. Automated correction, not an editorial content review.' },
  { id: 'seed-ie-rtb-rpz-2-percent-rent-cap', op: 'permit', tier: 'A',
    url: 'https://rtb.ie/renting/setting-and-reviewing-private-rents/', owner: 'rtb.ie',
    reviewer: REVIEWER,
    note: 'Policy review for relocating record ie-rtb-rpz-2-percent-rent-cap: rtb.ie restructured all tenant-facing pages under /renting/ and the rent-cap substance lives on the new setting-and-reviewing-private-rents page. Same statutory board as the other registered rtb.ie sources (tier A); the page was fetched and checked during the automated correction. Automated correction, not an editorial content review.' }
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
    const s = SOURCE_REGISTRATIONS.find(x => x.id === op.id);
    if (!s || op.op === 'blocked') continue;
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
