import {acquireBackupOwner} from '../src/backup-owner.js';
import {retainBackups,validateRetention} from '../src/backup-retention.js';
import {resolve} from 'node:path';
import {existsSync,statSync} from 'node:fs';
import {backupEvidenceEncrypted} from '../src/evidence-recovery-encrypted.js';
import {backupQueue} from '../src/queue-recovery.js';
import {runBackupService} from '../src/backup-service.js';

const controller=new AbortController(),stop=()=>controller.abort();let key,owner;
const outputFailed=()=>{process.exitCode=1;controller.abort();};
try {
 const [kind,source,output,interval='86400000',...extra]=process.argv.slice(2);
 const secret=kind==='evidence'?process.env.EVIDENCE_BACKUP_KEY:process.env.QUEUE_BACKUP_KEY;
 if(extra.length||!Number.isSafeInteger(Number(interval))||Number(interval)<60000||Number(interval)>604800000||!['evidence','queue'].includes(kind)||!source||!output||!existsSync(source)||!statSync(source).isFile()||typeof secret!=='string'||! /^[a-fA-F0-9]{64}$/.test(secret))throw new Error('Invalid backup configuration');
 const sourcePath=resolve(source),outputPath=resolve(output);
 const enabled=process.env.BACKUP_RETENTION_KEEP!==undefined||process.env.BACKUP_RETENTION_DAYS!==undefined;
 const policy=enabled?validateRetention({keep:Number(process.env.BACKUP_RETENTION_KEEP),maxAgeDays:Number(process.env.BACKUP_RETENTION_DAYS)}):null;
 if(sourcePath===outputPath)throw new Error('Separate output directory required');
 key=Buffer.from(secret,'hex');process.stdout.on('error',outputFailed);process.on('SIGINT',stop);process.on('SIGTERM',stop);
 owner=acquireBackupOwner(outputPath);
 const backup=kind==='evidence'?backupEvidenceEncrypted:backupQueue;
 await runBackupService({signal:controller.signal,intervalMs:Number(interval),backup:()=>backup(sourcePath,outputPath,key),retention:policy?()=>retainBackups(outputPath,{kind,key,...policy,apply:true}):undefined,onEvent:event=>new Promise((resolve,reject)=>process.stdout.write(JSON.stringify({...event,kind,at:new Date().toISOString()})+'\n',error=>error?reject(error):resolve()))});
}catch{console.error('Backup service failed. Check kind, source, output ownership, interval and protected key configuration.');process.exitCode=1;}
finally{process.stdout.off('error',outputFailed);process.off('SIGINT',stop);process.off('SIGTERM',stop);try{owner?.release();}finally{key?.fill(0);}}
