# Local HTTP performance and throttling

Run `node scripts/http-benchmark.js` (or the `benchmark-http` package script). It starts an isolated loopback server on a random port, explicitly disables external AI adapters and uses a disposable file-backed SQLite WAL database. It never targets the active server or working database. A resolved-path check confines cleanup to the temporary benchmark directory.

The test submits 80 answer requests at concurrency 5 across eight English questions, checks response shape and citation linkage, and confirms 80 persisted traces. Then 40 health requests consume the remainder of the 120-request fixed window; the next request must return 429 with a positive Retry-After header. Each answer request has a ten-second client timeout. Failures appear in the JSON report and set a nonzero exit status. Results are written to `artifacts/http-benchmark.json`.

On 28 October 2026, the observed run completed 80 answers in 517 ms, with median latency 24.1 ms, p95 117.7 ms and p99 125.5 ms. All responses and trace writes passed, and request 121 was throttled. These are short local loopback observations with 27 seed records, not sustained capacity, real-user latency or a production SLA. External providers, remote networks, large corpora and distributed deployments are excluded. The benchmark includes cold connections and does not claim statistical repeatability.

## Rate limiter change

The per-process, per-socket-IP fixed-window quota remains 120 requests per 60 seconds. It now uses a monotonic clock, resets at the exact window boundary and supplies Retry-After seconds on rejection. Blocked requests do not extend the window. Three deterministic tests exercise reset, independent clients and expired-entry cleanup without waiting a minute. The real HTTP throttle path is exercised by the benchmark.

All 166 project tests pass. Rate limiting still applies to all same-origin requests, including health and static assets. It is not a distributed quota or a proxy-aware identity system. Production load testing, provider latency measurement, proxy configuration, metrics collection and capacity planning remain pending. Restart older local server processes to load the updated limiter.
