# Read-only evidence verification worker

`evidenceWorkerOptions(path)` supplies an authorization policy and a real `verify_snapshot` handler for `runOneJob` or the opt-in scheduler. It opens an existing evidence database in read-only mode. It never invokes store initialization, applies migrations, fetches a URL, changes content, imports candidates or approves evidence.

Authorization resolves the target snapshot to its source and requires English language, reviewed manual-access permission and no active suspension. Unsupported kinds (`source_check`, `reindex`) and unknown snapshots are denied. The handler rechecks permission in the same read transaction used for verification, so revocation between initial authorization and handler execution fails closed. Verification reflects that transaction's point-in-time state; it grants no future publishing authority.

Checks include snapshot kind and content bounds, English schema/script validation, SHA-256 content hash, candidate/publication quote containment and record/source URL matching. Published records additionally require the expected source and snapshot IDs. A successful integrity check does not establish factual accuracy, semantic support, current eligibility or English prose quality.

Revoked policy produces a terminal `blocked` / `policy_denied` job. Integrity or storage failures use the existing bounded retry policy and fixed `handler_failed` code; raw errors and source text are not copied into job rows. Failed verification does not delete, repair or publish data. It is an operational check, not an automatic repair process.

## One-job CLI

`node scripts/worker-once.js [evidence-database]` processes at most one due queued job. `JOB_DB_PATH` must explicitly identify the separate job database. Evidence selection follows explicit argument, then `DB_PATH`, then the existing local default. The queue rejects the evidence database as its own storage. Missing evidence files are not created.

Exit 0 means idle or successful. Failed, blocked, retried/queued, lost-lease and startup failures exit nonzero. This command does not enqueue jobs or dispatch schedules. Operators must inspect queue state before retrying; repeated retries cannot override policy denial. Worker options may be passed to `runScheduler` in an explicitly configured supervisor, but no live supervisor or schedules were installed here.

## Verification and remaining work

Tests use disposable file-backed databases and child processes. They cover unchanged evidence digests, real candidate/publication linkage, corrupted hashes, forged publication linkage, permission revocation between checks, unknown targets, disabled job kinds, configured CLI paths and absent-file behavior.

Source fetching, conditional requests, extraction/parser adapters, search reindex handler, external alerting, queue backup/retention and live deployment verification remain pending. No network requests or live evidence writes occurred in this milestone.
