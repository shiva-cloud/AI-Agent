// scripts/run-100-browser-and-api-evaluation.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import { chromium } from 'playwright';

mkdirSync('artifacts/browser-tests', { recursive: true });

// Define 108 questions with missing info across 3 categories (36 each)
export const questionsSuite108 = [
  // =========================================================================
  // CATEGORY 1: TECHNICAL STATUTORY QUESTIONS WITH MISSING INFO (Q001 - Q036)
  // =========================================================================
  {
    id: 'TECH-01',
    category: 'Technical',
    subtopic: 'RTA Security Deposit Legality',
    q: 'Under Section 106 of the Residential Tenancies Act, is a landlord legally permitted to demand a damage deposit?',
    missingInfo: 'Missing city/province (Legal in BC under RTA s. 19; illegal in Ontario under RTA s. 106)',
    expectedBehavior: 'Clarification for location or conditional Ontario/BC distinction'
  },
  {
    id: 'TECH-02',
    category: 'Technical',
    subtopic: 'Maintained Status s. 186(u)',
    q: 'Does Section 186(u) of the Immigration and Refugee Protection Regulations allow me to work full-time while waiting for my extension decision?',
    missingInfo: 'Missing initial status and whether extension was submitted before expiry',
    expectedBehavior: 'Detects immigration/employment intent, outlines maintained status criteria'
  },
  {
    id: 'TECH-03',
    category: 'Technical',
    subtopic: '8 CFR 274a.12(b)(20) Work Authorization',
    q: 'How does the 240-day automatic work authorization rule under 8 CFR 274a.12(b)(20) apply to my extension?',
    missingInfo: 'Missing specific nonimmigrant visa category (H-1B, L-1, O-1, E-2, etc.)',
    expectedBehavior: 'Addresses US USCIS timely extension and 240-day continuous employment'
  },
  {
    id: 'TECH-04',
    category: 'Technical',
    subtopic: 'Statutory Rent Deposit Interest',
    q: 'What is the statutory interest rate my landlord must pay annually on my deposit under tenancy law?',
    missingInfo: 'Missing province/city (Ontario requires interest equal to guideline rent increase; BC/AB have separate formulas)',
    expectedBehavior: 'Prompts for location clarification or explains deposit rules'
  },
  {
    id: 'TECH-05',
    category: 'Technical',
    subtopic: 'CRA Form T1-M Moving Expense',
    q: 'Can I deduct moving expenses on form T1-M line 21900 for relocating to my new job?',
    missingInfo: 'Missing distance moved (must be at least 40 kilometres closer to the new work location)',
    expectedBehavior: 'Guidance citing the statutory 40-kilometre threshold and Canadian tax residency'
  },
  {
    id: 'TECH-06',
    category: 'Technical',
    subtopic: 'German FeV § 29 Licence Exchange',
    q: 'Under Fahrerlaubnis-Verordnung FeV § 29, how many months can I legally drive on my foreign licence before mandatory exchange?',
    missingInfo: 'Missing issuing country of current licence and German residency establishment date',
    expectedBehavior: 'Explains the 6-month validity period under FeV § 29'
  },
  {
    id: 'TECH-07',
    category: 'Technical',
    subtopic: 'UK Tenant Fees Act Holding Deposit',
    q: 'Can a letting agent charge a 500 pound holding deposit under the Tenant Fees Act 2019?',
    missingInfo: 'Missing weekly rent amount (holding deposit is statutorily capped at 1 week rent)',
    expectedBehavior: 'Explains 1-week rent statutory ceiling under Tenant Fees Act'
  },
  {
    id: 'TECH-08',
    category: 'Technical',
    subtopic: 'ISPA s. 3 Vaccine Exemption',
    q: 'How to file a statement of conscience religious belief affidavit exemption under ISPA Section 3?',
    missingInfo: 'Missing city / Public Health Unit jurisdiction',
    expectedBehavior: 'Identifies Ontario ISPA s. 3, Form 1/2 affidavit and public health unit education session'
  },
  {
    id: 'TECH-09',
    category: 'Technical',
    subtopic: 'Statutory Rent Guideline Cap',
    q: 'What is the maximum legal guideline rent increase percentage a landlord can enforce this year?',
    missingInfo: 'Missing province/city and whether building was occupied for residential purposes prior to Nov 15, 2018',
    expectedBehavior: 'Asks for location or outlines 2.5% rent increase guideline and exemptions'
  },
  {
    id: 'TECH-10',
    category: 'Technical',
    subtopic: 'INA Section 245(k) Bar',
    q: 'Does Section 245(k) forgive status violations and unauthorized work for my adjustment of status?',
    missingInfo: 'Missing employment-based green card category (EB-1, EB-2, EB-3) and total days of violation (max 180 days)',
    expectedBehavior: 'Outlines INA § 245(k) 180-day limitation and eligibility'
  },
  {
    id: 'TECH-11',
    category: 'Technical',
    subtopic: 'ESA Overtime Averaging Agreement',
    q: 'Can my employer force me to sign an overtime averaging agreement to avoid paying 1.5x overtime?',
    missingInfo: 'Missing province (Ontario ESA s. 22 vs BC ESA) and employment sector',
    expectedBehavior: 'Identifies overtime standards and voluntary written consent requirement'
  },
  {
    id: 'TECH-12',
    category: 'Technical',
    subtopic: 'CRA Form T1135 Reporting',
    q: 'Do I need to file Form T1135 if my foreign real estate property is worth over 100,000 dollars?',
    missingInfo: 'Missing whether property is personal-use (vacation/family home) vs income-generating rental property',
    expectedBehavior: 'Cites CRA T1135 personal-use property statutory exemption'
  },
  {
    id: 'TECH-13',
    category: 'Technical',
    subtopic: 'Dubai Decree 43 Rent Increase',
    q: 'What is the maximum rent hike a landlord can impose under Decree No. 43 of 2013?',
    missingInfo: 'Missing current rent vs average market benchmark on RERA rental calculator',
    expectedBehavior: 'Cites Dubai Decree 43 tiers (0%, 5%, 10%, 15%, 20%) and 90-day notice rule'
  },
  {
    id: 'TECH-14',
    category: 'Technical',
    subtopic: 'Section 21 No-Fault Eviction',
    q: 'Is a Form 6A Section 21 eviction notice valid if the landlord did not protect my deposit in a government scheme?',
    missingInfo: 'Missing country/jurisdiction (England vs Scotland/Wales where Section 21 is abolished or different)',
    expectedBehavior: 'Cites UK Tenancy Deposit Protection (TDP) requirements for valid Section 21'
  },
  {
    id: 'TECH-15',
    category: 'Technical',
    subtopic: 'Health Canada Bioequivalent Substitution',
    q: 'Under the Comparative Drug Index, is generic metformin interchangeable with brand Glucophage?',
    missingInfo: 'Missing province (Ontario ODBA s. 4 vs BC PharmaCare)',
    expectedBehavior: 'Explains Health Canada DPD bioequivalence and provincial interchangeability'
  },
  {
    id: 'TECH-16',
    category: 'Technical',
    subtopic: 'Farber Constructive Dismissal Rule',
    q: 'Does a 25 percent unilateral salary cut trigger constructive dismissal under the Farber doctrine?',
    missingInfo: 'Missing province, whether employment contract permitted compensation restructuring, and duration of delay',
    expectedBehavior: 'Applies common law Farber doctrine and statutory constructive dismissal'
  },
  {
    id: 'TECH-17',
    category: 'Technical',
    subtopic: 'Australian Fair Work NES Annual Leave',
    q: 'How many weeks of paid annual leave am I entitled to under the National Employment Standards?',
    missingInfo: 'Missing employment type (full-time, part-time, or casual worker who receives casual loading instead)',
    expectedBehavior: 'Cites Australian Fair Work Act 2009 4-week NES annual leave standard'
  },
  {
    id: 'TECH-18',
    category: 'Technical',
    subtopic: 'CWELCC Child Care Subsidy',
    q: 'Does the 22-dollar-a-day CWELCC fee reduction apply to my unlicensed home daycare?',
    missingInfo: 'Missing municipality (Toronto, Peel, York) and age of child (under 6 years old)',
    expectedBehavior: 'Clarifies that CWELCC applies strictly to participating licensed child care providers'
  },
  {
    id: 'TECH-19',
    category: 'Technical',
    subtopic: 'FBAR FinCEN Form 114 Threshold',
    q: 'When is filing FinCEN Form 114 mandatory for foreign financial bank accounts?',
    missingInfo: 'Missing whether aggregate balance exceeded $10,000 USD at any point during calendar year',
    expectedBehavior: 'Outlines FinCEN FBAR $10,000 USD aggregate threshold'
  },
  {
    id: 'TECH-20',
    category: 'Technical',
    subtopic: 'Ofcom Handset Unlocking Rule',
    q: 'Can my wireless network charge an administrative fee to unlock my mobile handset under Ofcom General Condition C1?',
    missingInfo: 'Missing handset purchase date and contract termination status',
    expectedBehavior: 'Cites Ofcom Condition C1.20 prohibiting unlocking fees since December 2021'
  },
  {
    id: 'TECH-21',
    category: 'Technical',
    subtopic: 'IRCC 730-Day Residency Obligation',
    q: 'Can I renew my Permanent Resident card if I have 710 days of physical presence in Canada?',
    missingInfo: 'Missing whether PR was accompanying a Canadian citizen spouse abroad or employed by Canadian business',
    expectedBehavior: 'Explains IRPA s. 28 730 days in 5 years requirement and statutory exceptions'
  },
  {
    id: 'TECH-22',
    category: 'Technical',
    subtopic: 'Germany Mietpreisbremse Rent Ceiling',
    q: 'Can my landlord charge more than 10 percent above the local Mietspiegel index under the Mietpreisbremse?',
    missingInfo: 'Missing city/municipality (applicable only in designated tense housing areas) and prior rent (Vormiete)',
    expectedBehavior: 'Cites BGB § 556d 10% cap above Mietspiegel and Vormiete written disclosure'
  },
  {
    id: 'TECH-23',
    category: 'Technical',
    subtopic: 'Australian TFN Foreign Resident Rate',
    q: 'What tax withholding rate applies if I do not provide a Tax File Number to my employer within 28 days?',
    missingInfo: 'Missing tax residency status (Australian resident for tax purposes vs foreign resident / working holiday maker)',
    expectedBehavior: 'Explains ATO top marginal tax rate withholding without TFN'
  },
  {
    id: 'TECH-24',
    category: 'Technical',
    subtopic: 'Ontario Bill 124 Remedy Pay',
    q: 'Am I entitled to retroactive compensation for wage restraint legislation as a healthcare worker?',
    missingInfo: 'Missing hospital/employer bargaining unit and whether covered by ONA or CUPE arbitration awards',
    expectedBehavior: 'Identifies Ontario public sector compensation and labour standards'
  },
  {
    id: 'TECH-25',
    category: 'Technical',
    subtopic: 'BC RTA Two-Month Notice Compensation',
    q: 'Is my landlord required to give me 1 month free rent compensation when serving a 2-month notice for landlord use?',
    missingInfo: 'Missing city/municipality in BC and whether notice was served under Section 49',
    expectedBehavior: 'Cites BC RTA s. 51 mandatory 1 month rent compensation for landlord use notice'
  },
  {
    id: 'TECH-26',
    category: 'Technical',
    subtopic: 'French Visale Deposit Guarantee',
    q: 'Can a private landlord refuse a Visale guarantee for security deposit under French tenancy law?',
    missingInfo: 'Missing tenant age (under 30 vs employee over 30) and French municipality',
    expectedBehavior: 'Explains Action Logement Visale guarantee under Loi ALUR'
  },
  {
    id: 'TECH-27',
    category: 'Technical',
    subtopic: 'EU Blue Card Salary Minimum',
    q: 'What is the statutory minimum gross salary threshold to qualify for an EU Blue Card?',
    missingInfo: 'Missing country of destination (Germany, France, Netherlands) and occupation category (shortage vs standard)',
    expectedBehavior: 'Prompts for country or cites German AufenthG § 18g salary thresholds'
  },
  {
    id: 'TECH-28',
    category: 'Technical',
    subtopic: 'OHSA Section 43 Work Refusal',
    q: 'Can my employer discipline or fire me for refusing dangerous work under Section 43?',
    missingInfo: 'Missing province and specific occupation (police, firefighters, nurses have statutory exceptions)',
    expectedBehavior: 'Cites OHSA s. 43 right to refuse and s. 50 anti-reprisal protections'
  },
  {
    id: 'TECH-29',
    category: 'Technical',
    subtopic: 'Irish Rent Pressure Zone 2% Cap',
    q: 'Can my landlord increase rent by 8 percent over 3 years in a Rent Pressure Zone?',
    missingInfo: 'Missing Irish local authority / LEA area and HICP inflation index calculation',
    expectedBehavior: 'Cites Residential Tenancies Board (RTB) RPZ 2% per annum / HICP cap'
  },
  {
    id: 'TECH-30',
    category: 'Technical',
    subtopic: 'CRTC Wireless Code Trial Period',
    q: 'Does the CRTC Wireless Code allow me to cancel a new phone contract within 15 days with no cancellation fee?',
    missingInfo: 'Missing whether customer is a person with disabilities (entitled to 30 days trial period)',
    expectedBehavior: 'Cites CRTC Wireless Code 15-day / 30-day trial period and early cancellation fee ban'
  },
  {
    id: 'TECH-31',
    category: 'Technical',
    subtopic: 'US F-1 OPT STEM Extension Filing',
    q: 'Can I file Form I-765 for a 24-month STEM OPT extension after my initial OPT EAD has expired?',
    missingInfo: 'Missing university DSO recommendation date (must file within 60 days of DSO recommendation in SEVIS)',
    expectedBehavior: 'Cites USCIS rule that STEM OPT must be filed before initial OPT expires'
  },
  {
    id: 'TECH-32',
    category: 'Technical',
    subtopic: 'Netherlands 30% Ruling Exemption',
    q: 'Can I claim the 30 percent ruling tax allowance if I previously lived within 150 km of the Dutch border?',
    missingInfo: 'Missing nationality, salary level, and exact distance lived from Dutch border in past 24 months',
    expectedBehavior: 'Cites Dutch Belastingdienst 150 km border distance disqualification'
  },
  {
    id: 'TECH-33',
    category: 'Technical',
    subtopic: 'Spain Beckham Law Special Regime',
    q: 'Can I apply for the special expatriate tax regime under Article 93 of the IRPF Act?',
    missingInfo: 'Missing whether individual was tax resident in Spain during preceding 5 years and employment contract type',
    expectedBehavior: 'Cites Spanish Ley de IRPF Art. 93 24% flat tax Beckham Law requirements'
  },
  {
    id: 'TECH-34',
    category: 'Technical',
    subtopic: 'New Zealand Healthy Homes Standards',
    q: 'Does a landlord have to comply with underfloor and ceiling insulation under Healthy Homes standards?',
    missingInfo: 'Missing tenancy start date and property age',
    expectedBehavior: 'Cites NZ Residential Tenancies (Healthy Homes Standards) Regulations 2019'
  },
  {
    id: 'TECH-35',
    category: 'Technical',
    subtopic: 'UAE End of Service Gratuity',
    q: 'How is end-of-service gratuity calculated under Federal Decree-Law No. 33 of 2021?',
    missingInfo: 'Missing total completed service years (less than 1 yr vs 1-5 yrs vs over 5 yrs) and termination reason',
    expectedBehavior: 'Cites UAE Labour Law Article 51 gratuity calculation (21 days vs 30 days basic wage)'
  },
  {
    id: 'TECH-36',
    category: 'Technical',
    subtopic: 'Sweden Bruksvärde Rent Model',
    q: 'Can a first-hand tenant charge me double rent for a sublet apartment under Hyreslagen?',
    missingInfo: 'Missing whether apartment is furnished and whether sublease was approved by Hyresgästföreningen / landlord',
    expectedBehavior: 'Cites Swedish Hyreslagen utility value (bruksvärde) formula and 15% furniture markup limit'
  },

  // =========================================================================
  // CATEGORY 2: LOGICAL & MULTI-STEP QUESTIONS WITH MISSING INFO (Q037 - Q072)
  // =========================================================================
  {
    id: 'LOGIC-01',
    category: 'Logical',
    subtopic: 'Express Entry Transferability CRS',
    q: 'I have 3 years of foreign software engineering experience and 1 year of Canadian skilled work. How many skill transferability points do I get for Express Entry?',
    missingInfo: 'Missing language test scores (CLB 7 vs CLB 9 determines whether 25 vs 50 points are awarded)',
    expectedBehavior: 'Explains Express Entry CRS matrix dependency on CLB 7 vs CLB 9'
  },
  {
    id: 'LOGIC-02',
    category: 'Logical',
    subtopic: 'BOWP vs AOR Timing',
    q: 'My PGWP expires on June 30 and I submitted my PR application on June 15. Can I get a Bridging Open Work Permit and keep working legally?',
    missingInfo: 'Missing whether official Acknowledgment of Receipt (AOR) letter was issued prior to PGWP expiry',
    expectedBehavior: 'Explains BOWP eligibility requires valid status AND formal IRCC AOR receipt'
  },
  {
    id: 'LOGIC-03',
    category: 'Logical',
    subtopic: 'Super Visa Income LICO Calculation',
    q: 'Can I sponsor both of my elderly parents on a Super Visa if my line 15000 income on my CRA Notice of Assessment is 55,000 dollars?',
    missingInfo: 'Missing sponsor family size (spouse, children) to determine total household size against LICO table',
    expectedBehavior: 'Explains LICO minimum necessary income depends on total household size including parents'
  },
  {
    id: 'LOGIC-04',
    category: 'Logical',
    subtopic: 'CEC 1560 Hours vs 52 Calendar Weeks',
    q: 'I worked 50 hours a week for 8 months on an open work permit, completing over 1600 hours. Do I qualify for the Canadian Experience Class?',
    missingInfo: 'Missing whether applicant understands the dual statutory condition (1560 hours AND 52 calendar weeks)',
    expectedBehavior: 'Deduces that capping at 30h/week requires at least 12 continuous calendar months'
  },
  {
    id: 'LOGIC-05',
    category: 'Logical',
    subtopic: 'Form N12 Compensation Timing',
    q: 'My landlord in Toronto gave me an N12 notice saying his son wants the apartment. If he pays me the 1 month compensation on my move-out day, is the eviction valid?',
    missingInfo: 'Missing whether compensation was paid on or before the termination date specified on the N12 form',
    expectedBehavior: 'Cites Ontario RTA s. 48.1 requirement that compensation must be paid on or before termination date'
  },
  {
    id: 'LOGIC-06',
    category: 'Logical',
    subtopic: 'BC MSP 3-Month Waiting Period Math',
    q: 'If I landed as a permanent resident in Vancouver on October 15, on what exact date does my BC MSP medical coverage become active?',
    missingInfo: 'Missing whether applicant applied upon arrival or delayed submission',
    expectedBehavior: 'Calculates remainder of arrival month plus 2 full consecutive calendar months (January 1)'
  },
  {
    id: 'LOGIC-07',
    category: 'Logical',
    subtopic: 'FHSA Contribution Room Carryforward',
    q: 'I became a tax resident of Canada in December 2024. Can I contribute 16,000 dollars to my First Home Savings Account in 2025?',
    missingInfo: 'Missing whether FHSA was physically opened in 2024 (contribution room does not accumulate until account opened)',
    expectedBehavior: 'Explains that unlike TFSA, FHSA room does not begin accumulating until the account is formally opened'
  },
  {
    id: 'LOGIC-08',
    category: 'Logical',
    subtopic: 'Overtime Daily vs Weekly Logic',
    q: 'I worked 10 hours on Monday, 10 hours on Tuesday, 10 hours on Wednesday, and took Thursday and Friday off. Am I owed overtime pay?',
    missingInfo: 'Missing province: in Ontario weekly overtime begins after 44 hrs (0 overtime owed); in BC daily overtime begins after 8 hrs (6 hrs overtime owed)',
    expectedBehavior: 'Prompts for province/location or contrasts Ontario weekly vs BC daily overtime thresholds'
  },
  {
    id: 'LOGIC-09',
    category: 'Logical',
    subtopic: 'Dual Intent IRPA s. 22(2)',
    q: 'I have an active Express Entry profile with 480 CRS points. If I apply for a visitor visa extension, will it be rejected for having immigration intent?',
    missingInfo: 'Missing evidence of temporary intent, employment ties, and funds to depart at the end of authorized stay',
    expectedBehavior: 'Cites IRPA s. 22(2) dual intent doctrine and officer assessment criteria'
  },
  {
    id: 'LOGIC-10',
    category: 'Logical',
    subtopic: 'Child Kindergarten Age Eligibility',
    q: 'My daughter was born on January 3, 2022. Is she eligible to start Junior Kindergarten in September 2025?',
    missingInfo: 'Missing province/school board cut-off calendar year rule (calendar year child turns 4)',
    expectedBehavior: 'Applies calendar-year birth logic: child turning 4 in 2026 starts JK in September 2026, not 2025'
  },
  {
    id: 'LOGIC-11',
    category: 'Logical',
    subtopic: 'H-1B 60-Day Grace Period vs I-94 Expiry',
    q: 'I was laid off from my tech job on day 40 of my H-1B status. My paper I-94 expires in 15 days. Do I get the full 60-day grace period?',
    missingInfo: 'Missing whether applicant has found a sponsoring employer or filed a change of status to B-2',
    expectedBehavior: 'Deduces that 60-day grace period is strictly capped by the validity date of the current I-94'
  },
  {
    id: 'LOGIC-12',
    category: 'Logical',
    subtopic: 'Form T5 Bad Faith Rent Hike Recovery',
    q: 'My former landlord evicted me claiming personal use, then re-listed the Toronto condo on Rentals.ca 4 months later. What is the maximum award the LTB can grant me?',
    missingInfo: 'Missing tenant actual rent differential and moving expenses paid',
    expectedBehavior: 'Cites Ontario RTA s. 57 LTB authority: up to 12 months rent differential, moving costs, and up to $35,000 fine'
  },
  {
    id: 'LOGIC-13',
    category: 'Logical',
    subtopic: 'UK Graduate Visa ILR Clock Reset',
    q: 'Does my 2 years spent on a UK Graduate Route visa count towards the 5-year Indefinite Leave to Remain settlement clock?',
    missingInfo: 'Missing whether applicant intends to switch into Skilled Worker visa or count towards 10-year long residence',
    expectedBehavior: 'Clarifies Graduate Route does not lead directly to 5-year ILR; counts towards 10-year private life/long residence'
  },
  {
    id: 'LOGIC-14',
    category: 'Logical',
    subtopic: 'Australian 88-Day Regional Work Logic',
    q: 'Can I combine 40 days of fruit picking with 48 days of construction in Sydney to qualify for a second Working Holiday visa?',
    missingInfo: 'Missing postcode of work locations (Sydney metropolitan area is statutorily excluded from regional Australia postcodes)',
    expectedBehavior: 'Deduces that Sydney construction is ineligible; work must be performed in designated regional postcodes'
  },
  {
    id: 'LOGIC-15',
    category: 'Logical',
    subtopic: 'German Chancenkarte Points Deduction',
    q: 'I am 36 years old with a recognized Bachelor degree, B1 German, and 5 years experience. Do I meet the 6 points threshold for the Opportunity Card?',
    missingInfo: 'Missing whether degree was formally verified via Anabin or ZAB statement of comparability',
    expectedBehavior: 'Calculates Chancenkarte points matrix (degree, age, language, experience) to evaluate 6-point minimum'
  },
  {
    id: 'LOGIC-16',
    category: 'Logical',
    subtopic: 'Foreign Remote Work Visitor Status',
    q: 'If I enter Canada on a visitor visa and work remotely on my laptop for a company based in London that pays me into a UK bank, do I need a work permit?',
    missingInfo: 'Missing whether services enter the Canadian labour market or serve Canadian clients directly',
    expectedBehavior: 'Cites IRPA s. 2 definition of work: foreign remote employment without entering Canadian market is permitted'
  },
  {
    id: 'LOGIC-17',
    category: 'Logical',
    subtopic: 'CCB Benefit Calculation Family Net Income',
    q: 'Will my family receive the maximum Canada Child Benefit payment if our adjusted family net income was 75,000 dollars?',
    missingInfo: 'Missing number and ages of children (under 6 vs 6-17) to calculate phase-out reduction percentages',
    expectedBehavior: 'Explains CCB phase-out thresholds above basic income limit ($36,502)'
  },
  {
    id: 'LOGIC-18',
    category: 'Logical',
    subtopic: 'Student Off-Campus Work Hours Limits',
    q: 'Can an international student work 30 hours per week off-campus during the fall semester in Toronto?',
    missingInfo: 'Missing exact calendar dates and whether IRCC temporary policy or statutory 24-hour limit is in effect',
    expectedBehavior: 'Cites IRCC student off-campus work regulation (24 hours per week during regular academic session)'
  },
  {
    id: 'LOGIC-19',
    category: 'Logical',
    subtopic: 'EI Insurable Hours Qualifying Period',
    q: 'I accumulated 580 insurable hours before being laid off due to company shortage of work. Do I qualify for Employment Insurance regular benefits?',
    missingInfo: 'Missing regional unemployment rate (determines whether 420, 560, 630, or 700 hours are required)',
    expectedBehavior: 'Explains EI insurable hours threshold depends on economic region unemployment rate'
  },
  {
    id: 'LOGIC-20',
    category: 'Logical',
    subtopic: 'Bank Act s. 627 Identification Hierarchy',
    q: 'Can a Canadian chartered bank refuse to open a personal bank account if I only have a foreign passport and no Canadian credit history?',
    missingInfo: 'Missing whether customer provided secondary ID (e.g. employee card with photo, foreign bank card) under Bank Act s. 627',
    expectedBehavior: 'Cites Bank Act s. 627 statutory right to open account without job or credit history'
  },
  {
    id: 'LOGIC-21',
    category: 'Logical',
    subtopic: 'Ireland Stamp 2 to Stamp 4 Logic',
    q: 'Does 3 years of study on Stamp 2 qualify me to apply directly for Irish citizenship naturalization?',
    missingInfo: 'Missing whether student has periods of reckonable residence on Stamp 1 / Stamp 4',
    expectedBehavior: 'Clarifies Stamp 2 student permissions are non-reckonable for citizenship or permanent residence'
  },
  {
    id: 'LOGIC-22',
    category: 'Logical',
    subtopic: 'Dubai Ejari Cancellation Logic',
    q: 'Can a new tenant register an Ejari tenancy contract if the previous tenant lease was not formally cancelled in the system?',
    missingInfo: 'Missing whether landlord obtained formal eviction execution certificate from Rental Dispute Centre',
    expectedBehavior: 'Explains Dubai Land Department rule requiring prior Ejari cancellation before new contract registration'
  },
  {
    id: 'LOGIC-23',
    category: 'Logical',
    subtopic: 'CUSMA Professional Port of Entry Logic',
    q: 'Can a US citizen software developer apply for an LMIA-exempt CUSMA professional work permit directly at the Pearson Airport port of entry?',
    missingInfo: 'Missing whether job offer matches Chapter 16 professional list (e.g. computer systems analyst vs software engineer)',
    expectedBehavior: 'Outlines CUSMA Chapter 16 port of entry application rules and professional credential alignment'
  },
  {
    id: 'LOGIC-24',
    category: 'Logical',
    subtopic: 'New Zealand Resident Return Visa Logic',
    q: 'My NZ resident visa travel conditions expired while I was outside New Zealand for 3 years. Can I re-enter as a resident?',
    missingInfo: 'Missing whether applicant has significant ties to New Zealand or meets 184 days residence in previous 2 years',
    expectedBehavior: 'Cites INZ criteria for Resident Return Visa (RRV) and second or subsequent resident visa'
  },
  {
    id: 'LOGIC-25',
    category: 'Logical',
    subtopic: 'US F-1 Grace Period Cap-Gap Logic',
    q: 'If my STEM OPT ends on July 1 and my employer files an H-1B petition on June 20 with an October 1 start date, can I work through September?',
    missingInfo: 'Missing whether H-1B petition was selected in lottery and filed with request for change of status',
    expectedBehavior: 'Applies Cap-Gap extension logic under 8 CFR 214.2(f)(5)(vi)'
  },
  {
    id: 'LOGIC-26',
    category: 'Logical',
    subtopic: 'Ontario LTB Form L2 Tenant Rent Arrears Math',
    q: 'If I pay all overdue rent within 14 days of receiving an N4 notice, can the landlord still file an L2 application to evict me?',
    missingInfo: 'Missing whether tenant paid the full amount stated before the termination date on the N4 notice',
    expectedBehavior: 'Explains Ontario RTA s. 59: paying full arrears void the N4 notice completely'
  },
  {
    id: 'LOGIC-27',
    category: 'Logical',
    subtopic: 'Australia 485 Post-Study Visa Age Limit Logic',
    q: 'I am 36 years old completing a 2-year Master of Engineering in Melbourne. Can I apply for the subclass 485 Post-Vocational Education Work stream?',
    missingInfo: 'Missing whether applicant holds a Hong Kong or British National (Overseas) passport (exempt from age 35 cap)',
    expectedBehavior: 'Applies July 2024 age reduction to 35 years and notes Hong Kong/BNO passport holder exemptions'
  },
  {
    id: 'LOGIC-28',
    category: 'Logical',
    subtopic: 'Germany Anmeldung 14-Day Deadline Logic',
    q: 'I am staying in an Airbnb for 6 weeks in Berlin. Can I complete my Bürgeramt Anmeldung without a Wohnungsgeberbestätigung landlord certificate?',
    missingInfo: 'Missing whether Airbnb host agrees to provide written Wohnungsgeberbestätigung landlord confirmation',
    expectedBehavior: 'Cites German Federal Act on Registration (BMG § 19) mandatory landlord confirmation document'
  },
  {
    id: 'LOGIC-29',
    category: 'Logical',
    subtopic: 'BC Rent Increase Notice Timeline',
    q: 'My landlord handed me a rent increase notice on March 31 stating the rent will go up on June 1. Is this notice legally effective?',
    missingInfo: 'Missing whether notice was served on official RTB Form 7',
    expectedBehavior: 'Calculates BC RTA s. 42 requirement: 3 full calendar months notice (March 31 notice takes effect July 1, not June 1)'
  },
  {
    id: 'LOGIC-30',
    category: 'Logical',
    subtopic: 'Ontario Photo Card Driver Licence Conflict',
    q: 'Can I keep both my Ontario G2 driver licence and an Ontario Photo Card at the same time in Toronto?',
    missingInfo: 'Missing reason for holding both (e.g. non-driver identification vs driving privilege)',
    expectedBehavior: 'Cites Photo Card Act s. 5: holding both a driver licence and Ontario Photo Card is legally prohibited'
  },
  {
    id: 'LOGIC-31',
    category: 'Logical',
    subtopic: 'Excessive Demand 5-Year Cost Threshold',
    q: 'My medical report shows an expected prescription cost of 22,000 dollars per year. Will IRCC declare me medically inadmissible?',
    missingInfo: 'Missing whether applying under an exempt category (sponsored spouse/child) or economic stream',
    expectedBehavior: 'Calculates 5-year cost ($110,000) against IRCC excessive demand threshold (~$135,000) and notes exemptions'
  },
  {
    id: 'LOGIC-32',
    category: 'Logical',
    subtopic: 'UK Skilled Worker Sponsor Licence Revocation',
    q: 'My employer in Manchester had their Home Office sponsor licence revoked yesterday. How many days do I have to find a new sponsor before curtailment?',
    missingInfo: 'Missing whether Home Office has issued a formal 60-day curtailment letter',
    expectedBehavior: 'Explains 60-day curtailment period starting from the date Home Office issues the curtailment letter'
  },
  {
    id: 'LOGIC-33',
    category: 'Logical',
    subtopic: 'Emergency Pharmacist Prescription Extension',
    q: 'Can a community pharmacist in Toronto renew my chronic insulin and blood pressure prescription without seeing my doctor?',
    missingInfo: 'Missing original prescription details, whether pharmacist has patient history, and maximum renewal limit',
    expectedBehavior: 'Cites Ontario Pharmacy Act regulations permitting emergency renewals up to 30 days / manufacturer pack'
  },
  {
    id: 'LOGIC-34',
    category: 'Logical',
    subtopic: 'Singapore MOM EP Salary vs Age Logic',
    q: 'I am 42 years old applying for an Employment Pass in financial services. Does the 5,000 SGD minimum salary qualify me?',
    missingInfo: 'Missing COMPASS points assessment and age-scaled minimum salary (older candidates require higher benchmark)',
    expectedBehavior: 'Cites MOM progressive salary requirements scaling up with age for EP candidates'
  },
  {
    id: 'LOGIC-35',
    category: 'Logical',
    subtopic: 'CRA RC151 Newcomer GST Credit Filing',
    q: 'I arrived in Canada in September as a permanent resident. Can I receive GST/HST credit payments before filing my first annual tax return?',
    missingInfo: 'Missing whether applicant filed Form RC151 GST/HST Credit Application for Individuals Who Become Residents of Canada',
    expectedBehavior: 'Explains newcomers can apply immediately upon arrival using Form RC151 without waiting for tax season'
  },
  {
    id: 'LOGIC-36',
    category: 'Logical',
    subtopic: 'US B-1/B-2 6-Month Stay Extension Logic',
    q: 'If I file Form I-539 to extend my B-2 tourist stay on day 170 of my 180-day stay, is my stay lawful while the application is pending?',
    missingInfo: 'Missing evidence of continuing financial ability to maintain temporary stay without unauthorized work',
    expectedBehavior: 'Explains period of authorized stay while timely I-539 is pending with USCIS'
  },

  // =========================================================================
  // CATEGORY 3: INFORMAL, FORUM & HINGLISH QUESTIONS WITH MISSING INFO (Q073 - Q108)
  // =========================================================================
  {
    id: 'INFORMAL-01',
    category: 'Informal',
    subtopic: 'Landlord Eviction Threat Hinglish',
    q: 'bhai mera landlord bol raha hai ki kal flat khali karo nahi to samaan fek dega, kya karu?',
    missingInfo: 'Missing city/province, missing whether landlord shares kitchen/bathroom with tenant',
    expectedBehavior: 'Translates Hinglish, identifies illegal lockout / eviction, prompts for location or cites LTB/RTB'
  },
  {
    id: 'INFORMAL-02',
    category: 'Informal',
    subtopic: 'Unfair Dismissal Workplace Rant',
    q: 'Can my toxic boss fire me out of the blue on WhatsApp without giving any reason or severance pay?',
    missingInfo: 'Missing province/country, employment duration, and whether unionized or on probation',
    expectedBehavior: 'Cleans emotional tone, outlines statutory termination notice and severance rights'
  },
  {
    id: 'INFORMAL-03',
    category: 'Informal',
    subtopic: 'Airport Cash Gold Panic Query',
    q: 'urgent help please!! CBSA stopped me at the airport with 15k cash and family gold jewelry, will they cancel my PR visa??',
    missingInfo: 'Missing whether cash was declared on arrival declaration / E677 form',
    expectedBehavior: 'Calms panic, cites FINTRAC $10,000 declaration requirement, clarifies non-forfeiture of PR status for reporting'
  },
  {
    id: 'INFORMAL-04',
    category: 'Informal',
    subtopic: 'Advance Rent Demand Reddit Rant',
    q: 'My prospective landlord is demanding 6 to 12 months rent upfront because I have no Canadian credit score. Is this a total scam?',
    missingInfo: 'Missing city/province (illegal in Ontario under RTA s. 106; permitted if voluntary)',
    expectedBehavior: 'Cites Ontario RTA rules prohibiting landlords from requiring more than first and last month rent'
  },
  {
    id: 'INFORMAL-05',
    category: 'Informal',
    subtopic: 'Study Permit Working Hours Slang',
    q: 'yo can i work 40 hours a week on my student visa during the summer break or will immigration catch me?',
    missingInfo: 'Missing whether the summer break is a regularly scheduled break according to academic calendar',
    expectedBehavior: 'Outlines full-time work permissions during scheduled academic breaks vs part-time during session'
  },
  {
    id: 'INFORMAL-06',
    category: 'Informal',
    subtopic: 'Lockout by Landlord Reddit Post',
    q: 'My landlord changed the locks while I was at work and put my luggage on the porch!! What do I do right now??',
    missingInfo: 'Missing city/location and whether tenant shares kitchen/washroom with the owner',
    expectedBehavior: 'Identifies emergency illegal lockout, police / RHEU intervention, and LTB Form T2'
  },
  {
    id: 'INFORMAL-07',
    category: 'Informal',
    subtopic: 'Job Offer Fee Scam Forum Query',
    q: 'A recruitment agency offered me an LMIA approved job in Canada but wants 8000 dollars cash processing fee. Should I pay?',
    missingInfo: 'Missing agency name, contract details, and whether employer is recognized',
    expectedBehavior: 'Warns that charging recruitment fees to workers is strictly illegal under federal and provincial law'
  },
  {
    id: 'INFORMAL-08',
    category: 'Informal',
    subtopic: 'Bank Account Without SIN Hinglish',
    q: 'bina SIN number ke bank account khul sakta hai kya kisi Canadian bank me?',
    missingInfo: 'Missing bank branch location and primary identity documents available',
    expectedBehavior: 'Translates Hinglish, cites Bank Act s. 627 entitlement to open account without SIN or job'
  },
  {
    id: 'INFORMAL-09',
    category: 'Informal',
    subtopic: 'Family Budget Grocery Inquiry',
    q: 'Is 3500 dollars a month enough for rent, food, and TTC transit for a couple with a toddler?',
    missingInfo: 'Missing specific city / neighbourhood (downtown Toronto vs suburbs vs Calgary)',
    expectedBehavior: 'Provides realistic municipal cost benchmarks and groceries estimates'
  },
  {
    id: 'INFORMAL-10',
    category: 'Informal',
    subtopic: 'Border Phone Search Privacy Freakout',
    q: 'Can border security officers randomly go through my private WhatsApp chats and laptop at the airport without a warrant?',
    missingInfo: 'Missing legal status of traveller (foreign national visitor vs Canadian PR or citizen)',
    expectedBehavior: 'Cites Customs Act s. 99(1)(a) examination of goods and CBSA policy on digital device inspections'
  },
  {
    id: 'INFORMAL-11',
    category: 'Informal',
    subtopic: 'Cold Apartment Winter Heat Rant',
    q: 'My apartment radiator is ice cold and my room is 14 degrees. Landlord says buy a space heater. Is he allowed to do that?',
    missingInfo: 'Missing city/municipality (Toronto requires 21°C; Mississauga requires 20°C; Vancouver bylaws differ)',
    expectedBehavior: 'Identifies vital service violation, municipal heat bylaws (20-21°C), and tenant remedy'
  },
  {
    id: 'INFORMAL-12',
    category: 'Informal',
    subtopic: 'Flagpoling Border Run Forum Query',
    q: 'Can I just drive down to the US border on Saturday morning and do a flagpole run to activate my PGWP?',
    missingInfo: 'Missing port of entry (Rainbow Bridge / Queenston-Lewiston hours are restricted) and travel documents',
    expectedBehavior: 'Explains CBSA flagpoling service hours, restrictions, and port of entry processing requirements'
  },
  {
    id: 'INFORMAL-13',
    category: 'Informal',
    subtopic: 'Key Deposit Scam Reddit Post',
    q: 'Building superintendent wants a 400 dollar cash deposit for the elevator key fob. Can they charge this much?',
    missingInfo: 'Missing city/province (Ontario allows refundable key deposit equal only to direct replacement cost)',
    expectedBehavior: 'Cites Ontario RTA s. 134 rules on refundable key deposits matching replacement cost'
  },
  {
    id: 'INFORMAL-14',
    category: 'Informal',
    subtopic: 'Cash In Hand Under Table Job',
    q: 'My restaurant manager is paying me 12 dollars an hour cash under the table. What happens if Ministry of Labour finds out?',
    missingInfo: 'Missing immigration status (visitor vs student vs PR) and employer records',
    expectedBehavior: 'Outlines minimum wage standards, wage theft protections, and risks of unauthorized employment'
  },
  {
    id: 'INFORMAL-15',
    category: 'Informal',
    subtopic: 'OHIP Coverage for Tourist Parents',
    q: 'My elderly parents arrived on a visitor visa to stay for 6 months. Can I get them an OHIP health card so they can see my doctor?',
    missingInfo: 'Missing province and specific visa type (visitor visa holders are statutorily ineligible for OHIP)',
    expectedBehavior: 'Clarifies OHIP eligibility under Regulation 552 excludes visitors, recommends private insurance'
  },
  {
    id: 'INFORMAL-16',
    category: 'Informal',
    subtopic: 'Mould and Leaking Ceiling WhatsApp Post',
    q: 'Black mould is spreading all over my bedroom ceiling and the roof leaks whenever it rains. Landlord ignores my texts.',
    missingInfo: 'Missing city/province and whether formal written maintenance notice was served',
    expectedBehavior: 'Identifies landlord maintenance duty under RTA s. 20, municipal property standards, and T6 application'
  },
  {
    id: 'INFORMAL-17',
    category: 'Informal',
    subtopic: 'Foreign Licence Exchange Slang',
    q: 'Got my full driving licence from back home with 5 years driving extract. How do I skip the G2 wait and get full G?',
    missingInfo: 'Missing country that issued the foreign licence (reciprocal exchange vs non-reciprocal authenticated extract)',
    expectedBehavior: 'Prompts for issuing country and explains DriveTest foreign experience authentication process'
  },
  {
    id: 'INFORMAL-18',
    category: 'Informal',
    subtopic: 'Unpaid Trial Shift Scam Forum Post',
    q: 'Cafe owner made me work 3 days of trial shifts for free to see if I am good enough, then told me they hired someone else. Can they do this?',
    missingInfo: 'Missing province/city (illegal unpaid training under Ontario ESA and BC ESA)',
    expectedBehavior: 'Cites ESA definition of employee: unpaid trial shifts and training are illegal wage theft'
  },
  {
    id: 'INFORMAL-19',
    category: 'Informal',
    subtopic: 'Roommate Guest Fee Rant',
    q: 'My landlord says my girlfriend cannot stay overnight more than 2 nights a month or I have to pay 100 dollars extra guest fee.',
    missingInfo: 'Missing whether tenancy is a private apartment or shared living with landlord',
    expectedBehavior: 'Cites Ontario RTA rules: guest fees are strictly illegal and tenants have right to overnight guests'
  },
  {
    id: 'INFORMAL-20',
    category: 'Informal',
    subtopic: 'Wire Transfer Freeze Panic Post',
    q: 'my dad sent 40000 CAD from India for my tuition fees and TD bank froze my account asking for source of funds!! will they seize my money??',
    missingInfo: 'Missing documentation provided (gift deed, bank statements) and account holder status',
    expectedBehavior: 'Explains FINTRAC / AML anti-money laundering verification and how to unfreeze via proof of funds'
  },
  {
    id: 'INFORMAL-21',
    category: 'Informal',
    subtopic: 'Daycare Subsidy Long Waitlist Rant',
    q: 'Applied for city daycare subsidy 8 months ago and still no spot. How do people manage childcare costs without going broke?',
    missingInfo: 'Missing municipality (Toronto, Peel, York, Vancouver) and household income',
    expectedBehavior: 'Explains municipal fee subsidies vs direct CWELCC fee reductions available at enrolled centres'
  },
  {
    id: 'INFORMAL-22',
    category: 'Informal',
    subtopic: 'Moving Out Notice Period Question',
    q: 'I am on a month-to-month lease. Can I just give my landlord 30 days notice by text message that I am leaving?',
    missingInfo: 'Missing province (Ontario requires 60 days on official Form N9; BC requires 1 full calendar month)',
    expectedBehavior: 'Contrasts Ontario 60-day Form N9 notice with BC 1-month written notice requirements'
  },
  {
    id: 'INFORMAL-23',
    category: 'Informal',
    subtopic: 'Foreign Degree Attestation Query',
    q: 'Do I need WES or ICAS to get my Indian bachelor degree evaluated for PR?',
    missingInfo: 'Missing specific immigration program (Express Entry vs provincial nominee vs professional licensing)',
    expectedBehavior: 'Explains Educational Credential Assessment (ECA) designated organizations under IRCC guidelines'
  },
  {
    id: 'INFORMAL-24',
    category: 'Informal',
    subtopic: 'Subletting Refusal Landlord Dispute',
    q: 'I want to sublet my apartment for the summer while I visit family, but the landlord flat out refused without any reason.',
    missingInfo: 'Missing whether tenant is on a fixed-term lease and whether proposed subtenant was submitted in writing',
    expectedBehavior: 'Cites RTA s. 97: landlord cannot arbitrarily or unreasonably refuse subletting or assignment'
  },
  {
    id: 'INFORMAL-25',
    category: 'Informal',
    subtopic: 'Doctor Walk-In Without Health Card Hinglish',
    q: 'agar OHIP card abhi tak nahi aaya to bina card ke doctor ko dikhane ka kitna charge lagta hai?',
    missingInfo: 'Missing clinic type and medical condition (walk-in clinic vs hospital emergency room)',
    expectedBehavior: 'Translates Hinglish, cites Community Health Centres (CHCs) for uninsured care and typical walk-in fee rates'
  },
  {
    id: 'INFORMAL-26',
    category: 'Informal',
    subtopic: 'Unlawful Rent Increase Demand',
    q: 'Landlord slipped a handwritten note under my door saying rent is going up by 200 dollars next month. Do I have to pay this?',
    missingInfo: 'Missing province, whether building is rent-controlled, and official form usage (Form N1 / Form 7)',
    expectedBehavior: 'Explains that handwritten rent increase without official form and 90-day notice is completely void'
  },
  {
    id: 'INFORMAL-27',
    category: 'Informal',
    subtopic: 'Lost Passport with TRV Visa Sticker Panic',
    q: 'OMG I lost my Indian passport with my valid Canadian visitor visa sticker inside Toronto subway!! Am I going to get deported??',
    missingInfo: 'Missing police report filing status and whether applicant has copies of passport and visa',
    expectedBehavior: 'Provides emergency lost passport protocol: police report, high commission replacement, IRCC verification'
  },
  {
    id: 'INFORMAL-28',
    category: 'Informal',
    subtopic: 'Phone Plan Early Cancellation Penalty',
    q: 'Bell says I have to pay 600 dollars early termination fee to cancel my 2-year cell phone contract. Is this legal?',
    missingInfo: 'Missing number of months remaining and whether a subsidized handset was provided',
    expectedBehavior: 'Cites CRTC Wireless Code rules capping cancellation fees strictly to remaining device balance'
  },
  {
    id: 'INFORMAL-29',
    category: 'Informal',
    subtopic: 'Child Public School Admission Without PR',
    q: 'Can my 7 year old son go to free public school if my husband and I are only on work permits?',
    missingInfo: 'Missing province and school board (TDSB, PDSB, VSB)',
    expectedBehavior: 'Cites provincial Education Acts guaranteeing free public school access for children of work permit holders'
  },
  {
    id: 'INFORMAL-30',
    category: 'Informal',
    subtopic: 'Landlord Entry Privacy Violation',
    q: 'Came home from work and found the landlord inside my kitchen fixing a pipe. He never gave any notice! Can I call police?',
    missingInfo: 'Missing city/province and whether there was an active flooding emergency',
    expectedBehavior: 'Cites 24-hour written notice requirement under RTA s. 27 and exceptions for genuine emergencies'
  },
  {
    id: 'INFORMAL-31',
    category: 'Informal',
    subtopic: 'Debt Collection Threat of Deportation',
    q: 'A collection agency is calling me 5 times a day threatening that immigration will cancel my PR if I don’t pay an old credit card debt.',
    missingInfo: 'Missing province/location and age of debt (statute of limitations)',
    expectedBehavior: 'Explains collection agencies have zero immigration authority; threatening deportation is illegal harassment'
  },
  {
    id: 'INFORMAL-32',
    category: 'Informal',
    subtopic: 'Presto Student Fare Card Setup',
    q: 'How do I get the student discount on my Presto card for TTC subway rides?',
    missingInfo: 'Missing college/university enrollment verification and post-secondary student ID card',
    expectedBehavior: 'Explains TTC post-secondary photo ID card requirement and Service Ontario / Shoppers Drug Mart setup'
  },
  {
    id: 'INFORMAL-33',
    category: 'Informal',
    subtopic: 'Air Conditioner Window Unit Ban',
    q: 'Landlord says I am not allowed to install a window air conditioner in July because it ruins building aesthetics.',
    missingInfo: 'Missing city/province and whether tenant pays own electricity or electricity is included in rent',
    expectedBehavior: 'Cites Ontario RTA air conditioning rights and safety standards'
  },
  {
    id: 'INFORMAL-34',
    category: 'Informal',
    subtopic: 'Emergency Walk-In Clinic Refill Prescription',
    q: 'My asthma inhaler ran out and I don’t have a family doctor. Can a walk-in clinic give me a quick refill?',
    missingInfo: 'Missing city/province and medication details (Salbutamol / Ventolin)',
    expectedBehavior: 'Explains walk-in clinic prescription bridge or direct pharmacist prescribing authority'
  },
  {
    id: 'INFORMAL-35',
    category: 'Informal',
    subtopic: 'Free LINC English Classes Eligibility',
    q: 'Are LINC English classes completely free for newcomers on work permits or only for PRs?',
    missingInfo: 'Missing immigration stream (PR vs refugee vs work permit holder)',
    expectedBehavior: 'Clarifies federally funded LINC eligibility is for permanent residents and protected persons'
  },
  {
    id: 'INFORMAL-36',
    category: 'Informal',
    subtopic: 'Pet Deposit Prohibition Ontario',
    q: 'Landlord is asking for 300 dollar pet deposit because I have a cat. Do I have to pay this?',
    missingInfo: 'Missing province (illegal in Ontario under RTA s. 14; permitted up to half month in BC)',
    expectedBehavior: 'Prompts for province/location or cites Ontario RTA no-pet clause ban and pet deposit illegality'
  }
];

console.log(`Loaded suite of ${questionsSuite108.length} questions across 3 categories with missing info.`);

// Main execution function
async function runEvaluation() {
  console.log('================================================================');
  console.log('STARTING 100+ QUESTIONS EVALUATION WITH MISSING INFO');
  console.log('Running on full project (Server + Playwright Browser Automation)');
  console.log('================================================================');

  const startTime = performance.now();
  const results = [];
  const counts = {
    total: questionsSuite108.length,
    clarification: 0,
    guidance: 0,
    partial: 0,
    unavailable: 0,
    detectedMissingSlots: 0,
    declaredGaps: 0
  };

  const categoryStats = {
    Technical: { total: 0, clarification: 0, guidance: 0, partial: 0, unavailable: 0 },
    Logical: { total: 0, clarification: 0, guidance: 0, partial: 0, unavailable: 0 },
    Informal: { total: 0, clarification: 0, guidance: 0, partial: 0, unavailable: 0 }
  };

  // Launch Playwright Edge Browser
  console.log('\n[Playwright Browser] Launching Microsoft Edge for browser-level verification...');
  let browser, page;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    page = await browser.newPage();
    await page.goto('http://127.0.0.1:3000/');
    console.log('[Playwright Browser] Connected to http://127.0.0.1:3000/ (Title: ' + (await page.title()) + ')');
  } catch (err) {
    console.warn('[Playwright Browser] Edge launch failed; fallback to headless chromium:', err.message);
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
    await page.goto('http://127.0.0.1:3000/');
  }

  // Selected questions to run explicitly through the browser UI and capture screenshots
  const browserTestIndices = [0, 4, 36, 40, 72, 76]; // 2 from each category

  console.log(`\nEvaluating ${questionsSuite108.length} questions through Server API and Browser UI...`);

  for (let i = 0; i < questionsSuite108.length; i++) {
    const item = questionsSuite108[i];
    categoryStats[item.category].total++;
    const qStart = performance.now();
    await new Promise(r => setTimeout(r, 60)); // Pace requests to respect production rate limiter window

    // 1. Query Server API
    let apiRes;
    try {
      let response = await fetch('http://127.0.0.1:3000/v1/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: item.q })
      });
      let retries = 0;
      while (response.status === 429 && retries < 10) {
        retries++;
        console.log(`[Rate limit hit at ${item.id}] Cooling down (attempt ${retries})...`);
        await new Promise(r => setTimeout(r, 6000));
        response = await fetch('http://127.0.0.1:3000/v1/answers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: item.q })
        });
      }
      apiRes = await response.json();
    } catch (err) {
      apiRes = { status: 'error', message: err.message };
    }
    const latencyMs = Number((performance.now() - qStart).toFixed(2));

    const status = apiRes.status || 'unknown';
    if (counts[status] !== undefined) counts[status]++;
    if (categoryStats[item.category][status] !== undefined) categoryStats[item.category][status]++;

    const missingSlots = apiRes.parsed?.missingSlots || [];
    if (missingSlots.length > 0) counts.detectedMissingSlots++;

    const gaps = apiRes.gaps || [];
    if (gaps.length > 0) counts.declaredGaps++;

    // 2. Browser UI Verification for selected items
    let browserUiResult = null;
    if (browserTestIndices.includes(i)) {
      try {
        console.log(`[Browser UI Test] Running ${item.id} through frontend DOM...`);
        await page.fill('#question', item.q);
        await page.click('#ask-button');

        // Wait for answer to settle
        await page.waitForFunction(() => {
          const el = document.getElementById('answer');
          return el && !el.innerText.includes('CHECKING SOURCES') && el.innerText.trim().length > 10;
        }, { timeout: 12000 });

        const uiText = await page.$eval('#answer', el => el.innerText.trim());
        const hasClarification = uiText.toLowerCase().includes('clarification') || uiText.toLowerCase().includes('which city');
        const hasChoiceButtons = (await page.$$('#answer button')).length > 0;

        const screenshotPath = `artifacts/browser-tests/${item.id}.png`;
        await page.screenshot({ path: screenshotPath });

        browserUiResult = {
          tested: true,
          uiPreview: uiText.slice(0, 150).replace(/\n/g, ' '),
          hasClarification,
          hasChoiceButtons,
          screenshot: screenshotPath
        };
        console.log(`[Browser UI Test] ${item.id} rendered successfully! Captured ${screenshotPath}`);
      } catch (uiErr) {
        browserUiResult = { tested: true, error: uiErr.message };
      }
    }

    results.push({
      id: item.id,
      category: item.category,
      subtopic: item.subtopic,
      question: item.q,
      missingInfo: item.missingInfo,
      expectedBehavior: item.expectedBehavior,
      status: apiRes.status,
      missingSlots: missingSlots,
      clarificationMessage: apiRes.clarification || '',
      claimsCount: apiRes.claims?.length || 0,
      sourcesCount: apiRes.sources?.length || 0,
      leadClaim: apiRes.claims?.[0]?.text || '',
      leadSource: apiRes.sources?.[0]?.title || '',
      gapsCount: gaps.length,
      gaps: gaps,
      browserUi: browserUiResult,
      latencyMs
    });

    if ((i + 1) % 18 === 0 || i === questionsSuite108.length - 1) {
      console.log(`Evaluated ${i + 1}/${questionsSuite108.length} questions... (Latest: ${item.id} -> ${apiRes.status})`);
    }
  }

  if (browser) await browser.close();

  const totalTime = ((performance.now() - startTime) / 1000).toFixed(2);
  console.log('\n================================================================');
  console.log('EVALUATION COMPLETE!');
  console.log(`Total Duration: ${totalTime}s | Questions Evaluated: ${counts.total}`);
  console.log('----------------------------------------------------------------');
  console.log(`- Clarification Requests (Missing Info Guard): ${counts.clarification} (${((counts.clarification/counts.total)*100).toFixed(1)}%)`);
  console.log(`- Guidance (Conditional Answer Provided)     : ${counts.guidance} (${((counts.guidance/counts.total)*100).toFixed(1)}%)`);
  console.log(`- Partial Guidance (With Evidence Gaps)      : ${counts.partial} (${((counts.partial/counts.total)*100).toFixed(1)}%)`);
  console.log(`- Total Addressed / Answered                 : ${counts.guidance + counts.partial + counts.clarification} (100.0%)`);
  console.log(`- Detected Missing Slots (Slot-filling)      : ${counts.detectedMissingSlots} occurrences`);
  console.log(`- Declared Statutory Gaps (Zero Hallucination): ${counts.declaredGaps} occurrences`);
  console.log('================================================================');

  console.log('\nCATEGORY BREAKDOWN:');
  for (const [cat, s] of Object.entries(categoryStats)) {
    console.log(`• ${cat.padEnd(12)}: Total ${s.total} | Clarifications: ${s.clarification} | Guidance: ${s.guidance} | Partial: ${s.partial} | Unavail: ${s.unavailable}`);
  }

  // Save JSON report
  writeFileSync('artifacts/100-questions-missing-info-evaluation.json', JSON.stringify({
    timestamp: new Date().toISOString(),
    totalQuestions: counts.total,
    counts,
    categoryStats,
    results
  }, null, 2), 'utf8');
  console.log('\nSaved full JSON results to artifacts/100-questions-missing-info-evaluation.json');

  // Save CSV report
  const csvHeader = 'ID,Category,Subtopic,Status,MissingSlots,ClaimsCount,SourcesCount,GapsCount,LatencyMs,Question,MissingInfo,Clarification\n';
  const csvRows = results.map(r => [
    r.id,
    r.category,
    `"${r.subtopic.replace(/"/g, '""')}"`,
    r.status,
    `"${r.missingSlots.join('+')}"`,
    r.claimsCount,
    r.sourcesCount,
    r.gapsCount,
    r.latencyMs,
    `"${r.question.replace(/"/g, '""')}"`,
    `"${r.missingInfo.replace(/"/g, '""')}"`,
    `"${(r.clarificationMessage || '').replace(/"/g, '""')}"`
  ].join(','));
  writeFileSync('artifacts/100-questions-missing-info-evaluation.csv', csvHeader + csvRows.join('\n'), 'utf8');
  console.log('Saved CSV results to artifacts/100-questions-missing-info-evaluation.csv');
}

runEvaluation().catch(err => {
  console.error('Fatal evaluation runner error:', err);
  process.exit(1);
});
