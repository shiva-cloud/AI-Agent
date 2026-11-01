import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, realpathSync, rmSync, linkSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, basename } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { DatabaseSync } from 'node:sqlite';
import { acquireBackupOwner } from '../src/backup-owner.js';

function fixture(t) {
  const parent = realpathSync(tmpdir()), root = mkdtempSync(join(parent, 'northstar-owner-'));
  t.after(() => { const actual = realpathSync(root); assert.equal(dirname(actual), parent); assert.ok(basename(actual).startsWith('northstar-owner-')); rmSync(actual, { recursive: true, force: true }); });
  return root;
}

test('invalid retention settings reject before creating an ownership database', t => {
  const root = fixture(t);
  for (const [kind, keep] of [['unknown','2'],['queue','1']]) {
    const output = join(root, `${kind}-${keep}`);
    const result = spawnSync(process.execPath, ['scripts/backup-retention.js', kind, output, keep, '30', '--apply'], {
      windowsHide: true, encoding: 'utf8', env: { ...process.env, QUEUE_BACKUP_KEY: 'ab'.repeat(32) }
    });
    assert.equal(result.status, 1); assert.equal(existsSync(output), false);
  }
});

test('backup root has one owner across aliases; release is idempotent and leaves other roots independent', t => {
  const root = fixture(t), first = acquireBackupOwner(root);
  try {
    assert.throws(() => acquireBackupOwner(join(root, '.')), /locked/);
    const second = acquireBackupOwner(join(root, 'separate')); second.release();
  } finally { first.release(); first.release(); }
  acquireBackupOwner(root).release();
});

test('process crash releases ownership without deleting a stale lock file', async t => {
  const root = fixture(t), moduleUrl = new URL('../src/backup-owner.js', import.meta.url).href;
  const child = spawn(process.execPath, ['--input-type=module', '-e',
    `const {acquireBackupOwner}=await import(process.argv[1]); const owner=acquireBackupOwner(process.argv[2]); process.send('owned'); setInterval(()=>{},1000);`, moduleUrl, root],
  { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe', 'ipc'] });
  const exited = once(child, 'exit');
  try {
    const ready = await Promise.race([once(child, 'message'), exited.then(() => { throw new Error('Owner child exited before readiness'); })]);
    assert.equal(ready[0], 'owned');
    assert.throws(() => acquireBackupOwner(root), /locked/);
  } finally { child.kill('SIGKILL'); await exited; }
  acquireBackupOwner(root).release();
});

test('incompatible ownership databases are preserved', t => {
  const root = fixture(t), path = join(root, '.backup-owner.sqlite');
  const db = new DatabaseSync(path); db.exec('CREATE TABLE private_data(value TEXT); INSERT INTO private_data VALUES(\'preserve\')'); db.close();
  const before = readFileSync(path);
  assert.throws(() => acquireBackupOwner(root), /Incompatible/);
  assert.deepEqual(readFileSync(path), before);
});

test('ownership rejects filesystem links', t => {
  const root = fixture(t), outside = join(root, 'elsewhere');
  const db = new DatabaseSync(outside); db.close();
  linkSync(outside, join(root, '.backup-owner.sqlite'));
  assert.throws(() => acquireBackupOwner(root), /Unsafe/);
});

test('manual retention refuses an actively owned backup root', t => {
  const root = fixture(t), owner = acquireBackupOwner(root);
  try {
    const result = spawnSync(process.execPath, ['scripts/backup-retention.js', 'queue', root, '2', '30', '--apply'], {
      windowsHide: true, encoding: 'utf8', env: { ...process.env, QUEUE_BACKUP_KEY: 'ab'.repeat(32) }
    });
    assert.equal(result.status, 1); assert.equal(result.stdout, ''); assert.match(result.stderr, /retention failed/);
  } finally { owner.release(); }
});
