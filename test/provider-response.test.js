import test from 'node:test';
import assert from 'node:assert/strict';
import { readProviderResponse, MAX_PROVIDER_RESPONSE_BYTES as limit } from '../src/provider-response.js';
import { createAIRouter } from '../src/ai-router.js';
import { anyRouterOptions } from '../src/anyrouter.js';

test('provider reader accepts the exact byte limit and split UTF-8 characters', async () => {
  assert.equal((await readProviderResponse(new Response(JSON.stringify('a'.repeat(limit - 2))))).length, limit - 2);
  const bytes = new TextEncoder().encode('"£"');
  const body = new ReadableStream({ start(c) { for (const byte of bytes) c.enqueue(Uint8Array.of(byte)); c.close(); } });
  assert.equal(await readProviderResponse(new Response(body)), '£');
});

test('provider reader rejects declared and streamed oversized bodies and cancels streams', async () => {
  for (const headers of [{ 'content-length': String(limit + 1) }, {}, { 'content-length': '1' }]) {
    let cancelled = false;
    const body = new ReadableStream({ pull(c) { c.enqueue(new Uint8Array(8192)); }, cancel() { cancelled = true; } });
    await assert.rejects(readProviderResponse(new Response(body, { headers })), /size limit/);
    assert.equal(cancelled, true);
    assert.equal(body.locked, false);
  }
});

test('provider reader rejects invalid encoding and JSON without echoing body text', async () => {
  await assert.rejects(readProviderResponse(new Response(Uint8Array.of(0xff))), /encoded data/);
  await assert.rejects(readProviderResponse(new Response('private-provider-text')), { message: 'Invalid AI response JSON' });
});

test('provider reader cancels stalled bodies on abort and releases locks', async () => {
  for (const preaborted of [false, true]) {
    const controller = new AbortController();
    let cancelled = false;
    const body = new ReadableStream({ cancel() { cancelled = true; } });
    if (preaborted) controller.abort();
    const pending = readProviderResponse(new Response(body), controller.signal);
    if (!preaborted) controller.abort();
    await assert.rejects(pending, { name: 'AbortError' });
    assert.equal(cancelled, true);
    assert.equal(body.locked, false);
  }
});

test('both router providers and legacy adapter reject oversized responses; router fails over', async () => {
  const args = { stage: 'verify', instructions: 'Check', data: {} };
  const oversized = () => new Response('x'.repeat(limit + 1));
  for (const keys of [{ anyRouterKey: 'fixture', openRouterKey: '' }, { anyRouterKey: '', openRouterKey: 'fixture' }]) {
    const router = createAIRouter({ ...keys, fetchImpl: async () => oversized() });
    await assert.rejects(router.complete(args), /size limit/);
  }
  await assert.rejects(anyRouterOptions({ apiKey: 'fixture', fetchImpl: async () => oversized() }).complete(args), /size limit/);
  let calls = 0;
  const router = createAIRouter({ anyRouterKey: 'fixture', openRouterKey: 'fixture', fetchImpl: async () => {
    if (++calls === 1) return oversized();
    return Response.json({ choices: [{ finish_reason: 'stop', message: { content: '{"accepted":true}' } }] });
  } });
  assert.deepEqual(await router.complete(args), { accepted: true });
  assert.equal(calls, 2);
});

test('HTTP failures discard unread provider bodies before failover', async () => {
  let cancelled = 0;
  const router = createAIRouter({ anyRouterKey: 'fixture', openRouterKey: 'fixture', fetchImpl: async () =>
    new Response(new ReadableStream({ cancel() { cancelled++; } }), { status: 429 }) });
  await assert.rejects(router.complete({ stage: 'verify', instructions: 'Check', data: {} }), /All AI providers failed/);
  assert.equal(cancelled, 2);
});
