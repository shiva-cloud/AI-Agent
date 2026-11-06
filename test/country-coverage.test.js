import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { listSupportedCorridorCodes, getCorridor } from '../src/corridors-registry.js';
import { countrySettlementRecords } from '../src/country-settlement.js';
import { countryPortals } from '../src/country-portals.js';
import { countryCoverage } from '../src/engine.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const BIG_TWELVE = {
  Australia: 40, 'United States': 39, 'United Kingdom': 37, Germany: 33,
  'United Arab Emirates': 26, 'New Zealand': 23, France: 16, Ireland: 15,
  Netherlands: 14, Singapore: 13, Spain: 13, Sweden: 12
};
const CITIES = ['Toronto', 'Mississauga', 'Brampton', 'Vancouver', 'Calgary', 'Ottawa', 'Montreal'];

// Lower bounds only: less is a regression to investigate, more is welcome.
// These freeze the coverage the 3 November 2026 analysis documented so that
// removals below the current build fail loudly instead of silently. The
// per-country and rest-of-world figures were re-frozen after the jurisdiction
// naming normalization moved 5 records out of "rest" into the big-12 country
// counts (scripts/jurisdiction-normalize-2026-11-03.js), and the
// publication-chain floor was re-frozen three times the same day: the automated
// publish-queue run (56), the quote-restoration corrections run (60), and the
// second quote-restore batch of six Germany/US records (66).

test('every corridor defines a complete country contract', () => {
  const codes = listSupportedCorridorCodes();
  assert.ok(codes.length >= 13, 'thirteen supported corridors');
  for (const code of codes) {
    const corridor = getCorridor(code);
    for (const field of ['code', 'name', 'currency', 'currencySymbol', 'ministry', 'healthService', 'taxId', 'housingLaw']) {
      assert.ok(corridor[field], `${code}.${field} is set`);
    }
    for (const field of ['workPrograms', 'prSchemes', 'studyPrograms', 'officialLanguages', 'tierADomains']) {
      assert.ok(Array.isArray(corridor[field]) && corridor[field].length, `${code}.${field} lists entries`);
    }
  }
});

test('per-country settlement seeds keep their reviewed quality floor', () => {
  assert.ok(countrySettlementRecords.length >= 54, '54 originating-country records');
  assert.equal(new Set(countrySettlementRecords.map(r => r.jurisdiction)).size, countrySettlementRecords.length, 'one record per country');
  for (const r of countrySettlementRecords) {
    assert.equal(r.status, 'approved');
    assert.equal(r.language, 'en');
    assert.ok(r.url.startsWith('https://'));
    assert.ok((r.quote || '').length > 5, `${r.id} carries a quote`);
    assert.ok((r.reviewBasis || '').length > 10, `${r.id} states its review basis`);
    assert.ok(ISO_DATE.test(r.checkedAt || ''), `${r.id} checkedAt is an ISO date`);
    assert.ok(ISO_DATE.test(r.expiresAt || ''), `${r.id} expiresAt is an ISO date`);
  }
});

test('country portal registry keeps its researched entry-point floor', () => {
  assert.ok(countryPortals.length >= 177, '177 researched country portals');
  const ids = countryPortals.map(p => p.id);
  assert.equal(new Set(ids).size, ids.length, 'portal ids unique');
  for (const p of countryPortals) {
    assert.ok(p.url.startsWith('https://'), `${p.id} uses https`);
    assert.ok(Array.isArray(p.aliases) && p.aliases.length, `${p.id} has name aliases`);
  }
});

test('market-gap catalog batches keep their researched question floor (served withheld until reviewed)', () => {
  const batches = ['batch1.json', 'batch2.json', 'batch3.json']
    .map(f => JSON.parse(readFileSync(join(root, 'src', 'market-gap', f), 'utf8')));
  const allIds = new Set();
  for (const rows of batches) {
    assert.ok(rows.length >= 2000, 'at least 2,000 researched rows per batch');
    assert.ok(new Set(rows.map(r => r.country)).size >= 78, 'at least 78 countries per batch');
    for (const row of rows) {
      assert.ok(row.id && row.country && row.topic && row.question && row.scenarioName, 'row carries research fields');
      allIds.add(row.id);
    }
  }
  assert.equal(allIds.size, batches.reduce((a, b) => a + b.length, 0), 'query ids unique across batches');
});

test('evidence database coverage floors hold when the database is present', (t) => {
  const dbPath = join(root, 'data', 'settlement.sqlite');
  if (!existsSync(dbPath)) {
    // The evidence database is a local artifact, not a git file; fresh CI runs
    // seed it separately. Skip rather than fail on machines without it.
    t.skip('evidence database not present on this machine');
    return;
  }
  const db = new DatabaseSync(dbPath, { readOnly: true });
  t.after(() => db.close());
  const parse = (b) => { try { return JSON.parse(b); } catch { return null; } };
  const recs = db.prepare('SELECT id, body FROM records').all().map(r => ({ id: r.id, ...parse(r.body) })).filter(Boolean);
  const auditedIds = new Set(db.prepare('SELECT DISTINCT record_id FROM audits WHERE note IS NOT NULL AND reviewer IS NOT NULL').all().map(r => r.record_id));
  const publishedIds = new Set(db.prepare('SELECT DISTINCT record_id FROM publications').all().map(r => r.record_id));

  const group = (r) => {
    if (r.jurisdiction === 'CA') return 'CA-federal';
    if (r.jurisdiction === 'ON') return 'ON';
    if (r.jurisdiction === 'BC') return 'BC';
    if (CITIES.includes(r.jurisdiction)) return 'cities';
    if (BIG_TWELVE[r.jurisdiction]) return 'BIG-12';
    return 'rest';
  };

  assert.ok(recs.length >= 906, '906 records overall');
  assert.ok(recs.filter(r => group(r) === 'CA-federal').length >= 113, 'Canada federal floor');
  assert.ok(recs.filter(r => group(r) === 'ON').length >= 51, 'Ontario floor');
  assert.ok(recs.filter(r => group(r) === 'BC').length >= 14, 'British Columbia floor');
  assert.ok(recs.filter(r => group(r) === 'cities').length >= 29, 'city layer floor');
  for (const [country, floor] of Object.entries(BIG_TWELVE)) {
    assert.ok(recs.filter(r => r.jurisdiction === country).length >= floor, `${country} floor ${floor}`);
  }
  const rest = recs.filter(r => group(r) === 'rest');
  assert.ok(rest.length >= 418, 'rest-of-world floor');
  assert.ok(new Set(rest.map(r => r.jurisdiction)).size >= 212, 'rest-of-world country floor');

  const avgLen = (list) => list.reduce((a, r) => a + (r.summary || '').length, 0) / Math.max(list.length, 1);
  assert.ok(avgLen(recs.filter(r => group(r) === 'CA-federal')) >= 850, 'Canada federal summary depth');
  assert.ok(avgLen(recs.filter(r => group(r) === 'BIG-12')) >= 830, 'big-12 summary depth');
  assert.ok(avgLen(rest) >= 480, 'rest-of-world summary depth');

  for (const r of recs) {
    assert.equal(r.language, 'en', `${r.id} uses the English-only contract`);
    assert.ok((r.quote || '').length > 5, `${r.id} carries a quote`);
    assert.ok((r.reviewBasis || '').length > 5, `${r.id} states its review basis`);
    assert.ok(['approved', 'pending', 'rejected', 'research_seed'].includes(r.status), `${r.id} status is a known value`);
    assert.ok(['low', 'high'].includes(r.risk), `${r.id} risk is a known value`);
    assert.ok(ISO_DATE.test(r.checkedAt || ''), `${r.id} checkedAt is an ISO date`);
    assert.ok(ISO_DATE.test(r.expiresAt || ''), `${r.id} expiresAt is an ISO date`);
  }

  assert.ok(auditedIds.size >= 864, 'editorial audit trail floor');
  // Refrozen 4 November 2026: the dead-link repair batches relocated
  // de-mietrecht-kaution-schufa-housing-kyc (bmj.de -> bmjv.de),
  // ie-rtb-rpz-2-percent-rent-cap (rtb.ie restructured /renting/ tree) and
  // ie-rtb-security-deposit-and-rpz-protection-kyc (same restructure), and the
  // quote-drift batch restored verbatim quotes for ontario-rent-increase-guideline,
  // uk-tenancy-deposit-scheme-tds-kyc and uk-private-rented-epc-mees-regulations-kyc,
  // and the quote-drift/short-quote batch four restored five more: BGB section 551
  // deposit installments, IRCC work-off-campus 186(v), IRCC Express Entry overview,
  // IRCC ECA for Express Entry, and Ontario improper-rent-increase disputes.
  // Refrozen 5 November 2026: the quote-drift/short-quote batch five restored
  // five more from their live pages: IRCC maintained status (the R183(5)
  // extension rule), IRCC dual intent (subsection A22(2)), the IRCC CRS
  // criteria grid (with the November 3, 2026 job-offer changes), GOV.UK
  // right-to-rent document checks, and ESDC employer compliance.
  // The quote-drift/short-quote batch six restored six more, all IRCC pages:
  // maintained-status travel (re-entry/R190), the police-certificate overview
  // (heading quote), working off campus (24-hour rule), how to get a police
  // certificate, Express Entry police certificates, and about-the-PGWP.
  // The batch seven restored six more from their live pages: the Federal
  // Skilled Worker work-experience minimums (1,560 hours), CEC qualifying
  // work experience (R87.1(3)(b) exclusion), the Service Canada SIN
  // application page (working while a SIN is expired), the Ontario ESA
  // severance pay guide, GOV.UK's Graduate visa (18 months / 2 years split),
  // and IRCC's what-is-work guidance. The batch eight restored twelve more
  // from their live pages: the GOV.UK Innovator Founder visa, ILR for
  // Skilled Worker visas, the 3C-and-3D-leave and continuous-residence
  // publications, the Graduate visa page again (a different block), the
  // Scale-up Worker visa, the IRCC implied-status page again (a different
  // block), the CEC qualifying-work-experience page again (a different
  // block), the Skilled Worker visa and right-to-work KYC pages, the
  // Ontario professions page and the ESA payment-of-wages guide (106
  // distinct published records).
  // Refrozen 5 November 2026: the summary-figure batch nine repaired nineteen
  // records whose figures the page check could not verify inside the evidence
  // window around the quote (CMHC stat-block re-anchoring for the Vancouver
  // and Toronto records, off-window or off-page figures dropped elsewhere)
  // and republished them - eighteen of the nineteen had been published in
  // earlier rounds and drifted off the check when their pages changed (107
  // distinct published records; only the Ontario post-2018 exemption record
  // is new to the chain).
  // Refrozen again the same day: the short-quote batch ten repaired eleven
  // records whose quotes were page headings or fragments (with one relocation
  // from the Section 18b to the Section 18c Einzelnorm of gesetze-im-internet)
  // and republished them - all eleven are new to the publication chain (118
  // distinct published records).
  // Refrozen a third time the same day: slice two of the short-quote batch
  // repaired fourteen more heading-quote records - the USCIS OPT, EB-1/2/3,
  // EB-5, L-1A and CSPA pages, the MOM EP and S Pass eligibility pages, the
  // IND highly-skilled-migrant and start-up pages, the INZ AEWV, Straight to
  // Residence and post-study work pages, and the CRA folio and newcomers
  // pages - and republished them - all fourteen are new to the publication
  // chain (132 distinct published records).
  // Refrozen a fourth time the same day: short-quote batch eleven repaired
  // sixteen more heading-quote records - the FCAC bank-account page, the ATO
  // DASP page, IRS Publication 519, the HMRC RDR3 landing page, the IRAS tax
  // residency page, the UAE FTA corporate-tax hub, the ICBC, Ontario, DVLA,
  // USA.gov, Sarathi and BSN driving/sin pages, the CCTS telecom page and the
  // Ontario-childcare, TDSB and VSB registration pages - and republished
  // them - all sixteen are new to the publication chain (148 distinct
  // published records).
  // Refrozen a fifth time the next day: short-quote batch twelve repaired
  // eight more heading-quote records - the four Home Affairs script-rendered
  // visa pages (bridging visa B, subclass 188, 186 and 485), the MOM work-pass
  // exemption page, and the KBA, FRSC and LTO driving portals - and
  // republished them - all eight are new to the publication chain (156
  // distinct published records).
  // Refrozen a sixth time the next day: short-quote batch thirteen repaired
  // and published fifteen more - the INZ Skilled Migrant Category record and
  // the three make-it-in-germany records relocated to their AufenthG statute
  // texts, plus eleven country-portal records re-quoted from stable verbatim
  // page sentences (171 distinct published records).
  // Refrozen a tenth time the same day: community-slice batch seventeen
  // replaced three pilot paraphrase quotes with verbatim page sentences -
  // the IRB NDP index, Legal Aid Ontario, and Amsterdam's first-registration
  // page via its archived copy (187 distinct published records).
  assert.ok(publishedIds.size >= 187, 'publication-chain floor');
});

test('countryCoverage engine function produces structured global coverage matrix', () => {
  const sample = [
    { id: 'au-medicare', jurisdiction: 'Australia', topic: 'healthcare', url: 'https://servicesaustralia.gov.au' },
    { id: 'au-nsw-tenancy', jurisdiction: 'NSW', destinationCountry: 'Australia', topic: 'housing', url: 'https://fairtrading.nsw.gov.au' },
    { id: 'ca-fed-sin', jurisdiction: 'CA', topic: 'identification', url: 'https://canada.ca' },
    { id: 'ca-on-ohip', jurisdiction: 'ON', topic: 'healthcare', url: 'https://ontario.ca' },
    { id: 'ca-toronto-welcome', jurisdiction: 'Toronto', topic: 'settlement', url: 'https://toronto.ca' },
    { id: 'jp-resident', jurisdiction: 'Japan', topic: 'residency', url: 'https://mofa.go.jp' }
  ];
  const matrix = countryCoverage(sample, new Date('2026-11-03T12:00:00Z'));
  assert.equal(matrix.asOf, '2026-11-03');
  assert.equal(matrix.big12.length, 12);
  const au = matrix.big12.find(c => c.country === 'Australia');
  assert.ok(au);
  assert.equal(au.nationalRecords, 1);
  assert.equal(au.subnationalRecords, 1);
  assert.equal(au.totalRecords, 2);
  assert.deepEqual(au.subnationalRegions, ['NSW']);
  assert.equal(au.topicsCovered, 2);
  assert.equal(matrix.canada.federalRecords, 1);
  assert.equal(matrix.canada.provincialRecords, 1);
  assert.equal(matrix.canada.cityRecords, 1);
  assert.equal(matrix.restOfWorld.totalRecords, 1);
  assert.equal(matrix.restOfWorld.distinctCountriesCount, 1);
});

test('countryCoverage against real evidence database verifies subnational parity across Big-12', (t) => {
  const dbPath = join(root, 'data', 'settlement.sqlite');
  if (!existsSync(dbPath)) {
    t.skip('evidence database not present on this machine');
    return;
  }
  const db = new DatabaseSync(dbPath, { readOnly: true });
  t.after(() => db.close());
  const parse = (b) => { try { return JSON.parse(b); } catch { return null; } };
  const recs = db.prepare('SELECT id, body FROM records').all().map(r => ({ id: r.id, ...parse(r.body) })).filter(Boolean);
  const matrix = countryCoverage(recs);
  assert.equal(matrix.big12.length, 12);
  for (const c of matrix.big12) {
    assert.ok(c.nationalRecords >= 10, `${c.country} national records floor`);
    assert.ok(c.topicsCovered >= 13, `${c.country} topics parity`);
    assert.equal(c.status, 'complete_parity');
  }
  const au = matrix.big12.find(c => c.country === 'Australia');
  assert.ok(au.subnationalRecords >= 20, 'Australia subnational floor');
  assert.ok(au.subnationalRegions.includes('New South Wales') || au.subnationalRegions.includes('Sydney'));

  const us = matrix.big12.find(c => c.country === 'United States');
  assert.ok(us.subnationalRecords >= 40, 'US subnational floor');
  assert.ok(us.subnationalRegions.includes('California') && us.subnationalRegions.includes('New York'));

  const uk = matrix.big12.find(c => c.country === 'United Kingdom');
  assert.ok(uk.subnationalRecords >= 15, 'UK subnational floor');
  assert.ok(uk.subnationalRegions.includes('Scotland') && uk.subnationalRegions.includes('Wales'));

  const de = matrix.big12.find(c => c.country === 'Germany');
  assert.ok(de.subnationalRecords >= 5, 'Germany subnational floor');
  assert.ok(de.subnationalRegions.includes('Berlin') && de.subnationalRegions.includes('Bavaria'));

  const ae = matrix.big12.find(c => c.country === 'United Arab Emirates');
  assert.ok(ae.subnationalRecords >= 10, 'UAE subnational floor');
  assert.ok(ae.subnationalRegions.includes('Dubai') && ae.subnationalRegions.includes('Abu Dhabi'));
});
