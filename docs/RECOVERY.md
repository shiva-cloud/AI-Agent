# Local backup and recovery

The project now has a SQLite online-backup command and an isolated restore drill. These commands run locally; they do not upload data, call an AI provider, replace the working database, or establish an automatic backup schedule.

## Create a backup

```powershell
node scripts/backup.js
```

Optional arguments specify an existing source database and a backup output directory:

```powershell
node scripts/backup.js data/settlement.sqlite backups
```

Each run creates a unique `backup-*` directory with `database.sqlite` and, only after verification succeeds, `manifest.json`. It uses the [Node.js SQLite online backup API](https://nodejs.org/download/release/latest-v24.x/docs/api/sqlite.html#sqlitebackupsourceDb-path-options), preserving a consistent database copy rather than copying the live main file while ignoring WAL data.

The source connection is read-only. Backup creation does not run migrations, add seeds or change publication states. The manifest contains a SHA-256 file checksum, table counts, migration versions, a logical-data digest, a schema digest and verification results. It contains no credentials or environment-file contents.

## Verify a backup

```powershell
node scripts/verify-backup.js backups/backup-EXAMPLE
```

Replace the example folder with the directory printed by the backup command. Verification rejects incomplete manifests, changed file bytes, unexpected database-file paths, symbolic-link files, schema differences and logical-data differences. Database checks include SQLite integrity, foreign keys, English schema/script validation and excerpt content hashes.

Checksums detect changes relative to the manifest; they do not authenticate a manifest against a malicious actor who can replace both files. Backups are local plaintext database copies. Encryption, access-control policy, offsite storage, retention scheduling and signed manifests remain production work.

## Run an isolated restore drill

```powershell
node scripts/restore-drill.js backups/backup-EXAMPLE
```

The drill first verifies the backup, then creates a new `drill-*` directory under `recovery-drills/`. It copies the verified database without overwriting existing files, compares file/data/schema checksums, reruns database verification, and exercises deterministic answers for SIN, Toronto library services and Vancouver health coverage.

The drill does not require those questions to be answerable: unavailable or expired evidence must still be handled correctly. Every emitted claim must retain its citation. The checks do not establish factual correctness, external-provider availability, HTTP/UI health, distributed failover or production recovery-time guarantees.

Successful drills write `report.json`. No completion report is written after a failed check. Failed outputs are retained for diagnosis rather than silently deleted. Both `backups/` and `recovery-drills/` are ignored by Git.

## Inspect another database without modifying it

```powershell
node scripts/verify-data.js recovery-drills/drill-EXAMPLE/database.sqlite
```

The verifier uses a read-only transaction, so counts and digests belong to one consistent database view. It streams table rows through verification rather than loading all persisted event records into memory.

## Actual local drill completed

On 28 October 2026, the current database was backed up and restored into an isolated folder. Both copies passed integrity, reference, snapshot-hash and schema/data comparison checks. The copy contained nine English evidence records and five migrations. Three deterministic answer checks passed, and the working database was not replaced.

The generated backup manifest is in `backups/backup-5Mlowe/manifest.json`; the drill report is in `recovery-drills/drill-3OpNtV/report.json`. These paths are local artifacts, not deployment destinations.

## Production recovery procedure still required

The supplied command intentionally restores only to a new isolated directory. Switching production to a recovered database requires stopping writers, verifying the chosen backup and restored copy, retaining the current database and WAL files for rollback, selecting the recovered file through a controlled deployment configuration, and rerunning application checks. Do not copy a backup over an open database or discard live WAL files.

No automatic replacement, deletion, offsite transfer or recurring task has been configured.
