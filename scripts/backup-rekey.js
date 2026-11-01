import { rekeyBackup } from '../src/backup-rekey.js';

let oldKey, newKey;
try {
  const [source, output, ...extra] = process.argv.slice(2);
  if (!source || !output || extra.length || !/^[a-fA-F0-9]{64}$/.test(process.env.BACKUP_OLD_KEY ?? '') || !/^[a-fA-F0-9]{64}$/.test(process.env.BACKUP_NEW_KEY ?? '')) throw new Error('Invalid configuration');
  oldKey = Buffer.from(process.env.BACKUP_OLD_KEY, 'hex'); newKey = Buffer.from(process.env.BACKUP_NEW_KEY, 'hex');
  console.log(JSON.stringify(await rekeyBackup(source, output, oldKey, newKey), null, 2));
} catch {
  console.error('Backup key rotation failed. Check paths, distinct protected keys and backup integrity.');
  process.exitCode = 1;
} finally { oldKey?.fill(0); newKey?.fill(0); }
