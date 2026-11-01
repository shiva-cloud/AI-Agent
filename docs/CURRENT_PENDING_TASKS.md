# Current project audit and pending work

Reviewed: 29 October 2026. Package inspected: 0.19.24. This report supersedes historical pending statements where current code implements the feature. Scope: repository source, public UI source, scripts, tests, original Phase 1 attachment and read-only working database verification. This is not an interactive browser, live-provider or production deployment audit.

## Latest status — 1 November 2026

**Current summary (1 November 2026):** full suite **1,685/1,685 passed** (`artifacts/today-test-results-2026-11-01.txt`, `artifacts/today-test-summary.json`). Zero failures, 100% pass rate across 14 test suites and all pre-flight checks.
- **Frontend UI/UX Complete Overhaul**: Full Desktop & Mobile navigation toggle with `#sidebar-toggle-btn` (`[ ◀ Hide Menu ]` / `[ ☰ Show Menu ]`), Categorized Accordion with explicit `Show ▼` / `Hide ▲` badges, Multi-Tool Single-Tool Focus Switcher (`[ ◀ Prev ]`, select dropdown, `[ Next ▶ ]`, `[ 👁️ Show All Tools ]`), scoped natural casing checkbox labels, and universal responsive grid bounds.
- **Workspace Sanitization**: 137 ephemeral scratch scripts purged from `scratch/`, 89 old test dumps deleted from `artifacts/`, and test backup directories sanitized.
- **System Documentation**: Comprehensive production reference published in `docs/TODAY_SYSTEM_STATUS_2026-11-01.md`.

## Previous backend status — 31 October 2026

**Current summary (end of 31 October 2026):** full suite **755/755** (artifacts/backend-recommendations-2-tests.txt); both developer evaluation sets pass (28 + 68 cases); everyday-vocabulary probes 45/45. Since the 452-test baseline below, the following landed (details in the dated sections at the end of this file):
- B1: everyday vocabulary (parser english-rules-0.12).
- B2: follow-up context contract context-1, with elliptical follow-ups.
- B3: geography registry geo-1, with specific place clarifications, neighbourhoods and nearby cities.
- B10: queue and runtime monitors with webhook delivery, signature verification and persistent alert state.
- Two recommendation sweeps (docs/RECOMMENDATIONS_2026-10-31.md).

**SaaS update (1 November 2026):** plans-2. The Free plan is unlimited, an admin panel is at `/manage`, and testing mode runs with `npm run start:test`. The full suite is 1,668/1,668.

Still open after these: independent B1/B6 evaluation, multi-turn history beyond one turn, per-clause geography, an identity provider (B8), multi-host quotas (B9), a production alert destination (B10), key rollout and recovery drills (B11), and a representative soak (B12).

The original inventory below is historical; later implementation updates supersede its individual rows. Earlier isolated regression: **452/452 passed**, zero failures, in artifacts/backend-soak-scaling-tests.txt. Default discovery also exposed a live benchmark failure; see the authentication/test isolation update below. Previously reported four corpus/clarification fixture failures are no longer present in the current shared workspace; those fixture changes were not made in the provider-policy work package.

Implemented since the original audit: provider input minimization and configurable provider/model allowlists (B7 engineering); trusted proxies, bounded local quotas and optional same-host SQLite quota sharing (B9 partial); durable metrics, latency buckets, worker presence and queue-health signals (B10 local scope); evidence encryption, backup scheduling, encrypted backup rekeying and optional authenticated retention (B11 partial); disposable local soak tooling (B12 partial); optional bounded answer cache (B13); complete current OpenAPI schemas, independent validation and generated-client checks (B14). Request cancellation and bounded provider response parsing are also implemented.

Still open: broader parser and confirmed multi-turn context (B1–B2), geography registry (B3), structured domain storage/retrieval and independent evaluation gates (B4–B6, with KB work excluded), identity/session/MFA integration (B8), multi-host distributed quotas, external alert delivery, coordinated key rollout and operational recovery drills, representative production/provider soak. Live provider policy approval and availability checks remain deferred. Frontend and KB implementation remain outside the active backend scope. Passing tests does not close these capabilities or establish production readiness.

## Verified baseline

- 335 tests passed, no failures: `artifacts/full-project-audit-tests.tap`.
- 94 developer evaluation cases passed (28 pilot + 66 expanded). These are not independently reviewed gold labels. Expanded cases have no retrieval ranking labels; Recall@5 and MRR are unmeasured there.
- Ten pre-flight checks passed. Isolated server and worker smoke checks passed. Reports use the `artifacts/full-project-audit-` prefix; per-dataset evaluation reports are `artifacts/evaluation.json` and `artifacts/evaluation-expanded.json`.
- Read-only verification of `data/settlement.sqlite` passed structural, reference, snapshot-hash and English schema/script checks. It contained 79 records: 20 research seeds and 59 pending; 76 sources; six migrations; zero snapshots, candidates, imported publications and source-policy reviews. Counts are a point-in-time observation, not factual certification.
- Workspace is not a Git repository. Remote CI execution and deployed behavior were not established.

## Completed engineering: do not count these as pending

Individual RBAC, authenticated audit identity, file-based token revocation/rotation/expiry, post-body authorization rechecks; publication provenance gates; WAL-safe migration rehearsal; request IDs and sanitized runtime error logs; readiness and graceful server shutdown; queue leases/retries/fencing; scheduler and bounded supervisor; active-job cancellation; queue list/schedule/history APIs; transactional immutable schedule configuration audit; queue compatibility checks; encrypted queue backup/restore; local evidence backup/restore; read-only snapshot verification worker; optional FTS5 index and reindex handler; gap ownership/lifecycle; deterministic facet/answerability checks. Each has documented limits. These features do not establish production rollout or complete Phase 1 acceptance.

## Backend and quality work still pending

| ID | Priority | Pending task and current limitation | Completion evidence needed |
| --- | --- | --- | --- |
| B1 | High | Broader English understanding: rule-based parser has limited phrasing, timeline, constraints and multi-part facet coverage. AI understanding runs after baseline retrieval and cannot rescue an unrecognized intent. | Validated constrained parser and independently labeled unseen-question results, preserving abstention and geography gates. |
| B2 | High | Confirmed multi-turn context: selected city/follow-up controls exist, but there is no general conversation state for references and consequential assumptions. | Explicit context contract, confirmation rules, expiry/privacy policy and cross-turn regression tests. |
| B3 | High | Geography foundation: conservative pilot resolver is not a versioned country/region/city/neighborhood registry with ambiguity resolution. | Typed hierarchy and aliases, unknown/ambiguous-place tests and reviewed pilot location labels. |
| B4 | High | Structured domain storage: current SQLite JSON records do not implement the original relational facts/rules/conditions/services/evidence-chunks model. PostgreSQL/pgvector is not implemented. | Additive migration and storage adapters with preservation/rollback checks. Database technology choice should follow measured scale needs. |
| B5 | High | Retrieval completeness: lexical BM25/optional FTS works; semantic search, fusion, exception/opposing-evidence retrieval and source-dependency-aware ranking remain absent. | Labeled retrieval corpus and measured comparison before enabling extra retrieval stages. |
| B6 | High | Independent quality gates: no held-out human gold set, audited citation entailment, calibrated abstention/usefulness or high-risk unsupported-claim audit. | Frozen independently reviewed splits and documented pass/fail release thresholds. Current developer scores do not satisfy this gate. |
| B7 | High | AI data minimization: optional provider calls include the raw question. Prompt redaction and explicit provider data-handling/model policy are not implemented end to end. | Redaction contract, sensitive-data tests, controlled provider/model configuration and approved operational policy. |
| B8 | High | Production access lifecycle: SSO/MFA, server sessions, account administration and enforced separate-person high-risk review are absent. Static credential lifecycle already exists. | Chosen identity integration, role/session tests and actual operator rollout. |
| B9 | High | Production rate limiting: quotas use process-local socket IP. A trusted proxy can collapse users into one bucket; there is no distributed quota. | Explicit trusted-proxy policy with spoof tests and representative deployment/load validation. |
| B10 | High | Operational monitoring: current metrics reset on restart and expose counts/mean/max. Durable collection, p95/p99 histograms, worker progress/heartbeat monitoring, actionable alerts and delivery are incomplete. | Durable metrics/log integration, stale-worker/queue-age alerts and failure drills. Readiness probes do not prove worker progress or write availability. |
| B11 | High | Recovery operations: queue packages are encrypted; evidence backup packages contain plaintext SQLite. Automated protected backup scheduling, key rotation/retention and timed operational promotion drills remain incomplete. | Evidence backup encryption or approved encrypted storage, documented keys/retention/RPO/RTO and tested recovery procedure. Offsite destination is separately deferred. |
| B12 | Medium | Capacity validation: short local runs do not establish production SLA, sustained SQLite concurrency, large-corpus latency, provider latency or failure recovery under load. | Representative soak/load tests with bounded resources and measured tail latency. |
| B13 | Medium | Answer caching from the original plan is absent; static asset ETags are implemented. | Add only after profiling, with knowledge-version, scope, expiry and withdrawal-safe invalidation tests. |
| B14 | Medium | Reproducible API/operations contract: no complete machine-readable OpenAPI contract; historical docs contradict current implementation in places. | API schema, contract validation and consolidated current architecture/access/deployment documentation. |

These are remaining capabilities or validation gates, not fourteen reproduced runtime defects. No failing regression was found in the current suite.

## KB and automated acquisition dependencies — excluded by user instruction

| ID | Pending work | Why it remains open |
| --- | --- | --- |
| K1 | Human source-access and authority reviews; permitted archived evidence and verified publications | Working database has zero source-policy reviews/snapshots/imported publications. Research seeds are not verified facts. |
| K2 | Sufficient reviewed topic/city coverage and exact facts, conditions, exceptions, contacts and costs | Record counts alone cannot demonstrate that requested questions are answerable. 59 records remain pending. |
| K3 | Permitted live acquisition: conditional HTTP/feed checks, safe HTML/PDF extraction, metadata/chunk/candidate extraction | Queue accepts source-check jobs, but the evidence worker has snapshot verification and reindex handlers, not a live source-check pipeline. |
| K4 | End-to-end update acceptance: fetch/diff/impact/review/publication/reindex/regression/rollback | Individual local building blocks exist; full automated source-to-publication scenario is not established. |
| K5 | Domain reviewer sign-off and coverage gates A/C; corpus targets from the original plan | Requires real independent editorial work, not generated approvals or more seed summaries. |

KB work remains excluded. English-only remains the active product/data requirement; multilingual implementation is not an active pending task.

## Frontend verification and administration

- F1: Repeatable browser/mobile/keyboard/accessibility end-to-end coverage, including stale requests, exports, role changes and error recovery. Source/unit/HTTP checks passed; current interactive verification was not performed and prior access restrictions remain respected.
- F2: Queue/schedule/history API administration UI is absent. Existing editorial and gap UI does not provide this operational console.
- F3: Account/session administration UI depends on B8. Local sign-out exists; it does not revoke a credential for other clients. **Update, 1 November 2026:** for SaaS accounts, the `/manage` admin panel now covers users, plans, limits, tool tiers and on/off switches, settings and the audit log, including "sign out everywhere" and key revocation (docs/SAAS_PLANS.md, section 3a). It was checked in the browser at desktop and phone width on a disposable testing-mode server. External identity providers and MFA (B8) are still open.

These are listed for the full-project inventory; implementation remains backend-only under the user's standing instruction.

## External rollout — explicitly deferred

- D1: Repository/remote setup and actual remote Windows/Linux/container CI runs. Workflow files exist; executed remote results do not.
- D2: Hosting/staging/domain/TLS/reverse-proxy rollout and verification against the deployed application.
- D3: Protected offsite backup destination and restore access.
- D4: Install and operate worker/server under an OS process manager, with service identities, least-privilege paths and restart policy.
- D5: Container runtime validation. Docker CLI existed but the Engine was unavailable during earlier validation; no fresh build/run result is claimed here.
- D6: Provider credentials/model availability, costs, retention and live evaluation. No live provider call or credential inspection was performed for this audit. A previously removed example credential needs provider revocation by its owner if it was real.

User previously answered “leave it” for repository/staging/offsite targets. They remain deferred, not a request to ask for those targets again.

## Suggested execution order

1. Backend data minimization, API/documentation consistency, proxy policy and recovery protection (B7/B9/B11/B14).
2. Durable operational signals and reproducible load/failure tests (B10/B12), followed by chosen identity integration (B8).
3. Parser/context/geography contracts (B1–B3), then domain/retrieval expansion against independent evaluation (B4–B6). Keep KB dependencies excluded unless the user changes scope.
4. Resume rollout and remaining UI work only within the user's chosen scope. Close Phase 1 gates with independently reviewed evidence, not a claim that a passing local suite guarantees universal correctness.

This audit changed documentation and test artifacts only. It did not publish/approve evidence, configure accounts, restart the live service or deploy.

## Backend remediation update — 29 October 2026

B7 data minimization is implemented in verified-answer.js: all three provider stages receive a canonical request description, selected normalized parser fields and selected source claim text. Raw question, parser queryTerms, unselected retrieval records and arbitrary input fields are omitted. Returned draft extras are excluded from the verification payload. Original baseline output and local answerability/publication checks remain authoritative. This reduces model access to question nuance intentionally; general understanding still belongs to B1 and B2.

This does not redact personal information already present in curated evidence claims, establish provider retention terms or complete model-policy configuration. Those B7 operational requirements remain open. A synthetic name/email/phone/passport fixture verifies absence across all stages while retaining successful rewriting. The full run passed 335 of 336 tests with one overly broad fixture assertion against the ordinary word passport, which legitimately occurs in source guidance; after narrowing the assertion to actual synthetic identifiers, all 11 affected privacy/answer/capacity tests passed. See artifacts/backend-privacy-focused.txt. No live provider calls were made.

All other pending IDs above remain open unless explicitly marked implemented. This pass is not completion of the full roadmap.

Final verification after the privacy fixture correction: the complete 336-test suite passed with zero failures (artifacts/backend-privacy-tests.tap).

## Backend proxy and limiter update — 29 October 2026

B9 trusted-proxy handling is implemented as an explicit IP allowlist with bounded, normalized right-to-left X-Forwarded-For resolution. Spoofed headers from untrusted peers cannot change quota identity. Per-route-family limiter state now has a 10,000-client bound, rejecting new identities at capacity without evicting/resetting active quotas. This closes the local unbounded-map growth issue. Distributed quotas and real reverse-proxy deployment validation remain open. Deployment details are in DEPLOYMENT_CHECKS.md.

Verification for proxy/limiter changes: 340 tests passed and isolated standalone server smoke passed (artifacts/backend-proxy-tests.tap and artifacts/backend-proxy-smoke.json). Tests cover untrusted-header spoofing, multi-hop trust boundaries, IPv6 normalization, malformed/oversized chains, actual HTTP quota separation, capacity saturation and recovery. No live proxy or service configuration was changed.

## Backend encrypted evidence recovery update — 29 October 2026

B11 local evidence-backup encryption and authenticated isolated restore are implemented. New explicit CLI: scripts/evidence-recovery-encrypted.js backup|restore-drill, using EVIDENCE_BACKUP_KEY. WAL-safe snapshots, AES-256-GCM encryption, format separation from queue packages, restored data/schema verification and partial plaintext cleanup are tested. Existing plaintext backup commands/packages are unchanged; choose the encrypted command explicitly. Details and plaintext/crash limitations: ENCRYPTED_EVIDENCE_RECOVERY.md.

The full 342-test suite passed (artifacts/backend-encrypted-evidence-tests.tap). No live database, key configuration, schedule, service or KB content was changed. B11 automated protected scheduling, key lifecycle/retention, timed operational promotion and deferred offsite setup remain pending. This update does not close the remaining roadmap.

## Backend monitoring update — 29 October 2026

B10 now includes optional durable local aggregate HTTP metrics (RUNTIME_METRICS_PATH), a rolling 30-day UTC retention window, transactional counters across connections, and histogram-based p95/p99 upper bounds for local and persisted metrics. Storage failures are counted and isolated from response completion. Stored fields exclude request content and identifiers. See OBSERVABILITY.md for synchronous-write overhead, approximate percentiles and retention semantics.

All 344 tests passed; standalone smoke also passed with a disposable configured metrics database and authenticated persisted-metrics read. Reports: artifacts/backend-metrics-tests.tap and artifacts/backend-metrics-smoke.json. Worker heartbeat/progress, queue-age alerts, external alert delivery and operational load validation remain open. No live service or database configuration was changed.

## Backend queue monitoring update — 29 October 2026

B10 queue-age and lease/dispatch diagnostic alerts are now implemented through authenticated GET /admin/job-health and read-only scripts/queue-health.js. Counts and age thresholds are aggregate, with no credentials/identifiers. Future work and disabled schedules are distinguished from overdue demand. Failed/blocked retained jobs have separate actionable signals. Health observations do not execute, retry or claim jobs. CLI uses exit 0/2/1 for clear/attention/unavailable. See JOB_MANAGEMENT_API.md for costs and semantics.

All 347 tests passed; disposable worker smoke passed (artifacts/backend-job-health-tests.tap and artifacts/backend-job-health-smoke.json). Worker service heartbeat, operational alert routing/delivery and large-queue soak validation remain open. No live queue, KB or service configuration was changed.

## Backend supervised-worker heartbeat update — 29 October 2026

B10 registered-worker presence monitoring is implemented. Queue v4 stores bounded, retained worker presence; supervisor refreshes every 10 seconds and marks clean exits stopped. Queue health reports stale registered workers after 30 seconds even when there is no backlog. Recovery verifies presence rows and remains compatible with v2/v3 packages. Details and limits are in LOCAL_WORKER_OPERATIONS.md. Missing never-registered workers, expected fleet sizing and external incident delivery remain operational gaps.

All 348 tests and isolated server/worker smoke checks passed. Artifacts use the backend-heartbeat- prefix. No live queue was migrated or service installed. Other pending roadmap items remain open.

## Backend local capacity and API inventory update — 29 October 2026

B12 now has a configurable isolated HTTP load harness with disposable WAL databases, durable metrics enabled, bounded latency samples, event-loop/RSS measurements, citation checks and persisted trace verification. A 30-second concurrency-eight run passed 2,416 requests with p95 110.9 ms and p99 153.1 ms. Production/large-corpus/provider and long-duration soak gates remain open; this measurement does not establish them.

B14 now has a generated OpenAPI 3.1 route inventory (37 paths, 39 operations) and automated role-policy/literal-route consistency checks. Detailed editorial/domain request-response schemas remain permissive and still need completion. Stale role-UI, startup-only credential and no-dynamic-revocation wording in ADMIN_ACCESS.md was corrected. See LOCAL_CAPACITY_AND_API.md. All 349 tests passed (artifacts/backend-capacity-contract-tests.tap). No live service, credentials or KB content was changed.

## API request contract update — 29 October 2026

B14 request-field schemas now cover all 13 POST operations. Added feedback enums, review decisions, source registration/policy, restore publication/hash/idempotency fields, gap workflow fields and schedule bounds/defaults. Import envelopes document pending English records and server-assigned provenance restrictions; topic/jurisdiction/subject enums are generated from current code. Legacy reviewer/actor requirements versus authenticated identity injection are documented. Cross-field, date, English prose and publication-policy checks remain authoritative in runtime code.

The generated docs/openapi.json still has generic response objects; complete response schemas and standards-tool validation remain open. Eight affected inventory/auth/queue API tests passed after regeneration. No application runtime behavior, live data or frontend was changed.

## Operational response contracts — 30 October 2026

B14 now defines structured success responses for health/readiness, admin session, feedback, queue listing, schedule create/list/history, queue health, metadata and topics. Readiness 503 and standard JSON errors have distinct schemas. Existing 39-operation inventory and POST schemas remain intact. Live fixture HTTP tests validate operational payload structure, unauthorized access, running jobs, schedule history and draining against the generated contract. The structural test helper is intentionally not an independent full JSON Schema/OpenAPI validator.

Answer and remaining editorial response schemas, independent standards validation and generated-client verification remain open. No live server, KB or account data was changed. Current validation evidence: artifacts/backend-response-contract-tests.tap.

## Answer/parser/coverage response contracts — 30 October 2026

B14 now describes the complete current answer envelope: parsed query, claims and optional checklist steps, citations, gaps, clarification, optional retrieval candidates, answerability facets, verification counts, latency and bounded AI states. Parser and city/aggregate coverage success responses are also structured. HTTP contract tests exercise guidance, missing geography, occupation/eligibility gaps, checklist questions, missing licence origin, unrecognized intents and library-internet scope using disposable data.

Remaining B14 work is detailed retrieval/editorial/metrics response schemas and independent standards validation/generated-client checks. Runtime content/publication guarantees are not replaced by structural schema checks. Validation evidence: artifacts/backend-answer-contract-tests.tap. No live service, KB or frontend changes were made.

## Independent contract validation — 30 October 2026

B14 independent standards validation is implemented. Swagger Parser validates the OpenAPI 3.1 document with external reference resolution disabled; Ajv 2020 with formats compiles all 106 schema locations across 37 paths. Actual fixture HTTP response checks now use Ajv rather than a project-specific structural checker. Development dependencies are exact-version pinned in package.json/package-lock.json; CI installs them with npm ci --ignore-scripts. Application runtime still uses built-in Node modules. Initial install audit reported zero vulnerabilities; this is not a permanent security guarantee.

Run node scripts/validate-openapi.js after exporting. Full validation evidence is artifacts/backend-independent-contract-tests.tap. Remaining B14 scope: detailed retrieval/editorial/metrics response schemas and generated-client compatibility. Passing a permissive schema does not prove those missing definitions are complete. No remote CI run, live provider request or deployed change occurred.

## Retrieval, metrics and editorial contracts — 30 October 2026

B14 adds typed response schemas for retrieval results, process-local and persisted runtime metrics, intent metrics, gap listing/update/history, source listing/registration/policy, overview and direct review. Actual HTTP contract coverage includes persisted metrics, source registration/policy and nonempty overview/retrieval. Validation exposed a read/import schema distinction: historical records may include licence-origin jurisdictions outside the manual import allowlist. The read contract now reflects that while import constraints remain unchanged.

Remaining response definitions include candidate/change reports, publication history/restore, source suspension, review triage and some aggregate public endpoints. Independent validation and local fixture contracts run; generated-client compatibility remains open. Evidence: artifacts/backend-editorial-contract-tests.tap and artifacts/backend-editorial-openapi.json. No live database, publication or source policy changed.

## Complete current response-envelope coverage — 30 October 2026

B14 success-response schema coverage now includes every current API operation: candidate import/replay/decisions, change reports, publication history, restore, suspension, review triage, public aggregates and agency directory. Every JSON success response must have a defined object envelope in the inventory regression test; Atom is described as XML text. Actual HTTP/Ajv coverage now includes a complete disposable editorial sequence (register, permit, import, replay, approve, history, restore, suspend). Source policy/approval changes occur only in that temporary in-memory fixture.

Earlier entries listing generic editorial/retrieval/metrics responses as pending are superseded. Independent OpenAPI/JSON Schema validation is implemented. Remaining B14 gate is generated-client compatibility and ongoing documentation maintenance; full semantic policy correctness is enforced by runtime/regression checks, not inferred from schema validity. Other roadmap items B1–B13 remain at their separately recorded status. Validation: artifacts/backend-complete-response-tests.tap.

## Generated client verification — 30 October 2026

B14's remaining generated-client gate is implemented. generated/api.d.ts is produced by openapi-typescript; scripts/client-contract.ts uses openapi-fetch with those types. TypeScript strict/noUncheckedIndexedAccess checks enforce endpoint names, required request fields and feedback enums. A disposable backend test runs readiness, answer, feedback, disabled schedule creation/history and unauthorized-error flows through that typed client. These are representative integration paths, not exhaustive proof of every possible payload.

Commands: npm ci --ignore-scripts; npm run api:export; npm run api:validate; npm run api:client; npm run api:typecheck. Regenerate types whenever the contract changes. Generator, fetch client and TypeScript are exact-version development dependencies. TypeScript 5.9.3 matches the generator's declared 5.x peer requirement. The latest installation audit reported zero vulnerabilities. Application runtime remains unchanged.

Current API schema/validator/generated-client work package B14 is complete for the existing routes, with normal ongoing documentation maintenance required. Other product/infrastructure roadmap items remain open at their recorded status. Validation: artifacts/backend-generated-client-tests.tap. No live service, KB or credentials changed.

## Optional answer caching — 30 October 2026

B13 local deterministic baseline caching is implemented and defaults disabled. ANSWER_CACHE_ENTRIES opt-in supports bounded LRU/serialized bytes, 60-second TTL, exact-input hashing, evidence/calendar invalidation, independent returned objects and new persisted traces per request. AI output is not cached. Tests cover expiry/withdrawal, scopes, invalid requests, memory limits, mutation isolation and feedback linkage. ANSWER_CACHE.md documents request-derived text retention, lazy expiry, hashing overhead and limits; no speed improvement or production rollout is claimed.

Validation artifacts: backend-cache-tests.tap and backend-cache-smoke.json. This closes the local cache implementation item, while workload-specific performance acceptance remains B12. No live database or service configuration changed. Other roadmap items remain open.

## Request cancellation hardening — 30 October 2026

HTTP client disconnect now cancels active AI work and suppresses completed-answer trace/gap persistence when detected before the write. A pre-aborted library request invokes no provider; cancellation prevents later pipeline stages. Uncooperative providers retain their concurrency slot until settlement. Tests cover actual socket disconnect, sanitized aborted telemetry, no completed trace, listener cleanup and retained capacity. Details are in AI_CAPACITY.md.

Validation: artifacts/backend-cancellation-tests.tap and backend-cancellation-smoke.json. Broader B1–B8 product capabilities, independent reviewer gold data, production rollout and deferred external work remain at their recorded status; this is not completion of the whole roadmap. No live service was restarted or configured.

## Encrypted backup scheduling service — 30 October 2026

B11 now includes an explicit local backup loop for evidence or queue databases. It reuses encrypted verified backup implementations, prevents overlap within a process, uses fixed-delay cadence and bounded retries, emits sanitized success/failure/exhaustion events, and stops gracefully. Configuration and known limits are in BACKUP_SERVICE.md. Tests cover transient failures, exhausted cycles, logger isolation, cancelled waiting and active backup completion on stop.

The service is implemented but not installed or started against live data. Automatic retention/deletion, key rotation, multi-process coordination, timed operational promotion and deferred offsite transport remain open. This update does not close unrelated roadmap items. Full regression evidence: artifacts/backend-backup-service-tests.tap.

## Provider response resource limits — 30 October 2026

Both router providers and the legacy AnyRouter adapter now read successful HTTP bodies through a shared 256 KiB decoded-byte limit before JSON parsing. Content-Length is an early rejection hint only; actual streamed bytes are counted even when that header is absent or misleading. Strict UTF-8 decoding rejects invalid bytes. Oversized/aborted bodies are cancelled and reader locks/listeners released; HTTP error bodies are discarded before failover. Provider timeouts remain active through body consumption. This bounds application accumulation, not network stack buffers or a single transport chunk allocated before delivery. Custom fetch adapters must return standard Response-compatible readable bodies.

Focused validation: 23/23 tests pass, including exact boundary, split UTF-8, oversized chunked/misdeclared bodies, stalled cancellation, both providers, legacy adapter and failover. Full regression at the time: 364/368 pass in artifacts/backend-provider-response-tests.tap. The four excluded corpus/KB failures were resolved in 0.19.26: coverage and review-queue pins now expect 258 records (238 pending) after the 0.19.27 Denmark addition, and the licence-context fixture uses fictional Narnia instead of Brazil. The current full suite passes 397/397; see `CHANGELOG.md`. The whole roadmap is not complete.

## Provider/model allowlist implementation — 30 October 2026

B7 now supports AI_ALLOWED_PROVIDERS and OPENROUTER_MODELS, with bounded JSON arrays, explicit provider names, unique free-suffixed model identifiers and immutable per-router snapshots. Disabled providers cannot participate in failover even with configured keys. Legacy AnyRouter honors provider disablement. Invalid configuration fails before provider construction with sanitized errors. Existing defaults remain compatible; no provider availability, price or retention guarantee is inferred from identifiers. Configuration and operational limits: AI_PROVIDER_POLICY.md.

Validation: focused 24/24 tests and full 374/374 tests passed (artifacts/backend-ai-policy-tests.tap). No live calls, credentials, database contents, running service or external setup were changed by this work package. Other remaining capabilities are listed in the latest status above.

## Shared request quota implementation — 30 October 2026

B9 now includes optional same-host quota coordination through a separate SQLite database. RATE_LIMIT_DB_PATH and a protected RATE_LIMIT_KEY enable atomic counters shared across server processes and restarts. Existing route-family limits remain unchanged. Client identifiers use keyed hashes; active identity count is bounded. Incompatible keys/rules and unrelated databases are rejected. Database errors fail closed with sanitized 503 responses; readiness checks the configured quota store. SHARED_RATE_LIMITS.md documents configuration, clock/privacy/lock limits and rollout requirements.

Five new tests cover independent workers, two HTTP servers, reopen/expiry/capacity, configuration mismatch and contention. Full regression: 379/379 passed; OpenAPI validation: 37 paths, 107 schemas passed. Generated API client types include quota readiness failure. Evidence: artifacts/backend-shared-quota-tests.tap. No live service, database, key or environment configuration was changed. Multi-host distributed limiting, operational rollout and the other remaining capabilities are still open.

## Encrypted backup key rotation — 30 October 2026

B11 now includes scripts/backup-rekey.js for evidence and queue packages. A separate encrypted output is produced using a distinct key, fresh IV and GCM tag. Streamed decryption/re-encryption avoids plaintext database files; original ciphertext authentication and checksum verification complete before publishing the new manifest. Original packages remain untouched. Failed operations clean up their output files. Original backup time and verification digests are preserved. BACKUP_KEY_ROTATION.md documents protected environment settings, restore validation and limits.

Five new tests cover both package types, successful isolated restore with new keys, original recovery, wrong keys, ciphertext/checksum tampering, malformed manifests and sanitized CLI failures. Full suite at the time: 384/384 passed in artifacts/backend-backup-rekey-tests.tap (later additions bring the current suite to 391/391). This closes the local rekey implementation, not coordinated operational key rollout, automatic retention or independent restore acceptance. No real keys, live backup packages or production services were changed.

## Optional authenticated backup retention — 30 October 2026

B11 retention implementation now includes scripts/backup-retention.js (dry-run by default, explicit --apply) and opt-in post-success cleanup in the backup service. The policy preserves at least two authenticated packages and deletes only excess packages strictly older than the configured age. Rekey timestamps receive their own age grace. Wrong-key, corrupted, incomplete, extra-file, symlink/junction, hard-linked and unrelated packages are skipped without counting toward the retained minimum. Targets are checked again before individual file deletion; no recursive removal is used. Retention failure does not cause another backup attempt. Details and filesystem/metadata/concurrency limits are in BACKUP_RETENTION.md.

Seven new tests cover dry-run/apply, age/count boundaries, corrupt/unknown packages, path containment, configuration and scheduler isolation. Full suite: 397/397 passed in artifacts/backend-retention-tests.tap. No live backup deletion, environment change or service rollout occurred. Automatic retention is implemented but disabled until explicitly configured. Multi-process ownership, actual recovery acceptance, coordinated key rollout and other roadmap items remain open.

## Backup process ownership — 30 October 2026

The backup-service CLI now holds a dedicated SQLite write transaction for the lifetime of its canonical output root. A second participating process fails immediately; graceful shutdown releases ownership after active work, and process exit/crash releases the OS lock without stale-file deletion or lease expiry. Manual retention --apply uses the same lock. Invalid CLI policy/interval arguments reject before ownership creation. Separate roots remain independent. Ownership files reject unrelated schemas and unsafe file types.

Six focused tests pass, including an independent child-process crash, conflicting owners, hard links, incompatible files, manual retention contention and invalid-policy side effects. Full current workspace regression: 402/402 passed, zero skipped, in artifacts/backend-backup-owner-final-tests.tap. This count includes concurrent workspace changes; only the ownership and CLI validation work is attributed to this package. No live process was restarted or real backup removed.

Same-host coordination requires protected local storage. Direct library callers and manual backup/rekey commands must coordinate separately; this is not multi-host scheduling or OS process supervision. Use a separate root per source database. Do not delete or replace a live ownership database. See BACKUP_SERVICE.md and BACKUP_RETENTION.md. Other product and operational roadmap items remain open.

## Authentication bounds and test isolation — 30 October 2026

File-backed credentials now use a single opened descriptor and a bounded 65,537-byte buffer, enforcing the 64 KiB limit on bytes actually read. Strict UTF-8 rejects invalid byte sequences; temporary buffers are wiped and descriptors closed. Environment identity JSON is limited to the same byte budget. Existing atomic replacement/revocation and role checks remain intact. Two new tests cover exact limits, oversize, encoding errors, replacement and repeated invalid reads. SSO/MFA/sessions and separate-person review remain open; no editorial behavior was changed.

The first unrestricted node --test run discovered a concurrently added scripts/live-browser-http-test.js. That benchmark opens data/settlement.sqlite and submitted 180 HTTP answers, including one S16 HTTP 500; 403 isolated tests passed, but the benchmark failed. Its requests can persist answer traces/gaps in the working database; no rollback or deletion of that data was attempted. This is not a passing live benchmark claim.

Default npm test now explicitly selects test/*.test.js, and the CI workflow uses npm test, preventing scripts with test-like names from accidentally executing live benchmarks. The final isolated suite passed 403/403 (artifacts/backend-auth-isolated-tests.tap). The failed broad run is preserved in artifacts/backend-auth-bounds-tests.tap. Run live benchmarks only deliberately with isolated storage/configuration; their S16 failure remains untriaged in this backend-authentication change. ADMIN_ACCESS.md documents the configuration limits.

## Isolated HTTP benchmark remediation — 30 October 2026

The two 180-question benchmark modules no longer open the working database during import or execution. Questions were extracted unchanged into a side-effect-free module. HTTP execution now uses disposable in-memory storage, disabled AI, an ephemeral loopback port, request deadlines and finally cleanup. Direct-engine execution is entry-point guarded and also uses in-memory storage. Three regression tests cover module import isolation, repeated S16 trace persistence and explicit reporting of expectation mismatches.

Final npm test: 406/406 passed (artifacts/backend-benchmark-isolation-tests.txt). The independent explicit 180-question HTTP run had zero runtime/request failures and 180 traces, but 90 historical answer expectations did not match seed-backed answers; it correctly exits 1. See artifacts/isolated-http-180.json and ISOLATED_QUESTION_BENCHMARK.md. No expected answers or KB content were altered. The original live S16 500 did not reproduce, so its underlying cause remains unconfirmed rather than claimed fixed. No live database or provider was used in this pass. Other roadmap capabilities and KB-dependent quality gates remain open.

## Sanitized backend failure diagnostics — 30 October 2026

Answer request failures now identify their fixed execution stage and bounded error category in correlated server logs. SQLite primary/extended codes classify busy/locked/constraint/read-only/I/O/full/corrupt failures without exposing SQL or messages. Request-local context is removed at completion, and arbitrary stage values cannot enter logs. Public error contracts and metric cardinality are unchanged.

Three additional tests cover category bounds, injected failures at evidence read/refresh/persistence and state cleanup. Full isolated suite: 409/409 passed (artifacts/backend-failure-diagnostics-tests.txt). This improves future incident diagnosis; it does not establish the cause of the old live S16 500, resolve the 90 historical expectation mismatches, or complete independent quality/product gates. No live database, account, service or external logger was changed. See OBSERVABILITY.md.

## SQLite contention response and recovery drill — 30 October 2026

Recognized busy/locked SQLite failures now return sanitized 503 storage_busy with Retry-After: 1 through the common HTTP error handler; other unexpected errors remain 500. Added a disposable real-lock recovery harness using two SQLite connections, concurrent HTTP batches and the same running server before/during/after the lock. It verifies 200/503/200 phases, no partial trace/gap/workflow persistence, distinct trace IDs, diagnostic categories and database quick_check.

Eight-concurrent-request standalone drill passed: 16 successful traces, eight expected contention failures and recovery without restart (artifacts/storage-recovery-drill.json). Two new regression tests and updated diagnostics expectations pass; full isolated suite: 411/411 (artifacts/backend-storage-recovery-tests.txt). See STORAGE_RECOVERY_DRILL.md. This advances B12 functional failure recovery, not production soak or independent quality acceptance. The historical S16 cause remains unconfirmed and the 90 answer expectation mismatches remain open. No live database, provider, account or service was changed.

## Evidence write readiness — 30 October 2026

The readiness probe now checks evidence reads plus immediate write-lock acquisition and a zero-row trace-table write, then rolls back only its own transaction. Locked, read-only and query-only evidence storage returns the existing sanitized storage_unavailable 503. Busy waiting is temporarily disabled and restored, keeping lock contention from delaying the probe behind a configured busy timeout. No record/trace is changed.

Two new tests cover real second-connection lock contention/recovery, unchanged data, timeout restoration, read-only/query-only rejection and preservation of pre-existing transactions. Full isolated suite after correcting a read-only fixture that lacked application SQLite functions: 413/413 passed (artifacts/backend-write-readiness-tests.txt). See DEPLOYMENT_CHECKS.md for transient readiness, write-lock competition and disk-space limitations. No live service/storage/configuration was changed. Other roadmap and quality gates remain open.

## Bounded request body lifetime — 30 October 2026

POST body parsing now uses an explicit 10-second total read deadline and bounded 12,000-byte reader. It rejects declared or streamed oversize with 413 and incomplete slow uploads with 408, closing the failed-upload connection. Timeout/disconnect/size/error/success paths release reader listeners, timers and byte references. Existing strict UTF-8, JSON checks and post-body authorization remain enforced. The previous async-iterator early return could destroy the stream before reliably delivering a size error; explicit reader settlement now permits that response.

Three new tests verify split bytes and cleanup, disconnect/declared-size handling, real slow HTTP uploads, no trace persistence and healthy follow-up traffic. Full isolated suite: 416/416 passed (artifacts/backend-request-body-tests.txt). No live server or database was changed. This closes a request resource-lifetime gap; it does not complete broader parser/context/identity features, independent quality gates or deferred rollout. DEPLOYMENT_CHECKS.md records timing and event-loop limitations.

## Continuous local queue-health monitoring — 30 October 2026

B10 now includes a read-only polling monitor with fixed, sanitized attention/unavailable/recovered events. Initially healthy and unchanged states remain quiet. Active alert-code changes are emitted with aggregate counts; failed output callbacks are retried without acknowledging the state. The CLI reopens the existing queue read-only per poll and supports signal-driven shutdown. It neither dispatches work nor changes queue records.

Five new tests cover transition deduplication, unavailable reports, output failures, real queue state preservation and cancellation. Full isolated suite: 421/421 passed (artifacts/backend-queue-monitor-tests.txt). QUEUE_MONITOR.md documents setup and limitations, including process-local deduplication, potential hung sinks and no remote/durable notification delivery. No live monitor or external alert destination was configured. Broader product, independent quality and deferred deployment work remains open.

## Queue monitor callback deadlines — 31 October 2026

Read and output callbacks now have a five-second default deadline and receive a cancellation signal. Timeout fails the monitor without overlapping retries; ordinary settled rejections remain retryable. Shutdown detaches uncooperative asynchronous callbacks, handles late rejection and releases timers/listeners. QUEUE_MONITOR.md documents configuration and the limits of synchronous filesystem blocking and external cancellation.

Eight focused monitor tests passed, including three new deadline/cancellation cases. Full current workspace suite: 425/425 passed (artifacts/backend-monitor-timeout-tests.txt); this count includes concurrent workspace additions. No live monitor, external sink or database was changed. Remaining product/quality/rollout tasks are still open.

## Bounded backup event logging — 31 October 2026

Backup diagnostics now permit only one pending asynchronous callback; an unresponsive sink cannot accumulate callbacks across backup cycles. Later events are counted as dropped until settlement. Ordinary logger rejection releases the slot and is counted independently of backup success. Shutdown does not wait on pending diagnostics; returned counters expose pending/dropped state. The CLI honors stdout write callbacks and stops future cycles on stdout failure.

Three new tests cover stalled logging, late rejection, slot recovery and invalid/throwing thenables. Ten focused backup-service tests and the full 428-test suite pass (artifacts/backend-backup-logging-tests.txt). BACKUP_SERVICE.md records best-effort delivery and native-stream shutdown limits. No live backup process, filesystem package, provider or account was changed. Remaining product, evaluation and deployment work remains open.

## Bounded HTTP failure logging — 31 October 2026

HTTP observability now caps pending asynchronous logger deliveries (16 by default), counts drops rather than building an unbounded queue, and retains capacity until actual callback settlement. Local/persisted metrics and responses remain independent of log delivery. The standalone stderr sink now honors stream callbacks and handles errors. Admin runtime metrics, OpenAPI and generated client types expose loggingPending/loggingDropped.

Four new tests cover saturation, recovery, malformed callbacks, actual stream backpressure and stream errors. Nine focused tests and the complete 432-test isolated suite pass (artifacts/backend-http-logging-tests.txt). See OBSERVABILITY.md for best-effort delivery, per-process capacity and native/synchronous blocking limits. No live service, storage, credentials or external collector was changed. Remaining product and independent quality/deployment gates remain open.

## English phrasing and multi-part intent preservation — 31 October 2026

B1 parser work now normalizes typography (NFKC, curly apostrophes, dash variants and whitespace) before deterministic matching, without translating or inferring locations/facts. Banking/housing without-job disambiguation preserves a separately requested find/look/search/seek work intent. Plural/family and could-I eligibility phrasing plus qualifies now create the existing unsupported personal-eligibility facets. Parser version is english-rules-0.10. KB records, approvals and expected benchmark answers were not changed.

Four new tests cover typography equivalence, separate employment intent, eligibility phrasing and geography/language abstention. Eleven focused tests, all 436 isolated tests and 96 developer evaluation cases (28 pilot + 68 expanded) pass. Evidence: artifacts/backend-question-phrasing-tests.txt, artifacts/evaluation.json and artifacts/evaluation-expanded.json. These developer fixtures are not independent gold validation. General multi-turn state, broad timeline/constraint interpretation and the earlier 90 historical expectation mismatches remain open; this closes specific phrasing defects, not universal question understanding.

## Explicit timeline answerability — 31 October 2026

B1 query contract query-2 recognizes explicit processing-time and application-deadline requests. Timing facets remain unsupported unless a future structured evidence implementation can actually satisfy them; generic summaries and approved flags do not count. Timing-only output is identified as timeline, while eligibility/checklist preferences remain composable. Multi-topic timing facets are unassigned rather than guessed. OpenAPI and generated client enums were updated. No KB content, source approvals or benchmark expectations changed.

Four new tests cover phrasing, incomplete source guidance, multi-part composition, privacy, AI fallback and geography. Full isolated suite: 440/440 passed (artifacts/backend-timeline-tests.txt); 96 developer evaluation cases passed. The HTTP schema test was then extended with an actual timeline request and passed independently. See TIMELINE_ANSWERABILITY.md. Broad temporal reasoning, general multi-turn state, independent gold evaluation and prior historical benchmark mismatches remain open.

## Country scope validation and API alignment — 31 October 2026

Existing parser destination definitions now live in a shared module used by OpenAPI response schemas. The previous country: CA-only response contract incorrectly excluded valid global responses; schemas and generated clients now include all existing supported countries. The request country field is documented. Invalid explicit countries reject with 400, while contradictory selection/text/Canadian context requires clarification instead of silently overriding location.

Three new parser tests plus actual parse/answer HTTP schema coverage for all eight response countries passed. Full isolated suite: 443/443 (artifacts/backend-destination-contract-tests.txt); 96 developer evaluation cases passed. DESTINATION_CONTRACT.md describes the intentional input-validation tightening and limits. No country coverage, KB record or approval was added. Full hierarchical geography, multi-turn state and independent accuracy/rollout gates remain open.

## Dotted destination abbreviations — 31 October 2026

Fixed country inference at dotted abbreviation boundaries and aligned unsupported-destination scanning with the shared global country patterns. U.S./U.S.A., U.K. and U.A.E. now work at end-of-input, before punctuation and before further words. Conflicting countries/Canadian cities still require clarification; ordinary us and longer dotted words do not become supported countries. Explicit country input semantics remain unchanged.

Two new tests cover abbreviation variants, boundaries, negative words and scope conflicts. All 445 isolated tests and 96 developer evaluation cases passed (artifacts/backend-country-abbreviation-tests.txt and evaluation reports). No KB content or operational configuration changed. Full geography hierarchy, conversation context and independent quality gates remain open; DESTINATION_CONTRACT.md records the exact scope.

## Multi-city residence scope — 31 October 2026

Removed the residence-wording override that silently cleared multi-city ambiguity. Living in one city no longer causes a question about another city to receive only residence-scoped guidance. Multiple pilot cities require clarification regardless of sentence order or selected city. Single-city and repeated same-city mentions remain unchanged; AI cannot bypass the geography gate. Parser version is english-rules-0.11.

Four new tests cover seven residence phrases, same/cross-province cities, selection/order, unaffected single-city behavior and AI bypass protection. All 449 isolated tests and 96 developer evaluation cases pass (artifacts/backend-multicity-tests.txt and evaluation reports). No KB content changed. Per-clause geography, comparison responses, broader context state and independent quality gates remain open; DESTINATION_CONTRACT.md documents the conservative tradeoff.

## Larger-corpus capacity fixture and scoped validation — 31 October 2026

B12 soak tooling supports bounded record expansion (multiplier 1–32, total at most 10,000) in its disposable database. Copies are explicitly synthetic and pending. A 2,580-record diagnostic exposed expensive validation of irrelevant records; retrieval now rejects out-of-scope jurisdiction/topic records first while retaining full validation of every ranked candidate. No KB records or publication statuses were changed outside disposable fixtures.

Three new tests cover valid bounded expansion, source immutability, collision rejection and invalid relevant evidence exclusion. Full isolated suite: 452/452 passed; 96 developer evaluation cases passed. Two short concurrency-four runs reported 12 versus 28 successful requests and p95 about 2.65 versus 1.95 seconds. These are noisy diagnostics, not production performance acceptance. LARGE_CORPUS_SOAK.md documents fixtures, metrics, artifacts and remaining event-loop/representative-soak limits. Other product and quality gates remain open.

## Confirmed follow-up context (B2) — 31 October 2026

B2 now has an explicit client-held context contract, context-1 (docs/CONVERSATION_CONTEXT.md). The earlier resolver silently carried the previous city and country into every question, defaulted to Canada when none was given, appended arbitrary client topic text, and built regular expressions from client values, so a value such as `(` could fail the request. Context now applies only to recognized follow-up questions, requires an `at` timestamp no older than 30 minutes, accepts only known topics, pilot cities and supported countries, and never replaces a place selected or named in the current turn. Every inherited value is returned in a new optional `context` answer field as an unconfirmed assumption with a user-facing message. The server stores no conversation state. OpenAPI request/response schemas and generated client types were updated.

Six resolver tests plus HTTP coverage (applied, expired, absent) pass; full suite 697/697 (artifacts/backend-conversation-context-tests.txt). Still open within B2: broader follow-up detection, more than one previous turn, and showing the assumption message in the public UI. Requiring `at` is an intentional tightening for existing API clients.

## Versioned geography registry (B3) — 31 October 2026

B3 now has a typed, versioned registry, geo-1 (docs/GEOGRAPHY_REGISTRY.md). It holds countries, regions, cities and one neighbourhood with parents, aliases and a status of supported, known_unsupported or outside_canada. Pilot city aliases, province detection and the unsupported/conflicting place lists previously lived in separate regular expressions; `parse()` now reads all of them from this one table. Parsed questions carry geographyVersion. New read-only endpoint `GET /v1/geography` publishes places with their ancestor path; OpenAPI and generated client types were updated.

A before/after `parse()` comparison on 505 inputs showed zero differences. Five new tests cover hierarchy integrity, consistency with the knowledge-base city list, alias boundaries, known-unsupported, outside-Canada and unknown-place clarification, and the HTTP endpoint. Full suite 702/702 (artifacts/backend-geography-registry-tests.txt); 96 developer evaluation cases pass. Still open within B3: independently reviewed place labels, more neighbourhoods and provinces, per-clause geography, and ambiguity handling that offers place choices (for example London, Ontario versus London, UK).

## Specific place clarifications (B3) — 31 October 2026

Location clarifications no longer use one generic sentence. The answer explains the actual problem (unsupported place, multiple cities, conflicting provinces, conflicting countries, unknown place or missing location). A new optional `placeClarification` field lists the places mentioned with labels, status and registry path. Places sharing a name are offered as alternative readings: "London" returns London, Ontario and London, United Kingdom, and points to choosing the United Kingdom as the destination country. Pilot cities are selectable only when the question names no place. London, ON was added to the registry without an alias, so `parse()` output was unchanged on all 505 recorded inputs. OpenAPI and generated client types were updated.

A new test covers all six reasons, the London readings, selectable-city rules and absence on located answers. Full suite 711/711 (artifacts/backend-place-clarification-tests.txt); 96 developer evaluation cases pass. Still open: the public UI does not read `placeClarification`; per-clause geography; independently reviewed place labels.

## Elliptical follow-ups and place inheritance fix (B2) — 31 October 2026

Follow-up detection now also recognizes short elliptical questions of up to eight words, such as "And for my wife?", "What about Vancouver?", "Same for Brampton?", "For my kids?" and "In Brampton?". Longer questions starting with "and" stay self-contained. This also fixed a defect: a follow-up that named a province or an uncovered place ("What about tenant rights in Ontario?", "What about Ottawa?") previously inherited the previous city, so it could have been answered for Toronto. Any registry place named in the follow-up now blocks place inheritance, so uncovered places reach the geography gate.

Two new tests; full suite 713/713 (artifacts/backend-followup-phrasing-tests.txt); 96 developer evaluation cases pass. Still open within B2: more than one previous turn, modelling who a follow-up is about, and showing the context message in the public UI.

## Optional alert webhook delivery (B10) — 31 October 2026

The queue monitor can now deliver its transition events (attention, unavailable, recovered) to an operator-chosen HTTPS webhook via `ALERT_WEBHOOK_URL`, with optional HMAC-SHA256 signing via `ALERT_WEBHOOK_SECRET`. Only documented event fields are sent and redirects are refused. Failed deliveries are retried on the next poll rather than dropped. Configuration errors never echo the URL or secret. See QUEUE_MONITOR.md.

Five new tests use a local loopback receiver and cover URL/secret validation, payload allowlisting, signature verification, unsigned mode, rejected/redirected/unreachable deliveries, and retry through `monitorQueue`. Full suite 726/726 (artifacts/backend-alert-webhook-tests.txt). No external destination was configured or contacted. Still open within B10: a chosen production destination with secret management, alerts for HTTP/runtime metrics (only queue health transitions are delivered), a persistent outbox, and an end-to-end failure drill.

## Runtime alerts (B10) — 31 October 2026

A new runtime monitor (`scripts/runtime-monitor.js`, docs/RUNTIME_MONITOR.md) polls `/admin/runtime-metrics` with an admin token and alerts on problems within each poll window: HTTP 5xx error rate, answer p95 latency, dropped or failed failure logs, and metrics persistence failures. Server restarts reset the baseline instead of producing false alerts. Events use the same transition, retry and optional webhook delivery as the queue monitor. To support this, the queue monitor's transition logic is now shared (`monitorTransitions`), process-local metric buckets expose their latency histogram, and OpenAPI and generated client types were updated. Plain-HTTP polling is refused except on loopback because the token is sent each time.

Five new tests cover error-rate and latency thresholds, restart handling, logging counters, emitted transitions and a real server read with the admin token. Full suite 731/731 (artifacts/backend-runtime-alerts-tests.txt). No monitor was installed and no external destination was contacted. Still open within B10: a chosen production destination, aggregation across several server processes, a persistent outbox, and an end-to-end failure drill.

## Persistent monitor alert state (B10) — 31 October 2026

The queue and runtime monitors can now keep their last delivered alert state in a dedicated SQLite file (`ALERT_STATE_PATH`, `src/monitor-state.js`). A restart no longer re-sends alerts that are still active, and a transition whose delivery failed is still delivered after a restart. Keys are hashed so queue paths and server URLs are not written to disk; foreign databases and invalid saved states are refused. The runtime reader now reports its baseline polls as "no observation", which avoids false recoveries after a restart.

Four new tests cover no-repeat after restart, undelivered-transition survival, runtime baseline behaviour, hashed keys, invalid state and foreign databases. Full suite 735/735 (artifacts/backend-monitor-state-tests.txt). Still open within B10: a production destination, aggregation across server processes, and an end-to-end failure drill. This stores the latest state rather than a full event history.

## Everyday newcomer vocabulary (B1) — 31 October 2026

The rule-based parser did not recognise common everyday words, so questions such as "How do I find a family doctor?", "walk-in clinic", "refill my prescription", "find an apartment", "Presto card", "subway fare" or "data plan" had no topic. A new developer-written probe set (evaluation/everyday-vocabulary-probes.json, 35 questions across all 13 topics) recognised 15/35 before this change and 35/35 after. Added vocabulary: health (doctor, family doctor, walk-in clinic, clinic, prescription, refill, hospital, emergency room, dentist, dental, nurse practitioner, vaccine/vaccinated/vaccination), housing (apartment, condo, basement unit, roommate, sublet, one-/two-/three-bedroom), transit (subway, streetcar, Presto, Compass Card, public transport/transportation, fare) and telecom (data plan, phone plan/bill/provider/carrier, phone number, but not "emergency phone number"). Parser version is english-rules-0.12.

A before/after parse comparison on 505 recorded inputs changed 7 results, each reviewed. Three location-clarification questions now also carry a topic (doctor or apartment) while still asking for a covered place. Two school-immunization questions gain health beside family. Two IFHP prescription and dental questions gain health beside money. "Pharmacy" was deliberately left out of health so pharmacy-credential questions stay employment-only, and a full-suite failure exposed "walk in" in ordinary sentences, so the space form now requires "clinic". Two new tests; full suite 743/743 (artifacts/backend-everyday-vocabulary-tests.txt); 96 developer evaluation cases pass. The probes check topic recognition only, not answer quality, and are not an independent gold set. Broad timeline/constraint interpretation, multi-part facets and independent labelled evaluation remain open within B1.

## Recommendations sweep — 31 October 2026

Seventeen smaller improvements were implemented together; see docs/RECOMMENDATIONS_2026-10-31.md. They include escaping five server values in frontend `innerHTML` templates, Toronto/Mississauga/Brampton/Vancouver neighbourhoods and nearby uncovered cities in the geography registry (North and West Vancouver are no longer read as Vancouver), softened CRS feasibility labels with an advisory that its cut-offs are not live, a webhook signature verification helper, more everyday vocabulary (probe set 45/45), and README/config/doc corrections. Parser output changed for one of 505 recorded questions ("Doctor near Scarborough" now resolves to Toronto). Full suite 745/745 (artifacts/backend-recommendations-tests.txt); 96 developer evaluation cases pass.

## Parser regression from parallel destination work — 31 October 2026

Between 12:08 and 12:13 another session widened global destination detection (`src/destinations.js` aliases such as H-1B, and direct global questions in `src/engine.js`). Combined with the geo-1 unknown-place check, three recorded questions turned into clarifications:

- "How do I get health coverage in London UK?" and "Can I exchange my driver licence in Sydney Australia?" were now correctly read as UK and Australian questions, but "London UK" and "Sydney Australia" after "in" were treated as unknown places. Fix (`src/geography.js`): when the question is about another destination country, a phrase that names that country within its first three words ("London UK", "Manchester UK") is not an unknown place.
- "I lived in California … on an H-1B visa … from Toronto Ontario?" became a two-country conflict, because "H-1B" is now a United States destination signal. Fix (`src/engine.js`): when the only foreign country left in the question is the one already identified as the person's origin, it does not conflict with a Canadian destination.

Result against the last snapshot before the parallel change: the H-1B question is back to Toronto, CA, not ambiguous. The London and Sydney questions now go to the United Kingdom and Australia. Before the parallel change, both were wrongly read as Canadian questions with a missing location. Real conflicts still ask for clarification ("Health card in Toronto and the UK", "Moving to London, what about rent?"). Two new tests in test/geography-registry.test.js; full suite 815/815 (artifacts/backend-parser-regression-fix-tests.txt); both evaluation sets pass. One intermediate run failed `api-inventory.test.js` on `/v1/tools/border-flagpoling` while the other session was still adding that route; it passed on rerun.

## SaaS plans and limits — 1 November 2026

The product can now run as a SaaS with four plans: Free, Plus, Pro and Team (plans-1; see docs/SAAS_PLANS.md). Plans set monthly limits on chat answers and tool runs, and tool access by tier. Seventeen safety and legal-rights tools are open on every plan and never metered. Unknown tools default to the Plus tier. SaaS mode is opt-in (`ACCOUNTS_DB_PATH`, `ACCOUNTS_SECRET`). It adds hashed API keys, monthly-rotating anonymous metering, 402/429 responses with upgrade or reset details, `GET /v1/plans` and `GET /v1/account`, an account CLI (`scripts/accounts.js`) and a sidebar plan widget. In SaaS mode the 65 tools that used to run themselves on page load wait for the visitor to submit, so opening the page uses no quota.

Market research (sources in docs/SAAS_PLANS.md) added two missing tools: a language score → CLB/NCLC converter (IELTS General, CELPIP, PTE Core, TEF and TCF Canada) and an Express Entry proof-of-funds calculator (July 2025 amounts, CEC and job-offer exemptions). Not built yet: billing, customer login, live IRCC data (processing times, draws, application status), case management, seats. Browser-checked in both modes on disposable databases. Full suite 1619/1619 (artifacts/saas-plans-tests.txt); both evaluation sets pass. One existing test pinned the service-worker cache to v19 and now accepts v19 or later.

## Customer sign-up and login — 1 November 2026

SaaS mode now has customer accounts with email and password: `POST /v1/auth/signup`, `/login`, `/logout` and `/password`. Passwords are scrypt hashes, and sessions use an HttpOnly, SameSite=Strict `ns_session` cookie whose token is stored only as a hash. Login errors are generic, and 10 failed logins per email in 15 minutes lock that email for the window. A password change logs out other sessions. `scripts/accounts.js reset-password` issues a one-time temporary password. The sidebar widget offers log in, sign up, change password and log out, with API keys as an alternative. Existing accounts databases upgrade in place. Browser-checked on a disposable database: sign-up, session after reload, logout, generic wrong-password message, re-login. The cookie is not readable from JavaScript. Four new tests (test/customer-auth.test.js); full suite 1629/1629 (artifacts/customer-auth-tests.txt). Not built: email verification and emailed reset (no email provider), SSO and two-factor authentication, self-service API keys, billing.

## Email verification and password reset — 1 November 2026

Customer accounts now confirm their email and can reset a forgotten password by email (`/v1/auth/verify`, `/verify/resend`, `/reset/request`, `/reset/confirm`). Mail goes through `src/mailer.js`: the `console` provider for development, or `resend` (`RESEND_API_KEY`, `EMAIL_FROM`). Tokens are single use and hashed: verification lasts 24 hours and reset 60 minutes, with at most 3 emails per account per hour. A reset request always gets the same answer, and a successful reset ends every session. Links come only from `PUBLIC_ORIGIN` or a loopback host, so a forged Host header cannot redirect them; a raw-HTTP test covers this. The sidebar has "Forgot password?", a new-password form opened from the link (which removes the token from the address bar), and a notice for unconfirmed email. Browser-checked end to end with the console provider: sign-up email, confirm link, forgot-password email, reset form, old password refused, new password accepted, reused link refused. Five new tests (test/email-reset.test.js); full suite 1634/1634 (artifacts/email-reset-tests.txt). Not built: a production sender domain, SSO, two-factor authentication.

## Self-service API keys — 1 November 2026

Signed-in customers can create, list and revoke their own API keys (`GET`/`POST /v1/account/keys`, `POST /v1/account/keys/revoke`) and from the sidebar's "API keys" section. Keys are managed only from a browser session, never with an API key. A confirmed email is required when email is configured. Plan limits apply (Free 1, Plus 2, Pro 3, Team 10; 409 `key_limit_reached`). Listings show a short id, label, created and last-used dates, never the key, and a new key is shown once. "Last used" is written at most hourly; existing databases gain the column in place. Browser-checked: blocked before email confirmation, created after it, key worked, limit disabled the button, one-time box cleared, revoke returned 401 for the key. Three new tests (test/self-service-keys.test.js); full suite 1645/1645 (artifacts/self-service-keys-tests.txt).

## Usage dashboard — 1 November 2026

Accounts can now see their month-to-date usage. `GET /v1/account/usage` (session or the account's API key) returns totals, limits, a projection, daily rows and a per-key split, from a new `usage_daily` table written beside the monthly counter. The sidebar's "Usage dashboard" dialog shows usage tiles, a pace warning, two daily bar charts with hover/focus tooltips, a table view and a per-key table. Chart colours passed the dataviz palette validator on the app's light and dark surfaces. Browser-checked in dark and light themes. A screenshot showed a tooltip overflowing the right edge and a misaligned note; both were fixed and rechecked (no horizontal scroll). One new test (test/usage-dashboard.test.js); full suite 1646/1646 (artifacts/usage-dashboard-tests.txt).

## Lazy tool loading — 1 November 2026

On the site without plans, the 65 tools that show an example result no longer all run on page load. `autoRun(run, anchor)` in `public/plan-access.js` runs a tool when the view containing it is first opened, using a MutationObserver on the view's `hidden` attribute. Tools whose view is already visible, or that are outside a view, run at once as before. SaaS mode is unchanged: tools run only when the visitor submits. Each of the 65 setup functions passes its first DOM element as the anchor. Measured in the browser: 5 `/v1` requests per page load instead of 68 and 0 tool requests on load. Opening the Pathway view ran its 16 tools once, and reopening it ran none. Opening all 21 views made 64 tool requests with no JavaScript errors. Three quick reloads plus all views no longer hit the 120/minute limit. A regression test fails if a setup function runs its tool directly again or calls autoRun without an anchor. Full suite 1648/1648 (artifacts/lazy-tool-loading-tests.txt).
