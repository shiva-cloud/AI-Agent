/**
 * British Columbia Employment Standards Act (BC ESA) Group Termination & Severance Navigator
 *
 * Implements statutory assessment rules under:
 * - Employment Standards Act, RSBC 1996, c. 113, Part 8:
 *   - Section 63: Liability resulting from length of service (individual notice/pay)
 *   - Section 64: Group terminations (50+ employees within 2 months)
 *   - Section 65: Exceptions to section 63 and 64
 *   - Section 66: Director's variance
 * - British Columbia Employment Standards Regulation, B.C. Reg. 396/95
 * - Bardal v. Globe & Mail Ltd. (1960), 24 D.L.R. (2d) 140 (Ont. H.C.) (Common law perspective)
 */

import { calculatorBoolean, calculatorDate, calculatorNumber } from './calculator-input.js';
import { boundedText, todayIso } from './text-input.js';

export const BC_GROUP_TERMINATION_THRESHOLDS = Object.freeze([
  { minEmployees: 300, maxEmployees: Infinity, requiredNoticeWeeks: 16 },
  { minEmployees: 100, maxEmployees: 299, requiredNoticeWeeks: 12 },
  { minEmployees: 50, maxEmployees: 99, requiredNoticeWeeks: 8 }
]);

export function calculateBcIndividualNoticeWeeks(consecutiveMonthsOfEmployment = 0) {
  const months = calculatorNumber(consecutiveMonthsOfEmployment, 'consecutiveMonthsOfEmployment', { max: 720 });
  if (months < 3) {
    return 0;
  }
  const years = Math.floor(months / 12);
  if (years < 1) {
    return 1; // 3 months to under 1 year
  }
  if (years < 3) {
    return 2; // 1 to 2 years
  }
  // 3+ years: 3 weeks plus 1 week per additional year, max 8
  return Math.min(8, 3 + (years - 3));
}

export function evaluateBcGroupTerminationNotice(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    employeeName = 'Employee',
    employerName = 'Employer',
    assessmentDate = todayIso(),
    affectedEmployeesCount = 0,
    twoMonthWindow: twoMonthWindowInput = true,
    singleLocation: singleLocationInput = true,
    groupNoticeWeeksGiven = 0,
    individualTenureMonths = 36,
    regularWeeklyWageCad = 1200,
    isUnionized: isUnionizedInput = false,
    ministerNotified: ministerNotifiedInput = false,
    unionNotified: unionNotifiedInput = false,
    isConstructionIndustry: isConstructionIndustryInput = false,
    isCasualOrSeasonalLayoff: isCasualOrSeasonalLayoffInput = false,
    isDefiniteTermContract: isDefiniteTermContractInput = false,
    isJustCauseTermination: isJustCauseTerminationInput = false
  } = safeParams;

  const cleanEmployeeName = boundedText(employeeName, 'Employee', 100);
  const cleanEmployerName = boundedText(employerName, 'Employer', 120);
  const cleanAssessmentDate = calculatorDate(assessmentDate, 'assessmentDate');
  const count = calculatorNumber(affectedEmployeesCount, 'affectedEmployeesCount', { max: 100000, integer: true });
  const weeklyWage = calculatorNumber(regularWeeklyWageCad, 'regularWeeklyWageCad', { max: 100000 });
  const noticeGiven = calculatorNumber(groupNoticeWeeksGiven, 'groupNoticeWeeksGiven', { max: 104 });
  const tenureMonths = calculatorNumber(individualTenureMonths, 'individualTenureMonths', { max: 720 });
  const twoMonthWindow = calculatorBoolean(twoMonthWindowInput, 'twoMonthWindow');
  const singleLocation = calculatorBoolean(singleLocationInput, 'singleLocation');
  const isUnionized = calculatorBoolean(isUnionizedInput, 'isUnionized');
  const ministerNotified = calculatorBoolean(ministerNotifiedInput, 'ministerNotified');
  const unionNotified = calculatorBoolean(unionNotifiedInput, 'unionNotified');
  const isConstructionIndustry = calculatorBoolean(isConstructionIndustryInput, 'isConstructionIndustry');
  const isCasualOrSeasonalLayoff = calculatorBoolean(isCasualOrSeasonalLayoffInput, 'isCasualOrSeasonalLayoff');
  const isDefiniteTermContract = calculatorBoolean(isDefiniteTermContractInput, 'isDefiniteTermContract');
  const isJustCauseTermination = calculatorBoolean(isJustCauseTerminationInput, 'isJustCauseTermination');

  const statutoryViolations = [];
  const complianceChecklist = [];
  const riskWarnings = [];

  // 1. Check Section 65 Statutory Exceptions
  if (isJustCauseTermination) {
    return {
      employeeName: cleanEmployeeName,
      employerName: cleanEmployerName,
      assessmentDate: cleanAssessmentDate,
      isSection64GroupTermination: false,
      isExemptUnderSection65: true,
      exemptionReason: 'Termination for just cause is strictly exempt from individual and group notice under BC ESA s. 65(1)(d).',
      statutoryGroupNoticeWeeksRequired: 0,
      statutoryIndividualNoticeWeeksRequired: 0,
      totalStatutoryNoticeWeeksRequired: 0,
      totalStatutoryLiabilityCad: 0,
      complianceStatus: 'EXEMPT_JUST_CAUSE',
      statutoryCitations: ['Employment Standards Act, RSBC 1996, c. 113, s. 65(1)(d)']
    };
  }

  if (isConstructionIndustry) {
    return {
      employeeName: cleanEmployeeName,
      employerName: cleanEmployerName,
      assessmentDate: cleanAssessmentDate,
      isSection64GroupTermination: false,
      isExemptUnderSection65: true,
      exemptionReason: 'Construction site employment is exempt from notice under BC ESA s. 65(1)(b).',
      statutoryGroupNoticeWeeksRequired: 0,
      statutoryIndividualNoticeWeeksRequired: 0,
      totalStatutoryNoticeWeeksRequired: 0,
      totalStatutoryLiabilityCad: 0,
      complianceStatus: 'EXEMPT_CONSTRUCTION',
      statutoryCitations: ['Employment Standards Act, RSBC 1996, c. 113, s. 65(1)(b)']
    };
  }

  if (isCasualOrSeasonalLayoff || isDefiniteTermContract) {
    return {
      employeeName: cleanEmployeeName,
      employerName: cleanEmployerName,
      assessmentDate: cleanAssessmentDate,
      isSection64GroupTermination: false,
      isExemptUnderSection65: true,
      exemptionReason: 'Employment for a definite term or completion of specific work is exempt under BC ESA s. 65(1)(a).',
      statutoryGroupNoticeWeeksRequired: 0,
      statutoryIndividualNoticeWeeksRequired: 0,
      totalStatutoryNoticeWeeksRequired: 0,
      totalStatutoryLiabilityCad: 0,
      complianceStatus: 'EXEMPT_TERM_OR_SEASONAL',
      statutoryCitations: ['Employment Standards Act, RSBC 1996, c. 113, s. 65(1)(a)']
    };
  }

  // 2. Assess Section 64 Group Termination Applicability
  const isGroupTermination = count >= 50 && twoMonthWindow && singleLocation;
  let requiredGroupWeeks = 0;

  if (isGroupTermination) {
    const matchedTier = BC_GROUP_TERMINATION_THRESHOLDS.find(
      tier => count >= tier.minEmployees && count <= tier.maxEmployees
    );
    requiredGroupWeeks = matchedTier ? matchedTier.requiredNoticeWeeks : 8;

    complianceChecklist.push({
      item: 'SECTION_64_THRESHOLD',
      status: 'TRIGGERED',
      details: `Group termination of ${count} employees triggered. Statutory minimum group notice is ${requiredGroupWeeks} weeks.`
    });

    // Check Minister notification (ESA s. 64(2))
    if (!ministerNotified) {
      statutoryViolations.push({
        violation: 'FAILURE_TO_NOTIFY_MINISTER',
        section: 'BC ESA s. 64(2)(a)',
        details: 'Employer failed to deliver written notice to the Minister of Labour as mandated by Section 64(2)(a).'
      });
    }

    // Check Union notification (if applicable)
    if (isUnionized && !unionNotified) {
      statutoryViolations.push({
        violation: 'FAILURE_TO_NOTIFY_TRADE_UNION',
        section: 'BC ESA s. 64(2)(b)',
        details: 'Employer failed to notify the certified trade union representing affected employees.'
      });
    }
  } else {
    complianceChecklist.push({
      item: 'SECTION_64_THRESHOLD',
      status: 'NOT_TRIGGERED',
      details: `Termination count of ${count} does not meet the 50-employee threshold at a single location within 2 months.`
    });
  }

  // 3. Group Notice Shortfall Calculation
  const groupShortfallWeeks = Math.max(0, requiredGroupWeeks - noticeGiven);
  const groupPayLiabilityCad = Math.round(groupShortfallWeeks * weeklyWage * 100) / 100;

  // 4. Individual Notice Calculation under Section 63
  const individualNoticeWeeks = calculateBcIndividualNoticeWeeks(tenureMonths);
  const individualPayLiabilityCad = Math.round(individualNoticeWeeks * weeklyWage * 100) / 100;

  // 5. Section 64(4) Stacking Doctrine:
  // "The notice required by this section is in addition to the liability of the employer under section 63."
  const totalCombinedStatutoryWeeks = groupShortfallWeeks + individualNoticeWeeks;
  const totalStatutoryLiabilityCad = Math.round((groupPayLiabilityCad + individualPayLiabilityCad) * 100) / 100;

  // Common Law Warning: Common law reasonable notice (Bardal) typically exceeds ESA minimums significantly
  const estimatedBardalNoticeMonths = Math.min(24, Math.max(1, Math.round(tenureMonths / 12 * 1.0 + 2)));
  riskWarnings.push({
    warning: 'COMMON_LAW_REASONABLE_NOTICE_EXPOSURE',
    details: `Statutory pay of ${totalCombinedStatutoryWeeks} weeks does not bar common law wrongful dismissal damages. Under Bardal principles, reasonable notice could range up to ${estimatedBardalNoticeMonths} months depending on character of employment, age, and availability of similar work.`
  });

  const isCompliant = statutoryViolations.length === 0 && (noticeGiven >= requiredGroupWeeks || groupShortfallWeeks === 0);

  return {
    employeeName: cleanEmployeeName,
    employerName: cleanEmployerName,
    assessmentDate: cleanAssessmentDate,
    isSection64GroupTermination: isGroupTermination,
    isExemptUnderSection65: false,
    affectedEmployeesCount: count,
    complianceStatus: isCompliant ? 'STATUTORILY_COMPLIANT' : 'STATUTORY_DEFICIENCY_DETECTED',
    groupTerminationDetails: {
      requiredNoticeWeeks: requiredGroupWeeks,
      noticeWeeksGiven: noticeGiven,
      shortfallWeeks: groupShortfallWeeks,
      statutoryGroupPayInLieuCad: groupPayLiabilityCad
    },
    individualNoticeDetails: {
      consecutiveMonthsOfEmployment: tenureMonths,
      statutorySection63Weeks: individualNoticeWeeks,
      statutoryIndividualPayInLieuCad: individualPayLiabilityCad
    },
    totalLiabilityAssessment: {
      stackedNoticeWeeks: totalCombinedStatutoryWeeks,
      totalStatutoryPayInLieuCad: totalStatutoryLiabilityCad,
      regularWeeklyWageCad: weeklyWage
    },
    statutoryViolations,
    complianceChecklist,
    riskWarnings,
    statutoryCitations: [
      'Employment Standards Act, RSBC 1996, c. 113, ss. 63, 64, 65, 66',
      'British Columbia Employment Standards Regulation, B.C. Reg. 396/95',
      'Bardal v. Globe & Mail Ltd. (1960), 24 D.L.R. (2d) 140 (Ont. H.C.)'
    ]
  };
}
