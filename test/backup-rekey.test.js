import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, realpathSync, rmSync, readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, basename } from 'node:path';
import { randomBytes, createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { openStore } from '../src/store.js';
import { openJobQueue } from '../src/jobs.js';
import { backupQueue, restoreQueueDrill } from '../src/queue-recovery.js';
import { backupEvidenceEncrypted, restoreEvidenceEncryptedDrill } from '../src/evidence-recovery-encrypted.js';
import { rekeyBackup } from '../src/backup-rekey.js';

function fixture(t) {
  const parent = realpathSync(tmpdir()), root = mkdtempSync(join(parent, 'northstar-rekey-'));
  t.after(() => { const resolved = realpathSync(root); assert.equal(dirname(resolved), parent); assert.ok(basename(resolved).startsWith('northstar-rekey-')); rmSync(resolved, { recursive: true, force: true }); });
  return root;
}

for (const kind of ['queue', 'evidence']) test(`${kind} rekey restores with the new key and preserves original backup`, async t => {
  const root = fixture(t), source = join(root, 'source.sqlite'), oldKey = randomBytes(32), newKey = randomBytes(32);
  const store = kind === 'queue' ? openJobQueue(source) : openStore(source);
  const backup = kind === 'queue' ? backupQueue : backupEvidenceEncrypted;
  const restore = kind === 'queue' ? restoreQueueDrill : restoreEvidenceEncryptedDrill;
  try {
    const original = await backup(source, join(root, 'backups'), oldKey);
    const manifestBefore = readFileSync(join(original.directory, 'manifest.json'));
    const bytesBefore = readFileSync(join(original.directory, `${kind}.enc`));
    const result = await rekeyBackup(original.directory, join(root, 'rotated'), oldKey, newKey);
    assert.equal(result.status, 'rekeyed');
    assert.deepEqual(readdirSync(result.directory).sort(), [`${kind}.enc`, 'manifest.json'].sort());
    assert.deepEqual(readFileSync(join(original.directory, 'manifest.json')), manifestBefore);
    assert.deepEqual(readFileSync(join(original.directory, `${kind}.enc`)), bytesBefore);
    const manifest = JSON.parse(readFileSync(join(result.directory, 'manifest.json')));
    assert.equal(manifest.createdAt, JSON.parse(manifestBefore).createdAt);
    assert.notEqual(manifest.iv, JSON.parse(manifestBefore).iv);
    const restored = await restore(result.directory, join(root, 'drills'), newKey);
    assert.deepEqual(restored.verification, original.verification);
    await assert.rejects(restore(result.directory, join(root, 'old-key'), oldKey));
    const originalRestored = await restore(original.directory, join(root, 'original-drill'), oldKey);
    assert.deepEqual(originalRestored.verification, original.verification);
  } finally { kind === 'queue' ? store.close() : store.db.close(); oldKey.fill(0); newKey.fill(0); }
});

test('wrong keys, checksum mismatches and authenticated ciphertext tampering leave no output files', async t => {
  const root = fixture(t), source = join(root, 'source.sqlite'), key = randomBytes(32), next = randomBytes(32);
  const store = openJobQueue(source);
  try {
    const backup = await backupQueue(source, join(root, 'backups'), key);
    const manifestPath = join(backup.directory, 'manifest.json'), encryptedPath = join(backup.directory, 'queue.enc');
    const manifest = JSON.parse(readFileSync(manifestPath)), bytes = readFileSync(encryptedPath);
    const output = join(root, 'rotated');
    await assert.rejects(rekeyBackup(backup.directory, output, randomBytes(32), next));
    writeFileSync(manifestPath, JSON.stringify({ ...manifest, sha256: '0'.repeat(64) }));
    await assert.rejects(rekeyBackup(backup.directory, output, key, next), /checksum/);
    bytes[0] ^= 1; writeFileSync(encryptedPath, bytes);
    writeFileSync(manifestPath, JSON.stringify({ ...manifest, sha256: createHash('sha256').update(bytes).digest('hex') }));
    await assert.rejects(rekeyBackup(backup.directory, output, key, next));
    for (const directory of readdirSync(output)) assert.deepEqual(readdirSync(join(output, directory)), []);
  } finally { store.close(); }
});

test('invalid keys and manifests reject before creating output packages', async t => {
  const root = fixture(t), source = join(root, 'source.sqlite'), key = randomBytes(32), next = randomBytes(32);
  const store = openJobQueue(source);
  try {
    const backup = await backupQueue(source, join(root, 'backups'), key), output = join(root, 'rotated');
    await assert.rejects(rekeyBackup(backup.directory, output, key, key), /distinct/);
    await assert.rejects(rekeyBackup(backup.directory, output, Buffer.alloc(2), next), /distinct/);
    const manifestPath = join(backup.directory, 'manifest.json'), manifest = JSON.parse(readFileSync(manifestPath));
    for (const change of [{ file: '../other.enc' }, { kind: 'unknown' }, { iv: 'not-hex' }, { verification: {} }, { version: 2 }]) {
      writeFileSync(manifestPath, JSON.stringify({ ...manifest, ...change }));
      await assert.rejects(rekeyBackup(backup.directory, output, key, next), /manifest/);
    }
    writeFileSync(manifestPath, 'x'.repeat(65537));
    await assert.rejects(rekeyBackup(backup.directory, output, key, next), /size limit/);
    assert.equal(existsSync(output), false);
  } finally { store.close(); }
});

test('rotation CLI reports sanitized errors and keeps keys out of command arguments', () => {
  const result = spawnSync(process.execPath, ['scripts/backup-rekey.js', 'missing', 'unused'], {
    env: { ...process.env, BACKUP_OLD_KEY: 'private-invalid-fixture', BACKUP_NEW_KEY: 'private-invalid-fixture' }, encoding: 'utf8', windowsHide: true
  });
  assert.equal(result.status, 1); assert.equal(result.stdout, ''); assert.ok(!result.stderr.includes('private-invalid-fixture'));
});
