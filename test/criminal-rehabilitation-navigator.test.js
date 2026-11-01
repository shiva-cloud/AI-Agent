import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  REHAB_CONSTANTS,
  OFFENSE_EQUIVALENCY_TAXONOMY,
  evaluateCriminalInadmissibilityAndRehab,
  generateRehabilitationActionPlan
} from '../src/criminal-rehabilitation-navigator.js';

test('Criminal Rehabilitation Navigator — Constants reflect IRPA and Bill C-46 standards', () => {
  assert.equal(REHAB_CONSTANTS.DEEMED_REHAB_YEARS_REQUIRED, 10);
  assert.equal(REHAB_CONSTANTS.INDIVIDUAL_REHAB_YEARS_REQUIRED, 5);
  assert.equal(REHAB_CONSTANTS.FEE_NON_SERIOUS_REHAB_CAD, 200.0);
  assert.equal(REHAB_CONSTANTS.FEE_SERIOUS_REHAB_CAD, 1000.0);

  assert.ok(OFFENSE_EQUIVALENCY_TAXONOMY.impaired_driving_dui);
  assert.equal(OFFENSE_EQUIVALENCY_TAXONOMY.impaired_driving_dui.severityCategory, 'serious_criminality_s36_1');
  assert.equal(OFFENSE_EQUIVALENCY_TAXONOMY.impaired_driving_dui.deemedRehabPermitted, false);
});

test('Criminal Rehabilitation Navigator — Reclassifies foreign DUI as Serious Criminality under Bill C-46 barring Deemed Rehab', () => {
  // Even if 12 years have passed, DUI is serious criminality so deemed rehab is barred!
  const result = evaluateCriminalInadmissibilityAndRehab({
    offenseType: 'impaired_driving_dui',
    sentenceCompletionDate: '2012-01-01', // 14+ years ago
    assessmentDate: '2026-10-31'
  });

  assert.equal(result.severityCategory, 'Serious Criminality (IRPA s. 36(1))');
  assert.equal(result.rehabPathways.isDeemedRehabilitated, false);
  assert.equal(result.rehabPathways.isEligibleForIndividualRehabilitation, true);
  assert.equal(result.rehabPathways.governmentRehabFeeCad, 1000.0);
  assert.ok(result.riskWarnings.some(w => w.includes('DEEMED REHABILITATION BARRED')));
});

test('Criminal Rehabilitation Navigator — Qualifies single non-serious theft under $5,000 for Deemed Rehabilitation after 10 years', () => {
  const result = evaluateCriminalInadmissibilityAndRehab({
    offenseType: 'theft_under_5000',
    sentenceCompletionDate: '2015-05-01', // 11+ years ago
    convictionCount: 1,
    assessmentDate: '2026-10-31'
  });

  assert.equal(result.severityCategory, 'Criminality (IRPA s. 36(2))');
  assert.equal(result.rehabPathways.isDeemedRehabilitated, true);
  assert.equal(result.rehabPathways.requiresTrpForEntry, false);
  assert.ok(result.statutoryNotes.some(n => n.includes('DEEMED REHABILITATED')));
});

test('Criminal Rehabilitation Navigator — Mandates TRP when sentence completion is under 5 years', () => {
  const result = evaluateCriminalInadmissibilityAndRehab({
    offenseType: 'assault_simple',
    sentenceCompletionDate: '2024-01-01', // ~2.8 years ago
    assessmentDate: '2026-10-31'
  });

  assert.equal(result.rehabPathways.isDeemedRehabilitated, false);
  assert.equal(result.rehabPathways.isEligibleForIndividualRehabilitation, false);
  assert.equal(result.rehabPathways.requiresTrpForEntry, true);
  assert.ok(result.riskWarnings.some(w => w.includes('TOO EARLY FOR REHABILITATION')));
  assert.ok(result.statutoryNotes.some(n => n.includes('TEMPORARY RESIDENT PERMIT (TRP - IRPA s. 24)')));

  const plan = generateRehabilitationActionPlan({
    applicantName: 'Michael Scott',
    offenseName: 'Theft Under $5,000',
    isDeemedRehabilitated: false,
    isEligibleForIndividualRehab: true,
    feeCad: 200
  });

  assert.ok(plan.includes('CRIMINAL INADMISSIBILITY & REHABILITATION'));
  assert.ok(plan.includes('Michael Scott'));
  assert.ok(plan.includes('$200 CAD fee'));
  assert.ok(plan.includes('Form IMM 1444'));
});
