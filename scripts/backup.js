import { createBackup } from '../src/recovery.js';
import {databasePath} from '../src/runtime-config.js';
try {console.log(JSON.stringify(await createBackup(databasePath(process.argv[2]),process.argv[3] || 'backups'),null,2));}
catch(error){console.error(error.message);process.exitCode=1;}
