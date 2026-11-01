// scripts/find-method-get.js
import fs from 'node:fs';
import readline from 'node:readline';

const p = 'C:/Users/shiva/.gemini/antigravity/brain/37e39c42-9d23-4149-b061-4879848a1553/.system_generated/logs/transcript_full.jsonl';
const rl = readline.createInterface({ input: fs.createReadStream(p), crlfDelay: Infinity });

let n = 0;
for await (const line of rl) {
  n++;
  if (line.includes("req.method==='GET'")) {
    console.log(`Step ${n} mentions req.method==='GET'`);
  }
}
