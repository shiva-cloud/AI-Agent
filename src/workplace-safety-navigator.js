/**
 * Workplace Safety, Right to Refuse Unsafe Work & WSIB Compensation Engine
 * 
 * Statutory & Jurisdictional Authorities:
 * - Ontario Occupational Health and Safety Act (OHSA), R.S.O. 1990, c. O.1:
 *   - s. 43 (Statutory Two-Stage Right to Refuse Unsafe Work)
 *   - s. 43(4)-(7) (Stage 1 internal investigation by supervisor & JHSC worker representative)
 *   - s. 43(8)-(10) (Stage 2 ongoing refusal & mandatory Ministry of Labour inspector summons)
 *   - s. 43(11) (Strict prohibition on reassigning refused work without notice of refusal)
 *   - s. 50 (Strict anti-reprisal protection; reverse burden of proof on employer at OLRB)
 * - Ontario Workplace Safety and Insurance Act, 1997 (WSIA), S.O. 1997, c. 16, Sched. A:
 *   - s. 15 (No-fault compensation scheme and historic bar on tort lawsuits against covered employers)
 *   - s. 21 (Mandatory employer reporting within 3 calendar days via Form 7)
 *   - s. 22 (Worker claim filing deadline: strictly within 6 months via Form 6)
 *   - s. 43 (Loss of Earnings / LOE benefits: 85% of net average earnings)
 *   - WSIB Operational Policy 12-04-10 (Coverage regardless of immigration status / work authorization)
 * - British Columbia Workers Compensation Act, R.S.B.C. 2019, c. 1 (WorkSafeBC):
 *   - Occupational Health and Safety Regulation s. 3.12 (Refusal of unsafe work)
 *   - s. 209 (Wage-loss benefits: 90% of net average earnings)
 */

import { boundedText, safeIsoDate, todayIso } from './text-input.js';

export const SAFETY_COMPENSATION_CONSTANTS = Object.freeze({
  ONTARIO_WSIB_LOE_PERCENT_NET: 85.0,
  BC_WORKSAFE_LOE_PERCENT_NET: 90.0,
  WSIB_CLAIM_LIMITATION_MONTHS: 6,
  EMPLOYER_REPORT_DEADLINE_DAYS: 3
});

export const HAZARD_TAXONOMY = Object.freeze({
  physical_fall_collapse: {
    label: 'Fall Hazards, Unguarded Heights & Scaffolding Collapse',
    statutorySection: 'OHSA Construction Projects Regulation (O. Reg. 213/91)'
  },
  toxic_chemical_whmis: {
    label: 'Toxic Inhalation, Chemical Exposure & Missing WHMIS Labeling',
    statutorySection: 'OHSA Workplace Hazardous Materials Information System (O. Reg. 860)'
  },
  unguarded_machinery: {
    label: 'Unguarded Pinch-Points, Conveyor Belts & Missing Lockout/Tagout',
    statutorySection: 'OHSA Industrial Establishments Regulation (O. Reg. 851)'
  },
  workplace_violence: {
    label: 'Workplace Violence, Physical Threats & Harassment',
    statutorySection: 'OHSA Part III.0.1 (ss. 32.0.1 - 32.0.8)'
  },
  ergonomic_repetitive_strain: {
    label: 'Severe Ergonomic Strain & Unassisted Heavy Lifting',
    statutorySection: 'OHSA General Duty Clause s. 25(2)(h)'
  }
});

/**
 * Diagnostic assessment of occupational safety refusal rights, employer reprisal violations,
 * and WSIB / WorkSafeBC workers' compensation benefits and deadlines.
 */
export function evaluateWorkplaceSafetyAndRefusal({
  province = 'ON',
  isWorkplaceInjury = false,
  injuryDate = '2026-08-01',
  accidentReportedToEmployer = true,
  employerFiledInjuryReport = true,
  workerFiledClaimForm = false,
  netAverageMonthlyEarningsCad = 3200,
  hasUnsafeWorkConditions = true,
  hazardType = 'physical_fall_collapse',
  refusalStage = 'stage_1_internal', // 'none' | 'stage_1_internal' | 'stage_2_ministry'
  employerDisciplinedOrThreatened = false,
  immigrationStatusThreatened = false,
  workerName = 'Worker',
  employerName = 'Employer Inc.',
  assessmentDate = todayIso()
} = {}) {
  const prov = boundedText(province, 'ON', 10).toUpperCase();
  const isInjury = Boolean(isWorkplaceInjury);
  const assessDate = safeIsoDate(assessmentDate, todayIso());
  const iDate = safeIsoDate(injuryDate, '2026-08-01');
  const reportedToBoss = Boolean(accidentReportedToEmployer);
  const bossFiled = Boolean(employerFiledInjuryReport);
  const workerFiled = Boolean(workerFiledClaimForm);
  const netEarnings = Number.isFinite(Number(netAverageMonthlyEarningsCad)) ? Math.min(1000000, Math.max(0, Number(netAverageMonthlyEarningsCad))) : 0;

  const unsafe = Boolean(hasUnsafeWorkConditions);
  const hazardKey = boundedText(hazardType, 'physical_fall_collapse', 50).toLowerCase();
  const matchedHazard = HAZARD_TAXONOMY[hazardKey] || HAZARD_TAXONOMY.physical_fall_collapse;
  const stage = boundedText(refusalStage, 'none', 30).toLowerCase();
  const reprisalOccurred = Boolean(employerDisciplinedOrThreatened);
  const statusThreat = Boolean(immigrationStatusThreatened);

  const safeWorker = boundedText(workerName, 'Worker', 120);
  const safeEmployer = boundedText(employerName, 'Employer Inc.', 150);

  const rightsViolations = [];
  const legalProtections = [];
  const actionChecklist = [];

  // ==========================================
  // 1. Occupational Health & Safety Refusal Audit
  // ==========================================
  let refusalLegitimate = false;
  let stageDetails = {};

  if (unsafe) {
    refusalLegitimate = true;
    legalProtections.push(`STATUTORY RIGHT TO REFUSE (OHSA s. 43): A worker has the lawful right to refuse to perform work if they have reason to believe that equipment, physical condition, or workplace violence is likely to endanger themselves or another worker.`);

    if (stage === 'stage_1_internal') {
      stageDetails = {
        currentStage: 'Stage 1 — Internal Investigation',
        nextSteps: [
          'Worker must remain in a safe location at the workplace.',
          'Employer/supervisor must investigate immediately in the presence of the worker and a JHSC worker member or health & safety representative.',
          'Worker cannot be required to perform the refused work pending investigation outcome.'
        ]
      };
      actionChecklist.push({
        step: 'Request JHSC Worker Representative for Stage 1 Investigation',
        urgency: 'immediate',
        authority: 'OHSA s. 43(4)'
      });
    } else if (stage === 'stage_2_ministry') {
      stageDetails = {
        currentStage: 'Stage 2 — Ministry Inspector Investigation',
        nextSteps: [
          'Worker continues refusal having reasonable grounds to believe work remains hazardous.',
          'Employer or worker must notify the Ministry of Labour, Immigration, Training and Skills Development (MLITSD).',
          'A Ministry health and safety inspector must attend the workplace to investigate and issue written orders.',
          'Employer is strictly prohibited from reassigning the work to another worker without disclosing the refusal in the presence of a JHSC member (OHSA s. 43(11)).'
        ]
      };
      actionChecklist.push({
        step: 'Summon Ministry Health & Safety Inspector (Toll-Free: 1-877-202-0008)',
        urgency: 'immediate',
        authority: 'OHSA s. 43(7)-(10)'
      });
    }
  }

  // ==========================================
  // 2. Anti-Reprisal Violations (OHSA s. 50)
  // ==========================================
  let reprisalViolationDetected = false;
  if (reprisalOccurred) {
    reprisalViolationDetected = true;
    rightsViolations.push('UNLAWFUL REPRISAL (OHSA s. 50): Employer penalizing, disciplining, suspending, dismissing, or threatening a worker for exercising health and safety rights is strictly illegal.');
    legalProtections.push('REVERSE BURDEN OF PROOF (OHSA s. 50(5)): In an application before the Ontario Labour Relations Board (OLRB), the burden of proof is on the employer to prove that they did not act in retaliation for safety refusal.');
    actionChecklist.push({
      step: 'File Form A-53 Unlawful Reprisal Complaint with Ontario Labour Relations Board (OLRB)',
      urgency: 'immediate',
      authority: 'OHSA s. 50 / OLRB Rules'
    });
  }

  // ==========================================
  // 3. Immigrant / Undocumented Status Coercion
  // ==========================================
  if (statusThreat) {
    rightsViolations.push('CRIMINAL COERCION & PROHIBITED THREAT: Employer threatening deportation, immigration revocation, or contacting CBSA to intimidate an injured or safety-refusing worker constitutes unlawful reprisal and potential criminal intimidation/extortion under Criminal Code s. 346.');
    legalProtections.push('WSIB POLICY 12-04-10: Immigration status, lack of a valid work permit, or lack of a Social Insurance Number DOES NOT impact a worker’s statutory entitlement to WSIB healthcare and Loss of Earnings benefits.');
  }

  // ==========================================
  // 4. Workers' Compensation (WSIB / WorkSafeBC)
  // ==========================================
  let loeMonthlyCad = 0;
  let loePercentage = SAFETY_COMPENSATION_CONSTANTS.ONTARIO_WSIB_LOE_PERCENT_NET;
  let monthsSinceInjury = 0;
  let claimWithinLimitation = true;

  if (prov === 'BC') {
    loePercentage = SAFETY_COMPENSATION_CONSTANTS.BC_WORKSAFE_LOE_PERCENT_NET;
  }

  if (isInjury) {
    loeMonthlyCad = Math.round((netEarnings * (loePercentage / 100)) * 100) / 100;

    // Check 6-month filing window
    if (iDate && assessDate) {
      const iTime = new Date(iDate).getTime();
      const aTime = new Date(assessDate).getTime();
      if (!isNaN(iTime) && !isNaN(aTime)) {
        monthsSinceInjury = Math.max(0, Math.floor((aTime - iTime) / (1000 * 60 * 60 * 24 * 30.4375)));
        if (monthsSinceInjury > SAFETY_COMPENSATION_CONSTANTS.WSIB_CLAIM_LIMITATION_MONTHS) {
          claimWithinLimitation = false;
          rightsViolations.push(`STATUTORY DEADLINE WARNING: Injury occurred ${monthsSinceInjury} months ago. WSIA s. 22 requires claims to be filed within 6 months. Late filing requires application for discretionary extension based on reasonable grounds.`);
        }
      }
    }

    if (!reportedToBoss) {
      actionChecklist.push({
        step: 'Report workplace accident to employer supervisor immediately in writing',
        urgency: 'immediate',
        authority: 'WSIA s. 22(1)'
      });
    }

    if (!bossFiled) {
      rightsViolations.push('EMPLOYER NON-COMPLIANCE: Employer failed to submit Form 7 injury report within 3 calendar days of notification (WSIA s. 21). Employer is subject to WSIB late-filing administrative penalties.');
    }

    if (!workerFiled) {
      actionChecklist.push({
        step: `Submit WSIB Form 6 (Worker's Report of Injury) within statutory 6-month limit`,
        urgency: 'immediate',
        authority: 'WSIA s. 22'
      });
    }

    legalProtections.push(`LOSS OF EARNINGS (LOE): Entitled to ${loePercentage}% of net average earnings (estimated $${loeMonthlyCad} CAD/month) plus full medical rehabilitation coverage under WSIA s. 43.`);
  }

  return {
    workerName: safeWorker,
    employerName: safeEmployer,
    province: prov,
    assessmentDate: assessDate,
    safetyRefusalAudit: {
      hasUnsafeConditions: unsafe,
      hazardIdentified: matchedHazard.label,
      statutorySection: matchedHazard.statutorySection,
      refusalLegitimate,
      refusalStage: stage,
      stageDetails
    },
    reprisalAudit: {
      reprisalViolationDetected,
      statusThreatReported: statusThreat,
      reverseBurdenApplies: reprisalOccurred,
      olrbComplaintEligible: reprisalOccurred
    },
    compensationAudit: {
      isWorkplaceInjury: isInjury,
      injuryDate: iDate,
      monthsSinceInjury,
      claimWithinLimitation,
      estimatedMonthlyLoeCad: loeMonthlyCad,
      loePercentageNet: loePercentage,
      undocumentedWorkerProtected: true
    },
    rightsViolations,
    legalProtections,
    actionChecklist
  };
}

/**
 * Generates a formal statutory Notice of Work Refusal & Hazard Notification under OHSA s. 43.
 */
export function generateWorkRefusalNotice({
  workerName = 'Worker',
  employerName = 'Employer Inc.',
  hazardDescription = 'Unguarded machine with risk of entanglement',
  refusalStage = 'stage_1_internal',
  noticeDate = '2026-10-31'
} = {}) {
  const wName = boundedText(workerName, 'Worker', 120);
  const eName = boundedText(employerName, 'Employer Inc.', 150);
  const hazard = boundedText(hazardDescription, 'Unsafe condition', 300);
  const date = safeIsoDate(noticeDate, '2026-10-31');

  return [
    '================================================================================',
    'FORMAL STATUTORY NOTICE OF WORK REFUSAL (OHSA s. 43)',
    `To: Management & Health & Safety Representative, ${eName}`,
    `From: ${wName} | Date: ${date}`,
    '================================================================================',
    '',
    '1. NOTICE OF WORK REFUSAL UNDER THE OCCUPATIONAL HEALTH AND SAFETY ACT:',
    `   Pursuant to Section 43 of the Ontario Occupational Health and Safety Act (R.S.O. 1990, c. O.1),`,
    `   I hereby notify you that I am refusing to perform the designated work assignment based on`,
    `   reasonable cause to believe that the following condition is likely to endanger myself or another worker:`,
    '',
    `   HAZARD DESCRIPTION: ${hazard}`,
    '',
    '2. STATUTORY INVESTIGATION OBLIGATION:',
    '   - Section 43(4) mandates that you forthwith investigate the refusal in my presence and in the',
    '     presence of the designated Joint Health and Safety Committee (JHSC) worker member.',
    '   - Pending completion of the investigation, I shall remain in a safe location in the workplace.',
    '',
    '3. PROHIBITION ON REASSIGNMENT & REPRISAL:',
    '   - Section 43(11) strictly prohibits assigning this refused work to another worker without informing',
    '     them of this refusal in the presence of a worker JHSC representative.',
    '   - Section 50 strictly prohibits any disciplinary action, penalty, suspension, or intimidation in',
    '     reprisal for exercising rights under the Act. Any reprisal will be filed with the OLRB.',
    '================================================================================'
  ].join('\n');
}
