// Reproducible local tool load smoke test. No external providers or live DB writes.
import { performance } from 'node:perf_hooks';
import { writeFileSync } from 'node:fs';
import { openStore } from '../src/store.js';
import { createApp } from '../src/server.js';

const store = openStore(':memory:');
const server = createApp(store, undefined, {});
const cases = [
  ['study-permit-cap-pal', { tuition: 20000, funds: 60000, applicationDate: '2026-11-06' }],
  ['visitor-visa-financial-ties', { days: 14, funds: 0, income: 0, tenure: 0, leaveLetter: false, property: false, familyHome: false, familyTraveling: false, g7Travel: false, refusal: false, dualIntent: false }],
  ['study-to-pr', { degree: 'doctoral', clb: 9, teer: 1, foreignExperience: false, foreignYears: 0 }],
  ['australia-tenancy', { state: 'VIC', weeklyRent: 700, bondPaid: 2800, monthsSinceLastIncrease: 10, noticeGivenDays: 45 }],
  ['uk-devolved-tenancy', { nation: 'Wales', monthlyRent: 1200, depositPaid: 1200, tenureMonths: 4, noticeGivenDays: 60 }]
];
const observations = [], failures = [];
let next = 0;
try {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const root = `http://127.0.0.1:${server.address().port}`;
  const started = performance.now();
  await Promise.all(Array.from({ length: 8 }, async () => {
    while (next < 100) {
      const index = next++, [tool, body] = cases[index % cases.length], start = performance.now();
      try {
        const response = await fetch(`${root}/v1/tools/${tool}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(10000) });
        const data = await response.json();
        observations.push({ tool, ms: performance.now() - start, status: response.status });
        if (response.status !== 200 || data.error) failures.push({ index, tool, status: response.status, error: data.code });
      } catch (error) { failures.push({ index, tool, error: error.message }); }
    }
  }));
  const latency = observations.map(r => r.ms).sort((a,b) => a-b);
  const percentile = p => latency[Math.ceil(latency.length * p) - 1] ?? null;
  const report = { recordedOn: '2026-11-06', scope: 'Local loopback, seeded in-memory SQLite, external AI disabled. Tool route latency only; not production capacity, long-duration soak or policy accuracy.',
    requests: 100, concurrency: 8, toolFamilies: cases.map(([tool])=>tool), corpusRecords: store.db.prepare('SELECT count(*) AS n FROM records').get().n,
    elapsedMs: performance.now() - started, latencyMs: { p50: percentile(.5), p95: percentile(.95), p99: percentile(.99) }, failures };
  writeFileSync('artifacts/PENDING_33_2026-11-06_tool_load.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
  if (failures.length) process.exitCode = 1;
} finally {
  if (server.listening) await new Promise(resolve => server.close(resolve));
  store.db.close();
}
