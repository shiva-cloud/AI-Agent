# Northstar: गहन QA और module audit — 2 November 2026

Version: 0.19.49. यह वर्तमान workspace का local audit है। Audit के दौरान production code fix नहीं किया गया। पिछले remediation के अधूरे changes भी इसी baseline का हिस्सा हैं।

## सबसे जरूरी निष्कर्ष

प्रोजेक्ट का local software foundation काफी काम कर रहा है, लेकिन इसे पूरी तरह verified settlement/legal product कहना सही नहीं होगा। Planning के लिए मेरी readiness estimate **75% working / 25% बाकी** है; इसका uncertainty range **65–85%** है। यह engineering judgment है, measured feature-completion score नहीं। Product requirements का signed acceptance checklist, independent legal review और production environment के बिना exact overall percentage निकालना संभव नहीं। इस estimate से अलग नीचे reproducible metrics दिए हैं।

| माप | परिणाम | इसका सही मतलब |
|---|---|---|
| पूरी npm test suite | 2,290 pass / 2,291 reported tests; 99.96% | एक पूरी test file import पर fail; उसके अंदर के cases चले ही नहीं। यह product accuracy प्रतिशत नहीं है। |
| Source inventory | 336 JavaScript modules | हर module नीचे appendix में दर्ज है; सभी का manual line-by-line proof नहीं किया गया। |
| Direct test imports | 323/336; 96.13% | Static import mapping; line/branch coverage नहीं। |
| GET tool route smoke | 193/194 HTTP 200; 99.48% | एक route ने 400 दिया; कोई 5xx नहीं। Successful response का अर्थ सही eligibility calculation नहीं। |
| Adversarial GET sweep | 187/194 HTTP 200 | Shared invalid query bundle भेजा; सभी parameters हर route पर लागू नहीं होते। इसलिए इन सबको validation bugs नहीं कहा गया। |
| Response garbage | 0 NaN/Infinity/[object Object] matches | केवल इन output tokens की जाँच। |
| Published API contract | 299 paths, 1,268 schemas validated | Live semantic correctness अलग जाँच है। |
| KB scheduled review | 74/589 (12.56%) done; 515 बाकी | Review queue की अपनी tracking; approved publication provenance का substitute नहीं। |
| Editorial provenance | 589 records flagged | KB health में approved without editorial review warning। |
| Dependency audit | 0 reported vulnerabilities | Installed dependency snapshot; यह penetration test नहीं। |

## P1: reproduced problems

### A01 — test gate broken: removed export import

Full suite में test/diagnosis-2026-11-01.test.js line 5, src/server.js से TOOL_OUTPUT_GARBAGE import करता है, जो export नहीं होता। File instantiation पर SyntaxError आता है; इसके regression cases execute नहीं होते। CI को green मानना गलत होगा। Fix: helper के वास्तविक module से import करें या public HTTP behavior test करें; internal helper को सिर्फ test green करने के लिए public server API न बनाएँ। Acceptance: पूरी file execute और full suite zero failures।

### A02 — invalid family/program silently substituted

Reproduction: evaluateProofOfFunds({program:'invalid',familySize:-8,availableFundsCad:999999}). Actual: program='fsw', familySize=1, meetsRequirement=true. Negative family size और unsupported program पर rejection/clarification की जगह अलग scenario का positive assessment मिलता है। Fix: explicit enum, finite nonnegative money, integer family bounds; missing field को invalid field से अलग रखें। GET और POST दोनों पर same rules।

### A03 — unknown province uses another jurisdiction

Reproduction: auditWorkerClassificationAndWageTheft({province:'ZZ'}). Actual: output province='ZZ', जबकि internal provRules fallback Ontario है; classification और monetary wage-theft estimate भी मिलता है। Fix: supported province allow-list; no silent cross-jurisdiction fallback. Acceptance: invalid province => 400; verified ON/BC/AB/FED inputs retain intended behavior।

### A04 — empty worker profile invents an adverse determination

Reproduction: auditWorkerClassificationAndWageTheft({}). Actual: ON, UNLAWFUL_EMPLOYEE_MISCLASSIFICATION, totalDirectWageTheftCad=7600. Defaults assume worker schedule, wages, duration, five employee factors and unpaid benefits. User facts के बिना liability estimate बन रहा है। Fix: missing facts की सूची और insufficient-information state; demo data केवल explicitly labelled example mode में। Numerical calculation और legal classification को अलग रखें।

### A05 — reviewed product coverage is incomplete

Read-only KB health: 906 DB records, 490 seed records, 500 glossary entries, 10 tracked facts; 589 records lack editorial-review provenance. Scheduled review queue: 45 verified, 29 corrected, 515 remaining. Health command का ok=true technical data checks के लिए है; editorial completeness के लिए नहीं। Fix: separate technical-health and publication-readiness gates; traceable reviewer, source excerpt, snapshot hash, review dates and withdrawal lifecycle। Automatically marking everything reviewed would hide the issue।

## P2: reliability और quality gaps

### A06 — KB health transient lock failure

पहली run database is locked पर stack trace और exit 1 हुई। Retry सफल हुई। Persistent corruption prove नहीं हुई; contention handling में operational weakness reproduce हुई। Fix: bounded busy timeout/retry for read-only health, structured busy status, consistent read snapshot. किसी lock पर false healthy result न दें।

### A07 — calculator validation breadth needs expansion

194 routes पर default और shared hostile query चलाया गया। Unknown/unused query parameters का 200 मिलना खुद defect नहीं। A02–A04 independently confirmed हैं; बाकी endpoints को route-specific negative tests चाहिए: actual consumed fields, impossible calendar dates, enum typos, fractional counts, zero vs omitted, boolean strings, extreme magnitudes और conflicting jurisdiction. Full probe ledger attached है।

### A08 — strong green tests can encode unsafe assumptions

कई calculator tests constants और their own templates को check करते हैं। यह independently sourced legal accuracy नहीं। Empty profile पर liability निकलने के बावजूद broad suite mostly green है। Fix: missing-input and invariance tests, independently reviewed boundary fixtures, source-specific expected outcomes, mutation testing of consequential rules. Test titles में statutory accuracy/zero leak का दावा actual tested scope तक सीमित रखें।

### A09 — lint scope limited

ESLint passes, पर public/ ignored है और no-undef disabled है। इसलिए frontend syntax/runtime unknown identifiers का comprehensive static gate नहीं है। Public scripts के parse tests मौजूद हैं; browser checks जरूरी रहते हैं। Fix: separate browser lint config, intentional globals, gradual no-undef enablement. Entire repo को एक बार में style-reformat करने की जरूरत नहीं।

### A10 — architecture and change coordination

Source module count बड़ा है और central server/frontend files बहुत बड़े हैं। Small fixes के लिए auth, validation, routing और response shape का coupling risk है। Suggested extraction order: input schemas, route registration, account middleware, domain tool adapters, frontend view modules. API contract और safety tests हर extraction पर unchanged behavior prove करें। Source snapshot/version control discipline जरूरी है; earlier session में concurrent changes देखे गए थे।

## Module/feature assessment

| Feature family | Tested evidence | Current status / remaining work |
|---|---|---|
| Answer parser, geography, retrieval, evidence gates | Full suite plus empty-source and unsupported geography regressions | Mostly working locally; independent relevance/recall benchmark और real reviewed corpus बाकी। |
| Immigration pathways, CRS, PNP, country visa tools | Domain tests और GET route sweep | Calculators runnable; real legal eligibility certification unverified; validation audited individually only for reproduced findings। |
| Employment, wage theft, reference letters | Full suite and targeted probes | Worker inputs में P1 defects; reference empty input अब deficient result देता है। |
| Housing, deposits, tenancy, eviction | Domain tests + API smoke | Technical behavior covered; current legal rules and exceptions need independent review। |
| Healthcare, medical admissibility | Invalid-input tests + routes | Preliminary assessments; clinical safety/triage and medical/legal correctness not certified। |
| Money, proof-of-funds, taxes, banking | Domain tests + targeted proof-of-funds | Family/program validation broken; financial content review बाकी। |
| Journey and calendar | Actual Chromium desktop/mobile; date/category/city, checkboxes, unsupported country | Tested Journey flow passed, zero page errors; all views/browser/assistive-tech matrix नहीं चला। |
| Glossary, translation, multilingual | Suite; KB count; privacy/moderation regressions | Storage/privacy mechanics covered; 500-term translation accuracy not independently rated। |
| Signup/login/session/password/quota/admin | Full suite + child server auth/origin checks | Local fixture behavior strong; real mail delivery, billing, provider and abuse tests unverified। |
| Queue, schedules, workers | Worker smoke and lifecycle/recovery tests | Fixture jobs pass; evidence adapter accepts verify_snapshot and configured reindex, not every advertised job kind. Live source-fetch capability must be checked per adapter। |
| Storage, migrations, backup/restore | Full recovery tests and preflight | Local fixtures pass; production-sized restore, real offsite access and RTO/RPO drill unverified। |
| Static/PWA/offline | Script tests and Journey browser run | Real offline/service-worker update/mobile device matrix incomplete। |
| CI/deployment/security headers | Local commands; schema, dependencies; server smoke | Local checks do not prove remote CI, TLS, reverse proxy, container runtime or external penetration resistance। |
| AI routing/fallback | Fixture/provider mocks in suite, external AI disabled in smoke/load | Real provider latency, failures, spend and grounded generation not measured here। |

## Performance and execution results

Local HTTP benchmark: 80 requests, concurrency 5, throughput 56.42 requests/sec, p50 38.99 ms, p95 756.71 ms, failures 0. External AI disabled; यह production capacity result नहीं। Server child-process smoke, worker smoke, preflight, OpenAPI validation, TypeScript checking, lint and Journey browser script passed. npm audit reported zero known dependency vulnerabilities. KB health first failed on contention, second read passed with editorial warnings।

## Recommended execution order

1. A01 test import repair; A02–A04 strict validation and insufficient-information behavior; add reproductions as regressions.
2. Publish-readiness gate separate from KB technical health; prioritize review of high-consequence medical/status/deadline/money content.
3. Expand route-specific negative scenarios and actual UI flows; cover offline, accessibility, keyboard, mobile forms, locale confirmation, account state transitions.
4. Exercise real production-like deployment with synthetic accounts and provider sandbox; test recovery, throttling, secrets, mail failure and audit attribution.
5. Extract large modules incrementally and measure coverage by critical branches, not test count alone.

## Limits and evidence

इस audit ने हर module को inventory किया, suite execute की और every documented GET tool route probe किया। हर module की हर branch, every POST combination या every screen manually inspect करने का दावा नहीं है। Percentage estimates को budgeting aid मानें। No live publication, external emails, payment or production deployment किया गया। Working KB only read by health; HTTP tests used memory/temp stores. Report intentionally preserves defects for review; audit artifacts are separate from implementation fixes।

Evidence files: artifacts/AUDIT_2026-11-02_tests.txt, inventory.json, targeted.json, kb.json, dependencies.json, api.txt, types.txt, lint.txt, preflight.txt, browser.txt, server-smoke.txt, worker-smoke.txt, http-load.json (all prefixed AUDIT_2026-11-02_).

## Appendix A: complete source-module inventory

Direct tests is the number of test files that statically import that source module. Zero can still have indirect coverage; positive counts do not prove all branches. Lines are approximate source line counts.

| Module | Lines | Direct test files | Coverage evidence |
|---|---:|---:|---|
| src/accounts.js | 692 | 7 | Imported by automated tests |
| src/admin-auth.js | 69 | 5 | Imported by automated tests |
| src/ai-guardrails.js | 66 | 1 | Imported by automated tests |
| src/ai-policy.js | 34 | 1 | Imported by automated tests |
| src/ai-router.js | 294 | 5 | Imported by automated tests |
| src/ai-token-quota.js | 75 | 1 | Imported by automated tests |
| src/airport-phrasebook.js | 224 | 0 | Indirect/unverified; inspect explicitly |
| src/alberta-alep-rural-entrepreneur-stream-navigator.js | 215 | 4 | Imported by automated tests |
| src/alberta-commercial-tenant-distress-navigator.js | 197 | 4 | Imported by automated tests |
| src/alberta-employment-constructive-dismissal-salary-reduction-navigator.js | 162 | 4 | Imported by automated tests |
| src/alberta-employment-general-holiday-pay-navigator.js | 213 | 4 | Imported by automated tests |
| src/alberta-employment-maternity-parental-leave-navigator.js | 207 | 4 | Imported by automated tests |
| src/alberta-employment-overtime-banking-navigator.js | 207 | 4 | Imported by automated tests |
| src/alberta-employment-rest-periods-shift-limits-navigator.js | 195 | 4 | Imported by automated tests |
| src/alberta-employment-termination-just-cause-audit-navigator.js | 146 | 4 | Imported by automated tests |
| src/alberta-employment-youth-employment-rules-navigator.js | 195 | 4 | Imported by automated tests |
| src/alberta-opportunity-stream-navigator.js | 219 | 4 | Imported by automated tests |
| src/alberta-residential-tenancy-abandoned-goods-distress-navigator.js | 158 | 4 | Imported by automated tests |
| src/alberta-residential-tenancy-landlord-entry-notice-navigator.js | 205 | 4 | Imported by automated tests |
| src/alberta-residential-tenancy-periodic-tenancy-termination-navigator.js | 163 | 4 | Imported by automated tests |
| src/alberta-residential-tenancy-sublease-assignment-navigator.js | 172 | 3 | Imported by automated tests |
| src/alberta-tenancy-security-deposit-navigator.js | 177 | 4 | Imported by automated tests |
| src/alert-webhook.js | 88 | 1 | Imported by automated tests |
| src/answer-cache.js | 27 | 2 | Imported by automated tests |
| src/answer-composer.js | 470 | 5 | Imported by automated tests |
| src/anyrouter.js | 37 | 3 | Imported by automated tests |
| src/api-errors.js | 24 | 6 | Imported by automated tests |
| src/atlantic-immigration-navigator.js | 233 | 4 | Imported by automated tests |
| src/ats-matcher.js | 137 | 2 | Imported by automated tests |
| src/audio-speech-helper.js | 154 | 1 | Imported by automated tests |
| src/australia-germany-global-navigator.js | 141 | 2 | Imported by automated tests |
| src/auto-insurance-navigator.js | 225 | 3 | Imported by automated tests |
| src/backup-owner.js | 36 | 1 | Imported by automated tests |
| src/backup-rekey.js | 52 | 1 | Imported by automated tests |
| src/backup-retention.js | 67 | 2 | Imported by automated tests |
| src/backup-service.js | 40 | 1 | Imported by automated tests |
| src/banking-navigator.js | 240 | 3 | Imported by automated tests |
| src/bc-speculation-tax-declaration-navigator.js | 208 | 4 | Imported by automated tests |
| src/bc-strata-bylaw-navigator.js | 170 | 4 | Imported by automated tests |
| src/bilingual-view-helper.js | 98 | 2 | Imported by automated tests |
| src/border-flagpoling-navigator.js | 279 | 4 | Imported by automated tests |
| src/bowp-navigator.js | 301 | 4 | Imported by automated tests |
| src/british-columbia-employment-child-youth-employment-navigator.js | 223 | 4 | Imported by automated tests |
| src/british-columbia-employment-illness-injury-leave-navigator.js | 186 | 4 | Imported by automated tests |
| src/british-columbia-employment-overtime-banking-navigator.js | 170 | 4 | Imported by automated tests |
| src/british-columbia-employment-severance-group-termination-navigator.js | 221 | 4 | Imported by automated tests |
| src/british-columbia-employment-uniform-equipment-deduction-navigator.js | 165 | 4 | Imported by automated tests |
| src/british-columbia-pnp-skills-immigration-tech-navigator.js | 206 | 4 | Imported by automated tests |
| src/british-columbia-residential-tenancy-dispute-resolution-urgency-navigator.js | 137 | 4 | Imported by automated tests |
| src/british-columbia-residential-tenancy-landlord-use-eviction-navigator.js | 204 | 4 | Imported by automated tests |
| src/british-columbia-residential-tenancy-security-deposit-double-penalty-navigator.js | 161 | 5 | Imported by automated tests |
| src/british-columbia-speculation-tax-audit-appeal-navigator.js | 177 | 4 | Imported by automated tests |
| src/british-columbia-strata-depreciation-report-reserve-fund-navigator.js | 166 | 4 | Imported by automated tests |
| src/british-columbia-strata-ev-charging-navigator.js | 197 | 4 | Imported by automated tests |
| src/british-columbia-strata-short-term-rental-bylaw-navigator.js | 185 | 4 | Imported by automated tests |
| src/british-columbia-tenancy-roommate-shared-kitchen-navigator.js | 154 | 4 | Imported by automated tests |
| src/business-navigator.js | 325 | 4 | Imported by automated tests |
| src/calculator-input.js | 18 | 1 | Imported by automated tests |
| src/calgary-secondary-suite-amnesty-navigator.js | 214 | 4 | Imported by automated tests |
| src/canada-status-admissibility-guard.js | 246 | 3 | Imported by automated tests |
| src/changes.js | 95 | 4 | Imported by automated tests |
| src/child-disability-benefit-navigator.js | 188 | 4 | Imported by automated tests |
| src/child-welfare-guardianship-navigator.js | 179 | 4 | Imported by automated tests |
| src/childcare-navigator.js | 230 | 3 | Imported by automated tests |
| src/childcare-subsidy-navigator.js | 160 | 3 | Imported by automated tests |
| src/citation-linker.js | 201 | 2 | Imported by automated tests |
| src/citizenship-navigator.js | 187 | 3 | Imported by automated tests |
| src/city-comparison.js | 181 | 5 | Imported by automated tests |
| src/client-address.js | 34 | 2 | Imported by automated tests |
| src/commercial-lease-navigator.js | 247 | 4 | Imported by automated tests |
| src/community-translation-ledger.js | 251 | 4 | Imported by automated tests |
| src/consumer-protection-navigator.js | 226 | 3 | Imported by automated tests |
| src/conversation-resolver.js | 153 | 2 | Imported by automated tests |
| src/corridors-registry.js | 222 | 1 | Imported by automated tests |
| src/country-portals.js | 1267 | 1 | Imported by automated tests |
| src/country-settlement.js | 365 | 2 | Imported by automated tests |
| src/cra-newcomer-wealth-navigator.js | 314 | 4 | Imported by automated tests |
| src/cra-voluntary-disclosure.js | 239 | 3 | Imported by automated tests |
| src/crawl-policy.js | 28 | 3 | Imported by automated tests |
| src/credential-licensure-bridge.js | 388 | 3 | Imported by automated tests |
| src/credential-navigator.js | 480 | 3 | Imported by automated tests |
| src/criminal-rehabilitation-navigator.js | 222 | 4 | Imported by automated tests |
| src/cross-border-tax-navigator.js | 424 | 4 | Imported by automated tests |
| src/currency-exchange-navigator.js | 397 | 3 | Imported by automated tests |
| src/customs-declaration.js | 275 | 4 | Imported by automated tests |
| src/db-encryption.js | 96 | 3 | Imported by automated tests |
| src/db-maintenance.js | 72 | 2 | Imported by automated tests |
| src/db-pool.js | 54 | 1 | Imported by automated tests |
| src/debt-collection-defense.js | 258 | 4 | Imported by automated tests |
| src/destinations.js | 77 | 3 | Imported by automated tests |
| src/digital-platform-worker-navigator.js | 169 | 4 | Imported by automated tests |
| src/document-validator.js | 261 | 3 | Imported by automated tests |
| src/ei-benefits-navigator.js | 219 | 4 | Imported by automated tests |
| src/ei-disqualification-navigator.js | 238 | 4 | Imported by automated tests |
| src/employment-reference-audit.js | 263 | 3 | Imported by automated tests |
| src/employment-standards.js | 191 | 3 | Imported by automated tests |
| src/engine.js | 504 | 53 | Imported by automated tests |
| src/esa-wage-theft-navigator.js | 337 | 3 | Imported by automated tests |
| src/estate-planning-navigator.js | 232 | 4 | Imported by automated tests |
| src/eu-health-rights-navigator.js | 123 | 3 | Imported by automated tests |
| src/evaluation.js | 69 | 4 | Imported by automated tests |
| src/eviction-defense.js | 278 | 3 | Imported by automated tests |
| src/evidence-index.js | 57 | 3 | Imported by automated tests |
| src/evidence-policy.js | 41 | 2 | Imported by automated tests |
| src/evidence-recovery-encrypted.js | 42 | 3 | Imported by automated tests |
| src/evidence-revision.js | 22 | 1 | Imported by automated tests |
| src/evidence-worker.js | 67 | 2 | Imported by automated tests |
| src/excessive-demand-mitigation-navigator.js | 201 | 4 | Imported by automated tests |
| src/express-entry-optimizer.js | 512 | 4 | Imported by automated tests |
| src/express-entry-tie-breaking-navigator.js | 190 | 3 | Imported by automated tests |
| src/family-law-navigator.js | 274 | 4 | Imported by automated tests |
| src/family-reunification-navigator.js | 202 | 4 | Imported by automated tests |
| src/fcr-healthcare-bridge-navigator.js | 182 | 5 | Imported by automated tests |
| src/federal-bridging-open-work-permit-pr-acknowledgement-navigator.js | 182 | 4 | Imported by automated tests |
| src/federal-c10-significant-benefit-work-permit-navigator.js | 183 | 4 | Imported by automated tests |
| src/federal-c11-entrepreneur-self-employed-work-permit-navigator.js | 186 | 4 | Imported by automated tests |
| src/federal-c12-gats-professional-fta-navigator.js | 174 | 4 | Imported by automated tests |
| src/federal-c14-intra-company-transferee-navigator.js | 218 | 4 | Imported by automated tests |
| src/federal-c20-reciprocal-employment-work-permit-navigator.js | 166 | 4 | Imported by automated tests |
| src/federal-caregiver-direct-to-pr-pilot-navigator.js | 241 | 4 | Imported by automated tests |
| src/federal-caregiver-pr-pathway-experience-navigator.js | 186 | 4 | Imported by automated tests |
| src/federal-citizenship-residence-calculator-audit-navigator.js | 205 | 4 | Imported by automated tests |
| src/federal-citizenship-revocation-defense-navigator.js | 149 | 4 | Imported by automated tests |
| src/federal-francophone-community-pilot-navigator.js | 244 | 4 | Imported by automated tests |
| src/federal-francophone-mobility-c16-expansion-navigator.js | 179 | 5 | Imported by automated tests |
| src/federal-parent-grandparent-super-visa-medical-insurance-navigator.js | 178 | 4 | Imported by automated tests |
| src/federal-refugee-cessation-citizenship-audit-navigator.js | 170 | 4 | Imported by automated tests |
| src/federal-self-employed-persons-program-navigator.js | 223 | 4 | Imported by automated tests |
| src/federal-skilled-trades-navigator.js | 236 | 4 | Imported by automated tests |
| src/federal-start-up-visa-designated-organization-navigator.js | 268 | 6 | Imported by automated tests |
| src/federal-start-up-visa-peer-review-navigator.js | 188 | 4 | Imported by automated tests |
| src/federal-study-permit-off-campus-work-hours-navigator.js | 181 | 4 | Imported by automated tests |
| src/federal-visitor-record-extension-status-restoration-navigator.js | 179 | 3 | Imported by automated tests |
| src/federal-work-permit-dual-intent-assessment-navigator.js | 160 | 3 | Imported by automated tests |
| src/finite-input.js | 10 | 2 | Imported by automated tests |
| src/foreign-worker-closed-permit-transition-navigator.js | 206 | 3 | Imported by automated tests |
| src/foreign-worker-transition-navigator.js | 184 | 3 | Imported by automated tests |
| src/franchise-disclosure-navigator.js | 253 | 3 | Imported by automated tests |
| src/francophone-mobility-navigator.js | 211 | 3 | Imported by automated tests |
| src/gap-workflow.js | 87 | 3 | Imported by automated tests |
| src/gcms-refusal-analyzer.js | 140 | 3 | Imported by automated tests |
| src/geography.js | 564 | 3 | Imported by automated tests |
| src/global-expat-navigator.js | 231 | 2 | Imported by automated tests |
| src/global-immigration-question-bank-batch3-resolver.js | 1739 | 2 | Imported by automated tests |
| src/global-immigration-question-bank-resolver.js | 1730 | 2 | Imported by automated tests |
| src/global-records.js | 2292 | 3 | Imported by automated tests |
| src/global-settlement-resolver.js | 562 | 2 | Imported by automated tests |
| src/global-visa-matrix.js | 247 | 2 | Imported by automated tests |
| src/glossary-concepts.js | 529 | 2 | Imported by automated tests |
| src/gov-scraper-alerts.js | 71 | 1 | Imported by automated tests |
| src/healthcare-navigator.js | 281 | 3 | Imported by automated tests |
| src/healthcare-portability-navigator.js | 291 | 3 | Imported by automated tests |
| src/healthcare-triage.js | 97 | 2 | Imported by automated tests |
| src/high-cost-credit-navigator.js | 237 | 3 | Imported by automated tests |
| src/homebuyer-tax-incentives.js | 199 | 3 | Imported by automated tests |
| src/housing-tax-navigator.js | 328 | 2 | Imported by automated tests |
| src/housing.js | 16 | 1 | Imported by automated tests |
| src/human-rights-defense.js | 266 | 2 | Imported by automated tests |
| src/i18n-dictionary.js | 138 | 2 | Imported by automated tests |
| src/identity-harmonization.js | 231 | 3 | Imported by automated tests |
| src/ingestion.js | 222 | 3 | Imported by automated tests |
| src/insider-immigration-records.js | 1152 | 4 | Imported by automated tests |
| src/internationally-trained-nurse-navigator.js | 180 | 3 | Imported by automated tests |
| src/job-policy.js | 7 | 1 | Imported by automated tests |
| src/job-worker.js | 40 | 4 | Imported by automated tests |
| src/jobs.js | 193 | 17 | Imported by automated tests |
| src/kb-expiry-monitor.js | 117 | 2 | Imported by automated tests |
| src/kb-facts.js | 91 | 3 | Imported by automated tests |
| src/kb-policy-classifier.js | 132 | 2 | Imported by automated tests |
| src/kb-provenance-chain.js | 119 | 2 | Imported by automated tests |
| src/kb-quality.js | 70 | 2 | Imported by automated tests |
| src/knowledge.js | 627 | 44 | Imported by automated tests |
| src/kyc-records.js | 276 | 3 | Imported by automated tests |
| src/language-detector.js | 45 | 1 | Imported by automated tests |
| src/language-score-clb.js | 93 | 2 | Imported by automated tests |
| src/language.js | 58 | 18 | Imported by automated tests |
| src/lease-assignment-navigator.js | 292 | 3 | Imported by automated tests |
| src/lease-guard.js | 329 | 4 | Imported by automated tests |
| src/legal-notice-generator.js | 329 | 2 | Imported by automated tests |
| src/licence-context.js | 80 | 1 | Imported by automated tests |
| src/lifecycle.js | 23 | 2 | Imported by automated tests |
| src/lmia-readiness-navigator.js | 155 | 3 | Imported by automated tests |
| src/mailer.js | 66 | 2 | Imported by automated tests |
| src/manage-api.js | 61 | 1 | Imported by automated tests |
| src/manitoba-employment-leave-job-protection-navigator.js | 214 | 4 | Imported by automated tests |
| src/manitoba-employment-statutory-holiday-pay-navigator.js | 174 | 4 | Imported by automated tests |
| src/manitoba-pnp-skilled-worker-navigator.js | 202 | 4 | Imported by automated tests |
| src/manitoba-residential-tenancy-rent-increase-guideline-navigator.js | 185 | 4 | Imported by automated tests |
| src/market-gap-batch1-resolver.js | 22161 | 2 | Imported by automated tests |
| src/market-gap-batch2-resolver.js | 22164 | 2 | Imported by automated tests |
| src/market-gap-batch3-resolver.js | 22164 | 2 | Imported by automated tests |
| src/medical-admissibility.js | 206 | 4 | Imported by automated tests |
| src/migration-dry-run.js | 35 | 2 | Imported by automated tests |
| src/migrations.js | 82 | 3 | Imported by automated tests |
| src/monitor-state.js | 36 | 2 | Imported by automated tests |
| src/moving-tax-calculator.js | 159 | 4 | Imported by automated tests |
| src/moving-tax-navigator.js | 244 | 4 | Imported by automated tests |
| src/multi-country-gazette-crawler.js | 463 | 4 | Imported by automated tests |
| src/multi-sentence-deconstructor.js | 57 | 1 | Imported by automated tests |
| src/multilingual-layer.js | 224 | 2 | Imported by automated tests |
| src/myth-buster.js | 144 | 0 | Indirect/unverified; inspect explicitly |
| src/name-order-helper.js | 56 | 0 | Indirect/unverified; inspect explicitly |
| src/narrative-crisis-resolver.js | 245 | 0 | Indirect/unverified; inspect explicitly |
| src/narrative-deconstructor.js | 322 | 0 | Indirect/unverified; inspect explicitly |
| src/negation-scope-guard.js | 108 | 1 | Imported by automated tests |
| src/new-brunswick-provincial-nominee-skilled-worker-navigator.js | 273 | 5 | Imported by automated tests |
| src/newcomer-benefits-calculator.js | 213 | 3 | Imported by automated tests |
| src/newcomer-budget.js | 158 | 3 | Imported by automated tests |
| src/nli-hallucination-guard.js | 51 | 0 | Indirect/unverified; inspect explicitly |
| src/nova-scotia-experience-stream-navigator.js | 278 | 3 | Imported by automated tests |
| src/oas-gis-navigator.js | 254 | 3 | Imported by automated tests |
| src/observability.js | 91 | 3 | Imported by automated tests |
| src/official-forms.js | 267 | 2 | Imported by automated tests |
| src/offsite-backup-sync.js | 96 | 2 | Imported by automated tests |
| src/ontario-bc-tenancy-navigator.js | 240 | 1 | Imported by automated tests |
| src/ontario-employment-constructive-dismissal-layoff-navigator.js | 280 | 3 | Imported by automated tests |
| src/ontario-employment-pay-equity-transparency-navigator.js | 191 | 3 | Imported by automated tests |
| src/ontario-employment-public-holiday-pay-calculation-navigator.js | 180 | 3 | Imported by automated tests |
| src/ontario-employment-remote-telework-jurisdiction-navigator.js | 186 | 3 | Imported by automated tests |
| src/ontario-employment-reprisal-complaint-navigator.js | 161 | 3 | Imported by automated tests |
| src/ontario-employment-severance-payroll-calculation-navigator.js | 167 | 3 | Imported by automated tests |
| src/ontario-employment-standards-reprisal-navigator.js | 219 | 2 | Imported by automated tests |
| src/ontario-employment-temp-help-agency-licensing-navigator.js | 188 | 3 | Imported by automated tests |
| src/ontario-employment-temp-layoff-constructive-dismissal-navigator.js | 169 | 3 | Imported by automated tests |
| src/ontario-human-rights-housing-creed-navigator.js | 144 | 3 | Imported by automated tests |
| src/ontario-residential-tenancy-illegal-entry-t2-navigator.js | 165 | 2 | Imported by automated tests |
| src/ontario-residential-tenancy-rent-deposit-interest-navigator.js | 145 | 2 | Imported by automated tests |
| src/ontario-residential-tenancy-roommate-subtenant-eviction-navigator.js | 177 | 3 | Imported by automated tests |
| src/ontario-residential-tenancy-sublet-assignment-refusal-navigator.js | 187 | 2 | Imported by automated tests |
| src/ontario-residential-tenancy-urgent-repairs-t6-navigator.js | 188 | 3 | Imported by automated tests |
| src/parental-leave-navigator.js | 325 | 2 | Imported by automated tests |
| src/password-work.js | 22 | 0 | Indirect/unverified; inspect explicitly |
| src/pei-provincial-nominee-occupations-in-demand-navigator.js | 282 | 4 | Imported by automated tests |
| src/pet-importation.js | 218 | 3 | Imported by automated tests |
| src/pgwp-eligibility-navigator.js | 421 | 2 | Imported by automated tests |
| src/plain-english-simplifier.js | 92 | 1 | Imported by automated tests |
| src/plans.js | 124 | 1 | Imported by automated tests |
| src/pnp-navigator.js | 429 | 1 | Imported by automated tests |
| src/poe-rights-navigator.js | 115 | 2 | Imported by automated tests |
| src/pr-card-renewal-urgent-navigator.js | 201 | 4 | Imported by automated tests |
| src/pr-matrix-simulator.js | 287 | 2 | Imported by automated tests |
| src/pr-residency-navigator.js | 175 | 3 | Imported by automated tests |
| src/pr-travel-document-humanitarian-navigator.js | 186 | 3 | Imported by automated tests |
| src/proof-of-funds.js | 54 | 4 | Imported by automated tests |
| src/provider-response.js | 45 | 1 | Imported by automated tests |
| src/public-evidence.js | 21 | 3 | Imported by automated tests |
| src/publish-queue.js | 64 | 1 | Imported by automated tests |
| src/quebec-csq-skilled-worker-arrima-navigator.js | 280 | 3 | Imported by automated tests |
| src/quebec-peq-temporary-worker-navigator.js | 230 | 3 | Imported by automated tests |
| src/query-contract.js | 43 | 0 | Indirect/unverified; inspect explicitly |
| src/question-normalization.js | 11 | 1 | Imported by automated tests |
| src/queue-monitor.js | 82 | 3 | Imported by automated tests |
| src/queue-recovery.js | 63 | 5 | Imported by automated tests |
| src/queue-schema.js | 16 | 0 | Indirect/unverified; inspect explicitly |
| src/rate-limit.js | 16 | 1 | Imported by automated tests |
| src/real-estate-assignment-navigator.js | 287 | 2 | Imported by automated tests |
| src/realtime-alerts.js | 108 | 2 | Imported by automated tests |
| src/realtime-crawler.js | 256 | 3 | Imported by automated tests |
| src/realtime-cron.js | 150 | 2 | Imported by automated tests |
| src/realtime-delivery.js | 34 | 1 | Imported by automated tests |
| src/realtime-extractor.js | 198 | 4 | Imported by automated tests |
| src/realtime-kb-ingestor.js | 197 | 2 | Imported by automated tests |
| src/realtime-registry.js | 429 | 4 | Imported by automated tests |
| src/realtime-subscriptions.js | 125 | 4 | Imported by automated tests |
| src/recovery.js | 64 | 1 | Imported by automated tests |
| src/rent-increase-defense.js | 265 | 2 | Imported by automated tests |
| src/request-body.js | 36 | 1 | Imported by automated tests |
| src/review-queue.js | 49 | 3 | Imported by automated tests |
| src/rewrite-guard.js | 32 | 2 | Imported by automated tests |
| src/runtime-config.js | 21 | 2 | Imported by automated tests |
| src/runtime-metrics.js | 41 | 3 | Imported by automated tests |
| src/runtime-monitor.js | 116 | 2 | Imported by automated tests |
| src/rural-renewal-navigator.js | 226 | 3 | Imported by automated tests |
| src/saskatchewan-employment-layoff-notice-severance-navigator.js | 190 | 4 | Imported by automated tests |
| src/saskatchewan-immigrant-nominee-tech-talent-navigator.js | 230 | 3 | Imported by automated tests |
| src/saskatchewan-residential-tenancy-security-deposit-return-navigator.js | 150 | 3 | Imported by automated tests |
| src/saskatchewan-sinp-hard-to-fill-navigator.js | 207 | 3 | Imported by automated tests |
| src/scheduler.js | 17 | 2 | Imported by automated tests |
| src/schengen-calculator.js | 133 | 2 | Imported by automated tests |
| src/schooling-catchment.js | 116 | 2 | Imported by automated tests |
| src/search.js | 129 | 4 | Imported by automated tests |
| src/security-guard.js | 58 | 1 | Imported by automated tests |
| src/server.js | 6380 | 67 | Imported by automated tests |
| src/settlement-calendar.js | 218 | 2 | Imported by automated tests |
| src/settlement-glossary-500.js | 383 | 1 | Imported by automated tests |
| src/settlement-journey.js | 241 | 3 | Imported by automated tests |
| src/severance-bardal-calculator.js | 127 | 3 | Imported by automated tests |
| src/shared-rate-limit.js | 67 | 1 | Imported by automated tests |
| src/sin-healthcare-navigator.js | 142 | 3 | Imported by automated tests |
| src/slang-normalizer.js | 324 | 0 | Indirect/unverified; inspect explicitly |
| src/small-claims-navigator.js | 207 | 3 | Imported by automated tests |
| src/social-assistance-navigator.js | 208 | 3 | Imported by automated tests |
| src/social-qa-crisis-navigator.js | 235 | 2 | Imported by automated tests |
| src/source-verifier.js | 95 | 0 | Indirect/unverified; inspect explicitly |
| src/sowp-eligibility-navigator.js | 215 | 3 | Imported by automated tests |
| src/speculation-tax-rebate-navigator.js | 227 | 3 | Imported by automated tests |
| src/sri-integrity.js | 47 | 1 | Imported by automated tests |
| src/statutory-calculators.js | 547 | 2 | Imported by automated tests |
| src/statutory-glossary.js | 396 | 1 | Imported by automated tests |
| src/statutory-pay-calculator.js | 253 | 3 | Imported by automated tests |
| src/statutory-severance-notice-navigator.js | 197 | 3 | Imported by automated tests |
| src/storage-readiness.js | 18 | 1 | Imported by automated tests |
| src/store.js | 275 | 90 | Imported by automated tests |
| src/stream-logger.js | 18 | 1 | Imported by automated tests |
| src/student-compliance.js | 208 | 3 | Imported by automated tests |
| src/study-permit-cap-pal-navigator.js | 148 | 3 | Imported by automated tests |
| src/study-permit-pal-navigator.js | 199 | 2 | Imported by automated tests |
| src/study-to-pr-navigator.js | 153 | 3 | Imported by automated tests |
| src/super-visa-lico-navigator.js | 115 | 3 | Imported by automated tests |
| src/super-visa-sponsor.js | 265 | 4 | Imported by automated tests |
| src/synthetic-faq-cache.js | 68 | 1 | Imported by automated tests |
| src/tax-shield-optimizer.js | 116 | 3 | Imported by automated tests |
| src/tax-treaty-engine.js | 210 | 3 | Imported by automated tests |
| src/technical-immigration-records.js | 227 | 2 | Imported by automated tests |
| src/telecom-contract-defense.js | 220 | 3 | Imported by automated tests |
| src/telecom.js | 18 | 1 | Imported by automated tests |
| src/temporal-query-navigator.js | 61 | 2 | Imported by automated tests |
| src/temporary-resident-permit-inadmissibility-navigator.js | 206 | 3 | Imported by automated tests |
| src/tenancy-repairs-navigator.js | 337 | 3 | Imported by automated tests |
| src/text-input.js | 27 | 1 | Imported by automated tests |
| src/tfw-compliance-navigator.js | 245 | 3 | Imported by automated tests |
| src/timeline-calendar-sync.js | 205 | 3 | Imported by automated tests |
| src/tool-input.js | 170 | 0 | Indirect/unverified; inspect explicitly |
| src/ui-locale-dictionary.js | 243 | 0 | Indirect/unverified; inspect explicitly |
| src/uk-skilled-worker-ilr-navigator.js | 129 | 6 | Imported by automated tests |
| src/us-h1b-opt-navigator.js | 109 | 3 | Imported by automated tests |
| src/vehicle-importation.js | 185 | 3 | Imported by automated tests |
| src/verification.js | 54 | 6 | Imported by automated tests |
| src/verified-answer.js | 107 | 11 | Imported by automated tests |
| src/visitor-visa-financial-ties-navigator.js | 149 | 3 | Imported by automated tests |
| src/vulnerable-worker-defense.js | 214 | 4 | Imported by automated tests |
| src/worker-service.js | 33 | 1 | Imported by automated tests |
| src/workplace-rights-defense-navigator.js | 208 | 3 | Imported by automated tests |
| src/workplace-safety-navigator.js | 290 | 3 | Imported by automated tests |
| src/yukon-nominee-critical-impact-worker-navigator.js | 221 | 3 | Imported by automated tests |
| src/zero-result-clusterer.js | 101 | 2 | Imported by automated tests |

## Appendix B: GET tool endpoint results

| Route | Default HTTP | Hostile bundle HTTP |
|---|---:|---:|
| /v1/tools/esa-wage-theft | 200 | 200 |
| /v1/tools/workplace-rights | 200 | 200 |
| /v1/tools/ei-benefits | 200 | 200 |
| /v1/tools/fcr-bridging | 200 | 200 |
| /v1/tools/legal-notices | 200 | 200 |
| /v1/tools/poe-rights | 200 | 200 |
| /v1/tools/us-h1b-opt | 200 | 200 |
| /v1/tools/uk-skilled-worker | 200 | 200 |
| /v1/tools/super-visa-lico | 200 | 200 |
| /v1/tools/australia-reforms | 200 | 200 |
| /v1/tools/germany-chancenkarte | 200 | 200 |
| /v1/tools/global-visa-matrix | 200 | 200 |
| /v1/tools/moving-tax-calc | 200 | 200 |
| /v1/tools/severance-bardal | 200 | 200 |
| /v1/tools/calendar-sync | 200 | 200 |
| /v1/tools/pr-matrix | 200 | 200 |
| /v1/tools/family-reunification | 200 | 200 |
| /v1/tools/tax-shield | 200 | 200 |
| /v1/tools/compare-cities | 200 | 400 |
| /v1/tools/settlement-journey | 200 | 400 |
| /v1/tools/newcomer-budget | 200 | 400 |
| /v1/tools/healthcare-eligibility | 400 | 400 |
| /v1/tools/licence-exchange | 200 | 200 |
| /v1/tools/credit-simulator | 200 | 200 |
| /v1/tools/validate-documents | 200 | 400 |
| /v1/tools/cra-benefits | 200 | 200 |
| /v1/tools/credential-pathway | 200 | 200 |
| /v1/tools/lease-guard | 200 | 200 |
| /v1/tools/childcare-support | 200 | 200 |
| /v1/tools/customs-declaration | 200 | 200 |
| /v1/tools/homebuyer-eligibility | 200 | 200 |
| /v1/tools/banking-comparator | 200 | 200 |
| /v1/tools/citizenship-calculator | 200 | 200 |
| /v1/tools/eviction-defense | 200 | 200 |
| /v1/tools/pr-residency | 200 | 200 |
| /v1/tools/medical-admissibility | 200 | 200 |
| /v1/tools/worker-classification | 200 | 200 |
| /v1/tools/vehicle-import | 200 | 200 |
| /v1/tools/student-compliance | 200 | 200 |
| /v1/tools/vulnerable-worker | 200 | 200 |
| /v1/tools/super-visa-sponsor | 200 | 200 |
| /v1/tools/pet-import | 200 | 200 |
| /v1/tools/identity-harmonization | 200 | 200 |
| /v1/tools/currency-exchange | 200 | 200 |
| /v1/tools/parental-leave | 200 | 200 |
| /v1/tools/express-entry-crs | 200 | 200 |
| /v1/tools/business-structure | 200 | 200 |
| /v1/tools/pnp-pathway | 200 | 200 |
| /v1/tools/bowp-diagnostic | 200 | 200 |
| /v1/tools/lease-assignment | 200 | 200 |
| /v1/tools/debt-collection-defense | 200 | 200 |
| /v1/tools/moving-tax-deduction | 200 | 200 |
| /v1/tools/credential-licensure | 200 | 200 |
| /v1/tools/telecom-contract-defense | 200 | 200 |
| /v1/tools/border-flagpoling | 200 | 200 |
| /v1/tools/rent-increase-defense | 200 | 200 |
| /v1/tools/human-rights-defense | 200 | 200 |
| /v1/tools/homebuyer-tax-incentives | 200 | 200 |
| /v1/tools/auto-insurance | 200 | 200 |
| /v1/tools/estate-planning | 200 | 200 |
| /v1/tools/small-claims | 200 | 200 |
| /v1/tools/cra-voluntary-disclosure | 200 | 200 |
| /v1/tools/statutory-pay | 200 | 200 |
| /v1/tools/consumer-protection | 200 | 200 |
| /v1/tools/family-law | 200 | 200 |
| /v1/tools/social-assistance | 200 | 200 |
| /v1/tools/tenancy-repairs | 200 | 200 |
| /v1/tools/commercial-lease | 200 | 200 |
| /v1/tools/employment-reference | 200 | 400 |
| /v1/tools/high-cost-credit | 200 | 200 |
| /v1/tools/pgwp-eligibility | 200 | 200 |
| /v1/tools/cross-border-tax | 200 | 200 |
| /v1/tools/workplace-safety | 200 | 200 |
| /v1/tools/tfw-compliance | 200 | 200 |
| /v1/tools/healthcare-portability | 200 | 200 |
| /v1/tools/real-estate-assignment | 200 | 200 |
| /v1/tools/oas-gis | 200 | 200 |
| /v1/tools/criminal-rehab | 200 | 200 |
| /v1/tools/franchise-disclosure | 200 | 200 |
| /v1/tools/sowp-eligibility | 200 | 200 |
| /v1/tools/ei-disqualification | 200 | 200 |
| /v1/tools/rural-renewal | 200 | 200 |
| /v1/tools/speculation-tax-rebate | 200 | 200 |
| /v1/tools/child-welfare-guardianship | 200 | 200 |
| /v1/tools/excessive-demand-mitigation | 200 | 200 |
| /v1/tools/francophone-mobility | 200 | 200 |
| /v1/tools/digital-platform-worker | 200 | 200 |
| /v1/tools/atlantic-immigration | 200 | 200 |
| /v1/tools/childcare-subsidy | 200 | 200 |
| /v1/tools/bc-strata-bylaw | 200 | 200 |
| /v1/tools/pr-card-renewal | 200 | 200 |
| /v1/tools/foreign-worker-transition | 200 | 200 |
| /v1/tools/child-disability-benefit | 200 | 200 |
| /v1/tools/alberta-security-deposit | 200 | 200 |
| /v1/tools/internationally-trained-nurse | 200 | 200 |
| /v1/tools/study-permit-cap-pal | 200 | 200 |
| /v1/tools/visitor-visa-financial-ties | 200 | 200 |
| /v1/tools/lmia-readiness | 200 | 200 |
| /v1/tools/sin-healthcare | 200 | 200 |
| /v1/tools/alberta-opportunity-stream | 200 | 200 |
| /v1/tools/bc-speculation-tax-declaration | 200 | 200 |
| /v1/tools/prtd-humanitarian | 200 | 200 |
| /v1/tools/severance-reasonable-notice | 200 | 200 |
| /v1/tools/manitoba-pnp-skilled-worker | 200 | 200 |
| /v1/tools/study-to-pr | 200 | 200 |
| /v1/tools/gcms-analyzer | 200 | 200 |
| /v1/tools/sinp-hard-to-fill | 200 | 200 |
| /v1/tools/esa-reprisal-defense | 200 | 200 |
| /v1/tools/bc-svt-appeal | 200 | 200 |
| /v1/tools/express-entry-tie-break | 200 | 200 |
| /v1/tools/calgary-suite-amnesty | 200 | 200 |
| /v1/tools/esa-constructive-layoff | 200 | 200 |
| /v1/tools/nsnp-experience | 200 | 200 |
| /v1/tools/quebec-peq-worker | 200 | 200 |
| /v1/tools/alberta-commercial-distress | 200 | 200 |
| /v1/tools/trp-inadmissibility | 200 | 200 |
| /v1/tools/cra-newcomer-wealth | 200 | 200 |
| /v1/tools/ontario-bc-tenancy | 200 | 200 |
| /v1/tools/global-expat | 200 | 200 |
| /v1/tools/canada-status-admissibility | 200 | 200 |
| /v1/tools/federal-skilled-trades | 200 | 200 |
| /v1/tools/bc-strata-ev-charging | 200 | 200 |
| /v1/tools/on-pay-transparency | 200 | 200 |
| /v1/tools/yukon-critical-impact | 200 | 200 |
| /v1/tools/tfw-employer-transition | 200 | 200 |
| /v1/tools/pei-occupations-demand | 200 | 200 |
| /v1/tools/bc-esa-group-termination | 200 | 200 |
| /v1/tools/start-up-visa | 200 | 200 |
| /v1/tools/ontario-tenancy-assignment | 200 | 200 |
| /v1/tools/nbpnp-skilled-worker | 200 | 200 |
| /v1/tools/self-employed-persons | 200 | 200 |
| /v1/tools/alberta-overtime-banking | 200 | 200 |
| /v1/tools/ontario-roommate-rights | 200 | 200 |
| /v1/tools/sinp-tech-talent | 200 | 200 |
| /v1/tools/caregiver-direct-pr | 200 | 200 |
| /v1/tools/citizenship-revocation | 200 | 200 |
| /v1/tools/bc-roommate-rights | 200 | 200 |
| /v1/tools/alberta-rural-entrepreneur | 200 | 200 |
| /v1/tools/refugee-cessation | 200 | 200 |
| /v1/tools/on-remote-work-jurisdiction | 200 | 200 |
| /v1/tools/city-comparison | 200 | 400 |
| /v1/tools/form-autopopulate | 200 | 200 |
| /v1/tools/manitoba-leave | 200 | 200 |
| /v1/tools/alberta-tenancy-sublease | 200 | 200 |
| /v1/tools/francophone-community-pilot | 200 | 200 |
| /v1/tools/bc-child-youth-employment | 200 | 200 |
| /v1/tools/on-creed-accommodation | 200 | 200 |
| /v1/tools/citizenship-residence-audit | 200 | 200 |
| /v1/tools/quebec-csq-arrima | 200 | 200 |
| /v1/tools/alberta-rest-periods | 200 | 200 |
| /v1/tools/bc-strata-str | 200 | 200 |
| /v1/tools/on-tha-licensing | 200 | 200 |
| /v1/tools/federal-ict-work-permit | 200 | 200 |
| /v1/tools/saskatchewan-layoff-notice | 200 | 200 |
| /v1/tools/alberta-abandoned-goods | 200 | 200 |
| /v1/tools/bc-uniform-deductions | 200 | 200 |
| /v1/tools/visitor-extension-restoration | 200 | 200 |
| /v1/tools/bc-pnp-tech | 200 | 200 |
| /v1/tools/ontario-temp-layoff | 200 | 200 |
| /v1/tools/federal-c10-significant-benefit | 200 | 200 |
| /v1/tools/alberta-just-cause | 200 | 200 |
| /v1/tools/manitoba-rent-increase | 200 | 200 |
| /v1/tools/federal-c20-reciprocal-work | 200 | 200 |
| /v1/tools/bc-landlord-use-eviction | 200 | 200 |
| /v1/tools/ontario-severance-payroll | 200 | 200 |
| /v1/tools/alberta-landlord-entry | 200 | 200 |
| /v1/tools/federal-dual-intent | 200 | 200 |
| /v1/tools/federal-c11-entrepreneur-work-permit | 200 | 200 |
| /v1/tools/alberta-employment-maternity-parental-leave | 200 | 200 |
| /v1/tools/ontario-residential-tenancy-urgent-repairs-t6 | 200 | 200 |
| /v1/tools/british-columbia-employment-illness-injury-leave | 200 | 200 |
| /v1/tools/federal-francophone-mobility-c16 | 200 | 200 |
| /v1/tools/federal-bowp-pr-acknowledgement | 200 | 200 |
| /v1/tools/ontario-rent-deposit-interest | 200 | 200 |
| /v1/tools/alberta-general-holiday-pay | 200 | 200 |
| /v1/tools/bc-strata-depreciation-crf | 200 | 200 |
| /v1/tools/federal-fta-professional-work-permit | 200 | 200 |
| /v1/tools/ontario-employment-reprisal | 200 | 200 |
| /v1/tools/bc-security-deposit-double-penalty | 200 | 200 |
| /v1/tools/alberta-constructive-dismissal | 200 | 200 |
| /v1/tools/federal-suv-peer-review | 200 | 200 |
| /v1/tools/saskatchewan-security-deposit-return | 200 | 200 |
| /v1/tools/ontario-illegal-entry-t2 | 200 | 200 |
| /v1/tools/bc-overtime-banking | 200 | 200 |
| /v1/tools/alberta-periodic-tenancy-notice | 200 | 200 |
| /v1/tools/federal-super-visa-insurance-lico | 200 | 200 |
| /v1/tools/manitoba-general-holiday-pay | 200 | 200 |
| /v1/tools/federal-caregiver-pr-pathway | 200 | 200 |
| /v1/tools/ontario-public-holiday-pay | 200 | 200 |
| /v1/tools/bc-rtb-dispute-track | 200 | 200 |
| /v1/tools/alberta-youth-employment-rules | 200 | 200 |
| /v1/tools/federal-student-off-campus-work | 200 | 200 |
| /v1/tools/language-score-clb | 200 | 200 |
| /v1/tools/proof-of-funds | 200 | 200 |
