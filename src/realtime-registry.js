/**
 * Real-Time City & Country Intelligence Registry
 * 
 * Maps official national, provincial/state, and municipal regulatory sources
 * across key settlement destinations and source countries.
 */

export const MONITORED_DESTINATIONS = Object.freeze({
  CA: {
    name: 'Canada',
    provinces: ['ON', 'BC', 'AB', 'QC', 'SK', 'MB'],
    cities: ['Toronto', 'Mississauga', 'Brampton', 'Vancouver', 'Calgary', 'Ottawa', 'Montreal', 'Regina', 'Saskatoon', 'Winnipeg']
  },
  US: {
    name: 'United States',
    provinces: ['NY', 'CA', 'TX', 'WA', 'IL'],
    cities: ['New York City', 'San Francisco', 'Austin', 'Seattle', 'Chicago']
  },
  GB: {
    name: 'United Kingdom',
    provinces: ['England', 'Scotland', 'Wales'],
    cities: ['London', 'Manchester', 'Birmingham', 'Edinburgh']
  },
  AU: {
    name: 'Australia',
    provinces: ['NSW', 'VIC', 'QLD', 'WA'],
    cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth']
  },
  AE: {
    name: 'United Arab Emirates',
    provinces: ['Dubai', 'Abu Dhabi', 'Sharjah'],
    cities: ['Dubai', 'Abu Dhabi', 'Sharjah']
  },
  DE: {
    name: 'Germany',
    provinces: ['Berlin', 'Bavaria', 'Hesse'],
    cities: ['Berlin', 'Munich', 'Frankfurt']
  },
  NZ: {
    name: 'New Zealand',
    provinces: ['Auckland', 'Wellington', 'Canterbury'],
    cities: ['Auckland', 'Wellington', 'Christchurch']
  },
  IE: {
    name: 'Ireland',
    provinces: ['Leinster', 'Munster'],
    cities: ['Dublin', 'Cork']
  }
});

export const REALTIME_SOURCES = Object.freeze([
  // --- CANADA (Federal, Provincial, Municipal) ---
  {
    id: 'ca-ircc-news',
    country: 'CA',
    region: null,
    city: null,
    tier: 'national',
    topic: 'employment',
    subTopic: 'immigration_policy',
    name: 'Immigration, Refugees and Citizenship Canada (IRCC) Newsroom',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/news.html',
    feedType: 'html_diff',
    checkIntervalMinutes: 15,
    risk: 'high'
  },
  {
    id: 'ca-ircc-express-entry',
    country: 'CA',
    region: null,
    city: null,
    tier: 'national',
    topic: 'employment',
    subTopic: 'express_entry_rounds',
    name: 'IRCC Express Entry Invitations Rounds',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/rounds-invitations.html',
    feedType: 'html_diff',
    checkIntervalMinutes: 30,
    risk: 'high'
  },
  {
    id: 'ca-on-oinp-updates',
    country: 'CA',
    region: 'ON',
    city: null,
    tier: 'provincial',
    topic: 'employment',
    subTopic: 'provincial_nominee_draws',
    name: 'Ontario Immigrant Nominee Program (OINP) Updates',
    url: 'https://www.ontario.ca/page/oinp-updates',
    feedType: 'html_diff',
    checkIntervalMinutes: 30,
    risk: 'high'
  },
  {
    id: 'ca-on-ltb-rent-guideline',
    country: 'CA',
    region: 'ON',
    city: null,
    tier: 'provincial',
    topic: 'housing',
    subTopic: 'rent_increase_guidelines',
    name: 'Ontario Landlord and Tenant Board Rent Increase Guidelines',
    url: 'https://www.ontario.ca/page/residential-rent-increases',
    feedType: 'html_diff',
    checkIntervalMinutes: 60,
    risk: 'high'
  },
  {
    id: 'ca-on-toronto-transit-fares',
    country: 'CA',
    region: 'ON',
    city: 'Toronto',
    tier: 'municipal',
    topic: 'transit',
    subTopic: 'transit_fares_schedules',
    name: 'Toronto Transit Commission (TTC) Official Fares & Service Notices',
    url: 'https://www.ttc.ca/fares-and-passes',
    feedType: 'html_diff',
    checkIntervalMinutes: 120,
    risk: 'low'
  },
  {
    id: 'ca-on-toronto-rentsafeto',
    country: 'CA',
    region: 'ON',
    city: 'Toronto',
    tier: 'municipal',
    topic: 'housing',
    subTopic: 'tenant_bylaws_standards',
    name: 'City of Toronto RentSafeTO & Tenant Protection Bylaws',
    url: 'https://www.toronto.ca/community-people/housing-shelter/rental-housing-tenant-information/rents秩序eto/',
    feedType: 'html_diff',
    checkIntervalMinutes: 180,
    risk: 'high'
  },
  {
    id: 'ca-bc-pnp-updates',
    country: 'CA',
    region: 'BC',
    city: null,
    tier: 'provincial',
    topic: 'employment',
    subTopic: 'provincial_nominee_draws',
    name: 'British Columbia Provincial Nominee Program (BC PNP) News',
    url: 'https://www.welcomebc.ca/immigrate-to-b-c/news-and-updates',
    feedType: 'html_diff',
    checkIntervalMinutes: 30,
    risk: 'high'
  },
  {
    id: 'ca-bc-vancouver-translink',
    country: 'CA',
    region: 'BC',
    city: 'Vancouver',
    tier: 'municipal',
    topic: 'transit',
    subTopic: 'transit_fares_schedules',
    name: 'TransLink Metro Vancouver Fares & Transit Tariff',
    url: 'https://www.translink.ca/transit-fares/pricing-and-fare-zones',
    feedType: 'html_diff',
    checkIntervalMinutes: 120,
    risk: 'low'
  },
  {
    id: 'ca-bc-vancouver-tenant-services',
    country: 'CA',
    region: 'BC',
    city: 'Vancouver',
    tier: 'municipal',
    topic: 'housing',
    subTopic: 'renoviction_tenant_relocation',
    name: 'City of Vancouver Tenant Relocation and Protection Policy',
    url: 'https://vancouver.ca/people-programs/renovictions-and-tenant-relocation.aspx',
    feedType: 'html_diff',
    checkIntervalMinutes: 180,
    risk: 'high'
  },
  {
    id: 'ca-on-mississauga-miway',
    country: 'CA',
    region: 'ON',
    city: 'Mississauga',
    tier: 'municipal',
    topic: 'transit',
    subTopic: 'transit_fares_schedules',
    name: 'MiWay Mississauga Transit Fares & Passes',
    url: 'https://www.mississauga.ca/miway-transit/fares/',
    feedType: 'html_diff',
    checkIntervalMinutes: 180,
    risk: 'low'
  },
  {
    id: 'ca-on-brampton-rental-licensing',
    country: 'CA',
    region: 'ON',
    city: 'Brampton',
    tier: 'municipal',
    topic: 'housing',
    subTopic: 'residential_rental_licensing',
    name: 'City of Brampton Residential Rental Licensing Pilot',
    url: 'https://www.brampton.ca/EN/residents/Housing-and-Property/Rentals/Pages/Residential-Rental-Licensing.aspx',
    feedType: 'html_diff',
    checkIntervalMinutes: 180,
    risk: 'high'
  },
  {
    id: 'ca-ircc-student-work-policy',
    country: 'CA',
    region: null,
    city: null,
    tier: 'national',
    topic: 'employment',
    subTopic: 'student_work_policy',
    name: 'IRCC Study Permit Off-Campus Work & PGWP Policy',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/work/work-off-campus.html',
    feedType: 'html_diff',
    checkIntervalMinutes: 30,
    risk: 'high'
  },
  {
    id: 'ca-bc-rtb-strata-regulations',
    country: 'CA',
    region: 'BC',
    city: null,
    tier: 'provincial',
    topic: 'housing',
    subTopic: 'strata_depreciation_rules',
    name: 'BC Housing & Residential Tenancy Branch Regulatory Updates',
    url: 'https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies',
    feedType: 'html_diff',
    checkIntervalMinutes: 60,
    risk: 'high'
  },
  {
    id: 'ca-sk-ort-security-deposits',
    country: 'CA',
    region: 'SK',
    city: null,
    tier: 'provincial',
    topic: 'housing',
    subTopic: 'security_deposit_adjudication',
    name: 'Saskatchewan Office of Residential Tenancies (ORT)',
    url: 'https://www.saskatchewan.ca/residents/housing-and-renting/renting-and-leasing/security-deposits',
    feedType: 'html_diff',
    checkIntervalMinutes: 120,
    risk: 'high'
  },
  {
    id: 'ca-mb-labour-standards',
    country: 'CA',
    region: 'MB',
    city: null,
    tier: 'provincial',
    topic: 'employment',
    subTopic: 'general_holiday_pay_standards',
    name: 'Manitoba Employment Standards Branch General Holidays',
    url: 'https://www.gov.mb.ca/labour/standards/doc,gen-holidays,factsheet.html',
    feedType: 'html_diff',
    checkIntervalMinutes: 120,
    risk: 'high'
  },

  // --- UNITED STATES (Federal, State, Municipal) ---
  {
    id: 'us-uscis-alerts',
    country: 'US',
    region: null,
    city: null,
    tier: 'national',
    topic: 'employment',
    subTopic: 'immigration_policy',
    name: 'USCIS Policy Manual & Operational Alerts',
    url: 'https://www.uscis.gov/newsroom/alerts',
    feedType: 'html_diff',
    checkIntervalMinutes: 30,
    risk: 'high'
  },
  {
    id: 'us-dos-visa-bulletin',
    country: 'US',
    region: null,
    city: null,
    tier: 'national',
    topic: 'employment',
    subTopic: 'visa_bulletin_priority_dates',
    name: 'US Department of State Visa Bulletin',
    url: 'https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin.html',
    feedType: 'html_diff',
    checkIntervalMinutes: 60,
    risk: 'high'
  },
  {
    id: 'us-ny-nyc-mta-fares',
    country: 'US',
    region: 'NY',
    city: 'New York City',
    tier: 'municipal',
    topic: 'transit',
    subTopic: 'transit_fares_schedules',
    name: 'New York MTA Subway & Bus Fares',
    url: 'https://new.mta.info/fares',
    feedType: 'html_diff',
    checkIntervalMinutes: 180,
    risk: 'low'
  },
  {
    id: 'us-ny-nyc-tenant-rights',
    country: 'US',
    region: 'NY',
    city: 'New York City',
    tier: 'municipal',
    topic: 'housing',
    subTopic: 'rent_stabilization_guidelines',
    name: 'NYC Rent Guidelines Board Rent Stabilization Orders',
    url: 'https://rentguidelinesboard.cityofnewyork.us/',
    feedType: 'html_diff',
    checkIntervalMinutes: 180,
    risk: 'high'
  },

  // --- UNITED KINGDOM ---
  {
    id: 'uk-home-office-updates',
    country: 'GB',
    region: null,
    city: null,
    tier: 'national',
    topic: 'employment',
    subTopic: 'immigration_rules_changes',
    name: 'UK Visas and Immigration Operational Policy Notices',
    url: 'https://www.gov.uk/government/organisations/uk-visas-and-immigration',
    feedType: 'html_diff',
    checkIntervalMinutes: 30,
    risk: 'high'
  },
  {
    id: 'uk-eng-london-tfl-fares',
    country: 'GB',
    region: 'England',
    city: 'London',
    tier: 'municipal',
    topic: 'transit',
    subTopic: 'transit_fares_schedules',
    name: 'Transport for London (TfL) Tube and Bus Fares',
    url: 'https://tfl.gov.uk/fares/',
    feedType: 'html_diff',
    checkIntervalMinutes: 180,
    risk: 'low'
  },

  // --- AUSTRALIA ---
  {
    id: 'au-home-affairs-news',
    country: 'AU',
    region: null,
    city: null,
    tier: 'national',
    topic: 'employment',
    subTopic: 'visa_program_updates',
    name: 'Department of Home Affairs Immigration Newsroom',
    url: 'https://immi.homeaffairs.gov.au/news-media/archive',
    feedType: 'html_diff',
    checkIntervalMinutes: 30,
    risk: 'high'
  },
  {
    id: 'au-nsw-sydney-opal-fares',
    country: 'AU',
    region: 'NSW',
    city: 'Sydney',
    tier: 'municipal',
    topic: 'transit',
    subTopic: 'transit_fares_schedules',
    name: 'Transport for NSW Opal Transit Fares',
    url: 'https://transportnsw.info/tickets-opal/opal/fares-charges',
    feedType: 'html_diff',
    checkIntervalMinutes: 180,
    risk: 'low'
  },

  // --- UNITED ARAB EMIRATES ---
  {
    id: 'ae-gdrfa-dubai-visas',
    country: 'AE',
    region: 'Dubai',
    city: 'Dubai',
    tier: 'municipal',
    topic: 'employment',
    subTopic: 'golden_green_residency_visas',
    name: 'General Directorate of Residency and Foreigners Affairs (GDRFA Dubai)',
    url: 'https://www.gdrfad.gov.ae/en/services',
    feedType: 'html_diff',
    checkIntervalMinutes: 60,
    risk: 'high'
  },

  // --- GERMANY ---
  {
    id: 'de-bamf-chancenkarte-updates',
    country: 'DE',
    region: null,
    city: null,
    tier: 'national',
    topic: 'employment',
    subTopic: 'chancenkarte_blue_card_regulations',
    name: 'Federal Office for Migration and Refugees (BAMF)',
    url: 'https://www.bamf.de/EN/Themen/MigrationAufenthalt/ZuwandererDrittstaaten/zuwandererdrittstaaten-node.html',
    feedType: 'html_diff',
    checkIntervalMinutes: 60,
    risk: 'high'
  }
]);

/**
 * Filter registry sources by geographic scope or topic
 */
export function queryRealtimeSources({ country, region, city, topic, risk, tier } = {}) {
  return REALTIME_SOURCES.filter(s => {
    if (country && s.country !== country) return false;
    if (region && s.region && s.region !== region) return false;
    if (city && s.city && s.city.toLowerCase() !== city.toLowerCase()) return false;
    if (topic && s.topic !== topic) return false;
    if (risk && s.risk !== risk) return false;
    if (tier && s.tier !== tier) return false;
    return true;
  });
}
