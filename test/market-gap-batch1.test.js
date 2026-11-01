import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MARKET_GAP_BATCH_1,
  resolveMarketGapBatch1Item,
  searchMarketGapBatch1,
  getMarketGapBatch1Stats
} from '../src/market-gap-batch1-resolver.js';
import { answer } from '../src/engine.js';
import { createApp } from '../src/server.js';
import { openStore } from '../src/store.js';

test('Market Gap Batch 1 statistics and integrity', () => {
  const stats = getMarketGapBatch1Stats();
  assert.equal(stats.totalQuestions, 2000);
  assert.equal(stats.range, '80001 - 82000');
  assert.equal(Object.keys(stats.scenarios).length, 10);
  assert.equal(stats.totalCountries, 78);

  // Each scenario has exactly 200 questions
  for (const [scenario, count] of Object.entries(stats.scenarios)) {
    assert.equal(count, 200, `Scenario ${scenario} should have exactly 200 questions`);
  }

  // Verify frozen constant
  assert.equal(MARKET_GAP_BATCH_1.length, 2000);
  assert.ok(Object.isFrozen(MARKET_GAP_BATCH_1));
});

test('Direct numeric and string ID lookups across all 10 scenario blocks', () => {
  const boundaryIds = [
    80001, 80200, // Scenario 1: portal_zero_documents
    80201, 80400, // Scenario 2: biometrics_pending_status
    80401, 80600, // Scenario 3: mfa_phone_account_lockout
    80601, 80800, // Scenario 4: duplicate_profiles_multiple_emails
    80801, 81000, // Scenario 5: non_latin_characters_rejection
    81001, 81200, // Scenario 6: portal_outage_deadline
    81201, 81400, // Scenario 7: webform_acknowledgment_not_reflected
    81401, 81600, // Scenario 8: duplicate_fee_charge
    81601, 81800, // Scenario 9: address_history_gap
    81801, 82000  // Scenario 10: closed_employer_reference_letter
  ];

  for (const id of boundaryIds) {
    const item = resolveMarketGapBatch1Item(id);
    assert.ok(item, `Should resolve ID ${id}`);
    assert.equal(item.id, id);
    assert.ok(item.question.length > 20);
    assert.ok(item.statutoryRule.length > 30);
    assert.ok(item.citation.length > 5);
    assert.ok(item.verdict.length > 10);

    // Also test string format "GMS-MKT-Q80001"
    const byGmsId = resolveMarketGapBatch1Item(`GMS-MKT-Q${id}`);
    assert.ok(byGmsId);
    assert.equal(byGmsId.id, id);
  }

  // Out of range tests
  assert.equal(resolveMarketGapBatch1Item(80000), null);
  assert.equal(resolveMarketGapBatch1Item(82001), null);
  assert.equal(resolveMarketGapBatch1Item('invalid'), null);
});

test('Engine answer() statutory integration across all 10 scenarios with zero evasion', () => {for(const id of [80001,80201,80401,80601,80801,81001,81201,81401,81601,81801]){const item=resolveMarketGapBatch1Item(id);assert.ok(item);const result=answer({question:item.question},[]);assert.equal(result.claims.length,0);assert.equal(result.sources.length,0);assert.equal(result.verification.editorReviewedClaims,0);assert.ok(result.gaps.some(g=>g.reason==='awaiting_human_review'));assert.equal(result.status,'unavailable');}});

test('Search filtering by country, topic, and query pagination', () => {
  // 1. Search by Country
  const czechiaResults = searchMarketGapBatch1({ country: 'Czechia' });
  assert.ok(czechiaResults.total > 0);
  for (const item of czechiaResults.items) {
    assert.equal(item.country, 'Czechia');
  }

  // 2. Search by Topic
  const portalResults = searchMarketGapBatch1({ topic: 'application_portal' });
  assert.ok(portalResults.total > 0);
  for (const item of portalResults.items) {
    assert.equal(item.topic, 'application_portal');
  }

  // 3. Search by Query string
  const outageResults = searchMarketGapBatch1({ query: 'outage' });
  assert.ok(outageResults.total >= 200);

  // 4. Pagination
  const page1 = searchMarketGapBatch1({ limit: 10, offset: 0 });
  const page2 = searchMarketGapBatch1({ limit: 10, offset: 10 });
  assert.equal(page1.items.length, 10);
  assert.equal(page2.items.length, 10);
  assert.notEqual(page1.items[0].id, page2.items[0].id);
  assert.equal(page2.items[0].id, 80011);
});

test('HTTP REST API endpoints for Market Gap Batch 1', async () => {
  const store = openStore(':memory:');
  const server = createApp(store, 'test-token-at-least-24-chars-long', {});
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;

  try {
    // 1. GET /v1/market-gap/batch1/stats
    const statsRes = await fetch(`http://127.0.0.1:${port}/v1/market-gap/batch1/stats`);
    assert.equal(statsRes.status, 200);
    const stats = await statsRes.json();
    assert.equal(stats.totalQuestions, 2000);
    assert.equal(stats.range, '80001 - 82000');

    // 2. GET /v1/market-gap/batch1 (search)
    const listRes = await fetch(`http://127.0.0.1:${port}/v1/market-gap/batch1?limit=5&country=Czechia`);
    assert.equal(listRes.status, 200);
    const listData = await listRes.json();
    assert.equal(listData.limit, 5);
    assert.ok(listData.items.length <= 5);
    assert.ok(listData.total > 0);

    // 3. GET /v1/market-gap/batch1/:id
    const itemRes = await fetch(`http://127.0.0.1:${port}/v1/market-gap/batch1/80001`);
    assert.equal(itemRes.status, 200);
    const itemData = await itemRes.json();
    assert.equal(itemData.item.id, 80001);
    assert.ok(itemData.item.citation.includes('IRPR'));

    // 4. GET /v1/market-gap/batch1/:id (not found)
    const notFoundRes = await fetch(`http://127.0.0.1:${port}/v1/market-gap/batch1/99999`);
    assert.equal(notFoundRes.status, 404);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});
