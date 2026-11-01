import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, realpathSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, basename } from 'node:path';
import { Worker } from 'node:worker_threads';
import { openSharedRateLimits } from '../src/shared-rate-limit.js';
import { createApp } from '../src/server.js';
import { openStore } from '../src/store.js';

function fixture(t) {
  const parent = realpathSync(tmpdir()), root = mkdtempSync(join(parent, 'northstar-quota-'));
  t.after(() => { const actual = realpathSync(root); assert.equal(dirname(actual), parent); assert.ok(basename(actual).startsWith('northstar-quota-')); rmSync(actual, { recursive: true, force: true }); });
  return join(root, 'quota.sqlite');
}
const key = Buffer.alloc(32, 7);

test('shared quota survives reopen, separates families, bounds clients and expires exactly', t => {
  const path = fixture(t); let now = 10000;
  let a = openSharedRateLimits(path, { key, clock: () => now });
  const b = openSharedRateLimits(path, { key, clock: () => now });
  try {
    const rule = { limit: 2, windowMs: 1000, maxClients: 1 };
    const first = a.createLimiter('v1', rule), second = b.createLimiter('v1', rule);
    assert.equal(first('192.0.2.1').allowed, true);
    assert.equal(second('192.0.2.1').allowed, true);
    assert.equal(first('192.0.2.1').allowed, false);
    assert.equal(second('192.0.2.2').allowed, false);
    assert.equal(b.createLimiter('admin', rule)('192.0.2.1').allowed, true);
    a.close(); a = openSharedRateLimits(path, { key, clock: () => now });
    assert.equal(a.createLimiter('v1', rule)('192.0.2.1').allowed, false);
    now = 11000; assert.equal(second('192.0.2.2').allowed, true);
    const inspect = new DatabaseSync(path, { readOnly: true });
    try { for (const row of inspect.prepare('SELECT identity FROM quota_clients').all()) assert.match(row.identity, /^[a-f0-9]{64}$/); }
    finally { inspect.close(); }
  } finally { a.close(); b.close(); }
});

test('independent workers atomically share a single quota', async t => {
  const path = fixture(t), initial = openSharedRateLimits(path, { key });
  initial.createLimiter('v1', { limit: 20, windowMs: 60000 }); initial.close();
  const moduleUrl = new URL('../src/shared-rate-limit.js', import.meta.url).href;
  const run = () => new Promise((resolve, reject) => {
    const worker = new Worker(`const {workerData,parentPort}=require('node:worker_threads');
      (async()=>{const {openSharedRateLimits}=await import(workerData.moduleUrl);
      const store=openSharedRateLimits(workerData.path,{key:Buffer.alloc(32,7)});
      try {const check=store.createLimiter('v1',{limit:20,windowMs:60000});let allowed=0;
      for(let i=0;i<20;i++)if(check('shared-client').allowed)allowed++;
      parentPort.postMessage(allowed);}finally{store.close();}})();`, { eval: true, workerData: { path, moduleUrl } });
    let result; worker.once('message', value => { result = value; }); worker.once('error', reject);
    worker.once('exit', code => code === 0 ? resolve(result) : reject(new Error('Quota worker failed')));
  });
  const results = await Promise.all([run(), run()]);
  assert.equal(results.reduce((a, b) => a + b, 0), 20);
});

test('quota rejects mismatched secrets, conflicting rules and unrelated databases', t => {
  const path = fixture(t), store = openSharedRateLimits(path, { key });
  try {
    store.createLimiter('v1', { limit: 2, windowMs: 1000 });
    assert.throws(() => store.createLimiter('v1', { limit: 3, windowMs: 1000 }), /Conflicting/);
    assert.throws(() => openSharedRateLimits(path, { key: Buffer.alloc(32, 8) }), /Incompatible/);
    assert.throws(() => store.createLimiter('unknown', { limit: 1, windowMs: 1000 }));
  } finally { store.close(); }
  const other = path + '.other', db = new DatabaseSync(other); db.exec('CREATE TABLE evidence(id TEXT)'); db.close();
  assert.throws(() => openSharedRateLimits(other, { key }), /separate/);
});

test('HTTP servers share quotas and fail closed when the quota store is unavailable', async t => {
  const path = fixture(t), evidence = openStore(':memory:');
  const a = openSharedRateLimits(path, { key }), b = openSharedRateLimits(path, { key });
  const servers = [a, b].map(quotaStore => createApp(evidence, undefined, {}, { quotaStore }));
  let closed = false;
  try {
    for (const server of servers) await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const roots = servers.map(server => `http://127.0.0.1:${server.address().port}`);
    for (let i = 0; i < 120; i++) { const response = await fetch(roots[i % 2] + '/health'); assert.equal(response.status, 200); await response.text(); }
    const denied = await fetch(roots[0] + '/health'); assert.equal(denied.status, 429); assert.ok(Number(denied.headers.get('retry-after')) >= 1); await denied.text();
    b.close(); closed = true;
    const response = await fetch(roots[1] + '/health'); assert.equal(response.status, 503); assert.equal((await response.json()).code, 'quota_unavailable');
    const ready = await fetch(roots[1] + '/ready'); assert.equal(ready.status, 503); assert.equal((await ready.json()).reason, 'quota_unavailable');
  } finally {
    for (const server of servers) await new Promise(resolve => server.close(resolve));
    a.close(); if (!closed) b.close(); evidence.db.close();
  }
});

test('database write contention fails without granting extra quota', t => {
  const path = fixture(t), store = openSharedRateLimits(path, { key });
  const check = store.createLimiter('v1', { limit: 1, windowMs: 1000 });
  const lock = new DatabaseSync(path);
  try {
    lock.exec('BEGIN IMMEDIATE'); assert.throws(() => check('a'), /locked/); lock.exec('ROLLBACK');
    assert.equal(check('a').allowed, true); assert.equal(check('a').allowed, false);
  } finally { lock.close(); store.close(); }
});
