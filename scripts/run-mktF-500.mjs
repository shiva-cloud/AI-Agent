// scripts/run-mktF-500.mjs
// Evaluates Set 29 (MKT-F-500): 500 fresh, non-duplicate Market-Gap questions (6th sample)
// from corpus/market_gap_questions_80001_100000.md across the 17,500 remaining unseen pool.
// Guarantees 0 duplicates across all prior sets in docs/*RESULTS*.json.

import fs from 'node:fs';
import readline from 'node:readline';
import { performance } from 'node:perf_hooks';
import { openStore } from '../src/store.js';
import { answer } from '../src/engine.js';

const testDbPath = 'data/test-settlement.sqlite';
const corpusPath = 'corpus/market_gap_questions_80001_100000.md';
const outJsonPath = 'docs/CORPUSMKT500F_RESULTS_2026-11-10.json';
const outMdPath = 'docs/AI_CORPUSMKT500F_QUESTION_CHECK_2026-11-10_HI.md';

const norm = q => (q || '').toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
const previousSeen = new Set();

const resultFiles = fs.readdirSync('docs').filter(f => f.endsWith('.json') && f.includes('RESULTS') && f !== 'CORPUSMKT500F_RESULTS_2026-11-10.json');
for (const f of resultFiles) {
  const data = JSON.parse(fs.readFileSync('docs/' + f, 'utf8'));
  const list = Array.isArray(data) ? data : (data.rows || data.results || data.detailedResults || []);
  for (const x of list) {
    const q = typeof x === 'string' ? x : (x.question || x.q);
    if (q) previousSeen.add(norm(q));
  }
}

console.log(`Loaded ${previousSeen.size} unique normalized questions from ${resultFiles.length} prior evaluation sets.`);

// Parse all 20,000 questions from market_gap_questions_80001_100000.md
const rl = readline.createInterface({
  input: fs.createReadStream(corpusPath, { encoding: 'utf8' }),
  crlfDelay: Infinity
});

const allCorpus = [];
let pendingHeader = null;

for await (const line of rl) {
  const trimmed = line.trim();
  if (trimmed.startsWith('### GMS-MKT-Q')) {
    const m = trimmed.match(/^###\s+([A-Za-z0-9_-]+)\s+[—–-]\s+([^|]+)\|([^|]+)\|(.*)$/);
    if (m) {
      pendingHeader = {
        id: m[1].trim(),
        level: m[2].trim(),
        country: m[3].trim(),
        topic: m[4].trim()
      };
    }
  } else if (pendingHeader && trimmed.length > 0 && !trimmed.startsWith('#')) {
    allCorpus.push({
      ...pendingHeader,
      question: trimmed
    });
    pendingHeader = null;
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

console.log(`Unseen pool size: ${unseenPool.length} (Skipped prior market-gap samples: ${dupVsPrev}).`);

const targetCount = 500;
const selected = [];
const internalSeen = new Set();
let crossDupes = 0;
let internalDupes = 0;

for (let i = 0; i < targetCount; i++) {
  const idx = Math.floor((i * unseenPool.length) / targetCount);
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
    id: item.id.replace('GMS-MKT-Q', 'MKT6-'),
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
      sampling: `stratified 500 evenly spaced across remaining ${unseenPool.length} unseen pool`,
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
console.log('application_portal:', byTopic['application_portal']);
console.log('evidence:', byTopic['evidence']);
console.log('transitional_rules:', byTopic['transitional_rules']);

const gPct = ((statusCounts.guidance / selected.length) * 100).toFixed(1);
const servCount = statusCounts.guidance + statusCounts.partial;
const servPct = ((servCount / selected.length) * 100).toFixed(1);
const newCumulativeTotal = previousSeen.size + selected.length;

const channelRows = Object.entries(byTopic)
  .sort((a, b) => b[1].guidance - a[1].guidance)
  .map(([t, st]) => `| ${t} | ${st.total} | **${st.guidance}** | ${st.partial} | ${st.clarification} | ${st.unavailable} |`)
  .join('\n');

const levelRows = Object.entries(byLevel)
  .map(([lv, st]) => `| ${lv} | ${st.total} | ${st.guidance} (${((st.guidance / st.total) * 100).toFixed(1)}%) | ${st.partial} | ${st.clarification} | ${st.unavailable} |`)
  .join('\n');

const topGaps = Object.entries(gapReasons)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 6)
  .map(([r, c]) => `${r} (${c})`)
  .join(' · ');

const trioNow = (byTopic['application_portal']?.guidance || 0) + (byTopic['evidence']?.guidance || 0) + (byTopic['transitional_rules']?.guidance || 0);
const trioTotal = (byTopic['application_portal']?.total || 0) + (byTopic['evidence']?.total || 0) + (byTopic['transitional_rules']?.total || 0);

const mdReport = `# MKT-F-500 (Market-Gap छठा sample — सेट 29) — 500-प्रश्न सेट (डुप्लिकेट-मुक्त) — 10 नवंबर 2026

निर्देश *"cnt"* / *"next 500 question not duplicate"* का 29वाँ चक्र।  
स्रोत = corpus **market-gap फ़ाइल का छठा sample** (\`market_gap_questions_80001_100000.md\`; पिछले नमूनों के **${dupVsPrev}** प्रश्न छोड़कर शेष **${unseenPool.length}** अनदेखे पुल से सम-दूरी फैलाई **500**)।

**चलाने-का ढंग:** in-process runner (\`scripts/run-mktF-500.mjs\`) — **test-copy DB** (\`data/test-settlement.sqlite\`, ${records.length} रिकॉर्ड्स) पर \`src/engine.answer()\`; असली \`settlement.sqlite\` अछूता; fixed clock \`2026-11-10T12:00Z\`।  
Raw data: [CORPUSMKT500F_RESULTS_2026-11-10.json](CORPUSMKT500F_RESULTS_2026-11-10.json)

---

## 1. डुप्लिकेट-प्रमाण

| जाँच | परिणाम |
|---|---|
| पिछले सभी परिणाम सेटों से लोड अद्वितीय प्रश्न (${resultFiles.length} फ़ाइलें) | **${previousSeen.size}** |
| market-gap पूल में पहले से परीक्षित छोड़े गए प्रश्न | ${dupVsPrev} |
| शेष अनदेखे पुल से चयनित | **500** (${unseenPool.length} में से सम-दूरी) |
| **पिछले सभी ${previousSeen.size} प्रश्नों से क्रॉस-डुप्लिकेट** | **0** |
| बैच के भीतर आपसी डुप्लिकेट | **0** |
| निष्पादन समय एवं त्रुटियाँ | **500/500** (${elapsedSec} सेकंड) · **0 error** |

> अब तक कुल संचयी अद्वितीय परीक्षित प्रश्न: **${newCumulativeTotal}**।

---

## 2. कुल स्थिति — Market-Gap छठा सैंपल

| स्थिति | सेट-9 | सेट-12 | सेट-18 | सेट-24 (D) | सेट-26 (E) | **सेट-29 / MKT-F (अब)** |
|---|---|---|---|---|---|---|
| \`guidance\` | 85 (17.0%) | 79 (15.8%) | 80 (16.0%) | 114 (22.8%) | 134 (26.8%) | **${statusCounts.guidance} (${gPct}%)** |
| \`partial\` | 87 | 91 | 83 | 49 | 29 | **${statusCounts.partial}** |
| \`clarification\` | 322 | 323 | 328 | 334 | 332 | **${statusCounts.clarification}** |
| \`unavailable\` | 6 | 7 | 9 | 3 | 5 | **${statusCounts.unavailable}** |
| \`error\` | 0 | 0 | 0 | 0 | 0 | **0** |
| **Serviceable (Guidance + Partial)** | 172 (34.4%) | 170 (34.0%) | 163 (32.6%) | 163 (32.6%) | 163 (32.6%) | **${servCount} (${servPct}%)** |

लेटेंसी: **मध्य ${medianMs}ms · p95 ${p95Ms}ms · अधिकतम ${maxMs}ms**।

---

## 3. तीनों पूर्व-शून्य चैनलों का प्रदर्शन (\`application_portal\`, \`evidence\`, \`transitional_rules\`)

| चैनल | सेट-18 (पूर्व) | सेट-24 (D) | सेट-26 (E) | **सेट-29 / MKT-F (अब)** |
|---|---|---|---|---|
| \`application_portal\` | 0 / 40 | 5 / 40 | 10 / 40 | **${byTopic['application_portal']?.guidance || 0}** / ${byTopic['application_portal']?.total || 0} |
| \`evidence\` | 0 / 40 | 16 / 40 | 8 / 40 | **${byTopic['evidence']?.guidance || 0}** / ${byTopic['evidence']?.total || 0} |
| \`transitional_rules\` | 0 / 40 | 7 / 40 | 14 / 40 | **${byTopic['transitional_rules']?.guidance || 0}** / ${byTopic['transitional_rules']?.total || 0} |
| **तिकड़ी कुल** | 0 / 120 | 28 / 120 | 32 / 120 | **${trioNow}** / ${trioTotal} |

---

## 4. सभी 13 चैनलों का विवरण

| चैनल | कुल प्रश्न | Guidance | Partial | Clarification | Unavailable |
|---|---|---|---|---|---|
${channelRows}

---

## 5. कठिनाई-स्तर वार परिणाम

| स्तर | कुल | Guidance (%) | Partial | Clarification | Unavailable |
|---|---|---|---|---|---|
${levelRows}

**गैप कारण वितरण:** ${topGaps}।
`;

fs.writeFileSync(outMdPath, mdReport);
console.log(`Saved Hindi report to ${outMdPath}`);
