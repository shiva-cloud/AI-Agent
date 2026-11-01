import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateAlbertaTenancySubleaseAssignment,
  ALBERTA_LANDLORD_RESPONSE_WINDOW_DAYS,
  REASONABLE_REFUSAL_GROUNDS
} from '../src/alberta-residential-tenancy-sublease-assignment-navigator.js';

test('Alberta Tenancy Sublease - 14-day silence triggers Deemed Consent under s. 22(4)', () => {
  const result = evaluateAlbertaTenancySubleaseAssignment({
    transactionType: 'SUBLEASE',
    requestDeliveredDate: '2026-10-01',
    currentDate: '2026-10-18', // 17 days elapsed (> 14)
    landlordResponseStatus: 'NO_RESPONSE'
  });

  assert.equal(result.legalVerdict, 'DEEMED_STATUTORY_CONSENT_ESTABLISHED');
  assert.equal(result.rightsAssessment.isStatutorilyDeemedConsented, true);
  assert.equal(result.rightsAssessment.is14DayDeadlinePassed, true);
  assert.ok(result.statutoryFindings.some(f => f.finding === 'STATUTORILY_DEEMED_CONSENT'));
});

test('Alberta Tenancy Assignment - Unreasonable refusal & Illegal $250 Consent Fee', () => {
  const result = evaluateAlbertaTenancySubleaseAssignment({
    transactionType: 'ASSIGNMENT',
    requestDeliveredDate: '2026-10-01',
    currentDate: '2026-10-08',
    landlordResponseStatus: 'REFUSED_WITH_REASONS',
    refusalReasonCategory: 'ARBITRARY_PREFERENCE',
    refusalReasonExplanation: 'Landlord does not want students',
    feeChargedForConsentCad: 250
  });

  assert.equal(result.legalVerdict, 'ACTIONABLE_UNREASONABLE_REFUSAL_RTDRS');
  assert.equal(result.rightsAssessment.isUnreasonableRefusal, true);
  assert.equal(result.rightsAssessment.hasIllegalConsentFee, true);
  assert.equal(result.rightsAssessment.unlawfulFeeAmountCad, 250);
  assert.ok(result.statutoryViolations.some(v => v.violation === 'PROHIBITED_CONSENT_FEE_SURCHARGE'));
  assert.ok(result.statutoryViolations.some(v => v.violation === 'ARBITRARY_OR_UNREASONABLE_REFUSAL'));
  assert.ok(result.actionableRemedies.some(r => r.includes('RTDRS')));
});

test('Alberta Tenancy Assignment - Commercially Reasonable Refusal (Poor Credit)', () => {
  const result = evaluateAlbertaTenancySubleaseAssignment({
    transactionType: 'ASSIGNMENT',
    requestDeliveredDate: '2026-10-01',
    currentDate: '2026-10-06',
    landlordResponseStatus: 'REFUSED_WITH_REASONS',
    refusalReasonCategory: 'INSUFFICIENT_FINANCIAL_ABILITY_OR_POOR_CREDIT',
    feeChargedForConsentCad: 0
  });

  assert.equal(result.rightsAssessment.isUnreasonableRefusal, false);
  assert.ok(result.statutoryFindings.some(f => f.finding === 'COMMERCIALLY_REASONABLE_REFUSAL'));
});

test('Alberta Tenancy - Pending within 14-day statutory window', () => {
  const result = evaluateAlbertaTenancySubleaseAssignment({
    transactionType: 'SUBLEASE',
    requestDeliveredDate: '2026-10-10',
    currentDate: '2026-10-15', // 5 days elapsed
    landlordResponseStatus: 'NO_RESPONSE'
  });

  assert.equal(result.legalVerdict, 'IN_PROGRESS_AWAITING_REPLY');
  assert.equal(result.rightsAssessment.is14DayDeadlinePassed, false);
  assert.equal(result.rightsAssessment.daysRemainingInWindow, 9);
});

test('Alberta Tenancy - Verify Constants', () => {
  assert.equal(ALBERTA_LANDLORD_RESPONSE_WINDOW_DAYS, 14);
  assert.ok(REASONABLE_REFUSAL_GROUNDS.includes('INSUFFICIENT_FINANCIAL_ABILITY_OR_POOR_CREDIT'));
});
