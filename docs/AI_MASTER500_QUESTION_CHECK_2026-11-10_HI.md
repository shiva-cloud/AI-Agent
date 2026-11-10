# Master-500 — तीसरा 500-प्रश्न सेट (डुप्लिकेट-मुक्त) — 10 नवंबर 2026

निर्देश *"next 500 question not duplicate"* का तीसरा चक्र। इस बार स्रोत = प्रोजेक्ट का **master-500 suite** (`scripts/master-500-question-suite.js`) — यह Reddit/Quora **RQL** प्रश्नों (वायरल visa-rumors & traps) + **Technical-180** + **Technical-120** + **Bot conversational twisted chains** (12 chains) का संगम है, असल में **518 प्रश्न** लोड होते हैं, और हरित मोटे तौर पर 398-प्रश्न पर **expected-status** (`exp`) भी बुना है — यानी इंजन की expect-से-मेल जाँच भी हुई।

**चलाने-का ढंग (पिछले दोनों सेटों वाला ही):** अपना in-process runner (`Temp/opencode/run-master500-mine.js`) — `DB_PATH` से **test-copy DB** (`data/test-settlement.sqlite`, असली corpus की प्रति) पर `src/engine.answer()`। असली `data/settlement.sqlite` अछूता। Fixed clock 2026-11-10T12:00Z। Raw data: [MASTER500_RESULTS_2026-11-10.json](MASTER500_RESULTS_2026-11-10.json) (194KB)।

## 1. डुप्लिकेट-प्रमाण (सबसे अहम)

| जाँच | परिणाम |
|---|---|
| सेट-मूल प्रश्न | 518 |
| **पिछले सेटों (626 + 500 = 1126) से डुप्लिकेट** | **0** |
| **इस सेट के भीतर आपसी डुप्लिकेट** | **1** (हटाया) |
| चले गए प्रश्न | **517** (9.7 सेकंड) |
| engine error | **0** |

अब तक **3 सेट = 1643 अद्वितीय प्रश्न** (626 + 500 + 517) इंजन पर उम्पास कर चुके हैं, सारे आपस में अलग।

## 2. कुल स्थिति (517 प्रश्न)

| स्थिति | संख्या | % |
|---|---|---|
| `guidance` | **430** | 83.2% |
| `partial` | 74 | 14.3% |
| `clarification` | 10 | 1.9% |
| `unavailable` | 3 | 0.6% |
| `error` | **0** | 0 |

**serviceable = 504 = 97.5%** (अब तक सबसे ऊँचा) और guidance हिस्सा भी अब तक का सबसे सच्चा-हिस्सा।

लेटेंसी: मध्य 17ms · p95 37ms · अधिकतम 242ms।

## 3. कनाडा-केंद्रित सेट — देश-वार

ज्यादातर प्रश्न कनाडाई (टोरंटो/वैंकूवर/ब्रैंपटन/मिसिसागा) स्तर-प्रश्न हैं (कनिष्ठ Reddit_Quora समूह भैति-विशेष):

| देश | प्रश्न | guidance | partial | clarif | unavail |
|---|---|---|---|---|---|
| Canada | 473 | 393 | 67 | 10 | 3 |
| United States | 9 | 8 | 1 | — | — |
| United Kingdom | 8 | 6 | 2 | — | — |
| Australia | 8 | 7 | 1 | — | — |
| Germany | 7 | 7 | — | — | — |
| UAE | 4 | 4 | — | — | — |
| Ireland | 3 | 2 | 1 | — | — |
| New Zealand | 3 | 2 | 1 | — | — |
| France | 2 | 1 | 1 | — | — |

## 4. Expected-vs-Actual — इंजन अपेक्षा-से अधिक ईमानदार

398 प्रश्नों पर suite का `exp` लेबल था:

| मेल | 340 / 398 = **85.4%** |
|---|---|

58 बेरमेल — पर उनका वितरण रोचक है:

| अपेक्षा → वास्तविक | गिनती | अर्थ |
|---|---|---|
| **guidance → partial** | **53** | इंजन अपेक्षा-से अधिक संरक्षित/ईमानदार रहा — साफ-साफ **gap-लेबल सहित आंशिक** दिया (किसी गलत भरोए का उत्तर नहीं) |
| clarification → guidance | 2 | अपेक्षा-से बेहतर (clarif वाला भविष्य न मानकर भौतिक record से उत्तर) |
| guidance → clarification | 2 | होनेस्ट-गार्ड फयर (boundary-class प्रश्न) |
| clarification → partial | 1 | वर्ग-सीमा का उतार-चढ़ाव |

यानी **कोई भी अपेक्षा-विरोधी गैर-जिम्मेदार रिफूज़ल गलत-जवाब नहीं था** — 53 में 53 बार इंजन प्रश्नस्तर से ज़्यादा सत्यापित-तथ्य माँग रहा था (IFHP benefit-राशियाँ, CCB योग्यता-सूची, BC deposit-caps, CCFRI बच्चा-फीस कटौती, बाज़ार ग्रॉसरी-नागदी)। उत्तर "यह विवरण स्रोत में सत्यापित नहीं — यहाँ जाओ" — जो ठेका है।

## 5. Gap-कारण वितरण (सब फेल-गाड़ियों का सार)

| कारण | संख्या |
|---|---|
| `missing_evidence` | **29** |
| `missing_occupation_requirements` | 16 |
| `missing_personal_eligibility` | 15 |
| `awaiting_human_review` | 11 |
| `missing_or_unsupported_geography` | 10 |
| `source_guidance` | 7 |
| `unrecognized_intent` | 3 |
| `rejected` | 3 |
| `missing_verified_deadline` | 1 |

## 6. टॉपिक-गहराई

365 cat::sub वर्गों में से **63** में ≥1 फेल (partial+clarif+unavail); अर्थात 302 वर्ग एकदम स्वच्छ। सबसे भारी:

| वर्ग | फेल/कुल |
|---|---|
| Healthcare & Medical | 6/15 (IFHP राशियाँ, बीमा-वर्ग) |
| Tenancy & Housing | 5/19 (BC deposit caps, lockout) |
| Education & ECA | 4/10 (ECA फीस/समय-सीमा) |
| Bot_Chain :: Rent Increase Rules | 4/4 — **पूरी चेन विफल** |
| Bot_Chain :: Healthcare Admissibility | 3/4 |

**Bot-twisted चेन्स**: 12 chains/50 प्रश्न — 10 चेनें काफी स्वच्छ, पर **Rent-Increase 4/4** अंश (मूल-प्रश्न को ही नया नंबर-राशि सत्यापन चाहिए) और Healthcare-admissibility 3/4 — इन्हें मरम्मत-कार्य की सूची से रखा जा सकता है।

## 7. तीनों सेटों का संयुक्त दृश्य

| | सेट-1 fresh | सेट-2 NR | सेट-3 master |
|---|---|---|---|
| प्रश्न | 626 | 500 | 517 (0 vs दोनों सेट) |
| guidance | 493 (78.8%) | 327 (65%) | **430 (83.2%)** |
| partial | 121 | 114 | 74 |
| clarif / unavail | 9 / 3 | 22 / 37 | 10 / 3 |
| error | 0 | 0 | 0 |
| latency p95 | 31ms | 46ms | 37ms |

**सामूहिक निष्कर्ष (1643 प्रश्न):** 1250 guidance (76%) · 309 partial · 41 clarification · 43 unavailable · **0 error** · **शून्य डुप्लिकेट** हर सेट-जोड़ी के बीच। master-500 सबसे कम कनिष्ठ-स्रोत प्रश्न लेकर चला (अधिक कनाडा-गहराई) इसलिए सबसे ऊँचा guidance और सबसे ऊँचा serviceable।

## 8. अगले मरम्मत-लक्ष्य

1. **missing_evidence (29)** + IFHP/CCB/deposit-caps राशियाँ — अगला source-सत्यापन publication-बैच (सेट-2 के 87 के साथ मिलाकर एक सूची बनेगी)।
2. **Bot Rent-Increase chain (4/4 अंश)** — नया नंबर-राशि प्रश्न-शैली को 2026-guideline रिकॉर्ड से जोड़ना।
3. **Occupation/eligibility (16+15)** — व्यावसाय-वर्ग record-class बनाना (सेट-1 व सेट-3 के same लक्ष्य की पुष्टि)।
4. अगली 500 सेट तैयार हो तो बनाते समय पिछले **1643 प्रश्नों** से hi स्तर पर dedup ही रहेगा (इसी सत्र के तीनों raw JSON से)।
