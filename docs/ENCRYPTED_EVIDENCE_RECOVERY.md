# Encrypted evidence database recovery

The explicit encrypted recovery commands supplement the existing plaintext backup commands. Existing backups are not automatically converted or removed.

Provide `EVIDENCE_BACKUP_KEY` through a protected environment mechanism: 64 hexadecimal characters representing a cryptographically random 32-byte key. Keep it separate from the package. The tool does not generate, persist or print a key. The command's key Buffer is cleared after use; the process environment is not a secure credential vault.

```text
node scripts/evidence-recovery-encrypted.js backup <existing-evidence.sqlite> <output-directory>
node scripts/evidence-recovery-encrypted.js restore-drill <backup-package-directory> <output-directory>
```

Backup reads the source with SQLite online backup so committed WAL writes are included. It verifies the isolated snapshot, encrypts it using AES-256-GCM with a random 12-byte nonce and evidence-specific authenticated format label, and writes `evidence.enc` and `manifest.json` into a unique directory. The manifest contains version, cipher parameters, ciphertext checksum, verification counts/digests and creation time; it contains no key. Queue and evidence packages have distinct kinds and authenticated labels.

Restore validates the package, decrypts into a new isolated directory, verifies database structure, references, language guards, provenance hashes and data/schema digests, then creates `evidence.sqlite` and a report. It does not replace an active database, start a service, publish records or approve evidence. A passed drill proves restoration of the stored data, not factual correctness or source approval.

Wrong keys, changed ciphertext, package-kind mismatch and mismatched restored digests fail. Failed decrypted partial files and their SQLite sidecars are removed. The CLI emits a generic failure with exit code 1 and no secret details.

Temporary plaintext snapshots exist while backup or verification runs. Normal completion/failure removes them, but abrupt process/OS failure can leave temporary files. Successful drills intentionally retain plaintext for inspection. Use restricted encrypted local storage and manage drill retention. Deletion does not guarantee forensic erasure. Manifests disclose aggregate counts and are not separately signed; ciphertext authentication supplies cryptographic tamper detection.

Operational scheduling, encryption-key rotation, backup retention, offsite transport and a production promotion procedure remain deployment tasks. Losing the key makes its packages unrecoverable. No real key or live backup schedule was configured by this implementation.

Tests use temporary databases and random fixture keys. They cover uncheckpointed WAL evidence, preserved audit history and source digest, isolated restore, completed-package plaintext cleanup, failed-restore cleanup, wrong keys, altered ciphertext, altered digests and sanitized CLI errors.
