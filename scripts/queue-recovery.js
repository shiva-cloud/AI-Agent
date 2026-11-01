import {backupQueue,restoreQueueDrill} from '../src/queue-recovery.js';
try {
  const [mode,source,output]=process.argv.slice(2),secret=process.env.QUEUE_BACKUP_KEY;
  if(!['backup','restore-drill'].includes(mode)||!source||!output)throw new Error('Usage: queue-recovery.js backup|restore-drill <source> <output-directory>');
  if(typeof secret!=='string'||! /^[a-fA-F0-9]{64}$/.test(secret))throw new Error('QUEUE_BACKUP_KEY must contain 64 hexadecimal characters');
  const key=Buffer.from(secret,'hex');
  try {const result=mode==='backup'?await backupQueue(source,output,key):await restoreQueueDrill(source,output,key);console.log(JSON.stringify(result,null,2));}finally{key.fill(0);}
}catch{console.error('Queue recovery failed. Check arguments, key, backup integrity and filesystem access.');process.exitCode=1;}
