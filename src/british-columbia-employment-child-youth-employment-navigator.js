/**
 * British Columbia Employment Standards Act (BC ESA) Child & Youth Employment Navigator
 *
 * Implements statutory assessment rules under:
 * - Employment Standards Act, RSBC 1996, c. 113:
 *   - Section 9: Hiring children under 12, 12 to 13, and 14 to 15
 *   - Section 9.1: Prohibited hazardous work for youth
 * - British Columbia Employment Standards Regulation, B.C. Reg. 396/95:
 *   - Section 45.1: Definitions (Light work vs hazardous work)
 *   - Section 45.2: Light work prescribed activities for children 12 and 13
 *   - Section 45.3: Maximum hours of work and supervision for children 12 and 13
 *   - Section 45.4: Prescribed hazardous work and environments for youth under 16 and 19
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const BC_LIGHT_WORK_ACTIVITIES = Object.freeze([
  'CLERICAL_ADMINISTRATIVE',
  'RETAIL_CASHIER_OR_STOCKING',
  'FOOD_SERVICE_HOST_OR_BUSSER',
  'GOLF_CADDY',
  'DELIVERY_OF_NEWSPAPERS_OR_FLYERS',
  'YARD_WORK_WITH_MANUAL_TOOLS',
  'PEER_TUTORING'
]);

export const BC_HAZARDOUS_WORK_ACTIVITIES = Object.freeze([
  'CONSTRUCTION_SITE_WORK',
  'FORESTRY_AND_LOGGING',
  'UNDERGROUND_MINING',
  'ABRASIVE_BLASTING_OR_ASBESTOS',
  'INDUSTRIAL_MEAT_PROCESSING',
  'HEAVY_MANUFACTURING_OR_SAWMILL',
  'HANDLING_CONTROLLED_HAZARDOUS_CHEMICALS',
  'WORKING_WITH_POWER_ACTUATED_TOOLS',
  'COMMERCIAL_DIVING'
]);

export function evaluateBcChildYouthEmployment(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    childName = 'Child Worker',
    employerName = 'Employer',
    assessmentDate = '2026-10-31',
    childAge = 13,
    proposedOccupationActivity = 'RETAIL_CASHIER_OR_STOCKING',
    hasParentalConsentInWriting = true,
    hasDirectorChildEmploymentPermit = false,
    dailyHoursOnSchoolDay = 3,
    dailyHoursOnNonSchoolDay = 6,
    weeklyHoursDuringSchoolWeek = 15,
    shiftStartTime = '16:00', // e.g. 4:00 PM
    shiftEndTime = '19:00',   // e.g. 7:00 PM
    isWorkingDuringSummerVacation = false,
    hasAdultSupervisionOnSite = true
  } = safeParams;

  const cleanChildName = boundedText(childName, 'Child Worker', 100);
  const cleanEmployerName = boundedText(employerName, 'Employer', 120);
  const cleanAssessmentDate = safeIsoDate(assessmentDate, '2026-10-31');

  const age = Number.isFinite(Number(childAge))
    ? Math.max(0, Math.min(100, Math.floor(Number(childAge))))
    : 0;
  const activity = boundedText(proposedOccupationActivity, 'RETAIL_CASHIER_OR_STOCKING', 60).toUpperCase();
  const schoolDayHours = Number.isFinite(Number(dailyHoursOnSchoolDay))
    ? Math.max(0, Math.min(24, Number(dailyHoursOnSchoolDay)))
    : 0;
  const nonSchoolDayHours = Number.isFinite(Number(dailyHoursOnNonSchoolDay))
    ? Math.max(0, Math.min(24, Number(dailyHoursOnNonSchoolDay)))
    : 0;
  const schoolWeekHours = Number.isFinite(Number(weeklyHoursDuringSchoolWeek))
    ? Math.max(0, Math.min(168, Number(weeklyHoursDuringSchoolWeek)))
    : 0;

  const statutoryViolations = [];
  const complianceChecklist = [];
  const actionableRemedies = [];

  const isLightWork = BC_LIGHT_WORK_ACTIVITIES.includes(activity);
  const isHazardousWork = BC_HAZARDOUS_WORK_ACTIVITIES.includes(activity);

  // 1. Children Under 12 Years of Age (ESA s. 9(1))
  if (age < 12) {
    if (!hasDirectorChildEmploymentPermit) {
      statutoryViolations.push({
        violation: 'UNLAWFUL_EMPLOYMENT_CHILD_UNDER_12',
        section: 'BC ESA s. 9(1)',
        details: `Children under 12 years of age cannot be employed in any occupation without a formal Child Employment Permit issued by the Director of Employment Standards.`
      });
      actionableRemedies.push('Employer must immediately cease child employment until a Director\'s Permit is formally applied for and granted.');
    } else {
      complianceChecklist.push({
        item: 'DIRECTORS_PERMIT_UNDER_12',
        status: 'MET',
        details: 'Valid Director\'s Child Employment Permit held for child under 12.'
      });
    }
  }

  // 2. Children 12 to 13 Years of Age (ESA s. 9(2) & Reg ss. 45.1–45.3)
  if (age >= 12 && age <= 13) {
    // A. Parental consent
    if (hasParentalConsentInWriting) {
      complianceChecklist.push({
        item: 'PARENTAL_CONSENT_12_13',
        status: 'MET',
        details: 'Written consent of parent or legal guardian confirmed.'
      });
    } else {
      statutoryViolations.push({
        violation: 'MISSING_PARENTAL_CONSENT',
        section: 'BC ESA s. 9(2)(a)',
        details: 'Employment of a child aged 12 or 13 requires the signed, written consent of a parent or guardian.'
      });
    }

    // B. Light work vs permit
    if (!isLightWork && !hasDirectorChildEmploymentPermit) {
      statutoryViolations.push({
        violation: 'NON_LIGHT_WORK_WITHOUT_PERMIT',
        section: 'BC ESA s. 9(2) & Reg s. 45.2',
        details: `Activity '${activity}' is not prescribed light work. Employment requires a permit from the Director of Employment Standards.`
      });
    } else {
      complianceChecklist.push({
        item: 'LIGHT_WORK_COMPLIANCE',
        status: 'MET',
        details: `Activity '${activity}' complies with prescribed light work categories.`
      });
    }

    // C. Daily and weekly hour limits (Reg s. 45.3)
    if (schoolDayHours > 4) {
      statutoryViolations.push({
        violation: 'EXCEEDED_SCHOOL_DAY_MAX_HOURS',
        section: 'BC Reg. 396/95 s. 45.3(1)(a)',
        details: `Child scheduled for ${schoolDayHours} hours on a school day (maximum permitted: 4 hours).`
      });
    }

    if (nonSchoolDayHours > 7) {
      statutoryViolations.push({
        violation: 'EXCEEDED_NON_SCHOOL_DAY_MAX_HOURS',
        section: 'BC Reg. 396/95 s. 45.3(1)(b)',
        details: `Child scheduled for ${nonSchoolDayHours} hours on a non-school day (maximum permitted: 7 hours).`
      });
    }

    if (schoolWeekHours > 20) {
      statutoryViolations.push({
        violation: 'EXCEEDED_SCHOOL_WEEK_MAX_HOURS',
        section: 'BC Reg. 396/95 s. 45.3(1)(c)',
        details: `Child scheduled for ${schoolWeekHours} hours during a school week (maximum permitted: 20 hours).`
      });
    }

    // D. Adult supervision
    if (!hasAdultSupervisionOnSite) {
      statutoryViolations.push({
        violation: 'LACK_OF_DIRECT_ADULT_SUPERVISION',
        section: 'BC Reg. 396/95 s. 45.3(2)',
        details: 'A child aged 12 or 13 must be in the direct visual supervision of an adult (19+) at all times.'
      });
    }
  }

  // 3. Youth 14 to 15 Years of Age (ESA s. 9.1 & Reg s. 45.4)
  if (age >= 14 && age <= 15) {
    if (isHazardousWork) {
      statutoryViolations.push({
        violation: 'UNLAWFUL_HAZARDOUS_WORK_YOUTH_UNDER_16',
        section: 'BC ESA s. 9.1 & Reg s. 45.4',
        details: `Activity '${activity}' is statutorily classified as hazardous work. Youths aged 14 and 15 are strictly prohibited from hazardous employment.`
      });
      actionableRemedies.push('Employer must reassign youth to safe, non-hazardous duties immediately.');
    } else {
      complianceChecklist.push({
        item: 'GENERAL_NON_HAZARDOUS_WORK',
        status: 'MET',
        details: `General non-hazardous work '${activity}' is permissible for youth aged 14-15.`
      });
    }
  }

  // 4. Youth 16 to 18 Years of Age (ESA s. 9.1 high-hazard restrictions)
  if (age >= 16 && age <= 18) {
    const extremeHazards = ['UNDERGROUND_MINING', 'ABRASIVE_BLASTING_OR_ASBESTOS', 'COMMERCIAL_DIVING', 'FORESTRY_AND_LOGGING'];
    if (extremeHazards.includes(activity)) {
      statutoryViolations.push({
        violation: 'UNLAWFUL_EXTREME_HAZARDOUS_WORK_YOUTH',
        section: 'BC ESA s. 9.1 & Reg s. 45.4',
        details: `Activity '${activity}' is designated as high-risk hazardous work prohibited for all individuals under 19.`
      });
    }
  }

  const isCompliant = statutoryViolations.length === 0;

  return {
    jurisdiction: 'BRITISH_COLUMBIA',
    childName: cleanChildName,
    employerName: cleanEmployerName,
    assessmentDate: cleanAssessmentDate,
    childAge: age,
    proposedActivity: activity,
    isCompliant,
    legalVerdict: isCompliant ? 'STATUTORILY_AUTHORIZED_CHILD_EMPLOYMENT' : 'UNLAWFUL_CHILD_OR_YOUTH_EMPLOYMENT',
    hoursAudit: {
      dailyHoursOnSchoolDay: schoolDayHours,
      maxSchoolDayHoursPermitted: 4,
      dailyHoursOnNonSchoolDay: nonSchoolDayHours,
      maxNonSchoolDayHoursPermitted: 7,
      weeklyHoursDuringSchoolWeek: schoolWeekHours,
      maxSchoolWeekHoursPermitted: 20
    },
    statutoryViolations,
    complianceChecklist,
    actionableRemedies,
    statutoryCitations: [
      'Employment Standards Act, RSBC 1996, c. 113, ss. 9, 9.1',
      'British Columbia Employment Standards Regulation, B.C. Reg. 396/95, ss. 45.1, 45.2, 45.3, 45.4'
    ]
  };
}
