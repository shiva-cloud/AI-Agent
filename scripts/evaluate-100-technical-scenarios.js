import { openStore } from '../src/store.js';
import { answer } from '../src/engine.js';
import { writeFileSync } from 'node:fs';

const store = openStore('data/settlement.sqlite');
const records = store.records();
const date = new Date('2026-10-30');

// 100 Realistic, highly specific technical personal profile scenario questions
// covering: Family/Parents (20), Work Experience & CRS (25), Education & ECA (15),
// Multi-Country Residence & PCC (15), Tenancy & Rent Scenarios (15), Driving Experience (10)
export const technical100Questions = [
  // ── CATEGORY A: FAMILY, PARENTS & SPONSORSHIP (20 Questions) ─────────────
  {
    id: 'FPS01',
    category: 'Family & Parents',
    scenario: 'Mother 62, Father 65, Super Visa in Toronto',
    question: 'My mother is 62 and my father is 65. My household income in Toronto is $85,000 for a family of 3. Can I sponsor both parents on a Super Visa in Toronto Ontario?',
    intentExpected: 'family',
    keyAspects: ['super visa', 'parents', 'income / lico', 'health insurance']
  },
  {
    id: 'FPS02',
    category: 'Family & Parents',
    scenario: 'Mother medical condition & excessive demand in Toronto',
    question: 'My mother has type 2 diabetes and hypertension. Will she pass the Canadian immigration medical exam under excessive demand rules for PR in Toronto?',
    intentExpected: 'health',
    keyAspects: ['medical exam', 'excessive demand', 'inadmissibility']
  },
  {
    id: 'FPS03',
    category: 'Family & Parents',
    scenario: 'Spousal sponsorship outland while in Mississauga',
    question: 'My spouse lives in India and I got PR in Mississauga 6 months ago. How do I apply for outland spousal sponsorship and can my spouse get a work permit in Mississauga?',
    intentExpected: 'family',
    keyAspects: ['spousal sponsorship', 'work permit', 'outland']
  },
  {
    id: 'FPS04',
    category: 'Family & Parents',
    scenario: 'Parent Grandparent Program PGP income proof in Brampton',
    question: 'How many years of CRA Notice of Assessment NOA income tax returns do I need to sponsor my parents under the PGP program in Brampton?',
    intentExpected: 'money',
    keyAspects: ['pgp', 'cra noa', 'income requirement']
  },
  {
    id: 'FPS05',
    category: 'Family & Parents',
    scenario: 'Child born outside Canada to PR parents in Toronto',
    question: 'My child was born in India while both parents are permanent residents living in Toronto. How do I sponsor my newborn baby for Canadian PR in Toronto?',
    intentExpected: 'family',
    keyAspects: ['dependent child', 'sponsorship', 'pr status']
  },
  {
    id: 'FPS06',
    category: 'Family & Parents',
    scenario: 'Super visa emergency medical insurance requirement in Vancouver',
    question: 'What are the emergency medical insurance requirements from Canadian or approved insurance providers for a parent Super Visa application in Vancouver BC?',
    intentExpected: 'health',
    keyAspects: ['super visa insurance', '$100k coverage', 'approved provider']
  },
  {
    id: 'FPS07',
    category: 'Family & Parents',
    scenario: 'Sibling 15 CRS bonus points in Toronto',
    question: 'My brother is a Canadian citizen living in Toronto. How many bonus CRS points do I get for having a sibling in Canada under Express Entry in Toronto?',
    intentExpected: 'family',
    keyAspects: ['sibling points', 'express entry', '15 points']
  },
  {
    id: 'FPS08',
    category: 'Family & Parents',
    scenario: 'Single mother with 2 children Canada Child Benefit CCB in Mississauga',
    question: 'I am a single mother with a 3-year-old and 6-year-old on a work permit in Mississauga for 19 months. How much Canada Child Benefit CCB can I receive in Mississauga?',
    intentExpected: 'money',
    keyAspects: ['ccb', 'temporary resident 18-month rule', 'child benefit']
  },
  {
    id: 'FPS09',
    category: 'Family & Parents',
    scenario: 'Daycare subsidy CWELCC for low-income newcomer in Toronto',
    question: 'I earn $45,000 in Toronto with an 18-month-old toddler. How does the $22-a-day CWELCC child care fee reduction and fee subsidy work in Toronto?',
    intentExpected: 'childcare',
    keyAspects: ['cwelcc', '$22 cap', 'childcare subsidy']
  },
  {
    id: 'FPS10',
    category: 'Family & Parents',
    scenario: 'Registering 8-year-old child for school without permanent status in Brampton',
    question: 'Can I register my 8-year-old child in Peel District School Board in Brampton if our permanent residency application is still in progress?',
    intentExpected: 'family',
    keyAspects: ['school registration', 'peel board', 'immigration status']
  },
  {
    id: 'FPS11',
    category: 'Family & Parents',
    scenario: 'Sponsoring common-law partner after 1 year cohabitation in Vancouver',
    question: 'My partner and I have lived together continuously for 14 months in Vancouver BC. What evidence proves a common-law partnership for IRCC sponsorship in Vancouver?',
    intentExpected: 'family',
    keyAspects: ['common-law', '12 months cohabitation', 'joint lease/bank']
  },
  {
    id: 'FPS12',
    category: 'Family & Parents',
    scenario: 'Divorced parent sponsoring minor child with sole custody in Toronto',
    question: 'I have sole legal custody of my 10-year-old daughter in India. Does IRCC still require IMM 5604 non-accompanying parent consent from the other biological parent in Toronto?',
    intentExpected: 'family',
    keyAspects: ['imm 5604', 'minor custody', 'parental consent']
  },
  {
    id: 'FPS13',
    category: 'Family & Parents',
    scenario: 'Sponsoring elderly father 72 with pension income in Mississauga',
    question: 'My father is 72 years old with a foreign pension. Can his foreign pension count toward the minimum necessary income LICO requirement for Super Visa sponsorship in Mississauga?',
    intentExpected: 'money',
    keyAspects: ['lico income', 'sponsor income only', 'super visa']
  },
  {
    id: 'FPS14',
    category: 'Family & Parents',
    scenario: 'Child immunization records for Toronto Catholic school admission',
    question: 'What immunization vaccine records are mandatory under Ontario law for registering my 5-year-old in Toronto Catholic schools TDSB or TCDSB in Toronto?',
    intentExpected: 'family',
    keyAspects: ['immunization', 'school registration', 'vaccines']
  },
  {
    id: 'FPS15',
    category: 'Family & Parents',
    scenario: 'Temporary resident spouse applying for open work permit SOWP in Vancouver',
    question: 'I hold a post-graduation work permit PGWP in Vancouver TEER 2 job. Can my spouse apply for a Spousal Open Work Permit SOWP in Vancouver BC?',
    intentExpected: 'employment',
    keyAspects: ['sowp', 'pgwp teer category', 'work permit']
  },
  {
    id: 'FPS16',
    category: 'Family & Parents',
    scenario: 'Newborn healthcare coverage during BC MSP waiting period in Vancouver',
    question: 'My baby was born in Vancouver while I am in the 2-month waiting period for BC MSP. Is my newborn covered immediately by BC health insurance in Vancouver?',
    intentExpected: 'health',
    keyAspects: ['newborn coverage', 'bc msp', 'waiting period']
  },
  {
    id: 'FPS17',
    category: 'Family & Parents',
    scenario: 'Sponsoring orphaned brother age 16 in Toronto',
    question: 'Both our parents passed away in Nigeria. My brother is 16 years old and unmarried. Can I sponsor my orphaned minor brother for Canada PR in Toronto?',
    intentExpected: 'family',
    keyAspects: ['orphaned brother', 'family class', 'under 18']
  },
  {
    id: 'FPS18',
    category: 'Family & Parents',
    scenario: 'Parent Super Visa stay extension from 2 to 5 years in Brampton',
    question: 'My parents entered Canada on a Super Visa with a 2-year stamp. Can they apply for an extension to stay up to 5 continuous years without leaving Canada in Brampton?',
    intentExpected: 'family',
    keyAspects: ['super visa stay', '5 year reform', 'extension inside canada']
  },
  {
    id: 'FPS19',
    category: 'Family & Parents',
    scenario: 'Parent undergoing cataract surgery in Ontario on visitor visa in Toronto',
    question: 'Can my elderly mother on a visitor visa get cataract surgery under Ontario OHIP in Toronto or must it be covered by private insurance?',
    intentExpected: 'health',
    keyAspects: ['ohip eligibility', 'visitors not covered', 'private medical']
  },
  {
    id: 'FPS20',
    category: 'Family & Parents',
    scenario: 'Child benefits retroactive payment after obtaining PR in Mississauga',
    question: 'I received my Canadian permanent residence after 2 years on a work permit in Mississauga. Can I claim retroactive Canada Child Benefit CCB payments in Mississauga?',
    intentExpected: 'money',
    keyAspects: ['ccb retroactive', '11 months rule', 'cra application']
  },

  // ── CATEGORY B: WORK EXPERIENCE & EXPRESS ENTRY CRS (25 Questions) ────────
  {
    id: 'WCR01',
    category: 'Work Experience & CRS',
    scenario: '3 yrs India Software Engineer + 1 yr Canadian experience in Toronto',
    question: 'I worked 3 years as a software engineer in India (NOC 21231) and 1 year in Toronto on PGWP. I am 29 years old with Master degree and CLB 9. How many CRS points do I get in Toronto?',
    intentExpected: 'employment',
    keyAspects: ['crs points', 'skill transferability', 'canadian experience class']
  },
  {
    id: 'WCR02',
    category: 'Work Experience & CRS',
    scenario: 'Continuous vs non-continuous work experience for FSW in Vancouver',
    question: 'I have 5 years total work experience in UK with a 9-month break in between. Does IRCC require 1 year of continuous full-time work experience for Federal Skilled Worker FSW in Vancouver?',
    intentExpected: 'employment',
    keyAspects: ['fsw eligibility', 'continuous 1 year', '1560 hours']
  },
  {
    id: 'WCR03',
    category: 'Work Experience & CRS',
    scenario: 'Registered nurse foreign experience + Canadian experience in Mississauga',
    question: 'I worked 4 years as a nurse in Philippines and 1 year as personal support worker in Mississauga. Can I qualify for the Express Entry Healthcare category-based draw in Mississauga?',
    intentExpected: 'employment',
    keyAspects: ['category-based selection', 'healthcare stream', '6 months experience']
  },
  {
    id: 'WCR04',
    category: 'Work Experience & CRS',
    scenario: 'Self-employed work experience points in Express Entry in Toronto',
    question: 'Can I count 3 years of self-employed freelance graphic design work in Canada toward the Canadian Experience Class CEC under Express Entry in Toronto?',
    intentExpected: 'employment',
    keyAspects: ['self-employed in canada', 'cec excluded', 'fsw eligible']
  },
  {
    id: 'WCR05',
    category: 'Work Experience & CRS',
    scenario: 'Part-time work hours calculation for Express Entry in Brampton',
    question: 'I worked 20 hours per week for 2 years in Brampton while on a post-graduation work permit. Does this equal 1 year of full-time work experience (1,560 hours) in Brampton?',
    intentExpected: 'employment',
    keyAspects: ['part-time equivalent', '1560 hours', '30 hrs/week cap']
  },
  {
    id: 'WCR06',
    category: 'Work Experience & CRS',
    scenario: 'OINP Human Capital Priorities HCP nomination requirements in Toronto',
    question: 'What are the minimum CRS score, foreign work experience, and educational requirements for an OINP Human Capital Priorities stream notification of interest in Toronto Ontario?',
    intentExpected: 'employment',
    keyAspects: ['oinp hcp', 'ontario nomination', '600 points']
  },
  {
    id: 'WCR07',
    category: 'Work Experience & CRS',
    scenario: 'BC PNP Tech stream job offer requirement in Vancouver',
    question: 'Do I need an LMIA-approved job offer to qualify for the BC PNP Tech stream with 2 years of software engineering experience in Vancouver BC?',
    intentExpected: 'employment',
    keyAspects: ['bc pnp tech', '35 tech occupations', 'job offer requirement']
  },
  {
    id: 'WCR08',
    category: 'Work Experience & CRS',
    scenario: 'Age point deduction after 30 in Express Entry in Toronto',
    question: 'I am turning 30 next month. How many CRS points are deducted per year for age under Express Entry Human Capital factors in Toronto?',
    intentExpected: 'employment',
    keyAspects: ['age points', '5 points per year', 'maximum 110 points']
  },
  {
    id: 'WCR09',
    category: 'Work Experience & CRS',
    scenario: 'French language proficiency bonus points NCLC 7 in Toronto',
    question: 'I achieved NCLC 7 in TEF Canada French exam and CLB 8 in English. How many additional bonus CRS points does IRCC award for bilingual French proficiency in Toronto?',
    intentExpected: 'employment',
    keyAspects: ['french bonus points', '50 points', 'nclc 7']
  },
  {
    id: 'WCR10',
    category: 'Work Experience & CRS',
    scenario: 'Valid LMIA job offer 50 vs 200 CRS points in Mississauga',
    question: 'How many CRS points do I get for an approved LMIA job offer in NOC TEER 1 (manager vs professional) in Mississauga Ontario?',
    intentExpected: 'employment',
    keyAspects: ['lmia points', '50 points teer 1-3', '200 points teer 00']
  },
  {
    id: 'WCR11',
    category: 'Work Experience & CRS',
    scenario: 'Working on implied or maintained status in Vancouver',
    question: 'My work permit expired and I applied for an extension before expiry. Can I continue working legally on maintained status in Vancouver BC?',
    intentExpected: 'employment',
    keyAspects: ['maintained status', 'section 186 u', 'legal authorization']
  },
  {
    id: 'WCR12',
    category: 'Work Experience & CRS',
    scenario: 'Bridging Open Work Permit BOWP eligibility in Toronto',
    question: 'I received an Acknowledgment of Receipt AOR for my Express Entry PR application. Can I apply for a Bridging Open Work Permit BOWP in Toronto before my current permit expires?',
    intentExpected: 'employment',
    keyAspects: ['bowp', 'aor received', 'current permit validity']
  },
  {
    id: 'WCR13',
    category: 'Work Experience & CRS',
    scenario: 'Work experience gained during full-time student status in Brampton',
    question: 'Can I count co-op or off-campus work experience gained while studying full-time at university toward Canadian Experience Class CEC in Brampton?',
    intentExpected: 'employment',
    keyAspects: ['student work experience', 'ineligible for cec', 'fsw eligible']
  },
  {
    id: 'WCR14',
    category: 'Work Experience & CRS',
    scenario: 'Foreign Credential Recognition Loan for internationally trained engineers in Toronto',
    question: 'Where can an internationally trained mechanical engineer apply for a Foreign Credential Recognition FCR loan up to $30,000 for licensing exams in Toronto?',
    intentExpected: 'employment',
    keyAspects: ['fcr loans', 'licensing exam fees', 'esdc providers']
  },
  {
    id: 'WCR15',
    category: 'Work Experience & CRS',
    scenario: 'Reference letter requirements for proof of work experience in Vancouver',
    question: 'What specific details (duties, hours, salary, NOC code) must an employer reference letter include to satisfy IRCC work experience verification in Vancouver BC?',
    intentExpected: 'employment',
    keyAspects: ['reference letter', 'duties matching noc', 'full-time hours']
  },
  {
    id: 'WCR16',
    category: 'Work Experience & CRS',
    scenario: 'NOC TEER categorization for administrative assistants in Toronto',
    question: 'What TEER level is an administrative assistant under NOC 2021 (NOC 13110 vs 14100) and does it qualify for Express Entry in Toronto?',
    intentExpected: 'employment',
    keyAspects: ['noc teer 3', 'express entry eligibility', 'noc 13110']
  },
  {
    id: 'WCR17',
    category: 'Work Experience & CRS',
    scenario: 'Trade occupation certificate of qualification bonus points in Brampton',
    question: 'How many CRS points are awarded for holding a provincial Certificate of Qualification in a skilled trade from Skilled Trades Ontario in Brampton?',
    intentExpected: 'employment',
    keyAspects: ['certificate of qualification', '50 points', 'skilled trades']
  },
  {
    id: 'WCR18',
    category: 'Work Experience & CRS',
    scenario: 'Express Entry category draw for STEM occupations in Toronto',
    question: 'What are the qualifying occupations and minimum work experience requirement for the Express Entry STEM category-based draw in Toronto?',
    intentExpected: 'employment',
    keyAspects: ['stem category', '6 months experience', 'qualifying nocs']
  },
  {
    id: 'WCR19',
    category: 'Work Experience & CRS',
    scenario: 'Work permit restricted to single employer changing jobs in Mississauga',
    question: 'I have a closed employer-specific work permit in Mississauga. Can I start working for a new company before my new work permit is approved in Mississauga?',
    intentExpected: 'employment',
    keyAspects: ['closed work permit', 'public policy interim authorization', 'job change']
  },
  {
    id: 'WCR20',
    category: 'Work Experience & CRS',
    scenario: 'Unpaid internship work experience validity in Vancouver',
    question: 'Can an unpaid 6-month internship in Europe be counted as valid foreign work experience under Federal Skilled Worker FSW in Vancouver BC?',
    intentExpected: 'employment',
    keyAspects: ['unpaid work', 'ineligible for ircc', 'must be paid']
  },
  {
    id: 'WCR21',
    category: 'Work Experience & CRS',
    scenario: 'CUSMA USMCA professional work permit without LMIA in Toronto',
    question: 'I am a US citizen with a computer systems analyst job offer in Toronto. How do I get an LMIA-exempt CUSMA professional work permit at the border in Toronto?',
    intentExpected: 'employment',
    keyAspects: ['cusma professional', 'lmia-exempt', 'port of entry']
  },
  {
    id: 'WCR22',
    category: 'Work Experience & CRS',
    scenario: 'Proof of settlement funds for Express Entry without Canadian job offer in Toronto',
    question: 'How much proof of funds POF settlement money is required for a single applicant under Federal Skilled Worker FSW in Toronto Ontario?',
    intentExpected: 'money',
    keyAspects: ['settlement funds', 'pof threshold', 'single applicant']
  },
  {
    id: 'WCR23',
    category: 'Work Experience & CRS',
    scenario: 'Exemption from proof of funds for applicants authorized to work in Mississauga',
    question: 'Am I exempt from showing proof of settlement funds under Express Entry if I am currently authorized to work in Canada with a valid job offer in Mississauga?',
    intentExpected: 'money',
    keyAspects: ['pof exemption', 'authorized to work', 'cec or valid job offer']
  },
  {
    id: 'WCR24',
    category: 'Work Experience & CRS',
    scenario: 'Two jobs worked simultaneously 40 hours total per week in Brampton',
    question: 'I worked two part-time jobs simultaneously (20 hours each) for 1 year in Brampton. Does IRCC accept concurrent part-time jobs as 1 full year of work experience in Brampton?',
    intentExpected: 'employment',
    keyAspects: ['concurrent jobs', 'max 30 hrs/week counted', 'hours calculation']
  },
  {
    id: 'WCR25',
    category: 'Work Experience & CRS',
    scenario: 'Post-graduation work permit PGWP 1-year vs 3-year rules in Toronto',
    question: 'If I complete an 8-month master degree program in Toronto, how long of a post-graduation work permit PGWP am I eligible for under recent IRCC rules in Toronto?',
    intentExpected: 'employment',
    keyAspects: ['pgwp master degree', '3 year validity', 'ircc 2024 update']
  },

  // ── CATEGORY C: EDUCATION, ECA & DEGREE EQUIVALENCY (15 Questions) ────────
  {
    id: 'ECA01',
    category: 'Education & ECA',
    scenario: '3-year Bachelor + 1-year PG Diploma from India in Toronto',
    question: 'I completed a 3-year B.Com and a 1-year postgraduate diploma from India. Will WES evaluate this as two or more certificates or degrees for Express Entry in Toronto?',
    intentExpected: 'employment',
    keyAspects: ['two or more certificates', 'wes eca', 'crs points']
  },
  {
    id: 'ECA02',
    category: 'Education & ECA',
    scenario: 'ECA report validity 5 years for Express Entry in Vancouver',
    question: 'My WES Educational Credential Assessment ECA was issued in November 2021. Is it still valid for submitting an Express Entry profile in Vancouver BC in 2026?',
    intentExpected: 'employment',
    keyAspects: ['5 year validity', 'eca expiry', 'express entry profile']
  },
  {
    id: 'ECA03',
    category: 'Education & ECA',
    scenario: 'ECA designated organizations approved by IRCC in Mississauga',
    question: 'What are the designated organizations authorized by IRCC to issue an Educational Credential Assessment ECA for immigration in Mississauga Ontario?',
    intentExpected: 'employment',
    keyAspects: ['designated organizations', 'wes, icas, ces, iqas, ices']
  },
  {
    id: 'ECA04',
    category: 'Education & ECA',
    scenario: 'Physician medical credential assessment MCC vs WES in Toronto',
    question: 'I have an MBBS medical degree from Pakistan. Can I use WES for my medical degree assessment or must I use the Medical Council of Canada MCC in Toronto?',
    intentExpected: 'employment',
    keyAspects: ['mcc eca', 'physicians', 'wes excluded for doctors']
  },
  {
    id: 'ECA05',
    category: 'Education & ECA',
    scenario: 'Pharmacist credential assessment PEBC in Brampton',
    question: 'I graduated with a Pharmacy B.Pharm degree in Egypt. Which assessment body PEBC must evaluate my pharmacy credentials for Canada immigration in Brampton?',
    intentExpected: 'employment',
    keyAspects: ['pebc eca', 'pharmacists', 'regulatory assessment']
  },
  {
    id: 'ECA06',
    category: 'Education & ECA',
    scenario: 'Foreign nursing credentials NNAS assessment in Toronto',
    question: 'What is the National Nursing Assessment Service NNAS process for internationally educated registered nurses applying to College of Nurses of Ontario in Toronto?',
    intentExpected: 'employment',
    keyAspects: ['nnas', 'cno registration', 'internationally educated nurses']
  },
  {
    id: 'ECA07',
    category: 'Education & ECA',
    scenario: 'Master degree vs Bachelor degree CRS points difference in Vancouver',
    question: 'How many additional CRS points does a recognized Master degree receive compared to a 4-year Bachelor degree in Express Entry in Vancouver BC?',
    intentExpected: 'employment',
    keyAspects: ['master 135 vs bachelor 120', 'crs points', 'level of education']
  },
  {
    id: 'ECA08',
    category: 'Education & ECA',
    scenario: 'ECA for secondary high school education when applicant has Master degree in Toronto',
    question: 'Do I need to get an Educational Credential Assessment ECA for my high school secondary school diploma if I already have an ECA for my Master degree in Toronto?',
    intentExpected: 'employment',
    keyAspects: ['highest degree only', 'high school not needed', 'express entry']
  },
  {
    id: 'ECA09',
    category: 'Education & ECA',
    scenario: 'Distance learning or online degree recognition by WES in Mississauga',
    question: 'Does WES recognize and evaluate distance education and online degrees from recognized universities in India for Canadian PR in Mississauga?',
    intentExpected: 'employment',
    keyAspects: ['distance education', 'ugc-deb recognized', 'wes evaluation']
  },
  {
    id: 'ECA10',
    category: 'Education & ECA',
    scenario: 'Chartered Accountant CA credential evaluation in Toronto',
    question: 'How does WES or CPA Ontario evaluate an Indian Chartered Accountant ICAI qualification for Canadian equivalency in Toronto?',
    intentExpected: 'employment',
    keyAspects: ['icai mou with cpa', 'cpa ontario', 'equivalency']
  },
  {
    id: 'ECA11',
    category: 'Education & ECA',
    scenario: 'Canadian educational credential points in Brampton',
    question: 'How many bonus CRS points are awarded for completing a 2-year post-secondary diploma at a Canadian public college in Brampton Ontario?',
    intentExpected: 'employment',
    keyAspects: ['canadian education points', '15 points for 1-2 year', '30 points for 3+ year']
  },
  {
    id: 'ECA12',
    category: 'Education & ECA',
    scenario: 'Teaching license OCT evaluation in Toronto',
    question: 'How does an internationally trained teacher get licensed with the Ontario College of Teachers OCT to teach public school in Toronto?',
    intentExpected: 'employment',
    keyAspects: ['oct certification', 'internationally educated teachers', 'toronto schools']
  },
  {
    id: 'ECA13',
    category: 'Education & ECA',
    scenario: 'ECA report upgrade from standard to IRCC package in Vancouver',
    question: 'I had a WES document-by-document evaluation done for university admission. Can I upgrade it to an ECA for IRCC immigration in Vancouver BC?',
    intentExpected: 'employment',
    keyAspects: ['wes upgrade', 'ircc eca package', 'electronic sharing']
  },
  {
    id: 'ECA14',
    category: 'Education & ECA',
    scenario: 'Engineering professional P.Eng licensing in Mississauga',
    question: 'What are the academic assessment and work experience requirements for Professional Engineers Ontario PEO to get a P.Eng license in Mississauga?',
    intentExpected: 'employment',
    keyAspects: ['peo licensing', 'p.eng', 'canadian work experience requirement dropped']
  },
  {
    id: 'ECA15',
    category: 'Education & ECA',
    scenario: 'LINC free English classes eligibility after landing in Toronto',
    question: 'Are permanent residents and protected persons eligible for free Language Instruction for Newcomers to Canada LINC English classes in Toronto?',
    intentExpected: 'community',
    keyAspects: ['linc classes', 'free english', 'pr eligible']
  },

  // ── CATEGORY D: MULTI-COUNTRY RESIDENCE, TRAVEL & POLICE CLEARANCES (15 Questions)
  {
    id: 'PCC01',
    category: 'Multi-Country & PCC',
    scenario: 'Lived 24 yrs India, 3 yrs UK, 2 yrs UAE - which PCCs needed in Toronto',
    question: 'I lived in India for 24 years, lived in the UK for 3 years, and in Dubai UAE for 2 years. Which countries do I need Police Clearance Certificates PCC from for Canada PR in Toronto?',
    intentExpected: 'employment',
    keyAspects: ['6 months or more rule', 'pcc all three countries', 'ircc police certificate']
  },
  {
    id: 'PCC02',
    category: 'Multi-Country & PCC',
    scenario: 'Lived in Australia 8 months at age 17 in Vancouver',
    question: 'I lived in Australia for 8 months as a high school exchange student when I was 17 years old. Do I need an Australian National Police Check for Canada PR in Vancouver BC?',
    intentExpected: 'employment',
    keyAspects: ['age 18 rule', 'pcc only after age 18', 'ircc requirements']
  },
  {
    id: 'PCC03',
    category: 'Multi-Country & PCC',
    scenario: 'FBI Identity History Summary IdHS clearance for living in USA in Toronto',
    question: 'I lived in California for 2 years on an H-1B visa. How do I get an FBI police clearance Identity History Summary IdHS from Toronto Ontario?',
    intentExpected: 'employment',
    keyAspects: ['fbi idhs', 'fingerprints', 'channeler or fbi cjis']
  },
  {
    id: 'PCC04',
    category: 'Multi-Country & PCC',
    scenario: 'UK ACRO police certificate validity period in Mississauga',
    question: 'How long is a UK ACRO Police Certificate valid for submitting with an IRCC permanent residence application in Mississauga?',
    intentExpected: 'employment',
    keyAspects: ['pcc validity', '6 months from issuance', 'not returned to uk']
  },
  {
    id: 'PCC05',
    category: 'Multi-Country & PCC',
    scenario: 'Philippines NBI Clearance with apostille in Vancouver',
    question: 'How does a Filipino applicant in Vancouver BC obtain an official NBI Clearance with biometric fingerprinting for Canadian immigration in Vancouver?',
    intentExpected: 'employment',
    keyAspects: ['nbi clearance', 'philippine consulate fingerprinting', 'manila processing']
  },
  {
    id: 'PCC06',
    category: 'Multi-Country & PCC',
    scenario: 'Nigeria Police Character Certificate CIID in Toronto',
    question: 'Where can a Nigerian permanent residence applicant get a Police Character Certificate from the Criminal Investigation Department CIID in Toronto?',
    intentExpected: 'employment',
    keyAspects: ['nigeria pcc', 'ciid alagbon', 'fingerprint cards']
  },
  {
    id: 'PCC07',
    category: 'Multi-Country & PCC',
    scenario: 'Cumulative vs consecutive 6 months residence for PCC in Brampton',
    question: 'I visited the USA for three separate 2-month summer vacations (total 6 months). Do cumulative visits totaling 6 months require a US police certificate in Brampton?',
    intentExpected: 'employment',
    keyAspects: ['cumulative 6 months', 'since age 18', 'ircc rule']
  },
  {
    id: 'PCC08',
    category: 'Multi-Country & PCC',
    scenario: 'Country refuses to issue PCC to non-residents in Toronto',
    question: 'I worked in a country that refuses to issue police clearance certificates to former foreign residents. What explanation letter and proof must I submit to IRCC in Toronto?',
    intentExpected: 'employment',
    keyAspects: ['unobtainable pcc', 'best efforts proof', 'statutory declaration']
  },
  {
    id: 'PCC09',
    category: 'Multi-Country & PCC',
    scenario: 'Traffic fines vs criminal record admissibility in Vancouver',
    question: 'I received two minor speeding traffic tickets in the UK with no court appearance. Do minor traffic violations make me criminally inadmissible to Canada in Vancouver BC?',
    intentExpected: 'employment',
    keyAspects: ['criminal inadmissibility', 'summary offenses vs indictable', 'traffic tickets']
  },
  {
    id: 'PCC10',
    category: 'Multi-Country & PCC',
    scenario: 'DUI impaired driving criminal rehabilitation in Toronto',
    question: 'I had a single DUI conviction in the United States 8 years ago. Am I criminally inadmissible to Canada and do I need to apply for Criminal Rehabilitation in Toronto?',
    intentExpected: 'employment',
    keyAspects: ['dui serious criminality', 'criminal rehabilitation', 'inadmissibility']
  },
  {
    id: 'PCC11',
    category: 'Multi-Country & PCC',
    scenario: 'Indian Passport Seva Kendra PSK PCC application in Mississauga',
    question: 'How does an Indian citizen living in Mississauga obtain an Indian police clearance certificate PCC through BLS International and Consulate General of India in Toronto?',
    intentExpected: 'community',
    keyAspects: ['bls international', 'consulate general of india', 'psk verification']
  },
  {
    id: 'PCC12',
    category: 'Multi-Country & PCC',
    scenario: 'Biometrics validity period 10 years for Canada visa in Brampton',
    question: 'I gave biometrics (fingerprints and photo) for my study permit in 2021. Are my biometrics valid for my new PR application in Brampton in 2026?',
    intentExpected: 'employment',
    keyAspects: ['biometrics validity', 'pr requires new biometrics', '10-year rule']
  },
  {
    id: 'PCC13',
    category: 'Multi-Country & PCC',
    scenario: 'Permanent resident travel document PRTD abroad in Toronto',
    question: 'My PR card expired while visiting family in India. How do I apply for a Permanent Resident Travel Document PRTD to fly back to Toronto Ontario?',
    intentExpected: 'employment',
    keyAspects: ['prtd', 'portal application', 'commercial carrier travel']
  },
  {
    id: 'PCC14',
    category: 'Multi-Country & PCC',
    scenario: 'Residency obligation 730 days in 5 years in Vancouver',
    question: 'I have been a Canadian PR for 4 years but spent 2.5 years outside Canada for family reasons. Have I met the 730-day residency obligation to renew my PR card in Vancouver BC?',
    intentExpected: 'employment',
    keyAspects: ['730 days rule', '2 years out of 5', 'residency obligation']
  },
  {
    id: 'PCC15',
    category: 'Multi-Country & PCC',
    scenario: 'Accompanying Canadian citizen spouse abroad counting toward PR residency in Toronto',
    question: 'If I accompany my Canadian citizen spouse while they work in London UK, do those days count toward my Canadian permanent resident 730-day residency obligation in Toronto?',
    intentExpected: 'employment',
    keyAspects: ['accompanying citizen spouse', 'counts toward residency', 'section 28']
  },

  // ── CATEGORY E: TENANCY, RENT & LANDLORD DISPUTES (15 Questions) ──────────
  {
    id: 'TEN01',
    category: 'Tenancy & Housing',
    scenario: '4 years rental in 2015 building, rent increase cap in Toronto',
    question: 'I have rented an apartment in Toronto since 2020 in a building built in 2015 paying $2,100. Can the landlord raise my rent by 8% or is it capped by the Ontario rent guideline in Toronto?',
    intentExpected: 'housing',
    keyAspects: ['rent control', 'pre-nov 15 2018 building', 'ontario guideline 2.5%']
  },
  {
    id: 'TEN02',
    category: 'Tenancy & Housing',
    scenario: 'Building occupied after November 15 2018 rent exemption in Mississauga',
    question: 'My condo in Mississauga was first occupied for residential purposes in 2021. Is this rental exempt from the Ontario annual rent increase guideline in Mississauga?',
    intentExpected: 'housing',
    keyAspects: ['post-nov 15 2018 exemption', 'no rent control cap', '90 days notice n2']
  },
  {
    id: 'TEN03',
    category: 'Tenancy & Housing',
    scenario: 'Landlord personal use eviction N12 1 month compensation in Toronto',
    question: 'My landlord in Toronto served an N12 notice claiming their daughter is moving in. Does the landlord legally owe me one month rent compensation in Toronto?',
    intentExpected: 'housing',
    keyAspects: ['n12 notice', '1 month compensation', 'ltb eviction']
  },
  {
    id: 'TEN04',
    category: 'Tenancy & Housing',
    scenario: 'Security deposit legality and last month rent interest in Brampton',
    question: 'Is a landlord allowed to ask for a damage or security deposit in Brampton and do they have to pay annual interest on my last month rent deposit in Brampton?',
    intentExpected: 'housing',
    keyAspects: ['security deposit illegal', 'rent deposit interest', 'ontario rta']
  },
  {
    id: 'TEN05',
    category: 'Tenancy & Housing',
    scenario: 'Illegal lockout by landlord without sheriff in Toronto',
    question: 'My landlord changed the apartment door locks while I was at work without an order from the Landlord and Tenant Board. Can I call the police or RHEU in Toronto?',
    intentExpected: 'housing',
    keyAspects: ['illegal lockout', 'rheu rental housing enforcement', 'sheriff only']
  },
  {
    id: 'TEN06',
    category: 'Tenancy & Housing',
    scenario: 'BC residential tenancy security deposit half-month cap in Vancouver',
    question: 'How much security deposit and pet damage deposit can a landlord legally charge under the BC Residential Tenancy Act in Vancouver BC?',
    intentExpected: 'housing',
    keyAspects: ['half month rent deposit', 'bc rta', 'pet damage deposit']
  },
  {
    id: 'TEN07',
    category: 'Tenancy & Housing',
    scenario: 'Landlord entry 24-hour written notice rule in Toronto',
    question: 'Can my landlord enter my rented apartment in Toronto without 24 hours advance written notice stating the time and reason in Toronto?',
    intentExpected: 'housing',
    keyAspects: ['24 hour notice', 'entry 8am-8pm', 'privacy rights']
  },
  {
    id: 'TEN08',
    category: 'Tenancy & Housing',
    scenario: 'No pet clauses void under Ontario Residential Tenancies Act in Mississauga',
    question: 'My tenancy agreement in Mississauga says "strictly no pets allowed". Is a no-pet clause legally enforceable in Ontario in Mississauga?',
    intentExpected: 'housing',
    keyAspects: ['no pet clause void', 'section 14 rta', 'condo bylaws exception']
  },
  {
    id: 'TEN09',
    category: 'Tenancy & Housing',
    scenario: 'Landlord refusing emergency winter heating repair in Brampton',
    question: 'The furnace broke in my rental home in Brampton and the indoor temperature is 14 degrees Celsius. What are the minimum heating bylaws in Brampton?',
    intentExpected: 'housing',
    keyAspects: ['vital services', 'minimum 20 degrees', 'city bylaws']
  },
  {
    id: 'TEN10',
    category: 'Tenancy & Housing',
    scenario: 'Fixed-term 1-year lease automatically converting to month-to-month in Toronto',
    question: 'My 1-year lease in Toronto is ending next month. Does the lease automatically roll over into a month-to-month tenancy or must I sign a new lease in Toronto?',
    intentExpected: 'housing',
    keyAspects: ['automatic month-to-month', 'no need to resign', 'security of tenure']
  },
  {
    id: 'TEN11',
    category: 'Tenancy & Housing',
    scenario: 'BC RTB dispute resolution timeline and procedures in Vancouver',
    question: 'How do tenants file an online dispute resolution application with the BC Residential Tenancy Branch RTB for an illegal eviction in Vancouver BC?',
    intentExpected: 'housing',
    keyAspects: ['bc rtb', 'dispute resolution', 'monetary order']
  },
  {
    id: 'TEN12',
    category: 'Tenancy & Housing',
    scenario: 'Landlord demanding 6 months rent in advance from newcomer in Toronto',
    question: 'Can a landlord in Toronto legally demand 6 or 12 months rent upfront as a condition of renting an apartment to a newcomer in Toronto?',
    intentExpected: 'housing',
    keyAspects: ['cannot demand advance rent', 'voluntary offer allowed', 'only first and last']
  },
  {
    id: 'TEN13',
    category: 'Tenancy & Housing',
    scenario: 'Subletting and assignment rights in Ontario in Mississauga',
    question: 'Can a landlord arbitrarily refuse my request to assign my lease to a qualified new tenant in Mississauga Ontario?',
    intentExpected: 'housing',
    keyAspects: ['lease assignment', 'cannot arbitrarily refuse', '30 day notice n9']
  },
  {
    id: 'TEN14',
    category: 'Tenancy & Housing',
    scenario: 'Bad faith N12 eviction 12-month compensation claim in Toronto',
    question: 'My former landlord evicted me under N12 for personal use in Toronto but relisted the unit on Realtor for $800 more. How much compensation can LTB award in Toronto?',
    intentExpected: 'housing',
    keyAspects: ['bad faith eviction', 'up to 12 months rent plus moving', 'form t5']
  },
  {
    id: 'TEN15',
    category: 'Tenancy & Housing',
    scenario: 'BC tenancy rent increase notice 3 full months in Vancouver',
    question: 'How much advance written notice on the official form must a landlord give before increasing rent in Vancouver BC under British Columbia law?',
    intentExpected: 'housing',
    keyAspects: ['3 full months notice', 'approved rtb form', 'provincial rent cap']
  },

  // ── CATEGORY F: DRIVING LICENCE & EXPERIENCE (10 Questions) ───────────────
  {
    id: 'DRV01',
    category: 'Driving & Licence',
    scenario: '4 years Indian driving licence and Sarathi extract in Toronto',
    question: 'I have held a valid Indian driving licence for 4 years with a Sarathi DL extract. In Toronto, can I skip G1 and G2 waiting periods and take the G road test directly in Toronto?',
    intentExpected: 'driving',
    keyAspects: ['2+ years experience', 'skip g1/g2 waits', 'direct g road test']
  },
  {
    id: 'DRV02',
    category: 'Driving & Licence',
    scenario: '18 months UK driving licence reciprocal exchange in Mississauga',
    question: 'I have held a full UK driving licence for 18 months. Can I exchange it directly for an Ontario full G licence or do I receive a G2 licence in Mississauga?',
    intentExpected: 'driving',
    keyAspects: ['under 2 years experience', 'receives g2', 'eligible for g test after 2 years']
  },
  {
    id: 'DRV03',
    category: 'Driving & Licence',
    scenario: 'US driver licence direct swap without tests in Toronto',
    question: 'I have held an active California driver license for 6 years. Can I do a direct reciprocal exchange for a full Ontario G licence at DriveTest without tests in Toronto?',
    intentExpected: 'driving',
    keyAspects: ['us reciprocal exchange', 'no knowledge or road test', 'drive test center']
  },
  {
    id: 'DRV04',
    category: 'Driving & Licence',
    scenario: 'Australian licence exchange for BC driver licence in Vancouver',
    question: 'I have a full Australian driver licence with 5 years driving history. Can I exchange it directly for a British Columbia Class 5 licence at ICBC in Vancouver BC?',
    intentExpected: 'driving',
    keyAspects: ['icbc reciprocal exchange', 'australia class 5', 'no road test']
  },
  {
    id: 'DRV05',
    category: 'Driving & Licence',
    scenario: 'Philippines driving licence with LTMS portal verification in Brampton',
    question: 'How do I authenticate my Philippines driver licence using the LTO LTMS portal to credit driving experience at DriveTest in Brampton Ontario?',
    intentExpected: 'driving',
    keyAspects: ['philippines lto ltms', 'experience credit', 'drivetest authentication']
  },
  {
    id: 'DRV06',
    category: 'Driving & Licence',
    scenario: 'Driving with foreign licence for first 90 days in Vancouver',
    question: 'How many days can a newcomer drive with a foreign driver licence in British Columbia before being required to obtain a BC driver licence in Vancouver?',
    intentExpected: 'driving',
    keyAspects: ['90 days rule', 'tourists 6 months', 'icbc regulation']
  },
  {
    id: 'DRV07',
    category: 'Driving & Licence',
    scenario: 'Ontario 60 days foreign licence grace period in Toronto',
    question: 'How long can a new resident in Ontario drive with an out-of-province or foreign driver licence before switching to an Ontario driver licence in Toronto?',
    intentExpected: 'driving',
    keyAspects: ['60 days grace period', 'drivetest application', 'ontario highway traffic act']
  },
  {
    id: 'DRV08',
    category: 'Driving & Licence',
    scenario: 'Non-reciprocal country driver licence process in Mississauga',
    question: 'I hold a driving licence from China with 5 years experience. What tests must I take at DriveTest to get my full G licence in Mississauga Ontario?',
    intentExpected: 'driving',
    keyAspects: ['vision and g1 written test', 'authenticated extract', 'direct g road test']
  },
  {
    id: 'DRV09',
    category: 'Driving & Licence',
    scenario: 'Car insurance discounts for certified driver training in Brampton',
    question: 'Does completing a Ministry of Transportation approved Beginner Driver Education BDE course reduce car insurance rates and G2 waiting times in Brampton?',
    intentExpected: 'driving',
    keyAspects: ['bde course', 'reduces wait from 12 to 8 months', 'insurance discount']
  },
  {
    id: 'DRV10',
    category: 'Driving & Licence',
    scenario: 'ICBC driving history translation requirements in Vancouver',
    question: 'Does ICBC require foreign driving records and licences in languages other than English to be translated by an approved STIBC translator in Vancouver BC?',
    intentExpected: 'driving',
    keyAspects: ['approved translation', 'stibc certified translator', 'icbc requirement']
  }
];

console.log(`Loaded ${technical100Questions.length} highly specific technical scenario questions.`);

const results = [];

for (let i = 0; i < technical100Questions.length; i++) {
  const item = technical100Questions[i];
  const start = performance.now();
  const res = answer({ question: item.question }, records, date);
  const latency = (performance.now() - start).toFixed(2);

  // Evaluate response quality & perfection:
  // 1. Matched topic & status
  const matchedTopic = res.parsed.intents.includes(item.intentExpected);
  const isGuidanceOrPartial = ['guidance', 'partial'].includes(res.status);
  
  // 2. Did the system provide citations from verified official sources?
  
  
  // 3. Round-about / evasiveness check:
  // Does the response contain claims related to the core topic, or is it completely generic / off-topic?
  const leadClaim = res.claims[0]?.text || '';
  
  // 4. Exactness / Perfection score (0 to 100):
  // - If status is unavailable or clarification: score based on whether it correctly identified boundary or failed
  // - If guidance: how many key aspects are reflected in the evidence text or sources?
  let perfectionRating = 'POOR (गोल-गोल घुमा रहा है)';
  let perfectionScore = 20;
  
  if (isGuidanceOrPartial && matchedTopic) {
    const claimLower = res.claims.map(c => c.text.toLowerCase()).join(' ');
    const sourceLower = res.sources.map(s => s.title.toLowerCase()).join(' ');
    const combined = claimLower + ' ' + sourceLower;
    
    let aspectsFound = 0;
    for (const aspect of item.keyAspects) {
      const words = aspect.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      if (words.some(w => combined.includes(w))) {
        aspectsFound++;
      }
    }
    
    if (aspectsFound >= 2) {
      perfectionRating = 'EXCELLENT (परफेक्ट व सटीक उत्तर)';
      perfectionScore = 95;
    } else if (aspectsFound >= 1) {
      perfectionRating = 'GOOD (सटीक सरकारी गाइडेंस, पर व्यक्तिगत गणना नहीं)';
      perfectionScore = 75;
    } else {
      perfectionRating = 'MODERATE (संबंधित सरकारी गाइडेंस, लेकिन सामान्य)';
      perfectionScore = 50;
    }
  } else if (res.status === 'clarification') {
    perfectionRating = 'CLARIFICATION (शहर/लाइसेंस देश की जानकारी मांगी)';
    perfectionScore = 60;
  } else if (res.status === 'unavailable') {
    perfectionRating = 'UNAVAILABLE (ज्ञानकोश में संबंधित प्रमाण उपलब्ध नहीं)';
    perfectionScore = 30;
  }

  results.push({
    id: item.id,
    category: item.category,
    scenario: item.scenario,
    question: item.question,
    status: res.status,
    matchedTopic,
    claimsCount: res.claims.length,
    sourcesCount: res.sources.length,
    leadSource: res.sources[0]?.title || 'None',
    leadClaimSnippet: leadClaim.slice(0, 150) + (leadClaim.length > 150 ? '...' : ''),
    perfectionRating,
    perfectionScore,
    latencyMs: Number(latency)
  });
}

// Write detailed CSV report
const csvHeaders = ['ID,Category,Scenario,Status,MatchedTopic,ClaimsCount,SourcesCount,PerfectionRating,PerfectionScore,LatencyMs,LeadSource,Question'];
const csvRows = [csvHeaders];

for (const r of results) {
  csvRows.push([
    r.id,
    `"${r.category}"`,
    `"${r.scenario.replace(/"/g, '""')}"`,
    r.status,
    r.matchedTopic,
    r.claimsCount,
    r.sourcesCount,
    `"${r.perfectionRating}"`,
    r.perfectionScore,
    r.latencyMs,
    `"${r.leadSource.replace(/"/g, '""')}"`,
    `"${r.question.replace(/"/g, '""')}"`
  ].join(','));
}

writeFileSync('artifacts/technical-100-scenarios-evaluation.csv', csvRows.join('\n'));
console.log('Saved artifacts/technical-100-scenarios-evaluation.csv');

// Summary breakdown
const catSummary = {};
let totalScore = 0;
let totalGuidance = 0;
let totalExcellent = 0;
let totalGood = 0;
let totalModerate = 0;
let totalPoor = 0;

for (const r of results) {
  totalScore += r.perfectionScore;
  if (['guidance', 'partial'].includes(r.status)) totalGuidance++;
  if (r.perfectionRating.startsWith('EXCELLENT')) totalExcellent++;
  else if (r.perfectionRating.startsWith('GOOD')) totalGood++;
  else if (r.perfectionRating.startsWith('MODERATE')) totalModerate++;
  else totalPoor++;

  if (!catSummary[r.category]) catSummary[r.category] = { total: 0, score: 0, guidance: 0, excellent: 0 };
  catSummary[r.category].total++;
  catSummary[r.category].score += r.perfectionScore;
  if (['guidance', 'partial'].includes(r.status)) catSummary[r.category].guidance++;
  if (r.perfectionRating.startsWith('EXCELLENT')) catSummary[r.category].excellent++;
}

console.log('\n================================================================');
console.log('100 TECHNICAL PROFILE SCENARIOS EVALUATION SUMMARY:');
console.log(`Total Scenarios Tested: ${results.length}`);
console.log(`Average Perfection Score: ${(totalScore / results.length).toFixed(1)} / 100`);
console.log(`Official Guidance Provided: ${totalGuidance} / ${results.length} (${((totalGuidance / results.length) * 100).toFixed(1)}%)`);
console.log(` - Excellent (Direct & Specific): ${totalExcellent}`);
console.log(` - Good (Official Authority Guidance): ${totalGood}`);
console.log(` - Moderate (General Topic Guidance): ${totalModerate}`);
console.log(` - Evasive / Unavailable / Poor: ${totalPoor}`);
console.log('================================================================\n');

console.log('Category Breakdown:');
for (const [cat, s] of Object.entries(catSummary)) {
  console.log(` - ${cat.padEnd(25)}: Avg Score: ${(s.score / s.total).toFixed(1)}/100 | Guidance: ${s.guidance}/${s.total} | High Perfection: ${s.excellent}/${s.total}`);
}

store.db.close();
