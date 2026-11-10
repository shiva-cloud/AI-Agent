# AI-संवाद परीक्षण (browser संवाद) — सभी टॉपिक — 10 नवंबर 2026

पूरे प्रोजेक्ट का स्वास्थ्य-स्कैन और **उपयोगकर्ता की अपनी AI के साथ browser में 22-प्रश्न का संवाद** परीक्षण। सर्वर `npm run start:test` (testing mode) पर चला — इसका अपना DB (`data/test-*`) इस्तेमाल हुआ, वास्तविक `data/settlement.sqlite` को सिर्फ **copy** करके (`test-settlement.sqlite`, 129.5MB) test-server को दिया गया, असली DB बिल्कुल अछूता। सारे प्रश्न असली web UI (`http://127.0.0.1:3000`, `#question-form` → `POST /v1/answers`) के रास्ते पूछे गए।

## 1. प्रश्न-स्रोत की ईमानदारी

- `websearch` टूल आज भी HTTP 402; Reddit (नया + old + JSON API + jina.ai प्रॉक्सी) सब "network security द्वारा अवरुद्ध" (403); Quora खाली shell; Bing अप्रासंगिक नतीजे; DuckDuckGo फॉर्म-शैल bot-gate। यानी आज Quora/Reddit से **सीधी scraping संभव नहीं** रही (वही पुरानी backlog मद: "websearch अनुपलब्ध")।
- इसीलिए प्रश्न दो स्रोतों से बने: (1) प्रोजेक्ट के अपने benchmark समूह (`benchmark-global-queries.js`, `benchmark-kyc-questions.js` में Reddit/Quora-शैली के सीनारियो से ही बने प्रश्न), (2) Reddit/Quora पर सबसे आम नए-आवासी (newcomer) प्रश्नों के फॉर्मूले से पुनर्निर्मित वाक्य। दोनों को भेदकर दर्ज किया है।

## 2. सेटअप

| तत्व | मूल्य |
|---|---|
| Server | `npm run start:test` · `127.0.0.1:3000` · research-pilot · v0.19.74 |
| DB | `data/test-settlement.sqlite` ← `settlement.sqlite` की प्रति (129.5MB); असली DB अछूता |
| UI रास्ता | देश-ड्रॉपडाउन + `#question` textarea + "Find guidance" (असली form submit, fetch नहीं) |
| संवाद कदम | एक ही tab में क्रमबद्ध 22 प्रश्न; हर उत्तर `#answer article.result` से पढ़ा |
| इंजन लेटेंसी | ~400–800ms प्रति प्रश्न (बैज में engine-ms दिखता है) |

## 3. प्रति-टॉपिक परिणाम (22 प्रश्न)

| # | टॉपिक (देश) | प्रश्न का सार | नतीजा |
|---|---|---|---|
| 1 | housing (Toronto) | $500 key deposit + SIN माँगना | ✅ पास — OPC नियम (landlord SIN न माँगे) + जमा-सीमा; ⚠️ नीचे P2-3 देखें (NS पंक्ति मिश्रित) |
| 2 | employment (Toronto) | closed permit घंटे कटे + cash वेतन | ❌ P1-1 — study-permit 24-घंटे समूह पकड़ लिया (wage-rights नहीं) |
| 3 | employment (re-word, Toronto) | कटौती व independent-काम नियम | ✅ पास — ESA payment-of-wages (केवल 3 प्रकार की कटौती) |
| 4 | health (Toronto) | OHIP 3-महीने प्रतीक्षा | ✅ पास — "Ontario no longer has a waiting period"; +bonus SIN-expiry पंक्ति |
| 5 | money/banking (Mississauga) | बिना नौकरी account रिफ्यूज़? | ✅ पास — दो-दस्तावेज़ नियम, रिफ्यूज़ के सीमित आधार |
| 6 | money/kyc (Vancouver) | $10,000 wire (gift) रिपोर्ट करना | ✅ पास — "generally not taxable income", recorded दस्तावेज़ सलाह; FINTRAC/CRA स्रोत |
| 7 | driving (Toronto) | भारतीय licence बदलना | ✅ पास — 1 जुलाई 2026 से 1-वर्ष अनुभव-credit; 12-महीने G-test की सीमा |
| 8 | स्टेटस (Toronto) | कॉलेज 24 घंटे off-campus | ✅ पास — पृष्ठ-सत्य 24-घंटे संरचना |
| 9 | स्टेटस (Toronto) | permit समाप्त, renewal दावा, काम? | ⚠️ लगभग — SIN-continuation पंक्ति सही, पर R186(u) सरल उत्तर नहीं |
| 10 | telecom (Toronto) | जल्दी रद्द सीमा | ⚠️ P2-1 — सार "device unlocking" चला; $50/$100 राशियाँ citation-शरीर में, ECF-गणना सार में नहीं |
| 11 | टैक्स (Toronto) | T1135 $200k outer देशी संपत्ति | ✅ पास — $100,000 सीमा (सार और navigators सही); अतिरिक्त T776 पंक्ति (विरासत) |
| 12 | रोज़गार+सुरक्षा (UAE/PASSPORT) | Dubai में passport रोकना | ✅ ईमानदार निरस्त — **Urgent तैरा** ("पासपोर्ट रोक लिया"), स्पष्ट कड़ा स्थान-स्पष्टीकरण, कोई कैनेडियन उत्तर नहीं |
| 13 | housing (DE, टेक्स्ट-फ्री) | Kaution नियम | ❌ P1-2 — **Ontario RTA s.106 जवाब दिया** (Toronto-branded); जर्मन सूची नहीं दी |
| 14 | housing (DE, dropdown) | वही प्रश्न देश-ड्रॉपडाउन से | ✅ पास — 3-month net cold rent (पूर्ण सही) |
| 15 | स्किल (AU, dropdown) | राष्ट्रौल points/national स्टेटरी | ⚠️ अंश — 10 स्रोत, पर सार में visa-listing + SETS मुख्या; पॉइंट-आँकड़े सार में नहीं |
| 16 | housing (UK) | 6-सप्ताह जमा (नैतिक-मूल्य) | ✅ ईमानदार निरस्त — "This pilot does not cover that place yet" + ड्रॉप-डाउन सुझाव |
| 17 | सिन उपयोग ना (UK) | NI नंबर | ❌ P1-3 — **कनाडा-SIN सलाह दिखा** (origin-अंबिगुत "UK" को Canada-destination माना) |
| 18 | रोज़गार (UK) | share code | ❌ P1-3 — **Ontario HR Code** गलत जवाब ✋ |
| 19 | driving (AU) | Melbourne licence | ✅ ईमानदार निरस्त — स्पष्ट कड़ा स्थान-स्पष्टीकरण |
| 20 | housing (IE) | Dublin 10% रेंट-वृद्धि | ✅ ईमानदार निरस्त — सीधा स्पष्टीकरण வேण्टि |
| 21 | सिन (US) | SSN आवेदन | ❌ P1-3 — कनाडा-SIN जवाब (वही origin-परेशानी) |
| 22 | स्कूल/परल (Brampton) | 5-वर्षीय की स्कूल-दाखिला | ✅ पास — 6-वर्ष अनिवार्यता, PDSB, किंडरगार्टन 4-5 |
| 23 | स्टेटस (Vancouver) | PR कार्ड समाप्त → स्थिति? | ✅ पास — "स्थिति नहीं खोती"; commercial-travel शर्त; 730-दिन नियम |

**नतीजा कुल्या (composition):** 23 में से 15 ✅ पूर्ण, 3 ⚠️ अंश/सार-कमी, 5 ❌ गलत-भूगोल व topic-misroute (P1), 3 ईमानदार निरस्त (P2-positive: UAE/Melbourne/Dublin/UK साफ निरस्त — गलत कानून नहीं दिखाया)।

## 4. प्रमुख निष्कर्ष

### P1 — गलत-जवाब का समूह (उपयोगकर्ता-हानि का जोखिम)
1. **Topic-misroute:** "बॉस घंटे कट रहा है + cash वेाज" पर study-permit घंटों का उत्तर दिया (wage-rote नहीं)। समान ESA-वाक्य पर सही — यानी routing वाक्य-निर्भर अस्थिर है।
2. **Free-text विदेश → कैनेडियन उत्तर:** "Germany Kaution" टेक्स्ट-मोड में **Ontario RTA** उत्तर (कोई कड़ा निरस्त नहीं)। टूटा (dropdown मोड में) सही देता है। यानी गलत-विषय का रुकावट मनुष्य चैनल तक नहीं — देश-Dropdown पर ही सही।
3. **Origin-अंबिगुत प्रश्न:** "NI number in the UK", "SSN in the United States", "share code UK" — engine ने origin=UK/US मानकर कनाडा जवाब दिया। यह नेत्र-दवा संभव (newcomer-को-कनाडा) है, पर जब user "in the US" कहे तो गलत। इन्हें स्पष्ट-यूनियन बनाना चाहिए (अंतिम संबोधन शब्द-तालिका द्वारा)।

### P2 — सार-गुण
1. **Telecom ECF:** जल्दी-रद्द सीमा का सवाल, सार "unlocking" पर — राशियाँ ($50/$100) citation में हैं पर IN-SHORT off-target; दोनों प्रस्तुतियों (rephrase सहित) में स्थिर।
2. **Surplus पंक्तियाँ:** OHIP-T Toronto में SIN-expiry; T1135 में T776 रेंटल — सही पर बाहरी।
3. **अंतर-प्रांत मिश्रण:** Toronto के SIN/जमा-उत्तर में **"Halifax or throughout Nova Scotia … one-half of one month rent"** पंक्ति दिखी (दो अलग प्रश्नों में) — "Place matters" ठेके के साथ इस पंक्ति की समीक्षा चाहिए (प्रमुख लक्ष्य: kyc जमा-ceiling रिकॉर्ड)।

### प्रशंसा (शक्तियाँ)
- हर प्रश्न पर **सोर्स-चेक तिथि + EXPIRE** साफ (उदा. 2026-11-08)।
- "Checked against the official page · automated" व "Reviewed by an editor" लेबल पंक्तिबद्ध।
- **Urgent-help मॉड्यूल** पासपोर्ट-रोका प्रश्न पर तुरंत फेल-क्लोज़: आपात-karma सलाह + लोकेशन-स्पष्टीकरण, कोई गलत कानून नहीं।
- Dubai/Melbourne/Dublin/UK के पर साफ निरस्त — कैनेडियन-कानून का रिसाव नहीं (Social QA ठेके वाला व्यवहार browser में भी बरता)।
- ड्रॉपडाउन-चैनल में DE 3-महीने Kaution, PR 730-दिन, Brampton 6-वर्ष, ESA कटौती — सब सटीक।

## 5. अगले कदम (सुझाव)

1. P1-2/Jermany + P1-3 (origin-अंबिगुत) के टेस्ट-केस `social QA correct`-शैल में pin करो; destination-प्रस्ताव नियम: "…in <country>/for <city of x>" वाक्य को देश-destination मानो।
2. Telecom ECF रिकॉर्ड का summary-heading ECF-गणना पर मोड़ो (खासकर CRTC रिकॉर्ड seed)।
3. Halifax/NS जमा-पंक्ति वाले community रिकॉर्ड का geo-tag जाँचो (kyc जमा रिकॉर्ड)।
4. wage-निर्देश voice ("boss घंटे कट रहा + cash") को ESA निर्देशिका से जोड़ो — वर्तमान में routing student-pool में गिर रही है।
5. Reddit/Quora सीधी-पहुँच अवरुद्ध = यह शोध-चक्र स्थगित; websearch खुलते ही 20-प्रश्न वास्तविक बैंक दुबारा।
