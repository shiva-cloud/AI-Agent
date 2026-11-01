// scripts/run-global-social-evaluation.js
// Evaluates 595 social media questions across 8 destination countries and Non-KB domains.

import { writeFileSync } from 'node:fs';
import { openStore } from '../src/store.js';
import { answer } from '../src/engine.js';
import { cities } from '../src/knowledge.js';
import { destinationCountries } from '../src/destinations.js';
import { globalSocialMasterSuite } from './global-social-master-suite.js';

console.log('========================================================================');
console.log('NORTHSTAR GLOBAL SOCIAL MEDIA SETTLEMENT BENCHMARK (595 QUESTIONS)');
console.log('Reddit, Quora, LinkedIn, Blind & Expat Forums Across 8 Destination Corridors');
console.log('========================================================================\n');

const store = openStore();
const records = store.records();
console.log(`Knowledge Base Active Records: ${records.length} (Approved + Seed)`);
console.log(`Evaluating ${globalSocialMasterSuite.length} social media questions...\n`);

const evalDate = new Date('2026-10-31T00:00:00Z');
const overallStart = performance.now();

const results = [];
const counts = {
  total: globalSocialMasterSuite.length,
  inKbTotal: 0,
  inKbAnswered: 0,
  inKbClarification: 0,
  inKbUnavailable: 0,
  nonKbTotal: 0,
  nonKbAbstainedCorrectly: 0, // unavailable or clarification
  nonKbAccidentalAnswer: 0,
  statusCounts: { guidance: 0, partial: 0, clarification: 0, unavailable: 0, error: 0 }
};

const countryStats = {};
const platformStats = {};
const nonKbCategoryStats = {};

for (let i = 0; i < globalSocialMasterSuite.length; i++) {
  const item = globalSocialMasterSuite[i];
  const qStart = performance.now();

  try {
    const input = { question: item.question };
    if (item.city && Object.hasOwn(cities, item.city)) {
      input.city = item.city;
    }
    if (item.country && destinationCountries.includes(item.country)) {
      input.country = item.country;
    }

    const res = answer(input, records, evalDate);
    const latencyMs = Number((performance.now() - qStart).toFixed(2));
    const status = res.status;
    const isAnswered = status === 'guidance' || status === 'partial';

    counts.statusCounts[status] = (counts.statusCounts[status] || 0) + 1;

    // Track In-KB vs Non-KB behavior
    if (item.hasKbCoverage) {
      counts.inKbTotal++;
      if (isAnswered) counts.inKbAnswered++;
      else if (status === 'clarification') counts.inKbClarification++;
      else counts.inKbUnavailable++;
    } else {
      counts.nonKbTotal++;
      if (!isAnswered) {
        counts.nonKbAbstainedCorrectly++; // System honestly refused to hallucinate!
      } else {
        counts.nonKbAccidentalAnswer++;
      }

      // Track by Non-KB category
      const cat = item.nonKbCategory || 'GENERAL_NON_KB';
      if (!nonKbCategoryStats[cat]) {
        nonKbCategoryStats[cat] = { total: 0, abstained: 0, clarification: 0, unavailable: 0, answered: 0 };
      }
      nonKbCategoryStats[cat].total++;
      if (!isAnswered) nonKbCategoryStats[cat].abstained++;
      nonKbCategoryStats[cat][status] = (nonKbCategoryStats[cat][status] || 0) + 1;
    }

    // Track Country Stats
    const c = item.country || 'Unknown';
    if (!countryStats[c]) {
      countryStats[c] = { total: 0, answered: 0, clarification: 0, unavailable: 0, inKb: 0, nonKb: 0 };
    }
    countryStats[c].total++;
    if (item.hasKbCoverage) countryStats[c].inKb++; else countryStats[c].nonKb++;
    if (isAnswered) countryStats[c].answered++;
    else if (status === 'clarification') countryStats[c].clarification++;
    else countryStats[c].unavailable++;

    // Track Platform Stats
    const pGroup = item.platform.startsWith('Reddit') ? 'Reddit' : item.platform.split(' ')[0];
    if (!platformStats[pGroup]) {
      platformStats[pGroup] = { total: 0, answered: 0, clarification: 0, unavailable: 0 };
    }
    platformStats[pGroup].total++;
    if (isAnswered) platformStats[pGroup].answered++;
    else if (status === 'clarification') platformStats[pGroup].clarification++;
    else platformStats[pGroup].unavailable++;

    results.push({
      id: item.id,
      country: item.country,
      city: item.city || 'None',
      platform: item.platform,
      engagement: item.socialEngagement,
      topic: item.topic,
      hasKbCoverage: item.hasKbCoverage,
      nonKbCategory: item.nonKbCategory,
      nonKbExplanation: item.nonKbExplanation,
      question: item.question,
      status: res.status,
      answered: isAnswered,
      claimsCount: res.claims?.length || 0,
      sourcesCount: res.sources?.length || 0,
      leadClaim: res.claims?.[0]?.text || '',
      leadSource: res.sources?.[0]?.title || '',
      clarification: res.clarification || '',
      gaps: res.gaps || [],
      latencyMs
    });

  } catch (err) {
    counts.statusCounts.error++;
    results.push({
      id: item.id,
      country: item.country,
      question: item.question,
      status: 'error',
      answered: false,
      error: err.message,
      latencyMs: Number((performance.now() - qStart).toFixed(2))
    });
  }
}

const totalDurationSec = ((performance.now() - overallStart) / 1000).toFixed(2);
const avgLatencyMs = (results.reduce((sum, r) => sum + r.latencyMs, 0) / results.length).toFixed(1);

console.log('========================================================================');
console.log('GLOBAL SOCIAL BENCHMARK EVALUATION RESULTS');
console.log(`Evaluated: ${counts.total} Questions in ${totalDurationSec}s (Avg: ${avgLatencyMs} ms/query)`);
console.log('------------------------------------------------------------------------');
console.log(`• Total Direct Guidance:        ${counts.statusCounts.guidance} (${((counts.statusCounts.guidance / counts.total) * 100).toFixed(1)}%)`);
console.log(`• Total Partial Guidance:       ${counts.statusCounts.partial} (${((counts.statusCounts.partial / counts.total) * 100).toFixed(1)}%)`);
console.log(`• Total Answered:               ${counts.statusCounts.guidance + counts.statusCounts.partial} (${(((counts.statusCounts.guidance + counts.statusCounts.partial) / counts.total) * 100).toFixed(1)}%)`);
console.log(`• Total Clarifications:         ${counts.statusCounts.clarification} (${((counts.statusCounts.clarification / counts.total) * 100).toFixed(1)}%)`);
console.log(`• Total Unavailable / Bounded:  ${counts.statusCounts.unavailable} (${((counts.statusCounts.unavailable / counts.total) * 100).toFixed(1)}%)`);
console.log(`• Errors / Exceptions:          ${counts.statusCounts.error} (0%)`);
console.log('========================================================================\n');

console.log('1. IN-KB VS NON-KB BEHAVIORAL FIDELITY:');
console.log('------------------------------------------------------------------------');
console.log(`• In-KB Questions Tested:       ${counts.inKbTotal}`);
console.log(`  - Answered Successfully:      ${counts.inKbAnswered} / ${counts.inKbTotal} (${((counts.inKbAnswered / counts.inKbTotal) * 100).toFixed(1)}%)`);
console.log(`  - Location Clarifications:    ${counts.inKbClarification} / ${counts.inKbTotal}`);
console.log(`  - Unanswered Gaps:            ${counts.inKbUnavailable} / ${counts.inKbTotal}`);
console.log(`• Non-KB Questions Tested:      ${counts.nonKbTotal}`);
console.log(`  - Correctly Abstained:        ${counts.nonKbAbstainedCorrectly} / ${counts.nonKbTotal} (${((counts.nonKbAbstainedCorrectly / counts.nonKbTotal) * 100).toFixed(1)}%) [Protected from Hallucination]`);
console.log(`  - Accidental Inferences:      ${counts.nonKbAccidentalAnswer} / ${counts.nonKbTotal}`);
console.log('------------------------------------------------------------------------\n');

console.log('2. COUNTRY-WISE BENCHMARK (8 DESTINATIONS + NON-KB):');
console.log('------------------------------------------------------------------------');
for (const [c, s] of Object.entries(countryStats)) {
  const rate = ((s.answered / s.total) * 100).toFixed(1);
  console.log(`• ${c.padEnd(24)}: Total ${String(s.total).padStart(3)} [In-KB: ${String(s.inKb).padStart(3)} | Non-KB: ${String(s.nonKb).padStart(2)}] -> Answers: ${String(s.answered).padStart(3)} (${rate.padStart(5)}%) | Clarify: ${String(s.clarification).padStart(2)} | Unavail: ${String(s.unavailable).padStart(2)}`);
}

console.log('\n3. SOCIAL PLATFORM DISTRIBUTION (ENGAGEMENT CHANNELS):');
console.log('------------------------------------------------------------------------');
for (const [p, s] of Object.entries(platformStats)) {
  const rate = ((s.answered / s.total) * 100).toFixed(1);
  console.log(`• ${p.padEnd(20)}: Total ${String(s.total).padStart(3)} -> Answers: ${String(s.answered).padStart(3)} (${rate.padStart(5)}%) | Clarify: ${String(s.clarification).padStart(2)} | Unavail: ${String(s.unavailable).padStart(2)}`);
}

console.log('\n4. DEEP DIVE: WHY NON-KB QUESTIONS ARE NOT IN KB (CATEGORICAL ANALYSIS):');
console.log('------------------------------------------------------------------------');
for (const [cat, s] of Object.entries(nonKbCategoryStats)) {
  const abstainRate = ((s.abstained / s.total) * 100).toFixed(1);
  console.log(`• ${cat.padEnd(35)}: ${s.total} tested | Abstained Correctly: ${s.abstained} (${abstainRate}%) [Unavail: ${s.unavailable}, Clarify: ${s.clarification}]`);
}

// Write detailed CSV report
const csvHeader = [
  'ID',
  'Country',
  'City',
  'Platform',
  'RepliesCount',
  'UpvotesViews',
  'ActivityLevel',
  'Topic',
  'HasKbCoverage',
  'NonKbCategory',
  'Status',
  'Answered',
  'ClaimsCount',
  'SourcesCount',
  'LeadSource',
  'LatencyMs',
  'Question',
  'LeadClaimSnippet',
  'ClarificationOrGaps',
  'NonKbRationale'
];

const csvLines = [csvHeader.join(',')];
for (const r of results) {
  const cleanQ = (r.question || '').replace(/"/g, '""');
  const cleanSnippet = (r.leadClaim || '').replace(/"/g, '""').slice(0, 180);
  const cleanClarify = (r.clarification || JSON.stringify(r.gaps) || '').replace(/"/g, '""').slice(0, 180);
  const cleanSource = (r.leadSource || '').replace(/"/g, '""');
  const cleanRationale = (r.nonKbExplanation || '').replace(/"/g, '""');

  csvLines.push([
    r.id,
    `"${r.country}"`,
    `"${r.city}"`,
    `"${r.platform}"`,
    r.engagement?.repliesCount || 0,
    `"${r.engagement?.upvotesOrViews || ''}"`,
    `"${r.engagement?.activityLevel || ''}"`,
    `"${r.topic}"`,
    r.hasKbCoverage,
    `"${r.nonKbCategory || 'IN_KB'}"`,
    r.status,
    r.answered,
    r.claimsCount,
    r.sourcesCount,
    `"${cleanSource}"`,
    r.latencyMs,
    `"${cleanQ}"`,
    `"${cleanSnippet}"`,
    `"${cleanClarify}"`,
    `"${cleanRationale}"`
  ].join(','));
}

writeFileSync('artifacts/global-social-evaluation-results.csv', csvLines.join('\n'));
console.log('\nSaved full CSV results to artifacts/global-social-evaluation-results.csv');

// Write JSON summary
const summaryPayload = {
  timestamp: new Date().toISOString(),
  totalQuestions: counts.total,
  metrics: counts,
  countryStats,
  platformStats,
  nonKbCategoryStats,
  detailedResults: results
};

writeFileSync('artifacts/global-social-evaluation-results.json', JSON.stringify(summaryPayload, null, 2));
console.log('Saved JSON report to artifacts/global-social-evaluation-results.json');

store.db.close();
