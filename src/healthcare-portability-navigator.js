/**
 * Provincial Healthcare Waiting Periods, Interprovincial Portability & Interim Federal Health Program (IFHP) Engine
 * 
 * Statutory & Jurisdictional Authorities:
 * - Canada Health Act, R.S.C. 1985, c. C-6:
 *   - s. 11 (Portability Criterion: originating province covers interprovincial movers during waiting period)
 * - Ontario Health Insurance Act, R.S.O. 1990, c. H.6:
 *   - O. Reg. 107/20 (Permanent elimination of the historic 3-month OHIP waiting period)
 *   - Regulation 552 ss. 1.1-1.4 (Eligible residents: Citizens, PRs, Closed WP >= 6 mos, Open WP with 6-month full-time employer letter)
 * - British Columbia Medicare Protection Act, R.S.B.C. 1996, c. 286:
 *   - Medical Services Commission Regulation s. 7 (Statutory waiting period: remainder of arrival month + 2 consecutive calendar months)
 * - Quebec Health Insurance Act, CQLR c. A-29 (RAMQ):
 *   - s. 5 & Regulation respecting eligibility and registration (3-month waiting period / délai de carence)
 * - Interim Federal Health Program (IFHP) Order in Council P.C. 2012-433 / IRCC Policy:
 *   - Coverage for refugee claimants, protected persons, and victims of human trafficking via Medavie Blue Cross
 */

import { boundedText, safeIsoDate } from './text-input.js';

export const HEALTHCARE_CONSTANTS = Object.freeze({
  ONTARIO_WAITING_PERIOD_DAYS: 0,
  BC_WAITING_MONTHS_ADDITIONAL: 2,
  QUEBEC_WAITING_MONTHS: 3,
  CHA_PORTABILITY_MAX_MONTHS: 3,
  MIN_WORK_PERMIT_MONTHS: 6
});

export const PROVINCIAL_HEALTHCARE_SCHEMES = Object.freeze({
  ON: {
    provinceCode: 'ON',
    schemeName: 'Ontario Health Insurance Plan (OHIP)',
    governingAct: 'Ontario Health Insurance Act & O. Reg. 107/20',
    waitingPeriodDays: 0,
    hasWaitingPeriod: false,
    openWorkPermitEligibleWithJobLetter: true,
    internationalStudentsCovered: false // Ontario students rely on UHIP
  },
  BC: {
    provinceCode: 'BC',
    schemeName: 'BC Medical Services Plan (MSP)',
    governingAct: 'BC Medicare Protection Act & MSC Reg s. 7',
    waitingPeriodDays: 60, // variable: remainder of month + 2 months
    hasWaitingPeriod: true,
    openWorkPermitEligibleWithJobLetter: true,
    internationalStudentsCovered: true // Covered after waiting period ($75/mo fee)
  },
  AB: {
    provinceCode: 'AB',
    schemeName: 'Alberta Health Care Insurance Plan (AHCIP)',
    governingAct: 'Alberta Health Care Insurance Act',
    waitingPeriodDays: 0,
    hasWaitingPeriod: false, // immediate from abroad; 1st day of 3rd month interprovincial covered by originating prov
    openWorkPermitEligibleWithJobLetter: true,
    internationalStudentsCovered: true
  },
  QC: {
    provinceCode: 'QC',
    schemeName: 'Régie de l’assurance maladie du Québec (RAMQ)',
    governingAct: 'Loi sur l’assurance maladie du Québec (CQLR c. A-29)',
    waitingPeriodDays: 90,
    hasWaitingPeriod: true,
    openWorkPermitEligibleWithJobLetter: false, // strict RAMQ criteria
    internationalStudentsCovered: false // private university plans
  }
});

/**
 * Diagnostic evaluation of healthcare registration, statutory waiting periods,
 * interprovincial portability rights, and IFHP refugee coverage.
 */
export function evaluateHealthcarePortabilityAndIfhp(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    targetProvince = 'ON',
    originType = 'outside_canada', // 'outside_canada' | 'another_province'
    originProvince = null,
    immigrationStatus = 'closed_work_permit',
    arrivalDate = '2026-09-15',
    workPermitDurationMonths = 12,
    hasFullTimeEmployerJobLetter6Months = true,
    isRefugeeClaimantWithIfhpCertificate = false,
    applicantName = 'Newcomer',
    assessmentDate = '2026-10-31'
  } = safeParams;
  const provKey = boundedText(targetProvince, 'ON', 10).toUpperCase();
  const scheme = PROVINCIAL_HEALTHCARE_SCHEMES[provKey] || PROVINCIAL_HEALTHCARE_SCHEMES.ON;
  const isInterprovincial = boundedText(originType, 'outside_canada', 30).toLowerCase() === 'another_province';
  const originProv = originProvince ? boundedText(originProvince, '', 10).toUpperCase() : null;
  const status = boundedText(immigrationStatus, 'closed_work_permit', 40).toLowerCase();
  const arrDate = safeIsoDate(arrivalDate, '2026-09-15');
  const wpMonths = Math.max(0, Math.min(120, Math.floor(Number(workPermitDurationMonths) || 0)));
  const jobLetter6Mo = Boolean(hasFullTimeEmployerJobLetter6Months);
  const isRefugee = Boolean(isRefugeeClaimantWithIfhpCertificate);

  const safeApplicant = boundedText(applicantName, 'Newcomer', 120);
  const assessDate = safeIsoDate(assessmentDate, '2026-10-31');

  const notes = [];
  const riskWarnings = [];
  const requiredDocuments = [];

  // 1. Refugee Claimant / IFHP Exemption
  if (isRefugee || status === 'refugee_claimant') {
    return {
      applicantName: safeApplicant,
      assessmentDate: assessDate,
      targetProvince: provKey,
      schemeName: 'Interim Federal Health Program (IFHP)',
      eligibleForProvincialHealthcare: false,
      ifhpActive: true,
      coverageType: 'Federal Medavie Blue Cross (IFHP Certificate)',
      coverageStartDate: arrDate,
      waitingPeriodDays: 0,
      needsPrivateBridgingInsurance: false,
      notes: [
        'REFUGEE CLAIMANT IFHP COVERAGE: Under Federal Order in Council P.C. 2012-433, refugee claimants and protected persons are covered by the Interim Federal Health Program (IFHP) administered via Medavie Blue Cross.',
        'Covers hospital, physician, diagnostic, supplemental (dental/vision), and prescription drug benefits until eligibility for provincial coverage is established.',
        'Does not require provincial health card registration until refugee claim is accepted (Notice of Decision) or PR is granted.'
      ],
      riskWarnings: [],
      requiredDocuments: [
        'Refugee Protection Claimant Document (RPCD) / IMM 1442',
        'IFHP Certificate of Eligibility (Medavie Blue Cross account number)',
        'Government-issued photo identification'
      ]
    };
  }

  // 2. Immigration Category Eligibility Audit
  let statusEligible = false;

  if (['citizen', 'permanent_resident', 'protected_person'].includes(status)) {
    statusEligible = true;
    requiredDocuments.push('Proof of Status (Canadian Passport, PR Card, or Confirmation of Permanent Residence IMM 5292/5688)');
  } else if (status === 'closed_work_permit') {
    if (wpMonths >= HEALTHCARE_CONSTANTS.MIN_WORK_PERMIT_MONTHS) {
      statusEligible = true;
      requiredDocuments.push('Valid Closed Work Permit showing at least 6 months validity');
      requiredDocuments.push('Formal employer letter confirming full-time employment');
    } else {
      statusEligible = false;
      riskWarnings.push(`INELIGIBLE WORK PERMIT DURATION: Work permit duration of ${wpMonths} months is below the statutory 6-month threshold required under provincial health regulations.`);
    }
  } else if (status === 'open_work_permit') {
    if (wpMonths >= HEALTHCARE_CONSTANTS.MIN_WORK_PERMIT_MONTHS && jobLetter6Mo) {
      statusEligible = true;
      requiredDocuments.push('Valid Open Work Permit (PGWP / BOWP / Spousal Open Work Permit)');
      requiredDocuments.push('Employer Letter confirming permanent or minimum 6-month full-time employment in the province with start date');
    } else {
      statusEligible = false;
      riskWarnings.push('CRITICAL REQUIREMENT: Open work permit holders (PGWP/SOWP) are NOT automatically eligible for provincial healthcare without a formal employer letter confirming full-time employment for at least 6 months.');
    }
  } else if (status === 'international_student') {
    if (scheme.internationalStudentsCovered) {
      statusEligible = true;
      requiredDocuments.push('Valid Study Permit (valid for >= 6 months)');
      requiredDocuments.push('Proof of continuous full-time post-secondary enrollment');
      notes.push(`International students are covered under ${scheme.schemeName} subject to standard monthly healthcare premiums ($75/month in BC).`);
    } else {
      statusEligible = false;
      riskWarnings.push(`INTERNATIONAL STUDENTS EXCLUDED: International students in ${provKey} are not eligible for provincial public health coverage and must enroll in mandatory institutional health plans (e.g. UHIP in Ontario).`);
    }
  } else if (status === 'visitor') {
    statusEligible = false;
    riskWarnings.push('VISITORS INELIGIBLE: Visitors and tourists on TRVs or eTAs cannot enroll in provincial public healthcare and must obtain private comprehensive travel/medical insurance.');
  }

  // 3. Waiting Period Calculation
  let coverageStartDate = arrDate;
  let waitingPeriodDays = 0;
  let needsBridgingInsurance = false;

  if (provKey === 'ON') {
    // Ontario: Waiting period permanently eliminated (O. Reg. 107/20)
    waitingPeriodDays = 0;
    coverageStartDate = arrDate;
    notes.push('NO WAITING PERIOD IN ONTARIO: The historic 3-month OHIP waiting period was permanently eliminated under O. Reg. 107/20. Coverage is effective immediately from the date residency and eligibility are established.');
  } else if (provKey === 'BC') {
    // BC: Remainder of the month + 2 consecutive calendar months
    if (arrDate) {
      const parts = arrDate.split('-');
      if (parts.length >= 3) {
        let yr = parseInt(parts[0], 10);
        let mo = parseInt(parts[1], 10); // 1-12
        // Remainder of month (mo) + 2 months (mo+1, mo+2) -> effective 1st of mo+3
        let targetMo = mo + 3;
        let targetYr = yr;
        while (targetMo > 12) {
          targetMo -= 12;
          targetYr += 1;
        }
        coverageStartDate = `${targetYr}-${String(targetMo).padStart(2, '0')}-01`;
        
        const arrTime = new Date(`${arrDate}T00:00:00Z`).getTime();
        const effTime = new Date(`${coverageStartDate}T00:00:00Z`).getTime();
        waitingPeriodDays = Math.max(0, Math.floor((effTime - arrTime) / (1000 * 60 * 60 * 24)));
        needsBridgingInsurance = !isInterprovincial;
        notes.push(`BC MSP WAITING PERIOD: Coverage takes effect on ${coverageStartDate} (remainder of arrival month plus 2 full calendar months, approximately ${waitingPeriodDays} gap days).`);
      }
    }
  } else if (provKey === 'QC') {
    // Quebec: Up to 3 calendar months
    if (arrDate) {
      const parts = arrDate.split('-');
      if (parts.length >= 3) {
        let yr = parseInt(parts[0], 10);
        let mo = parseInt(parts[1], 10);
        let day = parseInt(parts[2], 10);
        let targetMo = mo + 3;
        let targetYr = yr;
        while (targetMo > 12) {
          targetMo -= 12;
          targetYr += 1;
        }
        coverageStartDate = `${targetYr}-${String(targetMo).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        waitingPeriodDays = 90;
        needsBridgingInsurance = !isInterprovincial;
        notes.push(`QUEBEC RAMQ WAITING PERIOD: Standard 3-month statutory waiting period applies until ${coverageStartDate}.`);
      }
    }
  }

  // 4. Interprovincial Portability Protection (Canada Health Act s. 11)
  let interprovincialPortabilityActive = false;
  if (isInterprovincial && originProv) {
    interprovincialPortabilityActive = true;
    needsBridgingInsurance = false;
    notes.push(`CANADA HEALTH ACT PORTABILITY (s. 11): During your waiting period in ${provKey}, your originating province (${originProv}) remains statutorily required to cover your insured medical expenses for up to 3 months.`);
  }

  // Common required documents
  requiredDocuments.push('Proof of Provincial Residency (Residential Lease Agreement, Utility Bill, or Driver’s Licence)');
  requiredDocuments.push('Registration Application Form (e.g. Ontario Form 0265-82 Registration for Ontario Health Coverage)');

  return {
    applicantName: safeApplicant,
    assessmentDate: assessDate,
    targetProvince: provKey,
    schemeName: scheme.schemeName,
    eligibleForProvincialHealthcare: statusEligible,
    immigrationStatusEvaluated: status,
    coverageStartDate,
    waitingPeriodDays,
    needsPrivateBridgingInsurance: needsBridgingInsurance && statusEligible,
    interprovincialPortabilityActive,
    notes,
    riskWarnings,
    requiredDocuments
  };
}

/**
 * Generates an executive healthcare enrollment checklist and bridging action plan.
 */
export function generateHealthcareRegistrationGuide({
  applicantName = 'Newcomer',
  province = 'ON',
  schemeName = 'Ontario Health Insurance Plan (OHIP)',
  needsBridgingInsurance = false,
  coverageStartDate = '2026-09-15'
} = {}) {
  const name = String(applicantName || 'Newcomer').trim();
  const prov = String(province || 'ON').trim().toUpperCase();
  const scheme = String(schemeName || 'Provincial Healthcare').trim();
  const bridging = Boolean(needsBridgingInsurance);
  const start = String(coverageStartDate || 'Immediate').trim();

  return [
    '================================================================================',
    'PROVINCIAL HEALTHCARE REGISTRATION & BRIDGING COVERAGE GUIDE',
    `Applicant: ${name} | Province: ${prov} | Scheme: ${scheme}`,
    '================================================================================',
    '',
    '1. COVERAGE COMMENCEMENT & BRIDGING ASSESSMENT:',
    `   - Estimated Coverage Effective Date: ${start}`,
    bridging
      ? '   - [MANDATORY ACTION] Private bridging medical insurance required during statutory waiting gap.'
      : '   - [PASS] Immediate coverage or interprovincial portability protection active.',
    '',
    '2. REGISTRATION APPOINTMENT CHECKLIST (BRING 3 ORIGINAL PIECES):',
    '   [ ] Primary Identity Document: Passport, Permanent Resident Card, or Canadian Citizenship Certificate.',
    '   [ ] Valid Legal Status Document: Work Permit (with 6+ month employer letter) or Study Permit.',
    '   [ ] Proof of Provincial Residency: Formal residential tenancy lease, utility bill, or bank statement.',
    '',
    '3. IMPORTANT SUBMISSION NOTICE:',
    '   - Present documents in person at the local provincial registry office (e.g. ServiceOntario / Health BC).',
    '   - Keep your temporary confirmation receipt as interim proof of coverage while plastic card is mailed.',
    '================================================================================'
  ].join('\n');
}
