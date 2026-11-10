import fs from 'node:fs';
import readline from 'node:readline';
import { openStore } from '../src/store.js';
import { parse, answer } from '../src/engine.js';
import { requestedSubject, subjectEvidenceMatcher } from '../src/requested-subject.js';

const store = openStore();
const records = store.records().filter(r => r.status === 'approved');

// Load all 5000 questions from the 3 files
const questions = [];

// 1. f1
const f1 = 'corpus/global_immigration_social_questions_40001_60000.md';
if (fs.existsSync(f1)) {
  const rl1 = readline.createInterface({ input: fs.createReadStream(f1) });
  for await (const line of rl1) {
    const match = line.match(/^(\d+)\.\s+\*\*\[(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\]\*\*\s*(.*)$/);
    if (!match) continue;
    questions.push({ id: `SOC-${match[1]}`, country: match[2].trim(), cat: match[4].trim(), question: match[5].trim() });
    if (questions.length >= 4000) break;
  }
}

// 2. f2
const f2 = 'corpus/global_immigration_settlement_20000_questions.md';
if (fs.existsSync(f2)) {
  const rl2 = readline.createInterface({ input: fs.createReadStream(f2) });
  for await (const line of rl2) {
    const match = line.match(/- \*\*(GMS-Q\d+)\*\*\s+\[(.*?)\s*\|\s*(.*?)\]\s*(.*)$/);
    if (!match) continue;
    questions.push({ id: match[1], topic: match[2].trim(), country: match[3].trim(), question: match[4].trim() });
    if (questions.length >= 6000) break;
  }
}

console.log(`Loaded ${questions.length} sample questions.`);

const missedOpportunities = [];

for (const qObj of questions) {
  const res = answer({ question: qObj.question }, records);
  if (res.claims?.length > 0) continue; // Already answered!
  
  const hasUnsupportedPlace = res.placeClarification?.reason === 'unsupported_place' ||
                              res.gaps?.some(g => g.reason === 'missing_or_unsupported_geography') ||
                              (res.clarification && /outside our verified|does not cover that place|outside Canada/i.test(res.clarification));
  if (hasUnsupportedPlace) continue; // Outside scope, correctly ignored

  // Now, does any approved record in the KB closely match this question's subject?
  const subject = requestedSubject(qObj.question);
  if (!subject) continue;

  const countryRecs = records.filter(r => r.jurisdiction === qObj.country || (res.parsed?.country && r.jurisdiction === res.parsed.country));
  for (const r of countryRecs) {
    // Check if record title or quote directly contains the subject phrase or core words
    const subClean = subject.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').trim();
    const rTitle = (r.title + ' ' + (r.summary || '')).toLowerCase();
    
    // Check direct phrase or strong 2-word phrase
    const wordsInSub = subClean.split(/\s+/).filter(w => w.length > 3);
    const matchCount = wordsInSub.filter(w => rTitle.includes(w)).length;
    
    if (matchCount >= 2 && wordsInSub.length >= 2) {
      missedOpportunities.push({
        qId: qObj.id,
        country: qObj.country,
        question: qObj.question,
        subject,
        recordId: r.id,
        recordTitle: r.title,
        status: res.status,
        gaps: res.gaps?.map(g => g.reason)
      });
      break;
    }
  }
}

console.log(`Found ${missedOpportunities.length} missed opportunities where KB has matching record!`);
console.log('\nTop 15 missed opportunities:');
for (const m of missedOpportunities.slice(0, 15)) {
  console.log(`[${m.qId}] (${m.country}) Q: "${m.question}"`);
  console.log(`   Subject: "${m.subject}" -> Record [${m.recordId}]: "${m.recordTitle}"`);
  console.log(`   Gaps:`, m.gaps);
}

fs.writeFileSync('scratch/missed-opportunities.json', JSON.stringify(missedOpportunities, null, 2));

