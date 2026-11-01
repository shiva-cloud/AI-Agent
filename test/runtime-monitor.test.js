import test from 'node:test';
import assert from 'node:assert/strict';
import { createRuntimeHealthReader, evaluateRuntimeWindow, createRuntimeMetricsFetcher, monitorRuntime } from '../src/runtime-monitor.js';
import { latencyBin } from '../src/runtime-metrics.js';
import { createApp } from '../src/server.js';
import { openStore } from '../src/store.js';

const bins = 14;
function bucket(category, status, latencies) {
  const histogram = Array(bins).fill(0);
  for (const ms of latencies) histogram[latencyBin(ms)]++;
  return { category, status, count: latencies.length, histogram };
}
const snap = (buckets, extra = {}) => ({ loggingDropped: 0, loggingFailures: 0, persistenceFailures: 0, buckets, ...extra });
const many = (n, ms) => Array(n).fill(ms);

test('error rate alerts need enough requests and ignore client disconnects', () => {
  const window = (ok, errors, aborted = 0) => ({ buckets: [bucket('answers', 200, many(ok, 20)), bucket('answers', 500, many(errors, 20)), bucket('answers', 499, many(aborted, 20))].filter(b => b.count), loggingDropped: 0, loggingFailures: 0, persistenceFailures: 0 });
  assert.deepEqual(evaluateRuntimeWindow(window(18, 2)).alerts, [{ code: 'server_error_rate_high', count: 2 }]);
  assert.equal(evaluateRuntimeWindow(window(5, 5)).status, 'ok'); // only 10 requests
  assert.equal(evaluateRuntimeWindow(window(40, 1, 30)).status, 'ok'); // 499s are not server errors
});

test('answer latency alerts track the window p95 upper bound', () => {
  const window = latencies => ({ buckets: [bucket('answers', 200, latencies)], loggingDropped: 0, loggingFailures: 0, persistenceFailures: 0 });
  assert.deepEqual(evaluateRuntimeWindow(window([...many(18, 100), 20000, 20000])).alerts, [{ code: 'answer_latency_high', count: 2 }]);
  assert.equal(evaluateRuntimeWindow(window([...many(19, 100), 20000])).status, 'ok'); // exactly 5% slow keeps p95 within bound
  assert.equal(evaluateRuntimeWindow(window(many(5, 20000))).status, 'ok'); // too few answers
  assert.throws(() => evaluateRuntimeWindow(window([]), { answerP95Ms: 1234 }), /must be one of/);
});

test('reader compares polls, treats counter drops as a restart, and flags logging problems', async () => {
  const snapshots = [
    snap([bucket('answers', 200, many(10, 50))]),
    snap([bucket('answers', 200, many(30, 50)), bucket('answers', 500, many(5, 50))], { loggingDropped: 3 }),
    snap([bucket('answers', 200, many(2, 50))]), // restart: counters went down
    snap([bucket('answers', 200, many(4, 50))], { persistenceFailures: 1 })
  ];
  let i = 0;
  const read = createRuntimeHealthReader({ fetchSnapshot: async () => snapshots[i++] });
  assert.equal(await read(), null); // baseline
  assert.deepEqual((await read()).alerts, [{ code: 'server_error_rate_high', count: 5 }, { code: 'logging_dropped', count: 3 }]);
  assert.equal(await read(), null); // restart resets the baseline
  assert.deepEqual((await read()).alerts, [{ code: 'metrics_persistence_failures', count: 1 }]);
  await assert.rejects(createRuntimeHealthReader({ fetchSnapshot: async () => ({ buckets: 'x' }) })(), /Invalid runtime metrics/);
});

test('monitorRuntime emits runtime transitions and recovery', async () => {
  const snapshots = [
    snap([bucket('answers', 200, many(10, 50))]),
    snap([bucket('answers', 200, many(20, 50)), bucket('public_api', 503, many(10, 5))]),
    snap([bucket('answers', 200, many(60, 50)), bucket('public_api', 503, many(10, 5))])
  ];
  const controller = new AbortController(); const events = []; let i = 0;
  await monitorRuntime({
    signal: controller.signal, intervalMs: 1000, fetchSnapshot: async () => snapshots[i++],
    onEvent: e => events.push(e), wait: async () => { if (i === snapshots.length) controller.abort(); }
  });
  assert.deepEqual(events.map(e => e.event), ['runtime_monitor_attention', 'runtime_monitor_recovered']);
  assert.deepEqual(events[0].alerts, [{ code: 'server_error_rate_high', count: 10 }]);
});

test('fetcher reads a real server with the admin token and rejects unsafe configuration', async () => {
  const token = 'runtime-monitor-token-at-least-24';
  const server = createApp(openStore(':memory:'), token, {});
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    await fetch(`${base}/v1/topics`);
    const read = createRuntimeHealthReader({ fetchSnapshot: createRuntimeMetricsFetcher({ baseUrl: base, token }) });
    assert.equal(await read(), null); // baseline
    await fetch(`${base}/v1/meta`);
    assert.equal((await read()).status, 'ok');
    const snapshot = await createRuntimeMetricsFetcher({ baseUrl: base, token })();
    assert.ok(snapshot.buckets.every(b => Array.isArray(b.histogram) && b.histogram.length === bins));
    await assert.rejects(createRuntimeMetricsFetcher({ baseUrl: base, token: 'wrong-token-but-long-enough-24' })(), error => /HTTP 401|HTTP 403/.test(error.message) && !error.message.includes('wrong-token'));
  } finally { await new Promise(resolve => server.close(resolve)); }
  assert.throws(() => createRuntimeMetricsFetcher({ baseUrl: 'http://monitor.example.com', token: 'x'.repeat(24) }), /HTTPS unless it is a loopback/);
  assert.throws(() => createRuntimeMetricsFetcher({ baseUrl: 'https://monitor.example.com', token: 'short' }), /at least 24/);
});
