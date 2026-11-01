/**
 * Manitoba Residential Tenancy Rent Increase Guideline Navigator
 *
 * Audits annual rent increase guidelines, 3-month written notice requirements (Form 2),
 * 12-month frequency limits, above-guideline increase (AGI) applications, and $1,615+
 * rent exemptions under The Residential Tenancies Act, C.C.S.M. c. R119, Part 9,
 * and Man. Reg. 156/92.
 *
 * Pure ES module — zero runtime npm dependencies.
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const MANITOBA_RENT_CONSTANTS = Object.freeze({
  ANNUAL_GUIDELINE_PERCENTAGE: 3.0, // 2024-2025 official guideline
  MINIMUM_NOTICE_PERIOD_MONTHS: 3, // s. 116(1)
  MINIMUM_MONTHS_BETWEEN_INCREASES: 12, // s. 117
  HIGH_RENT_EXEMPTION_THRESHOLD_CAD: 1615, // Units at or above $1,615/mo exempt from guideline
  POST_2005_CONSTRUCTION_CUTOFF_YEAR: 2005,
  STATUTORY_AUTHORITY: 'The Residential Tenancies Act, C.C.S.M. c. R119, ss. 116-134; Man. Reg. 156/92'
});

/**
 * Audits Manitoba residential rent increases, notice validity, guideline compliance, and RTB remedies.
 *
 * @param {Object} params
 * @param {number} [params.currentMonthlyRentCad=1200] - Existing authorized monthly rent
 * @param {number} [params.proposedMonthlyRentCad=1250] - New proposed monthly rent
 * @param {number} [params.noticeMonthsGiven=3] - Calendar months notice given before effective date
 * @param {number} [params.monthsSinceLastRentIncrease=12] - Elapsed calendar months since last increase
 * @param {boolean} [params.usedPrescribedForm2=true] - Landlord served official RTB Form 2 (Notice of Rent Increase)
 * @param {boolean} [params.hasApprovedAgiOrderFromRtb=false] - Landlord holds formal RTB approval for above-guideline increase
 * @param {number} [params.buildingFirstOccupiedYear=1995] - Year rental building was first occupied for residential purposes
 * @returns {Object} Comprehensive Manitoba rent increase audit, legality verdict, and RTB remedies
 */
export function evaluateManitobaRentIncrease(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    tenantName = 'Tenant',
    landlordName = 'Landlord',
    assessmentDate = '2026-10-31',
    currentMonthlyRentCad = 1200,
    proposedMonthlyRentCad = 1250,
    noticeMonthsGiven = 3,
    monthsSinceLastRentIncrease = 12,
    usedPrescribedForm2 = true,
    hasApprovedAgiOrderFromRtb = false,
    buildingFirstOccupiedYear = 1995
  } = safeParams;

  const cleanTenantName = boundedText(tenantName, 'Tenant', 100);
  const cleanLandlordName = boundedText(landlordName, 'Landlord', 120);
  const cleanAssessmentDate = safeIsoDate(assessmentDate, '2026-10-31');

  const currentRent = Number.isFinite(Number(currentMonthlyRentCad)) ? Math.max(0, Math.min(1000000, Number(currentMonthlyRentCad))) : 1200;
  const proposedRent = Number.isFinite(Number(proposedMonthlyRentCad)) ? Math.max(0, Math.min(1000000, Number(proposedMonthlyRentCad))) : 1250;
  const noticeMonths = Number.isFinite(Number(noticeMonthsGiven)) ? Math.max(0, Math.min(120, Number(noticeMonthsGiven))) : 3;
  const monthsSinceLast = Number.isFinite(Number(monthsSinceLastRentIncrease)) ? Math.max(0, Math.min(600, Number(monthsSinceLastRentIncrease))) : 12;
  const usedForm2 = usedPrescribedForm2 !== false;
  const approvedAgi = Boolean(hasApprovedAgiOrderFromRtb);
  const occupiedYear = Number.isFinite(Number(buildingFirstOccupiedYear)) ? Math.max(1800, Math.min(2100, Math.floor(Number(buildingFirstOccupiedYear)))) : 1995;

  const dollarIncrease = Math.max(0, proposedRent - currentRent);
  const percentageIncrease = currentRent > 0 ? Number(((dollarIncrease / currentRent) * 100).toFixed(2)) : 0;

  // 1. Exemption Audits (s. 119)
  const isHighRentExempt = currentRent >= MANITOBA_RENT_CONSTANTS.HIGH_RENT_EXEMPTION_THRESHOLD_CAD;
  const isPost2005Exempt = occupiedYear >= MANITOBA_RENT_CONSTANTS.POST_2005_CONSTRUCTION_CUTOFF_YEAR;
  const isExemptFromGuideline = isHighRentExempt || isPost2005Exempt;

  const allowableGuidelinePercent = MANITOBA_RENT_CONSTANTS.ANNUAL_GUIDELINE_PERCENTAGE;
  const allowableMaxRentUnderGuidelineCad = Number((currentRent * (1 + allowableGuidelinePercent / 100)).toFixed(2));

  const statutoryViolations = [];
  const riskWarnings = [];
  const actionableRemedies = [];

  // 2. 12-Month Frequency Audit (s. 117)
  if (monthsSinceLast < MANITOBA_RENT_CONSTANTS.MINIMUM_MONTHS_BETWEEN_INCREASES) {
    statutoryViolations.push({
      rule: 'RENT_INCREASED_MORE_FREQUENTLY_THAN_12_MONTHS',
      statute: 'The Residential Tenancies Act s. 117',
      finding: `Only ${monthsSinceLast} month${monthsSinceLast === 1 ? '' : 's'} have elapsed since the prior rent increase. Section 117 strictly limits rent increases to once every 12 months.`
    });
    actionableRemedies.push({
      action: 'RESCHEDULE_INCREASE_TO_12_MONTH_MARK',
      remedyDescription: `Landlord cannot increase rent until a full 12 months have elapsed; tenant may pay existing rent of $${currentRent}.`
    });
  }

  // 3. 3 Full Months Notice Audit (s. 116(1))
  if (noticeMonths < MANITOBA_RENT_CONSTANTS.MINIMUM_NOTICE_PERIOD_MONTHS) {
    statutoryViolations.push({
      rule: 'INSUFFICIENT_NOTICE_PERIOD_UNDER_3_MONTHS',
      statute: 'The Residential Tenancies Act s. 116(1)',
      finding: `Landlord gave ${noticeMonths} month${noticeMonths === 1 ? '' : 's'} notice. Statute mandates at least 3 full calendar months written notice.`
    });
    actionableRemedies.push({
      action: 'INVALIDATE_NOTICE_PAY_OLD_RENT',
      remedyDescription: 'Defective notice is void. Tenant may continue paying existing rent until a compliant 3-month notice is served.'
    });
  }

  // 4. Form 2 Audit
  if (!usedForm2) {
    statutoryViolations.push({
      rule: 'FAILURE_TO_USE_PRESCRIBED_FORM_2',
      statute: 'The Residential Tenancies Act s. 116(2)',
      finding: 'Landlord served an informal notice instead of official RTB Form 2 (Notice of Rent Increase).'
    });
    actionableRemedies.push({
      action: 'SERVE_OFFICIAL_RTB_FORM_2',
      remedyDescription: 'Landlord must reissue notice on prescribed Form 2.'
    });
  }

  // 5. Guideline Exceedance & AGI Audit
  const exceedsGuideline = percentageIncrease > allowableGuidelinePercent;

  if (!isExemptFromGuideline && exceedsGuideline && !approvedAgi) {
    const illegalExcessPerMonth = Number((proposedRent - allowableMaxRentUnderGuidelineCad).toFixed(2));
    statutoryViolations.push({
      rule: 'UNAUTHORIZED_ABOVE_GUIDELINE_INCREASE',
      statute: 'The Residential Tenancies Act s. 120, 123',
      finding: `Proposed increase of ${percentageIncrease}% exceeds statutory guideline of ${allowableGuidelinePercent}% by $${illegalExcessPerMonth}/month without approved RTB order.`
    });
    actionableRemedies.push({
      action: 'FILE_RTB_TENANT_OBJECTION',
      remedyDescription: `Tenant should file an Objection to Rent Increase with the Residential Tenancies Branch within 60 days of receiving Form 2.`
    });
  }

  if (isExemptFromGuideline) {
    riskWarnings.push({
      warningType: 'RENT_CONTROL_EXEMPTION_APPLIES',
      description: isHighRentExempt
        ? `Unit rent ($${currentRent}) meets or exceeds $1,615/month threshold, exempting it from the provincial annual guideline.`
        : `Building was first occupied in ${occupiedYear} (post-2005 cutoff), exempting it from the annual percentage guideline.`
    });
  }

  let complianceStatus = 'COMPLIANT_RENT_INCREASE';
  let legalVerdict = isExemptFromGuideline
    ? `Unit is exempt from Manitoba percentage guideline. Notice complies with 3-month timeline and Form 2 requirements.`
    : `Rent increase of ${percentageIncrease}% ($${dollarIncrease}) is fully within the Manitoba ${allowableGuidelinePercent}% statutory guideline ($${allowableMaxRentUnderGuidelineCad} max).`;

  if (statutoryViolations.length > 0) {
    complianceStatus = 'UNLAWFUL_RENT_INCREASE';
    legalVerdict = `Proposed rent increase is legally defective under The Residential Tenancies Act (${statutoryViolations.length} infraction${statutoryViolations.length === 1 ? '' : 's'}). Tenant is not obligated to pay the unlawful increase.`;
  }

  return {
    jurisdiction: 'MANITOBA_CANADA',
    tenantName: cleanTenantName,
    landlordName: cleanLandlordName,
    assessmentDate: cleanAssessmentDate,
    currentMonthlyRentCad: currentRent,
    proposedMonthlyRentCad: proposedRent,
    percentageIncrease,
    isExemptFromGuideline,
    isHighRentExempt,
    isPost2005Exempt,
    allowableMaxRentUnderGuidelineCad,
    complianceStatus,
    legalVerdict,
    noticeAudit: {
      noticeMonthsGiven: noticeMonths,
      monthsSinceLastRentIncrease: monthsSinceLast,
      usedPrescribedForm2: usedForm2,
      hasApprovedAgiOrderFromRtb: approvedAgi
    },
    statutoryViolations,
    riskWarnings,
    actionableRemedies,
    statutoryCitations: [
      'The Residential Tenancies Act, C.C.S.M. c. R119, ss. 116-134',
      'Residential Rent Regulation, Man. Reg. 156/92',
      'Residential Tenancies Branch (RTB) Guideline Orders'
    ]
  };
}

export const assessManitobaRentIncrease = evaluateManitobaRentIncrease;

