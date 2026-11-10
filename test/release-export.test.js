import { createPublicEvidenceSnapshot } from '../src/evidence-revision.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { openStore } from '../src/store.js';
import { publicEvidence } from '../src/public-evidence.js';
import { prepareRelease } from '../scripts/prepare-release-db.js';

test('release excludes operational data and preserves publication decisions and previous output on failure', () => {
  const directory = mkdtempSync(join(tmpdir(), 'release-test-'));
  const source = join(directory, 'source.sqlite');
  const target = join(directory, 'release.sqlite');
  const store = openStore(source);
  try {
    store.db.exec('CREATE TABLE audit_checkpoints(id INTEGER PRIMARY KEY, audit_id INTEGER); INSERT INTO audit_checkpoints VALUES (1, 0)');
    store.db.exec('CREATE TABLE realtime_subscriptions(contact_endpoint TEXT); CREATE TABLE future_private_data(secret TEXT)');
    store.db.prepare('INSERT INTO realtime_subscriptions VALUES (?)').run('https://example.com/private-token');
    store.db.prepare('INSERT INTO future_private_data VALUES (?)').run('private-secret');
    store.db.prepare('INSERT INTO traces VALUES (?,?,?)').run('trace', '{}', '2026-11-07');
    const rows = store.db.prepare('SELECT body FROM records').all().map(row => JSON.parse(row.body));
    const expected = publicEvidence(store.db, rows);
    createPublicEvidenceSnapshot(store.db, () => rows)();
    prepareRelease(source, target, { research: true });
    const copy = new DatabaseSync(target, { readOnly: true });
    try {
      assert.deepEqual(publicEvidence(copy, rows), expected);
      assert.equal(copy.prepare('SELECT audit_id FROM audit_checkpoints WHERE id=1').get().audit_id, 0);
      const names = copy.prepare("SELECT name FROM sqlite_schema WHERE type='table'").all().map(row => row.name);
      for (const name of ['traces', 'realtime_subscriptions', 'future_private_data']) assert.ok(!names.includes(name));
    } finally { copy.close(); }
    const reopened = openStore(target);
    reopened.db.close();
    const before = readFileSync(target);
    assert.throws(() => prepareRelease(source, target), /Publication review/);
    assert.deepEqual(readFileSync(target), before);
    assert.throws(() => prepareRelease(source, source, { research: true }), /differ/);
    assert.equal(store.db.prepare('SELECT count(*) AS n FROM traces').get().n, 1);
  } finally {
    store.db.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
