import fs from 'fs';
import readline from 'readline';
import { openStore } from '../src/store.js';
import { parse, retrieve, answer } from '../src/engine.js';
import { requestedSubject, subjectEvidenceMatcher } from '../src/requested-subject.js';

async function diagnoseActualMissing() {
  const store = openStore();
  const records = store.records();

  // Load questions exactly as run-topic-kb-audit-5000.mjs does
  const topicPools = {
    housing: [],
    employment: [],
    healthcare: [],
    identity_sin: [],
    money_tax: [],
    family_childcare: [],
    immigration_visas: [],
    transit_community: [],
    driving: [],
    telecom_utilities: []
  };

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

  // Same for f1 and f3 if needed
  for (const fn of ['corpus/global_immigration_social_questions_40001_60000.md', 'corpus/global_immigration_settlement_questions_20001_40000.md']) {
    if (fs.existsSync(fn)) {
      const rl = readline.createInterface({ input: fs.createReadStream(fn) });
      for await (const line of rl) {
        const match = line.match(/- \*\*(GMS-Q\d+)\*\*\s+\[(.*?)\s*\|\s*(.*?)\]\s*(.*)$/);
        if (!match) continue;
        const qid = match[1];
        const topic = match[2].trim();
        const country = match[3].trim();
        const q = match[4].trim();

        if (topic === 'Housing & tenant rights' && topicPools.housing.length < 500) {
          topicPools.housing.push({ id: qid, topicKey: 'housing', country, platform: 'Forum', question: q });
        } else if (topic === 'Jobs & employment' && topicPools.employment.length < 500) {
          topicPools.employment.push({ id: qid, topicKey: 'employment', country, platform: 'Forum', question: q });
        } else if (topic === 'Healthcare & disability' && topicPools.healthcare.length < 500) {
          topicPools.healthcare.push({ id: qid, topicKey: 'healthcare', country, platform: 'Forum', question: q });
        } else if (topic === 'Settlement & identity' && topicPools.identity_sin.length < 500) {
          topicPools.identity_sin.push({ id: qid, topicKey: 'identity_sin', country, platform: 'Forum', question: q });
        } else if (topic === 'Tax & banking' && topicPools.money_tax.length < 500) {
          topicPools.money_tax.push({ id: qid, topicKey: 'money_tax', country, platform: 'Forum', question: q });
        } else if (topic === 'Family & education' && topicPools.family_childcare.length < 500) {
          topicPools.family_childcare.push({ id: qid, topicKey: 'family_childcare', country, platform: 'Forum', question: q });
        } else if (topic === 'Immigration status & procedure' && topicPools.immigration_visas.length < 500) {
          topicPools.immigration_visas.push({ id: qid, topicKey: 'immigration_visas', country, platform: 'Forum', question: q });
        } else if ((topic === 'Local services & cost of living' || topic === 'Public services & consumer') && topicPools.transit_community.length < 500) {
          topicPools.transit_community.push({ id: qid, topicKey: 'transit_community', country, platform: 'Forum', question: q });
        } else if ((topic === 'Skilled migration & licensing' || /driv|licen|vehicle/i.test(q)) && topicPools.driving.length < 500) {
          topicPools.driving.push({ id: qid, topicKey: 'driving', country, platform: 'Forum', question: q });
        } else if (/phone|mobile|telecom|internet|broadband|sim/i.test(q) && topicPools.telecom_utilities.length < 500) {
          topicPools.telecom_utilities.push({ id: qid, topicKey: 'telecom_utilities', country, platform: 'Forum', question: q });
        }
      }
    }
  }

  const missingList = [];
  let totalEvaluated = 0;
  let totalSahi = 0;
  let totalReqIgnored = 0;
  let totalMissing = 0;

  for (const [topicKey, list] of Object.entries(topicPools)) {
    for (const qObj of list) {
      totalEvaluated++;
      const res = answer({ question: qObj.question }, records);
      const claims = res.claims || [];
      const gaps = res.gaps || [];
      const clarification = res.clarification || '';

      const hasUnsupportedPlace = res.placeClarification?.reason === 'unsupported_place' ||
                                  gaps.some(g => g.reason === 'missing_or_unsupported_geography') ||
                                  (clarification && /outside our verified|does not cover that place|outside Canada/i.test(clarification));

      if (hasUnsupportedPlace) {
        totalReqIgnored++;
      } else if (claims.length > 0) {
        totalSahi++;
      } else {
        totalMissing++;
        const parsed = parse({ question: qObj.question });
        const cands = retrieve(parsed, records);
        const subj = requestedSubject(qObj.question);
        missingList.push({
          id: qObj.id,
          topicKey,
          country: qObj.country,
          question: qObj.question,
          subj,
          parsedCountry: parsed.country,
          parsedCity: parsed.city,
          parsedRegion: parsed.region,
          intents: parsed.intents,
          candsCount: cands.length,
          topCand: cands[0]?.id || null,
          topCandScore: cands[0]?.score || 0
        });
      }
    }
  }

  console.log(`Total: ${totalEvaluated}, Sahi: ${totalSahi}, ReqIgnored: ${totalReqIgnored}, Missing: ${totalMissing}`);
  fs.writeFileSync('scripts/actual-missing.json', JSON.stringify({ missingCount: missingList.length, missingList }, null, 2));
  console.log('Saved actual missing to scripts/actual-missing.json');
}

diagnoseActualMissing();

