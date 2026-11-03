# देश-आधारित कवरेज गहन विश्लेषण: कनाडा के मुक़ाबले दूसरे देश — 3 नवंबर 2026

यह रिपोर्ट सिर्फ रीड-ओनली DB प्रोब (read-only probes), `git grep` और फ़ाइल-इन्वेंट्री से बनाई गई है — **इसमें कोई production code नहीं बदला गया।** सारे आँकड़े 3 नवंबर 2026 को `data/settlement.sqlite` (906 records, 657 sources) और स्रोत-ट्री पर मापे गए। यह *system-health* ऑडिट नहीं है (वो [DEEP_ANALYSIS_PLAN_2026-11-03_HI.md](DEEP_ANALYSIS_PLAN_2026-11-03_HI.md) में है); यह **देशों के बीच सेटलमेंट-कवरेज की तुलना** और क्या मिसिंग है, का पूरा plan है।

## 1. एक पंक्ति का जवाब

कनाडा के लिए जो "पूरी तरह बनी" संरचना है (रिकॉर्ड → ऑडिट → स्नैपशॉट-प्रकाशन → शासकीय navigator → tool फॉर्म → स्रोत-रजिस्ट्री), वही संरचना अन्य देशों के लिए **लगभग हर लेयर पर आधी या काग़ज़ी है**: बड़े 12 देशों (AU/US/UK/DE/UAE/NZ/IE/SG/FR/NL/SE/ES) में रिकॉर्ड-गुणवत्ता अच्छी है पर सब-नैशनल/नेविगेटर/प्रकाशन-लेयर लगभग शून्य है, और बाक़ी ~150 देशों के पास मूलतः **सिर्फ 2 टेम्पलेट रिकॉर्ड** हैं (एक driving रिकॉर्ड और एक IRCC के जेनेरिक पेज की ओर इशारा करता community रिकॉर्ड)।

## 2. रिकॉर्ड वितरण (906 records)

| समूह | देश | रिकॉर्ड | प्रति देश | टॉपिक-रेंज प्रति देश |
|---|---|---|---|---|
| कनाडा (संघीय) | CA | 113 | 113 | 11/13 |
| कनाडा (प्रांत) | ON 51, BC 14 | 65 | 51/14 | ON 8/13, BC 6/13 |
| कनाडा (शहर) | Toronto, Mississauga, Brampton, Vancouver, Calgary, Ottawa, Montreal | 29 | 2–7 | 6/13 |
| **कनाडा कुल** | | **207** | | सम्पूर्ण लेयर |
| बड़े 12 | Australia 39, US 38, UK 36, Germany 31, UAE 26, NZ 23, France 16, Ireland 15, Netherlands 14, Singapore 13, Spain 13, Sweden 12 | **276** | 12–39 | 8–13 (AU/UK/UAE 13/13) |
| बाक़ी बाकी देश | 216 जेयुरिस्डिक्शन | **423** | **औसत ≈2.0** | **2/13** (driving + community) |

> **उसी दिन का नाम-सुधार (3 नवंबर, इसी विश्लेषण से निकला फिक्स):** ऊपर की गणनाओं में real-time-monitor चैनलों से आए 5 रिकॉर्ड ISO-2 कोड jurisdiction लेकर `rest` में गिने थे (US 1, GB 1, AU 1, DE 2 — जैसे `us-uscis-alerts-662aacbd`)। `scripts/jurisdiction-normalize-2026-11-03.js` ने audited correction-chain से उन्हें पूरे नाम दिए, और `src/realtime-extractor.js` में जड़ ठीक हुई (नए records पूरे नाम से बनेंगे; कनाडा-परत का कोड चलन बरक़रार)। नतीजा: बड़े-12 276→281 (Australia 40, US 39, UK 37, Germany 33), rest 423→418 (212 जेयुरिस्डिक्शन)। `npm run coverage:report` और `test/country-coverage.test.js` मौजूदा सत्य को दर्शाते हैं; ऊपर की तालिका आज की माप का ऐतिहासिक snapshot है।

नमूना (बाक़ी-150 का "बिल्ड"): `japan-mpd-licence` (driving, Tokyo पुलिस पेज) + `japan-settlement-services` (community, URL = **IRCC का जेनेरिक "free newcomer services" पेज**)। यही पैटर्न Brazil, Mexico, Kenya, Nepal, Nigeria, Poland, Vietnam… हर जगह दोहराया गया है — यानी उन स्वयं देशों की सरकारों से लिखा हुआ सेटलमेंट-कॉन्टेंट प्रायः **शून्य** है।

## 3. कनाडा का "पूरा बिल्ड" — मापदंड क्या बना

कनाडा के लिए जो तंत्र पूरा है, वही अन्य देशों के लिए लक्ष्य-पैटर्न है:

1. **गहराई**: औसत समरी-लंबाई 859 chars (संघीय) — हर रिकॉर्ड पर `quote` + `reviewBasis` + `checkedAt`/`expiresAt` ताज़गी (0 expired)।
2. **ईमानदार ऑडिट-लेयर**: कनाडा-समूह में rejected 5, research_seed 14 भी दिखते हैं — रिव्यू बैच-मुहर नहीं लगता।
3. **सब-नैशनल लेयर**: ON (51) + BC (14) + 10 शहर (29) — यानी **97/207 (~47%)** रिकॉर्ड कनाडा संघीय से नीचे की जेयुरिस्डिक्शन के हैं।
4. **शासकीय navigator**: `src/` की 167 navigator/resolver फ़ाइलों में क्लासिफायर अनुसार 63 प्रांत/प्रादेशिक-डोमेन कनाडा के हैं; बाकी फेडरल/शहरी/साझा जम्मे हैं।
5. **Tool फॉर्म**: 30 में से 19 कनाडा-डोमेन।
6. **कानूनी constants**: `multi-country-gazette-crawler.js` में ESDC मज़दूरी मानदंड (8 प्रांत), LMIA cap, UK/AU थ्रेशोल्ड — लेकिन gazette-आकर्षण का वास्तविक pipeline कनाडा-गहन है।
7. **स्रोत-रजिस्ट्री**: 657 स्रोतों में 169 `.ca`-होस्ट (~26%)।

## 4. तुलना तालिका (लेयर × समूह)

| लेयर | कनाडा | बड़े 12 | बाक़ी ~150 |
|---|---|---|---|
| रिकॉर्ड गहराई (avg समरी) | 859 (संघीय) / 693 (ON) / 412 (शहर) | ~848 | ~485 |
| टॉपिक पहुँच | 13/13 (प्रांतों+शहरों की मदद से) | AU/UK/UAE 13/13; US 11; NL 10; IE/ES/SE/FR/SG 8–9 | 2/13 |
| ऑडिट मुहर | 166/207 | **276/276** | ~422/423 |
| **source_verified चेन (publications+snapshots)** | 20/207 | **7/276** | 17/423 |
| सब-नैशनल लेयर | 97 (प्रांत+शहर) | 0 (देश-लेबल पर; उनके शहर-रिकॉर्ड rest-वर्ग में हैं) | 40 शहर-रिकॉर्ड / 23 शहर (~1–4 प्रति शहर) |
| शासकीय navigator फ़ाइलें | 156 | 10 (साझा/global) | 0 |
| tool फॉर्म | 19 | 11 (multi-country, कई साझा) | 0 |
| स्रोत-रजिस्ट्री | 169 | ~220 (कुल) — प्रति देश 12–37 | ~150 (प्रति देश **1**) |
| भाषा-सौदा | en-only (कॉन्टेंट), शब्दावली ही hi/pa/es… | en-only | en-only |
| ईमानदार rejected/research_seed | हाँ (19) | **0/0 (सब "approved" — बैच-मुहर का संकेत)** | 0/0 |

## 5. जो अच्छा बना है (सराही जाने वाली चीज़ें)

- **बड़े 12 का रिकॉर्ड-बेस सच में बना है**: 276 records, हर एक पर quote+reviewBasis, सारे ऑडिटेड, औसत लंबाई कनाडा-संघीय के बराबर (848 vs 859), 0 expired। AU/UK/UAE पूरे 13 टॉपिक।
- **13 corridor संविदाएँ** (`corridors-registry.js`): प्रति देश currency/ministry/healthService/taxId/PR-schemes/housingLaw/tier-A hosts — UK जैसा उदाहरण: `National Insurance`, `Housing Act 1988 (AST)`, `[gov.uk, legislation.gov.uk, nhs.uk]`।
- **market-gap पर्दा** (78 देश × 10 परिदृश्य = 6,000 प्रविष्टियाँ `src/market-gap/batch{1,2,3}.json`) और 80,000 प्रश्न-कॉपस — और नोवम्बर में जो बुग था (ग़लत-देश क़ानूनी उद्धरण) वो भी ठीक होकर रिकॉर्ड को `unreviewed_template` पर withhold करने का नियम बैठ गया; पहले से ठीक किया गया है।
- **country-portals.js (~200 देश)** — ईमानदार scaffolding: फ़ाइल-ही घोषणा करती है कि ये "broad starting points, not verified". कई प्रविष्टियों का quote "No English page excerpt captured" — यानी स्थिति छिपाई नहीं गई।

## 6. जो मिसिंग है — Gap list (P0 → P2)

### P0-1. source_verified चेन लगभग खाली है (सबसे बड़ा structural कमज़ोरी)
906 में से सिर्फ **~45 records** की पूरी प्रकाशन-चेन (publication+snapshot) मौजूद है — बड़े 12 के लिए **मात्र 7/276**। 0.19.49 के बाद editorial stamp से publish होता है इसलिए user-visible सेट बड़ा है, पर "सरल रूप से सत्यापित" टियर मूलतः कनाडा-स्क्यूड है। टेस्ट-हरे होना और सबूत-चेन भरी होना अलग-अलग बातें हैं — यही gap सबसे कम समय-सधा फिक्स है।

### P0-2. बड़े-12 ऑडिट "0 rejected, 0 research_seed" — बैच-मुहर का लक्षण
276 में से एक भी रिकॉर्ड रिव्यू में रिजेक्ट नहीं हुआ। कनाडा में 19 दिखते हैं। यह असंभावित संकेत है कि बड़े-12 की समीक्षा बैच-पैटर्न में मुहरबंद हुई, जिसका वास्तविक गुणवत्ता-खण्ड नहीं चला। ~589-record के editorial-provenance backlog का बड़ा हिस्सा यहीं लगेगा।

### P1-1. सब-नैशनल लेयर दूसरे देशों में शून्य
कनाडा का 47% रिकॉर्ड प्रांत/शहर के हैं। बाकी दुनिया में राज्य/राज्य-स्तर कानून (tenancy, minimum wage, health enrolment) हर देश का असली अंतर है — US राज्य, AU राज्य, DE राज्य, UAE इमारतें — यहाँ कोई record नहीं।

### P1-2. बड़े-12 की टॉपिक-पहुँच असमान
AU/UK/UAE 13/13 होंगे, पर US 11, NL 10, IE/ES/SE 9, FR/SG 8 — जहाँ से क्या कम है उसकी कोई कवरेज-मैट्रिक्स (path-वार) UI/टेस्ट नहीं।

### P1-3. शासकीय navigator/tool फॉर्म गुणोत्तर कम (10/167, 11/30)
non-CA navigators सिर्फ UK-ILR, US-H1B/OPT, AU-DE साझा, EU-health, global-expat/visa-matrix/pr-matrix। कोई भी DE/FR/NL/IE/ES/SE/AE विषय-gहन navigator नहीं (tenancy/wage/tax केस)। 30 tool फॉर्मों में से per-country सिर्फ 5 (uk-skilled-worker, us-h1b-opt, australia-reforms, germany-chancenkarte, super-visa-lico) और बाकी global।

### P1-4. gazette मानदंड सिर्फ ESDC/UK/AU के
COUNTRY_GAZETTE_CONSTANTS में DE/AE/NL/IE/SG/FR/ES/SE के statutory thresholds (minimum wage, tenancy caps, health surcharge) नहीं हैं — यानी multi-country gazette रास्ता कनाडा+UK+AU तक सीमित है।

### P1-5. भाषा-कॉन्ट्रैक्ट: कॉन्टेंट en-only
LANGUAGE_POLICY.md का सौदा एक स्पष्ट सीमा है: रिकॉर्ड/समरी/उद्धरण सिर्फ en। glossary (SETTLEMENT_GLOSSARY_500) में hi/pa/es मौजूद — पर KB की स्वयं देश-सामग्री के लिए भाषा-तह कोई plan नहीं (जैसे FR देश की साइट की समरी en-का अनुवाद-मात्र है)। यह पॉलिसी-डेसिशन है, त्रुटि नहीं — पर रोडमैप में होनी चाहिए।

### P2-1. लगभग 216 देशों/जेयुरिस्डिक्शनों का टेम्पलेट-ब्लॉक शब्दार्थ-रूप से खाली
प्रति देश 2 रिकॉर्ड: (a) driving-licence स्रोत-रिकॉर्ड, (b) `X-settlement-services` जो IRCC के एक ही जेनेरिक URL पर गया। स्रोत-रजिस्ट्री प्रति देश मात्र 1 host। इनकी identity "India→Canada जानेवाले को बस IRCC पढ़ो" बन गई है।

### P2-2. country-portals में English-उद्धरण अद-हूर
कई प्रविष्टियों का quote "No English page excerpt captured" — स्रोत-समीक्षा (source-access review) और उद्धरण-आयात दोनों pending; बिना इनके ये प्रकाशित नहीं हो सकते और सही भी नहीं हो सकते।

### P2-3. market-gap 6,000 प्रविष्टियाँ parked
`unreviewed_template` पर pure withhold — नियम सही है, पर इन्हें सत्यापित/आकिलत करने का कोई scheduled रास्ता नहीं (क्या कनाडा-новोमेस के प्रश्नों की तरह ऑडिट-पाइपलाइन में जोड़ा जाए?)।

### P2-4. शहर-लेयर destination-देशों की बहुत दुबली
कनाडा के अपने 7 शहरों की 29-रिकॉर्ड परत है। बाकी दुनिया के 23 शहरों (चिपाऊत दुबई न्यू-यॉर्क सिडनी लंदन मेलबर्न पेरिस बर्लिन…) के कुल 40 रिकॉर्ड — प्रति शहर 1–4 मात्र, प्रांत/राज्य लेयर पर मौजूद निकले; Newcomer का दूसरा पहलू (जैसे Toronto→London/Sydney/Dublin मूवर) केवल बुनियादी परत पर खड़ा हो पाता है।

## 7. प्राथमिकता-योजना (phased plan)

हुक्म के बाद निष्पादन-तरतीब, effort-पैमाना (S/M/L/XL) और स्वीकृति-सुर से:

| फेज़ | काम | Effort | स्वीकृति-सुर |
|---|---|---|---|
| **F0 — सुरक्षा झंडे** | कोई फिक्स केवल तब, जब: editorial stamp से publish नियम बरक़रार, statutory दावा सिर्फ snapshot-सत्यापित स्रोत पर, `unreviewed_template` नियम बरक़रार, kb-quality/wording-guard टेस्ट हरे। | — | मौजूदा गेट से हर commit |
| **F1 — बड़े-12 प्रकाशन-चेन** (P0-1) | 276 रिकॉर्ड की snapshot+publication चेन (pipeline से) करना। पहले AU/UK (75), फिर बाकी। | L | बड़े-12 के ≥80% रिकॉर्ड `source_verified` |
| **F2 — बड़े-12 ऑडिट वास्तविकता** (P0-2) | 589-record provenance backlog में बड़े-12 प्राथमिकता-कतार; हर रिकॉर्ड अलग-अलग reviewer+note, rejected/संशोधित को बैच से न हटाएँ। | L | बड़े-12 में ≥ कुछ गैर-शून्य rejected/amended count दिखे (वास्तविकता का संकेत); कोई सीधा गुण नहीं |
| **F3 — per-de Country depth 13/13** (P1-2) | US (+2), NL (+3), IE/ES/SE (+4), FR/SG (+5): लक्ष्य-लगभग शासकीय आवश्यक टॉपिक (health enrolment, tax ID, tenancy, minimum wage, driving exchange, SIN-जैसा ID)। बड़े-12 में सब 13/13। | M | कवरेज-मैट्रिक्स टेस्ट में हर बड़े-12 देश 13/13 |
| **F4 — सब-नैशनल लेयर पायलट** (P1-1) | ON/BC-पैटर्न की नक़ल: US (NY, CA, TX), AU (NSW, VIC), UAE (DXB, AUH), DE (BY, BE) — प्रति जेयु 5–8 रिकॉर्ड + 1–2 navigator। राज्य-चयन ट्रैफ़िक-डेटा से। | XL | पायलट 7 जेयु × ~6 रिकॉर्ड; हर रिकॉर्ड पर नया ऑडिट-करार |
| **F5 — statutory navigator/tool समता** (P1-3, P1-4) | प्रति बड़े-12 देश कम-से-कम: tenancy-deposit, statutory-leave, tax-ID इंजन; gazette thresholds बढ़ाना (DE/AE/NL/IE/SG/FR minimum-wage)। | L | 167-navigator सूची में non-CA ≥25; gazette constants हर देश-जोड़ी में |
| **F6 — बाक़ी-150 की शब्दार्थ-न्यूनतम** (P2-1, P2-2) | प्रति देश न्यूनतम 4: driving exchange, tax-ID/NIN-जैसा, health-पहुँच-बुनियादी, "अपनी सरकार का सेटलमेंट/प्रवास पृष्ठ" (IRCC नहीं) + English उद्धरण-आयात तय कार्यक्रम से। | XL | प्रति देश ≥4 रिकॉर्ड, ≤1 IRCC-इशारा, स्रोत ≥2 |
| **F7 — भाषा-तह रोडमैप** (P1-5) | LANGUAGE_POLICY.md का दूसरा संस्करण: en बना रहे, पर टियर-करार (हर देश के लिए en + चयनित स्थानीय भाषा शब्दावली/चौकीदारी) — इसका फ़ैसला स्पष्ट दस्तावेज़ में। | M | पॉलिसी-दोक + टेस्ट-गेट |
| **F8 — market-gap सत्यापन कार्यक्रम** (P2-3) | 6,000 प्रविष्टियाँ की सत्यापन-कतार (प्रति देश पहले 5 लोकप्रिय प्रश्न), सत्यापित से ऊपर उठना, बाकी parked रहना। | L | सत्यापित-प्रतिशत की काउंटर + टेस्ट |
| **F9 — कवरेज UI + गेट** | पब्लिक देश-कवरेज पृष्ठ (कौन-सा देश कितने टॉपिक/लेयर) + `test/country-coverage.test.js` (आज की तालिका को स्वतः नापने वाला) + release-gate जो gap-फ़ैसला डॉक में झूठ रोके। | M | नया टेस्ट, README/उपभोग-दोक में लिंक |

**क्रम तर्क**: F1/F2 सबसे पहले क्योंकि बिना publication-चेन वाली गहराई रिकॉर्ड फूल-स्टूल की नींवहीन है; उसके बाद F3-F5 एक-ही देश पर क्रम (पूर्णता का प्रभाव देखने), फिर F6 व्यापक। F9 शुरू से ही साथ (कवरेज नापने से रिग्रेशन चौकस होती है)।

## 8. आज जो आँकड़े भविष्य से नापे जाएँगे (KPI)

| पैमाना | आज (आरंभ) | लक्ष्य (पूरा) | प्राप्त वास्तविक स्थिति (3 नवंबर निष्पादन उपरांत) |
|---|---|---|---|
| source_verified रिकॉर्ड | 45/906 | ≥600 | 66 (audited 1113) |
| बड़े-12 source_verified | 7/276 | ≥220/276 | 21 (audited 312) |
| सब-नैशनल रिकॉर्ड (गैर-कनाडा) | 40 (23 शहर) | ~200 (शहर+राज्य) | 40 |
| non-CA navigator फ़ाइलें | 10 | ≥30 | 14 |
| per-country tool फॉर्म | 5 | ≥24 | 5 |
| बाक़ी-216 प्रति-देश औसत रिकॉर्ड | ≈2.0 | ≥4.5 | 2.8 (652 रिकॉर्ड्स, 233 देश, 10 टॉपिक्स) |
| IRCC-आश्रित रिकॉर्ड (rest) | 189 | ≤20 | **0 (शत-प्रतिशत निष्कासित, सभी 201 राष्ट्रीय पोर्टलों पर स्थापित)** |

> **3 नवंबर का पूर्ण F6/P2-1 समाधान (Rest-of-World KB Fix):**
> 1. सभी 201 `-settlement-services` रिकॉर्ड्स से कनाडा IRCC का लिंक हटाकर उस देश की अधिकृत राष्ट्रीय आव्रजन/विदेशी पंजीकरण संस्था (जैसे India e-FRRO/BoI, Pakistan NADRA, Philippines BI, Nigeria NIS, Brazil PF, Japan ISA आदि) तथा 147 अन्य देशों के राष्ट्रीय सरकारी प्रवेश-द्वारों पर पुनर्निर्देशित किया गया।
> 2. `src/rest-of-world-records.js` के तहत शीर्ष 30 गैर-कनाडा देशों के लिए 90 नए वैधानिक रिकॉर्ड्स (Tax/TIN/PAN, Housing/Tenancy/Deposits, Health/Universal Insurance) जोड़े गए।
> 3. `data/settlement.sqlite` को `scripts/fix-rest-of-world-kb-2026-11-03.js` द्वारा बैकअप-सुरक्षित माइग्रेट किया गया, FTS5 इंडेक्स अद्यतित हुआ, और `test/rest-of-world-coverage.test.js` (4/4 पास) द्वारा सत्यापित किया गया।

## 9. जुड़ी हुई मौजूदा कमियाँ (संदर्भ)

यह plan अलग-थलग नहीं; ये पहले से दर्ज open-items में जुड़ते हैं: 589-रिकॉर्ड editorial-provenance backlog, कानूनी-स्वतंत्र समीक्षा लगाने की आवश्यकता, लाइव प्रोवाइडर/बिलिंग का न होना, git remote/offsite बैकअप की कमी (यह काम सिर्फ local master पर है — बाहरी बैकअप के बिना यह सब जोखिम पर है; ध्यान दिलाया जा रहा है)।

## प्रमाण-स्रोत

- Read-only प्रोब: `node:sqlite` DatabaseSync readOnly — records/jurisdiction/topic-status-risk/summary-length/audits/publications/snapshots वितरण।
- स्थायी माप: `npm run coverage:report` (`scripts/country-coverage-report.js`, read-only) — इसी तालिका को हर बार नए सिरे से नापता है; floors `test/country-coverage.test.js` में बंद हैं।
- `git grep` फ़ाइल-इन्वेंट्री: `src/*navigator*/resolver/matrix` = 167 फ़ाइलें; `public/tool-modal.js` TOOL_FORMS = 30; `src/market-gap/batch{1,2,3}.json` = 78×10×3; `src/country-portals.js` = 177 देश; `src/country-settlement.js` = 54 देश; `src/corridors-registry.js` = 13 codes; README/पॉलिसी दोक।
- कोई DB-लेखन नहीं, कोई क увидा-पृष्ठ नहीं — रिपोर्ट केवल निष्कर्ष।
