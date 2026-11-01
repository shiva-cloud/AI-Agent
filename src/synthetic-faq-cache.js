// Pre-Computed Synthetic Question Cache (Rec 115)
// Static, zero-latency cache of verified statutory answers for top newcomer queries.

export const PRECOMPUTED_FAQ_CACHE = new Map([
  [
    'how to apply for sin in toronto',
    {
      topic: 'sin',
      jurisdiction: 'Toronto',
      headline: 'Apply for a Social Insurance Number (SIN) with Service Canada',
      summary: 'You can apply for a Social Insurance Number (SIN) in person at any Service Canada Centre or online via the Service Canada portal. There is no fee for an initial SIN. Bring your primary identity document (COPR or valid work/study permit).',
      citations: [
        { title: 'Service Canada — Social Insurance Number Application', url: 'https://www.canada.ca/en/employment-social-development/services/sin/apply.html' }
      ],
      cachedAt: '2026-01-01',
      latencyMs: 0
    }
  ],
  [
    'can landlord ask for 6 months deposit in ontario',
    {
      topic: 'housing',
      jurisdiction: 'Toronto',
      headline: 'Ontario Rent Deposit Limits under RTA s. 106',
      summary: 'Under Section 106 of Ontario’s Residential Tenancies Act (RTA), a landlord cannot legally require or demand more than the last month’s rent as a rent deposit. Demanding multiple months of rent upfront is unlawful.',
      citations: [
        { title: 'Residential Tenancies Act, 2006 (SO 2006, c. 17) s. 106', url: 'https://www.ontario.ca/laws/statute/06r17#BK168' }
      ],
      cachedAt: '2026-01-01',
      latencyMs: 0
    }
  ],
  [
    'is there a 3 month waiting period for ohip',
    {
      topic: 'health',
      jurisdiction: 'Toronto',
      headline: 'Permanent Repeal of the OHIP 3-Month Waiting Period',
      summary: 'Ontario permanently repealed the historical 3-month waiting period for OHIP under Regulation 552. Immediate coverage begins from the date of approval if you meet statutory residency and immigration requirements.',
      citations: [
        { title: 'Health Insurance Act, RRO 1990, Reg. 552', url: 'https://www.ontario.ca/laws/regulation/900552' }
      ],
      cachedAt: '2026-01-01',
      latencyMs: 0
    }
  ],
  [
    'how much cash can i bring to canada without declaring',
    {
      topic: 'money',
      jurisdiction: 'CA',
      headline: 'CBSA Currency and Monetary Instruments Reporting (Form E677)',
      summary: 'There is no limit on how much money you can bring into Canada. However, currency or monetary instruments totaling CAD $10,000 or more must be declared on arrival to CBSA on Form E677 under the PCMLTFA.',
      citations: [
        { title: 'CBSA — Travelling with CAD $10,000 or more', url: 'https://www.cbsa-asfc.gc.ca/travel-voyage/declare-eng.html' }
      ],
      cachedAt: '2026-01-01',
      latencyMs: 0
    }
  ]
]);

export function lookupFaqCache(query) {
  if (!query || typeof query !== 'string') return null;
  const normalized = query.toLowerCase().trim().replace(/[?!.,]/g, '');
  return PRECOMPUTED_FAQ_CACHE.get(normalized) || null;
}
