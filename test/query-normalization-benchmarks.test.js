import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeNewcomerTypos,
  normalizeHinglishTransliteration,
  extractStatutoryThresholds,
  parseNegationScopeGuards,
  parseTemporalContext,
  deconstructMultiSentenceQuery
} from '../src/engine.js';
import { rankHybrid, computeDenseSemanticScore } from '../src/search.js';

test('Benchmark 500 synthetic newcomer queries for parser accuracy and throughput (Rec 13)', () => {
  const benchmarkDataset = [];

  // 1. 100 Typo cases
  const typoBases = [
    { input: 'How do I do Ameldung in Berlin Bürgeramt?', expectedKeyword: 'anmeldung' },
    { input: 'Where can I reload my prsto card in Toronto?', expectedKeyword: 'presto' },
    { input: 'Landlord gave an ejary contract in Dubai', expectedKeyword: 'ejari' },
    { input: 'Can I apply for chancenkart points in Germany?', expectedKeyword: 'chancenkarte' },
    { input: 'I need my burgerservice for Amsterdam gemeente', expectedKeyword: 'burgerservicenummer' }
  ];
  for (let i = 0; i < 100; i++) {
    const base = typoBases[i % typoBases.length];
    benchmarkDataset.push({
      category: 'typo',
      input: `${base.input} [variation ${i}]`,
      verify: (text) => normalizeNewcomerTypos(text).toLowerCase().includes(base.expectedKeyword)
    });
  }

  // 2. 100 Hinglish transliteration cases
  const hinglishBases = [
    { input: 'Makan malik bina notice ghar me ghus gaya', expectedKeywords: ['landlord', 'notice'] },
    { input: 'Advance kiraya aur chabi deposit kitna de sakte hain', expectedKeywords: ['deposit', 'rent'] },
    { input: 'Bina naukri bank khata khol sakte hain kya Toronto me', expectedKeywords: ['bank', 'account'] },
    { input: 'Videsh se dus hazar cash lane par declare karna padega', expectedKeywords: ['cash', 'declaration'] },
    { input: 'Ontario me bina ohip card doctor ke pas kaise jaye', expectedKeywords: ['ohip', 'doctor'] }
  ];
  for (let i = 0; i < 100; i++) {
    const base = hinglishBases[i % hinglishBases.length];
    benchmarkDataset.push({
      category: 'hinglish',
      input: `${base.input} question #${i}`,
      verify: (text) => {
        const normalized = normalizeHinglishTransliteration(text).toLowerCase();
        return base.expectedKeywords.every(kw => normalized.includes(kw));
      }
    });
  }

  // 3. 100 Statutory threshold extraction cases
  for (let i = 0; i < 100; i++) {
    const salaryVal = 50000 + (i * 1000);
    const rentVal = 1500 + (i * 20);
    const hoursVal = 15 + (i % 25);
    const cashVal = 10000 + (i * 100);

    const qType = i % 4;
    let inputStr, checkFn;

    if (qType === 0) {
      inputStr = `My annual salary is $${salaryVal} CAD in Calgary.`;
      checkFn = (t) => extractStatutoryThresholds(t)?.salary === salaryVal;
    } else if (qType === 1) {
      inputStr = `The monthly rent is $${rentVal} for this 1-bedroom.`;
      checkFn = (t) => extractStatutoryThresholds(t)?.rent === rentVal;
    } else if (qType === 2) {
      inputStr = `Can I work ${hoursVal} hrs per week on my student permit?`;
      checkFn = (t) => extractStatutoryThresholds(t)?.hoursPerWeek === hoursVal;
    } else {
      inputStr = `Bringing ${cashVal} cash at customs border point.`;
      checkFn = (t) => extractStatutoryThresholds(t)?.cash === cashVal;
    }

    benchmarkDataset.push({
      category: 'threshold',
      input: inputStr,
      verify: checkFn
    });
  }

  // 4. 100 Negation & scope guard cases
  const negationBases = [
    { input: 'Can I open a chequing account without a job in Vancouver?', checkKey: 'no_job' },
    { input: 'I am not a permanent resident yet, what are my health rights in Ontario?', checkKey: 'no_pr' },
    { input: 'I have no credit history in Canada, can landlord refuse my application?', checkKey: 'no_credit' },
    { input: 'I cannot provide a guarantor or co-signer for my lease', checkKey: 'no_guarantor' },
    { input: 'My work permit expired and I am without status for 30 days', checkKey: 'no_status' }
  ];
  for (let i = 0; i < 100; i++) {
    const base = negationBases[i % negationBases.length];
    benchmarkDataset.push({
      category: 'negation',
      input: `${base.input} (case ${i})`,
      verify: (text) => {
        const parsed = parseNegationScopeGuards(text);
        return parsed.negations.includes(base.checkKey);
      }
    });
  }

  // 5. 100 Multi-sentence & Temporal cases
  for (let i = 0; i < 100; i++) {
    const isFuture = i % 2 === 0;
    const year = 2026 + (i % 3);
    const inputStr = isFuture
      ? `I moved to Montreal last week. What are the new rules effective ${year} for work permits?`
      : `We landed in Toronto 3 days ago. Can our landlord increase rent by 10% under old rules?`;

    benchmarkDataset.push({
      category: 'temporal_multisentence',
      input: inputStr,
      verify: (text) => {
        const deconstructed = deconstructMultiSentenceQuery(text);
        const temporal = parseTemporalContext(text);
        return deconstructed.isMultiSentence && temporal.hasTemporalQuery;
      }
    });
  }

  assert.equal(benchmarkDataset.length, 500, 'Benchmark suite must contain exactly 500 items');

  // Execute benchmark
  const startMs = performance.now();
  let passedCount = 0;

  for (const item of benchmarkDataset) {
    if (item.verify(item.input)) {
      passedCount++;
    }
  }

  const durationMs = performance.now() - startMs;
  const accuracyPct = (passedCount / benchmarkDataset.length) * 100;

  // Assert accuracy >= 99.5% and high throughput
  assert.ok(accuracyPct >= 99.5, `Accuracy should be >= 99.5%, got ${accuracyPct}% (${passedCount}/${benchmarkDataset.length})`);
  assert.ok(durationMs < 1000, `Benchmark throughput should be under 1000ms, took ${durationMs.toFixed(2)}ms`);
});

test('Hybrid BM25 and dense semantic retrieval (Rec 4)', () => {
  const query = 'Where can I find a flat or letting in London?';
  const docs = [
    { id: '1', title: 'London Apartment Rental Leases', summary: 'Guidance on renting a flat or apartment under UK tenancy deposit scheme TDS.', quote: 'Assured shorthold tenancy', topic: 'housing' },
    { id: '2', title: 'London Underground Metro Transit', summary: 'Using Oyster card and contactless on London transit.', quote: 'Transport for London', topic: 'transit' }
  ];

  const results = rankHybrid(docs, query);
  assert.equal(results[0].id, '1', 'Apartment/flat document should rank first');
  assert.ok(results[0].hybridScore > results[1].hybridScore);
  assert.ok(results[0].semanticScore > 0);
});
