import fs from 'node:fs';
import readline from 'node:readline';
import { parse, answer } from '../src/engine.js';
import { openStore } from '../src/store.js';
import { requestedSubject } from '../src/requested-subject.js';

const store = openStore();
const records = store.records();

// Read from f1
const f1 = 'corpus/global_immigration_social_questions_40001_60000.md';
const rl = readline.createInterface({ input: fs.createReadStream(f1) });

const samples = {
  'Jobs and worker rights': [],
  'Cross-border and complex law': [],
  'Education and children': [],
  'Immigration status and visas': []
};

for await (const line of rl) {
  const match = line.match(/^(\d+)\.\s+\*\*\[(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\]\*\*\s*(.*)$/);
  if (!match) continue;
  const num = match[1];
  const country = match[2].trim();
  const cat = match[4].trim();
  const q = match[5].trim();

  if (samples[cat] && samples[cat].length < 3) {
    const res = answer({ question: q }, records);
    const hasUnsupportedPlace = res.placeClarification?.reason === 'unsupported_place' ||
                                res.gaps?.some(g => g.reason === 'missing_or_unsupported_geography') ||
                                (res.clarification && /outside our verified|does not cover that place|outside Canada/i.test(res.clarification));
    if (!hasUnsupportedPlace) {
      samples[cat].push({ num, country, q, parsed: res.parsed, status: res.status, claims: res.claims.length, gaps: res.gaps });
    }
  }
}

for (const [cat, list] of Object.entries(samples)) {
  console.log(`\n================== ${cat} ==================`);
  for (const s of list) {
    console.log(`[${s.num}] Country: ${s.country}`);
    console.log(`  Q: "${s.q}"`);
    console.log(`  Parsed Intents:`, s.parsed?.intents, `City:`, s.parsed?.city, `Country:`, s.parsed?.country);
    console.log(`  Status:`, s.status, `Claims:`, s.claims, `Gaps:`, s.gaps);
    console.log(`  Requested Subject: "${requestedSubject(s.q)}"`);
  }
}

