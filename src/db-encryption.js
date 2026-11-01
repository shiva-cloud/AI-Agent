// Encrypted SQLite Database Snapshot & Rest-At-Rest Protection (Rec 145)
// Employs AES-256-GCM authenticated encryption and PBKDF2 (100,000 iterations)
// to securely snapshot, encrypt, and restore SQLite database files.

import { createCipheriv, createDecipheriv, pbkdf2Sync, randomBytes } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const PBKDF2_ITERATIONS = 100_000;
const KEY_LEN = 32; // 256 bits
const SALT_LEN = 32;
const IV_LEN = 12; // 96 bits for GCM
const TAG_LEN = 16; // 128-bit authentication tag

export function deriveEncryptionKey(passphrase, salt) {
  if (!passphrase || typeof passphrase !== 'string') {
    throw new Error('Valid encryption passphrase is required');
  }
  if (!salt || (!Buffer.isBuffer(salt) && typeof salt !== 'string')) {
    throw new Error('Valid encryption salt is required');
  }
  return pbkdf2Sync(passphrase, salt, PBKDF2_ITERATIONS, KEY_LEN, 'sha256');
}

export function encryptBuffer(dataBuffer, passphrase) {
  if (dataBuffer === undefined || dataBuffer === null) {
    dataBuffer = Buffer.alloc(0);
  } else if (!Buffer.isBuffer(dataBuffer)) {
    dataBuffer = Buffer.from(dataBuffer);
  }
  const salt = randomBytes(SALT_LEN);
  const iv = randomBytes(IV_LEN);
  const key = deriveEncryptionKey(passphrase, salt);

  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(dataBuffer), cipher.final()]);
  const tag = cipher.getAuthTag();

  // Encrypted format: [SALT (32b)][IV (12b)][TAG (16b)][CIPHERTEXT]
  return Buffer.concat([salt, iv, tag, ciphertext]);
}

export function decryptBuffer(encryptedBuffer, passphrase) {
  if (encryptedBuffer === undefined || encryptedBuffer === null) {
    throw new Error('Encrypted payload is required');
  }
  if (!Buffer.isBuffer(encryptedBuffer)) {
    encryptedBuffer = Buffer.from(encryptedBuffer);
  }
  const minLen = SALT_LEN + IV_LEN + TAG_LEN;
  if (encryptedBuffer.length < minLen) {
    throw new Error('Encrypted payload too short to be valid AES-256-GCM package');
  }

  const salt = encryptedBuffer.subarray(0, SALT_LEN);
  const iv = encryptedBuffer.subarray(SALT_LEN, SALT_LEN + IV_LEN);
  const tag = encryptedBuffer.subarray(SALT_LEN + IV_LEN, minLen);
  const ciphertext = encryptedBuffer.subarray(minLen);

  const key = deriveEncryptionKey(passphrase, salt);
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

export function encryptDatabaseFile(sourceDbPath, targetEncPath, passphrase) {
  if (!existsSync(sourceDbPath)) {
    throw new Error(`Source database file not found: ${sourceDbPath}`);
  }
  const rawDb = readFileSync(sourceDbPath);
  const encrypted = encryptBuffer(rawDb, passphrase);
  writeFileSync(targetEncPath, encrypted);
  return {
    source: sourceDbPath,
    target: targetEncPath,
    rawBytes: rawDb.length,
    encryptedBytes: encrypted.length,
    cipher: 'aes-256-gcm',
    kdf: 'pbkdf2-sha256'
  };
}

export function decryptDatabaseFile(sourceEncPath, targetDbPath, passphrase) {
  if (!existsSync(sourceEncPath)) {
    throw new Error(`Encrypted database file not found: ${sourceEncPath}`);
  }
  const encrypted = readFileSync(sourceEncPath);
  const decrypted = decryptBuffer(encrypted, passphrase);
  writeFileSync(targetDbPath, decrypted);
  return {
    source: sourceEncPath,
    target: targetDbPath,
    restoredBytes: decrypted.length
  };
}
