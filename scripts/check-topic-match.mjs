import fs from 'node:fs';
import { openStore } from '../src/store.js';
import { parse } from '../src/engine.js';

const fixable = JSON.parse(fs.readFileSync('scratch/fixable-missing.json', 'utf8'));
const store = openStore();
const records = store.records().filter(r => r.status === 'approved');

let hasTopicMatch = 0;
let noTopicMatch = 0;

for (const [topic, items] of Object.entries(fixable)) {
  for (const item of items) {
    const parsed = parse({ question: item.question });
    const matchedRecs = records.filter(r => item.matchedRecords.includes(r.id));
    const anyMatchesTopic = matchedRecs.some(r => parsed.intents.includes(r.topic));
    if (anyMatchesTopic) {
      hasTopicMatch++;
    } else {
      noTopicMatch++;
    }
  }
}

console.log(`Any candidate has matching topic: ${hasTopicMatch}`);
console.log(`No candidate has matching topic: ${noTopicMatch}`);

