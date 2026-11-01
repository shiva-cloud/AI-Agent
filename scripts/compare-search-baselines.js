// scripts/compare-search-baselines.js
// Lexical BM25 vs Dense Semantic + Hybrid Search Evaluation Harness (Backlog Item 28).
// Evaluates ranking distribution, top-K agreement, dense semantic lift, and retrieval latency.
// Pure ES module with zero npm runtime dependencies.

import { writeFileSync, mkdirSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import { openStore } from '../src/store.js';
import { queryTerms, rankLexically, rankHybrid } from '../src/search.js';

const BENCHMARK_QUERIES = [
  // Statutory Canadian Terms
  'How do I apply for a Social Insurance Number in Toronto?',
  'Is there a three month waiting period for OHIP health coverage?',
  'How is the coverage waiting period calculated for BC MSP in Vancouver?',
  'Can a landlord lock out a tenant without an eviction order in Toronto?',
  'Is a security deposit legal under Ontario tenancy law in Brampton?',
  'What standard terms must be included in a BC residential tenancy agreement?',
  'How do newcomers apply for Canada Child Benefit using Schedule RC66SCH?',
  'What are landlord emergency repair responsibilities under BC tenancy law?',
  'What is the CWELCC twenty-two dollar daily fee cap for child care in Ontario?',
  'How does the CRTC Wireless Code protect mobile customers from contract overages?',
  // Employment & Severance
  'How is statutory severance pay calculated under Ontario ESA s. 64?',
  'What is the overtime rate after 44 hours in Ontario?',
  'Can an employer deduct till shortages from wages under ESA s. 13?',
  'What are employee rights during constructive dismissal salary reductions?',
  // Global & Corridors
  'How do I exchange my driver licence in Toronto if moving from India?',
  'How do I get health coverage in London UK with the NHS?',
  'Can I exchange my driver licence in Sydney Australia?',
  'How does the 15-year rule apply to importing non-US vehicles into Canada?',
  'What are the minimum LICO income requirements for a Super Visa in 2026?',
  'What is the German Chancenkarte opportunity card point threshold?',
  // Settlement & Daily Life
  'How much is the adult transit fare on the TTC in Toronto?',
  'What settlement programs does Mississauga Library offer for newcomers?',
  'Where can I find free newcomer settlement services in Vancouver?',
  'What are consumer rights for mobile phone plans in Toronto?',
  'How does Toronto District School Board TDSB handle registration for newcomer children?'
];

export function runSearchBaselineComparison(dbPath = 'data/settlement.sqlite') {
  const store = openStore(dbPath);
  try {
    const records = store.records();
    if (!records || records.length === 0) {
      throw new Error('No records found in database');
    }

    const lexicalLatencies = [];
    const hybridLatencies = [];
    const results = [];
    let top1Agreements = 0;
    let totalJaccardTop5 = 0;

    for (const q of BENCHMARK_QUERIES) {
      const terms = queryTerms(q);

      // 1. Lexical BM25
      const startLex = performance.now();
      const lexResults = rankLexically(records, terms).sort((a, b) => b.lexicalScore - a.lexicalScore);
      const lexElapsed = performance.now() - startLex;
      lexicalLatencies.push(lexElapsed);

      // 2. Hybrid (BM25 + Dense Semantic)
      const startHyb = performance.now();
      const hybResults = rankHybrid(records, q, terms);
      const hybElapsed = performance.now() - startHyb;
      hybridLatencies.push(hybElapsed);

      // Top-1 comparison
      const topLex = lexResults[0];
      const topHyb = hybResults[0];
      const top1Match = topLex && topHyb && topLex.id === topHyb.id;
      if (top1Match) top1Agreements++;

      // Top-5 Jaccard overlap
      const top5LexIds = new Set(lexResults.slice(0, 5).map(r => r.id));
      const top5HybIds = new Set(hybResults.slice(0, 5).map(r => r.id));
      const intersection = [...top5LexIds].filter(id => top5HybIds.has(id));
      const union = new Set([...top5LexIds, ...top5HybIds]);
      const jaccard = union.size > 0 ? intersection.length / union.size : 1.0;
      totalJaccardTop5 += jaccard;

      results.push({
        query: q,
        termCount: terms.length,
        lexicalTopId: topLex?.id ?? null,
        lexicalTopScore: topLex?.lexicalScore ?? 0,
        hybridTopId: topHyb?.id ?? null,
        hybridTopScore: topHyb?.hybridScore ?? 0,
        semanticScore: topHyb?.semanticScore ?? 0,
        top1Agreement: Boolean(top1Match),
        top5Jaccard: Number(jaccard.toFixed(4)),
        lexicalLatencyMs: Number(lexElapsed.toFixed(3)),
        hybridLatencyMs: Number(hybElapsed.toFixed(3))
      });
    }

    const percentile = (arr, p) => {
      const s = [...arr].sort((a, b) => a - b);
      return s.length ? Number(s[Math.min(s.length - 1, Math.ceil(s.length * p) - 1)].toFixed(3)) : 0;
    };

    const report = {
      asOf: new Date().toISOString(),
      scope: 'Offline Search Baseline Evaluation: Pure Lexical BM25 vs Dense Semantic + BM25 Hybrid',
      queryCount: BENCHMARK_QUERIES.length,
      corpusSize: records.length,
      metrics: {
        top1AgreementRate: Number((top1Agreements / BENCHMARK_QUERIES.length).toFixed(4)),
        meanTop5JaccardOverlap: Number((totalJaccardTop5 / BENCHMARK_QUERIES.length).toFixed(4)),
        lexicalLatencyMs: {
          p50: percentile(lexicalLatencies, 0.50),
          p95: percentile(lexicalLatencies, 0.95),
          p99: percentile(lexicalLatencies, 0.99)
        },
        hybridLatencyMs: {
          p50: percentile(hybridLatencies, 0.50),
          p95: percentile(hybridLatencies, 0.95),
          p99: percentile(hybridLatencies, 0.99)
        }
      },
      queries: results
    };

    mkdirSync('artifacts', { recursive: true });
    writeFileSync('artifacts/search-baseline-comparison.json', JSON.stringify(report, null, 2) + '\n');
    return report;
  } finally {
    store.db.close();
  }
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  const rep = runSearchBaselineComparison();
  console.log('Search Baseline Comparison Report:');
  console.log(`Corpus: ${rep.corpusSize} records, Queries: ${rep.queryCount}`);
  console.log(`Top-1 Agreement: ${(rep.metrics.top1AgreementRate * 100).toFixed(1)}%`);
  console.log(`Mean Top-5 Overlap: ${(rep.metrics.meanTop5JaccardOverlap * 100).toFixed(1)}%`);
  console.log(`Lexical Latency (p50 / p95): ${rep.metrics.lexicalLatencyMs.p50}ms / ${rep.metrics.lexicalLatencyMs.p95}ms`);
  console.log(`Hybrid Latency (p50 / p95): ${rep.metrics.hybridLatencyMs.p50}ms / ${rep.metrics.hybridLatencyMs.p95}ms`);
}
