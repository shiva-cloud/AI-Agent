import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/server.js';
import { openStore } from '../src/store.js';
import { openAccounts } from '../src/accounts.js';

const PASSWORD = 'correct horse battery';

async function withServer({ accounts, mailer }, fn) {
  const server = createApp(openStore(':memory:'), 'self-service-keys-token-24', {}, { accounts, mailer, rateLimits: { v1: { limit: 10000, windowMs: 60000 }, admin: { limit: 100, windowMs: 60000 }, static: { limit: 100, windowMs: 60000 } } });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const post = (path, body, headers = {}) => fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
  try { return await fn({ base, post }); } finally { await new Promise(resolve => server.close(resolve)); }
}

test('signed-in customers create, list and revoke their own keys within the plan limit', async () => {
  const accounts = openAccounts(':memory:', { secret: Buffer.alloc(32, 12) });
  await withServer({ accounts }, async ({ base, post }) => {
    const signup = await post('/v1/auth/signup', { email: 'keys@example.com', password: PASSWORD });
    const cookie = signup.headers.get('set-cookie').split(';')[0];
    const session = { Cookie: cookie };

    const created = await post('/v1/account/keys', { label: 'laptop' }, session);
    assert.equal(created.status, 201);
    const body = await created.json();
    assert.match(body.apiKey, /^nsk_[A-Za-z0-9_-]{43}$/);
    assert.match(body.notice, /will not be shown again/);

    // Free allows one key; the second is refused with a clear code.
    const second = await post('/v1/account/keys', { label: 'server' }, session);
    assert.equal(second.status, 409);
    assert.equal((await second.json()).code, 'key_limit_reached');

    // The key works for API calls and records when it was used.
    assert.equal((await fetch(`${base}/v1/tools/proof-of-funds?familySize=1`, { headers: { Authorization: `Bearer ${body.apiKey}` } })).status, 200);
    const list = await (await fetch(`${base}/v1/account/keys`, { headers: session })).json();
    assert.equal(list.limit, 1);
    assert.equal(list.keys.length, 1);
    assert.equal(list.keys[0].label, 'laptop');
    assert.ok(list.keys[0].lastUsedAt);
    assert.equal(JSON.stringify(list).includes(body.apiKey), false);
    assert.match(list.keys[0].id, /^[0-9a-f]{12}$/);

    assert.equal((await post('/v1/account/keys/revoke', { id: 'ffffffffffff' }, session)).status, 404);
    assert.equal((await post('/v1/account/keys/revoke', { id: list.keys[0].id }, session)).status, 200);
    assert.equal((await fetch(`${base}/v1/tools/proof-of-funds?familySize=1`, { headers: { Authorization: `Bearer ${body.apiKey}` } })).status, 401);
    assert.equal((await post('/v1/account/keys', { label: 'replacement' }, session)).status, 201);
  });
  accounts.close();
});

test('keys cannot be managed with an API key, without a session, or for another account', async () => {
  const accounts = openAccounts(':memory:', { secret: Buffer.alloc(32, 13) });
  const { apiKey } = accounts.createAccount({ name: 'Key only', plan: 'pro' });
  await withServer({ accounts }, async ({ base, post }) => {
    assert.equal((await fetch(`${base}/v1/account/keys`, { headers: { Authorization: `Bearer ${apiKey}` } })).status, 401);
    assert.equal((await post('/v1/account/keys', { label: 'x' }, { Authorization: `Bearer ${apiKey}` })).status, 401);
    assert.equal((await post('/v1/account/keys', { label: 'x' })).status, 401);

    const alice = (await post('/v1/auth/signup', { email: 'alice@example.com', password: PASSWORD })).headers.get('set-cookie').split(';')[0];
    const bob = (await post('/v1/auth/signup', { email: 'bob@example.com', password: PASSWORD })).headers.get('set-cookie').split(';')[0];
    await post('/v1/account/keys', { label: 'alice key' }, { Cookie: alice });
    const aliceKeyId = (await (await fetch(`${base}/v1/account/keys`, { headers: { Cookie: alice } })).json()).keys[0].id;
    assert.equal((await post('/v1/account/keys/revoke', { id: aliceKeyId }, { Cookie: bob })).status, 404);
    assert.equal((await (await fetch(`${base}/v1/account/keys`, { headers: { Cookie: alice } })).json()).keys[0].revokedAt, null);
  });
  accounts.close();
});

test('with email configured, keys need a confirmed email', async () => {
  const accounts = openAccounts(':memory:', { secret: Buffer.alloc(32, 14) });
  const sent = [];
  const mailer = { provider: 'test', send: async m => { sent.push(m); return true; } };
  await withServer({ accounts, mailer }, async ({ post }) => {
    const cookie = (await post('/v1/auth/signup', { email: 'confirm@example.com', password: PASSWORD })).headers.get('set-cookie').split(';')[0];
    const blocked = await post('/v1/account/keys', { label: 'early' }, { Cookie: cookie });
    assert.equal(blocked.status, 403);
    assert.equal((await blocked.json()).code, 'email_not_verified');
    const token = new URL(sent[0].text.match(/https?:\/\/\S+/)[0]).searchParams.get('verify');
    await post('/v1/auth/verify', { token });
    assert.equal((await post('/v1/account/keys', { label: 'after confirm' }, { Cookie: cookie })).status, 201);
  });
  accounts.close();
});
