import test from 'node:test';
import assert from 'node:assert/strict';
import { SUPPORTED_LANGUAGES, UI_LABELS, getLocalizedKit } from '../src/i18n-dictionary.js';

test('SUPPORTED_LANGUAGES exports English, French, Hindi, Punjabi, Chinese, and Spanish', () => {
  const codes = SUPPORTED_LANGUAGES.map(l => l.code);
  assert.deepEqual(codes, ['en', 'fr', 'hi', 'pa', 'zh', 'es']);
});

test('UI_LABELS contains all required emergency keys for every supported language', () => {
  const requiredKeys = [
    'askNorthstar',
    'emergencySOS',
    'tenantWizard',
    'cityComparator',
    'lockoutTitle',
    'healthcareTitle',
    'bankingTitle'
  ];

  for (const lang of ['en', 'fr', 'hi', 'pa', 'zh', 'es']) {
    assert.ok(UI_LABELS[lang], `Missing language dictionary: ${lang}`);
    for (const key of requiredKeys) {
      assert.ok(UI_LABELS[lang][key], `Missing key '${key}' in ${lang}`);
    }
  }
});

test('getLocalizedKit falls back to English for unknown languages', () => {
  const kit = getLocalizedKit('de');
  assert.equal(kit.language, 'en');
  assert.equal(kit.labels.askNorthstar, 'Ask Northstar');

  const hindiKit = getLocalizedKit('hi');
  assert.equal(hindiKit.language, 'hi');
  assert.ok(hindiKit.labels.lockoutTitle.includes('मकान मालिक'));
});
