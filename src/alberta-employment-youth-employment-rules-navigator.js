/**
 * Alberta Employment Youth & Adolescent Employment Rules Navigator
 *
 * Audits age thresholds, adolescent (ages 13–14) light work restrictions,
 * mandatory written parental consent, school day hour caps (max 2h on school days),
 * night shift prohibitions (9:00 PM to 6:00 AM), and young person (ages 15–17)
 * late-night retail adult supervision rules under the Alberta Employment Standards Code,
 * RSA 2000, c. E-9, ss. 65–67, and Alta. Reg. 211/2004.
 *
 * Pure ES module — zero runtime npm dependencies.
 */

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const ALBERTA_YOUTH_CONSTANTS = Object.freeze({
  STATUTORY_AUTHORITY: 'Employment Standards Code, RSA 2000, c. E-9, ss. 65-67; Alta. Reg. 211/2004 ss. 51-53',
  MIN_AGE_WITHOUT_SPECIAL_PERMIT: 13,
  ADOLESCENT_MAX_SCHOOL_DAY_HOURS: 2,
  ADOLESCENT_MAX_NON_SCHOOL_DAY_HOURS: 8,
  ADOLESCENT_PROHIBITED_START_HOUR: 21, // 9:00 PM
  ADOLESCENT_PROHIBITED_END_HOUR: 6, // 6:00 AM
  PERMISSIBLE_LIGHT_WORK_13_14: Object.freeze([
    'RETAIL_CLERK',
    'OFFICE_MESSENGER',
    'FLYER_NEWSPAPER_DELIVERY',
    'TUTOR_OR_COACH',
    'LIGHT_JANITORIAL'
  ])
});

/**
 * Audits youth employment compliance, shift limits, parental consent, and supervision.
 *
 * @param {Object} params
 * @param {number} [params.employeeAge=14] - Age of the employee in years
 * @param {string} [params.jobCategory='RETAIL_CLERK'] - Category of work performed
 * @param {boolean} [params.hasWrittenParentalConsent=true] - Signed parental/guardian consent on file
 * @param {boolean} [params.isSchoolDay=true] - Whether shift falls on an instructional school day
 * @param {number} [params.scheduledShiftHours=2] - Number of hours scheduled for shift
 * @param {number} [params.shiftStartHour=16] - 24-hour shift start (e.g. 16 for 4:00 PM)
 * @param {number} [params.shiftEndHour=18] - 24-hour shift end (e.g. 18 for 6:00 PM)
 * @param {boolean} [params.duringSchoolHours=false] - Shift scheduled during school hours
 * @param {boolean} [params.adultSupervisionPresent=true] - Adult employee present for young person late shifts
 * @returns {Object} Comprehensive Alberta youth employment audit
 */
export function evaluateAlbertaYouthEmploymentRules({
  employeeAge = 14,
  jobCategory = 'RETAIL_CLERK',
  hasWrittenParentalConsent = true,
  isSchoolDay = true,
  scheduledShiftHours = 2,
  shiftStartHour = 16,
  shiftEndHour = 18,
  duringSchoolHours = false,
  adultSupervisionPresent = true,
  employeeName = 'Youth Employee',
  assessmentDate = todayIso()
} = {}) {
  const cleanEmployee = boundedText(employeeName, 'Youth Employee', 120);
  const cleanDate = safeIsoDate(assessmentDate, todayIso());
  const age = Number.isFinite(Number(employeeAge))
    ? Math.max(0, Math.min(100, Math.floor(Number(employeeAge))))
    : 0;
  const hours = Number.isFinite(Number(scheduledShiftHours))
    ? Math.max(0, Math.min(24, Number(scheduledShiftHours)))
    : 0;
  const start = Number.isFinite(Number(shiftStartHour))
    ? Math.max(0, Math.min(24, Math.floor(Number(shiftStartHour))))
    : 0;
  const end = Number.isFinite(Number(shiftEndHour))
    ? Math.max(0, Math.min(24, Math.floor(Number(shiftEndHour))))
    : 0;
  const category = boundedText(jobCategory, 'RETAIL_CLERK', 60).toUpperCase();

  const statutoryViolations = [];
  const riskWarnings = [];
  const actionableRemedies = [];

  // 1. Children Under 13
  if (age < ALBERTA_YOUTH_CONSTANTS.MIN_AGE_WITHOUT_SPECIAL_PERMIT) {
    statutoryViolations.push({
      rule: 'CHILD_UNDER_13_EMPLOYMENT_PROHIBITED',
      statute: 'Employment Standards Code s. 65(1)',
      finding: `Employee is ${age} years old. Children under 13 cannot be employed in any occupation without a special permit issued by the Director.`
    });
    actionableRemedies.push({
      action: 'CEASE_EMPLOYMENT_OR_OBTAIN_DIRECTOR_PERMIT',
      remedyDescription: 'Employer must immediately cease child employment or apply for an explicit exemption permit from Alberta Employment Standards.'
    });
  }

  // 2. Adolescents (Ages 13 and 14)
  if (age === 13 || age === 14) {
    if (!hasWrittenParentalConsent) {
      statutoryViolations.push({
        rule: 'MISSING_WRITTEN_PARENTAL_CONSENT',
        statute: 'Alta. Reg. 211/2004 s. 51(1)',
        finding: 'Adolescent employment requires signed written consent from a parent or legal guardian on file before commencing work.'
      });
      actionableRemedies.push({
        action: 'SECURE_SIGNED_PARENTAL_CONSENT_FORM',
        remedyDescription: 'Obtain signed parental consent acknowledging the duties and hours before the next shift.'
      });
    }

    const isPermittedJob = ALBERTA_YOUTH_CONSTANTS.PERMISSIBLE_LIGHT_WORK_13_14.includes(category);
    if (!isPermittedJob) {
      statutoryViolations.push({
        rule: 'UNAPPROVED_ADOLESCENT_JOB_CATEGORY',
        statute: 'Alta. Reg. 211/2004 s. 51(2)',
        finding: `Job category '${category}' is not approved light work for adolescents. Requires explicit Director permit.`
      });
    }

    // School Day vs Non-School Day Hours Cap
    const maxAllowedHours = isSchoolDay
      ? ALBERTA_YOUTH_CONSTANTS.ADOLESCENT_MAX_SCHOOL_DAY_HOURS
      : ALBERTA_YOUTH_CONSTANTS.ADOLESCENT_MAX_NON_SCHOOL_DAY_HOURS;

    if (hours > maxAllowedHours) {
      statutoryViolations.push({
        rule: 'EXCEEDED_MAXIMUM_ADOLESCENT_SHIFT_HOURS',
        statute: 'Alta. Reg. 211/2004 s. 52',
        finding: `Scheduled shift of ${hours} hours exceeds the statutory maximum of ${maxAllowedHours} hours for a ${isSchoolDay ? 'school' : 'non-school'} day.`
      });
    }

    if (duringSchoolHours) {
      statutoryViolations.push({
        rule: 'UNLAWFUL_EMPLOYMENT_DURING_SCHOOL_HOURS',
        statute: 'Education Act & Employment Standards Code s. 65(3)',
        finding: 'Adolescents cannot work during regular instructional school hours unless participating in an approved off-campus educational program.'
      });
    }

    // Night Work Prohibition (9:00 PM to 6:00 AM)
    if (end > ALBERTA_YOUTH_CONSTANTS.ADOLESCENT_PROHIBITED_START_HOUR || start < ALBERTA_YOUTH_CONSTANTS.ADOLESCENT_PROHIBITED_END_HOUR) {
      statutoryViolations.push({
        rule: 'PROHIBITED_ADOLESCENT_NIGHT_WORK',
        statute: 'Alta. Reg. 211/2004 s. 52(b)',
        finding: `Shift spanning ${start}:00 to ${end}:00 breaches the statutory prohibition against adolescent work between 9:00 PM and 6:00 AM.`
      });
    }
  }

  // 3. Young Persons (Ages 15, 16, 17)
  if (age >= 15 && age <= 17) {
    if (end > 21 && !adultSupervisionPresent) {
      statutoryViolations.push({
        rule: 'MISSING_ADULT_SUPERVISION_LATE_SHIFT',
        statute: 'Alta. Reg. 211/2004 s. 53',
        finding: 'In retail or hospitality businesses open to the public, young persons working past 9:00 PM must be accompanied by at least one adult (18+) employee.'
      });
      actionableRemedies.push({
        action: 'ASSIGN_CONCURRENT_ADULT_SUPERVISOR',
        remedyDescription: 'Schedule an adult co-worker on site during all late-night hours.'
      });
    }
  }

  const isCompliant = statutoryViolations.length === 0;
  let complianceStatus = 'COMPLIANT_YOUTH_EMPLOYMENT';
  let legalVerdict = 'Youth employment arrangement complies with Alberta Employment Standards Code and Child Employment Regulations.';

  if (!isCompliant) {
    complianceStatus = 'UNLAWFUL_YOUTH_EMPLOYMENT_BREACH';
    legalVerdict = `Employer committed youth employment infractions under Alberta law (${statutoryViolations.length} violation${statutoryViolations.length === 1 ? '' : 's'}). Administrative penalties apply.`;
  }

  return {
    assessmentDate: cleanDate,
    jurisdiction: 'ALBERTA_CANADA',
    employeeName: cleanEmployee,
    employeeAge: age,
    jobCategory: category,
    isSchoolDay,
    scheduledShiftHours: hours,
    isCompliant,
    complianceStatus,
    legalVerdict,
    regulationsSummary: {
      isAdolescent: age === 13 || age === 14,
      isYoungPerson: age >= 15 && age <= 17,
      maxDailyHours: age <= 14 ? (isSchoolDay ? 2 : 8) : 12,
      nightWorkPermitted: age >= 15
    },
    statutoryViolations,
    riskWarnings,
    actionableRemedies,
    statutoryCitations: [
      'Employment Standards Code, RSA 2000, c. E-9, ss. 65-67 (Employment of Individuals Under 18)',
      'Employment Standards Regulation, Alta. Reg. 211/2004, ss. 51-53 (Youth & Adolescent Employment Rules)'
    ]
  };
}