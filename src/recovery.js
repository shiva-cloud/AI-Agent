import { DatabaseSync, backup } from 'node:sqlite';
import { createHash } from 'node:crypto';
import { createReadStream, mkdirSync, mkdtempSync, readFileSync, writeFileSync, realpathSync, lstatSync, copyFileSync, constants, openSync, fsyncSync, closeSync, renameSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';
import { verifyDatabase } from './verification.js';
import { answer } from './engine.js';

async function fileHash(path){const hash=createHash('sha256');for await(const chunk of createReadStream(path))hash.update(chunk);return hash.digest('hex');}
function newDirectory(root,prefix){mkdirSync(root,{recursive:true});return mkdtempSync(join(realpathSync(root),prefix));}
function durableJson(path,value){const temporary=path+'.partial',fd=openSync(temporary,'wx',0o600);try{writeFileSync(fd,JSON.stringify(value,null,2)+'\n');fsyncSync(fd);}finally{closeSync(fd);}renameSync(temporary,path);}
function regularFile(path){if(!lstatSync(path).isFile() || lstatSync(path).isSymbolicLink())throw new Error('Backup inputs must be regular files, not symbolic links');}

export async function createBackup(sourcePath='data/settlement.sqlite',outputRoot='backups') {
  regularFile(sourcePath);
  const source=realpathSync(sourcePath),directory=newDirectory(resolve(outputRoot),'backup-'),target=join(directory,'database.sqlite');
  const db=new DatabaseSync(source,{readOnly:true,timeout:5000});
  try {await backup(db,target);}finally{db.close();}
  const verification=verifyDatabase(target),checksum=await fileHash(target);
  const manifest={formatVersion:1,status:'verified',createdAt:new Date().toISOString(),nodeVersion:process.version,sourceName:basename(source),databaseFile:'database.sqlite',sha256:checksum,verification};
  durableJson(join(directory,'manifest.json'),manifest);
  return {directory,...manifest};
}

export async function verifyBackup(directory) {
  const root=realpathSync(directory),manifestPath=join(root,'manifest.json'),databasePath=join(root,'database.sqlite');
  regularFile(manifestPath);regularFile(databasePath);
  const manifest=JSON.parse(readFileSync(manifestPath,'utf8'));
  if(manifest.formatVersion!==1 || manifest.status!=='verified' || manifest.databaseFile!=='database.sqlite' || !/^[a-f0-9]{64}$/.test(manifest.sha256))throw new Error('Invalid or incomplete backup manifest');
  if(await fileHash(databasePath)!==manifest.sha256)throw new Error('Backup file checksum mismatch');
  const verification=verifyDatabase(databasePath);
  if(verification.dataDigest!==manifest.verification?.dataDigest || verification.schemaDigest!==manifest.verification?.schemaDigest)throw new Error('Backup content or schema differs from the verified manifest');
  return {directory:root,manifest,verification,databasePath};
}

export async function restoreDrill(backupDirectory,outputRoot='recovery-drills') {
  const checked=await verifyBackup(backupDirectory);
  const directory=newDirectory(resolve(outputRoot),'drill-'),target=join(directory,'database.sqlite');
  copyFileSync(checked.databasePath,target,constants.COPYFILE_EXCL);
  if(await fileHash(target)!==checked.manifest.sha256)throw new Error('Restored file checksum mismatch');
  const verification=verifyDatabase(target);
  if(verification.dataDigest!==checked.verification.dataDigest || verification.schemaDigest!==checked.verification.schemaDigest)throw new Error('Restored logical state differs from backup');
  const db=new DatabaseSync(target,{readOnly:true});let smoke;
  try {
    const records=db.prepare('SELECT body FROM records ORDER BY id').all().map(r=>JSON.parse(r.body));
    smoke=['How do I apply for a SIN?','Toronto library services','Vancouver health coverage'].map(question=>{
      const result=answer({question},records);
      if(result.claims.some(c=>!result.sources.some(s=>s.id===c.evidenceId)))throw new Error('Restored answer has an unlinked claim');
      return {status:result.status,claimCount:result.claims.length,citationsLinked:true};
    });
  } finally {db.close();}
  const report={status:'passed',completedAt:new Date().toISOString(),sourceBackup:checked.directory,restoredDatabase:target,verification,smoke,
    scope:'Isolated restore with read-only verification and deterministic answer checks. The working database was not replaced. This does not test external providers, network services or failover.'};
  durableJson(join(directory,'report.json'),report);
  // Human-readable running log next to the drills, so a drill date and outcome
  // live in a reviewable artifact rather than only in terminal history.
  const logPath=join(resolve(outputRoot),'drill-log.md');
  const line=`| ${report.completedAt} | ${basename(checked.directory)} | ${report.status} | ${smoke.map(s=>`${s.status}/${s.claimCount} claims`).join(', ')} | ${verification.schemaDigest.slice(0,12)} |`;
  let log='';
  try {log=readFileSync(logPath,'utf8');} catch {}
  if(!log.includes('| When |')) log='| When | Backup | Outcome | Smoke answers | Schema digest |\n| --- | --- | --- | --- | --- |\n';
  writeFileSync(logPath,log+line+'\n');
  return {directory,...report,logPath};
}
