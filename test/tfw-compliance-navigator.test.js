import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  TFW_COMPLIANCE_CONSTANTS,
  TFW_STREAMS,
  evaluateTfwEmployerCompliance,
  generateTfwComplianceDemandLetter
} from '../src/tfw-compliance-navigator.js';

test('TFW Compliance Navigator — Statutory constants match ESDC and IRPR regulations', () => {
  assert.equal(TFW_COMPLIANCE_CONSTANTS.LMIA_GOVERNMENT_FEE_CAD, 1000.0);
  assert.equal(TFW_COMPLIANCE_CONSTANTS.MAX_ANNUAL_EMPLOYER_AMP_CAD, 1000000.0);
  assert.equal(TFW_COMPLIANCE_CONSTANTS.MAX_SINGLE_AMP_CAD, 100000.0);

  assert.ok(TFW_STREAMS.low_wage);
  assert.ok(TFW_STREAMS.agriculture_sawp);
});

test('TFW Compliance Navigator — Audits fully compliant employer with zero violations', () => {
  const result = evaluateTfwEmployerCompliance({
    stream: 'low_wage',
    lmiaStipulatedHourlyWageCad: 20.00,
    actualPaidHourlyWageCad: 20.00,
    weeklyHoursContracted: 40,
    actualWeeklyHoursOffered: 40,
    prohibitedDeductionsChargedCad: 0,
    recruiterFeeChargedCad: 0,
    employerRetainedPassportOrPermit: false,
    weeksWorked: 12
  });

  assert.equal(result.complianceStatus, 'Compliant');
  assert.equal(result.wageAudit.totalWageShortfallCad, 0);
  assert.equal(result.totalFinancialRestitutionDueCad, 0);
  assert.equal(result.vwowpAssessment.eligibleForVwowp, false);
  assert.equal(result.violations.length, 0);
});

test('TFW Compliance Navigator — Detects wage underpayment breach and hours reduction', () => {
  const result = evaluateTfwEmployerCompliance({
    stream: 'low_wage',
    lmiaStipulatedHourlyWageCad: 25.00,
    actualPaidHourlyWageCad: 20.00, // $5/hr underpayment
    weeklyHoursContracted: 40,
    actualWeeklyHoursOffered: 35,
    prohibitedDeductionsChargedCad: 0,
    recruiterFeeChargedCad: 0,
    weeksWorked: 10
  });

  // Expected weekly: 25 * 40 = 1000
  // Actual weekly: 20 * 35 = 700
  // Shortfall = 300 * 10 weeks = 3000
  assert.equal(result.complianceStatus, 'Significant Violations Detected');
  assert.equal(result.wageAudit.hourlyUnderpaymentCad, 5.00);
  assert.equal(result.wageAudit.totalWageShortfallCad, 3000.00);
  assert.equal(result.totalFinancialRestitutionDueCad, 3000.00);
  assert.ok(result.violations.some(v => v.includes('WAGE UNDERPAYMENT BREACH')));
  assert.equal(result.vwowpAssessment.eligibleForVwowp, true);
});

test('TFW Compliance Navigator — Flags prohibited fee recovery and passport confiscation as criminal trafficking indicator', () => {
  const result = evaluateTfwEmployerCompliance({
    stream: 'agriculture_sawp',
    prohibitedDeductionsChargedCad: 1500, // LMIA fee + uniform
    recruiterFeeChargedCad: 4000,
    employerRetainedPassportOrPermit: true,
    unsafeHousingOrOvercharge: true
  });

  assert.equal(result.unlawfulDeductionsAudit.totalIllegalDeductionsCad, 5500);
  assert.ok(result.violations.some(v => v.includes('ILLEGAL FEE RECOVERY')));
  assert.ok(result.violations.some(v => v.includes('CRIMINAL DOCUMENT RETENTION')));
  assert.ok(result.violations.some(v => v.includes('SUBSTANDARD HOUSING')));
  assert.ok(result.employerSanctionExposure.includes('High Risk of Heavy AMPs'));
  assert.equal(result.vwowpAssessment.eligibleForVwowp, true);

  const demandLetter = generateTfwComplianceDemandLetter({
    workerName: 'Mateo Morales',
    employerName: 'Sunrise Orchards Ltd.',
    wageShortfallCad: 1200,
    illegalDeductionsCad: 5500,
    hasPassportRetained: true
  });

  assert.ok(demandLetter.includes('FORMAL DEMAND FOR WAGE RESTITUTION'));
  assert.ok(demandLetter.includes('$6700 CAD'));
  assert.ok(demandLetter.includes('Sunrise Orchards Ltd.'));
  assert.ok(demandLetter.includes('Service Canada / ESDC'));
});
