# Remaining-work follow-up — 1 November 2026

This supersedes the Docker and update/retention status in `LOCAL_RELEASE_2026-11-01.md`.
Scope remains local development and packaging; no production rollout or real subscriber delivery.

## Completed in this pass

- Fixed missing `/offline.html` serving and moved its blocked inline stylesheet to `/offline.css`. Every service-worker precache URL now has an HTTP regression check.
- Clean-package testing exposed working-database assumptions in four tests. They now use disposable database fixtures; retrieval tests use the explicit fixture records and do not fabricate database publication approvals.
- Encrypted backup mirroring now requires an explicit 24+ character passphrase and snapshots SQLite through its backup API, preserving committed WAL writes. Retention rejects invalid counts and only prunes this helper's own named encrypted snapshots.

- Extracted update lifecycle behavior into `public/app-lifecycle.js`. New service workers wait for an explicit update action; editable inputs trigger a before-unload warning. Reloading from the update notice requires confirmation when entries have changed. No form values are stored or sent.
- Subscription country names/codes normalize consistently. Matching includes applicable national notices and excludes unrelated provinces/cities. Dispatch rechecks active subscription status immediately before claiming a queued delivery.
- Added `scripts/subscription-retention.js`: preview by default; `--apply` explicitly redacts inactive/stale contacts and cancels pending deliveries. Default inactivity window is 365 days, configurable with `--days=N` (30–3650). It does not erase immutable source evidence. No live retention action was run.
- Added transport validation for overflowing JSON numbers and excessive nesting. All **194 documented calculator POST routes** reject nested `1e309` inputs with HTTP 400. Legitimate finite negative values are preserved; this is not a substitute for each calculator's domain validation.
- Added a recursive frontend-module HTTP regression so a missing imported module cannot silently ship as an all-menus-broken UI.
- Docker Desktop was started, the Node 24 image built, and a disposable local container became healthy. Readiness, static UI, lifecycle/plan modules and unauthenticated subscription rejection passed.

## Verification

| Check | Result |
| --- | --- |
| Final frozen-package clean-install regression | **1,685 passed; zero failed** |
| Focused suite after numeric guard | 6 passed, including HTTP checks across 194 calculator routes |
| Earlier combined security/lifecycle regressions | 15 passed |
| OpenAPI validation | 277 paths, 1,197 schemas |
| Client generation and TypeScript contract | Passed with openapi-typescript 7.13.0 |
| Browser keyboard navigation | All 21 sidebar destinations visibly opened |
| Mobile workspace | Visible; 375px document width and scroll width, no horizontal overflow |
| Local WAL-backed load check | 80 requests, concurrency 5, all 80 traces persisted, zero failures, throttle/retry guidance passed |
| Local load latency | p50 53.9ms; p95 1,274.6ms; about 36.1 requests/second including startup effects |
| Container | Image built; healthy; local HTTP smoke passed |

Browser pointer automation intermittently timed out, including one transition that
visibly completed despite the timeout. Keyboard navigation was independently
verified. Exhaustive pointer/touch, every tool submit/reset/download, accessibility
and update across multiple real browser tabs are **not** claimed complete.

The browser initially loaded HTML but could not initialize after another workspace
edit added a module unavailable in the already-running test server. Restarting the
isolated server loaded the matching route/module set. Deploy a fixed source
snapshot and restart the server; do not hot-edit a running release directory.

## Dependency result

Three moderate development-only audit entries remain in the openapi-typescript →
Redocly → minimatch chain. Testing npm's proposed 6.7.6 downgrade introduced two
high-severity dependency findings and a TypeScript contract failure; it was
reverted. The compatible 7.13.0 generator is restored. No forced override,
suppressed advisory or insecure downgrade is shipped. See the upstream
[dependency upgrade issue](https://github.com/openapi-ts/openapi-typescript/issues/2644)
and [migration guide](https://openapi-ts.dev/migration-guide).

## Still pending

- A compatible audited generator migration or upstream dependency fix.
- Independent review of immigration/legal/financial constants and legacy evidence, canonical publication provenance, and human-reviewed evaluation data.
- Exhaustive browser/touch/form coverage, broader per-calculator domain validation, remaining monolith decomposition, and sustained production-like load with external providers.
- Production hosting/TLS, identity lifecycle/SSO, remote CI, offsite recovery, live provider and alert-destination acceptance. Local container verification does not prove these.
- Product-scoped hybrid retrieval, encrypted save/resume and government integrations.

Evidence is in `scratch/remaining-full-tests.log`, `scratch/remaining-final-focused.log`,
`scratch/remaining-browser-navigation.json`, `scratch/remaining-load.json`,
`scratch/remaining-container-smoke.json`, and `artifacts/remaining-mobile-workspace.png`.
These logs contain test results; the release package excludes working data and credentials.

## Final package validation

The final frozen snapshot passed all 1,685 tests after a fresh `npm ci --ignore-scripts`. The subscription contract now models subscribe and cancel as separate required-field alternatives. The read-only Docker container ran as UID 1000 with all capabilities dropped; readiness and both offline assets returned 200. Temporary smoke containers were stopped. The release includes a per-file SHA-256 manifest and excludes test-generated files and installed packages.
