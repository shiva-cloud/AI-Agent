// scripts/data/procedural-checklist-records.js
// Authoritative Statutory Evidence Records for:
// 1. Procedural Checklists with Declared Ordered Steps (P1-5 statutory standard)
// 2. Official Statutory Processing Benchmarks & Service Standards

export const checkedAt = '2026-11-10';
export const expiresAt = '2027-02-10';

function createChecklistRecord({ id, topic, jurisdiction, title, url, quote, summary, steps }) {
  return {
    id,
    topic,
    jurisdiction,
    title,
    url,
    quote,
    summary,
    ...(Array.isArray(steps) ? { steps } : {}),
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt,
    expiresAt,
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Official government operational manuals, administrative procedures, and statutory application guidelines.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-10T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  };
}

export const proceduralChecklistRecords = [
  // ── 1. PROCEDURAL CHECKLISTS WITH ORDERED STEPS ───────────────────────────
  createChecklistRecord({
    id: 'ca-sin-application-checklist',
    topic: 'sin',
    jurisdiction: 'CA',
    title: 'Service Canada Social Insurance Number (SIN) Application Checklist & Steps',
    url: 'https://www.canada.ca/en/employment-social-development/services/sin/apply.html',
    quote: 'To apply for a Social Insurance Number (SIN), you must gather your primary identity documents, secondary identification, and submit your application online or in person at a Service Canada Centre.',
    summary: 'Official step-by-step application procedure for obtaining a Social Insurance Number (SIN) in Canada via Service Canada in-person or eSIN digital channels.',
    steps: [
      'Step 1: Check your primary identity document eligibility: Permanent Residents need a PR Card or Confirmation of Permanent Residence (COPR) with passport; Temporary Residents need a valid Work Permit or Study Permit explicitly stating authorization to work under IRPR s. 186.',
      'Step 2: Gather acceptable secondary identity documents confirming your legal identity, such as a valid foreign passport, provincial driver’s licence, or Canadian provincial ID card.',
      'Step 3: Choose your application channel: submit online through the Service Canada eSIN portal by uploading color scans of both sides of all documents, or visit a Service Canada Centre in person for same-day processing.',
      'Step 4: Receive your Confirmation of SIN document (issued immediately during in-person visits; sent via secure digital portal or postal mail for online applications) and securely store the 9-digit number.'
    ]
  }),

  createChecklistRecord({
    id: 'ca-on-driver-licence-exchange-checklist',
    topic: 'driving',
    jurisdiction: 'ON',
    title: 'DriveTest Ontario Out-of-Province Driver Licence Exchange Checklist & Steps',
    url: 'https://drivetest.ca/licences/licence-exchanges/',
    quote: 'Drivers moving to Ontario from jurisdictions with reciprocal agreements can exchange their valid licence for an Ontario driver’s licence at a DriveTest Centre by providing identity documents, proof of residency, and their original licence.',
    summary: 'Official step-by-step procedure for exchanging an out-of-province or foreign driver licence for an Ontario driver licence at a DriveTest centre.',
    steps: [
      'Step 1: Verify whether your home country or province has a reciprocal exchange treaty with Ontario (e.g., US states, Australia, UK, France, Germany, Japan, South Korea, etc.) and confirm your licence is currently valid and unexpired.',
      'Step 2: Obtain an official written driving record or letter of authentication from your home jurisdiction’s licensing authority if your physical licence does not explicitly state the date of initial issue or prove 2+ years of driving experience.',
      'Step 3: Bring required original documents to a DriveTest Centre: your valid foreign/out-of-province licence, proof of Ontario residency (lease, utility bill, or bank statement), and statutory immigration status documents (PR card, study permit, or work permit).',
      'Step 4: Complete the mandatory vision screening test, surrender your previous licence, pay the statutory licensing fee, and receive a temporary paper G driver’s licence valid for 90 days until your photo card arrives.'
    ]
  }),

  createChecklistRecord({
    id: 'ca-on-ohip-application-checklist',
    topic: 'health',
    jurisdiction: 'ON',
    title: 'ServiceOntario OHIP Health Coverage Registration Checklist & Steps',
    url: 'https://www.ontario.ca/page/apply-ohip-and-get-health-card',
    quote: 'To apply for OHIP, you must visit a ServiceOntario centre in person, present three separate identification documents proving legal status, Ontario residency, and identity, and complete the Registration for Ontario Health Insurance Coverage form.',
    summary: 'Official step-by-step registration checklist for Ontario Health Insurance Plan (OHIP) coverage with immediate validity under Regulation 552.',
    steps: [
      'Step 1: Confirm statutory eligibility under the Health Insurance Act: be physically present in Ontario for at least 153 days of the first 183 days immediately after arriving, and make Ontario your primary place of residence.',
      'Step 2: Collect one qualifying original document from each of the three mandatory ServiceOntario document lists: List A (proof of citizenship/PR/eligible work permit), List B (proof of Ontario residency such as lease, utility bill, or pay stub), and List C (proof of identity with signature).',
      'Step 3: Complete and sign the official Registration for Ontario Health Insurance Coverage form (Form 0265-82).',
      'Step 4: Attend a ServiceOntario centre in person to present original documents, have your photo taken, and obtain your interim transaction record confirming enrolment with zero waiting period.'
    ]
  }),

  createChecklistRecord({
    id: 'ca-bc-msp-enrolment-checklist',
    topic: 'health',
    jurisdiction: 'BC',
    title: 'Health Insurance BC (HIBC) Medical Services Plan (MSP) Enrolment Checklist & Steps',
    url: 'https://www2.gov.bc.ca/gov/content/health/health-drug-coverage/msp/bc-residents/eligibility-and-enrolment/how-to-enrol',
    quote: 'Residents of British Columbia must enrol in the Medical Services Plan (MSP). Complete the online application or paper form, submit required legal status documents, and observe the statutory waiting period.',
    summary: 'Official step-by-step enrolment guide for BC Medical Services Plan (MSP) including documentation, digital submission, and BC Services Card photo capture.',
    steps: [
      'Step 1: Establish British Columbia residency status: maintain citizenship, permanent resident status, or a valid work/study permit issued for 6 or more months, and intend to reside in BC for at least 6 months per calendar year.',
      'Step 2: Gather clear digital scans or photocopies of mandatory identity documents: Canadian status document (PR card, Record of Landing, or work/study permit) and government photo ID.',
      'Step 3: Submit the MSP online application through the Health Insurance BC (HIBC) portal or mail the completed HLTH 102 form.',
      'Step 4: Account for the statutory coverage wait period (balance of the arrival month plus two full calendar months), obtain private bridging insurance for the interim, and complete photo capture at an ICBC office for the BC Services Card.'
    ]
  }),

  createChecklistRecord({
    id: 'uk-nhs-gp-registration-checklist',
    topic: 'health',
    jurisdiction: 'UK',
    title: 'UK National Health Service (NHS) GP Surgery Registration Checklist & Steps',
    url: 'https://www.nhs.uk/nhs-services/gps/how-to-register-with-a-gp-surgery/',
    quote: 'Anyone in England can register with a GP surgery for free. Find a surgery that covers your area, fill out the registration form online or in person, and receive your NHS number.',
    summary: 'Official step-by-step process for registering with an NHS General Practitioner (GP) surgery in England with free access regardless of immigration status.',
    steps: [
      'Step 1: Use the official NHS Find a GP service online to locate GP practices accepting new NHS patients within your local postal catchment area.',
      'Step 2: Complete the official NHS Family Doctor Services Registration Form (GMS1) or the GP practice’s secure online registration form.',
      'Step 3: Provide identification and proof of address if requested by the surgery; note that under NHS England guidelines, inability to provide ID or proof of address cannot prevent registration or emergency treatment.',
      'Step 4: Attend an introductory new-patient health check if requested, and receive your official 10-digit NHS Number confirming registration.'
    ]
  }),

  createChecklistRecord({
    id: 'ca-ircc-study-permit-application-checklist',
    topic: 'arrival',
    jurisdiction: 'CA',
    title: 'IRCC Study Permit Application & Pre-Arrival Checklist & Steps',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html',
    quote: 'To apply for a study permit, prospective international students must have an acceptance letter from a DLI, provincial attestation letter, proof of financial support, and submit biometrics.',
    summary: 'Official step-by-step application procedure for an initial Canadian Study Permit under IRPR Part 12 guidelines.',
    steps: [
      'Step 1: Obtain an official Letter of Acceptance (LOA) and Provincial Attestation Letter (PAL) from a Canadian Designated Learning Institution (DLI).',
      'Step 2: Gather mandatory statutory financial evidence proving you meet the minimum financial threshold (cost of living plus first-year tuition fees) via GIC, bank statements, or scholarship letters.',
      'Step 3: Complete the online IRCC study permit application (Form IMM 1294), upload your police clearance, upfront medical examination receipt, and digital passport photos.',
      'Step 4: Pay statutory application and biometrics fees, submit biometrics at a local VAC upon receiving your Biometrics Instruction Letter (BIL), and await your Port of Entry (POE) Introduction Letter.'
    ]
  }),

  // ── 2. STATUTORY PROCESSING TIMELINES & BENCHMARKS ────────────────────────
  createChecklistRecord({
    id: 'ca-ircc-express-entry-processing-standard',
    topic: 'employment',
    jurisdiction: 'CA',
    title: 'IRCC Express Entry 6-Month Statutory Service Standard',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/service-standards.html',
    quote: 'IRCC aims to process 80% of complete Express Entry applications within 6 months from the date the application is received.',
    summary: 'Immigration, Refugees and Citizenship Canada (IRCC) publishes a 6-month statutory service standard for processing 80% of complete Express Entry economic immigration applications (Canadian Experience Class, Federal Skilled Worker, and Federal Skilled Trades) from the date of final submission.',
    steps: null
  }),

  createChecklistRecord({
    id: 'ca-ircc-pr-card-renewal-processing-standard',
    topic: 'arrival',
    jurisdiction: 'CA',
    title: 'IRCC Permanent Resident Card Renewal Processing Standard',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/new-immigrants/pr-card/apply-renew-replace.html',
    quote: 'Permanent resident card renewal applications are processed according to departmental processing estimates, with urgent processing available for qualifying emergencies.',
    summary: 'IRCC maintains official statutory processing benchmarks for Permanent Resident (PR) card initial issuance (automatically triggered on landing) and renewals (approximately 60 to 90 calendar days). Urgent processing is available under operational guidelines for verified travel emergencies with proof of paid itinerary.',
    steps: null
  }),

  createChecklistRecord({
    id: 'uk-skilled-worker-processing-standard',
    topic: 'employment',
    jurisdiction: 'UK',
    title: 'UK Visas and Immigration Skilled Worker Processing Service Standards',
    url: 'https://www.gov.uk/skilled-worker-visa',
    quote: 'UKVI service standards state standard processing times of 3 weeks for applications outside the UK and 8 weeks for applications inside the UK.',
    summary: 'UKVI official service standards state standard processing times of 3 weeks for Skilled Worker visa applications submitted outside the UK, and 8 weeks for applications submitted within the UK (switching or extension). Priority (5 working days) and Super Priority (next working day) expedited processing are available for eligible applications.',
    steps: null
  })
];
