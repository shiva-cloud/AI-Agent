import { openStore } from '../src/store.js';
import { parse, retrieve, answer } from '../src/engine.js';

const store = openStore();
const records = store.records();
const q = 'What common misconceptions about closed work permit job loss should a temporary foreign worker in Wellington, New Zealand avoid?';

const ans = answer({ question: q }, records);
console.log('Result:', JSON.stringify(ans, null, 2));
