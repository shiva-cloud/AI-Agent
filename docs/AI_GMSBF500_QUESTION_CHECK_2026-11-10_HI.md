# GMS-B-6th-500 (batch-2 छठा sample — सेट 28) — 500-प्रश्न सेट (डुप्लिकेट-मुक्त) — 10 नवंबर 2026

निर्देश *"cnt"* / *"next 500 question not duplicate"* का नया चक्र।  
स्रोत = corpus **batch-2 का छठा sample** (`global_immigration_settlement_questions_20001_40000.md`; पिछले नमूनों के **3300** प्रश्न छोड़कर शेष **16700** अनदेखे पुल से सम-दूरी फैलाई **500**)।

**चलाने-का ढंग:** in-process runner (`scripts/run-gmsBF-500.mjs`) — **test-copy DB** (`data/test-settlement.sqlite`, 1771 रिकॉर्ड्स) पर `src/engine.answer()`; असली `settlement.sqlite` अछूता; fixed clock `2026-11-10T12:00Z`।  
Raw data: [GMSBF500_RESULTS_2026-11-10.json](GMSBF500_RESULTS_2026-11-10.json)

---

## 1. डुप्लिकेट-प्रमाण

| जाँच | परिणाम |
|---|---|
| पिछले सभी परिणाम सेटों से लोड अद्वितीय प्रश्न (33 फ़ाइलें) | **14881** |
| Batch-2 से पहले परीक्षित छोड़े गए प्रश्न | 3300 |
| शेष अनदेखे पुल से चयनित | **500** (16700 में से सम-दूरी) |
| **पिछले सभी 14881 प्रश्नों से क्रॉस-डुप्लिकेट** | **0** |
| बैच के भीतर आपसी डुप्लिकेट | **0** |
| निष्पादन समय एवं त्रुटियाँ | **500/500** (21.4 सेकंड) · **0 error** |

> अब तक कुल संचयी अद्वितीय परीक्षित प्रश्न: **15381**।

---

## 2. कुल स्थिति — Batch-2 की 6-सेट प्रगति

| स्थिति | सेट-11 | सेट-13 | सेट-17 (300) | सेट-23 | सेट-27 | **सेट-28 / GMS-B-6th (अब)** |
|---|---|---|---|---|---|---|
| `guidance` | 358 (71.6%) | 364 (72.8%) | 222 (74.0%) | 379 (75.8%) | 397 (79.4%) | **393 (78.6%)** |
| `partial` | 117 | 108 | 53 | 90 | 79 | **83** |
| `clarification` | 19 | 21 | 17 | 23 | 19 | **19** |
| `unavailable` | 6 | 7 | 8 | 8 | 5 | **5** |
| `error` | 0 | 0 | 0 | 0 | 0 | **0** |
| **Serviceable (Guidance + Partial)** | 475 (95.0%) | 472 (94.4%) | 275 (91.7%) | 469 (93.8%) | 476 (95.2%) | **476 (95.2%)** |

लेटेंसी: **मध्य 33ms · p95 100ms · अधिकतम 566ms**।

---

## 3. देश-वार विवरण

| देश | Guidance / कुल | Partial | Clarification | Unavailable |
|---|---|---|---|---|
| New Zealand | **55** / 63 | 8 | 0 | 0 |
| Australia | **55** / 70 | 14 | 0 | 1 |
| United States | **51** / 65 | 12 | 0 | 2 |
| Canada | **49** / 64 | 5 | 10 | 0 |
| Germany | **49** / 59 | 10 | 0 | 0 |
| United Kingdom | **48** / 60 | 12 | 0 | 0 |
| United Arab Emirates | **47** / 60 | 11 | 0 | 2 |
| European Union | **39** / 59 | 11 | 9 | 0 |

---

## 4. श्रेणी / स्तर वार विवरण

| श्रेणी | कुल | Guidance (%) | Partial | Clarification | Unavailable |
|---|---|---|---|---|---|
| Basic — 4,000 questions | 100 | **89** (89.0%) | 7 | 2 | 2 |
| Intermediate — 4,000 questions | 100 | **42** (42.0%) | 50 | 6 | 2 |
| Advanced — 4,000 questions | 100 | **89** (89.0%) | 8 | 2 | 1 |
| Expert — 4,000 questions | 100 | **84** (84.0%) | 13 | 3 | 0 |
| Extreme — 4,000 questions | 100 | **89** (89.0%) | 5 | 6 | 0 |

**गैप कारण वितरण:** missing_personal_eligibility (42) · missing_evidence (39) · missing_verified_checklist (28) · missing_or_unsupported_geography (24) · missing_verified_processing_time (20) · awaiting_human_review (1)।
