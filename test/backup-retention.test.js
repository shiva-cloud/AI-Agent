import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, realpathSync, rmSync, writeFileSync, readFileSync, existsSync, readdirSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, basename } from 'node:path';
import { createCipheriv, createHash, randomBytes } from 'node:crypto';
import { retainBackups, validateRetention } from '../src/backup-retention.js';
const now = Date.parse('2026-10-30T12:00:00Z'), day = 86400000, key = Buffer.alloc(32, 9);
function fixture(t) {
  const parent = realpathSync(tmpdir()), root = mkdtempSync(join(parent, 'northstar-retention-'));
  t.after(() => { const path = realpathSync(root); assert.equal(dirname(path), parent); assert.ok(basename(path).startsWith('northstar-retention-')); rmSync(path, { recursive: true, force: true }); });
  return root;
}
function packageAt(root, name, age, { secret = key, kind = 'queue', rotated } = {}) {
  const dir = join(root, name); mkdirSync(dir);
  const iv = randomBytes(12), cipher = createCipheriv('aes-256-gcm', secret, iv);
  cipher.setAAD(Buffer.from(`northstar-${kind}-backup-v1`));
  const bytes = Buffer.concat([cipher.update('Synthetic retention ciphertext fixture'), cipher.final()]);
  const manifest = { version: 1, kind: `encrypted-${kind}`, file: `${kind}.enc`, algorithm: 'aes-256-gcm', iv: iv.toString('hex'), tag: cipher.getAuthTag().toString('hex'), sha256: createHash('sha256').update(bytes).digest('hex'), createdAt: new Date(now - age * day).toISOString(), verification: { dataDigest: 'a'.repeat(64), schemaDigest: 'b'.repeat(64) } };
  if (rotated !== undefined) manifest.rekeyedAt = new Date(now - rotated * day).toISOString();
  writeFileSync(join(dir, `${kind}.enc`), bytes); writeFileSync(join(dir, 'manifest.json'), JSON.stringify(manifest));
  return dir;
}

test('retention dry run and apply preserve minimum count and age boundary', async t => {
  const root = fixture(t);
  for (const age of [1, 2, 30, 31, 40]) packageAt(root, `queue-backup-${age}`, age);
  const options = { kind: 'queue', key, keep: 2, maxAgeDays: 30, now };
  const plan = await retainBackups(root, options);
  assert.deepEqual(plan.candidates, ['queue-backup-31', 'queue-backup-40']); assert.deepEqual(plan.deleted, []); assert.equal(readdirSync(root).length, 5);
  const applied = await retainBackups(root, { ...options, apply: true });
  assert.deepEqual(applied.deleted, plan.candidates); assert.equal(applied.kept, 3);
  assert.deepEqual((await retainBackups(root, { ...options, apply: true })).deleted, []);
});

test('old minimum backups remain and newly rekeyed packages get their own age grace', async t => {
  const root = fixture(t);
  packageAt(root, 'queue-backup-old-a', 100); packageAt(root, 'queue-backup-old-b', 101);
  assert.deepEqual((await retainBackups(root, { kind: 'queue', key, keep: 2, now, apply: true })).deleted, []);
  packageAt(root, 'queue-rekey-new', 200, { rotated: 1 });
  const result = await retainBackups(root, { kind: 'queue', key, keep: 2, now });
  assert.deepEqual(result.candidates, ['queue-backup-old-b']);
});

test('wrong-key, corrupt, incomplete, unrelated and extra-file packages are never deleted or counted as keepers', async t => {
  const root = fixture(t);
  packageAt(root, 'queue-backup-good', 100);
  packageAt(root, 'queue-backup-wrong-key', 101, { secret: Buffer.alloc(32, 8) });
  const corrupt = packageAt(root, 'queue-backup-corrupt', 102);
  const bytes = readFileSync(join(corrupt, 'queue.enc')); bytes[0] ^= 1; writeFileSync(join(corrupt, 'queue.enc'), bytes);
  const extra = packageAt(root, 'queue-backup-extra', 103); writeFileSync(join(extra, 'notes.txt'), 'Preserve');
  mkdirSync(join(root, 'queue-backup-partial'));
  packageAt(root, 'evidence-backup-other-kind', 104, { kind: 'evidence' });
  packageAt(root, 'queue-backup-future', -1);
  const before = readdirSync(root);
  const result = await retainBackups(root, { kind: 'queue', key, keep: 2, now, apply: true });
  assert.equal(result.authenticated, 1); assert.equal(result.skipped.length, 5); assert.deepEqual(result.deleted, []); assert.deepEqual(readdirSync(root), before);
});

test('directory links cannot make retention traverse outside its root', async t => {
  const parent = fixture(t), root = join(parent, 'backups'); mkdirSync(root);
  const outside = packageAt(parent, 'outside', 100);
  symlinkSync(outside, join(root, 'queue-backup-linked'), process.platform === 'win32' ? 'junction' : 'dir');
  const result = await retainBackups(root, { kind: 'queue', key, now, apply: true });
  assert.deepEqual(result.skipped, ['queue-backup-linked']); assert.ok(existsSync(join(outside, 'queue.enc')));
});

test('invalid policy cannot delete packages', async t => {
  for (const policy of [{ keep: 0 }, { keep: 1 }, { keep: 1001 }, { maxAgeDays: 0 }, { keep: 2.5 }]) assert.throws(() => validateRetention(policy));
  const root = fixture(t); packageAt(root, 'queue-backup-one', 100);
  await assert.rejects(retainBackups(root, { kind: 'queue', key, apply: 'yes', now }));
  assert.ok(existsSync(join(root, 'queue-backup-one')));
});
