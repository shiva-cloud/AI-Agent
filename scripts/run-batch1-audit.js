// scripts/run-batch1-audit.js
import fs from 'node:fs';
import path from 'node:path';
import { openStore } from '../src/store.js';
import { answer } from '../src/engine.js';

async function runBatch1Audit() {
  console.log(`Loading Batch 1: Questions 1501–1700 across 10 Sections (A–J)...`);
  const questions = JSON.parse(fs.readFileSync('scripts/data/questions-1501-1700.json', 'utf8'));
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

    const hasFalseGuarantee = claims.some(c => /guaranteed approval|100% visa success|no documentation needed/i.test(c.text || ''));
    const hasHallucination = hasFalseGuarantee;

    let classification = 'proper_answer';
    let issueReason = null;

    if (hasHallucination) {
      classification = 'hallucination_wrong';
      issueReason = 'Fabricated statutory rule or unsupported legal promise';
    } else if (res.status === 'clarification' || (res.clarification && !claims.length)) {
      classification = 'ghumaya_evasive';
      issueReason = res.clarification || 'AI evaded with clarification without answering';
    } else if (res.status === 'unavailable' || res.status === 'error' || claims.length === 0) {
      classification = 'mile_hi_nahi';
      issueReason = gaps.map(g => g.reason || g.code).join(', ') || 'No statutory evidence available';
    } else {
      classification = 'proper_answer';
    }

    results.push({
      id: q.id,
      part: q.part,
      section: q.section,
      question: q.question,
      status: res.status,
      classification,
      issueReason,
      matchedRecordsCount: sources.length,
      claimsCount: claims.length,
      sampleClaim: claims[0]?.text || null,
      topCitation: sources[0]?.id || null,
      topCitationTitle: sources[0]?.title || null,
      latencyMs: qDuration,
      actualReply: claims.map(c => c.text).join(' ') || res.clarification || res.message
    });

    completed++;
    if (completed % 50 === 0 || completed === questions.length) {
      console.log(`Evaluated ${completed}/${questions.length} questions (${Math.round(completed/questions.length*100)}%)...`);
    }
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`Evaluation complete in ${durationSec}s.\n`);

  const proper = results.filter(r => r.classification === 'proper_answer');
  const ghumaya = results.filter(r => r.classification === 'ghumaya_evasive');
  const hallucination = results.filter(r => r.classification === 'hallucination_wrong');
  const mileHiNahi = results.filter(r => r.classification === 'mile_hi_nahi');

  console.log(`============================================================`);
  console.log(`BATCH 1 (1501–1700) AUDIT SUMMARY`);
  console.log(`============================================================`);
  console.log(`Total Questions Evaluated: ${questions.length}`);
  console.log(`1. Proper Answer (सटीक उत्तर मिला): ${proper.length} (${(proper.length/questions.length*100).toFixed(1)}%)`);
  console.log(`2. AI Ne Ghumaya / Evasive (AI ने घुमाया): ${ghumaya.length} (${(ghumaya.length/questions.length*100).toFixed(1)}%)`);
  console.log(`3. Hallucination / Wrong Answer (गलत उत्तर): ${hallucination.length} (${(hallucination.length/questions.length*100).toFixed(1)}%)`);
  console.log(`4. Mile Hi Nahi / Unavailable (उत्तर मिला ही नहीं): ${mileHiNahi.length} (${(mileHiNahi.length/questions.length*100).toFixed(1)}%)`);
  const avgLatency = Math.round(results.reduce((acc, r) => acc + r.latencyMs, 0) / results.length);
  console.log(`Average Latency: ${avgLatency}ms`);
  console.log(`============================================================\n`);

  const artifactsDir = path.resolve('artifacts');
  if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir, { recursive: true });

  const jsonOut = path.join(artifactsDir, 'batch1-1501-1700-audit-results.json');
  fs.writeFileSync(jsonOut, JSON.stringify({
    summary: {
      total: questions.length,
      properCount: proper.length,
      properPercent: (proper.length/questions.length*100).toFixed(1),
      ghumayaCount: ghumaya.length,
      ghumayaPercent: (ghumaya.length/questions.length*100).toFixed(1),
      hallucinationCount: hallucination.length,
      hallucinationPercent: (hallucination.length/questions.length*100).toFixed(1),
      mileHiNahiCount: mileHiNahi.length,
      mileHiNahiPercent: (mileHiNahi.length/questions.length*100).toFixed(1),
      averageLatencyMs: avgLatency
    },
    results
  }, null, 2));
  console.log(`Saved JSON results to ${jsonOut}`);

  const csvOut = path.join(artifactsDir, 'batch1-1501-1700-audit-results.csv');
  const headers = ['id', 'part', 'section', 'question', 'status', 'classification', 'issueReason', 'claimsCount', 'topCitation', 'latencyMs'];
  const csvRows = [headers.join(',')];
  for (const r of results) {
    const row = [
      r.id,
      r.part,
      `"${(r.section || '').replace(/"/g, '""')}"`,
      `"${(r.question || '').replace(/"/g, '""')}"`,
      r.status,
      r.classification,
      `"${(r.issueReason || '').replace(/"/g, '""')}"`,
      r.claimsCount,
      r.topCitation || 'none',
      r.latencyMs
    ];
    csvRows.push(row.join(','));
  }
  fs.writeFileSync(csvOut, csvRows.join('\n'));
  console.log(`Saved CSV results to ${csvOut}`);
}

runBatch1Audit().catch(err => {
  console.error('Fatal audit error:', err);
  process.exit(1);
});
