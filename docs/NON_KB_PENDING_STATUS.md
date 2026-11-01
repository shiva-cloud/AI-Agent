# Non-KB pending status — 2026-10-29

## Completed in this pass

- Editorial controls follow authenticated roles. Policy forms require admin, imports/gap edits editor or admin, decisions/restores reviewer or admin. Disallowed controls and form submissions are disabled; history remains readable. Backend authorization remains authoritative.
- Individual actor fields are populated from the authenticated session and read-only. Gap queue wording distinguishes individual from legacy authentication.
- Read-only queue inspection: `node scripts/queue-inspect.js [cursor]`, with `JOB_DB_PATH` naming an existing queue. Results are paginated and omit lease tokens.
- Explicit retention: `node scripts/queue-prune.js <days>` requires 1–3650 days, deletes up to 1,000 old terminal jobs, and preserves queued/running jobs and schedules' last referenced jobs. No automatic purge is installed. Pruned idempotency keys are removed with their jobs; producers must not reuse keys beyond retention.

## Verification

- Full suite: 293 tests passed before the final read-only inspection adjustment; all nine affected queue/UI permission tests passed afterward.
- Developer evaluation: 74 cases passed (28 + 46). Pre-flight: 10 checks passed.
- Isolated standalone-server and worker/scheduler smoke tests passed. Modified UI modules passed syntax checks.
- Artifacts: `artifacts/pending-tests.tap`, `artifacts/pending-evaluation.json`, `artifacts/pending-preflight.json`, `artifacts/pending-server-smoke.json`, `artifacts/pending-worker-smoke.json`.

## Excluded and deferred

KB research, content, fetching/parsing, approvals and schema expansion are excluded. The user answered “leave it” when asked for repository, staging/domain and offsite backup targets; external CI activation, hosting/TLS rollout and offsite setup are deferred. Local Docker Engine is unavailable, so container execution remains unverified.

## Still open

- Interactive browser/mobile/accessibility verification; existing browser-access restrictions remain respected.
- Local worker supervision, CLI schedule management and encrypted queue backup/recovery are now implemented; see `LOCAL_WORKER_OPERATIONS.md`. OS service rollout, HTTP schedule UI and durable external alert delivery remain open/deferred.
- Individual-account rollout, stronger identity lifecycle (SSO/MFA/session revocation), encrypted recovery artifacts and production-scale soak testing.

These are not claimed complete by regression results. No working database, live accounts or running service was changed in this pass.

## Backend-only scope update — 2026-10-29

Further implementation is limited to backend work as requested. File-backed individual credential rotation/revocation, role reload, explicit UTC expiry and post-body authorization rechecks are implemented. Configuration failure denies access with a sanitized 503. See ADMIN_ACCESS.md. The latest full suite passed 298 tests; standalone server smoke passed, and the focused suite passed after adding the in-flight revocation regression.

The checked-in example provider credential was cleared. If it was a real credential, its owner must revoke it at the provider; clearing an example does not invalidate a token or remove historical copies. No live secret configuration was accessed or changed.

SSO/MFA, production account rollout, OS service installation, production-scale soak validation and external alerting remain open or deferred. Encrypted local queue recovery already exists; offsite setup remains deferred. Frontend work and KB work are outside the current scope.

## Backend queue API completion — 2026-10-29

Implemented optional queue listing and schedule management HTTP endpoints. All reads require authentication; schedule writes require admin and current revision. Responses omit lease tokens, worker IDs and request keys. Validation returns 400, stale revisions 409, missing configuration 503, and unexpected storage failures sanitized 500. Existing origin, request size, rate-limit and credential revalidation controls apply.

Standalone opt-in uses ADMIN_JOB_DB_PATH pointing to an existing queue, with cleanup at shutdown. No production queue was configured or changed and no worker was started. See JOB_MANAGEMENT_API.md for the contract and limits. Schedule UI remains outside the backend-only scope; per-change schedule audit history is not implemented.

Verification: current full suite passed 323 tests; isolated child-process startup, queue listing and disabled schedule create/read smoke checks passed. Evidence: artifacts/backend-queue-tests.tap and artifacts/backend-queue-server-smoke.json. No frontend or KB files were edited in this pass. Other open/deferred work above remains unchanged.

## Backend schedule audit completion — 2026-10-29

Schedule configuration audit history is now implemented, superseding the earlier open item. Queue schema v3 adds immutable events, written transactionally with each accepted schedule save. HTTP actor IDs come from authentication; legacy/local calls are explicitly marked without asserting an individual identity. Authenticated history reads are paginated. Failed audit writes roll back schedule changes; conflicts create no event. Existing v2 queues retain schedules during writable migration and v2 encrypted backups remain restorable. Version 3 recovery digests include audit data.

Verification: 325 tests passed, including migration, identity spoofing, conflict/no-event behavior, SQL immutability, atomic rollback and encrypted audit recovery. Isolated standalone server smoke passed. Artifacts: backend-schedule-audit-tests.tap and backend-schedule-audit-smoke.json under artifacts/. Only disposable test queues were migrated; no live queue, KB, frontend or service configuration was changed. See JOB_MANAGEMENT_API.md for limitations and the history endpoint.

## Backend dependency readiness completion — 2026-10-29

The readiness endpoint now probes the primary records table and the configured queue's schema plus job/schedule/audit tables. Queue failures return sanitized 503 queue_unavailable; recovery restores readiness automatically. A missing primary records table returns storage_unavailable even if the connection itself is open. Draining remains the highest-priority condition, and an unconfigured optional queue does not block readiness. Standalone startup validates the opened queue before listening.

Checks are bounded reads and leave queue data unchanged. They do not assert write permission, worker liveness/progress or full integrity. See JOB_MANAGEMENT_API.md for probe semantics. Verification: 328 tests passed and isolated standalone server smoke passed; artifacts/backend-readiness-tests.tap and artifacts/backend-readiness-smoke.json. No live service/database, frontend or KB changes were made. Production soak, SSO/MFA, OS service rollout and deferred external setup are still not claimed complete.

## Backend active-job shutdown completion — 2026-10-29

Scheduler cancellation now propagates into active worker authorization and handlers. Already-stopped workers do not claim jobs. Interrupted claims record worker_stopped, release leases through fenced completion, and retain the existing retry delay and attempt budget. Late approval cannot launch a handler; late completion cannot overwrite the persisted outcome. Listeners and deadline timers are cleaned up. Cooperative cancellation and external side-effect limitations are documented in LOCAL_WORKER_OPERATIONS.md.

Verification: all 332 tests passed after updating the completed-job scheduler fixture to stop after persisted completion. New tests cover pre-claim shutdown, pending authorization, active handler interruption, exhausted attempts, late completion and listener cleanup. Disposable worker smoke passed. Artifacts: backend-worker-shutdown-tests.tap and backend-worker-shutdown-smoke.json. No frontend, KB, live databases or running services were changed.

## Backend queue schema compatibility completion — 2026-10-29

Added a shared schema gate before queue initialization/migration and recovery verification. Future versions, discontinuous or empty version history, missing required tables/columns, and unrelated nonempty databases are rejected. Supported older queues retain their jobs during migration. Regression fixtures verify rejected files remain byte-identical and unsupported backups create no output directory.

Verification: 335 tests passed; isolated worker and standalone server smokes passed. Artifacts: backend-schema-tests.tap, backend-schema-worker-smoke.json and backend-schema-server-smoke.json. No live queue, frontend, KB or service configuration was changed. Production soak, identity-provider integration and deferred external operations remain open.
