// Encrypted Off-Site Backup Sync & Remote Retention Manager (Rec 95)
// Encrypts SQLite snapshots with AES-256-GCM and securely mirrors them
// to an off-site remote backup repository with automated hash verification and pruning.

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync, statSync, unlinkSync, mkdirSync, existsSync, mkdtempSync, rmdirSync } from 'node:fs';
import { join } from 'node:path';
import {DatabaseSync,backup} from 'node:sqlite';
import {randomUUID} from 'node:crypto';
import { encryptDatabaseFile } from './db-encryption.js';

export async function syncEncryptedBackupOffsite({
  sourceDbPath = 'data/settlement.sqlite',
  localBackupDir = 'backups/encrypted',
  remoteBackupDir = 'backups/offsite-mirror',
  passphrase = process.env.BACKUP_PASSPHRASE,
  maxBackups = 7
} = {}) {
  if(typeof passphrase!=='string'||passphrase.length<24)throw new Error('An explicit backup passphrase of at least 24 characters is required');
  if(!Number.isInteger(maxBackups)||maxBackups<1||maxBackups>1000)throw new Error('Invalid backup retention count');
  mkdirSync(localBackupDir, { recursive: true });
  mkdirSync(remoteBackupDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const encFileName = `settlement-snapshot-${timestamp}-${randomUUID()}.enc`;
  const localEncPath = join(localBackupDir, encFileName);
  const remoteEncPath = join(remoteBackupDir, encFileName);

  // 1. Encrypt snapshot locally using AES-256-GCM + PBKDF2
  const temporary=mkdtempSync(join(localBackupDir,'.snapshot-')),snapshot=join(temporary,'snapshot.sqlite');
  let source;
  try {
    source=new DatabaseSync(sourceDbPath,{readOnly:true});
    await backup(source,snapshot);
    encryptDatabaseFile(snapshot,localEncPath,passphrase);
  }finally{
    source?.close();
    if(existsSync(snapshot))unlinkSync(snapshot);
    rmdirSync(temporary);
  }

  // 2. Compute local checksum
  const localBuffer = readFileSync(localEncPath);
  const localSha256 = createHash('sha256').update(localBuffer).digest('hex');

  // 3. Mirror to off-site remote destination
  writeFileSync(remoteEncPath, localBuffer);

  // 4. Verify remote checksum matches local exactly
  const remoteBuffer = readFileSync(remoteEncPath);
  const remoteSha256 = createHash('sha256').update(remoteBuffer).digest('hex');

  if (localSha256 !== remoteSha256) {
    unlinkSync(remoteEncPath);
    throw new Error('Off-site backup sync verification failed: checksum mismatch');
  }

  // 5. Rotate and prune older backups beyond maxBackups retention limit
  const pruneResults = pruneOldBackups(remoteBackupDir, maxBackups);

  return {
    success: true,
    fileName: encFileName,
    bytes: localBuffer.length,
    sha256: localSha256,
    remotePath: remoteEncPath,
    syncedAt: new Date().toISOString(),
    prunedCount: pruneResults.prunedCount
  };
}

export function pruneOldBackups(dir, maxRetain) {
  if(!Number.isInteger(maxRetain)||maxRetain<1||maxRetain>1000)throw new Error('Invalid backup retention count');
  if (!existsSync(dir)) return { prunedCount: 0 };

  const files = readdirSync(dir)
    .filter(f => /^settlement-snapshot-[\w.-]+\.enc$/.test(f))
    .map(f => {
      const full = join(dir, f);
      return { path: full, time: statSync(full).mtimeMs };
    })
    .sort((a, b) => b.time - a.time);

  let prunedCount = 0;
  if (files.length > maxRetain) {
    for (const file of files.slice(maxRetain)) {
      try {
        unlinkSync(file.path);
        prunedCount++;
      } catch {}
    }
  }

  return { prunedCount };
}
