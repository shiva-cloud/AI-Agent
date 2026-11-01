# English evidence ingestion — local data foundation

The local app now supports a complete **manual excerpt → pending candidate → reviewed publication** workflow. It makes no network fetches and does not imply that a registered URL grants permission to crawl or copy a website.

## Use the admin console

1. Start the server with the existing admin token configured. Open **Editorial review**, enter the token, and open the source registry section.
2. Inspect the source's ownership, authority and access terms. Record a reviewer name and an English permission rationale before allowing manual excerpt imports. Do not approve permissions merely to clear the queue.
3. Select a permitted source. Paste an English excerpt that you are allowed to retain. Supply a proposed evidence record using the form's JSON template.
4. Keep `status: pending`, set accurate source-check and expiry dates, and make `quote` an exact substring of the excerpt. The URL must match the registered source exactly. Publication metadata is server-assigned.
5. Submit using a unique import key. Retrying the identical request with that key returns the existing candidate. Reusing it for different content is an error.
6. Inspect the pending candidate alongside its stored excerpt, hash and current published summary. Check factual support, applicability, exceptions, English quality and freshness. Approve or reject with an English rationale.
7. Inspect publication history by evidence record. Each approved imported version retains its source snapshot and proposed record. Rejection leaves the public record unchanged.

The shared local admin token is still a development control. Reviewer names are self-declared; verified identities, role separation and independent second review are production prerequisites.

## Data guarantees and boundaries

- `sources`: URL, owner, authority tier, English language and manual-access policy. Seed sources begin unclassified and unreviewed.
- `source_policy_reviews`: append-only records of permission decisions.
- `snapshots`: immutable **manual excerpts**, SHA-256 content hash, source reference and import timestamp. These are not full-page archives or proof of the source's state at an independently verified fetch time.
- `candidates`: proposed English evidence, snapshot reference, immutable request payload, request hash and baseline-publication hash. Candidates do not enter public retrieval before approval.
- `candidate_decisions`: append-only reviewer decisions and rationales.
- `publications`: immutable copies of approved imported records with snapshot references. The existing `records` table remains the active public version.

SQLite foreign keys, English validation triggers and immutability triggers protect this local workflow. Both the publication and review audit commit in one transaction. If the active record changes after import, approval fails and the candidate must be resubmitted against the new version. No stale candidate silently overwrites another reviewer's work.

Imported health, housing, employment and money topics must be marked high risk. High-risk candidates require a tier A or B source, and **every** imported candidate requires explicit approval regardless of risk. Authority classification and semantic claim support are editorial judgments, not guarantees made by the import code.

Matching a quote to an excerpt establishes traceability, not semantic entailment of the summary. The reviewer must assess whether the excerpt supports the proposed claim. Existing research seeds retain their previous labels; they are not retroactively described as archived-source publications.

Record withdrawal remains available through the existing review controls. Historical restoration and source suspension are now implemented; see `RESTORATION.md`. Source-change impact analysis, automatic fetches and source-failure handling remain future work. Viewing an old version alone does not make it current.

Manual imports now include immutable field/excerpt comparisons and source-related impact hints; see `CHANGE_TRACKING.md`. These are editorial aids, not automated website-change detection.

## API contracts

All routes below require the existing admin bearer token. Input is JSON. The current HTTP request limit remains 12,000 bytes; excerpts are additionally limited to 8,000 characters.

| Method | Path | Purpose |
|---|---|---|
| GET | `/admin/sources` | List registered sources and policy states |
| POST | `/admin/sources` | Register a manually permitted source with `id`, `url`, `owner`, `tier`, `language: en`, `reviewer`, `note` |
| POST | `/admin/sources/{id}/policy` | Record manual permission for an existing source using `tier`, `reviewer`, `note` |
| POST | `/admin/ingestion/run` | Submit `sourceId`, `requestKey`, `content`, and a pending `record` |
| GET | `/admin/candidates` | Inspect candidates, excerpt content, hashes and status |
| POST | `/admin/candidates/{id}/decision` | Submit `decision: approve` or `reject`, `reviewer`, `note` |
| GET | `/admin/records/{id}/history` | Retrieve approved import versions and snapshot references |

Successful imports return HTTP 201; identical retries return HTTP 200. Approval returns a publication ID. Public answer source objects expose `snapshotId` for imported evidence, and persisted answer traces retain that reference. Original research seeds have a null snapshot reference.

## Migration and verification

Run `node scripts/migrate.js` or start the server to apply migration 2. Existing evidence and migration 1 remain intact. Then run:

```text
node --test
node scripts/verify-data.js
```

The verifier checks English schema/script constraints, SQLite integrity, foreign-key references and snapshot hashes. No production evidence is imported by the test suite. Tests use disposable databases and explicitly marked test excerpts.

This milestone runs on SQLite. PostgreSQL deployment/migrations, full-page snapshots with reviewed storage permissions, automated acquisition and a larger independently reviewed source corpus remain open work.
