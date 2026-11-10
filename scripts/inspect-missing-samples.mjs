import fs from 'fs';
import { parse, retrieve, answer } from '../src/engine.js';
import { openStore } from '../src/store.js';

const store = openStore();
const records = store.records();
const data = JSON.parse(fs.readFileSync('scripts/missing-analysis.json', 'utf8'));
const missing = data.missingItems;

// Sample 3 missing questions from each of the 8 topics
const topics = [
  'immigration_visas',
  'employment',
  'family_childcare',
  'money_tax',
  'driving',
  'housing',
  'transit_community',
  'healthcare'
];

for (const t of topics) {
  console.log(`\n================== TOPIC: ${t} ==================`);
  const items = missing.filter(m => m.topic === t);
  console.log(`Total missing in ${t}: ${items.length}`);
  for (const item of items.slice(0, 4)) {
    const parsed = parse({ question: item.question });
    const cands = retrieve(parsed, records);
    const ans = answer({ question: item.question }, records);
    console.log(`\nQ: ${item.question}`);
    console.log(`   Country: ${item.country} | Parsed country: ${parsed.country} | City: ${parsed.city} | Region: ${parsed.region}`);
    console.log(`   Intents: [${parsed.intents.join(', ')}] | MissingSlots: [${parsed.missingSlots.join(', ')}]`);
    console.log(`   Status: ${ans.status} | Claims: ${ans.claims.length} | Gaps: ${ans.gaps.map(g => g.reason).join(', ')}`);
    console.log(`   Top cand: ${cands[0]?.id || 'NONE'} (Score: ${cands[0]?.score || 0})`);
  }
}

