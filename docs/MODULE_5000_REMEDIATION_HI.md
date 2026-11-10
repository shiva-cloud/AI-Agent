> यह पहले के runs का ऐतिहासिक विवरण है। साझा relevance बदलाव के बाद नवीनतम सत्यापित परिणाम और सीमाएँ [Latest System Audit Verification](C:/Users/shiva/Music/Project/AI/docs/LATEST_SYSTEM_AUDIT_VERIFICATION_HI.md) में हैं।

# 5,000 प्रश्नों की रिपोर्ट पर सुधार और सत्यापन

सत्यापन तिथि 7 नवंबर 2026। मूल रिपोर्ट के उदाहरणों को मौजूदा कोड और public-evidence filter के साथ जाँचा गया।

## किए गए सुधार

- छात्र transit fares पर commuter tax रिकॉर्ड का असंबंधित उत्तर रोका।
- Business registration, settlement agency, rent affordability और agent fraud के प्रश्नों में विषय से असंबंधित records रोके।
- Agent द्वारा cash लेने के बाद जवाब बंद करने और emergency medical care के लिए सहायता कार्ड जोड़े। देश अज्ञात होने पर दूसरे देश के नंबर नहीं दिखते।
- Pilot disclaimers और review limitations को मुख्य summary से अलग रखा। वे evidence limitations में उपलब्ध हैं।
- SIN और national business प्रश्नों पर city clarification की आवश्यकता न होने का regression test जोड़ा।
- आठ date-dependent study-policy test failures में historical application date स्पष्ट की। Production policy freshness की सीमा सुरक्षित है।

## सत्यापन

अंतिम पूरे suite में 2,514 tests पास, zero failures। Lint पास। 5,000 अलग प्रश्नों पर diagnostic run पूरा हुआ (artifact timestamp: 2026-11-07T08:39:31.569Z)। यह deterministic engine और public-evidence filter की जाँच है; HTTP, live LLM या independent factual-accuracy evaluation नहीं है।

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

## बाकी सीमाएँ

3,059 प्रश्न unavailable हैं, 1,320 partial, 619 clarification और 2 guidance हैं। ये response statuses हैं, correctness scores नहीं। Runtime errors शून्य हैं। Parser की चुनी geography से बाहर citations शून्य हैं, लेकिन input country labels से 524 अंतर हैं। EU umbrella labels, unsupported locations और Canadian programme names जैसी स्थितियों की अलग review चाहिए।

मूल extraction और evaluation scripts शून्य-byte मिले। Question metadata स्थानीय corpus को स्रोत बताता है, इसलिए Reddit, Quora या LinkedIn provenance और मूल accuracy percentages पुनः प्रमाणित नहीं हुए। Health और fraud उदाहरणों में status अकेले emergency card की मौजूदगी नहीं बताता।

Editorial backlog और independently reviewed expected answers शेष हैं। सभी 5,000 उत्तर सही होने का दावा नहीं किया गया है।

दोबारा चलाने के लिए `node scripts/evaluate-module-corpus.js` उपयोग करें। परिणाम `artifacts/module-5000-diagnostics.json` में मिलेंगे।

## Geography routing follow-up

स्पष्ट विदेशी स्थान अब LMIA, SIN या CRA जैसे Canadian programme शब्दों के कारण Canada नहीं बनता। Programme और स्थान परस्पर विरोधी हों तो engine पूछता है कि प्रश्न विदेश से Canadian programme उपयोग करने के बारे में है या उस देश की सेवाओं के बारे में। Miami अकेले लिखने पर United States और Florida resolve होते हैं। Canada जाने की origin/destination व्याख्या regression tests से जाँची गई है।

ऊपर की तालिका अंतिम geography और business-registration filter बदलावों के बाद बने diagnostic artifact से ली गई है। Geography, indexed retrieval और catalog regression tests पास हैं।

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
