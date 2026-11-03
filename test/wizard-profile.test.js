import test from 'node:test';
import assert from 'node:assert/strict';
import {validateWizardProfile} from '../public/app/wizard-plan.js';
const valid = {country: 'Canada', city: 'Toronto', status: 'student', field: 'stem', familySize: '1', children: 'no', arrivalDate: '2028-02-29'};
test('wizard rejects wrong-country cities, forged enums and inconsistent households', () => {
  const cases = [
    ['country', '', 1], ['country', 'constructor', 1], ['country', 'Unknown', 1],
    ['city', 'London', 1], ['status', 'invalid', 2], ['field', '', 2],
    ['familySize', '0', 3], ['familySize', '6', 3], ['familySize', 2, 3],
    ['children', 'unknown', 3], ['children', 'yes', 3],
    ['arrivalDate', '2027-02-29', 4], ['arrivalDate', '', 4]
  ];
  for (const [key, value, step] of cases) assert.equal(validateWizardProfile({...valid, [key]: value}).step, step, `${key}=${value}`);
});
test('wizard validates steps without requiring future inputs and preserves optional city and 5+ category', () => {
  assert.equal(validateWizardProfile(valid), null);
  assert.equal(validateWizardProfile({...valid, city: '', familySize: '5', children: 'yes'}), null);
  assert.equal(validateWizardProfile({...valid, arrivalDate: '', familySize: ''}, 2), null);
  assert.equal(validateWizardProfile({...valid, country: 'United Kingdom', city: 'London'}), null);
});
