# Fresh-500 (Reddit/Quora) — 626-प्रश्न इंजन-परीक्षण — 10 नवंबर 2026

उपयोगकर्ता की "500 और प्रश्न जाँचो" के निर्देश पर — प्रोजेक्ट का स्वयं का **fresh-500 social suite** (`scripts/fresh-500-social-suite.js`, जो Reddit r/ImmigrationCanada, r/PersonalFinanceCanada, r/Germany, r/dubai आदि + Quora + LinkedIn + Blind से mined, शून्य-अतिव्यापी है) के **वास्तव 626 प्रश्न** इंजन पर चलाए गए।

**चलाने-का ढंग (सुरक्षा):** दूसरे सत्र के हार्नेस नहीं छुए; इस सत्र का अपना in-process runner (`Temp/opencode/run-fresh500-mine.js`) — `DB_PATH` के ज़रिए **test-copy DB** (`data/test-settlement.sqlite`, असली corpus की प्रति) पर `src/engine.answer()` सीधे बुला। असली `data/settlement.sqlite` से बिना-लिखे पढ़ा भी नहीं गया। Fixed clock: 2026-11-10T12:00Z। Raw results: [FRESH500_RESULTS_2026-11-10.json](FRESH500_RESULTS_2026-11-10.json)।

## 1. कुल स्थिति (626 प्रश्न, 11 सेकंड, शून्य त्रुटि)

| स्थिति | संख्या | % |
|---|---|---|
| `guidance` (ग्राउंडेड उत्तर) | **493** | 78.8% |
| `partial` (अंतरहस्त उत्तर, स्पष्ट-गैप सहित) | 121 | 19.3% |
| `clarification` | 9 | 1.4% |
| `unavailable` | 3 | 0.5% |
| `error` | **0** | 0 |

लेटेंसी (in-process): औसत/मध्य 17ms · p95 31ms · अधिकतम 371ms।

## 2. देश-वार (सभी 8+ देशों के उत्तर आए)

| देश | प्रश्न | guidance | partial | clar/unavail |
|---|---|---|---|---|
| Canada | 117 | 91 | 18 | 8 clar |
| United States | 82 | 70 | 11 | 1 clar |
| United Kingdom | 70 | 50 | 19 | 1 unavail |
| Australia | 69 | 54 | 15 | — |
| Germany | 57 | 48 | 8 | 1 unavail |
| UAE | 53 | 42 | 10 | 1 unavail |
| Ireland | 41 | 35 | 6 | — |
| New Zealand | 40 | 30 | 10 | — |
| Singapore | 20 | 17 | 3 | — |
| Netherlands | 20 | 15 | 5 | — |
| France | 19 | 12 | 7 | — |
| Spain | 19 | 16 | 3 | — |
| Sweden | 19 | 13 | 6 | — |

## 3. सबसे बड़ी सकारात्मक खोज: होनेस्ट-गार्ड बेरिज

- **8 अज्ञात देश (जापान, दक्षिण-कोरिया, इटली, ग्रीस, तुर्की, साइप्रस, माल्टा, कोस्टा-रिका)** के digital-nomad/golden-visa प्रश्न → **सबसे सटीक `clarification`** — कोई भी बनौटी आँकड़ा नहीं, सब रुके। (यानी 10-म येन, $200,000 इकमेट, 800,000€ ग्रीस जैसे "जाल आँकड़े" पकड़ने वाले प्रश्नों पर कोई भी स्पष्ट गवाह में उत्तर नहीं बना।)
- **2 विषयवस्तु-राय प्रश्न** (UK-सर्दी मनोबलहीनता, Dubai फंदा-दोस्ती) → `unavailable` — सही।
- **केम- आयात रेखा** (जर्मनी कोडीन सिरप) → `unavailable` — कोई जल्दी गेस नहीं।
- **1 subjective-सेवा प्रश्न** (तँ德里 सर्वस) → `clarification` — कोई ब्रांड-सिफ़ारिश नहीं।

## 4. partial (121) का आधार — ईमानदार-एब्स्टेशन, गलत उत्तर नहीं

गैप-कारण वितारण: `missing_evidence` 66 · `missing_personal_eligibility` 43 · `source_guidance` 24 · `missing_occupation_requirements` 17 · `missing_or_unsupported_geography` 12 · `missing_verified_deadline` 5 · `awaiting_human_review` 3 · `unrecognized_intent` 3 · `rejected` 2।

पैटर्न स्पष्ट: रिकॉर्ड पासा में है पर उसका verified summary उस आँकड़े को कह रहा नहीं है (उदा. `Mietkaution 3-month cap` का cap ωभी रिकॉर्ड में सत्यापित है पर उस suite-शब्दाव से reach नहीं; California AB-12 deposit, UAE Decree-43 rent-hike 20%, Ireland RPZ 2%/deposit-1-month, France VLS-TS 3-महीने, Sweden PUT 4-वर्ष, NL 30%-ruling, SG COMPASS प्रत्येक में exact सूत्र/तिथि सूची verified-summary से बाहरी है)। यह्य कोई "गलत जवाब" नहीं — यह **source-verified ठेके की कीमत** है: कवरेज-सीमाएँ साफ बताई जाती हैं।

132/623 टॉपिक में ≥1 partial; बाकी 491 टॉपिक 100% पास।

## 5. आगे के मरम्मत-लक्ष्य (संक्षिप्त)

1. **missing_evidence (66)** टॉपिक ऐ Heaviest — यह सूची सीधा publication-floor का अगला बैच है: California deposit, UAE rent-hike, Ireland RPZ/deposit, FR VLS-TS/OFII, SE PUT, NL 30%-ruling, SG COMPASS।
2. **missing_personal_eligibility (43)** — eligibility-class सूची जो रिकॉर्ड में बन सकती है (PGWP language CLB-7, AU 485 age-35, AE Golden Visa माइलस्टोन)।
3. **source_guidance (24)** — लिंक-मात्रा उत्तर स्तर से आगे बढ़ाने का काम (स्थायी backlog वर्ग)।
4. 500-प्रश्न SUIटे से सुझाव: fresh-500 के अगले mining पर यही सूची दोबारा जाँचें।

## 6. पिछले browser-संवाद निष्कर्ष से संबंध

- Browser सत्र में जो दो गंभीर गलतियाँ थीं (free-text जर्मनी पर Ontario उत्तर; origin-अंबिगुत UK/US प्रश्नों पर कनाडा उत्तर) — यह suite उन्हें कैप्चर नहीं करता (उनका द्वारक अलग है: बिना dropdown टेक्स्ट-मोड); वे लक्ष्य अलग-अलग ठिकाने के हैं। Suite में सब प्रश्नों में मूल-देश/थैला साफ पहुँचा।
- Unknown-country `clarification` व्यवहार browser और suite दोनों में सुस्पष्ट सही — टैप मजबूत।
