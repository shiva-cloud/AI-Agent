# Durable worker queue foundation

`src/jobs.js` provides a SQLite WAL job queue with a required, explicit path. It refuses to use a database containing the evidence `records` table. `src/job-worker.js` runs one due job using explicitly injected authorization and handlers. Neither module starts a scheduler, fetches websites, imports evidence or publishes content by itself.

## Guarantees

- Jobs survive queue close/reopen. Request keys deduplicate enqueue; changed kind/target/retry limit under the same key is rejected. Reusing a key does not reschedule a job.
- `BEGIN IMMEDIATE` serializes claims across SQLite connections. Each claim increments attempts and receives a fresh opaque lease token.
- Completion and heartbeat require the current token and an unexpired lease. Expired jobs are reclaimed on the next claim. After the attempt limit they become failed.
- `availableAt` supports delayed dispatch. Failed handlers retry with exponential delay, capped at 60 seconds; default maximum is three attempts. Queue callers may configure 1–10 attempts.
- Policy is checked on every attempt before the handler. Denied jobs or missing handlers become blocked without automatic retries. A policy exception fails the attempt; it never grants authorization.
- Deadlines abort the handler signal. Delayed authorization cannot start a handler after its deadline. A stale worker cannot commit queue completion.
- Job payloads contain only bounded ASCII identifiers, one of `source_check`, `verify_snapshot`, `reindex`, scheduling/state metadata and fixed result codes. Raw questions, fetched text, credentials and exception messages are not persisted.

## Execution semantics and limits

This is **at-least-once execution**, not exactly-once external side effects. An expired lease can permit another attempt while a stalled handler still runs. Handlers must honor cancellation and implement idempotency or fence writes using the lease token at their side-effect boundary. Do not wire publication to an arbitrary handler. Human approval and source permissions must remain authoritative.

The runner requires an authorization callback; production callbacks must check the current source permission/suspension state and target identity. Fixture authorization is not a production source policy. All three job kinds currently require caller-provided handlers; there are no default live handlers.

SQLite is intended here for workers sharing one local filesystem, not multi-host distributed execution. The job database is separate from evidence backup manifests; its backup/retention and operations must be designed before production use. There is no enqueue HTTP API, process supervisor, dead-letter UI, parser/fetch adapter, automatic source update, or reindex implementation yet. The subsequent recurring scheduler foundation is documented in `SCHEDULER.md`; it is opt-in and has no live schedules by default.

## Validation

Run `node scripts/worker-smoke.js` for a disposable demonstration of success and policy denial. It does not access the working database or network.

Tests cover restart persistence, competing connections, stale completion and heartbeat rejection, lease exhaustion, retries/delay, policy rechecking, denied/missing handlers, deadline handling, input bounds, idempotency conflict and refusal to open an evidence database without changing its digest.

The full suite includes a corrected concurrent Atom-feed test: its hostile-title fixture is explicitly published only in an in-memory store and sorts into the bounded feed; the expected update-tag count includes the feed-level tag. Live KB/publication state was untouched.
