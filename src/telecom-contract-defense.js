// src/telecom-contract-defense.js
// CRTC Wireless Code & Telecom Consumer Contract Defense Engine.
// Enforces Telecom Regulatory Policy CRTC 2017-200 (The Wireless Code),
// Telecom Regulatory Policy CRTC 2019-269 (The Internet Code), and CCTS Procedural Standards.
// Pure ES module with zero npm dependencies.

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const TELECOM_CONSTANTS = {
  STATUTES: {
    WIRELESS_CODE: 'CRTC Wireless Code (Telecom Regulatory Policy CRTC 2017-200)',
    INTERNET_CODE: 'CRTC Internet Code (Telecom Regulatory Policy CRTC 2019-269)',
    CCTS_MANDATE: 'Commission for Complaints for Telecom-television Services (CCTS) Procedural Code'
  },
  STATUTORY_CAPS: {
    DATA_OVERAGE_CAD: 50.00, // Section E.1: $50 domestic data overage cap per billing cycle
    ROAMING_DATA_OVERAGE_CAD: 100.00, // Section E.2: $100 international data roaming cap
    DEVICE_UNLOCK_FEE_CAD: 0.00, // Section F.1: $0 mandatory device unlocking
    STANDARD_TRIAL_PERIOD_DAYS: 15, // Section G.4: 15-day cancellation trial without penalty
    DISABILITY_TRIAL_PERIOD_DAYS: 30, // Section G.4: 30-day trial for customers with disabilities
    MAX_CONTRACT_TERM_MONTHS: 24, // Section G.1: 24-month maximum device financing/contract term
    CCTS_COMPENSATION_MAX_CAD: 5000.00 // Maximum CCTS dispute compensation award
  }
};

/**
 * Assesses telecommunications contract disputes, illegal billing overages,
 * 15-day trial cancellation rights, and generates an official CCTS complaint escalation script.
 * 
 * @param {object} input
 * @returns {object} Telecom consumer rights assessment and formal complaint template
 */
export function assessTelecomDispute({
  providerName = 'Rogers', // 'Rogers', 'Bell', 'Telus', 'Fido', 'Koodo', 'Virgin', 'Freedom', 'Other'
  serviceType = 'mobile', // 'mobile', 'home_internet', 'bundled'
  contractType = 'postpaid_device_financing', // 'postpaid_device_financing', 'postpaid_byod', 'prepaid', 'fixed_internet'
  contractStartDate = '2026-10-15',
  daysSinceContractStart = 10,
  hasDisability = false,
  monthlyPlanCostCad = 65,
  deviceSubsidyTotalCad = 800,
  monthsIntoContract = 1,
  dataOverageChargedCad = 0,
  roamingChargedCad = 0,
  unlockedDeviceFeeChargedCad = 0,
  disputedChargesTotalCad = 120,
  providerUnilateralPriceIncrease = false,
  refusedTrialCancellation = false,
  deviceInOriginalCondition = true,
  customerName = 'Account Holder',
  assessmentDate = todayIso()
} = {}) {
  const safeCustomerName = boundedText(customerName, 'Account Holder', 120);
  const safeProviderName = boundedText(providerName, 'Rogers', 60);
  const safeServiceType = boundedText(serviceType, 'mobile', 40);
  const safeContractType = boundedText(contractType, 'postpaid_device_financing', 50);
  const safeAssessmentDate = safeIsoDate(assessmentDate, todayIso());
  const safeDaysSinceStart = Math.max(0, Math.min(3650, parseInt(daysSinceContractStart, 10) || 0));
  const safeMonths = Math.max(1, Math.min(120, parseInt(monthsIntoContract, 10) || 1));
  const safeDisputedTotal = Math.max(0, Math.min(1000000, Number(disputedChargesTotalCad) || 0));
  const safeDataOverage = Math.max(0, Math.min(100000, Number(dataOverageChargedCad) || 0));
  const safeRoaming = Math.max(0, Math.min(100000, Number(roamingChargedCad) || 0));
  const safeUnlockFee = Math.max(0, Math.min(100000, Number(unlockedDeviceFeeChargedCad) || 0));
  const safeDeviceSubsidy = Math.max(0, Math.min(100000, Number(deviceSubsidyTotalCad) || 0));

  // 1. Statutory 15-Day (or 30-Day) Trial Period Audit (Wireless Code Section G.4)
  const allowedTrialDays = hasDisability
    ? TELECOM_CONSTANTS.STATUTORY_CAPS.DISABILITY_TRIAL_PERIOD_DAYS
    : TELECOM_CONSTANTS.STATUTORY_CAPS.STANDARD_TRIAL_PERIOD_DAYS;

  const isWithinTrialPeriod = safeDaysSinceStart <= allowedTrialDays;
  let trialCancellationStatus = 'OUTSIDE_TRIAL_WINDOW';

  if (isWithinTrialPeriod) {
    if (deviceInOriginalCondition) {
      trialCancellationStatus = 'ABSOLUTE_RIGHT_TO_CANCEL_WITHOUT_PENALTY';
    } else {
      trialCancellationStatus = 'TRIAL_ELIGIBLE_DEVICE_DAMAGE_DISPUTE';
    }
  }

  // 2. Early Cancellation Fee (ECF) Maximum Amortization Audit (Wireless Code Section G.2)
  // By law, ECF cannot exceed: Device Subsidy - (Device Subsidy * (Months Elapsed / 24))
  const allowableMaxEcfCad = Math.max(
    0,
    Math.round(safeDeviceSubsidy - (safeDeviceSubsidy * (Math.min(safeMonths, 24) / 24)))
  );

  // 3. Statutory Violations Audit
  const statutoryViolations = [];

  // Violation A: $50 Data Overage Cap Breach (Section E.1)
  if (safeDataOverage > TELECOM_CONSTANTS.STATUTORY_CAPS.DATA_OVERAGE_CAD) {
    const illegalOverageExcess = safeDataOverage - TELECOM_CONSTANTS.STATUTORY_CAPS.DATA_OVERAGE_CAD;
    statutoryViolations.push({
      violationCode: 'DATA_OVERAGE_CAP_BREACH',
      statute: 'CRTC Wireless Code, Section E.1',
      severity: 'critical',
      finding: `Provider charged $${safeDataOverage.toFixed(2)} CAD in domestic data overage. The Wireless Code strictly caps data overage charges at $50.00 CAD per billing cycle without explicit consent. The excess $${illegalOverageExcess.toFixed(2)} CAD is statutorily illegal and must be refunded.`
    });
  }

  // Violation B: $100 Roaming Cap Breach (Section E.2)
  if (safeRoaming > TELECOM_CONSTANTS.STATUTORY_CAPS.ROAMING_DATA_OVERAGE_CAD) {
    const illegalRoamingExcess = safeRoaming - TELECOM_CONSTANTS.STATUTORY_CAPS.ROAMING_DATA_OVERAGE_CAD;
    statutoryViolations.push({
      violationCode: 'ROAMING_CAP_BREACH',
      statute: 'CRTC Wireless Code, Section E.2',
      severity: 'critical',
      finding: `Provider charged $${safeRoaming.toFixed(2)} CAD in international data roaming. By law, international roaming data is suspended once charges reach $100.00 CAD unless explicit account-holder consent is provided. The excess $${illegalRoamingExcess.toFixed(2)} CAD must be credited.`
    });
  }

  // Violation C: Device Unlocking Fee (Section F.1)
  if (safeUnlockFee > 0) {
    statutoryViolations.push({
      violationCode: 'ILLEGAL_DEVICE_UNLOCKING_FEE',
      statute: 'CRTC Wireless Code, Section F.1',
      severity: 'high',
      finding: `Provider charged $${safeUnlockFee.toFixed(2)} CAD for device unlocking. As of December 1, 2017, the CRTC banned all device unlocking fees ($0 mandated). All mobile devices must be provided unlocked.`
    });
  }

  // Violation D: Trial Period Cancellation Denial (Section G.4)
  if (isWithinTrialPeriod && refusedTrialCancellation) {
    statutoryViolations.push({
      violationCode: 'TRIAL_PERIOD_CANCELLATION_DENIED',
      statute: 'CRTC Wireless Code, Section G.4',
      severity: 'critical',
      finding: `Customer requested contract cancellation within the statutory ${allowedTrialDays}-day trial period (${safeDaysSinceStart} days elapsed), but the provider refused or demanded an early cancellation penalty. Under Section G.4, early cancellation fees are strictly barred when returning the device within the trial window.`
    });
  }

  // Violation E: Unilateral Price Increase on Fixed-Term Contract (Section D.1)
  if (providerUnilateralPriceIncrease) {
    statutoryViolations.push({
      violationCode: 'UNILATERAL_CONTRACT_ALTERATION',
      statute: 'CRTC Wireless Code Section D.1 & CRTC Internet Code Section D',
      severity: 'high',
      finding: `Provider unilaterally increased the monthly rate or modified plan inclusions during a fixed-term contract. The CRTC prohibits providers from altering core contractual terms without the customer's affirmative informed consent.`
    });
  }

  // 4. Consumer Rights & Dispute Remedies
  const consumerRemedies = [
    {
      remedy: 'Statutory Refund & Account Credit',
      authority: 'CRTC Wireless Code Sections E.1, E.2 & F.1',
      details: 'Request an immediate billing adjustment and reversal of all charges exceeding the $50 data overage cap, $100 roaming cap, or illegal unlocking fees.'
    },
    {
      remedy: 'Penalty-Free Contract Resiliation',
      authority: 'CRTC Wireless Code Section G.4',
      details: `If within ${allowedTrialDays} days of contract execution, return the phone to any retail outlet or by courier with original packaging to terminate the contract with $0 early cancellation penalty.`
    },
    {
      remedy: 'Formal CCTS Regulatory Complaint Escalation',
      authority: 'Commission for Complaints for Telecom-television Services (CCTS)',
      details: 'If the provider does not resolve the dispute within 48 hours, file an online complaint at ccts-cprst.ca. The CCTS is free for consumers and has binding authority to order refunds and up to $5,000 CAD in compensation.'
    }
  ];

  // 5. Formal Dispute & CCTS Escalation Notice
  const formalDisputeNotice = `FORMAL CRTC WIRELESS CODE NOTICE & CCTS ESCALATION WARNING

TO: ${safeProviderName} Billing & Customer Relations Department
DATE: ${safeAssessmentDate}
RE: Formal Dispute of Unauthorized Charges / Breach of CRTC Regulatory Standards

Dear Dispute Resolution Officer,

I am writing to formally dispute unauthorized and unlawful charges billed to my account in the amount of $${safeDisputedTotal.toFixed(2)} CAD.

Please take notice of the following statutory violations under the Canadian Radio-television and Telecommunications Commission (CRTC) Wireless Code (Telecom Regulatory Policy CRTC 2017-200):

${statutoryViolations.length > 0 ? statutoryViolations.map(v => `- [${v.violationCode}] ${v.finding}`).join('\n\n') : '- Disputed charges exceed agreed-upon contract terms.'}

${isWithinTrialPeriod ? `Furthermore, under CRTC Wireless Code Section G.4, I have exercised (or hereby exercise) my statutory right to cancel this contract within the ${allowedTrialDays}-day trial period without any early cancellation fee or penalty.` : `If this contract is terminated, pursuant to Section G.2, the allowable Early Cancellation Fee (ECF) cannot exceed the remaining amortized device balance ($${allowableMaxEcfCad.toFixed(2)} CAD).`}

DEMAND:
I demand that ${safeProviderName} immediately credit my account for all disputed amounts ($${safeDisputedTotal.toFixed(2)} CAD) and provide written confirmation within 5 business days.

FINAL WARNING:
If this matter is not resolved satisfactorily within 5 business days, I will immediately submit a formal complaint to the Commission for Complaints for Telecom-television Services (CCTS / CPRST) at www.ccts-cprst.ca, citing breaches of the CRTC Wireless Code. Under CRTC regulations, ${safeProviderName} is required to pay CCTS dispute fees, and CCTS decisions are legally binding.

Sincerely,
${safeCustomerName}
(CRTC Wireless Code Reference: Telecom Regulatory Policy CRTC 2017-200)`;

  // 6. Statutory Advisories & Best Practices for Newcomers
  const statutoryAdvisories = [
    '15-DAY TRIAL POWER: Always inspect and test your mobile phone coverage and plan during the first 15 days. If signal is weak or costs differ from what was promised, you can cancel with zero penalty under Section G.4.',
    '$50 DATA CAP IS MANDATORY: Telecommunications providers in Canada cannot legally let your data overage charges climb to hundreds of dollars without your affirmative consent on your phone.',
    'UNLOCKED PHONES ONLY: Never pay a fee to unlock a Canadian phone. All phones sold or supplied in Canada since Dec 1, 2017, must be completely unlocked.',
    'CCTS FILE IS FREE FOR CONSUMERS: The CCTS is an independent dispute body funded by industry levies. It costs you $0 to file, while telecom providers must pay case handling fees for every customer complaint lodged against them.',
    'CRITICAL INFORMATION SUMMARY: Always demand your 2-page Critical Information Summary (CIS) before leaving the store. If the store promised terms not reflected on the CIS, the provider must honor the lower price.'
  ];

  return {
    customerName: safeCustomerName,
    assessmentDate: safeAssessmentDate,
    providerName: safeProviderName,
    serviceType: safeServiceType,
    contractType: safeContractType,
    daysSinceContractStart: safeDaysSinceStart,
    allowedTrialDays,
    isWithinTrialPeriod,
    trialCancellationStatus,
    allowableMaxEcfCad,
    hasStatutoryViolations: statutoryViolations.length > 0,
    violationCount: statutoryViolations.length,
    statutoryViolations,
    consumerRemedies,
    formalDisputeNotice,
    statutoryAdvisories
  };
}

export const evaluateTelecomDispute = assessTelecomDispute;
