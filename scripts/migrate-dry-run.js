import {dryRunMigration} from '../src/migration-dry-run.js';
import {databasePath} from '../src/runtime-config.js';
try { console.log(JSON.stringify(await dryRunMigration(databasePath(process.argv[2])),null,2)); }
catch(error){console.error(JSON.stringify({dryRun:true,outcome:'failed',error:error.message}));process.exitCode=1;}
