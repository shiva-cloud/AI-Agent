# Northstar: project audit and non-KB execution roadmap

Audit date: 28 October 2026. Inspected package version: 0.19.1.

## 1. Executive decision

Northstar is a functioning local settlement-research prototype with substantial defensive engineering. It is not yet the evidence-backed, broadly capable, automatically updated Phase 1 platform described in the original specification.

The largest engineering constraints are question understanding, precise answerability, evidence publication enforcement, reproducible operations, and production access control. Adding more UI features or increasing the test count alone will not solve those constraints.

**Scope decision from the user:** leave KB work aside. This roadmap does not schedule new source research, factual editing, source-policy approvals, human evidence review, service listings or KB population. Infrastructure that supports existing evidence is included; it must be tested on fixtures and must not silently alter working evidence or approval status. KB completeness remains an external release dependency, so completing this engineering roadmap cannot by itself satisfy all Phase 1 launch gates.

This audit changes documentation only. Findings below are not marked fixed. An earlier interrupted turn proposed fixes but had not applied them.

## 2. What was actually checked

- Compared the original attached Phase 1 plan against the executable code, database schema, public UI source, scripts, tests and current documentation.
- Ran the full suite: **211 tests passed**, zero failures (`artifacts/audit-tests.tap`). This supersedes earlier reports of 191 or 209 tests.
- Ran both development evaluation datasets: **58 cases passed**. The 30-case expanded set has no retrieval-ranking labels; its Recall@5 and MRR are null, not measured successes.
- Ran database verification read-only: integrity and existing structural checks passed.
- Ran the isolated HTTP benchmark: 80 answers, concurrency 5, all traces persisted, no benchmark failures; median 22.3 ms, p95 74.9 ms, p99 91.2 ms in this run. External AI was disabled. These are short local results, not production capacity.
- Ran eight targeted deterministic question probes and a disposable in-memory publication probe. Results are in `artifacts/project-audit-probes.json`.
- Confirmed `git rev-parse` reports that this workspace is not a Git repository.
- Did not inspect credentials, send questions to live providers, modify production evidence, deploy, or restart the active server.
- Existing status notes report browser QA from other work. This audit did not repeat browser interaction or establish full accessibility coverage. Treat those notes as historical evidence, not comprehensive current browser certification.

The workspace has received changes beyond the earlier chat milestones. Package version is 0.19.1 while the status heading says 0.19.0; several older sections describe superseded behavior. Source code and freshly executed checks take precedence over those summaries.

## 3. Current capability inventory

| Area | Implemented | Important limit |
|---|---|---|
| Public experience | English chat, city selection, follow-up city choices, citations, coverage map/detail/compare, exports, themes, keyboard/help interactions | Mostly source navigation; not a comprehensive personalized settlement answer |
| Parser | Deterministic intent patterns, four-city aliases, province hints, housing/telecom subjects, six licence-origin groups | No validated general entity resolver, timeline/constraint parser or robust multi-turn state |
| Retrieval | In-memory BM25, geography/date/status filters, limited subject matching | No indexed corpus, embeddings, fusion, semantic reranking or exception retrieval |
| Answering | Source-summary claims, citations, partial/unavailable results, clarification, status breakdown | A related record can still be treated as sufficient guidance for an unanswered facet |
| AI | Optional provider routing, three-stage interpretation/rewrite/check, lexical rewrite guard, deadline, bounded concurrency | Interpretation happens after deterministic retrieval; it cannot rescue missing intents/evidence. Verification is model judgment, not independent factual review |
| Storage | SQLite WAL, English/script validation, five migrations, audit and history tables | Most domain content is JSON; no full facts/rules/services/chunks model or jurisdiction hierarchy |
| Editorial | Registry, manual excerpts, candidates, comparisons, reviews, restoration, suspension, triage | Working corpus has no archived snapshots or imported publications; seed approval follows a weaker path |
| Operations | Local backups/restore drills, HTTP benchmark, policy lint, migration utilities, request limits, ETags | No reproducible release pipeline, running worker scheduler, distributed operations or encrypted offsite recovery |
| Security/privacy | Local binding, token-protected admin, CSP, origin checks, request limits, minimized traces | Shared bearer token, self-declared reviewer identity, no roles, audit identity binding or production TLS integration |
| Quality | 211 tests; 58 developer cases; intentionally corrupted-output tests | No independent held-out gold audit, calibrated correctness or live-provider performance measurement |

## 4. KB boundary and honest product coverage

Database inspection found **30 records: 11 research seeds and 19 pending records; zero approved records**. There are 30 registered sources, but zero source-policy review events, snapshots, candidates, imported publications and review audits. Traces exist; they are not proof of real-user adoption or successful outcomes.

| City | Topics with available research navigation | Completely missing topic records |
|---|---|---|
| Toronto | SIN, community, transit | Arrival, groceries |
| Mississauga | SIN, community, transit | Arrival, family/school, groceries |
| Brampton | SIN, community, transit | Arrival, family/school, groceries |
| Vancouver | SIN, community, arrival, transit | Groceries |

All remaining represented topics are pending review. A topic tile with a record does not establish topic depth, exact question support, legal applicability or verified local contacts.

The original plan requested 100–200 authoritative documents and 200 reviewed initial questions, growing toward 1,000+ distinct gold questions. Thirty short records and 58 developer fixtures are different artifacts and cannot be counted as satisfying those targets. Per the user's instruction, completing that KB work is deferred.

## 5. Verified defects and engineering gaps

### P0: explicit unsupported geography can silently become Canadian guidance

**Evidence:** `src/engine.js`, `parse`, hardcodes `country: CA` and checks only a short unsupported-place list.

- `Can I get a SIN in Paris?` returns Canada guidance without clarifying Paris or the country.
- `Where is the nearest library in Dubai?` with the selected city Toronto returns Toronto library and national newcomer summaries with no geography gap.

These are reproduced parser/relevance defects, not just absent KB content. Even if Canadian SIN information could sometimes be relevant abroad, the explicit location cannot be silently discarded.

**Change:** resolve explicit place mentions separately from selected context; preserve origin versus destination; classify unsupported, ambiguous and unresolved places explicitly. Do not solve this by continually extending a blacklist. Add a bounded gazetteer and validated entity output, with conservative clarification where resolution fails.

**Exit:** unseen-place tests cannot emit unrelated Canadian guidance; explicit places override UI context only after resolution; unsupported cities do not inherit selected-city evidence.

### P0: seed approval bypasses the imported-evidence provenance gate

**Evidence:** `src/store.js`, `review`, calls `assertReviewable` only when sourceId or snapshotId exists.

In a disposable store, approving `ohip` changed pending to approved with source policy still unreviewed and snapshot count still zero. The working database was not changed. This is not an unauthenticated exploit; it is a weaker authorized publication path than the target evidence standard.

**Change:** unify publication policy. Require accepted provenance and access-policy checks for verified publication, or expose a distinct legacy/editorial-only status that cannot masquerade as verified evidence. Derive reviewer identity from authentication, not a typed name. Do not fabricate approvals to make the gate pass.

**Exit:** direct review, candidate approval, restoration and reapproval all obey one publication invariant. Implement with fixtures while leaving live KB records pending.

### P0: migration dry-run is not WAL-safe and can report failure with a successful exit

**Evidence:** `scripts/migrate-dry-run.js` copies only the main SQLite file using `copyFileSync`. Committed changes can reside in WAL. It also catches migration failures and prints FAILED without setting a failing exit code, assumes the migrations table already exists, and uses an ineffective prepared-statement property when checking integrity.

**Change:** use SQLite's online backup API from a read-only source connection; handle legacy schemas; execute and inspect integrity PRAGMAs correctly; close resources on all paths; return nonzero on failure; resolve and validate temporary cleanup paths.

**Exit:** an uncheckpointed WAL fixture retains its committed rows in the dry-run; invalid migrations fail CI; source file remains unchanged. This does not require any KB editing.

### P1: keyword matches are being confused with answering the requested facet

**Evidence:** `Where is free internet at Toronto library?` becomes community plus high-risk telecom; it returns broad newcomer summaries and a pending Internet Code gap. It does not isolate free library internet access, branch or availability.

The nurse example lacks work-status, regulator, timeline and credential facets. The first-week Vancouver example returns a guide link, not a family checklist. `What changed since last week?` is unrecognized.

**Change:** create a typed query plan: intent, requested facets, location, origin, timeline, constraints, requested format and material missing slots. Check answerability separately from ranking. Keep generic navigation explicitly distinct from a direct answer. For unknown facets, report the precise missing capability rather than implying the question is covered.

**Exit:** parser and answerability tests pass with synthetic reviewed fixtures, including mixed supported/unsupported facets; no KB expansion is needed to implement the logic.

### P1: UI explanations and location controls have correctness problems

- `public/app.js` labels every available retrieval candidate as quoted in guidance, although only selected claims are actually quoted. Use selected evidence IDs, not availability.
- Other-city buttons retain the original question. If it explicitly says Toronto, selecting Vancouver cannot change the parsed city because explicit question text wins. Offer a clear edited-question flow, or show these buttons only for context-only locations.
- The freshness chip uses the most recent checked date across sources and can make older evidence look newer. Display a range or oldest relevant check date and distinguish cited from merely related sources.
- Historical QA notes and source-level checks are not a substitute for repeatable desktop/mobile/keyboard end-to-end tests.

**Exit:** displayed city, selected city, actual source scope and exported report agree; relevance and verification labels reflect actual claims; accessibility and stale-request tests run repeatably.

### P1: AI path is not the main understanding engine, and has latency/privacy gaps

`createVerifiedAnswer` builds the deterministic baseline first and skips AI when there are no claims. Its understand stage therefore does not recover an unrecognized question. Three sequential provider calls polish already selected summaries.

`createAIRouter` returns a 45-second overall budget, overriding the wrapper's 12-second default; provider calls use 30-second stage timeouts. The local no-AI benchmark does not measure this path. Rotation/failover also means the same provider/model family may contribute to writing and checking; separate calls do not establish independent review.

**Change:** explicitly configure provider/model allowlists, latency and token budgets, retry/cooldown policy and data handling. Separate constrained parsing from optional wording. Prefer immediate deterministic templates for exact facts, and measure whether rewriting provides enough benefit to justify latency. Add prompt redaction before provider transmission and operational metrics without raw question logging.

Do not rely on comments that models are free or verified-working as current operational guarantees. This audit did not verify live provider availability, pricing or retention policies and did not make live calls.

### P1: domain model and retrieval need a planned migration

There is no relational country/region/city/neighborhood hierarchy, reusable evidence chunks, structured facts and conditions, services, exception links or semantic contradiction model. Current JSON is useful for prototyping but not a substitute for the original schema. Re-ranking currently uses lexical relevance plus scope; it does not fully rank authority, applicable conditions or source independence.

**Change:** keep the working application while introducing storage interfaces, typed domain contracts and additive migrations. Add PostgreSQL full-text retrieval first, then evaluate optional vectors and reciprocal-rank fusion against a held-out fixture corpus. Do not assume vectors improve correctness. Keep strict scope/status/date filters and measure before/after.

### P1: gap improvement is not a complete workflow

Stored gaps contain topic/reason/trace only. There is no owner, priority, lifecycle, original-failure regression link, resolution evidence or close/reopen criterion. Raw-question minimization is valuable but leaves little reproducible diagnostic context. Metrics largely count unrecognized intents and reset on restart.

**Change:** structured redacted query fingerprints and facet summaries, optional explicitly consented diagnostic examples, assigned engineering tickets, recurrence counts, resolution tests and retention. Never silently start saving raw questions. Implement `/admin/gaps` with authorization and pagination.

### P1: operations and access control are local-demo level

- No Git repository in the workspace; no CI workflow was found. Backups do not replace source history.
- Admin relies on one shared token and caller-supplied reviewer name; no viewer/editor/reviewer/admin separation.
- Dockerfile is a demonstration image; server binds to container loopback, and there is no complete deployment/volume/health/TLS configuration.
- Broad exception handling returns raw error messages as HTTP 400, including internal failures. Introduce typed public errors and protected diagnostic IDs.
- Trace and gap writes are not one transaction; persistence failures can leave partial records.
- No documented graceful drain of HTTP/provider/database work, production readiness checks or release promotion/rollback process.
- Backup verification exists, but encryption, offsite storage, restore objectives and scheduled restore drills are not operationally established.

### P2: automated updates remain an unbuilt subsystem

Manual excerpt comparison is implemented; a scheduler, durable jobs, approved URL fetcher, HTTP conditional requests, parser isolation, retries, dead-letter queue, source-specific schedules and reindex orchestration are not. Build interfaces and fixture tests while KB is paused. Do not enable live crawling or source jobs without reviewed policy configuration.

### P2: documentation and release reporting need consolidation

Package/status versions differ. Earlier docs still describe one provider or one rate-limit bucket where current code has multiple providers and route families. README correctly warns against copying a live DB main file while the dry-run script does exactly that. Counts and historical milestones are scattered. Consolidate one release manifest, current capabilities table, known issues and CI-generated verification report. Do not use version increments as evidence that Phase 1 gates are met.

## 6. Original Phase 1 acceptance gates

| Gate | Current result | Required evidence |
|---|---|---|
| A: sufficient pilot coverage | Not met; deferred KB dependency | Reviewed topic/facet coverage and verified service sample |
| B: retrieval quality | Not established | Independent held-out labels, jurisdiction tests and measured Recall@5/MRR |
| C: grounded answers | Not established | Human-audited claim support, citation precision and abstention |
| D: automated updates | Not met | Permitted scheduled fetch-to-review-to-publish-to-rollback tests |

Passing 211 unit/integration tests is useful engineering evidence, not a replacement for any of these gates. No honest overall completion percentage can be calculated from the present artifacts.

## 7. Recommended architecture decisions

1. Keep a modular Node service; do not rewrite everything in Python or React solely to match the original suggested stack. Move to typed contracts incrementally.
2. Separate query understanding, evidence retrieval, answerability, composition and verification behind testable interfaces.
3. Introduce PostgreSQL behind a repository boundary and keep SQLite as a local fixture adapter until migration is proven.
4. Separate worker execution from HTTP requests; jobs must be durable, idempotent and policy-gated.
5. Centralize publication eligibility and authenticated audit identity.
6. Keep English as the only canonical language. Script checks are not language detection; validate English prose separately where needed.
7. Keep raw queries and personal documents out of persistent storage by default. Add only privacy-reviewed diagnostic metadata.
8. Distinguish system readiness from content readiness in every release report.

## 8. Non-KB execution plan

Estimates are engineering effort ranges for one experienced engineer, not calendar promises. Some tasks overlap; reviewer availability and hosting choices can extend elapsed time. A realistic initial planning envelope is approximately 10–16 engineer-weeks, re-estimated after the first two milestones. KB work is excluded.

| Stage | Priority / effort | Deliverables | Completion criteria |
|---|---|---|---|
| E0: reproducible baseline | P0, 2–3 days | Local Git history after secret/file exclusions; release manifest; CI tests, syntax, evaluations and fixture DB checks | Clean checkout reproduces the suite; no secrets, runtime DB or backups tracked |
| E1: demonstrated defects | P0, 3–5 days | WAL-safe dry-run; failing exit codes; geography resolution guard; unified publication policy; UI city/citation corrections | Every reproduced audit defect has a regression test; live KB unchanged |
| E2: contracts and persistence | P1, 1–2 weeks | Typed request/response/domain schemas, repositories, additive PostgreSQL migrations, OpenAPI, transactional trace writes | Fixture migration/rollback and API contract tests pass; no data loss; stable IDs |
| E3: understanding and answerability | P1, 1–2 weeks | Facet decomposition, validated entity resolver, controlled clarification state, precise unknown reasons | Unseen-place and multi-part adversarial tests; no silent location/eligibility assumptions |
| E4: retrieval interfaces | P1, 1–2 weeks | Indexed lexical search, optional vector adapter/fusion, relevance diagnostics, exception/conflict interfaces | Held-out engineering fixture baseline beats or matches lexical-only without geography regressions |
| E5: accountable administration | P1, 1 week | Identity-backed roles, authenticated audit actor, revision checks, complete gap lifecycle | Authorization matrix and concurrent-decision tests; no self-declared reviewer authority |
| E6: provider and runtime operations | P1, 1 week | Explicit budgets, structured redacted metrics, typed errors, shutdown/drain, configurable provider policy | Slow/failing/aborted provider tests; measured AI/non-AI latency; no secret leakage |
| E7: worker foundations | P2, 1–2 weeks | Durable jobs, retries, scheduler, conditional-fetch/parser interfaces, change/reindex orchestration | Fixture-only end-to-end update/rollback; prohibited source cannot execute; failed fetch never deletes content |
| E8: UX and release system | P1/P2, 1–2 weeks | Repeatable browser/accessibility suite, deployment manifests, TLS/proxy configuration, encrypted backup/restore runbook, staging smoke | Reproducible staged deploy and rollback; keyboard/mobile/error flows pass; timed restore drill |
| E9: engineering release audit | P1, 3–5 days | Defect closure, load/soak report, security review, current docs and readiness checklist | No unresolved critical engineering issues; KB-dependent gates explicitly remain blocked/deferred |

Production publication is a separate decision after staging evidence exists. No repository push, cloud spend or public deployment is implied by this plan.

## 9. First ten working days

- Days 1–2: capture baseline, establish local version control/CI exclusions, reconcile current docs and versions, preserve the audit probes as regression fixtures.
- Days 3–4: repair WAL migration dry-run, exit status, resource cleanup and integrity reporting; prove behavior on an uncheckpointed fixture.
- Days 5–6: close seed/publication gate inconsistency using disposable records; introduce actor/revision contract for review without editing live KB.
- Days 7–8: replace silent geography fallback with explicit resolution states; fix city-switch UI and actual-citation labels; test unsupported places and context collisions.
- Days 9–10: publish the typed query/answer contract and repository interface; establish the next migration and parser sprint with a measured baseline.

Stop adding cosmetic features during this interval unless they fix a verified usability or accessibility defect.

## 10. Proposed engineering release criteria

- All supported API contracts and authorization paths have positive and negative tests.
- No known geography substitution, publication bypass or WAL-loss defect remains.
- Correct abstention and per-facet gaps are tested independently of source availability.
- No-AI and AI latencies are reported separately; suggested initial targets are local/staging no-AI p95 below 500 ms and an explicitly budgeted AI fallback deadline, to be validated on the chosen environment rather than claimed now.
- Load reports specify corpus size, concurrency, duration, warm/cold state and provider mode; a short 80-request run is not a soak test.
- Staging restore and rollback meet agreed objectives; an initial proposed target is RPO 24 hours and RTO 60 minutes, subject to operational validation.
- No secrets or raw personal queries in logs, fixtures, Git or exports without explicit user action/consent.
- Current documentation matches actual configuration, statuses and measured test results.
- Engineering readiness may pass while KB/content readiness remains deferred. The product must continue to label unsupported or unreviewed answers honestly.

## 11. What not to build now

Do not expand countries, add multilingual data, build a consultant CRM, payments, document vault, visa tracking or case submission. Do not bulk-create synthetic near-duplicate questions to claim a gold dataset. Do not refresh expiry dates without source checks, approve seeds merely to improve coverage, or use an LLM as the authority for missing facts. These would either violate the English-only/KB scope decision or distract from the current engineering risks.

## 12. Immediate recommendation

Execute E0 and E1 first, then typed data/query contracts before a large migration or UI rewrite. Preserve the existing working prototype and safeguards. Keep KB untouched, but maintain its limitations as explicit external dependencies in the release decision.
