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
