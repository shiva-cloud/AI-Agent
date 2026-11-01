import {acquireBackupOwner} from '../src/backup-owner.js';
import { retainBackups, validateRetention } from '../src/backup-retention.js';
let key,owner;
try {
  const [kind, root, keep = '7', days = '30', mode = '--dry-run', ...extra] = process.argv.slice(2);
  const secret = kind === 'evidence' ? process.env.EVIDENCE_BACKUP_KEY : process.env.QUEUE_BACKUP_KEY;
  if (!['queue','evidence'].includes(kind) || !root || extra.length || !['--dry-run', '--apply'].includes(mode) || !/^[a-fA-F0-9]{64}$/.test(secret ?? '')) throw new Error('Invalid configuration');
  const policy = validateRetention({keep:Number(keep),maxAgeDays:Number(days)});
  key = Buffer.from(secret, 'hex');
  if(mode === '--apply') owner = acquireBackupOwner(root);
  console.log(JSON.stringify(await retainBackups(root, { kind, key, ...policy, apply: mode === '--apply' }), null, 2));
} catch { console.error('Backup retention failed. Check policy, protected key, package integrity and filesystem access.'); process.exitCode = 1; }
finally { try { owner?.release(); } finally { key?.fill(0); } }
