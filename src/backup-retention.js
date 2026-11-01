import { createDecipheriv, createHash } from 'node:crypto';
import { createReadStream, lstatSync, readFileSync, readdirSync, realpathSync, unlinkSync, rmdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { Transform, Writable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

export function validateRetention({ keep = 7, maxAgeDays = 30 } = {}) {
  if (!Number.isInteger(keep) || keep < 2 || keep > 1000 || !Number.isInteger(maxAgeDays) || maxAgeDays < 1 || maxAgeDays > 36500) throw new Error('Invalid backup retention policy');
  return { keep, maxAgeDays };
}

// Only run in an operator-owned root with a single retention writer.
export async function retainBackups(rootPath, { kind, key, keep = 7, maxAgeDays = 30, apply = false, now = Date.now() } = {}) {
  validateRetention({ keep, maxAgeDays });
  if (!['queue', 'evidence'].includes(kind) || !Buffer.isBuffer(key) || key.length !== 32 || typeof apply !== 'boolean' || !Number.isSafeInteger(now) || now < 0) throw new Error('Invalid retention configuration');
  const root = realpathSync(rootPath), names = readdirSync(root);
  if (names.length > 10000) throw new Error('Retention root exceeds entry limit');
  const regular = path => { const stat = lstatSync(path); if (!stat.isFile() || stat.isSymbolicLink() || stat.nlink !== 1) throw new Error('Unsafe backup file'); return stat; };
  async function inspect(name) {
    const dir = join(root, name), stat = lstatSync(dir);
    if (!stat.isDirectory() || stat.isSymbolicLink() || dirname(realpathSync(dir)) !== root) throw new Error('Unsafe backup directory');
    const files = readdirSync(dir).sort();
    if (JSON.stringify(files) !== JSON.stringify([`${kind}.enc`, 'manifest.json'].sort())) throw new Error('Incomplete or unrecognized package');
    const manifestPath = join(dir, 'manifest.json'), encrypted = join(dir, `${kind}.enc`);
    if (regular(manifestPath).size > 65536) throw new Error('Oversized manifest');
    regular(encrypted);
    const bytes = readFileSync(manifestPath), manifest = JSON.parse(bytes);
    if (manifest?.version !== 1 || manifest.kind !== `encrypted-${kind}` || manifest.file !== `${kind}.enc` || manifest.algorithm !== 'aes-256-gcm' ||
        !/^[a-f0-9]{24}$/.test(manifest.iv) || !/^[a-f0-9]{32}$/.test(manifest.tag) || !/^[a-f0-9]{64}$/.test(manifest.sha256) ||
        !/^[a-f0-9]{64}$/.test(manifest.verification?.dataDigest) || !/^[a-f0-9]{64}$/.test(manifest.verification?.schemaDigest)) throw new Error('Invalid manifest');
    const created = Date.parse(manifest.createdAt), rotated = manifest.rekeyedAt === undefined ? created : Date.parse(manifest.rekeyedAt);
    if (!Number.isFinite(created) || !Number.isFinite(rotated) || created > now || rotated > now) throw new Error('Invalid package date');
    const hash = createHash('sha256'), decrypt = createDecipheriv('aes-256-gcm', key, Buffer.from(manifest.iv, 'hex'));
    decrypt.setAAD(Buffer.from(`northstar-${kind}-backup-v1`)); decrypt.setAuthTag(Buffer.from(manifest.tag, 'hex'));
    await pipeline(createReadStream(encrypted), new Transform({ transform(chunk, encoding, callback) { hash.update(chunk); callback(null, chunk); } }), decrypt,
      new Writable({ write(chunk, encoding, callback) { callback(); } }));
    if (hash.digest('hex') !== manifest.sha256) throw new Error('Checksum mismatch');
    return { name, ageFrom: Math.max(created, rotated), fingerprint: createHash('sha256').update(bytes).update(manifest.sha256).digest('hex') };
  }
  const valid = [], skipped = [];
  for (const name of names.sort()) {
    if (!name.startsWith(`${kind}-backup-`) && !name.startsWith(`${kind}-rekey-`)) continue;
    try { valid.push(await inspect(name)); } catch { skipped.push(name); }
  }
  valid.sort((a, b) => b.ageFrom - a.ageFrom || a.name.localeCompare(b.name));
  const cutoff = now - maxAgeDays * 86400000;
  const candidates = valid.filter((entry, index) => index >= keep && entry.ageFrom < cutoff);
  const result = { mode: apply ? 'apply' : 'dry-run', kind, authenticated: valid.length, kept: valid.length - candidates.length, candidates: candidates.map(entry => entry.name), deleted: [], skipped };
  if (!apply || !candidates.length) return result;
  // Re-authenticate every package before any deletion so changed keepers abort the run.
  for (const entry of valid) {
    const current = await inspect(entry.name);
    if (current.fingerprint !== entry.fingerprint) throw new Error('Backup changed during retention');
  }
  for (const entry of candidates) {
    const dir = join(root, entry.name);
    // No recursive deletion. Recheck containment and exact file set at mutation time.
    const current = await inspect(entry.name);
    if (current.fingerprint !== entry.fingerprint) throw new Error('Backup changed during retention');
    unlinkSync(join(dir, `${kind}.enc`));
    unlinkSync(join(dir, 'manifest.json'));
    rmdirSync(dir);
    result.deleted.push(entry.name);
  }
  return result;
}
