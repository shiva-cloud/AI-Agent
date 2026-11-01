# Queue health transition monitor

Run `node scripts/queue-monitor.js [interval-ms]` with an explicit `JOB_DB_PATH` pointing to an existing queue. Default polling is 10 seconds; allowed interval is 1 second through 1 hour. The CLI opens the database read-only on each poll and closes it immediately, so temporary unavailability can recover on a later poll. It never creates/migrates a queue, dispatches schedules, claims jobs or alters worker presence.

Output consists of newline-delimited JSON events for changes in the set of active alert codes:

- `queue_monitor_attention`: backlog, stale heartbeat, expired lease, late dispatch, retained failed jobs or retained blocked jobs.
- `queue_monitor_unavailable`: unreadable or incompatible queue, or an invalid health report. Raw exceptions are excluded.
- `queue_monitor_recovered`: a previously reported problem returns to healthy.

An initially healthy queue stays quiet. Repeated unchanged conditions stay quiet; changing counts or ages alone do not generate more events. Counts accompanying a transition are a snapshot, not a continuously refreshed gauge. Returning from unavailable to an active problem emits attention. A failed sink callback does not acknowledge the transition, so it is retried on the next poll. Identity/path/target IDs, source URLs, credentials and raw exceptions are never included. The existing `queue-health.js` command remains available for full point-in-time aggregate details and action suggestions.

SIGINT/SIGTERM interrupts polling waits and detaches an in-flight asynchronous callback. Each read and event callback receives an operation AbortSignal and has a default five-second deadline. Library callers can configure operationTimeoutMs from 1 to 60,000 milliseconds. A timeout signals cancellation and rejects the monitor with monitor_timeout; it does not retry a still-outstanding callback. Ordinary settled failures retain their existing retry behavior. Only one read/delivery runs at a time. The CLI writes stdout using write callbacks rather than building an unbounded delivery queue.

Deduplication is process-local; restarting re-emits active problems. There is no persistent delivery queue, remote notification transport, periodic reminder or exactly-once delivery guarantee. Running multiple monitors can produce duplicate events. This implementation does not install a service or connect an external alert destination. Protected local process supervision and log collection remain operator deployment tasks.

Tests cover silence, condition transitions, recovery, sanitized unavailable reports, output retries, real read-only queue observations and cancellation. No live monitor was started against user data.

## Callback deadline limits — 31 October 2026

Timeout/abort cleanup removes timers and parent-signal listeners. Late promise rejection is handled. Uncooperative callbacks may continue after the monitor stops; the monitor cannot undo a late delivery or forcibly cancel external work. A hung native stream may still hold process handles. Synchronous SQLite/filesystem calls block the event loop and cannot be interrupted by JavaScript timers, so this is not a hard OS shutdown guarantee. Supervision should treat a timeout as a monitor failure and investigate before restarting repeatedly. Three additional tests cover stalled reads/sinks, no overlapping retries, cancellation, late rejection and listener cleanup.

## Optional HTTPS webhook delivery — 31 October 2026

Set `ALERT_WEBHOOK_URL` (and optionally `ALERT_WEBHOOK_SECRET`) to send each transition event to a webhook as well as stdout. Implementation: `src/alert-webhook.js`; tests: `test/alert-webhook.test.js`.

- **Destination rules.** The URL must use HTTPS; plain HTTP is accepted only for loopback testing (`localhost`, `127.0.0.1`, `[::1]`). URLs with embedded credentials or a fragment, and single-label host names, are rejected at startup with a message that does not echo the value. Redirects are refused.
- **Payload.** Only `event`, `status`, `alerts` (code and count) and `at` are sent as JSON. Any other field on the event is dropped.
- **Signature.** With a secret of at least 32 characters, requests carry `X-Northstar-Timestamp` (Unix seconds) and `X-Northstar-Signature: sha256=<hex>`, an HMAC-SHA256 of `<timestamp>.<body>`. Receivers should recompute it, compare in constant time and reject old timestamps. Without a secret, requests are unsigned.
- **Failures and retry.** A non-2xx response, a refused redirect, an unreachable host or the monitor's operation deadline (default 5 seconds, which aborts the request) counts as a failed delivery. The transition stays unacknowledged and nothing is written to stdout for it, so the next poll retries it. stderr gets a one-line reason code, never the URL or secret.
- **Limits.** Delivery is at-least-once only while the monitor keeps running. There is no persistent outbox, so a restart re-emits active problems, as before. A receiver that accepts a request but responds late can receive duplicates. No webhook destination has been configured or contacted for this project; choosing and securing one (for example a paging or chat service) remains an operator deployment step.

## Persistent alert state — 31 October 2026

Set `ALERT_STATE_PATH` to a dedicated SQLite file (it refuses databases with other tables) to remember each monitor's last delivered state across restarts. The same variable works for `scripts/runtime-monitor.js`. Implementation: `src/monitor-state.js`; tests: `test/monitor-state.test.js`.

- **No repeats.** After a restart, an alert that was already delivered and is still active stays quiet. Recovery is still reported when the problem clears.
- **No forgetting.** A transition whose delivery failed was never saved, so after a restart it is delivered as soon as the condition is observed again.
- **What is stored.** Each row holds a hashed monitor key (a hash of the queue path or server origin), the state string such as `["attention",["queue_wait_exceeded"]]`, and the time it was saved. A saved state that does not match the monitor's codes is ignored. Read or write failures are counted as `stateFailures` and do not stop alerting.
- **Runtime baselines.** The runtime monitor's first poll, and its first poll after a server restart, now count as "no observation", so a persisted alert is neither repeated nor falsely marked recovered before a real window is measured.
- **Limits.** The file stores the last state, not a queue of past events: if several transitions happen while delivery is failing, only the current condition is delivered afterwards. Two monitors for the same target sharing one file can still both deliver the same transition.
