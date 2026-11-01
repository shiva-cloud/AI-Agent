# Generated question corpus

These five markdown datasets are the synthetic question corpora (80,000 numbered
questions) that the resolver generators and audit scripts read:

- `global_immigration_settlement_20000_questions.md` — also parsed at runtime by
  `src/global-settlement-resolver.js` to build its lookup index (path resolved
  from the process working directory: `corpus/…`).
- `global_immigration_settlement_questions_20001_40000.md`
- `global_immigration_social_questions_40001_60000.md`
- `global_immigration_social_questions_60001_80000.md`
- `market_gap_questions_80001_100000.md`

Provenance and limits: these are template-generated research items, **not**
human-reviewed facts. Every HTTP response that serves them carries
`X-Evidence-Status: unreviewed-research-catalog`, the same statutory text is
reused across jurisdictions per scenario, and the KB evidence gate never publishes
them as approved claims. Known content risk: cross-jurisdiction citation reuse
marked for an editorial sweep.

Moving or renaming a dataset requires updating the path constants in
`src/global-settlement-resolver.js` and the scripts listed in the git history of
this file. `docs/` deliberately stays human-readable only.
