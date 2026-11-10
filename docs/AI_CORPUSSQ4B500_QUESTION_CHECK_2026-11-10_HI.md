# SQ4B-500 (corpus social batch-4 back-pool) — पंद्रहवाँ 500-प्रश्न सेट (डुप्लिकेट-मुक्त) — 10 नवंबर 2026

निर्देश *"next 500 question not duplicate"* का पंद्रहवाँ चक्र। स्रोत = corpus **batch-4 सोशल फ़ाइल का back-pool** (`global_immigration_social_questions_60001_80000.md`; सेट-7 के 500 छोड़कर बाकी 19,500 unique से सम-दूरी 500)। इसी चक्र में चौदहवाँ सेट (`AI_GMSAB500_QUESTION_CHECK_2026-11-10_HI.md`) भी पूरा हुआ।

**चलाने-का ढंग:** in-process runner (`Temp/opencode/run-gmsC4-500.js`) — `DB_PATH` से **test-copy DB** पर `src/engine.answer()`; असली `settlement.sqlite` अछूता; fixed clock 2026-11-10T12:00Z। Raw data: [CORPUSSQ4B500_RESULTS_2026-11-10.json](CORPUSSQ4B500_RESULTS_2026-11-10.json) (245KB)।

## 1. डुप्लिकेट-प्रमाण

| जाँच | परिणाम |
|---|---|
| सेट-7 का इसी फ़ाइल से sample (expected छोड़ा) | 500 |
| **बाकी सभी पिछले सेटों (7143) से वास्तविक डुप्लिकेट** | **0** |
| बाकी पुल (19,500) के भीतर आपसी | **0** |
| चले गए | **500/500** (15 सेकंड) · **0 error** |

अब तक **पंद्रह सेट = 7643 अद्वितीय प्रश्न**।

## 2. कुल स्थिति — सेट-7 रेजिम की स्वतंत्र प्रतिलिपि

| स्थिति | सेट-7 | सेट-15 (अब) |
|---|---|---|
| `guidance` | 23 (4.6%) | **26 (5.2%)** |
| `partial` | 56 | 59 |
| `clarification` | 392 | 379 |
| `unavailable` | 29 | 36 |
| `error` | 0 | **0** |

चारों regime अब अपनी-अपनी 2× पुष्टि के साथ। लेटेंसी: मध्य 27ms · p95 43ms।

## 3. स्तर-वार खोज — परिष्कृत-स्तर (Expert/Extreme) ही सलाह दिला पाते

| स्तर | प्रश्न | guidance | partial | clarif |
|---|---|---|---|---|
| Expert | 100 | **11** | 17 | 71 |
| Extreme | 100 | **12** | 17 | 69 |
| Basic | 100 | 2 | 8 | 80 |
| Intermediate | 100 | 0 | 11 | 78 |
| Advanced | 100 | 1 | 6 | 81 |

यानी बैंक के "बड़े मानसिक-निर्णायक" प्रश्न ("least-risk path", "fact-pattern construct", "automated-decision appeal", "layed-off worker records unavailable") कवर-देशों (SE, NZ, AU, IE, SG, ES) पर स्रोत-आधारित निकले; बाकी 77 देशों (Latvia, Hungary, Slovakia, Guatemala...) से कवरेज न होने पर साफ-स्पष्टीकरण/इनकार।

## 4. गैप-कारण

`missing_or_unsupported_geography` **415** · `awaiting_human_review` 142 · `missing_evidence` 61 · `limited_country_coverage` 31 · occupation 5 · eligibility 4 · intent 3।

4 इनकार नमूने सब-वर्जित ( छात्र-वर्क वर्क-अधिकार NL/Barcelona एजेंसी-फीस, करार-करार तुलना SE, "आप होते तो क्या करते" AU, biometric-mismatch UAE)। स्पष्टीकरण नमूने: "मुझसे पूछने में शर्म आती है कि मुफ्त-सहायता कहाँ मिलेगी" (Nepal/Morocco) — यानी corpus की संवेदनशील-शैली भी इंजन ने ठीक हाथ से ली।

## 5. पंद्रहों सेटों का संयुक्त दृश्य (7643 प्रश्न)

| | सेट-1 | सेट-2 | सेट-3 | सेट-4 | सेट-5 | सेट-6 | सेट-7 | सेट-8 | सेट-9 | सेट-10 | सेट-11 | सेट-12 | सेट-13 | सेट-14 | सेट-15 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| प्रश्न | 626 | 500 | 517 | 500 | 499 | 500 | 500 | 500 | 500 | 500 | 500 | 500 | 500 | 500 | 500 |
| guidance% | 78.8 | 65 | 83.2 | 90.8 | 95.2 | 93.8 | 4.6 | 5.2 | 17 | 0 | 71.6 | 15.8 | 72.8 | 0 | **5.2** |
| error | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **0** |

**सामूहिक:** पंद्रह स्वतंत्र बैंकों में **7643 अद्वितीय प्रश्न · हर जोड़ी शून्य डुप्लिकेट · शून्य error · शून्य बनाया-गया जवाब**।

## 6. अगले कदम

पूल बचे: corpus batch-3 back (~19,500), market-gap back (~19,000), GMS batch-2 back (~19,000), अनछुआ 200-tail। या मरम्मत-बैच (सिफारिश): ① portal/evidence/transitional_rules ② directory-class ③ eligibility/checklist/processing ④ missing_evidence ⑤ ब्राउज़र P1।
