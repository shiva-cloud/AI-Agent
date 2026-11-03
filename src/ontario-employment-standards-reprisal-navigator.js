// src/ontario-employment-standards-reprisal-navigator.js
// Ontario ESA Section 74 Reprisal Defense & Reverse Burden of Proof Engine
// Statutory Basis: Ontario Employment Standards Act, 2000 (ESA), S.O. 2000, c. 41, ss. 74, 104, 111

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const ESA_REPRISAL_RULES = {
  STATUTE: 'Employment Standards Act, 2000, S.O. 2000, c. 41',
  REPRISAL_SECTION: 's. 74(1)',
  REVERSE_ONUS_SECTION: 's. 74(2)',
  ORDER_REMEDY_SECTION: 's. 104',
  LIMITATION_PERIOD_MONTHS: 24, // 2 years under ESA s. 111(1)
  PROTECTED_ACTIVITIES: [
    'asked_about_rights',
    'requested_overtime_pay',
    'refused_excessive_hours',
    'requested_statutory_holiday_pay',
    'requested_vacation_pay',
    'requested_sick_leave',
    'filed_ministry_claim',
    'participated_in_inspection',
    'refused_unlawful_wage_deduction'
  ],
  PROHIBITED_ADVERSE_ACTIONS: [
    'termination',
    'suspension',
    'demotion',
    'hours_reduction',
    'shift_reassignment_punitive',
    'wage_reduction',
    'intimidation_threat'
  ]
};

/**
 * Evaluates an employment adverse action for statutory reprisal under Ontario ESA s. 74.
 *
 * @param {Object} input
 * @param {string} input.protectedActivity - Activity engaged in by the worker (e.g., 'asked_about_rights', 'requested_overtime_pay')
 * @param {string} input.adverseAction - Adverse action taken by employer (e.g., 'termination', 'hours_reduction')
 * @param {number} input.daysBetweenActivityAndAction - Temporal proximity in days
 * @param {boolean} input.employerProvidedWrittenReason - Whether employer provided written non-retaliatory rationale
 * @param {string} input.allegedEmployerReason - Stated employer reason (e.g., 'restructuring', 'performance', 'none')
 * @param {boolean} input.hasDocumentaryEvidence - Texts, emails, witness statements, or timecards documenting the exchange
 * @param {number} input.monthlyLostWageCad - Approximate monthly lost wage earnings
 * @param {number} input.monthsElapsedSinceAction - Months elapsed since the adverse action
 * @param {string} [input.employeeName] - Employee name
 * @param {string} [input.assessmentDate] - ISO date string
 * @returns {Object} Deterministic legal audit and statutory guidance
 */
export function evaluateEsaReprisal(input = {}) {
  const safeInput = (input && typeof input === 'object') ? input : {};
  const {
    protectedActivity = 'asked_about_rights',
    adverseAction = 'termination',
    daysBetweenActivityAndAction = 14,
    employerProvidedWrittenReason = false,
    allegedEmployerReason = 'none',
    hasDocumentaryEvidence = false,
    monthlyLostWageCad = 4000,
    monthsElapsedSinceAction = 1,
    employeeName = 'Worker',
    assessmentDate = todayIso()
  } = safeInput;

  const cleanEmployeeName = boundedText(employeeName, 'Worker', 100);
  const cleanAssessmentDate = safeIsoDate(assessmentDate, todayIso());
  const cleanDays = Number.isFinite(Number(daysBetweenActivityAndAction)) ? Math.max(0, Math.min(36500, Math.floor(Number(daysBetweenActivityAndAction)))) : 14;
  const cleanMonthlyLostWage = Number.isFinite(Number(monthlyLostWageCad)) ? Math.max(0, Math.min(10000000, Number(monthlyLostWageCad))) : 4000;
  const cleanMonthsElapsed = Number.isFinite(Number(monthsElapsedSinceAction)) ? Math.max(0, Math.min(1200, Math.floor(Number(monthsElapsedSinceAction)))) : 1;

  const findings = [];
  const legalProtections = [];
  const proceduralSteps = [];
  const remediesAvailable = [];

  // 1. Verify Protected Activity under ESA s. 74(1)
  const isRecognizedActivity = ESA_REPRISAL_RULES.PROTECTED_ACTIVITIES.includes(protectedActivity);
  if (isRecognizedActivity) {
    legalProtections.push({
      basis: 'ESA s. 74(1)(a)-(f)',
      description: `Exercising or asking about statutory rights (${protectedActivity.replace(/_/g, ' ')}) is explicitly protected from any penalty or intimidation.`
    });
  } else {
    findings.push({
      type: 'WARNING',
      issue: 'Unlisted Activity Context',
      details: 'The activity must relate to asking about rights, claiming entitlements, or cooperating with enforcement under the Employment Standards Act.'
    });
  }

  // 2. Evaluate Adverse Action
  const isProhibitedAction = ESA_REPRISAL_RULES.PROHIBITED_ADVERSE_ACTIONS.includes(adverseAction);
  if (!isProhibitedAction) {
    findings.push({
      type: 'INFO',
      issue: 'Non-Standard Adverse Action',
      details: `Action "${adverseAction}" should constitute a material detriment, discipline, penalty, or threat.`
    });
  }

  // 3. Reverse Burden of Proof (ESA s. 74(2))
  const isReverseOnusTriggered = isRecognizedActivity && isProhibitedAction;
  if (isReverseOnusTriggered) {
    legalProtections.push({
      basis: 'ESA s. 74(2) Reverse Onus of Proof',
      description: 'The statutory burden of proof rests entirely on the employer to establish that the adverse action was completely unconnected to the employee exercising statutory rights.'
    });
  }

  // 4. Temporal Proximity Assessment
  let proximityWeight = 'MODERATE';
  if (cleanDays <= 14) {
    proximityWeight = 'VERY_STRONG';
    findings.push({
      type: 'PRIMA_FACIE_EVIDENCE',
      issue: 'Immediate Temporal Proximity',
      details: `Adverse action occurred within ${cleanDays} days of asserting rights. In Ontario Labour Relations Board jurisprudence, close temporal proximity creates a formidable presumption of unlawful reprisal.`
    });
  } else if (cleanDays <= 60) {
    proximityWeight = 'STRONG';
    findings.push({
      type: 'PRIMA_FACIE_EVIDENCE',
      issue: 'Strong Temporal Proximity',
      details: `Action taken within ${cleanDays} days strongly supports an inference of retaliatory motive.`
    });
  } else {
    proximityWeight = 'DISTANT';
    findings.push({
      type: 'CAUTION',
      issue: 'Extended Proximity Gap',
      details: `${cleanDays} days elapsed between inquiry and action. Additional corroborating documentation or differential treatment evidence is recommended.`
    });
  }

  // 5. Written Justification & Pretext Defense
  if (!employerProvidedWrittenReason || allegedEmployerReason === 'none') {
    findings.push({
      type: 'EMPLOYER_VULNERABILITY',
      issue: 'Lack of Contemporaneous Justification',
      details: 'Failure of employer to provide a bona fide contemporaneous business or disciplinary record severely impairs employer ability to discharge their s. 74(2) burden.'
    });
  } else if (['restructuring', 'shortage_of_work', 'performance'].includes(allegedEmployerReason)) {
    findings.push({
      type: 'DEFENSE_ANALYSIS',
      issue: 'Potential Pretext Scrutiny',
      details: `Employer relies on "${allegedEmployerReason}". Ministry officers and the OLRB will examine whether others were hired, whether progressive discipline occurred, and if the stated reason is merely pretextual.`
    });
  }

  // 6. Evidentiary Weight
  if (hasDocumentaryEvidence) {
    findings.push({
      type: 'EVIDENTIARY_STRENGTH',
      issue: 'Documentary Record Available',
      details: 'Contemporaneous text messages, emails, schedules, or call logs substantially strengthen the claim.'
    });
  } else {
    proceduralSteps.push('Assemble any electronic communications, payroll records, shift rosters, or witness accounts establishing the timeline.');
  }

  // 7. Limitation Period Audit (ESA s. 111(1))
  const isWithinLimitation = cleanMonthsElapsed <= ESA_REPRISAL_RULES.LIMITATION_PERIOD_MONTHS;
  if (!isWithinLimitation) {
    findings.push({
      type: 'STATUTORY_BAR',
      issue: 'Limitation Period Expired',
      details: `Action occurred ${cleanMonthsElapsed} months ago, exceeding the strict 24-month statutory limitation period under ESA s. 111(1). Ministry cannot accept an expired claim.`
    });
  } else {
    proceduralSteps.push(`File an Employment Standards Claim online with the Ontario Ministry of Labour within the remaining ${ESA_REPRISAL_RULES.LIMITATION_PERIOD_MONTHS - cleanMonthsElapsed} month(s).`);
  }

  // 8. Quantify Remedies under ESA s. 104
  const estimatedLostWagesCad = Math.max(0, cleanMonthlyLostWage * cleanMonthsElapsed);
  remediesAvailable.push({
    remedy: 'Statutory Reinstatement',
    authority: 'ESA s. 104(1)(a)',
    description: 'Ministry / OLRB can order full reinstatement to former position with no loss of seniority.'
  });
  remediesAvailable.push({
    remedy: 'Full Back-Pay Wage Compensation',
    authority: 'ESA s. 104(1)(b)',
    estimatedCad: estimatedLostWagesCad,
    description: `Estimated accrued wage loss of $${estimatedLostWagesCad.toLocaleString('en-CA')} to date, continuing until reinstatement or resolution.`
  });
  remediesAvailable.push({
    remedy: 'General Damages for Emotional Distress & Loss of Dignity',
    authority: 'ESA s. 104 & OLRB Precedent',
    typicalRangeCad: '$2,000 - $10,000',
    description: 'Statutory compensation for distress and victimization caused by unlawful retaliation.'
  });

  const reprisalRiskScore = !isWithinLimitation ? 'BARRED_BY_LIMITATION' :
    (isReverseOnusTriggered && proximityWeight === 'VERY_STRONG') ? 'CRITICAL_HIGH_MERIT' :
    (isReverseOnusTriggered && proximityWeight === 'STRONG') ? 'HIGH_MERIT' : 'MODERATE_MERIT';

  return {
    assessmentDate: cleanAssessmentDate,
    employeeName: cleanEmployeeName,
    statutoryAuthority: ESA_REPRISAL_RULES.STATUTE,
    reprisalSection: ESA_REPRISAL_RULES.REPRISAL_SECTION,
    reverseOnusSection: ESA_REPRISAL_RULES.REVERSE_ONUS_SECTION,
    reprisalRiskScore,
    isReverseBurdenTriggered: isReverseOnusTriggered,
    isWithinLimitationPeriod: isWithinLimitation,
    summary: `${cleanEmployeeName}'s complaint exhibits characteristics of an unlawful employer reprisal under ESA s. 74. Reverse onus of proof under s. 74(2) places the legal burden directly upon the employer.`,
    temporalProximity: {
      daysElapsed: cleanDays,
      weight: proximityWeight
    },
    findings,
    legalProtections,
    remediesAvailable,
    proceduralSteps,
    jurisdiction: 'Ontario, Canada'
  };
}
