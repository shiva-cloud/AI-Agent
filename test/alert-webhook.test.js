import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createWebhookSink, parseWebhookUrl, signWebhookBody, verifyWebhookSignature, MIN_SECRET_LENGTH } from '../src/alert-webhook.js';
import { monitorQueue } from '../src/queue-monitor.js';

const secret = 's'.repeat(MIN_SECRET_LENGTH);
const event = { event: 'queue_monitor_attention', status: 'attention', alerts: [{ code: 'queue_wait_exceeded', count: 2 }], at: '2026-10-31T12:00:00.000Z' };

async function receiver(handler) {
  const requests = [];
  const server = http.createServer((req, res) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => { requests.push({ headers: req.headers, body, url: req.url }); handler(req, res, requests.length); });
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return { url: `http://127.0.0.1:${server.address().port}/hooks/queue`, requests, close: () => new Promise(resolve => server.close(resolve)) };
}

test('URL and secret configuration is validated without echoing values', () => {
  for (const bad of ['not a url', 'ftp://alerts.example.com/x', 'http://alerts.example.com/x', 'https://user:pass@alerts.example.com/x', 'https://alerts.example.com/x#frag', 'https://intranet/x']) {
    assert.throws(() => parseWebhookUrl(bad), error => error.code === 'alert_webhook_config' && !error.message.includes('pass'), bad);
  }
  assert.equal(parseWebhookUrl('https://alerts.example.com/hook').hostname, 'alerts.example.com');
  assert.equal(parseWebhookUrl('http://127.0.0.1:9/hook').hostname, '127.0.0.1');
  assert.throws(() => createWebhookSink({ url: 'https://alerts.example.com/hook', secret: 'short' }), error => error.code === 'alert_webhook_config' && !error.message.includes('short'));
});

test('delivers only documented fields with a verifiable signature', async () => {
  const hook = await receiver((req, res) => res.writeHead(204).end());
  try {
    const deliver = createWebhookSink({ url: hook.url, secret, now: () => 1_793_000_000_000 });
    await deliver({ ...event, path: 'C:/secret/queue.sqlite', token: 'abc' });
    const [request] = hook.requests;
    assert.deepEqual(JSON.parse(request.body), event);
    assert.equal(request.headers['content-type'], 'application/json');
    assert.equal(request.headers['x-northstar-timestamp'], '1793000000');
    assert.equal(request.headers['x-northstar-signature'], signWebhookBody(secret, '1793000000', request.body));
    assert.equal(request.body.includes('secret'), false);
  } finally { await hook.close(); }
});

test('receivers can verify signatures and reject tampering or stale timestamps', () => {
  const body = JSON.stringify(event), timestamp = '1793000000', now = () => 1_793_000_010_000;
  const signature = signWebhookBody(secret, timestamp, body);
  assert.equal(verifyWebhookSignature({ secret, timestamp, body, signature, now }), true);
  assert.equal(verifyWebhookSignature({ secret, timestamp, body: body.replace('2', '3'), signature, now }), false);
  assert.equal(verifyWebhookSignature({ secret: 't'.repeat(MIN_SECRET_LENGTH), timestamp, body, signature, now }), false);
  assert.equal(verifyWebhookSignature({ secret, timestamp, body, signature: signature.slice(0, -1), now }), false);
  assert.equal(verifyWebhookSignature({ secret, timestamp, body, signature, now: () => 1_793_001_000_000 }), false);
  assert.equal(verifyWebhookSignature({ secret, timestamp: '1e9', body, signature, now }), false);
});

test('unsigned delivery omits signature headers', async () => {
  const hook = await receiver((req, res) => res.writeHead(200).end('ok'));
  try {
    await createWebhookSink({ url: hook.url })(event);
    assert.equal(hook.requests[0].headers['x-northstar-signature'], undefined);
  } finally { await hook.close(); }
});

test('non-2xx responses, redirects and unreachable hosts fail without leaking the URL', async () => {
  const hook = await receiver((req, res, n) => n === 1 ? res.writeHead(500).end('boom') : res.writeHead(302, { Location: 'https://elsewhere.example.com/' }).end());
  try {
    const deliver = createWebhookSink({ url: hook.url, secret });
    await assert.rejects(deliver(event), error => error.code === 'alert_webhook_rejected' && error.message.includes('500') && !error.message.includes(hook.url));
    await assert.rejects(deliver(event), error => error.code === 'alert_webhook_unreachable');
  } finally { await hook.close(); }
  await assert.rejects(createWebhookSink({ url: hook.url })(event), error => error.code === 'alert_webhook_unreachable' && !error.message.includes('127.0.0.1'));
  await assert.rejects(createWebhookSink({ url: 'https://alerts.example.com/hook', fetchImpl: async () => ({ ok: true }) })({ event: 'other' }), /Unsupported alert event/);
});

test('a rejected webhook leaves the transition unacknowledged and it is retried on the next poll', async () => {
  const hook = await receiver((req, res, n) => res.writeHead(n === 1 ? 503 : 204).end());
  const controller = new AbortController();
  let polls = 0;
  try {
    const deliver = createWebhookSink({ url: hook.url, secret });
    const result = await monitorQueue({
      signal: controller.signal,
      intervalMs: 1000,
      wait: async () => { if (polls >= 3) controller.abort(); },
      readHealth: () => { polls++; return { status: 'attention', alerts: [{ code: 'queue_wait_exceeded', count: 1 }] }; },
      onEvent: (e, { signal }) => deliver(e, { signal })
    });
    assert.equal(result.deliveryFailures, 1);
    assert.equal(result.events, 1);
    assert.equal(hook.requests.length, 2);
    assert.equal(JSON.parse(hook.requests[1].body).event, 'queue_monitor_attention');
  } finally { await hook.close(); }
});
