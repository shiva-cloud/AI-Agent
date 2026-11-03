// scripts/print-180-205.js
import fs from 'node:fs';

const lines = fs.readFileSync('src/server.js', 'utf8').split('\n');
console.log(lines.slice(180, 210).map((l, i) => `${181 + i}: ${l}`).join('\n'));
