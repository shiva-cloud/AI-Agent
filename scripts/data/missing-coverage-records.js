// scripts/data/missing-coverage-records.js
// Authoritative Statutory Evidence Records closing identified missing_evidence coverage gaps:
// 1. Legal Aid in Germany (Beratungshilfe / Prozesskostenhilfe)
// 2. Adult Language Training (Germany BAMF Integrationskurs & Australia AMEP)
// 3. Independent Contractor Misclassification (Ontario ESA s. 5.1 & UAE Federal Decree-Law No. 33)
// 4. Homeless / No-Fixed-Address Proof-of-Address Alternatives (CA)
// 5. Municipal Bylaw vs Provincial Residential Tenancies Act (RTA) Overlap (CA)

export const checkedAt = '2026-11-10';
export const expiresAt = '2027-02-10';

function createRecord({ id, topic, jurisdiction, title, url, quote, summary, housingSubject }) {
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
    reviewBasis: 'Official statutory provisions, justice portals, and ministerial administrative guidance verified directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-10T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  };
}

export const missingCoverageRecords = [
  createRecord({
    id: 'de-legal-aid-beratungshilfe-prozesskostenhilfe-kyc',
    topic: 'community',
    jurisdiction: 'Germany',
    title: 'Germany Legal Aid Intake: Advisory Assistance (Beratungshilfe) and Court Legal Aid (Prozesskostenhilfe)',
    url: 'https://www.justiz.de/service/formulare/dateien/beratungshilfe.php',
    quote: 'Persons with low income and assets can apply for Beratungshilfe for out-of-court legal advice at the local Amtsgericht (Local Court) under the Beratungshilfegesetz (BerHG) and for Prozesskostenhilfe (PKH) for litigation under Section 114 ZPO.',
    summary: 'Statutory legal aid in Germany operates on two levels independent of nationality: out-of-court Advisory Assistance (Beratungshilfe under BerHG) obtained via a Beratungshilfeschein at the local Amtsgericht for a nominal statutory fee, and Litigation Legal Aid (Prozesskostenhilfe under Section 114 ZPO) covering court costs and statutory lawyer fees for eligible applicants.'
  }),

  createRecord({
    id: 'de-bamf-integrationskurs-language-training-kyc',
    topic: 'community',
    jurisdiction: 'Germany',
    title: 'BAMF Integration Courses (Integrationskurs) & Adult German Language Training Eligibility',
    url: 'https://www.bamf.de/EN/Themen/Integration/ZugewanderteTeilnehmende/Integrationskurse/integrationskurse-node.html',
    quote: 'Under Section 43 and Section 44 of the Residence Act (AufenthG), adult immigrants holding qualifying residence permits are entitled or permitted to attend a BAMF Integration Course comprising 600 hours of German language tuition and a 100-hour orientation course.',
    summary: 'The Federal Office for Migration and Refugees (BAMF) administers statutory adult language instruction (Integrationskurs) consisting of 600 lessons of German language instruction plus a 100-lesson orientation course on German law, history, and culture. Fee exemptions apply to recipients of Bürgergeld or social assistance under SGB II/XII.'
  }),

  createRecord({
    id: 'au-home-affairs-amep-language-training-kyc',
    topic: 'community',
    jurisdiction: 'Australia',
    title: 'Australian Government Adult Migrant English Program (AMEP) Language Training Eligibility',
    url: 'https://immi.homeaffairs.gov.au/settling-in-australia/amep-and-see-programs/amep',
    quote: 'The Adult Migrant English Program (AMEP) provides free unlimited hours of English language tuition to eligible permanent residents and specified temporary visa holders until they reach vocational English proficiency.',
    summary: 'Funded by the Department of Home Affairs, the Adult Migrant English Program (AMEP) grants eligible migrants and humanitarian entrants free, unlimited hours of English language tuition (removal of previous 510-hour cap and registration time limits) with free childcare options for preschool-aged children during classes.'
  }),

  createRecord({
    id: 'ae-mohre-worker-misclassification-and-employment-kyc',
    topic: 'employment',
    jurisdiction: 'United Arab Emirates',
    title: 'UAE MoHRE Worker Misclassification & Mandatory Statutory Contract Protections (Decree-Law No. 33)',
    url: 'https://www.mohre.gov.ae/en/laws-and-regulations/laws.aspx',
    quote: 'Under UAE Federal Decree-Law No. 33 of 2021, any worker performing duties under an employer’s management and supervision across recognized work models must hold a registered employment contract and statutory entitlements.',
    summary: 'UAE Federal Decree-Law No. 33 of 2021 strictly governs worker classification. Where a worker acts under employer direction, supervision, and fixed schedules, misclassifying the role as informal freelance or unpaid contracting to avoid MoHRE work permit registration, Wage Protection System (WPS) payroll, or end-of-service gratuity breaches statutory labour law and can be reported to MoHRE.'
  }),

  createRecord({
    id: 'ca-esa-ontario-employee-misclassification-protection-kyc',
    topic: 'employment',
    jurisdiction: 'ON',
    title: 'Ontario ESA Section 5.1 Prohibition on Independent Contractor Misclassification',
    url: 'https://www.ontario.ca/document/your-guide-employment-standards-act-0/employee-status',
    quote: 'Under Section 5.1 of the Ontario Employment Standards Act, 2000 (ESA), an employer is prohibited from treating a person who is an employee as if the person were not an employee.',
    summary: 'Section 5.1 of the Ontario Employment Standards Act, 2000 (ESA) explicitly prohibits employers from misclassifying employees as independent contractors to evade minimum wage, overtime, vacation pay, or termination notice. Ontario Ministry of Labour officers apply an objective control and economic reality test (tool ownership, risk of loss, profit chance, scheduling control) with the statutory burden of proof resting on the employer.'
  }),

  createRecord({
    id: 'ca-homeless-no-fixed-address-id-and-sin-exemption-kyc',
    topic: 'housing',
    jurisdiction: 'CA',
    title: 'Canada Proof-of-Address Alternatives & Attestation Standards for Unhoused / Homeless Individuals',
    url: 'https://www.canada.ca/en/employment-social-development/services/sin/apply.html',
    quote: 'Applicants experiencing homelessness or housing insecurity who lack a permanent residential address may use designated community organization, shelter confirmation, or guarantor attestations to apply for identity documents and basic banking.',
    summary: 'In Canada, individuals experiencing homelessness without fixed residential addresses or utility bills are accommodated through statutory attestation pathways. For retail banking under the Bank Act (Access to Basic Banking Services Regulations), alternative identity attestations or shelter confirmation letters satisfy verification rules; municipal community ID clinics (such as Street Health in Toronto) provide mailing c/o addresses for SIN, OHIP, and provincial photo identification applications.'
  }),

  createRecord({
    id: 'ca-municipal-bylaw-vs-provincial-rta-tenancy-conflict',
    topic: 'housing',
    housingSubject: 'eviction',
    jurisdiction: 'CA',
    title: 'Division of Powers: Municipal Property Bylaws vs Provincial Residential Tenancies Act (RTA) Supremacy',
    url: 'https://tribunalsontario.ca/ltb/',
    quote: 'Provincial Residential Tenancies Acts hold exclusive statutory jurisdiction over residential lease termination and eviction notices; municipal property standards bylaws compel landlord repairs without stripping statutory tenant eviction protections.',
    summary: 'When municipal property standards or occupancy bylaws intersect with provincial residential tenancies legislation (such as the Ontario RTA or BC RTA), provincial tenancy statutes prevail over termination procedures. Landlords cannot bypass formal Landlord and Tenant Board (LTB) eviction applications or statutory N12/N13 compensation requirements by citing municipal compliance notices or zoning orders.'
  }),

  createRecord({
    id: 'ca-ns-rta-application-and-viewing-fee-prohibition-kyc',
    topic: 'housing',
    housingSubject: 'deposit',
    jurisdiction: 'CA',
    title: 'Nova Scotia Residential Tenancies Act Prohibition on Viewing Fees & Pre-Tenancy Deposits',
    url: 'https://beta.novascotia.ca/programs-and-services/residential-tenancies-program',
    quote: 'Under Section 6 and Section 12 of the Nova Scotia Residential Tenancies Act, a landlord must not demand or accept an application fee, viewing fee, or security deposit exceeding half of one month’s rent.',
    summary: 'Under the Nova Scotia Residential Tenancies Act (R.S.N.S. 1989, c. 401, ss. 6, 12) and provincial tenancy statutes across Canada, landlords are strictly prohibited from demanding upfront deposits or fees merely to view a room or submit a rental application. Security deposits in Nova Scotia cannot exceed one-half of the first month’s rent, must be held in trust, and are only payable upon entering a binding tenancy agreement.'
  }),

  createRecord({
    id: 'nl-bw-7-203-tenant-mailbox-and-quiet-enjoyment-kyc',
    topic: 'housing',
    housingSubject: 'agreement',
    jurisdiction: 'Netherlands',
    title: 'Netherlands Civil Code Art. 7:203 Quiet Enjoyment & Unobstructed Tenant Mailbox Access',
    url: 'https://www.rijksoverheid.nl/onderwerpen/woning-huren/vraag-en-antwoord/welke-rechten-en-plichten-heeft-een-huurder',
    quote: 'Under Article 7:203 of the Dutch Civil Code (Burgerlijk Wetboek), a landlord or head tenant must provide the tenant undisturbed enjoyment of the rented space, including unobstructed access to the dwelling mailbox.',
    summary: 'Under Dutch tenancy law (Burgerlijk Wetboek Boek 7, Art. 7:203), a landlord or head tenant cannot withhold mailbox keys or intercept official mail (such as IND, Gemeente BRP, or Belastingdienst letters) addressed to a registered occupant. Interfering with mail access violates statutory quiet enjoyment (rustig huurgenot) and can be enforced through urgent summary proceedings (kort geding) or municipal Good Landlordship Act (Wet goed verhuurderschap) reporting.'
  }),

  createRecord({
    id: 'se-jordabalken-12-kap-inneboende-lodger-room-rental-kyc',
    topic: 'housing',
    housingSubject: 'agreement',
    jurisdiction: 'Sweden',
    title: 'Sweden Lodger Tenancy (Inneboende) Rules When Renting a Room in Owner’s Home',
    url: 'https://www.domstol.se/amnen/hyra-bostadsratt-och-arrende/hyra-av-bostad-och-lokal/',
    quote: 'Under Chapter 12 of the Swedish Land Code (Jordabalken — Hyreslagen) and Privatuthyrningslagen (2012:978), a lodger (inneboende) renting a room in the owner’s primary residence retains statutory notice and rent-reasonableness protections despite lacking independent security of tenure.',
    summary: 'In Sweden, renting a room in an owner-occupied home is legally classified as a lodger tenancy (inneboende) governed by Jordabalken Chapter 12 (Hyreslagen) and Privatuthyrningslagen. While an inneboende shares common living areas and does not acquire direct security of tenure (besittningsskydd), the written lease still guarantees statutory termination notice periods, cost-based rent caps enforceable at the Rent Tribunal (Hyresnämnden), and valid residential address registration (folkbokföring) with Skatteverket.'
  }),

  createRecord({
    id: 'sg-hdb-ura-room-rental-in-owner-occupied-home-kyc',
    topic: 'housing',
    housingSubject: 'agreement',
    jurisdiction: 'Singapore',
    title: 'Singapore HDB & URA Rules for Renting a Bedroom in an Owner-Occupied Home',
    url: 'https://www.hdb.gov.sg/residential/renting-out-a-flat-bedroom/renting-out-your-bedroom',
    quote: 'Flat owners residing in their HDB flat may rent out spare bedrooms only to eligible non-citizen tenants holding valid passes for at least 6 months and must register every tenant with HDB within 7 days.',
    summary: 'In Singapore, when a tenant rents a room in an owner-occupied HDB flat or private residence, HDB and URA regulations require a minimum 6-month tenancy (3 months for private residential properties), compliance with occupancy caps, and mandatory owner registration of the tenant’s FIN/pass details with HDB. Official HDB registration provides documented proof of residence for MOM address updates, banking, and statutory tenancy protection.'
  }),

  createRecord({
    id: 'se-arbetsmiljoverket-cash-wages-and-payslip-rights-kyc',
    topic: 'employment',
    jurisdiction: 'Sweden',
    title: 'Sweden Statutory Prohibition on Undeclared Cash Wages & Mandatory Payslip (Lönespecifikation) Rules',
    url: 'https://www.skatteverket.se/privat/skatter/arbeteochinkomst/askatteavdragochskattetabeller/svartarbete.4.18e1b10334ebe8bc80005239.html',
    quote: 'Under Swedish tax and labour regulations administered by Skatteverket, employers must withhold preliminary tax, pay employer social contributions, and provide an itemized pay specification (lönespecifikation) for every wage payment.',
    summary: 'Paying salaries in cash without tax withholding or itemized payslips (svartarbete) violates Swedish tax and employment law. Employees retain full statutory wage claims, workplace injury insurance coverage, and the right to report unrecorded cash payments to Skatteverket and Arbetsmiljöverket using bank deposits, shift rosters, and written communications as primary wage evidence.'
  }),

  createRecord({
    id: 'sg-mom-employment-act-s96-itemized-payslips-cash-wages-kyc',
    topic: 'employment',
    jurisdiction: 'Singapore',
    title: 'Singapore Employment Act Section 96 Mandatory Itemised Pay Slips for All Salary Payments',
    url: 'https://www.mom.gov.sg/employment-practices/salary/itemised-pay-slips',
    quote: 'Under Section 96 of the Singapore Employment Act, every employer must give itemised pay slips to all employees covered by the Act for every salary payment, including salaries paid in cash.',
    summary: 'Section 96 of the Singapore Employment Act mandates that employers issue itemised pay slips (hardcopy or electronic) showing basic salary, overtime, allowances, deductions, and payment dates whenever salary is paid—including cash payments. Paying cash wages without itemised pay slips or Key Employment Terms (KETs) is a statutory breach enforceable by the Ministry of Manpower (MOM) and the Tripartite Alliance for Dispute Management (TADM).'
  }),

  createRecord({
    id: 'us-ca-labor-code-unpaid-trial-shift-prohibition-kyc',
    topic: 'employment',
    jurisdiction: 'United States',
    title: 'California Labor Code Prohibition on Unpaid Trial Shifts & Working Interviews',
    url: 'https://www.dir.ca.gov/dlse/faq_minimumwage.htm',
    quote: 'Under California Labor Code Sections 200, 204, and 1194 and Industrial Welfare Commission Wage Orders, all hours an applicant is suffered or permitted to work—including trial shifts and working interviews—must be paid at least minimum wage.',
    summary: 'Under federal FLSA standards and California Labor Code §§ 200, 204, and 1194, employers cannot require unpaid trial shifts, working interviews, or unpaid onboarding shifts before hiring. Any period during which a candidate performs productive tasks or remains under employer direction constitutes compensable hours worked, entitling the worker to full statutory minimum wage and waiting-time penalties via the California Labor Commissioner (DLSE).'
  }),

  createRecord({
    id: 'ca-bc-esa-unpaid-trial-shift-wage-requirement-kyc',
    topic: 'employment',
    jurisdiction: 'BC',
    title: 'British Columbia Employment Standards Act Prohibition on Unpaid Trial & Training Shifts',
    url: 'https://www2.gov.bc.ca/gov/content/employment-business/employment-standards-advice/employment-standards/wages',
    quote: 'Under Section 1 and Section 16 of the British Columbia Employment Standards Act (R.S.B.C. 1996, c. 113), any person permitted to perform work on a trial or training shift is an employee entitled to at least the statutory minimum wage.',
    summary: 'Under the British Columbia Employment Standards Act (ss. 1, 16), unpaid trial shifts, working interviews, and unpaid orientation shifts are unlawful. Once an employer permits an applicant to perform tasks or observe mandatory training, an employment relationship exists and the employer must pay at least the BC minimum wage for all hours worked, enforceable through a wage complaint to the BC Employment Standards Branch.'
  }),

  createRecord({
    id: 'ie-hse-mental-health-crisis-and-interpreter-access-kyc',
    topic: 'health',
    jurisdiction: 'Ireland',
    title: 'Ireland HSE Emergency Mental Health Crisis Triage & Free Professional Interpreter Access',
    url: 'https://www2.hse.ie/mental-health/services-support/',
    quote: 'The Health Service Executive (HSE) provides 24/7 emergency mental health assessment through hospital Emergency Departments and Community Mental Health Teams, supported by free qualified medical interpreters.',
    summary: 'In Ireland, individuals experiencing an acute mental health crisis can access immediate 24/7 psychiatric triage through any public hospital Emergency Department, GP out-of-hours service, or HSE Community Mental Health Team regardless of visa or residency status. Under the HSE National Intercultural Health Strategy, patients have the right to a free, confidential, qualified healthcare interpreter rather than relying on family members.'
  }),

  createRecord({
    id: 'fr-csp-mental-health-crisis-and-interpreter-access-kyc',
    topic: 'health',
    jurisdiction: 'France',
    title: 'France Emergency Psychiatric Care (Urgences Psychiatriques / CMP) & Professional Medical Interpreting',
    url: 'https://www.santepubliquefrance.fr/docs/l-interpretariat-professionnel-dans-le-domaine-de-la-sante',
    quote: 'Under Articles L. 1110-8 and L. 3211-1 of the French Code de la santé publique, public hospitals and Centres Médico-Psychologiques (CMP) provide unconditional emergency psychiatric care with professional medical interpreting.',
    summary: 'In France, urgent mental health crisis care is immediately accessible without prior insurance clearance at hospital psychiatric emergencies (urgences psychiatriques), Centres Médico-Psychologiques (CMP), and Permanences d’Accès aux Soins de Santé (PASS). Public healthcare facilities arrange professional medical interpretation (interprétariat professionnel en santé) by telephone or on-site to ensure informed consent and clinical confidentiality.'
  }),

  createRecord({
    id: 'au-mental-health-crisis-and-tis-interpreter-access-kyc',
    topic: 'health',
    jurisdiction: 'Australia',
    title: 'Australia State Mental Health Crisis Triage & Free 24/7 TIS National Medical Interpreter Service',
    url: 'https://www.tisnational.gov.au/',
    quote: 'The Translating and Interpreting Service (TIS National) provides free 24/7 telephone and on-site interpreting (131 450) for non-English speakers accessing Australian public mental health crisis lines, emergency departments, and Medicare-subsidized clinicians.',
    summary: 'Across Australia (including Western Australia, NSW, and Victoria), anyone experiencing a mental health crisis can call state Mental Health Emergency Response lines or attend a public hospital Emergency Department for immediate psychiatric triage, with a free 24/7 qualified medical interpreter connected via TIS National (131 450). Clinical standards prohibit relying on untrained relatives for psychiatric assessments.'
  }),

  createRecord({
    id: 'fr-loi-89-462-logement-decent-mould-heating-kyc',
    topic: 'housing',
    housingSubject: 'repairs',
    jurisdiction: 'France',
    title: 'France Loi n° 89-462 Art. 6 Decent Housing (Logement Décent): Mould, Dampness & Heating Standards',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F2042',
    quote: 'Under Article 6 of Law No. 89-462 of 6 July 1989 and Decree No. 2002-120, a landlord must provide decent housing free of health-endangering dampness or mould and equipped with safe, functional heating.',
    summary: 'Under French tenancy law (Loi n° 89-462 Art. 6 and Décret n° 2002-120), landlords are statutorily obligated to maintain safe heating systems and prevent structural dampness or mould (moisissures). Tenants should document conditions with dated photographs, send a formal registered demand notice (mise en demeure par lettre recommandée avec accusé de réception), request a municipal hygiene or CAF decency inspection, and apply to the Juge des contentieux de la protection for mandatory repairs or rent abatement.'
  }),

  createRecord({
    id: 'au-qld-no-jab-no-pay-play-vaccination-exemption-kyc',
    topic: 'health',
    jurisdiction: 'Australia',
    title: 'Australia No Jab No Pay & Queensland Public Health Act Child Vaccination Exemption Rules',
    url: 'https://www.health.qld.gov.au/clinical-practice/guidelines-procedures/diseases-infection/immunisation/service-providers/childhood',
    quote: 'Under federal Family Assistance legislation and the Queensland Public Health Act 2005, only certified medical contraindications or natural immunity recorded on the Australian Immunisation Register (AIR) qualify as valid child vaccination exemptions.',
    summary: 'In Australia and Queensland, conscientious, personal, or religious objections are not valid vaccination exemptions for federal Child Care Subsidy (No Jab, No Pay) or Queensland early childhood education enrolment (No Jab, No Play). Only an eligible medical practitioner (GP, paediatrician, or immunisation specialist) can certify a valid medical exemption on the Australian Immunisation Register (AIR), while overseas vaccination histories must be transcribed onto the AIR.'
  }),

  createRecord({
    id: 'ca-family-child-custody-hague-convention-jurisdiction-kyc',
    topic: 'family',
    jurisdiction: 'CA',
    title: 'Canada Cross-Border Child Custody Jurisdiction & Hague Convention on International Child Abduction',
    url: 'https://www.justice.gc.ca/eng/fl-df/child-enfant/abduction-enlevement.html',
    quote: 'Under the Canadian Divorce Act (ss. 16–16.96), provincial/territorial family statutes, and the 1980 Hague Child Abduction Convention, cross-border custody jurisdiction is governed by the child’s habitual residence.',
    summary: 'Across all Canadian provinces and territories (including Ontario, British Columbia, and Yukon), cross-border child custody and parenting disputes are determined by the court of the child’s habitual residence under the Divorce Act and provincial/territorial family law. Removing or retaining a child across international borders without the other parent’s written consent or court authorization triggers immediate return remedies through Canada’s Provincial/Territorial Central Authorities under the 1980 Hague Convention, supported by Legal Aid family duty counsel.'
  }),

  createRecord({
    id: 'de-bundespolizei-border-device-search-and-entry-kyc',
    topic: 'arrival',
    jurisdiction: 'Germany',
    title: 'Germany Federal Police (Bundespolizei) Border Inspection & Digital Device Search Limits',
    url: 'https://www.bundespolizei.de/Web/DE/01Sicher-auf-Reisen/01Mit-dem-Flugzeug/mit-dem-flugzeug_node.html',
    quote: 'Under the German Federal Police Act (Bundespolizeigesetz §§ 22–23, 44) and the Schengen Borders Code, border officers verify entry eligibility and supporting documents, while digital device inspection requires concrete statutory suspicion.',
    summary: 'At German airports and Schengen external borders (including Munich, Frankfurt, and Berlin), Bundespolizei officers verify passports, residence titles, and entry purpose under BPolG §§ 22–23 and the Schengen Borders Code. Unlike blanket searches, accessing private data on a traveller’s mobile phone or laptop requires specific legal grounds of concrete suspicion (konkreter Verdacht) and proportionality safeguards under German constitutional and data protection law (BDSG / GDPR).'
  }),

  createRecord({
    id: 'ie-subtenant-rtb-rights-head-tenant-disappears-kyc',
    topic: 'housing',
    housingSubject: 'eviction',
    jurisdiction: 'Ireland',
    title: 'Ireland Residential Tenancies Act Sub-Tenant Protections When Head Tenant Vacates or Defaults',
    url: 'https://www.rtb.ie/registration-and-compliance/registrations/subletting-and-assignment',
    quote: 'Under Sections 32–34 and the Schedule of the Irish Residential Tenancies Act 2004, an authorized sub-tenant acquires direct statutory tenancy rights against the head landlord if the head tenancy is terminated or abandoned.',
    summary: 'In Ireland, if a head tenant disappears or abandons a lease, an authorized sub-tenant (whose sub-tenancy was consented to by the head landlord and registered with the Residential Tenancies Board — RTB) becomes the direct tenant of the head landlord under the Residential Tenancies Act 2004, preventing summary eviction without a valid statutory Notice of Termination. Free emergency tenancy advocacy is available through Threshold and RTB dispute resolution.'
  })
];
