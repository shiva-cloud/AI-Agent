import fs from 'fs';
import { parse, retrieve, answer } from '../src/engine.js';
import { openStore } from '../src/store.js';

const store = openStore();
const records = store.records();
const data = JSON.parse(fs.readFileSync('scripts/missing-analysis.json', 'utf8'));

for (const country of ['New Zealand', 'United Arab Emirates', 'Germany', 'United Kingdom', 'Australia', 'United States', 'European Union']) {
  const cMissing = data.missingItems.filter(m => m.country === country);
  console.log(`\n=== ${country} (Total Missing: ${cMissing.length}) ===`);
  const subjs = {};
  for (const m of cMissing) {
    subjs[m.subj] = (subjs[m.subj] || 0) + 1;
  }
  for (const [s, n] of Object.entries(subjs).sort((a,b) => b[1]-a[1]).slice(0, 10)) {
    console.log(`  ${s}: ${n}`);
  }
}

