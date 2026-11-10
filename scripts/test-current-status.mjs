import fs from 'node:fs';
import { openStore } from '../src/store.js';
import { parse, answer } from '../src/engine.js';
import { requestedSubject } from '../src/requested-subject.js';

const fixable = JSON.parse(fs.readFileSync('scratch/fixable-missing.json', 'utf8'));
const store = openStore();
const records = store.records();

// Let's test how many of the questions in fixable currently pass answer()
let nowPassed = 0;
let nowFailed = 0;

for (const [topic, items] of Object.entries(fixable)) {
  for (const item of items) {
    const res = answer({ question: item.question }, records);
    if (res.claims?.length > 0) {
      nowPassed++;
    } else {
      nowFailed++;
    }
  }
}

console.log(`Currently: Passed=${nowPassed}, Failed=${nowFailed}`);

