# Market-Gap-500 — नौवाँ 500-प्रश्न सेट (डुप्लिकेट-मुक्त) — 10 नवंबर 2026

निर्देश *"next 500 question not duplicate"* का नौवाँ चक्र। स्रोत = corpus की **market-gap फ़ाइल** (`market_gap_questions_80001_100000.md`, 20,000 प्रश्न — "Synthetic questions informed by public immigration discussions"; portal/biometrics/fee-scam जैसे व्यावहारिक सीनारियो, 13 चैनलों में, Basic→Extreme स्तर)। सम-दूरी फैलाई 500 (हर स्तर ~100)।

**चलाने-का ढंग (आठों पिछले सेटों वाला ही):** अपना in-process runner (`Temp/opencode/run-corpusMKT-500.js`) — `DB_PATH` से **test-copy DB** (`data/test-settlement.sqlite`) पर `src/engine.answer()`; असली `settlement.sqlite` अछूता; fixed clock 2026-11-10T12:00Z। Raw data: [CORPUSMKT500_RESULTS_2026-11-10.json](CORPUSMKT500_RESULTS_2026-11-10.json) (216KB)।

## 1. डुप्लिकेट-प्रमाण — नौ-सेट संयोग

| जाँच | परिणाम |
|---|---|
| **आठों पिछले सेटों (3643 + 500 = 4143) से डुप्लिकेट** | **0** |
| market-gap के parse हुए 20,000 के भीतर आपसी डुप्लिकेट | **0** |
| चले गए | **500/500** (14 सेकंड) |
| engine error | **0** |

अब तक **नौ सेट = 4643 अद्वितीय प्रश्न**।

## 2. कुल स्थिति (500 प्रश्न)

| स्थिति | संख्या | % |
|---|---|---|
| `guidance` | **85** | **17%** (corpus-सेटों में सर्वोच्च) |
| `partial` | 87 | 17.4% |
| `clarification` | 322 | 64.4% |
| `unavailable` | 6 | 1.2% |
| `error` | **0** | 0 |

**serviceable = 172 = 34.4%** — corpus की कठोरता को देखते हुए सर्वोच्च, कारण सीधा: market-gap के 13 चैनलों में अधिकतर प्रश्न **कवर देशों** (Canada/AU/US/DE/UK/IE/ES/FR/UAE/NZ/SG) के हैं (बैच-3/4 के विपरीत जो Peru/Kuwait जैसे कवर-बाहर देशों पर थे)।

लेटेंसी: मध्य 27ms · p95 42ms · अधिकतम 323ms।

## 3. सबसे साफ स्ट्रैटिफिकेशन-प्रमाण — कवर वाली स्पष्ट-रेखा

देश-वार नतीजे (括 मूल=guidance संख्या):

| कवर देश | प्रश्न | guidance | | कवर-बाहर (नमूना) | प्रश्न | guidance |
|---|---|---|---|---|---|---|
| Canada | 29 | **10** | | Portugal | 10 | **0** |
| United States | 20 | **11** | | Japan | 10 | **0** |
| Australia | 19 | **9** | | India | 9 | **0** |
| Germany | 15 | **8** | | Saudi Arabia | 9 | **0** |
| UK | 14 | **7** | | Italy | 9 | **0** |
| Ireland | 10 | **7** | | *बाकी कवर-बाहर* | ~150 | *0* |
| Spain 6 · France 5 · UAE 6 · NL/NZ/SG मिश्रित | | | | | | |

अब कोई व्याख्या-कमी नहीं — **इंजन का निर्णय देश-कवरेज की रेखा पर सटीक टिकता है, कठिनाई पर नहीं** (स्तर-वार: Basic 22 → Extreme 14 लगभग फैल चुके guidance, clarif सब में 63–67 समान)। यह सेट-7/8 के "स्पष्ट-इनकार विश्वास-योग्य" दावे का क्लीनिकल-प्रूफ स्तर है।

## 4. चैनल-वार — कहाँ रिकॉर्ड हैं, कहाँ नहीं

13 चैनलों (हर एक में प्रश्न 20–40):

| चैनल | guidance / partial / clarif |
|---|---|
| employment | **14** / 5 / 20 |
| safety | **15** / 4 / 21 |
| education | **10** / 2 / 28 |
| health | **10** / 8 / 22 |
| travel_status / finance_tax / daily_life / housing | 5–9 मिश्रित · कवर देशों में उत्तर |
| **application_portal** | **0** / 14 / 26 |
| **evidence** | **0** / 10 / 30 |
| **transitional_rules** | **0** / 15 / 25 |

**तीन चैनलों (application_portal, evidence, transitional_rules) में guidance = 0** — यानी "portal zero documents / biometrics pending / नियम-तबदीलि में क्या लागू" वाले व्यावहारिक जवाबों की **रिकॉर्ड-कक्षा अभी नहीं बनी** — और ये तीनों उपयोगकर्ताओं के असली जरूरी सवाल (Reddit में सबसे पाए जाने-वाले प्रकार) हैं। **यह नौ-सेट ऑडिट का सबसे actionable व्यावहार-खोज है।**

गैप-कारण: `missing_or_unsupported_geography` 328 · `awaiting_human_review` 161 · `missing_evidence` 25 · `limited_country_coverage` 22 · occupation 10 · checklist 6 · eligibility 4।

## 5. 6 इनकार (सब सही व्यवहार)

- UK: "recruiter fee guarantee sponsorship — बस 48 घंटे बचे" (urgency-प्रेसर राशियों पर जानकारी नहीं — साफ रुका)
- FR/AU/UK: "विदेशी student-loan आवेदन के बाद भी repayments" (loan-system रिकॉर्ड नहीं)
- NL/Germany: "library-agency से क्या पूछें" (स्थान-सेवा रिकॉर्ड नहीं)

## 6. नौों सेटों का संयुक्त दृश्य (4643 प्रश्न)

| | सेट-1 | सेट-2 | सेट-3 | सेट-4 | सेट-5 | सेट-6 | सेट-7 | सेट-8 | सेट-9 |
|---|---|---|---|---|---|---|---|---|---|
| स्रोत | fresh | NR | master | bankA | bankB | bankC | corpus b4 | corpus b3 | **market-gap** |
| प्रश्न | 626 | 500 | 517 | 500 | 499 | 500 | 500 | 500 | 500 |
| guidance% | 78.8 | 65 | 83.2 | 90.8 | 95.2 | 93.8 | 4.6 | 5.2 | **17** |
| error | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

**सामूहिक:** नौ स्वतंत्र बैंकों में **4643 अद्वितीय प्रश्न · शून्य डुप्लिकेट · शून्य error · शून्य बनाया-गया जवाब**।

## 7. अगले चरणों की प्राथमिकता (अब डेटा से पक्का आदेश)

1. **Portal-रिकॉर्ड वर्ग बनाना** — application_portal / evidence / transitional_rules तीन चैनलों के जवाब-cards (IRCC portal-bugs, biometrics-pending, policy-transition)। एक बार बन गए तो market-gap-corpus के 60,000 प्रश्न तैयार परीक्षण-पूल बन जाएँगे।
2. कवर-बाहर देशों (Portugal/Japan/India/Italy/Saudi) की माँग corpus में स्पष्ट प्रबल — **country-coverage** ठीक वही दरार भरता है।
3. मरम्मत-बैच (missing_evidence) व ब्राउज़र P1 फ़िक्सेस पहले की सूची के ऊपर स्थायी।
