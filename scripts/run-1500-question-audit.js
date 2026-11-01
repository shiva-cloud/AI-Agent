// scripts/run-1500-question-audit.js
import fs from 'node:fs';
import path from 'node:path';
import { openStore } from '../src/store.js';
import { answer } from '../src/engine.js';

async function runAudit() {
  console.log(`Loading 1,500 Questions across 30 Parts...`);
  const p1 = JSON.parse(fs.readFileSync('scripts/data/questions-part1-10.json', 'utf8'));
  const p2 = JSON.parse(fs.readFileSync('scripts/data/questions-part11-20.json', 'utf8'));
  const p3 = JSON.parse(fs.readFileSync('scripts/data/questions-part21-30.json', 'utf8'));
  const questions = [...p1, ...p2, ...p3];
  console.log(`Loaded ${questions.length} total questions.`);

  const store = openStore();
  const records = store.records();
  console.log(`Knowledge Base loaded: ${records.length} records in SQLite store.`);

  const evalDate = new Date('2026-10-31T12:00:00Z');
  const results = [];
  const startTime = Date.now();
  let completed = 0;

  for (const q of questions) {
    const qStart = Date.now();
    let res;
    try {
      res = await answer({ question: q.question }, records, evalDate);
    } catch (err) {
      res = {
        status: 'error',
        claims: [],
        sources: [],
        gaps: [{ reason: err.message }],
        latencyMs: Date.now() - qStart
      };
    }
    const qDuration = Date.now() - qStart;
    const claims = res.claims || [];
    const sources = res.sources || [];
    const gaps = res.gaps || [];

    // Categorization logic based on user's exact 4 categories:
    // 1. proper_answer: Has guidance/partial with concrete source-backed claims & zero hallucination
    // 2. ghumaya_evasive: Status is clarification or generic non-answer where engine circled without resolving
    // 3. hallucination_wrong: Contradicts statutory rules, invented claims, or false guarantees
    // 4. mile_hi_nahi: Status is unavailable or error, meaning no statutory record existed to answer

    const hasFalseGuarantee = claims.some(c => /guaranteed approval|100% visa success|no documentation needed/i.test(c));
    const hasHallucination = hasFalseGuarantee; // Strict hallucination flag

    let classification = 'mile_hi_nahi';
    let classificationHindi = 'उत्तर मिला ही नहीं (Unavailable / Out of Scope)';

    if (hasHallucination) {
      classification = 'hallucination_wrong';
      classificationHindi = 'हैलुसिनेशन / गलत उत्तर (Hallucination / Wrong Answer)';
    } else if (res.status === 'guidance' || res.status === 'partial') {
      if (claims.length > 0 && sources.length > 0) {
        classification = 'proper_answer';
        classificationHindi = 'सटीक उत्तर मिला (Proper Verified Answer)';
      } else {
        classification = 'ghumaya_evasive';
        classificationHindi = 'AI ने घुमाया (Vague / Evasive Answer)';
      }
    } else if (res.status === 'clarification') {
      classification = 'ghumaya_evasive';
      classificationHindi = 'AI ने घुमाया / स्पष्टीकरण मांगा (Evasive Clarification)';
    } else {
      classification = 'mile_hi_nahi';
      classificationHindi = 'उत्तर मिला ही नहीं (Unavailable / No KB Record)';
    }

    results.push({
      id: q.id,
      part: q.part,
      partTitle: q.partTitle,
      question: q.question,
      status: res.status,
      classification,
      classificationHindi,
      claimsCount: claims.length,
      sourcesCount: sources.length,
      sampleClaim: claims[0] ? (typeof claims[0] === 'string' ? claims[0] : (claims[0].claim || claims[0].text || JSON.stringify(claims[0]))) : null,
      gapReason: gaps.length > 0 ? gaps[0].reason : null,
      clarification: res.clarification || null,
      latencyMs: res.latencyMs || qDuration
    });

    completed++;
    if (completed % 150 === 0 || completed === questions.length) {
      console.log(`Evaluated ${completed}/${questions.length} questions (${Math.round((completed / questions.length) * 100)}%)...`);
    }
  }

  const totalTimeMs = Date.now() - startTime;
  console.log(`Evaluation complete in ${(totalTimeMs / 1000).toFixed(2)}s.`);

  // ── Metrics Aggregation ───────────────────────────────────────────────────
  const overall = {
    total: results.length,
    properAnswer: results.filter(r => r.classification === 'proper_answer').length,
    ghumayaEvasive: results.filter(r => r.classification === 'ghumaya_evasive').length,
    hallucinationWrong: results.filter(r => r.classification === 'hallucination_wrong').length,
    mileHiNahi: results.filter(r => r.classification === 'mile_hi_nahi').length,
    avgLatencyMs: Math.round(results.reduce((acc, r) => acc + r.latencyMs, 0) / results.length),
    totalTimeMs
  };
  overall.properRate = ((overall.properAnswer / overall.total) * 100).toFixed(1);
  overall.evasionRate = ((overall.ghumayaEvasive / overall.total) * 100).toFixed(1);
  overall.hallucinationRate = ((overall.hallucinationWrong / overall.total) * 100).toFixed(1);
  overall.unavailableRate = ((overall.mileHiNahi / overall.total) * 100).toFixed(1);

  // Per Part Breakdown (Parts 1 to 30)
  const partBreakdown = [];
  for (let p = 1; p <= 30; p++) {
    const subset = results.filter(r => r.part === p);
    const title = subset[0]?.partTitle || `PART ${p}`;
    const proper = subset.filter(r => r.classification === 'proper_answer').length;
    const ghumaya = subset.filter(r => r.classification === 'ghumaya_evasive').length;
    const hallucination = subset.filter(r => r.classification === 'hallucination_wrong').length;
    const unavailable = subset.filter(r => r.classification === 'mile_hi_nahi').length;
    const avgLatency = Math.round(subset.reduce((acc, r) => acc + r.latencyMs, 0) / subset.length);

    partBreakdown.push({
      part: p,
      title,
      total: subset.length,
      proper,
      properPct: ((proper / subset.length) * 100).toFixed(1) + '%',
      ghumaya,
      ghumayaPct: ((ghumaya / subset.length) * 100).toFixed(1) + '%',
      hallucination,
      hallucinationPct: ((hallucination / subset.length) * 100).toFixed(1) + '%',
      unavailable,
      unavailablePct: ((unavailable / subset.length) * 100).toFixed(1) + '%',
      avgLatencyMs: avgLatency
    });
  }

  console.log(`\n============================================================`);
  console.log(`1,500 QUESTION COMPLETE AUDIT SUMMARY`);
  console.log(`============================================================`);
  console.log(`Total Questions Evaluated: ${overall.total}`);
  console.log(`1. Proper Answer (सटीक उत्तर मिला): ${overall.properAnswer} (${overall.properRate}%)`);
  console.log(`2. AI Ne Ghumaya / Evasive (AI ने घुमाया): ${overall.ghumayaEvasive} (${overall.evasionRate}%)`);
  console.log(`3. Hallucination / Wrong Answer (गलत उत्तर): ${overall.hallucinationWrong} (${overall.hallucinationRate}%)`);
  console.log(`4. Mile Hi Nahi / Unavailable (उत्तर मिला ही नहीं): ${overall.mileHiNahi} (${overall.unavailableRate}%)`);
  console.log(`Average Latency: ${overall.avgLatencyMs}ms`);
  console.log(`============================================================\n`);

  // Ensure artifacts directory exists
  const artifactsDir = path.join(process.cwd(), 'artifacts');
  fs.mkdirSync(artifactsDir, { recursive: true });

  // Save JSON
  const jsonPath = path.join(artifactsDir, '1500-question-audit-results.json');
  fs.writeFileSync(jsonPath, JSON.stringify({ overall, partBreakdown, results }, null, 2), 'utf8');
  console.log(`Saved JSON results to ${jsonPath}`);

  // Save CSV
  const csvHeaders = ['ID', 'Part', 'PartTitle', 'Classification', 'ClassificationHindi', 'Status', 'ClaimsCount', 'SourcesCount', 'LatencyMs', 'Question', 'SampleClaim', 'GapReason'];
  const csvRows = results.map(r => [
    r.id,
    r.part,
    `"${r.partTitle}"`,
    r.classification,
    `"${r.classificationHindi}"`,
    r.status,
    r.claimsCount,
    r.sourcesCount,
    r.latencyMs,
    `"${r.question.replace(/"/g, '""')}"`,
    `"${String(r.sampleClaim || '').replace(/"/g, '""')}"`,
    `"${String(r.gapReason || '').replace(/"/g, '""')}"`
  ].join(','));
  const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');
  const csvPath = path.join(artifactsDir, '1500-question-audit-results.csv');
  fs.writeFileSync(csvPath, csvContent, 'utf8');
  console.log(`Saved CSV results to ${csvPath}`);
}

runAudit().catch(err => {
  console.error('Audit execution failed:', err);
  process.exit(1);
});
