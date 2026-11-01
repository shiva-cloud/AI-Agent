import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { openMonitorState, monitorStateKey } from '../src/monitor-state.js';
import { monitorQueue } from '../src/queue-monitor.js';
import { monitorRuntime } from '../src/runtime-monitor.js';

const ok = { status: 'ok', alerts: [] };
const attention = { status: 'attention', alerts: [{ code: 'queue_wait_exceeded', count: 1 }] };

async function run(reports, { state, onEvent } = {}) {
  const controller = new AbortController(); let i = 0; const events = [];
  const result = await monitorQueue({
    signal: controller.signal, state,
    readHealth: () => reports[i++],
    onEvent: onEvent ?? (e => events.push(e.event)),
    wait: async () => { if (i === reports.length) controller.abort(); }
  });
  return { events, result };
}

function tempDb() {
  const dir = mkdtempSync(join(tmpdir(), 'monitor-state-'));
  return { path: join(dir, 'alerts.sqlite'), cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}

test('a restart does not repeat an alert that was already delivered', async () => {
  const { path, cleanup } = tempDb();
  try {
    const key = monitorStateKey('queue', 'C:/data/jobs.sqlite');
    let db = openMonitorState(path);
    assert.deepEqual((await run([attention], { state: db.forMonitor(key) })).events, ['queue_monitor_attention']);
    db.close();

    db = openMonitorState(path); // process restart
    assert.deepEqual((await run([attention, attention], { state: db.forMonitor(key) })).events, []);
    assert.deepEqual((await run([ok], { state: db.forMonitor(key) })).events, ['queue_monitor_recovered']);
    db.close();
  } finally { cleanup(); }
});

test('an undelivered transition survives a restart and is delivered afterwards', async () => {
  const { path, cleanup } = tempDb();
  try {
    const key = monitorStateKey('queue', 'jobs');
    let db = openMonitorState(path);
    const failed = await run([ok, attention], { state: db.forMonitor(key), onEvent: () => { throw new Error('sink down'); } });
    assert.equal(failed.result.deliveryFailures, 1);
    db.close();

    db = openMonitorState(path);
    assert.deepEqual((await run([attention], { state: db.forMonitor(key) })).events, ['queue_monitor_attention']);
    db.close();
  } finally { cleanup(); }
});

test('runtime baselines after a restart neither confirm nor falsely recover a persisted alert', async () => {
  const saved = { value: JSON.stringify(['attention', ['server_error_rate_high']]) };
  const state = { load: () => saved.value, save: v => { saved.value = v; } };
  const snapshot = ok => ({ loggingDropped: 0, loggingFailures: 0, persistenceFailures: 0, buckets: [{ category: 'answers', status: 200, count: ok, histogram: [ok, ...Array(13).fill(0)] }] });
  const snapshots = [snapshot(10), snapshot(40)];
  const controller = new AbortController(); const events = []; let i = 0;
  await monitorRuntime({ signal: controller.signal, intervalMs: 1000, state, fetchSnapshot: async () => snapshots[i++], onEvent: e => events.push(e.event), wait: async () => { if (i === snapshots.length) controller.abort(); } });
  // First poll is only a baseline; the second shows a healthy window, so recovery is real.
  assert.deepEqual(events, ['runtime_monitor_recovered']);
  assert.equal(saved.value, JSON.stringify(['ok', []]));
});

test('state files hold only hashed keys and states, reject foreign databases and invalid saved states', async () => {
  const { path, cleanup } = tempDb();
  try {
    const db = openMonitorState(path);
    const key = monitorStateKey('runtime', 'https://private-host.example.com');
    db.forMonitor(key).save(JSON.stringify(['ok', []]));
    assert.throws(() => db.forMonitor('runtime:../../etc'), /Invalid monitor state key/);
    db.close();
    assert.equal(readFileSync(path).includes('private-host'), false);

    const tampered = { load: () => JSON.stringify(['attention', ['not_a_code']]), save: () => {} };
    assert.deepEqual((await run([attention], { state: tampered })).events, ['queue_monitor_attention']);
    const broken = { load: () => { throw new Error('disk'); }, save: () => { throw new Error('disk'); } };
    const { events, result } = await run([attention], { state: broken });
    assert.deepEqual(events, ['queue_monitor_attention']);
    assert.equal(result.stateFailures, 2);

    const other = new DatabaseSync(path); other.exec('CREATE TABLE unrelated(x)'); other.close();
    assert.throws(() => openMonitorState(path), /separate monitor state database/);
  } finally { cleanup(); }
});
