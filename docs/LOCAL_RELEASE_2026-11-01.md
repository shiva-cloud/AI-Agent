# Local release handoff — 1 November 2026

Latest follow-up: see [remaining-work results](REMAINING_WORK_2026-11-01.md). Container execution, update protection and subscription retention have since progressed; historical results below describe the earlier package.

Scope: local remediation and a reviewable deployment package. No live rollout,
account provisioning, real webhook message or reviewer approval is included.

## Verified

- Full regression snapshot: 1,603 tests passed, zero failures (bounded concurrency).
- OpenAPI: 261 paths, 1,146 schemas validated; TypeScript client generation and typecheck passed.
- Standalone server and queue worker smoke checks passed with disposable databases and external AI disabled.
- Preflight and developer evaluation passed. These test code behavior, not independent factual accuracy.
- Compose configuration validates. Docker Engine is unavailable on this host; image build/run remains unverified.

## Changes in this remediation

- Sidebar scrolling restores access to lower menu entries. Four local preparation tools cover checklist gaps, history consistency, family deadlines and application changes.
- Realtime simulation, polling and subscription management require administrator authentication. Simulation is disabled by the production entry point.
- Public high-risk evidence and alerts require editorial provenance. Bulk approval script is disabled; no approvals were invented.
- Crawling requires a recorded, source-specific access review. Downloads are bounded, redirects rejected, full baseline text retained, and failed ingestion does not advance checkpoints.
- Heuristic extraction no longer invents effective dates. Immutable realtime snapshots retain the actual text used for quotes.
- Alerts filter geography and evidence availability before pagination. Unsupported email/Telegram subscriptions are rejected.
- Webhook outbox supports bounded retries, crash recovery, signing, stable delivery identity and cancellation with contact redaction. Tests use mocked receivers only.
- Unsupported image/PDF extraction no longer produces fabricated document text. Plain-text input remains available.
- Database verification includes realtime tables and snapshot/checkpoint hashes.
- Docker uses Node 24, a non-root user, durable volumes and readiness checks; the local port binds to loopback only.

## Start locally

Use Node 24 or newer. From the package directory:

```powershell
npm ci --ignore-scripts
npm test
$env:HOST='127.0.0.1'
$env:PORT='3100'
$env:DB_PATH='data/settlement.sqlite'
npm start
```

Admin is disabled unless a valid secret or individual identities are configured.
Use the existing `docs/ADMIN_ACCESS.md` procedures; never place real credentials
in a release archive. This package does not contain the working database.

With Docker Engine running:

```powershell
docker compose -f compose.local.yaml config --quiet
docker compose -f compose.local.yaml up --build -d app
```

The crawler profile is opt-in. Record actual source-access reviews with
`node scripts/review-crawl-access.js SOURCE_ID allow REVIEWER "specific rationale"`.
Use `DB_PATH` consistently for both the review command and worker. No source is
automatically permitted by the release. Start the worker only after reviews:
`docker compose -f compose.local.yaml --profile crawler up -d crawler`.

`node scripts/realtime-delivery-runner.js` only enqueues. Actual delivery needs
an operator's `--deliver` action plus `ALERT_WEBHOOK_SECRET` (32+ characters).
Receivers must deduplicate the stable Idempotency-Key: delivery is at-least-once.
Only administratively reviewed public HTTPS webhook destinations should be used;
network egress controls remain necessary in a hosted environment.

## Backup and rollback

Run `node scripts/backup.js DATABASE_PATH BACKUP_DIRECTORY`, then
`node scripts/verify-backup.js BACKUP_DIRECTORY/backup-ID` and
`node scripts/restore-drill.js BACKUP_DIRECTORY/backup-ID RECOVERY_DIRECTORY`.
Keep the verified backup and previous source package before upgrading. Stop all
writers before switching databases; restore to a new path and validate before
pointing `DB_PATH` at it. Never copy a live SQLite main file without its WAL.
Offsite encryption, retention and key custody require a deployment owner.

## Remaining work and release boundaries

The original 40-item audit is a backlog, not a claim that all items are complete.
The following still need work or external evidence:

- Independent immigration/legal/financial review, canonical publication snapshots for legacy data, and a human-reviewed evaluation set. Existing calculator constants are not certified by passing tests.
- Complete browser/mobile/accessibility coverage across the expanding tool inventory; the sidebar and four preparation tools had focused interactive checks, not exhaustive coverage.
- Dev-tool dependency chain: openapi-typescript → Redocly → minimatch has three moderate audit entries. Latest compatible generator is retained; an incompatible major override was not shipped. Runtime dependencies have zero audit findings.
- Broad calculator input auditing, full frontend/backend decomposition, update/unsaved-form UX, subscription retention policy and realistic concurrent load/soak testing remain unfinished.
- Hosted TLS, production identity provisioning/SSO, external AI pilot, external CI execution, container execution, offsite restore and real alert destinations remain outside this local handoff.
- Hybrid retrieval, encrypted case save/resume, government integrations and market differentiation are product work, not completed fixes. No market-uniqueness claim is made.

Do not treat this package as approval for public high-stakes advice. Static
multilingual guides, destination listings and calculators have different support
scopes from verified answer evidence; an item appearing in the UI does not imply
reviewed coverage for every country or language.

## Privacy

Local preparation tools run in the current tab; exported reports may contain
personal information and should be stored privately. The release excludes real
databases, environment files, backups, credentials and operational logs. Contact
listing is admin-only; cancellation removes the stored contact endpoint/name.
No real subscriber delivery was performed during verification.
