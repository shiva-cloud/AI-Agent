# Editorial review priorities

Release 0.11.0 adds a read-only dashboard to the authenticated editorial console and `GET /admin/review-queue`. It uses the current records, source registry and candidate queue without changing evidence, dates, permissions or audit history.

## Priority and dates

Rows are ordered by suspended source, expired or no-longer-effective evidence, expiry within seven days, pending high-risk review, then other records. Ties use expiry and record ID. Dates use UTC calendar days, matching answer retrieval. Evidence expiring today is flagged as approaching expiry; it becomes expired on the following UTC day. Effective end dates are exclusive.

Flags overlap. A pending record can also be expired, lack source permission and lack an archived snapshot. Counts must not be added together as unique records. The dashboard shows topic and flag filters, record identifiers, dates and next actions. Pending imports for existing records are linked by candidate ID; new-record candidates are counted separately and remain available in the existing candidate review area.

Actions distinguish permission review, fresh source checking, exact English excerpt import and independent factual review. Approval alone never renews expiry. Source permission is not a claim that the evidence is correct. A missing snapshot is an archival provenance gap, not proof that a summary is false. The dashboard does not alter the existing seed approval workflow or grant new publication authority.

## Verification and limits

Six tests cover current seed counts, UTC boundaries, priority order, source identity, effective dates, candidate states, deterministic non-mutating behavior and API authorization. All 132 project tests pass. Public editorial JavaScript passes syntax validation. Interactive browser QA remains incomplete.

On 28 October 2026 the 27-record corpus has 16 pending high-risk records expiring within seven days, 27 unreviewed source-access policies and 27 records without archived snapshots. This is a snapshot of the review backlog, not a production readiness score.

Restart the local server after updating its source to expose the new endpoint, then open Editorial review with the configured admin token. Reloading the queue recalculates dates and priorities; it does not monitor in the background. Scheduled alerts, reviewer assignment, role-based authorization and independent evidence reviews remain pending.
