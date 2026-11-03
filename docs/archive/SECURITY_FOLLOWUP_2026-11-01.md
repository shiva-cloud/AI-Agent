# Security and worker-status follow-up — 1 November 2026

## Completed

- Removed all three moderate npm audit findings. Full dependency audit, including development packages, now reports **zero vulnerabilities**.
- Kept openapi-typescript 7.13.0, pinned fixed minimatch 11.0.3, and adapted Redocly's single callable import to the named export. The adaptation checks exact versions and the upstream file hash, is idempotent, and refuses unknown builds. See [maintenance details](GENERATOR_SECURITY.md).
- Generated API declarations are byte-for-byte identical to the pre-change output. Fresh `npm ci --ignore-scripts`, generation and TypeScript contract checking passed. Mock URL-header tests cover protocol, wildcard, braces and unrelated/hostile hostnames without sending requests.
- CI now audits all dependencies and runs the supported generation command before typechecking.
- Cron status uses a durable, expiring worker heartbeat instead of assuming a recent completed job means an active worker. Graceful shutdown removes its lease; a crashed worker's status expires after 60 seconds. Heartbeat timer is cleared at shutdown. Focused worker/generator suite: seven tests passed.

## Integration findings

The actively edited workspace temporarily had parser regressions, including an
undefined conceptual-query variable. A later current-code rerun passed all 25
parser, conversation, vocabulary and AI-gating tests. The release was copied into
a fixed snapshot for final verification so concurrent edits cannot alter its test
inputs. No unrelated parser changes were reverted.

## Remaining boundaries

Independent immigration/content review, exhaustive browser and form coverage,
production identity/provider/load validation, and live rollout remain pending.
The earlier dependency-vulnerability item is resolved by an explicitly maintained
compatibility adaptation; future upstream changes require review of that adapter.
This pass did not publish a site, send subscriber messages, or approve records.

## Final verified snapshot

Clean-install frozen release: **1,917 tests passed, zero failures**. Full dependency audit: **zero vulnerabilities**. API validation: 289 paths and 1,243 schemas. Generation, TypeScript contract, preflight, standalone server and worker smoke checks passed. Scenario tests now use explicit fixtures instead of the working database; the provincial shelter scenario declares Toronto. No real content approvals were created.
