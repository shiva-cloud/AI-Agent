import { parse, retrieve, answer } from '../src/engine.js';
import { openStore } from '../src/store.js';
import { requestedSubject, subjectEvidenceMatcher } from '../src/requested-subject.js';

const store = openStore();
const records = store.records();

// Test the same 6 questions with simulated scope
const testQs = [
  "What does minimum wage mean in Canada?",
  "Where can I find official information about licence expiry in Canada?",
  "What does car insurance mean in Canada?",
  "Is family doctor registration handled by a federal, provincial, state or local authority in Canada?",
  "Where can I find official information about rental application without credit in Canada?",
  "What does roommate tenancy status mean in Canada?"
];

for (const q of testQs) {
  const parsed = parse({ question: q });
  console.log(`\nQ: "${q}"`);
  console.log(`  Parsed: intents=${parsed.intents}, country=${parsed.country}`);

  // Test with scope having CA, ON, BC
  const customScope = new Set(['CA', 'ON', 'BC']);
  const scoped = records.filter(r => customScope.has(r.jurisdiction) && parsed.intents.includes(r.topic) && r.status === 'approved');
  console.log(`  Scoped records count: ${scoped.length}`);

  const matcher = subjectEvidenceMatcher(q);
  const matching = scoped.filter(r => matcher(r));
  console.log(`  Matcher passing records: ${matching.length}`);
  for (const m of matching.slice(0, 2)) {
    console.log(`    - [${m.id}] (${m.jurisdiction}): "${m.title}"`);
  }
}
