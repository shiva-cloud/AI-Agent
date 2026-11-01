// test/batch41-recommendations.test.js
// Regression test suite for Sweep 48 (Recommendations 681-695)
// Zero runtime npm dependencies, built-in node:test and node:assert

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Rec 681: Manitoba Employment Leave & Job Protection Navigator
import {
  evaluateManitobaEmploymentLeave,
  assessManitobaEmploymentLeave
} from '../src/manitoba-employment-leave-job-protection-navigator.js';

// Rec 682: Manitoba Employment Statutory Holiday Pay Navigator
import {
  
  calculateManitobaStatutoryHolidayPay,
  MANITOBA_HOLIDAY_CONSTANTS
} from '../src/manitoba-employment-statutory-holiday-pay-navigator.js';

// Rec 683: Manitoba PNP Skilled Worker Navigator
import {
  
  assessManitobaPnpSkilledWorker
} from '../src/manitoba-pnp-skilled-worker-navigator.js';

// Rec 684: Manitoba Residential Tenancy Rent Increase Guideline Navigator
import {
  
  assessManitobaRentIncrease
} from '../src/manitoba-residential-tenancy-rent-increase-guideline-navigator.js';

// Rec 685: Market Gap Batch 1 Resolver
import {
  searchMarketGapBatch1,
  getMarketGapBatch1Stats
} from '../src/market-gap-batch1-resolver.js';

// Rec 686: Market Gap Batch 2 Resolver
import {
  searchMarketGapBatch2,
  getMarketGapBatch2Stats
} from '../src/market-gap-batch2-resolver.js';

// Rec 687: Market Gap Batch 3 Resolver
import {
  searchMarketGapBatch3,
  getMarketGapBatch3Stats
} from '../src/market-gap-batch3-resolver.js';

// Rec 688: Medical Admissibility Navigator
import {
  evaluateMedicalAdmissibility
} from '../src/medical-admissibility.js';

// Rec 689: Migration Dry Run
import {
  migrationDryRun
} from '../src/migration-dry-run.js';

// Rec 690: Database Migrations
import {
  configureEnglishDatabase
} from '../src/migrations.js';
import {
  openStore
} from '../src/store.js';

// Rec 691: Monitor State Store
import {
  monitorStateKey,
  openMonitorState
} from '../src/monitor-state.js';

// Rec 692: CRA Form T1-M Moving Tax Calculator
import {
  calculateMovingTaxDeduction
} from '../src/moving-tax-calculator.js';

// Rec 693: Moving Tax Navigator & T1-M Assessment
import {
  assessMovingExpenses
} from '../src/moving-tax-navigator.js';

// Rec 694: Multi-Country Gazette Crawler
import {
  auditIrccMinisterialInstructions,
  auditEsdcPrevailingWages,
  syncCorridorMigrationRules,
  translatePolicyDelta,
  auditMultiCountryGazettes
} from '../src/multi-country-gazette-crawler.js';

// Rec 695: Multilingual Settlement Layer
import {
  detectAndTranslateMultilingualQuery
} from '../src/multilingual-layer.js';

test('Rec 681: evaluateManitobaEmploymentLeave enforces Manitoba ESC statutory leaves and job protection', () => {
  // Maternity leave: 17 weeks, requires 7 months continuous service
  const matLeave = evaluateManitobaEmploymentLeave({
    leaveType: 'MATERNITY',
    monthsOfContinuousService: 8,
    weeksRequested: 17,
    hasMedicalCertificateProvided: true
  });
  assert.equal(matLeave.isEligibleForLeave, true);
  assert.equal(matLeave.complianceStatus, 'STATUTORILY_COMPLIANT');
  assert.equal(matLeave.leaveAudit.maxStatutoryWeeks, 17);
  assert.ok(matLeave.statutoryCitations[0].includes('Employment Standards Code'));

  // Interpersonal violence leave: up to 10 days (5 paid) + 17 weeks continuous
  const violenceLeave = assessManitobaEmploymentLeave({
    leaveType: 'INTERPERSONAL_VIOLENCE',
    daysOfContinuousService: 120,
    weeksRequested: 10,
    interpersonalViolenceDaysRequested: 5
  });
  assert.equal(violenceLeave.isEligibleForLeave, true);
  assert.equal(violenceLeave.leaveAudit.paidDaysEntitlement, 5);

  // Reprisal / unlawful termination detection
  const reprisal = assessManitobaEmploymentLeave({
    leaveType: 'MATERNITY',
    employerDismissedOrDisciplinedEmployee: true
  });
  assert.equal(reprisal.complianceStatus, 'STATUTORY_DEFICIENCY_DETECTED');
  assert.ok(reprisal.statutoryViolations.some(v => v.violation === 'STATUTORY_REPRISAL_AND_UNLAWFUL_TERMINATION'));

  // Parameter resilience
  const def = assessManitobaEmploymentLeave(null);
  assert.ok(def);
});

test('Rec 682: calculateManitobaStatutoryHolidayPay verifies 5% four-week lookback and holiday premium', () => {
  // Lookback: $4,000 earned in last 4 weeks -> 5% = $200.00 general holiday pay
  const holiday = calculateManitobaStatutoryHolidayPay({
    grossWagesInPast4WeeksCad: 4000,
    workedOnHoliday: false,
    holidayPayActuallyPaidCad: 200
  });
  assert.equal(holiday.holidayPayDetails.statutoryGeneralHolidayPayCad, 200);
  assert.equal(holiday.complianceStatus, 'COMPLIANT_GENERAL_HOLIDAY_PAY');
  assert.ok(MANITOBA_HOLIDAY_CONSTANTS.MANITOBA_GENERAL_HOLIDAYS.includes('NATIONAL_DAY_FOR_TRUTH_AND_RECONCILIATION'));

  // Worked on holiday: gets holiday pay + 1.5x regular hourly wage for hours worked
  const workedHoliday = calculateManitobaStatutoryHolidayPay({
    grossWagesInPast4WeeksCad: 4000,
    workedOnHoliday: true,
    hoursWorkedOnHoliday: 8,
    regularHourlyWageCad: 25.00,
    holidayPayActuallyPaidCad: 500
  });
  // 8 * 25 * 1.5 = 300 + 200 = 500
  assert.equal(workedHoliday.holidayPayDetails.premiumHoursPayCad, 300);
  assert.equal(workedHoliday.holidayPayDetails.totalStatutoryEntitlementCad, 500);

  // Unexcused absence disqualification (s. 21)
  const disqualified = calculateManitobaStatutoryHolidayPay({
    grossWagesInPast4WeeksCad: 4000,
    absentWithoutConsentBeforeOrAfter: true
  });
  assert.equal(disqualified.isDisqualified, true);
  assert.equal(disqualified.holidayPayDetails.totalStatutoryEntitlementCad, 0);

  // Parameter resilience
  assert.ok(calculateManitobaStatutoryHolidayPay(null));
});

test('Rec 683: assessManitobaPnpSkilledWorker validates MPNP EOI point matrix and regional factors', () => {
  const applicant = assessManitobaPnpSkilledWorker({
    monthsWorkedInManitoba: 12,
    isOutOfProvinceGraduate: false,
    hasPermanentManitobaJobOffer: true,
    firstLanguageClb: 8,
    secondLanguageClb: 5,
    candidateAge: 28,
    totalYearsOfWorkExperience: 3,
    highestEducationLevel: 'bachelors_degree',
    hasCloseFamilySupporterInManitoba: true,
    isJobLocatedOutsideWinnipeg: true,
    hasPastStudyInAnotherProvince: false,
    hasPastWorkInAnotherProvince: false
  });
  assert.equal(applicant.isStreamEligible, true);
  assert.equal(applicant.streamVerdict, 'QUALIFIES_FOR_SKILLED_WORKER_IN_MANITOBA');
  assert.ok(applicant.eoiScoreSummary.totalEoiPoints >= 600);
  assert.equal(applicant.eoiScoreSummary.riskDeductions, 0);

  // Out-of-province grad requires 12 months minimum (with 6 months, ineligible)
  const oopShort = assessManitobaPnpSkilledWorker({
    monthsWorkedInManitoba: 6,
    isOutOfProvinceGraduate: true
  });
  assert.equal(oopShort.isStreamEligible, false);

  // Deductions for past study/work in other provinces (-100 each)
  const penalized = assessManitobaPnpSkilledWorker({
    monthsWorkedInManitoba: 12,
    hasPastStudyInAnotherProvince: true,
    hasPastWorkInAnotherProvince: true
  });
  assert.equal(penalized.eoiScoreSummary.riskDeductions, -200);

  // Parameter resilience
  assert.ok(assessManitobaPnpSkilledWorker(null));
});

test('Rec 684: assessManitobaRentIncrease verifies 3.0% guideline, 3-month Form 2 notice, and exemptions', () => {
  // Compliant 3.0% increase: $1,200 * 1.03 = $1,236 with 3 months notice using Form 2
  const compliant = assessManitobaRentIncrease({
    currentMonthlyRentCad: 1200,
    proposedMonthlyRentCad: 1236,
    noticeMonthsGiven: 3,
    usedPrescribedForm2: true,
    monthsSinceLastRentIncrease: 12
  });
  assert.equal(compliant.complianceStatus, 'COMPLIANT_RENT_INCREASE');
  assert.equal(compliant.allowableMaxRentUnderGuidelineCad, 1236);

  // Excessive increase above 3% without RTB approval
  const excessive = assessManitobaRentIncrease({
    currentMonthlyRentCad: 1200,
    proposedMonthlyRentCad: 1350,
    noticeMonthsGiven: 3,
    usedPrescribedForm2: true
  });
  assert.equal(excessive.complianceStatus, 'UNLAWFUL_RENT_INCREASE');

  // High rent exemption ($1,615+)
  const luxury = assessManitobaRentIncrease({
    currentMonthlyRentCad: 1800,
    proposedMonthlyRentCad: 1950,
    noticeMonthsGiven: 3,
    usedPrescribedForm2: true
  });
  assert.equal(luxury.isHighRentExempt, true);
  assert.equal(luxury.isExemptFromGuideline, true);

  // Parameter resilience
  assert.ok(assessManitobaRentIncrease(null));
});

test('Rec 685: searchMarketGapBatch1 resolves settlement queries and safely handles edge inputs', () => {
  const result = searchMarketGapBatch1({ topic: 'application_portal', limit: 5 });
  assert.ok(result);
  assert.ok(Array.isArray(result.items));
  assert.ok(result.total > 0);

  const stats = getMarketGapBatch1Stats();
  assert.equal(stats.totalQuestions, 2000);

  // Resilience against null and primitives
  assert.ok(searchMarketGapBatch1(null));
  assert.ok(searchMarketGapBatch1(''));
  assert.ok(searchMarketGapBatch1(42));
});

test('Rec 686: searchMarketGapBatch2 resolves settlement queries and safely handles edge inputs', () => {
  const result = searchMarketGapBatch2({ limit: 5 });
  assert.ok(result);
  assert.ok(Array.isArray(result.items));
  assert.ok(result.total > 0);

  const stats = getMarketGapBatch2Stats();
  assert.equal(stats.totalQuestions, 2000);

  // Resilience against null and primitives
  assert.ok(searchMarketGapBatch2(null));
  assert.ok(searchMarketGapBatch2(''));
});

test('Rec 687: searchMarketGapBatch3 resolves settlement queries and safely handles edge inputs', () => {
  const result = searchMarketGapBatch3({ limit: 5 });
  assert.ok(result);
  assert.ok(Array.isArray(result.items));
  assert.ok(result.total > 0);

  const stats = getMarketGapBatch3Stats();
  assert.equal(stats.totalQuestions, 2000);

  // Resilience against null and primitives
  assert.ok(searchMarketGapBatch3(null));
  assert.ok(searchMarketGapBatch3(''));
});

test('Rec 688: evaluateMedicalAdmissibility verifies excessive demand threshold and s. 38(2) exemptions', () => {
  // Excessive demand: economic applicant with $35,000/yr medical costs exceeding threshold ($26,304)
  const excessive = evaluateMedicalAdmissibility({
    immigrationStream: 'express_entry',
    estimatedAnnualMedicationCostCad: 35000,
    hasDangerToPublicHealth: false,
    hasDangerToPublicSafety: false,
    hasPrivateInsuranceCoverage: false,
    availableLiquidFundsCad: 5000
  });
  assert.equal(excessive.determination, 'HIGH_RISK_EXCESSIVE_DEMAND');
  assert.equal(excessive.isStatutorilyExempt, false);

  // Exempt category (Spousal sponsorship exempt from excessive demand under IRPA s. 38(2))
  const spousalExempt = evaluateMedicalAdmissibility({
    immigrationStream: 'spousal_sponsorship',
    estimatedAnnualMedicationCostCad: 50000
  });
  assert.equal(spousalExempt.determination, 'STATUTORILY_EXEMPT');
  assert.equal(spousalExempt.isStatutorilyExempt, true);
  assert.equal(spousalExempt.statutoryExemptionBasis, 'IRPA s. 38(2)');

  // Danger to public health (IRPA s. 38(1)(a) active infectious TB)
  const danger = evaluateMedicalAdmissibility({
    immigrationStream: 'spousal_sponsorship',
    hasDangerToPublicHealth: true
  });
  assert.equal(danger.determination, 'INADMISSIBLE_PUBLIC_DANGER');
  assert.equal(danger.publicDangerAssessment.hasIssues, true);

  // Parameter resilience
  assert.ok(evaluateMedicalAdmissibility(null));
});

test('Rec 689: migrationDryRun executes migrations on disposable clone without altering original db', async () => {
  const tempDir = mkdtempSync(join(tmpdir(), 'northstar-dryrun-'));
  const dbPath = join(tempDir, 'source.db');

  try {
    const store = openStore(dbPath);
    store.db.close();

    const dryRunResult = await migrationDryRun(dbPath);

    assert.equal(dryRunResult.dryRun, true);
    assert.equal(dryRunResult.outcome, 'applied');
    assert.equal(dryRunResult.report.integrityCheck, 'ok');
  } finally {
    try {
      rmSync(tempDir, { recursive: true, force: true });
    } catch {}
  }
});

test('Rec 690: configureEnglishDatabase safely configures SQLite pragmas and tables', () => {
  const db = new DatabaseSync(':memory:');
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS records(id TEXT PRIMARY KEY, body TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS audits(id INTEGER PRIMARY KEY, record_id TEXT, previous TEXT, next TEXT, reviewer TEXT, note TEXT, at TEXT);
      CREATE TABLE IF NOT EXISTS traces(id TEXT PRIMARY KEY, body TEXT, at TEXT);
      CREATE TABLE IF NOT EXISTS gaps(id INTEGER PRIMARY KEY, trace_id TEXT, topic TEXT, reason TEXT, at TEXT);
      CREATE TABLE IF NOT EXISTS feedback(id INTEGER PRIMARY KEY, trace_id TEXT, issue TEXT, at TEXT);
    `);
    configureEnglishDatabase(db);
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(t => t.name);
    assert.ok(tables.includes('schema_migrations'));

    // Parameter resilience
    assert.throws(() => configureEnglishDatabase(null), /Database instance with exec\(\) required/);
  } finally {
    db.close();
  }
});

test('Rec 691: monitorStateKey and openMonitorState store isolated hashed monitor state', () => {
  const tempDir = mkdtempSync(join(tmpdir(), 'northstar-monitor-'));
  const dbPath = join(tempDir, 'monitor.db');

  try {
    const key = monitorStateKey('queue', 'https://example.com/queue/audit');
    assert.ok(key.startsWith('queue:'));

    const monitorState = openMonitorState(dbPath);
    const store = monitorState.forMonitor(key);

    assert.equal(store.load(), null);
    store.save('{"status":"healthy","inspectedAt":1700000000}');
    assert.equal(store.load(), '{"status":"healthy","inspectedAt":1700000000}');

    monitorState.close();
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test('Rec 692: calculateMovingTaxDeduction validates 40-km rule, 15-day temporary living, and carryforward', () => {
  // Move 70km closer (85km old -> 15km new) qualifies (70km >= 40km)
  const result = calculateMovingTaxDeduction({
    distanceOldHomeToNewWorkKm: 85,
    distanceNewHomeToNewWorkKm: 15,
    householdMembersTraveling: 2,
    transportAndStorageCostsCad: 3000,
    travelDays: 2,
    travelDistanceKm: 500,
    province: 'ON',
    temporaryLivingDays: 18, // Above 15-day cap
    temporaryLivingLodgingCad: 1800,
    temporaryLivingMealsCad: 900,
    employmentIncomeEarnedAtNewLocationCad: 4000,
    employerReimbursementCad: 500
  });

  assert.equal(result.eligibilityCheck.isEligible, true);
  assert.equal(result.eligibilityCheck.distanceCloserKm, 70);
  assert.equal(result.expenseBreakdown.temporaryLiving.isCapped, true);
  assert.equal(result.expenseBreakdown.temporaryLiving.statutoryCappedDays, 15);
  // Income ceiling check: $4,000 new income caps current year deduction, remainder carries forward
  assert.equal(result.taxOptimization.allowableDeductionCurrentYearCad, 4000);
  assert.ok(result.taxOptimization.carryforwardToFutureYearsCad > 0);

  // Ineligible move (< 40km)
  const ineligible = calculateMovingTaxDeduction({
    distanceOldHomeToNewWorkKm: 30,
    distanceNewHomeToNewWorkKm: 10
  });
  assert.equal(ineligible.eligibilityCheck.isEligible, false);
  assert.equal(ineligible.taxOptimization.allowableDeductionCurrentYearCad, 0);

  // Parameter resilience
  assert.ok(calculateMovingTaxDeduction(null));
});

test('Rec 693: assessMovingExpenses creates comprehensive CRA Form T1-M breakdown and audit defense', () => {
  const assessment = assessMovingExpenses({
    applicantName: 'Sarah Jenkins',
    province: 'BC',
    relocationPurpose: 'employment',
    distanceKm: 150,
    canadianIncomeEarnedInYearCad: 50000,
    travelExpensesCad: 1200,
    moversAndShippingCad: 2500,
    temporaryLivingDays: 10,
    temporaryLivingDailyCostCad: 150,
    employerReimbursementCad: 800
  });

  assert.equal(assessment.isEligible, true);
  assert.equal(assessment.eligibilityVerdict, 'ELIGIBLE_FOR_T1M_DEDUCTION');
  assert.equal(assessment.province, 'BC');
  assert.ok(assessment.formT1MMapping.line1TransportationAndStorageCad === 2500);
  assert.ok(assessment.formT1MMapping.line2TravelExpensesCad === 1200);
  assert.ok(assessment.documentationChecklist.length >= 5);

  // Non-qualifying purpose
  const personal = assessMovingExpenses({
    relocationPurpose: 'personal',
    distanceKm: 500
  });
  assert.equal(personal.isEligible, false);
  assert.equal(personal.eligibilityVerdict, 'INELIGIBLE_NON_QUALIFYING_PURPOSE');

  // Parameter resilience
  assert.ok(assessMovingExpenses(null));
});

test('Rec 694: multi-country-gazette-crawler monitors IRCC, ESDC wage thresholds, and corridor registry', () => {
  // IRCC category-based selection notice detection
  const ircc = auditIrccMinisterialInstructions('Ministerial Instructions announcing category-based selection for French and Healthcare');
  assert.ok(ircc.totalNoticesDetected >= 1);
  assert.equal(ircc.notices[0].type, 'express_entry_category');

  // ESDC low-wage refusal check
  const esdcLow = auditEsdcPrevailingWages({
    offeredHourlyWageCad: 20.00,
    province: 'ON',
    cmaUnemploymentRatePercent: 7.2
  });
  assert.equal(esdcLow.stream, 'LOW-WAGE STREAM');
  assert.equal(esdcLow.isLmiaProcessable, false);
  assert.ok(esdcLow.refusalGrounds.length > 0);

  // Corridor rules
  const corridor = syncCorridorMigrationRules({ originCountry: 'IN', destinationCountry: 'CA' });
  assert.equal(corridor.corridorCode, 'IN_CA');
  assert.equal(corridor.originCountry, 'India');
  assert.equal(corridor.destinationCountry, 'Canada');

  // Multilingual synset policy delta
  const synset = translatePolicyDelta({ termKey: 'OVERTIME_PAY', targetLanguage: 'hi' });
  assert.ok(synset.canonicalTranslation.includes('ओवरटाइम'));

  // Unified audit resilience
  assert.ok(auditMultiCountryGazettes(null));
});

test('Rec 695: detectAndTranslateMultilingualQuery normalizes Hinglish/Devanagari queries to statutory concepts', () => {
  // Arrival in Mississauga query
  const arrival = detectAndTranslateMultilingualQuery('कल Mississauga पहुंचा क्या करूं sabse pehle?');
  assert.ok(arrival);
  assert.equal(arrival.isMultilingual, true);
  assert.equal(arrival.topic, 'arrival');
  assert.ok(arrival.canonicalStatutoryQuery.includes('arrival'));

  // Illegal rent increase query
  const rent = detectAndTranslateMultilingualQuery('Landlord बिना notice rent badha sakta hai?');
  assert.ok(rent);
  assert.equal(rent.topic, 'housing');

  // Non-multilingual standard English query
  const plain = detectAndTranslateMultilingualQuery('How do I apply for an Ontario driver licence?');
  assert.equal(plain, null);

  // Edge cases and parameter resilience
  assert.equal(detectAndTranslateMultilingualQuery(null), null);
  assert.equal(detectAndTranslateMultilingualQuery(123), null);
});
