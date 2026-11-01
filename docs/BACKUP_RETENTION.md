# Optional encrypted backup retention

Retention is disabled by default. Review a dry run before enabling deletion:

```text
node scripts/backup-retention.js queue <backup-root> 7 30 --dry-run
node scripts/backup-retention.js evidence <backup-root> 7 30 --dry-run
```

Use the matching protected `QUEUE_BACKUP_KEY` or `EVIDENCE_BACKUP_KEY`. Arguments are kind, root, number to keep and maximum age in days. Omitting the last arguments defaults to seven packages, thirty days and dry-run. `--apply` explicitly enables deletion. Only run against an operator-owned backup root with a single retention writer. The CLI --apply mode takes the same output-root ownership lock as the backup service and fails if that root is already owned. Library callers must coordinate ownership themselves; dry-run does not take a write lock.

The policy keeps at least the newest configured count of authenticated packages (minimum two, maximum 1,000). Additional packages qualify only when strictly older than the age threshold (1–36,500 days). Package age uses the later of `createdAt` and `rekeyedAt`, giving newly rekeyed packages a grace period. Ties sort by directory name. Future or malformed dates are skipped. These manifest dates are not authenticated by the existing encryption format; this is not a defense against an attacker who can edit backup storage.

Only direct `queue-backup-*`/`queue-rekey-*` or evidence equivalents with exactly their ciphertext file and manifest are considered. Ciphertext checksum and AES-GCM authentication must pass under the configured key. Incomplete, extra-file, wrong-key, malformed, oversized-manifest, symlink/junction and hard-linked-file packages are skipped and do not count toward the retained minimum. Other backup kinds are untouched. The root is limited to 10,000 entries. All selected packages are re-authenticated before deletion and each target is checked again at mutation time. Files are unlinked individually; recursive deletion is never used.

Authentication establishes ciphertext integrity, not SQLite validity or independently approved recovery quality. Continue isolated restore drills. Preserve older keys needed by skipped packages. Retention scans and decrypts package contents without writing plaintext; scans may be expensive. Partial failures can leave a package incomplete, and deletion is not transactional. Rechecks reduce accidental races but do not protect against concurrent malicious filesystem replacement; prevent untrusted writers and uncoordinated library callers. The CLI lock coordinates participating processes on one host only. A shutdown during deletion can leave partial cleanup.

To automate after successful backups, set **both** `BACKUP_RETENTION_KEEP` and `BACKUP_RETENTION_DAYS` for `scripts/backup-service.js`. Missing/invalid paired settings reject startup. The service invokes apply mode only after a successful backup and when shutdown has not started. Retention failures emit `backup_retention_failed`; they do not trigger redundant backup retries. Success emits `backup_retention_succeeded`. Skipped packages remain on disk; periodically review the standalone dry-run report and disk usage. No running service or existing backup root was configured during implementation.
