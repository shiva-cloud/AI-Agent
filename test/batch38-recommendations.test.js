/**
 * Batch 38 Recommendations Test Suite (Recommendations 636–650)
 *
 * Covers:
 * - Rec 636: src/gap-workflow.js
 * - Rec 637: src/gcms-refusal-analyzer.js
 * - Rec 638: src/geography.js
 * - Rec 639: src/global-expat-navigator.js
 * - Rec 640: src/global-immigration-question-bank-batch3-resolver.js
 * - Rec 641: src/global-immigration-question-bank-resolver.js
 * - Rec 642: src/global-records.js
 * - Rec 643: src/global-settlement-resolver.js
 * - Rec 644: src/global-visa-matrix.js
 * - Rec 645: src/glossary-concepts.js
 * - Rec 646: src/gov-scraper-alerts.js
 * - Rec 647: src/healthcare-navigator.js
 * - Rec 648: src/healthcare-portability-navigator.js
 * - Rec 649: src/healthcare-triage.js
 * - Rec 650: src/high-cost-credit-navigator.js
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';

import { configureEnglishDatabase } from '../src/migrations.js';
import { configureIngestion } from '../src/ingestion.js';
import { configureGapWorkflow, gapWorkflow } from '../src/gap-workflow.js';
import { analyzeGcmsRefusalNotes, KNOWN_GCMS_REFUSAL_GROUNDS } from '../src/gcms-refusal-analyzer.js';
import { resolveClauseGeography, hasUnsupportedDestination, places, GEOGRAPHY_VERSION } from '../src/geography.js';
import {
  evaluateUaeGratuityAndWps,
  auditDubaiReraEvictionNotice,
  evaluateNewZealandAewvAndTenancy,
  evaluateIrelandCsepAndRpz,
  evaluateSingaporeCompassPass,
  GLOBAL_EXPAT_CONSTANTS
} from '../src/global-expat-navigator.js';
import {
  QUESTION_BANK_BATCH_3,
  resolveQuestionBankBatch3Item,
  searchQuestionBankBatch3,
  getQuestionBankBatch3Stats
} from '../src/global-immigration-question-bank-batch3-resolver.js';
import {
  QUESTION_BANK_BATCH_2,
  resolveQuestionBankItem,
  searchQuestionBankBatch2,
  getQuestionBankBatch2Stats
} from '../src/global-immigration-question-bank-resolver.js';
import { globalRecords, checkedAt, expiresAt } from '../src/global-records.js';
import {
  resolveGlobalSettlementItem,
  searchGlobalSettlement,
  getGlobalSettlementStats
} from '../src/global-settlement-resolver.js';
import { evaluateGlobalVisaPathways, GLOBAL_DESTINATION_RULES } from '../src/global-visa-matrix.js';
import { conceptGlossaryIds, buildConceptTerm, GLOSSARY_AREAS } from '../src/glossary-concepts.js';
import { computePayloadHash, detectPolicyDrift, MONITORED_GOV_PAGES } from '../src/gov-scraper-alerts.js';
import { evaluateHealthcareEligibility, PROVINCIAL_HEALTH_PLANS } from '../src/healthcare-navigator.js';
import { evaluateHealthcarePortabilityAndIfhp, PROVINCIAL_HEALTHCARE_SCHEMES } from '../src/healthcare-portability-navigator.js';
import { triageHealthcareNeed, mapDrugGeneric, HEALTHCARE_TRIAGE_MAP } from '../src/healthcare-triage.js';
import { evaluateConsumerCreditAgreement, CREDIT_DEFENSE_CONSTANTS } from '../src/high-cost-credit-navigator.js';

test('Rec 636: Gap Workflow Engine — Lifecycle tracking, English policy triggers & public summary', () => {
  const db = new DatabaseSync(':memory:');
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations(version INTEGER PRIMARY KEY, name TEXT NOT NULL, applied_at TEXT NOT NULL);
  `);
  db.function('english_text', { deterministic: true }, () => 1);
  db.function('english_json', { deterministic: true }, () => 1);
  configureGapWorkflow(db);

  const gw = gapWorkflow(db);
  const summary = gw.publicSummary();
  assert.equal(typeof summary, 'object');
  assert.equal(summary.totals.open, 0);

  const list = gw.list();
  assert.equal(Array.isArray(list.items), true);
  assert.equal(list.items.length, 0);
});

test('Rec 637: GCMS Refusal Notes Analyzer — s. 179(b) grounds, dual intent & judicial review timelines', () => {
  // 1. Safe handling of null
  const nullResult = analyzeGcmsRefusalNotes(null);
  assert.equal(typeof nullResult, 'object');
  assert.ok(nullResult.groundsIdentifiedCount > 0);

  // 2. Keyword detection from officer notes
  const analyzed = analyzeGcmsRefusalNotes({
    rawOfficerNotesText: 'Applicant lacks sufficient funds and family ties in country of residence. PR pending dual intent expressed.',
    daysSinceRefusal: 20
  });
  assert.ok(analyzed.refusalFindings.some(f => f.refusalGround === 'R179b_ASSETS_FUNDS'));
  assert.ok(analyzed.refusalFindings.some(f => f.refusalGround === 'R179b_FAMILY_TIES'));
  assert.ok(analyzed.refusalFindings.some(f => f.refusalGround === 'R22(2)_DUAL_INTENT'));
  assert.equal(analyzed.proceduralRemedy.isWithinFederalCourtWindow, true);
  assert.ok(analyzed.federalCourtPrecedents.some(p => p.includes('Castillo v. Canada')));
});

test('Rec 638: Geography Hierarchy & Directional Relocation Disambiguation', () => {
  assert.equal(GEOGRAPHY_VERSION, 'geo-1');
  assert.ok(places.length > 50);

  // Relocation clause parsing
  const resolved = resolveClauseGeography('I am moving from France to Toronto, can I drive?');
  assert.ok(resolved);
  assert.equal(resolved.hasRelocation, true);
  assert.equal(resolved.originCountry, 'France');
  assert.equal(resolved.destCity, 'Toronto');
  assert.equal(resolved.destCountry, 'CA');
  assert.equal(resolved.isDestSupported, true);

  // Unsupported destination check
  assert.equal(hasUnsupportedDestination('Calgary'), true);
  assert.equal(hasUnsupportedDestination('in Paris'), true);
});

test('Rec 639: Global Expat & Tenancy Navigator — UAE WPS gratuity, Dubai RERA, NZ bond & Ireland RPZ', () => {
  // 1. Safe handling of null across all expat functions
  const uaeNull = evaluateUaeGratuityAndWps(null);
  assert.equal(typeof uaeNull, 'object');
  assert.ok(uaeNull.accruedGratuityAed > 0);

  const dubaiNull = auditDubaiReraEvictionNotice(null);
  assert.equal(typeof dubaiNull, 'object');
  assert.equal(dubaiNull.isValidNotice, false);

  const nzNull = evaluateNewZealandAewvAndTenancy(null);
  assert.equal(typeof nzNull, 'object');
  assert.equal(nzNull.aewvRedundancyAudit.isCushionActive, true);

  const ieNull = evaluateIrelandCsepAndRpz(null);
  assert.equal(typeof ieNull, 'object');
  assert.equal(ieNull.csepStamp4Audit.isStamp4Eligible, true);

  const sgNull = evaluateSingaporeCompassPass(null);
  assert.equal(typeof sgNull, 'object');
  assert.equal(sgNull.isPassingScore, true);

  // 2. UAE gratuity calculation: 2 years @ 10,000 AED basic salary (2 * 21 * (10000/30) = 14,000 AED)
  const uae = evaluateUaeGratuityAndWps({
    monthlyBasicSalaryAed: 10000,
    yearsOfService: 2,
    unlawfulDeductionsClaimedByEmployerAed: 3500
  });
  assert.equal(uae.accruedGratuityAed, 14000);
  assert.equal(uae.deductionsAudit.hasUnlawfulDeductions, true);
  assert.equal(uae.deductionsAudit.isDeductionLegallyBarred, true);

  // 3. New Zealand bond retention exemplary damages
  const nzBreach = evaluateNewZealandAewvAndTenancy({
    bondWorkingDaysSincePayment: 25,
    bondLodgedWithMbie: false
  });
  assert.equal(nzBreach.tenancyBondAudit.isLandlordInBreach, true);
  assert.equal(nzBreach.tenancyBondAudit.exemplaryDamagesPayableNzd, GLOBAL_EXPAT_CONSTANTS.NZ_BOND_UNLAWFUL_RETENTION_EXEMPLARY_DAMAGES_NZD);
});

test('Rec 640: Global Immigration Question Bank Batch 3 Resolver — Questions 1901–2100', () => {
  assert.equal(QUESTION_BANK_BATCH_3.length, 200);

  // 1. Safe handling of null in search
  const nullSearch = searchQuestionBankBatch3(null);
  assert.equal(nullSearch.total, 200);
  assert.equal(nullSearch.items.length, 20);

  // 2. Resolve by numeric id
  const item1901 = resolveQuestionBankBatch3Item(1901);
  assert.ok(item1901);
  assert.equal(item1901.id, 1901);
  assert.ok(item1901.citation.includes('1951 Refugee Convention'));

  // 3. Stats summary
  const stats = getQuestionBankBatch3Stats();
  assert.equal(stats.totalQuestions, 200);
  assert.equal(stats.range, '1901 - 2100');
});

test('Rec 641: Global Immigration Question Bank Resolver — Questions 1701–1900', () => {
  assert.equal(QUESTION_BANK_BATCH_2.length, 200);

  // 1. Safe handling of null in search
  const nullSearch = searchQuestionBankBatch2(null);
  assert.equal(nullSearch.total, 200);
  assert.equal(nullSearch.items.length, 20);

  // 2. Resolve by numeric id
  const item1701 = resolveQuestionBankItem(1701);
  assert.ok(item1701);
  assert.equal(item1701.id, 1701);
  assert.ok(item1701.citation.includes('Cooper v Hobart'));

  // 3. Stats summary
  const stats = getQuestionBankBatch2Stats();
  assert.equal(stats.totalQuestions, 200);
  assert.equal(stats.range, '1701 - 1900');
});

test('Rec 642: Global Regulatory Records — Official immigration and settlement dataset across 7 countries', () => {
  assert.ok(globalRecords.length > 50);
  assert.ok(checkedAt);
  assert.ok(expiresAt);

  const sample = globalRecords.find(r => r.id === 'us-uscis-immigration-green-card-kyc');
  assert.ok(sample);
  assert.equal(sample.jurisdiction, 'United States');
  assert.equal(sample.status, 'approved');
  assert.equal(sample.language, 'en');
  assert.ok(sample.quote);
  assert.ok(sample.summary);
});

test('Rec 643: Universal Global Settlement Resolver — 20,000 Questions index & search', () => {
  // 1. Resolve by GMS identifier
  const q1 = resolveGlobalSettlementItem('GMS-Q00001');
  assert.ok(q1);
  assert.equal(q1.id, 'GMS-Q00001');
  assert.ok(q1.question);
  assert.ok(q1.statutoryRule);

  // 2. Safe search
  const results = searchGlobalSettlement(null);
  assert.equal(results.total, 20000);
  assert.equal(results.items.length, 20);

  // 3. Global stats
  const stats = getGlobalSettlementStats();
  assert.equal(stats.totalQuestions, 20000);
  assert.equal(stats.range, 'GMS-Q00001 - GMS-Q20000');
});

test('Rec 644: Global Visa Pathways Matrix — Multi-country deterministic visa suitability', () => {
  // 1. Safe handling on null
  const nullResult = evaluateGlobalVisaPathways(null);
  assert.equal(typeof nullResult, 'object');
  assert.ok(nullResult.totalOptionsEvaluated > 0);

  // 2. Canadian candidate evaluation
  const caEval = evaluateGlobalVisaPathways({
    preferredCountries: ['CA'],
    educationLevel: 'bachelors',
    yearsExperience: 3,
    hasJobOffer: false,
    applicantAge: 28
  });
  assert.ok(caEval.eligiblePathways.some(p => p.pathwayId === 'express_entry_fsw'));

  // 3. Australian GSM age cutoff test (age >= 45 is disqualified)
  const auOverAge = evaluateGlobalVisaPathways({
    preferredCountries: ['AU'],
    applicantAge: 46
  });
  assert.ok(auOverAge.restrictedPathways.some(p => p.pathwayId === 'subclass_189_190'));
});

test('Rec 645: Multilingual Settlement Glossary Concepts — 484 Procedural Concept Entries', () => {
  const ids = conceptGlossaryIds();
  assert.equal(ids.length, 484);

  // Build first concept term
  const term17 = buildConceptTerm('imm_appeal_right_17');
  assert.ok(term17);
  assert.equal(term17.id, 'imm_appeal_right_17');
  assert.equal(term17.category, 'immigration');
  assert.ok(term17.term_en);
  assert.ok(term17.def_en);
  assert.ok(term17.term_fr);
  assert.ok(term17.def_fr);
});

test('Rec 646: Automated Government Scraper Alerts & Policy Drift Monitor — SHA-256 digests', () => {
  assert.ok(MONITORED_GOV_PAGES.length >= 4);

  // 1. Payload hash computation
  const hash1 = computePayloadHash('Government Policy Rule v1.0');
  const hash2 = computePayloadHash('Government Policy Rule v1.0');
  const hash3 = computePayloadHash('Government Policy Rule v2.0 - Revised');
  assert.equal(hash1, hash2);
  assert.notEqual(hash1, hash3);
  assert.equal(computePayloadHash(null), null);

  // 2. Policy drift detection
  const unchanged = detectPolicyDrift(MONITORED_GOV_PAGES[0], hash1, 'Government Policy Rule v1.0');
  assert.equal(unchanged.hasChanged, false);
  assert.equal(unchanged.alertLevel, 'unchanged');

  const drift = detectPolicyDrift(MONITORED_GOV_PAGES[0], hash1, 'Government Policy Rule v2.0 - Revised');
  assert.equal(drift.hasChanged, true);
  assert.equal(drift.alertLevel, 'critical_policy_revision');

  // 3. Safe handling of null pageDef
  const nullDrift = detectPolicyDrift(null, hash1, 'Government Policy Rule v2.0 - Revised');
  assert.equal(nullDrift.pageId, 'unknown');
  assert.equal(nullDrift.hasChanged, true);
});

test('Rec 647: Pan-Canadian Healthcare Navigator — Immediate vs waiting period & bridge insurance', () => {
  // 1. Safe handling of null (default: Ontario PR)
  const onPr = evaluateHealthcareEligibility(null);
  assert.equal(typeof onPr, 'object');
  assert.equal(onPr.provinceCode, 'ON');
  assert.equal(onPr.isEligible, true);
  assert.equal(onPr.waitingPeriodDays, 0);
  assert.equal(onPr.bridgeInsuranceRequired, false);

  // 2. British Columbia PR: statutory waiting period applies
  const bcPr = evaluateHealthcareEligibility({
    province: 'BC',
    immigrationStatus: 'pr',
    householdSize: 2
  });
  assert.equal(bcPr.isEligible, true);
  assert.ok(bcPr.waitingPeriodDays > 0);
  assert.equal(bcPr.bridgeInsuranceRequired, true);
  assert.ok(bcPr.estimatedBridgeCostCad > 0);

  // 3. Quebec Bilateral Social Security Accord Exemption (e.g. France)
  const qcAccord = evaluateHealthcareEligibility({
    province: 'QC',
    immigrationStatus: 'pr',
    originCountry: 'France'
  });
  assert.equal(qcAccord.isAccordExempt, true);
  assert.equal(qcAccord.waitingPeriodDays, 0);
  assert.equal(qcAccord.bridgeInsuranceRequired, false);
});

test('Rec 648: Healthcare Portability & IFHP Navigator — CHA s. 11 & refugee claimant protections', () => {
  // 1. Safe handling on null
  const nullResult = evaluateHealthcarePortabilityAndIfhp(null);
  assert.equal(typeof nullResult, 'object');
  assert.equal(nullResult.eligibleForProvincialHealthcare, true);

  // 2. Refugee claimant with IFHP certificate: immediate federal coverage
  const refugee = evaluateHealthcarePortabilityAndIfhp({
    targetProvince: 'QC',
    isRefugeeClaimantWithIfhpCertificate: true
  });
  assert.equal(refugee.ifhpActive, true);
  assert.equal(refugee.waitingPeriodDays, 0);
  assert.ok(refugee.requiredDocuments.some(d => d.includes('IFHP Certificate')));

  // 3. Quebec newcomer: 3-month statutory waiting period (délai de carence)
  const qcNewcomer = evaluateHealthcarePortabilityAndIfhp({
    targetProvince: 'QC',
    immigrationStatus: 'closed_work_permit',
    originType: 'outside_canada',
    workPermitDurationMonths: 12,
    isRefugeeClaimantWithIfhpCertificate: false
  });
  assert.equal(qcNewcomer.eligibleForProvincialHealthcare, true);
  assert.equal(qcNewcomer.waitingPeriodDays, 90);
  assert.equal(qcNewcomer.needsPrivateBridgingInsurance, true);
});

test('Rec 649: Healthcare Triage Navigator & Generic Drug Equivalence Engine', () => {
  // 1. Health condition triage mapping
  const rxTriage = triageHealthcareNeed('chronic_rx');
  assert.equal(rxTriage.level, 'RETAIL COMMUNITY PHARMACY');

  const erTriage = triageHealthcareNeed('emergency_life');
  assert.equal(erTriage.level, 'EMERGENCY ROOM (ER) / CALL 911 / 999');

  const chcTriage = triageHealthcareNeed('uninsured_primary');
  assert.equal(chcTriage.level, 'COMMUNITY HEALTH CENTRE (CHC)');

  // 2. International drug generic bioequivalence mapping
  const glucophage = mapDrugGeneric('Glucophage');
  assert.equal(glucophage.found, true);
  assert.equal(glucophage.generic, 'metformin');
  assert.equal(glucophage.isChronic, true);

  const lipitor = mapDrugGeneric('Lipitor');
  assert.equal(lipitor.found, true);
  assert.equal(lipitor.generic, 'atorvastatin');

  const unknown = mapDrugGeneric('NonExistentMedXYZ');
  assert.equal(unknown.found, false);
  assert.equal(unknown.generic, null);
});

test('Rec 650: Consumer Credit Agreement & Payday Loan Defense Engine — Criminal 35% APR & $14 fee cap', () => {
  // 1. Safe handling on null
  const nullResult = evaluateConsumerCreditAgreement(null);
  assert.equal(typeof nullResult, 'object');

  // 2. Ontario Payday Loan fee overcharge ($180 charged on $1000 loan vs statutory $140 cap)
  const overcharge = evaluateConsumerCreditAgreement({
    province: 'ON',
    loanType: 'payday_loan',
    principalBorrowedCad: 1000,
    totalFeesChargedCad: 180
  });
  assert.equal(overcharge.hasPaydayFeeOvercharge, true);
  assert.equal(overcharge.statutoryMaxFeesCad, 140);
  assert.equal(overcharge.illegalOverchargeCad, 40);

  // 3. Criminal rate of interest violation (APR > 35% under Criminal Code s. 347)
  const criminalRate = evaluateConsumerCreditAgreement({
    loanType: 'high_cost_installment',
    statedAprPercent: 49.5
  });
  assert.equal(criminalRate.violatesCriminalInterestCap, true);
  assert.ok(criminalRate.statutoryViolations.some(v => v.code === 'CRIMINAL_INTEREST_RATE_EXCEEDED'));

  // 4. Illegal rollover loan and wage assignment
  const predatory = evaluateConsumerCreditAgreement({
    loanType: 'payday_loan',
    isRolloverLoan: true,
    lenderAttemptedWageAssignment: true
  });
  assert.equal(predatory.isRolloverLoan, true);
  assert.ok(predatory.statutoryViolations.some(v => v.code === 'ILLEGAL_ROLLOVER_LOAN'));
  assert.ok(predatory.statutoryViolations.some(v => v.code === 'PROHIBITED_WAGE_ASSIGNMENT'));
});
