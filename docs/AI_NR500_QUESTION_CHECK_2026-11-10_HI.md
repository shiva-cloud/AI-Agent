# Non-Repeated-500 — दूसरा 500-प्रश्न सेट (डुप्लिकेट-मुक्त) — 10 नवंबर 2026

पहले सेट के पहले वाले निर्देश *"next 500 question not duplicate"* पर — प्रोजेक्ट का **non-repeated-500 suite** (`scripts/non-repeated-500-suite.js`, 500 प्रश्न: Reddit/Quora/LinkedIn/Blind-माइंड स्टाइल) से **명programmatic डुप्लिकेट-जाँच** करके, फ्रेश-500 से बाद कोई भी वही प्रश्न फिर से नहीं चला गया — साफ़ करके हर वह प्रश्न चला जो अलग था।

**चलाने-का ढंग (सुरक्षा — पहले सेट वाला ही):** अपना in-process runner (`Temp/opencode/run-nr500-mine.js`) — `DB_PATH` से **test-copy DB** (`data/test-settlement.sqlite`, असली corpus की प्रति 129.5MB) पर `src/engine.answer()` सीधा बुला। असली `data/settlement.sqlite` को छुआ नहीं। Fixed clock: 2026-11-10T12:00Z। Raw data: [NOREPEAT500_RESULTS_2026-11-10.json](NOREPEAT500_RESULTS_2026-11-10.json) (210KB)।

## 1. डुप्लिकेट-प्रमाण (सबसे अहम वादा)

नियम: प्रश्न-टेक्स्ट normalize (lowercase, गैर-अल्फान्यूमेरिक हटाओ, spaces collapse) करके **(a)** पहले चले fresh-500 (626 प्रश्न) से मिलान, **(b)** नए सेट के भीतर आपस में मिलान।

| जाँच | परिणाम |
|---|---|
| नए सेट के मूल प्रश्न | 500 |
| **fresh-500 से डुप्लिकेट** | **0** |
| **सेट के भीतर आपसी डुप्लिकेट** | **0** |
| चले गए प्रश्न | 500 (14 सेकंड) |
| engine error | **0** |

यानी **दोनों सेटों में एक भी वही प्रश्न नहीं** — 626 (पहला) + 500 (दूसरा) = **1126 अद्वितीय प्रश्न** चल चुके हैं।

## 2. कुल स्थिति (500 प्रश्न)

| स्थिति | संख्या | % |
|---|---|---|
| `guidance` (स्रोत-आधारित उत्तर) | **327** | 65% |
| `partial` (स्पष्ट-गैप लेबल सहित आंशिक) | 114 | 23% |
| `clarification` | 22 | 4% |
| `unavailable` | 37 | 7% |
| `error` | **0** | 0 |

**serviceable (guidance+partial) = 441 = 88%**। बाकी 22+37 = 59 प्रश्न इंजन ने **साफ इनकार/स्पष्टीकरण** दिया — कोई भी भ्रामक उत्तर नहीं।

लेटेंसी (in-process): मध्य 24ms · p95 46ms · अधिकतम 472ms।

## 3. देश-वार

| देश | प्रश्न | guidance | partial | clarif | unavail |
|---|---|---|---|---|---|
| Canada | 100 | 60 | 19 | **20** | 1 |
| United States | 61 | 46 | 15 | — | — |
| Australia | 55 | 41 | 11 | — | 3 |
| Germany | 47 | 32 | 7 | — | 8 |
| United Kingdom | 44 | 34 | 9 | — | 1 |
| UAE | 44 | 29 | 12 | — | 3 |
| Ireland | 30 | 18 | 8 | — | 4 |
| New Zealand | 26 | 18 | 5 | — | 3 |
| Singapore | 21 | 13 | 4 | — | 4 |
| France | 20 | 7 | 8 | 1 | 4 |
| Spain | 19 | 11 | 7 | 1 | — |
| Netherlands | 18 | 9 | 6 | — | 3 |
| Sweden | 15 | 9 | 3 | — | 3 |

*(नोट: suite meta पूरे देश-नाम इस्तेमाल करता है; कनाडा-पंक्ति में parsedCountry='CA' फ़िल्टर से गिरा — यानी सब कुछ शामिल है।)*

## 4. गहराई-विश्लेषण

### 4.1 Unavailable (37) के दो परिवार

हस्ताक्षर: **28× `missing_or_unsupported_geography` + `unrecognized_intent`** · 6× केवल geo · 1× `missing_live_price_data` · 1× केवल intent · 1× geo+personal_eligibility।

1. **सब्जेक्टिव/कम्युनिटी-संस्कृति प्रश्न** (इंजन सही रूप से इनकार करता है): स्वीडन **Fika** की व्यावहारिक बारीकियाँ, डच सीधापन (Dutch bluntness), जापानी/ताल-कोरियाई **tissue-paper table अधिक्रम** ("choping", etiquette), **Queen Victoria Market** के weekend बाज़ार-शिष्टाचार — ये "कानून नहीं, आदत" प्रश्न हैं; कोई गलत सामान्यीकरण नहीं।
2. **statute-उद्धृत प्रश्न जिनका statute रिकॉर्ड में नहीं**: जर्मनी **Rundfunkbeitragsstaatsvertrag** (RBVSTV), आयरलैंड **Workplace Relations Act 2015**, फ्रांस **CESEDA L421-9**, स्वीडन **MBL** (co-determination), सिंगापुर **Employment Act (Ch 91)** — विषय-रिकॉर्ड (जैसे ARD लाइसेंस फीस) में हैं पर उस act-का नाम सत्यापित सार में नहीं, इसलिए साफ-unavailable। ये **अगले कानून-टेक्स्ट publication-बैच** की तैयार सूची हैं।

### 4.2 Clarification (22) — एक असामान्य पैटर्न (cross-parse सुधारने योग्य)

22 में से **20 answer का parsed-देश CA** है। अच्छी चाल सही सिफ़ारिश उदाहरण को कोई भी स्पष्ट विधि में नहीं डाल सका, पर दो विशिष्ट उप-समूह दिखते हैं:

- **वास्तविक कनाडा प्रश्न** (सही स्पष्टीकरण): अल्बर्टा **RTA** का notice-grounds, रामायण-… Quebec **francisation/PEQ échelle** फ्रेंच-level, **LICO + 30%** पैरेंट-स्पॉन्सरशिप की राशि, **Calgary Catholic Immigration Society** की सेवाएँ — यानी record मौजूद है पर राशि/संस्थान-नाम verified summary में नहीं।
- **⚠ cross-parse दोष — ब्रिटेन-शहर वाले प्रश्न → CA**: "**SpareRoom** in **London**", "**Oyster card** vs contactless कीतना सस्ता", "**London** SIM plans", "**London** में cashless क्यों" — इन्हें **part of "CA"** पार्स कर दिया गया (संभवतः "London" → Ontario का London)। उत्तर इनकार-मोड में सही व्यवहार है (ऊपर गलत उत्तर नहीं बनाया), लेकिन parse का destination देश गलत। **सुधार-लक्ष्य:** "London, UK" / "Oyster" / "SpareRoom" को ब्रिटेन-destination माना जाए।

### 4.3 टॉपिक गहराई — housing सबसे भारी

| टॉपिक | प्रश्न | फेल (partial+clarif+unavail) |
|---|---|---|
| housing | 93 | **54** (पैसा-सीमेट (रिकॉर्ड सीमा/राशि सत्यापित-सार से बाहर — missing_evidence) |
| community | 66 | 27 (18 unavailable — संस्कृति-परिवार) |
| employment | 94 | 22 |
| transit | 38 | 12 |
| family | 34 | 14 |
| money | 60 | 15 |

12/13 टॉपिक्स में कोई-न-कोई फेल है; sin/groceries सबसे छोटे।

### 4.4 Gap-कारण वितरण (सब फेल-गाड़ियों का सार)

| कारण | संख्या | मतलब / इलाज |
|---|---|---|
| `missing_evidence` | **87** | रिकॉर्ड में यही बात verified नहीं — अगला **publication-बैच** |
| `missing_or_unsupported_geography` | 57 | शहर-स्तर का रिकॉर्ड नहीं (जैसे Alberta RTA, SG-RBVS से तीर्थ) |
| `unrecognized_intent` | 29 | सब्जेक्टिव/statute-शैली वाक्य — intent-क्लासिफ़ायर का विस्तार |
| `missing_personal_eligibility` | 18 | व्यक्तिगत आवेदन-योग्यता कर सकता — record-class बनाओ |
| `source_guidance` | 18 | स्रोत-लिंक स्तर से आगे सार-स्तर ले जाओ |
| `missing_verified_checklist` | 4 | चेकलिस्ट-क्लास बनाने |
| `missing_live_price_data` | 3 | राशि-माँग वाले प्रश्न |

## 5. अगले मरम्मत-लक्ष्य (प्राथमिकता-क्रम)

1. **missing_evidence 87** → अगला source-publication बैच (housing की राशि/सीमाएँ सबसे आगे)।
2. **London/Oyster/SpareRoom प्रश्नों का CA cross-parse** सुधारना + टेस्ट-केस पिन।
3. **Statute-नाम रिकॉर्ड** — Rundfunkbeitragsstaatsvertrag, CESEDA L421-9, WRA-2015, MBL, SG-EA Ch91 को उनके विषय-रिकॉर्ड से जोड़ना (37 unavailable का लगभग आधा यहीं टूटता है)।
4. **intent-classifier** — सब्जेक्टिव-etiquette को "संस्कृति+सलाह" स्पष्टीकरण स्तर तक जोड़ो (गलत उत्तर नहीं, बेहतर स्पष्टीकरण)।
5. पहला + दूसरा सेट दोनों के परिणाम अब **1126 अद्वितीय प्रश्नों** का पूरा बेंचमार्क है — इसी से अगली बैच-release की प्राथमिकता-सूची बनेगी।

## 6. दोनों सेटों का संयुक्त दृश्य

| | सेट-1 (fresh-500) | सेट-2 (NR-500) |
|---|---|---|
| प्रश्न | 626 | 500 (0 डुप्लिकेट) |
| guidance | 493 (78.8%) | 327 (65%) |
| partial | 121 | 114 |
| clarif/unavail | 9 / 3 | 22 / 37 |
| error | 0 | 0 |

सेट-2 में unavailable ज़्यादा है क्योंकि इसमें **statute-नाम ठोक** (act-text माँग) और **कम्युनिटी-संस्कृति** प्रश्नों का भार है — यानी suite-मेक असली Reddit/Quora-गहराई से अधिक कठिन है; इंजन के होनेस्ट-गार्ड ने कोई भी फटा-फटा अनुमान नहीं लगाया।
