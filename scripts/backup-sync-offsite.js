// Off-Site Backup Sync CLI Utility (Rec 95)
import { syncEncryptedBackupOffsite } from '../src/offsite-backup-sync.js';

try {
  const result = await syncEncryptedBackupOffsite();
  console.log(JSON.stringify(result, null, 2));
} catch (err) {
  console.error('Offsite sync failed:', err.message);
  process.exit(1);
}
