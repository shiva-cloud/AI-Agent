import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BC_STRATA_STR_CONSTANTS,
  auditBcStrataShortTermRental
} from '../src/british-columbia-strata-short-term-rental-bylaw-navigator.js';

test('BC Strata STR - Constants reflect Strata Property Act & STRAA', () => {
  assert.equal(BC_STRATA_STR_CONSTANTS.MAX_DAILY_FINE_STR_BYLAW_VIOLATION_CAD, 1000);
  assert.equal(BC_STRATA_STR_CONSTANTS.PROVINCIAL_STR_DAYS_THRESHOLD, 90);
  assert.equal(BC_STRATA_STR_CONSTANTS.MIN_COMMUNITY_POPULATION_PRINCIPAL_RESIDENCE_RULE, 10000);
});

test('BC Strata STR - Enforceable $1,000/day fine with full section 135 procedural compliance', () => {
  const result = auditBcStrataShortTermRental({
    hasRegisteredStrBylawProhibition: true,
    isPrincipalResidence: true,
    rentalStayDays: 4, // STR under 90 days
    fineAmountPerDayCad: 1000,
    totalDaysFined: 3,
    receivedWrittenNoticeOfComplaint: true,
    providedOpportunityToBeHeard: true
  });

  assert.equal(result.complianceStatus, 'UNLAWFUL_SHORT_TERM_RENTAL_ACTIVE');
  assert.equal(result.areFinesLegallyEnforceable, true);
  assert.equal(result.totalAssessedFinesCad, 3000);
  assert.equal(result.fineAudit.fineDefects.length, 0);
  assert.ok(result.statutoryViolations.some(v => v.rule === 'STRATA_STR_BYLAW_CONTRAVENTION'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'CANCEL_OR_CEASE_STR_LISTINGS'));
});

test('BC Strata STR - Detects procedural defect under SPA s. 135 (no written complaint notice)', () => {
  const result = auditBcStrataShortTermRental({
    hasRegisteredStrBylawProhibition: true,
    rentalStayDays: 5,
    fineAmountPerDayCad: 500,
    totalDaysFined: 2,
    receivedWrittenNoticeOfComplaint: false, // Breach of s. 135(1)(a)!
    providedOpportunityToBeHeard: false
  });

  assert.equal(result.complianceStatus, 'STRATA_FINES_DEFECTIVE_PROCEDURAL_BREACH');
  assert.equal(result.areFinesLegallyEnforceable, false);
  assert.ok(result.fineAudit.fineDefects.some(d => d.defectType === 'NO_WRITTEN_NOTICE_OF_COMPLAINT'));
  assert.ok(result.fineAudit.fineDefects.some(d => d.defectType === 'DENIAL_OF_OPPORTUNITY_TO_BE_HEARD'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'FILE_CRT_DISPUTE_UNLAWFUL_FINES'));
});

test('BC Strata STR - Detects daily fine exceeding $1,000 statutory limit', () => {
  const result = auditBcStrataShortTermRental({
    hasRegisteredStrBylawProhibition: true,
    rentalStayDays: 3,
    fineAmountPerDayCad: 1500, // Exceeds $1,000 cap!
    totalDaysFined: 1,
    receivedWrittenNoticeOfComplaint: true,
    providedOpportunityToBeHeard: true
  });

  assert.equal(result.areFinesLegallyEnforceable, false);
  assert.ok(result.fineAudit.fineDefects.some(d => d.defectType === 'EXCESSIVE_FINE_ABOVE_STATUTORY_CEILING'));
});

test('BC Strata STR - Provincial STRAA breach in non-principal residence (investor condo)', () => {
  const result = auditBcStrataShortTermRental({
    hasRegisteredStrBylawProhibition: false, // Strata has no bylaw
    isPrincipalResidence: false, // Investor unit!
    communityPopulation: 700000, // Vancouver
    rentalStayDays: 7
  });

  assert.ok(result.statutoryViolations.some(v => v.rule === 'PROVINCIAL_STRAA_PRINCIPAL_RESIDENCE_BREACH'));
  assert.ok(result.actionableRemedies.some(r => r.action === 'CEASE_NON_PRINCIPAL_RESIDENCE_STR'));
});
