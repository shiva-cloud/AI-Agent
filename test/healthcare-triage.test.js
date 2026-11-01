// test/healthcare-triage.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HEALTHCARE_TRIAGE_MAP,
  COMMON_DRUG_EQUIVALENCES,
  triageHealthcareNeed,
  mapDrugGeneric
} from '../src/healthcare-triage.js';

test('HEALTHCARE_TRIAGE_MAP contains all 6 statutory medical destinations', () => {
  const keys = Object.keys(HEALTHCARE_TRIAGE_MAP);
  assert.ok(keys.includes('chronic_rx'));
  assert.ok(keys.includes('mild_illness'));
  assert.ok(keys.includes('moderate_injury'));
  assert.ok(keys.includes('emergency_life'));
  assert.ok(keys.includes('uninsured_primary'));
  assert.ok(keys.includes('family_doctor'));

  for (const k of keys) {
    const item = HEALTHCARE_TRIAGE_MAP[k];
    assert.ok(item.level);
    assert.ok(item.badge);
    assert.ok(item.destination);
    assert.ok(item.desc);
    assert.ok(item.cite);
  }
});

test('triageHealthcareNeed accurately routes life-threatening emergency vs chronic refills', () => {
  // Scenario 1: Life-threatening emergency routes to ER/911
  const emergency = triageHealthcareNeed('emergency_life');
  assert.equal(emergency.badge, 'badge-danger');
  assert.match(emergency.destination, /Emergency Department/);
  assert.match(emergency.cite, /Public Hospitals Act/);

  // Scenario 2: Chronic prescription renewal routes to retail pharmacy
  const chronic = triageHealthcareNeed('chronic_rx');
  assert.equal(chronic.badge, 'badge-compliant');
  assert.match(chronic.destination, /Community Pharmacy/);
  assert.match(chronic.cite, /Pharmacy Act, 1991/);

  // Scenario 3: Uninsured newcomer routes to Community Health Centres
  const uninsured = triageHealthcareNeed('uninsured_primary');
  assert.equal(uninsured.badge, 'badge-compliant');
  assert.match(uninsured.destination, /Community Health Centre/);
  assert.match(uninsured.desc, /\$0 cost/);
});

test('mapDrugGeneric matches international brand names to domestic generic bioequivalents', () => {
  const glucophage = mapDrugGeneric('Glucophage');
  assert.equal(glucophage.found, true);
  assert.equal(glucophage.generic, 'metformin');
  assert.equal(glucophage.isChronic, true);

  const lipitor = mapDrugGeneric('LIPITOR');
  assert.equal(lipitor.found, true);
  assert.equal(lipitor.generic, 'atorvastatin');

  const synthroid = mapDrugGeneric('synthroid');
  assert.equal(synthroid.found, true);
  assert.equal(synthroid.generic, 'levothyroxine');

  const ventolin = mapDrugGeneric('ventolin');
  assert.equal(ventolin.found, true);
  assert.equal(ventolin.generic, 'salbutamol');

  // Unknown drug handling
  const unknown = mapDrugGeneric('FakeDrug123');
  assert.equal(unknown.found, false);
  assert.equal(unknown.generic, null);
});
