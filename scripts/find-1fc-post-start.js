// scripts/find-1fc-post-start.js
import fs from 'node:fs';
import readline from 'node:readline';

const p = 'C:/Users/shiva/.gemini/antigravity/brain/1fc8bc7d-d1f7-49ab-96d0-ab33882e90fc/.system_generated/logs/transcript_full.jsonl';
const rl = readline.createInterface({ input: fs.createReadStream(p), crlfDelay: Infinity });

let n = 0;
for await (const line of rl) {
  n++;
  if (line.includes('read_file') && line.includes('server.js')) {
    const obj = JSON.parse(line);
    for (const tc of obj.tool_calls || []) {
      if (tc.name === 'read_file' && tc.args.StartLine >= 2700 && tc.args.StartLine <= 2760) {
        console.log(`Step ${n}: lines ${tc.args.StartLine}-${tc.args.EndLine}`);
      }
    }
  }
}
