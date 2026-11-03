/**
 * Saskatchewan Residential Tenancy Security Deposit Return Navigator
 *
 * Audits one-month maximum deposit caps, 7-business-day mandatory refund/claim timelines,
 * Form 13 Notice of Landlord Claim requirements, statutory forfeiture for late claims,
 * and Office of Residential Tenancies (ORT) dispute remedies under The Residential
 * Tenancies Act, 2006, SS 2006, c. R-22.0001 (Saskatchewan), ss. 13–15.
 *
 * Pure ES module — zero runtime npm dependencies.
 */

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const SASKATCHEWAN_DEPOSIT_CONSTANTS = Object.freeze({
  STATUTORY_AUTHORITY: 'The Residential Tenancies Act, 2006, SS 2006, c. R-22.0001, ss. 13-15',
  MAX_DEPOSIT_MONTHS_RENT: 1, // s. 13(1)
  MANDATORY_ACTION_BUSINESS_DAYS: 7, // s. 14(1)-(2)
  PRESCRIBED_LANDLORD_CLAIM_FORM: 'Form 13 (Notice of Landlord Claim for Security Deposit)',
  PRESCRIBED_TENANT_DISPUTE_FORM: 'Form 7 (Tenant Application for Dispute Resolution)',
  ORT_HEARING_FEE_CAD: 50
});

/**
 * Audits Saskatchewan security deposit compliance, 7-day forfeiture, and ORT refund orders.
 *
 * @param {Object} params
 * @param {number} [params.monthlyRentCad=1500] - Lawful monthly rent
 * @param {number} [params.securityDepositPaidCad=1500] - Security deposit paid by tenant
 * @param {boolean} [params.tenancyEnded=true] - Whether tenant has surrendered vacant possession
 * @param {number} [params.businessDaysSinceTenancyEnded=10] - Business days elapsed since end of tenancy
 * @param {boolean} [params.landlordRefundedFullDeposit=false] - Whether landlord returned deposit in full
 * @param {number} [params.amountActuallyRefundedCad=0] - Dollar amount refunded by landlord
 * @param {boolean} [params.landlordServedPrescribedForm13=false] - Whether landlord served official Form 13 within 7 business days
 * @param {boolean} [params.tenantSignedWrittenDeductionConsent=false] - Whether tenant consented in writing to deductions
 * @param {number} [params.tenantAgreedDeductionAmountCad=0] - Amount of deductions agreed in writing
 * @returns {Object} Comprehensive Saskatchewan deposit audit and ORT refund determination
 */
export function evaluateSaskatchewanSecurityDepositReturn({
  monthlyRentCad = 1500,
  securityDepositPaidCad = 1500,
  tenancyEnded = true,
  businessDaysSinceTenancyEnded = 10,
  landlordRefundedFullDeposit = false,
  amountActuallyRefundedCad = 0,
  landlordServedPrescribedForm13 = false,
  tenantSignedWrittenDeductionConsent = false,
  tenantAgreedDeductionAmountCad = 0,
  landlordName = 'Landlord',
  rentalAddress = 'Rental Property',
  tenantName = 'Tenant',
  assessmentDate = todayIso()
} = {}) {
  const cleanLandlord = boundedText(landlordName, 'Landlord');
  const cleanRentalAddress = boundedText(rentalAddress, 'Rental Property');
  const cleanTenant = boundedText(tenantName, 'Tenant', 120);
  const safeAssessmentDate = safeIsoDate(assessmentDate, todayIso());
  const rent = Number.isFinite(Number(monthlyRentCad)) ? Math.max(0, Number(monthlyRentCad)) : 0;
  const depositPaid = Number.isFinite(Number(securityDepositPaidCad)) ? Math.max(0, Number(securityDepositPaidCad)) : 0;
  const daysElapsed = Number.isFinite(Number(businessDaysSinceTenancyEnded)) ? Math.max(0, Math.floor(Number(businessDaysSinceTenancyEnded))) : 0;
  const refunded = Number.isFinite(Number(amountActuallyRefundedCad)) ? Math.max(0, Number(amountActuallyRefundedCad)) : 0;
  const agreedDeduction = tenantSignedWrittenDeductionConsent ? (Number.isFinite(Number(tenantAgreedDeductionAmountCad)) ? Math.max(0, Number(tenantAgreedDeductionAmountCad)) : 0) : 0;

  const statutoryViolations = [];
  const riskWarnings = [];
  const actionableRemedies = [];

  // 1. Initial Deposit Cap Audit (s. 13(1))
  const excessDepositCad = Math.max(0, depositPaid - rent);
  if (excessDepositCad > 0) {
    statutoryViolations.push({
      rule: 'SECURITY_DEPOSIT_EXCEEDS_ONE_MONTH_RENT',
      statute: 'The Residential Tenancies Act, 2006 s. 13(1)',
      finding: `Deposit of $${depositPaid.toFixed(2)} exceeds lawful monthly rent of $${rent.toFixed(2)} by $${excessDepositCad.toFixed(2)}.`
    });
    actionableRemedies.push({
      action: 'RECOVER_EXCESS_SECURITY_DEPOSIT',
      remedyDescription: `Demand immediate refund of $${excessDepositCad.toFixed(2)} overpayment or deduct from rent.`
    });
  }

  // 2. 7-Business-Day Statutory Timeline & Forfeiture Audit (s. 14)
  const isPast7BusinessDays = daysElapsed > SASKATCHEWAN_DEPOSIT_CONSTANTS.MANDATORY_ACTION_BUSINESS_DAYS;
  let landlordForfeitedRightToClaim = false;
  let balanceOwedToTenantCad = 0;

  if (tenancyEnded && !landlordRefundedFullDeposit) {
    if (isPast7BusinessDays && !landlordServedPrescribedForm13 && !tenantSignedWrittenDeductionConsent) {
      landlordForfeitedRightToClaim = true;
      balanceOwedToTenantCad = Math.max(0, depositPaid - refunded);

      statutoryViolations.push({
        rule: 'LANDLORD_STATUTORY_FORFEITURE_LATE_CLAIM',
        statute: 'The Residential Tenancies Act, 2006 s. 14(2)',
        finding: `Landlord failed to serve Form 13 within 7 business days (${daysElapsed} business days elapsed). Landlord forfeits all legal right to retain any portion of the deposit.`
      });
      actionableRemedies.push({
        action: 'FILE_ORT_FORM_7_APPLICATION_FOR_FULL_REFUND',
        remedyDescription: `File Form 7 with the Saskatchewan Office of Residential Tenancies (ORT) to obtain an order for immediate refund of $${balanceOwedToTenantCad.toFixed(2)} plus $50 hearing fee.`
      });
    } else if (landlordServedPrescribedForm13) {
      balanceOwedToTenantCad = Math.max(0, depositPaid - agreedDeduction - refunded);
      riskWarnings.push({
        warningType: 'FORM_13_DISPUTE_PROCEEDING',
        description: 'Landlord served Form 13 claiming deposit. The ORT hearing officer will adjudicate the validity of claimed physical damages or arrears.'
      });
    } else {
      balanceOwedToTenantCad = Math.max(0, depositPaid - agreedDeduction - refunded);
    }
  }

  let complianceStatus = 'COMPLIANT_DEPOSIT_ADMINISTRATION';
  let legalVerdict = 'Security deposit administration complies with Saskatchewan residential tenancy laws.';

  if (landlordForfeitedRightToClaim) {
    complianceStatus = 'LANDLORD_STATUTORY_FORFEITURE_CONFIRMED';
    legalVerdict = `Landlord missed 7-business-day deadline without Form 13. All claim rights forfeited; tenant is entitled to immediate full refund of $${balanceOwedToTenantCad.toFixed(2)}.`;
  } else if (statutoryViolations.length > 0) {
    complianceStatus = 'STATUTORY_DEPOSIT_CAP_VIOLATION';
    legalVerdict = `Landlord breached deposit cap rules. Overcharge of $${excessDepositCad.toFixed(2)} is recoverable.`;
  }

  return {
    jurisdiction: 'SASKATCHEWAN_CANADA',
    tenantName: cleanTenant,
    landlordName: cleanLandlord,
    rentalAddress: cleanRentalAddress,
    assessmentDate: safeAssessmentDate,
    tenancyEnded,
    businessDaysSinceTenancyEnded: daysElapsed,
    isPast7BusinessDays,
    landlordForfeitedRightToClaim,
    complianceStatus,
    legalVerdict,
    financialSummary: {
      monthlyRentCad: rent,
      securityDepositPaidCad: depositPaid,
      excessDepositPaidCad: excessDepositCad,
      amountActuallyRefundedCad: refunded,
      tenantAgreedDeductionAmountCad: agreedDeduction,
      balanceOwedToTenantCad
    },
    statutoryViolations,
    riskWarnings,
    actionableRemedies,
    statutoryCitations: [
      'The Residential Tenancies Act, 2006, SS 2006, c. R-22.0001, ss. 13 (Security deposit limits), 14 (Return of security deposit), 15 (Disputes)',
      'Office of Residential Tenancies (ORT) Rules of Procedure - Security Deposit Adjudication'
    ]
  };
}