// Writes a consistent copy of the evidence database to release/settlement.sqlite.
// The Docker image ships it as SEED_DB_PATH, so a fresh data volume starts with the
// reviewed knowledge base instead of only the built-in research seeds.
//
//   node scripts/prepare-release-db.js [source]   (default: DB_PATH or data/settlement.sqlite)
import {DatabaseSync} from 'node:sqlite';
import {existsSync,mkdirSync,rmSync} from 'node:fs';
import {databasePath} from '../src/runtime-config.js';

const source=databasePath(process.argv[2]);
const target='release/settlement.sqlite';
if(!existsSync(source))throw new Error('Evidence database not found: '+source);
mkdirSync('release',{recursive:true});
rmSync(target,{force:true});
const db=new DatabaseSync(source,{readOnly:true});
try {
  db.exec(`VACUUM INTO '${target.replaceAll("'","''")}'`);
} finally {
  db.close();
}
const copy=new DatabaseSync(target,{readOnly:true});
try {
  const records=copy.prepare('SELECT count(*) AS n FROM records').get().n;
  console.log(JSON.stringify({status:'written',target,records}));
} finally {
  copy.close();
}
