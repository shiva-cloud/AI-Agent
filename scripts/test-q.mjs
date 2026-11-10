import { answer } from '../src/engine.js';
import { openStore } from '../src/store.js';

const store = openStore();
const records = store.records();

const q = 'How do I start the process for device unlocking in Scotland / Edinburgh?';
const res = answer({ question: q }, records);

console.log('Direct call answer:');
console.log('status:', res.status);
console.log('claims length:', res.claims.length);
console.log('sources length:', res.sources.length);

