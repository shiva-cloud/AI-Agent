// src/routes/tools.js
// Central router facade delegating to domain-specific tool modules.

import { handleImmigrationGet, handleImmigrationPost } from './tools/immigration.js';
import { handleEmploymentGet, handleEmploymentPost } from './tools/employment.js';
import { handleHousingGet, handleHousingPost } from './tools/housing.js';
import { handleFinanceGet, handleFinancePost } from './tools/finance.js';
import { handleLegalGet, handleLegalPost } from './tools/legal.js';
import { handleSettlementGet, handleSettlementPost } from './tools/settlement.js';
import { handleInternationalGet, handleInternationalPost } from './tools/international.js';

export function handleToolGet(ctx) {
  return handleImmigrationGet(ctx)
    || handleEmploymentGet(ctx)
    || handleHousingGet(ctx)
    || handleFinanceGet(ctx)
    || handleLegalGet(ctx)
    || handleSettlementGet(ctx)
    || handleInternationalGet(ctx)
    || false;
}

export function handleToolPost(ctx) {
  return handleImmigrationPost(ctx)
    || handleEmploymentPost(ctx)
    || handleHousingPost(ctx)
    || handleFinancePost(ctx)
    || handleLegalPost(ctx)
    || handleSettlementPost(ctx)
    || handleInternationalPost(ctx)
    || false;
}
