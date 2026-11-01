import { verifyDatabase } from '../src/verification.js';
import {databasePath} from '../src/runtime-config.js';
try {console.log(JSON.stringify(verifyDatabase(databasePath(process.argv[2])),null,2));}
catch(error){console.error(error.message);process.exitCode=1;}
