import test from 'node:test';
import assert from 'node:assert/strict';
import { openStore } from '../src/store.js';
import { publicEvidence } from '../src/public-evidence.js';
import { verifyAndPublish } from '../scripts/kb-verify-publish.js';

const REVIEWER = { reviewer: 'editorial-board', note: 'Synthetic fixture for the archive fallback path only.' };
const NOW = new Date('2026-11-01T10:00:00Z');
const URL = 'https://example-gov.example/presto-card';
const QUOTE = 'The PRESTO card costs two dollars and includes the first ride when bought at a station.';
const PAGE = `<html><body><h1>PRESTO</h1><p>${QUOTE}</p><p>A standard card costs $2 at any station kiosk.</p></body></html>`;

function makeResponse(status, contentType, body) {
  return new Response(body, { status, headers: { 'content-type': contentType } });
}

function fixture(overrides = {}) {
  return {
    id: 'archive-fallback-fixture', title: 'PRESTO card',
    summary: 'A PRESTO card costs $2.', quote: QUOTE,
    topic: 'transit', jurisdiction: 'Toronto', url: URL,
    language: 'en', status: 'pending', risk: 'high',
    sourceId: 'src-archive-fixture', checkedAt: '2026-10-31', expiresAt: '2027-01-01',
    ...overrides
  };
}

async function seededStore(record) {
  const store = openStore(':memory:');
  store.db.prepare('INSERT INTO records VALUES (?,?)').run(record.id, JSON.stringify(record));
  store.db.exec('DROP TRIGGER IF EXISTS records_editorial_approval_update');
  store.db.prepare('UPDATE records SET body=? WHERE id=?').run(JSON.stringify({ ...record, status: 'approved' }), record.id);
  store.ingestion.registerSource({ id: record.sourceId, url: record.url, owner: 'Example Transit Agency', language: 'en', tier: 'A', reviewer: REVIEWER.reviewer, note: REVIEWER.note });
  return store;
}

test('a dead official page is verified against its Internet Archive copy', async () => {
  const store = await seededStore(fixture());
  try {
    const fetchImpl = async url => {
      if (url === URL) return makeResponse(404, 'text/html', 'gone');
      if (url === `https://web.archive.org/web/2026/${URL}`) return makeResponse(200, 'text/html', PAGE);
      throw new Error(`unexpected fetch ${url}`);
    };
    const report = await verifyAndPublish(store, { apply: true, fetchImpl, now: NOW });
    assert.equal(report.checked, 1);
    assert.equal(report.passed, 1);
    assert.equal(report.published, 1);
    const result = report.results[0];
    assert.equal(result.ok, true);
    assert.equal(result.viaArchive, true);
    assert.equal(result.reason, null);
    const stored = store.records().find(r => r.id === 'archive-fallback-fixture');
    assert.equal(stored.reviewMethod, 'source_verified');
    assert.ok(stored.snapshotId, 'publication snapshot recorded');
    const served = publicEvidence(store.db, store.records()).find(r => r.id === 'archive-fallback-fixture');
    assert.equal(served.status, 'approved');
  } finally { store.db.close(); }
});

test('an archive copy without the quote keeps the record withheld', async () => {
  const store = await seededStore(fixture());
  try {
    const fetchImpl = async url => {
      if (url === URL) return makeResponse(403, 'text/html', 'blocked');
      if (url === `https://web.archive.org/web/2026/${URL}`) return makeResponse(200, 'text/html', '<html><body>Unrelated page text without the claim. No figures here.</body></html>');
      throw new Error(`unexpected fetch ${url}`);
    };
    const report = await verifyAndPublish(store, { apply: true, fetchImpl, now: NOW });
    const result = report.results[0];
    assert.equal(result.ok, false);
    assert.equal(result.viaArchive, false);
    assert.equal(result.reason, 'archive_quote_not_on_page');
    assert.equal(result.published, false);
  } finally { store.db.close(); }
});

test('no archive snapshot at all reports the archive failure honestly', async () => {
  const store = await seededStore(fixture());
  try {
    const fetchImpl = async url => {
      if (url === URL) return makeResponse(404, 'text/html', 'gone');
      if (url === `https://web.archive.org/web/2026/${URL}`) return makeResponse(404, 'text/html', 'not archived');
      throw new Error(`unexpected fetch ${url}`);
    };
    const report = await verifyAndPublish(store, { apply: false, fetchImpl, now: NOW });
    const result = report.results[0];
    assert.equal(result.ok, false);
    assert.equal(result.reason, 'archive_http_404');
  } finally { store.db.close(); }
});

test('queue-only mode ranks the queue without fetching or publishing', async () => {
  const store = await seededStore(fixture());
  try {
    const report = await verifyAndPublish(store, { queueOnly: true, now: NOW,
      fetchImpl: async () => { throw new Error('queue-only must not fetch'); } });
    assert.equal(report.queueOnly, true);
    assert.equal(report.applied, false);
    assert.equal(report.checked, 1);
    assert.equal(report.published, 0);
    assert.equal(report.results[0].id, 'archive-fallback-fixture');
    assert.equal(report.results[0].state, 'ready');
    assert.equal(report.results[0].reason, 'queue_only');
    assert.equal(report.byTopic.transit.ready, 1);
    // Nothing was written: the record stays an approved-but-unpublished row
    // and no publication exists for it.
    assert.equal(store.db.prepare('SELECT COUNT(*) n FROM publications').get().n, 0);
    const stored = store.records().find(r => r.id === 'archive-fallback-fixture');
    assert.equal(stored.status, 'approved');
    assert.equal(stored.snapshotId, undefined);
  } finally { store.db.close(); }
});
