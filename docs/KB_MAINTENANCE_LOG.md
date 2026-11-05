# Knowledge-base maintenance log

The scheduled maintenance runs add entries here, newest first. Each entry records:
- what was checked;
- what was corrected, with the old text, the new text and the source;
- what needs a person.

Each entry ends with a short summary in Hindi for the owner.

How the schedule works: docs/KB_MAINTENANCE.md, section "Automatic schedule".

---

## 2026-11-03: daily fact-check

Second batch of the day.

- **Checked:** 20 records (BC, CBSA, CRA, FCAC, Ontario and Germany). **Verified:** 6. **Corrected:** 8. **Need a person:** 6.
- **Verified:** bc-rtb-dispute-resolution, cra-cost-base-step-up-landing-fmv, cra-t1135-personal-use-property-exemption, de-buergeramt-anmeldung-steuer-id-kyc, de-mietrecht-kaution-schufa-housing-kyc, de-rundfunkbeitrag-single-household-exemption (EUR 18.36 is still the fee; the KEF proposal of EUR 18.64 from 2027 has not been adopted).
- **Corrections** (in `scripts/kb-corrections-2026-11-01.js` under `// Scheduled review 2026-11-03`, applied with a backup and an audit row per record; no `src/kb-facts.js` fact was affected):
  - canada-pnp-intent-to-reside-charter-s6: "IRPA Section 87(2) and IRPR Section 87" (also in the title) → "section 87 of the Immigration and Refugee Protection Regulations (IRPR)" (https://laws-lois.justice.gc.ca/eng/regulations/SOR-2002-227/section-87.html)
  - cbsa-poe-currency-declaration-e677: "penalties ranging from $250 to $5,000" → "penalties ranging from 5% to 50% of the seized funds"; "travelers must carry verifiable proof of funds" → "should keep" (https://www.cbsa-asfc.gc.ca/travel-voyage/ttd-vdd-eng.html)
  - cra-fhsa-newcomer-immediate-eligibility: "room begins accruing as soon as the individual attains 18 … and becomes a Canadian tax resident" → room starts only in the year the first FHSA is opened (first-time home buyers); "100% tax-deductible … entirely tax-free" → "generally deductible … not taxed" (https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/first-home-savings-account/contributing-your-fhsa.html)
  - cra-tfsa-non-resident-contribution-penalty: "s.207.02 … 1% per month on the highest excess contribution amount" → non-resident contributions taxed at 1% per month under s.207.03 until fully withdrawn or residency resumes (excess tax s.207.02 is separate); "RC243 with an application for taxpayer relief under ITA section 220(3.1)" → RC243 and Schedule B by June 30, and a CRA waiver request if it was a reasonable error (https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/tax-free-savings-account/owing-tax/non-resident.html)
  - de-aufenthg-chancenkarte-secondary-work-rights: "EU Blue Card … under Section 18a/18b" → "EU Blue Card (Section 18g) or skilled worker residence title (Section 18a/18b)" (https://www.gesetze-im-internet.de/aufenthg_2004/__18g.html)
  - de-bafin-banking-kyc-girokonto: "International students must open … Sperrkonto … €11,904" → students usually use a Sperrkonto of at least €11,904 (€992 a month, 2026), and other proofs such as a Verpflichtungserklärung, a bank guarantee or a scholarship are also accepted (https://www.auswaertiges-amt.de/de/service/fragenkatalog-node/08-finanzierung/606220)
  - fcac-secured-credit-card-kyc: "charging 30% to 47% APR" → "since 1 January 2025 the legal maximum for most consumer loans is 35% APR" (https://laws-lois.justice.gc.ca/eng/acts/c-46/section-347.html)
  - fintrac-banking-kyc-bank-act: the "primary/secondary document" list (which included lease agreements and foreign credit cards) → the FCAC rule: two listed documents (name and address; name and date of birth), or one document plus confirmation by a person in good standing (https://www.canada.ca/en/financial-consumer-agency/services/banking/opening-bank-account.html)
- **Need a person:**
  - bc-msp-services-card-kyc-enrollment: the wait period (rest of the month plus two months) and the 6-month permit rule are confirmed. Check on Health Insurance BC whether the wait is now waived for any newcomer group (one search result mentions permanent residents and CUAET arrivals) and check the exact enrolment ID list. The gov.bc.ca page would not load.
  - cbsa-digital-device-search-limits: the record URL returns 404; the current page is https://www.cbsa-asfc.gc.ca/travel-voyage/edd-ean-eng.html. The statement that courts accept Customs Act s.99(1)(a) for devices needs checking against R v Canfield (Alberta Court of Appeal, 2020).
  - cbsa-expired-pr-card-land-border-entry: the record URL returns 404. IRCC confirms that a PR without a valid card can return by land in a private vehicle. Check whether a COPR is accepted, and soften "absolute right" and "cannot refuse entry".
  - cra-my-account-interac-sign-in-partner-kyc: the record URL returns 404 and the process it describes is wrong. CRA says registration needs a filed return and a notice of assessment (BC and Alberta residents can use a provincial partner), and a Sign-in Partner is only a login. The security code arrives by mail within 10 business days. The summary needs rewriting from https://www.canada.ca/en/revenue-agency/services/e-services/cra-login-services/register-cra-sign-in-services.html.
  - de-schulpflicht-school-registration-kyc: compulsory schooling comes from each state's school law, not the Basic Law, and its length differs by state. "Aged 6 to 18" needs state-by-state wording.
  - drivetest-kyc-document-authentication: the record URL has moved (drivetest.ca/licences/exchanges-foreign-licences/foreign-licence-experience-credits/). Ontario accepts MTO-recognized translators or an embassy or consulate letter, not only ATIO/STIBC. The extract examples (Parivahan, DVLA, LTO) are unconfirmed. Ontario also changed experience credits on 1 July 2026.
- **Note:** cbsa-asfc.gc.ca, drivetest.ca and gov.bc.ca pages partly failed to load (404, 403 or dropped connection); those checks used search results from official domains. Review totals also changed between runs (total 589 → 393, checked 94 → 110 before this batch), most likely because of another session; this run did not change the queue's scope.
- **Review progress:** `{"total":393,"checked":130,"remaining":263,"verified":79,"corrected":39,"needs-human":12}`
- **Tests:** `npm test`: 2361 passed, 0 failed.

सारांश: आज दूसरी बार 20 रिकॉर्ड जाँचे गए। 6 सही थे, 8 में गलत जानकारी ठीक की गई (जैसे ब्याज की अधिकतम दर अब 35%, FHSA की सीमा खाता खोलने से शुरू होती है, CBSA जुर्माना 5% से 50%)।
6 रिकॉर्ड (BC MSP, CBSA के दो पेज, CRA My Account, जर्मनी स्कूल नियम, DriveTest) आपको खुद देखने हैं। सभी टेस्ट पास हैं।

## 2026-11-03: daily fact-check

- **Checked:** 20 records (UAE and Australia). **Verified:** 10. **Corrected:** 4. **Need a person:** 6.
- **Corrections** (in `scripts/kb-corrections-2026-11-01.js` under `// Scheduled review 2026-11-03`, applied with a backup and an audit row per record; no `src/kb-facts.js` fact was affected):
  - au-austrac-100-point-banking-kyc: "International electronic wire transfers of AUD $10,000 or more are reported to AUSTRAC" → banks report international transfers whatever the amount, and cash (notes and coins) of AUD 10,000 or more as threshold transactions (https://www.austrac.gov.au/industry-and-business/obligations-and-guidance/your-amlctf-program/reporting-us/threshold-transaction-reports)
  - au-home-affairs-vevo-right-to-work-kyc: "Migration Amendment (Employer Sanctions) Act 2013" → Migration Act 1958 as amended by the "Migration Amendment (Reform of Employer Sanctions) Act 2013" (https://www.legislation.gov.au/C2013A00010/asmade/details)
  - au-rental-bonds-lodgement-and-refund-kyc: "lodge … within 7 to 10 days" → within each state's deadline, for example 10 working days in NSW and 14 days in WA (https://www.nsw.gov.au/housing-and-construction/renting-a-place-to-live/starting-a-residential-tenancy, https://www.consumerprotection.wa.gov.au/lodging-bond)
  - au-ato-tax-file-number-tfn-kyc: "Individual Auto TFN service" → ATO Individual Auto Registration (IAR) service, for applicants who are in Australia on a visa that allows work or study (https://www.ato.gov.au/forms-and-instructions/tfn-application-for-permanent-migrants-and-temporary-visitors)
- **Need a person:**
  - ae-dha-mandatory-health-insurance-kyc: the record gives the EBP outpatient co-pay as "20% capped at AED 50 to AED 100". The DHA EBP table shows 20% per visit, and none of the sources confirm those caps. The record should also say that cover has been mandatory UAE-wide since 1 January 2025.
  - ae-rera-ejari-tenancy-registration-kyc: no official source shows that the 5%/10% deposit is a legal cap and not just market practice. The 12-month eviction notice applies only to the Law 33/2008 Art. 25(2) grounds, but the record states it as a general rule.
  - ae-tenancy-security-deposit-and-ejari-escrow-kyc: the same 5%/10% deposit question.
  - antifraud-newcomer-scam-shield: the phone number is correct. No official source was found for the "DriveTest booking scalpers, $50 to $150" warning.
  - au-services-australia-rhca-medicare-enrolment: the record says UK students are excluded from cover. Queensland Health says UK students are covered and students from Ireland, Finland, Malta and Norway are not. The Services Australia page timed out, so this was not checked there.
  - au-state-education-public-school-enrolment-kyc: the record gives one compulsory school age (6 to 17), but it differs by state. It is also unclear whether "100-point proof of address" is the real enrolment wording.
- **Note:** several official sites (servicesaustralia.gov.au, immi.homeaffairs.gov.au, austroads.gov.au, austrac.gov.au) blocked the page fetcher or timed out. Those checks relied on search results from official domains instead.
- **Review progress:** `{"total":589,"checked":94,"remaining":495,"verified":55,"corrected":33,"needs-human":6}`
- **Tests:** `npm test`: 2311 passed, 0 failed.

सारांश: आज 20 रिकॉर्ड जाँचे गए। 10 सही थे, 4 में गलत आँकड़े ठीक किए गए (AUSTRAC रिपोर्टिंग, कानून का नाम, बॉन्ड जमा करने की समय-सीमा, TFN सेवा का नाम)।
6 रिकॉर्ड (दुबई बीमा/किराया, धोखाधड़ी चेतावनी, ऑस्ट्रेलिया छात्र मेडिकेयर, स्कूल नियम) आपको खुद देखने हैं। सभी टेस्ट पास हैं।

## 2026-11-03: weekly health check

- **Blocking problems:** none. 0 seed record, 0 database record and 0 glossary problems (`npm run kb:health`, 906 database records, 490 seed records, 500 glossary terms).
- **Facts past their review date:** none, so no fact values changed. The next one due is `ca.ontario.rentIncreaseGuidelinePercent` (reviewBy 2026-12-31); the 2027 guideline should be checked on the next run.
- **Expired or expiring records (14 days):** none. Nothing was extended, corrected or sent to a person.
- **Seed files out of sync:** none.
- **Registry migration:** the Ontario ESA wage tool (`src/esa-wage-theft-navigator.js`) hard-coded the Ontario general minimum wage as C$17.20 (the rate from 1 October 2024, now out of date). It now reads the new fact `ca.ontario.generalMinimumWageCad`, set to C$17.95 per hour from 2026-10-01 (it was C$17.60 from 1 October 2025). reviewBy is 2027-10-01. Source: https://www.ontario.ca/document/your-guide-employment-standards-act-0/minimum-wage (checked 2026-11-03). A new assertion in `test/kb-health.test.js` checks that the tool uses the registry value. No KB record quotes the old rate.
- **Next candidate:** `src/digital-platform-worker-navigator.js` still hard-codes the Ontario engaged-time minimum wage as C$17.20 (`ON_MIN_ENGAGED_HOURLY_WAGE_CAD`). It should read the same fact. Its tests assert 17.20, so they need updating at the same time.
- **Review progress:** 74 of 589 checked (45 verified, 29 corrected, 0 need a person), 515 left.
- **Tests:** `npm test` passed 2311 of 2311.

सारांश: इस हफ्ते कोई गंभीर समस्या नहीं मिली। ओंटारियो की न्यूनतम मज़दूरी अब एक ही जगह दर्ज है ($17.95, 1 अक्टूबर 2026 से), और सभी टेस्ट पास हुए।
आपको कुछ करने की ज़रूरत नहीं है।

## 2026-11-01: schedule set up

- **Audit:** the KB audit corrected 72 records (docs/archive/KB_AUDIT_2026-11-01.md). 31 of them count toward the review queue, which leaves 558 approved records still to fact-check.
- **Daily run:** fact-checks 20 records every weekday (Monday to Friday) at 20:00.
- **Weekly run:** the health check runs every Sunday at 20:00.

सारांश: अपने-आप चलने वाला शेड्यूल लगा दिया गया है। 558 रिकॉर्ड की जाँच बाकी है, जो रोज़ 20 के हिसाब से लगभग 6 हफ्ते में पूरी होगी।
