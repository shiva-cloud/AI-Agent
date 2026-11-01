import fs from 'node:fs';

const content = fs.readFileSync('corpus/market_gap_questions_80001_100000.md', 'utf8');

const blocks = [];
for (let id = 80001; id <= 82000; id += 200) {
  const marker = `### GMS-MKT-Q${id} `;
  const start = content.indexOf(marker);
  if (start !== -1) {
    const textStart = content.indexOf('\n', start);
    const line2 = content.indexOf('\n', textStart + 1);
    const qLine = content.slice(textStart + 1, line2).trim();
    blocks.push({ id, qLine });
  }
}

console.log('Batch 1 Scenario Blocks (every 200 questions):');
for (const b of blocks) {
  console.log(`- Q${b.id}: ${b.qLine}`);
}
