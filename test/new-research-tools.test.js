import test from 'node:test';
import assert from 'node:assert/strict';
import { convertLanguageScores } from '../src/language-score-clb.js';
import { evaluateProofOfFunds, requiredSettlementFunds } from '../src/proof-of-funds.js';
import { createApp } from '../src/server.js';
import { openStore } from '../src/store.js';

test('IELTS General converts per skill and overall is the lowest skill', () => {
  const r = convertLanguageScores({ test: 'ielts_general', reading: 7, writing: 7, listening: 8, speaking: 6.5 });
  assert.deepEqual(Object.values(r.perSkill).map(s => s.level), [9, 9, 9, 8]);
  assert.equal(r.overallLevel, 8);
  assert.equal(r.milestones.expressEntryMinimumClb7, true);
  assert.equal(convertLanguageScores({ test: 'ielts_general', reading: 3, writing: 7, listening: 8, speaking: 7 }).overallLabel, 'below CLB 4');
});

test('CELPIP maps directly; PTE Core, TCF and TEF use their charts', () => {
  assert.equal(convertLanguageScores({ test: 'celpip_general', reading: 9, writing: 10, listening: 11, speaking: 9 }).overallLevel, 9);
  assert.equal(convertLanguageScores({ test: 'pte_core', reading: 88, writing: 90, listening: 89, speaking: 89 }).overallLevel, 10);
  assert.equal(convertLanguageScores({ test: 'pte_core', reading: 60, writing: 69, listening: 60, speaking: 68 }).overallLevel, 7);
  const tcf = convertLanguageScores({ test: 'tcf_canada', reading: 499, writing: 12, listening: 503, speaking: 12 });
  assert.equal(tcf.overallLabel, 'NCLC 8');
  assert.equal(tcf.milestones.bilingualBonusFrenchNclc7, true);
  assert.equal(convertLanguageScores({ test: 'tef_canada', reading: 434, writing: 428, listening: 434, speaking: 456 }).overallLevel, 7);
});

test('tests IRCC does not accept are explained, and bad scores are rejected', () => {
  assert.match(convertLanguageScores({ test: 'ielts_academic' }).message, /not accepted/);
  assert.match(convertLanguageScores({ test: 'pte_academic' }).message, /PTE Core/);
  assert.equal(convertLanguageScores({ test: 'ielts_general', reading: 'x', writing: 7, listening: 7, speaking: 7 }).accepted, false);
});

test('proof of funds uses the July 2025 table and exemptions', () => {
  assert.equal(requiredSettlementFunds(1), 15263);
  assert.equal(requiredSettlementFunds(4), 28362);
  assert.equal(requiredSettlementFunds(9), 40392 + 2 * 4112);
  const short = evaluateProofOfFunds({ program: 'fsw', familySize: 3, availableFundsCad: 20000 });
  assert.equal(short.meetsRequirement, false);
  assert.equal(short.shortfallCad, 3360);
  assert.equal(evaluateProofOfFunds({ program: 'cec', familySize: 3, availableFundsCad: 0 }).exempt, true);
  assert.equal(evaluateProofOfFunds({ program: 'fsw', familySize: 1, hasValidJobOfferAndWorkAuthorization: 'true' }).exempt, true);
  assert.match(evaluateProofOfFunds({ familySize: 1, availableFundsCad: 15300 }).verdict, /little margin/);
});

test('both tools answer over GET and POST', async () => {
  const server = createApp(openStore(':memory:'), 'research-tools-token-24-chars', {});
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const get = await (await fetch(`${base}/v1/tools/language-score-clb?test=celpip_general&reading=7&writing=7&listening=7&speaking=7`)).json();
    assert.equal(get.overallLevel, 7);
    const post = await (await fetch(`${base}/v1/tools/proof-of-funds`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ familySize: 2, availableFundsCad: 25000 }) })).json();
    assert.equal(post.requiredCad, 19001);
    assert.equal(post.meetsRequirement, true);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
