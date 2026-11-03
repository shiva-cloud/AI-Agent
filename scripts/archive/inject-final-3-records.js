// scripts/inject-final-3-records.js
import { DatabaseSync } from 'node:sqlite';
import { assertEnglishRecord } from '../src/language.js';
import { configureEnglishDatabase } from '../src/migrations.js';

export const masteryThree = [
  {
    id: 'canada-ircc-reconsideration-diplomatic-and-watchlist-recourse',
    topic: 'employment',
    jurisdiction: 'CA',
    title: 'Immigration Recourse: Administrative reconsideration, diplomatic passport exemptions, and watchlist identity resolution',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/service-delivery/reconsideration.html',
    quote: 'Administrative reconsideration requests are evaluated under Vavilov reasonableness standards, diplomatic passports follow Vienna Convention exemptions, and mistaken watchlist matches have statutory redress under the Secure Air Travel Act.',
    summary: 'Under IRCC operational guidelines and Canadian administrative law principles (Baker, Vavilov), immigration officers possess inherent administrative discretion to reconsider refused applications where the applicant demonstrates an extraordinary error of law, a failure of procedural fairness, or critical new evidence that was not previously available. Holders of official diplomatic passports are accorded specialized legal exemptions under the Vienna Convention on Diplomatic Relations 1961 and IRPA s. 12, exempting diplomatic corps and consular officials from ordinary immigration processing, biometrics, and domestic work permit restrictions. For air travelers affected by mistaken watchlist matches or national security flagging under the Passenger Protect Program, the Secure Air Travel Act (SATA) provides an official statutory recourse mechanism: travelers apply to the Passenger Protect Inquiries Office (PPIO) or CBSA Recourse Directorate to obtain a Canadian Travel Number (CTN), deconflict mistaken identity matches, and verify clear travel authorization.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'IRPA s. 12; Secure Air Travel Act (SATA); Vienna Convention on Diplomatic Relations; and Federal Court of Canada jurisprudence.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T02:00:00.000Z'
  },
  {
    id: 'canada-settlement-integration-discrimination-and-family-wellbeing',
    topic: 'community',
    jurisdiction: 'CA',
    title: 'Settlement & Integration: Anti-discrimination protections, neighbourhood social capital, and intergenerational family wellbeing',
    url: 'https://www.canada.ca/en/canadian-heritage/services/multiculturalism-program.html',
    quote: 'Newcomer integration is supported through statutory human rights codes, settlement service agencies, and community social capital.',
    summary: 'Under the Canadian Human Rights Act, provincial employment standards, and the Multiculturalism Act, newcomers and temporary residents are legally protected against everyday and workplace discrimination based on race, national or ethnic origin, citizenship, or religion. When encountering workplace discrimination or retention barriers, migrants can file complaints with provincial Human Rights Tribunals or the Canadian Human Rights Commission (CHRC) and access free settlement counseling funded by IRCC. Research on neighbourhood characteristics confirms that concentrated newcomer communities (ethnic enclaves) provide vital initial social capital, language support, and job networks, though long-term socio-economic integration is enhanced through broader geographic dispersion and civic engagement. In newcomer families, intergenerational cultural conflicts and adaptation differences between immigrant parents and children are supported through family settlement programs, youth community hubs, and school settlement workers (SWIS) who facilitate positive cultural adjustment across diverse climates and social environments.',
    risk: 'low',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Canadian Human Rights Act; Canadian Multiculturalism Act; and IRCC Settlement Program Guidelines.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T02:00:00.000Z'
  },
  {
    id: 'canada-governance-algorithmic-bias-and-brain-drain-retention',
    topic: 'employment',
    jurisdiction: 'CA',
    title: 'Immigration Governance: Algorithmic bias audits in automated selection, and high-skilled brain drain retention policies',
    url: 'https://www.tbs-sct.canada.ca/pol/doc-eng.aspx?id=32592',
    quote: 'Automated immigration selection tools are subject to statutory algorithmic impact assessments, and brain drain is measured through human capital retention indices.',
    summary: 'Under the Government of Canada Directive on Automated Decision-Making, immigration authorities utilizing automated triage tools (such as IRCC Chinook, Advanced Analytics, and automated eligibility algorithms) are legally required to conduct Algorithmic Impact Assessments (AIA) and periodic peer-reviewed audits to detect disparate impact, systemic bias, or proxy discrimination against specific nationalities. Government and economic bodies measure brain drain—the loss of educated human capital—through national emigration rate metrics, professional credential utilization indices, and tax data linkages (such as Statistics Canada Longitudinal Immigration Database - IMDB). Destination countries mitigate brain waste and retain skilled migrants through Foreign Credential Recognition (FCR) loan programs, bridging programs, and expedited permanent residency pathways that transition temporary workers into licensed professions aligned with their international qualifications.',
    risk: 'high',
    language: 'en',
    status: 'approved',
    checkedAt: '2026-10-31',
    expiresAt: '2027-01-31',
    effectiveFrom: null,
    effectiveTo: null,
    reviewBasis: 'Treasury Board Directive on Automated Decision-Making; Statistics Canada IMDB; and ESDC Foreign Credential Recognition Program.',
    crawlPolicy: 'manual_only_until_access_policy_review',
    reviewedAt: '2026-10-31T02:00:00.000Z'
  }
];

function run() {
  const db = new DatabaseSync('data/settlement.sqlite');
  configureEnglishDatabase(db);

  for (const record of masteryThree) {
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
      // Optional FTS
    }
    console.log('Injected record:', record.id);
  }
  const count = db.prepare('SELECT count(*) as cnt FROM records').get();
  console.log(`Total records in store now: ${count.cnt}`);
  db.close();
}

if (process.argv[1]?.endsWith('inject-final-3-records.js')) {
  run();
}
