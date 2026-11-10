import { openStore } from '../src/store.js';
import { parse, retrieve, answer } from '../src/engine.js';
import { requestedSubject, subjectEvidenceMatcher } from '../src/requested-subject.js';

const store = openStore();
const records = store.records();

const testQs = [
  // 1. mental health support in Australia
  'Where can I find official information about mental health support in Australia?',
  // 2. roommate tenancy status in New Zealand
  'How do I start the process for roommate tenancy status in New Zealand?',
  // 3. foreign licence exchange in New Zealand
  'Where can I find official information about foreign licence exchange in New Zealand?',
  // 4. family doctor registration in United Kingdom
  'Where can I find official information about family doctor registration in United Kingdom?',
  // 5. accessible transit in New Zealand
  'Which documents are normally needed for accessible transit in New Zealand?',
  // 6. parental leave in United Arab Emirates
  'Where can I find official information about parental leave in United Arab Emirates?',
  // 7. credit building in United States
  'Where can I find official information about credit building in United States?',
  // 8. unpaid overtime in United States
  'Where can I find official information about unpaid overtime in United States?',
  // 9. refugee health coverage in Germany
  'Where can I find official information about refugee health coverage in Germany?',
  // 10. used vehicle purchase in Australia
  'Where can I find official information about used vehicle purchase in Australia?'
];

for (const q of testQs) {
  console.log('----------------------------------------------------');
  console.log('Q:', q);
  const parsed = parse({ question: q });
  const subj = requestedSubject(q);
  const matcher = subjectEvidenceMatcher(q);
  const cands = retrieve(parsed, records);
  const ans = answer({ question: q }, records);
  console.log(`Parsed intents: [${parsed.intents.join(', ')}], country: ${parsed.country}, city: ${parsed.city}`);
  console.log(`Requested subject: "${subj}"`);
  console.log(`Claims: ${ans.claims.length}, Status: ${ans.status}, Gaps: ${ans.gaps.map(g => g.reason).join(', ')}`);
  console.log(`Candidates count: ${cands.length}`);
  if (cands.length > 0) {
    for (const c of cands.slice(0, 3)) {
      console.log(`  Cand: ${c.id} (Score: ${c.score.toFixed(2)}) matcher: ${matcher(c)} available: ${c.available} topic: ${c.topic}`);
    }
  } else {
    // Check if there are any records in store for this country and topic
    const matchedCountry = records.filter(r => (r.jurisdiction === parsed.country || r.destinationCountry === parsed.country));
    console.log(`  No candidates retrieved! Total records in store for country ${parsed.country}: ${matchedCountry.length}`);
    const matchedTopic = matchedCountry.filter(r => parsed.intents.includes(r.topic));
    console.log(`  Records in store for ${parsed.country} with intents [${parsed.intents.join(', ')}]: ${matchedTopic.length}`);
    if (matchedTopic.length > 0) {
      console.log(`  Sample records for country+intent:`, matchedTopic.slice(0, 3).map(r => r.id));
    }
  }
}

