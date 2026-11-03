import {DatabaseSync,backup} from 'node:sqlite';
import {mkdtempSync,realpathSync,rmSync} from 'node:fs';
import {join,dirname,basename} from 'node:path';
import {tmpdir} from 'node:os';
import {configureEnglishDatabase} from './migrations.js';
import {configureIngestion} from './ingestion.js';
import {configureGapWorkflow} from './gap-workflow.js';
export async function dryRunMigration(source) {
 const parent=realpathSync(tmpdir()),scratch=mkdtempSync(join(parent,'northstar-migrate-dry-'));
 let copy;
 let primaryError=null;
 try {
  const original=new DatabaseSync(source,{readOnly:true,timeout:5000});
  try{await backup(original,join(scratch,'copy.sqlite'));}finally{original.close();}
  copy=new DatabaseSync(join(scratch,'copy.sqlite'));
  const versions=()=>copy.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='schema_migrations'").get()?copy.prepare('SELECT version,name FROM schema_migrations ORDER BY version').all():[];
  const report={recordsBefore:copy.prepare('SELECT count(*) AS n FROM records').get().n,migrationsBefore:versions()};
  configureEnglishDatabase(copy);
  configureIngestion(copy);
  configureGapWorkflow(copy);
  report.migrationsAfter=versions();
  if(copy.prepare('PRAGMA integrity_check').all().some(row=>row.integrity_check!=='ok'))throw new Error('Migrated copy failed integrity check');
  report.integrityCheck='ok';
  if(copy.prepare('PRAGMA foreign_key_check').all().length)throw new Error('Migrated copy failed foreign-key check');
  return {dryRun:true,outcome:'applied',report,note:'Read-only online backup includes committed WAL data. Migration ran only on a disposable copy.'};
 }catch(err){
  primaryError=err;
  throw err;
 }finally{
  try{
   copy?.close();
   const resolved=realpathSync(scratch);
   if(dirname(resolved)!==parent||!basename(resolved).startsWith('northstar-migrate-dry-'))throw new Error('Unsafe scratch cleanup path');
   rmSync(resolved,{recursive:true,force:true});
  }catch(cleanupErr){
   if(primaryError){
    primaryError.cause=cleanupErr;
    throw primaryError;
   }
   throw cleanupErr;
  }
 }
}

export const migrationDryRun = dryRunMigration;

