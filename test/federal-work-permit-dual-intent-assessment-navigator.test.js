import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DUAL_INTENT_CONSTANTS,
  evaluateDualIntentCompliance
} from '../src/federal-work-permit-dual-intent-assessment-navigator.js';

test('Dual Intent - Constants reflect IRPA s. 22(2)', () => {
  assert.equal(DUAL_INTENT_CONSTANTS.STATUTORY_AUTHORITY, 'Immigration and Refugee Protection Act, S.C. 2001, c. 27, s. 22(2)');
  assert.equal(DUAL_INTENT_CONSTANTS.STATUTORY_RULE, 'Intention to seek permanent residence does not preclude temporary resident status');
});

test('Dual Intent - Strong low-risk candidate with active Express Entry and strong ties', () => {
  const result = evaluateDualIntentCompliance({
    temporaryApplicationType: 'WORK_PERMIT',
    hasActivePrApplicationOrProfile: true,
    prApplicationStream: 'EXPRESS_ENTRY_CEC',
    demonstratedIntentToRespectStayExpiry: true,
    hasTiesToCountryOfCitizenshipOrResidence: true,
    hasPreviousImmigrationComplianceRecord: true,
    hasSufficientSettlementFunds: true
  });

  assert.equal(result.isDualIntentStatutorilyProtected, true);
  assert.equal(result.riskTier, 'LOW_REFUSAL_RISK');
  assert.equal(result.complianceStatus, 'COMPLIANT_DUAL_INTENT_STRUCTURE');
  assert.equal(result.statutoryViolations.length, 0);
  assert.equal(result.riskWarnings.length, 0);
});

test('Dual Intent - Officer refusing solely on PR intent commits legal error under s. 22(2)', () => {
  const result = evaluateDualIntentCompliance({
    officerRefusalBasedSolelyOnPrIntent: true
  });

  assert.equal(result.complianceStatus, 'UNLAWFUL_REFUSAL_CONTRARY_TO_SECTION_22');
  assert.ok(result.statutoryViolations.some(v => v.rule === 'UNLAWFUL_OFFICER_FETTERING_ON_DUAL_INTENT'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'FILE_FEDERAL_COURT_LEAVE_APPLICATION'));
});

test('Dual Intent - Weak home ties and unstated departure intent elevate to high risk', () => {
  const result = evaluateDualIntentCompliance({
    demonstratedIntentToRespectStayExpiry: false,
    hasTiesToCountryOfCitizenshipOrResidence: false,
    hasPreviousImmigrationComplianceRecord: false
  });

  assert.equal(result.riskTier, 'HIGH_REFUSAL_RISK');
  assert.ok(result.dualIntentRiskScore >= 50);
  assert.ok(result.riskWarnings.some(w => w.warningType === 'UNCLEAR_TEMPORARY_DEPARTURE_UNDERTAKING'));
  assert.ok(result.riskWarnings.some(w => w.warningType === 'WEAK_HOME_COUNTRY_TIES'));
});

test('Dual Intent - Recommends dual intent affidavit and property documentation', () => {
  const result = evaluateDualIntentCompliance({
    demonstratedIntentToRespectStayExpiry: false,
    hasTiesToCountryOfCitizenshipOrResidence: false
  });

  assert.ok(result.actionableRemedies.some(r => r.action === 'INCLUDE_AFFIDAVIT_OF_DUAL_INTENT'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'DOCUMENT_HOME_COUNTRY_ASSETS_AND_FAMILY'));
});
