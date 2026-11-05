# KB और Tools: current pending audit — 4 नवंबर 2026

**Current status authority:** [KB_TOOLS_TASK_REGISTER.json](KB_TOOLS_TASK_REGISTER.json) में original 40 IDs का consolidated register है: **7 implemented, 9 partial, 24 pending — 33 IDs अभी खुले हैं**। Implemented targeted fix को दर्शाता है, project-wide correctness को नहीं। हर entry में original finding, acceptance, progress, remaining work, evidence और owner field हैं; `owner: null` का अर्थ unassigned है। नीचे पुराने snapshots/history को current pending count न मानें। Historical 51+ या user-requested 25+ को अलग verified inventory मानकर duplicate IDs नहीं बनाए गए।

## Continuation — 6 नवंबर 2026

Latest validation after visitor wording/register update: **2,413/2,413 tests passed, 0 failed/skipped**, ESLint passed, headless Chrome passed (`artifacts/VISITOR_WORDING_2026-11-06_full.txt`, `artifacts/VISITOR_WORDING_2026-11-06_lint.txt`, `artifacts/VISITOR_WORDING_2026-11-06_browser.json`)। Register creation checked 40 unique IDs and existence of all linked evidence files; no owners or historical-task equivalences were invented.

T15 follow-up: visitor complete-input result से uncalibrated High/Moderate approval probability हटाई गई (`approvalProbability: null`)। Internal score/tier compatibility बनी है; API में `UNVALIDATED_HEURISTIC` और clear assessment notice है। UI complete results को neutral planning score दिखाती है, green/compliant risk badge नहीं। Financial estimate को official minimum नहीं बताया जाता। This is output safety, not validation of the underlying weights or legal statements. T23 current-register work implemented; owner assignment is still open where required (for example K07).

Latest validation after visitor missing-input fix: **2,412/2,412 tests passed, 0 failed/skipped** (`artifacts/VISITOR_MISSING_2026-11-06_full.txt`); ESLint और headless Chrome checks passed (`artifacts/VISITOR_MISSING_2026-11-06_lint.txt`, `artifacts/VISITOR_MISSING_2026-11-06_browser.json`)।

Visitor missing-input safety (T11/T13/T15 partial): evaluator और GET route से 11 decision-driving trip/financial/boolean defaults हटाए। किसी भी required fact के absent होने पर `NOT_DETERMINED`, null score/probability/estimated cost/surplus, empty positive/risk factors और explicit `missingInputs` मिलते हैं; supplied malformed inputs फिर भी reject होते हैं। UI के numeric controls blank और सभी सात yes/no controls unselected हैं; पहले absent पाँच questions जोड़े गए ताकि complete assessment उपलब्ध रहे। Missing result में `null/100` नहीं दिखता; offline cache version v50 है। Existing complete-input regression fixtures में आवश्यक facts explicitly दिए गए। **49/49 focused tests passed**, headless Chrome में सभी 11 blank controls, incomplete result और explicit zero/false से complete result verified (`artifacts/VISITOR_MISSING_2026-11-06_focus.txt`, `artifacts/VISITOR_MISSING_2026-11-06_browser.json`)। Complete-input heuristic score, probability wording, policy/citation accuracy और non-decision metadata defaults की समीक्षा बाकी है; यह factual/legal approval नहीं है।

Latest validation after visitor evaluator fix: **2,411/2,411 tests passed, 0 failed/skipped** (`artifacts/VISITOR_VALIDATION_2026-11-06_full.txt`); ESLint passed (`artifacts/VISITOR_VALIDATION_2026-11-06_lint.txt`)।

Visitor direct-evaluator validation (T11/T12/T13 partial): `evaluateVisitorVisaTies` अब malformed numeric types, non-finite/hex/blank values और existing numeric limits के बाहर values पर error देता है, silently clamping नहीं। Stay days 1–365 whole number, funds 0–100,000,000, tenure 0–60 और monthly income 0–1,000,000 existing limits हैं; ये legal eligibility thresholds नहीं हैं। सात boolean fields native या explicit string true/false स्वीकार करते हैं; direct string-false truthiness bug बंद है। Impossible assessment dates reject होते हैं। Focused tests **17/17 passed** (`artifacts/VISITOR_VALIDATION_2026-11-06_focus.txt`): direct boundary/type matrix, leap dates, booleans और GET/alias POST/canonical POST error parity। Existing omitted-input defaults, heuristic scoring/probability wording, categorical fields और official policy verification अभी बाकी हैं।

Latest validation after canonical type parity fix: **2,408/2,408 tests passed, 0 failed/skipped** (`artifacts/CANONICAL_INPUT_2026-11-06_full.txt`); ESLint passed (`artifacts/CANONICAL_INPUT_2026-11-06_lint.txt`)।

Canonical POST type parity follow-up (T08/T13): registered typed canonical fields अब form aliases की तरह normalize होते हैं। पहले `ownsRealEstateProperty: "false"` जैसे valid-looking POST inputs evaluator के boolean guards में truthy थे; visitor tool में property/refusal/employment/travel factors गलत बन सकते थे। अब explicit string booleans native booleans और numeric strings numbers में बदलते हैं; zero/false canonical values alias values पर precedence रखते हैं। Empty canonical controls missing input माने जाते हैं। Existing strict study-cap validation अलग बरकरार है। **13/13 focused tests passed** (`artifacts/CANONICAL_INPUT_2026-11-06_focus.txt`), जिनमें visitor/study-to-PR/port-of-entry के native JSON, string JSON और GET results की parity तथा visitor factors के independent assertions हैं। Scope registered HTTP typed fields तक है; direct evaluator validation और सभी tool fields की complete parity अभी pending है।

Final validation: full suite **2,406/2,406 passed, 0 failed/skipped** (`artifacts/ALIAS_VALIDATION_2026-11-06_full.txt`); ESLint passed (`artifacts/ALIAS_VALIDATION_2026-11-06_lint.txt`)।

T08 में typed form aliases का shared boundary fix: registered numeric/boolean aliases तथा उनके canonical POST fields के malformed values अब `ToolInputError` / HTTP 400 देते हैं। GET पर route coercion से पहले वही validation लागू है, repeated query parameters का हर value जाँचा जाता है। Arrays/objects/null/boolean-as-number, whitespace-only numbers, hexadecimal values, non-finite numbers और ambiguous booleans reject होते हैं। Explicit zero/false, decimal numeric strings और existing currency normalization स्वीकार हैं; empty controls का missing-input contract बना है। Study-cap tool का existing stricter evaluator validation path बरकरार है।

Focused tests **11/11 passed** (`artifacts/ALIAS_VALIDATION_2026-11-06_focus.txt`): malformed GET/POST cases across seven tool families, canonical/alias coercion traps, duplicate query values और existing valid GET/POST parity। T08 **partial** रहता है: aliases में सूचीबद्ध न होने वाले fields, CSV/enums, domain bounds, direct evaluators और missing-input policy defaults का complete audit बाकी है।

## Continuation — 5 नवंबर 2026

Latest validation: retrieval fix के बाद full suite **2,404/2,404 passed, 0 failed/skipped** (`artifacts/RETRIEVAL_2026-11-05_full.txt`), ESLint passed (`artifacts/RETRIEVAL_2026-11-05_lint.txt`)। नीचे family-review run की चार failures historical हैं; तीन contract assertions और अब retrieval regression resolve हुए हैं। यह technical regression result है; pending source reviews और publication readiness को complete घोषित नहीं करता।

Maintained-status retrieval regression का fix: travel/re-entry के साथ maintained/implied status पूछने पर ही official wording (leave/leaves/leaving, re-entry, return, resume) query expansion में जुड़ती है। Generic PGWP eligibility और employment-leave queries में यह expansion नहीं होता। Parser में `implied status` employment intent में शामिल किया गया। Original failing insider-query suite तथा lexical/indexed parity सहित **6/6 targeted tests passed** (`artifacts/RETRIEVAL_2026-11-05_focus.txt`)। नीचे पुराने full run में दर्ज retrieval failure इस fix से supersede हुआ है। Publication/geography/freshness gates नहीं बदले गए।

`bc-childcare-fees` और `ccb-eligibility` की summaries official source review के बाद corrected pending drafts के रूप में database में दर्ज हैं। Fresh archived excerpts और independent approval बाकी हैं; old snapshot/reviewMethod/reviewedAt को नए drafts का प्रमाण नहीं बनाया गया। Source review URLs: [BC announcement](https://news.gov.bc.ca/releases/2025ECC0051-001248), [CRA eligibility page](https://www.canada.ca/en/revenue-agency/services/child-family-benefits/canada-child-benefit/who-apply.html).

Apply से पहले backup: `data/backups/before-family-source-review-1793777593508.sqlite`। प्रत्येक correction का audit और FTS update transaction में हुआ। दोनों summaries seed definitions से match हैं। Escaped-Unicode seed sync mismatch ठीक किया; already-applied database पर retry भी seed sync करता है और unexpected seed text पर रुकता है। Scripts: `scripts/kb-family-source-review-2026-11-04.js`; results: `artifacts/FAMILY_REVIEW_2026-11-04_applied.json`, `artifacts/FAMILY_REVIEW_2026-11-05_seed_sync.json`। Initial apply artifact में seed warnings हैं; बाद वाले sync artifact ने उन्हें resolve किया।

Validation: final targeted tests **22/22 passed** (`artifacts/FAMILY_REVIEW_2026-11-05_final_focus.txt`)। Full run **2,398/2,402 passed**, चार failures: pending-status coverage assertion, metrics auth assertion, time-dependent policy-lint exit assertion और maintained-status retrieval regression। पहले तीन assertions को वास्तविक contracts से मिलाकर targeted retest पास है; **retrieval regression अभी खुला है** (`test/insider-records.test.js`: maintained-status travel query अपेक्षित record की जगह flagpoling/CEC records चुनती है)। Full suite को green घोषित नहीं किया गया। Missing audit-checkpoint table पर read-only full-chain verification का compatibility fix भी शामिल है।

Current health snapshot: 1,221 records, technical health passed, publication readiness false, 404 editorial warnings और 811 withheld-approved records (`artifacts/FAMILY_REVIEW_2026-11-05_health.json`)। Workspace में concurrent updates के कारण पुराने counts का अंतर इन दो corrections की उपलब्धि नहीं है। Isolated seeded DB की policy lint में 61 expired records मिले; expiry validation को कमजोर या dates को आगे नहीं किया गया।

## Remediation update — 4 नवंबर 2026

नीचे का audit मूल snapshot है। इस update के बाद इसे सभी items अभी भी pending होने का दावा न समझें। मौजूदा register में 40 IDs हैं; पुराने “51+” का reconciled register उपलब्ध नहीं है।

| स्थिति | IDs | बदलाव / सीमा |
|---|---|---|
| Implemented | T01, T02 | Study evaluator और GET/POST में missing tuition/funds पर `NOT_DETERMINED`, null sufficiency/buffer; malformed amounts पर 400; UI sample amounts हटाए और missing-result rendering जोड़ी। Valid inputs के पुराने policy amounts अभी नहीं बदले। |
| Implemented | T04 | Calendar round-trip validation; impossible dates और invalid date pins reject/fallback; leap-year regression tests। |
| Implemented | K03 | Figure verification अब केवल saved excerpt पर निर्भर; दूर मौजूद page figure से approval नहीं; saved excerpt replay regression। Semantic entailment K01 अभी खुला है। |
| Implemented | K06 | Decoded response stream पर 2 MiB byte cap; declared/streamed oversized bodies cancel; timeout और existing fetch behavior बनाए रखा। Redirect/security का व्यापक audit अभी अलग verification gap है। |
| Implemented | K05 | Read-time source-verified chain में snapshot SHA-256/quote, source URL/policy, candidate identity/status/body, publication body और latest decision का original audit reviewer/note/time से match। Valid restoration event स्वीकार; corrupted chains withheld। Candidate/restoration changes cache invalidate करते हैं। Low-risk source-verified labels पर भी chain जरूरी। Authenticated individual approvals के event binding की प्रगति K04 में दर्ज है; legacy migration अभी बाकी है। |
| Partial | K02 | Currency/ISO currency codes, percentages, common duration units, business/calendar days, per-hour/day/week/month/year rates, numeric ranges और common min/max bounds match में preserve। अलग dimensions/bounds reject; decimal/thousands-format equivalents स्वीकार। Unsupported units, complex ranges, claim context/negation/eligibility की semantic validation अभी बाकी। |
| Partial | T03 | Province/territory, study-level और exposed field categories validate; fractional/out-of-range family count reject; CIP `NN.NNNN` format validate। Official CIP membership/eligibility और supported-scope verification बाकी; syntactically valid CIP को officially eligible न मानें। |
| Partial | T08 | Study tool में direct/GET/POST के booleans strict true/false; string `false` अब exemption नहीं देता। Invalid alias values preserve करके reject; blank enum/date/boolean अब defaults में नहीं बदलते। बाकी tools का alias audit अभी बाकी। |
| Partial | K04 | Default reviewer allowlist से Fixture Editor/Test Editor/test-reviewer/test-admin हटाए; arbitrary `reviewer:`/`admin:` names और NODE_ENV=test prefix bypass हटाए। Automated identities केवल `source_verified` method में स्वीकार, editorial label में reject। Individual HTTP approvals/reviews/restores अब immutable actor-role event से audit-bound हैं और public gate में verify होते हैं। Legacy named reviewers, shared-token decisions और explicit trusted-caller allowlist की historical migration अभी बाकी। |
| Partial | K07 | Gate के उसी decision path से per-record withholding reasons, next actions और suggested owner role queue/API में जोड़े। Read-only CLI ने 805 records की सूची बनाई। वास्तविक owners unassigned हैं; source/editorial review और record remediation बाकी हैं। |

कुल 6 IDs के लक्षित implementation पूरे, 5 partial और अन्य 29 इन batches में unchanged हैं। इसे project completion percentage या सभी “51+” fixes पूरा होने का प्रमाण न मानें। Tests policy/legal correctness का प्रमाण नहीं हैं। Source approvals, KB record publication और factual values इन fixes में नहीं बदले गए।

Publication backlog: `node scripts/kb-publication-backlog.js --json` (optional `--db path`) pure JSON देता है। Snapshot `artifacts/PUBLICATION_BACKLOG_2026-11-04.json` में सभी **805** IDs, reasons, next actions, source, pending candidates और blockers हैं। Reasons overlap: reviewer_untrusted **610**, approval_audit_missing **102**, audit_record_mismatch **57**, review_method_missing_or_unsupported **323**। Owner अभी सभी में `null`; suggested role assignment का प्रमाण नहीं है। `ready` का अर्थ नया source review/import शुरू करने लायक है, publication approved नहीं। Pending candidate होने पर भी suspension/expiry जैसे blockers अब queue state में प्राथमिक हैं। CLI ने source DB/schema नहीं बदला, जिसका regression test logical/schema digest मिलाकर करता है।

पढ़ने योग्य पूरी सूची: `docs/KB_PUBLICATION_BACKLOG_2026-11-04_HI.md`। इस batch का full suite **2,395/2,395**, targeted report/queue regressions **8/8**, lint और diff checks पास। Evidence: `artifacts/PUBLICATION_BACKLOG_2026-11-04_full.txt`, `artifacts/PUBLICATION_BACKLOG_2026-11-04_regression.txt`, `artifacts/PUBLICATION_BACKLOG_2026-11-04_lint.txt`.

K04 authenticated-event implementation: migration **7** में `audit_authorizations` जोड़ा। Individual HTTP approval/review/restore server-authenticated actor ID/role को उसी transaction में audit ID और पूरे audit payload digest से जोड़ते हैं। JSON `authenticatedActor`/`actor` fields यह event नहीं बना सकते। Event immutable है; binding corrupt हो तो legacy name fallback भी बंद है। Authenticated reviewer के valid source-verified publication और historical restoration public gate में पास होते हैं। Authorization insert failure पर record/audit/publication rollback होते हैं। Tokens/credentials इस table में नहीं लिखे जाते। New authorization rows cache revision और backup digest/verification में शामिल हैं।

अभी बाकी: legacy named approvals, shared-token approval attribution और historical records की स्वतंत्र migration/review। पुराने नामों को automatic authenticated actor mapping नहीं दिया गया; existing compatibility allowlist अभी बनी है। इसलिए K04 पूरा नहीं माना गया। Migration existing database की disposable copy पर सफल हुई; app का `openStore` upgrade schema लागू करेगा, existing records को auto-approve नहीं करेगा।

Authenticated-event validation: full suite **2,391/2,391**; बाद में जोड़े गए backup/restore regression सहित recovery/auth/migration focused suite **27/27**; final lint और diff checks पास। Source database पर migration dry-run integrity passed। Artifacts: `artifacts/AUTH_APPROVAL_2026-11-04_full.txt`, `artifacts/AUTH_APPROVAL_2026-11-04_recovery.txt`, `artifacts/AUTH_APPROVAL_2026-11-04_lint.txt`, `artifacts/AUTH_APPROVAL_2026-11-04_migration.json`.

Reviewer-gate validation: **32/32 focused**, **2,386/2,386 full suite**, lint और diff checks पास। Production/test environment दोनों में untrusted name patterns reject; automated identity के editorial label को matching audit होने पर भी reject किया गया। Automated source-verified archive publication regression पास है। `artifacts/REVIEWER_GATE_2026-11-04_{focus,full,lint}.txt` में results हैं। Read-only health (`artifacts/REVIEWER_GATE_2026-11-04_health.json`): technical checks passed, publication readiness false, withheld-approved 805, editorial warning 395।

Continuation validation: full suite **2,383/2,383**; उसके बाद low-risk source-verified gate extension सहित final focused suite **26/26**। Browser Study-finance checks और lint पास। Corruption fixtures snapshot edits, recomputed hash with missing quote, candidate/body/status mismatch, altered decision reviewer/note, later rejection और malformed restoration जाँचते हैं; valid restoration भी पास। Artifacts: `artifacts/KB_TOOLS_CONT_2026-11-04_full.txt`, `artifacts/KB_TOOLS_CONT_2026-11-04_focus.txt`, `artifacts/KB_TOOLS_CONT_2026-11-04_lint.txt`.

Read-only health snapshot: **1,221 records**, technical health passed; publication readiness **false**, editorial warning **395**, withheld-approved **805** (`artifacts/KB_TOOLS_CONT_2026-11-04_health.json`)। Workspace में concurrent updates हैं (package अब 0.19.56); पुराने snapshot से count differences को इन fixes की उपलब्धि नहीं माना गया।

Validation: focused suite **46/46**, full suite **2,370/2,370**, lint pass, browser checks pass। Full suite के बाद final raw-alias preservation change पर संबंधित aliases/assumptions/regression tests **10/10** पास; final lint और diff whitespace check भी पास। पहले full run में दो archive fixtures पुराने non-streaming fetch mocks के कारण failed थे; fixtures को real `Response` में बदलने के बाद full run पास हुआ।

Artifacts: `artifacts/KB_TOOLS_FIX_2026-11-04_focus.txt`, `artifacts/KB_TOOLS_FIX_2026-11-04_full.txt`, `artifacts/KB_TOOLS_FIX_2026-11-04_final_focus.txt`, `artifacts/KB_TOOLS_FIX_2026-11-04_lint.txt`, `artifacts/KB_TOOLS_FIX_2026-11-04_browser.json`.

### Figure-dimension checker continuation

`source-figures.js` में conservative mechanical matching: 30 days/30 months, CAD/USD, hourly/yearly rates, 30–60/30–90 ranges, percentage points/percent और at-least/at-most bounds अलग हैं। Equivalent formatting normalize होता है। यह claim meaning या legal eligibility verify नहीं करता; K01 और K02 का semantic हिस्सा खुला है। New automated source checks इस matcher का उपयोग करते हैं; historical public-evidence gate में इस नए matcher का retroactive replay इस batch में नहीं जोड़ा गया।

Validation: **2,398/2,398 full suite**, **13/13 focused**, lint/diff checks passed (`artifacts/FIGURE_UNITS_2026-11-04_full.txt`, `artifacts/FIGURE_UNITS_2026-11-04_focus.txt`, `artifacts/FIGURE_UNITS_2026-11-04_lint.txt`)।

Read-only historical snapshot replay: **72** stored-approved source_verified records checked; **48** passed, **24** require review (`artifacts/FIGURE_UNITS_2026-11-04_replay.json`)। Failure IDs और unmatched figures artifact में हैं। नया checker archived text से matching evidence नहीं पा सका; इसका अर्थ सभी 24 facts गलत हैं, ऐसा नहीं है। Source refresh, excerpt repair या factual correction review बाकी है। कोई live URL fetch, database status change या automatic re-approval नहीं किया गया।

### Historical replay gate continuation

Validation: **2,399/2,399 full suite**, **14/14 targeted chain/replay tests**, lint और diff checks पास। Artifacts: `artifacts/ARCHIVE_REPLAY_2026-11-04_full.txt`, `artifacts/ARCHIVE_REPLAY_2026-11-04_regression.txt`, `artifacts/ARCHIVE_REPLAY_2026-11-04_lint.txt`। Existing positive fixtures को title-only quote से meaningful synthetic quote में बदला गया; new negative fixtures intact chains के बावजूद unsupported figures, mismatched units और short quotes reject करते हैं।

अब public-evidence gate पुराने `source_verified` publications पर भी saved snapshot replay करता है। Valid chain होने पर भी unsupported figure/unit या बहुत छोटा quote replay fail करे तो public copy pending होती है; stored status/audit history नहीं बदली जाती। नया reason `archived_evidence_replay_failed` और repair action publication queue में दिखता है। यह पिछले section की “retroactive replay नहीं जोड़ा गया” सीमा को supersede करता है।

Fresh read-only backlog: **829 withheld** (पहले 805); इनमें **24 archived replay failures** हैं (`artifacts/ARCHIVE_REPLAY_2026-11-04_backlog.json`)। उन 24 का triage: **78 claim figures/ranges** saved excerpt में नहीं मिले, **8 claim figures** में संख्या मिली लेकिन parsed dimension/context अलग था। ये claim counts हैं और factual verdict नहीं। Source/translation/condition review बाकी है; कोई automatic correction या re-approval नहीं किया गया। पूरी review सूची `docs/KB_ARCHIVE_REVIEW_2026-11-04_HI.md`, claim-level details `artifacts/ARCHIVE_REPLAY_2026-11-04_triage.json` में हैं।

## Original audit snapshot

Workspace package: **0.19.55**. यह read-only code/database audit है। इस चरण में application code, source approvals या KB content नहीं बदला गया। Reports और diagnostic artifacts बनाए गए। सभी official pages का नया factual/legal verification, हर tool का interactive test, और production audit इस जाँच में नहीं हुआ। इसलिए नीचे verified defects, measured backlog और verification gaps अलग पहचाने गए हैं।

## वर्तमान माप

| माप | वर्तमान परिणाम | अर्थ |
|---|---:|---|
| KB records | 1,221 | count, completeness का प्रमाण नहीं |
| Stored statuses | 1,186 approved; 20 research_seed; 15 rejected | database labels |
| Public-evidence gate | 378 approved; **808 pending/withheld**; 20 seeds; 15 rejected | retrieval की अतिरिक्त freshness/geography gates से पहले का परिणाम |
| Technical health | passed; blocking issues 0 | schema/content-shape checks पास |
| Publication readiness | **false** | technical pass से publication readiness नहीं मिलती |
| Health warning: not editorially reviewed | **394** | इस metric की परिभाषा withheld count से अलग है |
| Review tracker | 132 checked; **262 remaining**; 12 needs-human | checked में 82 verified, 38 corrected, 12 needs-human; editorial sign-off नहीं मानें |
| Sources | 900 manual_permitted; **261 unreviewed** | access permission की समीक्षा बाकी |
| Archived chain | 67 snapshots; 71 candidates; 71 publication rows | publication rows unique public records के बराबर नहीं |
| Coverage report | **69 distinct publication-chain records** | 378 gate-approved records से अलग provenance metric |
| Thin coverage | **178 jurisdictions में अधिकतम 2 records** | broad country listing, deep coverage नहीं |
| Navigator file classification | 171 total; 63 Canadian province-domain; 18 non-Canada | filename heuristic, unique working tools का count नहीं |
| KB language / glossary | records en=1,221; glossary 500; fact registry 11 | multilingual UI, multilingual reviewed evidence के बराबर नहीं |
| Latest completed full test artifact | **2,364/2,364 passed** | `PUBLICATION_2026-11-04_full.txt`; tests factual correctness certify नहीं करते |

ये overlapping counts हैं; इन्हें जोड़कर total pending tasks न निकालें। खासकर 808 withheld, 394 editorial warning और 262 tracker-remaining अलग populations/definitions हैं।

## पहले ठीक करने योग्य reproduced/code-confirmed issues

| ID | Priority | समस्या और evidence | अगला काम / completion criterion |
|---|---|---|---|
| K01 | P0 | `source-verifier.js` में summary के आंकड़े पूरे page में मिलना पर्याप्त है; sentence meaning/condition/negation match नहीं होता। Quote match summary entailment सिद्ध नहीं करता। | Claim-to-evidence mapping और independent high-risk review; unrelated number/negation/exception fixtures reject हों। |
| K02 | P0 | `missingFigures('Fee is $30','The waiting period is 30 days.')` returns `[]`: unit/context mismatch पकड़ा नहीं गया। | Currency, units, percentages, ranges और source sentence को साथ match करें। |
| K03 | P1 | वही checker figures को whole page में ढूँढता है; archived excerpt केवल quote के आसपास ~2,400 chars है। Summary का अन्य evidence archive से बाहर हो सकता है। | हर approved claim का supporting excerpt archive करें; replay verification केवल archived evidence से सफल हो। |
| K04 | P1 | `public-evidence.js` की production reviewer allowlist में Fixture Editor/Test Editor/test-admin और automated identities हैं। नाम allowlist और role-shaped strings identity का पर्याप्त प्रमाण नहीं। | Test identities को test fixtures तक सीमित करें; authenticated immutable actor provenance का migration व compatibility plan बनाएँ। |
| K05 | P1 | `source_verified` publication lookup record/snapshot IDs पर join करता है; read-time gate full snapshot hash, candidate/publication body और decision identity consistency नहीं जाँचता। Ingest पर कुछ guards मौजूद हैं। | Corrupt/restored database scenarios पर end-to-end chain verifier और fail-closed publication test। |
| K06 | P1 | `fetchPageText()` response को `res.text()` से पूरा पढ़ता है, verifier में explicit response-byte cap नहीं दिखता। | Streaming size limit, oversized-response cancellation और redirect/security contract जाँचें। |
| T01 | P0 | `study-permit-cap-pal-navigator.js`: `{}` पर invented tuition 22,000/funds 45,000 और `COMPLIANT`। | Missing facts पर calculation रोकें या explicitly illustrative result दें; वास्तविक compliance verdict न दें। |
| T02 | P0 | इसी tool में tuition/funds=`'bad'` पर भी वही `COMPLIANT` result। | Invalid inputs 400/ValidationError; fabricated fallback financial success बंद। |
| T03 | P1 | `{province:'INVALID',studyLevel:'unknown'}` भी calculation करता है। | Province/study-level/CIP/field enums और unsupported coverage validation। |
| T04 | P1 | `text-input.js::safeIsoDate('2026-02-30')` वही impossible date लौटाता है; `todayIso` pin भी Date.parse-only check करता है। | Calendar round-trip validation; सभी importing tools पर regression matrix। |
| T05 | P1 | दो study engines असंगत: `study-permit-cap-pal-navigator.js` additional dependent 4,155/travel 1,500; `study-permit-pal-navigator.js` additional dependent 3,821/travel 2,000। | Routes/usage trace करें; policy differences explain या canonical versioned rule source बनाएँ। |
| T06 | P1 | दोनों study modules में 20,635 तथा 2024/2025 policy references hardcoded हैं। Assessment date today होने से rule current नहीं बन जाता। | Effective-date/version/source evidence जोड़ें; current official verification के बाद date-aware tables। इस audit ने कोई replacement legal amount निर्धारित नहीं किया। |
| T07 | P1 | `public/tool-modal.js` में static wage medians, “Immediate OHIP”, £38,700/£29,000 labels अभी हैं। | Domain verification के साथ UI labels और backend version match; eligibility/coverage assumptions हटें। |
| T08 | P1 | `tool-input.js` alias conversions invalid bool को false/true और invalid numeric को undefined बना सकते हैं; कई downstream engines फिर defaults लेते हैं। | Missing/invalid/false/zero को अलग रखें; GET/POST/direct negative matrices। |
| T09 | P1 | `boundedText()` malformed/non-string categorical input को fallback में बदलता है। Free-text sanitation और enum validation एक चीज नहीं। | Decision-driving fields strict enum/type validators से गुजरें; helper का import-by-import review। |

## KB content/publication backlog

| ID | Priority | Pending काम | Evidence / acceptance |
|---|---|---|---|
| K07 | P1 | 808 stored-approved लेकिन withheld records का per-record कारण और owner | Public gate count verified; हर record को approved audit/chain/risk reason के साथ queue करें; blind bulk approval न हो। |
| K08 | P1 | 394 editorial-warning records की independent review | `kb-health` metric; factual verification, reviewer note और correct publication method चाहिए। |
| K09 | P1 | 262 scheduled-review records और 12 needs-human cases | Tracker measured; source review/semantic review का outcome अलग दर्ज करें। |
| K10 | P1 | 261 sources की access/authority review | Unreviewed sources count; documented permission और source authority, केवल URL official दिखना पर्याप्त नहीं। |
| K11 | P1 | 69 chain-backed records बनाम 378 gate-approved records की provenance reconciliation | Legacy editorial audit path अलग है; missing chain को automatically fraudulent न कहें। Record-level classification/migration चाहिए। |
| K12 | P1 | Country/topic coverage depth | 178 thin jurisdictions; priority destinations के services, eligibility, exceptions, costs, contacts और city/province scope matrix बनाएँ। |
| K13 | P1 | Official-page drift और inaccessible URLs की refreshed failure inventory | पिछली VERIFY_BACKLOG report dated snapshot है; current reason counts नए controlled run से निकालें। इस audit में live fetch नहीं हुआ। |
| K14 | P1 | Independent held-out factual/entailment evaluation | Existing passing developer tests gold-standard labels नहीं। Unseen questions, citations, abstention और jurisdiction के reviewer-approved cases चाहिए। |
| K15 | P2 | Glossary translations का semantic/domain review | Completeness/filler checks पास; 500×6 definitions की accuracy प्रमाणित नहीं। Native/domain review sample और corrections। |
| K16 | P2 | Rule/fact registry coverage | 11 registry facts बनाम बहुत से engines में scattered constants; facts-to-consumers inventory और version/effective-date linkage। |
| K17 | P2 | Research-seed lifecycle | 20 seeds remain; user presentation और answer eligibility सभी paths पर verified/publication status स्पष्ट रखें। |

## Tools की functionality/verification backlog

| ID | Priority | Pending काम | Evidence / completion criterion |
|---|---|---|---|
| T10 | P1 | हर financial/legal tool की rule provenance | KB publication gate tool constants को automatically gate नहीं करता। Tool→rule version→source→reviewer map चाहिए। |
| T11 | P1 | सभी tool inputs का strict boundary audit | कुछ engines पर improvements हैं; study probe साबित करता है कि consistency बाकी है। Null/empty/NaN/negative/extreme/fraction/forged enum matrix हर route पर। |
| T12 | P1 | Effective-date scenarios | Arrival/application/assessment dates और law-change dates अलग हों; old/new boundaries, leap years और sunset rules tests। |
| T13 | P1 | GET/POST/UI semantic parity | Existing form-contract tests useful हैं; shared wrong default से parity pass हो सकती है। Independent expected outputs और failure behavior चाहिए। |
| T14 | P1 | Geography isolation | Non-Canada navigators का file count 18; global generic tools को हर country की complete coverage न मानें। Unsupported country/province पर explicit gap। |
| T15 | P1 | Tool result wording/compliance assurance | `COMPLIANT`, eligibility और statutory labels की input completeness व legal basis के साथ review; illustrative outputs स्पष्ट हों। |
| T16 | P2 | Wizard route-specific computation | `wizard-plan.js` अभी financial result “Not determined”; यह safe limitation है, completed personalized calculator नहीं। |
| T17 | P2 | Wizard→tool profile transfer | Auto-transfer लागू नहीं; notice मौजूद। Selected destination/date/household को केवल compatible verified fields में map करें, review screen दें। |
| T18 | P2 | Direct Unicode PDFs | `official-forms.js` non-ASCII के लिए null direct PDF और browser-print fallback देता है। Embedded fonts/shaping और multiple-language export tests बाकी। |
| T19 | P1 | Worksheet official-form fidelity | Generated worksheets official forms के replacements नहीं। Current form fields, completeness और actual filing workflow की independent review बाकी। |
| T20 | P2 | Accessibility release coverage | Help, directory, wizard, tool modal और 21 navigation views पर checks हुए हैं; हर form error, contrast, zoom, NVDA/JAWS/VoiceOver manually verify नहीं हुए। |
| T21 | P2 | Offline upgrade/cross-browser matrix | Fresh offline/navigation checks pass; old-cache upgrade, interrupted install, mixed assets, Safari/Firefox/mobile combinations अधूरे। |
| T22 | P2 | Representative tool load/performance | Test pass production concurrency/provider/load guarantee नहीं। Large corpus और representative tool requests के tail latency/failure soak चाहिए। |
| T23 | P1 | Single current task register | Historical CURRENT_PENDING_TASKS/NON_KB docs पुरानी baseline रखते हैं; completed tasks फिर pending गिने जा सकते हैं। IDs, owner, evidence, status और acceptance वाला register चाहिए। |

कुल **40 actionable entries**: 17 KB और 23 tools/shared-quality entries। यह verified defects और validation/implementation backlog की सूची है; “40 broken features” नहीं। एक काम कई records या कई tools पर लागू होता है। 51+ की संख्या पूरी करने के लिए duplicate issues नहीं जोड़े गए।

## पहले किस क्रम में काम करें

1. **पहला batch:** T01–T04, K01–K04 — fabricated compliance, invalid inputs/dates और weak verification/identity boundaries।
2. **दूसरा batch:** T05–T10, K05–K11 — canonical rule versions, UI/backend consistency, provenance/approval reconciliation।
3. **तीसरा batch:** K12–K17, T11–T15 — coverage expansion, independent evaluations और comprehensive route matrices।
4. **चौथा batch:** T16–T23 — wizard/PDF/accessibility/offline/scale तथा maintained task register।

## Evidence और सीमाएँ

- `artifacts/KB_AUDIT_2026-11-04_health.json`: current health/readiness।
- `artifacts/KB_TOOLS_2026-11-04_evidence.json`: read-only database metrics और direct defect probes; replay script `artifacts/kb-tools-audit-2026-11-04.mjs`।
- `artifacts/KB_AUDIT_2026-11-04_coverage.json`: coverage CLI output; `--json` के बावजूद पहले text फिर JSON निकलता है, इसलिए file pure JSON नहीं। Machine-output cleanup भी reporting follow-up है।
- `artifacts/PUBLICATION_2026-11-04_full.txt`: previous completed full suite 2,364 pass। इस read-only audit में full suite दोबारा नहीं चलाई गई।

Technical checks में zero blocking/expiry warnings अच्छे संकेत हैं; factual correctness, independently reviewed coverage और production readiness अलग acceptance gates हैं। Workspace में concurrent changes संभव हैं; ये counts audit के समय के snapshot हैं।
