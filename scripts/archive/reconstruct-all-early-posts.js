// scripts/reconstruct-all-early-posts.js
import fs from 'node:fs';
import readline from 'node:readline';

const p = 'C:/Users/shiva/.gemini/antigravity/brain/2d623983-373b-44e5-9e72-12cbaee53cf3/.system_generated/logs/transcript_full.jsonl';
const rl = readline.createInterface({ input: fs.createReadStream(p), crlfDelay: Infinity });

const steps = [
  106, 356, 577, 674, 785, 894, 1000, 1106, 1237, 1320, 1393, 1475, 1561, 1680, 1765, 1844, 1961, 2078, 2219, 2340, 2445, 2532, 2628, 2781, 2866, 3032, 3706, 3799, 3894, 3980, 4050, 4052
];

let n = 0;
const results = {};
for await (const line of rl) {
  n++;
  if (steps.includes(n)) {
    const obj = JSON.parse(line);
    for (const tc of obj.tool_calls || []) {
      if (tc.name === 'edit_file') {
        results[n] = tc.args.Replacement;
      }
    }
  }
}

fs.writeFileSync('scripts/early_posts.json', JSON.stringify(results, null, 2), 'utf8');
console.log('Saved early posts count:', Object.keys(results).length);
