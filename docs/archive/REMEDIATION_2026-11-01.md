# Project remediation — 1 November 2026

यह रिपोर्ट `DEEP_PROJECT_REVIEW_2026-11-01_HI.md` के बाद किए गए बदलाव दर्ज करती है। पुराने audit के findings ऐतिहासिक baseline हैं। Software tests का पास होना immigration, medical या financial content का independent factual approval नहीं है।

## लागू किए गए fixes

| क्षेत्र | बदलाव | Verification |
|---|---|---|
| Fabricated evidence | Question-bank, market-gap, global-settlement, social-crisis और narrative matches अब अपने आप approved claims, editorial review, नकली snapshot या source-check date नहीं बनाते। Answer engine वास्तविक evidence retrieval और geography checks इस्तेमाल करता है। | Empty-corpus regression tests; original insider retrieval; unsupported-country tests |
| Healthcare validation | Unknown province/status, impossible dates, invalid household/permit values reject होते हैं। Preliminary assessment और review requirement स्पष्ट हैं। | HTTP invalid-input tests |
| Multilingual routing | Location tokens सुरक्षित रहते हैं; matched translations के लिए confirmation माँगी जाती है; Hindi template को verified advice नहीं दिखाया जाता। | Multilingual और Germany regressions |
| Journey UI | API date/category/city contract, phase items, unique IDs, calendar export source और stale-request protection ठीक किए। Unsupported countries पर Canada roadmap बंद। Counts केवल visible milestones के; headings API phases के अनुरूप; first-year horizon स्पष्ट। Provincial tasks में blanket eligibility/discount promises हटाए। | Desktop/mobile browser checks और screenshots |
| Quotas | SQLite transaction में reservation और usage update; failed/aborted requests refund; idempotent release; expired reservation cleanup; month-boundary accounting। | Independent DB connections और reservation tests |
| Translation privacy | Public endpoint केवल verified translation का minimal projection देता है; contributor credentials, notes और pending submissions नहीं। Input/pagination bounded हैं। | Public projection tests |
| Moderation isolation | Per-app ledger; authenticated actor attribution; unique endorsements; immutable events; invalid transitions reject। | Two-app isolation, moderator and event tests |
| CI | Node 24; valid test entry point; dependency-audit execution errors अब successful audit नहीं माने जाते। | Workflow/config inspection; local test execution |
| Search index | Persisted records से atomic FTS rebuild; duplicate search results suppressed। | Three-restart regression |
| Provenance signing | Required secret, recursive canonical JSON, timestamp covered by signature, constant-time compare; fake statutory lock flag removed। | Nested/array/timestamp tamper tests |
| Performance | Duplicate literal GET handlers removed; async compressed-asset cache; DB revision-based evidence snapshot/cache invalidation; asynchronous bounded password hashing for HTTP signup/login/change/reset। | Duplicate-route AST test, cache/auth/observability tests |
| Runtime configuration | Production account mode requires HTTPS origin, stable secret and configured mail provider; expired sessions/tokens purge; PM2 ready signal and corrected crawler arguments। | Runtime/auth tests |
| API contract | Missing catalog and query-analysis routes documented, duplicate operation IDs corrected, health/translation schemas aligned and TypeScript client regenerated। | OpenAPI inventory/response validation and client typecheck |
| Recovery verification | Translation ledger/moderation and evidence revision enter logical backup digests; multilingual content is not incorrectly rejected as English evidence। | Recovery tests |

## बाकी release requirements

1. **Independent editorial/source review:** static domain calculators, glossary, legal myths and research catalogs are not certified by this work. At audit time the working database contained 589 approved records without the required editorial provenance, with no publications/snapshots. This was an audit-time observation, not a current live inventory. These must enter the reviewed publication workflow; this remediation does not silently approve them.
2. **Production integration:** real mail delivery, identity/billing configuration, deployment secrets, off-site recovery credentials and production monitoring require the actual environment. Local fixture tests do not prove those integrations.
3. **Architecture:** removing duplicate handlers and repeated hashing reduces concrete defects; the large server/frontend still need incremental module extraction. This is not represented as a completed rewrite.
4. **Content currency:** fact lookups reject expired registry entries, but modules that capture a value at import time still require a fresh process/redeployment to pick up later registry changes. A complete per-request versioned policy engine remains future work.
5. **Concurrent edits:** files and tests changed outside this remediation while validation was running. Final results below identify the tested run; later edits require revalidation.

## Verification artifacts

- `artifacts/remediation-browser.json` and `remediation-journey-1440.png`, `remediation-journey-390.png`: actual Chromium desktop/mobile execution, request arguments and UI checks.
- `artifacts/remediation-preflight.txt`: core engine/migration preflight.
- `artifacts/remediation-tests-final2.txt`: intermediate full run, 2,192 tests; 2,175 passed, 17 failed. Subsequent fixes addressed the narrative evidence regressions and API inventory; this is not the final success claim.
- `artifacts/remediation-tests-verified.txt`: **2,192/2,192 passed**, zero failures, skips or cancellations; approximately 88 seconds.
- `artifacts/remediation-accounting-final.txt`: after the final accounting-error-handler change, **22/22 passed**, including a new regression proving simultaneous accounting/refund failure sends a single HTTP 500 without retry loops. This added test was run in the focused suite after the full run.
- `artifacts/remediation-focus10.txt`: **24/24 passed**, including backup/restore and structural regression checks.
- `artifacts/remediation-api-final.txt`: OpenAPI validation passed, **299 paths, 1,268 schemas**. Client generation and TypeScript checking passed (`remediation-client-final.txt`, `remediation-types-final.txt`).
- `artifacts/remediation-browser-final.txt`, `remediation-browser.json`: browser checks passed with no page errors after the final Journey changes; unsupported-country selection tested.
- `artifacts/remediation-preflight-final.txt`: all preflight checks passed.

These results close the reproduced software regressions addressed above. They do not close the independent content review, production integration or architectural follow-up requirements.

## Operational notes

No deployment, external email, payment, or editorial publication was performed. A pre-remediation source backup location is recorded in `artifacts/remediation-backup-path.txt`. Tests should use temporary/in-memory stores; the social-QA suite was corrected to stop opening the working database.
