# GMS-B-500 (corpus settlement batch-2) — ग्यारहवाँ 500-प्रश्न सेट (डुप्लिकेट-मुक्त) — 10 नवंबर 2026

निर्देश *"next 500 question not duplicate"* का ग्यारहवाँ चक्र। स्रोत = corpus की **batch-2 कनाडा-फ़ोकस फ़ाइल** (`global_immigration_settlement_questions_20001_40000.md` — GMS-Q20001–Q40000; सिर की घोषणा: "Compared against prior 20,000 using normalized exact-text deduplication") से सम-दूरी 500।

**चलाने-का ढंग (दसों पिछले सेटों वाला ही):** अपना in-process runner (`Temp/opencode/run-gmsB-500.js`) — `DB_PATH` से **test-copy DB** पर `src/engine.answer()`; असली `settlement.sqlite` अछूता; fixed clock 2026-11-10T12:00Z। Raw data: [GMSB500_RESULTS_2026-11-10.json](GMSB500_RESULTS_2026-11-10.json) (225KB)।

## 1. डुप्लिकेट-प्रमाण — ग्यारह-सेट संयोग

| जाँच | परिणाम |
|---|---|
| **दसों पिछले सेटों (4643 + 500 = 5143) से डुप्लिकेट** | **0** |
| batch-2 के parse हुए 20,000 के भीतर आपसी डुप्लिकेट | **0** |
| चले गए | **500/500** (13 सेकंड) |
| engine error | **0** |

अब तक **ग्यारह सेट = 5643 अद्वितीय प्रश्न**।

## 2. कुल स्थिति — अब तक का दूसरा सर्वोच्च

| स्थिति | संख्या | % |
|---|---|---|
| `guidance` | **358** | **71.6%** (corpus-सेटों में सर्वोच्च) |
| `partial` | 117 | 23.4% |
| `clarification` | 19 | 3.8% |
| `unavailable` | 6 | 1.2% |
| `error` | **0** | 0 |

**serviceable = 475 = 95%**

लेटेंसी: मध्य 22ms · p95 45ms · अधिकतम 336ms।

## 3. सबसे बड़ी शोध-खोज — दो आस-पास के टेम्पलेट-बैंकों का चरम अंतर

| | batch-1 (सेट-10) | batch-2 (सेट-11) |
|---|---|---|
| शैल | "Where can I find official info…" / "Which documents are needed…" / "Is X federal or provincial?" (**निर्देशिका-निर्देश**) | "Where should X **start** when dealing with…" / "What is the difference between X and…" / "What **common misconceptions**…" (**निर्णय-सलाह**) |
| guidance | **0%** | **71.6%** |

दोनों फ़ाइलें एक ही corpus-परिवार की, एक ही देश-मिश्रण वाली — पर वाक्य-रचना में मात्र एक चरण का फर्क, नतीजे में **0% ↔ 71.6%**। संदेश: इंजन का routing **इंटेंट-प्रकार** पर प्रभावी है — निर्देशिका-प्रश्न (directory-style) के लिए रिकॉर्ड-वर्ग नहीं है, निर्णय-प्रश्नों के लिए पूरा है। यह सेट-10 की परिकल्पना की सबसे सफाई देने वाली पुष्टि है।

## 4. देश-वार (सभी 8 समूह शामिल)

| समूह | प्रश्न | guidance | partial |
|---|---|---|---|
| UAE | 66 | **52** | 11 |
| Germany | 61 | **49** | 12 |
| United States | 60 | **48** | 10 |
| Australia | 61 | **45** | 16 |
| New Zealand | 63 | **45** | 17 |
| Canada | 65 | **40** | 18 |
| United Kingdom | 62 | **41** | 21 |
| European Union | 62 | 38 | 12 (+12 clarif) |

शहरों के उत्तर भी आए (Berlin 26, Dubai 25, Auckland 24, Dublin 23, Melbourne/Sydney/Christchurch 22-23)। "difference between X and Y" शैली (26 प्रश्न) में **24 गाईडेंस, 1 अंश, 0 इनकार** — तुलनात्मक-प्रश्न इंजन का सबसे मजबूत हाथ।

## 5. 117 आंशिक का आधार

`missing_verified_checklist` 26 · `missing_evidence` 19 · `missing_personal_eligibility` 15 (+6 combo) · `missing_occupation_requirements` 15 · `missing_verified_processing_time` (combo में 15) · `source_guidance` 8 · `awaiting_human_review` 6। 6 इनकार सब-जायज़। 19 स्पष्टीकरण में वही दो वर्ग: संस्थान-नाम (benefits overpay recovery), और **cross-scenario वर्ग** ("telecom early cancellation across jurisdictions", "refugee healthcare + private insurance coordination Portugal") — उपयोगकर्ता-स्थिति बिना बताए निर्णय संभव नहीं।

## 6. ग्यारहों सेटों का संयुक्त दृश्य (5643 प्रश्न)

| | सेट-1 | सेट-2 | सेट-3 | सेट-4 | सेट-5 | सेट-6 | सेट-7 | सेट-8 | सेट-9 | सेट-10 | सेट-11 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| स्रोत | fresh | NR | master | bankA | bankB | bankC | corpus b4 | corpus b3 | MKT | GMS-A | **GMS-B** |
| प्रश्न | 626 | 500 | 517 | 500 | 499 | 500 | 500 | 500 | 500 | 500 | 500 |
| guidance% | 78.8 | 65 | 83.2 | 90.8 | 95.2 | 93.8 | 4.6 | 5.2 | 17 | 0 | **71.6** |
| error | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

**सामूहिक:** ग्यारह स्वतंत्र बैंकों में **5643 अद्वितीय प्रश्न · हर जोड़ी शून्य डुप्लिकेट · शून्य error · शून्य बनाया-गया जवाब**।

## 7. दो मुख्य मरम्मत-संकेत (अपडेटेड)

1. **Directory-style रिकॉर्ड-वर्ग** — अब दो स्वतंत्र प्रमाण (सेट-10: 0% जहाँ सहज असंभव; सेट-11 दिखाया कि वर्ग-निर्माण के साथ 71.6% स्तर संभव)। "Which agency handles X in Y" प्रश्नों का पंक्ति-सूचक रिकॉर्ड प्राथमिकता।
2. **Checklist/processing-time अपूरण** — batch-2 के आंशिकों का आधार-वर्ग (checklist 32, processing-time) — तैयार प्रकाशन-सूची।
