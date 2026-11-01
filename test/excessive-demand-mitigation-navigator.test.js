import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  EXCESSIVE_DEMAND_CONSTANTS,
  evaluateExcessiveDemandMitigation
} from '../src/excessive-demand-mitigation-navigator.js';

test('Excessive Demand Navigator — Constants reflect 2026 IRCC 3x per capita benchmarks', () => {
  assert.equal(EXCESSIVE_DEMAND_CONSTANTS.ANNUAL_COST_THRESHOLD_CAD, 26364.0);
  assert.equal(EXCESSIVE_DEMAND_CONSTANTS.FIVE_YEAR_CUMULATIVE_THRESHOLD_CAD, 131820.0);
  assert.equal(EXCESSIVE_DEMAND_CONSTANTS.PFL_RESPONSE_WINDOW_DAYS, 60);
});

test('Excessive Demand Navigator — Confirms statutory exemption for sponsored spouse under IRPA s. 38(2)', () => {
  const result = evaluateExcessiveDemandMitigation({
    immigrationStream: 'spousal_sponsorship',
    estimatedAnnualMedicationCostCad: 50000,
    estimatedAnnualHospitalCostCad: 20000
  });

  assert.equal(result.admissibilityStatus, 'statutorily_exempt');
  assert.match(result.summaryTitle, /Statutorily Exempt from Excessive Demand/);
  assert.ok(result.statutoryNotes.some(n => n.includes('IRPA s. 38(2)')));
});

test('Excessive Demand Navigator — Successfully mitigates high medication costs via private insurance (Sapru)', () => {
  const result = evaluateExcessiveDemandMitigation({
    immigrationStream: 'economic_express_entry',
    diagnosedCondition: 'Rheumatoid Arthritis',
    estimatedAnnualMedicationCostCad: 30000, // Exceeds $26,364 unmitigated
    estimatedAnnualHospitalCostCad: 2000,
    estimatedAnnualSocialServicesCostCad: 1000,
    hasPrivateInsuranceDrugCoverage: true,
    privateInsuranceDrugLimitAnnualCad: 25000, // Reduces net meds to 5000
    liquidFundsAvailableForCareCad: 0
  });

  // Net annual = (30000 - 25000) + 2000 + 1000 = 8000 < 26364
  assert.equal(result.admissibilityStatus, 'admissible_with_mitigation');
  assert.equal(result.costAssessment.netAnnualPublicCostCad, 8000);
  assert.match(result.summaryTitle, /Admissible with Mitigation Plan/);
});

test('Excessive Demand Navigator — Flags hospital costs as unmitigable under Colaco 2007 FCA 282', () => {
  const result = evaluateExcessiveDemandMitigation({
    immigrationStream: 'economic_express_entry',
    diagnosedCondition: 'Severe Renal Failure',
    estimatedAnnualMedicationCostCad: 5000,
    estimatedAnnualHospitalCostCad: 35000, // Exceeds threshold in hospital care alone
    liquidFundsAvailableForCareCad: 500000 // Huge wealth cannot buy out of public hospital care
  });

  assert.equal(result.admissibilityStatus, 'inadmissible_excessive_demand');
  assert.ok(result.riskWarnings.some(w => w.includes('COLACO HOSPITALIZATION PRECLUSION')));
});
