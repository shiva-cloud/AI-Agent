# SQ3D-500 (corpus social batch-3 चौथा sample) — 500-प्रश्न सेट (डुप्लिकेट-मुक्त) — 10 नवंबर 2026

निर्देश *"next"* / *"next 500 question not duplicate"* का नया चक्र।  
स्रोत = corpus **batch-3 सोशल फ़ाइल का चौथा sample** (`global_immigration_social_questions_40001_60000.md`; पिछले नमूनों के **1500** प्रश्न छोड़कर शेष **18500** अनदेखे पुल से सम-दूरी फैलाई **500**)।

**चलाने-का ढंग:** in-process runner (`scripts/run-sq3D-500.mjs`) — **test-copy DB** (`data/test-settlement.sqlite`, 1771 रिकॉर्ड्स) पर `src/engine.answer()`; असली `settlement.sqlite` अछूता; fixed clock `2026-11-10T12:00Z`।  
Raw data: [CORPUSSQ3D500_RESULTS_2026-11-10.json](CORPUSSQ3D500_RESULTS_2026-11-10.json)

---

## 1. डुप्लिकेट-प्रमाण

| जाँच | परिणाम |
|---|---|
| पिछले सभी परिणाम सेटों से लोड अद्वितीय प्रश्न (40 फ़ाइलें) | **18381** |
| Batch-3 से पहले परीक्षित छोड़े गए प्रश्न | 1500 |
| शेष अनदेखे पुल से चयनित | **500** (18500 में से सम-दूरी) |
| **पिछले सभी 18381 प्रश्नों से क्रॉस-डुप्लिकेट** | **0** |
| बैच के भीतर आपसी डुप्लिकेट | **0** |
| निष्पादन समय एवं त्रुटियाँ | **500/500** (11.5 सेकंड) · **0 error** |

> अब तक कुल संचयी अद्वितीय परीक्षित प्रश्न: **18881**।

---

## 2. कुल स्थिति — Social Batch-3 की 4-सेट प्रगति (77 देश)

| स्थिति | सेट-8 | सेट-16 | सेट-21 (SQ3C) | **SQ3D-500 (अब)** |
|---|---|---|---|---|
| `guidance` | 26 (5.2%) | 22 (4.4%) | 28 (5.6%) | **29 (5.8%)** |
| `partial` | 52 | 48 | 41 | **55** |
| `clarification` | 395 | 399 | 393 | **376** |
| `unavailable` | 27 | 31 | 38 | **40** |
| `error` | 0 | 0 | 0 | **0** |
| **Serviceable (Guidance + Partial)** | 78 (15.6%) | 70 (14.0%) | 69 (13.8%) | **84 (16.8%)** |

लेटेंसी: **मध्य 21ms · p95 31ms · अधिकतम 355ms**।

---

## 3. गाइडेंस वाले देश (11 देश)

| देश | Guidance / कुल | Partial | Clarification | Unavailable |
|---|---|---|---|---|
| Ireland | **6** / 12 | 1 | 0 | 5 |
| Netherlands | **4** / 8 | 2 | 0 | 2 |
| France | **3** / 7 | 1 | 0 | 3 |
| United Arab Emirates | **3** / 6 | 0 | 0 | 3 |
| Canada | **3** / 10 | 1 | 2 | 4 |
| Sweden | **2** / 11 | 3 | 0 | 6 |
| United States | **2** / 5 | 2 | 0 | 1 |
| Australia | **2** / 8 | 2 | 0 | 4 |
| Spain | **2** / 3 | 0 | 0 | 1 |
| New Zealand | **1** / 4 | 0 | 0 | 3 |
| Singapore | **1** / 4 | 1 | 0 | 2 |

---

## 4. स्तर-वार एवं विषय-वार विवरण

| स्तर | कुल | Guidance (%) | Partial | Clarification | Unavailable |
|---|---|---|---|---|---|
| Basic | 100 | **5** (5.0%) | 6 | 83 | 6 |
| Intermediate | 100 | **4** (4.0%) | 8 | 78 | 10 |
| Advanced | 100 | **5** (5.0%) | 7 | 67 | 21 |
| Expert | 100 | **7** (7.0%) | 15 | 78 | 0 |
| Extreme | 100 | **8** (8.0%) | 19 | 70 | 3 |

| विषय | कुल | Guidance | Partial | Clarification | Unavailable |
|---|---|---|---|---|---|
| Local services and daily life | 80 | **6** | 9 | 62 | 3 |
| Education and children | 61 | **5** | 5 | 47 | 4 |
| Cross-border and complex law | 61 | **5** | 7 | 43 | 6 |
| Tax, banking and finance | 51 | **3** | 7 | 34 | 7 |
| Jobs and worker rights | 65 | **3** | 4 | 49 | 9 |
| Housing and tenant protection | 61 | **3** | 9 | 43 | 6 |
| Healthcare and disability | 64 | **2** | 10 | 50 | 2 |
| Immigration status and visas | 57 | **2** | 4 | 48 | 3 |

**गैप कारण वितरण:** missing_or_unsupported_geography (416) · awaiting_human_review (136) · missing_evidence (72) · limited_country_coverage (37) · missing_verified_checklist (7) · missing_verified_deadline (6)।
