import { openStore } from '../src/store.js';

const store = openStore();
const records = store.records();

const se = records.filter(r => r.jurisdiction === 'Sweden');
console.log('Sweden records:', se.length);
for (const r of se) {
  console.log(`- [${r.id}] (${r.topic}): "${r.title}"`);
}

