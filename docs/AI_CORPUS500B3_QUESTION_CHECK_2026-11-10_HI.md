# Corpus-500 भाग-2 (batch-3, 40k–60k) — आठवाँ 500-प्रश्न सेट (डुप्लिकेट-मुक्त) — 10 नवंबर 2026

निर्देश *"next 500 question not duplicate"* का आठवाँ चक्र। स्रोत = corpus की **batch-3 फ़ाइल** (`global_immigration_social_questions_40001_60000.md`, 20,000 यूज़र-स्टाइल multi-country सीनारियो) — अब तक मनुष्य-सेट में नहीं चली थी। सेट-7 (batch-4) की ही सम-दूरी sampling विधि — **500 प्रश्न, हर कठिनाई-स्तर से 100** (Basic/Intermediate/Advanced/Expert/Extreme)।

**चलाने-का ढंग (सातों पिछले सेटों वाला ही):** अपना in-process runner (`Temp/opencode/run-corpusB3-500.js`) — `DB_PATH` से **test-copy DB** (`data/test-settlement.sqlite`) पर `src/engine.answer()`; असली `settlement.sqlite` अछूता; fixed clock 2026-11-10T12:00Z। Raw data: [CORPUS500B3_RESULTS_2026-11-10.json](CORPUS500B3_RESULTS_2026-11-10.json) (239KB)।

## 1. डुप्लिकेट-प्रमाण — आठ-सेट संयोग

| जाँच | परिणाम |
|---|---|
| **सातों पिछले सेटों (3143 + 500 = 3643) से डुप्लिकेट** | **0** |
| batch-3 के parse हुए 20,000 के भीतर आपसी डुप्लिकेट | **0** |
| चले गए | **500/500** (28 सेकंड) |
| engine error | **0** |

अब तक **आठ सेट = 4143 अद्वितीय प्रश्न** — हर सेट-जोड़ी के बीच शून्य पुनरावृत्ति।

## 2. कुल स्थिति (500 प्रश्न)

| स्थिति | संख्या | % |
|---|---|---|
| `guidance` | 26 | 5.2% |
| `partial` | 52 | 10.4% |
| `clarification` | **395** | **79%** |
| `unavailable` | 27 | 5.4% |
| `error` | **0** | 0 |

**सेट-7 (batch-4: 4.6%/78.4%) और सेट-8 (batch-3: 5.2%/79%) दो अस्वतंत्र corpus-पुलों में **लगभग एक समान फैलाव** — क्योंकि दोनों की वास्तविक सीमा एक है: पायलट-देश-कवरेज। इंजन ने फिर **एक भी बनाया-गया कानूनी जवाब नहीं** दिया।

लेटेंसी: मध्य 44ms · p95 120ms · अधिकतम 522ms।

## 3. वैश्विक फैलाव — इस बार **76 विभिन्न देशों** के प्रश्न

batch-3 corpus बैच-4 से भी ज्यादा देश-भर फैला है। guidance सिर्फ कवर देशों में आया (France 4, Sweden 3, Germany 3, US 3, UAE 3, AU 2, CA 2, NL 2, NZ 1, UK 1, ES 1, SG 1)। बाकी का parsedCountry वितरण: IE 10, FR 9, DE 8, US 7, UK 7, SE 6, NZ 6… (CA 399 = डिफ़ॉल्ट-पायलट पहचान, जो तत्काल `missing_or_unsupported_geography` इनकार लेता है — कनाडाई कानून विदेशी शहर पर नहीं परोसा गया)।

गैप-कारण — वही कहानी, अब दोहराई हुई पुष्टि:

| कारण | संख्या |
|---|---|
| `missing_or_unsupported_geography` | **422** |
| `awaiting_human_review` | 137 |
| `missing_evidence` | 45 |
| `limited_country_coverage` | 24 |
| occupation 12 · deadline 5 · checklist 2 · eligibility 2 | बाकी |

## 4. स्तर-वार और टॉपिक-वार

स्तर-वार सुसंगत: clarification हर स्तर में 75–83; guidance Basic 4 → Extreme 10 (जहाँ कवर-देश-गहराई ज़्यादा)। टॉपिक-वार: Jobs 70 · Cross-border 68 · Housing 65 · Education 65 · Healthcare 64 · Tax 62 · Visa-status 55 · Local services 51।

27 इनकार में से कुछ **कवर देशों** के भी हैं (France "employer threatens deportation", UK "portal shows different status foreign-trained", Ireland "fraudulent agent forms Galway") — यानी कवर-देश में भी विशिष्ट statute/जांच-वर्ग रिकॉर्ड नहीं होने पर साफ-इनकार — सही व्यवहार।

## 5. आठों सेटों का संयुक्त दृश्य (4143 प्रश्न)

| | सेट-1 | सेट-2 | सेट-3 | सेट-4 | सेट-5 | सेट-6 | सेट-7 | सेट-8 |
|---|---|---|---|---|---|---|---|---|
| स्रोत | fresh | NR | master | bank A | bank B | bank C | corpus b4 | corpus b3 |
| प्रश्न | 626 | 500 | 517 | 500 | 499 | 500 | 500 | 500 |
| guidance% | 78.8 | 65 | 83.2 | 90.8 | 95.2 | 93.8 | 4.6 | 5.2 |
| error | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

**सामूहिक:** आठ स्वतंत्र बैंकों में **4143 अद्वितीय प्रश्न · शून्य डुप्लिकेट · शून्य error · शून्य बनाया-गया जवाब**।

## 6. स्थाई संदेश

1. **Country-coverage का विस्तार अब सबसे बड़ा मौका है** — corpus की 4 और फ़ाइलों (settlement 20000+20001-40k, market-gap 80k-100k = 60,000 बाकी) तैयार परीक्षण-पूल; नया देश जोड़ते ही हजारों प्रश्न automatic जाँच होंगे।
2. कवर-देशों के भीतर की सूचियाँ (fraud-agent verification, employer-threat guidance) सेट-6/8 में बार-बार दिखती हैं — मरम्मत-बैच की ठोस सूची।
3. ब्राउज़र P1 फ़िक्सेस अब भी खुले — जब मरम्मत करने हो वहीं से शुरुआत सबसे असरदार।
