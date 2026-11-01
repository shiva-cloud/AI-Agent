export {questionSuite} from './question-suite-180.js';
import { openStore } from '../src/store.js';
import {fileURLToPath} from 'node:url';
import {questionSuite} from './question-suite-180.js';
import { answer } from '../src/engine.js';
import { writeFileSync } from 'node:fs';

if(process.argv[1]===fileURLToPath(import.meta.url)) {
const store = openStore(process.env.DB_PATH || 'data/settlement.sqlite');
try {
const records = store.records();
const date = new Date('2026-11-01');

// Comprehensive 180-question test suite covering Basic to Advanced, Technical to Non-Technical, All 54 Countries & Core Canadian Domains



console.log(`================================================================`);
console.log(`STARTING BENCHMARK: 180 QUESTIONS ACROSS ALL CATEGORIES & COUNTRIES`);
console.log(`================================================================\n`);

const results = [];
let passedCount = 0;
let failedCount = 0;

for (let i = 0; i < questionSuite.length; i++) {
  const item = questionSuite[i];
  const start = performance.now();
  const res = answer({ question: item.q }, records, date);
  const latency = (performance.now() - start).toFixed(2);

  // Assertion check
  let isPass = false;
  if (item.exp === 'guidance') {
    isPass = (res.status === 'guidance' || res.status === 'partial') && res.claims.length > 0;
  } else if (item.exp === 'clarification') {
    isPass = res.status === 'clarification' && typeof res.clarification === 'string';
  } else if (item.exp === 'unavailable') {
    isPass = res.status === 'unavailable';
  }

  if (isPass) {
    passedCount++;
  } else {
    failedCount++;
  }

  results.push({
    id: item.id,
    category: item.cat,
    subCategory: item.sub,
    question: item.q,
    expected: item.exp,
    actualStatus: res.status,
    passed: isPass,
    claimsCount: res.claims.length,
    sourcesCount: res.sources.length,
    leadSource: res.sources[0]?.title || 'None',
    latencyMs: Number(latency)
  });

  if ((i + 1) % 30 === 0 || i === questionSuite.length - 1) {
    console.log(`Progress: ${i + 1} / ${questionSuite.length} tested (${passedCount} passed, ${failedCount} failed)`);
  }
}

console.log(`\n================================================================`);
console.log(`FINAL BENCHMARK RESULTS SUMMARY:`);
console.log(`Total Questions Executed: ${questionSuite.length}`);
console.log(`Passed: ${passedCount} / ${questionSuite.length} (${((passedCount / questionSuite.length) * 100).toFixed(1)}%)`);
console.log(`Failed: ${failedCount}`);
console.log(`================================================================\n`);

// Breakdown by category
const byCat = {};
for (const r of results) {
  if (!byCat[r.category]) byCat[r.category] = { total: 0, passed: 0 };
  byCat[r.category].total++;
  if (r.passed) byCat[r.category].passed++;
}

console.log('Category Breakdown:');
for (const [cat, stats] of Object.entries(byCat)) {
  console.log(` - ${cat.padEnd(20)}: ${stats.passed} / ${stats.total} (${((stats.passed / stats.total) * 100).toFixed(1)}%)`);
}

// Write detailed CSV report
const csvRows = ['ID,Category,SubCategory,Expected,ActualStatus,Passed,ClaimsCount,SourcesCount,LeadSource,LatencyMs,Question'];
for (const r of results) {
  csvRows.push([
    r.id,
    `"${r.category}"`,
    `"${r.subCategory}"`,
    r.expected,
    r.actualStatus,
    r.passed,
    r.claimsCount,
    r.sourcesCount,
    `"${r.leadSource.replace(/"/g, '""')}"`,
    r.latencyMs,
    `"${r.question.replace(/"/g, '""')}"`
  ].join(','));
}
writeFileSync('artifacts/benchmark-180-results.csv', csvRows.join('\n'));
console.log('\nDetailed benchmark CSV saved to artifacts/benchmark-180-results.csv');

if(failedCount)process.exitCode=1;
} finally {store.db.close();}
}
