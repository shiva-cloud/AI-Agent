// Read-only, consistent snapshot of withheld publication work. No approvals,
// migrations, draft writes or invented staff assignments.
import { DatabaseSync } from 'node:sqlite';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { databasePath } from '../src/runtime-config.js';
import { publishQueue } from '../src/publish-queue.js';

export function publicationBacklog(path = databasePath(), now = new Date()) {
  const db = new DatabaseSync(path, { readOnly: true, timeout: 5000 });
  try {
    db.exec('BEGIN');
    const records = db.prepare('SELECT body FROM records ORDER BY id').all().map(row=>JSON.parse(row.body));
    const sources = db.prepare('SELECT s.*,b.source_id IS NOT NULL AS suspended FROM sources s LEFT JOIN suspended_sources b ON b.source_id=s.id').all();
    const candidates = db.prepare('SELECT id,record_id,status FROM candidates').all();
    const result = publishQueue(db, records, sources, candidates, now);
    db.exec('COMMIT');
    return { ...result, scope: 'Stored-approved records withheld by the public-evidence gate; downstream freshness/geography filters are separate.',
      assignmentNote: 'Owners are unassigned. Suggested roles are routing hints, not actual assignments. Reason counts overlap.' };
  } finally { db.close(); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const args=process.argv.slice(2);
    let path, json=false;
    for(let i=0;i<args.length;i++) {
      if(args[i]==='--json') json=true;
      else if(args[i]==='--db' && args[i+1]) path=args[++i];
      else throw new Error('Usage: node scripts/kb-publication-backlog.js [--db path] [--json]');
    }
    const report=publicationBacklog(databasePath(path));
    if(json) console.log(JSON.stringify(report,null,2));
    else {
      console.log(`Publication backlog as of ${report.asOf}: ${report.total} withheld, ${report.unassigned} unassigned.`);
      console.log(report.assignmentNote);
      for(const [reason,count] of Object.entries(report.reasonCounts)) console.log(`${reason}: ${count}`);
      for(const row of report.rows) console.log(`${row.id}\t${row.state}\t${row.withholdingReasons.join(', ')}\towner: unassigned`);
    }
  } catch(error) { console.error(error.message); process.exitCode=1; }
}
