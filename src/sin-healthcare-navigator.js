// src/sin-healthcare-navigator.js
// First 14-Day Government Enrollment Kit (SIN, Provincial Healthcare & Photo ID)
// Based on DESDA s. 28.1, Health Insurance Acts (ON, BC, AB), and Provincial ID Statutes.

import { boundedText, safeIsoDate } from './text-input.js';

export function evaluateGovernmentEnrollment({
  applicantName = 'Newcomer',
  statusInCanada = 'work_permit', // 'pr_copr', 'work_permit', 'study_permit', 'visitor', 'refugee_claimant'
  province = 'ON',
  studyPermitHasWorkCondition = true, // IRPR s. 186(v)
  workPermitMinDurationMonths = 12,
  residencyDocumentsReady = true, // Lease, utility bill, bank statement
  assessmentDate = '2026-10-31'
} = {}) {
  const safeAssessmentDate = safeIsoDate(assessmentDate, '2026-10-31');
  const cleanApplicant = boundedText(applicantName, 'Newcomer', 100);
  const cleanStatus = boundedText(statusInCanada, 'work_permit', 50);
  const cleanProvince = boundedText(province, 'ON', 10).toUpperCase();
  const permitDuration = Math.max(0, Math.min(120, Number(workPermitMinDurationMonths) || 0));
  // 1. SIN Evaluation (DESDA s. 28.1)
  let sinEligible = false;
  let sinType = 'standard_permanent';
  let sinPrimaryDocument = '';
  let sinGuidance = '';

  if (cleanStatus === 'pr_copr') {
    sinEligible = true;
    sinType = 'standard_permanent';
    sinPrimaryDocument = 'Confirmation of Permanent Residence (COPR) with travel document or PR Card.';
    sinGuidance = 'Eligible for regular permanent SIN. Issued instantly at Service Canada Centre or within 5 business days online.';
  } else if (cleanStatus === 'work_permit') {
    sinEligible = true;
    sinType = 'temporary_9_series';
    sinPrimaryDocument = 'Valid Work Permit issued by IRCC.';
    sinGuidance = 'Eligible for 900-series temporary SIN valid until work permit expiry. Apply online or in-person with original permit.';
  } else if (cleanStatus === 'study_permit') {
    if (studyPermitHasWorkCondition) {
      sinEligible = true;
      sinType = 'temporary_9_series';
      sinPrimaryDocument = 'Valid Study Permit indicating authorization to work on/off-campus under IRPR s. 186(v).';
      sinGuidance = 'Eligible for 900-series temporary SIN. Must show condition allowing work on campus or 20/24h off campus.';
    } else {
      sinEligible = false;
      sinType = 'ineligible';
      sinPrimaryDocument = 'Study Permit (No Work Condition)';
      sinGuidance = 'Ineligible for SIN until study permit condition is amended by IRCC to authorize on/off-campus work.';
    }
  } else if (cleanStatus === 'refugee_claimant') {
    sinEligible = true;
    sinType = 'temporary_9_series';
    sinPrimaryDocument = 'Refugee Protection Claimant Document (RPCD) + valid Work Permit.';
    sinGuidance = 'Eligible for 900-series temporary SIN for employment purposes.';
  } else {
    sinEligible = false;
    sinType = 'ineligible';
    sinPrimaryDocument = 'Visitor Record / Passport';
    sinGuidance = 'Visitors without work or tax filing authorization are ineligible for a SIN.';
  }

  // 2. Healthcare Coverage Evaluation
  let healthPlanName = 'Provincial Plan';
  let healthEligible = false;
  let waitingPeriodDays = 0;
  let healthNotes = '';

  if (cleanProvince === 'ON') {
    healthPlanName = 'Ontario Health Insurance Plan (OHIP)';
    if (cleanStatus === 'pr_copr') {
      healthEligible = true;
      waitingPeriodDays = 0;
      healthNotes = 'Immediate OHIP coverage upon landing. The former 3-month waiting period was permanently eliminated in Ontario.';
    } else if (cleanStatus === 'work_permit') {
      if (permitDuration >= 6) {
        healthEligible = true;
        waitingPeriodDays = 0;
        healthNotes = 'OHIP eligible with full-time employment verification letter confirming min 6 months of employment in Ontario.';
      } else {
        healthEligible = false;
        healthNotes = 'Work permit under 6 months is ineligible for OHIP. Private insurance required.';
      }
    } else if (cleanStatus === 'study_permit') {
      healthEligible = false;
      healthNotes = 'International students are not covered by OHIP. Mandatory enrollment in university UHIP or college private plan.';
    }
  } else if (cleanProvince === 'BC') {
    healthPlanName = 'BC Medical Services Plan (MSP)';
    if (['pr_copr', 'work_permit'].includes(cleanStatus)) {
      healthEligible = true;
      waitingPeriodDays = 60; // 2 calendar months + remaining days of arrival month
      healthNotes = 'Waiting period applies: balance of arrival month plus 2 full consecutive calendar months. Private bridge insurance mandatory during wait.';
    } else if (cleanStatus === 'study_permit') {
      healthEligible = true;
      waitingPeriodDays = 60;
      healthNotes = 'Eligible for MSP subject to waiting period + mandatory $75/month international student health surcharge.';
    }
  } else if (cleanProvince === 'AB') {
    healthPlanName = 'Alberta Health Care Insurance Plan (AHCIP)';
    healthEligible = ['pr_copr', 'work_permit'].includes(cleanStatus);
    waitingPeriodDays = 0;
    healthNotes = 'Coverage takes effect from date of arrival in Alberta if registered within 3 months.';
  }

  // 3. Photo ID Card (Non-Driver ID)
  const photoIdGuidance = cleanProvince === 'ON'
    ? 'Ontario Photo Card: Available for residents aged 16+ who do NOT hold a driver’s licence. Cannot hold both simultaneously.'
    : cleanProvince === 'BC'
      ? 'BC Services Card (Photo): Combined or standalone provincial identity card.'
      : 'Provincial ID Card available at authorized registry agent with proof of legal status and residency.';

  return {
    applicantName: cleanApplicant,
    assessmentDate: safeAssessmentDate,
    statusInCanada: cleanStatus,
    province: cleanProvince,
    sinEvaluation: {
      eligible: sinEligible,
      sinType,
      primaryDocumentRequired: sinPrimaryDocument,
      guidance: sinGuidance,
      channel: 'Apply at nearest Service Canada Centre for immediate paper SIN letter.'
    },
    healthcareEvaluation: {
      planName: healthPlanName,
      eligible: healthEligible,
      waitingPeriodDays,
      notes: healthNotes,
      privateBridgeInsuranceRecommended: waitingPeriodDays > 0 || !healthEligible
    },
    provincialPhotoId: {
      photoIdGuidance,
      proofOfAddressRequired: residencyDocumentsReady ? 'Ready' : 'Pending lease or utility bill'
    },
    actionChecklist: [
      sinEligible ? `Visit Service Canada with original ${sinPrimaryDocument.split(' ')[0]} to get SIN.` : 'Resolve status condition before SIN application.',
      healthEligible ? `Submit ${healthPlanName} application with proof of legal status, residency lease, and ID.` : `Secure private bridge health insurance coverage.`,
      'Open Canadian bank account with primary ID and SIN letter.',
      'Obtain local mobile SIM card and set up CRA My Account once first tax year begins.'
    ]
  };
}
