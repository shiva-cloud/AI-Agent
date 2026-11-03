/**
 * Alberta Residential Tenancy Abandoned Goods & Disposal Navigator
 *
 * Evaluates landlord obligations, valuation thresholds, mandatory 30-day storage,
 * and tenant retrieval rights under Alberta's Residential Tenancies Act, SA 2004,
 * c. R-17.1, ss. 31, 32, and Alta. Reg. 211/2004, ss. 4–6.
 *
 * Pure ES module — zero runtime npm dependencies.
 */

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const ALBERTA_ABANDONED_GOODS_CONSTANTS = Object.freeze({
  STATUTORY_VALUATION_THRESHOLD_CAD: 2000, // Reg s. 5(1)
  MANDATORY_STORAGE_PERIOD_DAYS: 30, // Reg s. 5(2)
  STATUTORY_SURPLUS_REMITTANCE_WINDOW_DAYS: 30, // s. 31(4)
  STATUTORY_AUTHORITY: 'Residential Tenancies Act, SA 2004, c. R-17.1, ss. 31-32; Alta. Reg. 211/2004'
});

/**
 * Audits landlord treatment of abandoned personal property, storage mandates, and tenant recovery rights.
 *
 * @param {Object} params
 * @param {string} [params.actorRole='TENANT'] - Role: 'TENANT', 'LANDLORD'
 * @param {number} [params.estimatedMarketValueCad=2500] - Estimated fair market value of all abandoned goods combined
 * @param {number} [params.daysSinceLandlordTookPossession=15] - Calendar days elapsed since landlord took custody of goods
 * @param {boolean} [params.hasPreparedItemizedInventory=true] - Landlord prepared itemized inventory and photographs under Reg s. 4
 * @param {boolean} [params.landlordDisposedBefore30Days=false] - Landlord destroyed, sold, or threw away goods prior to 30 days
 * @param {boolean} [params.landlordRefusedReleaseWithoutRentArrears=false] - Landlord withheld goods demanding back-rent before release
 * @param {number} [params.accruedStorageAndMovingCostsCad=200] - Reasonable actual costs of packing, hauling, and storing
 * @param {number} [params.unpaidRentArrearsCad=1500] - Amount of unpaid rent alleged by landlord
 * @param {number} [params.auctionProceedsRealizedCad=0] - Total gross revenue realized from public auction sale
 * @returns {Object} Abandoned property rights audit, valuation analysis, and RTDRS remedies
 */
export function evaluateAlbertaAbandonedGoods({
  actorRole = 'TENANT',
  estimatedMarketValueCad = 2500,
  daysSinceLandlordTookPossession = 15,
  hasPreparedItemizedInventory = true,
  landlordDisposedBefore30Days = false,
  landlordRefusedReleaseWithoutRentArrears = false,
  accruedStorageAndMovingCostsCad = 200,
  unpaidRentArrearsCad = 1500,
  auctionProceedsRealizedCad = 0,
  tenantName = 'Tenant',
  landlordName = 'Landlord',
  assessmentDate = todayIso()
} = {}) {
  const cleanActor = boundedText(actorRole, 'TENANT', 30);
  const cleanTenant = boundedText(tenantName, 'Tenant', 120);
  const cleanLandlord = boundedText(landlordName, 'Landlord', 120);
  const cleanDate = safeIsoDate(assessmentDate, todayIso());
  const value = Number.isFinite(Number(estimatedMarketValueCad)) ? Math.max(0, Math.min(10000000, Number(estimatedMarketValueCad))) : 2500;
  const daysElapsed = Number.isFinite(Number(daysSinceLandlordTookPossession)) ? Math.max(0, Math.min(3650, Math.floor(Number(daysSinceLandlordTookPossession)))) : 15;
  const storageCosts = Number.isFinite(Number(accruedStorageAndMovingCostsCad)) ? Math.max(0, Math.min(100000, Number(accruedStorageAndMovingCostsCad))) : 200;
  const rentArrears = Number.isFinite(Number(unpaidRentArrearsCad)) ? Math.max(0, Math.min(100000, Number(unpaidRentArrearsCad))) : 1500;
  const auctionGross = Number.isFinite(Number(auctionProceedsRealizedCad)) ? Math.max(0, Math.min(10000000, Number(auctionProceedsRealizedCad))) : 0;

  const isAbove2000Threshold = value >= ALBERTA_ABANDONED_GOODS_CONSTANTS.STATUTORY_VALUATION_THRESHOLD_CAD;
  const isWithin30DayStorageWindow = daysElapsed < ALBERTA_ABANDONED_GOODS_CONSTANTS.MANDATORY_STORAGE_PERIOD_DAYS;

  const statutoryViolations = [];
  const riskWarnings = [];
  const actionableRemedies = [];

  // 1. Premature Disposal Audit (s. 31(2) & Reg s. 5)
  if (isAbove2000Threshold && landlordDisposedBefore30Days) {
    statutoryViolations.push({
      rule: 'UNLAWFUL_PREMATURE_DISPOSAL_OF_ABANDONED_GOODS',
      statute: 'Residential Tenancies Act s. 31(2) & Alta. Reg. 211/2004 s. 5',
      finding: `Goods valued at $${value} (threshold: $2,000) were disposed of before the mandatory 30-day storage period expired.`
    });
    actionableRemedies.push({
      action: 'FILE_RTDRS_DAMAGES_CLAIM_FOR_CONVERSION',
      remedyDescription: `File an application with the Residential Tenancy Dispute Resolution Service (RTDRS) for conversion/tort damages equal to the fair market value ($${value}) of the destroyed goods.`
    });
  }

  // 2. Conditional Release on Rent Arrears Breach (s. 31(6))
  // Tenant only owes storage/moving costs to reclaim. Landlord CANNOT condition release on rent arrears!
  if (landlordRefusedReleaseWithoutRentArrears) {
    statutoryViolations.push({
      rule: 'UNLAWFUL_WITHHOLDING_OF_TENANT_PROPERTY',
      statute: 'Residential Tenancies Act s. 31(6)',
      finding: `Landlord unlawfully conditioned retrieval of tenant property upon payment of back-rent ($${rentArrears}). Statute strictly limits landlord lien to actual storage/moving costs ($${storageCosts}).`
    });
    actionableRemedies.push({
      action: 'DEMAND_IMMEDIATE_RETURN_UPON_STORAGE_FEE_TENDER',
      remedyDescription: `Tender $${storageCosts} for actual storage costs and demand immediate possession. File emergency RTDRS application for recovery of personal property if refused.`
    });
  }

  // 3. Inventory Mandate Audit (Reg s. 4)
  if (isAbove2000Threshold && !hasPreparedItemizedInventory) {
    statutoryViolations.push({
      rule: 'FAILURE_TO_PREPARE_ABANDONED_PROPERTY_INVENTORY',
      statute: 'Residential Tenancies Ministerial Regulation, Alta. Reg. 211/2004, s. 4',
      finding: 'Landlord failed to record an itemized inventory of abandoned goods valued at $2,000 or greater.'
    });
    actionableRemedies.push({
      action: 'PREPARE_DETAILED_INVENTORY_AND_AFFIDAVIT',
      remedyDescription: 'Landlord must create a signed inventory detailing description, estimated value, and storage location.'
    });
  }

  // 4. Surplus Distribution Accounting (s. 31(4))
  let netSurplusPayableToMinisterCad = 0;
  if (auctionGross > 0) {
    const remainingAfterStorage = Math.max(0, auctionGross - storageCosts);
    netSurplusPayableToMinisterCad = Math.max(0, remainingAfterStorage - rentArrears);

    if (netSurplusPayableToMinisterCad > 0) {
      riskWarnings.push({
        warningType: 'SURPLUS_FUNDS_DUE_TO_CROWN',
        description: `$${netSurplusPayableToMinisterCad} surplus proceeds after deducting storage costs and rent arrears must be remitted to the Minister within 30 days of sale under s. 31(4).`
      });
    }
  }

  let complianceStatus = 'COMPLIANT_STATUTORY_STORAGE_ACTIVE';
  let legalVerdict = isAbove2000Threshold
    ? `Abandoned goods exceed $2,000 threshold ($${value}). Landlord is bound to safe storage for 30 calendar days. Tenant may reclaim upon paying $${storageCosts} in actual storage costs.`
    : `Abandoned goods have an estimated market value under $2,000 ($${value}). Landlord is statutorily authorized to dispose of goods immediately under s. 31(2).`;

  if (statutoryViolations.length > 0) {
    complianceStatus = 'UNLAWFUL_ABANDONED_GOODS_PRACTICE';
    legalVerdict = `Breach of Alberta Residential Tenancies Act abandoned property provisions (${statutoryViolations.length} violation${statutoryViolations.length === 1 ? '' : 's'}). RTDRS remedies apply.`;
  }

  return {
    assessmentDate: cleanDate,
    jurisdiction: 'ALBERTA_CANADA',
    tenantName: cleanTenant,
    landlordName: cleanLandlord,
    actorRole: cleanActor,
    estimatedMarketValueCad: value,
    isAbove2000Threshold,
    daysSinceLandlordTookPossession: daysElapsed,
    isWithin30DayStorageWindow,
    complianceStatus,
    legalVerdict,
    financialSummary: {
      storageAndMovingCostsToReclaimCad: storageCosts,
      unpaidRentArrearsCad: rentArrears,
      auctionProceedsRealizedCad: auctionGross,
      netSurplusPayableToMinisterCad
    },
    statutoryViolations,
    riskWarnings,
    actionableRemedies,
    statutoryCitations: [
      'Residential Tenancies Act, SA 2004, c. R-17.1, ss. 31, 32',
      'Residential Tenancies Ministerial Regulation, Alta. Reg. 211/2004, ss. 4-6',
      'Residential Tenancy Dispute Resolution Service (RTDRS) Rules of Practice'
    ]
  };
}
