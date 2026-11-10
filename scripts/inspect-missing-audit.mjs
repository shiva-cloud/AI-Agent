import fs from 'fs';
import { openStore } from '../src/store.js';
import { answer } from '../src/engine.js';

const store = openStore();
const records = store.records();

// Let's inspect some of the missing questions from the run
const results = JSON.parse(fs.readFileSync('artifacts/deep-5000-kb-audit-results.json', 'utf8'));
const missingSamples = [];
for (const tc of Object.values(results.topicResults)) {
  for (const s of tc.samples?.missing || []) {
    missingSamples.push(s);
  }
}

console.log('Total missing samples logged in audit:', missingSamples.length);
for (const s of missingSamples.slice(0, 10)) {
  console.log(`[${s.id}] (${s.country}): ${s.question}`);
  console.log(`  reason: ${s.reason}`);
}

