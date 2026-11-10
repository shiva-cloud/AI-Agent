import fs from 'fs';
import { openStore } from '../src/store.js';
import { parse, retrieve } from '../src/engine.js';

const data = JSON.parse(fs.readFileSync('scripts/actual-missing.json', 'utf8'));
const list = data.missingList;
const store = openStore();
const records = store.records();

// Read REQUIRED_SUBJECTS from engine.js
const engineCode = fs.readFileSync('src/engine.js', 'utf8');
const start = engineCode.indexOf('const REQUIRED_SUBJECTS');
const end = engineCode.indexOf('const coversRequiredSubjects');
const block = engineCode.substring(start, end).replace('const REQUIRED_SUBJECTS', 'globalThis.REQUIRED_SUBJECTS');
eval(block);
const REQUIRED_SUBJECTS = globalThis.REQUIRED_SUBJECTS;

let blockedByReqSubjects = 0;
const blockedRules = {};

for (const it of list) {
  const parsed = parse({ question: it.question });
  const cands = retrieve(parsed, records);
  if (!cands.length) continue;

  // Check if top candidate would pass if not for REQUIRED_SUBJECTS
  const top = cands[0];
  const text = `${top.title} ${top.summary}`;

  const failedRules = [];
  for (const [asked, needed] of REQUIRED_SUBJECTS) {
    if (asked.test(it.question) && !needed.test(text)) {
      failedRules.push({ asked: asked.source, needed: needed.source });
    }
  }

  if (failedRules.length > 0) {
    blockedByReqSubjects++;
    for (const r of failedRules) {
      const k = r.asked;
      blockedRules[k] = (blockedRules[k] || 0) + 1;
    }
  }
}

console.log(`Total missing: ${list.length}`);
console.log(`Blocked by REQUIRED_SUBJECTS on top candidate: ${blockedByReqSubjects}`);
console.log('Blocked rules counts:', Object.entries(blockedRules).sort((a, b) => b[1] - a[1]));
