// Read-only research catalog routes: question bank, market-gap and global
// settlement entries. None of these are published evidence; server.js marks
// every response with X-Evidence-Status: unreviewed-research-catalog.
// Returns {status, body} for a catalog route, or null when the path is not one.
import { resolveQuestionBankItem, searchQuestionBankBatch2, getQuestionBankBatch2Stats } from '../global-immigration-question-bank-resolver.js';
import { resolveQuestionBankBatch3Item, searchQuestionBankBatch3, getQuestionBankBatch3Stats } from '../global-immigration-question-bank-batch3-resolver.js';
import { resolveMarketGapBatch1Item, searchMarketGapBatch1, getMarketGapBatch1Stats } from '../market-gap-batch1-resolver.js';
import { resolveMarketGapBatch2Item, searchMarketGapBatch2, getMarketGapBatch2Stats } from '../market-gap-batch2-resolver.js';
import { resolveMarketGapBatch3Item, searchMarketGapBatch3, getMarketGapBatch3Stats } from '../market-gap-batch3-resolver.js';
import { resolveGlobalSettlementItem, searchGlobalSettlement, getGlobalSettlementStats } from '../global-settlement-resolver.js';
import { publicMarketGapItem, publicMarketGapPage, publicGlobalSettlementItem, publicGlobalSettlementPage } from '../market-gap-catalog.js';

const ok = body => ({ status: 200, body });
const page = params => ({
  limit: Math.min(200, Math.max(1, Number(params.get('limit')) || 20)),
  offset: Math.max(0, Number(params.get('offset')) || 0)
});

const QUESTION_BANKS = {
  batch2: { search: searchQuestionBankBatch2, stats: getQuestionBankBatch2Stats, resolve: resolveQuestionBankItem, label: 'Batch 2 (1701-1900)' },
  batch3: { search: searchQuestionBankBatch3, stats: getQuestionBankBatch3Stats, resolve: resolveQuestionBankBatch3Item, label: 'Batch 3 (1901-2100)' }
};
const MARKET_GAPS = {
  batch1: { search: searchMarketGapBatch1, stats: getMarketGapBatch1Stats, resolve: resolveMarketGapBatch1Item, label: 'Market Gap Batch 1 (80001-82000)' },
  batch2: { search: searchMarketGapBatch2, stats: getMarketGapBatch2Stats, resolve: resolveMarketGapBatch2Item, label: 'Market Gap Batch 2 (82001-84000)' },
  batch3: { search: searchMarketGapBatch3, stats: getMarketGapBatch3Stats, resolve: resolveMarketGapBatch3Item, label: 'Market Gap Batch 3 (84001-86000)' }
};

export function handleCatalogRoute(method, path, params) {
  if (method !== 'GET') return null;

  const bank = path.match(/^\/v1\/question-bank\/(batch2|batch3)(\/stats|\/(\d+))?$/);
  if (bank) {
    const source = QUESTION_BANKS[bank[1]];
    if (bank[2] === '/stats') return ok(source.stats());
    if (!bank[2]) return ok(source.search({ query: params.get('q') || '', category: params.get('category') || null, ...page(params) }));
    const id = parseInt(bank[3], 10);
    const item = source.resolve(id);
    return item ? ok({ item }) : { status: 404, body: { error: `Question not found in ${source.label}: ${id}`, code: 'question_not_found' } };
  }

  const gap = path.match(/^\/v1\/market-gap\/(batch1|batch2|batch3)(\/stats|\/(\d+))?$/);
  if (gap) {
    const source = MARKET_GAPS[gap[1]];
    if (gap[2] === '/stats') return ok(source.stats());
    if (!gap[2]) return ok(publicMarketGapPage(source.search({ query: params.get('q') || '', country: params.get('country') || null, topic: params.get('topic') || null, ...page(params) })));
    const id = parseInt(gap[3], 10);
    const item = source.resolve(id);
    return item ? ok({ item: publicMarketGapItem(item) }) : { status: 404, body: { error: `Question not found in ${source.label}: ${id}`, code: 'market_gap_question_not_found' } };
  }

  if (path === '/v1/global-settlement/stats') return ok(getGlobalSettlementStats());
  if (path === '/v1/global-settlement') {
    return ok(publicGlobalSettlementPage(searchGlobalSettlement({ query: params.get('q') || '', country: params.get('country') || null, category: params.get('category') || null, tier: params.get('tier') || null, ...page(params) })));
  }
  const gms = path.match(/^\/v1\/global-settlement\/(GMS-Q\d+|\d+)$/i);
  if (gms) {
    const item = resolveGlobalSettlementItem(gms[1]);
    return item ? ok({ item: publicGlobalSettlementItem(item) }) : { status: 404, body: { error: `Question not found in Global Settlement (GMS-Q00001 - GMS-Q20000): ${gms[1]}`, code: 'global_settlement_question_not_found' } };
  }
  return null;
}
