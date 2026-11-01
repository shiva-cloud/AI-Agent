import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/server.js';
import { openStore } from '../src/store.js';
import { openAccounts } from '../src/accounts.js';

const PASSWORD = 'correct horse battery';

test('usage report: daily rows, per-key split, projection, and who may read it', async () => {
  let now = new Date('2026-11-01T09:00:00Z');
  const accounts = openAccounts(':memory:', { clock: () => now, secret: Buffer.alloc(32, 15) });
  const server = createApp(openStore(':memory:'), 'usage-dashboard-token-24ch', {}, { accounts, rateLimits: { v1: { limit: 10000, windowMs: 60000 }, admin: { limit: 100, windowMs: 60000 }, static: { limit: 100, windowMs: 60000 } } });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const post = (path, body, headers = {}) => fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
  try {
    const cookie = (await post('/v1/auth/signup', { email: 'usage@example.com', password: PASSWORD })).headers.get('set-cookie').split(';')[0];
    const { apiKey } = await (await post('/v1/account/keys', { label: 'script' }, { Cookie: cookie })).json();

    // Day 1: two tool runs with the key, one chat answer from the browser session.
    await fetch(`${base}/v1/tools/proof-of-funds?familySize=1`, { headers: { Authorization: `Bearer ${apiKey}` } });
    await fetch(`${base}/v1/tools/proof-of-funds?familySize=2`, { headers: { Authorization: `Bearer ${apiKey}` } });
    await post('/v1/answers', { question: 'How do I get a SIN in Toronto?' }, { Cookie: cookie });
    // A failed request and an essential tool are not counted.
    await fetch(`${base}/v1/tools/gcms-analyzer`, { headers: { Cookie: cookie } });
    await fetch(`${base}/v1/tools/eviction-defense`, { headers: { Cookie: cookie } });

    now = new Date('2026-11-03T15:00:00Z');
    await fetch(`${base}/v1/tools/proof-of-funds?familySize=3`, { headers: { Cookie: cookie } });

    const report = await (await fetch(`${base}/v1/account/usage`, { headers: { Cookie: cookie } })).json();
    assert.equal(report.period, '2026-11');
    assert.deepEqual(report.totals, { chat: 1, tool: 3 });
    assert.deepEqual(report.daily, [
      { day: '2026-11-01', chat: 1, tool: 2 },
      { day: '2026-11-02', chat: 0, tool: 0 },
      { day: '2026-11-03', chat: 0, tool: 1 }
    ]);
    assert.deepEqual(report.byKey.map(k => [k.label, k.chat, k.tool]).sort(), [['Browser (signed in)', 1, 1], ['script', 0, 2]]);
    assert.deepEqual(report.limits, { chat: null, tool: null }); // Free is unlimited
    assert.deepEqual(report.projected, { chat: 10, tool: 30 }); // 30 days in November
    assert.equal(report.resetAt, '2026-12-01T00:00:00.000Z');

    // An API key may read its account's usage; anonymous visitors may not.
    assert.equal((await fetch(`${base}/v1/account/usage`, { headers: { Authorization: `Bearer ${apiKey}` } })).status, 200);
    assert.equal((await fetch(`${base}/v1/account/usage`)).status, 401);
    // The report never contains the key itself.
    assert.equal(JSON.stringify(report).includes(apiKey), false);
  } finally {
    await new Promise(resolve => server.close(resolve));
    accounts.close();
  }
});
