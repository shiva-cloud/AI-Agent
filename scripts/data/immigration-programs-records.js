// Comprehensive Study Visas, PR Streams, and Business/Investor Programs
// Multi-destination statutory operational records across major corridors.

export const checkedAt = '2026-10-31';
export const expiresAt = '2027-01-31';

function createRecord({ id, topic, jurisdiction, title, url, quote, summary }) {
  return {
    id,
    topic,
    jurisdiction,
    title,
    url,
    quote,
    summary,
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt,
    expiresAt,
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Official immigration and visa program operational manual inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  };
}

export const immigrationProgramRecords = [
  // ══════════════════════════════════════════════════════════════════════════════
  // CATEGORY 1: STUDY VISAS, ON/OFF-CAMPUS WORK, AND POST-STUDY WORK RIGHTS
  // ══════════════════════════════════════════════════════════════════════════════
  createRecord({
    id: 'us-uscis-f1-student-visa-opt-rules',
    topic: 'employment',
    jurisdiction: 'United States',
    title: 'USCIS & SEVP: F-1 Student Visa, On-Campus Work, OPT and STEM OPT Rules',
    url: 'https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/optional-practical-training-opt-for-f-1-students',
    quote: 'Optional Practical Training (OPT) for F-1 Students',
    summary: 'F-1 academic students enrolled full-time in SEVP-certified institutions may work on-campus up to 20 hours per week during academic terms and full-time during breaks. After one academic year, students qualify for pre-completion or post-completion Optional Practical Training (OPT) granting up to 12 months of employment authorization directly related to their major. Students who complete an eligible Science, Technology, Engineering, or Math (STEM) degree can apply for a 24-month STEM OPT extension (total 36 months of OPT), provided the employer participates in E-Verify. Unapproved off-campus work without CPT or EAD authorization violates F-1 status and triggers immediate SEVIS termination. This record does not issue student visas.'
  }),
  createRecord({
    id: 'ca-ircc-study-permit-pgwp-rules',
    topic: 'employment',
    jurisdiction: 'CA',
    title: 'IRCC: Study Permit, 24-Hour Work Cap, and PGWP Eligibility Reforms',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/work/work-off-campus.html',
    quote: 'Work off campus as an international student',
    summary: 'Effective Fall 2024, eligible full-time international students holding a valid study permit with off-campus work authorization are permitted to work up to 24 hours per week off-campus during regular academic semesters, and full-time during regularly scheduled academic breaks. Students must maintain continuous full-time enrollment; dropping to part-time status forfeits off-campus work rights. Under updated PGWP guidelines, graduates of master degree programs of at least 8 months are eligible for a 3-year PGWP, while college diploma graduates must graduate from programs linked to designated national labour market shortages and meet minimum language benchmarks (CLB 5 for college, CLB 7 for university) to qualify for a PGWP. This record does not issue study permits.'
  }),
  createRecord({
    id: 'uk-home-office-student-visa-graduate-route',
    topic: 'employment',
    jurisdiction: 'United Kingdom',
    title: 'Home Office: Student Visa Work Hours and 2-Year Graduate Route Post-Study Visa',
    url: 'https://www.gov.uk/graduate-visa',
    quote: 'Graduate visa: Overview',
    summary: 'International students in the UK on a Student Route visa enrolled in degree-level courses are restricted to working a maximum of 20 hours per week during term time, and full-time during official vacation periods. Upon successful completion of an eligible UK bachelor or master degree from a licensed higher education provider with a track record of compliance, graduates can switch in-country to the Graduate Route visa. The Graduate Route provides 2 years (or 3 years for doctoral / PhD graduates) of unsponsored open work permission to work in any role or be self-employed, with no minimum salary or sponsor requirement. Time on the Graduate Route does not count toward 5-year Indefinite Leave to Remain (ILR). This record does not issue student visas.'
  }),
  createRecord({
    id: 'au-dha-subclass-500-student-485-graduate',
    topic: 'employment',
    jurisdiction: 'Australia',
    title: 'Department of Home Affairs: Subclass 500 Student Visa & Subclass 485 Temporary Graduate Visa',
    url: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/temporary-graduate-485',
    quote: 'Subclass 485 Temporary Graduate visa',
    summary: 'Under Australian migration regulations, Subclass 500 Student Visa holders are subject to Condition 8105, which restricts work to a maximum of 48 hours per fortnight while course is in session, and unlimited hours during recognized university breaks. Following graduation from an Australian CRICOS-registered course with at least 2 years of study (92 weeks), graduates under age 35 can apply for the Subclass 485 Temporary Graduate Visa (Post-Higher Education Work stream). The visa grants 2 years of unrestricted work rights for Bachelor graduates and 3 years for Master graduates. English proficiency of IELTS 6.5 overall (or equivalent) is mandatory. This record does not issue student visas.'
  }),
  createRecord({
    id: 'de-bamf-student-visa-140-days-and-post-study',
    topic: 'employment',
    jurisdiction: 'Germany',
    title: 'BAMF & AufenthG Section 16b / Section 20: International Student Work Rights and 18-Month Job Search',
    url: 'https://www.make-it-in-germany.com/en/study-training/studies-in-germany/work-during-studies',
    quote: 'Working during studies in Germany',
    summary: 'Under Section 16b of the German Residence Act (AufenthG), international students from third countries can work up to 140 full days (or 280 half days) per calendar year without requiring approval from the Federal Employment Agency (Bundesagentur fuer Arbeit), or unlimited hours in academic assistant roles. Upon graduating from a recognized German university, graduates can apply under Section 20 Absatz 3 AufenthG for an 18-month residence permit for job-seeking purposes (Arbeitsplatzsuche). During these 18 months, graduates can work without restriction while searching for qualified employment matching their degree to transition to an EU Blue Card (Section 18b) or Skilled Worker Permit. This record does not issue visas.'
  }),
  createRecord({
    id: 'nz-inz-student-visa-work-and-pswv',
    topic: 'employment',
    jurisdiction: 'New Zealand',
    title: 'Immigration New Zealand: Student Visa Work Rights and Post-Study Work Visa (PSWV)',
    url: 'https://www.immigration.govt.nz/new-zealand-visas/visas/visa/post-study-work-visa',
    quote: 'Post-study work visa',
    summary: 'International students enrolled full-time in New Zealand in an eligible qualification (degree Level 7 or above, or sub-degree on the Qualifications Eligible for Post-Study Work list) can work up to 20 hours per week during term and full-time during holidays. Following completion of an eligible qualification in New Zealand, graduates can apply for a Post-Study Work Visa (PSWV). The duration of the PSWV matches the duration of study (up to 3 years for Master and Doctoral degrees) and allows open employment for any employer. Self-employment is permitted. Applicants must have at least NZD $5,000 in readily available maintenance funds. This record does not grant student visas.'
  }),
  createRecord({
    id: 'ie-isd-stamp-2-student-and-stamp-1g-third-level',
    topic: 'employment',
    jurisdiction: 'Ireland',
    title: 'Immigration Service Delivery: Stamp 2 Student Permission & Third Level Graduate Scheme (Stamp 1G)',
    url: 'https://www.irishimmigration.ie/coming-to-study-in-ireland/what-are-my-study-options/third-level-graduate-programme/',
    quote: 'Third Level Graduate Programme',
    summary: 'Non-EEA international students registered in Ireland on Stamp 2 permission may work part-time up to 20 hours per week during term time and up to 40 hours per week during designated holiday periods (June, July, August, September, and December 15 to January 15). Under the Third Level Graduate Programme, graduates with a recognized Irish Level 8 Honours Bachelor Degree qualify for a 12-month Stamp 1G permission, and Level 9 Master graduates qualify for up to 24 months of Stamp 1G (granted as two consecutive 12-month permits). Stamp 1G permits full-time employment without an employment permit while graduates seek sponsor employment under the Critical Skills Employment Permit. This record does not grant permissions.'
  }),
  createRecord({
    id: 'sg-ica-student-pass-and-ltvp-graduate-job-search',
    topic: 'employment',
    jurisdiction: 'Singapore',
    title: 'ICA & MOM: Student Pass Work Privileges and Long-Term Visit Pass for University Graduates',
    url: 'https://www.mom.gov.sg/passes-and-permits/work-pass-exemption-for-foreign-students',
    quote: 'Work pass exemption for foreign students',
    summary: 'Under Singapore Ministry of Manpower (MOM) and Immigration & Checkpoints Authority (ICA) regulations, foreign students holding a Student Pass at approved Institutes of Higher Learning (such as NUS, NTU, SMU, SUTD) are exempt from work passes to work part-time up to 16 hours per week during term time, and full-time during vacation. Upon graduation, degree holders from recognized local universities are eligible to apply for a one-year non-renewable Long-Term Visit Pass (LTVP) to reside in Singapore while seeking skilled employment to transition to an Employment Pass (EP) or S Pass. This record does not grant passes.'
  }),
  createRecord({
    id: 'fr-ofii-vls-ts-etudiant-and-rece-job-search',
    topic: 'employment',
    jurisdiction: 'France',
    title: 'OFII & Service-Public: VLS-TS Etudiant 964-Hour Work Limit and RECE Post-Study Card',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F2231',
    quote: 'Carte de sejour temporaire etudiant',
    summary: 'Under the French Code on the Entry and Stay of Foreign Nationals and the Right of Asylum (CESEDA), foreign students holding a VLS-TS student visa can engage in secondary employment for up to 60% of the annual statutory working time (maximum 964 hours per year). Upon obtaining a Master-level degree (Master, Grande Ecole, or Mastere Specialise), foreign graduates can apply for the 1-year non-renewable RECE residence card (Recherche d emploi ou creation d entreprise). This card permits working in any job up to 60% of normal hours until finding employment matching their field paying at least 1.5 times the statutory minimum wage (SMIC), enabling conversion to a Passeport Talent or Salarie permit. This record does not issue visas.'
  }),

  // ══════════════════════════════════════════════════════════════════════════════
  // CATEGORY 2: PERMANENT RESIDENCY (PR) AND SETTLEMENT STREAMS
  // ══════════════════════════════════════════════════════════════════════════════
  createRecord({
    id: 'us-uscis-eb1-eb2-niw-eb3-green-card-pr',
    topic: 'employment',
    jurisdiction: 'United States',
    title: 'USCIS: Employment-Based Permanent Residence (EB-1, EB-2 NIW, and EB-3 Green Cards)',
    url: 'https://www.uscis.gov/green-card/green-card-eligibility/green-card-for-employment-based-immigrants',
    quote: 'Green Card for Employment-Based Immigrants',
    summary: 'Employment-based immigrant visas provide pathways to lawful permanent residence (Green Card) under 5 preference categories. EB-1 covers individuals of Extraordinary Ability (EB-1A, no employer sponsor required), Outstanding Professors and Researchers (EB-1B), and Multinational Managers (EB-1C). EB-2 covers Advanced Degree professionals and individuals of Exceptional Ability; applicants under the National Interest Waiver (NIW) under the Matter of Dhanasar precedent are exempt from the PERM labor certification and employer job offer requirement by proving national importance and substantial merit. EB-3 covers skilled workers with 2+ years experience and professionals with a US bachelor degree, requiring an approved PERM labor certification from the Department of Labor. Beneficiaries physically in the US file Form I-485 for Adjustment of Status when their priority date is current under the Visa Bulletin. This record does not grant permanent residency.'
  }),
  createRecord({
    id: 'ca-ircc-express-entry-fsw-cec-pnp-pr',
    topic: 'employment',
    jurisdiction: 'CA',
    title: 'IRCC: Express Entry Permanent Residence Selection Streams (FSW, CEC, and PNP)',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/works.html',
    quote: 'How Express Entry works',
    summary: 'Canada Express Entry system manages permanent residence applications for three economic immigration programs: Federal Skilled Worker (FSW), Canadian Experience Class (CEC), and Federal Skilled Trades (FST). Candidates submit an online profile and are scored under the Comprehensive Ranking System (CRS) out of 1,200 points based on human capital (age, education, language, work experience). FSW requires 67 points on a separate grid, at least 1 continuous year of skilled work, and settlement funds. CEC requires 1 year of skilled Canadian work experience and has no settlement funds requirement. Provinces nominate candidates through aligned Provincial Nominee Program (PNP) streams, awarding a massive 600 CRS bonus points guaranteeing an Invitation to Apply (ITA). Category-based draws target specific occupational priorities including STEM, healthcare, trades, transport, agriculture, and French language proficiency. This record does not issue ITAs.'
  }),
  createRecord({
    id: 'uk-home-office-ilr-5-year-settlement',
    topic: 'employment',
    jurisdiction: 'United Kingdom',
    title: 'Home Office: Indefinite Leave to Remain (ILR) 5-Year Settlement Rules',
    url: 'https://www.gov.uk/indefinite-leave-to-remain-tier-2-t2-skilled-worker-visa',
    quote: 'Settlement: Skilled Worker',
    summary: 'Holders of a Skilled Worker visa, Global Talent visa, or Scale-up visa can apply for Indefinite Leave to Remain (ILR / permanent settlement) after completing 5 continuous years of lawful residence in the UK. Applicants must prove they meet the continuous residence requirement (spending no more than 180 days outside the UK in any 12-month rolling period), have passed the official Life in the UK Test, and demonstrate English language proficiency at CEFR Level B1 or higher. For Skilled Workers, the sponsoring employer must provide a formal letter confirming the applicant is still required and paid at or above the applicable going rate salary threshold. ILR grants permanent right to live, work, and study in the UK without visa restrictions, and leads to British citizenship after 1 year (or immediately if married to a British citizen). This record does not grant ILR.'
  }),
  createRecord({
    id: 'au-dha-general-skilled-migration-189-190-491',
    topic: 'employment',
    jurisdiction: 'Australia',
    title: 'Department of Home Affairs: General Skilled Migration (Subclasses 189, 190, and 491)',
    url: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-independent-189',
    quote: 'Skilled Independent visa (subclass 189)',
    summary: 'Australia General Skilled Migration (GSM) program selects skilled migrants via the SkillSelect points test, requiring a minimum of 65 points across age (max 30 pts at 25-32), English proficiency (Proficient=10, Superior=20), qualification (Doctorate=20, Bachelor/Master=15), and Australian/foreign skilled work experience. Subclass 189 (Skilled Independent) is a direct permanent resident visa with no state or employer sponsorship required. Subclass 190 (Skilled Nominated) is a permanent visa providing 5 bonus points for nomination by an Australian state or territory government, subject to living in that state for 2 years. Subclass 491 (Skilled Work Regional) is a 5-year provisional visa providing 15 bonus points for regional nomination, leading to permanent residency via Subclass 191 after 3 years of regional residence and income compliance. This record does not issue visas.'
  }),
  createRecord({
    id: 'de-bamf-settlement-permit-niederlassungserlaubnis-pr',
    topic: 'employment',
    jurisdiction: 'Germany',
    title: 'BAMF & AufenthG Section 18c: Permanent Settlement Permit (Niederlassungserlaubnis) for Skilled Workers',
    url: 'https://www.make-it-in-germany.com/en/visa-residence/living-permanently/settlement-permit',
    quote: 'Settlement permit for qualified professionals',
    summary: 'The German settlement permit (Niederlassungserlaubnis) is an unrestricted permanent residence title granted under Section 18c of the Residence Act (AufenthG). Skilled professionals holding a residence permit under Sections 18a, 18b, or 18d can obtain a settlement permit after 3 years (reduced from 4 years under recent reforms) of qualified employment and 36 months of statutory pension insurance contributions, provided they have German language proficiency at Level B1. EU Blue Card holders benefit from an accelerated timeline of 27 months (or 21 months with B1 German). Graduates of German universities holding a skilled worker permit qualify for permanent residence after just 2 years of employment with 24 months of pension contributions. Applicants must have secured living space and no reliance on public social funds. This record does not issue permits.'
  }),
  createRecord({
    id: 'nz-inz-skilled-migrant-and-green-list-pr',
    topic: 'employment',
    jurisdiction: 'New Zealand',
    title: 'Immigration New Zealand: Green List Straight to Residence and SMC Permanent Residency',
    url: 'https://www.immigration.govt.nz/new-zealand-visas/visas/visa/straight-to-residence-visa',
    quote: 'Straight to Residence Visa',
    summary: 'New Zealand offers two primary permanent residency pathways for skilled migrants: the Skilled Migrant Category (SMC) 6-point system and the Green List pathways. Under the Green List Straight to Residence Visa, eligible workers in Tier 1 in-demand occupations (such as medical practitioners, software engineers, civil engineers, and veterinarians) can apply directly for residence from offshore or onshore without waiting, provided they hold a full-time job offer from an accredited employer paying at least the median wage. Tier 2 Green List roles qualify for the Work to Residence Visa after completing 24 months of eligible employment in New Zealand. Both pathways grant a Resident Visa leading to a Permanent Resident Visa (PRV) after 2 years of continuous commitment. This record does not grant resident visas.'
  }),
  createRecord({
    id: 'sg-ica-permanent-residence-pts-scheme',
    topic: 'employment',
    jurisdiction: 'Singapore',
    title: 'ICA: Singapore Permanent Residence (SPR) via Professionals/Technical Personnel & Skilled Workers (PTS)',
    url: 'https://www.ica.gov.sg/residence/PR/apply-PR-PTS',
    quote: 'Apply for Permanent Residence (PTS Scheme)',
    summary: 'Foreign professionals working in Singapore on an Employment Pass (EP), S Pass, Personalised Employment Pass (PEP), or ONE Pass can apply for Singapore Permanent Residence (SPR) under the Professionals/Technical Personnel and Skilled Workers (PTS) Scheme through the Immigration & Checkpoints Authority (ICA). Selection is competitive and assessed holistically based on applicant age, educational qualifications, monthly remuneration, industry sector, length of economic contribution in Singapore, family ties, and integration into Singapore society. While there is no rigid statutory points cutoff, applicants typically demonstrate at least 1 to 2 years of local tax filing and steady career progression before applying. Male permanent residents are liable for National Service (NS). This record does not grant permanent residency.'
  }),

  // ══════════════════════════════════════════════════════════════════════════════
  // CATEGORY 3: BUSINESS, INVESTOR AND STARTUP VISA PROGRAMS
  // ══════════════════════════════════════════════════════════════════════════════
  createRecord({
    id: 'us-uscis-eb5-investor-and-e2-treaty-visa',
    topic: 'employment',
    jurisdiction: 'United States',
    title: 'USCIS & DOS: EB-5 Immigrant Investor Program and E-2 Treaty Investor Visas',
    url: 'https://www.uscis.gov/working-in-the-united-states/permanent-workers/eb-5-immigrant-investor-program',
    quote: 'EB-5 Immigrant Investor Program',
    summary: 'The US EB-5 Immigrant Investor Program provides a direct pathway to a Green Card for foreign nationals who invest capital in a new commercial enterprise that creates at least 10 full-time jobs for qualified US workers. Under the EB-5 Reform and Integrity Act of 2022, the minimum investment amount is $800,000 for Targeted Employment Areas (TEA - rural areas or high unemployment areas) and $1,050,000 for non-TEA projects. Investors can invest through USCIS-approved Regional Centers (allowing indirect job creation) or directly. Concurrently, citizens of bilateral treaty countries (such as Canada, UK, Germany, Australia, Japan) can apply for the E-2 Treaty Investor non-immigrant visa by investing a substantial amount of capital (typically $100,000+) in an active operating commercial enterprise, renewable indefinitely as long as the business operates. This record does not issue investor visas.'
  }),
  createRecord({
    id: 'ca-ircc-start-up-visa-suv-program',
    topic: 'employment',
    jurisdiction: 'CA',
    title: 'IRCC: Start-up Visa (SUV) Program for Innovative Entrepreneurs',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/start-up-visa.html',
    quote: 'Start-up Visa Program',
    summary: 'Canada Start-up Visa (SUV) Program grants permanent residence to immigrant entrepreneurs with the skills and potential to build innovative businesses that can compete globally and create Canadian jobs. Applicants must secure a formal Letter of Support and Commitment Certificate from a designated Canadian organization: a designated Venture Capital Fund (minimum $200,000 investment), a designated Angel Investor Group (minimum $75,000 investment), or a designated Business Incubator (acceptance into their incubation program). Up to 5 owners can apply as a group, each holding at least 10% of voting rights and collectively holding over 50%. Essential applicants qualify for an open work permit while permanent residence is processed. Applicants must meet CLB 5 language proficiency and unencumbered settlement funds. This record does not issue visas.'
  }),
  createRecord({
    id: 'uk-home-office-innovator-founder-and-global-talent',
    topic: 'employment',
    jurisdiction: 'United Kingdom',
    title: 'Home Office: Innovator Founder Visa and Global Talent Endorsement Routes',
    url: 'https://www.gov.uk/innovator-founder-visa',
    quote: 'Innovator Founder visa',
    summary: 'The UK Innovator Founder Visa allows foreign entrepreneurs to set up an innovative, viable, and scalable business in the UK. Crucially, there is no minimum personal investment funds requirement; instead, the business idea must be assessed and endorsed by an approved Endorsing Body (such as Envestors, Innovator International, or UK Endorsement Services). Founders must have regular contact milestones with their endorser. The visa leads to Indefinite Leave to Remain (ILR) on an accelerated 3-year track if specific business milestones (such as £50,000 revenue or significant job creation) are met. Concurrently, the Global Talent Visa allows leaders and potential leaders in academia, digital technology, or arts/culture endorsed by bodies such as Tech Nation to work in the UK without an employer sponsor and achieve ILR in 3 to 5 years. This record does not issue visas.'
  }),
  createRecord({
    id: 'au-dha-subclass-188-and-national-innovation-visa',
    topic: 'employment',
    jurisdiction: 'Australia',
    title: 'Department of Home Affairs: Subclass 188 Business Innovation & National Innovation Visa',
    url: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/business-innovation-and-investment-188',
    quote: 'Business Innovation and Investment (provisional) visa',
    summary: 'Australia offers business and investor pathways through the Business Innovation and Investment (Provisional) Subclass 188 visa and the incoming National Innovation Visa. Subclass 188 includes streams for Business Innovation (requiring business ownership, turnover of AUD $750,000, and net business/personal assets of AUD $1.25M), Investor Stream (requiring AUD $2.5M complying investment fund allocation), and Significant Investor Stream (AUD $5M in complying investment funds). These provisional visas lead to permanent residence via Subclass 888 after meeting investment and business activity requirements. The National Innovation Visa consolidates high-caliber entrepreneurs, major investors, and researchers into a direct permanent residence pathway. This record does not issue visas.'
  }),
  createRecord({
    id: 'de-bamf-aufenthg-21-self-employment-business-visa',
    topic: 'employment',
    jurisdiction: 'Germany',
    title: 'BAMF & AufenthG Section 21: Residence Permit for Self-Employment and Freelancers',
    url: 'https://www.make-it-in-germany.com/en/visa-residence/types/self-employment',
    quote: 'Visa for self-employment in Germany',
    summary: 'Under Section 21 of the German Residence Act (AufenthG), foreign entrepreneurs can obtain a residence permit for self-employment (Gewerbetreibende) if there is an economic interest or regional demand for the business, the activity is expected to have a positive economic impact, and financing is secured through equity or loan commitments. Local chambers of industry and commerce (IHK) review the business plan. For liberal professions (Freiberufler - software developers, engineers, artists, consultants), Section 21 Absatz 5 grants a freelance residence permit upon demonstrating professional qualifications, client letters of intent, and sufficient financial means. Self-employed individuals who successfully run their business and secure their livelihood can obtain a permanent settlement permit (Niederlassungserlaubnis) after just 3 years. This record does not issue permits.'
  }),
  createRecord({
    id: 'ae-icp-golden-visa-entrepreneur-and-investor',
    topic: 'employment',
    jurisdiction: 'United Arab Emirates',
    title: 'ICP & Dubai Economy: UAE 10-Year Golden Visa for Entrepreneurs and Commercial Investors',
    url: 'https://smartservices.icp.gov.ae/',
    quote: 'Golden Visa for Entrepreneurs',
    summary: 'The UAE offers a 10-year self-sponsored Golden Visa for entrepreneurs and investors under Cabinet Resolution No. 65 of 2022. Entrepreneurs qualify if they own or partner in an economic project classified as a small or medium enterprise (SME) in the UAE generating annual revenue of at least AED 1,000,000, obtain approval for a startup project from an official accredited business incubator or the Ministry of Economy, or have founded and sold an entrepreneurial project for at least AED 7,000,000. Real estate investors qualify with AED 2,000,000 in property equity. Commercial investors qualify by establishing or investing in a mainland or freezone company with paid capital of at least AED 2,000,000 or annual federal tax contributions of at least AED 250,000. Golden Visa holders can sponsor family members and domestic helpers with no limit. This record does not issue visas.'
  }),
  createRecord({
    id: 'nz-inz-active-investor-plus-visa',
    topic: 'employment',
    jurisdiction: 'New Zealand',
    title: 'Immigration New Zealand: Active Investor Plus Visa Program',
    url: 'https://www.immigration.govt.nz/new-zealand-visas/visas/visa/active-investor-plus-visa',
    quote: 'Active Investor Plus Visa',
    summary: 'New Zealand Active Investor Plus Visa attracts high-value investors through a weighted investment weighting system requiring a minimum of NZD $15 million in acceptable investments (or NZD $5 million if investing in direct private investments). Direct private equity investments are weighted at 3x (NZD $5M needed), private managed funds at 2x (NZD $7.5M needed), and listed equities or philanthropic funds at 1x (NZD $15M needed). The investment period is 3 to 4 years, during which the investor must spend at least 117 days in New Zealand over the 4-year period (or 88 days for direct investors). The visa grants resident status leading to permanent residency upon completing the investment term. This record does not issue visas.'
  }),
  createRecord({
    id: 'fr-service-public-passeport-talent-creation-entreprise',
    topic: 'employment',
    jurisdiction: 'France',
    title: 'Service-Public: Passeport Talent for Business Creators and Innovative Projects',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F16922',
    quote: 'Carte de sejour Passeport talent: Createur d entreprise',
    summary: 'France offers the multi-year Passeport Talent residence card (valid up to 4 years) for foreign entrepreneurs and investors under CESEDA. The Createur d entreprise category applies to entrepreneurs creating a commercial, craft, or industrial company in France, requiring a master-level degree or 5 years professional experience, an investment of at least 30,000 euros in the company, and an economically viable business plan approved by the regional administration. The Projet economique innovant (French Tech Visa) category applies to founders of innovative startups recognized by a public body (such as BPI France) with secured financing. Cardholders can work on their business and their spouses receive immediate unrestricted work authorization. Leads to 10-year resident card after 5 years. This record does not issue residence permits.'
  })
];
