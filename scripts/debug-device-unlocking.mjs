import { answer, retrieve, parse } from '../src/engine.js';
import { openStore } from '../src/store.js';

const store = openStore();
const records = store.records();

const q = "How do I start the process for device unlocking in Scotland / Edinburgh?";
const parsed = parse({ question: q });
console.log('Parsed:', JSON.stringify(parsed, null, 2));

const rec = records.find(r => r.id === 'uk-ofcom-device-unlocking-rules-kyc');
console.log('Target record:', rec);

const res = answer({ question: q }, records);
console.log('Answer status:', res.status);
console.log('Claims:', res.claims);
console.log('Gaps:', res.gaps);

// Test retrieve
const retrieved = retrieve(parsed, records);
console.log('Retrieved count:', retrieved.length);
for (const r of retrieved.slice(0, 5)) {
  console.log(`- ${r.id}: score=${r.score}, available=${r.available}, reason=${r.reason}`);
}

