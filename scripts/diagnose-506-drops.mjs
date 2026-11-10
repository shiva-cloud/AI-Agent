import fs from 'node:fs';
import { openStore } from '../src/store.js';
import { parse, retrieve } from '../src/engine.js';
import { requestedSubject, subjectEvidenceMatcher } from '../src/requested-subject.js';

const fixable = JSON.parse(fs.readFileSync('scratch/fixable-missing.json', 'utf8'));
const store = openStore();
const records = store.records().filter(r => r.status === 'approved');

let dropMatcher = 0;
let dropCoversRequired = 0;
let dropOverlap = 0;
let dropOther = 0;

const sampleDrops = [];

for (const [topic, items] of Object.entries(fixable)) {
  for (const item of items) {
    const parsed = parse({ question: item.question });
    const matchedRecs = records.filter(r => item.matchedRecords.includes(r.id) && parsed.intents.includes(r.topic));
    if (!matchedRecs.length) continue;

    const matcher = subjectEvidenceMatcher(item.question);
    const matcherPassing = matchedRecs.filter(r => matcher(r));
    if (!matcherPassing.length) {
      dropMatcher++;
      if (sampleDrops.length < 5) sampleDrops.push({
        type: 'drop_matcher',
        q: item.question,
        subject: requestedSubject(item.question),
        firstRecTitle: matchedRecs[0].title
      });
      continue;
    }

    // If matcher passed, check why retrieve or answer dropped it
    dropOther++;
  }
}

console.log(`Drop by subjectEvidenceMatcher: ${dropMatcher}`);
console.log(`Drop by other: ${dropOther}`);

console.log('\nSample matcher drops:');
for (const s of sampleDrops) {
  console.log(s);
}

