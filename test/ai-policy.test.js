import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveAIPolicy } from '../src/ai-policy.js';
import { createAIRouter } from '../src/ai-router.js';
import { anyRouterOptions } from '../src/anyrouter.js';

test('provider policy disables configured keys including legacy adapter', () => {
  const fetchImpl = () => { throw new Error('No network permitted'); };
  assert.deepEqual(createAIRouter({ anyRouterKey: 'fixture', openRouterKey: 'fixture', allowedProviders: [], fetchImpl }), {});
  assert.deepEqual(anyRouterOptions({ apiKey: 'fixture', allowedProviders: '[]', fetchImpl }), {});
  const router = createAIRouter({ anyRouterKey: 'fixture', openRouterKey: 'fixture', allowedProviders: ['openrouter'], fetchImpl });
  assert.deepEqual(router.providers.map(p => p.name), ['openrouter']);
});

test('configured models rotate only within immutable approved list', async () => {
  const models = ['fixture/first:free', 'fixture/second:free'];
  const calls = [];
  const router = createAIRouter({ anyRouterKey: '', openRouterKey: 'fixture', allowedProviders: '["openrouter"]', openRouterModels: models,
    fetchImpl: async (url, init) => {
      assert.equal(url, 'https://openrouter.ai/api/v1/chat/completions');
      assert.equal(init.redirect, 'error');
      calls.push(JSON.parse(init.body).model);
      return Response.json({ choices: [{ finish_reason: 'stop', message: { content: '{}' } }] });
    } });
  models[0] = 'unapproved/model:free';
  for (let i = 0; i < 3; i++) await router.complete({ stage: 'verify', instructions: 'Check', data: {} });
  assert.deepEqual(calls, ['fixture/first:free', 'fixture/second:free', 'fixture/first:free']);
});

test('policy rejects malformed providers and models without exposing configuration values', () => {
  for (const value of ['secret-invalid-json', '{}', ['unknown'], ['anyrouter', 'anyrouter'], [null], '', 'x'.repeat(4097)]) {
    assert.throws(() => resolveAIPolicy({ allowedProviders: value }), { message: 'Invalid AI_ALLOWED_PROVIDERS' });
  }
  for (const value of [[], ['vendor/paid'], ['https://host/model:free'], ['vendor/model:free\n'], ['a/b:free', 'a/b:free'], [42], Array(17).fill('a/b:free'), '{}']) {
    assert.throws(() => resolveAIPolicy({ openRouterModels: value }), { message: 'Invalid OPENROUTER_MODELS' });
  }
  assert.throws(() => createAIRouter({ anyRouterKey: '', openRouterKey: '', openRouterModels: [] }), /Invalid OPENROUTER_MODELS/);
});

test('failure never selects a model outside the configured policy', async () => {
  const calls = [];
  const router = createAIRouter({ anyRouterKey: 'fixture', openRouterKey: 'fixture', allowedProviders: ['openrouter'], openRouterModels: '["fixture/only:free"]',
    fetchImpl: async (url, init) => { calls.push(JSON.parse(init.body).model); return new Response(null, { status: 503 }); } });
  await assert.rejects(router.complete({ stage: 'verify', instructions: 'Check', data: {} }), /All AI providers failed/);
  assert.deepEqual(calls, ['fixture/only:free']);
});
