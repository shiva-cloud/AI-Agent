import fs from 'node:fs';

const d = JSON.parse(fs.readFileSync('artifacts/deep-5000-kb-audit-results.json', 'utf8'));

for (const s of d.topicResults.telecom_utilities.samples.missing) {
  if (s.id === 'GMS-Q00417') {
    console.log('Sample GMS-Q00417:', s);
  }
}

