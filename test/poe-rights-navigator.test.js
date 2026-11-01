import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluatePortOfEntryRights, BORDER_AUTHORITIES } from '../src/poe-rights-navigator.js';

test('POE Rights Navigator — Input validation', () => {
  assert.throws(() => evaluatePortOfEntryRights(null), /must be a valid object/);
  const defaultRes = evaluatePortOfEntryRights();
  assert.equal(defaultRes.country, 'CA');
  assert.ok(defaultRes.authority.includes('CBSA'));
});

test('POE Rights Navigator — Canada CBSA digital search and voluntary withdrawal rights', () => {
  const res = evaluatePortOfEntryRights({
    country: 'CA',
    statusCategory: 'study_permit',
    isInSecondaryInspection: true,
    hasDigitalDeviceSearchConcern: true,
    facingRefusalRisk: true
  });

  assert.equal(res.country, 'CA');
  assert.equal(res.secondaryInspectionActive, true);
  assert.ok(res.governingStatute.includes('Customs Act'));
  assert.ok(res.criticalWarnings.some(w => w.includes('Airplane Mode') && w.includes('Cloud Storage')));
  assert.ok(res.criticalWarnings.some(w => w.includes('VOLUNTARY WITHDRAWAL') && w.includes('Allowed to Leave Canada')));
  assert.ok(res.emergencyAssistance.hotline.includes('Legal Aid Ontario'));
});

test('POE Rights Navigator — US CBP Expedited Removal defense and voluntary departure', () => {
  const usRes = evaluatePortOfEntryRights({
    country: 'US',
    statusCategory: 'work_permit',
    hasDigitalDeviceSearchConcern: true,
    facingRefusalRisk: true
  });

  assert.equal(usRes.country, 'US');
  assert.ok(usRes.authority.includes('CBP'));
  assert.ok(usRes.criticalWarnings.some(w => w.includes('Withdrawal of Application for Admission') || w.includes('VOLUNTARY WITHDRAWAL')));
  assert.ok(usRes.criticalWarnings.some(w => w.includes('Expedited Removal')));
});

test('POE Rights Navigator — UK Border Force and Australia ABF support', () => {
  const ukRes = evaluatePortOfEntryRights({ country: 'UK' });
  assert.ok(ukRes.authority.includes('UK Border Force'));

  const auRes = evaluatePortOfEntryRights({ country: 'AU' });
  assert.ok(auRes.authority.includes('Australian Border Force'));
});
