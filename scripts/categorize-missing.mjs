import fs from 'node:fs';
import { openStore } from '../src/store.js';
import { requestedSubject } from '../src/requested-subject.js';

const rawMissing = JSON.parse(fs.readFileSync('scratch/missing-questions.json', 'utf8'));
const store = openStore();
const records = store.records().filter(r => r.status === 'approved');

const fixableByTopic = {};
const unfixableTrueGaps = {};

for (const m of rawMissing) {
  const subject = requestedSubject(m.question);
  const countryRecs = records.filter(r => r.jurisdiction === m.country || r.jurisdiction === m.parsedCountry);
  
  // Find if any record in country matches words from the subject
  const subWords = subject ? subject.toLowerCase().split(/\s+/).filter(w => w.length > 3) : [];
  const relatedRecs = countryRecs.filter(r => {
    const text = (r.title + ' ' + (r.summary || '')).toLowerCase();
    return subWords.some(w => text.includes(w));
  });

  if (relatedRecs.length > 0) {
    if (!fixableByTopic[m.topic]) fixableByTopic[m.topic] = [];
    fixableByTopic[m.topic].push({
      id: m.id,
      country: m.country,
      question: m.question,
      subject,
      matchedRecords: relatedRecs.map(r => r.id)
    });
  } else {
    if (!unfixableTrueGaps[m.topic]) unfixableTrueGaps[m.topic] = [];
    unfixableTrueGaps[m.topic].push({
      id: m.id,
      country: m.country,
      question: m.question,
      subject
    });
  }
}

console.log('=== SUMMARY OF MISSING QUESTIONS ===');
let totalFixable = 0;
let totalTrueGaps = 0;

for (const topic of Object.keys({ ...fixableByTopic, ...unfixableTrueGaps })) {
  const fixCount = fixableByTopic[topic]?.length || 0;
  const gapCount = unfixableTrueGaps[topic]?.length || 0;
  totalFixable += fixCount;
  totalTrueGaps += gapCount;
  console.log(`${topic.padEnd(20)} | Fixable with existing KB records: ${String(fixCount).padStart(3)} | True Gaps (no record in KB): ${String(gapCount).padStart(3)}`);
}

console.log(`\nTOTAL FIXABLE: ${totalFixable}`);
console.log(`TOTAL TRUE GAPS: ${totalTrueGaps}`);

fs.writeFileSync('scratch/fixable-missing.json', JSON.stringify(fixableByTopic, null, 2));
fs.writeFileSync('scratch/true-gaps.json', JSON.stringify(unfixableTrueGaps, null, 2));

