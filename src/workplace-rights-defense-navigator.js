/**
 * Northstar Workplace Rights & Human Rights Defense Navigator (Recs 87, 88, 89, 90, 91)
 * Implements statutory standards for:
 * 1. Constructive Dismissal Substantial Breach Audit (*Potter v. New Brunswick Legal Aid*, 2015 SCC 10)
 * 2. Ontario Human Rights Code "Canadian Experience" Ban (OHRC Policy & Code s. 2, 11)
 * 3. FARPACTA Regulated Profession Canadian Experience Prohibition (s. 10.2)
 * 4. Occupational Health & Safety Act (OHSA) Unsafe Work Refusal & Anti-Reprisal (s. 43, 50)
 * 5. WSIB / WorkSafeBC Workplace Injury 6-Month Statutory Claim Deadline (WSIA s. 22)
 */

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const WORKPLACE_RIGHTS_CONSTANTS = {
  CONSTRUCTIVE_DISMISSAL_SALARY_CUT_THRESHOLD_PERCENT: 10.0, // 10% or greater triggers presumptive breach
  CONDONATION_DEADLINE_WEEKS_APPROX: 4, // Reasonable protest window before deemed acceptance
  WSIB_STATUTORY_CLAIM_LIMITATION_MONTHS: 6, // WSIA s. 22
  WSIB_LOE_BENEFIT_NET_EARNINGS_PERCENT: 0.85 // 85% of net average earnings
};

/**
 * Audits Constructive Dismissal under the Potter v. New Brunswick Legal Aid [2015 SCC 10] Standard
 */
export function auditConstructiveDismissal({
  unilateralWageReductionPercent = 0,
  hasDemotionInStatusOrRank = false,
  forcedGeographicRelocation = false,
  toxicWorkEnvironmentHarassment = false,
  weeksElapsedSinceEmployerChange = 2,
  lodgedFormalWrittenProtest = true,
  employeeName = 'Employee',
  assessmentDate = todayIso()
} = {}) {
  const safeEmployeeName = boundedText(employeeName, 'Employee', 120);
  const safeAssessmentDate = safeIsoDate(assessmentDate, todayIso());
  const safeWageCut = Math.max(0, Math.min(100, Number(unilateralWageReductionPercent) || 0));
  const safeWeeks = Math.max(0, Math.min(5200, Math.floor(Number(weeksElapsedSinceEmployerChange) || 0)));

  const substantialBreaches = [];
  let isConstructiveDismissal = false;

  // Branch 1: Substantial Breach of an Essential Term
  if (safeWageCut >= WORKPLACE_RIGHTS_CONSTANTS.CONSTRUCTIVE_DISMISSAL_SALARY_CUT_THRESHOLD_PERCENT) {
    substantialBreaches.push(`Unilateral salary or compensation cut of ${safeWageCut}% meets the common law threshold for substantial breach of contract.`);
  }
  if (hasDemotionInStatusOrRank) {
    substantialBreaches.push('Significant stripping of core responsibilities or demotion in rank without employee consent constitutes a fundamental breach.');
  }
  if (forcedGeographicRelocation) {
    substantialBreaches.push('Unilateral relocation to a distant work facility without contractual relocation clause constitutes constructive dismissal.');
  }

  // Branch 2: Toxic Work Environment / Repudiation of Contract
  if (toxicWorkEnvironmentHarassment) {
    substantialBreaches.push('Hostile or toxic work environment (harassment, bullying, persistent abuse) indicating employer no longer intends to be bound by the employment agreement.');
  }

  isConstructiveDismissal = substantialBreaches.length > 0;

  // Condonation risk audit under Wronko v. Western Inventory Service Ltd.
  const isCondonationRiskHigh = safeWeeks > WORKPLACE_RIGHTS_CONSTANTS.CONDONATION_DEADLINE_WEEKS_APPROX && !lodgedFormalWrittenProtest;

  return {
    employeeName: safeEmployeeName,
    assessmentDate: safeAssessmentDate,
    statutoryBasis: 'Common Law Doctrine of Constructive Dismissal; Potter v. New Brunswick Legal Aid Services Commission [2015 SCC 10]',
    isConstructiveDismissal,
    breachesIdentified: substantialBreaches,
    condonationAudit: {
      isCondonationRiskHigh,
      weeksElapsed: safeWeeks,
      hasWrittenProtest: Boolean(lodgedFormalWrittenProtest),
      legalWarning: isCondonationRiskHigh
        ? 'HIGH CONDONATION RISK: Under Wronko v. Western Inventory Service Ltd., an employee who continues working under new terms for an extended period without formal written objection is legally deemed to have acquiesced to the changes, forfeiting their constructive dismissal claim.'
        : 'Timely protest preserved: Employee has not implicitly condoned the unilateral contract breach.'
    },
    remedyStrategy: isConstructiveDismissal
      ? 'The employee may treat the contract as terminated by the employer and pursue full Common Law Severance Pay (Bardal notice) plus potential moral/aggravated damages.'
      : 'The facts provided do not establish a prima facie case of constructive dismissal.'
  };
}

/**
 * Audits Discrimination based on "Canadian Experience" requirements (OHRC & FARPACTA)
 */
export function auditCanadianExperienceBarriers({
  type = 'employment_hiring', // 'employment_hiring' or 'professional_licensure'
  regulatedProfessionName = null, // e.g. 'Professional Engineers Ontario'
  employerDemandedCanadianExperience = true,
  hasBonaFideOccupationalRequirement = false,
  applicantName = 'Applicant',
  assessmentDate = todayIso()
}) {
  const safeApplicant = boundedText(applicantName, 'Applicant', 120);
  const safeAssessmentDate = safeIsoDate(assessmentDate, todayIso());
  const safeType = boundedText(type, 'employment_hiring', 40);
  const safeProfession = regulatedProfessionName ? boundedText(regulatedProfessionName, '', 120) : null;

  if (safeType === 'professional_licensure') {
    // FARPACTA s. 10.2
    return {
      applicantName: safeApplicant,
      assessmentDate: safeAssessmentDate,
      statutoryBasis: 'Fair Access to Regulated Professions and Compulsory Trades Act, 2006 (FARPACTA), s. 10.2',
      profession: safeProfession || 'Regulated Ontario Profession',
      isViolation: Boolean(employerDemandedCanadianExperience),
      legalRule: 'PROHIBITED BY LAW: Under FARPACTA s. 10.2 (enacted via the Working for Workers Act), Ontario regulated professions (engineers, accountants, geoscientists, etc.) are STRICTLY PROHIBITED from requiring Canadian work experience as a qualification for registration or licensing unless granted an explicit public safety exemption by the Minister.',
      remedy: 'Applicant can file a complaint with the Office of the Fairness Commissioner (OFC) and appeal the licensing body decision.'
    };
  }

  // General Employment Hiring under Ontario Human Rights Code
  const isCodeViolation = Boolean(employerDemandedCanadianExperience) && !hasBonaFideOccupationalRequirement;

  return {
    applicantName: safeApplicant,
    assessmentDate: safeAssessmentDate,
    statutoryBasis: 'Ontario Human Rights Code, R.S.O. 1990, c. H.19, s. 2(1) & s. 11; OHRC Policy on Removing the "Canadian Experience" Barrier',
    isPrimaFacieDiscrimination: isCodeViolation,
    legalStandard: 'Under the Ontario Human Rights Code, requiring "Canadian experience" in job postings or interview screening operates as indirect discrimination against immigrants on the prohibited grounds of race, ancestry, place of origin, and citizenship. Unless the employer can prove a strict Bona Fide Occupational Requirement (BFOR), this practice is unlawful.',
    remedySteps: isCodeViolation
      ? ['File an application with the Human Rights Tribunal of Ontario (HRTO) for damages for injury to dignity, feelings, and self-respect.', 'Report discriminatory job postings to the Ontario Human Rights Commission.']
      : ['No prima facie Human Rights Code violation detected.']
  };
}

/**
 * Audits Occupational Health & Safety Act (OHSA) Unsafe Work Refusal & Anti-Reprisal (s. 43, 50)
 */
export function auditOhsaWorkRefusalAndReprisal({
  physicalDangerReason = 'unguarded machinery and toxic chemical fumes',
  reportedToSupervisor = true,
  employerCompletedStage1Investigation = false,
  ministryOfLabourInspectorCalled = false,
  employerDisciplinedOrFiredWorker = false,
  workerName = 'Worker',
  assessmentDate = todayIso()
}) {
  const safeWorkerName = boundedText(workerName, 'Worker', 120);
  const safeAssessmentDate = safeIsoDate(assessmentDate, todayIso());
  const safeReason = boundedText(physicalDangerReason, 'unsafe conditions', 250);
  const stage = !reportedToSupervisor ? 'PRE_REFUSAL' : (!employerCompletedStage1Investigation ? 'STAGE_1_INVESTIGATION' : 'STAGE_2_MOL_INSPECTION');
  const isReprisalIllegal = Boolean(employerDisciplinedOrFiredWorker);

  return {
    workerName: safeWorkerName,
    assessmentDate: safeAssessmentDate,
    physicalDangerReason: safeReason,
    statutoryBasis: 'Occupational Health and Safety Act (OHSA), R.S.O. 1990, c. O.1, s. 43, s. 50',
    currentStage: stage,
    isWorkRefusalLawful: Boolean(reportedToSupervisor),
    reprisalAudit: {
      hasUnlawfulReprisalOccurred: isReprisalIllegal,
      legalRule: 'STRICT ANTI-REPRISAL PROTECTION: Under OHSA s. 50, an employer cannot dismiss, discipline, suspend, intimidate, or penalize a worker for exercising their legal right to refuse unsafe work.',
      reverseBurdenOfProof: 'REVERSE ONUS (s. 50(5)): In any proceeding before the Ontario Labour Relations Board (OLRB), the BURDEN OF PROOF LIES UPON THE EMPLOYER to prove that they did not discipline or dismiss the worker for safety refusal.'
    },
    statutoryProtocolSteps: [
      'Stage 1: Immediately notify supervisor or employer explaining why the work is unsafe. Remain in a safe area.',
      'Stage 1 Investigation: Employer must investigate immediately in the presence of the Joint Health and Safety Committee (JHSC) worker representative.',
      'Stage 2: If the employer refuses to fix the hazard or the worker continues to have reasonable grounds to believe it is dangerous, call the Ministry of Labour, Immigration, Training and Skills Development (MOL) at 1-877-202-0008.',
      'Stage 2 Inspector: An MOL inspector will visit the workplace and issue a binding written decision.'
    ]
  };
}

/**
 * Audits WSIB Workplace Injury Claim Deadlines & Return to Work Protections
 */
export function auditWsibInjuryClaimDeadline({
  dateOfAccident = '2026-06-01',
  assessmentDate = todayIso(),
  hasReportedToEmployer = true,
  form6SubmittedToWsib = false,
  workerName = 'Worker'
}) {
  const safeWorkerName = boundedText(workerName, 'Worker', 120);
  const safeAccidentDate = safeIsoDate(dateOfAccident, '2026-06-01');
  const safeAssessmentDate = safeIsoDate(assessmentDate, todayIso());

  const accidentTime = new Date(`${safeAccidentDate}T00:00:00Z`).getTime();
  const currentTime = new Date(`${safeAssessmentDate}T00:00:00Z`).getTime();
  const diffMs = currentTime - accidentTime;
  const monthsElapsed = Number.isFinite(diffMs) && diffMs >= 0
    ? diffMs / (1000 * 60 * 60 * 24 * 30.4375)
    : 0;

  const isWithinStatutoryDeadline = monthsElapsed <= WORKPLACE_RIGHTS_CONSTANTS.WSIB_STATUTORY_CLAIM_LIMITATION_MONTHS;
  const monthsRemaining = Math.max(0, WORKPLACE_RIGHTS_CONSTANTS.WSIB_STATUTORY_CLAIM_LIMITATION_MONTHS - monthsElapsed);

  return {
    workerName: safeWorkerName,
    assessmentDate: safeAssessmentDate,
    statutoryBasis: 'Workplace Safety and Insurance Act, 1997 (WSIA), s. 22',
    dateOfAccident: safeAccidentDate,
    monthsElapsed: Math.round(monthsElapsed * 10) / 10,
    statutoryLimitationMonths: WORKPLACE_RIGHTS_CONSTANTS.WSIB_STATUTORY_CLAIM_LIMITATION_MONTHS,
    isWithinClaimDeadline: isWithinStatutoryDeadline,
    monthsRemainingToClaim: Math.round(monthsRemaining * 10) / 10,
    wsibBenefitsSummary: {
      lossOfEarningsRate: '85% of net average pre-injury earnings (WSIA s. 43)',
      healthCareBenefits: 'Full coverage of approved medical, physiotherapy, and prescription drug costs',
      reEmploymentObligation: 'Under WSIA s. 41, employers with 20+ workers must re-employ injured workers who have been continuously employed for at least 1 year prior to injury.'
    },
    actionRequired: isWithinStatutoryDeadline
      ? 'Submit Form 6 (Worker’s Report of Injury/Disease) to WSIB immediately before the 6-month statutory deadline expires.'
      : 'EXPIRED: The 6-month limitation under WSIA s. 22 has passed. Worker must request an extension from the WSIB Registrar demonstrating just cause for delay.'
  };
}
