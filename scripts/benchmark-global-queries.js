import { answer } from '../src/engine.js';
import { openStore } from '../src/store.js';

const store = openStore();
const records = store.records();
const now = new Date('2026-10-30T12:00:00Z');

const queries = [
  // United States
  { q: 'How do I apply for a Social Security Number in the United States?', country: 'United States', expectedTopic: 'sin' },
  { q: 'What is the security deposit limit and escrow rules in the United States?', country: 'United States', expectedTopic: 'housing' },
  { q: 'How does Form I-9 right to work verification work in the United States?', country: 'United States', expectedTopic: 'employment' },
  { q: 'What are the rules for enrolling children in school under Plyler in the United States?', country: 'United States', expectedTopic: 'family' },

  // United Kingdom
  { q: 'How do I apply for a National Insurance Number in the UK?', country: 'United Kingdom', expectedTopic: 'sin' },
  { q: 'How do I register with a GP surgery for NHS healthcare in the UK?', country: 'United Kingdom', expectedTopic: 'health' },
  { q: 'What is the Tenancy Deposit Scheme 5-week cap in the UK?', country: 'United Kingdom', expectedTopic: 'housing' },
  { q: 'How does the digital right to work share code work in the UK?', country: 'United Kingdom', expectedTopic: 'employment' },

  // Australia
  { q: 'How do I apply for a Tax File Number in Australia?', country: 'Australia', expectedTopic: 'sin' },
  { q: 'What is Medicare enrollment and healthcare in Australia?', country: 'Australia', expectedTopic: 'health' },
  { q: 'What is the 100-point bank identity check in Australia?', country: 'Australia', expectedTopic: 'money' },
  { q: 'What are the rental bond lodgement rules in Australia?', country: 'Australia', expectedTopic: 'housing' },

  // Germany
  { q: 'How do I complete Anmeldung address registration and get a Steuer-ID in Germany?', country: 'Germany', expectedTopic: 'sin' },
  { q: 'How does statutory health insurance GKV enrollment work in Germany?', country: 'Germany', expectedTopic: 'health' },
  { q: 'What are the Mietkaution 3-month deposit installment rules in Germany?', country: 'Germany', expectedTopic: 'housing' },

  // United Arab Emirates
  { q: 'How do I get an Emirates ID and Golden Visa in the UAE?', country: 'United Arab Emirates', expectedTopic: 'employment' },
  { q: 'What is the Ejari tenancy registration in the UAE?', country: 'United Arab Emirates', expectedTopic: 'housing' },

  // New Zealand
  { q: 'How do I get an IRD tax number in New Zealand?', country: 'New Zealand', expectedTopic: 'sin' },
  { q: 'What is the 4-week rental bond limit with Tenancy Services in New Zealand?', country: 'New Zealand', expectedTopic: 'housing' },

  // Ireland
  { q: 'How do I apply for a PPS Number in Ireland?', country: 'Ireland', expectedTopic: 'sin' },
  { q: 'What are tenant rights and rent pressure zones under RTB in Ireland?', country: 'Ireland', expectedTopic: 'housing' },
  { q: 'How does the Critical Skills Employment Permit work in Ireland?', country: 'Ireland', expectedTopic: 'employment' }
];

console.log('Testing Global Settlement Engine across all destination countries...\n');
let passed = 0;

for (const { q, country, expectedTopic } of queries) {
  const res = answer({ question: q, country }, records, now);
  const ok = res.status !== 'clarification' && res.claims.length > 0 && res.sources.some(s => s.jurisdiction === country);
  if (ok) {
    passed++;
    console.log(`[PASS] [${country.padEnd(20)}] Claims: ${res.claims.length} | Sources: ${res.sources.length} | Top: ${res.sources[0]?.id}`);
  } else {
    console.log(`[FAIL] [${country.padEnd(20)}] Status: ${res.status} | Clarification: ${res.clarification} | Gaps: ${JSON.stringify(res.gaps)}`);
  }
}

console.log(`\nResult: ${passed}/${queries.length} passed.`);
if (passed === queries.length) {
  console.log('ALL GLOBAL SETTLEMENT QUERIES PASS 100%!');
} else {
  process.exitCode = 1;
}
store.db.close();
