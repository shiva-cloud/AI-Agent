import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveMarketGapBatch1Item } from '../src/market-gap-batch1-resolver.js';
import { resolveMarketGapBatch2Item } from '../src/market-gap-batch2-resolver.js';
import { resolveMarketGapBatch3Item } from '../src/market-gap-batch3-resolver.js';
import { answer } from '../src/engine.js';
import { openStore } from '../src/store.js';

const resolvers = [resolveMarketGapBatch1Item, resolveMarketGapBatch2Item, resolveMarketGapBatch3Item];

test('a bare number inside a question never selects a market-gap catalog item', () => {
  for (const n of [80001, 80500, 81200, 82001, 83999, 84500, 85999, 86000]) {
    const question = `My salary is ${n}, how do I rent an apartment in Toronto?`;
    for (const resolve of resolvers) assert.equal(resolve(question), null, question);
  }
});

test('explicit catalog IDs still resolve by number and by prefixed text', () => {
  for (const [resolve, id] of [[resolveMarketGapBatch1Item, 80500], [resolveMarketGapBatch2Item, 83000], [resolveMarketGapBatch3Item, 85000]]) {
    assert.equal(resolve(id)?.id, id);
    assert.equal(resolve(String(id))?.id, id);
    assert.equal(resolve(`Please explain GMS-MKT-Q${id}`)?.id, id);
  }
});

test('salary amounts in the 80,000-86,000 range keep the normal Toronto housing answer', () => {
  const store = openStore(':memory:');
  try {
    const records = store.records();
    const baseline = answer({ question: 'How do I rent an apartment in Toronto?' }, records);
    for (const n of [80100, 80500, 82500, 84500, 86000]) {
      const result = answer({ question: `My salary is ${n}, how do I rent an apartment in Toronto?` }, records);
      assert.notEqual(result.parsed.parserVersion, 'direct-resolver', String(n));
      assert.equal(result.parsed.city, 'Toronto', String(n));
      assert.deepEqual(result.parsed.intents, baseline.parsed.intents, String(n));
      assert.equal(result.status, baseline.status, String(n));
      assert.equal(result.claims.length, baseline.claims.length, String(n));
    }
  } finally {
    store.db.close();
  }
});
