# Northstar: गहन analysis और fix plan — 3 November 2026

Version: 0.19.49 (branch `master`, 29 modified + 16 untracked files uncommitted)। इस analysis में कोई production code नहीं बदला गया।

## 1. अभी की स्थिति (जो सही चल रहा है)

| Check | Result |
|---|---|
| `npm test` | **2,311 / 2,311 pass**, 0 fail/skip, ~86 s |
| `npm run lint` | pass |
| `npm run api:typecheck` | pass |
| `npm run api:validate` | pass (299 paths, 1,268 schemas) |
| `npm audit` (prod + dev) | 0 vulnerabilities |
| `scripts/evaluate.js` | pass, failures: [] |
| `scripts/verify-everything.js` (pre-flight) | pass |

मतलब: automated checks हरे हैं। नीचे की problems वो हैं जो tests **नहीं पकड़ते**।

## 2. Problems — severity के हिसाब से

### P0-1. Data loss risk: कोई git remote नहीं, KB database git में नहीं
- `git remote -v` खाली है; `main` branch भी मौजूद नहीं (सिर्फ `master`)। `.github/workflows/*` (CI, CVE audit, verify) **कभी चलते ही नहीं**।
- `data/settlement.sqlite` (906 records, पूरा knowledge base) `.gitignore` में है। `backups/offsite-test` और `backups/encrypted-test` उसी laptop disk पर हैं — यह offsite backup नहीं है।
- पिछले कई remediation batches (29 modified + 16 new files) अभी commit नहीं हुए।
- **असर:** एक disk failure / गलत delete = पूरा code history + KB खत्म।

**Fix:**
1. मौजूदा working tree को एक commit में डालो (tests पहले से green हैं)।
2. Private GitHub repo बनाओ, `main` branch बनाकर push करो — इससे CI अपने-आप चलने लगेगा।
3. `npm run backup` → encrypted backup को सच में offsite (cloud bucket / दूसरी drive) भेजो; `npm run restore-drill` से restore verify करो।

### P0-2. Bug: सवाल में 80,100–86,000 के बीच कोई भी number हो तो सही जवाब गायब — ✅ Fixed (3 Nov)

> Fix: तीनों resolvers में free-text ID अब सिर्फ `GMS-MKT-Q` prefix के साथ match होता है; सिर्फ number वाला input पहले जैसा काम करता है। Regression test: `test/catalog-id-numbers.test.js`। 1,000–200,000 का scan अब 0 hijack दिखाता है; full suite 2,314/2,314 pass।
- `src/market-gap-batch{1,2,3}-resolver.js` में ID regex `\b(?:GMS-MKT-Q)?(8[0-1]\d{3}|82000)\b` (और batch2/3 के ranges) free-text सवाल के **किसी भी** 5-digit number को catalog ID मान लेता है।
- `src/engine.js:324-327` ये resolvers हर `/v1/answers` सवाल पर चलाता है और match मिलते ही normal parser skip हो जाता है।
- **Reproduce किया (real DB, 906 records):**
  - "How do I rent an apartment in Toronto?" → `guidance`, city Toronto, housing, 2 claims ✅
  - "My salary is 80500, how do I rent an apartment in Toronto?" → `unavailable`, country **China**, intent `application_portal`, 0 claims ❌
  - "My salary is 84500, ..." → country **Colombia**, 0 claims ❌
  - 1,000–200,000 तक scan किया: hijack range **80,100–86,000**। Canada में $80k–86k salary बहुत common है, इसलिए असली users पर असर पड़ेगा।

**Fix:**
1. Free-text में ID तभी मानो जब explicit prefix हो (`GMS-MKT-Q80500`), या पूरा input सिर्फ number हो। Bare number वाला branch हटा दो।
2. `answer()` में catalog lookup सिर्फ explicit `marketGapId` / `questionBankId` / `gmsId` field से हो, `input.question` से नहीं — या कम से कम normal parse को प्राथमिकता दो।
3. Regression test: salary/amount वाले सवाल (80500, 84500, 85999) का parse `english-rules-*` रहे और Toronto housing claims लौटें।

### P1-1. Content correctness: 6,000 catalog entries में गलत देश का कानून — ✅ Fixed (3 Nov)

> `src/market-gap-catalog.js`: तीनों `/v1/market-gap/*` routes अब `statutoryRule`/`citation`/`verdict` नहीं भेजते; `reviewStatus: unreviewed_template`, `withheld` और `notice` भेजते हैं। OpenAPI और client regenerate। "zero-hallucination" दावे code comments से हटाए। (Catalog → JSON refactor अभी बाकी है।)
- तीनों market-gap files (~7 MB, हर एक ~22,000 lines) templated हैं: 10 scenarios × 78 देश, और एक scenario का `statutoryRule`/`citation` हर देश के लिए **एक जैसा**।
- 6,000 में से **4,752 non-Canada entries** Canadian IRPR/IRPA cite करती हैं। उदाहरण: Osaka, Japan वाले सवाल (id 80093) का जवाब "IRPR s. 183(5); Migration Act 1958; UK Immigration Act 1971"।
- File header दावा करता है "Complete zero-hallucination statutory resolution" — यह गलत दावा है।
- Response पर `X-Evidence-Status: unreviewed-research-catalog` header है, लेकिन JSON body में `statutoryRule` / `verdict` authoritative लगते हैं।

**Fix:**
1. `/v1/market-gap/*` responses से `statutoryRule`, `citation`, `verdict` तब तक हटाओ/छुपाओ जब तक entry country-specific review न हो; सिर्फ question + scenario + "unreviewed" status दिखाओ।
2. "zero-hallucination" जैसे दावे code comments, docs और API descriptions से हटाओ।
3. Long-term: 22k-line JS files को एक JSON data file (scenario template + country table) में बदलो और जवाब सिर्फ country-specific reviewed source से बनाओ। इससे ~7 MB duplication खत्म होगी और startup memory भी घटेगी।

### P1-2. Docker image खाली KB के साथ start होता है — ✅ Fixed (3 Nov)

> असल में fresh DB सिर्फ 258 built-in seeds के साथ खुलता था (633 approved records गायब)। `npm run release:db` → `release/settlement.sqlite`; image इसे `SEED_DB_PATH` से खाली volume में copy करता है, मौजूदा DB कभी overwrite नहीं होता। Approved records न हों तो startup warning। Docker build + container में verify: 906 records seed, `/ready` 200।
- `Dockerfile` में `DB_PATH=/app/data/settlement.sqlite` एक खाली volume पर है; image में न DB है, न seed step। Fresh container सारे सवालों पर gaps लौटाएगा (README का local container test पहले से मौजूद DB के साथ हुआ था)।

**Fix:** release artifact के तौर पर verified DB snapshot copy करने वाला init step (या `scripts/migrate.js --seed`) जोड़ो, और `/ready` तब तक 503 दे जब records = 0 हों।

### P1-3. TEST_MODE की production guard सिर्फ `NODE_ENV` पर निर्भर — ✅ Fixed (3 Nov)

> `assertTestModeAllowed()` (`src/runtime-config.js`): loopback HOST ज़रूरी, HTTPS PUBLIC_ORIGIN और production मना। तीन duplicate checks हटाए। Tests जोड़े।
- `src/server.js:6354-6360`: `TEST_MODE=1` एक public admin account बनाता है (`/v1/test-mode` उसका password लौटाता है)। Guard सिर्फ `NODE_ENV==='production'` check करता है। अगर किसी server पर `NODE_ENV` set नहीं है (PM2 का default `env` block `development` है), तो public admin internet पर खुल सकता है।
- यही check तीन बार दोहराया गया है (lines 6313, 6314, 6355)।

**Fix:** TEST_MODE तभी allow हो जब `HOST` loopback हो और `PUBLIC_ORIGIN` https न हो; duplicate lines हटाओ; इसका test लिखो।

### P2-1. Maintainability: बहुत बड़ी files
- `public/app.js` = **24,975 lines** (282 `innerHTML` sinks), `src/server.js` = **6,381 lines** (~500 inline route checks एक ही handler में)।
- Escaping और CSP (`script-src 'self'`, बिना `unsafe-inline`) की वजह से XSS अभी mitigated है (spot-check में user text `textContent` से जाता है) — लेकिन 282 sinks review करना मुश्किल है और नए bug आसानी से आएँगे।

**Fix (धीरे-धीरे, हर step पर full test suite):**
1. `server.js` → route table (`{method, pattern, handler}`) + `src/routes/{v1,tools,admin,manage}.js`।
2. `app.js` → हर view का अपना module (पहले से `answer-view.js`, `tool-modal.js` जैसे बने हैं — उसी pattern पर)।
3. ESLint में `no-unsanitized`-जैसा custom rule या `innerHTML` पर `warn` ताकि नए sinks दिखें।

### P2-2. Backend lint में `no-undef` बंद है — ✅ Fixed (3 Nov)

> Backend पर `no-undef: error`; missing Node globals जोड़े; `scripts/browser-*.mjs` को browser globals। Lint green।
- Browser code पर `no-undef` चालू है, backend पर नहीं। Chalaane पर 64 errors आए — सब `test/` और `scripts/browser-*.mjs` में (missing `Response`/`ReadableStream` globals और `page.evaluate` के अंदर browser code)। `src/` clean है।

**Fix:** `nodeGlobals` में `Response`, `Request`, `Headers`, `ReadableStream`, `Blob`, `FormData` जोड़ो; browser-script files के लिए अलग globals block; फिर backend पर `no-undef: error`।

### P2-3. छोटे code issues — ✅ Fixed (3 Nov)

> चारों fix: encoding, repeated query keys, duplicate dispatch stage, CRLF → LF (working tree)।
- `src/server.js:6342` error message में टूटा encoding: `0â€“1000` (होना चाहिए `0–1000`)।
- `src/server.js:311`: tool requests पर `url.searchParams.set()` loop repeated query keys (`?a=1&a=2`) को collapse कर देता है।
- `observability.stage(res,'dispatch')` दो बार call होता है (lines ~396 और ~404)।
- Git warning: `scripts/api-response-schemas.js`, `scripts/export-openapi.js`, `scripts/archive/README.md` working tree में CRLF हैं जबकि `.gitattributes` LF माँगता है — `git add --renormalize .`।

### P3. Repo / docs hygiene
- `docs/` में 78 files, जिनमें ~20 dated audit/status reports (`*_2026-10-31`, `*_2026-11-01`, ...) — कौन सा current है, समझना मुश्किल।
- README stale: "258 English research records" लिखा है, DB में 906 हैं; "No general-purpose LLM" लिखा है जबकि `ai-router.js`/`anyrouter.js` मौजूद हैं।
- `scripts/` में 150 files, जिनमें ~48 one-off (`run-*`, `inject-*`, `find-*`, `print-*`, `debug-*`)।
- `test/` में 40 `batchN-recommendations.test.js` — नाम से पता नहीं चलता क्या test हो रहा है।
- Disk: `backups/` 1.4 GB, `artifacts/` 336 MB (263 files), `data/backups` 179 MB, `project-bundle.zip` 12 MB।

**Fix:** dated reports `docs/archive/` में; एक `docs/STATUS.md` single source of truth; README numbers script से generate करो (`kb:health` output); one-off scripts `scripts/archive/` में; पुराने artifacts prune करो (backups offsite जाने के बाद)।

### Open (software से solve नहीं होगा)
- 589-record editorial-provenance backlog को इंसानी reviewer चाहिए।
- Legal/statutory content की independent domain review।
- Live AI provider, billing, production deployment, TLS ingress, real offsite recovery — असली configuration चाहिए।

## 3. Execution plan (क्रम से)

| Phase | काम | Done का मतलब | अनुमानित समय |
|---|---|---|---|
| **0 — Safety (आज)** | Working tree commit; private remote + `main` push; encrypted backup offsite + restore drill | Remote पर code, CI green, restore verified | 1–2 घंटे |
| **1 — Critical bug** | P0-2 numeric-ID hijack fix + regression tests | 80100–86000 scan में 0 hijack; full suite green | 2–3 घंटे |
| **2 — Correctness/safety** | P1-1 catalog fields hide + दावे हटाना; P1-3 TEST_MODE guard; P1-2 Docker seed + `/ready` record check | API में गलत-देश citation नहीं; tests जोड़े | 1 दिन |
| **3 — Quality gates** | P2-2 backend `no-undef`; P2-3 छोटे fixes; CRLF renormalize | Lint stricter और green | 2–3 घंटे |
| **4 — Refactor** | P1-1 catalog → JSON data; P2-1 server routes split, फिर app.js views split | हर step पर 2,311+ tests green, कोई API change नहीं | 1–2 हफ्ते (incremental) |
| **5 — Hygiene** | P3 docs/scripts/tests/artifacts cleanup, README auto-numbers | एक current status doc; repo size कम | 1 दिन |
| **6 — Human/external** | Editorial backlog, domain review, production infra | Reviewer sign-off; deploy checklist (`docs/PLAN.md`) पूरी | बाहरी निर्भरता |

## 4. Verification commands (हर phase के बाद)

```bash
npm test
npm run lint
npm run api:validate && npm run api:typecheck
node scripts/evaluate.js
node scripts/verify-everything.js
```

## 5. Progress — 3 November 2026 (pending work)

- ✅ **Catalog → JSON:** तीनों market-gap resolvers (हर एक ~22,000 lines) अब ~30 lines के हैं। Data `src/market-gap/batch{1,2,3}.json` में है और lookup/search/stats एक shared `src/market-gap-resolver.js` में। पुराने और नए resolver का 24,225 inputs पर equivalence check पास हुआ। `scripts/generate-market-gap-batch3.mjs` अब JSON लिखता है (byte-identical output)।
- ✅ **server.js split (पहला step):** question-bank, market-gap और global-settlement routes `src/routes/catalog.js` में। `server.js` 6,381 → 6,265 lines। `docs/openapi.json` byte-identical रहा। `test/api-inventory.test.js` अब `src/routes/` भी scan करता है।
- ✅ **Docs:** 31 Oct–2 Nov की 14 dated reports `docs/archive/` में; references अपडेट; नया `docs/README.md` index; कोई broken link नहीं।
- ✅ **Scripts:** 26 one-off scripts (AI transcripts पढ़ने वाली, source को string-patch करने वाली, एक बार DB में inject करने वाली) `scripts/archive/` में, कारण archive README में। Active scripts 150 → 125।
- Verification: tests 2,316/2,316, lint, API validate/typecheck, evaluate, pre-flight, browser view smoke (0 page errors) — सब pass।

### अभी भी बाकी
- `ingest-*` scripts भी `src/` files को patch करते हैं; उन्हें archive या data-only बनाना है।
- `backups/` (1.4 GB), `artifacts/` (336 MB), `data/backups` (179 MB) prune करना — पहले offsite backup, फिर आपकी मंज़ूरी से delete।
- Human/external: editorial backlog, legal review, production infra, git remote।

## 6. Progress — server.js routes split

- ✅ `/v1/tools/*` (GET + POST, 194 tools) → `src/routes/tools.js`; `/admin/*` → `src/routes/admin.js`। Statements verbatim AST से निकाले गए; हर handler `true` लौटाता है जब उसने जवाब दिया।
- `src/server.js`: **6,381 → 741 lines** (अब सिर्फ security, quota, accounts, auth, public `/v1` routes और error handling)।
- `/v1/manage/*` पहले से `src/manage-api.js` में delegate होता है — अलग करने की ज़रूरत नहीं।
- Bug पकड़ा और ठीक किया: `src/manage-api.js` admin panel की tool list `server.js` के text से बनाता था; अब `src/routes/` भी पढ़ता है (194 = 194 tools)।
- Source पढ़ने वाले tests के लिए shared helper `test/route-sources.js`।
- Verification: tests 2,316/2,316, lint, OpenAPI byte-identical, typecheck, evaluate, pre-flight, browser view smoke + modal safety, Docker container probe — सब pass।

## 7. Progress — public/app.js split

- ✅ `public/app.js`: **24,975 → 3,862 lines**। 270 declarations (21,003 lines) `public/app/` में: `core.js` (helpers), `data.js`, `command-directory.js`, `renderers.js`, `tool-renderers.js`, `setup.js`।
- तरीका: TypeScript AST से dependency graph; सिर्फ वही हिस्से हटाए जो app.js की state (let variables) पर निर्भर नहीं और जिनका data बिना function call के बनता है — इसलिए circular import या load-order का खतरा नहीं। 529/529 statements verbatim (सिर्फ `export` जोड़ा)।
- Server `/app/*.js` serve करता है (`src/app-modules.js`), SRI manifest में शामिल, service worker v39 इन्हें precache करता है; नया test यह सूची पूरी रखता है।
- छुपे gaps ठीक किए: wording-guard test अब `src/routes/` और `public/app/` भी scan करता है; app.js text पढ़ने वाले 9 tests shared `test/app-source.js` पर; transitive-import tests अब `../` paths सही resolve करते हैं।
- Verification: tests 2,317/2,317, lint (no-undef सहित), OpenAPI byte-identical, pre-flight, browser view smoke + modal safety + offline/service-worker + command palette (178 tools, search) — सब pass।

## 8. Progress — inline styles और CSP

- ✅ index.html, tool-modal.js और app templates के सारे `style=""` हटाए (`scripts/convert-inline-styles.js`): 1,917 static attributes → `data-s` keys + generated `public/inline-styles.css` (358 rules, specificity (2,1,0) ताकि inline जैसा ही cascade रहे); 150 computed/`display:none` → `data-style`, जिन्हें `csp-styles.js` पहले की तरह CSSOM से लगाता है।
- ✅ Bug ठीक किया: 2 "Copy Letter" और 2 "View & Print" buttons inline `onclick` की वजह से CSP से blocked थे (काम नहीं करते थे); अब delegated listeners। Browser में click करके verify: clipboard में text, print window खुली।
- नतीजा: सारे 22 views में **CSP errors 1,964 → 0**; 10,204 elements × 44 computed CSS properties पहले/बाद **0 फर्क**।
- नए tests: templates में कोई inline `style=`/`on*=` नहीं; हर `data-s` key का rule मौजूद; stylesheet linked।
- Verification: tests 2,318/2,318, lint, pre-flight, browser view smoke + modal safety + offline — सब pass।

## 9. Progress — explorer page और data scripts

- ✅ Explorer page: `csp-styles.js` load नहीं होता, इसलिए इसके 13 inline styles browser चुपचाप ignore कर रहा था (बिगड़ा layout)। अब `explorer.css` की named classes; CSP errors 0; template values escaped, source links सिर्फ http(s)।
- ✅ 12 data scripts `scripts/archive/` में (कारण archive README में): 10 `ingest-*` (records overwrite + मनगढ़ंत reviewer नाम से audit entries), `run-policy-audit.js` (हर record की checkedAt/expiry बिना जाँच "verified" लिखकर आगे बढ़ाना, सारे gaps resolve), `normalize-checked-date.js` (बिना audit dates बदलना)। नया guard test `test/script-provenance.test.js`।
- ✅ **फैसला लागू (आपकी मंज़ूरी से):** `src/public-evidence.js` अब `NON_EDITORIAL_REVIEWERS` (script के बनाए दो नाम, और "automated correction, not editorial review") वाली audit entries को editorial approval नहीं मानता। 191 high-risk records जवाबों से रोके गए: 184 script-approvals + 7 जो KB-correction script की entries से published थे (उनका अपना label कहता था कि यह editorial review नहीं है)। अब published high-risk: सिर्फ 45 `source_verified`। 12 आम सवालों के नमूने में 4 अब "unavailable" और 1 "partial"। किसी असली reviewer के admin review endpoint से approve करते ही record फिर publish होगा। चलता हुआ server restart करना होगा (gate का नतीजा cached रहता है)।
- Verification: tests 2,320/2,320, lint, pre-flight, evaluate, browser checks — सब pass।

## 10. Progress — global-settlement catalog और disk inventory

- ✅ `/v1/global-settlement` (20,000 entries): हर `statutoryRule` एक country-template है, authority/link question नहीं बल्कि country से चुने गए (जैसे US photo ID को USCIS के अंदर बताया), और citation का एक हिस्सा मनगढ़ंत label है। अब API सिर्फ question fields देता है; `statutoryRule`, `citation`, `verdict`, `authority`, `url` withheld (`src/market-gap-catalog.js`)। OpenAPI और client regenerate। Question-bank batch 2/3 हाथ से लिखे, specific case-law वाले हैं — बदले नहीं।
- Disk inventory (कुछ delete नहीं किया):
  - ✅ `backups/offsite-test` 376 MB — तीनों files `backups/encrypted-test` की byte-for-byte copies थीं (`cmp` से दोबारा पुष्टि); आपकी मंज़ूरी से 3 Nov को delete। Originals `encrypted-test` में सुरक्षित।
  - `backups/encrypted-test` 569 MB — 4 encrypted snapshots (1 Nov)।
  - `backups/archive-kb-audit-2026-11-01` 464 MB और `data/backups` 179 MB — KB corrections से पहले के DB snapshots (rollback सबूत; `kb-corrections` script और docs इन्हें बताते हैं)।
  - `artifacts/` 336 MB — validation reports, कई docs में सबूत के तौर पर linked।
  - `project-bundle.zip` 12 MB, `release/` 90 MB (Docker build input, दोबारा बन सकता है)।
- Verification: tests 2,326/2,326, lint, evaluate, pre-flight, npm audit 0, browser checks — सब pass।
