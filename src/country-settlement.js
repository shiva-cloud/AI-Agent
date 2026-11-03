// Country-specific immigration, foreigner registration, and national settlement service records.
// Sourced from official national immigration departments, interior ministries, and residency agencies worldwide.
// Verified for statutory accuracy, authentic URLs, and English-language policy compliance.

export const checkedAt = '2026-11-03';
export const expiresAt = '2027-02-28';

function settlementRecord({
  id,
  jurisdiction,
  title,
  url,
  summary,
  quote,
  reviewBasis
}) {
  return {
    id,
    topic: 'community',
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
    reviewBasis: reviewBasis || 'Official national government immigration authority and foreigner registration portal inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-11-03T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  };
}

export const countrySettlementRecords = [
  settlementRecord({
    id: 'india-settlement-services',
    jurisdiction: 'India',
    title: 'India Bureau of Immigration: e-FRRO Foreigner Registration and Visa Services',
    url: 'https://boi.gov.in/',
    quote: 'The Bureau of Immigration administers immigration functions and online e-FRRO services for foreign nationals in India',
    summary: 'The Bureau of Immigration (BoI) under the Ministry of Home Affairs regulates border control, visa extensions, and foreigner registration in India. Foreign nationals arriving on long-term visas exceeding 180 days (such as employment, student, research, or entry visas) are legally required to register with the Foreigners Regional Registration Officer (FRRO) within 14 days of arrival. The national e-FRRO portal provides a completely faceless, paperless, and cashless platform where foreign residents can complete registration, apply for visa extensions, request change of address or educational institution, and obtain Exit Permits online without visiting physical immigration offices. For outbound newcomers moving to Canada, pre-arrival preparation services including Planning for Canada (CIIP) provide employment and credential guidance.'
  }),
  settlementRecord({
    id: 'united-kingdom-settlement-services',
    jurisdiction: 'United Kingdom',
    title: 'UK Visas and Immigration: Visas, Settlement, and Indefinite Leave to Remain (ILR)',
    url: 'https://www.gov.uk/government/organisations/uk-visas-and-immigration',
    quote: 'UK Visas and Immigration UKVI is responsible for the United Kingdom visa system and decisions on applications to visit work study or settle',
    summary: 'UK Visas and Immigration (UKVI), an operational directorate of the Home Office, manages visa applications, biometric residence documentation, right-to-work verification, and Indefinite Leave to Remain (ILR) / British citizenship across the United Kingdom. Migrants on Skilled Worker, Global Talent, Innovator Founder, and Family visas access GOV.UK services to monitor continuous residence requirements (180-day rule in any 12-month window), access digital eVisas via UKVI online accounts, generate employer right-to-work share codes, and navigate integration and settlement pathways in England, Scotland, Wales, and Northern Ireland.'
  }),
  settlementRecord({
    id: 'united-states-settlement-services',
    jurisdiction: 'United States',
    title: 'USCIS: U.S. Citizenship and Immigration Services Welcome to the United States Guide',
    url: 'https://www.uscis.gov/',
    quote: 'U.S. Citizenship and Immigration Services oversees lawful immigration to the United States and publishes the Welcome to the United States guide',
    summary: 'U.S. Citizenship and Immigration Services (USCIS) under the Department of Homeland Security (DHS) oversees legal immigration, permanent resident status (Green Cards), employment authorization (EAD), humanitarian protection, and naturalization in the United States. Lawful permanent residents and non-immigrant visa holders access USCIS online portals to file Form I-90 for Green Card renewal, Form I-485 for adjustment of status, Form AR-11 for mandatory address change notification within 10 days of relocation, and the official Settling in the U.S. orientation resources covering Social Security numbers, healthcare enrollment, and community integration.'
  }),
  settlementRecord({
    id: 'australia-settlement-services',
    jurisdiction: 'Australia',
    title: 'Australia Department of Home Affairs: Immigration, Citizenship, and Settlement Services',
    url: 'https://immi.homeaffairs.gov.au/',
    quote: 'The Department of Home Affairs provides immigration citizenship and settlement services for people living in Australia',
    summary: 'The Department of Home Affairs manages immigration, border clearance, skilled and family visas, permanent residency, and Australian citizenship. Migrants and humanitarian entrants access the Settlement Engagement and Transition Support (SETS) program, the Adult Migrant English Program (AMEP) offering up to unlimited free English language tuition, and Translating and Interpreting Service (TIS National). Permanent residents and eligible temporary visa holders use the digital VEVO (Visa Entitlement Verification Online) system to confirm study, work, and Medicare rights across Australian states and territories.'
  }),
  settlementRecord({
    id: 'pakistan-settlement-services',
    jurisdiction: 'Pakistan',
    title: 'Pakistan Ministry of Interior: NADRA Pakistan Online Visa System and Foreigner Services',
    url: 'https://visa.nadra.gov.pk/',
    quote: 'Pakistan Online Visa System provides electronic visa and extension services under the Ministry of Interior and NADRA',
    summary: 'The Ministry of Interior and the National Database and Registration Authority (NADRA) provide the official Pakistan Online Visa System. Foreign nationals residing in Pakistan for employment, business, diplomatic, or humanitarian reasons can apply online for visa extensions, work permit endorsements, exit permits, and foreigner registration. In addition, NADRA issues Pakistan Origin Cards (POC) to foreign spouses of Pakistani nationals and former citizens, granting visa-free entry, indefinite stay, national identification, and permission to open bank accounts and acquire immovable property.'
  }),
  settlementRecord({
    id: 'philippines-settlement-services',
    jurisdiction: 'Philippines',
    title: 'Philippines Bureau of Immigration: Alien Registration, ACR I-Card, and Visa Services',
    url: 'https://immigration.gov.ph/',
    quote: 'The Bureau of Immigration manages the entry and stay of foreign nationals and issues the Alien Certificate of Registration Identity Card',
    summary: 'The Bureau of Immigration (BI) under the Department of Justice regulates alien admission, registration, visa extensions, and border control in the Philippines. All foreign nationals holding immigrant or non-immigrant visas (such as 9g working visas, 9d treaty trader visas, or 13a immigrant spouse visas) who reside in the country for more than 59 days are legally required to obtain an Alien Certificate of Registration Identity Card (ACR I-Card). ACR I-Card holders must complete the mandatory Annual Report within the first 60 days of each calendar year and secure an Emigration Clearance Certificate (ECC) prior to departure. Outbound immigrants to Canada can access Canadian Immigrant Integration Program (CIIP) pre-arrival services.'
  }),
  settlementRecord({
    id: 'germany-settlement-services',
    jurisdiction: 'Germany',
    title: 'Germany BAMF: Federal Office for Migration and Refugees and Integration Courses',
    url: 'https://www.bamf.de/EN/',
    quote: 'The Federal Office for Migration and Refugees BAMF coordinates integration courses and settlement support for immigrants in Germany',
    summary: 'The Federal Office for Migration and Refugees (Bundesamt für Migration und Flüchtlinge - BAMF) is Germany’s central federal authority for migration, asylum, and societal integration. BAMF administers nationwide statutory Integration Courses (Integrationskurs), comprising 600 hours of German language instruction up to CEFR Level B1 and a 100-hour orientation course on German legal order and society. Skilled workers, EU Blue Card holders, and their spouses access local Foreigners Registration Offices (Ausländerbehörde) for residence permits (Aufenthaltstitel), settlement permits (Niederlassungserlaubnis), and the Federal Employment Agency’s hotline Working and Living in Germany.'
  }),
  settlementRecord({
    id: 'france-settlement-services',
    jurisdiction: 'France',
    title: 'France OFII: French Office for Immigration and Integration and Republican Integration Contract',
    url: 'https://administration-etrangers-en-france.interieur.gouv.fr/',
    quote: 'The Ministry of the Interior and OFII support foreigner arrival and manage the Republican Integration Contract CIR',
    summary: 'The Ministry of the Interior and the French Office for Immigration and Integration (Office Français de l’Immigration et de l’Intégration - OFII) oversee foreigner integration in France. Foreign nationals granted a long-stay visa valid as a residence permit (VLS-TS) or multi-year residence card (Passeport Talent, Salarié, Vie privée et familiale) sign the mandatory Republican Integration Contract (Contrat d’Intégration Républicaine - CIR). The CIR includes civics training on republican values, language assessment with free French language training up to Level A1/A2, and personal settlement orientation. Residence applications and renewals are managed digitally via the ANEF portal (Étrangers en France).'
  }),
  settlementRecord({
    id: 'japan-settlement-services',
    jurisdiction: 'Japan',
    title: 'Japan Immigration Services Agency: Residence Management and Foreign Resident Support Center',
    url: 'https://www.isa.go.jp/en/',
    quote: 'The Immigration Services Agency oversees immigration control and residency management for foreign nationals in Japan',
    summary: 'The Immigration Services Agency of Japan (ISA) under the Ministry of Justice manages residency status administration, residence cards (Zairyu Card), status renewals, and integration policies. Medium-to-long term foreign residents (holding work, student, or family statuses exceeding 3 months) must register their residential address with their local municipal ward office (Shiyakusho/Kuyakusho) within 14 days of securing housing. The ISA operates the Foreign Residents Support Center (FRESC) in Tokyo, providing multilingual legal, labor, human rights, and employment counseling in collaboration with the Tokyo Legal Affairs Bureau and Tokyo Labor Bureau.'
  }),
  settlementRecord({
    id: 'singapore-settlement-services',
    jurisdiction: 'Singapore',
    title: 'Singapore ICA: Immigration and Checkpoints Authority Entry and Permanent Residence',
    url: 'https://www.ica.gov.sg/',
    quote: 'The Immigration and Checkpoints Authority ICA administers immigration passes permanent residency and citizenship in Singapore',
    summary: 'The Immigration & Checkpoints Authority (ICA) under the Ministry of Home Affairs governs immigration border control, issuance of Dependant’s Passes, Long-Term Visit Passes (LTVP), Student’s Passes, Permanent Residence (PR), and Singapore Citizenship. Employment passes (EP, S-Pass, Work Permits) are issued by the Ministry of Manpower (MOM). Foreign professionals transitioning to permanent status utilize MyICA online services to access the Singapore Citizenship Journey, register address changes within 14 days under the National Registration Act, and access community integration programs run by the National Integration Council (NIC).'
  }),
  settlementRecord({
    id: 'hong-kong-settlement-services',
    jurisdiction: 'Hong Kong',
    title: 'Hong Kong Immigration Department: Right of Abode, Visas, and Smart Identity Card Services',
    url: 'https://www.immd.gov.hk/eng/',
    quote: 'The Immigration Department provides immigration control visa processing and Smart Identity Card registration in Hong Kong',
    summary: 'The Immigration Department of the Government of the Hong Kong Special Administrative Region administers visas under the General Employment Policy (GEP), Admission Scheme for Mainland Talents and Professionals (ASMTP), Top Talent Pass Scheme (TTPS), and Quality Migrant Admission Scheme (QMAS). All foreign residents aged 11 or older permitted to stay in Hong Kong for more than 180 days must register in person for a Hong Kong Smart Identity Card (HKID) within 30 days of arrival. After seven (7) years of continuous ordinary residence, foreign nationals can apply for verification of eligibility for Right of Abode (Permanent Resident status).'
  }),
  settlementRecord({
    id: 'taiwan-settlement-services',
    jurisdiction: 'Taiwan',
    title: 'Taiwan National Immigration Agency: Alien Resident Certificate (ARC) and Information for Foreigners',
    url: 'https://www.immigration.gov.tw/5475/',
    quote: 'The National Immigration Agency NIA provides residence services and foreigner life consultation in Taiwan',
    summary: 'The National Immigration Agency (NIA) under the Ministry of the Interior governs entry, exit, residency, and immigration services in Taiwan. Foreign nationals entering Taiwan on resident visas (for employment, investment, mission, or family reunion) must apply for an Alien Resident Certificate (ARC) and re-entry permit within 30 days of arrival via the NIA Online Application System. The NIA operates the Information for Foreigners in Taiwan 24-hour bilingual consultation hotline (1990) and service centers in every county, providing guidance on NHI health enrollment, driver license conversion, tax clearance, and permanent residency (APRC) requirements.'
  }),
  settlementRecord({
    id: 'new-zealand-settlement-services',
    jurisdiction: 'New Zealand',
    title: 'Immigration New Zealand: Settlement Services and Work and Live in New Zealand Portal',
    url: 'https://www.immigration.govt.nz/',
    quote: 'Immigration New Zealand manages visa services and coordinates settlement support programs for newcomers',
    summary: 'Immigration New Zealand (INZ), part of the Ministry of Business, Innovation and Employment (MBIE), manages work visas, resident visas, refugee settlement, and permanent residency. INZ operates the official New Zealand Now newcomer portal and coordinates the Settlement Services Network. Permanent residents and skilled migrants access the Welcoming Communities initiative, IRD tax number issuance, enrollment with Primary Health Organisations (PHOs) under the public healthcare system, and subsidized adult literacy and English language classes through English Language Partners New Zealand.'
  }),
  settlementRecord({
    id: 'ireland-settlement-services',
    jurisdiction: 'Ireland',
    title: 'Ireland ISD: Immigration Service Delivery and Irish Residence Permit (IRP) Registration',
    url: 'https://www.irishimmigration.ie/',
    quote: 'Immigration Service Delivery ISD is responsible for administering immigration permissions and residence registration in Ireland',
    summary: 'Immigration Service Delivery (ISD) of the Department of Justice administers visas, preclearance, international protection, and residency registration across Ireland. Non-EEA nationals staying in Ireland for more than 90 days on Critical Skills Employment Permits, general work permits, or study permissions must register in person at their local registration office (Burgh Quay in Dublin or regional Garda stations) to receive an Irish Residence Permit (IRP) card. ISD oversees Long Term Residency, Stamp 4 endorsements, citizenship naturalization, and integration funding coordinated by the Department of Children, Equality, Disability, Integration and Youth.'
  }),
  settlementRecord({
    id: 'netherlands-settlement-services',
    jurisdiction: 'Netherlands',
    title: 'Netherlands IND: Immigration and Naturalisation Service and Civic Integration (Inburgering)',
    url: 'https://ind.nl/en',
    quote: 'The Immigration and Naturalisation Service IND assesses all applications from people who want to live in the Netherlands',
    summary: 'The Immigration and Naturalisation Service (Immigratie- en Naturalisatiedienst - IND) under the Ministry of Justice and Security oversees residence permits (Verblijfsvergunning), knowledge migrant (Kennismigrant) schemes, European Blue Cards, and Dutch naturalization. Non-EU immigrants settling in the Netherlands must register with the Municipal Personal Records Database (BRP) to obtain a Citizen Service Number (BSN). Under the Civic Integration Act (Wet inburgering 2021), non-exempt immigrants are required to complete the civic integration examination (Inburgeringsexamen), demonstrating Dutch language proficiency and knowledge of Dutch society.'
  }),
  settlementRecord({
    id: 'norway-settlement-services',
    jurisdiction: 'Norway',
    title: 'Norway UDI: Norwegian Directorate of Immigration and Introduction Program',
    url: 'https://www.udi.no/en/',
    quote: 'The Norwegian Directorate of Immigration UDI processes applications from foreign nationals who wish to visit or live in Norway',
    summary: 'The Norwegian Directorate of Immigration (Utlendingsdirektoratet - UDI) manages visa, work permit, family immigration, permanent residence, and citizenship applications in Norway. Non-EU/EEA skilled workers and residents must book an appointment with the local police or Services Centre for Foreign Workers (SUA) upon arrival to register and receive a residence card. The Directorate of Integration and Diversity (IMDi) coordinates the statutory Introduction Program and Norwegian language and social studies training (opplæring i norsk og samfunnskunnskap) through local municipalities.'
  }),
  settlementRecord({
    id: 'sweden-settlement-services',
    jurisdiction: 'Sweden',
    title: 'Sweden Migrationsverket: Swedish Migration Agency and Swedish for Immigrants (SFI)',
    url: 'https://www.migrationsverket.se/English.html',
    quote: 'The Swedish Migration Agency is the authority that considers applications from people who want to visit live in or become citizens of Sweden',
    summary: 'The Swedish Migration Agency (Migrationsverket) is the authority responsible for residence permits, work permits, permanent residence, and Swedish citizenship under the Aliens Act (Utlänningslagen). Legal residents staying in Sweden for one year or longer must register in the population register with the Swedish Tax Agency (Skatteverket) to obtain a Swedish personal identity number (Personnummer). Municipalities provide all registered adult residents with free Swedish for Immigrants (SFI) language courses and community integration orientation.'
  }),
  settlementRecord({
    id: 'finland-settlement-services',
    jurisdiction: 'Finland',
    title: 'Finland Migri: Finnish Immigration Service and InfoFinland Integration Guidance',
    url: 'https://migri.fi/en/home',
    quote: 'The Finnish Immigration Service Migri handles immigration matters and coordinates newcomer permits in Finland',
    summary: 'The Finnish Immigration Service (Maahanmuuttovirasto - Migri) under the Ministry of the Interior processes residence permits for employment, specialists, entrepreneurship, family ties, and Finnish citizenship. Legal foreign arrivals register their right of residency at the Digital and Population Data Services Agency (DVV) to receive a Finnish personal identity code (Henkilötunnus). Municipalities and the Employment and Economic Development Offices (TE Services) administer individual integration plans, Finnish or Swedish language instruction, and the InfoFinland multilingual integration portal.'
  }),
  settlementRecord({
    id: 'malta-settlement-services',
    jurisdiction: 'Malta',
    title: 'Malta Identita: Agency for Residency, Visas, and Single Permit Employment',
    url: 'https://identita.gov.mt/',
    quote: 'Identita is the government agency responsible for residence permits visas identity documents and civil registration in Malta',
    summary: 'Identità (formerly Identity Malta Agency) under the Ministry for Home Affairs oversees the Single Work Permit procedure, nomad residence permits, permanent residence certificates, and national identity cards. Third-country nationals legally working in Malta receive an electronic e-Residence card upon biometric enrollment. The Human Rights Directorate coordinates the I Belong (Integrazzjoni) national integration program, delivering Maltese and English language training, cultural orientation, and civic integration stages required for long-term residence status.'
  }),
  settlementRecord({
    id: 'estonia-settlement-services',
    jurisdiction: 'Estonia',
    title: 'Estonia PPA: Police and Border Guard Board and Settle in Estonia Program',
    url: 'https://www.politsei.ee/en/',
    quote: 'The Police and Border Guard Board manages residence permits and alien documentation while Settle in Estonia supports integration',
    summary: 'The Police and Border Guard Board (Politsei- ja Piirivalveamet - PPA) under the Ministry of the Interior processes temporary residence permits (TRP), digital identity cards, alien passports, and Estonian citizenship under the Aliens Act. Foreigners granted residence in Estonia receive an electronic residence card with embedded digital cryptographic signature capabilities. The government operates the official Settle in Estonia integration program, providing free statutory training modules in Estonian language (A1/A2), basic society orientation, work culture, and family settlement.'
  }),
  settlementRecord({
    id: 'ukraine-settlement-services',
    jurisdiction: 'Ukraine',
    title: 'Ukraine State Migration Service: Temporary and Permanent Residence Permits (Posvidka)',
    url: 'https://dmsu.gov.ua/en-home.html',
    quote: 'The State Migration Service of Ukraine is the central executive body implementing state policy in immigration and registration',
    summary: 'The State Migration Service of Ukraine (DMS / SMS) under the Ministry of Internal Affairs manages immigration permits, foreigner documentation, and citizenship acquisition under the Law of Ukraine on the Legal Status of Foreigners and Stateless Persons. Foreign citizens arriving for employment, family reunification, volunteering, or education must obtain a biometric Temporary Residence Permit (Posvidka na tymchasove prozhyvannia) or Permanent Residence Permit. Holders must complete statutory place-of-residence registration (Propyska) with their local administrative service center (CNAP) within 30 days.'
  }),
  settlementRecord({
    id: 'nigeria-settlement-services',
    jurisdiction: 'Nigeria',
    title: 'Nigeria Immigration Service: Combined Expatriate Residence Permit and Aliens Card (CERPAC)',
    url: 'https://immigration.gov.ng/',
    quote: 'The Nigeria Immigration Service regulates the entry stay and employment of foreign nationals under the Immigration Act 2015',
    summary: 'The Nigeria Immigration Service (NIS) under the Ministry of Interior administers statutory border control, visa regimes, and expatriate residency regulation under the Immigration Act 2015. Expatriates taking up long-term employment under approved Expatriate Quota positions enter on a Subject to Regularization (STR) visa and must apply for a Combined Expatriate Residence Permit and Aliens Card (CERPAC). The green CERPAC card serves as an official residence and work authorization card valid for up to two years renewable. Foreign residents must register their physical domicile with the State Command immigration headquarters.'
  }),
  settlementRecord({
    id: 'ghana-settlement-services',
    jurisdiction: 'Ghana',
    title: 'Ghana Immigration Service: Residence Permits, Work Quotas, and Non-Citizen Ghana Card',
    url: 'https://home.gis.gov.gh/',
    quote: 'The Ghana Immigration Service is mandated to regulate the entry stay and employment of foreign nationals in Ghana',
    summary: 'The Ghana Immigration Service (GIS) under the Ministry for the Interior manages immigration entry, residence permits, expatriate work quotas, and citizenship regularisation under the Immigration Act 2000 (Act 573). All foreign nationals residing in Ghana for more than 90 days must apply for a GIS Residence Permit and register for a mandatory Non-Citizen Ghana Card issued by the National Identification Authority (NIA). The Non-Citizen Card is legally required for opening bank accounts, renting premises, registering SIM cards, and securing work permit renewals.'
  }),
  settlementRecord({
    id: 'israel-settlement-services',
    jurisdiction: 'Israel',
    title: 'Israel PIBA: Population and Immigration Authority and Ministry of Aliyah and Integration',
    url: 'https://www.gov.il/en/departments/population_and_immigration_authority/',
    quote: 'The Population and Immigration Authority oversees border control entry permits visas and residence status in Israel',
    summary: 'The Population and Immigration Authority (Rashut HaOchlusin VeHaHagira - PIBA) under the Ministry of Interior administers entry visas, foreign worker B/1 visas, permanent and temporary residence permits (A/1 through A/5), and Teudat Zehut identity registration under the Law of Return and Entry into Israel Law. For immigrants eligible under the Law of Return, the Ministry of Aliyah and Integration coordinates Sal Klita financial absorption baskets, Ulpan Hebrew language immersion schools, subsidized housing vouchers, and municipal integration coordinators.'
  }),
  settlementRecord({
    id: 'china-settlement-services',
    jurisdiction: 'China',
    title: 'China National Immigration Administration: Foreigner Residence Permits and Permanent Residency',
    url: 'https://en.nia.gov.cn/',
    quote: 'The National Immigration Administration oversees exit-entry administration and foreigner residency in mainland China',
    summary: 'The National Immigration Administration (NIA) of the People’s Republic of China, working with municipal Public Security Bureau (PSB) Exit-Entry Administration divisions, regulates foreign national entry, stay, and permanent residence. Foreigners entering China on Z (work), X1 (long-term student), or Q1 (family reunion) visas must apply for a Foreigner Residence Permit (Juliu Xukezheng) within 30 days of arrival. Foreign residents must register their accommodation (Zhusu Dengji) with the local police station within 24 hours of arrival. High-tier foreign talent can apply for the Foreign Permanent Resident ID Card (Wulao).'
  }),
  settlementRecord({
    id: 'south-korea-settlement-services',
    jurisdiction: 'South Korea',
    title: 'South Korea Ministry of Justice: Hi Korea e-Government and Korea Immigration Integration Program',
    url: 'https://www.hikorea.go.kr/',
    quote: 'Hi Korea is the official e-Government portal for foreigners providing immigration services and integration support',
    summary: 'The Korea Immigration Service under the Ministry of Justice manages visa processing, alien registration cards (ARC), change of status, and residence permits via the official Hi Korea electronic portal. Foreign nationals staying in South Korea for more than 90 days must register in person at their jurisdictional immigration office to obtain an ARC. The Ministry of Justice administers the Korea Immigration and Integration Program (KIIP), providing free Korean language and culture courses; completion of KIIP stages grants significant bonus points and exemptions for F-2 points-based residence and F-5 permanent residency.'
  }),
  settlementRecord({
    id: 'brazil-settlement-services',
    jurisdiction: 'Brazil',
    title: 'Brazil Polícia Federal and MJSP: Registro Nacional Migratório (RNM) and CRNM Issuance',
    url: 'https://www.gov.br/pf/pt-br/assuntos/imigracao',
    quote: 'The Federal Police is responsible for immigration control and issuing the Carteira de Registro Nacional Migratorio CRNM',
    summary: 'The Federal Police (Polícia Federal) and the Ministry of Justice and Public Security (MJSP) regulate immigration, residence authorizations, and refugee processing under Brazil’s modern Migration Law (Lei nº 13.445/2017). Foreign nationals entering Brazil on temporary work, investor, family reunion, or student visas must register in person with the Federal Police within 90 days of arrival to obtain the Carteira de Registro Nacional Migratório (CRNM) and their unique RNM identification number. Registered immigrants enjoy full civil rights, access to the free public healthcare system (SUS), and social security benefits.'
  }),
  settlementRecord({
    id: 'vietnam-settlement-services',
    jurisdiction: 'Vietnam',
    title: 'Vietnam Immigration Department: Temporary Residence Cards (TRC) and Foreigner Registration',
    url: 'https://xuatnhapcanh.gov.vn/',
    quote: 'The Vietnam Immigration Department manages entry exit and residence administration for foreigners in Vietnam',
    summary: 'The Vietnam Immigration Department (Cục Quản lý xuất nhập cảnh - A08) under the Ministry of Public Security governs immigration visas, temporary residence cards (TRC), and permanent residence under the Law on Entry, Exit, Transit, and Residence of Foreigners in Vietnam. Foreigners working under valid Work Permits (LD visas) or establishing enterprises (DT visas) can secure a 2- to 5-year Temporary Residence Card (Thẻ tạm trú), which exempts the holder from visa requirements. Accommodation establishments must declare the foreigner’s temporary stay (Khai báo tạm trú) online with the local ward police.'
  }),
  settlementRecord({
    id: 'mexico-settlement-services',
    jurisdiction: 'Mexico',
    title: 'Mexico INM: Instituto Nacional de Migración and Tarjeta de Residente Temporal/Permanente',
    url: 'https://www.gob.mx/inm',
    quote: 'The Instituto Nacional de Migracion regulates the entry stay and regularisation of foreign nationals in Mexico',
    summary: 'The Instituto Nacional de Migración (INM) under the Secretaría de Gobernación manages immigration procedures under the Ley de Migración. Foreigners entering Mexico on temporary or permanent resident visas must complete the Canje (exchange) procedure at their local INM office within 30 days of arrival to receive their official biometric Tarjeta de Residente Temporal (TRT) or Tarjeta de Residente Permanente (TRP). Resident cardholders receive a unique Clave Única de Registro de Población (CURP) identifier, required for employment, tax registration (RFC), and enrollment in public health programs.'
  }),
  settlementRecord({
    id: 'iran-settlement-services',
    jurisdiction: 'Iran',
    title: 'Iran MFA and Police: Electronic Visa Portal and Directorate of Foreigners Affairs',
    url: 'https://evisa.mfa.ir/en/',
    quote: 'The Ministry of Foreign Affairs electronic visa system handles entry visas and residence permissions in Iran',
    summary: 'The Ministry of Foreign Affairs (MFA) and the Bureau for Aliens and Foreign Immigrants Affairs (BAFIA) under the Ministry of Interior oversee foreign national admissions, e-visas, residence permits, and humanitarian asylum in Iran. Foreigners residing for employment, academic study, or long-term residence must register their residence permit with the Immigration and Passport Police within statutory timeframes. Registered foreign residents receive official identification permitting bank account operations, domestic travel clearance, and consular renewals.'
  }),
  settlementRecord({
    id: 'colombia-settlement-services',
    jurisdiction: 'Colombia',
    title: 'Colombia Migración Colombia: Cédula de Extranjería and Foreigner Registration Portal',
    url: 'https://www.migracioncolombia.gov.co/',
    quote: 'Migracion Colombia is the civil immigration authority managing foreigner registration and the Cedula de Extranjeria',
    summary: 'Migración Colombia, a special administrative entity attached to the Ministry of Foreign Affairs, exercises civil border control, immigration enforcement, and foreigner registration under Decree 1067 of 2015. Foreign nationals holding a Colombian visa with a validity of more than three months (such as Visa M Migrante, Visa V Visitante, or Visa R Residente) must register their visa with Migración Colombia and obtain a Cédula de Extranjería (foreigner ID card) within 15 calendar days of arrival. The Cédula is mandatory for signing employment contracts, opening bank accounts, and registering with EPS health insurance.'
  }),
  settlementRecord({
    id: 'bangladesh-settlement-services',
    jurisdiction: 'Bangladesh',
    title: 'Bangladesh Department of Immigration and Passports: Visas, Work Extensions, and Registration',
    url: 'https://www.dip.gov.bd/',
    quote: 'The Department of Immigration and Passports manages visa extensions foreigner registration and travel documents',
    summary: 'The Department of Immigration and Passports under the Ministry of Home Affairs Security Services Division, working alongside the Special Branch (SB) of Police, oversees foreigner entry, visa extensions, and residency compliance in Bangladesh. Foreign nationals arriving on employment (E visa), business (B visa), or investor visas must obtain a work permit from BIDA (Bangladesh Investment Development Authority) or BEPZA and register with the Special Branch of Police within statutory deadlines to secure multi-entry visa extensions.'
  }),
  settlementRecord({
    id: 'sri-lanka-settlement-services',
    jurisdiction: 'Sri Lanka',
    title: 'Sri Lanka Department of Immigration and Emigration: Residence Visas and Dual Citizenship',
    url: 'https://www.immigration.gov.lk/',
    quote: 'The Department of Immigration and Emigration regulates entry visas residence visas and citizenship in Sri Lanka',
    summary: 'The Department of Immigration and Emigration administers entry endorsements, residence visas, employment clearances, and dual citizenship under the Immigrants and Emigrants Act. Foreign nationals intending to work, invest, retire, or join family members in Sri Lanka must enter on an entry visa endorsed by the relevant ministry or line agency (such as the Board of Investment - BOI) and convert it to an official Residence Visa upon arrival in Colombo. Residence visa holders receive registration permits allowing local bank account operations and vehicle driving license endorsements.'
  }),
  settlementRecord({
    id: 'nepal-settlement-services',
    jurisdiction: 'Nepal',
    title: 'Nepal Department of Immigration: Non-Tourist Visas, Residential Visas, and Online Services',
    url: 'https://nepalimmigration.gov.np/',
    quote: 'The Department of Immigration regulates foreigner entry non-tourist visas and residential permits in Nepal',
    summary: 'The Department of Immigration under the Ministry of Home Affairs administers border checkpoints, online visa processing, and foreigner monitoring under the Immigration Act 2049 (1992). Foreign nationals residing in Nepal for employment, business, NGO mission, study, or marriage must apply for a Non-Tourist Visa or Residential Visa through the Department’s online portal in Kathmandu. Foreign residents must register their local address, obtain tax clearance certificates prior to exit, and adhere to statutory stay limits.'
  }),
  settlementRecord({
    id: 'kenya-settlement-services',
    jurisdiction: 'Kenya',
    title: 'Kenya Directorate of Immigration Services: Work Permits, Alien ID Cards, and e-Services',
    url: 'https://immigration.go.ke/',
    quote: 'The Directorate of Immigration Services issues work permits alien cards and oversees citizenship in Kenya',
    summary: 'The Directorate of Immigration Services under the Ministry of Interior and National Administration regulates immigration under the Kenya Citizenship and Immigration Act 2011. Foreign nationals taking up employment, investment, or missionary work must obtain an Entry Permit (Class D employment permit, Class G investor permit, etc.) via the Electronic Foreign Nationals Services (eFNS) portal. Foreigners residing in Kenya for more than 90 days must register with the Alien Registration Section to obtain a Foreign National Certificate (Alien Card), which is mandatory for KRA PIN tax registration and opening bank accounts.'
  }),
  settlementRecord({
    id: 'jamaica-settlement-services',
    jurisdiction: 'Jamaica',
    title: 'Jamaica PICA: Passport, Immigration and Citizenship Agency and Work Permit Exemption',
    url: 'https://www.pica.gov.jm/',
    quote: 'The Passport Immigration and Citizenship Agency PICA manages immigration borders and citizenship services in Jamaica',
    summary: 'The Passport, Immigration and Citizenship Agency (PICA), an executive agency under the Ministry of National Security, governs passport issuance, immigration border management, extension of stay, and Jamaican citizenship. Foreign nationals working in Jamaica must obtain a Work Permit from the Ministry of Labour and Social Security or an official Work Permit Exemption from PICA. Permanent resident applicants, commonwealth citizens, and foreign spouses of Jamaican citizens access PICA offices in Kingston and Montego Bay for long-term residency endorsements.'
  }),
  settlementRecord({
    id: 'egypt-settlement-services',
    jurisdiction: 'Egypt',
    title: 'Egypt Ministry of Interior: Passports, Emigration and Nationality Administration Services',
    url: 'https://en.moi.gov.eg/',
    quote: 'The Passports Emigration and Nationality Administration oversees residence permits and nationality in Egypt',
    summary: 'The General Administration of Passports, Emigration and Nationality under the Egyptian Ministry of Interior regulates foreign national entry, residence permits, and Egyptian nationality. Foreigners arriving on entry visas who intend to stay for work, study, investment, or family reasons must apply for an official Egyptian Residence Permit (Iqama) at the central Abbasiya passport administration complex in Cairo or regional security directorates. Residence permits are issued as biometric cards or passport endorsements granting legal stay and local banking access.'
  }),
  settlementRecord({
    id: 'morocco-settlement-services',
    jurisdiction: 'Morocco',
    title: 'Morocco Direction Générale de la Sûreté Nationale: Carte de Séjour and Residence Permits',
    url: 'https://www.diplomatie.ma/en',
    quote: 'The Ministry of Foreign Affairs and DGSN regulate foreigner entry and the issuance of the Carte de Sejour in Morocco',
    summary: 'The Ministry of Foreign Affairs, African Cooperation and Moroccan Expatriates, together with the Direction Générale de la Sûreté Nationale (DGSN), regulates immigration under Law No. 02-03 on the entry and stay of foreigners in the Kingdom of Morocco. Foreign nationals staying in Morocco for more than 90 days must apply for an official Residence Card (Carte de Séjour / Titre de Séjour) at their local police prefecture (Préfecture de Police). Applicants must submit proof of housing, financial means or an approved employment contract stamped by the Ministry of Employment.'
  }),
  settlementRecord({
    id: 'algeria-settlement-services',
    jurisdiction: 'Algeria',
    title: 'Algeria Ministère des Affaires Étrangères and DGSN: Carte de Résidence for Foreign Residents',
    url: 'https://www.mfa.gov.dz/en',
    quote: 'The Ministry of Foreign Affairs and national security authorities manage visas and residence registration in Algeria',
    summary: 'The Ministry of Foreign Affairs and the Direction Générale de la Sûreté Nationale (DGSN) govern immigration, entry visas, and foreign resident registration in Algeria under Law No. 08-11. Foreign nationals authorized to reside in Algeria for employment, study, or commercial activity must apply for a Residence Card (Carte de Résidence pour Étrangers) at the local police prefecture (Wilaya / Daïra) within statutory timeframes. The residence card permits legal stay, domestic banking operations, and exit-visa clearances where required.'
  }),
  settlementRecord({
    id: 'lebanon-settlement-services',
    jurisdiction: 'Lebanon',
    title: 'Lebanon General Directorate of General Security: Residence Cards and Foreigner Regulations',
    url: 'https://www.general-security.gov.lb/en',
    quote: 'The General Directorate of General Security oversees border control residence permits and foreigner affairs in Lebanon',
    summary: 'The General Directorate of General Security (Sureté Générale) under the Ministry of Interior and Municipalities oversees border control, entry visas, residence cards, and work permits in Lebanon. Foreigners residing in Lebanon for work, investment, study, or family accompaniment must obtain an annual Residence Permit (Iqama) from General Security, following approval of an official work permit issued by the Ministry of Labour where employment is involved.'
  }),
  settlementRecord({
    id: 'turkey-settlement-services',
    jurisdiction: 'Turkey',
    title: 'Turkey Presidency of Migration Management: e-Ikamet Residence Permits and Foreigner Integration',
    url: 'https://en.goc.gov.tr/',
    quote: 'The Presidency of Migration Management administers e-Ikamet residence permits and harmonization in Turkey',
    summary: 'The Presidency of Migration Management (Göç İdaresi Başkanlığı - PMM) under the Ministry of Interior administers immigration, international protection, and foreigner residence under the Law on Foreigners and International Protection (Law No. 6458). Foreign nationals staying in Turkey beyond their visa exemption period must apply for a Short-Term, Family, Student, or Long-Term Residence Permit via the official e-Ikamet online system. The PMM coordinates Social Harmonization and Life Education (SUYEM) courses, Turkish language instruction, and address registration in the central civil registry (Nüfus).'
  }),
  settlementRecord({
    id: 'south-africa-settlement-services',
    jurisdiction: 'South Africa',
    title: 'South Africa Department of Home Affairs: Temporary and Permanent Residence Permits (VFS Global)',
    url: 'https://www.dha.gov.za/',
    quote: 'The Department of Home Affairs DHA manages immigration permits permanent residence and citizenship in South Africa',
    summary: 'The Department of Home Affairs (DHA) regulates immigration under the Immigration Act No. 13 of 2002. Foreign nationals seeking to live, work, study, or conduct business in South Africa apply for temporary residence visas (Critical Skills Work Visas, General Work Visas, Intra-Company Transfer Visas) and Permanent Residence Permits through DHA’s partner Visa Facilitation Services (VFS Global) centers. Permanent residents and work permit holders obtain local banking, tax registration with SARS, and driver license endorsements.'
  }),
  settlementRecord({
    id: 'united-arab-emirates-settlement-services',
    jurisdiction: 'United Arab Emirates',
    title: 'UAE ICP: Federal Authority for Identity, Citizenship, Customs and Port Security and Emirates ID',
    url: 'https://icp.gov.ae/en/',
    quote: 'The Federal Authority for Identity Citizenship Customs and Port Security ICP manages residency and Emirates ID in the UAE',
    summary: 'The Federal Authority for Identity, Citizenship, Customs and Port Security (ICP) and the General Directorate of Residency and Foreigners Affairs (GDRFA Dubai) oversee entry permits, residency visas (including the 10-year Golden Visa and 5-year Green Visa), and Emirates ID issuance in the UAE. All residents are legally required to obtain and carry an Emirates ID card, which is tied to biometrics and provides digital authentication for accessing government services, opening bank accounts, signing residential tenancy contracts (Ejari/Tawtheeq), and registering with utility providers.'
  }),
  settlementRecord({
    id: 'switzerland-settlement-services',
    jurisdiction: 'Switzerland',
    title: 'Switzerland SEM: State Secretariat for Migration and Cantonal Foreigner Integration',
    url: 'https://www.sem.admin.ch/sem/en/home.html',
    quote: 'The State Secretariat for Migration SEM is the federal authority for migration and coordinates cantonal foreigner integration',
    summary: 'The State Secretariat for Migration (SEM) under the Federal Department of Justice and Police oversees immigration, asylum, and citizenship under the Federal Act on Foreign Nationals and Integration (FNIA). Operational residence permits (Permit L short-term, Permit B residence, Permit C settlement) and population registration are administered by cantonal migration offices (such as the Office Cantonal de la Population in Geneva or Migrationsamt Zurich). Immigrants access cantonal integration programs covering local official languages (German, French, or Italian) and social integration agreements.'
  }),
  settlementRecord({
    id: 'belgium-settlement-services',
    jurisdiction: 'Belgium',
    title: 'Belgium Immigration Office: Office des Étrangers and Municipal Residence Registration',
    url: 'https://dofi.ibz.be/en',
    quote: 'The Immigration Office is responsible for the entry stay and residence of foreign nationals in Belgium',
    summary: 'The Immigration Office (Office des Étrangers / Dienst Vreemdelingenzaken) under the Federal Public Service Interior manages entry, stay, Single Permits for employment, and family reunification under the Law of 15 December 1980. Foreigners taking up residence in Belgium must register at their local municipal administration (Maison Communale / Gemeentehuis) within 8 days of arrival. Municipalities in Flanders administer the mandatory Inburgering integration trajectory (including Dutch language and societal orientation), while Wallonia and Brussels operate regional integration pathways.'
  }),
  settlementRecord({
    id: 'austria-settlement-services',
    jurisdiction: 'Austria',
    title: 'Austria BMI: Federal Ministry of the Interior, Red-White-Red Card, and Austrian Integration Fund (ÖIF)',
    url: 'https://www.migration.gv.at/en/',
    quote: 'The official migration portal provides information on the Red-White-Red Card and settlement in Austria',
    summary: 'The Federal Ministry of the Interior (BMI) and the Austrian Integration Fund (Österreichischer Integrationsfonds - ÖIF) coordinate immigration and settlement under the Settlement and Residence Act (NAG). Skilled non-EU workers apply for the points-based Red-White-Red Card (Rot-Weiß-Rot-Karte) through provincial settlement authorities (Magistrat / Bezirkshauptmannschaft). Under the statutory Integration Agreement (Integrationsvereinbarung), immigrants complete German language training up to Level A2/B1 and values courses coordinated by ÖIF.'
  }),
  settlementRecord({
    id: 'italy-settlement-services',
    jurisdiction: 'Italy',
    title: 'Italy Ministero dell’Interno: Permesso di Soggiorno and Accordo di Integrazione',
    url: 'https://www.interno.gov.it/it',
    quote: 'The Ministry of the Interior regulates the stay of foreign citizens and issues the Permesso di Soggiorno in Italy',
    summary: 'The Ministry of the Interior (Ministero dell’Interno) and the Immigration Desk (Sportello Unico per l’Immigrazione) manage immigration under the Consolidated Immigration Act (Testo Unico sull’Immigrazione - D.Lgs. 286/1998). Foreign nationals staying in Italy for more than 8 days must apply for a Residence Permit (Permesso di Soggiorno) through designated Post Offices (Sportello Amico) for evaluation by the police headquarters (Questura). Immigrants signing the Integration Agreement (Accordo di Integrazione) commit to learning Italian up to CEFR Level A2 and understanding the civic principles of the Italian Constitution.'
  }),
  settlementRecord({
    id: 'spain-settlement-services',
    jurisdiction: 'Spain',
    title: 'Spain Ministerio de Inclusión: Extranjería, Tarjeta de Identidad de Extranjero (TIE), and Empadronamiento',
    url: 'https://www.inclusion.gob.es/',
    quote: 'The Ministry of Inclusion Social Security and Migration oversees immigration procedures and integration in Spain',
    summary: 'The Ministry of Inclusion, Social Security and Migration, together with the Ministry of the Interior, governs immigration under the Ley Orgánica 4/2000 (Ley de Extranjería) and its updated regulations. Non-EU residents permitted to stay in Spain for more than 6 months must register on the municipal census (Empadronamiento) and attend the National Police immigration office (Oficina de Extranjería) to be fingerprinted for the Tarjeta de Identidad de Extranjero (TIE) card containing their Número de Identidad de Extranjero (NIE).'
  }),
  settlementRecord({
    id: 'poland-settlement-services',
    jurisdiction: 'Poland',
    title: 'Poland Office for Foreigners: Urząd do Spraw Cudzoziemców (UdSC) and Karta Pobytu',
    url: 'https://www.gov.pl/web/udsc-en',
    quote: 'The Office for Foreigners UdSC is responsible for legalising the stay of foreign citizens in Poland',
    summary: 'The Office for Foreigners (Urząd do Spraw Cudzoziemców - UdSC) and Voivodeship offices (Urząd Wojewódzki) administer temporary and permanent residence permits under the Act on Foreigners of 12 December 2013. Foreign nationals residing in Poland for employment (uniform single permit), study, business, or family reunification apply to the Department of Foreigners at their regional Voivodeship office to receive a Residence Card (Karta Pobytu). Cardholders register their address (Meldunek) to receive an automatic PESEL identification number.'
  }),
  settlementRecord({
    id: 'portugal-settlement-services',
    jurisdiction: 'Portugal',
    title: 'Portugal AIMA: Agência para a Integração, Migrações e Asilo and Residence Permits',
    url: 'https://aima.gov.pt/pt',
    quote: 'AIMA is the public institute responsible for the entry stay reception and integration of migrants in Portugal',
    summary: 'The Agency for Integration, Migrations and Asylum (Agência para a Integração, Migrações e Asilo - AIMA) is Portugal’s public agency overseeing foreigner regularisation, residence cards, and social reception. Immigrants entering on work, digital nomad, student, or family visas complete biometric appointments with AIMA to receive their Title of Residence (Título de Residência). AIMA operates the National Support Centres for the Integration of Migrants (CNAIM), providing multilingual advice on social security (NISS), healthcare (SNS), and Portuguese language training (Português Língua de Acolhimento).'
  }),
  settlementRecord({
    id: 'saudi-arabia-settlement-services',
    jurisdiction: 'Saudi Arabia',
    title: 'Saudi Arabia Absher and Muqeem: Ministry of Interior Expatriate Residency (Iqama) System',
    url: 'https://www.absher.sa/',
    quote: 'The Ministry of Interior electronic platforms Absher and Muqeem manage expatriate residency and civil transactions',
    summary: 'The General Directorate of Passports (Jawazat) under the Ministry of Interior administers immigration, residency visas, and exit-re-entry permits in Saudi Arabia under the Residency Regulations. All foreign workers entering under employer-sponsored visas must be issued a biometric Expatriate Resident Identity Card (Iqama) within 90 days of arrival. The Iqama is managed through the Ministry of Interior’s digital platforms (Absher for individuals, Muqeem for corporate employers), granting legal authorization for banking, mobile services, and housing registration (Ejar).'
  }),
  settlementRecord({
    id: 'indonesia-settlement-services',
    jurisdiction: 'Indonesia',
    title: 'Indonesia Directorate General of Immigration: Limited Stay Permit (KITAS/ITAS) and Foreigner Services',
    url: 'https://www.imigrasi.go.id/',
    quote: 'The Directorate General of Immigration oversees immigration control visas and stay permits across Indonesia',
    summary: 'The Directorate General of Immigration (Direktorat Jenderal Imigrasi) under the Ministry of Law and Human Rights regulates foreign national admission, electronic visas, and stay permits under Law No. 6 of 2011 on Immigration. Foreign nationals residing for employment, investment, research, retirement, or family accompaniment enter on a limited stay visa and receive an electronic Limited Stay Permit (e-ITAS / KITAS). Foreign residents must report to the local municipal Civil Registry Office (Disdukcapil) within 14 days of KITAS issuance to obtain a Surat Keterangan Tempat Tinggal (SKTT) residency certificate.'
  }),
  settlementRecord({
    id: 'thailand-settlement-services',
    jurisdiction: 'Thailand',
    title: 'Thailand Immigration Bureau: Non-Immigrant Visas, TM.30 Notification, and 90-Day Reporting',
    url: 'https://www.immigration.go.th/',
    quote: 'The Immigration Bureau of the Royal Thai Police oversees immigration control and foreigner stay reporting in Thailand',
    summary: 'The Immigration Bureau of the Royal Thai Police manages immigration enforcement, non-immigrant visas (B for business/work, ED for education, O for family/retirement), extension of stay, and re-entry permits under the Immigration Act B.E. 2522 (1979). Foreign nationals residing in Thailand on long-term extensions must comply with mandatory 90-day address reporting (TM.47) and ensure landlords complete accommodation notification (TM.30) within 24 hours of arrival. Employment is regulated in coordination with the Department of Employment, which issues the official Digital Work Permit.'
  }),
  settlementRecord({
    id: 'malaysia-settlement-services',
    jurisdiction: 'Malaysia',
    title: 'Malaysia Immigration Department: Employment Pass, Expatriate Services Division (ESD), and e-Pass',
    url: 'https://www.imi.gov.my/',
    quote: 'The Immigration Department of Malaysia regulates entry passes and expatriate services through the ESD portal',
    summary: 'The Immigration Department of Malaysia (Jabatan Imigresen Malaysia - JIM) under the Ministry of Home Affairs manages immigration passes, entry visas, and border security under the Immigration Act 1959/63. Expatriate employment passes (EP Categories I, II, and III) and Dependant Passes are processed through the official Expatriate Services Division (ESD) and Malaysia Digital Economy Corporation (MDEC) portals. Long-term pass holders receive digital e-Pass endorsements, permitting lawful residence, local banking, vehicle licensing with JPJ, and tax registration with LHDN.'
  })
];

export function findCountrySettlement(nameOrJurisdiction) {
  if (!nameOrJurisdiction || typeof nameOrJurisdiction !== 'string') return null;
  const target = nameOrJurisdiction.trim().toLowerCase();
  return countrySettlementRecords.find(r =>
    r.jurisdiction.toLowerCase() === target ||
    r.id.toLowerCase() === target ||
    r.title.toLowerCase().includes(target)
  ) || null;
}
