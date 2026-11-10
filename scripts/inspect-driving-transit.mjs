// scripts/inspect-driving-transit.mjs
import { openStore } from '../src/store.js';
import { parse, retrieve, answer } from '../src/engine.js';
import { requestedSubject, subjectEvidenceMatcher } from '../src/requested-subject.js';

const store = openStore();
const records = store.records();

const questions = [
  "Is commute planning handled by a federal, provincial, state or local authority in Canada?",
  "Is regional transfers handled by a federal, provincial, state or local authority in Canada?",
  "Where can I find official information about licence expiry in Ontario / Toronto?",
  "How do I start the process for used vehicle purchase in Ontario / Toronto?",
  "What does public transit fare mean in Ontario / Toronto?",
  "Is winter tires handled by a federal, provincial, state or local authority in Canada?"
];

for (const q of questions) {
  console.log(`\n======================================================`);
  console.log(`QUESTION: ${q}`);
  console.log(`======================================================`);
  const parsed = parse({ question: q });
  console.log('intents:', parsed.intents, 'country:', parsed.country, 'region:', parsed.region, 'city:', parsed.city);
  const subj = requestedSubject(q);
  console.log('requestedSubject:', subj);
  const coversNamed = subjectEvidenceMatcher(q);
  const candidates = retrieve(parsed, records);
  console.log('candidates count:', candidates.length);
  const res = answer({ question: q }, records);
  console.log('answer status:', res.status, 'claims:', res.claims.length, 'gaps:', res.gaps);
  if (candidates.length > 0) {
    for (const c of candidates.slice(0, 3)) {
      console.log(`  Candidate: ${c.id} (${c.topic}) score: ${c.score} coversNamed: ${coversNamed(c)}`);
      console.log(`    title: ${c.title}`);
    }
  }
}

