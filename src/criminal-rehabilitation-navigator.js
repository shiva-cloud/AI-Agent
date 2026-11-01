/**
 * Canadian Criminal Inadmissibility, Rehabilitation & Record Suspension Engine
 * 
 * Statutory & Jurisdictional Authorities:
 * - Immigration and Refugee Protection Act (IRPA), S.C. 2001, c. 27:
 *   - s. 36(1) (Serious Criminality: foreign equivalent punishable by >= 10 years imprisonment)
 *   - s. 36(2) (Criminality: foreign equivalent punishable by way of indictment or 2 summary convictions)
 *   - s. 36(3)(c) (Deemed Rehabilitation: strictly limited to s. 36(2) non-serious after 10 years)
 *   - s. 24 (Temporary Resident Permit / TRP for urgent or justified entry when inadmissible)
 * - Immigration and Refugee Protection Regulations (IRPR), SOR/2002-227:
 *   - ss. 17-18 (Individual Criminal Rehabilitation after 5 years from sentence completion; IMM 1444)
 *   - Fees: $200 CAD for non-serious criminality; $1,000 CAD for serious criminality
 * - Criminal Code of Canada (R.S.C. 1985, c. C-46) & Bill C-46 (Effective Dec 18, 2018):
 *   - Impaired driving / DUI modernized to maximum 10 years imprisonment, reclassifying all foreign DUIs as Serious Criminality
 * - Criminal Records Act (CRA), R.S.C. 1985, c. C-47 (Parole Board of Canada record suspensions)
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const REHAB_CONSTANTS = Object.freeze({
  DEEMED_REHAB_YEARS_REQUIRED: 10,
  INDIVIDUAL_REHAB_YEARS_REQUIRED: 5,
  BILL_C46_DUI_EFFECTIVE_DATE: '2018-12-18',
  FEE_NON_SERIOUS_REHAB_CAD: 200.0,
  FEE_SERIOUS_REHAB_CAD: 1000.0,
  MAX_DAYS_IN_YEAR: 365.25
});

export const OFFENSE_EQUIVALENCY_TAXONOMY = Object.freeze({
  impaired_driving_dui: {
    label: 'Impaired Driving / Driving Under the Influence (DUI / DWI)',
    canadianCodeSection: 'Criminal Code s. 320.14(1)',
    severityCategory: 'serious_criminality_s36_1',
    maxCanadianPenaltyYears: 10,
    deemedRehabPermitted: false,
    notes: 'Under Bill C-46 (Dec 18, 2018), impaired driving is punishable by up to 10 years imprisonment in Canada. Consequently, foreign DUIs (even US state misdemeanors) are permanently classified as Serious Criminality under IRPA s. 36(1) and CANNOT qualify for Deemed Rehabilitation.'
  },
  theft_under_5000: {
    label: 'Theft Under $5,000 / Shoplifting',
    canadianCodeSection: 'Criminal Code s. 334(b)',
    severityCategory: 'criminality_s36_2',
    maxCanadianPenaltyYears: 2,
    deemedRehabPermitted: true,
    notes: 'Classified as non-serious criminality under IRPA s. 36(2). Eligible for Deemed Rehabilitation if 10 years have elapsed since sentence completion with a single conviction.'
  },
  assault_simple: {
    label: 'Simple Assault / Domestic Incident (No Weapon/Bodily Harm)',
    canadianCodeSection: 'Criminal Code s. 266',
    severityCategory: 'criminality_s36_2',
    maxCanadianPenaltyYears: 5,
    deemedRehabPermitted: true,
    notes: 'Hybrid offense punishable by up to 5 years. Eligible for Deemed Rehabilitation after 10 years if non-serious.'
  },
  fraud_over_5000: {
    label: 'Major Fraud Over $5,000 / Wire Fraud',
    canadianCodeSection: 'Criminal Code s. 380(1)(a)',
    severityCategory: 'serious_criminality_s36_1',
    maxCanadianPenaltyYears: 14,
    deemedRehabPermitted: false,
    notes: 'Serious criminality under IRPA s. 36(1). Deemed rehabilitation is statutorily unavailable.'
  },
  controlled_substance_possession: {
    label: 'Personal Possession of Small Quantity of Controlled Substance',
    canadianCodeSection: 'CDSA s. 4(1)',
    severityCategory: 'criminality_s36_2',
    maxCanadianPenaltyYears: 3,
    deemedRehabPermitted: true,
    notes: 'Non-serious criminality unless trafficking or production is involved.'
  }
});

/**
 * Diagnostic evaluation of criminal inadmissibility under IRPA s. 36, foreign conviction equivalency,
 * Deemed Rehabilitation vs Individual Rehabilitation (IMM 1444), and TRP requirements.
 */
export function evaluateCriminalInadmissibilityAndRehab(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    offenseType = 'impaired_driving_dui',
    sentenceCompletionDate = '2017-06-01',
    foreignCountry = 'US',
    convictionCount = 1,
    urgentTravelRequired = false,
    applicantName = 'Applicant',
    assessmentDate = '2026-10-31'
  } = safeParams;
  const offKey = boundedText(offenseType, 'impaired_driving_dui', 60).toLowerCase();
  const matchedOffense = OFFENSE_EQUIVALENCY_TAXONOMY[offKey] || OFFENSE_EQUIVALENCY_TAXONOMY.impaired_driving_dui;
  const compDate = safeIsoDate(sentenceCompletionDate, '2017-06-01');
  const country = boundedText(foreignCountry, 'US', 50).toUpperCase();
  const count = Number.isFinite(Number(convictionCount)) ? Math.max(1, Math.min(50, Math.floor(Number(convictionCount)))) : 1;
  const urgent = Boolean(urgentTravelRequired);
  const assessDate = safeIsoDate(assessmentDate, '2026-10-31');

  const safeApplicant = boundedText(applicantName, 'Applicant', 100);

  const statutoryNotes = [];
  const riskWarnings = [];
  const documentChecklist = [];

  // 1. Calculate Elapsed Years Since Sentence Completion
  let yearsElapsed = 0;
  if (compDate && assessDate) {
    const cTime = new Date(compDate).getTime();
    const aTime = new Date(assessDate).getTime();
    if (!isNaN(cTime) && !isNaN(aTime)) {
      yearsElapsed = Math.max(0, Math.floor((aTime - cTime) / (1000 * 60 * 60 * 24 * REHAB_CONSTANTS.MAX_DAYS_IN_YEAR)));
    }
  }

  // 2. Equivalency & Severity Determination
  const isSerious = matchedOffense.severityCategory === 'serious_criminality_s36_1';
  statutoryNotes.push(`CANADIAN EQUIVALENCY: Foreign offense equates to ${matchedOffense.canadianCodeSection} (Maximum Canadian penalty: ${matchedOffense.maxCanadianPenaltyYears} years).`);
  statutoryNotes.push(matchedOffense.notes);

  let deemedRehabEligible = false;
  let individualRehabEligible = false;
  let trpMandatory = false;
  let rehabFeeCad = isSerious ? REHAB_CONSTANTS.FEE_SERIOUS_REHAB_CAD : REHAB_CONSTANTS.FEE_NON_SERIOUS_REHAB_CAD;

  // 3. Deemed Rehabilitation Audit (IRPA s. 36(3)(c))
  if (isSerious) {
    deemedRehabEligible = false;
    riskWarnings.push('DEEMED REHABILITATION BARRED: Under IRPA s. 36(3)(c), deemed rehabilitation is strictly forbidden for offenses classified as Serious Criminality (punishable by 10+ years). Time alone will never cure inadmissibility; an affirmative application for Criminal Rehabilitation or a TRP is mandatory.');
  } else if (count > 1) {
    deemedRehabEligible = false;
    riskWarnings.push('MULTIPLE CONVICTIONS: Deemed rehabilitation requires a single non-serious conviction. Having multiple convictions necessitates an affirmative Individual Rehabilitation application.');
  } else if (yearsElapsed >= REHAB_CONSTANTS.DEEMED_REHAB_YEARS_REQUIRED) {
    deemedRehabEligible = true;
    statutoryNotes.push(`DEEMED REHABILITATED (IRPA s. 36(3)(c)): More than 10 years have elapsed since completion of sentence for a single non-serious conviction. Inadmissibility is deemed resolved by passage of time. Bring court disposition and police clearance to the Port of Entry.`);
  }

  // 4. Individual Criminal Rehabilitation Audit (IRPR ss. 17-18)
  if (!deemedRehabEligible) {
    if (yearsElapsed >= REHAB_CONSTANTS.INDIVIDUAL_REHAB_YEARS_REQUIRED) {
      individualRehabEligible = true;
      statutoryNotes.push(`INDIVIDUAL REHABILITATION ELIGIBLE: More than 5 years have elapsed since completion of sentence (${yearsElapsed} years). Eligible to submit formal application for Criminal Rehabilitation via Form IMM 1444.`);
    } else {
      individualRehabEligible = false;
      trpMandatory = true;
      riskWarnings.push(`TOO EARLY FOR REHABILITATION: Only ${yearsElapsed} years have elapsed since sentence completion. A minimum of 5 full years must pass before an Individual Criminal Rehabilitation application can be lodged.`);
    }
  }

  // 5. Temporary Resident Permit (TRP - IRPA s. 24)
  if (trpMandatory || urgent) {
    statutoryNotes.push('TEMPORARY RESIDENT PERMIT (TRP - IRPA s. 24): For travel prior to the 5-year mark or while rehabilitation is pending, an application for a TRP is required. The applicant must demonstrate that their entry to Canada is justified by compelling personal, business, or humanitarian reasons.');
    documentChecklist.push('Detailed Letter of Explanation showing compelling reasons for travel to Canada (business necessity, family emergency)');
  }

  // Common documentation checklist
  documentChecklist.push('Official Court Disposition Documents (indictment, judgment, sentence order)');
  documentChecklist.push('Proof of Sentence Completion (fine payment receipt, probation discharge order, community service completion)');
  documentChecklist.push(`State/Federal Police Clearances from ${country} (e.g. FBI Identity History Summary check and State Police check)`);
  documentChecklist.push('Copy of Relevant Foreign Criminal Statute at the time the offense was committed');
  if (individualRehabEligible) {
    documentChecklist.push(`Application for Criminal Rehabilitation (Form IMM 1444) with $${rehabFeeCad} CAD government processing fee`);
    documentChecklist.push('Three (3) Character Reference Letters from employers, mentors, or community leaders');
  }

  return {
    applicantName: safeApplicant,
    assessmentDate: assessDate,
    offenseEvaluated: matchedOffense.label,
    canadianCodeSection: matchedOffense.canadianCodeSection,
    severityCategory: isSerious ? 'Serious Criminality (IRPA s. 36(1))' : 'Criminality (IRPA s. 36(2))',
    yearsSinceSentenceCompletion: yearsElapsed,
    sentenceCompletionDate: compDate,
    rehabPathways: {
      isDeemedRehabilitated: deemedRehabEligible,
      isEligibleForIndividualRehabilitation: individualRehabEligible,
      requiresTrpForEntry: trpMandatory || (urgent && !deemedRehabEligible),
      governmentRehabFeeCad: rehabFeeCad
    },
    statutoryNotes,
    riskWarnings,
    documentChecklist
  };
}

/**
 * Generates an executive Criminal Inadmissibility Legal Submission & Rehabilitation Plan.
 */
export function generateRehabilitationActionPlan(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    applicantName = 'Applicant',
    offenseName = 'Impaired Driving (DUI)',
    isDeemedRehabilitated = false,
    isEligibleForIndividualRehab = true,
    feeCad = 1000
  } = safeParams;
  const name = boundedText(applicantName, 'Applicant', 100);
  const offense = boundedText(offenseName, 'Offense', 100);
  const fee = Number.isFinite(Number(feeCad)) ? Math.max(0, Math.min(1000000, Number(feeCad))) : 1000;

  return [
    '================================================================================',
    'CRIMINAL INADMISSIBILITY & REHABILITATION SUBMISSION PLAN',
    `Applicant: ${name} | Offense: ${offense} | Legal Authority: IRPA s. 36`,
    '================================================================================',
    '',
    '1. LEGAL INADMISSIBILITY DETERMINATION:',
    isDeemedRehabilitated
      ? '   [DEEMED REHABILITATED] Inadmissibility resolved under IRPA s. 36(3)(c) (>= 10 years).'
      : isEligibleForIndividualRehab
        ? `   [INDIVIDUAL REHABILITATION REQUIRED] Eligible under IRPR ss. 17-18 ($${fee} CAD fee).`
        : '   [TRP REQUIRED] Under 5 years elapsed. Must apply for Temporary Resident Permit (IRPA s. 24).',
    '',
    '2. MANDATORY DOSSIER COMPONENTS:',
    '   [ ] Form IMM 1444 (Application for Criminal Rehabilitation).',
    '   [ ] Certified Court Records with judge signature and seal.',
    '   [ ] Official proof of full sentence completion (probation release, restitution receipts).',
    '   [ ] National Police Certificates (FBI Criminal Record Check + State Police clearance).',
    '',
    '3. PORT OF ENTRY (POE) PRECAUTIONS:',
    '   - Do not attempt to cross into Canada without formal rehabilitation approval or active TRP.',
    '   - Border officers have direct access to NCIC / FBI databases under bilateral information sharing.',
    '================================================================================'
  ].join('\n');
}
