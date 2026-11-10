# MKT-I-500 (market-gap नौवाँ sample) — सेट 39 (500-प्रश्न सेट, डुप्लिकेट-मुक्त) — 10 नवंबर 2026

निर्देश *"next 500 question not duplicate"* का अगला चक्र (सेट 39)।  
स्रोत = corpus **market-gap फ़ाइल का नौवाँ sample** (`market_gap_questions_80001_100000.md`; पिछले नमूनों के **3500** प्रश्न छोड़कर शेष **16500** अनदेखे पुल से सम-दूरी फैलाई **500**)।

**चलाने-का ढंग:** in-process runner (`scripts/run-mktI-500.mjs`) — **test-copy DB** (`data/test-settlement.sqlite`, 1787 रिकॉर्ड्स) पर `src/engine.answer()`; असली `settlement.sqlite` अछूता; fixed clock `2026-11-10T12:00Z`।  
Raw data: [CORPUSMKTI500_RESULTS_2026-11-10.json](CORPUSMKTI500_RESULTS_2026-11-10.json)

---

## 1. डुप्लिकेट-प्रमाण

| जाँच | परिणाम |
|---|---|
| पिछले सभी परिणाम सेटों से लोड अद्वितीय प्रश्न (43 फ़ाइलें) | **19881** |
| Market-Gap से पहले परीक्षित छोड़े गए प्रश्न | 3500 |
| शेष अनदेखे पुल से चयनित | **500** (16500 में से सम-दूरी) |
| **पिछले सभी 19881 प्रश्नों से क्रॉस-डुप्लिकेट** | **0** |
| बैच के भीतर आपसी डुप्लिकेट | **0** |
| निष्पादन समय एवं त्रुटियाँ | **500/500** (17.2 सेकंड) · **0 error** |

> अब तक कुल संचयी अद्वितीय परीक्षित प्रश्न: **20381**।

---

## 2. कुल स्थिति — Market-Gap की क्रमिक प्रगति (78 देश)

| स्थिति | सेट-9 | सेट-24 | सेट-26 | सेट-32 | सेट-35 (`MKT-H`) | **सेट-39 (`MKT-I` अब)** |
|---|---|---|---|---|---|---|
| `guidance` | 85 (17.0%) | 114 (22.8%) | 134 (26.8%) | 137 (27.4%) | 145 (29.0%) | **139 (27.8%)** |
| `partial` | 87 | 49 | 29 | 32 | 21 | **27** |
| `clarification` | 322 | 334 | 332 | 328 | 332 | **329** |
| `unavailable` | 6 | 3 | 5 | 3 | 2 | **5** |
| `error` | 0 | 0 | 0 | 0 | 0 | **0** |
| **Serviceable (Guidance + Partial)** | 172 (34.4%) | 163 (32.6%) | 163 (32.6%) | 169 (33.8%) | 166 (33.2%) | **166 (33.2%)** |

लेटेंसी: **मध्य 31ms · p95 57ms · अधिकतम 455ms**।  
चैनल-तिकड़ी: `application_portal` **9** · `evidence` **15** · `transitional_rules` **9** (कुल **33**)।

---

## 3. गाइडेंस वाले देश (13 देश)

| देश | Guidance / कुल | Partial | Clarification | Unavailable |
|---|---|---|---|---|
| Canada | **20** / 28 | 2 | 5 | 1 |
| Australia | **16** / 19 | 2 | 0 | 1 |
| United States | **16** / 19 | 2 | 0 | 1 |
| United Kingdom | **14** / 14 | 0 | 0 | 0 |
| Germany | **13** / 14 | 1 | 0 | 0 |
| United Arab Emirates | **10** / 10 | 0 | 0 | 0 |
| Spain | **10** / 10 | 0 | 0 | 0 |
| Netherlands | **9** / 9 | 0 | 0 | 0 |
| Ireland | **8** / 10 | 1 | 0 | 1 |
| New Zealand | **8** / 9 | 1 | 0 | 0 |
| France | **7** / 9 | 1 | 0 | 1 |
| Sweden | **4** / 5 | 1 | 0 | 0 |
| Singapore | **4** / 5 | 1 | 0 | 0 |

---

## 4. स्तर-वार एवं चैनल-वार विवरण

| स्तर | कुल | Guidance (%) | Partial | Clarification | Unavailable |
|---|---|---|---|---|---|
| Intermediate | 100 | **28** (28.0%) | 5 | 65 | 2 |
| Basic | 99 | **31** (31.3%) | 3 | 65 | 0 |
| Expert | 100 | **29** (29.0%) | 4 | 67 | 0 |
| Advanced | 102 | **26** (25.5%) | 6 | 68 | 2 |
| Extreme | 99 | **25** (25.3%) | 9 | 64 | 1 |

| चैनल | कुल | Guidance | Partial | Clarification | Unavailable |
|---|---|---|---|---|---|
| evidence | 40 | **15** | 0 | 25 | 0 |
| travel_status | 40 | **14** | 0 | 26 | 0 |
| daily_life | 40 | **14** | 0 | 26 | 0 |
| education | 40 | **13** | 2 | 25 | 0 |
| housing | 40 | **12** | 7 | 21 | 0 |
| family | 40 | **11** | 1 | 28 | 0 |
| health | 40 | **10** | 0 | 27 | 3 |
| finance_tax | 40 | **10** | 7 | 23 | 0 |
| application_portal | 40 | **9** | 0 | 31 | 0 |
| transitional_rules | 40 | **9** | 3 | 28 | 0 |
| employment | 40 | **8** | 3 | 27 | 2 |
| safety | 40 | **8** | 4 | 28 | 0 |
| remedies | 20 | **6** | 0 | 14 | 0 |

**गैप कारण वितरण:** missing_or_unsupported_geography (334) · awaiting_human_review (110) · missing_evidence (18) · limited_country_coverage (15) · missing_verified_checklist (8) · missing_personal_eligibility (2)।
