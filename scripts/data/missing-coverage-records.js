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
  })
];
