/**
 * Consumer Protection Rights, Cooling-Off Periods & Unsolicited Sales Defense Engine
 * 
 * Statutory & Regulatory Authorities:
 * - Ontario Consumer Protection Act, 2002 (CPA), S.O. 2002, c. 30, Sched. A:
 *   - Part III, s. 9 (Implied warranties and conditions of fitness/quality; non-waivable)
 *   - Part IV, ss. 14-18 (Unfair practices, misleading representations, 1-year rescission s. 18)
 *   - Part IV.1 & O. Reg. 17/18 (Strict ban on unsolicited door-to-door sales of HVAC/water heaters; void ab initio)
 *   - Part VI, ss. 42-43 (Direct agreements: 10-day cooling-off period; 1-year cancellation for missing disclosures)
 *   - Part V, s. 30 (Personal development services / gym memberships: 10-day cooling-off)
 * - British Columbia Business Practices and Consumer Protection Act (BPCPA), S.B.C. 2004, c. 2 (ss. 4-10, 19-24)
 * - Alberta Consumer Protection Act, R.S.A. 2000, c. C-26.3 (Direct sales contract cancellation rules)
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const CONSUMER_PROTECTION_CONSTANTS = Object.freeze({
  STANDARD_COOLING_OFF_DAYS: 10,
  EXTENDED_DISCLOSURE_CANCELLATION_DAYS: 365,
  UNFAIR_PRACTICE_RESCISSION_DAYS: 365,
  SUPPLIER_REFUND_DEADLINE_DAYS: 15,
  PRESCRIBED_DOOR_TO_DOOR_BANNED_PRODUCTS: [
    'furnace',
    'air_conditioner',
    'water_heater',
    'water_treatment',
    'water_purifier',
    'duct_cleaning'
  ]
});

/**
 * Diagnostic evaluation of consumer direct agreements, door-to-door HVAC/water heater ban,
 * 10-day cooling-off periods, unfair practice rescission rights, and statutory cancellation drafting.
 */
export function evaluateConsumerContract(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    province = 'ON',
    contractType = 'water_heater_rental',
    contractDate = '2026-10-25',
    contractValueCad = 4800,
    wasUnsolicitedInHomeVisit = true,
    prescribedBannedProduct = true,
    hasUnfairPractices = false,
    unfairPracticeType = 'none',
    missingMandatoryDisclosures = false,
    consumerName = 'Consumer',
    supplierName = 'Eco-Comfort Home Services Inc.',
    assessmentDate = '2026-10-31'
  } = safeParams;
  const safeAssessmentDate = safeIsoDate(assessmentDate, '2026-10-31');
  const safeContractDate = safeIsoDate(contractDate, '2026-10-25');
  const prov = boundedText(province, 'ON', 10).toUpperCase();
  const cType = boundedText(contractType, 'water_heater_rental', 50).toLowerCase();
  const valCad = Math.max(0, Math.min(10000000, Number(contractValueCad) || 0));
  const unsolicited = Boolean(wasUnsolicitedInHomeVisit);
  const bannedProduct = Boolean(prescribedBannedProduct);
  const unfair = Boolean(hasUnfairPractices);
  const uType = boundedText(unfairPracticeType, 'none', 50).toLowerCase();
  const missingDisclosures = Boolean(missingMandatoryDisclosures);

  const cName = boundedText(consumerName, 'Consumer', 120);
  const sName = boundedText(supplierName, 'Supplier', 120);

  const assessTime = new Date(safeAssessmentDate + 'T00:00:00Z').getTime();
  const contractTime = new Date(safeContractDate + 'T00:00:00Z').getTime();
  const daysElapsed = (!isNaN(assessTime) && !isNaN(contractTime))
    ? Math.max(0, Math.floor((assessTime - contractTime) / (1000 * 60 * 60 * 24)))
    : 0;

  // 1. Prescribed Door-to-Door Appliance Ban Audit (O. Reg. 17/18 / CPA Part IV.1)
  let isContractVoidAbInitio = false;
  let bannedProductViolationDetail = null;

  if (prov === 'ON' && unsolicited && bannedProduct) {
    isContractVoidAbInitio = true;
    bannedProductViolationDetail = 'Ontario CPA Part IV.1 and O. Reg. 17/18 strictly ban unsolicited direct sales of furnaces, air conditioners, water heaters, and water purifiers. Contracts entered into in violation of this ban are void from the outset (void ab initio). The consumer is entitled to retain all goods without paying, and the supplier must remove equipment and repair property at supplier expense.';
  } else if (prov === 'AB' && unsolicited && bannedProduct) {
    isContractVoidAbInitio = true;
    bannedProductViolationDetail = 'Alberta Consumer Protection Act strictly prohibits unsolicited door-to-door sales of furnaces, air conditioners, and energy products. The agreement is unenforceable.';
  }

  // 2. Cooling-Off Period Audit (CPA s. 42 / BPCPA s. 21)
  const isWithinStandard10DayCoolingOff = daysElapsed <= CONSUMER_PROTECTION_CONSTANTS.STANDARD_COOLING_OFF_DAYS;
  const isWithinExtended1YearDisclosurePeriod = missingDisclosures && daysElapsed <= CONSUMER_PROTECTION_CONSTANTS.EXTENDED_DISCLOSURE_CANCELLATION_DAYS;
  const isWithinUnfairPractice1YearPeriod = unfair && daysElapsed <= CONSUMER_PROTECTION_CONSTANTS.UNFAIR_PRACTICE_RESCISSION_DAYS;

  let canCancelWithoutPenalty = false;
  let cancellationStatutoryBasis = '';
  let cancellationWindowRemainingDays = 0;

  if (isContractVoidAbInitio) {
    canCancelWithoutPenalty = true;
    cancellationStatutoryBasis = 'Void from inception (void ab initio) under Ontario CPA Part IV.1 & O. Reg. 17/18 (Unsolicited Door-to-Door Sales Ban).';
    cancellationWindowRemainingDays = 365;
  } else if (isWithinStandard10DayCoolingOff) {
    canCancelWithoutPenalty = true;
    cancellationWindowRemainingDays = CONSUMER_PROTECTION_CONSTANTS.STANDARD_COOLING_OFF_DAYS - daysElapsed;
    cancellationStatutoryBasis = `Ontario CPA s. 42(1): Unconditional 10-day cooling-off period. Consumer may cancel without reason or penalty (${cancellationWindowRemainingDays} day(s) remaining).`;
  } else if (isWithinExtended1YearDisclosurePeriod) {
    canCancelWithoutPenalty = true;
    cancellationWindowRemainingDays = CONSUMER_PROTECTION_CONSTANTS.EXTENDED_DISCLOSURE_CANCELLATION_DAYS - daysElapsed;
    cancellationStatutoryBasis = `Ontario CPA s. 43(1): Extended 1-year cancellation right due to missing mandatory statutory disclosure statements (${cancellationWindowRemainingDays} day(s) remaining).`;
  } else if (isWithinUnfairPractice1YearPeriod) {
    canCancelWithoutPenalty = true;
    cancellationWindowRemainingDays = CONSUMER_PROTECTION_CONSTANTS.UNFAIR_PRACTICE_RESCISSION_DAYS - daysElapsed;
    cancellationStatutoryBasis = `Ontario CPA s. 18(1): Rescission within 1 year for unfair, deceptive, or unconscionable business practices (${cancellationWindowRemainingDays} day(s) remaining).`;
  } else {
    canCancelWithoutPenalty = false;
    cancellationWindowRemainingDays = 0;
    cancellationStatutoryBasis = `Statutory cancellation windows have expired (${daysElapsed} days elapsed since contract signing). Contract is subject to common law breach or supplier negotiation.`;
  }

  // 3. Unfair Practices & Deceptive Conduct Audit (CPA Part IV ss. 14, 15)
  let unfairPracticeFinding = null;
  if (unfair) {
    if (uType === 'misleading_safety_claim') {
      unfairPracticeFinding = 'False/Deceptive Representation (CPA s. 14): Falsely asserting that current equipment is hazardous, illegal, or condemned to coerce consumer into a new rental agreement.';
    } else if (uType === 'language_vulnerability_exploitation') {
      unfairPracticeFinding = 'Unconscionable Representation (CPA s. 15): Taking unfair advantage of a newcomer consumer\'s language barrier or inability to comprehend the complex financing/lien terms.';
    } else if (uType === 'false_rebate_claim') {
      unfairPracticeFinding = 'Deceptive Inducement (CPA s. 14): Misrepresenting that a municipal or government energy rebate program requires signing this private supplier contract.';
    } else {
      unfairPracticeFinding = 'Unfair Practice (CPA Part IV): Misleading or unconscionable representation entitling the consumer to statutory rescission under s. 18.';
    }
  }

  // 4. Draft Formal Statutory Cancellation Notice Letter
  const statutoryCancellationNotice = `NOTICE OF CONTRACT CANCELLATION & STATUTORY RESCISSION
Delivered pursuant to the Ontario Consumer Protection Act, 2002 (CPA)

DATE: ${assessmentDate}
TO: ${sName}
FROM: ${cName}
RE: Notice of Cancellation of Agreement (Contract Date: ${contractDate}, Value: $${valCad.toLocaleString('en-CA')} CAD)

Take formal notice that I hereby cancel and rescind the above-referenced agreement immediately pursuant to the statutory rights granted under the Ontario Consumer Protection Act, 2002 (S.O. 2002, c. 30, Sched. A):

${isContractVoidAbInitio ? '1. STATUTORY DOOR-TO-DOOR BAN (O. Reg. 17/18 & CPA Part IV.1): This agreement concerns prescribed household equipment sold through an unsolicited in-home transaction. Pursuant to Ontario law, this agreement is void ab initio. You are required to remove all installed equipment at your sole expense and restore my premises.\n' : ''}${isWithinStandard10DayCoolingOff ? '1. 10-DAY COOLING-OFF RIGHT (CPA s. 42(1)): Notice is delivered within 10 days of receiving the written agreement. I am entitled to cancel without penalty or cause.\n' : ''}${isWithinExtended1YearDisclosurePeriod ? '1. MISSING MANDATORY DISCLOSURES (CPA s. 43(1)): The agreement fails to contain mandatory statutory disclosures, extending the cancellation period to one full year.\n' : ''}${unfair ? `1. STATUTORY RESCISSION FOR UNFAIR PRACTICES (CPA s. 18): The transaction was induced by deceptive or unconscionable representations (${unfairPracticeFinding || 'CPA Part IV'}).\n` : ''}
STATUTORY DEMAND:
1. Cease all automated pre-authorized debit (PAD) or credit card charges immediately.
2. Refund all monies paid to date ($${valCad.toLocaleString('en-CA')} CAD) within fifteen (15) days as required by CPA s. 43(4) / s. 18(2).
3. Discharge any Notice of Security Interest (NOSI) or lien registered against the title of my property under the Personal Property Security Act (PPSA).

Failure to comply within fifteen (15) days will result in an immediate formal complaint to the Ministry of Public and Business Service Delivery (Consumer Protection Ontario) and legal proceedings in the Ontario Small Claims Court for statutory damages.

DATED at Ontario, this ${assessmentDate}.

Signed: ${cName}`;

  // 5. Action Roadmap
  const actionPlan = [
    {
      step: 1,
      title: 'Deliver Statutory Notice in Writing',
      action: 'Send the cancellation notice via registered mail, courier, or email to ensure you have verifiable proof of delivery (CPA s. 42).'
    },
    {
      step: 2,
      title: 'Notify Your Financial Institution',
      action: 'Provide a copy of the cancellation notice to your bank or credit card issuer and instruct them to stop any pre-authorized debits (PAD).'
    },
    {
      step: 3,
      title: 'Verify Lien / NOSI Discharge',
      action: 'Conduct a search under the Personal Property Security Act (PPSA) or Land Titles registry to confirm the supplier has discharged any Notice of Security Interest (NOSI).'
    },
    {
      step: 4,
      title: 'File Formal Complaint with Consumer Protection Ontario',
      action: 'If the supplier fails to refund money within 15 days, lodge an enforcement complaint with the Ministry of Public and Business Service Delivery.'
    }
  ];

  const warnings = [
    'Notice of Security Interest (NOSI) Warning: Many door-to-door water heater and HVAC rental companies register hidden liens against home titles; Ontario Bill 200 (2024) rendered existing consumer NOSIs void, but always verify title discharge.',
    'Proof of delivery is essential: Cancellation takes effect on the day the notice is given; always keep the postal tracking receipt or sent email record.',
    'Under Ontario law, consumers cannot waive statutory consumer rights; any contractual clause claiming a sale is "final and non-cancellable" is legally void under CPA s. 9.'
  ];

  return {
    asOf: safeAssessmentDate,
    assessmentDate: safeAssessmentDate,
    consumerName: cName,
    supplierName: sName,
    province: prov,
    contractType: cType,
    contractValueCad: valCad,
    timingAudit: {
      contractDate: safeContractDate,
      assessmentDate: safeAssessmentDate,
      daysElapsedSinceContract: daysElapsed,
      isWithinStandard10DayCoolingOff,
      isWithinExtended1YearDisclosurePeriod,
      isWithinUnfairPractice1YearPeriod
    },
    doorToDoorBanAudit: {
      wasUnsolicitedInHomeVisit: unsolicited,
      prescribedBannedProduct: bannedProduct,
      isContractVoidAbInitio,
      violationDetail: bannedProductViolationDetail
    },
    cancellationRights: {
      canCancelWithoutPenalty,
      cancellationWindowRemainingDays,
      statutoryBasis: cancellationStatutoryBasis
    },
    unfairPracticesAudit: {
      hasUnfairPractices: unfair,
      unfairPracticeType: uType,
      statutoryFinding: unfairPracticeFinding
    },
    statutoryNoticeLetter: statutoryCancellationNotice,
    actionPlan,
    warnings,
    statutoryCitations: [
      'Ontario Consumer Protection Act, 2002, S.O. 2002, c. 30, Sched. A, s. 9 (Non-Waivable Warranties)',
      'Ontario Consumer Protection Act, 2002, ss. 14, 15, 18 (Unfair Practices & 1-Year Rescission)',
      'Ontario Consumer Protection Act, 2002, Part IV.1 & O. Reg. 17/18 (Door-to-Door HVAC & Water Heater Ban)',
      'Ontario Consumer Protection Act, 2002, s. 42 & s. 43 (Direct Agreement 10-Day Cooling-Off & 1-Year Extension)',
      'Ontario Personal Property Security Act (PPSA) & Bill 200 (Homeowner Protection Act, 2024 - NOSI Ban)'
    ]
  };
}
