import { technical100Questions } from './evaluate-100-technical-scenarios.js';
import { openStore } from '../src/store.js';
import { answer } from '../src/engine.js';
import { writeFileSync } from 'node:fs';

const store = openStore('data/settlement.sqlite');
const records = store.records();
const date = new Date('2026-10-30');

const dataset = [];

for (let i = 0; i < technical100Questions.length; i++) {
  const item = technical100Questions[i];
  const start = performance.now();
  const res = answer({ question: item.question }, records, date);
  const latency = (performance.now() - start).toFixed(2);

  // Evaluate perfection
  const matchedTopic = res.parsed.intents.includes(item.intentExpected);
  const isGuidanceOrPartial = ['guidance', 'partial'].includes(res.status);
  let perfectionRating = 'POOR (Evasive / Unanswered)';
  let perfectionScore = 30;

  if (isGuidanceOrPartial && matchedTopic) {
    const claimLower = res.claims.map(c => c.text.toLowerCase()).join(' ');
    const sourceLower = res.sources.map(s => s.title.toLowerCase()).join(' ');
    const combined = claimLower + ' ' + sourceLower;
    let aspectsFound = 0;
    for (const aspect of item.keyAspects) {
      const words = aspect.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      if (words.some(w => combined.includes(w))) aspectsFound++;
    }
    if (aspectsFound >= 2) {
      perfectionRating = 'EXCELLENT (Direct & Specific Guidance)';
      perfectionScore = 95;
    } else if (aspectsFound >= 1) {
      perfectionRating = 'GOOD (Authoritative Regulatory Guidance)';
      perfectionScore = 80;
    } else {
      perfectionRating = 'MODERATE (General Topic Guidance)';
      perfectionScore = 55;
    }
  } else if (res.status === 'clarification') {
    perfectionRating = 'CLARIFICATION (Needs Location Clarification)';
    perfectionScore = 60;
  }

  dataset.push({
    id: item.id,
    category: item.category,
    scenario: item.scenario,
    question: item.question,
    status: res.status,
    claims: res.claims.map(c => ({ id: c.id, text: c.text, status: c.status })),
    sources: res.sources.map(s => ({ title: s.title, url: s.url, checkedAt: s.checkedAt })),
    clarification: res.clarification,
    perfectionRating,
    perfectionScore,
    latencyMs: Number(latency)
  });
}

writeFileSync('artifacts/qa-dataset.json', JSON.stringify(dataset, null, 2));
console.log(`Exported ${dataset.length} questions & live answers to artifacts/qa-dataset.json`);
store.db.close();
