// Secondary Gateway Records for Major Newcomer Hubs:
// US Secondary Gateways: Chicago, Seattle, Boston, Austin
// Canadian Gateways: Calgary, Ottawa, Montreal

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

export const secondaryGatewayRecords = [
  // ── CHICAGO (UNITED STATES) ─────────────────────────────────────────────────
  createRecord({
    id: 'us-chicago-cta-ventra-transit',
    topic: 'transit',
    jurisdiction: 'Chicago',
    title: 'Chicago Transit Authority (CTA): Ventra Contactless Fare System and Regional Transit',
    url: 'https://www.transitchicago.com/fares/',
    quote: "The Chicago Transit Authority provides bus and 'L' train transit across Chicago using the Ventra contactless fare system.",
    summary: "The Chicago Transit Authority (CTA) operates the 'L' rapid transit train system and comprehensive bus routes across Chicago and 35 surrounding suburbs. Fares can be paid by tapping a contactless credit or debit card, Apple Pay, Google Pay, or a physical Ventra Card. A single 'L' train fare is $2.50 ($5.00 from O'Hare International Airport) and includes up to two free transfers within two hours across CTA buses and trains. Unlimited 1-Day ($5), 3-Day ($15), 7-Day ($20), and 30-Day ($75) passes provide unlimited rides across all CTA routes."
  }),
  createRecord({
    id: 'us-chicago-rlto-tenant-rights',
    topic: 'housing',
    housingSubject: 'deposit',
    jurisdiction: 'Chicago',
    title: 'Chicago Residential Landlord and Tenant Ordinance (RLTO): Security Deposits and Entry Notice',
    url: 'https://www.chicago.gov/city/en/depts/doh/provdrs/renters/svcs/rents-rights.html',
    quote: 'The Chicago Residential Landlord and Tenant Ordinance regulates rental agreements and tenant rights in Chicago.',
    summary: 'Under the Chicago Residential Landlord and Tenant Ordinance (RLTO, Municipal Code Title 5, Chapter 12), tenants residing in buildings with more than six units (or non-owner-occupied buildings) receive strict statutory protections. Landlords must hold security deposits in a separate federally insured, interest-bearing Illinois bank account, provide a written receipt specifying the bank name at signing, and pay statutory annual interest. Landlords must provide at least 48 hours advance written notice before entering rental premises (except in emergencies), and must return security deposits with an itemized accounting within 45 days of vacating.'
  }),

  // ── SEATTLE (UNITED STATES) ─────────────────────────────────────────────────
  createRecord({
    id: 'us-seattle-orca-transit-link',
    topic: 'transit',
    jurisdiction: 'Seattle',
    title: 'Seattle ORCA Transit: Sound Transit Link Light Rail and King County Metro Contactless Fares',
    url: 'https://www.soundtransit.org/ride-with-us/how-to-pay/fares',
    quote: 'ORCA is the contactless smart card and mobile fare payment system for transit in the Puget Sound region.',
    summary: 'In the Seattle metropolitan region, transit is coordinated through Sound Transit and King County Metro using the One Regional Card for All (ORCA) payment system. Riders tap their ORCA card, smartphone, or contactless bank card when boarding buses and at Link light rail stations before boarding and after exiting. Link light rail operates from Seattle-Tacoma International Airport (Sea-Tac) through Downtown Seattle to Lynnwood with flat adult fares of $3.00. ORCA provides automatic 2-hour transfer credit between buses, light rail, and Seattle streetcars.'
  }),
  createRecord({
    id: 'us-seattle-rrio-just-cause-tenancy',
    topic: 'housing',
    housingSubject: 'eviction',
    jurisdiction: 'Seattle',
    title: 'Seattle Department of Construction & Inspections: Just Cause Eviction and Tenant Protections',
    url: 'https://www.seattle.gov/rentinginseattle/renters/rights-and-responsibilities',
    quote: 'Seattle rental housing laws protect tenants through the Just Cause Eviction Ordinance and move-in fee limits.',
    summary: 'Under Seattle Municipal Code (SMC 22.206) and the Renting in Seattle regulations, landlords must register all rental properties with the Rental Registration and Inspection Ordinance (RRIO). Landlords can only terminate a tenancy for one of 18 specific statutory just cause reasons, prohibiting arbitrary non-renewals. Total move-in fees and security deposits cannot exceed one month rent, and tenants have the legal right to pay move-in costs in six equal consecutive monthly installments for leases of six months or longer. Landlords must provide 180 days advance written notice for any rent increase.'
  }),

  // ── BOSTON (UNITED STATES) ──────────────────────────────────────────────────
  createRecord({
    id: 'us-boston-mbta-charliecard-transit',
    topic: 'transit',
    jurisdiction: 'Boston',
    title: 'Massachusetts Bay Transportation Authority (MBTA): CharlieCard and Contactless Fare Payment',
    url: 'https://www.mbta.com/fares',
    quote: 'The MBTA operates subway, bus, trolley, and ferry service across the Greater Boston area.',
    summary: "The Massachusetts Bay Transportation Authority (MBTA, known locally as 'the T') operates subway (Red, Orange, Blue, Green lines), Silver Line bus rapid transit, local buses, and Commuter Rail across Greater Boston. Riders pay using a reusable plastic CharlieCard, CharlieTicket, or contactless tap-to-pay at fare gates and onboard buses. Subway fare is $2.40 and local bus is $1.70, including one free transfer within two hours between subway and bus. The Silver Line SL1 bus from Logan International Airport into South Station is free for all inbound passengers."
  }),
  createRecord({
    id: 'us-boston-mass-tenant-security-deposits',
    topic: 'housing',
    housingSubject: 'deposit',
    jurisdiction: 'Boston',
    title: 'Massachusetts General Laws Chapter 186 Section 15B: Security Deposit Escrow Mandate',
    url: 'https://www.mass.gov/info-details/tenant-rights',
    quote: 'Massachusetts law strictly regulates what payments a landlord can collect from a tenant at the start of tenancy.',
    summary: 'Under Massachusetts General Laws Chapter 186, Section 15B, landlords are legally restricted to collecting only four upfront payments: first month rent, last month rent, a security deposit equal to no more than one month rent, and the cost of a new lock and key. Security deposits must be deposited within 30 days into a separate, interest-bearing Massachusetts bank account protected from landlord creditors. The landlord must provide the tenant a receipt stating the bank name, account number, and annual interest rate (or 5% statutory interest). Landlords who fail to comply forfeit the right to retain any portion of the deposit.'
  }),

  // ── AUSTIN (UNITED STATES) ───────────────────────────────────────────────────
  createRecord({
    id: 'us-austin-capmetro-amp-transit',
    topic: 'transit',
    jurisdiction: 'Austin',
    title: 'Capital Metro (CapMetro): Austin Public Transit Network and Contactless Fare Capping',
    url: 'https://www.capmetro.org/fares',
    quote: 'CapMetro provides bus and rail transit service across the City of Austin and Travis County.',
    summary: 'Capital Metro (CapMetro) operates the public transit network throughout Austin, Texas, including Local Bus, MetroRapid (Routes 801 & 803), MetroExpress, and the MetroRail commuter line connecting Downtown Austin to Leander. Single local bus and rapid rides cost $1.25, with day passes capped at $2.50. Riders can pay using the CapMetro App, Amp contactless smart card, or physical passes. CapMetro implements automated fare capping so that riders never pay more than the cost of a daily ($2.50) or monthly ($41.25) pass when paying with their Amp card or digital account.'
  }),
  createRecord({
    id: 'us-austin-texas-property-code-repairs',
    topic: 'housing',
    housingSubject: 'repairs',
    jurisdiction: 'Austin',
    title: 'Texas Property Code Chapter 92: Tenant Repair and Deduct Rights and Landlord Obligations',
    url: 'https://guides.sll.texas.gov/landlord-tenant-law/failure-to-repair',
    quote: 'Texas Property Code Section 92.056 outlines the landlord duty to repair conditions affecting physical health and safety.',
    summary: 'Under Texas Property Code Chapter 92 (Subchapter B), landlords must make a diligent effort to repair or remedy any condition that materially affects the physical health or safety of an ordinary tenant, including sewage backups, lack of potable water, structural collapse, and air conditioning or heating system failures. The tenant must be current on rent and deliver written notice by certified mail. If the landlord fails to remedy the condition within a reasonable time (statutorily presumed to be seven days), the tenant may exercise statutory remedies including repair-and-deduct up to one month rent, lease termination, or legal damages under Section 92.0563.'
  }),

  // ── CALGARY (CANADA - ALBERTA) ──────────────────────────────────────────────
  createRecord({
    id: 'ca-calgary-transit-ctrain-myfare',
    topic: 'transit',
    jurisdiction: 'Calgary',
    title: 'Calgary Transit: CTrain Light Rail Network, My Fare App, and Fare-Free Downtown Zone',
    url: 'https://www.calgarytransit.com/content/transit/en/home/fares---passes.html',
    quote: 'Calgary Transit operates bus and CTrain light rail transit across Calgary, Alberta.',
    summary: 'Calgary Transit operates the Red and Blue CTrain light rail lines and extensive bus routes across the City of Calgary, Alberta. Single adult fares are $3.80 and provide a 90-minute transfer window across all CTrain and bus connections. Fares can be purchased as paper tickets at station vending machines or via the official My Fare mobile ticketing app. A unique feature of the Calgary CTrain is the Downtown Free Fare Zone along 7th Avenue between 3rd Street East and 11th Street West, where travel is completely free and requires no ticket or tap.'
  }),
  createRecord({
    id: 'ca-calgary-alberta-rta-tenancy-rtdrs',
    topic: 'housing',
    housingSubject: 'deposit',
    jurisdiction: 'Calgary',
    title: 'Alberta Residential Tenancies Act: Security Deposit Cap and Mandatory Inspection Reports',
    url: 'https://www.alberta.ca/security-deposits-and-changes',
    quote: 'The Residential Tenancies Act sets rules for security deposits and condition inspection reports in Alberta.',
    summary: 'Under the Alberta Residential Tenancies Act (RTA) s. 43, a landlord cannot demand a security deposit exceeding one month rent, and non-refundable fees (such as application or re-rental fees) are prohibited. Landlords must conduct mandatory move-in and move-out inspection reports within one week of the tenant taking and relinquishing possession. If the landlord fails to complete both inspection reports and deliver signed copies to the tenant, the landlord legally forfeits all statutory rights to deduct money from the security deposit for unit repairs or cleaning under RTA s. 19(4). Tenancy disputes are resolved through the Residential Tenancy Dispute Resolution Service (RTDRS).'
  }),

  // ── OTTAWA (CANADA - ONTARIO) ───────────────────────────────────────────────
  createRecord({
    id: 'ca-ottawa-oc-transpo-otrain-presto',
    topic: 'transit',
    jurisdiction: 'Ottawa',
    title: 'OC Transpo: Ottawa O-Train Confederation Line and Presto Contactless Fare Payment',
    url: 'https://www.octranspo.com/en/fares/',
    quote: 'OC Transpo is the public transit agency for Ottawa, operating the O-Train and bus system.',
    summary: 'OC Transpo operates the public transit network throughout the National Capital Region of Ottawa, including the light rail O-Train Line 1 (Confederation Line), Line 2 (Trillium Line), and citywide buses. Riders pay using an Ontario Presto card, contactless credit card, debit card, or mobile wallet (O-Payment) at fare gates and bus readers. Single adult fare is $3.85 and includes a 90-minute transfer window (105 minutes on weekends/evenings). Cross-boundary transfers between OC Transpo and Gatineau STO buses are recognized automatically.'
  }),
  createRecord({
    id: 'ca-ottawa-property-standards-heat-bylaw',
    topic: 'housing',
    housingSubject: 'repairs',
    jurisdiction: 'Ottawa',
    title: 'City of Ottawa Property Standards By-law 2013-416: Minimum Vital Services and Heating Standards',
    url: 'https://ottawa.ca/en/living-ottawa/laws-licences-and-permits/laws/laws-z/property-standards-law-no-2013-416',
    quote: 'Ottawa Property Standards By-law requires landlords to provide adequate heating to residential units.',
    summary: 'Under the City of Ottawa Property Standards By-law No. 2013-416 (Section 16), landlords and property managers of residential rental accommodation must ensure heating equipment is maintained in good working condition and capable of maintaining a minimum temperature of 20°C (68°F) in all habitable living rooms between September 1 and May 31. Landlords cannot shut off or interrupt vital services including heat, electricity, hot and cold water, or gas. Tenants experiencing heating failures can request municipal emergency inspection by calling 3-1-1 for Property Standards enforcement.'
  }),

  // ── MONTREAL (CANADA - QUEBEC) ──────────────────────────────────────────────
  createRecord({
    id: 'ca-montreal-stm-metro-opus-transit',
    topic: 'transit',
    jurisdiction: 'Montreal',
    title: 'Société de transport de Montréal (STM): Metro Network and OPUS Card Regional Transit',
    url: 'https://www.stm.info/en/info/fares',
    quote: 'The STM operates the subway and bus transit network across the Island of Montreal.',
    summary: 'The Société de transport de Montréal (STM) operates the four-line Metro subway network (Green, Orange, Yellow, Blue lines) and citywide bus system across the Island of Montreal (Zone A). Riders pay using an OPUS smart card, rechargeable non-refillable smart tickets, or contactless mobile payment. A single Zone A transit fare is $3.75, which includes unlimited transfers between Metro and buses within 120 minutes. All-day ($11), Unlimited Evening ($6), and Unlimited Weekend ($15.25) passes provide affordable transit across Greater Montreal.'
  }),
  createRecord({
    id: 'ca-montreal-tal-civil-code-tenant-protections',
    topic: 'housing',
    housingSubject: 'deposit',
    jurisdiction: 'Montreal',
    title: 'Tribunal administratif du logement (TAL): Civil Code of Quebec Ban on Security Deposits',
    url: 'https://www.tal.gouv.qc.ca/en/being-a-lessor/paying-the-rent',
    quote: 'In Quebec, landlords are strictly prohibited from demanding damage deposits or security deposits from tenants.',
    summary: 'Under Article 1904 of the Civil Code of Quebec and the Tribunal administratif du logement (TAL), landlords in Quebec are strictly forbidden from demanding any payment other than the first month rent before the lease begins. Landlords cannot require security deposits, damage deposits, key deposits, or post-dated cheques. Landlords must also complete Section G of the standard mandatory Quebec lease form disclosing the lowest rent paid for the dwelling in the past 12 months; if the rent was increased unlawfully without justification, the tenant can apply to the TAL within 10 days of signing (or two months if not disclosed) to set the rent.'
  })
];
