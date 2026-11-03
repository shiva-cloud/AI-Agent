# Northstar: coding issues की पूरी list — 3 November 2026

Version 0.19.50 (HEAD `cab9338` + uncommitted काम)। यह analysis है, इस दौरान कोई code नहीं बदला गया। हर issue को चलाकर या code पढ़कर verify किया गया है।

## पहले: क्या ठीक है

| Check | नतीजा |
|---|---|
| `npm test` | 2,326 / 2,326 pass |
| Lint (project config), OpenAPI validate, typecheck | pass |
| `npm audit` | 0 vulnerabilities |
| Tool routes का fuzz test: 3,096 hostile calls (गलत type, बहुत बड़ा number, खाली value, HTML) | **0** server errors (5xx), **0** responses में NaN/undefined जैसा garbage |
| SQL | कहीं भी string जोड़कर query नहीं बनती; सब prepared statements |
| Admin token compare | `timingSafeEqual` |

नीचे की problems वो हैं जो tests नहीं पकड़ते।

---

## 🔴 High — गलत नतीजे या भरोसे की कमी

### 1. "आज की तारीख" code में hardcoded है — समय के साथ गलत जवाब — ✅ Fixed (3 Nov)

> नया `todayIso()` ([src/text-input.js](../src/text-input.js)), जिसे `NORTHSTAR_TODAY` से pin किया जा सकता है। 154 files में 356 fixed "as-of" defaults (`assessmentDate`, `currentDate`, `referenceDate`…) और `safeIsoDate` के fallbacks अब इसी से चलते हैं। साथ में मिला bug ठीक किया: `canada-status-admissibility` के GET और POST routes caller की `assessmentDate` गिरा देते थे। Tests: [test/as-of-date.test.js](../test/as-of-date.test.js) (H-1B: 3 Nov को 11 दिन, 20 Nov को inactive)। पुराने 25 assertions अब fallback = आज मानते हैं।
- **कहाँ:** 147 navigator files में 204 जगह `assessmentDate = '2026-10-31'` जैसे defaults (उदाहरण: [src/us-h1b-opt-navigator.js:18](../src/us-h1b-opt-navigator.js)); [src/routes/tools.js](../src/routes/tools.js) में 87 और fixed dates (48 बार `'2026-10-31'`)।
- **असर:** 193 GET tool routes में से **113 कोई date param लेते ही नहीं**, इसलिए वे हमेशा 31 Oct 2026 के हिसाब से गिनती करते हैं।
- **Verify किया:** H-1B tool में `lastWorked=2026-09-15` डाला। Deadline 14 Nov है। आज (3 Nov) के हिसाब से 11 दिन बचे हैं, पर tool **14 दिन** बताता है। 14 Nov के बाद भी यह "grace period active" बताएगा।
- **Fix:** एक shared `today()` helper (server clock से), सारे defaults उसी पर। जहाँ तारीख ज़रूरी है वहाँ input न हो तो 400 लौटाएँ। Test में clock inject करें।

### 2. Input न हो तो tools मनगढ़ंत values मान लेते हैं — user को बताए बिना — ✅ Fixed (3 Nov)

> Server हर tool request पर देखता है कि tool ने कौन से inputs पढ़े जो caller ने दिए ही नहीं थे (`trackQuery`/`trackBody` in [src/tool-input.js](../src/tool-input.js)), और successful response में `assumedInputs` + `assumptionNotice` जोड़ता है। 387 routes में कोई बदलाव नहीं करना पड़ा; 388 OpenAPI schemas में ये optional fields जोड़े। UI: tool modal और app views के 81 renderers पीला "Based partly on default values" notice दिखाते हैं। बिना input के 381 routes अब यह notice देते हैं। Defaults अभी भी मौजूद हैं (UI flows उन पर टिके हैं), पर अब छुपे नहीं हैं। Tests: [test/assumed-inputs.test.js](../test/assumed-inputs.test.js); GET/POST parity tests यह request-metadata compare नहीं करते।
- **कहाँ:** GET tool routes में **663 numeric defaults**, जैसे `salary → 80000`, `savings → 25000`, `landingDate → '2024-01-01'` ([src/routes/tools.js:348](../src/routes/tools.js))।
- **असर:** Field खाली छूट जाए तो नतीजा किसी काल्पनिक इंसान का होता है, पर दिखता असली assessment जैसा है।
- **Fix:** ज़रूरी fields न हों तो 400 + field list; या response में `assumedInputs` लौटाएँ और UI में साफ़ दिखाएँ।

### 3. Audit "hash chain" छेड़छाड़ नहीं पकड़ती
- **कहाँ:** [src/store.js:139](../src/store.js) `verifyAuditChainIntegrity()` hash दोबारा calculate ही नहीं करता, सिर्फ `prev_hash` की linkage देखता है। Content बदल दें तो पता नहीं चलेगा।
- **Coverage:** 2,335 audit entries में से **2,025 का hash है ही नहीं**। [src/ingestion.js:129](../src/ingestion.js), [:183](../src/ingestion.js), [:216](../src/ingestion.js) (मुख्य approval pipeline) hash लिखते ही नहीं; सिर्फ `store.review()` लिखता है।
- **क्यों मायने रखता है:** Publication gate audit entries पर ही भरोसा करता है।
- **Fix:** एक ही `appendAudit()` function, जिसे हर writer इस्तेमाल करे और जो chain बनाए। Verifier हर entry का hash दोबारा calculate करे। पुरानी entries के लिए backfill करके checkpoint रखें।

### 4. Publication gate reviewer को free-text नाम से पहचानता है
- **कहाँ:** [src/public-evidence.js](../src/public-evidence.js)। कोई भी approved audit entry, जिसमें reviewer और note भरे हों, record publish कर देती है। अभी script के बनाए नाम एक denylist (`NON_EDITORIAL_REVIEWERS`) से रोके गए हैं, पर नया नाम लिखकर कोई भी इसे bypass कर सकता है।
- **Fix:** Audit में authenticated actor का id रखें (admin actors / accounts से)। Gate तभी publish करे जब actor के पास reviewer role हो। Denylist की जगह allowlist।

---

## 🟠 Medium — performance, errors और security में कमियाँ

### 5. हर सवाल पर बेवजह भारी काम (`answer()` ≈ 74 ms)
CPU profile में:
- **~37%** [src/market-gap-resolver.js:10](../src/market-gap-resolver.js) `normalizeText`: substring step हर सवाल पर 6,000 catalog questions को दोबारा normalize करता है। **Fix:** normalized text load के समय एक बार बना लें।
- **17.6%** [src/licence-context.js:51](../src/licence-context.js) `originCountryContext`: हर call पर ~200 देश × 12 = **~2,400 RegExp नए compile** होते हैं। **Fix:** patterns module load पर एक बार बनाएँ।
- दोनों fix से latency आधे से कम होने की उम्मीद है (अनुमान है, मापा नहीं गया)।

### 6. Static files की compression cache — भार पड़ने पर सब बार-बार compress होगा
- **कहाँ:** [src/server.js](../src/server.js) static handler। Brotli default quality पर पहली बार 110–470 ms प्रति file लेता है (`/` 466 ms, `tool-renderers.js` 329 ms)। Cache 64 entries पर **पूरी साफ़** (`clear()`) हो जाती है।
- **असर:** ~34 static files × br/gzip ≈ 68 entries। Mixed clients होने पर cache बार-बार साफ़ होगी और compression बार-बार होगा।
- **Fix:** Startup पर एक बार precompress करें (files fixed हैं), या LRU cache + कम quality (4–5)।

### 7. Errors चुपचाप निगले जाते हैं
- `src/` और `public/` में **32 खाली `catch {}`**, जैसे [src/store.js](../src/store.js) में 7 (FTS index बनाना या update करना fail हो तो कोई संकेत नहीं), `db-pool.js` में 2, `jobs.js`, `recovery.js` वगैरह।
- आज search index sync में है (906/906), पर बिगड़ा तो पता नहीं चलेगा।
- **Fix:** कम से कम log या metric; FTS failure को readiness में दिखाएँ।

### 8. `finally` block में throw असली error को छुपा देता है
- [src/backup-rekey.js:48](../src/backup-rekey.js) और [src/migration-dry-run.js:28](../src/migration-dry-run.js): cleanup fail हुआ तो असली error की जगह cleanup का error दिखेगा।
- **Fix:** Cleanup error को original error के `cause` या `AggregateError` में जोड़ें।

### 9. Code के bugs "input error" बनकर छुप जाते हैं

> **3 Nov का सबूत:** Phase 1 में बीच में एक गलती (`Object.fromEntries(url.searchParams)` पर `TypeError`) हर request पर "400 invalid_field_value" बनकर सामने आई। Fuzz test में 0 server errors दिखे; गलती सिर्फ एक दूसरे test से पकड़ में आई।
- [src/server.js](../src/server.js) catch: tool route में कोई भी `TypeError` या `RangeError` (जैसे `undefined.x`) → 400 "input error"। Log होता है, पर client और monitoring के लिए असली bug user की गलती जैसा दिखता है।
- **Fix:** Validation के लिए अलग `ToolInputError` class; बाकी exceptions 500 दें।

### 10. Frontend escaping एक जैसा नहीं (HTML injection का रास्ता खुला)
- API के fields बिना `escapeHtml` के `innerHTML` templates में जाते हैं, लगभग **400 जगह**:
  - `public/app/tool-renderers.js`: 177
  - `renderers.js`: 105
  - `app.js`: 96
  - `setup.js`: 21
  - इनमें कुछ numbers और booleans हैं, जिनसे खतरा नहीं।
- Server free-text echo करता है: EI tool को `applicantName='<img src=x onerror=…><b>Bold</b>'` भेजा तो वही वापस आया, और [tool-renderers.js:5660](../public/app/tool-renderers.js) उसे `innerHTML` में डालता है।
- **अभी का बचाव:** CSP (`script-src 'self'`) script नहीं चलने देती, और जाँचा गया UI form यह field भेजता नहीं। फिर भी markup injection मुमकिन है।
- **Fix:** `tool-modal.js` जैसा `html` tagged template जो default से escape करे; सारे renderers उसी पर। Navigators में `boundedText` markup characters भी हटाए।

### 11. Global mutable state
- `window._latestPrintHtml` / `window._latestFormPrintHtml` ([public/tool-modal.js](../public/tool-modal.js)) — कोई भी script इसे बदल सकती है, और फिर print window में वही HTML `document.write` होगा।
- **Fix:** Module के अंदर का variable, या button पर data reference।

---

## 🟡 Low — maintainability

### 12. हर tool का logic दो बार लिखा है (GET और POST)
- [src/routes/tools.js](../src/routes/tools.js) (5,487 lines): 193 GET और 194 POST handlers; **193 tools दोनों में अलग-अलग** लिखे हैं (जैसे Alberta maternity: line 3775 और 5184)। Param parsing और defaults दो जगह अलग-अलग बिगड़ सकते हैं।
- **Fix:** Tool registry `{id, schema, evaluate}`: एक schema से GET query और POST body दोनों validate हों, handler एक ही। OpenAPI भी उसी से बने।

### 13. बहुत बड़ी files
- `public/app/tool-renderers.js` 6,504, `public/app/setup.js` 5,520, `src/routes/tools.js` 5,487, `public/app.js` 3,873 lines।
- **Fix:** Tool registry (#12) के बाद per-tool या per-domain modules।

### 14. Duplicate helpers
- `safeIsoDate` **14 files** में अलग-अलग लिखा है; `escapeHtml` 2 और `normalizeText` 2 जगह।
- **Fix:** एक shared `text-input.js` / `dates.js` से import करें।

### 15. Dead code
- [src/name-order-helper.js](../src/name-order-helper.js) और [src/nli-hallucination-guard.js](../src/nli-hallucination-guard.js) को कोई import नहीं करता।
- **Fix:** हटाएँ, या जहाँ इस्तेमाल होना था वहाँ जोड़ें। "NLI" नाम capability से बड़ा है।

### 16. Lint config बहुत ढीला
- Project सिर्फ ~10 rules चलाता है। ESLint के core recommended rules से:
  - `no-empty` 32
  - `no-useless-escape` 7
  - `no-irregular-whitespace` 6 ([public/editorial.js:36](../public/editorial.js))
  - `no-control-regex` 3
  - `no-promise-executor-return` 3 ([src/request-body.js:29](../src/request-body.js))
  - `no-extra-boolean-cast` 3
  - `no-case-declarations` 2 ([src/manitoba-employment-leave-job-protection-navigator.js:103](../src/manitoba-employment-leave-job-protection-navigator.js))
  - `no-unsafe-finally` 2 (#8)
- **Fix:** `@eslint/js` recommended अपनाएँ; यही लगभग 60 जगह ठीक करें।

### 17. Data JavaScript source में
- [src/global-records.js](../src/global-records.js), `knowledge.js`, `glossary-concepts.js`, `insider-immigration-records.js` में records code की तरह लिखे हैं (`src/` में 300 chars से लंबी 679 lines, ज़्यादातर इन्हीं में)। पुरानी scripts इन्हें string-patch करती थीं।
- **Fix:** JSON / seed files में ले जाएँ (market-gap की तरह), schema validation के साथ।

### 18. Tests की कमज़ोरियाँ
- 11 tests source text पर regex चलाते हैं (refactor पर टूटते हैं या चुपचाप बेअसर हो जाते हैं; इस हफ्ते wording-guard में ऐसा हुआ था)।
- 45 test files के नाम `batchN-recommendations` जैसे हैं — नाम से पता नहीं चलता कि क्या test होता है।
- कुछ tests `artifacts/` में files लिखते हैं (side effect)।
- **Fix:** Behaviour tests को प्राथमिकता; files का नाम feature पर; tests temp dir में लिखें।

### 19. CI कभी नहीं चलता
- `.github/workflows` बने हुए हैं, पर git remote नहीं है, इसलिए CI कभी trigger नहीं होता।
- **Fix:** Remote बनाकर push करें (आपके account से)।

---

## सुझाया गया क्रम

| Phase | Issues | कारण |
|---|---|---|
| 1 | #1, #2 | Users को अभी गलत नतीजे जा रहे हैं |
| 2 | #3, #4 | Publication का भरोसा इन्हीं पर टिका है |
| 3 | #5, #6, #8, #9 | छोटे, सुरक्षित और मापे जा सकने वाले fixes |
| 4 | #10, #11, #7 | Frontend safety और observability |
| 5 | #12 → #13, #14, #15, #17 | Tool registry पहले, बाकी cleanup उसके बाद आसान होगा |
| 6 | #16, #18, #19 | Quality gates |
