import { openStore } from '../src/store.js';

const store = openStore('data/settlement.sqlite');
const records = store.records().filter(r => r.topic === 'housing');
console.log(`Housing records: ${records.length}`);
records.forEach(r => console.log(`- ${r.id} [${r.jurisdiction}] subject:${r.housingSubject} -> ${r.title}`));
store.close();
