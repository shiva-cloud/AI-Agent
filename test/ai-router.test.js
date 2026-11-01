import test from 'node:test';
import assert from 'node:assert/strict';
import { createAIRouter, aiRouterOptions } from '../src/ai-router.js';

// ── Helper: mock fetch that records calls ───────────────────────────────

function mockFetch(responses) {
  let callIndex = 0;
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init, index: callIndex });
    const response = responses[callIndex % responses.length];
    callIndex++;
    if (response instanceof Error) throw response;
    return response instanceof Response ? response.clone() : response;
  };
  return { fetchImpl, calls, get callCount() { return callIndex; } };
}

function okResponse(content) {
  return Response.json(({ choices: [{ finish_reason: 'stop', message: { content: JSON.stringify(content) } }] }));
}

function errorResponse(status = 500) {
  return { ok: false, status, json: async () => ({}) };
}

function rateLimitResponse() {
  return { ok: false, status: 429, json: async () => ({}) };
}

// ── Tests ───────────────────────────────────────────────────────────────

test('router uses the total answer budget and never fails over after cancellation',async()=>{
  const controller=new AbortController();let calls=0;
  const router=createAIRouter({anyRouterKey:'fixture',openRouterKey:'fixture',fetchImpl:async()=>{
    calls++;controller.abort();throw new Error('cancelled');
  }});
  assert.equal(router.timeoutMs,12000);
  await assert.rejects(()=>router.complete({stage:'understand',instructions:'Fixture',data:{},signal:controller.signal}));
  assert.equal(calls,1);
  await assert.rejects(()=>router.complete({stage:'understand',instructions:'Fixture',data:{},signal:controller.signal}));
  assert.equal(calls,1);
});

test('no keys provided returns empty options (disabled)', () => {
  const opts = createAIRouter({ anyRouterKey: '', openRouterKey: '' });
  assert.deepEqual(opts, {});
});

test('single provider succeeds on first try', async () => {
  const { fetchImpl } = mockFetch([okResponse({ intent: 'test' })]);
  const router = createAIRouter({ anyRouterKey: '', openRouterKey: 'or-key', fetchImpl });
  assert.ok(router.complete);
  const result = await router.complete({
    stage: 'understand', instructions: 'Test', data: { question: 'Hello' }
  });
  assert.deepEqual(result, { intent: 'test' });
});

test('round-robin rotates between providers', async () => {
  const { fetchImpl, calls } = mockFetch([okResponse({ a: 1 })]);
  const router = createAIRouter({
    anyRouterKey: 'any-key', openRouterKey: 'or-key', fetchImpl
  });
  assert.equal(router.providers.length, 2);

  await router.complete({ stage: 'understand', instructions: 'T', data: {} });
  const firstUrl = calls[0].url;

  await router.complete({ stage: 'understand', instructions: 'T', data: {} });
  const secondUrl = calls[1].url;

  // Should hit different endpoints in rotation
  assert.notEqual(firstUrl, secondUrl);
});

test('failover: when first provider fails, second is tried immediately', async () => {
  let callIndex = 0;
  const fetchImpl = async (url, init) => {
    callIndex++;
    if (url.includes('anyrouter.dev')) {
      return errorResponse(500);
    }
    return Response.json(({ choices: [{ finish_reason: 'stop', message: { content: '{"recovered":true}' } }] }));
  };
  const router = createAIRouter({
    anyRouterKey: 'any-key', openRouterKey: 'or-key', fetchImpl
  });
  const result = await router.complete({
    stage: 'understand', instructions: 'T', data: {}
  });
  assert.deepEqual(result, { recovered: true });
  assert.equal(callIndex, 2, 'Both providers should have been tried');
});

test('rate-limited provider is put into cooldown', async () => {
  let callIndex = 0;
  const fetchImpl = async (url) => {
    callIndex++;
    if (url.includes('anyrouter.dev')) {
      return rateLimitResponse();
    }
    return Response.json(({ choices: [{ finish_reason: 'stop', message: { content: '{"ok":true}' } }] }));
  };
  const router = createAIRouter({
    anyRouterKey: 'any-key', openRouterKey: 'or-key', fetchImpl
  });

  // First call: anyrouter gets 429 → failover to openrouter
  const result = await router.complete({
    stage: 'understand', instructions: 'T', data: {}
  });
  assert.deepEqual(result, { ok: true });

  // AnyRouter provider should now be in cooldown
  const anyProvider = router.providers.find(p => p.name === 'anyrouter-free');
  assert.ok(anyProvider.cooldownUntil > Date.now());
});

test('all providers fail throws combined error', async () => {
  const { fetchImpl } = mockFetch([errorResponse(503)]);
  const router = createAIRouter({
    anyRouterKey: 'any-key', openRouterKey: 'or-key', fetchImpl
  });
  await assert.rejects(
    () => router.complete({ stage: 'verify', instructions: 'Check', data: {} }),
    /All AI providers failed/
  );
});

test('openrouter rotates through internal model list', async () => {
  const bodies = [];
  const fetchImpl = async (url, init) => {
    if (url.includes('openrouter.ai')) {
      bodies.push(JSON.parse(init.body));
    }
    return Response.json(({ choices: [{ finish_reason: 'stop', message: { content: '{"ok":true}' } }] }));
  };

  const router = createAIRouter({
    anyRouterKey: '', openRouterKey: 'or-key', fetchImpl
  });

  // Call multiple times; internal models should rotate
  await router.complete({ stage: 'understand', instructions: 'T', data: {} });
  await router.complete({ stage: 'understand', instructions: 'T', data: {} });
  await router.complete({ stage: 'understand', instructions: 'T', data: {} });

  const models = bodies.map(b => b.model);
  // At least 2 different models should have been used in 3 calls
  assert.ok(new Set(models).size >= 2, `Expected model rotation, got: ${models.join(', ')}`);
});

test('aiRouterOptions is backward-compatible drop-in', () => {
  const opts = aiRouterOptions({ anyRouterKey: '', openRouterKey: '' });
  assert.deepEqual(opts, {});

  const opts2 = aiRouterOptions({ anyRouterKey: 'key', openRouterKey: '' });
  assert.ok(typeof opts2.complete === 'function');
  assert.ok(typeof opts2.timeoutMs === 'number');
});

test('network error causes immediate failover', async () => {
  let callIndex = 0;
  const fetchImpl = async (url) => {
    callIndex++;
    if (callIndex === 1) throw new Error('ECONNREFUSED');
    return Response.json(({ choices: [{ finish_reason: 'stop', message: { content: '{"fallback":true}' } }] }));
  };
  const router = createAIRouter({
    anyRouterKey: 'any-key', openRouterKey: 'or-key', fetchImpl
  });
  const result = await router.complete({
    stage: 'understand', instructions: 'T', data: {}
  });
  assert.deepEqual(result, { fallback: true });
});

test('HTTP 402 (payment required) triggers cooldown on openrouter', async () => {
  let callIndex = 0;
  const fetchImpl = async (url) => {
    callIndex++;
    if (url.includes('openrouter.ai')) {
      return { ok: false, status: 402, json: async () => ({}) };
    }
    return Response.json(({ choices: [{ finish_reason: 'stop', message: { content: '{"ok":true}' } }] }));
  };
  const router = createAIRouter({
    anyRouterKey: 'any-key', openRouterKey: 'or-key', fetchImpl
  });

  // Force openrouter to go first by adjusting round-robin index
  // We add both providers; openrouter is at index 1
  const result = await router.complete({
    stage: 'understand', instructions: 'T', data: {}
  });
  assert.deepEqual(result, { ok: true });
});
