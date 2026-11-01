# Gap work queue

Migration 6 adds `gap_work_items` and immutable `gap_work_events`. It does not modify evidence records, source policy, publication or approval state. Normal application startup applies the migration; the implementation pass tested disposable databases only and did not restart the running application.

## Observation and lifecycle

New answers aggregate gaps by scope (city, province, Canada or unresolved), topic, subject and reason. Each answer counts a matching gap once. Raw questions, trace IDs and visitor identifiers are not stored in this queue. Trace, gap and work-item writes share a transaction, so failure leaves none of them partially saved.

Items start `open` with `normal` priority. Editors may set `open`, `in_progress`, `resolved` or `deferred`, and `low`, `normal`, `high` or `urgent` priority. In-progress/resolved items need an owner. Resolution additionally requires a reference shaped like `test/query-contract.test.js` or `test/query-contract.test.js#case-id`.

A regression reference is an editor attestation. The service does not execute that test or verify that it proves the fix. Resolution does not suppress future gaps or approve content. A resolved item automatically reopens when the same gap recurs, retaining its owner and previous reference and recording a system event.

Each observation and edit increments a revision. Edits with an old revision return HTTP 409; reload before retrying. English-only storage guards apply to both tables. Audit events are immutable. Aggregate items and operator history survive the 30-day trace purge. There is no automatic historical backfill: older topic/reason counts lack scope/subject information and remain available in the existing overview.

## Editorial UI and API

The existing editorial screen includes the queue, labeled edit fields, save/reload controls and change history. New endpoints use the existing admin token:

- `GET /admin/gap-work?after=<cursor>`: up to 200 items in stable ID order plus `nextCursor`.
- `POST /admin/gap-work/<id>`: requires `revision`, `status`, `priority`, `owner`, `actor`, `note` and `regressionRef`. A note needs 10–1000 characters. Returns the updated item.
- `GET /admin/gap-work/<id>/history`: latest 100 lifecycle events.

The actor is self-reported under the shared admin token. This does not implement individual identity or RBAC. Unknown update IDs return 404, invalid input 400, stale edits 409, unauthorized requests 401.

## Verification and operational limits

Online backups include the new rows and their logical digest. Read-only verification continues to support pre-migration-6 backups without silently migrating them; a database claiming migration 6 with missing work tables fails verification.

Automated checks cover scope aggregation, privacy, ownership/reference requirements, stale edits, recurrence, English guards, immutable history, transaction rollback, API authentication/conflict responses, bounded pagination, retention and backup contents. UI syntax was checked, but interactive browser validation remains pending.

This workflow tracks engineering/content work; it does not create evidence, prove answer accuracy or complete the broader RBAC, retrieval or worker milestones.
