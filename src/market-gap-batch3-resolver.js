// Market Gap Questions Batch 3 Resolver (84,001 - 86,000)
// Unreviewed research catalog: one templated rule/citation/verdict per scenario, repeated across countries (not country-specific law)
// Covering 78 international jurisdictions and 5 difficulty tiers (Basic, Intermediate, Advanced, Expert, Extreme)
// Items live in src/market-gap/batch3.json; lookup logic is shared in market-gap-resolver.js.
import { createMarketGapBatch, loadMarketGapItems } from './market-gap-resolver.js';

export const MARKET_GAP_BATCH_3 = loadMarketGapItems('batch3.json');

const batch = createMarketGapBatch({
  items: MARKET_GAP_BATCH_3,
  first: 84001,
  last: 86000,
  scenarios: [
    { pattern: /new medical rule applies after application submission/i, range: [84001, 84160] },
    { pattern: /fee increase occurred after payment but before biometrics/i, range: [84161, 84320] },
    { pattern: /sponsor lost licence during pending family application/i, range: [84321, 84480] },
    { pattern: /court overturned a rule after refusal decision/i, range: [84481, 84640] },
    { pattern: /regional nomination withdrawn after federal application submission/i, range: [84641, 84800] },
    { pattern: /temporary residence application pending during family medical emergency abroad/i, range: [84801, 84960] },
    { pattern: /airline refuses boarding despite valid digital status/i, range: [84961, 85120] },
    { pattern: /residence card lost during international layover/i, range: [85121, 85280] },
    { pattern: /passport expires during a planned multi-country trip/i, range: [85281, 85440] },
    { pattern: /visa sticker valid but underlying residence permission cancelled/i, range: [85441, 85600] },
    { pattern: /dual national used different passports for entry and exit/i, range: [85601, 85760] },
    { pattern: /child travelling with one parent faces consent questions/i, range: [85761, 85920] },
    { pattern: /transit airport changed after ticket rebooking/i, range: [85921, 86000] }
  ]
});

export const resolveMarketGapBatch3Item = batch.resolve;
export const searchMarketGapBatch3 = batch.search;
export const getMarketGapBatch3Stats = batch.stats;
