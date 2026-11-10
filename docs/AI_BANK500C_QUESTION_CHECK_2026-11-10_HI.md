# Bank-500 भाग-3 (P21–P30) — छठा 500-प्रश्न सेट (डुप्लिकेट-मुक्त) — 10 नवंबर 2026

निर्देश *"next 500 question not duplicate"* का छठा चक्र। स्रोत = 1,700-bank का **अंतिम deep हिस्सा `questions-part21-30.json`** (part 21–30: EMPLOYMENT SETTLEMENT से UNANSWERED QUESTIONS/FUTURE RESEARCH तक; हर part 50)। **1,700-bank के तीनों हिस्से (1500 प्रश्न) अब पूरे चल चुके** — बस `questions-1501-1700.json` (200 प्रश्न) अप्रयुक्त है (इस सेट में 700 में से पहले 500 unique = सब part21-30 से चुने गए)।

**चलाने-का ढंग (पाँचों पिछले सेटों वाला ही):** अपना in-process runner (`Temp/opencode/run-bankC500-mine.js`) — `DB_PATH` से **test-copy DB** (`data/test-settlement.sqlite`) पर `src/engine.answer()`; असली `settlement.sqlite` अछूता; fixed clock 2026-11-10T12:00Z। Raw data: [BANK500C_RESULTS_2026-11-10.json](BANK500C_RESULTS_2026-11-10.json) (151KB)।

## 1. डुप्लिकेट-प्रमाण — छह-सेट संयोजन की जाँच

| जाँच | परिणाम |
|---|---|
| **पाँचों पिछले सेटों (626 + 500 + 517 + 500 + 499 = 2643) से डुप्लिकेट** | **0** |
| pool (700) के भीतर आपसी डुप्लिकेट | **0** |
| चले गए प्रश्न | **500/500** (46 सेकंड) |
| engine error | **0** |

अब तक **छह सेट = 3143 अद्वितीय प्रश्न**।

## 2. कुल स्थिति (500 प्रश्न)

| स्थिति | संख्या | % |
|---|---|---|
| `guidance` | **469** | **93.8%** |
| `partial` | 30 | 6% |
| `clarification` | 0 | — |
| `unavailable` | 1 | 0.2% |
| `error` | **0** | 0 |

**serviceable = 499 = 99.8%**।

लेटेंसी: अब तक का सबसे भारी सेट — मध्य 79ms · p95 196ms · अधिकतम 551ms। कारण स्पष्ट: ये सबसे गहरे normative/scenario प्रश्न हैं (POLICY-ECONOMICS, AI-PRIVACY, EMERGENCY CASES, CROSS-BORDER)। सघनता फिर ऊँची: **181 जवाबों में 6+ कथान**।

## 3. Part-वार (part 21–30)

| Part | विषय | guidance | फेल |
|---|---|---|---|
| 21 | EMPLOYMENT SETTLEMENT, PROFESSIONAL INTEGRATION | 47 | 3 |
| 22 | SOCIAL INTEGRATION, CULTURE, COMMUNITY | 47 | 3 (1 unavail) |
| 23 | CHILDREN, EDUCATION, NEXT GENERATION | 49 | 1 |
| 24 | COUNTRY-COMPARISONS, REGIONAL SYSTEMS | 47 | 3 |
| 25 | IMMIGRATION TECHNOLOGY, AI, DATA PRIVACY | 45 | 5 |
| 26 | FRAUD, MISINFORMATION, CONSUMER PROTECTION | 46 | 4 |
| 27 | EMERGENCY/EXCEPTIONAL CASES | 45 | 5 |
| 28 | POLICY, ECONOMICS, ACCOUNTABILITY | 49 | 1 |
| 29 | ADVANCED LOGICAL, CROSS-BORDER | 45 | 5 |
| 30 | UNANSWERED QUESTIONS, FUTURE RESEARCH | 49 | 1 |

(इस सेट में 100%-स्वच्छ कोई part नहीं — सबसे हल्के P23/P28/P30 हर एक में केवल 1 फेल।)

## 4. 31 फेलों का स्वभाव — फिर वही ईमानदारी-पैटर्न, नया स्वर

गैप-कारण: **`awaiting_human_review` 17 (अब तक का सबसे बड़ा हिस्सा)** · `missing_evidence` 15 · `missing_personal_eligibility` 6 · बाकी 4 एक-एक।

यहाँ परिवर्तन यह है: part 21–30 के प्रश्न **नीति-मूल्यांकन और नैतिक-परिकल्पना शैल** के हैं ("Can immigration policy reduce global inequality?", "How can digital identity protect stateless applicants?", "How should governments measure social belonging?") — इनका सचचा जवाब **नीति-निर्णय** पर टिका है, इसलिए इंजन इन्हें `awaiting_human_review` के साथ रोकता है (मानव-समीक्षा के लिए) — यह इंजन का जानबूझकर का मॉडरेशन-व्यवहार है, त्रुटि नहीं।

**1 पूर्ण इनकार:** "What does successful social integration actually mean?" — शुद्ध सब्जेक्टिव-दार्शनिक प्रश्न; रिकॉर्ड में सत्यापित मान-परिभाषा नहीं, इसलिए साफ रुका (सही)।

ध्यान दें: **P27 (EMERGENCY CASES)** के 5 आंशिक और उनमें "child born on international aircraft", "embassy में जन्मा बच्चा" शामिल — सीमांत-कानून विवादित क्षेत्र, इंजन ने शुद्ध निर्णय-स्तर से आगे जाने से मना किया।

## 5. छहों सेटों का संयुक्त दृश्य (3143 प्रश्न)

| | सेट-1 | सेट-2 | सेट-3 | सेट-4 | सेट-5 | सेट-6 |
|---|---|---|---|---|---|---|
| स्रोत | fresh Reddit/Quora | NR | master RQL/180/120/bot | bank P1–10 | bank P11–20 | bank P21–30 |
| प्रश्न | 626 | 500 | 517 | 500 | 499 | 500 |
| guidance | 493 (78.8%) | 327 (65%) | 430 (83.2%) | 454 (90.8%) | 475 (95.2%) | 469 (93.8%) |
| partial | 121 | 114 | 74 | 45 | 22 | 30 |
| clarif/unavail | 9/3 | 22/37 | 10/3 | 0/1 | 0/2 | 0/1 |
| error | 0 | 0 | 0 | 0 | 0 | 0 |

**सामूहिक निष्कर्ष:** 3143 अद्वितीय प्रश्नों में **2648 guidance (84.3%)** · 406 partial · 41 clarification · 46 unavailable · **0 error** — और **हर सेट-जोड़ी में 0 डुप्लिकेट** (626+500+517+500+499+500 व्यक्तिगत सेटों की सारी जोड़ियाँ normalize-टेक्स्ट स्तर पर जाँची)।

## 6. 1,700-bank खत्म — आगे के रास्ते

1,700-bank के 1500 प्रश्न (P1–P30) **पूरे चल गए**; बचा केवल `questions-1501-1700.json` (200)। आगे चुन सकते हो:

1. **सातवाँ छोटा सेट (200)** — बाकी bank-tail चले (200 प्रश्न, dedup पहले ही प्रमाणित-आधार से)।
2. **मरम्मत-बैच** — छहों सेटों की संयुक्त gap-सूची से missing_evidence का प्रकाशन (housing/finance-राशियाँ बार-बार वही अड़चन)।
3. **ब्राउज़र P1 फ़िक्सेस** पिन — अब भी खुले हैं (Germany→Ontario, UK/US origin, London/Oyster CA-पार्स)।
4. **आगे के नए 500 सेट** के लिए नई suite-mining चाहिए (जैसे fresh-500 बना था) — बिना नए mining के "not duplicate" की गारंटी कठिन; इस कथन को साफ रख रहा हूँ।
