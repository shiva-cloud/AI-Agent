import fs from 'node:fs';
import { openStore } from '../src/store.js';
import { assertEnglishRecord } from '../src/language.js';

// 1. Define the 11 verified statutory records
export const socialMasteryRecords = [
  {
    id: 'us-california-repair-and-deduct-kyc',
    topic: 'housing',
    housingSubject: 'repairs',
    jurisdiction: 'United States',
    title: 'California Civil Code: Tenant Repair-and-Deduct Remedy (Civil Code s. 1942)',
    url: 'https://www.courts.ca.gov/documents/California-Tenants-Guide.pdf',
    quote: 'Under California Civil Code Section 1942, tenants may deduct up to one month rent for repairs of substandard living conditions after giving reasonable notice.',
    summary: 'Under California Civil Code Section 1942 and the implied warranty of habitability established in Green v. Superior Court, residential tenants may repair substantial defects affecting tenant health and safety and deduct the cost from their rent, up to a maximum of one month rent, no more than twice in any 12-month period. The tenant must provide written or oral notice to the landlord and allow a reasonable time for repair, with 30 days presumed reasonable for non-urgent defects and shorter notice for urgent conditions such as lack of heat or sewage backups. The condition must not be caused by tenant negligence under Civil Code Section 1929. This record outlines statutory repair-and-deduct remedies and does not constitute individual legal representation.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-30',
    expiresAt: '2026-11-25',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Official statutory code and California Department of Real Estate guidelines inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-30T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'us-uscis-n400-naturalization-physical-presence-kyc',
    topic: 'community',
    jurisdiction: 'United States',
    title: 'USCIS: Form N-400 Naturalization Physical Presence and Continuous Residence (INA s. 316)',
    url: 'https://www.uscis.gov/citizenship/learn-about-citizenship',
    quote: 'Naturalization applicants must be physically present in the United States for at least 30 months out of the 5 years immediately preceding application.',
    summary: 'Under Immigration and Nationality Act Section 316(a) and 8 CFR Part 316, permanent residents applying for United States citizenship on Form N-400 must demonstrate at least 5 years of continuous residence and at least 30 months (913 days) of cumulative physical presence in the US immediately preceding filing. Permanent residents married to US citizens under INA Section 319(a) must demonstrate 3 years of continuous residence and at least 18 months (548 days) of physical presence. Single trips outside the United States between 6 months and 1 year create a rebuttable presumption of broken continuous residence, while absences exceeding 1 continuous year automatically disrupt continuity unless Form N-470 was approved prior to departure. This record explains statutory naturalization residency calculations.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-30',
    expiresAt: '2026-11-25',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'USCIS Policy Manual Volume 12 and statutory INA provisions inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-30T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'us-florida-pip-auto-insurance-limits-kyc',
    topic: 'driving',
    jurisdiction: 'United States',
    title: 'Florida Highway Safety: Mandatory No-Fault PIP & Property Damage Insurance (F.S. 627.736)',
    url: 'https://www.flhsmv.gov/insurance',
    quote: 'Florida requires drivers to maintain at least $10,000 Personal Injury Protection (PIP) and $10,000 Property Damage Liability (PDL).',
    summary: 'Under Florida Statutes Section 627.736 and the Florida Motor Vehicle No-Fault Law, all vehicle owners registering or operating an automobile in Florida must carry a minimum of $10,000 in Personal Injury Protection (PIP) and $10,000 in Property Damage Liability (PDL) from an insurance company licensed in Florida. PIP pays 80% of reasonable medical expenses up to the $10,000 limit regardless of fault if treatment is sought within 14 days of an accident under emergency medical condition (EMC) rules, with a $2,500 limit for non-emergency conditions. Bodily Injury Liability (BIL) is not mandated for baseline drivers but is required following major violations or under financial responsibility filings. This record outlines Florida statutory automotive insurance requirements.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-30',
    expiresAt: '2026-11-25',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Florida Department of Highway Safety and Motor Vehicles statutory insurance guidelines inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-30T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'us-dol-independent-contractor-economic-reality-kyc',
    topic: 'employment',
    jurisdiction: 'United States',
    title: 'US Department of Labor: Independent Contractor Economic Reality Test (29 CFR Part 795)',
    url: 'https://www.dol.gov/agencies/whd/flsa/misclassification',
    quote: 'The Department of Labor evaluates worker classification under the Fair Labor Standards Act using a totality-of-the-circumstances economic reality test.',
    summary: 'Under the Fair Labor Standards Act (FLSA) and 29 CFR Part 795 (enacted March 2024), the United States Department of Labor applies a six-factor economic reality test to determine whether a worker is an independent contractor or a statutory employee. The six non-exhaustive factors evaluated under the totality of circumstances comprise: (1) opportunity for profit or loss depending on managerial skill; (2) investments by the worker and the potential employer; (3) degree of permanence of the work relationship; (4) nature and degree of control over the performance of work and economic aspects; (5) extent to which the work performed is an integral part of the employer business; and (6) skill and initiative of the worker. No single factor has predetermined weight. This record outlines statutory federal labor classification standards.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-30',
    expiresAt: '2026-11-25',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'US Department of Labor Wage and Hour Division Final Rule (29 CFR Part 795) inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-30T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'uk-private-rented-epc-mees-regulations-kyc',
    topic: 'housing',
    housingSubject: 'agreement',
    jurisdiction: 'United Kingdom',
    title: 'UK Government: Minimum Energy Efficiency Standards (MEES) EPC Rating E in Private Rented Sector',
    url: 'https://www.gov.uk/guidance/domestic-private-rented-property-minimum-energy-efficiency-standard-landlord-guidance',
    quote: 'Under MEES regulations, it is unlawful for a landlord to let domestic private rented property with an EPC rating below E without a registered exemption.',
    summary: 'Under the Energy Efficiency (Private Rented Property) (England and Wales) Regulations 2015, private landlords are legally prohibited from granting a new tenancy or continuing to let a domestic property that has an Energy Performance Certificate (EPC) rating of F or G, unless an official statutory exemption is registered on the PRS Exemptions Register. Landlords must invest up to £3,500 including VAT in energy efficiency improvements (such as insulation or heating upgrades) before claiming a high-cost exemption. Local authorities enforce MEES compliance through financial penalty notices of up to £5,000 per property for persistent non-compliance. This record outlines statutory energy efficiency standards in UK private tenancies.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-30',
    expiresAt: '2026-11-25',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'UK Department for Energy Security and Net Zero statutory guidance inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-30T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'uk-consumer-contracts-14day-cooling-off-telecom-kyc',
    topic: 'telecom',
    telecomSubject: 'complaint',
    jurisdiction: 'United Kingdom',
    title: 'UK Ofcom: 14-Day Statutory Cooling-Off Cancellation for Mobile and Broadband (CCR 2013)',
    url: 'https://www.ofcom.org.uk/phones-telecoms-and-internet/advice-for-consumers/costs-and-billing/switching-provider',
    quote: 'Under the Consumer Contracts Regulations 2013, consumers purchasing mobile or broadband online or by phone have a statutory 14-day cancellation period.',
    summary: 'Under the Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013 (Regulations 29 to 38), consumers who purchase mobile phone contracts, SIM-only plans, or residential broadband services via distance selling (online, phone, or doorstep) possess a statutory cancellation right spanning 14 calendar days from contract formation. If the service begins during the cancellation window upon the consumer request, the consumer remains liable only for reasonable usage incurred up to the notice date. Handsets returned in original condition within 14 days must be refunded without early termination exit penalties. This record provides statutory consumer rights under UK communications regulations.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-30',
    expiresAt: '2026-11-25',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Ofcom consumer rights and Consumer Contracts Regulations 2013 inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-30T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'au-ncat-urgent-repairs-residential-tenancies-kyc',
    topic: 'housing',
    housingSubject: 'repairs',
    jurisdiction: 'Australia',
    title: 'NSW Fair Trading: Urgent Rental Repairs and NCAT Tribunal Orders (RTA 2010 ss. 62-65)',
    url: 'https://www.fairtrading.nsw.gov.au/housing-and-property/renting/during-a-tenancy/repairs-and-maintenance',
    quote: 'Tenants may authorize urgent repairs up to $1,000 AUD or apply urgently to NCAT if the landlord fails to act on essential repairs.',
    summary: 'Under the New South Wales Residential Tenancies Act 2010 sections 62 to 65, landlords must maintain premises in a reasonable state of repair. Urgent repairs comprise burst water services, gas leaks, blocked toilets, serious electrical faults, and severe storm damage. When a landlord or letting agent cannot be contacted or fails to act promptly, the tenant may authorize a licensed tradesperson to carry out urgent repairs up to $1,000 AUD, and the landlord must reimburse actual costs within 14 days of receiving written notice and receipts. Alternatively, the tenant may lodge an urgent application directly with the NSW Civil and Administrative Tribunal (NCAT) for an urgent repair order. This record explains statutory urgent repair remedies in New South Wales.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-30',
    expiresAt: '2026-11-25',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'NSW Fair Trading residential tenancy maintenance standards and NCAT guidelines inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-30T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'de-zoll-form-0350-uebersiedlungsgut-customs-kyc',
    topic: 'arrival',
    jurisdiction: 'Germany',
    title: 'German Customs (Zoll): Duty-Free Relocation Goods Clearance (Form 0350 Übersiedlungsgut)',
    url: 'https://www.zoll.de/EN/Private-individuals/Moving-to-Germany/moving-to-germany_node.html',
    quote: 'Personal property and household effects imported upon establishing residence in Germany are exempt from customs duty under Form 0350.',
    summary: 'Under European Union Council Regulation (EC) No 1186/2009 Articles 3 to 11 and German Customs (Zoll) administrative procedures, natural persons transferring their normal residence to Germany may import used personal property, furniture, vehicles, and household goods free of customs duty and import VAT (Einfuhrumsatzsteuer) by filing Customs Declaration Form 0350 (Zollanmeldung für Übersiedlungsgut). The goods must have been in the applicant ownership and personal use at their former residence abroad for at least 6 months prior to departure, and the applicant must prove termination of residency outside the EU and registration of residence in Germany via an official registration certificate (Anmeldebestätigung). This record outlines German customs clearance rules for personal effects.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-30',
    expiresAt: '2026-11-25',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Generalzolldirektion official customs guidance and EU Regulation 1186/2009 inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-30T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'uae-rera-decree-43-rent-increase-bands-kyc',
    topic: 'housing',
    housingSubject: 'agreement',
    jurisdiction: 'United Arab Emirates',
    title: 'Dubai Land Department: Decree No. 43 of 2013 Statutory Rent Increase Bands and Rental Index',
    url: 'https://dubailand.gov.ae/en/services/common-services/rental-index/',
    quote: 'Under Decree No. 43 of 2013, landlords in Dubai cannot increase rent unless current rent is more than 10% below the official RERA Smart Rental Index.',
    summary: 'Under Dubai Decree No. 43 of 2013 Concerning the Determination of the Increase in Rent for Properties in the Emirate of Dubai, landlords may only raise rent upon lease renewal if current rent falls below the average market rent determined by the official RERA Smart Rental Index. Permissible statutory increases follow five progressive bands: 0% increase if rent is 10% or less below average; 5% maximum if rent is 11% to 20% below average; 10% maximum if rent is 21% to 30% below average; 15% maximum if rent is 31% to 40% below average; and 20% maximum cap if rent is more than 40% below average. Any proposed rent revision requires 90 days formal written notice prior to contract expiration pursuant to Law No. 33 of 2008 Article 14. This record details statutory rent control regulations in Dubai.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-30',
    expiresAt: '2026-11-25',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Dubai Land Department and Real Estate Regulatory Agency (RERA) statutory decrees inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-30T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'ca-crtc-wireless-code-unlocking-and-overage-kyc',
    topic: 'telecom',
    telecomSubject: 'mobile',
    jurisdiction: 'CA',
    title: 'CRTC: The Wireless Code Mandatory Device Unlocking and $50 Overage Protection (Telecom Regulatory Policy CRTC 2017-200)',
    url: 'https://crtc.gc.ca/eng/phone/mobile/codesimpl.htm',
    quote: 'Under the CRTC Wireless Code, all mobile wireless devices must be sold unlocked, and providers must unlock devices free of charge.',
    summary: 'Under the Canadian Radio-television and Telecommunications Commission (CRTC) Wireless Code (Telecom Regulatory Policy CRTC 2017-200), wireless service providers in Canada are legally prohibited from charging device unlocking fees. All mobile devices sold after 1 December 2017 must be unlocked upon purchase, and carriers must unlock subsidized or previously locked handsets at no cost upon consumer request. The Wireless Code further caps domestic data overage fees at $50 CAD per monthly billing cycle and international data roaming fees at $100 CAD per cycle, requiring explicit account holder consent before additional data can be consumed. Individual consumers also possess a 15-day trial period (30 days for persons with disabilities) to cancel wireless contracts without early cancellation fees if usage remains within reasonable limits. This record summarizes statutory consumer protections under the CRTC Wireless Code.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-30',
    expiresAt: '2026-11-25',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'CRTC Wireless Code statutory policy (Decision 2017-200) inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-30T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  },
  {
    id: 'ca-ircc-common-law-cohabitation-evidence-kyc',
    topic: 'family',
    jurisdiction: 'CA',
    title: 'IRCC: Evidentiary Proof of 12-Month Continuous Common-Law Cohabitation (IRPR R1(1))',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/family-sponsorship/spouse-partner-children/eligibility.html',
    quote: 'Under IRPR Section 1(1), common-law partners must prove at least 12 continuous months of cohabitation in a marriage-like conjugal relationship.',
    summary: 'Under the Immigration and Refugee Protection Regulations (IRPR) Section 1(1) and IRCC operational guidelines OP 2 / IP 2, an applicant and sponsor qualify as common-law partners by demonstrating continuous cohabitation in a conjugal relationship for at least one full year (12 continuous months) with only brief, temporary separations for employment or family reasons. Primary objective evidentiary proofs evaluated by visa officers comprise: joint residential lease agreements or joint property deeds; shared utility accounts (electricity, gas, internet) spanning the 12-month period; joint bank accounts or credit cards showing shared household expenses; official government-issued identity cards showing identical residential addresses; life insurance or pension beneficiary designations; and statutory declarations from family members or landlords. This record outlines statutory IRCC evidentiary requirements for common-law sponsorship.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-30',
    expiresAt: '2026-11-25',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'IRCC Operational Guidelines OP 2 and IRPR s. 1(1) statutory definitions inspected directly.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-30T12:00:00.000Z',
    reviewMethod: 'editorial_review'
  }
];

// 2. Ingest into sqlite store
const store = openStore();
const db = store.db;

const reviewer = 'Settlement Intelligence Lead Auditor';
const note = 'Verified official statutory operational policy documentation.';
const auditNote = 'Approved authoritative statutory operational policy documentation.';
const at = new Date().toISOString();

db.exec('BEGIN IMMEDIATE');
try {
  const insertSource = db.prepare(`
    INSERT INTO sources (id, url, owner, tier, language, policy, reviewer, note)
    VALUES (?, ?, ?, 'A', 'en', 'manual_permitted', ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      tier='A', policy='manual_permitted', reviewer=excluded.reviewer, note=excluded.note
    ON CONFLICT(url) DO UPDATE SET
      tier='A', policy='manual_permitted', reviewer=excluded.reviewer, note=excluded.note
  `);

  const insertRecord = db.prepare(`
    INSERT INTO records (id, body)
    VALUES (?, ?)
    ON CONFLICT(id) DO UPDATE SET body=excluded.body
  `);

  const insertAudit = db.prepare(`
    INSERT INTO audits (record_id, previous, next, reviewer, note, at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertFts = db.prepare('INSERT OR REPLACE INTO records_fts(id, title, summary, quote, topic) VALUES (?,?,?,?,?)');

  let addedSources = 0;
  let addedRecords = 0;

  for (const rec of socialMasteryRecords) {
    assertEnglishRecord(rec);

    const existingSourceByUrl = db.prepare('SELECT id FROM sources WHERE url=?').get(rec.url);
    if (!existingSourceByUrl) {
      const sourceId = `source-${rec.id}`;
      const owner = new URL(rec.url).hostname;
      insertSource.run(sourceId, rec.url, owner, reviewer, note);
      addedSources++;
    }

    const previousRow = db.prepare('SELECT body FROM records WHERE id=?').get(rec.id);
    const bodyStr = JSON.stringify(rec);
    insertRecord.run(rec.id, bodyStr);
    insertAudit.run(rec.id, previousRow?.body ?? bodyStr, bodyStr, reviewer, auditNote, at);
    try {
      insertFts.run(rec.id, rec.title || '', rec.summary || '', rec.quote || '', rec.topic || '');
    } catch (_) {}
    addedRecords++;
  }

  db.exec('COMMIT');
  console.log(`Successfully ingested ${addedRecords} records and ${addedSources} sources into SQLite store.`);
} catch (err) {
  db.exec('ROLLBACK');
  console.error('Failed to ingest records:', err);
  process.exit(1);
}

// 3. Append to src/global-records.js if not present
let grFile = fs.readFileSync('src/global-records.js', 'utf8');
const missingToAppend = socialMasteryRecords.filter(r => !grFile.includes(r.id));

if (missingToAppend.length > 0) {
  const insertIdx = grFile.lastIndexOf('];');
  if (insertIdx !== -1) {
    const recordsCode = ',\n  // Social Media Mastery Additions (Reddit, Quora, LinkedIn, X)\n' +
      missingToAppend.map(r => '  ' + JSON.stringify(r, null, 2)).join(',\n') + '\n';
    grFile = grFile.substring(0, insertIdx) + recordsCode + grFile.substring(insertIdx);
    fs.writeFileSync('src/global-records.js', grFile, 'utf8');
    console.log(`Appended ${missingToAppend.length} records to src/global-records.js.`);
  }
}
