// src/schooling-catchment.js
// Child Schooling age-to-grade placement and ISPA immunization compliance engine
// Pure ES module with zero npm dependencies.

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const ISPA_MANDATORY_VACCINES = [
  { id: 'dtp', name: 'Diphtheria, Tetanus, Pertussis & Polio (DTaP-IPV)', doses: '4-5 doses (primary series + age 4-6 booster)', mandate: 'Mandatory under ISPA s.3' },
  { id: 'mmr', name: 'Measles, Mumps, Rubella (MMR)', doses: '2 doses (at 12 months and 4-6 years)', mandate: 'Mandatory under ISPA s.3' },
  { id: 'meningococcal', name: 'Meningococcal Conjugate (Men-C-ACYW)', doses: '1 dose (at 12 months & Grade 7)', mandate: 'Mandatory under ISPA s.3' },
  { id: 'varicella', name: 'Varicella (Chickenpox)', doses: '2 doses (born on or after 2010)', mandate: 'Mandatory under ISPA s.3' }
];

/**
 * Calculates school grade placement, tuition rights, and language triage
 */
export function calculateSchoolPlacement({
  childName = 'Child',
  birthYear = 2020,
  currentYear = 2026,
  status = 'work_permit',
  lang = 'non_english',
  assessmentDate = todayIso()
} = {}) {
  const safeChild = boundedText(childName, 'Child', 100);
  const safeAssessmentDate = safeIsoDate(assessmentDate, todayIso());
  const safeBirth = Math.max(1900, Math.min(2100, Math.floor(Number(birthYear) || 2020)));
  const safeCurrent = Math.max(1900, Math.min(2100, Math.floor(Number(currentYear) || 2026)));
  const age = Math.max(0, safeCurrent - safeBirth);
  let grade = '';
  let division = '';

  if (age < 4) {
    grade = 'Pre-School / Daycare (Age < 4)';
    division = 'Early Learning (Licensed Daycare / CWELCC $10-a-day program)';
  } else if (age === 4) {
    grade = 'Junior Kindergarten (JK)';
    division = 'Primary / Kindergarten';
  } else if (age === 5) {
    grade = 'Senior Kindergarten (SK)';
    division = 'Primary / Kindergarten';
  } else if (age >= 6 && age <= 17) {
    const num = age - 5;
    grade = `Grade ${num}`;
    division = num <= 5 ? 'Elementary (Primary)' : num <= 8 ? 'Middle School (Junior High)' : 'Secondary / High School (OSSD)';
  } else {
    grade = 'Adult Day School (Age 18+)';
    division = 'Continuing Education / Adult Credit';
  }

  const cleanStatus = boundedText(status, 'work_permit', 50);
  const cleanLang = boundedText(lang, 'non_english', 50);
  const eligibleTuitionFreeStatuses = ['work_permit', 'study_permit', 'pr', 'refugee', 'visitor_pending_pr'];
  const tuitionExempt = eligibleTuitionFreeStatuses.includes(cleanStatus);

  return {
    childName: safeChild,
    assessmentDate: safeAssessmentDate,
    birthYear: safeBirth,
    age,
    grade,
    division,
    tuitionExempt,
    statutoryTuitionRight: tuitionExempt
      ? 'Under Ontario Education Act Section 49.2, children of temporary workers, international students, protected persons, and pending permanent residents are statutorily entitled to attend public schools tuition-free ($0 fee).'
      : 'International visitors without pending immigration status or authorized permits are subject to statutory international student tuition fees (approx. $14,000–$16,000 CAD per academic year).',
    eslAssessmentRequired: cleanLang === 'non_english',
    eslGuidance: cleanLang === 'non_english'
      ? 'School board Welcome Centre intake required: child will receive a STEP (Steps to English Proficiency) assessment to assign appropriate English language learner support at no cost.'
      : 'Direct school enrollment without mandatory language intake assessment.'
  };
}

/**
 * Audits vaccine records against Ontario Immunization of School Pupils Act (ISPA)
 */
export function auditIspaCompliance({
  childName = 'Child',
  completedVaccines = [],
  assessmentDate = todayIso()
} = {}) {
  const safeChild = boundedText(childName, 'Child', 100);
  const safeAssessmentDate = safeIsoDate(assessmentDate, todayIso());
  const safeVaccineList = Array.isArray(completedVaccines) ? completedVaccines.slice(0, 50) : [];
  const completedSet = new Set(safeVaccineList.map(v => String(v).toLowerCase().trim()));
  const missing = [];
  const compliant = [];

  for (const v of ISPA_MANDATORY_VACCINES) {
    if (completedSet.has(v.id)) {
      compliant.push(v);
    } else {
      missing.push(v);
    }
  }

  const isCompliant = missing.length === 0;

  return {
    childName: safeChild,
    assessmentDate: safeAssessmentDate,
    isCompliant,
    compliantCount: compliant.length,
    missingCount: missing.length,
    compliantVaccines: compliant,
    missingVaccines: missing,
    suspensionRisk: isCompliant
      ? 'Compliant: Zero school suspension risk under the Immunization of School Pupils Act.'
      : 'High Suspension Risk: Under ISPA Section 12, public health units issue mandatory school suspension orders of up to 20 school days if missing vaccines or valid exemption affidavits are not submitted.',
    exemptionPathways: {
      medical: 'Statement of Medical Exemption Form signed by a physician or nurse practitioner.',
      conscienceOrReligious: 'Statement of Conscience or Religious Belief Affidavit sworn before a Commissioner of Oaths / Notary Public under ISPA Section 3.'
    }
  };
}
