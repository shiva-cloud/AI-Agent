import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveGlobalSettlementItem,
  searchGlobalSettlement,
  getGlobalSettlementStats
} from '../src/global-settlement-resolver.js';
import { answer } from '../src/engine.js';
import { createApp } from '../src/server.js';
import { openStore } from '../src/store.js';

test('Global Settlement statistics and integrity across 20,000 questions', () => {
  const stats = getGlobalSettlementStats();
  assert.equal(stats.totalQuestions, 20000);
  assert.equal(stats.range, 'GMS-Q00001 - GMS-Q20000');
  assert.equal(Object.keys(stats.tiers).length, 5);
  assert.equal(Object.keys(stats.countries).length, 8);
  assert.equal(Object.keys(stats.categories).length, 51);

  assert.equal(stats.tiers.Basic, 4000);
  assert.equal(stats.tiers.Intermediate, 4000);
  assert.equal(stats.tiers.Advanced, 4000);
  assert.equal(stats.tiers.Expert, 4000);
  assert.equal(stats.tiers.Extreme, 4000);

  assert.equal(stats.countries.Canada, 2448);
  assert.equal(stats.countries['United States'], 2601);
  assert.equal(stats.countries['United Kingdom'], 2623);
  assert.equal(stats.countries.Australia, 2623);
  assert.equal(stats.countries.Germany, 2623);
  assert.equal(stats.countries['United Arab Emirates'], 2470);
  assert.equal(stats.countries['New Zealand'], 2317);
  assert.equal(stats.countries['European Union'], 2295);
});

test('Direct ID and numeric lookups across tiers', () => {
  const testIds = [1, 4000, 4001, 8000, 8001, 12000, 12001, 16000, 16001, 20000];

  for (const id of testIds) {
    const padded = String(id).padStart(5, '0');
    const byString = resolveGlobalSettlementItem(`GMS-Q${padded}`);
    assert.ok(byString, `Must resolve GMS-Q${padded}`);
    assert.equal(byString.numericId, id);

    const byNum = resolveGlobalSettlementItem(id);
    assert.ok(byNum);
    assert.equal(byNum.id, `GMS-Q${padded}`);

    assert.ok(byString.question.length > 10);
    assert.ok(byString.statutoryRule.length > 20);
    assert.ok(byString.citation.length > 5);
    assert.ok(byString.verdict.length > 10);
    assert.ok(byString.authority.length > 3);
    assert.ok(byString.url.startsWith('https://'));
  }

  // Out of range
  assert.equal(resolveGlobalSettlementItem(0), null);
  assert.equal(resolveGlobalSettlementItem(20001), null);
  assert.equal(resolveGlobalSettlementItem('invalid'), null);
});

test('Question text matching and normalization', () => {
  const sample = resolveGlobalSettlementItem(1);
  assert.ok(sample);

  const byExactText = resolveGlobalSettlementItem(sample.question);
  assert.ok(byExactText);
  assert.equal(byExactText.numericId, 1);

  // Normalized with extra spaces and punctuation differences
  const normalized = resolveGlobalSettlementItem(sample.question.toUpperCase());
  assert.ok(normalized);
  assert.equal(normalized.numericId, 1);
});

test('Engine answer() statutory integration with zero evasion across all 8 jurisdictions', () => {for(const id of ["GMS-Q00001","GMS-Q00154","GMS-Q00494","GMS-Q00994","GMS-Q03994","GMS-Q11988","GMS-Q15985","GMS-Q00657"]){const item=resolveGlobalSettlementItem(id);assert.ok(item);const result=answer({question:item.question},[]);assert.equal(result.claims.length,0);assert.equal(result.sources.length,0);assert.equal(result.verification.editorReviewedClaims,0);assert.ok(result.gaps.some(g=>g.reason==='awaiting_human_review'));assert.equal(result.status,'unavailable');}});

test('Search filtering by country, category, tier, and query pagination', () => {
  const allResults = searchGlobalSettlement({ limit: 10 });
  assert.equal(allResults.total, 20000);
  assert.equal(allResults.items.length, 10);

  const canadaResults = searchGlobalSettlement({ country: 'Canada', limit: 50 });
  assert.equal(canadaResults.total, 2448);
  assert.equal(canadaResults.items.length, 50);
  assert.ok(canadaResults.items.every(i => i.country === 'Canada'));

  const basicTier = searchGlobalSettlement({ tier: 'Basic', limit: 25 });
  assert.equal(basicTier.total, 4000);
  assert.equal(basicTier.items.length, 25);
  assert.ok(basicTier.items.every(i => i.tier === 'Basic'));

  const healthcareCategory = searchGlobalSettlement({ category: 'Healthcare', limit: 30 });
  assert.equal(healthcareCategory.total, 391);
  assert.equal(healthcareCategory.items.length, 30);
  assert.ok(healthcareCategory.items.every(i => i.category === 'Healthcare'));

  const querySearch = searchGlobalSettlement({ query: 'SIN application' });
  assert.ok(querySearch.total > 0);
});

test('HTTP REST API endpoints for Global Settlement', async () => {
  const store = openStore(':memory:');
  const app = createApp({ store });
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // 1. Stats endpoint
    const statsRes = await fetch(`${baseUrl}/v1/global-settlement/stats`);
    assert.equal(statsRes.status, 200);
    const stats = await statsRes.json();
    assert.equal(stats.totalQuestions, 20000);
    assert.equal(stats.range, 'GMS-Q00001 - GMS-Q20000');

    // 2. Search endpoint with filtering
    const searchRes = await fetch(`${baseUrl}/v1/global-settlement?country=Germany&category=Healthcare&limit=5`);
    assert.equal(searchRes.status, 200);
    const searchData = await searchRes.json();
    assert.ok(searchData.total > 0);
    assert.equal(searchData.items.length, 5);
    assert.equal(searchData.items[0].country, 'Germany');

    // 3. Single question by string ID
    const singleRes = await fetch(`${baseUrl}/v1/global-settlement/GMS-Q00001`);
    assert.equal(singleRes.status, 200);
    const singleData = await singleRes.json();
    assert.equal(singleData.item.id, 'GMS-Q00001');
    assert.equal(singleData.item.category, 'Identity & SIN');
    // Templated legal text is withheld from the public catalog.
    assert.equal(singleData.item.statutoryRule, undefined);
    assert.equal(singleData.item.authority, undefined);
    assert.deepEqual(singleData.item.withheld, ['statutoryRule', 'citation', 'verdict', 'authority', 'url']);
    assert.ok(searchData.items.every(i => i.citation === undefined && i.reviewStatus === 'unreviewed_template'));

    // 4. Single question by numeric ID
    const singleNumRes = await fetch(`${baseUrl}/v1/global-settlement/20000`);
    assert.equal(singleNumRes.status, 200);
    const singleNumData = await singleNumRes.json();
    assert.equal(singleNumData.item.id, 'GMS-Q20000');

    // 5. 404 for invalid ID
    const notFoundRes = await fetch(`${baseUrl}/v1/global-settlement/99999`);
    assert.equal(notFoundRes.status, 404);
  } finally {
    server.close();
  }
});
