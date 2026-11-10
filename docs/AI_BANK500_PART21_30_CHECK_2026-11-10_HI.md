# Bank-500 Part 21–30 — छठा 500-प्रश्न सेट (डुप्लिकेट-मुक्त) — 10 नवंबर 2026

निर्देश *"next 500 question not duplicate"* का छठा चक्र। स्रोत: **1,700-question bank का तीसरा हिस्सा** (`scripts/data/questions-part21-30.json` = Parts 21–30: EMPLOYMENT SETTLEMENT से UNANSWERED & ORIGINAL RESEARCH तक, 10 parts, हर part में 50 प्रश्न)।

**चलाने-का ढंग:** In-process runner (`scripts/run-bank500-part21-30.mjs`) — `data/test-settlement.sqlite` पर `src/engine.answer()`; असली `data/settlement.sqlite` अछूता; fixed clock 2026-11-10T12:00Z। Raw data: [BANK500_PART21_30_RESULTS_2026-11-10.json](BANK500_PART21_30_RESULTS_2026-11-10.json)।

## 1. डुप्लिकेट-प्रमाण — छह सेटों का महा-संयोजन (3143 प्रश्न)

| जाँच | परिणाम |
|---|---|
| पिछले पाँचों सेटों (626 + 500 + 517 + 500 + 500 = **2643 प्रश्न**) से डुप्लिकेट | **0** |
| इस सेट (Parts 21–30) के भीतर आपसी डुप्लिकेट | **0** |
| चले गए प्रश्न | **500/500** (27 सेकंड) |
| Engine Errors | **0** |

अब तक **छह सेट = 3143 अद्वितीय प्रश्न** इंजन पर पूर्णतः परीक्षित हो चुके हैं (सभी जोड़ियों में शून्य पुनरावृत्ति)।

## 2. कुल स्थिति (500 प्रश्न)

| स्थिति | संख्या | % |
|---|---|---|
| `guidance` | **471** | **94.2%** |
| `partial` | 28 | 5.6% |
| `clarification` | 0 | 0.0% |
| `unavailable` | 1 | 0.2% |
| `error` | **0** | **0%** |

**Serviceable (उपयोगी समाधान) = 499 = 99.8%**।

लेटेंसी: मध्य **46ms** · p95 **117ms** · अधिकतम **252ms**।

## 3. Part-वार परिणाम (Parts 21–30 × 50 प्रश्न)

| Part | विषय | Total | Guidance | Partial | Unavail / Clarif | Fail % |
|---|---|---|---|---|---|---|
| 21 | EMPLOYMENT SETTLEMENT AND PROFESSIONAL INTEGRATION | 50 | **47** | 3 | 0 | 6.0% |
| 22 | SOCIAL INTEGRATION, CULTURE AND COMMUNITY | 50 | **47** | 2 | 1 | 6.0% |
| 23 | CHILDREN, EDUCATION AND THE NEXT GENERATION | 50 | **49** | 1 | 0 | 2.0% |
| 24 | COUNTRY-SPECIFIC COMPARISONS AND REGIONAL SYSTEMS | 50 | **47** | 3 | 0 | 6.0% |
| 25 | IMMIGRATION TECHNOLOGY, AI AND DATA PRIVACY | 50 | **46** | 4 | 0 | 8.0% |
| 26 | IMMIGRATION FRAUD, MISINFORMATION AND CONSUMER PROTECTION | 50 | **47** | 3 | 0 | 6.0% |
| 27 | EMERGENCY, EXCEPTIONAL AND UNUSUAL IMMIGRATION CASES | 50 | **45** | 5 | 0 | 10.0% |
| 28 | IMMIGRATION POLICY, ECONOMICS AND GOVERNMENT ACCOUNTABILITY | 50 | **49** | 1 | 0 | 2.0% |
| 29 | ADVANCED LOGICAL, TECHNICAL AND CROSS-BORDER SCENARIOS | 50 | **45** | 5 | 0 | 10.0% |
| 30 | UNANSWERED QUESTIONS, FUTURE IMMIGRATION AND ORIGINAL RESEARCH | 50 | **49** | 1 | 0 | 2.0% |

## 4. गैप-कारण विश्लेषण (Honest Partials)

| गैप कारण | आवृत्ति | व्याख्या |
|---|---|---|
| `awaiting_human_review` | **17** | मानवीय समीक्षा के लिए लंबित प्रश्न-बैंक |
| `missing_evidence` | **14** | विशिष्ट प्रक्रिया/नियम का स्वतंत्र साक्ष्य रिकॉर्ड अनुपलब्ध |
| `missing_personal_eligibility` | **6** | व्यक्तिगत परिस्थिति (फंड्स, सम्बंध, मेडिकल) पर निर्भर कानूनी सलाह |
| `unrecognized_intent` | **1** | अन्य श्रेणी |
| `missing_verified_processing_time` | **1** | अन्य श्रेणी |
| `missing_occupation_requirements` | **1** | अन्य श्रेणी |

## 5. छह सेटों का संयुक्त समग्र दृश्य (3143 प्रश्न)

| सेट | स्रोत / प्रकार | प्रश्न | Guidance | Partial | Unavail / Clarif | Error | Duplicates |
|---|---|---|---|---|---|---|---|
| 1 | Fresh 500 (Mixed Topics) | 626 | 493 (78.8%) | 121 | 12 | 0 | 0 |
| 2 | No-Repeat 500 (Corridor Spec) | 500 | 384 (76.8%) | 56 | 60 | 0 | 0 |
| 3 | Master 500 (Deep Practice) | 517 | 430 (83.2%) | 74 | 13 | 0 | 0 |
| 4 | Bank-500 Part 1–10 (Concepts) | 500 | 454 (90.8%) | 45 | 1 | 0 | 0 |
| 5 | Bank-500 Part 11–20 (Finance/Legal) | 500 | 476 (95.2%) | 22 | 2 | 0 | 0 |
| 6 | Bank-500 Part 21–30 (Advanced/Research) | 500 | **471 (94.2%)** | 28 | 1 | 0 | 0 |
| **कुल** | **समस्त प्रोजेक्ट (6 चक्र)** | **3143** | **2708** | **346** | **89** | **0** | **0** |
