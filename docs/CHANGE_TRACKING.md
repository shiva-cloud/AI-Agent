# Import comparisons and source-impact review

Every new manual evidence import now stores an immutable comparison against the active record at the moment of import. The comparison and candidate are committed together. A retry using the same import key reuses the original event.

## What editors see

The pending-candidate view and import change history display:

- Changed title, summary, exact quote, URL, topic, jurisdiction, risk and applicability/freshness dates.
- An excerpt comparison that omits the unchanged prefix and suffix and shows the remaining old and new spans.
- Heuristic flags for changed numeric tokens, condition words, scope/source and effective dates.
- A review priority that remains high if either the previous or proposed record is high risk.
- IDs of records associated with the source at import time, for potential impact review.

These flags are triage signals, not semantic or legal judgments. A manually supplied excerpt can change because the editor selected different text; it does not prove that the underlying website changed. The system does not infer that every associated record is affected, or that the list covers every dependency.

## Classifications

| Classification | Meaning |
|---|---|
| `new_record` | No active record existed at import time |
| `content_change` | Compared record content or archived excerpt differs |
| `freshness_metadata_only` | Only source-check/expiry metadata differs and archived excerpt is identical |
| `unchanged` | Compared record fields and archived excerpt are unchanged |
| `baseline_excerpt_missing` | An earlier record exists, but there is no archived excerpt to establish text equality |

Original research seeds have no archived source excerpts. Their first import must not be described as an unchanged website simply because the summaries match. Candidates created before migration 5 display comparison-unavailable rather than a reconstructed historical comparison.

## Storage and API

Migration 5 adds `change_events`, linked one-to-one to imported candidates. It retains the baseline record JSON, optional prior snapshot reference, source ID, comparison report and timestamp. English validation and update/delete protection apply. Approval or rejection changes the candidate's status, not the event.

`GET /admin/changes` returns comparison history and current candidate decisions. It requires admin authorization. Existing candidate responses now include `changeReport`, or null for pre-migration candidates.

Potentially affected record IDs and baseline data are historical, captured at import time. They are not a live query of current dependencies. Re-review current state before a decision. The existing baseline-hash approval check continues to prevent overwriting a newer active record.

## Boundaries

No automatic crawling, deletion detection, background scheduling, source-check failures or automated publication are introduced. The existing nine source policies remain unreviewed. No fake change events or source snapshots are seeded into the project database. Full-page acquisition, permitted source checks, semantic diffing and independently reviewed source expansion remain pending.

The excerpt diff uses an O(n) prefix/suffix comparison rather than an unbounded quadratic diff. It preserves the exact changed span, including whitespace, but can include unchanged material between multiple edits. It does not claim to produce a minimal word-level edit script.

## Validation

Tests verify exact span reconstruction, classification boundaries, numeric/condition flags, immutable baseline capture, idempotent retries, related-source impact hints, snapshot deduplication, rejection history and admin authorization.
