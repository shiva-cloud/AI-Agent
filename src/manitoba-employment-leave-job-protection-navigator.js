/**
 * Manitoba Employment Standards Code (ESC) Statutory Leave & Job Protection Navigator
 *
 * Implements statutory assessment rules under:
 * - The Employment Standards Code, C.C.S.M. c. E110:
 *   - Section 52: Maternity Leave (Up to 17 weeks)
 *   - Section 54: Parental Leave (Up to 63 weeks)
 *   - Section 59.1: Family Leave (3 days unpaid per year for family illness or responsibilities)
 *   - Section 59.11: Interpersonal Violence Leave (Up to 10 days [5 paid, 5 unpaid] + 17 continuous weeks)
 *   - Section 59.2: Serious Illness or Injury Leave (Up to 17 weeks unpaid)
 *   - Section 60: Job protection, prohibition against termination or reprisal, mandatory reinstatement
 * - Employment Standards Regulation, Man. Reg. 6/2007
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const MANITOBA_SERVICE_REQUIREMENTS = Object.freeze({
  MATERNITY_LEAVE_MONTHS: 7,
  PARENTAL_LEAVE_MONTHS: 7,
  SERIOUS_ILLNESS_DAYS: 90,
  INTERPERSONAL_VIOLENCE_DAYS: 90,
  FAMILY_LEAVE_DAYS: 30
});

export const MANITOBA_MAX_LEAVE_WEEKS = Object.freeze({
  MATERNITY: 17,
  PARENTAL: 63,
  SERIOUS_ILLNESS: 17,
  INTERPERSONAL_VIOLENCE_CONTINUOUS: 17
});

export function evaluateManitobaEmploymentLeave(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const cleanEmployeeName = boundedText(safeParams.employeeName, 'Employee', 100);
  const cleanEmployerName = boundedText(safeParams.employerName, 'Employer', 120);
  const cleanAssessmentDate = safeIsoDate(safeParams.assessmentDate, '2026-10-31');
  const normalizedType = boundedText(safeParams.leaveType, 'MATERNITY', 50).toUpperCase();
  const monthsService = Number.isFinite(Number(safeParams.monthsOfContinuousService)) ? Math.max(0, Math.min(600, Number(safeParams.monthsOfContinuousService))) : 8;
  const daysService = Number.isFinite(Number(safeParams.daysOfContinuousService)) ? Math.max(0, Math.min(18000, Number(safeParams.daysOfContinuousService))) : 240;
  const weeksReq = Number.isFinite(Number(safeParams.weeksRequested)) ? Math.max(0, Math.min(104, Number(safeParams.weeksRequested))) : 17;
  const ivDaysReq = Number.isFinite(Number(safeParams.interpersonalViolenceDaysRequested)) ? Math.max(0, Math.min(10, Number(safeParams.interpersonalViolenceDaysRequested))) : 5;
  const medicalCert = safeParams.hasMedicalCertificateProvided !== false;
  const writtenNotice = safeParams.hasWrittenNoticeGiven !== false;
  const noticeWeeks = Number.isFinite(Number(safeParams.noticeWeeksGiven)) ? Math.max(0, Math.min(52, Number(safeParams.noticeWeeksGiven))) : 2;
  const employerRefused = Boolean(safeParams.employerRefusedLeave);
  const employerDismissed = Boolean(safeParams.employerDismissedOrDisciplinedEmployee);
  const employerRefusesReinstatement = Boolean(safeParams.employerRefusesReinstatementToSameOrComparableRole);
  const wage = Number.isFinite(Number(safeParams.regularHourlyWageCad)) ? Math.max(0, Math.min(10000, Number(safeParams.regularHourlyWageCad))) : 24;
  const weeklyHours = Number.isFinite(Number(safeParams.regularWeeklyHours)) ? Math.max(0, Math.min(168, Number(safeParams.regularWeeklyHours))) : 40;

  const statutoryFindings = [];
  const statutoryViolations = [];
  const actionableRemedies = [];
  const complianceChecklist = [];

  let isServiceRequirementMet = false;
  let maxPermissibleWeeks = 0;
  let paidDaysEntitlement = 0;
  let paidLeaveCompensationCad = 0;

  // 1. Service Requirement & Maximum Leave Duration Audit
  switch (normalizedType) {
    case 'MATERNITY':
      maxPermissibleWeeks = MANITOBA_MAX_LEAVE_WEEKS.MATERNITY;
      isServiceRequirementMet = monthsService >= MANITOBA_SERVICE_REQUIREMENTS.MATERNITY_LEAVE_MONTHS;
      if (isServiceRequirementMet) {
        complianceChecklist.push({
          item: 'MATERNITY_SERVICE_TENURE',
          status: 'MET',
          details: `Continuous service of ${monthsService} months satisfies statutory minimum of ${MANITOBA_SERVICE_REQUIREMENTS.MATERNITY_LEAVE_MONTHS} months (s. 52).`
        });
      } else {
        statutoryViolations.push({
          violation: 'INSUFFICIENT_SERVICE_TENURE',
          section: 'Manitoba ESC s. 52',
          details: `Maternity leave requires at least ${MANITOBA_SERVICE_REQUIREMENTS.MATERNITY_LEAVE_MONTHS} months continuous employment; currently at ${monthsService} months.`
        });
      }
      break;

    case 'PARENTAL':
      maxPermissibleWeeks = MANITOBA_MAX_LEAVE_WEEKS.PARENTAL;
      isServiceRequirementMet = monthsService >= MANITOBA_SERVICE_REQUIREMENTS.PARENTAL_LEAVE_MONTHS;
      if (isServiceRequirementMet) {
        complianceChecklist.push({
          item: 'PARENTAL_SERVICE_TENURE',
          status: 'MET',
          details: `Continuous service of ${monthsService} months satisfies statutory minimum of ${MANITOBA_SERVICE_REQUIREMENTS.PARENTAL_LEAVE_MONTHS} months (s. 54).`
        });
      } else {
        statutoryViolations.push({
          violation: 'INSUFFICIENT_SERVICE_TENURE',
          section: 'Manitoba ESC s. 54',
          details: `Parental leave requires at least ${MANITOBA_SERVICE_REQUIREMENTS.PARENTAL_LEAVE_MONTHS} months continuous employment; currently at ${monthsService} months.`
        });
      }
      break;

    case 'INTERPERSONAL_VIOLENCE':
      maxPermissibleWeeks = MANITOBA_MAX_LEAVE_WEEKS.INTERPERSONAL_VIOLENCE_CONTINUOUS;
      isServiceRequirementMet = daysService >= MANITOBA_SERVICE_REQUIREMENTS.INTERPERSONAL_VIOLENCE_DAYS;
      // Manitoba ESC s. 59.11(3): First 5 days of leave taken in a 52-week period are PAID by the employer
      const daysClaimed = Math.min(10, Math.max(0, ivDaysReq));
      paidDaysEntitlement = Math.min(5, daysClaimed);
      const dailyHours = weeklyHours > 0 ? (weeklyHours / 5) : 8;
      paidLeaveCompensationCad = paidDaysEntitlement * dailyHours * wage;

      if (isServiceRequirementMet) {
        complianceChecklist.push({
          item: 'INTERPERSONAL_VIOLENCE_SERVICE_TENURE',
          status: 'MET',
          details: `Service of ${daysService} days meets the 90-day requirement under s. 59.11. Eligible for 5 paid days ($${paidLeaveCompensationCad.toFixed(2)} CAD) plus up to 17 continuous weeks unpaid.`
        });
      } else {
        statutoryViolations.push({
          violation: 'INSUFFICIENT_SERVICE_TENURE',
          section: 'Manitoba ESC s. 59.11',
          details: `Interpersonal violence leave requires at least 90 days of employment; currently at ${daysService} days.`
        });
      }
      break;

    case 'SERIOUS_ILLNESS':
      maxPermissibleWeeks = MANITOBA_MAX_LEAVE_WEEKS.SERIOUS_ILLNESS;
      isServiceRequirementMet = daysService >= MANITOBA_SERVICE_REQUIREMENTS.SERIOUS_ILLNESS_DAYS;
      if (isServiceRequirementMet) {
        complianceChecklist.push({
          item: 'SERIOUS_ILLNESS_SERVICE_TENURE',
          status: 'MET',
          details: `Service of ${daysService} days meets the 90-day threshold under s. 59.2.`
        });
      } else {
        statutoryViolations.push({
          violation: 'INSUFFICIENT_SERVICE_TENURE',
          section: 'Manitoba ESC s. 59.2',
          details: `Serious illness/injury leave requires at least 90 days of employment; currently at ${daysService} days.`
        });
      }
      break;

    default:
      maxPermissibleWeeks = 0;
      isServiceRequirementMet = true;
  }

  // 2. Medical Certification Check (where required)
  if ((normalizedType === 'MATERNITY' || normalizedType === 'SERIOUS_ILLNESS') && !medicalCert) {
    statutoryViolations.push({
      violation: 'MISSING_MEDICAL_CERTIFICATE',
      section: normalizedType === 'MATERNITY' ? 'Manitoba ESC s. 52(2)' : 'Manitoba ESC s. 59.2(2)',
      details: 'Employee must provide a medical certificate from a qualified physician verifying the medical condition or expected date of delivery.'
    });
  }

  // 3. Employer Violations: Refusal of Leave or Reprisal (s. 60)
  if (employerRefused && isServiceRequirementMet) {
    statutoryViolations.push({
      violation: 'UNLAWFUL_REFUSAL_OF_STATUTORY_LEAVE',
      section: 'Manitoba ESC s. 60(1)',
      details: 'Under Manitoba ESC s. 60(1), an employer CANNOT deny statutory leave to an eligible employee who meets the statutory qualifying conditions.'
    });
    actionableRemedies.push('File an Employment Standards Claim with Manitoba Labour and Immigration for statutory leave denial and wage recovery.');
  }

  if (employerDismissed) {
    statutoryViolations.push({
      violation: 'STATUTORY_REPRISAL_AND_UNLAWFUL_TERMINATION',
      section: 'Manitoba ESC s. 60(2)',
      details: 'Strict statutory prohibition against dismissing, laying off, suspending, or discriminating against an employee for taking or requesting statutory leave.'
    });
    actionableRemedies.push('Demand immediate reinstatement, back pay, and lost wage damages through Manitoba Employment Standards Division or Manitoba Labour Board.');
  }

  if (employerRefusesReinstatement) {
    statutoryViolations.push({
      violation: 'FAILURE_TO_REINSTATE_TO_COMPARABLE_POSITION',
      section: 'Manitoba ESC s. 60(3)',
      details: 'Upon return from leave, employer must reinstate employee to the same position or a comparable position with not less than the same wages and benefits.'
    });
    actionableRemedies.push('File a claim for reinstatement and wage restoration under Manitoba ESC s. 60(3).');
  }

  const isCompliant = statutoryViolations.length === 0;

  return {
    jurisdiction: 'MANITOBA',
    employeeName: cleanEmployeeName,
    employerName: cleanEmployerName,
    assessmentDate: cleanAssessmentDate,
    leaveType: normalizedType,
    isEligibleForLeave: isServiceRequirementMet && (weeksReq <= maxPermissibleWeeks || maxPermissibleWeeks === 0),
    complianceStatus: isCompliant ? 'STATUTORILY_COMPLIANT' : 'STATUTORY_DEFICIENCY_DETECTED',
    leaveAudit: {
      monthsOfService: monthsService,
      daysOfService: daysService,
      weeksRequested: weeksReq,
      maxStatutoryWeeks: maxPermissibleWeeks,
      isWithinMaximumStatutoryDuration: weeksReq <= maxPermissibleWeeks,
      paidDaysEntitlement,
      statutoryPaidLeaveCompensationCad: paidLeaveCompensationCad
    },
    statutoryViolations,
    complianceChecklist,
    actionableRemedies,
    statutoryCitations: [
      'The Employment Standards Code, C.C.S.M. c. E110, Part 2 Div 9 ss. 52, 54, 59.1, 59.11, 59.2, 60',
      'Employment Standards Regulation, Man. Reg. 6/2007'
    ]
  };
}

export const assessManitobaEmploymentLeave = evaluateManitobaEmploymentLeave;

