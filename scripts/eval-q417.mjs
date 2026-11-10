import { answer } from '../src/engine.js';
import { openStore } from '../src/store.js';

const store = openStore();
const records = store.records();

const qObj = {
  id: 'GMS-Q00417',
  question: 'How do I start the process for device unlocking in Scotland / Edinburgh?',
  country: 'United Kingdom'
};

const res = answer({ question: qObj.question }, records);
const claims = res.claims || [];
const sources = res.sources || [];
const gaps = res.gaps || [];
const clarification = res.clarification || '';
const hasUnsupportedPlace = res.placeClarification?.reason === 'unsupported_place' ||
                            gaps.some(g => g.reason === 'missing_or_unsupported_geography') ||
                            (clarification && /outside our verified|does not cover that place|outside Canada/i.test(clarification));

console.log('claims.length:', claims.length);
console.log('res.status:', res.status);
console.log('isMissing would be:', res.status === 'unavailable' || res.status === 'partial' || (claims.length === 0 && gaps.length > 0 && !hasUnsupportedPlace));

let category = 'sahi';
if (claims.length > 0) {
  category = 'sahi';
} else {
  category = 'missing';
}
console.log('Evaluated category:', category);

