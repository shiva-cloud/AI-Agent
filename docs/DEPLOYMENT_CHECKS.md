# Deployment checks — 2026-10-29

`node scripts/server-smoke.js` now boots the actual standalone server as a child process with an ephemeral loopback port, temporary database, generated temporary admin token and external AI disabled. It verifies readiness, static UI delivery, unauthorized admin rejection, authorized session access, answer API and cross-origin rejection. It stops its own process and validates its temporary path before cleanup. It never touches the working database or the existing port-3000 process.

On Windows the child termination check is not a POSIX signal/drain test. The separate lifecycle suite tests active-request drain and deadline behavior. On Linux the smoke uses SIGTERM.

## HTTPS reverse proxy

`PUBLIC_ORIGIN` optionally specifies the exact externally visible HTTP(S) origin (for example, `https://settlement.example.com`). It may not contain a path, trailing slash, query, fragment or credentials. The configured origin replaces the local HTTP origin comparison. The server does not infer permission from `X-Forwarded-Host` or `X-Forwarded-Proto`; tests prove those headers cannot grant cross-origin access.

Origin checking is not authentication. Admin role/token checks remain required. Terminate TLS at a trusted proxy, restrict direct backend access, and configure `PUBLIC_ORIGIN` to the actual host. No domain, TLS certificate or proxy was provisioned here. Rate limits remain process-local and based on the socket IP; proxy deployments need a separately designed trusted-proxy client-IP policy before broad public use.

## CI and container checks

The GitHub Actions workflow includes Node tests, developer evaluation, pre-flight, worker smoke and child-process server smoke on Windows and Linux. An Ubuntu job builds the Docker image, starts it with loopback-only published port 3300, polls readiness and removes the disposable container/volume afterward.

Local Docker CLI is installed, but Docker Desktop's Linux engine was unavailable during validation. Container build/run is therefore **not verified locally**. The CI definition has not been run on a connected remote repository. These are explicit remaining gates, not completed deployment evidence.

## Remaining non-KB engineering work

- Activate and inspect remote CI; build/run the container on an available engine.
- Actual staging/TLS setup, production rollback and deployment-specific health/signal verification.
- Individual-account rollout, role-aware UI controls, stronger session/MFA/SSO lifecycle where required.
- Worker supervisor/admin controls and separate queue backup/retention.
- Encrypted offsite recovery, durable log collection and alerting.
- Repeatable browser/mobile/accessibility checks for current UI. Prior browser access restrictions were respected in this pass.

KB research, content updates, live fetching/parsing, approval and KB schema expansion are excluded by the user's instruction.

## Trusted proxy client addresses — 29 October 2026

The standalone server optionally reads TRUSTED_PROXY_IPS as a JSON array of at most 32 explicit IPv4/IPv6 addresses. Default is no trusted proxies. Invalid values fail startup before opening the working database. CIDRs, hostnames, ports, wildcard trust and zone identifiers are rejected. Embedded apps pass trustedProxyIps to createApp. Behind a proxy, deploy with the exact proxy IPs configured (for example `TRUSTED_PROXY_IPS='["10.0.0.5"]'`); without this every client shares the socket peer's bucket and one busy source can throttle everyone else into 429s.

Prometheus metrics are no longer public: `/metrics` and `/v1/metrics` require a bearer. Set `METRICS_TOKEN` to a secret of at least 24 characters (pass `metricsToken` to `createApp()` when embedding) and give that value to your scraper; without it any valid admin actor may scrape, and when admin is disabled (loopback development default) the endpoints stay open. Tests cover both behaviors in `test/security-headers-and-guards.test.js`.

Only a trusted immediate socket peer can supply X-Forwarded-For. The resolver walks right-to-left through trusted hops and stops at the first untrusted address. It normalizes IPv6 and IPv4-mapped addresses. Invalid chains, over 16 addresses, or headers over 2,048 characters fall back to the socket peer. Forwarded and X-Real-IP are ignored. This affects quotas only: it does not grant roles or change the explicit PUBLIC_ORIGIN policy. Configure a trusted proxy to overwrite incoming forwarding headers or append its actual observed client address, and restrict direct backend access. Never add an untrusted intermediary to the trusted list.

Each route-family limiter retains at most 10,000 client buckets. New identities receive 429 when capacity is full; existing quotas stay intact. Periodic expiry cleanup permits new identities again, and counts saturate after the quota is exhausted. This trades new-client availability for bounded memory during high-cardinality traffic. Quotas remain per process; distributed deployment and operational validation remain pending.

## Evidence write readiness — 30 October 2026

GET /ready now verifies evidence reads, immediate SQLite write-lock acquisition and a zero-row trace-table write before rolling back its own transaction. It returns the existing storage_unavailable 503 when evidence storage is locked, read-only, query-only or otherwise inaccessible. The probe changes no records or traces. It temporarily disables busy waiting and restores the connection's configured busy timeout, so a blocked writer does not stall the probe behind a long configured timeout. A transaction the probe did not start is never rolled back.

This is a point-in-time readiness check. It briefly competes for the SQLite writer lock and can transiently fail under normal contention; configure readiness thresholds accordingly and do not use this as a liveness restart trigger. A successful zero-row write does not establish free disk space, future commit success, backup health or independent queue/metrics write availability. No request can be guaranteed merely because readiness passed earlier.

## Bounded POST body lifetime — 30 October 2026

POST request bodies now have an application-level total read deadline of 10 seconds in addition to the 12,000-byte limit and existing HTTP server timeouts. This deadline starts when the authorized request begins body consumption, does not reset for dripped bytes and excludes subsequent answer generation. Declared oversized Content-Length is rejected before buffering; streamed bytes are always counted. Oversized uploads return 413 payload_too_large and slow bodies return 408 request_timeout with Connection: close. The reader releases its timer, byte references and listeners when complete, rejected or disconnected. No partial body reaches mutation dispatch.

Library callers can set createApp's bodyTimeoutMs to an integer 1–15,000 for deterministic testing or stricter policies; the standalone default remains 10,000. The deadline cannot interrupt synchronous event-loop stalls. Header reception remains governed by the HTTP server's transport timeouts. Closing failed-upload connections avoids accepting further work on an unfinished body. Healthy requests use the existing JSON, UTF-8 and post-body authorization checks.
