/**
 * Northstar — Canadian Human Rights Code, Workplace Harassment & Constructive Dismissal Diagnostic Engine
 *
 * Implements statutory and common law jurisprudence under:
 * - Ontario Human Rights Code (OHRC), RSO 1990, c. H.19:
 *   - s. 5(1) (Right to equal treatment in employment without discrimination)
 *   - s. 5(2) (Right to freedom from harassment in employment)
 *   - s. 7 (Right to freedom from sexual harassment)
 *   - s. 8 (Reprisal / retaliation ban)
 *   - s. 11 (Constructive discrimination)
 *   - s. 17 (Duty to accommodate up to undue hardship)
 *   - s. 34(1) (1-year limitation period for HRTO application)
 * - Canadian Human Rights Act (CHRA), RSC 1985, c. H-6 (Federal sector: banks, telecom, aviation)
 * - British Columbia Human Rights Code, RSBC 1996, c. 210: ss. 13, 22(1), 43
 * - Supreme Court of Canada Constructive Dismissal Jurisprudence:
 *   - Potter v. New Brunswick Legal Aid Services Commission, 2015 SCC 10
 *   - Farber v. Royal Trust Co., [1997] 1 SCR 846
 *   - Bardal v. Globe & Mail Ltd. (1960) Common Law Notice Factors
 *
 * Pure ES module with zero npm runtime dependencies.
 */

export const HUMAN_RIGHTS_JURISDICTIONS = {
  ON: {
    name: 'Ontario',
    statute: 'Ontario Human Rights Code (OHRC)',
    tribunal: 'Human Rights Tribunal of Ontario (HRTO)',
    limitationPeriodDays: 365,
    formName: 'HRTO Form 1 (Individual Application)',
    canadianExperienceProhibited: true // Bill 27 / FARPACTA & OHRC Policy
  },
  BC: {
    name: 'British Columbia',
    statute: 'BC Human Rights Code',
    tribunal: 'BC Human Rights Tribunal (BCHRT)',
    limitationPeriodDays: 365,
    formName: 'BCHRT Form 1.1 (Employment Complaint)',
    canadianExperienceProhibited: true
  },
  FED: {
    name: 'Federal Jurisdiction (Banks, Telecom, Airlines, Trucking)',
    statute: 'Canadian Human Rights Act (CHRA)',
    tribunal: 'Canadian Human Rights Commission (CHRC)',
    limitationPeriodDays: 365,
    formName: 'CHRC Online Complaint Assessment',
    canadianExperienceProhibited: true
  }
};

/**
 * Diagnostic evaluation of workplace human rights discrimination, harassment, and constructive dismissal.
 */
export function evaluateWorkplaceDiscriminationAndConstructiveDismissal(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    jurisdiction = 'ON',
    protectedGrounds = ['place_of_origin', 'citizenship'],
    conductTypes = ['canadian_experience_requirement', 'retaliation_or_reprisal'],
    daysSinceLastIncident = 30,
    employerResponse = 'none',
    annualSalaryCad = 80000,
    yearsOfService = 3,
    applicantAge = 35
  } = safeParams;
  const normJurisdiction = String(jurisdiction || 'ON').toUpperCase();
  const jConfig = HUMAN_RIGHTS_JURISDICTIONS[normJurisdiction] || HUMAN_RIGHTS_JURISDICTIONS.ON;
  const salary = Math.max(1000, Number(annualSalaryCad) || 75000);
  const years = Math.max(0.1, Number(yearsOfService) || 1);
  const age = Math.max(18, Number(applicantAge) || 35);
  const daysPassed = Math.max(0, Number(daysSinceLastIncident) || 0);

  const groundsList = Array.isArray(protectedGrounds) ? protectedGrounds : [String(protectedGrounds)];
  const conductList = Array.isArray(conductTypes) ? conductTypes : [String(conductTypes)];

  const statutoryViolations = [];
  const constructiveDismissalFactors = [];

  // 1. Statute of Limitations Audit (1 Year / 365 Days)
  const isWithin1YearLimitation = daysPassed <= jConfig.limitationPeriodDays;
  const daysRemainingToApply = Math.max(0, jConfig.limitationPeriodDays - daysPassed);
  const limitationWarning = isWithin1YearLimitation
    ? `You have ${daysRemainingToApply} days remaining before the mandatory 1-year statutory deadline to file your complaint with the ${jConfig.tribunal}.`
    : `WARNING: ${daysPassed} days have elapsed since the last discriminatory incident. The statutory 1-year limitation period has expired. You must establish good faith delay and absence of substantial prejudice under OHRC s. 34(2) to proceed.`;

  // 2. Discriminatory Conduct Evaluation
  let hasPrimaFacieDiscrimination = false;
  let hasReprisal = false;

  if (conductList.includes('canadian_experience_requirement')) {
    hasPrimaFacieDiscrimination = true;
    statutoryViolations.push({
      statute: normJurisdiction === 'ON' ? 'OHRC s. 5(1) & s. 11' : 'Human Rights Code',
      ground: 'Place of origin / Citizenship',
      severity: 'UNLAWFUL_DISCRIMINATION',
      finding: 'Requiring "Canadian experience" as a hiring, promotion, or wage condition constitutes unlawful constructive discrimination under the OHRC Policy on Removing the "Canadian Experience" Barrier and Ontario Bill 27 (Working for Workers Act).'
    });
  }

  if (conductList.includes('slurs_or_harassment')) {
    hasPrimaFacieDiscrimination = true;
    statutoryViolations.push({
      statute: normJurisdiction === 'ON' ? 'OHRC s. 5(2)' : 'Human Rights Code',
      ground: groundsList.join(', '),
      severity: 'PROHIBITED_HARASSMENT',
      finding: 'Engaging in a course of vexatious comment or conduct related to protected grounds that is known or ought reasonably to be known to be unwelcome violates statutory anti-harassment protections.'
    });
  }

  if (conductList.includes('unreasonable_refusal_of_accommodation')) {
    hasPrimaFacieDiscrimination = true;
    statutoryViolations.push({
      statute: normJurisdiction === 'ON' ? 'OHRC s. 17' : 'Human Rights Code',
      ground: 'Disability / Creed / Family Status',
      severity: 'FAILURE_TO_ACCOMMODATE',
      finding: 'The employer has a strict statutory duty to accommodate protected grounds up to the point of undue hardship (considering cost and health and safety). A summary refusal without individualized assessment breaches the Code.'
    });
  }

  if (conductList.includes('retaliation_or_reprisal') || employerResponse === 'retaliated') {
    hasReprisal = true;
    statutoryViolations.push({
      statute: normJurisdiction === 'ON' ? 'OHRC s. 8' : 'Human Rights Code Reprisal Clause',
      ground: 'Enforcement of Human Rights',
      severity: 'UNLAWFUL_REPRISAL',
      finding: 'Strict statutory prohibition against reprisal: No person shall penalize, threaten, or discipline an employee because the employee claimed or enforced their rights under the Human Rights Code.'
    });
  }

  // 3. Constructive Dismissal Doctrine Analysis (Potter v. New Brunswick Legal Aid, 2015 SCC 10)
  let isConstructiveDismissal = false;
  let constructiveDismissalReason = '';

  if (conductList.includes('salary_cut_greater_15_percent')) {
    isConstructiveDismissal = true;
    constructiveDismissalFactors.push('Unilateral salary reduction exceeding 15% constitutes a fundamental repudiation of the employment contract (Farber v. Royal Trust Co., [1997] 1 SCR 846).');
  }

  if (conductList.includes('demotion_or_title_strip')) {
    isConstructiveDismissal = true;
    constructiveDismissalFactors.push('Substantial unilateral reduction in status, authority, reporting hierarchy, or core responsibilities.');
  }

  if (conductList.includes('indefinite_unpaid_suspension')) {
    isConstructiveDismissal = true;
    constructiveDismissalFactors.push('Under Potter v. New Brunswick Legal Aid Services Commission (2015 SCC 10), placing an employee on unpaid or indefinite administrative suspension without explicit statutory authority constitutes immediate constructive dismissal.');
  }

  if (conductList.includes('toxic_workplace_environment')) {
    isConstructiveDismissal = true;
    constructiveDismissalFactors.push('Course of employer conduct creating an intolerable, poisoned work environment such that a reasonable person in the employee’s position would feel compelled to resign.');
  }

  // 4. Common Law Notice Damages Calculation (Bardal Factors)
  // Base: ~1 month per year of service, adjusted for age and salary
  let estimatedNoticeMonths = Math.min(24, Math.max(2, Math.round(years * 1.0 + (age > 45 ? 2 : 0) + (salary > 100000 ? 2 : 1))));
  const estimatedCommonLawNoticeValueCad = Math.round((salary / 12) * estimatedNoticeMonths);

  // 5. Human Rights Injury to Dignity Damages Estimate
  let dignityMinCad = 10000;
  let dignityMaxCad = 35000;
  if (hasReprisal) {
    dignityMinCad += 10000;
    dignityMaxCad += 25000;
  }
  if (statutoryViolations.length >= 2) {
    dignityMinCad += 5000;
    dignityMaxCad += 15000;
  }

  // Verdicts
  let humanRightsViolationVerdict = 'NO_DISCRIMINATORY_GROUNDS_IDENTIFIED';
  if (hasReprisal) {
    humanRightsViolationVerdict = 'UNLAWFUL_STATUTORY_REPRISAL';
  } else if (hasPrimaFacieDiscrimination || statutoryViolations.length > 0) {
    humanRightsViolationVerdict = 'PROBABLE_PRIMA_FACIE_DISCRIMINATION';
  }

  let constructiveDismissalVerdict = 'NO_CONSTRUCTIVE_DISMISSAL';
  if (isConstructiveDismissal) {
    constructiveDismissalVerdict = 'ESTABLISHED_CONSTRUCTIVE_DISMISSAL';
    constructiveDismissalReason = 'The employer has committed a substantial breach of essential contract terms, triggering an immediate right to common law notice damages without loss of severance.';
  } else if (statutoryViolations.length > 0) {
    constructiveDismissalVerdict = 'RISK_OF_POISONED_WORK_ENVIRONMENT';
    constructiveDismissalReason = 'Ongoing unaddressed harassment creates substantial exposure to a poisoned work environment claim.';
  }

  // Summary
  const summary = `${humanRightsViolationVerdict}: ${statutoryViolations.length} statutory human rights violations identified under ${jConfig.statute}. ${
    isConstructiveDismissal
      ? `Constructive dismissal established under Potter v. New Brunswick (2015 SCC 10) with estimated notice entitlement of ${estimatedNoticeMonths} months ($${estimatedCommonLawNoticeValueCad.toLocaleString()} CAD).`
      : 'No constructive dismissal detected yet, but formal human rights remedies apply.'
  }`;

  // 6. Formal Demand Letter to Employer
  const officialFormalDemandLetter = `CONFIDENTIAL & PRIVILEGED — WITHOUT PREJUDICE
Date: 2026-10-31
To: Human Resources & Senior Management
Re: Formal Notice of Human Rights Violations & Constructive Dismissal Claim

Please be formally advised that the treatment of the undersigned employee constitutes serious violations of the ${jConfig.statute} and the common law of employment.

1. STATUTORY HUMAN RIGHTS VIOLATIONS:
${statutoryViolations.map((v, i) => `   (${i + 1}) [${v.statute}] ${v.severity}: ${v.finding}`).join('\n')}

2. CONSTRUCTIVE DISMISSAL & DAMAGES CLAIM:
${constructiveDismissalFactors.length > 0
  ? `Pursuant to the Supreme Court of Canada’s governing rulings in Potter v. New Brunswick (2015 SCC 10) and Farber v. Royal Trust ([1997] 1 SCR 846), the employer's unilateral actions have fundamentally breached essential terms of employment.
The employee is entitled to full common law notice damages estimated at ${estimatedNoticeMonths} months' salary ($${estimatedCommonLawNoticeValueCad.toLocaleString()} CAD), plus general damages for injury to dignity, feelings, and self-respect ($${dignityMinCad.toLocaleString()} - $${dignityMaxCad.toLocaleString()} CAD).`
  : `The employer is placed on immediate notice to cease all discriminatory conduct and provide required statutory accommodation under ${jConfig.statute} without reprisal.`
}

3. ANTI-REPRISAL PROTECTION:
Under statutory law, any discipline, dismissal, or adverse change in working conditions following this notice constitutes illegal reprisal, creating separate statutory liability.

Please confirm within five (5) business days that you will engage in good-faith resolution discussions before formal proceedings are initiated with the ${jConfig.tribunal}.

Sincerely,
Complainant in Full Exercise of Statutory Rights`;

  return {
    asOf: '2026-10-31',
    jurisdiction: normJurisdiction,
    jurisdictionDetails: jConfig,
    humanRightsViolationVerdict,
    constructiveDismissalVerdict,
    summary,
    statuteOfLimitationsStatus: {
      isWithin1YearLimitation,
      daysSinceLastIncident: daysPassed,
      daysRemainingToApply,
      limitationWarning
    },
    statutoryViolations,
    constructiveDismissalAudit: {
      isConstructiveDismissal,
      reason: constructiveDismissalReason,
      factorsIdentified: constructiveDismissalFactors,
      potterVNewBrunswickApplied: conductList.includes('indefinite_unpaid_suspension') || conductList.includes('toxic_workplace_environment')
    },
    damagesAssessment: {
      estimatedCommonLawNoticeMonths: estimatedNoticeMonths,
      estimatedCommonLawNoticeValueCad: estimatedCommonLawNoticeValueCad,
      humanRightsDignityDamagesEstimateCad: {
        minCad: dignityMinCad,
        maxCad: dignityMaxCad,
        precedentBasis: 'HRTO / BCHRT general damages for injury to dignity, feelings, and self-respect (uncapped)'
      }
    },
    retaliationProtection: {
      isReprisalProtected: true,
      statute: normJurisdiction === 'ON' ? 'OHRC s. 8' : 'Human Rights Code Reprisal Clause',
      advisory: 'It is strictly illegal for an employer to dismiss, discipline, demote, or penalize you for filing or asserting a human rights grievance.'
    },
    officialFormalDemandLetter,
    statutoryReferences: [
      jConfig.statute + ' s. 5(1) (Equal treatment without discrimination)',
      jConfig.statute + ' s. 5(2) (Freedom from workplace harassment)',
      jConfig.statute + ' s. 8 (Reprisal prohibition)',
      jConfig.statute + ' s. 11 (Constructive discrimination & Canadian experience rule)',
      jConfig.statute + ' s. 17 (Duty to accommodate to undue hardship)',
      'Supreme Court of Canada: Potter v. New Brunswick Legal Aid Services Commission, 2015 SCC 10 (Constructive dismissal)',
      'Supreme Court of Canada: Farber v. Royal Trust Co., [1997] 1 SCR 846 (Unilateral contract alteration)'
    ]
  };
}
