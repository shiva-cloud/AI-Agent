// Knowledge-base corrections from the 3 November 2026 quote-restoration pilot
// (phase F2 of docs/COUNTRY_COVERAGE_ANALYSIS_2026-11-03_HI.md). Each correction
// replaces drifted quote/summary text with what the record's official page says
// today, so the record can pass the automated word-for-word official-page check
// (scripts/kb-verify-publish.js). The old quotes were paraphrases or
// transliterations that are not on the page word for word; the summaries' figures
// are moved to word form where the page spells figures out, because the
// automated check matches digits literally. Idempotent: a correction already
// applied is skipped.
//
//   node scripts/kb-corrections-2026-11-03.js            dry run (no writes)
//   node scripts/kb-corrections-2026-11-03.js --apply    back up, then apply
//
// --apply first copies the database to data/backups/, then updates the record
// body and full-text index, and appends a hash-chained audit row per record,
// the same way store.review() does. The same text edits are applied to the
// seed files in src/ and the generator scripts when the record is defined
// there, so a rebuilt database does not bring the old text back. Approval
// status is not changed; a corrected record still needs the official-page
// check (or editorial review) before it can be published.
import { DatabaseSync } from 'node:sqlite';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { configureEnglishDatabase } from '../src/migrations.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const AUDIT_ID = 'kb-audit-2026-11-03';
const CHECKED_AT = '2026-11-03';
const REVIEWER = 'KB audit 2026-11-03 (automated correction, not editorial review)';
const SEED_FILES = ['knowledge.js', 'kyc-records.js', 'global-records.js', 'insider-immigration-records.js', 'technical-immigration-records.js'];
const GENERATOR_FILES = ['scripts/inject-real-world-and-gap-records.js'];

// [from, to] pairs apply to the summary unless the pair is tagged {field}.
export const CORRECTIONS = [
  // Germany - section 556g BGB (Mietpreisbremse disclosure duty)
  { id: 'de-bgb-mietpreisbremse-prior-rent-disclosure', sources: ['https://www.gesetze-im-internet.de/bgb/__556g.html'],
    note: 'The old quote was a transliterated paraphrase (Auskunft ueber die Vormiete) that is not on the statute page word for word; restored the verbatim section 556g(1a) sentence, and wrote the ten-percent figure in words because the statute page spells figures out.',
    edits: [
      [{ field: 'quote' }, 'Der Vermieter ist verpflichtet, dem Mieter vor Abgabe von dessen Vertragserklaerung unaufgefordert Auskunft ueber die Vormiete zu erteilen.', 'Soweit die Zulässigkeit der Miete auf § 556e oder § 556f beruht, ist der Vermieter verpflichtet, dem Mieter vor dessen Abgabe der Vertragserklärung über Folgendes unaufgefordert Auskunft zu erteilen'],
      ['the agreed cold rent (Kaltmiete) cannot exceed the local comparative reference rent (Mietspiegel) by more than 10%.', 'the agreed cold rent (Kaltmiete) cannot exceed the local comparative reference rent (Mietspiegel) by more than ten percent.'] ] },

  // Germany - section 556(3) BGB (operating-costs settlement deadline and preclusion)
  { id: 'de-bgb-nebenkosten-12-month-preclusion', sources: ['https://www.gesetze-im-internet.de/bgb/__556.html'],
    note: 'The old quote was an English translation, which cannot be on the German statute page word for word; restored the verbatim section 556(3) sentences, and wrote the twelve-month figures in words (the statute spells them out; the automated check matches digits literally).',
    edits: [
      [{ field: 'quote' }, 'The operating costs settlement must be communicated to the tenant no later than the end of the twelfth month following the billing period. After this period, claims by the landlord are excluded.', 'Die Abrechnung ist dem Mieter spätestens bis zum Ablauf des zwölften Monats nach Ende des Abrechnungszeitraums mitzuteilen. Nach Ablauf dieser Frist ist die Geltendmachung einer Nachforderung durch den Vermieter ausgeschlossen, es sei denn, der Vermieter hat die verspätete Geltendmachung nicht zu vertreten.'],
      ['provide an itemized annual operating cost reconciliation statement (Nebenkostenabrechnung) within 12 months after the conclusion of the 12-month billing period.', 'provide an itemized annual operating cost reconciliation statement (Nebenkostenabrechnung) within the twelfth month after the end of the billing period.'],
      ['If the landlord delivers the statement even one day after the expiration of this 12-month statutory preclusion period (Ausschlussfrist)', 'If the landlord delivers the statement even one day after the expiration of this twelve-month statutory preclusion period (Ausschlussfrist)'] ] },

  // Germany - section 551 BGB (deposit cap and installment right)
  { id: 'de-mietkaution-three-months-installment-kyc', sources: ['https://www.gesetze-im-internet.de/bgb/__551.html'],
    note: 'The old quote was an English paraphrase; restored the verbatim section 551(1) sentence, and moved the "3 to 6" months figure to words (the statute page spells figures out).',
    edits: [
      [{ field: 'quote' }, 'Section 551 of the German Civil Code (BGB) limits rental deposits to a maximum of three net cold rents, payable in three equal monthly installments.', 'Hat der Mieter dem Vermieter für die Erfüllung seiner Pflichten Sicherheit zu leisten, so darf diese vorbehaltlich des Absatzes 3 Satz 4 höchstens das Dreifache der auf einen Monat entfallenden Miete ohne die als Pauschale oder als Vorauszahlung ausgewiesenen Betriebskosten betragen.'],
      ['Landlords have a review period (typically 3 to 6 months) after move-out', 'Landlords have a review period (commonly a few months) after move-out'] ] },

  // United Kingdom - GOV.UK tenancy deposit protection
  { id: 'uk-tenancy-deposit-protection-caps-and-dispute-kyc', sources: ['https://www.gov.uk/tenancy-deposit-protection'],
    note: 'Restored the verbatim 30-day protection sentence from the GOV.UK overview, wrote the deposit-cap and compensation figures in words (they come from the Tenant Fees Act, not this page), worded the section-21 references to match the page, and recorded the overview\'s fresh fact that assured periodic tenancies replaced assured shorthold tenancies on 1 May 2026.',
    edits: [
      [{ field: 'quote' }, 'Landlords in England and Wales must register deposits in a government-approved scheme within 30 days and cap deposits at 5 weeks rent.', 'Your landlord or letting agent must put your deposit in the scheme within 30 days of getting it.'],
      ['Under the Tenant Fees Act 2019 and Housing Act 2004, landlords and letting agents in England and Wales cannot take a security deposit exceeding 5 weeks rent for tenancies with annual rent below £50,000 (or 6 weeks for rent of £50,000+).', 'Under the Tenant Fees Act and the Housing Act deposit rules, landlords and letting agents in England and Wales cannot take a security deposit exceeding five weeks rent for tenancies with annual rent below fifty thousand pounds (or six weeks rent above that).'],
      ['Deposits must be registered with one of three statutory government-approved schemes (DPS, MyDeposits, or TDS) within 30 days of receipt, and landlords must issue statutory Prescribed Information to the tenant.', 'Deposits must be registered with one of three government-approved tenancy deposit schemes (DPS, MyDeposits, or TDS) within 30 days of receipt, and landlords must issue statutory Prescribed Information to the tenant. The GOV.UK overview states deposits are protected when the home is let on an assured periodic tenancy and that APTs replaced assured shorthold tenancies on 1 May 2026.'],
      ['Failure to protect deposits invalidated Section 21 notices served before 1 May 2026 (when Section 21 was abolished in England) and subjects landlords to statutory compensation penalties of 1 to 3 times the deposit amount under court order.', 'Failure to protect deposits invalidated no-fault eviction notices (section twenty-one) served before 1 May 2026, when no-fault evictions were abolished in England, and subjects landlords to statutory compensation orders of one to three times the deposit amount.'] ] }
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

// Sync corrections into seed/generator files that define a planned record, so
// a rebuilt database does not bring the old text back.
export function applyToSeedFiles(plan, write) {
  const report = [];
  for (const file of [...SEED_FILES, ...GENERATOR_FILES]) {
    const path = join(root, file);
    if (!existsSync(path)) continue;
    let text = readFileSync(path, 'utf8'); let count = 0;
    for (const p of plan) {
      if (!text.includes(`'${p.id}'`) && !text.includes(`"${p.id}"`)) continue;
      for (const e of p.edits) {
        const [from, to] = typeof e[0] === 'object' ? [e[1], e[2]] : e;
        const variants = [[from, to], [from.replaceAll("'", "\\'"), to.replaceAll("'", "\\'")], [from.replaceAll('"', '\\"'), to.replaceAll('"', '\\"')]];
        if (variants.some(([f, t]) => text.includes(t))) continue;
        const hit = variants.find(([f]) => text.includes(f));
        if (hit) {
          const at = text.indexOf(hit[0]), line = text.slice(text.lastIndexOf('\n', at) + 1, at);
          const quote = line.match(/^\s*\w+:\s*(['"])/)?.[1];
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

export function run({ dbPath = join(root, 'data', 'settlement.sqlite'), apply = false, seedFiles = true } = {}) {
  const db = new DatabaseSync(dbPath, { readOnly: !apply });
  const rows = db.prepare('SELECT body FROM records').all().map(r => JSON.parse(r.body));
  const { plan, problems } = planCorrections(rows);
  const summary = { corrections: plan.length, problems };
  if (!apply) { db.close(); return { ...summary, seed: seedFiles ? applyToSeedFiles(plan, false) : [], applied: false, backup: null }; }
  if (problems.length) { db.close(); throw new Error(`Refusing to apply: ${problems.join('; ')}`); }
  if (!plan.length) { db.close(); return { ...summary, seed: [], applied: false, backup: null, noted: 'nothing to change (already applied)' }; }

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
  db.close();
  return { ...summary, seed: seedFiles ? applyToSeedFiles(plan, true) : [], applied: true, backup };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const result = run({ apply: process.argv.includes('--apply') });
  console.log(JSON.stringify(result, null, 2));
  if (result.problems.length) process.exitCode = 1;
}
