// scripts/find-early-post-tools.js
import fs from 'node:fs';
import readline from 'node:readline';

const p = 'C:/Users/shiva/.gemini/antigravity/brain/2d623983-373b-44e5-9e72-12cbaee53cf3/.system_generated/logs/transcript_full.jsonl';
const rl = readline.createInterface({ input: fs.createReadStream(p), crlfDelay: Infinity });

let n = 0;
for await (const line of rl) {
  n++;
  if (line.includes("path==='/v1/tools/eviction-defense'") && line.includes('input')) {
    console.log(`Step ${n} has eviction-defense post`);
  }
}
