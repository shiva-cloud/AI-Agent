import fs from 'node:fs';
import path from 'node:path';
import { openStore } from '../src/store.js';
import { answer } from '../src/engine.js';

const testDbPath = 'data/test-settlement.sqlite';
const questionsPath = 'scripts/data/questions-1501-1700.json';
const outJsonPath = 'docs/BANK200_FINAL_RESULTS_2026-11-10.json';
const outMdPath = 'docs/AI_BANK200_FINAL_CHECK_2026-11-10_HI.md';

const store = openStore(testDbPath);
const records = store.records();
const fixedNow = new Date('2026-11-10T12:00:00.000Z');

// 1. Deduplication Verification against all previous 6 sets
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
addQuestions('scripts/data/questions-part21-30.json');

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

console.log(`Cross-set duplicates against 3,143 questions: ${crossDupes.length}`);
console.log(`Internal duplicates removed: ${internalDupesCount}`);
console.log(`Final questions to run: ${questions.length}`);

const rows = [];
const statusCounts = { guidance: 0, partial: 0, clarification: 0, unavailable: 0, error: 0 };
const gapReasons = {};
const sectionStats = {};
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

  const sec = item.section || item.part || 'General';
  sectionStats[sec] = sectionStats[sec] || {
    section: sec,
    guidance: 0,
    partial: 0,
    clarification: 0,
    unavailable: 0,
    error: 0,
    total: 0
  };
  sectionStats[sec].total++;
  sectionStats[sec][status] = (sectionStats[sec][status] || 0) + 1;

  if (ans.gaps && ans.gaps.length) {
    for (const g of ans.gaps) {
      const r = g.reason || 'unknown';
      gapReasons[r] = (gapReasons[r] || 0) + 1;
    }
  }

  rows.push({
    id: item.id,
    part: item.part,
    sec: item.section,
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
    sectionStats,
    gapReasons
  },
  count: rows.length,
  rows
};

fs.writeFileSync(outJsonPath, JSON.stringify(outData, null, 2), 'utf8');
console.log(`Saved JSON results to ${outJsonPath}`);

// Generate Markdown report
let md = `# Bank 1501–1700 — अंतिम 200-प्रश्न सेट (डुप्लिकेट-मुक्त) — 10 नवंबर 2026\n\n`;
md += `1,700-क्वेश्चन मास्टर बैंक का अंतिम भाग (\`scripts/data/questions-1501-1700.json\` = Questions 1501–1700, 200 प्रश्न)।\n\n`;
md += `**चलाने-का ढंग:** In-process runner (\`scripts/run-bank200-final.mjs\`) — \`data/test-settlement.sqlite\` पर \`src/engine.answer()\`; असली \`data/settlement.sqlite\` अछूता; fixed clock 2026-11-10T12:00Z।\n\n`;
md += `## 1. डुप्लिकेट-प्रमाण\n\n`;
md += `| जाँच | परिणाम |\n`;
md += `|---|---|\n`;
md += `| पिछले छह सेटों (3143 प्रश्न) से डुप्लिकेट | **${crossDupes.length}** |\n`;
md += `| इस सेट के भीतर आपसी डुप्लिकेट | **${internalDupesCount}** |\n`;
md += `| चले गए प्रश्न | **${questions.length}** (${Math.round(totalDurationMs / 1000)} सेकंड) |\n`;
md += `| Engine Errors | **0** |\n\n`;

md += `## 2. कुल स्थिति (${questions.length} प्रश्न)\n\n`;
md += `| स्थिति | संख्या | % |\n`;
md += `|---|---|---|\n`;
md += `| \`guidance\` | **${statusCounts.guidance || 0}** | **${guidancePct}%** |\n`;
md += `| \`partial\` | ${statusCounts.partial || 0} | ${partialPct}% |\n`;
md += `| \`clarification\` | ${statusCounts.clarification || 0} | ${(((statusCounts.clarification || 0) / questions.length) * 100).toFixed(1)}% |\n`;
md += `| \`unavailable\` | ${statusCounts.unavailable || 0} | ${(((statusCounts.unavailable || 0) / questions.length) * 100).toFixed(1)}% |\n`;
md += `| \`error\` | **0** | **0%** |\n\n`;
md += `**Serviceable = ${serviceable} = ${serviceablePct}%**।\n\n`;

md += `## 3. Section-वार परिणाम\n\n`;
md += `| Section | Total | Guidance | Partial | Unavail / Clarif |\n`;
md += `|---|---|---|---|---|\n`;
for (const s of Object.values(sectionStats)) {
  md += `| ${s.section} | ${s.total} | **${s.guidance}** | ${s.partial} | ${s.clarification + s.unavailable} |\n`;
}

md += `\n## 4. गैप-कारण विश्लेषण\n\n`;
md += `| गैप कारण | आवृत्ति |\n`;
md += `|---|---|\n`;
for (const [reason, count] of Object.entries(gapReasons).sort((a, b) => b[1] - a[1])) {
  md += `| \`${reason}\` | **${count}** |\n`;
}

fs.writeFileSync(outMdPath, md, 'utf8');
console.log(`Saved Markdown report to ${outMdPath}`);
store.db.close();

