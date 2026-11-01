/**
 * British Columbia Residential Tenancy Security Deposit Return & Double Penalty Navigator
 *
 * Audits the statutory 15-day return rule, written forwarding address delivery,
 * pet deposit segregation, and mandatory DOUBLE deposit penalty under British Columbia's
 * Residential Tenancy Act, SBC 2002, c. 78 (BC RTA), ss. 38 & 39, and Residential
 * Tenancy Branch (RTB) Dispute Resolution procedures.
 *
 * Pure ES module — zero runtime npm dependencies.
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const BC_DEPOSIT_PENALTY_CONSTANTS = Object.freeze({
  STATUTORY_RETURN_TIMELINE_DAYS: 15, // s. 38(1)
  FORWARDING_ADDRESS_LIMITATION_YEARS: 1, // s. 39
  STATUTORY_PENALTY_MULTIPLIER: 2, // s. 38(6)
  PET_DEPOSIT_SEGREGATION_MANDATORY: true,
  STATUTORY_AUTHORITY: 'Residential Tenancy Act, SBC 2002, c. 78, ss. 38, 39'
});

/**
 * Audits BC security and pet damage deposit returns and determines double penalty liability.
 *
 * @param {Object} params
 * @param {number} [params.securityDepositPaidCad=1000] - Security deposit paid at start of tenancy
 * @param {number} [params.petDepositPaidCad=0] - Pet damage deposit paid at start of tenancy
 * @param {boolean} [params.tenancyHasEnded=true] - Whether tenant has fully vacated premises
 * @param {boolean} [params.forwardingAddressProvidedInWriting=true] - Whether tenant delivered forwarding address in writing
 * @param {number} [params.daysSinceForwardingAddressReceived=25] - Calendar days elapsed since landlord received forwarding address
 * @param {boolean} [params.tenantSignedWrittenDeductionConsent=false] - Whether tenant agreed in writing to deductions
 * @param {number} [params.tenantAgreedDeductionAmountCad=0] - Amount of deductions agreed to in writing
 * @param {boolean} [params.landlordFiledRtbClaimWithin15Days=false] - Whether landlord submitted RTB dispute claim within 15 days
 * @param {number} [params.landlordRefundedAmountCad=0] - Amount landlord actually refunded to tenant
 * @returns {Object} Comprehensive deposit audit, doubling penalty determination, and RTB monetary claim calculation
 */
export function evaluateBcSecurityDepositDoublePenalty(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    tenantName = 'Tenant',
    securityDepositPaidCad = 1000,
    petDepositPaidCad = 0,
    tenancyHasEnded = true,
    forwardingAddressProvidedInWriting = true,
    daysSinceForwardingAddressReceived = 25,
    tenantSignedWrittenDeductionConsent = false,
    tenantAgreedDeductionAmountCad = 0,
    landlordFiledRtbClaimWithin15Days = false,
    landlordRefundedAmountCad = 0,
    landlordName = 'Landlord',
    rentalAddress = 'Rental Property',
    forwardingAddress = 'Forwarding Address',
    assessmentDate = '2026-10-31'
  } = safeParams;
  const cleanTenantName = boundedText(tenantName, 'Tenant', 100);
  const cleanLandlord = boundedText(landlordName, 'Landlord');
  const cleanRentalAddress = boundedText(rentalAddress, 'Rental Property');
  const cleanForwardingAddress = boundedText(forwardingAddress, 'Forwarding Address');
  const cleanAssessmentDate = safeIsoDate(assessmentDate, '2026-10-31');
  const secDeposit = Number.isFinite(Number(securityDepositPaidCad)) ? Math.max(0, Math.min(100000, Number(securityDepositPaidCad))) : 1000;
  const petDeposit = Number.isFinite(Number(petDepositPaidCad)) ? Math.max(0, Math.min(100000, Number(petDepositPaidCad))) : 0;
  const daysElapsed = Number.isFinite(Number(daysSinceForwardingAddressReceived)) ? Math.max(0, Math.min(3650, Math.floor(Number(daysSinceForwardingAddressReceived)))) : 25;
  const agreedDeduction = tenantSignedWrittenDeductionConsent && Number.isFinite(Number(tenantAgreedDeductionAmountCad)) ? Math.max(0, Math.min(100000, Number(tenantAgreedDeductionAmountCad))) : 0;
  const refunded = Number.isFinite(Number(landlordRefundedAmountCad)) ? Math.max(0, Math.min(100000, Number(landlordRefundedAmountCad))) : 0;

  const totalDepositsPaidCad = Math.round((secDeposit + petDeposit) * 100) / 100;

  const statutoryViolations = [];
  const riskWarnings = [];
  const actionableRemedies = [];

  // 1. Prerequisites (Tenancy ended + written forwarding address)
  if (!tenancyHasEnded) {
    riskWarnings.push({
      warningType: 'TENANCY_NOT_YET_CONCLUDED',
      description: 'The 15-day statutory clock does not commence until the tenant has fully vacated and delivered vacant possession.'
    });
  }

  if (!forwardingAddressProvidedInWriting) {
    statutoryViolations.push({
      rule: 'NO_WRITTEN_FORWARDING_ADDRESS_SERVED',
      statute: 'Residential Tenancy Act ss. 38(1)(b), 39',
      finding: 'Landlord is under no statutory obligation to return deposit until tenant provides forwarding address in writing. If not provided within 1 year of tenancy end, deposit is forfeited.'
    });
    actionableRemedies.push({
      action: 'SERVE_WRITTEN_FORWARDING_ADDRESS_IMMEDIATELY',
      remedyDescription: 'Serve the landlord with RTB Form RTB-47 (Tenant Notice of Forwarding Address) via registered mail or in-person delivery with proof.'
    });
  }

  // 2. 15-Day Clock Audit & Double Penalty Trigger (s. 38(1), 38(6))
  const is15DaysExpired = daysElapsed > BC_DEPOSIT_PENALTY_CONSTANTS.STATUTORY_RETURN_TIMELINE_DAYS;
  const isCompliantLandlord = (refunded >= totalDepositsPaidCad - agreedDeduction) || landlordFiledRtbClaimWithin15Days;

  let isDoublePenaltyMandatory = false;
  let grossPenaltyOwedCad = totalDepositsPaidCad;
  let netMonetaryAwardOwedCad = Math.max(0, totalDepositsPaidCad - agreedDeduction - refunded);

  if (tenancyHasEnded && forwardingAddressProvidedInWriting && is15DaysExpired && !isCompliantLandlord) {
    isDoublePenaltyMandatory = true;
    statutoryViolations.push({
      rule: 'EXCEEDED_15_DAY_RETURN_WINDOW_MANDATORY_DOUBLE_PENALTY',
      statute: 'Residential Tenancy Act s. 38(6)',
      finding: `Landlord held deposits for ${daysElapsed} days without either returning funds or filing an RTB dispute. Section 38(6) strictly mandates doubling the deposits.`
    });

    // Doubling applies to original deposit: 2x total deposits minus lawful agreed deductions and partial refunds
    grossPenaltyOwedCad = Math.round(totalDepositsPaidCad * BC_DEPOSIT_PENALTY_CONSTANTS.STATUTORY_PENALTY_MULTIPLIER * 100) / 100;
    netMonetaryAwardOwedCad = Math.round((grossPenaltyOwedCad - agreedDeduction - refunded) * 100) / 100;

    actionableRemedies.push({
      action: 'FILE_RTB_APPLICATION_FOR_DOUBLE_DEPOSIT',
      remedyDescription: `File a Dispute Resolution application with the RTB claiming $${netMonetaryAwardOwedCad.toFixed(2)} under s. 38(6) plus recovery of the $100 filing fee.`
    });
  }

  let complianceStatus = 'COMPLIANT_DEPOSIT_RETURN';
  let legalVerdict = 'Landlord has complied with deposit return guidelines or the 15-day statutory clock is currently ongoing.';

  if (isDoublePenaltyMandatory) {
    complianceStatus = 'MANDATORY_STATUTORY_DOUBLE_PENALTY_TRIGGERED';
    legalVerdict = `Landlord failed to return deposit within 15 days under BC RTA s. 38(1). Tenant is entitled by law to DOUBLE the deposit amount ($${netMonetaryAwardOwedCad.toFixed(2)} net owed).`;
  } else if (!forwardingAddressProvidedInWriting) {
    complianceStatus = 'PENDING_WRITTEN_FORWARDING_ADDRESS';
    legalVerdict = 'Tenant must serve written forwarding address before statutory return duties or penalties can be enforced.';
  }

  return {
    jurisdiction: 'BRITISH_COLUMBIA_CANADA',
    tenantName: cleanTenantName,
    landlordName: cleanLandlord,
    assessmentDate: cleanAssessmentDate,
    rentalAddress: cleanRentalAddress,
    forwardingAddress: cleanForwardingAddress,
    tenancyHasEnded,
    forwardingAddressProvidedInWriting,
    daysSinceForwardingAddressReceived: daysElapsed,
    is15DaysExpired,
    isDoublePenaltyMandatory,
    complianceStatus,
    legalVerdict,
    financialSummary: {
      securityDepositPaidCad: secDeposit,
      petDepositPaidCad: petDeposit,
      totalDepositsPaidCad,
      tenantAgreedDeductionAmountCad: agreedDeduction,
      landlordRefundedAmountCad: refunded,
      grossPenaltyOwedCad,
      netMonetaryAwardOwedCad
    },
    statutoryViolations,
    riskWarnings,
    actionableRemedies,
    statutoryCitations: [
      'Residential Tenancy Act, SBC 2002, c. 78, s. 38 (Return of security deposit and pet damage deposit)',
      'Residential Tenancy Act, SBC 2002, c. 78, s. 38(6) (Mandatory double deposit penalty)',
      'Residential Tenancy Policy Guideline 17 (Security Deposit and Set-off)'
    ]
  };
}