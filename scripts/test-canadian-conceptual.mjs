import { parse, retrieve, answer } from '../src/engine.js';
import { openStore } from '../src/store.js';

const store = openStore();
const records = store.records();

const testQs = [
  "What does minimum wage mean in Canada?",
  "Where can I find official information about licence expiry in Canada?",
  "What does car insurance mean in Canada?",
  "Is family doctor registration handled by a federal, provincial, state or local authority in Canada?",
  "Where can I find official information about rental application without credit in Canada?",
  "What does roommate tenancy status mean in Canada?"
];

console.log('--- Testing without change ---');
for (const q of testQs) {
  const res = answer({ question: q }, records);
  console.log(`Q: "${q}" -> Status: ${res.status}, Claims: ${res.claims?.length}`);
}
