import { openStore } from '../src/store.js';
import { answer } from '../src/engine.js';

const store = openStore();
const records = store.records();

const sampleQs = [
  "Who can use child benefit services in Queensland / Brisbane?",
  "How do I start the process for used vehicle purchase in Queensland / Brisbane?",
  "Which documents are normally needed for special education in Western Australia / Perth?",
  "Where can I find official information about vehicle import in United Arab Emirates?",
  "Which documents are normally needed for family reunification in Washington / Seattle?",
  "Which documents are normally needed for accessible transit in Ontario / Guelph?",
  "Who can use credit building services in Berlin?",
  "How do I start the process for retroactive rule changes in British Columbia / Surrey?",
  "How do I start the process for resume screening in Florida / Miami?",
  "Which documents are normally needed for student transit fares in Florida / Miami?"
];

for (const q of sampleQs) {
  const ans = answer({ question: q }, records);
  console.log('Q:', q);
  console.log(`   claims: ${ans.claims.length}, status: ${ans.status}, gaps: ${ans.gaps.map(g => g.reason).join(', ')}`);
}

