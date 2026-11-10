# Bank-500 Part 11–20 — पाँचवाँ 500-प्रश्न सेट (डुप्लिकेट-मुक्त) — 10 नवंबर 2026

निर्देश *"next 500 question not duplicate"* का पाँचवाँ चक्र। स्रोत: **1,700-question bank के बाकी 10 parts** (`scripts/data/questions-part11-20.json` = IMMIGRATION FINANCE से HOUSING & DAILY SETTLEMENT तक के 10 parts, Parts 11–20, हर part में 50 प्रश्न)।

**चलाने-का ढंग:** In-process runner (`scripts/run-bank500-part11-20.mjs`) — `data/test-settlement.sqlite` पर `src/engine.answer()`; असली `data/settlement.sqlite` अछूता; fixed clock 2026-11-10T12:00Z। Raw data: [BANK500_PART11_20_RESULTS_2026-11-10.json](BANK500_PART11_20_RESULTS_2026-11-10.json)।

## 1. डुप्लिकेट-प्रमाण — पाँच सेटों का महा-संयोजन (2,643 प्रश्न)

| जाँच | परिणाम |
|---|---|
| पिछले चारों सेटों (626 + 500 + 517 + 500 = **2,143 प्रश्न**) से डुप्लिकेट | **0** |
| इस सेट (Parts 11–20) के भीतर आपसी डुप्लिकेट | **0** |
| चले गए प्रश्न | **500/500** (39 सेकंड) |
| Engine Errors | **0** |

अब तक **पाँच सेट = 2,643 अद्वितीय प्रश्न** इंजन पर पूर्णतः परीक्षित हो चुके हैं।

## 2. कुल स्थिति (500 प्रश्न)

| स्थिति | संख्या | % |
|---|---|---|
| `guidance` | **476** | **95.2%** |
| `partial` | 22 | 4.4% |
| `clarification` | 0 | 0.0% |
| `unavailable` | 2 | 0.4% |
| `error` | **0** | **0%** |

**Serviceable (उपयोगी समाधान) = 498 = 99.6%**।

लेटेंसी: मध्य **60ms** · p95 **171ms** · अधिकतम **510ms**।

## 3. Part-वार परिणाम (Parts 11–20 × 50 प्रश्न)

| Part | विषय | Total | Guidance | Partial | Unavail / Clarif | Fail % |
|---|---|---|---|---|---|---|
| 11 | IMMIGRATION FINANCE AND PROOF OF FUNDS | 50 | **46** | 4 | 0 | 8.0% |
| 12 | MEDICAL, HEALTH AND CHARACTER REQUIREMENTS | 50 | **46** | 4 | 0 | 8.0% |
| 13 | VISA REFUSALS, APPEALS AND ADMINISTRATIVE REVIEW | 50 | **47** | 2 | 1 | 6.0% |
| 14 | OVERSTAYS, INADMISSIBILITY, BANS AND DEPORTATION | 50 | **46** | 4 | 0 | 8.0% |
| 15 | ASYLUM, REFUGEES AND HUMANITARIAN MIGRATION | 50 | **48** | 2 | 0 | 4.0% |
| 16 | BORDER CONTROL, AIRPORTS AND INTERNATIONAL TRAVEL | 50 | **50** | 0 | 0 | 0.0% |
| 17 | PERMANENT RESIDENCY | 50 | **48** | 2 | 0 | 4.0% |
| 18 | CITIZENSHIP AND NATURALIZATION | 50 | **49** | 1 | 0 | 2.0% |
| 19 | TAXATION, BANKING AND FINANCIAL SETTLEMENT | 50 | **47** | 3 | 0 | 6.0% |
| 20 | HOUSING, HEALTHCARE AND DAILY SETTLEMENT | 50 | **49** | 0 | 1 | 2.0% |

## 4. गैप-कारण विश्लेषण (Honest Partials)

| गैप कारण | आवृत्ति | व्याख्या |
|---|---|---|
| `missing_evidence` | **15** | विशिष्ट प्रक्रिया/नियम का स्वतंत्र साक्ष्य रिकॉर्ड अनुपलब्ध |
| `awaiting_human_review` | **8** | मानवीय समीक्षा के लिए लंबित प्रश्न-बैंक |
| `missing_personal_eligibility` | **7** | व्यक्तिगत परिस्थिति (फंड्स, सम्बंध, मेडिकल) पर निर्भर कानूनी सलाह |
| `missing_occupation_requirements` | **2** | अन्य श्रेणी |
| `rejected` | **1** | अन्य श्रेणी |
| `unrecognized_intent` | **1** | अन्य श्रेणी |

## 5. पाँचों सेटों का संयुक्त समग्र दृश्य (2,643 प्रश्न)

| सेट | स्रोत / प्रकार | प्रश्न | Guidance | Partial | Unavail / Clarif | Error | Duplicates |
|---|---|---|---|---|---|---|---|
| 1 | Fresh 500 (Mixed Topics) | 626 | 493 (78.8%) | 121 | 12 | 0 | 0 |
| 2 | No-Repeat 500 (Corridor Spec) | 500 | 327 (65.4%) | 114 | 59 | 0 | 0 |
| 3 | Master 500 (Deep Practice) | 517 | 430 (83.2%) | 74 | 13 | 0 | 0 |
| 4 | Bank-500 Part 1–10 (Concepts) | 500 | 454 (90.8%) | 45 | 1 | 0 | 0 |
| 5 | Bank-500 Part 11–20 (Finance/Legal) | 500 | **476 (95.2%)** | 22 | 2 | 0 | 0 |
| **कुल** | **समस्त प्रोजेक्ट (5 चक्र)** | **2,643** | **2180** | **376** | **87** | **0** | **0** |
