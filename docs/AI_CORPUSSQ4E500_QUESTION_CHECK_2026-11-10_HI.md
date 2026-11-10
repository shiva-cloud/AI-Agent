# SQ4E-500 (corpus social batch-4 पाँचवाँ sample — सेट 43) — 500-प्रश्न सेट (डुप्लिकेट-मुक्त) — 10 नवंबर 2026

निर्देश *"cnt"* / *"next 500 question not duplicate"* का 43वाँ चक्र।  
स्रोत = corpus **batch-4 सोशल फ़ाइल का पाँचवाँ sample** (`global_immigration_social_questions_60001_80000.md`; पिछले नमूनों के **2000** प्रश्न छोड़कर शेष **18000** अनदेखे पुल से सम-दूरी फैलाई **500**)।

**चलाने-का ढंग:** in-process runner (`scripts/run-sq4E-500.mjs`) — **test-copy DB** (`data/test-settlement.sqlite`, 1787 रिकॉर्ड्स) पर `src/engine.answer()`; असली `settlement.sqlite` अछूता; fixed clock `2026-11-10T12:00Z`।  
Raw data: [CORPUSSQ4E500_RESULTS_2026-11-10.json](CORPUSSQ4E500_RESULTS_2026-11-10.json)

---

## 1. डुप्लिकेट-प्रमाण

| जाँच | परिणाम |
|---|---|
| पिछले सभी परिणाम सेटों से लोड अद्वितीय प्रश्न (45 फ़ाइलें) | **20881** |
| Batch-4 से पहले परीक्षित छोड़े गए प्रश्न | 2000 |
| शेष अनदेखे पुल से चयनित | **500** (18000 में से सम-दूरी) |
| **पिछले सभी 20881 प्रश्नों से क्रॉस-डुप्लिकेट** | **0** |
| बैच के भीतर आपसी डुप्लिकेट | **0** |
| निष्पादन समय एवं त्रुटियाँ | **500/500** (25.4 सेकंड) · **0 error** |

> अब तक कुल संचयी अद्वितीय परीक्षित प्रश्न: **21381**।

---

## 2. कुल स्थिति — Social Batch-4 की 5-सेट प्रगति (77 देश)

| स्थिति | सेट-1 (CORPUS500) | SQ4B-500 | SQ4C-500 | SQ4D-500 | **SQ4E-500 (अब)** |
|---|---|---|---|---|---|
| `guidance` | 23 (4.6%) | 26 (5.2%) | 28 (5.6%) | 38 (7.6%) | **37 (7.4%)** |
| `partial` | 56 | 59 | 41 | 36 | **30** |
| `clarification` | 392 | 379 | 391 | 397 | **399** |
| `unavailable` | 29 | 36 | 40 | 29 | **34** |
| `error` | 0 | 0 | 0 | 0 | **0** |
| **Serviceable (Guidance + Partial)** | 79 (15.8%) | 85 (17.0%) | 69 (13.8%) | 74 (14.8%) | **67 (13.4%)** |

लेटेंसी: **मध्य 42ms · p95 94ms · अधिकतम 975ms**।

---

## 3. गाइडेंस वाले देश (12 देश)

| देश | Guidance / कुल | Partial | Clarification | Unavailable |
|---|---|---|---|---|
| United States | **6** / 10 | 1 | 0 | 3 |
| United Arab Emirates | **6** / 10 | 2 | 0 | 2 |
| Canada | **4** / 7 | 0 | 1 | 2 |
| Ireland | **3** / 8 | 2 | 0 | 3 |
| France | **3** / 5 | 0 | 0 | 2 |
| United Kingdom | **3** / 6 | 0 | 0 | 3 |
| Australia | **3** / 6 | 1 | 0 | 2 |
| Singapore | **3** / 8 | 2 | 0 | 3 |
| Germany | **2** / 6 | 1 | 0 | 3 |
| Netherlands | **2** / 8 | 1 | 0 | 5 |
| Spain | **1** / 6 | 2 | 0 | 3 |
| Sweden | **1** / 3 | 0 | 0 | 2 |

---

## 4. स्तर-वार एवं विषय-वार विवरण

| स्तर | कुल | Guidance (%) | Partial | Clarification | Unavailable |
|---|---|---|---|---|---|
| Intermediate | 100 | **6** (6.0%) | 3 | 84 | 7 |
| Advanced | 100 | **2** (2.0%) | 2 | 86 | 10 |
| Expert | 100 | **13** (13.0%) | 9 | 77 | 1 |
| Extreme | 100 | **12** (12.0%) | 11 | 71 | 6 |
| Basic | 100 | **4** (4.0%) | 5 | 81 | 10 |

| विषय | कुल | Guidance | Partial | Clarification | Unavailable |
|---|---|---|---|---|---|
| Immigration status and visas | 59 | **7** | 1 | 47 | 4 |
| Healthcare and disability | 70 | **7** | 4 | 54 | 5 |
| Education and children | 65 | **5** | 3 | 54 | 3 |
| Jobs and worker rights | 48 | **5** | 0 | 39 | 4 |
| Housing and tenant protection | 68 | **4** | 8 | 52 | 4 |
| Local services and daily life | 73 | **4** | 5 | 63 | 1 |
| Tax, banking and finance | 54 | **3** | 6 | 40 | 5 |
| Cross-border and complex law | 63 | **2** | 3 | 50 | 8 |

**गैप कारण वितरण:** missing_or_unsupported_geography (432) · awaiting_human_review (121) · missing_evidence (32) · limited_country_coverage (18) · missing_verified_deadline (6) · missing_verified_checklist (6)।
