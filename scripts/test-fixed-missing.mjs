// scripts/test-fixed-missing.mjs
import fs from 'node:fs';
import { openStore } from '../src/store.js';
import { answer } from '../src/engine.js';

const store = openStore();
const records = store.records();
const missing = JSON.parse(fs.readFileSync('artifacts/all-missing-questions.json', 'utf8'));

let fixedCount = 0;
let stillMissingCount = 0;
const stillMissingByTopic = {};

for (const m of missing) {
  let res;
  try {
    res = answer({ question: m.question }, records);
  } catch (e) {
    res = { status: 'error', claims: [], gaps: [{ reason: e.message }] };
  }

  const claims = res.claims || [];
  const gaps = res.gaps || [];
  const clarification = res.clarification || '';

  const hasUnsupportedPlace = res.placeClarification?.reason === 'unsupported_place' ||
                              gaps.some(g => g.reason === 'missing_or_unsupported_geography') ||
                              (clarification && /outside our verified|does not cover that place|outside Canada/i.test(clarification));

  const isMissing = res.status === 'unavailable' ||
                    res.status === 'partial' ||
                    (claims.length === 0 && gaps.length > 0 && !hasUnsupportedPlace);

  if (claims.length > 0) {
    fixedCount++;
  } else if (isMissing) {
    stillMissingCount++;
    stillMissingByTopic[m.topicKey] = (stillMissingByTopic[m.topicKey] || 0) + 1;
  }
}

console.log(`Original Missing: ${missing.length}`);
console.log(`Now Fixed (Claims > 0): ${fixedCount}`);
console.log(`Still Missing: ${stillMissingCount}`);
console.log('Still Missing by Topic:', JSON.stringify(stillMissingByTopic, null, 2));
