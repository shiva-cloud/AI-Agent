# Recurring scheduler foundation

The separate job database now stores `job_schedules` (job schema version 2). Opening an existing job database adds the table and index without touching evidence storage. No schedules are created automatically.

## Schedule contract

`queue.saveSchedule({scheduleId, kind, targetId, intervalMs, nextRun, enabled, maxAttempts, revision})` creates or updates a schedule. IDs and kinds use the existing job constraints; intervals range from one second to seven days. `nextRun` is an absolute UTC epoch millisecond value. New schedules use revision 0; edits require the latest returned revision. At most 1,000 schedules are supported. Schedules may be paused with `enabled: false`.

`queue.dispatchDue({limit})` processes at most 100 due schedules per transaction. Inserting a job and advancing its schedule are atomic. Competing scheduler connections cannot enqueue the same scheduled occurrence twice. Internal request keys use a namespace unavailable to ordinary enqueue callers.

When multiple intervals were missed, only one current job is created; the next time advances past now on the original cadence. If the schedule's previous job is still queued or running, the tick skips creating another job and advances the schedule. This prevents same-schedule overlap/backlog growth; it does not deduplicate different schedules targeting the same resource. A failed/blocked terminal job does not permanently disable the schedule: future intervals create a new job whose policy is checked again.

Pausing or editing a schedule affects future dispatch only. It does not cancel an already queued/running job. Dispatch also increments the revision, so an edit made from an old view must reload. `last_dispatched` changes only when a job was actually inserted.

## Runner and shutdown

`runScheduler(queue, {signal, pollMs, workerId, authorize, handlers, timeoutMs})` is an explicit opt-in loop. It dispatches due schedules, runs at most one job, then sleeps until the next poll. A required AbortSignal stops further dispatch and interrupts idle sleep. A job already running drains under its existing bounded deadline before the loop exits. The caller owns closing the queue afterward. No global interval or auto-start process is installed.

Policy is enforced by the worker before every attempt, not by schedule creation. There are no live fetch/parser/reindex handlers or production policy adapters in this milestone. Do not treat a scheduled job as source permission or approval. No live scheduling process was started.

## Validation and limits

Tests cover future/due times, missed-interval coalescing, overlap suppression, stale edits, pause/resume, bounded batches, restart persistence, competing database connections and clean loop shutdown. `node scripts/worker-smoke.js` now demonstrates scheduled dispatch alongside successful and denied fixture jobs, entirely in a disposable directory.

The scheduler follows wall-clock timestamps; large clock changes affect dispatch timing. It is a local SQLite scheduler, not a distributed scheduler. Queue backup/retention, supervisor deployment, admin schedule management, alerting and operational rollout remain open. The existing worker's at-least-once side-effect limitations still apply.
