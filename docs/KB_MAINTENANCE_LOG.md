# Knowledge-base maintenance log

The scheduled maintenance runs add entries here, newest first. Each entry records:
- what was checked;
- what was corrected, with the old text, the new text and the source;
- what needs a person.

Each entry ends with a short summary in Hindi for the owner.

How the schedule works: docs/KB_MAINTENANCE.md, section "Automatic schedule".

---

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
