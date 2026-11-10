import fs from 'node:fs';
import { requestedSubject } from '../src/requested-subject.js';

const fixable = JSON.parse(fs.readFileSync('scratch/fixable-missing.json', 'utf8'));

const allSubjects = [];
for (const items of Object.values(fixable)) {
  for (const item of items) {
    if (item.subject) allSubjects.push(item.subject);
  }
}

console.log('Total subjects:', allSubjects.length);

const wordFreq = {};
for (const s of allSubjects) {
  const words = s.toLowerCase().split(/\s+/);
  for (const w of words) {
    wordFreq[w] = (wordFreq[w] || 0) + 1;
  }
}

const sorted = Object.entries(wordFreq).sort((a, b) => b[1] - a[1]);
console.log('Top 40 subject words across fixable questions:');
for (const [w, c] of sorted.slice(0, 40)) {
  console.log(`  ${w.padEnd(20)}: ${c}`);
}

