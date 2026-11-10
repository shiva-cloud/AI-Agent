import fs from 'node:fs';
import { parse, answer } from '../src/engine.js';
import { openStore } from '../src/store.js';
import { requestedSubject } from '../src/requested-subject.js';

const d = JSON.parse(fs.readFileSync('artifacts/deep-5000-kb-audit-results.json', 'utf8'));
const drivingSamples = d.topicResults.driving.samples.missing;
console.log('Driving missing samples:', drivingSamples.length);
for (const s of drivingSamples) {
  console.log(`[${s.id}] (${s.country}): "${s.question}"`);
  console.log(`  Reason: ${s.reasonDetail}`);
  const p = parse({ question: s.question });
  console.log(`  Parsed: intents=${p.intents}, city=${p.city}, country=${p.country}`);
  console.log(`  Subject: "${requestedSubject(s.question)}"`);
}

