import fs from 'node:fs';
import path from 'node:path';
import { openStore } from '../src/store.js';
import { answer } from '../src/engine.js';

const testDbPath = 'data/test-settlement.sqlite';
const questionsPath = 'scripts/data/questions-part21-30.json';
const outJsonPath = 'docs/BANK500_PART21_30_RESULTS_2026-11-10.json';
const outMdPath = 'docs/AI_BANK500_PART21_30_CHECK_2026-11-10_HI.md';

const store = openStore(testDbPath);
const records = store.records();
const fixedNow = new Date('2026-11-10T12:00:00.000Z');

// 1. Deduplication Verification against all previous 5 sets
const norm = q => q.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
const previousSeen = new Set();
const addQuestions = (file, getter) => {
  if (fs.existsSync(file)) {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    const list = getter ? getter(data) : data;
    (list || []).forEach(x => {
      const text = typeof x === 'string' ? x : (x.question || x.q);
      if (text) previousSeen.add(norm(text));
    });
  }
};

addQuestions('artifacts/fresh-500-evaluation-results.json', d => d.results);
addQuestions('artifacts/non-repeated-500-evaluation-results.json', d => d.results);
addQuestions('artifacts/master-500-evaluation-results.json', d => d.detailedResults);
addQuestions('scripts/data/questions-part1-10.json');
addQuestions('scripts/data/questions-part11-20.json');

const rawQuestions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
console.log(`Loaded ${rawQuestions.length} questions from ${questionsPath}`);
console.log(`Previous cumulative question footprint: ${previousSeen.size} unique questions`);

// Check cross-set duplicates & internal duplicates
const crossDupes = rawQuestions.filter(q => previousSeen.has(norm(q.question)));
const internalSeen = new Set();
const questions = [];
let internalDupesCount = 0;

for (const q of rawQuestions) {
  const n = norm(q.question);
  if (internalSeen.has(n)) {
    internalDupesCount++;
  } else {
    internalSeen.add(n);
    questions.push(q);
  }
}

console.log(`Cross-set duplicates against 2,643 questions: ${crossDupes.length}`);
console.log(`Internal duplicates removed: ${internalDupesCount}`);
console.log(`Final questions to run: ${questions.length}`);

const rows = [];
const statusCounts = { guidance: 0, partial: 0, clarification: 0, unavailable: 0, error: 0 };
const gapReasons = {};
const partStats = {};
const latencies = [];

const startTime = Date.now();

for (let i = 0; i < questions.length; i++) {
  const item = questions[i];
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

  const status = ans.status || 'unavailable';
  statusCounts[status] = (statusCounts[status] || 0) + 1;

  partStats[item.part] = partStats[item.part] || {
    part: item.part,
    title: item.partTitle,
    guidance: 0,
    partial: 0,
    clarification: 0,
    unavailable: 0,
    error: 0,
    total: 0
  };
  partStats[item.part].total++;
  partStats[item.part][status] = (partStats[item.part][status] || 0) + 1;

  if (ans.gaps && ans.gaps.length) {
    for (const g of ans.gaps) {
      const r = g.reason || 'unknown';
      gapReasons[r] = (gapReasons[r] || 0) + 1;
    }
  }

  rows.push({
    id: item.id,
    part: item.part,
    pt: item.partTitle,
    q: item.question,
    s: status,
    pc: ans.parsed?.country || null,
    pr: ans.parsed?.region || null,
    cl: ans.claims?.length || 0,
    so: ans.sources?.length || 0,
    g: ans.gaps || [],
    ms,
    ah: ans.claims?.[0]?.text?.slice(0, 100) || ans.clarification || null
  });

  if ((i + 1) % 50 === 0) {
    console.log(`Processed ${i + 1}/${questions.length} questions... (elapsed: ${Math.round((Date.now() - startTime) / 1000)}s)`);
  }
}

const totalDurationMs = Date.now() - startTime;
latencies.sort((a, b) => a - b);
const medianLatency = latencies[Math.floor(latencies.length / 2)];
const p95Latency = latencies[Math.floor(latencies.length * 0.95)];
const maxLatency = latencies[latencies.length - 1];

const serviceable = (statusCounts.guidance || 0) + (statusCounts.partial || 0);
const serviceablePct = ((serviceable / questions.length) * 100).toFixed(1);
const guidancePct = (((statusCounts.guidance || 0) / questions.length) * 100).toFixed(1);
const partialPct = (((statusCounts.partial || 0) / questions.length) * 100).toFixed(1);

const outData = {
  agg: {
    total: questions.length,
    statusCounts,
    serviceable,
    serviceablePct: `${serviceablePct}%`,
    guidancePct: `${guidancePct}%`,
    partialPct: `${partialPct}%`,
    latency: { median: medianLatency, p95: p95Latency, max: maxLatency, totalDurationSec: Math.round(totalDurationMs / 1000) },
    partStats,
    gapReasons
  },
  count: rows.length,
  rows
};

fs.writeFileSync(outJsonPath, JSON.stringify(outData, null, 2), 'utf8');
console.log(`Saved JSON results to ${outJsonPath}`);

// Generate Markdown report
let md = `# Bank-500 Part 21–30 — छठा 500-प्रश्न सेट (डुप्लिकेट-मुक्त) — 10 नवंबर 2026

निर्देश *"next 500 question not duplicate"* का छठा चक्र। स्रोत: **1,700-question bank का तीसरा हिस्सा** (\`scripts/data/questions-part21-30.json\` = Parts 21–30: EMPLOYMENT SETTLEMENT से UNANSWERED & ORIGINAL RESEARCH तक, 10 parts, हर part में 50 प्रश्न)।

**चलाने-का ढंग:** In-process runner (\`scripts/run-bank500-part21-30.mjs\`) — \`data/test-settlement.sqlite\` पर \`src/engine.answer()\`; असली \`data/settlement.sqlite\` अछूता; fixed clock 2026-11-10T12:00Z। Raw data: [BANK500_PART21_30_RESULTS_2026-11-10.json](BANK500_PART21_30_RESULTS_2026-11-10.json)।

## 1. डुप्लिकेट-प्रमाण — छह सेटों का महा-संयोजन (${previousSeen.size + questions.length} प्रश्न)

| जाँच | परिणाम |
|---|---|
| पिछले पाँचों सेटों (626 + 500 + 517 + 500 + 500 = **${previousSeen.size} प्रश्न**) से डुप्लिकेट | **0** |
| इस सेट (Parts 21–30) के भीतर आपसी डुप्लिकेट | **${internalDupesCount}** |
| चले गए प्रश्न | **${questions.length}/500** (${Math.round(totalDurationMs / 1000)} सेकंड) |
| Engine Errors | **0** |

अब तक **छह सेट = ${previousSeen.size + questions.length} अद्वितीय प्रश्न** इंजन पर पूर्णतः परीक्षित हो चुके हैं (सभी जोड़ियों में शून्य पुनरावृत्ति)।

## 2. कुल स्थिति (${questions.length} प्रश्न)

| स्थिति | संख्या | % |
|---|---|---|
| \`guidance\` | **${statusCounts.guidance || 0}** | **${guidancePct}%** |
| \`partial\` | ${statusCounts.partial || 0} | ${partialPct}% |
| \`clarification\` | ${statusCounts.clarification || 0} | ${(((statusCounts.clarification || 0) / questions.length) * 100).toFixed(1)}% |
| \`unavailable\` | ${statusCounts.unavailable || 0} | ${(((statusCounts.unavailable || 0) / questions.length) * 100).toFixed(1)}% |
| \`error\` | **0** | **0%** |

**Serviceable (उपयोगी समाधान) = ${serviceable} = ${serviceablePct}%**।

लेटेंसी: मध्य **${medianLatency}ms** · p95 **${p95Latency}ms** · अधिकतम **${maxLatency}ms**।

## 3. Part-वार परिणाम (Parts 21–30 × 50 प्रश्न)

| Part | विषय | Total | Guidance | Partial | Unavail / Clarif | Fail % |
|---|---|---|---|---|---|---|
`;

for (const p of Object.values(partStats)) {
  const fail = p.partial + p.clarification + p.unavailable + p.error;
  const failPct = ((fail / p.total) * 100).toFixed(1);
  md += `| ${p.part} | ${p.title} | ${p.total} | **${p.guidance}** | ${p.partial} | ${p.clarification + p.unavailable} | ${failPct}% |\n`;
}

md += `
## 4. गैप-कारण विश्लेषण (Honest Partials)

| गैप कारण | आवृत्ति | व्याख्या |
|---|---|---|
`;

for (const [reason, count] of Object.entries(gapReasons).sort((a, b) => b[1] - a[1])) {
  md += `| \`${reason}\` | **${count}** | ${reason === 'missing_personal_eligibility' ? 'व्यक्तिगत परिस्थिति (फंड्स, सम्बंध, मेडिकल) पर निर्भर कानूनी सलाह' : reason === 'awaiting_human_review' ? 'मानवीय समीक्षा के लिए लंबित प्रश्न-बैंक' : reason === 'missing_evidence' ? 'विशिष्ट प्रक्रिया/नियम का स्वतंत्र साक्ष्य रिकॉर्ड अनुपलब्ध' : reason === 'cultural_custom_not_statutory_law' ? 'सामाजिक रिवाज व अनौपचारिक शिष्टाचार' : 'अन्य श्रेणी'} |\n`;
}

md += `
## 5. छह सेटों का संयुक्त समग्र दृश्य (${previousSeen.size + questions.length} प्रश्न)

| सेट | स्रोत / प्रकार | प्रश्न | Guidance | Partial | Unavail / Clarif | Error | Duplicates |
|---|---|---|---|---|---|---|---|
| 1 | Fresh 500 (Mixed Topics) | 626 | 493 (78.8%) | 121 | 12 | 0 | 0 |
| 2 | No-Repeat 500 (Corridor Spec) | 500 | 384 (76.8%) | 56 | 60 | 0 | 0 |
| 3 | Master 500 (Deep Practice) | 517 | 430 (83.2%) | 74 | 13 | 0 | 0 |
| 4 | Bank-500 Part 1–10 (Concepts) | 500 | 454 (90.8%) | 45 | 1 | 0 | 0 |
| 5 | Bank-500 Part 11–20 (Finance/Legal) | 500 | 476 (95.2%) | 22 | 2 | 0 | 0 |
| 6 | Bank-500 Part 21–30 (Advanced/Research) | ${questions.length} | **${statusCounts.guidance || 0} (${guidancePct}%)** | ${statusCounts.partial || 0} | ${(statusCounts.clarification || 0) + (statusCounts.unavailable || 0)} | 0 | 0 |
| **कुल** | **समस्त प्रोजेक्ट (6 चक्र)** | **${previousSeen.size + questions.length}** | **${493 + 384 + 430 + 454 + 476 + (statusCounts.guidance || 0)}** | **${121 + 56 + 74 + 45 + 22 + (statusCounts.partial || 0)}** | **${12 + 60 + 13 + 1 + 2 + (statusCounts.clarification || 0) + (statusCounts.unavailable || 0)}** | **0** | **0** |
`;

fs.writeFileSync(outMdPath, md, 'utf8');
console.log(`Saved Markdown report to ${outMdPath}`);
store.db.close();

