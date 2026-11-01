// src/document-validator.js
// Pre-Flight Immigration Document Validity & Statutory Compliance Inspector.
// Pure ES module with zero npm dependencies.

import { ValidationError } from './api-errors.js';
import { assertCalendarDate } from './evidence-policy.js';

export const DOCUMENT_TYPE_POLICIES = {
  passport: {
    label: 'Foreign National Passport',
    statute: 'IRPR s. 52(1) (Validity of passport or identity document)',
    maxValidityYears: 10,
    minLandingRunwayMonths: 6,
    strictExpiry: true,
    advice: 'Your passport must be valid for at least 6 months past your landing date. If it expires sooner, CBSA or your commercial airline may deny boarding or truncate your permit length.'
  },
  copr: {
    label: 'Confirmation of Permanent Residence (COPR / IMM 5688)',
    statute: 'IRPR s. 71.1 (Duration of permanent resident visa & COPR)',
    maxValidityYears: 1,
    minLandingRunwayMonths: 0, // Must land on or before expiry
    strictExpiry: true,
    advice: 'COPR validity matches your immigration medical exam (max 12 months) and CANNOT be extended under any circumstances. You must physically land in Canada on or before the printed expiry date.'
  },
  work_permit: {
    label: 'Work Permit / POE Port of Entry Letter of Introduction',
    statute: 'IRPR s. 186 / s. 189 (Work permit validity and authorization)',
    maxValidityYears: 3,
    minLandingRunwayMonths: 1,
    strictExpiry: true,
    advice: 'Ensure your Port of Entry Letter of Introduction is unexpired. Note that CBSA border officers cannot issue a work permit beyond your passport expiry date.'
  },
  study_permit: {
    label: 'Study Permit / Port of Entry Letter of Introduction',
    statute: 'IRPR s. 216 (Study permit issuance and conditions)',
    maxValidityYears: 4,
    minLandingRunwayMonths: 1,
    strictExpiry: true,
    advice: 'Present your unexpired Letter of Introduction, Letter of Acceptance from a Designated Learning Institution (DLI), and proof of tuition payment at the port of entry.'
  },
  medical_exam: {
    label: 'Immigration Medical Examination (eMedical / IME)',
    statute: 'IRPR s. 30 (Medical examination validity - 12-month statutory cap)',
    maxValidityYears: 1,
    minLandingRunwayMonths: 0,
    strictExpiry: true,
    advice: 'Under federal law, immigration medical examinations are valid for exactly 12 months from the date of the exam. If your IME expires prior to landing, you must undergo a re-examination.'
  },
  police_certificate: {
    label: 'Police Clearance Certificate (PCC)',
    statute: 'IRCC Operational Instructions (Criminality and Police Clearance Criteria)',
    maxValidityYears: 1,
    minLandingRunwayMonths: 0,
    strictExpiry: false,
    advice: 'For your country of habitual residence, PCC must be issued within 6-12 months. For other countries, it must have been issued after you permanently moved away.'
  },
  language_test: {
    label: 'Language Proficiency Test (IELTS / CELPIP / PTE / TEF)',
    statute: 'IRPR s. 74 (Language test results 2-year statutory validity)',
    maxValidityYears: 2,
    minLandingRunwayMonths: 0,
    strictExpiry: true,
    advice: 'Official language test scores are valid for exactly 24 months (2 years) from the date test results were issued. Expired test results are rejected by IRCC.'
  },
  eca_report: {
    label: 'Educational Credential Assessment (ECA - WES / ICAS / IQAS / CES / MCC)',
    statute: 'IRPR s. 75(2) (ECA report 5-year statutory validity)',
    maxValidityYears: 5,
    minLandingRunwayMonths: 0,
    strictExpiry: true,
    advice: 'ECA assessment reports remain valid for exactly 5 years from the date of issue. Ensure your report date falls within the 5-year statutory window.'
  },
  proof_of_funds: {
    label: 'Proof of Funds Bank Statement & Official Financial Letter',
    statute: 'IRPR s. 76 (Financial resources for Federal Skilled Worker & Express Entry)',
    maxValidityYears: 0.25, // 90 days recommended, ideally within 30 days
    minLandingRunwayMonths: 0,
    strictExpiry: false,
    advice: 'Must be on official bank letterhead, dated within 30 days of travel/landing, showing 6-month average balance and unencumbered liquid funds in your name.'
  }
};

/**
 * Validates an individual document against statutory criteria relative to a landing date.
 */
export function validateDocument(doc, landingDateStr) {
  if (!doc || typeof doc !== 'object' || Array.isArray(doc) || typeof doc.docType !== 'string' || !doc.docType.trim()) {
    throw new ValidationError('Each document must have a document type');
  }
  for (const field of ['issueDate', 'expiryDate']) {
    if (doc[field] !== undefined && doc[field] !== null) assertCalendarDate(doc[field], field);
  }
  if (landingDateStr !== undefined) assertCalendarDate(landingDateStr, 'Landing date');
  const policy = (Object.hasOwn(DOCUMENT_TYPE_POLICIES, doc.docType) && DOCUMENT_TYPE_POLICIES[doc.docType]) || {
    label: doc.docType || 'Custom Supporting Document',
    statute: 'General Identity & Immigration Documentation',
    maxValidityYears: 5,
    minLandingRunwayMonths: 0,
    strictExpiry: false,
    advice: 'Ensure document is genuine, untampered, and accompanied by a certified English translation if issued in another language.'
  };

  const landing = landingDateStr ? new Date(landingDateStr + 'T00:00:00Z') : new Date();
  const validLanding = isNaN(landing.getTime()) ? new Date() : landing;

  let expiryDate = null;
  let daysUntilExpiry = null;
  let status = 'valid';
  let rejectionRisk = 'none';
  let correctiveAction = null;

  if (doc.expiryDate) {
    expiryDate = new Date(doc.expiryDate + 'T00:00:00Z');
    if (!isNaN(expiryDate.getTime())) {
      daysUntilExpiry = Math.ceil((expiryDate.getTime() - validLanding.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilExpiry < 0) {
        status = 'expired';
        rejectionRisk = 'critical';
        correctiveAction = `CRITICAL: Document expired on ${doc.expiryDate}. You cannot travel with this document. Apply immediately for renewal or re-issuance before boarding.`;
      } else if (doc.docType === 'passport' && daysUntilExpiry < 180) {
        // Passport has less than 6 months validity from landing
        status = 'expiring_soon';
        rejectionRisk = 'high';
        correctiveAction = `HIGH RISK: Passport has only ${daysUntilExpiry} days validity from landing (less than the mandatory 6-month runway under IRPR s.52). Commercial airlines may deny boarding. Renew passport or obtain consular extension.`;
      } else if (daysUntilExpiry <= 30) {
        status = 'expiring_soon';
        rejectionRisk = 'high';
        correctiveAction = `Document expires in ${daysUntilExpiry} days (${doc.expiryDate}). Prioritize immediate extension or plan arrival before expiry.`;
      } else if (daysUntilExpiry <= 90) {
        status = 'expiring_soon';
        rejectionRisk = 'low';
        correctiveAction = `Document expires in ${daysUntilExpiry} days. Set a calendar reminder to initiate renewal.`;
      }
    }
  }

  // Check issue date temporal validity (e.g. ECA max 5 yrs, language test max 2 yrs)
  if (doc.issueDate) {
    const issueDate = new Date(doc.issueDate + 'T00:00:00Z');
    if (!isNaN(issueDate.getTime())) {
      const daysSinceIssue = Math.floor((validLanding.getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (doc.docType === 'language_test' && daysSinceIssue > 730) {
        // > 2 years
        status = 'expired';
        rejectionRisk = 'critical';
        correctiveAction = `CRITICAL: Language test was taken on ${doc.issueDate} (${daysSinceIssue} days ago). Under IRPR s.74, results are statutorily invalid after 2 years. You must retake IELTS/CELPIP/PTE.`;
      } else if (doc.docType === 'eca_report' && daysSinceIssue > (365 * 5 + 1)) {
        // > 5 years
        status = 'expired';
        rejectionRisk = 'critical';
        correctiveAction = `CRITICAL: ECA report was issued on ${doc.issueDate} (${daysSinceIssue} days ago). Under IRPR s.75(2), ECA reports expire after 5 years. Contact WES/ICAS for re-evaluation.`;
      } else if (doc.docType === 'medical_exam' && daysSinceIssue > 365) {
        // > 1 year
        status = 'expired';
        rejectionRisk = 'critical';
        correctiveAction = `CRITICAL: Medical exam was completed on ${doc.issueDate} (${daysSinceIssue} days ago). Under IRPR s.30, medical results expire after 12 months. An upfront re-medical is required.`;
      }
    }
  }

  return {
    docType: doc.docType,
    docLabel: policy.label,
    documentId: doc.documentId || null,
    issueDate: doc.issueDate || null,
    expiryDate: doc.expiryDate || null,
    status,
    rejectionRisk,
    daysUntilExpiry,
    statute: policy.statute,
    complianceNote: policy.advice,
    correctiveAction
  };
}

/**
 * Evaluates an entire collection of immigration documents for border readiness.
 * 
 * @param {object} options
 * @param {Array<object>} options.documents - Array of document records
 * @param {string} [options.landingDateStr] - Planned date of landing (YYYY-MM-DD)
 * @param {string} [options.immigrationStream='pr_express_entry'] - 'pr_express_entry', 'work_permit', 'study_permit', 'visitor'
 * @returns {object} Pre-flight document readiness diagnostic report
 */
export function validateNewcomerDocuments(options = {}) {
  const safeOptions = (options && typeof options === 'object') ? options : {};
  const {
    documents = [],
    landingDateStr,
    immigrationStream = 'pr_express_entry'
  } = safeOptions;
  if (landingDateStr !== undefined) assertCalendarDate(landingDateStr, 'Landing date');
  if (!Array.isArray(documents)) throw new ValidationError('Documents must be an array');
  const landingDate = landingDateStr ? new Date(landingDateStr + 'T00:00:00Z') : new Date();
  const validLanding = isNaN(landingDate.getTime()) ? new Date() : landingDate;
  const validLandingStr = validLanding.toISOString().slice(0, 10);

  const evaluatedDocs = (Array.isArray(documents) ? documents : []).map(d => validateDocument(d, validLandingStr));

  const totalDocuments = evaluatedDocs.length;
  const criticalCount = evaluatedDocs.filter(d => d.rejectionRisk === 'critical').length;
  const highRiskCount = evaluatedDocs.filter(d => d.rejectionRisk === 'high').length;
  const validCount = evaluatedDocs.filter(d => d.status === 'valid').length;

  let overallReadiness = 'verified_ready';
  let summaryHeadline = 'Documents Verified & Ready for Departure';

  if (totalDocuments === 0) {
    overallReadiness = 'action_required';
    summaryHeadline = 'Add documents before checking departure readiness';
  } else if (criticalCount > 0) {
    overallReadiness = 'critical_rejection_risk';
    summaryHeadline = `Critical Risk: ${criticalCount} document(s) invalid or expired under federal law. Boarding refusal likely.`;
  } else if (highRiskCount > 0) {
    overallReadiness = 'action_required';
    summaryHeadline = `Action Required: ${highRiskCount} document(s) expiring soon or have tight passport runway.`;
  }

  // Pre-flight airport checklist items
  const preFlightChecklist = [
    {
      task: 'Carry physical hard copies of all primary documents in cabin baggage (never checked luggage)',
      mandatory: true,
      reason: 'CBSA officers at Port of Entry inspect physical documents before luggage is retrieved.'
    },
    {
      task: 'Ensure electronic ArriveCAN / Advance CBSA Declaration is submitted within 72 hours of landing',
      mandatory: true,
      reason: 'Cuts customs wait times at major airports (YYZ, YVR, YUL) by up to 50%.'
    },
    {
      task: 'Prepare written declaration if carrying $10,000+ CAD in cash or monetary instruments',
      mandatory: true,
      reason: 'Mandatory statutory reporting under PCMLTFA s.12 to avoid CBSA seizure and administrative penalties.'
    },
    {
      task: 'Have certified English translations for any foreign language birth, marriage, or police certificates',
      mandatory: true,
      reason: 'Translations must be certified by an accredited translator (e.g. ATIO / STIBC).'
    }
  ];

  return {
    asOf: new Date().toISOString().slice(0, 10),
    landingDate: validLandingStr,
    immigrationStream,
    overallReadiness,
    summaryHeadline,
    counts: {
      total: totalDocuments,
      valid: validCount,
      criticalRisk: criticalCount,
      highRisk: highRiskCount
    },
    documents: evaluatedDocs,
    preFlightChecklist
  };
}
