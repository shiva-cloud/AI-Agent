import { createApp } from '../src/server.js';
import { openStore } from '../src/store.js';
import { questionSuite } from './question-suite-180.js';
import { fileURLToPath } from 'node:url';

// Disposable seed-backed HTTP regression, not browser automation or live-provider QA.
export async function runHttpQuestionSuite(questions = questionSuite) {
  const store = openStore(':memory:');
  const app = createApp(store, null, {}, { trustedProxyIps: ['127.0.0.1'] });
  const failures = [];
  try {
    await new Promise((resolve, reject) => {
      app.once('error', reject);
      app.listen(0, '127.0.0.1', resolve);
    });
    const origin = `http://127.0.0.1:${app.address().port}`;
    for (let i = 0; i < questions.length; i++) {
      const item = questions[i];
      try {
        const response = await fetch(origin + '/v1/answers', {
          method: 'POST', signal: AbortSignal.timeout(10000),
          headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': `198.51.100.${i % 100 + 1}` },
          body: JSON.stringify({ question: item.q })
        });
        const body = await response.json();
        const matches = item.exp === 'guidance'
          ? ['guidance', 'partial'].includes(body.status) && body.claims?.length > 0
          : item.exp === 'clarification'
            ? body.status === 'clarification' && typeof body.clarification === 'string'
            : body.status === item.exp;
        if (response.status !== 200 || !matches) failures.push({ type: response.status === 200 ? 'expectation_mismatch' : 'http_error', id: item.id, httpStatus: response.status, expected: item.exp, actual: body.status ?? body.code });
      } catch { failures.push({ type: 'request_error', id: item.id, error: 'Request failed' }); }
    }
    const persisted = store.db.prepare('SELECT count(*) n FROM traces').get().n;
    return { scope: 'Disposable in-memory seeds, AI disabled, loopback HTTP; no browser or live database.', total: questions.length,
      passed: questions.length - failures.length, failed: failures.length, httpFailures: failures.filter(f => f.type !== 'expectation_mismatch').length, expectationMismatches: failures.filter(f => f.type === 'expectation_mismatch').length, persistedTraces: persisted, failures };
  } finally {
    if (app.listening) await new Promise(resolve => app.close(resolve));
    store.db.close();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const report = await runHttpQuestionSuite();
    console.log(JSON.stringify(report, null, 2));
    if (report.failed || report.persistedTraces !== report.total) process.exitCode = 1;
  } catch { console.error('Isolated HTTP benchmark failed'); process.exitCode = 1; }
}
