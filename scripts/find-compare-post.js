// scripts/find-compare-post.js
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const p = 'C:/Users/shiva/.gemini/antigravity/brain/1fc8bc7d-d1f7-49ab-96d0-ab33882e90fc/.system_generated/logs/transcript_full.jsonl';
const rl = readline.createInterface({ input: fs.createReadStream(p), crlfDelay: Infinity });

let n = 0;
for await (const line of rl) {
  n++;
  if (line.includes("path==='/v1/tools/compare-cities'") && line.includes('input')) {
    console.log(`Step ${n} has compare-cities with input`);
  }
}
