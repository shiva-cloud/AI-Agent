import { openStore } from '../src/store.js';
import {databasePath} from '../src/runtime-config.js';
let store;
try {
  store=openStore(databasePath(process.argv[2]));
  console.log(JSON.stringify({migrations:store.db.prepare('SELECT * FROM schema_migrations ORDER BY version').all(),records:store.records().length,languages:[...new Set(store.records().map(r=>r.language))]},null,2));
} catch(error){console.error(error.message);process.exitCode=1;}
finally {store?.db.close();}
