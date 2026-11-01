// src/british-columbia-speculation-tax-audit-appeal-navigator.js
// British Columbia Speculation and Vacancy Tax (SVT) Notice of Objection & Ministerial Appeal Engine
// Statutory Basis: Speculation and Vacancy Tax Act, SBC 2018, c. 46, Part 9 (ss. 94–105)

import { boundedText, safeIsoDate } from './text-input.js';

export const BC_SVT_APPEAL_RULES = {
  STATUTE: 'Speculation and Vacancy Tax Act, SBC 2018, c. 46',
  OBJECTION_LIMITATION_DAYS: 90, // s. 94(1)
  COURT_APPEAL_LIMITATION_DAYS: 90, // s. 99(1)
  LATE_PENALTY_PERCENTAGE: 10, // s. 86
  ELIGIBLE_OBJECTION_GROUNDS: [
    'principal_residence_exemption', // s. 37
    'arm_length_tenancy_occupied',   // s. 38, 39
    'year_of_purchase_exemption',    // s. 47
    'medical_or_treatment_absence',  // s. 42
    'renovation_or_redevelopment',   // s. 40
    'satellite_family_misclassification', // s. 11/12
    'clerical_or_assessment_error'
  ]
};

/**
 * Audits a British Columbia SVT Assessment and plans a Notice of Objection / Appeal.
 *
 * @param {Object} input
 * @param {string} input.assessmentNoticeDate - Date on the Notice of Assessment (YYYY-MM-DD)
 * @param {number} input.assessedAmountCad - Assessed SVT tax liability
 * @param {string} input.objectionGround - Ground for objection from ELIGIBLE_OBJECTION_GROUNDS
 * @param {boolean} input.hasTenancyAgreementOrProof - Lease agreement, rent bank receipts, utility bills
 * @param {boolean} input.hasTaxFilingsOrT4ShowingResidence - CRA Notice of Assessment showing residential address
 * @param {boolean} input.isStayOfCollectionRequested - Request to pause enforcement during review
 * @param {string} [input.propertyRollNumber] - BC Assessment property roll number
 * @param {string} [input.ownerName] - Property owner name
 * @param {string} [input.currentDate] - Assessment calculation date
 * @returns {Object} Deterministic appeal audit, limitation tracking, and procedural instructions
 */
export function auditBcSvtNoticeOfObjection(input = {}) {
  const safeInput = (input && typeof input === 'object') ? input : {};
  const {
    assessmentNoticeDate = new Date().toISOString().slice(0, 10),
    assessedAmountCad = 24000,
    objectionGround = 'arm_length_tenancy_occupied',
    hasTenancyAgreementOrProof = false,
    hasTaxFilingsOrT4ShowingResidence = false,
    isStayOfCollectionRequested = false,
    propertyRollNumber = 'ROLL-0000-0000',
    ownerName = 'Property Owner',
    currentDate = new Date().toISOString().slice(0, 10)
  } = safeInput;

  const safeNoticeDate = safeIsoDate(assessmentNoticeDate, '2026-10-31');
  const safeCurrentDate = safeIsoDate(currentDate, '2026-10-31');
  const safeOwnerName = boundedText(ownerName, 'Property Owner', 100);
  const safePropertyRollNumber = boundedText(propertyRollNumber, 'ROLL-0000-0000', 50);
  const safeObjectionGround = boundedText(objectionGround, 'arm_length_tenancy_occupied', 60);
  const safeAssessedAmountCad = Math.max(0, Math.min(100000000, Number.isFinite(Number(assessedAmountCad)) ? Number(assessedAmountCad) : 24000));

  // Safe date parsing to avoid NaN from malformed inputs
  const parsedNotice = Date.parse(safeNoticeDate);
  const parsedCurrent = Date.parse(safeCurrentDate);
  const noticeMs = Number.isFinite(parsedNotice) ? parsedNotice : Date.parse('2026-10-31');
  const nowMs = Number.isFinite(parsedCurrent) ? parsedCurrent : Date.parse('2026-10-31');

  const diffDays = Math.max(0, Math.floor((nowMs - noticeMs) / (1000 * 60 * 60 * 24)));
  const daysRemaining = BC_SVT_APPEAL_RULES.OBJECTION_LIMITATION_DAYS - diffDays;
  const isWithin90Days = daysRemaining >= 0;

  const deficiencies = [];
  const requiredEvidence = [];
  const appealStages = [];

  // 1. Strict 90-Day Limitation Period (SVT Act s. 94)
  if (!isWithin90Days) {
    deficiencies.push({
      rule: 'Statutory 90-Day Objection Deadline Expired',
      statutoryRef: 'SVT Act s. 94(1)',
      severity: 'FATAL_BAR',
      message: `Notice of assessment was issued ${diffDays} days ago. The strict 90-day limitation period under s. 94(1) has lapsed. The Minister of Finance has no statutory authority to grant an extension after expiry.`
    });
  } else {
    appealStages.push({
      stage: 'Notice of Objection (Form FIN 444)',
      deadlineDaysRemaining: daysRemaining,
      statutoryRef: 'SVT Act s. 94',
      status: daysRemaining < 15 ? 'URGENT_ACTION_REQUIRED' : 'OPEN_FOR_SUBMISSION',
      instructions: 'Submit formal written Notice of Objection to the Tax Appeals and Litigation Branch, Ministry of Finance.'
    });
  }

  // 2. Validate Grounds
  const isGroundRecognized = BC_SVT_APPEAL_RULES.ELIGIBLE_OBJECTION_GROUNDS.includes(safeObjectionGround);
  if (!isGroundRecognized) {
    deficiencies.push({
      rule: 'Unrecognized Statutory Ground',
      statutoryRef: 'SVT Act Part 9',
      severity: 'HIGH',
      message: `The stated ground "${safeObjectionGround}" is not a recognized statutory exemption under the Act.`
    });
  }

  // 3. Evidence Checklist by Ground
  if (safeObjectionGround === 'arm_length_tenancy_occupied') {
    requiredEvidence.push('Residential Tenancy Agreement specifying arm\'s-length terms and rent paid');
    requiredEvidence.push('Bank statements or cancelled cheques verifying monthly rental deposits for at least 6 months (180 days)');
    requiredEvidence.push('Utility bills (BC Hydro, FortisBC, municipal water) in tenant\'s name confirming active physical occupancy');
    if (!hasTenancyAgreementOrProof) {
      deficiencies.push({
        rule: 'Missing Tenancy Verification',
        statutoryRef: 'SVT Act ss. 38–39',
        severity: 'HIGH',
        message: 'Under s. 38, tenancy exemptions require proof of eligible arm\'s-length tenant and continuous occupancy of at least 6 months.'
      });
    }
  } else if (safeObjectionGround === 'principal_residence_exemption') {
    requiredEvidence.push('CRA T1 Individual Tax Return & Notice of Assessment listing property as address');
    requiredEvidence.push('BC Driver\'s Licence / Services Card showing primary residence address');
    requiredEvidence.push('Vehicle registration (ICBC) and primary voting registry address records');
    if (!hasTaxFilingsOrT4ShowingResidence) {
      deficiencies.push({
        rule: 'Missing Primary Residence Documentation',
        statutoryRef: 'SVT Act s. 37',
        severity: 'HIGH',
        message: 'Section 37 exemption requires documentary proof that the owner physically resided at the property for more days than any other place in the calendar year.'
      });
    }
  } else if (safeObjectionGround === 'year_of_purchase_exemption') {
    requiredEvidence.push('BC Land Title Office registered Form A transfer deed showing completion date');
    requiredEvidence.push('Property Transfer Tax (PTT) return filed with the Land Title Survey Authority (LTSA)');
  } else if (safeObjectionGround === 'satellite_family_misclassification') {
    requiredEvidence.push('Spousal worldwide income declarations and CRA tax returns demonstrating Canadian income exceeds 50% threshold');
    requiredEvidence.push('PR card / Canadian citizenship certificate verification to rebut foreign owner surcharge rate');
  }

  // 4. Stay of Collection Audit (SVT Act s. 95)
  if (!isStayOfCollectionRequested) {
    deficiencies.push({
      rule: 'Collection Enforcement Risk',
      statutoryRef: 'SVT Act s. 95(1)',
      severity: 'WARNING',
      message: 'Filing an objection does NOT stay collection action. The Ministry may proceed with registered liens against the land title or bank garnishment unless a written Stay of Collection is requested and approved.'
    });
  }

  // 5. Subsequent Supreme Court Appeal (SVT Act s. 99)
  appealStages.push({
    stage: 'BC Supreme Court Appeal',
    statutoryRef: 'SVT Act s. 99',
    timeline: 'Within 90 days following the Minister\'s decision on objection',
    instructions: 'If Minister confirms or varies assessment unfavourably, file an appeal petition with the Supreme Court of British Columbia.'
  });

  const estimatedLatePenaltyCad = Math.round(safeAssessedAmountCad * (BC_SVT_APPEAL_RULES.LATE_PENALTY_PERCENTAGE / 100));

  return {
    assessmentNoticeDate: safeNoticeDate,
    currentDate: safeCurrentDate,
    ownerName: safeOwnerName,
    propertyRollNumber: safePropertyRollNumber,
    assessedAmountCad: safeAssessedAmountCad,
    estimatedLatePenaltyCad,
    statutoryAuthority: BC_SVT_APPEAL_RULES.STATUTE,
    isWithin90Days,
    daysElapsed: diffDays,
    daysRemaining: Math.max(0, daysRemaining),
    objectionStatus: !isWithin90Days ? 'BARRED_BY_LIMITATION' :
      daysRemaining < 15 ? 'CRITICAL_URGENCY' : 'TIMELY',
    summary: isWithin90Days
      ? `Notice of Objection is timely (${daysRemaining} days remaining). Taxpayer must establish proof under ${safeObjectionGround} and request an administrative stay of collection.`
      : `Statutory 90-day objection period under SVT Act s. 94 has expired (${diffDays} days elapsed). Administrative review is time-barred.`,
    deficiencies,
    requiredEvidence,
    appealStages,
    jurisdiction: 'British Columbia, Canada'
  };
}
