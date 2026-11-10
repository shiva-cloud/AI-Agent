# Settlement Intelligence — कोड और QA ऑडिट

6 नवंबर 2026 · स्थानीय working tree · package version 0.19.74

## दायरा और तरीका

369 source files, 404 test files और 37 public files का inventory लिया। Server, API routes, validation, command palette, forms, service worker, CI, persistence और release configuration के प्रमुख paths पढ़े। स्थानीय HTTP server और in-memory SQLite पर edge cases दोहराए। यह पूरे प्रोजेक्ट का जोखिम-आधारित ऑडिट है। हर function का line-by-line sign-off, सभी jurisdictions का कानूनी सत्यापन, production load, authenticated penetration test और browser/device matrix अभी शेष हैं। KB सामग्री अलग है। इस ऑडिट में application code संपादित नहीं किया।

## P1 — रिलीज से पहले ठीक करें

### 1. Command palette से 15 tools HTTP 404 देते हैं

59 अलग modal IDs में 22 के लिए dedicated form नहीं मिला। Modal इनका fallback form बनाता है, फिर ID से API URL बनाता है। स्थानीय HTTP परीक्षण में 15 fallback URLs पर 404 मिला। IDs:

- c11-entrepreneur, alberta-maternity-parental, ontario-urgent-repairs-t6, bc-illness-injury-leave, francophone-mobility-c16
- bowp-pr-aor, c12-professional-fta, bc-security-deposit-double, start-up-visa-peer-review, saskatchewan-security-deposit
- alberta-periodic-tenancy-termination, super-visa-medical-insurance, caregiver-pr-experience, bc-dispute-resolution-urgency, study-permit-off-campus-work

बाकी सात HTTP 200 देते हैं लेकिन fallback केवल Province पूछता है। उदाहरण BC overtime banking और Ontario employment reprisal। सफल HTTP response वास्तविक user facts की पुष्टि नहीं करता।

साक्ष्य [modal fallback](../public/tool-modal.js#L853), [endpoint selection](../public/tool-modal.js#L921), [command registry](../public/app/command-directory.js)।

सुधार: हर visible command के लिए canonical endpoint और form घोषित करें। Modal उसी endpoint को पढ़े जिसका contract test उपयोग करता है। पहले 15 broken IDs, फिर सात incomplete forms। स्वीकृति: palette में प्रत्येक tool खोलें, वास्तविक inputs भरें, submit करें और दर्ज inputs से बदलता result सत्यापित करें।

### 2. BC uniform deductions में गलत verdict और परस्पर विरोधी रकम

- GET ?tillShortage=false → HTTP 200 और compliant। POST {"deductedForTillShortage":"false"} → HTTP 200 और breach। JS truthiness ने string को true माना।
- GET ?uniformFee=invalid → HTTP 200, $0 और compliant। अमान्य रकम को शून्य बना दिया गया।
- Evaluator में requiresSpecialClothingOrUniform=false और uniformCostOrDepositChargedCad=50 → compliant, शून्य violations, लेकिन totalUnlawfulDeductionsCad=50। कुल में वह रकम भी जुड़ी जिसे उस शाखा ने unlawful classify नहीं किया।
- Boolean true और रकम दर्ज न होने पर remedy $0 का refund बताती है। घोषित deduction और उसकी ज्ञात रकम अलग-अलग दिखनी चाहिए।

साक्ष्य [deduction branch](../src/british-columbia-employment-uniform-equipment-deduction-navigator.js#L94), [total](../src/british-columbia-employment-uniform-equipment-deduction-navigator.js#L130), [routes](../src/routes/tools/employment.js#L635)।

सुधार: दोनों methods में एक parser, स्पष्ट booleans, bounded currency और invalid input पर 400। कुल केवल classified amounts से बने। रकम की जानकारी गायब होने पर recovery amount को unknown दिखाएँ।

### 3. खाली इनपुट पर वास्तविक मामले जैसा निर्णय

स्थानीय GET /v1/tools/ontario-employment-reprisal बिना query के HTTP 200 और STATUTORY_REPRISAL_VIOLATION_CONFIRMED लौटाता है। यही tool Province-only fallback से भी पहुँचता है। API का assumption notice और verdict अलग-अलग संकेत दे सकते हैं।

सुधार: high-impact verdict के लिए निर्णायक facts आवश्यक हों। अनुपस्थित facts पर NOT_DETERMINED और missing fields लौटाएँ। उदाहरण अलग sample action में रखें। उसी test matrix में empty GET/POST और partial inputs शामिल करें।

## P2 — अगला सुधार

### 4. Alberta rest periods असंभव समय स्वीकार करता है

GET ?shiftHours=5&breakMinutes=600 → HTTP 200 और COMPLIANT_WITH_ALBERTA_REST_STANDARDS। पाँच घंटे की shift में दस घंटे का break स्वीकार होता है। दस घंटे की shift में कुल 60 मिनट से दो breaks का विभाजन और समय सिद्ध नहीं हो सकता, फिर भी hasCompliantIntraShiftBreak true हो सकता है।

सुधार: break minutes ≤ shift minutes की cross-field validation। कुल अवधि और placement की पुष्टि के लिए अलग result fields। Placement चाहिए तो break intervals लें। [अभी की duration check](../src/alberta-employment-rest-periods-shift-limits-navigator.js#L87)।

### 5. API contract परीक्षण वेबसाइट की वास्तविक सूची से शुरू नहीं होता

मौजूदा परीक्षण सिर्फ TOOL_FORMS की keys चलाता है। इसलिए missing form वाले commands परीक्षण में आते ही नहीं। समान GET/POST 400 भी parity check पार कर सकते हैं। Runtime और export में अलग-अलग field declarations के कारण drift का जोखिम है।

सुधार: command registry से परीक्षण शुरू करें, valid fixtures के लिए 200 और result assertions अनिवार्य करें। Invalid fixtures अलग चलाएँ। Canonical field, alias, blank, null, boolean strings, boundary और cross-field combinations का साझा matrix रखें। नए tools के लिए parser और OpenAPI metadata एक ही schema से derive करने का pilot करें। [मौजूदा contract test](../test/tool-form-contract.test.js#L44)।

### 6. महत्वपूर्ण model assumptions की targeted समीक्षा

- BC overtime पुराने बैंक को मौजूदा hourly wage × banked hours से मूल्य देता है। अगर wage बदलने वाले पुराने credits समर्थित करने हैं, तो earning-time value या transaction ledger की आवश्यकता जाँचें। यह code model की सीमा है। कानूनी नियम का निष्कर्ष इस audit में तय नहीं किया। [मौजूदा formula](../src/british-columbia-employment-overtime-banking-navigator.js#L97)।
- Alberta overtime केवल एक aggregate balance और पूर्ण महीनों की संख्या से expiry जाँचता है। अलग तारीखों पर अर्जित credits और ठीक deadline के मामलों के लिए dates और boundary fixtures चाहिए। [मौजूदा expiry logic](../src/alberta-employment-overtime-banking-navigator.js#L122)।

### 7. Browser, performance और release QA

Verify workflow Windows/Linux पर lint, API schema, types, tests और smoke checks चलाता है। Browser scripts repo में हैं, लेकिन देखे गए मुख्य workflow में command palette का पूरा browser sweep शामिल नहीं था। उसे release gate बनाना ऊपर के 404 पकड़ता।

Local benchmark scripts मौजूद हैं। Production latency, concurrency, SQLite lock pressure और restore time इस ऑडिट में मापे नहीं गए। अगली जाँच में answer, public tools और admin writes पर p95/p99, error rate और database contention रिकॉर्ड करें। Release checklist में clean checkout, generated API diff, Docker readiness, browser tests और restore drill के परिणाम रखें। [Verify workflow](../.github/workflows/verify.yml), [Dockerfile](../Dockerfile)।

## जो नियंत्रण मौजूद हैं

- HTTP body reader आकार और समय सीमा लागू करता है। Forwarded IP सिर्फ स्पष्ट trusted proxy configuration पर पढ़ा जाता है। [Body reader](../src/request-body.js), [Proxy handling](../src/client-address.js)।
- SQLite के महत्वपूर्ण write paths में transactions और rollback हैं। Readiness tests वास्तविक write lock, read-only और query-only connections जाँचते हैं। Backup और restore की अलग automated suites भी हैं। [Store](../src/store.js)।
- Container non-root user से चलता है। CI में Ubuntu और Windows, OpenAPI validation, generated client typecheck तथा Docker readiness की जाँच है।
- इस sampling में कोई पुष्ट P0 security defect नहीं मिला। Secrets, live infrastructure और authenticated adversarial flows पर अलग verification बाकी है।

## कार्य क्रम

1. Command registry और form routing ठीक करें। सभी 59 IDs पर user journey gate लगाएँ।
2. BC deductions ठीक करें और Ontario reprisal जैसे high-impact calculators में missing facts का निर्णय बदलें।
3. Cross-field invariants और GET/POST validation matrix लागू करें। पहले employment और tenancy calculators।
4. फिर बाकी API families, browser/device coverage, security, performance और operations पर अलग sign-off करें।

## इस checkout के सत्यापन परिणाम

- Node test runner और experimental coverage से 2,490 पास, 0 फेल, 0 skipped।
- Runner ने instrumented files पर 95.54% line, 83.61% branch और 89.79% function coverage रिपोर्ट की। इसे browser coverage या हर source file की समीक्षा का प्रमाण न मानें।
- ESLint, OpenAPI validation (304 paths, 1,309 schemas), API client typecheck और git diff --check सफल रहे।
- Automated suite हरी होने के बावजूद अलग स्थानीय probes ने ऊपर के 404 और गलत verdict दोहराए।

## सुधार के बाद की स्थिति — 6 नवंबर 2026

कमांड सूची के सभी 59 IDs के forms उपलब्ध हैं। पहले missing रहे 21 forms canonical POST endpoints उपयोग करते हैं और boolean/number values typed JSON में भेजते हैं। Ontario reprisal में missing facts पर NOT_DETERMINED आता है। BC deductions में boolean parity और classified uniform amount का total सुधारा गया। Alberta breaks में break duration > shift duration पर validation error है।

scripts/browser-command-forms.mjs में दोहराने योग्य browser regression जोड़ा गया। PLAYWRIGHT_PACKAGE से installed Playwright का package path और CHROME_PATH से browser executable दिया जा सकता है। सामान्य installation में local Playwright और उसका bundled browser उपयोग होता है। यह 21 forms पर true/false के 42 submissions, required fields, JSON field types और rendered results जाँचता है। सभी 42 checks पास हुए।

सुरक्षा के 34 focused tests पास हुए। इनमें admin/customer authentication, approval, body limits, trusted proxies, headers, generators और shared rate limiting हैं। npm audit ने 119 dependencies पर शून्य ज्ञात vulnerabilities रिपोर्ट कीं। Backup, retention, rekey, owner isolation और readiness के 31 tests पास हुए।

स्थानीय HTTP benchmark में file-backed SQLite के साथ 80 requests और concurrency 5 पर p95 607.84 ms तथा p99 635.35 ms था। सभी 80 traces persist हुए। 40 responses unavailable, 30 guidance और 10 clarification थे। Transport failures शून्य थे। Tool benchmark में 100 requests और concurrency 8 पर p95 236.13 ms तथा p99 252.29 ms था। दोनों runs external AI disabled और साथ-साथ स्थानीय मशीन पर चले, इसलिए production capacity का अनुमान इनसे तय नहीं किया गया।

पूर्ण suite के पिछले रन में 2,493 tests पास हुए। Browser script जोड़ने के बाद targeted browser, security, backup checks और script lint पास हुए। Production soak, live provider latency, CI browser integration तथा calculator policy/model review का अलग सत्यापन शेष है। इस audit में वर्णित शून्य रकम वाले remedy wording और break placement बनाम aggregate duration की सीमाएँ भी follow-up में हैं।

अंतिम स्थानीय सत्यापन में 2,495 automated tests और 42 browser submissions पास हुए। Chromium regression को GitHub Actions के Verify workflow में जोड़ा गया। इसका hosted run अगले push/PR पर सत्यापित होगा। BC deductions में अज्ञात रकम पर payroll record की आवश्यकता दिखाई जाती है। अन्य documented charges का ज्ञात subtotal अलग रहता है। Alberta rest periods में कुल मिनट पर्याप्त होने पर भी break placement की पुष्टि लंबित दिखाई जाती है। अंतिम अतिरिक्त सुधार के बाद BC deductions के सभी 8 focused tests पास हुए, जिसमें अज्ञात कटौती के साथ दर्ज $0.50 को सही बनाए रखने का regression भी शामिल है।

## नवीनतम सुधार और खुली जाँचें

- Alberta overtime API अब हर बचे हुए credit की pay-period end date, बाकी घंटे और उस समय की hourly rate लेती है। उदाहरण के लिए, 31 अगस्त को समाप्त अवधि की छह महीने की समय-सीमा फरवरी के आखिरी दिन तक शामिल है। अलग-अलग rates और expiry वाले credits अलग गिने जाते हैं। पुराना aggregate input भी उपलब्ध है। यह मानक छह महीने की अवधि को कवर करता है। Collective agreement की वैकल्पिक अवधि इस मॉडल के बाहर है। [Alberta का आधिकारिक overtime मार्गदर्शन](https://www.alberta.ca/overtime-hours-overtime-pay)
- BC overtime में पुरानी bank का दर्ज CAD balance वैकल्पिक रूप से API और form में दिया जा सकता है। परिणाम दिखाता है कि गणना ने दर्ज balance इस्तेमाल किया या मौजूदा rate से अनुमान लगाया। दोनों प्रांतों के GET और POST endpoints को नई inputs के साथ स्थानीय HTTP पर जाँचा गया।
- Chrome में सभी 59 tool forms के 80 submissions पास हुए। Australia, US, UK और UAE tenancy forms में अब क्षेत्र और मिले मुद्दे दिखते हैं। Family reunification form में verdict दिखता है। Global expat, ESA wage theft और EI वाले forms अब अपनी दशमलव default values स्वीकार करते हैं। Browser suite प्रत्येक पुराने GET form के लिए सफल submission के बाद heading के नीचे result content भी जाँचता है।
- स्थानीय file-backed SQLite पर लगभग एक request प्रति सेकंड की दर से 120 requests भेजीं। 120.7 सेकंड में सभी 120 traces दर्ज हुए। HTTP/trace जाँच में शून्य त्रुटियाँ थीं। उत्तरों में 40 guidance, 40 clarification और 40 unavailable थे। p95 37.1 ms और p99 70.0 ms था। External AI बंद था।
- शेष release जाँचों में hosted CI, production soak, live AI provider latency और अलग browser/device combinations आते हैं। Production या paid AI traffic नहीं चलाया गया।
- अंतिम रन में 2,498 automated tests पास हुए, 0 failed और 0 skipped। ESLint, OpenAPI validation (304 paths, 1,309 schemas), API client typecheck और git diff --check भी पास हुए।

## अतिरिक्त सत्यापन — 6 नवंबर 2026

Alberta overtime API अब लिखित collective agreement में दी हुई अवधि को पूरे महीनों में स्वीकार करती है। समर्थित सीमा 6–120 महीने है। यह calculator की input सीमा है। अवधि दर्ज न करने पर छह महीने लागू होते हैं। GET और POST में नौ महीने के agreement पर आठ महीने पुराना balance जाँचा गया। ठीक अंतिम तारीख, उसके अगले दिन, termination और अमान्य inputs के regression tests भी पास हुए।

59 forms पर Chrome, Firefox और WebKit (iPhone 13 emulation) में 80-80 submissions पास हुए। पहली समानांतर जाँच में timeout और modal initialization की समस्या मिली। Browser suite अब modal उपलब्ध होने की प्रतीक्षा करती है। CI में तीनों engines के अलग jobs शामिल हैं। स्थानीय suite में 2,499 tests पास, शून्य failed और शून्य skipped रहे। Lint, API validation और client typecheck पास हुए।

Hosted workflow का रन अगली प्रकाशित revision पर शेष है। Production endpoint की पहचान के लिए Railway connection को दोबारा authenticate करना होगा। स्थानीय environment में configured AI provider की key उपलब्ध नहीं थी। Production load, live provider latency और वास्तविक handset पर जाँच शेष हैं।

## Hosted CI — 6 नवंबर 2026

Coding-only branch `codex/calculator-and-browser-qa-20261106` पर commit `6460f21` के [GitHub Actions run](https://github.com/shiva-cloud/AI-Agent/actions/runs/42251388544) में container readiness और तीनों browser jobs पास हुए। Container job fresh checkout में disposable SQLite snapshot बनाती है। दोनों operating systems का परिणाम अब अलग मिलता है।

Windows और Ubuntu दोनों पर 2,494 tests पास और वही पाँच evidence database assertions विफल हुए। ये country coverage (दो), province/state retrieval (एक) और rest-of-world coverage/retrieval (दो) से जुड़े हैं। Hosted checkout में स्थानीय reviewed evidence snapshot अनुपलब्ध है। KB records और इन पाँचों tests को यथावत रखा गया। पूरे workflow का अंतिम status failure है। स्थानीय worker smoke, server smoke और pre-flight पास हुए। Production और live AI latency के लिए क्रमशः Railway reauthentication और configured provider credentials चाहिए। वास्तविक handset उपलब्ध होने पर physical-device जाँच की जा सकती है।

## 6 नवंबर — clean checkout पर अंतिम परिणाम

Commit `20061b6` का [hosted CI run](https://github.com/shiva-cloud/AI-Agent/actions/runs/42252290312) सफल रहा। Windows, Ubuntu, Docker, Chromium, Firefox और WebKit के सभी छह jobs पास हुए। Fresh checkout में reviewed SQLite snapshot अनुपलब्ध होने पर पाँच सम्बंधित tests स्पष्ट रूप से skip होते हैं। स्थानीय reviewed database पर पूरे 2,500 tests पास हुए, शून्य skipped। 17 national-authority search queries अब repository के records से बने disposable database पर भी जाँची जाती हैं। Railway reauthentication, configured provider key और वास्तविक handset अभी बाहरी prerequisites हैं।
