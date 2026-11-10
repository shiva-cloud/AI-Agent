import fs from 'fs';
import { openStore } from '../src/store.js';
import { parse, retrieve, answer } from '../src/engine.js';
import { requestedSubject, subjectEvidenceMatcher } from '../src/requested-subject.js';

const store = openStore();
const records = store.records();
const data = JSON.parse(fs.readFileSync('scripts/missing-analysis.json', 'utf8'));

// Group all missing questions by their requested subject
const bySubj = {};
for (const m of data.missingItems) {
  const s = m.subj || 'UNKNOWN';
  if (!bySubj[s]) bySubj[s] = [];
  bySubj[s].push(m);
}

// Inspect the top 15 missing subjects
const sorted = Object.entries(bySubj).sort((a,b) => b[1].length - a[1].length);

console.log('Top 15 Missing Subjects across all countries:');
for (const [s, list] of sorted.slice(0, 15)) {
  console.log(`\n=== Subject: "${s}" (${list.length} occurrences) ===`);
  const sample = list[0];
  console.log(`Sample Q: "${sample.question}" (${sample.country})`);
  const parsed = parse({ question: sample.question });
  console.log(`Parsed: country=${parsed.country}, city=${parsed.city}, region=${parsed.region}, intents=[${parsed.intents.join(', ')}]`);
  const cands = retrieve(parsed, records);
  console.log(`Retrieved candidates: ${cands.length}`);
  if (cands.length > 0) {
    const matcher = subjectEvidenceMatcher(sample.question);
    console.log(`Top cand: ${cands[0].id} (Score: ${cands[0].score.toFixed(2)}, match: ${matcher(cands[0])}, avail: ${cands[0].available})`);
  }
}

