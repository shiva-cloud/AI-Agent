import {DatabaseSync} from 'node:sqlite';
import {createHash} from 'node:crypto';
import {assertEnglishData,assertEnglishRecord} from './language.js';
import {JobPolicyDenied} from './job-policy.js';
import {openEvidenceIndex} from './evidence-index.js';

// Opens existing evidence read-only. No migration, seeds, fetch or publication.
export function evidenceWorkerOptions(path, options = {}) {
  const safeOptions = (options && typeof options === 'object') ? options : {};
  const { indexPath } = safeOptions;
  if(typeof path!=='string'||!path.trim()||path===':memory:')throw new Error('An existing evidence database path is required');
  const read=action=>{
    const db=new DatabaseSync(path,{readOnly:true,timeout:5000});
    try{db.exec('BEGIN');const result=action(db);db.exec('COMMIT');return result;}finally{db.close();}
  };
  const target=(db,targetId)=>db.prepare(`SELECT p.*,s.url,s.language,s.policy,
    EXISTS(SELECT 1 FROM suspended_sources x WHERE x.source_id=s.id) AS suspended
    FROM snapshots p JOIN sources s ON s.id=p.source_id WHERE p.id=?`).get(targetId);
  const permitted=row=>!!row&&row.language==='en'&&row.policy==='manual_permitted'&&!row.suspended;
  return {
    authorize(request = {}) {
      const safeReq = (request && typeof request === 'object') ? request : {};
      const { kind, targetId, signal } = safeReq;
      signal?.throwIfAborted();
      if(kind==='reindex')return !!indexPath&&targetId==='all';
      if(kind!=='verify_snapshot')return false;
      return read(db=>permitted(target(db,targetId)));
    },
    handlers:{
      reindex(params = {}) {
        const safeP = (params && typeof params === 'object') ? params : {};
        const { targetId, signal } = safeP;
        if(!indexPath||targetId!=='all')throw new JobPolicyDenied();
        signal?.throwIfAborted();
        return read(db=>{
          const records=db.prepare('SELECT body FROM records ORDER BY id').all().map(row=>JSON.parse(row.body));
          signal?.throwIfAborted();const index=openEvidenceIndex(indexPath);
          try{return index.rebuild(records);}finally{index.close();}
        });
      },
      verify_snapshot(params = {}) {
        const safeP = (params && typeof params === 'object') ? params : {};
        const { targetId, signal } = safeP;
        signal?.throwIfAborted();
        return read(db=>{
          // Recheck inside the verification snapshot, even if authorization was
          // granted earlier on another connection. Revocation must fail closed.
          const snapshot=target(db,targetId);if(!permitted(snapshot))throw new JobPolicyDenied();
          if(snapshot.kind!=='manual_excerpt'||snapshot.content.length>8000||snapshot.content.length<10)throw new Error('Invalid snapshot structure');
          assertEnglishData(snapshot);
          if(createHash('sha256').update(snapshot.content).digest('hex')!==snapshot.content_hash)throw new Error('Snapshot integrity failure');
          let linked=0;
          for(const table of ['candidates','publications']) {
            for(const row of db.prepare(`SELECT record_id,body FROM ${table} WHERE snapshot_id=?`).iterate(targetId)) {
              signal?.throwIfAborted();const record=JSON.parse(row.body);assertEnglishRecord(record);
              if(record.id!==row.record_id||record.url!==snapshot.url||!snapshot.content.includes(record.quote))throw new Error('Snapshot evidence linkage failure');
              if(table==='publications'&&(record.snapshotId!==targetId||record.sourceId!==snapshot.source_id))throw new Error('Publication provenance failure');
              linked++;
            }
          }
          return {snapshotId:targetId,status:'verified',linkedRecords:linked};
        });
      }
    }
  };
}
