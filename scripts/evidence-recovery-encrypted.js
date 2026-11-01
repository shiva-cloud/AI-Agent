import {backupEvidenceEncrypted,restoreEvidenceEncryptedDrill} from '../src/evidence-recovery-encrypted.js';
try {
  const [mode,source,output]=process.argv.slice(2),secret=process.env.EVIDENCE_BACKUP_KEY;
  if(!['backup','restore-drill'].includes(mode)||!source||!output)throw new Error('Usage: evidence-recovery-encrypted.js backup|restore-drill <source> <output-directory>');
  if(typeof secret!=='string'||! /^[a-fA-F0-9]{64}$/.test(secret))throw new Error('EVIDENCE_BACKUP_KEY must contain 64 hexadecimal characters');
  const key=Buffer.from(secret,'hex');
  try {const result=mode==='backup'?await backupEvidenceEncrypted(source,output,key):await restoreEvidenceEncryptedDrill(source,output,key);console.log(JSON.stringify(result,null,2));}finally{key.fill(0);}
}catch{console.error('Evidence recovery failed. Check arguments, key, backup integrity and filesystem access.');process.exitCode=1;}
