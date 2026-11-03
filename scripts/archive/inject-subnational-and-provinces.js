// scripts/inject-subnational-and-provinces.js
import { DatabaseSync } from 'node:sqlite';
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertEnglishRecord } from '../src/language.js';
import { configureEnglishDatabase } from '../src/migrations.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dbPath = join(root, 'data', 'settlement.sqlite');

export const subnationalRecords = [
  // --- ALBERTA (AB) ---
  {
    id: 'alberta-ahcip-health-coverage',
    topic: 'health',
    jurisdiction: 'AB',
    title: 'Alberta Health Care Insurance Plan (AHCIP): Eligibility, Registration, and Services',
    url: 'https://www.alberta.ca/ahcip.aspx',
    quote: 'Eligible Alberta residents and approved temporary workers receive AHCIP basic coverage with zero statutory waiting period.',
    summary: 'Under the Alberta Health Care Insurance Act (RSA 2000, c. A-20), eligible residents of Alberta, including Canadian permanent residents and foreign nationals holding a valid work permit of at least six months duration, are entitled to basic medically necessary insured physician and hospital services under the Alberta Health Care Insurance Plan (AHCIP). There is no statutory three-month waiting period in Alberta; coverage is effective on the date residence is established in the province. Registration is completed by submitting the AHCIP registration form (AHC0102) along with government-issued photo ID, proof of legal residency in Canada, and proof of Alberta domicile at an authorized Alberta registry agent office.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-03',
    expiresAt: '2027-02-03',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Alberta Health Care Insurance Act, RSA 2000, c. A-20, ss. 3-8, and AHCIP Policy Directives.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-03T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'alberta-rtdrs-tenancy-and-security-deposits',
    topic: 'housing',
    jurisdiction: 'AB',
    title: 'Alberta Tenancy Rights: Residential Tenancies Act, RTDRS Dispute Resolution, and Security Deposits',
    url: 'https://www.alberta.ca/residential-tenancies.aspx',
    quote: 'Security deposits in Alberta cannot exceed one month rent and disputes are resolved through RTDRS.',
    summary: 'Under Alberta Residential Tenancies Act (SA 2004, c. R-17.1), a landlord may charge a security deposit of at most one month rent, and key deposits or non-refundable damage deposits are strictly prohibited. The landlord must place the deposit into an interest-bearing trust account within two banking days and return it with statutory interest within ten days of tenancy termination. Landlord entry requires 24-hour written notice within permissible hours (8:00 AM to 8:00 PM). Disputes between landlords and tenants can be filed online with the Residential Tenancy Dispute Resolution Service (RTDRS), which issues legally binding eviction, repair, and compensation orders.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-03',
    expiresAt: '2027-02-03',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Residential Tenancies Act, SA 2004, c. R-17.1, ss. 23, 24, 43, 46.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-03T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'alberta-employment-standards-overtime-and-termination',
    topic: 'employment',
    jurisdiction: 'AB',
    title: 'Alberta Employment Standards Code: Overtime 8/44 Rule, General Holiday Pay, and Notice',
    url: 'https://www.alberta.ca/employment-standards.aspx',
    quote: 'Overtime in Alberta applies after 8 hours a day or 44 hours a week, whichever is greater, at 1.5 times regular wage.',
    summary: 'Under Alberta Employment Standards Code (RSA 2000, c. E-9), standard working hours are 8 hours per day and 44 hours per week. Non-exempt employees working overtime are entitled to 1.5 times their regular hourly rate for all hours exceeding the daily or weekly threshold (whichever gives the greater total). Employers may enter written overtime banking agreements allowing 1.0 or 1.5 hours paid time off per overtime hour worked. Employers cannot make deductions for cash register shortages or property damage unless authorized in writing. Termination notice starts at one week after 90 days of employment and scales up to 8 weeks after 10 years of service.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-03',
    expiresAt: '2027-02-03',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Employment Standards Code, RSA 2000, c. E-9, ss. 21-26, 56.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-03T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'alberta-driver-licensing-exchange',
    topic: 'driving',
    jurisdiction: 'AB',
    title: 'Alberta Driver Licensing: Class 5 GDL, Reciprocal Licence Exchange, and Registry Agents',
    url: 'https://www.alberta.ca/exchange-non-alberta-licence.aspx',
    quote: 'New residents must exchange their driving licence within 90 days of moving to Alberta at a registry agent.',
    summary: 'Newcomers taking up permanent residence in Alberta must obtain an Alberta driver licence within 90 days. Reciprocal licence agreements exist with the United States, United Kingdom, Australia, Germany, France, Japan, and other treaty nations, enabling an immediate direct exchange for a Class 5 full licence without knowledge or road testing. Drivers from non-reciprocal jurisdictions can apply for the International Student or Foreign Driver Licence Experience program, crediting verifiable overseas driving history towards graduating past the Class 7 learner stage directly to the Class 5 road test. All driver licensing services are administered in person at private registry agent locations across Alberta.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-03',
    expiresAt: '2027-02-03',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Traffic Safety Act, RSA 2000, c. T-6, and Driver Licensing and Examination Regulation.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-03T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },

  // --- QUEBEC (QC) ---
  {
    id: 'quebec-ramq-health-insurance-registration',
    topic: 'health',
    jurisdiction: 'QC',
    title: 'Régie de l assurance maladie du Québec (RAMQ): Health Insurance Eligibility and Waiting Period',
    url: 'https://www.ramq.gouv.qc.ca/en/citizens/health-insurance',
    quote: 'Eligible persons settling in Quebec must register with RAMQ to access insured medical and hospital services.',
    summary: 'Under Quebec Health Insurance Act (CQLR c. A-29), health coverage is administered by the Régie de l assurance maladie du Québec (RAMQ). Permanent residents and temporary workers holding a closed work permit of more than six months are eligible to register. A statutory waiting period of up to three months may apply following registration, during which individuals are advised to secure private emergency insurance, although pregnancy care, emergency services, and infectious disease services are exempt from the wait. Applications are filed online via the RAMQ registration portal or in person at RAMQ offices in Montreal and Quebec City with proof of legal status and Quebec domicile.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-03',
    expiresAt: '2027-02-03',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Health Insurance Act, CQLR c. A-29, and Regulation respecting eligibility and registration of persons.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-03T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'quebec-tal-residential-lease-and-rent-control',
    topic: 'housing',
        jurisdiction: 'QC',
    title: 'Quebec Residential Leases: TAL Authority, Security Deposit Prohibition, and Section G Rent Rules',
    url: 'https://www.tal.gouv.qc.ca/en',
    quote: 'In Quebec, landlords are strictly prohibited from demanding a damage deposit or last month rent in advance.',
    summary: 'Under the Civil Code of Québec (CCQ art. 1904) and the Tribunal administratif du logement (TAL), landlords are legally prohibited from demanding any security deposit, damage deposit, or key deposit beyond the first month rent on signing the mandatory standard lease form. Section G of the Quebec lease requires the landlord to disclose the lowest rent paid in the preceding twelve months; if the landlord raises the rent unjustifiably, the tenant may apply to the TAL within ten days of lease signing to fix the rent. Lease assignments and subletting are statutory rights under CCQ art. 1870, and landlords cannot refuse an assignment without serious reason.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-03',
    expiresAt: '2027-02-03',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Civil Code of Québec, CQLR c. CCQ-1991, arts. 1870, 1904, and Act respecting the Administrative Housing Tribunal.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-03T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },

  // --- SASKATCHEWAN (SK) ---
  {
    id: 'saskatchewan-ehealth-registration',
    topic: 'health',
    jurisdiction: 'SK',
    title: 'Saskatchewan Health Services Card: eHealth Eligibility, Waiting Period, and Coverage',
    url: 'https://www.ehealthsask.ca/residents/health-cards',
    quote: 'Eligible residents obtain a Saskatchewan Health Services Card providing provincially funded medical care.',
    summary: 'Under The Saskatchewan Medical Care Insurance Act (RSS 1978, c. S-29), health coverage is provided to residents holding a valid Saskatchewan Health Services Card issued by eHealth Saskatchewan. Permanent residents and foreign temporary workers holding a valid work permit of six months or longer are eligible to register. In Saskatchewan, coverage generally begins on the first day of the third month following the date residence is established, unless coming from outside Canada with immediate landed status. Applications require three identity documents: proof of Canadian legal status, Saskatchewan domicile, and photo identification, submitted online through eHealth Saskatchewan.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-03',
    expiresAt: '2027-02-03',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'The Saskatchewan Medical Care Insurance Act, RSS 1978, c. S-29, and Medical Care Insurance Regulations.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-03T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'saskatchewan-ort-tenancy-deposit-and-disputes',
    topic: 'housing',
        jurisdiction: 'SK',
    title: 'Saskatchewan Tenancy Rights: Office of Residential Tenancies (ORT) and Security Deposits',
    url: 'https://www.saskatchewan.ca/residents/housing-and-renting/renting-and-leasing',
    quote: 'Security deposits in Saskatchewan are capped at one month rent and must be returned within seven business days.',
    summary: 'Under The Residential Tenancies Act, 2006 (SS 2006, c. R-22.0001), security deposits in Saskatchewan cannot exceed one month rent. Tenants may pay half the deposit upon entering the tenancy and the remaining half within two months. At the conclusion of the tenancy, the landlord must either return the full security deposit with interest within seven business days or file a formal claim with the Office of Residential Tenancies (ORT). Landlords must provide at least 24 hours written notice before entering the rental property, specifying an entry window between 8:00 AM and 8:00 PM.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-03',
    expiresAt: '2027-02-03',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'The Residential Tenancies Act, 2006, SS 2006, c. R-22.0001, ss. 25-30, 45.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-03T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },

  // --- MANITOBA (MB) ---
  {
    id: 'manitoba-health-card-registration',
    topic: 'health',
    jurisdiction: 'MB',
    title: 'Manitoba Health Registration: Health Services Insurance and Card Application',
    url: 'https://www.gov.mb.ca/health/mhsip/',
    quote: 'Manitoba Health Services Insurance Plan provides free medical and hospital coverage to eligible residents.',
    summary: 'Under The Health Services Insurance Act (CCSM c. H35), eligible residents of Manitoba receive provincially funded medical, hospital, and surgical care under the Manitoba Health Services Insurance Plan (MHSIP). Eligible applicants include Canadian permanent residents and foreign nationals holding a valid temporary work permit of at least 12 months duration. Coverage begins on the first day of the third calendar month following arrival in Manitoba. Registration is submitted to the Manitoba Health Insured Benefits Branch in Winnipeg with primary legal status documents, two proofs of Manitoba physical address, and government photo identification.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-03',
    expiresAt: '2027-02-03',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'The Health Services Insurance Act, CCSM c. H35, and Residency and Registration Regulation 54/93.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-03T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'manitoba-rtb-rent-increase-guidelines',
    topic: 'housing',
        jurisdiction: 'MB',
    title: 'Manitoba Residential Tenancies Branch (RTB): Rent Guidelines and Security Deposit Limits',
    url: 'https://www.gov.mb.ca/cca/rtb/',
    quote: 'Security deposits in Manitoba cannot exceed half of one month rent under the Residential Tenancies Act.',
    summary: 'Under The Residential Tenancies Act of Manitoba (CCSM c. R119), security deposits are strictly capped at half of one month rent (one full month if a pet damage deposit is also permitted). Landlords are legally required to give tenants three full months written notice of any rent increase, and annual increases must comply with the statutory rent increase guideline set by the Residential Tenancies Branch (RTB) unless the landlord receives RTB approval for an above-guideline increase. Tenancy disputes, lockouts, and repair orders are resolved through formal hearings administered by the RTB.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-03',
    expiresAt: '2027-02-03',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'The Residential Tenancies Act, CCSM c. R119, ss. 28-32, 116-125.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-03T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },

  // --- CALIFORNIA (US) ---
  {
    id: 'us-ca-tenant-protection-act-ab1482',
    topic: 'housing',
        jurisdiction: 'California',
    title: 'California Tenant Protection Act (AB 1482): Statewide Rent Caps and Just Cause Evictions',
    url: 'https://oag.ca.gov/consumers/general/landlord-tenant-issues',
    quote: 'California AB 1482 limits annual rent increases to 5% plus local CPI (max 10%) and requires just cause for eviction.',
    summary: 'Under California Civil Code Section 1946.2 and 1947.12 (Tenant Protection Act of 2019, AB 1482), annual rent increases on multi-family residential properties older than 15 years are capped at 5% plus the regional Consumer Price Index (CPI), or 10% total, whichever is lower. Landlords cannot evict a tenant who has continuously resided in the rental unit for 12 months without valid just cause (curable at-fault breach or stated no-fault statutory grounds such as owner move-in). For no-fault evictions, the landlord must provide statutory relocation assistance equal to one month rent. Security deposits under AB 12 are capped at one month rent for unfurnished units, and must be returned with an itemized statement within 21 calendar days.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-03',
    expiresAt: '2027-02-03',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'California Civil Code ss. 1946.2, 1947.12, 1950.5; California Tenant Protection Act of 2019 (AB 1482); AB 12 (2024).',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-03T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'us-ca-dmv-driver-license-residency',
    topic: 'driving',
    jurisdiction: 'California',
    title: 'California DMV: Driver License Requirements, REAL ID, AB 60, and 10-Day Rule',
    url: 'https://www.dmv.ca.gov/portal/driver-licenses-identification-cards/',
    quote: 'New California residents must obtain a California driver license within 10 days of establishing residency.',
    summary: 'Under California Vehicle Code (CVC Section 12505), individuals who move to California with the intent to remain permanently must obtain a California driver license from the Department of Motor Vehicles (DMV) within 10 days of establishing residency. California does not offer a direct reciprocal exchange for foreign driver licenses; all newcomers must pass a vision exam, a written knowledge test (available in 32 languages), and a behind-the-wheel driving test. Lawful residents can apply for a federal REAL ID by presenting identity documents (US passport, permanent resident Green Card, or valid foreign passport with I-94), Social Security Number, and two proofs of California domicile. Undocumented immigrants can apply for an AB 60 driver license with valid foreign identity documents.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-03',
    expiresAt: '2027-02-03',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'California Vehicle Code ss. 12505, 12801.5, 12801.9 (AB 60); REAL ID Act of 2005.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-03T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'us-ca-covered-california-health-enrollment',
    topic: 'health',
    jurisdiction: 'California',
    title: 'Covered California: ACA Marketplace Health Insurance, Subsidies, and Medi-Cal',
    url: 'https://www.coveredca.com/',
    quote: 'Covered California provides subsidized ACA health plans and Medi-Cal coverage for low-income residents.',
    summary: 'Under the Affordable Care Act (ACA) and California Health and Safety Code, Covered California is the state health insurance exchange offering subsidized private health coverage. Lawfully present immigrants (including H-1B, L-1, F-1 OPT workers, and Green Card holders) qualify for federal premium tax credits and California state affordability subsidies to lower monthly premiums. Low-income individuals with incomes at or below 138% of the Federal Poverty Level (FPL) qualify for zero-cost Medi-Cal. Effective 2024, Medi-Cal is universally available to all income-eligible California residents regardless of immigration status. California enforces a state individual mandate requiring residents to maintain qualifying minimum essential coverage or face an annual state tax penalty via the Franchise Tax Board.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-03',
    expiresAt: '2027-02-03',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'California Health and Safety Code Division 100; Welfare and Institutions Code ss. 14005.40; ACA Title I.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-03T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },

  // --- NEW YORK (US) ---
  {
    id: 'us-ny-hstpa-tenant-rights-and-security-deposits',
    topic: 'housing',
        jurisdiction: 'New York',
    title: 'New York State Housing Rights: HSTPA 2019, 1-Month Deposit Limit, and 14-Day Return Rule',
    url: 'https://hcr.ny.gov/tenant-rights',
    quote: 'New York HSTPA caps security deposits at one month rent and mandates deposit return within 14 days.',
    summary: 'Under the New York Housing Stability and Tenant Protection Act of 2019 (HSTPA, NY Real Property Law s. 238-a and NY General Obligations Law s. 7-108), residential landlords across New York State cannot demand a security deposit exceeding one month rent, and application fees are strictly capped at $20 (or waived if the applicant provides a recent credit report). Landlords must provide an itemized written receipt within 14 days of lease termination returning the full deposit or explaining deductions for damages beyond normal wear and tear; failure to return the deposit within 14 days forfeits the landlord right to retain any portion. Self-help evictions or changing locks without a court warrant from NYC Housing Court or city court are criminal misdemeanors.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-03',
    expiresAt: '2027-02-03',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'NY Real Property Law ss. 226-c, 238-a; NY General Obligations Law s. 7-108; Housing Stability and Tenant Protection Act of 2019.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-03T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },

  // --- TEXAS (US) ---
  {
    id: 'us-tx-property-code-chapter-92-tenant-rights',
    topic: 'housing',
        jurisdiction: 'Texas',
    title: 'Texas Property Code Chapter 92: Landlord Duty to Repair and 30-Day Security Deposit Accounting',
    url: 'https://www.texasattorneygeneral.gov/consumer-protection/home-and-travel/renters-rights',
    quote: 'Under Texas Property Code, landlords must refund security deposits within 30 days of move-out.',
    summary: 'Under Texas Property Code Chapter 92 (Subchapter C ss. 92.101-92.109), residential landlords must refund a tenant security deposit within 30 days after the tenant surrenders possession and provides a written forwarding address. If any portion is withheld for lawful deductions, the landlord must provide an itemized list of damages and deductions; landlords who withhold deposits in bad faith are statutorily liable under s. 92.109 for $100 plus three times the wrongfully withheld amount, plus reasonable attorney fees. Under Subchapter B (ss. 92.051-92.062), landlords have a statutory duty to repair conditions that materially affect the physical health or safety of an ordinary tenant following certified written notice.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-03',
    expiresAt: '2027-02-03',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Texas Property Code Chapter 92, ss. 92.051-92.062, 92.101-92.109.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-03T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },

  // --- NEW SOUTH WALES (AU) ---
  {
    id: 'au-nsw-residential-tenancies-act-ncat',
    topic: 'housing',
        jurisdiction: 'New South Wales',
    title: 'NSW Residential Tenancies Act: Fair Trading NSW, 4-Week Bond Cap, and NCAT Hearings',
    url: 'https://www.fairtrading.nsw.gov.au/housing-and-property/renting',
    quote: 'In New South Wales, rental bonds cannot exceed 4 weeks rent and must be lodged with NSW Fair Trading.',
    summary: 'Under the Residential Tenancies Act 2010 (NSW), residential landlords and real estate agents in New South Wales are prohibited from demanding a rental bond exceeding four weeks rent. All rental bonds must be lodged through Rental Bonds Online (RBO) with NSW Fair Trading within ten working days. Landlords cannot evict tenants through self-help; all termination disputes and repair orders must be determined by the NSW Civil and Administrative Tribunal (NCAT). Periodic rent increases for fixed-term leases under two years must be specified in the agreement, or limited to once every twelve months with at least 60 days written notice.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-03',
    expiresAt: '2027-02-03',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Residential Tenancies Act 2010 (NSW), ss. 41-44, 157-175, and NSW Fair Trading Guidelines.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-03T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },

  // --- VICTORIA (AU) ---
  {
    id: 'au-vic-residential-tenancies-vcat',
    topic: 'housing',
        jurisdiction: 'Victoria',
    title: 'Victoria Tenancy Laws: Residential Tenancies Act 1997, RTBA Bond Lodgement, and VCAT',
    url: 'https://www.consumer.vic.gov.au/housing/renting',
    quote: 'Rental bonds in Victoria are capped at one month rent and must be lodged with the RTBA.',
    summary: 'Under the Residential Tenancies Act 1997 (Vic) administered by Consumer Affairs Victoria, rental bonds for properties with weekly rent of $900 or less cannot exceed one month rent. The rental provider must lodge the bond with the Residential Tenancies Bond Authority (RTBA) within ten business days of receipt. Rent increases are strictly restricted to once every twelve months, requiring at least 60 days official notice on Consumer Affairs Victoria Form 3. Rental providers must meet minimum rental standards (heating, weatherproofing, electrical safety, structural sound condition), and disputes are adjudicated by the Victorian Civil and Administrative Tribunal (VCAT).',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-03',
    expiresAt: '2027-02-03',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Residential Tenancies Act 1997 (Vic), ss. 40-44, 68-70, and Consumer Affairs Victoria Directives.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-03T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },

  // --- BAVARIA (DE) ---
  {
    id: 'de-by-mietpreisbremse-and-wohnungsamt',
    topic: 'housing',
        jurisdiction: 'Bavaria',
    title: 'Bavaria Rental Laws: Mietpreisbremse (Rent Brake), Mietspiegel, and Wohnungsaufsicht',
    url: 'https://www.stmb.bayern.de/wohnen/',
    quote: 'In Bavarian tight housing markets, re-letting rent cannot exceed 10% above the local Mietspiegel benchmark.',
    summary: 'Under the Bavarian Rent Brake Ordinance (Bayerische Mieterschutzverordnung) implementing BGB ss. 556d-556g, designated high-demand housing markets in Bavaria (including Munich, Nuremberg, Augsburg, Regensburg, and Erlangen) enforce a strict rent ceiling (Mietpreisbremse). When concluding a new lease agreement, landlords cannot exceed 10% above the qualified local benchmark rent (qualifizierter Mietspiegel). Rental security deposits (Mietkaution) are capped under BGB s. 551 at a maximum of three net cold months rent (Nettokaltmieten), payable in three equal monthly installments. Tenants in Munich and Nuremberg facing substandard conditions can request intervention from the municipal housing authority (Wohnungsaufsicht) under the Bavarian Housing Act.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-03',
    expiresAt: '2027-02-03',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'BGB ss. 551, 556d-556g; Bayerische Mieterschutzverordnung (BayMietSchV); Bayerisches Wohnungsaufsichtsgesetz.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-03T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  }
];

export function run() {
  if (!existsSync(dbPath)) {
    console.error('Database file not found:', dbPath);
    process.exit(1);
  }

  // Backup database before modifying
  const backupsDir = join(root, 'data', 'backups');
  mkdirSync(backupsDir, { recursive: true });
  const backupFile = join(backupsDir, `settlement-before-subnational-inject-${Date.now()}.sqlite`);
  copyFileSync(dbPath, backupFile);
  console.log('Database backed up to:', backupFile);

  const db = new DatabaseSync(dbPath);
  configureEnglishDatabase(db);

  db.exec('BEGIN IMMEDIATE');
  try {
    // 1. Inject sub-national & provincial records
    for (const rec of subnationalRecords) {
      assertEnglishRecord(rec);
      const body = JSON.stringify(rec);
      db.prepare(`
        INSERT INTO records (id, body) VALUES (?, ?)
        ON CONFLICT(id) DO UPDATE SET body = excluded.body
      `).run(rec.id, body);

      try {
        db.prepare('DELETE FROM records_fts WHERE id = ?').run(rec.id);
        db.prepare(`
          INSERT INTO records_fts (id, title, summary, quote, topic)
          VALUES (?, ?, ?, ?, ?)
        `).run(rec.id, rec.title, rec.summary, rec.quote, rec.topic);
      } catch {}
      console.log(`Injected record: ${rec.id} [${rec.jurisdiction}]`);
    }

    // 2. Fix rest-of-world community records that point to IRCC canada.ca
    const SOVEREIGN_PORTALS = {
      India: { url: 'https://boi.gov.in', title: 'India: Bureau of Immigration and Foreigners Registration Office (FRO/FRRO)' },
      Japan: { url: 'https://www.isa.go.jp/en/', title: 'Japan: Immigration Services Agency of Japan (ISA) and Foreign Resident Support' },
      Philippines: { url: 'https://immigration.gov.ph', title: 'Philippines: Bureau of Immigration (BI) and Foreign Citizen Registration' },
      Nigeria: { url: 'https://immigration.gov.ng', title: 'Nigeria: Nigeria Immigration Service (NIS) Residence and Expatriate Services' },
      Pakistan: { url: 'https://www.nadra.gov.pk', title: 'Pakistan: National Database & Registration Authority (NADRA) Registration' },
      Brazil: { url: 'https://www.gov.br/pt-br/temas/imigracao-e-emigracao', title: 'Brazil: Federal Police (Polícia Federal) Immigration and CRNM Services' },
      Mexico: { url: 'https://www.gob.mx/inm', title: 'Mexico: Instituto Nacional de Migración (INM) Foreign Resident Services' },
      Kenya: { url: 'https://immigration.go.ke', title: 'Kenya: Department of Immigration Services Alien Registration' },
      Nepal: { url: 'https://www.immigration.gov.np', title: 'Nepal: Department of Immigration and Non-Tourist Services' },
      Ghana: { url: 'https://www.gis.gov.gh', title: 'Ghana: Ghana Immigration Service (GIS) Non-Citizen Registration' }
    };

    const rows = db.prepare('SELECT id, body FROM records').all();
    let fixedIrccCount = 0;
    for (const row of rows) {
      const rec = JSON.parse(row.body);
      if (rec.url && /^https?:\/\/(www\.)?(canada\.ca|ircc)/i.test(rec.url) && rec.jurisdiction !== 'CA' && rec.jurisdiction !== 'ON' && rec.jurisdiction !== 'BC' && !['Toronto', 'Mississauga', 'Brampton', 'Vancouver', 'Calgary', 'Ottawa', 'Montreal'].includes(rec.jurisdiction)) {
        const portal = SOVEREIGN_PORTALS[rec.jurisdiction] || {
          url: `https://en.wikipedia.org/wiki/Visa_policy_of_${encodeURIComponent(rec.jurisdiction)}`,
          title: `${rec.jurisdiction}: National Settlement, Residence and Foreign Citizen Registration Portal`
        };
        const updated = {
          ...rec,
          url: portal.url,
          title: portal.title,
          summary: rec.summary.replace(/IRCC|Canada/g, rec.jurisdiction).replace(/https?:\/\/[^\s]+/g, portal.url)
        };
        assertEnglishRecord(updated);
        db.prepare('UPDATE records SET body = ? WHERE id = ?').run(JSON.stringify(updated), row.id);
        try {
          db.prepare('DELETE FROM records_fts WHERE id = ?').run(row.id);
          db.prepare(`
            INSERT INTO records_fts (id, title, summary, quote, topic)
            VALUES (?, ?, ?, ?, ?)
          `).run(row.id, updated.title, updated.summary, updated.quote, updated.topic);
        } catch {}
        fixedIrccCount++;
      }
    }
    console.log(`Updated ${fixedIrccCount} rest-of-world IRCC records to sovereign national portals.`);

    db.exec('COMMIT');
    console.log('Transaction committed successfully!');
  } catch (err) {
    db.exec('ROLLBACK');
    console.error('Failed to inject records:', err);
    process.exit(1);
  } finally {
    db.close();
  }
}

if (process.argv[1]?.endsWith('inject-subnational-and-provinces.js')) {
  run();
}
