# Evidence restoration and source suspension

These controls are available in the authenticated Editorial review console and admin API. They apply to the English-only local application. They do not restore the whole database or replace backups.

## Restore an imported publication

Open **Inspect published version history**, select an evidence record, and load its versions. Review the current summary alongside the historical summary, dates and snapshot reference. Supply your reviewer name and an English rationale, then select **Restore this reviewed version**.

The server checks all of the following before replacing the active record:

- The requested publication belongs to that evidence record and was approved.
- The active record still matches the version the editor inspected.
- Source permission is current and the source authority satisfies the evidence risk requirement.
- The original evidence is unexpired and currently effective.
- The stored snapshot hash, source identity and exact quote match the historical publication.

The source-check date, expiry, effective dates and snapshot reference are preserved. Only the review timestamp changes. Restoring evidence does not make an old source fresh again.

Restoration updates the active record and writes both an immutable restoration event and the normal review audit in one transaction. Historical publication rows and snapshots remain unchanged. An identical retry returns the original event; reusing the request key for different content fails. If another editor changed the active record, reload history and reassess before submitting a new request.

Original research seeds without an imported publication cannot be restored through this endpoint. Their existing review controls can still withdraw them to pending. The older `rollback` decision means **withdraw to review**, not historical restoration.

## Suspend a source

In the source registry, supply an English rationale and choose **Suspend source and withdraw guidance**. The operation:

1. Marks the source as suspended and its manual permission as unreviewed.
2. Withdraws active approved/research-seed records associated by source ID or exact source URL to pending.
3. Writes per-record review audits and an append-only source-policy review.
4. Blocks imports, publication, restoration and legacy reapproval while suspended.

Reviewed permission can later be restored using the existing source-policy controls. This only reopens the source for review: it does not republish withdrawn records. Each record needs a fresh approval or valid historical restoration. Imported high-risk records are checked against the source's current authority tier even through the older approval endpoint.

Suspension is a publication-control mechanism. It does not delete immutable snapshots or establish a legal retention decision. A source's removal request or retention obligation needs a separate reviewed data-retention workflow.

## Changes during answer generation

The answer endpoint fingerprints active evidence and the UTC date before starting optional AI rewriting. Once the asynchronous operation finishes, it checks the active state again. If the state changed, the draft is discarded and a deterministic source-grounded response is rebuilt against current records. The resulting response is marked `ai.status: knowledge_changed`.

This protects against returning a withdrawn version after an in-flight model call. There is no persistent answer cache in this release. This is a local single-service safeguard, not a distributed snapshot-isolation protocol; a multi-process deployment still needs revision-based coordination.

## API

All requests require the admin bearer token except public answer generation.

- `GET /admin/records/{id}/history` returns `versions`, `currentRecord`, `currentHash`, and `restorations`.
- `POST /admin/records/{id}/restore` accepts `publicationId` (integer), `expectedHash` from the history response, a unique lowercase `requestKey`, `reviewer`, and `note`.
- `POST /admin/sources/{id}/suspend` accepts `reviewer` and `note` and returns the withdrawn record IDs.
- `POST /admin/sources/{id}/policy` remains the path for renewed, documented permission.

Migrations 3 and 4 add the restoration log and active source-suspension state. Startup or `node scripts/migrate.js` applies them. The database verifier checks both tables alongside existing evidence and references.

## Verification limits

Automated tests cover restoration, idempotency, stale editor requests, wrong-record IDs, expiry/effective dates, immutable history, source suspension, explicit republication, authority downgrade, endpoint authorization and evidence withdrawal during AI generation. Browser interaction QA remains pending because the previous browser access gate did not grant preview access.
