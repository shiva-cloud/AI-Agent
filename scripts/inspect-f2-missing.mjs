import fs from 'node:fs';
import readline from 'node:readline';
import { openStore } from '../src/store.js';
import { parse, answer } from '../src/engine.js';
import { requestedSubject } from '../src/requested-subject.js';

const store = openStore();
const records = store.records();

const f2 = 'corpus/global_immigration_settlement_20000_questions.md';
const rl = readline.createInterface({ input: fs.createReadStream(f2) });

const samplesByTopic = {};

for await (const line of rl) {
  const match = line.match(/- \*\*(GMS-Q\d+)\*\*\s+\[(.*?)\s*\|\s*(.*?)\]\s*(.*)$/);
  if (!match) continue;
  const qid = match[1];
  const topic = match[2].trim();
  const country = match[3].trim();
  const q = match[4].trim();

  if (!samplesByTopic[topic]) samplesByTopic[topic] = [];
  if (samplesByTopic[topic].length < 3) {
    const res = answer({ question: q }, records);
    if (res.claims?.length === 0) {
      samplesByTopic[topic].push({ qid, country, q, status: res.status, gaps: res.gaps?.map(g => g.reason), subject: requestedSubject(q) });
    }
  }
}

for (const [topic, list] of Object.entries(samplesByTopic)) {
  if (list.length > 0) {
    console.log(`\n=== Topic in f2: ${topic} ===`);
    for (const s of list) {
      console.log(`  [${s.qid}] (${s.country}) "${s.q}" -> Gaps: ${s.gaps?.join(', ')} | Subject: "${s.subject}"`);
    }
  }
}
