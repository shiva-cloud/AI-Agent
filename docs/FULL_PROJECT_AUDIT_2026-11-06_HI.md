# Northstar Settlement Intelligence — प्रोजेक्ट ऑडिट

**6 नवंबर 2026 · v0.19.67 · commit 44c6d3f · Windows / Node 26.12.1**

स्थानीय ऐप और उसके प्रमुख workflows चलते हैं। सबसे गंभीर समस्या evidence की प्रस्तुति में मिली। सार्वजनिक Explorer पुराने hard-coded दावों को वर्तमान, सत्यापित सरकारी उत्तर की तरह दिखाता है। PNP के एक ही tool में GET और POST खाली प्रोफ़ाइल पर अलग निष्कर्ष देते हैं। वास्तविक KB की SQLite integrity ठीक है और publication readiness अलग से विफल है।

## जाँच का दायरा और परिणाम

| जाँच | नया परिणाम |
|---|---|
| Source inventory | 598 JS/TS files, 4,153 function-like nodes, 1,971 named। इसमें src, public, scripts और deploy हैं। |
| Regression | 397 test files। 2,420 cases में 2,416 पास, 4 fail, 0 skip। Coverage run में भी यही परिणाम। |
| Node coverage | रिपोर्ट में आए src/public modules में 95.91% lines, 83.13% branches, 90.35% functions। Unloaded files denominator में शामिल नहीं हैं और Chrome execution का coverage अलग से नहीं नापा गया। |
| API contract | OpenAPI validation और generated client typecheck पास। 304 paths, 507 operations, 1,290 schemas। |
| Tool HTTP smoke | 198 documented tool paths के सभी 396 GET/POST operations पर default GET या empty POST। 392 HTTP 200, चार validation HTTP 400, कोई 404 या 5xx नहीं। 200 से गणना या policy की शुद्धता सिद्ध नहीं होती। |
| Chrome | नौ repository browser scripts पास। 21 primary views, desktop और 390 px पर चुनिंदा interactions, keyboard focus, modal error/reopen, offline recovery, wizard, visitor और study-finance। अलग browser run में Explorer की समस्या पुनरुत्पादित हुई और /manage का sign-in shell खुला। |
| Backend smoke | Server, worker और 10 pre-flight checks पास। ESLint पास। 28 + 68 developer evaluation cases पास। |
| वास्तविक SQLite | Read-only integrity, schema, references और snapshot hashes पास। 1,221 records, 1,162 sources, 7 migrations, 156 snapshots। |

[फ़ंक्शन, API और HTML controls की inventory](../artifacts/PROJECT_AUDIT_INVENTORY_2026-11-06.md) · [Regression log](../artifacts/PROJECT_AUDIT_2026-11-06/regression.log) · [File-level coverage](../artifacts/PROJECT_AUDIT_2026-11-06/coverage.log) · [Tool matrix](../artifacts/PROJECT_AUDIT_2026-11-06/tool-matrix.json)

## पुनरुत्पादित समस्याएँ

1. **उच्च — Explorer historical claims को live verification की तरह दिखाता है।** बिना sign-in के /explorer.html खोलकर “Mother medical condition” वाला scenario चुनें। Chrome ने hard-coded medical assertion, APPROVED badges, “System Verified Response (सरकारी उत्तर)” और 95/100 दिखाए। DATASET से detail सीधे render होता है और missing claim status भी approved बनता है। इस flow में current KB का provenance, expiry या withdrawal check नहीं चलता। इसे historical fixture के रूप में दिखाने या verified answer path से जोड़ने का काम बाकी है। [Explorer markup](../public/explorer.html#L127) · [Renderer](../public/explorer.js#L116) · [Browser reproduction](../artifacts/PROJECT_AUDIT_2026-11-06/targeted-browser-api.log)
2. **उच्च — PNP में omitted facts result बदलते हैं।** GET /v1/tools/pnp-pathway बिना inputs के 117 अंक और BC Tech qualifies=true देता है। POST {} उसी path पर 80 अंक और qualifies=false देता है। GET में job offer, Canadian experience और BC employer को absent होने पर true माना जाता है। ON, active EE और CRS 450 की एक call ने “High probability” भी दिखाया, जिसका calibration इस flow में नहीं है। Shared missing-input contract और verdict wording की स्वतंत्र जाँच बाकी है। [GET defaults](../src/routes/tools/immigration.js#L272) · [Advisory](../src/pnp-navigator.js#L410)
3. **मध्यम — चार publication-queue regressions clock-dependent fixtures पर टूटते हैं।** test helper वास्तविक तारीख से strictly आगे expiry वाले high-risk seeds खोजता है और housing/telecom छोड़ता है। 6 नवंबर पर 258 fresh seeds में कोई seed उस predicate से match नहीं हुआ। Queue ordering/draft, suspended-source handling, reviewer publish और non-Canada reimport tests अपने assertions तक नहीं पहुँचे। उसी file के token protection और excerpt cleanup tests पास हुए। वास्तविक DB की read-only queue ने 725 rows लौटाईं। [Fixture](../test/publish-queue.test.js#L11)
4. **मध्यम — दूसरे working directory से 20,000-question catalog खाली हो जाता है।** उसी module को repo root से import करने पर 20,000 questions मिले, TEMP से import करने पर 0। Loader process.cwd() से corpus खोजता है और missing file मिलने पर उस process में initialization पूरा मान लेता है। Repo root वाला documented start path corpus ढूँढता है। [Loader](../src/global-settlement-resolver.js#L396)

## मॉड्यूल और सेक्शन की स्थिति

| क्षेत्र | क्या सत्यापित हुआ | क्या अधूरा है |
|---|---|---|
| Ask, parser, retrieval और citations | Answer API, source guidance, ambiguity और unavailable flows, geography, lexical ranking और synthetic provider fallback पर regression evidence। | Unseen-question accuracy, claim-to-source entailment और citation usefulness की स्वतंत्र जाँच। context-1 केवल पिछला turn लेता है। rankHybrid token-frequency cosine पर है और इसके callers में केवल test मिला। |
| Immigration, employment, housing, finance, legal, settlement और international routers | सात router groups के 198 tool paths का HTTP smoke। Visitor और study-finance के खास input flows Chrome में पास। | सभी decision-driving enums, CSV, numeric bounds, date boundaries, GET/POST/UI parity, direct evaluators, statutory constants और non-Canada applicability की स्वतंत्र matrix। PNP अलग से fail। |
| Ask, Casework, Pathway, Binder, Forms, Airport, Journey, SOS, Tenancy, Compare, Cashflow, Tax, Paycheck, Banking, Driving, Careers, Healthcare, Schools, Languages, Coverage, Review | सभी 21 views खुले। Journey में Vancouver study-permit timeline, checkbox isolation और unsupported-country state जाँची। Credit simulator में 0 input पहुँचा। Help, tool directory और modal की keyboard/focus जाँच पास। | हर tool form के सभी विकल्पों, error states, contrast, zoom, assistive technologies और browser/mobile combinations की manual matrix बाकी। |
| Wizard, forms और export | Blank date rejection, unsupported-profile fallback, download और escaped print preview जाँचे। | Wizard funds calculation जानबूझकर “Not determined” देती है। Wizard inputs tools में auto-transfer नहीं होते। Non-ASCII worksheet direct PDF के बजाय browser print से export होती है। Generated worksheets के official filing parity की जाँच बाकी। |
| Accounts, plans और /manage | Local sign-in shell खुला। Account, plan gates, roles, revocation और manager changes के automated fixtures हैं। | Production identity/MFA/SSO, billing/invoices, real email delivery और live role/account rollout। |
| Editorial, public-evidence, imports और gaps | Provenance replay, corrupted chain rejection, auth, rollback/restore और coverage fixtures में evidence। वास्तविक backlog read-only पढ़ा। | Record-by-record remediation, owners, legacy reviewer attribution, source permission और independent publication approval। Fresh editorial authorization event table में इस DB snapshot पर 0 rows थीं। |
| Crawler, realtime, scheduler, queue | Worker smoke में dispatch, execution और policy denial। Realtime tests में conditional fetch, delta, policy gate और webhook fixtures। | Live crawl/provider/alert delivery, production workload और queue/schedule browser console की अलग जाँच। |
| PWA, deploy, monitoring और recovery | Fresh offline shell और online recovery Chrome में पास। Readiness, encrypted recovery, retention और monitor fixtures मौजूद। | Old-cache upgrade, mixed-assets recovery, real alert destination, protected offsite restore, representative soak, deployed TLS, multi-host quotas और service rollout का वर्तमान evidence बाकी। |

## Knowledge Base और बाकी काम

- **725 stored-approved records public-evidence gate पर withheld हैं और सभी के owner unassigned हैं।** कारण overlap करते हैं। Untrusted reviewer 539, missing/unsupported review method 293, missing approval audit 96, audit mismatch 57 और archived-evidence replay failure 4। [ताज़ा read-only backlog](../artifacts/PROJECT_AUDIT_2026-11-06/publication-backlog.json)
- **447 editorial warnings** अलग metric है। Scheduled fact-check में 212 दर्ज हैं, जिनमें 167 verified, 33 corrected और 12 human review माँगते हैं। 235 अभी unchecked हैं। 725, 447 और 235 अलग populations हैं। इन्हें जोड़कर backlog नहीं निकालना चाहिए।
- **Policy lint** ने 261 unreviewed source policies और दो awaiting-review evidence records रिपोर्ट किए। वर्तमान content gates में source permission, citation-to-claim review, jurisdiction coverage और policy dates प्रमुख खुले काम हैं।
- KB/tools के मौजूदा task register में **40 entries** हैं। 8 implemented, 12 partial और 20 pending। ये 32 खुले IDs इसी register के हैं। Operations, production और इस audit की नई findings अलग हैं। [Task register](KB_TOOLS_TASK_REGISTER.json)

## सीमाएँ

यह code review, static inventory, automated coverage, HTTP और स्थानीय Chrome audit है। Browser scripts को temporary working directory से चलाया गया, जहाँ corpus loader ने missing-file warning दी। Catalog को बाद में repo root और TEMP दोनों से अलग जाँचा। हर function branch, हर dynamic option, real credentials, production deployment और सभी immigration/tax/health rules की स्वतंत्र पुष्टि बाकी है। Working DB का निरीक्षण read-only था। रन के लिए isolated SQLite fixtures इस्तेमाल किए। Application source या DB records में बदलाव नहीं किया।
