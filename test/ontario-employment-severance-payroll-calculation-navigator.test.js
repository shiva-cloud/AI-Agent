import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ONTARIO_SEVERANCE_CONSTANTS,
  calculateOntarioStatutorySeverance
} from '../src/ontario-employment-severance-payroll-calculation-navigator.js';

test('Ontario Severance - Constants reflect ESA ss. 64, 65', () => {
  assert.equal(ONTARIO_SEVERANCE_CONSTANTS.MIN_YEARS_SERVICE_FOR_SEVERANCE, 5);
  assert.equal(ONTARIO_SEVERANCE_CONSTANTS.STATUTORY_PAYROLL_THRESHOLD_CAD, 2500000);
  assert.equal(ONTARIO_SEVERANCE_CONSTANTS.MAX_STATUTORY_SEVERANCE_WEEKS, 26);
});

test('Ontario Severance - 6.5 years service at large company entitles 6.5 weeks severance', () => {
  const result = calculateOntarioStatutorySeverance({
    completedYearsOfService: 6,
    additionalCompletedMonthsOfService: 6, // 6.5 weeks
    regularWeeklyWageCad: 1000,
    employerOntarioAnnualPayrollCad: 3000000, // Over $2.5M
    statutorySeveranceAlreadyPaidCad: 0
  });

  assert.equal(result.isEligibleForSeverance, true);
  assert.equal(result.complianceStatus, 'STATUTORY_SEVERANCE_PAY_OWED');
  assert.equal(result.severanceCalculation.cappedSeveranceWeeks, 6.5);
  assert.equal(result.severanceCalculation.totalSeverancePayEntitledCad, 6500);
  assert.equal(result.severanceCalculation.severanceDeficitOwedCad, 6500);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'FAILURE_TO_PAY_STATUTORY_SEVERANCE'));
});

test('Ontario Severance - 30-year veteran is strictly capped at 26 weeks', () => {
  const result = calculateOntarioStatutorySeverance({
    completedYearsOfService: 30,
    additionalCompletedMonthsOfService: 0,
    regularWeeklyWageCad: 1000,
    employerOntarioAnnualPayrollCad: 5000000
  });

  assert.equal(result.isEligibleForSeverance, true);
  assert.equal(result.severanceCalculation.rawSeveranceWeeks, 30);
  assert.equal(result.severanceCalculation.cappedSeveranceWeeks, 26); // Capped at 26!
  assert.equal(result.severanceCalculation.isSubjectTo26WeekCap, true);
  assert.equal(result.severanceCalculation.totalSeverancePayEntitledCad, 26000);
});

test('Ontario Severance - Ineligible if employee has less than 5 years service', () => {
  const result = calculateOntarioStatutorySeverance({
    completedYearsOfService: 4,
    additionalCompletedMonthsOfService: 11, // 4.92 years
    employerOntarioAnnualPayrollCad: 10000000
  });

  assert.equal(result.isEligibleForSeverance, false);
  assert.equal(result.meets5YearTenureRequirement, false);
  assert.equal(result.severanceCalculation.totalSeverancePayEntitledCad, 0);
  assert.ok(result.riskWarnings.some(w => w.warningType === 'TENURE_UNDER_5_YEARS'));
});

test('Ontario Severance - Discontinuance exception qualifies 6-year worker at small payroll firm', () => {
  const result = calculateOntarioStatutorySeverance({
    completedYearsOfService: 6,
    additionalCompletedMonthsOfService: 0,
    regularWeeklyWageCad: 1000,
    employerOntarioAnnualPayrollCad: 500000, // Under $2.5M
    isPermanentDiscontinuanceOfBusiness: true // 50+ discontinuance exception!
  });

  assert.equal(result.isEligibleForSeverance, true);
  assert.equal(result.severanceCalculation.cappedSeveranceWeeks, 6);
  assert.equal(result.severanceCalculation.totalSeverancePayEntitledCad, 6000);
});
