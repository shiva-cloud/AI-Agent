# Audit remediation — 2026-10-29

## Latest follow-up — encrypted queue recovery and worker supervision

- Added online queue backup with AES-256-GCM encryption, authenticated isolated restore, digest verification and temporary SQLite/sidecar cleanup. No live key or offsite destination was configured.
- Added bounded-restart worker service and explicit local schedule management CLI. No live worker or recurring schedule was started.
- Added tampering/wrong-key/WAL preservation and supervisor retry/cancellation tests. Documentation: `LOCAL_WORKER_OPERATIONS.md`.
- External hosting, CI activation and offsite setup remain deferred. KB remains excluded. Browser QA, OS service rollout and stronger identity-provider integration are not claimed complete.

## Latest follow-up — role-aware UI and local queue operations

- Added disabled role-specific editorial/gap controls and read-only authenticated identity fields. Backend enforcement remains authoritative.
- Added read-only paginated queue inspection and bounded explicit terminal-job retention with active-job/schedule safeguards.
- Validation: 293 full-suite tests, 74 evaluation cases, 10 pre-flight checks and server/worker smoke passed; affected queue/UI tests passed after the final read-only inspection change.
- External deployment/remote CI/offsite setup deferred at the user's “leave it” instruction. KB excluded. See `NON_KB_PENDING_STATUS.md` for the current remaining list and validation limits.

## Latest follow-up — non-KB scope and deployment checks

- Scope updated: exclude KB research/content, source fetching/parsing, approvals and KB schema expansion. Preserve existing content and concurrent workspace changes.
- Closed the in-progress indexed-retrieval regression using scope-local BM25 reranking over pretokenized records; indexed and fallback question-contract tests pass. No live index or KB was changed. See `INDEXED_RETRIEVAL.md`.
- Added actual child-process server smoke (disposable database/token, AI disabled), explicit HTTPS proxy origin configuration, and origin-spoof regression tests.
- Expanded CI definitions to pre-flight, worker/server smoke, plus a separate container build/readiness job. Remote CI was not executed. Local container validation is blocked by the unavailable Docker Engine.
- **290 tests passed** and standalone server smoke passed. Full-suite artifact: `artifacts/non-kb-tests.tap`. See `DEPLOYMENT_CHECKS.md` for remaining non-KB work and validation limits.

## Latest follow-up — read-only evidence worker integration

- Final validation: **265 tests passed**, 58 developer evaluation cases passed, 10 pre-flight checks passed, worker/scheduler fixture smoke passed. Artifacts: `artifacts/handler-tests.tap`, `artifacts/handler-evaluation.json`, `artifacts/handler-preflight.json`, `artifacts/handler-smoke.json`.

- Added a real snapshot-verification handler and source-policy adapter using read-only SQLite transactions. Checks hash, English content, linked quotes/URLs and published provenance; rechecks source permission/suspension at execution.
- Added `worker-once.js` with explicit separate job storage and configured evidence path. Unknown targets and unimplemented fetch/reindex kinds fail closed. Revoked policy blocks the job; failures never delete or publish evidence.
- Added file-backed and CLI regressions, including digest preservation, tampering, source revocation and missing files. No live worker, network fetch, approval or KB update was performed.
- Documentation: `EVIDENCE_WORKER.md`. Live fetching/parsing, reindex integration, queue operations and deployment verification remain pending.

## Latest follow-up — recurring scheduler

- Added persistent schedule definitions, revision-protected edits, pause/resume and atomic due-job dispatch in the separate job database (job schema version 2).
- Missed intervals coalesce to one run; a queued/running prior job suppresses overlap. Per-transaction batches and total schedule count are bounded. Competing connections cannot duplicate an occurrence.
- Added opt-in scheduler loop with abortable idle waits and bounded active-job draining. Extended fixture smoke; no live scheduler or source fetching was started.
- **259 tests passed**, 58 development evaluation cases passed, 10 pre-flight checks passed and worker/scheduler smoke passed. Artifacts: `artifacts/scheduler-tests.tap`, `artifacts/scheduler-evaluation.json`, `artifacts/scheduler-preflight.json`, `artifacts/scheduler-smoke.json`.
- Details: `SCHEDULER.md`. Production handlers/policy integration, queue operations, advanced retrieval and deployment verification remain open. Live KB, approvals and service configuration were not changed.

## Latest follow-up — durable worker foundation

- Added separate SQLite job queue with atomic exclusive claims, expiring leases, token-fenced completion, idempotent enqueue, due times, bounded retries and terminal blocked/failed states.
- Added one-job runner with mandatory policy callback, injected handlers, cancellation/deadline and exponential retry delay. No live source fetching, parsing, reindexing or publication handler is enabled.
- Regression tests cover restart, competing queue connections, stale workers, retry exhaustion, denial, timeout and refusal to modify an evidence database. Corrected an unrelated newly added Atom-feed test to publish its in-memory fixture and count the feed-level update tag.
- **255 tests passed**, 58 developer evaluation cases passed, 10 pre-flight checks passed. Artifacts: `artifacts/worker-tests.tap`, `artifacts/worker-evaluation.json`, `artifacts/worker-preflight.json`.
- See `WORKER_QUEUE.md`; runnable fixture: `node scripts/worker-smoke.js`. Live recurring scheduler/fetch/parser/reindex adapters, queue operations/backup and deployment validation remain pending. No working KB, credentials or running service was changed.

## Latest follow-up — individual admin roles

- Final validation: **248 tests passed**, 58 developer evaluation cases passed, 10 pre-flight checks passed. Artifacts: `artifacts/rbac-tests.tap`, `artifacts/rbac-evaluation.json`, `artifacts/rbac-preflight.json`.

- Added configured individual reader/editor/reviewer/admin identities, per-route permission checks and server-assigned audit actor IDs. Caller-supplied reviewer labels cannot impersonate another actor in individual mode.
- Individual configuration disables shared-token fallback. Malformed configuration fails startup before database initialization. Legacy mode is retained and labeled for compatibility; it is not equivalent to individual authentication.
- Added `/admin/session`, identity banner and role-specific denial wording. No live credentials were configured and no server restart or KB change occurred.
- Details and remaining SSO/MFA/session/revocation/UI limitations: `ADMIN_ACCESS.md`. Advanced retrieval, worker pipeline and deployment validation remain open.

## Latest follow-up — backend observability

- Added generated `X-Request-ID` correlation IDs, sanitized standalone-server failure/abort JSON logs and authenticated `/admin/runtime-metrics`.
- Fixed-category counters report count and mean/max latency without raw request text, paths, tokens, IPs or exception details. Logger failures cannot reject API responses. UI 500 errors display safe request references.
- Tests cover authorization, correlation, privacy exclusions, abort deduplication and failing log sinks. Details: `OBSERVABILITY.md`.
- No live restart, deployment, external collector or KB edits. RBAC, advanced retrieval, worker execution, durable monitoring/alerting and deployment verification remain open.

## Latest follow-up — typed API errors

- Replaced intentional validation exceptions across the engine, language/date checks, store and ingestion with typed errors. Gap workflow shares that contract.
- Missing resources now return 404; stale edits/idempotency conflicts and duplicate registrations return 409. Unexpected errors are sanitized 500 responses, regardless of their message or forged status fields.
- Added stable codes to error envelopes, invalid URL/feedback validation and dedicated UI conflict/server-error messages. Existing readiness response remains unchanged.
- **243 tests pass**, 58 development evaluation cases pass, 10 pre-flight checks pass. Artifacts: `artifacts/error-tests.tap`, `artifacts/error-evaluation.json`, `artifacts/error-preflight.json`.
- Details: `API_ERRORS.md`. No KB changes, live migration, restart or deployment. RBAC, operator observability, advanced retrieval, workers and deployment validation remain pending.

## Latest follow-up — database operations

- Server and migration, dry-run, verification, backup and policy-lint commands now share database path selection: explicit argument, then `DB_PATH`, then the local default.
- Policy lint uses a read-only connection and never initializes or migrates the inspected database. Missing inputs fail without creating files.
- Child-process integration tests verify selection precedence, unchanged source data/schema, no accidental default database, backup verification and isolated restore.
- Fixed the public gap summary's `in_progress`/`inProgress` response mismatch with its UI and endpoint contract. Concurrently added public-gap functionality was preserved.
- **241 tests pass**, 58 developer evaluation cases pass, 10 pre-flight checks pass. Artifacts: `artifacts/remaining-tests.tap`, `artifacts/remaining-evaluation.json`, `artifacts/remaining-preflight.json`.
- No live migration, server restart, KB edits, provider calls or deployment. Individual RBAC, comprehensive typed errors, production retrieval/worker infrastructure and deployment validation remain open.
- Command reference: `DATABASE_OPERATIONS.md`.

Scope: engineering fixes only. No live knowledge records, source permissions, approvals or snapshots were modified. English-only storage remains enforced. This report supersedes the original audit's implementation status only for the fixes below.

## Implemented and verified

1. **Approval provenance:** direct record approval now requires an imported snapshot and a reviewed source. Seed approval fails with an actionable validation message, without an audit write. Fixture tests cover withdrawal, valid reapproval and suspended-source rejection.
2. **Migration rehearsal:** read-only SQLite online backup captures committed WAL data. Migrations run exclusively on a disposable copy, including ingestion migrations. Missing legacy migration tables are supported. Integrity and foreign-key checks run on the result. Failure returns a nonzero CLI exit. Cleanup checks the resolved temporary directory before recursive removal.
3. **Geography guard:** unknown explicit destinations trigger clarification, including Paris, Dubai and arbitrary locative names such as `in xyzville`, despite a selected Canadian city. Multiple locative phrases are checked. This remains a conservative English rule parser, not a worldwide entity resolver; unsupported bare place names outside its rules and complex origin/destination narratives still need the typed resolver milestone.
4. **Query intent:** internet access at a library is treated as a community question. Explicit home internet plans retain telecom intent.
5. **Transactional telemetry:** traces and their gaps commit together. A failed gap write rolls back the trace; raw questions remain excluded.
6. **UI accuracy:** eligible retrieval candidates are no longer described as quoted. Freshness displays the oldest source check. City-switch suggestions are suppressed when the original question explicitly names a supported city or province; switching no longer mutates the original request context.
7. **AI budget and cancellation:** router uses the existing 12-second total answer budget instead of extending it to 45 seconds. Individual provider attempts use four-second deadlines. An aborted answer never starts another provider. Removed unsupported comments promising verified availability/free pricing. No live provider calls or pricing validation were performed.
8. **CI definition:** added Windows/Linux Node 24 test and evaluation workflow. It has not run remotely; the workspace is not a connected Git repository.

## Validation

- `node --test`: **218 passed, 0 failed**. Output: `artifacts/fix-tests.tap`.
- `node scripts/evaluate.js`: **58 developer regression cases passed**, split 28/30. These are not independent gold labels or measured real-world answer accuracy.
- `node scripts/verify-everything.js`: **10 checks passed**, using synthetic fixtures.
- `node scripts/http-benchmark.js`: 80 requests, concurrency 5, isolated file SQLite, external AI disabled; p50 18.3 ms, p95 70.5 ms, p99 84.6 ms; no failures, 80 persisted traces, throttle verified. Run preceded the final library-intent adjustment; the full regression/evaluation suites were rerun after that adjustment.
- UI edits were inspected in source; browser interaction was not reverified in this pass. No running application restart or public deployment was performed.

## Still open

The complete project roadmap has **not** been implemented. Continue from `PROJECT_AUDIT_AND_ROADMAP.md` with:

1. Expand the initial query/answerability contract beyond rule-based occupation, eligibility and checklist detection; comprehensive origin/destination resolution and API validation/error contracts remain open.
2. Individual authenticated actors, RBAC, revision conflicts, and removal of self-declared reviewer identity as an authority boundary.
3. Structured fact/rule/service schema and repository abstraction, indexed hybrid retrieval and independently labeled retrieval evaluation.
4. Initial gap ownership, priority, resolution lifecycle and regression references are implemented. Remaining: independently authenticated actors, automatic regression execution/verification, browser validation and richer queue filtering.
5. Privacy-reviewed AI understanding before retrieval, pinned/configurable provider policy and real provider latency validation.
6. Durable worker/scheduler/reindex interfaces, fixture-driven change and rollback orchestration.
7. Repeatable browser/accessibility checks, staging/TLS deployment, encrypted offsite recovery and operational validation. Initial graceful shutdown/readiness is implemented; target-runtime validation remains open.
8. Initialize/review version-control exclusions and activate CI when a repository is configured; reconcile older historical status documents.

KB research, factual review, live source permissions and content approvals remain excluded by the user's scope decision. Production readiness cannot be claimed from these engineering regression results.

## Follow-on implementation — query contract and runtime lifecycle

- Added `query-1` and `answerability-1`: explicit specialized facets, per-topic eligibility gaps, occupation requirements and ordered checklist gaps. Generic approved summaries cannot close these facets. Details: `QUERY_CONTRACT.md`.
- Added readable English gap messages without collecting personal eligibility details. Existing AI rewriting preserves the deterministic gaps and contract.
- Revised developer dataset to `english-dev-2`, changing the first-week case to partial with a checklist gap. This corrects a misleading historical expectation; it is not an improvement in independent factual accuracy.
- Added `/ready`, draining state, idempotent SIGINT/SIGTERM shutdown and a bounded grace period before SQLite cleanup. Added separate service-outage wording. Details: `RUNTIME_LIFECYCLE.md`.
- Added configurable host/database path and container non-root user, persistent-data path and readiness probe. Docker CLI is installed, but validation could not connect to the local Docker Desktop Linux engine; no container build or run is claimed.
- Validation: **229 tests passed**, 58 developer evaluation cases passed, 10 pre-flight checks passed. Latest isolated 80-request HTTP benchmark: p50 20.4 ms, p95 71.1 ms, p99 86.2 ms; no failures, external AI disabled.
- Outputs: `artifacts/open-tests.tap`, `artifacts/open-evaluation.json`, `artifacts/open-preflight.json`. No live KB edits, app restart, source approvals or deployment.

## Follow-on implementation — gap work queue

- Migration 6 adds aggregate gap items and immutable lifecycle events. Scope/topic/subject/reason keys preserve separate issues; trace and queue writes commit atomically.
- Editorial UI and authenticated endpoints support ownership, priority, status, regression references, change history and pagination. Stale revisions return 409. Recurrent resolved gaps reopen automatically.
- English-only storage guards and backup verification cover the new tables; old read-only backup verification remains supported. No historical scope is fabricated from old gap records.
- **235 tests passed**, 58 developer regression cases passed, 10 pre-flight checks passed. UI module syntax check passed. Latest isolated HTTP benchmark: p50 24.6 ms, p95 138.5 ms, p99 164.1 ms, 80 requests/concurrency 5/AI disabled, zero failures. Timing varies across local runs; this is not a production load claim.
- Artifacts: `artifacts/gap-tests.tap`, `artifacts/gap-evaluation.json`, `artifacts/gap-preflight.json`. See `GAP_WORKFLOW.md` for contracts and retention details.
- No live migration, KB changes, app restart, approvals or deployment. Interactive browser validation remains pending. Shared-token actor labels and attested test references are explicitly not RBAC or proof that a regression passed.
