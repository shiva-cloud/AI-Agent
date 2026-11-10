import { answer, parse, retrieve } from '../src/engine.js';
import { openStore } from '../src/store.js';
import { requestedSubject, subjectEvidenceMatcher } from '../src/requested-subject.js';

const store = openStore();
const records = store.records();

const testQueries = [
  'Where can I find official information about child benefit in Canada?',
  'Where can I find official information about parental leave in Canada?',
  'Where can I find official information about credit building in Canada?',
  'Where can I find official information about foreign rental income in Canada?',
  'Where can I find official information about open work permit in Canada?',
  'Where can I find official information about residency obligation in Canada?',
  'Where can I find official information about employment insurance in Canada?',
  'What does worker misclassification mean in Canada?',
  'What does unpaid overtime mean in Canada?',
  'Where can I find official information about cross-border transfers in Canada?'
];

for (const q of testQueries) {
  const ans = answer({ question: q }, records);
  const subj = requestedSubject(q);
  const parsed = parse({ question: q });
  const candidates = retrieve(parsed, records);
  console.log(`Q: ${q}`);
  console.log(`   claims: ${ans.claims.length}, gaps: ${ans.gaps.map(g => g.reason).join(', ') || 'none'}`);
  console.log(`   subject: "${subj}", intents: [${parsed.intents.join(', ')}]`);
  console.log(`   top candidate: ${candidates[0]?.id || 'none'} (score: ${candidates[0]?.score || 0})`);
  if (candidates[0]) {
    const matcher = subjectEvidenceMatcher(q);
    console.log(`   matchesSubject: ${matcher(candidates[0])}`);
  }
}

