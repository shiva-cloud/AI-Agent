import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseNegationScopeGuards,
  filterByNegationScope
} from '../src/negation-scope-guard.js';
import {
  parseTemporalContext,
  rankByTemporalRelevance
} from '../src/temporal-query-navigator.js';
import {
  clusterZeroResultQueries,
  generateEditorialMarkdownReport
} from '../src/zero-result-clusterer.js';
import {
  deconstructMultiSentenceQuery
} from '../src/multi-sentence-deconstructor.js';
import {
  getTermWeight,
  STATUTORY_PROPER_TERMS
} from '../src/search.js';

test('Rec 7: Negation & Scope Guard accurately parses exclusionary clauses', () => {
  const query1 = 'Can I open a bank account without a job in Toronto?';
  const res1 = parseNegationScopeGuards(query1);
  assert.deepEqual(res1.negations, ['no_job']);
  assert.equal(res1.scopeGuards.hasJob, false);
  assert.equal(res1.scopeGuards.hasPR, true);
  assert.equal(res1.matchedAlerts[0].facet, 'unemployed');
  assert.match(res1.matchedAlerts[0].statutoryBasis, /Bank Act/);

  const query2 = 'I am not a permanent resident and have no credit history or guarantor';
  const res2 = parseNegationScopeGuards(query2);
  assert.ok(res2.negations.includes('no_pr'));
  assert.ok(res2.negations.includes('no_credit'));
  assert.ok(res2.negations.includes('no_guarantor'));
  assert.equal(res2.scopeGuards.hasPR, false);
  assert.equal(res2.scopeGuards.hasCredit, false);
  assert.equal(res2.scopeGuards.hasGuarantor, false);

  // Filter records based on scope
  const sampleRecords = [
    { id: 'bank-basic', title: 'Basic Account Rights', requiresEmployment: false, requiresPR: false },
    { id: 'premium-mortgage', title: 'Premium Mortgage', requiresEmployment: true, requiresPR: true }
  ];
  const filtered = filterByNegationScope(sampleRecords, res2.scopeGuards);
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].id, 'bank-basic');
});

test('Rec 8: Temporal Query Awareness detects future rules, target years, and historical context', () => {
  const queryFuture = 'What are the PGWP new rules effective 2026?';
  const resFuture = parseTemporalContext(queryFuture);
  assert.equal(resFuture.hasTemporalQuery, true);
  assert.equal(resFuture.targetYear, 2026);
  assert.equal(resFuture.isFutureRule, true);
  assert.equal(resFuture.isHistorical, false);

  const queryHist = 'Can I renew under historical rules prior to 2024?';
  const resHist = parseTemporalContext(queryHist);
  assert.equal(resHist.hasTemporalQuery, true);
  assert.equal(resHist.targetYear, 2024);
  assert.equal(resHist.isHistorical, true);

  // Ranking by temporal relevance
  const records = [
    { id: 'legacy-2022', effectiveFrom: '2022-01-01', checkedAt: '2022-01-01' },
    { id: 'current-2024', effectiveFrom: '2024-01-01', checkedAt: '2024-01-01' },
    { id: 'future-2026', effectiveFrom: '2026-01-01', checkedAt: '2026-01-01' }
  ];

  const sortedFuture = rankByTemporalRelevance(records, resFuture);
  assert.equal(sortedFuture[0].id, 'future-2026');

  const sortedHist = rankByTemporalRelevance(records, resHist);
  assert.equal(sortedHist[0].id, 'legacy-2022');
});

test('Rec 10: Zero-Result Query Clustering aggregates unserved queries into editorial themes', () => {
  const zeroLogs = [
    { query: 'Super visa parental insurance coverage minimums' },
    { query: 'Parents super visa insurance required amount' },
    { query: 'Minimum insurance for super visa parents application' },
    { query: 'German chancenkarte blocked account amount in Berlin' },
    { query: 'Sperrkonto blocked account for chancenkarte in Germany' },
    { query: 'Dubai end of service gratuity calculator for expats' }
  ];

  const report = clusterZeroResultQueries(zeroLogs);
  assert.equal(report.totalQueries, 6);
  assert.ok(report.uniqueClusters >= 3);
  assert.ok(report.clusters[0].frequency >= 2);

  const md = generateEditorialMarkdownReport(report);
  assert.match(md, /Zero-Result Query Cluster Report/);
  assert.match(md, /Top Missing Evidence Themes/);
});

test('Rec 11: Dynamic Query Term Weighting boosts proper statutory nouns 3x', () => {
  assert.equal(getTermWeight('ohip'), 3.0);
  assert.equal(getTermWeight('ejari'), 3.0);
  assert.equal(getTermWeight('sin'), 3.0);
  assert.equal(getTermWeight('chancenkarte'), 3.0);
  assert.equal(getTermWeight('omny'), 3.0);
  assert.equal(getTermWeight('computer'), 1.0);
  assert.equal(getTermWeight('apartment'), 1.0);
});

test('Rec 14: Multi-Sentence Query Deconstruction isolates primary question and context', () => {
  const narrative = 'We just moved to Vancouver from India last week with our two kids. We found an apartment, but the landlord is demanding 6 months of rent in advance. Can the landlord legally ask for this deposit? Also how do we get our BC MSP card?';
  const deconstructed = deconstructMultiSentenceQuery(narrative);

  assert.equal(deconstructed.isMultiSentence, true);
  assert.ok(deconstructed.sentences.length >= 3);
  assert.ok(deconstructed.backgroundSentences.length >= 1);
  assert.ok(deconstructed.actionableQuestions.length >= 2);
  assert.match(deconstructed.primaryQuestion, /Can the landlord legally ask for this deposit\?/);
});
