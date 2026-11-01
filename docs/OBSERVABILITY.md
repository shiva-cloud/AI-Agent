# Runtime observability

Every handled HTTP request receives a server-generated UUID in `X-Request-ID`. Caller-supplied IDs are ignored. The header is also set on static responses, errors and readiness probes. Request IDs are distinct from answer trace IDs and are not persisted in the evidence database. The UI retains the ID for API failures and displays it as a reference on HTTP 500 errors.

The standalone server emits one JSON event to stderr for a completed 5xx response or an aborted response. Events include only: event type, generated request ID, fixed route category, HTTP status, elapsed milliseconds, timestamp, bounded stage and failure category. They exclude raw paths/query strings, bodies, authorization headers, IP addresses, exception messages and stacks. Thus an operator can correlate a reported reference with its category/time/status without retaining a personal question.

`GET /admin/runtime-metrics` uses the existing admin authorization boundary. It reports process-local counts, mean/max latency by category/status, and logging failure count. Categories are fixed (`answers`, `probes`, `admin`, `public_api`, `other`), avoiding user-controlled path cardinality. Aborted responses use internal metric status 499. A response is counted once even when both finish and close events fire. The metrics request appears after its own response finishes.

Library/test callers can supply a fourth `createApp` argument `{logger: event => ...}`. Default library logging is silent; the standalone startup enables stderr output. Synchronous logger throws and rejected logging promises are counted without changing the response. A custom sink must return promptly; hung sinks, external collector retention and backpressure require deployment-specific handling.

Metrics reset at restart and are neither distributed counters nor persisted service-level objectives. Mean/max latency is not p95. This feature does not implement alerting, durable external log storage, AI-provider tracing, individual RBAC or production monitoring dashboards. Readiness's 503 failures and shutdown's 503 responses are included; malformed transport traffic rejected before the request handler is outside this scope.

Validation: correlation header uniqueness, matching failure-event IDs, admin-only access, field exclusion, one event per abort, logging failure isolation and safe UI reference formatting. No live restart, external collector, KB writes or provider calls were performed.

## Persistent aggregate metrics and latency histograms

Set RUNTIME_METRICS_PATH to a separate SQLite file in an existing protected directory to opt into persistent aggregate metrics. It must not point at an evidence, job or index database. The server owns and closes this connection at shutdown. Embedded callers inject metricsStore and own its lifecycle. No live metrics path was configured here.

The authenticated runtime-metrics endpoint keeps its processLocal buckets and adds persisted aggregates plus persistenceFailures. Persistence retains fixed route category, HTTP status, daily UTC bucket, latency-bin count, total latency and maximum only. It stores no raw question, URL, request ID, IP, token or exception. Multiple local connections increment counts transactionally. SQLite WAL and a 100 ms busy timeout bound lock waiting; writes are synchronous and their performance must be measured under production load. Persistence errors increment a process-local counter and do not change the completed HTTP response. A failed write is not retried and may be lost.

Both local and persisted snapshots report p95UpperBoundMs and p99UpperBoundMs from fixed histogram bins (5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 30000, 60000 ms, overflow). They are approximate upper bounds; null with a nonempty bucket means the quantile is above 60000 ms. The persisted snapshot covers today and the preceding 29 UTC days. Old rows are removed on the next metric write and excluded from reads even before cleanup. These are aggregate metrics, not a durable request log.

External collectors, alert delivery, worker heartbeat/progress monitoring, distributed service-level objectives and production soak testing remain pending. Earlier statements that all metrics reset on restart are superseded only when this optional store is configured.

## Bounded failure diagnostics — 30 October 2026

Failure events now include stage and failureCategory alongside their server-generated request ID. Answer stages distinguish read_evidence, generate_answer, refresh_evidence and persist_answer; quota/identity/dispatch cover the remaining annotated phases. Only fixed stage names are accepted. SQLite primary and extended error codes map to bounded storage_busy, storage_locked, storage_readonly, storage_io, storage_corrupt, storage_full, storage_constraint or storage_error labels. Type, range and syntax errors have fixed labels; other errors remain unclassified. Disconnections use client_disconnect.

No message, stack, raw error code, SQL, request body, path or credential is emitted. Public error responses remain unchanged. Context is held in a WeakMap only for the request and removed at completion; diagnostics do not add metric cardinality or persistent raw exception storage. These fields identify where a failure was observed, not its proven root cause. Readiness failures and explicit 503 responses without captured exceptions may remain unclassified. The prior S16 failure cannot be retrospectively diagnosed from these new fields.

## Bounded asynchronous HTTP logging — 31 October 2026

Observability now limits pending logger callbacks to 16 per application instance (library option maxPendingLogs, integer 1–256). When full, it drops new diagnostic events instead of retaining their payloads or starting additional logger operations. Request handling, local counters and configured durable metrics still run. Synchronous loggers release capacity immediately; asynchronous callbacks retain it until actual settlement, including late rejection. Logger failures remain isolated from HTTP completion.

Authenticated runtime metrics now expose loggingPending and loggingDropped alongside loggingFailures. Dropped events are not durable and cannot be reconstructed from the counter. A hung sink can occupy all slots until it settles or the process restarts; there is no growing retry queue. The standalone server uses stderr write callbacks so stream backpressure holds slots rather than silently building an unbounded console buffer. Stream errors are handled and subsequent writes reject with a fixed message. Library stream loggers have an explicit dispose method for streams that have finished writing; the standalone process keeps its stderr error listener for process lifetime.

OpenAPI and generated client types include the new counters. Limits are process-local, do not cancel external delivery, and cannot interrupt a synchronously blocking callback. External durable collection and deployment alert delivery remain operational work.
