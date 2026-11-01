/**
 * BC Speculation and Vacancy Tax (SVT) Annual Declaration & Exemption Engine
 *
 * Implements statutory assessment under:
 * - British Columbia Speculation and Vacancy Tax Act (SBC 2018 c. 46)
 * - Speculation and Vacancy Tax Regulation (B.C. Reg. 248/2018)
 * - 2024–2026 Geographical Expansion Amendments (Order in Council No. 671/2023)
 *
 * Key Statutory Rules:
 * - Mandatory Annual Declaration: All registered owners of residential property within designated
 *   taxable regions in British Columbia must complete an annual SVT declaration by March 31.
 * - Tax Rates:
 *   - 0.5% of assessed residential property value for Canadian citizens and permanent residents
 *     who are NOT members of a satellite family.
 *   - 2.0% of assessed value for foreign owners and members of a satellite family.
 * - Satellite Family Definition (s. 1): A family where more than 50% of the household's total worldwide
 *   income in the calendar year is not reported on Canadian personal income tax returns.
 * - Statutory Exemptions:
 *   (1) Principal Residence Exemption (s. 37): Occupied as primary home for at least 6 months of the year.
 *   (2) Arm's-Length Tenancy Exemption (ss. 38–39): Rented to a third-party tenant for at least 6 months
 *       of the year in periods of at least 30 consecutive days.
 *   (3) Year of Acquisition Exemption (s. 47): Property purchased in the calendar year with Property Transfer Tax paid.
 *   (4) Medical / Care Facility Exemption (s. 42): Owner resided in a medical or residential care facility.
 *   (5) Major Renovation Exemption (s. 40): Active building permits and substantial renovations preventing occupancy.
 *   (6) Spousal Separation Exemption (s. 44): Spouses lived separate and apart due to marital breakdown.
 * - Default Penalty: Failure to declare by the deadline results in an automatic assessment at the maximum
 *   2.0% tax rate, plus statutory interest and collection enforcement.
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const BC_SVT_CONSTANTS = Object.freeze({
  ANNUAL_DECLARATION_DEADLINE_MONTH_DAY: '03-31',
  CANADIAN_RESIDENT_TAX_RATE_PERCENT: 0.5,
  FOREIGN_AND_SATELLITE_TAX_RATE_PERCENT: 2.0,
  MINIMUM_OCCUPANCY_MONTHS_REQUIRED: 6,
  MINIMUM_TENANCY_PERIOD_CONSECUTIVE_DAYS: 30,
  SATELLITE_FAMILY_FOREIGN_INCOME_THRESHOLD_PERCENT: 50
});

export const BC_SVT_TAXABLE_REGIONS = Object.freeze([
  'Metro Vancouver',
  'Capital Regional District',
  'Victoria',
  'Saanich',
  'Fraser Valley',
  'Kelowna',
  'West Kelowna',
  'Nanaimo',
  'Lantzville',
  'Abbotsford',
  'Chilliwack',
  'Mission',
  'Penticton',
  'Summerland',
  'Vernon',
  'Coldstream',
  'Kamloops',
  'Salmon Arm',
  'Squamish'
]);

/**
 * Evaluates BC Speculation and Vacancy Tax liability, statutory exemption qualification, and declaration guidance.
 *
 * @param {Object} options
 * @param {string} [options.propertyRegion='Metro Vancouver'] - Municipality or regional district
 * @param {number} [options.assessedPropertyValueCad=1250000] - BC Assessment value in CAD
 * @param {string} [options.ownerCitizenshipStatus='canadian_citizen_or_pr'] - 'canadian_citizen_or_pr', 'foreign_national'
 * @param {boolean} [options.isSatelliteFamily=false] - >50% of household income not taxed in Canada
 * @param {string} [options.propertyUseCategory='principal_residence'] - 'principal_residence', 'long_term_rental', 'vacant_secondary', 'major_renovation', 'medical_care', 'year_of_purchase'
 * @param {number} [options.monthsOccupiedInYear=12] - Months lived in or rented in the calendar year
 * @param {boolean} [options.hasArmsLengthTenancyAgreement=true] - Written lease with third-party tenant
 * @param {boolean} [options.hasActiveBuildingPermits=false] - For renovation exemption under s. 40
 * @param {string} [options.ownerName='Property Owner'] - Name of registered owner
 * @param {string} [options.calendarTaxYear='2025'] - Tax year being declared
 * @param {string} [options.assessmentDate='2026-10-31'] - Date of assessment
 * @returns {Object} Comprehensive BC Speculation & Vacancy Tax diagnostic
 */
export function evaluateBcSpeculationTaxDeclaration(options = {}) {
  const region = boundedText(options.propertyRegion, 'Metro Vancouver', 60);
  const assessedValue = Number.isFinite(Number(options.assessedPropertyValueCad))
    ? Math.max(0, Math.min(1_000_000_000, Number(options.assessedPropertyValueCad)))
    : 1250000.0;
  const rawStatus = typeof options.ownerCitizenshipStatus === 'string' ? options.ownerCitizenshipStatus.trim().toLowerCase() : 'canadian_citizen_or_pr';
  const status = ['canadian_citizen_or_pr', 'foreign_national'].includes(rawStatus) ? rawStatus : 'canadian_citizen_or_pr';
  const isSatellite = Boolean(options.isSatelliteFamily);

  const rawUse = typeof options.propertyUseCategory === 'string' ? options.propertyUseCategory.trim().toLowerCase() : 'principal_residence';
  const propertyUse = ['principal_residence', 'long_term_rental', 'vacant_secondary', 'major_renovation', 'medical_care', 'year_of_purchase'].includes(rawUse)
    ? rawUse
    : 'principal_residence';

  const monthsOccupied = Number.isFinite(Number(options.monthsOccupiedInYear))
    ? Math.max(0, Math.min(12, Math.floor(Number(options.monthsOccupiedInYear))))
    : 12;
  const armsLengthLease = options.hasArmsLengthTenancyAgreement !== false;
  const activePermits = Boolean(options.hasActiveBuildingPermits);
  const owner = boundedText(options.ownerName, 'Property Owner', 100);
  const taxYear = boundedText(options.calendarTaxYear, '2025', 10);
  const assessDate = safeIsoDate(options.assessmentDate, '2026-10-31');

  // 1. Audit Geographic Scope
  const isTaxableRegion = BC_SVT_TAXABLE_REGIONS.some(
    r => r.toLowerCase() === region.toLowerCase()
  );

  // 2. Determine Applicable Statutory Tax Rate
  let applicableRatePercent = BC_SVT_CONSTANTS.CANADIAN_RESIDENT_TAX_RATE_PERCENT;
  if (status === 'foreign_national' || isSatellite) {
    applicableRatePercent = BC_SVT_CONSTANTS.FOREIGN_AND_SATELLITE_TAX_RATE_PERCENT;
  }

  // 3. Evaluate Statutory Exemptions under SVT Act
  let isExempt = false;
  let exemptionReason = '';
  let statutoryAuthority = '';
  const statutoryProtections = [];
  const riskWarnings = [];
  const actionPlan = [];

  if (!isTaxableRegion) {
    isExempt = true;
    exemptionReason = `Geographic Exemption: ${region} is outside designated BC Speculation and Vacancy Tax regions.`;
    statutoryAuthority = 'Speculation and Vacancy Tax Regulation s. 2';
    statutoryProtections.push('Outside Taxable Area: Property is not subject to annual SVT filing or taxation.');
  } else if (propertyUse === 'principal_residence') {
    if (monthsOccupied >= BC_SVT_CONSTANTS.MINIMUM_OCCUPANCY_MONTHS_REQUIRED) {
      if (!isSatellite) {
        isExempt = true;
        exemptionReason = `Principal Residence Exemption: Occupied as primary home for ${monthsOccupied} months in ${taxYear}.`;
        statutoryAuthority = 'SVT Act s. 37';
        statutoryProtections.push('SVT Act s. 37: Canadian citizens and PRs living in their home as principal residence qualify for statutory exemption.');
      } else {
        isExempt = false;
        riskWarnings.push('SATELLITE FAMILY BAR: Members of a satellite family are legally barred from claiming the standard principal residence exemption under SVT Act s. 37(2).');
      }
    } else {
      isExempt = false;
      riskWarnings.push(`Insufficient Occupancy: Lived in home for ${monthsOccupied} months (minimum 6 months required for principal residence exemption).`);
    }
  } else if (propertyUse === 'long_term_rental') {
    if (monthsOccupied >= BC_SVT_CONSTANTS.MINIMUM_OCCUPANCY_MONTHS_REQUIRED && armsLengthLease) {
      isExempt = true;
      exemptionReason = `Tenancy Exemption: Leased to arm\'s-length tenant for ${monthsOccupied} months under written agreement.`;
      statutoryAuthority = 'SVT Act ss. 38–39';
      statutoryProtections.push('SVT Act s. 38: Arm\'s-length tenancies of at least 6 months qualify for full statutory exemption.');
    } else {
      isExempt = false;
      riskWarnings.push('Tenancy Shortfall: Rental must be occupied for at least 6 months with an arm\'s-length lease to qualify.');
    }
  } else if (propertyUse === 'major_renovation') {
    if (activePermits) {
      isExempt = true;
      exemptionReason = 'Building/Renovation Exemption: Substantial construction or renovation preventing occupancy with active municipal permits.';
      statutoryAuthority = 'SVT Act s. 40';
      statutoryProtections.push('SVT Act s. 40: Building or renovating a residence where construction prevents safe occupation qualifies for statutory exemption.');
    } else {
      isExempt = false;
      riskWarnings.push('Missing Municipal Permits: Renovation exemption under s. 40 requires active, unexpired building permits issued by the municipality.');
    }
  } else if (propertyUse === 'medical_care') {
    isExempt = true;
    exemptionReason = 'Medical Care Exemption: Owner resided in a hospital or licensed residential care facility.';
    statutoryAuthority = 'SVT Act s. 42';
    statutoryProtections.push('SVT Act s. 42: Absence due to medical care or long-term hospitalization qualifies for statutory exemption.');
  } else if (propertyUse === 'year_of_purchase') {
    isExempt = true;
    exemptionReason = 'Year of Acquisition Exemption: Purchased in current tax year with Property Transfer Tax paid.';
    statutoryAuthority = 'SVT Act s. 47';
    statutoryProtections.push('SVT Act s. 47: Property acquired in the calendar year is statutorily exempt from SVT for that year.');
  }

  // 4. Calculate Tax Liability
  const estimatedTaxLiabilityCad = isExempt
    ? 0
    : Number(((assessedValue * applicableRatePercent) / 100).toFixed(2));

  // 5. Build Action Plan
  if (isTaxableRegion) {
    actionPlan.push(`Complete online declaration at gov.bc.ca/spectax by March 31, ${Number(taxYear) + 1} using Letter ID and Declaration Code.`);
    if (isExempt) {
      actionPlan.push(`Claim exemption code under ${statutoryAuthority}: "${exemptionReason}".`);
    } else {
      actionPlan.push(`Prepare payment of estimated SVT assessment: $${estimatedTaxLiabilityCad.toFixed(2)} CAD by the statutory due date.`);
    }
  }

  return {
    ownerName: owner,
    assessmentDate: assessDate,
    taxYear,
    propertyRegion: region,
    isTaxableRegion,
    assessedPropertyValueCad: assessedValue,
    applicableTaxRatePercent: applicableRatePercent,
    isSatelliteFamily: isSatellite,
    propertyUseCategory: propertyUse,
    isExemptFromSvt: isExempt,
    exemptionReason: exemptionReason || 'No exemption criteria met',
    statutoryAuthority: statutoryAuthority || 'None',
    estimatedTaxLiabilityCad,
    statutoryProtections,
    riskWarnings,
    actionPlan
  };
}
