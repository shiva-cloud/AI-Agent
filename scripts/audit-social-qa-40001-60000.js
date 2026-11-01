import fs from 'node:fs';
import { answer } from '../src/engine.js';
import { openStore } from '../src/store.js';
import { destinationCountries } from '../src/destinations.js';

const store = openStore('data/settlement.sqlite');
const records = store.records();

const content = fs.readFileSync('corpus/global_immigration_social_questions_40001_60000.md', 'utf8');
const lines = content.split('\n').filter(l => /^\d+\.\s+\*\*\[/.test(l));

console.log(`Loaded ${lines.length} questions from corpus/global_immigration_social_questions_40001_60000.md`);

const supportedSet = new Set(destinationCountries);
supportedSet.add('Canada');
supportedSet.add('CA');

const urgencyPatterns = [
  /agent stopped responding/i,
  /threatening me/i,
  /threatened/i,
  /pay cash without a receipt/i,
  /missed an important deadline/i,
  /passport retained by recruiter/i,
  /passport expires soon/i,
  /permit expiry while appeal pending/i,
  /without regular status/i,
  /afraid of losing my job/i,
  /urgent assistance/i
];

const results = {
  total: lines.length,
  durationMs: 0,
  metrics: {
    properGroundedAnswers: 0,
    preciseStatutoryAnswers: 0,
    wrongAnswers_jurisdictionLeaks: 0,
    hallucinationTraps: 0,
    aiEvasions: 0,
    scopeBoundaries_honestRejection: 0,
    unavailable_noEvidence: 0
  },
  byBatch: {
    'Basic (40001-44000)': { total: 0, proper: 0, wrong: 0, hallucination: 0, evasion: 0, scopeRejection: 0, unavailable: 0 },
    'Intermediate (44001-48000)': { total: 0, proper: 0, wrong: 0, hallucination: 0, evasion: 0, scopeRejection: 0, unavailable: 0 },
    'Advanced (48001-52000)': { total: 0, proper: 0, wrong: 0, hallucination: 0, evasion: 0, scopeRejection: 0, unavailable: 0 },
    'Expert (52001-56000)': { total: 0, proper: 0, wrong: 0, hallucination: 0, evasion: 0, scopeRejection: 0, unavailable: 0 },
    'Extreme (56001-60000)': { total: 0, proper: 0, wrong: 0, hallucination: 0, evasion: 0, scopeRejection: 0, unavailable: 0 }
  },
  byCategory: {},
  byCountry: {},
  leakDetails: [],
  hallucinationDetails: [],
  evasionDetails: [],
  sampleProperAnswers: []
};

function getBatchName(id) {
  if (id <= 44000) return 'Basic (40001-44000)';
  if (id <= 48000) return 'Intermediate (44001-48000)';
  if (id <= 52000) return 'Advanced (48001-52000)';
  if (id <= 56000) return 'Expert (52001-56000)';
  return 'Extreme (56001-60000)';
}

const startTime = Date.now();

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const m = line.match(/^(\d+)\.\s+\*\*\[([^\|]+)\|([^\|]+)\|([^\]]+)\]\*\*\s+(.*)$/);
  if (!m) continue;

  const id = parseInt(m[1], 10);
  const country = m[2].trim();
  const complexity = m[3].trim();
  const category = m[4].trim();
  const question = m[5].trim();

  const batchName = getBatchName(id);
  const isSupported = supportedSet.has(country);

  results.byBatch[batchName].total++;
  results.byCategory[category] = results.byCategory[category] || { total: 0, proper: 0, wrong: 0, hallucination: 0, evasion: 0, scopeRejection: 0, unavailable: 0 };
  results.byCategory[category].total++;

  results.byCountry[country] = results.byCountry[country] || { isSupported, total: 0, proper: 0, wrong: 0, hallucination: 0, evasion: 0, scopeRejection: 0, unavailable: 0 };
  results.byCountry[country].total++;

  const res = answer({ question }, records);

  // Classification Logic:
  // 1. Geography Rejection / Honest Scope Boundary
  if (res.status === 'clarification' && res.gaps.some(g => g.reason === 'missing_or_unsupported_geography')) {
    results.metrics.scopeBoundaries_honestRejection++;
    results.byBatch[batchName].scopeRejection++;
    results.byCategory[category].scopeRejection++;
    results.byCountry[country].scopeRejection++;
  }
  // 2. Wrong Answer / Jurisdiction Leak (Foreign destination gets Canadian domestic law claims)
  else if (!isSupported && res.claims.length > 0 && (res.parsed.country === 'CA' || res.claims.some(c => /IRCC|IRPA|IRPR|Ontario|British Columbia|RTA|RTB|CMHC|NNAS|OHIP|MSP|SIN/i.test(c.text)))) {
    results.metrics.wrongAnswers_jurisdictionLeaks++;
    results.byBatch[batchName].wrong++;
    results.byCategory[category].wrong++;
    results.byCountry[country].wrong++;
    if (results.leakDetails.length < 150) {
      results.leakDetails.push({
        id,
        country,
        category,
        complexity,
        question,
        parsedCountry: res.parsed.country,
        claimsCited: res.claims.map(c => ({ id: c.id, evidenceId: c.evidenceId, textSnippet: c.text?.slice(0, 160) }))
      });
    }
  }
  // 3. Hallucination Trap (Question contains false assumptions / unsupported cross-border legal entitlement)
  else if (!isSupported && res.claims.length > 0) {
    results.metrics.hallucinationTraps++;
    results.byBatch[batchName].hallucination++;
    results.byCategory[category].hallucination++;
    results.byCountry[country].hallucination++;
    if (results.hallucinationDetails.length < 100) {
      results.hallucinationDetails.push({
        id,
        country,
        category,
        question,
        reason: 'Foreign unsupported jurisdiction received extrapolated advice'
      });
    }
  }
  // 4. Proper Answer & Grounded Guidance (Supported countries with verified claims)
  else if (isSupported && (res.status === 'guidance' || (res.status === 'partial' && res.claims.length > 0))) {
    // Check if it's a precise statutory answer (no gaps, direct act cited)
    if (res.status === 'guidance' && res.gaps.length === 0) {
      results.metrics.preciseStatutoryAnswers++;
    } else {
      results.metrics.properGroundedAnswers++;
    }
    results.byBatch[batchName].proper++;
    results.byCategory[category].proper++;
    results.byCountry[country].proper++;
    if (results.sampleProperAnswers.length < 50) {
      results.sampleProperAnswers.push({
        id,
        country,
        category,
        question,
        status: res.status,
        claimsCount: res.claims.length,
        firstClaimSnippet: res.claims[0]?.text?.slice(0, 140)
      });
    }
  }
  // 5. AI Evasion / Urgent Real-Life Dilemma Ignored
  else if (urgencyPatterns.some(p => p.test(question)) && (!res.claims.length || res.status === 'unavailable')) {
    results.metrics.aiEvasions++;
    results.byBatch[batchName].evasion++;
    results.byCategory[category].evasion++;
    results.byCountry[country].evasion++;
    if (results.evasionDetails.length < 100) {
      results.evasionDetails.push({
        id,
        country,
        category,
        question,
        matchedPattern: urgencyPatterns.find(p => p.test(question))?.toString(),
        gaps: res.gaps.map(g => g.reason)
      });
    }
  }
  // 6. Unavailable / Scope Gap
  else {
    results.metrics.unavailable_noEvidence++;
    results.byBatch[batchName].unavailable++;
    results.byCategory[category].unavailable++;
    results.byCountry[country].unavailable++;
  }

  if ((i + 1) % 2000 === 0) {
    const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
    const speed = ((i + 1) / ((Date.now() - startTime) / 1000)).toFixed(1);
    console.log(`Progress: ${i + 1} / ${lines.length} questions processed (${((i + 1) / lines.length * 100).toFixed(0)}%) in ${elapsedSec}s [${speed} q/s]`);
  }
}

results.durationMs = Date.now() - startTime;
console.log(`\nAudit completed in ${(results.durationMs / 1000).toFixed(1)}s!`);
console.log('Summary metrics:', JSON.stringify(results.metrics, null, 2));

fs.writeFileSync('data/social_qa_40001_60000_audit_results.json', JSON.stringify(results, null, 2), 'utf8');
console.log('Saved detailed audit results to data/social_qa_40001_60000_audit_results.json');
