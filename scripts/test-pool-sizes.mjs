import fs from 'node:fs';
import readline from 'node:readline';

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

// 1. Ingest from f2 (corpus/global_immigration_settlement_20000_questions.md)
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

// 2. Fill from f1
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

// 3. Fill remaining from f3
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

    for (const tk of Object.keys(topicPools)) {
      if (topicPools[tk].length < 500) {
        topicPools[tk].push({ id: qid, topicKey: tk, country, platform: 'Settlement & Expat Q&A', question: q });
      }
    }
  }
}

console.log('Resulting pool sizes:');
for (const [k, v] of Object.entries(topicPools)) {
  console.log(`  ${k.padEnd(20)}: ${v.length} questions`);
}

