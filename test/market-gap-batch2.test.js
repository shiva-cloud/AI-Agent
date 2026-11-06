import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MARKET_GAP_BATCH_2,
  resolveMarketGapBatch2Item,
  searchMarketGapBatch2,
  getMarketGapBatch2Stats
} from '../src/market-gap-batch2-resolver.js';
import { answer } from '../src/engine.js';
import { createApp } from '../src/server.js';
import { openStore } from '../src/store.js';

test('Market Gap Batch 2 statistics and integrity', () => {
  const stats = getMarketGapBatch2Stats();
  assert.equal(stats.totalQuestions, 2000);
  assert.equal(stats.range, '82001 - 84000');
  assert.equal(Object.keys(stats.scenarios).length, 13);
  assert.equal(stats.totalCountries, 78);

  assert.equal(stats.scenarios.cash_salary_no_payslips, 80);
  assert.equal(stats.scenarios.university_name_changed, 160);
  assert.equal(stats.scenarios.name_spelling_discrepancy, 160);
  assert.equal(stats.scenarios.delayed_marriage_certificate, 160);
  assert.equal(stats.scenarios.police_certificate_conflict_zone, 160);
  assert.equal(stats.scenarios.gift_deposits_multiple_relatives, 160);
  assert.equal(stats.scenarios.translation_date_mistake, 160);
  assert.equal(stats.scenarios.documents_destroyed_in_flood, 160);
  assert.equal(stats.scenarios.salary_threshold_transitional, 160);
  assert.equal(stats.scenarios.occupation_list_transitional, 160);
  assert.equal(stats.scenarios.visa_category_closed_pending, 160);
  assert.equal(stats.scenarios.language_test_expired_processing_delay, 160);
  assert.equal(stats.scenarios.child_aged_out_in_queue, 160);

  // Verify frozen constant
  assert.equal(MARKET_GAP_BATCH_2.length, 2000);
  assert.ok(Object.isFrozen(MARKET_GAP_BATCH_2));
});

test('Direct numeric and string ID lookups across all 13 scenario blocks', () => {
  const boundaryIds = [
    82001, 82080, // Scenario 1: cash_salary_no_payslips
    82081, 82240, // Scenario 2: university_name_changed
    82241, 82400, // Scenario 3: name_spelling_discrepancy
    82401, 82560, // Scenario 4: delayed_marriage_certificate
    82561, 82720, // Scenario 5: police_certificate_conflict_zone
    82721, 82880, // Scenario 6: gift_deposits_multiple_relatives
    82881, 83040, // Scenario 7: translation_date_mistake
    83041, 83200, // Scenario 8: documents_destroyed_in_flood
    83201, 83360, // Scenario 9: salary_threshold_transitional
    83361, 83520, // Scenario 10: occupation_list_transitional
    83521, 83680, // Scenario 11: visa_category_closed_pending
    83681, 83840, // Scenario 12: language_test_expired_processing_delay
    83841, 84000  // Scenario 13: child_aged_out_in_queue
  ];

  for (const id of boundaryIds) {
    const item = resolveMarketGapBatch2Item(id);
    assert.ok(item, `Should resolve ID ${id}`);
    assert.equal(item.id, id);
    assert.ok(item.question.length > 20);
    assert.ok(item.statutoryRule.length > 30);
    assert.ok(item.citation.length > 5);
    assert.ok(item.verdict.length > 10);

    // Also test string format "GMS-MKT-Q82001"
    const byGmsId = resolveMarketGapBatch2Item(`GMS-MKT-Q${id}`);
    assert.ok(byGmsId);
    assert.equal(byGmsId.id, id);
  }

  // Out of range tests
  assert.equal(resolveMarketGapBatch2Item(82000), null);
  assert.equal(resolveMarketGapBatch2Item(84001), null);
  assert.equal(resolveMarketGapBatch2Item('invalid'), null);
});

test('Engine answer() statutory integration across all 13 scenarios with zero evasion', () => {for(const id of [82001,82161,82321,82481,82641,82801,82961,83121,83281,83441,83601,83761,83921]){const item=resolveMarketGapBatch2Item(id);assert.ok(item);const result=answer({question:item.question},[]);assert.equal(result.claims.length,0);assert.equal(result.sources.length,0);assert.equal(result.verification.editorReviewedClaims,0);assert.ok(result.gaps.some(g=>g.reason==='awaiting_human_review'));assert.ok(['unavailable','clarification'].includes(result.status),'no evidence: unsupported places are told so, others are unavailable');}});

test('Search filtering by country, topic, and query pagination in Batch 2', () => {
  // 1. Search by Country
  const spainResults = searchMarketGapBatch2({ country: 'Spain' });
  assert.ok(spainResults.total > 0);
  for (const item of spainResults.items) {
    assert.equal(item.country, 'Spain');
  }

  // 2. Search by Topic
  const transResults = searchMarketGapBatch2({ topic: 'transitional_rules' });
  assert.ok(transResults.total > 0);
  for (const item of transResults.items) {
    assert.equal(item.topic, 'transitional_rules');
  }

  // 3. Search by Query string
  const floodResults = searchMarketGapBatch2({ query: 'flood' });
  assert.ok(floodResults.total >= 160);

  // 4. Pagination
  const page1 = searchMarketGapBatch2({ limit: 10, offset: 0 });
  const page2 = searchMarketGapBatch2({ limit: 10, offset: 10 });
  assert.equal(page1.items.length, 10);
  assert.equal(page2.items.length, 10);
  assert.notEqual(page1.items[0].id, page2.items[0].id);
  assert.equal(page2.items[0].id, 82011);
});

test('HTTP REST API endpoints for Market Gap Batch 2', async () => {
  const store = openStore(':memory:');
  const server = createApp(store, 'test-token-at-least-24-chars-long', {});
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;

  try {
    // 1. GET /v1/market-gap/batch2/stats
    const statsRes = await fetch(`http://127.0.0.1:${port}/v1/market-gap/batch2/stats`);
    assert.equal(statsRes.status, 200);
    const stats = await statsRes.json();
    assert.equal(stats.totalQuestions, 2000);
    assert.equal(stats.range, '82001 - 84000');
    assert.equal(stats.totalCountries, 78);

    // 2. GET /v1/market-gap/batch2 (search)
    const listRes = await fetch(`http://127.0.0.1:${port}/v1/market-gap/batch2?limit=5&topic=transitional_rules`);
    assert.equal(listRes.status, 200);
    const listData = await listRes.json();
    assert.equal(listData.limit, 5);
    assert.ok(listData.items.length <= 5);
    assert.ok(listData.total > 0);

    // 3. GET /v1/market-gap/batch2/:id
    const itemRes = await fetch(`http://127.0.0.1:${port}/v1/market-gap/batch2/82001`);
    assert.equal(itemRes.status, 200);
    const itemData = await itemRes.json();
    assert.equal(itemData.item.id, 82001);
    assert.equal(itemData.item.citation, undefined);
    assert.deepEqual(itemData.item.withheld, ['statutoryRule', 'citation', 'verdict']);
    assert.ok(listData.items.every(i => i.statutoryRule === undefined && i.reviewStatus === 'unreviewed_template'));

    // 4. GET /v1/market-gap/batch2/:id (not found)
    const notFoundRes = await fetch(`http://127.0.0.1:${port}/v1/market-gap/batch2/99999`);
    assert.equal(notFoundRes.status, 404);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});
