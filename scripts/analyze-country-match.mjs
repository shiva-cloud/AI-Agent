import fs from 'fs';
import { openStore } from '../src/store.js';
import { parse, retrieve } from '../src/engine.js';

const data = JSON.parse(fs.readFileSync('scripts/actual-missing.json', 'utf8'));
const list = data.missingList;
const store = openStore();
const records = store.records();

let hasCandidateSameCountry = 0;
let noCandidateSameCountry = 0;

const sameCountryExamples = [];
const noCandidateExamples = [];

for (const it of list) {
  const parsed = parse({ question: it.question });
  const cands = retrieve(parsed, records);
  
  // Check if any candidate has jurisdiction matching parsed.country / it.country
  const matching = cands.filter(c => {
    if (!parsed.country) return false;
    const jur = (c.jurisdiction || '').toLowerCase();
    const ctry = (parsed.country || '').toLowerCase();
    return jur.includes(ctry) || ctry.includes(jur) || (parsed.country === 'CA' && ['on', 'bc', 'ab', 'qc', 'ns', 'nb', 'mb', 'sk', 'nl', 'pe', 'yt', 'nt', 'nu', 'ca'].includes(jur));
  });

  if (matching.length > 0) {
    hasCandidateSameCountry++;
    if (sameCountryExamples.length < 15) {
      sameCountryExamples.push({
        id: it.id,
        q: it.question,
        country: parsed.country,
        topCand: matching[0].id,
        topCandTitle: matching[0].title,
        topCandScore: matching[0].score,
        topCandJur: matching[0].jurisdiction
      });
    }
  } else {
    noCandidateSameCountry++;
    if (noCandidateExamples.length < 15) {
      noCandidateExamples.push({
        id: it.id,
        q: it.question,
        country: parsed.country,
        candsCount: cands.length,
        firstCand: cands[0] ? `${cands[0].id} (${cands[0].jurisdiction})` : 'none'
      });
    }
  }
}

console.log(`Total missing: ${list.length}`);
console.log(`Has candidate in same country: ${hasCandidateSameCountry}`);
console.log(`NO candidate in same country: ${noCandidateSameCountry}`);

console.log('\n--- Examples with matching candidate in same country ---');
console.log(JSON.stringify(sameCountryExamples, null, 2));

console.log('\n--- Examples with NO candidate in same country ---');
console.log(JSON.stringify(noCandidateExamples, null, 2));

