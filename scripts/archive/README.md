# Archived one-off scripts

Kept for history, not for running. These scripts patched generated
# files (docs/openapi.json, public/tool-modal.js) in place during specific
# development batches; their edits are already baked into the current sources.
# Re-running them now would duplicate or corrupt those files.


## Added 3 November 2026

Moved here because nothing in the project runs them and re-running them is unsafe
or meaningless now:

- Read local AI-agent transcripts under a user profile path (`find-*`, `print-1fc-steps`,
  `check-1fc-reads`, `reconstruct-all-early-posts`, `list-all-edits-this-conv`).
- Patched `public/app.js`, `scripts/export-openapi.js` or tests by string surgery
  (`clean-commands`, `register-missing-routes`, `upgrade-app-recommendations`,
  `update-palette`, `rebuild-command-palette`, `update-remediation-tests`).
- One-off inspection of source text (`find-missing-routes`, `print-180-205`,
  `inspect-answers`, `inspect-palette`, `inspect-batch1-blocks`, `debug-conv`).
  `test/api-inventory.test.js` now enforces the route/spec check `find-missing-routes` did.
- Inserted records straight into the evidence database once (`inject-*`).

## Added 3 November 2026 — provenance-forging data scripts

These wrote straight into the evidence database and must not be run again:

- `ingest-*.js` upserted records (`ON CONFLICT … DO UPDATE`) and inserted their own
  audit entries under invented reviewer names ("Settlement Intelligence Lead Auditor",
  "Senior Global Regulatory Editorial Board (…)"). `src/public-evidence.js` accepts any
  approved audit entry with a reviewer and note, so these entries made records public
  without a person reviewing them; re-running would also overwrite later corrections.
  Four of them also string-patched `src/global-records.js` (all their records are already there).
- `run-policy-audit.js` marked every source "verified", moved every record's `checkedAt`
  to the run date and `expiresAt` to 2027-01-31 with the note "Evidence freshness and
  currency verified", and resolved every open gap item — without checking anything.
- `normalize-checked-date.js` rewrote `checkedAt` 2026-11-01 → 2026-10-31 in the database
  and in `src/global-records.js` without an audit entry.

Their records remain in the database and in `scripts/data/`; relative imports in these
files no longer resolve from this folder, on purpose.
`test/script-provenance.test.js` keeps new scripts from inserting audit entries.
