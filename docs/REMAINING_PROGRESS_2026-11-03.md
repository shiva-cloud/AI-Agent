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

## Draft worksheet defaults and validation

- Removed sample names, identifiers, addresses, amounts and dates from all six preparation templates. Unprovided values remain blank; supplied zero is preserved. No declaration date is invented.
- Unknown form types no longer silently generate a different form. Invalid options, field containers, unknown fields, non-scalar values, oversized field values and invalid calendar dates are rejected. GET and POST now share date handling and strip transport metadata before field validation. GET fields use a prototype-free object, so a `__proto__` query parameter is rejected as unknown rather than silently swallowed.
- HTML, PDF, tool dialog and command directory identify the output as a draft worksheet rather than an official submission form. Removed the generated perjury declaration and statutory-equivalence claims. Responses include `documentStatus`, `submissionReady: false`, and `missingFields`; the modal displays the blank-field count.
- Updated OpenAPI request/response definitions and regenerated the client. API export/validation and client typecheck passed (`artifacts/WORKSHEET_api.txt`).
- Focused generation, validation, HTML safety and GET/POST contract checks: **17/17 passed** (`artifacts/WORKSHEET_focus.txt`). Final route validation, including the reserved query key, passed **3/3** (`artifacts/WORKSHEET_validation-final.txt`). Frontend-inclusive lint passed (`artifacts/WORKSHEET_lint-final.txt`).
- Browser checks passed: stale-response isolation, HTML text/attribute escaping, print-preview escaping, PDF download, and the real worksheet API/modal with draft status and 12 blank fields (`artifacts/WORKSHEET_browser-final.txt`).
- The first full run found one API-inventory expectation that incorrectly required mandatory inputs for this blank-worksheet endpoint. The exception is limited to this endpoint, with an HTTP regression proving an empty object produces blank fields; all other POST required-field checks remain intact. Corrected inventory and worksheet validation tests: **4/4 passed** (`artifacts/WORKSHEET_contract-final.txt`).
- Final full regression run: **2,332/2,332 passed**, zero failures/skips/cancellations, 92 seconds (`artifacts/WORKSHEET_full-final.txt`). This includes concurrent workspace additions; the increase in suite size is not solely attributable to this worksheet change.
- Remaining: these worksheets are not replacements for current official forms. Field completeness, policy references, long-text PDF layout and non-Latin PDF font support still need independent review/testing. The broader editorial, accessibility and production-integration backlog remains open. Concurrent workspace refactoring was preserved; route changes now reside in `src/routes/tools.js`.

## PDF wrapping, pagination and Unicode fallback

- Extracted PDF generation into `src/worksheet-pdf.js`. Long fields, including unbroken 2,000-character strings, wrap to bounded lines and paginate. Each page carries draft status and a page number; zero values and line breaks are preserved. PDF object offsets and stream sizes remain byte-correct for the supported ASCII output.
- Direct PDF generation now explicitly supports printable ASCII plus layout whitespace. Non-ASCII values are preserved in the HTML worksheet; the API returns `pdfSupported: false`, `pdfBase64: null`, zero PDF bytes and a notice to use browser Print / Save as PDF. The modal retains the preview/print button and hides the unavailable download. This prevents silent Latin-1 corruption; it does not claim embedded-font Unicode support in the direct PDF generator.
- HTML worksheet columns wrap long values. Updated API schema/client for nullable PDF output and support metadata. API export, validation, generated client typecheck and frontend-inclusive lint passed (`artifacts/PDF_api.txt`, `artifacts/PDF_lint.txt`).
- Focused existing form tests: **14/14 passed**; new layout/Unicode/zero tests: **3/3 passed** (`artifacts/PDF_focus.txt`, `artifacts/PDF_layout-tests.txt`). Browser safety/worksheet tests also passed, including Unicode notice, retained Hindi text and withheld direct download (`artifacts/PDF_browser.txt`).
- Generated a three-page stress-test PDF and inspected all three rendered pages: no clipping/overlap observed. Independent pdfplumber extraction confirmed all 2,000 unbroken characters and glyph bounds within margins (`artifacts/PDF_extraction.txt`). Rendered pages and Hindi browser preview are in `artifacts/pdf-qa/`. Poppler emitted local Symbol/ArialUnicode fallback-font warnings; the ASCII pages rendered and were inspected successfully.
- Full regression suite: **2,335/2,335 passed**, zero failures/skips/cancellations, 81.5 seconds (`artifacts/PDF_full.txt`).
- Remaining: direct Unicode font embedding/shaping, browser-print coverage across fonts/platforms, official-form completeness and policy review, plus the broader accessibility/editorial/production backlog. No deployment performed.

## Keyboard navigation and modal accessibility

- Unified desktop/mobile view activation. Mobile navigation no longer dispatches a second sidebar click, so renderers run once per activation. Current-page state is synchronized for matching desktop/mobile controls; headings receive focus even when their original markup lacks a tabindex. Unknown view targets are ignored.
- Tool dialogs now make the background inert while open and restore each element's previous inert state on close. Replacing an open tool preserves the original trigger for focus restoration. The Tab loop also handles focus on the result region.
- Added a persistent live status region, `aria-busy` during requests, alert semantics for errors and a labelled/focusable result region. Results/errors receive focus on completion. Old results are hidden during reevaluation. Background Help, search, navigation and command-palette shortcuts are ignored within the tool dialog.
- New `scripts/browser-keyboard-accessibility.mjs`: actual Enter-key navigation through **all 21 desktop views**, heading-focus checks, four mobile targets/current-page checks, duplicate-click detection, delayed API error/busy state, background inert restoration, keyboard shortcuts and focus restoration after tool replacement. Passed with no page errors (`artifacts/KEYBOARD_ACCESSIBILITY_2026-11-03.json`).
- Existing real offline/modal keyboard and modal security/worksheet browser suites passed (`artifacts/KEYBOARD_offline.txt`, `artifacts/KEYBOARD_safety.txt`). Final frontend-inclusive lint passed (`artifacts/KEYBOARD_lint-final.txt`).
- Full regression suite: **2,335/2,335 passed**, zero failures/skips/cancellations, 83 seconds (`artifacts/KEYBOARD_full.txt`). Final keyboard browser rerun includes the shortcut guards.
- These are browser keyboard and DOM accessibility-semantics checks, not manual NVDA/JAWS/VoiceOver certification. Other dialogs, every form's error associations, contrast/zoom and assistive-technology combinations remain to be tested. The content/editorial and production backlog remains open.

## Help and Tools Directory dialogs

- Help now isolates background elements and restores their original inert state and trigger focus. The command-palette shortcut cannot open another background dialog while Help is active.
- Tools Directory now traps Tab/Shift+Tab, handles Escape from any descendant, isolates the background at each ancestor level and restores its trigger. Closing the directory before opening a tool gives that tool a valid return target.
- Fixed a functional selection mismatch: grouped result rows and the keyboard command array now share displayed order. Enter executes the highlighted result rather than an unrelated command at the same original-array index.
- Individual tool actions support Tab plus Enter/Space; pin controls remain separate. Pin/unpin rerendering restores the corresponding pin button (or search input if removed). Filters expose pressed state in a labelled group rather than using incomplete tab semantics. Selected-result and empty-search messages use a local live region.
- `scripts/browser-secondary-dialogs.mjs` tests Help isolation/focus, directory Tab wrapping/Escape, actual grouped-index mismatch execution, empty search, pin focus, filter semantics and tool-dialog handoff. Evidence: `artifacts/SECONDARY_DIALOGS_final.txt` and `artifacts/SECONDARY_DIALOGS_2026-11-03.json`.
- All new browser checks passed with no page errors. Existing 21-view keyboard and modal-safety suites also passed (`artifacts/SECONDARY_DIALOGS_keyboard.txt`, `artifacts/SECONDARY_DIALOGS_safety.txt`), as did final lint. Full regression: **2,335/2,335 passed**, zero failures/skips/cancellations, 112.6 seconds (`artifacts/SECONDARY_DIALOGS_full.txt`).
- Remaining: settlement wizard and other smaller overlays, comprehensive error associations, contrast/zoom and manual screen-reader combinations. These fixes do not close the separate policy/editorial or production-verification backlog.

## Settlement Wizard keyboard and input flow

- Wizard opening isolates background siblings at each ancestor level and remembers the trigger. Close button, backdrop and Escape restore original inert states and focus. Tab/Shift+Tab remain within visible controls, including after generation. Background Help/search/palette shortcuts are suppressed.
- Each step focuses its heading and exposes `aria-current="step"`. Results are a labelled focusable region; restart returns focus to the first step. Recommended-tool cards now support Enter/Space, and tool handoff closes/restores the wizard before opening the tool.
- Removed the runtime fixed arrival date and its submission fallback. Arrival date is required at the final step, with calendar validation for programmatic submissions and an alert on error. The hidden future-step date field is disabled until needed. Empty city is explicitly unspecified rather than silently Toronto.
- New `scripts/browser-wizard-accessibility.mjs` passed: step focus/state, background shortcuts, blank-date blocking, explicit error, valid-date results, Tab loop, restart, Escape and focus/inert restoration (`artifacts/WIZARD_browser.txt`).
- Final browser rerun also verifies unspecified-city output (`artifacts/WIZARD_browser-final.txt`). Existing secondary-dialog and 21-view keyboard tests, plus lint, passed. Full suite: **2,335/2,335 passed**, zero failures/skips/cancellations, 96.6 seconds (`artifacts/WIZARD_full.txt`).
- Important open findings: the wizard still contains old hardcoded financial benchmarks, country fallback recommendations and generic milestones that need a separate domain/content remediation. This iteration validates interaction, not financial accuracy or country coverage. Manual screen-reader, contrast/zoom, editorial and production checks remain open.

## Wizard financial and jurisdiction fallback remediation

- Removed the wizard's hardcoded historical monetary thresholds and household arithmetic. It now explicitly states that financial requirements are not determined here and must be verified for the exact route/location/household/application date. No replacement current legal amounts are asserted.
- Extracted shared planning data into `public/app/wizard-plan.js`. Related tools require an explicit country/pathway match. Other profiles receive a coverage-gap message; they no longer inherit UAE recommendations or Canadian calendar rules. Tool descriptions explain that wizard answers are not transferred and require separate inputs/review.
- Removed universal dated SIN/healthcare/tax milestones. Both screen output and downloaded text use the same neutral planning checklist, explicitly not legal deadlines. Wizard step descriptions no longer claim to calculate eligibility, financial thresholds or health coverage dates.
- Added matrix tests across configured destinations and pathways, unknown countries and prototype-like keys. Added real browser download checks for a profile without route-matched recommendations. New module is included in service-worker precache; cache bumped to v47.
- Validation passed: 2/2 focused matrix tests, wizard/browser-download checks, real offline checks and final lint (`artifacts/WIZARD_CONTENT_focus.txt`, `artifacts/WIZARD_CONTENT_browser.txt`, `artifacts/WIZARD_CONTENT_offline.txt`, `artifacts/WIZARD_CONTENT_lint-final.txt`). Full regression: **2,337/2,337 passed**, zero failures/skips/cancellations, 73.5 seconds (`artifacts/WIZARD_CONTENT_full.txt`).
- Remaining: verified route-specific financial calculations and legal timelines are not implemented in this wizard. Related tools still require their own policy review. Independent editorial review, remaining accessibility testing and production verification remain open.

## Wizard profile consistency

- Added shared validation for configured country/city pairs, pathway and sector enums, household categories, children flag and calendar dates. Next and submission validate all preceding steps; final submission cannot bypass earlier profile validation.
- Errors return to the relevant step, focus the invalid field and expose `aria-invalid` plus an associated alert via `aria-describedby`. Corrected inputs clear stale error semantics.
- A solo-traveller profile cannot also claim accompanying children. The extended-household category remains **5+** in the UI and downloaded plan, instead of being silently reported as exactly five.
- Tests cover wrong-country cities, forged/empty choices, invalid household categories, impossible dates, optional city and future-step omission. Browser verification exercises a forged city choice, error association/recovery and the 5+ downloaded profile.
- Tool handoff remains explicit: profile answers are not automatically applied to independently scoped tool forms; the existing notice tells users to enter and verify those inputs. Route-specific calculations, content review and production verification remain pending.
- Full regression initially exposed an unrelated newly present city-ingestion script creating its own approved audit entries under an invented reviewer label. Replaced that behavior with a review-candidate JSON export: pending status, no copied approval provenance, no database connection/writes. The source data still requires independent verification; existing database records were not changed or certified by this fix. Candidate output is `artifacts/CITY_pending_candidates.json`.
- Validation: **6/6** focused profile/plan/provenance tests passed; candidate export checked **116 pending records**. Browser profile/error/export and offline checks passed; final lint passed. Full rerun: **2,339/2,339 passed**, zero failures/skips/cancellations, 75.7 seconds (`artifacts/WIZARD_PROFILE_full-final.txt`). Browser evidence: `artifacts/WIZARD_PROFILE_browser-final.txt`; focused/lint evidence: `artifacts/WIZARD_PROFILE_focus-final.txt`, `artifacts/WIZARD_PROFILE_lint-final.txt`.
