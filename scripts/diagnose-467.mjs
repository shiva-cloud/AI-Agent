import fs from 'fs';
import { openStore } from '../src/store.js';
import { parse, retrieve, answer } from '../src/engine.js';
import { requestedSubject } from '../src/requested-subject.js';

const data = JSON.parse(fs.readFileSync('scripts/actual-missing.json', 'utf8'));
const list = data.missingList;
const store = openStore();
const records = store.records();

console.log(`Analyzing ${list.length} missing questions...`);

const breakdown = {};
for (const item of list) {
  if (!breakdown[item.topicKey]) breakdown[item.topicKey] = [];
  breakdown[item.topicKey].push(item);
}

for (const [topic, items] of Object.entries(breakdown)) {
  console.log(`\n========================================`);
  console.log(`Topic: ${topic} (${items.length} missing)`);
  console.log(`========================================`);

  // Group by question pattern / recurring terms
  const patterns = {};
  for (const it of items) {
    // Extract key phrase
    let key = it.question.toLowerCase();
    if (key.includes('winter driving')) key = 'winter driving';
    else if (key.includes('licence') || key.includes('license')) key = 'licence';
    else if (key.includes('vehicle')) key = 'vehicle';
    else if (key.includes('parental leave')) key = 'parental leave';
    else if (key.includes('childcare') || key.includes('daycare')) key = 'childcare';
    else if (key.includes('school')) key = 'school';
    else if (key.includes('minimum wage')) key = 'minimum wage';
    else if (key.includes('work permit')) key = 'work permit';
    else if (key.includes('health') || key.includes('medical') || key.includes('doctor')) key = 'healthcare/doctor';
    else if (key.includes('transit') || key.includes('bus') || key.includes('metro')) key = 'transit';
    else {
      // first 6 words
      key = it.question.split(/\s+/).slice(0, 6).join(' ');
    }
    patterns[key] = (patterns[key] || 0) + 1;
  }

  const sortedPatterns = Object.entries(patterns).sort((a, b) => b[1] - a[1]);
  for (const [p, count] of sortedPatterns.slice(0, 10)) {
    console.log(`  - [${count}] ${p}`);
  }

  console.log('Sample questions:');
  for (const it of items.slice(0, 5)) {
    console.log(`    * [${it.id}] (${it.country}) ${it.question}`);
    console.log(`      parsed: country=${it.parsedCountry}, city=${it.parsedCity}, region=${it.parsedRegion}, subj=${it.subj}`);
    console.log(`      cands: ${it.candsCount}, topCand: ${it.topCand} (score: ${it.topCandScore})`);
  }
}

