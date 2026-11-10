import { openStore } from '../src/store.js';
import { answer } from '../src/engine.js';

const store = openStore('data/test-settlement.sqlite');
const records = store.records();
const now = new Date('2026-11-10T12:00:00Z');

const questions = [
  "I'm a recently arrived worker in Ontario, Canada. portal shows zero documents after successful upload; what should I do first, and which authority can actually help?",
  "I was told two different things about portal shows zero documents after successful upload in New South Wales, Australia. How can I check the applicable rule and its effective date?",
  "I'm worried that portal shows zero documents after successful upload in Wales, United Kingdom may affect my family. Which facts about dependants and custody matter?",
  "I have only 48 hours to respond after portal shows zero documents after successful upload in Madrid, Spain. How do I identify urgent versus non-urgent steps?"
];

for (const q of questions) {
  const res = answer({ question: q }, records, now);
  console.log('Q:', q.slice(0, 70));
  console.log('   Status:', res.status, 'claims:', res.claims?.length, 'parsedCountry:', res.parsed?.country, 'intents:', res.parsed?.intents);
  console.log('   Gaps:', JSON.stringify(res.gaps));
}

store.db.close();

