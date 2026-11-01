import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/server.js';
import { openStore } from '../src/store.js';
import { openAccounts } from '../src/accounts.js';
import { createMailer } from '../src/mailer.js';
import http from 'node:http';

const PASSWORD = 'correct horse battery';

function captureMailer() {
  const sent = [];
  return { sent, provider: 'test', send: async message => { sent.push(message); return true; } };
}

async function withServer({ accounts, mailer, publicOrigin }, fn) {
  const server = createApp(openStore(':memory:'), 'email-reset-test-token-24c', {}, { accounts, mailer, publicOrigin, rateLimits: { v1: { limit: 10000, windowMs: 60000 }, admin: { limit: 100, windowMs: 60000 }, static: { limit: 100, windowMs: 60000 } } });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const post = (path, body, extra = {}) => fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json', ...extra }, body: JSON.stringify(body) });
  // fetch() cannot set Host, so forged-Host requests go through node:http.
  const postWithHost = (path, body, host) => new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({ host: '127.0.0.1', port: server.address().port, path, method: 'POST', headers: { Host: host, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } }, res => { res.resume(); res.on('end', () => resolve(res.statusCode)); });
    req.on('error', reject); req.end(data);
  });
  try { return await fn({ base, post, postWithHost }); } finally { await new Promise(resolve => server.close(resolve)); }
}
const tokenIn = (message, kind) => new URL(message.text.match(/https?:\/\/\S+/)[0]).searchParams.get(kind);

test('sign-up sends a one-time verification link that confirms the email', async () => {
  const accounts = openAccounts(':memory:', { secret: Buffer.alloc(32, 8) });
  const mailer = captureMailer();
  await withServer({ accounts, mailer }, async ({ base, post }) => {
    const signup = await post('/v1/auth/signup', { email: 'verify@example.com', password: PASSWORD });
    const cookie = signup.headers.get('set-cookie').split(';')[0];
    assert.equal((await signup.json()).account.emailVerified, false);
    assert.equal(mailer.sent.length, 1);
    assert.equal(mailer.sent[0].to, 'verify@example.com');
    assert.match(mailer.sent[0].text, new RegExp(`^.*${base.replace(/[.:/]/g, '\\$&')}/\\?verify=`, 'm'));

    const token = tokenIn(mailer.sent[0], 'verify');
    assert.equal((await post('/v1/auth/verify', { token })).status, 200);
    assert.equal((await (await post('/v1/auth/verify', { token })).json()).code, 'invalid_token');
    const me = await (await fetch(`${base}/v1/account`, { headers: { Cookie: cookie } })).json();
    assert.equal(me.account.emailVerified, true);
    assert.equal(me.emailEnabled, true);
    assert.equal((await (await post('/v1/auth/verify/resend', { confirm: true }, { Cookie: cookie })).json()).status, 'already_verified');
  });
  accounts.close();
});

test('password reset: same answer for unknown emails, one-time link, ends sessions, throttled', async () => {
  const accounts = openAccounts(':memory:', { secret: Buffer.alloc(32, 9) });
  const mailer = captureMailer();
  await withServer({ accounts, mailer }, async ({ base, post }) => {
    const cookie = (await post('/v1/auth/signup', { email: 'reset@example.com', password: PASSWORD })).headers.get('set-cookie').split(';')[0];
    mailer.sent.length = 0;

    const known = await post('/v1/auth/reset/request', { email: 'Reset@Example.com' });
    const unknown = await post('/v1/auth/reset/request', { email: 'nobody@example.com' });
    assert.equal(known.status, 202);
    assert.equal(unknown.status, 202);
    assert.deepEqual(await known.json(), await unknown.json());
    assert.equal(mailer.sent.length, 1); // only the real account gets mail

    const token = tokenIn(mailer.sent[0], 'reset');
    assert.equal((await (await post('/v1/auth/reset/confirm', { token, newPassword: 'short' })).json()).code, 'weak_password');
    const confirm = await post('/v1/auth/reset/confirm', { token, newPassword: 'a fresh new password' });
    assert.equal(confirm.status, 200);
    assert.match(confirm.headers.get('set-cookie'), /Max-Age=0/);
    assert.equal((await post('/v1/auth/reset/confirm', { token, newPassword: 'another new password' })).status, 400);
    assert.equal((await (await fetch(`${base}/v1/account`, { headers: { Cookie: cookie } })).json()).account, null);
    assert.equal((await post('/v1/auth/login', { email: 'reset@example.com', password: PASSWORD })).status, 401);
    assert.equal((await post('/v1/auth/login', { email: 'reset@example.com', password: 'a fresh new password' })).status, 200);

    // At most 3 reset emails per hour for one account; the response does not change.
    mailer.sent.length = 0;
    for (let i = 0; i < 4; i++) assert.equal((await post('/v1/auth/reset/request', { email: 'reset@example.com' })).status, 202);
    assert.equal(mailer.sent.length, 2); // one was already used this hour above
  });
  accounts.close();
});

test('reset links expire after an hour', async () => {
  let now = new Date('2026-11-01T10:00:00Z');
  const accounts = openAccounts(':memory:', { clock: () => now, secret: Buffer.alloc(32, 10) });
  accounts.signUp({ email: 'expire@example.com', password: PASSWORD });
  const { token } = accounts.requestPasswordReset('expire@example.com');
  now = new Date('2026-11-01T11:00:01Z');
  assert.throws(() => accounts.resetPasswordWithToken(token, 'a fresh new password'), error => error.code === 'expired_token');
  accounts.close();
});

test('links never use a forged Host header; without a public origin only loopback hosts get links', async () => {
  const accounts = openAccounts(':memory:', { secret: Buffer.alloc(32, 11) });
  const mailer = captureMailer();
  await withServer({ accounts, mailer }, async ({ postWithHost }) => {
    assert.equal(await postWithHost('/v1/auth/signup', { email: 'host@example.com', password: PASSWORD }, 'evil.example.com'), 201);
    assert.equal(mailer.sent.length, 0);
  });
  await withServer({ accounts, mailer, publicOrigin: 'https://app.northstar.example' }, async ({ postWithHost }) => {
    assert.equal(await postWithHost('/v1/auth/reset/request', { email: 'host@example.com' }, 'evil.example.com'), 202);
    assert.equal(mailer.sent.length, 1);
    assert.match(mailer.sent[0].text, /https:\/\/app\.northstar\.example\/\?reset=/);
    assert.equal(mailer.sent[0].text.includes('evil.example.com'), false);
  });
  accounts.close();
});

test('mailer: console output, Resend request shape, configuration checks, failures do not throw', async () => {
  const written = [];
  await createMailer({ provider: 'console', write: text => written.push(text) }).send({ to: 'a@example.com', subject: 'S', text: 'Body' });
  assert.match(written[0], /\[mail:console\] to=a@example\.com/);

  const calls = [];
  const resend = createMailer({ provider: 'resend', apiKey: 're_test_1234567890', from: 'Northstar <no-reply@example.com>', fetchImpl: async (url, init) => { calls.push({ url, init }); return { ok: true, body: null }; } });
  assert.equal(await resend.send({ to: 'b@example.com', subject: 'S', text: 'T' }), true);
  assert.equal(calls[0].url, 'https://api.resend.com/emails');
  assert.equal(calls[0].init.headers.Authorization, 'Bearer re_test_1234567890');
  assert.deepEqual(JSON.parse(calls[0].init.body), { from: 'Northstar <no-reply@example.com>', to: ['b@example.com'], subject: 'S', text: 'T' });

  const errors = [];
  const failing = createMailer({ provider: 'resend', apiKey: 're_test_1234567890', from: 'no-reply@example.com', fetchImpl: async () => ({ ok: false, status: 500 }), onError: e => errors.push(e.message) });
  assert.equal(await failing.send({ to: 'c@example.com', subject: 'S', text: 'T' }), false);
  assert.match(errors[0], /HTTP 500/);
  assert.throws(() => createMailer({ provider: 'resend', from: 'x@example.com' }), /RESEND_API_KEY/);
  assert.throws(() => createMailer({ provider: 'smtp' }), /console or resend/);
});
