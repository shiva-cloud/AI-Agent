import { writeFileSync } from 'node:fs';
import { botConversationalChains, allBotQuestions } from './bot-simulation-twisted-questions.js';

const SERVER_URL = 'http://localhost:3000/v1/answers';

async function queryServer(payload) {
  const started = performance.now();
  let res = await fetch(SERVER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (res.status === 429) {
    const waitSec = Number(res.headers.get('retry-after') || 1);
    await new Promise(r => setTimeout(r, (waitSec * 1000) + 100));
    res = await fetch(SERVER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }

  await new Promise(r => setTimeout(r, 20));
  const elapsed = performance.now() - started;
  const data = await res.json();
  return { status: res.status, data, elapsed };
}

async function runSimulation() {
  console.log(`================================================================`);
  console.log(`STARTING BOT-TO-BOT CONVERSATIONAL & TWISTED EQUATIONS BENCHMARK`);
  console.log(`Chains: ${botConversationalChains.length} | Total Turns: ${allBotQuestions.length}`);
  console.log(`Target Server: ${SERVER_URL}`);
  console.log(`================================================================\n`);

  const results = [];
  let passedCount = 0;
  let failedCount = 0;

  for (const chain of botConversationalChains) {
    console.log(`\n── Executing Chain: "${chain.chain}" (${chain.steps.length} turns) ──`);
    for (const step of chain.steps) {
      try {
        const { status, data, elapsed } = await queryServer({
          question: step.q,
          city: step.city
        });

        const hasClaims = Array.isArray(data.claims) && data.claims.length > 0;
        const isPassed = (data.status === 'guidance' || data.status === 'partial') && hasClaims;

        if (isPassed) {
          passedCount++;
        } else {
          failedCount++;
        }

        const leadClaim = hasClaims ? data.claims[0].text : (data.clarification || 'None');
        const leadSource = hasClaims && data.sources?.length ? data.sources[0].title : 'None';

        results.push({
          chain: chain.chain,
          botTurn: step.botTurn,
          id: step.id,
          city: step.city,
          httpStatus: status,
          resultStatus: data.status,
          aiStatus: data.ai?.status || 'unknown',
          passed: isPassed,
          claimsCount: data.claims?.length || 0,
          sourcesCount: data.sources?.length || 0,
          latencyMs: Number(elapsed.toFixed(1)),
          leadSource,
          question: step.q,
          leadClaim
        });

        const icon = isPassed ? '✔' : '✖';
        console.log(`  [Turn ${step.botTurn}] ${icon} [${step.id}] Status: ${data.status} | Latency: ${elapsed.toFixed(1)}ms | Sources: ${data.sources?.length || 0}`);
        if (!isPassed) {
          console.log(`      -> Question: ${step.q}`);
          console.log(`      -> Clarification/Gaps: ${leadClaim}`);
        }
      } catch (err) {
        failedCount++;
        console.error(`  [Turn ${step.botTurn}] ✖ Error on ${step.id}:`, err.message);
      }
    }
  }

  console.log(`\n================================================================`);
  console.log(`BOT-TO-BOT BENCHMARK COMPLETED`);
  console.log(`Total Bot Turns: ${allBotQuestions.length}`);
  console.log(`Passed (Accurate Official Guidance): ${passedCount} / ${allBotQuestions.length} (${((passedCount / allBotQuestions.length) * 100).toFixed(1)}%)`);
  console.log(`Failed / Unavailable: ${failedCount}`);
  console.log(`AI Engine: ${results[0]?.aiStatus} (Pure Knowledge Base Evidence)`);
  console.log(`================================================================\n`);

  // Chain Breakdown
  const chainStats = {};
  for (const r of results) {
    if (!chainStats[r.chain]) chainStats[r.chain] = { total: 0, passed: 0 };
    chainStats[r.chain].total++;
    if (r.passed) chainStats[r.chain].passed++;
  }

  console.log('Chain Breakdown:');
  for (const [cName, s] of Object.entries(chainStats)) {
    console.log(` - ${cName.padEnd(38)}: ${s.passed} / ${s.total} (${((s.passed / s.total) * 100).toFixed(1)}%)`);
  }

  // Write CSV
  const csvHeader = 'Chain,Turn,ID,City,HTTPStatus,ResultStatus,AIStatus,Passed,ClaimsCount,SourcesCount,LatencyMs,LeadSource,Question,LeadClaim';
  const csvRows = [csvHeader];
  for (const r of results) {
    const snippet = (r.leadClaim || '').replace(/"/g, '""').slice(0, 250);
    csvRows.push([
      `"${r.chain}"`,
      r.botTurn,
      r.id,
      r.city,
      r.httpStatus,
      r.resultStatus,
      r.aiStatus,
      r.passed,
      r.claimsCount,
      r.sourcesCount,
      r.latencyMs,
      `"${(r.leadSource || '').replace(/"/g, '""')}"`,
      `"${r.question.replace(/"/g, '""')}"`,
      `"${snippet}"`
    ].join(','));
  }

  writeFileSync('artifacts/bot-simulation-results.csv', csvRows.join('\n'));
  console.log('\nDetailed results saved to artifacts/bot-simulation-results.csv');
}

runSimulation();
