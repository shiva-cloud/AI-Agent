# Backend job management API

Set `ADMIN_JOB_DB_PATH` to an existing, separate worker queue database to enable these endpoints in the standalone server. Point it to the same queue used by the worker's `JOB_DB_PATH`. The server validates that the queue exists and can be read before opening it for administrative writes. Invalid configuration prevents startup; no queue is implicitly created. The connection closes during server shutdown.

Without this optional configuration, authenticated requests receive HTTP 503 with `queue_unavailable`. Embedded applications may inject `options.jobQueue` into `createApp`; the caller owns that connection's lifecycle. No worker or dispatch loop is launched by these APIs.

| Method and route | Permission | Behavior |
| --- | --- | --- |
| GET `/admin/jobs?after=<cursor>&limit=100` | Any authenticated admin role | Returns `items` and `nextCursor`; limit 1–100. Worker IDs, lease tokens and request keys are omitted. |
| GET `/admin/job-schedules` | Any authenticated admin role | Lists schedules, bounded by the queue's 1,000-schedule maximum. |
| GET `/admin/job-schedules/:id/history?after=0&limit=100` | Any authenticated admin role | Lists configuration audit events in sequence order, up to 100 per page. |
| POST `/admin/job-schedules` | Admin only | Creates or updates a schedule with optimistic revision checking. |

POST uses the same fields as the CLI: `scheduleId`, `kind`, `targetId`, `intervalMs`, `nextRun`, optional `enabled` (default true), `maxAttempts` (default 3), and `revision` (default 0 for creation). Use the current returned revision for an update; dispatcher changes also increment it. A conflict returns 409 and requires rereading the current schedule before deciding whether to retry. Set `enabled: false` to pause future dispatch; jobs already queued or running are unchanged.

Kinds remain the queue's existing `source_check`, `verify_snapshot`, and `reindex`. Interval is 1,000–604,800,000 milliseconds; attempts 1–10. Timestamps use epoch milliseconds. Invalid fields return 400; internal storage failures return a sanitized 500. Existing JSON body limits, origin restrictions, rate limits, credential reload and post-body authorization checks apply. Legacy token mode retains administrator access.

Schedule changes do not execute work or approve/publish content. Worker handlers and permission checks remain authoritative at execution time. This API introduces no KB content changes, schedule editor UI or production account configuration.

## Dependency readiness

`GET /ready` probes the primary records table and, when job management is configured, the queue schema and required job, schedule and audit tables. A queue probe failure returns HTTP 503 with `{status: "not_ready", reason: "queue_unavailable"}` without database paths or exception details. Primary storage failure uses `storage_unavailable`; draining takes precedence. An unconfigured optional queue does not prevent readiness. Successful responses retain `{status: "ready"}`. The standalone server also probes the configured queue before listening.

These bounded read probes do not claim jobs, dispatch schedules or write data. They establish schema/read availability, not write permission, worker liveness, queue progress or full database integrity. `/health` remains the liveness endpoint; it stays available when a dependency fails, except during shutdown. Use `/ready` for traffic eligibility and `/health` for process liveness.

## Schedule configuration audit

Writable queue initialization now upgrades the queue to schema version 3 in a transaction. Existing schedules are preserved; historical events are not invented for earlier changes. Read-only inspection and recovery do not migrate queues. Version 2 encrypted backups remain restorable, while version 3 backup verification includes audit rows in its data digest.

Each accepted configuration save records the before/after schedule, UTC epoch-millisecond timestamp, actor mode and authenticated actor ID in the same transaction. HTTP identities come from server authentication; submitted identity fields are ignored. Legacy tokens are recorded as `legacy` with null actor ID; CLI/direct local saves default to `local` with null actor ID, since no individual authentication occurs there. Audit insertion failure rolls back the schedule update. Rejected requests and revision conflicts do not create configuration events.

History responses contain `items` and numeric `nextCursor` (null at the end). Unknown schedules return 404; invalid pagination returns 400. SQL triggers reject event updates and deletion. This is application/database enforcement, not protection against an operator with filesystem or schema-control privileges. There is no automatic audit pruning. Dispatcher cadence/lease transitions are outside this configuration history; their increments can create gaps between recorded revisions.

Validation uses disposable databases: HTTP role and origin boundaries, secret omission, pagination, validation errors, concurrent revision conflict, disabled schedule update, unavailable configuration, sanitized failures, and standalone startup with a configured queue.

## Queue operational health

GET /admin/job-health is available to any authenticated admin role when the queue is configured. It returns an aggregate snapshot: job-state counts, ready backlog, oldest ready-job age, expired leases, due enabled schedules, oldest schedule lag and actionable alert codes. It returns HTTP 200 when observation succeeds, with status ok or attention; unavailable configuration returns 503. No job identifiers, lease credentials, worker IDs or target IDs are returned.

Default age thresholds are five minutes for queued work and schedule dispatch. Library callers can supply queueAgeMs/scheduleLagMs from 1,000 to 86,400,000 ms. API query parameters cannot override thresholds. Jobs whose available_at is in the future and disabled schedules are excluded from overdue alerts. Failed/blocked alerts count retained terminal jobs, not newly occurring incidents; historical failures remain visible until explicit retention cleanup. Changes in counts can reflect cleanup as well as recovery.

node scripts/queue-health.js reads the existing JOB_DB_PATH without migration. Exit 0 means no signals, 2 means attention required, and 1 means observation failed. This enables an operator-controlled local monitor. Health reads use a consistent SQLite read transaction and do not claim jobs, dispatch schedules or recover leases. Aggregation cost grows with retained queue size; large-queue latency still needs soak measurement.

These are demand-based symptoms, not proof of worker liveness: an idle queue cannot identify a stopped worker. Independent service heartbeat, alert acknowledgement/routing and external notification delivery remain pending. This endpoint does not alter /ready traffic eligibility.
