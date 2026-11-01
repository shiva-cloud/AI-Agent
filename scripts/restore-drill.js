import { restoreDrill } from '../src/recovery.js';
try {
  if(!process.argv[2])throw new Error('Usage: node scripts/restore-drill.js <backup-directory> [drill-output-directory]');
  console.log(JSON.stringify(await restoreDrill(process.argv[2],process.argv[3] || 'recovery-drills'),null,2));
}catch(error){console.error(error.message);process.exitCode=1;}
