import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { questionSuite } from '../scripts/question-suite-180.js';
import { createApp } from '../src/server.js';
import { openStore } from '../src/store.js';
import { evaluateRentIncreaseNotice } from '../src/rent-increase-defense.js';
import { evaluateHealthcareEligibility } from '../src/healthcare-navigator.js';
import { calculateOntarioSubsidyContribution, evaluateChildcareSupport } from '../src/childcare-navigator.js';
import { calculateCcbAnnual, calculateGstHstCreditAnnual, calculateNewcomerBenefits } from '../src/newcomer-benefits-calculator.js';
import { evaluateStudentWorkCompliance } from '../src/student-compliance.js';
import { evaluateSmallClaimsDispute } from '../src/small-claims-navigator.js';
import { evaluateParentalLeave } from '../src/parental-leave-navigator.js';
import { getAgePoints } from '../src/express-entry-optimizer.js';
import { runSearchBaselineComparison } from '../scripts/compare-search-baselines.js';
import { evaluateVulnerableWorkerProtection } from '../src/vulnerable-worker-defense.js';
import { auditLeaseAgreement } from '../src/lease-guard.js';
import { evaluateSuperVisaAndFamilySponsorship } from '../src/super-visa-sponsor.js';

test('Rec 186: Question suite 180 reflects approved global destination guidance (E04 and E05)', () => {
  const e04 = questionSuite.find(q => q.id === 'E04');
  const e05 = questionSuite.find(q => q.id === 'E05');
  assert.ok(e04);
  assert.ok(e05);
  assert.equal(e04.exp, 'guidance');
  assert.equal(e05.exp, 'guidance');
});

test('Rec 187: HTTP Server emits X-Frame-Options: DENY defense-in-depth header', async () => {
  const memStore = openStore(':memory:');
  const app = createApp(memStore, 'test-token', {});
  try {
    await new Promise((resolve, reject) => {
      app.once('error', reject);
      app.listen(0, '127.0.0.1', resolve);
    });
    const port = app.address().port;
    const res = await fetch(`http://127.0.0.1:${port}/health`);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('x-frame-options'), 'DENY');
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
  } finally {
    if (app.listening) await new Promise(r => app.close(r));
    memStore.db.close();
  }
});

test('Rec 188: Rent Increase Defense safely handles NaN and Infinity rent numbers', () => {
  const result = evaluateRentIncreaseNotice({
    currentMonthlyRentCad: NaN,
    proposedMonthlyRentCad: Infinity
  });
  assert.equal(Number.isFinite(result.rentCalculations.currentMonthlyRentCad), true);
  assert.equal(Number.isFinite(result.rentCalculations.proposedMonthlyRentCad), true);
  assert.equal(Number.isFinite(result.rentCalculations.proposedIncreasePercent), true);
  assert.equal(typeof result.validityVerdict, 'string');
});

test('Rec 189: Healthcare Navigator safely bounds household size and work permit months', () => {for(const fields of [{workPermitDurationMonths:-5},{householdSize:Infinity},{province:'ZZ'},{immigrationStatus:'unknown'}])assert.throws(()=>evaluateHealthcareEligibility({province:'ON',immigrationStatus:'work_permit',...fields}));});

test('Rec 190: Childcare Navigator bounds large children arrays and NaN incomes', () => {
  const parentContrib = calculateOntarioSubsidyContribution(NaN);
  assert.equal(parentContrib, 0);

  // Large children array (e.g. 50 items) is safely clamped to max 10 to avoid DoS
  const children50 = Array.from({ length: 50 }, () => ({ ageGroup: 'toddler' }));
  const result = evaluateChildcareSupport({
    city: 'Toronto',
    annualFamilyIncomeCad: Infinity,
    children: children50
  });
  assert.equal(result.childrenBreakdown.length, 10);
  assert.equal(Number.isFinite(result.monthlyCostSummary.unsubsidizedMarketMonthlyTotalCad), true);
});

test('Rec 191: Newcomer Benefits Calculator clamps child counts and non-finite incomes', () => {
  const ccb = calculateCcbAnnual(999, 999, NaN);
  assert.equal(Number.isFinite(ccb), true);
  assert.ok(ccb > 0);

  const gst = calculateGstHstCreditAnnual('married', Infinity, -5000);
  assert.equal(Number.isFinite(gst), true);

  const master = calculateNewcomerBenefits({
    childrenUnder6Count: 50,
    children6to17Count: NaN,
    adjustedFamilyNetIncomeCad: Infinity
  });
  assert.equal(Number.isFinite(master.annualTotals.totalAnnualGovernmentCredits), true);
});

test('Rec 192: Student Compliance safely handles non-finite hours and 150-day leave caps', () => {
  const compliant = evaluateStudentWorkCompliance({
    weeklyHoursWorked: NaN,
    enrollmentStatus: 'full_time'
  });
  assert.equal(compliant.isWorkAuthorized, true);
  assert.equal(compliant.statutoryViolations.length, 0);

  const overLeave = evaluateStudentWorkCompliance({
    enrollmentStatus: 'authorized_leave',
    leaveDurationDays: 180,
    weeklyHoursWorked: 0
  });
  assert.ok(overLeave.statutoryViolations.some(v => v.statute === 'IRPR s. 220.1(1)'));
});

test('Rec 193: Small Claims Navigator safely handles NaN claim principal and interest', () => {
  const result = evaluateSmallClaimsDispute({
    province: 'ON',
    claimAmountCad: NaN,
    prejudgmentInterestRatePercent: Infinity
  });
  assert.equal(Number.isFinite(result.interestAndCostsCalculation.principalClaimCad), true);
  assert.equal(Number.isFinite(result.interestAndCostsCalculation.accruedPrejudgmentInterestCad), true);
  assert.equal(result.jurisdictionAudit.isWithinSmallClaimsLimit, true);
});

test('Rec 194: Parental Leave Navigator guards against non-finite salary and hours', () => {
  const result = evaluateParentalLeave({
    insurableHoursWorkedPast52Weeks: NaN,
    annualGrossSalaryCad: Infinity,
    employerServiceWeeks: NaN
  });
  assert.equal(Number.isFinite(result.weeklyBenefitCad), true);
  assert.equal(Number.isFinite(result.totalProjectedCashPayoutCad), true);
});

test('Rec 195: Express Entry CRS Age Points handles non-integers, NaN and extremes', () => {
  assert.equal(getAgePoints(29.6, false), 105);
  assert.equal(getAgePoints(NaN, false), 110); // defaults safely to 29
  assert.equal(getAgePoints(Infinity, false), 110); // non-finite safely defaults to 29
  assert.equal(getAgePoints(-10, false), 0); // clamped to 17
});

test('Rec 196: Lexical vs Hybrid Search Comparison baseline executes and writes artifact', () => {
  const rep = runSearchBaselineComparison();
  assert.ok(rep.corpusSize > 0);
  assert.ok(rep.queryCount > 0);
  assert.equal(typeof rep.metrics.top1AgreementRate, 'number');
  assert.equal(typeof rep.metrics.meanTop5JaccardOverlap, 'number');
  assert.ok(rep.metrics.top1AgreementRate >= 0.85);
  assert.ok(existsSync('artifacts/search-baseline-comparison.json'));
});

test('Rec 197: Destination Contract documentation contains cross-country capability matrix', () => {
  const doc = readFileSync('docs/DESTINATION_CONTRACT.md', 'utf8');
  assert.ok(doc.includes('Cross-Country Capabilities Matrix'));
  assert.ok(doc.includes('| Canada | `CA` |'));
  assert.ok(doc.includes('| United States | `US` |'));
  assert.ok(doc.includes('| United Kingdom | `UK` |'));
  assert.ok(doc.includes('| Australia | `AU` |'));
});

test('Rec 198: Vulnerable Worker Defense enforces full statutory repayment phrasing and finite fees', () => {
  const result = evaluateVulnerableWorkerProtection({
    currentPermitType: 'closed_employer_specific_work_permit',
    abuseGrounds: ['illegal_recruitment_fees'],
    recruitmentFeesPaidCad: NaN,
    unpaidWagesOrKickbacksCad: Infinity
  });
  assert.equal(result.isVwowpEligible, true);
  assert.ok(result.immediateRemedies.some(r => r.includes('full statutory repayment')));
  assert.ok(!result.immediateRemedies.some(r => r.includes('100% repayment')));
});

test('Rec 199: Lease Guard uses Statutorily VOID and protects against non-finite deposit demands', () => {
  const result = auditLeaseAgreement({
    province: 'ON',
    monthlyRentCad: NaN,
    depositDemands: {
      damageDepositCad: Infinity,
      keyDepositCad: NaN
    },
    clausesPresent: ['no_pets', 'tenant_repairs']
  });
  assert.equal(result.overallSafetyRating, 'high_risk');
  assert.ok(result.clauseAudits.every(c => !c.ruling.includes('100% VOID')));
  assert.ok(result.clauseAudits.some(c => c.ruling.includes('Statutorily VOID')));
});

test('Rec 200: Super Visa Sponsor bounds large household sizes and handles NaN income', () => {
  const result = evaluateSuperVisaAndFamilySponsorship({
    sponsorFamilySize: 99,
    invitedParentsCount: 50,
    sponsorLine15000IncomeYear1: NaN
  });
  assert.equal(result.totalFamilyUnitSize, 50); // 30 + 20 clamped
  assert.equal(Number.isFinite(result.incomeAudit.year1.actualIncomeCad), true);
  assert.equal(result.isStatutorilyEligible, false);
});
