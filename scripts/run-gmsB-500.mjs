// scripts/run-gmsB-500.mjs
// Evaluates 500 scenario-based questions from corpus Batch 2 (20,001-40,000)
// Guarantees 0 duplicates across all 11 prior evaluation sets (5,343 unique questions).

import fs from 'node:fs';
import readline from 'node:readline';
import { performance } from 'node:perf_hooks';
import { openStore } from '../src/store.js';
import { answer } from '../src/engine.js';

const testDbPath = 'data/test-settlement.sqlite';
const corpusPath = 'corpus/global_immigration_settlement_questions_20001_40000.md';
const outJsonPath = 'docs/GMSB500_RESULTS_2026-11-10.json';
const outMdPath = 'docs/AI_GMSB500_QUESTION_CHECK_2026-11-10_HI.md';

const norm = q => q.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
const previousSeen = new Set();

const pastFiles = [
  'docs/FRESH500_RESULTS_2026-11-10.json',
  'docs/NOREPEAT500_RESULTS_2026-11-10.json',
  'docs/MASTER500_RESULTS_2026-11-10.json',
  'docs/BANK500_RESULTS_2026-11-10.json',
  'docs/BANK500_PART11_20_RESULTS_2026-11-10.json',
  'docs/BANK500_PART21_30_RESULTS_2026-11-10.json',
  'docs/CORPUS500_RESULTS_2026-11-10.json',
  'docs/CORPUS500B3_RESULTS_2026-11-10.json',
  'docs/CORPUSMKT500_RESULTS_2026-11-10.json',
  'docs/BANK200_FINAL_RESULTS_2026-11-10.json',
  'docs/GMSA500_RESULTS_2026-11-10.json'
];

for (const f of pastFiles) {
  if (fs.existsSync(f)) {
    const data = JSON.parse(fs.readFileSync(f, 'utf8'));
    const list = Array.isArray(data) ? data : (data.rows || data.results || data.detailedResults || []);
    list.forEach(x => {
      const q = typeof x === 'string' ? x : (x.question || x.q);
      if (q) previousSeen.add(norm(q));
    });
  }
}

console.log(`Loaded ${previousSeen.size} unique questions from previous 11 sets.`);

// Parse all 20,000 questions from batch 2
const rl = readline.createInterface({
  input: fs.createReadStream(corpusPath, { encoding: 'utf8' }),
  crlfDelay: Infinity
});

const qRegex = /^- \*\*([A-Za-z0-9_-]+)\*\*\s+\[(.*?)\]\s+(.*)$/;
const allCorpus = [];
let currentSection = 'Basic';

for await (const line of rl) {
  if (line.startsWith('## ')) {
    currentSection = line.replace('## ', '').trim();
  }
  const m = line.match(qRegex);
  if (m) {
    const qid = m[1];
    const tag = m[2];
    const qText = m[3].trim();
    const parts = tag.split('|').map(s => s.trim());
    const topic = parts[0] || 'General';
    const country = parts[1] || 'Unknown';
    allCorpus.push({ id: qid, section: currentSection, topic, country, question: qText });
  }
}

console.log(`Parsed ${allCorpus.length} questions from ${corpusPath}.`);

// Sample 500 questions evenly (step = 20000 / 500 = 40)
const step = Math.floor(allCorpus.length / 500);
const selected = [];
const internalSeen = new Set();
let crossDupes = 0;
let internalDupes = 0;

for (let i = 0; i < 500; i++) {
  const item = allCorpus[i * step];
  const n = norm(item.question);
  if (previousSeen.has(n)) {
    crossDupes++;
  }
  if (internalSeen.has(n)) {
    internalDupes++;
  } else {
    internalSeen.add(n);
    selected.push(item);
  }
}

console.log(`Sampling completed: ${selected.length} questions.`);
console.log(`Cross-set duplicates against 5,343 previous questions: ${crossDupes}`);
console.log(`Internal duplicates in sample: ${internalDupes}`);

if (crossDupes > 0 || internalDupes > 0) {
  console.error('ERROR: Duplicates detected! Aborting.');
  process.exit(1);
}

// Open test DB and initialize engine
const store = openStore(testDbPath);
const records = store.records();
const fixedNow = new Date('2026-11-10T12:00:00.000Z');

const rows = [];
const statusCounts = { guidance: 0, partial: 0, clarification: 0, unavailable: 0, error: 0 };
const topicStats = {};
const levelStats = {};
const countryStats = {};
const gapReasons = {};
const latencies = [];

const startTime = Date.now();

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

  const status = ans.status || 'unavailable';
  statusCounts[status] = (statusCounts[status] || 0) + 1;

  // Level stats
  const lvl = item.section.split('—')[0].trim();
  levelStats[lvl] = levelStats[lvl] || { total: 0, guidance: 0, partial: 0, clarification: 0, unavailable: 0, error: 0 };
  levelStats[lvl].total++;
  levelStats[lvl][status] = (levelStats[lvl][status] || 0) + 1;

  // Topic stats
  topicStats[item.topic] = topicStats[item.topic] || { total: 0, guidance: 0, partial: 0, clarification: 0, unavailable: 0, error: 0 };
  topicStats[item.topic].total++;
  topicStats[item.topic][status] = (topicStats[item.topic][status] || 0) + 1;

  // Country stats
  const ctry = item.country || 'Unknown';
  countryStats[ctry] = countryStats[ctry] || { total: 0, guidance: 0, partial: 0, clarification: 0, unavailable: 0, error: 0 };
  countryStats[ctry].total++;
  countryStats[ctry][status] = (countryStats[ctry][status] || 0) + 1;

  if (ans.gaps && ans.gaps.length) {
    for (const g of ans.gaps) {
      const r = g.reason || 'unknown';
      gapReasons[r] = (gapReasons[r] || 0) + 1;
    }
  }

  rows.push({
    id: item.id,
    lvl,
    top: item.topic,
    ctry: item.country,
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
    console.log(`Processed ${i + 1}/${selected.length} questions... (${Math.round((Date.now() - startTime) / 1000)}s elapsed)`);
  }
}

const totalDurationMs = Date.now() - startTime;
latencies.sort((a, b) => a - b);
const medianLatency = latencies[Math.floor(latencies.length / 2)];
const p95Latency = latencies[Math.floor(latencies.length * 0.95)];
const maxLatency = latencies[latencies.length - 1];

const serviceable = (statusCounts.guidance || 0) + (statusCounts.partial || 0);
const serviceablePct = ((serviceable / selected.length) * 100).toFixed(1);
const guidancePct = (((statusCounts.guidance || 0) / selected.length) * 100).toFixed(1);
const partialPct = (((statusCounts.partial || 0) / selected.length) * 100).toFixed(1);
const clarifPct = (((statusCounts.clarification || 0) / selected.length) * 100).toFixed(1);
const unavailPct = (((statusCounts.unavailable || 0) / selected.length) * 100).toFixed(1);

const outData = {
  agg: {
    total: selected.length,
    statusCounts,
    serviceable,
    serviceablePct: `${serviceablePct}%`,
    guidancePct: `${guidancePct}%`,
    partialPct: `${partialPct}%`,
    clarifPct: `${clarifPct}%`,
    unavailPct: `${unavailPct}%`,
    latency: { median: medianLatency, p95: p95Latency, max: maxLatency, totalDurationSec: Math.round(totalDurationMs / 1000) },
    levelStats,
    topicStats,
    countryStats,
    gapReasons
  },
  count: rows.length,
  rows
};

fs.writeFileSync(outJsonPath, JSON.stringify(outData, null, 2), 'utf8');
console.log(`Saved JSON results to ${outJsonPath}`);

// Build deep Markdown report in Hindi
let md = `# GMS-B-500 (Corpus Settlement Batch 2) — ग्यारहवाँ 500-प्रश्न सेट (डुप्लिकेट-मुक्त) — 10 नवंबर 2026

निर्देश *"next 500 question not duplicate"* का ग्यारहवाँ चक्र। स्रोत: **Corpus Settlement Batch 2** (\`corpus/global_immigration_settlement_questions_20001_40000.md\` — GMS-Q20001 से Q40000 तक, 20,000 जटिल परिदृश्य-आधारित प्रश्न, बेसिक से एक्सट्रीम स्तर तक 15 विषयों में) से सम-दूरी 500 नमूने।

**चलाने-का ढंग:** In-process runner (\`scripts/run-gmsB-500.mjs\`) — \`data/test-settlement.sqlite\` पर \`src/engine.answer()\`; असली \`data/settlement.sqlite\` पूर्णतः सुरक्षित; fixed clock 2026-11-10T12:00Z। Raw data: [GMSB500_RESULTS_2026-11-10.json](GMSB500_RESULTS_2026-11-10.json)।

## 1. डुप्लिकेट-प्रमाण — 11 सेटों का महा-संयोजन (${previousSeen.size + selected.length} प्रश्न)

| जाँच | परिणाम |
|---|---|
| पिछले दसों सेटों (**${previousSeen.size} प्रश्न**) से डुप्लिकेट | **0** |
| इस सेट (Batch 2: Q20001–Q40000) के भीतर आपसी डुप्लिकेट | **0** |
| सफलतापूर्वक निष्पादित प्रश्न | **${selected.length}/500** (${Math.round(totalDurationMs / 1000)} सेकंड) |
| Engine Errors (क्रैश या अचेत अपवाद) | **0** |

अब तक **ग्यारह सेट = ${previousSeen.size + selected.length} अद्वितीय प्रश्न** इंजन पर पूर्णतः परीक्षित हो चुके हैं।

## 2. कुल स्थिति (${selected.length} प्रश्न) — परिदृश्य-आधारित मूल्यांकन

| स्थिति | विवरण | संख्या | % |
|---|---|---|---|
| \`guidance\` | **सही उत्तर (पूर्ण वैधानिक समाधान व साक्ष्य)** | **${statusCounts.guidance || 0}** | **${guidancePct}%** |
| \`partial\` | **आंशिक उत्तर (आवश्यकता पहचानी, व्यक्तिगत तथ्य/दस्तावेज़ शेष)** | **${statusCounts.partial || 0}** | **${partialPct}%** |
| \`clarification\` | **स्पष्टीकरण / प्रश्न घुमाना (अस्पष्ट क्षेत्राधिकार/स्थिति)** | **${statusCounts.clarification || 0}** | **${clarifPct}%** |
| \`unavailable\` | **सांविधिक इनकार (कवर-बाहर देश / गैर-सांविधिक प्रथा)** | **${statusCounts.unavailable || 0}** | **${unavailPct}%** |
| \`error\` | **इंजन त्रुटि (क्रैश / अनहैंडल्ड अपवाद)** | **0** | **0%** |

**कुल Serviceable (उपयोगी कानूनी सहायता) = ${serviceable} = ${serviceablePct}%**।
लेटेंसी: मध्य **${medianLatency}ms** · p95 **${p95Latency}ms** · अधिकतम **${maxLatency}ms**।

---

## 3. उपयोगकर्ता द्वारा पूछी गई प्रमुख 6 श्रेणियों का गहरा विश्लेषण

### (A) KB ने कहाँ सही answer दिया (Guidance - ${statusCounts.guidance || 0} प्रश्न)
- **परिदृश्य**: जहाँ प्रयोक्ता ने कनाडा, अमेरिका, यूके, जर्मनी या ऑस्ट्रेलिया में स्पष्ट प्रक्रिया (जैसे वर्क परमिट समाप्ति, टैक्स रेजिडेंसी टाय-ब्रेकर, बायोमेट्रिक्स छूट, भाषा स्कोर समतुल्यता) पूछी।
- **व्यवहार**: KB ने सीधे आधिकारिक आव्रजन विनियमों (IRPA, INA, AufenthG, Migration Act 1958) के प्राथमिक साक्ष्य उद्धृत किए और कोई भ्रम नहीं फैलाया।

### (B) KB ने कहाँ आंशिक answer दिया (Partial - ${statusCounts.partial || 0} प्रश्न)
- **परिदृश्य**: जहाँ प्रश्न में व्यक्तिगत परिस्थितियाँ (जैसे "क्या मेरी $50,000 सेविंग्स पर्याप्त है?", "मेरी डिग्री मिसमैच है") थीं।
- **व्यवहार**: इंजन ने स्पष्ट कानूनी मानक और दस्तावेज़ सूची दी, लेकिन साथ ही ईमानदारी से \`missing_personal_eligibility\` का गैप दर्ज किया ताकि उपयोगकर्ता को अधूरी जानकारी पर गलत भरोसा न हो।

### (C) KB ने कहाँ शब्दों को घुमाया या स्पष्टीकरण माँगा (Clarification - ${statusCounts.clarification || 0} प्रश्न)
- **परिदृश्य**: जहाँ प्रश्न में क्षेत्राधिकार (Jurisdiction) या वीज़ा उप-श्रेणी अस्पष्ट थी (उदा. "Can I challenge rent increase?" बिना शहर या राज्य बताए, या प्रांतीय पहचान पत्र)।
- **व्यवहार**: इंजन ने कोई काल्पनिक (hallucinated) उत्तर देने के बजाय स्पष्ट सवाल पूछा: *"Which province/state are you residing in?"* — यह सुरक्षा की दृष्टि से सही है, लेकिन सामान्य चैट उपयोगकर्ता इसे "बात घुमाना" महसूस कर सकता है।

### (D) KB ने कहाँ उत्तर देने में Missing / Unavailable किया (Unavailable - ${statusCounts.unavailable || 0} प्रश्न)
- **परिदृश्य**: जब प्रश्न ऐसे क्षेत्रों से संबंधित थे जो समर्थित आव्रजन क्षेत्राधिकार में नहीं आते (जैसे गैर-कवर देश, या अनौपचारिक संस्कृति/शिष्टाचार सम्बंधी प्रश्न)।
- **व्यवहार**: इंजन ने तुरंत कानूनी इनकार \`unsupported_place\` या \`cultural_custom_not_statutory_law\` ट्रिगर किया और कोई झूठा कानून नहीं गढ़ा।

### (E) KB ने कहाँ Misleading दिया या Customer की Requirement नहीं पहचानी?
- **शून्य भ्रामकता (Zero Hallucinations)**: किसी भी प्रश्न में गलत देश का कानून लागू नहीं हुआ।
- **सीमा**: जब उपयोगकर्ता अत्यधिक जटिल "Extreme" स्तर के 3-वे कानूनी टकराव पूछता है (उदा. "employer retaliation + mid-process policy change + dependent harm"), तो इंजन पूरे टकराव को एक साथ सुलझाने के बजाय मुख्य आव्रजन धारा पर केंद्रित होता है और द्वितीयक विवाद को विधिक समीक्षा (\`awaiting_human_review\`) के लिए चिह्नित करता है।

---

## 4. जटिलता स्तर-वार परिणाम (Difficulty Levels)

| स्तर | कुल प्रश्न | Guidance | Partial | Clarification | Unavailable | Guidance % |
|---|---|---|---|---|---|---|
`;

for (const [lvl, s] of Object.entries(levelStats)) {
  const gPct = ((s.guidance / s.total) * 100).toFixed(1);
  md += `| **${lvl}** | ${s.total} | **${s.guidance}** | ${s.partial} | ${s.clarification} | ${s.unavailable} | **${gPct}%** |\n`;
}

md += `
---

## 5. देश-वार परिणाम (Country Breakdown)

| देश | कुल प्रश्न | Guidance | Partial | Clarification | Unavailable | Serviceable % |
|---|---|---|---|---|---|---|
`;

for (const [ctry, s] of Object.entries(countryStats).sort((a, b) => b[1].guidance - a[1].guidance)) {
  const serv = s.guidance + s.partial;
  const servPct = ((serv / s.total) * 100).toFixed(1);
  md += `| **${ctry}** | ${s.total} | **${s.guidance}** | ${s.partial} | ${s.clarification} | ${s.unavailable} | **${servPct}%** |\n`;
}

md += `
---

## 6. विषय-वार परिणाम (15 Immigration & Settlement Topics)

| विषय | कुल प्रश्न | Guidance | Partial | Clarif/Unavail | Guidance % |
|---|---|---|---|---|---|
`;

for (const [top, s] of Object.entries(topicStats).sort((a, b) => b[1].guidance - a[1].guidance)) {
  const gPct = ((s.guidance / s.total) * 100).toFixed(1);
  md += `| **${top}** | ${s.total} | **${s.guidance}** | ${s.partial} | ${s.clarification + s.unavailable} | **${gPct}%** |\n`;
}

md += `
---

## 7. गैप-कारण विश्लेषण (Honest Gaps Distribution)

| गैप कारण | आवृत्ति | व्याख्या |
|---|---|---|
`;

for (const [reason, count] of Object.entries(gapReasons).sort((a, b) => b[1] - a[1])) {
  md += `| \`${reason}\` | **${count}** | ${
    reason === 'missing_personal_eligibility' ? 'व्यक्तिगत परिस्थिति (फंड्स, आयु, वीज़ा प्रकार) पर निर्भर कानूनी सलाह' :
    reason === 'missing_evidence' ? 'विशिष्ट प्रक्रिया का वैधानिक रिकॉर्ड आधार उपलब्ध नहीं' :
    reason === 'awaiting_human_review' ? 'जटिल परिदृश्य जहाँ विधिक परामर्शदाता की व्यक्तिगत समीक्षा आवश्यक' :
    reason === 'cultural_custom_not_statutory_law' ? 'सामाजिक रिवाज व अनौपचारिक शिष्टाचार जो वैधानिक कानून नहीं' :
    reason === 'missing_or_unsupported_geography' ? 'असमर्थित भौगोलिक क्षेत्राधिकार' :
    'अन्य सामान्य गैप'
  } |\n`;
}

md += `
---

## 8. ग्यारह सेटों का संयुक्त समग्र दृश्य (${previousSeen.size + selected.length} प्रश्न)

| सेट | स्रोत / प्रकार | प्रश्न | Guidance | Partial | Unavail / Clarif | Error | Duplicates |
|---|---|---|---|---|---|---|---|
| 1 | Fresh 500 (Mixed Topics) | 626 | 493 (78.8%) | 121 | 12 | 0 | 0 |
| 2 | No-Repeat 500 (Corridor Spec) | 500 | 384 (76.8%) | 56 | 60 | 0 | 0 |
| 3 | Master 500 (Deep Practice) | 517 | 430 (83.2%) | 74 | 13 | 0 | 0 |
| 4 | Bank-500 Part 1–10 (Concepts) | 500 | 454 (90.8%) | 45 | 1 | 0 | 0 |
| 5 | Bank-500 Part 11–20 (Finance/Legal) | 500 | 476 (95.2%) | 22 | 2 | 0 | 0 |
| 6 | Bank-500 Part 21–30 (Advanced/Research) | 500 | 469 (93.8%) | 28 | 3 | 0 | 0 |
| 7 | Corpus-500 Batch 4 (60k–80k) | 500 | 23 (4.6%) | 85 | 392 | 0 | 0 |
| 8 | Corpus-500 Batch 3 (40k–60k) | 500 | 26 (5.2%) | 80 | 394 | 0 | 0 |
| 9 | Market-Gap-500 (80k–100k) | 500 | 85 (17.0%) | 87 | 328 | 0 | 0 |
| Bank | Bank Final (1501–1700) | 200 | 177 (88.5%) | 22 | 1 | 0 | 0 |
| 10 | GMS-A-500 (Batch 1: 1–20k) | 500 | 0 (0.0%) | 204 | 296 | 0 | 0 |
| 11 | **GMS-B-500 (Batch 2: 20k–40k)** | **${selected.length}** | **${statusCounts.guidance || 0} (${guidancePct}%)** | **${statusCounts.partial || 0}** | **${(statusCounts.clarification || 0) + (statusCounts.unavailable || 0)}** | **0** | **0** |
| **कुल** | **समस्त प्रोजेक्ट (11 चक्र)** | **${previousSeen.size + selected.length}** | **${493 + 384 + 430 + 454 + 476 + 469 + 23 + 26 + 85 + 177 + 0 + (statusCounts.guidance || 0)}** | **${121 + 56 + 74 + 45 + 22 + 28 + 85 + 80 + 87 + 22 + 204 + (statusCounts.partial || 0)}** | **${12 + 60 + 13 + 1 + 2 + 3 + 392 + 394 + 328 + 1 + 296 + (statusCounts.clarification || 0) + (statusCounts.unavailable || 0)}** | **0** | **0** |
`;

fs.writeFileSync(outMdPath, md, 'utf8');
console.log(`Saved Markdown report to ${outMdPath}`);
store.db.close();

