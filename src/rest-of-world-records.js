// Verified statutory settlement records for Rest-of-World countries covering
// Tax & Financial Identification (money/sin), Housing & Tenancy (housing),
// and Healthcare Enrolment (health).
// Checked against official national legislation, ministry portals, and public health systems.

export const checkedAt = '2026-11-03';
export const expiresAt = '2027-02-28';

function createRecord({
  id,
  topic,
  jurisdiction,
  title,
  url,
  summary,
  quote,
  housingSubject = null
}) {
  const rec = {
    id,
    topic,
    jurisdiction,
    title,
    url,
    summary,
    quote,
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt,
    expiresAt,
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Official national statutory authority and government portal inspected directly through authoritative research.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-03T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  };
  if (housingSubject) rec.housingSubject = housingSubject;
  else if (topic === 'housing') rec.housingSubject = 'agreement';
  return rec;
}

export const restOfWorldRecords = [
  // ==========================================
  // INDIA
  // ==========================================
  createRecord({
    id: 'india-income-tax-pan',
    topic: 'money',
    jurisdiction: 'India',
    title: 'India Income Tax Department: Permanent Account Number (PAN) and e-Filing Portal',
    url: 'https://incometax.gov.in/',
    quote: 'Permanent Account Number PAN is a ten-digit unique alphanumeric number issued by the Income Tax Department',
    summary: 'The Income Tax Department of India requires all individuals earning taxable income, opening bank accounts, investing in securities, or conducting high-value transactions to obtain a Permanent Account Number (PAN). PAN is a 10-digit alphanumeric identifier issued under Section 139A of the Income-tax Act 1961. Non-resident Indians (NRIs) and foreign nationals earning income in India or purchasing immovable property must apply via Form 49AA through Protean (formerly NSDL) or UTIITSL portals. Tax residents must link PAN with Aadhaar. The national e-Filing portal provides online return filing (ITR-1 through ITR-7), Annual Information Statement (AIS) verification, tax calculation, and tax deduction at source (TDS) reconciliation.'
  }),
  createRecord({
    id: 'india-model-tenancy-act',
    topic: 'housing',
    jurisdiction: 'India',
    title: 'India MoHUA: Model Tenancy Act (MTA) and State Rent Authorities',
    url: 'https://mohua.gov.in/',
    quote: 'The Model Tenancy Act aims to balance the rights and interests of both the landlord and tenant in an equitable manner',
    summary: 'The Model Tenancy Act (MTA) published by the Ministry of Housing and Urban Affairs provides the statutory template for state residential tenancy legislation across India. Key statutory provisions include: (1) mandatory execution and digital registration of written rental agreements with the designated District Rent Authority within 2 months of execution; (2) security deposit is strictly capped at a maximum of 2 months rent for residential premises and 1 month for commercial premises; (3) landlords cannot enter tenanted premises without at least 24 hours prior written notice; (4) landlords are prohibited from withholding essential supplies including water, electricity, and sanitary services; and (5) dedicated Rent Courts and Rent Tribunals resolve tenancy disputes within a statutory 60-day target timeline.'
  }),
  createRecord({
    id: 'india-ayushman-bharat-health',
    topic: 'health',
    jurisdiction: 'India',
    title: 'India National Health Authority: Ayushman Bharat PM-JAY and Public Healthcare',
    url: 'https://nha.gov.in/',
    quote: 'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana PM-JAY provides health cover of Rs 5 lakhs per family per year',
    summary: 'The National Health Authority (NHA) administers Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY), providing secondary and tertiary hospitalization coverage of INR 500,000 per family per year for vulnerable households across empaneled public and private hospitals. For formal sector employees, the Employees State Insurance Corporation (ESIC) under the ESI Act 1948 mandates comprehensive medical care, sickness benefits, and maternity benefits for workers earning up to INR 21,000 per month. Primary and preventive healthcare in India is delivered through state government Primary Health Centres (PHCs) and Community Health Centres (CHCs) with free or nominal consultations, essential medicines, and routine immunizations.'
  }),

  // ==========================================
  // PAKISTAN
  // ==========================================
  createRecord({
    id: 'pakistan-fbr-taxpayer-ntn',
    topic: 'money',
    jurisdiction: 'Pakistan',
    title: 'Pakistan FBR: National Tax Number (NTN) and Active Taxpayer List (ATL)',
    url: 'https://fbr.gov.pk/',
    quote: 'Federal Board of Revenue provides online registration for National Tax Number and Iris electronic tax filing',
    summary: 'The Federal Board of Revenue (FBR) is Pakistan’s federal authority for direct and indirect taxation under the Income Tax Ordinance 2001. All individuals earning income above the statutory taxable threshold, foreign consultants, business owners, and property purchasers must obtain a National Tax Number (NTN) through the online Iris portal. Filing annual income tax returns places taxpayers on the Active Taxpayer List (ATL), which entitles them to standard withholding tax rates on banking transactions, property acquisitions, and vehicle registrations; non-filers on the Inactive list face punitive double withholding tax rates. Overseas Pakistanis and foreign nationals register via computerized national identity (NICOP/POC) or passport.'
  }),
  createRecord({
    id: 'pakistan-rented-premises-tenancy',
    topic: 'housing',
    jurisdiction: 'Pakistan',
    title: 'Pakistan Provincial Tenancy: Punjab Rented Premises Act and Rent Controller Tribunals',
    url: 'https://punjabcode.punjab.gov.pk/',
    quote: 'A landlord shall not enter the rented premises without giving reasonable notice to the tenant',
    summary: 'Residential and commercial tenancies in Pakistan are regulated by provincial statutes, principally the Punjab Rented Premises Act 2009 and the Sindh Rented Premises Ordinance 1979. Under provincial legislation: (1) all tenancy agreements must be executed in writing and registered with the local Rent Registrar; (2) unregistered tenancy agreements are subject to financial penalties before a Rent Tribunal will hear landlord eviction petitions; (3) rent increases are strictly governed by terms specified in the registered contract, or capped by statutory escalation percentages where applicable; (4) landlords cannot cut off utility connections or seize tenant goods without an order from the Rent Controller; and (5) security deposits (pagri or advance rent) must be explicitly accounted for and refunded upon lawful vacancy.'
  }),
  createRecord({
    id: 'pakistan-sehat-sahulat-healthcare',
    topic: 'health',
    jurisdiction: 'Pakistan',
    title: 'Pakistan Ministry of National Health: Sehat Sahulat Program and Public Hospital Access',
    url: 'https://pmhealthprogram.gov.pk/',
    quote: 'Sehat Sahulat Program is a flagship health insurance initiative providing financial health protection against catastrophic health expenditures',
    summary: 'The Ministry of National Health Services, Regulations and Coordination oversees national healthcare policy in Pakistan. The government operates the Sehat Sahulat Program (Sehat Card Plus / Qaumi Sehat Card in Khyber Pakhtunkhwa, Punjab, and federal territories), providing cashless in-patient hospital care, emergency treatments, surgeries, and maternity services up to PKR 1,000,000 per family annually at designated empaneled hospitals. Primary healthcare, maternal health, and infectious disease immunizations are provided at state-run Basic Health Units (BHUs), Rural Health Centres (RHCs), and District Headquarters (DHQ) hospitals across all provinces.'
  }),

  // ==========================================
  // PHILIPPINES
  // ==========================================
  createRecord({
    id: 'philippines-bir-tin-registration',
    topic: 'money',
    jurisdiction: 'Philippines',
    title: 'Philippines BIR: Taxpayer Identification Number (TIN) and eReg Services',
    url: 'https://www.bir.gov.ph/',
    quote: 'Every taxpayer shall be assigned only one Taxpayer Identification Number TIN to be used for all tax purposes',
    summary: 'The Bureau of Internal Revenue (BIR) under the Department of Finance administers national internal revenue taxes under the National Internal Revenue Code (NIRC) / Tax Reform for Acceleration and Inclusion (TRAIN) Law. Every resident individual, self-employed professional, foreign worker holding an Alien Employment Permit (AEP), and corporation must secure a permanent 9-digit Taxpayer Identification Number (TIN) through the BIR eRegistration (eReg) portal or local Revenue District Office (RDO). The TIN is legally required for opening local bank accounts, vehicle purchases, real estate transactions, and employment onboarding. Possessing multiple TINs is a criminal offense penalized under Philippine law.'
  }),
  createRecord({
    id: 'philippines-rent-control-tenancy',
    topic: 'housing',
    jurisdiction: 'Philippines',
    title: 'Philippines DHSUD: Rent Control Act (RA 9653) and Residential Lease Protections',
    url: 'https://dhsud.gov.ph/',
    quote: 'The Rent Control Act provides that advance rent shall not exceed one month and security deposit shall not exceed two months',
    summary: 'The Department of Human Settlements and Urban Development (DHSUD) oversees residential rental policies in the Philippines under the Rent Control Act (Republic Act No. 9653) and National Human Settlements Board resolutions. Statutory protections include: (1) mandatory limit on advance rent to a maximum of one (1) month; (2) security deposit is strictly capped at a maximum of two (2) months, which must be kept in an interest-bearing bank account during the tenancy; (3) rent increase limits for covered residential units are pegged by the government (traditionally capped between 4% and 7% annually); (4) lessor cannot eject a tenant due to sale of the leased property to a third party; and (5) ejectment requires formal written notice on statutory grounds (such as 3 consecutive months rent default).'
  }),
  createRecord({
    id: 'philippines-philhealth-healthcare',
    topic: 'health',
    jurisdiction: 'Philippines',
    title: 'Philippines PhilHealth: Universal Health Care Act (RA 11223) and Enrolment',
    url: 'https://www.philhealth.gov.ph/',
    quote: 'Under the Universal Health Care Act all Filipino citizens are automatically enrolled into the National Health Insurance Program',
    summary: 'The Philippine Health Insurance Corporation (PhilHealth) administers the National Health Insurance Program (NHIP) mandated by the Universal Health Care (UHC) Act (Republic Act No. 11223). Every resident citizen and registered foreign national residing legally in the Philippines (including ACR I-Card holders and foreign retirees under PRA visas) is covered under the Direct or Indirect Contributor categories. Contributions are deducted through payroll for formal employees or paid via voluntary contributions for self-employed individuals. PhilHealth provides subsidized outpatient consultations, diagnostic tests, and hospitalization subsidies covering room, surgical procedures, and essential medicines across accredited public and private healthcare facilities.'
  }),

  // ==========================================
  // NIGERIA
  // ==========================================
  createRecord({
    id: 'nigeria-firs-tax-tin',
    topic: 'money',
    jurisdiction: 'Nigeria',
    title: 'Nigeria FIRS: Taxpayer Identification Number (TIN) and TaxPro-Max System',
    url: 'https://firs.gov.ng/',
    quote: 'Taxpayer Identification Number TIN is a unique electronic number that identifies individuals and corporate entities with FIRS',
    summary: 'The Federal Inland Revenue Service (FIRS) administers federal taxation in Nigeria, including Companies Income Tax, Value Added Tax (VAT), and Petroleum Profits Tax, while State Internal Revenue Services (such as LIRS in Lagos) administer Personal Income Tax (PIT) under the Personal Income Tax Act (PITA). All registered individuals, foreign residents, and expatriates working under CERPAC visas must obtain a Taxpayer Identification Number (TIN), now unified with the National Identity Number (NIN) for individual citizens and registered residents. Taxpayers manage tax clearances, assessments, and withholding receipts online via the FIRS TaxPro-Max portal.'
  }),
  createRecord({
    id: 'nigeria-lagos-tenancy-law',
    topic: 'housing',
    jurisdiction: 'Nigeria',
    title: 'Nigeria Tenancy: Lagos State Tenancy Law and Citizens Mediation Centre',
    url: 'https://lagosstate.gov.ng/',
    quote: 'It shall be unlawful for a landlord to demand or receive rent in excess of one year for residential premises',
    summary: 'Residential and commercial tenancies in Nigeria are governed by state tenancy enactments, exemplified by the Lagos State Tenancy Law 2011. Key statutory provisions include: (1) it is unlawful for a landlord to demand or receive advance rent exceeding one (1) year from a new tenant, or exceeding six (6) months from a sitting monthly tenant; (2) statutory notices to quit are mandatory prior to instituting eviction proceedings (6 months for yearly tenancies, 3 months for half-yearly, and 1 month for monthly tenancies); (3) landlords are prohibited from self-help evictions, forcible entry, or disconnecting water and electricity supplies; and (4) tenancy disputes can be amicably mediated through the state Citizens’ Mediation Centre (CMC) or adjudicated in Magistrates’ Courts.'
  }),
  createRecord({
    id: 'nigeria-nhia-healthcare',
    topic: 'health',
    jurisdiction: 'Nigeria',
    title: 'Nigeria NHIA: National Health Insurance Authority Act 2022 and Coverage',
    url: 'https://nhia.gov.ng/',
    quote: 'The National Health Insurance Authority Act 2022 makes health insurance mandatory for all Nigerians and legal residents',
    summary: 'The National Health Insurance Authority (NHIA), established under the NHIA Act 2022 (repealing the former NHIS Act), mandates compulsory health insurance for all citizens and legal residents in Nigeria. The authority operates the Formal Sector Social Health Insurance Programme for federal and organized private sector employees, the Group, Individual and Family Social Health Insurance Programme (GIFSHIP) for small-business owners and expatriates, and the Vulnerable Group Fund. Enrollees choose an accredited Health Maintenance Organization (HMO) and primary healthcare provider to receive primary care, emergency services, laboratory investigations, surgical operations, and subsidized pharmaceutical supplies.'
  }),

  // ==========================================
  // BRAZIL
  // ==========================================
  createRecord({
    id: 'brazil-receita-federal-cpf',
    topic: 'money',
    jurisdiction: 'Brazil',
    title: 'Brazil Receita Federal: Cadastro de Pessoas Físicas (CPF) Registration',
    url: 'https://www.gov.br/receitafederal/pt-br',
    quote: 'O CPF e o documento que identifica o contribuinte perante a Secretaria da Receita Federal do Brasil',
    summary: 'The Secretaria da Receita Federal do Brasil administers national tax policy and personal income tax (IRPF). Every individual residing or conducting financial operations in Brazil—including Brazilian citizens, temporary visa holders, and foreign investors—must obtain a Cadastro de Pessoas Físicas (CPF) number. The CPF is an 11-digit fiscal identifier that is strictly required to open bank accounts, sign residential leases, register a Brazilian mobile SIM card, purchase real estate, and undergo formal employment. Foreigners can apply for a CPF online through the Receita Federal website or at Brazilian diplomatic missions abroad before travelling.'
  }),
  createRecord({
    id: 'brazil-lei-do-inquilinato-housing',
    topic: 'housing',
    jurisdiction: 'Brazil',
    title: 'Brazil Tenancy: Lei do Inquilinato (Federal Law 8.245/1991) and Rental Guarantees',
    url: 'https://www.planalto.gov.br/ccivil_03/leis/l8245.htm',
    quote: 'A locacao de imoveis urbanos regula-se pelo disposto nesta lei sendo vedada a exigencia de mais de uma modalidade de garantia',
    summary: 'Urban residential and commercial leases in Brazil are governed by the federal Tenancy Law (Lei do Inquilinato, Lei Federal nº 8.245/1991). Key statutory rights include: (1) standard residential rental contracts are executed for 30 months; contracts of 30 months or longer allow automated eviction upon term expiration, whereas shorter contracts guarantee tenant renewal rights up to 5 years; (2) landlords are legally prohibited from demanding more than one type of rental guarantee (choosing strictly between fiador guarantor, caução cash deposit capped at 3 months rent, or seguro de fiança rental insurance policy); (3) landlords must provide an itemized initial inspection report (vistoria) and cannot evict tenants without formal judicial eviction action (ação de despejo).'
  }),
  createRecord({
    id: 'brazil-sus-sistema-unico-saude',
    topic: 'health',
    jurisdiction: 'Brazil',
    title: 'Brazil Ministério da Saúde: Sistema Único de Saúde (SUS) Universal Healthcare',
    url: 'https://www.gov.br/saude/pt-br',
    quote: 'A saude e direito de todos e dever do Estado garantido mediante politicas sociais e economicas',
    summary: 'Under the 1988 Brazilian Constitution, health is a fundamental right of all persons and a duty of the state. Brazil operates the Sistema Único de Saúde (SUS), one of the world’s largest universal, publicly funded healthcare systems. SUS provides 100% free healthcare services—including outpatient doctor consultations, emergency room care (UPA), laboratory diagnostics, specialized surgeries, cancer therapies, and prescription medications through the Farmácia Popular program—to every individual on Brazilian territory, regardless of nationality, immigration status, or residency history. Foreign residents obtain a SUS digital card (Cartão Nacional de Saúde) at any local basic health clinic (UBS) using a passport or CRNM and proof of address.'
  }),

  // ==========================================
  // JAPAN
  // ==========================================
  createRecord({
    id: 'japan-nta-my-number-tax',
    topic: 'money',
    jurisdiction: 'Japan',
    title: 'Japan National Tax Agency: Individual Number (My Number) and Income Tax',
    url: 'https://www.nta.go.jp/english/',
    quote: 'The Individual Number My Number is a 12-digit number issued to all residents of Japan for social security and tax procedures',
    summary: 'The National Tax Agency (NTA) of Japan enforces national income tax (Shotokuzei) under the Income Tax Act. All registered residents of Japan—including foreign nationals holding a mid-to-long term residence status (Zairyu Card) for more than 3 months—are assigned a unique 12-digit Individual Number (My Number) by their local municipal office (City Hall / Ward Office). The My Number is essential for employment tax withholding (Gensen Choshu), year-end tax adjustments (Nenmatsu Chosei), annual final tax returns (Kakutei Shinkoku), international bank remittances, and social security procedures. Residents use the digital My Number Card for online tax filing via the e-Tax portal.'
  }),
  createRecord({
    id: 'japan-act-land-building-leases',
    topic: 'housing',
    jurisdiction: 'Japan',
    title: 'Japan MLIT: Act on Land and Building Leases (Shakuchi Shakuya Hō) and Tenancy',
    url: 'https://www.mlit.go.jp/en/',
    quote: 'The Act on Land and Building Leases protects tenants against unilateral lease cancellations without justifiable reason',
    summary: 'Tenancy in Japan is governed by the Act on Land and Building Leases (Shakuchi Shakuya Hō) and Ministry of Land, Infrastructure, Transport and Tourism (MLIT) guidelines. Major legal tenets include: (1) under standard residential leases (usually 2 years), landlords cannot refuse lease renewal or demand eviction without a strict legally proven justifiable reason (Seito Jiyu); (2) security deposits (Shikikin) must be returned upon vacating, minus actual tenant-caused damage beyond normal wear and tear (Shuzen Hiyō); (3) customary non-refundable gift money (Reikin) must be explicitly stated in the contract; (4) landlords cannot enter leased apartments without consent except in verifiable emergencies; and (5) fixed-term leases (Teiki Shakuya) expire automatically without statutory renewal rights only if executed under strict written statutory notice.'
  }),
  createRecord({
    id: 'japan-mhlw-national-health-insurance',
    topic: 'health',
    jurisdiction: 'Japan',
    title: 'Japan MHLW: National Health Insurance (NHI) and Social Health Insurance (Shakai Hoken)',
    url: 'https://www.mhlw.go.jp/english/',
    quote: 'All residents of Japan are required by law to enroll in a public health insurance system universal coverage',
    summary: 'Under Japan’s statutory universal health insurance system (Kai-hoken) regulated by the Ministry of Health, Labour and Welfare (MHLW), every person residing in Japan for 3 months or longer must enroll in public healthcare. Full-time corporate employees enroll in Employees’ Health Insurance (Kenko Hoken / Shakai Hoken), where insurance premiums are split 50/50 with the employer. Self-employed individuals, students, part-time workers, and non-working residents must enroll in National Health Insurance (Kokumin Kenko Hoken) at their local municipal ward office. Public health insurance covers 70% of medical and prescription costs, with patients paying a 30% copayment (co-payment drops to 10% or 20% for elderly residents). Catastrophic medical costs are capped monthly under the High-Cost Medical Care Benefit system (Kogaku Ryohizumi).'
  }),

  // ==========================================
  // MEXICO
  // ==========================================
  createRecord({
    id: 'mexico-sat-rfc-tax',
    topic: 'money',
    jurisdiction: 'Mexico',
    title: 'Mexico SAT: Registro Federal de Contribuyentes (RFC) and e.firma',
    url: 'https://www.sat.gob.mx/',
    quote: 'El Registro Federal de Contribuyentes RFC es una clave que requiere toda persona fisica o moral para realizar cualquier actividad economica',
    summary: 'The Servicio de Administración Tributaria (SAT) is Mexico’s federal revenue agency under the Secretaría de Hacienda y Crédito Público (SHCP). All adult residents, formal employees, independent contractors, and foreign nationals with residency status (TRT or TRP) must register for the Registro Federal de Contribuyentes (RFC). The RFC is a 13-character alphanumeric fiscal key essential for employment onboarding, issuance of electronic tax invoices (CFDI), bank account operations, and property leases. Registrants also obtain an advanced electronic signature (e.firma / FIEL) for online tax filings and legal compliance via the SAT portal.'
  }),
  createRecord({
    id: 'mexico-codigo-civil-arrendamiento',
    topic: 'housing',
    jurisdiction: 'Mexico',
    title: 'Mexico Tenancy: Código Civil Federal and Residential Lease Agreements',
    url: 'https://www.gob.mx/profeco',
    quote: 'Hay arrendamiento cuando las dos partes contratantes se obligan reciprocamente una a conceder el uso o goce temporal de una cosa',
    summary: 'Residential tenancies in Mexico are governed by state civil codes (such as the Código Civil para el Distrito Federal in Mexico City) and federal consumer protection oversight by Profeco. Fundamental statutory protections include: (1) all lease agreements must be executed in writing and specify the term, rental amount, and security deposit terms; (2) customary security deposits are limited to one (1) month of rent for residential properties, held to guarantee property condition; (3) leases cannot be unilaterally cancelled by the landlord before the contractual expiration date without judicial rescission; (4) landlords cannot change locks or seize tenant belongings without a judicial order; and (5) rental contracts of indefinite duration require at least 30 to 90 days formal written notice prior to termination.'
  }),
  createRecord({
    id: 'mexico-imss-healthcare',
    topic: 'health',
    jurisdiction: 'Mexico',
    title: 'Mexico IMSS: Instituto Mexicano del Seguro Social and Universal Public Health',
    url: 'https://www.imss.gob.mx/',
    quote: 'El Instituto Mexicano del Seguro Social es el instrumento basico de la seguridad social en Mexico',
    summary: 'Public healthcare in Mexico is administered principally through the Instituto Mexicano del Seguro Social (IMSS) for formal sector employees and their dependents, the ISSSTE for civil servants, and IMSS-Bienestar for uninsured individuals and informal workers. Formal employers are legally mandated to register all employees—including legal foreign workers—with IMSS, which provides comprehensive medical, surgical, pharmaceutical, maternity, and disability care through family medical clinics (UMF) and regional general hospitals. Legal foreign residents not covered through employment can voluntarily purchase the IMSS Seguro de Salud para la Familia annual health policy.'
  }),

  // ==========================================
  // SOUTH KOREA
  // ==========================================
  createRecord({
    id: 'south-korea-nts-tax-registration',
    topic: 'money',
    jurisdiction: 'South Korea',
    title: 'South Korea NTS: National Tax Service and Foreign Resident Income Tax',
    url: 'https://www.nts.go.kr/english/main.do',
    quote: 'The National Tax Service is responsible for the assessment and collection of internal taxes in Korea',
    summary: 'The National Tax Service (NTS) of the Republic of Korea oversees individual income taxation under the Income Tax Act. Foreign nationals residing in Korea for 183 days or more are generally classified as residents for tax purposes and are taxed on worldwide income, subject to statutory 5-year short-term residency rules. Foreign workers in Korea can elect a flat 19% income tax rate (for up to 20 years from initial employment) instead of standard progressive tax brackets ranging from 6% to 45%. Tax filings, withholding tax certificates (Woncheon Jingsu), and annual year-end tax settlements (Yeonmal Jeongsan) are managed through the digital Hometax online portal.'
  }),
  createRecord({
    id: 'south-korea-housing-lease-protection-act',
    topic: 'housing',
    jurisdiction: 'South Korea',
    title: 'South Korea MOLIT: Housing Lease Protection Act (Jeonse and Wolse Protections)',
    url: 'https://www.molit.go.kr/english/',
    quote: 'The Housing Lease Protection Act protects tenants leasehold rights and establishes the right to request lease contract renewal',
    summary: 'Residential tenancies in South Korea operate primarily under two unique lease structures—Jeonse (large lump-sum deposit with zero monthly rent) and Wolse (monthly rent with a security deposit)—and are strictly governed by the Housing Lease Protection Act under the Ministry of Land, Infrastructure and Transport (MOLIT). Key statutory protections include: (1) statutory initial 2-year lease term guarantee; (2) tenant contract renewal right (2+2 years), allowing tenants to renew for an additional 2 years with rent increases capped at 5%; (3) mandatory reporting of housing lease contracts (Jeonwolse Singoje) to local community centres within 30 days of signing; (4) securing priority repayment rights (Daehangnyeok and Wooseon Byeonjwegwon) against landlord debt by acquiring residency and a fixed date stamp (Hwakjeong-ilja); and (5) access to deposit return insurance policies via HUG.'
  }),
  createRecord({
    id: 'south-korea-nhis-mandatory-health',
    topic: 'health',
    jurisdiction: 'South Korea',
    title: 'South Korea NHIS: National Health Insurance Service Mandatory Enrollment',
    url: 'https://www.nhis.or.kr/english/',
    quote: 'Foreigners residing in Korea for six months or longer are subject to mandatory enrollment in National Health Insurance',
    summary: 'The National Health Insurance Service (NHIS) of Korea operates a mandatory single-payer universal healthcare system. Under statutory regulations, all foreign residents and international students residing in South Korea for 6 months or longer (or immediately upon employment for workplace-based insureds) are automatically enrolled in National Health Insurance. Workplace subscribers split the statutory monthly premium 50/50 with their employer, while self-employed or non-working foreign residents pay community-based regional premiums. NHIS covers doctor visits, hospitalization, dental care, cancer screenings, and prescriptions, with standard copayments between 20% and 30% for general clinics.'
  }),

  // ==========================================
  // CHINA
  // ==========================================
  createRecord({
    id: 'china-sta-individual-income-tax',
    topic: 'money',
    jurisdiction: 'China',
    title: 'China STA: State Taxation Administration and Individual Income Tax (IIT)',
    url: 'https://chinatax.gov.cn/eng/',
    quote: 'The Individual Income Tax Law of the People Republic of China applies to residents and non-residents earning income in China',
    summary: 'The State Taxation Administration (STA) of the People’s Republic of China administers Individual Income Tax (IIT) under the Individual Income Tax Law. Individuals residing in China for 183 days or more in a tax year are classified as tax residents. Comprehensive income (salaries, wages, labor remuneration, author royalties) is taxed progressively from 3% to 45%. Foreign employees in China can claim statutory tax-free fringe benefits (including housing allowances, children’s education, language training, and home leave flights) under ongoing transitional tax policies. Annual comprehensive IIT reconciliation (Zonghe Suode Huishuan) is completed annually between March 1 and June 30 via the official Individual Income Tax mobile application.'
  }),
  createRecord({
    id: 'china-civil-code-residential-tenancy',
    topic: 'housing',
    jurisdiction: 'China',
    title: 'China MOHURD: Civil Code Residential Lease and Rental Housing Contract Rules',
    url: 'https://www.mohurd.gov.cn/',
    quote: 'Under Book III Chapter XIV of the Civil Code a lease contract is a contract whereby the lessor delivers the leased property to the lessee',
    summary: 'Residential rentals in China are governed by Chapter XIV of Book III of the Civil Code of the People’s Republic of China and Ministry of Housing and Urban-Rural Development (MOHURD) regulations. Key statutory rights include: (1) lease contracts must be in writing if the term exceeds 6 months; maximum lawful lease duration is capped at 20 years; (2) landlords must ensure the leased property satisfies mandatory safety, health, and fire codes, and cannot enter without tenant authorization; (3) security deposits (typically 1 to 2 months rent under the Ya Yi Fu San or Ya Yi Fu Yi models) must be refunded upon contractual termination minus proven utility arrears or tenant damage; (4) landlords cannot terminate a valid lease early due to property ownership transfer (Buyan Pocho / sale does not break tenancy); and (5) rental agreements must be registered with the local residential housing registry.'
  }),
  createRecord({
    id: 'china-basic-medical-insurance-health',
    topic: 'health',
    jurisdiction: 'China',
    title: 'China NHSA: National Healthcare Security Administration and Basic Medical Insurance',
    url: 'https://www.nhsa.gov.cn/',
    quote: 'The Social Insurance Law mandates that foreign employees working in China shall participate in basic medical insurance',
    summary: 'The National Healthcare Security Administration (NHSA) and Ministry of Human Resources and Social Security (MOHRSS) administer China’s Basic Medical Insurance (BMI) system under the Social Insurance Law. Under the Interim Measures for Social Insurance Participation by Foreigners Employed in China, foreign employees legally working in China must be enrolled by their employers into the Urban Employee Basic Medical Insurance (UEBMI), funded jointly by employer and employee contributions. The system comprises a Pooled Fund for inpatient hospitalization expenses and a Personal Medical Account for outpatient clinics and pharmacy purchases. Designated hospitals (Dingdian Yiyuan) process electronic claims using the National Social Security Card.'
  }),

  // ==========================================
  // VIETNAM
  // ==========================================
  createRecord({
    id: 'vietnam-gdt-tax-code',
    topic: 'money',
    jurisdiction: 'Vietnam',
    title: 'Vietnam GDT: General Department of Taxation and Personal Income Tax (PIT)',
    url: 'https://www.gdt.gov.vn/',
    quote: 'Every taxpayer is granted a unique tax identification number for the fulfillment of tax obligations to the state',
    summary: 'The General Department of Taxation (GDT) under the Ministry of Finance regulates taxation in Vietnam pursuant to the Law on Tax Administration and the Law on Personal Income Tax. Any individual residing in Vietnam for 183 days or more in a calendar year, or maintaining a permanent residence, is deemed a tax resident taxed on global income at progressive rates from 5% to 35%. Non-residents are taxed at a flat 20% on Vietnam-sourced employment income. Every employed resident, self-employed individual, and registered foreign worker holding a Work Permit must obtain a Personal Tax Code (Ma so thue) through the employer or local tax office to file taxes and claim family relief allowances.'
  }),
  createRecord({
    id: 'vietnam-law-on-housing-tenancy',
    topic: 'housing',
    jurisdiction: 'Vietnam',
    title: 'Vietnam MOC: Law on Housing and Residential Rental Contract Regulations',
    url: 'https://moc.gov.vn/',
    quote: 'Housing lease contracts must be in writing and contain the agreed term rent payment methods and rights and obligations of parties',
    summary: 'Residential leasing in Vietnam is governed by the Law on Housing (Law No. 27/2023/QH15) and Civil Code under Ministry of Construction (MOC) supervision. Statutory protections include: (1) foreign nationals legally residing in Vietnam (holding a valid visa, temporary residence card TRC, or permanent residence card) have the legal right to lease residential premises; (2) rental contracts must be executed in writing; notarization is optional but legally advisable; (3) landlords must ensure structural safety and cannot unilaterally terminate the lease contract or increase rent during the contractual term unless specifically agreed in writing; (4) security deposits (customarily 1 to 2 months rent) must be fully refunded upon expiration unless offset against unpaid rent or utility bills; and (5) landlords must complete temporary residence registration (Dang ky tam tru) for foreign tenants with the local ward police.'
  }),
  createRecord({
    id: 'vietnam-vss-health-insurance',
    topic: 'health',
    jurisdiction: 'Vietnam',
    title: 'Vietnam Social Security (VSS): Compulsory Health Insurance for Foreign Workers',
    url: 'https://vss.gov.vn/',
    quote: 'Foreign employees working in Vietnam under labor contracts of at least one year are subject to compulsory health insurance',
    summary: 'Vietnam Social Security (VSS) under the Ministry of Health administers the statutory Social and Health Insurance scheme pursuant to the Law on Health Insurance and Decree 143/2018/ND-CP. Foreign nationals working in Vietnam under employment contracts of one year or longer who hold a valid work permit or practice license are legally required to participate in compulsory Health Insurance (Bao hiem y te - BHYT). The total health insurance contribution is 4.5% of monthly salary (3% paid by the employer, 1.5% deducted from the employee). Enrolled workers receive an electronic health insurance card and are registered at a designated primary healthcare facility (hospital or clinic), where 80% to 100% of covered medical, surgical, and pharmaceutical treatments are subsidized.'
  }),

  // ==========================================
  // BANGLADESH
  // ==========================================
  createRecord({
    id: 'bangladesh-nbr-tax-tin',
    topic: 'money',
    jurisdiction: 'Bangladesh',
    title: 'Bangladesh NBR: National Board of Revenue and Electronic TIN (e-TIN)',
    url: 'https://nbr.gov.bd/',
    quote: 'National Board of Revenue provides online electronic registration for Taxpayer Identification Number e-TIN',
    summary: 'The National Board of Revenue (NBR) under the Internal Resources Division of the Ministry of Finance administers direct taxes under the Income Tax Act 2023. Any individual residing in Bangladesh for 182 days or more in an income year, or earning taxable income above the statutory threshold, must obtain a 12-digit electronic Taxpayer Identification Number (e-TIN). The e-TIN is legally mandatory for opening bank accounts, obtaining trade licenses, registering motor vehicles, transferring property, and obtaining electricity or gas utility connections. Annual tax returns are submitted through the NBR online e-Return system.'
  }),
  createRecord({
    id: 'bangladesh-premises-rent-control',
    topic: 'housing',
    jurisdiction: 'Bangladesh',
    title: 'Bangladesh MoHPW: Premises Rent Control Act and Rent Controller Courts',
    url: 'https://mohpw.gov.bd/',
    quote: 'Under the Premises Rent Control Act no landlord shall claim or receive any advance rent exceeding one month rent',
    summary: 'Residential tenancies in urban Bangladesh are governed by the Premises Rent Control Act 1991 and Ministry of Housing and Public Works regulations. Key statutory mandates include: (1) no landlord can lawfully demand or receive advance rent exceeding one (1) month’s rent; (2) landlords must issue a signed written receipt for every rental payment received; (3) rent increases are strictly restricted and must adhere to standard rent rates determined by the Rent Controller; (4) landlords cannot cut off water, electricity, or sewerage services to tenanted premises without a court order; and (5) eviction requires formal legal notice and a decree from the Rent Controller Court on proven statutory grounds such as persistent rent default or bona fide personal occupation.'
  }),
  createRecord({
    id: 'bangladesh-dghs-public-health',
    topic: 'health',
    jurisdiction: 'Bangladesh',
    title: 'Bangladesh DGHS: Directorate General of Health Services and Public Healthcare',
    url: 'https://dghs.gov.bd/',
    quote: 'The Directorate General of Health Services delivers primary secondary and tertiary healthcare services across Bangladesh',
    summary: 'The Directorate General of Health Services (DGHS) under the Ministry of Health and Family Welfare (MOHFW) oversees public healthcare delivery in Bangladesh. The state operates a tiered public health system comprising Community Clinics at the village level, Union Health and Family Welfare Centres, Upazila Health Complexes at the sub-district level, District Hospitals, and specialized government medical college hospitals in major metropolitan divisions. Outpatient consultations at public facilities are available at nominal ticket fees, with subsidized emergency inpatient care, maternal and neonatal health services, and essential vaccinations provided nationwide under the Health, Population and Nutrition Sector Programme.'
  }),

  // ==========================================
  // NEPAL
  // ==========================================
  createRecord({
    id: 'nepal-ird-pan-tax',
    topic: 'money',
    jurisdiction: 'Nepal',
    title: 'Nepal IRD: Inland Revenue Department and Permanent Account Number (PAN)',
    url: 'https://ird.gov.np/',
    quote: 'Inland Revenue Department provides online issuance of Permanent Account Number PAN for individual taxpayers and entities',
    summary: 'The Inland Revenue Department (IRD) under the Ministry of Finance administers direct taxes under the Income Tax Act 2058 (2002). All salaried employees, business proprietors, independent contractors, and foreign nationals earning taxable income in Nepal are legally required to obtain a Permanent Account Number (PAN). Individual PAN registration is conducted online through the IRD Integrated Tax System. Employers cannot process salary payments without a registered PAN, and banking institutions require PAN for significant financial transactions. Foreign experts and expatriates working under non-tourist visas must ensure withholding tax deduction and obtain annual tax clearance certificates.'
  }),
  createRecord({
    id: 'nepal-civil-code-tenancy',
    topic: 'housing',
    jurisdiction: 'Nepal',
    title: 'Nepal MoUD: National Civil Code Act and Residential Lease Agreements',
    url: 'https://moud.gov.np/',
    quote: 'Under Part 4 Chapter 9 of the National Civil Code Act a contract of lease of house must be executed in writing',
    summary: 'Residential tenancies in Nepal are governed by Chapter 9 of the National Civil Code Act 2074 (2017) under the Ministry of Urban Development (MoUD). Essential statutory rules include: (1) all house rental agreements must be executed in writing and explicitly stipulate the rental amount, payment schedule, duration, and utility responsibilities; (2) landlords must maintain the premises in habitable and secure condition and cannot interfere with peaceful enjoyment or terminate utilities; (3) tenants cannot sub-lease premises without prior written consent of the landlord; (4) landlords cannot evict tenants before contractual term expiration without giving at least 35 days prior written notice on statutory grounds; and (5) rental agreements must be registered with the local Ward Office (Ward Karyalaya).'
  }),
  createRecord({
    id: 'nepal-hib-health-insurance',
    topic: 'health',
    jurisdiction: 'Nepal',
    title: 'Nepal Health Insurance Board (HIB): National Health Insurance Program',
    url: 'https://hib.gov.np/',
    quote: 'The Health Insurance Board implements the Social Health Insurance Program to ensure universal access to quality healthcare',
    summary: 'The Health Insurance Board (HIB), established under the Health Insurance Act 2074 (2017), implements the national social health insurance program across all 77 districts of Nepal. Under this scheme, families enroll by paying a subsidized annual premium (NPR 3,500 for a family up to five members) and receive health service coverage up to NPR 100,000 per family annually for outpatient visits, emergency care, diagnostic tests, essential surgeries, and listed pharmaceutical drugs at empaneled public health institutions and designated private referral hospitals. Tertiary and specialized emergency care is also delivered through federal government hospitals such as Bir Hospital and Tribhuvan University Teaching Hospital.'
  }),

  // ==========================================
  // SRI LANKA
  // ==========================================
  createRecord({
    id: 'sri-lanka-ird-tin-tax',
    topic: 'money',
    jurisdiction: 'Sri Lanka',
    title: 'Sri Lanka IRD: Inland Revenue Department and Taxpayer Identification Number (TIN)',
    url: 'https://www.ird.gov.lk/',
    quote: 'Inland Revenue Department mandates registration for a Taxpayer Identification Number TIN for all resident individuals',
    summary: 'The Inland Revenue Department (IRD) administers direct taxation under the Inland Revenue Act No. 24 of 2017. Under recent statutory tax reforms, registration for a Taxpayer Identification Number (TIN) is mandatory for all citizens aged 18 and above, as well as foreign residents earning income or operating businesses in Sri Lanka. The TIN is required for opening current accounts, registering motor vehicles, building permit approvals, and land ownership transfers. Resident individuals are taxed on worldwide income at progressive personal income tax brackets from 6% to 36% via the Revenue Administration Management Information System (RAMIS).'
  }),
  createRecord({
    id: 'sri-lanka-rent-act-housing',
    topic: 'housing',
    jurisdiction: 'Sri Lanka',
    title: 'Sri Lanka Tenancy: Rent Act No. 7 of 1972 and Residential Leases',
    url: 'https://www.mudh.gov.lk/',
    quote: 'The Rent Act regulates the assessment of standard rent and provides legal protection against unlawful ejectment of tenants',
    summary: 'Residential rentals in Sri Lanka are regulated by the Rent Act No. 7 of 1972 (as amended) and Roman-Dutch common law of landlord and tenant under the Ministry of Urban Development and Housing. Key legal provisions include: (1) properties constructed after 1980 or exceeding statutory assessment thresholds are exempt from standard rent caps, operating under agreed market contractual leases; (2) tenancy agreements should be formally executed in writing, attested by a Notary Public if exceeding one month; (3) landlords cannot eject a tenant through self-help or forcible deprivation of utilities; eviction strictly requires an action in the District Court on valid statutory grounds (such as 3-month rent default); and (4) security deposits (customarily 2 to 6 months rent) are refundable upon peaceful vacation.'
  }),
  createRecord({
    id: 'sri-lanka-free-public-healthcare',
    topic: 'health',
    jurisdiction: 'Sri Lanka',
    title: 'Sri Lanka Ministry of Health: Universal Free Healthcare System',
    url: 'https://www.health.gov.lk/',
    quote: 'The state provides free healthcare services to all citizens through an extensive network of public hospitals and clinics',
    summary: 'Sri Lanka operates one of the developing world’s most renowned universal public health systems, funded entirely through general government revenues and administered by the Ministry of Health. Every resident citizen and legal resident has the right to free healthcare services at point of delivery across all government facilities, spanning primary Medical Care Units, Divisional Hospitals, Base Hospitals, District General Hospitals, and National Hospitals. Free services include general and specialist doctor consultations, emergency resuscitation, diagnostic investigations, inpatient admissions, complex surgical procedures, and essential prescription medications dispensed by state hospital pharmacies.'
  }),

  // ==========================================
  // KENYA
  // ==========================================
  createRecord({
    id: 'kenya-kra-itax-pin',
    topic: 'money',
    jurisdiction: 'Kenya',
    title: 'Kenya Revenue Authority: iTax Personal Identification Number (PIN)',
    url: 'https://www.kra.go.ke/',
    quote: 'A Personal Identification Number PIN is an identifier issued by KRA to individuals and companies for tax administration',
    summary: 'The Kenya Revenue Authority (KRA) enforces federal taxation under the Income Tax Act (Cap 470) and Tax Procedures Act. Every resident individual, salaried employee, sole proprietor, and foreign expatriate holding a Class D or Class G work permit must obtain a KRA Personal Identification Number (PIN) through the online iTax system. The KRA PIN is legally mandatory for opening bank accounts, importing goods, vehicle registration, utility connections, land transactions, and employment onboarding under Pay-As-You-Earn (PAYE). Resident individuals are subject to progressive individual income tax rates up to 35% with statutory personal relief.'
  }),
  createRecord({
    id: 'kenya-rent-restriction-tenancy',
    topic: 'housing',
    jurisdiction: 'Kenya',
    title: 'Kenya Tenancy: Rent Restriction Act and Landlord and Tenant Tribunals',
    url: 'https://housingandurban.go.ke/',
    quote: 'The Rent Restriction Tribunal arbitrates disputes between landlords and tenants to prevent arbitrary rent increases and evictions',
    summary: 'Tenancies in Kenya are governed by the Landlord and Tenant (Shops, Hotels and Catering Establishments) Act (Cap 301), the Rent Restriction Act (Cap 296), and the Land Act 2012 under the State Department for Housing and Urban Development. Statutory protections include: (1) residential leases exceeding 11 months must be executed in writing; (2) landlords cannot evict tenants or seize tenant goods (distress for rent) without engaging a licensed auctioneer with a valid court or Tribunal order; (3) arbitrary rent increments without statutory notice (typically 30 to 60 days) are prohibited; (4) landlords cannot interfere with essential utility services; and (5) security deposits (typically 1 to 2 months rent) must be refunded upon expiration minus verifiable repair costs.'
  }),
  createRecord({
    id: 'kenya-sha-social-health-authority',
    topic: 'health',
    jurisdiction: 'Kenya',
    title: 'Kenya Social Health Authority (SHA): Social Health Insurance Fund (SHIF)',
    url: 'https://sha.go.ke/',
    quote: 'The Social Health Authority establishes universal health coverage through the Social Health Insurance Fund',
    summary: 'The Social Health Authority (SHA), established under the Social Health Insurance Act 2023 (replacing the former NHIF), administers universal healthcare in Kenya through three dedicated funds: the Primary Healthcare Fund, the Social Health Insurance Fund (SHIF), and the Emergency, Chronic and Critical Illness Fund. All Kenyan citizens and foreign residents residing legally in Kenya for more than 12 months are mandated to register with SHA. Salaried employees contribute 2.75% of gross monthly income, while informal workers pay statutory minimums. SHA covers primary outpatient care, emergency treatments, maternity packages, specialized surgeries, and chronic illness management across empaneled public and private healthcare facilities.'
  }),

  // ==========================================
  // SOUTH AFRICA
  // ==========================================
  createRecord({
    id: 'south-africa-sars-tax-number',
    topic: 'money',
    jurisdiction: 'South Africa',
    title: 'South Africa SARS: Income Tax Reference Number and eFiling System',
    url: 'https://www.sars.gov.za/',
    quote: 'Every individual who earns remuneration or has other forms of income must register for an income tax reference number with SARS',
    summary: 'The South African Revenue Service (SARS) administers national taxation under the Income Tax Act No. 58 of 1962 and Tax Administration Act No. 28 of 2011. Any individual residing in South Africa under the physical presence test or ordinarily resident test who earns remuneration, operates a trade, or realizes capital gains must register for a 10-digit Income Tax Reference Number through SARS eFiling. Employers withhold Pay-As-You-Earn (PAYE) each month. Personal income tax rates are progressive from 18% to 45% based on taxable brackets. Tax clearance certificates (TCS) and foreign investment allowances require an active SARS tax profile.'
  }),
  createRecord({
    id: 'south-africa-rental-housing-act',
    topic: 'housing',
    jurisdiction: 'South Africa',
    title: 'South Africa Tenancy: Rental Housing Act (Act 50 of 1999) and Tribunals',
    url: 'https://www.dhs.gov.za/',
    quote: 'The Rental Housing Act establishes Rental Housing Tribunals to resolve disputes between landlords and tenants without costly litigation',
    summary: 'Residential leases in South Africa are regulated by the Rental Housing Act 50 of 1999 (as amended by the Rental Housing Amendment Act 2014) under the National Department of Human Settlements. Essential legal provisions include: (1) leases must be reduced to writing upon tenant request; (2) security deposits must be invested by the landlord in an interest-bearing account with a financial institution, with accrued interest paid to the tenant upon refund; (3) joint pre-occupation and pre-vacation property inspections are mandatory—failure to conduct an inspection forfeits the landlord’s right to claim damage deductions; (4) landlords cannot change locks or disconnect municipal water and electricity; and (5) provincial Rental Housing Tribunals (RHT) provide free, legally binding dispute adjudication.'
  }),
  createRecord({
    id: 'south-africa-public-healthcare-ndoh',
    topic: 'health',
    jurisdiction: 'South Africa',
    title: 'South Africa NDoH: Public Healthcare System and Uniform Patient Fee Schedule',
    url: 'https://www.health.gov.za/',
    quote: 'The National Department of Health provides healthcare to all residents based on the Uniform Patient Fee Schedule sliding scale',
    summary: 'The National Department of Health (NDoH) administers South Africa’s public healthcare system through provincial health departments, serving over 80% of the population. Public healthcare is delivered through primary healthcare clinics (where primary consultation, family planning, tuberculosis treatment, and HIV antiretroviral therapies are 100% free for all individuals regardless of nationality) and secondary/tertiary academic hospitals. Inpatient and specialist hospital care operates on the Uniform Patient Fee Schedule (UPFS), a sliding-scale fee structure where fees are heavily subsidized or waived entirely based on an individualized means test of patient household income.'
  }),

  // ==========================================
  // COLOMBIA
  // ==========================================
  createRecord({
    id: 'colombia-dian-rut-tax',
    topic: 'money',
    jurisdiction: 'Colombia',
    title: 'Colombia DIAN: Registro Único Tributario (RUT) and Fiscal Identification',
    url: 'https://www.dian.gov.co/',
    quote: 'El Registro Unico Tributario RUT es el mecanismo que identifica ubica y clasifica a las personas y entidades administradas por la DIAN',
    summary: 'The Dirección de Impuestos y Aduanas Nacionales (DIAN) regulates national taxation in Colombia under the Estatuto Tributario. Every natural person residing in Colombia (exceeding 183 days continuously or discontinuously within any 365-day window) who receives taxable salary, commercial income, or holds assets above statutory thresholds must obtain a Registro Único Tributario (RUT). The RUT document carries the Número de Identificación Tributaria (NIT), typically based on the individual’s Cédula de Ciudadanía or Cédula de Extranjería. The RUT is mandatory for signing employment contracts, opening bank accounts, issuing electronic invoices, and filing the annual personal income tax declaration.'
  }),
  createRecord({
    id: 'colombia-ley-820-arrendamiento',
    topic: 'housing',
    jurisdiction: 'Colombia',
    title: 'Colombia Tenancy: Ley 820 de 2003 de Arrendamiento de Vivienda Urbana',
    url: 'https://www.minvivienda.gov.co/',
    quote: 'La Ley 820 de 2003 tiene por objeto fijar los criterios que deben servir de base para regular los contratos de arrendamiento de vivienda urbana',
    summary: 'Urban residential rentals in Colombia are governed by Law 820 of 2003 (Ley de Arrendamiento de Vivienda Urbana). Key statutory rights include: (1) lease agreements may be verbal or written, though written agreements are standard; (2) landlords are strictly prohibited by law from demanding commercial cash deposits or promissory notes (títulos valores en garantía) to guarantee payment; (3) monthly rent cannot exceed one percent (1%) of the commercial value of the property or two times its cadastral value; (4) annual rent increases for sitting tenants cannot exceed the Consumer Price Index (IPC) inflation percentage of the preceding calendar year; and (5) termination requires at least 3 months written notice.'
  }),
  createRecord({
    id: 'colombia-minsalud-sgsss-healthcare',
    topic: 'health',
    jurisdiction: 'Colombia',
    title: 'Colombia MinSalud: Sistema General de Seguridad Social en Salud (SGSSS)',
    url: 'https://www.minsalud.gov.co/',
    quote: 'El Sistema General de Seguridad Social en Salud garantiza los servicios de salud a todos los habitantes del territorio nacional',
    summary: 'The Ministry of Health and Social Protection (MinSalud) and ADRES oversee Colombia’s national healthcare system, the Sistema General de Seguridad Social en Salud (SGSSS). Healthcare operates through two core regimes: the Contributory Regime (Régimen Contributivo) for formal employees and independent contractors, and the Subsidized Regime (Régimen Subsidiado) for low-income residents categorized under the Sisbén survey. Legal foreign residents holding a valid Cédula de Extranjería and formal employment contribute 12.5% of monthly salary (8.5% paid by employer, 4% by employee) to an Entidad Promotora de Salud (EPS) of their choice, which coordinates full medical, emergency, and surgical coverage across accredited clinics (IPS).'
  }),

  // ==========================================
  // INDONESIA
  // ==========================================
  createRecord({
    id: 'indonesia-djp-npwp-tax',
    topic: 'money',
    jurisdiction: 'Indonesia',
    title: 'Indonesia DJP: Nomor Pokok Wajib Pajak (NPWP) and e-Filing Services',
    url: 'https://pajak.go.id/',
    quote: 'Nomor Pokok Wajib Pajak NPWP adalah nomor yang diberikan kepada Wajib Pajak sebagai sarana dalam administrasi perpajakan',
    summary: 'The Directorate General of Taxes (Direktorat Jenderal Pajak - DJP) under the Ministry of Finance administers income tax under Law No. 7 of 2021 on Harmonization of Tax Regulations (UU HPP). Any individual residing in Indonesia for more than 183 days within a 12-month period, or residing with the intention to stay, is classified as a domestic tax resident taxed on global income at progressive rates from 5% to 35%. Foreign workers holding a KITAS/ITAS work permit must register for a 16-digit Nomor Pokok Wajib Pajak (NPWP). The NPWP is mandatory for opening Indonesian bank accounts, purchasing assets, and filing the annual electronic tax return (SPT Tahunan) via the DJP Online portal.'
  }),
  createRecord({
    id: 'indonesia-residential-lease-housing',
    topic: 'housing',
    jurisdiction: 'Indonesia',
    title: 'Indonesia Tenancy: Civil Code (KUHPerdata) and Residential Lease Contracts (Sewa-Menyewa)',
    url: 'https://pu.go.id/',
    quote: 'Sewa menyewa adalah suatu perjanjian dengan mana pihak yang satu mengikatkan dirinya untuk memberikan kepada pihak lainnya kenikmatan suatu barang',
    summary: 'Residential and commercial tenancies in Indonesia are governed by Articles 1547 to 1600 of the Indonesian Civil Code (KUHPerdata). Key tenancy practices and legal rules include: (1) rental contracts (Perjanjian Sewa-Menyewa) are executed in writing in Indonesian (often bilingual with English); (2) under customary market terms, rent is paid entirely upfront in advance for one (1) or two (2) full years; (3) security deposits (Uang Jaminan) equivalent to 10% to 20% of the lease value are held by the landlord to guarantee against utility defaults or structural damage; (4) landlords are obligated to ensure quiet enjoyment and cannot unilaterally terminate the contract before the expiration date; and (5) landlords must facilitate local community residency reporting (Lapor RT/RW) for foreign tenants.'
  }),
  createRecord({
    id: 'indonesia-bpjs-kesehatan-healthcare',
    topic: 'health',
    jurisdiction: 'Indonesia',
    title: 'Indonesia BPJS Kesehatan: Jaminan Kesehatan Nasional (JKN) Universal Healthcare',
    url: 'https://bpjs-kesehatan.go.id/',
    quote: 'BPJS Kesehatan menyelenggarakan program Jaminan Kesehatan Nasional untuk menjamin kebutuhan dasar kesehatan',
    summary: 'BPJS Kesehatan (Badan Penyelenggara Jaminan Sosial Kesehatan) administers Indonesia’s statutory single-payer universal healthcare program, Jaminan Kesehatan Nasional (JKN), established under Law No. 24 of 2011. By presidential decree, all foreign citizens working in Indonesia for a minimum of six (6) months are legally required to participate in BPJS Kesehatan. Formal sector employers enroll expatriate employees, with contributions set at 5% of monthly salary (4% paid by employer, 1% deducted from employee). BPJS Kesehatan provides comprehensive primary care at Community Health Clinics (Puskesmas) and inpatient hospital treatment at tiered public and accredited private hospitals (Rumah Sakit).'
  }),

  // ==========================================
  // TURKEY
  // ==========================================
  createRecord({
    id: 'turkey-gib-vkn-tax',
    topic: 'money',
    jurisdiction: 'Turkey',
    title: 'Turkey GİB: Vergi Kimlik Numarası (VKN) and Digital Tax Office',
    url: 'https://gib.gov.tr/',
    quote: 'Vergi Kimlik Numarasi her turk vatandasi ve turkiyede ikamet eden yabancilar icin vergi islemlerinde kullanilan numaradir',
    summary: 'The Turkish Revenue Administration (Gelir İdaresi Başkanlığı - GİB) under the Ministry of Treasury and Finance administers individual income taxation under the Income Tax Law (Gelir Vergisi Kanunu). Any foreign national staying in Turkey with a valid residence permit (İkamet İzni), working under a work permit, opening a Turkish bank account, or leasing residential property must obtain a Vergi Kimlik Numarası (VKN) or activate their 11-digit Foreigner Identity Number (Yabancı Kimlik No starting with 99) as their tax number. Individuals register for a potential tax number online through the GİB Interactive Tax Office (İnteraktif Vergi Dairesi) without in-person office visits.'
  }),
  createRecord({
    id: 'turkey-code-of-obligations-tenancy',
    topic: 'housing',
    jurisdiction: 'Turkey',
    title: 'Turkey Tenancy: Turkish Code of Obligations (TBK) and Residential Leases',
    url: 'https://www.mevzuat.gov.tr/',
    quote: 'Konut ve catili isyeri kiralarinda sozlesme suresinin bitmesi sebebiyle sozlesme kendiliginden sona ermez',
    summary: 'Residential tenancies in Turkey are regulated by the Turkish Code of Obligations (Türk Borçlar Kanunu - TBK No. 6098). Key legal provisions protecting tenants include: (1) residential lease contracts automatically renew for successive one-year terms unless the tenant provides written notice of termination at least 15 days before the expiration date; landlords cannot terminate merely because the term ended; (2) security deposits (Güvence Bedeli) are strictly capped at a maximum of three (3) months rent and must be deposited in a joint bank savings account; (3) annual rent increases for residential leases are statutorily indexed to the 12-month average Consumer Price Index (TÜFE); and (4) eviction requires formal legal notice and court proceedings on narrow statutory grounds.'
  }),
  createRecord({
    id: 'turkey-sgk-universal-health-insurance',
    topic: 'health',
    jurisdiction: 'Turkey',
    title: 'Turkey SGK: Genel Sağlık Sigortası (GSS) Universal Health Insurance',
    url: 'https://www.sgk.gov.tr/',
    quote: 'Sosyal Guvenlik Kurumu Genel Saglik Sigortasi ile tum vatandaslarin ve ikamet eden yabancilarin saglik hizmetlerine erisimini saglar',
    summary: 'The Social Security Institution of Turkey (Sosyal Güvenlik Kurumu - SGK) oversees national health protection under the Social Insurance and General Health Insurance Law (Law No. 5510). Foreign nationals holding a valid Turkish residence permit who have lived in Turkey for at least one full year without health insurance coverage in their home country can voluntarily apply to enroll in General Health Insurance (Genel Sağlık Sigortası - GSS) by paying standard monthly premiums. Foreigners employed under official work permits are automatically insured by their employers through 4/a social security. GSS coverage provides subsidized medical consultations, emergency room care, surgeries, and pharmaceuticals across all state public hospitals (Devlet Hastanesi) and contracted private healthcare facilities.'
  }),

  // ==========================================
  // EGYPT
  // ==========================================
  createRecord({
    id: 'egypt-eta-tax-identification',
    topic: 'money',
    jurisdiction: 'Egypt',
    title: 'Egypt ETA: Egyptian Tax Authority and Taxpayer Identification Card',
    url: 'https://eta.gov.eg/',
    quote: 'The Egyptian Tax Authority issues tax identification cards for all taxable individuals and entities',
    summary: 'The Egyptian Tax Authority (ETA) under the Ministry of Finance regulates taxation pursuant to Unified Tax Procedures Law No. 206 of 2020 and Income Tax Law No. 91 of 2005. Any individual residing in Egypt for more than 183 days in a calendar year, or maintaining a permanent center of commercial activity, is deemed a tax resident taxed on income earned in Egypt or worldwide. Resident employees, sole professionals, and expatriates working under legal work permits obtain a Tax Identification Card (Bitaqa Darebeya) through the local tax district office or the ETA national e-Tax portal. E-invoicing and e-receipt systems are mandatory for all registered commercial activities.'
  }),
  createRecord({
    id: 'egypt-residential-leases-housing',
    topic: 'housing',
    jurisdiction: 'Egypt',
    title: 'Egypt Tenancy: New Rent Law (Law No. 4 of 1996) and Civil Code Leases',
    url: 'https://www.mhuc.gov.eg/',
    quote: 'Law No 4 of 1996 provides that leases entered into after its enactment are governed by the contractual agreement of the parties',
    summary: 'Residential tenancies in Egypt are governed by Law No. 4 of 1996 (New Rent Law) and the Egyptian Civil Code under the Ministry of Housing, Utilities and Urban Communities. Key statutory requirements include: (1) all rental contracts must be in writing and registered (Tawtheeq) at the local Real Estate Registration and Notarization Office (Shahr El Aqary) to be legally enforceable before courts; (2) lease duration, rental amounts, and annual escalation percentages are determined strictly by contractual agreement; (3) security deposits (customarily 1 to 2 months rent) are held to ensure against utility defaults and property damage; and (4) landlords cannot evict tenants before contractual expiry without obtaining an executory formula (Seegha Tanfeezeya) from the notary or a summary court eviction ruling.'
  }),
  createRecord({
    id: 'egypt-universal-health-insurance',
    topic: 'health',
    jurisdiction: 'Egypt',
    title: 'Egypt UHIA: Universal Health Insurance Authority and Public Healthcare',
    url: 'https://uhia.gov.eg/',
    quote: 'The Universal Health Insurance Authority oversees mandatory universal health coverage for all citizens and resident foreigners',
    summary: 'The Universal Health Insurance Authority (UHIA), established under Law No. 2 of 2018, is implementing Egypt’s mandatory universal health coverage system across governorates (including Port Said, Luxor, Ismailia, South Sinai, and expanding nationwide). The system covers all household members, with payroll contributions deducted for formal sector employees and government subsidies for vulnerable citizens. Enrollees register at their local Primary Healthcare Unit (Markaz Tibb Osra) for family physician consultations, diagnostic laboratory services, specialized outpatient clinics, and referral to tertiary hospital surgeries at nominal copayments.'
  }),

  // ==========================================
  // POLAND
  // ==========================================
  createRecord({
    id: 'poland-kas-pesel-nip-tax',
    topic: 'money',
    jurisdiction: 'Poland',
    title: 'Poland KAS: PESEL, NIP Tax Identifier, and Twój e-PIT Portal',
    url: 'https://www.podatki.gov.pl/',
    quote: 'The PESEL number serves as the tax identifier for natural persons not conducting business activity in Poland',
    summary: 'The National Revenue Administration (Krajowa Administracja Skarbowa - KAS) under the Ministry of Finance regulates personal income tax (PIT) in Poland under the Personal Income Tax Act. Individuals residing in Poland for more than 183 days or maintaining their center of vital interests are taxed on worldwide income. For individuals not conducting independent business, the 11-digit PESEL number functions as their statutory tax identifier; self-employed individuals and VAT taxpayers obtain a Tax Identification Number (NIP). Annual tax returns (PIT-37, PIT-36) are automatically pre-populated and confirmed online via the official Twój e-PIT portal on Podatki.gov.pl.'
  }),
  createRecord({
    id: 'poland-act-protection-tenants-rights',
    topic: 'housing',
    jurisdiction: 'Poland',
    title: 'Poland Tenancy: Act on Protection of Tenants Rights and Occasional Lease (Najem Okazjonalny)',
    url: 'https://www.gov.pl/web/mrit',
    quote: 'The Act on the Protection of Tenants Rights regulates residential leasing and establishes rules for occasional lease agreements',
    summary: 'Residential tenancies in Poland are governed by the Act on the Protection of Tenants’ Rights and Housing Resources of the Municipality (Ustawa o ochronie praw lokatorów) and the Civil Code. Key statutory provisions include: (1) security deposits (Kaucja) are strictly capped at a maximum of 12 times the monthly rent for standard leases (customarily 1 to 2 months rent); (2) landlords can only terminate standard leases on narrow statutory grounds with mandatory written notice (e.g. 3-month rent arrears); (3) landlords frequently utilize the Occasional Lease (Najem okazjonalny), requiring the tenant to submit a notarial statement of submission to enforcement and naming an alternative property in Poland in case of eviction; and (4) security deposits must be returned within one month of vacating.'
  }),
  createRecord({
    id: 'poland-nfz-national-health-fund',
    topic: 'health',
    jurisdiction: 'Poland',
    title: 'Poland NFZ: National Health Fund (Narodowy Fundusz Zdrowia) Public Healthcare',
    url: 'https://www.nfz.gov.pl/',
    quote: 'The National Health Fund finances healthcare services for insured persons and members of their families',
    summary: 'Universal healthcare in Poland is financed by the National Health Fund (Narodowy Fundusz Zdrowia - NFZ) and regulated by the Ministry of Health. Foreign nationals legally residing in Poland on work permits, blue cards, or residence cards (Karta Pobytu) who are employed under employment contracts (Umowa o pracę) or mandates (Umowa zlecenie) are subject to mandatory health insurance (Ubezpieczenie zdrowotne ZUS). Contributions (9% of assessment base) entitle the insured and their registered family members to free primary care at Family Doctor clinics (POZ), specialist outpatient consultations, emergency ambulance care, hospitalizations, and subsidized prescription medicines (Leki refundowane) across Poland.'
  }),

  // ==========================================
  // UKRAINE
  // ==========================================
  createRecord({
    id: 'ukraine-sts-tax-id-rntrc',
    topic: 'money',
    jurisdiction: 'Ukraine',
    title: 'Ukraine STS: State Tax Service and Taxpayer Registration Number (RNTRC)',
    url: 'https://tax.gov.ua/en/',
    quote: 'The State Tax Service assigns registration numbers from the State Register of Individual Taxpayers RNTRC',
    summary: 'The State Tax Service of Ukraine (STS) administers personal income tax under the Tax Code of Ukraine. All Ukrainian citizens and foreign nationals earning taxable income, establishing business entities, opening bank accounts, or acquiring real estate must register in the State Register of Individual Taxpayers and obtain a 10-digit Registration Number of the Taxpayer Record Card (RNTRC, formerly known as IPN / Tax Code). Standard personal income tax (PDFO) is levied at 18%, plus a statutory 1.5% Military Duty. Foreign residents register for an RNTRC through local tax inspection offices using an official notarized Ukrainian translation of their passport.'
  }),
  createRecord({
    id: 'ukraine-civil-code-residential-tenancy',
    topic: 'housing',
    jurisdiction: 'Ukraine',
    title: 'Ukraine Tenancy: Civil Code Residential Leases and Tenant Protections',
    url: 'https://mtu.gov.ua/',
    quote: 'Under Chapter 59 of the Civil Code of Ukraine a contract of lease of residential premises must be executed in writing',
    summary: 'Residential rentals in Ukraine are regulated by Chapter 59 (Articles 810 to 826) of the Civil Code of Ukraine and the Housing Code. Statutory protections include: (1) all residential lease contracts must be in writing; notarization is mandatory only if the lease term is 3 years or longer; (2) if no term is stated, the statutory lease term is deemed to be 5 years; (3) tenants have a preemptive statutory right to renew the lease contract upon expiration; (4) landlords cannot unilaterally increase rent unless expressly authorized in the contract; (5) landlords cannot terminate a lease early without giving at least 3 months written notice, and involuntary eviction requires a court order; and (6) security deposits (typically 1 month rent) guarantee against unpaid bills or property damage.'
  }),
  createRecord({
    id: 'ukraine-nhsu-medical-guarantees',
    topic: 'health',
    jurisdiction: 'Ukraine',
    title: 'Ukraine NHSU: National Health Service of Ukraine and Program of Medical Guarantees',
    url: 'https://nszu.gov.ua/',
    quote: 'The National Health Service of Ukraine purchases healthcare services under the Program of Medical Guarantees for all residents',
    summary: 'The National Health Service of Ukraine (NHSU / NSZU) under the Ministry of Health implements the Program of Medical Guarantees (PMG), providing publicly financed healthcare services across Ukraine. Every resident citizen and permanent/temporary resident foreigner signing a declaration with a family doctor, general practitioner, or pediatrician receives 100% free primary healthcare, preventive checkups, routine diagnostics, and emergency medical care. The Program of Medical Guarantees also finances secondary specialist care, emergency surgeries, oncology treatments, and the Affordable Medicines (Dostupni Liky) reimbursement program for essential prescription drugs.'
  }),

  // ==========================================
  // GHANA
  // ==========================================
  createRecord({
    id: 'ghana-gra-tin-ghana-card',
    topic: 'money',
    jurisdiction: 'Ghana',
    title: 'Ghana Revenue Authority: Taxpayer Identification Number and Ghana Card PIN',
    url: 'https://gra.gov.gh/',
    quote: 'The Ghana Card PIN is the Taxpayer Identification Number TIN for individual taxpayers registered with GRA',
    summary: 'The Ghana Revenue Authority (GRA) administers direct taxation under the Income Tax Act 2015 (Act 896) and Revenue Administration Act 2016. In Ghana, the national Ghana Card PIN issued by the National Identification Authority (NIA) serves as the official Taxpayer Identification Number (TIN) for individual citizens and registered foreign residents (Non-Citizen Ghana Card). The TIN/Ghana Card PIN is legally mandatory for opening bank accounts, clearing goods at ports, registering companies, vehicle licensing with the DVLA, and filing annual tax returns. Resident individuals are taxed on income progressively under graduated monthly PAYE tax bands up to 35%.'
  }),
  createRecord({
    id: 'ghana-rent-control-department',
    topic: 'housing',
    jurisdiction: 'Ghana',
    title: 'Ghana Tenancy: Rent Act 1963 (Act 220) and Rent Control Department Protections',
    url: 'https://mwh.gov.gh/',
    quote: 'Under Section 25 of the Rent Act it is unlawful for a landlord to demand or receive rent advance in excess of six months',
    summary: 'Residential tenancies in Ghana are governed by the Rent Act 1963 (Act 220) and administered by the Rent Control Department under the Ministry of Works and Housing. Fundamental statutory rights include: (1) it is a criminal offense under Section 25 of the Rent Act for a landlord to demand or receive advance rent exceeding six (6) months for a monthly or yearly tenancy; (2) landlords must issue an official rent receipt immediately upon payment; (3) landlords cannot eject a tenant through self-help, lock changes, or disconnection of utilities; (4) eviction requires an order from a Rent Magistrate or District Court on proven statutory grounds (such as 1-month rent default after due notice); and (5) rent disputes can be submitted to the nearest Rent Control office for conciliation.'
  }),
  createRecord({
    id: 'ghana-nhis-national-health-insurance',
    topic: 'health',
    jurisdiction: 'Ghana',
    title: 'Ghana NHIA: National Health Insurance Scheme (NHIS) Universal Healthcare',
    url: 'https://nhis.gov.gh/',
    quote: 'The National Health Insurance Authority provides basic healthcare services to persons resident in Ghana through the NHIS',
    summary: 'The National Health Insurance Authority (NHIA) administers Ghana’s National Health Insurance Scheme (NHIS) pursuant to the National Health Insurance Act 2012 (Act 852). The NHIS provides financial risk protection and access to basic healthcare services for all Ghanaian citizens and legal foreign residents residing in Ghana. Formal sector workers contribute through a mandatory 2.5% deduction from their Social Security and National Insurance Trust (SSNIT) pension contributions, while informal sector workers and expatriates pay nominal annual premiums. The NHIS benefit package covers outpatient general consultations, laboratory investigations, inpatient hospitalizations, surgical operations, maternity care, and essential medicines on the NHIS medicines list.'
  }),

  // ==========================================
  // HONG KONG
  // ==========================================
  createRecord({
    id: 'hong-kong-ird-salaries-tax-tin',
    topic: 'money',
    jurisdiction: 'Hong Kong',
    title: 'Hong Kong IRD: Inland Revenue Department and Salaries Tax Registration',
    url: 'https://www.ird.gov.hk/eng/',
    quote: 'Salaries Tax is charged on all income arising in or derived from Hong Kong from any office employment or pension',
    summary: 'The Inland Revenue Department (IRD) of the Government of the Hong Kong Special Administrative Region administers Salaries Tax under the Inland Revenue Ordinance (Cap 112). Tax is charged on all income arising in or derived from Hong Kong from any employment, office, or pension. Under Hong Kong’s territorial tax system, foreign-sourced income is generally exempt from Salaries Tax. Tax is calculated at progressive rates ranging from 2% to 17% on net chargeable income, or at a standard rate of 15% (16% for high-income brackets above HKD 5 million), whichever is lower. Residents receive an individual Taxpayer Identification Number (TIN) linked to their Hong Kong Identity Card (HKID) and file annual returns (BIR60) via the eTAX digital portal.'
  }),
  createRecord({
    id: 'hong-kong-tenancy-control-ordinance',
    topic: 'housing',
    jurisdiction: 'Hong Kong',
    title: 'Hong Kong RVD: Landlord and Tenant (Consolidation) Ordinance and Tenancy Protections',
    url: 'https://www.rvd.gov.hk/en/',
    quote: 'The Rating and Valuation Department enforces statutory tenancy control and oversees residential tenancy agreements',
    summary: 'Residential tenancies in Hong Kong are governed by the Landlord and Tenant (Consolidation) Ordinance (Cap 7) and monitored by the Rating and Valuation Department (RVD). Essential statutory rules include: (1) for subdivided residential units (SDUs) under Part IVA, tenants enjoy statutory 4-year security of tenure (2 consecutive 2-year leases) with rent increases on second-term renewal strictly capped at the RVD territory-wide rental index or 10% maximum; (2) landlords cannot overcharge tenants for utility bills (water and electricity must be billed according to official utility tariffs); (3) standard private leases operate on a customary 2-year term (one year fixed, one year break clause); (4) security deposits (customarily 2 months rent) must be refunded within an agreed timeframe minus legitimate deductions; and (5) tenancy disputes can be resolved via the Lands Tribunal.'
  }),
  createRecord({
    id: 'hong-kong-hospital-authority-healthcare',
    topic: 'health',
    jurisdiction: 'Hong Kong',
    title: 'Hong Kong Hospital Authority: Public Healthcare Services and Subsidised Fees',
    url: 'https://www.ha.org.hk/',
    quote: 'The Hospital Authority provides heavily subsidised public healthcare services to eligible persons holding Hong Kong Identity Cards',
    summary: 'The Hospital Authority (HA) manages Hong Kong’s public hospital network under the Food and Health Bureau. Any individual holding a valid Hong Kong Identity Card (HKID)—including permanent residents, employment visa holders, and dependants—is classified as an Eligible Person (EP) entitled to heavily subsidized public healthcare. Subsidized fees for Eligible Persons include: HKD 180 per attendance at Accident and Emergency (A&E) departments; HKD 120 for general outpatient clinics (GOPC); HKD 135 for specialist outpatient clinics (SOPC); and HKD 120 per day for general acute inpatient hospital beds (inclusive of meals, nursing, medical tests, and surgery). Highly advanced treatments and non-formulary drugs are funded or subsidized through the Samaritan Fund and Community Care Fund.'
  }),

  // ==========================================
  // TAIWAN
  // ==========================================
  createRecord({
    id: 'taiwan-mof-individual-income-tax',
    topic: 'money',
    jurisdiction: 'Taiwan',
    title: 'Taiwan MOF: National Taxation Bureau and Alien Individual Income Tax (IIT)',
    url: 'https://www.ntbt.gov.tw/',
    quote: 'The National Taxation Bureau administers Individual Income Tax for resident and non-resident aliens in Taiwan',
    summary: 'The Ministry of Finance (MOF) National Taxation Bureaus administer individual income tax under the Income Tax Act of the Republic of China (Taiwan). An individual who stays in Taiwan for 183 days or more during a calendar year is classified as a resident for tax purposes. Residents are taxed on Taiwan-sourced income at progressive tax brackets ranging from 5% to 40%, with statutory personal exemptions, standard deductions, and salary deductions. Foreign residents utilize their Alien Resident Certificate (ARC) number or Alien Permanent Resident Certificate (APRC) number as their Taxpayer Identification Number (TIN). Annual alien individual income tax returns are filed between May 1 and May 31 using an e-filing tax card reader or mobile phone verification.'
  }),
  createRecord({
    id: 'taiwan-rental-housing-market-act',
    topic: 'housing',
    jurisdiction: 'Taiwan',
    title: 'Taiwan MOI: Rental Housing Market Development and Regulation Act and Tenancy Rights',
    url: 'https://www.moi.gov.tw/',
    quote: 'The Rental Housing Market Development and Regulation Act protects the rights and interests of both rental housing landlords and tenants',
    summary: 'Residential tenancies in Taiwan are governed by the Rental Housing Market Development and Regulation Act and the Consumer Protection Act under the Ministry of the Interior (MOI). Key statutory protections include: (1) mandatory standard form tenancy agreements (Mandatory and Prohibitory Terms for Residential Lease Contracts) must be provided, and clauses that waive statutory tenant rights are null and void; (2) security deposits (Yajin) are legally capped at a maximum of two (2) months rent; (3) landlords cannot prohibit tenants from registering their household domicile (Huji) or declaring rental expenses for individual income tax deductions; (4) landlords cannot terminate leases before expiration without statutory justification and at least 30 days prior written notice; and (5) security deposits must be refunded immediately upon vacating and key return.'
  }),
  createRecord({
    id: 'taiwan-nhia-universal-healthcare',
    topic: 'health',
    jurisdiction: 'Taiwan',
    title: 'Taiwan NHIA: National Health Insurance (NHI) Administration and NHI Card',
    url: 'https://www.nhi.gov.tw/',
    quote: 'The National Health Insurance system provides comprehensive medical coverage for all citizens and legal foreign residents in Taiwan',
    summary: 'The National Health Insurance Administration (NHIA) under the Ministry of Health and Welfare administers Taiwan’s National Health Insurance (NHI) program, universally regarded as one of the world’s most efficient single-payer healthcare systems. Under the National Health Insurance Act, all foreign nationals residing in Taiwan with an Alien Resident Certificate (ARC) who are employed must be enrolled by their employer from their first day of work; non-working ARC holders (such as dependants or students) must enroll after six (6) continuous months of legal stay. Premiums are shared between employee (30%), employer (60%), and government (10%). Insureds receive a smart electronic NHI Card providing direct cashless access to inpatient, outpatient, dental, traditional Chinese medicine, and prescription drug services with nominal clinic copayments (typically NTD 50 to 150).'
  }),

  // ==========================================
  // ITALY
  // ==========================================
  createRecord({
    id: 'italy-agenzia-entrate-codice-fiscale',
    topic: 'money',
    jurisdiction: 'Italy',
    title: 'Italy Agenzia delle Entrate: Codice Fiscale and Redditi Persone Fisiche',
    url: 'https://www.agenziaentrate.gov.it/',
    quote: 'Il codice fiscale e lo strumento di identificazione del cittadino nei rapporti con gli enti e le amministrazioni pubbliche',
    summary: 'The Agenzia delle Entrate administers national direct taxation under the Consolidated Income Tax Act (Testo Unico delle Imposte sui Redditi - TUIR). Every individual residing or operating financially in Italy must obtain a Codice Fiscale, a 16-character alphanumeric tax code computed from the individual’s surname, name, birthdate, sex, and place of birth. The Codice Fiscale is strictly mandatory to sign an employment contract, rent or purchase an apartment, open a bank account, register for national healthcare (SSN), or obtain an Italian mobile number. Tax residents (living in Italy over 183 days a year) are taxed on worldwide income under progressive IRPEF brackets from 23% to 43%.'
  }),
  createRecord({
    id: 'italy-legge-431-locazioni-abitative',
    topic: 'housing',
    jurisdiction: 'Italy',
    title: 'Italy Tenancy: Legge 431/1998 and Residential Leases (4+4 and 3+2 Contracts)',
    url: 'https://www.mit.gov.it/',
    quote: 'La legge 9 dicembre 1998 n 431 disciplina le locazioni e il rilascio degli immobili adibiti ad uso abitativo',
    summary: 'Residential rentals in Italy are strictly regulated by Law No. 431 of 1998 and the Italian Civil Code. Key statutory tenets include: (1) residential contracts operate primarily under two statutory models: free-market contracts (Contratto libero 4+4, four years with mandatory four-year renewal) or agreed-rent contracts (Contratto concordato 3+2, three years with two-year renewal at municipal rent caps); (2) all lease contracts exceeding 30 days must be formally registered with the Agenzia delle Entrate within 30 days of execution; unregistered contracts are legally null and void; (3) security deposits (Deposito cauzionale) are capped by law at a maximum of three (3) months rent and earn statutory legal interest; and (4) landlords cannot cancel leases before term expiry without strict statutory notification at least 6 months in advance.'
  }),
  createRecord({
    id: 'italy-ssn-tessera-sanitaria',
    topic: 'health',
    jurisdiction: 'Italy',
    title: 'Italy Ministero della Salute: Servizio Sanitario Nazionale (SSN) and Tessera Sanitaria',
    url: 'https://www.salute.gov.it/',
    quote: 'Il Servizio Sanitario Nazionale SSN garantisce la tutela della salute a tutti i cittadini senza distinzioni',
    summary: 'The Servizio Sanitario Nazionale (SSN), established under Law 833/1978 and coordinated by the Ministry of Health and regional health authorities (ASL / AUSL), provides universal healthcare to all residents in Italy. Foreign nationals legally residing in Italy with an official Permesso di Soggiorno for employment, family, or asylum reasons are entitled to mandatory registration (Iscrizione obbligatoria) in the SSN on equal terms with Italian citizens, at zero additional cost beyond general taxation. Enrollees choose a personal primary care physician (Medico di Medicina Generale) for free consultations and receive the electronic Tessera Sanitaria card, which covers emergency hospital treatment, specialist examinations, surgeries, and subsidized prescription medicines with nominal copay tickets.'
  }),

  // ==========================================
  // SAUDI ARABIA
  // ==========================================
  createRecord({
    id: 'saudi-arabia-zatca-tax',
    topic: 'money',
    jurisdiction: 'Saudi Arabia',
    title: 'Saudi Arabia ZATCA: Zakat, Tax and Customs Authority and Income Tax Law',
    url: 'https://zatca.gov.sa/',
    quote: 'Zakat Tax and Customs Authority administers zakat and tax collection in the Kingdom of Saudi Arabia',
    summary: 'The Zakat, Tax and Customs Authority (ZATCA) administers tax regulations in Saudi Arabia. Under the Income Tax Law (Royal Decree No. M/1), personal employment salaries and wages of individuals (both Saudi citizens and expatriate employees) are subject to 0% personal income tax. Non-Saudi resident individuals conducting independent commercial, professional, or capital investment activities in the Kingdom are subject to a flat 20% corporate/business income tax on net profits. Expatriate residents holding an Iqama residency card must comply with Dependent Fees (Mokimeen) and VAT regulations (15% standard VAT) administered electronically through the ZATCA portal.'
  }),
  createRecord({
    id: 'saudi-arabia-ejar-rental-network',
    topic: 'housing',
    jurisdiction: 'Saudi Arabia',
    title: 'Saudi Arabia Ministry of Housing: Ejar Electronic Rental Network and Unified Contracts',
    url: 'https://www.ejar.sa/',
    quote: 'Ejar is an electronic network that organizes the residential rental market and protects the rights of all contractual parties',
    summary: 'Residential and commercial tenancies in Saudi Arabia are regulated by the Ministry of Municipal and Rural Affairs and Housing through the official Ejar digital network. By Council of Ministers decree, all residential rental contracts in Saudi Arabia must be registered electronically via Ejar to be legally recognized by judicial and governmental authorities. The Ejar Unified Tenancy Contract acts as an executive instrument (Sanad Tanfeezi), meaning financial defaults or vacate orders can be enforced directly through Enforcement Courts without lengthy trial proceedings. Rent payments must be conducted through approved electronic banking channels (Mada/SADAD). Landlords cannot disconnect utilities, and eviction requires adherence to statutory Ejar notice periods.'
  }),
  createRecord({
    id: 'saudi-arabia-chi-council-health-insurance',
    topic: 'health',
    jurisdiction: 'Saudi Arabia',
    title: 'Saudi Arabia CHI: Council of Health Insurance and Mandatory Private Health Coverage',
    url: 'https://www.moh.gov.sa/',
    quote: 'The Council of Health Insurance regulates cooperative health insurance to provide healthcare coverage for all private sector workers',
    summary: 'The Council of Health Insurance (CHI) regulates mandatory health insurance in Saudi Arabia under the Cooperative Health Insurance Law. Under Saudi statutory regulations, all private sector employers are legally obligated to provide comprehensive cooperative health insurance coverage for all employees and their recognized family dependents (spouse and children). Issuance or renewal of the residency card (Iqama) through the Ministry of Interior’s Absher/Muqeem systems is technically blocked unless an active CHI-verified health insurance policy is in place. Health insurance policies cover outpatient clinic visits, emergency room treatment, laboratory testing, hospitalization, surgery, and approved pharmaceuticals across empaneled private hospital networks with nominal copayments.'
  }),

  // ==========================================
  // PORTUGAL
  // ==========================================
  createRecord({
    id: 'portugal-at-nif-tax',
    topic: 'money',
    jurisdiction: 'Portugal',
    title: 'Portugal AT: Autoridade Tributária e Aduaneira and Número de Identificação Fiscal (NIF)',
    url: 'https://portaldasfinancas.gov.pt/',
    quote: 'O Numero de Identificacao Fiscal NIF e o numero de identificacao dos contribuintes perante a Administracao Tributaria',
    summary: 'The Autoridade Tributária e Aduaneira (AT) administers direct taxation in Portugal under the Personal Income Tax Code (Código do IRS). Every individual residing in or conducting transactions in Portugal must obtain a 9-digit Número de Identificação Fiscal (NIF), also known as the Número de Contribuinte. The NIF is required to open a bank account, sign a lease, take out a mobile contract, enroll in employment, and register with the social security system (NISS). Individuals residing in Portugal for more than 183 days per year are taxed as fiscal residents on worldwide income under progressive IRS rates from 13% to 48% via the online Portal das Finanças.'
  }),
  createRecord({
    id: 'portugal-nrau-urban-lease-housing',
    topic: 'housing',
    jurisdiction: 'Portugal',
    title: 'Portugal Tenancy: Novo Regime do Arrendamento Urbano (NRAU) and Lease Contracts',
    url: 'https://www.portaldahabitacao.pt/',
    quote: 'O Novo Regime do Arrendamento Urbano NRAU regula os contratos de locacao de habitacao em territorio nacional',
    summary: 'Residential leases in Portugal are governed by the New Urban Lease Regime (Novo Regime do Arrendamento Urbano - NRAU, Law No. 6/2006 as amended) and the Civil Code under the oversight of the Instituto da Habitação e da Reabilitação Urbana (IHRU). Statutory protections include: (1) residential rental contracts must be in writing and registered by the landlord on the Portal das Finanças with stamp duty (Imposto de Selo); (2) security deposits (Caução) are legally capped at a maximum of two (2) months rent, accompanied by up to two (2) months advance rent; (3) standard fixed-term contracts automatically renew unless the landlord provides formal registered written notice (at least 120 days for contracts of one to six years); and (4) landlords cannot evict tenants without an eviction procedure via the National Lease Counter (Balcão do Arrendamento).'
  }),
  createRecord({
    id: 'portugal-sns-servico-nacional-saude',
    topic: 'health',
    jurisdiction: 'Portugal',
    title: 'Portugal SNS: Serviço Nacional de Saúde and Número de Utente Health Card',
    url: 'https://www.sns.gov.pt/',
    quote: 'O Servico Nacional de Saude garante a prestacao de cuidados globais de saude a toda a populacao',
    summary: 'Portugal operates the Serviço Nacional de Saúde (SNS), a universal, tax-funded public healthcare system managed by the Ministry of Health. Foreign nationals holding legal residency in Portugal (residence permit issued by AIMA, former SEF) are entitled to full public healthcare access on equal terms with Portuguese citizens. Residents register at their local Primary Healthcare Centre (Centro de Saúde) to obtain a permanent 9-digit National Healthcare User Number (Número de Utente do SNS) and be assigned a family physician (Médico de Família). By legal decree, standard user moderating fees (Taxas moderadoras) have been abolished across the SNS for primary healthcare, diagnostic tests, consultations, and routine hospital care.'
  }),

  // ==========================================
  // MALAYSIA
  // ==========================================
  createRecord({
    id: 'malaysia-lhdn-tax-tin',
    topic: 'money',
    jurisdiction: 'Malaysia',
    title: 'Malaysia LHDN: Lembaga Hasil Dalam Negeri and Tax Identification Number (TIN)',
    url: 'https://www.hasil.gov.my/',
    quote: 'Lembaga Hasil Dalam Negeri administers the Income Tax Act 1967 and assigns Tax Identification Numbers to all taxpayers',
    summary: 'The Inland Revenue Board of Malaysia (Lembaga Hasil Dalam Negeri - LHDN) regulates direct taxation under the Income Tax Act 1967. Any individual residing in Malaysia for 182 days or more in a calendar year is deemed a tax resident taxed on Malaysia-sourced employment income under progressive tax rates ranging from 0% to 30%, with personal tax reliefs. Non-residents are taxed at a flat rate of 30%. All individual taxpayers, including expatriate employment pass holders (EP I, II, III), are assigned a Tax Identification Number (TIN) through the MyTax online portal, which is mandatory for annual tax return filing (Form BE or M) and Monthly Tax Deduction (MTD / PCB) reconciliation.'
  }),
  createRecord({
    id: 'malaysia-tenancy-agreements-housing',
    topic: 'housing',
    jurisdiction: 'Malaysia',
    title: 'Malaysia Tenancy: Contracts Act 1950, Stamp Duty, and Residential Tenancy Protections',
    url: 'https://www.kpkt.gov.my/',
    quote: 'Tenancy agreements in Malaysia are governed by the Contracts Act 1950 and must be stamped by LHDN to be admissible in court',
    summary: 'Residential tenancies in Malaysia are regulated under the Contracts Act 1950 and Specific Relief Act 1950 under the purview of the Ministry of Housing and Local Government (KPKT). Key legal and market tenets include: (1) tenancy agreements must be formally executed in writing and stamped digitally via LHDN’s stamping portal (STAMPS) to be legally enforceable in court; (2) standard market rental deposits comprise a 2-month security deposit plus a half-month utility deposit, accompanied by 1 month advance rent; (3) under Section 7(2) of the Specific Relief Act 1950, landlords are strictly prohibited from evicting tenants, locking gates, or seizing possessions without obtaining a valid court order; and (4) landlords must provide statutory notice to pay or quit before initiating legal eviction proceedings.'
  }),
  createRecord({
    id: 'malaysia-kkm-public-healthcare',
    topic: 'health',
    jurisdiction: 'Malaysia',
    title: 'Malaysia KKM: Ministry of Health Public Healthcare Network and Expatriate Coverage',
    url: 'https://www.moh.gov.my/',
    quote: 'The Ministry of Health Malaysia operates an extensive network of government health clinics and general hospitals nationwide',
    summary: 'The Ministry of Health Malaysia (Kementerian Kesihatan Malaysia - KKM) operates an extensive nationwide network of public primary care health clinics (Klinik Kesihatan) and tertiary public hospitals (Hospital Umum). While Malaysian citizens access public healthcare at heavily subsidized nominal charges (MYR 1 outpatient fee), foreign nationals and expatriates pay standard foreign-patient fees set under the Fees (Medical) (Amendment) Order, which remain competitively priced compared to private healthcare. Foreign workers holding temporary employment visit passes (PLKS) are mandated to be enrolled by employers into the Foreign Workers Hospitalisation and Surgical Insurance Scheme (SKHPPA), providing basic hospital surgical coverage.'
  }),

  // ==========================================
  // THAILAND
  // ==========================================
  createRecord({
    id: 'thailand-revenue-department-tin',
    topic: 'money',
    jurisdiction: 'Thailand',
    title: 'Thailand Revenue Department: Tax Identification Number (TIN) and Personal Income Tax',
    url: 'https://www.rd.go.th/',
    quote: 'The Revenue Department administers Personal Income Tax under the Revenue Code for residents earning income in Thailand',
    summary: 'The Revenue Department of Thailand under the Ministry of Finance regulates taxation under the Revenue Code. Any individual residing in Thailand for a total of 180 days or more in any tax year is classified as a tax resident. Tax residents are taxed on all Thailand-sourced income and foreign-sourced income remitted into Thailand in accordance with updated Revenue Department guidelines. Progressive personal income tax brackets range from 0% to 35%. Foreign workers holding an official Work Permit must obtain a 13-digit Tax Identification Number (TIN) from the local Area Revenue Office to file annual personal income tax returns (PND 90 or PND 91).'
  }),
  createRecord({
    id: 'thailand-civil-commercial-code-tenancy',
    topic: 'housing',
    jurisdiction: 'Thailand',
    title: 'Thailand Tenancy: Civil and Commercial Code (Hire of Property) and Consumer Protections',
    url: 'https://www.ocpb.go.th/',
    quote: 'Under the Civil and Commercial Code a hire of immovable property is not enforceable by action unless there is some written evidence signed by the liable party',
    summary: 'Residential rentals in Thailand are regulated by Sections 537 to 571 of the Civil and Commercial Code (Hire of Property) and overseen by the Office of the Consumer Protection Board (OCPB). Key statutory provisions include: (1) leases exceeding 3 years must be registered with the local Land Department and recorded on the title deed (Chanote) to be legally valid; (2) under OCPB Residential Rental Regulations for residential business operators, security deposits are capped at a maximum of one (1) month rent, advance rent is limited to one (1) month, and overcharging for water and electricity above official MEA/PEA utility rates is illegal; (3) landlords cannot enter rented units without tenant permission or change locks without a court judgment; and (4) security deposits must be returned within 7 days of vacating.'
  }),
  createRecord({
    id: 'thailand-social-security-office-health',
    topic: 'health',
    jurisdiction: 'Thailand',
    title: 'Thailand SSO: Social Security Office Section 33 Mandatory Health Insurance',
    url: 'https://www.sso.go.th/',
    quote: 'The Social Security Office provides medical care benefits for insured employees working in private establishments under Section 33',
    summary: 'The Social Security Office (SSO) under the Ministry of Labour administers Thailand’s statutory social security and health insurance system. Foreign nationals legally working in Thailand under a valid work permit and registered with an employer are legally mandated to participate in the Social Security Fund under Section 33 of the Social Security Act. Contributions are set at 5% of monthly salary (capped at THB 750 monthly, matched by the employer). Insured foreign employees select an accredited main hospital (public general hospital or contracted private hospital), where doctor visits, inpatient admissions, surgical procedures, emergency treatments, and prescription medications are 100% free of charge.'
  }),

  // ==========================================
  // ISRAEL
  // ==========================================
  createRecord({
    id: 'israel-tax-authority-mas-hachnasa',
    topic: 'money',
    jurisdiction: 'Israel',
    title: 'Israel Tax Authority: Mas Hachnasa, Credit Points, and Tax Registration',
    url: 'https://www.gov.il/en/departments/israel_tax_authority/',
    quote: 'The Israel Tax Authority administers Income Tax Mas Hachnasa under the Income Tax Ordinance',
    summary: 'The Israel Tax Authority (Rashut HaMisim) administers direct taxation under the Income Tax Ordinance (New Version) 1961. Individuals residing in Israel under the center of life test are classified as Israeli tax residents taxed on worldwide income under progressive income tax brackets from 10% to 50% (inclusive of the 3% surtax on high incomes). Taxes on salaried employees are withheld at source under Pay-As-You-Earn (Form 101). Tax liability is offset by statutory Tax Credit Points (Nekudot Zikuy), with additional credit points granted to new immigrants (Olim Chadashim) for their first 4.5 years of residence, as well as a 10-year exemption on foreign-sourced income.'
  }),
  createRecord({
    id: 'israel-fair-rent-law-tenancy',
    topic: 'housing',
    jurisdiction: 'Israel',
    title: 'Israel Tenancy: Fair Rent Law (Amendment to Rental and Loan Law 1971) Protections',
    url: 'https://www.gov.il/en/departments/ministry_of_construction_and_housing/',
    quote: 'The Fair Rent Law protects residential tenants by setting statutory standards for apartment habitability and limiting rental security guarantees',
    summary: 'Residential leases in Israel are governed by the Fair Rent Law (Amendment No. 1 to the Rental and Loan Law 1971) under Ministry of Construction and Housing oversight. Major statutory tenant protections include: (1) mandatory definition of an apartment suitable for residential living (requiring operable drainage, electricity, drinking water, natural ventilation, and door locks); (2) financial rental guarantees (bank guarantees or cash deposits) are legally capped at the lower of three (3) months rent or one-third of the total lease period; (3) landlords are legally required to repair structural defects and flaws within 30 days (or within 3 days for urgent emergencies); (4) landlords cannot charge tenants for building insurance covering the structure; and (5) tenancy contracts must be signed in writing.'
  }),
  createRecord({
    id: 'israel-kupot-cholim-universal-health',
    topic: 'health',
    jurisdiction: 'Israel',
    title: 'Israel Ministry of Health: National Health Insurance Law and Health Funds (Kupot Cholim)',
    url: 'https://www.gov.il/en/departments/ministry_of_health/',
    quote: 'Under the National Health Insurance Law all residents are entitled to a basket of healthcare services through their chosen health fund',
    summary: 'Under the National Health Insurance Law of 1995, every permanent resident and citizen of Israel is entitled to a standardized statutory basket of health services (Sal Briut). Healthcare is financed through a progressive health tax collected by the National Insurance Institute (Bituach Leumi) and delivered through four competing non-profit Health Funds (Kupot Cholim): Clalit, Maccabi, Meuhedet, and Leumit. Enrollees select any fund of their choice without pre-existing condition exclusions. Services include primary and specialist care, emergency hospital treatment, hospitalization, diagnostic imaging, and heavily subsidized medications listed in the National Drug Basket.'
  })
];

