// scripts/print-1fc-steps.js
import fs from 'node:fs';
import readline from 'node:readline';

const p = 'C:/Users/shiva/.gemini/antigravity/brain/1fc8bc7d-d1f7-49ab-96d0-ab33882e90fc/.system_generated/logs/transcript_full.jsonl';
const rl = readline.createInterface({ input: fs.createReadStream(p), crlfDelay: Infinity });

let n = 0;
const targets = [1489, 1491, 1499, 1501, 1363];
for await (const line of rl) {
  n++;
  if (targets.includes(n)) {
    const obj = JSON.parse(line);
    console.log(`=== 1fc Step ${n} ===`);
    console.log(obj.content);
  }
}
