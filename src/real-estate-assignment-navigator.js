/**
 * Canadian Residential Real Estate Assignment Sales, GST/HST & Anti-Flipping Engine
 * 
 * Statutory & Jurisdictional Authorities:
 * - Income Tax Act (ITA), R.S.C. 1985, c. 1 (5th Supp.):
 *   - s. 12(1)(z.7) (Deemed business income on residential property flipped within 365 consecutive days)
 *   - s. 6503.1 (Prescribed life-event exceptions to residential property anti-flipping rule)
 *   - s. 40(2)(b) (Principal Residence Exemption - strictly disallowed if anti-flipping rule applies)
 * - Excise Tax Act (ETA), R.S.C. 1985, c. E-15:
 *   - s. 165 & Part IX (Harmonized Sales Tax / GST on Assignment Sales of Newly Constructed Housing)
 *   - Legislative change effective May 7, 2022: Assignment sales of new residential housing are taxable for GST/HST
 * - Ontario New Home Warranties Plan Act (Tarion), R.S.O. 1990, c. O.31:
 *   - O. Reg. 165/08 (Delayed Closing Compensation: $150/day up to $7,500 maximum)
 * - Prohibition on the Purchase of Residential Property by Non-Canadians Act, S.C. 2022, c. 10, s. 235
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const ASSIGNMENT_CONSTANTS = Object.freeze({
  ANTI_FLIPPING_HOLDING_DAYS: 365,
  GST_RATE_PERCENT: 5.0,
  ONTARIO_HST_RATE_PERCENT: 13.0,
  BC_GST_RATE_PERCENT: 5.0,
  TARION_DAILY_DELAY_COMPENSATION_CAD: 150.0,
  TARION_MAX_DELAY_COMPENSATION_CAD: 7500.0,
  RELOCATION_MINIMUM_DISTANCE_KM: 40.0
});

export const PRESCRIBED_LIFE_EVENT_EXEMPTIONS = Object.freeze({
  death: {
    label: 'Death of Taxpayer or Related Person',
    statutoryBasis: 'ITA s. 6503.1(a)'
  },
  household_addition: {
    label: 'Birth of Child, Adoption, or Care of Elderly Parent',
    statutoryBasis: 'ITA s. 6503.1(b)'
  },
  separation_divorce: {
    label: 'Breakdown of Marriage or Common-Law Partnership (90+ Days)',
    statutoryBasis: 'ITA s. 6503.1(c)'
  },
  safety_threat: {
    label: 'Threat to Personal Safety or Domestic Violence',
    statutoryBasis: 'ITA s. 6503.1(d)'
  },
  disability_illness: {
    label: 'Serious Disability or Critical Illness',
    statutoryBasis: 'ITA s. 6503.1(e)'
  },
  employment_relocation: {
    label: 'Employment or Business Relocation (>= 40 km Closer to Work)',
    statutoryBasis: 'ITA s. 6503.1(f)'
  },
  involuntary_job_loss: {
    label: 'Involuntary Termination of Employment or Insolvency',
    statutoryBasis: 'ITA s. 6503.1(g)'
  },
  insolvency_bankruptcy: {
    label: 'Bankruptcy, Insolvency, or Foreclosure',
    statutoryBasis: 'ITA s. 6503.1(h)'
  },
  involuntary_destruction: {
    label: 'Natural Disaster or Involuntary Expropriation',
    statutoryBasis: 'ITA s. 6503.1(i)'
  }
});

/**
 * Diagnostic evaluation of residential real estate assignment sales, anti-flipping taxation,
 * GST/HST liability on assignment profit, and Tarion delayed closing rights.
 */
export function evaluateRealEstateAssignment({
  province = 'ON',
  originalPurchasePriceCad = 600000,
  assignmentSalePriceCad = 720000,
  depositPaidToBuilderCad = 120000,
  agreementDate = '2025-11-01',
  assignmentDate = '2026-06-01',
  hasPrescribedLifeEvent = false,
  lifeEventCategory = null,
  relocationDistanceKm = 0,
  builderConsentFeeCad = 5000,
  legalFeesCad = 2500,
  realtorCommissionCad = 15000,
  marginalTaxRatePercent = 43.0,
  closingDelayedDays = 0,
  isTarionEnrolled = true,
  assignorName = 'Assignor',
  assigneeName = 'Assignee',
  propertyAddress = 'Unit 1204 - 55 Mercer St, Toronto, ON',
  assessmentDate = '2026-10-31'
} = {}) {
  const prov = boundedText(province, 'ON', 10).toUpperCase();
  const safeAssessmentDate = safeIsoDate(assessmentDate, '2026-10-31');
  const originalPrice = Math.max(1, Math.min(1000000000, Number(originalPurchasePriceCad) || 1));
  const assignPrice = Math.max(originalPrice, Math.min(1000000000, Number(assignmentSalePriceCad) || originalPrice));
  const deposit = Math.max(0, Math.min(1000000000, Number(depositPaidToBuilderCad) || 0));

  const safeAgrDate = safeIsoDate(agreementDate, '2025-11-01');
  const safeAsgnDate = safeIsoDate(assignmentDate, '2026-06-01');

  const hasLifeEvent = Boolean(hasPrescribedLifeEvent);
  const lifeKey = lifeEventCategory ? String(lifeEventCategory).trim().toLowerCase() : null;
  const relocDistance = Math.max(0, Math.min(100000, Number(relocationDistanceKm) || 0));

  const builderFee = Math.max(0, Math.min(100000000, Number(builderConsentFeeCad) || 0));
  const legalFees = Math.max(0, Math.min(100000000, Number(legalFeesCad) || 0));
  const commission = Math.max(0, Math.min(100000000, Number(realtorCommissionCad) || 0));
  const marginalTax = Math.max(0, Math.min(100, Number(marginalTaxRatePercent) || 43.0));
  const delayDays = Math.max(0, Math.min(3650, Number(closingDelayedDays) || 0));
  const tarion = Boolean(isTarionEnrolled);

  const safeAssignor = boundedText(assignorName, 'Assignor', 100);
  const safeAssignee = boundedText(assigneeName, 'Assignee', 100);
  const safeAddress = boundedText(propertyAddress, 'Residential Unit', 150);

  // 1. Calculate Assignment Profit
  const grossAssignmentLiftCad = Math.max(0, assignPrice - originalPrice);
  const totalDeductibleExpensesCad = Math.round((builderFee + legalFees + commission) * 100) / 100;
  const netAssignmentProfitCad = Math.max(0, Math.round((grossAssignmentLiftCad - totalDeductibleExpensesCad) * 100) / 100);

  // 2. Holding Period & Anti-Flipping Rule Audit (ITA s. 12(1)(z.7))
  let daysHeld = 0;
  const d1 = new Date(safeAgrDate).getTime();
  const d2 = new Date(safeAsgnDate).getTime();
  if (!Number.isNaN(d1) && !Number.isNaN(d2)) {
    daysHeld = Math.max(0, Math.floor((d2 - d1) / (1000 * 60 * 60 * 24)));
  }

  let antiFlippingApplies = false;
  let exemptionReason = null;

  if (daysHeld < ASSIGNMENT_CONSTANTS.ANTI_FLIPPING_HOLDING_DAYS) {
    // Check life event exemption
    if (hasLifeEvent && lifeKey && PRESCRIBED_LIFE_EVENT_EXEMPTIONS[lifeKey]) {
      if (lifeKey === 'employment_relocation' && relocDistance < ASSIGNMENT_CONSTANTS.RELOCATION_MINIMUM_DISTANCE_KM) {
        antiFlippingApplies = true;
        exemptionReason = `Relocation distance (${relocDistance} km) is below the statutory 40 km minimum under ITA s. 6503.1(f). Anti-flipping applies.`;
      } else {
        antiFlippingApplies = false;
        exemptionReason = `Exempt from anti-flipping under ${PRESCRIBED_LIFE_EVENT_EXEMPTIONS[lifeKey].statutoryBasis}: ${PRESCRIBED_LIFE_EVENT_EXEMPTIONS[lifeKey].label}.`;
      }
    } else {
      antiFlippingApplies = true;
      exemptionReason = `Property assignment occurred within ${daysHeld} days (< 365 days). Anti-flipping rule applies under ITA s. 12(1)(z.7).`;
    }
  } else {
    antiFlippingApplies = false;
    exemptionReason = `Held for ${daysHeld} days (>= 365 days). Standard capital gains treatment or inventory rules apply based on intention.`;
  }

  // 3. Tax Treatment (Business Income vs Capital Gain)
  let taxableInclusionPercentage = 100.0;
  let estimatedIncomeTaxCad = 0;

  if (antiFlippingApplies) {
    taxableInclusionPercentage = 100.0;
    // 100% of profit treated as business income; zero PRE
    estimatedIncomeTaxCad = Math.round((netAssignmentProfitCad * (marginalTax / 100)) * 100) / 100;
  } else {
    taxableInclusionPercentage = 50.0;
    // Standard capital gains 50% inclusion
    const taxableCapitalGain = netAssignmentProfitCad * 0.5;
    estimatedIncomeTaxCad = Math.round((taxableCapitalGain * (marginalTax / 100)) * 100) / 100;
  }

  // 4. GST/HST on Assignment Sale (ETA s. 165 - May 7, 2022 Rule)
  let hstRate = ASSIGNMENT_CONSTANTS.GST_RATE_PERCENT;
  if (prov === 'ON') hstRate = ASSIGNMENT_CONSTANTS.ONTARIO_HST_RATE_PERCENT;

  // Under the May 7, 2022 rules, GST/HST applies to the assignment fee / profit portion
  const estimatedGstHstOnLiftCad = Math.round((grossAssignmentLiftCad * (hstRate / 100)) * 100) / 100;

  // Total Net Cash to Assignor
  // Cash received from assignee = Deposit reimbursement + Gross Lift
  // Less expenses, less GST/HST remittable, less estimated income tax
  const totalCashFromAssigneeCad = Math.round((deposit + grossAssignmentLiftCad) * 100) / 100;
  const netRetainedCashCad = Math.round((totalCashFromAssigneeCad - totalDeductibleExpensesCad - estimatedGstHstOnLiftCad - estimatedIncomeTaxCad) * 100) / 100;

  // 5. Tarion Delayed Closing Compensation (Ontario)
  let tarionCompensationCad = 0;
  let tarionEligible = false;

  if (prov === 'ON' && tarion && delayDays > 0) {
    tarionEligible = true;
    tarionCompensationCad = Math.min(
      ASSIGNMENT_CONSTANTS.TARION_MAX_DELAY_COMPENSATION_CAD,
      delayDays * ASSIGNMENT_CONSTANTS.TARION_DAILY_DELAY_COMPENSATION_CAD
    );
  }

  const taxNotes = [];
  const riskWarnings = [];

  if (antiFlippingApplies) {
    taxNotes.push(`ANTI-FLIPPING PENALTY: Under ITA s. 12(1)(z.7), the full net assignment profit ($${netAssignmentProfitCad} CAD) is deemed business income. The 50% capital gains deduction and the Principal Residence Exemption are completely disallowed.`);
  } else {
    taxNotes.push(`STANDARD TAXATION: Treated as capital gain (50% taxable inclusion: $${netAssignmentProfitCad * 0.5} CAD) subject to CRA intention audit.`);
  }

  taxNotes.push(`GST/HST LIABILITY (ETA s. 165): Assignment sales of newly constructed residential property are subject to ${hstRate}% GST/HST on the assignment lift (estimated $${estimatedGstHstOnLiftCad} CAD). Ensure the assignment agreement explicitly stipulates whether the assignment price is 'inclusive' or 'in addition to' GST/HST.`);

  riskWarnings.push('BUILDER APPROVAL CONTINGENCY: Most builder agreements require written consent for an assignment. Assigning without consent constitutes an incurable default allowing the builder to terminate the agreement and forfeit deposits.');
  riskWarnings.push('FOREIGN BUYER BAN RESTRICTION: The assignee must be an eligible Canadian citizen, permanent resident, or qualifying temporary resident under the Prohibition on the Purchase of Residential Property by Non-Canadians Act.');

  return {
    assessmentDate: safeAssessmentDate,
    assignorName: safeAssignor,
    assigneeName: safeAssignee,
    propertyAddress: safeAddress,
    province: prov,
    financialSummary: {
      originalPurchasePriceCad: originalPrice,
      assignmentSalePriceCad: assignPrice,
      depositReimbursementCad: deposit,
      grossAssignmentLiftCad,
      totalDeductibleExpensesCad,
      netAssignmentProfitCad,
      totalCashReceivedFromAssigneeCad: totalCashFromAssigneeCad,
      netRetainedCashCad
    },
    antiFlippingAudit: {
      daysHeld,
      antiFlippingApplies,
      taxableInclusionPercentage,
      exemptionReason,
      hasLifeEventClaimed: hasLifeEvent
    },
    taxLiabilityEstimate: {
      estimatedIncomeTaxCad,
      gstHstRatePercent: hstRate,
      estimatedGstHstOnLiftCad,
      totalTaxAndHstCad: Math.round((estimatedIncomeTaxCad + estimatedGstHstOnLiftCad) * 100) / 100
    },
    tarionWarranty: {
      isTarionEnrolled: tarion,
      closingDelayedDays: delayDays,
      tarionEligible,
      dailyCompensationRateCad: ASSIGNMENT_CONSTANTS.TARION_DAILY_DELAY_COMPENSATION_CAD,
      estimatedDelayCompensationCad: tarionCompensationCad
    },
    taxNotes,
    riskWarnings
  };
}

/**
 * Generates an executive Real Estate Assignment Closing & Tax Reconciliation Statement.
 */
export function generateAssignmentStatement({
  assignorName = 'Assignor',
  assigneeName = 'Assignee',
  propertyAddress = 'Unit 1204 - 55 Mercer St, Toronto, ON',
  netProfitCad = 100000,
  gstHstCad = 15600,
  antiFlippingApplies = true
} = {}) {
  const assignor = boundedText(assignorName, 'Assignor', 100);
  const assignee = boundedText(assigneeName, 'Assignee', 100);
  const address = boundedText(propertyAddress, 'Unit', 150);
  const profit = Math.max(0, Number(netProfitCad) || 0);
  const hst = Math.max(0, Number(gstHstCad) || 0);

  return [
    '================================================================================',
    'REAL ESTATE ASSIGNMENT SALE TAX & CLOSING RECONCILIATION STATEMENT',
    `Property: ${address} | Assignor: ${assignor} | Assignee: ${assignee}`,
    '================================================================================',
    '',
    '1. STATUTORY TAXATION DETERMINATION (CRA ITA s. 12(1)(z.7)):',
    antiFlippingApplies
      ? '   [APPLIES] Anti-Flipping Rule Active (< 365 Days). Full Amount Deemed Business Income.'
      : '   [EXEMPT] Held >= 365 Days or Prescribed Life Event. 50% Capital Gains Inclusion.',
    `   - Net Profit Calculated: $${profit} CAD`,
    '',
    '2. EXCISE TAX ACT (ETA s. 165) GST/HST DETERMINATION:',
    `   - Estimated GST/HST on Assignment Lift: $${hst} CAD`,
    '   - Contract Clause Precaution: Verify that agreement clearly defines GST/HST payment obligation.',
    '',
    '3. MANDATORY PRE-CLOSING CLEARANCES:',
    '   [ ] Formal Builder Consent Letter obtained and consent fee paid.',
    '   [ ] Assignee status verified under Foreign Homebuyer Ban legislation.',
    '   [ ] Tarion Statement of Critical Dates reviewed for delayed closing compensation credits.',
    '================================================================================'
  ].join('\n');
}
