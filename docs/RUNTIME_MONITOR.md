# Runtime alert monitor

`node scripts/runtime-monitor.js [interval-ms]` watches a running server and emits an event when its health changes. It works the same way as the queue monitor (QUEUE_MONITOR.md): events go to stdout as newline-delimited JSON and optionally to the HTTPS webhook (`ALERT_WEBHOOK_URL` / `ALERT_WEBHOOK_SECRET`). Implementation: `src/runtime-monitor.js`; tests: `test/runtime-monitor.test.js`.

## Configuration

| Variable | Meaning |
| --- | --- |
| `RUNTIME_MONITOR_URL` | Server base URL, for example `http://127.0.0.1:3000`. Plain HTTP is accepted only for loopback, because the admin token is sent on every poll. |
| `ADMIN_TOKEN` | Admin bearer token (at least 24 characters) with read access to `/admin/runtime-metrics`. |
| `RUNTIME_ALERT_ERROR_RATE` | Optional, default `0.05` (5% of requests answered with HTTP 5xx). |
| `RUNTIME_ALERT_ANSWER_P95_MS` | Optional, default `10000`. Must be one of the histogram bounds: 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 30000, 60000. |

The default polling interval is 60 seconds; the allowed range is 1 second to 1 hour.

## How problems are detected

Each poll reads the process-local counters from `GET /admin/runtime-metrics` and compares them with the previous poll, so every alert describes only the time since the last poll. For that reason, process-local buckets now include their 14-bin latency `histogram` (OpenAPI and client types updated).

| Code | Raised when, within one poll window | `count` |
| --- | --- | --- |
| `server_error_rate_high` | At least 20 requests and at least the configured share answered 5xx. Client disconnects (499) are excluded. | 5xx responses |
| `answer_latency_high` | At least 10 successful answers and their p95 upper bound is above the threshold | Answers above the threshold |
| `logging_dropped` | Failure log events were dropped because the logger was saturated | Dropped events |
| `logging_failures` | The logger rejected events | Failures |
| `metrics_persistence_failures` | The optional metrics database could not be written or read | Failures |

Events are `runtime_monitor_attention`, `runtime_monitor_unavailable` (server unreachable, token rejected, or an invalid response; the token and URL are never included) and `runtime_monitor_recovered`. As with the queue monitor, an unchanged set of active codes stays quiet, and a failed delivery is retried on the next poll.

The first successful poll only sets a baseline. If any counter goes down, the server has restarted; that poll resets the baseline. Both count as "no observation", so requests between the last poll and the restart are not evaluated. With `ALERT_STATE_PATH`, the last delivered state also survives monitor restarts (see QUEUE_MONITOR.md).

## Limits

- One monitor watches one server process. Counters are process-local, so several server processes need several monitors and are not aggregated.
- Short windows with little traffic never alert on error rate or latency, because of the minimum counts. A low-traffic outage may first show up as `runtime_monitor_unavailable` or through the readiness probe.
- Latency uses histogram bin upper bounds, not exact percentiles.
- No monitor service was installed and no webhook destination was configured or contacted. Running the monitor under a process manager and choosing a destination remain deployment steps.
