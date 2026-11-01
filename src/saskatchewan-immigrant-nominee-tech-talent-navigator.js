/**
 * Saskatchewan Immigrant Nominee Program (SINP) Tech Talent Pathway Navigator
 *
 * Implements statutory assessment rules under:
 * - The Foreign Worker Recruitment and Immigration Services Act, SS 2013, c. F-18.1
 * - SINP Tech Talent Pathway Guide and Labour Market Priorities
 * - Immigration and Refugee Protection Act (IRPA, S.C. 2001, c. 27, s. 8)
 * - Immigration and Refugee Protection Regulations (IRPR, SOR/2002-227, s. 87)
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const SINP_ELIGIBLE_TECH_NOCS = Object.freeze([
  { noc: '20012', title: 'Computer and information systems managers', teer: 0, requiresApegs: false },
  { noc: '21211', title: 'Data scientists', teer: 1, requiresApegs: false },
  { noc: '21220', title: 'Cybersecurity specialists', teer: 1, requiresApegs: false },
  { noc: '21221', title: 'Business systems specialists', teer: 1, requiresApegs: false },
  { noc: '21222', title: 'Information systems specialists', teer: 1, requiresApegs: false },
  { noc: '21223', title: 'Database analysts and data administrators', teer: 1, requiresApegs: false },
  { noc: '21230', title: 'Computer systems developers and programmers', teer: 1, requiresApegs: false },
  { noc: '21231', title: 'Software engineers and designers', teer: 1, requiresApegs: false },
  { noc: '21232', title: 'Software developers and programmers', teer: 1, requiresApegs: false },
  { noc: '21233', title: 'Web designers', teer: 1, requiresApegs: false },
  { noc: '21234', title: 'Web developers and programmers', teer: 1, requiresApegs: false },
  { noc: '21310', title: 'Electrical and electronics engineers', teer: 1, requiresApegs: true },
  { noc: '21311', title: 'Computer engineers (except software engineers)', teer: 1, requiresApegs: true }
]);

export function evaluateSinpTechTalent(params = {}) {
  const {
    nocCode = '21232',
    hasSinpJobApprovalLetter = true,
    isPermanentFullTimeOffer = true,
    isCurrentlyWorkingInSaskatchewan = false,
    monthsWorkedInSaskWithEmployer = 0,
    monthsOfRelatedExperiencePastFiveYears = 24,
    isSaskatchewanPostSecGraduate = false,
    clbScore = 7,
    isExpressEntryStream = false,
    hasActiveExpressEntryProfile = false,
    hasPostSecondaryTechEducation = true,
    hasApegsLicensureOrEligibilityLetter = false,
    intendsToResideInSaskatchewan = true,
    candidateName = 'Candidate',
    assessmentDate = '2026-10-31'
  } = params;

  const safeCandidateName = boundedText(candidateName, 120) || 'Candidate';
  const safeAssessmentDate = safeIsoDate(assessmentDate);

  const jobApprovalLetter = Boolean(hasSinpJobApprovalLetter);
  const permanentFullTime = Boolean(isPermanentFullTimeOffer);
  const workingInSask = Boolean(isCurrentlyWorkingInSaskatchewan);
  const saskGraduate = Boolean(isSaskatchewanPostSecGraduate);
  const expressEntryStream = Boolean(isExpressEntryStream);
  const expressEntryProfile = Boolean(hasActiveExpressEntryProfile);
  const postSecTech = Boolean(hasPostSecondaryTechEducation);
  const apegsLicensure = Boolean(hasApegsLicensureOrEligibilityLetter);
  const intentToReside = Boolean(intendsToResideInSaskatchewan);

  const saskMonths = Number.isFinite(Number(monthsWorkedInSaskWithEmployer)) ? Math.max(0, Math.min(600, Math.floor(Number(monthsWorkedInSaskWithEmployer)))) : 0;
  const pastMonths = Number.isFinite(Number(monthsOfRelatedExperiencePastFiveYears)) ? Math.max(0, Math.min(600, Math.floor(Number(monthsOfRelatedExperiencePastFiveYears)))) : 24;
  const clb = Number.isFinite(Number(clbScore)) ? Math.max(0, Math.min(12, Math.floor(Number(clbScore)))) : 7;

  const normalizedNoc = boundedText(nocCode, 10);
  const matchedNoc = SINP_ELIGIBLE_TECH_NOCS.find(item => item.noc === normalizedNoc);

  const criteriaEvaluated = [];
  const disqualifications = [];
  const riskWarnings = [];

  // 1. Eligible Tech NOC Verification
  if (matchedNoc) {
    criteriaEvaluated.push({
      criterion: 'ELIGIBLE_TECH_NOC',
      status: 'MET',
      details: `NOC ${matchedNoc.noc} (${matchedNoc.title}) is on the authorized SINP Tech Talent Pathway occupational list.`
    });
  } else {
    disqualifications.push({
      criterion: 'INELIGIBLE_TECH_NOC',
      reason: `NOC ${normalizedNoc || 'UNSPECIFIED'} is not an eligible technology occupation under the SINP Tech Talent schedule.`
    });
  }

  // 2. SINP Job Approval Letter (JAL) & Offer Criteria
  if (jobApprovalLetter && permanentFullTime) {
    criteriaEvaluated.push({
      criterion: 'JOB_APPROVAL_LETTER',
      status: 'MET',
      details: 'Candidate holds an approved SINP Job Approval Letter (JAL) for permanent full-time employment.'
    });
  } else {
    if (!jobApprovalLetter) {
      disqualifications.push({
        criterion: 'MISSING_SINP_JAL',
        reason: 'Statutory eligibility mandates a valid, employer-specific SINP Job Approval Letter (JAL).'
      });
    }
    if (!permanentFullTime) {
      disqualifications.push({
        criterion: 'NON_PERMANENT_OFFER',
        reason: 'The employment offer must be permanent and full-time (minimum 30 hours per week).'
      });
    }
  }

  // 3. Work Experience Pathway Audit
  if (workingInSask) {
    if (saskMonths >= 6) {
      criteriaEvaluated.push({
        criterion: 'IN_PROVINCE_WORK_EXPERIENCE',
        status: 'MET',
        details: `Candidate has completed ${saskMonths} months of full-time work in Saskatchewan with the supporting employer (minimum 6 months required).`
      });
    } else {
      disqualifications.push({
        criterion: 'INSUFFICIENT_SASK_EXPERIENCE',
        reason: `In-Saskatchewan applicants must have worked at least 6 months with the hiring employer; currently at ${saskMonths} months.`
      });
    }
  } else {
    const requiredMonths = saskGraduate ? 6 : 12;
    if (pastMonths >= requiredMonths) {
      criteriaEvaluated.push({
        criterion: 'OUT_OF_PROVINCE_TECH_EXPERIENCE',
        status: 'MET',
        details: `Candidate has ${pastMonths} months of directly related tech experience (required: ${requiredMonths} months for ${saskGraduate ? 'SK graduate' : 'standard applicant'}).`
      });
    } else {
      disqualifications.push({
        criterion: 'INSUFFICIENT_TECH_EXPERIENCE',
        reason: `Requires at least ${requiredMonths} months of related tech experience in the past 5 years; provided is ${pastMonths} months.`
      });
    }
  }

  // 4. Language Benchmark: CLB 7 for Express Entry, CLB 5 for Non-Express Entry
  const minClb = expressEntryStream ? 7 : 5;
  if (clb >= minClb) {
    criteriaEvaluated.push({
      criterion: 'LANGUAGE_PROFICIENCY',
      status: 'MET',
      details: `Language benchmark CLB ${clb} satisfies the ${expressEntryStream ? 'Express Entry' : 'Non-Express Entry'} requirement of CLB ${minClb}.`
    });
  } else {
    disqualifications.push({
      criterion: 'LANGUAGE_BENCHMARK_UNSATISFIED',
      reason: `Language proficiency CLB ${clb} does not meet the mandatory minimum of CLB ${minClb} for the ${expressEntryStream ? 'Express Entry' : 'Non-Express Entry'} sub-category.`
    });
  }

  // 5. Express Entry Profile Check (if applicable)
  if (expressEntryStream) {
    if (expressEntryProfile) {
      criteriaEvaluated.push({
        criterion: 'ACTIVE_EXPRESS_ENTRY_PROFILE',
        status: 'MET',
        details: 'Active Express Entry profile and Job Seeker Validation Code confirmed. Eligible for +600 CRS provincial nomination.'
      });
    } else {
      disqualifications.push({
        criterion: 'MISSING_EXPRESS_ENTRY_PROFILE',
        reason: 'Candidates in the Express Entry sub-stream must have an active IRCC Express Entry profile and Job Seeker Validation Code.'
      });
    }
  }

  // 6. Post-Secondary Tech Education Requirement
  if (postSecTech) {
    criteriaEvaluated.push({
      criterion: 'POST_SECONDARY_EDUCATION',
      status: 'MET',
      details: 'Completed post-secondary education of at least 1 year in computer science, software engineering, or related tech field.'
    });
  } else {
    disqualifications.push({
      criterion: 'EDUCATION_DEFICIENCY',
      reason: 'Applicant must have completed post-secondary education (degree, diploma, or certificate) in a relevant tech field.'
    });
  }

  // 7. APEGS Professional Licensure (NOC 21310 & 21311)
  if (matchedNoc && matchedNoc.requiresApegs) {
    if (apegsLicensure) {
      criteriaEvaluated.push({
        criterion: 'APEGS_LICENSURE',
        status: 'MET',
        details: 'Formal letter from APEGS confirming eligibility for professional engineering registration verified.'
      });
    } else {
      disqualifications.push({
        criterion: 'APEGS_LICENSURE_MISSING',
        reason: `Engineering occupation NOC ${matchedNoc.noc} requires a letter of approval from the Association of Professional Engineers and Geoscientists of Saskatchewan (APEGS).`
      });
    }
  }

  // 8. Intent to Reside
  if (!intentToReside) {
    disqualifications.push({
      criterion: 'INTENT_TO_RESIDE_FAILURE',
      reason: 'Applicant must establish a bona fide intention to settle and live permanently in Saskatchewan.'
    });
  }

  const isEligible = disqualifications.length === 0;

  return {
    candidateName: safeCandidateName,
    assessmentDate: safeAssessmentDate,
    stream: expressEntryStream ? 'SINP_TECH_TALENT_EXPRESS_ENTRY' : 'SINP_TECH_TALENT_NON_EXPRESS_ENTRY',
    targetNoc: matchedNoc || null,
    isEligible,
    eligibilityVerdict: isEligible
      ? 'ELIGIBLE_FOR_SINP_TECH_TALENT_NOMINATION'
      : 'INELIGIBLE_FOR_SINP_TECH_TALENT',
    criteriaEvaluated,
    disqualifications,
    riskWarnings,
    expressEntryBonusPoints: (isEligible && expressEntryStream) ? 600 : 0,
    statutoryCitations: [
      'The Foreign Worker Recruitment and Immigration Services Act, SS 2013, c. F-18.1',
      'Saskatchewan Immigrant Nominee Program (SINP) Tech Talent Pathway Criteria',
      'Immigration and Refugee Protection Act (IRPA), S.C. 2001, c. 27, s. 8',
      'Immigration and Refugee Protection Regulations (IRPR), SOR/2002-227, s. 87'
    ]
  };
}
