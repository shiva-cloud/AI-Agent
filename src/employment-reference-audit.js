/**
 * Employment Reference Letter & Foreign Experience Verification Audit Engine
 * 
 * Statutory & Jurisdictional Authorities:
 * - Immigration and Refugee Protection Act (IRPA), S.C. 2001, c. 27:
 *   - s. 40 (Misrepresentation: 5-year inadmissibility and application ban)
 * - Immigration and Refugee Protection Regulations (IRPR), SOR/2002-227:
 *   - s. 11.2 (Mandatory documentary verification of candidate qualifications at e-APR submission)
 *   - s. 75(2) (Federal Skilled Worker Class: minimum 1 continuous year full-time >= 30h/wk within 10 years)
 *   - s. 87.1 (Canadian Experience Class: minimum 12 months full-time >= 30h/wk in Canada within 3 years)
 * - IRCC Operational Instructions on Permanent Residence Documentation (e-APR):
 *   - Strict 7-Point Reference Letter Mandate (Letterhead, exact dates, job title, hours, salary, duties, supervisor signature)
 *   - Prohibition against verbatim copy-pasting of ESDC NOC main duties
 *   - Independent tax and banking corroboration requirements
 */

import { boundedText } from './text-input.js';
import {ValidationError} from './api-errors.js';
import {assertCalendarDate} from './evidence-policy.js';

export const REFERENCE_AUDIT_CONSTANTS = Object.freeze({
  MIN_FULL_TIME_HOURS_PER_WEEK: 30,
  FSW_EXPERIENCE_WINDOW_YEARS: 10,
  CEC_EXPERIENCE_WINDOW_YEARS: 3,
  TOTAL_MANDATORY_CRITERIA: 7,
  MIN_DUTY_MATCH_PERCENT: 70
});

export const REFERENCE_LETTER_ELEMENTS = Object.freeze([
  { id: 'letterhead', label: 'Official Company Letterhead (Address, Phone, Email, Website)', required: true },
  { id: 'dates', label: 'Exact Start and End Dates (Day/Month/Year or "to present")', required: true },
  { id: 'title', label: 'Specific Job Title and Department', required: true },
  { id: 'hours', label: 'Explicit Weekly Hours Worked (min. 30h/wk for Full-Time)', required: true },
  { id: 'salary', label: 'Annual Salary / Hourly Wage plus Itemized Benefits', required: true },
  { id: 'duties', label: 'Detailed Itemized List of Daily Duties and Core Responsibilities', required: true },
  { id: 'signature', label: 'Supervisor / HR Signature with Full Name, Title, and Direct Contact Info', required: true }
]);

/**
 * Diagnostic audit of an employment reference letter and supporting tax/banking documentation
 * against IRCC Ministerial Instructions, NOC 2021 lead statements, and IRPA s. 40 misrepresentation risks.
 */
export function auditEmploymentReferenceLetter(params = {}) {
  if(params!==null && (typeof params!=='object' || Array.isArray(params)))throw new ValidationError('Reference assessment must be an object');
  const safeParams = params || {};
  for(const key of ['isFullTime','hasLetterhead','hasExactStartEndDates','hasJobTitle','hasAnnualSalaryAndBenefits','hasDetailedDutiesList','dutiesCopiedFromNocWordForWord','dutiesSubstantiallyMatchLeadStatement','hasSupervisorSignature','hasPayStubs','hasTaxDocuments','hasBankStatements','isFamilyOwnedBusiness']) {
    if(safeParams[key]!==undefined && typeof safeParams[key]!=='boolean')throw new ValidationError(key+' must be a boolean');
  }
  if(safeParams.hoursPerWeek!==undefined && (typeof safeParams.hoursPerWeek!=='number'||!Number.isFinite(safeParams.hoursPerWeek)||safeParams.hoursPerWeek<0||safeParams.hoursPerWeek>168))throw new ValidationError('Hours per week must be between 0 and 168');
  const {
    program = 'express_entry_fsw',
    nocCode = '21231',
    nocTitle = 'Software Engineer and Designer',
    isFullTime = false,
    hoursPerWeek = 0,
    hasLetterhead = false,
    hasExactStartEndDates = false,
    hasJobTitle = false,
    hasAnnualSalaryAndBenefits = false,
    hasDetailedDutiesList = false,
    dutiesCopiedFromNocWordForWord = false,
    dutiesSubstantiallyMatchLeadStatement = undefined,
    hasSupervisorSignature = false,
    supervisorContactInfoType = 'corporate_domain_email',
    paymentMethod = 'bank_direct_deposit',
    hasPayStubs = false,
    hasTaxDocuments = false,
    hasBankStatements = false,
    isFamilyOwnedBusiness = false,
    applicantName = 'Applicant',
    employerName = 'Tech Innovations Ltd.',
    roleTitle = 'Senior Software Developer',
    employmentPeriod = 'January 15, 2023 to Present',
    assessmentDate = new Date().toISOString().slice(0,10)
  } = safeParams;
  const prog = boundedText(program, 'express_entry_fsw', 50).toLowerCase();
  const noc = boundedText(nocCode, '21231', 20);
  const title = boundedText(nocTitle, 'Software Engineer and Designer', 80);
  const fullTime = Boolean(isFullTime);
  const hours = Math.max(0, Math.min(168, Number(hoursPerWeek) || 0));
  const letterhead = Boolean(hasLetterhead);
  const exactDates = Boolean(hasExactStartEndDates);
  const jobTitle = Boolean(hasJobTitle);
  const salary = Boolean(hasAnnualSalaryAndBenefits);
  const detailedDuties = Boolean(hasDetailedDutiesList);
  const copiedDuties = Boolean(dutiesCopiedFromNocWordForWord);
  const matchesLead = Boolean(dutiesSubstantiallyMatchLeadStatement);
  const signed = Boolean(hasSupervisorSignature);
  const contactType = boundedText(supervisorContactInfoType, 'corporate_domain_email', 50).toLowerCase();
  const payMethod = boundedText(paymentMethod, 'bank_direct_deposit', 50).toLowerCase();
  const payStubs = Boolean(hasPayStubs);
  const taxDocs = Boolean(hasTaxDocuments);
  const bankStatements = Boolean(hasBankStatements);
  const familyBiz = Boolean(isFamilyOwnedBusiness);

  // Safe text
  const appName = boundedText(applicantName, 'Applicant', 120);
  const empName = boundedText(employerName, 'Tech Innovations Ltd.', 120);
  const rTitle = boundedText(roleTitle, 'Senior Software Developer', 120);
  const period = boundedText(employmentPeriod, 'Dates of Employment', 120);
  assertCalendarDate(assessmentDate,'Assessment date');
  const assessDate = assessmentDate;

  // 1. Audit Mandatory 7 Elements
  const missingElements = [];
  let satisfiedCriteriaCount = 0;

  if (!letterhead) missingElements.push('Official company letterhead with company address, email, phone, and website');
  else satisfiedCriteriaCount++;

  if (!exactDates) missingElements.push('Exact start and end dates (DD/MM/YYYY); vague ranges like "2023-2024" lead to refusal');
  else satisfiedCriteriaCount++;

  if (!jobTitle) missingElements.push('Explicit official job title');
  else satisfiedCriteriaCount++;

  if (hours <= 0) {
    missingElements.push('Stated weekly hours worked is missing; officers cannot verify full-time status');
  } else if (hours < REFERENCE_AUDIT_CONSTANTS.MIN_FULL_TIME_HOURS_PER_WEEK && fullTime) {
    missingElements.push(`Weekly hours stated (${hours}h) is below statutory full-time threshold of 30 hours/week`);
  } else {
    satisfiedCriteriaCount++;
  }

  if (!salary) missingElements.push('Annual salary / hourly rate and itemized compensation/benefits');
  else satisfiedCriteriaCount++;

  if (!detailedDuties) missingElements.push('Detailed itemized list of daily duties and primary responsibilities');
  else satisfiedCriteriaCount++;

  if (!signed) missingElements.push('Direct supervisor or HR manager signature with printed name and title');
  else satisfiedCriteriaCount++;

  // 2. Risk & Procedural Fairness Letter (PFL) Audits
  const auditDeficiencies = [];
  let misrepresentationRisk = false;
  let fatalFlaw = false;

  if (copiedDuties) {
    fatalFlaw = true;
    misrepresentationRisk = true;
    auditDeficiencies.push({
      code: 'VERBATIM_NOC_COPY_PASTE',
      severity: 'CRITICAL',
      title: 'High Refusal / PFL Risk: Word-for-Word NOC Duties Copy-Pasted',
      message: 'IRCC visa officers use automated similarity detection. Copying NOC unit group duties directly from the ESDC website is the #1 trigger for Procedural Fairness Letters (PFLs), application refusal, and 5-year bans under IRPA s. 40 for fraudulent misrepresentation.'
    });
  }

  if (dutiesSubstantiallyMatchLeadStatement === false) {
    fatalFlaw = true;
    auditDeficiencies.push({
      code: 'DUTIES_DO_NOT_MATCH_NOC_LEAD',
      severity: 'HIGH',
      title: 'Substantial Mismatch with NOC Lead Statement',
      message: `Your reference letter duties do not demonstrate that you performed the main actions in NOC ${noc} (${title}). Officers require that at least 70% of core duties align with your declared NOC.`
    });
  }

  if (contactType === 'personal_free_email') {
    auditDeficiencies.push({
      code: 'PERSONAL_SUPERVISOR_EMAIL',
      severity: 'MODERATE',
      title: 'Supervisor Personal Email Used (Gmail / Yahoo / Hotmail)',
      message: 'IRCC officers verify employer credentials. Using a personal email instead of a corporate domain (@company.com) triggers telephone employer verification and potential skepticism.'
    });
  }

  if (payMethod === 'cash_in_hand') {
    auditDeficiencies.push({
      code: 'CASH_WAGE_PAYMENT',
      severity: 'HIGH',
      title: 'Cash Wage Payment — Severe Lack of Corroboration',
      message: 'Cash wages without payroll deductions, bank deposits, or tax returns are viewed with extreme skepticism and frequently rejected under IRPR s. 11.2.'
    });
  }

  if (familyBiz) {
    auditDeficiencies.push({
      code: 'FAMILY_OWNED_BUSINESS',
      severity: 'MODERATE',
      title: 'Family-Owned Business Heightened Scrutiny',
      message: 'Experience in a family business requires third-party objective proof: corporate registration documents, tax notices (T4 / NOA / Form 16), and bank payroll deposits.'
    });
  }

  // 3. Corroborating Evidence Strength
  let corroborationScore = 0;
  if (payStubs) corroborationScore += 35;
  if (taxDocs) corroborationScore += 35;
  if (bankStatements) corroborationScore += 30;

  let corroborationTier = 'Tier 3 (Weak — High Refusal Risk)';
  if (corroborationScore >= 90) corroborationTier = 'Tier 1 (Strong — Objective Multi-Source Corroboration)';
  else if (corroborationScore >= 60) corroborationTier = 'Tier 2 (Moderate — Sufficient but Additional Tax/Bank Proof Recommended)';

  // 4. Overall Compliance Verdict
  let complianceVerdict = 'COMPLIANT_READY_FOR_SUBMISSION';
  if (fatalFlaw || misrepresentationRisk) {
    complianceVerdict = 'FATAL_DEFECT_HIGH_REFUSAL_OR_PFL_RISK';
  } else if (missingElements.length > 0 || corroborationScore < 60) {
    complianceVerdict = 'DEFICIENT_REMEDIAL_ACTION_REQUIRED';
  }

  const overallComplianceScore = Math.max(0, Math.min(100, Math.round(
    (satisfiedCriteriaCount / REFERENCE_AUDIT_CONSTANTS.TOTAL_MANDATORY_CRITERIA) * 50 +
    (corroborationScore * 0.4) -
    (copiedDuties ? 40 : 0) -
    (!matchesLead ? 30 : 0) -
    (payMethod === 'cash_in_hand' ? 25 : 0)
  )));

  // Draft only: never invent duties, benefits, contact details or verified employment.
  const standardCompliantLetterTemplate = `DRAFT — employer must complete and verify every detail before signing.
[COMPANY LETTERHEAD: ${empName}]
[Actual company address, telephone, email and website]
Date: ${assessDate}
Subject: Employment reference for ${appName}

Official job title: ${rTitle}
Employment dates: ${period}
Employment status: [Confirm full-time/part-time and permanent/temporary status]
Weekly hours: ${hours || '[Enter actual weekly hours]'}
Salary, currency and benefits: [Enter actual compensation and benefits]
Payment method: [Enter actual payment method]
Duties: [Describe the applicant's actual duties in the employer's own words]

[Employer confirmation of the accuracy of the completed details]
[Supervisor/HR name, actual title, signature and direct contact details]`;

  return {
    asOf: assessDate,
    assessmentDate: assessDate,
    program: prog,
    targetNoc: {
      nocCode: noc,
      nocTitle: title
    },
    applicantName: appName,
    employerName: empName,
    roleTitle: rTitle,
    hoursPerWeek: hours,
    isFullTime: fullTime,
    mandatoryElementsAudit: {
      totalRequired: REFERENCE_AUDIT_CONSTANTS.TOTAL_MANDATORY_CRITERIA,
      satisfiedCount: satisfiedCriteriaCount,
      missingElements
    },
    corroborationAudit: {
      corroborationTier,
      corroborationScore,
      hasPayStubs: payStubs,
      hasTaxDocuments: taxDocs,
      hasBankStatements: bankStatements,
      paymentMethod: payMethod
    },
    auditDeficiencies,
    complianceVerdict,
    overallComplianceScore,
    standardCompliantLetterTemplate
  };
}
