// Research seed, not a comprehensive dataset. High-risk records require human approval.
import {countryPortals} from './country-portals.js';
export const checkedAt = '2026-10-28';
export const cities = {Toronto:'ON', Mississauga:'ON', Brampton:'ON', Vancouver:'BC'};
export const topics = ['sin','health','housing','community','arrival','employment','money','family','telecom','groceries','driving','transit','childcare'];// Human-readable topic names for the coverage map and /v1/topics. Keys must
// cover `topics` exactly; unknown ids must never silently render as code.
export const topicLabels = {
  sin: 'Social Insurance Number (SIN)',
  health: 'Health coverage',
  housing: 'Housing and tenancy',
  community: 'Community and settlement services',
  arrival: 'Arrival support',
  employment: 'Employment and credentials',
  money: 'Banking, taxes and benefits',
  family: 'Family and school life',
  telecom: 'Phone and internet',
  groceries: 'Groceries and food',
  driving: 'Driving licences',
  transit: 'Public transit',
  childcare: 'Child care'
};

// Human handoff partners. Northstar is a research preview and never replaces
// these organizations; each entry links to a service whose staff answer
// newcomer questions. Entry points were inspected through web research on
// 2026-10-28; their availability, eligibility rules and content are theirs,
// not ours. No referral fee or partnership exists.
const OntarioHandoff = [
  { name: 'Settlement.Org (Ontario newcomer guides and moderated forum)', url: 'https://settlement.org', channel: 'online guides and moderated forum', note: 'Ontario-focused newcomer information run by OCASI; its forum is answered by information and referral specialists.' },
  { name: 'YMCA Newcomer Information Centre', url: 'https://newcomersincanada.ca', channel: 'online booking', note: 'Greater Toronto Area first-stop in-person and online newcomer information; appointments can be booked from its site.' }
];
const VancouverHandoff = [
  { name: '211 British Columbia (United Way BC helpline)', url: 'https://bc.211.ca', channel: 'phone, text or web chat', note: 'Free, confidential help finding community and social services across British Columbia: dial or text 2-1-1, or use web chat. Resource navigators answer 9am-9pm Monday to Friday, excluding statutory holidays.' }
];
export const agencies = {
  Toronto: OntarioHandoff,
  Mississauga: OntarioHandoff,
  Brampton: OntarioHandoff,
  Vancouver: VancouverHandoff,
  national: [
    { name: 'Government of Canada service finder for newcomers', url: 'https://ircc.canada.ca/english/newcomers/services/', channel: 'online', note: 'Official IRCC service finder. Note: from April 1, 2026 economic-class permanent residents can access newcomer services only for a limited time window; eligibility is confirmed there.' },
    { name: 'IRCC client support (phone and TTY hours)', url: 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/contact-ircc.html', channel: 'phone and TTY', note: 'Official contact line for application-specific questions Northstar cannot answer.' },
    { name: 'Welcome to Canada (PeaceGeeks)', url: 'https://www.peacegeeks.org/projects/welcome-to-canada', channel: 'mobile app', note: 'Independent multilingual newcomer mobile app. We are not affiliated with it; listed because breadth beyond this pilot helps.' }
  ]
};
const record = (id, topic, jurisdiction, title, url, summary, quote, risk='low', extra=null) => ({
  id, topic, jurisdiction, title, url, summary, quote, risk, language: 'en',
  checkedAt: extra?.checkedAt ?? checkedAt, expiresAt: risk === 'high' ? '2026-11-04' : '2026-11-25',
  effectiveFrom: null, effectiveTo: null, status: risk === 'high' ? 'pending' : 'research_seed',
  reviewBasis: 'Official/public-service source inspected through web research; no independent human review.',
  crawlPolicy: 'manual_only_until_access_policy_review', ...(extra ?? {})
});
export const seeds = [
  record('sin-route','sin','CA','Apply for a Social Insurance Number','https://www.canada.ca/en/employment-social-development/services/sin/apply.html',
    'Use Service Canada’s official SIN application guide to select an application method and the documents for your situation. This pilot does not determine your document eligibility or processing time.',
    'Social Insurance Number: Apply'),
  // Social Insurance Number basics and required-documents records (0.19.13),
  // distilled from the ESDC SIN home page and the ESDC required-documents
  // page, both fetched in full on 2026-10-29 (page-details dates 2026-10-09
  // and 2026-05-20). The sin topic is low-risk, so these records ship as
  // research_seed with visible claims; they state what the pages state and
  // confirm no one's status, eligibility or personal SIN.
  record('esdc-sin','sin','CA','ESDC: Social Insurance Number (SIN)','https://www.canada.ca/en/employment-social-development/services/sin.html',
    'The ESDC Social Insurance Number page states that to work in Canada or access government programs and benefits you need a 9-digit identifier known as a Social Insurance Number (SIN), that the SIN is private, that it is illegal for anyone else to use it, and that you are responsible for protecting it. To find a forgotten SIN it suggests signing in to My Service Canada Account (MSCA) or checking an income tax return, a tax slip such as a T4, a Record of Employment, or an RRSP contribution receipt, and it notes that Service Canada no longer issues plastic SIN cards \u2014 old cards can still be used and a lost or damaged card is replaced with a Confirmation of SIN letter in paper or digital format. Application paths split by status: for temporary residents the SIN starts with "9" and expires with the immigration documents, and the page covers applying for a first SIN with a work or study permit that authorized work, extending an expiring or expired SIN, and requesting a confirmation of an existing SIN; for citizens and permanent residents the SIN is permanent and does not expire, covering a first SIN, a confirmation for the applicant or a child, and registering a newborn in a Territory; a further segment applies to people outside Canada and without legal status there who are eligible for benefits or a pension. This record states the page\u2019s process information and does not confirm anyone\u2019s status, eligibility or personal SIN.',
    'To work in Canada or access government programs and benefits, you need a 9-digit identifier known as Social Insurance Number (SIN). Your SIN is private and it is illegal for anyone else to use it.'),
  record('esdc-sin-documents','sin','CA','ESDC: Required documents for a SIN','https://www.canada.ca/en/employment-social-development/services/sin/required-documents.html',
    'The ESDC required-documents page states that applying for a SIN needs one primary identity document, which proves legal status in Canada, and one secondary identity document, which confirms identity, plus supporting documents if the name has changed. Primary documents depend on status: Canadian citizens present a birth certificate, a certificate of Canadian Citizenship or a Registration of Birth Abroad (before 1977); permanent residents present a permanent resident card, a Confirmation of Permanent Residence (COPR) issued within 1 year, a Record of Landing (before 2002), or a Verification of Landing/Status, which the page says is acceptable only to amend a SIN record or to confirm an existing SIN; temporary residents present a work or study permit stating you may work or may accept employment in Canada, a visitor record stating work authorization, or diplomatic ID with a Global Affairs Canada work authorization \u2014 and the page says a study permit or visitor record without the right to work should be checked with IRCC for an amended permit. The page also notes that Quebec birth documents issued before 1994 are not accepted, that a Canadian birth certificate must be issued by the province or territory of birth, and that documents must be issued by the Canadian government. The secondary document must be valid, show the full legal name (given name and family name) and date of birth, and be issued by a Canadian government or be a foreign passport; examples include a Canadian or foreign passport, a Canadian driver\u2019s licence, a provincial or territorial ID card and other Canadian government-issued ID. Name changes need legal documents showing the link between the original name and the current legal name \u2014 for example a marriage certificate, which the page says is not valid for Quebec residents married after April 1, 1981; a divorce decree; a legal change-of-name certificate or court order; an adoption order; a notarial certificate; or a request to Amend Record of Landing. Documents not in English or French must be translated: family members cannot translate, a Canadian certified translator must belong to a recognized translator and interpreters\u2019 organization and provide a stamped translation plus attestation, and a non-certified translator working for or belonging to an official organization or fluent in both languages provides a translation plus an affidavit sworn before someone authorized to administer oaths. Submission is online as clear digital copies of both sides showing the entire document including the borders, or original documents by mail or in person. This record lists document categories as the page states them and does not confirm anyone\u2019s status or guarantee acceptance of a specific document.',
    'The document you need depends on your status in Canada.'),
  record('ohip','health','ON','Ontario: Apply for OHIP','https://www.ontario.ca/page/apply-ohip-and-get-health-card',
    'Ontario has no OHIP waiting period for eligible applicants. Eligibility requirements still apply; this does not establish that you personally qualify.',
    'There is no longer a waiting period for OHIP coverage.', 'high'),
  record('msp','health','BC','BC: MSP coverage wait period','https://www2.gov.bc.ca/gov/content/health/health-drug-coverage/msp/bc-residents/eligibility-and-enrolment/how-to-enrol/coverage-wait-period',
    'BC’s guidance describes a wait consisting of the remainder of the month when residence is established plus two months. The ministry determines the residence date, and exceptions may apply. Apply promptly rather than waiting until the end of that period.',
    // Quote refreshed 2026-10-28 through the Wayback capture of 2026-10-23:
    // BC rewrote this page and the previous line is gone. The wait-period
    // semantics (remainder of the month plus two months) are unchanged.
    'Applying early gives us time to process your application.', 'high'),
  // Health "how to apply" documents records (0.19.15), distilled from the
  // Ontario required-documents page (fetched in full on 2026-10-29; its static
  // HTML carries no page-details date) and from the newest Wayback capture of
  // the BC MSP how-to-enrol page (2026-10-23 capture; that page states
  // "Last updated on June 4, 2026"; www2.gov.bc.ca stays unreachable from this
  // environment, as disclosed in the 0.19.14 refresh pass). Both records are
  // high-risk health guidance: they ship pending with no public claims until
  // independent human review.
  record('ohip-documents','health','ON','Ontario: Documents for a health card','https://www.ontario.ca/page/documents-needed-get-health-card',
    'To get, renew or replace an Ontario health card you need three separate identification documents, originals only: one that proves Canadian citizenship or OHIP-eligible immigration status, one that proves you live in Ontario (printed or digital/electronic for that item), and one that confirms your identity with your name and signature; photocopies are not accepted. The citizenship-or-status list differs by status, and the application is completed in person at a ServiceOntario centre, bringing all three documents and the completed form. This does not establish that you personally qualify.',
    'you will need three separate identification documents (Photocopies not accepted): an original one that proves your Canadian citizenship or OHIP -eligible immigration status an original, printed or digital/electronic one that proves you live in Ontario an original one that confirms your identity', 'high'),
  record('msp-documents','health','BC','BC: MSP enrolment and identity documents','https://www2.gov.bc.ca/gov/content/health/health-drug-coverage/msp/bc-residents/eligibility-and-enrolment/how-to-enrol',
    'BC MSP enrolment completes through the B.C. Services Card: most adults aged 18 years and six months and older visit an ICBC driver licensing office, provide primary and secondary identification documents (BC points to the accepted-identification lists at icbc.com/acceptedID), declare that they are a B.C. resident, and have their photo taken; individuals under 18 years and six months of age and temporary document holders receive a Non-Photo B.C. Services Card in the mail instead. You can apply for MSP online, in person at a ServiceBC location, or with the paper application form. The wait-period record covers how soon coverage can start; this does not establish that you personally qualify.',
    'At the ICBC driver licensing office, you will need to: Provide primary and secondary identification documents (visit icbc.com/acceptedID for more information); Declare that you are a B.C. resident; and Have your photo taken.', 'high'),
  // Interim Federal Health Program records (0.19.11), distilled from the IRCC
  // IFHP pages fetched in full on 2026-10-29 (each IFHP page carries a
  // 2026-05-01 page-details date, and the January 27, 2026 notice page
  // confirms the current co-payment scheme). Health is a high-risk topic: the
  // records ship pending human review and make no personal eligibility or
  // entitlement decision. The dollar figures are the pages' published
  // co-payments, verified verbatim, not benefit-grid maximums.
  record('ifhp-eligibility','health','CA','IRCC: Interim Federal Health Program eligibility','https://www.canada.ca/en/immigration-refugees-citizenship/services/refugees/help-within-canada/health-care/interim-federal-health-program/eligibility.html',
    'The IRCC eligibility page describes the Interim Federal Health Program (IFHP) as limited and temporary health care coverage until a person qualifies for provincial or territorial health insurance or leaves Canada, with coverage depending on immigration status. Eligible cohorts listed: asylum claimants in stated situations (awaiting a referral eligibility decision, awaiting an IRB final decision, rejected by the IRB, ineligible for referral but eligible for a pre-removal risk assessment, or with a positive PRRA decision and a stay of removal); protected persons in Canada (a positive asylum or PRRA decision); resettled refugees (government-assisted, blended visa office-referred, joint assistance sponsorship, privately sponsored, or other resettlement initiatives); victims of human trafficking and victims of family violence holding certain temporary resident permits (coverage until the permit expires); people detained under the Immigration Refugee Protection Act (coverage while detained or in the custody of the Canada Border Service Agency); individuals under specific temporary public policies; and individuals granted eligibility at the Minister\u2019s discretion case by case. For claimants, coverage starts when the Acknowledgment of Claim (AOC), Refugee Protection Identity Document (RPID) or Refugee Protection Claimant Document (RPCD) is received, and lasts until the person qualifies for provincial or territorial health insurance or leaves Canada; coverage is lost if the claim is withdrawn or abandoned, the IRB finds the claim abandoned, or the claim was never IRB-eligible and no PRRA application is possible. Protected persons\u2019 coverage lasts 90 days after a positive decision or until provincial or territorial eligibility. The IFHP portal can show whether a person is covered, what they are covered for and where to get health services; registering needs the unique client identifier (UCI) number and an email address. This record does not determine anyone\u2019s eligibility, status, group or coverage duration.',
    'Your coverage will start once you receive an Acknowledgment of Claim (AOC), Refugee Protection Identity Document (RPID) or, Refugee Protection Claimant Document(RPCD).','high'),
  record('ifhp-coverage','health','CA','IRCC: Interim Federal Health Program coverage','https://www.canada.ca/en/immigration-refugees-citizenship/services/refugees/help-within-canada/health-care/interim-federal-health-program/coverage-summary.html',
    'The IRCC coverage page states the Interim Federal Health Program provides limited and temporary coverage until provincial or territorial insurance eligibility, that coverage depends on the eligibility group, and that services must come from health care professionals registered with the IFHP. It lists: basic coverage free (examples: in-patient and outpatient hospital services; services from medical doctors, registered nurses and other licensed health care professionals including pre and postnatal care; laboratory, diagnostic and ambulance services); prescription medication coverage with a $4 co-payment for each eligible prescription filled or refilled; supplemental coverage where the IFHP pays 70% of eligible costs and the beneficiary pays 30% directly to the provider (examples: urgent dental care, vision care, mental health counselling, physiotherapy, speech language therapy, assistive devices like prosthetics, mobility aids and hearing aids, home care, medical supplies and equipment); and, for certain groups in Canada, one immigration medical examination if not previously covered under pre-departure medical services. The page\u2019s not-covered list includes services or products claimable under other public or private insurance, with an exception for urgent dental care by people eligible for the Canadian Dental Care Plan, where the IFHP acts as first payer. Medavie Blue Cross administers the program and answers coverage questions. This record does not determine any individual\u2019s entitlement, the payable amount in a specific case, or any clinical decision; the figures above are the page\u2019s published co-payments.',
    'The IFHP covers 70% of eligible costs for supplemental benefits. You pay 30% of the costs directly to your provider.','high'),
  record('eviction','housing','ON','LTB: How a landlord can end a tenancy','https://tm2.tribunalsontario.ca/documents/ltb/Brochures/How%20a%20Landlord%20Can%20End%20a%20Tenancy.html',
    'For tenancies covered by Ontario’s Residential Tenancies Act, an eviction order is enforced by the Court Enforcement Office, also called the Sheriff’s Office. Your tenancy coverage, notice requirements and exceptions need separate review.',
    'An eviction order can only be enforced by the Court Enforcement Office', 'high'),
  record('ircc-directory','community','CA','IRCC: Find newcomer services','https://www.ircc.canada.ca/english/newcomers/services/index.asp',
    'Use IRCC’s newcomer-service directory to find settlement support. Check the provider’s eligibility criteria before relying on a service.',
    'Find free newcomer services near you'),
  record('brampton-library','community','Brampton','Brampton Library: Newcomer services','https://www.bramptonlibrary.ca/newcomer-services',
    'Brampton Library works with community partners to offer newcomer settlement services. Check its current service page for availability.',
    'Brampton Library is proud to work with community partners'),
  record('mississauga-library','community','Mississauga','Mississauga Library: Newcomer services','https://www.mississauga.ca/library/using-the-library/newcomers/',
    'Mississauga Library offers programs for newcomers. Consult the official program listings for registration and current availability.',
    'The library offers a variety of programs for newcomers of all ages.'),
  record('toronto-library','community','Toronto','Toronto Public Library: Welcome to Toronto','https://tpl.ca/using-the-library/new-to-canada/information-for-newcomers/english/',
    'Toronto Public Library’s newcomer page introduces library services that help people settle in the city.',
    'Toronto Public Library offers many FREE services'),
  record('bc-guide','arrival','BC','WelcomeBC: Newcomers’ Guide','https://www.welcomebc.ca/start-your-life-in-b-c/bc-newcomers-guide',
    'The BC Newcomers’ Guide is an official starting point for settlement resources. This pilot does not yet contain a complete personalized first-week checklist.',
    'Newcomers’ Guide can help you navigate your journey'),
  // P1-5: ordered-checklist evidence. The steps below are a faithful order of
  // operations distilled from IRCC’s own first-two-weeks explainer (official
  // page, page date 2024-08-07; video filmed 2013). Filmed-name "CIC" is
  // rendered by its current name IRCC; dated details such as health coverage
  // wait periods are superseded by this pilot’s dedicated topic records.
  record('ircc-first-two-weeks','arrival','CA','IRCC: Your First Two Weeks in Canada','https://www.canada.ca/en/immigration-refugees-citizenship/news/video/your-first-two-weeks-canada.html',
    'IRCC’s official first-two-weeks explainer gives an order of operations: contact a local immigrant-serving organization, obtain your Social Insurance Number, apply for your provincial health card, update your address with IRCC, and consider a bank account, transit, libraries and the 9-1-1 number. Filmed in 2013; newer topic records in this pilot supersede its dated details.',
    'One of your first steps should be to call or visit one of these organizations in your new city.',
    'low',
    {
      checkedAt:'2026-10-28',
      steps:[
        'Keep your passport and completed customs declaration ready for the border services officer, and keep the confirmation of permanent residence you receive, since you may need it to access government services while you wait for your permanent resident card.',
        'Call or visit an immigrant-serving organization in your new city early, and bring your permanent residency documents with you.',
        'Visit a Service Canada Centre to apply for your Social Insurance Number, bringing your confirmation of permanent residence or other proof of status and your passport.',
        'Apply to your provincial or territorial government for a health insurance card as soon as possible.',
        'Once you have found a place to stay, update your address with IRCC so your permanent resident card can reach you.',
        'Consider opening a Canadian bank account in person, presenting original identification documents.',
        'Learn how to use your community’s public transportation and get a map of your new city to know your neighbourhood and local services.',
        'Remember that most public libraries in Canada offer free Internet access.',
        'Memorize the emergency number 9-1-1.'
      ]
    }
  ),
  record('fcac-bank-account','money','CA','FCAC: Opening a bank account','https://www.canada.ca/en/financial-consumer-agency/services/banking/opening-bank-account.html',
    'The Financial Consumer Agency of Canada explains account selection, identification and opening an account. Review its guide and confirm the documents with your chosen institution; this pilot does not determine whether your documents qualify.',
    'Opening a bank account','high'),
  record('cra-newcomers','money','CA','CRA: Newcomers to Canada and taxes','https://www.canada.ca/en/revenue-agency/services/tax/international-non-residents/individuals-leaving-entering-canada-non-residents/newcomers-canada-immigrants.html',
    'The CRA newcomer guide explains tax residency, income tax, benefits and credits. Use its residency guidance to investigate your situation; this pilot does not determine tax residency, filing obligations or benefit eligibility.',
    'Newcomers to Canada and the CRA','high'),
  // Canada Child Benefit records (0.19.10), distilled from the CRA's official
  // CCB pages fetched in full on 2026-10-29. Money is a high-risk topic: the
  // records ship pending human review, and no eligibility, status, custody or
  // payment-amount decision is made. The newcomers-CRA summary page already
  // carries the generic benefits entry, so these records cite the CCB-specific
  // pages; dollar amounts stay out because those pages publish income-based
  // formulas, not fixed figures verified here.
  record('ccb-eligibility','money','CA','CRA: Canada Child Benefit eligibility','https://www.canada.ca/en/revenue-agency/services/child-family-benefits/canada-child-benefit/who-apply.html',
    'The CRA\u2019s eligibility page states you may be eligible for the Canada child benefit if you live with and care for a child who is under 18 years old and meet the other criteria: living with the child, being primarily responsible for the child\u2019s care and upbringing, being a resident of Canada for tax purposes, and holding an eligible status \u2014 Canadian citizen, permanent resident, protected person, or a temporary resident who has lived in Canada for the previous 18 months and holds a valid permit in the 19th month that does not state \u201cdoes not confer status\u201d. The page states an individual with a \u201cRefugee Protection Claimant Document\u201d is not eligible for the CCB, describes shared-custody cases (a child who lives with a person at least 40% of the time can count as shared custody for the CCB), says you can only apply for the period when the child is living with you, and says the amount is calculated from adjusted family net income and the number and ages of eligible children, reduced as family net income rises. This record does not determine eligibility, immigration status, custody outcomes or payment amounts, and quotes no benefit amount.',
    'An individual with a \u201cRefugee Protection Claimant Document\u201d is not eligible for the CCB.','high'),
  record('ccb-apply','money','CA','CRA: Canada Child Benefit application','https://www.canada.ca/en/revenue-agency/services/child-family-benefits/canada-child-benefit/how-apply.html',
    'The CRA\u2019s how-to-apply page states that applying for the CCB also covers related provincial and territorial programs \u2014 the CRA determines eligibility for those when you apply for the CCB, so no separate application is needed. It says to apply as soon as the eligibility criteria are met and the child is born, a child starts to live with you or returns to live with you, or a custody arrangement begins, ends or changes. Three application routes are published: birth registration through the Automated Benefits Application (with online registration in Ontario, Quebec, British Columbia and Alberta; not available in Nunavut), the CRA account, or mailing Form RC66, Canada Child Benefits Application, with supporting documents. A dedicated section tells newcomers and returning residents to fill out and sign Schedule RC66SCH, Status in Canada/Statement of Income, and mail it with Form RC66. Proof of birth is required with online or mailed applications unless the CRA has already paid benefits for that child. The page points to the CRA account progress tracker and targeted processing times; this pilot does not determine eligibility, application outcomes or payment timelines.',
    'The Canada Revenue Agency (CRA) will determine your eligibility for these programs when you apply for the CCB.','high'),
  {...record('jobbank-newcomers','employment','CA','Job Bank: Finding work and checking credentials','https://www.jobbank.gc.ca/findajob/newcomers',
    'Job Bank provides newcomer job-search resources and a Foreign Credential Recognition tool. Check the occupation and location with the relevant regulator; this pilot does not establish work authorization or professional eligibility.',
    'Find a job in Canada as a newcomer','high'),
    reviewBasis:'Official search-index excerpt inspected on 2026-10-28; direct page retrieval timed out. No independent human review.'},
  // Foreign Credential Recognition + educational credential assessment
  // records (0.19.12), distilled from the ESDC program page and the IRCC
  // Express Entry education page, both fetched in full on 2026-10-29. The
  // pages serve two different purposes (licensing-pathway FCR versus
  // immigration-pathway ECA); both ship pending human review and no
  // individual's credential equivalency, work authorization or licence
  // outcome is decided anywhere.
  record('esdc-fcr','employment','CA','ESDC: Foreign Credential Recognition','https://www.canada.ca/en/employment-social-development/programs/foreign-credential-recognition.html',
    'The ESDC Foreign Credential Recognition page states that internationally trained professionals who want to work in a regulated occupation or compulsory trade must have their credentials recognized by the regulatory body for the profession or trade in the province or territory where they intend to work, and must obtain licensure or certification before working in the profession or using the designated title. The process verifies that education, skills and job experience obtained in another country are equivalent to the standards for that occupation in the province or territory of work, it varies by occupation and by province or territory, and the page recommends contacting the regulatory authority for your occupation, ideally before arriving in Canada. The Foreign Credential Recognition Tool checks whether a profession or trade is regulated in a given province or territory and finds the regulator to contact, along with job descriptions and career information. The page states Foreign Credential Recognition Loans from $15,000 up to $30,000 are available for costs such as licensing and qualifying exam fees, education and training programs, along with support services including career counseling and planning, mentorship and job readiness workshops, with an eligibility picker filtering providers by immigration status and province. This record does not establish any individual\u2019s credential equivalency, work authorization, employment eligibility or licensing outcome.',
    'The foreign credential recognition process is to verify that education, skills, and job experience obtained in another country are equivalent to the standards established for the profession or trade in the province or territory of work.','high'),
  record('ircc-eca','employment','CA','IRCC: Educational credential assessment (ECA)','https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/education-assessment.html',
    'The IRCC educational credential assessment page states an ECA verifies that a foreign degree, diploma or certificate (or other proof of the credential) is valid and equal to a Canadian one, and that an ECA for immigration purposes is needed by people who completed their education outside Canada to be eligible as the principal applicant for the Federal Skilled Worker Program (Express Entry) or to earn education points. The report must be less than 5 years old when the Express Entry profile is completed and the application submitted. Assessments must be done by an organization or professional body designated by IRCC; the page lists the designated multi-purpose organizations (Comparative Education Service \u2013 University of Toronto School of Continuing Studies, International Credential Assessment Service of Canada and World Education Services designated April 17, 2013, and International Qualifications Assessment Service and International Credential Evaluation Service \u2013 British Columbia Institute of Technology designated August 6, 2015) and says the Canadian Architectural Certification Board, the Medical Council of Canada and the Pharmacy Examining Board of Canada must assess certain architect, physician and pharmacist occupations by their designation dates. The page states the ECA report may help in a job search but doesn\u2019t guarantee a job or a licence to practise, and licensing in a regulated job must be obtained from the province or territory of settlement. This record does not assess anyone\u2019s credentials, decide an immigration outcome or establish a licensing entitlement.',
    'An Educational credential assessment (ECA) is used to verify that your foreign degree, diploma, or certificate (or other proof of your credential) is valid and equal to a Canadian one.','high'),
  {...record('ontario-licence','driving','ON','Ontario: Exchange an out-of-province driving licence','https://www.ontario.ca/page/exchange-out-province-drivers-licence',
    'Ontario publishes a licence-exchange guide covering the issuing jurisdiction, licence class and driving experience. Check the current requirements for your circumstances; this pilot does not decide exchange eligibility or testing requirements.',
    'Exchange an out-of-province driver’s licence','high'),
    reviewBasis:'Official search-index page text inspected on 2026-10-28; direct page retrieval returned 403. No independent human review.'},
  record('icbc-foreign-licence','driving','BC','ICBC: Moving from outside Canada','https://www.icbc.com/driver-licensing/moving-bc/moving-from-another-country',
    'ICBC provides guidance for obtaining a British Columbia driving licence when moving from another country. Review its exchange and application routes for your issuing jurisdiction; this pilot does not decide your eligibility.',
    'Moving from outside Canada','high'),
  // Issuing-country official sources: when a question names the country that
  // issued the current licence, retrieval also cites that country's official
  // licensing portal so a reader can confirm licence details at the source.
  // Jurisdiction values must match licence-context country names exactly.
  // The United States record is a federal directory (USA.gov) routing to the
  // state agency that issued the licence, because licensing itself is
  // state-administered; it is not presented as a national authority.
  // Issuing-country revision (0.19.16): the two Australian records below are
  // added after further source research — the earlier omission note said
  // Austroads "addresses visiting drivers, not licence verification", but the
  // Austroads Australian-driver-licensing page carries section 2.8 stating
  // every Australian driver licence can be verified by an authorised user of
  // the National Document Verification Service, so Australia is representable
  // after all. Both pages were reached through the desktop browser (Cloudflare
  // blocks node and curl after the research burst) and quotes were verified
  // verbatim in-page under the citation convention; the records use the
  // canonical austroads.gov.au host the site serves. China remains skipped:
  // the official Traffic Management 12123 platform is app-first with no
  // stable HTTPS web portal verified. Widening round (0.19.17): the next two
  // largest source cohorts reached through official English-language pages
  // were Japan and Ghana — the Tokyo Metropolitan Police Department's
  // multilingual English portal (updated 2026-06-26) and the DVLA Ghana
  // services catalogue, both fetched in full over direct node fetch with
  // quotes verified verbatim. Probes that did not produce usable English
  // pages, also on 2026-10-29: South Korea stays entirely blocked at the
  // network layer here (node ECONNREFUSED, browser navigation failed, and
  // the newest koroad.or.kr/eng Wayback capture is 2024-11-04, too stale to
  // cite); Bangladesh's BRTA portal is Bengali-only in every capture;
  // Sri Lanka's newest capture is 2024-06; Brazil's gov.br/transportes is
  // Portuguese-only; RTMC South Africa shows a site-maintenance page. All
  // sixteen issuing-country records await independent review.
  // Widening round 2 (0.19.18): Hong Kong becomes the thirteenth recognized
  // issuing country — its Transport Department publishes a stable English
  // driving-licences page (updated for appointments from 16 March 2026) and
  // carries a verifiable licence-measure sentence (encrypted QR code on
  // licences since 2021), fetched in full over direct node fetch with the
  // quote verified verbatim. Also probed, and documented as dead ends: Kenya
  // ntsa.go.ke is a JavaScript single-page app in the desktop browser whose
  // driving-licence detail flows into the eCitizen platform (no static
  // English licence content reachable; node rejects the site's certificate
  // chain), and Bangladesh's brta.teletalk.com.bd is only a recruitment
  // circular system, while BRTA's main portal remains Bengali-only.
  // Widening round 3 (0.19.19): Taiwan and Israel join as the fourteenth and
  // fifteenth recognized issuing countries. Taiwan's Highway Bureau (MOTC)
  // publishes the official English MVDIS driver's guide with the licence-test
  // general regulations (fetched in full over direct node fetch; quote
  // verified verbatim). Israel's Ministry of Transport and Road Safety
  // publishes the English driver's-licence renewal service on gov.il, which
  // blocks node with its Cloudflare challenge — reached through the desktop
  // browser (one reload cleared the challenge) and quotes verified verbatim
  // in-page; the page shows "last updated on 21.07.2026" and the newest
  // capture history was not needed. Probes that produced no usable English
  // licence page, also on 2026-10-29: Macau DSAT serves a Chinese homepage
  // (the guessed English path is a 999-byte redirect stub with no licence
  // text), UAE's RTA portal is unreachable from this environment (deep path
  // ETIMEDOUT, root is a 2KB shell), and Vietnam's Ministry of Transport
  // hosts still fail DNS resolution here.
  // Widening round 4 (0.19.20): Singapore becomes the sixteenth recognized
  // issuing country — the Singapore Police Force publishes the official
  // English "Singapore Driving Licence" page (validity, licence classes,
  // medical-certification rule and the Singpass Digital Driving Licence,
  // whose in-app card is the primary means of verifying licence information
  // locally), fetched in full over direct node fetch with four passages
  // verified verbatim. Third frontal round on the remaining hard cohorts,
  // also 2026-10-29: Sri Lanka's dmt.gov.lk and Korea's koroad.or.kr fail to
  // load through the desktop browser exactly as they fail over node; the UAE
  // RTA site redirects to its Arabic home and errors; Nepal's dotm.gov.np is
  // reachable but Nepali-dominant (the ?lang=eng parameter changes nothing
  // and the licence-status subdomain is refused here); Jamaica and Trinidad
  // registry hosts fail DNS. All seventeen issuing-country records await
  // independent review.
  // Widening round 5 (0.19.21): the Netherlands becomes the seventeenth
  // recognized issuing country — the Netherlands Vehicle Authority (RDW)
  // publishes a full English driving-licence section including the official
  // "Exchanging a foreign driving licence" page (fetched in full over direct
  // node fetch; six passages verified verbatim), whose exchange list even
  // names the Canadian provinces of Alberta and Québec. Poland was probed the
  // same day: gov.pl's English "Acquiring and renewing a driving licence"
  // page (Your Europe in Poland) covers only EU/EFTA mutual recognition for
  // foreigners in Poland, with no Polish-licence administration content, so
  // it does not fit the issuing-country record shape and was skipped. The
  // Wayback route checked the same day returned no 2026 captures for Korea's
  // koroad.or.kr/eng/, Sri Lanka's dmt.gov.lk/english/ or Nepal's
  // dotm.gov.np/en/, so the stale-free Wayback path stays closed as well.
  // All eighteen issuing-country records await independent review.
  // Widening round 6 (0.19.22): Ireland and New Zealand join as the
  // eighteenth and nineteenth recognized issuing countries. Ireland's
  // National Driver Licence Service publishes the English "How to Exchange
  // a Foreign Driving Licence" page (node's fetch met the site's Cloudflare
  // challenge; reached through the desktop browser and four passages
  // verified verbatim in-page) — the recognised-state exchange requirements
  // with Letter of Entitlement rules, the 12-month visitor rule, the reduced
  // Essential Driver Training route for licences that cannot be exchanged,
  // and per-issuing-place requirement pages that list Canadian provinces
  // (Alberta's Class 5 = B, W, Class 6 = AM, A1). New Zealand's NZ Transport
  // Agency Waka Kotahi publishes the English "Converting a car licence" page
  // (fetched in full over direct node fetch; three passages verified
  // verbatim in the page's clean() output) — the validity and IDP rules, the
  // driving time limit, and the exempt-country list, which names Canada.
  // Probes with nothing usable, also on 2026-10-29: Korea's
  // english.molit.go.kr and Saudi Arabia's moi.gov.sa refuse connections
  // from this environment, and the Czech Ministry of Transport's lowercase
  // /en/ path 404s like its /EN/ path. All twenty issuing-country records
  // await independent review.
  // Widening round 7 (0.19.23): Norway and Sweden join as the twentieth and
  // twenty-first recognized issuing countries. Norway's Statens vegvesen
  // publishes the English "Exchanging driving licences issued in countries
  // outside the EU/EEA" page (fetched in full over direct node fetch; three
  // passages verified verbatim) with the designated-country list — Australia,
  // Canada, Israel, Monaco, New Zealand, San Marino, South Korea and the USA,
  // plus the UK, Switzerland, Japan and Greenland — and the rule that a
  // non-EU/EEA licence from a country not listed there cannot be exchanged.
  // Sweden's Transportstyrelsen English driving-licence pages cover the EEA
  // exchange path (permanent residence, categories needing medical papers,
  // the 375 SEK production fee, and the foreign licence returned to its
  // issuing authority) and the four conditional non-EEA origins (United
  // Kingdom, the Faroe Islands, Switzerland and Japan), fetched in full over
  // direct node fetch with four passages verified verbatim. Probes this
  // round, also on 2026-10-29: Malaysia's JPJ English portal is reachable
  // but its licence-service pages sit behind deeper links not reached from
  // the portal root; South Africa's RTMC still shows its Website Maintenance
  // page; Thailand's dlt.go.th resets connections from this environment;
  // Denmark's Motorstyrelsen serves a Danish-language site with no licence
  // hints. All twenty-two issuing-country records await independent review.
  // Widening round 8 (0.19.24): Finland becomes the twenty-second recognized
  // issuing country — Traficom (the Finnish Transport and Communications
  // Agency) publishes the English "Exchanging a foreign driving licence for
  // a Finnish driving licence" page (fetched in full over direct node fetch;
  // six passages verified verbatim) with the per-origin usage rules (EU/EEA
  // licences valid to expiry, Contracting-State licences for two years after
  // permanent relocation, other recognized countries' licences for tourists
  // without a time limit and one year after population-register entry), the
  // Ajovarma application path with the temporary licence, and the six-month
  // medical-certificate rule. Probes this round, also on 2026-10-29:
  // Malaysia's JPJ English portal resolves its conversion checklist to a PDF
  // file, which this pilot does not use as the cited page for high-risk
  // records; Fiji's LTA root serves a JavaScript-only shell (22 characters
  // of text); and Denmark's Motorstyrelsen has no English section (its /en/
  // path is a 404). All twenty-three issuing-country records await
  // independent review.
  // Widening round 9 (0.19.25): Malta and Estonia join as the twenty-third
  // and twenty-fourth recognized issuing countries. Malta's Transport Malta
  // publishes the English "Exchange your foreign Driving Licence" page —
  // Cloudflare-gated over node fetch (a repeat fetch returned a "Just a
  // moment..." challenge while earlier fetches succeeded), so the passages
  // were verified on the page served to the desktop browser, the pilot's
  // verified channel for gated hosts — with the origin-based exchange
  // entitlement (another EU member state, an EEA state namely Norway,
  // Iceland and Liechtenstein, Switzerland, Australia, the United Arab
  // Emirates or the United Kingdom), the at-least-185-days-in-twelve-months
  // residency precondition, the twelve-month visitor window from last
  // entry, the DRV 030/014/008/009 per-origin forms (the UAE form marked
  // "Only for Malta/UAE citizens"), and the expired-licence medical note
  // (a Medical Certificate is required if the applicant is over 70 or holds
  // C and D categories). Estonia's Transport Administration
  // (Transpordiamet) publishes the English "Driving licence issued outside
  // Estonia" page (fetched in full over direct node fetch; passages
  // verified verbatim) with the Latin-script validity criteria plus the
  // category symbol/description requirement, the refusal rule for licences
  // whose authenticity cannot be reliably verified or that lack sufficient
  // security features, the EU/EEA/Swiss rules (valid until the expiration
  // date; licences valid longer than 15 years exchangeable by 18 January
  // 2033 upon moving to Estonia), the 1968 Vienna and 1949 Geneva
  // contracting-party lists (licences valid in Estonia for 12 months from
  // the beginning of the owner's residency; official Estonian translations
  // for non-Latin entries; the lists name Pakistan, the Philippines,
  // Ukraine, the United Arab Emirates, the United Kingdom, Canada, India,
  // Japan, Ghana, Hong Kong and Singapore among many others), and the
  // exchange path (permanent residents living in Estonia at least 185 days
  // per calendar year, right to drive not suspended/withdrawn/revoked,
  // permanent residency from the population register, licences typically
  // exchanged without exams, exams when the licence expired more than five
  // years previously or was issued while the person was not a permanent
  // resident of the country of issue). Probes this round, also on
  // 2026-10-29: Cyprus's rtd.mcit.gov.cy fails DNS; Latvia's csdd.lv times
  // out; Zambia's RTSA fails TLS certificate verification; Mauritius's
  // nta.mu fails DNS; Croatia's MUP English homepage serves no licence
  // content; and the guessed English paths on Slovenia's gov.si,
  // Switzerland's ch.ch and Luxembourg's guichet.public.lu are 404s. All
  // twenty-five issuing-country records await independent review.
  record('india-sarathi-dl','driving','India','India: Parivahan/Sarathi driving licence services (select your issuing state)','https://parivahan.gov.in/en/faq/services-on-driver-license',
    'India’s official Parivahan portal, run by the Ministry of Road Transport and Highways with NIC, describes its Sarathi driving-licence services, which are used after selecting the issuing state and include licence services and status checks. This pilot does not verify an individual licence or decide Ontario or BC exchange eligibility.',
    'Services on Driving License','high'),
  record('uk-dvla-share-licence','driving','United Kingdom','UK: DVLA view or share driving licence information','https://www.gov.uk/view-driving-licence',
    'GOV.UK lets Great Britain driving-licence holders view or share their licence details and generate a check code another party can use to confirm them; Northern Ireland licence holders use a separate nidirect service instead. This pilot does not verify an individual licence or decide Ontario or BC exchange eligibility.',
    'View or share your driving licence information','high'),
  record('philippines-lto-ltms','driving','Philippines','Philippines: LTO LTMS driving licence portal','https://portal.lto.gov.ph/',
    'The Land Transportation Office’s LTMS public portal lets Philippine driving-licence holders register and access licence services and records online. This pilot does not verify an individual licence or decide Ontario or BC exchange eligibility.',
    'LTMS Online Portal','high'),
  record('punjab-dlims-licence','driving','Pakistan','Pakistan (Punjab): DLIMS driving licence system','https://dlims.punjab.gov.pk/',
    'Punjab’s official DLIMS portal, part of the Government of Punjab’s Dastak one-window program, provides driving-licence services, verification and e-licence access for licences issued in Punjab. Licences from other Pakistani provinces have separate issuing authorities; check the relevant province. This pilot does not verify an individual licence or decide Ontario or BC exchange eligibility.',
    'Driving License Information Management System','high'),
  record('germany-kba-licence','driving','Germany','Germany: KBA federal driving licence register information','https://www.kba.de/EN/Home/home_node.html',
    'The Kraftfahrt-Bundesamt (KBA) is Germany’s federal motor transport authority; its English pages describe online access to stored register data, including driving-licence register entries (ZFER), while local licence authorities issue the licences themselves. This pilot does not verify an individual licence or decide Ontario or BC exchange eligibility.',
    // Quote refreshed 2026-10-28 against the live English portal home; the
    // former "KBA -..." line renders only in search-index brand form, not on
    // the page itself.
    'Federal Motor Transport Authority','high'),
  record('france-ants-licence','driving','France','France: ANTS driving licence portal (France Titres)','https://permisdeconduire.ants.gouv.fr/',
    'The Agence Nationale des Titres Sécurisés (ANTS) operates France’s official online driving-licence portal, where holders manage licence fabrication, exchange and international permit requests through a personal account; the portal interface is French. This pilot does not verify an individual licence or decide Ontario or BC exchange eligibility.',
    'France Titres (ANTS)','high'),
  record('ukraine-hsc-licence','driving','Ukraine','Ukraine: HSC MVD online driver’s licence check','https://opendata.hsc.gov.ua/check-driver-license/',
    'Ukraine’s Main Service Centre of the Ministry of Internal Affairs publishes an official online driver’s licence check on its open-data portal; the portal interface is primarily Ukrainian. This pilot does not verify an individual licence or decide Ontario or BC exchange eligibility.',
    'The Main service center provide paid and free services within the competence of the Ministry of Interior','high'),
  record('nigeria-frsc-licence','driving','Nigeria','Nigeria: FRSC driver’s licence verification portal','https://ndlverification.frsc.gov.ng/',
    'The Federal Road Safety Corps operates Nigeria’s official driver’s licence verification portal alongside the national driver’s licence application site (nigeriadriverslicence.org). This pilot does not verify an individual licence or decide Ontario or BC exchange eligibility.',
    'Nigeria\'s Drivers Licence Verification Portal','high'),
  record('usa-gov-motor-vehicle-services','driving','United States','USA: official directory of state motor vehicle services','https://www.usa.gov/state-motor-vehicle-services',
    'The United States issues driving licences through each state’s motor vehicle agency rather than a national authority; USA.gov’s official directory links every state’s DMV services so a reader can reach the agency that issued a specific licence. The directory is not a licence registry. This pilot does not verify an individual licence or decide Ontario or BC exchange eligibility.',
    'State motor vehicle services','high'),
  // Australian issuing-country records (0.19.16), distilled from two Austroads
  // pages fetched fully through the desktop browser (canonical host
  // austroads.gov.au; node and curl are 403-challenged there). Neither record
  // verifies an individual licence, and both await independent review.
  record('australia-overseas-drivers','driving','Australia','Australia: Overseas drivers — licence use and the conversion requirement','https://austroads.gov.au/drivers-and-vehicles/overseas-drivers',
    'Austroads, the association of Australian state and territory transport agencies, publishes the official visiting-driver rules: overseas visitors without a permanent visa are in most cases visiting drivers who may use their valid overseas licence, with no time limit in most states and territories except the Northern Territory (3 months) and New South Wales and Victoria (6 months), and it is only when a person becomes a permanent resident or Australian citizen that they are required to take out an Australian-issued driver licence; holders staying in the Northern Territory, New South Wales or Victoria must contact the local licensing authority to check local requirements. Recognition of overseas licences is assessed by Austroads but delivered by each state and territory licensing authority, so their pages govern exchange requirements. This pilot does not verify an individual licence or decide Ontario or BC exchange eligibility.',
    'Except for the Northern Territory (3 months), and New South Wales and Victoria (6 months), Australian states and territories allow visiting drivers to drive indefinitely on their overseas licence as long as it is current.','high'),
  record('australia-dvs-licence','driving','Australia','Australia: National driver licensing scheme and licence verification (DVS)','https://austroads.gov.au/drivers-and-vehicles/registration-and-licensing/australian-driver-licensing',
    'Australia’s driver licensing runs on a single National Driver Licensing Scheme — one classification structure with uniform requirements for issuing, varying, renewing, suspending and cancelling licences since 1997 — administered by the driver licensing authority of each state and territory; recognition of overseas driver licences is assessed by Austroads while each state and territory authority provides the recognition itself. The National Document Verification Service (DVS), introduced by the Australian Government in 2009, lets authorised organisations compare identifying information with government records online, providing yes-or-no verification within seconds, and all Australian driver licences can be verified by an authorised DVS user. This pilot does not verify an individual licence or decide Ontario or BC exchange eligibility.',
    'All Australian driver licences can be verified on-line by an authorised user of the DVS.','high'),
  // Japanese and Ghanaian issuing-country records (0.19.17): Japan's driver
  // licensing is run by prefectural police, and Tokyo MPD publishes the
  // official English-language licence-procedures portal (updated 2026-06-26);
  // Ghana's DVLA is the national licensing authority and its services page
  // details the full driver-licensing service list including conversion of
  // foreign licences. Both pages were fetched in full over direct node fetch
  // on 2026-10-29 and quotes verified verbatim under the citation convention.
  // Neither record verifies an individual licence; both await review.
  record('japan-mpd-licence','driving','Japan','Japan: Tokyo Metropolitan Police driver’s licence procedures (English multilingual portal)','https://www.keishicho.metro.tokyo.lg.jp/multilingual/english/traffic_safety/drivers_licenses/procedures.html',
    'Japan’s driver licences are administered by police under the National Police Agency, prefecture by prefecture; in Tokyo the Tokyo Metropolitan Police Department handles licensing, and its official multilingual English section states that Tokyo residents can apply for a Japanese driver’s license at one of the following Driving License Testing and Issuing Centers — Fuchu (3-1-1, Tama-cho, Fuchu-shi), Samezu (1-12-5, Higashi-Oi, Shinagawa-ku) and Koto (1-7-24, Shin-Suna, Koto-ku) — with the licence-management section reachable by phone. The portal’s procedures index links booking materials for the knowledge test and renewal system plus validity rules for foreign licences and international driving permits as PDFs, while the full foreign-licence conversion procedure is published on the Japanese-language official pages only. This pilot does not verify an individual licence or decide Ontario or BC exchange eligibility.',
    'Tokyo residents can apply for Japanese driver\'s license at one of the following Driving License Testing and Issuing Centers','high'),
  record('ghana-dvla-licence','driving','Ghana','Ghana: DVLA driver licensing services (learner’s licence, driver’s licence, renewal, foreign-licence conversion)','https://dvla.gov.gh/services/',
    'Ghana issues driving licences through the Driver & Vehicle Licensing Authority, the statutory licensing body under the Ministry of Transport; its official services catalogue details every driver-licensing service with requirements, procedures and processing windows — issue of a learner’s licence (must be 18 or above for licence A or B, at least 21 for licence E, with an eye test at a designated clinic and biometric capture), application for a driver’s licence (evidence of compulsory training with a certified Driver Training Institution, a theory test and an in-traffic driving test), renewal of a licence held for two or four years, replacements for lost or defaced licences, an international driving permit, and conversion of a foreign licence, which requires the original valid foreign licence, a resident permit for foreign nationals and an authentication letter or driving records from the issuing authority — with applications invoiced online through www.online.dvla.gov.gh. This pilot does not verify an individual licence or decide Ontario or BC exchange eligibility.',
    'Detailed requirements, procedures, and estimated time frames for Vehicle Registration and Driver Licensing services.','high'),
  // Hong Kong issuing-country record (0.19.18): the Transport Department of
  // the Hong Kong SAR runs licensing separately from mainland China's
  // app-first 12123 arrangement, so Hong Kong is recognized on its own and
  // cited by the canonical td.gov.hk host. Fetched in full over direct node
  // fetch on 2026-10-29; quote verified verbatim. Awaiting review.
  record('hongkong-td-licence','driving','Hong Kong','Hong Kong: Transport Department driving-licence services (application, renewal, direct issue for licence holders from outside Hong Kong)','https://www.td.gov.hk/en/public_services/licences_and_permits/driving_licences/index.html',
    'Hong Kong issues driving licences through the Transport Department of the Hong Kong SAR Government, which serves licensing at its four Licensing Offices with a queue-ticketing system and publishes application forms online and at its enquiry counters; applications are submitted in person or by post with supporting documents and the appropriate fee. Newly issued licences carry a system-encrypted QR code to support the Hong Kong Police Force’s e-ticketing work, and holders of a full driving licence issued outside Hong Kong who wish to drive in the city follow the direct-issue route; from 16 March 2026, direct-issue applications must be booked first through the Transport Department’s online appointment system, with no walk-in submission. This pilot does not verify an individual licence or decide Ontario or BC exchange eligibility.',
    'Starting from 22 March 2021, the Transport Department (TD) will print a system encrypted QR code on newly issued driving licence.','high'),
  // Taiwan and Israel issuing-country records (0.19.19): Taiwan cited from
  // its Highway Bureau's official English MVDIS driver's guide and Israel
  // from the Ministry of Transport's English gov.il renewal service (reached
  // through the desktop browser after the site's Cloudflare challenge; one
  // reload cleared it). Neither record verifies an individual licence; both
  // await independent review.
  record('taiwan-mvdis-licence','driving','Taiwan','Taiwan: MVDIS English driver’s guide (licence-test regulations, Highway Bureau MOTC)','https://www.mvdis.gov.tw/m3-emv-eng/public_en/about_02_01En',
    'Taiwan administers driving licences through motor-vehicle offices under the Highway Bureau of the Ministry of Transportation and Communications, and the official MVDIS portal’s English driver’s guide lists the general regulations for licence tests: learner’s licences are applied for at motor vehicle offices, with applicants required to be over 18 years old and to pass a physical examination and Fitness Performance Test designated by public hospitals, public-health organizations or the motor vehicle offices; licences for general, light and heavy motorcycles require age 18 or older, licences for large and heavy motorcycles (above 250 cc) require at least age 20 plus one year of experience and completed training with certified drivers-training organizations, and small-vehicle applicants need over 3 months of driving training; the portal’s inquiry section links the overseas-driving-licence page and the table of driving licences with Taiwan’s reciprocal countries. This pilot does not verify an individual licence or decide Ontario or BC exchange eligibility.',
    'Applicants for learner\'s license should be over 18 years old, and pass the physical examination and Fitness Performance Test designated by public hospitals, organizations of public health, or motor vehicle offices.','high'),
  record('israel-govil-licence','driving','Israel','Israel: Ministry of Transport driver’s-licence renewal service (gov.il English page)','https://www.gov.il/en/service/driving_license_renewal',
    'Israel renews and issues driving licences through the Ministry of Transport and Road Safety’s Licensing Bureau, and its official gov.il renewal service explains the cycle end to end: a temporary driver’s license is emailed upon payment, and the permanent computerized licence — issued with the holder’s photo — follows within 30 days to the address registered with the Population and Immigration Authority, whose records of the name, Hebrew date of birth and mailing address must be kept current; holders of private-vehicle classes (B, C1, A2, A1) must be tested from age 75, with medical-test forms sent via Israel Post to the Update and Control Department in Holon, and where a licence expires within one month before test results arrive the licensing bureau can schedule an appointment for a six-month temporary licence; unclaimed permanent licences are kept at the Issuing Center for 90 days and then destroyed; and under Regulation 9 of the Transportation Regulations a driver may drive in Israel without carrying the licence but must carry an official ID, an insurance certificate and the licence’s appendices. This pilot does not verify an individual licence or decide Ontario or BC exchange eligibility.',
    'The permanent driver\'s license will be sent within 30 days to the updated address in the Population Authority.','high'),
  // Singapore issuing-country record (0.19.20): the record below cites the
  // Singapore Police Force's official English "Singapore Driving Licence"
  // page, fetched in full over direct node fetch with four passages verified
  // verbatim. It does not verify an individual licence and awaits independent
  // review.
  record('singapore-spf-licence','driving','Singapore','Singapore: Police Force driving-licence page (requirement, conversion, Digital DL)','https://www.police.gov.sg/Knowledge-Hub/Traffic/Traffic-Matters/Singapore-Driving-Licence',
    'Singapore publishes its driving-licence guidance through the Singapore Police Force, and the official SPF page states the core rule up front: you need to possess a valid Singapore Driving Licence to drive or ride a motor vehicle on the roads, and the licence indicates which class of vehicle you are able to drive; the requirement applies to all Singapore citizens, all permanent residents, foreigners residing in Singapore for more than 12 months, and foreigners residing in Singapore for less than 12 months who are employed as drivers holding Work Permits or S-Pass, and anyone in these categories holding a valid foreign driving licence is required to convert it to a valid Singapore Driving Licence — the page’s conversion section lists supporting documents for the legitimacy and validity of the foreign licence, including a current licence, an extract of the driving-licence record when the foreign licence does not display the first issue date, and a letter of endorsement from the country of issuance; those seeking a licence may commence training at any one of the three driving centres (Bukit Batok Driving Centre, ComfortDelGro Driving Centre or Singapore Safety Driving Centre); a driver with an existing medical condition or physical disability that may affect fitness and ability to drive must, in accordance with Road Traffic Act Section 37(6) or the Road Traffic (Motor Vehicles, Driving Licences) Rules Section 8(1)(a)–(e), obtain a medical certification or a memo from a Singapore-registered medical practitioner, a requirement that applies to drivers of all ages; and the Digital Driving Licence is a digital card in the Singpass app that displays the holder’s photograph, driving licence number, classes of vehicles allowed, status of the licence, demerit points and eligibility for the Certificate of Merit, usable to verify driving-licence information wherever required locally. This pilot does not verify an individual licence or decide Ontario or BC exchange eligibility.',
    'In Singapore, you need to possess a valid Singapore Driving Licence to drive or ride a motor vehicle on our roads.','high'),
  // Netherlands issuing-country record (0.19.21): the record below cites the
  // RDW's official English "Exchanging a foreign driving licence" page,
  // fetched in full over direct node fetch with six passages verified
  // verbatim. It does not verify an individual licence and awaits
  // independent review.
  record('netherlands-rdw-licence','driving','Netherlands','Netherlands: RDW exchanging a foreign driving licence (official English page)','https://www.rdw.nl/en/driving-licence/foreign-driving-licence/exchanging-a-foreign-driving-licence',
    'The RDW publishes the Netherlands’ official English guidance on exchanging a foreign driving licence: driving on a foreign licence in the Netherlands is allowed for a limited period only, after which the licence must be exchanged through the municipality, and whether exchange is possible depends on the issuing country; applicants must be registered in the Personal Records Database (BRP) and hold EU/EFTA nationality or a temporary or permanent residence permit (exchange is not possible while waiting for a new residence permit); a valid EU/EFTA licence can always be exchanged and is allowed to be expired, while licences from outside the EU/EFTA are exchangeable only from listed agreement countries, with the applicant required to have lived in the issuing country for 185 days in the year the licence was obtained, and an expired non-EU/EFTA licence cannot be exchanged; the expat scheme for those in the Netherlands for work as highly skilled migrants permits exchange from any country; the RDW list of exchangeable countries outside the EU/EFTA names the Canadian provinces of Alberta and Québec, Great Britain, Gibraltar, Israel, Japan, Singapore, Chinese Taipei (Taiwan) and South Korea, among others; the application is filed at the municipality with a colour passport photo, the foreign licence — translated by a certified translator, the embassy or the consulate when it contains characters not used in the Netherlands, such as in Japanese or Greek — any old Dutch driving licence, a Health Declaration Form from the CBR for licences from outside the EU/EFTA, and, for those working in the Netherlands with a licence from outside the EU/EFTA, a valid Decision on the Evidence Rule from the Dutch tax authority; and holders who previously had a Dutch driving licence valid after June 30, 1985 can still exchange even from a country without an agreement. This pilot does not verify an individual licence or decide Ontario or BC exchange eligibility.',
    'You must also have lived in the country for 185 days in the year you obtained the licence.','high'),
  // Ireland and New Zealand issuing-country records (0.19.22): Ireland is
  // cited from the NDLS's official English exchange page (browser channel
  // after the site's Cloudflare challenge) and New Zealand from the NZ
  // Transport Agency's English car-licence conversion page (direct node
  // fetch). Neither record verifies an individual licence; both await
  // independent review.
  record('ireland-ndls-licence','driving','Ireland','Ireland: NDLS exchange of a foreign driving licence (official English page)','https://www.ndls.ie/licensed-driver/exchange-my-foreign-driving-licence.html',
    'Ireland’s National Driver Licence Service (NDLS) publishes the official English guidance for exchanging a foreign licence: you can exchange a licence from a recognised state online or in person at an NDLS centre (34 centres nationwide), and the application must include the most recent licence issued by the recognised state — a recognised-state licence may be exchanged up to a maximum of one year after it expires, but once expired it must be accompanied by a Letter of Entitlement issued by the relevant driving licence authority and dated within 6 months of the application, and a licence expired for more than one year cannot be exchanged; the exchange application must be accompanied by a completed eyesight report; a Letter of Entitlement is a copy of the driver record (name, address, date of birth, driver number, categories on licence, category start dates and date of expiry) and is also required when a category on the licence has no start date or an EU/EEA licence being exchanged is lost or stolen — the driver contacts the licensing authority that issued the foreign licence and must have received the Letter of Entitlement ahead of making the exchange application; the page lists special requirements by issuing place (for example its Canadian-province section maps Alberta’s Class 5 to B, W and Class 6 to AM, A1, with an automatic-transmission restriction unless a Letter of Entitlement proves a manual-transmission test); holders of licences from other countries may drive in Ireland for the duration of a temporary visit (up to 12 months), with an International Driving Permit depending on the issuing country, but on taking up normal residence they must apply for an Irish licence and cannot drive on a non-EU/EEA licence as a resident; where a foreign licence cannot be exchanged, the learning-to-drive path applies — driver theory test, learner permit, Essential Driver Training and a driving test — with a reduced EDT programme introduced on 21 January 2019 requiring a minimum of six rather than twelve lessons and exemption available from the usual six-month learner-permit waiting period, and an Irish learner permit once obtained takes precedence over the full foreign licence; and a driver disqualified in an EU country cannot apply for an Irish licence or learner permit while serving that disqualification. This pilot does not verify an individual licence or decide Ontario or BC exchange eligibility.',
    'You will need to have contacted and received the Letter of Entitlement ahead of making your exchange application to NDLS.','high'),
  record('newzealand-nzta-licence','driving','New Zealand','New Zealand: NZTA Waka Kotahi converting a car licence (official English page)','https://www.nzta.govt.nz/driver-licences/converting-to-nz-driver-licence/converting-a-car-licence',
    'The NZ Transport Agency Waka Kotahi publishes the official English guidance for converting an overseas licence to a New Zealand car (class 1) driver licence: a holder of a valid overseas car licence may convert it, and the overseas licence is valid for conversion if it is either current or expired within the last 12 months and is not suspended, disqualified or revoked in the country it was issued in; you cannot convert to a New Zealand licence using only an international driving permit — the physical overseas driver licence must be presented; there is a time limit for how long a driver may drive in New Zealand on an overseas licence, after which the licence must be converted to keep driving; and the conversion process depends on the issuing country — countries whose driving skills and licensing systems are considered similar to New Zealand’s are exempt countries, and the page’s list names Australia, Austria, Belgium, Canada, the United Kingdom (including England, Northern Ireland, Scotland and Wales), Ireland, the United States of America, Hong Kong (recognised as a Special Administrative Region of the People’s Republic of China), Japan, South Korea, Denmark, Finland, the Netherlands, Norway, Sweden, France, Italy, Portugal, Spain, Switzerland, South Africa, Croatia, Greece, Luxembourg and Germany, while licences from other countries go through the separate non-exempt conversion routes the page links. This pilot does not verify an individual licence or decide Ontario or BC exchange eligibility.',
    'You can\'t convert to a New Zealand licence using only an international driving permit. You must present your physical overseas driver licence.','high'),
  // Norway and Sweden issuing-country records (0.19.23): both are cited from
  // the countries' transport-agency English pages, fetched in full over
  // direct node fetch. Neither record verifies an individual licence; both
  // await independent review.
  record('norway-vegvesen-licence','driving','Norway','Norway: Statens vegvesen exchanging non-EU/EEA driving licences (official English page)','https://www.vegvesen.no/en/driving-licences/driving-licence-holders/foreign-driving-licence-in-norway/exchange-of-driving-licences-from-countries-outside-the-eueea',
    'Norway’s Statens vegvesen (the Norwegian Public Roads Administration) publishes the official English guidance for exchanging a driving licence issued in a country outside the EU/EEA: a Norwegian driving licence can be obtained if the holder’s licence comes from one of the countries designated on the page — Australia, Canada, Israel, Monaco, New Zealand, San Marino, South Korea and the USA, plus the UK, Switzerland, Japan and Greenland — and a driving licence from any other country outside the EU/EEA cannot be exchanged, with the page linking the standard path for obtaining a Norwegian driving licence instead. The page sits in the agency’s English section about foreign driving licences in Norway. This pilot does not verify an individual licence or decide Ontario or BC exchange eligibility.',
    'You can get a Norwegian driving licence if you hold a driving licence from one of the countries outside the EU/EEA that we are mentioning here.','high'),
  record('sweden-transportstyrelsen-licence','driving','Sweden','Sweden: Transportstyrelsen driving-licence exchange rules (official English page)','https://www.transportstyrelsen.se/en/road/driving-licences/i-have-a-driving-licence',
    'Sweden’s Transportstyrelsen (Swedish Transport Agency) publishes the official English driving-licence pages covering exchanges of foreign licences: an EEA-state licence can be exchanged for a Swedish one when it is valid and the holder is a permanent resident of Sweden, with the application (the Swedish form “Ansök om utbyte av utländskt körkort”, enclosing the foreign licence in original) sent to Transportstyrelsen in Örebro; exchange applications for higher categories (C1, C1E, C, CE, D1, D1E, D, DE) may require a medical certificate or a health declaration and a certificate of visual examination; once approved, the holder visits a Swedish Transport Administration driving test office for a photo and signature with an approved valid identification document, pays the 375 SEK production fee to the Swedish Transport Agency, and the new licence is sent as a registered letter while the foreign driving licence is returned to the authority from which it was issued; and for licences issued outside the EEA, only driving licenses from the United Kingdom, the Faroe Islands, Switzerland or Japan may under certain circumstances be exchanged for a Swedish one, which additionally requires that the holder meet the personal and medical requirements for a Swedish driving licence and be a permanent resident in Sweden. This pilot does not verify an individual licence or decide Ontario or BC exchange eligibility.',
    'Only driving licenses from the United Kingdom, the Faroe Islands, Switzerland or Japan may under certain circumstances be exchanged for a Swedish one.','high'),
  // Finland issuing-country record (0.19.24): the record below cites
  // Traficom's official English exchange page, fetched in full over direct
  // node fetch with six passages verified verbatim. It does not verify an
  // individual licence and awaits independent review.
  record('finland-traficom-licence','driving','Finland','Finland: Traficom exchanging a foreign driving licence (official English page)','https://traficom.fi/en/drivers-and-vehicles/driving-licenses/exchanging-foreign-driving-licence-finnish-driving-licence',
    'Finland’s Transport and Communications Agency (Traficom) publishes the official English guidance for exchanging a foreign driving licence for a Finnish one, with the rules depending on the licence’s origin: a licence from an EU or EEA Member State may be driven in Finland for its period of validity and must be exchanged at the latest when it is about to expire; a licence from a Contracting State may be driven for two years after the holder has moved permanently to Finland; and a licence issued in another country recognized by Finland allows driving as a tourist without a time limit, and for one year after the holder has been entered into the population register (registration also includes a temporary address); the precondition for exchanging the licence is permanent residence in Finland or studies there lasting at least six months, and when exchanging a driving licence Åland is treated as an EU country; a medical certificate is needed only if the licence being exchanged has expired, and it is valid for six months; the exchange application is filled in at an Ajovarma service point with a passport or other official ID and two passport photos, and the applicant receives a temporary driving licence from Ajovarma that can be used in Finland and other Nordic countries until the Finnish licence is sent to the home address within about two weeks of exchanging, with the licence valid for a maximum of 15 years before renewal; for the Contracting-State and other-country routes Traficom processes the application and issues a temporary licence for the duration of the exchange when the foreign licence would still be valid in Finland — that temporary licence is valid only in Finland, and the foreign driving licence is returned to the holder only when they move out of the country. This pilot does not verify an individual licence or decide Ontario or BC exchange eligibility.',
    'The precondition for exchanging the licence is that you live permanently in Finland or study in Finland and the studies have lasted for at least six months.','high'),
  // Malta and Estonia issuing-country records (0.19.25): Malta's record cites
  // Transport Malta's English exchange page, verified in the desktop browser
  // channel (the host is Cloudflare-gated over node); Estonia's record cites
  // Transpordiamet's English foreign-licence page, verified over direct node
  // fetch. Neither record verifies an individual licence; both await
  // independent review.
  record('malta-tm-licence','driving','Malta','Malta: Transport Malta exchanging your foreign driving licence (official English page)','https://www.transport.gov.mt/land/driving/driving-licence/exchange-your-foreign-driving-licence-4541',
    'Malta’s Transport Malta publishes the official English guidance "Exchange your foreign Driving Licence" for its Land Directorate, noting that cash payments are not accepted and that international driver permits are not equivalent to driving licences — the page’s conditions refer exclusively to driving licences. Any person holding a licence issued outside Malta and the European Union may drive in Malta for a period not exceeding twelve months from the date of their last entry into Malta. A holder who takes up normal residence in Malta is entitled to have the licence exchanged for an equivalent Maltese licence when it was issued in another member state of the European Union, in a European Economic Area state (namely Norway, Iceland and Liechtenstein), in Switzerland, in Australia, in the United Arab Emirates or in the United Kingdom, and driving licences issued within the European Union are recognised in Malta as long as they are valid in the member state of issuance, with national provisions on the restriction, suspension, withdrawal or cancellation of licences applying to those holders. The exchange can only take place if the applicant has lived in Malta for at least 185 days over the twelve months preceding the submission date of the application, and all matters concerning driving licences in Malta are regulated by the Motor Vehicles (Driving Licences) Regulations S.L. 65.18; the per-origin table lists the application forms (DRV 030 for EU/EEA member states and Switzerland, DRV 014 for Australia, DRV 008 for the United Arab Emirates — marked "Only for Malta/UAE citizens" — and DRV 009 for the United Kingdom) together with a passport photo, a copy of a Maltese residence permit, evidence of residence in Malta, the valid original licence, a legal translation when the licence is not in English, and driving-licence confirmation by the issuing authority for some origins, with a medical certificate required for expired licences where the applicant is over 70 or holds categories C and D. This pilot does not verify an individual licence or decide Ontario or BC exchange eligibility.',
    'The exchange of a driving licence issued by a competent authority in any of the above-mentioned countries to a Maltese driving licence can only take place if the applicant has lived in Malta for at least 185 days over the twelve (12) months preceding the submission date of the following applications and supporting documents','high'),
  record('estonia-transpordiamet-licence','driving','Estonia','Estonia: Transpordiamet driving licence issued outside Estonia (official English page)','https://www.transpordiamet.ee/en/foreign-driving-licence',
    'Estonia’s Transport Administration (Transpordiamet) publishes the official English page "Driving licence issued outside Estonia" describing which foreign driving licences are valid in Estonia and how to exchange them: a licence is valid in Estonia if its entries are in Latin characters or handwritten or transliterated into Latin script and it includes the symbol and description of the vehicle category with the pictogram or the vehicle’s maximum mass or permitted passenger count; if the country is not named in the page’s country lists the licence is not valid in Estonia and cannot be exchanged, and the applicant must complete driving-school courses and apply for a right to drive and a provisional driving licence; and the administration may refuse to recognise or exchange a licence whose authenticity cannot be reliably verified or which lacks sufficient security features. For EU, EEA and Swiss Confederation licences the licence is valid until its expiration date, and a licence valid for longer than 15 years must be exchanged for an Estonian driving licence by 18 January 2033 upon moving to Estonia; licences from the contracting parties to the 1968 Vienna and 1949 Geneva road-traffic conventions — the Vienna list names Pakistan, the Philippines, Ukraine, the United Arab Emirates, the United Kingdom, Nigeria, Russia, Thailand, Turkey and Vietnam among many others, and the Geneva list names Canada, India, Japan, Ghana, Hong Kong, Singapore and New Zealand among many others — are valid in Estonia for 12 months from the beginning of the owner’s residency, with an official Estonian translation required when the entries are not in Latin characters and validity only in conjunction with an international driving permit or an officially certified translation when the licence lacks the category symbol or description; permanent residence in both rules is proved from the population register. Applications to exchange are made by permanent residents of Estonia who live in the country at least 185 days per calendar year, whose right to drive has not been suspended, withdrawn or revoked in the country of issue or in Estonia, and licences are typically exchanged without exams — exams are necessary when the licence expired more than five years previously, when it is not valid in Estonia because it was issued while the person was not a permanent resident of the country of issue, or when verified information shows the person did not reside permanently there. This pilot does not verify an individual licence or decide Ontario or BC exchange eligibility.',
    'Applications to exchange a foreign driving licence for an Estonian one can be made by permanent residents of Estonia who live in the country for at least 185 days per calendar year.','high'),
  record('ttc-trip-planner','transit','Toronto','TTC: Trip planner','https://www.ttc.ca/trip-planner',
    'Use the TTC trip planner to plan public transit journeys in Toronto. Check the linked live service alerts before travelling. This pilot does not provide live departures or a calculated itinerary; published fares are summarized from the official fare page.',
    'Trip planner'),
  record('miway-trip-planner','transit','Mississauga','MiWay: Schedules and trip planning','https://www.mississauga.ca/miway-transit/',
    'Use the official MiWay website for Mississauga bus schedules and trip options by address, stop or location. This pilot does not provide live departures or a calculated itinerary; published fares are summarized from the official fare page.',
    'Schedules and trip options by address, stop, or location.'),
  record('brampton-trip-planner','transit','Brampton','Brampton Transit: Plan your trip','https://www.brampton.ca/EN/residents/transit/plan-your-trip',
    'Brampton Transit links to trip-planning tools, schedules and maps on its official trip-planning page. Use those tools for your journey; this pilot does not provide live departures or a calculated itinerary; published fares are summarized from the official fare page.',
    'Trip Planning Tools'),
  record('translink-trip-planner','transit','Vancouver','TransLink: Trip planner','https://www.translink.ca/tripplanner',
    'Use the TransLink trip planner for public transit journeys in Metro Vancouver and consult current transit alerts. This pilot does not provide live departures or a calculated itinerary; published fares are summarized from the official fare page.',
    'TransLink Trip Planner'),
  // Published transit fares, distilled from each agency's official fare page
  // (fetched in full on 2026-10-28). Fares change; expiry forces a recheck.
  record('ttc-fares','transit','Toronto','TTC: Fares and passes','https://www.ttc.ca/Fares-and-passes',
    'The TTC fare page gives current pay-as-you-go fares: $3.30 with PRESTO, Interac debit or credit card and $3.35 cash for adults, $2.35 PRESTO youth 13-19, $2.25 PRESTO seniors 65+, and free travel for children 12 and under. Monthly fare capping stops charging after 47 paid fares in a calendar month, and most monthly passes were discontinued on August 31, 2026.',
    'The TTC Adult fare of $3.30 is charged.'),
  record('miway-fares','transit','Mississauga','MiWay: Fare prices','https://www.mississauga.ca/miway-transit/fares/fare-prices',
    'MiWay charges adults $3.50 per ride with PRESTO and $4.50 cash as of January 1, 2026, with a $145 PRESTO monthly pass. Seniors 65 and older ride free with a PRESTO card set to the senior fare type, and MiWay travel is free when connecting from GO Transit with PRESTO. This pilot does not track promotions or fare-card balance rules.',
    'PRESTO cards that do not have a set fare type will be charged the $3.50 adult single fare per ride.'),
  record('brampton-fares','transit','Brampton','Brampton Transit: Bus Fares','https://www.brampton.ca/EN/residents/transit/Fares/Pages/TransitFares.aspx',
    'Brampton Transit charges $4.75 cash or by contactless debit/credit card, effective February 9, 2026, with a two-hour transfer included. The city fare-change notice sets the PRESTO e-purse adult fare at $3.55 per ride from the same date. Riders using a CNIB card ride free, and transfers to GO Transit are free within the transfer window.',
    'Cash Fare: $4.75'),
  record('translink-fares','transit','Vancouver','TransLink: Pricing and fare zones','https://www.translink.ca/transit-fares/pricing-and-fare-zones',
    'TransLink charges adults $2.85 for a 1-Zone trip with Compass Card stored value ($3.50 cash or contactless), with higher fares across zone boundaries. All bus and HandyDART trips are a 1-Zone fare at all times, and a single fare covers 90 minutes of transfers. Children 12 and under ride free; a 1-Zone monthly pass is $117.20 and a DayPass is $12.55.',
    'All bus and HandyDART trips are a 1-Zone fare at all times.'),
  // Grocery price benchmark, distilled from the City of Toronto's official
  // poverty-reduction food-security page (fetched in full on 2026-10-28).
  record('toronto-onfb','groceries','Toronto','City of Toronto: Food insecurity and the ONFB','https://www.toronto.ca/city-government/accountability-operations-customer-service/long-term-vision-plans-and-strategies/poverty-reduction-strategy/food-security-in-toronto-poverty-reduction-strategy',
    'Toronto Public Health tracks food affordability every year with the Ontario Nutritious Food Basket (ONFB), a tool adapted from Health Canada\u2019s National Nutritious Food Basket. In 2026, the monthly ONFB cost for a family with two adults and two children, ages 8 and 14, was $1,242. The basket prices a basic healthy diet and excludes items such as diapers, personal care and hygiene, so it is an official benchmark, not a typical grocery bill.',
    'In 2026, the monthly cost of the ONFB for a family with two adults and two children, ages 8 and 14, was $1,242.'),
  // BC grocery benchmark from BCCDC's official news story about the Food
  // Costing in BC 2022 report (fetched in full on 2026-10-28). The 2022
  // survey vintage is disclosed up front; expiry forces a recheck.
  record('bc-food-costing','groceries','BC','BCCDC: Food Costing in BC','https://www.bccdc.ca/about/news-stories/stories/2023/new-data-highlights-cost-healthy-eating',
    'The BC Centre for Disease Control\u2019s most recent provincial food costing report surveyed healthy eating costs in May and June 2022: the average monthly cost of a nutritious diet for a family of four in B.C. was $1,263 per month. The survey prices 61 food items at grocery stores across the province as a healthy-eating benchmark, not a typical grocery bill; costing is typically conducted every two years, and this was the first report since 2017.',
    'the average monthly cost of a nutritious diet for a family of four in B.C. in May and June 2022 was $1,263 per month'),
  record('vancouver-library','community','Vancouver','Vancouver Public Library: English learning resources','https://www.vpl.ca/guides/esl-french-and-literacy-resources',
    'Vancouver Public Library lists English-learning and literacy resources, including physical and digital materials. Consult the library guide for access details and links to newcomer resources.',
    'ESL, French and Literacy Resources'),
  record('tdsb-registration','family','Toronto','TDSB: School registration','https://www.tdsb.on.ca/Registration/Pre-Registration-Questions-and-Answers',
    'The Toronto District School Board publishes registration information and required-document guidance. Consult the board and intended school about your application. This record does not determine admission, catchment placement or eligibility and does not cover every Toronto school board.',
    'Required Documentation','high'),
  record('vsb-registration','family','Vancouver','Vancouver School Board: Grades 1-12 registration','https://vsb.bc.ca/grades-1-12-school-registration',
    'The Vancouver School Board publishes application and document-verification information for Grades 1-12. Confirm the applicable route with the board. This pilot does not determine admission, eligibility or school placement; an application alone does not guarantee enrolment.',
    'Grades 1-12 School Registration','high'),
  // Peel school-board records (0.19.9), distilled from the boards' official
  // pages fetched in full on 2026-10-29. High-risk topic: they ship pending
  // human review. The Peel boards serve both Peel pilot cities, so each board
  // is registered once per city scope; per-city entries remain identical
  // summaries because each board publishes one shared registration page.
  record('pdsb-registration-mississauga','family','Mississauga','Peel District School Board: Register for school','https://www.peelschools.org/registration',
    'The Peel District School Board is the public school board serving Peel communities including Mississauga. Its registration page states the current school year runs September 2026 to June 2027, points families to a school locator that determines which school a child should attend based on the home address, and says families with children born in 2022 can register for kindergarten for the 2026-27 school year. Grade 1 to 12 registration runs through a PowerSchool Enrollment parent account on the board\u2019s online portal. This record does not determine admission, catchment placement or eligibility; the Peel board is not the only school board serving the city, and applications alone do not guarantee enrolment.',
    'Use the school locator to determine which school your child should be attending based on your home address.','high'),
  record('pdsb-registration-brampton','family','Brampton','Peel District School Board: Register for school','https://www.peelschools.org/registration',
    'The Peel District School Board is the public school board serving Peel communities including Brampton. Its registration page states the current school year runs September 2026 to June 2027, points families to a school locator that determines which school a child should attend based on the home address, and says families with children born in 2022 can register for kindergarten for the 2026-27 school year. Grade 1 to 12 registration runs through a PowerSchool Enrollment parent account on the board\u2019s online portal. This record does not determine admission, catchment placement or eligibility; the Peel board is not the only school board serving the city, and applications alone do not guarantee enrolment.',
    'Use the school locator to determine which school your child should be attending based on your home address.','high'),
  record('dpcdsb-registration-mississauga','family','Mississauga','Dufferin-Peel Catholic District School Board: Admissions','https://www.dpcdsb.org/admissions',
    'The Dufferin-Peel Catholic District School Board is the publicly funded Catholic school board serving Peel communities including Mississauga. Its admissions hub states it operates 152 Catholic schools (126 elementary and 26 secondary) in Mississauga, Brampton, Caledon and Orangeville, and its own guidance says elementary (Kindergarten-Grade 8) admissions are open to Catholic children and children of Catholic parents, while secondary (Grades 9-12) admissions are under the provincially legislated Open Access and all students are admitted. The hub also states admission for all non-Canadians, including refugee claimants, temporary residents and families on study or work permits, must be completed on an individual basis with its Admissions Department. This record does not determine admission, eligibility or school placement; an application alone does not guarantee enrolment.',
    'We currently operate 152 Catholic schools (126 elementary and 26 secondary), in Mississauga, Brampton, Caledon and Orangeville.','high'),
  record('dpcdsb-registration-brampton','family','Brampton','Dufferin-Peel Catholic District School Board: Admissions','https://www.dpcdsb.org/admissions',
    'The Dufferin-Peel Catholic District School Board is the publicly funded Catholic school board serving Peel communities including Brampton. Its admissions hub states it operates 152 Catholic schools (126 elementary and 26 secondary) in Mississauga, Brampton, Caledon and Orangeville, and its own guidance says elementary (Kindergarten-Grade 8) admissions are open to Catholic children and children of Catholic parents, while secondary (Grades 9-12) admissions are under the provincially legislated Open Access and all students are admitted. The hub also states admission for all non-Canadians, including refugee claimants, temporary residents and families on study or work permits, must be completed on an individual basis with its Admissions Department. This record does not determine admission, eligibility or school placement; an application alone does not guarantee enrolment.',
    'We currently operate 152 Catholic schools (126 elementary and 26 secondary), in Mississauga, Brampton, Caledon and Orangeville.','high'),
  {...record('ontario-childcare','childcare','ON','Ontario: Find and pay for child care','https://www.ontario.ca/page/find-and-pay-child-care',
    'Ontario provides resources for finding and choosing child care, checking provider records and investigating financial support. Consult the provider and local subsidy administrator for current details. This pilot does not confirm vacancies, fees or subsidy eligibility.',
    'Find and pay for child care','high'),
    reviewBasis:'Official search-index text inspected on 2026-10-28; no archived page snapshot or independent human review.'},
  {...record('bc-childcare','childcare','BC','British Columbia: Child care information for families','https://www2.gov.bc.ca/gov/content/family-social-supports/caring-for-young-children/family-information',
    'British Columbia provides a family information hub linking to child care programs and a child care map. Check current details with the provider and program administrator. This pilot does not confirm vacancies, fees or financial-support eligibility.',
    'Child care information for families','high'),
    reviewBasis:'Official search-index excerpt inspected on 2026-10-28; direct retrieval returned 502. No archived snapshot or independent human review.'},
  // Child-care fee records (0.19.7), distilled from official government pages
  // fetched in full on 2026-10-28. High-risk topic: they ship pending review.
  record('toronto-childcare-fees','childcare','Toronto','City of Toronto: TELCCS cost of care','https://www.toronto.ca/community-people/children-parenting/children-programs-activities/licensed-child-care/toronto-early-learning-and-child-care-services/early-learning-child-care-centres',
    'Toronto\u2019s directly operated child care centres (TELCCS) publish their daily fees, capped at $22 per day under the CWELCC system: full-time care for infants, toddlers and preschoolers is $22.00 per day, effective January 1, 2025. Its home child care agency charges $22.00 per day for children under 2 (full time), $21.74 for ages 2 until school entry, and $12.69 per school-year kindergarten day. Fees are subject to change; other licensed centres set their own fees.',
    'Fees have been capped at $22 per day due to the Canada-Wide Early Learning & Child Care System (CWELCC)', 'high'),
  record('ontario-cwelcc-fees','childcare','ON','Ontario: CWELCC fee cap and averages','https://www.ontario.ca/page/canada-ontario-early-years-and-child-care-agreement',
    'Ontario\u2019s Canada-Ontario early learning and child care agreement (CWELCC) caps fees for children aged 0-5 in enrolled licensed child care programs at $22 per day, with a provincial average of $19 per day as of January 1, 2025. 93% of licensed child care spaces for children aged 0-5 were in CWELCC-enrolled programs as of June 2026. Parents do not apply for the reduction; a provider not enrolled in CWELCC does not reduce fees.',
    'we capped the reduced fees at $22 per day, bringing the provincial average to $19 per day', 'high'),
  record('bc-childcare-fees','childcare','BC','British Columbia: Child Care Fee Reduction Initiative','https://news.gov.bc.ca/releases/2025ECC0051-001248',
    'British Columbia\u2019s official news release on the Child Care Fee Reduction Initiative states that it lowers monthly fees at participating licensed child care centres; 97% of eligible licensed centres participate in the program, which has saved families more than $3 billion in fees since it started. From April 1, 2026, participating providers must include at least 9.5 hours of care per day in the base fee before charging separately for extended hours. The province\u2019s family information pages list participating providers and a fee reduction estimator; the pilot does not list each centre\u2019s fees or calculate reductions.',
    '97% of eligible licensed centres participate in the program', 'high'),
  {...record('ontario-rent-deposits','housing','ON','LTB: Rent deposits','https://tribunalsontario.ca/documents/ltb/Brochures/A%20Guide%20to%20the%20Residential%20Tenancies%20Act.html',
    'The Landlord and Tenant Board guide explains rent deposits and their permitted use under Ontario tenancy legislation. Confirm whether the legislation applies to your tenancy before relying on its rules. This pilot does not decide whether a particular deposit demand is lawful.',
    'Rent deposits','high'),housingSubject:'deposit',reviewBasis:'Official search-index text inspected on 2026-10-28. No archived snapshot or independent human review.'},
  {...record('bc-tenancy-deposits','housing','BC','BC: Tenancy deposits and fees','https://www2.gov.bc.ca/gov/content?id=BC74652E526B4BFCAEC4329D8325D1B5',
    'British Columbia publishes guidance on security and pet damage deposits, inspections, returns and tenancy fees. Check the relevant provisions and tenancy coverage with the Residential Tenancy Branch. This pilot does not calculate deposits or decide a dispute.',
    'Tenancy deposits and fees','high'),housingSubject:'deposit',reviewBasis:'Official search-index text inspected on 2026-10-28; direct retrieval returned 502. No archived snapshot or independent human review.'},
  {...record('bc-tenancy-agreements','housing','BC','BC: Tenancy agreements','https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/starting-a-tenancy/tenancy-agreements',
    'British Columbia provides guidance on tenancy agreements and their terms. Review the official guidance for a proposed rental agreement and confirm its legal scope. This pilot does not review a lease or determine whether its clauses are enforceable.',
    'Tenancy agreements','high'),housingSubject:'agreement',reviewBasis:'Official search-index text inspected on 2026-10-28; direct retrieval returned 502. No archived snapshot or independent human review.'},
  {...record('bc-rental-repairs','housing','BC','BC: Repairs and maintenance','https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/during-a-tenancy/repairs-maintenance',
    'British Columbia publishes rental repair and maintenance guidance, including routes for resolving disagreements. Consult the current guidance and applicable tenancy rules. This pilot does not determine responsibility, authorize withholding rent or provide an emergency repair assessment.',
    'Repairs and maintenance','high'),housingSubject:'repairs',reviewBasis:'Official search-index excerpt inspected on 2026-10-28; direct retrieval returned 502. No archived snapshot or independent human review.'},
  // Rent-price records (0.19.7) from CMHC's official 2025 Rental Market Report
  // page (fetched in full on 2026-10-28). High-risk topic: pending review.
  record('cmhc-rent-toronto','housing','ON','CMHC: Toronto CMA rental market averages','https://www.cmhc-schl.gc.ca/professionals/housing-markets-data-and-research/market-reports/rental-market-reports-major-centres',
    'CMHC\u2019s 2025 Rental Market Report (October 2025 survey) puts the average rent paid by all tenants at $2,034 per month for a 2-bedroom purpose-built apartment in the Greater Toronto Area (up 3.5%), with a 3.0% vacancy rate; the average 2-bedroom condominium rent was $2,904. Averages span the whole stock including long-tenured units, so individual advertised rents differ. The GTA includes Toronto, Mississauga and Brampton.',
    'the average earner in the GTA still needed to spend a significant share of after-tax income', 'high', {housingSubject:'rent'}),
  record('cmhc-rent-vancouver','housing','BC','CMHC: Vancouver CMA rental market averages','https://www.cmhc-schl.gc.ca/professionals/housing-markets-data-and-research/market-reports/rental-market-reports-major-centres',
    'CMHC\u2019s 2025 Rental Market Report (October 2025 survey) puts the average rent paid by all tenants at $2,363 per month for a 2-bedroom purpose-built apartment in the Vancouver census metropolitan area (up 2.2%), with a 3.7% vacancy rate, the highest in over 30 years; the average 2-bedroom condominium rent was $2,900. Averages span the whole stock, so individual advertised rents differ. The report also notes BC\u2019s maximum allowable rent increase was 3% in 2025.',
    'maximum allowable rent increase of 3% in 2025', 'high', {housingSubject:'rent'}),
  {...record('crtc-mobile-options','telecom','CA','CRTC: Choosing a cell phone service plan','https://web.crtc.gc.ca/eng/phone/mobile/options.htm',
    'The CRTC offers resources for choosing a cell phone service plan. Use the official guide as a starting point and check current offers directly with providers. This pilot has no live prices, coverage measurements or personalized provider ranking.',
    'Pick the best cell phone service plan for you','high'),telecomSubject:'mobile',reviewBasis:'Official search-index excerpt inspected on 2026-10-28; direct retrieval timed out. No archived snapshot or independent human review.'},
  {...record('crtc-internet-code','telecom','CA','CRTC: Internet Code','https://crtc.gc.ca/eng/internet/code.htm',
    'The CRTC Internet Code page explains consumer protections and identifies providers required to comply. Check its current scope and the terms relevant to your service. This pilot does not decide your contractual rights, cancellation fees or entitlement to compensation.',
    'The Internet Code: Protecting your rights','high'),telecomSubject:'internet'},
  {...record('ccts-complaints','telecom','CA','CCTS: Telecom complaint assistance','https://www.ccts-cprst.ca/for-consumers/how-we-can-help/',
    'The CCTS describes complaint assistance for telecom and television consumers unable to resolve a dispute with their provider. Review its service-specific scope before submitting a complaint. This pilot does not determine complaint acceptance or promise a remedy.',
    'How we can help','high'),telecomSubject:'complaint'},
  // Country portal entry points (0.19.26; Denmark added 0.19.27): one broad
  // national, government or state information entry point for every country
  // that does not already have a dedicated licensing record. These are
  // deliberately generic: they identify a research starting point, not a
  // verified licence page. High-risk topic: pending review.
  ...countryPortals.map(portal=>record(
    portal.id,'driving',portal.country,
    `${portal.country}: national entry point for driving-licence research`,
    portal.url,
    `This is a broad national, government or state information entry point for ${portal.country}, identified through web research as a starting point for driving-licence research. It is not a verified licence-specific page: the pilot has not confirmed that it links to licensing guidance, and its language, availability and content may change. This record does not determine Ontario or British Columbia licence-exchange eligibility.`,
    portal.quote,'high',
    {checkedAt:'2026-10-30',expiresAt:'2026-11-06',
      reviewBasis:'National, government or state information portal identified through web research; official status, licence-specific content, page language and availability were not independently verified. No independent human review.'}
  ))
];
