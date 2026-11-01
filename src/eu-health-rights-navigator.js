// src/eu-health-rights-navigator.js
// EU Cross-Border Health Rights & Reciprocal Healthcare Accords Navigator
// Statutory Authority: Regulations (EC) No 883/2004 & No 987/2009 (Coordination of Social Security Systems)
// EU-UK Trade and Cooperation Agreement (TCA) Protocol on Social Security Coordination

import { ValidationError } from './api-errors.js';
import { boundedText, safeIsoDate } from './text-input.js';

export const EU_HEALTH_CONSTANTS = Object.freeze({
  REGULATION_883: 'Regulation (EC) No 883/2004 (Coordination of Social Security Systems)',
  REGULATION_987: 'Regulation (EC) No 987/2009 (Implementing Procedure for Social Security Coordination)',
  EU_UK_TCA: 'EU-UK Trade and Cooperation Agreement (TCA), Social Security Protocol'
});

export const USER_CATEGORIES = Object.freeze({
  POSTED_WORKER: 'posted_worker',
  FRONTIER_WORKER: 'frontier_worker',
  PENSIONER: 'pensioner',
  TOURIST_STUDENT: 'tourist_student',
  PLANNED_TREATMENT: 'planned_treatment'
});

/**
 * Diagnostic evaluator for EU Cross-Border Healthcare rights, S1 certificates, EHIC, and UK GHIC.
 *
 * @param {Object} input
 * @param {string} [input.userCategory] - 'posted_worker', 'frontier_worker', 'pensioner', 'tourist_student', 'planned_treatment'
 * @param {string} [input.originCountry] - Home country where insured (e.g. 'UK', 'France', 'Germany', 'Spain', 'Ireland')
 * @param {string} [input.hostCountry] - Destination country (e.g. 'Germany', 'France', 'Spain', 'Ireland', 'UK')
 * @param {boolean} [input.isStatePensioner] - Receives statutory state retirement pension from origin country
 */
export function evaluateEuHealthRights(input = {}) {
  const safeInput = (input && typeof input === 'object') ? input : {};
  const {
    applicantName = 'Applicant',
    userCategory = 'tourist_student',
    originCountry = 'UK',
    hostCountry = 'Spain',
    isStatePensioner = false,
    assessmentDate
  } = safeInput;
  const cleanApplicantName = boundedText(applicantName, 'Applicant', 100);
  const normCategory = boundedText(userCategory, 'tourist_student', 50).trim().toLowerCase();
  const origin = boundedText(originCountry, 'UK', 50).trim().toUpperCase();
  const host = boundedText(hostCountry, 'Spain', 50).trim().toUpperCase();
  const safeDate = safeIsoDate(assessmentDate);

  if (origin === host) {
    throw new ValidationError('Origin and host country cannot be the same for cross-border rights evaluation');
  }

  let applicableDocument = 'EHIC';
  let documentName = 'European Health Insurance Card (EHIC)';
  let issuingBody = '';
  let scopeOfCoverage = '';
  let patientCoPayRule = '';
  let proceduralSteps = [];

  const isUkInvolved = origin === 'UK' || host === 'UK';

  if (normCategory === 'posted_worker' || normCategory === 'frontier_worker' || normCategory === 'pensioner' || isStatePensioner) {
    applicableDocument = 'S1';
    documentName = 'S1 Certificate of Entitlement (Portable Document S1)';
    issuingBody = origin === 'UK'
      ? 'NHS Overseas Healthcare Services (Business Services Authority)'
      : `Competent statutory health insurer in ${originCountry} (e.g. CPAM in France, GKV in Germany, INSS in Spain)`;
    scopeOfCoverage = `Full comprehensive healthcare access in ${hostCountry} on the exact same terms as registered residents/citizens of ${hostCountry}. Costs are reimbursed directly by ${originCountry}.`;
    patientCoPayRule = `Subject to statutory patient co-payments of ${hostCountry} (e.g. Zuzahlung prescription fees in Germany, Ticket Modérateur in France, or prescription charges in Spain).`;
    proceduralSteps = [
      `Step 1: Request Portable Document S1 from ${issuingBody} prior to relocation.`,
      `Step 2: Upon arriving in ${hostCountry}, register the S1 certificate at the local health authority (e.g. Krankenkasse in Germany, CPAM in France, INSS / Centro de Salud in Spain).`,
      `Step 3: Receive local national health card / number for direct public clinic and hospital billing.`
    ];
  } else if (normCategory === 'planned_treatment') {
    applicableDocument = 'S2';
    documentName = 'S2 Certificate for Planned Medical Treatment';
    issuingBody = origin === 'UK'
      ? 'NHS England / Local Health Board Prior Approval Team'
      : `Statutory health fund medical board in ${originCountry}`;
    scopeOfCoverage = 'Pre-authorized scheduled surgery or specialized medical care in a state-funded hospital in the host country.';
    patientCoPayRule = 'Host country co-payments apply unless an S2 co-payment top-up (Article 26) is granted by the home country.';
    proceduralSteps = [
      `Step 1: Obtain clinical evidence from treating physician that treatment is standard and cannot be provided in ${originCountry} within clinically justifiable timeframes (undue delay test).`,
      `Step 2: Submit formal S2 prior authorization application to ${issuingBody}.`,
      `Step 3: Present approved S2 certificate to the treating public hospital in ${hostCountry} before hospital admission.`
    ];
  } else {
    // Temporary visitors, tourists, exchange students
    if (origin === 'UK') {
      applicableDocument = 'GHIC';
      documentName = 'UK Global Health Insurance Card (UK GHIC) / UK EHIC';
      issuingBody = 'NHS Business Services Authority';
    } else {
      applicableDocument = 'EHIC';
      documentName = 'European Health Insurance Card (EHIC)';
      issuingBody = `National statutory health service in ${originCountry}`;
    }
    scopeOfCoverage = `Emergency, urgent, and medically necessary state-provided healthcare during temporary stays in ${hostCountry} until scheduled return home. Includes chronic disease monitoring and oxygen therapy. Excludes elective surgery or traveling abroad specifically for treatment.`;
    patientCoPayRule = `Same co-payments as local residents of ${hostCountry}. Non-refundable private clinic treatments are completely excluded.`;
    proceduralSteps = [
      `Step 1: Carry physical or digital ${documentName} and national passport during all travel.`,
      `Step 2: Present the card directly at state-funded hospitals or clinics contracted with the statutory health service in ${hostCountry}.`,
      `Step 3: In emergency situations where the physical card is unavailable, contact ${issuingBody} for an immediate Provisional Replacement Certificate (PRC).`
    ];
  }

  return {
    applicantName: cleanApplicantName,
    assessmentDate: safeDate,
    statutoryBasis: isUkInvolved ? EU_HEALTH_CONSTANTS.EU_UK_TCA : EU_HEALTH_CONSTANTS.REGULATION_883,
    userCategory: normCategory,
    originCountry: origin,
    hostCountry: host,
    applicableDocument,
    documentName,
    issuingBody,
    scopeOfCoverage,
    patientCoPayRule,
    proceduralSteps,
    isUkInvolved
  };
}
