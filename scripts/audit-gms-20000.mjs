import fs from 'node:fs';
import readline from 'node:readline';
import { performance } from 'node:perf_hooks';
import { openStore } from '../src/store.js';
import { answer } from '../src/engine.js';
import { destinationCountries } from '../src/destinations.js';

async function runGmsAudit() {
  console.log('================================================================');
  console.log('STARTING AUDIT OF global_immigration_settlement_20000_questions.md');
  console.log('================================================================');

  const filePath = 'corpus/global_immigration_settlement_20000_questions.md';
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
  let unavailableCount = 0;

  const countryStats = {};
  const categoryStats = {};
  const tierStats = {};

  const sampleEvasions = [];
  const sampleHallucinations = [];
  const sampleProper = [];
  const sampleUnavailable = [];

  let currentTier = 'Basic';
  const startedAt = performance.now();

  for await (const line of rl) {
    const trimmed = line.trim();
    if (trimmed.startsWith('## ')) {
      const tierMatch = trimmed.match(/^##\s+([A-Za-z]+)/);
      if (tierMatch) currentTier = tierMatch[1];
      continue;
    }

    const match = trimmed.match(/^-\s+\*\*([^*]+)\*\*\s+\[(.*?)\s*\|\s*(.*?)\]\s*(.*)$/);
    if (!match) continue;

    totalQuestions++;
    const qId = match[1].trim();
    const category = match[2].trim();
    const country = match[3].trim();
    const questionText = match[4].trim();

    if (!countryStats[country]) {
      countryStats[country] = { total: 0, proper: 0, boundary: 0, evasion: 0, hallucination: 0, unavailable: 0 };
    }
    if (!categoryStats[category]) {
      categoryStats[category] = { total: 0, proper: 0, boundary: 0, evasion: 0, unavailable: 0 };
    }
    if (!tierStats[currentTier]) {
      tierStats[currentTier] = { total: 0, proper: 0, boundary: 0, evasion: 0, unavailable: 0 };
    }

    countryStats[country].total++;
    categoryStats[category].total++;
    tierStats[currentTier].total++;

    let res;
    try {
      res = answer({ question: questionText, country, gmsId: qId }, records, evalDate);
    } catch (err) {
      res = {
        status: 'error',
        claims: [],
        sources: [],
        gaps: [{ reason: err.message }]
      };
    }

    const claims = res.claims || [];
    const sources = res.sources || [];
    const clarification = res.clarification || '';

    // 1. Hallucination check
    const hasHallucination = claims.some(c => /\b(?:guaranteed?\s+PR\b|100%\s+approval\b|secret\s+backdoor\b|fake\s+visa\b)/i.test(c.text || ''));
    if (hasHallucination) {
      hallucinationCount++;
      countryStats[country].hallucination++;
      if (sampleHallucinations.length < 5) {
        sampleHallucinations.push({ id: qId, country, q: questionText, claim: claims[0]?.text });
      }
    }

    // 2. Circular evasion check ("AI ne ghumaya"):
    // Asking for Canadian pilot cities (Toronto, Mississauga, Brampton, Vancouver) when the query is clearly for another country
    const hasEvasion = country !== 'Canada' && (
      clarification.includes('Choose a city so we can look for local guidance: Toronto, Mississauga, Brampton, Vancouver') ||
      clarification.includes('We cover Toronto, Mississauga, Brampton and Vancouver')
    );

    if (hasEvasion) {
      evasionCount++;
      countryStats[country].evasion++;
      categoryStats[category].evasion++;
      tierStats[currentTier].evasion++;
      if (sampleEvasions.length < 5) {
        sampleEvasions.push({ id: qId, country, q: questionText, clarification });
      }
    } else if (res.status === 'guidance' && claims.length > 0 && sources.length > 0) {
      properSupportedCount++;
      countryStats[country].proper++;
      categoryStats[category].proper++;
      tierStats[currentTier].proper++;
      if (sampleProper.length < 5) {
        sampleProper.push({ id: qId, country, category, q: questionText, claim: claims[0]?.text?.slice(0, 100), source: sources[0]?.title });
      }
    } else if (res.status === 'clarification' || res.placeClarification || clarification) {
      authoritativeBoundaryCount++;
      countryStats[country].boundary++;
      categoryStats[category].boundary++;
      tierStats[currentTier].boundary++;
    } else {
      unavailableCount++;
      countryStats[country].unavailable++;
      categoryStats[category].unavailable++;
      tierStats[currentTier].unavailable++;
      if (sampleUnavailable.length < 5) {
        sampleUnavailable.push({ id: qId, country, category, q: questionText, reason: res.gaps?.[0]?.reason || 'No claims matched' });
      }
    }

    if (totalQuestions % 1000 === 0) {
      const elapsed = ((performance.now() - startedAt) / 1000).toFixed(1);
      console.log(`[PROGRESS] Processed ${totalQuestions} / 20,000 questions (${elapsed}s)... Proper: ${properSupportedCount}, Boundary: ${authoritativeBoundaryCount}, Evasion: ${evasionCount}, Unavailable: ${unavailableCount}`);
    }
  }

  const durationSec = ((performance.now() - startedAt) / 1000).toFixed(2);
  console.log('\n================================================================');
  console.log(`AUDIT COMPLETE: 20,000 QUESTIONS IN ${durationSec}s`);
  console.log('================================================================');
  console.log(`Total Questions:               ${totalQuestions}`);
  console.log(`1. Proper & Sateek Guidance:   ${properSupportedCount} (${(properSupportedCount/totalQuestions*100).toFixed(2)}%)`);
  console.log(`2. Boundary & Clarification:   ${authoritativeBoundaryCount} (${(authoritativeBoundaryCount/totalQuestions*100).toFixed(2)}%)`);
  console.log(`3. Circular Evasions (AI Ghuma): ${evasionCount} (${(evasionCount/totalQuestions*100).toFixed(2)}%)`);
  console.log(`4. Hallucinations:             ${hallucinationCount} (${(hallucinationCount/totalQuestions*100).toFixed(2)}%)`);
  console.log(`5. Unavailable / Open Gaps:    ${unavailableCount} (${(unavailableCount/totalQuestions*100).toFixed(2)}%)`);

  console.log('\n--- BY DIFFICULTY TIER ---');
  console.table(tierStats);

  console.log('\n--- BY COUNTRY ---');
  console.table(countryStats);

  // Write full audit result to JSON
  const auditReport = {
    auditedAt: new Date().toISOString(),
    totalQuestions,
    durationSeconds: parseFloat(durationSec),
    summary: {
      properSupported: properSupportedCount,
      properSupportedPct: (properSupportedCount/totalQuestions*100).toFixed(2) + '%',
      authoritativeBoundary: authoritativeBoundaryCount,
      authoritativeBoundaryPct: (authoritativeBoundaryCount/totalQuestions*100).toFixed(2) + '%',
      evasion: evasionCount,
      evasionPct: (evasionCount/totalQuestions*100).toFixed(2) + '%',
      hallucination: hallucinationCount,
      hallucinationPct: (hallucinationCount/totalQuestions*100).toFixed(2) + '%',
      unavailable: unavailableCount,
      unavailablePct: (unavailableCount/totalQuestions*100).toFixed(2) + '%'
    },
    tierStats,
    countryStats,
    sampleProper,
    sampleEvasions,
    sampleHallucinations,
    sampleUnavailable
  };

  fs.writeFileSync('artifacts/gms-20000-audit-report.json', JSON.stringify(auditReport, null, 2), 'utf8');
  console.log('Saved audit report to artifacts/gms-20000-audit-report.json');
}

runGmsAudit();
