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
    quote: 'The Super Visa lets eligible parents and grandparents visit family in Canada for up to 5 years at a time.',
    summary: 'The IRCC Super Visa allows eligible parents and grandparents of Canadian citizens and permanent residents to visit Canada for up to 5 continuous years per entry without renewing their status, with multi-entry validity up to 10 years. Applicants must provide a signed letter of financial promise from their host child or grandchild meeting the Minimum Necessary Income (LICO table based on household size), proof of valid emergency medical insurance from an approved Canadian or designated insurance company providing at least $100,000 in health coverage, and complete an immigration medical examination. Foreign pension or host country income of the parent cannot replace the Canadian sponsor financial requirement. This record does not verify individual financial eligibility or issue visas.'
  }),
  createRecord({
    id: 'ircc-spousal-sponsorship',
    title: 'IRCC: Sponsoring your spouse, partner or dependent child',
    topic: 'family',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/family-sponsorship/spouse-partner-children.html',
    quote: 'Sponsor your spouse, partner or dependent child to live in Canada as a permanent resident.',
    summary: 'Canadian citizens and permanent residents living in Canada can sponsor their spouse, common-law partner (requiring proof of at least 12 continuous months of cohabitation in a conjugal relationship), or dependent children under age 22. Sponsored spouses living inside Canada on valid temporary resident status can apply for an open work permit while their permanent residence application is being processed under the in-Canada spousal sponsorship public policy. Sponsoring a spouse does not require meeting a minimum necessary income threshold unless the dependent child also has dependent children of their own. Sponsors must sign an official 3-year undertaking of financial support. This record does not approve sponsorship applications or determine marriage validity.'
  }),
  createRecord({
    id: 'ircc-parent-sponsorship-pgp',
    title: 'IRCC: Parents and Grandparents Program (PGP)',
    topic: 'family',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/family-sponsorship/parents-grandparents.html',
    quote: 'Sponsor your parents and grandparents for permanent residence through the Parents and Grandparents Program.',
    summary: 'The Parents and Grandparents Program (PGP) allows Canadian citizens and permanent residents to sponsor parents and grandparents for permanent residence through an annual invitation-to-apply lottery system. Sponsors must prove they meet the Minimum Necessary Income (LICO plus 30%) for each of the 3 consecutive tax years prior to applying, evidenced exclusively by official CRA Notices of Assessment (NOA), and sign a 20-year undertaking to financially support their sponsored parents. Foreign pension or applicant income cannot be counted toward the sponsor income threshold. This record does not issue invitations to apply or calculate individual income.'
  }),
  createRecord({
    id: 'ircc-dependent-child-sponsorship',
    title: 'IRCC: Sponsoring a dependent child or orphaned family member',
    topic: 'family',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/family-sponsorship/spouse-partner-children/who-you-can-sponsor.html',
    quote: 'A child qualifies as a dependent if they are under 22 years of age and not married or in a common-law relationship.',
    summary: 'A child qualifies as a dependent for Canadian immigration if they are under 22 years of age and not married or in a common-law partnership, or 22 and older if financially dependent due to a physical or mental health condition before age 22. When sponsoring a minor child with one biological parent living abroad, IRCC requires form IMM 5604 (Declaration from Non-Accompanying Parent) signed with certified photo ID. Canadian citizens and permanent residents may also sponsor an orphaned brother, sister, nephew, niece, or grandchild under 18 years old who is unmarried and whose parents are deceased. This record does not grant child custody or legal guardianship.'
  }),

  // ── 2. EXPRESS ENTRY, WORK EXPERIENCE & CRS ──────────────────────────────────
  createRecord({
    id: 'ircc-express-entry-crs',
    title: 'IRCC: Comprehensive Ranking System (CRS) criteria for Express Entry',
    topic: 'employment',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/eligibility/criteria-comprehensive-ranking-system.html',
    quote: 'The Comprehensive Ranking System (CRS) ranks candidates out of 1,200 points across human capital, skill transferability and additional factors.',
    summary: 'The Express Entry Comprehensive Ranking System (CRS) ranks candidates out of 1,200 points across Core Human Capital (age points highest at 110 for ages 20 to 29 (100 with an accompanying spouse), falling each year from age 30 to 0 at age 45; education up to 150 points with 135 for Master degree and 120 for Bachelor degree; first language CLB level), Skill Transferability (combinations of post-secondary education with CLB 9+ language or 3+ years foreign work experience with Canadian work experience awarding up to 100 bonus points), and Additional Factors: 15 points for a Canadian citizen or permanent resident sibling, 50 points for bilingual French proficiency at NCLC 7, and 600 points for a provincial nomination. Category-based selection draws (such as STEM, healthcare, and skilled trades) require at least 12 months of full-time (or equivalent) work experience in an eligible occupation within the past 3 years, which need not be continuous (since 18 February 2026; it was 6 continuous months before). This record does not calculate individual CRS profiles or guarantee Invitations to Apply.'
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
    quote: 'You must show that you have enough money to settle in Canada if you are invited to apply under FSW or FST.',
    summary: 'Applicants under Federal Skilled Worker (FSW) and Federal Skilled Trades (FST) must show official bank letters proving unencumbered, readily available settlement funds based on family size (updated annually with LICO figures). Official bank letters must list all bank and investment accounts, balances, outstanding debts, and average balances for the past 6 months on official bank letterhead. Candidates applying under the Canadian Experience Class (CEC) or those authorized to work in Canada with a valid job offer from an employer are exempt from proof of funds requirements. This record does not verify individual bank balances or grant exemptions.'
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
    title: 'IRCC: Immigration medical examination and excessive demand policy',
    topic: 'health',
    jurisdiction: 'CA',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/standard-requirements/medical-requirements/refusals-inadmissibility/excessive-demand-on-health-and-social-services.html',
    quote: 'The excessive demand threshold is updated annually and reflects three times the Canadian average health and social services spending.',
    summary: 'Applicants for Canadian permanent residence must complete an immigration medical examination with a panel physician using the eMedical system. Under IRCC excessive demand policy, medical conditions are assessed against the excessive demand cost threshold (three times the Canadian average per capita health spending). Common manageable chronic conditions such as controlled type 2 diabetes, treated hypertension, and stable conditions requiring standard outpatient medications do not exceed the cost threshold and do not result in medical inadmissibility. Sponsored spouses and dependent children are completely exempt from excessive demand assessment. This record does not diagnose conditions or issue medical clearance.'
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
    summary: 'When an Ontario landlord serves a Form N12 notice to terminate a tenancy for personal use (for themselves, a spouse, child, or parent), section 48.1 of the Residential Tenancies Act requires the landlord to pay the tenant compensation equal to 1 month rent or offer another acceptable rental unit on or before the termination date on the notice. If the landlord fails to pay the compensation by the termination date, the LTB can dismiss the eviction application. If a landlord evicts in bad faith (such as relisting or re-renting within 12 months without occupying the unit), the LTB can order the landlord to pay the former tenant up to 12 months rent, moving expenses, and rent differentials under Form T5. This record does not issue eviction orders or award compensation.'
  }),
  createRecord({
    id: 'ontario-landlord-entry-privacy',
    title: 'Ontario: Landlord right of entry, privacy, and no-pet clauses',
    topic: 'housing',
    housingSubject: 'agreement',
    jurisdiction: 'ON',
    url: 'https://www.ontario.ca/page/renting-ontario-your-rights',
    quote: 'Landlords must follow rules under the RTA before entering a rental property and regarding tenancy terms.',
    summary: 'Under Ontario Residential Tenancies Act, landlords may only enter a rented unit after giving at least 24 hours advance written notice specifying the date, time between 8 a.m. and 8 p.m., and a valid reason such as repairs, inspections, or mortgage appraisal, except in genuine emergencies or where the tenant consents. Section 14 of the RTA makes no pet clauses in tenancy agreements completely void and unenforceable, meaning a landlord cannot evict a tenant simply for having a pet unless the pet causes damage, severe allergic reactions, or substantial interference (condominium declarations may have separate valid pet bylaws). Only the court sheriff may physically enforce an eviction; illegal lockouts by landlords are offences investigated by the Rental Housing Enforcement Unit (RHEU). Landlords may only require first and last month rent deposits, and security deposits are illegal. This record does not enforce privacy or investigate offences.'
  }),

  // ── 5. DRIVING LICENCE FOREIGN EXPERIENCE ────────────────────────────────────
  createRecord({
    id: 'ontario-foreign-driving-experience',
    title: 'DriveTest Ontario: Foreign driver licence experience and road tests',
    topic: 'driving',
    jurisdiction: 'ON',
    url: 'https://drivetest.ca/licences/licence-exchanges/foreign-licence-experience-credits/',
    quote: 'You can credit foreign driving experience to fast-track your Ontario graduated driver licence.',
    summary: 'Applicants moving to Ontario with a driver licence from a non-reciprocal country can credit foreign driving experience toward the graduated licensing system. With 2 or more years of verified driving experience supported by an official driving record abstract (such as an authenticated extract from the issuing transportation authority like Sarathi in India or embassy), applicants may bypass the mandatory G1 (12 months) and G2 (12 months) waiting periods upon passing the G1 knowledge and vision tests, and book the full G highway road test directly. If an applicant fails the G road test on the first attempt, they must pass the G2 road test before attempting the G road test again. Reciprocal licence holders with 2 or more years experience receive a full G licence directly, while those with less than 2 years receive a G2 licence. New residents may drive on an out-of-province or foreign licence for up to 60 days before switching to an Ontario licence. This record does not issue driving licences or verify individual records.'
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
    summary: 'Under section 28 of the Immigration and Refugee Protection Act (IRPA), permanent residents must accumulate at least 730 days (2 years) of physical presence in Canada within each 5-year rolling period to maintain permanent resident status. Days spent outside Canada count toward the 730 days residency obligation if accompanying a Canadian citizen spouse or common-law partner, working full-time for a Canadian enterprise or the Canadian public service abroad, or accompanying a permanent resident spouse who works full-time for a Canadian business. If a permanent resident is outside Canada with an expired or lost PR card, they cannot board a commercial flight, train, bus, or boat to Canada without applying online for a Permanent Resident Travel Document (PRTD) through the IRCC portal. This record does not determine residency compliance or issue travel documents.'
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
    summary: 'Under the Ontario Residential Tenancies Act and local municipal property standards bylaws, landlords are legally required to provide vital services including adequate heating from September 15 to June 1. Municipal bylaws specify minimum heating standards: the minimum room temperature is 20°C in Brampton under Property Standards By-law 56-2008, and 21°C in Toronto under Toronto Municipal Code Chapter 497 and in Mississauga. A landlord cannot shut off or withhold heat or any vital service, even for non-payment of rent. If heating is inadequate and the landlord fails to resolve it after written notice, tenants may contact municipal bylaw enforcement (311) for an inspection or file Form T6 (Tenant Application about Maintenance and Repairs) with the Landlord and Tenant Board for a rent abatement or repair order. This record does not issue repair orders or assess abatements.'
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
