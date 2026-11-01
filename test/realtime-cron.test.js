import { permitCrawl } from '../src/crawl-policy.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { configureCronTables, runCronCycle, startCronWorker, getCronStats } from '../src/realtime-cron.js';
import { REALTIME_SOURCES } from '../src/realtime-registry.js';
import { realtimeKbStore } from '../src/realtime-kb-ingestor.js';
import { configureEnglishDatabase } from '../src/migrations.js';
import { configureIngestion } from '../src/ingestion.js';
import { configureGapWorkflow } from '../src/gap-workflow.js';
import { createApp } from '../src/server.js';
import { openStore } from '../src/store.js';

function createTestStore() {
  const db = new DatabaseSync(':memory:');
  db.exec(`
    PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS records(id TEXT PRIMARY KEY, body TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS audits(id INTEGER PRIMARY KEY, record_id TEXT, previous TEXT, next TEXT, reviewer TEXT, note TEXT, at TEXT);
    CREATE TABLE IF NOT EXISTS traces(id TEXT PRIMARY KEY, body TEXT, at TEXT);
    CREATE TABLE IF NOT EXISTS gaps(id INTEGER PRIMARY KEY, trace_id TEXT, topic TEXT, reason TEXT, at TEXT);
    CREATE TABLE IF NOT EXISTS feedback(id INTEGER PRIMARY KEY, trace_id TEXT, issue TEXT, at TEXT);
  `);
  configureEnglishDatabase(db);
  configureIngestion(db);
  configureGapWorkflow(db);

  for (const source of REALTIME_SOURCES) permitCrawl(db,source,{reviewer:'Test fixture',note:'Synthetic fetch fixture; no external network access.'});
  return {
    db,
    realtime: realtimeKbStore(db),
    records: () => db.prepare('SELECT body FROM records').all().map(r => JSON.parse(r.body))
  };
}

test('Autonomous Cron: ZERO OpenAI/LLM dependency verified', async () => {
  assert.equal(process.env.OPENAI_API_KEY, undefined, 'No OPENAI_API_KEY is required or expected');
  const store = createTestStore();
  const testSources = REALTIME_SOURCES.slice(0, 3);

  // Mock native HTTP fetch without any external API calls
  const mockFetcher = async (url) => ({
    status: 200,
    ok: true,
    text: `<html><body><main>Official regulatory notice on ${url}: All services are operational.</main></body></html>`,
    headers: {
      get: (h) => h === 'etag' ? '"etag-v1"' : null
    }
  });

  const res = await runCronCycle({
    store,
    fetcher: mockFetcher,
    sources: testSources
  });

  assert.equal(res.success, true);
  assert.equal(res.totalSources, 3);
  assert.equal(res.changedSources, 3, 'Initial run establishes baseline snapshots for all 3 sources');

  // Verify crawl_snapshots table
  const snapshots = store.db.prepare('SELECT * FROM crawl_snapshots').all();
  assert.equal(snapshots.length, 3);
  assert.equal(snapshots[0].etag, '"etag-v1"');

  // Verify cron_crawl_logs table
  const logs = store.db.prepare('SELECT * FROM cron_crawl_logs').all();
  assert.equal(logs.length, 1);
  assert.equal(logs[0].status, 'success');
  assert.equal(logs[0].total_sources, 3);
});

test('Autonomous Cron: second run without changes detects zero deltas (304 / identical hash)', async () => {
  const store = createTestStore();
  const testSources = [REALTIME_SOURCES[0]];

  const mockFetcher = async () => ({
    status: 200,
    ok: true,
    text: '<main>IRCC Notice: Express Entry round minimum CRS is 510.</main>',
    headers: { get: () => '"tag-1"' }
  });

  // Cycle 1: Baseline established
  const run1 = await runCronCycle({ store, fetcher: mockFetcher, sources: testSources });
  assert.equal(run1.changedSources, 1);

  // Cycle 2: Same content returned
  const run2 = await runCronCycle({ store, fetcher: mockFetcher, sources: testSources });
  assert.equal(run2.changedSources, 0, 'No changed sources detected on identical content');
});

test('Autonomous Cron: detects policy change, extracts rules, and updates KB automatically', async () => {
  const store = createTestStore();
  const source = REALTIME_SOURCES.find(s => s.id === 'ca-bc-vancouver-translink');

  // Baseline
  const fetchBaseline = async () => ({
    status: 200,
    ok: true,
    text: '<main>Vancouver TransLink adult single fare is $3.15.</main>',
    headers: { get: () => '"v1"' }
  });
  await runCronCycle({ store, fetcher: fetchBaseline, sources: [source] });

  // Update: Fare increased to $3.40
  const fetchUpdate = async () => ({
    status: 200,
    ok: true,
    text: '<main>Vancouver TransLink adult single fare is $3.40 effective January 1, 2027.</main>',
    headers: { get: () => '"v2"' }
  });
  const runUpdate = await runCronCycle({ store, fetcher: fetchUpdate, sources: [source] });

  assert.equal(runUpdate.changedSources, 1);

  // Verify that live_updates table was updated automatically
  const alerts = store.realtime.findActiveAlerts({ city: 'Vancouver', topic: 'transit' });
  assert.equal(alerts.length, 1);
  assert.equal(alerts[0].city, 'Vancouver');
  assert.ok(alerts[0].headline.includes('TransLink'));

  // Verify that KB records table has the auto-published low-risk research seed
  const kbRecords = store.records();
  const seed = kbRecords.find(r => r.jurisdiction === 'Vancouver' && r.topic === 'transit');
  assert.ok(seed, 'Knowledge Base record is automatically present in store');
  assert.equal(seed.status, 'research_seed');
});

test('Autonomous Cron: worker loop starts and aborts gracefully via AbortSignal', async () => {
  const store = createTestStore();
  const controller = new AbortController();

  const mockFetcher = async () => ({
    status: 200,
    ok: true,
    text: '<main>Test policy</main>',
    headers: { get: () => null }
  });

  // Start worker in background with short 50ms interval and abort after 120ms
  const workerPromise = startCronWorker({
    store,
    intervalMs: 50,
    signal: controller.signal,
    fetcher: mockFetcher,
    sources: [REALTIME_SOURCES[0]]
  });

  await new Promise(r => setTimeout(r, 120));
  assert.equal(getCronStats(store.db).autonomousCronActive,true);
  controller.abort();
  await workerPromise;

  const stats = getCronStats(store.db);
  assert.equal(stats.autonomousCronActive, false);
  assert.ok(stats.recentLogs.length >= 1);
});

test('HTTP API: GET /v1/realtime/cron-stats returns cron metrics and execution history', async () => {
  const store = openStore(':memory:');
  const server = createApp(store, 'test-legacy-admin-token-24ch', {});
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const root = `http://127.0.0.1:${server.address().port}`;

  try {
    const res = await fetch(`${root}/v1/realtime/cron-stats`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.autonomousCronActive, false);
    assert.ok(body.totalMonitoredSources >= 10);
    assert.ok(Array.isArray(body.recentLogs));
  } finally {
    await new Promise(r => server.close(r));
    store.db.close();
  }
});

test('cron activity requires a live heartbeat rather than a recent completed job',()=>{
 const store=createTestStore();
 try {
  configureCronTables(store.db);
  store.db.prepare('INSERT INTO cron_worker_leases VALUES (?,?)').run('expired-worker',Date.now()-1);
  assert.equal(getCronStats(store.db).autonomousCronActive,false);
  store.db.prepare('INSERT INTO cron_worker_leases VALUES (?,?)').run('live-worker',Date.now()+60000);
  assert.equal(getCronStats(store.db).autonomousCronActive,true);
 }finally{store.db.close();}
});
