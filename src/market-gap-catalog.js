// Public view of the market-gap question catalogs (IDs 80001-86000).
// The catalog rule, citation and verdict text is one template per scenario,
// repeated for all 78 countries, so most entries cite another country's law
// (Canadian IRPR for Japan, for example). Until an entry is reviewed for its own
// country, the API publishes the question and scenario only.
export const MARKET_GAP_WITHHELD_FIELDS = Object.freeze(['statutoryRule', 'citation', 'verdict']);
export const MARKET_GAP_NOTICE = 'Unreviewed research catalog. Legal rule, citation and verdict text is withheld until it is reviewed for this country.';

export function publicMarketGapItem(item) {
  if (!item) return item;
  const { id, tier, country, topic, question, scenarioName } = item;
  return { id, tier, country, topic, question, scenarioName, reviewStatus: 'unreviewed_template', withheld: [...MARKET_GAP_WITHHELD_FIELDS], notice: MARKET_GAP_NOTICE };
}

export function publicMarketGapPage(page) {
  return { ...page, items: page.items.map(publicMarketGapItem) };
}
