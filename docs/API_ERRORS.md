# API error contract

Error responses preserve the existing `error` text and add a stable `code`. Clients should prefer HTTP status and code over matching prose.

| HTTP | Code | Meaning / next action |
| --- | --- | --- |
| 400 | `invalid_request` | Correct the input |
| 401 | `unauthorized` | Supply valid admin authorization |
| 403 | `forbidden` | Request blocked by origin policy |
| 404 | `not_found` | Resource does not exist |
| 409 | `conflict` | Reload current state; do not blindly replay a stale edit |
| 413 | `payload_too_large` | Reduce request size |
| 415 | `unsupported_media_type` | Send application/json |
| 429 | `rate_limited` | Respect Retry-After |
| 500 | `internal_error` | Internal failure; no exception details exposed |
| 503 | `service_unavailable` | Service/admin unavailable |
| 503 | `service_draining` | Server shutting down; retry later |

Readiness uses its existing `{status, reason}` contract rather than an error envelope.

Explicit validation failures in the engine, language/date validators, store, ingestion and gap workflow use `ValidationError`. Only instances of this intentional error type expose their messages. Generic errors, TypeErrors, SQLite errors and objects merely claiming a status code return the same sanitized 500 response.

Missing evidence/source/trace resources return 404. Already-decided candidates, stale publication/restoration requests, conflicting idempotency keys, stale gap revisions and duplicate source registration return 409. Record/candidate approval gates still apply. Invalid URLs and malformed feedback trace IDs are validated before calling APIs that would otherwise throw internal exceptions.

The UI distinguishes conflicts (reload the item) and server failures (retry shortly). There is no automatic replay of editorial writes. Operator-side structured error logging and correlation IDs remain future work; this contract does not replace observability or RBAC.

Regression coverage includes intentional validation, forged error objects, unexpected exceptions, missing resources, invalid URLs/trace IDs, duplicate registration and English UI wording. Full validation: 243 tests passed, 58 developer evaluation cases passed and 10 pre-flight checks passed. Tests used disposable stores; no live database changes or app restart were performed.
