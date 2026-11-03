import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';

import { REALTIME_SOURCES, MONITORED_DESTINATIONS, queryRealtimeSources } from '../src/realtime-registry.js';
import { cleanHtmlContent, computeContentHash, detectContentDelta, pollSource } from '../src/realtime-crawler.js';
import { extractPolicyDelta, extractDatesFromText } from '../src/realtime-extractor.js';
import { realtimeKbStore } from '../src/realtime-kb-ingestor.js';
import { formatSlackMessage, formatTelegramMessage, dispatchAlertWebhook } from '../src/realtime-alerts.js';
import { answer } from '../src/engine.js';
import { composePresentation } from '../src/answer-composer.js';
import { createAnswerCache } from '../src/answer-cache.js';
import { createApp } from '../src/server.js';
import { openStore } from '../src/store.js';
import { configureEnglishDatabase } from '../src/migrations.js';
import { configureIngestion } from '../src/ingestion.js';
import { configureGapWorkflow } from '../src/gap-workflow.js';

function createTestDb() {
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
  return db;
}

test('Realtime Registry: covers core destination countries and major cities', () => {
  assert.ok(MONITORED_DESTINATIONS.CA, 'Canada is defined');
  assert.ok(MONITORED_DESTINATIONS.CA.cities.includes('Vancouver'));
  assert.ok(MONITORED_DESTINATIONS.CA.cities.includes('Toronto'));
  assert.ok(MONITORED_DESTINATIONS.US.cities.includes('New York City'));
  assert.ok(MONITORED_DESTINATIONS.GB.cities.includes('London'));
  assert.ok(MONITORED_DESTINATIONS.AU.cities.includes('Sydney'));
  assert.ok(MONITORED_DESTINATIONS.AE.cities.includes('Dubai'));
  assert.ok(MONITORED_DESTINATIONS.DE.cities.includes('Berlin'));

  const vancouverSources = queryRealtimeSources({ city: 'Vancouver' });
  assert.ok(vancouverSources.length >= 2, 'Vancouver has multiple municipal sources');
  assert.ok(vancouverSources.some(s => s.topic === 'transit'));
  assert.ok(vancouverSources.some(s => s.topic === 'housing'));

  const torontoSources = queryRealtimeSources({ city: 'Toronto' });
  assert.ok(torontoSources.length >= 2, 'Toronto has transit and housing sources');
});

test('Realtime Crawler: sanitizes HTML boilerplate and computes SHA-256 hashes', () => {
  const dirtyHtml = `
    <html>
      <head><script>alert("tracker");</script><style>.ad { display:none; }</style></head>
      <body>
        <nav><a href="/home">Home</a></nav>
        <main>
          <h1>City of Toronto Transit Notice</h1>
          <p>Effective January 1, 2027, adult single fares will increase from $3.35 to $3.40.</p>
        </main>
        <footer>Copyright 2026 City of Toronto</footer>
      </body>
    </html>
  `;

  const cleaned = cleanHtmlContent(dirtyHtml);
  assert.ok(!cleaned.includes('alert('), 'Scripts are stripped');
  assert.ok(!cleaned.includes('.ad {'), 'Styles are stripped');
  assert.ok(!cleaned.includes('Home'), 'Nav elements are stripped');
  assert.ok(!cleaned.includes('Copyright'), 'Footer elements are stripped');
  assert.ok(cleaned.includes('adult single fares will increase from $3.35 to $3.40'), 'Main text is preserved');

  const hash1 = computeContentHash(cleaned);
  const hash2 = computeContentHash(cleaned);
  assert.equal(hash1, hash2, 'Hash is deterministic');
  assert.equal(hash1.length, 64, 'SHA-256 is 64 hex characters');
});

test('Realtime Crawler: detects numeric and condition token deltas accurately', () => {
  const baseline = 'The standard application fee is $150. Applicants may apply online.';
  const updated = 'The standard application fee is $185. Applicants must apply online.';

  const delta = detectContentDelta(baseline, updated);
  assert.equal(delta.changed, true);
  assert.equal(delta.numericDiff, true, 'Detects fee change from 150 to 185');
  assert.equal(delta.conditionDiff, true, 'Detects condition change from may to must');
  assert.equal(delta.changeType, 'critical_policy_revision');
  assert.ok(delta.addedNumbers.includes('185'));
  assert.ok(delta.removedNumbers.includes('150'));

  const noChange = detectContentDelta(baseline, baseline);
  assert.equal(noChange.changed, false);
  assert.equal(noChange.changeType, 'no_change');
});

test('Realtime Crawler: supports conditional polling (ETag & 304 Not Modified)', async () => {
  const testSource = REALTIME_SOURCES.find(s => s.id === 'ca-bc-vancouver-translink');
  
  // 1. Initial crawl with 200 OK
  const mockFetchInitial = async () => ({
    status: 200,
    ok: true,
    text: '<main>Vancouver TransLink adult 1-zone fare is $3.15.</main>',
    headers: {
      get: name => name === 'etag' ? '"vancouver-fare-v1"' : null
    }
  });

  const res1 = await pollSource(testSource, null, { fetcher: mockFetchInitial });
  assert.equal(res1.status, 'content_changed');
  assert.equal(res1.changed, true);
  assert.equal(res1.etag, '"vancouver-fare-v1"');

  // 2. Second crawl with 304 Not Modified
  const mockFetchUnchanged = async () => ({
    status: 304,
    ok: false,
    text: '',
    headers: {}
  });

  const res2 = await pollSource(testSource, { etag: res1.etag, hash: res1.hash }, { fetcher: mockFetchUnchanged });
  assert.equal(res2.status, 'unchanged_304');
  assert.equal(res2.changed, false);
  assert.equal(res2.etag, '"vancouver-fare-v1"');
});

test('Realtime Extractor: extracts dates and constructs compliant evidence records', () => {
  const text = 'The Ontario Ministry announced changes on October 31, 2026. New statutory guidelines take effect on 2027-01-01.';
  const dates = extractDatesFromText(text);
  assert.ok(dates.includes('2026-10-31'));
  assert.ok(dates.includes('2027-01-01'));

  const source = REALTIME_SOURCES.find(s => s.id === 'ca-on-toronto-transit-fares');
  const content = 'TTC transit board confirmed adult fare adjustments effective January 1, 2027.';

  const extracted = extractPolicyDelta({
    source,
    content,
    delta: { changed: true, changeType: 'rate_revision' },
    simulatedInput: {
      headline: 'Toronto TTC Transit Fare Schedule 2027',
      summary: 'TTC transit fares for Toronto are updated with adult single fares adjusted to $3.40 effective January 1, 2027.',
      quote: 'TTC transit board confirmed adult fare adjustments effective January 1, 2027.',
      risk: 'low',
      effectiveFrom: '2027-01-01'
    }
  });

  assert.equal(extracted.candidateRecord.topic, 'transit');
  assert.equal(extracted.candidateRecord.jurisdiction, 'Toronto');
  assert.equal(extracted.candidateRecord.status, 'research_seed', 'Low-risk record becomes research_seed');
  assert.equal(extracted.liveAlert.city, 'Toronto');
  assert.equal(extracted.liveAlert.status, 'active');
});

test('Realtime Extractor: national channels map country codes to full jurisdiction names', () => {
  const bmf = REALTIME_SOURCES.find(s => s.id === 'de-bamf-chancenkarte-updates');
  const extracted = extractPolicyDelta({
    source: bmf,
    content: 'BAMF publishes an update about the Chancenkarte points grid.',
    delta: { changed: true },
    simulatedInput: {
      headline: 'BAMF Chancenkarte guidance update',
      summary: 'BAMF updated the guidance for the Chancenkarte points grid.',
      quote: 'BAMF updated the guidance for the Chancenkarte points grid.',
      risk: 'high'
    }
  });
  assert.equal(extracted.candidateRecord.jurisdiction, 'Germany', 'the DE code becomes the full country name');
  assert.equal(extracted.candidateRecord.status, 'pending', 'high-risk channel record stays pending');

  const ukSource = REALTIME_SOURCES.find(s => s.id === 'uk-home-office-updates');
  const ukExtracted = extractPolicyDelta({
    source: ukSource,
    content: 'UK Visas and Immigration publishes operational policy notices.',
    delta: { changed: true },
    simulatedInput: {
      headline: 'UK Visas and Immigration policy notice',
      summary: 'UK Visas and Immigration published an operational policy notice.',
      quote: 'UK Visas and Immigration published an operational policy notice.',
      risk: 'high'
    }
  });
  assert.equal(ukExtracted.candidateRecord.jurisdiction, 'United Kingdom', 'the GB code becomes the full country name');

  // The Canada layer keeps its code convention.
  const caSource = REALTIME_SOURCES.find(s => s.country === 'CA' && !s.city && !s.region);
  const caExtracted = extractPolicyDelta({
    source: caSource,
    content: 'IRCC publishes an update on the portal.',
    delta: { changed: true },
    simulatedInput: {
      headline: 'IRCC program update',
      summary: 'IRCC published a program update on the portal.',
      quote: 'IRCC published a program update on the portal.',
      risk: 'low'
    }
  });
  assert.equal(caExtracted.candidateRecord.jurisdiction, 'CA', 'Canada-layer records keep the CA code');
});

test('Dual-Track KB Ingestion: stores live alerts and auto-publishes low-risk records', async () => {
  const db = createTestDb();
  const cache = createAnswerCache({ maxEntries: 16 });
  const kb = realtimeKbStore(db, cache);

  const source = REALTIME_SOURCES.find(s => s.id === 'ca-bc-vancouver-translink');
  const content = 'TransLink announces updated 2027 single fare rates for Metro Vancouver.';

  const extracted = extractPolicyDelta({
    source,
    content,
    delta: { changed: true },
    simulatedInput: {
      headline: 'TransLink Vancouver Fare Revision 2027',
      summary: 'TransLink 2027 transit fare adjustments for Metro Vancouver zones.',
      quote: 'TransLink announces updated 2027 single fare rates for Metro Vancouver.',
      risk: 'low',
      effectiveFrom: '2027-01-01'
    }
  });

  const res = await kb.ingestPolicyUpdate(extracted);
  assert.equal(res.success, true);
  assert.equal(res.liveAlertActive, true);
  assert.equal(res.status, 'research_seed');

  // Verify that live alert is searchable by city
  const futureRecord = JSON.parse(db.prepare('SELECT body FROM records WHERE id=?').get(extracted.candidateRecord.id).body);
  futureRecord.checkedAt='2027-01-01';futureRecord.expiresAt='2027-01-15';
  db.prepare('UPDATE records SET body=? WHERE id=?').run(JSON.stringify(futureRecord),futureRecord.id);
  const vancouverAlerts = kb.findActiveAlerts({ city: 'Vancouver', topic: 'transit', now: new Date('2027-01-01') });
  assert.equal(vancouverAlerts.length, 1);
  assert.equal(vancouverAlerts[0].city, 'Vancouver');
  assert.equal(vancouverAlerts[0].headline, 'TransLink Vancouver Fare Revision 2027');

  // Check that records table has the updated seed
  const recordRow = db.prepare('SELECT body FROM records WHERE id = ?').get(extracted.candidateRecord.id);
  assert.ok(recordRow);
  const parsedRecord = JSON.parse(recordRow.body);
  assert.equal(parsedRecord.jurisdiction, 'Vancouver');
  assert.equal(parsedRecord.status, 'research_seed');
});

test('Dual-Track KB Ingestion: supersedes previous alert on newer announcement', async () => {
  const db = createTestDb();
  const kb = realtimeKbStore(db);
  const source = REALTIME_SOURCES.find(s => s.id === 'ca-ircc-express-entry');

  const alert1 = extractPolicyDelta({
    source,
    content: 'Round 310: 1,500 Invitations issued with CRS cutoff 505.',
    delta: { changed: true },
    simulatedInput: {
      headline: 'Express Entry Round 310 Results',
      summary: 'IRCC invited 1,500 candidates with minimum score of 505.',
      quote: 'Round 310: 1,500 Invitations issued with CRS cutoff 505.',
      risk: 'high'
    }
  });
  await kb.ingestPolicyUpdate(alert1);

  let active = kb.findActiveAlerts({ country: 'CA', topic: 'employment' });
  assert.equal(active.length, 0, 'High risk announcements require editorial provenance');

  // Second draw announcement
  const alert2 = extractPolicyDelta({
    source,
    content: 'Round 311: 2,000 Invitations issued with CRS cutoff 498.',
    delta: { changed: true },
    simulatedInput: {
      headline: 'Express Entry Round 311 Results',
      summary: 'IRCC invited 2,000 candidates with minimum score of 498.',
      quote: 'Round 311: 2,000 Invitations issued with CRS cutoff 498.',
      risk: 'high'
    }
  });
  await kb.ingestPolicyUpdate(alert2);

  active = kb.findActiveAlerts({ country: 'CA', topic: 'employment' });
  assert.equal(active.length, 0, 'New high risk announcements remain withheld');

  // Previous alert is now superseded in history
  const allAlerts = kb.listAlerts();
  assert.equal(allAlerts.length, 2);
  const superseded = allAlerts.find(a => a.headline === 'Express Entry Round 310 Results');
  assert.equal(superseded.status, 'superseded');
});

test('Chat Engine Integration: withholds alerts without approved evidence', () => {
  const db = createTestDb();
  const kb = realtimeKbStore(db);

  // Pre-populate an active live alert for Vancouver housing
  const source = REALTIME_SOURCES.find(s => s.id === 'ca-bc-vancouver-tenant-services');
  const alert = extractPolicyDelta({
    source,
    content: 'City of Vancouver updates tenant relocation requirements for rental redevelopments.',
    delta: { changed: true },
    simulatedInput: {
      headline: 'City of Vancouver Renoviction Protection Update',
      summary: 'The City of Vancouver updated its tenant relocation and compensation requirements for residential tenants.',
      quote: 'City of Vancouver updates tenant relocation requirements for rental redevelopments.',
      risk: 'high'
    }
  });
  db.prepare(`
    INSERT INTO live_updates (id, source_id, record_id, country, region, city, tier, topic, headline, summary, url, detected_at, risk, status)
    VALUES (?, ?, ?, 'CA', 'BC', 'Vancouver', 'municipal', 'housing', ?, ?, ?, ?, 'high', 'active')
  `).run(alert.liveAlert.id, source.id, alert.candidateRecord.id, alert.liveAlert.headline, alert.liveAlert.summary, alert.liveAlert.url, alert.liveAlert.detectedAt);

  // Ask question about rent in Vancouver
  const ans = answer(
    { question: 'What are the rules for tenants and rent in Vancouver?', city: 'Vancouver', country: 'Canada' },
    [],
    new Date(),
    null,
    { realtimeStore: kb }
  );

  assert.equal(ans.liveAlerts?.length || 0, 0);
  assert.ok(!composePresentation(ans).breakingAlert);
});

test('Alert Webhook Dispatcher: formats Slack and Telegram alerts properly', async () => {
  const alert = {
    id: 'alert-test-123',
    city: 'Vancouver',
    region: 'BC',
    country: 'CA',
    tier: 'municipal',
    topic: 'housing',
    headline: 'B.C. Tenancy Guideline Update',
    summary: 'Maximum rent increase set at statutory ceiling.',
    url: 'https://example.gov.ca',
    risk: 'high',
    detectedAt: '2026-10-31T14:00:00Z'
  };

  const slack = formatSlackMessage(alert);
  assert.ok(slack.text.includes('Vancouver, BC, CA'));
  assert.ok(slack.blocks.length >= 3);

  const telegram = formatTelegramMessage(alert);
  assert.ok(telegram.includes('Vancouver, BC, CA'));
  assert.ok(telegram.includes('B.C. Tenancy Guideline Update'));
  assert.ok(telegram.includes('https://example.gov.ca'));

  let calledUrl = null, calledBody = null;
  const mockFetcher = async (url, init) => {
    calledUrl = url;
    calledBody = JSON.parse(init.body);
    return { ok: true, status: 200 };
  };

  const dispatchRes = await dispatchAlertWebhook(alert, { url: 'https://hooks.slack.com/services/test', type: 'slack' }, mockFetcher);
  assert.equal(dispatchRes.dispatched, true);
  assert.equal(calledUrl, 'https://hooks.slack.com/services/test');
  assert.ok(calledBody.blocks);
});

test('HTTP API: /v1/realtime/updates, /v1/realtime/matrix, /v1/realtime/simulate and /v1/realtime/poll', async () => {
  const store = openStore(':memory:');
  const server = createApp(store, 'test-legacy-admin-token-24ch', {}, {allowRealtimeSimulation:true});
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const root = `http://127.0.0.1:${server.address().port}`;

  try {
    // Test 1: GET /v1/realtime/matrix
    const matrixRes = await fetch(`${root}/v1/realtime/matrix`);
    assert.equal(matrixRes.status, 200);
    const matrixBody = await matrixRes.json();
    assert.ok(matrixBody.totalSources >= 10);
    assert.ok(matrixBody.destinations.CA.cities.includes('Vancouver'));

    // Test 2: POST /v1/realtime/simulate
    const simRes = await fetch(`${root}/v1/realtime/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization:'Bearer test-legacy-admin-token-24ch' },
      body: JSON.stringify({
        sourceId: 'ca-on-toronto-transit-fares',
        headline: 'TTC Fare Update Simulated',
        summary: 'Simulated TTC adult fare adjustment to $3.40.',
        risk: 'low'
      })
    });
    assert.equal(simRes.status, 200);
    const simBody = await simRes.json();
    assert.equal(simBody.sourceId, 'ca-on-toronto-transit-fares');
    assert.ok(simBody.alertId);

    // Test 3: GET /v1/realtime/updates filtered by city
    const updatesRes = await fetch(`${root}/v1/realtime/updates?city=Toronto`);
    assert.equal(updatesRes.status, 200);
    const updatesBody = await updatesRes.json();
    assert.ok(updatesBody.total >= 1);
    assert.equal(updatesBody.updates[0].city, 'Toronto');
  } finally {
    await new Promise(r => server.close(r));
    store.db.close();
  }
});
