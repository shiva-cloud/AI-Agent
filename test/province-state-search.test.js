import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, answer } from '../src/engine.js';
import { auditAustralianTenancy } from '../src/australia-tenancy-tribunal-navigator.js';
import { auditUsStateTenancy } from '../src/us-state-tenancy-navigator.js';
import { auditUkDevolvedTenancy } from '../src/uk-tenancy-devolved-navigator.js';
import { auditUaeTenancy, calculateDubaiReraIncrease } from '../src/uae-tenancy-dispute-navigator.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dbPath = join(root, 'data', 'settlement.sqlite');

test('Province-wise and state-wise search resolves correctly without location clarification errors', () => {
  // 1. Canadian provinces
  const qAlberta = parse({ question: 'Rent rules in Alberta' });
  assert.equal(qAlberta.region, 'AB');
  assert.equal(qAlberta.country, 'CA');
  assert.equal(qAlberta.ambiguous, false);
  assert.equal(qAlberta.missingSlots.includes('location'), false);

  const qOntario = parse({ question: 'Tenant rights in Ontario' });
  assert.equal(qOntario.region, 'ON');
  assert.equal(qOntario.country, 'CA');
  assert.equal(qOntario.ambiguous, false);
  assert.equal(qOntario.missingSlots.includes('location'), false);

  const qSask = parse({ question: 'Health card in Saskatchewan' });
  assert.equal(qSask.region, 'SK');
  assert.equal(qSask.country, 'CA');
  assert.equal(qSask.ambiguous, false);

  const qManitoba = parse({ question: 'Rent increase guidelines in Manitoba' });
  assert.equal(qManitoba.region, 'MB');
  assert.equal(qManitoba.country, 'CA');
  assert.equal(qManitoba.ambiguous, false);

  const qNovaScotia = parse({ question: 'Health insurance in Nova Scotia' });
  assert.equal(qNovaScotia.region, 'NS');
  assert.equal(qNovaScotia.country, 'CA');
  assert.equal(qNovaScotia.ambiguous, false);

  const qNewBrunswick = parse({ question: 'Rent rules in New Brunswick' });
  assert.equal(qNewBrunswick.region, 'NB');
  assert.equal(qNewBrunswick.country, 'CA');
  assert.equal(qNewBrunswick.ambiguous, false);

  const qNewfoundland = parse({ question: 'Health coverage in Newfoundland' });
  assert.equal(qNewfoundland.region, 'NL');
  assert.equal(qNewfoundland.country, 'CA');
  assert.equal(qNewfoundland.ambiguous, false);

  const qPEI = parse({ question: 'Tenancy rules in Prince Edward Island' });
  assert.equal(qPEI.region, 'PE');
  assert.equal(qPEI.country, 'CA');
  assert.equal(qPEI.ambiguous, false);

  const qYukon = parse({ question: 'Health insurance in Yukon' });
  assert.equal(qYukon.region, 'YT');
  assert.equal(qYukon.country, 'CA');
  assert.equal(qYukon.ambiguous, false);

  const qNWT = parse({ question: 'Rent rules in Northwest Territories' });
  assert.equal(qNWT.region, 'NT');
  assert.equal(qNWT.country, 'CA');
  assert.equal(qNWT.ambiguous, false);

  const qNunavut = parse({ question: 'Health services in Nunavut' });
  assert.equal(qNunavut.region, 'NU');
  assert.equal(qNunavut.country, 'CA');
  assert.equal(qNunavut.ambiguous, false);

  // 2. US states
  const qCalifornia = parse({ question: 'Tenant rights in California', country: 'United States' });
  assert.equal(qCalifornia.region, 'California');
  assert.equal(qCalifornia.country, 'United States');
  assert.equal(qCalifornia.ambiguous, false);
  assert.equal(qCalifornia.missingSlots.includes('location'), false);

  const qTexas = parse({ question: 'Rent rules in Texas', country: 'United States' });
  assert.equal(qTexas.region, 'Texas');
  assert.equal(qTexas.country, 'United States');
  assert.equal(qTexas.ambiguous, false);

  const qWA = parse({ question: 'Tenant rights in Washington State', country: 'United States' });
  assert.equal(qWA.region, 'Washington State');
  assert.equal(qWA.country, 'United States');
  assert.equal(qWA.ambiguous, false);

  const qIL = parse({ question: 'Rent rules in Illinois', country: 'United States' });
  assert.equal(qIL.region, 'Illinois');
  assert.equal(qIL.country, 'United States');
  assert.equal(qIL.ambiguous, false);

  // 3. Australian states (disambiguating New South Wales from UK Wales)
  const qNSW = parse({ question: 'Tenant rights in New South Wales', country: 'Australia' });
  assert.equal(qNSW.region, 'New South Wales');
  assert.equal(qNSW.country, 'Australia');
  assert.equal(qNSW.ambiguous, false);
  assert.equal(qNSW.missingSlots.includes('location'), false);

  const qVic = parse({ question: 'Tenant rights in Victoria', country: 'Australia' });
  assert.equal(qVic.region, 'Victoria');
  assert.equal(qVic.country, 'Australia');
  assert.equal(qVic.ambiguous, false);

  const qQLD = parse({ question: 'Rental rules in Queensland', country: 'Australia' });
  assert.equal(qQLD.region, 'Queensland');
  assert.equal(qQLD.country, 'Australia');
  assert.equal(qQLD.ambiguous, false);

  const qSA = parse({ question: 'Tenancy rules in South Australia', country: 'Australia' });
  assert.equal(qSA.region, 'South Australia');
  assert.equal(qSA.country, 'Australia');
  assert.equal(qSA.ambiguous, false);

  // 4. German states
  const qBavaria = parse({ question: 'Mietpreisbremse in Bavaria', country: 'Germany' });
  assert.equal(qBavaria.region, 'Bavaria');
  assert.equal(qBavaria.country, 'Germany');
  assert.equal(qBavaria.ambiguous, false);

  // 5. UK nations
  const qEngland = parse({ question: 'Tenant eviction rules in England', country: 'United Kingdom' });
  assert.equal(qEngland.region, 'England');
  assert.equal(qEngland.country, 'United Kingdom');
  assert.equal(qEngland.ambiguous, false);

  // 6. UAE Emirates
  const qSharjah = parse({ question: 'Tenancy contract in Sharjah', country: 'United Arab Emirates' });
  assert.equal(qSharjah.region, 'Sharjah');
  assert.equal(qSharjah.country, 'United Arab Emirates');
  assert.equal(qSharjah.ambiguous, false);

  // 7. Spain Autonomous Communities
  const qCatalonia = parse({ question: 'Tenant rights in Catalonia', country: 'Spain' });
  assert.equal(qCatalonia.region, 'Catalonia');
  assert.equal(qCatalonia.country, 'Spain');
  assert.equal(qCatalonia.ambiguous, false);

  // 8. New Zealand Regions
  const qCanterbury = parse({ question: 'Rental rules in Canterbury', country: 'New Zealand' });
  assert.equal(qCanterbury.region, 'Canterbury');
  assert.equal(qCanterbury.country, 'New Zealand');
  assert.equal(qCanterbury.ambiguous, false);
});

test('Dropdown province/state selection sets region and clears city slot', () => {
  const p1 = parse({ question: 'How do rent rules work?', city: 'Alberta' });
  assert.equal(p1.region, 'AB');
  assert.equal(p1.city, null);
  assert.equal(p1.ambiguous, false);

  const p2 = parse({ question: 'How do tenant rights work?', city: 'California', country: 'United States' });
  assert.equal(p2.region, 'California');
  assert.equal(p2.city, null);
  assert.equal(p2.ambiguous, false);

  const p3 = parse({ question: 'How do tenant rights work?', city: 'New South Wales', country: 'Australia' });
  assert.equal(p3.region, 'New South Wales');
  assert.equal(p3.city, null);
  assert.equal(p3.ambiguous, false);

  const p4 = parse({ question: 'How do rent rules work?', city: 'Catalonia', country: 'Spain' });
  assert.equal(p4.region, 'Catalonia');
  assert.equal(p4.city, null);
  assert.equal(p4.ambiguous, false);

  const p5 = parse({ question: 'How do rent rules work?', city: 'Canterbury', country: 'New Zealand' });
  assert.equal(p5.region, 'Canterbury');
  assert.equal(p5.city, null);
  assert.equal(p5.ambiguous, false);
});

test('Database retrieval matches province-level and state-level evidence', () => {
  const db = new DatabaseSync(dbPath, { readOnly: true });
  const parseJson = (b) => { try { return JSON.parse(b); } catch { return null; } };
  const recs = db.prepare('SELECT id, body FROM records').all().map(r => ({ id: r.id, ...parseJson(r.body) })).filter(Boolean);

  // Alberta health retrieval
  const a1 = answer({ question: 'How do I get health coverage in Alberta?' }, recs);
  assert.equal(a1.status, 'guidance');
  assert.ok(a1.sources.some(s => s.id === 'alberta-ahcip-health-coverage'), 'retrieves AHCIP record');

  // California tenant rights retrieval
  const a2 = answer({ question: 'Tenant rights in California', country: 'United States' }, recs);
  assert.ok(a2.sources.length > 0, 'retrieves California tenant rights');

  // New South Wales retrieval
  const a3 = answer({ question: 'Tenant rights in New South Wales', country: 'Australia' }, recs);
  assert.ok(a3.sources.some(s => s.id === 'au-nsw-residential-tenancies-act-ncat'), 'retrieves NSW Fair Trading record');

  // Saskatchewan health retrieval
  const a4 = answer({ question: 'Health card in Saskatchewan' }, recs);
  assert.ok(a4.sources.some(s => s.id === 'saskatchewan-ehealth-registration'), 'retrieves eHealth Saskatchewan record');

  // Nova Scotia MSI health retrieval
  const aNS = answer({ question: 'How do I apply for MSI health coverage in Nova Scotia?' }, recs);
  assert.ok(aNS.sources.some(s => s.id === 'ca-ns-msi-health-coverage'), 'retrieves Nova Scotia MSI record');

  // New Brunswick Tenancy retrieval
  const aNB = answer({ question: 'Security deposit rules in New Brunswick' }, recs);
  assert.ok(aNB.sources.some(s => s.id === 'ca-nb-residential-tenancies-tribunal'), 'retrieves NB Tribunal record');

  // Newfoundland MCP health retrieval
  const aNL = answer({ question: 'Medical care plan MCP in Newfoundland' }, recs);
  assert.ok(aNL.sources.some(s => s.id === 'ca-nl-mcp-health-care-plan'), 'retrieves NL MCP record');

  // PEI Tenancy IRAC retrieval
  const aPE = answer({ question: 'Rent rules in Prince Edward Island' }, recs);
  assert.ok(aPE.sources.some(s => s.id === 'ca-pe-irac-residential-rental-tenancies'), 'retrieves PEI IRAC record');

  // Yukon Health retrieval
  const aYT = answer({ question: 'Health care insurance in Yukon' }, recs);
  assert.ok(aYT.sources.some(s => s.id === 'ca-yt-yhcip-health-insurance'), 'retrieves Yukon YHCIP record');

  // Northwest Territories Tenancy retrieval
  const aNT = answer({ question: 'Rental office deposit in Northwest Territories' }, recs);
  assert.ok(aNT.sources.some(s => s.id === 'ca-nt-rental-office-tenancies'), 'retrieves NWT Rental Office record');

  // Nunavut Health retrieval
  const aNU = answer({ question: 'Health services and medical care in Nunavut' }, recs);
  assert.ok(aNU.sources.some(s => s.id === 'ca-nu-health-care-plan'), 'retrieves Nunavut Health Care record');

  // Quebec Health retrieval (with dropdown city: Quebec)
  const aQC = answer({ question: 'RAMQ health card application', country: 'Canada', city: 'Quebec' }, recs);
  assert.ok(aQC.sources.some(s => s.id === 'quebec-ramq-health-insurance-registration'), 'retrieves Quebec RAMQ record');

  // Washington State Tenancy retrieval
  const aWA = answer({ question: 'Tenant rights under RLTA in Washington State', country: 'United States' }, recs);
  assert.ok(aWA.sources.some(s => s.id === 'us-wa-rlta-residential-landlord-tenant-act'), 'retrieves WA RLTA record');

  // Illinois Tenancy retrieval
  const aIL = answer({ question: 'Chicago RLTO security deposit in Illinois', country: 'United States' }, recs);
  assert.ok(aIL.sources.some(s => s.id === 'us-il-chicago-rlto-and-security-deposits'), 'retrieves IL RLTO record');

  // Queensland Driving retrieval
  const aQLD = answer({ question: 'Transport and Main Roads TMR driver licence in Queensland', country: 'Australia' }, recs);
  assert.ok(aQLD.sources.some(s => s.id === 'au-qld-tmr-driver-licence-exchange'), 'retrieves QLD TMR record');

  // South Australia Tenancy retrieval
  const aSA = answer({ question: 'Tenancy bond rules and SACAT in South Australia', country: 'Australia' }, recs);
  assert.ok(aSA.sources.some(s => s.id === 'au-sa-cbs-residential-bonds-and-sacat'), 'retrieves SA CBS record');

  // England Tenancy retrieval
  const aEng = answer({ question: 'Tenant Fees Act and Section 21 eviction in England', country: 'United Kingdom' }, recs);
  assert.ok(aEng.sources.some(s => s.id === 'uk-england-assured-shorthold-tenancy-and-section-21'), 'retrieves England AST record');

  // Sharjah Tenancy retrieval
  const aSHJ = answer({ question: 'Tasdeeq tenancy contract attestation in Sharjah', country: 'United Arab Emirates' }, recs);
  assert.ok(aSHJ.sources.some(s => s.id === 'ae-sharjah-tasdeeq-tenancy-attestation-and-sewa'), 'retrieves Sharjah Tasdeeq record');

  // Verify zero rest records point to canada.ca/ircc
  const nonCaRecords = recs.filter(r => !['CA', 'ON', 'BC', 'AB', 'QC', 'SK', 'MB', 'NS', 'NB', 'NL', 'PE', 'YT', 'NT', 'NU', 'Toronto', 'Mississauga', 'Brampton', 'Vancouver', 'Calgary', 'Ottawa', 'Montreal'].includes(r.jurisdiction));
  const badIrcc = nonCaRecords.filter(r => /^https?:\/\/(www\.)?(canada\.ca|ircc)/i.test(r.url || ''));
  assert.equal(badIrcc.length, 0, 'zero rest records point to IRCC canada.ca');

  db.close();
});

test('Subnational Tenancy Navigators: Australia, US, UK Devolved & UAE', () => {
  // 1. Australia Tenancy Tribunal Navigator
  const auCompliant = auditAustralianTenancy({
    tenantName: 'Sharma, Priya',
    state: 'NSW',
    weeklyRentAud: 600,
    bondPaidAud: 2400,
    rentIncreasePercent: 5,
    monthsSinceLastRentIncrease: 12,
    noticeGivenDays: 60
  });
  assert.equal(auCompliant.overallComplianceStatus, 'COMPLIANT');
  assert.equal(auCompliant.financialSummary.maxStatutoryBondAud, 2400);
  assert.equal(auCompliant.tribunal, 'NSW Civil and Administrative Tribunal (NCAT)');

  const auExcessiveBond = auditAustralianTenancy({
    state: 'VIC',
    weeklyRentAud: 500,
    bondPaidAud: 3000 // 6 weeks instead of 4
  });
  assert.equal(auExcessiveBond.overallComplianceStatus, 'STATUTORY_BREACH');
  assert.ok(auExcessiveBond.violations.some(v => v.includes('BOND CAP EXCEEDED')));

  // 2. US State Tenancy Navigator
  const usCaRentCapExceeded = auditUsStateTenancy({
    state: 'CA',
    monthlyRentUsd: 2500,
    rentIncreasePercent: 12.0 // exceeds 10% ceiling
  });
  assert.equal(usCaRentCapExceeded.isCompliant, false);
  assert.ok(usCaRentCapExceeded.statutoryViolations.some(v => v.includes('CA AB 1482 RENT CAP EXCEEDED')));

  const usNyDepositBreach = auditUsStateTenancy({
    state: 'NY',
    monthlyRentUsd: 3000,
    securityDepositPaidUsd: 6000 // 2 months instead of 1
  });
  assert.equal(usNyDepositBreach.isCompliant, false);
  assert.ok(usNyDepositBreach.statutoryViolations.some(v => v.includes('NY HSTPA SECURITY DEPOSIT EXCEEDED')));

  const usTxRepairDuty = auditUsStateTenancy({
    state: 'TX',
    repairRequested: true,
    daysSinceRepairRequest: 14,
    landlordRemediedCondition: false
  });
  assert.ok(usTxRepairDuty.statutoryViolations.some(v => v.includes('TX DUTY TO REPAIR BREACH')));

  // 3. UK Devolved Tenancy Navigator
  const ukScotDepositExceeded = auditUkDevolvedTenancy({
    nation: 'Scotland',
    monthlyRentGbp: 1200,
    depositPaidGbp: 3600 // 3 months instead of 2
  });
  assert.equal(ukScotDepositExceeded.isCompliant, false);
  assert.ok(ukScotDepositExceeded.statutoryViolations.some(v => v.includes('SCOTLAND DEPOSIT EXCEEDED')));
  assert.ok(ukScotDepositExceeded.statutoryProtections.some(p => p.includes('NO SECTION 21')));

  const ukWalesNoticeBreach = auditUkDevolvedTenancy({
    nation: 'Wales',
    noticeType: 'section_173',
    tenureDurationMonths: 4 // within 6-month moratorium
  });
  assert.ok(ukWalesNoticeBreach.statutoryViolations.some(v => v.includes('WALES 6-MONTH MORATORIUM')));

  // 4. UAE Tenancy Dispute Navigator
  const dubaiRera0 = calculateDubaiReraIncrease(80000, 85000); // 5.8% below -> 0%
  assert.equal(dubaiRera0.maxIncreasePercent, 0);

  const dubaiRera5 = calculateDubaiReraIncrease(80000, 95000); // 15.7% below -> 5%
  assert.equal(dubaiRera5.maxIncreasePercent, 5);

  const dubaiRera10 = calculateDubaiReraIncrease(75000, 100000); // 25% below -> 10%
  assert.equal(dubaiRera10.maxIncreasePercent, 10);

  const dubaiReraAudit = auditUaeTenancy({
    emirate: 'Dubai',
    currentRentAed: 80000,
    averageMarketRentAed: 100000, // 20% below -> max 5%
    proposedRentAed: 95000, // 18.7% increase requested (unlawful)
    noticeGivenDays: 60 // under 90 days (unlawful)
  });
  assert.equal(dubaiReraAudit.isCompliant, false);
  assert.ok(dubaiReraAudit.statutoryViolations.some(v => v.includes('90-DAY NOTICE VIOLATION')));
  assert.ok(dubaiReraAudit.statutoryViolations.some(v => v.includes('RERA RENT INCREASE EXCEEDED')));

  const abuDhabiAudit = auditUaeTenancy({
    emirate: 'Abu Dhabi',
    currentRentAed: 100000,
    proposedRentAed: 110000 // 10% increase (exceeds 5% cap)
  });
  assert.equal(abuDhabiAudit.isCompliant, false);
  assert.ok(abuDhabiAudit.statutoryViolations.some(v => v.includes('ABU DHABI 5% CAP EXCEEDED')));
});
