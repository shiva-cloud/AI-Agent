// scripts/list-all-edits-this-conv.js
import fs from 'node:fs';
import readline from 'node:readline';

const p = 'C:/Users/shiva/.gemini/antigravity/brain/2d623983-373b-44e5-9e72-12cbaee53cf3/.system_generated/logs/transcript_full.jsonl';
const rl = readline.createInterface({ input: fs.createReadStream(p), crlfDelay: Infinity });

let n = 0;
for await (const line of rl) {
  n++;
  if (line.includes('edit_file') && line.includes('server.js')) {
    const obj = JSON.parse(line);
    for (const tc of obj.tool_calls || []) {
      if (tc.name === 'edit_file' && tc.args.Path.includes('server.js')) {
        console.log(`Step ${n}: Target: ${tc.args.Target?.slice(0, 45).replace(/\n/g, ' ')}...`);
      }
    }
  }
}
