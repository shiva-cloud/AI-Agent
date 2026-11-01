// test/schooling-catchment.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ISPA_MANDATORY_VACCINES,
  calculateSchoolPlacement,
  auditIspaCompliance
} from '../src/schooling-catchment.js';

test('ISPA_MANDATORY_VACCINES defines all 4 mandatory Ontario school vaccines', () => {
  assert.equal(ISPA_MANDATORY_VACCINES.length, 4);
  const ids = ISPA_MANDATORY_VACCINES.map(v => v.id);
  assert.ok(ids.includes('dtp'));
  assert.ok(ids.includes('mmr'));
  assert.ok(ids.includes('meningococcal'));
  assert.ok(ids.includes('varicella'));
});

test('calculateSchoolPlacement correctly maps calendar birth years to JK, SK, and Grades', () => {
  // Scenario 1: Born in 2022 (turning 4 in 2026) -> Junior Kindergarten (JK)
  const jk = calculateSchoolPlacement({ birthYear: 2022, currentYear: 2026, status: 'work_permit' });
  assert.equal(jk.age, 4);
  assert.equal(jk.grade, 'Junior Kindergarten (JK)');
  assert.equal(jk.tuitionExempt, true);
  assert.match(jk.statutoryTuitionRight, /Education Act Section 49\.2/);

  // Scenario 2: Born in 2021 (turning 5 in 2026) -> Senior Kindergarten (SK)
  const sk = calculateSchoolPlacement({ birthYear: 2021, currentYear: 2026, status: 'pr' });
  assert.equal(sk.age, 5);
  assert.equal(sk.grade, 'Senior Kindergarten (SK)');
  assert.equal(sk.tuitionExempt, true);

  // Scenario 3: Born in 2016 (turning 10 in 2026) -> Grade 5
  const g5 = calculateSchoolPlacement({ birthYear: 2016, currentYear: 2026, status: 'study_permit', lang: 'non_english' });
  assert.equal(g5.age, 10);
  assert.equal(g5.grade, 'Grade 5');
  assert.equal(g5.eslAssessmentRequired, true);
  assert.match(g5.eslGuidance, /STEP/);

  // Scenario 4: Visitor without permit or PR application -> Not tuition exempt
  const visitor = calculateSchoolPlacement({ birthYear: 2016, currentYear: 2026, status: 'tourist' });
  assert.equal(visitor.tuitionExempt, false);
  assert.match(visitor.statutoryTuitionRight, /international student tuition fees/);
});

test('auditIspaCompliance detects compliant vs missing vaccines and outlines exemption rules', () => {
  // Full compliance
  const full = auditIspaCompliance({ completedVaccines: ['dtp', 'mmr', 'meningococcal', 'varicella'] });
  assert.equal(full.isCompliant, true);
  assert.equal(full.missingCount, 0);
  assert.match(full.suspensionRisk, /Zero school suspension risk/);

  // Missing varicella and meningococcal
  const partial = auditIspaCompliance({ completedVaccines: ['dtp', 'mmr'] });
  assert.equal(partial.isCompliant, false);
  assert.equal(partial.missingCount, 2);
  assert.ok(partial.missingVaccines.some(v => v.id === 'meningococcal'));
  assert.ok(partial.missingVaccines.some(v => v.id === 'varicella'));
  assert.match(partial.suspensionRisk, /High Suspension Risk/);
  assert.match(partial.exemptionPathways.conscienceOrReligious, /Commissioner of Oaths/);
});
