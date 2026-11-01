/**
 * Northstar — Settlement Intelligence Platform
 * Batch 39 Verification Suite — Recommendations 651 to 665
 *
 * Covers:
 * Rec 651: First-Time Home Buyer Tax Incentives, FHSA & RRSP HBP Engine (ITA s. 146.6, s. 146(5.1))
 * Rec 652: Housing Question Subjects & Scope Preserving Matcher
 * Rec 653: Newcomer Housing Tax & Foreign Buyer Ban Navigator (SOR/2022-250, NRST 25%)
 * Rec 654: Workplace Human Rights & Constructive Dismissal Engine (OHRC, FARPACTA s. 10.2)
 * Rec 655: Multilingual UI Translation & Emergency Survival Glossary
 * Rec 656: Legal Name Change & Dual-Identity Harmonization Engine (Change of Name Act, Bank Act s. 627.17)
 * Rec 657: Audited Manual Evidence Ingestion & Provenance Store
 * Rec 658: Authoritative Regulatory Records & Insider Settlement Dataset
 * Rec 659: Internationally Educated Nurses (IEN) Registration & NNAS Fast-Track Engine
 * Rec 660: Job Policy Denied Authorization Error Standard
 * Rec 661: Resilient Job Queue & State Engine (WAL, leases, health alerts)
 * Rec 662: Injected Job Worker Engine & Fenced Execution
 * Rec 663: Knowledge Base Expiry & Scheduled Review Monitor (14-day threshold)
 * Rec 664: Single Source of Truth Scheduled Settlement Facts (KB_FACTS, currency enforcement)
 * Rec 665: Policy Severity Classifier & Constitutional Hierarchy Audit Engine (Paramountcy, CHA s. 11)
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';

import { evaluateHomebuyerTaxIncentives, HOMEBUYER_CONSTANTS } from '../src/homebuyer-tax-incentives.js';
import { housingQuestionSubjects, recordHousingSubject, housingSubjects } from '../src/housing.js';
import { evaluateHomebuyerEligibility, calculateOntarioLandTransferTax, calculateTorontoMunicipalLtt, calculateMinimumDownPaymentCad } from '../src/housing-tax-navigator.js';
import { evaluateWorkplaceDiscriminationAndConstructiveDismissal, HUMAN_RIGHTS_JURISDICTIONS } from '../src/human-rights-defense.js';
import { getLocalizedKit, SUPPORTED_LANGUAGES, UI_LABELS } from '../src/i18n-dictionary.js';
import { evaluateIdentityHarmonization, PROVINCIAL_NAME_CHANGE_RULES } from '../src/identity-harmonization.js';
import { ingestionStore } from '../src/ingestion.js';
import { insiderImmigrationRecords, insiderSources, checkedAt, expiresAt } from '../src/insider-immigration-records.js';
import { evaluateInternationallyTrainedNurse, IEN_CONSTANTS } from '../src/internationally-trained-nurse-navigator.js';
import { JobPolicyDenied } from '../src/job-policy.js';
import { openJobQueue } from '../src/jobs.js';
import { runOneJob } from '../src/job-worker.js';
import { auditKbRecordExpiries, flagImpendingExpiriesInDb } from '../src/kb-expiry-monitor.js';
import { KB_FACTS, factValue, factsDueForReview } from '../src/kb-facts.js';
import { classifyPolicySeverity, auditStatutoryHierarchyConflict, POLICY_SEVERITY_TIERS } from '../src/kb-policy-classifier.js';

test('Rec 651: First-Time Home Buyer Tax Incentives, FHSA & RRSP HBP Engine — ITA s. 146.6 & Budget 2024 HBP', () => {
  // 1. Safe handling on null
  const nullResult = evaluateHomebuyerTaxIncentives(null);
  assert.equal(typeof nullResult, 'object');
  assert.equal(nullResult.isFirstTimeHomeBuyer, true);

  // 2. First-time buyer in Toronto with FHSA and RRSP
  const result = evaluateHomebuyerTaxIncentives({
    province: 'ON',
    city: 'Toronto',
    homePurchasePriceCad: 800000,
    isFirstTimeHomeBuyer: true,
    marginalTaxRatePercent: 40.0,
    applicant1: {
      annualIncomeCad: 90000,
      rrspBalanceCad: 70000,
      fhsaBalanceCad: 32000,
      fhsaYearsActive: 4
    },
    hasSpouseOrPartner: true,
    applicant2: {
      annualIncomeCad: 80000,
      rrspBalanceCad: 60000,
      fhsaBalanceCad: 16000,
      fhsaYearsActive: 2
    },
    plannedPurchaseYear: 2026
  });

  // FHSA: $32k + $16k = $48k total tax-free
  assert.equal(result.fhsaEvaluation.totalFhsaWithdrawalCad, 48000);
  // HBP: capped at $60k per person (Budget 2024) -> $60k + $60k = $120k
  assert.equal(result.hbpEvaluation.totalHbpWithdrawalCad, 120000);
  assert.equal(result.hbpEvaluation.repaymentGraceYears, 5);
  assert.equal(result.hbpEvaluation.repaymentStartYear, 2031);
  // Down payment unlocked: $48k + $120k = $168k
  assert.equal(result.downPaymentUnlocked.totalTaxFreeDownPaymentCad, 168000);
  // Toronto LTT rebate: $4,000 ON + $4,475 Toronto = $8,475
  assert.equal(result.taxCreditsAndRebates.lttRebateCad, 8475);
  // HBTC Line 31270: 15% of $10,000 = $1,500
  assert.equal(result.taxCreditsAndRebates.hbtcTaxSavingsCad, 1500);
});

test('Rec 652: Housing Question Subjects & Scope Preserving Matcher', () => {
  // 1. Safe handling on null / non-string
  assert.deepEqual(housingQuestionSubjects(null), []);
  assert.deepEqual(housingQuestionSubjects(undefined), []);
  assert.deepEqual(housingQuestionSubjects(123), []);
  assert.equal(recordHousingSubject(null), null);
  assert.equal(recordHousingSubject({ id: 'eviction' }), 'eviction');
  assert.equal(recordHousingSubject({ id: 'other', housingSubject: 'repairs' }), 'repairs');

  // 2. Specific housing subject pattern matching
  const depositSubjects = housingQuestionSubjects('How much security deposit can a landlord charge?');
  assert.ok(depositSubjects.includes('deposit'));

  const evictionSubjects = housingQuestionSubjects('Can I be evicted with an N12 notice?');
  assert.ok(evictionSubjects.includes('eviction'));

  const repairSubjects = housingQuestionSubjects('Landlord refuses to do heating repairs in winter');
  assert.ok(repairSubjects.includes('repairs'));

  // 3. Verify all registered housing subjects
  assert.ok(housingSubjects.includes('deposit'));
  assert.ok(housingSubjects.includes('agreement'));
  assert.ok(housingSubjects.includes('repairs'));
  assert.ok(housingSubjects.includes('eviction'));
  assert.ok(housingSubjects.includes('rent'));
});

test('Rec 653: Newcomer Housing Tax & Foreign Buyer Ban Navigator — SOR/2022-250 & NRST 25%', () => {
  // 1. Safe handling on null
  const nullResult = evaluateHomebuyerEligibility(null);
  assert.equal(typeof nullResult, 'object');
  assert.equal(nullResult.federalBanAssessment.isLegallyPermittedToBuy, true);

  // 2. Work permit holder with >= 183 days validity remaining (SOR/2023-66 exemption)
  const wpEligible = evaluateHomebuyerEligibility({
    purchasePriceCad: 600000,
    province: 'ON',
    city: 'Ottawa',
    immigrationStatus: 'work_permit',
    workPermitDaysRemaining: 250,
    willOccupyAsPrincipalResidenceWithin60Days: true
  });
  assert.equal(wpEligible.federalBanAssessment.isLegallyPermittedToBuy, true);
  assert.equal(wpEligible.provincialTaxAssessment.ratePercent, 25.0);
  assert.equal(wpEligible.provincialTaxAssessment.isEligibleForStatutoryRebate, true); // PR rebate within 4 yrs

  // 3. Work permit holder with < 183 days validity remaining: Banned
  const wpBanned = evaluateHomebuyerEligibility({
    purchasePriceCad: 600000,
    province: 'ON',
    city: 'Toronto',
    immigrationStatus: 'work_permit',
    workPermitDaysRemaining: 90
  });
  assert.equal(wpBanned.federalBanAssessment.isLegallyPermittedToBuy, false);

  // 4. Down payment calculation utility
  assert.equal(calculateMinimumDownPaymentCad(400000), 20000); // 5% of $400k
  assert.equal(calculateMinimumDownPaymentCad(800000), 55000); // 5% of $500k + 10% of $300k
  assert.equal(calculateMinimumDownPaymentCad(1200000), 240000); // 20% of $1.2M
});

test('Rec 654: Workplace Human Rights & Constructive Dismissal Engine — OHRC & FARPACTA s. 10.2', () => {
  // 1. Safe handling on null
  const nullResult = evaluateWorkplaceDiscriminationAndConstructiveDismissal(null);
  assert.equal(typeof nullResult, 'object');
  assert.equal(nullResult.statuteOfLimitationsStatus.isWithin1YearLimitation, true);

  // 2. Canadian experience requirement discrimination & reprisal
  const discrimination = evaluateWorkplaceDiscriminationAndConstructiveDismissal({
    jurisdiction: 'ON',
    protectedGrounds: ['place_of_origin', 'citizenship'],
    conductTypes: ['canadian_experience_requirement', 'retaliation_or_reprisal'],
    daysSinceLastIncident: 45,
    annualSalaryCad: 90000,
    yearsOfService: 2
  });
  assert.equal(discrimination.humanRightsViolationVerdict, 'UNLAWFUL_STATUTORY_REPRISAL');
  assert.ok(discrimination.statutoryViolations.some(v => v.finding.includes('Canadian experience')));
  assert.equal(discrimination.retaliationProtection.isReprisalProtected, true);

  // 3. Constructive dismissal under Potter v. New Brunswick
  const constructive = evaluateWorkplaceDiscriminationAndConstructiveDismissal({
    jurisdiction: 'ON',
    conductTypes: ['toxic_workplace_environment', 'indefinite_unpaid_suspension'],
    daysSinceLastIncident: 20,
    annualSalaryCad: 100000,
    yearsOfService: 4
  });
  assert.equal(constructive.constructiveDismissalVerdict, 'ESTABLISHED_CONSTRUCTIVE_DISMISSAL');
  assert.equal(constructive.constructiveDismissalAudit.potterVNewBrunswickApplied, true);
  assert.ok(constructive.damagesAssessment.estimatedCommonLawNoticeMonths >= 4);
});

test('Rec 655: Multilingual UI Translation & Emergency Survival Glossary', () => {
  // 1. Safe handling on null / fallback
  const nullKit = getLocalizedKit(null);
  assert.equal(nullKit.language, 'en');
  assert.equal(nullKit.labels.askNorthstar, 'Ask Northstar');

  // 2. Supported languages
  assert.ok(SUPPORTED_LANGUAGES.length >= 6);
  assert.ok(SUPPORTED_LANGUAGES.some(l => l.code === 'fr' && l.isOfficial));
  assert.ok(SUPPORTED_LANGUAGES.some(l => l.code === 'hi'));
  assert.ok(SUPPORTED_LANGUAGES.some(l => l.code === 'pa'));

  // 3. Localized emergency survival kits
  const frKit = getLocalizedKit('fr');
  assert.equal(frKit.language, 'fr');
  assert.ok(frKit.labels.lockoutCallout.includes('shérif'));

  const hiKit = getLocalizedKit('hi');
  assert.equal(hiKit.language, 'hi');
  assert.ok(hiKit.labels.bankingCallout.includes('बैंक'));

  const esKit = getLocalizedKit('spanish');
  assert.equal(esKit.language, 'es');
  assert.ok(esKit.labels.lockoutCallout.includes('Sheriff'));
});

test('Rec 656: Legal Name Change & Dual-Identity Harmonization Engine — Change of Name Act & Bank Act', () => {
  // 1. Safe handling on null
  const nullResult = evaluateIdentityHarmonization(null);
  assert.equal(typeof nullResult, 'object');

  // 2. Single name / blank surname resolution in Ontario (met 12-month residency)
  const onSingleName = evaluateIdentityHarmonization({
    discrepancyType: 'single_name_blank_surname',
    currentStatusInCanada: 'permanent_resident',
    residenceProvince: 'ON',
    monthsLivedInProvince: 15,
    foreignCountryOfOrigin: 'IN'
  });
  assert.equal(onSingleName.isProvincialNameChangeEligible, true);
  assert.equal(onSingleName.provincialFeeCad, 137);
  assert.equal(onSingleName.requiresRcmpFingerprinting, false);
  assert.ok(onSingleName.governmentCascadeRoadmap.length >= 5);

  // 3. BC Name change requires 3 months residency AND RCMP fingerprinting
  const bcNameChange = evaluateIdentityHarmonization({
    discrepancyType: 'maiden_vs_married_name',
    currentStatusInCanada: 'permanent_resident',
    residenceProvince: 'BC',
    monthsLivedInProvince: 6
  });
  assert.equal(bcNameChange.isProvincialNameChangeEligible, true);
  assert.equal(bcNameChange.requiresRcmpFingerprinting, true);

  // 4. Temporary resident ineligible for provincial legal name change
  const tempResident = evaluateIdentityHarmonization({
    discrepancyType: 'single_name_blank_surname',
    currentStatusInCanada: 'work_permit_holder',
    residenceProvince: 'ON',
    monthsLivedInProvince: 24
  });
  assert.equal(tempResident.isProvincialNameChangeEligible, false);
  assert.ok(tempResident.statutoryViolations.some(v => v.rule.includes('Temporary Residents Ineligible')));
});

test('Rec 657: Audited Manual Evidence Ingestion & Provenance Store', () => {
  const db = new DatabaseSync(':memory:');
  db.exec(`
    CREATE TABLE records (id TEXT PRIMARY KEY, body TEXT NOT NULL);
    CREATE TABLE schema_migrations (version INTEGER PRIMARY KEY, description TEXT, applied_at TEXT);
  `);

  // Ensure deterministic helper functions
  try {
    db.function('english_text', { deterministic: true }, (val) => typeof val === 'string' && val.length > 0 ? 1 : 0);
    db.function('english_record', { deterministic: true }, (val) => typeof val === 'string' && val.length > 0 ? 1 : 0);
    db.function('english_json', { deterministic: true }, (val) => typeof val === 'string' && val.length > 0 ? 1 : 0);
  } catch {}

  const store = ingestionStore(db);
  assert.equal(typeof store.assertReviewable, 'function');
  assert.equal(typeof store.sources, 'function');
  assert.equal(typeof store.registerSource, 'function');
  db.close();
});

test('Rec 658: Authoritative Regulatory Records & Insider Settlement Dataset', () => {
  assert.ok(Array.isArray(insiderSources));
  assert.ok(insiderSources.length >= 20);
  assert.ok(Array.isArray(insiderImmigrationRecords));
  assert.ok(insiderImmigrationRecords.length >= 50);

  // Verify dates
  assert.match(checkedAt, /^\d{4}-\d{2}-\d{2}$/);
  assert.match(expiresAt, /^\d{4}-\d{2}-\d{2}$/);

  // Check specific international insider records
  const us245k = insiderImmigrationRecords.find(r => r.id === 'us-uscis-245k-status-violation-exemption');
  assert.ok(us245k);
  assert.equal(us245k.jurisdiction, 'United States');
  assert.ok(us245k.quote.includes('180 days'));

  const ukRtr = insiderImmigrationRecords.find(r => r.id === 'uk-home-office-right-to-rent-statutory-excuse');
  assert.ok(ukRtr);
  assert.equal(ukRtr.jurisdiction, 'United Kingdom');
  assert.ok(ukRtr.quote.includes('Landlord Checking Service'));

  const deMiet = insiderImmigrationRecords.find(r => r.id === 'de-bgb-mietpreisbremse-prior-rent-disclosure');
  assert.ok(deMiet);
  assert.equal(deMiet.jurisdiction, 'Germany');
  assert.equal(deMiet.housingSubject, 'rent');
});

test('Rec 659: Internationally Educated Nurses (IEN) Registration & NNAS Fast-Track Engine', () => {
  // 1. Safe handling on null
  const nullResult = evaluateInternationallyTrainedNurse(null);
  assert.equal(typeof nullResult, 'object');

  // 2. Nurse from expedited country (Philippines)
  const filipinoNurse = evaluateInternationallyTrainedNurse({
    countryOfEducation: 'Philippines',
    nursingDesignation: 'rn',
    yearsOfClinicalExperience: 6,
    yearsSinceLastClinicalPractice: 1,
    languageProficiencyRoute: 'ielts_academic',
    ieltsOverallScore: 7.5,
    targetProvince: 'ON'
  });
  assert.equal(filipinoNurse.nnasEvaluation.isExpeditedCountry, true);
  assert.ok(filipinoNurse.statutoryProtections.some(p => p.includes('NNAS Expedited Service')));
  assert.equal(filipinoNurse.regulatoryRequirements.isCurrencyOfPracticeMet, true);
  assert.equal(filipinoNurse.regulatoryRequirements.isLanguageProficiencyMet, true);
  assert.equal(filipinoNurse.regulatoryRequirements.qualifiesForTemporaryClass, true);

  // 3. Nurse from non-expedited country (Brazil)
  const brazilianNurse = evaluateInternationallyTrainedNurse({
    countryOfEducation: 'Brazil',
    nursingDesignation: 'rn',
    yearsOfClinicalExperience: 4,
    yearsSinceLastClinicalPractice: 2,
    targetProvince: 'ON'
  });
  assert.equal(brazilianNurse.nnasEvaluation.isExpeditedCountry, false);
});

test('Rec 660: Job Policy Denied Authorization Error Standard', () => {
  const err = new JobPolicyDenied();
  assert.ok(err instanceof Error);
  assert.equal(err.name, 'JobPolicyDenied');
  assert.equal(err.message, 'Job policy denied');

  const customErr = new JobPolicyDenied('Custom denial reason');
  assert.equal(customErr.name, 'JobPolicyDenied');
  assert.equal(customErr.message, 'Custom denial reason');
});

test('Rec 661: Resilient Job Queue & State Engine — openJobQueue lifecycle', () => {
  const queue = openJobQueue(':memory:');
  assert.equal(typeof queue.checkReady, 'function');
  assert.equal(typeof queue.health, 'function');
  assert.equal(typeof queue.list, 'function');

  // Health check baseline
  const health = queue.health();
  assert.equal(health.status, 'ok');
  assert.equal(health.states.queued, 0);
  assert.equal(health.states.running, 0);

  // Worker presence
  queue.workerPresence('test-worker-1', 'running');
  const healthAfterPresence = queue.health();
  assert.equal(healthAfterPresence.workers.active, 1);

  queue.close();
});

test('Rec 662: Injected Job Worker Engine & Fenced Execution', async () => {
  const queue = openJobQueue(':memory:');

  // 1. Safe handling on null options / missing authorize
  await assert.rejects(
    async () => runOneJob(queue, null),
    /A job authorization policy is required/
  );

  // 2. Idle queue handling
  const idle = await runOneJob(queue, {
    workerId: 'worker-1',
    authorize: () => true
  });
  assert.equal(idle.status, 'idle');

  queue.close();
});

test('Rec 663: Knowledge Base Expiry & Scheduled Review Monitor — 14-day threshold', () => {
  const db = new DatabaseSync(':memory:');
  db.exec(`
    CREATE TABLE records (id TEXT PRIMARY KEY, body TEXT NOT NULL);
  `);

  // Insert test records: 1 expired, 1 expiring in 5 days, 1 compliant in 90 days
  const now = new Date('2026-11-01T00:00:00Z');
  const expiredDate = '2026-10-15';
  const expiringSoonDate = '2026-11-06';
  const compliantDate = '2027-02-01';

  db.prepare('INSERT INTO records VALUES (?, ?)').run('rec-1', JSON.stringify({ id: 'rec-1', topic: 'housing', jurisdiction: 'ON', title: 'Expired Record', expiresAt: expiredDate }));
  db.prepare('INSERT INTO records VALUES (?, ?)').run('rec-2', JSON.stringify({ id: 'rec-2', topic: 'health', jurisdiction: 'BC', title: 'Expiring Soon', expiresAt: expiringSoonDate }));
  db.prepare('INSERT INTO records VALUES (?, ?)').run('rec-3', JSON.stringify({ id: 'rec-3', topic: 'employment', jurisdiction: 'CA', title: 'Compliant Record', expiresAt: compliantDate }));

  // 1. Audit expiries with 14-day warning threshold
  const audit = auditKbRecordExpiries(db, { referenceDate: '2026-11-01', warningDays: 14 });
  assert.equal(audit.counts.expiredCount, 1);
  assert.equal(audit.counts.impendingExpiryCount, 1);
  assert.equal(audit.counts.compliantCount, 1);
  assert.equal(audit.actionRequired, true);

  // 2. Flag impending expiries into database table
  const flagged = flagImpendingExpiriesInDb(db, { referenceDate: '2026-11-01', warningDays: 14 });
  assert.equal(flagged.success, true);
  assert.ok(flagged.flaggedIds.includes('rec-2'));

  db.close();
});

test('Rec 664: Single Source of Truth Scheduled Settlement Facts — KB_FACTS & currency', () => {
  // 1. Check known scheduled facts
  assert.ok(KB_FACTS['uk.skilledWorker.generalThresholdGbp']);
  assert.equal(KB_FACTS['uk.skilledWorker.generalThresholdGbp'].value, 41700);

  assert.ok(KB_FACTS['ca.expressEntry.settlementFundsCad']);
  assert.equal(KB_FACTS['ca.expressEntry.settlementFundsCad'].value[1], 15263);

  assert.ok(KB_FACTS['ca.ontario.rentIncreaseGuidelinePercent']);
  assert.equal(KB_FACTS['ca.ontario.rentIncreaseGuidelinePercent'].value, 2.1);

  // 2. Reading valid fact
  const rentGuideline = factValue('ca.ontario.rentIncreaseGuidelinePercent', '2026-11-01');
  assert.equal(rentGuideline, 2.1);

  // 3. factsDueForReview with null/default date
  const due = factsDueForReview(null);
  assert.ok(Array.isArray(due));
});

test('Rec 665: Policy Severity Classifier & Constitutional Hierarchy Audit Engine — Paramountcy & CHA s. 11', () => {
  // 1. Safe handling on null
  const nullClass = classifyPolicySeverity(null);
  assert.equal(nullClass.tier, 4);
  assert.equal(nullClass.severity, 'ADVISORY');

  // 2. Tier 1 Critical Urgent: Border restriction / ban / lockout
  const urgent = classifyPolicySeverity({
    title: 'Immediate Flagpoling Ban at Southern Border Ports of Entry',
    risk: 'high'
  });
  assert.equal(urgent.tier, 1);
  assert.equal(urgent.severity, POLICY_SEVERITY_TIERS.CRITICAL_URGENT.label);
  assert.equal(urgent.requiresImmediateBroadcast, true);

  // 3. Tier 2 Policy Change: Financial threshold / wage change
  const policyChange = classifyPolicySeverity({
    title: 'Ontario Minimum Wage Increased to $17.20 per Hour',
    summary: 'Statutory threshold revision under Employment Standards Act'
  });
  assert.equal(policyChange.tier, 2);
  assert.equal(policyChange.severity, POLICY_SEVERITY_TIERS.POLICY_CHANGE.label);

  // 4. Constitutional paramountcy conflict audit
  const paramountcyConflict = auditStatutoryHierarchyConflict({
    federalRule: { allowsWork: true, statute: 'IRPR s. 186' },
    provincialRule: { barsEmployment: true, statute: 'Provincial directive' },
    subjectMatter: 'immigration_and_work'
  });
  assert.equal(paramountcyConflict.hasConflict, true);
  assert.equal(paramountcyConflict.prevailingAuthority, 'FEDERAL_PARAMOUNTCY');
  assert.ok(paramountcyConflict.conflicts.some(c => c.conflictType === 'FEDERAL_PARAMOUNTCY_IN_IMMIGRATION'));

  // 5. Canada Health Act s. 11 3-month portability cap breach
  const chaBreach = auditStatutoryHierarchyConflict({
    provincialRule: { waitingPeriodDays: 120 },
    subjectMatter: 'healthcare'
  });
  assert.equal(chaBreach.hasConflict, true);
  assert.ok(chaBreach.conflicts.some(c => c.conflictType === 'CANADA_HEALTH_ACT_PORTABILITY_BREACH'));
});
