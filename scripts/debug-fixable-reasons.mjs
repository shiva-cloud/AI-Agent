import fs from 'node:fs';
import { parse, answer } from '../src/engine.js';
import { openStore } from '../src/store.js';
import { requestedSubject, subjectEvidenceMatcher } from '../src/requested-subject.js';

const fixable = JSON.parse(fs.readFileSync('scratch/fixable-missing.json', 'utf8'));
const store = openStore();
const records = store.records();

for (const [topic, items] of Object.entries(fixable)) {
  console.log(`\n=================== TOPIC: ${topic} ===================`);
  const item = items[0];
  console.log(`[${item.id}] (${item.country}): "${item.question}"`);
  console.log(`  Subject: "${item.subject}"`);
  console.log(`  Candidate records in KB:`, item.matchedRecords);

  const parsed = parse({ question: item.question });
  console.log(`  Parsed: intents=${parsed.intents}, city=${parsed.city}, region=${parsed.region}, country=${parsed.country}`);

  const targetRec = records.find(r => r.id === item.matchedRecords[0]);
  if (targetRec) {
    const matcher = subjectEvidenceMatcher(item.question);
    console.log(`  Target record [${targetRec.id}]:`);
    console.log(`    title: "${targetRec.title}"`);
    console.log(`    topic: ${targetRec.topic}, jurisdiction: ${targetRec.jurisdiction}, status: ${targetRec.status}`);
    console.log(`    matcher matches target: ${matcher(targetRec)}`);
  }
}

