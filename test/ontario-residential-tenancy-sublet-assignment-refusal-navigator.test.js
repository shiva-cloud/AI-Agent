import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateOntarioTenancyAssignmentSublet
} from '../src/ontario-residential-tenancy-sublet-assignment-refusal-navigator.js';

test('Ontario Tenancy - General Assignment Request ignored past 7 days triggers 30-day N9 right', () => {
  const result = evaluateOntarioTenancyAssignmentSublet({
    requestType: 'ASSIGNMENT',
    isGeneralRequest: true,
    daysSinceRequestMade: 9,
    landlordResponse: 'NO_RESPONSE',
    outOfPocketFeeChargedCad: 0,
    actualDirectExpenseIncurredCad: 0
  });

  assert.equal(result.legalVerdict, 'ELIGIBLE_FOR_IMMEDIATE_30_DAY_N9_TERMINATION');
  assert.equal(result.rightsAssessment.is7DayDeadlineBreached, true);
  assert.equal(result.rightsAssessment.canTenantGive30DayN9, true);
  assert.ok(result.statutoryFindings.some(f => f.finding === 'STATUTORY_SEVEN_DAY_BREACH'));
  assert.ok(result.actionableRemedies.some(r => r.includes('Form N9')));
});

test('Ontario Tenancy - General Assignment Explicit Refusal allows 30-day N9', () => {
  const result = evaluateOntarioTenancyAssignmentSublet({
    requestType: 'ASSIGNMENT',
    isGeneralRequest: true,
    daysSinceRequestMade: 2,
    landlordResponse: 'REFUSED_GENERALLY'
  });

  assert.equal(result.legalVerdict, 'ELIGIBLE_FOR_IMMEDIATE_30_DAY_N9_TERMINATION');
  assert.equal(result.rightsAssessment.canTenantGive30DayN9, true);
  assert.ok(result.statutoryFindings.some(f => f.finding === 'GENERAL_ASSIGNMENT_REFUSAL'));
});

test('Ontario Tenancy - Arbitrary Refusal of Specific Assignee & Illegal Fee of $500', () => {
  const result = evaluateOntarioTenancyAssignmentSublet({
    requestType: 'ASSIGNMENT',
    isGeneralRequest: false,
    daysSinceRequestMade: 4,
    landlordResponse: 'REFUSED_SPECIFICALLY',
    refusalReason: 'Blanket policy: no students or pets',
    outOfPocketFeeChargedCad: 500,
    actualDirectExpenseIncurredCad: 35 // e.g. Equifax credit report
  });

  assert.equal(result.rightsAssessment.canTenantGive30DayN9, true);
  assert.equal(result.rightsAssessment.isArbitraryOrUnreasonableRefusal, true);
  assert.equal(result.rightsAssessment.hasIllegalAdministrativeCharge, true);
  assert.equal(result.rightsAssessment.illegalChargeAmountCad, 465);
  assert.ok(result.statutoryFindings.some(f => f.finding === 'ILLEGAL_ADMINISTRATIVE_FEE'));
  assert.ok(result.actionableRemedies.some(r => r.includes('Form T1')));
  assert.ok(result.actionableRemedies.some(r => r.includes('Form A2')));
});

test('Ontario Tenancy - Sublet Unreasonable Refusal requires Form A2 Board Application', () => {
  const result = evaluateOntarioTenancyAssignmentSublet({
    requestType: 'SUBLET',
    daysSinceRequestMade: 10,
    landlordResponse: 'REFUSED_SPECIFICALLY',
    refusalReason: 'Arbitrary landlord preference'
  });

  assert.equal(result.legalVerdict, 'ACTIONABLE_LTB_FORM_A2_UNREASONABLE_REFUSAL');
  assert.equal(result.rightsAssessment.isArbitraryOrUnreasonableRefusal, true);
  assert.ok(result.riskWarnings.some(w => w.warning === 'SUBLET_N9_LIMITATION'));
  assert.ok(result.actionableRemedies.some(r => r.includes('Form A2')));
});

test('Ontario Tenancy - Landlord Consents within 7 days', () => {
  const result = evaluateOntarioTenancyAssignmentSublet({
    requestType: 'ASSIGNMENT',
    isGeneralRequest: true,
    daysSinceRequestMade: 3,
    landlordResponse: 'CONSENTED'
  });

  assert.equal(result.legalVerdict, 'CONSENT_GRANTED');
  assert.equal(result.rightsAssessment.canTenantGive30DayN9, false);
  assert.equal(result.rightsAssessment.is7DayDeadlineBreached, false);
});
