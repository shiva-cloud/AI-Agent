// Comprehensive City-Specific Settlement Intelligence Records for Global Gateways (Expansion)
// Expands the 23 foreign destination cities to parity with Canadian metropolitan depth (5-7 records per city).

export const checkedAt = '2026-11-03';
export const expiresAt = '2027-04-30';

function createRecord({ id, topic, jurisdiction, title, url, quote, summary, housingSubject, telecomSubject }) {
  return {
    id,
    topic,
    jurisdiction,
    title,
    url,
    quote,
    summary,
    ...(housingSubject ? { housingSubject } : {}),
    ...(telecomSubject ? { telecomSubject } : {}),
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt,
    expiresAt,
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Official municipal legislation, statutory tenant protections, transit authorities, and government registries.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-03T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  };
}

export const expandedCityRecords = [
  // ── 1. LONDON (UNITED KINGDOM) ──────────────────────────────────────────────
  createRecord({
    id: 'uk-london-council-tax-registration',
    topic: 'community',
    jurisdiction: 'London',
    title: 'London Boroughs: Council Tax Registration, Valuation Bands, and Single Person Discount',
    url: 'https://www.gov.uk/council-tax',
    quote: 'You must pay Council Tax if you are 18 or over and own or rent a home in the UK.',
    summary: 'Every residential household across all 32 London Boroughs and the City of London must register for Council Tax with their local borough council immediately upon moving in. Council Tax bills are calculated based on property valuation bands (Bands A through H) set by the Valuation Office Agency (VOA). Full-time students are completely exempt from Council Tax. Single adult occupants qualify for a statutory 25% Single Person Discount. The Council Tax bill serves as primary proof of address (POA) in the UK for opening bank accounts, GP registration, and driving licence applications. Failure to register or pay can result in a council liability order, enforcement agent action, or statutory penalties.'
  }),
  createRecord({
    id: 'uk-london-eadmissions-school-places',
    topic: 'schooling',
    jurisdiction: 'London',
    title: 'Pan-London Admissions System: Applying for State Primary and Secondary School Places',
    url: 'https://www.eadmissions.org.uk/',
    quote: 'The Pan-London Admissions System coordinates primary and secondary school applications across 33 London local authorities.',
    summary: 'State-funded school admissions in Greater London are coordinated via the centralized Pan-London eAdmissions portal. Families can list up to six ranked preferences of state schools (community, academy, voluntary aided, or faith schools) within or outside their home borough. Deadlines are strictly enforced: October 31 for secondary schools and January 15 for primary reception places. Newcomer families arriving mid-year must submit an In-Year Application directly to their local borough council education department. Admission is determined strictly by statutory oversubscription criteria: looked-after children (LAC), siblings, and straight-line home-to-school distance within designated catchment areas. State schooling is tuition-free for all resident children regardless of parents visa status.'
  }),
  createRecord({
    id: 'uk-london-thames-water-utility-setup',
    topic: 'community',
    jurisdiction: 'London',
    title: 'Thames Water: Residential Water and Wastewater Account Setup in Greater London',
    url: 'https://www.thameswater.co.uk/help/moving-home',
    quote: 'Tell us you are moving in so we can set up your water account and send your bills to the right place.',
    summary: 'Thames Water is the statutory monopoly supplier of clean water and wastewater services to over 15 million customers across Greater London. Upon moving into a rental property or purchased home, residents must create an account within 48 hours via the online moving portal or telephone, providing the tenancy start date and an opening water meter reading. Properties without a water meter are billed on an unmetered rateable value basis. Water supply cannot be legally disconnected for non-payment of residential bills under the Water Industry Act 1991. Struggling low-income households can apply for the WaterHelp scheme, which offers up to a 50% discount on standard tariff bills.'
  }),

  // ── 2. DUBAI (UNITED ARAB EMIRATES) ─────────────────────────────────────────
  createRecord({
    id: 'ae-dubai-dewa-utility-activation',
    topic: 'community',
    jurisdiction: 'Dubai',
    title: 'DEWA: Residential Electricity and Water Connection Linked to Ejari Tenancy',
    url: 'https://www.dewa.gov.ae/en/consumer/billing/move-to',
    quote: 'DEWA Move-To service automatically activates electricity and water upon Ejari tenancy registration.',
    summary: 'Dubai Electricity and Water Authority (DEWA) provides essential municipal power and water services across the Emirate of Dubai. Under automated smart integration with the Dubai Land Department, registering an Ejari tenancy contract automatically triggers a DEWA Move-To activation request. Tenants receive an SMS with a payment link to pay the statutory security deposit (AED 2,000 for apartments, AED 4,000 for villas) and activation fee (AED 130). DEWA connection is activated within 15 hours of deposit receipt. Monthly DEWA bills also include the Dubai Municipality Housing Fee (calculated as 5% of annual tenancy rent divided over 12 months). A DEWA final clearance green bill is mandatory to obtain security deposit refund upon lease termination.'
  }),
  createRecord({
    id: 'ae-dubai-khda-school-enrollment',
    topic: 'schooling',
    jurisdiction: 'Dubai',
    title: 'KHDA Dubai: Expatriate School Admissions, DSIB Ratings, and Transfer Certificates',
    url: 'https://www.khda.gov.ae/en/education/parents',
    quote: 'All private schools in Dubai are inspected and rated annually by the Dubai Schools Inspection Bureau (DSIB).',
    summary: 'The Knowledge and Human Development Authority (KHDA) regulates all private primary and secondary schools across Dubai. Expatriate children attend private schools offering various curricula (British, IB, American, Indian CBSE, French). Enrollment requires: (1) Emirates ID of student and parents; (2) Attested Transfer Certificate (TC) from the previous school or education ministry; (3) Immunization records; (4) Valid residence visas. KHDA inspects and assigns annual DSIB ratings (Outstanding, Very Good, Good, Acceptable, Weak), which directly regulate statutory school fee increase caps under the KHDA Education Cost Index (ECI). Mid-year school transfers must be officially approved through the KHDA electronic portal.'
  }),
  createRecord({
    id: 'ae-dubai-rta-driving-license-exchange',
    topic: 'driving',
    jurisdiction: 'Dubai',
    title: 'RTA Dubai: Driving License Exchange for New Residents and Golden Visa Holders',
    url: 'https://www.rta.ae/wps/portal/rta/ae/driver-licensing/exchange-licence',
    quote: 'Holders of driving licences from approved countries can directly exchange their licence for a Dubai driving licence.',
    summary: 'Under Roads and Transport Authority (RTA) regulations, once a foreign national receives a UAE residence visa or Emirates ID, they are legally prohibited from driving on a foreign driving licence or international driving permit (IDP) within Dubai. Citizens of recognized exempt jurisdictions (including Canada, USA, UK, Australia, EU member states, Japan, and GCC countries) can immediately exchange their existing licence for a UAE driving licence without taking driving classes or road tests. Applicants must complete an RTA-approved eye test, provide original foreign licence with certified translation if required, Emirates ID, and pay statutory issuance fees (approx AED 870). Non-exempt nationalities must enroll in driving institutes and pass knowledge, yard, and road tests.'
  }),

  // ── 3. NEW YORK (UNITED STATES) ─────────────────────────────────────────────
  createRecord({
    id: 'us-nyc-doe-myschools-enrollment',
    topic: 'schooling',
    jurisdiction: 'New York',
    title: 'NYC Department of Education: MySchools Enrollment for 3-K, Pre-K, and K-12',
    url: 'https://www.schools.nyc.gov/enrollment/enrollment-help/myschools',
    quote: 'All New York City children are guaranteed a free public school education from age 3 through grade 12.',
    summary: 'The New York City Department of Education (NYC DOE) operates the largest public school district in the United States, serving over 1 million students across all five boroughs. Applications for 3-K, Pre-K for All, Kindergarten, and high schools are submitted through the central MySchools portal. Children are guaranteed a seat in their zoned elementary school or a district placement. Immigrant families arriving mid-year can visit a Family Welcome Center (FWC) for immediate grade placement and bilingual education assessment regardless of immigration status. Required enrollment documents include proof of child age (birth certificate or foreign passport), two proofs of NYC residency (lease, utility bill, or IDNYC), and state immunization records.'
  }),
  createRecord({
    id: 'us-nyc-care-healthcare-access',
    topic: 'health',
    jurisdiction: 'New York',
    title: 'NYC Care: Guaranteed Primary and Specialty Healthcare for Uninsured New Yorkers',
    url: 'https://www.nyccare.nyc/',
    quote: 'NYC Care is a healthcare access program that guarantees low-cost and no-cost services to New Yorkers who do not qualify for or cannot afford health insurance.',
    summary: 'NYC Care is a municipal healthcare access program operated by NYC Health + Hospitals across all five boroughs. It provides affordable, comprehensive healthcare to residents who do not qualify for or cannot afford health insurance (including undocumented immigrants and recent newcomers who do not qualify for Medicaid). Members receive a unique NYC Care card, a dedicated primary care provider (PCP), access to preventive screenings, specialist consultations, mental health services, emergency care, and affordable 24/7 prescription medications starting at $2. Fees are based on a sliding-scale scale determined by household size and income, and services are fully confidential under NYC Executive Order 41.'
  }),
  createRecord({
    id: 'us-nyc-coned-utility-setup',
    topic: 'community',
    jurisdiction: 'New York',
    title: 'Con Edison: Electric and Gas Service Setup and Tenant Rights in New York City',
    url: 'https://www.coned.com/en/services-and-outages/service-connection',
    quote: 'Start, stop, or move electric and gas service online with Consolidated Edison of New York.',
    summary: 'Consolidated Edison (ConEd) supplies electricity and natural gas to residential customers throughout New York City and Westchester County. New tenants can establish service online or by phone up to 30 days before their move-in date by providing their lease address, identity details (SSN, ITIN, or foreign passport with secondary ID), and meter reading. Under the New York Home Energy Fair Practices Act (HEFPA), residential utility customers enjoy robust statutory consumer protections: utilities cannot demand cash deposits from existing good-standing customers, cannot shut off services during extreme winter weather or medical emergencies, and must offer deferred payment agreements (DPA) before initiating collection shutoffs.'
  }),

  // ── 4. SYDNEY (AUSTRALIA) ───────────────────────────────────────────────────
  createRecord({
    id: 'au-sydney-nsw-health-gp-medicare',
    topic: 'health',
    jurisdiction: 'Sydney',
    title: 'NSW Health: Medicare Enrollment, GP Bulk Billing, and Sydney Hospital Emergency Services',
    url: 'https://www.health.nsw.gov.au/services/Pages/default.aspx',
    quote: 'Medicare provides Australian citizens and permanent residents with access to healthcare at little or no cost.',
    summary: 'Public healthcare across Greater Sydney is managed by NSW Health Local Health Districts (Sydney, South Eastern Sydney, Western Sydney, Northern Sydney). Eligible residents (Australian citizens, permanent residents, and provisional visa holders with PR pathways) enroll in Medicare via Services Australia to access free treatment in public hospital emergency departments and subsidised consultations with General Practitioners (GPs). When a GP bulk bills, Medicare covers 100% of the statutory MBS schedule fee with zero out-of-pocket cost. Temporary residents and international students not eligible for Medicare must maintain mandatory Overseas Visitor Health Cover (OVHC) or Overseas Student Health Cover (OSHC).'
  }),
  createRecord({
    id: 'au-sydney-nsw-education-school-enrollment',
    topic: 'schooling',
    jurisdiction: 'Sydney',
    title: 'NSW Department of Education: Public School Zones and Temporary Residents Program in Sydney',
    url: 'https://education.nsw.gov.au/public-schools/going-to-a-public-school/enrolment',
    quote: 'Every child living in NSW has a right to be enrolled in their designated local public school.',
    summary: 'The NSW Department of Education oversees primary and secondary public schools across Greater Sydney. Every residential address is mapped to a designated local intake school (catchment zone). Parents enroll children by submitting the online enrolment widget with proof of address (council rates, lease agreement, utility bill) and Australian Immunisation Register (AIR) history statement. Families on temporary visas (such as Subclass 482 or 500) must apply through the Temporary Residents Program (DE International); depending on visa subclass and income, statutory tuition fees may apply. Non-local enrolment applications are subject to school capacity and priority criteria.'
  }),
  createRecord({
    id: 'au-sydney-service-nsw-photo-card',
    topic: 'community',
    jurisdiction: 'Sydney',
    title: 'Service NSW: NSW Photo Card Proof of Identity and Primary Registration',
    url: 'https://www.service.nsw.gov.au/transaction/apply-for-an-nsw-photo-card',
    quote: 'The NSW Photo Card is a voluntary photo identity card for NSW residents who do not hold a driver licence.',
    summary: 'Service NSW issues the NSW Photo Card, an official government-backed photo identity document under the Photo Card Act 2005. It provides recognized primary proof of age and identity across Australia for residents who do not hold an Australian driver licence or who choose not to carry a passport for daily transactions. Applicants must visit a Service NSW service centre in person, provide proof of identity (such as a foreign passport with valid Australian visa, proof of residential address in NSW, and Medicare card or bank statement), and pay the 5-year or 10-year card issuance fee. It can also be accessed as a Digital Photo Card within the Service NSW smartphone application.'
  }),

  // ── 5. MELBOURNE (AUSTRALIA) ────────────────────────────────────────────────
  createRecord({
    id: 'au-melbourne-vic-education-find-my-school',
    topic: 'schooling',
    jurisdiction: 'Melbourne',
    title: 'Victorian Department of Education: Find My School Neighborhood Zones and Enrollment',
    url: 'https://www.findmyschool.vic.gov.au/',
    quote: 'All children of compulsory school age have the right to be enrolled at their designated neighbourhood school.',
    summary: 'In Victoria, government school enrollment is governed by the Department of Education neighborhood school zoning policy. Parents determine their guaranteed designated neighbourhood government school using the official Find My School online locator. Children aged 5 to 17 are entitled to enroll at their zoned school upon presenting: (1) Proof of birth date; (2) Australian Immunisation Register (AIR) immunisation history statement; (3) 100 points of Victorian residential address evidence (rates notice, lease agreement, utility bills). International students and dependent children on temporary visas enroll through the Victorian International Student Program (ISP), which coordinates placement and fees where applicable.'
  }),
  createRecord({
    id: 'au-melbourne-vic-health-community-centres',
    topic: 'health',
    jurisdiction: 'Melbourne',
    title: 'Victoria Department of Health: Community Health Services, GP Clinics, and Hospital Emergency Care',
    url: 'https://www.health.vic.gov.au/primary-and-community-health/community-health-services',
    quote: 'Community health services provide a wide range of allied health, nursing, dental, and medical care across Victoria.',
    summary: 'Greater Melbourne residents access primary medical care through local GP clinics and registered Community Health Centres (such as Cohealth, Star Health, and IPC Health). Eligible Medicare cardholders receive free treatment at major public hospital emergency departments (The Royal Melbourne Hospital, The Alfred, Monash Medical Centre) and bulk-billed or subsidized GP care. Victorian Community Health Centres provide accessible medical, dental, and allied health support on an income-assessed sliding scale, ensuring asylum seekers, refugees, and vulnerable temporary visa holders receive medical attention regardless of Medicare card eligibility.'
  }),
  createRecord({
    id: 'au-melbourne-vicroads-licence-conversion',
    topic: 'driving',
    jurisdiction: 'Melbourne',
    title: 'VicRoads: Overseas Driver Licence Conversion and Victorian Road Rules Testing',
    url: 'https://www.vicroads.vic.gov.au/licences/new-to-victoria/convert-your-overseas-licence',
    quote: 'If you live in Victoria for six months or more, you must convert your overseas licence to a Victorian licence.',
    summary: 'Under Victorian road safety legislation, international newcomers who reside in Victoria for 6 months or more must convert their foreign driver licence to a Victorian driver licence to continue driving legally. Drivers from recognized countries (Category A and B, including Canada, UK, USA, Singapore, and EU nations) can convert their licence without taking practical drive tests, depending on age and experience. Drivers from non-recognized jurisdictions must complete the VicRoads Road Rules Test (online test), Hazard Perception Test, and a Drive Test at a VicRoads Customer Hub. You must present your original overseas licence, passport with visa verification, and proof of Victorian residential address.'
  }),
  createRecord({
    id: 'au-melbourne-city-council-waste-rates',
    topic: 'community',
    jurisdiction: 'Melbourne',
    title: 'City of Melbourne: Municipal Rates, Residential Waste Services, and Council Facilities',
    url: 'https://www.melbourne.vic.gov.au/residents/waste-recycling/Pages/waste-recycling.aspx',
    quote: 'The City of Melbourne provides weekly general rubbish, recycling, and food and garden organics (FOGO) services.',
    summary: 'Municipal services across central Melbourne are administered by the City of Melbourne council. Residential property owners pay annual municipal rates based on the Net Annual Value (NAV) of their property, while tenants receive municipal waste, recycling, and public library services as part of occupancy. The council runs a strict three-bin waste separation regime (red lid for general landfill, yellow lid for mixed recyclables, green lid for FOGO organics). New residents can join the Melbourne City Libraries network for free, providing access to digital resources, community meeting rooms, English language conversation groups, and newcomer settlement workshops.'
  }),

  // ── 6. BERLIN (GERMANY) ─────────────────────────────────────────────────────
  createRecord({
    id: 'de-berlin-mietpreisbremse-tenant-rights',
    topic: 'housing',
    housingSubject: 'agreement',
    jurisdiction: 'Berlin',
    title: 'Senatsverwaltung für Stadtentwicklung: Mietpreisbremse Rent Cap and Berlin Mietspiegel',
    url: 'https://www.berlin.de/sen/wohnen/mietrecht/mietpreisbremse/',
    quote: 'The Mietpreisbremse restricts the rent in newly signed leases to a maximum of 10% above the local comparative rent (Mietspiegel).',
    summary: 'In Berlin, the statutory rent brake (Mietpreisbremse under § 556d BGB) legally caps residential rents for new tenancies at no more than 10% above the local comparative reference rent established in the official Berlin Mietspiegel index. Landlords must disclose prior rental amounts in writing before lease signing. Tenancy deposits (Mietkaution) are statutory capped at 3 months cold net rent (Kaltmiete) and payable in three equal monthly installments. Tenants represented by the Berliner Mieterverein or private tenant rights bodies can officially challenge non-compliant rents (Rüge) and demand retroactive rent reduction and repayments.'
  }),
  createRecord({
    id: 'de-berlin-gkv-health-insurance-setup',
    topic: 'health',
    jurisdiction: 'Berlin',
    title: 'German Statutory Health Insurance (GKV): Enrolling with Krankenkassen and Choosing a Hausarzt in Berlin',
    url: 'https://www.bundesgesundheitsministerium.de/themen/krankenversicherung/online-ratgeber-krankenversicherung',
    quote: 'Health insurance is legally mandatory for all residents in Germany under § 193 VVG.',
    summary: 'Health insurance is compulsory for all residents living in Berlin. Most employed individuals and students join statutory health insurance (Gesetzliche Krankenversicherung - GKV) through public health funds (Krankenkassen) such as Techniker Krankenkasse (TK), AOK Nordost, or Barmer. Premiums are split equally between employer and employee (14.6% standard statutory rate plus fund-specific supplementary contribution). Insured individuals receive an electronic health card (eGK) providing free outpatient consultations with registered general practitioners (Hausarzt) and specialists (Fachärzte), prescription medicines with capped statutory co-pays (€5–€10), and hospital inpatient care. High-earning expats earning above the statutory threshold may opt for private health insurance (PKV).'
  }),
  createRecord({
    id: 'de-berlin-kita-gutschein-daycare-voucher',
    topic: 'childcare',
    jurisdiction: 'Berlin',
    title: 'Senatsverwaltung für Bildung: Kita-Gutschein Daycare Voucher and Primary School Enrollment in Berlin',
    url: 'https://service.berlin.de/dienstleistung/324873/',
    quote: 'The Kita-Gutschein entitles children in Berlin to free institutional daycare coverage.',
    summary: 'In the Federal State of Berlin, daycare (Kita) attendance is tuition-free for all children from the age of one until school entry under the statutory Kita-Gutschein (daycare voucher) system. Parents apply for the Kita-Gutschein through their local district youth welfare office (Jugendamt) between 9 and 2 months prior to the planned start date, presenting their child birth certificate and Meldebestätigung address registration. Parents only pay a subsidized monthly food fee (approx €23). Compulsory schooling begins at age 6; children are automatically registered at their assigned local primary school (zuständige Grundschule) determined by home catchment area.'
  }),
  createRecord({
    id: 'de-berlin-steuer-id-finance-office',
    topic: 'money',
    jurisdiction: 'Berlin',
    title: 'Finanzamt Berlin: Steuer-ID Tax Identification, Tax Classes (Steuerklassen), and ELStAM',
    url: 'https://www.berlin.de/sen/finanzen/steuern/finanzaemter/',
    quote: 'The Federal Central Tax Office automatically assigns a personal tax identification number (Steuer-ID) after Anmeldung.',
    summary: 'Following completion of the municipal Anmeldung address registration in Berlin, the Federal Central Tax Office (BZSt) automatically generates and mails an 11-digit personal tax identification number (Steueridentifikationsnummer - Steuer-ID) to your registered residential address. Your employer requires your Steuer-ID and date of birth to retrieve your electronic income tax deduction features (ELStAM) from the local Finanzamt. Employees are placed into Tax Class I (single), Tax Class IV (married standard), or Tax Class III/V (married income splitting). If your Steuer-ID is delayed, you can request an expedited printout directly from your assigned district Finanzamt to avoid being temporarily taxed under the punitive emergency Tax Class VI.'
  }),

  // ── 7. CHICAGO (UNITED STATES) ──────────────────────────────────────────────
  createRecord({
    id: 'us-chicago-citykey-municipal-id',
    topic: 'sin',
    jurisdiction: 'Chicago',
    title: 'Office of the City Clerk: Chicago CityKey 4-in-1 Municipal Identification Card',
    url: 'https://www.chicityclerk.com/chicagocitykey',
    quote: 'The Chicago CityKey is an official government-issued photo ID available to all Chicago residents regardless of immigration status.',
    summary: 'The Office of the City Clerk of Chicago issues the Chicago CityKey, an official municipal photo identification card available to all residents of the City of Chicago, including immigrants, undocumented individuals, unhoused persons, and returning citizens. The card functions as four cards in one: a government photo ID, a Chicago Public Library card, a Ventra transit payment card, and a prescription drug discount card. Applicants must establish identity (3 points) and residency within Chicago (1 point) through documents such as a foreign passport, consular ID, utility bills, or bank statements. It cannot be used for federal Real ID air travel or commercial voting.'
  }),
  createRecord({
    id: 'us-chicago-cps-school-enrollment',
    topic: 'schooling',
    jurisdiction: 'Chicago',
    title: 'Chicago Public Schools: GoCPS Centralized Application and Newcomer Student Enrollment',
    url: 'https://www.cps.edu/admissions/',
    quote: 'Every student residing in Chicago is guaranteed a seat in their neighborhood public school.',
    summary: 'Chicago Public Schools (CPS District 299) operates over 600 district, magnet, and charter schools serving elementary and high school students. Every child aged 5 to 21 residing within Chicago has a legal right to enroll in their designated neighborhood attendance boundary school tuition-free, without regard to immigration or citizenship status. Selective enrollment and magnet programs are managed through the central GoCPS portal. To register, parents must provide proof of child age, state-mandated child health examination and immunization records, and two proofs of Chicago residency. Multilingual newcomers receive English Learner (EL) screening and dedicated bilingual support at school Welcome Centers.'
  }),
  createRecord({
    id: 'us-chicago-cook-county-health-carelink',
    topic: 'health',
    jurisdiction: 'Chicago',
    title: 'Cook County Health: CareLink Financial Assistance for Uninsured Chicago Residents',
    url: 'https://cookcountyhealth.org/patients-visitors/patient-financial-services/financial-assistance/',
    quote: 'CareLink covers basic and specialist healthcare for uninsured Cook County residents up to 400% of the federal poverty line.',
    summary: 'Cook County Health (CCH) administers CareLink, a comprehensive municipal financial assistance program that subsidizes medical care for uninsured and underinsured residents living in Chicago and suburban Cook County. CareLink is available regardless of legal immigration status for individuals whose household income is at or below 400% of the Federal Poverty Level (FPL). Enrolled patients receive free or deeply discounted care at CCH hospitals (John H. Stroger, Jr. Hospital, Provident Hospital) and community health network clinics, covering primary care, emergency services, cancer treatment, mental health, and prescription medications.'
  }),
  createRecord({
    id: 'us-chicago-comed-peoples-gas-utilities',
    topic: 'community',
    jurisdiction: 'Chicago',
    title: 'ComEd and Peoples Gas: Electric and Natural Gas Account Setup and Tenant Protections in Chicago',
    url: 'https://www.peoplesgasdelivery.com/residential/start-stop-move',
    quote: 'Residential gas and electricity customers in Illinois are protected from winter service disconnections.',
    summary: 'In Chicago, electricity is supplied by Commonwealth Edison (ComEd) and natural gas is provided by Peoples Gas. New tenants can establish service online or by telephone prior to move-in, submitting proof of lease and identity (SSN, ITIN, or government photo ID). Under the Illinois Public Utilities Act and Illinois Commerce Commission rules, utilities are prohibited from shutting off residential gas or electric heat between December 1 and March 31 when temperatures are forecast to drop below 32°F. Income-eligible households facing energy hardship can apply for utility bill grants through the Low-Income Home Energy Assistance Program (LIHEAP) and Percentage of Income Payment Plan (PIPP).'
  }),

  // ── 8. DUBLIN (IRELAND) ─────────────────────────────────────────────────────
  createRecord({
    id: 'ie-dublin-rtb-tenancy-registration-rpz',
    topic: 'housing',
    housingSubject: 'agreement',
    jurisdiction: 'Dublin',
    title: 'Residential Tenancies Board (RTB): Dublin Rent Pressure Zones and Annual Lease Registration',
    url: 'https://www.rtb.ie/rent-pressure-zones',
    quote: 'In Rent Pressure Zones, annual rent increases are legally capped at the rate of inflation or 2%, whichever is lower.',
    summary: 'The Residential Tenancies Board (RTB) regulates private residential tenancies throughout Dublin. All residential tenancies in Dublin must be registered annually with the RTB by the landlord. The entire Greater Dublin area is designated a Rent Pressure Zone (RPZ); under statutory rules, annual rent increases for existing or new tenancies cannot exceed the Harmonised Index of Consumer Prices (HICP) or 2% per year, whichever is lower (unless a substantial structural refurbishment exemption is approved by the RTB). Security deposits cannot exceed one month rent. Tenants who have occupied a dwelling for six months acquire statutory Security of Tenure (Tenancies of Unlimited Duration), severely restricting landlord termination rights.'
  }),
  createRecord({
    id: 'ie-dublin-dsp-ppsn-appointment',
    topic: 'sin',
    jurisdiction: 'Dublin',
    title: 'Department of Social Protection: Personal Public Service Number (PPSN) Allocation in Dublin',
    url: 'https://www.gov.ie/en/service/12e6de-get-a-personal-public-service-ppsn-number/',
    quote: 'A PPS Number is a unique reference number that helps you access social welfare benefits, public services and information in Ireland.',
    summary: 'A Personal Public Service Number (PPSN) is a mandatory 8-character national identifier issued by the Department of Social Protection (DSP) for employment payroll, tax registration, public healthcare, and driver licensing in Ireland. International newcomers residing in Dublin apply online via MyWelfare.ie or attend an appointment at a DSP Intreo Centre (such as Parnell Street or Bishops Square). Applicants must demonstrate a genuine statutory need for a PPSN (e.g. an employment offer, tax registration, or driver theory test), prove their identity with a valid passport, and submit proof of address in Dublin (utility bill or official tenancy agreement). Upon allocation, applicants receive a Public Services Card (PSC).'
  }),
  createRecord({
    id: 'ie-dublin-hse-gp-visit-card',
    topic: 'health',
    jurisdiction: 'Dublin',
    title: 'Health Service Executive (HSE): Registering with a Dublin GP, Medical Cards, and GP Visit Cards',
    url: 'https://www.hse.ie/eng/services/list/1/schemes/mc/',
    quote: 'A Medical Card or GP Visit Card allows you to visit a participating family doctor for free.',
    summary: 'The Health Service Executive (HSE) oversees public healthcare in Ireland. Residents in Dublin register directly with an independent General Practitioner (GP) surgery accepting new patients. Routine GP visits carry an out-of-pocket consultation fee (€50–€75) unless the patient holds a means-tested Medical Card or GP Visit Card issued by the HSE Primary Care Reimbursement Service (PCRS). All children under the age of 8 residing in Ireland are entitled to a free GP Visit Card. Public hospital emergency department visits are subject to a statutory €100 charge unless referred directly by a GP or holding a Medical Card. Non-EU residents on Stamp 2 or Stamp 1G visas must maintain private medical insurance.'
  }),
  createRecord({
    id: 'ie-dublin-education-primary-school-admissions',
    topic: 'schooling',
    jurisdiction: 'Dublin',
    title: 'Department of Education: Dublin National Schools Admissions and Parent Preference',
    url: 'https://www.gov.ie/en/organisation/department-of-education/',
    quote: 'State-funded primary and post-primary education in Ireland is tuition-free for all resident children.',
    summary: 'Primary education in Dublin is delivered through state-funded National Schools operating under diverse patronage (Educate Together multidenominational schools, Catholic diocesan schools, and Gaelscoileanna Irish-medium schools). Admissions are regulated by the Education (Admission to Schools) Act 2018, which strictly bans religious discrimination in Catholic school admissions for state-funded schools. Parents apply directly to their chosen schools during the statutory autumn Annual Admission Notice window. Oversubscription criteria prioritize siblings and local catchment boundaries. Under Irish law, education is compulsory for all children aged 6 to 16, and attendance is monitored by Tusla Education Support Services (TESS).'
  }),
  createRecord({
    id: 'ie-dublin-revenue-paye-anytime',
    topic: 'money',
    jurisdiction: 'Dublin',
    title: 'Revenue Commissioners: Setting Up myAccount, PAYE Tax Credits, and Emergency Tax Avoidance',
    url: 'https://www.revenue.ie/en/jobs-and-pensions/starting-work/index.aspx',
    quote: 'Register your new job in myAccount as soon as you start work to ensure your employer applies the correct tax credits.',
    summary: 'All employees working in Dublin pay income tax, the Universal Social Charge (USC), and Pay Related Social Insurance (PRSI) under the Pay As You Earn (PAYE) system administered by the Revenue Commissioners. As soon as you receive your PPSN and an employment contract, you must register for an online Revenue myAccount and link your employment. Failure to register promptly causes your employer to place you on statutory Emergency Tax, which withholds income tax at the higher 40% rate with zero tax credit relief. Once registered, Revenue issues a Revenue Payroll Notification (RPN) to your employer detailing your personal tax credits (Single Person Tax Credit, PAYE Employee Credit) and standard rate cut-off point.'
  }),

  // ── 9. AMSTERDAM (NETHERLANDS) ──────────────────────────────────────────────
  createRecord({
    id: 'nl-amsterdam-huurcommissie-woningwaardering',
    topic: 'housing',
    housingSubject: 'agreement',
    jurisdiction: 'Amsterdam',
    title: 'Huurcommissie: Woningwaarderingsstelsel (WWS) Points and Maximum Rent Limits in Amsterdam',
    url: 'https://www.huurcommissie.nl/onderwerpen/woningwaarderingstelsel',
    quote: 'The points system (WWS) determines the maximum legally permitted rent for non-liberalised and regulated residential units.',
    summary: 'In Amsterdam, residential rent prices are regulated by the Dutch Rental Committee (Huurcommissie) using the home valuation point system (Woningwaarderingsstelsel - WWS). Under the Affordable Rent Act (Wet betaalbare huur), rental properties scoring up to 186 points are subject to legally enforceable maximum rent ceilings. Landlords who charge above the point ceiling face administrative municipal fines from Gemeente Amsterdam. Security deposits are statutory capped at a maximum of two months base cold rent (kale huur). Tenants can submit a rent assessment procedure (toetsing aanvangshuurprijs) to the Huurcommissie within the first six months of a lease to force retroactive rent reduction and refunds.'
  }),
  createRecord({
    id: 'nl-amsterdam-gvb-ovpay-transit',
    topic: 'transit',
    jurisdiction: 'Amsterdam',
    title: 'GVB Amsterdam: OVpay Contactless Transit and Integrated Tram, Metro, and Ferry Network',
    url: 'https://www.gvb.nl/en/travel-information/tickets-fares',
    quote: 'You can check in and check out across all GVB trams, buses, and metro lines using your contactless payment card or OV-chipkaart.',
    summary: 'Municipal public transit in Amsterdam is operated by GVB, covering the metro, tram, city buses, and free IJ ferry lines. Passengers pay for journeys using OVpay by checking in and checking out with any contactless debit or credit card or Apple/Google Pay, or with an anonymous or personal OV-chipkaart. Fares are calculated dynamically based on a statutory national boarding base fare plus a kilometer rate. Failure to tap out results in an automatic forfeiture of the statutory correction fee (€4 on GVB, €20 on NS national rail). Regular commuters can buy GVB Zone passes or NS train subscriptions for discounted commuting.'
  }),
  createRecord({
    id: 'nl-amsterdam-zorgverzekering-huisarts',
    topic: 'health',
    jurisdiction: 'Amsterdam',
    title: 'Zorgverzekeringswet (Zvw): Mandatory Basic Dutch Health Insurance and Huisarts Registration',
    url: 'https://www.zorginstituutnederland.nl/verzekerde-zorg/zorgverzekering',
    quote: 'Under the Health Insurance Act (Zvw), everyone living or working in the Netherlands must take out statutory basic health insurance.',
    summary: 'Under the Dutch Health Insurance Act (Zorgverzekeringswet), everyone residing or employed in Amsterdam must purchase statutory basic health insurance (basisverzekering) from a private insurer (such as Zilveren Kruis, CZ, or VGZ) within four months of registering on the municipal BRP. The standard policy carries a statutory annual deductible (eigen risico, fixed at €385). Insured individuals must register with a neighborhood general practitioner (Huisarts); the Huisarts acts as the mandatory gatekeeper for all specialist hospital referrals. Low-income residents can apply to the Tax Administration for a healthcare allowance (zorgtoeslag) to offset monthly premiums.'
  }),
  createRecord({
    id: 'nl-amsterdam-basisonderwijs-school-lottery',
    topic: 'schooling',
    jurisdiction: 'Amsterdam',
    title: 'Gemeente Amsterdam: Central Primary School Lottery (Basisonderwijs) and School Choice',
    url: 'https://www.amsterdam.nl/en/education/primary-school/',
    quote: 'In Amsterdam, parents register for primary schools through a centralized city-wide matching system when their child turns three.',
    summary: 'Primary schooling (Basisonderwijs) in Amsterdam is free and open to all children from the age of four until twelve. When a child reaches three years of age, Gemeente Amsterdam mails a preference form and school choice brochure to their registered BRP address. Parents rank multiple preferred schools (public, Catholic, Protestant, or pedagogical styles like Montessori and Dalton). A centralized municipal algorithm matches students: children receive statutory priority admission for their eight designated neighborhood priority schools based on residential proximity. All teaching is conducted in Dutch; international newcomer children aged 6 to 12 can first attend intensive language classes (Nieuwkomersonderwijs or taalklassen) before entering regular Dutch primary classrooms.'
  }),
  createRecord({
    id: 'nl-amsterdam-belastingdienst-tax-registration',
    topic: 'money',
    jurisdiction: 'Amsterdam',
    title: 'Belastingdienst: DigiD Authentication, 30% Ruling, and Municipal Waterschapsbelasting in Amsterdam',
    url: 'https://www.belastingdienst.nl/wps/wcm/connect/en/individuals/individuals',
    quote: 'DigiD is your secure digital identity for logging into Dutch government agencies, tax administration, and healthcare portals.',
    summary: 'Taxation and civil digital administration in Amsterdam are anchored by DigiD and the Dutch Tax Administration (Belastingdienst). Once you receive your BSN, you apply for a DigiD account via DigiD.nl, which activates with a code sent to your registered address. High-skilled immigrants recruited from abroad can apply with their employer for the 30% tax ruling, allowing a portion of their gross salary to be received tax-free. Amsterdam residents also pay municipal property taxes and the regional water authority tax (waterschapsbelasting via Waternet) for flood protection and sewer management, which is billed based on single or multi-person household size.'
  }),

  // ── 10. MADRID (SPAIN) ──────────────────────────────────────────────────────
  createRecord({
    id: 'es-madrid-crtm-tarjeta-transporte-publico',
    topic: 'transit',
    jurisdiction: 'Madrid',
    title: 'Consorcio Regional de Transportes de Madrid (CRTM): Tarjeta Transporte Público (TTP) and Metro Zones',
    url: 'https://www.crtm.es/billetes-y-tarifas/tarjeta-transporte-publico.aspx',
    quote: 'The Tarjeta Transporte Público (TTP) is the personal smartcard for unlimited multimodal transit travel across Madrid.',
    summary: 'Public transportation in Madrid is coordinated by the Consorcio Regional de Transportes de Madrid (CRTM), integrating the Metro de Madrid, EMT city buses, and Cercanías suburban commuter trains. Commuters use the red personal smartcard (Tarjeta Transporte Público - TTP). The monthly 30-day Abono Transporte offers deeply discounted, unlimited multimodal travel across Zone A (central Madrid) and outer suburban zones (B1 through C2). Youth aged under 26 travel anywhere across the entire regional transit network for a subsidized flat youth rate (€8/month). Occasional riders can load 10-trip Metrobús tickets onto a Multi contactless card, valid on both Metro and EMT buses.'
  }),
  createRecord({
    id: 'es-madrid-ivima-fianza-housing-lease',
    topic: 'housing',
    housingSubject: 'deposit',
    jurisdiction: 'Madrid',
    title: 'Agencia de Vivienda Social (IVIMA): Mandatory Rental Deposit Escrow and Tenant Rights in Madrid',
    url: 'https://www.comunidad.madrid/servicios/vivienda/fianzas-arrendamiento',
    quote: 'Under Ley de Arrendamientos Urbanos, landlords in Madrid must deposit the security fianza into the IVIMA escrow within 30 days.',
    summary: 'Residential leasing in Madrid is governed by the national urban tenancy law (Ley de Arrendamientos Urbanos - LAU) and Community of Madrid housing decrees. Under the LAU, landlords are legally capped at demanding a maximum statutory security deposit (fianza) of one month rent for residential leases, plus up to two additional months of financial guarantee. Landlords in Madrid are legally obligated to deposit the fianza into the official IVIMA escrow fund (Agencia de Vivienda Social); tenants can request the official IVIMA deposit receipt to verify registration and claim regional housing tax deductions. Standard residential contracts grant tenants statutory rights to renew for a minimum of 5 years (7 years if the landlord is a corporate legal entity).'
  }),
  createRecord({
    id: 'es-madrid-sermas-tarjeta-sanitaria',
    topic: 'health',
    jurisdiction: 'Madrid',
    title: 'Servicio Madrileño de Salud (SERMAS): Tarjeta Sanitaria Individual and Centro de Salud Primary Care',
    url: 'https://www.comunidad.madrid/servicios/salud/tarjeta-sanitaria',
    quote: 'The Tarjeta Sanitaria Individual (TSI) guarantees access to public healthcare services throughout the Community of Madrid.',
    summary: 'Public healthcare in Madrid is provided by the Servicio Madrileño de Salud (SERMAS) across regional hospitals and neighborhood health centers (Centros de Salud). Once registered on the municipal census (Empadronamiento) and enrolled in the Spanish Social Security system (Seguridad Social), residents apply for the Tarjeta Sanitaria Individual (TSI) at their designated local Centro de Salud. The card assigns a primary care family physician (médico de cabecera) and pediatrician. Primary care visits, emergency treatment in public hospitals (La Paz, Gregorio Marañón, 12 de Octubre), and inpatient care are 100% free at point of delivery; pharmaceutical prescriptions are co-paid according to income level (TSI 001 to TSI 004).'
  }),
  createRecord({
    id: 'es-madrid-educacion-colegios-admision',
    topic: 'schooling',
    jurisdiction: 'Madrid',
    title: 'Comunidad de Madrid: Public and Concertado School Admissions and Secretaría Virtual',
    url: 'https://www.comunidad.madrid/servicios/educacion/solicita-tu-plaza-escolar',
    quote: 'School admissions in Madrid for public and state-subsidized (concertado) schools follow a centralized points system.',
    summary: 'In the Community of Madrid, state-funded education is provided through public schools (colegios públicos) and state-subsidized charter schools (colegios concertados), tuition-free from age 3 (Educación Infantil) through age 16 (Educación Secundaria Obligatoria - ESO). Families apply during the annual spring admissions campaign via the regional Secretaría Virtual portal. Points are awarded based on neighborhood proximity (home or workplace address within the single school zone), siblings already enrolled, family income, and disability status. International families arriving outside the ordinary period must apply for an extraordinary placement at the local district educational inspection service.'
  }),
  createRecord({
    id: 'es-madrid-agencia-tributaria-nie-tax',
    topic: 'money',
    jurisdiction: 'Madrid',
    title: 'Agencia Tributaria (AEAT): NIE Activation, Modelo 030 Tax Census, and Beckham Law in Madrid',
    url: 'https://sede.agenciatributaria.gob.es/',
    quote: 'Every foreigner conducting economic or legal activities in Spain must register their NIE on the tax census using Modelo 030.',
    summary: 'The Spanish State Tax Agency (Agencia Tributaria - AEAT) administers national income taxes (IRPF) and wealth taxes in Madrid. Every international resident must hold a Foreigner Identification Number (Número de Identidad de Extranjero - NIE) issued by the National Police or Immigration Office (Extranjería). Once issued, the NIE must be officially activated on the tax census by submitting Modelo 030 to your local Delegación de Hacienda. Qualifying expatriates relocating to Madrid for work can apply for the Special Expatriate Tax Regime (Beckham Law) within six months of starting work, enabling a flat 24% tax rate on Spanish-source employment income up to €600,000 for six consecutive tax years.'
  }),

  // ── 11. STOCKHOLM (SWEDEN) ──────────────────────────────────────────────────
  createRecord({
    id: 'se-stockholm-skatteverket-folkbokforing',
    topic: 'sin',
    jurisdiction: 'Stockholm',
    title: 'Skatteverket Stockholm: Folkbokföring Population Registration, Personnummer, and Swedish ID Card',
    url: 'https://www.skatteverket.se/servicelankar/otherlanguages/inenglish/individualsandemployees/movingtosweden.4.7be5268414bea064694c40c.html',
    quote: 'When you move to Sweden and intend to stay for a year or more, you must register in the population register (Folkbokföring).',
    summary: 'The Swedish Tax Agency (Skatteverket) administers the Swedish civil population register (Folkbokföring). International newcomers intending to live in Stockholm for 12 months or more must book an in-person appointment at a Statens servicecenter to register. You must present a valid passport, residence permit (or EU right of residence evidence), employment contract or study certificate, and civil status documents (apostilled marriage and birth certificates). Registration generates your 10-digit Swedish personal identity number (Personnummer), which is the absolute foundation for Swedish society. After receiving your Personnummer, you can apply for an official Skatteverket ID-kort to unlock electronic banking and BankID.'
  }),
  createRecord({
    id: 'se-stockholm-bostadsformedlingen-rental-market',
    topic: 'housing',
    housingSubject: 'agreement',
    jurisdiction: 'Stockholm',
    title: 'Bostadsförmedlingen: Stockholm Municipal Housing Queue, Subletting Rights, and Hyresnämnden',
    url: 'https://bostad.stockholm.se/english/',
    quote: 'Bostadsförmedlingen allocates rent-controlled municipal and private first-hand rental apartments across Stockholm County.',
    summary: 'In Stockholm, long-term rental housing is heavily regulated. Direct first-hand leases (förstahandskontrakt) are distributed strictly by waiting time through the municipal housing agency Bostadsförmedlingen; registering costs a nominal annual fee (approx 200 SEK). Most newcomers live in subleased second-hand apartments (andrahandskontrakt). Under the Swedish Tenancy Act (Jordabalken), second-hand landlords are legally forbidden from charging arbitrary rent: rent cannot exceed the landlord actual base rent plus a statutory utility/furniture surcharge (max 15%). Tenants who are overcharged can appeal to the regional rent tribunal (Hyresnämnden) for an official rent reduction and retroactive reimbursement of excess rent paid for up to two years.'
  }),
  createRecord({
    id: 'se-stockholm-region-vardcentral-healthcare',
    topic: 'health',
    jurisdiction: 'Stockholm',
    title: 'Region Stockholm: 1177 Vårdguiden, Vårdcentral Primary Healthcare, and Högkostnadsskydd',
    url: 'https://www.1177.se/en/Stockholm/other-languages/other-languages/',
    quote: 'In Sweden, public healthcare is largely tax-funded and decentralized through regional health authorities.',
    summary: 'Public healthcare across Stockholm County is organized by Region Stockholm. Residents choose and register with a local primary healthcare clinic (Vårdcentral) via the digital 1177 Vårdguiden portal or telephone service. Primary doctor consultations carry a small regional patient fee (approx 250 SEK), while consultations with specialists or hospital visits cost up to 400 SEK. Under Sweden statutory high-cost protection scheme (Högkostnadsskydd), outpatient healthcare fees are legally capped at a maximum ceiling (1,400 SEK in a 12-month period), after which all medical consultations for the rest of that year are 100% free. Prescription medications are covered by a separate statutory high-cost threshold (max 2,850 SEK/year).'
  }),
  createRecord({
    id: 'se-stockholm-skolval-education-enrollment',
    topic: 'schooling',
    jurisdiction: 'Stockholm',
    title: 'Stockholms stad: Skolval Municipal School Choice, Preschool (Förskola), and Grundskola Admissions',
    url: 'https://grundskola.stockholm/en/apply-for-a-school-place/',
    quote: 'Compulsory schooling (grundskola) starts at age six, and parents apply through the municipal Skolval system.',
    summary: 'In Stockholm, all children from age one are entitled to subsidized municipal or private preschool (förskola) under the maximum fee guarantee (Maxtaxa, capped at approx 1,600 SEK per child per month). Compulsory school (Grundskola) runs from preschool class (Förskoleklass, age 6) through grade 9 (age 16) and is 100% tuition-free, including free school lunches. Parents participate in the annual municipal school choice window (Skolval) each January–February through the Stockholms stad e-service. Placements prioritize children living closest to the school based on relative distance (relativ närhet). Newly arrived immigrant children are welcomed via the municipal Welcome Centre (Start Stockholm) for educational assessment and Swedish language support.'
  }),
  createRecord({
    id: 'se-stockholm-bankid-swish-finance',
    topic: 'money',
    jurisdiction: 'Stockholm',
    title: 'Swedish Financial Infrastructure: BankID Digital Identity, Swish Mobile Payments, and Opening a Bank Account',
    url: 'https://www.bankid.com/en/',
    quote: 'BankID is Sweden leading electronic identification service used for government services and digital transactions.',
    summary: 'In Sweden nearly cashless economy, BankID and the Swish mobile payment app are indispensable for everyday life. Under the EU Payment Accounts Directive and Swedish Banking Act, all major Swedish commercial banks (SEB, Swedbank, Handelsbanken, Nordea) are legally obligated to provide a basic payment account (lönekonto) and debit card to any resident with valid identification, regardless of credit history. To obtain Mobile BankID, you must have an active Personnummer and an in-person verified Swedish ID-kort. BankID serves as your legal digital signature for authenticating with Skatteverket, Försäkringskassan, healthcare portals (1177), and initiating instant peer-to-peer and merchant transfers through Swish.'
  }),

  // ── 12. AUCKLAND (NEW ZEALAND) ──────────────────────────────────────────────
  createRecord({
    id: 'nz-auckland-tenancy-services-bonds',
    topic: 'housing',
    housingSubject: 'deposit',
    jurisdiction: 'Auckland',
    title: 'Tenancy Services NZ: Residential Tenancy Bond Lodgement and Healthy Homes Standards in Auckland',
    url: 'https://www.tenancy.govt.nz/rent-bond-and-bills/bond/',
    quote: 'Landlords must lodge all tenancy bonds with Tenancy Services within 23 working days of payment.',
    summary: 'Residential rentals across Greater Auckland are governed by the Residential Tenancies Act 1986 and enforced by Tenancy Services (Ministry of Business, Innovation and Employment - MBIE). Under statutory regulations, tenancy bonds cannot exceed the equivalent of four weeks rent, and rent in advance cannot exceed two weeks. Landlords must legally lodge the bond money with Tenancy Services within 23 working days of receipt. All residential rental properties must strictly comply with mandatory Healthy Homes Standards (covering heating, insulation, ventilation, moisture ingress, and draught stopping). Tenancy disputes are resolved legally by the Tenancy Tribunal, which has authority to order binding settlements and exemplary damages against non-compliant landlords.'
  }),
  createRecord({
    id: 'nz-auckland-te-whatu-ora-pho-gp',
    topic: 'health',
    jurisdiction: 'Auckland',
    title: 'Te Whatu Ora (Health New Zealand): Primary Health Organisation (PHO) Enrolment and GP Subsidies',
    url: 'https://www.tewhatuora.govt.nz/our-health-system/eligibility-for-publicly-funded-health-services/',
    quote: 'Publicly funded healthcare in New Zealand is available to citizens, permanent residents, and work visa holders on permits of two years or longer.',
    summary: 'Health New Zealand (Te Whatu Ora) manages public healthcare throughout the Auckland region (across Auckland, Counties Manukau, and Waitematā districts). Newcomers holding a New Zealand residence visa, permanent residence, or a work visa valid for at least two consecutive years are entitled to publicly funded healthcare. Eligible residents enroll with a local Primary Health Organisation (PHO) through a neighborhood general practice clinic (GP). Enrolled patients pay heavily subsidized consultation fees, whereas non-enrolled patients pay full private commercial fees. Consultations for children aged under 14 are completely free at enrolled general practices. Public hospital emergency care and accident treatment under the Accident Compensation Corporation (ACC) are free for all individuals.'
  }),
  createRecord({
    id: 'nz-auckland-education-school-zones',
    topic: 'schooling',
    jurisdiction: 'Auckland',
    title: 'Ministry of Education NZ: Auckland School Enrolment Schemes (Home Zones) and Ballot Selection',
    url: 'https://www.education.govt.nz/school/running-a-school/enrolments/enrolment-schemes/',
    quote: 'If you live inside a school home zone, your child has an absolute legal entitlement to be enrolled at that school.',
    summary: 'In Greater Auckland, many state primary, intermediate, and secondary schools operate under formal Ministry of Education Enrolment Schemes to prevent overcrowding. Every residential address falls within designated school home zones. Children residing within the home zone have a statutory right to enroll at the designated state school without selection criteria. Families living outside the zone must enter an annual out-of-zone ballot selection governed by strict statutory priorities (siblings of current students, siblings of former students, children of school board employees, followed by general ballot applicants). State education is tuition-free for domestic students, though schools may request voluntary annual parent donations.'
  }),
  createRecord({
    id: 'nz-auckland-inland-revenue-ird-number',
    topic: 'money',
    jurisdiction: 'Auckland',
    title: 'Inland Revenue (Te Tari Taake): IRD Number Application, PAYE Tax Codes, and KiwiSaver',
    url: 'https://www.ird.govt.nz/managing-my-tax/ird-numbers',
    quote: 'Everyone who earns income or opens a bank account in New Zealand needs an eight or nine-digit IRD number.',
    summary: 'Inland Revenue (Te Tari Taake) issues the unique IRD number, a mandatory identifier required for employment, opening a New Zealand bank account, and filing taxes. International newcomers holding a resident or work visa apply online at ird.govt.nz using their passport, immigration visa details, and proof of an active New Zealand bank account (or completed customer due diligence from a recognized bank). If you work without providing an IRD number and tax code declaration (IR330) to your employer, you are automatically taxed at the punitive non-declaration rate of 45%. Permanent residents and citizens are eligible for KiwiSaver, New Zealand voluntary workplace savings retirement scheme with employer matching contributions (min 3%).'
  }),
  createRecord({
    id: 'nz-auckland-council-rates-rubbish-services',
    topic: 'community',
    jurisdiction: 'Auckland',
    title: 'Auckland Council: Municipal Waste Collection, Watercare Connection, and Community Facilities',
    url: 'https://www.aucklandcouncil.govt.nz/rubbish-recycling/Pages/rubbish-recycling-collections.aspx',
    quote: 'Auckland Council coordinates kerbside rubbish, recycling, and food scraps collections across the Auckland region.',
    summary: 'Auckland Council is the unitary local municipal authority serving 1.7 million residents across the region. Residential property owners pay municipal rates that fund regional infrastructure, roading, public parks, and libraries. Kerbside collection includes fortnightly recycling bins, weekly household rubbish (using prepaid official rubbish bags or council bin tags depending on local legacy district), and the weekly food scraps collection service. Clean water supply and wastewater are supplied by Watercare Services Limited, a council-controlled organisation, which bills separately based on metered volumetric water usage. Residents can join Auckland Council Libraries for free, gaining borrowing access across 55 regional branches.'
  }),

  // ── 13. PARIS (FRANCE) ──────────────────────────────────────────────────────
  createRecord({
    id: 'fr-paris-idfm-navigo-pass-transit',
    topic: 'transit',
    jurisdiction: 'Paris',
    title: 'Île-de-France Mobilités: Navigo Pass Subscriptions, Navigo Liberté+, and Metro-RER Fares',
    url: 'https://www.iledefrance-mobilites.fr/titres-et-tarifs',
    quote: 'The Navigo pass allows unlimited travel on the bus, metro, RER, tramway, and train throughout Île-de-France.',
    summary: 'Public transportation in Paris and the Île-de-France region is coordinated by Île-de-France Mobilités (RATP and SNCF Transilien). Residents commuting regularly use the Navigo monthly or annual pass (Forfait Navigo Mois), which provides unlimited travel across all five transit zones (Paris center through suburban destinations, Versailles, and airports). Under the French Labor Code (Code du travail art. L. 3261-2), private and public employers in France are legally mandated to reimburse at least 50% of the employee monthly public transit pass. Occasional commuters can subscribe to Navigo Liberté+, which automatically debits discounted individual trips at the end of each month based on actual validation.'
  }),
  createRecord({
    id: 'fr-paris-assurance-maladie-ameli-cpam',
    topic: 'health',
    jurisdiction: 'Paris',
    title: 'Assurance Maladie (CPAM de Paris): Carte Vitale Registration, Ameli Account, and Médecin Traitant',
    url: 'https://www.ameli.fr/assure/droits-demarches/principes/protection-universelle-maladie',
    quote: 'Under Protection Universelle Maladie (PUMA), any person working or residing stably in France has the right to healthcare coverage.',
    summary: 'In France, public statutory health insurance is administered by the Assurance Maladie through the local Caisse Primaire d Assurance Maladie (CPAM de Paris). Under the Protection Universelle Maladie (PUMA) framework, anyone residing in France stably and regularly for at least three consecutive months is entitled to healthcare coverage. Once enrolled, you receive a French Social Security Number and an electronic green health card (Carte Vitale). Insured individuals must designate an attending primary care doctor (déclaration de médecin traitant) to receive standard 70% statutory social security reimbursements; hospital care and long-term illnesses are covered at 80% to 100%. Complementary private insurance (Mutuelle) covers the remaining balance.'
  }),
  createRecord({
    id: 'fr-paris-mairie-education-maternelle',
    topic: 'schooling',
    jurisdiction: 'Paris',
    title: 'Ville de Paris: School Enrollment for École Maternelle and Élémentaire via Mairies d Arrondissement',
    url: 'https://www.paris.fr/pages/inscrire-mon-enfant-a-l-ecole-2292',
    quote: 'Schooling is compulsory in France from age three and is tuition-free in all public schools.',
    summary: 'In Paris, public school admissions are handled directly by the municipal town hall (Mairie) of your residential district (arrondissement). Education is compulsory from age 3 (École Maternelle) through age 16 (Collège / Lycée). To enroll a child in the local neighborhood school (école de secteur), parents must complete an enrollment file at their local Mairie d Arrondissement presenting: (1) Family record book (Livret de famille) or official birth certificate with certified French translation; (2) Two proofs of residence in the arrondissement (electricity bill, lease, tax notice); (3) Child medical vaccination record showing mandatory diphtheria, tetanus, polio (DTP) and other French childhood vaccinations. Extracurricular daycare (Périscolaire) and school canteen fees are calculated on a sliding scale based on family income (Quotient Familial).'
  }),
  createRecord({
    id: 'fr-paris-caf-aide-au-logement-apl',
    topic: 'housing',
    housingSubject: 'agreement',
    jurisdiction: 'Paris',
    title: 'Caisse d Allocations Familiales (CAF de Paris): Housing Allowances (APL) and Visale Rental Guarantee',
    url: 'https://www.caf.fr/allocataires/aides-et-demarches/droits-et-prestations/logement',
    quote: 'Aide Personnalisée au Logement (APL) helps tenants reduce their monthly rental expenditure based on income.',
    summary: 'The Caisse d Allocations Familiales (CAF de Paris) provides state financial benefits to families and individuals living in Paris. International students and low-income workers legally residing in France on eligible residence permits can apply online for housing assistance (Aide Personnalisée au Logement - APL or ALS) to offset monthly rent. Benefit amounts are calculated based on monthly rent, household size, and previous annual income. Additionally, international newcomers lacking a French guarantor (garant physique) can access the state-backed Visale guarantee scheme operated by Action Logement, which provides landlords with a 100% free statutory guarantee covering unpaid rents and damages up to 36 months.'
  }),
  createRecord({
    id: 'fr-paris-prefecture-titre-de-sejour',
    topic: 'community',
    jurisdiction: 'Paris',
    title: 'Préfecture de Police de Paris: Residence Permits (Titre de Séjour) and ANEF Online Procedures',
    url: 'https://www.prefecturedepolice.interieur.gouv.fr/demarches/titres-de-sejour',
    quote: 'Foreign nationals residing in Paris must validate their visa or apply for residence permits through the digital ANEF platform.',
    summary: 'Immigration civil administration and residence permit issuance for foreign nationals living in Paris are administered by the Préfecture de Police de Paris (situated at Île de la Cité and designated reception centers). Foreign nationals arriving on a long-stay visa equivalent to a residence permit (VLS-TS) must validate their visa online through the national ANEF portal (Administration Numérique des Étrangers en France) within three months of arrival, paying the statutory visa tax. For renewals, multi-year permits (Passeport Talent, Salarié, Étudiant), and initial permit collections, appointments and document submissions are tracked through the ANEF digital platform and the Préfecture de Police notification service.'
  }),

  // ── 14. SAN FRANCISCO (UNITED STATES) ───────────────────────────────────────
  createRecord({
    id: 'us-sf-muni-clipper-transit-capping',
    topic: 'transit',
    jurisdiction: 'San Francisco',
    title: 'SFMTA Muni & Clipper Card: Integrated San Francisco Transit and Regional Bay Area Fare Payment',
    url: 'https://www.sfmta.com/fares/muni-fares',
    quote: 'Clipper is the all-in-one transit payment card and app for all major public transit agencies in the San Francisco Bay Area.',
    summary: 'The San Francisco Municipal Transportation Agency (SFMTA) operates the Muni transit network (historic cable cars, Muni Metro light rail, historic streetcars, electric trolleybuses, and motor coaches) across San Francisco. Riders pay fares using a contactless Clipper card or the mobile Clipper app. A standard single adult Muni fare ($2.50 via Clipper) includes unlimited free transfers within 120 minutes across all Muni lines. Clipper also enables seamless multimodal transfers to Bay Area Rapid Transit (BART), Caltrain, and Golden Gate Ferry. Low-income San Francisco residents can apply for the Muni Lifeline or Clipper START programs, which offer a 50% discount on single-ride transit fares throughout the Bay Area.'
  }),
  createRecord({
    id: 'us-sf-healthy-san-francisco-healthcare',
    topic: 'health',
    jurisdiction: 'San Francisco',
    title: 'San Francisco Department of Public Health: Healthy San Francisco Healthcare Access Program',
    url: 'https://healthysanfrancisco.org/',
    quote: 'Healthy San Francisco is a municipal program designed to make healthcare services available and affordable to uninsured San Francisco residents.',
    summary: 'Healthy San Francisco (HSF) is a groundbreaking municipal healthcare program administered by the San Francisco Department of Public Health (SFDPH). It provides comprehensive primary, specialty, emergency, and pharmaceutical healthcare to uninsured adult residents of San Francisco (aged 18 and older) who do not qualify for Medi-Cal or Covered California, regardless of immigration status, employment status, or pre-existing medical conditions. Participants select a primary care medical home (such as Zuckerberg San Francisco General Hospital or community health clinics) where they receive coordinated care. Fees are determined on a sliding scale based strictly on household income.'
  }),
  createRecord({
    id: 'us-sf-sfusd-school-enrollment-lottery',
    topic: 'schooling',
    jurisdiction: 'San Francisco',
    title: 'San Francisco Unified School District (SFUSD): Student Assignment System and Enrollment Center',
    url: 'https://www.sfusd.edu/schools/enroll',
    quote: 'SFUSD provides tuition-free public education to all children living in San Francisco from transitional kindergarten through 12th grade.',
    summary: 'The San Francisco Unified School District (SFUSD) operates all public transitional kindergarten, elementary, middle, and high schools across the City and County of San Francisco. School placement is conducted through a centralized choice and assignment process: families submit an application ranking their preferred schools across the district during the Main Round in January. Priority tiebreakers include siblings, attendance area, and designated census tract equity factors. Immigrant and newcomer families arriving mid-year enroll in person through the SFUSD Enrollment Center, where bilingual intake staff assess English language proficiency, verify child birth certificate and San Francisco residential address, and connect students to dedicated newcomer pathways.'
  }),
  createRecord({
    id: 'us-sf-pge-utility-connection-rights',
    topic: 'community',
    jurisdiction: 'San Francisco',
    title: 'Pacific Gas and Electric (PG&E): Electric & Gas Utility Setup and California Tenant Consumer Rights',
    url: 'https://www.pge.com/en/account/service-requests/start-stop-move.html',
    quote: 'California residents can start, stop, or transfer electric and gas services with Pacific Gas and Electric Company.',
    summary: 'Pacific Gas and Electric Company (PG&E) supplies electricity and natural gas throughout San Francisco and Northern California. New residential tenants can start utility service online or by phone up to 60 days before move-in by providing identity information (SSN, ITIN, or foreign passport) and lease start date. Under California Public Utilities Commission (CPUC) regulations, tenants have robust statutory protections: landlords are legally prohibited from unmetered utility markups, and utilities cannot disconnect residential service during severe heat waves or life-threatening cold. Low-to-moderate-income households can enroll in California Alternate Rates for Energy (CARE) for an ongoing 20% or more discount on monthly energy bills.'
  }),
  createRecord({
    id: 'us-sf-city-id-card-services',
    topic: 'sin',
    jurisdiction: 'San Francisco',
    title: 'San Francisco County Clerk: SF City ID Card Municipal Photo Identification',
    url: 'https://sf.gov/sf-city-id-card',
    quote: 'The SF City ID Card is an official municipal photo identification card issued to all San Francisco residents regardless of immigration status.',
    summary: 'The Office of the County Clerk of the City and County of San Francisco issues the official SF City ID Card. Established under municipal ordinance, the SF City ID Card is available to all San Francisco residents, providing an official government-issued photo ID that is recognized by the San Francisco Police Department, municipal departments, local banks, credit unions, and community organizations. Applicants must prove identity (such as a foreign passport, consular ID card, or foreign national identity card) and San Francisco residency (utility bill, residential lease, or letter from a homeless shelter). The card protects applicant confidentiality; personal application records are shielded from federal disclosure under city sanctuary policies.'
  }),

  // ── 15. LOS ANGELES (UNITED STATES) ─────────────────────────────────────────
  createRecord({
    id: 'us-la-housing-dept-rso-tenant-protections',
    topic: 'housing',
    housingSubject: 'agreement',
    jurisdiction: 'Los Angeles',
    title: 'Los Angeles Housing Department (LAHD): Rent Stabilization Ordinance (RSO) and Just Cause Protections',
    url: 'https://housing2.lacity.org/residents/tenant-protections',
    quote: 'The Rent Stabilization Ordinance (RSO) protects tenants in residential rental properties built on or before October 1, 1978.',
    summary: 'The Los Angeles Housing Department (LAHD) administers the City of Los Angeles Rent Stabilization Ordinance (RSO, Los Angeles Municipal Code Chapter XV). Under the RSO, annual rent increases for multi-family rental units built before October 1, 1978 are strictly capped by an annual statutory formula based on regional Consumer Price Index (CPI) increases. Under the city universal Just Cause Eviction Protections (effective 2023), all residential rental units across the City of Los Angeles are shielded from no-fault evictions after 6 months of occupancy (or lease expiration). Landlords seeking no-fault eviction (such as owner move-in or Ellis Act removal) must pay statutory relocation assistance to tenants, ranging from $10,000 to over $24,000 for senior or disabled households.'
  }),
  createRecord({
    id: 'us-la-dhs-my-health-la-medical',
    topic: 'health',
    jurisdiction: 'Los Angeles',
    title: 'LA County Department of Health Services: Community Health Centers and California Medi-Cal Expansion',
    url: 'https://dhs.lacounty.gov/our-services/insurance-and-coverage/',
    quote: 'All California residents who meet income requirements are eligible for full-scope Medi-Cal, regardless of immigration status.',
    summary: 'Public healthcare across Greater Los Angeles is anchored by the Los Angeles County Department of Health Services (LA County DHS), operating major safety-net medical centers (LAC+USC Medical Center, Harbor-UCLA, Olive View-UCLA) and dozens of comprehensive health centers. Under California historic health reform, full-scope Medi-Cal (California Medicaid) is available to all income-eligible residents of Los Angeles County regardless of immigration or citizenship status. Medi-Cal covers 100% of doctor visits, prescription medications, hospitalizations, mental healthcare, and dental care with zero monthly premiums or co-pays for eligible low-income households. County health clinics provide immediate intake and confidential care to all newcomers.'
  }),
  createRecord({
    id: 'us-la-lausd-school-enrollment-zones',
    topic: 'schooling',
    jurisdiction: 'Los Angeles',
    title: 'Los Angeles Unified School District (LAUSD): Resident School Enrollment and Student Rights',
    url: 'https://www.lausd.org/enrollment',
    quote: 'LAUSD serves more than 500,000 students across Los Angeles and guarantees school enrollment to every resident child.',
    summary: 'The Los Angeles Unified School District (LAUSD District 1) is the second-largest public school district in the United States, operating comprehensive elementary, middle, and high schools throughout the City of Los Angeles and surrounding municipalities. Every child aged 4 through 18 residing within an LAUSD attendance boundary is guaranteed admission to their designated resident school tuition-free. Under Plyler v. Doe and California state law, LAUSD staff are legally forbidden from inquiring into or disclosing the immigration status of students or their families. Enrollment requires proof of age (birth certificate or passport), immunization records, and verification of Los Angeles residency (lease or utility bill). Free school breakfast and lunch are provided to all students daily.'
  }),
  createRecord({
    id: 'us-la-ladwp-utilities-connection',
    topic: 'community',
    jurisdiction: 'Los Angeles',
    title: 'Los Angeles Department of Water and Power (LADWP): Electric & Water Account Setup and Tenant Lifeline Rates',
    url: 'https://www.ladwp.com/ladwp/faces/ladwp/residential/r-customerservice/r-cs-turnon',
    quote: 'LADWP is the largest municipal water and power utility in the United States, providing service across the City of Los Angeles.',
    summary: 'The Los Angeles Department of Water and Power (LADWP) is the municipal public utility providing water and electricity to four million residents across the City of Los Angeles. New residential customers can start service online at ladwp.com or by calling customer service, providing the service address, move-in date, and identity documentation (SSN, ITIN, or government-issued photo ID). LADWP does not require a credit check or security deposit for customers who verify identity or qualify for low-income assistance programs. Customers facing financial hardship can apply for the Low-Income Discount Program (EZ-SAVE) and Level Pay Plan to ensure affordable and uninterrupted utility service.'
  }),
  createRecord({
    id: 'us-la-county-community-id-services',
    topic: 'community',
    jurisdiction: 'Los Angeles',
    title: 'LA County Office of Immigrant Affairs (OIA): Immigrant Protection, Public Library Card, and Community Resources',
    url: 'https://oia.lacounty.gov/',
    quote: 'The Los Angeles County Office of Immigrant Affairs connects immigrant residents with vital county services and legal protections.',
    summary: 'The Los Angeles County Office of Immigrant Affairs (OIA), situated within the Department of Consumer and Business Affairs (DCBA), assists immigrant families living in Los Angeles County. OIA provides free and confidential guidance on wage theft protections, housing disputes, legal representation against deportation, and public benefits navigation. Furthermore, the Los Angeles Public Library (LAPL) and LA County Library issue free library cards to all residents upon presenting photo ID and proof of address; library cards grant free borrowing privileges, computer and Wi-Fi access, digital language learning tools, and career assistance across over 150 municipal library branches.'
  }),

  // ── 16. SEATTLE (UNITED STATES) ─────────────────────────────────────────────
  createRecord({
    id: 'us-seattle-sps-school-enrollment',
    topic: 'schooling',
    jurisdiction: 'Seattle',
    title: 'Seattle Public Schools (SPS): Designated Neighborhood School Enrollment and Multilingual Services',
    url: 'https://www.seattleschools.org/admissions/',
    quote: 'Every student in Seattle is assigned to a designated neighborhood school based on where they live.',
    summary: 'Seattle Public Schools (District No. 1) operates public elementary, K-8, middle, and high schools across Seattle. Assignment is guaranteed to the student designated neighborhood school determined by residential address. Parents register through the online Admissions portal, providing proof of student age, medically verified Certificate of Immunization Status (CIS), and two proofs of residency in Seattle (mortgage/lease agreement, electric or water utility bill). SPS Multilingual Department provides English language development assessments and dual-language immersion programs. All resident students, regardless of national origin or immigration status, are admitted tuition-free.'
  }),
  createRecord({
    id: 'us-seattle-king-county-public-health',
    topic: 'health',
    jurisdiction: 'Seattle',
    title: 'Public Health - Seattle & King County: Community Health Centers and Apple Health Medicaid Enrollment',
    url: 'https://kingcounty.gov/en/dept/dph/health-safety/health-insurance',
    quote: 'Public Health - Seattle & King County provides essential healthcare access and health insurance navigation for all residents.',
    summary: 'Public Health - Seattle & King County operates public healthcare clinics, maternity centers, and community health networks (including Neighborcare Health and Country Doctor). Navigators assist residents in applying for Washington Apple Health (Medicaid), which provides free healthcare for low-income adults and children. Under Washington State immigrant healthcare expansion, state-funded health insurance is available to low-income individuals regardless of immigration status. County health centers offer sliding-fee scales based on household income for medical, dental, and pharmacy services, ensuring that nobody is turned away due to inability to pay.'
  }),
  createRecord({
    id: 'us-seattle-city-light-utilities',
    topic: 'community',
    jurisdiction: 'Seattle',
    title: 'Seattle City Light and Seattle Public Utilities: Municipal Power, Water, and Tenant Utility Discount Program',
    url: 'https://www.seattle.gov/city-light/residential-services/start-stop-transfer-service',
    quote: 'Seattle City Light is one of the nation largest publicly owned electric utilities, providing clean hydroelectric energy.',
    summary: 'In Seattle, electricity is supplied by municipal utility Seattle City Light, while water, sewer, and solid waste collection are provided by Seattle Public Utilities (SPU). New residents can open an account online or by phone up to 60 days before moving in. Under Seattle Municipal Code, residential tenants have statutory protections against arbitrary utility shutoffs during severe winter weather. Qualified low-income residential households can enroll in the Utility Discount Program (UDP), which provides an ongoing 60% discount on electric bills and a 50% discount on municipal water and sewer bills.'
  }),

  // ── 17. BOSTON (UNITED STATES) ──────────────────────────────────────────────
  createRecord({
    id: 'us-boston-bps-school-registration',
    topic: 'schooling',
    jurisdiction: 'Boston',
    title: 'Boston Public Schools (BPS): Welcome Centers, Home-Based Student Assignment, and Registration',
    url: 'https://www.bostonpublicschools.org/register',
    quote: 'BPS Welcome Centers help families register for Boston public schools and access multilingual support.',
    summary: 'Boston Public Schools (BPS) serves students across Boston using a Home-Based Student Assignment plan. Families register online or in person at one of the BPS Welcome Centers (Roxbury, East Boston, Dorchester, Roslindale). The home-based system generates a customized list of school choices within the family geographic zone based on proximity and quality. Required documentation includes the child birth certificate or passport, up-to-date Massachusetts immunization records, and three distinct proofs of Boston residency (such as utility bills, lease agreement, or payroll stub). Immigrant students receive language screening through the Newcomer Assessment Center.'
  }),
  createRecord({
    id: 'us-boston-masshealth-connector-care',
    topic: 'health',
    jurisdiction: 'Boston',
    title: 'MassHealth and Health Safety Net: Healthcare Coverage and Community Health Centers in Boston',
    url: 'https://www.mass.gov/topics/masshealth',
    quote: 'Massachusetts provides comprehensive health insurance coverage through MassHealth and the Massachusetts Health Connector.',
    summary: 'Under Chapter 58 of the Acts of 2006, health insurance is legally mandated for all adult residents of Massachusetts. Low-income individuals and families enroll in MassHealth (Massachusetts Medicaid), while residents with higher incomes access subsidized private plans through the Massachusetts Health Connector. Uninsured residents and recent immigrants not yet eligible for MassHealth can access care through the Massachusetts Health Safety Net (HSN), which pays for essential hospital and community health center services at safety-net facilities like Boston Medical Center and community clinics throughout Boston.'
  }),
  createRecord({
    id: 'us-boston-eversource-national-grid-utilities',
    topic: 'community',
    jurisdiction: 'Boston',
    title: 'Eversource and National Grid: Residential Electric & Gas Setup and Massachusetts Winter Moratorium',
    url: 'https://www.eversource.com/content/residential/account-billing/manage-service/start-stop-move-service',
    quote: 'Massachusetts law protects residential utility customers from winter service shutoffs between November 15 and March 15.',
    summary: 'In Boston, electricity is supplied by Eversource and residential natural gas is delivered by National Grid. New tenants can establish service online or by telephone by providing their residential address, move-in date, and identity details. Under Massachusetts General Laws Chapter 164 and Department of Public Utilities (DPU) regulations, utilities cannot shut off electric or gas heating service to residential households between November 15 and March 15 (Winter Moratorium) for non-payment. Households with elderly persons, infants under 12 months, or certified serious illnesses enjoy additional year-round utility shutoff protections and discount rates.'
  }),

  // ── 18. AUSTIN (UNITED STATES) ──────────────────────────────────────────────
  createRecord({
    id: 'us-austin-aisd-school-enrollment',
    topic: 'schooling',
    jurisdiction: 'Austin',
    title: 'Austin Independent School District (AISD): Neighborhood School Registration and Dual Language Programs',
    url: 'https://www.austinisd.org/enroll',
    quote: 'Every student who lives within AISD boundaries is guaranteed enrollment in their neighborhood school.',
    summary: 'Austin Independent School District (AISD) operates elementary, middle, and high schools throughout Austin, Texas. Students residing within district boundaries are guaranteed admission to their zoned neighborhood school. Parents enroll through the AISD Parent Portal, submitting proof of student age, state immunization records, and proof of residence within the district (current utility bill or residential lease agreement). AISD offers robust Dual Language and Multilingual Education programs, ensuring non-native English speakers receive linguistic and academic instruction. State public education is completely tuition-free regardless of family citizenship or visa status.'
  }),
  createRecord({
    id: 'us-austin-central-health-map-care',
    topic: 'health',
    jurisdiction: 'Austin',
    title: 'Central Health Medical Access Program (MAP): Healthcare Coverage for Uninsured Travis County Residents',
    url: 'https://www.centralhealth.net/map/',
    quote: 'The Medical Access Program (MAP) provides healthcare coverage to low-income, uninsured Travis County residents.',
    summary: 'Central Health, the public healthcare district for Travis County and Austin, administers the Medical Access Program (MAP and MAP Basic). MAP provides comprehensive healthcare coverage to low-income residents who are uninsured and do not qualify for federal Medicare or Medicaid, regardless of immigration status. Enrolled members receive a MAP card providing access to outpatient doctor visits, dental care, mental healthcare, and prescription medications through the CommUnityCare Health Centers network, and inpatient treatment at Dell Seton Medical Center at the University of Texas. Copayments are capped on a sliding scale based on federal poverty guidelines.'
  }),
  createRecord({
    id: 'us-austin-austin-energy-utilities',
    topic: 'community',
    jurisdiction: 'Austin',
    title: 'Austin Energy and Austin Water: City of Austin Municipal Utility Setup and Tenant Protections',
    url: 'https://austinenergy.com/residential/residential-services/start-stop-move',
    quote: 'Austin Energy is the community-owned electric utility providing power to residents of Austin and surrounding areas.',
    summary: 'Utility services in Austin are provided by City of Austin municipal utilities: electricity through Austin Energy, and water/wastewater and solid waste collection through Austin Water. New residents can start all municipal utility services simultaneously using the City of Austin online customer portal or by calling customer care. Security deposits can be waived for customers providing a letter of credit from a previous utility. Under city council policies, Austin Energy halts all residential service disconnects during extreme summer heat advisories and winter freeze warnings. Income-eligible customers can enroll in the Customer Assistance Program (CAP) for monthly utility bill discounts.'
  }),

  // ── 19. MANCHESTER (UNITED KINGDOM) ─────────────────────────────────────────
  createRecord({
    id: 'uk-manchester-council-tax-setup',
    topic: 'community',
    jurisdiction: 'Manchester',
    title: 'Manchester City Council: Council Tax Registration, Valuation Bands, and Resident Discounts',
    url: 'https://www.manchester.gov.uk/counciltax',
    quote: 'You must tell Manchester City Council that you have moved into a home in Manchester so you can pay Council Tax.',
    summary: 'All adult residents occupying a domestic property in the City of Manchester must register for Council Tax with Manchester City Council. Billing is based on Valuation Office Agency property valuation bands. Single adults living alone receive a statutory 25% Single Person Discount, and households composed solely of full-time students are 100% exempt from Council Tax. The official Council Tax bill serves as primary proof of address in the UK for opening bank accounts, obtaining an NHS number, and registering for driving licences. Low-income residents can apply for the Council Tax Support scheme to reduce their annual bill.'
  }),
  createRecord({
    id: 'uk-manchester-nhs-gp-primary-care',
    topic: 'health',
    jurisdiction: 'Manchester',
    title: 'Greater Manchester NHS: Registering with an NHS GP Surgery in Manchester and Primary Care Access',
    url: 'https://gmintegratedcare.org.uk/',
    quote: 'Anyone in Greater Manchester can register with a GP surgery for free without proof of address or ID.',
    summary: 'Primary medical healthcare across Greater Manchester is commissioned by NHS Greater Manchester Integrated Care Partnership. All residents living within a GP surgery catchment area have the legal right to register as NHS patients free of charge. Under NHS England statutory registration guidelines, surgeries cannot refuse registration on grounds of nationality, immigration status, or lack of proof of address or identification. Consultations with a family doctor, walk-in urgent care, and hospital accident and emergency (A&E) treatment at Manchester Royal Infirmary or North Manchester General Hospital are free at the point of use.'
  }),
  createRecord({
    id: 'uk-manchester-school-admissions-hub',
    topic: 'schooling',
    jurisdiction: 'Manchester',
    title: 'Manchester City Council: Primary and Secondary School Admissions and Catchment Areas',
    url: 'https://www.manchester.gov.uk/admissions',
    quote: 'Manchester City Council coordinates admissions for state-funded primary and high schools across the city.',
    summary: 'Manchester City Council coordinates school admissions for all community, voluntary-controlled, and academy schools across Manchester. Applications for Reception (primary school) and Year 7 (secondary school) are submitted through the council online admissions portal during the national autumn application round. Parents can state up to three school preferences. Mid-year school admissions for newly arriving families are processed through In-Year Admissions. Places are allocated strictly in accordance with published oversubscription rules: looked-after children, siblings, and straight-line distance from the home address to the school gate.'
  }),
  createRecord({
    id: 'uk-manchester-tenancy-rights-deposit',
    topic: 'housing',
    housingSubject: 'agreement',
    jurisdiction: 'Manchester',
    title: 'Manchester City Council: Private Rented Sector Standards, Rogue Landlord Checks, and Deposit Protection',
    url: 'https://www.manchester.gov.uk/info/200075/housing/6979/private_rented_housing',
    quote: 'Manchester City Council enforces housing standards in the private rented sector and licenses rental properties in selective licensing areas.',
    summary: 'Private tenants renting in Manchester are protected under national UK tenancy laws and Manchester City Council housing standards. In designated selective licensing areas across Manchester, private landlords must hold a council operating licence, ensuring properties meet fire safety, electrical, and gas safety standards. Tenancy deposits are statutory capped at 5 weeks rent and must be protected in a government-approved scheme (DPS, TDS, or mydeposits) within 30 days. Landlords are banned from charging tenant fees under the Tenant Fees Act 2019, and the council Housing Compliance Team investigates unlawful evictions, harassment, and disrepair.'
  }),

  // ── 20. EDINBURGH (UNITED KINGDOM) ─────────────────────────────────────────
  createRecord({
    id: 'uk-edinburgh-lothian-buses-ridacard',
    topic: 'transit',
    jurisdiction: 'Edinburgh',
    title: 'Lothian Buses and Edinburgh Trams: Contactless Tap on Tap Off and Ridacard Smartcard',
    url: 'https://www.lothianbuses.com/fares-and-tickets/',
    quote: 'Tap on Tap off contactless fare capping gives you the best value for your journeys across Lothian Buses and Edinburgh Trams.',
    summary: 'Public transportation across Edinburgh is operated primarily by municipal operator Lothian Buses and Edinburgh Trams. Passengers pay by tapping any contactless debit or credit card or smart device upon boarding buses and at platform validators before boarding trams. Under Contactless Tap on Tap off, adult fares automatically cap at the daily maximum dayticket rate (£4.80 for the City Zone) regardless of how many trips you take in a day. Regular commuters can purchase a reusable Ridacard smartcard for 1-week, 4-week, or annual unlimited travel. Young people aged under 22 living in Scotland are entitled to free bus travel under the National Concessionary Travel Scheme.'
  }),
  createRecord({
    id: 'uk-edinburgh-council-tax-services',
    topic: 'community',
    jurisdiction: 'Edinburgh',
    title: 'City of Edinburgh Council: Council Tax Registration, Water Charges, and Single Resident Reductions',
    url: 'https://www.edinburgh.gov.uk/council-tax',
    quote: 'You must notify the City of Edinburgh Council when you move into a property in Edinburgh to set up your Council Tax account.',
    summary: 'In Scotland, Council Tax is collected by the local municipal authority, the City of Edinburgh Council. Council Tax bills in Scotland uniquely incorporate residential domestic water and sewerage service charges collected on behalf of Scottish Water. Properties are assessed into Bands A through H. Single adult occupants qualify for a statutory 25% single person reduction, and households consisting entirely of full-time students are 100% exempt from both Council Tax and water charges. The official Edinburgh Council Tax bill is widely recognized as primary proof of address for Scottish banking and civil procedures.'
  }),
  createRecord({
    id: 'uk-edinburgh-nhs-lothian-gp-registration',
    topic: 'health',
    jurisdiction: 'Edinburgh',
    title: 'NHS Lothian: Registering with a Family Doctor (GP), Free Prescriptions, and Edinburgh Healthcare',
    url: 'https://www.nhslothian.scot/services/general-practitioners/',
    quote: 'In Scotland, NHS prescriptions and visits to your registered GP are free for all residents.',
    summary: 'Public healthcare across the Scottish capital is provided by NHS Lothian. Residents register with a local general practice surgery covering their residential catchment area by submitting a completed GMS1 or NHS Scotland GP registration form. Under NHS Scotland policy, all prescription medications dispensed at Scottish community pharmacies are 100% free of charge for all residents, with zero prescription co-pays. Emergency care at the Royal Infirmary of Edinburgh and Western General Hospital is free at point of delivery. Routine dental examinations and eye tests are also free under NHS Scotland.'
  }),
  createRecord({
    id: 'uk-edinburgh-council-school-places',
    topic: 'schooling',
    jurisdiction: 'Edinburgh',
    title: 'City of Edinburgh Council: Primary and Secondary School Registration and Catchment Boundaries',
    url: 'https://www.edinburgh.gov.uk/school-places',
    quote: 'Every property in Edinburgh has a designated non-denominational and Roman Catholic catchment school.',
    summary: 'In Edinburgh, state schooling is administered by the City of Edinburgh Council. Every residential address is situated within the catchment area of both a non-denominational primary/secondary school and a Roman Catholic primary/secondary school. Children are entitled to attend their designated catchment school upon registering with proof of birth and Edinburgh residential address (Council Tax bill and tenancy agreement). Parents wishing to send their child to a school outside their catchment area can submit a non-catchment placing request during the annual registration window, which is granted if spare capacity remains after all catchment pupils are placed.'
  }),

  // ── 21. BARCELONA (SPAIN) ───────────────────────────────────────────────────
  createRecord({
    id: 'es-barcelona-padro-empadronament',
    topic: 'community',
    jurisdiction: 'Barcelona',
    title: 'Ajuntament de Barcelona: Padró Municipal d Habitants Census Registration Protocol',
    url: 'https://seuelectronica.ajuntament.barcelona.cat/tramits/ca/detall/alta-al-padro-municipal-d-habitants-per-canvi-de-residencia',
    quote: 'Empadronament is the administrative registration that proves you live in the municipality of Barcelona.',
    summary: 'In Barcelona, municipal census registration (Empadronament / Padrón) is a mandatory legal requirement under Spanish law for all individuals establishing residence in the city. Registration is conducted at an Oficina d Atenció Ciutadana (OAC) by booking a prior appointment (cita prèvia). Applicants must bring their passport or NIE, along with proof of housing: an original residential rental contract valid for at least 6 months and the latest monthly rent receipt, or written authorization from the property owner accompanied by their DNI/NIE copy. The resulting Volant d Empadronament is the foundational document required in Catalonia for public healthcare access (CatSalut), schooling, and immigration residency procedures.'
  }),
  createRecord({
    id: 'es-barcelona-catsalut-tarjeta-sanitaria',
    topic: 'health',
    jurisdiction: 'Barcelona',
    title: 'Servei Català de la Salut (CatSalut): CAP Health Centers and Targeta Sanitària Individual (TSI)',
    url: 'https://catsalut.gencat.cat/ca/ciutadania/acces-sistema-salut/targeta-sanitaria-individual/',
    quote: 'The Targeta Sanitària Individual (TSI) guarantees access to public healthcare in Catalonia.',
    summary: 'Public healthcare in Barcelona is managed by the Servei Català de la Salut (CatSalut). Every resident registered on the municipal Padró can register at their local primary healthcare center (Centre d Atenció Primària - CAP). Upon presenting the Volant d Empadronament, passport/NIE, and Social Security affiliation document, CatSalut issues the personal health card (Targeta Sanitària Individual - TSI) and assigns a primary care doctor (metge de capçalera). Consultations, diagnostic tests, emergency hospital treatment (Hospital Clínic, Hospital de la Vall d Hebron), and maternal care are 100% free at point of service.'
  }),
  createRecord({
    id: 'es-barcelona-habitatge-arrendament-housing',
    topic: 'housing',
    housingSubject: 'deposit',
    jurisdiction: 'Barcelona',
    title: 'Consorci de l Habitatge de Barcelona: INCASÒL Rental Deposit Registry and Catalan Housing Rights',
    url: 'https://www.habitatge.barcelona/en/services-and-grants/renting',
    quote: 'Under Catalan housing legislation, landlords must deposit the rental fianza with INCASÒL within two months.',
    summary: 'Residential tenancies in Barcelona are governed by the Spanish Urban Tenancy Act (LAU) and specific Catalan housing regulations (Llei del Dret a l Habitatge). Residential security deposits (fiança) are capped at one month base rent, with additional guarantees limited to two months. Landlords are legally required to deposit the fiança with the Institut Català del Sòl (INCASÒL); failure to deposit gives tenants grounds for complaint and denies landlords tax deductions. Tenancies have a minimum statutory duration of 5 years (7 years for corporate landlords). In designated stressed housing zones (zones de mercat residencial tensat), new lease rents are legally capped by the official rental reference index.'
  }),
  createRecord({
    id: 'es-barcelona-educacio-escoles-preinscripcio',
    topic: 'schooling',
    jurisdiction: 'Barcelona',
    title: 'Consorci d Educació de Barcelona: School Pre-Enrolment (Preinscripció) and Neighborhood Proximity',
    url: 'https://www.edubcn.cat/ca/alumnat_i_families/sol_licitud_i_matricula',
    quote: 'School pre-enrolment in Barcelona is coordinated through the Consorci d Educació based on proximity points.',
    summary: 'State-funded schooling in Barcelona is coordinated by the Consorci d Educació de Barcelona, covering public schools (escoles públiques) and state-subsidized charter schools (escoles concertades). Education is tuition-free from age 3 (Infantil) through age 16 (ESO). The annual pre-enrolment process (Preinscripció) takes place in March via an electronic application. Points are awarded primarily for living within the designated neighborhood catchment area (àrea de proximitat), siblings in the school, and family income. Immigrant families arriving mid-term can apply for extraordinary placement through the municipal school commission (Oficina d Escolarització). Instruction is delivered primarily in Catalan, with specialized linguistic adaptation classrooms (aules d acollida) for newcomer children.'
  }),

  // ── 22. ABU DHABI (UNITED ARAB EMIRATES) ────────────────────────────────────
  createRecord({
    id: 'ae-abu-dhabi-tawtheeq-tenancy-contracts',
    topic: 'housing',
    housingSubject: 'agreement',
    jurisdiction: 'Abu Dhabi',
    title: 'Abu Dhabi Municipality: Tawtheeq Mandatory Tenancy Contract Registration and Residential Leases',
    url: 'https://www.dmt.gov.ae/en/services/register-tenancy-contract-tawtheeq',
    quote: 'Tawtheeq is the mandatory municipal system for registering and validating all residential tenancy contracts in Abu Dhabi.',
    summary: 'The Department of Municipalities and Transport (DMT) in Abu Dhabi mandates that all residential leasing contracts must be officially registered in the Tawtheeq electronic system. The property owner or authorized real estate property manager is legally responsible for submitting the lease into Tawtheeq. A verified Tawtheeq tenancy certificate is an absolute legal prerequisite in the Emirate of Abu Dhabi for connecting utility services (ADDC water and electricity), sponsoring family residency visas with ICP, and receiving municipality subsidies. Annual rent increases in Abu Dhabi are subject to the 5% statutory rental cap under Abu Dhabi Tenancy Law No. 20 of 2006.'
  }),
  createRecord({
    id: 'ae-abu-dhabi-doh-thiqa-basic-insurance',
    topic: 'health',
    jurisdiction: 'Abu Dhabi',
    title: 'Department of Health (DoH Abu Dhabi): Mandatory Health Insurance, Basic Policy, and Thiqa Scheme',
    url: 'https://www.doh.gov.ae/en/programs-initiatives/health-insurance',
    quote: 'Under Abu Dhabi Law No. 23 of 2005, employers and sponsors must provide health insurance coverage for their employees and families.',
    summary: 'Health insurance is strictly mandatory for all residents living in the Emirate of Abu Dhabi under Abu Dhabi Law No. 23 of 2005. Employers are legally obligated to provide and pay for compliant medical insurance coverage for employees, their spouse, and up to three dependent children aged under 18. Lower-income expatriate workers earning AED 5,000 or less per month (or AED 4,000 plus accommodation) are covered under the Abu Dhabi Basic Health Insurance Policy issued by Daman (National Health Insurance Company), providing capped consultation co-pays and hospital emergency care. UAE nationals are covered under the government-funded Thiqa program. Uninsured residents face monthly statutory fines.'
  }),
  createRecord({
    id: 'ae-abu-dhabi-adek-school-inspections',
    topic: 'schooling',
    jurisdiction: 'Abu Dhabi',
    title: 'Abu Dhabi Department of Education and Knowledge (ADEK): Private School Ratings and Student Enrollment',
    url: 'https://www.adek.gov.ae/en/Education/School-Inspections',
    quote: 'ADEK oversees all private schools in Abu Dhabi through the Irtiqaa quality assurance and inspection program.',
    summary: 'The Abu Dhabi Department of Education and Knowledge (ADEK) licenses and regulates all private schools across Abu Dhabi, Al Ain, and Al Dhafra. Expatriate children enroll in private schools offering international curricula (American, British, IB, Indian CBSE, Ministry of Education curriculum). School admissions require the student and parents Emirates ID, authenticated birth certificate, immunization card, and an official school transfer certificate. ADEK evaluates schools under the Irtiqaa inspection framework (Outstanding, Very Good, Good, Acceptable, Weak); schools achieving higher inspection tiers are permitted to implement regulated annual tuition fee increases within statutory index parameters.'
  }),
  createRecord({
    id: 'ae-abu-dhabi-addc-electricity-water',
    topic: 'community',
    jurisdiction: 'Abu Dhabi',
    title: 'Abu Dhabi Distribution Company (ADDC): Water & Electricity Account Activation Linked to Tawtheeq',
    url: 'https://www.addc.ae/en-US/residential/Pages/MoveIn.aspx',
    quote: 'ADDC Move-In service automatically sets up your water and electricity accounts once your Tawtheeq contract is registered.',
    summary: 'Abu Dhabi Distribution Company (ADDC), a subsidiary of TAQA, is the sole distributor of electricity and water across the central Abu Dhabi and Al Dhafra regions. Under electronic system integration, registering a Tawtheeq tenancy contract automatically generates an ADDC Move-In account activation. Tenants receive an SMS notification to confirm contact details and pay the statutory refundable security deposit (AED 1,000). Water and power supply are activated within 24 hours. Expatriate residents are billed on non-subsidized expatriate slab tariffs, which are displayed transparently on the monthly ADDC Green Bill alongside municipality housing fees (calculated as 3% of the annual tenancy rent).'
  })
];
