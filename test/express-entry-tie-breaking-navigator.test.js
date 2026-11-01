// test/express-entry-tie-breaking-navigator.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateExpressEntryTieBreak,
  EXPRESS_ENTRY_RULES
} from '../src/express-entry-tie-breaking-navigator.js';

test('Express Entry Tie-Breaker — Constants reflect IRCC Ministerial Instructions', () => {
  assert.equal(EXPRESS_ENTRY_RULES.PROVINCIAL_NOMINATION_BONUS_POINTS, 600);
  assert.equal(EXPRESS_ENTRY_RULES.FRENCH_BILINGUAL_BONUS_POINTS, 50);
  assert.equal(EXPRESS_ENTRY_RULES.CANADIAN_MASTERS_BONUS_POINTS, 30);
  assert.ok(EXPRESS_ENTRY_RULES.CATEGORY_BENCHMARKS.stem);
  assert.ok(EXPRESS_ENTRY_RULES.CATEGORY_BENCHMARKS.french_language);
});

test('Express Entry Tie-Breaker — Candidate wins tie-breaker when profile submitted earlier', () => {
  const result = evaluateExpressEntryTieBreak({
    candidateCrs: 485,
    profileSubmissionUtc: '2026-03-01T12:00:00Z', // Submitted earlier
    simulatedRoundCutoff: 485,
    simulatedTieBreakUtc: '2026-03-15T00:00:00Z',
    candidateName: 'Vikram Patel'
  });

  assert.equal(result.simulatedRound.receivesIta, true);
  assert.equal(result.simulatedRound.tieBreakStatus, 'WON_TIE_BREAKER');
  assert.match(result.summary, /won tie-breaker/);
});

test('Express Entry Tie-Breaker — Candidate loses tie-breaker when profile submitted later', () => {
  const result = evaluateExpressEntryTieBreak({
    candidateCrs: 485,
    profileSubmissionUtc: '2026-03-20T12:00:00Z', // Submitted later
    simulatedRoundCutoff: 485,
    simulatedTieBreakUtc: '2026-03-15T00:00:00Z'
  });

  assert.equal(result.simulatedRound.receivesIta, false);
  assert.equal(result.simulatedRound.tieBreakStatus, 'LOST_TIE_BREAKER');
  assert.match(result.summary, /registered after tie-break timestamp/);
});

test('Express Entry Tie-Breaker — Score exceeding cutoff bypasses tie-breaker entirely', () => {
  const result = evaluateExpressEntryTieBreak({
    candidateCrs: 510,
    profileSubmissionUtc: '2026-05-01T00:00:00Z',
    simulatedRoundCutoff: 490,
    simulatedTieBreakUtc: '2026-04-01T00:00:00Z'
  });

  assert.equal(result.simulatedRound.receivesIta, true);
  assert.equal(result.simulatedRound.tieBreakStatus, 'EXCEEDS_CUTOFF');
});

test('Express Entry Tie-Breaker — Computes age decay and category competitive gap', () => {
  const result = evaluateExpressEntryTieBreak({
    candidateCrs: 450,
    candidateAge: 32,
    targetCategory: 'stem', // typical cutoff ~490
    simulatedRoundCutoff: 490
  });

  assert.equal(result.ageRunway.nextBirthdayPenaltyPoints, 5);
  assert.equal(result.ageRunway.remainingRunwayYearsToAge45, 13);
  assert.equal(result.categoryAudit.isCompetitive, false);
  assert.equal(result.categoryAudit.gapToCutoff, 40);
  assert.ok(result.strategicJumps.some(j => j.strategy.includes('French Language')));
});
