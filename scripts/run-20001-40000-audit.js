// scripts/run-20001-40000-audit.js
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { performance } from 'node:perf_hooks';
import { openStore } from '../src/store.js';
import { answer } from '../src/engine.js';
import { destinationCountries } from '../src/destinations.js';

// Prevent batch evaluation from polluting persistent gap work items
process.env.DISABLE_GAP_RECORDING = '1';

export async function run20001Audit(options = {}) {
  const limit = options.limit || Infinity;
  console.log('================================================================');
  console.log(`STARTING AUDIT OF QUESTIONS 20,001–40,000 (Limit: ${limit === Infinity ? 'Full 20,000' : limit})`);
  console.log('================================================================');

  const filePath = 'corpus/global_immigration_settlement_questions_20001_40000.md';
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
  const sectionStats = {};
  const sampleEvasions = [];
  const sampleHallucinations = [];
  const sampleWrongAnswers = [];
  const sampleUnavailables = [];
  const sampleProper = [];
  const sampleBoundaries = [];

  let currentSection = 'Unknown';
  const startedAt = performance.now();

  for await (const line of rl) {
    const secMatch = line.match(/^##\s+(.*?)(?:\s+—|\s*$)/);
    if (secMatch) {
      currentSection = secMatch[1].trim();
      continue;
    }

    const match = line.match(/^-\s+\*\*(GMS-Q\d+)\*\*\s+\[(.*?)\s*\|\s*(.*?)\]\s+(.*)$/);
    if (!match) continue;

    totalQuestions++;
    if (totalQuestions > limit) break;

    const qId = match[1].trim();
    const category = match[2].trim();
    const rawCountry = match[3].trim();
    const questionText = match[4].trim();

    // Map rawCountry to country key for stats
    let countryKey = rawCountry;
    if (rawCountry === 'European Union') {
      const euSub = questionText.match(/\bin\s+([A-Za-z\s]+?)\s*\/\s*([A-Za-z\s]+?),\s*European Union/i);
      if (euSub) {
        countryKey = `EU: ${euSub[1].trim()}`;
      } else {
        countryKey = 'European Union';
      }
    }

    if (!countryStats[countryKey]) {
      countryStats[countryKey] = { total: 0, proper: 0, boundary: 0, evasion: 0, wrong: 0, hallucination: 0, unavailable: 0 };
    }
    if (!categoryStats[category]) {
      categoryStats[category] = { total: 0, proper: 0, boundary: 0, evasion: 0, unavailable: 0 };
    }
    if (!sectionStats[currentSection]) {
      sectionStats[currentSection] = { total: 0, proper: 0, boundary: 0, evasion: 0, unavailable: 0 };
    }

    countryStats[countryKey].total++;
    categoryStats[category].total++;
    sectionStats[currentSection].total++;

    const isSupportedCorridor = supportedSet.has(rawCountry) || (rawCountry === 'Canada' && supportedSet.has('CA')) ||
      (rawCountry === 'European Union' && (countryKey.includes('France') || countryKey.includes('Netherlands') || countryKey.includes('Spain') || countryKey.includes('Ireland') || countryKey.includes('Germany')));

    let res;
    const qStart = performance.now();
    try {
      res = answer({ question: line.replace(/^-\s+/, '') }, records, evalDate);
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

    // 2. Circular evasion ("AI ने घुमाया"):
    const hasEditToPilotTrap = clarification.includes('Edit the question to name one of them') && !isSupportedCorridor;
    const hasFalseNonPlaceExtraction = /We could not recognise [“"].*?(?:plain|layman|words|terms|urgent).*?[”"] as a place/i.test(clarification);
    const hasFalseOntarioCollision = clarification.includes('Hamilton, Ontario') && questionText.includes('New Zealand');
    const isEvasive = hasEditToPilotTrap || hasFalseNonPlaceExtraction || hasFalseOntarioCollision;

    // 3. Wrong answer detection: Cross-jurisdictional leakage
    let isWrongAnswer = false;
    if (claims.length > 0) {
      let targetJur = rawCountry === 'Canada' ? 'CA' : rawCountry;
      if (rawCountry === 'European Union') {
        if (countryKey.includes('France')) targetJur = 'France';
        else if (countryKey.includes('Netherlands')) targetJur = 'Netherlands';
        else if (countryKey.includes('Spain')) targetJur = 'Spain';
        else if (countryKey.includes('Ireland')) targetJur = 'Ireland';
        else if (countryKey.includes('Germany')) targetJur = 'Germany';
      }

      if (targetJur && targetJur !== 'European Union') {
        const foreignLeaked = claims.some(c => {
          if (!c.jurisdiction) return false;
          if (targetJur === 'CA') {
            return !['CA', 'ON', 'BC', 'Toronto', 'Mississauga', 'Brampton', 'Vancouver'].includes(c.jurisdiction);
          }
          return c.jurisdiction !== targetJur && !['GLOBAL'].includes(c.jurisdiction);
        });
        if (foreignLeaked) isWrongAnswer = true;
      }
    }

    // 4. Classification
    let classification = 'unknown';
    if (hasHallucination) {
      classification = 'hallucination';
      hallucinationCount++;
      countryStats[countryKey].hallucination++;
      if (sampleHallucinations.length < 5) sampleHallucinations.push({ qId, country: countryKey, text: questionText, claims });
    } else if (isEvasive) {
      classification = 'ai_ne_ghumaya';
      evasionCount++;
      countryStats[countryKey].evasion++;
      categoryStats[category].evasion++;
      sectionStats[currentSection].evasion++;
      if (sampleEvasions.length < 5) sampleEvasions.push({ qId, country: countryKey, text: questionText, clarification });
    } else if (isWrongAnswer) {
      classification = 'wrong_answer';
      wrongAnswerCount++;
      countryStats[countryKey].wrong++;
      if (sampleWrongAnswers.length < 5) sampleWrongAnswers.push({ qId, country: countryKey, text: questionText, claims });
    } else if ((res.status === 'guidance' || res.status === 'partial') && claims.length > 0) {
      classification = 'proper_answer';
      properSupportedCount++;
      countryStats[countryKey].proper++;
      categoryStats[category].proper++;
      sectionStats[currentSection].proper++;
      if (sampleProper.length < 5) sampleProper.push({ qId, country: countryKey, cat: category, claimsCount: claims.length, title: claims[0]?.title });
    } else if (res.status === 'clarification' && (placeClarification.reason === 'unsupported_place' || res.clarification?.includes('does not cover that place yet') || res.clarification?.includes('outside our verified municipal settlement dataset'))) {
      classification = 'authoritative_boundary';
      authoritativeBoundaryCount++;
      countryStats[countryKey].boundary++;
      categoryStats[category].boundary++;
      sectionStats[currentSection].boundary++;
      if (sampleBoundaries.length < 5) sampleBoundaries.push({ qId, country: countryKey, cat: category, clarification: res.clarification?.substring(0, 100) });
    } else {
      classification = 'unavailable';
      unavailableCount++;
      countryStats[countryKey].unavailable++;
      categoryStats[category].unavailable++;
      sectionStats[currentSection].unavailable++;
      if (sampleUnavailables.length < 15) sampleUnavailables.push({ qId, country: countryKey, cat: category, text: questionText.substring(0, 100), status: res.status, clarification: res.clarification?.substring(0, 80) });
    }

    if (totalQuestions % 2500 === 0) {
      const elapsedSec = ((performance.now() - startedAt) / 1000).toFixed(1);
      console.log(`[Progress] Evaluated ${totalQuestions} questions in ${elapsedSec}s... (Proper: ${properSupportedCount}, Boundary: ${authoritativeBoundaryCount}, Unavailable: ${unavailableCount})`);
    }
  }

  const durationSec = Number(((performance.now() - startedAt) / 1000).toFixed(2));
  console.log('================================================================');
  console.log(`AUDIT COMPLETE: ${totalQuestions} questions processed in ${durationSec}s`);
  console.log(`Proper Answers: ${properSupportedCount} (${((properSupportedCount / totalQuestions) * 100).toFixed(2)}%)`);
  console.log(`Authoritative Boundaries: ${authoritativeBoundaryCount} (${((authoritativeBoundaryCount / totalQuestions) * 100).toFixed(2)}%)`);
  console.log(`Circular Evasions: ${evasionCount} (${((evasionCount / totalQuestions) * 100).toFixed(2)}%)`);
  console.log(`Wrong Answers: ${wrongAnswerCount} (${((wrongAnswerCount / totalQuestions) * 100).toFixed(2)}%)`);
  console.log(`Hallucinations: ${hallucinationCount} (${((hallucinationCount / totalQuestions) * 100).toFixed(2)}%)`);
  console.log(`Unavailable: ${unavailableCount} (${((unavailableCount / totalQuestions) * 100).toFixed(2)}%)`);
  console.log('================================================================');

  const report = {
    metadata: {
      corpus: 'corpus/global_immigration_settlement_questions_20001_40000.md',
      totalQuestions,
      durationSec,
      avgLatencyMs: Number((durationSec * 1000 / totalQuestions).toFixed(2)),
      evaluatedAt: new Date().toISOString()
    },
    metrics: {
      properAnswers: properSupportedCount,
      properAnswersPct: Number(((properSupportedCount / totalQuestions) * 100).toFixed(2)),
      authoritativeBoundaries: authoritativeBoundaryCount,
      authoritativeBoundariesPct: Number(((authoritativeBoundaryCount / totalQuestions) * 100).toFixed(2)),
      totalLegallySound: properSupportedCount + authoritativeBoundaryCount,
      totalLegallySoundPct: Number((((properSupportedCount + authoritativeBoundaryCount) / totalQuestions) * 100).toFixed(2)),
      circularEvasions: evasionCount,
      circularEvasionsPct: Number(((evasionCount / totalQuestions) * 100).toFixed(2)),
      wrongAnswers: wrongAnswerCount,
      wrongAnswersPct: Number(((wrongAnswerCount / totalQuestions) * 100).toFixed(2)),
      hallucinations: hallucinationCount,
      hallucinationsPct: Number(((hallucinationCount / totalQuestions) * 100).toFixed(2)),
      unavailable: unavailableCount,
      unavailablePct: Number(((unavailableCount / totalQuestions) * 100).toFixed(2))
    },
    sectionsBreakdown: sectionStats,
    categoriesBreakdown: categoryStats,
    countriesBreakdown: countryStats,
    samples: {
      proper: sampleProper,
      boundaries: sampleBoundaries,
      evasions: sampleEvasions,
      wrongAnswers: sampleWrongAnswers,
      hallucinations: sampleHallucinations,
      unavailables: sampleUnavailables
    }
  };

  fs.writeFileSync('artifacts/audit-20001-40000-results.json', JSON.stringify(report, null, 2), 'utf8');

  // Generate CSV
  let csv = 'Jurisdiction,TotalQuestions,ProperAnswers,AuthoritativeBoundaries,CircularEvasions,WrongAnswers,Hallucinations,Unavailable,ResolutionPct\n';
  for (const [k, v] of Object.entries(countryStats)) {
    const resPct = (((v.proper + v.boundary) / v.total) * 100).toFixed(2);
    csv += `"${k}",${v.total},${v.proper},${v.boundary},${v.evasion},${v.wrong},${v.hallucination},${v.unavailable},${resPct}%\n`;
  }
  fs.writeFileSync('artifacts/audit-20001-40000-summary.csv', csv, 'utf8');
  console.log('Saved artifacts: artifacts/audit-20001-40000-results.json and artifacts/audit-20001-40000-summary.csv');
  return report;
}

if (process.argv[1]?.endsWith('run-20001-40000-audit.js')) {
  const limitArg = process.argv.find(a => a.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : Infinity;
  run20001Audit({ limit }).catch(err => {
    console.error('Audit execution error:', err);
    process.exit(1);
  });
}
