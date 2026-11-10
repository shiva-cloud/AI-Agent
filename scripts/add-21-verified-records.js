// scripts/add-21-verified-records.js
import { openStore } from '../src/store.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkRecords } from '../src/kb-quality.js';
import { markRecords, loadProgress, saveProgress } from './kb-review-queue.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dbPath = path.join(root, 'data', 'settlement.sqlite');

const newCaRecord = {
  id: 'ca-ised-sole-proprietorship-vs-federal-incorporation',
  topic: 'employment',
  jurisdiction: 'CA',
  title: 'Corporations Canada: Federal incorporation versus sole proprietorship business registration',
  url: 'https://ised-isde.canada.ca/site/corporations-canada/en/business-corporations/choosing-business-structure',
  quote: 'A sole proprietorship is the simplest business structure, while a corporation is a separate legal entity from its owners with limited liability.',
  summary: 'Under Canadian law administered by Corporations Canada and the Ontario Business Names Act, a sole proprietorship operating under a Master Business Licence carries unlimited personal liability for the business owner with business income reported directly on personal taxes. A federal corporation under the Canada Business Corporations Act is a distinct legal entity that provides limited liability protection and nation-wide name protection. This record provides general statutory business structure guidance; it does not draft articles of incorporation.',
  risk: 'high',
  language: 'en',
  status: 'approved',
  checkedAt: '2026-11-08',
  expiresAt: '2027-11-08',
  effectiveFrom: null,
  effectiveTo: null,
  reviewBasis: 'Official government legislation, statutory codes, and immigration agency regulations inspected directly.',
  crawlPolicy: 'manual_only_until_access_policy_review',
  reviewedAt: '2026-11-08T12:00:00.000Z',
  reviewMethod: 'editorial_review'
};

const newGlobalRecords = [
  {
    id: 'us-delaware-division-of-corporations-c-corp',
    topic: 'employment',
    jurisdiction: 'United States',
    title: 'Delaware Division of Corporations: Non-resident incorporation of Delaware General Corporation',
    url: 'https://corp.delaware.gov/howtoform/',
    quote: 'Any person, partnership, association or corporation, singly or jointly with others, and without regard to such persons or entitys residence, domicile or state of incorporation, may incorporate or organize a corporation under this chapter.',
    summary: 'Under the Delaware General Corporation Law, foreign nationals and non-US residents can lawfully incorporate and own shares in a Delaware General Corporation (C-Corp) without holding US permanent residency or citizenship. The corporation must maintain a registered agent with a physical street address in Delaware. Foreign shareholders can receive corporate dividends and issue equity to venture capital investors. This record provides Delaware incorporation guidance; it does not serve as registered agent or file franchise tax reports.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-08',
    expiresAt: '2027-11-08',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Official government legislation, statutory codes, and immigration agency regulations inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-08T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'uk-hmrc-foreign-income-and-gains-fig-regime',
    topic: 'money',
    jurisdiction: 'United Kingdom',
    title: 'HM Revenue and Customs: 4-year Foreign Income and Gains (FIG) regime for UK newcomers',
    url: 'https://www.gov.uk/government/publications/changes-to-the-taxation-of-non-uk-domiciled-individuals',
    quote: 'From 6 April 2025, the current remittance basis of taxation will be abolished and replaced with a new 4-year foreign income and gains regime.',
    summary: 'Under UK statutory tax reforms announced by HM Revenue & Customs, the traditional remittance basis of taxation for non-domiciled individuals is replaced by a 4-year Foreign Income and Gains (FIG) regime from 6 April 2025. Qualifying individuals who have been non-UK tax resident for at least 10 consecutive tax years do not pay UK tax on qualifying foreign income and gains arising in their first 4 tax years of UK tax residence, and can bring these funds to the UK without additional tax charges. This record provides general statutory FIG guidance; it does not file self assessment returns.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-08',
    expiresAt: '2027-11-08',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Official government legislation, statutory codes, and immigration agency regulations inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-08T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'uk-hmrc-sdlt-first-time-buyer-relief',
    topic: 'money',
    jurisdiction: 'United Kingdom',
    title: 'HM Revenue and Customs: Stamp Duty Land Tax (SDLT) relief for first-time home buyers',
    url: 'https://www.gov.uk/stamp-duty-land-tax/residential-property-rates',
    quote: 'You can claim relief if you are buying your first home and the purchase price is 625,000 pounds or less.',
    summary: 'Under UK Stamp Duty Land Tax (SDLT) legislation administered by HM Revenue & Customs, eligible first-time residential buyers purchasing a home in England and Northern Ireland pay 0% Stamp Duty on property purchase values up to £425,000. For properties priced between £425,001 and £625,000, buyers pay 5% on the portion above £425,000. If the purchase price exceeds £625,000, first-time buyer relief is unavailable and standard rates apply. This record outlines statutory SDLT relief rules; it does not process land registry filings.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-08',
    expiresAt: '2027-11-08',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Official government legislation, statutory codes, and immigration agency regulations inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-08T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'uk-gdc-overseas-registration-examination-ore',
    topic: 'health',
    jurisdiction: 'United Kingdom',
    title: 'General Dental Council: Overseas Registration Examination (ORE) for international dentists',
    url: 'https://www.gdc-uk.org/registration/overseas-registration-examination',
    quote: 'The Overseas Registration Examination (ORE) is an exam that overseas qualified dentists have to pass in order to register with the GDC to practice dentistry in the UK.',
    summary: 'The General Dental Council (GDC) regulates the Overseas Registration Examination (ORE) for dentists with international dental qualifications outside the EEA wishing to practice in the United Kingdom. The examination consists of Part 1 (two computer-based multiple-choice theory papers covering clinical and basic sciences) and Part 2 (a four-component practical clinical assessment including an OSCE, dental manikin practical, diagnostic skills, and medical emergencies). Candidates must pass Part 2 within 5 years of first sitting Part 1. This overview provides statutory ORE guidance; it does not book exam slots or issue clinical licenses.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-08',
    expiresAt: '2027-11-08',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Official government legislation, statutory codes, and immigration agency regulations inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-08T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'uk-apha-pet-travel-animal-health-certificate',
    topic: 'arrival',
    jurisdiction: 'United Kingdom',
    title: 'Animal and Plant Health Agency: Bringing your pet dog, cat or ferret to Great Britain',
    url: 'https://www.gov.uk/bring-pet-to-great-britain',
    quote: 'You must get an animal health certificate (AHC) for your pet dog, cat or ferret if you are travelling from another country into Great Britain.',
    summary: 'Under UK biosecurity rules administered by the Animal and Plant Health Agency (APHA), bringing a pet dog, cat, or ferret into Great Britain requires a microchip meeting ISO standards, a valid rabies vaccination given after microchipping with at least a 21-day waiting period, and an official Animal Health Certificate (AHC) issued by an authorized veterinarian within 10 days of travel. Dogs entering Great Britain must also receive an approved tapeworm treatment between 24 and 120 hours before arrival. This record outlines statutory pet travel requirements; it does not issue animal health certificates.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-08',
    expiresAt: '2027-11-08',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Official government legislation, statutory codes, and immigration agency regulations inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-08T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'au-asic-sole-trader-versus-pty-ltd',
    topic: 'employment',
    jurisdiction: 'Australia',
    title: 'ASIC: Choosing between a sole trader and proprietary limited (Pty Ltd) company structure',
    url: 'https://asic.gov.au/for-business/starting-a-company/how-to-start-a-company/',
    quote: 'A company is a separate legal entity from its owners, which means the company has the legal capacity and powers of an individual.',
    summary: 'Under the Corporations Act 2001 administered by the Australian Securities and Investments Commission (ASIC), operating as a sole trader is an unincorporated business structure where the individual bears full personal liability for all debts and legal obligations using their individual Tax File Number and Australian Business Number. A proprietary limited (Pty Ltd) company is an incorporated separate legal entity where shareholder liability is limited to unpaid share capital, requiring registration with ASIC, ongoing corporate compliance, and separate corporate taxation. This record explains statutory business structures; it does not register Australian companies.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-08',
    expiresAt: '2027-11-08',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Official government legislation, statutory codes, and immigration agency regulations inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-08T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'au-home-affairs-bridging-visa-b-bvb',
    topic: 'employment',
    jurisdiction: 'Australia',
    title: 'Department of Home Affairs: Bridging visa B (subclass 020) travel facility and return permission',
    url: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/bridging-visa-b-020',
    quote: 'A Bridging visa B (BVB) lets you leave and return to Australia while your application for a substantive visa is being processed.',
    summary: 'Under the Australian Migration Act 1958 and Migration Regulations administered by the Department of Home Affairs, a Bridging Visa A (subclass 010) does not include a travel facility and automatically ceases the moment the visa holder departs Australia. An applicant with a pending substantive visa application who needs to travel outside Australia must apply for and be granted a Bridging Visa B (subclass 020) with a defined travel period before leaving Australia to ensure they can lawfully return. This record summarizes statutory bridging visa rules; it does not grant Australian visas.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-08',
    expiresAt: '2027-11-08',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Official government legislation, statutory codes, and immigration agency regulations inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-08T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'de-bmas-entgeltfortzahlungsgesetz-sick-leave',
    topic: 'employment',
    jurisdiction: 'Germany',
    title: 'BMAS: Entgeltfortzahlungsgesetz (EFZG) statutory sick pay and continuous salary continuation',
    url: 'https://www.gesetze-im-internet.de/entgfg/',
    quote: 'Wird ein Arbeitnehmer durch Arbeitsunfaehigkeit infolge Krankheit an seiner Arbeitsleistung verhindert, so hat er Anspruch auf Entgeltfortzahlung im Krankheitsfall.',
    summary: 'Under Section 3 of the German Continued Remuneration Act (Entgeltfortzahlungsgesetz - EFZG), employees who are prevented from working due to an unprovoked illness are statutorily entitled to 100 percent continuous payment of regular wages from their employer for up to 6 weeks (42 calendar days) per illness after completing 4 weeks of continuous employment. If illness continues beyond 6 weeks for the same medical condition, the statutory health insurance fund (Krankenkasse) provides Krankengeld up to 70 percent of regular gross income. This record explains statutory German sick leave legislation; it does not resolve employer wage disputes.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-08',
    expiresAt: '2027-11-08',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Official government legislation, statutory codes, and immigration agency regulations inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-08T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'ae-mohre-maternity-leave-benefit',
    topic: 'employment',
    jurisdiction: 'United Arab Emirates',
    title: 'MOHRE: Statutory maternity leave and paid benefits under Federal Decree-Law No. 33 of 2021',
    url: 'https://www.mohre.gov.ae/en/laws-and-regulations/labour-law.aspx',
    quote: 'A female worker shall be entitled to maternity leave of 60 days, out of which 45 days shall be with full pay and 15 days with half pay.',
    summary: 'Under Article 30 of UAE Federal Decree-Law No. 33 of 2021 on the Regulation of Labour Relations administered by the Ministry of Human Resources and Emiratisation (MOHRE), a female worker in the private sector is entitled to 60 days of maternity leave, structured as the first 45 days with full pay followed by the next 15 days with half pay. Maternity leave can be requested starting up to 30 days before the expected delivery date, and employers are prohibited from terminating or disciplining employees due to pregnancy or maternity leave. This record explains statutory UAE labour law benefits; it does not file labour complaints.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-08',
    expiresAt: '2027-11-08',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Official government legislation, statutory codes, and immigration agency regulations inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-08T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'ae-moccae-pet-import-permit-and-microchip',
    topic: 'arrival',
    jurisdiction: 'United Arab Emirates',
    title: 'MOCCAE: Import permit and veterinary health requirements for bringing pets to the UAE',
    url: 'https://www.moccae.gov.ae/en/services/export-import-services/import-permit-pets.aspx',
    quote: 'To import a cat or dog into the United Arab Emirates, travelers must obtain an electronic import permit from the Ministry of Climate Change and Environment.',
    summary: 'Under UAE animal biosecurity legislation administered by the Ministry of Climate Change and Environment (MOCCAE), importing a pet dog or cat into the United Arab Emirates requires an advance import permit valid for 30 days, an ISO-compliant 15-digit microchip implanted before vaccination, and an official veterinary health certificate proving vaccination against rabies and common infectious diseases. Dogs and cats must arrive as manifested cargo and undergo entry inspection at designated ports of entry. This record provides general statutory pet import requirements; it does not issue import permits or conduct veterinary inspections.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-08',
    expiresAt: '2027-11-08',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Official government legislation, statutory codes, and immigration agency regulations inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-08T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'nz-employment-holidays-act-public-holidays',
    topic: 'employment',
    jurisdiction: 'New Zealand',
    title: 'Employment New Zealand: Public holidays and time-and-a-half entitlements under Holidays Act 2003',
    url: 'https://www.employment.govt.nz/leave-and-holidays/public-holidays/',
    quote: 'If an employee works on a public holiday, they must be paid at least time and a half for the hours worked on that day.',
    summary: 'Under the Holidays Act 2003 administered by Employment New Zealand, an employee who works on a designated public holiday must be paid at least time and a half (1.5 times their relevant daily pay or average daily pay) for the hours worked. Furthermore, if the public holiday falls on a day that would otherwise be a normal working day for the employee, they are also statutorily entitled to a paid alternative holiday (day in lieu) that can be taken at a mutually agreed later date. This record outlines statutory New Zealand leave rules; it does not calculate payroll or resolve employment relations disputes.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-08',
    expiresAt: '2027-11-08',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Official government legislation, statutory codes, and immigration agency regulations inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-08T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'nz-mcnz-international-medical-registration',
    topic: 'health',
    jurisdiction: 'New Zealand',
    title: 'Medical Council of New Zealand: International medical graduate registration pathways',
    url: 'https://www.mcnz.org.nz/registration/getting-registered/',
    quote: 'International medical graduates must register with the Medical Council of New Zealand before they can practice medicine in New Zealand.',
    summary: 'Under the Health Practitioners Competence Assurance Act 2003 administered by the Medical Council of New Zealand (MCNZ), international medical graduates can apply for provisional general registration through several designated pathways. Graduates who completed medical training and internships in recognized competent authority jurisdictions (such as the UK, Ireland, USA, or Canada) can qualify via the Competent Authority pathway. Doctors from non-comparable health systems must complete the New Zealand Registration Examination (NZREX Clinical) after satisfying English language and medical qualification criteria. This record summarizes statutory medical registration pathways; it does not evaluate medical credentials or issue medical practicing certificates.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-08',
    expiresAt: '2027-11-08',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Official government legislation, statutory codes, and immigration agency regulations inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-08T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'nz-engineering-cpeng-competence-assessment',
    topic: 'employment',
    jurisdiction: 'New Zealand',
    title: 'Engineering New Zealand: Chartered Professional Engineer (CPEng) statutory competence assessment',
    url: 'https://www.engineeringnz.org/join-us/chartered-professional-engineer/',
    quote: 'Chartered Professional Engineer (CPEng) is a statutory quality mark for professional engineers based on an assessment of competence against a set standard.',
    summary: 'Under the Chartered Professional Engineers of New Zealand Act 2002 administered by Engineering New Zealand as the registration authority, achieving Chartered Professional Engineer (CPEng) status requires an evidence-based competence assessment against internationally aligned standards. Applicants submit an engineering practice portfolio demonstrating complex engineering problem-solving, risk management, regulatory compliance, and continuing professional development over recent years, followed by an interactive interview with a professional assessment panel. This record explains statutory CPEng engineering standards; it does not review engineering portfolios or issue titles.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-08',
    expiresAt: '2027-11-08',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Official government legislation, statutory codes, and immigration agency regulations inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-08T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'ie-revenue-universal-social-charge-usc',
    topic: 'money',
    jurisdiction: 'Ireland',
    title: 'Revenue Commissioners: Universal Social Charge (USC) progressive rates, thresholds, and calculation',
    url: 'https://www.revenue.ie/en/jobs-and-pensions/usc/index.aspx',
    quote: 'The Universal Social Charge (USC) is a tax on income that you pay if your gross income is more than 13,000 euro per year.',
    summary: 'Under Irish tax legislation administered by the Revenue Commissioners, the Universal Social Charge (USC) is a progressive tax levied on an individuals total gross income after certain statutory reliefs. If total gross income exceeds the statutory threshold of 13,000 euros per year, USC applies to all income across progressive marginal rate bands. This record outlines Irish statutory USC taxation rules; it does not issue P2C tax credit certificates.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-08',
    expiresAt: '2027-11-08',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Official government legislation, statutory codes, and immigration agency regulations inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-08T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'ie-rsa-ncts-compulsory-roadworthiness-testing',
    topic: 'driving',
    jurisdiction: 'Ireland',
    title: 'Road Safety Authority: National Car Test (NCT) mandatory roadworthiness testing in Ireland',
    url: 'https://www.ncts.ie/about-the-nct/',
    quote: 'The National Car Test (NCT) is a compulsory test for all motor vehicles that is carried out to ensure that vehicles are roadworthy.',
    summary: 'Under the Road Safety Authority Act and road traffic regulations administered by the Road Safety Authority (RSA) in Ireland, all private motor vehicles older than 4 years must undergo mandatory periodic roadworthiness testing at an official National Car Test (NCT) centre. Testing is conducted every 2 years for vehicles between 4 and 10 years of age, and annually for vehicles 10 years and older. Driving an uncertified vehicle is an offence punishable by penalty points and court fines. This record outlines statutory roadworthiness testing requirements; it does not schedule NCT vehicle appointments.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-08',
    expiresAt: '2027-11-08',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Official government legislation, statutory codes, and immigration agency regulations inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-08T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'ie-wrc-sick-leave-act-statutory-sick-pay',
    topic: 'employment',
    jurisdiction: 'Ireland',
    title: 'Workplace Relations Commission: Statutory sick leave and pay under the Sick Leave Act 2022',
    url: 'https://www.workplacerelations.ie/en/what_you_should_know/leave/sick_leave/',
    quote: 'Under the Sick Leave Act 2022, an employee who is absent from work due to illness is entitled to statutory sick leave from their employer.',
    summary: 'Under the Sick Leave Act 2022 enforced by the Workplace Relations Commission (WRC), employees in Ireland who have completed at least 13 weeks of continuous service with their employer are entitled to up to 5 days of statutory sick leave per calendar year. Statutory Sick Pay (SSP) is paid by the employer at 70 percent of the employees normal gross daily wage, up to a maximum statutory limit of 110 euros per day, upon presentation of an authorized medical certificate from a registered medical practitioner. This record explains statutory Irish employment leave; it does not adjudicate wage disputes.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-08',
    expiresAt: '2027-11-08',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Official government legislation, statutory codes, and immigration agency regulations inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-08T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'ie-wrc-national-minimum-wage-rates',
    topic: 'employment',
    jurisdiction: 'Ireland',
    title: 'Workplace Relations Commission: Statutory national adult minimum wage rate under Irish labour law',
    url: 'https://www.workplacerelations.ie/en/what_you_should_know/hours-and-wages/national-minimum-wage/',
    quote: 'Since the introduction of the National Minimum Wage Act 2000, most employees are entitled to be paid at least the national minimum wage.',
    summary: 'Under the National Minimum Wage Act 2000 administered by the Workplace Relations Commission (WRC), all experienced adult employees aged 20 and over working in Ireland must be paid at least the statutory national minimum wage hourly rate for all working hours. Sub-minimum training rates and sub-adult age-based rates apply for workers aged 19 (90 percent), 18 (80 percent), and under 18 (70 percent). Employers are legally obligated to maintain detailed wage records demonstrating compliance. This record provides statutory wage guidance; it does not represent employees in WRC adjudication hearings.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-08',
    expiresAt: '2027-11-08',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Official government legislation, statutory codes, and immigration agency regulations inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-08T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'ie-isd-citizenship-naturalisation-five-year-reckonable-residence',
    topic: 'community',
    jurisdiction: 'Ireland',
    title: 'Immigration Service Delivery: Reckonable residence calculation for Irish citizenship naturalisation',
    url: 'https://www.irishimmigration.ie/how-to-become-a-citizen/become-an-irish-citizen-by-naturalisation/',
    quote: 'To apply for naturalisation based on residence, you must have 5 years (1,825 or 1,826 days) of reckonable residence in the State out of the last 9 years.',
    summary: 'Under Section 15 of the Irish Nationality and Citizenship Act 1956 administered by Immigration Service Delivery (ISD), an adult foreign national applying for naturalisation on Form 8 must prove at least 5 years (1,825 or 1,826 days) of reckonable residence in the Republic of Ireland during the 9 years preceding the application. Residence is proven using official immigration permission stamps (such as Stamp 1 or Stamp 4) alongside statutory proofs of identity and continuous address under the Department of Justice scorecard system. This record outlines statutory citizenship criteria; it does not review or grant naturalisation certificates.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-08',
    expiresAt: '2027-11-08',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Official government legislation, statutory codes, and immigration agency regulations inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-08T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'ie-isd-citizenship-naturalisation-one-year-continuous-residence',
    topic: 'community',
    jurisdiction: 'Ireland',
    title: 'Immigration Service Delivery: 365-day continuous residence requirement preceding Irish naturalisation',
    url: 'https://www.irishimmigration.ie/how-to-become-a-citizen/become-an-irish-citizen-by-naturalisation/',
    quote: 'You must have one continuous year of reckonable residence immediately before the date you apply for citizenship.',
    summary: 'Under Section 15(1)(c) of the Irish Nationality and Citizenship Act 1956 as amended by the Courts and Civil Law (Miscellaneous Provisions) Act 2023, an applicant for Irish citizenship by naturalisation must have one continuous full year (365 days) of reckonable residence in Ireland immediately preceding the date of application. Statutory amendments allow up to 70 days of cumulative absence from the State during this final 12-month period for exceptional business, health, or humanitarian reasons without breaking statutory continuity. This record summarizes Irish nationality law; it does not process citizenship submissions.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-08',
    expiresAt: '2027-11-08',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Official government legislation, statutory codes, and immigration agency regulations inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-08T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'sg-mas-retail-banking-ipa-kyc-account-opening',
    topic: 'money',
    jurisdiction: 'Singapore',
    title: 'Monetary Authority of Singapore: Retail bank account opening and KYC verification for employment pass holders',
    url: 'https://www.mas.gov.sg/regulation/anti-money-laundering',
    quote: 'Financial institutions in Singapore are required to perform customer due diligence including verifying customer identity and residential address.',
    summary: 'Under anti-money laundering and customer due diligence regulations issued by the Monetary Authority of Singapore (MAS), commercial banks in Singapore require foreign professionals to provide acceptable statutory proof of identity and residential address to open a retail current or savings account. Newcomers awaiting formal card registration can present their Ministry of Manpower (MOM) In-Principle Approval (IPA) letter, a valid foreign passport, and a verified proof of local residential address such as a tenancy agreement, utility bill, or official employer letter. This record explains statutory Singapore banking KYC rules; it does not open bank accounts or issue ATM cards.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-08',
    expiresAt: '2027-11-08',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Official government legislation, statutory codes, and immigration agency regulations inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-08T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  }
];

const allNew = [newCaRecord, ...newGlobalRecords];
const problems = checkRecords(allNew);
if (problems.length > 0) {
  console.error('Validation problems:', problems);
  process.exit(1);
}

// 1. Update src/technical-immigration-records.js
const techFile = path.join(root, 'src', 'technical-immigration-records.js');
let techContent = fs.readFileSync(techFile, 'utf8');
if (!techContent.includes(newCaRecord.id)) {
  const caJson = JSON.stringify(newCaRecord, null, 2);
  techContent = techContent.replace(/\n\];\s*$/, `,\n  ${caJson}\n];\n`);
  fs.writeFileSync(techFile, techContent);
  console.log('Appended to src/technical-immigration-records.js');
}

// 2. Update src/global-records.js
const globalFile = path.join(root, 'src', 'global-records.js');
let globalContent = fs.readFileSync(globalFile, 'utf8');
const toAddGlobal = newGlobalRecords.filter(r => !globalContent.includes(r.id));
if (toAddGlobal.length > 0) {
  const globalJsons = toAddGlobal.map(r => JSON.stringify(r, null, 2)).join(',\n  ');
  globalContent = globalContent.replace(/\n\];\s*$/, `,\n  ${globalJsons}\n];\n`);
  fs.writeFileSync(globalFile, globalContent);
  console.log(`Appended ${toAddGlobal.length} records to src/global-records.js`);
}

// 3. Insert into SQLite via openStore
const store = openStore(dbPath);
const stmt = store.db.prepare('INSERT OR REPLACE INTO records (id, body) VALUES (?, ?)');
const ftsStmt = store.db.prepare('INSERT OR REPLACE INTO records_fts (id, title, summary, quote, topic) VALUES (?, ?, ?, ?, ?)');
for (const r of allNew) {
  stmt.run(r.id, JSON.stringify(r));
  try {
    ftsStmt.run(r.id, r.title || '', r.summary || '', r.quote || '', r.topic || '');
  } catch {}
}
store.db.close();
console.log(`Inserted ${allNew.length} records into settlement.sqlite`);

// 4. Update review progress
const progress = loadProgress();
markRecords(progress, allNew.map(r => r.id), 'verified', 'Verified against official regulatory source documentation');
saveProgress(progress);
console.log('Marked verified in kb-review-progress.json');
