/**
 * Employment Insurance (EI) Disqualification, Just Cause & Separation Monies Allocation Engine
 * 
 * Statutory & Jurisdictional Authorities:
 * - Employment Insurance Act (EIA), S.C. 1996, c. 23:
 *   - s. 29 (Voluntary leaving without just cause - 14 statutory circumstances establishing just cause)
 *   - s. 30 (Disqualification for misconduct or voluntary separation without just cause)
 *   - s. 31 & s. 32 (Indefinite disqualification from regular benefits until requalification hours earned)
 *   - s. 33 (Special benefits exception: sickness, maternity, parental, and caregiving benefits payable despite regular disqualification)
 * - Employment Insurance Regulations, SOR/96-332:
 *   - ss. 35-36 (Allocation of earnings and separation monies: severance, vacation pay, termination pay)
 * - Leading Appellate Authorities:
 *   - Canada (AG) v. Brissette, [1994] 1 F.C. 684 (F.C.A.) (Misconduct requires willful/reckless blameworthy act; ordinary incompetence is not misconduct)
 *   - Canada (AG) v. Landry, [1993] 2 F.C. 172 (F.C.A.) (Subjective justification vs objective lack of reasonable alternatives)
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const EI_CONSTANTS = Object.freeze({
  MAX_INSURABLE_EARNINGS_ANNUAL_CAD: 68100.0,
  BENEFIT_RATE_PERCENT: 55.0,
  MAX_WEEKLY_BENEFIT_CAD: 721.0,
  MIN_REQUALIFICATION_HOURS: 420,
  MAX_REQUALIFICATION_HOURS: 700,
  WAITING_PERIOD_WEEKS: 1
});

export const STATUTORY_JUST_CAUSE_CIRCUMSTANCES = Object.freeze({
  harassment: {
    label: 'Sexual or Workplace Harassment',
    statuteRef: 'EIA s. 29(c)(i)',
    description: 'Harassment by supervisor, employer, or colleagues where employer failed to remedy.'
  },
  spousal_relocation: {
    label: 'Obligation to Accompany Spouse / Common-Law Partner',
    statuteRef: 'EIA s. 29(c)(ii)',
    description: 'Mandatory relocation due to partner employment, education, or family transfer.'
  },
  human_rights_discrimination: {
    label: 'Discrimination on Prohibited Grounds',
    statuteRef: 'EIA s. 29(c)(iii)',
    description: 'Discrimination based on race, origin, religion, disability, sex, or sexual orientation.'
  },
  health_safety_hazard: {
    label: 'Hazardous Working Conditions / Danger to Health or Safety',
    statuteRef: 'EIA s. 29(c)(iv)',
    description: 'Working conditions posing genuine risk to personal safety or mental/physical health.'
  },
  family_care_obligation: {
    label: 'Obligation to Care for a Child or Immediate Family Member',
    statuteRef: 'EIA s. 29(c)(v)',
    description: 'Severe elder care or child care obligations where all reasonable alternatives exhausted.'
  },
  reasonable_assurance_alt_job: {
    label: 'Reasonable Assurance of Another Employment in Near Future',
    statuteRef: 'EIA s. 29(c)(vi)',
    description: 'Firm job offer that unexpectedly fell through or was delayed after resigning.'
  },
  wage_reduction: {
    label: 'Significant Unilateral Wage or Salary Reduction',
    statuteRef: 'EIA s. 29(c)(vii)',
    description: 'Unilateral cut to remuneration or commission structure exceeding reasonable variance.'
  },
  unpaid_overtime: {
    label: 'Excessive Overtime or Refusal to Pay Overtime',
    statuteRef: 'EIA s. 29(c)(viii)',
    description: 'Employer demanding unpaid overtime or hours exceeding statutory ceilings.'
  },
  major_duty_changes: {
    label: 'Significant Modification in Work Duties',
    statuteRef: 'EIA s. 29(c)(ix)',
    description: 'Constructive change in responsibilities amounting to demotion or breach of core agreement.'
  },
  antagonistic_relations: {
    label: 'Antagonistic Relations for Which Employee is Not Primarily Responsible',
    statuteRef: 'EIA s. 29(c)(x)',
    description: 'Hostile interpersonal dynamic generated primarily by employer or supervisor.'
  }
});

/**
 * Evaluates EI regular benefit qualification, voluntary separation just cause,
 * employer-alleged misconduct under Brissette standards, separation monies allocation delay,
 * and special benefits exemptions under EIA s. 33.
 */
export function evaluateEiDisqualificationAndAllocation(input = {}) {
  const safeInput = (input && typeof input === 'object') ? input : {};
  const {
    separationType = 'voluntary_quit', // 'voluntary_quit' | 'employer_dismissal' | 'layoff_shortage_of_work' | 'contract_expiry'
    justCauseReason = null,
    triedReasonableAlternatives = true,
    employerAllegedMisconduct = false,
    allegedMisconductType = 'none', // 'incompetence_performance' | 'absenteeism_medical' | 'willful_insubordination' | 'theft_dishonesty'
    normalWeeklyGrossEarningsCad = 1200,
    severancePayReceivedCad = 6000,
    vacationPayPaidOutCad = 2400,
    payInLieuOfNoticeCad = 2400,
    isClaimingSpecialBenefits = false, // Maternity, Parental, Sickness, Compassionate Care
    insurableHoursAccumulated = 720,
    applicantName = 'EI Claimant',
    employerName = 'Employer Inc.',
    assessmentDate = '2026-10-31'
  } = safeInput;
  const sepType = boundedText(separationType, 'voluntary_quit', 50).toLowerCase();
  const justCauseKey = justCauseReason ? boundedText(justCauseReason, '', 60).toLowerCase() : null;
  const triedAlternatives = Boolean(triedReasonableAlternatives);
  const allegedMisconduct = Boolean(employerAllegedMisconduct);
  const misconductType = boundedText(allegedMisconductType, 'none', 50).toLowerCase();
  const weeklyEarnings = Math.max(1, Math.min(100000, Number.isFinite(Number(normalWeeklyGrossEarningsCad)) ? Number(normalWeeklyGrossEarningsCad) : 1200));

  const severance = Math.max(0, Math.min(10000000, Number.isFinite(Number(severancePayReceivedCad)) ? Number(severancePayReceivedCad) : 6000));
  const vacation = Math.max(0, Math.min(10000000, Number.isFinite(Number(vacationPayPaidOutCad)) ? Number(vacationPayPaidOutCad) : 2400));
  const noticePay = Math.max(0, Math.min(10000000, Number.isFinite(Number(payInLieuOfNoticeCad)) ? Number(payInLieuOfNoticeCad) : 2400));
  const totalSeparationMoniesCad = severance + vacation + noticePay;

  const specialBenefits = Boolean(isClaimingSpecialBenefits);
  const hours = Math.max(0, Math.min(10000, Number.isFinite(Number(insurableHoursAccumulated)) ? Number(insurableHoursAccumulated) : 720));

  const safeApplicant = boundedText(applicantName, 'EI Claimant', 100);
  const safeEmployer = boundedText(employerName, 'Employer Inc.', 150);
  const assessDate = safeIsoDate(assessmentDate, '2026-10-31');

  const statutoryNotes = [];
  const riskWarnings = [];
  const defenseArguments = [];

  // 1. Regular Benefit Rate Calculation
  const cappedWeeklyEarnings = Math.min(weeklyEarnings, EI_CONSTANTS.MAX_INSURABLE_EARNINGS_ANNUAL_CAD / 52.0);
  const estimatedWeeklyBenefitCad = Math.min(
    EI_CONSTANTS.MAX_WEEKLY_BENEFIT_CAD,
    Math.round((cappedWeeklyEarnings * (EI_CONSTANTS.BENEFIT_RATE_PERCENT / 100)) * 100) / 100
  );

  // 2. Misconduct & Just Cause Evaluation
  let isDisqualifiedFromRegularBenefits = false;
  let disqualificationReason = null;
  let justCauseCircumstance = null;
  let misconductAuditResult = 'not_applicable';

  if (sepType === 'layoff_shortage_of_work' || sepType === 'contract_expiry') {
    isDisqualifiedFromRegularBenefits = false;
    disqualificationReason = 'No disqualification. Separation caused by shortage of work or end of contract (Code A or Code E).';
  } else if (sepType === 'voluntary_quit') {
    if (justCauseKey && STATUTORY_JUST_CAUSE_CIRCUMSTANCES[justCauseKey] && triedAlternatives) {
      isDisqualifiedFromRegularBenefits = false;
      justCauseCircumstance = STATUTORY_JUST_CAUSE_CIRCUMSTANCES[justCauseKey];
      disqualificationReason = `Exempt from disqualification under ${justCauseCircumstance.statuteRef}. Claimant established just cause having no reasonable alternative.`;
      defenseArguments.push(`Cite ${justCauseCircumstance.statuteRef} (${justCauseCircumstance.label}) to Service Canada / Social Security Tribunal.`);
      defenseArguments.push('Provide written evidence of complaints to management, union grievance records, or medical notes proving attempts to resolve the workplace issue before resigning.');
    } else {
      isDisqualifiedFromRegularBenefits = true;
      disqualificationReason = 'Voluntary leaving without just cause under EIA s. 29(c). Claimant must demonstrate they had no reasonable alternative to quitting.';
      riskWarnings.push('INDEFINITE DISQUALIFICATION: Resigning without demonstrating that all reasonable alternatives were exhausted results in a permanent disqualification from regular benefits until new insurable hours are earned.');
    }
  } else if (sepType === 'employer_dismissal') {
    if (allegedMisconduct) {
      if (misconductType === 'incompetence_performance') {
        misconductAuditResult = 'incompetence_not_misconduct';
        isDisqualifiedFromRegularBenefits = false;
        disqualificationReason = 'Employer dismissal for poor performance or incompetence does NOT constitute statutory misconduct under Brissette [1994] 1 F.C. 684.';
        defenseArguments.push('Under Federal Court of Appeal precedent (Canada v. Brissette), misconduct requires a willful, intentional, or reckless breach of duty. Mere inability to meet sales quotas or performance standards is NOT statutory misconduct.');
      } else if (misconductType === 'absenteeism_medical') {
        misconductAuditResult = 'medical_absence_not_misconduct';
        isDisqualifiedFromRegularBenefits = false;
        disqualificationReason = 'Absence substantiated by medical illness or disability is not willful misconduct under EIA s. 30.';
        defenseArguments.push('Submit physician medical certificates documenting that absences were medically necessary and not voluntary insubordination.');
      } else {
        misconductAuditResult = 'willful_misconduct_alleged';
        isDisqualifiedFromRegularBenefits = true;
        disqualificationReason = 'Disqualification under EIA s. 30(1) due to employer-alleged willful misconduct (dishonesty, theft, or deliberate insubordination).';
        riskWarnings.push('BURDEN OF PROOF: The employer and the Commission bear the legal burden of proving on a balance of probabilities that the employee acted willfully and that the conduct caused the dismissal.');
      }
    } else {
      isDisqualifiedFromRegularBenefits = false;
      disqualificationReason = 'Standard termination without cause (Code M). Entitled to regular EI benefits.';
    }
  }

  // 3. Special Benefits Override Check (EIA s. 33)
  let specialBenefitsAvailable = false;
  if (specialBenefits) {
    specialBenefitsAvailable = hours >= EI_CONSTANTS.MIN_REQUALIFICATION_HOURS;
    statutoryNotes.push('EIA s. 33 STATUTORY EXCEPTION: Disqualification under s. 30 for voluntary quit or misconduct applies ONLY to regular benefits. Special benefits (sickness, maternity, parental, caregiver) remain fully payable if minimum qualifying hours are satisfied.');
  }

  // 4. Separation Monies Allocation (EI Regulations ss. 35-36)
  // Separation payments are allocated based on normal weekly earnings from the date of separation
  const allocationWeeks = Math.ceil(totalSeparationMoniesCad / weeklyEarnings);
  const delayExplanation = totalSeparationMoniesCad > 0
    ? `Total separation payments of $${totalSeparationMoniesCad.toLocaleString()} CAD will be allocated at your normal rate of $${weeklyEarnings.toLocaleString()} CAD/week, creating an estimated ${allocationWeeks}-week allocation delay before EI benefit payments can begin.`
    : 'No separation monies to allocate; standard 1-week waiting period applies.';

  if (totalSeparationMoniesCad > 0) {
    statutoryNotes.push(`EI Regulations s. 36: Severance, notice pay, and accumulated vacation pay constitute earnings arising from separation. Service Canada allocates these amounts week-by-week at your regular earnings rate starting from the date of dismissal.`);
  }

  return {
    applicantName: safeApplicant,
    employerName: safeEmployer,
    assessmentDate: assessDate,
    regularBenefits: {
      estimatedWeeklyBenefitCad,
      isDisqualifiedFromRegularBenefits,
      disqualificationReason,
      insurableHoursAccumulated: hours,
      meetsHoursThreshold: hours >= EI_CONSTANTS.MIN_REQUALIFICATION_HOURS
    },
    justCauseAudit: {
      separationType: sepType,
      claimedJustCauseKey: justCauseKey,
      justCauseEstablished: Boolean(justCauseCircumstance),
      justCauseDetails: justCauseCircumstance
    },
    misconductAudit: {
      employerAllegedMisconduct: allegedMisconduct,
      allegedMisconductType: misconductType,
      misconductAuditResult
    },
    separationMoniesAllocation: {
      severancePayCad: severance,
      vacationPayCad: vacation,
      payInLieuOfNoticeCad: noticePay,
      totalSeparationMoniesCad,
      normalWeeklyEarningsCad: weeklyEarnings,
      estimatedAllocationDelayWeeks: allocationWeeks,
      delayExplanation
    },
    specialBenefitsOverride: {
      isClaimingSpecialBenefits: specialBenefits,
      specialBenefitsAvailable,
      statuteBasis: 'EIA s. 33'
    },
    defenseArguments,
    statutoryNotes,
    riskWarnings
  };
}
