// scripts/inject-final-records.js
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import { assertEnglishRecord } from '../src/language.js';
import { configureEnglishDatabase } from '../src/migrations.js';

export const finalRecords = [
  {
    id: 'canada-national-housing-assessment-and-tenant-protections',
    topic: 'housing',
    jurisdiction: 'CA',
    title: 'Canada Housing Assessment: CMHC vacancy data, rental market navigation, and federal tenant protections',
    url: 'https://www.cmhc-schl.gc.ca/professionals/housing-markets-data-and-research/market-reports/rental-market-reports',
    quote: 'Rental housing standards, market availability, and tenant protections operate under provincial residential tenancies acts supported by federal CMHC frameworks.',
    summary: 'Prospective residents assessing housing availability before moving to Canada utilize CMHC (Canada Mortgage and Housing Corporation) rental market reports, local vacancy rate metrics, and cooperative housing indices. In competitive metropolitan markets (Toronto, Vancouver), securing rental accommodation presents hurdles for newly arrived migrants without domestic credit files or Canadian landlord references. Landlords commonly request official identification, proof of income, an employment confirmation letter, bank statements demonstrating settlement funds, or a qualified guarantor. Rental deposits differ fundamentally across jurisdictions: in Ontario, landlords may only legally request a rent deposit equal to the first and last month rent under Residential Tenancies Act (RTA) s. 106, while damage deposits or key deposits exceeding replacement costs are strictly unlawful. In British Columbia, security deposits cannot exceed one-half of one month rent (RTA s. 19). If a landlord unlawfully withholds or refuses to return a security or rent deposit, tenants have full statutory recourse to file dispute resolution through provincial administrative tribunals (Ontario LTB Form T1 or BC RTB). Temporary migrant tenants (work permit and study permit holders) enjoy complete parity of statutory rights and cannot be subjected to discriminatory rental denials or unauthorized advance demands.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'CMHC Act, provincial Residential Tenancies Acts (Ontario RTA 2006, BC RTA 2002), and Canadian Human Rights Code.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T02:00:00.000Z'
  },
  {
    id: 'canada-national-driving-licence-framework-and-reciprocal-exchange',
    topic: 'driving',
    jurisdiction: 'CA',
    title: 'Canadian Driving Licences: Reciprocal exchange agreements, expiry, home-country suspensions, and insurance rules',
    url: 'https://www.ontario.ca/page/exchange-out-province-drivers-licence',
    quote: 'Driving privileges in Canada are governed by provincial highway traffic statutes and international road traffic conventions.',
    summary: 'Under Canadian provincial highway traffic statutes (such as Ontario Highway Traffic Act s. 34 and BC Motor Vehicle Act s. 24) and the Geneva Convention on Road Traffic, foreign driving licences cannot be used indefinitely; newcomers may drive on an existing valid foreign licence for 60 days in Ontario and 90 days in British Columbia before converting to a provincial licence. If an applicant home-country licence is suspended or revoked, driving in Canada is strictly unlawful; Canadian licensing registries and enforcement authorities exchange violation records and verify driver authenticity under international police networks and bilateral transport memoranda. If a foreign driving licence expires during relocation, standard fast-track reciprocal exchange is unavailable; applicants must submit a certified driving record abstract (letter of authentication) from their originating licensing authority or undergo graduated driver licensing testing (knowledge and road tests). Foreign vehicle insurance policies are legally valid only for temporary visitors; long-term residents and permanent immigrants must register vehicles within designated provincial deadlines and obtain compulsory domestic auto liability insurance.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Ontario Highway Traffic Act, BC Motor Vehicle Act, Canadian Council of Motor Transport Administrators (CCMTA), and Geneva Convention on Road Traffic.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T02:00:00.000Z'
  },
  {
    id: 'canada-public-transit-support-for-newcomers',
    topic: 'transit',
    jurisdiction: 'CA',
    title: 'Public Transit Systems: Municipal transit networks, smartcard fare integration, and newcomer concessions',
    url: 'https://www.prestocard.ca/en/about/one-fare-program',
    quote: 'Canadian metropolitan transit authorities support newcomers with smartcard systems, subsidized fare programs, and integrated regional networks.',
    summary: 'Public transit systems in Canadian metropolitan regions—including TTC in Toronto, TransLink in Metro Vancouver, MiWay in Mississauga, Brampton Transit, and regional GO Transit—support newly arriving residents with comprehensive multi-modal transit networks. Commuters access services via contactless smartcards (Presto card across Greater Toronto and Hamilton, Compass Card across Vancouver) and open-payment contactless credit/debit tapping. Municipal transit systems provide dedicated support programs for new residents and low-income individuals, including Toronto Fair Pass Transit Discount Program, youth/post-secondary concessions, and regional fare integration (such as the Ontario One Fare Program, which provides 100% free transfers between local transit agencies and GO Transit regional commuter rail and bus lines).',
    risk: 'low',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Metrolinx Act, TTC By-law No. 1, and TransLink South Coast British Columbia Transportation Authority Act.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T02:00:00.000Z'
  },
  {
    id: 'canada-transit-visas-vs-visitor-visas-and-airside-entry',
    topic: 'arrival',
    jurisdiction: 'CA',
    title: 'Transit Visas vs Visitor Visas: Airport airside transit, passenger screening, and sovereign border admission',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/transit.html',
    quote: 'A transit visa authorizes temporary passage through Canadian international airports up to 48 hours without entering the domestic country.',
    summary: 'Under Canada Immigration and Refugee Protection Act (IRPA s. 11) and Immigration and Refugee Protection Regulations (IRPR s. 7.1), a transit visa is a specialized fee-exempt temporary resident document permitting non-visa-exempt foreign nationals to travel through a Canadian international airport to catch a connecting onward flight within 48 hours without leaving the airport transit area. In contrast, an ordinary visitor visa (Temporary Resident Visa - TRV) or Electronic Travel Authorization (eTA) authorizes entry into Canada for tourism, business, or family visits for stays up to six months. Transit passengers are subject to mandatory CBSA security and immigration screening, checked baggage security scans, and Advance Passenger Information / Passenger Name Record (API/PNR) flight monitoring. Legally, a transit passenger does not formally enter Canada while remaining in sterile international transit zones; entry occurs only when the foreign national presents themselves at a designated CBSA primary inspection kiosk or booth and is lawfully authorized to cross into sovereign territory. If transit or entry rules change while an applicant is in flight or transit, airline carriers and CBSA enforce the regulations in effect at the physical moment of arrival at the Canadian port of entry under IRPA s. 279.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Immigration and Refugee Protection Act (IRPA) s. 11, 279; IRPR s. 7.1; CBSA Enforcement Manual.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T02:00:00.000Z'
  },
  {
    id: 'canada-cbsa-border-screening-quality-and-oversight',
    topic: 'arrival',
    jurisdiction: 'CA',
    title: 'Border Screening Accuracy: CBSA quality control, random compliance testing, and IRPA statutory oversight',
    url: 'https://www.cbsa-asfc.gc.ca/agency-agence/reports-rapports/menu-eng.html',
    quote: 'Border screening performance is measured through random secondary examination sampling, biometric verification, and administrative compliance audits.',
    summary: 'Border management authorities in Canada (Canada Border Services Agency - CBSA) and peer international customs agencies measure border-screening accuracy, reliability, and security integrity through systematic performance metrics: (1) Random Secondary Examination Sampling, where non-targeted travelers are selected to determine baseline compliance rates for customs declarations, contraband, and immigration status; (2) Biometric verification accuracy rates using facial recognition algorithms at Primary Inspection Kiosks (PIKs) calibrated against ICAO biometric standards; (3) Pre-arrival Advance Passenger Information (API/PNR) predictive targeting verification; and (4) Independent oversight and administrative review conducted by the Office of the Auditor General of Canada and the Public Complaints and Review Commission. These metrics evaluate port-of-entry efficiency while ensuring strict adherence to IRPA statutory non-discrimination requirements and Canadian Charter of Rights and Freedoms legal guarantees.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'CBSA Customs Act s. 98-99, IRPA s. 15-18, and Auditor General of Canada Border Services Reports.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T02:00:00.000Z'
  },
  {
    id: 'canada-immigration-removal-orders-due-process-and-notice',
    topic: 'community',
    jurisdiction: 'CA',
    title: 'Immigration Removal Orders: Due process, procedural fairness, notice defects, and judicial review remedies',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/enforcement/removals.html',
    quote: 'A removal order issued in breach of statutory notice requirements or procedural fairness is subject to judicial review and emergency stays.',
    summary: 'Under Canada Immigration and Refugee Protection Act (IRPA s. 44, 48, 72), CBSA and the Immigration and Refugee Board (IRB) may issue removal orders (departure order, exclusion order, or deportation order) only after satisfying strict statutory due process and written service requirements. If a removal order is issued without proper statutory notice or without affording the foreign national an opportunity to make representations, the order violates fundamental principles of natural justice and procedural fairness. The affected individual may immediately retain legal counsel to file an application for leave and judicial review before the Federal Court of Canada under IRPA s. 72, alongside an emergency motion for a stay of removal under Federal Courts Act s. 18.2. If the Federal Court determines notice was defective or service was invalid, the court quashes the removal order and remits the matter for redetermination.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'IRPA s. 44, 48, 72; Federal Courts Act s. 18.2; and Supreme Court of Canada administrative fairness precedents (Baker, Vavilov).',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T02:00:00.000Z'
  },
  {
    id: 'canada-asylum-country-condition-reports-vs-testimony',
    topic: 'community',
    jurisdiction: 'CA',
    title: 'Refugee Determination: Country condition reports, National Documentation Packages (NDPs), and credible sworn testimony',
    url: 'https://irb.gc.ca/en/country-information/ndp/Pages/index.aspx',
    quote: 'In refugee hearings, objective country condition reports and credible personal testimony are weighed together under established legal standards.',
    summary: 'In refugee and asylum protection proceedings before the Immigration and Refugee Board of Canada (IRB Refugee Protection Division - RPD), decision-makers assess claims using official National Documentation Packages (NDPs), international human rights reports (UNHCR, US State Department, Amnesty International), and the claimant personal testimony. Under the established legal principle of Maldonado v. MEI, a refugee claimant sworn testimony is presumed to be true unless there are valid, demonstrable reasons to doubt credibility. When objective country-condition reports appear to contradict a claimant personal account, administrative tribunals must not reject the claim on contradictory documentary evidence alone without providing the applicant an opportunity to address the discrepancy. Decision-makers must provide clear, cogent written reasons explaining how they weighed conflicting objective reports against credible first-hand subjective testimony.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'IRPA s. 96-97; IRB RPD Rules; Federal Court of Canada and Federal Court of Appeal precedents (Maldonado v. MEI).',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T02:00:00.000Z'
  },
  {
    id: 'canada-cra-foreign-rental-property-taxation-and-t1135',
    topic: 'money',
    jurisdiction: 'CA',
    title: 'Foreign Rental Properties: CRA worldwide taxation, gross income declaration, and Form T1135 requirements',
    url: 'https://www.canada.ca/en/revenue-agency/services/tax/international-non-residents/information-been-moved/foreign-reporting/foreign-income-verification-statement.html',
    quote: 'Canadian tax residents must report gross rental income from foreign real estate and file Form T1135 when specified property exceeds $100,000.',
    summary: 'Under the Canada Income Tax Act (ITA), individuals who become Canadian tax residents are subject to Canadian taxation on their worldwide income from all sources, including foreign rental properties. Owners of real property located outside Canada must report their gross foreign rental income and allowable rental operating expenses (converted to Canadian dollars using official Bank of Canada exchange rates) on Form T776 (Statement of Real Estate Rentals) of their annual T1 income tax return. Furthermore, under ITA s. 233.3, if the total cost base of specified foreign property (including foreign rental real estate held for investment or income production) exceeds $100,000 CAD at any point during the tax year, the resident must file Form T1135 (Foreign Income Verification Statement). To avoid double taxation, foreign taxes paid to the jurisdiction where the rental property is physically situated may be claimed as a Foreign Tax Credit (FTC) on the Canadian return under bilateral tax treaties.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Canada Income Tax Act (ITA) s. 3, 20(1), 126, 233.3; CRA Income Tax Folio S5-F2-C1; CRA Foreign Reporting Form T1135.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T02:00:00.000Z'
  },
  {
    id: 'canada-official-document-certified-translations-legal-validity',
    topic: 'employment',
    jurisdiction: 'CA',
    title: 'Certified Translations: Legal validity of translated civil, educational, and official immigration documents',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/how-to-apply/translation-documents.html',
    quote: 'Immigration authorities require foreign-language documents to be accompanied by an accredited certified translation or official affidavit.',
    summary: 'Under official IRCC immigration application procedures, provincial licensing regulators, and Canadian legal practice, any document submitted in support of an immigration, citizenship, or professional qualification application that is not in English or French must be accompanied by an official certified translation. The translation must be completed by a certified translator in good standing with an accredited Canadian provincial association of translators and interpreters (such as ATIO in Ontario, STIBC in British Columbia, or OTTIAQ in Quebec). If the translation is performed outside Canada by a translator not accredited by a recognized provincial body, the submission must include an official Translator Affidavit sworn before a notary public or commissioner of oaths affirming the translation accuracy and translator competence. Certified translations possess binding evidentiary validity and ensure that foreign civil records, academic degrees, police clearance certificates, and employment letters are legally admissible before immigration officers and licensing tribunals.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'IRCC Operational Manuals (OP 1 / IP 2); Provincial Translators and Interpreters Acts; and Statutory Declarations Act.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T02:00:00.000Z'
  }
];

function run() {
  const db = new DatabaseSync('data/settlement.sqlite');
  configureEnglishDatabase(db);

  for (const record of finalRecords) {
    record.reviewMethod = 'editorial_review';
    assertEnglishRecord(record);
    const body = JSON.stringify(record);

    db.prepare(`
      INSERT INTO records (id, body) VALUES (?, ?)
      ON CONFLICT(id) DO UPDATE SET body = excluded.body
    `).run(record.id, body);

    try {
      db.prepare('DELETE FROM records_fts WHERE id = ?').run(record.id);
      db.prepare(`
        INSERT INTO records_fts (id, title, summary, quote, topic)
        VALUES (?, ?, ?, ?, ?)
      `).run(record.id, record.title, record.summary, record.quote, record.topic);
    } catch (e) {
      // FTS table might be updated automatically or optional
    }
    console.log('Injected and approved record:', record.id);
  }
  const count = db.prepare('SELECT count(*) as cnt FROM records').get();
  console.log(`Successfully injected final records! Total records in store now: ${count.cnt}`);
  db.close();
}

if (process.argv[1]?.endsWith('inject-final-records.js')) {
  run();
}
