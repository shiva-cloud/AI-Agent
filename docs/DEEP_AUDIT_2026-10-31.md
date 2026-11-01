# Project audit — 2026-10-31

## Fixed

- **Tool routing:** replaced 68 prefix matches with exact route matches. Unknown suffixes and subpaths no longer execute a valid calculator for either GET or POST.
- **Offline application:** precache now includes all transitive JavaScript imports. Previously the cached entry module could not load offline because its dependencies were absent.
- **Service worker isolation:** only same-origin GET requests for the explicit static shell are intercepted. API responses and authenticated navigations stay outside offline caching; unrelated applications' caches survive activation. Cached modules remain a coherent version instead of being independently refreshed in the background.
- **Journey input validation:** unknown categories (including inherited object-property names) and malformed or impossible calendar dates return validation errors instead of an empty or misleading roadmap.
- **Journey date arithmetic:** UTC calendar operations prevent daylight-saving transitions from moving target dates by a day.
- **Document validation:** malformed records, non-array collections and invalid supplied dates return validation errors. Inherited object-property names cannot resolve to document policies. An empty document list reports action required instead of departure readiness.

Regression coverage is in `test/deep-audit-regressions.test.js`, including actual HTTP requests, a service-worker lifecycle/cache harness, dependency traversal and child processes in different time zones.

## Verification

- Initial full suite: **753 passed, 0 failed**.
- Full suite after the main changes: **761 passed, 0 failed**.
- Final document-readiness change: all **15** selected document, HTTP, offline and API-response contract tests passed.
- Syntax checks: **311 JavaScript files passed**.
- TypeScript client checks and independent OpenAPI/schema validation passed.
- Pre-flight checks, both evaluation datasets, worker smoke and disposable-server smoke passed.
- Working database verified read-only: integrity, foreign keys, snapshot hashes and language/schema checks passed. Policy lint reported **0 warnings**.
- No production database migration, source publication or external AI request was needed for these fixes.

Logs: `scratch/deep-audit-tests.log`, `scratch/deep-audit-final-tests.log`, `scratch/deep-audit-targeted-final.log`, `scratch/deep-audit-evaluation.log`, `scratch/deep-audit-database.log`, `scratch/deep-audit-policy.log`, `scratch/deep-audit-dependencies.json`.

## Remaining dependency finding

`npm audit` reports **3 moderate entries, 0 high, 0 critical**. These are one transitive issue propagated through `minimatch`, `@redocly/openapi-core`, and the development dependency `openapi-typescript`, rather than three independent application-runtime vulnerabilities.

The installed chain is `openapi-typescript@7.13.0` → `@redocly/openapi-core@1.34.22` → `minimatch@5.1.9`. Advisory: https://github.com/advisories/GHSA-g3hv-75wg-m249 (globparts amplification / denial of service).

An isolated override to `@redocly/openapi-core@2.72.1` was tested against this project's schema. Client generation failed with `ERR_PACKAGE_PATH_NOT_EXPORTED` for `./lib/ref-utils.js`. Directly overriding minimatch to v11 is also incompatible with this Redocly version's callable CommonJS import. The main package manifest and lockfile were therefore not changed by this audit. A compatible upstream generator release or a separately validated generator migration is still required; do not apply a forced downgrade simply to clear audit output.

## Scope and limitations

This audit checks code behavior, test coverage, API contracts, database integrity and dependencies. It does not independently certify the legal, immigration, medical or financial assertions embedded in the calculators, nor test Docker deployment or real external AI providers. Passing tests cannot establish that every possible defect is absent.

The workspace is not a Git checkout. Other changes appeared in shared files during the audit (including server headers, cache version and API inventory); edits here were kept focused and existing changes were preserved. Test counts reflect the shared workspace at the time each run completed.

The isolated dependency probe remains at `scratch/dependency-audit-probe`. Automatic approval review rejected its recursive cleanup with “blocked by policy”; no alternate deletion method was attempted.
