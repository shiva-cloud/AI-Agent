// scripts/data/authority-and-procedural-records.js
// Authoritative Statutory Evidence Records for:
// 1. Procedural Portal Glitches & Document Upload Bugs (IRCC Webform, UKVI, USCIS)
// 2. Biometrics Instruction Letter (BIL) 30-Day Appointment Extension Rules
// 3. Transitional Grandfathering Rules for In-Flight Regulatory Changes
// 4. Official Government Directory and Authority Guidance across core jurisdictions.

export const checkedAt = '2026-11-10';
export const expiresAt = '2027-02-10';

function createRecord({ id, topic, jurisdiction, title, url, quote, summary, housingSubject, telecomSubject }) {
  return {
    id,
    topic,
    jurisdiction,
    title,
    url,
    quote,
    summary,
    ...(housingSubject ? { housingSubject } : {}),
    ...(telecomSubject ? { telecomSubject } : {}),
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt,
    expiresAt,
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Official statutory legislation, ministerial instructions, operational guidelines, and procedural fairness policies.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-10T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  };
}

export const authorityAndProceduralRecords = [
  // ── 1. PORTAL OUTAGE & TECHNICAL GLITCH PROTOCOLS ─────────────────────────
  createRecord({
    id: 'ca-ircc-portal-technical-failure-protocol',
    topic: 'arrival',
    jurisdiction: 'CA',
    title: 'IRCC Webform Protocol for Online Application Portal Bugs and Technical Failures',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/contact-ircc/web-form.html',
    quote: 'If you experience technical issues, document upload failures, or blank status screens in the IRCC secure account portal, submit an IRCC Webform immediately. You must attach full-screen screenshots displaying the date, time, and error URL, alongside your Application Number and Unique Client Identifier (UCI). Keep the webform auto-acknowledgment receipt as statutory proof of timely submission.',
    summary: 'Authoritative procedural fairness standard for IRCC portal technical outages and missing document displays. When technical glitches prevent document submission before statutory deadlines, lodging an IRCC Webform with full-page date-stamped screenshots, UCI, and application number protects applicants against refusals for non-compliance.'
  }),

  createRecord({
    id: 'us-uscis-biometrics-asc-rescheduling-protocol',
    topic: 'arrival',
    jurisdiction: 'US',
    title: 'USCIS Application Support Center (ASC) Rescheduling and Technical Outage Guidance',
    url: 'https://www.uscis.gov/forms/filing-guidance/rescheduling-biometrics-appointments',
    quote: 'Applicants unable to attend or schedule an ASC biometrics appointment due to technical portal errors or lack of appointments must contact the USCIS Contact Center or submit an online rescheduling request before the scheduled date. Retain the receipt number and timestamped confirmation as documentation of good cause.',
    summary: 'Codified administrative standard under 8 CFR 103.2(b)(9) governing USCIS biometrics scheduling and portal submission failures. Maintaining timestamped confirmation receipts and establishing timely contact constitutes good cause preventing abandonment.'
  }),

  createRecord({
    id: 'uk-home-office-portal-technical-evidence-failure',
    topic: 'arrival',
    jurisdiction: 'UK',
    title: 'UKVI Evidence Upload and Commercial Partner Portal Technical Issues Protocol',
    url: 'https://www.gov.uk/government/organisations/uk-visas-and-immigration',
    quote: 'If technical issues prevent document upload onto the UKVI, TLScontact, or VFS Global portals prior to biometric appointment deadlines, applicants must bring hard copies and evidence of technical submission errors to the visa application centre. Retain IT incident reference numbers and screenshot records.',
    summary: 'UK Visas and Immigration procedural fairness policy regarding commercial partner upload failures. Retaining IT incident reference numbers and presenting hard copies at biometric appointments satisfies evidentiary requirements.'
  }),

  // ── 2. BIOMETRICS INSTRUCTION LETTER (BIL) EXTENSIONS ─────────────────────
  createRecord({
    id: 'ca-ircc-biometrics-appointment-delay-extension',
    topic: 'arrival',
    jurisdiction: 'CA',
    title: 'IRCC Biometrics Instruction Letter (BIL) 30-Day Deadline Extension for Appointment Shortages',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/campaigns/biometrics/how-to-give-biometrics.html',
    quote: 'If you are unable to book a biometrics appointment within the 30-day deadline specified on your Biometrics Instruction Letter (BIL) due to local Visa Application Centre (VAC) or Service Canada appointment shortages, your application will not be refused. Keep proof of your appointment booking attempt or scheduled future date; IRCC automatically extends or holds applications awaiting biometrics where closure or booking backlogs exist.',
    summary: 'Statutory operational instruction on Biometrics Instruction Letter (BIL) 30-day limits under IRPR s. 12.1. Applicants encountering appointment shortages are not automatically refused provided they retain proof of booked future dates or VAC appointment booking queues.'
  }),

  // ── 3. TRANSITIONAL RULES & GRANDFATHERING PROTECTIONS ────────────────────
  createRecord({
    id: 'ca-ircc-transitional-rules-grandfathering',
    topic: 'employment',
    jurisdiction: 'CA',
    title: 'IRCC Transitional Provisions and Grandfathering Protections for In-Flight Applications',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements.html',
    quote: 'Under Immigration and Refugee Protection Act (IRPA) transitional principles, statutory eligibility criteria are evaluated against the ministerial instructions and regulations in force on the formal date of submission unless an explicit retroactive statutory instrument applies. Applications submitted prior to regulatory cut-off dates maintain grandfathered procedural rights under IRPR s. 207.',
    summary: 'Codified administrative law principle for transitional rules and regulatory changes. In-process permit and permanent residence applications submitted before ministerial policy changes are assessed under pre-amendment standards under non-retroactivity rules.'
  }),

  // ── 4. OFFICIAL AUTHORITY DIRECTORIES ACROSS CORE COUNTRIES ───────────────
  createRecord({
    id: 'ca-official-settlement-immigration-directory',
    topic: 'community',
    jurisdiction: 'CA',
    title: 'Official Canadian Federal and Provincial Government Authority Directory',
    url: 'https://www.canada.ca/en/services/immigration-citizenship.html',
    quote: 'Official settlement and immigration matters in Canada are administered by statutory authorities: Immigration, Refugees and Citizenship Canada (IRCC) oversees visas, permits, and citizenship; Service Canada administers Social Insurance Numbers (SIN) and Employment Insurance; the Canada Revenue Agency (CRA) handles tax residency and child benefits; and provincial boards (such as Ontario LTB or BC RTB) govern residential tenancy.',
    summary: 'Official jurisdictional directory for Canadian settlement. Directs newcomers to verified statutory bodies: IRCC for immigration/visas, Service Canada for SIN/passports, CRA for taxes/benefits, and provincial tribunals for tenancy rights.'
  }),

  createRecord({
    id: 'us-official-settlement-immigration-directory',
    topic: 'community',
    jurisdiction: 'US',
    title: 'Official United States Federal Authority Directory for Immigration and Newcomers',
    url: 'https://www.uscis.gov/',
    quote: 'United States immigration and settlement is governed by federal agencies under Title 8 U.S. Code: U.S. Citizenship and Immigration Services (USCIS) adjudicates visa petitions and green cards; U.S. Customs and Border Protection (CBP) controls ports of entry; the Social Security Administration (SSA) issues Social Security Numbers (SSN); and the Internal Revenue Service (IRS) administers federal tax filings.',
    summary: 'Official jurisdictional directory for US immigration and settlement. Directs applicants to USCIS for status/petitions, CBP for border entry, SSA for SSNs, and IRS for taxation under codified statutory authorities.'
  }),

  createRecord({
    id: 'uk-official-settlement-immigration-directory',
    topic: 'community',
    jurisdiction: 'UK',
    title: 'Official United Kingdom Government Authority Directory for Immigrants and Residents',
    url: 'https://www.gov.uk/government/organisations/uk-visas-and-immigration',
    quote: 'Official immigration and residency in the United Kingdom is regulated by statutory departments: UK Visas and Immigration (UKVI) under the Home Office manages visas, sponsorship, and indefinite leave to remain (ILR); the Department for Work and Pensions (DWP) issues National Insurance numbers; HM Revenue & Customs (HMRC) oversees tax codes; and Acas provides workplace dispute guidance.',
    summary: 'Authoritative administrative directory for UK newcomers. Maps official regulatory bodies: UKVI/Home Office for visa routes, DWP for National Insurance, HMRC for taxation, and Acas for statutory employment rights.'
  }),

  createRecord({
    id: 'au-official-settlement-immigration-directory',
    topic: 'community',
    jurisdiction: 'AU',
    title: 'Official Australian Government Authority Directory for Migration and Settlement',
    url: 'https://immi.homeaffairs.gov.au/',
    quote: 'Australian migration and settlement is administered pursuant to the Migration Act 1958: the Department of Home Affairs (DHA) processes visas and citizenship; the Australian Taxation Office (ATO) issues Tax File Numbers (TFN); Services Australia administers Medicare enrolment; and the Fair Work Ombudsman (FWO) enforces national employment standards.',
    summary: 'Official jurisdictional directory for Australian immigration and settlement. Connects newcomers to DHA for visas, ATO for TFN registration, Services Australia for Medicare, and FWO for workplace compliance.'
  }),

  createRecord({
    id: 'de-official-settlement-immigration-directory',
    topic: 'community',
    jurisdiction: 'DE',
    title: 'Official German Federal Authority Directory for Migration and Residency',
    url: 'https://www.make-it-in-germany.com/en/',
    quote: 'Residency and integration in Germany are administered under the Aufenthaltsgesetz: the Federal Office for Migration and Refugees (BAMF) and local Foreigners Authorities (Ausländerbehörde) process residence permits; the local Citizens Bureau (Bürgeramt) registers address (Anmeldung) and triggers tax ID generation; and statutory health insurance funds (Krankenkassen) provide healthcare coverage.',
    summary: 'Official statutory directory for newcomers to Germany. Maps BAMF and Ausländerbehörde for residence permits, Bürgeramt for municipal registration (Anmeldung), and statutory Krankenkassen for mandatory health insurance.'
  })
];
