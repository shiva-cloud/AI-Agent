import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { execFileSync } from 'node:child_process';
import { createApp } from '../src/server.js';
import { openStore } from '../src/store.js';
import { generateSettlementJourney } from '../src/settlement-journey.js';
import { validateDocument, validateNewcomerDocuments } from '../src/document-validator.js';
import { ValidationError } from '../src/api-errors.js';

test('tool routes reject suffixes for GET and POST and invalid dates return 400', async () => {
  const store = openStore(':memory:');
  const server = createApp(store, undefined, {}, {
    rateLimits: { v1: { limit: 1000, windowMs: 60000 }, admin: { limit: 60, windowMs: 60000 }, static: { limit: 240, windowMs: 60000 } }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const source = readFileSync(new URL('../src/server.js', import.meta.url), 'utf8');
    const routes = [...new Set([...source.matchAll(/path==='(\/v1\/tools\/[^']+)'/g)].map(m => m[1]))];
    assert.ok(routes.length >= 30);
    for (const route of routes) {
      for (const method of ['GET', 'POST']) {
        const options = method === 'POST' ? { method, headers: { 'Content-Type': 'application/json' }, body: '{}' } : {};
        const response = await fetch(base + route + '-invalid', options);
        assert.equal(response.status, 404, `${method} ${route}-invalid`);
        await response.text();
      }
    }
    for (const path of ['/v1/tools/settlement-journey?date=2026-02-30', '/v1/tools/settlement-journey?category=constructor', '/v1/tools/validate-documents?passportExpiry=invalid']) {
      const response = await fetch(base + path);
      assert.equal(response.status, 400, path);
      assert.equal((await response.json()).code, 'invalid_request');
    }
  } finally {
    await new Promise(resolve => server.close(resolve));
    store.db.close();
  }
});

test('journey rejects unknown categories and invalid calendar dates', () => {
  for (const category of ['unknown', 'constructor', '__proto__', null, {}]) {
    assert.throws(() => generateSettlementJourney(category), ValidationError);
  }
  for (const date of ['invalid', '2026-02-30', '2026-11-01T00:00:00Z', null, 123]) {
    assert.throws(() => generateSettlementJourney('work_permit', 'Toronto', date), ValidationError);
  }
});

test('journey calendar offsets stay stable across daylight-saving transitions', () => {
  const moduleUrl = new URL('../src/settlement-journey.js', import.meta.url).href;
  const script = `import { generateSettlementJourney } from ${JSON.stringify(moduleUrl)};
    console.log(JSON.stringify(generateSettlementJourney('work_permit','Toronto','2026-03-07').phases.map(p=>p.targetDate)));`;
  const dates = tz => JSON.parse(execFileSync(process.execPath, ['--input-type=module', '-e', script], {
    env: { ...process.env, TZ: tz }, windowsHide: true, encoding: 'utf8'
  }));
  assert.deepEqual(dates('America/Toronto'), dates('UTC'));
  assert.equal(dates('UTC')[1], '2026-03-09');
});

test('document validation rejects malformed dates and records instead of marking them valid', () => {
  for (const date of ['invalid', '2026-02-30', '', 123]) {
    for (const field of ['issueDate', 'expiryDate']) {
      assert.throws(() => validateDocument({ docType: 'passport', [field]: date }, '2026-11-01'), ValidationError);
    }
  }
  for (const doc of [null, [], 'passport', {}]) assert.throws(() => validateDocument(doc), ValidationError);
  assert.throws(() => validateNewcomerDocuments({ documents: 'passport' }), ValidationError);
  assert.equal(validateNewcomerDocuments({ documents: [] }).overallReadiness, 'action_required');
  assert.throws(() => validateNewcomerDocuments({ landingDateStr: '2026-02-30' }), ValidationError);
  const custom = validateDocument({ docType: 'constructor' }, '2026-11-01');
  assert.equal(custom.docLabel, 'constructor');
  assert.ok(custom.statute);
});

function workerFixture() {
  const handlers = {}, contents = new Map(), removed = [];
  let currentCache;
  const cache = {
    addAll: async paths => { for (const path of paths) contents.set(path, { path }); },
    match: async path => contents.get(path)
  };
  const context = {
    URL,
    self: { location: { origin: 'https://northstar.test' }, addEventListener: (type, handler) => { handlers[type] = handler; }, skipWaiting: async () => {}, clients: { claim: async () => {} } },
    caches: { open: async name => { currentCache = name; return cache; }, keys: async () => [currentCache, 'northstar-v1-offline-poe', 'another-app'], delete: async name => { removed.push(name); } },
    fetch: async () => { throw new Error('Offline'); }
  };
  runInNewContext(readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8'), context);
  return { handlers, contents, removed };
}

test('offline installation includes every transitive app module and preserves unrelated caches', async () => {
  const { handlers, contents, removed } = workerFixture();
  let pending;
  const lifecycleEvent = { waitUntil: promise => { pending = promise; } };
  handlers.install(lifecycleEvent); await pending;
  const visited = new Set();
  function inspect(path) {
    if (visited.has(path)) return;
    visited.add(path);
    assert.ok(contents.has(path), `${path} missing from offline cache`);
    const source = readFileSync(new URL('../public' + path, import.meta.url), 'utf8');
    for (const match of source.matchAll(/import\s+(?:[^;'"\n]*?from\s*)?['"]\.\/([^'"]+)['"]/g)) inspect('/' + match[1]);
  }
  inspect('/app.js');
  handlers.activate(lifecycleEvent); await pending;
  assert.deepEqual(removed, ['northstar-v1-offline-poe']);
  let response;
  handlers.fetch({ request: { url: 'https://northstar.test/app.js?v=1', method: 'GET' }, respondWith: promise => { response = promise; } });
  assert.equal((await response).path, '/app.js');
});

test('offline worker does not intercept APIs, authenticated navigation, POST or foreign assets', () => {
  const { handlers } = workerFixture();
  for (const [url, method] of [
    ['https://northstar.test/admin/overview', 'GET'],
    ['https://northstar.test/v1/answers', 'POST'],
    ['https://foreign.test/app.js', 'GET'],
    ['https://northstar.test/', 'POST']
  ]) {
    handlers.fetch({ request: { url, method, mode: 'navigate' }, respondWith: () => assert.fail(`Intercepted ${method} ${url}`) });
  }
});
