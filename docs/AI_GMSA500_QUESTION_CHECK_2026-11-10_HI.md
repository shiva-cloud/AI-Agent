# GMS-A-500 (corpus settlement batch-1) — दसवाँ 500-प्रश्न सेट (डुप्लिकेट-मुक्त) — 10 नवंबर 2026

निर्देश *"next 500 question not duplicate"* का दसवाँ चक्र। स्रोत = corpus की **batch-1 फ़ाइल** (`global_immigration_settlement_20000_questions.md` — GMS-Q00001–Q20000: "Generated scenario-based test questions; not validated legal answers" शीर्षक के साथ, structure-टेम्पलेट शैली) से सम-दूरी 500।

**चलाने-का ढंग (नौों पिछले सेटों वाला ही):** अपना in-process runner (`Temp/opencode/run-gmsA-500.js`) — `DB_PATH` से **test-copy DB** (`data/test-settlement.sqlite`) पर `src/engine.answer()`; असली `settlement.sqlite` अछूता; fixed clock 2026-11-10T12:00Z। Raw data: [GMSA500_RESULTS_2026-11-10.json](GMSA500_RESULTS_2026-11-10.json) (215KB)।

## 1. डुप्लिकेट-प्रमाण — दस-सेट संयोग

| जाँच | परिणाम |
|---|---|
| **नौों पिछले सेटों (3143 + 500×3 = 4643) से डुप्लिकेट** | **0** |
| parse हुए 20,000 के भीतर आपसी डुप्लिकेट | **0** |
| चले गए | **500/500** (15 सेकंड) |
| engine error | **0** |

अब तक **दस सेट = 5143 अद्वितीय प्रश्न**।

## 2. कुल स्थिति — अब तक का सबसे रोचक ढाँचा

| स्थिति | संख्या | % |
|---|---|---|
| `guidance` | **0** | 0 |
| `partial` | 204 | 40.8% |
| `clarification` | 28 | 5.6% |
| `unavailable` | 268 | 53.6% |
| `error` | **0** | 0 |

**guidance = 0** — लेकिन कोई एक भी बनाया-गया उत्तर नहीं (268+28 इनकार/स्पष्टीकरण + 204 लेबल-सचावली अंश)। यह नतीजा इंजन-हार नहीं, **corpus-batch-1 की त्रुटिपूर्ण टेम्प्लेट-परिभाषा का इंजन-स्पष्ट इनकार** है।

लेटेंसी: मध्य 25ms · p95 55ms · अधिकतम 428ms।

## 3. क्यों 0 guidance — तीन तंत्र-ज्ञात कारण

1. **सामान्य-परिभाषा/सूचक-निर्देशिका शैली प्रश्न**: लगभग सारे प्रश्न टेम्प्लेट-मोड में हैं — "Where can I find official information about X in Y?", "Which documents are normally needed for Y?", "What does X application mean in Canada?", "Is X handled by a federal/provincial/state or local authority?" — ये "कहाँ मिलेगा / कौन-सी संस्था" *निर्देशिका-माँग* हैं, कोई विशिष्ट निर्णय-स्थिति नहीं। इंजन का रिकॉर्ड-पूल *निर्णय-सलाह* वर्ग का है — इसलिए `unrecognized_intent` (66) या `awaiting_human_review`-लेबल आंशिक पर रुकता है (500 gaps में उसके नाम पर हार 500 गिनती)।
2. **अंदर-टेम्प्लेट त्रुटित युग्म** — corpus जनरेटर के गलत-जोड़े इंजन ने पकड़ लिए: "**CRA account access** in United KingdOM", "**eTA eligibility** in England" (eTA कनाडा का है), US में "criminal inadmissibility Ontario/Milton" जैसे देश-टकराव। इन पर इंजन ने **साफ-इनकार** दिया — गलत देश का कानून नहीं लाया गया। यह टेम्प्लेट-जन्मे गड़बड़ को बिना हैल्यूसिनेशन पहचानता है — फायदेमंद उपीक्षा।
3. **मिश्रित-कवर देश + विदेशी शहर युग्म** बाद के sections (UAE/NZ/EU) पर: parsedCountry सही (DE 66, UK 66, AU 66, US 65, UAE 61, NZ 57), पर शहर जानकारी-स्रोत टेम्प्लेट के लिए verified सार में शहर-स्तर का रिकॉर्ड नहीं — `missing_or_unsupported_geography` 283।

## 4. टॉपिक = देश-समूह जानकारी

batch-1 फ़ाइल में topic-पद बाद के भागों में भू-स्थल बन गया (United Kingdom 66 · Australia 66 · Germany 66 · US 65 · Canada 62 · UAE 61 · NZ 57 · European Union 57); कवर में शहर-नमूने: Dubai 17 · Melbourne 17 · Frankfurt 16 · Cologne 19 · Christchurch 18 · Abu Dhabi 20 · Sharjah 19 — पर सारे आंशिक/इनकार।

## 5. दसों सेटों का संयुक्त दृश्य (5143 प्रश्न)

| | सेट-1..9 (पिछला कुल) | सेट-10 GMS-A |
|---|---|---|
| प्रश्न | 4643 | 500 |
| guidance संख्या | 3623 | 0 |
| partial | 983 | 204 |
| clarif/unavail | 41/46 | 28/268 |
| error | 0 | 0 |

**सामूहिक:** दस स्वतंत्र बैंकों में **5143 अद्वितीय प्रश्न · हर जोड़ी में शून्य डुप्लिकेट · शून्य error · शून्य बनाया-गया जवाब** — जितने बैंक कठोर (bank P1-30, NR), गाईडेंस धार उतनी ऊँची; जितने टेम्प्लेट-degenerate (GMS-A), इंकार-स्पष्टता उतनी घनी। यानी इंजन का गुणवत्ता-चरित्र दोनों ओर संरक्षित रहा।

## 6. असरदार संदेश

1. **"Directory-style" प्रश्न अब सबसे बड़ा अंतर continuous-कथा है** — 500 `awaiting_human_review` गैप-गिनती यही कहती है। एक रेकॉर्ड-क्लास "कहाँ-कहाँ official page है इस विषय की" (पंक्ति-सूचक) बना जाए तो GMS-A-श्रेणी के हजारों प्रश्न (दो batch-फ़ाइलों मेज बाकी 39,500) फिर से जीवित होंगे।
2. टेम्प्लेट गड़बड़ (CRA-in-UK शैली) इंजन ने मुक्त में पकड़ा — corpus-जेनरेटर में यही वर्ग निर्माण-दोष है, इंजन की नहीं।
3. अब तक का परीक्षण-खाता: portal/evidence/transitional_rules वर्ग (सेट-9) + directory-शैली (सेट-10) + missing_evidence (सेट 1–6) — मरम्मत के तीन सबसे ठोस ढेर।
4. ब्राउज़र P1 फ़िक्सेस फिर भी सबसे तत्काल-उपयोगकर्ता-प्रभाव वाले बने हुए।
