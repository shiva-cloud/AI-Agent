// src/saskatchewan-sinp-hard-to-fill-navigator.js
// Saskatchewan Immigrant Nominee Program (SINP) Hard-to-Fill Skills Stream Navigator
// Statutory Basis: Saskatchewan The Foreign Worker Recruitment and Immigration Services Act (FWRISA)
// & SINP Employer-Sponsored Stream Criteria (The Immigration and Emigration (Saskatchewan) Act)

import { boundedText, safeIsoDate } from './text-input.js';

export const SINP_ELIGIBILITY_RULES = {
  MIN_CONTINUOUS_WORK_MONTHS_SK: 6,
  MIN_LANGUAGE_CLB: 4,
  MIN_EDUCATION_LEVEL: 'secondary_school',
  QUALIFYING_TEER_LEVELS: [4, 5],
  DESIGNATED_SECTOR_NOCS: [
    '65201', // Food and beverage servers
    '65200', // Food counter attendants, kitchen helpers
    '64409', // Other customer and information services representatives
    '95106', // Labourers in food and beverage processing
    '75110', // Construction trades helpers and labourers
    '85100', // Livestock labourers
    '85101', // Harvesting labourers
    '95101', // Labourers in metal fabricating
    '65310', // Light duty cleaners
    '74203', // Automotive and heavy equipment service attendants
    '75212'  // Material handlers
  ],
  MAX_PASSPORT_EXPIRY_THRESHOLD_MONTHS: 6
};

/**
 * Evaluates candidate eligibility for the SINP Hard-to-Fill Skills Stream.
 *
 * @param {Object} candidate
 * @param {string} candidate.nocCode - 5-digit National Occupational Classification code
 * @param {number} candidate.workExperienceMonthsInSaskatchewan - Continuous months worked in SK for the supporting employer
 * @param {number} candidate.languageClbLevel - Official language proficiency (CLB/NCLC across all 4 abilities)
 * @param {boolean} candidate.hasSaskatchewanJobApprovalLetter - SINP Job Approval Letter (JAL) issued to the employer
 * @param {boolean} candidate.hasPermanentFullTimeOffer - Offer is non-seasonal and >= 30 hours per week
 * @param {string} candidate.highestEducation - 'none', 'secondary_school', 'post_secondary_1yr', 'bachelors_or_higher'
 * @param {boolean} candidate.hasEducationalCredentialAssessment - ECA completed for foreign credentials
 * @param {number} candidate.teerLevel - TEER category (0, 1, 2, 3, 4, 5)
 * @param {boolean} candidate.isValidWorkPermitHeld - Applicant holds valid work authorization in SK
 * @param {string} [candidate.applicantName] - Optional applicant label
 * @param {string} [candidate.assessmentDate] - ISO date string
 * @returns {Object} Deterministic evaluation and audit findings
 */
export function evaluateSinpHardToFillSkills(candidate = {}) {
  const {
    nocCode = '',
    workExperienceMonthsInSaskatchewan = 0,
    languageClbLevel = 0,
    hasSaskatchewanJobApprovalLetter = false,
    hasPermanentFullTimeOffer = false,
    highestEducation = 'none',
    hasEducationalCredentialAssessment = false,
    teerLevel = 5,
    isValidWorkPermitHeld = false,
    applicantName = 'Applicant',
    assessmentDate = new Date().toISOString().slice(0, 10)
  } = candidate;

  const safeApplicantName = boundedText(applicantName, 120) || 'Applicant';
  const safeAssessmentDate = safeIsoDate(assessmentDate);
  const normalizedNoc = boundedText(nocCode, 10);
  const safeHighestEducation = boundedText(highestEducation, 50) || 'none';

  const hasJal = Boolean(hasSaskatchewanJobApprovalLetter);
  const hasOffer = Boolean(hasPermanentFullTimeOffer);
  const hasEca = Boolean(hasEducationalCredentialAssessment);
  const hasPermit = Boolean(isValidWorkPermitHeld);

  const workExpMonths = Number.isFinite(Number(workExperienceMonthsInSaskatchewan)) ? Math.max(0, Math.min(600, Math.floor(Number(workExperienceMonthsInSaskatchewan)))) : 0;
  const clbLevel = Number.isFinite(Number(languageClbLevel)) ? Math.max(0, Math.min(12, Math.floor(Number(languageClbLevel)))) : 0;
  const teer = Number.isFinite(Number(teerLevel)) ? Math.max(0, Math.min(5, Math.floor(Number(teerLevel)))) : 5;

  const deficiencies = [];
  const compliancePoints = [];
  const statutoryRemedies = [];

  // 1. Mandatory Saskatchewan Job Approval Letter (JAL)
  if (!hasJal) {
    deficiencies.push({
      rule: 'SINP Job Approval Letter (JAL)',
      statutoryRef: 'FWRISA s. 9 & SINP Employer Registration Guidelines',
      severity: 'CRITICAL',
      message: 'The employer must obtain a pre-approved SINP Job Approval Letter (JAL) through OASIS before the candidate submits an application. A generic job offer is legally insufficient.'
    });
    statutoryRemedies.push('Employer must log into the Saskatchewan Immigration portal (OASIS) to register the position and obtain an official JAL.');
  } else {
    compliancePoints.push('Verified active Saskatchewan Job Approval Letter (JAL) linked to the employer.');
  }

  // 2. Permanent, Full-time Job Offer
  if (!hasOffer) {
    deficiencies.push({
      rule: 'Permanent Full-Time Offer',
      statutoryRef: 'SINP Hard-to-Fill Stream Criteria',
      severity: 'CRITICAL',
      message: 'The offer of employment must be permanent, continuous, and for at least 30 hours per week. Seasonal or part-time contracts are barred.'
    });
    statutoryRemedies.push('Ensure the employment agreement specifies non-seasonal full-time terms of at least 30 hours weekly.');
  } else {
    compliancePoints.push('Permanent, non-seasonal full-time offer (>= 30 hrs/week) confirmed.');
  }

  // 3. 6 Months Continuous SK Work Experience
  if (workExpMonths < SINP_ELIGIBILITY_RULES.MIN_CONTINUOUS_WORK_MONTHS_SK) {
    deficiencies.push({
      rule: 'Continuous SK Work Experience',
      statutoryRef: 'SINP Hard-to-Fill Stream Manual s. 3.2',
      severity: 'CRITICAL',
      message: `Applicant has ${workExpMonths} months of experience with the sponsoring employer. A minimum of 6 continuous months (at least 780 hours) in Saskatchewan is mandatory.`
    });
    statutoryRemedies.push(`Accumulate at least ${SINP_ELIGIBILITY_RULES.MIN_CONTINUOUS_WORK_MONTHS_SK - workExpMonths} more month(s) of continuous full-time work with the sponsoring employer in Saskatchewan.`);
  } else {
    compliancePoints.push(`Satisfies 6-month continuous employment threshold (${workExpMonths} months completed in SK).`);
  }

  // 4. TEER 4 or 5 and Designated NOC List
  const isDesignatedNoc = SINP_ELIGIBILITY_RULES.DESIGNATED_SECTOR_NOCS.includes(normalizedNoc);
  const isTeer4or5 = SINP_ELIGIBILITY_RULES.QUALIFYING_TEER_LEVELS.includes(teer);

  if (!isTeer4or5) {
    deficiencies.push({
      rule: 'TEER Category Eligibility',
      statutoryRef: 'National Occupational Classification (NOC) 2021 Matrix',
      severity: 'CRITICAL',
      message: `TEER ${teer} falls outside the Hard-to-Fill Skills Stream mandate, which specifically targets intermediate and entry-level positions (TEER 4 or 5). Higher TEER levels must apply under the International Skilled Worker: Employment Offer category.`
    });
    statutoryRemedies.push('Transition application to SINP International Skilled Worker: Employment Offer stream for TEER 0, 1, 2, or 3 roles.');
  } else if (!isDesignatedNoc && normalizedNoc.length > 0) {
    deficiencies.push({
      rule: 'Designated Sector NOC List',
      statutoryRef: 'SINP Hard-to-Fill Eligible Occupations List',
      severity: 'WARNING',
      message: `NOC ${normalizedNoc} must be verified against current provincial hard-to-fill quota caps and designated sector allocations.`
    });
  } else {
    compliancePoints.push(`Occupation NOC ${normalizedNoc || 'Designated'} in TEER ${teer} meets entry/intermediate targeted criteria.`);
  }

  // 5. Language Proficiency CLB 4
  if (clbLevel < SINP_ELIGIBILITY_RULES.MIN_LANGUAGE_CLB) {
    deficiencies.push({
      rule: 'Minimum Language Threshold',
      statutoryRef: 'IRPR s. 74 & SINP Language Benchmark Guidelines',
      severity: 'CRITICAL',
      message: `Language score CLB ${clbLevel} is below the statutory minimum of CLB 4 across all four linguistic competencies (reading, writing, speaking, listening).`
    });
    statutoryRemedies.push('Retake designated language test (CELPIP-General, IELTS General, TEF Canada, or TCF Canada) to attain minimum CLB 4.');
  } else {
    compliancePoints.push(`Meets language requirement with CLB ${clbLevel} (minimum CLB 4 required).`);
  }

  // 6. Minimum Secondary School Education + ECA
  const eligibleEducation = ['secondary_school', 'post_secondary_1yr', 'bachelors_or_higher'].includes(safeHighestEducation);
  if (!eligibleEducation) {
    deficiencies.push({
      rule: 'Minimum High School Education',
      statutoryRef: 'SINP Stream Criteria s. 4.1',
      severity: 'CRITICAL',
      message: 'Candidate must have completed at least secondary school (Canadian grade 12 equivalent).'
    });
    statutoryRemedies.push('Provide recognized equivalent high school diploma or higher accredited credential.');
  } else if (safeHighestEducation !== 'none' && !hasEca) {
    deficiencies.push({
      rule: 'Educational Credential Assessment (ECA)',
      statutoryRef: 'SINP Document Checklist s. 5',
      severity: 'HIGH',
      message: 'Non-Canadian educational credentials require an ECA from a designated organization (WES, ICAS, IQAS, CES, or BCIT) unless completed at an accredited Canadian institution.'
    });
    statutoryRemedies.push('Obtain an official ECA verifying Canadian equivalency before submission.');
  } else {
    compliancePoints.push('Verified secondary or post-secondary educational credential with required equivalency.');
  }

  // 7. Work Permit Validity
  if (!hasPermit) {
    deficiencies.push({
      rule: 'Valid Saskatchewan Work Authorization',
      statutoryRef: 'IRPA s. 30(1) & FWRISA s. 12',
      severity: 'CRITICAL',
      message: 'Candidate must hold valid work authorization in Canada during the qualifying 6 months of employment and at the time of SINP nomination.'
    });
    statutoryRemedies.push('Verify maintained status or apply for an extension of work authorization prior to filing.');
  } else {
    compliancePoints.push('Valid Canadian work authorization held in Saskatchewan.');
  }

  const isEligible = deficiencies.filter(d => d.severity === 'CRITICAL').length === 0;

  return {
    assessmentDate: safeAssessmentDate,
    applicantName: safeApplicantName,
    stream: 'Saskatchewan Immigrant Nominee Program (SINP) — Hard-to-Fill Skills Stream',
    statutoryAuthority: 'The Foreign Worker Recruitment and Immigration Services Act (Saskatchewan) & IRPA s. 87',
    isEligible,
    eligibilityStatus: isEligible ? 'QUALIFIED_FOR_SINP_NOMINATION' : 'DEFICIENCIES_DETECTED',
    summary: isEligible
      ? `${safeApplicantName} meets statutory criteria for SINP Hard-to-Fill Skills Stream nomination with a valid JAL and continuous Saskatchewan work experience.`
      : `${safeApplicantName} has ${deficiencies.length} identified statutory deficiency/deficiencies requiring remediation prior to SINP nomination submission.`,
    deficiencies,
    compliancePoints,
    statutoryRemedies: statutoryRemedies.length ? statutoryRemedies : ['Proceed with online application submission through Saskatchewan OASIS portal.'],
    jurisdiction: 'Saskatchewan, Canada'
  };
}
