# Remaining audit work — 3 November 2026

## Completed in this continuation

1. **Publication provenance:** high-risk approved content must exactly match an approved audit entry with reviewer and note. An `editorial_review` label alone no longer publishes it. Altered content loses eligibility until reviewed again. Source verification retains its additional snapshot/publication/approval-chain requirement. Audit mutations now invalidate the public evidence cache.
2. **Readiness consistency:** KB health uses the same public-evidence gate, records withheld approved IDs, and prevents publication readiness when the gate withholds records. Reading records and provenance uses a single read transaction.
3. **Frontend lint:** `npm run lint` now includes every public JavaScript file, with explicit browser globals and errors for undefined identifiers, duplicate keys, unreachable code and invalid assignments. Existing CI invokes this command, so these checks also enter the CI definition.
4. **Worker validation extraction:** moved validation into `src/worker-facts.js`; supported provinces include FED. Enforced maximum hours, duration, wage and holiday counts and contract-label enum. Tests exercise every omitted required field and hostile numeric/boolean types, zero preservation and fractional calculations.
5. **API consistency:** worker schema supports fractional monetary/calculation values and FED, matching runtime behavior. Client regenerated and typechecked.
6. **Browser coverage:** new `scripts/browser-view-smoke.mjs` activates all 21 navigation targets and asserts that their sections exist and open. It also performs the existing desktop/mobile Journey scenario. No page errors were observed. Programmatic navigation activation is a smoke check, not a complete keyboard/accessibility or every-form test.

## Validation evidence

- Actual editorial-import/approval and tampering tests: 4/4 pass (`artifacts/REMAINING_public-final.txt`).
- Browser: `artifacts/REMAINING_browser.json`, status passed, 21 navigation targets plus Journey scenario.
- Full suite for publication/worker/frontend work: **2,302/2,302 passed** (`artifacts/REMAINING_verified.txt`).
- Expanded lint: `artifacts/REMAINING_lint-verified.txt`.
- API: `artifacts/REMAINING_api-verified.txt`; generated client in `generated/api.d.ts`.

## Still open

The independent 589-record editorial-provenance backlog is not approved by software tests. Scheduled source checking and editorial publication remain different processes. Domain-wide negative matrices beyond worker/reference/funds, independently reviewed legal fixtures, every-screen accessibility/offline testing, and further route/UI decomposition remain incomplete. Live providers, billing, production deployment and offsite recovery require their real configuration. No external publication or deployment was performed.

This continuation closes concrete gaps in publication integrity, frontend static checks, worker boundaries and navigation smoke coverage; it does not replace the remaining work with an overall completion percentage.

## Credit and budget follow-up

- Credit simulation validates all inputs and strategy values, preserves zero spending/inquiries, and no longer applies an inquiry penalty when there were none. HTTP GET and POST share these checks.
- The frontend now fetches the API calculation instead of using divergent local score formulas. Stale responses are ignored and failures display an error. The scenario is labelled illustrative, not a bureau prediction.
- Budget runway no longer assumes CCB/GST entitlement from household size. Only supplied monthly income offsets costs; confirmed recurring receipts may be included there. The UI explains this explicitly.
- Service-worker cache version bumped for the frontend change. Browser smoke additionally verifies zero spending through the actual credit API and displayed result.
- Added direct and HTTP invalid-input matrices and household benefit-assumption tests. Final follow-up results: `artifacts/REMAINING_2026-11-03_final.txt` and `artifacts/REMAINING_2026-11-03_credit-browser.txt`.
- Final follow-up suite: **2,305/2,305 passed**, no failures/skips/cancellations, 84 seconds. Focused calculator/HTTP suites: 15/15. Browser navigation/Journey/zero-spend credit checks, frontend-inclusive lint, preflight, OpenAPI validation and client typecheck passed.

## Offline, modal accessibility and document chronology

- Added an accessible name and keyboard focus loop to the tool dialog. Tab and Shift+Tab wrap within the visible dialog; Escape closes it and restores the triggering element's focus.
- API errors now render using text content instead of interpolating exception messages into HTML. Browser verification exercises a simulated HTTP 503 and confirms that the error is shown and submission becomes available again. This is not a full audit of every result renderer.
- Document issue dates after expiry or the planned landing date are rejected, including through GET/POST HTTP routes. Same-day issue dates remain valid. This validates chronology; it does not independently certify the module's legal policy content.
- Bumped the offline asset cache to v36 for the modal update.
- New browser test: `scripts/browser-offline-accessibility.mjs`. It installs a real service worker, checks that the offline shell is cached and no API/admin responses are cached in that fresh session, disconnects the browser, verifies the offline fallback, and reconnects successfully. It also checks the dialog name, keyboard loop, Escape/focus restoration and API-failure recovery.
- Focused document tests: **10/10 passed** (`artifacts/OFFLINE_DOCUMENT_focus.txt`). Browser checks passed with no page errors (`artifacts/OFFLINE_ACCESSIBILITY_2026-11-03.json`). Frontend-inclusive lint passed (`artifacts/OFFLINE_DOCUMENT_lint.txt`).
- Full regression suite after these changes: **2,307/2,307 passed**, zero failures/skips/cancellations, 85.9 seconds (`artifacts/OFFLINE_DOCUMENT_full.txt`).
- Scope still pending: every-screen keyboard/screen-reader testing, offline behavior across all routes and cache-upgrade states, independent domain-policy review and the editorial backlog, plus production integrations/recovery validation. No production deployment was performed.

## Modal response isolation and HTML rendering

- Opening/closing a tool cancels its outstanding request and invalidates the previous modal generation. Late successes and failures cannot overwrite a subsequently opened tool. Each submission also checks request identity, so an older submission cannot reset the current button or results.
- Every dynamic interpolation in the tool result renderer now passes through a text-escaping template helper, including list items, nested values and quoted download attributes. Static layout markup remains intact.
- Generated printable forms escape supplied field values and declaration dates. Raw field data and the PDF output remain available. The offline asset cache is now v37.
- New browser regression script: `scripts/browser-modal-safety.mjs`. Controlled promises deliberately ignore cancellation to prove the response guard independently of AbortController. It checks late success, late failure, visible text for an HTML injection payload, download attribute escaping, preserved PDF download and safe generated print preview. All checks passed without page errors (`artifacts/MODAL_SAFETY_2026-11-03.json`).
- Focused form generation and GET/POST form-contract suites: **8/8 passed** (`artifacts/MODAL_SAFETY_focus.txt`). Frontend-inclusive lint passed. Existing offline/modal keyboard checks and the 21-view navigation/Journey/credit browser smoke also passed (`artifacts/MODAL_SAFETY_offline.txt`, `artifacts/MODAL_SAFETY_navigation.txt`).
- Full regression suite: **2,308/2,308 passed**, zero failures/skips/cancellations, 80.3 seconds (`artifacts/MODAL_SAFETY_full.txt`).
- Remaining form-specific review: templates still contain sample defaults and assertions of official/statutory equivalence that require separate product and domain review; these security fixes do not validate those claims. Arbitrary untrusted replacement of an entire `printReadyHtml` API response is outside these input-escaping tests. Broader renderer, accessibility and production checks remain open as listed above.
