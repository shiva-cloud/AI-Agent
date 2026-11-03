// Market Gap Questions Batch 2 Resolver (82,001 - 84,000)
// Unreviewed research catalog: one templated rule/citation/verdict per scenario, repeated across countries (not country-specific law)
// Covering 78 international jurisdictions and 5 difficulty tiers (Basic, Intermediate, Advanced, Expert, Extreme)
// Items live in src/market-gap/batch2.json; lookup logic is shared in market-gap-resolver.js.
import { createMarketGapBatch, loadMarketGapItems } from './market-gap-resolver.js';

export const MARKET_GAP_BATCH_2 = loadMarketGapItems('batch2.json');

const batch = createMarketGapBatch({
  items: MARKET_GAP_BATCH_2,
  first: 82001,
  last: 84000,
  scenarios: [
    { pattern: /salary paid in cash without payslips/i, range: [82001, 82080] },
    { pattern: /university changed its legal name after graduation/i, range: [82081, 82240] },
    { pattern: /birth certificate and passport show different spellings/i, range: [82241, 82400] },
    { pattern: /marriage certificate issued after the wedding by several years/i, range: [82401, 82560] },
    { pattern: /police certificate cannot be obtained due to conflict/i, range: [82561, 82720] },
    { pattern: /bank deposits came from multiple relatives/i, range: [82721, 82880] },
    { pattern: /certified translation has a mistake in one date/i, range: [82881, 83040] },
    { pattern: /documents were destroyed in a flood/i, range: [83041, 83200] },
    { pattern: /salary threshold changed between sponsorship and visa filing/i, range: [83201, 83360] },
    { pattern: /occupation list changed after invitation but before decision/i, range: [83361, 83520] },
    { pattern: /visa category closed while application remains pending/i, range: [83521, 83680] },
    { pattern: /language test expired during government processing delay/i, range: [83681, 83840] },
    { pattern: /child aged out while application was in queue/i, range: [83841, 84000] }
  ]
});

export const resolveMarketGapBatch2Item = batch.resolve;
export const searchMarketGapBatch2 = batch.search;
export const getMarketGapBatch2Stats = batch.stats;
