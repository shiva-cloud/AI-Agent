import fs from 'node:fs';
import readline from 'node:readline';
import { openStore } from '../src/store.js';
import { answer, parse, retrieve } from '../src/engine.js';
import { requestedSubject, subjectEvidenceMatcher } from '../src/requested-subject.js';

const store = openStore();
const records = store.records();

// 1. Ingest 5,000 questions identically to run-topic-kb-audit-5000.mjs
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

// 1. Ingest from corpus/global_immigration_settlement_20000_questions.md
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
    const platform = 'Settlement & Municipal Forum';

    if (topic === 'Housing & Tenancy' && topicPools.housing.length < 500) {
      topicPools.housing.push({ id: qid, topicKey: 'housing', country, platform, question: q });
    } else if ((topic === 'Employment & Labour' || topic === 'Jobs & Careers') && topicPools.employment.length < 500) {
      topicPools.employment.push({ id: qid, topicKey: 'employment', country, platform, question: q });
    } else if (topic === 'Healthcare' && topicPools.healthcare.length < 500) {
      topicPools.healthcare.push({ id: qid, topicKey: 'healthcare', country, platform, question: q });
    } else if (topic === 'Identity & SIN' && topicPools.identity_sin.length < 500) {
      topicPools.identity_sin.push({ id: qid, topicKey: 'identity_sin', country, platform, question: q });
    } else if (topic === 'Driving & Vehicles' && topicPools.driving.length < 500) {
      topicPools.driving.push({ id: qid, topicKey: 'driving', country, platform, question: q });
    } else if (topic === 'Banking & Tax' && topicPools.money_tax.length < 500) {
      topicPools.money_tax.push({ id: qid, topicKey: 'money_tax', country, platform, question: q });
    } else if ((topic === 'Transit' || topic === 'Local Settlement') && topicPools.transit_community.length < 500) {
      topicPools.transit_community.push({ id: qid, topicKey: 'transit_community', country, platform, question: q });
    } else if ((topic === 'Work Immigration' || topic === 'Immigration Policy' || topic === 'PR & Citizenship') && topicPools.immigration_visas.length < 500) {
      topicPools.immigration_visas.push({ id: qid, topicKey: 'immigration_visas', country, platform, question: q });
    } else if (topic === 'Family & Schools' && topicPools.family_childcare.length < 500) {
      topicPools.family_childcare.push({ id: qid, topicKey: 'family_childcare', country, platform, question: q });
    } else if (topic === 'Telecom & Consumer' && topicPools.telecom_utilities.length < 500) {
      topicPools.telecom_utilities.push({ id: qid, topicKey: 'telecom_utilities', country, platform, question: q });
    }
  }
}

// 2. Ingest from corpus/global_immigration_social_questions_40001_60000.md
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
    const platform = 'Reddit/Quora/ExpatForum';

    if (cat === 'Housing and tenant protection' && topicPools.housing.length < 500) {
      topicPools.housing.push({ id: `SOC-${num}`, topicKey: 'housing', country, platform, question: q });
    } else if (cat === 'Jobs and worker rights' && topicPools.employment.length < 500) {
      topicPools.employment.push({ id: `SOC-${num}`, topicKey: 'employment', country, platform, question: q });
    } else if (cat === 'Healthcare and disability' && topicPools.healthcare.length < 500) {
      topicPools.healthcare.push({ id: `SOC-${num}`, topicKey: 'healthcare', country, platform, question: q });
    } else if (cat === 'Tax, banking and finance' && topicPools.money_tax.length < 500) {
      topicPools.money_tax.push({ id: `SOC-${num}`, topicKey: 'money_tax', country, platform, question: q });
    } else if (cat === 'Education and children' && topicPools.family_childcare.length < 500) {
      topicPools.family_childcare.push({ id: `SOC-${num}`, topicKey: 'family_childcare', country, platform, question: q });
    } else if (cat === 'Immigration status and visas' && topicPools.immigration_visas.length < 500) {
      topicPools.immigration_visas.push({ id: `SOC-${num}`, topicKey: 'immigration_visas', country, platform, question: q });
    } else if (cat === 'Local services and daily life' && topicPools.transit_community.length < 500) {
      topicPools.transit_community.push({ id: `SOC-${num}`, topicKey: 'transit_community', country, platform, question: q });
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

    if (topic === 'Housing & tenant rights' && topicPools.housing.length < 500) {
      topicPools.housing.push({ id: qid, topicKey: 'housing', country, platform: 'Settlement & Expat Q&A', question: q });
    } else if (topic === 'Jobs & employment' && topicPools.employment.length < 500) {
      topicPools.employment.push({ id: qid, topicKey: 'employment', country, platform: 'Settlement & Expat Q&A', question: q });
    } else if (topic === 'Healthcare & disability' && topicPools.healthcare.length < 500) {
      topicPools.healthcare.push({ id: qid, topicKey: 'healthcare', country, platform: 'Settlement & Expat Q&A', question: q });
    } else if (topic === 'Settlement & identity' && topicPools.identity_sin.length < 500) {
      topicPools.identity_sin.push({ id: qid, topicKey: 'identity_sin', country, platform: 'Settlement & Expat Q&A', question: q });
    } else if (topic === 'Tax & banking' && topicPools.money_tax.length < 500) {
      topicPools.money_tax.push({ id: qid, topicKey: 'money_tax', country, platform: 'Settlement & Expat Q&A', question: q });
    } else if (topic === 'Family & education' && topicPools.family_childcare.length < 500) {
      topicPools.family_childcare.push({ id: qid, topicKey: 'family_childcare', country, platform: 'Settlement & Expat Q&A', question: q });
    } else if (topic === 'Immigration status & procedure' && topicPools.immigration_visas.length < 500) {
      topicPools.immigration_visas.push({ id: qid, topicKey: 'immigration_visas', country, platform: 'Settlement & Expat Q&A', question: q });
    } else if ((topic === 'Local services & cost of living' || topic === 'Public services & consumer') && topicPools.transit_community.length < 500) {
      topicPools.transit_community.push({ id: qid, topicKey: 'transit_community', country, platform: 'Settlement & Expat Q&A', question: q });
    } else if ((topic === 'Skilled migration & licensing' || /driv|licen|vehicle/i.test(q)) && topicPools.driving.length < 500) {
      topicPools.driving.push({ id: qid, topicKey: 'driving', country, platform: 'Settlement & Expat Q&A', question: q });
    } else if (/phone|mobile|telecom|internet|broadband|sim/i.test(q) && topicPools.telecom_utilities.length < 500) {
      topicPools.telecom_utilities.push({ id: qid, topicKey: 'telecom_utilities', country, platform: 'Settlement & Expat Q&A', question: q });
    }
  }
}

// 4. Diagnose missing questions
const missingItems = [];
const missingByTopic = {};
const subjectFrequencies = {};

for (const tc of topicConfigs) {
  const list = topicPools[tc.key];
  for (const qObj of list) {
    const res = answer({ question: qObj.question }, records);
    const claims = res.claims || [];
    const gaps = res.gaps || [];
    const clarification = res.clarification || '';
    const hasUnsupportedPlace = res.placeClarification?.reason === 'unsupported_place' ||
                                gaps.some(g => g.reason === 'missing_or_unsupported_geography') ||
                                (clarification && /outside our verified|does not cover that place|outside Canada/i.test(clarification));
    const isEvasive = (res.status === 'clarification' && !hasUnsupportedPlace) ||
                      (clarification && !hasUnsupportedPlace && claims.length === 0 && !gaps.length);
    const isMissing = res.status === 'unavailable' ||
                      res.status === 'partial' ||
                      (claims.length === 0 && gaps.length > 0 && !hasUnsupportedPlace);

    if (claims.length === 0 && !hasUnsupportedPlace && !isEvasive) {
      const subj = requestedSubject(qObj.question);
      missingItems.push({
        id: qObj.id,
        topic: tc.key,
        country: qObj.country,
        question: qObj.question,
        subj,
        gaps: gaps.map(g => g.reason)
      });
      missingByTopic[tc.key] = (missingByTopic[tc.key] || 0) + 1;
      const key = `${tc.key} | ${subj || 'NO_SUBJ'}`;
      subjectFrequencies[key] = (subjectFrequencies[key] || 0) + 1;
    }
  }
}

console.log('Total Missing items extracted:', missingItems.length);
console.log('Missing by Topic:', missingByTopic);

const sortedSubjs = Object.entries(subjectFrequencies).sort((a, b) => b[1] - a[1]);
console.log('\nTop 40 Missing Subjects:');
for (const [k, v] of sortedSubjs.slice(0, 40)) {
  console.log(`[${v}x] ${k}`);
}

fs.writeFileSync('scripts/missing-analysis.json', JSON.stringify({ missingItems, sortedSubjs }, null, 2));

