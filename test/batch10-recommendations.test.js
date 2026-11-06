import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateCaregiverDirectToPr } from '../src/federal-caregiver-direct-to-pr-pilot-navigator.js';
import { evaluateFederalFrancophoneMobilityC16 } from '../src/federal-francophone-mobility-c16-expansion-navigator.js';
import { evaluateFederalStudentOffCampusWork } from '../src/federal-study-permit-off-campus-work-hours-navigator.js';
import { calculateDaysToExpiry, evaluateSpousalSowp } from '../src/bowp-navigator.js';
import { evaluateFederalC11EntrepreneurWorkPermit } from '../src/federal-c11-entrepreneur-self-employed-work-permit-navigator.js';
import { evaluateAlbertaSecurityDeposit } from '../src/alberta-tenancy-security-deposit-navigator.js';
import { evaluateSaskatchewanSecurityDepositReturn } from '../src/saskatchewan-residential-tenancy-security-deposit-return-navigator.js';
import { evaluateAlbertaPeriodicTenancyNotice } from '../src/alberta-residential-tenancy-periodic-tenancy-termination-navigator.js';
import { calculateAlbertaOvertimeHours, evaluateAlbertaOvertimeBanking } from '../src/alberta-employment-overtime-banking-navigator.js';
import { evaluateManitobaGeneralHolidayPay } from '../src/manitoba-employment-statutory-holiday-pay-navigator.js';
import { evaluateOntarioPublicHolidayPay } from '../src/ontario-employment-public-holiday-pay-calculation-navigator.js';
import { evaluateStudyPermitCapAndPal } from '../src/study-permit-cap-pal-navigator.js';
import { evaluateStudyToPrPathway } from '../src/study-to-pr-navigator.js';
import { evaluateFederalSuvPeerReview } from '../src/federal-start-up-visa-peer-review-navigator.js';

test('Rec 216: Caregiver Direct-to-PR Pilot — Sanitizes CLB scores and Canadian experience months', () => {
  const result = evaluateCaregiverDirectToPr({
    clbSpeaking: 'bad',
    clbListening: 15,
    canadianCaregiverExperienceMonths: 'invalid'
  });
  assert.equal(result.experienceCategory, 'DIRECT_PR_WITH_QUALIFYING_JOB_OFFER');
  assert.ok(result.disqualifications.some(d => d.criterion === 'LANGUAGE_BENCHMARK_UNSATISFIED'));
});

test('Rec 217: Francophone Mobility C16 — Sanitizes French oral NCLC level and TEER category', () => {
  const result = evaluateFederalFrancophoneMobilityC16({
    frenchOralNclcLevel: 'bad',
    teerCategory: 'invalid'
  });
  assert.ok(result.statutoryViolations.some(v => v.rule === 'BELOW_MINIMUM_FRENCH_ORAL_BENCHMARK'));
  assert.equal(result.teerCategory, 1);
});

test('Rec 218: Federal Student Work Hours — Sanitizes weekly hours and program length months', () => {
  const result = evaluateFederalStudentOffCampusWork({
    weeklyHoursWorkedOffCampus: 'bad',
    programLengthMonths: 'invalid'
  });
  assert.equal(result.weeklyHoursWorkedOffCampus, 0);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'PROGRAM_DURATION_UNDER_6_MONTHS'));
});

test('Rec 219: BOWP Expiry Days & SOWP Months — Resilient to invalid date strings and bad inputs', () => {
  const days = calculateDaysToExpiry('invalid-date-string');
  assert.equal(days, 0);
  assert.ok(Number.isFinite(days));

  const sowp = evaluateSpousalSowp({
    hasSpouse: true,
    principalPermitRemainingMonths: 'invalid'
  });
  assert.equal(sowp.meetsDurationRequirement, true);
  assert.equal(sowp.isApplicable, true);
});

test('Rec 220: Federal C11 Entrepreneur — Sanitizes business ownership, capital, and staff count', () => {
  const result = evaluateFederalC11EntrepreneurWorkPermit({
    businessOwnershipPercentage: 'invalid',
    hasControllingInterest: false,
    capitalInvestedCad: 'bad',
    projectedCanadianStaffHired: 'not-a-number'
  });
  assert.equal(result.businessOwnershipPercentage, 0);
  assert.equal(result.businessViabilityMetrics.capitalInvestedCad, 0);
  assert.equal(result.businessViabilityMetrics.projectedCanadianStaffHired, 0);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'INSUFFICIENT_BUSINESS_OWNERSHIP_OR_CONTROL'));
});

test('Rec 221: Alberta Tenancy Security Deposit — Coerces string numerics without falling back to defaults', () => {
  const result = evaluateAlbertaSecurityDeposit({
    monthlyRentCad: '2400',
    securityDepositPaidCad: '2400',
    daysSinceTenancyEnded: '15'
  });
  assert.equal(result.depositAudit.monthlyRentCad, 2400);
  assert.equal(result.depositAudit.securityDepositPaidCad, 2400);
  assert.equal(result.refundAssessment.daysSinceTenancyEnded, 15);
});

test('Rec 222: Saskatchewan Security Deposit Return — Sanitizes rent, deposit, and elapsed business days', () => {
  const result = evaluateSaskatchewanSecurityDepositReturn({
    monthlyRentCad: 'bad',
    securityDepositPaidCad: 'invalid',
    businessDaysSinceTenancyEnded: 'bad'
  });
  assert.equal(result.financialSummary.monthlyRentCad, 0);
  assert.equal(result.financialSummary.securityDepositPaidCad, 0);
  assert.equal(result.businessDaysSinceTenancyEnded, 0);
});

test('Rec 223: Alberta periodic notice rejects invalid months and accepts zero', () => {
  assert.throws(() => evaluateAlbertaPeriodicTenancyNotice({ fullTenancyMonthsNoticeGiven: 'invalid' }));
  const result = evaluateAlbertaPeriodicTenancyNotice({ fullTenancyMonthsNoticeGiven: 0 });
  assert.ok(result.statutoryViolations.some(v => v.rule === 'INSUFFICIENT_LANDLORD_NOTICE_PERIOD'));
});

test('Rec 224: Alberta overtime banking rejects invalid hours and monetary inputs', () => {
  for (const hours of [['invalid', 10], [25], Array(8).fill(1)]) {
    assert.throws(() => calculateAlbertaOvertimeHours(hours));
  }
  assert.equal(calculateAlbertaOvertimeHours([0, 10]).statutoryOvertimeHours, 2);
  for (const field of ['regularHourlyWageCad', 'existingBankedHours', 'assessmentDate', 'isEmploymentTerminating']) {
    assert.throws(() => evaluateAlbertaOvertimeBanking({ [field]: 'bad' }));
  }
});

test('Rec 225: Manitoba holiday pay rejects malformed wage inputs', () => {
  for (const key of ['grossWagesInPast4WeeksCad', 'regularHourlyWageCad']) {
    assert.throws(() => evaluateManitobaGeneralHolidayPay({ [key]: 'invalid' }), error => error.statusCode === 400);
  }
});

test('Rec 226: Ontario public holiday pay rejects malformed lookback figures', () => {
  for (const field of ['regularWagesInPast4WeeksCad', 'vacationPayPayableInPast4WeeksCad']) {
    assert.throws(() => evaluateOntarioPublicHolidayPay({ [field]: 'invalid' }), error => error.statusCode === 400);
  }
});

test('Rec 227: Study Permit Cap PAL — Eliminates string concatenation bug and bounds family size', () => {
  const result = evaluateStudyPermitCapAndPal({
    tuitionFeeFirstYearCad: '20000',
    liquidFundsAvailableCad: '50000',
    familyMembersAccompanying: '2'
  });
  assert.equal(typeof result.financialAudit.totalStatutoryProofRequiredCad, 'number');
  assert.equal(result.financialAudit.tuitionFeeFirstYearCad, 20000);
  assert.equal(result.financialAudit.totalStatutoryProofRequiredCad, 60388);
  assert.equal(result.financialAudit.liquidFundsAvailableCad, 50000);
  assert.equal(result.financialAudit.financialBufferCad, -10388);
  assert.equal(result.financialAudit.status, 'DEFICIT_RISK');
});

test('Rec 228: Study-to-PR Navigator — Bounds CLB score, target TEER, and foreign experience years', () => {
  const result = evaluateStudyToPrPathway({
    expectedClbLanguage: 'bad',
    targetNocTeer: 'invalid',
    yearsForeignExperience: 'bad'
  });
  assert.equal(result.expectedClbLanguage, 9);
  assert.equal(result.targetNocTeer, 1);
  assert.equal(result.yearsForeignExperience, 2);
  assert.ok(result.prPathways.projectedCrsGain > 0);
});

test('Rec 229: Start-Up Visa Peer Review — Bounds equity percentages and clamps co-founders to max 5', () => {
  const result = evaluateFederalSuvPeerReview({
    totalFoundersCount: 20,
    applicantVotingRightsPercentage: 'invalid',
    securedInvestmentAmountCad: 'bad'
  });
  assert.equal(result.totalFoundersCount, 5);
  assert.equal(result.applicantVotingRightsPercentage, 0);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'INSUFFICIENT_FOUNDER_EQUITY_UNDER_10_PERCENT'));
});
