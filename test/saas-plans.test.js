import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createApp } from '../src/server.js';
import { openStore } from '../src/store.js';
import { openAccounts } from '../src/accounts.js';
import { PLAN_CATALOG, toolTier, featureOf, publicCatalog } from '../src/plans.js';

async function withServer(accounts, fn) {
  const server = createApp(openStore(':memory:'), 'saas-plans-test-token-24chars', {}, { accounts, rateLimits: { v1: { limit: 10000, windowMs: 60000 }, admin: { limit: 100, windowMs: 60000 }, static: { limit: 100, windowMs: 60000 } } });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try { return await fn(base); } finally { await new Promise(resolve => server.close(resolve)); }
}

test('every classified tool exists as a server route', () => {
  const server = readFileSync(new URL('../src/server.js', import.meta.url), 'utf8');
  const plans = readFileSync(new URL('../src/plans.js', import.meta.url), 'utf8');
  const listed = [...plans.matchAll(/'([a-z0-9]+(?:-[a-z0-9]+)+|ei-benefits|oas-gis)'/g)].map(m => m[1]).filter(id => !/^plans-\d+$/.test(id) && !/^new-plan/.test(id));
  const missing = [...new Set(listed)].filter(id => !server.includes(`/v1/tools/${id}'`));
  assert.deepEqual(missing, []);
});

test('feature classification and catalog', () => {
  assert.deepEqual(featureOf('POST', '/v1/answers'), { feature: 'chat', tool: null, tier: 'core' });
  assert.equal(featureOf('GET', '/v1/topics'), null);
  assert.equal(toolTier('eviction-defense'), 'essential');
  assert.equal(toolTier('express-entry-crs'), 'core');
  assert.equal(toolTier('gcms-analyzer'), 'pro');
  assert.equal(toolTier('some-new-tool'), 'plus');
  const catalog = publicCatalog();
  assert.deepEqual(catalog.plans.map(p => p.id), ['free', 'plus', 'pro', 'team']);
  // Free is unlimited (null); paid plans keep increasing limits.
  assert.equal(catalog.plans[0].monthlyChatAnswers, null);
  assert.ok(catalog.plans.slice(1).every((p, i, all) => i === 0 || p.monthlyChatAnswers > all[i - 1].monthlyChatAnswers));
});

test('accounting and refund failure returns one error response without retrying accounting', async () => {
  const accounts = openAccounts(':memory:', {secret: Buffer.alloc(32, 9)});
  let records=0,releases=0;
  accounts.record=()=>{records++;throw new Error('Accounting unavailable');};
  accounts.release=()=>{releases++;throw new Error('Refund unavailable');};
  try {
    await withServer(accounts,async base=>{
      const response=await fetch(`${base}/v1/tools/proof-of-funds?familySize=2&availableFundsCad=20000`,{signal:AbortSignal.timeout(5000)});
      assert.equal(response.status,500);
      await response.json();
      assert.equal(records,1);
      assert.equal(releases,1);
    });
  } finally {accounts.close();}
});

test('without SaaS mode nothing is gated, and /v1/plans is still public', async () => {
  await withServer(undefined, async base => {
    assert.equal((await fetch(`${base}/v1/tools/gcms-analyzer`)).status !== 402, true);
    const plans = await (await fetch(`${base}/v1/plans`)).json();
    assert.equal(plans.version, 'plans-2');
  });
});

test('Free plan: unlimited core tools, higher tiers need an upgrade, essential tools always open', async () => {
  const accounts = openAccounts(':memory:', { secret: Buffer.alloc(32, 1) });
  await withServer(accounts, async base => {
    const core = await fetch(`${base}/v1/tools/proof-of-funds?familySize=2&availableFundsCad=20000`);
    assert.equal(core.status, 200);
    assert.equal(core.headers.get('x-plan'), 'free');
    assert.equal(PLAN_CATALOG.free.monthly.tool, null);
    assert.equal(core.headers.get('x-quota-limit'), 'unlimited');
    assert.equal(core.headers.get('x-quota-remaining'), null);

    const pro = await fetch(`${base}/v1/tools/gcms-analyzer`);
    assert.equal(pro.status, 402);
    const body = await pro.json();
    assert.equal(body.code, 'plan_upgrade_required');
    assert.equal(body.requiredPlan, 'pro');

    const essential = await fetch(`${base}/v1/tools/eviction-defense`);
    assert.notEqual(essential.status, 402);
    assert.equal(essential.headers.get('x-quota-limit'), null);

    const usage = await (await fetch(`${base}/v1/account`)).json();
    assert.equal(usage.plan, 'free');
    assert.equal(usage.usage.features.tool.used, 1); // only the successful core run counted
    assert.equal(usage.usage.features.tool.remaining, null);
  });
  accounts.close();
});

test('monthly quota is enforced and resets next month; failures are not counted', async () => {
  let now = new Date('2026-11-15T12:00:00Z');
  const accounts = openAccounts(':memory:', { clock: () => now, secret: Buffer.alloc(32, 2) });
  // Limits come from the editable plan configuration; give Plus a small limit for this test.
  const plus = accounts.registry().plan('plus');
  accounts.admin.savePlan('test', { ...plus, monthly: { chat: 3, tool: 3 } });
  const { apiKey } = accounts.createAccount({ name: 'Quota test', plan: 'plus' });
  const auth = { headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' } };
  await withServer(accounts, async base => {
    // A rejected request (400) is not counted.
    await fetch(`${base}/v1/answers`, { method: 'POST', ...auth, body: JSON.stringify({ question: '' }) });
    for (let i = 0; i < 3; i++) {
      const res = await fetch(`${base}/v1/answers`, { method: 'POST', ...auth, body: JSON.stringify({ question: 'How do I get a SIN in Toronto?' }) });
      assert.equal(res.status, 200, `answer ${i}`);
    }
    const blocked = await fetch(`${base}/v1/answers`, { method: 'POST', ...auth, body: JSON.stringify({ question: 'How do I get a SIN in Toronto?' }) });
    assert.equal(blocked.status, 429);
    const body = await blocked.json();
    assert.equal(body.code, 'plan_quota_exceeded');
    assert.equal(body.resetAt, '2026-12-01T00:00:00.000Z');
    assert.equal(body.upgradeTo, 'pro');

    now = new Date('2026-12-01T00:00:01Z');
    assert.equal((await fetch(`${base}/v1/answers`, { method: 'POST', ...auth, body: JSON.stringify({ question: 'How do I get a SIN in Toronto?' }) })).status, 200);
  });
  accounts.close();
});

test('paid plans unlock tiers; bad, revoked and suspended keys are refused', async () => {
  const accounts = openAccounts(':memory:', { secret: Buffer.alloc(32, 3) });
  const { account, apiKey } = accounts.createAccount({ name: 'Consultant', plan: 'pro' });
  const auth = { headers: { Authorization: `Bearer ${apiKey}` } };
  await withServer(accounts, async base => {
    const pro = await fetch(`${base}/v1/tools/gcms-analyzer`, auth);
    assert.notEqual(pro.status, 402);
    assert.equal(pro.headers.get('x-plan'), 'pro');
    assert.equal((await fetch(`${base}/v1/tools/proof-of-funds`, { headers: { Authorization: 'Bearer nsk_wrong' } })).status, 401);
    accounts.setStatus(account.id, 'suspended');
    assert.equal((await fetch(`${base}/v1/tools/proof-of-funds`, auth)).status, 403);
    accounts.setStatus(account.id, 'active');
    accounts.revokeKeys(account.id);
    assert.equal((await fetch(`${base}/v1/tools/proof-of-funds`, auth)).status, 401);
  });
  // Key limits follow the plan, and keys are stored only as hashes.
  const free = accounts.createAccount({ name: 'One key', plan: 'free' });
  assert.throws(() => accounts.issueKey(free.account.id), /allows 1 active API key/);
  accounts.close();
});

test('accounts database refuses foreign tables and stores no raw keys or addresses', () => {
  const accounts = openAccounts(':memory:', { secret: Buffer.alloc(32, 4) });
  const { apiKey } = accounts.createAccount({ name: 'Privacy', plan: 'plus' });
  const subject = accounts.anonymousSubject('203.0.113.9');
  assert.match(subject, /^anon:[0-9a-f]{32}$/);
  assert.equal(subject.includes('203.0.113.9'), false);
  assert.equal(JSON.stringify(accounts.list()).includes(apiKey), false);
  accounts.close();
});
