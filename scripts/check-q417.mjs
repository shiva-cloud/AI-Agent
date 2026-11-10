import fs from 'node:fs';
import readline from 'node:readline';

const f2 = 'corpus/global_immigration_settlement_20000_questions.md';
const rl = readline.createInterface({ input: fs.createReadStream(f2) });
for await (const line of rl) {
  if (line.includes('GMS-Q00417')) {
    console.log(line);
  }
}

