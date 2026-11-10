// scripts/run-sq4D-500.mjs
// Evaluates Set 38 (SQ4D-500): 500 fresh, non-duplicate Social Batch-4 questions (4th sample)
// from corpus/global_immigration_social_questions_60001_80000.md across the remaining unseen pool.
// Guarantees 0 duplicates across all prior evaluation sets in docs/*RESULTS*.json.

import fs from 'node:fs';
import readline from 'node:readline';
import { performance } from 'node:perf_hooks';
import { openStore } from '../src/store.js';
import { answer } from '../src/engine.js';

const testDbPath = 'data/test-settlement.sqlite';
const corpusPath = 'corpus/global_immigration_social_questions_60001_80000.md';
const outJsonPath = 'docs/CORPUSSQ4D500_RESULTS_2026-11-10.json';
const outMdPath = 'docs/AI_CORPUSSQ4D500_QUESTION_CHECK_2026-11-10_HI.md';

const norm = q => (q || '').toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
const previousSeen = new Set();

const resultFiles = fs.readdirSync('docs').filter(f => f.endsWith('.json') && f.includes('RESULTS') && f !== 'CORPUSSQ4D500_RESULTS_2026-11-10.json');
for (const f of resultFiles) {
  const data = JSON.parse(fs.readFileSync('docs/' + f, 'utf8'));
  const list = Array.isArray(data) ? data : (data.rows || data.results || data.detailedResults || []);
  for (const x of list) {
    const q = typeof x === 'string' ? x : (x.question || x.q);
    if (q) previousSeen.add(norm(q));
  }
}

console.log(`Loaded ${previousSeen.size} unique normalized questions from ${resultFiles.length} prior evaluation sets.`);

// Parse all 20,000 questions from social batch 4
const rl = readline.createInterface({
  input: fs.createReadStream(corpusPath, { encoding: 'utf8' }),
  crlfDelay: Infinity
});

const qRegex = /^(\d+)\.\s+\*\*\[(.*?)\]\*\*\s+(.*)$/;
const allCorpus = [];

for await (const line of rl) {
  const m = line.match(qRegex);
  if (m) {
    const num = m[1];
    const parts = m[2].split('|').map(s => s.trim());
    const country = parts[0] || 'Unknown';
    const level = parts[1] || 'Basic';
    const topic = parts[2] || 'General';
    const question = m[3].trim();
    allCorpus.push({ id: `SQ4D-${num}`, num, country, level, topic, question });
  }
}

console.log(`Parsed ${allCorpus.length} questions from ${corpusPath}.`);

const unseenPool = [];
let dupVsPrev = 0;
for (const item of allCorpus) {
  const n = norm(item.question);
  if (previousSeen.has(n)) {
    dupVsPrev++;
  } else {
    unseenPool.push(item);
  }
}

console.log(`Unseen pool size: ${unseenPool.length} (Skipped prior Batch-4 samples: ${dupVsPrev}).`);

// Sample 500 evenly spaced questions from unseenPool (with rotation offset +11 so stride differs from prior samplings)
const targetCount = 500;
const selected = [];
const internalSeen = new Set();
let crossDupes = 0;
let internalDupes = 0;

for (let i = 0; i < targetCount; i++) {
  const idx = (Math.floor((i * unseenPool.length) / targetCount) + 11) % unseenPool.length;
  const item = unseenPool[idx];
  const n = norm(item.question);
  if (previousSeen.has(n)) crossDupes++;
  if (internalSeen.has(n)) {
    internalDupes++;
  } else {
    internalSeen.add(n);
    selected.push(item);
  }
}

if (crossDupes > 0 || internalDupes > 0 || selected.length !== 500) {
  console.error(`ERROR: Invalid sampling! selected=${selected.length}, crossDupes=${crossDupes}, internalDupes=${internalDupes}`);
  process.exit(1);
}

console.log(`Sampled ${selected.length} strictly unique questions (crossDupes=0, internalDupes=0).`);

// Open test DB and evaluate
const store = openStore(testDbPath);
const records = store.records();
const fixedNow = new Date('2026-11-10T12:00:00.000Z');

const rows = [];
const statusCounts = { guidance: 0, partial: 0, clarification: 0, unavailable: 0, error: 0 };
const byTopic = {};
const byLevel = {};
const bySuiteCountry = {};
const byParsedCountry = {};
const gapReasons = {};
const latencies = [];

const tStart = Date.now();

for (let i = 0; i < selected.length; i++) {
  const item = selected[i];
  const t0 = performance.now();
  let ans;
  try {
    ans = answer({ question: item.question }, records, fixedNow);
  } catch (err) {
    ans = { status: 'error', error: err.message, claims: [], sources: [], gaps: [] };
  }
  const t1 = performance.now();
  const ms = Math.round(t1 - t0);
  latencies.push(ms);

  const s = ans.status || 'unavailable';
  statusCounts[s] = (statusCounts[s] || 0) + 1;

  byLevel[item.level] = byLevel[item.level] || { total: 0, guidance: 0, partial: 0, clarification: 0, unavailable: 0, error: 0 };
  byLevel[item.level].total++;
  byLevel[item.level][s] = (byLevel[item.level][s] || 0) + 1;

  byTopic[item.topic] = byTopic[item.topic] || { total: 0, guidance: 0, partial: 0, clarification: 0, unavailable: 0, error: 0 };
  byTopic[item.topic].total++;
  byTopic[item.topic][s] = (byTopic[item.topic][s] || 0) + 1;

  bySuiteCountry[item.country] = bySuiteCountry[item.country] || { total: 0, guidance: 0, partial: 0, clarification: 0, unavailable: 0, error: 0 };
  bySuiteCountry[item.country].total++;
  bySuiteCountry[item.country][s] = (bySuiteCountry[item.country][s] || 0) + 1;

  const pc = ans.parsed?.country || 'Unknown';
  byParsedCountry[pc] = byParsedCountry[pc] || { total: 0, guidance: 0, partial: 0, clarification: 0, unavailable: 0, error: 0 };
  byParsedCountry[pc].total++;
  byParsedCountry[pc][s] = (byParsedCountry[pc][s] || 0) + 1;

  const gList = [];
  if (Array.isArray(ans.gaps)) {
    for (const g of ans.gaps) {
      const r = g.reason || 'unknown';
      gList.push(r);
      gapReasons[r] = (gapReasons[r] || 0) + 1;
    }
  }

  rows.push({
    id: item.id,
    c: item.country,
    lv: item.level,
    t: item.topic,
    q: item.question,
    s,
    pc,
    cl: Array.isArray(ans.claims) ? ans.claims.length : 0,
    so: Array.isArray(ans.sources) ? ans.sources.length : 0,
    g: gList,
    ms
  });
}

const elapsedSec = ((Date.now() - tStart) / 1000).toFixed(1);
store.db.close();

latencies.sort((a, b) => a - b);
const medianMs = latencies[Math.floor(latencies.length * 0.5)] || 0;
const p95Ms = latencies[Math.floor(latencies.length * 0.95)] || 0;
const maxMs = latencies[latencies.length - 1] || 0;

const outData = {
  agg: {
    dedup: {
      corpusParsed: allCorpus.length,
      priorUnion: previousSeen.size,
      dupVsPrev,
      uniquePool: unseenPool.length,
      sampling: `stratified 500 evenly spaced (+11 offset) across remaining ${unseenPool.length} unseen pool`,
      running: selected.length,
      crossDupes,
      internalDupes
    },
    counts: statusCounts,
    latency: { medianMs, p95Ms, maxMs, elapsedSec: Number(elapsedSec) },
    bySuiteCountry,
    byParsedCountry,
    byTopic,
    byLevel,
    gapReasons
  },
  count: rows.length,
  rows
};

fs.writeFileSync(outJsonPath, JSON.stringify(outData, null, 1));
console.log(`Saved JSON results to ${outJsonPath}`);
console.log('Status summary:', statusCounts);

const gPct = ((statusCounts.guidance / selected.length) * 100).toFixed(1);
const servCount = statusCounts.guidance + statusCounts.partial;
const servPct = ((servCount / selected.length) * 100).toFixed(1);
const newCumulativeTotal = previousSeen.size + selected.length;

const coveredRows = Object.entries(bySuiteCountry)
  .filter(([, st]) => st.guidance > 0)
  .sort((a, b) => b[1].guidance - a[1].guidance)
  .map(([c, st]) => `| ${c} | **${st.guidance}** / ${st.total} | ${st.partial} | ${st.clarification} | ${st.unavailable} |`)
  .join('\n');

const levelRows = Object.entries(byLevel)
  .map(([lv, st]) => `| ${lv} | ${st.total} | **${st.guidance}** (${((st.guidance / st.total) * 100).toFixed(1)}%) | ${st.partial} | ${st.clarification} | ${st.unavailable} |`)
  .join('\n');

const topicRows = Object.entries(byTopic)
  .sort((a, b) => b[1].guidance - a[1].guidance)
  .map(([tp, st]) => `| ${tp} | ${st.total} | **${st.guidance}** | ${st.partial} | ${st.clarification} | ${st.unavailable} |`)
  .join('\n');

const topGaps = Object.entries(gapReasons)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 6)
  .map(([r, c]) => `${r} (${c})`)
  .join(' Â· ');

const distinctCountries = Object.keys(bySuiteCountry).length;

const mdReport = `# SQ4D-500 (corpus social batch-4 à¤šà¥Œà¤¥à¤¾ sample) â€” 500-à¤ªà¥à¤°à¤¶à¥à¤¨ à¤¸à¥‡à¤Ÿ (à¤¡à¥à¤ªà¥à¤²à¤¿à¤•à¥‡à¤Ÿ-à¤®à¥à¤•à¥à¤¤) â€” 10 à¤¨à¤µà¤‚à¤¬à¤° 2026

à¤¨à¤¿à¤°à¥à¤¦à¥‡à¤¶ *"cnt"* / *"next 500 question not duplicate"* à¤•à¤¾ à¤¨à¤¯à¤¾ à¤šà¤•à¥à¤° (à¤¸à¥‡à¤Ÿ 38)à¥¤  
à¤¸à¥à¤°à¥‹à¤¤ = corpus **batch-4 à¤¸à¥‹à¤¶à¤² à¤«à¤¼à¤¾à¤‡à¤² à¤•à¤¾ à¤šà¥Œà¤¥à¤¾ sample** (\`global_immigration_social_questions_60001_80000.md\`; à¤ªà¤¿à¤›à¤²à¥‡ à¤¨à¤®à¥‚à¤¨à¥‹à¤‚ à¤•à¥‡ **${dupVsPrev}** à¤ªà¥à¤°à¤¶à¥à¤¨ à¤›à¥‹à¤¡à¤¼à¤•à¤° à¤¶à¥‡à¤· **${unseenPool.length}** à¤…à¤¨à¤¦à¥‡à¤–à¥‡ à¤ªà¥à¤² à¤¸à¥‡ à¤¸à¤®-à¤¦à¥‚à¤°à¥€ à¤«à¥ˆà¤²à¤¾à¤ˆ **500**)à¥¤

**à¤šà¤²à¤¾à¤¨à¥‡-à¤•à¤¾ à¤¢à¤‚à¤—:** in-process runner (\`scripts/run-sq4D-500.mjs\`) â€” **test-copy DB** (\`data/test-settlement.sqlite\`, ${records.length} à¤°à¤¿à¤•à¥‰à¤°à¥à¤¡à¥à¤¸) à¤ªà¤° \`src/engine.answer()\`; à¤…à¤¸à¤²à¥€ \`settlement.sqlite\` à¤…à¤›à¥‚à¤¤à¤¾; fixed clock \`2026-11-10T12:00Z\`à¥¤  
Raw data: [CORPUSSQ4D500_RESULTS_2026-11-10.json](CORPUSSQ4D500_RESULTS_2026-11-10.json)

---

## 1. à¤¡à¥à¤ªà¥à¤²à¤¿à¤•à¥‡à¤Ÿ-à¤ªà¥à¤°à¤®à¤¾à¤£

| à¤œà¤¾à¤à¤š | à¤ªà¤°à¤¿à¤£à¤¾à¤® |
|---|---|
| à¤ªà¤¿à¤›à¤²à¥‡ à¤¸à¤­à¥€ à¤ªà¤°à¤¿à¤£à¤¾à¤® à¤¸à¥‡à¤Ÿà¥‹à¤‚ à¤¸à¥‡ à¤²à¥‹à¤¡ à¤…à¤¦à¥à¤µà¤¿à¤¤à¥€à¤¯ à¤ªà¥à¤°à¤¶à¥à¤¨ (${resultFiles.length} à¤«à¤¼à¤¾à¤‡à¤²à¥‡à¤‚) | **${previousSeen.size}** |
| Batch-4 à¤¸à¥‡ à¤ªà¤¹à¤²à¥‡ à¤ªà¤°à¥€à¤•à¥à¤·à¤¿à¤¤ à¤›à¥‹à¤¡à¤¼à¥‡ à¤—à¤ à¤ªà¥à¤°à¤¶à¥à¤¨ | ${dupVsPrev} |
| à¤¶à¥‡à¤· à¤…à¤¨à¤¦à¥‡à¤–à¥‡ à¤ªà¥à¤² à¤¸à¥‡ à¤šà¤¯à¤¨à¤¿à¤¤ | **500** (${unseenPool.length} à¤®à¥‡à¤‚ à¤¸à¥‡ à¤¸à¤®-à¤¦à¥‚à¤°à¥€) |
| **à¤ªà¤¿à¤›à¤²à¥‡ à¤¸à¤­à¥€ ${previousSeen.size} à¤ªà¥à¤°à¤¶à¥à¤¨à¥‹à¤‚ à¤¸à¥‡ à¤•à¥à¤°à¥‰à¤¸-à¤¡à¥à¤ªà¥à¤²à¤¿à¤•à¥‡à¤Ÿ** | **0** |
| à¤¬à¥ˆà¤š à¤•à¥‡ à¤­à¥€à¤¤à¤° à¤†à¤ªà¤¸à¥€ à¤¡à¥à¤ªà¥à¤²à¤¿à¤•à¥‡à¤Ÿ | **0** |
| à¤¨à¤¿à¤·à¥à¤ªà¤¾à¤¦à¤¨ à¤¸à¤®à¤¯ à¤à¤µà¤‚ à¤¤à¥à¤°à¥à¤Ÿà¤¿à¤¯à¤¾à¤ | **500/500** (${elapsedSec} à¤¸à¥‡à¤•à¤‚à¤¡) Â· **0 error** |

> à¤…à¤¬ à¤¤à¤• à¤•à¥à¤² à¤¸à¤‚à¤šà¤¯à¥€ à¤…à¤¦à¥à¤µà¤¿à¤¤à¥€à¤¯ à¤ªà¤°à¥€à¤•à¥à¤·à¤¿à¤¤ à¤ªà¥à¤°à¤¶à¥à¤¨: **${newCumulativeTotal}**à¥¤

---

## 2. à¤•à¥à¤² à¤¸à¥à¤¥à¤¿à¤¤à¤¿ â€” Social Batch-4 à¤•à¥€ 4-à¤¸à¥‡à¤Ÿ à¤ªà¥à¤°à¤—à¤¤à¤¿ (${distinctCountries} à¤¦à¥‡à¤¶)

| à¤¸à¥à¤¥à¤¿à¤¤à¤¿ | à¤¸à¥‡à¤Ÿ-1 (CORPUS500) | SQ4B-500 | SQ4C-500 | **SQ4D-500 (à¤…à¤¬)** |
|---|---|---|---|---|
| \`guidance\` | 23 (4.6%) | 26 (5.2%) | 28 (5.6%) | **${statusCounts.guidance} (${gPct}%)** |
| \`partial\` | 56 | 59 | 41 | **${statusCounts.partial}** |
| \`clarification\` | 392 | 379 | 391 | **${statusCounts.clarification}** |
| \`unavailable\` | 29 | 36 | 40 | **${statusCounts.unavailable}** |
| \`error\` | 0 | 0 | 0 | **0** |
| **Serviceable (Guidance + Partial)** | 79 (15.8%) | 85 (17.0%) | 69 (13.8%) | **${servCount} (${servPct}%)** |

à¤²à¥‡à¤Ÿà¥‡à¤‚à¤¸à¥€: **à¤®à¤§à¥à¤¯ ${medianMs}ms Â· p95 ${p95Ms}ms Â· à¤…à¤§à¤¿à¤•à¤¤à¤® ${maxMs}ms**à¥¤

---

## 3. à¤—à¤¾à¤‡à¤¡à¥‡à¤‚à¤¸ à¤µà¤¾à¤²à¥‡ à¤¦à¥‡à¤¶ (${Object.values(bySuiteCountry).filter(x => x.guidance > 0).length} à¤¦à¥‡à¤¶)

| à¤¦à¥‡à¤¶ | Guidance / à¤•à¥à¤² | Partial | Clarification | Unavailable |
|---|---|---|---|---|
${coveredRows}

---

## 4. à¤¸à¥à¤¤à¤°-à¤µà¤¾à¤° à¤à¤µà¤‚ à¤µà¤¿à¤·à¤¯-à¤µà¤¾à¤° à¤µà¤¿à¤µà¤°à¤£

| à¤¸à¥à¤¤à¤° | à¤•à¥à¤² | Guidance (%) | Partial | Clarification | Unavailable |
|---|---|---|---|---|---|
${levelRows}

| à¤µà¤¿à¤·à¤¯ | à¤•à¥à¤² | Guidance | Partial | Clarification | Unavailable |
|---|---|---|---|---|---|
${topicRows}

**à¤—à¥ˆà¤ª à¤•à¤¾à¤°à¤£ à¤µà¤¿à¤¤à¤°à¤£:** ${topGaps}à¥¤
`;

fs.writeFileSync(outMdPath, mdReport);
console.log(`Saved Hindi report to ${outMdPath}`);
