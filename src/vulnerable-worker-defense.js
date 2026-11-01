// src/vulnerable-worker-defense.js
// Canadian Vulnerable Worker Open Work Permit (VWOWP) & Migrant Worker Anti-Exploitation Diagnostic Engine.
// Audits migrant worker rights under the Immigration and Refugee Protection Regulations (SOR/2002-227, s. 207.1),
// Ontario Employment Protection for Foreign Nationals Act, 2009 (EPFNA s. 7 & s. 8),
// and Criminal Code of Canada s. 184 (one-party audio consent) and s. 279.01 (labour exploitation).
// Pure ES module with zero npm dependencies.

import { boundedText, safeIsoDate } from './text-input.js';

export const VWOWP_REGULATION = 'IRPR s. 207.1 (SOR/2002-227)';
export const VWOWP_FEE_EXEMPTION_CODE = 'A50'; // Exemption from $155 work permit + $100 open work permit fee
export const TARGET_EXPEDITED_PROCESSING_DAYS = 14;

export const ABUSE_GROUNDS = {
  ILLEGAL_RECRUITMENT_FEES: 'illegal_recruitment_fees',
  WAGE_THEFT_KICKBACKS: 'wage_theft_kickbacks',
  DOCUMENT_CONFISCATION: 'document_confiscation',
  DEPORTATION_THREATS: 'deportation_threats',
  EXCESSIVE_COERCION_HOURS: 'excessive_coercion_hours',
  UNSAFE_CONDITIONS: 'unsafe_conditions',
  PHYSICAL_OR_SEXUAL_ABUSE: 'physical_or_sexual_abuse'
};

export function evaluateVulnerableWorkerProtection({
  currentPermitType = 'closed_employer_specific_work_permit', // 'closed_employer_specific_work_permit', 'maintained_status_closed_permit', 'open_work_permit', 'study_permit', 'expired_within_90_days'
  abuseGrounds = [], // array of strings matching ABUSE_GROUNDS
  recruitmentFeesPaidCad = 0,
  unpaidWagesOrKickbacksCad = 0,
  hasEvidenceDocs = false,
  evidenceTypesHeld = [], // 'text_messages_whatsapp', 'audio_recordings', 'pay_stubs_or_contracts', 'witness_statements', 'police_report', 'medical_report'
  workProvince = 'ON',
  workerName = 'Vulnerable Worker',
  assessmentDate = '2026-10-31'
} = {}) {
  const safeWorkerName = boundedText(workerName, 'Vulnerable Worker', 120);
  const safeAssessmentDate = safeIsoDate(assessmentDate, '2026-10-31');
  const normPermit = boundedText(currentPermitType, 'closed_employer_specific_work_permit', 60).toLowerCase();
  const grounds = Array.isArray(abuseGrounds) ? abuseGrounds.map(g => boundedText(g, '', 50).toLowerCase()).filter(Boolean) : [];
  const evidence = Array.isArray(evidenceTypesHeld) ? evidenceTypesHeld.map(e => boundedText(e, '', 50).toLowerCase()).filter(Boolean) : [];
  const safeWorkProvince = boundedText(workProvince, 'ON', 10).toUpperCase();
  const evidenceDocs = Boolean(hasEvidenceDocs);

  const recruitmentFees = Number.isFinite(Number(recruitmentFeesPaidCad)) ? Math.max(0, Math.min(10000000, Number(recruitmentFeesPaidCad))) : 0;
  const unpaidWages = Number.isFinite(Number(unpaidWagesOrKickbacksCad)) ? Math.max(0, Math.min(10000000, Number(unpaidWagesOrKickbacksCad))) : 0;

  const violations = [];
  const immediateRemedies = [];
  const statutoryProtections = [];
  let isVwowpEligible = false;
  let eligibilityVerdict = 'INELIGIBLE_PERMIT_TYPE';
  let summaryHeadline = '';

  // 1. Core Statutory Eligibility Audit under IRPR s. 207.1
  // A foreign national is eligible if they hold a valid employer-specific work permit OR
  // are under maintained status / eligible for restoration of a closed permit, AND are facing abuse.
  const isClosedPermitOrMaintained = [
    'closed_employer_specific_work_permit',
    'maintained_status_closed_permit',
    'expired_within_90_days'
  ].includes(normPermit);

  if (isClosedPermitOrMaintained) {
    if (grounds.length > 0) {
      isVwowpEligible = true;
      eligibilityVerdict = 'STATUTORILY_ELIGIBLE_FOR_VWOWP';
      summaryHeadline = `High-Priority VWOWP Eligibility: Worker qualifies for an immediate, fee-exempt Open Work Permit under IRPR s. 207.1 (${grounds.length} grounds of abuse identified).`;
    } else {
      eligibilityVerdict = 'CLOSED_PERMIT_NO_ABUSE_IDENTIFIED';
      summaryHeadline = 'Closed work permit verified, but no specific statutory abuse grounds selected. VWOWP requires reasonable grounds to believe the worker is experiencing or at risk of abuse.';
    }
  } else {
    isVwowpEligible = false;
    eligibilityVerdict = 'INELIGIBLE_PERMIT_TYPE';
    summaryHeadline = `Ineligible for VWOWP: Currently holding ${normPermit.replace(/_/g, ' ')}. VWOWP is strictly restricted to workers tied to an employer-specific work permit.`;
  }

  // 2. Substantive Abuse Grounds Analysis & Violation Cataloguing
  let totalFinancialLossCad = recruitmentFees + unpaidWages;

  if (grounds.includes(ABUSE_GROUNDS.ILLEGAL_RECRUITMENT_FEES) || recruitmentFees > 0) {
    violations.push({
      ground: 'Illegal Recruitment Fee Charging',
      statute: safeWorkProvince === 'ON' ? 'EPFNA 2009 s. 7(1) & IRPR s. 203(1)(e)' : 'IRPR s. 203(1)(e) & Provincial Employment Standards',
      severity: 'CRITICAL',
      legalFinding: `Employer/recruiter illegally charged or recovered $${recruitmentFees.toLocaleString()} CAD in recruitment fees. Under Ontario EPFNA s. 7 and federal IRPR s. 203(1)(e), charging foreign workers recruitment fees directly or indirectly is strictly illegal and triggers a mandatory $100,000+ administrative penalty against the employer.`
    });
    immediateRemedies.push('Formal Claim with Ministry of Labour (Ontario OLRB) to order full statutory repayment of recruitment fees with interest.');
  }

  if (grounds.includes(ABUSE_GROUNDS.DOCUMENT_CONFISCATION)) {
    violations.push({
      ground: 'Passport / Work Permit Confiscation',
      statute: safeWorkProvince === 'ON' ? 'EPFNA 2009 s. 8 & Criminal Code s. 279.01' : 'Criminal Code s. 279.01',
      severity: 'CRITICAL',
      legalFinding: 'Confiscating or withholding a foreign worker\'s passport, work permit, or personal documents is an explicit offense under Ontario EPFNA s. 8 and constitutes a key indicator of labour trafficking under Criminal Code s. 279.01.'
    });
    immediateRemedies.push('Emergency police escort or call to Canadian Human Trafficking Hotline (1-833-900-1010) to recover passport without employer confrontation.');
  }

  if (grounds.includes(ABUSE_GROUNDS.DEPORTATION_THREATS)) {
    violations.push({
      ground: 'Unlawful Threats of Deportation / Permit Revocation',
      statute: 'IRPA s. 44 & s. 229',
      severity: 'HIGH',
      legalFinding: 'Employers have ZERO legal power to revoke a work permit, cancel legal status, or deport a worker. Only the Minister of Public Safety / CBSA and the Immigration Division (ID) of the IRB have statutory jurisdiction to issue removal orders under IRPA s. 44.'
    });
    statutoryProtections.push('Employer Bluff Defense: An employer cannot cancel your status. Your work permit remains legally valid until the expiry date printed on it, regardless of whether the employer terminates your employment.');
  }

  if (grounds.includes(ABUSE_GROUNDS.WAGE_THEFT_KICKBACKS) || unpaidWages > 0) {
    violations.push({
      ground: 'Wage Theft or Cash Kickback Demands',
      statute: safeWorkProvince === 'ON' ? 'Ontario Employment Standards Act s. 13' : 'Provincial ESA Wage Protections',
      severity: 'HIGH',
      legalFinding: `Employer required $${unpaidWages.toLocaleString()} CAD in cash kickbacks or unpaid wages. Under ESA s. 13, employers cannot make deductions or demand kickbacks from wages, even with signed employee consent.`
    });
    immediateRemedies.push('ESA Wage Recovery Claim with Provincial Ministry of Labour to recoup unpaid wages, overtime, and unlawful deductions.');
  }

  if (grounds.includes(ABUSE_GROUNDS.UNSAFE_CONDITIONS)) {
    violations.push({
      ground: 'Unsafe Working Conditions / Occupational Health Hazards',
      statute: safeWorkProvince === 'ON' ? 'Occupational Health and Safety Act (OHSA) s. 43' : 'Provincial OHS Legislation',
      severity: 'HIGH',
      legalFinding: 'Workers have the statutory right under OHSA s. 43 to refuse unsafe work that endangers their health or physical safety without threat of termination.'
    });
  }

  if (grounds.includes(ABUSE_GROUNDS.PHYSICAL_OR_SEXUAL_ABUSE)) {
    violations.push({
      ground: 'Physical, Sexual, or Psychological Abuse',
      statute: 'Criminal Code of Canada & IRPR s. 207.1(1)',
      severity: 'EMERGENCY',
      legalFinding: 'Physical intimidation, assault, sexual solicitation, or severe psychological coercion creates immediate expedited VWOWP eligibility and criminal liability.'
    });
  }

  // 3. Evidence Strength & Application Readiness Audit
  let evidenceScore = 0;
  if (evidence.includes('text_messages_whatsapp')) evidenceScore += 25;
  if (evidence.includes('audio_recordings')) evidenceScore += 30; // Criminal Code s.184
  if (evidence.includes('pay_stubs_or_contracts')) evidenceScore += 20;
  if (evidence.includes('witness_statements')) evidenceScore += 15;
  if (evidence.includes('police_report') || evidence.includes('medical_report')) evidenceScore += 35;
  if (evidenceDocs && evidenceScore === 0) evidenceScore = 20;

  let evidenceConfidence = 'LOW';
  if (evidenceScore >= 50) evidenceConfidence = 'STRONG';
  else if (evidenceScore >= 25) evidenceConfidence = 'MODERATE';

  // 4. VWOWP Roadmap & Application Instructions
  const vwowpRoadmap = [
    {
      step: 1,
      title: 'Submit Online VWOWP Application (Form IMM 5710)',
      action: 'Apply online through IRCC Secure Account. Select "Open Work Permit for Vulnerable Workers" under IRPR s. 207.1. Use fee exemption code A50 (fee-exempt / no fee required).'
    },
    {
      step: 2,
      title: 'Detailed Letter of Explanation (Affidavit)',
      action: 'Submit a detailed, chronological statement outlining the working conditions, fee demands, threats, or abuse experienced, specifying dates, names, and dollar figures.'
    },
    {
      step: 3,
      title: 'Attach Documentary Evidence',
      action: 'Upload screenshots of WhatsApp/SMS messages, pay stubs, audio recording transcripts (legal under Criminal Code s.184 one-party consent), and bank statements showing cash withdrawals.'
    },
    {
      step: 4,
      title: '14-Day Expedited IRCC Processing',
      action: 'IRCC policy standard aims to process VWOWP applications within 14 business days. Officers conduct an interview or assess documents on a reasonable grounds standard.'
    },
    {
      step: 5,
      title: 'Immediate Open Work Authorization',
      action: 'Once approved, worker receives an unrestricted Open Work Permit (valid for up to 12 months), allowing immediate employment with ANY Canadian employer without an LMIA.'
    }
  ];

  const statutoryAdvisories = [
    'Recording conversations (Criminal Code s. 184): you can generally record a phone call or conversation you take part in with your employer or agent without telling them. IRCC or a tribunal decides how much weight a recording gets, so keep the original file and note the date and time.',
    'Fee Exemption (Code A50): You DO NOT pay the $155 work permit fee or the $100 open work permit holder fee for a VWOWP.',
    'Employer Will NOT Be Notified of VWOWP Application: IRCC strict privacy guidelines mandate that the employer is NEVER notified that an employee has applied for a Vulnerable Worker permit.',
    'Whistleblower Protection: Reporting an abusive employer to IRCC or the Ministry of Labour does NOT jeopardize your immigration status; IRCC policy explicitly protects reporting workers from detention or removal.',
    'Transition to Permanent Residence: Time worked on a VWOWP accumulates valid Canadian work experience under the Canadian Experience Class (CEC) and provincial nominee programs (OINP / BCPNP).'
  ];

  return {
    asOf: safeAssessmentDate,
    assessmentDate: safeAssessmentDate,
    workerName: safeWorkerName,
    currentPermitType: normPermit,
    isVwowpEligible,
    eligibilityVerdict,
    summaryHeadline,
    identifiedAbuseGroundsCount: grounds.length,
    statutoryViolations: violations,
    totalFinancialLossCad,
    recruitmentFeesPaidCad: recruitmentFees,
    unpaidWagesOrKickbacksCad: unpaidWages,
    evidenceAudit: {
      hasEvidenceDocs: evidenceDocs,
      evidenceConfidence,
      evidenceScore,
      evidenceTypesHeld: evidence
    },
    immediateRemedies,
    statutoryProtections,
    vwowpRoadmap,
    statutoryAdvisories,
    statutoryAuthority: VWOWP_REGULATION
  };
}
