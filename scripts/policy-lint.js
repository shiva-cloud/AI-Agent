// Read-only audit. Never creates a database, seeds records or applies migrations.
import {DatabaseSync} from 'node:sqlite';
import {databasePath} from '../src/runtime-config.js';
import { lintEvidence } from '../src/evidence-policy.js';
let db;
try {
  db=new DatabaseSync(databasePath(process.argv[2]),{readOnly:true,timeout:5000});
  db.exec('BEGIN');
  const sources=db.prepare('SELECT s.*,EXISTS(SELECT 1 FROM suspended_sources b WHERE b.source_id=s.id) AS suspended FROM sources s').all();
  const records=db.prepare('SELECT body FROM records').all().map(row=>JSON.parse(row.body));
  const report = lintEvidence(sources, records);
  db.exec('COMMIT');
  const byCode = {};
  for (const warning of report.warnings) byCode[warning.code] = (byCode[warning.code] || 0) + 1;
  console.log(JSON.stringify({ checkedAt: report.checkedAt, count: report.count, byCode, warnings: report.warnings }, null, 2));
  process.exitCode = report.warnings.some(w => w.code === 'evidence_expired') ? 1 : 0;
} catch(error){console.error(error.message);process.exitCode=1;}
finally {db?.close();}
