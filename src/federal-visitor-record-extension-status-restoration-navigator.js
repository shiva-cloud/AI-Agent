/**
 * Federal Visitor Record Extension & Status Restoration Navigator
 *
 * Evaluates in-time visitor extensions, maintained status under IRPR s. 183(5),
 * 90-day restoration eligibility under IRPR s. 182, and statutory inadmissibility
 * under Canada's Immigration and Refugee Protection Act and Regulations.
 *
 * Pure ES module — zero runtime npm dependencies.
 */

import { boundedText } from './text-input.js';

export const FEDERAL_VISITOR_STATUS_CONSTANTS = Object.freeze({
  STATUTORY_RESTORATION_DEADLINE_DAYS: 90, // IRPR s. 182(1)
  VISITOR_RECORD_PROCESSING_FEE_CAD: 100, // IRPR s. 298
  STATUS_RESTORATION_FEE_CAD: 229, // IRPR s. 306
  STATUTORY_AUTHORITY: 'IRPA ss. 20, 29; IRPR ss. 181, 182, 183(5), 306'
});

/**
 * Audits visitor extension timeliness, maintained status validity, and 90-day restoration eligibility.
 *
 * @param {Object} params
 * @param {string} [params.statusExpiryDate] - Official expiry date of current authorized stay (YYYY-MM-DD)
 * @param {string} [params.applicationSubmissionDate] - Date application was or will be submitted to IRCC (YYYY-MM-DD)
 * @param {boolean} [params.hasMetInitialStayConditions=true] - Complied with all original visitor conditions (no illegal work/study)
 * @param {boolean} [params.hasSufficientFinancialSupport=true] - Proven funds to support extended stay without recourse to social assistance
 * @param {boolean} [params.holdsValidPassport=true] - Passport valid for full duration of requested extension
 * @param {boolean} [params.isSubjectToRemovalOrderOrReport=false] - Inadmissibility report under IRPA s. 44(1) or active removal order
 * @returns {Object} Maintained status determination, restoration audit, and actionable IRCC guidance
 */
export function evaluateFederalVisitorExtensionAndRestoration(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    statusExpiryDate,
    applicationSubmissionDate,
    hasMetInitialStayConditions = true,
    hasSufficientFinancialSupport = true,
    holdsValidPassport = true,
    isSubjectToRemovalOrderOrReport = false
  } = safeParams;
  const todayStr = new Date().toISOString().slice(0, 10);
  const rawSubDate = boundedText(applicationSubmissionDate, todayStr, 30);
  const subDate = rawSubDate && !Number.isNaN(Date.parse(rawSubDate)) ? rawSubDate : todayStr;
  const rawExpDate = boundedText(statusExpiryDate, subDate, 30);
  const expiryStr = rawExpDate && !Number.isNaN(Date.parse(rawExpDate)) ? rawExpDate : subDate;

  const expiryTime = new Date(expiryStr).getTime();
  const submissionTime = new Date(subDate).getTime();

  const msPerDay = 1000 * 60 * 60 * 24;
  const daysDifference = Math.floor((submissionTime - expiryTime) / msPerDay);

  const isInTimeExtension = daysDifference <= 0;
  const daysSinceStatusLoss = Math.max(0, daysDifference);
  const isWithin90DayRestorationWindow = !isInTimeExtension && daysSinceStatusLoss <= FEDERAL_VISITOR_STATUS_CONSTANTS.STATUTORY_RESTORATION_DEADLINE_DAYS;
  const isPast90DayRestorationDeadline = !isInTimeExtension && daysSinceStatusLoss > FEDERAL_VISITOR_STATUS_CONSTANTS.STATUTORY_RESTORATION_DEADLINE_DAYS;

  const initialConditionsMet = hasMetInitialStayConditions !== false;
  const financialSupportMet = hasSufficientFinancialSupport !== false;
  const validPassportHeld = holdsValidPassport !== false;
  const removalReportOrOrder = Boolean(isSubjectToRemovalOrderOrReport);

  const statutoryViolations = [];
  const riskWarnings = [];
  const actionableRemedies = [];

  let statusClassification = 'IN_TIME_EXTENSION_MAINTAINED_STATUS';
  let legalVerdict = 'Application submitted prior to status expiry. Applicant benefits from Maintained Status under IRPR s. 183(5) while awaiting decision.';
  let isEligible = true;

  // 1. In-time vs Expired Analysis
  if (isInTimeExtension) {
    statusClassification = 'IN_TIME_EXTENSION_MAINTAINED_STATUS';
  } else if (isWithin90DayRestorationWindow) {
    statusClassification = 'ELIGIBLE_FOR_90_DAY_RESTORATION';
    const daysRemainingToRestore = FEDERAL_VISITOR_STATUS_CONSTANTS.STATUTORY_RESTORATION_DEADLINE_DAYS - daysSinceStatusLoss;
    legalVerdict = `Status expired ${daysSinceStatusLoss} day${daysSinceStatusLoss === 1 ? '' : 's'} ago. Applicant is eligible to apply for Restoration of Status under IRPR s. 182 (${daysRemainingToRestore} day${daysRemainingToRestore === 1 ? '' : 's'} remaining).`;

    riskWarnings.push({
      warningType: 'NO_MAINTAINED_STATUS_DURING_RESTORATION',
      description: 'Applicant does not have maintained status while restoration is pending and must not engage in any unauthorized activity.'
    });

    actionableRemedies.push({
      action: 'SUBMIT_FORM_IMM_5708_WITH_RESTORATION_FEE',
      remedyDescription: `Submit visitor application selecting "Restore my status as a visitor" and pay combined fee of $329 ($100 extension + $229 restoration) before the 90-day deadline.`
    });
  } else {
    // Past 90 days!
    statusClassification = 'STATUTORILY_BARRED_FROM_RESTORATION';
    isEligible = false;
    legalVerdict = `Status expired ${daysSinceStatusLoss} days ago, exceeding the strict 90-day restoration window under IRPR s. 182. Restoration inside Canada is legally barred.`;

    statutoryViolations.push({
      rule: 'RESTORATION_DEADLINE_EXCEEDED_OUT_OF_STATUS',
      statute: 'IRPR s. 182(1) & IRPA s. 41',
      finding: `Over 90 days have elapsed since status expiry. Foreign national is out of status and inadmissible to Canada for non-compliance.`
    });

    actionableRemedies.push({
      action: 'DEPART_CANADA_OR_SEEK_H_AND_C',
      remedyDescription: 'Foreign national must depart Canada voluntarily before an enforceable removal order is issued, or consult immigration counsel regarding Humanitarian and Compassionate (H&C) considerations under IRPA s. 25.'
    });
  }

  // 2. Initial Condition Compliance Audit
  if (!initialConditionsMet) {
    isEligible = false;
    statutoryViolations.push({
      rule: 'NON_COMPLIANCE_WITH_INITIAL_CONDITIONS',
      statute: 'IRPR s. 182(2)',
      finding: 'Applicant has not complied with conditions imposed on entry (e.g. worked or studied without authorization).'
    });
    actionableRemedies.push({
      action: 'RECTIFY_UNAUTHORIZED_ACTIVITY',
      remedyDescription: 'Cease any unauthorized employment or studies immediately; document mitigating factors.'
    });
  }

  // 3. Removal Order or Section 44 Report
  if (removalReportOrOrder) {
    isEligible = false;
    statutoryViolations.push({
      rule: 'ACTIVE_REMOVAL_ORDER_OR_44_REPORT',
      statute: 'IRPA ss. 44(1), 48',
      finding: 'Applicant is subject to an active Section 44(1) inadmissibility report or enforceable Departure/Deportation Order, barring restoration.'
    });
  }

  // 4. Financial and Passport validity
  if (!financialSupportMet) {
    riskWarnings.push({
      warningType: 'INSUFFICIENT_FUNDS_FOR_STAY',
      description: 'Lack of liquid settlement funds or host support increases refusal risk under IRPR s. 179(b).'
    });
  }

  if (!validPassportHeld) {
    riskWarnings.push({
      warningType: 'PASSPORT_EXPIRY_LIMITATION',
      description: 'An extension cannot be granted beyond the validity of the applicant’s passport under IRPR s. 52.'
    });
  }

  // Statutory Fees
  const basicFee = FEDERAL_VISITOR_STATUS_CONSTANTS.VISITOR_RECORD_PROCESSING_FEE_CAD;
  const restorationFee = (isWithin90DayRestorationWindow || isPast90DayRestorationDeadline)
    ? FEDERAL_VISITOR_STATUS_CONSTANTS.STATUS_RESTORATION_FEE_CAD
    : 0;
  const totalFeesPayableCad = basicFee + restorationFee;

  return {
    jurisdiction: 'FEDERAL_CANADA',
    statusExpiryDate: expiryStr,
    applicationSubmissionDate: subDate,
    daysSinceStatusLoss,
    isInTimeExtension,
    isWithin90DayRestorationWindow,
    isPast90DayRestorationDeadline,
    statusClassification,
    isEligible,
    legalVerdict,
    feeSchedule: {
      visitorExtensionFeeCad: basicFee,
      restorationFeeCad: restorationFee,
      totalFeesPayableCad
    },
    statutoryViolations,
    riskWarnings,
    actionableRemedies,
    statutoryCitations: [
      'Immigration and Refugee Protection Act, S.C. 2001, c. 27, ss. 20, 29, 41, 44',
      'Immigration and Refugee Protection Regulations, SOR/2002-227, ss. 181, 182, 183(5), 306',
      'IRCC Operational Instructions: Temporary Residents - Restoration of Status'
    ]
  };
}
