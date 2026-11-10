import fs from 'fs';
import { openStore } from '../src/store.js';
import { answer } from '../src/engine.js';

const store = openStore();
const records = store.records();

const results = JSON.parse(fs.readFileSync('artifacts/deep-5000-kb-audit-results.json', 'utf8'));

// Get all missing from all topics
let allMissing = [];
for (const tc of Object.values(results.topicResults)) {
  for (const s of tc.samples?.missing || []) {
    allMissing.push(s);
  }
}

console.log('Sample missing count in JSON:', allMissing.length);

let nowSahi = 0;
let nowReqIgnored = 0;
let stillMissingCount = 0;
const stillMissingList = [];

for (const s of allMissing) {
  const res = answer({ question: s.question }, records);
  const claims = res.claims || [];
  const gaps = res.gaps || [];
  const clarification = res.clarification || '';

  const hasUnsupportedPlace = res.placeClarification?.reason === 'unsupported_place' ||
                              gaps.some(g => g.reason === 'missing_or_unsupported_geography') ||
                              (clarification && /outside our verified|does not cover that place|outside Canada/i.test(clarification));

  if (claims.length > 0) {
    nowSahi++;
  } else if (hasUnsupportedPlace) {
    nowReqIgnored++;
  } else {
    stillMissingCount++;
    stillMissingList.push(s);
  }
}

console.log(`Out of ${allMissing.length} sampled missing:`);
console.log(`Now Sahi (claims > 0): ${nowSahi}`);
console.log(`Now ReqIgnored: ${nowReqIgnored}`);
console.log(`Still Missing: ${stillMissingCount}`);

if (stillMissingList.length > 0) {
  console.log('\nStill missing sample:');
  for (const it of stillMissingList.slice(0, 10)) {
    console.log(`[${it.id}] (${it.country}): ${it.question}`);
  }
}

