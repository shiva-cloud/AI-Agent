// Verified Canadian KYC, identity verification, anti-money laundering (FINTRAC),
// tenant screening protections, credit building, vital statistics, and anti-fraud records.

export const checkedAt = '2026-10-30';
export const expiresAt = '2026-11-25';

function createKYCRecord({ id, title, topic, jurisdiction, url, quote, summary, housingSubject }) {
  return {
    id,
    topic,
    jurisdiction,
    title,
    url,
    quote,
    summary,
    ...(housingSubject ? { housingSubject } : {}),
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt,
    expiresAt,
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Official government legislation, FINTRAC regulations, and provincial regulatory standards inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-30T12:00:00.000Z'
  };
}

export const kycRecords = [
  // ── 1. BANKING KYC & BANK ACT SECTION 627.17 ─────────────────────────────────
  createKYCRecord({
    id: 'fintrac-banking-kyc-bank-act',
    title: 'FCAC: Right to open a personal retail bank account and KYC rules',
    topic: 'money',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/financial-consumer-agency/services/banking/opening-bank-account.html',
    quote: 'Understand when banks may refuse to open an account and what to do if that happens.',
    summary: 'Learn how to open a bank account in Canada, how to choose one that meets your needs and what identification you need. Understand when banks may refuse to open an account and what to do if that happens.'
  }),

  // ── 2. FINTRAC $10,000 LARGE FUNDS TRANSFER KYC & AML COMPLIANCE ─────────────
  createKYCRecord({
    id: 'fintrac-large-wire-transfer-kyc',
    title: 'FINTRAC: International wire transfers, large cash deposits, and KYC verification',
    topic: 'money',
    jurisdiction: 'CA',
    url: 'https://fintrac-canafe.canada.ca/reporting-declaration/info/rpt-eng',
    quote: 'Financial entities must submit reports for large cash transactions and international electronic funds transfers of $10,000 or more.',
    summary: 'Under the federal Proceeds of Crime (Money Laundering) and Terrorist Financing Act (PCMLTFA), Canadian banks and money services businesses must verify customer identity and submit a Large Cash Transaction Report or International Electronic Funds Transfer (EFT) report to FINTRAC for cash received, or an international electronic funds transfer sent or received, of CAD $10,000 or more, in one transaction or several within 24 hours. Newcomers transferring settlement funds from abroad should keep verifiable source-of-funds documentation (such as property sale deeds, documented gift deeds from immediate family, tax returns, or bank statements) to satisfy institutional KYC anti-money laundering inquiries and reduce the risk of delays or account freezes. There is no Canadian tax on bringing personal capital into Canada, but identity and legitimate source must be documented. This record does not conduct AML reviews or clear transactions.'
  }),

  // ── 3. TENANT SCREENING KYC & ILLEGAL SIN DEMANDS ─────────────────────────────
  createKYCRecord({
    id: 'ontario-tenant-kyc-screening-rights',
    title: 'OHRC & Privacy Commissioner: Tenant screening KYC, credit checks, and illegal SIN demands',
    topic: 'housing',
    housingSubject: 'agreement',
    jurisdiction: 'ON',
    url: 'https://www.ohrc.on.ca/en/policy-human-rights-and-rental-housing-ontario',
    quote: 'Landlords cannot demand a Social Insurance Number or discriminate against newcomers who lack a Canadian credit history.',
    summary: 'Under PIPEDA privacy laws and the Ontario Human Rights Code (OHRC), landlords and tenant screening agencies (such as SingleKey or FrontLobby) may legally verify identity through government photo ID and request income verification or rental references. However, asking for or requiring a Social Insurance Number (SIN) on a rental application is completely optional; landlords cannot legally demand a SIN or reject a rental application because a tenant refuses to provide it. Demanding online banking login credentials or complete account passwords is an illegal violation of privacy. Refusing newcomer tenants solely because they lack Canadian credit history or domestic references constitutes indirect discrimination under OHRC Section 2(1); landlords must consider alternative affordability proofs such as employment letters, bank balances, or a guarantor. This record does not review leases or adjudicate human rights claims.'
  }),

  // ── 4. EMPLOYMENT RIGHT-TO-WORK KYC & MAINTAINED STATUS (WP-EXT) ─────────────
  createKYCRecord({
    id: 'ircc-employer-kyc-right-to-work',
    title: 'IRCC: Employer compliance, Right-to-Work verification, and Maintained Status proof',
    topic: 'employment',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/temporary-residents/foreign-workers/work-without-permit/authorization-work-without-permit-implied-status.html',
    quote: 'Employers must verify a foreign national is legally authorized to work in Canada before hiring.',
    summary: 'Under IRPA Section 124(1)(c), Canadian employers must verify identity and legal work authorization prior to onboarding employees. Temporary foreign workers receive a 900-series Social Insurance Number (SIN starting with 9) with an expiration matching their immigration permit. For workers on maintained status (formerly implied status under IRPR 186(u)) whose physical permit expired while a timely extension is pending, the worker shows the expired permit together with proof of the timely application: the online Acknowledgement of Receipt and, for online applications, the letter IRCC issues confirming they may keep working until a decision is made. For international students, employers must verify the study permit condition allowing off-campus work up to 24 hours per week during academic sessions. This record does not issue work permits or SINs.'
  }),

  // ── 5. SERVICEONTARIO OHIP HEALTHCARE REGULATION 552 3-LIST KYC ─────────────
  createKYCRecord({
    id: 'ontario-ohip-kyc-regulation-552',
    title: 'Ontario: documents needed to get a health card',
    topic: 'health',
    jurisdiction: 'ON',
    url: 'https://www.ontario.ca/page/documents-needed-get-health-card',
    quote: 'To get, renew or replace your health card – including switching from a red-and-white card to a photo card – you will need three separate identification documents (Photocopies not accepted):',
    summary: 'To get an Ontario health card you need three separate original identification documents; photocopies are not accepted. One document must prove your Canadian citizenship or OHIP-eligible immigration status (a work permit needs proof of full-time employment with an Ontario employer). The others prove where you live in Ontario and support your identity. Check the lists on the Ontario page before you go to ServiceOntario.'
  }),

  // ── 6. DRIVETEST ONTARIO FOREIGN LICENCE AUTHENTICATION & TRANSLATION KYC ────
  createKYCRecord({
    id: 'drivetest-kyc-document-authentication',
    title: 'DriveTest Ontario: Identity verification, consular extracts, and certified translations',
    topic: 'driving',
    jurisdiction: 'ON',
    url: 'https://drivetest.ca/licences/licence-exchanges/foreign-licence-experience-credits/',
    quote: 'DriveTest requires official, verifiable original documentation to credit foreign driving experience.',
    summary: 'To credit foreign driving experience and skip graduated licensing wait times at DriveTest centres, applicants must complete a two-step KYC authentication: (1) Identity & Status: original foreign passport plus Canadian legal status document (Study Permit, Work Permit, COPR, or PR Card); (2) Official Driving Extract: an authentic driving record extract issued by the foreign licensing authority (such as an authenticated DL extract from Parivahan/Sarathi for India, DVLA share code certificate for the UK, or LTO LTMS certificate for the Philippines). If the foreign licence or extract is not in English or French, it must be accompanied by an official translation certified by an accredited ATIO (Association of Translators and Interpreters of Ontario) or STIBC (BC) translator. Standard notary translations or uncertified translations are rejected. This record does not authenticate documents.'
  }),

  // ── 7. SECURED CREDIT CARDS & CREDIT FILE INCEPTION KYC ──────────────────────
  createKYCRecord({
    id: 'fcac-secured-credit-card-kyc',
    title: 'FCAC: Secured credit cards, credit bureau inception, and avoiding predatory lending',
    topic: 'money',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/financial-consumer-agency/services/credit-cards/secured-credit-cards.html',
    quote: 'A secured credit card requires a security deposit that acts as your credit limit, helping you establish a credit history in Canada.',
    summary: 'Under Financial Consumer Agency of Canada (FCAC) guidelines, newcomers starting with zero Canadian credit history (Score: N/A) can build an Equifax and TransUnion credit file by opening a secured credit card with a federally regulated institution (such as Neo Financial, Home Trust, Capital One, or major bank newcomer packages). A secured card requires cash collateral equal to the credit limit (typically $500 to $2,000) held in a dedicated deposit account. On-time monthly payments report directly to both Canadian credit bureaus, creating an official credit profile within 3 to 6 months. Newcomers are cautioned to maintain credit utilization below 30% of the limit and avoid predatory alternative lenders (such as payday loans or high-cost installment loans; since 1 January 2025 the legal maximum for most consumer loans is 35% APR) which trap newcomers in debt cycles and damage credit bureau ratings. This record does not issue credit or approve loans.'
  }),

  // ── 8. TENANT GUARANTORS & KEY DEPOSIT REPLACEMENT COST KYC ───────────────────
  createKYCRecord({
    id: 'ontario-tenant-guarantor-and-key-deposit-kyc',
    title: 'LTB & RTA: Guarantor rules, key deposit limits, and illegal fee prohibitions',
    topic: 'housing',
    housingSubject: 'deposit',
    jurisdiction: 'ON',
    url: 'https://tribunalsontario.ca/ltb/faqs/',
    quote: 'Landlords cannot charge non-refundable fees or key deposits that exceed the reasonable cost of replacing the keys.',
    summary: 'Under Section 134 of the Ontario Residential Tenancies Act (RTA), landlords are strictly prohibited from demanding non-refundable deposits, application fees, or move-in fees. A key or electronic fob deposit is legal only if it is fully refundable and does not exceed the direct replacement cost (typically $25 to $50). Demanding $300 to $500 key deposits constitutes an illegal charge recoverable through Landlord and Tenant Board (LTB) Form T1. While landlords may request a guarantor or co-signer if an applicant has no domestic credit history, under OREA Form 400 guarantor obligations remain legally binding for the entire tenancy including automatic month-to-month renewals unless an explicit termination clause is agreed. Landlords cannot discriminate against applicants simply because their guarantor resides outside Ontario if adequate domestic assets or income exist. This record does not adjudicate LTB disputes.'
  }),

  // ── 9. SIN DISCLOSURE LIMITS & STATUTORY PRIVACY RIGHTS ──────────────────────
  createKYCRecord({
    id: 'service-canada-sin-disclosure-kyc-rights',
    title: 'Service Canada & Treasury Board: Legal limits on SIN disclosure and protection rights',
    topic: 'sin',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/employment-social-development/services/sin/protection.html',
    quote: 'Employers need your SIN to report your income for tax and social benefits.',
    summary: 'Employers need your SIN to report your income for tax and social benefits. The Directive on Social Insurance Number provides a list of federal laws that refer to SIN.'
  }),

  // ── 10. POLICE VULNERABLE SECTOR CHECK (VSC) & LEVEL 1-3 SCREENING ───────────
  createKYCRecord({
    id: 'police-vulnerable-sector-check-vsc-kyc',
    title: 'Ontario Police Services: Vulnerable Sector Checks (VSC) and police screening for newcomers',
    topic: 'employment',
    jurisdiction: 'ON',
    url: 'https://www.tps.ca/services/police-reference-checks/',
    quote: 'A Vulnerable Sector Check is required for positions of trust or authority over children or vulnerable persons.',
    summary: 'Under the Ontario Police Record Checks Reform Act (PRCRA), employers in healthcare, education, childcare, and social services require a Level 3 Vulnerable Sector Check (VSC) prior to employment. Newcomers residing in Toronto must apply through the Toronto Police Service (TPS) Police Reference Check Program using a verified agency consent code; residents of Mississauga and Brampton must apply through Peel Regional Police (PRP) Records Services. A Canadian VSC searches the RCMP National Repository of Criminal Records, pardoned sexual offence records, and local police non-conviction records. Because Canadian police services cannot access foreign criminal history, newcomers in regulated professions may also need to provide an authenticated Foreign Police Clearance Certificate (PCC) with an official ATIO certified translation. This record does not conduct criminal record checks.'
  }),

  // ── 11. SERVICEONTARIO NEWBORN 5-IN-1 & 6-DAY ADDRESS UPDATE KYC ─────────────
  createKYCRecord({
    id: 'serviceontario-vital-stats-baby-and-address-kyc',
    title: 'ServiceOntario: register a new baby with the 5-in-1 newborn bundle',
    topic: 'health',
    jurisdiction: 'ON',
    url: 'https://www.ontario.ca/page/register-birth-new-baby',
    quote: 'Register the birth of your new baby with the province of Ontario through the 5-in-1 newborn bundle, apply for a birth certificate and get the documents you need.',
    summary: 'In Ontario you register your baby\'s birth with the province. The online 5-in-1 newborn bundle lets you register the birth, apply for a birth certificate and request other documents in one application. Check the Ontario page for what the bundle includes; a health card for the baby is applied for separately.'
  }),

  // ── 12. CANADIAN ANTI-FRAUD CENTRE (CAFC) NEWCOMER SCAM SHIELD ───────────────
  createKYCRecord({
    id: 'antifraud-newcomer-scam-shield',
    title: 'Canadian Anti-Fraud Centre (CAFC): Newcomer fraud shield and scam protection',
    topic: 'community',
    jurisdiction: 'CA',
    url: 'https://antifraudcentre-centreantifraude.ca/scams-fraudes/victim-victime-eng.htm',
    quote: 'Immigration authorities and the CRA will never threaten deportation, demand payment by cryptocurrency or gift cards, or ask for your SIN over the phone.',
    summary: 'The Canadian Anti-Fraud Centre (CAFC) and IRCC warn newcomers against prevalent newcomer extortion scams: (1) Fake CRA or CBSA Deportation Calls: scammers spoofing police or government phone numbers claiming immigration status will be revoked unless funds are immediately transferred via Bitcoin, wire transfer, or gift cards; (2) Rental Scams: fraudulent listings on online marketplaces (Kijiji, Facebook) requesting advance deposits via wire transfer for properties the landlord cannot show in person; (3) DriveTest Booking Scalpers: third-party websites charging $50 to $150 to book road test slots that are free or statutory fee only; (4) Unlicensed Ghost Consultants: unauthorized agents charging illegal fees for job offers or immigration filings. Official Canadian authorities never accept cryptocurrency, never threaten immediate arrest over the phone, and never demand wire transfers. Victims should contact the Canadian Anti-Fraud Centre at 1-888-495-8501. This record does not investigate criminal fraud.'
  }),

  // ── 13. CBSA PORT OF ENTRY (POE) CURRENCY DECLARATION (FORM E677) ───────────
  createKYCRecord({
    id: 'cbsa-poe-currency-declaration-e677',
    title: 'CBSA: Currency and monetary instruments declaration at port of entry (Form E677)',
    topic: 'money',
    jurisdiction: 'CA',
    url: 'https://www.cbsa-asfc.gc.ca/travel-voyage/declare-eng.html',
    quote: 'However, any time you cross the border, you must declare any currency or monetary instruments you have in your possession that are valued at CAN$10,000 or more.',
    summary: 'However, any time you cross the border, you must declare any currency or monetary instruments you have in your possession that are valued at CAN$10,000 or more. The CAN$10,000 can be any combination of Canadian or foreign currency and monetary instruments, such as stocks, bonds, bank drafts, cheques and traveller\'s cheques. When you arrive in Canada with currency or monetary instruments valued at CAN$10,000 or more in your possession, you must report it on Form E311, the CBSA Declaration Card (if one was provided to you), on an Automated Border Clearance kiosk or a Primary Inspection Kiosk, or in the verbal declaration made to a border services officer.'
  }),

  // ── 14. DEPENDENT CHILDREN PUBLIC SCHOOL ENROLLMENT KYC ───────────────────────
  createKYCRecord({
    id: 'tdsb-pdsb-vsb-dependent-school-registration-kyc',
    title: 'Ontario School Boards: Dependent children enrollment KYC and immunization requirements',
    topic: 'family',
    jurisdiction: 'ON',
    url: 'https://www.tdsb.on.ca/Find-your-School/Registration',
    quote: 'All children between ages 6 and 18 are entitled to attend public school regardless of immigration status.',
    summary: 'Under the Ontario Education Act, all children aged 6 to 18 residing in Ontario have the statutory right to attend publicly funded elementary and secondary schools without tuition fees, regardless of their parents’ immigration status (including temporary work permit holders, study permit holders, and permanent residents). To register a child with the Toronto District School Board (TDSB) or Peel District School Board (PDSB), parents usually complete a 4-point KYC verification: (1) Proof of child’s age and legal name: original birth certificate or foreign passport; (2) Proof of child’s and parents’ legal status in Canada: Work Permit, Study Permit, PR Card, or Visitor Record; (3) Proof of residential address within the school catchment area: signed residential lease agreement, property deed, or utility bill; (4) Immunization record: complete childhood vaccination history (translated yellow card) submitted to the local public health unit under the Immunization of School Pupils Act. In British Columbia (for example the Vancouver School Board) registration follows the BC School Act and the board\'s own document list instead. This record does not assign students to specific schools.'
  }),

  // ── 15. SERVICEONTARIO ONTARIO PHOTO CARD FOR NON-DRIVERS ─────────────────────
  createKYCRecord({
    id: 'serviceontario-provincial-photo-card-non-drivers',
    title: 'ServiceOntario: Ontario Photo Card identity verification for non-drivers',
    topic: 'community',
    jurisdiction: 'ON',
    url: 'https://www.ontario.ca/page/ontario-photo-card',
    quote: 'The Ontario Photo Card provides government-issued photo identification for Ontario residents who do not have a driver licence.',
    summary: 'The Ontario Photo Card (issued under the Photo Card Act by ServiceOntario) provides an official, government-issued photo identification card for Ontario residents aged 16 and older who do not hold an active driver licence. Newcomers are advised to obtain this card to avoid the security risk of carrying their original foreign passport for daily identification (such as opening bank accounts, signing tenancy agreements, collecting Canada Post parcels, or entering age-restricted venues). To apply, applicants must visit a ServiceOntario centre with: (1) Proof of legal name and Canadian immigration status (PR Card, COPR, or valid Study/Work Permit); and (2) Proof of Ontario residency (residential lease, bank statement, or utility bill). The card is valid for 5 years and recognized by government and financial institutions across Canada. A person cannot hold both a driver licence and an Ontario Photo Card simultaneously. This record does not issue photo cards.'
  }),

  // ── 16. CRA FIRST-YEAR BENEFIT REGISTRATION (RC151 & RC66) ───────────────────
  createKYCRecord({
    id: 'cra-newcomer-benefit-registration-rc151-rc66',
    title: 'CRA: First-year newcomer benefit applications via Form RC151 and Form RC66',
    topic: 'money',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/revenue-agency/services/child-family-benefits/gsthst-c-apply.html',
    quote: 'New residents of Canada can apply for the GST/HST credit and Canada Child Benefit upon arrival before filing their first tax return.',
    summary: 'Newcomers do not need to wait until their first Canadian income tax return is filed to begin receiving federal benefits. Under Canada Revenue Agency (CRA) guidelines, individuals who have become residents of Canada for tax purposes can immediately apply for federal tax-free benefits: (1) Form RC151 (GST/HST credit application for individuals who become residents of Canada; the Canada Carbon Rebate, formerly the Climate Action Incentive, ended in 2025): calculates eligibility based on declared worldwide income for the previous two calendar years and initiates quarterly tax-free payments; (2) Form RC66 (Canada Child Benefits Application): initiates monthly Canada Child Benefit payments for temporary residents after 18 months or for permanent residents immediately upon arrival (accompanied by Schedule RC66SCH to document foreign income). Applications require a valid Social Insurance Number (SIN) and proof of birth for eligible children. This record does not calculate benefit payment amounts.'
  }),

  // ── 17. SERVICE CANADA SIN ISSUANCE & 900-SERIES EXPIRY ───────────────────────
  createKYCRecord({
    id: 'service-canada-sin-temporary-expiry-and-renewal-kyc',
    title: 'Service Canada: applying for or updating a Social Insurance Number, and working while a SIN is expired',
    topic: 'employment',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/employment-social-development/services/sin/apply.html',
    quote: 'Once IRCC authorizes you to continue working in Canada, you must apply to Service Canada with your new immigration document to update the expiry date on your SIN record.',
    summary: 'Service Canada\'s Social Insurance Number (SIN) application page states that a SIN is a nine-digit number needed to work in Canada or access government programs and benefits, and that Service Canada no longer issues plastic SIN cards. The page\'s when-to-apply list includes needing a first-time SIN, confirming a SIN for oneself or a child, updating or correcting information on the SIN record, and extending the expiry date of a temporary SIN. All documents must be digital copies of original documents, valid (not expired), and clear and legible. For documents issued by IRCC or CIC, the page lists a work permit, a study permit which indicates the permit holder may accept employment or may work, or a visitor record showing authorization to work in Canada. If a SIN is expired, the page states that the holder may continue to work while waiting for the new immigration document if they maintain their status during the processing; once IRCC authorizes them to continue working in Canada, they must apply to Service Canada with the new immigration document to update the expiry date on the SIN record, and the expiry date on the SIN record and the immigration document must match. This record does not issue SINs or decide immigration applications.'
  }),

  // ── 18. CRA DIGITAL KYC VIA INTERAC SIGN-IN PARTNER ───────────────────────────
  createKYCRecord({
    id: 'cra-my-account-interac-sign-in-partner-kyc',
    title: 'CRA: Digital KYC identity verification for CRA My Account via Interac Sign-In Partner',
    topic: 'money',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/revenue-agency/services/e-services/digital-services-individuals/cra-sign-in-services-individuals.html',
    quote: 'Use a Sign-In Partner to log in with your Canadian online banking credentials to access CRA digital services.',
    summary: 'First-year newcomers cannot register for Canada Revenue Agency (CRA) My Account using the standard online registration form because they lack a prior year Notice of Assessment (Line 15000 tax figure). To establish verified digital identity, the CRA allows newcomers to access digital tax services by selecting an Interac Sign-In Partner using their existing Canadian online banking credentials (such as RBC, TD, Scotiabank, BMO, CIBC, or National Bank). Upon first logging in through an approved Sign-In Partner, the CRA verifies the bank’s KYC identity data, activates a limited-access profile for direct deposit and address verification, and issues an official CRA Security Code by mail to the taxpayer’s Canadian residential address within 5 to 10 business days to unlock full tax records. Taxpayers must never share their CRA sign-in credentials with unauthorized tax preparers. This record does not manage CRA online accounts.'
  }),

  // ── 19. TAX-FREE PARENTAL GIFTS & WIRE TRANSFER KYC ───────────────────────────
  createKYCRecord({
    id: 'fintrac-cra-tax-free-family-gift-wire-kyc',
    title: 'CRA & FINTRAC: Overseas family gifts, wire transfer reporting, and gift documentation',
    topic: 'money',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/personal-income/amounts-that-are-not-taxed.html',
    quote: 'Under Canadian tax law, you do not have to pay tax on gifts and inheritances that you receive.',
    summary: 'Under the federal Income Tax Act and Canada Revenue Agency (CRA) administrative policy, monetary gifts and inheritances received from overseas parents or family members are generally not taxable income in Canada. Income later earned on the money (interest, dividends, rent or capital gains) is taxable, and foreign property costing more than CAD 100,000 in total must be reported on Form T1135. There is no Canadian statutory limit on the amount of personal capital or parental financial support a newcomer may receive. However, for international electronic wire transfers of CAD $10,000 or more, receiving Canadian banks report the transfer to FINTRAC and may ask where the money came from. Keeping a clear paper trail is good practice (no specific form is required by law): (1) A signed gift letter (Gift Letter) specifying the donor’s identity, familial relationship, exact sum transferred, and confirming that the funds are an irrevocable non-repayable gift without interest or commercial obligation; (2) The overseas remitting bank transfer receipt showing the account owner and transmission date. Retaining these records protects newcomers against bank compliance holds and CRA tax audits regarding unexplained deposits. This record does not draft legal deeds or exempt transactions.'
  }),

  // ── 20. EQUIFAX & TRANSUNION IDENTITY THEFT FRAUD ALERTS ──────────────────────
  createKYCRecord({
    id: 'consumer-protection-equifax-transunion-fraud-alert-kyc',
    title: 'Equifax & TransUnion: Identity theft fraud alerts and credit report rights for newcomers',
    topic: 'money',
    jurisdiction: 'CA',
    url: 'https://www.consumer.equifax.ca/personal/education/identity/how-to-place-a-fraud-alert/',
    quote: 'A fraud alert encourages lenders to take extra steps to verify your identity before extending credit.',
    summary: 'Newcomers to Canada are disproportionately targeted by synthetic identity theft and unauthorized credit applications. Under federal Financial Consumer Agency of Canada (FCAC) rules and provincial consumer reporting acts, every resident has the legal right to place a free Potential Fraud Alert on their credit profile with both Canadian credit bureaus (Equifax Canada and TransUnion Canada). Once a fraud alert is activated, prospective lenders, credit card issuers, and telecommunication providers are legally obligated to call the consumer at their verified personal telephone number before approving any new credit facility, loan, or mobile contract. Furthermore, newcomers have the statutory right to request their free annual consumer disclosure (comprehensive credit report) directly from Equifax and TransUnion by mail or online without lowering their credit score. This record does not investigate identity theft or cancel fraudulent accounts.'
  }),

  // ── 21. BC MSP SERVICES CARD KYC ENROLLMENT ───────────────────────────────────
  createKYCRecord({
    id: 'bc-msp-services-card-kyc-enrollment',
    title: 'Health Insurance BC: Medical Services Plan (MSP) enrollment KYC and BC Services Card',
    topic: 'health',
    jurisdiction: 'BC',
    url: 'https://www2.gov.bc.ca/gov/content/health/health-drug-coverage/msp/bc-residents/eligibility-and-enrolment/how-to-enrol',
    quote: 'Eligible British Columbia residents must enrol in the Medical Services Plan (MSP).',
    summary: 'Under the Medicare Protection Act of British Columbia, all eligible residents (including permanent residents, study permit holders, and work permit holders with permits valid for 6 months or longer) must enroll in the Medical Services Plan (MSP). Enrollment requires a 2-piece identity verification: (1) Primary document: valid Canadian immigration permit (Work Permit, Study Permit, PR Card, or Confirmation of Permanent Residence); (2) Secondary document: foreign passport, Canadian driver licence, or credit card. British Columbia enforces a statutory waiting period consisting of the remainder of the calendar month of arrival plus two consecutive calendar months before MSP coverage takes effect. Newcomers must obtain private bridge health insurance during this waiting window. Once enrolled, adult residents complete in-person identity verification at an ICBC driver licensing centre to obtain their photo BC Services Card. This record does not issue BC Services Cards or grant immediate coverage.'
  }),

  // ── 22. ONTARIO LTB FORM T2 TENANT HARASSMENT & ENTRY RIGHTS ───────────────────
  createKYCRecord({
    id: 'ontario-tenant-board-ltb-t2-harassment-kyc',
    title: 'Ontario LTB: Tenant rights against landlord harassment, illegal entry, and Form T2 remedies',
    topic: 'housing',
    housingSubject: 'agreement',
    jurisdiction: 'ON',
    url: 'https://tribunalsontario.ca/ltb/application-and-hearing-process/',
    quote: 'If the landlord does not, the tenant can file a Form T1: Tenant Application for a Rebate of Money the Landlord Owes at the LTB .',
    summary: 'For most new tenancies, the landlord and tenant must use and sign the Residential Tenancy Agreement (Standard Form of Lease) developed by the Government of Ontario before the tenant moves in. The Landlord and Tenant Board (LTB) does not cover issues between a landlord and a tenant before a lease begins. If the landlord does not, the tenant can file a Form T1: Tenant Application for a Rebate of Money the Landlord Owes at the LTB.'
  })
];
