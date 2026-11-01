// Only evidence/publication mutations invalidate the public corpus. Trace writes
// do not require re-parsing and hashing the entire knowledge base.
export function createPublicEvidenceSnapshot(db, load) {
  const safeLoad = typeof load === 'function' ? load : () => [];
  if(!db){let revision=0;return ()=>({version:String(++revision),records:safeLoad()});}
  db.exec('CREATE TABLE IF NOT EXISTS evidence_revision(id INTEGER PRIMARY KEY CHECK(id=1),revision INTEGER NOT NULL); INSERT OR IGNORE INTO evidence_revision VALUES(1,0)');
  for(const table of ['records','publications','snapshots','candidate_decisions','suspended_sources','sources']) {
    if(!db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?").get(table))continue;
    for(const action of ['INSERT','UPDATE','DELETE'])db.exec(`CREATE TRIGGER IF NOT EXISTS revision_${table}_${action} AFTER ${action} ON ${table} BEGIN UPDATE evidence_revision SET revision=revision+1 WHERE id=1; END`);
  }
  let version=null,records=null;
  return () => {
    // Read version and rows in the same snapshot, including across worker processes.
    db.exec('BEGIN');
    try {
      const current=new Date().toISOString().slice(0,10)+':'+db.prepare('SELECT revision FROM evidence_revision WHERE id=1').get().revision;
      const next=current!==version?safeLoad():records;
      db.exec('COMMIT');records=next;version=current;return {version,records};
    }catch(error){db.exec('ROLLBACK');throw error;}
  };
}
