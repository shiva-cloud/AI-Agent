# Explicit encrypted backup service

Start only after configuring protected storage and the corresponding existing recovery key:

```text
node scripts/backup-service.js evidence <existing-database> <backup-root> [interval-ms]
node scripts/backup-service.js queue <existing-queue> <backup-root> [interval-ms]
```

Evidence mode reads EVIDENCE_BACKUP_KEY; queue mode reads QUEUE_BACKUP_KEY. The key must be a cryptographically random 32-byte key encoded as 64 hex characters, supplied through a protected environment. It is never a CLI argument or log field. The command reuses the verified AES-GCM backup implementations and their plaintext-snapshot cleanup behavior.

The first backup runs immediately, then a fixed delay starts after completion. Default interval is 24 hours; allowed range is one minute through seven days. Each cycle gets at most two retries separated by one minute. Retries use unique package directories. Exhausted cycles emit backup_cycle_exhausted and wait for the next regular interval. Failed cycles do not terminate the long-running service; operators must monitor emitted events.

Events contain only event name, attempt when applicable, successful duration, database kind and UTC timestamp. No source path, output path, key or raw exception is logged. SIGINT/SIGTERM interrupts waiting and prevents new backups. An active backup is allowed to finish before key cleanup and exit. The backup operation itself has no forced cancellation deadline; filesystem or SQLite delays can prolong shutdown. OS termination can be abrupt, especially on Windows, and temporary plaintext may remain after a crash.

The CLI holds an exclusive SQLite write transaction in .backup-owner.sqlite for its full lifetime, including waits, active backups and retention. A second service targeting the same canonical backup root fails immediately. Process exit releases the OS lock; no stale lease timeout or lock-file deletion is needed. Different roots remain independent. This is same-host coordination on local storage, not a multi-host scheduler. Do not delete or replace the ownership database while a process is running. There is no missed-run catch-up. Retention is disabled unless both BACKUP_RETENTION_KEEP and BACKUP_RETENTION_DAYS are configured; see BACKUP_RETENTION.md for dry-run/apply behavior and safeguards. Configured retention runs after successful backups, emits separate success/failure events and never retries a completed backup because cleanup failed. Local rekey tooling is documented in BACKUP_KEY_ROTATION.md. Coordinated key rollout, offsite transport and OS-service installation remain operational work. Monitor free space; retries may leave incomplete encrypted packages without a success manifest.

The implementation uses dependency-injected timers and backup functions for fast deterministic tests covering retries, exhausted budgets, overlap prevention, cancellation, active-operation shutdown and logger failures. Encryption and WAL recovery are covered by the separate evidence/queue recovery integration tests. No live periodic service was started by this implementation.

Manual backup, rekey and direct library callers do not automatically acquire this ownership lock. Coordinate them operationally; manual retention --apply does acquire it and refuses a running service root. Dry-run remains read-only and may observe changing package state. The lock covers the output root, so use a separate root per source database to prevent retention from mixing independent recovery histories. Only operator-owned directories on local filesystems are supported. Ownership does not install or supervise an OS service.

## Bounded event delivery — 31 October 2026

Backup-service diagnostic callbacks are best-effort and have one asynchronous delivery slot. An unsettled callback keeps the slot; subsequent events increment eventDrops without allocating more callback work. Settled rejection increments eventFailures and releases the slot. Backup/retention operations and shutdown do not await a hung diagnostic sink. The returned counters include eventDrops and eventPending at the time the service stops; a later callback rejection cannot retroactively update that returned snapshot. Synchronous callback blocking remains outside JavaScript cancellation guarantees.

The standalone CLI now uses stdout write callbacks so stream backpressure occupies the same slot instead of repeatedly appending output. A stdout error stops future backup cycles with a failure exit code; active backup completion remains graceful. A pending native stream write can still delay OS process exit even after the service loop returns. These diagnostics are not a durable audit/event queue; dropped events require independent health/backup inspection. Existing operational monitoring and process supervision requirements remain.
