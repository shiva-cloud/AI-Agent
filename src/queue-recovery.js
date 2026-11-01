import {DatabaseSync,backup} from 'node:sqlite';
import {createCipheriv,createDecipheriv,createHash,randomBytes} from 'node:crypto';
import {createReadStream,createWriteStream,mkdirSync,mkdtempSync,realpathSync,readFileSync,writeFileSync,unlinkSync,lstatSync,renameSync} from 'node:fs';
import {join} from 'node:path';
import {pipeline} from 'node:stream/promises';
import {queueSchemaVersion} from './queue-schema.js';

function keyCheck(key){if(!Buffer.isBuffer(key)||key.length!==32)throw new Error('A 32-byte recovery key is required');}
function regular(path){const stat=lstatSync(path);if(!stat.isFile()||stat.isSymbolicLink())throw new Error('Expected a regular backup file');}
function directory(root,prefix){mkdirSync(root,{recursive:true});return mkdtempSync(join(realpathSync(root),prefix));}
function cleanupSnapshot(path){for(const suffix of ['','-wal','-shm'])try{unlinkSync(path+suffix);}catch(error){if(error.code!=='ENOENT')throw error;}}
async function digest(path){const hash=createHash('sha256');for await(const chunk of createReadStream(path))hash.update(chunk);return hash.digest('hex');}
export function verifyQueue(path) {
  const db=new DatabaseSync(path,{readOnly:true,timeout:5000});
  try {
    db.exec('BEGIN');
    const version=queueSchemaVersion(db);
    if(version<2)throw new Error('Unsupported queue schema for recovery');
    if(db.prepare("SELECT 1 FROM sqlite_master WHERE name='records'").get())throw new Error('Not a queue database');
    if(db.prepare('PRAGMA integrity_check').all().some(row=>row.integrity_check!=='ok'))throw new Error('Queue integrity check failed');
    if(db.prepare('PRAGMA foreign_key_check').all().length)throw new Error('Queue reference check failed');
    const hash=createHash('sha256'),counts={};
    const tables=['job_meta','jobs','job_schedules'];
    if(version>=3)tables.push('schedule_events');
    if(version>=4)tables.push('worker_presence');
    for(const table of tables) {
      const rows=db.prepare(`SELECT * FROM ${table} ORDER BY rowid`).all();counts[table]=rows.length;hash.update(table+JSON.stringify(rows));
    }
    if(!db.prepare('SELECT 1 FROM job_meta WHERE version=2').get())throw new Error('Unsupported queue schema');
    const schema=db.prepare("SELECT type,name,sql FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' ORDER BY type,name").all();
    db.exec('COMMIT');return {counts,dataDigest:hash.digest('hex'),schemaDigest:createHash('sha256').update(JSON.stringify(schema)).digest('hex')};
  }finally{db.close();}
}
export async function backupQueue(source,outputRoot,key) {
  keyCheck(key);regular(source);verifyQueue(source);
  const root=directory(outputRoot,'queue-backup-'),plain=join(root,'snapshot.partial.sqlite'),encrypted=join(root,'queue.enc');
  try {
    const db=new DatabaseSync(source,{readOnly:true,timeout:5000});try{await backup(db,plain);}finally{db.close();}
    const verification=verifyQueue(plain),iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,iv);
    cipher.setAAD(Buffer.from('northstar-queue-backup-v1'));
    await pipeline(createReadStream(plain),cipher,createWriteStream(encrypted,{flags:'wx',mode:0o600}));
    const manifest={version:1,kind:'encrypted-queue',file:'queue.enc',algorithm:'aes-256-gcm',iv:iv.toString('hex'),tag:cipher.getAuthTag().toString('hex'),sha256:await digest(encrypted),verification,createdAt:new Date().toISOString()};
    writeFileSync(join(root,'manifest.json'),JSON.stringify(manifest,null,2)+'\n',{flag:'wx',mode:0o600});
    return {directory:root,verification};
  }finally{cleanupSnapshot(plain);}
}
export async function restoreQueueDrill(backupDirectory,outputRoot,key) {
  keyCheck(key);const source=realpathSync(backupDirectory),manifestPath=join(source,'manifest.json'),encrypted=join(source,'queue.enc');regular(manifestPath);regular(encrypted);
  const manifest=JSON.parse(readFileSync(manifestPath,'utf8'));
  if(manifest.version!==1||manifest.kind!=='encrypted-queue'||manifest.file!=='queue.enc'||manifest.algorithm!=='aes-256-gcm'||!/^([a-f0-9]{24})$/.test(manifest.iv)||!/^([a-f0-9]{32})$/.test(manifest.tag))throw new Error('Invalid queue backup manifest');
  if(await digest(encrypted)!==manifest.sha256)throw new Error('Queue backup checksum mismatch');
  const root=directory(outputRoot,'queue-drill-'),partial=join(root,'restore.partial.sqlite'),target=join(root,'queue.sqlite');
  try {
    const decipher=createDecipheriv('aes-256-gcm',key,Buffer.from(manifest.iv,'hex'));decipher.setAAD(Buffer.from('northstar-queue-backup-v1'));decipher.setAuthTag(Buffer.from(manifest.tag,'hex'));
    await pipeline(createReadStream(encrypted),decipher,createWriteStream(partial,{flags:'wx',mode:0o600}));
    const verification=verifyQueue(partial);
    if(verification.dataDigest!==manifest.verification?.dataDigest||verification.schemaDigest!==manifest.verification?.schemaDigest)throw new Error('Restored queue differs from backup');
    renameSync(partial,target);
    const report={status:'passed',directory:root,database:target,verification,scope:'Isolated restore only. No worker was started and no active queue was replaced.'};
    writeFileSync(join(root,'report.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx',mode:0o600});return report;
  }finally{cleanupSnapshot(partial);}
}
