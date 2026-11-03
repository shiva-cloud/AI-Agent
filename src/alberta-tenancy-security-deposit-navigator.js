/**
 * Alberta Residential Tenancies Act (RTA) Security Deposit & RTDRS Defense Engine
 *
 * Implements statutory assessment under:
 * - Alberta Residential Tenancies Act (RSA 2000 c. R-17) ss. 19, 43, 46, 47
 * - Residential Tenancies Ministerial Regulation (Alta. Reg. 211/2004) ss. 4–5 (Inspection Reports)
 * - Security Deposit Interest Rate Regulation (Alta. Reg. 195/2004)
 * - Service Alberta Consumer Contact Centre & RTDRS Rules of Practice
 *
 * Key Statutory Rules:
 * - Security Deposit Cap (RTA s. 46(1)): A landlord cannot ask for or accept a security deposit
 *   that exceeds one month's rent. Any excess is an illegal deposit.
 * - Non-Refundable Fee Ban (RTA s. 46(2)): Any fee charged to secure a tenancy (including "non-refundable
 *   pet fees", "cleaning deposits", or "move-in fees") is deemed part of the security deposit under
 *   Alberta law. If the combined total exceeds one month's rent, it is illegal.
 * - Trust Account & Interest (RTA s. 46(6)–(7)): Landlord must deposit funds in an interest-bearing
 *   trust account in a financial institution in Alberta within 2 banking days and pay prescribed interest.
 * - Mandatory Inspection Reports (RTA s. 19):
 *   (1) Both move-in and move-out inspections must be conducted within 1 week of possession/vacating.
 *   (2) Landlord must offer two distinct inspection times on different days.
 *   (3) Tenant must be given a signed copy of the completed inspection report immediately.
 * - Statutory Forfeiture of Deductions (RTA s. 19(4)):
 *   IF THE LANDLORD FAILS TO CONDUCT A MOVE-IN OR MOVE-OUT INSPECTION, OR FAILS TO PROVIDE A SIGNED
 *   COPY OF THE INSPECTION REPORT, THE LANDLORD FORFEITS ALL LEGAL RIGHTS TO MAKE DEDUCTIONS FROM
 *   THE SECURITY DEPOSIT FOR PROPERTY DAMAGE OR CLEANING.
 * - 10-Day Refund Deadline (RTA s. 46(4)): The landlord must deliver the full refund or an itemized
 *   statement of account with remaining funds within 10 days of the tenant vacating.
 * - RTDRS Hearing: Disputes are heard by the Residential Tenancy Dispute Resolution Service ($75 filing fee),
 *   which issues binding court-enforceable orders.
 */

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const ALBERTA_RTA_CONSTANTS = Object.freeze({
  MAX_SECURITY_DEPOSIT_RENT_MONTHS: 1,
  INSPECTION_WINDOW_DAYS: 7,
  DEPOSIT_REFUND_DEADLINE_DAYS: 10,
  RTDRS_FILING_FEE_CAD: 75.0,
  TRUST_ACCOUNT_DEPOSIT_DEADLINE_BANKING_DAYS: 2
});

/**
 * Evaluates the statutory validity of security deposit charges, deductions, and inspection compliance in Alberta.
 *
 * @param {Object} options
 * @param {number} [options.monthlyRentCad=1800] - Agreed monthly rent in CAD
 * @param {number} [options.securityDepositPaidCad=1800] - Security deposit amount paid to landlord
 * @param {number} [options.additionalNonRefundableFeesCad=0] - Non-refundable pet/cleaning fees demanded
 * @param {boolean} [options.landlordConductedMoveInInspection=true] - Move-in inspection completed
 * @param {boolean} [options.tenantReceivedSignedMoveInReport=true] - Tenant provided signed inspection report
 * @param {boolean} [options.landlordConductedMoveOutInspection=true] - Move-out inspection completed
 * @param {number} [options.daysSinceTenancyEnded=12] - Days elapsed since tenant vacated
 * @param {number} [options.deductionsClaimedCad=500] - Amount withheld by landlord for repairs/cleaning
 * @param {string} [options.deductionsReason='normal wear and tear painting and carpet cleaning'] - Explanation
 * @param {boolean} [options.tenantProvidedForwardingAddress=true] - Tenant gave written forwarding address
 * @param {string} [options.tenantName='Alberta Tenant'] - Tenant name
 * @param {string} [options.landlordName='Landlord / Property Manager'] - Landlord name
 * @param {string} [options.rentalUnitAddress='102-10405 Jasper Ave, Edmonton, AB'] - Property address
 * @param {string} [options.assessmentDate=todayIso()] - Date of assessment
 * @returns {Object} Comprehensive Alberta security deposit defense diagnostic
 */
export function evaluateAlbertaSecurityDeposit(options = {}) {
  const rent = Number.isFinite(Number(options.monthlyRentCad)) ? Math.max(1, Number(options.monthlyRentCad)) : 1800.0;
  const depositPaid = Number.isFinite(Number(options.securityDepositPaidCad)) ? Math.max(0, Number(options.securityDepositPaidCad)) : 1800.0;
  const nonRefFees = Number.isFinite(Number(options.additionalNonRefundableFeesCad)) ? Math.max(0, Number(options.additionalNonRefundableFeesCad)) : 0;
  const moveInInspection = Boolean(options.landlordConductedMoveInInspection);
  const signedReport = Boolean(options.tenantReceivedSignedMoveInReport);
  const moveOutInspection = Boolean(options.landlordConductedMoveOutInspection);
  const daysVacated = Number.isFinite(Number(options.daysSinceTenancyEnded)) ? Math.max(0, Math.floor(Number(options.daysSinceTenancyEnded))) : 0;
  const deductions = Number.isFinite(Number(options.deductionsClaimedCad)) ? Math.max(0, Number(options.deductionsClaimedCad)) : 0;
  const reason = boundedText(options.deductionsReason, 'General repairs', 200);
  const forwardingAddress = options.tenantProvidedForwardingAddress !== false;
  const tenant = boundedText(options.tenantName, 'Alberta Tenant', 120);
  const landlord = boundedText(options.landlordName, 'Landlord / Property Manager', 120);
  const unit = boundedText(options.rentalUnitAddress, 'Alberta Rental Unit', 150);
  const assessDate = safeIsoDate(options.assessmentDate, todayIso());

  const violations = [];
  const statutoryProtections = [];
  const actionPlan = [];
  const riskWarnings = [];

  // 1. Audit Deposit Cap and Non-Refundable Fees under RTA s. 46
  const totalDepositAndFeesPaid = depositPaid + nonRefFees;
  const maxAllowableDeposit = rent * ALBERTA_RTA_CONSTANTS.MAX_SECURITY_DEPOSIT_RENT_MONTHS;
  let overchargedDepositCad = 0;

  if (totalDepositAndFeesPaid > maxAllowableDeposit) {
    overchargedDepositCad = Number((totalDepositAndFeesPaid - maxAllowableDeposit).toFixed(2));
    violations.push(`Unlawful excess deposit: Landlord accepted $${totalDepositAndFeesPaid.toFixed(2)} CAD (Rent is $${rent.toFixed(2)}). Under Alberta RTA s. 46(1), security deposits cannot exceed 1 month's rent.`);
  }

  if (nonRefFees > 0) {
    violations.push(`Unlawful non-refundable fee: Landlord charged $${nonRefFees.toFixed(2)} in fees. Under RTA s. 46(2), landlords cannot charge non-refundable fees. All fees are legally considered security deposits.`);
    statutoryProtections.push('Alberta RTA s. 46(2): Non-refundable pet or move-in fees are deemed part of the refundable security deposit.');
  }

  // 2. Audit Move-In / Move-Out Inspection Bar (RTA s. 19(4))
  let landlordForfeitedDeductionRights = false;
  if (!moveInInspection || !signedReport || !moveOutInspection) {
    landlordForfeitedDeductionRights = true;
    violations.push('STATUTORY FORFEITURE OF DEDUCTIONS: Landlord failed to satisfy RTA s. 19 inspection requirements (missing move-in inspection, missing signed report, or missing move-out inspection). Under RTA s. 19(4), landlord has legally forfeited all rights to make deductions from the security deposit.');
    statutoryProtections.push('Alberta RTA s. 19(4): If a landlord does not complete the inspection reports and give the tenant a signed copy, the landlord CANNOT keep any part of the security deposit for repairs or cleaning.');
  }

  // 3. Normal Wear and Tear Protection
  const isWearAndTear = /\b(?:normal wear|wear and tear|carpet cleaning|paint(?:ing)?|scuffs?|nail holes?)\b/i.test(reason);
  if (isWearAndTear && !landlordForfeitedDeductionRights) {
    violations.push(`Unlawful wear-and-tear deduction: Landlord deducted $${deductions.toFixed(2)} for "${reason}". Under Alberta RTA s. 46(5), landlords cannot deduct for reasonable wear and tear.`);
    statutoryProtections.push('Alberta RTA s. 46(5): Tenants are not liable for normal deterioration resulting from reasonable use of the premises.');
  }

  // 4. Audit 10-Day Delivery Deadline under RTA s. 46(4)
  let isOverdue = false;
  if (daysVacated > ALBERTA_RTA_CONSTANTS.DEPOSIT_REFUND_DEADLINE_DAYS) {
    isOverdue = true;
    violations.push(`Overdue refund: ${daysVacated} days have passed since move-out. Alberta RTA s. 46(4) mandates refund delivery within 10 days.`);
  }

  // 5. Calculate Total Statutory Refund Due
  let illegalDeductionsCad = 0;
  if (landlordForfeitedDeductionRights || isWearAndTear) {
    illegalDeductionsCad = deductions;
  }
  const totalRefundOwedToTenantCad = Number((depositPaid + nonRefFees - (landlordForfeitedDeductionRights ? 0 : (isWearAndTear ? 0 : deductions))).toFixed(2));

  // 6. Action Plan & Enforcement via RTDRS
  if (!forwardingAddress) {
    riskWarnings.push('FORWARDING ADDRESS NOT PROVIDED: Provide your written forwarding address or email for e-transfer immediately to start the 10-day statutory clock.');
    actionPlan.push('Send formal written notice with forwarding mailing address or e-transfer email.');
  } else {
    actionPlan.push(`Send formal demand letter to landlord requesting immediate refund of $${totalRefundOwedToTenantCad.toFixed(2)} CAD.`);
    if (landlordForfeitedDeductionRights) {
      actionPlan.push('Cite Alberta RTA s. 19(4) confirming landlord\'s statutory forfeiture of all deduction rights due to defective inspection reports.');
    }
    if (isOverdue || illegalDeductionsCad > 0 || overchargedDepositCad > 0) {
      actionPlan.push('If landlord fails to refund within 7 days, file an application with the Residential Tenancy Dispute Resolution Service (RTDRS, $75 filing fee) for a binding recovery order.');
    }
  }

  return {
    tenantName: tenant,
    landlordName: landlord,
    rentalUnitAddress: unit,
    assessmentDate: assessDate,
    depositAudit: {
      monthlyRentCad: rent,
      securityDepositPaidCad: depositPaid,
      additionalNonRefundableFeesCad: nonRefFees,
      totalDepositAndFeesPaid,
      maxAllowableDepositCad: maxAllowableDeposit,
      overchargedDepositCad,
      isDepositOvercharged: overchargedDepositCad > 0
    },
    inspectionCompliance: {
      landlordConductedMoveInInspection: moveInInspection,
      tenantReceivedSignedMoveInReport: signedReport,
      landlordConductedMoveOutInspection: moveOutInspection,
      landlordForfeitedDeductionRights,
      statutoryInspectionBarApplies: landlordForfeitedDeductionRights
    },
    refundAssessment: {
      daysSinceTenancyEnded: daysVacated,
      statutoryRefundDeadlineDays: ALBERTA_RTA_CONSTANTS.DEPOSIT_REFUND_DEADLINE_DAYS,
      isRefundOverdue: isOverdue,
      deductionsClaimedCad: deductions,
      deductionsReason: reason,
      illegalDeductionsCad,
      totalRefundOwedToTenantCad
    },
    statutoryViolations: violations,
    statutoryProtections,
    riskWarnings,
    actionPlan
  };
}
