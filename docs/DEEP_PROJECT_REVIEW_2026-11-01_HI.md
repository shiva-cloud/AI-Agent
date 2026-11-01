# Northstar: विस्तृत प्रोजेक्ट समीक्षा

तारीख: 1 नवंबर 2026 · package version: 0.19.27 · स्थानीय runtime: Node v26.12.1

**निर्णय:** प्रोजेक्ट में substantial functionality और अच्छे foundational controls हैं, लेकिन इसे अभी विश्वसनीय high-stakes production service मानना उचित नहीं है। सबसे बड़ी कमी feature count नहीं, बल्कि सभी answer paths पर एक जैसे evidence, validation और publication नियम लागू न होना है। पहले correctness और trust boundaries ठीक करें; फिर feature expansion करें।

यह source-code, local HTTP probes, automated tests, configuration और read-only database inspection पर आधारित समीक्षा है। सभी 326 top-level source modules को समान गहराई से line-by-line audit करने का दावा नहीं है; मुख्य execution paths और representative domain tools का गहरा निरीक्षण किया गया है। Browser visual/accessibility audit, production deployment, live AI-provider reliability, वास्तविक offsite restore और प्रत्येक statutory statement की स्वतंत्र कानूनी सत्यता इस समीक्षा में प्रमाणित नहीं की गई है। Findings कानून की व्याख्या नहीं, software behavior और provenance की समीक्षा हैं।

Application code या working database को सुधारने के लिए बदला नहीं गया। नए audit scripts/results और यह रिपोर्ट बनाई गई है। Reproduction probes isolated temporary databases पर चले; working database के लिए read-only verification इस्तेमाल हुआ। Workspace Git repository नहीं है; इसलिए clean commit baseline/diff उपलब्ध नहीं है। निरीक्षण के दौरान कुछ source line positions बदले मिले, इसलिए इसे immutable release snapshot की certification न समझें।

## 1. वर्तमान स्थिति और जाँच के परिणाम

| जाँच | ताज़ा परिणाम | इसका अर्थ |
|---|---|---|
| `npm test` | 1,933 tests; 1,931 pass; 2 fail; लगभग 71.6 seconds | मौजूदा suite पूरी तरह green नहीं है |
| दो failing files का isolated rerun | 10 tests; 8 pass; 2 fail | failures reproducible हैं |
| OpenAPI validation | Pass; 289 paths, 1,243 schemas | document valid है; हर UI/API integration सही होने का प्रमाण नहीं |
| generated-client typecheck | Pass | existing generated client typecheck पास; पूरे JS frontend का typecheck नहीं |
| pre-flight | PASS | synthetic/seed checks और disposable migration rehearsal पास |
| developer evaluations | 28/28 और 68/68 | छोटे developer-authored fixtures; independent accuracy नहीं |
| expanded retrieval metrics | Recall@5 और MRR `null` | इस dataset पर retrieval ranking quality मापी नहीं गई |
| dependency audit | 0 reported vulnerabilities | इस run में registry ने known dependency vulnerabilities report नहीं कीं |
| working database verification | integrity/reference/schema checks pass | संरचना सही; factual accuracy अलग प्रश्न है |
| KB health | `ok: true`, लेकिन 589 records बिना editorial review के approved-label warning | health का green status publication readiness नहीं है |

Database snapshot: **906 records, 657 sources, 2,275 audits, 7,402 traces; 0 snapshots, 0 candidates, 0 candidate decisions, 0 publications; 1,227 source-policy reviews; 15 live updates; 0 realtime evidence snapshots।** Source-access review को factual publication review के बराबर न मानें। KB review-progress tracker में 589 total, 31 checked/corrected, 558 remaining और 0 verified मिले। यह tracker का अर्थ है, स्वतंत्र human verification का प्रमाण नहीं।

## 2. सबसे गंभीर: evidence gates के बाहर “verified” claims बन रहे हैं

**F01 · P0 · Reproduced · Release blocker**

`src/engine.js` में question-bank, market-gap और crisis branches retrieval के बाद सीधे claims और sources जोड़ते हैं। वे `status: approved`, `reviewMethod: editorial_review`, वर्तमान तारीख का `checkedAt`, `expiresAt: 2099-12-31` और `snapshotId: null` बनाते हैं। कई branches gaps मिटाकर status को `guidance` भी कर देती हैं। Generic government homepage को source URL और generated verdict को quote बनाया गया है।

**Reproduction:** `answer({question:'My employer kept my passport in Toronto.',city:'Toronto'}, [], fixedDate)` को पूरी तरह खाली evidence list दी गई। फिर भी result में एक approved claim, एक कथित editorially reviewed source और `editorReviewedClaims: 1` आया।

**असर:** मुख्य `publicEvidence()` gate मजबूत होने के बावजूद ये downstream branches उसे bypass करती हैं। User और verification dashboard को human-reviewed evidence का गलत संकेत मिलता है। Source हटाने या freshness controls से भी इन embedded rules का lifecycle नहीं चलता। यह finding संबंधित सलाह सही या गलत होने पर निर्भर नहीं है—review provenance का दावा अपने आप में गलत है।

**सुधार:** सभी resolvers को candidate selection तक सीमित करें। Claim केवल shared publication service से निकले, जिसमें actual evidence ID, exact source URL, captured excerpt, reviewed version और expiry आवश्यक हों। Emergency help के लिए अलग reviewed emergency content registry हो; missing evidence पर honest guidance/gap दिखे, invented review metadata नहीं।

**Acceptance:** empty evidence, rejected source, withdrawn publication, expired source तथा multi-topic gap वाले cases में कोई false approved/editor-reviewed claim न बने। सभी answer-producing routes पर यह invariant test हो।

संदर्भ: `src/engine.js` में `if (qbMatch)`, `if (mkt1Match)`, `if (mkt2Match)`, `if (mkt3Match)` और `crisisMatch`; `src/public-evidence.js`।

## 3. High-priority correctness और security findings

| ID | प्राथमिकता / प्रमाण | समस्या और प्रभाव | बदलाव व completion criterion |
|---|---|---|---|
| F02 | P1 · HTTP reproduced | Healthcare tool को `province=ZZ&status=unknown&date=bad-date` देने पर HTTP 200, Ontario और `isEligible:true` मिला। Unknown province Ontario बन जाता है, invalid date today, और eligibility true से शुरू होती है। | Enums, real calendar date और required facts validate करें; गलत input पर 400 या clarification। Unknown को eligible न मानें। |
| F03 | P1 · HTTP reproduced | `Germany mein health card kaise milega?` Canada/OHIP/MSP question में rewrite हुआ; parsed country `CA`। Returned multilingual metadata में बिना evidence gate के Hindi eligibility summary भी है। इस probe में main status unavailable और claims empty थे। | Original country, dates, status, negation और question facets सुरक्षित रखें। Translation सिर्फ भाषा बदले। Localized summary approved claims से बने; evidence absent हो तो उसका भी abstention हो। |
| F04 | P1 · HTTP + source confirmed | Settlement journey UI `landingDate`, `immigrationCategory`, `destinationProvince` भेजता है; GET API `date`, `category`, `city` पढ़ता है। UI `data.milestones` अपेक्षित करता है; API `phases[].items` लौटाता है। Probe में requested future date/BC के बजाय today/Toronto/PR default मिला। | एक typed contract, explicit province→city handling और response adapter। Browser integration में चुनी date/category/location result में round-trip हो; silent fallback हटे। |
| F05 | P1 · Store-level reproduced | SaaS quota पहले check होती है, response finish पर count बढ़ता है। 499 usage पर दो checks स्वीकार हुए; दोनों record करने पर 500 सीमा के विरुद्ध 501 usage। Accounting failure empty catch में दब जाता है। | Atomic reservation, request ID, success commit/failure release; monthly period reservation में capture करें। Concurrent requests में सीमा न टूटे; accounting errors visible हों। यह reproduction accounts primitive का है, full HTTP load test नहीं। |
| F06 | P1 · HTTP reproduced | Anonymous translation submission बाद में public listing में pending status सहित original text, notes, counselor name और credential दिखाई देती है। `limit=-1` भी स्वीकार हुआ; SQLite negative LIMIT unbounded है। | Public route verified entries का minimal projection दे। Pending/notes authenticated moderation तक सीमित हों। Limit 1–100, field bounds, retention और abuse controls लागू हों। Regex redaction को “zero PII” guarantee न कहें। |
| F07 | P1 · Configuration confirmed | `.github/workflows/ci.yml` Node 22 और missing `scripts/run-all-tests.js` चलाता है, जबकि package Node >=24 मांगता है। `verify.yml` अलग सही Node 24 workflow है। | CI consolidate करें; engine range, test command और Windows/Linux matrix consistent हों। Remote green build का प्रमाण लें; इस workspace में remote execution verified नहीं। |

F02 का broader pattern: standalone tools (`healthcare`, sponsorship, tax आदि) hard-coded logic से decisive verdict देते हैं; मुख्य chat की evidence publication, source suspension, expiry और review rules हर tool पर लागू नहीं हैं। केवल disclaimer जोड़ना पर्याप्त नहीं। हर tool को `preliminary_assessment`, missing inputs, assumptions, jurisdiction, rule version और evidence status लौटाना चाहिए। “Fully Eligible” या “verified” तभी जब product का documented evidence standard पूरा हो।

## 4. Storage, provenance और moderation integrity

**F08 · P2 · Reproduced: FTS index startup पर duplicate होता है।**

`src/store.js` में `records_fts` पर `id UNINDEXED` है, unique constraint नहीं। हर `openStore()` seed rows पर `INSERT OR IGNORE` चलाता है; conflict नहीं होने के कारण वही rows फिर insert होती हैं। Disposable database पहली बार 258 rows/258 unique IDs, दूसरी बार 516 rows/258 unique IDs हुआ। इससे index storage और duplicate search results बढ़ सकते हैं; LIMIT के भीतर distinct results घट सकते हैं। यह `store.searchFts` path का defect है; इसे पूरे BM25 search का proven failure न मानें।

सुधार: transactional idempotent index rebuild/upsert strategy, stable rowid mapping और content-change synchronization। तीन restarts पर row count stable रहे; search results distinct हों; withdrawal/import पर index सही update हो।

**F09 · P2 · Reproduced, वर्तमान live route impact स्थापित नहीं: provenance helper nested data protect नहीं करता।**

`src/security-guard.js` का `JSON.stringify(payload, Object.keys(payload).sort())` replacer nested object keys भी top-level whitelist से filter करता है। Signed payload में nested eligibility false→true और amount 100→999999 बदलने के बाद verification true रहा। Secret unset होने पर hard-coded fallback भी मौजूद है। वर्तमान source search में helper का production caller नहीं मिला; इसलिए इसे current public exploit नहीं कह रहे।

सुधार: unused feature हटाएँ या audited recursive canonicalization, required secret, key ID/version और timing-safe comparison दें। Nested object/array mutations सभी reject हों। `statutoryIntegrityLocked` जैसा flag actual guarantee के बिना न दें।

**F10 · P2 · Source confirmed: translation moderation identity अधूरी है।**

`endorseTranslation()` repeated endorsements को अलग authenticated identities के रूप में validate/store नहीं करता; count बढ़कर 3 पर endorsed हो जाता है। `cleanEndorser` उपयोग नहीं होता। Verify endpoint caller का `verifiedBy` स्वीकार करता है, जबकि generic actor injection केवल `reviewer`/`actor` भरती है। Endorse/verify routes admin-protected हैं—anonymous approval exploit नहीं है—लेकिन attribution और independent endorsement का भरोसा कमजोर है।

सुधार: append-only moderation events, authenticated actor ID, `(translation_id, actor_id)` uniqueness, valid state transitions और reason। Public submission पर counselor credential self-declared साफ दिखे।

**F11 · P2 · Source confirmed: translation database module-global है।**

`src/community-translation-ledger.js` में shared `dbInstance` है। उसी process में दूसरा `createApp` initialize होने पर पहला app भी दूसरे ledger का उपयोग कर सकता है; database close होने पर stale handle संभव है। Production में एक app/process होने पर scope सीमित, लेकिन isolation/testability defect वास्तविक है। इसे per-store factory बनाएं; two-app isolation test रखें।

## 5. KB और answer quality

1. **Approved label और वास्तविक publication अलग हैं।** Working DB में 589 approved-without-editorial-review warnings और zero publications मिले। `publicEvidence()` high-risk unsupported approvals को pending बनाता है—यह अच्छा control है। लेकिन status dashboards, change feed और सभी alternative resolvers को भी वही effective publication state चाहिए। `/v1/changes` raw stored status पढ़ता है; इसे public evidence के अनुरूप करें।
2. **Freshness का अर्थ स्पष्ट नहीं है।** Healthcare जैसे tools `asOf` में आज की तारीख देते हैं, जो execution date है; यह source आज check होने का प्रमाण नहीं। `kb-facts.js` centralized registry अच्छा कदम है, लेकिन `factValue()` review deadline enforce नहीं करता। `factsDueForReview()` maintenance warning है। `generatedAt`, `sourceCheckedAt`, `effectiveFrom`, `reviewDueAt` अलग हों; overdue high-risk rules fail closed हों।
3. **Source code में knowledge बिखरा हुआ है।** Tool constants, multilingual summaries, question banks, seed files और DB parallel truth stores हैं। एक जगह correction होने पर दूसरी जगह पुरानी value रह सकती है। Rule IDs और evidence-backed versioned registry से tools/translation/cache सभी derive हों।
4. **Hindi/Hinglish support keyword mapping है।** Broad patterns original question का पूरा meaning preserve नहीं करते। Pure Devanagari fallback generic question बना देता है। Multilingual support का दावा actual coverage तक सीमित करें; unsupported phrasing पर स्पष्ट clarification दें।
5. **Independent evaluation सबसे बड़ी missing quality gate है।** Current 96 developer scenarios और legal tool unit tests domain accuracy establish नहीं करते। Held-out bilingual/country-specific dataset, expert-reviewed expected decisions, exception cases, false-eligibility rate, evidence entailment और abstention usefulness मापें।
6. **“NLI” नाम capability से बड़ा है।** `src/nli-hallucination-guard.js` token overlap और allow/prohibit regex इस्तेमाल करता है। इसे semantic entailment proof न मानें। Tested heuristic नाम दें; stronger verifier तभी जोड़ें जब measured benefit हो।

## 6. Testing में क्या ठीक और क्या बदलना है

दो current failures wording assertions हैं:

- `test/real-estate-assignment-navigator.test.js`: generated statement में exact `100% Deemed Business Income` अपेक्षित है; implementation wording `Full Amount Deemed Business Income` है। Numeric Tarion assertions इस failing location तक पार हो चुकी थीं।
- `test/super-visa-sponsor.test.js`: `20-Year Undertaking Guarantee` अपेक्षित, actual wording `20-Year Statutory Undertaking Obligation` है।

इन दो failures को calculation error कहना गलत होगा। Intended wording तय कर semantic assertions करें; tests हटाकर green न करें। Genuine legal assertions अलग expert-reviewed fixtures से validate हों।

Test coverage की गुणवत्ता में सुधार:

- UI tests में कई checks `html.includes()`/`css.includes()` हैं। इससे element existence पता चलता है, actual user journey, focus, responsive layout या API data-binding नहीं। Journey contract bug इसका ठोस उदाहरण है।
- `test/red-team-jailbreak.test.js` के “100 attacks” छह base strings पर iteration suffix हैं, और expected outcome उसी regex family से जाँचा जाता है। यह useful regression है, independent adversarial evaluation नहीं।
- `test/security-ai-devops-recs.test.js` audit status में `error` भी स्वीकार करता है। Feature-shape test और security release gate अलग रखें।
- हर claim-producing path पर common invariant tests जोड़ें: no fake provenance, preserve country, reject unknown eligibility inputs, never hide unresolved facets, expired rule cannot answer as current।
- Auth/quota tests में concurrent requests, DB busy, audit-write failure और multiple server instances शामिल करें।
- Browser end-to-end paths: signup/reset, tools by plan, journey, multilingual location, offline→update, keyboard-only forms और mobile layouts। वर्तमान review में browser execution नहीं किया गया।

## 7. Architecture और performance

निरीक्षण के समय `server.js` लगभग 7,300 lines/433 KB, `public/app.js` लगभग 25,000 lines/1.21 MB, `index.html` 356 KB और stylesheet 161 KB थे। 326 top-level src और 336 test files मिले। ये maintenance indicators हैं; अपने आप measured latency failure नहीं।

**सुधार के मुख्य क्षेत्र:**

- `server.js` में लंबे GET/POST dispatch chains तथा same GET block में repeated route handlers हैं—उदाहरण `credential-licensure`, `telecom-contract-defense` और कई subsequent tools। Earlier return के कारण later duplicate unreachable रहता है; future fixes गलत copy में हो सकते हैं। Domain routers और single route registry बनाएं; duplicate method/path पर startup/test fail हो।
- OpenAPI schemas बने हुए हैं, लेकिन hand-written runtime parsing और frontend fetch parameters drift कर रहे हैं। Shared request validators और generated client को actual frontend में इस्तेमाल करें।
- Browser को monolithic `app.js` parse करना पड़ता है। Feature modules को route/view पर load करें; critical shell छोटा रखें। Current lightweight lazy tool execution और actual JavaScript code splitting अलग हैं।
- `server.js` static requests पर `brotliCompressSync`/`gzipSync` करता है। Large asset का cold request main event loop रोक सकता है। Build-time/precomputed encoded assets या cache रखें। Current severity performance hypothesis है; p95/p99 load measurement चाहिए।
- Answer path corpus को दो बार load, JSON parse, sort और hash करता है ताकि in-flight knowledge change detect हो। Correctness intent अच्छा है; corpus बढ़ने पर per-request cost बढ़ेगा। Transactional knowledge revision और revision-keyed immutable snapshot/index इस्तेमाल करें।
- Password hashing `scryptSync` main thread पर है। Async scrypt/bounded worker pool और authentication-specific concurrency controls अपनाएं; shared HTTP bucket पर्याप्त capacity proof नहीं।
- SQLite को अभी केवल fashion के कारण replace न करें। पहले duplicates, write transactions, busy behavior और representative concurrent load मापें। Multiple-host deployment की जरूरत साबित होने पर DB/queue architecture बदलें।

## 8. Privacy, operations और deployment

- Sensitive tool inputs के GET variants में applicant/property/financial/medical parameters URL में जा सकते हैं। Application trace sanitization अच्छा है, लेकिन reverse-proxy logs और copied URLs अलग exposure हैं। Sensitive assessment के लिए POST JSON रखें; proxy logging policy जाँचें। इस audit में वास्तविक data leak observe नहीं किया गया।
- Retention traces/gaps/feedback के लिए है। Accounts sessions/email tokens/usage और community submissions के लिए explicit retention/export/deletion lifecycle चाहिए। Business और audit retention अलग document हों।
- Production में `PUBLIC_ORIGIN`/HTTPS cookie configuration, stable `ACCOUNTS_SECRET`, real mail provider और admin lifecycle validate हों। Console email provider production में केवल warning देकर चल सकता है; fail-fast policy बेहतर होगी। Test-mode production refusal पहले से मौजूद है—उसे missing न समझें।
- `ecosystem.config.cjs` crawler argument `--interval=30` देता है; parser केवल separate `--interval 60000` form पढ़ता है। Current result fallback 60 seconds होगा। Units/argument style consistent और CLI-validated हों।
- PM2 `wait_ready:true` है, लेकिन inspected server startup में `process.send('ready')` नहीं मिला। PM2 startup contract और actual cluster mode chosen environment में verify करें। `instances` config-load-time `NODE_ENV` पर निर्भर है; `env_production` अकेले उस expression को बदलने का प्रमाण नहीं।
- `scripts/audit-cve.js` subprocess failure में कुछ cases default pass छोड़ सकता है; `error` status पर CLI nonzero नहीं देता। Audit unavailable हो तो release gate fail हो। अलग `verify.yml` का direct npm audit इसे आंशिक रूप से cover करता है।
- Backup/encryption/recovery code और tests मौजूद हैं; “backup missing” कहना गलत होगा। लेकिन chosen production environment में restore timing, offsite restore, key-loss/rotation drill और RPO/RTO प्रमाण अभी इस review में स्थापित नहीं। Evidence, accounts, queue और secrets के coordinated recovery plan की जरूरत है।
- Health/readiness, workers, shutdown, rate limiting, monitoring के existing components अच्छे हैं। External alert delivery, sustained load, TLS ingress और actual operator response runbook deployment-specific acceptance हों।
- Git metadata इस workspace में नहीं है। Private version-control baseline, reviewed changes, tagged releases और reproducible artifact manifest आवश्यक हैं। Data/secrets को accidentally add न करें; existing ignore rules बनाए रखें।

## 9. UX और product सुधार

ये source-based recommendations हैं, visual audit findings नहीं:

1. **User journey को feature catalog से प्राथमिकता दें:** destination, status, arrival stage और immediate problem से relevant tools तक पहुँचाएँ। Hundreds of tools का navigation cognitive load बढ़ाता है। Existing categorized navigation उपयोगी शुरुआत है।
2. **Missing information पर सवाल पूछें:** default PR/Ontario/India/positive eligibility silently assume न हो। Demo inputs और real assessment inputs अलग दिखाई दें।
3. **Result में चार बातें साफ हों:** क्या पता है, किन inputs पर निर्भर है, source कब verified हुआ, next practical action क्या है। Long statutory paragraphs को expandable details में रखें।
4. **Confidence का ईमानदार presentation:** “research seed”, “review pending”, “reviewed evidence” और “automated change detected” अलग badges हों। Fresh execution timestamp को factual verification badge न बनाएं।
5. **Language switching meaning preserve करे:** location और original query visible रहें; unsupported translation पर user से confirm कराएं। Static Hindi summary किसी unrelated country पर attach न हो।
6. **Accessibility acceptance:** labels/errors association, keyboard navigation, dialog focus return, accordion ARIA state, 200% zoom, narrow screens और screen-reader announcements। Automated CSS string checks इसका विकल्प नहीं।
7. **SaaS value proposition स्पष्ट हो:** Free unlimited और paid limited quotas intentional documented choice है; इसे bug नहीं कहा गया। Paid value specialised tool access है, इसे pricing copy में साफ बताएँ। Billing/team-seat lifecycle को available capability से अधिक न दर्शाएँ।

## 10. जो अच्छा है और बचाए रखना चाहिए

- Low runtime dependency footprint; वर्तमान dependency audit साफ।
- Parameterized SQLite operations, request-body limits, structured errors और same-origin/security headers।
- Hashed API keys/sessions, scrypt passwords, generic login/reset responses और credential controls।
- Individual admin roles/token expiry/revocation support; review gates और source suspension functionality।
- `publicEvidence()` में provenance-aware high-risk protection और realtime public-alert filters।
- Provider input minimization, bounded concurrency, cancellation, timeout और deterministic fallback। Raw question को हर provider call में भेजने का पुराना README claim वर्तमान verified-answer flow को ठीक नहीं दर्शाता।
- Database structural verification, backup/recovery tooling, API schemas और substantial regression suite।
- Service worker APIs/authenticated responses cache नहीं करता; update activation flow मौजूद है।

इन controls को unified architecture में reuse करें; पूरा project rewrite आवश्यक नहीं है।

## 11. सुधार का प्रस्तावित क्रम

| चरण | काम | पूरा होने का प्रमाण |
|---|---|---|
| 1: trust/correctness | F01 fake provenance रोकें; F02 invalid eligibility; F03 geography/translation; F06 public pending content | Empty-evidence/invalid-input/country-preservation/public-projection tests pass |
| 2: functional stability | F04 journey contract, F05 atomic quotas, F08 FTS idempotence, दो failing tests, broken CI | Browser journey round-trip; concurrency tests; restart counts stable; Node 24 CI green |
| 3: content integrity | Unified rules/evidence registry, overdue-fact behavior, independent domain review, moderation attribution | Sampled tools में exact source/version/reviewer; held-out false-eligibility and entailment report |
| 4: maintainability | Route registry, shared schemas, frontend modules, dead/unwired helper removal, current documentation | No duplicate method/path; typed consumers; smaller measured initial bundle |
| 5: deployment validation | Production config, mail/alerts, load test, coordinated restore, privacy lifecycle | Measured p95/p99, failure drills, restore RPO/RTO, functioning alert destination |

नई country coverage या नए calculators जोड़ने से पहले पहले दो चरण पूरे करना सबसे उपयोगी निवेश होगा। AI model बदलना इन deterministic correctness problems को अपने आप ठीक नहीं करेगा।

## 12. Reproduction और evidence files

सभी artifacts workspace के `artifacts/` में हैं:

- `deep-review-2026-11-01-tests.txt`: full suite output।
- `deep-review-failure-rerun.txt`: दो failing files का isolated rerun।
- `deep-review-probes-2026-11-01.mjs`: disposable reproduction script। चलाएँ: `node artifacts/deep-review-probes-2026-11-01.mjs`।
- `deep-review-probes-2026-11-01.json`: empty-evidence claim, healthcare, quota, FTS, provenance, journey, translation और developer-evaluation outputs।
- `deep-review-api.txt`, `deep-review-typecheck.txt`, `deep-review-preflight.txt`: verification logs।
- `deep-review-kb.json`, `deep-review-data.json`: read-only KB/database reports।
- `deep-review-dependencies.json`: dependency audit result।

Temporary probe databases का path probe JSON में दर्ज है; कोई real user data उसमें डाला नहीं गया। Source references file/symbol based हैं क्योंकि workspace immutable Git snapshot नहीं है। रिपोर्ट की completion का अर्थ audit पूरा होना है; listed fixes अभी लागू नहीं हुए हैं।
