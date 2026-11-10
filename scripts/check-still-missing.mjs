import fs from 'fs';
import { openStore } from '../src/store.js';
import { answer } from '../src/engine.js';

const data = JSON.parse(fs.readFileSync('scripts/actual-missing.json', 'utf8'));
const list = data.missingList;
const store = openStore();
const records = store.records();

let nowClaims = 0;
let nowMissing = 0;
let nowReqIgnored = 0;
const stillMissing = [];

for (const it of list) {
  const ans = answer({ question: it.question }, records);
  const claims = ans.claims || [];
  const gaps = ans.gaps || [];
  const clar = ans.clarification || '';
  const hasUnsupportedPlace = ans.placeClarification?.reason === 'unsupported_place' ||
                              gaps.some(g => g.reason === 'missing_or_unsupported_geography') ||
                              (clar && /outside our verified|does not cover that place|outside Canada/i.test(clar));

  if (hasUnsupportedPlace) {
    nowReqIgnored++;
  } else if (claims.length > 0) {
    nowClaims++;
  } else {
    nowMissing++;
    stillMissing.push({ id: it.id, topicKey: it.topicKey, country: it.country, q: it.question });
  }
}

console.log(`Out of the 467 logged missing:`);
console.log(`Now answering with claims: ${nowClaims}`);
console.log(`Now reqIgnored: ${nowReqIgnored}`);
console.log(`Still missing: ${nowMissing}`);

fs.writeFileSync('scripts/still-missing.json', JSON.stringify({ count: stillMissing.length, stillMissing }, null, 2));

