import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BC_UNIFORM_DEDUCTION_CONSTANTS,
  auditBcEmploymentUniformAndDeductions
} from '../src/british-columbia-employment-uniform-equipment-deduction-navigator.js';

test('BC Uniform Deductions - Constants reflect ESA ss. 21, 25', () => {
  assert.equal(BC_UNIFORM_DEDUCTION_CONSTANTS.SPECIAL_CLOTHING_PROVISION_RULE, 'FREE_OF_CHARGE');
  assert.equal(BC_UNIFORM_DEDUCTION_CONSTANTS.UNLAWFUL_DEDUCTION_RECOVERY_LIMIT_MONTHS, 24);
});

test('BC Uniform Deductions - Fully compliant employer providing and cleaning uniform', () => {
  const result = auditBcEmploymentUniformAndDeductions({
    requiresSpecialClothingOrUniform: true,
    employerProvidedUniformFreeOfCharge: true,
    employerCleansUniformOrPaysAllowance: true
  });

  assert.equal(result.complianceStatus, 'COMPLIANT_NO_UNLAWFUL_DEDUCTIONS');
  assert.equal(result.totalUnlawfulDeductionsCad, 0);
  assert.equal(result.statutoryViolations.length, 0);
});

test('BC Uniform Deductions - Detects unlawful $80 uniform deposit/charge', () => {
  const result = auditBcEmploymentUniformAndDeductions({
    requiresSpecialClothingOrUniform: true,
    employerProvidedUniformFreeOfCharge: false,
    uniformCostOrDepositChargedCad: 80,
    employerCleansUniformOrPaysAllowance: true
  });

  assert.equal(result.complianceStatus, 'UNLAWFUL_WAGE_DEDUCTIONS_OR_UNIFORM_BREACH');
  assert.equal(result.totalUnlawfulDeductionsCad, 80);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'ILLEGAL_UNIFORM_CHARGE_OR_DEPOSIT'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'RECOVER_UNIFORM_COST_OR_DEPOSIT'));
});

test('BC Uniform Deductions - Detects prohibited till shortage & dine-and-dash deductions', () => {
  const result = auditBcEmploymentUniformAndDeductions({
    requiresSpecialClothingOrUniform: false,
    deductedForTillShortage: true,
    tillShortageDeductionCad: 45,
    deductedForCustomerDineAndDash: true,
    dineAndDashDeductionCad: 90
  });

  assert.equal(result.complianceStatus, 'UNLAWFUL_WAGE_DEDUCTIONS_OR_UNIFORM_BREACH');
  assert.equal(result.totalUnlawfulDeductionsCad, 135);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'PROHIBITED_CASH_SHORTAGE_DEDUCTION'));
  assert.ok(result.statutoryViolations.some(v => v.rule === 'PROHIBITED_DINE_AND_DASH_DEDUCTION'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'RECOVER_UNLAWFUL_TILL_DEDUCTIONS'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'RECOVER_DINE_AND_DASH_DEDUCTIONS'));
});

test('BC Uniform Deductions - Detects broken dishes / equipment deduction', () => {
  const result = auditBcEmploymentUniformAndDeductions({
    requiresSpecialClothingOrUniform: false,
    deductedForEquipmentBreakage: true,
    equipmentBreakageDeductionCad: 50
  });

  assert.equal(result.totalUnlawfulDeductionsCad, 50);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'PROHIBITED_BREAKAGE_PROPERTY_DAMAGE_DEDUCTION'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'RECOVER_PROPERTY_DAMAGE_DEDUCTIONS'));
});
test('False strings and inapplicable uniform charges cannot create unlawful totals', () => {
  const result = auditBcEmploymentUniformAndDeductions({
    requiresSpecialClothingOrUniform: 'false',
    uniformCostOrDepositChargedCad: 50,
    deductedForTillShortage: 'false'
  });
  assert.equal(result.totalUnlawfulDeductionsCad, 0);
  assert.deepEqual(result.statutoryViolations, []);
  assert.equal(result.deductionBreakdown.uniformCostOrDepositCad, 0);
  assert.throws(() => auditBcEmploymentUniformAndDeductions({ uniformCostOrDepositChargedCad: 'invalid' }));
});
test('Reported deductions without amounts request records before quantifying recovery', () => {
  const result = auditBcEmploymentUniformAndDeductions({ deductedForTillShortage: true });
  assert.equal(result.recoveryAmountComplete, false);
  assert.deepEqual(result.unquantifiedDeductions, ['till shortage']);
  assert.ok(result.actionableRemedies.every(remedy => !remedy.remedyDescription.includes('$0')));
  assert.ok(result.statutoryViolations.every(violation => !violation.finding.includes('$0')));
});
test('A known sub-dollar deduction retains its amount alongside an unquantified charge', () => {
  const result = auditBcEmploymentUniformAndDeductions({ deductedForTillShortage: true, equipmentBreakageDeductionCad: 0.5 });
  assert.equal(result.totalUnlawfulDeductionsCad, 0.5);
  assert.equal(result.recoveryAmountComplete, false);
  assert.match(result.actionableRemedies.find(r => r.action === 'RECOVER_PROPERTY_DAMAGE_DEDUCTIONS').remedyDescription, /\$0\.5/);
});
