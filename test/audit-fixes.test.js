import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,realpathSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname,basename} from 'node:path';
import {spawnSync} from 'node:child_process';
import {openStore} from '../src/store.js';
import {answer,parse} from '../src/engine.js';
import {seeds} from '../src/knowledge.js';
import {dryRunMigration} from '../src/migration-dry-run.js';

test('explicit unsupported destinations cannot inherit a selected Canadian city',()=>{
  for(const question of ['Can I get a SIN in Paris?','Dubai library services','Library near Nairobi','SIN in xyzville','Moving to Berlin, how do I get a SIN?','Library in Toronto or near Nairobi']) {
    const result=answer({question,city:'Toronto'},seeds);
    assert.equal(result.status,'clarification',question);assert.equal(result.claims.length,0);
  }
  for(const question of ['SIN in person','Library in Toronto','SIN in Canada','SIN in the first week']) {
    assert.notEqual(answer({question,city:'Toronto'},seeds).status,'clarification',question);
  }
});

test('library internet access is distinct from commercial internet service',()=>{
  assert.deepEqual(parse({question:'Can I use internet at a Toronto library?'}).intents,['community']);
  assert.deepEqual(parse({question:'Toronto library and home internet plans'}).intents,['community','telecom']);
});

test('snapshot-backed evidence can be withdrawn and reapproved with provenance checks',()=>{
  const store=openStore(':memory:');try {
    const review={reviewer:'Fixture reviewer',note:'Synthetic fixture review only.',tier:'A'};
    const checkedAt=new Date().toISOString().slice(0,10),expiresAt=new Date(Date.now()+86400000*7).toISOString().slice(0,10);
    store.ingestion.permitSource('seed-sin-route',review);
    const candidate=store.ingestion.ingest({sourceId:'seed-sin-route',requestKey:'audit-fixture',content:seeds[0].quote,record:{...seeds[0],status:'pending',checkedAt,expiresAt}});
    store.ingestion.decide(candidate.id,{...review,decision:'approve'});
    store.review('sin-route','rollback',review.reviewer,review.note);
    assert.equal(store.review('sin-route','approve',review.reviewer,review.note).status,'approved');
    store.ingestion.suspendSource('seed-sin-route',review);
    assert.throws(()=>store.review('sin-route','approve',review.reviewer,review.note),/suspended/);
  }finally{store.db.close();}
});

test('failed gap insertion rolls back the trace with it',()=>{
  const store=openStore(':memory:');try {
    const result=answer({question:'Indian groceries in Brampton'},seeds);
    store.db.exec("CREATE TRIGGER fail_gap BEFORE INSERT ON gaps BEGIN SELECT RAISE(ABORT,'fixture failure'); END;");
    assert.throws(()=>store.log(result),/fixture failure/);
    assert.equal(store.db.prepare('SELECT count(*) AS n FROM traces').get().n,0);
    assert.equal(store.db.prepare('SELECT count(*) AS n FROM gaps').get().n,0);
  }finally{store.db.close();}
});

test('migration rehearsal captures WAL and upgrades legacy copies without modifying originals',async()=>{
  const parent=realpathSync(tmpdir()),root=mkdtempSync(join(parent,'northstar-fixes-')),file=join(root,'fixture.sqlite');
  const store=openStore(file);
  try {
    store.db.exec('PRAGMA wal_autocheckpoint=0');
    store.db.exec('DROP TABLE schema_migrations');
    const extra={...seeds[0],id:'wal-only-fixture'};
    store.db.prepare('INSERT INTO records VALUES (?,?)').run(extra.id,JSON.stringify(extra));
    const before=store.records();
    const result=await dryRunMigration(file);
    assert.equal(result.report.recordsBefore,seeds.length+1);
    assert.equal(result.report.migrationsBefore.length,0);
    assert.equal(result.report.migrationsAfter.length,7);
    assert.equal(result.report.integrityCheck,'ok');
    assert.deepEqual(store.records(),before);
    assert.equal(store.db.prepare("SELECT count(*) AS n FROM sqlite_master WHERE name='schema_migrations'").get().n,0);
    const cli=spawnSync(process.execPath,['scripts/migrate-dry-run.js',join(root,'missing.sqlite')],{encoding:'utf8'});
    assert.notEqual(cli.status,0);assert.match(cli.stderr,/failed/);
  }finally {
    store.db.close();const resolved=realpathSync(root);
    assert.equal(dirname(resolved),parent);assert.ok(basename(resolved).startsWith('northstar-fixes-'));
    rmSync(resolved,{recursive:true,force:true});
  }
});
