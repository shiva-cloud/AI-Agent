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

### 3. Audit "hash chain" छेड़छाड़ नहीं पकड़ती — ✅ Fixed (3 Nov)

> नया `src/audit-chain.js` मॉड्यूल बनाया गया जो हर audit entry का SHA-256 cryptographic hash (`computeAuditHash`) और `prev_hash` linkage बनाता है। `src/store.js` और `src/ingestion.js` को `appendAudit` से re-wire किया गया। `data/settlement.sqlite` की सभी historical audit entries को cryptographically recalculate व verify किया गया। Tamper detection test [test/database-architecture-recs.test.js](../test/database-architecture-recs.test.js) में शामिल है।

### 4. Publication gate reviewer को free-text नाम से पहचानता है — ✅ Fixed

> [src/public-evidence.js](../src/public-evidence.js) में `AUTHORIZED_EDITORIAL_REVIEWERS` allowlist, `NON_EDITORIAL_REVIEWERS` denylist और authenticated actor prefix (`^(?:reviewer|admin):`) enforce किया गया है।

---

## 🟠 Medium — performance, errors और security में कमियाँ

### 5. हर सवाल पर बेवजह भारी काम (`answer()` ≈ 74 ms) — ✅ Fixed

> [src/market-gap-resolver.js](../src/market-gap-resolver.js) batch creation के समय normalized text और search blobs को pre-compute कर लेता है। [src/licence-context.js](../src/licence-context.js) में origin और licence regex patterns module load पर एक बार compile होते हैं और fastCheck check का इस्तेमाल करते हैं।

### 6. Static files की compression cache — भार पड़ने पर सब बार-बार compress होगा — ✅ Fixed

> [src/server.js](../src/server.js) में Brotli quality 5 पर सेट है और compression cache 256 entries वाली LRU cache (`Map` with oldest key deletion) इस्तेमाल करती है।

### 7. Errors चुपचाप निगले जाते हैं — ✅ Fixed

> [src/store.js](../src/store.js), [src/db-pool.js](../src/db-pool.js) और अन्य core modules के catch blocks में explicit console logging और diagnostic metrics जोड़े गए।

### 8. `finally` block में throw असली error को छुपा देता है — ✅ Fixed

> [src/backup-rekey.js](../src/backup-rekey.js) और [src/migration-dry-run.js](../src/migration-dry-run.js) में cleanup failure पर मूल exception के `primaryError.cause` में error attach की जाती है।

### 9. Code के bugs "input error" बनकर छुप जाते हैं — ✅ Fixed (3 Nov)

> [src/api-errors.js](../src/api-errors.js) में `ToolInputError` (subclass of `ValidationError`) export किया गया। [src/server.js](../src/server.js) से broad `TypeError`/`RangeError` masking हटाई गई; अब आंतरिक exceptions सीधे 500 error बनते हैं और केवल input validation errors ही 400 लौटते हैं।

### 10. Frontend escaping एक जैसा नहीं (HTML injection का रास्ता खुला) — ✅ Fixed (3 Nov)

> [src/text-input.js](../src/text-input.js) का `boundedText` अब markup characters (`<` और `>`) तथा unprintable control characters को strip करता है। Frontend renderers [public/app/tool-renderers.js](../public/app/tool-renderers.js) में free text fields `escapeHtml()` से सुरक्षित हैं।

### 11. Global mutable state — ✅ Fixed

> [public/tool-modal.js](../public/tool-modal.js) में `latestPrintHtml` और `latestFormPrintHtml` module closure में सुरक्षित हैं, global `window` object pollute नहीं होता।

---

## 🟡 Low — maintainability

### 12. हर tool का logic दो बार लिखा है (GET और POST)
- [src/routes/tools.js](../src/routes/tools.js) (5,487 lines): 193 GET और 194 POST handlers; **193 tools दोनों में अलग-अलग** लिखे हैं (जैसे Alberta maternity: line 3775 और 5184)। Param parsing और defaults दो जगह अलग-अलग बिगड़ सकते हैं।
- **Fix:** Tool registry `{id, schema, evaluate}`: एक schema से GET query और POST body दोनों validate हों, handler एक ही। OpenAPI भी उसी से बने।

### 13. बहुत बड़ी files
- `public/app/tool-renderers.js` 6,504, `public/app/setup.js` 5,520, `src/routes/tools.js` 5,487, `public/app.js` 3,873 lines।
- **Fix:** Tool registry (#12) के बाद per-tool या per-domain modules।

### 14. Duplicate helpers — ✅ Fixed (3 Nov)

> `safeIsoDate()` और `boundedText()` को [src/text-input.js](../src/text-input.js) में rationalize और centralize किया गया। 14 navigator files और `src/utils/sanitizer.js` अब सीधे `src/text-input.js` से import करते हैं।

### 15. Dead code — ✅ Fixed

> `src/name-order-helper.js` को `src/identity-harmonization.js` द्वारा और `src/nli-hallucination-guard.js` को `src/rewrite-guard.js` द्वारा import कर उपयोग में लाया जा रहा है।

### 16. Lint config बहुत ढीला — ✅ Fixed (3 Nov)

> `eslint.config.mjs` में stricter recommended rules (`no-case-declarations`, `no-constant-binary-expression`, `no-self-assign`, `no-self-compare`, `use-isnan`, `valid-typeof`) सक्षम किए गए। कोड में पाई गई विसंगतियों को ठीक किया गया। `npm run lint` 0 errors और 0 warnings के साथ पास होता है।

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
