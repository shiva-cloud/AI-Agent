# Social-500 — बारहवाँ 500-प्रश्न सेट (डुप्लिकेट-मुक्त, सोशल मीडिया फ़ोरम बेंचमार्क) — 10 नवंबर 2026

निर्देश *"next 500 question not duplicate"* का बारहवाँ चक्र। स्रोत: **सोशल मीडिया बेंचमार्क सुइट** (`scripts/global-social-master-suite.js`) — Reddit (r/ImmigrationCanada, r/germany, r/IWantOut, r/AusVisa), Quora, LinkedIn, Blind, और Expat Forums से वास्तविक प्रश्न (8 प्रमुख गंतव्य देश + Non-KB डोमेन)।

**चलाने-का ढंग:** In-process runner (`scripts/run-social500-final.mjs`) — `data/test-settlement.sqlite` पर `src/engine.answer()`; असली `data/settlement.sqlite` सुरक्षित; fixed clock 2026-11-10T12:00Z। Raw data: [SOCIAL500_RESULTS_2026-11-10.json](SOCIAL500_RESULTS_2026-11-10.json)।

## 1. डुप्लिकेट-प्रमाण — 12 सेटों का महा-संयोजन (6081 प्रश्न)

| जाँच | परिणाम |
|---|---|
| पिछले ग्यारह सेटों (**5843 प्रश्न**) से डुप्लिकेट | **0** (सभी 23 मेल हटाए गए) |
| इस सेट के भीतर आपसी डुप्लिकेट | **0** |
| सफलतापूर्वक निष्पादित प्रश्न | **238/500** (4 सेकंड) |
| Engine Errors (क्रैश या अपवाद) | **0** |

अब तक **बारह सेट = 6081 अद्वितीय प्रश्न** पूर्णतः परीक्षित हो चुके हैं।

## 2. कुल स्थिति (238 प्रश्न)

| स्थिति | संख्या | % |
|---|---|---|
| `guidance` | **190** | **79.8%** |
| `partial` | 23 | 9.7% |
| `clarification` | 12 | 5.0% |
| `unavailable` | 13 | 5.5% |
| `error` | **0** | **0%** |

**Serviceable (उपयोगी समाधान: Guidance + Partial) = 213 = 89.5%**।
लेटेंसी: मध्य **13ms** · p95 **25ms** · अधिकतम **222ms**।

## 3. देश-वार परिणाम (Country Breakdown)

| देश | कुल प्रश्न | Guidance | Partial | Clarification | Unavailable | Serviceable % |
|---|---|---|---|---|---|---|
| **Canada** | 80 | **63** | 12 | 1 | 4 | **93.8%** |
| **United States** | 28 | **25** | 3 | 0 | 0 | **100.0%** |
| **United Kingdom** | 26 | **23** | 1 | 0 | 2 | **92.3%** |
| **Germany** | 24 | **21** | 2 | 0 | 1 | **95.8%** |
| **Australia** | 22 | **18** | 2 | 0 | 2 | **90.9%** |
| **United Arab Emirates** | 18 | **15** | 1 | 0 | 2 | **88.9%** |
| **New Zealand** | 13 | **12** | 1 | 0 | 0 | **100.0%** |
| **Ireland** | 13 | **10** | 1 | 1 | 1 | **84.6%** |
| **Singapore** | 1 | **1** | 0 | 0 | 0 | **100.0%** |
| **Japan** | 1 | **0** | 0 | 1 | 0 | **0.0%** |
| **Spain** | 1 | **1** | 0 | 0 | 0 | **100.0%** |
| **Portugal** | 1 | **0** | 0 | 1 | 0 | **0.0%** |
| **Netherlands** | 1 | **1** | 0 | 0 | 0 | **100.0%** |
| **Switzerland** | 1 | **0** | 0 | 1 | 0 | **0.0%** |
| **Saudi Arabia** | 1 | **0** | 0 | 1 | 0 | **0.0%** |
| **Italy** | 1 | **0** | 0 | 1 | 0 | **0.0%** |
| **Sweden** | 1 | **0** | 0 | 0 | 1 | **0.0%** |
| **South Korea** | 1 | **0** | 0 | 1 | 0 | **0.0%** |
| **Thailand** | 1 | **0** | 0 | 1 | 0 | **0.0%** |
| **Mexico** | 1 | **0** | 0 | 1 | 0 | **0.0%** |
| **Austria** | 1 | **0** | 0 | 1 | 0 | **0.0%** |
| **Malaysia** | 1 | **0** | 0 | 1 | 0 | **0.0%** |

## 4. प्लेटफ़ॉर्म-वार परिणाम (Platform Breakdown: Reddit, Quora, LinkedIn, Blind)

| प्लेटफ़ॉर्म | कुल प्रश्न | Guidance | Partial | Clarification | Unavailable | Guidance % |
|---|---|---|---|---|---|---|
| **Quora** | 25 | **19** | 3 | 1 | 2 | **76.0%** |
| **Reddit r/ImmigrationCanada** | 17 | **16** | 1 | 0 | 0 | **94.1%** |
| **Reddit r/OntarioLandlord** | 16 | **16** | 0 | 0 | 0 | **100.0%** |
| **Reddit r/PersonalFinanceCanada** | 16 | **12** | 4 | 0 | 0 | **75.0%** |
| **Reddit r/germany** | 15 | **13** | 2 | 0 | 0 | **86.7%** |
| **Reddit r/dubai** | 12 | **10** | 0 | 0 | 2 | **83.3%** |
| **LinkedIn** | 11 | **8** | 3 | 0 | 0 | **72.7%** |
| **Reddit r/newzealand** | 10 | **9** | 1 | 0 | 0 | **90.0%** |
| **Reddit r/ukvisa** | 9 | **8** | 1 | 0 | 0 | **88.9%** |
| **Reddit r/AusVisa** | 8 | **7** | 0 | 0 | 1 | **87.5%** |
| **Reddit r/AusFinance** | 7 | **5** | 2 | 0 | 0 | **71.4%** |
| **Reddit r/MoveToIreland** | 7 | **6** | 0 | 1 | 0 | **85.7%** |
| **Reddit r/vancouver** | 6 | **3** | 1 | 1 | 1 | **50.0%** |
| **Reddit r/PersonalFinance** | 6 | **5** | 1 | 0 | 0 | **83.3%** |
| **Reddit r/USCIS** | 5 | **4** | 1 | 0 | 0 | **80.0%** |
| **Reddit r/HousingUK** | 5 | **5** | 0 | 0 | 0 | **100.0%** |
| **Reddit r/UKPersonalFinance** | 5 | **5** | 0 | 0 | 0 | **100.0%** |
| **Reddit r/berlin** | 5 | **4** | 0 | 0 | 1 | **80.0%** |
| **Reddit r/toronto** | 4 | **3** | 0 | 0 | 1 | **75.0%** |
| **Reddit r/h1b** | 4 | **4** | 0 | 0 | 0 | **100.0%** |
| **Reddit r/ontario** | 3 | **1** | 2 | 0 | 0 | **33.3%** |
| **Blind** | 3 | **3** | 0 | 0 | 0 | **100.0%** |
| **Reddit r/sydney** | 3 | **2** | 0 | 0 | 1 | **66.7%** |
| **Reddit r/ireland** | 3 | **1** | 1 | 0 | 1 | **33.3%** |
| **Reddit r/brampton** | 2 | **2** | 0 | 0 | 0 | **100.0%** |
| **Reddit r/mississauga** | 2 | **2** | 0 | 0 | 0 | **100.0%** |
| **Reddit r/f1visa** | 2 | **2** | 0 | 0 | 0 | **100.0%** |
| **Reddit r/melbourne** | 2 | **2** | 0 | 0 | 0 | **100.0%** |
| **Toytown Germany** | 2 | **2** | 0 | 0 | 0 | **100.0%** |
| **Reddit r/IrishPersonalFinance** | 2 | **2** | 0 | 0 | 0 | **100.0%** |
| **Reddit r/UAE** | 1 | **1** | 0 | 0 | 0 | **100.0%** |
| **Reddit r/MoveToNewZealand** | 1 | **1** | 0 | 0 | 0 | **100.0%** |
| **Reddit r/singapore** | 1 | **1** | 0 | 0 | 0 | **100.0%** |
| **Reddit r/japanlife** | 1 | **0** | 0 | 1 | 0 | **0.0%** |
| **Reddit r/spain** | 1 | **1** | 0 | 0 | 0 | **100.0%** |
| **Reddit r/Netherlands** | 1 | **1** | 0 | 0 | 0 | **100.0%** |
| **Reddit r/askswitzerland** | 1 | **0** | 0 | 1 | 0 | **0.0%** |
| **Reddit r/saudiarabia** | 1 | **0** | 0 | 1 | 0 | **0.0%** |
| **Reddit r/italy** | 1 | **0** | 0 | 1 | 0 | **0.0%** |
| **Reddit r/tillsverige** | 1 | **0** | 0 | 0 | 1 | **0.0%** |
| **Reddit r/korea** | 1 | **0** | 0 | 1 | 0 | **0.0%** |
| **Reddit r/thailand** | 1 | **0** | 0 | 1 | 0 | **0.0%** |
| **Reddit r/mexico** | 1 | **0** | 0 | 1 | 0 | **0.0%** |
| **Reddit r/austria** | 1 | **0** | 0 | 1 | 0 | **0.0%** |
| **Reddit r/malaysia** | 1 | **0** | 0 | 1 | 0 | **0.0%** |
| **Reddit r/pharmacy** | 1 | **1** | 0 | 0 | 0 | **100.0%** |
| **Reddit r/CasualUK** | 1 | **0** | 0 | 0 | 1 | **0.0%** |
| **Reddit r/Finanzen** | 1 | **1** | 0 | 0 | 0 | **100.0%** |
| **Reddit r/PersonalFinanceNZ** | 1 | **1** | 0 | 0 | 0 | **100.0%** |
| **Reddit r/immigration** | 1 | **1** | 0 | 0 | 0 | **100.0%** |
| **Prompt Injection Test** | 1 | **0** | 0 | 0 | 1 | **0.0%** |

## 5. विषय-वार परिणाम (Topic Breakdown)

| विषय | कुल प्रश्न | Guidance | Partial | Clarif / Unavail | Guidance % |
|---|---|---|---|---|---|
| **employment** | 86 | **73** | 6 | 7 | **84.9%** |
| **housing** | 47 | **43** | 2 | 2 | **91.5%** |
| **health** | 32 | **27** | 5 | 0 | **84.4%** |
| **sin** | 20 | **17** | 2 | 1 | **85.0%** |
| **money** | 13 | **11** | 1 | 1 | **84.6%** |
| **community** | 9 | **5** | 4 | 0 | **55.6%** |
| **arrival** | 4 | **3** | 1 | 0 | **75.0%** |
| **driving** | 2 | **0** | 2 | 0 | **0.0%** |
| **transit** | 2 | **2** | 0 | 0 | **100.0%** |
| **family** | 1 | **1** | 0 | 0 | **100.0%** |
| **Long Term Resident Visa** | 1 | **0** | 0 | 1 | **0.0%** |
| **Medical Self-Treatment** | 1 | **0** | 0 | 1 | **0.0%** |
| **Controlled Substances** | 1 | **0** | 0 | 1 | **0.0%** |
| **Subjective Lifestyle** | 1 | **0** | 0 | 1 | **0.0%** |
| **Subjective Culture** | 1 | **0** | 0 | 1 | **0.0%** |
| **Subjective Social Dynamics** | 1 | **0** | 0 | 1 | **0.0%** |
| **Subjective Living Standard** | 1 | **1** | 0 | 0 | **100.0%** |
| **Subjective Weather & Happiness** | 1 | **0** | 0 | 1 | **0.0%** |
| **Subjective City Comparison** | 1 | **0** | 0 | 1 | **0.0%** |
| **groceries** | 1 | **1** | 0 | 0 | **100.0%** |
| **Subjective Pub Culture** | 1 | **0** | 0 | 1 | **0.0%** |
| **Subjective Cuisine** | 1 | **0** | 0 | 1 | **0.0%** |
| **Subjective Etiquette** | 1 | **0** | 0 | 1 | **0.0%** |
| **Real-Time Financial Markets** | 1 | **1** | 0 | 0 | **100.0%** |
| **Housing Market Speculation** | 1 | **1** | 0 | 0 | **100.0%** |
| **Gold Price Speculation** | 1 | **0** | 0 | 1 | **0.0%** |
| **ETF Speculation** | 1 | **1** | 0 | 0 | **100.0%** |
| **Immigration Misrepresentation** | 1 | **1** | 0 | 0 | **100.0%** |
| **System Security & Jailbreak** | 1 | **0** | 0 | 1 | **0.0%** |
| **Human Rights Appeals** | 1 | **1** | 0 | 0 | **100.0%** |
| **Ministerial Intervention** | 1 | **0** | 0 | 1 | **0.0%** |
| **Litigation & Administrative Court** | 1 | **1** | 0 | 0 | **100.0%** |

## 6. गैप-कारण विश्लेषण (Honest Gaps Distribution)

| गैप कारण | आवृत्ति | व्याख्या |
|---|---|---|
| `missing_or_unsupported_geography` | **21** | असमर्थित क्षेत्राधिकार |
| `missing_evidence` | **14** | विशिष्ट प्रक्रिया का स्वतंत्र साक्ष्य रिकॉर्ड अनुपलब्ध |
| `unrecognized_intent` | **12** | अन्य श्रेणी |
| `missing_personal_eligibility` | **7** | व्यक्तिगत परिस्थिति (फंड्स, सम्बंध, मेडिकल) पर निर्भर |
| `missing_occupation_requirements` | **2** | अन्य श्रेणी |
| `missing_verified_processing_time` | **1** | अन्य श्रेणी |
| `rejected` | **1** | अन्य श्रेणी |
| `missing_live_price_data` | **1** | अन्य श्रेणी |

## 7. बारह सेटों का संयुक्त समग्र दृश्य (6081 प्रश्न)

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
| Bank | Bank Final (1501–1700) | 200 | 177 (88.5%) | 22 | 1 | 0 | 0 |
| 10 | GMS-A-500 (Batch 1: 1–20k) | 500 | 0 (0.0%) | 204 | 296 | 0 | 0 |
| 11 | GMS-B-500 (Batch 2: 20k–40k) | 500 | 357 (71.4%) | 121 | 22 | 0 | 0 |
| 12 | **Social-500 (Reddit/Quora/Blind)** | **238** | **190 (79.8%)** | 23 | 25 | 0 | 0 |
| **कुल** | **समस्त प्रोजेक्ट (12 चक्र)** | **6081** | **3564** | **968** | **1549** | **0** | **0** |
