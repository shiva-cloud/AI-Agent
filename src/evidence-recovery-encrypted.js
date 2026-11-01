import {DatabaseSync,backup} from 'node:sqlite';
import {createCipheriv,createDecipheriv,createHash,randomBytes} from 'node:crypto';
import {createReadStream,createWriteStream,mkdirSync,mkdtempSync,realpathSync,readFileSync,writeFileSync,unlinkSync,lstatSync,renameSync} from 'node:fs';
import {join} from 'node:path';
import {pipeline} from 'node:stream/promises';
import {verifyDatabase} from './verification.js';

function keyCheck(key){if(!Buffer.isBuffer(key)||key.length!==32)throw new Error('A 32-byte recovery key is required');}
function regular(path){if(typeof path!=='string'||!path.trim())throw new Error('Expected a regular backup file');const stat=lstatSync(path);if(!stat.isFile()||stat.isSymbolicLink())throw new Error('Expected a regular backup file');}
function directory(root,prefix){if(typeof root!=='string'||!root.trim())throw new Error('Expected a directory path');mkdirSync(root,{recursive:true});return mkdtempSync(join(realpathSync(root),prefix));}
function cleanupSnapshot(path){for(const suffix of ['','-wal','-shm'])try{unlinkSync(path+suffix);}catch(error){if(error.code!=='ENOENT')throw error;}}
async function digest(path){const hash=createHash('sha256');for await(const chunk of createReadStream(path))hash.update(chunk);return hash.digest('hex');}
export async function backupEvidenceEncrypted(source,outputRoot,key) {
  keyCheck(key);regular(source);verifyDatabase(source);
  const root=directory(outputRoot,'evidence-backup-'),plain=join(root,'snapshot.partial.sqlite'),encrypted=join(root,'evidence.enc');
  try {
    const db=new DatabaseSync(source,{readOnly:true,timeout:5000});try{await backup(db,plain);}finally{db.close();}
    const verification=verifyDatabase(plain),iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,iv);
    cipher.setAAD(Buffer.from('northstar-evidence-backup-v1'));
    await pipeline(createReadStream(plain),cipher,createWriteStream(encrypted,{flags:'wx',mode:0o600}));
    const manifest={version:1,kind:'encrypted-evidence',file:'evidence.enc',algorithm:'aes-256-gcm',iv:iv.toString('hex'),tag:cipher.getAuthTag().toString('hex'),sha256:await digest(encrypted),verification,createdAt:new Date().toISOString()};
    writeFileSync(join(root,'manifest.json'),JSON.stringify(manifest,null,2)+'\n',{flag:'wx',mode:0o600});
    return {directory:root,verification};
  }finally{cleanupSnapshot(plain);}
}
export async function restoreEvidenceEncryptedDrill(backupDirectory,outputRoot,key) {
  keyCheck(key);const source=realpathSync(backupDirectory),manifestPath=join(source,'manifest.json'),encrypted=join(source,'evidence.enc');regular(manifestPath);regular(encrypted);
  const manifest=JSON.parse(readFileSync(manifestPath,'utf8'));
  if(manifest.version!==1||manifest.kind!=='encrypted-evidence'||manifest.file!=='evidence.enc'||manifest.algorithm!=='aes-256-gcm'||!/^([a-f0-9]{24})$/.test(manifest.iv)||!/^([a-f0-9]{32})$/.test(manifest.tag))throw new Error('Invalid evidence backup manifest');
  if(await digest(encrypted)!==manifest.sha256)throw new Error('Evidence backup checksum mismatch');
  const root=directory(outputRoot,'evidence-drill-'),partial=join(root,'restore.partial.sqlite'),target=join(root,'evidence.sqlite');
  try {
    const decipher=createDecipheriv('aes-256-gcm',key,Buffer.from(manifest.iv,'hex'));decipher.setAAD(Buffer.from('northstar-evidence-backup-v1'));decipher.setAuthTag(Buffer.from(manifest.tag,'hex'));
    await pipeline(createReadStream(encrypted),decipher,createWriteStream(partial,{flags:'wx',mode:0o600}));
    const verification=verifyDatabase(partial);
    if(verification.dataDigest!==manifest.verification?.dataDigest||verification.schemaDigest!==manifest.verification?.schemaDigest)throw new Error('Restored evidence differs from backup');
    renameSync(partial,target);
    const report={status:'passed',directory:root,database:target,verification,scope:'Isolated restore only. No service was started and no active database was replaced.'};
    writeFileSync(join(root,'report.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx',mode:0o600});return report;
  }finally{cleanupSnapshot(partial);}
}
