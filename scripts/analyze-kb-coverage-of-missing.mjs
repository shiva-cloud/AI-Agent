import fs from 'node:fs';
import { openStore } from '../src/store.js';
import { parse } from '../src/engine.js';
import { requestedSubject } from '../src/requested-subject.js';

const d = JSON.parse(fs.readFileSync('artifacts/deep-5000-kb-audit-results.json', 'utf8'));
const store = openStore();
const records = store.records();

// Read all questions from the audit
const missingQuestions = [];

// We can extract them from scratch/missing-questions.json
const rawMissing = JSON.parse(fs.readFileSync('scratch/missing-questions.json', 'utf8'));
console.log('Total raw missing:', rawMissing.length);

let withMatchingJurisdictionAndTopic = 0;
let withoutRecordsInKB = 0;

const candidateMatches = [];

for (const item of rawMissing) {
  const parsed = parse({ question: item.question });
  const country = parsed.country || item.country;
  const intents = parsed.intents;

  // Find if SQLite has records for this country
  const countryRecords = records.filter(r => r.jurisdiction === country && r.status === 'approved');
  
  // Find if SQLite has records for this country AND matching topic/keywords
  const topicRecords = countryRecords.filter(r => {
    if (intents.includes(r.topic)) return true;
    if (r.topic === item.topic) return true;
    return false;
  });

  if (topicRecords.length > 0) {
    withMatchingJurisdictionAndTopic++;
    candidateMatches.push({
      id: item.id,
      country,
      topic: item.topic,
      intents,
      question: item.question,
      subject: requestedSubject(item.question),
      topicRecords: topicRecords.map(r => ({ id: r.id, title: r.title, topic: r.topic }))
    });
  } else {
    withoutRecordsInKB++;
  }
}

console.log(`With matching jurisdiction & topic records in KB: ${withMatchingJurisdictionAndTopic}`);
console.log(`Without matching topic records in KB: ${withoutRecordsInKB}`);

console.log('\nSample candidate matches:');
for (const c of candidateMatches.slice(0, 10)) {
  console.log(`[${c.id}] (${c.country} / ${c.topic}) Q: "${c.question.slice(0, 80)}..."`);
  console.log(`   Subject: "${c.subject}"`);
  console.log(`   Available records in KB:`, c.topicRecords.map(r => r.id));
}

