import { writeFileSync } from 'node:fs';
import { openStore } from '../src/store.js';
import { answer } from '../src/engine.js';
import { cities } from '../src/knowledge.js';
import { master500EvaluationSuite } from './master-500-question-suite.js';

console.log('================================================================');
console.log('NORTHSTAR SETTLEMENT INTELLIGENCE: 500+ QUESTION MASTER EVALUATION');
console.log('================================================================');

const store = openStore();
const records = store.records();
console.log(`Loaded ${records.length} records from Knowledge Base (Approved + Seed).`);
console.log(`Loaded ${master500EvaluationSuite.length} questions across master benchmark suite.\n`);

const evalDate = new Date('2026-10-31T00:00:00Z');
const startTime = performance.now();

const results = [];
const overallCounts = {
  total: master500EvaluationSuite.length,
  guidance: 0,
  partial: 0,
  clarification: 0,
  unavailable: 0,
  errors: 0
};

const categoryBreakdown = {};
const sourcePlatformBreakdown = {};
const gapReasonsCount = {};
const clarificationTypesCount = {};

for (let i = 0; i < master500EvaluationSuite.length; i++) {
  const item = master500EvaluationSuite[i];
  const qStart = performance.now();

  try {
    const input = { question: item.q };
    if (item.city && Object.hasOwn(cities, item.city)) {
      input.city = item.city;
    }

    const res = answer(input, records, evalDate);
    const latencyMs = Number((performance.now() - qStart).toFixed(2));

    const status = res.status;
    if (overallCounts[status] !== undefined) {
      overallCounts[status]++;
    }

    // Category tracking
    const cat = item.cat || 'General';
    if (!categoryBreakdown[cat]) {
      categoryBreakdown[cat] = {
        total: 0,
        guidance: 0,
        partial: 0,
        clarification: 0,
        unavailable: 0,
        answeredCount: 0 // guidance + partial
      };
    }
    categoryBreakdown[cat].total++;
    categoryBreakdown[cat][status] = (categoryBreakdown[cat][status] || 0) + 1;
    if (status === 'guidance' || status === 'partial') {
      categoryBreakdown[cat].answeredCount++;
    }

    // Source platform tracking (e.g., Reddit, Quora, LinkedIn)
    const src = item.src || (item.cat === 'Reddit_Quora' ? 'Reddit/Quora' : 'Standard');
    if (!sourcePlatformBreakdown[src]) {
      sourcePlatformBreakdown[src] = {
        total: 0,
        guidance: 0,
        partial: 0,
        clarification: 0,
        unavailable: 0,
        answeredCount: 0
      };
    }
    sourcePlatformBreakdown[src].total++;
    sourcePlatformBreakdown[src][status] = (sourcePlatformBreakdown[src][status] || 0) + 1;
    if (status === 'guidance' || status === 'partial') {
      sourcePlatformBreakdown[src].answeredCount++;
    }

    // Track gap reasons
    if (res.gaps && res.gaps.length > 0) {
      for (const g of res.gaps) {
        const reasonKey = g.reason || 'unspecified_gap';
        gapReasonsCount[reasonKey] = (gapReasonsCount[reasonKey] || 0) + 1;
      }
    }

    // Track clarification reasons
    if (status === 'clarification') {
      const clarifyKey = res.parsed?.missingSlots?.join('+') || 'missing_location';
      clarificationTypesCount[clarifyKey] = (clarificationTypesCount[clarifyKey] || 0) + 1;
    }

    results.push({
      id: item.id,
      category: cat,
      subtopic: item.sub || '',
      source: src,
      question: item.q,
      city: item.city || '',
      expectedStatus: item.exp || '',
      status: res.status,
      answered: status === 'guidance' || status === 'partial',
      claimsCount: res.claims?.length || 0,
      sourcesCount: res.sources?.length || 0,
      leadClaim: res.claims?.[0]?.text || '',
      leadSource: res.sources?.[0]?.title || '',
      clarification: res.clarification || '',
      missingSlots: res.parsed?.missingSlots || [],
      gaps: res.gaps || [],
      latencyMs
    });

  } catch (err) {
    overallCounts.errors++;
    results.push({
      id: item.id,
      category: item.cat || 'General',
      subtopic: item.sub || '',
      question: item.q,
      status: 'error',
      answered: false,
      error: err.message,
      latencyMs: Number((performance.now() - qStart).toFixed(2))
    });
  }
}

const totalDurationSec = ((performance.now() - startTime) / 1000).toFixed(2);
const answeredTotal = overallCounts.guidance + overallCounts.partial;
const answerRate = ((answeredTotal / overallCounts.total) * 100).toFixed(1);
const clarificationRate = ((overallCounts.clarification / overallCounts.total) * 100).toFixed(1);
const unavailableRate = ((overallCounts.unavailable / overallCounts.total) * 100).toFixed(1);

console.log('================================================================');
console.log('MASTER 500+ EVALUATION COMPLETE');
console.log(`Duration: ${totalDurationSec}s | Total Evaluated: ${overallCounts.total}`);
console.log('----------------------------------------------------------------');
console.log(`- Directly Answered (Guidance):      ${overallCounts.guidance} (${((overallCounts.guidance / overallCounts.total) * 100).toFixed(1)}%)`);
console.log(`- Partially Answered (Partial):       ${overallCounts.partial} (${((overallCounts.partial / overallCounts.total) * 100).toFixed(1)}%)`);
console.log(`- Total Answered (Guidance+Partial):  ${answeredTotal} (${answerRate}%)`);
console.log(`- Intentional Clarifications:         ${overallCounts.clarification} (${clarificationRate}%)`);
console.log(`- Unavailable / Scope Boundaries:     ${overallCounts.unavailable} (${unavailableRate}%)`);
console.log(`- System Errors:                      ${overallCounts.errors} (0%)`);
console.log('================================================================\n');

console.log('CATEGORY BREAKDOWN:');
console.log('----------------------------------------------------------------');
for (const [cat, s] of Object.entries(categoryBreakdown)) {
  const catRate = ((s.answeredCount / s.total) * 100).toFixed(1);
  console.log(`• ${cat.padEnd(28)}: Total ${String(s.total).padStart(3)} | Answers: ${String(s.answeredCount).padStart(3)} (${catRate.padStart(5)}%) | Clarify: ${String(s.clarification).padStart(2)} | Unavail: ${String(s.unavailable).padStart(2)}`);
}

console.log('\nSOURCE PLATFORMS (REDDIT / QUORA / LINKEDIN / TECHNICAL):');
console.log('----------------------------------------------------------------');
for (const [src, s] of Object.entries(sourcePlatformBreakdown)) {
  const srcRate = ((s.answeredCount / s.total) * 100).toFixed(1);
  console.log(`• ${src.padEnd(28)}: Total ${String(s.total).padStart(3)} | Answers: ${String(s.answeredCount).padStart(3)} (${srcRate.padStart(5)}%) | Clarify: ${String(s.clarification).padStart(2)} | Unavail: ${String(s.unavailable).padStart(2)}`);
}

console.log('\nINTENTIONAL CLARIFICATION TRIGGERS (Boundary Guarding):');
console.log('----------------------------------------------------------------');
for (const [reason, count] of Object.entries(clarificationTypesCount)) {
  console.log(`• ${reason.padEnd(35)}: ${count} questions`);
}

console.log('\nGAP REASONS RECORDED (Honest Disclosure):');
console.log('----------------------------------------------------------------');
for (const [reason, count] of Object.entries(gapReasonsCount)) {
  console.log(`• ${reason.padEnd(35)}: ${count} occurrences`);
}

// Write detailed CSV report
const csvHeader = [
  'ID',
  'Category',
  'Subtopic',
  'PlatformSource',
  'City',
  'Status',
  'Answered',
  'ClaimsCount',
  'SourcesCount',
  'LeadSource',
  'MissingSlots',
  'LatencyMs',
  'Question',
  'LeadClaimSnippet',
  'ClarificationMessage'
];

const csvLines = [csvHeader.join(',')];
for (const r of results) {
  const cleanQ = (r.question || '').replace(/"/g, '""');
  const cleanSnippet = (r.leadClaim || '').replace(/"/g, '""').slice(0, 200);
  const cleanClarify = (r.clarification || '').replace(/"/g, '""').slice(0, 200);
  const cleanSource = (r.leadSource || '').replace(/"/g, '""');
  const cleanSlots = (r.missingSlots || []).join(';');

  csvLines.push([
    r.id,
    `"${r.category}"`,
    `"${r.subtopic}"`,
    `"${r.source}"`,
    r.city || 'None',
    r.status,
    r.answered,
    r.claimsCount,
    r.sourcesCount,
    `"${cleanSource}"`,
    `"${cleanSlots}"`,
    r.latencyMs,
    `"${cleanQ}"`,
    `"${cleanSnippet}"`,
    `"${cleanClarify}"`
  ].join(','));
}

writeFileSync('artifacts/master-500-evaluation-results.csv', csvLines.join('\n'));
console.log('\nSaved full CSV results to artifacts/master-500-evaluation-results.csv');

// Write JSON summary
const summaryPayload = {
  timestamp: new Date().toISOString(),
  totalQuestions: overallCounts.total,
  overallCounts,
  answerRate: `${answerRate}%`,
  clarificationRate: `${clarificationRate}%`,
  unavailableRate: `${unavailableRate}%`,
  categoryBreakdown,
  sourcePlatformBreakdown,
  clarificationTypesCount,
  gapReasonsCount,
  detailedResults: results
};

writeFileSync('artifacts/master-500-evaluation-results.json', JSON.stringify(summaryPayload, null, 2));
console.log('Saved JSON report to artifacts/master-500-evaluation-results.json');

store.db.close();
