// City-Specific Settlement Intelligence Records for Global Destinations
// Covers major destination gateways: New York, London, Sydney, Melbourne, Berlin, Dubai.

export const checkedAt = '2026-10-31';
export const expiresAt = '2027-01-31';

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
    reviewedAt: '2026-10-31T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  };
}

export const cityDestinationRecords = [
  // ── NEW YORK (UNITED STATES) ────────────────────────────────────────────────
  createRecord({
    id: 'us-nyc-idnyc-municipal-id',
    topic: 'sin',
    jurisdiction: 'New York',
    title: 'NYC IDNYC: Government-Issued Photo Identification for All New York City Residents',
    url: 'https://www.nyc.gov/site/idnyc/index.page',
    quote: 'IDNYC is the government-issued identification card available to all New York City residents ages 10 and up.',
    summary: 'The City of New York issues IDNYC, an official government-issued photo identification card for all NYC residents regardless of immigration status. It serves as primary proof of identity and residency for opening bank accounts at participating credit unions and commercial banks, accessing city services, enrolling children in public schools, interacting with the NYPD, and receiving library and cultural benefits. Applicants must establish identity (3 points) and NYC residency (1 point) through documents such as a foreign passport, foreign national ID card, lease agreement, or utility bill. It does not confer federal work authorization or Real ID status for domestic commercial flights.'
  }),
  createRecord({
    id: 'us-nyc-tenant-protection-rent-stabilization',
    topic: 'housing',
    housingSubject: 'agreement',
    jurisdiction: 'New York',
    title: 'NYC Housing Preservation & Development: Rent Stabilization and Security Deposit Caps',
    url: 'https://www.nyc.gov/site/hpd/services-and-information/tenants-rights.page',
    quote: 'Under New York State Housing Stability and Tenant Protection Act, security deposits are capped at one month rent.',
    summary: 'Under the New York Housing Stability and Tenant Protection Act (HSTPA) and NYC Rent Guidelines Board rules, landlords of residential rental units across New York City cannot demand more than one month rent as a security deposit. Move-in application screening and background fees are strictly capped at $20 maximum, and late fees cannot exceed $50 or 5% of monthly rent. Rent-stabilized tenants have statutory rights to automatic lease renewal and legally capped annual rent adjustments. Landlords must give at least 30 to 90 days written notice before terminating month-to-month tenancies, and self-help lockouts without a court warrant from NYC Housing Court are illegal criminal offenses.'
  }),
  createRecord({
    id: 'us-nyc-mta-omny-transit',
    topic: 'transit',
    jurisdiction: 'New York',
    title: 'MTA New York City Transit: OMNY Contactless Fare Capping and MetroCard Guide',
    url: 'https://new.mta.info/fares/omny',
    quote: 'Tap with OMNY using your contactless card or smart device and automatically earn free rides after 12 paid trips within a Monday-to-Sunday cycle.',
    summary: 'Metropolitan Transportation Authority (MTA) operates the subway and bus network across all five boroughs of New York City (Manhattan, Brooklyn, Queens, Bronx, Staten Island). Newcomers can pay fares using OMNY by tapping any contactless credit/debit card, Apple Pay, Google Pay, or physical OMNY card at turnstiles. Under the weekly 7-day fare cap, once a rider completes 12 paid fares ($2.90 per ride) using the same card or device between Monday 12:00 AM and Sunday 11:59 PM, all subsequent subway and local bus trips for the remainder of that seven-day window are automatically free.'
  }),

  // ── LONDON (UNITED KINGDOM) ────────────────────────────────────────────────
  createRecord({
    id: 'uk-london-tfl-oyster-contactless',
    topic: 'transit',
    jurisdiction: 'London',
    title: 'Transport for London (TfL): Contactless, Oyster Card and Fare Zones',
    url: 'https://tfl.gov.uk/fares/how-to-pay-and-where-to-buy-tickets-and-oyster',
    quote: 'You can pay as you go using contactless or an Oyster card to travel on London Underground, buses, DLR, and London Overground.',
    summary: 'Transport for London (TfL) manages public transportation across London Zones 1 through 9. Fares are automatically calculated and capped daily and weekly (Monday to Sunday) when tapping the same contactless bank card or Oyster smartcard at both entry and exit yellow card readers. London buses and trams are completely cashless. Newcomers do not need to buy paper tickets; any contactless debit/credit card or smart device is charged the exact same adult pay-as-you-go rate as an Oyster card without deposit fees.'
  }),
  createRecord({
    id: 'uk-london-nhs-gp-registration',
    topic: 'health',
    jurisdiction: 'London',
    title: 'NHS London: Registering with a Local GP Surgery in Greater London',
    url: 'https://www.nhs.uk/nhs-services/gps/how-to-register-with-a-gp-surgery/',
    quote: 'Anyone in England can register with a GP surgery for free; you do not need proof of address, immigration status, ID or an NHS number.',
    summary: 'Under official NHS England statutory guidance, anyone living in Greater London has the right to register with a local GP (General Practitioner) surgery free of charge. GP practices cannot refuse registration on grounds of nationality, immigration status, lack of photographic ID, or lack of proof of address. Primary care consultations, emergency care at NHS Walk-in Centres or A&E hospital departments, and family planning are 100% free at point of delivery for all residents, regardless of whether you have paid the immigration health surcharge (IHS).'
  }),
  createRecord({
    id: 'uk-london-tenancy-deposit-protection',
    topic: 'housing',
    housingSubject: 'deposit',
    jurisdiction: 'London',
    title: 'Greater London Authority: Tenant Rights and Tenancy Deposit Protection in London',
    url: 'https://www.london.gov.uk/programmes-strategies/housing-and-land/improving-private-rented-sector/london-tenants-guide',
    quote: 'Tenancy deposit amounts are capped at 5 weeks rent under the Tenant Fees Act 2019.',
    summary: 'Under the Tenant Fees Act 2019 and Housing Act statutory protections across London boroughs, tenancy deposits are capped at a maximum of 5 weeks rent (for annual rent under £50,000). Landlords and letting agencies are legally barred from charging tenant admin fees, reference fees, inventory fees, or renewal fees. Landlords must protect your deposit in an authorized government scheme (TDS, DPS, or mydeposits) within 30 days and provide Prescribed Information. Landlords cannot evict tenants without a court order, and Section 21 notice is invalid if the deposit was unprotected.'
  }),

  // ── SYDNEY (AUSTRALIA) ─────────────────────────────────────────────────────
  createRecord({
    id: 'au-sydney-transport-opal-card',
    topic: 'transit',
    jurisdiction: 'Sydney',
    title: 'Transport for NSW: Opal Smartcard and Transit Fare Capping in Greater Sydney',
    url: 'https://transportnsw.info/tickets-opal/opal',
    quote: 'Opal is the smartcard ticketing system used on public transport across the Greater Sydney region.',
    summary: 'Transport for NSW runs the multimodal public transit network in Greater Sydney, including Sydney Trains, Metro, Ferries, Light Rail, and Buses. Commuters can tap with an Opal card or an American Express, Mastercard, or Visa contactless card/device. Fares benefit from statutory Daily and Weekly Fare Caps, a 30% off-peak discount on train and metro journeys outside morning and evening rush hours, and a $2 transfer discount when changing transport modes within 60 minutes.'
  }),
  createRecord({
    id: 'au-sydney-nsw-fair-trading-rental-bonds',
    topic: 'housing',
    housingSubject: 'deposit',
    jurisdiction: 'Sydney',
    title: 'NSW Fair Trading: Rental Bonds Online and Residential Tenancies in Sydney',
    url: 'https://www.fairtrading.nsw.gov.au/housing-and-property/renting',
    quote: 'A rental bond cannot exceed four weeks rent under the Residential Tenancies Act 2010.',
    summary: 'Under the NSW Residential Tenancies Act 2010, landlords and real estate agents in Sydney cannot demand a rental bond of more than 4 weeks rent, and cannot demand rent in advance exceeding 2 weeks. All rental bonds must be lodged with the NSW Rental Bond Board via Rental Bonds Online (RBO) within 7 days. Landlords must provide premises that are fit to live in, conduct repairs within statutory timeframes, and cannot increase rent more than once in 12 months for fixed-term or periodic leases.'
  }),

  // ── MELBOURNE (AUSTRALIA) ──────────────────────────────────────────────────
  createRecord({
    id: 'au-melbourne-ptv-myki-free-tram',
    topic: 'transit',
    jurisdiction: 'Melbourne',
    title: 'Public Transport Victoria: myki Smartcard and Melbourne Free Tram Zone',
    url: 'https://www.ptv.vic.gov.au/tickets/myki/',
    quote: 'Travel on trams within the designated Free Tram Zone in the Melbourne CBD and Docklands is free.',
    summary: 'Public Transport Victoria (PTV) operates metropolitan Melbourne train, tram, and bus services using the reusable myki smartcard. Inside the Melbourne CBD and Docklands Free Tram Zone, tram travel is completely free and passengers do not need to touch on or touch off. For travel outside the Free Tram Zone, touch on with a myki card or Mobile myki on Android. Fares follow a 2-hour or daily cap covering Zone 1 and Zone 2, and weekend daily caps apply discounted rates.'
  }),
  createRecord({
    id: 'au-melbourne-consumer-affairs-renting',
    topic: 'housing',
    housingSubject: 'agreement',
    jurisdiction: 'Melbourne',
    title: 'Consumer Affairs Victoria: Residential Rental Agreements and Bond Lodgement',
    url: 'https://www.consumer.vic.gov.au/housing/renting',
    quote: 'Rental providers must lodge bonds with the Residential Tenancies Bond Authority (RTBA) within 10 business days.',
    summary: 'Under the Victorian Residential Tenancies Act 1997 (reformed 2021), maximum rental bond in Melbourne is 1 month rent (unless weekly rent exceeds $900). Rental providers must lodge bonds directly with the Residential Tenancies Bond Authority (RTBA). Rent increases are restricted to once every 12 months with 60 days official notice on prescribed Consumer Affairs Victoria forms. Rental minimum standards mandate functioning heating, deadlatches, kitchen facilities, and ventilation, and urgent repairs up to $2,500 must be organized within 24 to 48 hours.'
  }),

  // ── BERLIN (GERMANY) ───────────────────────────────────────────────────────
  createRecord({
    id: 'de-berlin-buergeramt-anmeldung',
    topic: 'community',
    jurisdiction: 'Berlin',
    title: 'Service-Portal Berlin: Bürgeramt Anmeldung Address Registration Protocol',
    url: 'https://service.berlin.de/dienstleistung/120686/',
    quote: 'Under the Federal Act on Registration, you must register your residential address within 14 days of moving in.',
    summary: 'Under the Federal Act on Registration (Bundesmeldegesetz - BMG), every person establishing residence in Berlin must complete the Anmeldung address registration at any Bürgeramt across Berlin within 14 days of moving in. You must book an appointment online or via telephone (115) and present: (1) Valid passport or national ID card; (2) Official landlord confirmation form (Wohnungsgeberbestätigung) signed by the property owner; (3) Completed registration form (Anmeldeformular). The Meldebestätigung registration certificate issued at the appointment is mandatory for receiving your Steuer-ID tax number from the Federal Central Tax Office (BZSt), opening a German bank account, and enrolling in statutory GKV health insurance.'
  }),
  createRecord({
    id: 'de-berlin-bvg-transit-zones',
    topic: 'transit',
    jurisdiction: 'Berlin',
    title: 'BVG Berlin: Fare Zones AB and ABC and Deutschlandticket Navigation',
    url: 'https://www.bvg.de/en/subscriptions-and-tickets',
    quote: 'Berlin public transport is divided into tariff zones A, B, and C with integrated U-Bahn, S-Bahn, Tram, and Bus services.',
    summary: 'Berliner Verkehrsbetriebe (BVG) and S-Bahn Berlin run the integrated transit network divided into Tariff Zones A (inside the S-Bahn Ring), B (up to the city boundary), and C (Greater Berlin including Berlin Brandenburg Airport BER and Potsdam). Tickets must be validated at a yellow or red stamping box on the platform or inside the bus/tram before boarding unless purchased digitally via the BVG app. For residents, the nationwide Deutschlandticket subscription provides unlimited travel on all local and regional public transit across Berlin and Germany.'
  }),

  // ── DUBAI (UNITED ARAB EMIRATES) ───────────────────────────────────────────
  createRecord({
    id: 'uae-dubai-ejari-tenancy-registration',
    topic: 'housing',
    housingSubject: 'agreement',
    jurisdiction: 'Dubai',
    title: 'Dubai Land Department: Ejari Tenancy Contract Registration and RERA Rental Index',
    url: 'https://dubailand.gov.ae/en/services/ejari/',
    quote: 'Ejari is the mandatory system for authenticating and recording all tenancy agreements in the Emirate of Dubai.',
    summary: 'The Dubai Land Department (DLD) and Real Estate Regulatory Agency (RERA) mandate that every residential rental contract in Dubai must be registered in the official Ejari portal. An official Ejari certificate is statutory prerequisite for connecting DEWA (electricity and water), sponsoring family residency visas, installing home broadband, and registering commercial trade licenses. Annual rent increases are strictly restricted by Decree No. 43 of 2013 and determined exclusively by the official RERA Rental Calculator: if current rent is within 10% of market average, zero rent increase is permitted.'
  }),
  createRecord({
    id: 'uae-dubai-rta-nol-transit-card',
    topic: 'transit',
    jurisdiction: 'Dubai',
    title: 'RTA Dubai: NOL Smartcard and Dubai Metro, Tram and Bus Navigation',
    url: 'https://www.rta.ae/wps/portal/rta/ae/public-transport/nol',
    quote: 'A Nol Card is a contactless smart card used to pay for Dubai Metro, Buses, Tram, Water Buses, and RTA paid parking.',
    summary: 'The Roads and Transport Authority (RTA) in Dubai operates the automated driverless Dubai Metro (Red and Green Lines), Dubai Tram, Dubai Bus network, marine abras, and public parking. Travel requires a contactless NOL card (Silver card for standard commuters, Gold card for Gold Class cabins, or Personal Nol card). Commuters must tap on at turnstiles/readers upon entry and tap off upon exit; fares are calculated based on the number of transit zones crossed (Zones 1 through 7) within a single journey.'
  }),
  createRecord({
    id: 'uae-dubai-dha-health-insurance-ebp',
    topic: 'health',
    jurisdiction: 'Dubai',
    title: 'Dubai Health Authority (DHA): Mandatory Health Insurance and Essential Benefits Plan',
    url: 'https://www.dha.gov.ae/en/health-insurance',
    quote: 'Under Dubai Health Insurance Law No. 11 of 2013, employers must provide compliant health insurance for all employees.',
    summary: 'Under Dubai Health Insurance Law No. 11 of 2013 (ISAHD framework), employers in Dubai are legally obligated to provide continuous medical insurance coverage for every employee from visa issuance. Employers cannot deduct health insurance premiums from employee salaries. For lower-income workers (earning AED 4,000 or less per month) and non-working dependents, compliant coverage is provided via the Essential Benefits Plan (EBP), featuring capped annual limits, outpatient consultation co-pays (max 20%), and statutory emergency inpatient care.'
  }),

  // ── LOS ANGELES & SAN FRANCISCO (UNITED STATES) ───────────────────────────
  createRecord({
    id: 'us-la-metro-tap-transit',
    topic: 'transit',
    jurisdiction: 'Los Angeles',
    title: 'LA Metro: TAP Contactless Card and 1-Day & 7-Day Fare Capping in Los Angeles',
    url: 'https://www.metro.net/riding/fares/',
    quote: 'With 1-Day and 7-Day Fare Capping, once you spend $5 in a day or $18 in a week, you ride free for the rest of that day or week.',
    summary: 'Los Angeles County Metropolitan Transportation Authority (Metro) operates the regional bus and light rail/subway network across LA County. Commuters pay using a physical TAP card or virtual TAP card in Apple Wallet or Google Wallet. Metro fare capping guarantees that once a rider pays $5 in fares ($1.75 base fare with 2 hours of free transfers) in a calendar day or $18 between Monday and Sunday using the same card, all subsequent rides for the remainder of that period are completely free.'
  }),
  createRecord({
    id: 'us-sf-rent-board-rent-control',
    topic: 'housing',
    housingSubject: 'agreement',
    jurisdiction: 'San Francisco',
    title: 'San Francisco Rent Board: Rent Control Limits and Just Cause Eviction Protections',
    url: 'https://www.sf.gov/rent-board',
    quote: 'The Rent Ordinance covers most residential rental units in buildings built before June 13, 1979.',
    summary: 'Under the San Francisco Residential Rent Stabilization and Arbitration Ordinance (San Francisco Administrative Code Chapter 37), residential rental units with a certificate of occupancy issued before June 13, 1979 are subject to statutory annual rent increase caps published each March by the Rent Board (capped at 60% of regional CPI). Landlords cannot terminate tenancies without one of 16 statutory just-cause grounds. In no-fault evictions, landlords must pay statutory relocation payments exceeding $7,000 per tenant.'
  }),

  // ── MANCHESTER & EDINBURGH (UNITED KINGDOM) ───────────────────────────────
  createRecord({
    id: 'uk-manchester-tfgm-bee-network',
    topic: 'transit',
    jurisdiction: 'Manchester',
    title: 'Transport for Greater Manchester: Bee Network Integrated Bus and Metrolink Fares',
    url: 'https://tfgm.com/bee-network',
    quote: 'The Bee Network is Greater Manchester integrated public transport system bringing together buses, trams, and trains.',
    summary: 'Transport for Greater Manchester (TfGM) coordinates the Bee Network across 10 Greater Manchester boroughs. Single adult bus trips are capped at £2.00, and a 1-day AnyBus ticket provides unlimited bus travel across all operators in Greater Manchester for £5.00. Metrolink tram journeys offer contactless pay-as-you-go capping with daily and weekly maximum charges when tapping on and tapping off at platform smart readers.'
  }),
  createRecord({
    id: 'uk-edinburgh-scottish-prt-housing',
    topic: 'housing',
    housingSubject: 'agreement',
    jurisdiction: 'Edinburgh',
    title: 'Scottish Government: Private Residential Tenancy (PRT) Rights in Edinburgh',
    url: 'https://www.gov.scot/policies/private-renting/',
    quote: 'All new private residential tenancies in Scotland are open-ended Private Residential Tenancies with no fixed end date.',
    summary: 'Under the Private Housing (Tenancies) (Scotland) Act 2016, all private residential leases in Edinburgh and Scotland are statutory Private Residential Tenancies (PRT) with open-ended duration. Landlords cannot evict a tenant without obtaining an eviction order from the First-tier Tribunal for Scotland (Housing and Property Chamber) on one of 18 statutory grounds. Tenancy deposits are capped at a maximum of 2 months rent and must be placed in a Scottish government-approved tenancy deposit scheme within 30 working days.'
  }),

  // ── PARIS (FRANCE) ────────────────────────────────────────────────────────
  createRecord({
    id: 'fr-paris-encadrement-loyers-housing',
    topic: 'housing',
    housingSubject: 'agreement',
    jurisdiction: 'Paris',
    title: 'Direction Régionale et Interdépartementale: Encadrement des Loyers in Paris',
    url: 'https://www.drieat.ile-de-france.developpement-durable.gouv.fr/encadrement-des-loyers-a4161.html',
    quote: 'L encadrement des loyers fixe un loyer de référence majoré à ne pas dépasser pour les baux d habitation à Paris.',
    summary: 'Under Loi ALUR and Loi ELAN (Encadrement des loyers), residential leases in the City of Paris cannot exceed the official maximum reference rent (loyer de référence majoré) per square meter set annually by prefectural decree based on location, building construction era, room count, and furnished status. Rent supplements (complément de loyer) are strictly reserved for rare exceptional features. Tenants can contest excessive rent through the Commission Départementale de Conciliation (CDC) or judicial court for retroactive refunds.'
  }),

  // ── DUBLIN (IRELAND) ──────────────────────────────────────────────────────
  createRecord({
    id: 'ie-dublin-tfi-leap-card-transit',
    topic: 'transit',
    jurisdiction: 'Dublin',
    title: 'Transport for Ireland (TFI): TFI Leap Card 90-Minute Fare and Dublin Capping',
    url: 'https://www.leapcard.ie/en/NavigationPages/CardDetails.aspx',
    quote: 'The TFI 90 Minute Fare applies to most journeys in the Dublin area on Dublin Bus, Luas, DART, and commuter rail.',
    summary: 'Transport for Ireland (TFI) operates integrated ticketing across the Greater Dublin Area using the contactless TFI Leap Card. Under the TFI 90-Minute Fare, adult passengers can travel and transfer between Dublin Bus, Luas light rail, DART, and Go-Ahead Ireland for a flat fare of €2.00 (€1.00 for Young Adults and Students) within 90 minutes. Daily expenditure is capped at €8.00 and weekly spending is capped at €32.00.'
  }),

  // ── AUCKLAND (NEW ZEALAND) ────────────────────────────────────────────────
  createRecord({
    id: 'nz-auckland-at-hop-card-transit',
    topic: 'transit',
    jurisdiction: 'Auckland',
    title: 'Auckland Transport: AT HOP Card and Multimodal Fare Zones in Greater Auckland',
    url: 'https://at.govt.nz/bus-train-ferry/at-hop-card',
    quote: 'AT HOP is a reusable contactless smart card for travel on Auckland buses, trains, and ferries.',
    summary: 'Auckland Transport (AT) operates the integrated rail and bus network across Greater Auckland. Paying with a reusable AT HOP card provides at least a 20% discount compared to single cash tickets. Auckland simplified zone ticketing treats transfers between buses and trains within 30 minutes (over up to a 4-hour journey) as a single continuous trip, charging one unified fare based on the total number of zones crossed rather than separate boarding fees.'
  }),

  // ── AMSTERDAM (NETHERLANDS) ───────────────────────────────────────────────
  createRecord({
    id: 'nl-amsterdam-brp-bsn-registration',
    topic: 'community',
    jurisdiction: 'Amsterdam',
    title: 'Gemeente Amsterdam: Municipal BRP Address Registration and BSN Issuance',
    url: 'https://www.amsterdam.nl/en/civil-affairs/first-registration/',
    quote: 'Anyone moving to Amsterdam for more than 4 months must register with the municipality within 5 days of arrival.',
    summary: 'Under the Dutch Wet basisregistratie personen (BRP), international newcomers establishing residence in Amsterdam for more than 4 months must register at a Gemeente Amsterdam municipal desk (Stadsloket or IN Amsterdam) within 5 days of arrival. You must bring a valid passport, official rental contract or signed Landlord Declaration, and authenticated birth certificate. Registration automatically generates your Burgerservicenummer (BSN), which is mandatory for Dutch employment payroll, bank accounts, and basic health insurance.'
  }),

  // ── STOCKHOLM (SWEDEN) ────────────────────────────────────────────────────
  createRecord({
    id: 'se-stockholm-sl-transit-card',
    topic: 'transit',
    jurisdiction: 'Stockholm',
    title: 'SL (Storstockholms Lokaltrafik): Contactless Fares and Stockholm Metro System',
    url: 'https://sl.se/en/in-english/fares--tickets',
    quote: 'You can tap your contactless payment card or smartphone directly at ticket barriers across the SL network.',
    summary: 'Storstockholms Lokaltrafik (SL) operates the Tunnelbana metro, commuter trains (Pendeltåg), trams, buses, and inner-city ferries throughout Stockholm County. Passengers can tap any contactless debit or credit card or smart device directly at ticket gates. A single ticket is valid for unlimited transfers across all SL transport modes for 75 minutes. For regular commuters, 24-hour, 72-hour, 7-day, and 30-day passes offer unlimited county-wide travel.'
  }),

  // ── MADRID & BARCELONA (SPAIN) ────────────────────────────────────────────
  createRecord({
    id: 'es-madrid-padron-empadronamiento',
    topic: 'community',
    jurisdiction: 'Madrid',
    title: 'Ayuntamiento de Madrid: Certificado de Empadronamiento Municipal Census Protocol',
    url: 'https://sede.madrid.es/portal/site/tramites',
    quote: 'El empadronamiento es el trámite que acredita el tiempo de permanencia en territorio español y fija la residencia en Madrid.',
    summary: 'Under Spanish municipal law, all individuals residing in Madrid must register on the municipal census (Padrón Municipal de Habitantes) at an Oficina de Atención a la Ciudadanía. Applicants must bring a valid passport, NIE if issued, and proof of housing (rental contract signed by the owner plus copy of landlord DNI and latest IBI tax receipt). The Certificado de Empadronamiento is a statutory prerequisite for public healthcare access (Tarjeta Sanitaria), school enrollment, and Spanish immigration residency cards.'
  }),
  createRecord({
    id: 'es-barcelona-t-mobilitat-transit',
    topic: 'transit',
    jurisdiction: 'Barcelona',
    title: 'Autoritat del Transport Metropolità (ATM): T-mobilitat Transit System in Barcelona',
    url: 'https://www.t-mobilitat.atm.cat/en/',
    quote: 'T-mobilitat is the digital ticketing system that allows you to travel on public transport in the Barcelona area.',
    summary: 'Autoritat del Transport Metropolità (ATM) coordinates metropolitan transit across Barcelona (TMB Metro, FGC, Rodalies trains, and buses). Commuters use the contactless T-mobilitat card or mobile app. The T-usual card offers unlimited rides across Zone 1 for 30 consecutive days at a deeply discounted monthly rate, while the T-casual multi-trip pass provides 10 integrated journeys with 75 minutes of free multimodal transfer per journey.'
  }),

  // ── ABU DHABI (UNITED ARAB EMIRATES) ──────────────────────────────────────
  createRecord({
    id: 'ae-abu-dhabi-hafilat-transit',
    topic: 'transit',
    jurisdiction: 'Abu Dhabi',
    title: 'Integrated Transport Centre: Hafilat Smartcard and Abu Dhabi Public Bus Network',
    url: 'https://www.itc.gov.ae/en/Services/Hafilat',
    quote: 'Hafilat is an automated smartcard fare collection system on Abu Dhabi public transport buses.',
    summary: 'The Integrated Transport Centre (ITC / Abu Dhabi Mobility) operates public bus services across Abu Dhabi Island, the surrounding suburbs, and regional routes to Al Ain. All passengers must use a rechargeable Hafilat smartcard, tapping on at validators upon entering and tapping off upon exiting. Local city trips carry a flat base fare of AED 2.00, and suburban trips add AED 0.05 per kilometer. Regular commuters can purchase a 7-day or 30-day Hafilat pass for unlimited city bus travel.'
  })
];
