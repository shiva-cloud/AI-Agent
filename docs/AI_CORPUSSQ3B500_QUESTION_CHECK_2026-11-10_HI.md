# SQ3B-500 (corpus social batch-3 back-pool) — सोलहवाँ 500-प्रश्न सेट (डुप्लिकेट-मुक्त) — 10 नवंबर 2026

निर्देश *"next 500 question not duplicate"* का सोलहवाँ चक्र। स्रोत = corpus **batch-3 सोशल फ़ाइल का back-pool** (`global_immigration_social_questions_40001_60000.md`; सेट-8 के 500 छोड़कर बाकी 19,500 unique से सम-दूरी 500)।

**चलाने-का ढंग:** in-process runner (`Temp/opencode/run-gmsC3-500.js`) — `DB_PATH` से **test-copy DB** पर `src/engine.answer()`; असली `settlement.sqlite` अछूता; fixed clock 2026-11-10T12:00Z। Raw data: [CORPUSSQ3B500_RESULTS_2026-11-10.json](CORPUSSQ3B500_RESULTS_2026-11-10.json) (244KB)।

## 1. डुप्लिकेट-प्रमाण

| जाँच | परिणाम |
|---|---|
| सेट-8 का इसी फ़ाइल से sample (expected छोड़ा) | 500 |
| **बाकी सभी पिछले सेटों (7643) से वास्तविक डुप्लिकेट** | **0** |
| बाकी पुल (19,500) के भीतर आपसी | **0** |
| चले गए | **500/500** (15 सेकंड) · **0 error** |

अब तक **सोलह सेट = 8143 अद्वितीय प्रश्न**।

## 2. कुल स्थिति — सेट-8 रेजिम की स्वतंत्र प्रतिलिपि

| स्थिति | सेट-8 | सेट-16 (अब) |
|---|---|---|
| `guidance` | 26 (5.2%) | **22 (4.4%)** |
| `partial` | 52 | 48 |
| `clarification` | 395 | 399 |
| `unavailable` | 27 | 31 |
| `error` | 0 | **0** |

लेटेंसी: मध्य 28ms · p95 43ms।

## 3. कवरेज-विभाजन — ज्यादातर सफलता के पाँच देशों में ही गई

| खंड | प्रश्न | guidance | स्पष्टीकरण |
|---|---|---|---|
| कवर-देश से (AU/CA/UK/US/DE/SE/SG/NL/NZ/IE/ES/UAE) | 71 | **18** | 2 |
| गैर-कवर प्रश्नों में (Pakistan ×16, S-Korea, Ghana, Norway, Japan, Nepal, Qatar…) | 429 | 4 | 397 |

77 विभिन्न देशों का वितरण — गैर-कवर पर इंजन सर्वत्र साफ-स्पष्टीकरण (मनगढ़ंत से बचा)। गैप-कारण: `missing_or_unsupported_geography` **428** · `awaiting_human_review` 134 · `missing_evidence` 48 · limited_country_coverage 23।

## 4. स्तर-वार

Expert 4, Extreme **7** सलाह-वाले प्रश्न — फिर सेट-15 जैसा उद्घाटन-तन्त्र (Basic/Intermediate पर केवल 3-3, geo-कवरेज सीमा)। सलाह-सफल सैम्पल्स: SE विशेष-शिक्षा, AU मोल्ड-हीटिंग QLD, TX स्कूल-दाखिला, UK विदेशी-डिग्री मान्यता, IE गालवे रिकॉर्ड-वापसी, NL विदेशी-डिग्री कानून-vs-एजेंसी प्रैक्टिस।

4 इनकार में निर्देशिका-माँग प्रश्न ("Is border officer searches device handled locally or nationally in Sharjah") और दस्तावेज़-माँग प्रश्न ("What should I document today about remote work—Belfast") — यानी जितने प्रश्न जितने पर रिकॉर्ड-वर्ग है ही नहीं, उतने केवल इनकार।

## 5. सोलहों सेटों का संयुक्त दृश्य (8143 प्रश्न)

| | सेट-1 | सेट-2 | सेट-3 | सेट-4 | सेट-5 | सेट-6 | सेट-7 | सेट-8 | सेट-9 | सेट-10 | सेट-11 | सेट-12 | सेट-13 | सेट-14 | सेट-15 | सेट-16 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| guidance% | 78.8 | 65 | 83.2 | 90.8 | 95.2 | 93.8 | 4.6 | 5.2 | 17 | 0 | 71.6 | 15.8 | 72.8 | 0 | 5.2 | **4.4** |
| error | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **0** |

**सामूहिक:** सोलह स्वतंत्र बैंकों में **8143 अद्वितीय प्रश्न · हर जोड़ी शून्य डुप्लिकेट · शून्य error · शून्य बनाया-गया जवाब।**

## 6. अगले कदम

बचे पूल: market-gap back (~19,000), GMS batch-2 back (~19,000), GMS batch-1 back (~19,000), corpus batch-4 back (~19,000), अनछुआ 200-tail। या मरम्मत-बैच: ① portal/evidence/transitional_rules ② directory-class ③ eligibility/checklist/processing ④ missing_evidence ⑤ ब्राउज़र P1।
