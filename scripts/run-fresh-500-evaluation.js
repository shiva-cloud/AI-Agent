// scripts/run-fresh-500-evaluation.js
import fs from 'node:fs';
import path from 'node:path';
import { openStore } from '../src/store.js';
import { answer } from '../src/engine.js';
import { fresh500SocialSuite } from './fresh-500-social-suite.js';

async function runEvaluation() {
  console.log(`Starting Fresh 500+ Social Media Evaluation...`);
  console.log(`Total questions loaded: ${fresh500SocialSuite.length}`);

  const store = openStore();
  const records = store.records();
  console.log(`Knowledge Base loaded: ${records.length} records available.`);

  const evalDate = new Date('2026-11-08T12:00:00Z');
  const results = [];

  const startTime = Date.now();
  let completed = 0;

  for (const q of fresh500SocialSuite) {
    const qStart = Date.now();
    let res;
    try {
      res = await answer({ question: q.question }, records, evalDate);
    } catch (err) {
      res = {
        status: 'error',
        claims: [],
        sources: [],
        gaps: [{ topic: q.topic, reason: err.message }],
        latencyMs: Date.now() - qStart
      };
    }
    const qDuration = Date.now() - qStart;

    results.push({
      id: q.id,
      country: q.country,
      city: q.city,
      platform: q.platform,
      repliesCount: q.socialEngagement.repliesCount,
      upvotesOrViews: q.socialEngagement.upvotesOrViews,
      activityLevel: q.socialEngagement.activityLevel,
      topic: q.topic,
      question: q.question,
      hasKbCoverage: q.hasKbCoverage,
      nonKbCategory: q.nonKbCategory,
      nonKbExplanation: q.nonKbExplanation,
      status: res.status,
      claimsCount: res.claims ? res.claims.length : 0,
      sourcesCount: res.sources ? res.sources.length : 0,
      gapsCount: res.gaps ? res.gaps.length : 0,
      gapReason: res.gaps && res.gaps.length > 0 ? res.gaps[0].reason : null,
      latencyMs: res.latencyMs || qDuration,
      disclaimer: Boolean(res.disclaimer)
    });

    completed++;
    if (completed % 100 === 0 || completed === fresh500SocialSuite.length) {
      console.log(`Evaluated ${completed}/${fresh500SocialSuite.length} questions (${Math.round((completed / fresh500SocialSuite.length) * 100)}%)...`);
    }
  }

  const totalTimeMs = Date.now() - startTime;
  console.log(`Evaluation complete in ${(totalTimeMs / 1000).toFixed(2)}s.`);

  // ── Metrics Aggregation ───────────────────────────────────────────────────
  const inKbResults = results.filter(r => r.hasKbCoverage);
  const nonKbResults = results.filter(r => !r.hasKbCoverage);

  const inKbStats = {
    total: inKbResults.length,
    guidance: inKbResults.filter(r => r.status === 'guidance').length,
    partial: inKbResults.filter(r => r.status === 'partial').length,
    clarification: inKbResults.filter(r => r.status === 'clarification').length,
    unavailable: inKbResults.filter(r => r.status === 'unavailable').length,
    error: inKbResults.filter(r => r.status === 'error').length,
    avgClaims: (inKbResults.reduce((acc, r) => acc + r.claimsCount, 0) / inKbResults.length).toFixed(2),
    avgSources: (inKbResults.reduce((acc, r) => acc + r.sourcesCount, 0) / inKbResults.length).toFixed(2),
    avgLatencyMs: Math.round(inKbResults.reduce((acc, r) => acc + r.latencyMs, 0) / inKbResults.length)
  };
  inKbStats.resolutionRate = (((inKbStats.guidance + inKbStats.partial) / inKbStats.total) * 100).toFixed(1);

  const nonKbStats = {
    total: nonKbResults.length,
    cleanAbstention: nonKbResults.filter(r => r.status === 'unavailable').length,
    partialOrGuidance: nonKbResults.filter(r => r.status === 'guidance' || r.status === 'partial').length,
    clarification: nonKbResults.filter(r => r.status === 'clarification').length,
    byCategory: {}
  };
  nonKbStats.abstentionRate = ((nonKbStats.cleanAbstention / nonKbStats.total) * 100).toFixed(1);

  for (const r of nonKbResults) {
    const cat = r.nonKbCategory || 'UNCATEGORIZED';
    if (!nonKbStats.byCategory[cat]) {
      nonKbStats.byCategory[cat] = { count: 0, abstained: 0, sampleReason: r.nonKbExplanation };
    }
    nonKbStats.byCategory[cat].count++;
    if (r.status === 'unavailable') nonKbStats.byCategory[cat].abstained++;
  }

  // Country Breakdown
  const countryBreakdown = {};
  for (const r of results) {
    const c = r.country || 'Out of Scope';
    if (!countryBreakdown[c]) {
      countryBreakdown[c] = {
        total: 0,
        inKb: 0,
        nonKb: 0,
        guidance: 0,
        partial: 0,
        clarification: 0,
        unavailable: 0,
        totalReplies: 0
      };
    }
    countryBreakdown[c].total++;
    countryBreakdown[c].totalReplies += (r.repliesCount || 0);
    if (r.hasKbCoverage) countryBreakdown[c].inKb++;
    else countryBreakdown[c].nonKb++;

    if (r.status === 'guidance') countryBreakdown[c].guidance++;
    else if (r.status === 'partial') countryBreakdown[c].partial++;
    else if (r.status === 'clarification') countryBreakdown[c].clarification++;
    else if (r.status === 'unavailable') countryBreakdown[c].unavailable++;
  }

  // Platform Breakdown
  const platformBreakdown = {};
  for (const r of results) {
    const plat = r.platform.split(' ')[0]; // Reddit, LinkedIn, Quora, Blind
    if (!platformBreakdown[plat]) {
      platformBreakdown[plat] = { count: 0, totalReplies: 0 };
    }
    platformBreakdown[plat].count++;
    platformBreakdown[plat].totalReplies += (r.repliesCount || 0);
  }

  const summary = {
    evaluatedAt: new Date().toISOString(),
    totalQuestions: results.length,
    totalTimeMs,
    inKbStats,
    nonKbStats,
    countryBreakdown,
    platformBreakdown
  };

  // Ensure artifacts directory exists
  const artifactsDir = path.join(process.cwd(), 'artifacts');
  fs.mkdirSync(artifactsDir, { recursive: true });

  // Save JSON
  const jsonPath = path.join(artifactsDir, 'fresh-500-evaluation-results.json');
  fs.writeFileSync(jsonPath, JSON.stringify({ summary, results }, null, 2), 'utf8');
  console.log(`Saved JSON results to ${jsonPath}`);

  // Save CSV
  const csvPath = path.join(artifactsDir, 'fresh-500-evaluation-results.csv');
  const csvHeaders = ['ID', 'Country', 'City', 'Platform', 'Replies', 'Topic', 'Question', 'HasKB', 'NonKBCat', 'Status', 'Claims', 'Sources', 'LatencyMs'];
  const csvRows = results.map(r => [
    r.id,
    `"${r.country}"`,
    `"${r.city || ''}"`,
    `"${r.platform}"`,
    r.repliesCount,
    `"${r.topic}"`,
    `"${r.question.replace(/"/g, '""')}"`,
    r.hasKbCoverage,
    `"${r.nonKbCategory || ''}"`,
    r.status,
    r.claimsCount,
    r.sourcesCount,
    r.latencyMs
  ].join(','));
  fs.writeFileSync(csvPath, [csvHeaders.join(','), ...csvRows].join('\n'), 'utf8');
  console.log(`Saved CSV results to ${csvPath}`);

  // Output console summary
  console.log('\n======================================================');
  console.log('         FRESH 500+ SOCIAL EVALUATION SUMMARY         ');
  console.log('======================================================');
  console.log(`Total Questions:          ${results.length} (100% Brand-New & Unique)`);
  console.log(`In-KB Questions:          ${inKbStats.total}`);
  console.log(`  - Guidance (Complete):  ${inKbStats.guidance} (${((inKbStats.guidance / inKbStats.total) * 100).toFixed(1)}%)`);
  console.log(`  - Partial:              ${inKbStats.partial} (${((inKbStats.partial / inKbStats.total) * 100).toFixed(1)}%)`);
  console.log(`  - Clarification:        ${inKbStats.clarification} (${((inKbStats.clarification / inKbStats.total) * 100).toFixed(1)}%)`);
  console.log(`  - Unavailable:          ${inKbStats.unavailable} (${((inKbStats.unavailable / inKbStats.total) * 100).toFixed(1)}%)`);
  console.log(`  - In-KB Resolution:     ${inKbStats.resolutionRate}%`);
  console.log(`  - Average Claims:       ${inKbStats.avgClaims}`);
  console.log(`  - Average Sources:      ${inKbStats.avgSources}`);
  console.log(`  - Average Latency:      ${inKbStats.avgLatencyMs}ms`);
  console.log(`------------------------------------------------------`);
  console.log(`Non-KB Questions:         ${nonKbStats.total}`);
  console.log(`  - Clean Abstention:     ${nonKbStats.cleanAbstention} (${nonKbStats.abstentionRate}%)`);
  console.log(`  - Partial / Guidance:   ${nonKbStats.partialOrGuidance}`);
  console.log(`------------------------------------------------------`);
  console.log('COUNTRY BREAKDOWN:');
  for (const [c, stats] of Object.entries(countryBreakdown)) {
    console.log(`  ${c.padEnd(22)}: Total ${stats.total.toString().padStart(3)} | In-KB ${stats.inKb.toString().padStart(3)} | Non-KB ${stats.nonKb.toString().padStart(2)} | Guidance ${stats.guidance.toString().padStart(3)} | Replies: ${stats.totalReplies}`);
  }
  console.log('======================================================\n');
}

runEvaluation().catch(err => {
  console.error('Evaluation failed:', err);
  process.exit(1);
});
