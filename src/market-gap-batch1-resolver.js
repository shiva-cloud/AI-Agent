// Market Gap Questions Batch 1 Resolver (80,001 - 82,000)
// Unreviewed research catalog: one templated rule/citation/verdict per scenario, repeated across countries (not country-specific law)
// Covering 78 international jurisdictions and 5 difficulty tiers (Basic, Intermediate, Advanced, Expert, Extreme)
// Items live in src/market-gap/batch1.json; lookup logic is shared in market-gap-resolver.js.
import { createMarketGapBatch, loadMarketGapItems } from './market-gap-resolver.js';

export const MARKET_GAP_BATCH_1 = loadMarketGapItems('batch1.json');

const batch = createMarketGapBatch({
  items: MARKET_GAP_BATCH_1,
  first: 80001,
  last: 82000,
  scenarios: [
    { pattern: /portal shows zero documents after successful upload/i, range: [80001, 80200] },
    { pattern: /biometrics completed but online status remains pending/i, range: [80201, 80400] },
    { pattern: /account locked after changing phone number/i, range: [80401, 80600] },
    { pattern: /duplicate profiles created under different emails/i, range: [80601, 80800] },
    { pattern: /government portal cannot accept non-Latin name characters/i, range: [80801, 81000] },
    { pattern: /upload deadline falls during a portal outage/i, range: [81001, 81200] },
    { pattern: /webform acknowledgment arrived but requested documents not/i, range: [81201, 81400] },
    { pattern: /application fee charged twice while only one submission/i, range: [81401, 81600] },
    { pattern: /address history contains an unexplained two-month gap/i, range: [81601, 81800] },
    { pattern: /former employer closed and cannot issue reference letter/i, range: [81801, 82000] }
  ]
});

export const resolveMarketGapBatch1Item = batch.resolve;
export const searchMarketGapBatch1 = batch.search;
export const getMarketGapBatch1Stats = batch.stats;
