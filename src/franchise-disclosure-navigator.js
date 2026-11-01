/**
 * Canadian Franchise Disclosure, Arthur Wishart Act & Newcomer Franchisee Defense Engine
 * 
 * Statutory & Jurisdictional Authorities:
 * - Ontario Arthur Wishart Act (Franchise Disclosure), 2000, S.O. 2000, c. 3:
 *   - s. 5(1) (Mandatory delivery of Franchise Disclosure Document at least 14 days prior to agreement/deposit)
 *   - s. 5(4) (Delivery as a single document at one time; piecemeal disclosure is statutorily invalid)
 *   - s. 5(6) (Mandatory Certificate of Franchisor signed by at least 2 directors/officers)
 *   - s. 6(1) (60-Day Rescission for late or deficient disclosure document)
 *   - s. 6(2) (Two-Year Absolute Rescission Right if FDD is never delivered or is fatally defective at law)
 *   - s. 6(6) (Mandatory statutory damages on rescission: refund of fees, inventory/equipment repurchase at cost, full reimbursement of operating losses)
 *   - s. 3 & s. 11 (Statutory duty of fair dealing and strict anti-waiver prohibition)
 * - British Columbia Franchises Act, S.B.C. 2015, c. 35
 * - Alberta Franchises Act, R.S.A. 2000, c. F-23
 */

import { boundedText } from './text-input.js';

export const FRANCHISE_ACT_CONSTANTS = Object.freeze({
  MANDATORY_FDD_DAYS: 14,
  SHORT_RESCISSION_DAYS: 60,
  ABSOLUTE_RESCISSION_YEARS: 2,
  REFUND_COMPLIANCE_DAYS: 30
});

export const PROVINCIAL_FRANCHISE_ACTS = Object.freeze({
  ON: {
    actName: 'Arthur Wishart Act (Franchise Disclosure), 2000, S.O. 2000, c. 3',
    rescissionSection: 's. 6',
    fairDealingSection: 's. 3',
    antiWaiverSection: 's. 11'
  },
  BC: {
    actName: 'British Columbia Franchises Act, S.B.C. 2015, c. 35',
    rescissionSection: 's. 6',
    fairDealingSection: 's. 3',
    antiWaiverSection: 's. 11'
  },
  AB: {
    actName: 'Alberta Franchises Act, R.S.A. 2000, c. F-23',
    rescissionSection: 's. 13',
    fairDealingSection: 's. 7',
    antiWaiverSection: 's. 18'
  },
  MB: {
    actName: 'Manitoba Franchises Act, C.C.S.M. c. F156',
    rescissionSection: 's. 6',
    fairDealingSection: 's. 3',
    antiWaiverSection: 's. 11'
  }
});

/**
 * Diagnostic evaluation of franchise disclosure compliance, fatal FDD defects,
 * 2-year absolute rescission rights, and full statutory restitution calculation.
 */
export function evaluateFranchiseDisclosure(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    province = 'ON',
    agreementSignedDate = '2025-10-01',
    fddDeliveredDate = '2025-09-25',
    wasFddDeliveredAsSingleDocument = true,
    hasAuditedFinancialStatements = true,
    hasSignedFranchisorCertificate = true,
    initialFranchiseFeePaidCad = 45000,
    equipmentAndBuildoutCostCad = 180000,
    inventoryPurchasedAtCostCad = 25000,
    cumulativeOperatingLossesCad = 55000,
    franchiseeName = 'Franchisee Inc.',
    franchisorName = 'National Franchise Systems Ltd.',
    assessmentDate = '2026-10-31'
  } = safeParams;
  const prov = boundedText(province, 'ON', 10).toUpperCase();
  const act = PROVINCIAL_FRANCHISE_ACTS[prov] || PROVINCIAL_FRANCHISE_ACTS.ON;

  const rawSign = boundedText(agreementSignedDate, '2025-10-01', 30);
  const signDate = rawSign && !Number.isNaN(Date.parse(rawSign)) ? rawSign : '2025-10-01';
  const rawFdd = fddDeliveredDate ? boundedText(fddDeliveredDate, '', 30) : null;
  const fddDate = rawFdd && !Number.isNaN(Date.parse(rawFdd)) ? rawFdd : null;

  const singleDoc = Boolean(wasFddDeliveredAsSingleDocument);
  const auditedFin = Boolean(hasAuditedFinancialStatements);
  const signedCert = Boolean(hasSignedFranchisorCertificate);

  const initialFee = Number.isFinite(Number(initialFranchiseFeePaidCad)) ? Math.max(0, Math.min(1000000000, Number(initialFranchiseFeePaidCad))) : 0;
  const equipment = Number.isFinite(Number(equipmentAndBuildoutCostCad)) ? Math.max(0, Math.min(1000000000, Number(equipmentAndBuildoutCostCad))) : 0;
  const inventory = Number.isFinite(Number(inventoryPurchasedAtCostCad)) ? Math.max(0, Math.min(1000000000, Number(inventoryPurchasedAtCostCad))) : 0;
  const losses = Number.isFinite(Number(cumulativeOperatingLossesCad)) ? Math.max(0, Math.min(1000000000, Number(cumulativeOperatingLossesCad))) : 0;

  const safeFranchisee = boundedText(franchiseeName, 'Franchisee', 100);
  const safeFranchisor = boundedText(franchisorName, 'Franchisor', 150);
  const rawAssess = boundedText(assessmentDate, '2026-10-31', 30);
  const assessDate = rawAssess && !Number.isNaN(Date.parse(rawAssess)) ? rawAssess : '2026-10-31';

  const deficiencies = [];
  const statutoryProtections = [];

  // 1. Calculate Time Elapsed Since Agreement
  let daysSinceAgreement = 0;
  if (signDate && assessDate) {
    const sTime = new Date(signDate).getTime();
    const aTime = new Date(assessDate).getTime();
    if (!isNaN(sTime) && !isNaN(aTime)) {
      daysSinceAgreement = Math.max(0, Math.floor((aTime - sTime) / (1000 * 60 * 60 * 24)));
    }
  }

  // 2. Check 14-Day Delivery Window
  let fddDeliveryAdvanceDays = 0;
  let deliveredLate = false;

  if (fddDate && signDate) {
    const fTime = new Date(fddDate).getTime();
    const sTime = new Date(signDate).getTime();
    if (!isNaN(fTime) && !isNaN(sTime)) {
      fddDeliveryAdvanceDays = Math.floor((sTime - fTime) / (1000 * 60 * 60 * 24));
      if (fddDeliveryAdvanceDays < FRANCHISE_ACT_CONSTANTS.MANDATORY_FDD_DAYS) {
        deliveredLate = true;
        deficiencies.push(`LATE FDD DISCLOSURE: FDD was delivered only ${fddDeliveryAdvanceDays} days prior to agreement execution. The statute strictly mandates delivery at least 14 days before signing or payment.`);
      }
    }
  } else {
    deficiencies.push('NO FDD DELIVERED: Franchisor never provided a formal Franchise Disclosure Document.');
  }

  // 3. Fatal FDD Deficiencies Audit (Triggering 2-Year Rescission)
  let isFatallyDefective = false;

  if (!fddDate) {
    isFatallyDefective = true;
  }
  if (!singleDoc) {
    isFatallyDefective = true;
    deficiencies.push('PIECEMEAL DISCLOSURE: Providing disclosure in fragments, separate emails, or multiple binders violates the mandatory single-document rule (s. 5(4)) and constitutes no disclosure at law.');
  }
  if (!auditedFin) {
    isFatallyDefective = true;
    deficiencies.push('MISSING FINANCIAL STATEMENTS: Failure to include audited or review-engagement financial statements for the most recent fiscal year is a fatal deficiency recognized by the Court of Appeal as rendering the FDD null and void.');
  }
  if (!signedCert) {
    isFatallyDefective = true;
    deficiencies.push('MISSING FRANCHISOR CERTIFICATE: Absence of a Certificate of Franchisor personally signed by two directors/officers certifying full, true and plain disclosure nullifies the disclosure document (s. 5(6)).');
  }

  // 4. Rescission Remedy Determination
  const twoYearsInDays = FRANCHISE_ACT_CONSTANTS.ABSOLUTE_RESCISSION_YEARS * 365.25;
  let rescissionVerdict = 'NONE_EXPIRED';
  let canRescindNow = false;

  if (isFatallyDefective) {
    if (daysSinceAgreement <= twoYearsInDays) {
      rescissionVerdict = 'TWO_YEAR_ABSOLUTE_RESCISSION_ACTIVE';
      canRescindNow = true;
      statutoryProtections.push(`ABSOLUTE RESCISSION RIGHT ACTIVE (${act.rescissionSection}(2)): Because the disclosure is fatally defective at law, the franchisee has an absolute statutory right to rescind the franchise agreement within 2 years of entering into the contract (${Math.floor(twoYearsInDays - daysSinceAgreement)} days remaining).`);
    } else {
      rescissionVerdict = 'TWO_YEAR_LIMITATION_EXPIRED';
      deficiencies.push('The 2-year statutory limitation period for absolute rescission has expired.');
    }
  } else if (deliveredLate) {
    if (daysSinceAgreement <= FRANCHISE_ACT_CONSTANTS.SHORT_RESCISSION_DAYS) {
      rescissionVerdict = 'SIXTY_DAY_RESCISSION_ACTIVE';
      canRescindNow = true;
      statutoryProtections.push(`60-DAY RESCISSION RIGHT ACTIVE (${act.rescissionSection}(1)): The franchisee may rescind the agreement within 60 days of receiving the FDD due to failure to meet the 14-day advance rule.`);
    } else {
      rescissionVerdict = 'SIXTY_DAY_LIMITATION_EXPIRED';
    }
  } else {
    rescissionVerdict = 'COMPLIANT_DISCLOSURE';
  }

  // 5. Statutory Rescission Compensation Calculation (s. 6(6))
  const totalRestitutionCad = Math.round((initialFee + equipment + inventory + losses) * 100) / 100;

  if (canRescindNow) {
    statutoryProtections.push(`MANDATORY STATUTORY RESTITUTION (${act.rescissionSection}(6)): Upon delivery of a Notice of Rescission, the franchisor must within 30 days refund the $${initialFee} CAD initial fee, repurchase equipment at cost ($${equipment} CAD), repurchase inventory at cost ($${inventory} CAD), and reimburse all operational losses incurred ($${losses} CAD), totaling $${totalRestitutionCad} CAD.`);
  }

  return {
    franchiseeName: safeFranchisee,
    franchisorName: safeFranchisor,
    province: prov,
    governingAct: act.actName,
    daysSinceAgreement,
    disclosureAudit: {
      fddProvided: Boolean(fddDate),
      fddDeliveryAdvanceDays,
      isPiecemealDisclosure: !singleDoc,
      hasAuditedFinancialStatements: auditedFin,
      hasSignedFranchisorCertificate: signedCert,
      isFatallyDefective
    },
    rescissionAnalysis: {
      rescissionVerdict,
      canRescindNow,
      daysRemainingInTwoYearWindow: Math.max(0, Math.floor(twoYearsInDays - daysSinceAgreement))
    },
    statutoryDamagesEstimate: {
      initialFranchiseFeePaidCad: initialFee,
      equipmentAndBuildoutCostCad: equipment,
      inventoryPurchasedAtCostCad: inventory,
      cumulativeOperatingLossesCad: losses,
      totalRestitutionOwedCad: canRescindNow ? totalRestitutionCad : 0
    },
    deficiencies,
    statutoryProtections
  };
}

/**
 * Generates a formal statutory Notice of Rescission under the Arthur Wishart Act s. 6.
 */
export function generateFranchiseRescissionNotice({
  franchiseeName = 'Franchisee Inc.',
  franchisorName = 'National Franchise Systems Ltd.',
  totalRestitutionCad = 305000,
  province = 'ON',
  noticeDate = '2026-10-31'
} = {}) {
  const franchisee = boundedText(franchiseeName, 'Franchisee', 100);
  const franchisor = boundedText(franchisorName, 'Franchisor', 150);
  const restitution = Number.isFinite(Number(totalRestitutionCad)) ? Math.max(0, Math.min(1000000000, Number(totalRestitutionCad))) : 0;
  const prov = boundedText(province, 'ON', 10).toUpperCase();
  const rawNotice = boundedText(noticeDate, '2026-10-31', 30);
  const date = rawNotice && !Number.isNaN(Date.parse(rawNotice)) ? rawNotice : '2026-10-31';

  return [
    '================================================================================',
    'FORMAL STATUTORY NOTICE OF RESCISSION (ARTHUR WISHART ACT s. 6)',
    `To: The Officers and Directors of ${franchisor}`,
    `From: ${franchisee} | Date: ${date} | Jurisdiction: ${prov}`,
    '================================================================================',
    '',
    '1. STATUTORY NOTICE OF CONTRACTUAL RESCISSION:',
    `   PLEASE TAKE NOTICE that pursuant to Section 6 of the Arthur Wishart Act (Franchise Disclosure),`,
    `   2000, S.O. 2000, c. 3 (or applicable provincial equivalent), the Franchisee hereby RESCINDS the`,
    `   franchise agreement, sublease, and all collateral contracts entered into with the Franchisor.`,
    '',
    '2. GROUNDS FOR RESCISSION:',
    '   - Fatal statutory disclosure deficiencies rendering the disclosure nonexistent at law, including',
    '     failure to provide mandatory audited financial statements and missing Certificate of Franchisor.',
    '',
    '3. STATUTORY RESTITUTION DEMAND (SECTION 6(6)):',
    `   DEMAND IS HEREBY MADE for payment of the full statutory restitution of $${restitution} CAD within`,
    '   thirty (30) calendar days as required by law, comprising:',
    '   - Full refund of all franchise and development fees paid;',
    '   - Repurchase of all inventory and supplies at purchase price;',
    '   - Repurchase of all equipment and leasehold improvements at purchase cost; and',
    '   - Full indemnification and compensation for all operational losses incurred.',
    '================================================================================'
  ].join('\n');
}
