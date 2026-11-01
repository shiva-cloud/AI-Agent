import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createApp } from '../src/server.js';
import { openStore } from '../src/store.js';
import { openAccounts } from '../src/accounts.js';

const PASSWORD = 'correct horse battery';
const ADMIN_TOKEN = 'admin-panel-test-token-at-least-24';

async function withServer(accounts, fn, extra = {}) {
  const server = createApp(openStore(':memory:'), ADMIN_TOKEN, {}, { accounts, ...extra, rateLimits: { v1: { limit: 10000, windowMs: 60000 }, admin: { limit: 100, windowMs: 60000 }, static: { limit: 1000, windowMs: 60000 } } });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const call = (path, { method = 'GET', body, headers = {} } = {}) => fetch(base + path, { method, headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...headers }, body: body ? JSON.stringify(body) : undefined });
  try { return await fn({ base, call }); } finally { await new Promise(resolve => server.close(resolve)); }
}

function adminSetup() {
  const accounts = openAccounts(':memory:', { secret: Buffer.alloc(32, 21) });
  accounts.ensureAccount({ email: 'boss@example.com', password: PASSWORD, name: 'Boss', plan: 'free', isAdmin: true });
  return accounts;
}
const login = async (call, email = 'boss@example.com', password = PASSWORD) =>
  ({ Cookie: (await call('/v1/auth/login', { method: 'POST', body: { email, password } })).headers.get('set-cookie').split(';')[0] });

test('only administrators reach the admin API: session admin or admin token, never a customer or an API key', async () => {
  const accounts = adminSetup();
  await withServer(accounts, async ({ call }) => {
    assert.equal((await call('/v1/manage/overview')).status, 401);
    const customer = { Cookie: (await call('/v1/auth/signup', { method: 'POST', body: { email: 'c@example.com', password: PASSWORD } })).headers.get('set-cookie').split(';')[0] };
    assert.equal((await call('/v1/manage/overview', { headers: customer })).status, 403);
    const boss = await login(call);
    const { apiKey } = await (await call('/v1/account/keys', { method: 'POST', body: { label: 'k' }, headers: boss })).json();
    // Even an administrator's API key cannot use the admin API.
    assert.equal((await call('/v1/manage/overview', { headers: { Authorization: `Bearer ${apiKey}` } })).status, 403);
    assert.equal((await call('/v1/manage/overview', { headers: boss })).status, 200);
    assert.equal((await call('/v1/manage/overview', { headers: { Authorization: `Bearer ${ADMIN_TOKEN}` } })).status, 200);
    assert.equal((await (await call('/v1/manage/me', { headers: { Authorization: `Bearer ${ADMIN_TOKEN}` } })).json()).actor, 'token:legacy');
    // The page itself is served.
    const page = await call('/manage');
    assert.equal(page.status, 200);
    assert.match(await page.text(), /Admin panel/);
  });
  accounts.close();
});

test('users: create, change plan, suspend, reset password, delete, with the last admin protected', async () => {
  const accounts = adminSetup();
  await withServer(accounts, async ({ call }) => {
    const boss = await login(call);
    const created = await call('/v1/manage/users', { method: 'POST', headers: boss, body: { email: 'new@example.com', password: PASSWORD, name: 'New', plan: 'plus' } });
    assert.equal(created.status, 201);
    const user = await created.json();
    assert.equal(user.plan, 'plus');
    assert.equal((await call('/v1/auth/login', { method: 'POST', body: { email: 'new@example.com', password: PASSWORD } })).status, 200);

    assert.equal((await (await call(`/v1/manage/users/${user.id}`, { method: 'POST', headers: boss, body: { plan: 'pro' } })).json()).plan, 'pro');
    assert.equal((await (await call(`/v1/manage/users/${user.id}`, { method: 'POST', headers: boss, body: { status: 'suspended' } })).json()).status, 'suspended');
    assert.equal((await call('/v1/auth/login', { method: 'POST', body: { email: 'new@example.com', password: PASSWORD } })).status, 403);
    await call(`/v1/manage/users/${user.id}`, { method: 'POST', headers: boss, body: { status: 'active' } });

    const { temporaryPassword } = await (await call(`/v1/manage/users/${user.id}/reset-password`, { method: 'POST', headers: boss, body: {} })).json();
    assert.equal((await call('/v1/auth/login', { method: 'POST', body: { email: 'new@example.com', password: temporaryPassword } })).status, 200);

    const search = await (await call('/v1/manage/users?q=new%40', { headers: boss })).json();
    assert.deepEqual(search.users.map(u => u.email), ['new@example.com']);

    // The only administrator cannot remove their own admin role or suspend themselves.
    const bossId = (await (await call('/v1/account', { headers: boss })).json()).account.id;
    assert.equal((await (await call(`/v1/manage/users/${bossId}`, { method: 'POST', headers: boss, body: { isAdmin: false } })).json()).code, 'last_admin');

    assert.equal((await call(`/v1/manage/users/${user.id}/delete`, { method: 'POST', headers: boss, body: { confirm: 'wrong@example.com' } })).status, 400);
    assert.equal((await call(`/v1/manage/users/${user.id}/delete`, { method: 'POST', headers: boss, body: { confirm: 'new@example.com' } })).status, 200);
    assert.equal((await call(`/v1/manage/users/${user.id}`, { headers: boss })).status, 404);
  });
  accounts.close();
});

test('plans: limits and tiers take effect immediately; plans in use cannot be deleted', async () => {
  const accounts = adminSetup();
  await withServer(accounts, async ({ call }) => {
    const boss = await login(call);
    // Give Free a limit of 1 tool run: the second anonymous run is refused.
    const free = (await (await call('/v1/manage/plans', { headers: boss })).json()).plans.find(p => p.id === 'free');
    assert.equal(free.monthly.tool, null);
    await call('/v1/manage/plans', { method: 'POST', headers: boss, body: { ...free, monthly: { chat: null, tool: 1 } } });
    assert.equal((await call('/v1/tools/proof-of-funds?familySize=1')).status, 200);
    assert.equal((await call('/v1/tools/proof-of-funds?familySize=1')).status, 429);
    await call('/v1/manage/plans', { method: 'POST', headers: boss, body: { ...free, monthly: { chat: null, tool: null } } });
    assert.equal((await call('/v1/tools/proof-of-funds?familySize=1')).status, 200);

    // A new plan appears in the public catalog; turning it off hides it.
    const vip = { id: 'vip', name: 'VIP', priceCadMonthly: 49, tiers: ['core', 'plus', 'pro'], monthly: { chat: 10000, tool: null }, apiKeys: 5, enabled: true };
    assert.equal((await call('/v1/manage/plans', { method: 'POST', headers: boss, body: vip })).status, 200);
    assert.ok((await (await call('/v1/plans')).json()).plans.some(p => p.id === 'vip' && p.tiers.includes('essential')));
    await call('/v1/manage/plans', { method: 'POST', headers: boss, body: { ...vip, enabled: false } });
    assert.equal((await (await call('/v1/plans')).json()).plans.some(p => p.id === 'vip'), false);

    assert.equal((await (await call('/v1/manage/plans', { method: 'POST', headers: boss, body: { ...vip, monthly: { chat: -5 } } })).json()).code, 'invalid_request');
    assert.equal((await (await call('/v1/manage/plans/free/delete', { method: 'POST', headers: boss, body: {} })).json()).code, 'plan_in_use');
    assert.equal((await call('/v1/manage/plans/vip/delete', { method: 'POST', headers: boss, body: {} })).status, 200);
  });
  accounts.close();
});

test('tools: change a tier or turn a tool off for everyone', async () => {
  const accounts = adminSetup();
  await withServer(accounts, async ({ call }) => {
    const boss = await login(call);
    const tools = (await (await call('/v1/manage/tools', { headers: boss })).json()).tools;
    assert.ok(tools.length > 150);
    assert.equal(tools.find(t => t.tool === 'gcms-analyzer').tier, 'pro');

    assert.equal((await call('/v1/tools/gcms-analyzer')).status, 402);
    await call('/v1/manage/tools/gcms-analyzer', { method: 'POST', headers: boss, body: { tier: 'core' } });
    assert.notEqual((await call('/v1/tools/gcms-analyzer')).status, 402);
    await call('/v1/manage/tools/gcms-analyzer', { method: 'POST', headers: boss, body: { tier: '' } });
    assert.equal((await call('/v1/tools/gcms-analyzer')).status, 402);

    await call('/v1/manage/tools/proof-of-funds', { method: 'POST', headers: boss, body: { disabled: true } });
    const off = await call('/v1/tools/proof-of-funds');
    assert.equal(off.status, 503);
    assert.equal((await off.json()).code, 'tool_disabled');
    await call('/v1/manage/tools/proof-of-funds', { method: 'POST', headers: boss, body: { disabled: false } });
    assert.equal((await call('/v1/tools/proof-of-funds')).status, 200);
    assert.equal((await call('/v1/manage/tools/not-a-real-tool', { method: 'POST', headers: boss, body: { disabled: true } })).status, 404);
  });
  accounts.close();
});

test('settings close sign-ups and set the default plan; every change is audited', async () => {
  const accounts = adminSetup();
  await withServer(accounts, async ({ call }) => {
    const boss = await login(call);
    await call('/v1/manage/settings', { method: 'POST', headers: boss, body: { signupsOpen: false } });
    assert.equal((await (await call('/v1/auth/signup', { method: 'POST', body: { email: 'late@example.com', password: PASSWORD } })).json()).code, 'signups_closed');
    await call('/v1/manage/settings', { method: 'POST', headers: boss, body: { signupsOpen: true, defaultPlan: 'plus' } });
    const signup = await (await call('/v1/auth/signup', { method: 'POST', body: { email: 'late@example.com', password: PASSWORD } })).json();
    assert.equal(signup.account.plan, 'plus');
    assert.equal((await (await call('/v1/account')).json()).plan, 'plus'); // anonymous visitors too

    const audit = (await (await call('/v1/manage/audit', { headers: boss })).json()).entries;
    assert.deepEqual(audit.map(e => e.action).slice(0, 2), ['settings.update', 'settings.update']);
    assert.ok(audit.every(e => e.actor === 'boss@example.com'));
  });
  accounts.close();
});

test('testing mode publishes the demo login only when enabled and refuses production', async () => {
  const accounts = adminSetup();
  await withServer(accounts, async ({ call }) => {
    assert.equal((await call('/v1/test-mode')).status, 404);
  });
  await withServer(accounts, async ({ call }) => {
    const info = await (await call('/v1/test-mode')).json();
    assert.deepEqual({ email: info.email, password: info.password }, { email: 'boss@example.com', password: PASSWORD });
    assert.equal((await (await call('/v1/account')).json()).testMode, true);
  }, { testMode: { email: 'boss@example.com', password: PASSWORD } });
  accounts.close();

  const server = fileURLToPath(new URL('../src/server.js', import.meta.url));
  const refused = spawnSync(process.execPath, [server], { env: { ...process.env, TEST_MODE: '1', NODE_ENV: 'production', ACCOUNTS_DB_PATH: ':memory:', DB_PATH: ':memory:', PORT: '0' }, encoding: 'utf8', timeout: 20000 });
  assert.notEqual(refused.status, 0);
  assert.match(refused.stderr, /TEST_MODE=1 cannot be used with NODE_ENV=production/);
});

test('ensureAccount keeps published test credentials working and the account an administrator', () => {
  const accounts = openAccounts(':memory:', { secret: Buffer.alloc(32, 22) });
  accounts.ensureAccount({ email: 'demo@northstar.test', password: 'Northstar-Test-2026', name: 'Demo', plan: 'free', isAdmin: true });
  accounts.resetPassword('demo@northstar.test', 'someone changed it');
  const again = accounts.ensureAccount({ email: 'demo@northstar.test', password: 'Northstar-Test-2026', name: 'Demo', plan: 'free', isAdmin: true });
  assert.equal(again.isAdmin, true);
  assert.ok(accounts.logIn({ email: 'demo@northstar.test', password: 'Northstar-Test-2026' }).sessionToken);
  accounts.close();
});
