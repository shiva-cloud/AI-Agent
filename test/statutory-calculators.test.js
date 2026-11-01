import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCreditTrajectory,
  evaluateLicenceExchange,
  calculateGradePlacement,
  calculateSeveranceAndEi,
  calculateTenancyDamages,
  calculateDocumentExpiryRunway,
  evaluateExcessiveDemandMedical
} from '../src/statutory-calculators.js';

test('credit trajectory simulator accurately models utilization tiers and hard inquiries', () => {
  // Scenario 1: Optimal behavior (spend $400 on $2,000 limit, pay in full, 1 inquiry)
  const optimal = calculateCreditTrajectory({ limit: 2000, spend: 400, strategy: 'full_on_time', inquiries: 1 });
  assert.equal(optimal.utilRatio, 20);
  assert.equal(optimal.utilClass, 'tier-prime');
  assert.ok(optimal.m9Score >= 720, `Expected m9Score >= 720, got: ${optimal.m9Score}`);
  assert.equal(optimal.m9Tier.cls, 'tier-prime');

  // Scenario 2: High utilization penalty (spend $1,800 on $2,000 limit = 90%)
  const highUtil = calculateCreditTrajectory({ limit: 2000, spend: 1800, strategy: 'full_on_time', inquiries: 1 });
  assert.equal(highUtil.utilRatio, 90);
  assert.equal(highUtil.utilClass, 'tier-fair');
  assert.ok(highUtil.monthlyPointsDelta < 0);
  assert.ok(highUtil.m9Score < optimal.m9Score);

  // Scenario 3: Multiple hard inquiries penalty
  const multiInquiry = calculateCreditTrajectory({ limit: 2000, spend: 400, strategy: 'full_on_time', inquiries: 4 });
  assert.equal(multiInquiry.inquiryPenalty, -35);
  assert.ok(multiInquiry.m1Score < optimal.m1Score);

  // Scenario 4: Multiple mid-month payments bonus
  const midMonth = calculateCreditTrajectory({ limit: 2000, spend: 400, strategy: 'multiple_payments', inquiries: 1 });
  assert.ok(midMonth.m9Score >= optimal.m9Score);
});

test('driving licence exchange engine accurately differentiates reciprocal vs experience credit', () => {
  // Scenario 1: Full reciprocal country (United Kingdom)
  const uk = evaluateLicenceExchange({ origin: 'United Kingdom', destination: 'ON' });
  assert.equal(uk.isReciprocal, true);
  assert.equal(uk.roadTestRequired, false);
  assert.equal(uk.waitPeriodSkipped, true);
  assert.match(uk.badgeText, /Direct Exchange/i);

  // Scenario 2: Non-reciprocal with 2+ years and authenticated extract (India)
  const inFull = evaluateLicenceExchange({ origin: 'India', destination: 'ON', years: '2plus', docs: 'extract' });
  assert.equal(inFull.isReciprocal, false);
  assert.equal(inFull.roadTestRequired, true);
  assert.equal(inFull.waitPeriodSkipped, true);
  assert.match(inFull.badgeText, /Direct Full G Test/i);

  // Scenario 3: Non-reciprocal with 2+ years but card only (no extract)
  const inCardOnly = evaluateLicenceExchange({ origin: 'India', destination: 'ON', years: '2plus', docs: 'licence_only' });
  assert.equal(inCardOnly.isReciprocal, false);
  assert.equal(inCardOnly.roadTestRequired, true);
  assert.equal(inCardOnly.waitPeriodSkipped, true);
  assert.match(inCardOnly.badgeText, /Take G2 Test/i);

  // Scenario 4: Under 1 year learner experience
  const novice = evaluateLicenceExchange({ origin: 'Philippines', destination: 'ON', years: 'under1', docs: 'extract' });
  assert.equal(novice.isReciprocal, false);
  assert.equal(novice.roadTestRequired, true);
  assert.equal(novice.waitPeriodSkipped, false);
  assert.match(novice.badgeText, /Standard Graduated Licensing/i);

  // Scenario 5: British Columbia reciprocal direct exchange (Germany -> BC)
  const bcDirect = evaluateLicenceExchange({ origin: 'Germany', destination: 'BC' });
  assert.equal(bcDirect.isReciprocal, true);
  assert.equal(bcDirect.roadTestRequired, false);
  assert.match(bcDirect.badgeText, /Direct Class 5 Exchange/i);

  // Scenario 6: United Kingdom DVLA designated country (Australia -> UK)
  const ukDirect = evaluateLicenceExchange({ origin: 'Australia', destination: 'UK' });
  assert.equal(ukDirect.isReciprocal, true);
  assert.equal(ukDirect.roadTestRequired, false);
  assert.match(ukDirect.badgeText, /Direct DVLA Exchange/i);

  // Scenario 7: California DMV requires drive test for all foreign newcomers
  const caDmv = evaluateLicenceExchange({ origin: 'United Kingdom', destination: 'US_CA' });
  assert.equal(caDmv.roadTestRequired, true);
  assert.match(caDmv.badgeText, /Behind-The-Wheel Drive Test/i);

  // Scenario 8: Dubai RTA 32 recognized countries direct exchange (Canada -> AE)
  const uaeDirect = evaluateLicenceExchange({ origin: 'Canada', destination: 'AE' });
  assert.equal(uaeDirect.isReciprocal, true);
  assert.equal(uaeDirect.roadTestRequired, false);
  assert.match(uaeDirect.badgeText, /Direct Exchange/i);

  // Scenario 9: Germany FeV Annex 11 conversion (United States -> DE)
  const deDirect = evaluateLicenceExchange({ origin: 'United States', destination: 'DE' });
  assert.equal(deDirect.isReciprocal, true);
  assert.equal(deDirect.roadTestRequired, false);
  assert.match(deDirect.badgeText, /Direct German Exchange/i);
});

test('child schooling placement accurately maps birth years to grades and verifies tuition rights', () => {
  // Age 4 (JK)
  const jk = calculateGradePlacement({ birthYear: 2022, referenceYear: 2026, status: 'work_permit', lang: 'non_english' });
  assert.equal(jk.age, 4);
  assert.equal(jk.grade, 'Junior Kindergarten (JK)');
  assert.equal(jk.tuitionExempt, true);
  assert.equal(jk.eslAssessmentRequired, true);

  // Age 6 (Grade 1)
  const g1 = calculateGradePlacement({ birthYear: 2020, referenceYear: 2026, status: 'pr', lang: 'english' });
  assert.equal(g1.age, 6);
  assert.equal(g1.grade, 'Grade 1');
  assert.equal(g1.level, 'Primary Elementary');
  assert.equal(g1.tuitionExempt, true);
  assert.equal(g1.eslAssessmentRequired, false);

  // Age 14 (Grade 9 High School)
  const g9 = calculateGradePlacement({ birthYear: 2012, referenceYear: 2026, status: 'refugee', lang: 'non_english' });
  assert.equal(g9.age, 14);
  assert.equal(g9.grade, 'Grade 9');
  assert.equal(g9.level, 'Secondary / High School');
  assert.equal(g9.tuitionExempt, true);

  // Statutory guarantee check
  assert.match(g9.statutoryGuarantee, /Education Act Section 49.2/i);
});

test('layoff severance and EI runway calculator adheres to Ontario ESA and federal EI formulas', () => {
  // Scenario 1: 3 years service, large employer (no ESA severance yet, but 3 weeks termination pay)
  const s3 = calculateSeveranceAndEi({ years: 3, isLargePayroll: true, grossSalary: 85000, monthlyNetBurn: 3500 });
  assert.equal(s3.noticeWeeks, 3);
  assert.equal(s3.severanceWeeks, 0);
  assert.ok(s3.terminationPay > 4900);
  assert.equal(s3.eiWeekly, 668.00); // capped at max weekly benefit
  assert.equal(s3.eiWeeks, 36);
  assert.ok(s3.runwayMonths >= 8.0);

  // Scenario 2: 7 years service, large employer (qualifies for 7 weeks severance + 7 weeks notice)
  const s7 = calculateSeveranceAndEi({ years: 7, isLargePayroll: true, grossSalary: 104000, monthlyNetBurn: 4000 });
  assert.equal(s7.noticeWeeks, 7);
  assert.equal(s7.severanceWeeks, 7);
  assert.equal(s7.weeklySalary, 2000);
  assert.equal(s7.terminationPay, 14000);
  assert.equal(s7.severancePay, 14000);
  assert.ok(s7.totalStatutoryRunway > 50000);
  assert.ok(s7.runwayMonths >= 12.0);

  // Scenario 3: Small employer payroll (<$2.5M) -> zero statutory severance even after 6 years
  const sSmall = calculateSeveranceAndEi({ years: 6, isLargePayroll: false, grossSalary: 60000 });
  assert.equal(sSmall.noticeWeeks, 6);
  assert.equal(sSmall.severanceWeeks, 0);
  assert.equal(sSmall.severancePay, 0);
});

test('tenancy evidence vault damages calculator computes statutory abatements and checks LTB limits', () => {
  // Scenario 1: Full package remedy (3 months interference, $2,200 rent, $750 out-of-pocket, $2,500 fine)
  const d1 = calculateTenancyDamages({ months: 3, monthlyRent: 2200, expenses: 750, remedy: 'full_package' });
  assert.equal(d1.rentAbatement, 1980); // 3 * 2200 * 0.30
  assert.equal(d1.adminFineRecommended, 2500);
  assert.equal(d1.totalClaim, 5230);
  assert.equal(d1.isWithinJurisdiction, true);

  // Scenario 2: 100% Abatement for lockout
  const dLockout = calculateTenancyDamages({ months: 1, monthlyRent: 2500, expenses: 1000, remedy: 'abatement_only' });
  assert.equal(dLockout.rentAbatement, 2500); // 1 * 2500 * 1.0
  assert.equal(dLockout.totalClaim, 3500);
  assert.equal(dLockout.isWithinJurisdiction, true);

  // Scenario 3: Extreme damages capped at $35,000 threshold check
  const dLarge = calculateTenancyDamages({ months: 24, monthlyRent: 4000, expenses: 10000, remedy: 'full_package' });
  assert.ok(dLarge.totalClaim > 35000);
  assert.equal(dLarge.isWithinJurisdiction, false);
});

test('document expiry watchdog accurately computes runway and maintained status rights', () => {
  const refDate = new Date('2026-10-31T12:00:00Z');

  // Scenario 1: 45 days remaining (Urgent action window under IRPR 186(u))
  const urgent = calculateDocumentExpiryRunway({
    docType: 'work_permit',
    expiryDateStr: '2026-12-15',
    referenceDate: refDate
  });
  assert.equal(urgent.status, 'urgent');
  assert.equal(urgent.isExpired, false);
  assert.equal(urgent.isUrgent, true);
  assert.equal(urgent.maintainedStatusProtected, true);
  assert.match(urgent.advice, /IRPR Section 186\(u\)/i);

  // Scenario 2: 150 days remaining (Warning window)
  const warning = calculateDocumentExpiryRunway({
    docType: 'study_permit',
    expiryDateStr: '2027-03-30',
    referenceDate: refDate
  });
  assert.equal(warning.status, 'warning');
  assert.equal(warning.isExpired, false);

  // Scenario 3: Expired document (Section 182 90-day restoration)
  const expired = calculateDocumentExpiryRunway({
    docType: 'work_permit',
    expiryDateStr: '2026-10-15',
    referenceDate: refDate
  });
  assert.equal(expired.status, 'expired');
  assert.equal(expired.isExpired, true);
  assert.match(expired.advice, /IRPA Section 182/i);
});

test('excessive demand medical evaluator accurately tests IRPA s. 38(1)(c) threshold and exemptions', () => {
  // Scenario 1: Low health cost ($5,000/yr), 5-year Express Entry applicant -> Admissible
  const lowCost = evaluateExcessiveDemandMedical({
    annualHealthCost: 5000,
    annualSocialCost: 0,
    durationYears: 5,
    category: 'express_entry'
  });
  assert.equal(lowCost.isAdmissible, true);
  assert.equal(lowCost.proceduralFairnessRisk, false);
  assert.equal(lowCost.mitigationPlanRequired, false);
  assert.equal(lowCost.annualThreshold, 26220);
  assert.equal(lowCost.periodThreshold, 131100);
  assert.equal(lowCost.projectedTotalCost, 25000);

  // Scenario 2: High health cost ($35,000/yr) -> Exceeds threshold, PFL and Mitigation Plan required
  const highCost = evaluateExcessiveDemandMedical({
    annualHealthCost: 30000,
    annualSocialCost: 5000,
    durationYears: 5,
    category: 'express_entry'
  });
  assert.equal(highCost.isAdmissible, false);
  assert.equal(highCost.proceduralFairnessRisk, true);
  assert.equal(highCost.mitigationPlanRequired, true);
  assert.equal(highCost.assessment, 'excessive_demand_risk');
  assert.match(highCost.guidance, /Procedural Fairness Letter/i);

  // Scenario 3: High cost ($40,000/yr) but exempt category (sponsored spouse) under IRPA s. 38(2) -> Admissible
  const exemptSpouse = evaluateExcessiveDemandMedical({
    annualHealthCost: 40000,
    annualSocialCost: 0,
    category: 'family_spouse'
  });
  assert.equal(exemptSpouse.isExempt, true);
  assert.equal(exemptSpouse.isAdmissible, true);
  assert.equal(exemptSpouse.proceduralFairnessRisk, false);
  assert.equal(exemptSpouse.assessment, 'exempt_admissible');
  assert.match(exemptSpouse.guidance, /IRPA s\. 38\(2\)/i);
});
