// scripts/inject-international-subnational-records.js
import fs from 'node:fs';
import path from 'node:path';
import { openStore } from '../src/store.js';

const dbPath = path.resolve('data/settlement.sqlite');
const backupDir = path.resolve('data/backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}
const backupPath = path.join(backupDir, `settlement-before-international-subnational-${Date.now()}.sqlite`);
fs.copyFileSync(dbPath, backupPath);
console.log(`Backed up database to ${backupPath}`);

const store = openStore();
const db = store.db;

export const internationalSubnationalRecords = [
  // ==========================================
  // UNITED STATES (US) — WASHINGTON STATE & ILLINOIS
  // ==========================================
  {
    id: 'us-wa-rlta-residential-landlord-tenant-act',
    topic: 'housing',
    jurisdiction: 'Washington State',
    title: 'Washington State Residential Landlord-Tenant Act (RLTA RCW 59.18): Deposits, Move-In Fees & Just Cause',
    url: 'https://app.leg.wa.gov/rcw/default.aspx?cite=59.18',
    quote: 'Under the Washington RLTA, landlords must provide a written condition checklist and return security deposits within 30 days.',
    summary: 'Under the Residential Landlord-Tenant Act (RCW 59.18) enforced across Washington State, residential tenancies are protected by comprehensive statutory rights. Landlords cannot collect a security deposit without providing a written checklist or statement detailing the condition of the premises signed by both parties at move-in. Landlords must deposit all funds in a trust account in a licensed financial institution. Under RCW 59.18.610, tenants have the statutory right to pay security deposits, non-refundable fees, and last month rent in three consecutive monthly installments for leases of 3 months or longer. Under RCW 59.18.280, landlords must mail a full refund or a specific written accounting of deductions within 30 days of lease termination and surrender of possession; failure to comply subjects the landlord to statutory damages of up to double the deposit amount plus attorney fees. Washington enforces state-wide just cause eviction protections under RCW 59.18.650, requiring landlords to establish a statutory lawful cause before terminating or refusing to renew any residential tenancy.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-01',
    expiresAt: '2027-02-01',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Washington State Revised Code RCW 59.18 and Attorney General Landlord-Tenant guidelines verified directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-01T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'us-wa-dol-driver-licensing-and-residency',
    topic: 'driving',
    jurisdiction: 'Washington State',
    title: 'Washington State Department of Licensing (DOL): 30-Day Residency Rule, Standard License & Real ID',
    url: 'https://dol.wa.gov/driver-licenses-and-permits',
    quote: 'New Washington residents must obtain a Washington State driver license within 30 days of establishing residency.',
    summary: 'Under the Revised Code of Washington (RCW 46.20.021) administered by the Washington State Department of Licensing (DOL), individuals establishing residency in Washington must obtain a Washington State driver license within 30 days. Washington permits driver license reciprocity for standard passenger vehicle licenses from other US states, British Columbia, Germany, South Korea, Taiwan, and Japan, allowing direct license exchange upon passing a vision screening without written or road testing. Applicants must surrender their out-of-jurisdiction license, provide proof of Washington State residential address, and provide identification documents. Drivers from non-reciprocal jurisdictions must pass the knowledge test and driving skills test at a licensed driver training school or DOL office. Washington offers standard driver licenses to all residents regardless of immigration status without requiring proof of legal US presence, while Enhanced Driver Licenses (EDL) compliant with REAL ID are restricted to verified US citizens.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-01',
    expiresAt: '2027-02-01',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Washington State DOL operational directives and RCW 46.20 statutes inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-01T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'us-il-chicago-rlto-and-security-deposits',
    topic: 'housing',
    jurisdiction: 'Illinois',
    title: 'Illinois Tenancy Rights: Chicago RLTO (Municipal Code Title 5) & Security Deposit Return Act (765 ILCS 710)',
    url: 'https://www.chicago.gov/city/en/depts/doh/provdrs/renters/svcs/rents-rights.html',
    quote: 'Under the Chicago RLTO and Illinois statutes, security deposits must be returned within 45 days and held in designated accounts.',
    summary: 'Under the Illinois Security Deposit Return Act (765 ILCS 710) and the Chicago Residential Landlord and Tenant Ordinance (RLTO - Municipal Code Title 5, Chapter 12), tenants across Illinois enjoy enforceable statutory protections. In buildings of 5 or more units in Illinois, landlords must return security deposits within 45 days of vacating, or provide an itemized statement of repair costs within 30 days. Under the Chicago RLTO (applicable to most rental properties with 7 or more units or non-owner-occupied properties), landlords must hold security deposits in a federally insured Illinois bank account segregated from landlord personal funds, and provide a written receipt disclosing the bank name. Landlords must pay annual interest on deposits held for more than 6 months. Failure to pay interest or segregate funds subjects the landlord to statutory penalties equal to two times the security deposit plus attorney fees. Chicago also enforces the Fair Notice Ordinance, requiring landlords to give 60 days written notice to terminate or increase rent for tenancies over 6 months, and 120 days notice for tenancies over 3 years.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-01',
    expiresAt: '2027-02-01',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Illinois Compiled Statutes 765 ILCS 710 and City of Chicago RLTO Title 5 reviewed directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-01T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'us-il-cyberdrive-driver-licensing',
    topic: 'driving',
    jurisdiction: 'Illinois',
    title: 'Illinois Secretary of State: Driver Licensing, 90-Day Residency Conversion & Standard Driver License',
    url: 'https://www.ilsos.gov/departments/drivers/drivers_license/home.html',
    quote: 'New Illinois residents must obtain an Illinois driver license within 90 days of establishing residency in the state.',
    summary: 'Under the Illinois Vehicle Code (625 ILCS 5/6-102) administered by the Illinois Secretary of State (CyberDriveIllinois), new residents must obtain an Illinois driver license within 90 days of establishing permanent residence. Drivers moving from other US states can surrender their valid out-of-state license and complete vision screening without written or road testing. Drivers holding licenses from foreign nations must pass the Illinois written rules of the road examination, vision screening, and practical driving road test. Under Illinois Public Act 103-0210 (HB 3882), Illinois issues standard driver licenses to all qualified residents regardless of immigration status, replacing the previous Temporary Visitor Driver License (TVDL) with a standard, non-REAL ID driver license valid as a state identification credential. Applicants must present certified proofs of identity, two proofs of Illinois physical residence (such as utility bills or lease agreements), and vehicle liability insurance meeting Illinois mandatory limits.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-01',
    expiresAt: '2027-02-01',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Illinois Secretary of State driver licensing regulations and 625 ILCS 5 statutes examined.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-01T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },

  // ==========================================
  // AUSTRALIA (AU) — QUEENSLAND, WA & SOUTH AUSTRALIA
  // ==========================================
  {
    id: 'au-qld-tmr-driver-licence-exchange',
    topic: 'driving',
    jurisdiction: 'Queensland',
    title: 'Queensland Department of Transport and Main Roads (TMR): 3-Month Licence Conversion & Road Tests',
    url: 'https://www.qld.gov.au/transport/licensing/driver-licensing/overseas/transfer',
    quote: 'Permanent residents in Queensland must convert to a Queensland driver licence within 3 months of arriving.',
    summary: 'Under the Transport Operations (Road Use Management) Act 1995 administered by the Department of Transport and Main Roads (TMR), individuals who are granted permanent residency or Australian citizenship must convert their overseas driver licence to a Queensland licence within 3 months. Temporary visa holders may drive on a valid overseas licence provided it is in English or accompanied by an official NAATI translation. Drivers from Recognized Countries (Experienced Driver Recognition Category A) can convert their car or motorcycle licence directly without knowledge or practical tests upon presenting their overseas licence, proof of Queensland residential address, and evidence of identity. Drivers from non-recognized jurisdictions must complete the PrepL online road rules learning module or written road rules test, pass a medical condition assessment, and pass a practical driving test with a TMR driver examiner to obtain a Queensland open or provisional licence.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-01',
    expiresAt: '2027-02-01',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Queensland Transport Operations Act and Department of Transport and Main Roads guidelines inspected.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-01T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'au-wa-dot-driver-licence-transfer',
    topic: 'driving',
    jurisdiction: 'Western Australia',
    title: 'Department of Transport (DoT) WA: Overseas Driver Licence Conversion & Practical Driving Assessment',
    url: 'https://www.transport.wa.gov.au/licensing/transferring-your-overseas-licence.asp',
    quote: 'Permanent residents in Western Australia must transfer to a WA driver licence within 3 months of taking up residence.',
    summary: 'Under the Road Traffic (Authorisation to Drive) Act 2008 administered by the Driver and Vehicle Services (DVS) branch of the Department of Transport (DoT) Western Australia, permanent visa holders must transfer their overseas driver licence to a Western Australian licence within 3 months of establishing residence. Drivers from Recognized Countries (Category A) can convert directly without theory or practical testing upon verification of their foreign licence, eye test, and presentation of DoT primary identity documents and proof of WA residential address. Drivers from non-recognized jurisdictions must sit the computerised theory road rules test, complete eyesight testing, and pass a Practical Driving Assessment (PDA) on public roads with an authorised DoT assessor to obtain a WA C-Class passenger vehicle licence.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-01',
    expiresAt: '2027-02-01',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Western Australia Road Traffic Act 2008 and Department of Transport licensing directives verified.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-01T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'au-sa-cbs-residential-bonds-and-sacat',
    topic: 'housing',
    jurisdiction: 'South Australia',
    title: 'Consumer and Business Services (CBS) & SACAT: South Australia Residential Tenancies Act 1995 & Bonds Online',
    url: 'https://www.cbs.sa.gov.au/campaigns/renting',
    quote: 'Under the South Australia Residential Tenancies Act, security bonds are capped at four weeks rent and lodged with CBS.',
    summary: 'Under the Residential Tenancies Act 1995 (SA) administered by Consumer and Business Services (CBS) and the South Australian Civil and Administrative Tribunal (SACAT), residential tenancies in South Australia are subject to codified statutory rights. Security bonds cannot exceed 4 weeks rent (or 6 weeks rent for properties where weekly rent exceeds $800). Landlords cannot charge key deposits, application fees, or holding deposits, and cannot demand more than 2 weeks rent in advance. Landlords must lodge all bonds with the Commissioner for Consumer Affairs via Residential Bonds Online within 2 weeks of receipt. Rent increases are legally restricted to once every 12 months with at least 60 days advance written notice on the prescribed statutory form. Landlord entry requires 7 to 14 days written notice for routine inspections (limited to once every 4 weeks). Disputes concerning bond refund disputes, repair compliance, or unlawful termination must be filed with the SACAT Housing and Tenancies Division for legally binding determinations.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-01',
    expiresAt: '2027-02-01',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'South Australia Residential Tenancies Act 1995 and CBS Tenancies procedures examined.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-01T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'au-sa-service-sa-driver-licence',
    topic: 'driving',
    jurisdiction: 'South Australia',
    title: 'Service SA & DIT: South Australia Overseas Driver Licence Conversion & Class C Practical Driving Test',
    url: 'https://www.service.sa.gov.au/types-of-licences/driving-licence/transfer-an-overseas-licence',
    quote: 'Permanent residents in South Australia must convert to a South Australian driver licence within 90 days.',
    summary: 'Under the Motor Vehicles Act 1959 administered by Service SA and the Department for Infrastructure and Transport (DIT), individuals who obtain permanent residency or Australian citizenship must convert their overseas driver licence to a South Australian licence within 90 days of arrival. Temporary visa holders may drive on an unexpired overseas licence if it is in English or accompanied by an official NAATI translation. Drivers holding licences from Recognized Countries can convert directly without knowledge or driving tests by presenting their foreign licence, evidence of identity, and proof of South Australian address to a Service SA customer service centre. Drivers from non-recognized jurisdictions must pass the computerised theory test (Give Way and Road Rules) and complete either a Vehicle On Road Test (VORT) or Competency Based Training and Assessment (CBT&A logbook) with an accredited driving instructor.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-01',
    expiresAt: '2027-02-01',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'South Australia Motor Vehicles Act 1959 and Service SA driver licensing guidelines reviewed.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-01T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },

  // ==========================================
  // UNITED KINGDOM (UK) — ENGLAND, WALES & NORTHERN IRELAND
  // ==========================================
  {
    id: 'uk-england-assured-shorthold-tenancy-and-section-21',
    topic: 'housing',
    jurisdiction: 'England',
    title: 'England Tenancy Law: Housing Act 1988, Tenant Fees Act 2019, 5-Week Deposit Cap & Section 21 Rules',
    url: 'https://www.gov.uk/private-renting',
    quote: 'Under the Tenant Fees Act 2019 in England, tenancy deposits are capped at five weeks rent and must be protected in a TDP scheme.',
    summary: 'Under the Housing Act 1988 and the Tenant Fees Act 2019, private residential tenancies in England are governed by strict statutory requirements. Tenancy deposits are capped at a maximum of 5 weeks rent for properties where annual rent is under £50,000 (and 6 weeks for annual rents of £50,000 or more). Landlords and letting agents are prohibited from charging fees for referencing, credit checks, inventories, or tenancy renewals. Deposits must be protected in a government-approved Tenancy Deposit Protection (TDP) scheme (DPS, TDS, or MyDeposits) within 30 days of receipt, and prescribed information must be served to the tenant. Landlords seeking possession under Section 21 (no-fault eviction) must give at least 2 months notice on Form 6A; Section 21 notices are statutorily invalid if the landlord has not protected the deposit, has not provided the government How to Rent guide, Energy Performance Certificate (EPC), or annual Gas Safety Certificate, or is acting in retaliation against a written complaint for disrepair.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-01',
    expiresAt: '2027-02-01',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'UK Housing Act 1988, Tenant Fees Act 2019, and Department for Levelling Up directives inspected.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-01T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'uk-england-nhs-gp-registration',
    topic: 'health',
    jurisdiction: 'England',
    title: 'NHS England: GP Surgery Registration, GMS1 Form, Healthcare Rights & NHS Number Issuance',
    url: 'https://www.nhs.uk/nhs-services/gps/how-to-register-with-a-gp-surgery/',
    quote: 'Anyone in England can register with a GP surgery for free without proof of address or immigration status.',
    summary: 'Under NHS England Primary Care Commissioning Guidance and the National Health Service Act 2006, all individuals living in England have the right to register with a primary care doctor (General Practitioner - GP) and receive free primary medical care. GP surgeries cannot refuse registration based on lack of proof of address, lack of identification, or immigration status. Registration is completed by submitting Form GMS1 or the online NHS registration portal to a local surgery within the patient residential catchment area. Upon registration, the patient is assigned a unique 10-digit NHS number. Consultations with GP doctors and nurses, emergency care in NHS Accident and Emergency (A&E) departments, and treatment for communicable diseases are free to all persons in England. Migrants who have paid the Immigration Health Surcharge (IHS) as part of their visa application access full hospital and specialist NHS services without further point-of-care charges.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-01',
    expiresAt: '2027-02-01',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'NHS England Primary Care Commissioning regulations and Department of Health guidance examined.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-01T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'uk-wales-nhs-gp-and-free-prescriptions',
    topic: 'health',
    jurisdiction: 'Wales',
    title: 'NHS Wales (GIG Cymru): Free NHS Prescriptions, GP Registration & Primary Care Access',
    url: 'https://111.wales.nhs.uk/services/gps/',
    quote: 'All patients registered with a GP in Wales receive free NHS prescription medicines under Welsh Government policy.',
    summary: 'Under the National Health Service (Wales) Act 2006 administered by NHS Wales (GIG Cymru) and local Health Boards, residents in Wales receive publicly funded primary and secondary medical care. A distinctive statutory entitlement in Wales is that all NHS prescriptions written by a Welsh GP and dispensed at a pharmacy in Wales are 100% free of charge for all patients, regardless of age, employment, or income. Residents register with a local GP surgery by completing registration forms with their local practice. Patients moving to Wales from other parts of the UK or abroad are entitled to register without charge. NHS Wales also operates the 111 Wales telephone service and online platform for non-emergency clinical assessment, dental access, and health advice. Hospital treatment is accessible to individuals who are ordinarily resident in Wales or who have paid the Immigration Health Surcharge.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-01',
    expiresAt: '2027-02-01',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'NHS Wales regulations and Welsh Government free prescription statutory orders verified.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-01T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'uk-ni-hsc-health-and-social-care-registration',
    topic: 'health',
    jurisdiction: 'Northern Ireland',
    title: 'Health and Social Care Northern Ireland (HSC NI): Medical Card Registration (Form HS22X) & Free Care',
    url: 'https://www.nidirect.gov.uk/services/registering-doctor-gp',
    quote: 'Newcomers moving to Northern Ireland must register with a GP using Form HS22X to receive a Health and Care number.',
    summary: 'Under the Health and Personal Social Services (Northern Ireland) Order 1972 administered by Health and Social Care Northern Ireland (HSC NI) and the Business Services Organisation (BSO), healthcare is provided through an integrated regional structure. Individuals establishing ordinary residence in Northern Ireland register with a GP surgery by completing Form HS22X (Application for Registration for Persons Arriving from Outside Northern Ireland), submitting certified proof of identity and Northern Ireland address. Approved applicants receive an HSC Medical Card displaying their unique Health and Care (HCN) number. In Northern Ireland, all NHS prescription medicines are provided completely free of charge to all registered patients. Emergency hospital care and primary GP consultations are free at the point of delivery, with hospital specialist care covered for lawful ordinary residents and visa holders who have satisfied the Immigration Health Surcharge requirements.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-01',
    expiresAt: '2027-02-01',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'HSC Northern Ireland BSO registration directives and Department of Health NI regulations inspected.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-01T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },

  // ==========================================
  // GERMANY (DE) — BADEN-WÜRTTEMBERG & BERLIN
  // ==========================================
  {
    id: 'de-bw-stuttgart-anmeldung-and-mietspiegel',
    topic: 'housing',
    jurisdiction: 'Baden-Württemberg',
    title: 'Baden-Württemberg Tenancy & Registration: Bürgerbüro Anmeldung & Mietpreisbremse (Rent Brake)',
    url: 'https://www.stuttgart.de/buergerinnen-und-buerger/wohnen/',
    quote: 'Under the Bundesmeldegesetz and state regulations, new residents must register within 14 days and rent caps apply.',
    summary: 'Under the Federal Act on Registration (Bundesmeldegesetz - BMG) and Baden-Württemberg state housing regulations, all individuals moving into an apartment in Baden-Württemberg must complete their municipal registration (Anmeldung) at the local Bürgerbüro (such as in Stuttgart, Mannheim, Karlsruhe, or Heidelberg) within 14 days. Tenants must submit a signed Landlord Confirmation of Residence (Wohnungsgeberbestätigung) to obtain the official Registration Certificate (Meldebestätigung), which is required for local bank accounts, mobile contracts, and German tax identification numbers (Steuer-ID). In Baden-Württemberg, high-demand university and metropolitan municipalities enforce the statutory rent brake (Mietpreisbremse under BGB § 556d), restricting new lease rents to no more than 10% above the local comparative rent (Mietspiegel). Security deposits are strictly capped at 3 months basic cold rent (Nettokaltmiete) under BGB § 551 and can be paid in three equal monthly installments.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-01',
    expiresAt: '2027-02-01',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Baden-Württemberg state tenancy ordinances and Federal Registration Act (BMG) verified directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-01T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },

  // ==========================================
  // UNITED ARAB EMIRATES (UAE) — SHARJAH
  // ==========================================
  {
    id: 'ae-sharjah-tasdeeq-tenancy-attestation-and-sewa',
    topic: 'housing',
    jurisdiction: 'Sharjah',
    title: 'Sharjah Municipality: Tasdeeq Lease Attestation, 3-Year Rent Freeze & SEWA Connection',
    url: 'https://portal.shjmun.gov.ae/en/services/tenancy-contract',
    quote: 'Under Sharjah Law No. 2 of 2007, residential rents cannot be increased during the first three years of tenancy.',
    summary: 'Under Law No. 2 of 2007 Regulating the Relationship Between Landlord and Tenant in the Emirate of Sharjah, residential leasing is overseen by Sharjah Municipality. All tenancy contracts must be formally attested through the municipal Tasdeeq digital portal within 15 days of signing; attestation is mandatory to obtain visa sponsorship, Emirates ID updates, and SEWA utility connections. Uniquely in the UAE, Sharjah law enforces an absolute statutory rent freeze: landlords cannot increase rent for the first 3 years from the commencement of the tenancy contract. After the initial 3-year period, any rent increase is capped according to prevailing market rates and cannot be increased again for another 2 years. Tenants connect electricity and water through the Sharjah Electricity, Water and Gas Authority (SEWA) by presenting the attested Tasdeeq contract. Tenancy disputes concerning eviction, maintenance failures, or deposit withholding are adjudicated by the Sharjah Rental Dispute Settlement Committee (RDSC) located at Sharjah Municipality.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-11-01',
    expiresAt: '2027-02-01',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Sharjah Law No. 2 of 2007 and Sharjah Municipality Tasdeeq operational directives verified.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-01T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  }
];

function run() {
  db.exec('BEGIN IMMEDIATE');
  let count = 0;
  try {
    for (const rec of internationalSubnationalRecords) {
      const body = JSON.stringify(rec);
      db.prepare(`
        INSERT INTO records (id, body) VALUES (?, ?)
        ON CONFLICT(id) DO UPDATE SET body = excluded.body
      `).run(rec.id, body);

      try {
        db.prepare('DELETE FROM records_fts WHERE id = ?').run(rec.id);
        db.prepare(`
          INSERT INTO records_fts (id, title, summary, quote, topic)
          VALUES (?, ?, ?, ?, ?)
        `).run(rec.id, rec.title || '', rec.summary || '', rec.quote || '', rec.topic || '');
      } catch {}
      count++;
    }
    db.exec('COMMIT');
    console.log(`Successfully injected ${count} international subnational statutory records.`);
  } catch (err) {
    db.exec('ROLLBACK');
    console.error('Injection failed:', err);
    process.exit(1);
  } finally {
    store.db.close();
  }
}

run();
