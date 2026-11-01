// scripts/find-compare-all.js
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const brainDir = 'C:/Users/shiva/.gemini/antigravity/brain';
const convDirs = fs.readdirSync(brainDir);

for (const dir of convDirs) {
  const p = path.join(brainDir, dir, '.system_generated', 'logs', 'transcript_full.jsonl');
  if (!fs.existsSync(p)) continue;
  const rl = readline.createInterface({ input: fs.createReadStream(p), crlfDelay: Infinity });
  let n = 0;
  for await (const line of rl) {
    n++;
    if (line.includes("path==='/v1/tools/compare-cities'")) {
      console.log(`Conv ${dir} Step ${n}`);
    }
  }
}
