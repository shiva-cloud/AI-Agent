/**
 * Northstar — Settlement Intelligence
 * Ontario Pay Transparency & Working for Workers Four Act Engine
 *
 * Statutory Authorities:
 * - Employment Standards Act, 2000, S.O. 2000, c. 41 as amended by Working for Workers Four Act, 2024, S.O. 2024, c. 3 (ss. 8.2–8.4)
 * - Pay Equity Act, R.S.O. 1990, c. P.7 (Pay Equity Commission of Ontario)
 * - Human Rights Code, R.S.O. 1990, c. H.19, s. 11 (Systemic Discrimination & Canadian Experience)
 * - Ministry of Labour, Immigration, Training and Skills Development (MLITSD) Guidelines
 *
 * Invariants: Pure ES module, 0 npm dependencies, strict statutory accuracy, fail-safe defaults.
 */

import { boundedText, todayIso } from './text-input.js';

export const ON_PAY_TRANSPARENCY_RULES = Object.freeze({
  MANDATORY_SALARY_RANGE_IN_POSTINGS: true,
  MANDATORY_AI_DISCLOSURE: true,
  CANADIAN_EXPERIENCE_REQUIREMENT_PROHIBITED: true,
  PAY_EQUITY_MIN_EMPLOYER_SIZE: 10,
  MAX_REASONABLE_SALARY_RANGE_SPREAD_PCT: 100, // Top of range should not exceed 2x the bottom without justification
  PROVINCE: 'ON'
});

/**
 * Audits a publicly advertised job posting or employment compensation structure for compliance with Ontario law.
 */
export function auditOntarioPayTransparencyAndPosting({
  isPubliclyAdvertisedJobPosting = true,
  includesExpectedCompensationOrRange = true,
  salaryRangeMinCad = 65000,
  salaryRangeMaxCad = 85000,
  usesAiToScreenApplicants = true,
  disclosesAiUsageInPosting = true,
  requiresCanadianWorkExperience = false,
  employerTotalHeadcount = 25,
  hasCompletedPayEquityAudit = true,
  employerName = 'Ontario Employer Corp.',
  assessmentDate = todayIso()
} = {}) {
  const cleanEmployerName = boundedText(employerName, 'Ontario Employer Corp.', 120);
  const safeAssessmentDate = typeof assessmentDate === 'string' && !Number.isNaN(Date.parse(assessmentDate))
    ? assessmentDate.trim().slice(0, 10)
    : '2026-10-31';

  const isPubliclyAdvertised = Boolean(isPubliclyAdvertisedJobPosting);
  const includesExpectedComp = Boolean(includesExpectedCompensationOrRange);
  const usesAi = Boolean(usesAiToScreenApplicants);
  const disclosesAi = Boolean(disclosesAiUsageInPosting);
  const requiresCanadianExp = Boolean(requiresCanadianWorkExperience);
  const hasCompletedAudit = Boolean(hasCompletedPayEquityAudit);

  const rawMin = Number.isFinite(Number(salaryRangeMinCad)) ? Math.max(0, Math.min(10000000, Number(salaryRangeMinCad))) : 65000;
  const rawMax = Number.isFinite(Number(salaryRangeMaxCad)) ? Math.max(0, Math.min(10000000, Number(salaryRangeMaxCad))) : 85000;
  const sanitizedMin = Math.min(rawMin, rawMax);
  const sanitizedMax = Math.max(rawMin, rawMax);
  const sanitizedHeadcount = Number.isFinite(Number(employerTotalHeadcount)) ? Math.max(1, Math.min(1000000, Math.floor(Number(employerTotalHeadcount)))) : 25;

  const deficiencies = [];
  const compliancePoints = [];
  const statutoryRemedies = [];
  const statutoryViolations = [];

  // 1. Mandatory Salary / Wage Range in Public Postings (ESA s. 8.2)
  if (isPubliclyAdvertised) {
    if (!includesExpectedComp || sanitizedMin === 0 || sanitizedMax === 0) {
      statutoryViolations.push('MISSING_COMPENSATION_RANGE');
      deficiencies.push(
        'Working for Workers Four Act (ESA s. 8.2): Every employer who advertises a publicly advertised job posting must include the expected range of salary or wages for the position.'
      );
    } else {
      // Check if range is unreasonably wide
      const spreadPct = sanitizedMin > 0 ? ((sanitizedMax - sanitizedMin) / sanitizedMin) * 100 : 0;
      if (spreadPct > ON_PAY_TRANSPARENCY_RULES.MAX_REASONABLE_SALARY_RANGE_SPREAD_PCT) {
        statutoryViolations.push('UNREASONABLY_BROAD_SALARY_RANGE');
        deficiencies.push(
          `Unreasonably broad salary range ($${sanitizedMin.toLocaleString()} to $${sanitizedMax.toLocaleString()} - spread of ${Math.round(
            spreadPct
          )}%). Ministry guidelines require meaningful, good-faith wage expectations.`
        );
      } else {
        compliancePoints.push(
          `Expected compensation range ($${sanitizedMin.toLocaleString()}–$${sanitizedMax.toLocaleString()} CAD) complies with ESA s. 8.2.`
        );
      }
    }
  }

  // 2. Mandatory AI Screening Disclosure (ESA s. 8.3)
  if (usesAi) {
    if (!disclosesAi) {
      statutoryViolations.push('UNDISCLOSED_AI_CANDIDATE_SCREENING');
      deficiencies.push(
        'Working for Workers Four Act (ESA s. 8.3): If an employer uses artificial intelligence to assess, screen, or select applicants, this usage MUST be explicitly disclosed in the job posting.'
      );
    } else {
      compliancePoints.push(
        'Explicit disclosure of artificial intelligence screening technology included in compliance with ESA s. 8.3.'
      );
    }
  } else {
    compliancePoints.push('No automated AI screening utilized for candidate evaluation.');
  }

  // 3. Strict Ban on "Canadian Experience" Requirement (ESA s. 8.4 & Human Rights Code)
  if (requiresCanadianExp) {
    statutoryViolations.push('PROHIBITED_CANADIAN_EXPERIENCE_REQUIREMENT');
    deficiencies.push(
      'Working for Workers Four Act (ESA s. 8.4) & Ontario Human Rights Code s. 11: Employers are strictly prohibited from requiring "Canadian work experience" in job postings or application materials. This requirement is legally recognized as systemic discrimination against internationally trained newcomers.'
    );
    statutoryRemedies.push({
      action: 'Strike Canadian Experience Requirement from Postings',
      authority: 'Employment Standards Act, 2000, s. 8.4',
      description:
        'Remove all references to Canadian experience immediately. Replace with functional competency and relevant professional experience regardless of geographic jurisdiction.'
    });
  } else {
    compliancePoints.push(
      'Job posting does not contain prohibited Canadian work experience prerequisite.'
    );
  }

  // 4. Pay Equity Act Maintenance (R.S.O. 1990, c. P.7)
  const isSubjectToPayEquity =
    sanitizedHeadcount >= ON_PAY_TRANSPARENCY_RULES.PAY_EQUITY_MIN_EMPLOYER_SIZE;

  if (isSubjectToPayEquity) {
    if (!hasCompletedAudit) {
      deficiencies.push(
        `Pay Equity Act Compliance: Employers with 10+ employees (${sanitizedHeadcount} headcount) must establish and maintain a Pay Equity Plan comparing female and male job classes of comparable value.`
      );
      statutoryRemedies.push({
        action: 'Conduct Comprehensive Pay Equity Audit',
        authority: 'Pay Equity Act, R.S.O. 1990, c. P.7, s. 7',
        description:
          'Perform job class evaluations and gender wage comparisons using point-factor or proxy comparison methods.'
      });
    } else {
      compliancePoints.push(
        `Pay Equity Act compliance plan active for employer workforce (${sanitizedHeadcount} employees).`
      );
    }
  }

  // Remedies for violations
  if (statutoryViolations.length > 0) {
    statutoryRemedies.push({
      action: 'Revise Public Job Postings to Prevent MLITSD Penalties',
      authority: 'Working for Workers Four Act, 2024 & ESA s. 104',
      description:
        'Update active job boards and corporate career pages to include explicit salary ranges and mandatory AI disclosures to avoid Ministry of Labour inspection notices.'
    });
  }

  // Legal Verdict
  let legalVerdict = 'FULLY_COMPLIANT';
  if (statutoryViolations.length > 0) {
    legalVerdict = 'NON_COMPLIANT_STATUTORY_BREACH';
  } else if (isSubjectToPayEquity && !hasCompletedAudit) {
    legalVerdict = 'PAY_EQUITY_AUDIT_RECOMMENDED';
  }

  const summary =
    legalVerdict === 'FULLY_COMPLIANT'
      ? 'The job posting and compensation transparency structure meet all statutory standards under the Working for Workers Four Act, 2024 and the Pay Equity Act.'
      : `Identified ${statutoryViolations.length} statutory violation(s) (${statutoryViolations.join(
          ', '
        )}). Corrective action required under ESA ss. 8.2-8.4.`;

  return {
    assessmentDate: safeAssessmentDate,
    employerName: cleanEmployerName,
    statutoryAuthority: 'Employment Standards Act, 2000 (Working for Workers Four Act, 2024) & Pay Equity Act (R.S.O. 1990, c. P.7)',
    legalVerdict,
    statutoryViolations,
    salaryRange: {
      minCad: sanitizedMin,
      maxCad: sanitizedMax,
      spreadPct: sanitizedMin > 0 ? Math.round(((sanitizedMax - sanitizedMin) / sanitizedMin) * 100) : 0
    },
    aiUsageDisclosed: !usesAi || disclosesAi,
    canadianExperienceProhibitionCompliant: !requiresCanadianExp,
    payEquitySubject: isSubjectToPayEquity,
    summary,
    deficiencies,
    compliancePoints,
    statutoryRemedies,
    jurisdiction: 'ON'
  };
}
