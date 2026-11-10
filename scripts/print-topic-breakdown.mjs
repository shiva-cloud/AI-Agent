import fs from 'node:fs';

const d = JSON.parse(fs.readFileSync('artifacts/deep-5000-kb-audit-results.json', 'utf8'));

console.log('--- TOPIC BREAKDOWN ---');
for (const [k, v] of Object.entries(d.topicResults)) {
  console.log(`${k.padEnd(20)} | Sahi: ${String(v.sahi).padStart(3)} | Missing: ${String(v.missing).padStart(3)} | ReqIgnored: ${String(v.requirement_ignored).padStart(4)}`);
}

