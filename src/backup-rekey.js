import { createCipheriv, createDecipheriv, createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { createReadStream, createWriteStream, lstatSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, renameSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';

// Rekey encrypted bytes without materializing a plaintext database on disk.
// This authenticates the existing ciphertext, not the manifest's editorial metadata.
export async function rekeyBackup(sourceDirectory, outputRoot, oldKey, newKey) {
  if (![oldKey, newKey].every(key => Buffer.isBuffer(key) && key.length === 32) || timingSafeEqual(oldKey, newKey)) {
    throw new Error('Two distinct 32-byte recovery keys are required');
  }
  const source = realpathSync(sourceDirectory), manifestPath = join(source, 'manifest.json');
  const regular = path => { const stat = lstatSync(path); if (!stat.isFile() || stat.isSymbolicLink()) throw new Error('Expected a regular backup file'); return stat; };
  if (regular(manifestPath).size > 65536) throw new Error('Backup manifest exceeds size limit');
  let manifest;
  try { manifest = JSON.parse(readFileSync(manifestPath, 'utf8')); } catch { throw new Error('Invalid backup manifest'); }
  const kind = manifest?.kind === 'encrypted-queue' ? 'queue' : manifest?.kind === 'encrypted-evidence' ? 'evidence' : null;
  if (!kind || manifest.version !== 1 || manifest.file !== `${kind}.enc` || manifest.algorithm !== 'aes-256-gcm' ||
      !/^[a-f0-9]{24}$/.test(manifest.iv) || !/^[a-f0-9]{32}$/.test(manifest.tag) || !/^[a-f0-9]{64}$/.test(manifest.sha256) ||
      !/^[a-f0-9]{64}$/.test(manifest.verification?.dataDigest) || !/^[a-f0-9]{64}$/.test(manifest.verification?.schemaDigest) ||
      typeof manifest.createdAt !== 'string' || !Number.isFinite(Date.parse(manifest.createdAt))) throw new Error('Invalid backup manifest');
  const input = join(source, `${kind}.enc`); regular(input);
  mkdirSync(outputRoot, { recursive: true });
  const root = mkdtempSync(join(realpathSync(outputRoot), `${kind}-rekey-`));
  const partial = join(root, `${kind}.partial.enc`), target = join(root, `${kind}.enc`);
  const originalHash = createHash('sha256'), outputHash = createHash('sha256');
  const hashStream = hash => new Transform({ transform(chunk, encoding, callback) { hash.update(chunk); callback(null, chunk); } });
  const iv = randomBytes(12), aad = Buffer.from(`northstar-${kind}-backup-v1`);
  const decrypt = createDecipheriv('aes-256-gcm', oldKey, Buffer.from(manifest.iv, 'hex'));
  decrypt.setAAD(aad); decrypt.setAuthTag(Buffer.from(manifest.tag, 'hex'));
  const encrypt = createCipheriv('aes-256-gcm', newKey, iv); encrypt.setAAD(aad);
  let complete = false;
  let primaryError = null;
  try {
    await pipeline(createReadStream(input), hashStream(originalHash), decrypt, encrypt, hashStream(outputHash), createWriteStream(partial, { flags: 'wx', mode: 0o600 }));
    if (originalHash.digest('hex') !== manifest.sha256) throw new Error('Backup checksum mismatch');
    const rotated = {
      version: 1, kind: manifest.kind, file: manifest.file, algorithm: 'aes-256-gcm',
      iv: iv.toString('hex'), tag: encrypt.getAuthTag().toString('hex'), sha256: outputHash.digest('hex'),
      verification: manifest.verification, createdAt: manifest.createdAt, rekeyedAt: new Date().toISOString()
    };
    renameSync(partial, target);
    writeFileSync(join(root, 'manifest.json'), JSON.stringify(rotated, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
    complete = true;
    return { directory: root, kind: manifest.kind, status: 'rekeyed', scope: 'Ciphertext authenticated and re-encrypted. Run an isolated restore drill before retiring the old key.' };
  } catch (err) {
    primaryError = err;
    throw err;
  } finally {
    if (!complete) for (const file of [partial, target, join(root, 'manifest.json')]) {
      try { unlinkSync(file); } catch (error) {
        if (error.code !== 'ENOENT') {
          if (primaryError) {
            primaryError.cause = error;
          } else {
            throw error;
          }
        }
      }
    }
  }
}
