import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BC_RTB_EXPEDITED_CONSTANTS,
  evaluateBcRtbDisputeTrack
} from '../src/british-columbia-residential-tenancy-dispute-resolution-urgency-navigator.js';

test('BC RTB Expedited Track - Constants reflect Act & Rule 10', () => {
  assert.equal(BC_RTB_EXPEDITED_CONSTANTS.EXPEDITED_SCHEDULING_DAYS_MAX, 14);
  assert.equal(BC_RTB_EXPEDITED_CONSTANTS.MANDATORY_EVIDENCE_SERVICE_DAYS, 1);
  assert.ok(BC_RTB_EXPEDITED_CONSTANTS.EXPEDITED_GROUNDS.includes('TENANT_UNLAWFUL_LOCKOUT_ORDER_OF_POSSESSION'));
});

test('BC RTB Expedited Track - Tenant lockout qualifies for expedited hearing in 14 days', () => {
  const result = evaluateBcRtbDisputeTrack({
    disputeCategory: 'TENANT_UNLAWFUL_LOCKOUT_ORDER_OF_POSSESSION',
    locksChangedWithoutOrder: true,
    readyToServeEvidenceWithinOneDay: true
  });

  assert.equal(result.qualifiesForExpeditedTrack, true);
  assert.equal(result.hearingTrack, 'EXPEDITED_HEARING_TRACK');
  assert.equal(result.estimatedWaitDays, 14);
  assert.ok(result.actionableRemedies.some(r => r.action === 'FILE_EXPEDITED_FORM_RTB_51_LOCKOUT'));
});

test('BC RTB Expedited Track - Emergency repairs qualifies under s. 33', () => {
  const result = evaluateBcRtbDisputeTrack({
    disputeCategory: 'EMERGENCY_REPAIRS_VITAL_SERVICES',
    vitalServiceOrStructuralDanger: true
  });

  assert.equal(result.qualifiesForExpeditedTrack, true);
  assert.equal(result.proceduralRoadmap.expeditedGroundIdentified, 'EMERGENCY_REPAIRS_VITAL_SERVICES');
});

test('BC RTB Expedited Track - Pure monetary claim routed to standard queue', () => {
  const result = evaluateBcRtbDisputeTrack({
    disputeCategory: 'MONETARY_COMPENSATION_ONLY',
    isMonetaryClaimOnly: true
  });

  assert.equal(result.qualifiesForExpeditedTrack, false);
  assert.equal(result.hearingTrack, 'STANDARD_DISPUTE_TRACK');
  assert.equal(result.estimatedWaitDays, 120);
  assert.ok(result.riskWarnings.some(w => w.warningType === 'MONETARY_CLAIMS_INELIGIBLE_FOR_EXPEDITED_TRACK'));
});
