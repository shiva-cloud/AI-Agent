// scripts/debug-one-question.mjs
import { openStore } from '../src/store.js';
import { parse, retrieve, answer } from '../src/engine.js';
import { requestedSubject, subjectEvidenceMatcher } from '../src/requested-subject.js';

const store = openStore();
const records = store.records();

const questions = [
  "How do I start the process for rental fraud in Washington / Seattle?",
  "What does housing subsidy mean in United Kingdom?",
  "Is school registration handled by a federal, provincial, state or local authority in United Kingdom?",
  "Where can I find official information about subletting in United Kingdom?",
  "Where can I find official information about regulated occupation licensing in Ontario / Toronto?",
  "Where can I find official information about emergency treatment without insurance in Ontario / Toronto?"
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
  console.log('candidates total:', candidates.length);
  for (const c of candidates.slice(0, 5)) {
    const covers = coversNamed(c);
    console.log(`  Candidate: ${c.id} (${c.topic}) - score: ${c.score}`);
    console.log(`    coversNamed: ${covers}`);
    console.log(`    title: ${c.title}`);
    console.log(`    summary: ${c.summary.slice(0, 100)}...`);
  }
  const res = answer({ question: q }, records);
  console.log('answer status:', res.status, 'claims:', res.claims.length, 'gaps:', res.gaps);
}

