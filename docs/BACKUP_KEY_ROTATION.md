# Encrypted backup key rotation

`node scripts/backup-rekey.js <existing-backup-directory> <output-root>` creates a separate encrypted copy of an evidence or queue backup. Supply distinct 32-byte keys as 64 hexadecimal characters in protected `BACKUP_OLD_KEY` and `BACKUP_NEW_KEY` environment settings. Keys are not command arguments or logged. The CLI wipes its key buffers on completion; environment-secret lifecycle remains the operator's responsibility.

The input must be an existing version-1 AES-256-GCM backup with a bounded, valid manifest and regular ciphertext file. The tool streams ciphertext through authenticated decryption and encryption into a new partial encrypted file. It verifies the original ciphertext hash and GCM tag before publishing a final manifest. No plaintext database is written to disk. Plaintext exists transiently in process memory and stream buffers; this is not a guarantee against memory dumps or swap capture.

The original package and its key remain usable. Rotation preserves the original `createdAt`, verification digests and counts, and adds `rekeyedAt`. The destination gets a new random IV and authentication tag. A failed operation removes its output files; an empty uniquely named directory can remain. Process crashes can leave partial encrypted files or a final encrypted file without a manifest. Such directories are not completed backup packages.

After rotation, run the existing isolated restore drill with the new key:

- Evidence: `node scripts/evidence-recovery-encrypted.js restore-drill <new-package> <isolated-output>` with `EVIDENCE_BACKUP_KEY` set to the new key.
- Queue: `node scripts/queue-recovery.js restore-drill <new-package> <isolated-output>` with `QUEUE_BACKUP_KEY` set to the new key.

A successful rekey authenticates encrypted bytes; it does not independently validate the database or authenticate the manifest's editorial metadata. A restore drill verifies schema/data digests and database integrity. Do not retire the old key until required backups have been rotated and restored successfully. Preserve keys for any packages intentionally retained under older keys.

This command does not modify the running backup service's key, delete older packages, change live databases, rotate provider credentials or upload offsite. Automatic retention, coordinated fleet rollout, key-vault integration and actual operational promotion remain separate tasks. The output root should be operator-owned and protected from concurrent untrusted filesystem changes. Tests use disposable fixtures only.
