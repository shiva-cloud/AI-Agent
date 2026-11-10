> यह पहले के runs का ऐतिहासिक विवरण है। साझा relevance बदलाव के बाद नवीनतम सत्यापित परिणाम और सीमाएँ [Latest System Audit Verification](C:/Users/shiva/Music/Project/AI/docs/LATEST_SYSTEM_AUDIT_VERIFICATION_HI.md) में हैं।

# Northstar Settlement Intelligence — संपूर्ण सिस्टम री-चेक एवं ताज़ा ऑडिट रिपोर्ट

**जाँच तिथि: 7 नवंबर 2026; संशोधित diagnostic run 2026-11-07T08:39:31.569Z | ब्रांच: `codex/calculator-and-browser-qa-20261106` | हेड कमिट: `20061b6`**

---

## 1. मुख्य निष्कर्ष एवं कार्यकारी सारांश (Executive Summary)

रिपोर्ट में कार्यशील checkout के uncommitted बदलाव शामिल हैं। केवल head commit से यह run reproduce नहीं होगा।

पिछले ऑडिट के बाद कोडबेस में किए गए नवीनतम सुधारात्मक बदलावों (`src/engine.js`, `src/answer-composer.js`, `src/urgent-help.js`, `src/destinations.js`) के बाद पूरे प्रोजेक्ट का संपूर्ण री-चेक किया गया। 

> [!TIP]
> **ताज़ा स्थिति: सुधार लागू; सीमित diagnostic जाँच पास**  
> - **अधिकार-क्षेत्र का रिसाव (Jurisdiction Leaks)**: इस dataset में parser द्वारा चुने गए scope के बाहर citations **0** मिले। यह गलत destination parsing या गलत विषय का उत्तर पकड़ने वाला पूर्ण accuracy check नहीं है। पुराने 23% और नए scope metric की सीधी तुलना मान्य नहीं है।
> - **टेस्ट सुइट**: अंतिम full-suite run में **2,514 tests पास, zero failures** हैं। Lint और diff checks पास हैं। 28/28 वाला पुराना उल्लेख केवल सीमित targeted run था। Publication readiness अभी false है।
> - **अस्वीकरणों (Disclaimers) का समाधान**: आंसर कंपोज़र ने मुख्य सारांश से भारी अस्वीकरणों को हटाकर अलग `limits` सेक्शन में डाल दिया है, जिससे उत्तर साफ़ और व्यावहारिक हो गए हैं।
> - **इमरजेंसी सहायता**: मेडिकल इमरजेंसी और कंसल्टेंट/एजेंट धोखाधड़ी (कैश बिना रसीद) के लिए नए हेल्पलाइन कार्ड सक्रिय हो गए हैं।

---

## 2. 5,000 प्रश्नों का ताज़ा डायग्नोस्टिक ऑडिट (500 Questions per Module)

सभी 10 मॉड्यूल्स के 5,000 स्थानीय corpus-आधारित प्रश्नों को दोबारा लाइव इंजन (`engine.answer`) में चलाकर जाँचा गया (परिणाम: `artifacts/module-5000-diagnostics.json`):

| मॉड्यूल | प्रश्न | Guidance | Partial | Unavailable | Clarification | Parsed-scope violations | Country-label अंतर |
|---|---:|---:|---:|---:|---:|---:|---:|
| Immigration & Visas | 500 | 0 | 113 | 352 | 35 | 0 | 22 |
| Settlement & Community | 500 | 0 | 99 | 358 | 43 | 0 | 59 |
| Identity & SIN | 500 | 0 | 132 | 295 | 73 | 0 | 37 |
| Housing & Tenancy | 500 | 0 | 154 | 291 | 55 | 0 | 53 |
| Employment & Labour Rights | 500 | 0 | 117 | 349 | 34 | 0 | 40 |
| Healthcare & Medical | 500 | 0 | 124 | 331 | 45 | 0 | 43 |
| Finance, Banking & Tax | 500 | 2 | 173 | 207 | 118 | 0 | 52 |
| Driving & Transportation | 500 | 0 | 184 | 277 | 39 | 0 | 40 |
| Family, Childcare & Schooling | 500 | 0 | 90 | 362 | 48 | 0 | 49 |
| Telecom & Utilities | 500 | 0 | 134 | 237 | 129 | 0 | 129 |
| कुल | 5000 | 2 | 1320 | 3059 | 619 | 0 | 524 |


---

## 3. क्या-क्या सुधार सफलतापूर्वक लागू हुए?

### 1. Geography routing में सुधार और scope check की सीमा
- पहले जब यूजर मियामी, जर्मनी, लंदन या ऑस्ट्रेलिया का सवाल पूछता था, तो इंजन कनाडा के कानून दिखाता था।
- **अब**: यदि प्रश्न में विदेशी स्थान के साथ कैनेडियन प्रोग्राम नाम (जैसे SIN, LMIA, CRA) आता है, तो इंजन स्पष्ट स्पष्टीकरण पूछता है:
  > *"Are you asking about a Canadian programme while abroad, or about services in [Country]?"*
- नए metric में scope से बाहर citations शून्य हैं। मूल 1,153 गलत-उत्तर label की methodology उपलब्ध नहीं है, इसलिए सभी 1,153 त्रुटियाँ समाप्त होने का दावा प्रमाणित नहीं है।

### 2. मुख्य उत्तर से भारी अस्वीकरणों (Disclaimers) की सफाई
- `src/answer-composer.js` में बदलाव करके:
  `"This pilot does not determine..."`, `"Independent human review is required..."`, और `"Step-by-step guidance is not available..."`
  को मुख्य टेक्स्ट से हटाकर फुटर/लिमिटेशन ऑब्जेक्ट में अलग कर दिया गया है। मुख्य उत्तर अब सीधे काम की बात बताता है।

### 3. राष्ट्रीय व फेडरल प्रश्नों पर शहर की ज़िद खत्म
- SIN तथा national business-registration उदाहरणों में city अनिवार्य नहीं है। Relevant verified evidence उपलब्ध होने पर guidance मिल सकती है। Business-registration उदाहरण में incidental business शब्द वाले LMIA और remote-work records गलत चुने जा रहे थे; नया filter उन्हें रोकता है। Evidence gap बचने पर unavailable उत्तर अपेक्षित है।

### 4. नए इमरजेंसी क्राइसिस कार्ड्स जोड़े गए (`src/urgent-help.js`)
- **कंसल्टेंट फ्रॉड**: जब यूजर एजेंट के गायब होने या बिना रसीद कैश लेने की शिकायत करता है, तो legal clinic या licensed representative से संपर्क करने की सलाह वाला कार्ड दिखता है। वर्तमान कार्ड में देशानुसार emergency/community contacts हैं; dedicated fraud hotline नहीं है।
- **मेडिकल इमरजेंसी**: तत्काल स्वास्थ्य संकट (emergency medical treatment / cannot breathe) पर 911 / लोकल इमरजेंसी का कार्ड पॉप-अप होता है।

---

## 4. वर्तमान सिस्टम की सीमाएँ और बाकी कार्य (Remaining Gaps)

1. **600 रिकॉर्ड्स अभी भी पब्लिकेशन गेट पर रोके गए हैं**:
   - `node scripts/kb-health.js` के अनुसार 1,221 में से 600 stored-approved records public-evidence checks से withheld हैं। कारणों में review provenance, missing audit और audit mismatch शामिल हैं। अलग editorial-review count 519 है; दोनों समूह overlap करते हैं।
   - Unavailable responses में missing evidence, relevance filtering और review gates का योगदान हो सकता है। केवल withheld records को सभी unavailable responses का कारण बताने के लिए per-case attribution उपलब्ध नहीं है।
2. **शेड्यूल्ड फैक्ट-चेक प्रगति**:
   - 519 में से 357 रिकॉर्ड्स का फैक्ट-चेक पूरा हो चुका है (294 सत्यापित, 48 संशोधित, 15 को ह्यूमन रिव्यू चाहिए), 162 शेष हैं।
3. **पायलट शहरों की सीमा**:
   - अधिकांश विस्तृत कवरेज अभी भी 4 पायलट शहरों (Toronto, Vancouver, Mississauga, Brampton) और 2 प्रांतों (ON, BC) पर केंद्रित है।

## स्रोत और methodology की सीमा

`corpus/README.md` इन प्रश्नों को template-generated synthetic research corpus बताता है। Reddit, Quora और LinkedIn से वास्तविक extraction का प्रमाण उपलब्ध नहीं है। मूल extraction/evaluation scripts शून्य-byte मिले। Dataset के country labels और parsed countries में 524 अंतर मिले; EU umbrella labels और unsupported places भी इनमें शामिल हैं। इन्हें सीधे 524 गलत उत्तर नहीं माना गया है।

Guidance, partial, unavailable और clarification response statuses हैं। इनसे factual correctness, helpfulness या production accuracy नहीं निकलती। Independent reviewed expected answers और editorial approval अभी शेष हैं।

## अंतिम कारण-आधारित जाँच

नए diagnostic run में हर प्रश्न के `gapReasons` और `clarificationReason` सुरक्षित हैं। 524 country-label अंतरों में 304 EU umbrella label बनाम किसी विशिष्ट सदस्य देश के अंतर हैं। बाकी 220 में unsupported location के लिए clarification आई और claims शून्य रहे। इसलिए सभी 524 को jurisdiction leakage कहना गलत है।

3,059 unavailable प्रश्नों में निम्न reasons पाए गए। एक प्रश्न में अनेक reasons हो सकते हैं, इसलिए इनकी संख्या जोड़ी नहीं जानी चाहिए।

| दर्ज reason | unavailable प्रश्नों की संख्या |
|---|---:|
| awaiting_human_review | 3056 |
| missing_evidence | 1071 |
| unrecognized_intent | 1047 |
| missing_personal_eligibility | 197 |
| rejected | 25 |
| missing_live_price_data | 11 |
| missing_verified_processing_time | 1 |
| missing_verified_checklist | 1 |

`awaiting_human_review` catalog matches पर भी जुड़ता है। यह संख्या blocked database records का attribution नहीं है। Missing evidence और unrecognized intent की अलग समीक्षा आवश्यक है। वर्तमान run में runtime errors तथा parsed-scope violations शून्य हैं। Factual correctness के independent labels अभी उपलब्ध नहीं हैं।


## Language-class routing follow-up (7 नवंबर 2026)

`language classes` और `French classes` अब community intent पहचानते हैं। `French classes in Toronto` में French को France destination समझकर location clarification नहीं माँगी जाती। वास्तविक France destination और French citizenship routing सुरक्षित हैं। Language-class प्रश्न पर generic library records को रोकने वाला subject filter जोड़ा गया। Read-only public-evidence database probe में language, English और French classes के Toronto उदाहरणों ने संबंधित IRCC settlement-services record चुना।

इस follow-up के बाद पूरे 5,000-case corpus को दोबारा चलाया गया। ऊपर के आँकड़े इस नवीनतम run से मेल खाते हैं। नया regression test intent, geography, unrelated-evidence rejection और relevant-evidence acceptance जाँचता है।

इस follow-up के बाद पूरा test suite: 2,512 पास, 0 failures, 0 skipped। Lint और diff check पास।




## Legal-aid routing सुधार

Legal aid और community legal clinic प्रश्न अब community intent पहचानते हैं। Legal clinic को medical clinic समझने की गलती सुधारी गई। Subject filter generic medical, settlement और अन्य असंबंधित records रोकता है। Read-only database probe में Toronto के दोनों प्रश्न संबंधित Ontario legal-aid record चुनते हैं; Miami वाले प्रश्न में Ontario record नहीं आता।

पूरे suite में 2,514 tests पास, 0 failures, 0 skipped; lint और diff check पास। नया 5,000-case run: 2026-11-07T08:34:35.114Z। 33 पुराने partial उत्तर असंबंधित evidence हटने से unavailable हुए। 2 पुराने partial उत्तर अब आवश्यक location clarification माँगते हैं। इसे factual accuracy का स्वतंत्र score नहीं माना गया है।


## Library, shelter और wage-theft relevance सुधार

Library membership/card/registration, emergency family shelter/housing और wage theft/unpaid wages के प्रश्नों पर असंबंधित records रोकने के लिए subject filters जोड़े गए। Brampton library उदाहरण अब केवल library record चुनता है। Vancouver emergency family shelter और Canada wage-theft उदाहरणों में school/childcare तथा credential/SIN records हटे हैं। Missing evidence को उपलब्ध उत्तर नहीं माना गया है।

Fixture validation सहित regression tests positive और negative evidence selection जाँचते हैं। पूरे suite में 2,514 tests पास, zero failures; lint और diff check पास। नवीनतम corpus timestamp: `2026-11-07T08:39:31.569Z`। 42 प्रश्नों के selected claims बदले; 40 पुराने partial उत्तर असंबंधित evidence हटने पर unavailable हुए। सभी 5,000 प्रश्न पूरे हुए; runtime errors और parsed-scope violations शून्य। Independent factual review अभी बाकी है।
