import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateVisitorVisaTies } from '../src/visitor-visa-financial-ties-navigator.js';
import { ToolInputError } from '../src/api-errors.js';
import { openStore } from '../src/store.js';
import { createApp } from '../src/server.js';

const ranges = [
  ['plannedStayDays', 'days', 1, 365],
  ['liquidFundsCad', 'funds', 0, 100000000],
  ['yearsAtCurrentJob', 'tenure', 0, 60],
  ['monthlyIncomeCad', 'income', 0, 1000000]
];

test('missing visitor facts never invent a score, positive ties or trip funding', () => {
  const complete = {
    plannedStayDays: 14, liquidFundsCad: 0, yearsAtCurrentJob: 0, monthlyIncomeCad: 0,
    hasApprovedJobLeaveLetter: false, ownsRealEstateProperty: false, hasImmediateFamilyRemainingHome: false,
    allImmediateFamilyTravelingTogether: false, hasPriorCompliantTravelG7: false,
    hasPreviousVisaRefusal: false, isDualIntentPrPending: false
  };
  assert.equal(evaluateVisitorVisaTies(complete).riskTier, 'HIGH_RISK');
  for (const field of Object.keys(complete)) {
    const partial = { ...complete };
    delete partial[field];
    const result = evaluateVisitorVisaTies(partial);
    assert.equal(result.riskTier, 'NOT_DETERMINED', field);
    assert.equal(result.tieScoreOutOf100, null);
    assert.equal(result.approvalProbability, null);
    assert.deepEqual(result.missingInputs, [field]);
    assert.deepEqual(result.positiveFactors, []);
    assert.equal(result.financialMetrics.estimatedCostCad, null);
  }
  assert.equal(evaluateVisitorVisaTies().financialMetrics.liquidFundsCad, null);
});

test('complete visitor scenarios never claim a calibrated approval probability', () => {
  for (const strong of [false, true]) {
    const result = evaluateVisitorVisaTies({
      plannedStayDays: 14, liquidFundsCad: strong ? 15000 : 0, yearsAtCurrentJob: strong ? 4 : 0, monthlyIncomeCad: strong ? 2500 : 0,
      hasApprovedJobLeaveLetter: strong, ownsRealEstateProperty: strong, hasImmediateFamilyRemainingHome: strong,
      allImmediateFamilyTravelingTogether: false, hasPriorCompliantTravelG7: strong,
      hasPreviousVisaRefusal: !strong, isDualIntentPrPending: false
    });
    assert.equal(result.approvalProbability, null);
    assert.equal(result.assessmentBasis, 'UNVALIDATED_HEURISTIC');
    assert.match(result.assessmentNotice, /not a visa approval probability/);
    assert.match(result.assessmentNotice, /not an official minimum/);
  }
});

test('visitor evaluator rejects invalid types and out-of-range numbers instead of clamping', () => {
  for (const [field, , min, max] of ranges) {
    for (const value of [null, true, false, [], [2], {}, '', ' ', 'bad', '0x20', Infinity, NaN, min - 1, max + 1]) {
      assert.throws(() => evaluateVisitorVisaTies({ [field]: value }), ToolInputError, `${field}: ${String(value)}`);
    }
    for (const value of [min, max, String(min), String(max)]) {
      assert.doesNotThrow(() => evaluateVisitorVisaTies({ [field]: value }));
    }
  }
  assert.throws(() => evaluateVisitorVisaTies({ plannedStayDays: 1.5 }), ToolInputError);
  assert.doesNotThrow(() => evaluateVisitorVisaTies({ yearsAtCurrentJob: 1.5 }));
});

test('visitor direct booleans preserve false and dates reject calendar rollover', () => {
  for (const field of ['hasApprovedJobLeaveLetter', 'ownsRealEstateProperty', 'hasImmediateFamilyRemainingHome',
    'allImmediateFamilyTravelingTogether', 'hasPriorCompliantTravelG7', 'hasPreviousVisaRefusal', 'isDualIntentPrPending']) {
    for (const value of [null, 0, 1, [], {}, '', 'yes']) {
      assert.throws(() => evaluateVisitorVisaTies({ [field]: value }), ToolInputError);
    }
    for (const value of [false, true]) {
      assert.deepEqual(evaluateVisitorVisaTies({ [field]: String(value) }), evaluateVisitorVisaTies({ [field]: value }));
    }
  }
  for (const assessmentDate of ['2026-02-29', '2026-04-31', 'bad', null, 20261106]) {
    assert.throws(() => evaluateVisitorVisaTies({ assessmentDate }), ToolInputError);
  }
  assert.equal(evaluateVisitorVisaTies({ assessmentDate: '2028-02-29' }).assessmentDate, '2028-02-29');
});

test('visitor GET, alias POST and canonical POST reject bounds and invalid dates', async () => {
  const store = openStore(':memory:');
  const server = createApp(store, 'visitor-validation-test-token-long-enough');
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}/v1/tools/visitor-visa-financial-ties`;
  try {
    for (const response of [await fetch(url), await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })]) {
      assert.equal(response.status, 200);
      const body = await response.json();
      assert.equal(body.riskTier, 'NOT_DETERMINED');
      assert.equal(body.missingInputs.length, 11);
      assert.equal(body.tieScoreOutOf100, null);
      assert.deepEqual(body.positiveFactors, []);
    }
    const cases = ranges.flatMap(([field, alias, min, max]) => [[field, alias, min - 1], [field, alias, max + 1]]);
    cases.push(['plannedStayDays', 'days', 1.5], ['assessmentDate', 'assessmentDate', '2026-02-30']);
    for (const [field, alias, value] of cases) {
      const responses = [await fetch(`${url}?${new URLSearchParams({ [alias]: String(value) })}`)];
      for (const key of [alias, field]) {
        responses.push(await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ [key]: value }) }));
      }
      for (const response of responses) {
        assert.equal(response.status, 400, `${field}: ${value}`);
        assert.equal((await response.json()).code, 'invalid_field_value');
      }
    }
  } finally {
    await new Promise(resolve => server.close(resolve));
    store.db.close();
  }
});
