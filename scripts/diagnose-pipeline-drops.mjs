import fs from 'node:fs';
import { openStore } from '../src/store.js';
import { parse, retrieve } from '../src/engine.js';
import { requestedSubject, subjectEvidenceMatcher } from '../src/requested-subject.js';

const fixable = JSON.parse(fs.readFileSync('scratch/fixable-missing.json', 'utf8'));
const store = openStore();
const records = store.records().filter(r => r.status === 'approved');

let failIntent = 0;
let failMatcher = 0;
let failRetrieve = 0;
let other = 0;

const samples = [];

for (const [topic, items] of Object.entries(fixable)) {
  for (const item of items) {
    const parsed = parse({ question: item.question });
    const targetRec = records.find(r => item.matchedRecords.includes(r.id));
    if (!targetRec) continue;

    // Check 1: Does intent match target record topic?
    const intentMatches = parsed.intents.includes(targetRec.topic) || (parsed.intents.length === 0);

    // Check 2: Does subjectEvidenceMatcher match target record?
    const matcher = subjectEvidenceMatcher(item.question);
    const matcherMatches = matcher(targetRec);

    // Check 3: Does retrieve return target record?
    const retrieved = retrieve(parsed, records);
    const inRetrieved = retrieved.some(r => r.id === targetRec.id && r.available);

    if (!intentMatches) {
      failIntent++;
      if (samples.length < 5) samples.push({ reason: 'intent_mismatch', q: item.question, parsedIntents: parsed.intents, recTopic: targetRec.topic, recId: targetRec.id });
    } else if (!matcherMatches) {
      failMatcher++;
      if (samples.length < 5) samples.push({ reason: 'matcher_false', q: item.question, subject: requestedSubject(item.question), recTitle: targetRec.title, recId: targetRec.id });
    } else if (!inRetrieved) {
      failRetrieve++;
      if (samples.length < 5) samples.push({ reason: 'retrieve_dropped', q: item.question, parsedTerms: parsed.queryTerms, recId: targetRec.id });
    } else {
      other++;
    }
  }
}

console.log('--- FAILURE BREAKDOWN ACROSS 588 FAILING QUESTIONS ---');
console.log(`Failed Intent match: ${failIntent}`);
console.log(`Failed SubjectMatcher: ${failMatcher}`);
console.log(`Failed Retrieve / Scoping: ${failRetrieve}`);
console.log(`Other: ${other}`);

console.log('\nSamples:');
for (const s of samples) {
  console.log(s);
}

