import { openStore } from '../src/store.js';

const store = openStore();
const recs = store.records().filter(r => /overtime/i.test(r.title + ' ' + (r.summary || '')));
console.log('Records mentioning overtime:', recs.length);
for (const r of recs) {
  console.log(`- [${r.id}] (${r.jurisdiction}): ${r.title}`);
}

