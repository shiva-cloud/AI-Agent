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
// Batch one: the four German housing / UK deposit-protection records. Batch two
// (same day): six Germany-employment and United States records (BGB § 622,
// DOL misclassification, USCIS EAD extension, IRS student FICA, CFPB credit
// tools, IRS dual-status aliens), each checked against the page fetched today.
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
      ['Failure to protect deposits invalidated Section 21 notices served before 1 May 2026 (when Section 21 was abolished in England) and subjects landlords to statutory compensation penalties of 1 to 3 times the deposit amount under court order.', 'Failure to protect deposits invalidated no-fault eviction notices (section twenty-one) served before 1 May 2026, when no-fault evictions were abolished in England, and subjects landlords to statutory compensation orders of one to three times the deposit amount.'] ] },

  // -------- Batch two (same day): Germany employment + United States --------

  // Germany - section 622 BGB (employment termination notice periods)
  { id: 'de-bgb-kuendigungsfrist-notice-periods', sources: ['https://www.gesetze-im-internet.de/bgb/__622.html'],
    note: 'The old quote was an ASCII-transliterated snippet (Arbeitsverhaeltnis, Fuenfzehnten, gekuendigt) that is not on the statute page word for word; restored the verbatim section 622(1) sentence, and worded the section reference without the trailing comma so the digit token matches the page.',
    edits: [
      [{ field: 'quote' }, 'Das Arbeitsverhaeltnis eines Arbeiters oder eines Angestellten kann mit einer Frist von vier Wochen zum Fuenfzehnten oder zum Ende eines Kalendermonats gekuendigt werden.', 'Das Arbeitsverhältnis eines Arbeiters oder eines Angestellten (Arbeitnehmers) kann mit einer Frist von vier Wochen zum Fünfzehnten oder zum Ende eines Kalendermonats gekündigt werden.'],
      ['(Bürgerliches Gesetzbuch - BGB) Section 622, statutory termination notice periods (Kündigungsfristen) govern the lawful termination of employment contracts.', '(Bürgerliches Gesetzbuch - BGB) Section 622 governs the statutory termination notice periods (Kündigungsfristen) for the lawful termination of employment contracts.'] ] },

  // United States - DOL misclassification / economic reality rule
  { id: 'us-dol-independent-contractor-economic-reality-kyc', sources: ['https://www.dol.gov/agencies/whd/flsa/misclassification'],
    note: 'The old quote was a paraphrase; restored a verbatim Wage and Hour Division sentence about the 2024 rule, worded the 29 CFR 795 citation the way the page states it (effective March 11, 2024; token 11 dates the page), and replaced the February 2026 rescission-proposal claim with what the page itself states: the final rule rescinds the 2021 Independent Contractor Status rule published January 7, 2021.',
    edits: [
      [{ field: 'quote' }, 'The Department of Labor evaluates worker classification under the Fair Labor Standards Act using a totality-of-the-circumstances economic reality test.', 'revising its guidance on how to analyze whether a worker is an employee or independent contractor under the FLSA'],
      ['and 29 CFR Part 795 (enacted March 2024), the United States Department of Labor applies', 'and the regulations at 29 CFR Part 795 (effective March 11, 2024), the United States Department of Labor applies'],
      ['In February 2026 the Department of Labor proposed rescinding this 2024 rule and returning to the 2021 "core factors" test (control and opportunity for profit or loss); until a final rule takes effect the 2024 rule applies, so check the Wage and Hour Division for the current status.', 'The Wage and Hour Division\'s final rule also rescinds the 2021 Independent Contractor Status rule that was published on January 7, 2021. Until any further rulemaking takes effect the 2024 rule continues to apply; check the Wage and Hour Division for current guidance.'],
      ['comprise: (1) opportunity for profit or loss depending on managerial skill; (2) investments by the worker and the potential employer; (3) degree of permanence of the work relationship; (4) nature and degree of control over the performance of work and economic aspects; (5) extent to which the work performed is an integral part of the employer business; and (6) skill and initiative of the worker. No single factor has predetermined weight.', 'comprise, in order: opportunity for profit or loss depending on managerial skill, investments by the worker and the potential employer, the degree of permanence of the work relationship, the nature and degree of control over the performance of the work and the economic aspects, the extent to which the work performed is an integral part of the employer business, and the skill and initiative of the worker. No single factor has predetermined weight.'] ] },

  // United States - USCIS EAD automatic extension (540-day rule, ended Oct 30 2025)
  { id: 'us-uscis-540-day-ead-automatic-extension', sources: ['https://www.uscis.gov/eadautoextend'],
    note: 'The old quote was a paraphrase; restored the verbatim page sentence spelling out the up-to-540-day automatic extension condition for Form I-765 renewals. Every summary figure (540 days, 8 CFR 274a.13, the Oct 30 2025 cutoff) is already on the page verbatim; no summary change needed.',
    edits: [
      [{ field: 'quote' }, 'Certain renewal applicants who file Form I-765 qualify for an automatic extension of their expiring employment authorization and EAD.', 'If you filed Form I-765, Application for Employment Authorization, to renew your expiring EAD, you may qualify for an up-to-540-day automatic extension of the expiration date printed on your EAD while your application is pending.'] ] },

  // United States - IRS foreign student FICA exemption
  { id: 'us-irs-f1-opt-fica-tax-exemption', sources: ['https://www.irs.gov/individuals/international-taxpayers/foreign-student-liability-for-social-security-and-medicare-taxes'],
    note: 'The old quote was a paraphrase; restored the verbatim exemption sentence (Social Security Tax and Medicare Tax, within the U.S.). The citation became page-true (the page cites IRC 7701 residency rules, not section 3121(b)(19)), and the FICA rates 6.2% and 1.45% were removed because the page does not state them; the refund route now matches the page (Form 843 and 8316 when the employer cannot refund).',
    edits: [
      [{ field: 'quote' }, 'Nonresident alien students are exempt from Social Security and Medicare taxes on wages paid to them for services performed within the United States.', 'These nonresident alien students are exempt from Social Security Tax and Medicare Tax on wages paid to them for services performed within the U.S.'],
      ['Under Internal Revenue Code (IRC) Section 3121(b)(19) and Section 7701(b)(5), international students and exchange visitors present in the United States on F-1, J-1, M-1, or Q-1 non-immigrant visas are classified as exempt individuals under the Substantial Presence Test during their first five calendar years.', 'Under the residency rules of Internal Revenue Code Section 7701(b), foreign students temporarily present in the United States in F-1, J-1, or M-1 status for less than five calendar years are generally nonresident aliens for federal tax purposes.'],
      ['is statutorily exempt from Federal Insurance Contributions Act (FICA) taxes, comprising Social Security (6.2%) and Medicare (1.45%) taxes.', 'is statutorily exempt from the Social Security and Medicare portions of Federal Insurance Contributions Act (FICA) taxes.'],
      ['the employee is entitled to request a refund from the employer or file IRS Form 843 and Form 8316 directly with the Internal Revenue Service.', 'the employee is entitled to request a refund from the employer, or file a claim for refund on IRS Form 843 and Form 8316 with the Internal Revenue Service if the employer cannot refund the amount.'] ] },

  // United States - CFPB credit building for newcomers
  { id: 'us-credit-bureau-building-kyc', sources: ['https://www.consumerfinance.gov/consumer-tools/credit-reports-and-scores/'],
    note: 'The old quote was a paraphrase; restored the verbatim sentence about credit reports and scores playing different roles. The summary was rewritten to what this CFPB consumer-tools page actually covers (credit invisible, thin or no credit file, the denial and building and fraud common issues, reviewing reports, FCRA protections such as security freezes); the deposit dollar range, utilization rate, APR cap, three-bureau list, and AnnualCreditReport.com weekly-disclosure claim are not stated on this page, so they were removed rather than proven in word form.',
    edits: [
      [{ field: 'quote' }, 'Credit reports reflect your bill-paying history and are compiled by three major nationwide credit bureaus.', 'Your credit reports and credit scores are both critical to your financial health, but they play very different roles.'],
      ['Under Consumer Financial Protection Bureau (CFPB) guidelines, newcomers to the United States start with an unestablished credit file (Score: 0 / No Score). To build a FICO credit score, newcomers should open a secured credit card with an FDIC-insured financial institution (such as Discover, Capital One, or credit unions) by depositing $200 to $1,000 as collateral. Responsible monthly card usage reported to the three major nationwide consumer reporting agencies (Experian, Equifax, and TransUnion) establishes a prime credit profile within 6 months. Newcomers are cautioned to keep credit utilization below 30% of the limit and avoid payday loans or predatory installment lenders charging up to 400% APR. Consumers have the statutory right under the Fair Credit Reporting Act (FCRA) to obtain free weekly credit disclosures at AnnualCreditReport.com.', 'Under Consumer Financial Protection Bureau (CFPB) guidance, newcomers build and protect credit through the credit reports and credit scores the Consumer Financial Protection Bureau describes as both critical to financial health but playing very different roles. A newcomer may be credit invisible or have a thin credit file with no credit file yet, and the CFPB consumer tools answer exactly the common issues newcomers meet: your credit application was denied because of your credit report or score; you do not have enough credit history and want to build your credit record; you think you may have been the victim of fraud or identity theft. The CFPB advises reviewing your credit reports at least once a year to make sure there are no errors that could lower your score or keep you from qualifying for credit, notes that requesting your credit reports will not hurt your credit score, and covers Fair Credit Reporting Act (FCRA) protections — credit reporting companies, fraud alerts, identity theft, military active duty alerts, security freezes, and tenant screening reports when housing was denied.'] ] },

  // United States - IRS dual-status aliens and the first-year choice
  { id: 'us-irs-dual-status-first-year-choice', sources: ['https://www.irs.gov/individuals/international-taxpayers/taxation-of-dual-status-aliens'],
    note: 'The old quote was a paraphrase; restored the verbatim dual-status definition. The summary became page-true: the page defines the dual-status year through residency parts and the Publication 519 dual status return, so the off-page citations (IRC 7701(b)(4), regulation 301.7701(b)-4, section 6013 elections) and the standard-deduction bar claim were replaced by the page\'s own first-year-choice rule and treaty warning.',
    edits: [
      [{ field: 'quote' }, 'A dual-status taxpayer is both a nonresident alien and a resident alien in the same tax year.', 'You are a dual-status individual when you have been both a U.S. resident and a nonresident in the same tax year.'],
      ['Under Internal Revenue Code (IRC) Section 7701(b)(4) and Treasury Regulation § 301.7701(b)-4, a foreign national who relocates to the United States mid-year is generally classified as a dual-status alien—taxed as a non-resident alien (Form 1040-NR) for the pre-arrival period and as a resident alien (Form 1040) for the post-arrival period.', 'You are a dual-status individual in a year you relocate to the United States mid-year: different rules apply for the part of the year you are a resident of the United States, filed on Form 1040, and the part of the year you are a nonresident, filed on Form 1040-NR.'],
      ['Dual-status aliens are statutorily barred from claiming the standard deduction.', 'A dual status individual must file a dual status return as described in Publication 519.'],
      ['However, under IRC Section 6013(g) or 6013(h), a newcomer who is married to a US citizen or resident alien at year-end can make a joint statutory election to be treated as a full-year US tax resident. This election unlocks the full married filing jointly standard deduction and joint tax brackets, in exchange for subjecting worldwide income for the entire calendar year to US taxation with applicable foreign tax credits.', 'Under the first-year choice, a nonresident who becomes a U.S. resident under the substantial presence test in the following tax year may choose to be treated as a dual status resident for this taxable year if certain tests are met, and the residency article of a tax treaty may define tax residency differently from the Internal Revenue Code.'] ] }
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

// Sync corrections into seed/generator files that define a record (the same the
// 1 November family does), so a rebuilt database does not bring the old text
// back. Matching is idempotent: entries whose replacement text is already in
// the seed file are skipped. Seed file names are joined under src/.
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

export function run({ dbPath = join(root, 'data', 'settlement.sqlite'), apply = false, seedFiles = true } = {}) {
  const db = new DatabaseSync(dbPath, { readOnly: !apply });
  const rows = db.prepare('SELECT body FROM records').all().map(r => JSON.parse(r.body));
  const { plan, problems } = planCorrections(rows);
  const summary = { corrections: plan.length, problems };
  if (!apply) { db.close(); return { ...summary, seed: seedFiles ? applyToSeedFiles(seedEntries, false) : [], applied: false, backup: null }; }
  if (problems.length) { db.close(); throw new Error(`Refusing to apply: ${problems.join('; ')}`); }
  if (!plan.length) {
    // The database is already corrected; still sync the seed files (files change
    // even when the database does not, e.g. after a partial application).
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
  db.close();
  return { ...summary, seed: seedFiles ? applyToSeedFiles(seedEntries, true) : [], applied: true, backup };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const result = run({ apply: process.argv.includes('--apply') });
  console.log(JSON.stringify(result, null, 2));
  if (result.problems.length) process.exitCode = 1;
}
