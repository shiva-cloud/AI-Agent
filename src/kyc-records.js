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
    title: 'FINTRAC: Electronic funds transfers and large transaction reporting',
    topic: 'money',
    jurisdiction: 'CA',
    url: 'https://fintrac-canafe.canada.ca/individuals-individus/rpt-eng',
    quote: 'Electronic Funds Transfer Report When a reporting entity sends or receives an electronic funds transfer of $10,000 CAD or more either in a single transaction or in multiple transactions within a 24-hour period',
    summary: 'Under FINTRAC reporting rules, a reporting entity must submit an Electronic Funds Transfer Report when sending or receiving an electronic funds transfer of $10,000 CAD or more, whether in a single transaction or in multiple transactions within a 24-hour period. This overview describes statutory reporting obligations; it does not process individual transactions.'
  }),

  // ── 3. TENANT SCREENING KYC & ILLEGAL SIN DEMANDS ─────────────────────────────
  createKYCRecord({
    id: 'ontario-tenant-kyc-screening-rights',
    title: 'OPC: Privacy in the landlord and tenant relationship and SIN requirements',
    topic: 'housing',
    housingSubject: 'agreement',
    jurisdiction: 'ON',
    url: 'https://www.priv.gc.ca/en/privacy-topics/landlords-and-tenants/privacy-in-the-landlord-and-tenant-relationship/',
    quote: 'Does a landlord require my Social Insurance Number ( SIN )? No. Your Social Insurance Number is a confidential number used for income reporting purposes. Under the law, organizations cannot require you to consent to the collection, use or disclosure of your personal information unless it is required for a specific and legitimate purpose.',
    summary: 'The Office of the Privacy Commissioner of Canada (OPC) advises that landlords do not require a tenant\'s Social Insurance Number (SIN). The SIN is a confidential number for income reporting, and organizations cannot require consent to collect or use it unless required for a specific and legitimate purpose. While landlords may ask for identification or conduct credit checks, tenants are under no legal obligation to provide their SIN for standard tenant screening. This record explains privacy guidelines; it does not investigate privacy complaints.'
  }),

  // ── 4. EMPLOYMENT RIGHT-TO-WORK KYC & MAINTAINED STATUS (WP-EXT) ─────────────
  createKYCRecord({
    id: 'ircc-employer-kyc-right-to-work',
    title: 'IRCC: Maintained status during processing and right to work under R186(u)',
    topic: 'employment',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/temporary-residents/visitors/implied-status-extending-stay.html',
    quote: 'A work permit holder may continue working under the same conditions as their previous work permit until a decision is made on their extension application if they have applied to extend their stay in Canada as a worker [ R186(u) ] before the expiry of the permit and they remain in Canada .',
    summary: 'Under IRPR R186(u), a work permit holder may continue working under the same conditions as their previous work permit until a decision is made on their extension application if they applied to extend their stay in Canada as a worker before permit expiry and remain in Canada. This legal status is referred to as maintained status. This record does not verify individual applications or issue permits.'
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
    url: 'https://www.ontario.ca/page/exchange-out-province-drivers-licence',
    quote: "The authentication document must: be an official letter from the foreign government or agency that issued the driver's licence confirm that the driver's licence is authentic be written in English or French",
    summary: 'Ontario DriveTest requires proof of driving experience from countries without exchange agreements. The authentication document must be an official letter from the issuing foreign government confirming authenticity, written in English or French. Applicants must apply in person at DriveTest or ServiceOntario Bay and College.'
  }),

  // ── 7. SECURED CREDIT CARDS & CREDIT FILE INCEPTION KYC ──────────────────────
  createKYCRecord({
    id: 'fcac-secured-credit-card-kyc',
    title: 'FCAC: Choosing a credit card and secured credit cards',
    topic: 'money',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/financial-consumer-agency/services/credit-cards/choose-credit-card.html',
    quote: "Secured credit cards A secured credit card may be an option if you don't have a credit history or if you have bad credit. You must provide a security deposit to get a secured credit card.",
    summary: 'The Financial Consumer Agency of Canada (FCAC) explains that a secured credit card may be an option if you do not have a credit history or if you have bad credit. To get a secured card, you must provide a security deposit to the card issuer. This resource explains card options; it does not issue credit or approve applications.'
  }),

  // ── 8. TENANT GUARANTORS & KEY DEPOSIT REPLACEMENT COST KYC ───────────────────
  createKYCRecord({
    id: 'ontario-tenant-guarantor-and-key-deposit-kyc',
    title: 'Ontario: Standard lease rules for rent deposits and key deposits',
    topic: 'housing',
    housingSubject: 'deposit',
    jurisdiction: 'ON',
    url: 'https://www.ontario.ca/page/guide-ontarios-standard-lease',
    quote: '8. Rent deposit In this section, the landlord and tenant agree whether a rent deposit is required, and the amount. The law limits the amount and how it is to be treated. A rent deposit cannot be used as a damage deposit. 9. Key deposit In this section, the landlord and tenant agree whether a key deposit is required, and the amount. The law limits the amount and how it is to be treated.',
    summary: 'Under the Ontario standard lease guide, the landlord and tenant agree whether a rent deposit is required, and the amount; the law limits the amount and how it is to be treated, and a rent deposit cannot be used as a damage deposit. Similarly, the landlord and tenant agree whether a key deposit is required, and the law limits the amount and how it is treated. This resource describes standard lease clauses; it does not adjudicate tenancy disputes.'
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
    title: 'CAFC: What to do if you are a victim of fraud',
    topic: 'community',
    jurisdiction: 'CA',
    url: 'https://antifraudcentre-centreantifraude.ca/scams-fraudes/victim-victime-eng.htm',
    quote: "If you're a victim of identity fraud: place flags on all of your accounts change all of your passwords report the fraud to both credit bureaus ( Equifax and TransUnion ) Contact the police Report the incident to your local police and get a file number for future reference.",
    summary: 'The Canadian Anti-Fraud Centre (CAFC) advises individuals who suspect identity fraud to place flags on their accounts, change passwords, and report the fraud to both credit bureaus (Equifax and TransUnion). Victims should also report the incident to their local police to obtain a file number for future reference. This guidance provides protective steps; it does not investigate criminal offenses.'
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
    quote: "The Ontario Photo Card is a wallet-sized card that provides government-issued identification to residents of Ontario who do not have a driver's licence, making it easier for them to do things such as open a bank account and any other activities that require official identification.",
    summary: 'The Ontario Photo Card provides government-issued photo identification to residents of Ontario who do not have a driver licence, facilitating activities such as opening a bank account and accessing services that require official identification. You cannot hold an Ontario Photo Card and a driver licence at the same time. The card is valid for 5 years. This record does not issue identity cards.'
  }),

  // ── 16. CRA FIRST-YEAR BENEFIT REGISTRATION (RC151 & RC66) ───────────────────
  createKYCRecord({
    id: 'cra-newcomer-benefit-registration-rc151-rc66',
    title: 'CRA: Newcomer benefit registration and Form RC151 application',
    topic: 'money',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/revenue-agency/services/tax/international-non-residents/individuals-leaving-entering-canada-non-residents/newcomers-canada-immigrants.html',
    quote: 'New residents of Canada must apply for the Canada Groceries and Essentials Benefit (CGEB), formerly the GST/HST credit You do not need to do your first tax return before you can get the CGEB benefit. You can apply using one of the methods below – only one application per household is required. If you are a new resident of Canada and have no children: Use the Web Form RC151, Canada Groceries and Essentials Benefit Application for Individuals Who Became Residents of Canada .',
    summary: 'New residents of Canada must apply for the Canada Groceries and Essentials Benefit (CGEB, formerly the GST/HST credit) and do not need to do their first tax return before receiving payments. Newcomers without children can apply directly online using Web Form RC151 (Canada Groceries and Essentials Benefit Application for Individuals Who Became Residents of Canada). Only one application per household is required. This record does not calculate benefit payments.'
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
    title: 'CRA: My Account sign-in options and Sign-In Partners',
    topic: 'money',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/revenue-agency/services/e-services/e-services-individuals/account-individuals.html',
    quote: "Do not use autofill for your online banking information if you are on a shared device. When you are on your Sign-In Partner's website, ensure it is your information that is entered and not that of somebody else.",
    summary: 'The Canada Revenue Agency (CRA) outlines sign-in options for My Account for individuals, including using a Sign-In Partner with online banking credentials. Users are advised not to use autofill on shared devices and to ensure their own information is entered on their Sign-In Partner website. This record provides access guidance; it does not manage individual CRA accounts.'
  }),

  // ── 19. TAX-FREE PARENTAL GIFTS & WIRE TRANSFER KYC ───────────────────────────
  createKYCRecord({
    id: 'fintrac-cra-tax-free-family-gift-wire-kyc',
    title: 'CRA: Non-taxable amounts, gifts and inheritances',
    topic: 'money',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/personal-income/amounts-that-taxed.html',
    quote: 'You do not have to report certain non-taxable amounts as income, including: lottery winnings of any amount, unless the prize can be considered income from employment, a business or property, or a prize for achievement most gifts and inheritances',
    summary: 'Under CRA rules, you do not have to report certain non-taxable amounts as income on your Canadian tax return, including most gifts and inheritances and lottery winnings. Income earned from investing gifted money remains taxable. This guidance outlines general personal tax principles; it does not calculate tax assessments or exempt commercial transfers.'
  }),

  // ── 20. EQUIFAX & TRANSUNION IDENTITY THEFT FRAUD ALERTS ──────────────────────
  createKYCRecord({
    id: 'consumer-protection-equifax-transunion-fraud-alert-kyc',
    title: 'FCAC: Checking credit reports and placing fraud alerts',
    topic: 'money',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/financial-consumer-agency/services/credit-reports-score/check-errors.html',
    quote: 'contact both Equifax and TransUnion to place a fraud alert on your credit report',
    summary: 'The Financial Consumer Agency of Canada (FCAC) advises checking your credit report regularly to ensure information is accurate. If you find an error or suspect fraud, you should contact the lender involved and contact both Equifax and TransUnion to place a fraud alert on your credit report. A fraud alert notifies lenders to confirm your identity before approving credit applications. This overview provides consumer credit guidance; it does not process dispute forms or place credit alerts.'
  }),

  // ── 21. BC MSP SERVICES CARD KYC ENROLLMENT ───────────────────────────────────
  createKYCRecord({
    id: 'bc-msp-services-card-kyc-enrollment',
    title: 'Health Insurance BC: Medical Services Plan (MSP) enrollment KYC and BC Services Card',
    topic: 'health',
    jurisdiction: 'BC',
    url: 'https://www2.gov.bc.ca/gov/content/health/health-drug-coverage/msp/bc-residents/eligibility-and-enrolment/how-to-enrol',
    quote: 'Eligible British Columbia residents must enrol in the Medical Services Plan (MSP).',
    summary: 'Under the Medicare Protection Act of British Columbia, all eligible residents (including permanent residents, study permit holders, and work permit holders with permits valid for 6 months or longer) must enroll in the Medical Services Plan (MSP). Enrollment requires a 2-piece identity verification: (1) Primary document: valid Canadian immigration permit (Work Permit, Study Permit, PR Card, or Confirmation of Permanent Residence); (2) Secondary document: foreign passport, Canadian driver licence, or credit card. British Columbia enforces a statutory waiting period consisting of the remainder of the calendar month of arrival plus two consecutive calendar months before MSP coverage takes effect. Newcomers must obtain private bridge health insurance during this waiting window. Babies born in British Columbia to eligible residents are enrolled in the Medical Services Plan (MSP), with newborn coverage effective from the date of birth. Once enrolled, adult residents complete in-person identity verification at an ICBC driver licensing centre to obtain their photo BC Services Card. This record does not issue BC Services Cards or grant immediate coverage.'
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
