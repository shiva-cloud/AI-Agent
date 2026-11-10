# GMS-B-8th-500 (batch-2 आठवाँ sample — सेट 34) — 500-प्रश्न सेट (डुप्लिकेट-मुक्त) — 10 नवंबर 2026

निर्देश *"next"* / *"next 500 question not duplicate"* का 34वाँ चक्र।  
स्रोत = corpus **batch-2 का आठवाँ sample** (`global_immigration_settlement_questions_20001_40000.md`; पिछले नमूनों के **4300** प्रश्न छोड़कर शेष **15700** अनदेखे पुल से सम-दूरी फैलाई **500**)।

**चलाने-का ढंग:** in-process runner (`scripts/run-gmsBH-500.mjs`) — **test-copy DB** (`data/test-settlement.sqlite`, 1771 रिकॉर्ड्स) पर `src/engine.answer()`; असली `settlement.sqlite` अछूता; fixed clock `2026-11-10T12:00Z`।  
Raw data: [GMSBH500_RESULTS_2026-11-10.json](GMSBH500_RESULTS_2026-11-10.json)

---

## 1. डुप्लिकेट-प्रमाण

| जाँच | परिणाम |
|---|---|
| पिछले सभी परिणाम सेटों से लोड अद्वितीय प्रश्न (39 फ़ाइलें) | **17881** |
| Batch-2 से पहले परीक्षित छोड़े गए प्रश्न | 4300 |
| शेष अनदेखे पुल से चयनित | **500** (15700 में से सम-दूरी) |
| **पिछले सभी 17881 प्रश्नों से क्रॉस-डुप्लिकेट** | **0** |
| बैच के भीतर आपसी डुप्लिकेट | **0** |
| निष्पादन समय एवं त्रुटियाँ | **500/500** (17.5 सेकंड) · **0 error** |

> अब तक कुल संचयी अद्वितीय परीक्षित प्रश्न: **18381**।

---

## 2. कुल स्थिति — Batch-2 की 8-सेट प्रगति

| स्थिति | सेट-11 | सेट-13 | सेट-17 (300) | सेट-23 | सेट-27 | सेट-28 | सेट-31 | **सेट-34 / GMS-B-8th (अब)** |
|---|---|---|---|---|---|---|---|---|
| `guidance` | 358 (71.6%) | 364 (72.8%) | 222 (74.0%) | 379 (75.8%) | 397 (79.4%) | 393 (78.6%) | 399 (79.8%) | **414 (82.8%)** |
| `partial` | 117 | 108 | 53 | 90 | 79 | 83 | 81 | **67** |
| `clarification` | 19 | 21 | 17 | 23 | 19 | 19 | 14 | **16** |
| `unavailable` | 6 | 7 | 8 | 8 | 5 | 5 | 6 | **3** |
| `error` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **0** |
| **Serviceable (Guidance + Partial)** | 475 (95.0%) | 472 (94.4%) | 275 (91.7%) | 469 (93.8%) | 476 (95.2%) | 476 (95.2%) | 480 (96.0%) | **481 (96.2%)** |

लेटेंसी: **मध्य 27ms · p95 77ms · अधिकतम 661ms**।

---

## 3. देश-वार विवरण

| देश | Guidance / कुल | Partial | Clarification | Unavailable |
|---|---|---|---|---|
| United Arab Emirates | **57** / 63 | 5 | 0 | 1 |
| Australia | **57** / 63 | 6 | 0 | 0 |
| Germany | **56** / 63 | 6 | 0 | 1 |
| United States | **51** / 64 | 12 | 0 | 1 |
| United Kingdom | **51** / 63 | 12 | 0 | 0 |
| New Zealand | **50** / 61 | 11 | 0 | 0 |
| European Union | **47** / 61 | 8 | 6 | 0 |
| Canada | **45** / 62 | 7 | 10 | 0 |

---

## 4. श्रेणी / स्तर वार विवरण

| श्रेणी | कुल | Guidance (%) | Partial | Clarification | Unavailable |
|---|---|---|---|---|---|
| Basic — 4,000 questions | 100 | **92** (92.0%) | 4 | 3 | 1 |
| Intermediate — 4,000 questions | 100 | **58** (58.0%) | 38 | 4 | 0 |
| Advanced — 4,000 questions | 100 | **83** (83.0%) | 10 | 5 | 2 |
| Expert — 4,000 questions | 100 | **89** (89.0%) | 9 | 2 | 0 |
| Extreme — 4,000 questions | 100 | **92** (92.0%) | 6 | 2 | 0 |

**गैप कारण वितरण:** missing_evidence (26) · missing_personal_eligibility (25) · missing_verified_checklist (20) · missing_or_unsupported_geography (19) · missing_verified_processing_time (16) · awaiting_human_review (5)।
