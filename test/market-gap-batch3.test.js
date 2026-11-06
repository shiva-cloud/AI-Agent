import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MARKET_GAP_BATCH_3,
  resolveMarketGapBatch3Item,
  searchMarketGapBatch3,
  getMarketGapBatch3Stats
} from '../src/market-gap-batch3-resolver.js';
import { answer } from '../src/engine.js';
import { createApp } from '../src/server.js';
import { openStore } from '../src/store.js';

test('Market Gap Batch 3 statistics and integrity', () => {
  const stats = getMarketGapBatch3Stats();
  assert.equal(stats.totalQuestions, 2000);
  assert.equal(stats.range, '84001 - 86000');
  assert.equal(Object.keys(stats.scenarios).length, 13);
  assert.equal(stats.totalCountries, 78);

  assert.equal(stats.scenarios.new_medical_rule_transitional, 160);
  assert.equal(stats.scenarios.fee_increase_post_payment, 160);
  assert.equal(stats.scenarios.sponsor_lost_licence_pending, 160);
  assert.equal(stats.scenarios.court_overturned_rule_post_refusal, 160);
  assert.equal(stats.scenarios.regional_nomination_withdrawn, 160);
  assert.equal(stats.scenarios.medical_emergency_abroad_pending_tr, 160);
  assert.equal(stats.scenarios.airline_boarding_refusal_digital_status, 160);
  assert.equal(stats.scenarios.residence_card_lost_layover, 160);
  assert.equal(stats.scenarios.passport_expires_multi_country_trip, 160);
  assert.equal(stats.scenarios.visa_sticker_valid_status_cancelled, 160);
  assert.equal(stats.scenarios.dual_national_different_passports, 160);
  assert.equal(stats.scenarios.minor_travelling_one_parent_consent, 160);
  assert.equal(stats.scenarios.transit_airport_rebooking_transit_visa, 80);

  // Verify frozen constant
  assert.equal(MARKET_GAP_BATCH_3.length, 2000);
  assert.ok(Object.isFrozen(MARKET_GAP_BATCH_3));
});

test('Direct numeric and string ID lookups across all 13 scenario blocks', () => {
  const boundaryIds = [
    84001, 84160, // Scenario 1: new_medical_rule_transitional
    84161, 84320, // Scenario 2: fee_increase_post_payment
    84321, 84480, // Scenario 3: sponsor_lost_licence_pending
    84481, 84640, // Scenario 4: court_overturned_rule_post_refusal
    84641, 84800, // Scenario 5: regional_nomination_withdrawn
    84801, 84960, // Scenario 6: medical_emergency_abroad_pending_tr
    84961, 85120, // Scenario 7: airline_boarding_refusal_digital_status
    85121, 85280, // Scenario 8: residence_card_lost_layover
    85281, 85440, // Scenario 9: passport_expires_multi_country_trip
    85441, 85600, // Scenario 10: visa_sticker_valid_status_cancelled
    85601, 85760, // Scenario 11: dual_national_different_passports
    85761, 85920, // Scenario 12: minor_travelling_one_parent_consent
    85921, 86000  // Scenario 13: transit_airport_rebooking_transit_visa
  ];

  for (const id of boundaryIds) {
    const item = resolveMarketGapBatch3Item(id);
    assert.ok(item, `Should resolve ID ${id}`);
    assert.equal(item.id, id);
    assert.ok(item.question.length > 20);
    assert.ok(item.statutoryRule.length > 30);
    assert.ok(item.citation.length > 5);
    assert.ok(item.verdict.length > 10);

    // Also test string format "GMS-MKT-Q84001"
    const byGmsId = resolveMarketGapBatch3Item(`GMS-MKT-Q${id}`);
    assert.ok(byGmsId);
    assert.equal(byGmsId.id, id);
  }

  // Out of range tests
  assert.equal(resolveMarketGapBatch3Item(84000), null);
  assert.equal(resolveMarketGapBatch3Item(86001), null);
  assert.equal(resolveMarketGapBatch3Item('invalid'), null);
});

test('Engine answer() statutory integration across all 13 scenarios with zero evasion', () => {for(const id of [84001,84161,84321,84481,84641,84801,84961,85121,85281,85441,85601,85761,85921]){const item=resolveMarketGapBatch3Item(id);assert.ok(item);const result=answer({question:item.question},[]);assert.equal(result.claims.length,0);assert.equal(result.sources.length,0);assert.equal(result.verification.editorReviewedClaims,0);assert.ok(result.gaps.some(g=>g.reason==='awaiting_human_review'));assert.ok(['unavailable','clarification'].includes(result.status),'no evidence: unsupported places are told so, others are unavailable');}});

test('Search filtering by country, topic, and query pagination in Batch 3', () => {
  const allResults = searchMarketGapBatch3({});
  assert.equal(allResults.total, 2000);
  assert.equal(allResults.items.length, 20); // Default limit

  const canadaResults = searchMarketGapBatch3({ country: 'Canada', limit: 100 });
  assert.ok(canadaResults.total > 0);
  assert.ok(canadaResults.items.every(item => item.country === 'Canada'));

  const filteredTopic = searchMarketGapBatch3({ topic: 'transitional_rules', limit: 50 });
  assert.equal(filteredTopic.total, 800);
  assert.equal(filteredTopic.items.length, 50);

  const searched = searchMarketGapBatch3({ query: 'residence card lost' });
  assert.ok(searched.total >= 160);
  assert.ok(searched.items.length > 0);
});

test('HTTP REST API endpoints for Market Gap Batch 3', async () => {
  const store = openStore(':memory:');
  const app = createApp({ store });
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // 1. Stats endpoint
    const statsRes = await fetch(`${baseUrl}/v1/market-gap/batch3/stats`);
    assert.equal(statsRes.status, 200);
    const stats = await statsRes.json();
    assert.equal(stats.totalQuestions, 2000);
    assert.equal(stats.range, '84001 - 86000');

    // 2. Search endpoint with filtering
    const searchRes = await fetch(`${baseUrl}/v1/market-gap/batch3?topic=travel_status&limit=10`);
    assert.equal(searchRes.status, 200);
    const searchData = await searchRes.json();
    assert.equal(searchData.total, 1200);
    assert.equal(searchData.items.length, 10);

    // 3. Single question by ID
    const singleRes = await fetch(`${baseUrl}/v1/market-gap/batch3/84001`);
    assert.equal(singleRes.status, 200);
    const singleData = await singleRes.json();
    assert.equal(singleData.item.id, 84001);
    assert.equal(singleData.item.scenarioName, 'new_medical_rule_transitional');
    assert.equal(singleData.item.verdict, undefined);
    assert.ok(searchData.items.every(i => i.citation === undefined && i.reviewStatus === 'unreviewed_template'));

    // 4. Single question 404
    const notFoundRes = await fetch(`${baseUrl}/v1/market-gap/batch3/99999`);
    assert.equal(notFoundRes.status, 404);
  } finally {
    server.close();
  }
});
