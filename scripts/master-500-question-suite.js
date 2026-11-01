// scripts/master-500-question-suite.js
// 524 Comprehensive Questions Suite across all Settlement Domains & 8 Countries
import { questionSuite as suite180 } from './question-suite-180.js';
import { technical120Suite } from './benchmark-100plus-technical-questions.js';
import { botConversationalChains } from './bot-simulation-twisted-questions.js';

// Flatten bot conversational chains into single questions
const bot50Suite = botConversationalChains.flatMap(chain =>
  chain.steps.map(step => ({
    id: step.id,
    cat: 'Bot_Conversational_Twisted',
    sub: chain.chain,
    q: step.q,
    city: step.city || 'Toronto',
    exp: 'guidance',
    src: 'Bot_Simulation'
  }))
);

// 120+ Real-World Reddit, Quora & LinkedIn Community Questions
export const redditQuoraLinkedInSuite = [
  // ── 1. REDDIT r/ImmigrationCanada & r/h1b & r/ukvisa (Viral Visa Rumors & Traps) ────
  { id: 'RQL001', cat: 'Reddit_Quora', sub: 'Maintained Status Travel', q: 'Can I travel outside Canada while on maintained status PGWP in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/ImmigrationCanada' },
  { id: 'RQL002', cat: 'Reddit_Quora', sub: 'Remote Work Visitor', q: 'Can I work remotely for a foreign employer on a visitor visa in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/ImmigrationCanada' },
  { id: 'RQL003', cat: 'Reddit_Quora', sub: 'Expired PR Card Land Border', q: 'Can I enter Canada at land border with expired PR card in private vehicle in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/ImmigrationCanada' },
  { id: 'RQL004', cat: 'Reddit_Quora', sub: 'Border Flagpoling Ban', q: 'Can I flagpole at Rainbow Bridge for PGWP work permit at border in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/ImmigrationCanada' },
  { id: 'RQL005', cat: 'Reddit_Quora', sub: 'Dependent Exclusion 117(9)(d)', q: 'What happens if a dependent child was non-accompanying and unexamined section 117(9)(d) in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/ImmigrationCanada' },
  { id: 'RQL006', cat: 'Reddit_Quora', sub: 'Dual Intent IRPA 22(2)', q: 'Can I enter Canada on visitor visa if I have pending Express Entry PR dual intent in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/ImmigrationCanada' },
  { id: 'RQL007', cat: 'Reddit_Quora', sub: 'CEC 52 Weeks Continuous', q: 'Can I qualify for Canadian Experience Class CEC in 6 months with 1560 hours or does it require 52 continuous weeks in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/ImmigrationCanada' },
  { id: 'RQL008', cat: 'Reddit_Quora', sub: 'Self-Employed CEC Exclusion', q: 'Does freelance or contract work on a T4A count towards Canadian Experience Class CEC in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/ImmigrationCanada' },
  { id: 'RQL009', cat: 'Reddit_Quora', sub: 'PNP Intent to Reside', q: 'Can a provincial nominee PNP move to another province before landing or does IRPA require intent to reside in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/ImmigrationCanada' },
  { id: 'RQL010', cat: 'Reddit_Quora', sub: 'Digital Device Search', q: 'Can CBSA border officers search my digital device phone search passcode at airport in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/ImmigrationCanada' },
  { id: 'RQL011', cat: 'Reddit_Quora', sub: 'US H-1B 60-Day Grace Period', q: 'When does the 60-day grace period start after layoff severance for H-1B in the United States?', country: 'United States', exp: 'guidance', src: 'r/h1b' },
  { id: 'RQL012', cat: 'Reddit_Quora', sub: 'US F-1 OPT Cap-Gap', q: 'How does F-1 OPT Cap-Gap work authorization extension work in the United States?', country: 'United States', exp: 'guidance', src: 'r/f1visa' },
  { id: 'RQL013', cat: 'Reddit_Quora', sub: 'US 90-Day Misrepresentation', q: 'What is the 90-day rule for willful misrepresentation when filing adjustment of status or green card in the United States?', country: 'United States', exp: 'guidance', src: 'r/USCIS' },
  { id: 'RQL014', cat: 'Reddit_Quora', sub: 'US 540-Day EAD Extension', q: 'Does a timely filed I-765 renewal qualify for a 540-day automatic extension of EAD work authorization in the United States?', country: 'United States', exp: 'guidance', src: 'r/USCIS' },
  { id: 'RQL015', cat: 'Reddit_Quora', sub: 'US CBP Electronic I-94', q: 'Does electronic Form I-94 determine authorized stay and override passport visa foil expiration in the United States?', country: 'United States', exp: 'guidance', src: 'r/h1b' },
  { id: 'RQL016', cat: 'Reddit_Quora', sub: 'US USCIS 245(k) Work Violation', q: 'Can employment-based green card applicants forgive up to 180 days of unauthorized work under 245(k) in the United States?', country: 'United States', exp: 'guidance', src: 'r/USCIS' },
  { id: 'RQL017', cat: 'Reddit_Quora', sub: 'UK ILR 180-Day Rolling Rule', q: 'What is the 180-day continuous residence rolling absence limit for ILR in the UK?', country: 'United Kingdom', exp: 'guidance', src: 'r/ukvisa' },
  { id: 'RQL018', cat: 'Reddit_Quora', sub: 'UK Skilled Worker Grandfathering', q: 'What is the grandfathered salary threshold for pre-April 2024 Skilled Worker visa holders in the United Kingdom?', country: 'United Kingdom', exp: 'guidance', src: 'r/ukvisa' },
  { id: 'RQL019', cat: 'Reddit_Quora', sub: 'UK Right to Rent Statutory Excuse', q: 'Does a landlord have a 28-day statutory excuse via Landlord Checking Service during in-time visa extension Right to Rent in the United Kingdom?', country: 'United Kingdom', exp: 'guidance', src: 'r/ukvisa' },
  { id: 'RQL020', cat: 'Reddit_Quora', sub: 'Australia 482 180-Day Cessation', q: 'How many days do subclass 482 visa holders have to find a new sponsor under Condition 8607 in Australia?', country: 'Australia', exp: 'guidance', src: 'r/AusVisa' },
  { id: 'RQL021', cat: 'Reddit_Quora', sub: 'Australia 88-Day Farm Work', q: 'What are the award wage and piece rate protections for Working Holiday 88 days regional work under Fair Work in Australia?', country: 'Australia', exp: 'guidance', src: 'r/AusVisa' },
  { id: 'RQL022', cat: 'Reddit_Quora', sub: 'Germany BGB 622 Notice Periods', q: 'What is the statutory notice period for resignation or dismissal under BGB 622 during probation in Germany?', country: 'Germany', exp: 'guidance', src: 'r/germany' },
  { id: 'RQL023', cat: 'Reddit_Quora', sub: 'Germany Chancenkarte 20hr Work', q: 'Can Opportunity Card Chancenkarte holders work 20 hours per week or do trial work Probearbeit in Germany?', country: 'Germany', exp: 'guidance', src: 'r/germany' },
  { id: 'RQL024', cat: 'Reddit_Quora', sub: 'Dubai Gratuity Fee Recovery Ban', q: 'Can an employer deduct visa or recruitment fees from gratuity under WPS in the UAE?', country: 'United Arab Emirates', exp: 'guidance', src: 'r/dubai' },
  { id: 'RQL025', cat: 'Reddit_Quora', sub: 'Ireland CSEP Stamp 4 Fast-Track', q: 'When can a Critical Skills Employment Permit CSEP holder transition to Stamp 4 in Ireland?', country: 'Ireland', exp: 'guidance', src: 'r/MoveToIreland' },
  { id: 'RQL026', cat: 'Reddit_Quora', sub: 'NZ AEWV 90-Day Redundancy', q: 'How many days do I have after redundancy to find an accredited employer and apply for variation of conditions AEWV in New Zealand?', country: 'New Zealand', exp: 'guidance', src: 'r/newzealand' },

  // ── 2. REDDIT r/OntarioLandlord & r/HousingUK (Tenancy, Deposits & Rights) ───
  { id: 'RQL027', cat: 'Reddit_Quora', sub: 'No Pets Allowed Clause', q: 'Is a no pets allowed clause enforceable in a residential lease in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/OntarioLandlord' },
  { id: 'RQL028', cat: 'Reddit_Quora', sub: 'Advance Rent Demand', q: 'Can a landlord demand 6 to 12 months advance rent because I lack Canadian credit history in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/OntarioLandlord' },
  { id: 'RQL029', cat: 'Reddit_Quora', sub: 'Key Deposit Limits', q: 'Is a 500 dollar key deposit legal under the Ontario Residential Tenancies Act in Mississauga?', city: 'Mississauga', exp: 'guidance', src: 'r/OntarioLandlord' },
  { id: 'RQL030', cat: 'Reddit_Quora', sub: 'Shared Kitchen RTA Exemption', q: 'Does RTA apply if I share kitchen or bathroom with the landlord owner in Ontario in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/OntarioLandlord' },
  { id: 'RQL031', cat: 'Reddit_Quora', sub: 'Post-2018 Rent Control', q: 'How to verify rent control exemption for building first occupied after November 15 2018 in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/OntarioLandlord' },
  { id: 'RQL032', cat: 'Reddit_Quora', sub: 'Lease Assignment Exit', q: 'Can I terminate early with 30 days notice if landlord refuses lease assignment in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/OntarioLandlord' },
  { id: 'RQL033', cat: 'Reddit_Quora', sub: 'N12 Compensation Timing', q: 'Is N12 eviction notice void if landlord fails to pay one month compensation before termination date in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/OntarioLandlord' },
  { id: 'RQL034', cat: 'Reddit_Quora', sub: 'OHRC Rental Credit Ban', q: 'Can a landlord refuse to rent to a newcomer because they have no Canadian credit history under the Human Rights Code in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/OntarioLandlord' },
  { id: 'RQL035', cat: 'Reddit_Quora', sub: 'Landlord Entry Without Notice', q: 'Can landlord enter rental unit without 24 hours notice in Ontario in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/OntarioLandlord' },
  { id: 'RQL036', cat: 'Reddit_Quora', sub: 'Illegal Lockout Tonight', q: 'Can a landlord lock out a tenant or change the locks without an LTB eviction order in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/OntarioLandlord' },
  { id: 'RQL037', cat: 'Reddit_Quora', sub: 'BC Tenancy Security Deposit', q: 'What is the maximum security deposit a landlord can ask for in Vancouver BC?', city: 'Vancouver', exp: 'guidance', src: 'r/vancouver' },
  { id: 'RQL038', cat: 'Reddit_Quora', sub: 'UK Tenant Fees Ban', q: 'Can letting agents charge admin fees or holding deposit beyond limits under Tenant Fees Act in the UK?', country: 'United Kingdom', exp: 'guidance', src: 'r/HousingUK' },
  { id: 'RQL039', cat: 'Reddit_Quora', sub: 'UK Section 21 Gas Safety', q: 'Is Section 21 eviction notice void if landlord failed to provide Gas Safety Certificate in the UK?', country: 'United Kingdom', exp: 'guidance', src: 'r/HousingUK' },
  { id: 'RQL040', cat: 'Reddit_Quora', sub: 'Germany Nebenkosten 12-Month', q: 'What is the landlord 12-month preclusion rule on annual utility bills Nebenkosten in Germany?', country: 'Germany', exp: 'guidance', src: 'r/germany' },
  { id: 'RQL041', cat: 'Reddit_Quora', sub: 'Germany Rundfunkbeitrag Fee', q: 'Does each flatmate have to pay Rundfunkbeitrag TV tax or is it one fee per apartment in Germany?', country: 'Germany', exp: 'guidance', src: 'r/germany' },
  { id: 'RQL042', cat: 'Reddit_Quora', sub: 'Germany Mietpreisbremse Prior Rent', q: 'Must a landlord disclose the previous rent Vormiete in writing under the Mietpreisbremse rent brake in Germany?', country: 'Germany', exp: 'guidance', src: 'r/germany' },
  { id: 'RQL043', cat: 'Reddit_Quora', sub: 'Dubai RERA Notary Notice', q: 'Can my landlord evict me in Dubai with WhatsApp notice or do they need 12 months notary public notice under RERA?', country: 'United Arab Emirates', exp: 'guidance', src: 'r/dubai' },
  { id: 'RQL044', cat: 'Reddit_Quora', sub: 'Ireland RPZ 2% Rent Cap', q: 'What is the maximum rent increase in a Rent Pressure Zone RPZ in Ireland?', country: 'Ireland', exp: 'guidance', src: 'r/ireland' },
  { id: 'RQL045', cat: 'Reddit_Quora', sub: 'NZ 23-Day Bond Lodgement', q: 'Can a landlord hold bond in private account or must they lodge with Tenancy Services within 23 days in New Zealand?', country: 'New Zealand', exp: 'guidance', src: 'r/newzealand' },

  // ── 3. REDDIT r/PersonalFinanceCanada & r/AusFinance (Taxes, Banking & Gifts) ──
  { id: 'RQL046', cat: 'Reddit_Quora', sub: 'Parental Cash Gift Tax', q: 'Is wire transfer gift from parents taxable in Canada Deed of Gift FINTRAC in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/PersonalFinanceCanada' },
  { id: 'RQL047', cat: 'Reddit_Quora', sub: 'CRA First-Year T1135', q: 'Do I need to report foreign property on CRA form T1135 in my first tax year in Canada in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/PersonalFinanceCanada' },
  { id: 'RQL048', cat: 'Reddit_Quora', sub: 'CRA T1135 Personal Home', q: 'Do I need to report family home abroad on CRA form T1135 personal-use property in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/PersonalFinanceCanada' },
  { id: 'RQL049', cat: 'Reddit_Quora', sub: 'CRA FHSA Newcomer Eligibility', q: 'Can a newcomer open a First Home Savings Account FHSA in their first year of arrival in Canada in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/PersonalFinanceCanada' },
  { id: 'RQL050', cat: 'Reddit_Quora', sub: 'CRA TFSA Non-Resident Penalty', q: 'What is the CRA penalty for contributing to TFSA as a non-resident 1% tax in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/PersonalFinanceCanada' },
  { id: 'RQL051', cat: 'Reddit_Quora', sub: 'CRA Deemed FMV Step-Up', q: 'Does Canada tax foreign capital gains prior to landing fair market value cost base step-up in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/PersonalFinanceCanada' },
  { id: 'RQL052', cat: 'Reddit_Quora', sub: 'CRA Moving Expenses 40km', q: 'Can I deduct moving expenses on form T1-M if I moved 40 kilometres for work in Canada in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/PersonalFinanceCanada' },
  { id: 'RQL053', cat: 'Reddit_Quora', sub: 'Bank Act s.627.17 Opening', q: 'Can a bank refuse to open an account if I do not have a job under Bank Act in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/PersonalFinanceCanada' },
  { id: 'RQL054', cat: 'Reddit_Quora', sub: 'Airport Cash $10k Cap', q: 'What are the customs currency and cash declaration rules above 10000 dollars at airport in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/PersonalFinanceCanada' },
  { id: 'RQL055', cat: 'Reddit_Quora', sub: 'US F-1 OPT FICA Tax Exemption', q: 'Are F-1 students on OPT exempt from Social Security and Medicare FICA taxes in the United States?', country: 'United States', exp: 'guidance', src: 'r/PersonalFinance' },
  { id: 'RQL056', cat: 'Reddit_Quora', sub: 'US Dual-Status 6013(g)', q: 'Can a married dual-status alien make a 6013(g) election to file married filing jointly in the United States?', country: 'United States', exp: 'guidance', src: 'r/PersonalFinance' },
  { id: 'RQL057', cat: 'Reddit_Quora', sub: 'AU Temporary Resident CGT', q: 'Are temporary residents exempt from capital gains tax CGT on foreign assets under Subdivision 768-R in Australia?', country: 'Australia', exp: 'guidance', src: 'r/AusFinance' },
  { id: 'RQL058', cat: 'Reddit_Quora', sub: 'AU Medicare Levy MES', q: 'How to claim Medicare Levy exemption with Medicare Entitlement Statement MES in Australia?', country: 'Australia', exp: 'guidance', src: 'r/AusFinance' },
  { id: 'RQL059', cat: 'Reddit_Quora', sub: 'Ontario ESA Severance vs Notice', q: 'What is the difference between notice of termination and severance pay under Ontario ESA 2.5 million payroll in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/PersonalFinanceCanada' },

  // ── 4. REDDIT / QUORA: HEALTHCARE, PRESCRIPTIONS & CLINICS ──────────────────
  { id: 'RQL060', cat: 'Reddit_Quora', sub: 'OHIP 3-Month Wait Removed', q: 'Is there still a three-month waiting period for OHIP health insurance coverage in Ontario in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/ontario' },
  { id: 'RQL061', cat: 'Reddit_Quora', sub: 'OHIP Identity Documents', q: 'What three original documents do I need to register for OHIP at ServiceOntario in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/ontario' },
  { id: 'RQL062', cat: 'Reddit_Quora', sub: 'BC MSP Waiting Period', q: 'How does the waiting period work for BC MSP medical services plan in Vancouver?', city: 'Vancouver', exp: 'guidance', src: 'r/vancouver' },
  { id: 'RQL063', cat: 'Reddit_Quora', sub: 'Pharmacy Emergency Refill', q: 'Can a pharmacist give me an emergency 30-day refill for blood pressure or insulin without doctor in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/ontario' },
  { id: 'RQL064', cat: 'Reddit_Quora', sub: 'Community Health Centre $0 Cost', q: 'Where can uninsured newcomers without OHIP receive free medical care at Community Health Centres in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/toronto' },
  { id: 'RQL065', cat: 'Reddit_Quora', sub: 'ER Care Without Insurance', q: 'Can an emergency room in Canada deny care if you have no health card or insurance in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/toronto' },
  { id: 'RQL066', cat: 'Reddit_Quora', sub: 'Health811 Nurse Triage', q: 'How to talk to a registered nurse 24/7 for free health advice on Health811 in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/ontario' },
  { id: 'RQL067', cat: 'Reddit_Quora', sub: 'Australia RHCA Medicare', q: 'Can visitors from Reciprocal Health Care Agreement RHCA countries enroll in Medicare in Australia?', country: 'Australia', exp: 'guidance', src: 'r/AusVisa' },

  // ── 5. REDDIT / QUORA: DRIVING, EXTRACTS & LICENCE CONVERSION ───────────────
  { id: 'RQL068', cat: 'Reddit_Quora', sub: 'Foreign Licence G1 Skip', q: 'How to bypass 12 month G1 wait with official driving extract experience credit in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/OntarioLandlord' },
  { id: 'RQL069', cat: 'Reddit_Quora', sub: 'Auto Insurance Experience Letter', q: 'How does an official insurance claims-free letter from home country reduce Ontario auto insurance in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/PersonalFinanceCanada' },
  { id: 'RQL070', cat: 'Reddit_Quora', sub: 'ATIO Certified Translation', q: 'Where can I get an ATIO certified translation for a foreign driver licence in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/toronto' },
  { id: 'RQL071', cat: 'Reddit_Quora', sub: 'First 90 Days Driving Rule', q: 'How many days can a newcomer drive in Ontario on a foreign licence in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/ontario' },
  { id: 'RQL072', cat: 'Reddit_Quora', sub: 'Reciprocal Licence Exchange', q: 'Which countries have direct reciprocal driver licence exchange with Ontario in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/ontario' },

  // ── 6. REDDIT / QUORA: SCHOOLING, ISPA VACCINES & WELCOME CENTRES ───────────
  { id: 'RQL073', cat: 'Reddit_Quora', sub: 'Education Act s.49.2 Tuition-Free', q: 'Can a school board charge tuition for children of work permit holders under Education Act in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/ImmigrationCanada' },
  { id: 'RQL074', cat: 'Reddit_Quora', sub: 'ISPA Mandatory School Vaccines', q: 'What vaccines are mandatory for school enrollment under Immunization of School Pupils Act in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/ontario' },
  { id: 'RQL075', cat: 'Reddit_Quora', sub: 'ISPA School Suspension Risk', q: 'Can a child be suspended from school for missing vaccine records under ISPA in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/ontario' },
  { id: 'RQL076', cat: 'Reddit_Quora', sub: 'ISPA Conscience Exemption Form 2', q: 'How to file a statement of conscience religious belief affidavit exemption under ISPA in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/ontario' },
  { id: 'RQL077', cat: 'Reddit_Quora', sub: 'STEP ESL Welcome Centre', q: 'What is the STEP English language assessment at school board welcome centres in Mississauga?', city: 'Mississauga', exp: 'guidance', src: 'r/mississauga' },
  { id: 'RQL078', cat: 'Reddit_Quora', sub: 'CWELCC $22 Daycare Subsidy', q: 'How does the CWELCC ten dollar a day child care subsidy work in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/PersonalFinanceCanada' },

  // ── 7. REDDIT / QUORA: TELECOM, SCAMS, CRISIS & EMERGENCY ───────────────────
  { id: 'RQL079', cat: 'Reddit_Quora', sub: 'CRTC Wireless Unlocked Phones', q: 'Can Canadian mobile carriers lock your phone or charge unlocking fees under CRTC rules in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/PersonalFinanceCanada' },
  { id: 'RQL080', cat: 'Reddit_Quora', sub: 'CCTS Billing Dispute Complaint', q: 'How to file a complaint against a mobile phone provider with the CCTS in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/canada' },
  { id: 'RQL081', cat: 'Reddit_Quora', sub: 'Stolen SIN Fraud Alert', q: 'What steps should I take immediately if my Social Insurance Number SIN is stolen in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/PersonalFinanceCanada' },
  { id: 'RQL082', cat: 'Reddit_Quora', sub: 'CBSA Deportation Phone Scam', q: 'How to report fake CBSA or police deportation phone scam to Canadian Anti-Fraud Centre in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/toronto' },
  { id: 'RQL083', cat: 'Reddit_Quora', sub: 'Police Non-Emergency Numbers', q: 'What is the non-emergency police number for reporting illegal lockouts in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/toronto' },

  // ── 8. LINKEDIN / PROFESSIONAL CAREERS & RECOGNITION ────────────────────────
  { id: 'RQL084', cat: 'LinkedIn_Careers', sub: 'PEO Canadian Experience Ban', q: 'Has Ontario repealed the Canadian work experience requirement for professional engineers PEO in Toronto?', city: 'Toronto', exp: 'guidance', src: 'LinkedIn' },
  { id: 'RQL085', cat: 'LinkedIn_Careers', sub: 'ATS Resume Privacy Standards', q: 'Should I include my photo, marital status, or date of birth on a Canadian resume in Toronto?', city: 'Toronto', exp: 'guidance', src: 'LinkedIn' },
  { id: 'RQL086', cat: 'LinkedIn_Careers', sub: 'CPA International Assessment', q: 'How do international accountants transition foreign qualifications with CPA Ontario in Toronto?', city: 'Toronto', exp: 'guidance', src: 'LinkedIn' },
  { id: 'RQL087', cat: 'LinkedIn_Careers', sub: 'NNAS Nursing Credential Review', q: 'What is the NNAS Advisory Report process for internationally educated nurses in Toronto?', city: 'Toronto', exp: 'guidance', src: 'LinkedIn' },
  { id: 'RQL088', cat: 'LinkedIn_Careers', sub: 'OCT Teacher Certification', q: 'How do foreign trained teachers apply for certification with Ontario College of Teachers OCT in Toronto?', city: 'Toronto', exp: 'guidance', src: 'LinkedIn' },

  // ── 9. REDDIT: MULTI-COUNTRY CROSS-BORDER PRACTICAL COMPARISONS ─────────────
  { id: 'RQL089', cat: 'Reddit_Quora', sub: 'UK NHS GP Registration', q: 'Can a Skilled Worker register with an NHS GP surgery for free in the United Kingdom?', country: 'United Kingdom', exp: 'guidance', src: 'r/ukvisa' },
  { id: 'RQL090', cat: 'Reddit_Quora', sub: 'UK Council Tax Exemption', q: 'Are full-time international students exempt from UK Council Tax in the United Kingdom?', country: 'United Kingdom', exp: 'guidance', src: 'r/ukvisa' },
  { id: 'RQL091', cat: 'Reddit_Quora', sub: 'Germany Anmeldung Registration', q: 'How many days do newcomers have to complete Anmeldung address registration in Germany?', country: 'Germany', exp: 'guidance', src: 'r/germany' },
  { id: 'RQL092', cat: 'Reddit_Quora', sub: 'Germany Sperrkonto Blocked Account', q: 'What is the blocked account Sperrkonto requirement for student visas in Germany?', country: 'Germany', exp: 'guidance', src: 'r/germany' },
  { id: 'RQL093', cat: 'Reddit_Quora', sub: 'Australia TFN Tax File Number', q: 'How to apply for an Australian Tax File Number TFN online after arrival in Australia?', country: 'Australia', exp: 'guidance', src: 'r/AusFinance' },
  { id: 'RQL094', cat: 'Reddit_Quora', sub: 'Australia 100-Point Bank ID', q: 'What documents satisfy the 100-point identity check for opening a bank account in Australia?', country: 'Australia', exp: 'guidance', src: 'r/AusFinance' },
  { id: 'RQL095', cat: 'Reddit_Quora', sub: 'Dubai Emirates ID Requirement', q: 'What medical fitness test is required before receiving an Emirates ID in the UAE?', country: 'United Arab Emirates', exp: 'guidance', src: 'r/dubai' },
  { id: 'RQL096', cat: 'Reddit_Quora', sub: 'Dubai Ejari Tenancy Registration', q: 'How to register a residential tenancy contract with Ejari in Dubai UAE?', country: 'United Arab Emirates', exp: 'guidance', src: 'r/dubai' },
  { id: 'RQL097', cat: 'Reddit_Quora', sub: 'Ireland PPSN Number Application', q: 'What documents are required to apply for a PPS Number PPSN in Ireland?', country: 'Ireland', exp: 'guidance', src: 'r/MoveToIreland' },
  { id: 'RQL098', cat: 'Reddit_Quora', sub: 'NZ IRD Tax Number Application', q: 'How do new migrants apply for an IRD number with Inland Revenue in New Zealand?', country: 'New Zealand', exp: 'guidance', src: 'r/newzealand' },

  // ── 10. TRICKY, AMBIGUOUS & BOUNDARY TEST QUESTIONS (DETECT PROBLEMS) ────────
  { id: 'RQL099', cat: 'Boundary_Problem', sub: 'Missing Location', q: 'How much is the deposit for an apartment?', exp: 'clarification', note: 'Missing location -> engine clarifies' },
  { id: 'RQL100', cat: 'Boundary_Problem', sub: 'Missing Licence Country', q: 'How do I exchange my driving licence for a full G licence in Toronto?', city: 'Toronto', exp: 'clarification', note: 'Missing origin licence country' },
  { id: 'RQL101', cat: 'Boundary_Problem', sub: 'Unsupported Destination', q: 'How do I apply for a residence permit and health insurance in Tokyo Japan?', exp: 'clarification', note: 'Unsupported destination' },
  { id: 'RQL102', cat: 'Boundary_Problem', sub: 'Unsupported European City', q: 'What are the rules for tenant deposits under Loi ALUR in Paris France?', exp: 'clarification', note: 'France/Paris out of pilot' },
  { id: 'RQL103', cat: 'Boundary_Problem', sub: 'Multi-Country Conflict', q: 'Can I use my Australian Medicare card in Toronto Canada?', exp: 'clarification', note: 'Conflicting destinations' },
  { id: 'RQL104', cat: 'Boundary_Problem', sub: 'Single Word SIN', q: 'SIN', exp: 'guidance', note: 'Single token SIN' },
  { id: 'RQL105', cat: 'Boundary_Problem', sub: 'Single Word OHIP', q: 'OHIP', exp: 'guidance', note: 'Single token OHIP' },
  { id: 'RQL106', cat: 'Boundary_Problem', sub: 'Eviction Toronto', q: 'Eviction notice in Toronto', city: 'Toronto', exp: 'guidance', note: 'Short eviction query' },
  { id: 'RQL107', cat: 'Boundary_Problem', sub: 'Fake Government Dept', q: 'Can the Canadian Ministry of Alien Welfare deport me in Toronto?', city: 'Toronto', exp: 'guidance', note: 'Anti-fraud / deportation protection' },
  { id: 'RQL108', cat: 'Boundary_Problem', sub: 'First Week Toronto', q: 'What should I do during my first week in Toronto?', city: 'Toronto', exp: 'guidance', note: 'Arrival checklist' },

  // ── 11. ADDITIONAL 66 QUORA & REDDIT PRACTICAL REALITY QUESTIONS ────────────
  { id: 'RQL109', cat: 'Reddit_Quora', sub: 'Rent With Cash Only', q: 'Can a landlord refuse to rent to me if I only have foreign cash or traveller cheques in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/OntarioLandlord' },
  { id: 'RQL110', cat: 'Reddit_Quora', sub: 'Air B4 BSF186 Customs', q: 'What is CBSA Form BSF186 personal effects accounting document for settler goods in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/ImmigrationCanada' },
  { id: 'RQL111', cat: 'Reddit_Quora', sub: 'Goods to Follow BSF186A', q: 'How do I declare goods to follow on CBSA form BSF186A at airport customs in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/ImmigrationCanada' },
  { id: 'RQL112', cat: 'Reddit_Quora', sub: 'Jewelry Declaration PoR', q: 'Do I have to declare personal jewelry and gold brought with me at customs in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/ImmigrationCanada' },
  { id: 'RQL113', cat: 'Reddit_Quora', sub: 'Duty Free Settler Goods', q: 'Are used household items duty free for permanent residents landing in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/ImmigrationCanada' },
  { id: 'RQL114', cat: 'Reddit_Quora', sub: 'Carrying Gold Coins CBSA', q: 'Do I have to declare gold bullion or foreign coins above ten thousand dollars in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/PersonalFinanceCanada' },
  { id: 'RQL115', cat: 'Reddit_Quora', sub: 'FinCEN 105 Cash USA', q: 'What is FinCEN Form 105 for reporting currency above 10000 dollars in the United States?', country: 'United States', exp: 'guidance', src: 'r/PersonalFinance' },
  { id: 'RQL116', cat: 'Reddit_Quora', sub: 'CRA RC151 GST Credit', q: 'How do new immigrants apply for GST HST credit using form RC151 in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/PersonalFinanceCanada' },
  { id: 'RQL117', cat: 'Reddit_Quora', sub: 'Climate Action Rebate CCR', q: 'Are newcomers eligible for the Canada Carbon Rebate CCR in Ontario in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/PersonalFinanceCanada' },
  { id: 'RQL118', cat: 'Reddit_Quora', sub: 'Ontario Trillium Benefit OTB', q: 'How do low income newcomers apply for Ontario Trillium Benefit OTB in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/PersonalFinanceCanada' },
  { id: 'RQL119', cat: 'Reddit_Quora', sub: 'SIN Disclosure Employer', q: 'When is it legally mandatory to provide my SIN to an employer in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/PersonalFinanceCanada' },
  { id: 'RQL120', cat: 'Reddit_Quora', sub: 'SIN Disclosure Landlord', q: 'Can a landlord legally demand my Social Insurance Number on a rental application in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/OntarioLandlord' },
  { id: 'RQL121', cat: 'Reddit_Quora', sub: 'Credit Check Without SIN', q: 'Can a landlord run a credit check without my SIN using Equifax or TransUnion in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/OntarioLandlord' },
  { id: 'RQL122', cat: 'Reddit_Quora', sub: 'Secured Credit Card 720', q: 'How to build Canadian credit score from zero with a secured credit card in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/PersonalFinanceCanada' },
  { id: 'RQL123', cat: 'Reddit_Quora', sub: 'Credit Utilization Under 30', q: 'What is the recommended credit utilization ratio for fast credit score growth in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/PersonalFinanceCanada' },
  { id: 'RQL124', cat: 'Reddit_Quora', sub: 'Hard vs Soft Inquiries', q: 'Do hard credit inquiries from credit card applications lower credit score in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/PersonalFinanceCanada' },
  { id: 'RQL125', cat: 'Reddit_Quora', sub: 'Bank Two-Document Rule', q: 'What two documents are required to open a bank account under Bank Act in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/PersonalFinanceCanada' },
  { id: 'RQL126', cat: 'Reddit_Quora', sub: 'Bank Teller Refusal Rights', q: 'What should I do if a bank teller refuses to open an account under FCAC guidance in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/PersonalFinanceCanada' },
  { id: 'RQL127', cat: 'Reddit_Quora', sub: 'DriveTest Eye Exam', q: 'What vision test and knowledge test are required at DriveTest for G1 in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/ontario' },
  { id: 'RQL128', cat: 'Reddit_Quora', sub: 'DriveTest Experience Letter', q: 'What details must an official driving history extract contain for MTO credit in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/ontario' },
  { id: 'RQL129', cat: 'Reddit_Quora', sub: 'Beginner Driver Education BDE', q: 'How does an MTO approved BDE driving course reduce insurance rates in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/ontario' },
  { id: 'RQL130', cat: 'Reddit_Quora', sub: 'Winter Tires Insurance Discount', q: 'Does installing winter tires give an auto insurance discount in Ontario in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/ontario' },
  { id: 'RQL131', cat: 'Reddit_Quora', sub: 'Community Pharmacy Bridge', q: 'What chronic medications can a community pharmacist prescribe an emergency bridge for in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/ontario' },
  { id: 'RQL132', cat: 'Reddit_Quora', sub: 'Glucophage Generic Canada', q: 'What is the generic equivalent for Glucophage diabetes medication in Canada in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/ontario' },
  { id: 'RQL133', cat: 'Reddit_Quora', sub: 'Lipitor Generic Canada', q: 'What is the generic bioequivalent for Lipitor cholesterol medicine in Canada in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/ontario' },
  { id: 'RQL134', cat: 'Reddit_Quora', sub: 'Synthroid Generic Canada', q: 'What is the domestic generic equivalent for Synthroid thyroid medication in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/ontario' },
  { id: 'RQL135', cat: 'Reddit_Quora', sub: 'Ventolin Generic Canada', q: 'What is the generic inhaler equivalent for Ventolin asthma medication in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/ontario' },
  { id: 'RQL136', cat: 'Reddit_Quora', sub: 'Norvasc Generic Canada', q: 'What is the generic equivalent for Norvasc blood pressure medication in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/ontario' },
  { id: 'RQL137', cat: 'Reddit_Quora', sub: 'Walk In vs Emergency Room', q: 'When should I go to a walk-in clinic instead of the hospital emergency room in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/toronto' },
  { id: 'RQL138', cat: 'Reddit_Quora', sub: 'Urgent Care Centre XRay', q: 'What is the difference between urgent care and emergency department in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/toronto' },
  { id: 'RQL139', cat: 'Reddit_Quora', sub: 'Health Care Connect Waitlist', q: 'How to register on Health Care Connect to find a family doctor in Ontario in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/ontario' },
  { id: 'RQL140', cat: 'Reddit_Quora', sub: 'ISPA DTaP Vaccine Doses', q: 'How many DTaP IPV doses are mandatory for school children under ISPA in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/ontario' },
  { id: 'RQL141', cat: 'Reddit_Quora', sub: 'ISPA MMR Vaccine Doses', q: 'When must children receive their two MMR vaccine doses under ISPA in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/ontario' },
  { id: 'RQL142', cat: 'Reddit_Quora', sub: 'ISPA Varicella Requirement', q: 'Are children born after 2010 required to have varicella chickenpox vaccines in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/ontario' },
  { id: 'RQL143', cat: 'Reddit_Quora', sub: 'ISPA Medical Exemption Form 1', q: 'What doctor certification is needed for a medical exemption under ISPA in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/ontario' },
  { id: 'RQL144', cat: 'Reddit_Quora', sub: 'Kindergarten Junior Senior Age', q: 'What age does a child start Junior Kindergarten and Senior Kindergarten in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/toronto' },
  { id: 'RQL145', cat: 'Reddit_Quora', sub: 'TDSB Catchment Guarantee', q: 'Can a public school in Toronto refuse admission if you live in the catchment in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/toronto' },
  { id: 'RQL146', cat: 'Reddit_Quora', sub: 'PDSB Welcome Centre STEP', q: 'Where is the Peel District School Board We Welcome World centre in Mississauga?', city: 'Mississauga', exp: 'guidance', src: 'r/mississauga' },
  { id: 'RQL147', cat: 'Reddit_Quora', sub: 'Criminal Code 184 Audio Recording', q: 'Can I legally record phone calls with my landlord without telling them in Ontario in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/OntarioLandlord' },
  { id: 'RQL148', cat: 'Reddit_Quora', sub: 'LTB Form T2 Tenant Rights', q: 'How to file LTB Form T2 for landlord harassment or illegal entry in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/OntarioLandlord' },
  { id: 'RQL149', cat: 'Reddit_Quora', sub: 'LTB Form T1 Illegal Deposit', q: 'How to recover an illegal damage or security deposit using LTB Form T1 in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/OntarioLandlord' },
  { id: 'RQL150', cat: 'Reddit_Quora', sub: 'LTB Rent Abatement Calculator', q: 'What percentage rent abatement can the LTB award for lack of vital services in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/OntarioLandlord' },
  { id: 'RQL151', cat: 'Reddit_Quora', sub: 'LTB 35000 Dollar Jurisdiction', q: 'What is the monetary claim limit for damages at the Landlord and Tenant Board in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/OntarioLandlord' },
  { id: 'RQL152', cat: 'Reddit_Quora', sub: 'RHEU Enforcement Unit', q: 'How does the Rental Housing Enforcement Unit RHEU stop illegal lockouts in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/OntarioLandlord' },
  { id: 'RQL153', cat: 'Reddit_Quora', sub: 'Police Duty Keep Peace Lockout', q: 'What can police officers do if a landlord changes the locks illegally tonight in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/OntarioLandlord' },
  { id: 'RQL154', cat: 'Reddit_Quora', sub: 'CAFC Identity Theft Report', q: 'How to file a report with Canadian Anti-Fraud Centre for identity theft in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/PersonalFinanceCanada' },
  { id: 'RQL155', cat: 'Reddit_Quora', sub: 'Equifax TransUnion Fraud Alert', q: 'How to place a 6-year fraud alert on Equifax and TransUnion credit reports in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/PersonalFinanceCanada' },
  { id: 'RQL156', cat: 'Reddit_Quora', sub: 'CRA Fraud Line Lock Account', q: 'How to contact the CRA fraud prevention desk to lock my online tax account in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/PersonalFinanceCanada' },
  { id: 'RQL157', cat: 'Reddit_Quora', sub: 'Calgary 0% PST Advantage', q: 'Does Alberta have a provincial sales tax PST compared to Ontario HST in Calgary?', city: 'Calgary', exp: 'guidance', src: 'r/PersonalFinanceCanada' },
  { id: 'RQL158', cat: 'Reddit_Quora', sub: 'Montreal Bill 96 Language', q: 'What are the French language requirements under Bill 96 in Montreal Quebec?', city: 'Montreal', exp: 'guidance', src: 'r/montreal' },
  { id: 'RQL159', cat: 'Reddit_Quora', sub: 'Ottawa Bilinguality Housing', q: 'Is Ottawa bilingual for municipal and settlement services in Ontario in Ottawa?', city: 'Ottawa', exp: 'guidance', src: 'r/ottawa' },
  { id: 'RQL160', cat: 'Reddit_Quora', sub: 'Vancouver ICBC Driving Exchange', q: 'How does ICBC exchange foreign driving licences in Vancouver British Columbia?', city: 'Vancouver', exp: 'guidance', src: 'r/vancouver' },
  { id: 'RQL161', cat: 'Reddit_Quora', sub: 'Vancouver RTB Dispute Resolution', q: 'How do tenants file dispute resolution with the Residential Tenancy Branch RTB in Vancouver?', city: 'Vancouver', exp: 'guidance', src: 'r/vancouver' },
  { id: 'RQL162', cat: 'Reddit_Quora', sub: 'BC Services Card Photo ID', q: 'What is the combined BC Driver Licence and Services Card in Vancouver?', city: 'Vancouver', exp: 'guidance', src: 'r/vancouver' },
  { id: 'RQL163', cat: 'Reddit_Quora', sub: 'Mississauga Square One MiWay', q: 'How to take MiWay transit from Square One terminal in Mississauga?', city: 'Mississauga', exp: 'guidance', src: 'r/mississauga' },
  { id: 'RQL164', cat: 'Reddit_Quora', sub: 'Brampton Transit PRESTO Card', q: 'Where can I buy and load a PRESTO card for Brampton Transit in Brampton?', city: 'Brampton', exp: 'guidance', src: 'r/brampton' },
  { id: 'RQL165', cat: 'Reddit_Quora', sub: 'Ontario Photo Card Non-Driver', q: 'Can I get an Ontario Photo Card if I do not have a driver licence in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/ontario' },
  { id: 'RQL166', cat: 'Reddit_Quora', sub: 'ServiceOntario Address Change', q: 'How many days do I have to update my address with ServiceOntario in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/ontario' },
  { id: 'RQL167', cat: 'Reddit_Quora', sub: 'Newborn 5-in-1 Baby Registration', q: 'How does the 5-in-1 online newborn registration work for birth certificate in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/ontario' },
  { id: 'RQL168', cat: 'Reddit_Quora', sub: 'IRCC Web Form Inquiry', q: 'When should I submit an IRCC Web Form to check on a delayed application in Toronto?', city: 'Toronto', exp: 'guidance', src: 'r/ImmigrationCanada' }
];

// Combine all suites into the master 520+ evaluation suite
export const master500EvaluationSuite = [
  ...suite180,              // 180 questions (Core Baseline & 54 Countries)
  ...technical120Suite,      // 120 questions (Profile-Based Technical Scenarios)
  ...bot50Suite,             // 50 questions (Conversational Chains & Twisted Cases)
  ...redditQuoraLinkedInSuite // 168 questions (Mined from Quora, Reddit, LinkedIn, Tribunals)
];
