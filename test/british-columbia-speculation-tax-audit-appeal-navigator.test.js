// test/british-columbia-speculation-tax-audit-appeal-navigator.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  auditBcSvtNoticeOfObjection,
  BC_SVT_APPEAL_RULES
} from '../src/british-columbia-speculation-tax-audit-appeal-navigator.js';

test('BC SVT Appeal Navigator — Constants match SVT Act Part 9', () => {
  assert.equal(BC_SVT_APPEAL_RULES.OBJECTION_LIMITATION_DAYS, 90);
  assert.equal(BC_SVT_APPEAL_RULES.COURT_APPEAL_LIMITATION_DAYS, 90);
  assert.equal(BC_SVT_APPEAL_RULES.LATE_PENALTY_PERCENTAGE, 10);
  assert.ok(BC_SVT_APPEAL_RULES.ELIGIBLE_OBJECTION_GROUNDS.includes('arm_length_tenancy_occupied'));
});

test('BC SVT Appeal Navigator — Timely objection with valid tenancy proof', () => {
  const result = auditBcSvtNoticeOfObjection({
    assessmentNoticeDate: '2026-10-01',
    currentDate: '2026-10-25', // 24 days elapsed, 66 remaining
    assessedAmountCad: 20000,
    objectionGround: 'arm_length_tenancy_occupied',
    hasTenancyAgreementOrProof: true,
    hasTaxFilingsOrT4ShowingResidence: false,
    isStayOfCollectionRequested: true,
    propertyRollNumber: '01-1234-5678',
    ownerName: 'Wen Liu'
  });

  assert.equal(result.isWithin90Days, true);
  assert.equal(result.daysElapsed, 24);
  assert.equal(result.daysRemaining, 66);
  assert.equal(result.objectionStatus, 'TIMELY');
  assert.equal(result.estimatedLatePenaltyCad, 2000);
  assert.equal(result.deficiencies.length, 0);
  assert.ok(result.requiredEvidence.some(e => e.includes('Residential Tenancy Agreement')));
  assert.ok(result.appealStages.some(s => s.stage.includes('BC Supreme Court Appeal')));
});

test('BC SVT Appeal Navigator — Flags expired 90-day limitation bar', () => {
  const result = auditBcSvtNoticeOfObjection({
    assessmentNoticeDate: '2026-05-01',
    currentDate: '2026-10-31', // ~183 days elapsed
    assessedAmountCad: 35000,
    objectionGround: 'principal_residence_exemption',
    hasTaxFilingsOrT4ShowingResidence: true
  });

  assert.equal(result.isWithin90Days, false);
  assert.equal(result.objectionStatus, 'BARRED_BY_LIMITATION');
  assert.ok(result.deficiencies.some(d => d.severity === 'FATAL_BAR'));
  assert.match(result.summary, /time-barred/);
});

test('BC SVT Appeal Navigator — Flags urgent action when under 15 days remain', () => {
  const result = auditBcSvtNoticeOfObjection({
    assessmentNoticeDate: '2026-08-05',
    currentDate: '2026-10-25', // 81 days elapsed, 9 remaining
    assessedAmountCad: 15000,
    objectionGround: 'principal_residence_exemption',
    hasTaxFilingsOrT4ShowingResidence: false,
    isStayOfCollectionRequested: false
  });

  assert.equal(result.isWithin90Days, true);
  assert.equal(result.objectionStatus, 'CRITICAL_URGENCY');
  assert.ok(result.deficiencies.some(d => d.rule === 'Missing Primary Residence Documentation'));
  assert.ok(result.deficiencies.some(d => d.rule === 'Collection Enforcement Risk'));
});

test('BC SVT Appeal Navigator — Rejects unrecognized objection grounds', () => {
  const result = auditBcSvtNoticeOfObjection({
    assessmentNoticeDate: '2026-10-10',
    currentDate: '2026-10-20',
    assessedAmountCad: 12000,
    objectionGround: 'financial_hardship_unemployed' // Not statutory exemption
  });

  assert.ok(result.deficiencies.some(d => d.rule === 'Unrecognized Statutory Ground'));
});
