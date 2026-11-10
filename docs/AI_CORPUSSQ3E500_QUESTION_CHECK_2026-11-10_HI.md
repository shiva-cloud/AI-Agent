# SQ3E-500 (corpus social batch-3 पाँचवाँ sample — सेट 42) — 500-प्रश्न सेट (डुप्लिकेट-मुक्त) — 10 नवंबर 2026

निर्देश *"next"* / *"next 500 question not duplicate"* का 42वाँ चक्र।  
स्रोत = corpus **batch-3 सोशल फ़ाइल का पाँचवाँ sample** (`global_immigration_social_questions_40001_60000.md`; पिछले नमूनों के **2000** प्रश्न छोड़कर शेष **18000** अनदेखे पुल से सम-दूरी फैलाई **500**)।

**चलाने-का ढंग:** in-process runner (`scripts/run-sq3E-500.mjs`) — **test-copy DB** (`data/test-settlement.sqlite`, 1787 रिकॉर्ड्स) पर `src/engine.answer()`; असली `settlement.sqlite` अछूता; fixed clock `2026-11-10T12:00Z`।  
Raw data: [CORPUSSQ3E500_RESULTS_2026-11-10.json](CORPUSSQ3E500_RESULTS_2026-11-10.json)

---

## 1. डुप्लिकेट-प्रमाण

| जाँच | परिणाम |
|---|---|
| पिछले सभी परिणाम सेटों से लोड अद्वितीय प्रश्न (44 फ़ाइलें) | **20381** |
| Batch-3 से पहले परीक्षित छोड़े गए प्रश्न | 2000 |
| शेष अनदेखे पुल से चयनित | **500** (18000 में से सम-दूरी) |
| **पिछले सभी 20381 प्रश्नों से क्रॉस-डुप्लिकेट** | **0** |
| बैच के भीतर आपसी डुप्लिकेट | **0** |
| निष्पादन समय एवं त्रुटियाँ | **500/500** (24.0 सेकंड) · **0 error** |

> अब तक कुल संचयी अद्वितीय परीक्षित प्रश्न: **20881**।

---

## 2. कुल स्थिति — Social Batch-3 की 5-सेट प्रगति (77 देश)

| स्थिति | सेट-8 | SQ3B-500 | SQ3C-500 | SQ3D-500 | **SQ3E-500 (अब)** |
|---|---|---|---|---|---|
| `guidance` | 26 (5.2%) | 22 (4.4%) | 26 (5.2%) | 29 (5.8%) | **39 (7.8%)** |
| `partial` | 54 | 58 | 49 | 55 | **47** |
| `clarification` | 384 | 384 | 386 | 376 | **376** |
| `unavailable` | 36 | 36 | 39 | 40 | **38** |
| `error` | 0 | 0 | 0 | 0 | **0** |
| **Serviceable (Guidance + Partial)** | 80 (16.0%) | 80 (16.0%) | 75 (15.0%) | 84 (16.8%) | **86 (17.2%)** |

लेटेंसी: **मध्य 38ms · p95 107ms · अधिकतम 812ms**।

---

## 3. गाइडेंस वाले देश (13 देश)

| देश | Guidance / कुल | Partial | Clarification | Unavailable |
|---|---|---|---|---|
| Sweden | **7** / 12 | 3 | 0 | 2 |
| Spain | **5** / 10 | 1 | 0 | 4 |
| Australia | **4** / 9 | 1 | 0 | 4 |
| Germany | **4** / 7 | 1 | 0 | 2 |
| New Zealand | **4** / 6 | 1 | 0 | 1 |
| United States | **3** / 7 | 1 | 0 | 3 |
| France | **2** / 5 | 0 | 0 | 3 |
| Singapore | **2** / 7 | 1 | 0 | 4 |
| Netherlands | **2** / 5 | 1 | 0 | 2 |
| Ireland | **2** / 9 | 1 | 0 | 6 |
| Canada | **2** / 3 | 0 | 0 | 1 |
| United Arab Emirates | **1** / 7 | 2 | 0 | 4 |
| United Kingdom | **1** / 5 | 2 | 0 | 2 |

---

## 4. स्तर-वार एवं विषय-वार विवरण

| स्तर | कुल | Guidance (%) | Partial | Clarification | Unavailable |
|---|---|---|---|---|---|
| Basic | 100 | **3** (3.0%) | 6 | 81 | 10 |
| Intermediate | 100 | **1** (1.0%) | 8 | 82 | 9 |
| Advanced | 100 | **4** (4.0%) | 9 | 74 | 13 |
| Expert | 100 | **17** (17.0%) | 10 | 70 | 3 |
| Extreme | 100 | **14** (14.0%) | 14 | 69 | 3 |

| विषय | कुल | Guidance | Partial | Clarification | Unavailable |
|---|---|---|---|---|---|
| Housing and tenant protection | 74 | **8** | 14 | 46 | 6 |
| Cross-border and complex law | 65 | **8** | 3 | 50 | 4 |
| Tax, banking and finance | 57 | **5** | 6 | 43 | 3 |
| Education and children | 52 | **5** | 2 | 41 | 4 |
| Local services and daily life | 59 | **4** | 9 | 43 | 3 |
| Immigration status and visas | 65 | **4** | 5 | 51 | 5 |
| Healthcare and disability | 51 | **3** | 7 | 37 | 4 |
| Jobs and worker rights | 77 | **2** | 1 | 65 | 9 |

**गैप कारण वितरण:** missing_or_unsupported_geography (413) · awaiting_human_review (115) · missing_evidence (56) · limited_country_coverage (32) · missing_verified_deadline (10) · missing_verified_checklist (4)।
