import fs from 'node:fs';
import readline from 'node:readline';
import { performance } from 'node:perf_hooks';
import { openStore } from '../src/store.js';
import { answer } from '../src/engine.js';

const store = openStore();
const records = store.records();

const topicConfigs = [
  { key: 'housing', name: 'Housing & Tenancy' },
  { key: 'employment', name: 'Employment & Worker Rights' },
  { key: 'healthcare', name: 'Healthcare & Medical Coverage' },
  { key: 'identity_sin', name: 'Identity & SIN' },
  { key: 'driving', name: 'Driving & Vehicle Licensing' },
  { key: 'money_tax', name: 'Money, Banking & Tax' },
  { key: 'transit_community', name: 'Transit & Community' },
  { key: 'immigration_visas', name: 'Immigration & Visas' },
  { key: 'family_childcare', name: 'Family & Children' },
  { key: 'telecom_utilities', name: 'Telecom & Utilities' }
];

const topicPools = Object.fromEntries(topicConfigs.map(t => [t.key, []]));

// 1. Ingest from 40001_60000
const f1 = 'corpus/global_immigration_social_questions_40001_60000.md';
if (fs.existsSync(f1)) {
  const rl1 = readline.createInterface({ input: fs.createReadStream(f1) });
  for await (const line of rl1) {
    const match = line.match(/^(\d+)\.\s+\*\*\[(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\]\*\*\s*(.*)$/);
    if (!match) continue;
    const num = match[1];
    const country = match[2].trim();
    const cat = match[4].trim();
    const q = match[5].trim();

    if (cat === 'Housing and tenant protection' && topicPools.housing.length < 500) {
      topicPools.housing.push({ id: `SOC-${num}`, topicKey: 'housing', country, question: q });
    } else if (cat === 'Jobs and worker rights' && topicPools.employment.length < 500) {
      topicPools.employment.push({ id: `SOC-${num}`, topicKey: 'employment', country, question: q });
    } else if (cat === 'Healthcare and disability' && topicPools.healthcare.length < 500) {
      topicPools.healthcare.push({ id: `SOC-${num}`, topicKey: 'healthcare', country, question: q });
    } else if (cat === 'Tax, banking and finance' && topicPools.money_tax.length < 500) {
      topicPools.money_tax.push({ id: `SOC-${num}`, topicKey: 'money_tax', country, question: q });
    } else if (cat === 'Education and children' && topicPools.family_childcare.length < 500) {
      topicPools.family_childcare.push({ id: `SOC-${num}`, topicKey: 'family_childcare', country, question: q });
    } else if (cat === 'Immigration status and visas' && topicPools.immigration_visas.length < 500) {
      topicPools.immigration_visas.push({ id: `SOC-${num}`, topicKey: 'immigration_visas', country, question: q });
    } else if (cat === 'Cross-border and complex law' && topicPools.driving.length < 500) {
      topicPools.driving.push({ id: `SOC-${num}`, topicKey: 'driving', country, question: q });
    } else if (cat === 'Local services and daily life' && topicPools.transit_community.length < 500) {
      topicPools.transit_community.push({ id: `SOC-${num}`, topicKey: 'transit_community', country, question: q });
    }
  }
}

// 2. Ingest from 20000
const f2 = 'corpus/global_immigration_settlement_20000_questions.md';
if (fs.existsSync(f2)) {
  const rl2 = readline.createInterface({ input: fs.createReadStream(f2) });
  for await (const line of rl2) {
    const match = line.match(/- \*\*(GMS-Q\d+)\*\*\s+\[(.*?)\s*\|\s*(.*?)\]\s*(.*)$/);
    if (!match) continue;
    const qid = match[1];
    const topic = match[2].trim();
    const country = match[3].trim();
    const q = match[4].trim();

    if (topic === 'Identity & SIN' && topicPools.identity_sin.length < 500) {
      topicPools.identity_sin.push({ id: qid, topicKey: 'identity_sin', country, question: q });
    } else if (topic === 'Telecom & Consumer' && topicPools.telecom_utilities.length < 500) {
      topicPools.telecom_utilities.push({ id: qid, topicKey: 'telecom_utilities', country, question: q });
    } else if (topic === 'Driving & Vehicles' && topicPools.driving.length < 500) {
      topicPools.driving.push({ id: qid, topicKey: 'driving', country, question: q });
    } else if (topic === 'Transit' && topicPools.transit_community.length < 500) {
      topicPools.transit_community.push({ id: qid, topicKey: 'transit_community', country, question: q });
    }
  }
}

// 3. Fill remaining from 20001_40000
const f3 = 'corpus/global_immigration_settlement_questions_20001_40000.md';
if (fs.existsSync(f3)) {
  const rl3 = readline.createInterface({ input: fs.createReadStream(f3) });
  for await (const line of rl3) {
    const match = line.match(/- \*\*(GMS-Q\d+)\*\*\s+\[(.*?)\s*\|\s*(.*?)\]\s*(.*)$/);
    if (!match) continue;
    const qid = match[1];
    const topic = match[2].trim();
    const country = match[3].trim();
    const q = match[4].trim();

    if (topic.includes('identity') && topicPools.identity_sin.length < 500) {
      topicPools.identity_sin.push({ id: qid, topicKey: 'identity_sin', country, question: q });
    } else if ((topic.includes('telecom') || topic.includes('services') || topic.includes('consumer')) && topicPools.telecom_utilities.length < 500) {
      topicPools.telecom_utilities.push({ id: qid, topicKey: 'telecom_utilities', country, question: q });
    } else if (topic.includes('driving') && topicPools.driving.length < 500) {
      topicPools.driving.push({ id: qid, topicKey: 'driving', country, question: q });
    }
  }
}

// Now evaluate all 5000 questions and collect all missing ones
const missingQuestions = [];
const summary = { sahi: 0, requirement_ignored: 0, missing: 0, shabdon_ko_ghumaya: 0, misleading: 0, galat: 0 };
const perTopic = {};

for (const tc of topicConfigs) {
  perTopic[tc.key] = { sahi: 0, requirement_ignored: 0, missing: 0, shabdon_ko_ghumaya: 0, misleading: 0, galat: 0 };
  const list = topicPools[tc.key];
  for (const item of list) {
    let res;
    try {
      res = answer({ question: item.question }, records);
    } catch (err) {
      res = { status: 'error', claims: [], sources: [], gaps: [{ reason: err.message }] };
    }

    const claims = res.claims || [];
    const gaps = res.gaps || [];
    const clarification = res.clarification || '';
    const claimsText = claims.map(c => c.text || '').join(' ');

    const hasHallucination = claims.some(c =>
      /\b(?:guaranteed?\s+PR\b|100%\s+approval\b|secret\s+backdoor\b|fake\s+visa\b|no\s+documentation\s+needed\b|automatic\s+citizenship\b)/i.test(c.text || '')
    );

    const hasUnsupportedPlace = res.placeClarification?.reason === 'unsupported_place' ||
                                gaps.some(g => g.reason === 'missing_or_unsupported_geography') ||
                                (clarification && /outside our verified|does not cover that place|outside Canada/i.test(clarification));

    const isEvasive = (res.status === 'clarification' && !hasUnsupportedPlace) ||
                      (clarification && !hasUnsupportedPlace && claims.length === 0 && !gaps.length);

    const isMisleading = claims.length > 0 && (
      (!res.disclaimer && !res.meta?.disclaimer && (tc.key === 'immigration_visas' || tc.key === 'employment')) ||
      /you will be approved|no risk of deportation/i.test(claimsText)
    );

    const isMissing = res.status === 'unavailable' ||
                      res.status === 'partial' ||
                      (claims.length === 0 && gaps.length > 0 && !hasUnsupportedPlace);

    let category = 'sahi';
    if (hasHallucination) category = 'galat';
    else if (hasUnsupportedPlace) category = 'requirement_ignored';
    else if (isMisleading) category = 'misleading';
    else if (isEvasive) category = 'shabdon_ko_ghumaya';
    else if (claims.length > 0) category = 'sahi';
    else if (isMissing) category = 'missing';
    else category = 'missing';

    summary[category]++;
    perTopic[tc.key][category]++;

    if (category === 'missing') {
      missingQuestions.push({
        id: item.id,
        topic: tc.key,
        country: item.country,
        question: item.question,
        parsedCountry: res.parsed?.country,
        parsedCity: res.parsed?.city,
        parsedIntents: res.parsed?.intents,
        gaps: gaps.map(g => g.reason)
      });
    }
  }
}

console.log('SUMMARY:', summary);
console.log('PER TOPIC:');
for (const [k, v] of Object.entries(perTopic)) {
  console.log(`${k.padEnd(20)} | Sahi: ${String(v.sahi).padStart(3)} | Missing: ${String(v.missing).padStart(3)} | ReqIgnored: ${String(v.requirement_ignored).padStart(4)}`);
}

fs.writeFileSync('scratch/current-missing-all.json', JSON.stringify(missingQuestions, null, 2), 'utf8');
console.log(`Saved ${missingQuestions.length} missing questions to scratch/current-missing-all.json`);

