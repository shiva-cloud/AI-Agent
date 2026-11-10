import fs from 'node:fs';
import { parse } from '../src/engine.js';
import { openStore } from '../src/store.js';
import { requestedSubject, subjectEvidenceMatcher } from '../src/requested-subject.js';

const missing = JSON.parse(fs.readFileSync('scratch/missing-questions.json', 'utf8'));
const store = openStore();
const records = store.records();

const topics = [...new Set(missing.map(m => m.topic))];

for (const t of topics) {
  const sample = missing.find(m => m.topic === t);
  console.log(`\n======================================================`);
  console.log(`TOPIC: ${t}`);
  console.log(`Question [${sample.id}] (${sample.country}): "${sample.question}"`);
  console.log(`Parsed intents:`, sample.parsedIntents, `City:`, sample.parsedCity, `Country:`, sample.parsedCountry);
  console.log(`Gaps:`, sample.gaps);

  const subject = requestedSubject(sample.question);
  console.log(`Requested Subject: "${subject}"`);

  // Check matching records in records for this country
  const countryRecs = records.filter(r => r.jurisdiction === sample.country || r.jurisdiction === sample.parsedCountry || (sample.parsedCity && r.jurisdiction === sample.parsedCity));
  console.log(`Records in jurisdiction (${sample.country}): ${countryRecs.length}`);
  
  // See if any record in country matches topic or title keywords
  const topicRecs = countryRecs.filter(r => r.topic === t || r.topic === sample.parsedIntents?.[0]);
  console.log(`Records matching topic (${t}): ${topicRecs.length}`);
  for (const r of topicRecs.slice(0, 3)) {
    console.log(`  - [${r.id}] ${r.title} (status: ${r.status})`);
    if (subject) {
      const matcher = subjectEvidenceMatcher(sample.question);
      console.log(`    subjectEvidenceMatcher: ${matcher(r)}`);
    }
  }
}

