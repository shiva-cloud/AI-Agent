import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CHILD_WELFARE_CONSTANTS,
  PROTECTION_GROUNDS_TAXONOMY,
  evaluateChildWelfareAndGuardianship
} from '../src/child-welfare-guardianship-navigator.js';

test('Child Welfare Navigator — Constants match Ontario CYFSA & Citizenship Act standards', () => {
  assert.equal(CHILD_WELFARE_CONSTANTS.VYSA_MIN_AGE_YEARS, 16);
  assert.equal(CHILD_WELFARE_CONSTANTS.VYSA_MAX_AGE_YEARS, 17);
  assert.equal(CHILD_WELFARE_CONSTANTS.OCL_LEGAL_REP_AGE_THRESHOLD, 16);
  assert.ok(PROTECTION_GROUNDS_TAXONOMY.abandonment_forced_homelessness);
  assert.ok(PROTECTION_GROUNDS_TAXONOMY.medical_neglect);
});

test('Child Welfare Navigator — Qualifies 16-year-old youth for Ontario VYSA independent support without parental consent', () => {
  const result = evaluateChildWelfareAndGuardianship({
    pathway: 'vysa_youth_services',
    youthAgeYears: 16,
    protectionGrounds: ['abandonment_forced_homelessness']
  });

  assert.equal(result.isVysaEligible, true);
  assert.match(result.summaryTitle, /Eligible for Ontario Voluntary Youth Services Agreement/);
  assert.ok(result.statutoryProtections.some(p => p.includes('INDEPENDENT YOUTH CONSENT')));
  assert.ok(result.statutoryProtections.some(p => p.includes('Office of the Children\'s Lawyer')));
});

test('Child Welfare Navigator — Prioritizes Kinship Care placement over stranger foster care under CYFSA s. 75', () => {
  const result = evaluateChildWelfareAndGuardianship({
    pathway: 'kinship_guardianship',
    hasSafeExtendedFamily: true,
    kinshipRelationship: 'grandparent'
  });

  assert.equal(result.isKinshipPriority, true);
  assert.match(result.summaryTitle, /Kinship Placement Prioritized under CYFSA s\. 75/);
  assert.ok(result.statutoryProtections.some(p => p.includes('STATUTORY KINSHIP PRIORITY')));
});

test('Child Welfare Navigator — Qualifies adopted child of Canadian citizen parent for direct s. 5.1 citizenship grant', () => {
  const result = evaluateChildWelfareAndGuardianship({
    pathway: 'intercountry_adoption',
    isCanadianCitizenParentForAdoption: true,
    adoptionLegallyFinalizedAbroad: true,
    preAdoptionTiesSevered: true,
    isHagueConventionCountry: true
  });

  assert.equal(result.isDirectCitizenshipGrantEligible, true);
  assert.match(result.summaryTitle, /Eligible for Direct Grant of Canadian Citizenship/);
  assert.ok(result.statutoryProtections.some(p => p.includes('Citizenship Act s. 5.1')));
});

test('Child Welfare Navigator — Rejects s. 5.1 direct citizenship for PR parents (must use IRPR Part 8 immigration track)', () => {
  const result = evaluateChildWelfareAndGuardianship({
    pathway: 'intercountry_adoption',
    isCanadianCitizenParentForAdoption: false, // Permanent Resident parent
    adoptionLegallyFinalizedAbroad: true,
    preAdoptionTiesSevered: true
  });

  assert.equal(result.isDirectCitizenshipGrantEligible, false);
  assert.ok(result.riskWarnings.some(w => w.includes('Parent is Permanent Resident, not Canadian Citizen')));
});
