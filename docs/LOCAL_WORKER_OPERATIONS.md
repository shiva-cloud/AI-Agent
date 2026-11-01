# Local worker operations — 2026-10-29

These tools are opt-in. None was run against the working database or installed as a live service during implementation. External deployment/offsite setup remains deferred at the user's request.

## Supervised worker

`node scripts/worker-service.js [evidence-database]` requires an existing `JOB_DB_PATH` and evidence database. It runs the scheduler with the existing permission-checked handlers. SIGINT/SIGTERM stop new dispatches and propagate cancellation to pending authorization and the active handler before closing the queue. On Windows, process-manager termination may be abrupt; expired leases recover abandoned work.

An interrupted claimed job records `worker_stopped`, releases its lease through the existing fenced completion operation, and returns to the queue with the existing exponential retry delay if attempts remain. Otherwise it becomes failed. The claim still consumes an attempt; repeated shutdowns cannot bypass the retry budget. An already-aborted signal prevents claiming a job. Late authorization cannot start a handler after cancellation, and late handler completion cannot overwrite the saved queue outcome. Shutdown listeners are removed after each job.

Cancellation is cooperative: JavaScript cannot forcibly stop arbitrary handler code or interrupt synchronous blocking work. Handlers must honor their AbortSignal and use idempotency/fencing for external side effects, as they must for deadline expiry. A handler ignoring cancellation can continue its own side effects after the worker has recorded interruption; this implementation does not promise exactly-once execution.

Transient loop failures retry at most three times, with a one-second delay. Exhausting this budget exits nonzero rather than looping forever. Restart events contain only event name and attempt number. Individual job failures retain the queue's existing retry/dead-letter behavior; they do not restart the process. This is an application supervisor loop, not an installed OS service or multi-host controller.

`node scripts/queue-schedule.js <schedule.json>` creates/edits a schedule using its revision contract. `JOB_DB_PATH` must already exist. The JSON file uses the fields documented in `SCHEDULER.md`; files larger than 4 KB are rejected. Set `enabled: false` and the current revision to pause future dispatch. Inspect with `queue-inspect.js`. These local commands rely on filesystem access, not HTTP role authentication. No schedule was installed automatically.

## Encrypted queue recovery

Set `QUEUE_BACKUP_KEY` through a secure environment mechanism to a cryptographically random 32-byte key encoded as 64 hex characters. Do not put it in command arguments, source control, backup manifests or logs. Retain the key separately; losing it makes encrypted backups unrecoverable. No real key was generated or configured for the user.

- `node scripts/queue-recovery.js backup <queue.sqlite> <output-directory>` creates a unique encrypted backup package using SQLite online backup, including committed WAL writes.
- `node scripts/queue-recovery.js restore-drill <backup-directory> <output-directory>` authenticates/decrypts to a new isolated directory, verifies structure and logical/schema digests, and writes a successful drill report. It does not overwrite a live queue or start workers.

Backups use AES-256-GCM with random 12-byte nonces, a fixed format identifier as authenticated additional data, and 16-byte authentication tags. The manifest records ciphertext checksum, queue counts and logical/schema digests, but no key. Wrong keys and tampered ciphertext fail; failed decrypted files are removed. Manifests are not separately signed; adversarial replacement of both manifest and payload is constrained by authenticated encryption, not the unkeyed checksum.

Temporary plaintext SQLite snapshots exist during backup and are removed with their WAL/SHM sidecars after completion/failure. Deletion is not guaranteed forensic erasure, and a process/OS crash may leave partial files. Use encrypted local storage and restrict filesystem access. Successful restore drills intentionally contain a plaintext database for inspection. Never store recovery artifacts in a public folder.

Recovery preserves queued/running states, schedules and lease timestamps. Stop the original workers before operationally promoting a restored queue; running both copies can duplicate side effects. This command only performs an isolated drill. Separate queue retention is documented in `NON_KB_PENDING_STATUS.md`.

## Validation and limits

Tests verify encrypted backup/restore with uncheckpointed source writes, schedules/running jobs, unchanged source digest, no completed backup plaintext files, wrong-key rejection, corruption rejection and failed decrypt cleanup. Supervisor tests cover successful restart, cancellation and bounded exhaustion. Tests use disposable files and random in-memory fixture keys.

External offsite upload, OS service installation, secret-manager rollout, monitoring delivery, identity-provider integration and interactive UI QA are not claimed complete. These local tools do not change KB content or enable live fetching.

## Queue compatibility gate

Queue opens now validate version history and required columns before migration or journal-mode changes. Versions must form a contiguous history from 1 through at most 3. Unsupported future versions, missing migration entries, missing required tables/columns and unrelated nonempty databases are rejected. Empty databases are initialized only on a writable open. Existing v1/v2 queues can still upgrade; read-only opens do not migrate them. Recovery verification accepts supported v2/v3 schemas and rejects unsupported schemas before creating a backup output directory. These checks establish structural compatibility, not full equivalence of every constraint/trigger or protection against concurrent schema changes by external operators; coordinate upgrades with stopped workers.

## Worker presence — queue schema v4

Writable initialization adds worker_presence transactionally; supported version histories now run from 1 through 4. Older read-only queues remain inspectable; presence is unavailable until upgrade. Queue backups include v4 presence data in verified digests; v2/v3 packages remain supported.

Each superviseWorker invocation registers a unique instance ID, refreshes presence every 10 seconds and marks stopped in finally. A pre-aborted invocation registers nothing. The health API returns aggregate active/stale/stopped counts and worker_heartbeat_stale after 30 seconds without a refresh. No instance identifier is exposed in health output. Retention removes presence older than seven days on the next presence write, with a maximum of 1,000 rows. Restored presence is historical; it does not establish that an original worker is still running.

Heartbeat write errors are isolated; stale state exposes lack of successful persistence. A stale signal can mean a stopped process, blocked event loop or storage failure, not necessarily a crash. Supervision heartbeats cover only supervised instances, not one-shot workers or arbitrary scheduler callers. No expected fleet size is configured, so a worker that has never registered cannot be detected as missing. Successful heartbeat does not prove successful job execution. External delivery and incident acknowledgement remain deployment work.
