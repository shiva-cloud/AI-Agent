import test from 'node:test';
import assert from 'node:assert/strict';
import { applyFormAliases, validateToolAliasInput, normalizeToolInput } from '../src/tool-input.js';
import { ToolInputError } from '../src/api-errors.js';
import { openStore } from '../src/store.js';
import { createApp } from '../src/server.js';

test('typed aliases and canonical fields reject coercion traps before defaults', () => {
  for (const field of ['funds', 'liquidFundsCad']) {
    for (const value of [null, true, false, [], [2], {}, 'bad', ' ', '0x10', 'Infinity', Infinity, NaN]) {
      assert.throws(() => applyFormAliases('/v1/tools/visitor-visa-financial-ties', { [field]: value }), ToolInputError);
    }
  }
  for (const field of ['property', 'ownsRealEstateProperty', 'refusal', 'hasPreviousVisaRefusal']) {
    for (const value of [null, 0, 1, [], {}, 'yes', 'FALSE', ' ']) {
      assert.throws(() => applyFormAliases('/v1/tools/visitor-visa-financial-ties', { [field]: value }), ToolInputError);
    }
  }
  const input = { funds: '$12,000', income: 0, property: false, refusal: 'false' };
  applyFormAliases('/v1/tools/visitor-visa-financial-ties', normalizeToolInput(input));
  assert.equal(input.liquidFundsCad, 12000);
  assert.equal(input.monthlyIncomeCad, 0);
  assert.equal(input.ownsRealEstateProperty, false);
  assert.equal(input.hasPreviousVisaRefusal, false);
  assert.doesNotThrow(() => validateToolAliasInput('/v1/tools/study-to-pr', { clb: '', teer: '0', foreignYears: '1.5' }));
});

test('GET and POST reject malformed typed aliases across tool families', async () => {
  const store = openStore(':memory:');
  const server = createApp(store, 'alias-validation-test-token-long-enough');
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const root = `http://127.0.0.1:${server.address().port}`;
  const cases = [
    ['study-to-pr', 'foreignExperience', 'maybe'],
    ['visitor-visa-financial-ties', 'funds', 'bad'],
    ['visitor-visa-financial-ties', 'property', 'yes'],
    ['uk-skilled-worker', 'salary', '0x100'],
    ['super-visa-lico', 'insurance', '1'],
    ['esa-wage-theft', 'hours', ' '],
    ['uae-tenancy-dispute', 'notaryServed', 'FALSE'],
    ['global-visa-matrix', 'experience', '1e999']
  ];
  try {
    for (const [tool, field, value] of cases) {
      const path = `${root}/v1/tools/${tool}`;
      for (const response of [
        await fetch(`${path}?${new URLSearchParams({ [field]: value })}`),
        await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ [field]: value }) })
      ]) {
        assert.equal(response.status, 400, `${tool} ${field}`);
        assert.equal((await response.json()).code, 'invalid_field_value');
      }
    }
    // URLSearchParams.get() reads the first value; neither order may hide an invalid duplicate.
    for (const query of ['funds=bad&funds=12000', 'funds=12000&funds=bad']) {
      const response = await fetch(`${root}/v1/tools/visitor-visa-financial-ties?${query}`);
      assert.equal(response.status, 400);
      await response.arrayBuffer();
    }
  } finally {
    await new Promise(resolve => server.close(resolve));
    store.db.close();
  }
});

test('canonical typed fields normalize false, zero and blanks without losing precedence', () => {
  const input = {
    ownsRealEstateProperty: 'false', property: true,
    hasPreviousVisaRefusal: 'false', refusal: true,
    liquidFundsCad: '0', funds: 12000, monthlyIncomeCad: ''
  };
  applyFormAliases('/v1/tools/visitor-visa-financial-ties', input);
  assert.equal(input.ownsRealEstateProperty, false);
  assert.equal(input.hasPreviousVisaRefusal, false);
  assert.equal(input.liquidFundsCad, 0);
  assert.equal(Object.hasOwn(input, 'monthlyIncomeCad'), false);
});

test('list aliases reject nested/non-text entries and canonical CSV uses the same array contract', () => {
  for (const [path, alias, canonical] of [
    ['/v1/tools/gcms-analyzer', 'codes', 'refusalCodes'],
    ['/v1/tools/global-visa-matrix', 'countries', 'preferredCountries']
  ]) {
    for (const key of [alias, canonical]) {
      for (const value of [null, 2, true, {}, [1], [{}], [['CA']], Array(101).fill('CA'), ['x'.repeat(201)]]) {
        assert.throws(() => applyFormAliases(path, { [key]: value }), ToolInputError);
      }
      const input = { [key]: 'CA, US' };
      applyFormAliases(path, input);
      assert.deepEqual(input[canonical], ['CA', 'US']);
    }
  }
});

test('canonical string booleans match native JSON and form GET results', async () => {
  const store = openStore(':memory:');
  const server = createApp(store, 'canonical-parity-test-token-long-enough');
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const root = `http://127.0.0.1:${server.address().port}`;
  const cases = [
    ['visitor-visa-financial-ties',
      { property: 'false', refusal: 'false', leaveLetter: 'false', familyHome: 'false', familyTraveling: 'false', g7Travel: 'false', dualIntent: 'false', funds: '0' },
      { ownsRealEstateProperty: false, hasPreviousVisaRefusal: false, hasApprovedJobLeaveLetter: false, hasImmediateFamilyRemainingHome: false, allImmediateFamilyTravelingTogether: false, hasPriorCompliantTravelG7: false, isDualIntentPrPending: false, liquidFundsCad: 0 }],
    ['study-to-pr', { foreignExperience: 'false', foreignYears: '0' }, { hasPriorForeignExperience: false, yearsForeignExperience: 0 }],
    ['poe-rights', { secondary: 'false', deviceSearch: 'false', refusalRisk: 'false' }, { isInSecondaryInspection: false, hasDigitalDeviceSearchConcern: false, facingRefusalRisk: false }]
  ];
  const result = ({ assumedInputs, assumptionNotice, ...rest }) => rest;
  try {
    for (const [tool, form, canonical] of cases) {
      const path = `${root}/v1/tools/${tool}`;
      const get = await fetch(`${path}?${new URLSearchParams(form)}`);
      assert.equal(get.status, 200);
      const expected = result(await get.json());
      for (const body of [canonical, Object.fromEntries(Object.entries(canonical).map(([k,v]) => [k, String(v)]))]) {
        const response = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        assert.equal(response.status, 200);
        const actual = result(await response.json());
        assert.deepEqual(actual, expected, tool);
        if (tool === 'visitor-visa-financial-ties') {
          assert.ok(!actual.positiveFactors.some(factor => /Property Asset|Employment Anchor|Travel Track Record/.test(factor)));
          assert.ok(!actual.riskFactors.some(factor => /Prior Refusal History|Family Unit Uprooting/.test(factor)));
          assert.equal(actual.financialMetrics.liquidFundsCad, 0);
        }
      }
    }
  } finally {
    await new Promise(resolve => server.close(resolve));
    store.db.close();
  }
});
