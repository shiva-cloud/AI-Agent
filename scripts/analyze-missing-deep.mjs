import fs from 'fs';
import { openStore } from '../src/store.js';

const store = openStore();
const records = store.records();
const data = JSON.parse(fs.readFileSync('scripts/missing-analysis.json', 'utf8'));
const missing = data.missingItems;

console.log('Total missing in analysis:', missing.length);

const byCountry = {};
const byTopic = {};
const byCountryTopic = {};

for (const m of missing) {
  byCountry[m.country] = (byCountry[m.country] || 0) + 1;
  byTopic[m.topic] = (byTopic[m.topic] || 0) + 1;
  const ct = `${m.country} | ${m.topic}`;
  byCountryTopic[ct] = (byCountryTopic[ct] || 0) + 1;
}

console.log('\nTop Countries in Missing:');
for (const [c, n] of Object.entries(byCountry).sort((a,b) => b[1]-a[1])) {
  console.log(`  ${c}: ${n}`);
}

console.log('\nTop Topics in Missing:');
for (const [t, n] of Object.entries(byTopic).sort((a,b) => b[1]-a[1])) {
  console.log(`  ${t}: ${n}`);
}

console.log('\nTop Country x Topic combinations:');
for (const [ct, n] of Object.entries(byCountryTopic).sort((a,b) => b[1]-a[1]).slice(0, 25)) {
  console.log(`  ${ct}: ${n}`);
}

console.log('\n--- Records in SQLite Store ---');
const recCountryCounts = {};
for (const r of records) {
  const c = r.country || 'NO_COUNTRY';
  recCountryCounts[c] = (recCountryCounts[c] || 0) + 1;
}
for (const [c, n] of Object.entries(recCountryCounts).sort((a,b) => b[1]-a[1])) {
  console.log(`  ${c}: ${n}`);
}

console.log('\nSample record keys:', Object.keys(records[0]));
console.log('Sample record 0:', { id: records[0].id, title: records[0].title, jurisdiction: records[0].jurisdiction, topic: records[0].topic });
const jurisdictions = {};
for (const r of records) {
  jurisdictions[r.jurisdiction] = (jurisdictions[r.jurisdiction] || 0) + 1;
}
console.log('\nTop Jurisdictions:');
for (const [j, n] of Object.entries(jurisdictions).sort((a,b) => b[1]-a[1]).slice(0, 30)) {
  console.log(`  ${j}: ${n}`);
}
