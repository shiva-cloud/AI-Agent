import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ONTARIO_THA_LICENSING_CONSTANTS,
  auditOntarioThaLicensing
} from '../src/ontario-employment-temp-help-agency-licensing-navigator.js';

test('Ontario THA Licensing - Constants reflect ESA Part XXIV.1 and O. Reg. 289/01', () => {
  assert.equal(ONTARIO_THA_LICENSING_CONSTANTS.ADMIN_PENALTY_FIRST_CONTRAVENTION_CAD, 15000);
  assert.equal(ONTARIO_THA_LICENSING_CONSTANTS.ADMIN_PENALTY_SECOND_CONTRAVENTION_CAD, 25000);
  assert.equal(ONTARIO_THA_LICENSING_CONSTANTS.ADMIN_PENALTY_THIRD_CONTRAVENTION_CAD, 50000);
  assert.equal(ONTARIO_THA_LICENSING_CONSTANTS.IRREVOCABLE_LETTER_OF_CREDIT_AMOUNT_CAD, 25000);
});

test('Ontario THA Licensing - Compliant licensed THA operation', () => {
  const result = auditOntarioThaLicensing({
    entityRole: 'CLIENT_EMPLOYER',
    isAgencyLicensedByMlitst: true,
    didAgencyChargeFeesToWorker: false,
    hasUnpaidWagesOrOvertime: false
  });

  assert.equal(result.complianceStatus, 'COMPLIANT_LICENSED_OPERATION');
  assert.equal(result.isLicensingLawful, true);
  assert.equal(result.penaltyAudit.estimatedAdminPenaltyCad, 0);
  assert.equal(result.statutoryViolations.length, 0);
});

test('Ontario THA Licensing - Client employer engaging unlicensed THA faces $15,000 penalty', () => {
  const result = auditOntarioThaLicensing({
    entityRole: 'CLIENT_EMPLOYER',
    isAgencyLicensedByMlitst: false,
    hasApplicationInProcessWithTransitionStatus: false,
    priorContraventionsInPast3Years: 0
  });

  assert.equal(result.complianceStatus, 'UNLAWFUL_NON_COMPLIANT_THA_OPERATION');
  assert.equal(result.isLicensingLawful, false);
  assert.equal(result.penaltyAudit.estimatedAdminPenaltyCad, 15000);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'CLIENT_ENGAGING_UNLICENSED_THA'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'TERMINATE_OR_VERIFY_THA_CONTRACT'));
});

test('Ontario THA Licensing - Detects illegal placement fee and joint liability for unpaid wages', () => {
  const result = auditOntarioThaLicensing({
    entityRole: 'ASSIGNMENT_WORKER',
    isAgencyLicensedByMlitst: true,
    didAgencyChargeFeesToWorker: true,
    feeAmountChargedToWorkerCad: 500,
    hasUnpaidWagesOrOvertime: true,
    unpaidWagesAmountCad: 1200
  });

  assert.equal(result.complianceStatus, 'UNLAWFUL_NON_COMPLIANT_THA_OPERATION');
  assert.equal(result.penaltyAudit.isJointAndSeveralWageLiabilityApplicable, true);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'ILLEGAL_FEE_CHARGED_TO_ASSIGNMENT_WORKER'));
  assert.ok(result.statutoryViolations.some(v => v.rule === 'UNPAID_ASSIGNMENT_WAGES_JOINT_LIABILITY'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'FILE_ESA_CLAIM_FEE_REPAYMENT'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'ENFORCE_JOINT_LIABILITY_AGAINST_CLIENT'));
});

test('Ontario THA Licensing - Transitional application status is recognized without violation', () => {
  const result = auditOntarioThaLicensing({
    entityRole: 'CLIENT_EMPLOYER',
    isAgencyLicensedByMlitst: false,
    hasApplicationInProcessWithTransitionStatus: true // Applied in time
  });

  assert.equal(result.isLicensingLawful, true);
  assert.equal(result.statutoryViolations.length, 0);
  assert.ok(result.riskWarnings.some(w => w.warningType === 'TRANSITIONAL_STATUS_PENDING'));
});
