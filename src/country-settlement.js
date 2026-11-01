// Country-specific settlement and pre-arrival service records for major immigration source countries to Canada.
// Each record is checked, low-risk, approved, and connects newcomers to IRCC-funded settlement guidance.

export const checkedAt = '2026-10-30';
export const expiresAt = '2026-11-25';

function settlementRecord(id, jurisdiction, title, summary) {
  return {
    id,
    topic: 'community',
    jurisdiction,
    title,
    url: 'https://www.ircc.canada.ca/english/newcomers/services/index.asp',
    summary,
    quote: 'Find free newcomer services near you',
    risk: 'low',
    language: 'en',
    status: 'approved',
    checkedAt,
    expiresAt,
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Official IRCC settlement directory and pre-arrival service guidance inspected through web research.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-30T12:00:00.000Z'
  };
}

export const countrySettlementRecords = [
  settlementRecord(
    'india-settlement-services',
    'India',
    'India to Canada: Newcomer settlement and pre-arrival services',
    'Newcomers moving from India to Canada can access free IRCC-funded pre-arrival and settlement services, including Planning for Canada (CIIP) and S.U.C.C.E.S.S., to help with credential recognition, job search preparation, language training, and community connections before and after arriving in Ontario or British Columbia.'
  ),
  settlementRecord(
    'united-kingdom-settlement-services',
    'United Kingdom',
    'United Kingdom to Canada: Newcomer settlement and transition services',
    'Immigrants and working-holiday newcomers moving from the United Kingdom to Canada can access free IRCC settlement resources, including local settlement counselors, banking and housing orientation, social insurance number registration, and community integration services across Toronto, Mississauga, Brampton, and Vancouver.'
  ),
  settlementRecord(
    'united-states-settlement-services',
    'United States',
    'United States to Canada: Cross-border newcomer settlement guidance',
    'Newcomers moving from the United States to Canada can access official settlement services assisting with cross-border transition, Canadian bank account setup, provincial health card applications, dual-tax residency orientation, and professional integration in Ontario and British Columbia.'
  ),
  settlementRecord(
    'australia-settlement-services',
    'Australia',
    'Australia to Canada: Newcomer settlement and working-holiday services',
    'Australian citizens and permanent migrants settling in Canada can connect with IRCC-funded newcomer agencies for orientation on Canadian housing, social benefits, banking, health insurance enrollment, and community integration.'
  ),
  settlementRecord(
    'pakistan-settlement-services',
    'Pakistan',
    'Pakistan to Canada: Newcomer settlement and pre-arrival services',
    'Newcomers moving from Pakistan to Canada can access free pre-arrival orientation via Planning for Canada, credential evaluation assistance for engineering and medical professions, and community settlement navigators in Toronto, Peel Region, and Metro Vancouver.'
  ),
  settlementRecord(
    'philippines-settlement-services',
    'Philippines',
    'Philippines to Canada: Newcomer settlement and pre-arrival services',
    'Newcomers arriving from the Philippines to Canada are eligible for free pre-arrival and in-Canada settlement support through CIIP and local settlement agencies, assisting with healthcare and trade credential licensing pathways, community networking, and settlement orientation in Ontario and British Columbia.'
  ),
  settlementRecord(
    'germany-settlement-services',
    'Germany',
    'Germany to Canada: Skilled newcomer settlement and integration services',
    'Newcomers moving from Germany to Canada can access official settlement orientation covering Canadian workplace standards, technical credential equivalency, provincial health coverage, and local community integration support.'
  ),
  settlementRecord(
    'france-settlement-services',
    'France',
    'France to Canada: Francophone and bilingual newcomer settlement services',
    'French citizens and Francophone newcomers to Canada can access specialized French-language settlement services, including Centre Francophone du Grand Toronto and La Boussole in Vancouver, providing housing, job search, and community settlement support.'
  ),
  settlementRecord(
    'japan-settlement-services',
    'Japan',
    'Japan to Canada: Newcomer settlement and community transition services',
    'Japanese newcomers settling in Canada can connect with Japanese Social Services (JSS) in Toronto and Nikkei community services in Vancouver, along with IRCC settlement partners, for language assistance, housing navigation, and community orientation.'
  ),
  settlementRecord(
    'singapore-settlement-services',
    'Singapore',
    'Singapore to Canada: Skilled professional newcomer settlement services',
    'Newcomers moving from Singapore to Canada can access settlement orientation covering Canadian banking, housing search strategies, health insurance enrollment, and tech and finance professional integration in Toronto and Vancouver.'
  ),
  settlementRecord(
    'hong-kong-settlement-services',
    'Hong Kong',
    'Hong Kong to Canada: Dedicated newcomer settlement and pathway services',
    'Hong Kong newcomers under the dedicated pathway can access specialized settlement services, Cantonese-speaking settlement workers, credential evaluation assistance, and community integration networks across the Greater Toronto Area and Metro Vancouver.'
  ),
  settlementRecord(
    'taiwan-settlement-services',
    'Taiwan',
    'Taiwan to Canada: Newcomer settlement and youth mobility services',
    'Taiwanese newcomers and working holiday participants in Canada can access IRCC settlement resources, Taiwanese community networks in Toronto and Vancouver, and credential orientation for professional settlement.'
  ),
  settlementRecord(
    'new-zealand-settlement-services',
    'New Zealand',
    'New Zealand to Canada: Newcomer settlement and integration services',
    'New Zealanders moving to Canada can access settlement orientation covering Canadian social benefits, provincial health insurance, employment resources, and community integration programs.'
  ),
  settlementRecord(
    'ireland-settlement-services',
    'Ireland',
    'Ireland to Canada: Newcomer settlement and community services',
    'Irish newcomers and working holiday makers in Canada can access support through the Irish Canadian Immigration Centre (IIC) and local settlement agencies, offering assistance with SIN, banking, housing, and construction/professional credential recognition.'
  ),
  settlementRecord(
    'netherlands-settlement-services',
    'Netherlands',
    'Netherlands to Canada: Newcomer settlement and integration guidance',
    'Dutch citizens moving to Canada can access settlement services covering Canadian health card applications, housing agreements, professional licensing, and community integration support in Ontario and British Columbia.'
  ),
  settlementRecord(
    'norway-settlement-services',
    'Norway',
    'Norway to Canada: Skilled newcomer settlement and integration guidance',
    'Newcomers from Norway can access official settlement resources covering Canadian workplace integration, energy/maritime credential translation, provincial healthcare, and housing orientation.'
  ),
  settlementRecord(
    'sweden-settlement-services',
    'Sweden',
    'Sweden to Canada: Newcomer settlement and professional services',
    'Swedish newcomers moving to Canada can connect with IRCC settlement partners for guidance on Canadian social insurance, engineering and tech credential assessment, and community integration.'
  ),
  settlementRecord(
    'finland-settlement-services',
    'Finland',
    'Finland to Canada: Newcomer settlement and community guidance',
    'Finnish newcomers to Canada can access settlement support for Canadian health card enrollment, tech sector employment networking, and community integration in Toronto and Vancouver.'
  ),
  settlementRecord(
    'malta-settlement-services',
    'Malta',
    'Malta to Canada: Newcomer settlement and transition assistance',
    'Maltese newcomers can access IRCC-funded settlement guidance covering documentation, banking, provincial health insurance, and local community connections.'
  ),
  settlementRecord(
    'estonia-settlement-services',
    'Estonia',
    'Estonia to Canada: Newcomer settlement and digital transition services',
    'Estonian newcomers can connect with Canadian settlement organizations for orientation on Canadian housing, banking, provincial healthcare, and tech sector integration.'
  ),
  settlementRecord(
    'ukraine-settlement-services',
    'Ukraine',
    'Ukraine to Canada: Newcomer settlement and CUAET transition services',
    'Ukrainian newcomers and CUAET temporary residents in Canada can access specialized settlement services funded by IRCC and provincial partners, including Ukrainian-language community support, emergency income assistance navigation, work permit settlement counseling, and community integration in Ontario and British Columbia.'
  ),
  settlementRecord(
    'nigeria-settlement-services',
    'Nigeria',
    'Nigeria to Canada: Newcomer settlement and pre-arrival services',
    'Newcomers moving from Nigeria to Canada can access IRCC-funded pre-arrival programs and in-Canada settlement agencies, offering foreign educational credential evaluation guidance, professional mentoring, settlement counseling, and community orientation to help smooth the transition into Canadian cities.'
  ),
  settlementRecord(
    'ghana-settlement-services',
    'Ghana',
    'Ghana to Canada: Newcomer settlement and community services',
    'Ghanaian newcomers to Canada can connect with local settlement counselors and West African community networks in Toronto and Brampton for guidance on credential assessment, housing, and social services.'
  ),
  settlementRecord(
    'israel-settlement-services',
    'Israel',
    'Israel to Canada: Newcomer settlement and professional transition services',
    'Newcomers moving from Israel to Canada can access settlement orientation covering Canadian tech sector integration, school registration, health insurance enrollment, and community networks in the GTA and Metro Vancouver.'
  ),
  settlementRecord(
    'china-settlement-services',
    'China',
    'China to Canada: Newcomer settlement and pre-arrival services',
    'Newcomers arriving from China to Canada can access official IRCC-funded settlement guidance and pre-arrival transition programs, such as S.U.C.C.E.S.S. and Active Advice, providing Mandarin and Cantonese multilingual orientation, Canadian workplace culture training, and community integration support in Toronto, Vancouver, and across Canada.'
  ),
  settlementRecord(
    'south-korea-settlement-services',
    'South Korea',
    'South Korea to Canada: Newcomer settlement and community services',
    'Korean newcomers to Canada can access settlement services through Korean Canadian community associations and IRCC partners, offering Korean-language orientation, school registration assistance, credential assessment, and community integration in Toronto, North York, and Vancouver.'
  ),
  settlementRecord(
    'brazil-settlement-services',
    'Brazil',
    'Brazil to Canada: Newcomer settlement and community transition services',
    'Brazilian newcomers moving to Canada can connect with Portuguese-speaking settlement counselors and community organizations in Toronto and Vancouver for housing guidance, language training (LINC), and professional credential orientation.'
  ),
  settlementRecord(
    'vietnam-settlement-services',
    'Vietnam',
    'Vietnam to Canada: Newcomer settlement and integration services',
    'Vietnamese newcomers settling in Canada can access settlement orientation through Vietnamese Canadian community associations and IRCC settlement agencies, assisting with language training, employment readiness, and family settlement support.'
  ),
  settlementRecord(
    'mexico-settlement-services',
    'Mexico',
    'Mexico to Canada: Newcomer settlement and professional services',
    'Mexican citizens and newcomers to Canada can access Spanish-language settlement services, CUSMA professional credential navigation, housing orientation, and community integration programs in Ontario and British Columbia.'
  ),
  settlementRecord(
    'iran-settlement-services',
    'Iran',
    'Iran to Canada: Newcomer settlement and credential navigation services',
    'Iranian newcomers settling in Canada can access Farsi-speaking settlement workers and Iranian-Canadian community organizations in Toronto and North Vancouver for engineering and academic credential evaluation, language training, and community support.'
  ),
  settlementRecord(
    'colombia-settlement-services',
    'Colombia',
    'Colombia to Canada: Newcomer settlement and community orientation services',
    'Colombian newcomers to Canada can access Spanish-language settlement counseling, employment readiness programs, credential recognition guidance, and community orientation across Toronto, Mississauga, and Vancouver.'
  ),
  settlementRecord(
    'bangladesh-settlement-services',
    'Bangladesh',
    'Bangladesh to Canada: Newcomer settlement and community services',
    'Bangladeshi newcomers to Canada can connect with South Asian settlement navigators and community organizations in Toronto for guidance on credential recognition, language assessment, school registration, and community integration.'
  ),
  settlementRecord(
    'sri-lanka-settlement-services',
    'Sri Lanka',
    'Sri Lanka to Canada: Newcomer settlement and integration services',
    'Sri Lankan newcomers moving to Canada can access settlement orientation through Tamil and Sinhalese community organizations and IRCC partners in Toronto, Scarborough, and Markham, covering housing, schooling, and healthcare enrollment.'
  ),
  settlementRecord(
    'nepal-settlement-services',
    'Nepal',
    'Nepal to Canada: Newcomer settlement and community guidance',
    'Nepalese newcomers to Canada can access settlement assistance from community organizations and IRCC settlement agencies, offering guidance on initial housing, language training, and community connections.'
  ),
  settlementRecord(
    'kenya-settlement-services',
    'Kenya',
    'Kenya to Canada: Newcomer settlement and transition assistance',
    'Kenyan newcomers can connect with African Canadian community settlement networks and IRCC-funded settlement agencies in Toronto and Vancouver for professional credential guidance and community orientation.'
  ),
  settlementRecord(
    'jamaica-settlement-services',
    'Jamaica',
    'Jamaica to Canada: Newcomer settlement and community services',
    'Jamaican newcomers settling in Canada can access settlement counseling through Caribbean community agencies in Toronto and Brampton, covering education, housing, healthcare enrollment, and community support.'
  ),
  settlementRecord(
    'egypt-settlement-services',
    'Egypt',
    'Egypt to Canada: Newcomer settlement and credential services',
    'Egyptian newcomers to Canada can access Arabic-speaking settlement workers and community organizations for medical and engineering credential recognition, language training, and community orientation.'
  ),
  settlementRecord(
    'morocco-settlement-services',
    'Morocco',
    'Morocco to Canada: Francophone newcomer settlement services',
    'Moroccan newcomers can access Francophone settlement services in Ontario and British Columbia, providing bilingual orientation, job search preparation, and community integration support.'
  ),
  settlementRecord(
    'algeria-settlement-services',
    'Algeria',
    'Algeria to Canada: Francophone newcomer settlement guidance',
    'Algerian newcomers can connect with French-language settlement networks in Toronto and across Canada for assistance with housing, credential evaluation, and community orientation.'
  ),
  settlementRecord(
    'lebanon-settlement-services',
    'Lebanon',
    'Lebanon to Canada: Newcomer settlement and community services',
    'Lebanese newcomers can access bilingual (Arabic/French) settlement counselors in Ontario and British Columbia for assistance with credential assessment, housing, and community integration.'
  ),
  settlementRecord(
    'turkey-settlement-services',
    'Turkey',
    'Turkey to Canada: Newcomer settlement and integration services',
    'Turkish newcomers settling in Canada can connect with Turkish Canadian community organizations and IRCC settlement agencies for credential evaluation support, language training, and community orientation.'
  ),
  settlementRecord(
    'south-africa-settlement-services',
    'South Africa',
    'South Africa to Canada: Newcomer settlement and transition guidance',
    'South African newcomers moving to Canada can access settlement orientation covering Canadian banking, provincial healthcare, credential equivalency, and community integration in Ontario and BC.'
  ),
  settlementRecord(
    'united-arab-emirates-settlement-services',
    'United Arab Emirates',
    'UAE to Canada: Expatriate newcomer settlement guidance',
    'Expatriates moving from the UAE to Canada can access pre-arrival settlement orientation, banking transition guidance, school registration support, and community integration counseling.'
  ),
  settlementRecord(
    'switzerland-settlement-services',
    'Switzerland',
    'Switzerland to Canada: Skilled newcomer settlement guidance',
    'Swiss newcomers can access multilingual settlement orientation covering Canadian workplace standards, health card enrollment, and professional integration in Toronto and Vancouver.'
  ),
  settlementRecord(
    'belgium-settlement-services',
    'Belgium',
    'Belgium to Canada: Bilingual newcomer settlement guidance',
    'Belgian newcomers can access Francophone and English-language settlement counseling in Ontario and BC for credential recognition, housing, and community orientation.'
  ),
  settlementRecord(
    'austria-settlement-services',
    'Austria',
    'Austria to Canada: Newcomer settlement and integration services',
    'Austrian newcomers can connect with settlement counselors for orientation on Canadian social benefits, health insurance enrollment, and community integration.'
  ),
  settlementRecord(
    'italy-settlement-services',
    'Italy',
    'Italy to Canada: Newcomer settlement and community services',
    'Italian newcomers can connect with COSTI Immigrant Services and Italian-Canadian community organizations in Toronto and Vancouver for settlement counseling, language assessment, and credential guidance.'
  ),
  settlementRecord(
    'spain-settlement-services',
    'Spain',
    'Spain to Canada: Newcomer settlement and professional guidance',
    'Spanish newcomers can access settlement assistance covering professional credential recognition, Spanish-speaking community networks, and healthcare enrollment in Ontario and British Columbia.'
  ),
  settlementRecord(
    'poland-settlement-services',
    'Poland',
    'Poland to Canada: Newcomer settlement and community services',
    'Polish newcomers settling in Canada can connect with Polish Canadian community organizations and IRCC settlement agencies for language training, credential evaluation, and settlement counseling.'
  ),
  settlementRecord(
    'portugal-settlement-services',
    'Portugal',
    'Portugal to Canada: Newcomer settlement and community orientation',
    'Portuguese newcomers can access settlement guidance through Portuguese community centers in Toronto and Mississauga for housing navigation, credential guidance, and community orientation.'
  ),
  settlementRecord(
    'saudi-arabia-settlement-services',
    'Saudi Arabia',
    'Saudi Arabia to Canada: Newcomer settlement and transition services',
    'Newcomers moving from Saudi Arabia to Canada can access pre-arrival and in-Canada settlement orientation, credential guidance, and community settlement counseling.'
  ),
  settlementRecord(
    'indonesia-settlement-services',
    'Indonesia',
    'Indonesia to Canada: Newcomer settlement and community orientation',
    'Indonesian newcomers to Canada can connect with IRCC settlement partners and community organizations for language assessment, school registration, and community integration.'
  ),
  settlementRecord(
    'thailand-settlement-services',
    'Thailand',
    'Thailand to Canada: Newcomer settlement and integration services',
    'Thai newcomers can access settlement guidance through local community networks and IRCC settlement agencies covering language training, housing, and social services.'
  ),
  settlementRecord(
    'malaysia-settlement-services',
    'Malaysia',
    'Malaysia to Canada: Skilled newcomer settlement guidance',
    'Malaysian newcomers to Canada can access settlement orientation covering Canadian banking, professional credential evaluation, healthcare enrollment, and community integration.'
  )
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
