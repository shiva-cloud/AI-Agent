# Backend verification — 2026-10-29

## Result

The tested local backend paths pass after repairs. This is not a guarantee that every possible input, external provider or production deployment works. No live knowledge content or approval state was modified, no external AI calls were made, and the running app was not restarted.

## Defects reproduced and fixed

1. **Concurrent AI failover:** a shared mutable round-robin index let one request's progress change another request's fallback order. A request could retry the failing provider twice and never try the healthy provider. Each request now captures its own start position and attempts each provider once. A deterministic interleaving test failed before the fix and passes after it.
2. **UTF-8 request corruption:** decoding each network chunk separately replaced a split multibyte character. A split invisible formatting character bypassed the intended language validation. Requests now accumulate bounded byte buffers and decode once with strict UTF-8 validation. Invalid encoding is rejected; split characters are preserved and validated.
3. **JSON media type:** prefix checking accepted `application/json-invalid`. Exact media-type matching now rejects it while accepting case-insensitive JSON with parameters.
4. **Storage error responses:** SQLite failures returned raw internal details as HTTP 400. City coverage also incorrectly converted database failures into unknown-city 404. Known storage/filesystem failures now return sanitized HTTP 500; only an unsupported city returns the city 404 response.
5. **Legacy AI adapter budget:** the older adapter still advertised 45 seconds while the active router used 12. Both now use the 12-second answer budget; removed the unused server import.
6. **Gap schema transaction cleanup:** table/index creation moved inside the migration's rollback handler, so schema creation failures do not bypass transaction cleanup.

## Verification evidence

| Check | Result |
| --- | --- |
| Node syntax checks across `src` and `scripts` | 38 files passed |
| Full automated suite | 238 passed, 0 failed |
| Developer question evaluation | 58 cases, no failures |
| Pre-flight | 10 checks passed |
| Isolated HTTP benchmark | 80 requests, concurrency 5, AI off; no failures |
| HTTP latency | p50 24.1 ms, p95 134.0 ms, p99 155.6 ms |
| Persistence/throttling | 80 traces persisted; HTTP 429 verified |
| Running localhost readiness | `/ready` returned 200 / ready |
| Running metadata | version 0.19.2, English, research-preview |
| Live database read-only verification | Integrity, foreign keys, English guards/schema checks and hashes passed |

The read-only database inspection found 30 evidence records, 30 sources, six migrations, zero snapshots, zero publications and zero source-policy reviews. Migration 6 is already present in the inspected database; this audit did not apply it. Readiness does not certify that the running process has loaded edits made during this audit. A restart is needed to load changed modules.

Artifacts: `artifacts/backend-tests.tap`, `artifacts/backend-evaluation.json`, `artifacts/backend-preflight.json`, `artifacts/backend-http.json`. New targeted regressions are in `test/backend-audit.test.js`. Existing tests cover ingestion/publication, suspension/restoration, English constraints, WAL backups/restore drills, gap transactions, rate limiting, AI cancellation/capacity, retrieval and shutdown.

## Remaining limits

- Provider endpoints/models, latency, credentials and current availability were not exercised live; adapters were tested with mocks. Docker/staging/TLS and platform signal behavior remain unverified here.
- Rule-based geography and intent detection are incomplete. Generic source guidance and citation linkage are not proof of personal eligibility or factual completeness. Developer evaluation cases are not independently reviewed gold labels.
- Admin authentication remains a shared token with self-reported actor labels, not individual RBAC. This remains a release limitation.
- Follow-up implemented typed validation/resource/conflict errors and sanitized unexpected failures across HTTP-facing workflows. See `API_ERRORS.md`; structured operator logging and correlation IDs remain pending.
- Aggregate admin endpoints and the in-memory lexical index have not been validated at production corpus size. The 80-request benchmark is not a soak/load-capacity test.
- Resolved in the follow-up: operational CLI commands and server now share `DB_PATH` selection, with explicit CLI paths taking precedence. Policy lint is read-only. See `DATABASE_OPERATIONS.md`.
- Backups are local plaintext; encrypted offsite recovery remains open. No browser validation was performed as part of this backend check.

See `AUDIT_REMEDIATION.md` and `PROJECT_AUDIT_AND_ROADMAP.md` for the remaining engineering milestones. The appropriate conclusion is “tested backend paths pass with known limitations,” not “all backend behavior is guaranteed correct.”
