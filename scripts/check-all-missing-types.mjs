import fs from 'node:fs';
import readline from 'node:readline';
import { parse, answer } from '../src/engine.js';
import { openStore } from '../src/store.js';

const store = openStore();
const records = store.records();

// Read all questions from the 10 topic pools in 5000 audit
const f2 = 'corpus/global_immigration_settlement_20000_questions.md';
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

if (fs.existsSync(f2)) {
  const rl2 = readline.createInterface({ input: fs.createReadStream(f2) });
  for await (const line of rl2) {
    const match = line.match(/- \*\*(GMS-Q\d+)\*\*\s+\[(.*?)\s*\|\s*(.*?)\]\s*(.*)$/);
    if (!match) continue;
    const qid = match[1];
    const topic = match[2].trim();
    const country = match[3].trim();
    const q = match[4].trim();

    if (topic === 'Housing & Tenancy' && topicPools.housing.length < 500) {
      topicPools.housing.push({ id: qid, topicKey: 'housing', country, q });
    } else if ((topic === 'Employment & Labour' || topic === 'Jobs & Careers') && topicPools.employment.length < 500) {
      topicPools.employment.push({ id: qid, topicKey: 'employment', country, q });
    } else if (topic === 'Healthcare' && topicPools.healthcare.length < 500) {
      topicPools.healthcare.push({ id: qid, topicKey: 'healthcare', country, q });
    } else if (topic === 'Identity & SIN' && topicPools.identity_sin.length < 500) {
      topicPools.identity_sin.push({ id: qid, topicKey: 'identity_sin', country, q });
    } else if (topic === 'Driving & Vehicles' && topicPools.driving.length < 500) {
      topicPools.driving.push({ id: qid, topicKey: 'driving', country, q });
    } else if (topic === 'Banking & Tax' && topicPools.money_tax.length < 500) {
      topicPools.money_tax.push({ id: qid, topicKey: 'money_tax', country, q });
    } else if ((topic === 'Transit' || topic === 'Local Settlement') && topicPools.transit_community.length < 500) {
      topicPools.transit_community.push({ id: qid, topicKey: 'transit_community', country, q });
    } else if ((topic === 'Work Immigration' || topic === 'Immigration Policy' || topic === 'PR & Citizenship') && topicPools.immigration_visas.length < 500) {
      topicPools.immigration_visas.push({ id: qid, topicKey: 'immigration_visas', country, q });
    } else if (topic === 'Family & Schools' && topicPools.family_childcare.length < 500) {
      topicPools.family_childcare.push({ id: qid, topicKey: 'family_childcare', country, q });
    } else if (topic === 'Telecom & Consumer' && topicPools.telecom_utilities.length < 500) {
      topicPools.telecom_utilities.push({ id: qid, topicKey: 'telecom_utilities', country, q });
    }
  }
}

console.log('Analyzing Missing Questions across all topics...');
const missingByType = {};
const emptyIntentsQuestions = [];

for (const [tKey, list] of Object.entries(topicPools)) {
  for (const item of list) {
    const res = answer({ question: item.q }, records);
    if (res.claims.length === 0 && !res.placeClarification) {
      const parsed = parse({ question: item.q });
      const gaps = res.gaps.map(g => g.reason || g.code).join('+');
      const key = `${tKey} | ${gaps} | intents:[${parsed.intents.join(',')}]`;
      missingByType[key] = (missingByType[key] || 0) + 1;

      if (parsed.intents.length === 0) {
        emptyIntentsQuestions.push({ topic: tKey, country: item.country, q: item.q });
      }
    }
  }
}

console.log('\nTop Missing Breakdown:');
const sorted = Object.entries(missingByType).sort((a, b) => b[1] - a[1]);
for (const [k, v] of sorted.slice(0, 25)) {
  console.log(`${String(v).padStart(4, ' ')} : ${k}`);
}

console.log(`\nTotal questions with Empty Intents: ${emptyIntentsQuestions.length}`);
console.log('Sample Empty Intents questions:');
for (const eq of emptyIntentsQuestions.slice(0, 15)) {
  console.log(`[${eq.topic}] (${eq.country}) "${eq.q}"`);
}

