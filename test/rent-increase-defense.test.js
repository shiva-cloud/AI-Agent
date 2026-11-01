import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateRentIncreaseNotice,
  RENT_GUIDELINES
} from '../src/rent-increase-defense.js';

test('Rent Increase Defense — Statutory constants match 2026 provincial standards', () => {
  assert.equal(RENT_GUIDELINES.ON.currentGuidelinePercent, 2.5);
  assert.equal(RENT_GUIDELINES.ON.noticeDaysRequired, 90);
  assert.equal(RENT_GUIDELINES.ON.exemptionCutoffDate, '2018-11-15');
  assert.equal(RENT_GUIDELINES.BC.currentGuidelinePercent, 3.0);
});

test('Rent Increase Defense — Identifies Ontario post-Nov 15, 2018 rent control exemption', () => {
  const result = evaluateRentIncreaseNotice({
    province: 'ON',
    firstOccupiedDate: '2021-04-01',
    currentMonthlyRentCad: 2000,
    proposedMonthlyRentCad: 2300, // 15% increase
    noticeServedDate: '2026-05-01',
    effectiveDate: '2026-08-01', // 92 days
    lastIncreaseDate: '2025-07-01', // >12 months
    officialFormUsed: 'N2'
  });

  assert.equal(result.rentControlStatus.isRentControlled, false);
  assert.equal(result.validityVerdict, 'UNRESTRICTED_MARKET_INCREASE');
  assert.ok(result.rentControlStatus.finding.includes('Bill 57'));
  assert.equal(result.statutoryDefects.length, 0);
});

test('Rent Increase Defense — Enforces 90-day statutory notice period under RTA s. 116', () => {
  const result = evaluateRentIncreaseNotice({
    province: 'ON',
    firstOccupiedDate: '2016-01-01',
    currentMonthlyRentCad: 2200,
    proposedMonthlyRentCad: 2255, // exactly 2.5%
    noticeServedDate: '2026-06-01',
    effectiveDate: '2026-08-01', // only 61 days notice
    lastIncreaseDate: '2025-05-01',
    officialFormUsed: 'N1'
  });

  assert.equal(result.noticeCompliance.isNoticePeriodCompliant, false);
  assert.equal(result.validityVerdict, 'STATUTORILY_VOID');
  assert.ok(result.statutoryDefects.some(d => d.defectCode === 'DEFICIENT_NOTICE_PERIOD'));
});

test('Rent Increase Defense — Strictly voids informal text or email rent increase notices', () => {
  const result = evaluateRentIncreaseNotice({
    province: 'ON',
    firstOccupiedDate: '2017-01-01',
    currentMonthlyRentCad: 2000,
    proposedMonthlyRentCad: 2050,
    noticeServedDate: '2026-05-01',
    effectiveDate: '2026-08-15',
    lastIncreaseDate: '2025-05-01',
    officialFormUsed: 'informal_text_email'
  });

  assert.equal(result.noticeCompliance.isFormCompliant, false);
  assert.equal(result.validityVerdict, 'STATUTORILY_VOID');
  assert.ok(result.statutoryDefects.some(d => d.defectCode === 'INVALID_NOTICE_FORM'));
});

test('Rent Increase Defense — Voids premature rent increases under 12-month rule (RTA s. 119)', () => {
  const result = evaluateRentIncreaseNotice({
    province: 'ON',
    firstOccupiedDate: '2015-01-01',
    currentMonthlyRentCad: 2000,
    proposedMonthlyRentCad: 2050,
    noticeServedDate: '2026-05-01',
    effectiveDate: '2026-08-01',
    lastIncreaseDate: '2026-01-01', // only 7 months since last increase
    officialFormUsed: 'N1'
  });

  assert.equal(result.noticeCompliance.is12MonthRuleCompliant, false);
  assert.equal(result.validityVerdict, 'STATUTORILY_VOID');
  assert.ok(result.statutoryDefects.some(d => d.defectCode === 'PREMATURE_12_MONTH_INCREASE'));
});

test('Rent Increase Defense — Flags illegal increase exceeding 2.5% guideline on rent-controlled unit', () => {
  const result = evaluateRentIncreaseNotice({
    province: 'ON',
    firstOccupiedDate: '2016-05-01',
    currentMonthlyRentCad: 2000,
    proposedMonthlyRentCad: 2150, // 7.5% increase without AGI
    noticeServedDate: '2026-05-01',
    effectiveDate: '2026-08-01',
    lastIncreaseDate: '2025-05-01',
    officialFormUsed: 'N1',
    isAgiClaimed: false
  });

  assert.equal(result.validityVerdict, 'ILLEGAL_AMOUNT');
  assert.equal(result.rentCalculations.maxLawfulGuidelineRentCad, 2050);
  assert.equal(result.overpaymentAnalysis.monthlyIllegalPortionCad, 100);
  assert.equal(result.overpaymentAnalysis.annualIllegalPortionCad, 1200);
  assert.ok(result.statutoryDefects.some(d => d.defectCode === 'EXCEEDS_STATUTORY_GUIDELINE'));
});

test('Rent Increase Defense — Highlights RTA s. 126(13) right to pay guideline-only during pending AGI', () => {
  const result = evaluateRentIncreaseNotice({
    province: 'ON',
    firstOccupiedDate: '2014-01-01',
    currentMonthlyRentCad: 2200,
    proposedMonthlyRentCad: 2321, // 5.5% (2.5% guideline + 3.0% AGI)
    noticeServedDate: '2026-05-01',
    effectiveDate: '2026-08-01',
    lastIncreaseDate: '2025-05-01',
    officialFormUsed: 'N1',
    isAgiClaimed: true,
    hasLtbOrderBeenIssued: false,
    unresolvedMaintenanceDefects: true
  });

  assert.equal(result.validityVerdict, 'AGI_UNAPPROVED_PAY_GUIDELINE_ONLY');
  assert.equal(result.rentCalculations.maxLawfulGuidelineRentCad, 2255);
  assert.ok(result.agiAnalysis.tenantStatutoryRight.includes('RTA s. 126(13)'));
  assert.ok(result.agiAnalysis.maintenanceDefenseFinding.includes('CRITICAL DEFENSE'));
  assert.ok(result.officialTenantDisputeNotice.includes('Form L5'));
});

test('Rent Increase Defense — Applies British Columbia universal rent control rules', () => {
  const result = evaluateRentIncreaseNotice({
    province: 'BC',
    firstOccupiedDate: '2023-01-01', // In BC, new buildings ARE rent controlled
    currentMonthlyRentCad: 2500,
    proposedMonthlyRentCad: 2575, // 3.0%
    noticeServedDate: '2026-05-01',
    effectiveDate: '2026-08-01',
    lastIncreaseDate: '2025-05-01',
    officialFormUsed: 'RTB-7'
  });

  assert.equal(result.province, 'BC');
  assert.equal(result.rentControlStatus.isRentControlled, true);
  assert.equal(result.validityVerdict, 'COMPLIANT');
  assert.equal(result.rentCalculations.statutoryGuidelinePercent, 3.0);
});
