# GMS-A-3rd-500 (batch-1 तीसरा sample) — उन्नीसवाँ 500-प्रश्न सेट (डुप्लिकेट-मुक्त) — 10 नवंबर 2026

निर्देश *"next 500 question not duplicate"* का उन्नीसवाँ चक्र। स्रोत = corpus **batch-1 का तीसरा sample** (`global_immigration_settlement_20000_questions.md`; सेट-10 + सेट-14 के 1000 छोड़कर बाकी 19,000 unique से सम-दूरी 500)।

**चलाने-का ढंग:** in-process runner (`Temp/opencode/run-gmsA3-500.js`) — `DB_PATH` से **test-copy DB** पर `src/engine.answer()`; असली `settlement.sqlite` अछूता; fixed clock 2026-11-10T12:00Z। Raw data: [GMSAC500_RESULTS_2026-11-10.json](GMSAC500_RESULTS_2026-11-10.json) (214KB)।

## 1. डुप्लिकेट-प्रमाण

| जाँच | परिणाम |
|---|---|
| सेट-10/14 का sample (expected छोड़ा) | 1000 |
| **बाकी सभी पिछले सेटों (9143) से वास्तविक डुप्लिकेट** | **0** |
| चले गए | **500/500** (40 सेकंड) · **0 error** |

अब तक **उन्नीस सेट = 9643 अद्वितीय प्रश्न**।

## 2. कुल स्थिति — पिछले दोनों 0% से भिन्न: **27.8%**

| स्थिति | सेट-10 | सेट-14 | सेट-19 (अब) |
|---|---|---|---|
| `guidance` | 0 | 0 | **139 (27.8%)** |
| `partial` | 204 | 216 | 79 |
| `clarification` | 28 | 28 | 25 |
| `unavailable` | 268 | 256 | 257 |
| `error` | 0 | 0 | **0** |

## 3. इसका अर्थ — पुरानी उपसंहार का सटीक-कर्षण (महत्वपूर्ण सुधार)

वही शैल-प्रारूप (हर ×18), पर नमूना-पट्टी इस बार भिन्न-टोपिक पर पड़ी — और दिखा कि **directory-शैली प्रश्न पूर्णतः उत्तर-अयोग्य नहीं**:

- "Where can I find official information about **rental application without credit** in **Canada**?" → स्रोत-आधारित (src=2)
- "Which documents are normally needed for **settlement agency eligibility** in Florida/Miami?" → स्रोत
- "Which documents are normally needed for **regional transfers** in Scotland/Edinburgh?" → स्रोत
- "Which documents are normally needed for **mental health support** in Western Australia?" → स्रोत

**सुधारित घोषणा**: set-10/14 का 0% केवल इस अर्थ में सही रहा — उन दो नमूनों में stride उन टॉपिकों पर पड़ा जहाँ रिकॉर्ड नहीं है; तीसरा नमूना कवर-उप-टोपिक पर पड़ा तो directory-माँग का 27.8% स्रोत-आधारित हुआ। यानी **निर्देशिका-रिकॉर्ड-वर्ग की पूर्ण-अनुपस्थिति नहीं, आंशिक-कवरेज** — और मरम्मत में directory-क्लास की प्राथमिकता पूर्ववत रहती है (अब 27.8% का बैंक तैयार रेंज मिल गई)।

गैप-कारण: `awaiting_human_review` 282 · geo 266 · evidence 124 · intent 77 · eligibility 46। लेटेंसी मध्य 63ms।

## 4. उन्नीसों सेटों का संयुक्त दृश्य (9643 प्रश्न)

| | सेट-1 | सेट-2 | सेट-3 | सेट-4 | सेट-5 | सेट-6 | सेट-7 | सेट-8 | सेट-9 | सेट-10 | सेट-11 | सेट-12 | सेट-13 | सेट-14 | सेट-15 | सेट-16 | सेट-17 | सेट-18 | सेट-19 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| guidance% | 78.8 | 65 | 83.2 | 90.8 | 95.2 | 93.8 | 4.6 | 5.2 | 17 | 0 | 71.6 | 15.8 | 72.8 | 0 | 5.2 | 4.4 | 79.8 | 16 | **27.8** |
| error | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **0** |

**सामूहिक:** उन्नीस स्वतंत्र बैंकों में **9643 अद्वितीय प्रश्न · हर जोड़ी शून्य डुप्लिकेट · शून्य error · शून्य बनाया-गया जवाब।**

## 5. अगले कदम

बचे पूल: GMS batch-2 back (~18.7k), corpus batch-3/4 backs (~19k-19k), market-gap आगे का घटा-पुल (~18.5k)। सिफारिश फिर वही — **मरम्मत-बैच**: portal/evidence/transitional_rules (3×). directory-class (अब पक्का स्कोप सेट-19 के स्रोत-सफल उप-टोपिक से), eligibility/checklist/processing, missing_evidence, ब्राउज़र P1।
