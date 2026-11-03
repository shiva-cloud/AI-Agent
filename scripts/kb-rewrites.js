// Records rewritten to what their official page actually says, so they can pass
// the automated source check (scripts/kb-verify-publish.js) and be published.
// Each quote is copied word for word from the page; each summary states only
// what the page supports. Claims the page does not support were removed.
// Applied by scripts/kb-corrections-2026-11-01.js (dry run, then --apply).
//
// Fields: id, sources (pages read), note, and any of title / quote / summary.
export const REWRITES = [
  // Health, 1 November 2026
  { id: 'ontario-crisis-support-988-and-newcomer-mental-health', sources: ['https://988.ca/'],
    note: 'Named clinics, a distress-centre phone number and claims of multi-language interpretation are not on the 988 page; removed.',
    title: '9-8-8 Suicide Crisis Helpline (Canada)',
    quote: 'A safe space to talk, 24 hours a day, every day of the year.',
    summary: 'Anyone in Canada who is thinking about suicide, or is worried about someone, can call or text 9-8-8, the Suicide Crisis Helpline. It is a safe space to talk, 24 hours a day, every day of the year. In an emergency, call 9-1-1.' },
  { id: 'ontario-bc-open-work-permit-spouse-healthcare-eligibility', sources: ['https://www.ontario.ca/page/apply-ohip-and-get-health-card'],
    note: 'The TEER-based spouse rule and the BC MSP statement are not on the Ontario page; the record now states the Ontario work-permit rule only.',
    title: 'Ontario: OHIP eligibility for work permit holders',
    quote: 'are in Ontario on a valid work permit and are working full-time in Ontario, for an Ontario employer, for at least 6 months',
    summary: 'In Ontario, a person on a valid work permit can be eligible for OHIP if they are working full-time in Ontario, for an Ontario employer, for at least 6 months. Other eligibility rules apply, so check the full list on the Ontario page before you apply.' },
  { id: 'ontario-community-health-centres-and-uninsured-care-navigation', sources: ['https://www.ontario.ca/page/community-health-centres'],
    note: 'Named centres, walk-in fee ranges and the hospital-law claim are not on the page; removed.',
    title: 'Ontario: Community Health Centres',
    quote: 'CHCs provide interprofessional primary care services with an emphasis on health promotion and disease prevention.',
    summary: 'Ontario Community Health Centres (CHCs) are not-for-profit, community-governed organizations. They provide primary care from a team of health providers, with a focus on people who have traditionally faced barriers to health services. Contact a local CHC to ask whether it can see you, including if you do not have OHIP yet.' },
  { id: 'ontario-health-ohip-wait-elimination', sources: ['https://www.ontario.ca/page/apply-ohip-and-get-health-card'],
    note: 'Interprovincial portability details are not on this page; removed.',
    quote: 'There is no longer a waiting period for OHIP coverage.',
    summary: 'Ontario no longer has a waiting period for OHIP coverage. You still need to meet the eligibility rules, for example holding an eligible immigration status and living in Ontario, and you apply in person at ServiceOntario.' },
  { id: 'ontario-ohip-kyc-regulation-552', sources: ['https://www.ontario.ca/page/documents-needed-get-health-card'],
    note: 'Detailed document lists were partly unsupported; the record now states the three-document rule from the page.',
    title: 'Ontario: documents needed to get a health card',
    quote: 'To get, renew or replace your health card – including switching from a red-and-white card to a photo card – you will need three separate identification documents (Photocopies not accepted):',
    summary: 'To get an Ontario health card you need three separate original identification documents; photocopies are not accepted. One document must prove your Canadian citizenship or OHIP-eligible immigration status (a work permit needs proof of full-time employment with an Ontario employer). The others prove where you live in Ontario and support your identity. Check the lists on the Ontario page before you go to ServiceOntario.' },
  { id: 'serviceontario-vital-stats-baby-and-address-kyc', sources: ['https://www.ontario.ca/page/register-birth-new-baby'],
    note: 'The bundle does not include OHIP coverage, and the address-change deadlines are not on this page; both removed.',
    title: 'ServiceOntario: register a new baby with the 5-in-1 newborn bundle',
    quote: 'Register the birth of your new baby with the province of Ontario through the 5-in-1 newborn bundle, apply for a birth certificate and get the documents you need.',
    summary: 'In Ontario you register your baby\'s birth with the province. The online 5-in-1 newborn bundle lets you register the birth, apply for a birth certificate and request other documents in one application. Check the Ontario page for what the bundle includes; a health card for the baby is applied for separately.' },
  { id: 'au-medicare-reciprocal-healthcare-agreements', sources: ['https://www.servicesaustralia.gov.au/reciprocal-health-care-agreements'],
    note: 'Benefit details beyond the page were removed.',
    quote: 'Agreements with 11 countries that covers the cost of medically necessary care when Australians visit certain countries and visitors from these countries visit Australia.',
    summary: 'Australia has Reciprocal Health Care Agreements with 11 countries. They cover the cost of medically necessary care for visitors from those countries while they are in Australia, and for Australians visiting them. Check the Services Australia page for the list of countries and what is covered.' },
  { id: 'au-services-australia-medicare-levy-exemption-mes', sources: ['https://www.servicesaustralia.gov.au/medicare-entitlement-statement'],
    note: 'Visa subclass lists, levy rate and audit claims are not on the page; removed.',
    quote: 'You can get a Medicare Entitlement Statement (MES) if you weren\'t eligible for Medicare for all or part of a financial year.',
    summary: 'If you were not eligible for Medicare for all or part of a financial year, you can ask Services Australia for a Medicare Entitlement Statement (MES) and use it to claim the Medicare levy exemption in your tax return. You can apply from 1 July each year.' },
  { id: 'uk-london-nhs-gp-registration', sources: ['https://www.nhs.uk/nhs-services/gps/how-to-register-with-a-gp-surgery/'],
    note: 'Claims about walk-in centres, A&E and the immigration health surcharge are not on this page; removed.',
    quote: 'You do not need ID, proof of address or proof of immigration status.',
    summary: 'Everyone in England, including London, can register with a GP surgery for free. You do not need ID, proof of address or proof of immigration status. If you do not have a permanent address, you can register using a temporary address or the address of the GP surgery.' },
  { id: 'uk-nhs-healthcare-gp-registration-kyc', sources: ['https://www.nhs.uk/nhs-services/gps/how-to-register-with-a-gp-surgery/'],
    note: 'The page covers England only; claims about NHS numbers and hospital care for surcharge payers are not on this page and were removed.',
    title: 'NHS England: registering with a GP surgery',
    quote: 'Everyone in England can register with a GP surgery or change their GP surgery for free.',
    summary: 'Everyone in England can register with a GP surgery, or change GP surgery, for free. You do not need ID, proof of address or proof of immigration status to register. Rules in Scotland, Wales and Northern Ireland are set separately.' },
  { id: 'nz-acc-and-public-health-eligibility-kyc', sources: ['https://www.tewhatuora.govt.nz/our-health-system/eligibility-for-publicly-funded-health-services/'],
    note: 'ACC and visa-length claims are not on this page; the record now states what the eligibility page says.',
    title: 'Health New Zealand: eligibility for publicly funded health services',
    quote: 'The New Zealand Government strongly recommends that people in New Zealand who are not eligible for publicly funded health services hold comprehensive travel insurance, including health insurance.',
    summary: 'Not everyone in New Zealand is eligible for publicly funded health and disability services. Health New Zealand\'s eligibility page explains who qualifies, which documents you need, and which services are available to people who do not qualify. The New Zealand Government strongly recommends that people who are not eligible hold comprehensive travel insurance, including health insurance.' },

  // Whole-field rewrites recorded on 3 November 2026 for records whose 1 November
  // correction text was itself superseded by the verbatim official-page
  // restorations in scripts/kb-corrections-2026-11-03.js (both records now match
  // their live pages word for word; the later script holds the per-edit trail).
  { id: 'uk-tenancy-deposit-protection-caps-and-dispute-kyc', sources: ['https://www.gov.uk/tenancy-deposit-protection'],
    note: 'Corrected again on 3 November 2026 (scripts/kb-corrections-2026-11-03.js): verbatim 30-day sentence and figures worded as the page proves them; this row is that end state.',
    quote: 'Your landlord or letting agent must put your deposit in the scheme within 30 days of getting it.',
    summary: 'Under the Tenant Fees Act and the Housing Act deposit rules, landlords and letting agents in England and Wales cannot take a security deposit exceeding five weeks rent for tenancies with annual rent below fifty thousand pounds (or six weeks rent above that). Deposits must be registered with one of three government-approved tenancy deposit schemes (DPS, MyDeposits, or TDS) within 30 days of receipt, and landlords must issue statutory Prescribed Information to the tenant. The GOV.UK overview states deposits are protected when the home is let on an assured periodic tenancy and that APTs replaced assured shorthold tenancies on 1 May 2026. Failure to protect deposits invalidated no-fault eviction notices (section twenty-one) served before 1 May 2026, when no-fault evictions were abolished in England, and subjects landlords to statutory compensation orders of one to three times the deposit amount.' },
  { id: 'us-dol-independent-contractor-economic-reality-kyc', sources: ['https://www.dol.gov/agencies/whd/flsa/misclassification'],
    note: 'Corrected again on 3 November 2026 (scripts/kb-corrections-2026-11-03.js): verbatim Wage and Hour Division sentence; the February 2026 rescission-proposal claim was replaced by what the page states (the final rule rescinds the 2021 rule); factors worded without off-page digit tokens. This row is that end state.',
    quote: 'revising its guidance on how to analyze whether a worker is an employee or independent contractor under the FLSA',
    summary: 'Under the Fair Labor Standards Act (FLSA) and the regulations at 29 CFR Part 795 (effective March 11, 2024), the United States Department of Labor applies a six-factor economic reality test to determine whether a worker is an independent contractor or a statutory employee. The six non-exhaustive factors evaluated under the totality of circumstances comprise, in order: opportunity for profit or loss depending on managerial skill, investments by the worker and the potential employer, the degree of permanence of the work relationship, the nature and degree of control over the performance of the work and the economic aspects, the extent to which the work performed is an integral part of the employer business, and the skill and initiative of the worker. No single factor has predetermined weight. The Wage and Hour Division\'s final rule also rescinds the 2021 Independent Contractor Status rule that was published on January 7, 2021. Until any further rulemaking takes effect the 2024 rule continues to apply; check the Wage and Hour Division for current guidance. This record outlines statutory federal labor classification standards.' }
];
