# Knowledge-base maintenance log

The scheduled maintenance runs add entries here, newest first. Each entry records:
- what was checked;
- what was corrected, with the old text, the new text and the source;
- what needs a person.

Each entry ends with a short summary in Hindi for the owner.

How the schedule works: docs/KB_MAINTENANCE.md, section "Automatic schedule".

---

## 2026-11-07: daily fact-check

- **Checked:** 20 records. **Verified:** 4. **Corrected and applied:** 15. **Need a person:** 1 (its text was also rewritten, see below). No `src/kb-facts.js` fact was affected. Backup: `data/backups/settlement-before-kb-audit-2026-11-01-1794037274273.sqlite`.
- **Verified:** ontario-rta-section-5-shared-kitchen-exemption; pdsb-registration-brampton and pdsb-registration-mississauga (the page now also opens 2027-28 registration for children born in 2023); police-vulnerable-sector-check-vsc-kyc (record URL returns 404; the current page is https://www.tps.ca/services/police-record-checks/).
- **Corrected:**
  - nz-rbnz-retail-banking-kyc: RBNZ framing, "up to 90 days", credit-only accounts, required proof of address, no minimum balance → Department of Internal Affairs is supervisor since 1 July 2026; timing and steps vary by bank; address verification no longer required for standard due diligence since 27 November 2025; unconfirmed bank details removed; title and quote changed (https://www.rbnz.govt.nz/regulation-and-supervision/anti-money-laundering-and-countering-terrorism-financing, https://legislation.govt.nz/act/public/2025/74/en/2025-11-26B.pdf)
  - nz-tenancy-services-bond-centre-four-weeks-kyc: four-week cap on any bond, signed lodgement form, signatures for refunds → cap is for the general bond, separate pet bond up to 2 weeks; online lodgement and refund request; all tenants agree or disagree (https://www.tenancy.govt.nz/rent-bond-and-bills/bond/about-lodging-a-bond/)
  - ontario-foreign-driving-experience: 2+ years lets you skip waits and book the G test directly → since 1 July 2026 at most one year of credit, then G2 test, 12-month wait and G test; quote changed (https://www.ontario.ca/page/exchange-out-province-drivers-licence)
  - ontario-landlord-entry-privacy: "first and last month rent deposits", "mortgage appraisal" → rent deposit of at most one month or rent period, refundable key deposit allowed; "potential mortgagee or insurer" (https://www.ontario.ca/laws/statute/06r17)
  - ontario-ltb-n12-compensation: compensation always owed, LTB "can dismiss" if unpaid → no compensation for a section 48 notice of at least 120 days given since 21 September 2026; no eviction order until compensation is paid where owed, s.83(4) (https://www.ontario.ca/laws/statute/06r17)
  - ontario-rta-n12-compensation-timing-void: late payment makes the notice "fatally defective and void" with "automatic dismissal" → s.55.1 deadline, s.83(4) blocks the eviction order, same 120-day exception; the Act does not say late payment voids the notice (https://www.ontario.ca/laws/statute/06r17)
  - ontario-rental-heating-standards: heat "September 15 to June 1" province-wide, Brampton By-law 56-2008, Mississauga 21°C → vital service September 1 to June 15 at 20°C; Brampton Vital Services By-law, September 15 to June 1; Mississauga 20°C under By-law 0110-2018; T6 name fixed (https://www.ontario.ca/laws/regulation/060516, https://www.brampton.ca/EN/residents/By-Law-Enforcement/Pages/Vital-Services-Adequate-Heat.aspx, https://www.mississauga.ca/publication/adequate-temperature-by-law/)
  - ontario-rta-lease-assignment-30-day-exit: fixed-term only, "completely released", no charges → all tenancies; notice within 30 days after the request; rent payable to the termination date; reasonable out-of-pocket expenses allowed, s.95(7) (https://www.ontario.ca/laws/statute/06r17)
  - ontario-tenant-guarantor-and-key-deposit-kyc: "$25 to $50", "$300 to $500", OREA Form 400 and out-of-province guarantor claims → expected replacement cost under O. Reg. 516/06 s.17; guarantee allowed by O. Reg. 290/98 s.2, only with the same requirements for all tenants per the OHRC; unconfirmed claims removed (https://www.ontario.ca/laws/regulation/060516, https://www.ohrc.on.ca/en/human-rights-tenants-brochure)
  - ontario-tenant-kyc-screening-rights: SIN "completely optional", banking logins "illegal", refusal "constitutes indirect discrimination" → the Privacy Commissioner and OHRC wording (https://www.priv.gc.ca/en/privacy-topics/landlords-and-tenants/privacy-in-the-landlord-and-tenant-relationship/, https://www.ohrc.on.ca/en/policy-human-rights-and-rental-housing/v-identifying-discrimination-rental-housing)
  - serviceontario-provincial-photo-card-non-drivers: immigration and residency proof, "recognized across Canada" → original identity documents for name and date of birth; day-to-day use and travel within Canada only; any licence or photo ID must be surrendered (https://www.ontario.ca/page/ontario-photo-card)
  - uae-mohre-wps-gratuity-deduction-ban: Resolution 43 of 2022, visa/medical/Emirates ID list, "through WPS" regardless of how the job ended → Resolution 598 of 2022 repealed 43; recruitment and employment fees and costs; 14 days; 2-year cap; deductions for amounts owed (https://www.mohre.gov.ae/assets/download/c9a61f1a/Ministerial%20Resolution%20No.%20598%20of%202022%20Regarding%20the%20Wages%20Protection%20System%20and%20Its%20Amendment.pdf.aspx, https://u.ae/en/information-and-services/jobs/Sector-of-employment/employment-in-the-private-sector/end-of-service-benefits-for-employees-in-the-private-sector)
  - uae-rera-12-month-eviction-notary-notice: "exclusively", "registered courier mail", informal messages "void" → Notary Public or registered mail; informal messages do not meet the requirement (https://dlp.dubai.gov.ae/Legislation%20Reference/2009/Law%20No.%20(33)%20of%202008%20Amending%20Law%20No.%20(26)%20of%202007.html)
  - uk-action-fraud-newcomer-scam-shield: Action Fraud, OISC, "qualified solicitors" → Report Fraud (England, Wales, Northern Ireland; Scotland via 101), Immigration Advice Authority, approved professional body; absolute "never" sentence softened; title changed (https://www.reportfraud.police.uk/, https://www.gov.uk/find-an-immigration-adviser)
  - uk-credit-building-credit-bureaus-kyc: electoral roll for British, Irish and Commonwealth citizens → also some EU citizens, wider in Scotland and Wales (https://www.gov.uk/register-to-vote)
- **Needs a person:**
  - nz-inz-aewv-90-day-redundancy-cushion: no 90-day window or status protection appears on the INZ pages checked, so that claim, the s.157 claim and the unconfirmed quote were replaced with INZ's own wording (https://www.immigration.govt.nz/work/for-employers/getting-accreditation-or-approval-to-hire/employer-accreditation-for-the-aewv/meeting-your-aewv-accredited-employer-requirements/if-things-change-for-aewv-accredited-employers/). The Operational Manual itself was not read: a person should check WK3/WM5 for any fixed period. The record id still says 90-day and the record URL returns 404.
- **Limits of this check:**
  - **Toronto heat dates:** left out of ontario-rental-heating-standards. City reports show a proposed move to October 1 to May 15, but the by-law text (law1395.pdf) could not be read. Check Municipal Code Chapter 497.
  - **Read only through search extracts of official documents:** UAE Decree-Law 33/2021 Article 6 and Resolution 598/2022 (mohre.gov.ae and uaelegislation.gov.ae refused direct access), Dubai Law 33/2008 Article 25, Decree 43/2013, the Mississauga by-law, and MoneyHelper's credit report guidance (bot check not bypassed).
  - **Record URLs returning 404:** tribunalsontario.ca /ltb/maintenance-and-repairs/, /ltb/faqs/ and /ltb/notices-and-applications-forms/; the OHRC policy URL on ontario-tenant-kyc-screening-rights; the DriveTest experience-credits URL; the TPS URL. The correction script does not change URLs, so these remain.
- **Progress:** total 519, checked 357, remaining 162, verified 294, corrected 48, needs-human 15. `npm run kb:health`: no blocking problems.
- **Tests:** 2504 run, 2496 passed, 8 failed, all in the study permit tools (batch10, batch28, study finance and HTTP navigator tests). None comes from this run: `src/study-financial-policy.js` has its reviewed amounts valid only through `STUDY_FINANCE_REVIEWED_ON` = 2026-11-06, so from today the tools return `POLICY_REVIEW_REQUIRED` and null amounts. **This also affects the live study tools until someone re-checks the IRCC amounts and updates that date.** Not changed here, as it is outside this task.

आज 20 रिकॉर्ड जाँचे गए: 4 सही थे, 15 ठीक किए गए, और 1 (न्यूज़ीलैंड AEWV का 90-दिन वाला दावा) आपको या किसी व्यक्ति को देखना है।
स्टडी परमिट टूल की राशियों की समीक्षा तिथि 6 नवंबर को खत्म हो गई, इसलिए वे राशि नहीं दिखा रहे और 8 टेस्ट फेल हैं; IRCC की राशियाँ जाँचकर तिथि अपडेट करनी होगी।

## 2026-11-06: pending corrections applied

- **Applied:** the 14 corrections blocked in the daily fact-check below (commit 5175eba), marked `corrected`. All 14 were already withheld by the public evidence gate and stay withheld until editorial review, so served records did not change (513 before and after).
- **Unblocked by:** 11 older entries (the 10 listed below plus `canada-ircc-settlement-services-eligibility-and-2026-limits`) whose records were republished as source-verified on 5 and 6 November. They now skip the database through `SUPERSEDED_BY_SOURCE_CHECK` and still correct the seed files.
- **Backup:** `data/backups/settlement-before-kb-audit-2026-11-01.sqlite`.
- **Still open:** record URLs that return 404 in this batch, and the two records that could not be confirmed (below). `docs/KB_PENDING_CORRECTIONS_2026-11-06.md` is removed; its block is in `scripts/kb-corrections-2026-11-01.js`.

## 2026-11-06: daily fact-check

- **Checked:** 20 records. **Verified:** 4. **Corrected and applied:** 0. **Need a person:** 16 (14 with a confirmed correction waiting to be applied, 2 that could not be confirmed).
- **Blocked:** the 14 corrections are **not applied, so these records still show the old text**, including the wrong PGP and Ontario licence rules. `npm run kb:corrections` lists 10 older entries in `scripts/kb-corrections-2026-11-01.js` that no longer match records rewritten on 2026-11-05, and `kb:corrections:apply` refuses while any problem is listed. None of the 10 are from this batch. This run did not edit or remove those entries or bypass the check, because they are not this run's and another session is actively changing records.
  - **Stale entries to resolve:** de-aufenthg-blue-card-21-month-pr-fast-track, au-ato-dasp-super-withholding-rates, au-dha-subclass-500-student-485-graduate, au-dha-subclass-482-to-186-ens-pr-transition, au-dha-subclass-188-and-national-innovation-visa, nz-inz-accredited-employer-work-visa-aewv, nl-ind-highly-skilled-migrant-kennismigrant, us-uscis-l1-intracompany-transferee-and-eb1c, sg-mom-employment-pass-compass-framework, sg-mom-s-pass-quota-and-salary-tiers.
  - **Where the corrections are:** `docs/KB_PENDING_CORRECTIONS_2026-11-06.md`, with the steps to finish. They cannot wait in the script, because `test/kb-audit-2026-11-01.test.js` fails while seed records have unapplied corrections.
- **Verified:** ircc-dual-intent-temporary-residence (record URL returns 404; the current page is .../visitors/dual-intent-applicants.html), ircc-pr-residency-obligation-prtd, ircc-settlement-funds-pof (table unchanged since 7 July 2025), newzealand-nzta-licence (the NZTA page is blank to automated tools; the 25-country exempt list matched AA, NZTA's licensing agent, and the 12-month rule matched an NZTA search extract).
- **Confirmed corrections, not applied** (all marked needs-human until applied; no `src/kb-facts.js` fact was affected):
  - ircc-parent-sponsorship-pgp: "annual invitation-to-apply lottery system" → intake paused on 15 July 2026 until further notice, existing applications still processed (https://www.canada.ca/en/immigration-refugees-citizenship/news/notices/responsibly-manage-parent-grandparent-program.html)
  - mto-foreign-licence-driving-extract-credit: extract letter gives direct access to the Full G road test → since 1 July 2026 at most 12 months of credit, then G2 test and at least 12 months before the G test; title changed too (https://www.ontario.ca/page/exchange-out-province-drivers-licence)
  - ircc-super-visa: "Foreign pension or host country income of the parent cannot replace" the host's income → since 31 March 2026 either of two tax years can be used, and the applicant's income can be added once the host meets a minimum percentage; OSFI-authorized foreign insurers accepted (https://www.canada.ca/en/immigration-refugees-citizenship/news/notices/changes-parents-grandparents-super-visa-income-requirement-calculated.html)
  - ircc-family-class-exclusion-117-9-d: "can never be sponsored … irreversible" → excluded unless an officer decided no examination was needed (s.117(10)); the public policy for undeclared family members ended on 10 September 2026 (https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/family-sponsorship/spouse-partner-children/who-you-can-sponsor.html)
  - ircc-medical-excessive-demand: controlled diabetes and hypertension "do not result in medical inadmissibility" → no condition is cleared automatically; the exemption covers only the excessive demand ground (https://laws-lois.justice.gc.ca/eng/acts/I-2.5/section-38.html)
  - ircc-spousal-sponsorship: "3-year undertaking" for all → 3 years for a spouse or partner, 10 years or until age 25 for a child under 22; citizens abroad can also sponsor; open work permit "may be able" (https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/family-sponsorship/spouse-partner-children/eligibility.html)
  - ircc-dependent-child-sponsorship: IMM 5604 "signed with certified photo ID" → signed before a notary public with a copy of the photo ID (https://www.canada.ca/content/dam/ircc/documents/pdf/english/kits/forms/imm5604/01-02-2023/imm5604e.pdf)
  - ie-isd-csep-21-month-stamp-4-fast-track: "Support Letter" → apply directly to the Registration Office; letters stopped on 30 November 2023 (https://www.irishimmigration.ie/notice-regarding-stamp-4-support-letters-issued-by-the-dept-of-enterprise-trade-and-employment/)
  - ie-central-bank-retail-banking-kyc: "Fee-Free" account and required PPS number → free for at least the first year, PPS number only in some cases, each bank sets its documents; unconfirmed salary-deposit sentence removed (https://www.citizensinformation.ie/en/money-and-tax/personal-finance/banking/standard-bank-account/)
  - ie-citizens-information-national-school-kyc: entitlement "between ages 6 and 16" and required PPSN or catchment proof → 6 to 16 is the compulsory range; written application with a reply within 21 days; "immigration status" removed because no official source was found (https://www.citizensinformation.ie/en/returning-to-ireland/education-and-schooling/enrolling-your-child-in-a-primary-school-after-returning-to-ireland/)
  - ie-hse-public-healthcare-and-medical-cards-kyc: "nominal" co-payments and "completely free" care → EUR 100 emergency department charge without a GP referral; per-item prescription charge on a medical card (https://www.citizensinformation.ie/en/health/health-services/gp-and-hospital-services/hospital-charges/)
  - nz-immigration-skilled-migrant-smc-kyc: "Bachelor 3 pts", "median wage", "1 point per year" → three pathways, Bachelor 4 points (international), SMC wage threshold, 1 / 1.5 / 2 years for 1 / 2 / 3 points; title changed too (https://www.immigration.govt.nz/visas/skilled-migrant-category-resident-visa/)
  - fintrac-large-wire-transfer-kyc: "any transaction of CAD $10,000" → cash received or international EFT; "must maintain" → "should keep" (https://fintrac-canafe.canada.ca/individuals-individus/rpt-eng)
  - fintrac-overseas-parental-gift-deed: "Tax-free" and "notarized Deed of Gift" → generally not taxable, signed letter or deed with no required form; structuring cited as PCMLTFA s.77.3. The "generally not taxable" wording follows the existing cra gift correction; no CRA page was opened in this run (https://laws-lois.justice.gc.ca/eng/acts/P-24.501/FullText.html)
- **Could not be confirmed:**
  - fsra-auto-insurance-foreign-experience-letter: the $4,000-$6,500 surcharge, $2,000-$3,500 saving and 3-10 year credit have no official source. A search extract of FSRA guidance says insurers should use MTO-verified foreign experience by 1 January 2027, which conflicts with "zero years". FSRA pages returned 403 to scripts.
  - msp-documents: gov.bc.ca gave no response. Check the 18.5 age cut-off (extracts mention both 18.5 and 19) and whether in-person ServiceBC application still exists.
- **Note:** many record URLs in this batch return 404 (both FINTRAC, Central Bank, gov.ie, HSE, irishimmigration, three IRCC manual pages and the PGP page). The correction script edits only title, quote and summary, so the URLs were not changed.
- **Review progress:** `{"total":454,"checked":263,"remaining":191,"verified":202,"corrected":33,"needs-human":28}`
- **Tests:** `npm test`: 2436 passed, 15 failed, none in files this run changed. Failures include the checker, the regression sets, Engine answer() statutory integration, the national checklist, Vancouver transit and evidence database coverage floors. `src/engine.js`, `src/search.js` and other files have uncommitted changes from another session, which is the likely cause, but this was not confirmed. The count moved between runs while that session was working.

सारांश: आज 20 रिकॉर्ड जाँचे गए: 4 सही निकले, 14 में गलती पक्की मिली, लेकिन वे सुधार अभी लागू नहीं हुए, इसलिए इन रिकॉर्ड में अभी भी पुरानी जानकारी है (जैसे PGP का बंद होना और Ontario लाइसेंस का नया नियम), और 2 की पुष्टि नहीं हो सकी।
आपको या किसी जानकार को 10 पुरानी प्रविष्टियाँ ठीक करके docs/KB_PENDING_CORRECTIONS_2026-11-06.md के कदम पूरे करने होंगे; 15 टेस्ट भी फ़ेल हैं, जो इस काम की फ़ाइलों में नहीं हैं।

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


## 2026-11-08 — Medical-source pending remediation

Three withheld IRCC records corrected against live official pages and published using automated source_verified provenance with archived excerpts and approval audits. Broken URLs and stale/unsupported claims removed. Backup recorded in artifacts/medical-source-corrections-2026-11-07.json. Withheld records: 600 -> 597. Editorial-review queue: 519 -> 521 (honest automated provenance replacing two prior editorial labels). Full suite: 2,530 pass; lint pass; KB structural errors and seed drift zero. Next 20 source checks: 0 pass; per-record failures retained in artifacts/pending-source-checks-2026-11-08.json. No blanket approvals.

## 2026-11-08 — Health-source pending remediation

Three additional withheld records (Australia Medicare, Covered California, NZ GP enrolment) corrected against official pages and published through audited automated source verification. Unsupported eligibility/free-care claims removed; Australia seed synchronized. Plan runner supports validated custom plans and idempotent replay. Withheld: 597 -> 594; editorial queue: 521 -> 523. Fact-check progress: 361/523 (293 verified, 53 corrected, 15 need a person). Full suite: 2,530 passed; lint and diff checks passed; public-evidence replay for all three approved with no withholding reasons. 5,000-case synthetic corpus: 147 partial, 2 guidance, 619 clarification, 4,232 unavailable; zero runtime errors/parsed-scope violations, not an accuracy score. Scotland HTTP 403 and BC socket failures remain unresolved. Publication readiness remains NOT READY.

## 2026-11-08 — Europe health source corrections

Corrected Netherlands basic insurance and two Ireland GP/medical-card records using replacement official pages. Removed unsupported charges, registration deadlines and eligibility/insurance claims. Audited source_verified publications and public-evidence replay succeeded for all three; backup and candidate IDs are in artifacts/europe-health-source-corrections-2026-11-08.json. Matching Ireland seed updated; regression test prevents historical correction replay from restoring old claims. Withheld 594 -> 591; editorial queue 523 -> 525 (two old labels replaced with actual automated provenance). Progress 363/525: 293 verified, 55 corrected, 15 need a person, 162 remaining. Tests: 2,531 passed, lint passed; zero structural errors and seed drift. Independent editorial approval remains pending.

## 2026-11-08 — Healthcare access source corrections

Corrected Cook County CareLink, LA County financial assistance and Australia reciprocal healthcare records against replacement official sources. Removed unsupported prescription coverage, blanket Medi-Cal eligibility/zero-charge claims and student-insurance exceptions. Three audited source_verified publications replay successfully; backup and candidates recorded in artifacts/access-health-source-corrections-2026-11-08.json. Australia seed synchronized. Withheld 591 -> 588; editorial queue 525 -> 527. Progress: 365/527, 293 verified, 58 corrected, 14 need a person, 162 remaining. One previously needs-human fact-check resolved; no independent editorial approval assigned. Full suite: 2,531 pass; lint pass; zero structural issues and seed drift.
