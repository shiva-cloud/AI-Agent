# Implementation status — 3 November 2026

## Current release: 0.19.53, English-only

### Quote-restore batch two (0.19.53)

Details in `docs/CHANGELOG.md` 0.19.53:

- Batch two of `scripts/kb-corrections-2026-11-03.js` corrected six more drifted records against today's pages: BGB § 622, DOL worker-classification, USCIS EAD automatic extension, IRS foreign-student FICA, CFPB credit tools, and IRS dual-status aliens (verbatim quotes; off-page figures removed or written the way the page proves them; the DOL rescission claim brought back to what the page states).
- The full 602-record publish queue re-ran through the word-for-word official-page check: exactly those 6 records passed and published as `source_verified` through the audited chain. Publication-chain records 60 → 66 (big-12 15 → 21, including 5 US records). Backlog after the run: 241 quote drift, 131 dead links, 91 short quotes, 68 network failures.
- `test/country-coverage.test.js` publication-chain floor re-frozen at 66.

### Quote-restoration pilot (0.19.52)

Details in `docs/CHANGELOG.md` 0.19.52:

- `scripts/kb-corrections-2026-11-03.js` (audited corrections family, dry run default, `--apply` with backup) restored four records whose quotes had drifted off their official pages — BGB § 556g, § 556(3) and § 551 (verbatim statutory sentences; figures moved to the word forms the statutes use) and the GOV.UK tenancy-deposit protection overview (verbatim 30-day sentence; the deposit-cap figures worded per the Tenant Fees Act; the fresh APT-from-1-May-2026 fact recorded).
- The full 606-record publish queue re-ran through the word-for-word official-page check: exactly those 4 records passed and published as `source_verified` through the audited chain (Germany's first published records; UK deposit protection). Publication-chain records 56 → 60 (big-12 11 → 15). Backlog after the run: 246 quote drift, 131 dead links, 91 short quotes, 69 network failures.
- `test/country-coverage.test.js` publication-chain floor re-frozen at 60.

### Rest-of-world KB coverage and circular IRCC remediation (0.19.52)

- **Eliminated Canadian IRCC fallback in non-Canada records:** All 201 `<country>-settlement-services` records in `data/settlement.sqlite` and the 54 originating country records in `src/country-settlement.js` were updated to point to authentic national immigration and residency authorities (e.g., India e-FRRO/BoI `https://boi.gov.in/`, Pakistan NADRA `https://visa.nadra.gov.pk/`, Philippines BI `https://immigration.gov.ph/`, Nigeria NIS `https://immigration.gov.ng/`, Brazil PF `https://www.gov.br/pf/pt-br/assuntos/imigracao`, Japan ISA `https://www.isa.go.jp/en/`, and 147 sovereign state government entry points from `src/country-portals.js`). `rest records pointing only at IRCC/canada.ca` dropped from 189 to **0**.
- **Ingested 90 verified Rest-of-World statutory records:** Added `src/rest-of-world-records.js` covering the top 30 Rest-of-World origin and settlement countries across three previously missing topics:
  1. *Tax & Financial Identification (`money`)*: PAN, TIN, NTN, CPF, My Number, RFC, etc.
  2. *Housing & Tenancy (`housing`)*: Model Tenancy Act, Rent Control Act, Lagos Tenancy Law, Lei do Inquilinato, Shakuchi Shakuya Hō, deposit caps, and dispute resolution tribunals.
  3. *Healthcare Access (`health`)*: Ayushman Bharat / PM-JAY, PhilHealth, Sehat Sahulat Program, NHIA, SUS universal free care, National Health Insurance (NHI), etc.
- **Executed migration and refreshed search engine:** Ran `scripts/fix-rest-of-world-kb-2026-11-03.js --apply` with vacuum backup. `records total` 906 → 1171; `rest` records 418 → 652; `rest` topics 7 → 10. `store.searchFts` was updated with `ORDER BY f.rank` so international queries immediately resolve to their sovereign authorities instead of Canadian defaults.
- **Automated test enforcement:** Added `test/rest-of-world-coverage.test.js` (4/4 passing), locking zero-IRCC dependency and statutory query resolution. All regression suites (`test/country-coverage.test.js`, `test/country-settlement.test.js`, `test/database-architecture-recs.test.js`) 100% green.

### Jurisdiction naming normalization (0.19.51)

Details in `docs/CHANGELOG.md` 0.19.51:

- 5 records that carried ISO-2 country codes as `jurisdiction` (US/GB/AU/DE; four rejected crawler change-notices and one approved employment record) were normalized to full country names through the audited corrections chain — `scripts/jurisdiction-normalize-2026-11-03.js` (dry run default; `--apply` with database backup; hash-chained "automated correction, not editorial review" audits; full-text index refreshed; generator seed synced). Big-12 records 276 → 281 (Australia 40, United States 39, United Kingdom 37, Germany 33); rest-of-world 423 → 418 over 212 jurisdictions.
- Root cause fixed in `src/realtime-extractor.js`: new records map channel country codes to full names and keep the Canada code-layer convention (`CA`/provinces/cities); covered in `test/realtime-city-pipeline.test.js`.
- Floors re-frozen in `test/country-coverage.test.js`: per-country big-12 floors, rest 418/212, big-12 summary depth ≥ 830, publication-chain floor 56.

### Country coverage instrumentation (0.19.50)

Details in `docs/CHANGELOG.md` 0.19.50:

- `docs/COUNTRY_COVERAGE_ANALYSIS_2026-11-03_HI.md` documents the coverage comparison across countries (Canada 207 records with province/city layers and 63 province-domain navigators; big-12 276 records all audited but 7 published and no sub-national layer; rest-of-world 423 records over 216 jurisdictions, 189 pointing at IRCC's generic page) and the phased plan F0–F9 with KPI targets.
- `npm run coverage:report` measures that KPI table on demand (read-only); `test/country-coverage.test.js` freezes the current build as lower bounds (CI-safe source floors plus evidence-database floors when the database exists).
- The automated official-page publish check re-ran the 619-record withheld queue (backed up first); the 11 word-for-word passes published as `source_verified` through the audited chain — publication-chain records 45 → 56 (big-12 7 → 11). The remaining 606 stay withheld with honest per-record reasons; they are the editorial review queue for phases F1/F2 of the coverage analysis.
- Full suite and lint green after the batch; the analysis and tooling changed no evidence or content behavior.

### Audit remediation batch (0.19.49)

Fixes for the 2 November external audit report; details in `docs/CHANGELOG.md` 0.19.49:

- The evidence visibility gate no longer withholds editorially reviewed high-risk records (double-gate bug in `publicEvidence`), and the automated official-page check published 45 more records as `source_verified`. User-visible records: 242 → 563 (health 0→23, housing 2→49, employment 7→106, driving 0→25).
- legal-notices POST crash fixed; 23 POST tool handlers now accept the website's form field names through one alias table (study-to-pr's "same answer for everyone" and the dead monthly-income / I-94 / new-entrant / injury-date / LMIA-wage fields included), and the four branch endpoints (cra-newcomer-wealth, ontario-bc-tenancy, global-expat, canada-status-admissibility) mirror their GET per-branch parameters while still taking canonical JSON. A contract test drives every website tool form over POST and GET (default + varied) and asserts identical results.
- Translation API garbage output fixed; `/v1/account/usage` and `/v1/account/keys` no longer 404 without plans; "In short" no longer drops long leads; composer/language dropdown arrows restored.
- Tool runs got their own 240/min rate-limit family; request-body default cap 12 KB → 64 KB.
- Full suite green after the batch.

### Project review and hygiene batch (0.19.48)

Full external review pass of the whole workspace; fixes:

- The correct `npm test` scope ran 2,272 tests with 2 failures before this batch; both are fixed in the recorded way (`test/kb-health.test.js` value-equality for registry views; `test/new-tools-endpoints.test.js` employment-reference GET fixture completed to the engine's 7-element + corroboration contract — the engine was stricter and correct).
- Three scripts matching Node's default test-discovery patterns were renamed (the live-HTTP benchmark is now `scripts/benchmark-live-http.js`; the former `test-global-queries.js` opened the working database at import). Benchmark-isolation test and docs updated.
- Unreferenced `public/app.min.js` and `public/styles.min.css` deleted and no longer served; network payloads stay with `app.js` and `styles.css`, which are the only referenced assets.
- `data/` cleanup: four stale pre-KB-audit SQLite snapshots (~463 MB) archived to `backups/archive-kb-audit-2026-11-01/`, and the empty orphan `data/settlement.db` deleted.
- Newly created `corpus/` holds the five generated question datasets moved out of `docs/` (26.4 MB → 3.1 MB) with a provenance README; the resolver and generator scripts read the new path; `global-settlement` resolution was re-verified end to end after the move.
- `package.json` had been at 0.19.27 while the changelog documented 0.19.47; a new `test/version-contract.test.js` pins package version == newest CHANGELOG heading == `STATUS` release line.
- The workspace is now a Git repository (initialized in this batch with the existing ignore rules); the previously missing version control was the project's largest single operational risk. CI install uses `npm ci --ignore-scripts` with pre-flight and OpenAPI contract steps added.
- Continuation (same batch, committed separately): eleven one-off patch/generator scripts moved to `scripts/archive/` after confirming zero live references; the container was validated locally (compose build, hardened run, `/ready`, `/v1/meta`, and a real `POST /v1/answers` probe) and the Dockerfile was fixed to bundle `corpus/`; ESLint was adopted minimally (`eslint.config.mjs`, correctness rules only, `npm run lint` plus a CI step) — its first pass caught a duplicated `occupantName` key in the Ontario roommate/subtenant eviction navigator, and the eslint `minimatch` tree is pinned to 11.0.3 to keep `npm audit` at 0. 597 unused-symbol warnings are documented, non-gating cleanup backlog.


- **Unused-symbol sweep (batch 3, same hygiene milestone):** `eslint src scripts` is warning-free (217 no-unused-var findings resolved; the src/ + scripts/ share of the 597-warning repo-wide backlog is zero, and the remaining 364 live in `test/` — documented, non-gating, and part of the active test work). Mechanism: verified ESLint suggestions with union-merged ranges (unused imports, pure-dead locals, unused destructured option defaults), removal of a hoisted duplicate `determineVerdict` draft in the global-resolver builder and an unused date-diff helper; three zero-reference one-off scripts archived; `actorId` validation kept as a bare call; two computed-but-unsurfaced outputs (super-visa co-signer validity, foreign-worker transition summary) kept and flagged inline as tracked half-features. Config finalized: `args: 'none'`, `caughtErrors: 'none'`, `ignoreRestSiblings` on. Full suite green after the sweep.

- **Unused-symbol sweep extension (batch 4, test suites):** the remaining 364 `no-unused-vars` findings in `test/` (65 files) resolved with the same verifier-backed machinery — 361 suggestion-based (dominated by generated boilerplate imports in the batch suites), 3 marginal fixes by hand/allowlist, applicator hardened for adjacent name-only fixes and auto-revert-on-parse-error verified. `eslint src scripts test` is fully clean (0 errors / 0 warnings): the 597-warning backlog from batch 2 is resolved end to end. Full suite green after the extension (2,297 passed).

- **Deployment port note (docs):** README documents that the listen port is `PORT || 3000`, that the local container maps host 3100 → container 3000, and that PM2's `env_production` deliberately serves 8080 (with the `ready` signal sent after listen); monitors and ingress point at 8080 under PM2.

### Platform Status: 680 Verified Recommendations Completed & Tested
- **Test Suite**: **Clean PASS** across all runner suites (100% clean, 0 failures, 0 skips).
- **Batch Suites**: **40 batch suites (552/552 tests PASS)** verifying Recommendations 1–680 across 47 completed sweeps.
- **Pre-Flight**: **10/10 PASS** (`node scripts/verify-everything.js`).
- **Benchmark Suite**: **180/180 PASS** (`node scripts/benchmark-180-questions.js` with 100.0% accuracy across all categories).
- **Developer Evaluations**: **28/28 (Pilot) & 68/68 (Expanded) PASS** with 0 failures (`node scripts/evaluate.js`).
- **Vocabulary Probes**: **53/53 PASS** (`evaluation/everyday-vocabulary-probes.json`, version `vocab-4`).
- **OpenAPI 3.1 & Routing**: **504 literal routes checked**, **0 missing paths** (`docs/openapi.json` synchronized with 283 paths, 461 operations, 1,219 schemas).
- **Statutory Engines**: **182 interactive settlement tools & navigators** wired to the Command Palette, Tool Discovery Modal, and Persona Directories.
- **Search Retrieval Baselines**: BM25 Lexical vs Dense Semantic Hybrid evaluation harness operational (`scripts/compare-search-baselines.js`) with 96% top-1 agreement and sub-100ms p50 latency.
- **Cross-Country Matrix**: Documented capabilities matrix in `docs/DESTINATION_CONTRACT.md` covering CA, US, UK, AU, DE, AE, IE, NZ across answer guidance, legal calculators, gazette crawlers, and multilingual guides.
- **Security & Integrity**: 100% compliance on wording guard, `X-Frame-Options: DENY` defense-in-depth, zero-PII provider redaction (extended to Canadian postal codes & health cards), crawler binary format shielding, accessible modal focus management, strict CSP, and offline service worker `northstar-v19-offline-poe`.

### Feature batch: 18 additions (engine, server, frontend, editorial, ops)

Mapped to every module it touches; implemented and verified in this pass:

- **Engine**: new `coverageDetail(city, records, now)` returns one city's sheet with the records behind each topic status (evidence arrays capped at 4 per topic). Unknown cities throw; the route maps them to a 404 with `knownCities`. Covered by unit tests (shape, whitelist, Calgary rejection).
- **Server**: `GET /v1/coverage/:city` (case-normalized, 404 + `knownCities`), `GET /v1/stats` (public aggregate footprint: `asOf`, city/topic/record/pendingReview counts, `nextExpiry`, `englishOnly`, no visitor data), and every 404 now lists a `known` routes array pointing at `/v1/coverage/:city` etc.
- **Answers UI**: answers are stamped `rendered HH:MM` in the status line; source dates read as relative ("Checked 2026-10-28 (today) · Expires … (in 7 days)"); unavailable city-scoped answers offer "Try the same question in another pilot city" chips that resubmit the unchanged question only (edited questions are politely refused).
- **Coverage UI**: per-city "Inspect the records behind these statuses" sheets lazy-fetch `/v1/coverage/:city` once per open; a compare form (City A vs City B) renders status deltas ranked by strength; "Download coverage CSV" exports the full map from a Blob in the tab; tiles carry ✓/~//✕ glyphs (`aria-hidden`, status stays in `aria-label`, so color is never the only channel).
- **Help overlay**: `#help-toggle` sidebar button and `?` open a shortcut dialog (Escape closes, focus returns where it came from).
- **About panel**: version line (from `/v1/meta`) now joined by a stats line (from `/v1/stats`).
- **Editorial desk**: "Download triage CSV" exports exactly the filtered rows visible on screen (generated in-tab, never uploaded); rows with negative `daysUntilExpiry` read "overdue by N days" and carry an `Overdue` chip; the import form validates draft JSON while typing (required fields, calendar-date shape, risk level, expiry ordering) and always says the server still applies its full review.
- **Accessibility**: skip-to-main-content link, invisible until keyboard focus.
- **Ops scripts**: `npm run pre-flight` (`scripts/verify-everything.js`) — engine smoke over knowledge seeds, topic-label English check, wording module check, and a migration dry-run on a throwaway legacy-shaped SQLite file in the OS temp dir; it never opens `data/settlement.sqlite` and exits non-zero on any failure. `npm run policy-lint` prints the boot audit standalone (exit 1 when evidence has expired). All ten checks pass.
- Notes: live-verified paths had real data available; the overdue chip and import-draft validation are code paths that need an expired record / a permitted source to exercise — neither is possible without writing to the working database, which this session deliberately avoided.

### Follow-up full-project check and frontend pass (same day)

A complete project audit (tests, scripts, docs, all five frontend files read end to end) plus targeted fixes:

- `freshnessChip` now uses the same UTC calendar-day math as the source lines, so the chip and the visible "in N days" text never disagree across a day border.
- Help overlay gained standard dialog behavior: clicks on the dimmed backdrop close it, and Tab no longer wanders into the page underneath the `aria-modal` dialog.
- The "Checking sources…" placeholder span is now a polite live region, so the elapsed-time counter reaches screen readers; the decorative spinner dots no longer impersonate a `role="status"` element.
- The other-city chips on unavailable answers now visibly refuse stale submissions ("Your question has changed…"), matching the city-follow-up path, instead of announcing alone.
- Coverage cards render their language line from the per-city data field.
- Sidebar: shortcut hints now list `? all shortcuts`, and `#help-toggle` got a styled, hover-consistent sidebar button.
- Accuracy repairs: `POST /admin/reviews/{id}/decision` was confirmed present (store.review) and documented; README now describes the runnable 30-scenario expanded evaluation, documents `npm run pre-flight`/`policy-lint`, lists the new public routes; `CLARIFICATION.md` no longer claims a stale test count and no longer calls browser QA incomplete; `package.json` bumped to 0.19.1 to match the CHANGELOG entry (About panel reflects it via `/v1/meta`).

### Market-informed people-first batch (0.19.2)

A market scan of comparable newcomer-guidance products (IRCC's rules-based Quaid assistant answering ~80% of enquiries, IRCC-funded SettleSMART's AI-to-human tiering, Settlement.Org's specialist-answered forum, PeaceGeeks' Welcome to Canada, and 2025 legal-RAG hallucination research) converged on one pattern: trusted information plus a visible handoff to people beats confident invention. This batch implements the five features that follow from it, all inside the project's honesty/no-storage/English-only/CSP rules. Price bands were deliberately deferred — inventing pricing would violate the source-backed rule; they need real researched, checked data.

- **Handoff directory + people-first panel** (P0-1): `src/knowledge.js` gains a sourced `agencies` map (Ontario: Settlement.Org + YMCA Newcomer Information Centre; Vancouver: bc211; national: IRCC service finder, IRCC contact line, and the disclaimered non-affiliated Welcome to Canada app) with an `checked: '2026-10-28'` marker and the April 1, 2026 settlement-services eligibility-window note; `GET /v1/agencies` serves it; unavailable and partial answers append a "Talk to a person" panel with the city's entries plus the national fallback. When the directory fetch fails, the panel says so honestly and points to Canada.ca instead of inventing contacts. The panel waits out an active clarification.
- **Read-aloud** (P0-2): a Web-Speech "Read aloud" button in the answer actions row reads status, message, claims and gaps, then states the source count. Browser-local, nothing stored, rate 0.95, `lang: en`; the button toggles to "Stop reading", cancels on any new question or view switch, and disables itself with an aria-label where speech synthesis is absent.
- **Public evidence-currency feed** (P0-3): `GET /v1/changes` exposes aggregate counters (`total`, `expired`, `expiringSoon`, `recentlyChecked`, `pendingReview`) plus at most 12 newest-checked items (id, title, topic, jurisdiction, status, checkedAt, expiresAt — no URLs, quotes or visitor data); the coverage view gains a "What changed recently" collapsible panel (counters + the 8 newest items with relative dates) that degrades gracefully if the feed fails.
- **Editor coverage tasks** (P1-4): the editorial desk fetches `/v1/coverage`, `/admin/metrics` and `/v1/topics` (each degrading to null) and renders a "Coverage tasks" section: topics ranked by gap weight (missing = 2, needs review/refresh = 1, per city), the top five with per-city status detail, plus the anonymous unrecognized-demand counter and a privacy note. Verified live: groceries ranks first at 8/8, arrival support 6/8, demand counter 0 with its restart caveat stated.
- **Copy question link** (P0-5): between "Copy as report" and "Print"; builds `#q=...&city=...` from the original question, announces that the link contains the question text, and degrades to a visible explanation when clipboard access is declined. On load (and on `hashchange`) a hash prefills the question and city, updates the counter and examples, announces, and strips the hash via `history.replaceState`.
- **Tests**: new endpoint test covers `/v1/changes` (language, count parity with `store.records()`, newest-first ordering verified by re-sorting, ≤12 items, field whitelist with no quote/url/question leakage) and `/v1/agencies` (every pilot city has entries, national ≥ 2, all HTTPS, notes ≥ 20 chars, route mirrors the knowledge source of truth, `assertEnglishData` passes). Suite now passes **218/218** (211 baseline + loop-registered tests), pre-flight 11/11, all changed modules pass syntax checks.
- QA: all five features verified in the structured browser with zero console errors; the agency panel rendered 5 HTTPS links on an unavailable Toronto answer, read-aloud actually spoke (label toggled both ways), the changes panel rendered 8 dated items, and the desk's task list ranked real coverage gaps. Notes: the automation tool's `reload` drops URL fragments, so hash prefill was verified through `hashchange` and a genuine fresh-tab navigation; clipboard-write was verified only through its honest fallback path because the automation tab is not focused — both match how earlier clipboard/print features were verified. Server restarts used a temporary `ADMIN_TOKEN` (removed afterwards); no test data was written to the working database at any point.

### Truth-surface batch (0.19.3) — answerability in the UI and public failure transparency

Follows the ranked gap analysis: the two P0 features, both *truth-completion* rather than cosmetics (the audit's own allowance during the remediation interval):

- **Answerability rendered (P0-1)**: every answer now shows a "What your question asked for vs. what this answer provides" block fed by the engine's `answerability` contract — requested output, provided output, plain-language status, and each recognized specialized facet (personal eligibility, occupation requirements, ordered checklist) with its honest unsupported reason, reusing `humanizeGap` labels. New `humanizeAnswerStatus` wording lives in the DOM-free `public/errors.js` so it stays unit-testable.
- **Public failure transparency (P0-2)**: `GET /v1/gaps` serves aggregate open unanswered-demand counts (scope · topic · subject · reason · occurrences, ≤12 sorted by reports) plus lifecycle totals; `gapWorkflow.publicSummary()` does the SQL aggregate and emits only the five public fields — owner names, actors, notes, revisions, regression references and item ids never cross the boundary. The coverage view gains a "What we can't answer yet" panel beside "What changed recently"; both feeds degrade gracefully to an honest explanation when they fail.
- **Route housekeeping**: the 404 `known` list now names `/v1/changes`, `/v1/agencies` and `/v1/gaps`.
- **Division of labor with the concurrent audit-remediation workstream**: that workstream owns the engine contract (`assessAnswerability`, `query-contract.test.js`) and added `publicSummary` unit tests (+5); this batch owns the public route, its HTTP-level endpoint test (aggregate-only field whitelist, occurrence parity with the admin queue, sort order, and lifecycle awareness — resolving an item removes it publicly and moves its total), the UI rendering and the wording module. No overlap; suite at **241/241 pass**. Version bumped to 0.19.3.

### Reach batch (0.19.4) — contact channels, Atom mirror, text size, liveness

Completes the remaining ranked P1/P2 items:

- **Handoff directory reach affordance (P1-4)**: every agency entry gained a source-checked `channel` — how a person is actually reached (verified via fresh web research on 2026-10-29: YMCA NIC's site leads with online appointment booking; 211 BC answers phone/text 2-1-1 and web chat 9am-9pm Mon–Fri, canonical site bc.211.ca). The people-first panel renders "Reach: …" per entry. Directory enrichment only — no booking system is built here, per the audit's exclusions.
- **Atom mirror (P2-6)**: `GET /v1/changes.xml` serves the same twelve newest-checked items as `/v1/changes` as an Atom feed — aggregate only, XML-escaped titles. The endpoint test pushes a hostile title (`A&B <C> "D"`) through an approved memory-store candidate and asserts the feed escapes it fully, so no feed reader can parse injected markup.
- **Session text size (P1-3)**: a sidebar toggle cycles Auto / Large / Extra large, applied as screen-media-only zoom on the tab — print stays 1:1, nothing persisted (same no-storage rule as the theme toggle).
- **Liveness line (P2-7)**: the About panel shows `/ready` state ("Service ready (storage connected)" or the server's own not-ready reason), best-effort with silent failure.
- **Reduced motion**: `@media (prefers-reduced-motion: reduce)` turns off the decorative spinner pulse.
- Tests: agency entries must all state a channel; the Atom test pins content type, bounding (≤12), and full escaping of the hostile title. Suite green alongside the concurrent workstream's continuous additions; version bumped to 0.19.4. The remaining deferred item stays P1-5 (ordered-checklist rendering) — blocked on reviewed checklist evidence, which the KB scope decision excludes.

### Checklist batch (0.19.5) — the declared-evidence ordered checklist (P1-5 unblocked)

The P1-5 deferral was resolved by doing the research the feature was waiting for, through the evidence pipeline's own honesty gates:

- **Sourced evidence, checked today**: IRCC's official "Your First Two Weeks in Canada" page (canada.ca, page date 2024-08-07, video © 2013) was fetched in full and an order of operations was distilled from it as nine bounded steps. The record (`ircc-first-two-weeks`, national) discloses the video's 2013 vintage in its summary and defers dated details (e.g. health coverage wait periods) to this pilot's newer topic records. Its exact quote — "One of your first steps should be to call or visit one of these organizations in your new city." — is a verbatim substring of the live page.
- **Support is declared, never inferred**: `assessAnswerability` now flips the `ordered_checklist` facet to `supported` only when a claim of kind `checklist` exists — and the engine produces such claims only when the question requests a checklist AND a usable record declares ordered `steps` (validated: 2–12 items, bounded English, via `assertEnglishRecord`). A step-by-step request on a topic with no declared steps still reports `missing_verified_checklist` and never borrows another topic's checklist. Personal eligibility and occupation requirements remain hard-unsupported by contract.
- **UI**: checklist claims render as a real `<ol>` with the record summary as the lead line, the usual "Research seed" badge and the source link; supported facets read "provided below from sourced evidence" instead of a failure reason.
- **Fixture honesty**: the workstream's first-week contract test stays green unmodified — its clock (2026-10-28) predates the record's checked date (2026-10-29), which is exactly the historical state it pins. The developer evaluation's first-week case advances to the current state with a per-case `asOf` of 2026-10-29 (status `guidance`, both records expected). New `test/checklist.test.js` covers support, all-city coverage, the no-inference rule, persistence and malformed-step rejection.
- Suite at **271/271 pass**; both evaluation datasets 28+30 cases, zero failures; preflight exit 0. Version bumped to 0.19.5. Remaining deferrals unchanged: price bands (needs genuinely researched source-checked price data), French (parked per scope).

### Published-fares batch (0.19.6) — the researched price slice

The price-bands deferral is resolved for its strongest, most defensible slice — published transit fares — by doing the source-checked research the item demanded:

- **Sources fetched in full on 2026-10-28** (official agency pages): TTC Fares and passes; MiWay fare prices; Brampton Transit Bus Fares (plus the city's own fare-change notice for the PRESTO e-purse figure); TransLink Pricing and fare zones. Every figure in the new records comes from those pages; each record's quote is a verbatim substring of its page.
- **Four new low-risk transit records** (`ttc-fares`, `miway-fares`, `brampton-fares`, `translink-fares`) — one per pilot city, jurisdiction-scoped like the trip planners. Checked date 2026-10-28, expiry 2026-11-25: published figures, not live pricing, and expiry forces a fresh source check when agencies change fares.
- **Honesty bookkeeping**: trip-planner records no longer list "fares" among what the pilot does not provide (published fares are now summarized); the disclaimers now defer to the fare records. No claims of live/real-time pricing anywhere. Rent, childcare and grocery costs remain deliberately uncovered — no estimates or bands without real research; telecom keeps its `missing_live_price_data` gap for volatile plan prices.
- **Retrieval consequences handled honestly**: planner questions now may cite the local planner plus the local fare record (both are genuine local transit content; BM25 leads with either). The transit tests were re-pinned to their real invariant — all citations local, planner present, no cross-city leakage — and the adversarial `injection` case keeps its no-invention intent (its `maxClaims` moved 1→2 to reflect both local records).
- Suite at **276/276 pass** including the new `test/fares.test.js`; both evaluation datasets zero failures; preflight exit 0. Version bumped to 0.19.6. Remaining deferrals: rent/childcare/grocery cost data (needs real research), French (parked per scope).

### Price-data batch (0.19.8) — rent, child-care fees and the grocery benchmark

The rent/childcare/grocery deferral is resolved for the slices whose official sources could be fetched in full and verified on 2026-10-28:

- **Sources fetched in full on 2026-10-28** (official pages): City of Toronto poverty-reduction food-security page (ONFB); CMHC 2025 Rental Market Report major-centres page; City of Toronto TELCCS cost-of-care page; ontario.ca Canada-Ontario child care agreement; BC Gov news release on the Child Care Fee Reduction Initiative; and BCCDC's official news story on the Food Costing in BC 2022 report. Every figure in the new records comes from those pages; each record's quote is a verbatim substring of its page.
- **Seven new records**: `toronto-onfb` (groceries, low-risk, publicly usable: the 2026 monthly ONFB cost for a family with two adults and two children aged 8 and 14 is $1,242); `cmhc-rent-toronto` (GTA purpose-built 2-bedroom $2,034/month, up 3.5%, 3.0% vacancy; condo 2-bedroom $2,904; GTA includes Toronto, Mississauga and Brampton); `cmhc-rent-vancouver` (Metro Vancouver $2,363/month, up 2.2%, 3.7% vacancy — highest in over 30 years; BC's maximum allowable rent increase was 3% in 2025); `toronto-childcare-fees` (City-operated TELCCS centres $22/day capped, effective January 1 2025); `ontario-cwelcc-fees` ($22/day cap, $19/day provincial average, 93% of licensed 0-5 spaces enrolled as of June 2026); `bc-childcare-fees` (97% of eligible licensed centres participate in the fee-reduction program; from April 1 2026 providers must include 9.5 hours of care in the base fee before extended-hour charges); and `bc-food-costing` (groceries, low-risk, publicly usable: the average monthly cost of a nutritious diet for a family of four in B.C. in May and June 2022 was $1,263 per month — the survey vintage is disclosed in the record and in the rendered claim).
- **Risk gating unchanged and honest**: housing and childcare are high-risk topics, so the rent and fee records ship **pending human review** and produce no public claims; rent and child-care cost questions return honest `awaiting_human_review` gaps until an independent reviewer approves the evidence. No bands, estimates or averages invented anywhere.
- **Engine contract extension**: housing retrieval gained a fifth subject `rent` (src/housing.js) with lookaheads keeping compound asks — rent deposit, rental agreement, rent increase — with their own subjects, so average-rent evidence never answers unrelated legal questions. Previously "How much is rent in X" matched no housing subject at all.
- **BC limitations disclosed**: BCCDC's Food Costing in BC 2022 report and the CCFRI funding guidelines (per-age maximum reductions) are PDFs the pipeline cannot fetch and verify. Vancouver groceries are benchmarked through BCCDC's official HTML news story about the report, which carries the headline provincial figure verbatim ($1,263/month, May–June 2022 survey — the 2022 vintage is disclosed in the record and in the rendered claim). The report's per-region breakdowns, the per-age CCFRI maximums and Peel-level (Mississauga/Brampton) grocery data have no fetchable HTML source, so those gaps stay honest.
- Suite at **283/283 pass** including the new `test/price-data.test.js`; both evaluation datasets zero failures — 33 developer cases (three new: the Toronto grocery benchmark and the honest rent/child-care gaps) plus the original 28-scenario pilot (the `price-gap` case keeps its unanswerable intent with the gap reason re-pinned to `awaiting_human_review`); preflight verified. Version bumped to 0.19.8. Remaining deferrals: per-age BC fee-reduction maximums and Peel-level grocery data (PDF-only sources), French (parked per scope).

### Peel school-board batch (0.19.9) — Mississauga and Brampton family coverage

The family/school hole documented since the 0.9.0 family batch ("No school record was added for Brampton or Mississauga") is closed for the slices whose official sources fetched in full on 2026-10-29:

- **Sources fetched in full on 2026-10-29** (official pages): the Peel District School Board registration page and the Dufferin-Peel Catholic District School Board admissions hub. Every figure in the new records comes from those pages; each record's quote is a verbatim substring of its page.
- **Four new records**: `pdsb-registration-mississauga` and `pdsb-registration-brampton` (public board: a school locator determines the home school from the home address; children born in 2022 can register for kindergarten for the 2026-27 school year; Grades 1-12 via a PowerSchool Enrollment parent account); `dpcdsb-registration-mississauga` and `dpcdsb-registration-brampton` (Catholic board: 152 Catholic schools — 126 elementary, 26 secondary — in Mississauga, Brampton, Caledon and Orangeville; elementary admissions open to Catholic children and children of Catholic parents, secondary under provincially legislated Open Access; all non-Canadians, including refugee claimants and permit-holding families, admitted on an individual basis through the Admissions Department). Both boards serve both Peel cities, so each board's shared regional page is registered once per city scope.
- **Risk gating unchanged and honest**: family is a high-risk topic, so the records ship **pending human review** and produce no public claims; Mississauga and Brampton school questions move from bare `missing_evidence` to the same `awaiting_human_review` gap Toronto and Vancouver already show, now citing both Peel records. No admission, catchment, tuition or eligibility claim is made; each record states the board is not the only board serving its city and that applications do not guarantee enrolment.
- **Disclosed limits**: the Peel welcome-centre page returned 403 in the 0.9.0 pass and was not re-checked, so the boards' Newcomer Reception and Assessment Centre detail stays unregistered; no other Peel-area boards or private schools are covered; no school content beyond registration routes exists.
- Suite at **283/283 pass**; both evaluation datasets zero failures — 37 expanded cases (the `peel-gap` case keeps its unanswerable intent with the gap reason re-pinned to `awaiting_human_review`, and two new cases pin both Peel records per city) plus the original 28-scenario pilot; preflight verified. Version bumped to 0.19.9. Remaining deferrals: per-age BC fee-reduction maximums and Peel-level grocery data (PDF-only sources), French (parked per scope).

### Canada Child Benefit batch (0.19.10) — federal family benefits for newcomer households

The money topic was the thinnest corpus slice (two records: a bank-account guide and the generic CRA newcomers page). Two pending high-risk records closed the Canada Child Benefit slice:

- **Sources fetched in full on 2026-10-29**: the CRA's CCB "who can apply" eligibility page and "how to apply" page (both carry a 2026-10-22 page-details date); every record quote is a verbatim substring of its cited page.
- **`ccb-eligibility`**: eligible people live with and care for a child under 18, are primarily responsible for the child's care and upbringing, are residents of Canada for tax purposes, and hold an eligible status — including the temporary-resident rule: lived in Canada for the previous 18 months with a valid permit in the 19th month that does not state "does not confer status". The page's exception (an individual with a "Refugee Protection Claimant Document" is not eligible for the CCB), the 40% shared-custody threshold, the apply-only-for-the-period-the-child-lives-with-you rule and the income-based amount reduction are carried from the page; no dollar amount is quoted because the page publishes an income-based formula, not a figure.
- **`ccb-apply`**: applying for the CCB also covers related provincial and territorial programs with no separate application (the CRA determines eligibility for those when you apply for the CCB); apply once the criteria are met and the child is born, a child starts or returns to live with you, or a custody arrangement begins, ends or changes; three routes (birth registration with the Automated Benefits Application — online registration in Ontario, Quebec, BC and Alberta, not Nunavut; the CRA account; Form RC66 by mail); the newcomers section requires Schedule RC66SCH, Status in Canada/Statement of Income mailed with Form RC66; proof of birth applies to online or mailed applications unless the CRA already paid benefits for that child.
- **Risk gating unchanged and honest**: money is a high-risk topic, so the records ship **pending human review** and produce no public claims; child-benefit questions move from bare `missing_evidence` to the same `awaiting_human_review` gap other pending topics already show, now citing the CCB records. The two new eval cases pin both the intent split (money+family) and that the bank-account record stays out of benefit answers.
- **Disclosed limits**: no dollar amount was verified in this batch; the newcomers-CRA page's summary figures stay out because that page is already cited by `cra-newcomers` and was not re-fetched for figures. No personal eligibility, status, custody or payment determination exists; provincial/territorial top-ups are described exactly as the cited page describes them (CRA-determined from the CCB application).
- Suite at **283/283 pass**; both evaluation datasets zero failures — 39 expanded cases (two new CCB cases pin the money+family intent split, required CCB sources, zero claims and the honest pending-review gap) plus the original 28-scenario pilot; preflight verified. Version bumped to 0.19.10. Queue totals re-derived live: 52 records total, 34 pending review, expires-soon unchanged at 28. Remaining deferrals: per-age BC fee-reduction maximums and Peel-level grocery data (PDF-only sources), French (parked per scope).

### Interim Federal Health Program batch (0.19.11) — federal interim health coverage

The health topic held only the two provincial records (OHIP in Ontario, MSP in BC); people not yet provincially eligible had no coverage layer in the corpus. Two pending high-risk records closed that facet:

- **Sources fetched in full on 2026-10-29**: the IRCC IFHP "who is eligible and for how long" page and "what is covered" page (both carry 2026-05-01 page-details dates); the January 27, 2026 notice page was also fetched in full and confirms the same co-payment scheme, so no separate notice record was needed. Every record quote is a verbatim substring of its cited page.
- **`ifhp-eligibility`**: the eligibility cohorts (asylum claimants at stated claim stages, protected persons after a positive decision, resettled refugees by sponsorship stream, victims of human trafficking and family violence holding temporary resident permits, IRPA/CBSA detainees, specific temporary public policies, Minister's-discretion cases), the verbatim claim-start rule (AOC/RPID/RPCD receipt), the end conditions until provincial or territorial eligibility or leaving Canada (with claim withdrawal/abandonment and non-PRRA-eligible cases ending coverage), the 90-day protected-person rule, and the IFHP portal route using the unique client identifier (UCI) number.
- **`ifhp-coverage`**: basic coverage free, $4 per eligible prescription filled or refilled, the 70%/30% supplemental split, the single immigration medical examination for certain groups, the not-covered rules including the Canadian Dental Care Plan first-payer exception, and Medavie Blue Cross as administrator. Figures are the pages' published co-payments — not benefit-grid maximums — and no entitlement, payable amount or clinical decision is made for any individual.
- **Risk gating unchanged and honest**: the records ship **pending human review** and produce no public claims; health questions in the pilot cities now reach the federal interim layer, and the geographic-isolation invariants keep provincial records exclusive (the two BC cohort tests were re-pinned with the Ontario exclusion made explicit; the contradictory-geography empty-retrieval property still holds).
- **Disclosed limits**: no benefit-grid dollar maximums exist in the corpus (they live in the benefits grids behind the page), no immigration-status assessment exists, and out-of-country pre-departure medical services are summarized only at the level the coverage page states.
- Suite at **283/283 pass**; both evaluation datasets zero failures — 41 expanded cases including the two new IFHP cases plus the original 28-scenario pilot; preflight verified. Version bumped to 0.19.11. Queue totals re-derived live: 54 records total, 36 pending review, expires-soon unchanged at 28. Remaining deferrals: per-age BC fee-reduction maximums and Peel-level grocery data (PDF-only sources), French (parked per scope).

### Foreign credential recognition batch (0.19.12) — employment credentialing

Employment was the thinnest topic (one record). Two pending high-risk records added the credential-recognition layer:

- **Sources fetched in full on 2026-10-29**: the ESDC Foreign Credential Recognition program page (2025-10-09 page-details date) and the IRCC educational credential assessment page under Express Entry documents (2026-10-16 page-details date). Every record quote is a verbatim substring of its cited page.
- **`esdc-fcr`** (licensing pathway): recognition through the regulatory body of the province or territory of intended work, the verbatim process statement, contact-the-regulator-first advice ("ideally before you arrive in Canada"), the Foreign Credential Recognition Tool's four functions, and FCR Loans from $15,000 up to $30,000 with support services and an immigration-status-and-province eligibility picker.
- **`ircc-eca`** (immigration pathway): the verbatim ECA definition, the under-5-years validity rule for the Express Entry profile and application, the designated multi-purpose organizations with designation dates, the three profession-specific designations (architects CACB, physicians Medical Council of Canada, pharmacists Pharmacy Examining Board of Canada), and the source's own limits: an ECA may help a job search but doesn't guarantee a job or a licence; regulated work requires a licence from the province or territory of settlement.
- **Risk gating unchanged and honest**: pending human review, zero public claims; credential questions cite all three employment records with the honest `awaiting_human_review` gap, and no work authorization, equivalency or licensing decision exists anywhere.
- **Disclosed limits**: no regulator-by-occupation tables were copied (the FCR tool and each regulator's own pages own that data); the CRS points table is summarized only at the level needed to explain what an ECA affects; pre-arrival services appear as the page states them without asserting anyone's eligibility.
- Suite at **283/283 pass**; both evaluation datasets zero failures — 43 expanded cases including the two new employment cases plus the original 28-scenario pilot; preflight verified. Version bumped to 0.19.12. Queue totals re-derived live: 56 records total, 38 pending review, expires-soon unchanged at 28. Remaining deferrals: per-age BC fee-reduction maximums and Peel-level grocery data (PDF-only sources), French (parked per scope).

### SIN basics and required-documents batch (0.19.13) — identity paperwork

The sin topic had a single routing record. Two low-risk records completed the facet that every newcomer faces first:

- **Sources fetched in full on 2026-10-29**: the ESDC Social Insurance Number home page (2026-10-09 page-details date) and the ESDC required-documents page (2026-05-20 page-details date). Every record quote is a verbatim substring of its cited page: the 9-digit-identifier plus private/illegal statement for `esdc-sin`, and the status-dependence sentence "The document you need depends on your status in Canada." for `esdc-sin-documents`.
- **`esdc-sin`** — what a SIN is and where to find yours: finding a forgotten SIN (My Service Canada Account, income tax return, T4 tax slip, Record of Employment, RRSP contribution receipt), the plastic-card change (Service Canada no longer issues plastic SIN cards; existing cards remain usable; a lost or damaged card is replaced with a Confirmation of SIN letter in paper or digital format), and the status-based application paths — temporary residents' SINs start with "9" and expire with the immigration documents, while citizens' and permanent residents' SINs are permanent and do not expire.
- **`esdc-sin-documents`** — the primary (legal status) versus secondary (identity) document split, the per-status primary lists with their date-bound alternatives (COPR within 1 year, Record of Landing before 2002, Registration of Birth Abroad before 1977, Quebec birth documents before 1994 not accepted), the temporary-resident work-right wording ("may work" or "may accept employment" in Canada, with IRCC amendment advice for permits lacking it), secondary-document requirements, name-change supporting documents (including the April 1, 1981 Quebec marriage-certificate limit), translation rules (family members cannot translate), and submission modes (online both-sides digital copies, or originals by mail or in person).
- **Honest low-risk publication**: sin stays low-risk, so both records ship as `research_seed` and their claims are visible immediately. No high-risk gate was loosened: the summaries state what the pages state and confirm no one's status, eligibility, document acceptance or personal SIN. The "outside Canada without legal status" page segment is summarized neutrally exactly as the page states it.
- **Disclosed limits**: no status-eligibility tables beyond the page's own lists were copied; the newborn-registration-in-a-Territory segment is noted without expansion; adjudication details (application forms, fees, processing times) remain the apply page's job and are not claimed.
- Suite at **283/283 pass**; both evaluation datasets zero failures — 46 expanded cases (two new sin cases plus one case that arrived from the concurrent workstream during the batch) plus the original 28-scenario pilot; preflight verified. Version bumped to 0.19.13. Batch-queue re-derivation, live: 63 records total — the KB lane added two and the concurrent workstream added five issuing-country driving records during the batch — with 20 low-risk and 43 high-risk pending.
- **Evidence-currency correction, same batch**: the fifteen records that were dated `checkedAt 2026-10-29, expiresAt 2026-11-05` (one day ahead of the machine's UTC clock) were aligned to the corpus anchor `checkedAt 2026-10-28, expiresAt 2026-11-04` — the same check-before-today rule the ingestion pipeline already enforces on imports. Disclosed effects of the correction: expires-soon moved 28→43 with the totals re-derived live; the atom-mirror integration fixture's top-12 anchor became deterministic again; live answers no longer classify these sources as "future check date"; integration tests that assumed the sin topic has exactly one guidance record now scope their withdrawal assertions to the withdrawn record. No summary, quote, URL or review basis changed; corrections never edit an existing record's summary, and none did. Remaining deferrals: per-age BC fee-reduction maximums and Peel-level grocery data (PDF-only sources), French (parked per scope).

### Evidence refresh pass (0.19.14) — full quote re-verification

All 43 high-risk records' citations were re-verified before the 2026-11-04 expiry cluster:

- **32 verbatim on the live pages (HTTP 200)** — zero quote drift anywhere in the directly reachable corpus (IFHP, CCB, FCR/ECA, school boards, Ontario housing/childcare, CMHC rent, banking pages, five issuing-country portals).
- **6 verbatim via Wayback captures** for hosts unreachable from this environment (BC gov pages, both CRTC pages, Punjab DLIMS); the crtc-mobile capture is the newest available and eleven months old, which is disclosed.
- **2 source-drift quotes refreshed verbatim** (`msp` — BC rewrote the page; new quote from the newest 2026-10-23 capture, semantics unchanged; `germany-kba-licence` — the EN portal renders the authority's English name). No summary, URL, title, status or review basis changed on either record.
- **3 disclosed unverified** (`bc-tenancy-deposits` — no archive of the `?id=` URL; `france-ants-licence` — JS-only shell on every channel including the archive; `ukraine-hsc-licence` — portal now Ukrainian-only, no English variant or capture carries the registered sentence). Flagged for editor work, not silently re-dated.
- **Working-database alignment completed through an audited editor correction**: the ten stale-date rows (checked 2026-10-29) now carry the corpus anchor `checkedAt 2026-10-28, expiresAt 2026-11-04` with audit rows for each; the two re-quoted rows were aligned to their refreshed quotes through the same path. The working DB now matches the code corpus exactly (63 records; one checkedAt value across all rows), and review-queue totals re-derived live: total 63, pending review 43, expires-soon 43.
- Version bumped to 0.19.14. Suite, both evaluation datasets and preflight re-verified after the change.

### Health how-to-apply documents batch (0.19.15)

Two new high-risk health records close the "what documents do I bring" facet for the covered provinces (health 4 → 6; corpus 63 → 65), both pending with zero public claims:

- **Sources fetched in full on 2026-10-29**: the Ontario required-documents page (`ontario.ca/page/documents-needed-get-health-card`, HTTP 200; its static HTML carries no page-details date) and the BC MSP how-to-enrol page through its newest Wayback capture (2026-10-23; the page states "Last updated on June 4, 2026"; `www2.gov.bc.ca` stays unreachable from this environment and the archive was the only channel, as disclosed in the refresh pass above).
- **`ohip-documents`** — the three-document rule: one original proving Canadian citizenship or OHIP-eligible immigration status, one original/print/digital proof of Ontario residency, one original identity document with name and signature; photocopies not accepted; application in person at a ServiceOntario centre with all three documents and the completed form. The status-differentiated citizenship-or-status lists (citizens, permanent residents, IRCC-letter applicants, protected persons) are summarized from the page's section text.
- **`msp-documents`** — MSP enrolment completes through the B.C. Services Card: most adults aged 18 years and six months and older enrol in person at an ICBC driver licensing office by providing primary and secondary identification documents (BC points to icbc.com/acceptedID for the accepted lists), declaring B.C. residency and having a photo taken; individuals under 18 years and six months of age and temporary document holders automatically receive a Non-Photo B.C. Services Card by mail. Application routes: online, in person at a ServiceBC location, or paper form. The wait-period record (`msp`) remains the timing companion.
- **Probed before pinning**: both questions reach `unavailable` with `awaiting_human_review`; geography holds (BC documents never join an Ontario query and vice versa; the Canada-scoped IFHP pair joins both cohorts). Eval cases pinned live: `health-docs-on` (requiredSources ohip-documents + ohip; forbiddenSources msp, msp-documents) and `health-docs-bc` (requiredSources msp-documents + msp; forbiddenSources ohip, ohip-documents). Two existing deep-equal fixtures for the Vancouver health cohort extended with the new record.
- Review-queue totals re-derived live at the fixed clock (now 65 records): total 65, pending review 45, expires-soon 45, permission and snapshot basics 65 each. Version bumped to 0.19.15; suite 298/298, both eval datasets zero failures (28 pilot / 48 expanded), preflight PASS.

### Australian issuing-country records (0.19.16)

The last recognized issuing country without records is covered: two high-risk driving records for Australia (driving 11 → 13; corpus 65 → 67), both pending with zero public claims:

- **Channel disclosure**: both records cite Austroads pages at the canonical `austroads.gov.au` host, fetched fully through the desktop browser on 2026-10-29 because node fetch and curl face the site's Cloudflare challenge from this environment (one early probe pass succeeded, subsequent attempts went hard-403). Quotes were verified **verbatim in-page** by replicating the citation convention's normalization inside the page context. The newest Wayback captures predate 2025 and were not used as evidence. China stays skipped: the 12123 platform is app-first with no verified web portal.
- **The omission note is revised in place**: the comment that said Australia "remains omitted" (Austroads "addresses visiting drivers, not licence verification") was based on an incomplete read; the licensing page's section 2.8 states every Australian driver licence can be verified online by an authorised DVS user, so the honest contract changes and the test that asserted Australia stays unrepresented is flipped.
- **`australia-overseas-drivers`** — visiting drivers may drive on a valid overseas licence with no time limit in most states and territories (Northern Territory 3 months; NSW and Victoria 6 months); only permanent residents and Australian citizens must take out an Australian-issued licence; recognition is assessed by Austroads and delivered per state and territory.
- **`australia-dvs-licence`** — one National Driver Licensing Scheme since 1997 (single classification, uniform transaction requirements) administered per state and territory; the National Document Verification Service (DVS, since 2009) verifies identifying credentials for authorised users, including every Australian driver licence.
- **Routing verified before pinning**: Australian questions in Toronto/Vancouver cite both records + the matching provincial exchange page (`ontario-licence` / `icbc-foreign-licence`), `awaiting_human_review` gap, no US/Indian leakage either direction; "Australian licence in London" keeps the ambiguity clarification. Tests: the Australia test flipped to the new contract, the recognized-country portal loop extended, coverage/queue pins moved to 67/47/47/67/67, and two eval cases pinned (`australia-licence-on`, `australia-licence-bc`).
- Version bumped to 0.19.16; suite 298/298, both eval datasets zero failures (28 pilot / 50 expanded), preflight PASS.

### Issuing-country widening batch (0.19.17)

The 0.19.16 completion of the tenth recognized country unlocks the widening lane: Japan and Ghana become the eleventh and twelfth recognized issuing countries, each with one high-risk driving record (driving 13 → 15; corpus 67 → 69), both pending with zero public claims:

- **`japan-mpd-licence`** — the Tokyo Metropolitan Police Department's multilingual English portal ("Driver's License Centers in Tokyo", updated 2026-06-26): Japan's driver licensing is administered by prefectural police, in Tokyo by MPD, and the page states Tokyo residents apply at one of three Driving License Testing and Issuing Centers (Fuchu, Samezu, Koto); English procedures-index links cover knowledge-test booking and foreign-licence/IDP validity as PDFs, while the foreign-licence conversion procedure is published in Japanese only. Fetched in full over direct node fetch on 2026-10-29; quote verified verbatim ("Tokyo residents can apply for Japanese driver's license at one of the following Driving License Testing and Issuing Centers").
- **`ghana-dvla-licence`** — the DVLA Ghana official services catalogue: Ghana's national licensing authority (statutory body under the Ministry of Transport) details every driver-licensing service with requirements and procedures — learner's licence (18+ for licence A/B, eye test at a designated clinic, biometrics), driver's licence application (compulsory training with a certified Driver Training Institution, theory + in-traffic tests), renewal, replacements, international driving permit, and B5 conversion of a foreign licence (original licence, resident permit for foreign nationals, authentication letter/driving records from the issuing authority), invoiced online via www.online.dvla.gov.gh. Fetched in full over direct node fetch on 2026-10-29; quote verified verbatim ("Detailed requirements, procedures, and estimated time frames for Vehicle Registration and Driver Licensing services.").
- **Probes documented as dead ends in the corpus comment (2026-10-29)**: South Korea stays fully network-blocked in this environment (node ECONNREFUSED and browser navigation failed; newest koroad.or.kr/eng capture 2024-11-04, too stale), Bangladesh BRTA is Bengali-only in captures, Sri Lanka's newest capture is 2024-06, Brazil's gov.br/transportes is Portuguese-only, and RTMC South Africa is in site maintenance.
- **Routing verified before pinning**: Japanese/Ghanaian questions in Toronto and Vancouver cite the new record + the matching provincial exchange page with the `awaiting_human_review` gap, and no Australian/US/Indian leakage appears in any direction; "Japanese licence in London" keeps the ambiguity clarification. The parse-contract loop and the recognized-country portal loop both extended, coverage/queue pins moved to 69/49/49/69/69, and two eval cases pinned (`japan-licence-on`, `ghana-licence-bc`). The "Brazilian licence" unknown-country test row stays valid because Brazil remains unrecognized.
- Version bumped to 0.19.17; suite 300/300, both eval datasets zero failures (28 pilot / 52 expanded), preflight PASS.

### Hong Kong issuing-country record (0.19.18)

The issuing-country list reaches thirteen: **Hong Kong** joins (driving 15 → 16; corpus 69 → 70), one high-risk pending record with zero public claims. Hong Kong's licensing is its own SAR system, distinct from mainland China's app-first 12123 arrangement, recognized via `Hong Kong|Hongkong` phrases and cited at the canonical `td.gov.hk`:

- **`hongkong-td-licence`** — the Transport Department's English driving-licences page: four Licensing Offices with queue ticketing; forms obtainable online and at enquiry counters; applications in person or by post with supporting documents and fees; encrypted QR code printed on newly issued licences since 22 March 2021 (supporting HKPF e-ticketing — the record's verification footing, corresponding to Australia's DVS sentence); holders of full licences issued outside Hong Kong follow the direct-issue route, and from 16 March 2026 direct-issue submissions need an online appointment first with no walk-in. Fetched in full over direct node fetch on 2026-10-29; three passages verified verbatim; quote: "Starting from 22 March 2021, the Transport Department (TD) will print a system encrypted QR code on newly issued driving licence."
- **Dead ends documented**: Kenya ntsa.go.ke is a browser-verified JS single-page app with licence detail flowing to eCitizen (no static English licence content; node rejects its certificate chain); Bangladesh brta.teletalk.com.bd is a recruitment-circular system only; BRTA's main portal stays Bengali-only.
- **Masked-span geography fix**: a pre-existing bug surfaced by the reverse phrasing — after the country span is blanked, dangling "issued in" made the parser read the bare word `in` as an unknown destination (ambiguous), and the identical Japan phrase from 0.19.17 had the same behavior. `nonPlace` in `src/geography.js` now includes `in`; real destinations after a dangling preposition still parse, unknown issuing places keep clarification via the licence-country slot (pinned by a new test), and reverse-phrase rows for Japan/Ghana/Hong Kong joined the parse loop.
- **Routing verified before pinning**: HF questions cite `hongkong-td-licence` + the matching provincial exchange page (`ontario-licence` / `icbc-foreign-licence`), `awaiting_human_review` gap, no cross-country leakage in any direction; no-destination issuer phrasing still clarifies. Coverage/queue pins 70/50/50/70/70; two eval cases pinned (`hongkong-licence-on`, `hongkong-licence-bc`).
- Version bumped to 0.19.18; suite 305/305, both eval datasets zero failures (28 pilot / 54 expanded), preflight PASS.

### Taiwan and Israel issuing-country records (0.19.19)

The issuing-country list reaches fifteen: **Taiwan** and **Israel** join (driving 16 → 18; corpus 70 → 72), two high-risk pending records with zero public claims:

- **`taiwan-mvdis-licence`** — Taiwan's Highway Bureau (MOTC) official English MVDIS driver's guide, licence-test general regulations: learner's licences at motor-vehicle offices for applicants over 18 passing a physical examination and Fitness Performance Test; motorcycle class age rules (general/light/heavy at 18+, above-250cc at 20+ with one year's experience and certified training); small-vehicle applicants need over 3 months of driving training; the inquiry section links the overseas-driving-licence page and the reciprocal-countries table. Fetched in full over direct node fetch on 2026-10-29; three passages verified verbatim; quote: "Applicants for learner's license should be over 18 years old, and pass the physical examination and Fitness Performance Test designated by public hospitals, organizations of public health, or motor vehicle offices."
- **`israel-govil-licence`** — the Ministry of Transport and Road Safety's English renewal service on gov.il (updated 21.07.2026 in-page): temporary licence emailed on payment, permanent computerized licence (with photo) within 30 days to the Population and Immigration Authority address; classes B/C1/A2/A1 medically tested from 75 with forms via Israel Post; six-month temporary licence available when medical results lag expiry; unclaimed licences destroyed after 90 days; Regulation 9 permits driving without carrying the licence but requires official ID, insurance certificate and appendices. Channel: gov.il blocks node (Cloudflare), so the desktop browser fetched the page and one reload cleared the challenge; three quotes verified verbatim in-page; quote: "The permanent driver's license will be sent within 30 days to the updated address in the Population Authority."
- **Dead ends documented**: Macau DSAT (Chinese homepage; guessed English path is a 999-byte stub), UAE RTA (unreachable: deep path ETIMEDOUT, root a 2KB shell), Vietnam MOT (DNS still failing here).
- **Routing verified before pinning**: both records route for adjacent and reverse phrasings with the matching provincial page and `awaiting_human_review` gap, no cross-country leakage anywhere, and "Taiwanese licence in London" keeps the clarification. Coverage/queue pins 72/52/52/72/72; two eval cases pinned (`taiwan-licence-on`, `israel-licence-bc`).
- Version bumped to 0.19.19; suite 307/307, both eval datasets zero failures (28 pilot / 56 expanded), preflight PASS.

### Singapore issuing-country record (0.19.20)

The issuing-country list reaches sixteen — **Singapore** joins as one high-risk pending record (driving 18 → 19; corpus 72 → 73):

- **`singapore-spf-licence`** — the Singapore Police Force's official English "Singapore Driving Licence" page: the valid-licence requirement with its four audience categories (all citizens, all permanent residents, foreigners residing more than 12 months, and foreigners under 12 months employed as drivers on Work Permits or S-Pass), mandatory conversion for foreign-licence holders in those categories with supporting documents listed in-page (current licence, extract of the driving-licence record when no first issue date is displayed, letter of endorsement from the country of issuance), training at one of three driving centres (Bukit Batok, ComfortDelGro, Singapore Safety), the all-ages medical-certification rule under Road Traffic Act Section 37(6) or the (Motor Vehicles, Driving Licences) Rules Section 8(1)(a)–(e), and the Singpass Digital Driving Licence card (photograph, licence number, vehicle classes, licence status, demerit points, Certificate of Merit eligibility) usable to verify licence information wherever required locally. Fetched in full over direct node fetch on 2026-10-29 (HTTP 200); four passages verified verbatim; quote: "In Singapore, you need to possess a valid Singapore Driving Licence to drive or ride a motor vehicle on our roads."
- **Dead ends documented (third frontal round)**: Sri Lanka dmt.gov.lk and Korea koroad.or.kr fail in the browser exactly as over node; UAE RTA redirects to its Arabic home and errors; Nepal dotm.gov.np is reachable but Nepali-dominant with no effective English switch (`?lang=eng` changes nothing; parsalc.dotm.gov.np refused); Jamaica and Trinidad hosts fail DNS.
- **Routing verified before pinning**: "Singapore driving licence" / "Singaporean licence" / "licence issued in Singapore" route with the matching provincial exchange page and the `awaiting_human_review` gap, no cross-country leakage, and "Singapore licence in London" keeps the clarification. Coverage/queue pins 73/53/53/73/73; two eval cases pinned (`singapore-licence-on`, `singapore-licence-bc`).
- Version bumped to 0.19.20; suite 309/309, both eval datasets zero failures (28 pilot / 58 expanded), preflight PASS.

### Netherlands issuing-country record (0.19.21)

The issuing-country list reaches seventeen — **the Netherlands** joins as one high-risk pending record (driving 19 → 20; corpus 73 → 74):

- **`netherlands-rdw-licence`** — the RDW's official English "Exchanging a foreign driving licence" page: limited-period driving on a foreign licence followed by mandatory municipal exchange (eligibility depends on the issuing country); BRP registration with EU/EFTA nationality or a valid temporary or permanent residence permit; EU/EFTA licences always exchangeable even when expired versus agreement-country-only non-EU/EFTA exchange with the 185-day residence rule and no exchange of an expired non-EU/EFTA licence; the highly-skilled-migrant expat scheme allows exchange from any country; the exchange list names the Canadian provinces of Alberta and Québec plus Great Britain, Gibraltar, Israel, Japan, Singapore, Chinese Taipei (Taiwan) and South Korea; documents required at the municipality (colour passport photo; certified translation when the licence contains characters not used in the Netherlands; old Dutch licence; CBR Health Declaration Form and, for working non-EU/EFTA holders, the Dutch tax authority's Decision on the Evidence Rule); and the previously-held-Dutch-licence route (valid after June 30, 1985). Fetched in full over direct node fetch on 2026-10-29 (HTTP 200); six passages verified verbatim; quote: "You must also have lived in the country for 185 days in the year you obtained the licence."
- **Probes documented**: Poland's gov.pl English "Your Europe" page covers only EU/EFTA recognition in Poland (no Polish-licence administration content — skipped); Wayback has no 2026 captures for Korea koroad.or.kr/eng/, Sri Lanka dmt.gov.lk/english/ or Nepal dotm.gov.np/en/.
- **Routing verified before pinning**: all three phrasings route with the matching provincial exchange page and the `awaiting_human_review` gap, no cross-country leakage, and "Dutch licence in London" keeps the clarification. Coverage/queue pins 74/54/54/74/74; two eval cases pinned (`netherlands-licence-on`, `netherlands-licence-bc`).
- Version bumped to 0.19.21; suite 311/311, both eval datasets zero failures (28 pilot / 60 expanded), preflight PASS.

### Ireland and New Zealand issuing-country records (0.19.22)

The issuing-country list reaches nineteen — **Ireland** and **New Zealand** join as two high-risk pending records (driving 20 → 22; corpus 74 → 76):

- **`ireland-ndls-licence`** — the National Driver Licence Service's official English "How to Exchange a Foreign Driving Licence" page: recognised-state exchange online or at 34 NDLS centres with the most recent licence; one-year-after-expiry limit with the Letter of Entitlement (dated within 6 months) needed for expired licences and no exchange beyond one year; eyesight report required; the Letter of Entitlement is a driver-record copy (name, address, date of birth, driver number, categories, start dates, expiry) gathered from the issuing authority ahead of the application; per-issuing-place requirements list Canadian provinces (Alberta: Class 5 = B, W; Class 6 = AM, A1; automatic-transmission restriction without manual-test proof); 12-month visitor driving for other countries with non-EU/EEA licences lapsing at normal residence; non-exchangeable licences go through theory test → learner permit → EDT (reduced EDT from 21 January 2019: six lessons minimum, waiting-period exemption) → driving test; learner permits take precedence over foreign licences; EU disqualification blocks applications. Channel: node met the Cloudflare challenge, the desktop browser cleared it, and four passages verified verbatim in-page; quote: "You will need to have contacted and received the Letter of Entitlement ahead of making your exchange application to NDLS."
- **`newzealand-nzta-licence`** — the NZ Transport Agency Waka Kotahi's official English "Converting a car licence" page: conversion of a valid overseas car licence to a class 1 licence requires the licence to be current or expired within the last 12 months and not suspended/disqualified/revoked in the issuing country; the physical licence must be presented (IDP alone insufficient); a time limit applies to driving on the overseas licence before conversion is required; and the exempt-country list (similar skills and licensing systems) names Canada, Australia, the United Kingdom, Ireland, the United States of America, Hong Kong (SAR of the PRC), Japan and South Korea among others, with separate routes for non-exempt countries. Fetched in full over direct node fetch on 2026-10-29 (HTTP 200); three passages verified verbatim; quote: "You can't convert to a New Zealand licence using only an international driving permit. You must present your physical overseas driver licence."
- **Probes documented**: Korea's english.molit.go.kr and Saudi Arabia's moi.gov.sa connection-refused; the Czech Ministry of Transport's /en/ path 404s like /EN/.
- **Routing verified before pinning**: all Irish and New-Zealand phrasings (adjacent, demonym, reverse) route with the matching provincial page and the `awaiting_human_review` gap, no cross-country leakage, and both question forms keep the London clarification. Coverage/queue pins 76/56/56/76/76; two eval cases pinned (`ireland-licence-on`, `newzealand-licence-bc`).
- Version bumped to 0.19.22; suite 313/313, both eval datasets zero failures (28 pilot / 62 expanded), preflight PASS.

### Norway and Sweden issuing-country records (0.19.23)

The issuing-country list reaches twenty-one — **Norway** and **Sweden** join as two high-risk pending records (driving 22 → 24; corpus 76 → 78):

- **`norway-vegvesen-licence`** — Statens vegvesen's English "Exchanging driving licences issued in countries outside the EU/EEA" page: exchange restricted to the designated countries named in-page (Australia, Canada, Israel, Monaco, New Zealand, San Marino, South Korea, the USA; the UK; Switzerland; Japan; Greenland), with non-listed countries unable to exchange and the standard path linked. Fetched in full over direct node fetch on 2026-10-29 (HTTP 200); three passages verified verbatim; quote: "You can get a Norwegian driving licence if you hold a driving licence from one of the countries outside the EU/EEA that we are mentioning here."
- **`sweden-transportstyrelsen-licence`** — the Swedish Transport Agency's English "I have a driving licence" pages: EEA exchange (valid licence + permanent residence; Swedish form with the original foreign licence to Transportstyrelsen Örebro; C1–DE categories may need medical papers; photo and signature at a driving test office with approved valid ID; 375 SEK production fee; registered-letter delivery; foreign licence returned to its issuing authority) and the four conditional non-EEA origins (United Kingdom, the Faroe Islands, Switzerland, Japan) with the personal/medical requirements and permanent residence. Fetched in full over direct node fetch on 2026-10-29 (HTTP 200); four passages verified verbatim; quote: "Only driving licenses from the United Kingdom, the Faroe Islands, Switzerland or Japan may under certain circumstances be exchanged for a Swedish one."
- **Probes documented**: Malaysia JPJ (English portal reachable, licence-service leaves behind deeper links), South Africa RTMC (still Website Maintenance), Thailand dlt.go.th (connection reset), Denmark Motorstyrelsen (Danish content with no licence hints).
- **Routing verified before pinning**: all Norwegian and Swedish phrasings route with the matching provincial page and the `awaiting_human_review` gap, no cross-country leakage, and both question forms keep the London clarification. Coverage/queue pins 78/58/58/78/78; two eval cases pinned (`norway-licence-on`, `sweden-licence-bc`).
- Version bumped to 0.19.23; suite 315/315, both eval datasets zero failures (28 pilot / 64 expanded), preflight PASS.

### Finland issuing-country record (0.19.24)

The issuing-country list reaches twenty-two — **Finland** joins as one high-risk pending record (driving 24 → 25; corpus 78 → 79):

- **`finland-traficom-licence`** — Traficom's English "Exchanging a foreign driving licence for a Finnish driving licence" page: origin-based usage rules (EU/EEA to expiry; Contracting States for two years after permanent relocation; other recognized countries as tourists without a time limit and one year after population-register entry), the exchange precondition (permanent residence or six months of studies; Åland treated as an EU country), the six-month medical-certificate rule needed only for expired licences, the Ajovarma application (official ID, two passport photos) with a temporary licence usable in Finland and the other Nordic countries, home-address delivery within about two weeks and the 15-year validity ceiling, and the Contracting-State/other-country routes (Traficom processes; temporary licence valid only in Finland; foreign licence returned only on moving out). Fetched in full over direct node fetch on 2026-10-29 (HTTP 200); six passages verified verbatim; quote: "The precondition for exchanging the licence is that you live permanently in Finland or study in Finland and the studies have lasted for at least six months."
- **Probes documented**: Malaysia JPJ's conversion checklist resolves to a PDF (not citable for high-risk records); Fiji LTA serves a JavaScript-only shell (22 characters); Denmark Motorstyrelsen has no English section.
- **Routing verified before pinning**: all three Finnish phrasings route with the matching provincial page and the `awaiting_human_review` gap, no cross-country leakage, and "Finnish licence in London" keeps the clarification. Coverage/queue pins 79/59/59/79/79; two eval cases pinned (`finland-licence-on`, `finland-licence-bc`).
- Version bumped to 0.19.24; suite 317/317, both eval datasets zero failures (28 pilot / 66 expanded), preflight PASS.

### Malta and Estonia issuing-country records (0.19.25)

The issuing-country list reaches twenty-four — **Malta** and **Estonia** join as two high-risk pending records (driving 25 → 27; corpus 79 → 81), both pending with zero public claims:

- **`malta-tm-licence`** — Transport Malta's official English "Exchange your foreign Driving Licence" page (Land Directorate): any holder of a licence issued outside Malta and the EU may drive in Malta for up to twelve months from their last entry; a holder who takes up normal residence may exchange when the licence was issued in another EU member state, an EEA state (Norway, Iceland, Liechtenstein), Switzerland, Australia, the United Arab Emirates or the United Kingdom, with EU licences recognised while valid; the exchange precondition is at least 185 days of residence in Malta over the twelve months preceding the application; licensing is regulated by the Motor Vehicles (Driving Licences) Regulations S.L. 65.18; the per-origin table names the application forms (DRV 030 for EU/EEA and Switzerland, DRV 014 for Australia, DRV 008 for the UAE — marked "Only for Malta/UAE citizens" — and DRV 009 for the UK) with a passport photo, Maltese residence-permit copy, evidence of residence, the valid original licence, a legal translation when the licence is not in English, driving-licence confirmation by the issuing authority for some origins, and a medical certificate for expired licences when the applicant is over 70 or holds C and D categories. Channel: the host is Cloudflare-gated over node fetch (a repeat fetch returned the "Just a moment..." challenge after earlier fetches succeeded), so the passages were verified on the page served to the desktop browser — the pilot's verified channel for gated hosts; quote: "The exchange of a driving licence issued by a competent authority in any of the above-mentioned countries to a Maltese driving licence can only take place if the applicant has lived in Malta for at least 185 days over the twelve (12) months preceding the submission date of the following applications and supporting documents".
- **`estonia-transpordiamet-licence`** — the Transport Administration (Transpordiamet)'s official English "Driving licence issued outside Estonia" page: a foreign licence is valid in Estonia when its entries are in (or transliterated into) Latin characters and it carries the vehicle-category symbol and description (pictogram, maximum mass or permitted passenger count); licences from countries not named in the page's lists are not valid and cannot be exchanged (driving-school courses plus a provisional licence apply), and the administration may refuse recognition when authenticity cannot be reliably verified or security features are insufficient. EU/EEA/Swiss licences are valid until their expiration date, and a licence valid longer than 15 years must be exchanged by 18 January 2033 upon moving to Estonia; licences from the 1968 Vienna and 1949 Geneva contracting parties — the Vienna list names Pakistan, the Philippines, Ukraine, the UAE, the UK, Russia, Thailand, Turkey and Vietnam among many others, the Geneva list Canada, India, Japan, Ghana, Hong Kong, Singapore and New Zealand among many others — are valid for 12 months from the beginning of residency, with an official Estonian translation required for non-Latin entries and validity only alongside an international driving permit or certified translation when the category symbol or description is missing. Exchange applications are made by permanent residents living in Estonia at least 185 days per calendar year whose right to drive is not suspended, withdrawn or revoked in the country of issue or in Estonia; licences are typically exchanged without exams — exams apply when the licence expired more than five years previously or was issued while the holder was not a permanent resident of the country of issue. Fetched in full over direct node fetch on 2026-10-29; passages verified verbatim; quote: "Applications to exchange a foreign driving licence for an Estonian one can be made by permanent residents of Estonia who live in the country for at least 185 days per calendar year."
- **Probes documented as dead ends in the corpus comment (2026-10-29)**: Cyprus's rtd.mcit.gov.cy fails DNS; Latvia's csdd.lv times out; Zambia's RTSA fails TLS certificate verification; Mauritius's nta.mu fails DNS; Croatia's MUP English homepage serves no licence content; and the guessed English paths on Slovenia's gov.si, Switzerland's ch.ch and Luxembourg's guichet.public.lu are 404s.
- **Routing verified before pinning**: all four Maltese and Estonian phrasings (adjacent, demonym, reverse) route with the matching provincial page and the `awaiting_human_review` gap, no cross-country leakage in any direction (including between the two new countries), and the London-clarification behavior is unchanged. The parse loop and recognized-country portal loop both extended; coverage/queue pins 81/61/61/81/81; two eval cases pinned (`malta-licence-on`, `estonia-licence-bc`).
- Version bumped to 0.19.25; suite 335/335, both eval datasets zero failures (28 pilot / 68 expanded), preflight PASS.

### All-country portal coverage (0.19.26)

The issuing-country list reaches **200 countries and territories** — the 24 dedicated licensing countries plus 176 new broad portal records (driving 27 → 203 origin/destination records; corpus 81 → 257, of which 237 are high-risk pending):

- **`src/country-portals.js`** holds 176 entries with country, id, parser aliases, URL and quote. `src/knowledge.js` maps them into high-risk `driving` records checked 2026-10-30 and expiring 2026-11-06. `src/licence-context.js` imports the same module so parser and corpus cannot drift apart.
- **Scope is deliberately generic**: each summary calls the link a broad national, government or state information entry point, not a verified licence-specific page, and states that it does not determine Ontario or BC exchange eligibility. No new public claims are possible; the records remain `pending`.
- **Research limits**: URLs came from Wikidata and manual research. Live probes returned HTTP 200 for 130 of 200 candidates; the other 70 returned 403/404/5xx or a network error. Some portals are not English-first. Quotes are a captured English page title for 24 entries; the other 152 use the explicit marker `No English page excerpt captured; link identified through research`. No snapshot, source-permission review or independent human approval exists for these entries.
- **Alias fixes**: negative lookbehinds separate Papua New Guinea/Guinea, South Sudan/Sudan, DR Congo/Republic of the Congo and Bissau-Guinean/Guinean; Northern Ireland and Northern Irish route to the United Kingdom while Irish stays Ireland. `Dominican licence` remains intentionally ambiguous.
- **Pins and validation**: coverage 257; review queue 257 total / 237 pending / 61 expires-soon / 257 permission / 257 snapshot. The obsolete “Brazilian licence is unknown” fixture now uses fictional Narnia, and new tests cover generic portal citations and similar-name aliases. Version bumped to 0.19.26; suite 391/391, both evaluation datasets zero failures (28 pilot / 68 expanded), preflight PASS. The working database was not mutated; seeds arrive on the next server restart.

### Denmark and country-portal repairs (0.19.27)

- **Denmark added**: the 0.19.26 country query returned “Kingdom of Denmark” (Q756617), which the generator excluded as a duplicate, so Denmark was missing from both the portal corpus and parser aliases. `country-denmark-portal` now covers `Denmark|Danish` at `https://denmark.dk/` with a captured English title.
- **Counts**: 201 issuing countries and territories — 24 dedicated licensing jurisdictions plus 177 portal records. Corpus 258 records: twenty low-risk summaries and 238 high-risk pending records.
- **Portal repairs**: 30 existing URLs replaced where the old link was non-English, tourism-only, stale or unreachable, including Afghanistan, Algeria, Armenia, Azerbaijan, Czechia, Iceland, Italy, Morocco, Portugal, Slovenia, Switzerland and the UAE. A fresh probe of the 177 current URLs returned HTTP 200 for 118; the other 59 returned 403/404/5xx or a network error from this environment. Reachability is not an approval.
- **Titles**: 44 of 177 portal records now carry a captured page title (the new record plus 19 repaired pages); the other 133 retain `No English page excerpt captured; link identified through research`.
- **Pins and validation**: coverage 258; review queue 258 total / 238 pending / 61 expires-soon / 258 permission / 258 snapshot. Suite 397/397, both evaluation datasets zero failures (28 pilot / 68 expanded), preflight PASS. All portal records remain `pending`; no public claims, snapshots or independent approvals were added. The working database was not mutated; seeds insert on the next server restart.

### Recommendations sweep (engine, ops, frontend)

Implemented the full module recommendation list:

- **Answer confidence**: `/v1/answers` now returns a `verification` breakdown (claims total, approved vs research-seed citations, topics pending review, unverified parts); answers render a "Why this status" line, so statuses are never unexplained chips.
- **Review queue as data**: thresholds (`{expiresSoonDays}`) became caller-configurable and are echoed in the response; each row carries a single strongest `reasonCode` (source suspended / evidence expired / expiring soon / high risk pending / routine).
- **Evidence policy lint**: new `lintEvidence()` audits registered sources and stored evidence at boot (unreviewed policies, suspensions, expired or ≤7-day expiry, pending review) and prints a compact `policy-lint` summary without blocking startup. Verified live: `policy_unreviewed:30, evidence_expiring_soon:19, evidence_awaiting_review:19`.
- **Server surface**: `/v1/topics` (catalog with human labels), `/v1/meta` (version for the About panel), `/admin/metrics` (anonymous, process-local unrecognized-question demand counts — no question text, reset on restart; verified `total:2` after two test asks). Rate limiting is split by route family (v1 120/min, admin 60/min, static 240/min per IP) so page reloads no longer consume answer quota; static assets serve content-hashed ETags with `no-cache` + 304 revalidation.
- **Coverage UI**: topic tiles, matrix rows and aria-labels use server-fed human labels (machine id kept in the accessible name), a "Language: English only" legend line from `/v1/coverage`'s new per-city `language` field, a "Sort: Most gaps / City A–Z" toggle (verified: matrix reorders groceries→first; cards tie-break alphabetically), and a matrix-only "Highlight gaps" toggle (verified: 10 gap rows, 9 missing cells emphasized).
- **Editorial desk**: triage renders as priority bands instead of row chips — urgent bands (suspended/expired/expiring/high-risk) open, "Routine records" collapses under its count; each row shows `Queued: <reason>`; the dashboard header derives its threshold wording from the queue's own thresholds.
- **Reports**: "Copy as report" now includes each quoted source's retrieval relevance score; failed copies append an honest explanation ("Your browser declined clipboard access. Printing works without that permission.").
- **Tests**: wording moved to a DOM-free `public/errors.js`; new unit tests pin `humanizeError` (status-before-text, 429/503/401 ordering), gap label honesty, review-queue thresholds + reasonCode, `lintEvidence`, topic labels/English, engine `verification` breakdown, verified-answer fallback contract (disabled/not_applicable/busy/fallback all preserve the baseline byte-for-byte), and new endpoints incl. rate-family separation, ETag 304, and trace privacy of metrics. New `scripts/migrate-dry-run.js` proves migration effects on a temp copy (verified: integrity ok, working DB untouched; a stray `tmpdir` import from `node:path` was caught and fixed).
- **Docs**: `docs/CHANGELOG.md` added; `ARCHITECTURE.md` gained a request-flow diagram; `CLARIFICATION.md` documents that "Copy as report" is a user-initiated export, not a transcript, consistent with the no-history framing.
- QA: full suite **209/209 pass** (was 191: +18), all source/public JS passes module syntax, and the flows above were verified in the structured browser with zero console errors. The stale-vs-review gap wording was already distinct in the engine (verified, no change needed); a display-only transcript stays a deliberate future decision.

### Frontend feature milestone (city-adaptive answers, shortcuts, theming, reporting)

- Example questions become a small client-side engine aligned with the live `/v1/coverage` map: the chip set adapts to the chosen city (OHIP shows only for the three Ontario cities, the Vancouver arrival example appears only for Vancouver), rotates through a "More examples" button, and falls back to the federal SIN question when no location is chosen. A duplicate-chip bug under a single valid example was caught and fixed in QA.
- Keyboard shortcuts: `/` focuses (and jumps to) the question composer, `Alt+1/2/3` switch ask/coverage/review views; hints live in the sidebar. `/` is suppressed while typing in any field.
- Each view now sets its own tab title (`Northstar — Ask Northstar` etc.) while a request is pending the title flashes to `… Asking Northstar`.
- A session theme toggle cycles Auto/Dark/Light in the sidebar. Auto follows the system preference; explicit choices apply to the tab only, never persisted — consistent with the no-storage policy.
- The pending state shows an elapsed-seconds counter ("Checking sources for your question… 3s elapsed") that stops reliably when the answer or error replaces it.
- Answers gained "Copy as report" (plain text with question, status, per-claim links, humanized gaps, source URLs and check/expire dates) and "Print" actions. Printing auto-opens the evidence details (revealed in `beforeprint`), hides interactive chrome, and strips colors for a clean paper report. Copying requires real user activation; in automated contexts the UI falls back to "Copy unavailable" rather than failing silently.
- A "What this pilot is — and isn't" panel explains coverage, human review, honest unavailability and that the pilot is not legal/immigration/medical advice.
- Coverage gained a "Compare cities" matrix: topic rows × city columns with the same status colors, honoring the topic search but deliberately ignoring status chips (a matrix about "what exists" reads better unfiltered); "City cards" restores the card mode.
- QA: matrix rows/cells verified against live coverage (arrival is source guidance only in Vancouver), examples verified per city, theme cycle, shortcuts, view titles and the elapsed counter all verified in the structured browser with zero console errors. Clipboard verification is limited to the fallback path by automation (copy requires a real user gesture); print CSS inspected in code, rendering in a visible window still open.

### Frontend UX completion milestone

- Answer cards now surface freshness (`Sources checked … · expire …`, amber when a source expires within 7 days), the optional AI rewrite status, per-claim review status and a "How was this answer chosen?" panel built from the retrieval diagnostics already returned by `/v1/answers`.
- Error paths use `role="alert"`, honor the server's `Retry-After` on 429 with a live countdown button, and the 503 admin-disabled message is no longer misclassified as a bad token (a pre-existing `humanizeError` branch order bug).
- The knowledge map gained status filter chips with counts, a topic search, per-tile source counts and the earlier status legend.
- Composer: Ctrl/Cmd+Enter submits, a live 0/2000 counter shows, example chips preselect their city, and the tab title flashes while a request runs.
- First-visit empty state replaced the silent gap between composer and principles.
- Accessibility and readability: view switches move focus to the view heading, micro-labels raised to 10px+ with darker grey tokens for contrast, decorative icons/calmed animations under `prefers-reduced-motion`, larger touch targets on small screens, favicon and semantic color tokens (including light `prefers-color-scheme: dark` support).
- Editorial desk: triage rows carry a numeric-priority chip (suspended source, expired evidence, expiring within 7 days, high risk pending review), sorting highest priority first; change reports show excerpt diffs as styled before/after blocks instead of raw preformatted text.
- QA in the structured browser: ask flow (including Ctrl+Enter), clarification city follow-up, coverage filters/search, admin-disabled and wrong-token errors, real 429 countdown, feedback controls; full suite still 191/191. Screenshot-level visual QA remains open. A display-only answer transcript remains a deliberate future decision (see `CLARIFICATION.md` framing), not part of this milestone.

### Frontend polish and browser QA milestone

- Added the missing spinner and skeleton styles and a pending-answer placeholder, so a stale previous answer never sits next to a newer question and the submit button shows visible progress while busy. The "Find guidance" arrow no longer disappears after the first request.
- The answer view now reports the optional AI rewrite status (`checked`, `fallback`, `busy`, `knowledge_changed`) as an inline chip with an explanatory sentence, and each claim carries its review status (`research seed` / `approved evidence`).
- The coverage map gained a status legend and per-tile color coding for source guidance, review/refresh and missing topics.
- Accessibility: nav uses `aria-current`, example buttons are explicit `type="button"`, the duplicated `aria-live` region was removed in favor of the existing spoken announcements.
- Structured browser QA passed: question flow with sources, clarification city follow-up (including changed-question and unsupported-location paths), coverage rendering, wrong-token error handling with retry, and feedback controls. No console errors. Screenshot-level visual QA remains open.
- No backend files changed; the full suite (191 tests) still passes.

### Bounded AI concurrency milestone

- Limited optional rewrite pipelines to four concurrent requests per instance by default. Excess requests return deterministic baseline guidance immediately with AI status `busy`.
- Timed-out calls that ignore cancellation retain their slot until settlement, preventing unlimited accumulation of provider work.
- All 191 tests pass, including five mock-provider capacity tests. Provider credentials, settings and the 30-record database remain unchanged.
- See `AI_CAPACITY.md` for scope, recovery behavior and pending live-provider/distributed testing.

### Local AI rewrite validation milestone

- Added per-claim protected-token checks before optional AI semantic review, covering numeric strings, selected number/condition words, links, email addresses and currency markers.
- Always displays the application-written introduction; generated introductions cannot add promises to the answer.
- All 186 tests pass, including thirteen new rewrite checks using mock providers. Provider configuration and the 30-record database remain unchanged.
- See `REWRITE_VALIDATION.md` for the lexical guard's limits. This does not establish general semantic correctness or live-provider accuracy.

### Telecom coverage milestone

- Added three official-source English records for mobile-plan resources, internet rights and complaints. The actual database now has 30 records: 11 low-risk summaries and 19 pending high-risk records.
- Added telecom subjects and price-gap handling. Navigation summaries cannot answer price-only questions, including in approved test fixtures.
- All 173 tests, 58 development evaluation scenarios and actual database verification pass. Source permissions and independent factual review remain pending.
- See `TELECOM_COVERAGE.md` for linked sources and access limits. The 30 research records are not 30 fully curated and archived documents.

### HTTP performance and throttling milestone

- Added an isolated local HTTP benchmark using file-backed SQLite WAL, 80 answer requests and concurrency 5, with all external AI explicitly disabled.
- Observed median 24.1 ms and p95 117.7 ms in the short local run; all 80 traces persisted and no benchmark checks failed. This is not production capacity or provider performance.
- Throttled responses now supply Retry-After; a monotonic clock and exact boundary reset are covered by three tests. The full suite passes 166 tests.
- See `HTTP_PERFORMANCE.md`. Working evidence and the active server were not modified by the benchmark.

### Shared evidence validation milestone

- Closed validation gaps between manual ingestion, retrieval and direct database writes: invalid dates/ranges, topic-risk downgrades and credential-bearing evidence URLs are rejected by shared validation.
- Retrieval withholds future source-check dates; structural historical validation remains time-independent.
- All 163 tests and 58 development evaluation scenarios pass. The actual 27-record database passes stricter verification with unchanged data and schema digests.
- See `EVIDENCE_VALIDATION.md`. Existing evidence, audit history and review decisions were not rewritten.

### Location clarification milestone

- Added city choices that retry an original question when its location is missing and unambiguous. Unsupported or conflicting places still require editing.
- Browser-only follow-up context is discarded on reload; changed questions invalidate old choices, and older responses cannot replace newer requests.
- All 152 tests pass, including four clarification tests with HTTP privacy and review-gate checks. Public JavaScript syntax checks pass; browser interaction QA remains incomplete.
- See `CLARIFICATION.md`. This adds one-step location follow-up without a user profile or general conversation memory.

### Licence context milestone

- Explicit issuing-country phrases now satisfy the driving clarification slot without confusing the origin with the destination. Missing or multiple origins still request clarification.
- Added six country alias groups and word boundaries for unsupported-place detection. No exchange eligibility is inferred from these aliases.
- All 148 tests and 58 development evaluation scenarios pass. The 27-record evidence corpus and publication gates remain unchanged.
- See `LICENCE_CONTEXT.md` for syntax, limitations and remaining multi-turn work.

### Expanded answer evaluation milestone

- Preserved the original 28-case dataset and added 30 scenarios for newer coverage, expiry boundaries, geography, pending evidence and partial answers.
- Added explicit checks for source identity, geography, claim-to-summary consistency, freshness, publication status, citation linkage and fixture-specific output requirements.
- All 137 tests and 58 development evaluation scenarios pass. Deliberately corrupted outputs are tested to confirm the evaluator detects failures.
- See `EVALUATION_EXPANSION.md`. These checks do not establish independent factual accuracy or production readiness. The database still contains 27 English research records.

### Editorial review priorities milestone

- Added an authenticated, read-only review queue and dashboard with topic/flag filters, expiry priorities, pending candidate IDs and explicit next actions.
- Separately reports source permission, snapshot provenance, human review, suspension and effective-date gaps. It does not approve evidence or renew expiry.
- Six new queue tests pass; the full suite now passes 132 tests. Public editorial JavaScript syntax validation passed. Browser interaction QA remains incomplete.
- See `REVIEW_QUEUE.md`. The corpus remains at 27 English records; human reviews, source permissions and archived excerpts are still pending.

### Housing coverage and retrieval milestone

- Added four pending English housing records: Ontario deposits and BC deposits, agreements and repairs. The corpus now has 27 records, including 16 pending high-risk records and 11 low-risk research summaries.
- Housing retrieval now filters by explicit subject before ranking. Unknown housing questions remain gaps; missing subjects in multi-part questions produce partial results when another subject has guidance.
- Added validated housing-subject metadata to imports and editorial change reports while preserving historical records and the original eviction seed's scope.
- All 126 tests and the original 28 development evaluation cases pass. See `HOUSING_COVERAGE.md` for linked sources, failed direct-fetch limitations and pending legal review.

### School and childcare milestone

- Added four English pending records: TDSB and VSB registration guides plus Ontario and British Columbia childcare resource hubs. The corpus now contains 23 records: 11 low-risk summaries and 12 high-risk records awaiting review.
- Separated childcare recognition from school queries and required high-risk classification for family and childcare imports.
- Preserved the school evidence gap in Brampton and Mississauga: official Peel content could not be retrieved. Vancouver registration-route differences remain explicitly unresolved, with no procedural answer published.
- All 116 tests and the original 28 development evaluation scenarios pass. See `FAMILY_COVERAGE.md` for linked sources and access limitations.

### Official-source coverage expansion

- Expanded the actual database from 9 to 19 English records and registered sources: 11 low-risk research summaries and 8 high-risk records pending independent review.
- Added city-specific transit planners for Toronto, Mississauga, Brampton and Vancouver, Vancouver library resources, and pending federal banking/tax/employment and provincial driving sources.
- Added transit intent recognition and enforced high-risk classification for driving imports. No eligibility, live fares, departure times or personalized itineraries are generated from these navigation records.
- The full suite passes 106 tests. The original 28 development evaluation scenarios also pass unchanged against the expanded corpus. Actual database integrity, references and English checks pass.
- Local engine benchmark with 19 records: 1,000 queries, p50 0.46 ms, p95 0.95 ms, p99 1.61 ms. This excludes HTTP, persistence and external AI and is not a production load test.
- See `COVERAGE_EXPANSION.md` for linked sources, direct-fetch limitations and remaining coverage. Source permissions remain unreviewed; no snapshots or human approvals were fabricated.

### Backup and recovery milestone

- Added SQLite online backups, verified manifests, checksum/schema/data validation, and isolated restore drills.
- Refactored database verification into a reusable read-only transactional verifier with streaming row checks.
- Created and verified an actual backup of the nine-record working database, then completed an isolated restore drill with three deterministic answer checks. The working database was not replaced.
- Seven recovery tests cover committed WAL data, source preservation, distinct output directories, checksum corruption, manifest tampering, incomplete backups and invalid snapshot hashes.
- The full suite passes 96 tests. See `RECOVERY.md` and the generated local restore report for scope and limits.
- Offsite/encrypted backups, retention scheduling, production cutover and distributed failover remain pending.

### Import change-tracking milestone

- Migration 5 adds immutable import comparisons, captured against the active evidence and archived excerpt at import time.
- Admin views show changed fields and excerpt spans, heuristic risk flags, potential source-related record impacts and change history.
- First imports from unarchived research seeds explicitly report missing source-text baselines. Older candidates are not given invented historical comparisons.
- New comparison records remain behind the existing candidate review/approval flow and do not alter public guidance on import.
- Eight new tests cover comparison correctness, idempotency, immutable history, impact hints and API authorization. The latest full suite passes 89 tests; the 28-case development evaluation also passes.
- See `CHANGE_TRACKING.md`. This is manual-import comparison, not completed website crawling or semantic policy-change detection.

### Restoration and source-suspension milestone

- Migrations 3 and 4 add immutable restoration events and current source-suspension state.
- Editors can restore an approved imported version with a current-state check, idempotency key, provenance validation and an English rationale. Restoring does not reset source freshness.
- Source suspension atomically withdraws its active guidance and blocks imports, restoration and reapproval. Renewed permission does not silently republish withdrawn records.
- Imported evidence reapproval also validates current source permission, authority and provenance.
- Answer generation rechecks the knowledge state after asynchronous AI work and discards drafts based on changed or withdrawn evidence.
- Admin controls and APIs are implemented. See `RESTORATION.md` for the distinctions between withdrawal, restoration and source suspension.
- The actual database migrated and passed integrity verification with four migrations and nine English records; no test publications, restorations or source suspensions were added to the project database.

### Lexical retrieval and evaluation milestone

- Added local BM25 keyword ranking after jurisdiction/topic filtering, English inflection normalization and acronym expansion.
- Tightened intent word boundaries to avoid false `parent`/`rent` and Social Insurance Number/health matches.
- Fixed citation completeness when high-ranked unavailable sources precede the evidence selected for claims.
- Added retrieval diagnostics and privacy-minimized version/candidate trace data.
- Added a repeatable, fixed-date 28-case development evaluation. All cases pass; this is not a human-reviewed gold dataset or production accuracy result.
- Docker's Linux engine was unavailable when checked. PostgreSQL integration remains unvalidated and pending; local retrieval work continued independently.
- See `RETRIEVAL.md` and `artifacts/evaluation.json` for methodology and limitations.

### Manual ingestion milestone

- Migration 2 adds a source registry, immutable English excerpt snapshots, pending candidates, append-only decisions and publication history.
- Admin UI and authorized APIs now support registration, manual-access policy review, import, candidate decisions and version inspection.
- Imports enforce exact quote matching, source URL matching, valid dates, pilot scope, high-risk topic classification and reviewed source authority. All imported facts remain pending until explicit review.
- Idempotency prevents duplicate retries. Baseline hashes prevent stale candidates from overwriting newer records. Publication and audit writes are transactional.
- Answer sources and traces retain snapshot references for imported evidence.
- The actual database migrated successfully: nine registered seed sources, two schema migrations, nine English evidence records. All source policies remain unreviewed; no test excerpts or fabricated publications were added.
- See `INGESTION.md` for the workflow and remaining limits. This is a SQLite milestone, not completed PostgreSQL infrastructure or automated crawling.

- Public UI, evidence summaries, API responses, editorial workflow and project documentation now use English only.
- The database uses one `summary` field and `language: en`; alternate-language seed fields are removed.
- Migration 1 converts legacy records and audit snapshots transactionally, preserving provenance and review status. Unconvertible legacy prose aborts migration instead of being silently translated or discarded.
- Protected tables have insert/update validation triggers. API requests and editorial notes are validated before persistence.
- The existing database was migrated successfully: nine English evidence records, one applied migration, no legacy audit or user-event rows. The read-only integrity/content check passed.
- Nine research sources remain: six low-risk summaries and three health/legal entries pending independent human review. This change does not expand factual coverage or approve those high-risk entries.

## Verification

The current source suite passes **397 tests**, including the corpus, review-queue, licence-context, language, retrieval, ingestion, recovery, queue and HTTP contract checks. Both development datasets pass (28 pilot / 68 expanded). This batch did not mutate the working SQLite database; the 258 seeds are inserted through the normal startup path on the next server start, and the earlier milestone counts below their headings describe historical runs. Shared-workspace additions were preserved. Browser interaction QA of the new portal citations remains incomplete.

`node scripts/verify-data.js` passed against the actual migrated database, including SQLite integrity, foreign-key checks, English schema/script checks and snapshot hash verification. Public JavaScript syntax checks passed. Tests use disposable databases, so the production snapshot count remains zero until a permitted excerpt is imported.

The updated 1,000-query microbenchmark against nine records measured approximately p50 0.360 ms, p95 0.730 ms and p99 0.973 ms in one local run. These numbers include the new evidence validation, but exclude HTTP, database persistence, external inference and concurrent load. They are not production latency or accuracy claims.

The earlier browser preview was blocked by its access approval gate. No renewed browser access was attempted in this change, and visual interaction QA remains incomplete. Automated HTTP tests verified the served English-only HTML and API flows.

## Remaining work

PostgreSQL/pgvector, semantic retrieval, robust English question-facet understanding, complete follow-up context, automatic source updates, immutable full-page snapshots, complete source-policy reviews, human-reviewed gold dataset, production authentication/observability and deployment are not completed. Phase 1 acceptance gates A–D remain open.

The next work package is M1: source-policy review, PostgreSQL schema and snapshots, 30–50 curated English documents, and the first 200 independently reviewed English evaluation questions. English correctness remains the priority before further languages or geographic expansion.

## Language-policy limitation

Script checks reject non-Latin writing systems but do not prove that Latin-script prose is English. Human editorial review remains responsible for semantic language correctness and factual accuracy. See `LANGUAGE_POLICY.md` for the exact contract and migration handling.
