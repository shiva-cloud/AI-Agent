import fs from 'fs';
import { openStore } from '../src/store.js';
import { answer } from '../src/engine.js';
import { requestedSubject } from '../src/requested-subject.js';

const store = openStore();
const records = store.records();
const data = JSON.parse(fs.readFileSync('scripts/actual-missing.json', 'utf8'));
const unknowns = data.missingList.filter(m => m.subj === null);

console.log('Testing sample of previously unknown questions:');
for (const u of unknowns.slice(0, 10)) {
  const ans = answer({ question: u.question }, records);
  console.log('Q:', u.question);
  console.log('   claims:', ans.claims.length, 'status:', ans.status, 'gaps:', ans.gaps.map(g => g.reason).join(', '));
}

