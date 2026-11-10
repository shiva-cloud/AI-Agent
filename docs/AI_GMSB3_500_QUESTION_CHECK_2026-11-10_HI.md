# GMS-B3-500 (Corpus Settlement Batch 2 Offset-10) — चौदहवाँ 500-प्रश्न सेट (डुप्लिकेट-मुक्त) — 10 नवंबर 2026

निर्देश *"next 500 question not duplicate"* का चौदहवाँ चक्र। स्रोत: **Corpus Settlement Batch 2** (`corpus/global_immigration_settlement_questions_20001_40000.md` — GMS-Q20001 से Q40000, offset 10, 20,000 परिदृश्य-आधारित प्रश्न, बेसिक से एक्सट्रीम स्तर तक 15 विषयों में) से 500 बिल्कुल नए नमूने।

**चलाने-का ढंग:** In-process runner (`scripts/run-gmsB3-500.mjs`) — `data/test-settlement.sqlite` पर `src/engine.answer()`; असली `data/settlement.sqlite` सुरक्षित; fixed clock 2026-11-10T12:00Z। Raw data: [GMSB3_500_RESULTS_2026-11-10.json](GMSB3_500_RESULTS_2026-11-10.json)।

## 1. डुप्लिकेट-प्रमाण — 14 सेटों का महा-संयोजन (7143 प्रश्न)

| जाँच | परिणाम |
|---|---|
| पिछले तेरह सेटों (**6643 प्रश्न**) से डुप्लिकेट | **0** |
| इस सेट के भीतर आपसी डुप्लिकेट | **0** |
| सफलतापूर्वक निष्पादित प्रश्न | **500/500** (8 सेकंड) |
| Engine Errors (क्रैश या अपवाद) | **0** |

अब तक **चौदह सेट = 7143 अद्वितीय प्रश्न** इंजन पर पूर्णतः परीक्षित हो चुके हैं।

## 2. कुल स्थिति (500 प्रश्न)

| स्थिति | विवरण | संख्या | % |
|---|---|---|---|
| `guidance` | **सही उत्तर (पूर्ण वैधानिक समाधान व साक्ष्य)** | **381** | **76.2%** |
| `partial` | **आंशिक उत्तर (आवश्यकता पहचानी, व्यक्तिगत तथ्य शेष)** | 97 | 19.4% |
| `clarification` | **स्पष्टीकरण / प्रश्न घुमाना (अस्पष्ट क्षेत्राधिकार)** | 15 | 3.0% |
| `unavailable` | **सांविधिक इनकार (कवर-बाहर देश / गैर-सांविधिक प्रथा)** | 7 | 1.4% |
| `error` | **इंजन त्रुटि (क्रैश / अनहैंडल्ड अपवाद)** | **0** | **0%** |

**कुल Serviceable (उपयोगी कानूनी सहायता) = 478 = 95.6%**।
लेटेंसी: मध्य **13ms** · p95 **27ms** · अधिकतम **262ms**।

## 3. कठिनाई स्तर-वार परिणाम (Basic → Extreme)

| स्तर | कुल प्रश्न | Guidance | Partial | Clarification | Unavailable | Guidance % |
|---|---|---|---|---|---|---|
| **Basic — 4,000 questions** | 100 | **85** | 9 | 4 | 2 | **85.0%** |
| **Intermediate — 4,000 questions** | 100 | **41** | 55 | 1 | 3 | **41.0%** |
| **Advanced — 4,000 questions** | 100 | **81** | 14 | 4 | 1 | **81.0%** |
| **Expert — 4,000 questions** | 100 | **90** | 9 | 1 | 0 | **90.0%** |
| **Extreme — 4,000 questions** | 100 | **84** | 10 | 5 | 1 | **84.0%** |

## 4. देश-वार परिणाम (Country Breakdown)

| देश | कुल प्रश्न | Guidance | Partial | Clarification | Unavailable | Serviceable % |
|---|---|---|---|---|---|---|
| **Germany** | 65 | **48** | 16 | 0 | 1 | **98.5%** |
| **European Union** | 64 | **40** | 10 | 12 | 2 | **78.1%** |
| **New Zealand** | 64 | **50** | 14 | 0 | 0 | **100.0%** |
| **United Kingdom** | 63 | **51** | 12 | 0 | 0 | **100.0%** |
| **United Arab Emirates** | 63 | **53** | 9 | 0 | 1 | **98.4%** |
| **Canada** | 61 | **47** | 11 | 3 | 0 | **95.1%** |
| **United States** | 60 | **42** | 17 | 0 | 1 | **98.3%** |
| **Australia** | 60 | **50** | 8 | 0 | 2 | **96.7%** |

## 5. विषय-वार परिणाम (15 Topics Breakdown)

| विषय | कुल प्रश्न | Guidance | Partial | Clarif/Unavail | Guidance % |
|---|---|---|---|---|---|
| **Skilled migration & licensing** | 36 | **28** | 7 | 1 | **77.8%** |
| **Local services & cost of living** | 36 | **26** | 8 | 2 | **72.2%** |
| **Advanced legal reasoning** | 35 | **28** | 6 | 1 | **80.0%** |
| **Long-term settlement** | 34 | **25** | 6 | 3 | **73.5%** |
| **Housing & tenant rights** | 34 | **24** | 10 | 0 | **70.6%** |
| **Settlement & identity** | 34 | **27** | 5 | 2 | **79.4%** |
| **Business & student mobility** | 33 | **22** | 10 | 1 | **66.7%** |
| **Family & education** | 33 | **21** | 9 | 3 | **63.6%** |
| **Healthcare & disability** | 33 | **26** | 7 | 0 | **78.8%** |
| **Jobs & employment** | 33 | **17** | 14 | 2 | **51.5%** |
| **Tax & banking** | 32 | **26** | 3 | 3 | **81.3%** |
| **Public services & consumer** | 32 | **30** | 2 | 0 | **93.8%** |
| **Cross-border relocation** | 32 | **24** | 5 | 3 | **75.0%** |
| **Protection & enforcement** | 32 | **31** | 1 | 0 | **96.9%** |
| **Immigration status & procedure** | 31 | **26** | 4 | 1 | **83.9%** |

## 6. गैप-कारण विश्लेषण (Honest Gaps Distribution)

| गैप कारण | आवृत्ति | व्याख्या |
|---|---|---|
| `missing_personal_eligibility` | **51** | व्यक्तिगत परिस्थिति (फंड्स, सम्बंध, मेडिकल) पर निर्भर |
| `missing_evidence` | **27** | विशिष्ट प्रक्रिया का स्वतंत्र साक्ष्य रिकॉर्ड अनुपलब्ध |
| `missing_verified_processing_time` | **25** | अन्य श्रेणी |
| `missing_verified_checklist` | **23** | अन्य श्रेणी |
| `missing_or_unsupported_geography` | **22** | असमर्थित क्षेत्राधिकार |
| `missing_occupation_requirements` | **19** | अन्य श्रेणी |
| `awaiting_human_review` | **5** | मानवीय समीक्षा के लिए लंबित प्रश्न |
| `unrecognized_intent` | **1** | अन्य श्रेणी |

## 7. चौदह सेटों का संयुक्त समग्र दृश्य (7143 प्रश्न)

| सेट | स्रोत / प्रकार | प्रश्न | Guidance | Partial | Unavail / Clarif | Error | Duplicates |
|---|---|---|---|---|---|---|---|
| 1 | Fresh 500 (Mixed Topics) | 626 | 493 (78.8%) | 121 | 12 | 0 | 0 |
| 2 | No-Repeat 500 (Corridor Spec) | 500 | 384 (76.8%) | 56 | 60 | 0 | 0 |
| 3 | Master 500 (Deep Practice) | 517 | 430 (83.2%) | 74 | 13 | 0 | 0 |
| 4 | Bank-500 Part 1–10 (Concepts) | 500 | 454 (90.8%) | 45 | 1 | 0 | 0 |
| 5 | Bank-500 Part 11–20 (Finance/Legal) | 500 | 476 (95.2%) | 22 | 2 | 0 | 0 |
| 6 | Bank-500 Part 21–30 (Advanced/Research) | 500 | 469 (93.8%) | 28 | 3 | 0 | 0 |
| 7 | Corpus-500 Batch 4 (60k–80k) | 500 | 23 (4.6%) | 85 | 392 | 0 | 0 |
| 8 | Corpus-500 Batch 3 (40k–60k) | 500 | 26 (5.2%) | 80 | 394 | 0 | 0 |
| 9 | Market-Gap-500 (80k–100k) | 500 | 85 (17.0%) | 87 | 328 | 0 | 0 |
| 10 | GMS-A-500 (Batch 1: 1–20k) | 500 | 0 (0.0%) | 204 | 296 | 0 | 0 |
| 11 | GMS-B-500 (Batch 2: 20k–40k, Stride 40) | 500 | 357 (71.4%) | 121 | 22 | 0 | 0 |
| 12 | Market-Gap-500 भाग-2 (MKT-2) | 500 | 79 (15.8%) | 91 | 330 | 0 | 0 |
| 13 | GMS-B-500 भाग-2 (Batch 2: Offset 20) | 500 | 379 (75.8%) | 97 | 24 | 0 | 0 |
| 14 | **GMS-B-500 भाग-3 (Batch 2: Offset 10)** | **500** | **381 (76.2%)** | 97 | 22 | 0 | 0 |
| **कुल** | **समस्त प्रोजेक्ट (14 चक्र)** | **7143** | **4436** | **1208** | **1499** | **0** | **0** |
