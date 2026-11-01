# पूरे प्रोजेक्ट की pending सूची — 31 अक्टूबर 2026

यह source code, read-only database inspection, automated checks और isolated HTTP reproductions पर आधारित backlog है। Audit के दौरान shared workspace में अन्य बदलाव भी आ रहे थे; नीचे के counts दर्ज किए गए snapshot के हैं। यह सभी संभावित bugs के अनुपस्थित होने का प्रमाण नहीं है।

## सत्यापित स्थिति

- Inventory snapshot: **236 backend JavaScript modules**, **240 test files**, **184 documented API paths**; sampled literal public routes में undocumented path नहीं मिला। `public/app.js` लगभग **23,445 lines**, `src/server.js` लगभग **5,410 lines** था; दोनों में आगे concurrent बदलाव हुए।
- इस batch के full test run में **1,286 tests passed, 0 failed**। TypeScript client और OpenAPI validation भी passed (184 paths / 798 schemas at that run)।
- Database structural verification passed. इसका अर्थ factual/legal correctness या genuine human approval नहीं है।
- Database snapshot: **774 records**, 748 `approved`, 26 `research_seed`, 547 high-risk; expiry date के हिसाब से 0 expired।
- **589 approved records** पर `editorial_review` method नहीं था; इनमें **388 high-risk** records हैं। **774/774 records** में `snapshotId` नहीं है; canonical `snapshots` और `publications` tables दोनों में 0 rows हैं। अलग `crawl_snapshots` table मौजूद है, इसलिए इसे “किसी भी तरह का crawl history नहीं है” न समझें।
- Dependency audit: **3 moderate, 0 high, 0 critical**, development-tool dependency chain में; पिछली compatibility जाँच में forced upgrade से client generation टूटा था।
- Sidebar के desktop overflow bug का fix और चार local preparation tools जोड़े गए। Desktop पर पहले inaccessible lower menu का click और चारों example workflows browser में verified हुए। हर existing tool का हर browser/device workflow इस audit में verify नहीं हुआ।

## Priority का मतलब

- **P0:** public release से पहले ठीक करना आवश्यक।
- **P1:** reliable pilot के लिए आवश्यक।
- **P2:** roadmap/product decision; हर item मौजूदा local prototype के लिए अनिवार्य नहीं।
- **Confirmed:** code/database या isolated reproduction से प्रमाणित। **Validation pending:** implementation है, पर्याप्त end-to-end प्रमाण बाकी। **Decision:** feature की जरूरत और scope तय होना बाकी।

## 40-item backlog

| # | Priority / स्थिति | क्या pending है | Evidence / पूरा मानने की शर्त |
|---|---|---|---|
| 1 | P0 / Confirmed | Public simulation endpoint को authentication और development-only boundary देना | `src/server.js` में `/v1/realtime/simulate`; बिना Authorization POST ने memory DB में alert लिखा और HTTP 200 दिया। Production में anonymous write अस्वीकार होना चाहिए। |
| 2 | P0 / Confirmed | Subscriber privacy और ownership checks | `/v1/realtime/subscriptions` से anonymous create/list HTTP 200; test subscriber का name और endpoint public response में मिले। `src/realtime-subscriptions.js` में `SELECT *`; owner/admin-only access और private fields की protection चाहिए। |
| 3 | P0 / Confirmed | High-risk evidence का वास्तविक independent review | 388 high-risk approved records पर editorial method अनुपस्थित। `src/review-queue.js` इन्हें flag करता है; source opening, reviewer accountability और evidence-level decisions चाहिए। |
| 4 | P0 / Confirmed | Source provenance और publication history भरना | 774 missing snapshot IDs; canonical snapshots/publications 0। `src/ingestion.js` का workflow मौजूद है, लेकिन stored corpus उसके traceable artifacts के बिना है। |
| 5 | P0 / Confirmed | Bulk “approve/extend/resolve” maintenance script को सुरक्षित करना | `scripts/resolve-all-pending-and-sources.js` सभी pending records approve, dates extend और open gaps resolve करता है। इसे इस audit में चलाया नहीं गया। Dry-run, scoped authorization और वास्तविक review के बिना ऐसा publication path नहीं होना चाहिए। |
| 6 | P0 / Confirmed code gap | High-risk live alerts के लिए publication/review gate | `src/realtime-kb-ingestor.js` candidate pending रहते हुए alert active करता है; `src/engine.js` active alerts answer payload में जोड़ता है। Unreviewed/expired/future-effective alerts के display नियम और tests चाहिए। |
| 7 | P0 / Validation pending | Calculator policy correctness का domain review | Direct calculator routes KB review pipeline से स्वतंत्र deterministic statements देते हैं। Program/province/date-specific exceptions, constants, cited source और effective date का expert verification जरूरी; tests में constant match होना legal correctness का प्रमाण नहीं। |
| 8 | P0 / Confirmed | Image/PDF pre-check को वास्तविक OCR बनाना या साफ text-only करना | `public/app.js` के image/PDF branch में filename + आज की date से `runScan` होता है; file contents पढ़े नहीं जाते। इससे गलत recency signal आ सकता है। Actual extraction, confidence और unsupported-file handling चाहिए। |
| 9 | P1 / Confirmed code gap | Realtime geography matching ठीक करना | `findActiveAlerts` में city/region/country OR matching है; दूसरे शहर का alert country match से आ सकता है। Country names vs codes normalization और hierarchical scope tests चाहिए। |
| 10 | P1 / Confirmed code gap | Relevant alerts को filter करने के बाद limit लगाना | `findActiveAlerts` पहले newest 50 rows लेता है, फिर geography/topic filter करता है। उससे पुराने relevant alerts छूट सकते हैं। SQL predicates और bounded pagination चाहिए। |
| 11 | P1 / Confirmed | Unknown effective dates को unknown रखना | `src/realtime-extractor.js` detected future date नहीं मिलने पर today को effective date मानता है। Detection time और legal effective date अलग रखने चाहिए। |
| 12 | P1 / Confirmed code gap | Crawler access-policy enforcement | Registry crawler और realtime ingestion को reviewed permission/source suspension से जोड़ना बाकी; candidate का `crawlPolicy` label enforcement नहीं है। |
| 13 | P1 / Confirmed code gap | Crawler response-size और redirect/network limits | `pollSource` timeout रखता है, लेकिन `res.text()` पूरी body पढ़ता है और default redirect behavior इस्तेमाल करता है। Bounded bytes, allowed destinations और failure tests चाहिए। |
| 14 | P1 / Confirmed | Complete old content से meaningful diff | Cron previous state में hash/ETag/lastModified देता है, old content नहीं; extractor numeric/condition delta के लिए full baseline चाहता है। Durable baseline और precise diff chain चाहिए। |
| 15 | P1 / Confirmed code gap | Crawl snapshot advance और successful ingestion को coordinate करना | `runCronCycle` ingestion से पहले new hash store करता है। Ingestion fail होने पर same content अगली बार unchanged होकर skip हो सकता है। Retryable state/transactional checkpoint चाहिए। |
| 16 | P1 / Confirmed code gap | Partial crawl/ingestion failures का truthful status | Extractor failures catch/log होते हैं, cycle success path आगे चलता है। Per-source failed/retry counts, partial status और alerting चाहिए। |
| 17 | P1 / Confirmed | Duplicate realtime route handlers हटाना | `/v1/realtime/simulate` और `/poll` की POST branches दो जगह हैं; पहले return के कारण बाद वाली semantics unreachable हो सकती है। एक canonical handler/contract होना चाहिए। |
| 18 | P1 / Confirmed incomplete wiring | Subscription से वास्तविक notification delivery | SubscriptionManager rows store करता है; matching subscribers से email/Telegram/webhook delivery की end-to-end wiring नहीं मिली। Ownership, verified destination, unsubscribe, dedupe और delivery retries चाहिए। |
| 19 | P1 / Confirmed code gap | Realtime webhook dispatcher hardening | `src/realtime-alerts.js` के dispatcher में timeout/abort, signed payload, delivery ledger और bounded retry नहीं दिखते। Existing hardened alert infrastructure के साथ consolidation चाहिए। |
| 20 | P1 / Confirmed coverage gap | नई realtime tables की semantic recovery/readiness checks | `src/verification.js` की `dataTables` list में live_updates/crawl_snapshots/cron_crawl_logs/realtime_subscriptions नहीं हैं। SQLite backup file में tables आ सकती हैं; missing चीज उनकी application-level verification/restore scenarios हैं। |
| 21 | P1 / Confirmed | 3 moderate dependency audit entries resolve करना | Compatible upstream generator release या validated migration चाहिए। Unsupported forced override से audit साफ करके generation तोड़ना समाधान नहीं। |
| 22 | P1 / Validation pending | सभी calculators पर uniform bad-input tests | Negative/NaN/infinite values, impossible dates, unknown enums, empty collections और type coercion की coverage पूरे expanded tool set पर चाहिए; केवल हाल के fixed modules पर्याप्त नहीं। |
| 23 | P1 / Validation pending | Automated browser E2E coverage | सभी sidebar items, tool modals, submit/error/reset/download flows, keyboard, mobile और accessibility के repeatable browser tests चाहिए। इस run का manual/interactive subset pass पूरा UI coverage नहीं है। |
| 24 | P1 / Validation pending | Offline/update lifecycle और user data continuity | Worker version bump मौजूद है; पुराने clients को updated UI पाने के लिए reload लगा। Update notice, stale-shell detection और unsaved form handling के end-to-end checks चाहिए। |
| 25 | P1 / Confirmed scale concern | Frontend/backend monolith को modules में बाँटना | 23k+ line `app.js` और 5k+ line `server.js` में parallel changes और regressions का जोखिम। Route modules, per-tool initialization और isolated error boundaries चाहिए। |
| 26 | P1 / Confirmed | Independently reviewed evaluation set | Pilot 28 + expanded 68 cases developer-authored हैं। 200/1,000 human-reviewed roadmap items, held-out/adversarial splits और semantic citation review अभी अलग काम है। |
| 27 | P1 / Validation pending | Real external AI behavior और provider operations | Simulated providers के tests पर्याप्त नहीं: production keys/config पर privacy, latency, rate limits, fallback, cost policy और model drift का measured pilot चाहिए। इस audit ने कोई live AI request नहीं की। |
| 28 | P2 / Roadmap | Lexical + vector/hybrid retrieval | `src/search.js` lexical baseline है। यदि roadmap बरकरार है तो embeddings/index/retrieval comparison चाहिए; इसे local prototype का तत्काल bug न समझें। |
| 29 | P1 / Confirmed documentation mismatch | Geography/language support contract align करना | Docs English-only/four-city pilot कहते हैं, UI कई destinations और language guides दिखाता है। Answer support, calculator support और translated static guide support अलग matrix में publish करना चाहिए। |
| 30 | P1 / Confirmed | README/STATUS/PLAN और actual features sync करना | पुराने docs “no automatic crawler” और पुराने counts बताते हैं जबकि realtime crawler/runner मौजूद हैं। एक dated release manifest, supported-tool inventory और limitations चाहिए। |
| 31 | P1 / Rollout pending | HTTPS hosting/staging/deployment validation | Dockerfile और CI definition हैं; production domain/TLS ingress, configured origin, durable volume, rollback और acceptance evidence इस audit में स्थापित नहीं। |
| 32 | P1 / Rollout pending | Real reviewer account lifecycle | Token-based individual roles/rotation हैं; SSO/MFA और organization account provisioning/credential ownership का production rollout बाकी। Role system को “पूरी तरह नहीं है” कहना गलत होगा। |
| 33 | P1 / Rollout pending | Persistent worker/cron supervision | Standalone `realtime-cron-runner.js` मौजूद है। OS service/container scheduling, restarts, shutdown, missed-run detection और source polling policy का deployed verification चाहिए। |
| 34 | P1 / Rollout pending | Offsite encrypted backups और disaster drill | Local backup/rekey/recovery tools हैं। External destination, retention ownership, key custody और दूसरे host पर timed restoration साबित करना बाकी। |
| 35 | P1 / Rollout pending | Real alert destinations और operational ownership | Metrics/monitors हैं; delivery destination, on-call owner, alert acknowledgement और real failure/recovery delivery का validation चाहिए। |
| 36 | P1 / Validation pending | Realistic performance/load tests | Large current corpus, concurrent HTTP + crawler + DB writes + external AI पर p95/error budgets चाहिए। Local fixture benchmark production capacity नहीं है। |
| 37 | P1 / Confirmed process gap | Git/release/CI evidence | Workspace में Git metadata नहीं मिला। Workflow YAML होना successful remote CI/release proof नहीं। Versioned baseline, reproducible release और concurrent edits का controlled integration चाहिए। |
| 38 | P1 / Validation pending | Privacy/retention policy का expanded data model तक विस्तार | Existing trace retention है; subscription contact data, live/crawl records और exported reports के retention, deletion, consent और access rules अलग validate करने हैं। |
| 39 | P2 / Product decision | Case workspace save/resume और scheduled reminders | नए चार tools tab-local हैं; review download है। Secure opt-in persistence, encrypted import/export, family collaboration और calendar/email reminders अभी नहीं जोड़े गए। यह वर्तमान privacy-preserving local behavior का bug नहीं है। |
| 40 | P2 / Product decision | Differentiation और external integrations की scope तय करना | Market uniqueness साबित नहीं है। Government account/status sync, submission, appointment booking और paid integrations तभी जोड़ें जब approved API, permissions और user workflow तय हों। मौजूदा local checks को official submission/approval tool नहीं कहना चाहिए। |

## किस क्रम में करें

1. **पहले:** #1–8 — unauthorized writes, contact privacy, review/provenance और misleading OCR को बंद/ठीक करें।
2. **फिर:** #9–24 — realtime reliability, dependency fix, recovery coverage, automated browser tests।
3. **उसके बाद:** #25–38 — modularization, content evaluation, deployment और operations।
4. **अंत में product निर्णय:** #28, #39–40 — demand/evaluation के आधार पर अतिरिक्त features।

## इस audit में क्या नहीं किया

- Working database में records approve, expiry extend, gaps resolve या subscriptions edit नहीं किए।
- Security reproductions disposable in-memory store, synthetic name और `example.invalid` endpoint पर हुए; कोई webhook या email नहीं भेजा गया।
- नए pending security issues को यहाँ “fixed” नहीं बताया गया: इस अनुरोध का deliverable pending analysis है।
- Real legal/medical/financial policy assertions का independent expert certification नहीं किया गया।

## Evidence artifacts

- `scratch/current-project-inventory.json`
- `scratch/pending-audit-provenance.json`
- `scratch/pending-audit-reproductions.json`
- `scratch/workspace-final-tests.log`
- `scratch/current-project-data-check.log`
- `scratch/current-project-dependencies.json`

Official context for the new preparation tools: [IRCC supporting documents](https://www.canada.ca/en/immigration-refugees-citizenship/services/application/common-supporting-documents.html), [updating an application](https://www.canada.ca/en/immigration-refugees-citizenship/services/application/update-your-application.html). Similar checklist/task products exist; no “not available anywhere in the market” claim is made.
