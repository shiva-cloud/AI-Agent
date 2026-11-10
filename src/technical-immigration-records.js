// Verified technical Canadian immigration, family sponsorship, Express Entry CRS,
// tenancy dispute and police certificate records conforming to assertEnglishRecord schema.

export const checkedAt = '2026-10-30';
export const expiresAt = '2026-11-25';

function createRecord({ id, title, topic, jurisdiction, url, quote, summary, housingSubject }) {
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
    reviewBasis: 'Official government operational policy and legislative provisions inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-30T12:00:00.000Z'
  };
}

export const technicalImmigrationRecords = [
  // ── 1. FAMILY & PARENT SPONSORSHIP ──────────────────────────────────────────
  createRecord({
    id: 'ircc-super-visa',
    title: 'IRCC: Super Visa for parents and grandparents',
    topic: 'family',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/parent-grandparent-super-visa.html',
    quote: 'You can visit your children or grandchildren (if they\'re a permanent resident, a Canadian citizen or a registered Indian) for 5 years at a time with a super visa.',
    summary: 'You can visit your children or grandchildren (if they\'re a permanent resident, a Canadian citizen or a registered Indian) for 5 years at a time with a super visa.'
  }),
  createRecord({
    id: 'ircc-spousal-sponsorship',
    title: 'IRCC: Sponsoring your spouse, partner or dependent child',
    topic: 'family',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/family-sponsorship/spouse-partner-children.html',
    quote: 'This is a program to sponsor your spouse, common-law partner, conjugal partner or dependent child to become a permanent resident of Canada.',
    summary: 'This is a program to sponsor your spouse, common-law partner, conjugal partner or dependent child to become a permanent resident of Canada.'
  }),
  createRecord({
    id: 'ircc-parent-sponsorship-pgp',
    title: 'IRCC: Parents and Grandparents Program (PGP)',
    topic: 'family',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/family-sponsorship/parents-grandparents.html',
    quote: 'Sponsor your parents and grandparents for permanent residence through the Parents and Grandparents Program.',
    summary: 'Under IRCC guidelines, you can sponsor your biological or adopted parents and grandparents if you are invited to apply, you are at least 18 years old, and you live in Canada. Sponsors must also meet other eligibility requirements, including providing proof of income to support family members. This overview outlines program eligibility; it does not issue invitations to apply or assess individual sponsor income.'
  }),
  createRecord({
    id: 'ircc-dependent-child-sponsorship',
    title: 'IRCC: Sponsoring a dependent child or orphaned family member',
    topic: 'family',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/family-sponsorship/spouse-partner-children/who-you-can-sponsor.html',
    quote: 'A child qualifies as a dependent if they are under 22 years of age and not married or in a common-law relationship.',
    summary: 'Under IRCC dependent child sponsorship rules, a child qualifies as a dependant if they are under 22 years old and do not have a spouse or common-law partner. Children 22 years or older may qualify if they cannot financially support themselves because of a mental or physical condition. This record outlines statutory IRCC sponsorship eligibility and does not decide custody.'
  }),

  // ── 2. EXPRESS ENTRY, WORK EXPERIENCE & CRS ──────────────────────────────────
  createRecord({
    id: 'ircc-express-entry-crs',
    title: 'IRCC: Comprehensive Ranking System (CRS) criteria for Express Entry',
    topic: 'employment',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/eligibility/criteria-comprehensive-ranking-system.html',
    quote: 'All Express Entry candidates get a score out of 1,270, based on the four parts of the Comprehensive Ranking System formula.',
    summary: 'All Express Entry candidates get a score out of 1,270, based on the four parts of the Comprehensive Ranking System formula. We invite the highest-ranking candidates from the pool to apply as a permanent resident through regular "rounds of invitations." See what minimum scores have been in the past. The Comprehensive Ranking System (CRS) is a points-based system that we use to assess and score your profile and rank it in the Express Entry pool.'
  }),
  createRecord({
    id: 'ircc-work-experience-rules',
    title: 'IRCC: Federal Skilled Worker Program - the skilled work experience minimum requirements',
    topic: 'employment',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/eligibility/federal-skilled-workers.html',
    quote: 'be at least 1 year of continuous work or 1,560 hours total (30 hours per week)',
    summary: 'IRCC\'s Federal Skilled Worker Program eligibility page states that a candidate\'s skilled work experience must be in one of the TEER categories 0, 1, 2, or 3, where TEER stands for training, education, experience and responsibilities; have the same NOC as the job the candidate wants to use for the immigration application (the primary occupation), which may not be the most recent work experience; show that the candidate performed the actions in the lead statement of the NOC job description and most of the main duties listed; have been obtained within the last 10 years, in Canada or abroad; be paid work (the candidate must have been paid wages or earned commission, and volunteer work and unpaid internships don\'t count); and be at least 1 year of continuous work or 1,560 hours total (30 hours per week). The page adds that the 1,560 hour requirement can be met in a few different ways, for example full time at 1 job: up to 30 hours/week for 12 months equals 1 year full time (1,560 hours). This record does not determine occupation classification or assess work histories.'
  }),
  createRecord({
    id: 'ircc-pgwp-maintained-status',
    title: 'IRCC: About the post-graduation work permit (PGWP) - eligibility, validity length, and the language-requirement change',
    topic: 'employment',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/work/after-graduation/about.html',
    quote: 'The post-graduation work permit (PGWP) allows students who have graduated from eligible designated learning institutions (DLIs) to gain valuable Canadian work experience.',
    summary: 'IRCC\'s about-the-PGWP page states that the post-graduation work permit (PGWP) allows students who have graduated from eligible designated learning institutions (DLIs) to gain valuable Canadian work experience, and that graduating from a DLI doesn\'t automatically make a graduate eligible for a PGWP - the DLI list shows which schools have eligible programs. As of November 1, 2024, the eligibility requirements changed: most PGWP applicants now need to give proof of language results when they apply, and applicants who submitted a PGWP application before November 1, 2024, or are flight school graduates, are exempt from the new requirements. The length of a PGWP depends on the level and duration of the study program, as well as the expiry date of the passport, whichever comes first. For master\'s degree programs, as of February 15, 2024, applicants can apply for a 3-year PGWP even if the master\'s program was less than 2 years, as long as the program was at least 8 months (or 900 hours for Quebec programs) and all other eligibility requirements are met; this doesn\'t apply to certificate or diploma programs. For all other programs of at least 8 months (or 900 hours for Quebec credentials) but less than 2 years, the PGWP may be valid for up to the same length as the study program. This record does not issue study or work permits.'
  }),
  createRecord({
    id: 'ircc-settlement-funds-pof',
    title: 'IRCC: Proof of funds for Express Entry',
    topic: 'money',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/proof-funds.html',
    quote: 'To stay eligible, you may need to update your proof of funds in your Express Entry profile.',
    summary: 'To stay eligible, you may need to update your proof of funds in your Express Entry profile. Proof of funds is how you show us that you have enough money to settle in Canada.'
  }),

  // ── 3. POLICE CERTIFICATES & MEDICAL ADMISSIBILITY ───────────────────────────
  createRecord({
    id: 'ircc-police-certificates-pcc',
    title: 'Express Entry: police certificates for the permanent-residence application',
    topic: 'employment',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/apply-permanent-residence/police-certificates.html',
    quote: 'You don\'t need to give us police certificates for any period of time before you were 18 years old or for time spent in Canada.',
    summary: 'The Express Entry police certificates page states that applicants must include police certificates when they apply for permanent residence. The online system asks for a police certificate for the applicant and their family members who are 18 years or older, and for every country the applicant (or a family member) stayed in during the last 10 years for 6 months in a row or longer. No police certificates are needed for any period of time before the applicant was 18 years old or for time spent in Canada. After the application is submitted, an officer may ask for additional police certificates from any time in the applicant\'s life since they were 18 years old. The page\'s examples include an 8-month stay before age 18, which the system does not ask about, and it links guidance on getting the certificates needed and on what to do if a certificate can\'t be obtained in time. This record does not issue certificates or waive inadmissibility.'
  }),
  createRecord({
    id: 'ircc-medical-excessive-demand',
    title: 'IRCC: Medical assessment date and excessive-demand thresholds',
    topic: 'health',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/standard-requirements/medical-requirements/refusals-inadmissibility/excessive-demand-on-health-social-services.html',
    quote: 'The excessive demand threshold applied is determined by the date',
    summary: 'The excessive-demand threshold depends on when the medical officer performs the assessment. IRCC describes both anticipated costs and effects on waiting lists. The operational page contains date-specific historical thresholds; use the threshold applicable to the assessment date. This record does not diagnose conditions, guarantee clearance or provide a current-year dollar amount.'
  }),

  // ── 4. HOUSING & TENANCY DISPUTES ───────────────────────────────────────────
  createRecord({
    id: 'ontario-rent-increase-guideline',
    title: 'Ontario: Residential rent increase guideline and exemptions',
    topic: 'housing',
    housingSubject: 'agreement',
    jurisdiction: 'ON',
    url: 'https://www.ontario.ca/page/residential-rent-increases',
    quote: 'The guideline is the maximum a landlord can increase most tenants\' rent during a year without the approval of the Landlord and Tenant Board.',
    summary: 'Ontario\'s Residential rent increases page states that in most cases the rent for a residential unit can be increased if at least 12 months have passed since the last rent increase or the date the tenancy began, and that the landlord must give the tenant written notice of a rent increase in the proper form at least 90 days before it takes effect; the proper forms for this notice are available from the Landlord and Tenant Board. If the landlord has not provided the proper notice, or you believe the rent has been raised by an improper amount, you can dispute it at the Landlord and Tenant Board within 12 months after the amount was first charged. The rent increase guideline for 2027 is 1.9% - the maximum a landlord can increase most tenants\' rent during a year without the approval of the Landlord and Tenant Board. It applies to most private residential rental units covered by the Residential Tenancies Act, 2006, including rented houses, apartments, basement apartments and condos, care homes, mobile homes and land lease communities. New buildings, additions to existing buildings and most new basement apartments that are occupied for the first time for residential purposes after November 15, 2018 are exempt from rent control. This record does not establish individual rent amounts or resolve tenancy disputes.'
  }),
  createRecord({
    id: 'ontario-ltb-n12-compensation',
    title: 'LTB: Notice to end tenancy for landlord personal use (Form N12)',
    topic: 'housing',
    housingSubject: 'eviction',
    jurisdiction: 'ON',
    url: 'https://tribunalsontario.ca/ltb/notices-and-applications-forms/',
    quote: 'A landlord must give this notice if they in good faith require the rental unit for personal residential occupation.',
    summary: 'Under Ontario rules, if a landlord gives notice to end a tenancy for personal use (such as for themselves, their immediate family, or caregiver), they must give the tenant the equivalent of 1 month rent or offer another acceptable unit. If the landlord gives 120 days notice or more, the 1 month rent compensation is not required.'
  }),
  createRecord({
    id: 'ontario-landlord-entry-privacy',
    title: 'Ontario: Landlord right of entry, privacy, and no-pet clauses',
    topic: 'housing',
    housingSubject: 'agreement',
    jurisdiction: 'ON',
    url: 'https://www.ontario.ca/page/renting-ontario-your-rights',
    quote: 'Landlords must follow rules under the RTA before entering a rental property and regarding tenancy terms.',
    summary: 'In Ontario, a landlord cannot evict a tenant directly or change the locks without an eviction order from the Landlord and Tenant Board (LTB). Even if the landlord provides written notice, the tenant has the right to attend an LTB hearing. The standard lease prohibits banning guests or pets unless exempted by condominium bylaws or causing damage.'
  }),

  // ── 5. DRIVING LICENCE FOREIGN EXPERIENCE ────────────────────────────────────
  createRecord({
    id: 'ontario-foreign-driving-experience',
    title: 'DriveTest Ontario: Foreign driver licence experience and road tests',
    topic: 'driving',
    jurisdiction: 'ON',
    url: 'https://drivetest.ca/licences/licence-exchanges/foreign-licence-experience-credits/',
    quote: 'You can credit foreign driving experience to fast-track your Ontario graduated driver licence.',
    summary: 'In Ontario, effective July 1, 2026, you can obtain credit for up to one year of driving experience by showing a valid original foreign driver licence and authentication document. If you do not have an exchange agreement, you must complete the vision test, knowledge test and G2 road test, and wait at least 12 months before attempting the G road test.'
  }),

  // ── 6. FOREIGN POLICE CLEARANCE CERTIFICATES (USA, PHILIPPINES, NIGERIA) ────
  createRecord({
    id: 'ircc-foreign-pcc-usa-philippines-nigeria',
    title: 'IRCC: How to get a police certificate - the general process and country instructions',
    topic: 'employment',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/medical-police/police-certificates/how.html',
    quote: 'In most cases, you must contact the local police or government to ask for a certificate.',
    summary: 'IRCC\'s how-to-get-a-police-certificate page states that in most cases applicants must contact the local police or government to ask for a certificate. Applicants may have to provide information or documents like photographs, fingerprints, and the addresses where they lived in the country or territory with the dates they lived there, and pay a fee. If the certificate is in a language other than English or French, the original police certificate must be sent along with a translation from a certified translator. The page notes that fingerprints given for a police certificate are not the same as giving biometrics (fingerprints and photo) for an application. Country-by-country instructions - how and where to get the certificate from different countries and territories - are reached through the page\'s country and territory selector. This record does not issue police clearance certificates.'
  }),

  // ── 7. PERMANENT RESIDENT RESIDENCY OBLIGATION & PRTD ───────────────────────
  createRecord({
    id: 'ircc-pr-residency-obligation-prtd',
    title: 'IRCC: Permanent resident 730-day residency obligation and PRTD',
    topic: 'employment',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/new-immigrants/pr-travel-document.html',
    quote: 'Permanent residents must meet the residency obligation of 730 days in Canada to maintain their status.',
    summary: 'If you are a permanent resident outside Canada without a valid PR card, you need a permanent resident travel document (PRTD) to return to Canada by commercial vehicle (such as airplane, boat, train or bus). The application fee is $50 and it is valid for single one-time entry. This record does not issue travel documents or determine status.'
  }),

  // ── 8. ONTARIO PROFESSIONAL LICENSING (PEBC, OCT, PEO) ───────────────────────
  createRecord({
    id: 'ontario-professional-licensing-pebc-oct-peo',
    title: 'Work in your profession or trade: regulated professions, protected titles and Global Experience Ontario (Ontario.ca)',
    topic: 'employment',
    jurisdiction: 'ON',
    url: 'https://www.ontario.ca/page/work-your-profession-or-trade',
    quote: 'Global Experience Ontario ( GEO ) provides information and referrals to help internationally trained individuals learn how to become licensed or certified to work in a non-health regulated profession or skilled trade in Ontario.',
    summary: 'Ontario\'s official guide to working in your profession or trade explains that if a profession or trade is regulated, to work or use a protected title you will likely need to have a licence or certificate and be registered with the proper regulatory body. A protected title is a professional title that can only be used by those who receive the designation from the regulatory body, and not all professions and trades are regulated. Global Experience Ontario ( GEO ) provides information and referrals to help internationally trained individuals learn how to become licensed or certified to work in a non-health regulated profession or skilled trade in Ontario: contact GEO if you\'re an internationally trained immigrant in a non-health regulated profession or skilled trade, before or after you arrive in Ontario; service providers who work with internationally trained immigrants can also seek information from GEO. This record does not issue licences or certificates.'
  }),

  // ── 9. ONTARIO RENTAL HEATING & REPAIRS STANDARDS ────────────────────────────
  createRecord({
    id: 'ontario-rental-heating-standards',
    title: 'Ontario: Tenant rights for heating, vital services, and municipal winter bylaws',
    topic: 'housing',
    housingSubject: 'repairs',
    jurisdiction: 'ON',
    url: 'https://tribunalsontario.ca/ltb/maintenance-and-repairs/',
    quote: 'Landlords must provide vital services including heat during prescribed winter months.',
    summary: 'Under the Landlord and Tenant Board (LTB) rules on vital services, a landlord cannot shut off or interfere with the supply of vital services to a tenant\'s rental unit, including heat from September 1 to June 15, electricity, fuel, and hot or cold water. Landlords are prohibited from withholding vital services even if rent is unpaid. This guidance explains vital service obligations; it does not issue repair orders or assess rent abatements.'
  }),

  // ── 10. BC RESIDENTIAL TENANCY BRANCH DISPUTE RESOLUTION ─────────────────────
  createRecord({
    id: 'bc-rtb-dispute-resolution',
    title: 'BC: Residential Tenancy Branch online dispute resolution and hearings',
    topic: 'housing',
    housingSubject: 'agreement',
    jurisdiction: 'BC',
    url: 'https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/solving-problems/dispute-resolution',
    quote: 'The Residential Tenancy Branch (RTB) provides dispute resolution services for BC landlords and tenants.',
    summary: 'Under the British Columbia Residential Tenancy Act, landlords and tenants in Vancouver and across BC resolve formal disputes through the Residential Tenancy Branch (RTB). Parties file an application for dispute resolution online through the RTB Dispute Access site using a Basic BCeID, providing evidence and paying a $100 filing fee (or applying for a fee waiver based on low income). Dispute resolution hearings are conducted by telephone conference with an independent RTB arbitrator whose written decisions and orders are legally binding and enforceable in BC Provincial Small Claims Court or BC Supreme Court. Emergency applications can be expedited for urgent health or safety issues. This record does not conduct hearings or issue arbitrated orders.'
  })
];
