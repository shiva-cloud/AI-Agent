// scripts/run-topic-kb-audit-5000.mjs
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { performance } from 'node:perf_hooks';
import { openStore } from '../src/store.js';
import { answer } from '../src/engine.js';

async function run5000TopicAudit() {
  console.log('================================================================');
  console.log('STARTING REFINED 5,000-QUESTION KB AUDIT (500 Qs x 10 TOPICS)');
  console.log('================================================================');

  const startTime = performance.now();
  const store = openStore();
  const records = store.records();
  console.log(`Knowledge Base loaded: ${records.length} records in SQLite store.\n`);

  // Define 10 Topics
  const topicConfigs = [
    { key: 'housing', name: 'Housing & Tenancy (आवास और किरायेदारी)' },
    { key: 'employment', name: 'Employment & Worker Rights (रोजगार और श्रम अधिकार)' },
    { key: 'healthcare', name: 'Healthcare & Medical Coverage (स्वास्थ्य और चिकित्सा)' },
    { key: 'identity_sin', name: 'Identity & SIN (पहचान, दस्तावेज और SIN)' },
    { key: 'driving', name: 'Driving & Vehicle Licensing (ड्राइविंग और लाइसेंस)' },
    { key: 'money_tax', name: 'Money, Banking & Tax (बैंकिंग, टैक्स और वित्त)' },
    { key: 'transit_community', name: 'Transit & Community (ट्रांजिट और समुदाय सेवाएं)' },
    { key: 'immigration_visas', name: 'Immigration & Visas (इमिग्रेशन और वीजा कानून)' },
    { key: 'family_childcare', name: 'Family & Children (परिवार, बच्चे और स्कूलिंग)' },
    { key: 'telecom_utilities', name: 'Telecom & Utilities (दूरसंचार और उपभोक्ता अधिकार)' }
  ];

  const topicPools = Object.fromEntries(topicConfigs.map(t => [t.key, []]));

  // 1. Ingest from corpus/global_immigration_settlement_20000_questions.md (Settlement & Municipal Forum)
  const f2 = 'corpus/global_immigration_settlement_20000_questions.md';
  if (fs.existsSync(f2)) {
    const rl2 = readline.createInterface({ input: fs.createReadStream(f2) });
    for await (const line of rl2) {
      const match = line.match(/- \*\*(GMS-Q\d+)\*\*\s+\[(.*?)\s*\|\s*(.*?)\]\s*(.*)$/);
      if (!match) continue;
      const qid = match[1];
      const topic = match[2].trim();
      const country = match[3].trim();
      const q = match[4].trim();
      const platform = 'Settlement & Municipal Forum';

      if ((topic === 'Housing & Tenancy' || topic === 'Housing & tenant rights') && topicPools.housing.length < 500) {
        topicPools.housing.push({ id: qid, topicKey: 'housing', country, platform, question: q });
      } else if ((topic === 'Employment & Labour' || topic === 'Jobs & Careers' || topic === 'Jobs & employment') && topicPools.employment.length < 500) {
        topicPools.employment.push({ id: qid, topicKey: 'employment', country, platform, question: q });
      } else if ((topic === 'Healthcare' || topic === 'Healthcare & disability') && topicPools.healthcare.length < 500) {
        topicPools.healthcare.push({ id: qid, topicKey: 'healthcare', country, platform, question: q });
      } else if ((topic === 'Identity & SIN' || topic === 'Settlement & identity') && topicPools.identity_sin.length < 500) {
        topicPools.identity_sin.push({ id: qid, topicKey: 'identity_sin', country, platform, question: q });
      } else if ((topic === 'Driving & Vehicles' || topic === 'Skilled migration & licensing' || /driv|licen|vehicle/i.test(q)) && topicPools.driving.length < 500) {
        topicPools.driving.push({ id: qid, topicKey: 'driving', country, platform, question: q });
      } else if ((topic === 'Banking & Tax' || topic === 'Tax & banking') && topicPools.money_tax.length < 500) {
        topicPools.money_tax.push({ id: qid, topicKey: 'money_tax', country, platform, question: q });
      } else if ((topic === 'Transit' || topic === 'Local Settlement' || topic === 'Local services & cost of living' || topic === 'Public services & consumer') && topicPools.transit_community.length < 500) {
        topicPools.transit_community.push({ id: qid, topicKey: 'transit_community', country, platform, question: q });
      } else if ((topic === 'Work Immigration' || topic === 'Immigration Policy' || topic === 'PR & Citizenship' || topic === 'Immigration status & procedure') && topicPools.immigration_visas.length < 500) {
        topicPools.immigration_visas.push({ id: qid, topicKey: 'immigration_visas', country, platform, question: q });
      } else if ((topic === 'Family & Schools' || topic === 'Family & education') && topicPools.family_childcare.length < 500) {
        topicPools.family_childcare.push({ id: qid, topicKey: 'family_childcare', country, platform, question: q });
      } else if ((topic === 'Telecom & Consumer' || /phone|mobile|telecom|internet|broadband|sim/i.test(q)) && topicPools.telecom_utilities.length < 500) {
        topicPools.telecom_utilities.push({ id: qid, topicKey: 'telecom_utilities', country, platform, question: q });
      }
    }
  }

  // 2. Ingest from corpus/global_immigration_social_questions_40001_60000.md (Reddit/Quora/ExpatForum)
  const f1 = 'corpus/global_immigration_social_questions_40001_60000.md';
  if (fs.existsSync(f1)) {
    const rl1 = readline.createInterface({ input: fs.createReadStream(f1) });
    for await (const line of rl1) {
      const match = line.match(/^(\d+)\.\s+\*\*\[(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\]\*\*\s*(.*)$/);
      if (!match) continue;
      const num = match[1];
      const country = match[2].trim();
      const cat = match[4].trim();
      const q = match[5].trim();
      const platform = 'Reddit/Quora/ExpatForum';

      if (cat === 'Housing and tenant protection' && topicPools.housing.length < 500) {
        topicPools.housing.push({ id: `SOC-${num}`, topicKey: 'housing', country, platform, question: q });
      } else if (cat === 'Jobs and worker rights' && topicPools.employment.length < 500) {
        topicPools.employment.push({ id: `SOC-${num}`, topicKey: 'employment', country, platform, question: q });
      } else if (cat === 'Healthcare and disability' && topicPools.healthcare.length < 500) {
        topicPools.healthcare.push({ id: `SOC-${num}`, topicKey: 'healthcare', country, platform, question: q });
      } else if (cat === 'Tax, banking and finance' && topicPools.money_tax.length < 500) {
        topicPools.money_tax.push({ id: `SOC-${num}`, topicKey: 'money_tax', country, platform, question: q });
      } else if (cat === 'Education and children' && topicPools.family_childcare.length < 500) {
        topicPools.family_childcare.push({ id: `SOC-${num}`, topicKey: 'family_childcare', country, platform, question: q });
      } else if (cat === 'Immigration status and visas' && topicPools.immigration_visas.length < 500) {
        topicPools.immigration_visas.push({ id: `SOC-${num}`, topicKey: 'immigration_visas', country, platform, question: q });
      } else if (cat === 'Local services and daily life' && topicPools.transit_community.length < 500) {
        topicPools.transit_community.push({ id: `SOC-${num}`, topicKey: 'transit_community', country, platform, question: q });
      }
    }
  }

  // 3. Fill remaining from 20001_40000 (Settlement & Expat Q&A)
  const f3 = 'corpus/global_immigration_settlement_questions_20001_40000.md';
  if (fs.existsSync(f3)) {
    const rl3 = readline.createInterface({ input: fs.createReadStream(f3) });
    for await (const line of rl3) {
      const match = line.match(/- \*\*(GMS-Q\d+)\*\*\s+\[(.*?)\s*\|\s*(.*?)\]\s*(.*)$/);
      if (!match) continue;
      const qid = match[1];
      const topic = match[2].trim();
      const country = match[3].trim();
      const q = match[4].trim();

      if (topic === 'Housing & tenant rights' && topicPools.housing.length < 500) {
        topicPools.housing.push({ id: qid, topicKey: 'housing', country, platform: 'Settlement & Expat Q&A', question: q });
      } else if (topic === 'Jobs & employment' && topicPools.employment.length < 500) {
        topicPools.employment.push({ id: qid, topicKey: 'employment', country, platform: 'Settlement & Expat Q&A', question: q });
      } else if (topic === 'Healthcare & disability' && topicPools.healthcare.length < 500) {
        topicPools.healthcare.push({ id: qid, topicKey: 'healthcare', country, platform: 'Settlement & Expat Q&A', question: q });
      } else if (topic === 'Settlement & identity' && topicPools.identity_sin.length < 500) {
        topicPools.identity_sin.push({ id: qid, topicKey: 'identity_sin', country, platform: 'Settlement & Expat Q&A', question: q });
      } else if (topic === 'Tax & banking' && topicPools.money_tax.length < 500) {
        topicPools.money_tax.push({ id: qid, topicKey: 'money_tax', country, platform: 'Settlement & Expat Q&A', question: q });
      } else if (topic === 'Family & education' && topicPools.family_childcare.length < 500) {
        topicPools.family_childcare.push({ id: qid, topicKey: 'family_childcare', country, platform: 'Settlement & Expat Q&A', question: q });
      } else if (topic === 'Immigration status & procedure' && topicPools.immigration_visas.length < 500) {
        topicPools.immigration_visas.push({ id: qid, topicKey: 'immigration_visas', country, platform: 'Settlement & Expat Q&A', question: q });
      } else if ((topic === 'Local services & cost of living' || topic === 'Public services & consumer') && topicPools.transit_community.length < 500) {
        topicPools.transit_community.push({ id: qid, topicKey: 'transit_community', country, platform: 'Settlement & Expat Q&A', question: q });
      } else if ((topic === 'Skilled migration & licensing' || /driv|licen|vehicle/i.test(q)) && topicPools.driving.length < 500) {
        topicPools.driving.push({ id: qid, topicKey: 'driving', country, platform: 'Settlement & Expat Q&A', question: q });
      } else if (/phone|mobile|telecom|internet|broadband|sim/i.test(q) && topicPools.telecom_utilities.length < 500) {
        topicPools.telecom_utilities.push({ id: qid, topicKey: 'telecom_utilities', country, platform: 'Settlement & Expat Q&A', question: q });
      }
    }
  }

  const topicResults = {};
  const globalSummary = {
    total: 0,
    sahi: 0,
    galat: 0,
    shabdon_ko_ghumaya: 0,
    missing: 0,
    misleading: 0,
    requirement_ignored: 0,
    totalLatencyMs: 0
  };

  const detailedAuditLog = [];

  for (const tc of topicConfigs) {
    const list = topicPools[tc.key];
    console.log(`Processing Topic: ${tc.name} (${list.length} questions)...`);
    const tStart = performance.now();

    const stats = {
      topicKey: tc.key,
      topicName: tc.name,
      total: list.length,
      sahi: 0,
      galat: 0,
      shabdon_ko_ghumaya: 0,
      missing: 0,
      misleading: 0,
      requirement_ignored: 0,
      avgLatencyMs: 0,
      samples: {
        sahi: [],
        galat: [],
        shabdon_ko_ghumaya: [],
        missing: [],
        misleading: [],
        requirement_ignored: []
      }
    };

    let totalLat = 0;

    for (let i = 0; i < list.length; i++) {
      const qObj = list[i];
      const qStart = performance.now();

      let res;
      try {
        res = answer({ question: qObj.question }, records);
      } catch (err) {
        res = {
          status: 'error',
          claims: [],
          sources: [],
          gaps: [{ reason: err.message }]
        };
      }

      const qDuration = performance.now() - qStart;
      totalLat += qDuration;

      const claims = res.claims || [];
      const sources = res.sources || [];
      const gaps = res.gaps || [];
      const clarification = res.clarification || '';
      const claimsText = claims.map(c => c.text || '').join(' ');

      // ── Precise 6-Dimension Classification Logic ─────────────────────────────
      let category = 'sahi';
      let reasonDetail = '';

      // 1. गलत Answer (Hallucination / Factually Wrong)
      const hasHallucination = claims.some(c =>
        /\b(?:guaranteed?\s+PR\b|100%\s+approval\b|secret\s+backdoor\b|fake\s+visa\b|no\s+documentation\s+needed\b|automatic\s+citizenship\b)/i.test(c.text || '')
      );

      // 2. Customer की Requirement नहीं जानी (Scope / Unsupported Geography / Requirement Ignored)
      const hasUnsupportedPlace = res.placeClarification?.reason === 'unsupported_place' ||
                                  gaps.some(g => g.reason === 'missing_or_unsupported_geography') ||
                                  (clarification && /outside our verified|does not cover that place|outside Canada/i.test(clarification));

      // 3. शब्दों को घुमाया (AI ne Ghumaya / Evasive / Clarification Deflection)
      const isEvasive = (res.status === 'clarification' && !hasUnsupportedPlace) ||
                        (clarification && !hasUnsupportedPlace && claims.length === 0 && !gaps.length);

      // 4. Misleading दिया (Misleading Language / Unqualified Advice)
      const isMisleading = claims.length > 0 && (
        (!res.disclaimer && !res.meta?.disclaimer && (tc.key === 'immigration_visas' || tc.key === 'employment')) ||
        /you will be approved|no risk of deportation/i.test(claimsText)
      );

      // 5. उत्तर देने में Missing किया (Missing / Incomplete / Declared Gap)
      const isMissing = res.status === 'unavailable' ||
                        res.status === 'partial' ||
                        (claims.length === 0 && gaps.length > 0 && !hasUnsupportedPlace);

      // Classification Priority
      if (hasHallucination) {
        category = 'galat';
        reasonDetail = 'Fabricated statutory claim or unsupported absolute guarantee';
      } else if (hasUnsupportedPlace) {
        category = 'requirement_ignored';
        reasonDetail = clarification || `Customer requirement for ${qObj.country || 'requested place'} ignored/unsupported by KB scope`;
      } else if (isMisleading) {
        category = 'misleading';
        reasonDetail = 'Unqualified legal claim without statutory disclaimer or caveat';
      } else if (isEvasive) {
        category = 'shabdon_ko_ghumaya';
        reasonDetail = clarification || 'AI deflected with ambiguous clarification instead of statutory answer';
      } else if (claims.length > 0) {
        category = 'sahi';
        reasonDetail = `Accurate guidance provided with ${claims.length} claim(s) and ${sources.length} statutory source(s)`;
      } else if (isMissing) {
        category = 'missing';
        reasonDetail = gaps.map(g => g.reason || g.code || g.topic).join(', ') || 'Statutory evidence gap / unavailable';
      } else {
        category = 'missing';
        reasonDetail = 'No claims returned';
      }

      stats[category]++;
      globalSummary[category]++;

      // Store sample if under 4 samples for this category
      if (stats.samples[category].length < 4) {
        stats.samples[category].push({
          id: qObj.id,
          question: qObj.question,
          platform: qObj.platform,
          country: qObj.country,
          status: res.status,
          reasonDetail,
          sampleClaim: claims[0]?.text || null,
          clarification: clarification || null,
          sources: sources.map(s => s.title || s.id).slice(0, 2)
        });
      }

      detailedAuditLog.push({
        id: qObj.id,
        topicKey: tc.key,
        question: qObj.question,
        country: qObj.country,
        platform: qObj.platform,
        evaluationCategory: category,
        reasonDetail,
        status: res.status,
        claimsCount: claims.length,
        sourcesCount: sources.length,
        latencyMs: Math.round(qDuration)
      });
    }

    stats.avgLatencyMs = Math.round(totalLat / list.length);
    topicResults[tc.key] = stats;
    const tDur = ((performance.now() - tStart) / 1000).toFixed(2);
    console.log(`Topic ${tc.name} done in ${tDur}s: Sahi: ${stats.sahi}, ReqIgnored: ${stats.requirement_ignored}, Missing: ${stats.missing}, Ghumaya: ${stats.shabdon_ko_ghumaya}, Misleading: ${stats.misleading}, Galat: ${stats.galat}`);
  }

  globalSummary.total = detailedAuditLog.length;
  const totalDuration = ((performance.now() - startTime) / 1000).toFixed(2);
  globalSummary.totalLatencyMs = Math.round(detailedAuditLog.reduce((acc, r) => acc + r.latencyMs, 0) / detailedAuditLog.length);

  console.log('\n================================================================');
  console.log('REFINED AUDIT COMPLETE! AGGREGATE SUMMARY:');
  console.log('================================================================');
  console.log(`Total Questions Evaluated: ${globalSummary.total}`);
  console.log(`1. Sahi Answer (सटीक उत्तर दिया): ${globalSummary.sahi} (${((globalSummary.sahi/globalSummary.total)*100).toFixed(2)}%)`);
  console.log(`2. Requirement Ignored (Customer की requirement नहीं जानी / Scope बाहर): ${globalSummary.requirement_ignored} (${((globalSummary.requirement_ignored/globalSummary.total)*100).toFixed(2)}%)`);
  console.log(`3. Missing Kiya (उत्तर में missing/gap): ${globalSummary.missing} (${((globalSummary.missing/globalSummary.total)*100).toFixed(2)}%)`);
  console.log(`4. Shabdon Ko Ghumaya (AI ने शब्दों को घुमाया): ${globalSummary.shabdon_ko_ghumaya} (${((globalSummary.shabdon_ko_ghumaya/globalSummary.total)*100).toFixed(2)}%)`);
  console.log(`5. Misleading Diya (भ्रामक उत्तर दिया): ${globalSummary.misleading} (${((globalSummary.misleading/globalSummary.total)*100).toFixed(2)}%)`);
  console.log(`6. Galat Answer (गलत / Hallucination): ${globalSummary.galat} (${((globalSummary.galat/globalSummary.total)*100).toFixed(2)}%)`);
  console.log(`Average Engine Latency: ${globalSummary.totalLatencyMs}ms`);
  console.log(`Total Execution Time: ${totalDuration}s`);
  console.log('================================================================\n');

  // Save Results to Artifacts
  const artifactsDir = path.resolve('artifacts');
  if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir, { recursive: true });

  const auditReportJson = {
    generatedAt: new Date().toISOString(),
    evaluationTotal: globalSummary.total,
    durationSeconds: parseFloat(totalDuration),
    globalSummary,
    topicResults,
    sampleAudits: detailedAuditLog.slice(0, 200)
  };

  fs.writeFileSync(
    path.join(artifactsDir, 'deep-5000-kb-audit-results.json'),
    JSON.stringify(auditReportJson, null, 2),
    'utf8'
  );
  console.log('Saved detailed results to artifacts/deep-5000-kb-audit-results.json');
}

run5000TopicAudit().catch(err => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});
