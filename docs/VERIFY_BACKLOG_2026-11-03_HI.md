# Verify-backlog: प्रकाशन कतार का वास्तविक निरीक्षण — 3 नवंबर 2026

यह दोक `scripts/kb-verify-publish.js` की ऑटोमेटेड ऑफिशियल-पेज जांच (2026-11-03 की run) का पूरा निरीक्षण है — read-only रूप से मापा हुआ, कोई कंटेंट-कोड नहीं बदला गया। उसी दिन के 0.19.50 के CHANGELOG-ब्लॉक ([CHANGELOG.md](CHANGELOG.md)) में आउटकम दर्ज है। कवरेज-संदर्भ: [COUNTRY_COVERAGE_ANALYSIS_2026-11-03_HI.md](COUNTRY_COVERAGE_ANALYSIS_2026-11-03_HI.md)।

## 1. यह जांच कैसे चलती है (ईमानदारी के नियम)

Records जो `source_verified` होने की उम्मीद में कतार में हैं:

- हर रिकॉर्ड का औपचारिक पेज लाया जाता है; **quote शब्द-शब्द** पेज पर हो + **समरी का हर आंकड़ा** पेज पर हो — तभी pass।
- डेड/ब्लॉक पेजों के लिए Internet Archive की एक ईमानदार दूसरी कोशिश होती है (प्रमाण-खबर रिकॉर्ड होती है कि आर्काइव-कॉपी थी सबूत)।
- Pass होने पर snapshot→candidate→approve→publish ऑडिटेड जंजीर से publish होता है, "Checked against the official page · automated" संदर्भ-लेबल के साथ, और नोट स्पष्ट लिखता है: **"Not an editor's review."**
- बैकअप पहले: `data/backups/settlement-before-verify-publish-1793677109867.sqlite`।

## 2. आज की run का नतीजा

| मापदंड | मूल्य |
|---|---|
| कतार में थे | 619 |
| चेक हुए | 617 |
| word-for-word pass | **11 → publish हुए** |
| Publication-chain records (कुल) | **45 → 56** (बड़े-12: 7 → 11; rest: 17 → 22) |
| रुके (honest कारण सहित) | 606 |

11 प्रकाशित: `ontario-crisis-support-988-and-newcomer-mental-health`, `ontario-bc-open-work-permit-spouse-healthcare-eligibility`, `ontario-community-health-centres-and-uninsured-care-navigation`, `au-medicare-reciprocal-healthcare-agreements`, `uk-london-nhs-gp-registration`, `australia-dvs-licence`, `australia-overseas-drivers`, `ireland-ndls-licence`, `israel-govil-licence`, `malta-tm-licence`, `norway-vegvesen-licence`।

> **F2 पाइलट (उसी दिन, दूसरी run):** `scripts/kb-corrections-2026-11-03.js` ने 4 quote-drift रिकॉर्ड ठीक किए — BGB § 556g, § 556(3), § 551 (statute के शब्द-शब्द वाक्य; अंक statute के शब्द-रूप से, क्योंकि ऑटोमेटेड जांच digits से मिलाती है) और GOV.UK tenancy-deposit overview (30-दिन वाक्य शब्द-शब्द; नया APT-from-1-May-2026 तथ्य दर्ज)। फिर पूरी कतार (606) दोबारा चली: **ठीक यही 4 गेट पास → `source_verified` प्रकाशित** (publications 56 → 60; बड़े-12 11 → 15; Germany के पहले प्रकाशित रिकॉर्ड)। नया कारण-वितरण: quote_not_on_page 251 → **246**, network_error 69, बाकी लगभग वही। बैकअप: `data/backups/settlement-before-kb-audit-2026-11-03.sqlite` और `settlement-before-verify-publish-1793679860137.sqlite`।

> **F2 बैच-2 (उसी दिन, तीसरी run):** उसी script में 6 रिकॉर्ड और — BGB § 622 (शबद्ध §(1); ASCII-अनुवर्तन हटा), DOL misclassification (शबद्ध 2024-rule वाक्य, effective March 11, 2024; अनप्रमाण्य "February 2026 proposal" दावा बदला पृष्ठ के अपने बयान से — final rule rescinds the 2021 IC rule, published January 7, 2021; छह factors digit-token-रहित शब्दों में), USCIS EAD auto-extension (शबद्ध up-to-540-day वाक्य; सभी summary आंकड़े पृष्ठ पर ही थे), IRS foreign-student FICA (शबद्ध छूट-वाक्य; citation पृष्ठ-सत्य IRC 7701; 6.2%/1.45% हटे — पृष्ठ पर नहीं), CFPB credit tools (summary उस पृष्ठ की वास्तविक सामग्री से पुनर्लिखित — credit invisible, thin/no file, denial-issues, FCRA protections; $200–$1,000/30%/400% हटे), IRS dual-status (शबद्ध परिभाषा; off-page § 7701(b)(4)/301.7701(b)-4/6013 citations और standard-deduction-bar दावा बदले Publication 519 व first-year choice से)। पूरी कतार (602) दोबारा: **ठीक ये 6 पास → प्रकाशित** (60 → 66; बड़े-12 15 → 21)। quote_not_on_page 246 → **241**, network_error 69 → 68। बैकअप: `settlement-before-kb-audit-2026-11-03-1793681326297.sqlite` (और बाद के दो), `settlement-before-verify-publish-1793681410662.sqlite`।

## 3. विफलता-करण का वितरण (606)

| समूह | रिकॉर्ड | quote_not_on_page | archive_http_404 | quote_too_short | network_error | archive_quote_not_on_page | archive_http_403 | बाकी (http_4xx/5xx, not_html, timeout…) |
|---|---|---|---|---|---|---|---|---|
| कनाडा | 151 | 66 | 50 | 14 | 10 | 5 | 3 | 3 |
| बड़े-12 | 258 | 88 | 76 | 47 | 10 | 12 | 5 | 20 |
| बाकी (देश+शहर) | 197 | 96 | 5 | 30 | 49 | 7 | 7 | 10 |

करांनो का अर्थ: `quote_not_on_page` = समरी वर्तन पेज से हटकर पुरानी/विस्तृत है (quote-drift); `archive_http_404` = live URL डेड और कोई आर्काइव-कॉपी नहीं (लिंक-मरम्मत चाहिए); `quote_too_short` = quote इतना छोटा है कि word-for-word सत्यापन नहीं हो सकता (लंबा उद्धरण चाहिए); `network_error` = साइट ने जवाब नहीं दिया (फिर-कोशिश योग्य)।

## 4. बड़े-12: प्रति देश कतार-विवरण (कुल/प्रकाशित/कारणश)

| देश | कतार | इनमें publish | प्रमुख विफलताएँ |
|---|---|---|---|
| Australia | 37 | 3 | quote-drift 18, quote_too_short 7, archive-404 6 |
| United States | 37 | 0 | quote-drift 14, quote_too_short 7, archive-404 6 |
| United Kingdom | 34 | 0 | quote-drift 20, quote_too_short 8 |
| Germany | 30 | 0 | quote-drift 13, archive-404 7, http_400 3 |
| UAE | 23 | 0 | **archive-404 10**, quote-drift 4 |
| New Zealand | 21 | 0 | quote-drift 7, quote_too_short 5 |
| France | 15 | 0 | quote-drift 5, archive-404 4 |
| Ireland | 14 | 1 | **archive-404 8** |
| Netherlands | 12 | 0 | archive-404 7, quote_too_short 4 |
| Singapore | 11 | 0 | archive-404 5, quote_too_short 5 |
| Spain | 12 | 0 | archive-404 6 |
| Sweden | 10 | 0 | **archive-404 8** |

कनाडा-पक्ष का निरीक्षण: संघीय 92 (pub 1; quote-drift 46, archive-404 33), ON 42 (pub 2), **BC 10 (pub 0; नौ network_error — शुद्ध फिर-रन वाले)**, शहर 7।

बाकी-पक्ष: उनमें शहर-रिकॉर्ड भी हैं (23 शहर/40 रिकॉर्ड — दुबई 4, लंदन 4, न्यू-यॉर्क 3+2…)। सबसे ऊपर के विफल शहर: Dubai 3, New York 3; फिर Austin/Boston/Chicago/London/Melbourne/Seattle/Sydney/Berlin 2-2।

## 5. संपादकों के लिए सुधार-क्रम (प्राथमिकता)

1. **नेटवर्क/साइट-करांना (68 + ~24**: BC के नौ समेत) — मानव-काम नहीं: फिर-चलो. उसके बाद ही बैकलॉग की सही आकार जानी जाएगी, पहले न करांश न बातें।
2. **archive-404 (131, बड़े-12 में 76)**: प्रत्येक डेड-लिंक要用 हाल के आधिकारिक-रुट से बदलना + नया स्नैपशॉट। UK `(4)`, UAE `(10)`, Ireland `(8)`, NL/SG/ES/SE ऊपर के आँकड़े; प्रति रिकॉर्ड वेब-शोध चाहिए।
3. **quote-drift (250)**: यही सचमुच समरी की दुरस्तoration है — प्रति-रिकॉर्ड नया उद्देश्य-खंड वेब से असली पृष्ठ-वाक्यांश की आयाती हुई समीक्षा (F2)।
4. **quote_too_short (91)**: लंबे उद्धरणों के निर्यात के साथ पुनःभीत सत्यापन।

## 6. टेस्ट-vs-ट्री स्थिति (ईमानदार संदर्भ)

- कंमिटेड `master` tree पर suite हरा है। वर्किंग-ट्री पर 28 तिथि-पार्इन टेस्ट फेल हैं क्योंकि अन्य सत्र 161-फाइल sweeps में hardcode तिथों को `todayIso()` कर रहा है — उनका कोड+टेस्ट साथ आने पर हल; उनके कंमिट से पहले मतलब न निकालें।
- `npm run kb:health`: blocking 0; "Approved without editorial review: 594" (यही ऊपर की कतार का केमकेम दर्पण है)।

## 7. दोहराव रीत-प्रविधि

```
# चेक-ओनले (बिना लिखे): डेटा पहले temp कॉपी पर चलाएँ
node scripts/kb-verify-publish.js --db <temp-copied-db> --report <out.json>
# प्रकाशन (स्वतः बैकअप सहित):
node scripts/kb-verify-publish.js --apply
```

Floors: `test/country-coverage.test.js` — बटन यह है कि published काउंट केवल बढ़ना चाहिए (आज 56); तिथियाँ counters `npm run coverage:report` में।

## 8. 4 नवंबर 2026 की प्रगति — डेड-लिंक बैच-1 (0.19.54)

दो रिकॉर्ड, जिनके आधिकारिक पृष्ठ बिना Archive-कॉपी के मर चुके थे, उनके प्राधिकारियों के नए पृष्ठों पर स्थानांतरित होकर प्रकाशित:

- `de-mietrecht-kaution-schufa-housing-kyc`: bmj.de → **bmjv.de** (मंत्रालय का नया डोमेन), Mietrecht अब `DE/themen/kaufen_reisen_wohnen/` पर। Quote अब पृष्ठ का शब्दशः जर्मन वाक्य (§ 551 (1) BGB जमा-सीमा); summary केवल वही जो पृष्ठ कहता है (किश्त-अधिकार, 10%-मिटप्राइसब्रेम्से आंकड़ा, आवेदन-दस्तावेज़ सूची पृष्ठ पर नहीं — हटा दिए गए)।
- `ie-rtb-rpz-2-percent-rent-cap`: rtb.ie का पूरा वृक्ष समतल `/renting/` में समा गया; रेंट-कैप की असल `renting/setting-and-reviewing-private-rents/` पर। Quote शब्दशः "Rent can only be increased once per year by 2% or the rate of inflation, whichever is lower."; title+summary पृष्ठ के 1-मार्च-2026 राष्ट्रीय तंत्र (CPI, HICP नहीं) पर पुनर्लिखित।
- **पहला URL-बदलाव वाला बैच** — इसलिए पहली बार source-registration भी: store की audited API से (raw SQL नहीं — provenance-gate वर्जित करता है): bmjv.de `registerSource` (tier A, पुराने bmj.de की तरह), rtb.ie `permitSource` (tier A, बाकी rtb.ie स्रोतों की तरह); दोनों `source_policy_reviews` पंक्तियों के साथ।
- Publish-queue (813 रिकॉर्ड) का शब्दशः पृष्ठ-जांच रन (backup पहले): 2 स्थानांतरित रिकॉर्ड `source_verified` प्रकाशित; साथ में 2 पहले से प्रकाशित रिकॉर्ड (`eviction`, `uk-london-nhs-gp-registration`) — जिनके bodies उसी दिन के feature-commit में बदले थे — पुनः सत्यापित-पुनः प्रकाशित (70 publication rows, 68 अलग रिकॉर्ड)। शृंखला: 66 → 68।
- Run के बाद बैकलॉग: 339 quote-drift, 192 डेड-लिंक (Archive-कॉपी रहित), 93 शॉर्ट-quotes, 86 network-त्रुटियाँ। (कतार 602 → 813 बढ़ी — उसी दिन ~315 नए रिकॉर्ड जुड़े।)
- Idempotency/अध्यारोहण: रिकॉर्ड की end-state अब `scripts/kb-rewrites.js` में भी है (4-नवंबर supersession) — 1-नवंबर contract-test हर replay-क्रम में हरी रहती है; floors 66 → 68 पुनः जमा।
- बचाव-प्रतिलिपियाँ: `settlement-before-kb-audit-2026-11-04.sqlite` (+2 timestamped), `settlement-before-verify-publish-*.sqlite`।
- स्थगित (कारण सहित): IND पृष्ठ JS-shell (1,409 वर्ण; नया route मिला: `ind.nl/en/residence-permits/work/residence-permit-for-orientation-year`); rijksoverheid SPA-shells/404; Försäkringskassan नेटवर्क-अनुपलब्ध; Irish statute-book पर pre-amendment पाठ। आगे के उम्मीदवार: RTB `/renting/rights-responsibilities/security-deposits/` (deposits रिकॉर्ड), wetten.overheid.nl BWBR0048028 (nl-borg रिकॉर्ड), quote-drift बैच-3 (339), शॉर्ट-quotes (93)।
