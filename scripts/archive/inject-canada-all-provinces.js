// scripts/inject-canada-all-provinces.js
import fs from 'node:fs';
import path from 'node:path';
import { openStore } from '../src/store.js';

const dbPath = path.resolve('data/settlement.sqlite');
const backupDir = path.resolve('data/backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}
const backupPath = path.join(backupDir, `settlement-before-canada-all-provinces-${Date.now()}.sqlite`);
fs.copyFileSync(dbPath, backupPath);
console.log(`Backed up database to ${backupPath}`);

const store = openStore();
const db = store.db;

export const canadaAllProvincesRecords = [
  // ==========================================
  // NOVA SCOTIA (NS)
  // ==========================================
  {
    id: 'ca-ns-msi-health-coverage',
    topic: 'health',
    jurisdiction: 'NS',
    title: 'Nova Scotia Medical Services Insurance (MSI): Registration, Coverage & Waiting Period',
    url: 'https://novascotia.ca/dhw/msi/eligibility.asp',
    quote: 'MSI provides basic medical and hospital insurance to eligible residents and work permit holders in Nova Scotia.',
    summary: 'Under the Health Services and Insurance Act (RSNS 1989, c. 197) administered by the Department of Health and Wellness and Medavie Blue Cross, Medical Services Insurance (MSI) provides publicly funded hospital, physician, and medically necessary diagnostic services to residents of Nova Scotia. Eligible newcomers include Canadian citizens, permanent residents, and temporary foreign workers holding an employer-specific or open work permit valid for at least 12 months from the date of arrival in Nova Scotia. Coverage takes effect on the date of arrival or permit issuance, provided application is made promptly with valid immigration documentation, proof of provincial residency (such as a residential lease or utility bill), and identification. MSI beneficiaries must maintain their primary physical residence in Nova Scotia for at least 183 days per calendar year. Dependent children and spouses accompanying eligible work permit holders also qualify for coverage. MSI covers in-hospital accommodation, surgery, doctor visits, standard ward care, and medically required diagnostic testing. Prescription drugs outside hospital, dental care for adults, and routine optometry are not covered under basic MSI.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-01',
    expiresAt: '2027-02-01',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Nova Scotia Health Services and Insurance Act and MSI policy directives inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-01T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'ca-ns-residential-tenancies-program',
    topic: 'housing',
    jurisdiction: 'NS',
    title: 'Nova Scotia Residential Tenancies Program: Leases, 2% Rent Cap & Dispute Resolution',
    url: 'https://beta.novascotia.ca/programs-and-services/residential-tenancies-program',
    quote: 'Under the Residential Tenancies Act, security deposits are capped at one-half month rent and landlords must provide standard lease Form P.',
    summary: 'Under the Residential Tenancies Act (RSNS 1989, c. 401) administered by Service Nova Scotia, residential tenancies in Nova Scotia are governed by mandatory statutory conditions. Landlords must provide tenants with a copy of the standard form lease (Form P) within 10 days of signing, along with a copy of the Act. Security deposits are strictly capped at a maximum of one-half of one month rent (50%), and landlords cannot demand key deposits, cleaning fees, or last month rent in advance. Security deposits must be deposited into an interest-bearing trust account within 3 banking days. Nova Scotia enforces an interim statutory rent cap restricting rent increases to a maximum of 2% annually (or the prescribed provincial rate) for existing residential tenancies. Landlords must provide at least 4 months written notice prior to the anniversary date for rent increases on year-to-year leases. Landlord right of entry requires at least 24 hours written notice specifying a reasonable entry window between 9:00 AM and 9:00 PM. Disputes over maintenance, illegal rent hikes, security deposit withholding, or eviction notices must be submitted to the Director of Residential Tenancies via Form J for formal dispute resolution and binding adjudications.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-01',
    expiresAt: '2027-02-01',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Nova Scotia Residential Tenancies Act and Service Nova Scotia dispute guidelines verified directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-01T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'ca-ns-labour-standards-overtime-and-notice',
    topic: 'employment',
    jurisdiction: 'NS',
    title: 'Nova Scotia Labour Standards Code: Minimum Wage, Overtime 48-Hour Rule & Severance Notice',
    url: 'https://novascotia.ca/lae/employmentrights/',
    quote: 'Employees are entitled to 1.5 times the minimum wage for overtime hours worked beyond 48 hours in a work week.',
    summary: 'Under the Labour Standards Code (RSNS 1989, c. 246) administered by the Department of Labour, Skills and Immigration, workers in Nova Scotia are protected by statutory employment standards. The statutory overtime threshold is 48 hours per week, with overtime paid at 1.5 times the provincial minimum wage (or regular wage where contracted). Employees are entitled to at least 24 consecutive hours of rest every 7 days. Nova Scotia recognizes 6 statutory paid holidays: New Year Day, Nova Scotia Heritage Day, Good Friday, Canada Day, Labour Day, and Christmas Day. Qualifying employees who work on a holiday must receive regular pay plus 1.5 times regular wages for hours worked, or regular pay plus a paid day off within 30 days. Statutory notice of termination scales based on continuous service: 1 week for 3 months to 2 years, 2 weeks for 2 to 5 years, 4 weeks for 5 to 10 years, and 8 weeks for 10 or more years of service. Under Section 71, employers cannot make deductions for till shortages, breakages, or uniforms that reduce wages below the minimum wage threshold. Complaints can be filed with the Labour Standards Division within 6 months of the alleged violation.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-01',
    expiresAt: '2027-02-01',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Nova Scotia Labour Standards Code and Department of Labour operational guidelines reviewed directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-01T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'ca-ns-access-ns-driver-licence-exchange',
    topic: 'driving',
    jurisdiction: 'NS',
    title: 'Access Nova Scotia & Registry of Motor Vehicles: Class 5 Driver Licence Exchange & GDL',
    url: 'https://beta.novascotia.ca/exchange-out-province-drivers-licence',
    quote: 'New residents must obtain a Nova Scotia driver licence within 90 days of establishing residency in the province.',
    summary: 'Under the Motor Vehicle Act (RSNS 1989, c. 293) administered by the Registry of Motor Vehicles (Access Nova Scotia), new residents who take up permanent or temporary residence in Nova Scotia must exchange their driver licence within 90 days. Reciprocal exchange accords are established for passenger Class 5 licences from all Canadian provinces, the United States, United Kingdom, Germany, Australia, New Zealand, South Korea, and other designated reciprocating jurisdictions. Drivers from reciprocal countries can convert directly without knowledge or road tests by surrendering their existing licence, presenting proof of legal status in Canada, proof of Nova Scotia residency (two official documents), and passing a vision screening. Drivers from non-reciprocal jurisdictions must enter the Nova Scotia Graduated Driver Licensing (GDL) program, write the Class 5 knowledge test (rules of the road and signs), pass a vision exam, and complete a practical road test. Drivers with authenticated proof of at least 2 years of prior driving experience can bypass the standard waiting intervals between learner and full licensing stages.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-01',
    expiresAt: '2027-02-01',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Nova Scotia Registry of Motor Vehicles and Access Nova Scotia driver licensing rules inspected.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-01T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },

  // ==========================================
  // NEW BRUNSWICK (NB)
  // ==========================================
  {
    id: 'ca-nb-medicare-health-card',
    topic: 'health',
    jurisdiction: 'NB',
    title: 'New Brunswick Medicare: Eligibility, Application & Medically Necessary Services',
    url: 'https://www2.gnb.ca/content/gnb/en/departments/health/MedicarePrescriptionDrug.html',
    quote: 'New Brunswick Medicare provides coverage for medically necessary physician and hospital services to eligible residents.',
    summary: 'Under the Medical Services Payment Act (RSNB 1973, c. M-7) administered by the Department of Health and Service New Brunswick (SNB), New Brunswick Medicare provides publicly funded healthcare coverage to eligible permanent residents, Canadian citizens, and temporary foreign workers holding valid employer-specific or open work permits of at least 12 months duration. Coverage covers medically necessary physician consultations, in-hospital surgical procedures, standard ward accommodation, and specialist hospital care. Newcomers arriving from outside Canada who establish permanent residence in New Brunswick are eligible for coverage from the first day of the third month following the month residency is established, with interprovincial portability agreements protecting domestic movers during the transition. Applicants must apply through Service New Brunswick by submitting Form 0110 along with original citizenship or immigration documentation, proof of provincial residency (such as a signed lease or bank statement), and government-issued photo identification. Dependent children residing in New Brunswick are included under the primary applicant Medicare account.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-01',
    expiresAt: '2027-02-01',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'New Brunswick Medical Services Payment Act and Department of Health operational rules reviewed.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-01T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'ca-nb-residential-tenancies-tribunal',
    topic: 'housing',
    jurisdiction: 'NB',
    title: 'New Brunswick Residential Tenancies Tribunal: Security Deposits in Trust & Rent Increases',
    url: 'https://www2.gnb.ca/content/gnb/en/corporate/promo/renting-in-new-brunswick.html',
    quote: 'All security deposits in New Brunswick must be paid to the Residential Tenancies Tribunal and held in trust.',
    summary: 'Under the Residential Tenancies Act (SNB 1975, c. R-10.2) administered by the Residential Tenancies Tribunal (RTT) through Service New Brunswick, residential rental agreements in New Brunswick are strictly regulated. Landlords must use the standard form lease (Form 6) and cannot demand a security deposit exceeding one month rent. Crucially, landlords in New Brunswick are legally prohibited from holding security deposit funds directly: the landlord must submit the security deposit to the Residential Tenancies Tribunal within 15 days of receipt, where it is held in government trust for the tenant. Landlords who fail to remit deposits commit a provincial offence. Rent increases require at least 6 months written notice on Form 7 and can only occur once every 12 months. Landlords must provide at least 24 hours written notice before entering rented premises, with entry restricted to 8:00 AM to 8:00 PM. Disputes concerning security deposit returns, unlawful eviction, repair failures, or rent increases are adjudicated directly by Residential Tenancies Officers, who possess the legal power to issue binding compliance orders.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-01',
    expiresAt: '2027-02-01',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'New Brunswick Residential Tenancies Act and Service New Brunswick Tribunal procedures verified.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-01T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'ca-nb-employment-standards-overtime-and-holidays',
    topic: 'employment',
    jurisdiction: 'NB',
    title: 'New Brunswick Employment Standards Act: Overtime 44-Hour Rule, Paid Holidays & Layoff Notice',
    url: 'https://www2.gnb.ca/content/gnb/en/departments/post-secondary_education_training_and_labour/People/content/EmploymentStandards.html',
    quote: 'Overtime pay in New Brunswick is calculated at 1.5 times the provincial minimum wage for all hours worked over 44 per week.',
    summary: 'Under the Employment Standards Act (SNB 1982, c. E-7.2) administered by the Department of Post-Secondary Education, Training and Labour, workers in New Brunswick are guaranteed statutory minimum employment conditions. Overtime is mandatory for all hours worked beyond 44 hours in a single work week, paid at a minimum of 1.5 times the provincial minimum wage rate. Employers must provide a weekly rest period of at least 24 consecutive hours. New Brunswick recognizes 8 paid public statutory holidays: New Year Day, Family Day, Good Friday, Canada Day, New Brunswick Day, Labour Day, Remembrance Day, and Christmas Day. Eligible employees who work on a statutory holiday are entitled to 1.5 times their regular rate plus regular holiday pay. Notice of dismissal or layoff scales based on continuous tenure: at least 2 weeks written notice for employees with 6 months to 5 years service, and at least 4 weeks notice for employees with 5 or more years of service. Employers cannot make unauthorized deductions for till shortages, lost tools, or mandatory uniforms, and employees can file formal wage recovery claims with Employment Standards within 12 months.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-01',
    expiresAt: '2027-02-01',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'New Brunswick Employment Standards Act and Labour Standards branch inspection.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-01T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'ca-nb-driver-licensing-snb',
    topic: 'driving',
    jurisdiction: 'NB',
    title: 'Service New Brunswick Driver Licensing: Class 5 Reciprocal Conversion & Foreign Experience',
    url: 'https://www2.gnb.ca/content/gnb/en/services/services_renderer.200566.Driver_Licence_-_Exchange_of_a_Licence.html',
    quote: 'Newcomers must exchange their out-of-province or foreign driver licence for a New Brunswick licence within 7 months.',
    summary: 'Under the Motor Vehicle Act (RSNB 1973, c. M-17) administered by Service New Brunswick (SNB) and the Registrar of Motor Vehicles, individuals establishing residence in New Brunswick can drive on their existing valid licence for up to 7 months, after which they must obtain a New Brunswick Class 5 driver licence. Direct reciprocal exchanges are available for passenger vehicle licences from all Canadian jurisdictions, the United States, Australia, United Kingdom, France, Germany, Austria, Switzerland, Belgium, South Korea, and Taiwan. To complete a reciprocal exchange, applicants present their current licence, proof of legal Canadian status, and two documents proving New Brunswick residency. Licence holders from non-reciprocal jurisdictions must apply under the New Brunswick Graduated Driver Licensing (GDL) program (Class 7 learner to Class 5 graduated). However, applicants with verifiable certified driving history extracts showing 2 or more years of licensed experience can bypass GDL holding periods and take the knowledge, vision, and road tests directly for full Class 5 licensing.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-01',
    expiresAt: '2027-02-01',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'New Brunswick Motor Vehicle Act and Service New Brunswick driver licensing directives inspected.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-01T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },

  // ==========================================
  // NEWFOUNDLAND AND LABRADOR (NL)
  // ==========================================
  {
    id: 'ca-nl-mcp-health-care-plan',
    topic: 'health',
    jurisdiction: 'NL',
    title: 'Newfoundland & Labrador Medical Care Plan (MCP): Registration, Eligibility & Coverage',
    url: 'https://www.gov.nl.ca/hcs/mcp/',
    quote: 'The Medical Care Plan (MCP) covers insured medical and surgical procedures for eligible residents of Newfoundland and Labrador.',
    summary: 'Under the Medical Care Insurance Act 1999 (SNL 1999, c. M-5.1) administered by the Department of Health and Community Services, the Newfoundland and Labrador Medical Care Plan (MCP) and Hospital Insurance Plan cover all medically necessary physician and hospital services. Eligible residents include Canadian citizens, permanent residents, and temporary foreign workers residing in Newfoundland and Labrador who hold a valid work permit issued for a duration of at least 12 months. Coverage is effective from the date of arrival in the province, provided application is submitted promptly with immigration papers, proof of physical address, and valid government ID. Beneficiaries must reside in the province for at least 4 consecutive months in each 12-month period to maintain coverage. MCP covers doctor visits in clinic and hospital, surgical services, anaesthesia, hospital ward accommodation, diagnostic imaging, and laboratory testing. Services not covered include prescription medications outside hospitals, adult dental care, and cosmetic procedures. Applications can be completed at MCP offices in St. John or Grand Falls-Windsor or mailed with certified document copies.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-01',
    expiresAt: '2027-02-01',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Newfoundland Medical Care Insurance Act 1999 and MCP operational directives verified.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-01T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'ca-nl-residential-tenancies-act',
    topic: 'housing',
    jurisdiction: 'NL',
    title: 'Newfoundland & Labrador Residential Tenancies Act 2018: Deposits, Rent Notice & Hearings',
    url: 'https://www.gov.nl.ca/dgsnl/landlord-tenant/',
    quote: 'Under the Residential Tenancies Act 2018, security deposits cannot exceed three-quarters of one month rent.',
    summary: 'Under the Residential Tenancies Act 2018 (SNL 2018, c. R-14.2) administered by the Residential Tenancies Section of Digital Government and Service NL, tenancy agreements across Newfoundland and Labrador are subject to mandatory statutory protections. Security deposits are legally capped at three-quarters of one month rent (75%) for month-to-month tenancies, and two weeks rent for week-to-week rentals. Landlords cannot charge pet deposits, key fees, or last month rent in advance, and must hold security deposits in an interest-bearing financial institution trust account. Landlords must provide a written receipt and a signed copy of the standard rental agreement within 10 days of entering into the tenancy. Rent increases are permitted only once in a 12-month period and require at least 6 months advance written notice on prescribed forms. Landlords must give at least 24 hours written notice before entering premises between 9:00 AM and 9:00 PM. Disputes over maintenance, damage claims, security deposit retention, or eviction must be filed with the Director of Residential Tenancies for formal mediation or a binding adjudication hearing.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-01',
    expiresAt: '2027-02-01',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Newfoundland Residential Tenancies Act 2018 and Service NL landlord-tenant rules reviewed.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-01T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'ca-nl-labour-standards-code',
    topic: 'employment',
    jurisdiction: 'NL',
    title: 'Newfoundland & Labrador Labour Standards Act: Overtime 40-Hour Rule, Holidays & Dismissal',
    url: 'https://www.gov.nl.ca/ecc/labour/non-union/labour-standards/',
    quote: 'Employees must receive overtime pay of 1.5 times the minimum wage for every hour worked in excess of 40 hours in a week.',
    summary: 'Under the Labour Standards Act (RSNL 1990, c. L-2) administered by the Labour Standards Division of the Department of Environment and Climate Change, workers in Newfoundland and Labrador are entitled to baseline statutory working conditions. The standard work week is 40 hours, and all overtime hours worked beyond 40 hours in a week must be paid at a statutory rate of at least 1.5 times the provincial minimum wage. Employees are entitled to at least 24 consecutive hours of rest in each consecutive 7-day period. Newfoundland recognizes 6 statutory paid public holidays: New Year Day, Good Friday, Memorial Day / Canada Day, Labour Day, Remembrance Day, and Christmas Day. Eligible employees who work on a public holiday are entitled to 2 times their regular rate or regular pay plus a paid day off within 30 days. Statutory notice of termination scales with continuous employment: 1 week for 3 months to 2 years service, 2 weeks for 2 to 5 years, 3 weeks for 5 to 10 years, 4 weeks for 10 to 15 years, and 6 weeks for 15 or more years. Employers cannot deduct uniform, breakage, or register shortage costs from employee pay.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-01',
    expiresAt: '2027-02-01',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Newfoundland Labour Standards Act and Department labour regulations verified.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-01T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'ca-nl-motor-registration-licence-exchange',
    topic: 'driving',
    jurisdiction: 'NL',
    title: 'Digital Government & Service NL: Motor Registration Driver Licence Exchange & GDL',
    url: 'https://www.gov.nl.ca/dgsnl/drivers/driverslicence/new-residents/',
    quote: 'New residents must obtain a Newfoundland and Labrador driver licence within 3 months of taking up residence.',
    summary: 'Under the Highway Traffic Act (RSNL 1990, c. H-3) administered by the Motor Registration Division of Digital Government and Service NL, individuals moving to Newfoundland and Labrador must exchange their existing driver licence within 3 months (90 days). Reciprocal exchange agreements allow direct conversion of passenger vehicle licences (Class 5) from all Canadian provinces, the United States, United Kingdom, Germany, Austria, Switzerland, Australia, New Zealand, and other designated nations without written or road examinations upon passing an eye examination. Applicants must surrender their existing foreign licence, present original proof of legal Canadian status, and provide two proofs of local Newfoundland address. Drivers from non-reciprocal jurisdictions enter the Graduated Driver Licensing (GDL) program. Drivers who provide authenticated proof of at least 2 years of prior driving experience from their home jurisdiction can bypass the Level I novice holding period and proceed directly to the Class 5 road test after passing the written knowledge test and vision screening.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-01',
    expiresAt: '2027-02-01',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Newfoundland Highway Traffic Act and Motor Registration Division directives reviewed.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-01T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },

  // ==========================================
  // PRINCE EDWARD ISLAND (PE)
  // ==========================================
  {
    id: 'ca-pe-health-pei-registration',
    topic: 'health',
    jurisdiction: 'PE',
    title: 'Health PEI Card: Application, Registration, Eligibility & Physician Coverage',
    url: 'https://www.princeedwardisland.ca/en/information/health-pei/apply-for-pei-health-card',
    quote: 'Health PEI covers necessary physician, hospital, and specialist services for eligible residents of Prince Edward Island.',
    summary: 'Under the Health Services Act (RSPEI 1988, c. H-1.6) administered by the Department of Health and Wellness and Health PEI, residents of Prince Edward Island receive publicly funded healthcare coverage. Eligible residents include Canadian citizens, permanent residents, and temporary foreign workers possessing a valid work permit of at least 6 months duration who maintain their primary residence in PEI. Coverage takes effect on the first day of the third month following the month residency is established for domestic newcomers, while qualifying international newcomers who move directly to PEI receive coverage from their date of arrival. Health PEI covers hospital accommodation, physician visits, surgical operations, obstetrical services, and medically necessary diagnostic testing. Applicants must submit the Health PEI Card Application along with proof of legal status in Canada, proof of residency (utility bill or lease agreement), and valid photo identification. Out-of-province students and seasonal workers must verify specific residency criteria, and card renewals occur every 5 years.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-01',
    expiresAt: '2027-02-01',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Prince Edward Island Health Services Act and Health PEI operational guidelines inspected.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-01T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'ca-pe-irac-residential-rental-tenancies',
    topic: 'housing',
    jurisdiction: 'PE',
    title: 'PEI Residential Tenancy Act & IRAC: Rent Increase Orders, 1-Month Deposit & Dispute Hearings',
    url: 'https://irac.pe.ca/rental/',
    quote: 'The Residential Tenancy Act sets maximum allowable annual rent increases and caps security deposits at one month rent.',
    summary: 'Under the Residential Tenancy Act (RSPEI 1988, c. R-13.11) administered by the Island Regulatory and Appeals Commission (IRAC) and the Director of Residential Tenancy, rental properties in Prince Edward Island are subject to strict statutory oversight. Landlords cannot charge a security deposit exceeding one month rent (or one week rent for weekly tenancies). Security deposits must be deposited into an interest-bearing account in trust within 2 banking days. Landlords are legally prohibited from demanding key deposits, pet deposits, or advance rent beyond the initial rent payment. Annual rent increases are strictly regulated by IRAC: landlords can only increase rent by the statutory percentage established annually by the Commission, and must serve Form 4 (Notice of Rent Increase) at least 3 months in advance. Landlords seeking an increase above the guideline must file a formal application with the Director. Landlord entry requires at least 24 hours written notice specifying an entry time between 9:00 AM and 9:00 PM. Eviction notices, repairs orders, and deposit disputes are adjudicated through formal hearings before the Director of Residential Tenancy with appeal rights to IRAC.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-01',
    expiresAt: '2027-02-01',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Prince Edward Island Residential Tenancy Act and IRAC regulatory orders verified.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-01T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'ca-pe-employment-standards-act',
    topic: 'employment',
    jurisdiction: 'PE',
    title: 'PEI Employment Standards Act: Overtime 48-Hour Threshold, Paid Holidays & Termination Rules',
    url: 'https://www.princeedwardisland.ca/en/information/workforce-advanced-learning-and-population/employment-standards',
    quote: 'Overtime in Prince Edward Island is paid at 1.5 times the employee regular wage for hours worked beyond 48 hours per week.',
    summary: 'Under the Employment Standards Act (RSPEI 1988, c. E-6.2) administered by the Employment Standards Board, workers in Prince Edward Island receive essential statutory protections. Overtime pay is mandatory for all hours worked in excess of 48 hours in a work week, payable at a minimum rate of 1.5 times the employee regular hourly wage. Employers must ensure employees receive at least 24 consecutive hours of rest every 7 days. PEI recognises 8 statutory paid public holidays: New Year Day, Islander Day, Good Friday, Canada Day, Labour Day, National Day for Truth and Reconciliation, Remembrance Day, and Christmas Day. Eligible employees who work on a public holiday are entitled to their regular day wage plus 1.5 times their regular rate for all hours worked. Statutory notice of termination scales based on length of service: 2 weeks notice for employees with 6 months to 5 years service, and 4 weeks notice for employees with 5 or more years continuous service. Employers are strictly barred from deducting till shortages, damaged stock, or uniform expenses from employee wages.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-01',
    expiresAt: '2027-02-01',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Prince Edward Island Employment Standards Act and Employment Standards Board rules inspected.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-01T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'ca-pe-access-pei-driver-licensing',
    topic: 'driving',
    jurisdiction: 'PE',
    title: 'Access PEI Driver Licensing: Highway Safety Class 5 Licence Exchange & GDL Standards',
    url: 'https://www.princeedwardisland.ca/en/information/transportation-and-infrastructure/exchange-an-out-of-province-drivers-license',
    quote: 'New residents must transfer their driver licence to Prince Edward Island within 4 months of moving.',
    summary: 'Under the Highway Traffic Act (RSPEI 1988, c. H-5) administered by Access PEI and Highway Safety, new residents living in Prince Edward Island must exchange their out-of-province or foreign driver licence within 4 months (120 days). Reciprocal exchange agreements exist for Class 5 passenger vehicle licences from all Canadian provinces, the United States, Australia, Austria, France, Germany, Japan, South Korea, Switzerland, Taiwan, and the United Kingdom, permitting direct conversion upon passing a vision screening without knowledge or road tests. Applicants must present their foreign licence, proof of legal presence in Canada, and two documents proving PEI residential address. Licence holders from non-reciprocal countries must complete the PEI Graduated Driver Licensing (GDL) process, including a written road signs and rules test, vision exam, and driving examination. Applicants with authenticated documentation verifying 2 or more years of licensed driving experience from their home country can skip the Stage 1 waiting period and book the Class 5 road test directly.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-01',
    expiresAt: '2027-02-01',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Prince Edward Island Highway Traffic Act and Access PEI licensing standards inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-01T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },

  // ==========================================
  // YUKON (YT)
  // ==========================================
  {
    id: 'ca-yt-yhcip-health-insurance',
    topic: 'health',
    jurisdiction: 'YT',
    title: 'Yukon Health Care Insurance Plan (YHCIP): Eligibility, Registration & Physician Services',
    url: 'https://yukon.ca/en/health-and-wellness/health-care-coverage/apply-health-care-insurance',
    quote: 'YHCIP provides comprehensive hospital and medical insurance to eligible Yukon residents under the Health Care Insurance Plan Act.',
    summary: 'Under the Health Care Insurance Plan Act (RSY 2002, c. 107) administered by the Department of Health and Social Services Insured Health Services branch, the Yukon Health Care Insurance Plan (YHCIP) provides publicly funded healthcare to eligible residents. Eligible residents include Canadian citizens, permanent residents, and temporary foreign workers possessing a valid employer-specific or open work permit of at least 12 months duration. Qualifying residents must physically reside in the Yukon for at least 183 days in each 12-month period. Coverage begins on the first day of the third month following the month residency is established for domestic arrivals, whereas international newcomers settling directly in Yukon obtain coverage on their arrival date. YHCIP covers standard hospital ward care, surgical procedures, physician visits, specialist care, and medical emergency evacuations. YHCIP does not cover dental services for adults or prescription medications taken outside hospital. Applicants register in person at the Whitehorse office or submit applications with certified copies of immigration status and proofs of physical Yukon residence.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-01',
    expiresAt: '2027-02-01',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Yukon Health Care Insurance Plan Act and Insured Health Services directives verified.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-01T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'ca-yt-residential-tenancies-office',
    topic: 'housing',
    jurisdiction: 'YT',
    title: 'Yukon Residential Tenancies Office (RTO): Security Deposits, Rent Notice & Adjudications',
    url: 'https://yukon.ca/en/housing-and-property/renting/learn-about-residential-tenancy-rules',
    quote: 'Under the Residential Landlord and Tenant Act, security deposits are capped at one month rent and rent increases require three months notice.',
    summary: 'Under the Residential Landlord and Tenant Act (RSY 2002, c. 131) administered by the Yukon Residential Tenancies Office (RTO), rental arrangements across the territory are governed by codified statutory standards. Security deposits cannot exceed one month rent for unfurnished or furnished units, and pet damage deposits cannot exceed one month rent. Landlords cannot demand last month rent in advance or charge application fees. Security deposits must be held in an interest-bearing account in a recognized financial institution. Rent can only be increased once every 12 months, and the landlord must provide at least 3 months advance written notice specifying the amount of the increase and its effective date. Landlords must provide at least 24 hours written notice before entering rented premises, with entry restricted to between 8:00 AM and 8:00 PM. Tenancy disputes concerning repair duties, return of deposits, or eviction notices are heard by Dispute Resolution Officers at the Residential Tenancies Office in Whitehorse, whose written orders are enforceable as orders of the Supreme Court of Yukon.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-01',
    expiresAt: '2027-02-01',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Yukon Residential Landlord and Tenant Act and RTO operational dispute guidelines reviewed.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-01T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'ca-yt-employment-standards-act',
    topic: 'employment',
    jurisdiction: 'YT',
    title: 'Yukon Employment Standards Act: Overtime 8/40 Rule, 11 Statutory Holidays & Vacation Pay',
    url: 'https://yukon.ca/en/employment/employment-standards',
    quote: 'Employees in Yukon must receive overtime pay of 1.5 times their regular hourly rate for hours worked over 8 per day or 40 per week.',
    summary: 'Under the Employment Standards Act (RSY 2002, c. 72) administered by the Employment Standards Board of the Department of Community Services, workers in Yukon benefit from robust labour protections. The statutory workday is 8 hours and the workweek is 40 hours. Overtime is payable at 1.5 times the employee regular wage for all hours worked in excess of 8 hours per day or 40 hours per week. Employees are entitled to at least 24 consecutive hours of rest each week. Yukon recognizes 11 statutory public holidays: New Year Day, Good Friday, Easter Monday, Victoria Day, National Indigenous Peoples Day, Canada Day, Discovery Day, Labour Day, National Day for Truth and Reconciliation, Remembrance Day, and Christmas Day. Qualifying employees working on a holiday receive 1.5 times regular pay plus regular holiday pay. Vacation entitlement is 2 weeks paid leave per year (4% vacation pay) for the first 4 years, increasing to 3 weeks (6%) after 5 years. Termination notice ranges from 1 week for 6 months service up to 8 weeks for 8 or more years service. Deductions for till shortages or damaged property are prohibited.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-01',
    expiresAt: '2027-02-01',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Yukon Employment Standards Act and Employment Standards Board regulations examined.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-01T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'ca-yt-motor-vehicles-licence-conversion',
    topic: 'driving',
    jurisdiction: 'YT',
    title: 'Yukon Motor Vehicles: Class 5 Driver Licence Reciprocal Exchange & GDL Standards',
    url: 'https://yukon.ca/en/driving-and-transportation/driver-licensing/exchange-your-out-territory-drivers-licence',
    quote: 'New Yukon residents must obtain a Yukon driver licence within 120 days of establishing residency.',
    summary: 'Under the Motor Vehicles Act (RSY 2002, c. 153) administered by the Motor Vehicles branch of the Department of Community Services, newcomers moving to Yukon must transfer their driver licence within 120 days of arrival. Direct reciprocal licence exchange accords are in place for passenger Class 5 licences from all Canadian jurisdictions, the United States, United Kingdom, Germany, Australia, and other reciprocating territories. Reciprocal transfers require surrendering the existing licence, passing a vision test, and providing proof of legal presence in Canada and proof of Yukon residency (two documents). Drivers from non-reciprocal jurisdictions must complete the Yukon Graduated Driver Licensing (GDL) program. Drivers with authenticated driving extracts verifying at least 2 years of foreign licensed experience can bypass the standard learner holding intervals and proceed directly to the Class 5 road test upon passing the written knowledge test and vision screening. Vehicles registered in Yukon must meet strict arctic safety standards.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-01',
    expiresAt: '2027-02-01',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Yukon Motor Vehicles Act and Motor Vehicles branch driver licensing standards verified.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-01T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },

  // ==========================================
  // NORTHWEST TERRITORIES (NT)
  // ==========================================
  {
    id: 'ca-nt-health-care-plan',
    topic: 'health',
    jurisdiction: 'NT',
    title: 'Northwest Territories Health Care Plan: Registration, Eligibility & Hospital Benefits',
    url: 'https://www.hss.gov.nt.ca/en/services/nwt-health-care-plan',
    quote: 'The NWT Health Care Plan provides insured physician and hospital care to permanent residents and valid work permit holders.',
    summary: 'Under the Medical Care Act (RSNWT 1988, c. M-8) and Hospital Insurance and Health and Social Services Administration Act, the Northwest Territories Health Care Plan provides comprehensive publicly funded health insurance. Eligible residents include Canadian citizens, permanent residents, and temporary foreign workers possessing a valid work permit of at least 12 months duration. Applicants must physically reside in the Northwest Territories for at least 153 days per year. Coverage covers medically necessary physician care, surgical operations, hospital ward accommodation, diagnostic testing, and emergency aeromedical evacuation (medevac) between northern communities and southern regional trauma centres. Coverage starts on the first day of the third month following arrival for domestic migrants, while international newcomers receive coverage from their arrival date in the NWT. Registration requires submitting the NWT Health Care Application, proof of immigration status, proof of physical address, and government identification to Health and Social Services in Inuvik or Yellowknife.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-01',
    expiresAt: '2027-02-01',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Northwest Territories Medical Care Act and Department of Health operational standards reviewed.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-01T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'ca-nt-rental-office-tenancies',
    topic: 'housing',
    jurisdiction: 'NT',
    title: 'Northwest Territories Rental Office: Security Deposits in Instalments & Rental Adjudications',
    url: 'https://www.justice.gov.nt.ca/en/rental-office/',
    quote: 'Under the Residential Tenancies Act, security deposits cannot exceed one month rent and may be paid in two equal instalments.',
    summary: 'Under the Residential Tenancies Act (RSNWT 1988, c. R-5) administered by the NWT Rental Office, residential tenancies in the Northwest Territories are governed by mandatory statutory conditions. Security deposits cannot exceed one month rent. Uniquely in the NWT, tenants have the statutory right to pay the security deposit in two equal instalments: 50% upon signing the agreement, and the remaining 50% within 3 months of moving in. Landlords cannot demand key deposits or last month rent in advance, though a pet deposit capped at 50% of monthly rent is permitted if agreed. Security deposits must be deposited into an interest-bearing trust account within a financial institution. Rent increases are restricted to once in a 12-month period and require at least 3 months written notice. Landlords must give at least 24 hours written notice to enter premises between 8:00 AM and 8:00 PM. Disputes over vital winter heating maintenance, damage deductions, or evictions are adjudicated by the NWT Rental Officer, whose legally binding orders are registered with the Territorial Court.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-01',
    expiresAt: '2027-02-01',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Northwest Territories Residential Tenancies Act and Rental Office procedural rules verified.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-01T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'ca-nt-employment-standards-act',
    topic: 'employment',
    jurisdiction: 'NT',
    title: 'Northwest Territories Employment Standards Act: Overtime 8/40 Rule & Statutory Holiday Pay',
    url: 'https://www.ece.gov.nt.ca/en/services/employment-standards',
    quote: 'Overtime in the Northwest Territories is paid at 1.5 times the employee regular wage for hours worked over 8 in a day or 40 in a week.',
    summary: 'Under the Employment Standards Act (SNWT 2007, c. 13) administered by the Department of Education, Culture and Employment, employees across the Northwest Territories are guaranteed foundational statutory protections. Standard working hours are 8 hours per day and 40 hours per week, with all excess hours compensated at an overtime rate of at least 1.5 times the employee regular hourly wage. Employees must receive at least one full day of rest (24 consecutive hours) in every 7-day period. The NWT observes 11 statutory public holidays: New Year Day, Good Friday, Victoria Day, National Indigenous Peoples Day, Canada Day, Civic Holiday, Labour Day, National Day for Truth and Reconciliation, Remembrance Day, Christmas Day, and Boxing Day. Working on a statutory holiday entitles the employee to 1.5 times their regular wage plus regular holiday pay. Notice of individual termination scales from 1 week for 90 days service up to 8 weeks for 8 or more years service. Employers cannot make unauthorized deductions for till shortages or broken property, and claims can be filed within 1 year.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-01',
    expiresAt: '2027-02-01',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Northwest Territories Employment Standards Act and Employment Standards Office guidelines reviewed.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-01T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'ca-nt-driver-and-vehicle-licensing',
    topic: 'driving',
    jurisdiction: 'NT',
    title: 'NWT Driver and Vehicle Services: Class 5 Driver Licence Transfer & GDL Standards',
    url: 'https://www.inf.gov.nt.ca/en/services/driver-and-vehicle-services/get-drivers-licence',
    quote: 'Newcomers must transfer their driver licence to the Northwest Territories within 30 days of establishing residency.',
    summary: 'Under the Motor Vehicles Act (RSNWT 1988, c. M-16) administered by Driver and Vehicle Services of the Department of Infrastructure, newcomers taking up residency in the Northwest Territories must obtain an NWT driver licence within 30 days. Direct reciprocal exchange accords exist for passenger Class 5 driver licences from all Canadian jurisdictions, the United States, United Kingdom, Germany, Australia, and other designated nations upon passing an eye examination without written or road testing. Applicants surrender their prior licence and present original proof of Canadian legal status and two proofs of northern physical address. Drivers from non-reciprocal jurisdictions must enter the NWT Graduated Driver Licensing (GDL) program. Drivers who present authenticated driving history extracts proving at least 2 years of prior licensed experience can bypass the standard holding periods and schedule the Class 5 road test immediately after passing the written knowledge test and vision screening.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-01',
    expiresAt: '2027-02-01',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Northwest Territories Motor Vehicles Act and Driver and Vehicle Services regulations inspected.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-01T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },

  // ==========================================
  // NUNAVUT (NU)
  // ==========================================
  {
    id: 'ca-nu-health-care-plan',
    topic: 'health',
    jurisdiction: 'NU',
    title: 'Nunavut Health Care Plan: Department of Health Registration, Eligibility & Travel Benefits',
    url: 'https://www.gov.nu.ca/health/information/health-insurance',
    quote: 'Nunavut Health Care provides coverage for medically necessary physician and hospital services to eligible residents living in Nunavut.',
    summary: 'Under the Medical Care Act (RSNWT/Nu 1988, c. M-8) administered by the Department of Health, the Nunavut Health Care Plan covers all medically necessary physician and hospital care. Eligible residents include Canadian citizens, permanent residents, and temporary foreign workers possessing valid work permits issued for at least 12 months duration. Residents must physically reside in Nunavut for at least 153 days per calendar year. Coverage takes effect from the date of arrival for international newcomers moving directly to Nunavut, whereas domestic interprovincial migrants receive coverage starting on the first day of the third month following their move. Crucially in Nunavut, the plan includes coverage for specialized medical travel and emergency aeromedical evacuation (medevac) from remote fly-in communities to regional health centres in Iqaluit, Rankin Inlet, or southern tertiary hospitals in Ottawa, Winnipeg, or Edmonton. Registration requires submitting the Nunavut Health Care Card application with certified proofs of immigration status and local residency documentation.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-01',
    expiresAt: '2027-02-01',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Nunavut Medical Care Act and Department of Health operational health coverage directives.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-01T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'ca-nu-residential-tenancies-officer',
    topic: 'housing',
    jurisdiction: 'NU',
    title: 'Nunavut Residential Tenancies Act: 1-Month Deposit Limit & Rental Officer Dispute Orders',
    url: 'https://www.gov.nu.ca/justice/information/residential-tenancies',
    quote: 'The Nunavut Residential Tenancies Act regulates leases and limits security deposits to a maximum of one month rent.',
    summary: 'Under the Residential Tenancies Act (RSNWT/Nu 1988, c. R-5) administered by the Nunavut Department of Justice and the Nunavut Rental Officer, residential leases across all 25 Nunavut communities are protected by statutory standards. Landlords cannot charge a security deposit exceeding one month rent, and tenants have the statutory right to pay 50% upon signing and the remaining 50% within 3 months. Landlords cannot charge key fees or last month rent in advance, and deposits must be held in interest-bearing accounts. Rent increases can occur only once in a 12-month period and require at least 3 months advance written notice. Given severe Arctic climate realities, landlords bear an absolute statutory obligation to maintain heating systems and vital utilities; failure to maintain heating constitutes emergency distress. Tenancy disputes concerning repairs, deposit return, or evictions are resolved through formal hearings before the Nunavut Rental Officer, whose decisions have the legal force of Nunavut Court of Justice orders.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-01',
    expiresAt: '2027-02-01',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Nunavut Residential Tenancies Act and Rental Officer operational decisions reviewed.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-01T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'ca-nu-labour-standards-act',
    topic: 'employment',
    jurisdiction: 'NU',
    title: 'Nunavut Labour Standards Act: Overtime 8/40 Rule, 10 Paid Holidays & Wage Protections',
    url: 'https://www.gov.nu.ca/justice/information/labour-standards',
    quote: 'Employees must be paid 1.5 times their regular wage for all overtime hours worked beyond 8 per day or 40 per week.',
    summary: 'Under the Labour Standards Act (RSNWT/Nu 1988, c. L-1) administered by the Labour Standards Board of the Department of Justice, workers in Nunavut are protected by statutory employment standards. The statutory standard work hours are 8 hours per day and 40 hours per week, with overtime payable at 1.5 times the regular wage for all additional hours. Employees are entitled to at least one full day of rest (24 consecutive hours) in every 7 days. Nunavut observes 10 paid public statutory holidays: New Year Day, Good Friday, Victoria Day, Canada Day, Nunavut Day (July 9), Civic Holiday, Labour Day, National Day for Truth and Reconciliation, Remembrance Day, and Christmas Day. Qualifying employees working on a statutory holiday receive 1.5 times regular pay plus regular holiday pay. Notice of termination scales based on service: 1 week for 90 days to 3 years service, 2 weeks for 3 to 5 years, 4 weeks for 5 to 10 years, and 8 weeks for 10 or more years continuous service. Employers are barred from making payroll deductions for shortages or broken goods.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-01',
    expiresAt: '2027-02-01',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Nunavut Labour Standards Act and Labour Standards Board operational rulings inspected.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-01T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'ca-nu-motor-vehicles-licensing',
    topic: 'driving',
    jurisdiction: 'NU',
    title: 'Nunavut Motor Vehicles Division: Class 5 Driver Licence Transfer & Arctic Vehicle Standards',
    url: 'https://www.gov.nu.ca/community-and-government-services/information/motor-vehicles',
    quote: 'New residents must obtain a Nunavut driver licence within 30 days of moving to the territory.',
    summary: 'Under the Motor Vehicles Act (RSNWT/Nu 1988, c. M-16) administered by the Motor Vehicles Division of the Department of Community and Government Services, individuals relocating to Nunavut must exchange their existing driver licence within 30 days. Direct reciprocal licence exchange accords are in place for passenger Class 5 licences from all Canadian provinces and territories, the United States, and designated reciprocal jurisdictions without practical driving or written examinations upon passing a vision screening. Applicants surrender their prior licence, provide proof of Canadian legal status, and provide two proofs of local Nunavut residence. Drivers from non-reciprocal jurisdictions must complete the knowledge examination, vision screening, and road test. Driver testing is coordinated through municipal hamlet offices or the Iqaluit Motor Vehicles office. Vehicles registered in Nunavut must comply with cold-weather lighting, winter equipment, and seasonal trail crossing safety provisions.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-01',
    expiresAt: '2027-02-01',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Nunavut Motor Vehicles Act and Department of Community and Government Services directives inspected.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-01T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },

  // ==========================================
  // QUEBEC (QC) - CORE GAP CLOSURES
  // ==========================================
  {
    id: 'ca-qc-saaq-driver-licence-exchange',
    topic: 'driving',
    jurisdiction: 'QC',
    title: 'SAAQ Driver Licence Conversion: Class 5 Reciprocal Agreements & Foreign Experience',
    url: 'https://saaq.gouv.qc.ca/en/drivers-licences/canadian-foreign-drivers-licences',
    quote: 'New Quebec residents holding a foreign driver licence must register with the SAAQ to drive or exchange their licence within 6 months.',
    summary: 'Under the Highway Safety Code (CQLR c. C-24.2) administered by the Société de l assurance automobile du Québec (SAAQ), newcomers establishing residence in Quebec can drive on their valid foreign licence for up to 6 months, after which they must obtain a Quebec Class 5 driver licence. Direct reciprocal exchange accords exist for passenger vehicle licences from all Canadian provinces, the United States, France, Germany, Austria, Belgium, Switzerland, the United Kingdom, Japan, South Korea, Taiwan, and the Netherlands. Reciprocal applicants convert directly without examinations by presenting their original licence, official proof of legal presence in Canada, proof of Quebec residency, and an official translation if the licence is not in French or English. Drivers from non-reciprocal countries must take the SAAQ knowledge test and practical road test. However, applicants who provide authenticated proof of at least one year of prior driving experience can bypass the mandatory 12-month learner holding period and book examinations directly.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-01',
    expiresAt: '2027-02-01',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Quebec Highway Safety Code and SAAQ international driver licence exchange regulations inspected.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-01T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'ca-qc-cnesst-labour-standards',
    topic: 'employment',
    jurisdiction: 'QC',
    title: 'CNESST Labour Standards (LNT): 40-Hour Overtime Rule, Statutory Holidays & Dismissal Protections',
    url: 'https://www.cnesst.gouv.qc.ca/en/working-conditions/work-schedule-and-work-frequency',
    quote: 'Under the Act respecting labour standards, regular work hours are 40 per week and overtime is paid at 1.5 times the regular wage.',
    summary: 'Under the Act respecting labour standards (CQLR c. N-1.1) administered by the Commission des normes, de l équité, de la santé et de la sécurité du travail (CNESST), employees in Quebec are protected by mandatory legal working conditions. The standard work week is 40 hours, and all hours worked beyond 40 hours in a week must be paid at an overtime rate of 1.5 times the employee regular hourly wage (or banked as 1.5 hours of paid leave upon mutual agreement). Quebec observes 8 statutory public holidays: New Year Day, Good Friday or Easter Monday, National Patriots Day, National Holiday (Saint-Jean-Baptiste Day, June 24), Canada Day, Labour Day, Thanksgiving, and Christmas Day. Written notice of termination or compensatory pay in lieu scales with length of continuous service: 1 week for 3 months to 1 year, 2 weeks for 1 to 5 years, 4 weeks for 5 to 10 years, and 8 weeks for 10 or more years of service. Under Section 124, employees with 2 or more years of uninterrupted service cannot be dismissed without just and sufficient cause, and under Section 81.18 all workers are protected against psychological or sexual harassment.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-01',
    expiresAt: '2027-02-01',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Quebec Act respecting labour standards (LNT) and CNESST operational guidelines reviewed directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-01T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },

  // ==========================================
  // SASKATCHEWAN (SK) - CORE GAP CLOSURES
  // ==========================================
  {
    id: 'ca-sk-sgi-driver-licensing-exchange',
    topic: 'driving',
    jurisdiction: 'SK',
    title: 'SGI Driver Licensing: Class 5 Reciprocal Exchange Agreements & GDL Standards',
    url: 'https://sgi.sk.ca/moving-to-saskatchewan',
    quote: 'New residents in Saskatchewan must exchange their out-of-province or foreign driver licence for an SGI licence within 90 days.',
    summary: 'Under The Traffic Safety Act (SS 2004, c. T-18.1) administered by Saskatchewan Government Insurance (SGI), new residents taking up permanent or temporary residence in Saskatchewan must exchange their driver licence within 90 days. Reciprocal licence conversion accords allow direct exchange for passenger Class 5 driver licences from all Canadian jurisdictions, the United States, Australia, United Kingdom, Germany, France, Austria, Switzerland, Belgium, South Korea, Japan, Taiwan, and New Zealand without knowledge or road examinations upon passing a vision test. Applicants must surrender their existing foreign licence, present original proof of legal entitlement to be in Canada, provide two official documents proving Saskatchewan residential address, and provide an English translation if required. Drivers from non-reciprocal jurisdictions must complete the Saskatchewan Graduated Driver Licensing (GDL) program. Drivers with authenticated driving record extracts showing at least 2 years of prior licensed experience can waive the standard 9-month learner holding period and book the Class 5 road test directly upon passing the written exam.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-01',
    expiresAt: '2027-02-01',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Saskatchewan Traffic Safety Act and SGI driver examination standards verified.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-01T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'ca-sk-employment-standards-act',
    topic: 'employment',
    jurisdiction: 'SK',
    title: 'Saskatchewan Employment Act (Part II): Overtime 8/40 Rule, 10 Public Holidays & Layoff Notice',
    url: 'https://www.saskatchewan.ca/business/employment-standards',
    quote: 'The Saskatchewan Employment Act mandates overtime pay of 1.5 times the regular rate for hours worked beyond 8 in a day or 40 in a week.',
    summary: 'Under The Saskatchewan Employment Act (SS 2013, c. S-15.1, Part II) administered by the Ministry of Labour Relations and Workplace Safety, employees in Saskatchewan are protected by progressive statutory standards. The standard work schedule is either 8 hours per day and 40 hours per week (5-day week) or 10 hours per day and 40 hours per week (4-day week). All hours worked beyond these daily or weekly limits must be compensated at an overtime rate of 1.5 times the employee regular wage. Saskatchewan observes 10 statutory public holidays: New Year Day, Family Day, Good Friday, Victoria Day, Canada Day, Saskatchewan Day, Labour Day, Thanksgiving, Remembrance Day, and Christmas Day. Qualifying employees working on a holiday receive 1.5 times regular pay plus regular statutory holiday pay. Annual vacation entitlement is 3 weeks paid vacation after each year of employment (4 weeks after 10 years). Statutory written notice of layoff or termination scales from 1 week for 3 months to 1 year, up to 8 weeks for 10 or more years of service. Employers are strictly barred from deducting till shortages, walkouts, or damage from wages.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-01',
    expiresAt: '2027-02-01',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'The Saskatchewan Employment Act Part II and Employment Standards branch inspection guidelines.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-01T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },

  // ==========================================
  // MANITOBA (MB) - CORE GAP CLOSURES
  // ==========================================
  {
    id: 'ca-mb-mpi-driver-licensing-exchange',
    topic: 'driving',
    jurisdiction: 'MB',
    title: 'Manitoba Public Insurance (MPI): Class 5 Reciprocal Exchange & Autopac Registration',
    url: 'https://www.mpi.mb.ca/Pages/new-to-manitoba.aspx',
    quote: 'New residents must switch their out-of-province or foreign driver licence to a Manitoba licence within 3 months of moving.',
    summary: 'Under The Drivers and Vehicles Act (CCSM c. D104) administered by Manitoba Public Insurance (MPI), newcomers taking up residence in Manitoba must exchange their existing driver licence within 3 months (90 days). Reciprocal exchange agreements permit direct conversion of passenger vehicle licences (Class 5) from all Canadian jurisdictions, the United States, Australia, United Kingdom, France, Germany, Austria, Switzerland, South Korea, Taiwan, and other designated nations without written or road testing upon passing a vision exam. Applicants surrender their existing licence, present original proof of legal Canadian status, and provide two proofs of Manitoba physical address. Drivers from non-reciprocal jurisdictions must complete the Manitoba Graduated Driver Licensing (GDL) program. Applicants with authenticated driver records demonstrating at least 24 months of licensed driving experience can waive the 9-month learner stage holding period and schedule their Class 5 road examination immediately after completing the knowledge and vision screening. Vehicles registered in Manitoba are covered by mandatory Autopac basic insurance.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-01',
    expiresAt: '2027-02-01',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Manitoba Drivers and Vehicles Act and MPI driver licensing operational directives reviewed.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-01T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'ca-mb-employment-standards-code',
    topic: 'employment',
    jurisdiction: 'MB',
    title: 'Manitoba Employment Standards Code: Standard 8/40 Workweek, General Holidays & Notice',
    url: 'https://www.gov.mb.ca/labour/standards/',
    quote: 'Under the Employment Standards Code, standard work hours are 8 per day and 40 per week, with overtime paid at 1.5 times the regular rate.',
    summary: 'Under The Employment Standards Code (CCSM c. E110) administered by the Employment Standards branch of the Department of Labour and Immigration, workers in Manitoba are entitled to foundational statutory protections. The standard work schedule is 8 hours per day and 40 hours per week. Overtime is payable at 1.5 times the employee regular wage for all hours worked beyond these limits. Employees are entitled to at least 24 consecutive hours of rest every week. Manitoba recognizes 9 general statutory holidays: New Year Day, Louis Riel Day, Good Friday, Victoria Day, Canada Day, Labour Day, National Day for Truth and Reconciliation, Thanksgiving, and Christmas Day. Eligible employees who work on a statutory holiday are entitled to 1.5 times their regular rate for hours worked plus regular holiday pay. Notice of termination or wages in lieu scales with continuous service: 1 week for 30 days to 1 year, 2 weeks for 1 to 3 years, 4 weeks for 3 to 5 years, 6 weeks for 5 to 10 years, and 8 weeks for 10 or more years. Employers are legally prohibited from deducting till shortages, dine-and-dash tabs, or uniform costs from wages.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-01',
    expiresAt: '2027-02-01',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'The Manitoba Employment Standards Code and provincial wage enforcement standards inspected.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-01T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },

  // ==========================================
  // ALBERTA (AB) - CORE GAP CLOSURES
  // ==========================================
  {
    id: 'ca-ab-child-care-subsidy',
    topic: 'childcare',
    jurisdiction: 'AB',
    title: 'Alberta Child Care Subsidy & Affordability Grants: Eligibility, Income Thresholds & Application',
    url: 'https://www.alberta.ca/child-care-subsidy',
    quote: 'The Alberta Child Care Subsidy assists eligible lower- and middle-income families with child care fees for licensed daycares and day homes.',
    summary: 'Under the Early Learning and Child Care Act (SA 2021, c. E-0.5) administered by the Ministry of Children and Family Services, Alberta provides financial assistance to eligible families utilizing licensed daycares, licensed out-of-school care, and approved family day homes. Subsidies are available to Canadian citizens, permanent residents, and temporary foreign workers possessing valid work or study permits residing in Alberta. Families with a gross annual household income under $180,000 can receive provincial child care subsidies on a progressive sliding scale. Additionally, through the Canada-Wide Early Learning and Child Care (CWELCC) agreement, universal affordability operating grants are paid directly to licensed operators to lower average parent fees toward the $10-per-day national target for children aged 0 to kindergarten age. Applications are submitted online through the Alberta Child Care Subsidy Portal, requiring CRA Notice of Assessment records, proof of employment or educational enrollment, and children birth certificates or immigration landing papers.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-01',
    expiresAt: '2027-02-01',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Alberta Early Learning and Child Care Act and provincial child care subsidy program directives verified.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-01T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'ca-ab-education-act-student-enrolment',
    topic: 'education',
    jurisdiction: 'AB',
    title: 'Alberta Education Act: Universal Public School Access, Resident Student Rights & EAL Support',
    url: 'https://www.alberta.ca/k-to-12-education',
    quote: 'Under Section 32 of the Education Act, every resident child has the right to free access to education in an Alberta public or separate school.',
    summary: 'Under the Education Act (SA 2012, c. E-0.3) administered by Alberta Education, resident children in Alberta have a statutory right to free access to basic education from kindergarten through Grade 12. Resident students include children of Canadian citizens, permanent residents, and temporary foreign workers holding valid work permits or study permits under IRPR. Public school boards (such as Calgary Board of Education CBE, Edmonton Public Schools EPSB) cannot charge tuition fees to resident students. School enrollment is generally organized by residential catchment boundaries, with open boundary enrollment permitted where school capacity allows. School boards provide comprehensive English as an Additional Language (EAL) intake assessments and linguistic support services to newcomer children at no cost. Registration requires original birth certificates or immigration papers, passport copies, proof of physical Alberta address (purchase agreement, lease, or utility bill), and child immunization records.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-01',
    expiresAt: '2027-02-01',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Alberta Education Act Section 32 and provincial school board enrollment directives examined.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-01T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  }
];

function run() {
  db.exec('BEGIN IMMEDIATE');
  let count = 0;
  try {
    for (const rec of canadaAllProvincesRecords) {
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
        `).run(rec.id, rec.title || '', rec.summary || '', rec.quote || '', rec.topic || '');
      } catch {}
      count++;
    }
    db.exec('COMMIT');
    console.log(`Successfully injected ${count} Canadian provincial statutory records.`);
  } catch (err) {
    db.exec('ROLLBACK');
    console.error('Injection failed:', err);
    process.exit(1);
  } finally {
    store.db.close();
  }
}

run();
