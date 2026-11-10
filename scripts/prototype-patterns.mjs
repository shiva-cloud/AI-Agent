import { openStore } from '../src/store.js';
import { parse, retrieve, answer } from '../src/engine.js';
import { requestedSubject, subjectEvidenceMatcher } from '../src/requested-subject.js';

const store = openStore();
const records = store.records();

// Test the questions with simulated pattern extraction
const q = 'What common misconceptions about closed work permit job loss should a temporary foreign worker in Wellington, New Zealand avoid?';
const parsed = parse({ question: q });
const cands = retrieve(parsed, records);
console.log('Top candidate for NZ closed work permit job loss:', cands[0]?.id, cands[0]?.score);
const rec = cands[0];
console.log('Record title:', rec.title);
console.log('Record summary:', rec.summary);

