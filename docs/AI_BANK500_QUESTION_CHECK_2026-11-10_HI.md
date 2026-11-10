# Bank-500 — चौथा 500-प्रश्न सेट (डुप्लिकेट-मुक्त) — 10 नवंबर 2026

निर्देश *"next 500 question not duplicate"* का चौथा चक्र। स्रोत इस बार प्रोजेक्ट का **1,700-question bank** (`scripts/data/questions-part1-10.json` = IMMIGRATION FUNDAMENTALS से QUALIFICATION ASSESSMENT तक के 10 parts, हर part में 50 प्रश्न) — यह बैंक अब तक किसी सेट में नहीं चला था, और इसके प्रश्न सबसे **अवधारणात्मक/नीति-गहरा** हैं ("कानून और international treaty टकराव", "points-system कैसे योग्यता तय करता है")।

**चलाने-का ढंग (पिछले तीनों सेटों वाला ही):** अपना in-process runner (`Temp/opencode/run-bank500-mine.js`) — `DB_PATH` से **test-copy DB** (`data/test-settlement.sqlite`) पर `src/engine.answer()`; असली `data/settlement.sqlite` अछूता; fixed clock 2026-11-10T12:00Z। Raw data: [BANK500_RESULTS_2026-11-10.json](BANK500_RESULTS_2026-11-10.json) (176KB)।

## 1. डुप्लिकेट-प्रमाण — चार सेटों का सबसे बड़ा संयोजन

| जाँच | परिणाम |
|---|---|
| पिछले तीनों सेटों (626 + 500 + 517 = **1643 प्रश्न**) से डुप्लिकेट | **0** |
| bank (इस हिस्से) के भीतर आपसी डुप्लिकेट | **0** |
| पूरे 1,700-bank से भी पूर्व-जाँच | 1643 से **0** डुप्लिकेट, भीतर केवल 1 |
| चले गए प्रश्न | **500/500** (40 सेकंड) |
| engine error | **0** |

अब तक **चार सेट = 2143 अद्वितीय प्रश्न** इंजन पर चल चुके हैं।

## 2. कुल स्थिति (500 प्रश्न) — अब तक का सर्वोच्च

| स्थिति | संख्या | % |
|---|---|---|
| `guidance` | **454** | **90.8%** (अब तक निरपेक्ष सर्वोच्च) |
| `partial` | 45 | 9% |
| `clarification` | 0 | — |
| `unavailable` | 1 | 0.2% |
| `error` | **0** | 0 |

**serviceable = 499 = 99.8%**।

लेटेंसी ध्यान देने योग्य है: मध्य **62ms** · p95 172ms · अधिकतम 694ms — पिछले सेटों (17–24ms) से धीमा, कारण सीधा है: ये प्रश्न गहरे नीति/कानून-अवधारणा वाले हैं, इसलिए इंजन **अधिक और भारी रिकॉर्ड खोलता है** (Baker v. Canada [1999], 1951 Refugee Convention + IRPA s.96, IRPA s.31, IRCC CEC-experience guidance आदि)। claims-वितरण: 1–2 कथान 262 · 3–5 थे 53 · **6+ कथान 184** — यानी जवाब सघन रूप से स्रोत-बद्ध हैं।

## 3. Part-वार (10 parts × 50 प्रश्न)

| Part | विषय | guidance | फेल |
|---|---|---|---|
| 1 | IMMIGRATION FUNDAMENTALS | 44 | 6 |
| 2 | PLANNING PLANNING | 45 | 5 |
| 3 | PASSPORTS, DOCUMENTS AND IDENTITY | **50** | **0** — एकदम स्वच्छ |
| 4 | VISA TYPES AND APPLICATION STRATEGIES | 48 | 2 |
| 5 | StudENT IMMIGRATION | 45 | 5 |
| 6 | Work AND EMPLOYMENT IMMIGRATION | 41 | **9** (सबसे भारी) |
| 7 | SkILLED MIGRATION AND POINTS | 46 | 4 |
| 8 | BUSINESS, INVESTMENT | 46 | 3 (+1 नत undefined) |
| 9 | FAMILY AND DEPENDENT | 43 | 7 |
| 10 | LANGUAGE, EDUCATION, QUALIFICATION | 46 | 4 |

## 4. विश्लेषण — फेलों का स्वभाव (गलत जवाब नहीं, ईमानदार अंश)

गैप-कारण: `missing_personal_eligibility` **28** · `awaiting_human_review` **15** · `missing_evidence` **10** · occupation 2 · बाकी 1-1 (processing_time, intent, rejected)।

पैटर्न बिल्कुल स्पष्ट: ये सेट के 45 आंशिक जवाब **बनावटी नहीं हैं**। अधिकतर प्रश्न जानबूझकर वैश्विक-सिद्धांत शैली के हैं ("Can remote employment qualify for a work-based visa?", "How do points systems determine eligibility?", "Can borrowed money qualify as investment capital?") — जिनका सचचा जवाब व्यक्तिगत परिस्थिति पर निर्भर है। इंजन उस तक बिना सत्यापित अनुमान पहुँचने से मना कर गया और विपरीत लेबल-सहित आंशिक दिया — कुल उपयोग के लिहाज से सही व्यवहार।

एक `unavailable`: "startup incubator endorsements" — रिकॉर्ड में यह बात नहीं, साफ इनकार (सही)।

## 5. हल्की-खुली स्थिति

- **Part 6 (work)** फेल-बीमा 9 — नियोक्ता-वर्ग राशि/योग्यता कड़ियाँ सत्यापित सार से बाहर; यह अगला फोकस।
- **Part 9 (family)** 7 फेल — "unmarried partners / रिवाज पर आधारित विवहा / guardianship" जैसे गोच पर subjective-eligibility रुके — शहर-विशेषity रिकॉर्ड possible इलाज।
- ठीक-ठीक "How/can X का जवाब कैसे दूँ बिना व्यक्ति के" वाले प्रश्नों के लिए **"settlement-pathway class"** रिकॉर्ड बन जाए तो 28 पर्सनल-एलिजिबिलिती फेल में बहुत कम हो सकते हैं।

## 6. चारों सेटों का संयुक्त दृश्य (2143 प्रश्न)

| | सेट-1 fresh | सेट-2 NR | सेट-3 master | सेट-4 bank |
|---|---|---|---|---|
| प्रश्न | 626 | 500 | 517 | 500 |
| guidance | 493 (78.8%) | 327 (65%) | 430 (83.2%) | **454 (90.8%)** |
| partial | 121 | 114 | 74 | 45 |
| clarif / unavail | 9 / 3 | 22 / 37 | 10 / 3 | 0 / 1 |
| error | 0 | 0 | 0 | 0 |
| डुप्लिकेट (सभी जोड़ियों में) | — | **0** | **0** | **0** |
| latency p95 | 31ms | 46ms | 37ms | 172ms |

**सामूहिक निष्कर्ष:** 2143 अद्वितीय प्रश्नों में **1704 guidance (79.5%)** · 354 partial · 41 clarification · 44 unavailable · **0 error और 0 डुप्लिकेट दिन-से-दिन**। जो सेट जितना कनाडा-popular सही-भूरो (popular से गहरा) तय हो, उतना इंजन का स्रोत-बद्ध स्कोरी सुधरता गया; जो सेट असली Reddit/Quora गहराई से अठखेला हो, उसमें ईमानदार-इनकार बढ़ा — पर किसी भी चरण में बनावटी/काल्पनिक जवाब नहीं।

## 7. अगले चक्र (चुन सकते हो)

1. **पाँचवा सेट** — 1,700-bank के बाकी हिस्से (part11-20 = 500, इसी dedup-रणनीति से) — यह सेट अब तक छुआ ही नहीं है।
2. **मरम्मत-बैच** — missing_evidence सूची का प्रकाशन (अब चार सेटों से 29+29+87+10 मिलाकर टॉपिक-सूची बनेगी)।
3. **ब्राउज़र P1 फ़िक्सेस** पिन करना (Germany→Ontario leakage, UK/US origin, London/Oyster CA पार्स)।
