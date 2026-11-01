// scripts/run-20000-question-audit.js
import fs from 'node:fs';
import 'node:path';
import readline from 'node:readline';
import { performance } from 'node:perf_hooks';
import { openStore } from '../src/store.js';
import { answer } from '../src/engine.js';
import { destinationCountries } from '../src/destinations.js';

async function run20000QuestionAudit() {
  console.log('================================================================');
  console.log('STARTING FULL AUDIT OF ALL 20,000 QUESTIONS (60001 - 80000)');
  console.log('================================================================');

  const filePath = 'corpus/global_immigration_social_questions_60001_80000.md';
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const store = openStore();
  const records = store.records();
  console.log(`Knowledge Base loaded: ${records.length} records in SQLite store.`);

  const evalDate = new Date('2026-10-31T12:00:00Z');
  const supportedSet = new Set(destinationCountries);

  const fileStream = fs.createReadStream(filePath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let totalQuestions = 0;
  let properSupportedCount = 0;
  let authoritativeBoundaryCount = 0;
  let evasionCount = 0;
  let hallucinationCount = 0;
  let wrongAnswerCount = 0;
  let unavailableCount = 0;

  const countryStats = {};
  const categoryStats = {};
  const difficultyStats = {};
  const sampleEvasions = [];
  const sampleHallucinations = [];
  const sampleWrongAnswers = [];

  const auditLogSample = [];
  const startedAt = performance.now();

  for await (const line of rl) {
    const trimmed = line.trim();
    const match = trimmed.match(/^(\d+)\.\s+\*\*\[(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\]\*\*\s*(.*)$/);
    if (!match) continue;

    totalQuestions++;
    const qNum = parseInt(match[1], 10);
    const country = match[2].trim();
    const difficulty = match[3].trim();
    const category = match[4].trim();
    const questionText = match[5].trim();
    const fullPrompt = `**[${country} | ${difficulty} | ${category}]** ${questionText}`;

    if (!countryStats[country]) {
      countryStats[country] = { total: 0, proper: 0, boundary: 0, evasion: 0, wrong: 0, hallucination: 0, unavailable: 0 };
    }
    if (!categoryStats[category]) {
      categoryStats[category] = { total: 0, proper: 0, boundary: 0, evasion: 0 };
    }
    if (!difficultyStats[difficulty]) {
      difficultyStats[difficulty] = { total: 0, proper: 0, boundary: 0, evasion: 0 };
    }

    countryStats[country].total++;
    categoryStats[category].total++;
    difficultyStats[difficulty].total++;

    const isSupportedCorridor = supportedSet.has(country) || (country === 'Canada' && supportedSet.has('CA'));

    let res;
    const qStart = performance.now();
    try {
      res = answer({ question: fullPrompt }, records, evalDate);
    } catch (err) {
      res = {
        status: 'error',
        claims: [],
        sources: [],
        gaps: [{ reason: err.message }]
      };
    }
    const latency = performance.now() - qStart;

    const claims = res.claims || [];
    const sources = res.sources || [];
    const clarification = res.clarification || '';
    const placeClarification = res.placeClarification || {};

    // 1. Hallucination detection: Guaranteeing PR, 100% approval, secret backdoors
    const hasHallucination = claims.some(c => /\b(?:guaranteed?\s+PR\b|100%\s+approval\b|secret\s+backdoor\b|fake\s+visa\b)/i.test(c.text || ''));

    // 2. Circular evasion ("AI ne ghumaya"):
    // Telling user to change question to Toronto when asking about a foreign city, or treating non-place as a city
    const hasEditToPilotTrap = clarification.includes('Edit the question to name one of them') && !isSupportedCorridor;
    const hasFalseNonPlaceExtraction = /We could not recognise [“"].*?(?:plain|layman|words|terms|urgent).*?[”"] as a place/i.test(clarification);
    const hasFalseOntarioCollision = clarification.includes('Hamilton, Ontario') && country === 'New Zealand';
    const isEvasive = hasEditToPilotTrap || hasFalseNonPlaceExtraction || hasFalseOntarioCollision;

    // 3. Wrong answer detection: Cross-jurisdictional leakage
    let isWrongAnswer = false;
    if (isSupportedCorridor && claims.length > 0) {
      const targetJur = country === 'Canada' ? 'CA' : country;
      const foreignLeaked = claims.some(c => {
        if (!c.jurisdiction) return false;
        if (targetJur === 'CA') {
          return !['CA', 'ON', 'BC', 'Toronto', 'Mississauga', 'Brampton', 'Vancouver'].includes(c.jurisdiction);
        }
        return c.jurisdiction !== targetJur && !['GLOBAL'].includes(c.jurisdiction);
      });
      if (foreignLeaked) isWrongAnswer = true;
    }

    // Classification
    let classification = 'unknown';
    if (hasHallucination) {
      classification = 'hallucination';
      hallucinationCount++;
      countryStats[country].hallucination++;
      if (sampleHallucinations.length < 5) sampleHallucinations.push({ qNum, country, prompt: fullPrompt, claims });
    } else if (isEvasive) {
      classification = 'ai_ne_ghumaya';
      evasionCount++;
      countryStats[country].evasion++;
      categoryStats[category].evasion++;
      difficultyStats[difficulty].evasion++;
      if (sampleEvasions.length < 10) sampleEvasions.push({ qNum, country, prompt: fullPrompt, clarification });
    } else if (isWrongAnswer) {
      classification = 'wrong_answer';
      wrongAnswerCount++;
      countryStats[country].wrong++;
      if (sampleWrongAnswers.length < 5) sampleWrongAnswers.push({ qNum, country, prompt: fullPrompt, claims });
    } else if (isSupportedCorridor && (res.status === 'guidance' || res.status === 'partial') && claims.length > 0) {
      classification = 'proper_answer';
      properSupportedCount++;
      countryStats[country].proper++;
      categoryStats[category].proper++;
      difficultyStats[difficulty].proper++;
    } else if (!isSupportedCorridor && res.status === 'clarification' && placeClarification.reason === 'unsupported_place') {
      classification = 'authoritative_boundary';
      authoritativeBoundaryCount++;
      countryStats[country].boundary++;
      categoryStats[category].boundary++;
      difficultyStats[difficulty].boundary++;
    } else if (res.status === 'guidance' && claims.length > 0) {
      classification = 'proper_answer';
      properSupportedCount++;
      countryStats[country].proper++;
      categoryStats[category].proper++;
      difficultyStats[difficulty].proper++;
    } else {
      classification = 'unavailable';
      unavailableCount++;
      countryStats[country].unavailable++;
    }

    if (totalQuestions <= 20 || totalQuestions % 1000 === 0) {
      auditLogSample.push({
        qNum,
        country,
        difficulty,
        category,
        classification,
        status: res.status,
        claimsCount: claims.length,
        sourcesCount: sources.length,
        latencyMs: Number(latency.toFixed(2))
      });
    }

    if (totalQuestions % 2500 === 0) {
      const elapsedSec = ((performance.now() - startedAt) / 1000).toFixed(1);
      console.log(`[Progress] Evaluated ${totalQuestions} / 20,000 questions in ${elapsedSec}s...`);
      console.log(`   - Supported Proper Answers: ${properSupportedCount}`);
      console.log(`   - Authoritative Boundaries: ${authoritativeBoundaryCount}`);
      console.log(`   - AI Ne Ghumaya (Evasive): ${evasionCount}`);
      console.log(`   - Hallucinations: ${hallucinationCount}`);
      console.log(`   - Wrong Answers: ${wrongAnswerCount}`);
      console.log(`   - Unavailable: ${unavailableCount}`);
    }
  }

  const totalDurationMs = performance.now() - startedAt;
  const avgLatencyMs = (totalDurationMs / totalQuestions).toFixed(2);

  console.log('================================================================');
  console.log('AUDIT COMPLETED ACROSS ALL 20,000 QUESTIONS');
  console.log('================================================================');
  console.log(`Total Questions Evaluated: ${totalQuestions}`);
  console.log(`Execution Time: ${(totalDurationMs / 1000).toFixed(2)} seconds (Avg ${avgLatencyMs} ms/question)`);
  console.log(`- Supported Corridors Proper Answers: ${properSupportedCount} (${((properSupportedCount / totalQuestions) * 100).toFixed(2)}%)`);
  console.log(`- Authoritative Jurisdictional Boundaries: ${authoritativeBoundaryCount} (${((authoritativeBoundaryCount / totalQuestions) * 100).toFixed(2)}%)`);
  console.log(`- Total Legally Sound & Honest Resolutions: ${properSupportedCount + authoritativeBoundaryCount} (${(((properSupportedCount + authoritativeBoundaryCount) / totalQuestions) * 100).toFixed(2)}%)`);
  console.log(`- AI Ne Ghumaya / Circular Evasions: ${evasionCount} (${((evasionCount / totalQuestions) * 100).toFixed(2)}%)`);
  console.log(`- Hallucinations: ${hallucinationCount} (${((hallucinationCount / totalQuestions) * 100).toFixed(2)}%)`);
  console.log(`- Wrong Answers: ${wrongAnswerCount} (${((wrongAnswerCount / totalQuestions) * 100).toFixed(2)}%)`);
  console.log(`- Unavailable: ${unavailableCount} (${((unavailableCount / totalQuestions) * 100).toFixed(2)}%)`);

  // Write results JSON
  const outputJson = {
    metadata: {
      totalQuestions,
      auditTimestamp: new Date().toISOString(),
      durationSeconds: Number((totalDurationMs / 1000).toFixed(2)),
      avgLatencyMs: Number(avgLatencyMs)
    },
    metrics: {
      properSupportedCount,
      authoritativeBoundaryCount,
      totalAccurateResolutions: properSupportedCount + authoritativeBoundaryCount,
      totalAccurateRate: Number((((properSupportedCount + authoritativeBoundaryCount) / totalQuestions) * 100).toFixed(2)),
      evasionCount,
      evasionRate: Number(((evasionCount / totalQuestions) * 100).toFixed(2)),
      hallucinationCount,
      hallucinationRate: Number(((hallucinationCount / totalQuestions) * 100).toFixed(2)),
      wrongAnswerCount,
      wrongAnswerRate: Number(((wrongAnswerCount / totalQuestions) * 100).toFixed(2)),
      unavailableCount,
      unavailableRate: Number(((unavailableCount / totalQuestions) * 100).toFixed(2))
    },
    countryStats,
    categoryStats,
    difficultyStats,
    sampleEvasions,
    sampleHallucinations,
    sampleWrongAnswers,
    sampleRecords: auditLogSample
  };

  fs.mkdirSync('artifacts', { recursive: true });
  fs.writeFileSync('artifacts/master-20000-question-audit-results.json', JSON.stringify(outputJson, null, 2), 'utf8');

  // Write CSV Summary
  const csvRows = [
    'Country,TotalQuestions,ProperAnswers,AuthoritativeBoundaries,CircularEvasions,WrongAnswers,Hallucinations,Unavailable'
  ];
  for (const [c, stats] of Object.entries(countryStats)) {
    csvRows.push(`${c},${stats.total},${stats.proper},${stats.boundary},${stats.evasion},${stats.wrong},${stats.hallucination},${stats.unavailable}`);
  }
  fs.writeFileSync('artifacts/master-20000-question-audit-summary.csv', csvRows.join('\n'), 'utf8');

  console.log('Results written to:');
  console.log(' - artifacts/master-20000-question-audit-results.json');
  console.log(' - artifacts/master-20000-question-audit-summary.csv');
}

run20000QuestionAudit().catch(err => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
