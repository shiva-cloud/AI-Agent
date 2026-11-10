import fs from 'node:fs';

const d = JSON.parse(fs.readFileSync('artifacts/deep-5000-kb-audit-results.json', 'utf8'));

console.log('=== LATEST MISSING SAMPLES PER TOPIC ===');
for (const [k, v] of Object.entries(d.topicResults)) {
  console.log(`\n--- Topic: ${k} (Total Missing: ${v.missing}) ---`);
  for (const s of v.samples.missing || []) {
    console.log(`[${s.id}] (${s.country}): "${s.question}"`);
    console.log(`   Reason: ${s.reasonDetail}`);
  }
}
