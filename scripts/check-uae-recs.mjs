import { openStore } from '../src/store.js';

const store = openStore();
const records = store.records();

const uaeRecs = records.filter(r => r.jurisdiction === 'United Arab Emirates' || r.jurisdiction === 'UAE');
console.log('Total UAE records:', uaeRecs.length);
for (const r of uaeRecs) {
  console.log(`- [${r.id}] (${r.topic}): "${r.title}" (status: ${r.status})`);
}

