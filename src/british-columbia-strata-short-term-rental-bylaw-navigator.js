/**
 * British Columbia Strata Short-Term Rental Bylaw Navigator
 *
 * Audits strata short-term rental (STR) prohibitions, provincial principal
 * residence compliance, and $1,000/day fine enforcement under the Strata Property Act,
 * SBC 1998, c. 43, the Strata Property Regulation, B.C. Reg. 43/2000, s. 7.1,
 * and the Short-Term Rental Accommodations Act, SBC 2023, c. 35 (STRAA).
 *
 * Pure ES module — zero runtime npm dependencies.
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const BC_STRATA_STR_CONSTANTS = Object.freeze({
  MAX_DAILY_FINE_STR_BYLAW_VIOLATION_CAD: 1000, // Strata Property Regulation s. 7.1(2)
  MAX_STANDARD_BYLAW_FINE_CAD: 200, // Reg s. 7.1(1)
  PROVINCIAL_STR_DAYS_THRESHOLD: 90, // Under 90 consecutive days constitutes short-term accommodation
  MIN_COMMUNITY_POPULATION_PRINCIPAL_RESIDENCE_RULE: 10000, // STRAA s. 13
  STATUTORY_AUTHORITY: 'Strata Property Act, SBC 1998, c. 43, ss. 130, 135, 141; STRAA, SBC 2023, c. 35'
});

/**
 * Audits short-term rental compliance, strata fine validity, and procedural defense rights.
 *
 * @param {Object} params
 * @param {boolean} [params.hasRegisteredStrBylawProhibition=true] - Strata has a registered bylaw prohibiting STRs (<90 days)
 * @param {boolean} [params.isPrincipalResidence=true] - Property is host's principal residence (occupied for longest period of the year)
 * @param {number} [params.rentalStayDays=5] - Duration of the guest booking/stay in days
 * @param {number} [params.communityPopulation=25000] - Municipality or regional district population
 * @param {number} [params.fineAmountPerDayCad=1000] - Daily fine amount assessed by strata council
 * @param {number} [params.totalDaysFined=3] - Number of days fine has been levied
 * @param {boolean} [params.receivedWrittenNoticeOfComplaint=true] - Received written notice and particulars under SPA s. 135(1)(a)
 * @param {boolean} [params.providedOpportunityToBeHeard=true] - Given reasonable opportunity to respond/request hearing under SPA s. 135(1)(b)
 * @param {boolean} [params.isOperatingSecondarySuiteOrLaneway=false] - STR operated in legal secondary suite/laneway on principal parcel
 * @returns {Object} Strata bylaw audit, fine enforceability, and CRT defense assessment
 */
export function auditBcStrataShortTermRental(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    hasRegisteredStrBylawProhibition = true,
    isPrincipalResidence = true,
    rentalStayDays = 5,
    communityPopulation = 25000,
    fineAmountPerDayCad = 1000,
    totalDaysFined = 3,
    receivedWrittenNoticeOfComplaint = true,
    providedOpportunityToBeHeard = true,
    isOperatingSecondarySuiteOrLaneway = false,
    hostName = 'Strata Host',
    strataPlanNumber = 'LMS 1234',
    unitNumber = '101',
    assessmentDate = '2026-10-31'
  } = safeParams;
  const safeHostName = boundedText(hostName, 'Strata Host', 100);
  const safeStrataPlan = boundedText(strataPlanNumber, 'LMS 1234', 50);
  const safeUnitNumber = boundedText(unitNumber, '101', 20);
  const safeAssessmentDate = safeIsoDate(assessmentDate, '2026-10-31');
  const stayDays = Math.max(0, Math.min(3650, Number.isFinite(Number(rentalStayDays)) ? Number(rentalStayDays) : 5));
  const pop = Math.max(0, Math.min(10000000, Number.isFinite(Number(communityPopulation)) ? Number(communityPopulation) : 25000));
  const dailyFine = Math.max(0, Math.min(100000, Number.isFinite(Number(fineAmountPerDayCad)) ? Number(fineAmountPerDayCad) : 1000));
  const daysFined = Math.max(0, Math.min(3650, Number.isFinite(Number(totalDaysFined)) ? Number(totalDaysFined) : 3));

  const isStrByDefinition = stayDays < BC_STRATA_STR_CONSTANTS.PROVINCIAL_STR_DAYS_THRESHOLD;
  const isSubjectToProvincialPrincipalResidenceRule = pop >= BC_STRATA_STR_CONSTANTS.MIN_COMMUNITY_POPULATION_PRINCIPAL_RESIDENCE_RULE;

  const statutoryViolations = [];
  const fineDefects = [];
  const riskWarnings = [];
  const actionableRemedies = [];

  // 1. Provincial STRAA Principal Residence Audit
  const violatesProvincialPrincipalResidence =
    isStrByDefinition &&
    isSubjectToProvincialPrincipalResidenceRule &&
    !isPrincipalResidence &&
    !isOperatingSecondarySuiteOrLaneway;

  if (violatesProvincialPrincipalResidence) {
    statutoryViolations.push({
      rule: 'PROVINCIAL_STRAA_PRINCIPAL_RESIDENCE_BREACH',
      statute: 'Short-Term Rental Accommodations Act, SBC 2023, c. 35, s. 13',
      finding: `In communities of 10,000+ population, short-term rentals (<90 days) are prohibited in non-principal residences. Host does not reside principally in this strata lot.`
    });
    actionableRemedies.push({
      action: 'CEASE_NON_PRINCIPAL_RESIDENCE_STR',
      remedyDescription: 'Convert the property to long-term residential tenancy (90+ consecutive days) or occupy as owner’s principal residence.'
    });
  }

  // 2. Strata Bylaw Prohibition Audit
  const violatesStrataBylaw = isStrByDefinition && hasRegisteredStrBylawProhibition;
  if (violatesStrataBylaw) {
    statutoryViolations.push({
      rule: 'STRATA_STR_BYLAW_CONTRAVENTION',
      statute: 'Strata Property Act s. 141',
      finding: `Strata corporation has an enforceable bylaw prohibiting short-term accommodations (<90 days). The ${stayDays}-day booking violates strata bylaws.`
    });
    actionableRemedies.push({
      action: 'CANCEL_OR_CEASE_STR_LISTINGS',
      remedyDescription: 'Deactivate Airbnb/VRBO listings to prevent continuing daily strata fines.'
    });
  }

  // 3. Fining Power & Procedural Due Process Audit (SPA ss. 130, 135)
  // Max daily fine is $1,000 per day under Reg s. 7.1(2)
  if (dailyFine > BC_STRATA_STR_CONSTANTS.MAX_DAILY_FINE_STR_BYLAW_VIOLATION_CAD) {
    fineDefects.push({
      defectType: 'EXCESSIVE_FINE_ABOVE_STATUTORY_CEILING',
      statute: 'Strata Property Regulation, B.C. Reg. 43/2000, s. 7.1(2)',
      description: `Daily fine of $${dailyFine} exceeds the absolute statutory maximum fine of $1,000 per day.`
    });
  }

  // Procedural requirements under SPA s. 135
  if (!receivedWrittenNoticeOfComplaint) {
    fineDefects.push({
      defectType: 'NO_WRITTEN_NOTICE_OF_COMPLAINT',
      statute: 'Strata Property Act s. 135(1)(a)',
      description: 'Strata council failed to provide written notice and particulars of the complaint before imposing fines, rendering fines void ab initio.'
    });
  }

  if (!providedOpportunityToBeHeard) {
    fineDefects.push({
      defectType: 'DENIAL_OF_OPPORTUNITY_TO_BE_HEARD',
      statute: 'Strata Property Act s. 135(1)(b)',
      description: 'Strata council failed to provide a reasonable opportunity to answer the complaint or request a hearing before imposing fines.'
    });
  }

  const areFinesLegallyEnforceable = fineDefects.length === 0 && violatesStrataBylaw;
  const totalAssessedFinesCad = dailyFine * daysFined;

  if (fineDefects.length > 0 && daysFined > 0) {
    actionableRemedies.push({
      action: 'FILE_CRT_DISPUTE_UNLAWFUL_FINES',
      remedyDescription: 'File a strata dispute claim with the Civil Resolution Tribunal (CRT) under the Civil Resolution Tribunal Act to invalidate unenforceable fines.'
    });
  }

  let complianceStatus = 'COMPLIANT_NO_STRATA_OR_PROVINCIAL_BREACH';
  let legalVerdict = 'Property use complies with British Columbia Short-Term Rental Accommodations Act and Strata Property Act regulations.';

  if (fineDefects.length > 0) {
    complianceStatus = 'STRATA_FINES_DEFECTIVE_PROCEDURAL_BREACH';
    legalVerdict = `Strata fines of $${totalAssessedFinesCad} are procedurally defective and unenforceable under Strata Property Act s. 135 (${fineDefects.length} defect${fineDefects.length === 1 ? '' : 's'}).`;
  } else if (statutoryViolations.length > 0) {
    complianceStatus = 'UNLAWFUL_SHORT_TERM_RENTAL_ACTIVE';
    legalVerdict = `Short-term rental operation violates strata bylaws and/or provincial legislation. Daily fines up to $1,000/day are legally enforceable.`;
  }

  return {
    jurisdiction: 'BRITISH_COLUMBIA_CANADA',
    hostName: safeHostName,
    strataPlanNumber: safeStrataPlan,
    unitNumber: safeUnitNumber,
    assessmentDate: safeAssessmentDate,
    stayDurationDays: stayDays,
    isShortTermRental: isStrByDefinition,
    hasRegisteredStrBylawProhibition,
    isSubjectToProvincialPrincipalResidenceRule,
    totalAssessedFinesCad,
    areFinesLegallyEnforceable,
    complianceStatus,
    legalVerdict,
    fineAudit: {
      dailyFineAmountCad: dailyFine,
      daysFined,
      statutoryMaxDailyFineCad: BC_STRATA_STR_CONSTANTS.MAX_DAILY_FINE_STR_BYLAW_VIOLATION_CAD,
      compliedWithSection135Notice: receivedWrittenNoticeOfComplaint,
      compliedWithSection135Hearing: providedOpportunityToBeHeard,
      fineDefects
    },
    statutoryViolations,
    riskWarnings,
    actionableRemedies,
    statutoryCitations: [
      'Strata Property Act, SBC 1998, c. 43, ss. 130, 135, 141',
      'Strata Property Regulation, B.C. Reg. 43/2000, s. 7.1',
      'Short-Term Rental Accommodations Act, SBC 2023, c. 35 (STRAA)',
      'Civil Resolution Tribunal Act, SBC 2012, c. 25'
    ]
  };
}
