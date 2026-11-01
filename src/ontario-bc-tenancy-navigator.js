/**
 * Northstar Ontario & BC Tenancy Tribunal Defense Navigator
 * Implements statutory standards for:
 * 1. Ontario RTA 2.5% Guideline & AGI rules (RTA s. 120, Form N1 90-day notice)
 * 2. Ontario Post-Nov 15, 2018 Exemption (RTA s. 6.1, Form N2 notice rules & burden of proof)
 * 3. Ontario RTA s. 5(i) Shared Kitchen/Bath Exemption (LTB lack of jurisdiction)
 * 4. Ontario Form N12 1-Month Landlord Compensation Deadline (RTA s. 48.1 - void if unpaid by termination date)
 * 5. Ontario Form T1 Illegal Rent & Unlawful Fee Refund (RTA s. 135 - 1-year strict limitation deadline)
 * 6. Ontario RTA s. 95 Lease Assignment Refusal & 30-Day Early Exit (Form N9)
 * 7. BC RTB Rent Cap (3.5% / 3.0%) & Two-Month Notice for Landlord Use 12-Month Rent Penalty (BC RTA s. 49 & s. 51)
 */

export const TENANCY_CONSTANTS = {
  ONTARIO_ANNUAL_GUIDELINE_2024: 0.025, // 2.5%
  ONTARIO_ANNUAL_GUIDELINE_2025: 0.025, // 2.5%
  ONTARIO_MIN_NOTICE_DAYS_RENT_INCREASE: 90,
  ONTARIO_MIN_INTERVAL_MONTHS_RENT_INCREASE: 12,
  ONTARIO_EXEMPTION_CUTOFF_DATE: '2018-11-15',
  ONTARIO_T1_LIMITATION_PERIOD_MONTHS: 12,

  BC_ANNUAL_GUIDELINE_2024: 0.035, // 3.5%
  BC_ANNUAL_GUIDELINE_2025: 0.030, // 3.0%
  BC_MIN_NOTICE_MONTHS_RENT_INCREASE: 3,
  BC_LANDLORD_USE_PENALTY_MONTHS: 12, // 12 months rent penalty under BC RTA s. 51(2)
  BC_LANDLORD_MIN_OCCUPANCY_MONTHS: 6 // Must occupy for at least 6 months
};

/**
 * Audits an Ontario rent increase notice under RTA s. 120 and s. 6.1
 */
export function auditOntarioRentIncrease({
  currentMonthlyRentCad = 2000,
  proposedMonthlyRentCad = 2200,
  buildingFirstOccupiedDate = '2016-05-01',
  noticeGivenDate = '2026-01-01',
  effectiveDate = '2026-04-01',
  monthsSinceLastIncrease = 12,
  noticeFormUsed = 'N1',
  hasApprovedAgi = false
}) {
  const isPostNov2018 = new Date(buildingFirstOccupiedDate) > new Date(TENANCY_CONSTANTS.ONTARIO_EXEMPTION_CUTOFF_DATE);
  const rentIncreaseAmountCad = proposedMonthlyRentCad - currentMonthlyRentCad;
  const percentageIncrease = (rentIncreaseAmountCad / currentMonthlyRentCad) * 100;
  const guidelineAllowedCad = Math.round(currentMonthlyRentCad * TENANCY_CONSTANTS.ONTARIO_ANNUAL_GUIDELINE_2024 * 100) / 100;

  // Calculate notice days
  const noticeMs = new Date(effectiveDate) - new Date(noticeGivenDate);
  const noticeDays = Math.round(noticeMs / (1000 * 60 * 60 * 24));

  const defects = [];
  if (noticeDays < TENANCY_CONSTANTS.ONTARIO_MIN_NOTICE_DAYS_RENT_INCREASE) {
    defects.push(`Notice period was ${noticeDays} days, which is less than the statutory 90 days required under RTA s. 116(1).`);
  }
  if (monthsSinceLastIncrease < TENANCY_CONSTANTS.ONTARIO_MIN_INTERVAL_MONTHS_RENT_INCREASE) {
    defects.push(`Rent cannot be increased until at least 12 months after the last increase or beginning of tenancy (RTA s. 119(1)). Only ${monthsSinceLastIncrease} months elapsed.`);
  }

  let isExemptFromGuideline = isPostNov2018;
  let isIncreaseLawful = false;

  if (isPostNov2018) {
    if (noticeFormUsed !== 'N2') {
      defects.push(`Notice form used was '${noticeFormUsed}', but buildings first occupied after Nov 15, 2018 must use Form N2 (Notice of Rent Increase for Exempt Units).`);
    }
    isIncreaseLawful = defects.length === 0;
  } else {
    // Subject to rent control guideline (2.5%)
    if (noticeFormUsed !== 'N1') {
      defects.push(`Notice form used was '${noticeFormUsed}', but rent-controlled units must use Form N1.`);
    }
    if (rentIncreaseAmountCad > guidelineAllowedCad && !hasApprovedAgi) {
      defects.push(`Rent increase of $${rentIncreaseAmountCad} (${percentageIncrease.toFixed(2)}%) exceeds the 2.5% statutory guideline ($${guidelineAllowedCad}) without an LTB Above-Guideline Increase (AGI) order.`);
    }
    isIncreaseLawful = defects.length === 0;
  }

  return {
    jurisdiction: 'Ontario (LTB)',
    statutoryBasis: isPostNov2018 ? 'Residential Tenancies Act, 2006, s. 6.1 (Exempt)' : 'Residential Tenancies Act, 2006, s. 120 (Rent Controlled)',
    isRentControlled: !isPostNov2018,
    buildingFirstOccupiedDate,
    noticeDaysGiven: noticeDays,
    isIncreaseLawful,
    defects,
    maxStatutoryIncreaseCad: isPostNov2018 ? 'Unlimited (Exempt from guideline cap)' : guidelineAllowedCad,
    statutoryGuidelinePercent: isPostNov2018 ? 'Exempt' : '2.5%',
    remedy: isIncreaseLawful
      ? 'The notice appears procedurally valid.'
      : 'Under RTA s. 116(4), an invalid notice is void. The tenant is not required to pay the unlawful increase and may continue paying their existing lawful rent.'
  };
}

/**
 * Evaluates whether LTB has jurisdiction under Ontario RTA s. 5(i) (Shared kitchen/bath)
 */
export function evaluateOntarioSharedKitchenBathroomJurisdiction({
  sharesKitchenOrBathroomWithLandlord = false,
  landlordOrFamilyLivesInUnit = false,
  relativeRelationshipToLandlord = 'none' // 'self', 'spouse', 'child', 'parent', 'none'
}) {
  const isExcludedRelative = ['self', 'spouse', 'child', 'parent'].includes(relativeRelationshipToLandlord.toLowerCase());
  const isExcludedFromRta = sharesKitchenOrBathroomWithLandlord && landlordOrFamilyLivesInUnit && isExcludedRelative;

  return {
    isRtaApplicable: !isExcludedFromRta,
    ltbHasJurisdiction: !isExcludedFromRta,
    statutoryBasis: 'Ontario Residential Tenancies Act, 2006, s. 5(i)',
    status: isExcludedFromRta ? 'EXEMPT FROM RTA (NO TENANCY RIGHTS)' : 'COVERED BY RTA (FULL TENANCY RIGHTS)',
    legalImplications: isExcludedFromRta
      ? 'Under RTA s. 5(i), living arrangements where a occupant shares a kitchen or bathroom with the owner, spouse, child, or parent are EXEMPT from the RTA. The LTB has no jurisdiction. The occupant is legally a roommate/guest and does not have eviction protections under the RTA.'
      : 'The tenancy is governed by the RTA. The landlord cannot evict without an order from the Landlord and Tenant Board (LTB).'
  };
}

/**
 * Audits an Ontario Form N12 Notice for Landlord's Personal Use & compensation deadline (RTA s. 48.1)
 */
export function auditOntarioFormN12Notice({
  monthlyRentCad = 2200,
  noticeTerminationDate = '2026-05-31',
  compensationPaidDate = null,
  alternateUnitOffered = false,
  personMovingIn = 'child', // 'landlord', 'spouse', 'child', 'parent', 'caregiver', 'purchaser', 'landlord_child'
  noticeServedDate = '2026-03-31'
}) {
  const noticeMs = new Date(noticeTerminationDate) - new Date(noticeServedDate);
  const noticeDays = Math.round(noticeMs / (1000 * 60 * 60 * 24));
  const validPersons = ['landlord', 'spouse', 'child', 'parent', 'caregiver', 'purchaser', 'landlord_child'];
  const isValidPerson = validPersons.includes(personMovingIn.toLowerCase());

  const defects = [];
  if (noticeDays < 60) {
    defects.push(`Notice period was ${noticeDays} days. RTA s. 48(2) strictly requires at least 60 days notice.`);
  }
  if (!isValidPerson) {
    defects.push(`'${personMovingIn}' is not an authorized relative under RTA s. 48(1). Siblings, aunts, cousins, and distant relatives are strictly excluded.`);
  }

  // Strict compensation rule under s. 48.1:
  // Landlord MUST pay 1 month compensation OR offer acceptable alternate unit ON OR BEFORE the termination date.
  let isCompensationCompliant = false;
  if (alternateUnitOffered) {
    isCompensationCompliant = true;
  } else if (compensationPaidDate) {
    const isPaidOnOrBefore = new Date(compensationPaidDate) <= new Date(noticeTerminationDate);
    if (!isPaidOnOrBefore) {
      defects.push(`Compensation was paid on ${compensationPaidDate}, which is AFTER the termination date of ${noticeTerminationDate}. Under RTA s. 48.1 and LTB binding precedent, failure to pay compensation on or before the termination date makes the N12 notice completely VOID.`);
    } else {
      isCompensationCompliant = true;
    }
  } else {
    defects.push(`Landlord has not paid the mandatory 1 month's compensation ($${monthlyRentCad}) nor offered an alternate unit.`);
  }

  const isNoticeValid = defects.length === 0;

  return {
    statutoryBasis: 'Ontario Residential Tenancies Act, 2006, s. 48, s. 48.1, s. 49',
    isNoticeValid,
    mandatoryCompensationCad: monthlyRentCad,
    compensationDeadline: noticeTerminationDate,
    isCompensationCompliant,
    defects,
    defenseStrategy: !isNoticeValid
      ? 'The tenant can raise the defect at the LTB hearing. Under LTB established caselaw, the LTB member must dismiss the landlord application (Form L2) if statutory compensation was not paid on or before the termination date.'
      : 'If valid, the tenant has the right to challenge the landlord\'s good faith at an LTB hearing. The tenant is NOT required to move out until the LTB issues an eviction order.'
  };
}

/**
 * Audits Form T1 (Recovery of Unlawful Rent or Fees) limitation period under RTA s. 135
 */
export function evaluateOntarioT1RefundClaim({
  unlawfulChargeType = 'illegal_rent_increase', // 'illegal_rent_increase', 'key_deposit_overcharge', 'application_fee', 'damage_deposit'
  amountPaidCad = 1800,
  paymentDate = '2025-06-01',
  assessmentDate = '2026-04-15'
}) {
  const paymentTime = new Date(paymentDate).getTime();
  const assessmentTime = new Date(assessmentDate).getTime();
  const monthsElapsed = (assessmentTime - paymentTime) / (1000 * 60 * 60 * 24 * 30.4375);

  const isWithin1YearLimitation = monthsElapsed <= TENANCY_CONSTANTS.ONTARIO_T1_LIMITATION_PERIOD_MONTHS;

  return {
    statutoryBasis: 'Ontario Residential Tenancies Act, 2006, s. 135',
    unlawfulChargeType,
    amountPaidCad,
    monthsElapsed: Math.round(monthsElapsed * 10) / 10,
    isWithinLimitationPeriod: isWithin1YearLimitation,
    remedy: isWithin1YearLimitation
      ? `Tenant is eligible to file Form T1 with the LTB to obtain a binding order for the refund of $${amountPaidCad}. Under s. 135, claims must be filed within 1 year of the payment date.`
      : `EXPIRED: Under RTA s. 135(2), an application for refund of illegal charges must be filed within 1 year after the date of payment. This claim is statute-barred.`,
    prohibitedChargesUnderRta: [
      'Damage deposits (illegal under RTA s. 105)',
      'Key deposits exceeding reasonable replacement cost (illegal under s. 17 of O. Reg. 516/06)',
      'Application fees or background check fees (illegal under s. 134)'
    ]
  };
}

/**
 * Audits BC RTB rent increase and landlord personal use eviction under BC RTA
 */
export function auditBcTenancyNotice({
  type = 'rent_increase', // 'rent_increase' or 'landlord_use'
  currentRentCad = 2500,
  proposedRentCad = 2650,
  noticeMonths = 3,
  landlordFailedToOccupyFor6Months = false
}) {
  if (type === 'rent_increase') {
    const rentIncreaseCad = proposedRentCad - currentRentCad;
    const percentIncrease = (rentIncreaseCad / currentRentCad) * 100;
    const maxAllowedCad = Math.round(currentRentCad * TENANCY_CONSTANTS.BC_ANNUAL_GUIDELINE_2024 * 100) / 100;
    const isLawful = percentIncrease <= (TENANCY_CONSTANTS.BC_ANNUAL_GUIDELINE_2024 * 100) && noticeMonths >= TENANCY_CONSTANTS.BC_MIN_NOTICE_MONTHS_RENT_INCREASE;

    return {
      jurisdiction: 'British Columbia (RTB)',
      statutoryBasis: 'BC Residential Tenancy Act, SBC 2002, c. 78, s. 41-43',
      isLawful,
      statutoryGuidelinePercent: `${TENANCY_CONSTANTS.BC_ANNUAL_GUIDELINE_2024 * 100}%`,
      maxStatutoryIncreaseCad: maxAllowedCad,
      proposedIncreaseCad: rentIncreaseCad,
      defects: isLawful ? [] : ['Proposed increase exceeds BC RTB allowable annual rent increase or fails 3 full month notice rule.']
    };
  } else {
    // Landlord use penalty audit under BC RTA s. 51(2)
    const penaltyCad = currentRentCad * TENANCY_CONSTANTS.BC_LANDLORD_USE_PENALTY_MONTHS;
    return {
      jurisdiction: 'British Columbia (RTB)',
      statutoryBasis: 'BC Residential Tenancy Act, SBC 2002, c. 78, s. 49 & s. 51(2)',
      isBadFaithPenaltyApplicable: landlordFailedToOccupyFor6Months,
      statutoryPenaltyMonths: TENANCY_CONSTANTS.BC_LANDLORD_USE_PENALTY_MONTHS,
      statutoryPenaltyAmountCad: landlordFailedToOccupyFor6Months ? penaltyCad : 0,
      rule: 'Under BC RTA s. 51(2), if a landlord evicts for landlord use but fails to accomplish the stated purpose within a reasonable period and occupy the rental unit for at least 6 months, the landlord MUST pay the tenant compensation equal to 12 MONTHS RENT.'
    };
  }
}
