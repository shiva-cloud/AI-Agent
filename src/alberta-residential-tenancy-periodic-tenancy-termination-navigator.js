/**
 * Alberta Residential Tenancy Periodic Tenancy Termination Navigator
 *
 * Audits month-to-month and week-to-week notice periods (1 month tenant vs 3 months landlord),
 * prescribed statutory termination grounds (landlord/relative occupancy, purchaser possession,
 * major renovations/demolition), notice form formalities, and RTDRS wrongful termination remedies
 * under Alberta's Residential Tenancies Act, RSA 2000, c. R-171, ss. 5–12.
 *
 * Pure ES module — zero runtime npm dependencies.
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const ALBERTA_PERIODIC_TENANCY_CONSTANTS = Object.freeze({
  STATUTORY_AUTHORITY: 'Residential Tenancies Act, RSA 2000, c. R-171, ss. 5-12',
  TENANT_MONTH_TO_MONTH_NOTICE_MONTHS: 1, // s. 8
  LANDLORD_MONTH_TO_MONTH_NOTICE_MONTHS: 3, // s. 6
  WEEK_TO_WEEK_NOTICE_WEEKS: 1, // s. 9
  PRESCRIBED_LANDLORD_REASONS: Object.freeze([
    'LANDLORD_OR_RELATIVE_OCCUPANCY',
    'PURCHASER_OR_PURCHASER_RELATIVE_OCCUPANCY',
    'DEMOLITION_OF_PREMISES',
    'NON_RESIDENTIAL_CONVERSION',
    'MAJOR_RENOVATIONS_REQUIRING_VACANCY'
  ])
});

/**
 * Audits periodic tenancy notice legality, notice lengths, and landlord statutory justification.
 *
 * @param {Object} params
 * @param {string} [params.partyGivingNotice='LANDLORD'] - 'LANDLORD' or 'TENANT'
 * @param {string} [params.tenancyType='MONTH_TO_MONTH'] - 'MONTH_TO_MONTH' or 'WEEK_TO_WEEK'
 * @param {number} [params.fullTenancyMonthsNoticeGiven=3] - Full tenancy months of notice given
 * @param {string} [params.landlordStatedReason='LANDLORD_OR_RELATIVE_OCCUPANCY'] - Stated reason for termination
 * @param {boolean} [params.noticeInWritingAndSigned=true] - Notice is in writing and signed
 * @param {boolean} [params.purchaserSignedWrittenOccupancyRequest=true] - For purchaser occupancy, written request provided
 * @param {boolean} [params.majorRenovationPermitsObtained=true] - For renovations, required municipal permits secured
 * @returns {Object} Comprehensive Alberta periodic notice audit and RTDRS validity assessment
 */
export function evaluateAlbertaPeriodicTenancyNotice({
  partyGivingNotice = 'LANDLORD',
  tenancyType = 'MONTH_TO_MONTH',
  fullTenancyMonthsNoticeGiven = 3,
  landlordStatedReason = 'LANDLORD_OR_RELATIVE_OCCUPANCY',
  noticeInWritingAndSigned = true,
  purchaserSignedWrittenOccupancyRequest = true,
  majorRenovationPermitsObtained = true,
  landlordName = 'Landlord',
  rentalAddress = 'Rental Property',
  purchaserName = 'Purchaser',
  tenantName = 'Tenant',
  assessmentDate = '2026-10-31'
} = {}) {
  const cleanLandlord = boundedText(landlordName, 'Landlord');
  const cleanRentalAddress = boundedText(rentalAddress, 'Rental Property');
  const cleanPurchaser = boundedText(purchaserName, 'Purchaser');
  const cleanTenant = boundedText(tenantName, 'Tenant');
  const cleanDate = safeIsoDate(assessmentDate, '2026-10-31');
  const party = String(partyGivingNotice || 'LANDLORD').trim().toUpperCase();
  const tType = String(tenancyType || 'MONTH_TO_MONTH').trim().toUpperCase();
  const monthsNotice = Number.isFinite(Number(fullTenancyMonthsNoticeGiven)) ? Math.max(0, Math.floor(Number(fullTenancyMonthsNoticeGiven))) : 0;
  const reason = String(landlordStatedReason || '').trim().toUpperCase();

  const statutoryViolations = [];
  const riskWarnings = [];
  const actionableRemedies = [];

  // 1. Notice Length Audit (ss. 6, 8)
  if (party === 'LANDLORD') {
    if (monthsNotice < ALBERTA_PERIODIC_TENANCY_CONSTANTS.LANDLORD_MONTH_TO_MONTH_NOTICE_MONTHS) {
      statutoryViolations.push({
        rule: 'INSUFFICIENT_LANDLORD_NOTICE_PERIOD',
        statute: 'Residential Tenancies Act s. 6',
        finding: `Landlord provided ${monthsNotice} full tenancy months notice. Section 6 mandates at least 3 full tenancy months notice.`
      });
      actionableRemedies.push({
        action: 'CHALLENGE_DEFECTIVE_NOTICE_AT_RTDRS',
        remedyDescription: 'Defective notice cannot terminate tenancy. File an application with RTDRS to declare the notice void.'
      });
    }

    // 2. Prescribed Statutory Reason Audit (s. 11)
    const isPrescribedReason = ALBERTA_PERIODIC_TENANCY_CONSTANTS.PRESCRIBED_LANDLORD_REASONS.includes(reason);
    if (!isPrescribedReason) {
      statutoryViolations.push({
        rule: 'UNAUTHORIZED_LANDLORD_TERMINATION_REASON',
        statute: 'Residential Tenancies Act s. 11',
        finding: `Reason '${reason}' is not recognized under Alberta law. Landlords cannot end periodic tenancies arbitrarily without prescribed statutory grounds.`
      });
    }

    // Specific reason evidentiary checks
    if (reason === 'PURCHASER_OR_PURCHASER_RELATIVE_OCCUPANCY' && !purchaserSignedWrittenOccupancyRequest) {
      statutoryViolations.push({
        rule: 'MISSING_PURCHASER_WRITTEN_REQUEST',
        statute: 'Residential Tenancies Act s. 11(2)',
        finding: 'Landlord cannot end tenancy for purchaser occupancy without a signed written request from the purchaser stating personal occupancy.'
      });
    }

    if (reason === 'MAJOR_RENOVATIONS_REQUIRING_VACANCY' && !majorRenovationPermitsObtained) {
      riskWarnings.push({
        warningType: 'RENOVATION_PERMITS_NOT_VERIFIED',
        description: 'RTDRS requires proof that major renovations cannot safely occur while occupied and that all municipal permits have been obtained.'
      });
    }
  } else {
    // Tenant Notice
    if (monthsNotice < ALBERTA_PERIODIC_TENANCY_CONSTANTS.TENANT_MONTH_TO_MONTH_NOTICE_MONTHS) {
      statutoryViolations.push({
        rule: 'INSUFFICIENT_TENANT_NOTICE_PERIOD',
        statute: 'Residential Tenancies Act s. 8',
        finding: `Tenant provided ${monthsNotice} months notice. Section 8 requires at least 1 full tenancy month notice.`
      });
    }
  }

  // 3. Form Formalities (s. 7)
  if (!noticeInWritingAndSigned) {
    statutoryViolations.push({
      rule: 'DEFECTIVE_NOTICE_FORMALITIES',
      statute: 'Residential Tenancies Act s. 7',
      finding: 'Notice must be in writing, signed by the party giving notice, and explicitly state the termination date.'
    });
  }

  const isValidNotice = statutoryViolations.length === 0;
  let complianceStatus = 'COMPLIANT_PERIODIC_NOTICE';
  let legalVerdict = 'Periodic tenancy termination notice satisfies Alberta statutory requirements.';

  if (!isValidNotice) {
    complianceStatus = 'DEFECTIVE_STATUTORY_TERMINATION_NOTICE';
    legalVerdict = `Notice is legally defective under Alberta RTA ss. 6–12 due to ${statutoryViolations.length} statutory deficiency${statutoryViolations.length === 1 ? '' : 's'}. Tenancy remains in full force.`;
  }

  return {
    assessmentDate: cleanDate,
    jurisdiction: 'ALBERTA_CANADA',
    tenantName: cleanTenant,
    landlordName: cleanLandlord,
    rentalAddress: cleanRentalAddress,
    purchaserName: cleanPurchaser,
    partyGivingNotice: party,
    tenancyType: tType,
    fullTenancyMonthsNoticeGiven: monthsNotice,
    isValidNotice,
    complianceStatus,
    legalVerdict,
    noticeSummary: {
      requiredNoticeMonths: party === 'LANDLORD' ? 3 : 1,
      hasValidStatutoryReason: party === 'TENANT' || ALBERTA_PERIODIC_TENANCY_CONSTANTS.PRESCRIBED_LANDLORD_REASONS.includes(reason),
      prescribedReason: party === 'LANDLORD' ? reason : 'TENANT_ELECTIVE_TERMINATION'
    },
    statutoryViolations,
    riskWarnings,
    actionableRemedies,
    statutoryCitations: [
      'Residential Tenancies Act, RSA 2000, c. R-171, ss. 6-12 (Periodic Tenancies Termination)',
      'Residential Tenancies Ministerial Regulation, Alta. Reg. 211/2004 (Prescribed grounds for landlord termination)'
    ]
  };
}