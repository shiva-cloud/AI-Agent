import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateCitizenshipRevocationDefense,
  CITIZENSHIP_REVOCATION_NOTICE_RESPONSE_WINDOW_DAYS
} from '../src/federal-citizenship-revocation-defense-navigator.js';

test('Citizenship Revocation - Strong Defense Within 30-Day Window with Children & Statelessness', () => {
  const result = evaluateCitizenshipRevocationDefense({
    noticeOfIntentDate: '2026-10-10',
    currentDate: '2026-10-25',
    allegationType: 'FALSE_REPRESENTATION',
    allegationContext: 'RESIDENCE_CALCULATION',
    yearsAsCanadianCitizen: 9,
    yearsResidingInCanada: 15,
    hasSubstantialTiesToCanada: true,
    hasMinorChildrenAffected: true,
    minorChildrenAreCanadianCitizens: true,
    wouldBeRenderedStateless: true,
    requestedFederalCourtReference: true,
    hasCompellingHAndCGrounds: true
  });

  assert.equal(result.proceduralAudit.isWithinStatutoryThirtyDayWindow, true);
  assert.equal(result.proceduralAudit.daysElapsedSinceNotice, 15);
  assert.equal(result.proceduralAudit.daysRemainingInResponseWindow, 15);
  assert.equal(result.defensibilityStatus, 'STRONG_DEFENSE_CASE');
  assert.ok(result.legalDefenses.some(d => d.defense === 'STATELESSNESS_INTERNATIONAL_PROHIBITION'));
  assert.ok(result.legalDefenses.some(d => d.defense === 'BEST_INTERESTS_OF_AFFECTED_CHILDREN'));
});

test('Citizenship Revocation - Expired 30-Day Window (> 30 days) triggers Default Warning', () => {
  const result = evaluateCitizenshipRevocationDefense({
    noticeOfIntentDate: '2026-09-01',
    currentDate: '2026-10-25',
    yearsAsCanadianCitizen: 3,
    yearsResidingInCanada: 5,
    wouldBeRenderedStateless: false,
    hasMinorChildrenAffected: false
  });

  assert.equal(result.proceduralAudit.isWithinStatutoryThirtyDayWindow, false);
  assert.equal(result.proceduralAudit.daysRemainingInResponseWindow, 0);
  assert.ok(result.riskWarnings.some(w => w.warning === 'DEFAULT_REVOCATION_ORDER_EXPOSURE'));
  assert.ok(result.statutoryFindings.some(f => f.finding === 'STATUTORY_WINDOW_EXPIRED'));
});

test('Citizenship Revocation - Verify Constant', () => {
  assert.equal(CITIZENSHIP_REVOCATION_NOTICE_RESPONSE_WINDOW_DAYS, 30);
});
