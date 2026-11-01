import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateAlbertaOvertimeBanking,
  calculateAlbertaOvertimeHours
} from '../src/alberta-employment-overtime-banking-navigator.js';

test('Alberta Overtime - 8/44 Rule (Daily excess greater than weekly excess)', () => {
  // 4 days of 10 hours = 40 total hours.
  // Daily excess: 4 * (10 - 8) = 8 hours.
  // Weekly total: 40 hours <= 44 hours (weekly excess is 0).
  // Under s. 21, governing OT is 8 hours (the greater).
  const hours = calculateAlbertaOvertimeHours([10, 10, 10, 10]);
  assert.equal(hours.totalHours, 40);
  assert.equal(hours.dailyOvertimeTotal, 8);
  assert.equal(hours.weeklyExcessHours, 0);
  assert.equal(hours.statutoryOvertimeHours, 8);
  assert.equal(hours.regularHours, 32);
});

test('Alberta Overtime - 8/44 Rule (Weekly excess greater than daily excess)', () => {
  // 6 days of 8 hours = 48 total hours.
  // Daily excess: 0 hours (no day exceeds 8).
  // Weekly excess: 48 - 44 = 4 hours.
  // Governing OT: 4 hours.
  const hours = calculateAlbertaOvertimeHours([8, 8, 8, 8, 8, 8]);
  assert.equal(hours.totalHours, 48);
  assert.equal(hours.dailyOvertimeTotal, 0);
  assert.equal(hours.weeklyExcessHours, 4);
  assert.equal(hours.statutoryOvertimeHours, 4);
  assert.equal(hours.regularHours, 44);
});

test('Alberta Overtime Banking - Valid Written Agreement with active bank', () => {
  const result = evaluateAlbertaOvertimeBanking({
    regularHourlyWageCad: 30,
    dailyHoursWorked: [10, 10, 8, 8, 8], // 44 total, 4 daily OT
    hasWrittenOvertimeAgreement: true,
    existingBankedHours: 10,
    monthsElapsedSinceBanked: 2,
    isEmploymentTerminating: false
  });

  assert.equal(result.complianceStatus, 'STATUTORILY_COMPLIANT');
  assert.equal(result.hoursAudit.governingStatutoryOvertimeHours, 4);
  // Banked: 10 existing + 4 new = 14 hours active
  assert.equal(result.bankingAudit.activeBankBalanceHours, 14);
  assert.equal(result.financialLiability.totalStatutoryPayoutOwedCad, 0);
  assert.equal(result.statutoryViolations.length, 0);
});

test('Alberta Overtime Banking - Expired Bank past 6 months and No Written Agreement', () => {
  const result = evaluateAlbertaOvertimeBanking({
    regularHourlyWageCad: 20,
    dailyHoursWorked: [8, 8, 8, 8, 8], // 40 hrs, 0 OT
    hasWrittenOvertimeAgreement: false,
    existingBankedHours: 15,
    monthsElapsedSinceBanked: 7, // > 6 months
    isEmploymentTerminating: false
  });

  assert.equal(result.complianceStatus, 'STATUTORY_DEFICIENCY_DETECTED');
  assert.ok(result.statutoryViolations.some(v => v.violation === 'BANKED_HOURS_EXPIRED_UNPAID'));
  assert.ok(result.statutoryViolations.some(v => v.violation === 'UNLAWFUL_BANKING_WITHOUT_WRITTEN_AGREEMENT'));
  // Payout at 1.5x: 15 hrs * ($20 * 1.5 = $30) = $450
  assert.equal(result.financialLiability.bankedHoursPayoutCad, 450);
  assert.equal(result.financialLiability.totalStatutoryPayoutOwedCad, 450);
});

test('Alberta Overtime Banking - Employment Termination Payout', () => {
  const result = evaluateAlbertaOvertimeBanking({
    regularHourlyWageCad: 40,
    dailyHoursWorked: [8, 8, 8, 8, 8],
    hasWrittenOvertimeAgreement: true,
    existingBankedHours: 20,
    monthsElapsedSinceBanked: 3,
    isEmploymentTerminating: true
  });

  // Termination forces payout at 1.5x: 20 hrs * ($40 * 1.5 = $60) = $1200
  assert.equal(result.financialLiability.bankedHoursPayoutCad, 1200);
  assert.equal(result.financialLiability.totalStatutoryPayoutOwedCad, 1200);
  assert.equal(result.bankingAudit.activeBankBalanceHours, 0);
});
