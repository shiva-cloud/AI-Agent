// scripts/inspect-answers.js
import fs from 'node:fs';

const lines = fs.readFileSync('src/server.js', 'utf8').split('\n');
const idx = lines.findIndex(l => l.includes("path==='/v1/answers'"));
console.log('Idx:', idx);
if (idx !== -1) {
  console.log(lines.slice(idx - 5, idx + 40).map((l, i) => `${idx - 4 + i}: ${l}`).join('\n'));
}
