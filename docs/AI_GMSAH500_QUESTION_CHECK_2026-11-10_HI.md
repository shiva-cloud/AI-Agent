# GMS-A-8th-500 (batch-1 आठवाँ sample — सेट 41) — 500-प्रश्न सेट (डुप्लिकेट-मुक्त) — 10 नवंबर 2026

निर्देश *"next"* / *"next 500 question not duplicate"* का 41वाँ चक्र।  
स्रोत = corpus **batch-1 का आठवाँ sample** (`global_immigration_settlement_20000_questions.md`; पिछले नमूनों के **3000** प्रश्न छोड़कर शेष **17000** अनदेखे पुल से सम-दूरी फैलाई **500**)।

**चलाने-का ढंग:** in-process runner (`scripts/run-gmsAH-500.mjs`) — **test-copy DB** (`data/test-settlement.sqlite`, 1771 रिकॉर्ड्स) पर `src/engine.answer()`; असली `settlement.sqlite` अछूता; fixed clock `2026-11-10T12:00Z`।  
Raw data: [GMSAH500_RESULTS_2026-11-10.json](GMSAH500_RESULTS_2026-11-10.json)

---

## 1. डुप्लिकेट-प्रमाण

| जाँच | परिणाम |
|---|---|
| पिछले सभी परिणाम सेटों से लोड अद्वितीय प्रश्न (43 फ़ाइलें) | **19881** |
| Batch-1 से पहले परीक्षित छोड़े गए प्रश्न | 3000 |
| शेष अनदेखे पुल से चयनित | **500** (17000 में से सम-दूरी) |
| **पिछले सभी 19881 प्रश्नों से क्रॉस-डुप्लिकेट** | **0** |
| बैच के भीतर आपसी डुप्लिकेट | **0** |
| निष्पादन समय एवं त्रुटियाँ | **500/500** (12.7 सेकंड) · **0 error** |

> अब तक कुल संचयी अद्वितीय परीक्षित प्रश्न: **20381**।

---

## 2. कुल स्थिति — Batch-1 की 8-सेट प्रगति (8 देश)

| स्थिति | सेट-10 | सेट-14 | सेट-19 | सेट-22 | सेट-25 | **सेट-41 (`GMS-A-8th` अब)** |
|---|---|---|---|---|---|---|
| `guidance` | 0 | 0 | 139 (27.8%) | 0 | 0 | **0 (0.0%)** |
| `partial` | 204 | 216 | 79 | 206 | 207 | **216** |
| `clarification` | 28 | 28 | 25 | 32 | 32 | **25** |
| `unavailable` | 268 | 256 | 257 | 262 | 261 | **259** |
| `error` | 0 | 0 | 0 | 0 | 0 | **0** |
| **Serviceable (Guidance + Partial)** | 204 (40.8%) | 216 (43.2%) | 218 (43.6%) | 206 (41.2%) | 207 (41.4%) | **216 (43.2%)** |

लेटेंसी: **मध्य 21ms · p95 48ms · अधिकतम 371ms**।

---

## 3. सक्रिय देशों का विवरण

| देश | Guidance / कुल | Partial | Clarification | Unavailable |
|---|---|---|---|---|
| Germany | **0** / 66 | 34 | 0 | 32 |
| Canada | **0** / 61 | 32 | 10 | 19 |
| United Kingdom | **0** / 66 | 30 | 0 | 36 |
| United Arab Emirates | **0** / 62 | 29 | 0 | 33 |
| Australia | **0** / 65 | 27 | 0 | 38 |
| United States | **0** / 65 | 23 | 0 | 42 |
| New Zealand | **0** / 58 | 23 | 0 | 35 |
| European Union | **0** / 57 | 18 | 15 | 24 |

---

## 4. विषय-वार विवरण

| विषय | कुल | Guidance | Partial | Clarification | Unavailable |
|---|---|---|---|---|---|
| Housing & Tenancy | 10 | **0** | 10 | 0 | 0 |
| Local Settlement | 10 | **0** | 10 | 0 | 0 |
| Transit | 10 | **0** | 10 | 0 | 0 |
| Telecom & Consumer | 10 | **0** | 9 | 1 | 0 |
| Driving & Vehicles | 10 | **0** | 9 | 0 | 1 |
| Identity & SIN | 10 | **0** | 9 | 1 | 0 |
| Family & Schools | 10 | **0** | 9 | 0 | 1 |
| Banking & Tax | 9 | **0** | 8 | 0 | 1 |
| Jobs & Careers | 9 | **0** | 8 | 0 | 1 |
| PR & Citizenship | 10 | **0** | 8 | 1 | 1 |
| Benefits | 10 | **0** | 8 | 0 | 2 |
| Healthcare | 10 | **0** | 8 | 1 | 1 |
| Employment & Labour | 9 | **0** | 7 | 1 | 1 |
| Work Immigration | 10 | **0** | 7 | 2 | 1 |
| Immigration Policy | 10 | **0** | 7 | 2 | 1 |
| Family Immigration | 10 | **0** | 6 | 0 | 4 |
| Legal Aid | 9 | **0** | 5 | 1 | 3 |
| Study Immigration | 10 | **0** | 5 | 1 | 4 |
| Biometrics & Medical | 10 | **0** | 4 | 0 | 6 |
| Borders & Removal | 10 | **0** | 4 | 0 | 6 |
| Fraud & Scams | 10 | **0** | 4 | 1 | 5 |
| Credential & Language | 10 | **0** | 4 | 2 | 4 |
| Students | 10 | **0** | 4 | 0 | 6 |
| Municipal Services | 10 | **0** | 4 | 0 | 6 |
| Visitor & Short Stay | 10 | **0** | 3 | 0 | 7 |
| Legal Tools | 9 | **0** | 3 | 0 | 6 |
| Refusals & Appeals | 10 | **0** | 3 | 0 | 7 |
| Seniors | 10 | **0** | 3 | 0 | 7 |
| Criminal & Security | 10 | **0** | 3 | 0 | 7 |
| Mental Health | 10 | **0** | 3 | 0 | 7 |
| Employer Sponsorship | 9 | **0** | 3 | 0 | 6 |
| Community Life | 10 | **0** | 2 | 0 | 8 |
| Digital Government | 10 | **0** | 2 | 0 | 8 |
| Women & Family Safety | 10 | **0** | 2 | 0 | 8 |
| Fees & Processing | 10 | **0** | 2 | 0 | 8 |
| Skilled Migration | 10 | **0** | 2 | 2 | 6 |
| Relocation | 9 | **0** | 2 | 0 | 7 |
| Refugee & Humanitarian | 10 | **0** | 2 | 0 | 8 |
| Cross-border Mobility | 10 | **0** | 2 | 0 | 8 |
| Investor Immigration | 10 | **0** | 2 | 0 | 8 |
| Food & Groceries | 10 | **0** | 2 | 1 | 7 |
| Immigration Evidence | 9 | **0** | 2 | 0 | 7 |
| Vulnerable Migrants | 9 | **0** | 1 | 0 | 8 |
| Emergency & Safety | 9 | **0** | 1 | 0 | 8 |
| Business Setup | 10 | **0** | 1 | 2 | 7 |
| Cost of Living | 10 | **0** | 1 | 2 | 7 |
| Disability | 10 | **0** | 1 | 1 | 8 |
| Digital Immigration & Privacy | 10 | **0** | 1 | 0 | 9 |
| Climate & Preparedness | 10 | **0** | 0 | 1 | 9 |
| Estate & Death | 10 | **0** | 0 | 0 | 10 |
| Utilities | 10 | **0** | 0 | 2 | 8 |

**गैप कारण वितरण:** awaiting_human_review (500) · missing_or_unsupported_geography (275) · missing_evidence (109) · unrecognized_intent (53) · missing_personal_eligibility (41) · missing_live_price_data (1)।
