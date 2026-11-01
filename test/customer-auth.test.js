import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApp } from '../src/server.js';
import { openStore } from '../src/store.js';
import { openAccounts } from '../src/accounts.js';

const PASSWORD = 'correct horse battery';

async function withServer(accounts, fn) {
  const server = createApp(openStore(':memory:'), 'customer-auth-test-token-24', {}, { accounts, rateLimits: { v1: { limit: 10000, windowMs: 60000 }, admin: { limit: 100, windowMs: 60000 }, static: { limit: 100, windowMs: 60000 } } });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const post = (path, body, cookie) => fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) }, body: JSON.stringify(body) });
  try { return await fn({ base, post }); } finally { await new Promise(resolve => server.close(resolve)); }
}
const cookieOf = res => res.headers.get('set-cookie')?.split(';')[0];

test('sign up, use the session for plan metering, log out', async () => {
  const accounts = openAccounts(':memory:', { secret: Buffer.alloc(32, 5) });
  await withServer(accounts, async ({ base, post }) => {
    const signup = await post('/v1/auth/signup', { email: 'New.User@Example.com', password: PASSWORD, name: 'New User' });
    assert.equal(signup.status, 201);
    const setCookie = signup.headers.get('set-cookie');
    assert.match(setCookie, /^ns_session=[A-Za-z0-9_-]{40,}; Path=\/; HttpOnly; SameSite=Strict; Max-Age=2592000$/);
    const body = await signup.json();
    assert.deepEqual({ email: body.account.email, plan: body.account.plan }, { email: 'new.user@example.com', plan: 'free' });
    assert.equal(JSON.stringify(body).includes(PASSWORD), false);

    const cookie = cookieOf(signup);
    const me = await (await fetch(`${base}/v1/account`, { headers: { Cookie: cookie } })).json();
    assert.equal(me.account.email, 'new.user@example.com');

    // Tool runs made with the session count against the account, not the anonymous visitor.
    await fetch(`${base}/v1/tools/proof-of-funds?familySize=1`, { headers: { Cookie: cookie } });
    assert.equal((await (await fetch(`${base}/v1/account`, { headers: { Cookie: cookie } })).json()).usage.features.tool.used, 1);
    assert.equal((await (await fetch(`${base}/v1/account`)).json()).usage.features.tool.used, 0);

    // A plan change made by an administrator applies to the session immediately.
    accounts.setPlan(body.account.id, 'pro');
    assert.notEqual((await fetch(`${base}/v1/tools/gcms-analyzer`, { headers: { Cookie: cookie } })).status, 402);

    const logout = await post('/v1/auth/logout', { confirm: true }, cookie);
    assert.match(logout.headers.get('set-cookie'), /^ns_session=; .*Max-Age=0/);
    assert.equal((await (await fetch(`${base}/v1/account`, { headers: { Cookie: cookie } })).json()).account, null);
  });
  accounts.close();
});

test('login errors are generic, duplicate and weak sign-ups are refused, failures are throttled', async () => {
  const accounts = openAccounts(':memory:', { secret: Buffer.alloc(32, 6) });
  await withServer(accounts, async ({ post }) => {
    await post('/v1/auth/signup', { email: 'person@example.com', password: PASSWORD });
    assert.equal((await post('/v1/auth/signup', { email: 'PERSON@example.com', password: PASSWORD })).status, 409);
    assert.equal((await (await post('/v1/auth/signup', { email: 'x@example.com', password: 'short' })).json()).code, 'weak_password');
    assert.equal((await (await post('/v1/auth/signup', { email: 'not-an-email', password: PASSWORD })).json()).code, 'invalid_email');

    const unknown = await (await post('/v1/auth/login', { email: 'nobody@example.com', password: PASSWORD })).json();
    const wrong = await (await post('/v1/auth/login', { email: 'person@example.com', password: 'wrong password!' })).json();
    assert.equal(unknown.error, wrong.error); // no hint about which emails exist

    for (let i = 0; i < 9; i++) await post('/v1/auth/login', { email: 'person@example.com', password: 'wrong password!' });
    const locked = await post('/v1/auth/login', { email: 'person@example.com', password: PASSWORD });
    assert.equal(locked.status, 429);
    assert.equal((await locked.json()).code, 'too_many_attempts');
  });
  accounts.close();
});

test('password change ends other sessions; administrator reset ends all sessions', async () => {
  const accounts = openAccounts(':memory:', { secret: Buffer.alloc(32, 7) });
  await withServer(accounts, async ({ base, post }) => {
    const first = cookieOf(await post('/v1/auth/signup', { email: 'change@example.com', password: PASSWORD }));
    const second = cookieOf(await post('/v1/auth/login', { email: 'change@example.com', password: PASSWORD }));
    assert.equal((await post('/v1/auth/password', { currentPassword: 'nope nope nope', newPassword: 'a brand new password' }, first)).status, 401);
    assert.equal((await post('/v1/auth/password', { currentPassword: PASSWORD, newPassword: 'a brand new password' }, first)).status, 200);
    const accountFor = async cookie => (await (await fetch(`${base}/v1/account`, { headers: { Cookie: cookie } })).json()).account;
    assert.ok(await accountFor(first));
    assert.equal(await accountFor(second), null);
    assert.equal((await post('/v1/auth/login', { email: 'change@example.com', password: 'a brand new password' })).status, 200);

    accounts.resetPassword('change@example.com', 'temporary password 1');
    assert.equal(await accountFor(first), null);
    assert.equal((await post('/v1/auth/password', { currentPassword: 'x', newPassword: 'y' })).status, 401);
  });
  accounts.close();
});

test('auth routes are absent without SaaS mode, and an existing accounts database upgrades in place', async () => {
  await withServer(undefined, async ({ post }) => {
    assert.equal((await post('/v1/auth/login', { email: 'a@b.co', password: PASSWORD })).status, 404);
  });
  const dir = mkdtempSync(join(tmpdir(), 'accounts-upgrade-'));
  try {
    const path = join(dir, 'accounts.sqlite');
    const legacy = new DatabaseSync(path);
    legacy.exec("CREATE TABLE accounts(id TEXT PRIMARY KEY, name TEXT NOT NULL, plan TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', created_at TEXT NOT NULL); CREATE TABLE api_keys(hash TEXT PRIMARY KEY, account_id TEXT NOT NULL, label TEXT, created_at TEXT NOT NULL, revoked_at TEXT); CREATE TABLE usage(subject TEXT NOT NULL, period TEXT NOT NULL, feature TEXT NOT NULL, count INTEGER NOT NULL, PRIMARY KEY(subject, period, feature));");
    legacy.close();
    const accounts = openAccounts(path);
    assert.equal(accounts.signUp({ email: 'upgrade@example.com', password: PASSWORD }).account.plan, 'free');
    accounts.close();
    const raw = new DatabaseSync(path);
    const stored = raw.prepare('SELECT password_hash FROM credentials').get().password_hash;
    raw.close();
    assert.match(stored, /^scrypt\$16384\$8\$1\$/);
    assert.equal(stored.includes(PASSWORD), false);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
