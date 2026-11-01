import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,realpathSync,rmSync,readFileSync,writeFileSync,readdirSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname,basename} from 'node:path';
import {randomBytes} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {openStore} from '../src/store.js';
import {verifyDatabase} from '../src/verification.js';
import {backupEvidenceEncrypted,restoreEvidenceEncryptedDrill} from '../src/evidence-recovery-encrypted.js';

test('encrypted evidence backup preserves WAL data and verifies isolated restore without changing source',async()=>{
 const parent=realpathSync(tmpdir()),root=mkdtempSync(join(parent,'northstar-encrypted-evidence-')),file=join(root,'source.sqlite');
 const store=openStore(file),key=randomBytes(32);
 try {
  store.db.exec('PRAGMA wal_autocheckpoint=0');
  store.review('ohip','reject','fixture-reviewer','Synthetic encrypted recovery test.');
  const before=verifyDatabase(file),saved=await backupEvidenceEncrypted(file,join(root,'backups'),key);
  assert.deepEqual(saved.verification,before);assert.deepEqual(verifyDatabase(file),before);
  assert.deepEqual(readdirSync(saved.directory).sort(),['evidence.enc','manifest.json']);
  assert.equal(readFileSync(join(saved.directory,'evidence.enc')).includes(Buffer.from('Synthetic encrypted recovery test.')),false);
  const restored=await restoreEvidenceEncryptedDrill(saved.directory,join(root,'drills'),key);
  assert.deepEqual(restored.verification,before);assert.deepEqual(verifyDatabase(restored.database),before);
  assert.deepEqual(verifyDatabase(file),before);
  await assert.rejects(()=>restoreEvidenceEncryptedDrill(saved.directory,join(root,'wrong-key'),randomBytes(32)));
  for(const dir of readdirSync(join(root,'wrong-key')))assert.deepEqual(readdirSync(join(root,'wrong-key',dir)),[]);
  const manifestPath=join(saved.directory,'manifest.json'),manifest=JSON.parse(readFileSync(manifestPath));
  writeFileSync(manifestPath,JSON.stringify({...manifest,kind:'encrypted-queue'}));
  await assert.rejects(()=>restoreEvidenceEncryptedDrill(saved.directory,join(root,'wrong-kind'),key),/manifest/);assert.equal(existsSync(join(root,'wrong-kind')),false);
  writeFileSync(manifestPath,JSON.stringify({...manifest,verification:{...manifest.verification,dataDigest:'0'.repeat(64)}}));
  await assert.rejects(()=>restoreEvidenceEncryptedDrill(saved.directory,join(root,'wrong-digest'),key),/differs/);
  for(const dir of readdirSync(join(root,'wrong-digest')))assert.deepEqual(readdirSync(join(root,'wrong-digest',dir)),[]);
  writeFileSync(manifestPath,JSON.stringify(manifest));
  const encrypted=join(saved.directory,'evidence.enc'),bytes=readFileSync(encrypted);bytes[0]^=1;writeFileSync(encrypted,bytes);
  await assert.rejects(()=>restoreEvidenceEncryptedDrill(saved.directory,join(root,'tampered'),key),/checksum/);
  assert.equal(existsSync(join(root,'tampered')),false);
 }finally {
  key.fill(0);store.db.close();const resolved=realpathSync(root);assert.equal(dirname(resolved),parent);assert.ok(basename(resolved).startsWith('northstar-encrypted-evidence-'));rmSync(resolved,{recursive:true,force:true});
 }
});

test('encrypted evidence CLI fails closed without revealing malformed keys',()=>{
 const result=spawnSync(process.execPath,['scripts/evidence-recovery-encrypted.js','backup','missing.sqlite','unused'],{env:{...process.env,EVIDENCE_BACKUP_KEY:'private-fixture-invalid-key'},encoding:'utf8',windowsHide:true});
 assert.equal(result.status,1);assert.equal(result.stdout,'');assert.equal(result.stderr.includes('private-fixture-invalid-key'),false);
});
