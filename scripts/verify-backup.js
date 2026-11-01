import { verifyBackup } from '../src/recovery.js';
try {
  if(!process.argv[2])throw new Error('Usage: node scripts/verify-backup.js <backup-directory>');
  const {directory,verification}=await verifyBackup(process.argv[2]);
  console.log(JSON.stringify({directory,status:'verified',verification},null,2));
}catch(error){console.error(error.message);process.exitCode=1;}
